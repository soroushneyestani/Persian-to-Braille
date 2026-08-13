from __future__ import annotations

from pathlib import Path
import json
import shutil
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[2]

COPY_PATHS = [
    ROOT / "spec" / "fa-ir" / "evidence" / "master-decision-matrix.json",
    ROOT / "spec" / "fa-ir" / "evidence" / "numbers-punctuation.json",
    ROOT / "spec" / "fa-ir" / "schema" / "rule.schema.json",
    ROOT / "spec" / "fa-ir" / "schema" / "profile.schema.json",
    ROOT / "spec" / "fa-ir" / "schema" / "conformance.schema.json",
    ROOT / "spec" / "fa-ir" / "schema" / "promotion-record.schema.json",
    ROOT / "spec" / "fa-ir" / "governance" / "normative-promotion-policy.json",
    ROOT / "tools" / "spec" / "build_phase2_candidate_package.py",
]

BUILDER_REL = Path("tools/spec/build_phase2_candidate_package.py")
PROMOTION_DIR_REL = Path("spec/fa-ir/promotions")
RULE_REL = Path("spec/fa-ir/rules/records/fa-g1-letter-001.json")
VECTOR_REL = Path("spec/fa-ir/conformance/records/fa-conf-letter-001.json")
PROFILE_REL = Path("spec/fa-ir/profiles/fa-ir-g1.json")
MANIFEST_REL = Path("spec/fa-ir/manifests/fa-ir-g1-materialization.json")

PROMOTION_ID = "FA-PROMO-G1-LETTER-001-001"


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
    td = tempfile.TemporaryDirectory(prefix="persian-braille-materialization-")
    root = Path(td.name)
    for src in COPY_PATHS:
        if not src.exists():
            td.cleanup()
            raise RuntimeError(f"Missing materialization fixture source: {src}")
        copy_path(src, root)
    return td


def run_builder(root: Path) -> str:
    result = subprocess.run(
        [sys.executable, str(root / BUILDER_REL)],
        cwd=root,
        text=True,
        capture_output=True,
        timeout=30,
        check=False,
    )
    output = (result.stdout or "") + (result.stderr or "")
    if result.returncode != 0:
        raise AssertionError("Materializer failed unexpectedly:\n" + output)
    if "Phase 2.7 promotion-aware package materialized." not in output:
        raise AssertionError("Materializer PASS marker missing:\n" + output)
    return output


def promotion_record(rule: dict) -> dict:
    return {
        "schemaVersion": 1,
        "id": PROMOTION_ID,
        "policyVersion": "1.0.0",
        "ruleId": rule["id"],
        "profileId": rule["profile"],
        "ruleVersion": rule["version"],
        "fromStatus": "candidate",
        "toStatus": "normative",
        "decision": {
            "result": "approved",
            "authority": "project-maintainer",
            "recordedBy": "phase-2.7-fixture",
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
            "Synthetic Phase 2.7 fixture proving promotion-aware materialization."
        ),
    }


def assert_state(
    root: Path,
    *,
    rule_status: str,
    vector_status: str,
    candidate_rules: int,
    normative_rules: int,
    applied_promotions: int,
) -> None:
    rule = read_json(root / RULE_REL)
    vector = read_json(root / VECTOR_REL)
    profile = read_json(root / PROFILE_REL)
    manifest = read_json(root / MANIFEST_REL)

    if rule["status"] != rule_status:
        raise AssertionError(
            f"Expected rule status {rule_status!r}, got {rule['status']!r}"
        )
    if vector["status"] != vector_status:
        raise AssertionError(
            f"Expected vector status {vector_status!r}, got {vector['status']!r}"
        )
    if profile["status"] != "draft":
        raise AssertionError("Profile must remain draft during rule promotion")
    if manifest["stage"] != "2.7":
        raise AssertionError("Unexpected materialization manifest stage")
    if manifest["status"] != "materialized-package":
        raise AssertionError("Unexpected materialization manifest status")

    summary = manifest["summary"]
    expected = {
        "candidateRules": candidate_rules,
        "normativeRules": normative_rules,
        "promotionRecordsApplied": applied_promotions,
    }
    for key, value in expected.items():
        if summary[key] != value:
            raise AssertionError(
                f"Manifest {key}: expected={value}, actual={summary[key]}"
            )


def main() -> int:
    td = sandbox()
    try:
        root = Path(td.name)

        # Baseline with no promotion records.
        run_builder(root)
        assert_state(
            root,
            rule_status="candidate",
            vector_status="draft",
            candidate_rules=37,
            normative_rules=0,
            applied_promotions=0,
        )
        print("PASS materialization baseline: 37 candidate / 0 normative")

        # Add one valid promotion record and regenerate.
        rule = read_json(root / RULE_REL)
        promo_path = (
            root
            / PROMOTION_DIR_REL
            / (PROMOTION_ID.lower() + ".json")
        )
        write_json(promo_path, promotion_record(rule))

        run_builder(root)
        assert_state(
            root,
            rule_status="normative",
            vector_status="active",
            candidate_rules=36,
            normative_rules=1,
            applied_promotions=1,
        )
        print("PASS materialization promotion: candidate -> normative")
        print("PASS conformance lifecycle: draft -> active")
        print("PASS profile lifecycle isolation: profile remains draft")

        # Remove the promotion record and prove deterministic reversal.
        promo_path.unlink()
        run_builder(root)
        assert_state(
            root,
            rule_status="candidate",
            vector_status="draft",
            candidate_rules=37,
            normative_rules=0,
            applied_promotions=0,
        )
        print("PASS materialization reversal: normative -> candidate")

    finally:
        td.cleanup()

    print()
    print("Phase 2.7 promotion-aware materialization suite: PASS")
    print("Repository mutations        : 0 (temporary sandbox only)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
