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
    ROOT / "spec" / "fa-ir" / "governance" / "review-queue.json",
    ROOT / "spec" / "fa-ir" / "profiles" / "fa-ir-g1.json",
    ROOT / "tools" / "spec" / "validate_review_queue.py",
]

VALIDATOR_REL = Path("tools/spec/validate_review_queue.py")
QUEUE_REL = Path("spec/fa-ir/governance/review-queue.json")


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
    print(f"PASS negative review-queue fixture: {label}")


def mutate_promotion_eligible(root: Path) -> None:
    path = root / QUEUE_REL
    data = read_json(path)
    data["queue"][0]["adjudication"]["promotionEligible"] = True
    write_json(path, data)


def mutate_wrong_source_hash(root: Path) -> None:
    path = root / QUEUE_REL
    data = read_json(path)
    data["source"]["sha256"] = "0" * 64
    write_json(path, data)


def mutate_duplicate_decision(root: Path) -> None:
    path = root / QUEUE_REL
    data = read_json(path)
    data["queue"][1]["decisionItemId"] = data["queue"][0]["decisionItemId"]
    write_json(path, data)


def mutate_wrong_order(root: Path) -> None:
    path = root / QUEUE_REL
    data = read_json(path)
    data["queue"][0], data["queue"][1] = data["queue"][1], data["queue"][0]
    # Keep queue IDs tied to positions so the failure reaches ordering semantics.
    data["queue"][0]["queueId"] = "FA-REVIEW-001"
    data["queue"][1]["queueId"] = "FA-REVIEW-002"
    write_json(path, data)


def mutate_consensus_injection(root: Path) -> None:
    path = root / QUEUE_REL
    data = read_json(path)
    data["queue"][-1]["decisionItemId"] = "FA-CORE-001"
    data["queue"][-1]["classification"] = "CONSENSUS-CANDIDATE"
    write_json(path, data)


def main() -> int:
    with sandbox() as td:
        assert_pass(Path(td), "pristine review-queue baseline")

    fixtures = [
        (
            "promotion-eligible-before-adjudication",
            mutate_promotion_eligible,
            "promotion eligibility",
        ),
        (
            "wrong-master-source-hash",
            mutate_wrong_source_hash,
            "queue source SHA-256",
        ),
        (
            "duplicate-decision",
            mutate_duplicate_decision,
            "queue decision IDs must be unique",
        ),
        (
            "incorrect-queue-order",
            mutate_wrong_order,
            "queue ordering policy",
        ),
        (
            "consensus-decision-injected",
            mutate_consensus_injection,
            "queue decision set must exactly match",
        ),
    ]

    for label, mutate, fragment in fixtures:
        with sandbox() as td:
            root = Path(td)
            mutate(root)
            assert_fail(root, label, fragment)

    print("")
    print("Phase 2.11 review queue negative suite: PASS")
    print(f"Negative fixtures exercised : {len(fixtures)}")
    print("Repository mutations        : 0 (temporary sandboxes only)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
