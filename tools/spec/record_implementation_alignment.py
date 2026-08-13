from __future__ import annotations

from pathlib import Path
import hashlib
import json
import re

from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[2]

PLAN = ROOT / "spec" / "fa-ir" / "governance" / "evidence-adjudication-plan.json"
POLICY = ROOT / "spec" / "fa-ir" / "governance" / "adjudication-policy.json"
SCHEMA = ROOT / "spec" / "fa-ir" / "schema" / "adjudication-record.schema.json"
RECORD_DIR = ROOT / "spec" / "fa-ir" / "adjudications" / "records"

EXPECTED_PLAN_SHA256 = (
    "FB5E7AA363EDB25B6CAC9556BFD9636FBAC6F7F5D797EE8D6A9C55E1CC1C6F26"
)
EXPECTED_ALIGNMENT_COUNT = 176


class RecordError(RuntimeError):
    pass


def rel(path: Path) -> str:
    return str(path.relative_to(ROOT)).replace("\\", "/")


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest().upper()


def read_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise RecordError(f"Missing required file: {rel(path)}") from exc
    except json.JSONDecodeError as exc:
        raise RecordError(
            f"Invalid JSON: {rel(path)}:{exc.lineno}:{exc.colno}: {exc.msg}"
        ) from exc


def write_json(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        handle.write(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def expect(condition: bool, message: str) -> None:
    if not condition:
        raise RecordError(message)


def expect_equal(actual, expected, message: str) -> None:
    if actual != expected:
        raise RecordError(
            f"{message}: expected={expected!r}, actual={actual!r}"
        )


def record_id(decision_id: str) -> str:
    return f"FA-ADJ-{decision_id.removeprefix('FA-')}-001"


def output_path(decision_id: str) -> Path:
    return RECORD_DIR / f"{record_id(decision_id).lower()}.json"


def artifact_decision(
    disposition: str,
    kind: str,
    target_rule_type: str,
    rationale: str,
) -> dict:
    return {
        "disposition": disposition,
        "result": "approved",
        "materialization": {
            "kind": kind,
            "createsSpecificationArtifact": True,
            "targetRuleType": target_rule_type,
            "promotionEligible": False,
            "requiresFuturePromotionGovernance": True,
        },
        "unresolvedEvidenceGaps": [],
        "rationale": rationale,
    }


def deferred_decision(rationale: str, evidence_gap: str) -> dict:
    return {
        "disposition": "defer-pending-evidence",
        "result": "deferred",
        "materialization": {
            "kind": "deferred",
            "createsSpecificationArtifact": False,
            "targetRuleType": None,
            "promotionEligible": False,
            "requiresFuturePromotionGovernance": False,
        },
        "unresolvedEvidenceGaps": [evidence_gap],
        "rationale": rationale,
    }


def is_digit_rule(decision_id: str) -> bool:
    return bool(
        re.fullmatch(
            r"FA-DIGIT-(?:ASCII|PERSIAN|ARABIC-INDIC)-[0-9]",
            decision_id,
        )
    )


def build_decision(decision_id: str) -> dict:
    if is_digit_rule(decision_id):
        return artifact_decision(
            "accept-rule",
            "rule",
            "character",
            (
                "Stable and draft Liblouis implementations agree on this digit "
                "mapping, and the preserved legacy v1 evidence independently "
                "supports the same digit-family behavior. The project accepts the "
                "aligned character mapping while keeping number-mode semantics in "
                "separate numeric rules."
            ),
        )

    if decision_id == "FA-NUMRULE-001":
        return artifact_decision(
            "accept-mode-rule",
            "mode-rule",
            "mode",
            (
                "Stable and draft implementations agree on the numeric indicator "
                "dots 3456. The project accepts this as numeric-mode infrastructure "
                "rather than as an ordinary scalar punctuation mapping."
            ),
        )

    if re.fullmatch(r"FA-NUMRULE-00[2-7]", decision_id):
        return artifact_decision(
            "accept-context-rule",
            "context-rule",
            "context",
            (
                "Stable and draft implementations agree on this numeric "
                "begin/middle/decimal/end behavior. Because its meaning depends on "
                "numeric context, the project accepts it as a context rule rather "
                "than an unconditional character mapping."
            ),
        )

    if re.fullmatch(
        r"FA-PUNC-(?:00[1-9]|010|011|016|017|018|019|020)",
        decision_id,
    ):
        return artifact_decision(
            "accept-rule",
            "rule",
            "character",
            (
                "Stable and draft implementations agree exactly on this scalar "
                "punctuation behavior, and legacy v1 supplies independent historical "
                "support for the aligned mapping. The project accepts the mapping as "
                "a character-level specification rule; this remains a project "
                "specification decision, not a claim of current official Iranian "
                "national-standard status."
            ),
        )

    if re.fullmatch(r"FA-WS-(?:00[1-9]|01[0-9]|02[0-6])", decision_id):
        return artifact_decision(
            "accept-layout-policy",
            "layout-policy",
            "layout",
            (
                "Stable and draft implementations agree on this whitespace/layout "
                "behavior through the shared spaces utility and any identical "
                "Persian-local override. The project accepts it as host/layout "
                "policy rather than treating the whitespace code point as an "
                "ordinary Persian Braille character rule."
            ),
        )

    if re.fullmatch(r"FA-REM-\d{3}", decision_id):
        return deferred_decision(
            (
                "Stable and draft implementations agree on this remaining-coverage "
                "mapping, but the Phase 1 audit explicitly did not verify the mapping "
                "against sufficiently authoritative project evidence. Agreement "
                "between implementations alone is not enough to make it a project "
                "specification rule, especially where dot 7/8 mappings may be "
                "involved. The project therefore defers this decision."
            ),
            (
                "The current project audit has not independently verified this "
                "remaining-coverage mapping beyond aligned implementation evidence."
            ),
        )

    if re.fullmatch(r"FA-REM-CTX-\d{3}", decision_id):
        return deferred_decision(
            (
                "Stable and draft implementations agree on this context directive, "
                "but the preserved review surface contains no independent manual or "
                "legacy evidence establishing it as a Persian project rule. The "
                "project defers it instead of treating implementation agreement as "
                "normative evidence."
            ),
            (
                "Independent source evidence for this remaining-coverage context "
                "directive has not yet been established by the project."
            ),
        )

    if re.fullmatch(r"FA-REM-EMPH-\d{3}", decision_id):
        return deferred_decision(
            (
                "Stable and draft implementations agree on this emphasis directive, "
                "but the project has not established a source-backed Persian "
                "emphasis policy for bold, italic, or underline. The project defers "
                "the directive rather than inheriting implementation-specific "
                "formatting semantics without independent evidence."
            ),
            (
                "A source-backed Persian Braille emphasis policy for this directive "
                "has not yet been established."
            ),
        )

    if decision_id == "FA-SEQ-002":
        return deferred_decision(
            (
                "Both implementations lack an explicit always rule for this sequence, "
                "and the preserved print-era manual does not directly define this "
                "Unicode spelling. The project defers it until normalization or "
                "spelling-equivalence evidence is formally established."
            ),
            (
                "The preserved print-era manual does not directly establish this "
                "Unicode spelling or a sequence-level rule for it."
            ),
        )

    if re.fullmatch(r"FA-VAR-(?:00[1-9]|012)", decision_id):
        return deferred_decision(
            (
                "Stable and draft implementations agree on the observed scalar "
                "behavior, but alignment alone does not decide whether the final "
                "architecture should use a direct character rule, normalization to a "
                "canonical Persian form, or non-emitting treatment. The project "
                "therefore defers these orthographic variants until normalization "
                "semantics and direct-source support are adjudicated explicitly."
            ),
            (
                "The project has not yet established whether this orthographic "
                "variant belongs in direct translation, normalization, or another "
                "non-character-rule layer."
            ),
        )

    raise RecordError(
        f"No explicitly approved alignment disposition for {decision_id}"
    )


def main() -> int:
    try:
        plan = read_json(PLAN)
        policy = read_json(POLICY)
        schema = read_json(SCHEMA)

        expect_equal(
            sha256(PLAN),
            EXPECTED_PLAN_SHA256,
            "Adjudication plan SHA-256",
        )

        plan_items = {
            item["decisionItemId"]: item
            for item in plan["items"]
        }
        alignment_ids = {
            item["decisionItemId"]
            for item in plan["items"]
            if item["track"] == "implementation-alignment"
        }

        expect_equal(
            len(alignment_ids),
            EXPECTED_ALIGNMENT_COUNT,
            "Implementation-alignment count",
        )

        decisions = {
            decision_id: build_decision(decision_id)
            for decision_id in alignment_ids
        }
        expect_equal(
            set(decisions),
            alignment_ids,
            "Explicit approval / implementation-alignment coverage",
        )

        validator = Draft202012Validator(
            schema,
            format_checker=FormatChecker(),
        )

        created = 0
        matched = 0
        approved = 0
        deferred = 0
        disposition_counts: dict[str, int] = {}

        for decision_id in sorted(decisions):
            spec = decisions[decision_id]
            item = plan_items[decision_id]

            expect_equal(
                item["track"],
                "implementation-alignment",
                f"Track {decision_id}",
            )
            expect_equal(
                item["reviewSignals"]["stableDraftRelationship"],
                "same-observed-behavior",
                f"Stable/draft relationship {decision_id}",
            )

            packet_path = ROOT / item["evidencePacket"]["path"]
            packet = read_json(packet_path)
            actual_packet_hash = sha256(packet_path)

            expect_equal(
                actual_packet_hash,
                item["evidencePacket"]["sha256"],
                f"Evidence packet SHA-256 {decision_id}",
            )
            expect_equal(
                packet["decisionItemId"],
                decision_id,
                f"Evidence packet decision ID {decision_id}",
            )
            expect_equal(
                packet["stableDraftComparison"]["relationship"],
                "same-observed-behavior",
                f"Evidence relationship {decision_id}",
            )

            record = {
                "schemaVersion": 1,
                "id": record_id(decision_id),
                "policyVersion": policy["policyVersion"],
                "profileId": "fa-ir-g1",
                "decisionItemId": decision_id,
                "queueId": item["queueId"],
                "packetId": item["packetId"],
                "planItemId": item["adjudicationItemId"],
                "phase1Classification": item["classification"],
                "track": item["track"],
                "disposition": spec["disposition"],
                "decision": {
                    "result": spec["result"],
                    "authority": "project-maintainer",
                    "recordedBy": "Soroush Neyestani",
                    "recordedAt": None,
                },
                "basis": {
                    "evidencePacketPath": rel(packet_path),
                    "evidencePacketSha256": actual_packet_hash,
                    "sourceIds": packet["sourceIds"],
                    "stableDraftRelationship": (
                        packet["stableDraftComparison"]["relationship"]
                    ),
                    "unresolvedEvidenceGaps": spec["unresolvedEvidenceGaps"],
                },
                "materialization": spec["materialization"],
                "scope": {
                    "projectSpecificationDecision": True,
                    "projectNormativeRule": False,
                    "officialIranianStandardClaim": False,
                    "phase1ClassificationRewritten": False,
                },
                "rationale": spec["rationale"],
            }

            errors = sorted(
                validator.iter_errors(record),
                key=lambda error: list(error.path),
            )
            if errors:
                first = errors[0]
                location = ".".join(str(part) for part in first.path) or "<root>"
                raise RecordError(
                    f"Schema validation failed for {decision_id} at "
                    f"{location}: {first.message}"
                )

            path = output_path(decision_id)
            if path.exists():
                existing = read_json(path)
                expect_equal(
                    existing,
                    record,
                    f"Existing adjudication record {decision_id}",
                )
                matched += 1
            else:
                write_json(path, record)
                created += 1

            if spec["result"] == "approved":
                approved += 1
            elif spec["result"] == "deferred":
                deferred += 1
            else:
                raise RecordError(
                    f"Unexpected decision result for {decision_id}: "
                    f"{spec['result']!r}"
                )

            disposition_counts[spec["disposition"]] = (
                disposition_counts.get(spec["disposition"], 0) + 1
            )

        expect_equal(approved, 79, "Approved alignment decisions")
        expect_equal(deferred, 97, "Deferred alignment decisions")

        print("Phase 2.14 implementation-alignment adjudications recorded.")
        print(f"Plan SHA-256              : {EXPECTED_PLAN_SHA256}")
        print(f"Alignment decisions       : {len(decisions)}")
        print(f"New records               : {created}")
        print(f"Existing exact matches    : {matched}")
        print(f"Approved                  : {approved}")
        print(f"Deferred                  : {deferred}")
        print("Promotion eligible        : 0")
        print("Project normative rules   : 0")
        print("")
        print("Disposition counts:")
        for disposition, count in sorted(disposition_counts.items()):
            print(f"  {disposition:<28}: {count}")
        return 0

    except RecordError as exc:
        print("Phase 2.14 implementation-alignment recording: FAIL")
        print(str(exc))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
