from __future__ import annotations

from pathlib import Path
import hashlib
import json

from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[2]

PLAN = ROOT / "spec" / "fa-ir" / "governance" / "evidence-adjudication-plan.json"
POLICY = ROOT / "spec" / "fa-ir" / "governance" / "adjudication-policy.json"
SCHEMA = ROOT / "spec" / "fa-ir" / "schema" / "adjudication-record.schema.json"
PACKET = (
    ROOT
    / "spec"
    / "fa-ir"
    / "review"
    / "evidence-packets"
    / "records"
    / "fa-var-013.json"
)
OUT = (
    ROOT
    / "spec"
    / "fa-ir"
    / "adjudications"
    / "records"
    / "fa-adj-var-013-001.json"
)

EXPECTED_PACKET_SHA256 = (
    "4C61EA0F4A9F3700F922C8D65F5501E73401D8694A15B3F69ADC9D70C747382B"
)


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


def expect_equal(actual, expected, message: str) -> None:
    if actual != expected:
        raise RecordError(
            f"{message}: expected={expected!r}, actual={actual!r}"
        )


def main() -> int:
    try:
        plan = read_json(PLAN)
        policy = read_json(POLICY)
        schema = read_json(SCHEMA)
        packet = read_json(PACKET)

        # Bind the explicit maintainer decision to the exact evidence packet
        # and the semantic identity of the reviewed plan item. Do not bind to
        # the whole Phase 2.13 plan hash: unrelated reclassification of other
        # decisions must not invalidate this already-approved decision.
        expect_equal(sha256(PACKET), EXPECTED_PACKET_SHA256, "Evidence packet SHA-256")

        plan_items = {
            item["decisionItemId"]: item
            for item in plan["items"]
        }
        item = plan_items.get("FA-VAR-013")
        if item is None:
            raise RecordError("FA-VAR-013 is missing from the adjudication plan")

        expect_equal(item["queueId"], "FA-REVIEW-001", "Queue ID")
        expect_equal(item["packetId"], "FA-EVIDENCE-001", "Packet ID")
        expect_equal(item["adjudicationItemId"], "FA-ADJ-PLAN-001", "Plan item ID")
        expect_equal(item["classification"], "UNRESOLVED", "Phase 1 classification")
        expect_equal(item["track"], "unresolved", "Adjudication track")
        expect_equal(packet["decisionItemId"], "FA-VAR-013", "Packet decision ID")
        expect_equal(
            packet["stableDraftComparison"]["relationship"],
            "same-observed-behavior",
            "Stable/draft relationship",
        )

        record = {
            "schemaVersion": 1,
            "id": "FA-ADJ-VAR-013-001",
            "policyVersion": policy["policyVersion"],
            "profileId": "fa-ir-g1",
            "decisionItemId": "FA-VAR-013",
            "queueId": item["queueId"],
            "packetId": item["packetId"],
            "planItemId": item["adjudicationItemId"],
            "phase1Classification": item["classification"],
            "track": item["track"],
            "disposition": "explicitly-unsupported",
            "decision": {
                "result": "approved",
                "authority": "project-maintainer",
                "recordedBy": "Soroush Neyestani",
                "recordedAt": None,
            },
            "basis": {
                "evidencePacketPath": rel(PACKET),
                "evidencePacketSha256": EXPECTED_PACKET_SHA256,
                "sourceIds": packet["sourceIds"],
                "stableDraftRelationship": (
                    packet["stableDraftComparison"]["relationship"]
                ),
                "unresolvedEvidenceGaps": [
                    (
                        "The preserved evidence does not establish an independent "
                        "standalone Persian Braille mapping for U+0654 ARABIC HAMZA "
                        "ABOVE; meaningful Ezafe sequence behavior is reviewed "
                        "separately."
                    )
                ],
            },
            "materialization": {
                "kind": "unsupported",
                "createsSpecificationArtifact": False,
                "targetRuleType": None,
                "promotionEligible": False,
                "requiresFuturePromotionGovernance": False,
            },
            "scope": {
                "projectSpecificationDecision": True,
                "projectNormativeRule": False,
                "officialIranianStandardClaim": False,
                "phase1ClassificationRewritten": False,
            },
            "rationale": (
                "U+0654 has no independently established standalone Persian "
                "Braille behavior in the preserved evidence. Both pinned "
                "Liblouis implementations leave the standalone scalar unmapped, "
                "legacy v1 provides no standalone mapping, and the recovered "
                "historical Iranian manual evidence does not establish an "
                "independent scalar rule. Meaningful Ezafe usage is handled "
                "separately by sequence-level decisions. The fa-ir-g1 project "
                "therefore explicitly leaves standalone U+0654 unsupported "
                "rather than inventing a character mapping."
            ),
        }

        errors = sorted(
            Draft202012Validator(
                schema,
                format_checker=FormatChecker(),
            ).iter_errors(record),
            key=lambda error: list(error.path),
        )
        if errors:
            first = errors[0]
            location = ".".join(str(part) for part in first.path) or "<root>"
            raise RecordError(
                f"Schema validation failed at {location}: {first.message}"
            )

        if OUT.exists():
            existing = read_json(OUT)
            expect_equal(existing, record, "Existing Batch 00 adjudication record")
            print("Batch 00 adjudication record already matches explicit approval.")
        else:
            write_json(OUT, record)
            print("Batch 00 adjudication record written from explicit approval.")

        print("Decision                    : FA-VAR-013")
        print("Disposition                 : explicitly-unsupported")
        print("Result                      : approved")
        print("Promotion eligible          : False")
        print("Project normative rule      : False")
        print(f"Evidence packet SHA-256     : {EXPECTED_PACKET_SHA256}")
        print(f"Record SHA-256              : {sha256(OUT)}")
        return 0

    except RecordError as exc:
        print("Batch 00 adjudication recording: FAIL")
        print(str(exc))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
