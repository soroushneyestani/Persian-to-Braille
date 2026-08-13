from __future__ import annotations

from pathlib import Path
import hashlib
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]

OUTPUTS = [
    ROOT / "spec/fa-ir/schema/candidate-admission.schema.json",
    ROOT / "spec/fa-ir/governance/adjudicated-candidate-admission-policy.json",
    ROOT / "spec/fa-ir/adjudications/candidate-admission-manifest.json",
    ROOT / "docs/specification/phase-2.14-adjudicated-candidate-admission.md",
]

COMMAND = "tools/spec/build_adjudicated_candidate_admission.py"


class DeterminismError(RuntimeError):
    pass


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest().upper()


def snapshot() -> dict[str, str]:
    result = {}
    for path in OUTPUTS:
        if not path.is_file():
            raise DeterminismError(
                f"Missing generated output: {path.relative_to(ROOT)}"
            )
        key = str(path.relative_to(ROOT)).replace("\\", "/")
        result[key] = sha256(path)
    return result


def run_builder() -> None:
    result = subprocess.run(
        [sys.executable, COMMAND],
        cwd=ROOT,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=False,
    )
    if result.returncode != 0:
        raise DeterminismError(
            f"Builder failed: {COMMAND}\n{result.stdout}"
        )


def main() -> int:
    try:
        before = snapshot()

        run_builder()
        after_first = snapshot()

        if before != after_first:
            changed = sorted(
                key
                for key in set(before) | set(after_first)
                if before.get(key) != after_first.get(key)
            )
            raise DeterminismError(
                "First regeneration changed outputs: " + ", ".join(changed)
            )

        run_builder()
        after_second = snapshot()

        if after_first != after_second:
            changed = sorted(
                key
                for key in set(after_first) | set(after_second)
                if after_first.get(key) != after_second.get(key)
            )
            raise DeterminismError(
                "Second regeneration was not deterministic: "
                + ", ".join(changed)
            )

        print("Phase 2.14 candidate-admission determinism: PASS")
        print("generatedOutputs                  : 4")
        print("regenerationPasses                : 2")
        print("changedOutputs                    : 0")
        print("idempotenceErrors                 : 0")
        return 0

    except DeterminismError as exc:
        print("Phase 2.14 candidate-admission determinism: FAIL")
        print("idempotenceErrors                 : 1")
        print(f"ERROR: {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
