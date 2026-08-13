from __future__ import annotations

from pathlib import Path
import hashlib
import json

ROOT = Path(__file__).resolve().parents[2]
LEGACY = ROOT / "legacy" / "v1"
DATA = LEGACY / "data"
CONFORMANCE = LEGACY / "conformance"

WORD_JSON = DATA / "word-mappings.json"
EXCEL_JSON = DATA / "excel-mappings.json"
SQL_JSON = DATA / "sql-mappings.json"
COMPARISON_JSON = DATA / "mapping-comparison.json"

SEED_JSON = CONFORMANCE / "legacy-v1-seed.json"
MANIFEST_JSON = LEGACY / "manifest.json"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        handle.write(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest().upper()


def rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def build_vectors(prefix: str, evidence_source: str, payload: dict) -> list[dict]:
    vectors = []

    for mapping in payload["mappings"]:
        vectors.append(
            {
                "id": f"{prefix}-{mapping['index']:03d}",
                "normative": False,
                "evidenceSource": evidence_source,
                "input": mapping["source"],
                "inputCodePoints": mapping["sourceCodePoints"],
                "expectedLegacyValue": mapping["target"],
                "expectedLegacyValueCodePoints": mapping["targetCodePoints"],
            }
        )

    return vectors


def classify_legacy_file(path: Path) -> str:
    relative = path.relative_to(LEGACY).as_posix()

    if relative.startswith("source/"):
        return "recovered-source"
    if relative.startswith("database/"):
        return "recovered-data"
    if relative.startswith("docs/"):
        return "recovered-documentation"
    if relative.startswith("external-assets/"):
        return "external-asset-documentation"
    if relative.startswith("data/"):
        return "generated-audit-data"
    if relative.startswith("conformance/"):
        return "generated-legacy-test-data"
    if relative.startswith("README"):
        return "legacy-documentation"

    return "legacy-artifact"


word = load_json(WORD_JSON)
excel = load_json(EXCEL_JSON)
sql = load_json(SQL_JSON)
comparison = load_json(COMPARISON_JSON)

seed = {
    "schemaVersion": 1,
    "dataset": "persian-to-braille-legacy-v1",
    "normative": False,
    "purpose": (
        "Historical compatibility and regression evidence only. "
        "These vectors do not define normative Persian Braille v2 behavior."
    ),
    "counts": {
        "word": word["mappingCount"],
        "excel": excel["mappingCount"],
        "sql": sql["mappingCount"],
        "uniqueSources": comparison["summary"]["uniqueSources"],
        "allThreeExactMatch": comparison["summary"]["allThreeExactMatch"],
        "conflict": comparison["summary"]["conflict"],
        "partialExactMatch": comparison["summary"]["partialExactMatch"],
        "singleSourceOnly": comparison["summary"]["singleSourceOnly"],
    },
    "vectors": {
        "word": build_vectors("LEGACY-WORD", "word-vba", word),
        "excel": build_vectors("LEGACY-EXCEL", "excel-vba", excel),
        "sql": build_vectors("LEGACY-SQL", "sql-table", sql),
    },
    "comparisonCases": [
        {
            "id": f"LEGACY-COMP-{index:03d}",
            "normative": False,
            "source": row["source"],
            "sourceCodePoints": row["sourceCodePoints"],
            "word": row["word"],
            "excel": row["excel"],
            "sql": row["sql"],
            "status": row["status"],
        }
        for index, row in enumerate(comparison["rows"], 1)
    ],
}

write_json(SEED_JSON, seed)

# Build a deterministic inventory after the conformance seed exists.
artifact_entries = []

for path in sorted(
    (p for p in LEGACY.rglob("*") if p.is_file() and p != MANIFEST_JSON),
    key=lambda p: p.relative_to(LEGACY).as_posix(),
):
    artifact_entries.append(
        {
            "path": rel(path),
            "classification": classify_legacy_file(path),
            "sha256": sha256(path),
            "sizeBytes": path.stat().st_size,
        }
    )

manifest = {
    "schemaVersion": 1,
    "archive": "Persian-to-Braille v1",
    "normative": False,
    "historicalPeriod": "Mehr 1395 SH / 2016",
    "preservationPolicy": {
        "recoveredSourceFilesAreHistoricalEvidence": True,
        "legacyDefectsAreNotSilentlyCorrected": True,
        "thirdPartyFontsRedistributed": False,
        "v2RulesMayNotBeDerivedSolelyFromLegacyBehavior": True,
    },
    "documentedExternalAssets": [
        {
            "name": "BRAILLE.ttf",
            "fontName": "Braille 3D",
            "presentInRepository": False,
            "sha256": "CBA6C96D4023AECE909B26FB95FED89FDF390841C93A512C850EE58593633C70",
        },
        {
            "name": "BRAILLE1.ttf",
            "fontName": "Braille Normal",
            "presentInRepository": False,
            "sha256": "92934DEA3EFD78161541944A8697FC7124ACB57D8685533F42DCD9C217864CF9",
        },
        {
            "name": "Swell Braille",
            "presentInRepository": False,
            "sha256": None,
            "status": "Referenced by recovered Excel VBA; matching font file not recovered.",
        },
    ],
    "artifacts": artifact_entries,
}

write_json(MANIFEST_JSON, manifest)

print("Legacy conformance seed and archive manifest built.")
print(f"Word vectors       : {len(seed['vectors']['word'])}")
print(f"Excel vectors      : {len(seed['vectors']['excel'])}")
print(f"SQL vectors        : {len(seed['vectors']['sql'])}")
print(f"Comparison cases   : {len(seed['comparisonCases'])}")
print(f"Manifest artifacts : {len(artifact_entries)}")
print(f"Seed SHA-256       : {sha256(SEED_JSON)}")
print(f"Manifest SHA-256   : {sha256(MANIFEST_JSON)}")
