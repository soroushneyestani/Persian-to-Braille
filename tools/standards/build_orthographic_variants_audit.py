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

OUTPUT_JSON = EVIDENCE_DIR / "orthographic-variants.json"
OUTPUT_MD = DOCS_DIR / "orthographic-variants-audit.md"

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

# Scalar orthographic variants and adjacent Arabic/Persian forms.
SCALARS = [
    {"id": "FA-VAR-001", "char": "آ", "label": "ARABIC LETTER ALEF WITH MADDA ABOVE"},
    {"id": "FA-VAR-002", "char": "أ", "label": "ARABIC LETTER ALEF WITH HAMZA ABOVE"},
    {"id": "FA-VAR-003", "char": "إ", "label": "ARABIC LETTER ALEF WITH HAMZA BELOW"},
    {"id": "FA-VAR-004", "char": "ؤ", "label": "ARABIC LETTER WAW WITH HAMZA ABOVE"},
    {"id": "FA-VAR-005", "char": "ئ", "label": "ARABIC LETTER YEH WITH HAMZA ABOVE"},
    {"id": "FA-VAR-006", "char": "ة", "label": "ARABIC LETTER TEH MARBUTA"},
    {"id": "FA-VAR-007", "char": "ك", "label": "ARABIC LETTER KAF"},
    {"id": "FA-VAR-008", "char": "ي", "label": "ARABIC LETTER YEH"},
    {"id": "FA-VAR-009", "char": "ى", "label": "ARABIC LETTER ALEF MAKSURA"},
    {"id": "FA-VAR-010", "char": "ٰ", "label": "ARABIC LETTER SUPERSCRIPT ALEF"},
    {"id": "FA-VAR-011", "char": "ۀ", "label": "ARABIC LETTER HEH WITH YEH ABOVE"},
    {"id": "FA-VAR-012", "char": "ـ", "label": "ARABIC TATWEEL"},
    {"id": "FA-VAR-013", "char": "ٔ", "label": "ARABIC HAMZA ABOVE COMBINING MARK"},
]

SEQUENCES = [
    {
        "id": "FA-SEQ-001",
        "text": "هٔ",
        "label": "HEH + COMBINING HAMZA ABOVE",
        "manualEvidence": {
            "source": "SRC-IR-1393",
            "evidenceVia": "SRC-LIBLOUIS-2053",
            "printedPage": 57,
            "status": "manual-reports-separate-yeh-for-ezafe",
        },
    },
    {
        "id": "FA-SEQ-002",
        "text": "ۀ",
        "label": "PRECOMPOSED HEH WITH YEH ABOVE",
        "manualEvidence": {
            "source": "SRC-IR-1393",
            "evidenceVia": "SRC-LIBLOUIS-2053",
            "printedPage": 57,
            "status": "unicode-spelling-not-directly-defined-by-print-era-manual",
        },
    },
    {
        "id": "FA-SEQ-003",
        "text": "ه‌ی",
        "label": "HEH + ZWNJ + PERSIAN YEH",
        "manualEvidence": {
            "source": "SRC-IR-1393",
            "evidenceVia": "SRC-LIBLOUIS-2053",
            "printedPage": 57,
            "status": "unicode-spelling-not-directly-defined-by-print-era-manual",
        },
    },
]

FORMAT_CONTROLS = [
    {"id": "FA-FMT-001", "char": "\u200C", "label": "ZERO WIDTH NON-JOINER"},
    {"id": "FA-FMT-002", "char": "\u200E", "label": "LEFT-TO-RIGHT MARK"},
    {"id": "FA-FMT-003", "char": "\u200F", "label": "RIGHT-TO-LEFT MARK"},
    {"id": "FA-FMT-004", "char": "\u202A", "label": "LEFT-TO-RIGHT EMBEDDING"},
    {"id": "FA-FMT-005", "char": "\u202B", "label": "RIGHT-TO-LEFT EMBEDDING"},
    {"id": "FA-FMT-006", "char": "\u202C", "label": "POP DIRECTIONAL FORMATTING"},
    {"id": "FA-FMT-007", "char": "\u202D", "label": "LEFT-TO-RIGHT OVERRIDE"},
    {"id": "FA-FMT-008", "char": "\u202E", "label": "RIGHT-TO-LEFT OVERRIDE"},
    {"id": "FA-FMT-009", "char": "\u2066", "label": "LEFT-TO-RIGHT ISOLATE"},
    {"id": "FA-FMT-010", "char": "\u2067", "label": "RIGHT-TO-LEFT ISOLATE"},
    {"id": "FA-FMT-011", "char": "\u2068", "label": "FIRST STRONG ISOLATE"},
    {"id": "FA-FMT-012", "char": "\u2069", "label": "POP DIRECTIONAL ISOLATE"},
]


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest().upper()


