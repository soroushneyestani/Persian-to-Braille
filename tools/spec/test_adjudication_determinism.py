from __future__ import annotations

from pathlib import Path
import hashlib
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]

TRACKED_OUTPUTS = [
    ROOT / "spec/fa-ir/schema/adjudication-record.schema.json",
    ROOT / "spec/fa-ir/governance/adjudication-policy.json",
    ROOT / "docs/specification/phase-2.14-adjudication-framework.md",
    ROOT / "spec/fa-ir/adjudications/manifest.json",
]

RECORD_DIR = ROOT / "spec/fa-ir/adjudications/records"

COMMANDS = [
    "tools/spec/build_adjudication_framework.py",
    "tools/spec/record_batch00_adjudication.py",
    "tools/spec/record_implementation_conflicts.py",
    "tools/spec/record_implementation_alignment.py",
    "tools/spec/materialize_adjudications.py",
]


class DeterminismError(RuntimeError):
    pass


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest().upper()


def snapshot() -> dict[str, str]:
    result = {}

    for path in TRACKED_OUTPUTS:
        if not path.is_file():
            raise DeterminismError(
                f"Missing tracked output: {path.relative_to(ROOT)}"
            )
        key = str(path.relative_to(ROOT)).replace("\\", "/")
        result[key] = sha256(path)

    record_paths = sorted(RECORD_DIR.glob("*.json"))
    if len(record_paths) != 253:
        raise DeterminismError(
            f"Expected 253 adjudication records, found {len(record_paths)}"
        )

    for path in record_paths:
        key = str(path.relative_to(ROOT)).replace("\\", "/")
        result[key] = sha256(path)

    return result


def run(script: str) -> None:
    result = subprocess.run(
        [sys.executable, script],
        cwd=ROOT,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=False,
    )
    if result.returncode != 0:
        raise DeterminismError(
            f"Command failed: {script}\n{result.stdout}"
        )


def main() -> int:
    try:
        before = snapshot()

        for script in COMMANDS:
            run(script)

        after_first = snapshot()
        if before != after_first:
            changed = sorted(
                key
                for key in set(before) | set(after_first)
                if before.get(key) != after_first.get(key)
            )
            raise DeterminismError(
                "First regeneration changed execution outputs: "
                + ", ".join(changed)
            )

        for script in COMMANDS:
            run(script)

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

        print("Phase 2.14 adjudication determinism: PASS")
        print("adjudicationRecords             : 253")
        print("regenerationPasses              : 2")
        print("changedOutputs                  : 0")
        print("idempotenceErrors               : 0")
        return 0

    except DeterminismError as exc:
        print("Phase 2.14 adjudication determinism: FAIL")
        print("idempotenceErrors               : 1")
        print(f"ERROR: {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
