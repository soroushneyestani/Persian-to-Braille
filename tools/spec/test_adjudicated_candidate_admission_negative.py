from __future__ import annotations

from pathlib import Path
import json
import shutil
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[2]

FILES = [
    "spec/fa-ir/schema/candidate-admission.schema.json",
    "spec/fa-ir/governance/adjudicated-candidate-admission-policy.json",
    "spec/fa-ir/adjudications/candidate-admission-manifest.json",
    "spec/fa-ir/adjudications/manifest.json",
    "spec/fa-ir/governance/adjudication-policy.json",
    "spec/fa-ir/governance/normative-promotion-policy.json",
    "spec/fa-ir/profiles/fa-ir-g1.json",
    "tools/spec/validate_adjudicated_candidate_admission.py",
]

DIRS = [
    "spec/fa-ir/adjudications/records",
]


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value) -> None:
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        handle.write(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def copy_tree(dst_root: Path) -> None:
    for relative in FILES:
        src = ROOT / relative
        dst = dst_root / relative
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)

    for relative in DIRS:
        src = ROOT / relative
        dst = dst_root / relative
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copytree(src, dst)


def run_validator(root: Path):
    return subprocess.run(
        [sys.executable, "tools/spec/validate_adjudicated_candidate_admission.py"],
        cwd=root,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=False,
    )


def manifest_path(root: Path) -> Path:
    return root / "spec/fa-ir/adjudications/candidate-admission-manifest.json"


def mutate_target_normative(root: Path) -> None:
    path = manifest_path(root)
    data = read_json(path)
    data["entries"][0]["targetStatus"] = "normative"
    write_json(path, data)


def mutate_promotion_eligible(root: Path) -> None:
    path = manifest_path(root)
    data = read_json(path)
    data["entries"][0]["promotionEligible"] = True
    write_json(path, data)


def mutate_premature_rule_id(root: Path) -> None:
    path = manifest_path(root)
    data = read_json(path)
    data["entries"][0]["candidateRuleId"] = "FA-G1-PREMATURE-001"
    write_json(path, data)


def mutate_drop_eligible_entry(root: Path) -> None:
    path = manifest_path(root)
    data = read_json(path)
    data["entries"] = data["entries"][:-1]
    write_json(path, data)


def mutate_admit_deferred(root: Path) -> None:
    records_dir = root / "spec/fa-ir/adjudications/records"
    deferred = None
    for path in sorted(records_dir.glob("*.json")):
        record = read_json(path)
        if record["decision"]["result"] == "deferred":
            deferred = (path, record)
            break
    if deferred is None:
        raise RuntimeError("No deferred record found")

    record_path, record = deferred
    manifest = read_json(manifest_path(root))
    template = dict(manifest["entries"][0])
    template.update(
        {
            "adjudicationRecordId": record["id"],
            "adjudicationRecordPath": str(
                record_path.relative_to(root)
            ).replace("\\", "/"),
            "decisionItemId": record["decisionItemId"],
            "phase1Classification": record["phase1Classification"],
            "disposition": "accept-rule",
            "targetRuleType": "character",
            "evidencePacketPath": record["basis"]["evidencePacketPath"],
            "evidencePacketSha256": record["basis"]["evidencePacketSha256"],
        }
    )
    # Preserve array length so the failure is semantic coverage, not only schema count.
    manifest["entries"][0] = template
    write_json(manifest_path(root), manifest)


def mutate_broaden_normative_policy(root: Path) -> None:
    path = root / "spec/fa-ir/governance/normative-promotion-policy.json"
    data = read_json(path)
    data["promotion"]["eligiblePhase1Classifications"] = [
        "CONSENSUS-CANDIDATE",
        "REVIEW-REQUIRED",
    ]
    write_json(path, data)


def mutate_official_claim(root: Path) -> None:
    path = (
        root
        / "spec/fa-ir/governance/adjudicated-candidate-admission-policy.json"
    )
    data = read_json(path)
    data["scope"]["officialIranianStandardClaim"] = True
    write_json(path, data)


FIXTURES = [
    ("target-status-normative", mutate_target_normative),
    ("premature-promotion-eligibility", mutate_promotion_eligible),
    ("premature-rule-id-assignment", mutate_premature_rule_id),
    ("missing-eligible-admission", mutate_drop_eligible_entry),
    ("deferred-decision-admitted", mutate_admit_deferred),
    ("normative-policy-broadened", mutate_broaden_normative_policy),
    ("official-standard-claim", mutate_official_claim),
]


def main() -> int:
    pristine = run_validator(ROOT)
    if pristine.returncode != 0:
        print(pristine.stdout)
        print("FAIL pristine adjudicated candidate-admission baseline")
        return 1

    print("PASS pristine adjudicated candidate-admission baseline")
    failures = 0

    for name, mutator in FIXTURES:
        with tempfile.TemporaryDirectory(prefix="fa-candidate-admission-") as tmp:
            root = Path(tmp)
            copy_tree(root)
            try:
                mutator(root)
            except Exception as exc:
                print(f"FAIL fixture setup {name}: {exc}")
                failures += 1
                continue

            result = run_validator(root)
            if result.returncode == 0:
                print(f"FAIL negative candidate-admission fixture: {name}")
                failures += 1
            else:
                print(f"PASS negative candidate-admission fixture: {name}")

    if failures:
        print()
        print("Phase 2.14 candidate-admission negative suite: FAIL")
        print(f"Failed fixtures              : {failures}")
        return 1

    print()
    print("Phase 2.14 candidate-admission negative suite: PASS")
    print(f"Negative fixtures exercised : {len(FIXTURES)}")
    print("Repository mutations        : 0 (temporary sandboxes only)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
