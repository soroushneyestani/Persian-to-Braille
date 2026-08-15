from __future__ import annotations

from pathlib import Path
import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from typing import Callable

ROOT = Path(__file__).resolve().parents[2]

VALIDATOR = ROOT / "tools" / "spec" / "validate_phase2_spec.py"
REQUIREMENTS = ROOT / "requirements-spec.txt"

COPY_PATHS = [
    ROOT / "spec" / "sources" / "registry.json",
    ROOT / "spec" / "fa-ir" / "evidence" / "master-decision-matrix.json",
    ROOT / "spec" / "fa-ir" / "schema",
    ROOT / "spec" / "fa-ir" / "profiles" / "fa-ir-g1.json",
    ROOT / "spec" / "fa-ir" / "manifests" / "fa-ir-g1-materialization.json",
    ROOT / "spec" / "fa-ir" / "rules" / "records",
    ROOT / "spec" / "fa-ir" / "conformance" / "records",
    ROOT / "spec" / "fa-ir" / "promotions",
    VALIDATOR,
]

RULE_DIR_REL = Path("spec/fa-ir/rules/records")
CONF_DIR_REL = Path("spec/fa-ir/conformance/records")
MANIFEST_REL = Path("spec/fa-ir/manifests/fa-ir-g1-materialization.json")

LETTER_001 = "FA-G1-LETTER-001"
LETTER_001_FILE = RULE_DIR_REL / "fa-g1-letter-001.json"

ASTERISK_SINGLE = "FA-G1-PUNC-ASTERISK-SINGLE-001"
ASTERISK_SINGLE_FILE = (
    RULE_DIR_REL / "fa-g1-punc-asterisk-single-001.json"
)


