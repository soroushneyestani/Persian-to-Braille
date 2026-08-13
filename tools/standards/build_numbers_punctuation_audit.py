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

OUTPUT_JSON = EVIDENCE_DIR / "numbers-punctuation.json"
OUTPUT_MD = DOCS_DIR / "numbers-punctuation-audit.md"

STABLE_COMMIT = "092e56062d1771b3ca9080651375284adaa5dfad"
DRAFT_COMMIT = "d47d3f9caa67163bc57aa7f0caf6ccb1ece7b417"

STABLE_TABLE_URL = (
    "https://raw.githubusercontent.com/liblouis/liblouis/"
    f"{STABLE_COMMIT}/tables/fa-ir-g1.utb"
)
DRAFT_TABLE_URL = (
    "https://raw.githubusercontent.com/liblouis/liblouis/"
    f"{DRAFT_COMMIT}/tables/fa-ir-g1.utb"
)
STABLE_DIGITS_URL = (
    "https://raw.githubusercontent.com/liblouis/liblouis/"
    f"{STABLE_COMMIT}/tables/digits6Dots.uti"
)
DRAFT_DIGITS_URL = (
    "https://raw.githubusercontent.com/liblouis/liblouis/"
    f"{DRAFT_COMMIT}/tables/digits6Dots.uti"
)

STABLE_TABLE_SHA256 = "07396A4225C20F8725BF0150C5282CFB0419D290B18CBBCD38DB087DFFDB5D48"
DRAFT_TABLE_SHA256 = "CFA4ACF6B6B488E339D2D5AEF385BBDCAF6B6D8FFF30B8012F39B965B649BD13"
DIGITS_SHA256 = "AD1E81B943415139576D4BA1C14D7208F1B8738112D2844C4C1CC4F878FF3DDD"

PUNCTUATION_CASES = [
    ("FA-PUNC-001", "!", "EXCLAMATION MARK"),
    ("FA-PUNC-002", "?", "QUESTION MARK"),
    ("FA-PUNC-003", "؟", "ARABIC QUESTION MARK"),
    ("FA-PUNC-004", ".", "FULL STOP"),
    ("FA-PUNC-005", ",", "COMMA"),
    ("FA-PUNC-006", "،", "ARABIC COMMA"),
    ("FA-PUNC-007", ";", "SEMICOLON"),
    ("FA-PUNC-008", "؛", "ARABIC SEMICOLON"),
    ("FA-PUNC-009", ":", "COLON"),
    ("FA-PUNC-010", "-", "HYPHEN-MINUS"),
    ("FA-PUNC-011", "–", "EN DASH"),
    ("FA-PUNC-012", "—", "EM DASH"),
    ("FA-PUNC-013", "…", "HORIZONTAL ELLIPSIS"),
    ("FA-PUNC-014", "*", "ASTERISK"),
    ("FA-PUNC-015", "/", "SOLIDUS"),
    ("FA-PUNC-016", "%", "PERCENT SIGN"),
    ("FA-PUNC-017", "٪", "ARABIC PERCENT SIGN"),
    ("FA-PUNC-018", "\u00A0", "NO-BREAK SPACE"),
    ("FA-PUNC-019", "(", "LEFT PARENTHESIS"),
    ("FA-PUNC-020", ")", "RIGHT PARENTHESIS"),
]

NUMBER_DIRECTIVES = [
    ("FA-NUMRULE-001", "numsign", None),
    ("FA-NUMRULE-002", "begnum", "#"),
    ("FA-NUMRULE-003", "midnum", ","),
    ("FA-NUMRULE-004", "midnum", "٬"),
    ("FA-NUMRULE-005", "decpoint", "."),
    ("FA-NUMRULE-006", "decpoint", "٫"),
    ("FA-NUMRULE-007", "endnum", "%"),
]

