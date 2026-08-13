from __future__ import annotations

from pathlib import Path
import json
import shutil
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[2]

FILES = [
    "spec/fa-ir/governance/evidence-adjudication-plan.json",
    "spec/fa-ir/governance/adjudication-policy.json",
    "spec/fa-ir/governance/normative-promotion-policy.json",
    "spec/fa-ir/schema/adjudication-record.schema.json",
    "spec/fa-ir/profiles/fa-ir-g1.json",
    "spec/fa-ir/adjudications/manifest.json",
    "tools/spec/validate_adjudications.py",
    "tools/spec/validate_phase214_completion.py",
]

DIRS = [
    "spec/fa-ir/adjudications/records",
    "spec/fa-ir/review/evidence-packets/records",
]


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value) -> None:
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        handle.write(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def copy_fixture_tree(destination: Path) -> None:
    for relative in FILES:
        src = ROOT / relative
        dst = destination / relative
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)

    for relative in DIRS:
        src = ROOT / relative
        dst = destination / relative
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copytree(src, dst)


def run_validator(root: Path, script: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, script],
        cwd=root,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=False,
    )


def first_record(root: Path) -> Path:
    return sorted((root / "spec/fa-ir/adjudications/records").glob("*.json"))[0]


def mutate_packet_hash(root: Path) -> None:
    path = first_record(root)
    data = read_json(path)
    data["basis"]["evidencePacketSha256"] = "0" * 64
    write_json(path, data)


def mutate_promotion_eligible(root: Path) -> None:
    path = first_record(root)
    data = read_json(path)
    data["materialization"]["promotionEligible"] = True
    write_json(path, data)


def mutate_normative_scope(root: Path) -> None:
    path = first_record(root)
    data = read_json(path)
    data["scope"]["projectNormativeRule"] = True
    write_json(path, data)


def mutate_phase1_rewrite(root: Path) -> None:
    path = first_record(root)
    data = read_json(path)
    data["scope"]["phase1ClassificationRewritten"] = True
    write_json(path, data)


def mutate_duplicate_decision(root: Path) -> None:
    source = first_record(root)
    data = read_json(source)
    data["id"] = "FA-ADJ-NEGATIVE-DUPLICATE-999"
    target = (
        root
        / "spec/fa-ir/adjudications/records"
        / "fa-adj-negative-duplicate-999.json"
    )
    write_json(target, data)


def mutate_materialization_semantics(root: Path) -> None:
    for path in sorted(
        (root / "spec/fa-ir/adjudications/records").glob("*.json")
    ):
        data = read_json(path)
        if data["disposition"] == "accept-rule":
            data["materialization"]["kind"] = "layout-policy"
            data["materialization"]["targetRuleType"] = "layout"
            write_json(path, data)
            return
    raise RuntimeError("No accept-rule record found")


def mutate_manifest_summary(root: Path) -> None:
    path = root / "spec/fa-ir/adjudications/manifest.json"
    data = read_json(path)
    data["summary"]["approved"] -= 1
    write_json(path, data)


FIXTURES = [
    ("tampered-evidence-packet-hash", mutate_packet_hash, "validate_adjudications.py"),
    ("promotion-eligibility-bypass", mutate_promotion_eligible, "validate_adjudications.py"),
    ("normative-scope-bypass", mutate_normative_scope, "validate_adjudications.py"),
    ("phase1-classification-rewrite", mutate_phase1_rewrite, "validate_adjudications.py"),
    ("duplicate-decision-record", mutate_duplicate_decision, "validate_adjudications.py"),
    ("materialization-semantic-mismatch", mutate_materialization_semantics, "validate_adjudications.py"),
    ("completion-summary-drift", mutate_manifest_summary, "validate_phase214_completion.py"),
]


def main() -> int:
    pristine = run_validator(ROOT, "tools/spec/validate_adjudications.py")
    if pristine.returncode != 0:
        print(pristine.stdout)
        print("FAIL pristine adjudication baseline")
        return 1

    completion = run_validator(ROOT, "tools/spec/validate_phase214_completion.py")
    if completion.returncode != 0:
        print(completion.stdout)
        print("FAIL pristine Phase 2.14 completion baseline")
        return 1

    print("PASS pristine adjudication baseline")
    print("PASS pristine Phase 2.14 completion baseline")

    failures = 0

    for name, mutator, validator_name in FIXTURES:
        with tempfile.TemporaryDirectory(prefix="fa-adjudication-negative-") as tmp:
            root = Path(tmp)
            copy_fixture_tree(root)

            try:
                mutator(root)
            except Exception as exc:
                print(f"FAIL fixture setup {name}: {exc}")
                failures += 1
                continue

            result = run_validator(root, f"tools/spec/{validator_name}")
            if result.returncode == 0:
                print(f"FAIL negative adjudication fixture: {name}")
                failures += 1
            else:
                print(f"PASS negative adjudication fixture: {name}")

    if failures:
        print()
        print("Phase 2.14 adjudication negative suite: FAIL")
        print(f"Failed fixtures              : {failures}")
        return 1

    print()
    print("Phase 2.14 adjudication negative suite: PASS")
    print(f"Negative fixtures exercised : {len(FIXTURES)}")
    print("Repository mutations        : 0 (temporary sandboxes only)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
