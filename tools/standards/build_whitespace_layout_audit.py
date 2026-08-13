from __future__ import annotations

from pathlib import Path
import hashlib
import json
import re
import urllib.request

ROOT = Path(__file__).resolve().parents[2]

REGISTRY = ROOT / "spec" / "sources" / "registry.json"
EVIDENCE_DIR = ROOT / "spec" / "fa-ir" / "evidence"
DOCS_DIR = ROOT / "docs" / "standards"

OUTPUT_JSON = EVIDENCE_DIR / "whitespace-layout.json"
OUTPUT_MD = DOCS_DIR / "whitespace-layout-audit.md"

STABLE_COMMIT = "092e56062d1771b3ca9080651375284adaa5dfad"
DRAFT_COMMIT = "d47d3f9caa67163bc57aa7f0caf6ccb1ece7b417"

STABLE_FA_URL = (
    "https://raw.githubusercontent.com/liblouis/liblouis/"
    f"{STABLE_COMMIT}/tables/fa-ir-g1.utb"
)
DRAFT_FA_URL = (
    "https://raw.githubusercontent.com/liblouis/liblouis/"
    f"{DRAFT_COMMIT}/tables/fa-ir-g1.utb"
)
STABLE_SPACES_URL = (
    "https://raw.githubusercontent.com/liblouis/liblouis/"
    f"{STABLE_COMMIT}/tables/spaces.uti"
)
DRAFT_SPACES_URL = (
    "https://raw.githubusercontent.com/liblouis/liblouis/"
    f"{DRAFT_COMMIT}/tables/spaces.uti"
)

STABLE_FA_SHA256 = "07396A4225C20F8725BF0150C5282CFB0419D290B18CBBCD38DB087DFFDB5D48"
DRAFT_FA_SHA256 = "CFA4ACF6B6B488E339D2D5AEF385BBDCAF6B6D8FFF30B8012F39B965B649BD13"
SPACES_SHA256 = "8FDD5A9F42CAA6F583540B026D7C5AF13760B02029CBD08C052B2393CB8829DA"

CASES = [
    ("FA-WS-001", "\u0020", "SPACE", "inline-spacing"),
    ("FA-WS-002", "\u0009", "CHARACTER TABULATION", "layout-control"),
    ("FA-WS-003", "\u000A", "LINE FEED", "line-boundary-candidate"),
    ("FA-WS-004", "\u000B", "LINE TABULATION", "layout-control"),
    ("FA-WS-005", "\u000C", "FORM FEED", "layout-control"),
    ("FA-WS-006", "\u000D", "CARRIAGE RETURN", "line-boundary-candidate"),
    ("FA-WS-007", "\u00A0", "NO-BREAK SPACE", "nonbreaking-inline-spacing"),
    ("FA-WS-008", "\u2000", "EN QUAD", "inline-spacing"),
    ("FA-WS-009", "\u2001", "EM QUAD", "inline-spacing"),
    ("FA-WS-010", "\u2002", "EN SPACE", "inline-spacing"),
    ("FA-WS-011", "\u2003", "EM SPACE", "inline-spacing"),
    ("FA-WS-012", "\u2004", "THREE-PER-EM SPACE", "inline-spacing"),
    ("FA-WS-013", "\u2005", "FOUR-PER-EM SPACE", "inline-spacing"),
    ("FA-WS-014", "\u2006", "SIX-PER-EM SPACE", "inline-spacing"),
    ("FA-WS-015", "\u2007", "FIGURE SPACE", "nonbreaking-inline-spacing"),
    ("FA-WS-016", "\u2008", "PUNCTUATION SPACE", "inline-spacing"),
    ("FA-WS-017", "\u2009", "THIN SPACE", "inline-spacing"),
    ("FA-WS-018", "\u200A", "HAIR SPACE", "inline-spacing"),
    ("FA-WS-019", "\u200B", "ZERO WIDTH SPACE", "format-layout-control"),
    ("FA-WS-020", "\u2028", "LINE SEPARATOR", "line-boundary-candidate"),
    ("FA-WS-021", "\u2029", "PARAGRAPH SEPARATOR", "paragraph-boundary-candidate"),
    ("FA-WS-022", "\u202F", "NARROW NO-BREAK SPACE", "nonbreaking-inline-spacing"),
    ("FA-WS-023", "\u205F", "MEDIUM MATHEMATICAL SPACE", "inline-spacing"),
    ("FA-WS-024", "\u2060", "WORD JOINER", "format-layout-control"),
    ("FA-WS-025", "\u2800", "BRAILLE PATTERN BLANK", "braille-space"),
    ("FA-WS-026", "\uFEFF", "ZERO WIDTH NO-BREAK SPACE / BOM", "format-layout-control"),
    ("FA-WS-027", "\u200C", "ZERO WIDTH NON-JOINER", "shaping-control"),
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
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Persian-to-Braille-standards-audit/1"},
    )
    with urllib.request.urlopen(req, timeout=30) as response:
        data = response.read()

    actual = sha256_bytes(data)
    if actual != expected_sha256:
        raise RuntimeError(
            f"Pinned source hash mismatch for {url}\n"
            f"expected={expected_sha256}\nactual={actual}"
        )
    return data.decode("utf-8")


