from __future__ import annotations

from collections import Counter
from pathlib import Path
import copy
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[2]

QUEUE = ROOT / "spec" / "fa-ir" / "governance" / "review-queue.json"
MASTER = ROOT / "spec" / "fa-ir" / "evidence" / "master-decision-matrix.json"
PROFILE = ROOT / "spec" / "fa-ir" / "profiles" / "fa-ir-g1.json"
SOURCE_REGISTRY = ROOT / "docs" / "standards" / "source-registry.md"

STAGE_FILES = {
    "1.3": ROOT / "spec" / "fa-ir" / "evidence" / "orthographic-variants.json",
    "1.4": ROOT / "spec" / "fa-ir" / "evidence" / "numbers-punctuation.json",
    "1.5": ROOT / "spec" / "fa-ir" / "evidence" / "mixed-latin.json",
    "1.6": ROOT / "spec" / "fa-ir" / "evidence" / "whitespace-layout.json",
    "1.7": ROOT / "spec" / "fa-ir" / "evidence" / "remaining-coverage.json",
}

PACKET_DIR = ROOT / "spec" / "fa-ir" / "review" / "evidence-packets" / "records"
MANIFEST = ROOT / "spec" / "fa-ir" / "review" / "evidence-packets" / "manifest.json"

EXPECTED_PACKETS = 253
EXPECTED_REVIEW = 252
EXPECTED_UNRESOLVED = 1
EXPECTED_REGISTERED_SOURCES = 5
EXPECTED_SUPPLEMENTAL_RECORDS = 18

SOURCE_ID_RE = re.compile(r"^SRC-[A-Z0-9]+(?:-[A-Z0-9]+)*$")


class ValidationFailure(RuntimeError):
    pass


def rel(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT)).replace("\\", "/")
    except ValueError:
        return str(path).replace("\\", "/")


def fail(message: str) -> None:
    raise ValidationFailure(message)


def expect(condition: bool, message: str) -> None:
    if not condition:
        fail(message)


def expect_equal(actual, expected, message: str) -> None:
    if actual != expected:
        fail(f"{message}: expected={expected!r}, actual={actual!r}")


def read_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise ValidationFailure(f"missing file: {rel(path)}") from exc
    except json.JSONDecodeError as exc:
        raise ValidationFailure(
            f"invalid JSON: {rel(path)}:{exc.lineno}:{exc.colno}: {exc.msg}"
        ) from exc


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError as exc:
        raise ValidationFailure(f"missing file: {rel(path)}") from exc


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest().upper()


def recursively_find_id_records(value, found: dict[str, list[dict]]) -> None:
    if isinstance(value, dict):
        record_id = value.get("id")
        if isinstance(record_id, str):
            found.setdefault(record_id, []).append(value)
        for child in value.values():
            recursively_find_id_records(child, found)
    elif isinstance(value, list):
        for child in value:
            recursively_find_id_records(child, found)


def recursively_collect_source_ids(value, found: set[str]) -> None:
    if isinstance(value, str):
        if SOURCE_ID_RE.fullmatch(value):
            found.add(value)
    elif isinstance(value, dict):
        for child in value.values():
            recursively_collect_source_ids(child, found)
    elif isinstance(value, list):
        for child in value:
            recursively_collect_source_ids(child, found)


def parse_source_registry(text: str) -> dict[str, str]:
    sections: dict[str, str] = {}
    matches = list(re.finditer(
        r"(?m)^## (SRC-[A-Z0-9]+(?:-[A-Z0-9]+)*)\s*$",
        text,
    ))

    for index, match in enumerate(matches):
        source_id = match.group(1)
        start = match.start()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        section = text[start:end].rstrip()
        registry_rule = section.find("\n---\n## Registry Rule")
        if registry_rule >= 0:
            section = section[:registry_rule].rstrip()
        sections[source_id] = section

    return sections


def choose_canonical(
    matches: list[dict],
    decision_id: str,
) -> tuple[dict, list[dict]]:
    expect(matches, f"no stage evidence for {decision_id}")

    if len(matches) == 1:
        return matches[0], []

    normative = [row for row in matches if "normativeDecision" in row]
    if len(normative) == 1:
        primary = normative[0]
        return primary, [row for row in matches if row is not primary]

    stable_draft = [
        row for row in matches
        if isinstance(row.get("liblouisStable"), dict)
        and isinstance(row.get("liblouisDraft"), dict)
    ]
    if len(stable_draft) == 1:
        primary = stable_draft[0]
        return primary, [row for row in matches if row is not primary]

    fail(
        f"ambiguous canonical stage evidence for {decision_id}: "
        f"records={len(matches)}, normative={len(normative)}, "
        f"stableDraft={len(stable_draft)}"
    )


