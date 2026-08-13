from __future__ import annotations

from collections import Counter
from pathlib import Path
import hashlib
import json

from jsonschema import Draft202012Validator, FormatChecker
from jsonschema.exceptions import SchemaError

ROOT = Path(__file__).resolve().parents[2]

SCHEMA = ROOT / "spec" / "fa-ir" / "schema" / "candidate-admission.schema.json"
POLICY = (
    ROOT
    / "spec"
    / "fa-ir"
    / "governance"
    / "adjudicated-candidate-admission-policy.json"
)
MANIFEST = (
    ROOT
    / "spec"
    / "fa-ir"
    / "adjudications"
    / "candidate-admission-manifest.json"
)
ADJ_MANIFEST = ROOT / "spec" / "fa-ir" / "adjudications" / "manifest.json"
ADJ_RECORD_DIR = ROOT / "spec" / "fa-ir" / "adjudications" / "records"
ADJ_POLICY = ROOT / "spec" / "fa-ir" / "governance" / "adjudication-policy.json"
PROMOTION_POLICY = (
    ROOT / "spec" / "fa-ir" / "governance" / "normative-promotion-policy.json"
)
PROFILE = ROOT / "spec" / "fa-ir" / "profiles" / "fa-ir-g1.json"

EXPECTED_DISPOSITIONS = {
    "accept-context-rule": 6,
    "accept-layout-policy": 27,
    "accept-mode-rule": 5,
    "accept-normalization": 1,
    "accept-rule": 100,
}

EXPECTED_TARGET_TYPES = {
    "character": 99,
    "context": 6,
    "layout": 27,
    "mode": 5,
    "normalization": 1,
    "sequence": 1,
}

ELIGIBLE_DISPOSITIONS = {
    "accept-rule": {"character", "sequence"},
    "accept-normalization": {"normalization"},
    "accept-context-rule": {"context"},
    "accept-mode-rule": {"mode"},
    "accept-layout-policy": {"layout"},
}


class AdmissionValidationError(RuntimeError):
    pass


def rel(path: Path) -> str:
    return str(path.relative_to(ROOT)).replace("\\", "/")


def read_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise AdmissionValidationError(
            f"Missing required file: {rel(path)}"
        ) from exc
    except json.JSONDecodeError as exc:
        raise AdmissionValidationError(
            f"Invalid JSON: {rel(path)}:{exc.lineno}:{exc.colno}: {exc.msg}"
        ) from exc


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest().upper()


def expect_equal(actual, expected, label: str) -> None:
    if actual != expected:
        raise AdmissionValidationError(
            f"{label}: expected={expected!r}, actual={actual!r}"
        )


def expect(condition: bool, label: str) -> None:
    if not condition:
        raise AdmissionValidationError(label)


def eligible_record(record: dict) -> bool:
    materialization = record["materialization"]
    return (
        record["decision"]["result"] == "approved"
        and record["disposition"] in ELIGIBLE_DISPOSITIONS
        and materialization["createsSpecificationArtifact"] is True
        and materialization["requiresFuturePromotionGovernance"] is True
        and materialization["promotionEligible"] is False
        and record["scope"]["projectNormativeRule"] is False
        and record["scope"]["officialIranianStandardClaim"] is False
        and record["scope"]["phase1ClassificationRewritten"] is False
    )