def cp(char: str) -> str:
    return f"U+{ord(char):04X}"


def parse_space_table(text: str) -> dict[str, dict]:
    mappings: dict[str, dict] = {}

    # space \s 0
    match = re.search(r"^\s*space\s+\\s\s+(\S+)", text, re.M)
    if match:
        mappings[" "] = {"directive": "space", "value": match.group(1)}

    # space/sign \xNNNN value
    pattern = re.compile(
        r"^\s*(space|sign)\s+\\x([0-9A-Fa-f]{4,6})\s+(\S+)",
        re.M,
    )
    for kind, cp_hex, value in pattern.findall(text):
        char = chr(int(cp_hex, 16))
        mappings[char] = {"directive": kind, "value": value}

    return mappings


def parse_fa_local_space_rules(text: str) -> dict[str, dict]:
    result: dict[str, dict] = {}

    pattern = re.compile(
        r"^\s*space\s+\\x([0-9A-Fa-f]{4,6})\s+(\S+)",
        re.M,
    )
    for cp_hex, value in pattern.findall(text):
        char = chr(int(cp_hex, 16))
        result[char] = {
            "status": "local-space-rule",
            "value": value,
        }

    if re.search(r'^\s*noback\s+context\s+"\\x200C"\s+\?\s*$', text, re.M):
        result["\u200C"] = {
            "status": "ignored-by-context-rule",
            "value": None,
        }

    return result


def parse_special_space_utility_rules(text: str) -> dict[str, list[str]]:
    special: dict[str, list[str]] = {}

    if re.search(r'^\s*noback\s+correct\s+"\\x200b"\s+""\s*$', text, re.M | re.I):
        special.setdefault("\u200B", []).append("noback-correct-to-empty")

    if re.search(r"^\s*replace\s+\\x2060\b", text, re.M | re.I):
        special.setdefault("\u2060", []).append("replace")

    if re.search(r"^\s*replace\s+\\xfeff\b", text, re.M | re.I):
        special.setdefault("\uFEFF", []).append("replace")

    return special


registry = read_json(REGISTRY)
ids = {row["id"] for row in registry["sources"]}
required = {
    "SRC-IR-1393",
    "SRC-LIBLOUIS-G1",
    "SRC-LIBLOUIS-2053",
    "SRC-LIBLOUIS-2054",
    "SRC-UNICODE-BRAILLE",
}
missing = required - ids
if missing:
    raise RuntimeError("Missing source IDs: " + ", ".join(sorted(missing)))

stable_fa = fetch_pinned(STABLE_FA_URL, STABLE_FA_SHA256)
draft_fa = fetch_pinned(DRAFT_FA_URL, DRAFT_FA_SHA256)
stable_spaces = fetch_pinned(STABLE_SPACES_URL, SPACES_SHA256)
draft_spaces = fetch_pinned(DRAFT_SPACES_URL, SPACES_SHA256)

if stable_spaces != draft_spaces:
    raise RuntimeError("Pinned spaces.uti files unexpectedly differ")

spaces_map = parse_space_table(stable_spaces)
spaces_special = parse_special_space_utility_rules(stable_spaces)

stable_local = parse_fa_local_space_rules(stable_fa)
draft_local = parse_fa_local_space_rules(draft_fa)