def stable_draft_snapshot(stage_record: dict, master_record: dict) -> dict:
    stable = (
        stage_record.get("liblouisStable")
        if isinstance(stage_record.get("liblouisStable"), dict)
        else master_record.get("stable")
    )
    draft = (
        stage_record.get("liblouisDraft")
        if isinstance(stage_record.get("liblouisDraft"), dict)
        else master_record.get("draft")
    )

    result = {
        "stable": copy.deepcopy(stable) if isinstance(stable, dict) else None,
        "draft": copy.deepcopy(draft) if isinstance(draft, dict) else None,
        "relationship": "insufficient-data",
    }

    if not isinstance(stable, dict) or not isinstance(draft, dict):
        return result

    comparable_keys = [
        key for key in ("status", "kind", "dots", "value", "behavior")
        if key in stable or key in draft
    ]
    if not comparable_keys:
        return result

    stable_projection = {key: stable.get(key) for key in comparable_keys}
    draft_projection = {key: draft.get(key) for key in comparable_keys}

    result["relationship"] = (
        "same-observed-behavior"
        if stable_projection == draft_projection
        else "different-observed-behavior"
    )
    result["comparedFields"] = comparable_keys
    return result


def evidence_channels(stage_record: dict, master_record: dict, source_ids: set[str]) -> dict:
    presence = {
        "stableLiblouis": (
            isinstance(stage_record.get("liblouisStable"), dict)
            or isinstance(master_record.get("stable"), dict)
            or "SRC-LIBLOUIS-G1" in source_ids
        ),
        "draftLiblouis": (
            isinstance(stage_record.get("liblouisDraft"), dict)
            or isinstance(master_record.get("draft"), dict)
            or "SRC-LIBLOUIS-2054" in source_ids
        ),
        "iranianManual": (
            "SRC-IR-1393" in source_ids
            or "iran1393" in stage_record
            or "manualEvidence" in stage_record
            or "manualStatus" in stage_record
        ),
        "legacyV1": (
            "SRC-LEGACY-V1" in source_ids
            or "legacy" in stage_record
        ),
        "unicodeBraille": "SRC-UNICODE-BRAILLE" in source_ids,
        "researchAudit2053": "SRC-LIBLOUIS-2053" in source_ids,
    }
    return {
        "observed": [key for key, value in presence.items() if value],
        "notObserved": [key for key, value in presence.items() if not value],
        "presence": presence,
    }


def expected_packet_path(decision_id: str) -> Path:
    return PACKET_DIR / (decision_id.lower() + ".json")


