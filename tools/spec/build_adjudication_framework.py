from __future__ import annotations

from pathlib import Path
import hashlib
import json

ROOT = Path(__file__).resolve().parents[2]

PLAN = ROOT / "spec" / "fa-ir" / "governance" / "evidence-adjudication-plan.json"
PROFILE = ROOT / "spec" / "fa-ir" / "profiles" / "fa-ir-g1.json"
PROMOTION_POLICY = ROOT / "spec" / "fa-ir" / "governance" / "normative-promotion-policy.json"

SCHEMA = ROOT / "spec" / "fa-ir" / "schema" / "adjudication-record.schema.json"
POLICY = ROOT / "spec" / "fa-ir" / "governance" / "adjudication-policy.json"
MANIFEST = ROOT / "spec" / "fa-ir" / "adjudications" / "manifest.json"
DOC = ROOT / "docs" / "specification" / "phase-2.14-adjudication-framework.md"

EXPECTED_PLAN_ITEMS = 253

DISPOSITIONS = [
    "accept-rule",
    "accept-normalization",
    "accept-context-rule",
    "accept-mode-rule",
    "accept-layout-policy",
    "ignore-format-control",
    "explicitly-unsupported",
    "out-of-scope",
    "defer-pending-evidence",
]


class FrameworkError(RuntimeError):
    pass


def rel(path: Path) -> str:
    return str(path.relative_to(ROOT)).replace("\\", "/")


def read_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise FrameworkError(f"Missing required file: {rel(path)}") from exc
    except json.JSONDecodeError as exc:
        raise FrameworkError(
            f"Invalid JSON: {rel(path)}:{exc.lineno}:{exc.colno}: {exc.msg}"
        ) from exc


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


def expect(condition: bool, message: str) -> None:
    if not condition:
        raise FrameworkError(message)


def expect_equal(actual, expected, message: str) -> None:
    if actual != expected:
        raise FrameworkError(
            f"{message}: expected={expected!r}, actual={actual!r}"
        )