rows = []
for row_id, char, label, classification in CASES:
    included = spaces_map.get(char)
    stable_override = stable_local.get(char)
    draft_override = draft_local.get(char)

    if char != "\u200C" and included is None:
        raise RuntimeError(
            f"spaces.uti has no mapping for audited character {cp(char)} {label}"
        )

    manual = {
        "source": "SRC-IR-1393",
        "evidenceVia": "SRC-LIBLOUIS-2053",
        "status": "not-established-as-a-print-rule-in-this-audit",
    }
    if char == "\u00A0":
        manual = {
            "source": "SRC-IR-1393",
            "evidenceVia": "SRC-LIBLOUIS-2053",
            "status": "spacing-behavior",
            "note": (
                "The audit treats NBSP as a layout distinction that should be "
                "preserved by host/display integrations."
            ),
        }
    elif char == "\u200C":
        manual = {
            "source": "SRC-IR-1393",
            "evidenceVia": "SRC-LIBLOUIS-2053",
            "status": "not-defined-by-print-era-manual",
        }

    rows.append(
        {
            "id": row_id,
            "character": char,
            "codePoint": cp(char),
            "label": label,
            "auditClassification": classification,
            "spacesUtility": {
                "stableSource": "SRC-LIBLOUIS-G1",
                "draftSource": "SRC-LIBLOUIS-2054",
                "samePinnedContent": True,
                "mapping": included,
                "specialRules": spaces_special.get(char, []),
            },
            "persianStable": {
                "source": "SRC-LIBLOUIS-G1",
                "localOverride": stable_override,
            },
            "persianDraft": {
                "source": "SRC-LIBLOUIS-2054",
                "localOverride": draft_override,
            },
            "iran1393": manual,
            "normativeDecision": "pending",
            "hostIntegrationDecision": "pending",
        }
    )

def semantic_override(row: dict, side: str):
    override = row[side]["localOverride"]
    if override is None:
        return ("none", None)
    return (override["status"], override["value"])

summary = {
    "auditedCases": len(rows),
    "sharedSpacesUtilityCases": sum(
        1 for row in rows if row["spacesUtility"]["mapping"] is not None
    ),
    "spacesUtilityStableDraftDifferences": 0,
    "persianLocalOverrideCasesStable": sum(
        1 for row in rows if row["persianStable"]["localOverride"] is not None
    ),
    "persianLocalOverrideCasesDraft": sum(
        1 for row in rows if row["persianDraft"]["localOverride"] is not None
    ),
    "persianStableDraftOverrideDifferences": sum(
        1
        for row in rows
        if semantic_override(row, "persianStable")
        != semantic_override(row, "persianDraft")
    ),
    "normativeDecisionsPending": len(rows),
    "hostIntegrationDecisionsPending": len(rows),
}

expected = {
    "auditedCases": 27,
    "sharedSpacesUtilityCases": 26,
    "spacesUtilityStableDraftDifferences": 0,
    "persianLocalOverrideCasesStable": 2,
    "persianLocalOverrideCasesDraft": 2,
    "persianStableDraftOverrideDifferences": 1,
    "normativeDecisionsPending": 27,
    "hostIntegrationDecisionsPending": 27,
}
for key, value in expected.items():
    if summary[key] != value:
        raise RuntimeError(
            f"Unexpected Stage 1.6 summary for {key}: "
            f"expected={value}, actual={summary[key]}"
        )

nbspace = next(row for row in rows if row["character"] == "\u00A0")
if nbspace["spacesUtility"]["mapping"]["value"] != "0":
    raise RuntimeError("Unexpected spaces.uti NBSP value")
if nbspace["persianStable"]["localOverride"]["value"] != "a":
    raise RuntimeError("Unexpected stable Persian NBSP override")
if nbspace["persianDraft"]["localOverride"]["value"] != "a":
    raise RuntimeError("Unexpected draft Persian NBSP override")

zwnj = next(row for row in rows if row["character"] == "\u200C")
if zwnj["persianStable"]["localOverride"]["value"] != "8":
    raise RuntimeError("Unexpected stable Persian ZWNJ override")
if zwnj["persianDraft"]["localOverride"]["status"] != "ignored-by-context-rule":
    raise RuntimeError("Unexpected draft Persian ZWNJ behavior")

payload = {
    "schemaVersion": 1,
    "auditStage": "1.6",
    "scope": (
        "Unicode whitespace, line/paragraph separators, NBSP, zero-width "
        "layout controls, and Persian-specific ZWNJ/NBSP overrides"
    ),
    "normative": False,
    "sourcePins": {
        "liblouisStablePersian": {
            "commit": STABLE_COMMIT,
            "sha256": STABLE_FA_SHA256,
            "url": STABLE_FA_URL,
        },
        "liblouisDraftPersian": {
            "commit": DRAFT_COMMIT,
            "sha256": DRAFT_FA_SHA256,
            "url": DRAFT_FA_URL,
        },
        "liblouisStableSpacesUtility": {
            "commit": STABLE_COMMIT,
            "sha256": SPACES_SHA256,
            "url": STABLE_SPACES_URL,
        },
        "liblouisDraftSpacesUtility": {
            "commit": DRAFT_COMMIT,
            "sha256": SPACES_SHA256,
            "url": DRAFT_SPACES_URL,
        },
    },
    "architecturalBoundary": {
        "status": "audit-policy-candidate",
        "normative": False,
        "principle": (
            "Translation-cell semantics and document-layout semantics must not "
            "be silently collapsed into the same layer. Host adapters may need "
            "to preserve tabs, line breaks, paragraph boundaries, and no-break "
            "behavior as metadata or structural tokens rather than ordinary "
            "Braille cells."
        ),
        "officeSpecificBehaviorDefinedHere": False,
    },
    "summary": summary,
    "rows": rows,
}

