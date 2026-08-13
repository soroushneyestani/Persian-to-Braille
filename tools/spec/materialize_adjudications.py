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

NON_ARTIFACT_DISPOSITIONS = {
    "ignore-format-control": "ignore",
    "explicitly-unsupported": "unsupported",
    "out-of-scope": "out-of-scope",
    "defer-pending-evidence": "deferred",
}

ARTIFACT_DISPOSITIONS = {
    "accept-rule": ("rule", {"character", "sequence"}),
    "accept-normalization": ("normalization", {"normalization"}),
    "accept-context-rule": ("context-rule", {"context"}),
    "accept-mode-rule": ("mode-rule", {"mode"}),
    "accept-layout-policy": ("layout-policy", {"layout"}),
}


class MaterializationError(RuntimeError):
    pass


def rel(path: Path) -> str:
    return str(path.relative_to(ROOT)).replace("\\", "/")


def read_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise MaterializationError(f"Missing required file: {rel(path)}") from exc
    except json.JSONDecodeError as exc:
        raise MaterializationError(
            f"Invalid JSON: {rel(path)}:{exc.lineno}:{exc.colno}: {exc.msg}"
        ) from exc


def write_json(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        handle.write(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest().upper()


def expect(condition: bool, message: str) -> None:
    if not condition:
        raise MaterializationError(message)


def expect_equal(actual, expected, message: str) -> None:
    if actual != expected:
        raise MaterializationError(
            f"{message}: expected={expected!r}, actual={actual!r}"
        )


def validate_materialization_semantics(record: dict) -> None:
    disposition = record["disposition"]
    materialization = record["materialization"]
    result = record["decision"]["result"]

    if disposition == "defer-pending-evidence":
        expect_equal(result, "deferred", f"Deferred result {record['id']}")
        expect(
            len(record["basis"]["unresolvedEvidenceGaps"]) > 0,
            f"Deferred record requires evidence gaps: {record['id']}",
        )
    else:
        expect_equal(result, "approved", f"Approved result {record['id']}")

    if disposition in NON_ARTIFACT_DISPOSITIONS:
        expect_equal(
            materialization["kind"],
            NON_ARTIFACT_DISPOSITIONS[disposition],
            f"Materialization kind {record['id']}",
        )
        expect_equal(
            materialization["createsSpecificationArtifact"],
            False,
            f"Artifact creation {record['id']}",
        )
        expect_equal(
            materialization["targetRuleType"],
            None,
            f"Target rule type {record['id']}",
        )
        expect_equal(
            materialization["requiresFuturePromotionGovernance"],
            False,
            f"Future promotion governance {record['id']}",
        )
    else:
        expected_kind, target_types = ARTIFACT_DISPOSITIONS[disposition]
        expect_equal(
            materialization["kind"],
            expected_kind,
            f"Materialization kind {record['id']}",
        )
        expect_equal(
            materialization["createsSpecificationArtifact"],
            True,
            f"Artifact creation {record['id']}",
        )
        expect(
            materialization["targetRuleType"] in target_types,
            f"Invalid target rule type for {record['id']}: "
            f"{materialization['targetRuleType']!r}",
        )
        expect_equal(
            materialization["requiresFuturePromotionGovernance"],
            True,
            f"Future promotion governance {record['id']}",
        )

    expect_equal(
        materialization["promotionEligible"],
        False,
        f"Promotion eligibility {record['id']}",
    )


def main() -> int:
    try:
        plan = read_json(PLAN)
        policy = read_json(POLICY)
        schema = read_json(SCHEMA)
        profile = read_json(PROFILE)
        promotion_policy = read_json(PROMOTION_POLICY)

        expect_equal(plan["summary"]["plannedItems"], EXPECTED_PLANNED, "Planned decisions")
        expect_equal(profile["status"], "draft", "Profile status")
        expect_equal(
            policy["promotionBoundary"]["adjudicationMaySetPromotionEligible"],
            False,
            "Adjudication promotion boundary",
        )
        expect_equal(
            promotion_policy["promotion"]["eligiblePhase1Classifications"],
            ["CONSENSUS-CANDIDATE"],
            "Current promotion-policy eligibility",
        )

        plan_by_decision = {
            item["decisionItemId"]: item
            for item in plan["items"]
        }

        RECORD_DIR.mkdir(parents=True, exist_ok=True)
        record_paths = sorted(RECORD_DIR.glob("*.json"))

        validator = Draft202012Validator(
            schema,
            format_checker=FormatChecker(),
        )

        records = []
        seen_record_ids = set()
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
                raise MaterializationError(
                    f"Schema validation failed for {rel(path)} at "
                    f"{location}: {first.message}"
                )

            expect(
                record["id"] not in seen_record_ids,
                f"Duplicate adjudication record ID: {record['id']}",
            )
            expect(
                record["decisionItemId"] not in seen_decisions,
                f"Duplicate adjudicated decision: {record['decisionItemId']}",
            )
            seen_record_ids.add(record["id"])
            seen_decisions.add(record["decisionItemId"])

            item = plan_by_decision.get(record["decisionItemId"])
            expect(
                item is not None,
                f"Record references decision outside Phase 2.13 plan: "
                f"{record['decisionItemId']}",
            )

            expect_equal(record["policyVersion"], policy["policyVersion"], f"Policy version {record['id']}")
            expect_equal(record["profileId"], plan["profile"]["id"], f"Profile ID {record['id']}")
            expect_equal(record["queueId"], item["queueId"], f"Queue ID {record['id']}")
            expect_equal(record["packetId"], item["packetId"], f"Packet ID {record['id']}")
            expect_equal(record["planItemId"], item["adjudicationItemId"], f"Plan item ID {record['id']}")
            expect_equal(record["phase1Classification"], item["classification"], f"Phase 1 classification {record['id']}")
            expect_equal(record["track"], item["track"], f"Track {record['id']}")

            packet_path = ROOT / item["evidencePacket"]["path"]
            expect(packet_path.is_file(), f"Missing evidence packet: {rel(packet_path)}")
            packet = read_json(packet_path)
            packet_hash = sha256(packet_path)

            expect_equal(
                record["basis"]["evidencePacketPath"],
                rel(packet_path),
                f"Evidence packet path {record['id']}",
            )
            expect_equal(
                record["basis"]["evidencePacketSha256"],
                packet_hash,
                f"Evidence packet SHA-256 {record['id']}",
            )
            expect_equal(
                record["basis"]["sourceIds"],
                packet["sourceIds"],
                f"Source IDs {record['id']}",
            )
            expect_equal(
                record["basis"]["stableDraftRelationship"],
                packet["stableDraftComparison"]["relationship"],
                f"Stable/draft relationship {record['id']}",
            )

            validate_materialization_semantics(record)

            expect_equal(record["scope"]["projectSpecificationDecision"], True, f"Project specification scope {record['id']}")
            expect_equal(record["scope"]["projectNormativeRule"], False, f"Normative-rule scope {record['id']}")
            expect_equal(record["scope"]["officialIranianStandardClaim"], False, f"Official-standard claim {record['id']}")
            expect_equal(record["scope"]["phase1ClassificationRewritten"], False, f"Phase 1 rewrite {record['id']}")

            records.append((path, record))

        counts = Counter(record["decision"]["result"] for _, record in records)
        disposition_counts = Counter(record["disposition"] for _, record in records)

        manifest_records = [
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

        manifest = {
            "schemaVersion": 1,
            "stage": "2.14",
            "status": (
                "execution-complete"
                if len(records) == EXPECTED_PLANNED
                else "execution-in-progress"
            ),
            "policyVersion": policy["policyVersion"],
            "profile": {
                "id": profile["id"],
                "version": profile["version"],
                "status": profile["status"],
            },
            "summary": {
                "plannedDecisions": EXPECTED_PLANNED,
                "adjudicationRecords": len(records),
                "approved": counts["approved"],
                "deferred": counts["deferred"],
                "unadjudicated": EXPECTED_PLANNED - len(records),
                "promotionEligible": 0,
                "normativeRulesCreated": 0,
                "dispositionCounts": dict(sorted(disposition_counts.items())),
            },
            "inputs": {
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
            "records": manifest_records,
        }

        write_json(MANIFEST, manifest)

        print("Phase 2.14 adjudications materialized.")
        print(f"Planned decisions          : {EXPECTED_PLANNED}")
        print(f"Adjudication records       : {len(records)}")
        print(f"Approved                   : {counts['approved']}")
        print(f"Deferred                   : {counts['deferred']}")
        print(f"Unadjudicated              : {EXPECTED_PLANNED - len(records)}")
        print("Promotion eligible         : 0")
        print("Normative rules created    : 0")
        print(f"Manifest status            : {manifest['status']}")
        if disposition_counts:
            print("")
            print("Disposition counts:")
            for disposition, count in sorted(disposition_counts.items()):
                print(f"  {disposition:<28}: {count}")
        print("")
        print(f"Manifest SHA-256           : {sha256(MANIFEST)}")
        return 0

    except MaterializationError as exc:
        print("Phase 2.14 adjudication materialization: FAIL")
        print(str(exc))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
