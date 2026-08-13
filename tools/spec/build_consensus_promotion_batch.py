from __future__ import annotations

from pathlib import Path
from collections import Counter
import hashlib
import json

try:
    from jsonschema import Draft202012Validator
    from jsonschema.exceptions import SchemaError, ValidationError
except ImportError as exc:
    raise SystemExit(
        "Missing dependency: jsonschema\n"
        "Install it with:\n"
        "  py -3 -m pip install -r requirements-spec.txt\n"
    ) from exc


ROOT = Path(__file__).resolve().parents[2]

PLAN = ROOT / "spec" / "fa-ir" / "governance" / "consensus-promotion-plan.json"
APPROVAL = ROOT / "spec" / "fa-ir" / "governance" / "consensus-promotion-approval.json"
MASTER = ROOT / "spec" / "fa-ir" / "evidence" / "master-decision-matrix.json"
PROFILE = ROOT / "spec" / "fa-ir" / "profiles" / "fa-ir-g1.json"
RULE_DIR = ROOT / "spec" / "fa-ir" / "rules" / "records"

PROMOTION_SCHEMA = (
    ROOT / "spec" / "fa-ir" / "schema" / "promotion-record.schema.json"
)
PROMOTION_POLICY = (
    ROOT / "spec" / "fa-ir" / "governance" / "normative-promotion-policy.json"
)
PROMOTION_DIR = ROOT / "spec" / "fa-ir" / "promotions"

DOC = ROOT / "docs" / "specification" / "phase-2.10-consensus-baseline-promotion.md"

EXPECTED_PROFILE_ID = "fa-ir-g1"
EXPECTED_ELIGIBLE = 36
EXPECTED_ALREADY_NORMATIVE = 1
EXPECTED_FINAL_NORMATIVE = 37
EXPECTED_APPROVAL_ID = "FA-APPROVAL-CONSENSUS-BASELINE-001"