write_json(OUTPUT_JSON, payload)

md = []
md.append("# Persian Braille Whitespace and Layout Audit")
md.append("")
md.append("Audit stage: **1.6**")
md.append("")
md.append(
    "This stage separates whitespace translation evidence from document-layout "
    "and host-integration concerns."
)
md.append("")
md.append(
    "It does **not** define Word, Excel, or PowerPoint adapter behavior. "
    "Office-host rules belong to a later integration specification."
)
md.append("")
md.append("## Summary")
md.append("")
for key, value in summary.items():
    md.append(f"- `{key}`: {value}")

md.append("")
md.append("## Shared Liblouis space utility")
md.append("")
md.append(
    "The pinned stable and draft revisions contain byte-identical `spaces.uti` "
    "files. The utility maps ordinary spaces, tabs, CR/LF, Unicode space "
    "characters, line/paragraph separators, and U+2800 to empty Braille cell "
    "value `0`. It additionally removes or corrects selected zero-width "
    "formatting characters."
)
md.append("")
md.append("## Persian-specific overrides")
md.append("")
md.append(
    "- U+00A0 NBSP: the shared utility has `0`, while both Persian tables "
    "define local virtual-dot value `a`; the external Persian audit states "
    "that this preserves the no-break distinction for integrations."
)
md.append(
    "- U+200C ZWNJ: stable defines dot `8`; draft suppresses it with a context "
    "rule. This difference was already identified in Stage 1.3 and is retained "
    "here because it directly affects spacing/layout semantics."
)
md.append("")
md.append("## Matrix")
md.append("")
md.append(
    "| ID | Code point | Label | Class | spaces.uti | Stable local | "
    "Draft local | Normative | Host |"
)
md.append("|---|---|---|---|---|---|---|---|---|")
for row in rows:
    utility = row["spacesUtility"]["mapping"]
    utility_value = "—" if utility is None else utility["value"]

    def local_value(side: str) -> str:
        local = row[side]["localOverride"]
        if local is None:
            return "—"
        if local["value"] is None:
            return local["status"]
        return f"{local['status']}:{local['value']}"

    md.append(
        f"| {row['id']} | `{row['codePoint']}` | {row['label']} | "
        f"`{row['auditClassification']}` | `{utility_value}` | "
        f"`{local_value('persianStable')}` | "
        f"`{local_value('persianDraft')}` | "
        f"`{row['normativeDecision']}` | "
        f"`{row['hostIntegrationDecision']}` |"
    )

md.append("")
md.append("## Architectural consequence candidate")
md.append("")
md.append(
    "A platform-neutral core should distinguish textual translation units from "
    "layout structure. A future adapter should not be forced to convert every "
    "tab, line break, paragraph break, or no-break distinction into an ordinary "
    "Braille cell before translation."
)
md.append("")
md.append(
    "This is an architectural candidate derived from the evidence, not yet a "
    "normative Persian Braille rule."
)
md.append("")
md.append("## Deferred")
md.append("")
md.append("- exact Word paragraph/run extraction behavior")
md.append("- Excel cell boundaries, formulas, and line breaks")
md.append("- PowerPoint text frames and paragraph boundaries")
md.append("- HTML/CSS white-space handling in the web playground")
md.append("- embossing line-width and pagination policy")
md.append("- line wrapping and hard-vs-soft break semantics")

write_text(OUTPUT_MD, "\n".join(md))

print("Whitespace and layout audit built.")
for key, value in summary.items():
    print(f"{key:42}: {value}")
print(f"Evidence JSON SHA-256                  : {sha256_bytes(OUTPUT_JSON.read_bytes())}")
print(f"Audit Markdown SHA-256                 : {sha256_bytes(OUTPUT_MD.read_bytes())}")