def build_schema() -> dict:
    return {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "$id": (
            "https://soroushneyestani.github.io/Persian-to-Braille/"
            "spec/fa-ir/schema/adjudication-record.schema.json"
        ),
        "title": "Persian Braille Evidence Adjudication Record",
        "description": (
            "Machine-readable project-maintainer decision for one Phase 2.13 "
            "adjudication-plan item. Adjudication is separate from normative "
            "promotion."
        ),
        "type": "object",
        "additionalProperties": False,
        "required": [
            "schemaVersion",
            "id",
            "policyVersion",
            "profileId",
            "decisionItemId",
            "queueId",
            "packetId",
            "planItemId",
            "phase1Classification",
            "track",
            "disposition",
            "decision",
            "basis",
            "materialization",
            "scope",
            "rationale",
        ],
        "properties": {
            "schemaVersion": {"type": "integer", "const": 1},
            "id": {
                "type": "string",
                "pattern": "^FA-ADJ-[A-Z0-9]+(?:-[A-Z0-9]+)*-\\d{3,}$",
            },
            "policyVersion": {"type": "string", "const": "1.0.0"},
            "profileId": {"type": "string", "const": "fa-ir-g1"},
            "decisionItemId": {
                "type": "string",
                "pattern": "^FA-[A-Z0-9][A-Z0-9-]*$",
            },
            "queueId": {
                "type": "string",
                "pattern": "^FA-REVIEW-\\d{3,}$",
            },
            "packetId": {
                "type": "string",
                "pattern": "^FA-EVIDENCE-\\d{3,}$",
            },
            "planItemId": {
                "type": "string",
                "pattern": "^FA-ADJ-PLAN-\\d{3,}$",
            },
            "phase1Classification": {
                "type": "string",
                "enum": ["REVIEW-REQUIRED", "UNRESOLVED"],
            },
            "track": {
                "type": "string",
                "enum": [
                    "unresolved",
                    "evidence-gap",
                    "implementation-conflict",
                    "implementation-alignment",
                ],
            },
            "disposition": {
                "type": "string",
                "enum": DISPOSITIONS,
            },
            "decision": {
                "type": "object",
                "additionalProperties": False,
                "required": [
                    "result",
                    "authority",
                    "recordedBy",
                    "recordedAt",
                ],
                "properties": {
                    "result": {
                        "type": "string",
                        "enum": ["approved", "deferred"],
                    },
                    "authority": {
                        "type": "string",
                        "const": "project-maintainer",
                    },
                    "recordedBy": {
                        "type": "string",
                        "minLength": 1,
                    },
                    "recordedAt": {
                        "type": ["string", "null"],
                        "format": "date-time",
                        "description": (
                            "Optional audit timestamp. Generators must never "
                            "invent or auto-update it."
                        ),
                    },
                },
            },
            "basis": {
                "type": "object",
                "additionalProperties": False,
                "required": [
                    "evidencePacketPath",
                    "evidencePacketSha256",
                    "sourceIds",
                    "stableDraftRelationship",
                    "unresolvedEvidenceGaps",
                ],
                "properties": {
                    "evidencePacketPath": {
                        "type": "string",
                        "minLength": 1,
                    },
                    "evidencePacketSha256": {
                        "type": "string",
                        "pattern": "^[A-F0-9]{64}$",
                    },
                    "sourceIds": {
                        "type": "array",
                        "items": {
                            "type": "string",
                            "pattern": "^SRC-[A-Z0-9][A-Z0-9-]*$",
                        },
                        "uniqueItems": True,
                    },
                    "stableDraftRelationship": {
                        "type": "string",
                        "enum": [
                            "same-observed-behavior",
                            "different-observed-behavior",
                            "insufficient-data",
                        ],
                    },
                    "unresolvedEvidenceGaps": {
                        "type": "array",
                        "items": {"type": "string", "minLength": 1},
                        "uniqueItems": True,
                    },
                },
            },
            "materialization": {
                "type": "object",
                "additionalProperties": False,
                "required": [
                    "kind",
                    "createsSpecificationArtifact",
                    "targetRuleType",
                    "promotionEligible",
                    "requiresFuturePromotionGovernance",
                ],
                "properties": {
                    "kind": {
                        "type": "string",
                        "enum": [
                            "rule",
                            "normalization",
                            "context-rule",
                            "mode-rule",
                            "layout-policy",
                            "ignore",
                            "unsupported",
                            "out-of-scope",
                            "deferred",
                        ],
                    },
                    "createsSpecificationArtifact": {"type": "boolean"},
                    "targetRuleType": {
                        "type": ["string", "null"],
                        "enum": [
                            None,
                            "character",
                            "sequence",
                            "context",
                            "normalization",
                            "mode",
                            "layout",
                        ],
                    },
                    "promotionEligible": {
                        "type": "boolean",
                        "const": False,
                    },
                    "requiresFuturePromotionGovernance": {
                        "type": "boolean",
                    },
                },
            },
            "scope": {
                "type": "object",
                "additionalProperties": False,
                "required": [
                    "projectSpecificationDecision",
                    "projectNormativeRule",
                    "officialIranianStandardClaim",
                    "phase1ClassificationRewritten",
                ],
                "properties": {
                    "projectSpecificationDecision": {
                        "type": "boolean",
                        "const": True,
                    },
                    "projectNormativeRule": {
                        "type": "boolean",
                        "const": False,
                    },
                    "officialIranianStandardClaim": {
                        "type": "boolean",
                        "const": False,
                    },
                    "phase1ClassificationRewritten": {
                        "type": "boolean",
                        "const": False,
                    },
                },
            },
            "rationale": {
                "type": "string",
                "minLength": 1,
            },
        },
        "allOf": [
            {
                "if": {
                    "properties": {
                        "disposition": {"const": "defer-pending-evidence"}
                    }
                },
                "then": {
                    "properties": {
                        "decision": {
                            "properties": {
                                "result": {"const": "deferred"}
                            }
                        },
                        "materialization": {
                            "properties": {
                                "kind": {"const": "deferred"},
                                "createsSpecificationArtifact": {"const": False},
                                "targetRuleType": {"const": None},
                            }
                        },
                    }
                },
            },
            {
                "if": {
                    "properties": {
                        "disposition": {
                            "enum": [
                                "explicitly-unsupported",
                                "out-of-scope",
                                "ignore-format-control",
                            ]
                        }
                    }
                },
                "then": {
                    "properties": {
                        "decision": {
                            "properties": {
                                "result": {"const": "approved"}
                            }
                        }
                    }
                },
            },
        ],
    }


