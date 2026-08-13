from __future__ import annotations

from pathlib import Path
import hashlib
import json

ROOT = Path(__file__).resolve().parents[2]

MASTER = ROOT / "spec" / "fa-ir" / "evidence" / "master-decision-matrix.json"
PROFILE = ROOT / "spec" / "fa-ir" / "profiles" / "fa-ir-g1.json"
RULE_DIR = ROOT / "spec" / "fa-ir" / "rules" / "records"
PROMOTION_DIR = ROOT / "spec" / "fa-ir" / "promotions"

PLAN_JSON = ROOT / "spec" / "fa-ir" / "governance" / "consensus-promotion-plan.json"
PLAN_MD = ROOT / "docs" / "specification" / "phase-2.9-consensus-promotion-plan.md"

EXPECTED_PROFILE_ID = "fa-ir-g1"
EXPECTED_RULE_COUNT = 37
EXPECTED_CONSENSUS_COUNT = 37
EXPECTED_ALREADY_NORMATIVE = 1
EXPECTED_ELIGIBLE_CANDIDATES = 36


class PlanError(RuntimeError):
    pass


def read_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise PlanError(f"Missing required file: {path.relative_to(ROOT)}") from exc
    except json.JSONDecodeError as exc:
        raise PlanError(
            f"Invalid JSON: {path.relative_to(ROOT)}:{exc.lineno}:{exc.colno}: "
            f"{exc.msg}"
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
    raise PlanError(message)


def assert_equal(actual, expected, message: str) -> None:
    if actual != expected:
        fail(f"{message}: expected={expected!r}, actual={actual!r}")


def classify_rule(rule: dict, master_by_id: dict[str, dict]) -> str:
    classifications = []
    for decision_id in rule["evidence"]["decisionItemIds"]:
        if decision_id not in master_by_id:
            fail(f"Rule {rule['id']} references unknown decision {decision_id}")
        classifications.append(master_by_id[decision_id]["classification"])

    unique = set(classifications)

    if unique == {"CONSENSUS-CANDIDATE"}:
        return "CONSENSUS-CANDIDATE"
    if "UNRESOLVED" in unique:
        return "UNRESOLVED"
    if "REVIEW-REQUIRED" in unique:
        return "REVIEW-REQUIRED"

    fail(
        f"Rule {rule['id']} has unsupported Phase 1 classifications: "
        f"{sorted(unique)}"
    )


def item_for(rule: dict, classification: str) -> dict:
    output = rule.get("output", {})
    return {
        "ruleId": rule["id"],
        "ruleVersion": rule["version"],
        "currentStatus": rule["status"],
        "phase1Classification": classification,
        "decisionItemIds": list(rule["evidence"]["decisionItemIds"]),
        "sourceIds": list(rule["evidence"]["sourceIds"]),
        "cells": list(output.get("cells", [])),
        "unicodeBraille": output.get("unicodeBraille", ""),
    }


def main() -> int:
    try:
        master = read_json(MASTER)
        profile = read_json(PROFILE)

        assert_equal(profile["id"], EXPECTED_PROFILE_ID, "Profile ID")

        master_by_id = {row["id"]: row for row in master["items"]}

        rule_paths = sorted(RULE_DIR.glob("*.json"))
        rules = [read_json(path) for path in rule_paths]
        rule_by_id = {rule["id"]: rule for rule in rules}

        assert_equal(len(rules), EXPECTED_RULE_COUNT, "Materialized rule count")
        assert_equal(
            len(rule_by_id),
            len(rules),
            "Rule IDs must be unique",
        )
        assert_equal(
            set(profile["ruleIds"]),
            set(rule_by_id),
            "Profile rule IDs must match materialized rule IDs",
        )

        promotion_paths = (
            sorted(PROMOTION_DIR.glob("*.json"))
            if PROMOTION_DIR.exists()
            else []
        )
        promotions = [read_json(path) for path in promotion_paths]
        promotion_keys = {
            (row["ruleId"], row["ruleVersion"])
            for row in promotions
        }

        already_normative = []
        eligible_candidates = []
        blocked_review = []
        blocked_unresolved = []
        unexpected = []

        consensus_decisions = set()

        for rule in sorted(rules, key=lambda row: row["id"]):
            classification = classify_rule(rule, master_by_id)
            item = item_for(rule, classification)

            if classification == "CONSENSUS-CANDIDATE":
                consensus_decisions.update(rule["evidence"]["decisionItemIds"])

                if rule["status"] == "normative":
                    key = (rule["id"], rule["version"])
                    if key not in promotion_keys:
                        fail(
                            f"Normative rule {rule['id']} has no promotion record"
                        )
                    already_normative.append(item)
                elif rule["status"] == "candidate":
                    key = (rule["id"], rule["version"])
                    if key in promotion_keys:
                        fail(
                            f"Candidate rule {rule['id']} already has a "
                            "promotion record"
                        )
                    eligible_candidates.append(item)
                else:
                    unexpected.append(item)

            elif classification == "REVIEW-REQUIRED":
                blocked_review.append(item)
            elif classification == "UNRESOLVED":
                blocked_unresolved.append(item)

        assert_equal(
            len(consensus_decisions),
            EXPECTED_CONSENSUS_COUNT,
            "Unique consensus decision count",
        )
        assert_equal(
            len(already_normative),
            EXPECTED_ALREADY_NORMATIVE,
            "Already normative consensus rules",
        )
        assert_equal(
            len(eligible_candidates),
            EXPECTED_ELIGIBLE_CANDIDATES,
            "Eligible consensus candidates",
        )
        assert_equal(
            len(blocked_review),
            0,
            "REVIEW-REQUIRED rules must not enter the promotion batch",
        )
        assert_equal(
            len(blocked_unresolved),
            0,
            "UNRESOLVED rules must not enter the promotion batch",
        )
        assert_equal(
            len(unexpected),
            0,
            "Unexpected lifecycle states",
        )

        selected_ids = {row["ruleId"] for row in eligible_candidates}
        already_ids = {row["ruleId"] for row in already_normative}
        assert_equal(
            len(selected_ids & already_ids),
            0,
            "Promotion plan must not reselect normative rules",
        )

        plan = {
            "schemaVersion": 1,
            "stage": "2.9",
            "profileId": profile["id"],
            "profileVersion": profile["version"],
            "profileStatus": profile["status"],
            "action": "plan-only",
            "automaticPromotion": False,
            "maintainerApprovalRequired": True,
            "scope": {
                "projectNormativeOnly": True,
                "officialIranianStandardClaim": False,
            },
            "summary": {
                "profileRules": len(rules),
                "consensusBaselineRules": (
                    len(already_normative) + len(eligible_candidates)
                ),
                "alreadyNormative": len(already_normative),
                "eligibleCandidates": len(eligible_candidates),
                "reviewRequiredSelected": len(blocked_review),
                "unresolvedSelected": len(blocked_unresolved),
                "plannedFinalNormativeRules": (
                    len(already_normative) + len(eligible_candidates)
                ),
                "plannedFinalCandidateRules": 0,
            },
            "alreadyNormative": already_normative,
            "eligibleCandidates": eligible_candidates,
            "blocked": {
                "reviewRequired": blocked_review,
                "unresolved": blocked_unresolved,
            },
            "approval": {
                "status": "pending",
                "note": (
                    "This artifact is a deterministic plan only. It does not "
                    "create promotion records or change rule status."
                ),
            },
        }

        write_json(PLAN_JSON, plan)

        lines = [
            "# Phase 2.9 — Consensus Baseline Promotion Plan",
            "",
            "This stage is planning-only. It does not create promotion records "
            "and does not change lifecycle status.",
            "",
            "## Summary",
            "",
            f"- Profile: `{profile['id']}` `{profile['version']}`",
            f"- Profile status: `{profile['status']}`",
            f"- Rules in profile: {len(rules)}",
            f"- Consensus baseline rules: "
            f"{len(already_normative) + len(eligible_candidates)}",
            f"- Already normative: {len(already_normative)}",
            f"- Eligible candidates: {len(eligible_candidates)}",
            f"- REVIEW-REQUIRED selected: {len(blocked_review)}",
            f"- UNRESOLVED selected: {len(blocked_unresolved)}",
            "",
            "The planned batch contains only rules backed exclusively by Phase 1 "
            "`CONSENSUS-CANDIDATE` decisions.",
            "",
            "The project makes no claim that this promotion establishes current "
            "official Iranian national Braille-standard status.",
            "",
            "## Already normative",
            "",
        ]

        for row in already_normative:
            lines.append(
                f"- `{row['ruleId']}` — decisions "
                f"`{', '.join(row['decisionItemIds'])}`"
            )

        lines += [
            "",
            "## Eligible candidate batch",
            "",
        ]

        for index, row in enumerate(eligible_candidates, start=1):
            cells = "-".join(row["cells"]) if row["cells"] else "(structural)"
            unicode_braille = row["unicodeBraille"] or "(none)"
            lines.append(
                f"{index}. `{row['ruleId']}` — "
                f"cells `{cells}` — `{unicode_braille}` — decisions "
                f"`{', '.join(row['decisionItemIds'])}`"
            )

        lines += [
            "",
            "## Blocking classifications",
            "",
            f"- REVIEW-REQUIRED selected: {len(blocked_review)}",
            f"- UNRESOLVED selected: {len(blocked_unresolved)}",
            "",
            "Both counts must remain zero before batch approval.",
            "",
            "## Approval boundary",
            "",
            "The generated plan remains `pending` until the project maintainer "
            "explicitly approves the 36-rule batch. Approval will be recorded "
            "through independent promotion records in the next step.",
            "",
            "The incomplete `fa-ir-g1` profile remains `draft` even if all 37 "
            "consensus-baseline rules become normative.",
        ]

        write_text(PLAN_MD, "\n".join(lines))

        print("Phase 2.9 consensus promotion plan built.")
        print(f"Profile rules             : {len(rules)}")
        print(
            "Consensus baseline rules : "
            f"{len(already_normative) + len(eligible_candidates)}"
        )
        print(f"Already normative         : {len(already_normative)}")
        print(f"Eligible candidates       : {len(eligible_candidates)}")
        print(f"REVIEW-REQUIRED selected  : {len(blocked_review)}")
        print(f"UNRESOLVED selected       : {len(blocked_unresolved)}")
        print(
            "Planned final normative  : "
            f"{len(already_normative) + len(eligible_candidates)}"
        )
        print("Planned final candidates  : 0")
        print(f"Plan JSON SHA-256         : {sha256(PLAN_JSON)}")
        print(f"Plan Markdown SHA-256     : {sha256(PLAN_MD)}")
        return 0

    except PlanError as exc:
        print("Phase 2.9 consensus promotion plan: FAIL")
        print(str(exc))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