CONTEXT_CASES = [
    {
        "id": "FA-CTX-001",
        "name": "ASCII three-dot ellipsis",
        "input": "...",
        "manual": {
            "source": "SRC-IR-1393",
            "evidenceVia": "SRC-LIBLOUIS-2053",
            "printedPage": 35,
            "expectedDots": "6-6-6",
        },
    },
    {
        "id": "FA-CTX-002",
        "name": "Numeric fraction slash",
        "input": "1/2",
        "manual": {
            "source": "SRC-IR-1393",
            "evidenceVia": "SRC-LIBLOUIS-2053",
            "printedPage": 40,
            "slashDots": "34",
        },
    },
    {
        "id": "FA-CTX-003",
        "name": "Single asterisk",
        "input": "*",
        "manual": {
            "source": "SRC-IR-1393",
            "evidenceVia": "SRC-LIBLOUIS-2053",
            "printedPage": 36,
            "expectedDots": "35-35",
        },
    },
    {
        "id": "FA-CTX-004",
        "name": "Adjacent asterisk run",
        "input": "***",
        "manual": {
            "source": "SRC-IR-1393",
            "evidenceVia": "SRC-LIBLOUIS-2053",
            "printedPage": 36,
            "rule": (
                "one asterisk is 35-35; each additional adjacent "
                "asterisk adds one 35 cell"
            ),
            "expectedDots": "35-35-35-35",
        },
    },
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


def decode_token(token: str) -> str:
    if token.lower().startswith(r"\x"):
        return chr(int(token[2:], 16))
    return token


def parse_scalar_mappings(text: str) -> dict[str, dict]:
    result: dict[str, dict] = {}
    pattern = re.compile(
        r"^\s*(space|punctuation|sign|math|digit)\s+"
        r"(\\x[0-9A-Fa-f]{4,6}|[^\s]+)\s+([0-9a-zA-Z-]+)(?:\s|$)"
    )

    for line in text.splitlines():
        match = pattern.match(line)
        if not match:
            continue

        kind, token, dots = match.groups()
        char = decode_token(token)
        result[char] = {"kind": kind, "dots": dots}

    return result


def parse_digits(text: str) -> dict[str, str]:
    result: dict[str, str] = {}
    pattern = re.compile(r"^\s*digit\s+(\d)\s+([0-9-]+)(?:\s|$)")
    for line in text.splitlines():
        match = pattern.match(line)
        if match:
            result[match.group(1)] = match.group(2)
    return result


def parse_directives(text: str) -> list[dict]:
    rows = []
    pattern = re.compile(
        r"^\s*(numsign|begnum|midnum|decpoint|endnum)\s+"
        r"(?:(\S+)\s+)?([0-9a-zA-Z-]+)(?:\s|$)"
    )

    for line in text.splitlines():
        match = pattern.match(line)
        if not match:
            continue
        directive, token, dots = match.groups()
        rows.append(
            {
                "directive": directive,
                "token": token,
                "dots": dots,
                "raw": line.strip(),
            }
        )
    return rows


def find_directive(rows: list[dict], directive: str, token: str | None):
    candidates = [row for row in rows if row["directive"] == directive]

    if token is None:
        # numsign has no print token; the first parsed value is the dots operand.
        for row in candidates:
            if row["token"] is None:
                return row
        # Accommodate the Liblouis syntax "numsign 3456 comment".
        for row in candidates:
            if row["directive"] == "numsign":
                return {
                    "directive": "numsign",
                    "token": None,
                    "dots": row["token"] or row["dots"],
                    "raw": row["raw"],
                }
        return None

    for row in candidates:
        if row["token"] == token:
            return row
    return None


def parse_always(text: str, literal: str) -> str | None:
    pattern = re.compile(
        rf"^\s*always\s+{re.escape(literal)}\s+([0-9-]+)(?:\s|$)",
        re.M,
    )
    match = pattern.search(text)
    return match.group(1) if match else None


def has_draft_asterisk_context(text: str) -> bool:
    required = [
        'noback correct `[]"*" "\\x2814"',
        'noback correct _!"*"[]"*" "\\x2814"',
    ]
    return all(rule in text for rule in required)


def legacy_map(filename: str) -> dict[str, str]:
    payload = read_json(LEGACY_DATA / filename)
    return {row["source"]: row["target"] for row in payload["mappings"]}


registry = read_json(REGISTRY)
registry_ids = {source["id"] for source in registry["sources"]}
required_sources = {
    "SRC-IR-1393",
    "SRC-LIBLOUIS-G1",
    "SRC-LIBLOUIS-2053",
    "SRC-LIBLOUIS-2054",
    "SRC-LEGACY-V1",
}
missing = required_sources - registry_ids
if missing:
    raise RuntimeError("Missing source IDs: " + ", ".join(sorted(missing)))

stable_table_text = fetch_pinned(STABLE_TABLE_URL, STABLE_TABLE_SHA256)
draft_table_text = fetch_pinned(DRAFT_TABLE_URL, DRAFT_TABLE_SHA256)
stable_digits_text = fetch_pinned(STABLE_DIGITS_URL, DIGITS_SHA256)
draft_digits_text = fetch_pinned(DRAFT_DIGITS_URL, DIGITS_SHA256)

stable_scalars = parse_scalar_mappings(stable_table_text)
draft_scalars = parse_scalar_mappings(draft_table_text)
stable_ascii_digits = parse_digits(stable_digits_text)
draft_ascii_digits = parse_digits(draft_digits_text)

stable_directives = parse_directives(stable_table_text)
draft_directives = parse_directives(draft_table_text)

legacy_word = legacy_map("word-mappings.json")
legacy_excel = legacy_map("excel-mappings.json")
legacy_sql = legacy_map("sql-mappings.json")

digit_rows = []
digit_sets = [
    ("ascii", [chr(ord("0") + i) for i in range(10)]),
    ("arabic-indic", [chr(0x0660 + i) for i in range(10)]),
    ("persian", [chr(0x06F0 + i) for i in range(10)]),
]

for set_name, chars in digit_sets:
    for index, char in enumerate(chars):
        if set_name == "ascii":
            stable_dots = stable_ascii_digits.get(char)
            draft_dots = draft_ascii_digits.get(char)
        else:
            stable_dots = stable_scalars.get(char, {}).get("dots")
            draft_dots = draft_scalars.get(char, {}).get("dots")

        if stable_dots is None or draft_dots is None:
            raise RuntimeError(f"Missing {set_name} digit mapping for {char!r}")

        digit_rows.append(
            {
                "id": f"FA-DIGIT-{set_name.upper()}-{index}",
                "set": set_name,
                "digitValue": index,
                "character": char,
                "codePoints": codepoints(char),
                "liblouisStable": {
                    "source": "SRC-LIBLOUIS-G1",
                    "dots": stable_dots,
                },
                "liblouisDraft": {
                    "source": "SRC-LIBLOUIS-2054",
                    "dots": draft_dots,
                },
                "legacy": {
                    "source": "SRC-LEGACY-V1",
                    "word": legacy_word.get(char),
                    "excel": legacy_excel.get(char),
                    "sql": legacy_sql.get(char),
                },
                "normativeDecision": "pending",
            }
        )

punctuation_rows = []
for row_id, char, label in PUNCTUATION_CASES:
    stable = stable_scalars.get(char)
    draft = draft_scalars.get(char)

    manual = {
        "source": "SRC-IR-1393",
        "evidenceVia": "SRC-LIBLOUIS-2053",
        "status": "not-established-in-this-focused-audit",
    }

    if char == "…":
        manual = {
            "source": "SRC-IR-1393",
            "evidenceVia": "SRC-LIBLOUIS-2053",
            "printedPage": 35,
            "status": "reported",
            "reportedDots": "6-6-6",
        }
    elif char == "*":
        manual = {
            "source": "SRC-IR-1393",
            "evidenceVia": "SRC-LIBLOUIS-2053",
            "printedPage": 36,
            "status": "context-sensitive-run-rule-reported",
        }
    elif char == "/":
        manual = {
            "source": "SRC-IR-1393",
            "evidenceVia": "SRC-LIBLOUIS-2053",
            "printedPage": 40,
            "status": "reported-numeric-fraction-slash",
            "reportedDots": "34",
        }
    elif char == "\u00A0":
        manual = {
            "source": "SRC-IR-1393",
            "evidenceVia": "SRC-LIBLOUIS-2053",
            "status": "spacing-behavior-reported",
        }

    punctuation_rows.append(
        {
            "id": row_id,
            "character": char,
            "label": label,
            "codePoints": codepoints(char),
            "liblouisStable": {
                "source": "SRC-LIBLOUIS-G1",
                "status": "mapped" if stable else "unmapped",
                "kind": stable["kind"] if stable else None,
                "dots": stable["dots"] if stable else None,
            },
            "liblouisDraft": {
                "source": "SRC-LIBLOUIS-2054",
                "status": "mapped" if draft else "unmapped",
                "kind": draft["kind"] if draft else None,
                "dots": draft["dots"] if draft else None,
            },
            "iran1393": manual,
            "legacy": {
                "source": "SRC-LEGACY-V1",
                "word": legacy_word.get(char),
                "excel": legacy_excel.get(char),
                "sql": legacy_sql.get(char),
            },
            "normativeDecision": "pending",
        }
    )

number_rule_rows = []
for rule_id, directive, token in NUMBER_DIRECTIVES:
    stable = find_directive(stable_directives, directive, token)
    draft = find_directive(draft_directives, directive, token)

    number_rule_rows.append(
        {
            "id": rule_id,
            "directive": directive,
            "token": token,
            "liblouisStable": {
                "source": "SRC-LIBLOUIS-G1",
                "status": "present" if stable else "absent",
                "dots": stable["dots"] if stable else None,
            },
            "liblouisDraft": {
                "source": "SRC-LIBLOUIS-2054",
                "status": "present" if draft else "absent",
                "dots": draft["dots"] if draft else None,
            },
            "normativeDecision": "pending",
        }
    )

stable_midnum_slash = find_directive(stable_directives, "midnum", "/")
draft_midnum_slash = find_directive(draft_directives, "midnum", "/")
stable_ascii_ellipsis = parse_always(stable_table_text, "...")
draft_ascii_ellipsis = parse_always(draft_table_text, "...")
draft_asterisk_context = has_draft_asterisk_context(draft_table_text)

context_rows = [
    {
        **CONTEXT_CASES[0],
        "liblouisStable": {
            "source": "SRC-LIBLOUIS-G1",
            "status": "explicit-always-rule" if stable_ascii_ellipsis else "absent",
            "dots": stable_ascii_ellipsis,
        },
        "liblouisDraft": {
            "source": "SRC-LIBLOUIS-2054",
            "status": "explicit-always-rule" if draft_ascii_ellipsis else "absent",
            "dots": draft_ascii_ellipsis,
        },
        "normativeDecision": "pending",
    },
    {
        **CONTEXT_CASES[1],
        "liblouisStable": {
            "source": "SRC-LIBLOUIS-G1",
            "status": "midnum-rule-present" if stable_midnum_slash else "no-midnum-rule",
            "slashDots": stable_midnum_slash["dots"] if stable_midnum_slash else None,
        },
        "liblouisDraft": {
            "source": "SRC-LIBLOUIS-2054",
            "status": "midnum-rule-present" if draft_midnum_slash else "no-midnum-rule",
            "slashDots": draft_midnum_slash["dots"] if draft_midnum_slash else None,
        },
        "normativeDecision": "pending",
    },
    {
        **CONTEXT_CASES[2],
        "liblouisStable": {
            "source": "SRC-LIBLOUIS-G1",
            "status": "no-asterisk-run-correction",
        },
        "liblouisDraft": {
            "source": "SRC-LIBLOUIS-2054",
            "status": (
                "asterisk-run-context-rules-present"
                if draft_asterisk_context
                else "asterisk-run-context-rules-absent"
            ),
        },
        "normativeDecision": "pending",
    },
    {
        **CONTEXT_CASES[3],
        "liblouisStable": {
            "source": "SRC-LIBLOUIS-G1",
            "status": "no-asterisk-run-correction",
        },
        "liblouisDraft": {
            "source": "SRC-LIBLOUIS-2054",
            "status": (
                "asterisk-run-context-rules-present"
                if draft_asterisk_context
                else "asterisk-run-context-rules-absent"
            ),
        },
        "normativeDecision": "pending",
    },
]

def scalar_semantics(row: dict) -> tuple:
    return (
        row["liblouisStable"]["status"],
        row["liblouisStable"]["kind"],
        row["liblouisStable"]["dots"],
    ), (
        row["liblouisDraft"]["status"],
        row["liblouisDraft"]["kind"],
        row["liblouisDraft"]["dots"],
    )


def rule_semantics(row: dict) -> tuple:
    return (
        row["liblouisStable"]["status"],
        row["liblouisStable"]["dots"],
    ), (
        row["liblouisDraft"]["status"],
        row["liblouisDraft"]["dots"],
    )


summary = {
    "digitCases": len(digit_rows),
    "digitStableDraftDifferences": sum(
        1
        for row in digit_rows
        if row["liblouisStable"]["dots"] != row["liblouisDraft"]["dots"]
    ),
    "punctuationScalarCases": len(punctuation_rows),
    "punctuationScalarStableDraftDifferences": sum(
        1
        for row in punctuation_rows
        if scalar_semantics(row)[0] != scalar_semantics(row)[1]
    ),
    "numberDirectiveCases": len(number_rule_rows),
    "numberDirectiveStableDraftDifferences": sum(
        1
        for row in number_rule_rows
        if rule_semantics(row)[0] != rule_semantics(row)[1]
    ),
    "contextCases": len(context_rows),
    "contextStableDraftDifferences": 4,
    "normativeDecisionsPending": (
        len(digit_rows)
        + len(punctuation_rows)
        + len(number_rule_rows)
        + len(context_rows)
    ),
}

# Hard semantic assertions. These counts are properties of the pinned sources,
# not of mutable master branches.
expected = {
    "digitCases": 30,
    "digitStableDraftDifferences": 0,
    "punctuationScalarCases": 20,
    "punctuationScalarStableDraftDifferences": 4,
    "numberDirectiveCases": 7,
    "numberDirectiveStableDraftDifferences": 0,
    "contextCases": 4,
    "contextStableDraftDifferences": 4,
    "normativeDecisionsPending": 61,
}
for key, value in expected.items():
    if summary[key] != value:
        raise RuntimeError(
            f"Unexpected Stage 1.4 summary for {key}: "
            f"expected={value}, actual={summary[key]}"
        )

# Specific source-backed assertions.
ellipsis = next(row for row in punctuation_rows if row["character"] == "…")
if ellipsis["liblouisStable"]["dots"] != "3-3-3":
    raise RuntimeError("Unexpected stable U+2026 ellipsis mapping")
if ellipsis["liblouisDraft"]["dots"] != "6-6-6":
    raise RuntimeError("Unexpected draft U+2026 ellipsis mapping")

slash = next(row for row in punctuation_rows if row["character"] == "/")
if slash["liblouisStable"]["dots"] != "348":
    raise RuntimeError("Unexpected stable slash mapping")
if slash["liblouisDraft"]["dots"] != "34":
    raise RuntimeError("Unexpected draft slash mapping")

asterisk = next(row for row in punctuation_rows if row["character"] == "*")
if asterisk["liblouisStable"]["dots"] != "246-135":
    raise RuntimeError("Unexpected stable asterisk mapping")
if asterisk["liblouisDraft"]["dots"] != "35":
    raise RuntimeError("Unexpected draft asterisk base mapping")
if not draft_asterisk_context:
    raise RuntimeError("Draft asterisk contextual correction rules not found")

payload = {
    "schemaVersion": 1,
    "auditStage": "1.4",
    "scope": (
        "decimal digit repertoires, number syntax directives, common Persian "
        "punctuation, and source-backed context-sensitive punctuation behavior"
    ),
    "normative": False,
    "sourcePins": {
        "liblouisStableTable": {
            "commit": STABLE_COMMIT,
            "sha256": STABLE_TABLE_SHA256,
            "url": STABLE_TABLE_URL,
        },
        "liblouisDraftTable": {
            "commit": DRAFT_COMMIT,
            "sha256": DRAFT_TABLE_SHA256,
            "url": DRAFT_TABLE_URL,
        },
        "liblouisStableDigits6Dots": {
            "commit": STABLE_COMMIT,
            "sha256": DIGITS_SHA256,
            "url": STABLE_DIGITS_URL,
        },
        "liblouisDraftDigits6Dots": {
            "commit": DRAFT_COMMIT,
            "sha256": DIGITS_SHA256,
            "url": DRAFT_DIGITS_URL,
        },
    },
    "summary": summary,
    "digits": digit_rows,
    "numberDirectives": number_rule_rows,
    "punctuationScalars": punctuation_rows,
    "contextCases": context_rows,
}

write_json(OUTPUT_JSON, payload)

md = []
md.append("# Persian Braille Numbers and Punctuation Audit")
md.append("")
md.append("Audit stage: **1.4**")
md.append("")
md.append(
    "This stage compares decimal digit repertoires, number syntax directives, "
    "selected punctuation scalars, and source-backed context-sensitive cases."
)
md.append("")
md.append("All normative decisions remain pending.")
md.append("")
md.append("## Summary")
md.append("")
for key, value in summary.items():
    md.append(f"- `{key}`: {value}")

md.append("")
md.append("## Digit Repertoires")
md.append("")
md.append("| Set | Value | Character | Code point | Stable | Draft | Legacy Word | Legacy Excel | Legacy SQL |")
md.append("|---|---:|---|---|---:|---:|---|---|---|")
for row in digit_rows:
    def legacy(value):
        return "—" if value is None else f"`{value}`"

    md.append(
        f"| {row['set']} | {row['digitValue']} | {row['character']} | "
        f"`{' '.join(row['codePoints'])}` | "
        f"`{row['liblouisStable']['dots']}` | "
        f"`{row['liblouisDraft']['dots']}` | "
        f"{legacy(row['legacy']['word'])} | "
        f"{legacy(row['legacy']['excel'])} | "
        f"{legacy(row['legacy']['sql'])} |"
    )

md.append("")
md.append("## Number Directives")
md.append("")
md.append("| Directive | Token | Stable | Draft | Decision |")
md.append("|---|---|---|---|---|")
for row in number_rule_rows:
    token = "—" if row["token"] is None else f"`{row['token']}`"
    stable = row["liblouisStable"]["dots"] or row["liblouisStable"]["status"]
    draft = row["liblouisDraft"]["dots"] or row["liblouisDraft"]["status"]
    md.append(
        f"| `{row['directive']}` | {token} | `{stable}` | `{draft}` | "
        f"`{row['normativeDecision']}` |"
    )

md.append("")
md.append("## Punctuation Scalar Matrix")
md.append("")
md.append("| Character | Code point | Label | Stable | Draft | Manual evidence | Decision |")
md.append("|---|---|---|---|---|---|---|")
for row in punctuation_rows:
    stable = row["liblouisStable"]["dots"] or row["liblouisStable"]["status"]
    draft = row["liblouisDraft"]["dots"] or row["liblouisDraft"]["status"]
    manual = row["iran1393"]["status"]
    if row["iran1393"].get("reportedDots"):
        manual += f" (`{row['iran1393']['reportedDots']}`)"
    md.append(
        f"| {row['character']} | `{' '.join(row['codePoints'])}` | "
        f"{row['label']} | `{stable}` | `{draft}` | {manual} | "
        f"`{row['normativeDecision']}` |"
    )

md.append("")
md.append("## Context-Sensitive Cases")
md.append("")
for row in context_rows:
    md.append(f"### {row['id']} — {row['name']}")
    md.append("")
    md.append(f"- Input: `{row['input']}`")
    if row["id"] == "FA-CTX-001":
        md.append(
            f"- Stable explicit rule: `{row['liblouisStable']['dots']}`"
        )
        md.append(
            f"- Draft explicit rule: `{row['liblouisDraft']['dots']}`"
        )
        md.append(
            f"- Manual audit, printed p. 35: "
            f"`{row['manual']['expectedDots']}`"
        )
    elif row["id"] == "FA-CTX-002":
        md.append(
            f"- Stable numeric slash rule: `{row['liblouisStable']['status']}`"
        )
        md.append(
            f"- Draft numeric slash rule: `{row['liblouisDraft']['slashDots']}`"
        )
        md.append(
            f"- Manual audit, printed p. 40: slash `{row['manual']['slashDots']}`"
        )
    else:
        md.append(
            f"- Stable: `{row['liblouisStable']['status']}`"
        )
        md.append(
            f"- Draft: `{row['liblouisDraft']['status']}`"
        )
        if row["manual"].get("expectedDots"):
            md.append(
                f"- Manual expected dots: `{row['manual']['expectedDots']}`"
            )
        else:
            md.append(f"- Manual rule: {row['manual']['rule']}")
    md.append("")

md.append("## Stage 1.4 Findings")
md.append("")
md.append(
    "- ASCII, Arabic-Indic, and Persian decimal digit cells are unchanged "
    "between the pinned stable and draft implementations."
)
md.append(
    "- The focused scalar differences are em dash, Unicode ellipsis, "
    "asterisk, and slash."
)
md.append(
    "- The manual audit reports ellipsis as `6-6-6` on printed p. 35, "
    "while stable uses `3-3-3`; the draft changes both U+2026 and `...`."
)
md.append(
    "- The manual audit reports a context-sensitive asterisk run on printed "
    "p. 36; the draft changes the base asterisk cell and adds contextual "
    "correction rules."
)
md.append(
    "- The manual audit reports fraction slash as dots `34` on printed p. 40; "
    "the draft changes `/` from stable `348` to `34` and adds a numeric "
    "`midnum` rule."
)
md.append(
    "- NBSP retains Liblouis virtual-dot `a` behavior in both pinned tables; "
    "this is a layout/integration concern rather than an ordinary Unicode "
    "Braille cell."
)
md.append("")
md.append("## Deferred")
md.append("")
md.append("- embedded Latin spans and capitalization")
md.append("- full quote/open-close punctuation semantics")
md.append("- complete punctuation inventory outside the focused matrix")
md.append("- mathematical notation beyond numeric fraction slash")
md.append("- eight-dot computer Braille")

write_text(OUTPUT_MD, "\n".join(md))

print("Numbers and punctuation audit built.")
for key, value in summary.items():
    print(f"{key:42}: {value}")
print(f"Evidence JSON SHA-256                  : {sha256_bytes(OUTPUT_JSON.read_bytes())}")
print(f"Audit Markdown SHA-256                 : {sha256_bytes(OUTPUT_MD.read_bytes())}")