def build_policy(plan: dict, promotion_policy: dict) -> dict:
    promotion_policy_version = promotion_policy.get(
        "policyVersion",
        promotion_policy.get("version"),
    )

    return {
        "schemaVersion": 1,
        "policyVersion": "1.0.0",
        "title": "Persian-to-Braille Evidence Adjudication Policy",
        "stage": "2.14",
        "scope": {
            "profileId": "fa-ir-g1",
            "plannedDecisionCount": EXPECTED_PLAN_ITEMS,
            "projectSpecificationOnly": True,
            "officialIranianStandardClaim": False,
        },
        "authority": {
            "required": "project-maintainer",
            "explicitDecisionRequired": True,
            "automaticAdjudicationAllowed": False,
            "ciPassAloneMayAdjudicate": False,
            "batchDecisionsAllowed": True,
            "individualDecisionRecordsRequiredInBatch": True,
        },
        "immutability": {
            "phase1ClassificationMayBeRewritten": False,
            "evidencePacketsMayBeMutatedByAdjudication": False,
            "phase213PlanMayBeMutatedByExecution": False,
        },
        "dispositions": {
            "allowed": DISPOSITIONS,
            "deferredDisposition": "defer-pending-evidence",
            "acceptedDispositions": [
                disposition
                for disposition in DISPOSITIONS
                if disposition != "defer-pending-evidence"
            ],
        },
        "promotionBoundary": {
            "adjudicationIsNormativePromotion": False,
            "adjudicationMayDirectlyCreateNormativeRule": False,
            "adjudicationMaySetPromotionEligible": False,
            "currentPromotionPolicyVersion": promotion_policy_version,
            "currentPromotionPolicyEligiblePhase1Classifications": (
                promotion_policy.get("promotion", {})
                .get("eligiblePhase1Classifications", [])
            ),
            "reviewRequiredCoveredByCurrentPromotionPolicy": False,
            "unresolvedCoveredByCurrentPromotionPolicy": False,
            "futureGovernanceRouteRequiredForAcceptedRuleMaterialization": True,
        },
        "recordRequirements": {
            "schema": rel(SCHEMA),
            "oneRecordPerDecisionItem": True,
            "evidencePacketHashMustMatch": True,
            "recordedAtMayBeNull": True,
            "generatorMayInventTimestamp": False,
            "rationaleRequired": True,
            "sourceTraceabilityRequired": True,
        },
        "inputs": {
            "adjudicationPlan": {
                "path": rel(PLAN),
                "sha256": sha256(PLAN),
            },
            "profile": {
                "path": rel(PROFILE),
                "sha256": sha256(PROFILE),
            },
            "normativePromotionPolicy": {
                "path": rel(PROMOTION_POLICY),
                "sha256": sha256(PROMOTION_POLICY),
            },
        },
    }


