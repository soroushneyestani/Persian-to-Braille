from __future__ import annotations

from collections import Counter
from pathlib import Path
import hashlib
import json

from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[2]

PLAN = ROOT / "spec" / "fa-ir" / "governance" / "evidence-adjudication-plan.json"
POLICY = ROOT / "spec" / "fa-ir" / "governance" / "adjudication-policy.json"
SCHEMA = ROOT / "spec" / "fa-ir" / "schema" / "adjudication-record.schema.json"
PROFILE = ROOT / "spec" / "fa-ir" / "profiles" / "fa-ir-g1.json"
PROMOTION_POLICY = (
    ROOT / "spec" / "fa-ir" / "governance" / "normative-promotion-policy.json"
)
RECORD_DIR = ROOT / "spec" / "fa-ir" / "adjudications" / "records"
MANIFEST = ROOT / "spec" / "fa-ir" / "adjudications" / "manifest.json"

EXPECTED_PLANNED = 253


class ValidationFailure(RuntimeError):
    pass


def rel(path: Path) -> str:
    return str(path.relative_to(ROOT)).replace("\\", "/")


def read_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise ValidationFailure(f"missing file: {rel(path)}") from exc
    except json.JSONDecodeError as exc:
        raise ValidationFailure(
            f"invalid JSON: {rel(path)}:{exc.lineno}:{exc.colno}: {exc.msg}"
        ) from exc


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest().upper()


def expect(condition: bool, message: str) -> None:
    if not condition:
        raise ValidationFailure(message)


def expect_equal(actual, expected, message: str) -> None:
    if actual != expected:
        raise ValidationFailure(
            f"{message}: expected={expected!r}, actual={actual!r}"
        )


def expected_materialization(record: dict) -> tuple[str, bool, set[str | None], bool]:
    disposition = record["disposition"]
    if disposition == "accept-rule":
        return "rule", True, {"character", "sequence"}, True
    if disposition == "accept-normalization":
        return "normalization", True, {"normalization"}, True
    if disposition == "accept-context-rule":
        return "context-rule", True, {"context"}, True
    if disposition == "accept-mode-rule":
        return "mode-rule", True, {"mode"}, True
    if disposition == "accept-layout-policy":
        return "layout-policy", True, {"layout"}, True
    if disposition == "ignore-format-control":
        return "ignore", False, {None}, False
    if disposition == "explicitly-unsupported":
        return "unsupported", False, {None}, False
    if disposition == "out-of-scope":
        return "out-of-scope", False, {None}, False
    if disposition == "defer-pending-evidence":
        return "deferred", False, {None}, False
    raise ValidationFailure(f"unknown disposition: {disposition}")


