from __future__ import annotations

from pathlib import Path
import hashlib
import json

ROOT = Path(__file__).resolve().parents[2]

SCHEMA_DIR = ROOT / "spec" / "fa-ir" / "schema"
GOVERNANCE_DIR = ROOT / "spec" / "fa-ir" / "governance"
DOCS_DIR = ROOT / "docs" / "specification"

PROMOTION_SCHEMA = SCHEMA_DIR / "promotion-record.schema.json"
POLICY_FILE = GOVERNANCE_DIR / "normative-promotion-policy.json"
DOC_FILE = DOCS_DIR / "phase-2.5-normative-promotion.md"

SCHEMA_VERSION = 1
POLICY_VERSION = "1.0.0"

HARD_GATES = [
    {
        "id": "PROMO-GATE-001",
        "name": "candidate-status",
        "description": "The source rule must currently have status=candidate.",
    },
    {
        "id": "PROMO-GATE-002",
        "name": "consensus-evidence",
        "description": (
            "Every Phase 1 decision item consumed by the rule must currently "
            "be classified CONSENSUS-CANDIDATE."
        ),
    },
    {
        "id": "PROMO-GATE-003",
        "name": "registered-sources",
        "description": (
            "Every source referenced by the rule must exist in the project "
            "source registry."
        ),
    },
    {
        "id": "PROMO-GATE-004",
        "name": "schema-validation",
        "description": (
            "Rule, profile and conformance artifacts must validate against "
            "the current Phase 2 JSON Schemas."
        ),
    },
    {
        "id": "PROMO-GATE-005",
        "name": "semantic-validation",
        "description": (
            "The independent specification validator must pass with zero "
            "semantic errors."
        ),
    },
    {
        "id": "PROMO-GATE-006",
        "name": "conformance",
        "description": (
            "The rule must have reciprocal conformance coverage and the "
            "expected Braille output must match the rule artifact."
        ),
    },
    {
        "id": "PROMO-GATE-007",
        "name": "negative-fixtures",
        "description": (
            "The validator negative-fixture suite must pass, proving the "
            "covered invalid states are rejected."
        ),
    },
    {
        "id": "PROMO-GATE-008",
        "name": "reproducibility",
        "description": (
            "Regenerating specification artifacts must produce no tracked diff."
        ),
    },
    {
        "id": "PROMO-GATE-009",
        "name": "profile-compatibility",
        "description": (
            "The rule must satisfy the target profile constraints, including "
            "the six-dot restriction for fa-ir-g1."
        ),
    },
    {
        "id": "PROMO-GATE-010",
        "name": "explicit-maintainer-decision",
        "description": (
            "Promotion must be recorded explicitly in a promotion record. "
            "Passing CI alone must never change candidate to normative."
        ),
    },
    {
        "id": "PROMO-GATE-011",
        "name": "scope-disclaimer",
        "description": (
            "The promotion record must state that normative means normative "
            "for the Persian-to-Braille project specification and does not "
            "claim current official Iranian-standard status."
        ),
    },
]

CHECK_FIELDS = [
    "schemaValidation",
    "semanticValidation",
    "conformanceCoverage",
    "negativeFixtures",
    "reproducibility",
    "profileCompatibility",
    "unicodeBrailleIntegrity",
    "sourceTraceability",
]


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest().upper()