def build_manifest(plan: dict, policy: dict) -> dict:
    return {
        "schemaVersion": 1,
        "stage": "2.14",
        "status": "framework-ready",
        "policyVersion": policy["policyVersion"],
        "profile": {
            "id": plan["profile"]["id"],
            "version": plan["profile"]["version"],
            "status": plan["profile"]["status"],
        },
        "summary": {
            "plannedDecisions": EXPECTED_PLAN_ITEMS,
            "adjudicationRecords": 0,
            "approved": 0,
            "deferred": 0,
            "unadjudicated": EXPECTED_PLAN_ITEMS,
            "promotionEligible": 0,
            "normativeRulesCreated": 0,
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
        "records": [],
    }


def main() -> int:
    try:
        plan = read_json(PLAN)
        profile = read_json(PROFILE)
        promotion_policy = read_json(PROMOTION_POLICY)

        expect_equal(plan.get("stage"), "2.13", "Adjudication plan stage")
        expect_equal(
            plan.get("summary", {}).get("plannedItems"),
            EXPECTED_PLAN_ITEMS,
            "Planned adjudication count",
        )
        expect_equal(profile.get("id"), "fa-ir-g1", "Profile ID")
        expect_equal(profile.get("status"), "draft", "Profile status")

        dispositions = {
            row["id"] for row in plan.get("dispositionVocabulary", [])
        }
        expect_equal(
            dispositions,
            set(DISPOSITIONS),
            "Phase 2.13 / Phase 2.14 disposition vocabulary",
        )

        current_eligible = (
            promotion_policy.get("promotion", {})
            .get("eligiblePhase1Classifications", [])
        )
        expect_equal(
            current_eligible,
            ["CONSENSUS-CANDIDATE"],
            "Current promotion-policy eligibility",
        )

        schema = build_schema()
        write_json(SCHEMA, schema)

        policy = build_policy(plan, promotion_policy)
        write_json(POLICY, policy)

        # The execution manifest is owned by materialize_adjudications.py.
        # Do not reset it here after explicit maintainer adjudications exist.

        doc = f"""# Phase 2.14 — Adjudication Framework + Execution

Phase 2.14 is the execution phase for the 253 decisions prepared in Phase 2.13.

This framework introduces a machine-readable adjudication record, an explicit
project-maintainer adjudication policy, and an execution manifest.

## Initial framework state

- Planned decisions: {EXPECTED_PLAN_ITEMS}
- Adjudication records: 0
- Approved dispositions: 0
- Deferred dispositions: 0
- Unadjudicated decisions: {EXPECTED_PLAN_ITEMS}
- Promotion-eligible decisions: 0
- Normative rules created by adjudication: 0
- Profile: `fa-ir-g1` (`{profile["status"]}`)

## Execution rule

No generator may invent a maintainer decision.

Each adjudication record must represent an explicit project-maintainer decision
for exactly one Phase 2.13 item and must preserve the exact evidence-packet hash
used as its basis.

Batch approval is allowed, but each decision still receives an independent
record.

## Adjudication is not promotion

The current normative-promotion policy remains version
`{promotion_policy["policyVersion"]}` and only admits the Phase 1
`CONSENSUS-CANDIDATE` classification.

Therefore a Phase 2.14 adjudication:

- does not rewrite Phase 1 classification;
- does not directly create a normative rule;
- does not set `promotionEligible = true`;
- does not modify the Phase 2.13 plan or Phase 2.12 evidence packets;
- makes no claim of current official Iranian national-standard status.

A later action inside Phase 2.14 may define an explicit governance route for
accepted adjudications before rule promotion. That route must remain separate
from the adjudication decision itself.

## Allowed dispositions

"""
        for disposition in DISPOSITIONS:
            doc += f"- `{disposition}`\n"

        doc += f"""
## Generated artifacts

- `{rel(SCHEMA)}`
- `{rel(POLICY)}`
- `{rel(MANIFEST)}`

The execution manifest is materialized separately from explicit adjudication
records by `tools/spec/materialize_adjudications.py`. The framework generator
never resets an execution manifest after maintainer decisions exist.
"""
        write_text(DOC, doc)

        print("Phase 2.14 adjudication framework built.")
        print(f"Planned decisions          : {EXPECTED_PLAN_ITEMS}")
        print("Adjudication records       : 0")
        print("Approved                   : 0")
        print("Deferred                   : 0")
        print(f"Unadjudicated              : {EXPECTED_PLAN_ITEMS}")
        print("Promotion eligible         : 0")
        print("Normative rules created    : 0")
        print(f"Profile                    : {profile['id']} ({profile['status']})")
        print(
            "Promotion policy           : "
            f"{promotion_policy['policyVersion']} "
            "(CONSENSUS-CANDIDATE only)"
        )
        print("")
        print(f"Schema SHA-256             : {sha256(SCHEMA)}")
        print(f"Policy SHA-256             : {sha256(POLICY)}")
        if MANIFEST.exists():
            print(
                "Execution manifest        : preserved "
                "(owned by materialize_adjudications.py)"
            )
        else:
            print(
                "Execution manifest        : not yet materialized "
                "(run materialize_adjudications.py)"
            )
        print(f"Documentation SHA-256      : {sha256(DOC)}")
        return 0

    except FrameworkError as exc:
        print("Phase 2.14 adjudication framework: FAIL")
        print(str(exc))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
