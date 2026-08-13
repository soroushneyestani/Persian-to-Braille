from __future__ import annotations

from pathlib import Path
import json
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from typing import Callable

ROOT = Path(__file__).resolve().parents[2]

COPY_PATHS = [
    ROOT / "spec" / "sources" / "registry.json",
    ROOT / "spec" / "fa-ir" / "evidence" / "master-decision-matrix.json",
    ROOT / "spec" / "fa-ir" / "profiles" / "fa-ir-g1.json",
    ROOT / "spec" / "fa-ir" / "schema" / "promotion-record.schema.json",
    ROOT / "spec" / "fa-ir" / "governance" / "normative-promotion-policy.json",
    ROOT / "spec" / "fa-ir" / "rules" / "records",
    ROOT / "spec" / "fa-ir" / "promotions",
    ROOT / "tools" / "spec" / "validate_normative_promotions.py",
]

RULE_REL = Path(
    "spec/fa-ir/rules/records/fa-g1-letter-002.json"
)
PROMOTION_DIR_REL = Path("spec/fa-ir/promotions")
VALIDATOR_REL = Path("tools/spec/validate_normative_promotions.py")

RULE_ID = "FA-G1-LETTER-002"
PROMO_ID = "FA-PROMO-G1-LETTER-002-001"


@dataclass(frozen=True)
class Case:
    name: str
    mutate: Callable[[Path], None]
    expected: str


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        handle.write(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def copy_path(src: Path, root: Path) -> None:
    rel = src.relative_to(ROOT)
    dst = root / rel
    dst.parent.mkdir(parents=True, exist_ok=True)
    if src.is_dir():
        shutil.copytree(src, dst, dirs_exist_ok=True)
    else:
        shutil.copy2(src, dst)


def sandbox() -> tempfile.TemporaryDirectory:
    td = tempfile.TemporaryDirectory(prefix="persian-braille-promotion-")
    root = Path(td.name)
    for src in COPY_PATHS:
        if not src.exists():
            td.cleanup()
            raise RuntimeError(f"Missing fixture source: {src}")
        copy_path(src, root)
    return td


def base_record(root: Path) -> dict:
    rule = read_json(root / RULE_REL)
    return {
        "schemaVersion": 1,
        "id": PROMO_ID,
        "policyVersion": "1.0.0",
        "ruleId": rule["id"],
        "profileId": rule["profile"],
        "ruleVersion": rule["version"],
        "fromStatus": "candidate",
        "toStatus": "normative",
        "decision": {
            "result": "approved",
            "authority": "project-maintainer",
            "recordedBy": "phase-2.6-fixture",
            "recordedAt": None,
        },
        "basis": {
            "phase1Classification": "CONSENSUS-CANDIDATE",
            "decisionItemIds": rule["evidence"]["decisionItemIds"],
            "sourceIds": rule["evidence"]["sourceIds"],
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
                "Normative only inside the Persian-to-Braille project "
                "specification; no official Iranian-standard status is claimed."
            ),
        },
        "review": {
            "externalReview": "not-performed",
            "notes": [],
        },
        "rationale": (
            "Synthetic positive fixture for the Phase 2.6 promotion validator."
        ),
    }


def apply_valid_promotion(root: Path) -> None:
    rule_path = root / RULE_REL
    rule = read_json(rule_path)
    rule["status"] = "normative"
    write_json(rule_path, rule)

    record = base_record(root)
    write_json(root / PROMOTION_DIR_REL / (PROMO_ID.lower() + ".json"), record)


def run(root: Path) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, str(root / VALIDATOR_REL)],
        cwd=root,
        text=True,
        capture_output=True,
        timeout=30,
        check=False,
    )


def assert_pass(root: Path, label: str) -> None:
    result = run(root)
    output = (result.stdout or "") + (result.stderr or "")
    if result.returncode != 0:
        raise AssertionError(f"{label} unexpectedly failed:\n{output}")
    if "Phase 2.6 normative promotion validation: PASS" not in output:
        raise AssertionError(f"{label} missing PASS marker:\n{output}")


