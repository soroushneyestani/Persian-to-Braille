from __future__ import annotations

from collections import Counter
from pathlib import Path
import copy
import hashlib
import json
import re
import shutil

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
DOC = ROOT / "docs" / "specification" / "phase-2.12-evidence-packets.md"

EXPECTED_QUEUE = 253
EXPECTED_REVIEW = 252
EXPECTED_UNRESOLVED = 1
EXPECTED_CONSENSUS_EXCLUDED = 37

SOURCE_ID_RE = re.compile(r"^SRC-[A-Z0-9]+(?:-[A-Z0-9]+)*$")


class PacketError(RuntimeError):
    pass


def rel(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT)).replace("\\", "/")
    except ValueError:
        return str(path).replace("\\", "/")


def fail(message: str) -> None:
    raise PacketError(message)


def assert_equal(actual, expected, message: str) -> None:
    if actual != expected:
        fail(f"{message}: expected={expected!r}, actual={actual!r}")


def assert_true(condition: bool, message: str) -> None:
    if not condition:
        fail(message)


def read_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise PacketError(f"Missing required file: {rel(path)}") from exc
    except json.JSONDecodeError as exc:
        raise PacketError(
            f"Invalid JSON: {rel(path)}:{exc.lineno}:{exc.colno}: {exc.msg}"
        ) from exc


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError as exc:
        raise PacketError(f"Missing required file: {rel(path)}") from exc