def write_json(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        handle.write(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        handle.write(text.rstrip() + "\n")


source_id_schema = {
    "type": "string",
    "pattern": r"^SRC-[A-Z0-9][A-Z0-9-]*$",
}

decision_id_schema = {
    "type": "string",
    "pattern": r"^FA-[A-Z0-9][A-Z0-9-]*$",
}

rule_id_schema = {
    "type": "string",
    "pattern": r"^FA-[A-Z0-9]+(?:-[A-Z0-9]+)*-\d{3,}$",
}

profile_id_schema = {
    "type": "string",
    "pattern": r"^[a-z]{2,3}(?:-[a-z0-9]+)+$",
}

semver_schema = {
    "type": "string",
    "pattern": r"^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$",
}

promotion_schema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": (
        "https://soroushneyestani.github.io/Persian-to-Braille/"
        "spec/fa-ir/schema/promotion-record.schema.json"
    ),
    "title": "Persian Braille Normative Promotion Record",
    "description": (
        "Machine-readable decision record for explicit candidate-to-normative "
        "promotion inside the Persian-to-Braille project specification."
    ),
    "type": "object",
    "additionalProperties": False,
    "required": [
        "schemaVersion",
        "id",
        "policyVersion",
        "ruleId",
        "profileId",
        "ruleVersion",
        "fromStatus",
        "toStatus",
        "decision",
        "basis",
        "checks",
        "scope",
        "review",
        "rationale",
    ],
    "properties": {
        "schemaVersion": {
            "type": "integer",
            "const": SCHEMA_VERSION,
        },
        "id": {
            "type": "string",
            "pattern": r"^FA-PROMO-[A-Z0-9]+(?:-[A-Z0-9]+)*-\d{3,}$",
        },
        "policyVersion": {
            "type": "string",
            "const": POLICY_VERSION,
        },
        "ruleId": rule_id_schema,
        "profileId": profile_id_schema,
        "ruleVersion": semver_schema,
        "fromStatus": {
            "type": "string",
            "const": "candidate",
        },
        "toStatus": {
            "type": "string",
            "const": "normative",
        },
        "decision": {
            "type": "object",
            "additionalProperties": False,
            "required": ["result", "authority", "recordedBy"],
            "properties": {
                "result": {
                    "type": "string",
                    "const": "approved",
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
                        "Optional audit timestamp. Generators must not invent "
                        "or auto-update it."
                    ),
                },
            },
        },
        "basis": {
            "type": "object",
            "additionalProperties": False,
            "required": [
                "phase1Classification",
                "decisionItemIds",
                "sourceIds",
                "unresolvedConflicts",
            ],
            "properties": {
                "phase1Classification": {
                    "type": "string",
                    "const": "CONSENSUS-CANDIDATE",
                },
                "decisionItemIds": {
                    "type": "array",
                    "items": decision_id_schema,
                    "minItems": 1,
                    "uniqueItems": True,
                },
                "sourceIds": {
                    "type": "array",
                    "items": source_id_schema,
                    "minItems": 1,
                    "uniqueItems": True,
                },
                "unresolvedConflicts": {
                    "type": "array",
                    "maxItems": 0,
                    "items": {"type": "string"},
                },
            },
        },
        "checks": {
            "type": "object",
            "additionalProperties": False,
            "required": CHECK_FIELDS,
            "properties": {
                key: {"type": "boolean", "const": True}
                for key in CHECK_FIELDS
            },
        },
        "scope": {
            "type": "object",
            "additionalProperties": False,
            "required": [
                "projectNormative",
                "officialIranianStandardClaim",
                "statement",
            ],
            "properties": {
                "projectNormative": {
                    "type": "boolean",
                    "const": True,
                },
                "officialIranianStandardClaim": {
                    "type": "boolean",
                    "const": False,
                },
                "statement": {
                    "type": "string",
                    "minLength": 1,
                },
            },
        },
        "review": {
            "type": "object",
            "additionalProperties": False,
            "required": ["externalReview", "notes"],
            "properties": {
                "externalReview": {
                    "type": "string",
                    "enum": ["not-performed", "completed"],
                },
                "notes": {
                    "type": "array",
                    "items": {"type": "string"},
                },
            },
        },
        "rationale": {
            "type": "string",
            "minLength": 1,
        },
    },
}

policy = {
    "schemaVersion": 1,
    "policyVersion": POLICY_VERSION,
    "title": "Persian-to-Braille Normative Promotion Policy",
    "normativeScope": {
        "meaning": (
            "Normative status is authoritative only within the "
            "Persian-to-Braille project specification."
        ),
        "officialIranianStandardStatusClaimed": False,
        "note": (
            "The project does not claim that a promoted rule is the current "
            "official national Persian Braille standard unless a future source "
            "audit explicitly establishes that status."
        ),
    },
    "promotion": {
        "fromStatus": "candidate",
        "toStatus": "normative",
        "automaticPromotionAllowed": False,
        "ciPassAloneMayPromote": False,
        "onePromotionRecordPerRuleVersion": True,
        "batchPullRequestsAllowed": True,
        "individualRuleRecordsRequiredInBatch": True,
        "eligiblePhase1Classifications": ["CONSENSUS-CANDIDATE"],
        "reviewRequired": {
            "projectMaintainerDecision": True,
            "externalReview": False,
            "externalReviewRecommendation": (
                "Recommended for language rules with significant ambiguity or "
                "before claiming broad real-world compatibility."
            ),
        },
    },
    "hardGates": HARD_GATES,
    "profilePromotion": {
        "separateFromRulePromotion": True,
        "draftProfileMayContainNormativeRules": True,
        "profileMayBecomeNormativeAutomatically": False,
        "note": (
            "Promoting individual rules does not promote fa-ir-g1 itself. "
            "Profile-level normative status requires a separate future gate "
            "covering completeness and unresolved REVIEW-REQUIRED domains."
        ),
    },
    "changeControl": {
        "publishedRuleIdsStable": True,
        "semanticChangesRequireRuleVersionChange": True,
        "statusChangesRequirePullRequest": True,
        "requiredCiCheck": "Validate Persian Braille specification",
        "forcePushToProtectedMain": False,
    },
}

# Builder-level policy invariants.
if policy["promotion"]["automaticPromotionAllowed"]:
    raise RuntimeError("Normative promotion must never be automatic")
