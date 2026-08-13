from __future__ import annotations

from pathlib import Path
import hashlib
import json
import re
import urllib.request

ROOT = Path(__file__).resolve().parents[2]

LEGACY_DATA = ROOT / "legacy" / "v1" / "data"
REGISTRY = ROOT / "spec" / "sources" / "registry.json"

EVIDENCE_DIR = ROOT / "spec" / "fa-ir" / "evidence"
DOCS_DIR = ROOT / "docs" / "standards"

OUTPUT_JSON = EVIDENCE_DIR / "core-alphabet.json"
OUTPUT_MD = DOCS_DIR / "core-alphabet-audit.md"

STABLE_COMMIT = "092e56062d1771b3ca9080651375284adaa5dfad"
DRAFT_COMMIT = "d47d3f9caa67163bc57aa7f0caf6ccb1ece7b417"

STABLE_URL = (
    "https://raw.githubusercontent.com/liblouis/liblouis/"
    f"{STABLE_COMMIT}/tables/fa-ir-g1.utb"
)
DRAFT_URL = (
    "https://raw.githubusercontent.com/liblouis/liblouis/"
    f"{DRAFT_COMMIT}/tables/fa-ir-g1.utb"
)

STABLE_SHA256 = "07396A4225C20F8725BF0150C5282CFB0419D290B18CBBCD38DB087DFFDB5D48"
DRAFT_SHA256 = "CFA4ACF6B6B488E339D2D5AEF385BBDCAF6B6D8FFF30B8012F39B965B649BD13"

# The 32 core letters of the modern Persian alphabet.
CORE_PERSIAN = [
    "ا", "ب", "پ", "ت", "ث", "ج", "چ", "ح",
    "خ", "د", "ذ", "ر", "ز", "ژ", "س", "ش",
    "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق",
    "ک", "گ", "ل", "م", "ن", "و", "ه", "ی",
]


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest().upper()


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        handle.write(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        handle.write(text.rstrip() + "\n")


def fetch_pinned(url: str, expected_sha256: str) -> str:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "Persian-to-Braille-standards-audit/1"},
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        data = response.read()

    actual = sha256_bytes(data)
    if actual != expected_sha256:
        raise RuntimeError(
            f"Pinned source hash mismatch for {url}\n"
            f"expected={expected_sha256}\nactual={actual}"
        )

    return data.decode("utf-8")


def parse_sign_mappings(table_text: str) -> dict[str, str]:
    result: dict[str, str] = {}
    pattern = re.compile(
        r"^\s*sign\s+\\x([0-9A-Fa-f]{4,6})\s+([0-8-]+)(?:\s|$)"
    )

    for line in table_text.splitlines():
        match = pattern.match(line)
        if not match:
            continue

        char = chr(int(match.group(1), 16))
        dots = match.group(2)
        result[char] = dots

    return result


def legacy_map(filename: str) -> dict[str, str]:
    payload = read_json(LEGACY_DATA / filename)
    return {
        row["source"]: row["target"]
        for row in payload["mappings"]
    }


def dots_cell_to_unicode(cell: str) -> str:
    if not cell or any(ch not in "12345678" for ch in cell):
        raise ValueError(f"Not a single Braille cell: {cell!r}")

    bits = 0
    for dot in cell:
        bits |= 1 << (int(dot) - 1)

    return chr(0x2800 + bits)


def codepoint(char: str) -> str:
    return f"U+{ord(char):04X}"


registry = read_json(REGISTRY)
registry_ids = {source["id"] for source in registry["sources"]}

required_sources = {
    "SRC-IR-1393",
    "SRC-LIBLOUIS-G1",
    "SRC-LIBLOUIS-2053",
    "SRC-LIBLOUIS-2054",
    "SRC-LEGACY-V1",
    "SRC-UNICODE-BRAILLE",
}
missing_sources = required_sources - registry_ids
if missing_sources:
    raise RuntimeError(
        "Missing source registry entries: " + ", ".join(sorted(missing_sources))
    )