@dataclass(frozen=True)
class NegativeCase:
    name: str
    mutate: Callable[[Path], None]
    expected_fragment: str


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value) -> None:
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        handle.write(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest().upper()


def braille_char(cell: str) -> str:
    if cell == "0":
        return chr(0x2800)

    value = 0
    for digit in cell:
        value |= 1 << (int(digit) - 1)
    return chr(0x2800 + value)


def copy_path(src: Path, dst_root: Path) -> None:
    rel = src.relative_to(ROOT)
    dst = dst_root / rel
    dst.parent.mkdir(parents=True, exist_ok=True)

    if src.is_dir():
        shutil.copytree(src, dst, dirs_exist_ok=True)
    else:
        shutil.copy2(src, dst)


def build_sandbox() -> tempfile.TemporaryDirectory:
    td = tempfile.TemporaryDirectory(prefix="persian-braille-negative-")
    root = Path(td.name)

    for src in COPY_PATHS:
        if not src.exists():
            td.cleanup()
            raise RuntimeError(f"Missing negative-test source path: {src}")
        copy_path(src, root)

    # PHASE11_RELEASE_CORRECTION_SANDBOX_COPY
    release_correction_src = (
        ROOT / "spec" / "fa-ir" / "governance" / "release-corrections"
    )
    release_correction_dst = (
        Path(td.name)
        / "spec" / "fa-ir" / "governance" / "release-corrections"
    )
    if not release_correction_src.is_dir():
        raise AssertionError(
            "Pristine source is missing governed release-correction inputs"
        )
    shutil.copytree(
        release_correction_src,
        release_correction_dst,
        dirs_exist_ok=True,
    )

    return td


def update_manifest_rule_hash(root: Path, rule_id: str) -> None:
    manifest_path = root / MANIFEST_REL
    manifest = read_json(manifest_path)

    matches = [row for row in manifest["rules"] if row["id"] == rule_id]
    if len(matches) != 1:
        raise RuntimeError(
            f"Expected exactly one manifest entry for {rule_id}, got {len(matches)}"
        )

    entry = matches[0]
    rule_path = root / entry["path"]
    entry["sha256"] = sha256(rule_path)
    write_json(manifest_path, manifest)


def run_validator(root: Path) -> subprocess.CompletedProcess[str]:
    validator = root / "tools" / "spec" / "validate_phase2_spec.py"
    return subprocess.run(
        [sys.executable, str(validator)],
        cwd=root,
        text=True,
        capture_output=True,
        timeout=30,
        check=False,
    )


def mutate_dot7(root: Path) -> None:
    path = root / LETTER_001_FILE
    rule = read_json(path)
    rule["output"]["cells"] = ["17"]
    rule["output"]["unicodeBraille"] = braille_char("17")
    write_json(path, rule)
    update_manifest_rule_hash(root, LETTER_001)


def mutate_broken_vector_reference(root: Path) -> None:
    path = root / LETTER_001_FILE
    rule = read_json(path)
    rule["conformance"]["vectorIds"] = ["FA-CONF-LETTER-999"]
    write_json(path, rule)
    update_manifest_rule_hash(root, LETTER_001)


def mutate_unknown_source(root: Path) -> None:
    path = root / LETTER_001_FILE
    rule = read_json(path)
    rule["evidence"]["sourceIds"].append("SRC-NEGATIVE-UNKNOWN")
    write_json(path, rule)
    update_manifest_rule_hash(root, LETTER_001)


def mutate_wrong_unicode_braille(root: Path) -> None:
    path = root / LETTER_001_FILE
    rule = read_json(path)
    # U+2802 (dot 2) deliberately disagrees with the unchanged dot-1 cell.
    rule["output"]["unicodeBraille"] = "\u2802"
    write_json(path, rule)
    update_manifest_rule_hash(root, LETTER_001)


def mutate_priority_overlap(root: Path) -> None:
    path = root / ASTERISK_SINGLE_FILE
    rule = read_json(path)
    # *** has priority 100. Making * priority 100 removes the required
    # precedence advantage of the longer/specific sequence.
    rule["priority"] = 100
    write_json(path, rule)
    update_manifest_rule_hash(root, ASTERISK_SINGLE)


CASES = [
    NegativeCase(
        name="dot7-in-six-dot-profile",
        mutate=mutate_dot7,
        expected_fragment="contains dot 7/8",
    ),
    NegativeCase(
        name="broken-rule-vector-reference",
        mutate=mutate_broken_vector_reference,
        expected_fragment="references missing vector",
    ),
    NegativeCase(
        name="unknown-source-id",
        mutate=mutate_unknown_source,
        expected_fragment="references unregistered source",
    ),
    NegativeCase(
        name="incorrect-unicode-braille",
        mutate=mutate_wrong_unicode_braille,
        expected_fragment="Rule Unicode Braille derivation",
    ),
    NegativeCase(
        name="priority-prefix-overlap",
        mutate=mutate_priority_overlap,
        expected_fragment=(
            "More-specific semantically overlapping prefix rule must have higher precedence"
        ),
    ),
]


def assert_pristine_baseline_passes() -> None:
    td = build_sandbox()
    try:
        result = run_validator(Path(td.name))
        output = (result.stdout or "") + (result.stderr or "")
        if result.returncode != 0:
            raise AssertionError(
                "Pristine sandbox validator baseline failed unexpectedly.\n"
                + output
            )
        if "Phase 2.3 specification validation: PASS" not in output:
            raise AssertionError(
                "Pristine sandbox did not emit the expected PASS marker.\n"
                + output
            )
    finally:
        td.cleanup()


def run_case(case: NegativeCase) -> None:
    td = build_sandbox()
    try:
        root = Path(td.name)
        case.mutate(root)

        result = run_validator(root)
        output = (result.stdout or "") + (result.stderr or "")

        if result.returncode == 0:
            raise AssertionError(
                f"Negative case {case.name!r} was incorrectly accepted.\n"
                + output
            )

        if "Phase 2.3 specification validation: FAIL" not in output:
            raise AssertionError(
                f"Negative case {case.name!r} failed without validator FAIL marker.\n"
                + output
            )

        if case.expected_fragment not in output:
            raise AssertionError(
                f"Negative case {case.name!r} failed for the wrong reason.\n"
                f"Expected fragment: {case.expected_fragment!r}\n"
                f"Output:\n{output}"
            )

        print(f"PASS negative fixture: {case.name}")
    finally:
        td.cleanup()


def main() -> int:
    assert_pristine_baseline_passes()
    print("PASS pristine validator baseline")

    for case in CASES:
        run_case(case)

    print()
    print("Phase 2.4 negative validator suite: PASS")
    print(f"Negative fixtures exercised : {len(CASES)}")
    print("Repository mutations        : 0 (temporary sandboxes only)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