def codepoints(text: str) -> list[str]:
    return [f"U+{ord(ch):04X}" for ch in text]


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


def parse_table(table_text: str):
    single = {}
    replaces = set()
    always = []

    single_pattern = re.compile(
        r"^\s*(sign|space|punctuation|math|digit)\s+\\x([0-9A-Fa-f]{4,6})\s+([0-9a-zA-Z-]+)(?:\s|$)"
    )
    replace_pattern = re.compile(
        r"^\s*replace\s+\\x([0-9A-Fa-f]{4,6})\s*$"
    )
    always_pattern = re.compile(
        r'^\s*always\s+((?:\\x[0-9A-Fa-f]{4,6})+)\s+([0-9-]+)(?:\s|$)'
    )

    for line in table_text.splitlines():
        m = single_pattern.match(line)
        if m:
            kind, cp_hex, dots = m.groups()
            single[chr(int(cp_hex, 16))] = {"kind": kind, "dots": dots}
            continue

        m = replace_pattern.match(line)
        if m:
            replaces.add(chr(int(m.group(1), 16)))
            continue

        m = always_pattern.match(line)
        if m:
            encoded, dots = m.groups()
            chars = "".join(
                chr(int(cp_hex, 16))
                for cp_hex in re.findall(r"\\x([0-9A-Fa-f]{4,6})", encoded)
            )
            always.append({"text": chars, "dots": dots})

    return {"single": single, "replaces": replaces, "always": always}


def legacy_map(filename: str) -> dict[str, str]:
    payload = read_json(LEGACY_DATA / filename)
    return {row["source"]: row["target"] for row in payload["mappings"]}


def table_scalar(table, ch):
    if ch in table["single"]:
        return {
            "status": "mapped",
            **table["single"][ch],
        }
    if ch in table["replaces"]:
        return {
            "status": "ignored-by-replace",
            "kind": "replace",
            "dots": None,
        }
    return {
        "status": "unmapped",
        "kind": None,
        "dots": None,
    }


def sequence_rule(table, text):
    for row in table["always"]:
        if row["text"] == text:
            return {"status": "explicit-always-rule", "dots": row["dots"]}
    return {"status": "no-explicit-always-rule", "dots": None}


registry = read_json(REGISTRY)
registry_ids = {source["id"] for source in registry["sources"]}
required = {
    "SRC-IR-1393",
    "SRC-LIBLOUIS-G1",
    "SRC-LIBLOUIS-2053",
    "SRC-LIBLOUIS-2054",
    "SRC-LEGACY-V1",
}
missing = required - registry_ids
if missing:
    raise RuntimeError("Missing source IDs: " + ", ".join(sorted(missing)))

stable_text = fetch_pinned(STABLE_URL, STABLE_SHA256)
draft_text = fetch_pinned(DRAFT_URL, DRAFT_SHA256)
stable = parse_table(stable_text)
draft = parse_table(draft_text)

legacy_word = legacy_map("word-mappings.json")
legacy_excel = legacy_map("excel-mappings.json")
legacy_sql = legacy_map("sql-mappings.json")

scalar_rows = []
for item in SCALARS:
    ch = item["char"]

    manual = {
        "source": "SRC-IR-1393",
        "evidenceVia": "SRC-LIBLOUIS-2053",
        "status": "not-yet-established-for-this-scalar",
    }
    if ch == "\u0670":
        manual = {
            "source": "SRC-IR-1393",
            "evidenceVia": "SRC-LIBLOUIS-2053",
            "printedPage": 28,
            "status": "reported-dot-5",
            "reportedDots": "5",
        }

    scalar_rows.append(
        {
            **item,
            "codePoints": codepoints(ch),
            "liblouisStable": {
                "source": "SRC-LIBLOUIS-G1",
                **table_scalar(stable, ch),
            },
            "liblouisDraft": {
                "source": "SRC-LIBLOUIS-2054",
                **table_scalar(draft, ch),
            },
            "iran1393": manual,
            "legacy": {
                "source": "SRC-LEGACY-V1",
                "word": legacy_word.get(ch),
                "excel": legacy_excel.get(ch),
                "sql": legacy_sql.get(ch),
            },
            "normativeDecision": "pending",
        }
    )