stable_text = fetch_pinned(STABLE_URL, STABLE_SHA256)
draft_text = fetch_pinned(DRAFT_URL, DRAFT_SHA256)

stable = parse_sign_mappings(stable_text)
draft = parse_sign_mappings(draft_text)

legacy_word = legacy_map("word-mappings.json")
legacy_excel = legacy_map("excel-mappings.json")
legacy_sql = legacy_map("sql-mappings.json")

rows = []

for index, char in enumerate(CORE_PERSIAN, 1):
    stable_dots = stable.get(char)
    draft_dots = draft.get(char)

    if stable_dots is None:
        raise RuntimeError(
            f"Stable Liblouis table is missing core Persian letter {char!r}"
        )
    if draft_dots is None:
        raise RuntimeError(
            f"Draft Liblouis table is missing core Persian letter {char!r}"
        )
    if "-" in stable_dots:
        raise RuntimeError(
            f"Expected one-cell core alphabet mapping for {char!r}, got {stable_dots!r}"
        )

    stable_draft_match = stable_dots == draft_dots

    rows.append(
        {
            "id": f"FA-CORE-{index:03d}",
            "character": char,
            "codePoint": codepoint(char),
            "liblouisStable": {
                "source": "SRC-LIBLOUIS-G1",
                "dots": stable_dots,
            },
            "liblouisDraft": {
                "source": "SRC-LIBLOUIS-2054",
                "dots": draft_dots,
            },
            "iran1393": {
                "source": "SRC-IR-1393",
                "evidenceVia": "SRC-LIBLOUIS-2053",
                "printedPages": [32, 33],
                "directlyAuditedFromPdfByThisProject": False,
                "status": "reported-match-to-stable-core-alphabet",
                "reportedDots": stable_dots,
            },
            "unicodeBraille": {
                "source": "SRC-UNICODE-BRAILLE",
                "character": dots_cell_to_unicode(stable_dots),
                "codePoint": codepoint(dots_cell_to_unicode(stable_dots)),
            },
            "legacy": {
                "source": "SRC-LEGACY-V1",
                "word": legacy_word.get(char),
                "excel": legacy_excel.get(char),
                "sql": legacy_sql.get(char),
            },
            "comparison": {
                "stableEqualsDraft": stable_draft_match,
                "manualAuditReportsStableMatch": True,
            },
            "normativeDecision": "pending",
        }
    )

summary = {
    "coreLetters": len(rows),
    "stableMapped": sum(1 for row in rows if row["liblouisStable"]["dots"]),
    "draftMapped": sum(1 for row in rows if row["liblouisDraft"]["dots"]),
    "stableDraftExactMatches": sum(
        1 for row in rows if row["comparison"]["stableEqualsDraft"]
    ),
    "manualReportedCoreMatches": sum(
        1 for row in rows
        if row["comparison"]["manualAuditReportsStableMatch"]
    ),
    "normativeDecisionsPending": sum(
        1 for row in rows if row["normativeDecision"] == "pending"
    ),
}

payload = {
    "schemaVersion": 1,
    "auditStage": "1.2",
    "scope": "32 core modern Persian alphabet letters",
    "normative": False,
    "sourcePins": {
        "liblouisStable": {
            "commit": STABLE_COMMIT,
            "sha256": STABLE_SHA256,
            "url": STABLE_URL,
        },
        "liblouisDraft": {
            "commit": DRAFT_COMMIT,
            "sha256": DRAFT_SHA256,
            "url": DRAFT_URL,
        },
    },
    "manualEvidencePolicy": (
        "The Iranian 1393/2014 manual has not been directly extracted by this "
        "project in Stage 1.2. Manual core-alphabet evidence is recorded as "
        "secondary evidence through SRC-LIBLOUIS-2053, which reports that "
        "printed pages 32-33 match the current Liblouis core alphabet."
    ),
    "summary": summary,
    "rows": rows,
}

write_json(OUTPUT_JSON, payload)