def mutate_normative_without_record(root: Path) -> None:
    rule_path = root / RULE_REL
    rule = read_json(rule_path)
    rule["status"] = "normative"
    write_json(rule_path, rule)


def mutate_record_but_candidate_rule(root: Path) -> None:
    record = base_record(root)
    write_json(root / PROMOTION_DIR_REL / (PROMO_ID.lower() + ".json"), record)


def mutate_unknown_source(root: Path) -> None:
    apply_valid_promotion(root)
    path = root / PROMOTION_DIR_REL / (PROMO_ID.lower() + ".json")
    record = read_json(path)
    record["basis"]["sourceIds"] = ["SRC-NEGATIVE-UNKNOWN"]
    write_json(path, record)


def mutate_ineligible_decision(root: Path) -> None:
    apply_valid_promotion(root)
    path = root / PROMOTION_DIR_REL / (PROMO_ID.lower() + ".json")
    record = read_json(path)
    # FA-VAR-013 is the known Phase 1 UNRESOLVED decision.
    record["basis"]["decisionItemIds"] = ["FA-VAR-013"]
    write_json(path, record)


def mutate_false_check(root: Path) -> None:
    apply_valid_promotion(root)
    path = root / PROMOTION_DIR_REL / (PROMO_ID.lower() + ".json")
    record = read_json(path)
    record["checks"]["semanticValidation"] = False
    write_json(path, record)


def mutate_official_claim(root: Path) -> None:
    apply_valid_promotion(root)
    path = root / PROMOTION_DIR_REL / (PROMO_ID.lower() + ".json")
    record = read_json(path)
    record["scope"]["officialIranianStandardClaim"] = True
    write_json(path, record)


CASES = [
    Case(
        "normative-rule-without-record",
        mutate_normative_without_record,
        "has no promotion record",
    ),
    Case(
        "promotion-record-but-candidate-rule",
        mutate_record_but_candidate_rule,
        "exists but rule is not normative",
    ),
    Case(
        "unknown-promotion-source",
        mutate_unknown_source,
        "Promotion/rule source provenance",
    ),
    Case(
        "ineligible-phase1-decision",
        mutate_ineligible_decision,
        "Promotion/rule decision provenance",
    ),
    Case(
        "failed-hard-check",
        mutate_false_check,
        "Promotion schema validation failed",
    ),
    Case(
        "official-standard-claim",
        mutate_official_claim,
        "Promotion schema validation failed",
    ),
]


def run_negative(case: Case) -> None:
    td = sandbox()
    try:
        root = Path(td.name)
        case.mutate(root)
        result = run(root)
        output = (result.stdout or "") + (result.stderr or "")

        if result.returncode == 0:
            raise AssertionError(
                f"Negative fixture {case.name!r} was incorrectly accepted:\n"
                + output
            )

        if "Phase 2.6 normative promotion validation: FAIL" not in output:
            raise AssertionError(
                f"Negative fixture {case.name!r} lacks FAIL marker:\n"
                + output
            )

        if case.expected not in output:
            raise AssertionError(
                f"Negative fixture {case.name!r} failed for the wrong reason.\n"
                f"Expected: {case.expected!r}\nOutput:\n{output}"
            )

        print(f"PASS negative promotion fixture: {case.name}")
    finally:
        td.cleanup()


def main() -> int:
    # Current repository-shaped baseline, including any real promotions, is valid.
    td = sandbox()
    try:
        assert_pass(Path(td.name), "Repository promotion baseline")
    finally:
        td.cleanup()
    print("PASS repository promotion baseline")

    # Synthetic applied promotion proves the validator can accept a valid
    # candidate->normative record even though the real repository has none yet.
    td = sandbox()
    try:
        root = Path(td.name)
        apply_valid_promotion(root)
        assert_pass(root, "Synthetic valid promotion")
    finally:
        td.cleanup()
    print("PASS synthetic valid promotion")

    for case in CASES:
        run_negative(case)

    print()
    print("Phase 2.6 promotion validator fixture suite: PASS")
    print(f"Negative fixtures exercised : {len(CASES)}")
    print("Repository mutations        : 0 (temporary sandboxes only)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