sequence_rows = []
for item in SEQUENCES:
    sequence_rows.append(
        {
            **item,
            "codePoints": codepoints(item["text"]),
            "liblouisStable": {
                "source": "SRC-LIBLOUIS-G1",
                **sequence_rule(stable, item["text"]),
            },
            "liblouisDraft": {
                "source": "SRC-LIBLOUIS-2054",
                **sequence_rule(draft, item["text"]),
            },
            "normativeDecision": "pending",
        }
    )

format_rows = []
for item in FORMAT_CONTROLS:
    ch = item["char"]
    stable_state = table_scalar(stable, ch)
    draft_state = table_scalar(draft, ch)

    # ZWNJ is handled in the draft with a context rule rather than a plain
    # "replace" line. Record that explicitly from the pinned source text.
    if ch == "\u200C":
        if re.search(r'^\s*noback\s+context\s+"\\x200C"\s+\?\s*$', draft_text, re.M):
            draft_state = {
                "status": "ignored-by-context-rule",
                "kind": "noback-context",
                "dots": None,
            }

    format_rows.append(
        {
            **item,
            "codePoints": codepoints(ch),
            "liblouisStable": {
                "source": "SRC-LIBLOUIS-G1",
                **stable_state,
            },
            "liblouisDraft": {
                "source": "SRC-LIBLOUIS-2054",
                **draft_state,
            },
            "manualStatus": (
                "not-defined-by-print-era-manual"
                if ch == "\u200C"
                else "modern-unicode-format-control"
            ),
            "normativeDecision": "pending",
        }
    )

summary = {
    "scalarCases": len(scalar_rows),
    "sequenceCases": len(sequence_rows),
    "formatControlCases": len(format_rows),
    "scalarStableDraftDifferences": sum(
        1
        for row in scalar_rows
        if (
            row["liblouisStable"]["status"],
            row["liblouisStable"]["dots"],
        )
        != (
            row["liblouisDraft"]["status"],
            row["liblouisDraft"]["dots"],
        )
    ),
    "sequenceStableDraftDifferences": sum(
        1
        for row in sequence_rows
        if (
            row["liblouisStable"]["status"],
            row["liblouisStable"].get("dots"),
        )
        != (
            row["liblouisDraft"]["status"],
            row["liblouisDraft"].get("dots"),
        )
    ),
    "formatStableDraftDifferences": sum(
        1
        for row in format_rows
        if (
            row["liblouisStable"]["status"],
            row["liblouisStable"]["dots"],
        )
        != (
            row["liblouisDraft"]["status"],
            row["liblouisDraft"]["dots"],
        )
    ),
    "normativeDecisionsPending": (
        len(scalar_rows) + len(sequence_rows) + len(format_rows)
    ),
}

if summary["scalarStableDraftDifferences"] != 2:
    raise RuntimeError(
        f"Unexpected scalar difference count: {summary['scalarStableDraftDifferences']}"
    )
if summary["sequenceStableDraftDifferences"] != 2:
    raise RuntimeError(
        f"Unexpected sequence difference count: {summary['sequenceStableDraftDifferences']}"
    )
if summary["formatStableDraftDifferences"] != 12:
    raise RuntimeError(
        f"Unexpected format-control difference count: {summary['formatStableDraftDifferences']}"
    )
if summary["normativeDecisionsPending"] != 28:
    raise RuntimeError(
        f"Unexpected pending decision count: {summary['normativeDecisionsPending']}"
    )

payload = {
    "schemaVersion": 1,
    "auditStage": "1.3",
    "scope": (
        "Persian/Arabic orthographic variants, Ezafe Unicode spellings, "
        "and shaping/bidi format controls"
    ),
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
    "summary": summary,
    "scalars": scalar_rows,
    "sequences": sequence_rows,
    "formatControls": format_rows,
}

write_json(OUTPUT_JSON, payload)

md = []
md.append("# Persian Braille Orthographic Variants Audit")
md.append("")
md.append("Audit stage: **1.3**")
md.append("")
md.append(
    "This stage audits Persian/Arabic code-point variants, several related "
    "Arabic scalars, Ezafe spellings, and non-printing Unicode format controls."
)
md.append("")
md.append(
    "No row in this document is normative yet; all decisions remain pending."
)
md.append("")
md.append("## Summary")
md.append("")
for key, value in summary.items():
    md.append(f"- `{key}`: {value}")

