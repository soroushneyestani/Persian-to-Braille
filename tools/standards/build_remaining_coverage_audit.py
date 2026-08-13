from __future__ import annotations

from pathlib import Path
import hashlib
import json
import re
import unicodedata
import urllib.request

ROOT = Path(__file__).resolve().parents[2]

REGISTRY = ROOT / "spec" / "sources" / "registry.json"
EVIDENCE_DIR = ROOT / "spec" / "fa-ir" / "evidence"
DOCS_DIR = ROOT / "docs" / "standards"

OUTPUT_JSON = EVIDENCE_DIR / "remaining-coverage.json"
OUTPUT_MD = DOCS_DIR / "remaining-coverage-audit.md"

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

CORE = set("ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی")

ORTHOGRAPHIC_SCALARS = {
    "آ", "أ", "إ", "ؤ", "ئ", "ة", "ك", "ي", "ى", "ٰ", "ۀ", "ـ", "ٔ",
}

PUNCTUATION_FOCUSED = {
    "!", "?", "؟", ".", ",", "،", ";", "؛", ":", "-", "–", "—",
    "…", "*", "/", "%", "٪", "\u00A0", "(", ")",
}

LATIN = set(
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    "abcdefghijklmnopqrstuvwxyz"
)

ARABIC_INDIC_DIGITS = {chr(0x0660 + i) for i in range(10)}
PERSIAN_DIGITS = {chr(0x06F0 + i) for i in range(10)}

# U+200C is defined only by the stable Persian table; it was audited in
# Stages 1.3 and 1.6.
PERSIAN_LOCAL_FORMAT = {"\u200C"}

PREVIOUSLY_AUDITED_SCALARS = (
    CORE
    | ORTHOGRAPHIC_SCALARS
    | PUNCTUATION_FOCUSED
    | LATIN
    | ARABIC_INDIC_DIGITS
    | PERSIAN_DIGITS
    | PERSIAN_LOCAL_FORMAT
)

# Stage 1.4 already audited these directive identities. We intentionally leave
# quote/open-close punctuation, hyphen context, and similar rules for Stage 1.7.
PREVIOUSLY_AUDITED_CONTEXT_KEYS = {
    ("midnum", ","),
    ("midnum", "٬"),
    ("midnum", "/"),
    ("decpoint", "."),
    ("decpoint", "٫"),
    ("endnum", "%"),
}

