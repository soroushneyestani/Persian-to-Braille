from __future__ import annotations

from pathlib import Path
from collections import Counter
import hashlib
import json
import sys

try:
    from jsonschema import Draft202012Validator, FormatChecker
    from jsonschema.exceptions import SchemaError, ValidationError
except ImportError as exc:
    raise SystemExit(
        "Missing dependency: jsonschema\n"
        "Install it with:\n"
        "  py -3 -m pip install -r requirements-spec.txt\n"
    ) from exc


ROOT = Path(__file__).resolve().parents[2]

REGISTRY = ROOT / "spec" / "sources" / "registry.json"
MASTER = ROOT / "spec" / "fa-ir" / "evidence" / "master-decision-matrix.json"
PROFILE = ROOT / "spec" / "fa-ir" / "profiles" / "fa-ir-g1.json"

PROMOTION_SCHEMA = (
    ROOT / "spec" / "fa-ir" / "schema" / "promotion-record.schema.json"
)
POLICY = (
    ROOT / "spec" / "fa-ir" / "governance" / "normative-promotion-policy.json"
)

RULE_DIR = ROOT / "spec" / "fa-ir" / "rules" / "candidates"
PROMOTION_DIR = ROOT / "spec" / "fa-ir" / "promotions"

REPORT_JSON = (
    ROOT / "spec" / "fa-ir" / "validation" / "phase-2.5-promotion-validation.json"
)
REPORT_MD = (
    ROOT / "docs" / "specification" / "phase-2.6-promotion-validation.md"
)

EXPECTED_POLICY_VERSION = "1.0.0"
EXPECTED_PROFILE_ID = "fa-ir-g1"
EXPECTED_REQUIRED_CI = "Validate Persian Braille specification"

CHECK_FIELDS = {
    "schemaValidation",
    "semanticValidation",
    "conformanceCoverage",
    "negativeFixtures",
    "reproducibility",
    "profileCompatibility",
    "unicodeBrailleIntegrity",
    "sourceTraceability",
}


class PromotionValidationError(RuntimeError):
    pass


def rel(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT)).replace("\\", "/")
    except ValueError:
        return str(path).replace("\\", "/")


