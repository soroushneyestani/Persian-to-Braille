from __future__ import annotations

from collections import Counter
from pathlib import Path
import hashlib
import json

ROOT = Path(__file__).resolve().parents[2]

ADJ_MANIFEST = ROOT / "spec" / "fa-ir" / "adjudications" / "manifest.json"
ADJ_RECORD_DIR = ROOT / "spec" / "fa-ir" / "adjudications" / "records"
ADJ_POLICY = ROOT / "spec" / "fa-ir" / "governance" / "adjudication-policy.json"
PROMOTION_POLICY = (
    ROOT / "spec" / "fa-ir" / "governance" / "normative-promotion-policy.json"
)
PROFILE = ROOT / "spec" / "fa-ir" / "profiles" / "fa-ir-g1.json"

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
DOC = (
    ROOT
    / "docs"
    / "specification"
    / "phase-2.14-adjudicated-candidate-admission.md"
)

SCHEMA_VERSION = 1
POLICY_VERSION = "1.0.0"
EXPECTED_RECORDS = 253
EXPECTED_APPROVED = 153
EXPECTED_DEFERRED = 100
EXPECTED_ELIGIBLE = 138
EXPECTED_EXCLUDED_APPROVED = 15

ELIGIBLE_DISPOSITIONS = {
    "accept-rule": {"character", "sequence"},
    "accept-normalization": {"normalization"},
    "accept-context-rule": {"context"},
    "accept-mode-rule": {"mode"},
    "accept-layout-policy": {"layout"},
}

EXPECTED_DISPOSITIONS = {
    "accept-context-rule": 6,
    "accept-layout-policy": 27,
    "accept-mode-rule": 5,
    "accept-normalization": 1,
    "accept-rule": 99,
}

EXPECTED_TARGET_TYPES = {
    "character": 98,
    "context": 6,
    "layout": 27,
    "mode": 5,
    "normalization": 1,
    "sequence": 1,
}


class AdmissionBuildError(RuntimeError):
    pass


def rel(path: Path) -> str:
    return str(path.relative_to(ROOT)).replace("\\", "/")


def read_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise AdmissionBuildError(f"Missing required file: {rel(path)}") from exc
    except json.JSONDecodeError as exc:
        raise AdmissionBuildError(
            f"Invalid JSON: {rel(path)}:{exc.lineno}:{exc.colno}: {exc.msg}"
        ) from exc