md.append("")
md.append("## Scalar Matrix")
md.append("")
md.append(
    "| ID | Character | Code point | Stable | Draft | Legacy Word | "
    "Legacy Excel | Legacy SQL | Manual evidence | Decision |"
)
md.append("|---|---|---|---|---|---|---|---|---|---|")

for row in scalar_rows:
    def table_value(state):
        if state["status"] == "mapped":
            return f"`{state['dots']}`"
        return f"`{state['status']}`"

    manual = row["iran1393"]["status"]
    if row["iran1393"].get("reportedDots"):
        manual += f" (`{row['iran1393']['reportedDots']}`)"

    def legacy(value):
        return "—" if value is None else f"`{value}`"

    md.append(
        f"| {row['id']} | {row['char']} | `{row['codePoints'][0]}` | "
        f"{table_value(row['liblouisStable'])} | "
        f"{table_value(row['liblouisDraft'])} | "
        f"{legacy(row['legacy']['word'])} | "
        f"{legacy(row['legacy']['excel'])} | "
        f"{legacy(row['legacy']['sql'])} | "
        f"{manual} | `{row['normativeDecision']}` |"
    )

md.append("")
md.append("## Ezafe / Sequence Matrix")
md.append("")
md.append("| ID | Input | Code points | Stable | Draft | Manual evidence | Decision |")
md.append("|---|---|---|---|---|---|---|")
for row in sequence_rows:
    stable_text_value = row["liblouisStable"]["status"]
    if row["liblouisStable"].get("dots"):
        stable_text_value += f" `{row['liblouisStable']['dots']}`"
    draft_text_value = row["liblouisDraft"]["status"]
    if row["liblouisDraft"].get("dots"):
        draft_text_value += f" `{row['liblouisDraft']['dots']}`"

    md.append(
        f"| {row['id']} | `{row['text']}` | "
        f"`{' '.join(row['codePoints'])}` | {stable_text_value} | "
        f"{draft_text_value} | {row['manualEvidence']['status']} | "
        f"`{row['normativeDecision']}` |"
    )

md.append("")
md.append("## Unicode Format Controls")
md.append("")
md.append("| ID | Code point | Control | Stable | Draft | Decision |")
md.append("|---|---|---|---|---|---|")
for row in format_rows:
    md.append(
        f"| {row['id']} | `{' '.join(row['codePoints'])}` | {row['label']} | "
        f"`{row['liblouisStable']['status']}` | "
        f"`{row['liblouisDraft']['status']}` | "
        f"`{row['normativeDecision']}` |"
    )

md.append("")
md.append("## Key Stage 1.3 Observations")
md.append("")
md.append(
    "- Stable and draft both map Arabic kaf and Persian kaf to the same "
    "six-dot cell, and Arabic yeh and Persian yeh to the same six-dot cell."
)
md.append(
    "- The draft adds U+0670 ARABIC LETTER SUPERSCRIPT ALEF as dot 5, "
    "matching the source audit's report for printed page 28."
)
md.append(
    "- The draft adds explicit Ezafe normalization rules for `هٔ` and `ه‌ی`, "
    "while the stable table has no corresponding explicit `always` rules."
)
md.append(
    "- The stable table emits dot 8 for ZWNJ through a `space` mapping; the "
    "draft instead suppresses ZWNJ through a context rule."
)
md.append(
    "- The draft explicitly removes several Unicode bidi format controls "
    "with `replace` rules."
)
md.append("")
md.append("## Deferred")
md.append("")
md.append("- punctuation and typographic symbols")
md.append("- number contexts and fraction slash")
md.append("- embedded Latin spans")
md.append("- NBSP/layout semantics")
md.append("- combining vowel marks as a complete category")
md.append("- computer/eight-dot Braille")

write_text(OUTPUT_MD, "\n".join(md))

print("Orthographic variants audit built.")
for key, value in summary.items():
    print(f"{key:32}: {value}")
print(f"Evidence JSON SHA-256        : {sha256_bytes(OUTPUT_JSON.read_bytes())}")
print(f"Audit Markdown SHA-256       : {sha256_bytes(OUTPUT_MD.read_bytes())}")