def read_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise PromotionValidationError(
            f"Missing required file: {rel(path)}"
        ) from exc
    except json.JSONDecodeError as exc:
        raise PromotionValidationError(
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


def fail(message: str) -> None:
    raise PromotionValidationError(message)


def assert_true(condition: bool, message: str) -> None:
    if not condition:
        fail(message)


def assert_equal(actual, expected, message: str) -> None:
    if actual != expected:
        fail(f"{message}: expected={expected!r}, actual={actual!r}")


def schema_validate(schema: dict, path: Path, instance) -> None:
    try:
        Draft202012Validator.check_schema(schema)
        Draft202012Validator(
            schema,
            format_checker=FormatChecker(),
        ).validate(instance)
    except SchemaError as exc:
        fail(f"Invalid promotion JSON Schema: {exc.message}")
    except ValidationError as exc:
        location = "/".join(str(part) for part in exc.absolute_path)
        suffix = f" at {location}" if location else ""
        fail(
            f"Promotion schema validation failed for {rel(path)}{suffix}: "
            f"{exc.message}"
        )


def validate() -> dict:
    registry = read_json(REGISTRY)
    master = read_json(MASTER)
    profile = read_json(PROFILE)
    schema = read_json(PROMOTION_SCHEMA)
    policy = read_json(POLICY)

    try:
        Draft202012Validator.check_schema(schema)
    except SchemaError as exc:
        fail(f"Invalid promotion JSON Schema: {exc.message}")

    # Governance-policy invariants independent from the policy builder.
    assert_equal(
        policy["policyVersion"],
        EXPECTED_POLICY_VERSION,
        "Promotion policy version",
    )
    assert_equal(
        policy["promotion"]["fromStatus"],
        "candidate",
        "Promotion source status",
    )
    assert_equal(
        policy["promotion"]["toStatus"],
        "normative",
        "Promotion target status",
    )
    assert_equal(
        policy["promotion"]["automaticPromotionAllowed"],
        False,
        "Automatic promotion policy",
    )
    assert_equal(
        policy["promotion"]["ciPassAloneMayPromote"],
        False,
        "CI-only promotion policy",
    )
    assert_equal(
        policy["promotion"]["eligiblePhase1Classifications"],
        ["CONSENSUS-CANDIDATE"],
        "Eligible Phase 1 classifications",
    )
    assert_equal(
        policy["normativeScope"]["officialIranianStandardStatusClaimed"],
        False,
        "Official Iranian standard claim policy",
    )
    assert_equal(
        policy["changeControl"]["requiredCiCheck"],
        EXPECTED_REQUIRED_CI,
        "Required CI check name",
    )
    assert_equal(
        len(policy["hardGates"]),
        11,
        "Promotion hard-gate count",
    )
    gate_ids = [row["id"] for row in policy["hardGates"]]
    assert_equal(
        len(gate_ids),
        len(set(gate_ids)),
        "Promotion hard-gate IDs must be unique",
    )

    assert_equal(profile["id"], EXPECTED_PROFILE_ID, "Target profile ID")

    source_ids = {row["id"] for row in registry["sources"]}
    master_by_id = {row["id"]: row for row in master["items"]}

    rule_paths = sorted(RULE_DIR.glob("*.json"))
    rules_by_id = {}
    for path in rule_paths:
        rule = read_json(path)
        rule_id = rule["id"]
        if rule_id in rules_by_id:
            fail(f"Duplicate rule ID: {rule_id}")
        rules_by_id[rule_id] = (path, rule)

    promotion_paths = (
        sorted(PROMOTION_DIR.glob("*.json"))
        if PROMOTION_DIR.exists()
        else []
    )
    promotions_by_id = {}
    promotion_by_rule_version = {}

    for path in promotion_paths:
        record = read_json(path)
        schema_validate(schema, path, record)

        promotion_id = record["id"]
        if promotion_id in promotions_by_id:
            fail(f"Duplicate promotion record ID: {promotion_id}")
        promotions_by_id[promotion_id] = (path, record)

        key = (record["ruleId"], record["ruleVersion"])
        if key in promotion_by_rule_version:
            other = promotion_by_rule_version[key][0]
            fail(
                "More than one promotion record for the same rule/version: "
                f"{record['ruleId']} {record['ruleVersion']} "
                f"({other} and {promotion_id})"
            )
        promotion_by_rule_version[key] = (promotion_id, record)

    # Any normative rule must have an approved promotion record.
    normative_rules = []
    candidate_rules = []
    for rule_id, (_, rule) in rules_by_id.items():
        if rule["status"] == "normative":
            normative_rules.append(rule_id)
            key = (rule_id, rule["version"])
            assert_true(
                key in promotion_by_rule_version,
                f"Normative rule {rule_id} has no promotion record",
            )
        elif rule["status"] == "candidate":
            candidate_rules.append(rule_id)

    # Promotion-record cross-file validation.
    consumed_decisions = []
    referenced_sources = set()

    for promotion_id, (path, record) in promotions_by_id.items():
        rule_id = record["ruleId"]
        assert_true(
            rule_id in rules_by_id,
            f"Promotion {promotion_id} references unknown rule {rule_id}",
        )

        _, rule = rules_by_id[rule_id]

        assert_equal(
            record["profileId"],
            rule["profile"],
            f"Promotion/rule profile {promotion_id}",
        )
        assert_equal(
            record["profileId"],
            profile["id"],
            f"Promotion target profile {promotion_id}",
        )
        assert_equal(
            record["ruleVersion"],
            rule["version"],
            f"Promotion/rule version {promotion_id}",
        )
        assert_equal(
            record["fromStatus"],
            policy["promotion"]["fromStatus"],
            f"Promotion fromStatus {promotion_id}",
        )
        assert_equal(
            record["toStatus"],
            policy["promotion"]["toStatus"],
            f"Promotion toStatus {promotion_id}",
        )
        assert_equal(
            record["policyVersion"],
            policy["policyVersion"],
            f"Promotion policy version {promotion_id}",
        )

        # The record represents an applied transition; after applying it the
        # current rule artifact must actually be normative.
        assert_equal(
            rule["status"],
            "normative",
            f"Promotion record {promotion_id} exists but rule is not normative",
        )

        assert_equal(
            record["decision"]["result"],
            "approved",
            f"Promotion decision result {promotion_id}",
        )
        assert_equal(
            record["decision"]["authority"],
            "project-maintainer",
            f"Promotion authority {promotion_id}",
        )
        assert_true(
            bool(record["decision"]["recordedBy"].strip()),
            f"Promotion {promotion_id} has empty recordedBy",
        )

        basis = record["basis"]
        assert_equal(
            basis["phase1Classification"],
            "CONSENSUS-CANDIDATE",
            f"Promotion evidence classification {promotion_id}",
        )
        assert_equal(
            set(basis["decisionItemIds"]),
            set(rule["evidence"]["decisionItemIds"]),
            f"Promotion/rule decision provenance {promotion_id}",
        )
        assert_equal(
            set(basis["sourceIds"]),
            set(rule["evidence"]["sourceIds"]),
            f"Promotion/rule source provenance {promotion_id}",
        )
        assert_equal(
            basis["unresolvedConflicts"],
            [],
            f"Promotion unresolved conflicts {promotion_id}",
        )

        for decision_id in basis["decisionItemIds"]:
            assert_true(
                decision_id in master_by_id,
                f"Promotion {promotion_id} references unknown decision "
                f"{decision_id}",
            )
            decision = master_by_id[decision_id]
            assert_equal(
                decision["classification"],
                "CONSENSUS-CANDIDATE",
                f"Promotion {promotion_id} consumes ineligible decision "
                f"{decision_id}",
            )
            consumed_decisions.append(decision_id)

        for source_id in basis["sourceIds"]:
            assert_true(
                source_id in source_ids,
                f"Promotion {promotion_id} references unregistered source "
                f"{source_id}",
            )
            referenced_sources.add(source_id)

        checks = record["checks"]
        assert_equal(
            set(checks),
            CHECK_FIELDS,
            f"Promotion check fields {promotion_id}",
        )
        assert_true(
            all(checks.values()),
            f"Promotion {promotion_id} has a failed hard check",
        )

        scope = record["scope"]
        assert_equal(
            scope["projectNormative"],
            True,
            f"Project normative scope {promotion_id}",
        )
        assert_equal(
            scope["officialIranianStandardClaim"],
            False,
            f"Official-standard claim {promotion_id}",
        )
        assert_true(
            bool(scope["statement"].strip()),
            f"Promotion {promotion_id} has empty scope statement",
        )

        assert_true(
            bool(record["rationale"].strip()),
            f"Promotion {promotion_id} has empty rationale",
        )

        expected_filename = promotion_id.lower() + ".json"
        assert_equal(
            path.name,
            expected_filename,
            f"Promotion filename {promotion_id}",
        )

    # A promotion record must not exist for a candidate rule.
    for rule_id in candidate_rules:
        rule = rules_by_id[rule_id][1]
        key = (rule_id, rule["version"])
        assert_true(
            key not in promotion_by_rule_version,
            f"Candidate rule {rule_id} already has an applied promotion record",
        )

    return {
        "schemaVersion": 1,
        "validationStage": "2.6",
        "validatedPolicyStage": "2.5",
        "result": "PASS",
        "normative": False,
        "summary": {
            "policyVersion": policy["policyVersion"],
            "promotionSchemaValidated": 1,
            "hardGatesValidated": len(policy["hardGates"]),
            "ruleArtifactsInspected": len(rules_by_id),
            "candidateRules": len(candidate_rules),
            "normativeRules": len(normative_rules),
            "promotionRecords": len(promotions_by_id),
            "uniquePromotedDecisionItems": len(set(consumed_decisions)),
            "registeredSourcesUsedByPromotions": len(referenced_sources),
            "semanticErrors": 0,
        },
        "invariants": [
            "Automatic promotion is forbidden.",
            "Passing CI alone cannot promote a rule.",
            "Only Phase 1 CONSENSUS-CANDIDATE decisions are eligible.",
            "Every promotion record validates against the promotion schema.",
            "Every promotion record targets an existing rule and profile.",
            "Promotion rule/profile/version identity must match current artifacts.",
            "Every applied promotion record corresponds to a normative rule.",
            "Every normative rule has exactly one promotion record for its version.",
            "Candidate rules cannot already have an applied promotion record.",
            "Promotion evidence provenance matches the rule provenance.",
            "All promotion source IDs are registered.",
            "All promotion decision items remain CONSENSUS-CANDIDATE.",
            "All recorded hard checks are true.",
            "Promotion records cannot claim official Iranian-standard status.",
        ],
    }


def render_markdown(report: dict) -> str:
    s = report["summary"]
    lines = [
        "# Phase 2.6 — Normative Promotion Validation",
        "",
        f"Result: **{report['result']}**",
        "",
        "This report validates the Phase 2.5 normative-promotion governance "
        "independently from the policy generator.",
        "",
        "A PASS result does not promote any rule.",
        "",
        "## Current repository state",
        "",
        f"- Policy version: `{s['policyVersion']}`",
        f"- Hard gates validated: {s['hardGatesValidated']}",
        f"- Rule artifacts inspected: {s['ruleArtifactsInspected']}",
        f"- Candidate rules: {s['candidateRules']}",
        f"- Normative rules: {s['normativeRules']}",
        f"- Promotion records: {s['promotionRecords']}",
        f"- Semantic errors: {s['semanticErrors']}",
        "",
        "The current zero-promotion state is valid. Phase 2.6 establishes the "
        "validator before the first real normative transition.",
        "",
        "## Enforced invariants",
        "",
    ]
    for invariant in report["invariants"]:
        lines.append(f"- {invariant}")

    lines += [
        "",
        "## Materialization boundary",
        "",
        "The existing Phase 2.2 package generator still materializes the "
        "37-rule baseline as candidates. Therefore the first real promotion "
        "must not be attempted until a later stage makes rule materialization "
        "promotion-aware and updates the general specification validator to "
        "accept governed normative rules.",
    ]
    return "\n".join(lines)


def main() -> int:
    try:
        report = validate()
    except PromotionValidationError as exc:
        print("Phase 2.6 normative promotion validation: FAIL")
        print(str(exc))
        return 1

    write_json(REPORT_JSON, report)
    write_text(REPORT_MD, render_markdown(report))

    print("Phase 2.6 normative promotion validation: PASS")
    for key, value in report["summary"].items():
        print(f"{key:38}: {value}")
    print(f"Validation JSON SHA-256                : {sha256(REPORT_JSON)}")
    print(f"Validation Markdown SHA-256            : {sha256(REPORT_MD)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
