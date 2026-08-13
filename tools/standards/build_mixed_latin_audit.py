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

OUTPUT_JSON = EVIDENCE_DIR / "mixed-latin.json"
OUTPUT_MD = DOCS_DIR / "mixed-latin-audit.md"

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

ASCII_LETTERS = (
    [chr(code) for code in range(ord("A"), ord("Z") + 1)]
    + [chr(code) for code in range(ord("a"), ord("z") + 1)]
)

MODE_EXPECTATIONS = [
    {
        "id": "FA-LATIN-MODE-001",
        "directive": "attribute",
        "name": "latin",
        "expectedDraftValue": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    },
    {
        "id": "FA-LATIN-MODE-002",
        "directive": "begmode",
        "name": "latin",
        "expectedDraftValue": "25",
    },
    {
        "id": "FA-LATIN-MODE-003",
        "directive": "endmode",
        "name": "latin",
        "expectedDraftValue": "25",
    },
    {
        "id": "FA-LATIN-MODE-004",
        "directive": "capsletter",
        "name": None,
        "expectedDraftValue": "6",
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


def parse_ascii_letter_mappings(table_text: str) -> dict[str, dict]:
    result: dict[str, dict] = {}

    pattern = re.compile(
        r"^\s*(uppercase|lowercase)\s+([A-Za-z])\s+([0-9-]+)(?:\s|$)"
    )

    for line in table_text.splitlines():
        match = pattern.match(line)
        if not match:
            continue

        kind, char, dots = match.groups()
        result[char] = {
            "kind": kind,
            "dots": dots,
        }

    return result


def parse_mode_rules(table_text: str) -> list[dict]:
    rows = []

    patterns = [
        re.compile(r"^\s*attribute\s+(\S+)\s+(\S+)\s*$"),
        re.compile(r"^\s*begmode\s+(\S+)\s+([0-9-]+)\s*$"),
        re.compile(r"^\s*endmode\s+(\S+)\s+([0-9-]+)\s*$"),
        re.compile(r"^\s*capsletter\s+([0-9-]+)\s*$"),
    ]

    for line in table_text.splitlines():
        stripped = line.strip()

        m = patterns[0].match(line)
        if m:
            name, value = m.groups()
            rows.append(
                {
                    "directive": "attribute",
                    "name": name,
                    "value": value,
                    "raw": stripped,
                }
            )
            continue

        m = patterns[1].match(line)
        if m:
            name, value = m.groups()
            rows.append(
                {
                    "directive": "begmode",
                    "name": name,
                    "value": value,
                    "raw": stripped,
                }
            )
            continue

        m = patterns[2].match(line)
        if m:
            name, value = m.groups()
            rows.append(
                {
                    "directive": "endmode",
                    "name": name,
                    "value": value,
                    "raw": stripped,
                }
            )
            continue

        m = patterns[3].match(line)
        if m:
            value = m.group(1)
            rows.append(
                {
                    "directive": "capsletter",
                    "name": None,
                    "value": value,
                    "raw": stripped,
                }
            )

    return rows


def find_mode_rule(rows: list[dict], directive: str, name: str | None):
    for row in rows:
        if row["directive"] == directive and row["name"] == name:
            return row
    return None


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

stable_text = fetch_pinned(STABLE_URL, STABLE_SHA256)
draft_text = fetch_pinned(DRAFT_URL, DRAFT_SHA256)

stable_letters = parse_ascii_letter_mappings(stable_text)
draft_letters = parse_ascii_letter_mappings(draft_text)

stable_modes = parse_mode_rules(stable_text)
draft_modes = parse_mode_rules(draft_text)

letter_rows = []

for index, char in enumerate(ASCII_LETTERS, 1):
    stable = stable_letters.get(char)
    draft = draft_letters.get(char)

    if stable is None:
        raise RuntimeError(f"Stable table missing ASCII letter {char!r}")
    if draft is None:
        raise RuntimeError(f"Draft table missing ASCII letter {char!r}")

    expected_stable_suffix = "7" if char.isupper() else "8"

    if not stable["dots"].endswith(expected_stable_suffix):
        raise RuntimeError(
            f"Stable {char!r} mapping does not carry expected dot "
            f"{expected_stable_suffix}: {stable['dots']}"
        )

    if "7" in draft["dots"] or "8" in draft["dots"]:
        raise RuntimeError(
            f"Draft {char!r} mapping unexpectedly contains dot 7/8: "
            f"{draft['dots']}"
        )

    letter_rows.append(
        {
            "id": f"FA-LATIN-{index:03d}",
            "character": char,
            "codePoint": f"U+{ord(char):04X}",
            "case": "uppercase" if char.isupper() else "lowercase",
            "liblouisStable": {
                "source": "SRC-LIBLOUIS-G1",
                "dots": stable["dots"],
            },
            "liblouisDraft": {
                "source": "SRC-LIBLOUIS-2054",
                "dots": draft["dots"],
            },
            "iran1393": {
                "source": "SRC-IR-1393",
                "evidenceVia": "SRC-LIBLOUIS-2053",
                "printedPage": 46,
                "status": "reported-six-dot-uncontracted-english-inside-latin-span",
            },
            "legacy": {
                "source": "SRC-LEGACY-V1",
                "runtimeEvidence": "not-recovered",
                "note": (
                    "The recovered VBA/SQL runtime mappings do not contain an "
                    "English alphabet translator, despite historical project "
                    "documentation describing English conversion."
                ),
            },
            "normativeDecision": "pending",
        }
    )

mode_rows = []

for expectation in MODE_EXPECTATIONS:
    stable = find_mode_rule(
        stable_modes,
        expectation["directive"],
        expectation["name"],
    )
    draft = find_mode_rule(
        draft_modes,
        expectation["directive"],
        expectation["name"],
    )

    if draft is None:
        raise RuntimeError(
            f"Draft missing expected mode rule: "
            f"{expectation['directive']} {expectation['name']}"
        )

    if draft["value"] != expectation["expectedDraftValue"]:
        raise RuntimeError(
            f"Unexpected draft value for {expectation['directive']} "
            f"{expectation['name']}: expected "
            f"{expectation['expectedDraftValue']!r}, got {draft['value']!r}"
        )

    mode_rows.append(
        {
            "id": expectation["id"],
            "directive": expectation["directive"],
            "name": expectation["name"],
            "liblouisStable": {
                "source": "SRC-LIBLOUIS-G1",
                "status": "present" if stable else "absent",
                "value": stable["value"] if stable else None,
            },
            "liblouisDraft": {
                "source": "SRC-LIBLOUIS-2054",
                "status": "present",
                "value": draft["value"],
            },
            "iran1393": {
                "source": "SRC-IR-1393",
                "evidenceVia": "SRC-LIBLOUIS-2053",
                "printedPage": 46,
                "status": (
                    "reported-dot-25-span-boundaries"
                    if expectation["directive"] in {"begmode", "endmode"}
                    else (
                        "reported-six-dot-english-span"
                        if expectation["directive"] == "attribute"
                        else "draft-uses-dot-6-capital-indicator"
                    )
                ),
            },
            "normativeDecision": "pending",
        }
    )

summary = {
    "asciiLetterCases": len(letter_rows),
    "asciiLetterStableDraftDifferences": sum(
        1
        for row in letter_rows
        if row["liblouisStable"]["dots"] != row["liblouisDraft"]["dots"]
    ),
    "uppercaseCases": sum(1 for row in letter_rows if row["case"] == "uppercase"),
    "lowercaseCases": sum(1 for row in letter_rows if row["case"] == "lowercase"),
    "modeRuleCases": len(mode_rows),
    "modeRuleStableDraftDifferences": sum(
        1
        for row in mode_rows
        if (
            row["liblouisStable"]["status"],
            row["liblouisStable"]["value"],
        )
        != (
            row["liblouisDraft"]["status"],
            row["liblouisDraft"]["value"],
        )
    ),
    "normativeDecisionsPending": len(letter_rows) + len(mode_rows),
}

expected_summary = {
    "asciiLetterCases": 52,
    "asciiLetterStableDraftDifferences": 52,
    "uppercaseCases": 26,
    "lowercaseCases": 26,
    "modeRuleCases": 4,
    "modeRuleStableDraftDifferences": 4,
    "normativeDecisionsPending": 56,
}

for key, expected in expected_summary.items():
    actual = summary[key]
    if actual != expected:
        raise RuntimeError(
            f"Unexpected Stage 1.5 summary for {key}: "
            f"expected={expected}, actual={actual}"
        )

# Representative hard assertions.
representative = {
    "A": ("17", "1"),
    "a": ("18", "1"),
    "Z": ("13567", "1356"),
    "z": ("13568", "1356"),
}
for char, (stable_expected, draft_expected) in representative.items():
    row = next(item for item in letter_rows if item["character"] == char)
    if row["liblouisStable"]["dots"] != stable_expected:
        raise RuntimeError(f"Unexpected stable mapping for {char}")
    if row["liblouisDraft"]["dots"] != draft_expected:
        raise RuntimeError(f"Unexpected draft mapping for {char}")

payload = {
    "schemaVersion": 1,
    "auditStage": "1.5",
    "scope": (
        "ASCII Latin letters embedded in Persian literary Grade 1, including "
        "stable dot-7/dot-8 behavior and draft six-dot span-mode behavior"
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
    "manualEvidencePolicy": (
        "SRC-LIBLOUIS-2053 reports that printed page 46 of the Iranian "
        "1393/2014 manual bounds embedded Latin with dot-25 markers and uses "
        "ordinary uncontracted six-dot English inside the span. This project "
        "records that report as secondary evidence; Stage 1.5 does not claim "
        "a direct transcription of the PDF."
    ),
    "summary": summary,
    "letters": letter_rows,
    "modeRules": mode_rows,
    "examplePolicyCases": [
        {
            "id": "FA-LATIN-EXAMPLE-001",
            "input": "test",
            "purpose": "lowercase embedded Latin span",
            "expectedDraftPolicy": (
                "dot-25 span start, six-dot English letters, dot-25 span end"
            ),
            "normativeDecision": "pending",
        },
        {
            "id": "FA-LATIN-EXAMPLE-002",
            "input": "Test",
            "purpose": "embedded Latin with initial capital",
            "expectedDraftPolicy": (
                "dot-25 span start, dot-6 capital indicator before T, "
                "six-dot English letters, dot-25 span end"
            ),
            "normativeDecision": "pending",
        },
        {
            "id": "FA-LATIN-EXAMPLE-003",
            "input": "ایران test ایران",
            "purpose": "Persian-Latin-Persian mixed-script boundary",
            "expectedDraftPolicy": (
                "automatic Latin span boundaries around the contiguous ASCII "
                "letter run"
            ),
            "normativeDecision": "pending",
        },
    ],
}

write_json(OUTPUT_JSON, payload)

md = []
md.append("# Persian Braille Mixed Latin Audit")
md.append("")
md.append("Audit stage: **1.5**")
md.append("")
md.append(
    "This stage compares the handling of embedded ASCII Latin letters in the "
    "pinned Persian Grade 1 stable and draft implementations."
)
md.append("")
md.append("No Stage 1.5 row is normative yet.")
md.append("")
md.append("## Source-backed policy")
md.append("")
md.append(
    "`SRC-LIBLOUIS-2053` reports that printed page 46 of the Iranian "
    "1393/2014 manual uses ordinary uncontracted six-dot English inside a "
    "Latin span bounded by dot 25 on each side."
)
md.append("")
md.append(
    "The stable table instead encodes uppercase ASCII letters with dot 7 and "
    "lowercase ASCII letters with dot 8, with no Latin span boundary mode."
)
md.append("")
md.append(
    "The draft replaces those allocations with ordinary six-dot English "
    "cells, adds a `latin` attribute, uses dot 25 for `begmode`/`endmode`, "
    "and uses dot 6 as the capital-letter indicator."
)
md.append("")
md.append("## Summary")
md.append("")
for key, value in summary.items():
    md.append(f"- `{key}`: {value}")

md.append("")
md.append("## Letter Matrix")
md.append("")
md.append("| Letter | Case | Stable dots | Draft dots | Decision |")
md.append("|---|---|---:|---:|---|")
for row in letter_rows:
    md.append(
        f"| `{row['character']}` | {row['case']} | "
        f"`{row['liblouisStable']['dots']}` | "
        f"`{row['liblouisDraft']['dots']}` | "
        f"`{row['normativeDecision']}` |"
    )

md.append("")
md.append("## Mode Rules")
md.append("")
md.append("| Directive | Name | Stable | Draft | Decision |")
md.append("|---|---|---|---|---|")
for row in mode_rows:
    name = "—" if row["name"] is None else f"`{row['name']}`"
    stable = (
        row["liblouisStable"]["status"]
        if row["liblouisStable"]["value"] is None
        else row["liblouisStable"]["value"]
    )
    draft = row["liblouisDraft"]["value"]
    md.append(
        f"| `{row['directive']}` | {name} | `{stable}` | `{draft}` | "
        f"`{row['normativeDecision']}` |"
    )

md.append("")
md.append("## Representative Differences")
md.append("")
md.append("- Stable `A`: `17`; draft `A`: `1` plus span/capital policy.")
md.append("- Stable `a`: `18`; draft `a`: `1` plus span policy.")
md.append("- Stable `Z`: `13567`; draft `Z`: `1356` plus span/capital policy.")
md.append("- Stable `z`: `13568`; draft `z`: `1356` plus span policy.")
md.append("")
md.append("## Legacy v1")
md.append("")
md.append(
    "The recovered v1 runtime artifacts do not contain an English alphabet "
    "translator. The historical project description states that English "
    "conversion was intended/supported, but the recovered file named "
    "`EnglishBrailleMaker.bas` is actually an Excel Persian-to-Braille macro. "
    "Stage 1.5 therefore records legacy English runtime evidence as unrecovered."
)
md.append("")
md.append("## Review risk")
md.append("")
md.append(
    "Automatic Latin-span boundaries remain a policy choice requiring explicit "
    "review. The current Liblouis PR itself calls this out for maintainer and "
    "Persian Braille-reader review."
)
md.append("")
md.append("## Deferred")
md.append("")
md.append("- Latin digits and punctuation inside mixed spans")
md.append("- non-ASCII Latin letters")
md.append("- URLs, email addresses, code identifiers, and acronyms")
md.append("- exact host behavior across Word/Excel/PowerPoint text runs")
md.append("- eight-dot computer Braille")

write_text(OUTPUT_MD, "\n".join(md))

print("Mixed Latin audit built.")
for key, value in summary.items():
    print(f"{key:38}: {value}")
print(f"Evidence JSON SHA-256              : {sha256_bytes(OUTPUT_JSON.read_bytes())}")
print(f"Audit Markdown SHA-256             : {sha256_bytes(OUTPUT_MD.read_bytes())}")
