from __future__ import annotations

from pathlib import Path
import hashlib
import json
import shutil
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[2]

COPY_PATHS = [
    ROOT / "spec" / "fa-ir" / "governance" / "review-queue.json",
    ROOT / "spec" / "fa-ir" / "evidence" / "master-decision-matrix.json",
    ROOT / "spec" / "fa-ir" / "evidence" / "orthographic-variants.json",
    ROOT / "spec" / "fa-ir" / "evidence" / "numbers-punctuation.json",
    ROOT / "spec" / "fa-ir" / "evidence" / "mixed-latin.json",
    ROOT / "spec" / "fa-ir" / "evidence" / "whitespace-layout.json",
    ROOT / "spec" / "fa-ir" / "evidence" / "remaining-coverage.json",
    ROOT / "spec" / "fa-ir" / "profiles" / "fa-ir-g1.json",
    ROOT / "docs" / "standards" / "source-registry.md",
    ROOT / "spec" / "fa-ir" / "review" / "evidence-packets",
    ROOT / "tools" / "spec" / "validate_evidence_packets.py",
]

VALIDATOR_REL = Path("tools/spec/validate_evidence_packets.py")
MANIFEST_REL = Path("spec/fa-ir/review/evidence-packets/manifest.json")
PACKETS_REL = Path("spec/fa-ir/review/evidence-packets/records")


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value) -> None:
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        handle.write(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def packet_path(root: Path, decision_id: str) -> Path:
    return root / PACKETS_REL / (decision_id.lower() + ".json")


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest().upper()


def refresh_manifest_packet_hash(root: Path, decision_id: str) -> None:
    manifest_path = root / MANIFEST_REL
    manifest = read_json(manifest_path)
    packet = packet_path(root, decision_id)
    for entry in manifest["packets"]:
        if entry["decisionItemId"] == decision_id:
            entry["sha256"] = sha256(packet)
            write_json(manifest_path, manifest)
            return
    raise AssertionError(f"manifest entry not found for {decision_id}")


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
    print(f"PASS negative evidence-packet fixture: {label}")


def mutate_premature_promotion(root: Path) -> None:
    decision_id = "FA-VAR-013"
    path = packet_path(root, decision_id)
    data = read_json(path)
    data["review"]["promotionEligible"] = True
    write_json(path, data)
    refresh_manifest_packet_hash(root, decision_id)


def mutate_packet_evidence(root: Path) -> None:
    decision_id = "FA-VAR-013"
    path = packet_path(root, decision_id)
    data = read_json(path)
    data["masterDecision"]["classification"] = "CONSENSUS-CANDIDATE"
    write_json(path, data)
    refresh_manifest_packet_hash(root, decision_id)


def mutate_manifest_hash(root: Path) -> None:
    path = root / MANIFEST_REL
    data = read_json(path)
    for entry in data["packets"]:
        if entry["decisionItemId"] == "FA-VAR-013":
            entry["sha256"] = "0" * 64
            break
    write_json(path, data)


def mutate_drop_supplemental(root: Path) -> None:
    decision_id = "FA-REM-001"
    path = packet_path(root, decision_id)
    data = read_json(path)
    data["supplementalStageEvidenceRecords"] = []
    write_json(path, data)
    refresh_manifest_packet_hash(root, decision_id)


def mutate_registry_copy(root: Path) -> None:
    decision_id = "FA-VAR-013"
    path = packet_path(root, decision_id)
    data = read_json(path)
    if not data["sourceRegistryRecords"]:
        # Select a packet with source records if FA-VAR-013 legitimately has none.
        decision_id = "FA-FMT-001"
        path = packet_path(root, decision_id)
        data = read_json(path)
    if not data["sourceRegistryRecords"]:
        raise AssertionError("fixture could not find a packet with source registry records")
    data["sourceRegistryRecords"][0]["registrySection"] += "\nTAMPERED"
    write_json(path, data)
    refresh_manifest_packet_hash(root, decision_id)


def main() -> int:
    with sandbox() as td:
        assert_pass(Path(td), "pristine evidence-packet baseline")

    fixtures = [
        (
            "premature-promotion-eligibility",
            mutate_premature_promotion,
            "promotion eligibility FA-VAR-013",
        ),
        (
            "tampered-master-evidence-copy",
            mutate_packet_evidence,
            "master decision copy FA-VAR-013",
        ),
        (
            "incorrect-manifest-packet-hash",
            mutate_manifest_hash,
            "manifest hash FA-VAR-013",
        ),
        (
            "dropped-supplemental-evidence",
            mutate_drop_supplemental,
            "supplemental stage evidence FA-REM-001",
        ),
        (
            "tampered-source-registry-copy",
            mutate_registry_copy,
            "source registry records",
        ),
    ]

    for label, mutate, fragment in fixtures:
        with sandbox() as td:
            root = Path(td)
            mutate(root)
            assert_fail(root, label, fragment)

    print("")
    print("Phase 2.12 evidence packet negative suite: PASS")
    print(f"Negative fixtures exercised : {len(fixtures)}")
    print("Repository mutations        : 0 (temporary sandboxes only)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