def write_json(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        handle.write(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        handle.write(text.rstrip() + "\n")


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest().upper()


def json_sha256(value) -> str:
    payload = (json.dumps(
        value,
        ensure_ascii=False,
        indent=2,
        sort_keys=True,
    ) + "\n").encode("utf-8")
    return hashlib.sha256(payload).hexdigest().upper()


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


def select_stage_records(
    matches: list[dict],
    decision_id: str,
) -> tuple[dict, list[dict]]:
    """
    Select the canonical Phase 1 evidence record for a decision while
    preserving duplicate-ID auxiliary records as supplemental evidence.

    Some Phase 1 artifacts intentionally repeat a decision ID in secondary
    review queues. Example: remaining-coverage.json contains FA-REM-001 both
    in remainingScalars (the canonical evidence record) and dot78ReviewQueue
    (a compact supplemental review marker).

    We must not treat that intentional repetition as ambiguous evidence, but
    we also must not silently discard the supplemental record.
    """
    if not matches:
        fail(f"Stage evidence record count for {decision_id}: expected>=1, actual=0")

    if len(matches) == 1:
        return matches[0], []

    # Canonical decision records in the Phase 1 artifacts carry the
    # normativeDecision field. Compact auxiliary queues use other fields such
    # as decision=pending-source-review and intentionally omit it.
    canonical = [
        record
        for record in matches
        if "normativeDecision" in record
    ]

    if len(canonical) == 1:
        primary = canonical[0]
        supplemental = [
            record for record in matches if record is not primary
        ]
        return primary, supplemental

    # Secondary deterministic discriminator for stage artifacts whose
    # canonical records contain the stable/draft implementation pair.
    implementation_records = [
        record
        for record in matches
        if isinstance(record.get("liblouisStable"), dict)
        and isinstance(record.get("liblouisDraft"), dict)
    ]

    if len(implementation_records) == 1:
        primary = implementation_records[0]
        supplemental = [
            record for record in matches if record is not primary
        ]
        return primary, supplemental

    fail(
        f"Ambiguous stage evidence for {decision_id}: "
        f"{len(matches)} records, {len(canonical)} canonical candidates, "
        f"{len(implementation_records)} stable/draft candidates"
    )


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

        # The trailing project-wide registry rule is not part of the preceding
        # source record.
        registry_rule = section.find("\n---\n## Registry Rule")
        if registry_rule >= 0:
            section = section[:registry_rule].rstrip()

        sections[source_id] = section

    return sections


def stable_draft_snapshot(stage_record: dict, master_record: dict) -> dict:
    # Phase 1.6 whitespace evidence uses a shared spaces.uti mapping plus
    # Persian-local stable/draft overrides rather than liblouisStable /
    # liblouisDraft objects. Model that representation explicitly so the
    # comparison reflects evidence instead of parser blindness.
    spaces_utility = stage_record.get("spacesUtility")
    persian_stable = stage_record.get("persianStable")
    persian_draft = stage_record.get("persianDraft")

    if (
        isinstance(spaces_utility, dict)
        and isinstance(persian_stable, dict)
        and isinstance(persian_draft, dict)
    ):
        shared_behavior = {
            "mapping": copy.deepcopy(spaces_utility.get("mapping")),
            "specialRules": copy.deepcopy(spaces_utility.get("specialRules", [])),
        }
        stable = {
            "spacesUtility": copy.deepcopy(shared_behavior),
            "persianLocalOverride": copy.deepcopy(
                persian_stable.get("localOverride")
            ),
        }
        draft = {
            "spacesUtility": copy.deepcopy(shared_behavior),
            "persianLocalOverride": copy.deepcopy(
                persian_draft.get("localOverride")
            ),
        }
        return {
            "stable": stable,
            "draft": draft,
            "relationship": (
                "same-observed-behavior"
                if stable == draft
                else "different-observed-behavior"
            ),
            "comparedFields": [
                "spacesUtility",
                "persianLocalOverride",
            ],
        }

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
    registry = {
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
        "observed": [key for key, present in registry.items() if present],
        "notObserved": [key for key, present in registry.items() if not present],
        "presence": registry,
    }


def review_question(queue_row: dict, master_record: dict) -> str:
    subject = master_record.get("subject")
    if subject is None:
        subject = master_record.get("char")
    if subject is None:
        subject = master_record.get("text")
    if subject is None:
        subject = queue_row["decisionItemId"]

    return (
        f"Determine the project-normative disposition for "
        f"{queue_row['decisionItemId']} ({subject!r}) using the preserved "
        "Phase 1 evidence, explicitly resolving implementation differences "
        "and evidence gaps without asserting current official Iranian "
        "national-standard status."
    )


def packet_filename(decision_id: str) -> str:
    return decision_id.lower() + ".json"


def main() -> int:
    try:
        queue_doc = read_json(QUEUE)
        master = read_json(MASTER)
        profile = read_json(PROFILE)
        registry_text = read_text(SOURCE_REGISTRY)
        registry_sections = parse_source_registry(registry_text)

        assert_equal(profile.get("status"), "draft", "fa-ir-g1 profile status")
        assert_equal(queue_doc.get("stage"), "2.11", "Review queue stage")
        assert_equal(queue_doc.get("status"), "planning-only", "Review queue status")

        queue = queue_doc.get("queue")
        assert_true(isinstance(queue, list), "Review queue must be an array")
        assert_equal(len(queue), EXPECTED_QUEUE, "Review queue item count")

        queue_counts = Counter(row.get("classification") for row in queue)
        assert_equal(
            queue_counts.get("REVIEW-REQUIRED", 0),
            EXPECTED_REVIEW,
            "REVIEW-REQUIRED queue count",
        )
        assert_equal(
            queue_counts.get("UNRESOLVED", 0),
            EXPECTED_UNRESOLVED,
            "UNRESOLVED queue count",
        )
        assert_equal(
            queue_doc["scope"]["consensusBaselineExcluded"],
            EXPECTED_CONSENSUS_EXCLUDED,
            "Consensus baseline exclusion",
        )

        master_items = master.get("items")
        assert_true(isinstance(master_items, list), "Master matrix must contain items")
        master_by_id = {row["id"]: row for row in master_items}

        stage_documents = {}
        stage_indices = {}
        stage_source_pins = {}

        for stage, path in STAGE_FILES.items():
            document = read_json(path)
            assert_equal(document.get("auditStage"), stage, f"Audit stage in {rel(path)}")

            index: dict[str, list[dict]] = {}
            recursively_find_id_records(document, index)

            stage_documents[stage] = document
            stage_indices[stage] = index
            stage_source_pins[stage] = copy.deepcopy(document.get("sourcePins"))

        expected_decision_ids = {row["decisionItemId"] for row in queue}
        assert_equal(
            len(expected_decision_ids),
            EXPECTED_QUEUE,
            "Unique queue decision IDs",
        )

        # Ensure every queue decision has exactly one stage-evidence record in
        # the stage artifact assigned by Phase 2.11.
        for row in queue:
            decision_id = row["decisionItemId"]
            stage = row["phase1Stage"]

            assert_true(stage in STAGE_FILES, f"Unsupported queue stage {stage}")
            matches = stage_indices[stage].get(decision_id, [])
            select_stage_records(matches, decision_id)
            assert_true(
                decision_id in master_by_id,
                f"Queue decision missing from master matrix: {decision_id}",
            )

        # Clean only generated packet records. Do not remove the directory tree.
        PACKET_DIR.mkdir(parents=True, exist_ok=True)
        for path in PACKET_DIR.glob("*.json"):
            path.unlink()

        packets = []
        manifest_entries = []
        all_source_ids: set[str] = set()

        for row in queue:
            decision_id = row["decisionItemId"]
            stage = row["phase1Stage"]
            master_record = master_by_id[decision_id]
            stage_record, supplemental_stage_records = select_stage_records(
                stage_indices[stage].get(decision_id, []),
                decision_id,
            )

            assert_equal(
                master_record.get("classification"),
                row.get("classification"),
                f"Master/queue classification for {decision_id}",
            )
            assert_equal(
                master_record.get("stage"),
                stage,
                f"Master/queue stage for {decision_id}",
            )

            source_ids: set[str] = set()
            recursively_collect_source_ids(master_record, source_ids)
            recursively_collect_source_ids(stage_record, source_ids)
            recursively_collect_source_ids(
                supplemental_stage_records,
                source_ids,
            )

            unknown_sources = sorted(source_ids - set(registry_sections))
            assert_equal(
                unknown_sources,
                [],
                f"Unregistered source IDs for {decision_id}",
            )

            all_source_ids.update(source_ids)

            source_records = [
                {
                    "sourceId": source_id,
                    "registrySection": registry_sections[source_id],
                }
                for source_id in sorted(source_ids)
            ]

            packet = {
                "schemaVersion": 1,
                "stage": "2.12",
                "packetId": row["queueId"].replace("FA-REVIEW-", "FA-EVIDENCE-"),
                "queueId": row["queueId"],
                "decisionItemId": decision_id,
                "classification": row["classification"],
                "phase1Stage": stage,
                "category": row["category"],
                "priority": row["priority"],
                "status": "evidence-collected",
                "subject": {
                    "domain": master_record.get("domain"),
                    "subject": master_record.get("subject"),
                    "codePoints": copy.deepcopy(master_record.get("codePoints")),
                },
                "provenance": {
                    "reviewQueue": {
                        "path": rel(QUEUE),
                        "sha256": sha256(QUEUE),
                    },
                    "masterDecisionMatrix": {
                        "path": rel(MASTER),
                        "sha256": sha256(MASTER),
                    },
                    "stageEvidence": {
                        "path": rel(STAGE_FILES[stage]),
                        "sha256": sha256(STAGE_FILES[stage]),
                    },
                    "sourceRegistry": {
                        "path": rel(SOURCE_REGISTRY),
                        "sha256": sha256(SOURCE_REGISTRY),
                    },
                },
                "sourcePins": copy.deepcopy(stage_source_pins[stage]),
                "sourceIds": sorted(source_ids),
                "sourceRegistryRecords": source_records,
                "masterDecision": copy.deepcopy(master_record),
                "stageEvidenceRecord": copy.deepcopy(stage_record),
                "supplementalStageEvidenceRecords": copy.deepcopy(
                    supplemental_stage_records
                ),
                "stableDraftComparison": stable_draft_snapshot(
                    stage_record,
                    master_record,
                ),
                "evidenceChannels": evidence_channels(
                    stage_record,
                    master_record,
                    source_ids,
                ),
                "review": {
                    "question": review_question(row, master_record),
                    "recommendedDisposition": None,
                    "maintainerDecision": None,
                    "decisionRationale": None,
                    "promotionEligible": False,
                },
                "scope": {
                    "evidenceOnly": True,
                    "projectNormativeDecisionMade": False,
                    "officialIranianStandardClaim": False,
                    "profileStatusChange": False,
                },
            }

            output_path = PACKET_DIR / packet_filename(decision_id)
            write_json(output_path, packet)

            packets.append(packet)
            manifest_entries.append(
                {
                    "packetId": packet["packetId"],
                    "queueId": packet["queueId"],
                    "decisionItemId": decision_id,
                    "classification": packet["classification"],
                    "phase1Stage": stage,
                    "category": packet["category"],
                    "path": rel(output_path),
                    "sha256": sha256(output_path),
                    "sourceIds": packet["sourceIds"],
                }
            )

        assert_equal(len(packets), EXPECTED_QUEUE, "Generated packet count")
        assert_equal(
            len(list(PACKET_DIR.glob("*.json"))),
            EXPECTED_QUEUE,
            "Packet files on disk",
        )

        packet_counts = Counter(packet["classification"] for packet in packets)
        assert_equal(
            packet_counts.get("REVIEW-REQUIRED", 0),
            EXPECTED_REVIEW,
            "Generated REVIEW-REQUIRED packets",
        )
        assert_equal(
            packet_counts.get("UNRESOLVED", 0),
            EXPECTED_UNRESOLVED,
            "Generated UNRESOLVED packets",
        )

        assert_equal(
            sum(packet["review"]["promotionEligible"] for packet in packets),
            0,
            "Premature promotion eligibility",
        )

        supplemental_record_count = sum(
            len(packet["supplementalStageEvidenceRecords"])
            for packet in packets
        )

        source_inputs = [
            {
                "path": rel(QUEUE),
                "sha256": sha256(QUEUE),
            },
            {
                "path": rel(MASTER),
                "sha256": sha256(MASTER),
            },
            {
                "path": rel(SOURCE_REGISTRY),
                "sha256": sha256(SOURCE_REGISTRY),
            },
        ]
        source_inputs.extend(
            {
                "path": rel(STAGE_FILES[stage]),
                "sha256": sha256(STAGE_FILES[stage]),
            }
            for stage in sorted(STAGE_FILES)
        )

        manifest = {
            "schemaVersion": 1,
            "stage": "2.12",
            "status": "evidence-only",
            "profile": {
                "id": profile["id"],
                "version": profile["version"],
                "status": profile["status"],
            },
            "summary": {
                "packetCount": len(packets),
                "reviewRequired": packet_counts["REVIEW-REQUIRED"],
                "unresolved": packet_counts["UNRESOLVED"],
                "promotionEligible": 0,
                "maintainerDecisionsRecorded": 0,
                "projectNormativeDecisionsMade": 0,
                "registeredSourcesObserved": len(all_source_ids),
                "supplementalStageEvidenceRecords": supplemental_record_count,
            },
            "inputs": source_inputs,
            "packets": manifest_entries,
        }

        write_json(MANIFEST, manifest)

        category_counts = Counter(packet["category"] for packet in packets)
        channel_counts = Counter()
        relationship_counts = Counter()

        for packet in packets:
            for channel in packet["evidenceChannels"]["observed"]:
                channel_counts[channel] += 1
            relationship_counts[
                packet["stableDraftComparison"]["relationship"]
            ] += 1

        lines = [
            "# Phase 2.12 — Evidence Packet Generation",
            "",
            "Phase 2.12 transforms the 253-item Phase 2.11 review queue into "
            "one deterministic evidence packet per decision.",
            "",
            "The packets preserve source material already recorded by the "
            "project. They do not adjudicate decisions, promote rules, or "
            "invent missing evidence.",
            "",
            "## Summary",
            "",
            f"- Evidence packets: {len(packets)}",
            f"- REVIEW-REQUIRED packets: {packet_counts['REVIEW-REQUIRED']}",
            f"- UNRESOLVED packets: {packet_counts['UNRESOLVED']}",
            "- Promotion-eligible packets: 0",
            "- Maintainer decisions recorded: 0",
            "- Project-normative decisions made: 0",
            f"- Registered source IDs observed: {len(all_source_ids)}",
            f"- Supplemental stage-evidence records preserved: "
            f"{supplemental_record_count}",
            f"- Profile status: `{profile['status']}`",
            "",
            "## Categories",
            "",
        ]

        for category, count in sorted(category_counts.items()):
            lines.append(f"- `{category}`: {count}")

        lines += [
            "",
            "## Evidence channels observed",
            "",
        ]

        for channel, count in sorted(channel_counts.items()):
            lines.append(f"- `{channel}`: {count}")

        lines += [
            "",
            "## Stable/draft comparison",
            "",
        ]

        for relationship, count in sorted(relationship_counts.items()):
            lines.append(f"- `{relationship}`: {count}")

        lines += [
            "",
            "## Provenance inputs",
            "",
        ]

        for source in source_inputs:
            lines.append(
                f"- `{source['path']}` — `{source['sha256']}`"
            )

        lines += [
            "",
            "## Packet contract",
            "",
            "Each packet contains the exact Phase 1 master decision, the "
            "canonical matching stage-evidence record, any same-ID supplemental "
            "stage-evidence records, relevant source-registry sections, "
            "stage source pins where available, observed evidence-channel "
            "coverage, and a neutral review question.",
            "",
            "Each packet begins with:",
            "",
            "- `recommendedDisposition = null`",
            "- `maintainerDecision = null`",
            "- `decisionRationale = null`",
            "- `promotionEligible = false`",
            "",
            "## Safety boundary",
            "",
            "Evidence collection is not adjudication. No packet in this stage "
            "changes the project specification.",
            "",
            "The `fa-ir-g1` profile remains `draft`.",
            "",
            "## Packet index",
            "",
            "| Packet | Decision | Classification | Stage | Category |",
            "|---|---|---|---|---|",
        ]

        for entry in manifest_entries:
            lines.append(
                f"| `{entry['packetId']}` | `{entry['decisionItemId']}` | "
                f"{entry['classification']} | {entry['phase1Stage']} | "
                f"{entry['category']} |"
            )

        write_text(DOC, "\n".join(lines))

        print("Phase 2.12 evidence packets built.")
        print(f"Packets                   : {len(packets)}")
        print(f"REVIEW-REQUIRED           : {packet_counts['REVIEW-REQUIRED']}")
        print(f"UNRESOLVED                : {packet_counts['UNRESOLVED']}")
        print("Promotion eligible        : 0")
        print("Maintainer decisions      : 0")
        print(f"Registered sources seen   : {len(all_source_ids)}")
        print(f"Supplemental records      : {supplemental_record_count}")
        print(f"Profile                   : {profile['id']} ({profile['status']})")
        print("")
        print("Stable/draft relationships:")
        for relationship, count in sorted(relationship_counts.items()):
            print(f"  {relationship:<30}: {count}")
        print("")
        print(f"Manifest SHA-256          : {sha256(MANIFEST)}")
        print(f"Documentation SHA-256     : {sha256(DOC)}")
        return 0

    except PacketError as exc:
        print("Phase 2.12 evidence packet generation: FAIL")
        print(str(exc))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