KNOWN_UNMAPPED_OR_SEQUENCE_ONLY = [
    {
        "id": "FA-GAP-001",
        "text": "\u0654",
        "label": "ARABIC HAMZA ABOVE COMBINING MARK",
        "codePoints": ["U+0654"],
        "status": "unmapped-as-scalar-in-stable-and-draft",
        "crossReference": {
            "stage": "1.3",
            "evidenceId": "FA-VAR-013"
        },
        "decisionAccounting": "cross-reference-only",
        "note": (
            "The draft handles U+0654 in the explicit Ezafe sequence هٔ, "
            "but U+0654 remains unmapped as a standalone scalar. This gap was "
            "already audited as FA-VAR-013 in Stage 1.3, so Stage 1.7 records "
            "it as a coverage cross-reference rather than a second normative "
            "decision."
        ),
    },
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


def decode_token(token: str) -> str:
    if token.startswith(r"\x"):
        return chr(int(token[2:], 16))
    if token == r"\\":
        return "\\"
    return token


def parse_scalar_rules(text: str) -> dict[str, dict]:
    rows: dict[str, dict] = {}

    pattern = re.compile(
        r"^\s*(space|punctuation|sign|math|digit|uppercase|lowercase)\s+"
        r"(\\x[0-9A-Fa-f]{4,6}|\\\\|[^\s]+)\s+"
        r"([0-9A-Za-z-]+)(?:\s|$)",
        re.M,
    )

    for kind, token, dots in pattern.findall(text):
        char = decode_token(token)
        if len(char) != 1:
            continue
        rows[char] = {
            "kind": kind,
            "dots": dots,
        }

    return rows


def parse_context_rules(text: str) -> list[dict]:
    rows = []
    pattern = re.compile(
        r"^\s*(prepunc|postpunc|decpoint|midnum|endnum|hyphen)\s+"
        r"(\S+)\s+([0-9A-Za-z-]+)(?:\s|$)",
        re.M,
    )

    for directive, token, dots in pattern.findall(text):
        rows.append(
            {
                "directive": directive,
                "token": decode_token(token),
                "dots": dots,
            }
        )
    return rows


def parse_emphasis_rules(text: str) -> list[dict]:
    rows = []

    for line in text.splitlines():
        stripped = line.strip()

        match = re.match(r"^emphclass\s+(\S+)$", stripped)
        if match:
            rows.append(
                {
                    "directive": "emphclass",
                    "class": match.group(1),
                    "dots": None,
                }
            )
            continue

        match = re.match(
            r"^(begemph|endemph)\s+(\S+)\s+([0-9A-Za-z-]+)",
            stripped,
        )
        if match:
            directive, emph_class, dots = match.groups()
            rows.append(
                {
                    "directive": directive,
                    "class": emph_class,
                    "dots": dots,
                }
            )

    return rows


def cp(char: str) -> str:
    return f"U+{ord(char):04X}"


def dot78_exposed(dots: str | None) -> bool:
    if dots is None:
        return False
    return "7" in dots or "8" in dots


def category_for(char: str, kind: str) -> str:
    code = ord(char)

    if char == "\u0621":
        return "arabic-letter"
    if 0x064B <= code <= 0x0652:
        return "arabic-diacritic"
    if char in {"٫", "٬"}:
        return "numeric-separator"
    if char == "﷼":
        return "currency-symbol"
    if char in {"«", "»", "'", '"', "‘", "’", "“", "”", "„", "‟"}:
        return "quotation"
    if char in {"[", "]", "{", "}"}:
        return "bracket"
    if kind == "math":
        return "math-symbol"
    if unicodedata.category(char).startswith("P"):
        return "punctuation"
    if unicodedata.category(char).startswith("S"):
        return "symbol"
    return "other"


registry = read_json(REGISTRY)
registry_ids = {source["id"] for source in registry["sources"]}

required_sources = {
    "SRC-IR-1393",
    "SRC-LIBLOUIS-G1",
    "SRC-LIBLOUIS-2053",
    "SRC-LIBLOUIS-2054",
}
missing_sources = required_sources - registry_ids
if missing_sources:
    raise RuntimeError(
        "Missing source registry entries: "
        + ", ".join(sorted(missing_sources))
    )

stable_text = fetch_pinned(STABLE_URL, STABLE_SHA256)
draft_text = fetch_pinned(DRAFT_URL, DRAFT_SHA256)

stable_scalars = parse_scalar_rules(stable_text)
draft_scalars = parse_scalar_rules(draft_text)

scalar_union = set(stable_scalars) | set(draft_scalars)
remaining_chars = sorted(
    scalar_union - PREVIOUSLY_AUDITED_SCALARS,
    key=ord,
)

remaining_rows = []
for index, char in enumerate(remaining_chars, 1):
    stable = stable_scalars.get(char)
    draft = draft_scalars.get(char)

    stable_state = {
        "source": "SRC-LIBLOUIS-G1",
        "status": "mapped" if stable else "unmapped",
        "kind": stable["kind"] if stable else None,
        "dots": stable["dots"] if stable else None,
    }
    draft_state = {
        "source": "SRC-LIBLOUIS-2054",
        "status": "mapped" if draft else "unmapped",
        "kind": draft["kind"] if draft else None,
        "dots": draft["dots"] if draft else None,
    }

    reference = stable or draft
    category = category_for(char, reference["kind"])

    remaining_rows.append(
        {
            "id": f"FA-REM-{index:03d}",
            "character": char,
            "codePoint": cp(char),
            "unicodeName": unicodedata.name(char, "UNNAMED"),
            "unicodeCategory": unicodedata.category(char),
            "auditCategory": category,
            "liblouisStable": stable_state,
            "liblouisDraft": draft_state,
            "stableDraftExactMatch": (
                stable_state["status"],
                stable_state["kind"],
                stable_state["dots"],
            )
            == (
                draft_state["status"],
                draft_state["kind"],
                draft_state["dots"],
            ),
            "usesDot7Or8": dot78_exposed(reference["dots"]),
            "iran1393": {
                "source": "SRC-IR-1393",
                "evidenceVia": "SRC-LIBLOUIS-2053",
                "status": "mapping-not-verified-by-current-project-audit",
            },
            "normativeDecision": "pending",
        }
    )

stable_context = parse_context_rules(stable_text)
draft_context = parse_context_rules(draft_text)

def remaining_context(rows: list[dict]) -> list[dict]:
    return [
        row
        for row in rows
        if (row["directive"], row["token"])
        not in PREVIOUSLY_AUDITED_CONTEXT_KEYS
    ]

stable_remaining_context = remaining_context(stable_context)
draft_remaining_context = remaining_context(draft_context)

def context_map(rows: list[dict]) -> dict[tuple[str, str], str]:
    return {
        (row["directive"], row["token"]): row["dots"]
        for row in rows
    }

stable_context_map = context_map(stable_remaining_context)
draft_context_map = context_map(draft_remaining_context)

context_keys = sorted(
    set(stable_context_map) | set(draft_context_map),
    key=lambda item: (item[0], item[1]),
)

context_rows = []
for index, key in enumerate(context_keys, 1):
    directive, token = key
    stable_dots = stable_context_map.get(key)
    draft_dots = draft_context_map.get(key)

    context_rows.append(
        {
            "id": f"FA-REM-CTX-{index:03d}",
            "directive": directive,
            "token": token,
            "codePoints": [cp(ch) for ch in token],
            "liblouisStable": {
                "source": "SRC-LIBLOUIS-G1",
                "status": "present" if stable_dots is not None else "absent",
                "dots": stable_dots,
            },
            "liblouisDraft": {
                "source": "SRC-LIBLOUIS-2054",
                "status": "present" if draft_dots is not None else "absent",
                "dots": draft_dots,
            },
            "stableDraftExactMatch": stable_dots == draft_dots,
            "usesDot7Or8": (
                dot78_exposed(stable_dots)
                or dot78_exposed(draft_dots)
            ),
            "normativeDecision": "pending",
        }
    )

stable_emphasis = parse_emphasis_rules(stable_text)
draft_emphasis = parse_emphasis_rules(draft_text)

def emphasis_map(rows: list[dict]) -> dict[tuple[str, str], str | None]:
    return {
        (row["directive"], row["class"]): row["dots"]
        for row in rows
    }

stable_emphasis_map = emphasis_map(stable_emphasis)
draft_emphasis_map = emphasis_map(draft_emphasis)

emphasis_keys = sorted(
    set(stable_emphasis_map) | set(draft_emphasis_map),
    key=lambda item: (item[1], item[0]),
)

emphasis_rows = []
for index, key in enumerate(emphasis_keys, 1):
    directive, emph_class = key
    stable_dots = stable_emphasis_map.get(key)
    draft_dots = draft_emphasis_map.get(key)

    stable_present = key in stable_emphasis_map
    draft_present = key in draft_emphasis_map

    emphasis_rows.append(
        {
            "id": f"FA-REM-EMPH-{index:03d}",
            "directive": directive,
            "class": emph_class,
            "liblouisStable": {
                "source": "SRC-LIBLOUIS-G1",
                "status": "present" if stable_present else "absent",
                "dots": stable_dots,
            },
            "liblouisDraft": {
                "source": "SRC-LIBLOUIS-2054",
                "status": "present" if draft_present else "absent",
                "dots": draft_dots,
            },
            "stableDraftExactMatch": (
                stable_present,
                stable_dots,
            )
            == (
                draft_present,
                draft_dots,
            ),
            "usesDot7Or8": (
                dot78_exposed(stable_dots)
                or dot78_exposed(draft_dots)
            ),
            "normativeDecision": "pending",
        }
    )

summary = {
    "definedScalarUnion": len(scalar_union),
    "previouslyAuditedDefinedScalars": len(
        scalar_union & PREVIOUSLY_AUDITED_SCALARS
    ),
    "remainingScalarCases": len(remaining_rows),
    "remainingScalarStableDraftDifferences": sum(
        1 for row in remaining_rows if not row["stableDraftExactMatch"]
    ),
    "remainingScalarDot78Exposures": sum(
        1 for row in remaining_rows if row["usesDot7Or8"]
    ),
    "remainingContextCases": len(context_rows),
    "remainingContextStableDraftDifferences": sum(
        1 for row in context_rows if not row["stableDraftExactMatch"]
    ),
    "remainingContextDot78Exposures": sum(
        1 for row in context_rows if row["usesDot7Or8"]
    ),
    "emphasisCases": len(emphasis_rows),
    "emphasisStableDraftDifferences": sum(
        1 for row in emphasis_rows if not row["stableDraftExactMatch"]
    ),
    "emphasisDot78Exposures": sum(
        1 for row in emphasis_rows if row["usesDot7Or8"]
    ),
    "explicitKnownGapCases": len(KNOWN_UNMAPPED_OR_SEQUENCE_ONLY),
    "normativeDecisionsPending": (
        len(remaining_rows)
        + len(context_rows)
        + len(emphasis_rows)
    ),
}

expected = {
    "definedScalarUnion": 199,
    "previouslyAuditedDefinedScalars": 137,
    "remainingScalarCases": 62,
    "remainingScalarStableDraftDifferences": 0,
    "remainingScalarDot78Exposures": 18,
    "remainingContextCases": 15,
    "remainingContextStableDraftDifferences": 0,
    "remainingContextDot78Exposures": 5,
    "emphasisCases": 9,
    "emphasisStableDraftDifferences": 0,
    "emphasisDot78Exposures": 3,
    "explicitKnownGapCases": 1,
    "normativeDecisionsPending": 86,
}

for key, expected_value in expected.items():
    actual_value = summary[key]
    if actual_value != expected_value:
        raise RuntimeError(
            f"Unexpected Stage 1.7 summary for {key}: "
            f"expected={expected_value}, actual={actual_value}"
        )

# The pinned stable and draft tables intentionally leave the remaining 62
# scalar definitions unchanged. If this assertion fails, the audit baseline
# or parser has changed and requires review.
if any(not row["stableDraftExactMatch"] for row in remaining_rows):
    raise RuntimeError(
        "Unexpected stable/draft difference in remaining scalar inventory"
    )

dot78_rows = [
    row
    for row in remaining_rows
    if row["usesDot7Or8"]
]

payload = {
    "schemaVersion": 1,
    "auditStage": "1.7",
    "scope": (
        "Remaining scalar definitions, diacritics, quotes, symbols, "
        "contextual punctuation rules, emphasis indicators, and explicit "
        "coverage gaps after Stages 1.2-1.6"
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
    "coveragePolicy": {
        "description": (
            "Stage 1.7 inventories what remains in the pinned Grade-1 "
            "implementation after subtracting scalar domains already audited "
            "in Stages 1.2-1.6. Stable/draft agreement is implementation "
            "agreement only and does not establish normative Persian Braille."
        ),
        "dot78Policy": (
            "Any dot-7/dot-8 use in a literary six-dot Grade-1 profile remains "
            "flagged for explicit source review rather than silently converted."
        ),
    },
    "summary": summary,
    "remainingScalars": remaining_rows,
    "dot78ReviewQueue": [
        {
            "id": row["id"],
            "character": row["character"],
            "codePoint": row["codePoint"],
            "unicodeName": row["unicodeName"],
            "dots": row["liblouisStable"]["dots"],
            "auditCategory": row["auditCategory"],
            "decision": "pending-source-review",
        }
        for row in dot78_rows
    ],
    "remainingContextRules": context_rows,
    "emphasisRules": emphasis_rows,
    "knownGaps": KNOWN_UNMAPPED_OR_SEQUENCE_ONLY,
}

write_json(OUTPUT_JSON, payload)

md = []
md.append("# Persian Braille Remaining Coverage Audit")
md.append("")
md.append("Audit stage: **1.7**")
md.append("")
md.append(
    "This stage closes the implementation-coverage inventory left after "
    "Stages 1.2 through 1.6."
)
md.append("")
md.append(
    "Stable/draft agreement in this document is **not** treated as normative "
    "evidence by itself."
)
md.append("")
md.append("## Summary")
md.append("")
for key, value in summary.items():
    md.append(f"- `{key}`: {value}")

md.append("")
md.append("## Remaining scalar inventory")
md.append("")
md.append(
    "The pinned stable/draft scalar union contains 199 defined scalar "
    "characters. Previous audit stages cover 137 of those definitions. "
    "Stage 1.7 inventories the remaining 62."
)
md.append("")
md.append(
    "All 62 remaining scalar mappings are identical between the pinned stable "
    "and draft tables."
)
md.append("")
md.append("| ID | Character | Code point | Category | Kind | Dots | Dot 7/8 | Decision |")
md.append("|---|---|---|---|---|---|---|---|")
for row in remaining_rows:
    visible = row["character"]
    if visible == "\u00AD":
        visible = "SOFT HYPHEN"
    md.append(
        f"| {row['id']} | {visible} | `{row['codePoint']}` | "
        f"`{row['auditCategory']}` | "
        f"`{row['liblouisStable']['kind']}` | "
        f"`{row['liblouisStable']['dots']}` | "
        f"{'yes' if row['usesDot7Or8'] else 'no'} | "
        f"`{row['normativeDecision']}` |"
    )

md.append("")
md.append("## Dot-7 / Dot-8 review queue")
md.append("")
md.append(
    "The external audit explicitly warns that the literary Grade-1 table "
    "contains additional dot-7/dot-8 allocations requiring a complete "
    "follow-up audit. Stage 1.7 identifies 18 remaining scalar mappings with "
    "dot 7 or 8."
)
md.append("")
for row in dot78_rows:
    visible = row["character"]
    if visible == "\u00AD":
        visible = "SOFT HYPHEN"
    md.append(
        f"- `{row['codePoint']}` {visible} — "
        f"`{row['liblouisStable']['dots']}` "
        f"({row['auditCategory']})"
    )

md.append("")
md.append("## Remaining contextual punctuation")
md.append("")
md.append(
    "Fifteen contextual punctuation/hyphen rules remain after subtracting the "
    "number-directive cases explicitly audited in Stage 1.4. Stable and draft "
    "agree on all fifteen."
)
md.append("")
md.append("| Directive | Token | Stable | Draft | Dot 7/8 | Decision |")
md.append("|---|---|---|---|---|---|")
for row in context_rows:
    md.append(
        f"| `{row['directive']}` | `{row['token']}` | "
        f"`{row['liblouisStable']['dots']}` | "
        f"`{row['liblouisDraft']['dots']}` | "
        f"{'yes' if row['usesDot7Or8'] else 'no'} | "
        f"`{row['normativeDecision']}` |"
    )

md.append("")
md.append("## Emphasis indicators")
md.append("")
md.append(
    "The pinned Grade-1 tables contain nine emphasis declarations/rules for "
    "italic, bold, and underline. Stable and draft agree on all nine. Three "
    "indicator rules contain dot 7 or 8 and therefore remain in the explicit "
    "source-review queue."
)
md.append("")
md.append("| Directive | Class | Stable | Draft | Dot 7/8 | Decision |")
md.append("|---|---|---|---|---|---|")
for row in emphasis_rows:
    stable_value = row["liblouisStable"]["dots"]
    draft_value = row["liblouisDraft"]["dots"]
    md.append(
        f"| `{row['directive']}` | `{row['class']}` | "
        f"`{stable_value if stable_value is not None else 'class declaration'}` | "
        f"`{draft_value if draft_value is not None else 'class declaration'}` | "
        f"{'yes' if row['usesDot7Or8'] else 'no'} | "
        f"`{row['normativeDecision']}` |"
    )

md.append("")
md.append("## Explicit known gap")
md.append("")
md.append(
    "U+0654 ARABIC HAMZA ABOVE remains unmapped as a standalone scalar in "
    "both pinned tables. The draft does handle it inside the explicit Ezafe "
    "sequence `هٔ`, so scalar coverage and sequence normalization must remain "
    "distinct concepts."
)
md.append("")
md.append(
    "This is not counted as a second pending normative decision in Stage 1.7. "
    "The scalar itself was already audited as `FA-VAR-013` in Stage 1.3; "
    "`FA-GAP-001` is a coverage cross-reference only."
)
md.append("")
md.append("## Phase 1 consequence")
md.append("")
md.append(
    "After Stage 1.7, the project has a complete inventory of the scalar "
    "definitions present in the pinned Persian Grade-1 implementation, plus "
    "the contextual punctuation and emphasis rules intentionally deferred by "
    "the earlier focused audits."
)
md.append("")
md.append(
    "This closes implementation coverage inventory, but it does not close "
    "normative validation. The remaining source-review queue, especially "
    "dot-7/dot-8 literary mappings, quotations, symbols, and emphasis "
    "indicators, must be resolved before those rules can enter a normative "
    "Persian profile."
)
md.append("")
md.append("## Out of Grade-1 scope")
md.append("")
md.append(
    "Persian eight-dot computer Braille remains a separate future profile and "
    "must not be inferred from this six-dot literary Grade-1 inventory."
)

write_text(OUTPUT_MD, "\n".join(md))

print("Remaining coverage audit built.")
for key, value in summary.items():
    print(f"{key:43}: {value}")
print(f"Evidence JSON SHA-256                   : {sha256_bytes(OUTPUT_JSON.read_bytes())}")
print(f"Audit Markdown SHA-256                  : {sha256_bytes(OUTPUT_MD.read_bytes())}")