def write_json(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        handle.write(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def write_text(path: Path, value: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        handle.write(value.rstrip() + "\n")


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest().upper()


def expect_equal(actual, expected, label: str) -> None:
    if actual != expected:
        raise AdmissionBuildError(
            f"{label}: expected={expected!r}, actual={actual!r}"
        )


def expect(condition: bool, label: str) -> None:
    if not condition:
        raise AdmissionBuildError(label)


def build_schema() -> dict:
    return {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "$id": (
            "https://soroushneyestani.github.io/Persian-to-Braille/"
            "spec/fa-ir/schema/candidate-admission.schema.json"
        ),
        "title": "Persian Braille Adjudicated Candidate Admission Manifest",
        "description": (
            "Machine-readable bridge from explicitly approved Phase 2.14 "
            "adjudications to future candidate specification materialization. "
            "Admission is not normative promotion."
        ),
        "type": "object",
        "additionalProperties": False,
        "required": [
            "schemaVersion",
            "stage",
            "status",
            "policyVersion",
            "profile",
            "summary",
            "governanceBoundary",
            "inputs",
            "entries",
        ],
        "properties": {
            "schemaVersion": {"type": "integer", "const": SCHEMA_VERSION},
            "stage": {"type": "string", "const": "2.14"},
            "status": {"type": "string", "const": "route-ready"},
            "policyVersion": {"type": "string", "const": POLICY_VERSION},
            "profile": {
                "type": "object",
                "additionalProperties": False,
                "required": ["id", "status"],
                "properties": {
                    "id": {"type": "string", "const": "fa-ir-g1"},
                    "status": {"type": "string", "const": "draft"},
                },
            },
            "summary": {
                "type": "object",
                "additionalProperties": False,
                "required": [
                    "adjudicationRecords",
                    "approved",
                    "deferred",
                    "candidateAdmissionEligible",
                    "approvedNonMaterializable",
                    "normativePromotionAuthorized",
                    "promotionEligible",
                    "candidateArtifactsMaterialized",
                ],
                "properties": {
                    "adjudicationRecords": {
                        "type": "integer",
                        "const": EXPECTED_RECORDS,
                    },
                    "approved": {"type": "integer", "const": EXPECTED_APPROVED},
                    "deferred": {"type": "integer", "const": EXPECTED_DEFERRED},
                    "candidateAdmissionEligible": {
                        "type": "integer",
                        "const": EXPECTED_ELIGIBLE,
                    },
                    "approvedNonMaterializable": {
                        "type": "integer",
                        "const": EXPECTED_EXCLUDED_APPROVED,
                    },
                    "normativePromotionAuthorized": {
                        "type": "integer",
                        "const": 0,
                    },
                    "promotionEligible": {"type": "integer", "const": 0},
                    "candidateArtifactsMaterialized": {
                        "type": "integer",
                        "const": 0,
                    },
                },
            },
            "governanceBoundary": {
                "type": "object",
                "additionalProperties": False,
                "required": [
                    "admissionTargetStatus",
                    "admissionIsNormativePromotion",
                    "phase1ClassificationRewritten",
                    "officialIranianStandardClaim",
                    "separatePromotionRecordRequired",
                    "profileStatusChangesAutomatically",
                ],
                "properties": {
                    "admissionTargetStatus": {
                        "type": "string",
                        "const": "candidate",
                    },
                    "admissionIsNormativePromotion": {
                        "type": "boolean",
                        "const": False,
                    },
                    "phase1ClassificationRewritten": {
                        "type": "boolean",
                        "const": False,
                    },
                    "officialIranianStandardClaim": {
                        "type": "boolean",
                        "const": False,
                    },
                    "separatePromotionRecordRequired": {
                        "type": "boolean",
                        "const": True,
                    },
                    "profileStatusChangesAutomatically": {
                        "type": "boolean",
                        "const": False,
                    },
                },
            },
            "inputs": {
                "type": "object",
                "additionalProperties": False,
                "required": [
                    "adjudicationManifest",
                    "adjudicationPolicy",
                    "normativePromotionPolicy",
                    "profile",
                ],
                "properties": {
                    key: {
                        "type": "object",
                        "additionalProperties": False,
                        "required": ["path", "sha256"],
                        "properties": {
                            "path": {"type": "string", "minLength": 1},
                            "sha256": {
                                "type": "string",
                                "pattern": r"^[0-9A-F]{64}$",
                            },
                        },
                    }
                    for key in (
                        "adjudicationManifest",
                        "adjudicationPolicy",
                        "normativePromotionPolicy",
                        "profile",
                    )
                },
            },
            "entries": {
                "type": "array",
                "minItems": EXPECTED_ELIGIBLE,
                "maxItems": EXPECTED_ELIGIBLE,
                "items": {
                    "type": "object",
                    "additionalProperties": False,
                    "required": [
                        "adjudicationRecordId",
                        "adjudicationRecordPath",
                        "adjudicationRecordSha256",
                        "decisionItemId",
                        "phase1Classification",
                        "disposition",
                        "targetRuleType",
                        "targetStatus",
                        "candidateMaterializationAuthorized",
                        "candidateRuleId",
                        "conformanceVectorIds",
                        "promotionEligible",
                        "normativePromotionAuthorized",
                        "requiresSeparatePromotionRecord",
                        "evidencePacketPath",
                        "evidencePacketSha256",
                    ],
                    "properties": {
                        "adjudicationRecordId": {
                            "type": "string",
                            "pattern": r"^FA-ADJ-[A-Z0-9][A-Z0-9-]*$",
                        },
                        "adjudicationRecordPath": {
                            "type": "string",
                            "minLength": 1,
                        },
                        "adjudicationRecordSha256": {
                            "type": "string",
                            "pattern": r"^[0-9A-F]{64}$",
                        },
                        "decisionItemId": {
                            "type": "string",
                            "pattern": r"^FA-[A-Z0-9][A-Z0-9-]*$",
                        },
                        "phase1Classification": {
                            "type": "string",
                            "enum": ["REVIEW-REQUIRED", "UNRESOLVED"],
                        },
                        "disposition": {
                            "type": "string",
                            "enum": sorted(ELIGIBLE_DISPOSITIONS),
                        },
                        "targetRuleType": {
                            "type": "string",
                            "enum": [
                                "character",
                                "sequence",
                                "context",
                                "normalization",
                                "mode",
                                "layout",
                            ],
                        },
                        "targetStatus": {
                            "type": "string",
                            "const": "candidate",
                        },
                        "candidateMaterializationAuthorized": {
                            "type": "boolean",
                            "const": True,
                        },
                        "candidateRuleId": {"type": "null"},
                        "conformanceVectorIds": {
                            "type": "array",
                            "maxItems": 0,
                        },
                        "promotionEligible": {
                            "type": "boolean",
                            "const": False,
                        },
                        "normativePromotionAuthorized": {
                            "type": "boolean",
                            "const": False,
                        },
                        "requiresSeparatePromotionRecord": {
                            "type": "boolean",
                            "const": True,
                        },
                        "evidencePacketPath": {
                            "type": "string",
                            "minLength": 1,
                        },
                        "evidencePacketSha256": {
                            "type": "string",
                            "pattern": r"^[0-9A-F]{64}$",
                        },
                    },
                },
            },
        },
    }


def build_policy(
    adjudication_policy: dict,
    promotion_policy: dict,
) -> dict:
    return {
        "schemaVersion": 1,
        "policyVersion": POLICY_VERSION,
        "stage": "2.14",
        "title": "Persian-to-Braille Adjudicated Candidate Admission Policy",
        "purpose": (
            "Provide the explicit governance route required by Phase 2.14 for "
            "approved adjudications that are authorized to create specification "
            "artifacts, without rewriting Phase 1 classifications and without "
            "performing normative promotion."
        ),
        "authority": {
            "source": "approved-adjudication-record",
            "additionalMaintainerDecisionRequiredForCandidateAdmission": False,
            "reason": (
                "The Phase 2.14 adjudication record is already the explicit "
                "project-maintainer decision authorizing specification artifact "
                "creation. CI may reproduce that authorized candidate state but "
                "may not invent a new admission decision."
            ),
            "ciMayReproduceApprovedCandidateMaterialization": True,
            "ciMayInventCandidateAdmission": False,
        },
        "eligibility": {
            "decisionResult": "approved",
            "createsSpecificationArtifact": True,
            "requiresFuturePromotionGovernance": True,
            "promotionEligibleBeforeAdmission": False,
            "projectNormativeBeforeAdmission": False,
            "officialIranianStandardClaim": False,
            "phase1ClassificationMayBeRewritten": False,
            "eligibleDispositions": {
                disposition: sorted(target_types)
                for disposition, target_types in ELIGIBLE_DISPOSITIONS.items()
            },
        },
        "admission": {
            "targetRuleStatus": "candidate",
            "candidateMaterializationIsNormativePromotion": False,
            "candidateMaterializationMaySetPromotionEligible": False,
            "candidateMaterializationMayChangeProfileStatus": False,
            "candidateMaterializationRequiresDraftConformanceCoverage": True,
            "candidateMaterializationRequiresSixDotProfileCompatibility": True,
            "candidateMaterializationMustPreserveEvidencePacketProvenance": True,
            "candidateRuleIdsAssignedAtMaterialization": True,
        },
        "promotionBoundary": {
            "separateNormativePromotionRecordRequired": True,
            "automaticNormativePromotionAllowed": False,
            "ciPassAloneMayPromote": False,
            "currentPromotionPolicyVersion": promotion_policy["policyVersion"],
            "currentPromotionPolicyEligiblePhase1Classifications": (
                promotion_policy["promotion"]["eligiblePhase1Classifications"]
            ),
            "reviewRequiredCoveredByCurrentNormativePromotionPolicy": False,
            "unresolvedCoveredByCurrentNormativePromotionPolicy": False,
            "thisPolicyBroadensNormativePromotionEligibility": False,
            "note": (
                "This route ends at candidate status. A later explicit promotion "
                "governance change is required before any REVIEW-REQUIRED or "
                "UNRESOLVED-derived candidate can become project-normative."
            ),
        },
        "profileBoundary": {
            "profileId": "fa-ir-g1",
            "profileRemainsDraft": True,
            "candidateAdmissionDoesNotClaimProfileCompleteness": True,
        },
        "scope": {
            "projectSpecificationOnly": True,
            "officialIranianStandardClaim": False,
        },
        "satisfies": {
            "adjudicationPolicyVersion": adjudication_policy["policyVersion"],
            "requirement": (
                "futureGovernanceRouteRequiredForAcceptedRuleMaterialization"
            ),
            "candidateMaterializationRouteProvided": True,
            "normativePromotionRouteProvided": False,
        },
    }


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
        adjudication_manifest = read_json(ADJ_MANIFEST)
        adjudication_policy = read_json(ADJ_POLICY)
        promotion_policy = read_json(PROMOTION_POLICY)
        profile = read_json(PROFILE)

        record_paths = sorted(ADJ_RECORD_DIR.glob("*.json"))
        records = [(path, read_json(path)) for path in record_paths]

        expect_equal(len(records), EXPECTED_RECORDS, "Adjudication record count")
        expect_equal(
            adjudication_manifest["status"],
            "execution-complete",
            "Adjudication execution status",
        )
        expect_equal(
            adjudication_manifest["summary"]["approved"],
            EXPECTED_APPROVED,
            "Approved adjudication count",
        )
        expect_equal(
            adjudication_manifest["summary"]["deferred"],
            EXPECTED_DEFERRED,
            "Deferred adjudication count",
        )
        expect_equal(profile["id"], "fa-ir-g1", "Profile ID")
        expect_equal(profile["status"], "draft", "Profile status")

        # Preserve the current Phase 2.5/2.6 normative boundary exactly.
        expect_equal(
            promotion_policy["policyVersion"],
            "1.0.0",
            "Current normative promotion policy version",
        )
        expect_equal(
            promotion_policy["promotion"]["eligiblePhase1Classifications"],
            ["CONSENSUS-CANDIDATE"],
            "Current normative promotion eligibility",
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

        entries = []
        approved_non_materializable = 0
        deferred = 0

        for path, record in records:
            if record["decision"]["result"] == "deferred":
                deferred += 1
                continue

            if not eligible_record(record):
                approved_non_materializable += 1
                continue

            disposition = record["disposition"]
            target_type = record["materialization"]["targetRuleType"]
            expect(
                target_type in ELIGIBLE_DISPOSITIONS[disposition],
                (
                    f"Disposition/target-type mismatch for "
                    f"{record['decisionItemId']}: {disposition}/{target_type}"
                ),
            )

            entries.append(
                {
                    "adjudicationRecordId": record["id"],
                    "adjudicationRecordPath": rel(path),
                    "adjudicationRecordSha256": sha256(path),
                    "decisionItemId": record["decisionItemId"],
                    "phase1Classification": record["phase1Classification"],
                    "disposition": disposition,
                    "targetRuleType": target_type,
                    "targetStatus": "candidate",
                    "candidateMaterializationAuthorized": True,
                    "candidateRuleId": None,
                    "conformanceVectorIds": [],
                    "promotionEligible": False,
                    "normativePromotionAuthorized": False,
                    "requiresSeparatePromotionRecord": True,
                    "evidencePacketPath": record["basis"]["evidencePacketPath"],
                    "evidencePacketSha256": (
                        record["basis"]["evidencePacketSha256"]
                    ),
                }
            )

        entries.sort(key=lambda row: row["decisionItemId"])

        expect_equal(len(entries), EXPECTED_ELIGIBLE, "Eligible admission count")
        expect_equal(
            approved_non_materializable,
            EXPECTED_EXCLUDED_APPROVED,
            "Approved non-materializable count",
        )
        expect_equal(deferred, EXPECTED_DEFERRED, "Deferred exclusion count")

        disposition_counts = Counter(row["disposition"] for row in entries)
        type_counts = Counter(row["targetRuleType"] for row in entries)
        expect_equal(
            dict(sorted(disposition_counts.items())),
            EXPECTED_DISPOSITIONS,
            "Eligible disposition counts",
        )
        expect_equal(
            dict(sorted(type_counts.items())),
            EXPECTED_TARGET_TYPES,
            "Eligible target-type counts",
        )

        schema = build_schema()
        write_json(SCHEMA, schema)

        policy = build_policy(adjudication_policy, promotion_policy)
        write_json(POLICY, policy)

        manifest = {
            "schemaVersion": 1,
            "stage": "2.14",
            "status": "route-ready",
            "policyVersion": POLICY_VERSION,
            "profile": {
                "id": "fa-ir-g1",
                "status": "draft",
            },
            "summary": {
                "adjudicationRecords": EXPECTED_RECORDS,
                "approved": EXPECTED_APPROVED,
                "deferred": EXPECTED_DEFERRED,
                "candidateAdmissionEligible": EXPECTED_ELIGIBLE,
                "approvedNonMaterializable": EXPECTED_EXCLUDED_APPROVED,
                "normativePromotionAuthorized": 0,
                "promotionEligible": 0,
                "candidateArtifactsMaterialized": 0,
            },
            "governanceBoundary": {
                "admissionTargetStatus": "candidate",
                "admissionIsNormativePromotion": False,
                "phase1ClassificationRewritten": False,
                "officialIranianStandardClaim": False,
                "separatePromotionRecordRequired": True,
                "profileStatusChangesAutomatically": False,
            },
            "inputs": {
                "adjudicationManifest": {
                    "path": rel(ADJ_MANIFEST),
                    "sha256": sha256(ADJ_MANIFEST),
                },
                "adjudicationPolicy": {
                    "path": rel(ADJ_POLICY),
                    "sha256": sha256(ADJ_POLICY),
                },
                "normativePromotionPolicy": {
                    "path": rel(PROMOTION_POLICY),
                    "sha256": sha256(PROMOTION_POLICY),
                },
                "profile": {
                    "path": rel(PROFILE),
                    "sha256": sha256(PROFILE),
                },
            },
            "entries": entries,
        }
        write_json(MANIFEST, manifest)

        doc = f"""# Phase 2.14 — Adjudicated Candidate Admission

Phase 2.14 has completed adjudication for all 253 queued decisions.

This document defines the governance bridge for the **138 approved decisions**
whose adjudication records authorize creation of specification artifacts.

## Route

The route is:

`approved adjudication -> candidate artifact -> separate future promotion`

It is **not**:

`approved adjudication -> normative rule`

The existing Phase 2.5 normative-promotion policy remains unchanged and still
permits normative promotion only for Phase 1 `CONSENSUS-CANDIDATE` decisions.

## Current counts

- adjudication records: {EXPECTED_RECORDS}
- approved: {EXPECTED_APPROVED}
- deferred: {EXPECTED_DEFERRED}
- candidate-admission eligible: {EXPECTED_ELIGIBLE}
- approved but intentionally non-materializable: {EXPECTED_EXCLUDED_APPROVED}
- normative promotions authorized by this route: 0
- candidate artifacts materialized by this route definition: 0

## Eligible materialization types

- character: {EXPECTED_TARGET_TYPES['character']}
- sequence: {EXPECTED_TARGET_TYPES['sequence']}
- context: {EXPECTED_TARGET_TYPES['context']}
- normalization: {EXPECTED_TARGET_TYPES['normalization']}
- mode: {EXPECTED_TARGET_TYPES['mode']}
- layout: {EXPECTED_TARGET_TYPES['layout']}

## Authority

No second maintainer decision is required merely to create a **candidate**
artifact from one of these 138 records.

The explicit Phase 2.14 adjudication record already contains the maintainer
decision authorizing specification-artifact creation.

CI may reproduce that authorized candidate state. CI may not invent a new
admission decision.

## Normative boundary

Candidate admission:

- does not rewrite the historical Phase 1 classification;
- does not set `promotionEligible=true`;
- does not create a project-normative rule;
- does not claim current official Iranian-standard status;
- does not change the `fa-ir-g1` profile out of `draft`;
- does not bypass the existing normative-promotion policy.

Any later normative transition requires a separate explicit promotion
governance route and promotion record.

## Conformance boundary

When the 138 candidates are materialized, each must receive reciprocal draft
conformance coverage and must satisfy the six-dot `fa-ir-g1` profile.

Rule IDs and conformance-vector IDs are deliberately **not assigned by this
governance-route stage**. They become published stable identifiers only when
the candidate materialization is implemented.

## Deferred and non-materializable decisions

The 100 deferred decisions remain deferred.

The 15 approved but non-materializable decisions (`ignore-format-control`,
`explicitly-unsupported`, and `out-of-scope`) remain explicit project
decisions but do not create candidate rule artifacts.
"""
        write_text(DOC, doc)

        print("Phase 2.14 adjudicated candidate-admission route built.")
        print(f"Adjudication records          : {EXPECTED_RECORDS}")
        print(f"Approved                      : {EXPECTED_APPROVED}")
        print(f"Deferred                      : {EXPECTED_DEFERRED}")
        print(f"Candidate-admission eligible  : {EXPECTED_ELIGIBLE}")
        print(f"Approved non-materializable   : {EXPECTED_EXCLUDED_APPROVED}")
        print("Normative promotion authorized: 0")
        print("Promotion eligible            : 0")
        print("Candidate artifacts materialized: 0")
        print("")
        print("Target rule types:")
        for target_type, count in EXPECTED_TARGET_TYPES.items():
            print(f"  {target_type:<16}: {count}")
        print("")
        print(f"Schema SHA-256                : {sha256(SCHEMA)}")
        print(f"Policy SHA-256                : {sha256(POLICY)}")
        print(f"Manifest SHA-256              : {sha256(MANIFEST)}")
        print(f"Documentation SHA-256         : {sha256(DOC)}")
        return 0

    except AdmissionBuildError as exc:
        print("Phase 2.14 adjudicated candidate-admission build: FAIL")
        print(str(exc))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