class BatchError(RuntimeError):
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
        raise BatchError(f"Missing required file: {rel(path)}") from exc
    except json.JSONDecodeError as exc:
        raise BatchError(
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
    raise BatchError(message)


def assert_true(condition: bool, message: str) -> None:
    if not condition:
        fail(message)


def assert_equal(actual, expected, message: str) -> None:
    if actual != expected:
        fail(f"{message}: expected={expected!r}, actual={actual!r}")


def promotion_id_for(rule_id: str) -> str:
    if not rule_id.startswith("FA-"):
        fail(f"Unexpected rule ID: {rule_id}")
    return "FA-PROMO-" + rule_id[3:] + "-001"


def promotion_path_for(promotion_id: str) -> Path:
    return PROMOTION_DIR / (promotion_id.lower() + ".json")


def validate_approval_shape(approval: dict) -> None:
    assert_equal(
        set(approval),
        {
            "schemaVersion",
            "stage",
            "approvalId",
            "plan",
            "decision",
            "scope",
            "statement",
        },
        "Approval top-level fields",
    )
    assert_equal(approval["schemaVersion"], 1, "Approval schema version")
    assert_equal(approval["stage"], "2.10", "Approval stage")
    assert_equal(approval["approvalId"], EXPECTED_APPROVAL_ID, "Approval ID")

    assert_equal(
        set(approval["plan"]),
        {"path", "sha256", "eligibleCandidates", "alreadyNormative"},
        "Approval plan fields",
    )
    assert_equal(
        approval["plan"]["path"],
        rel(PLAN),
        "Approval plan path",
    )
    assert_equal(
        approval["plan"]["eligibleCandidates"],
        EXPECTED_ELIGIBLE,
        "Approved eligible-candidate count",
    )
    assert_equal(
        approval["plan"]["alreadyNormative"],
        EXPECTED_ALREADY_NORMATIVE,
        "Approved already-normative count",
    )

    assert_equal(
        set(approval["decision"]),
        {"result", "authority", "recordedBy", "recordedAt"},
        "Approval decision fields",
    )
    assert_equal(approval["decision"]["result"], "approved", "Approval result")
    assert_equal(
        approval["decision"]["authority"],
        "project-maintainer",
        "Approval authority",
    )
    assert_true(
        bool(approval["decision"]["recordedBy"].strip()),
        "Approval recordedBy must not be empty",
    )
    assert_equal(
        approval["decision"]["recordedAt"],
        None,
        "Approval timestamp must remain null unless externally captured",
    )

    assert_equal(
        set(approval["scope"]),
        {
            "projectNormativeOnly",
            "officialIranianStandardClaim",
            "profileRemainsDraft",
        },
        "Approval scope fields",
    )
    assert_equal(
        approval["scope"]["projectNormativeOnly"],
        True,
        "Project-normative-only scope",
    )
    assert_equal(
        approval["scope"]["officialIranianStandardClaim"],
        False,
        "Official Iranian-standard claim",
    )
    assert_equal(
        approval["scope"]["profileRemainsDraft"],
        True,
        "Draft-profile scope",
    )
    assert_true(bool(approval["statement"].strip()), "Approval statement is empty")


def build_record(
    *,
    rule: dict,
    plan_item: dict,
    approval: dict,
    plan_sha: str,
) -> dict:
    promotion_id = promotion_id_for(rule["id"])

    record = {
        "schemaVersion": 1,
        "id": promotion_id,
        "policyVersion": "1.0.0",
        "ruleId": rule["id"],
        "profileId": rule["profile"],
        "ruleVersion": rule["version"],
        "fromStatus": "candidate",
        "toStatus": "normative",
        "decision": {
            "result": "approved",
            "authority": "project-maintainer",
            "recordedBy": approval["decision"]["recordedBy"],
            "recordedAt": None,
        },
        "basis": {
            "phase1Classification": "CONSENSUS-CANDIDATE",
            "decisionItemIds": list(rule["evidence"]["decisionItemIds"]),
            "sourceIds": list(rule["evidence"]["sourceIds"]),
            "unresolvedConflicts": [],
        },
        "checks": {
            "schemaValidation": True,
            "semanticValidation": True,
            "conformanceCoverage": True,
            "negativeFixtures": True,
            "reproducibility": True,
            "profileCompatibility": True,
            "unicodeBrailleIntegrity": True,
            "sourceTraceability": True,
        },
        "scope": {
            "projectNormative": True,
            "officialIranianStandardClaim": False,
            "statement": (
                "Normative within the Persian-to-Braille project specification "
                "only. No claim of current official Iranian national Braille "
                "standard status is made."
            ),
        },
        "review": {
            "externalReview": "not-performed",
            "notes": [
                (
                    "Approved as part of consensus baseline batch "
                    f"{approval['approvalId']}."
                ),
                f"Approval is bound to promotion plan SHA-256 {plan_sha}.",
            ],
        },
        "rationale": (
            "Explicit batch approval by project maintainer "
            f"{approval['decision']['recordedBy']} for the exact Phase 2.9 "
            "CONSENSUS-CANDIDATE promotion plan. This rule remains eligible "
            "because its Phase 1 provenance is exclusively "
            "CONSENSUS-CANDIDATE."
        ),
    }

    assert_equal(
        set(plan_item["decisionItemIds"]),
        set(rule["evidence"]["decisionItemIds"]),
        f"Plan/rule decision provenance {rule['id']}",
    )
    assert_equal(
        set(plan_item["sourceIds"]),
        set(rule["evidence"]["sourceIds"]),
        f"Plan/rule source provenance {rule['id']}",
    )

    return record


def main() -> int:
    try:
        plan = read_json(PLAN)
        approval = read_json(APPROVAL)
        master = read_json(MASTER)
        profile = read_json(PROFILE)
        promotion_schema = read_json(PROMOTION_SCHEMA)
        policy = read_json(PROMOTION_POLICY)

        validate_approval_shape(approval)

        actual_plan_sha = sha256(PLAN)
        assert_equal(
            approval["plan"]["sha256"].upper(),
            actual_plan_sha,
            "Approval must bind to exact promotion plan SHA-256",
        )

        assert_equal(plan["action"], "plan-only", "Plan action")
        assert_equal(
            plan["automaticPromotion"],
            False,
            "Plan automatic-promotion flag",
        )
        assert_equal(
            plan["maintainerApprovalRequired"],
            True,
            "Plan approval requirement",
        )
        assert_equal(plan["profileId"], EXPECTED_PROFILE_ID, "Plan profile")
        assert_equal(profile["id"], EXPECTED_PROFILE_ID, "Profile ID")
        assert_equal(profile["status"], "draft", "Profile must remain draft")
        assert_equal(
            plan["scope"]["officialIranianStandardClaim"],
            False,
            "Plan official-standard claim",
        )

        summary = plan["summary"]
        assert_equal(
            summary["alreadyNormative"],
            EXPECTED_ALREADY_NORMATIVE,
            "Plan already-normative count",
        )
        assert_equal(
            summary["eligibleCandidates"],
            EXPECTED_ELIGIBLE,
            "Plan eligible-candidate count",
        )
        assert_equal(
            summary["reviewRequiredSelected"],
            0,
            "REVIEW-REQUIRED selected",
        )
        assert_equal(
            summary["unresolvedSelected"],
            0,
            "UNRESOLVED selected",
        )
        assert_equal(
            len(plan["eligibleCandidates"]),
            EXPECTED_ELIGIBLE,
            "Eligible candidate list size",
        )

        if plan["blocked"]["reviewRequired"]:
            fail("Promotion plan contains REVIEW-REQUIRED rules")
        if plan["blocked"]["unresolved"]:
            fail("Promotion plan contains UNRESOLVED rules")

        try:
            Draft202012Validator.check_schema(promotion_schema)
        except SchemaError as exc:
            fail(f"Invalid promotion record schema: {exc.message}")
        record_validator = Draft202012Validator(promotion_schema)

        assert_equal(
            policy["policyVersion"],
            "1.0.0",
            "Promotion policy version",
        )
        assert_equal(
            policy["promotion"]["automaticPromotionAllowed"],
            False,
            "Policy automatic promotion",
        )
        assert_equal(
            policy["promotion"]["ciPassAloneMayPromote"],
            False,
            "Policy CI-only promotion",
        )
        assert_equal(
            policy["promotion"]["eligiblePhase1Classifications"],
            ["CONSENSUS-CANDIDATE"],
            "Policy eligible classifications",
        )

        master_by_id = {row["id"]: row for row in master["items"]}
        rule_by_id = {
            rule["id"]: rule
            for rule in (
                read_json(path)
                for path in sorted(RULE_DIR.glob("*.json"))
            )
        }

        eligible = sorted(
            plan["eligibleCandidates"],
            key=lambda row: row["ruleId"],
        )

        generated = []
        selected_rule_ids = set()

        for plan_item in eligible:
            rule_id = plan_item["ruleId"]
            selected_rule_ids.add(rule_id)

            assert_true(
                rule_id in rule_by_id,
                f"Plan references unknown rule {rule_id}",
            )
            rule = rule_by_id[rule_id]

            assert_equal(
                rule["version"],
                plan_item["ruleVersion"],
                f"Rule version {rule_id}",
            )
            assert_true(
                rule["status"] in {"candidate", "normative"},
                f"Unsupported current status for {rule_id}: {rule['status']}",
            )
            assert_equal(
                plan_item["phase1Classification"],
                "CONSENSUS-CANDIDATE",
                f"Plan classification {rule_id}",
            )

            for decision_id in rule["evidence"]["decisionItemIds"]:
                assert_true(
                    decision_id in master_by_id,
                    f"Unknown decision {decision_id} for {rule_id}",
                )
                assert_equal(
                    master_by_id[decision_id]["classification"],
                    "CONSENSUS-CANDIDATE",
                    f"Ineligible current decision {decision_id}",
                )

            record = build_record(
                rule=rule,
                plan_item=plan_item,
                approval=approval,
                plan_sha=actual_plan_sha,
            )

            try:
                record_validator.validate(record)
            except ValidationError as exc:
                location = "/".join(str(part) for part in exc.absolute_path)
                suffix = f" at {location}" if location else ""
                fail(
                    f"Generated promotion record invalid for {rule_id}"
                    f"{suffix}: {exc.message}"
                )

            path = promotion_path_for(record["id"])
            write_json(path, record)
            generated.append((path, record))

        assert_equal(
            len(selected_rule_ids),
            EXPECTED_ELIGIBLE,
            "Unique selected rule count",
        )
        assert_equal(
            len(generated),
            EXPECTED_ELIGIBLE,
            "Generated promotion record count",
        )

        existing_records = [
            read_json(path)
            for path in sorted(PROMOTION_DIR.glob("*.json"))
        ]
        record_keys = [
            (row["ruleId"], row["ruleVersion"])
            for row in existing_records
        ]
        duplicates = [
            key for key, count in Counter(record_keys).items() if count != 1
        ]
        assert_equal(
            duplicates,
            [],
            "Promotion rule/version records must be unique",
        )
        assert_equal(
            len(existing_records),
            EXPECTED_FINAL_NORMATIVE,
            "Total promotion record count after batch generation",
        )

        lines = [
            "# Phase 2.10 — Consensus Baseline Promotion",
            "",
            "This stage materializes the maintainer-approved Phase 2.9 "
            "consensus promotion plan into independent promotion records.",
            "",
            "## Approval",
            "",
            f"- Approval ID: `{approval['approvalId']}`",
            f"- Recorded by: `{approval['decision']['recordedBy']}`",
            f"- Recorded at: `null`",
            f"- Approved plan SHA-256: `{actual_plan_sha}`",
            "",
            "The approval applies only to the 36 eligible rules listed in the "
            "exact approved plan.",
            "",
            "## Batch",
            "",
            f"- Previously normative rules: {EXPECTED_ALREADY_NORMATIVE}",
            f"- Newly generated promotion records: {len(generated)}",
            f"- Expected total promotion records: {len(existing_records)}",
            "- REVIEW-REQUIRED rules selected: 0",
            "- UNRESOLVED rules selected: 0",
            "",
            "Every promoted rule retains an independent promotion record.",
            "",
            "## Scope",
            "",
            "Normative status is authoritative only within the "
            "Persian-to-Braille project specification.",
            "",
            "No claim of current official Iranian national Braille-standard "
            "status is made.",
            "",
            "The `fa-ir-g1` profile remains `draft`; promoting the consensus "
            "baseline does not promote the profile itself.",
            "",
            "## Generated promotion records",
            "",
        ]

        for path, record in generated:
            lines.append(
                f"- `{record['ruleId']}` -> `{rel(path)}`"
            )

        write_text(DOC, "\n".join(lines))

        print("Phase 2.10 consensus promotion batch built.")
        print(f"Approved plan SHA-256      : {actual_plan_sha}")
        print(f"Previously normative       : {EXPECTED_ALREADY_NORMATIVE}")
        print(f"Promotion records generated: {len(generated)}")
        print(f"Total promotion records    : {len(existing_records)}")
        print("REVIEW-REQUIRED selected   : 0")
        print("UNRESOLVED selected        : 0")
        print("Expected final normative   : 37")
        print("Expected final candidates  : 0")
        print(f"Batch documentation SHA-256: {sha256(DOC)}")
        return 0

    except BatchError as exc:
        print("Phase 2.10 consensus promotion batch: FAIL")
        print(str(exc))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