def main() -> int:
    try:
        plan = read_json(PLAN)
        policy = read_json(POLICY)
        schema = read_json(SCHEMA)
        profile = read_json(PROFILE)
        promotion_policy = read_json(PROMOTION_POLICY)
        manifest = read_json(MANIFEST)

        expect_equal(plan["summary"]["plannedItems"], EXPECTED_PLANNED, "planned decisions")
        expect_equal(profile["status"], "draft", "profile status")
        expect_equal(
            promotion_policy["promotion"]["eligiblePhase1Classifications"],
            ["CONSENSUS-CANDIDATE"],
            "promotion-policy eligibility",
        )
        expect_equal(
            policy["promotionBoundary"]["adjudicationIsNormativePromotion"],
            False,
            "adjudication/promotion separation",
        )
        expect_equal(
            policy["promotionBoundary"]["adjudicationMaySetPromotionEligible"],
            False,
            "adjudication promotion eligibility boundary",
        )

        plan_by_decision = {
            item["decisionItemId"]: item
            for item in plan["items"]
        }

        validator = Draft202012Validator(
            schema,
            format_checker=FormatChecker(),
        )

        record_paths = sorted(RECORD_DIR.glob("*.json")) if RECORD_DIR.exists() else []
        records = []
        seen_ids = set()
        seen_decisions = set()

        for path in record_paths:
            record = read_json(path)

            errors = sorted(
                validator.iter_errors(record),
                key=lambda error: list(error.path),
            )
            if errors:
                first = errors[0]
                location = ".".join(str(part) for part in first.path) or "<root>"
                raise ValidationFailure(
                    f"schema error {rel(path)} at {location}: {first.message}"
                )

            expect(record["id"] not in seen_ids, f"duplicate record ID {record['id']}")
            expect(
                record["decisionItemId"] not in seen_decisions,
                f"duplicate decision record {record['decisionItemId']}",
            )
            seen_ids.add(record["id"])
            seen_decisions.add(record["decisionItemId"])

            item = plan_by_decision.get(record["decisionItemId"])
            expect(item is not None, f"decision not in plan {record['decisionItemId']}")

            expect_equal(record["policyVersion"], policy["policyVersion"], f"policy version {record['id']}")
            expect_equal(record["profileId"], "fa-ir-g1", f"profile ID {record['id']}")
            expect_equal(record["queueId"], item["queueId"], f"queue ID {record['id']}")
            expect_equal(record["packetId"], item["packetId"], f"packet ID {record['id']}")
            expect_equal(record["planItemId"], item["adjudicationItemId"], f"plan item ID {record['id']}")
            expect_equal(record["phase1Classification"], item["classification"], f"classification {record['id']}")
            expect_equal(record["track"], item["track"], f"track {record['id']}")

            packet_path = ROOT / item["evidencePacket"]["path"]
            packet = read_json(packet_path)
            expect_equal(
                record["basis"]["evidencePacketPath"],
                rel(packet_path),
                f"packet path {record['id']}",
            )
            expect_equal(
                record["basis"]["evidencePacketSha256"],
                sha256(packet_path),
                f"packet hash {record['id']}",
            )
            expect_equal(
                record["basis"]["sourceIds"],
                packet["sourceIds"],
                f"source IDs {record['id']}",
            )
            expect_equal(
                record["basis"]["stableDraftRelationship"],
                packet["stableDraftComparison"]["relationship"],
                f"stable/draft relationship {record['id']}",
            )

            expected_kind, creates, target_types, future_governance = (
                expected_materialization(record)
            )
            materialization = record["materialization"]

            expect_equal(materialization["kind"], expected_kind, f"materialization kind {record['id']}")
            expect_equal(materialization["createsSpecificationArtifact"], creates, f"artifact creation {record['id']}")
            expect(
                materialization["targetRuleType"] in target_types,
                f"target rule type {record['id']}",
            )
            expect_equal(materialization["promotionEligible"], False, f"promotion eligibility {record['id']}")
            expect_equal(
                materialization["requiresFuturePromotionGovernance"],
                future_governance,
                f"future promotion governance {record['id']}",
            )

            if record["disposition"] == "defer-pending-evidence":
                expect_equal(record["decision"]["result"], "deferred", f"deferred result {record['id']}")
                expect(
                    len(record["basis"]["unresolvedEvidenceGaps"]) > 0,
                    f"deferred evidence gaps {record['id']}",
                )
            else:
                expect_equal(record["decision"]["result"], "approved", f"approved result {record['id']}")

            expect_equal(
                record["scope"],
                {
                    "projectSpecificationDecision": True,
                    "projectNormativeRule": False,
                    "officialIranianStandardClaim": False,
                    "phase1ClassificationRewritten": False,
                },
                f"scope {record['id']}",
            )

            records.append((path, record))

        counts = Counter(record["decision"]["result"] for _, record in records)
        disposition_counts = Counter(record["disposition"] for _, record in records)

        expected_manifest_records = [
            {
                "id": record["id"],
                "decisionItemId": record["decisionItemId"],
                "queueId": record["queueId"],
                "planItemId": record["planItemId"],
                "disposition": record["disposition"],
                "result": record["decision"]["result"],
                "path": rel(path),
                "sha256": sha256(path),
                "promotionEligible": False,
            }
            for path, record in records
        ]

        expect_equal(manifest["schemaVersion"], 1, "manifest schemaVersion")
        expect_equal(manifest["stage"], "2.14", "manifest stage")
        expect_equal(manifest["policyVersion"], policy["policyVersion"], "manifest policy version")
        expect_equal(
            manifest["status"],
            "execution-complete" if len(records) == EXPECTED_PLANNED else "execution-in-progress",
            "manifest status",
        )
        expect_equal(
            manifest["profile"],
            {
                "id": profile["id"],
                "version": profile["version"],
                "status": profile["status"],
            },
            "manifest profile",
        )

        summary = manifest["summary"]
        expect_equal(summary["plannedDecisions"], EXPECTED_PLANNED, "manifest planned decisions")
        expect_equal(summary["adjudicationRecords"], len(records), "manifest record count")
        expect_equal(summary["approved"], counts["approved"], "manifest approved count")
        expect_equal(summary["deferred"], counts["deferred"], "manifest deferred count")
        expect_equal(summary["unadjudicated"], EXPECTED_PLANNED - len(records), "manifest unadjudicated count")
        expect_equal(summary["promotionEligible"], 0, "manifest promotion eligibility")
        expect_equal(summary["normativeRulesCreated"], 0, "manifest normative rules")
        expect_equal(summary["dispositionCounts"], dict(sorted(disposition_counts.items())), "manifest disposition counts")

        expect_equal(
            manifest["inputs"],
            {
                "adjudicationPlan": {
                    "path": rel(PLAN),
                    "sha256": sha256(PLAN),
                },
                "adjudicationPolicy": {
                    "path": rel(POLICY),
                    "sha256": sha256(POLICY),
                },
                "adjudicationRecordSchema": {
                    "path": rel(SCHEMA),
                    "sha256": sha256(SCHEMA),
                },
            },
            "manifest inputs",
        )
        expect_equal(manifest["records"], expected_manifest_records, "manifest records")

        # Current Batch 00 semantic anchor, once present.
        if "FA-VAR-013" in seen_decisions:
            record = next(
                record
                for _, record in records
                if record["decisionItemId"] == "FA-VAR-013"
            )
            expect_equal(record["disposition"], "explicitly-unsupported", "FA-VAR-013 disposition")
            expect_equal(record["track"], "unresolved", "FA-VAR-013 track")
            expect_equal(record["materialization"]["kind"], "unsupported", "FA-VAR-013 materialization")

        print("Phase 2.14 adjudication validation: PASS")
        print(f"plannedDecisions                : {EXPECTED_PLANNED}")
        print(f"adjudicationRecords             : {len(records)}")
        print(f"approved                        : {counts['approved']}")
        print(f"deferred                        : {counts['deferred']}")
        print(f"unadjudicated                   : {EXPECTED_PLANNED - len(records)}")
        print("promotionEligible               : 0")
        print("normativeRulesCreated           : 0")
        print(f"profileStatus                    : {profile['status']}")
        print(f"manifestStatus                   : {manifest['status']}")
        print("semanticErrors                   : 0")
        return 0

    except ValidationFailure as exc:
        print("Phase 2.14 adjudication validation: FAIL")
        print("semanticErrors                   : 1")
        print(f"ERROR: {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