def main() -> int:
    try:
        queue_doc = read_json(QUEUE)
        master = read_json(MASTER)
        profile = read_json(PROFILE)
        registry_text = read_text(SOURCE_REGISTRY)
        manifest = read_json(MANIFEST)

        expect_equal(profile.get("status"), "draft", "profile status")
        expect_equal(manifest.get("schemaVersion"), 1, "manifest schema version")
        expect_equal(manifest.get("stage"), "2.12", "manifest stage")
        expect_equal(manifest.get("status"), "evidence-only", "manifest status")

        queue = queue_doc.get("queue")
        expect(isinstance(queue, list), "review queue must be an array")
        expect_equal(len(queue), EXPECTED_PACKETS, "review queue size")
        queue_by_id = {row["queueId"]: row for row in queue}
        expect_equal(len(queue_by_id), EXPECTED_PACKETS, "unique queue IDs")

        master_items = master.get("items")
        expect(isinstance(master_items, list), "master items must be an array")
        master_by_id = {row["id"]: row for row in master_items}

        registry_sections = parse_source_registry(registry_text)

        stage_indices = {}
        stage_docs = {}
        for stage, path in STAGE_FILES.items():
            doc = read_json(path)
            stage_docs[stage] = doc
            index: dict[str, list[dict]] = {}
            recursively_find_id_records(doc, index)
            stage_indices[stage] = index

        expected_inputs = [
            {"path": rel(QUEUE), "sha256": sha256(QUEUE)},
            {"path": rel(MASTER), "sha256": sha256(MASTER)},
            {"path": rel(SOURCE_REGISTRY), "sha256": sha256(SOURCE_REGISTRY)},
        ]
        expected_inputs.extend(
            {"path": rel(STAGE_FILES[stage]), "sha256": sha256(STAGE_FILES[stage])}
            for stage in sorted(STAGE_FILES)
        )
        expect_equal(manifest.get("inputs"), expected_inputs, "manifest inputs")

        summary = manifest.get("summary", {})
        expect_equal(summary.get("packetCount"), EXPECTED_PACKETS, "packet count")
        expect_equal(summary.get("reviewRequired"), EXPECTED_REVIEW, "review count")
        expect_equal(summary.get("unresolved"), EXPECTED_UNRESOLVED, "unresolved count")
        expect_equal(summary.get("promotionEligible"), 0, "promotion eligible summary")
        expect_equal(summary.get("maintainerDecisionsRecorded"), 0, "maintainer decisions")
        expect_equal(summary.get("projectNormativeDecisionsMade"), 0, "normative decisions")
        expect_equal(
            summary.get("registeredSourcesObserved"),
            EXPECTED_REGISTERED_SOURCES,
            "registered sources observed",
        )
        expect_equal(
            summary.get("supplementalStageEvidenceRecords"),
            EXPECTED_SUPPLEMENTAL_RECORDS,
            "supplemental stage evidence records",
        )

        manifest_entries = manifest.get("packets")
        expect(isinstance(manifest_entries, list), "manifest packets must be an array")
        expect_equal(len(manifest_entries), EXPECTED_PACKETS, "manifest packet entries")

        manifest_by_decision = {}
        for entry in manifest_entries:
            decision_id = entry.get("decisionItemId")
            expect(decision_id not in manifest_by_decision, f"duplicate manifest decision {decision_id}")
            manifest_by_decision[decision_id] = entry

        queue_decisions = {row["decisionItemId"] for row in queue}
        expect_equal(
            set(manifest_by_decision),
            queue_decisions,
            "manifest decision coverage",
        )

        files = sorted(PACKET_DIR.glob("*.json"))
        expect_equal(len(files), EXPECTED_PACKETS, "packet files on disk")
        expect_equal(
            {path.name for path in files},
            {decision_id.lower() + ".json" for decision_id in queue_decisions},
            "packet filename set",
        )

        class_counts = Counter()
        relationship_counts = Counter()
        source_ids_seen: set[str] = set()
        supplemental_total = 0

        for queue_row in queue:
            decision_id = queue_row["decisionItemId"]
            path = expected_packet_path(decision_id)
            packet = read_json(path)
            entry = manifest_by_decision[decision_id]

            expect_equal(entry.get("path"), rel(path), f"manifest path {decision_id}")
            expect_equal(entry.get("sha256"), sha256(path), f"manifest hash {decision_id}")

            expect_equal(packet.get("schemaVersion"), 1, f"schemaVersion {decision_id}")
            expect_equal(packet.get("stage"), "2.12", f"stage {decision_id}")
            expect_equal(packet.get("status"), "evidence-collected", f"status {decision_id}")
            expect_equal(packet.get("queueId"), queue_row["queueId"], f"queueId {decision_id}")
            expect_equal(
                packet.get("packetId"),
                queue_row["queueId"].replace("FA-REVIEW-", "FA-EVIDENCE-"),
                f"packetId {decision_id}",
            )
            expect_equal(packet.get("decisionItemId"), decision_id, f"decision ID {decision_id}")
            expect_equal(
                packet.get("classification"),
                queue_row["classification"],
                f"classification {decision_id}",
            )
            expect_equal(packet.get("phase1Stage"), queue_row["phase1Stage"], f"stage link {decision_id}")
            expect_equal(packet.get("category"), queue_row["category"], f"category {decision_id}")
            expect_equal(packet.get("priority"), queue_row["priority"], f"priority {decision_id}")

            master_record = master_by_id.get(decision_id)
            expect(master_record is not None, f"missing master decision {decision_id}")
            expect_equal(packet.get("masterDecision"), master_record, f"master decision copy {decision_id}")

            stage = queue_row["phase1Stage"]
            matches = stage_indices[stage].get(decision_id, [])
            canonical, supplemental = choose_canonical(matches, decision_id)

            expect_equal(
                packet.get("stageEvidenceRecord"),
                canonical,
                f"canonical stage evidence {decision_id}",
            )
            expect_equal(
                packet.get("supplementalStageEvidenceRecords"),
                supplemental,
                f"supplemental stage evidence {decision_id}",
            )
            supplemental_total += len(supplemental)

            expected_sources: set[str] = set()
            recursively_collect_source_ids(master_record, expected_sources)
            recursively_collect_source_ids(canonical, expected_sources)
            recursively_collect_source_ids(supplemental, expected_sources)

            unknown = expected_sources - set(registry_sections)
            expect_equal(sorted(unknown), [], f"unregistered sources {decision_id}")

            expect_equal(
                packet.get("sourceIds"),
                sorted(expected_sources),
                f"source IDs {decision_id}",
            )
            source_ids_seen.update(expected_sources)

            expected_registry_records = [
                {
                    "sourceId": source_id,
                    "registrySection": registry_sections[source_id],
                }
                for source_id in sorted(expected_sources)
            ]
            expect_equal(
                packet.get("sourceRegistryRecords"),
                expected_registry_records,
                f"source registry records {decision_id}",
            )

            expect_equal(
                packet.get("sourcePins"),
                stage_docs[stage].get("sourcePins"),
                f"source pins {decision_id}",
            )

            provenance = packet.get("provenance", {})
            expect_equal(
                provenance.get("reviewQueue"),
                {"path": rel(QUEUE), "sha256": sha256(QUEUE)},
                f"queue provenance {decision_id}",
            )
            expect_equal(
                provenance.get("masterDecisionMatrix"),
                {"path": rel(MASTER), "sha256": sha256(MASTER)},
                f"master provenance {decision_id}",
            )
            expect_equal(
                provenance.get("stageEvidence"),
                {"path": rel(STAGE_FILES[stage]), "sha256": sha256(STAGE_FILES[stage])},
                f"stage provenance {decision_id}",
            )
            expect_equal(
                provenance.get("sourceRegistry"),
                {"path": rel(SOURCE_REGISTRY), "sha256": sha256(SOURCE_REGISTRY)},
                f"registry provenance {decision_id}",
            )

            expect_equal(
                packet.get("stableDraftComparison"),
                stable_draft_snapshot(canonical, master_record),
                f"stable/draft comparison {decision_id}",
            )
            expect_equal(
                packet.get("evidenceChannels"),
                evidence_channels(canonical, master_record, expected_sources),
                f"evidence channels {decision_id}",
            )

            review = packet.get("review", {})
            expect(isinstance(review.get("question"), str) and review["question"].strip(), f"review question {decision_id}")
            expect_equal(review.get("recommendedDisposition"), None, f"recommended disposition {decision_id}")
            expect_equal(review.get("maintainerDecision"), None, f"maintainer decision {decision_id}")
            expect_equal(review.get("decisionRationale"), None, f"decision rationale {decision_id}")
            expect_equal(review.get("promotionEligible"), False, f"promotion eligibility {decision_id}")

            expect_equal(
                packet.get("scope"),
                {
                    "evidenceOnly": True,
                    "projectNormativeDecisionMade": False,
                    "officialIranianStandardClaim": False,
                    "profileStatusChange": False,
                },
                f"scope {decision_id}",
            )

            expect_equal(entry.get("packetId"), packet["packetId"], f"manifest packet ID {decision_id}")
            expect_equal(entry.get("queueId"), packet["queueId"], f"manifest queue ID {decision_id}")
            expect_equal(entry.get("classification"), packet["classification"], f"manifest class {decision_id}")
            expect_equal(entry.get("phase1Stage"), packet["phase1Stage"], f"manifest stage {decision_id}")
            expect_equal(entry.get("category"), packet["category"], f"manifest category {decision_id}")
            expect_equal(entry.get("sourceIds"), packet["sourceIds"], f"manifest sources {decision_id}")

            class_counts[packet["classification"]] += 1
            relationship_counts[packet["stableDraftComparison"]["relationship"]] += 1

        expect_equal(class_counts["REVIEW-REQUIRED"], EXPECTED_REVIEW, "validated review packets")
        expect_equal(class_counts["UNRESOLVED"], EXPECTED_UNRESOLVED, "validated unresolved packets")
        expect_equal(len(source_ids_seen), EXPECTED_REGISTERED_SOURCES, "observed source count")
        expect_equal(supplemental_total, EXPECTED_SUPPLEMENTAL_RECORDS, "supplemental record total")

        rem = read_json(expected_packet_path("FA-REM-001"))
        expect_equal(
            len(rem["supplementalStageEvidenceRecords"]),
            1,
            "FA-REM-001 supplemental record count",
        )
        expect_equal(
            rem["supplementalStageEvidenceRecords"][0].get("decision"),
            "pending-source-review",
            "FA-REM-001 supplemental review marker",
        )

        expect_equal(
            sum(
                read_json(path)["review"]["promotionEligible"]
                for path in files
            ),
            0,
            "promotion-eligible packet count",
        )

        print("Phase 2.12 evidence packet validation: PASS")
        print(f"packetFiles                     : {len(files)}")
        print(f"reviewRequired                  : {class_counts['REVIEW-REQUIRED']}")
        print(f"unresolved                      : {class_counts['UNRESOLVED']}")
        print(f"registeredSourcesObserved       : {len(source_ids_seen)}")
        print(f"supplementalStageEvidence       : {supplemental_total}")
        print(f"sameObservedBehavior            : {relationship_counts['same-observed-behavior']}")
        print(f"differentObservedBehavior       : {relationship_counts['different-observed-behavior']}")
        print(f"insufficientData                : {relationship_counts['insufficient-data']}")
        print("promotionEligible                : 0")
        print("maintainerDecisions              : 0")
        print(f"profileStatus                    : {profile['status']}")
        print("semanticErrors                   : 0")
        return 0

    except ValidationFailure as exc:
        print("Phase 2.12 evidence packet validation: FAIL")
        print("semanticErrors                   : 1")
        print(f"ERROR: {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