if policy["promotion"]["ciPassAloneMayPromote"]:
    raise RuntimeError("CI alone must never promote a rule")
if policy["normativeScope"]["officialIranianStandardStatusClaimed"]:
    raise RuntimeError("Project policy must not claim current official status")
if len(HARD_GATES) != len({gate["id"] for gate in HARD_GATES}):
    raise RuntimeError("Duplicate promotion gate IDs")
if len(CHECK_FIELDS) != len(set(CHECK_FIELDS)):
    raise RuntimeError("Duplicate promotion check fields")
if promotion_schema["properties"]["fromStatus"]["const"] != "candidate":
    raise RuntimeError("Promotion schema must start at candidate")
if promotion_schema["properties"]["toStatus"]["const"] != "normative":
    raise RuntimeError("Promotion schema must end at normative")
if promotion_schema["properties"]["scope"]["properties"][
    "officialIranianStandardClaim"
]["const"] is not False:
    raise RuntimeError("Promotion record must reject official-status claims")

write_json(PROMOTION_SCHEMA, promotion_schema)
write_json(POLICY_FILE, policy)

doc = """# Phase 2.5 — Normative Promotion Protocol

Phase 2.5 defines how a Persian Braille rule may move from `candidate` to
`normative`.

This stage defines the **process**. It does not promote any rule.

## Meaning of normative

`normative` means authoritative for the Persian-to-Braille project
specification.

It does **not** mean that the project is claiming the rule is the current
official Iranian national Braille standard.

The Phase 1 audit deliberately left the current normative status of the
1393/2014 institutional manual unverified. Promotion inside this project must
not erase that distinction.

## No automatic promotion

A rule cannot become normative merely because:

- Liblouis contains the mapping;
- stable and draft Liblouis agree;
- a GitHub Actions workflow passes;
- all conformance vectors pass;
- the rule existed in Persian-to-Braille v1.

Promotion requires an explicit machine-readable promotion record and an
explicit maintainer decision.

## Eligibility

Policy version 1.0.0 permits promotion only from:

`candidate -> normative`

and only when every consumed Phase 1 decision item is currently classified:

`CONSENSUS-CANDIDATE`

`REVIEW-REQUIRED` and `UNRESOLVED` evidence is not eligible under this first
promotion policy.

## Hard gates

The promotion policy currently defines eleven hard gates:

1. source rule is still a candidate;
2. Phase 1 evidence classification is consensus-candidate;
3. all evidence sources are registered;
4. Phase 2 JSON Schema validation passes;
5. independent semantic validation passes;
6. reciprocal conformance coverage exists;
7. negative validator fixtures pass;
8. regeneration is reproducible;
9. target-profile constraints pass;
10. a maintainer explicitly approves promotion;
11. the promotion record preserves the project-vs-official-standard scope
    disclaimer.

## Promotion records

Every promoted rule/version requires its own record conforming to:

`spec/fa-ir/schema/promotion-record.schema.json`

A batch Pull Request may contain multiple promotions, but each rule/version
must have an independent record.

Promotion records capture:

- rule and profile identity;
- exact rule version;
- Phase 1 decision IDs;
- source IDs;
- validation gates;
- maintainer authority;
- optional external review;
- project-normative scope;
- rationale.

## External review

External review is recommended but is not a hard gate in policy version 1.0.0.

This keeps the project operable with a single maintainer while still making
external review visible and auditable. A future policy version may strengthen
this requirement.

## Rule status vs profile status

Rule promotion and profile promotion are deliberately separate.

Individual rules may become normative while `fa-ir-g1` remains `draft`.

The profile must not become normative until a later profile-level gate resolves
coverage completeness and the remaining Phase 1 `REVIEW-REQUIRED` and
`UNRESOLVED` domains.

## Change control

Published rule IDs remain stable.

A semantic rule change requires a rule-version change and a new promotion
record for that version.

Passing CI does not itself mutate status. Promotion occurs only through an
explicit Pull Request containing the rule status/version change and its
promotion record.

## Next stage

Phase 2.6 will make this governance executable:

- validate promotion records against the new schema;
- cross-check a promotion record against the referenced rule, profile, source
  registry, and Phase 1 decision matrix;
- add those checks to the existing specification CI gate;
- create the first real promotion Pull Request only after the promotion
  validator itself has positive and negative tests.
"""

write_text(DOC_FILE, doc)

outputs = [PROMOTION_SCHEMA, POLICY_FILE, DOC_FILE]

print("Phase 2.5 normative promotion protocol built.")
print(f"Policy version          : {POLICY_VERSION}")
print(f"Hard gates              : {len(HARD_GATES)}")
print(f"Promotion check fields  : {len(CHECK_FIELDS)}")
print(f"Generated artifacts     : {len(outputs)}")
for path in outputs:
    rel = path.relative_to(ROOT)
    print(f"{str(rel):62} {sha256_bytes(path.read_bytes())}")