def main() -> int:
    try:
        schema = read_json(SCHEMA)
        policy = read_json(POLICY)
        manifest = read_json(MANIFEST)
        adjudication_manifest = read_json(ADJ_MANIFEST)
        adjudication_policy = read_json(ADJ_POLICY)
        promotion_policy = read_json(PROMOTION_POLICY)
        profile = read_json(PROFILE)

        try:
            Draft202012Validator.check_schema(schema)
        except SchemaError as exc:
            raise AdmissionValidationError(
                f"Invalid candidate-admission schema: {exc.message}"
            ) from exc

        errors = sorted(
            Draft202012Validator(
                schema,
                format_checker=FormatChecker(),
            ).iter_errors(manifest),
            key=lambda error: list(error.path),
        )
        if errors:
            first = errors[0]
            location = "/".join(str(part) for part in first.absolute_path)
            suffix = f" at {location}" if location else ""
            raise AdmissionValidationError(
                f"Manifest schema validation failed{suffix}: {first.message}"
            )

        expect_equal(policy["policyVersion"], "1.0.0", "Admission policy version")
        expect_equal(policy["stage"], "2.14", "Admission policy stage")
        expect_equal(
            policy["authority"]["source"],
            "approved-adjudication-record",
            "Candidate-admission authority source",
        )
        expect_equal(
            policy["authority"][
                "additionalMaintainerDecisionRequiredForCandidateAdmission"
            ],
            False,
            "Additional candidate-admission decision",
        )
        expect_equal(
            policy["authority"]["ciMayInventCandidateAdmission"],
            False,
            "CI admission invention boundary",
        )
        expect_equal(
            policy["admission"]["targetRuleStatus"],
            "candidate",
            "Candidate admission target status",
        )
        expect_equal(
            policy["admission"]["candidateMaterializationIsNormativePromotion"],
            False,
            "Candidate/normative separation",
        )
        expect_equal(
            policy["admission"]["candidateMaterializationMaySetPromotionEligible"],
            False,
            "Candidate promotion-eligibility boundary",
        )
        expect_equal(
            policy["promotionBoundary"][
                "separateNormativePromotionRecordRequired"
            ],
            True,
            "Separate normative promotion record",
        )
        expect_equal(
            policy["promotionBoundary"]["thisPolicyBroadensNormativePromotionEligibility"],
            False,
            "Normative eligibility broadening",
        )
        expect_equal(
            policy["scope"]["officialIranianStandardClaim"],
            False,
            "Official Iranian standard claim policy",
        )
        expect_equal(
            policy["satisfies"]["candidateMaterializationRouteProvided"],
            True,
            "Candidate materialization route",
        )
        expect_equal(
            policy["satisfies"]["normativePromotionRouteProvided"],
            False,
            "Normative route must remain unprovided",
        )

        # Current normative promotion policy must remain the Phase 2.5 baseline.
        expect_equal(
            promotion_policy["policyVersion"],
            "1.0.0",
            "Normative promotion policy version",
        )
        expect_equal(
            promotion_policy["promotion"]["eligiblePhase1Classifications"],
            ["CONSENSUS-CANDIDATE"],
            "Normative promotion Phase 1 eligibility",
        )
        expect_equal(
            promotion_policy["promotion"]["automaticPromotionAllowed"],
            False,
            "Automatic normative promotion",
        )
        expect_equal(
            promotion_policy["promotion"]["ciPassAloneMayPromote"],
            False,
            "CI-only normative promotion",
        )

        expect_equal(profile["status"], "draft", "Profile status")
        expect_equal(
            adjudication_manifest["status"],
            "execution-complete",
            "Adjudication execution status",
        )
        expect_equal(
            adjudication_policy["promotionBoundary"][
                "futureGovernanceRouteRequiredForAcceptedRuleMaterialization"
            ],
            True,
            "Original route requirement",
        )

        record_paths = sorted(ADJ_RECORD_DIR.glob("*.json"))
        expect_equal(len(record_paths), 253, "Adjudication record count")

        records_by_id = {}
        expected_eligible = {}
        approved_non_materializable = 0
        deferred = 0

        for path in record_paths:
            record = read_json(path)
            records_by_id[record["id"]] = (path, record)

            if record["decision"]["result"] == "deferred":
                deferred += 1
                continue

            if eligible_record(record):
                expected_eligible[record["id"]] = (path, record)
            else:
                approved_non_materializable += 1

        expect_equal(len(expected_eligible), 139, "Derived eligible record count")
        expect_equal(
            approved_non_materializable,
            14,
            "Derived approved non-materializable count",
        )
        expect_equal(deferred, 100, "Derived deferred count")

        entries = manifest["entries"]
        expect_equal(len(entries), 139, "Manifest eligible entry count")
        expect_equal(
            len({row["adjudicationRecordId"] for row in entries}),
            139,
            "Unique admission record references",
        )
        expect_equal(
            len({row["decisionItemId"] for row in entries}),
            139,
            "Unique admission decision references",
        )

        entry_ids = {row["adjudicationRecordId"] for row in entries}
        expect_equal(
            entry_ids,
            set(expected_eligible),
            "Admission manifest exact eligibility coverage",
        )

        for entry in entries:
            path, record = expected_eligible[entry["adjudicationRecordId"]]

            expect_equal(
                entry["adjudicationRecordPath"],
                rel(path),
                f"Adjudication record path {entry['decisionItemId']}",
            )
            expect_equal(
                entry["adjudicationRecordSha256"],
                sha256(path),
                f"Adjudication record hash {entry['decisionItemId']}",
            )
            expect_equal(
                entry["decisionItemId"],
                record["decisionItemId"],
                f"Decision identity {entry['adjudicationRecordId']}",
            )
            expect_equal(
                entry["phase1Classification"],
                record["phase1Classification"],
                f"Phase 1 classification {entry['decisionItemId']}",
            )
            expect_equal(
                entry["disposition"],
                record["disposition"],
                f"Disposition {entry['decisionItemId']}",
            )
            expect_equal(
                entry["targetRuleType"],
                record["materialization"]["targetRuleType"],
                f"Target rule type {entry['decisionItemId']}",
            )
            expect(
                entry["targetRuleType"]
                in ELIGIBLE_DISPOSITIONS[entry["disposition"]],
                f"Disposition/target mismatch {entry['decisionItemId']}",
            )
            expect_equal(
                entry["evidencePacketPath"],
                record["basis"]["evidencePacketPath"],
                f"Evidence packet path {entry['decisionItemId']}",
            )
            expect_equal(
                entry["evidencePacketSha256"],
                record["basis"]["evidencePacketSha256"],
                f"Evidence packet hash {entry['decisionItemId']}",
            )
            expect_equal(
                entry["candidateRuleId"],
                None,
                f"Premature candidate rule ID {entry['decisionItemId']}",
            )
            expect_equal(
                entry["conformanceVectorIds"],
                [],
                f"Premature conformance IDs {entry['decisionItemId']}",
            )
            expect_equal(
                entry["promotionEligible"],
                False,
                f"Premature promotion eligibility {entry['decisionItemId']}",
            )
            expect_equal(
                entry["normativePromotionAuthorized"],
                False,
                f"Premature normative promotion {entry['decisionItemId']}",
            )

        disposition_counts = Counter(row["disposition"] for row in entries)
        type_counts = Counter(row["targetRuleType"] for row in entries)
        expect_equal(
            dict(sorted(disposition_counts.items())),
            EXPECTED_DISPOSITIONS,
            "Admission disposition counts",
        )
        expect_equal(
            dict(sorted(type_counts.items())),
            EXPECTED_TARGET_TYPES,
            "Admission target-type counts",
        )

        # Input hashes make the route auditable and reproducible.
        expected_inputs = {
            "adjudicationManifest": ADJ_MANIFEST,
            "adjudicationPolicy": ADJ_POLICY,
            "normativePromotionPolicy": PROMOTION_POLICY,
            "profile": PROFILE,
        }
        for key, path in expected_inputs.items():
            expect_equal(
                manifest["inputs"][key]["path"],
                rel(path),
                f"Input path {key}",
            )
            expect_equal(
                manifest["inputs"][key]["sha256"],
                sha256(path),
                f"Input hash {key}",
            )

        print("Phase 2.14 adjudicated candidate-admission validation: PASS")
        print("adjudicationRecords              : 253")
        print("candidateAdmissionEligible       : 139")
        print("approvedNonMaterializable        : 14")
        print("deferred                         : 100")
        print("candidateTargetStatus            : candidate")
        print("candidateArtifactsMaterialized   : 0")
        print("promotionEligible                : 0")
        print("normativePromotionAuthorized     : 0")
        print("profileStatus                    : draft")
        print("semanticErrors                   : 0")
        return 0

    except AdmissionValidationError as exc:
        print("Phase 2.14 adjudicated candidate-admission validation: FAIL")
        print("semanticErrors                   : 1")
        print(f"ERROR: {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