md = []
md.append("# Persian Braille Core Alphabet Audit")
md.append("")
md.append("Audit stage: **1.2**")
md.append("")
md.append(
    "This audit covers the 32 core letters of the modern Persian alphabet. "
    "It is an evidence matrix, not yet a normative v2 specification."
)
md.append("")
md.append("## Evidence Handling")
md.append("")
md.append(
    "- Liblouis stable evidence is pinned to commit "
    f"`{STABLE_COMMIT}`."
)
md.append(
    "- Liblouis draft evidence is pinned to commit "
    f"`{DRAFT_COMMIT}`."
)
md.append(
    "- The Iranian 1393/2014 manual is not represented here as a direct "
    "project transcription. `SRC-LIBLOUIS-2053` reports that printed pages "
    "32-33 match the current core alphabet; this is explicitly recorded as "
    "secondary evidence."
)
md.append(
    "- Legacy v1 values remain historical evidence only."
)
md.append("- Every normative decision remains `pending` in Stage 1.2.")
md.append("")
md.append("## Summary")
md.append("")
for key, value in summary.items():
    md.append(f"- `{key}`: {value}")
md.append("")
md.append("## Matrix")
md.append("")
md.append(
    "| ID | Letter | Code point | Stable dots | Draft dots | "
    "Unicode Braille | Legacy Word | Legacy Excel | Legacy SQL | Decision |"
)
md.append(
    "|---|---|---|---:|---:|---|---|---|---|---|"
)

for row in rows:
    def shown(value):
        if value is None:
            return "—"
        return f"`{value}`"

    md.append(
        f"| {row['id']} | {row['character']} | `{row['codePoint']}` | "
        f"`{row['liblouisStable']['dots']}` | "
        f"`{row['liblouisDraft']['dots']}` | "
        f"{row['unicodeBraille']['character']} "
        f"`{row['unicodeBraille']['codePoint']}` | "
        f"{shown(row['legacy']['word'])} | "
        f"{shown(row['legacy']['excel'])} | "
        f"{shown(row['legacy']['sql'])} | "
        f"`{row['normativeDecision']}` |"
    )

md.append("")
md.append("## Stage 1.2 Findings")
md.append("")
md.append(
    "All 32 core Persian letters are mapped in both pinned Liblouis tables."
)
md.append(
    "The stable and draft Liblouis mappings are identical for all 32 core letters."
)
md.append(
    "The external audit in `SRC-LIBLOUIS-2053` reports that the Iranian "
    "1393/2014 manual's core alphabet on printed pages 32-33 agrees with the "
    "current Liblouis table, including Persian kaf and Persian yeh."
)
md.append(
    "This supports a strong core-alphabet consensus candidate, but Stage 1.2 "
    "does not promote those mappings to normative project rules."
)
md.append("")
md.append("## Deferred")
md.append("")
md.append(
    "The following are intentionally excluded from this stage and require "
    "separate evidence matrices:"
)
md.append("")
md.append("- alef with madda and hamza forms")
md.append("- Arabic kaf / Arabic yeh aliases")
md.append("- teh marbuta and alef maksura")
md.append("- combining marks and vowel signs")
md.append("- punctuation and symbols")
md.append("- digits and numeric contexts")
md.append("- ZWNJ, NBSP, and bidi controls")
md.append("- embedded Latin")
md.append("- Ezafe normalization")
md.append("- eight-dot computer Braille")

write_text(OUTPUT_MD, "\n".join(md))

print("Core Persian alphabet audit built.")
print(f"Core letters                : {summary['coreLetters']}")
print(f"Stable mapped               : {summary['stableMapped']}")
print(f"Draft mapped                : {summary['draftMapped']}")
print(f"Stable/draft exact matches  : {summary['stableDraftExactMatches']}")
print(f"Manual reported core matches: {summary['manualReportedCoreMatches']}")
print(f"Normative decisions pending : {summary['normativeDecisionsPending']}")
print(f"Evidence JSON SHA-256       : {sha256_bytes(OUTPUT_JSON.read_bytes())}")
print(f"Audit Markdown SHA-256      : {sha256_bytes(OUTPUT_MD.read_bytes())}")
