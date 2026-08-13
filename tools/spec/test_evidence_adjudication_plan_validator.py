from __future__ import annotations

from pathlib import Path
import json
import shutil
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[2]

COPY_PATHS = [
    ROOT / "spec" / "fa-ir" / "governance" / "review-queue.json",
    ROOT / "spec" / "fa-ir" / "review" / "evidence-packets",
    ROOT / "spec" / "fa-ir" / "governance" / "evidence-adjudication-plan.json",
    ROOT / "spec" / "fa-ir" / "governance" / "normative-promotion-policy.json",
    ROOT / "spec" / "fa-ir" / "profiles" / "fa-ir-g1.json",
    ROOT / "tools" / "spec" / "validate_evidence_adjudication_plan.py",
]

VALIDATOR_REL = Path("tools/spec/validate_evidence_adjudication_plan.py")
PLAN_REL = Path("spec/fa-ir/governance/evidence-adjudication-plan.json")


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value) -> None:
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        handle.write(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def sandbox() -> tempfile.TemporaryDirectory:
    td = tempfile.TemporaryDirectory()
    root = Path(td.name)

    for src in COPY_PATHS:
        dst = root / src.relative_to(ROOT)
        dst.parent.mkdir(parents=True, exist_ok=True)
        if src.is_dir():
            shutil.copytree(src, dst)
        else:
            shutil.copy2(src, dst)

    return td


def run_validator(root: Path) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, str(root / VALIDATOR_REL)],
        cwd=root,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )


def assert_pass(root: Path, label: str) -> None:
    result = run_validator(root)
    if result.returncode != 0:
        raise AssertionError(
            f"{label} expected PASS\nSTDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}"
        )
    print(f"PASS {label}")


def assert_fail(root: Path, label: str, fragment: str) -> None:
    result = run_validator(root)
    output = result.stdout + result.stderr
    if result.returncode == 0:
        raise AssertionError(f"{label} expected FAIL but passed")
    if fragment not in output:
        raise AssertionError(
            f"{label} missing expected fragment {fragment!r}\nOUTPUT:\n{output}"
        )
    print(f"PASS negative adjudication-plan fixture: {label}")


def mutate_premature_disposition(root: Path) -> None:
    path = root / PLAN_REL
    data = read_json(path)
    data["items"][0]["adjudication"]["selectedDisposition"] = "accept-rule"
    write_json(path, data)


def mutate_promotion_eligibility(root: Path) -> None:
    path = root / PLAN_REL
    data = read_json(path)
    data["items"][0]["adjudication"]["promotionEligible"] = True
    write_json(path, data)


def mutate_wrong_track(root: Path) -> None:
    path = root / PLAN_REL
    data = read_json(path)
    data["items"][0]["track"] = "implementation-alignment"
    data["items"][0]["trackPriority"] = 3
    write_json(path, data)


def mutate_policy_boundary(root: Path) -> None:
    path = root / PLAN_REL
    data = read_json(path)
    data["governanceConstraints"][
        "reviewRequiredEligibleUnderCurrentPromotionPolicy"
    ] = True
    write_json(path, data)


def mutate_batch_coverage(root: Path) -> None:
    path = root / PLAN_REL
    data = read_json(path)
    data["batches"][2]["decisionItemIds"] = data["batches"][2]["decisionItemIds"][:-1]
    data["batches"][2]["itemCount"] -= 1
    write_json(path, data)


def mutate_packet_hash(root: Path) -> None:
    path = root / PLAN_REL
    data = read_json(path)
    data["items"][0]["evidencePacket"]["sha256"] = "0" * 64
    write_json(path, data)


def main() -> int:
    with sandbox() as td:
        assert_pass(Path(td), "pristine adjudication-plan baseline")

    fixtures = [
        (
            "premature-disposition-selection",
            mutate_premature_disposition,
            "selected disposition FA-VAR-013",
        ),
        (
            "premature-promotion-eligibility",
            mutate_promotion_eligibility,
            "promotion eligibility FA-VAR-013",
        ),
        (
            "incorrect-unresolved-track",
            mutate_wrong_track,
            "track FA-VAR-013",
        ),
        (
            "promotion-policy-boundary-bypass",
            mutate_policy_boundary,
            "governance constraint reviewRequiredEligibleUnderCurrentPromotionPolicy",
        ),
        (
            "incomplete-batch-coverage",
            mutate_batch_coverage,
            "batch item count implementation-conflict",
        ),
        (
            "tampered-packet-provenance-hash",
            mutate_packet_hash,
            "packet provenance FA-VAR-013",
        ),
    ]

    for label, mutate, fragment in fixtures:
        with sandbox() as td:
            root = Path(td)
            mutate(root)
            assert_fail(root, label, fragment)

    print("")
    print("Phase 2.13 adjudication plan negative suite: PASS")
    print(f"Negative fixtures exercised : {len(fixtures)}")
    print("Repository mutations        : 0 (temporary sandboxes only)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
