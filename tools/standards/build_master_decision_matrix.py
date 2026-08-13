from __future__ import annotations

from pathlib import Path
import hashlib
import json
from collections import Counter, defaultdict

ROOT = Path(__file__).resolve().parents[2]

EVIDENCE = ROOT / "spec" / "fa-ir" / "evidence"
DOCS = ROOT / "docs" / "standards"

CORE = EVIDENCE / "core-alphabet.json"
ORTHO = EVIDENCE / "orthographic-variants.json"
NUMPUNC = EVIDENCE / "numbers-punctuation.json"
LATIN = EVIDENCE / "mixed-latin.json"
WHITESPACE = EVIDENCE / "whitespace-layout.json"
REMAINING = EVIDENCE / "remaining-coverage.json"

OUTPUT_JSON = EVIDENCE / "master-decision-matrix.json"
OUTPUT_MD = DOCS / "master-decision-matrix.md"

CONSENSUS = "CONSENSUS-CANDIDATE"
REVIEW = "REVIEW-REQUIRED"
UNRESOLVED = "UNRESOLVED"

EXPECTED_STAGE_COUNTS = {
    "1.2": 32,
    "1.3": 28,
    "1.4": 61,
    "1.5": 56,
    "1.6": 27,
    "1.7": 86,
}

EXPECTED_CLASS_COUNTS = {
    CONSENSUS: 37,
    REVIEW: 252,
    UNRESOLVED: 1,
}


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


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest().upper()


def make_item(
    *,
    item_id: str,
    stage: str,
    domain: str,
    subject: str,
    code_points: list[str] | None,
    classification: str,
    reason: str,
    evidence: list[str],
    stable=None,
    draft=None,
    notes: list[str] | None = None,
):
    return {
        "id": item_id,
        "stage": stage,
        "domain": domain,
        "subject": subject,
        "codePoints": code_points or [],
        "classification": classification,
        "normative": False,
        "reason": reason,
        "evidence": evidence,
        "stable": stable,
        "draft": draft,
        "notes": notes or [],
    }


core = read_json(CORE)
ortho = read_json(ORTHO)
numpunc = read_json(NUMPUNC)
latin = read_json(LATIN)
whitespace = read_json(WHITESPACE)
remaining = read_json(REMAINING)

items = []

# ---------------------------------------------------------------------------
# Stage 1.2 — Core alphabet
# Institutional audit reports the printed manual matches stable core alphabet,
# and stable/draft agree. This is the strongest consensus group in Phase 1.
# ---------------------------------------------------------------------------
for row in core["rows"]:
    items.append(
        make_item(
            item_id=row["id"],
            stage="1.2",
            domain="core-alphabet",
            subject=row["character"],
            code_points=[row["codePoint"]],
            classification=CONSENSUS,
            reason=(
                "Pinned stable and draft mappings agree, and the institutional "
                "1393/2014 manual is reported by SRC-LIBLOUIS-2053 to match "
                "the core alphabet on printed pages 32-33."
            ),
            evidence=[
                "SRC-IR-1393",
                "SRC-LIBLOUIS-2053",
                "SRC-LIBLOUIS-G1",
                "SRC-LIBLOUIS-2054",
                "SRC-UNICODE-BRAILLE",
            ],
            stable=row["liblouisStable"],
            draft=row["liblouisDraft"],
        )
    )

# ---------------------------------------------------------------------------
# Stage 1.3 — Orthographic variants, sequences, format controls
# ---------------------------------------------------------------------------
for row in ortho["scalars"]:
    char = row["char"]

    if char == "\u0670":
        classification = CONSENSUS
        reason = (
            "SRC-LIBLOUIS-2053 reports dot 5 for U+0670 on printed page 28; "
            "the pinned draft implements dot 5. Stable lacks the mapping, so "
            "this is a candidate backed by institutional evidence rather than "
            "stable/draft implementation consensus."
        )
    elif char == "\u0654":
        classification = UNRESOLVED
        reason = (
            "U+0654 is unmapped as a standalone scalar in both pinned tables. "
            "The draft handles it only inside the explicit Ezafe sequence هٔ. "
            "Standalone scalar behavior therefore remains unresolved."
        )
    else:
        classification = REVIEW
        reason = (
            "This scalar has implementation evidence, but Stage 1.3 did not "
            "establish a current institutional rule for this exact Unicode "
            "scalar/spelling. Stable/draft agreement alone is insufficient."
        )

    items.append(
        make_item(
            item_id=row["id"],
            stage="1.3",
            domain="orthographic-scalar",
            subject=row["char"],
            code_points=row["codePoints"],
            classification=classification,
            reason=reason,
            evidence=[
                "SRC-IR-1393",
                "SRC-LIBLOUIS-2053",
                "SRC-LIBLOUIS-G1",
                "SRC-LIBLOUIS-2054",
            ],
            stable=row["liblouisStable"],
            draft=row["liblouisDraft"],
        )
    )

for row in ortho["sequences"]:
    items.append(
        make_item(
            item_id=row["id"],
            stage="1.3",
            domain="orthographic-sequence",
            subject=row["text"],
            code_points=row["codePoints"],
            classification=REVIEW,
            reason=(
                "The 1393/2014 manual evidence concerns Ezafe behavior, but "
                "the exact Unicode normalization/spelling policy is a modern "
                "implementation choice requiring explicit review."
            ),
            evidence=[
                "SRC-IR-1393",
                "SRC-LIBLOUIS-2053",
                "SRC-LIBLOUIS-G1",
                "SRC-LIBLOUIS-2054",
            ],
            stable=row["liblouisStable"],
            draft=row["liblouisDraft"],
        )
    )

for row in ortho["formatControls"]:
    items.append(
        make_item(
            item_id=row["id"],
            stage="1.3",
            domain="unicode-format-control",
            subject=row["label"],
            code_points=row["codePoints"],
            classification=REVIEW,
            reason=(
                "Unicode shaping/bidi controls are modern text-processing "
                "policy and are not directly defined by the print-era Persian "
                "Braille manual. Their treatment must be reviewed separately "
                "from literary cell mappings."
            ),
            evidence=[
                "SRC-LIBLOUIS-G1",
                "SRC-LIBLOUIS-2054",
            ],
            stable=row["liblouisStable"],
            draft=row["liblouisDraft"],
        )
    )

# ---------------------------------------------------------------------------
# Stage 1.4 — Digits, number directives, punctuation, contextual cases
# ---------------------------------------------------------------------------
for row in numpunc["digits"]:
    items.append(
        make_item(
            item_id=row["id"],
            stage="1.4",
            domain=f"digits-{row['set']}",
            subject=row["character"],
            code_points=row["codePoints"],
            classification=REVIEW,
            reason=(
                "Pinned stable and draft digit cells agree, but the focused "
                "Stage 1.4 dataset does not attach rule-level institutional "
                "manual evidence to each decimal repertoire entry."
            ),
            evidence=[
                "SRC-LIBLOUIS-G1",
                "SRC-LIBLOUIS-2054",
            ],
            stable=row["liblouisStable"],
            draft=row["liblouisDraft"],
        )
    )

for row in numpunc["numberDirectives"]:
    items.append(
        make_item(
            item_id=row["id"],
            stage="1.4",
            domain="number-directive",
            subject=(
                row["directive"]
                if row["token"] is None
                else f"{row['directive']} {row['token']}"
            ),
            code_points=[] if row["token"] is None else [
                f"U+{ord(ch):04X}" for ch in row["token"]
            ],
            classification=REVIEW,
            reason=(
                "Stable and draft agree on this number-syntax directive, but "
                "Phase 1 has not yet established direct institutional evidence "
                "for this exact directive abstraction."
            ),
            evidence=[
                "SRC-LIBLOUIS-G1",
                "SRC-LIBLOUIS-2054",
            ],
            stable=row["liblouisStable"],
            draft=row["liblouisDraft"],
        )
    )

for row in numpunc["punctuationScalars"]:
    items.append(
        make_item(
            item_id=row["id"],
            stage="1.4",
            domain="punctuation-scalar",
            subject=row["character"],
            code_points=row["codePoints"],
            classification=REVIEW,
            reason=(
                "Scalar punctuation behavior may be context-sensitive. Even "
                "where the manual supports a contextual result, the scalar "
                "allocation itself must not be promoted independently without "
                "review."
            ),
            evidence=[
                "SRC-IR-1393",
                "SRC-LIBLOUIS-2053",
                "SRC-LIBLOUIS-G1",
                "SRC-LIBLOUIS-2054",
            ],
            stable=row["liblouisStable"],
            draft=row["liblouisDraft"],
        )
    )

for row in numpunc["contextCases"]:
    items.append(
        make_item(
            item_id=row["id"],
            stage="1.4",
            domain="punctuation-context",
            subject=row["name"],
            code_points=[f"U+{ord(ch):04X}" for ch in row["input"]],
            classification=CONSENSUS,
            reason=(
                "This context-sensitive case is explicitly reported from the "
                "1393/2014 manual by SRC-LIBLOUIS-2053 and is implemented by "
                "the pinned draft behavior."
            ),
            evidence=[
                "SRC-IR-1393",
                "SRC-LIBLOUIS-2053",
                "SRC-LIBLOUIS-2054",
            ],
            stable=row["liblouisStable"],
            draft=row["liblouisDraft"],
            notes=[f"input={row['input']}"],
        )
    )

# ---------------------------------------------------------------------------
# Stage 1.5 — Mixed Latin
# ---------------------------------------------------------------------------
for row in latin["letters"]:
    items.append(
        make_item(
            item_id=row["id"],
            stage="1.5",
            domain="mixed-latin-letter",
            subject=row["character"],
            code_points=[row["codePoint"]],
            classification=REVIEW,
            reason=(
                "The draft aligns with the reported six-dot Latin-span policy, "
                "but the stable implementation differs for all ASCII letters "
                "and automatic span boundaries remain an explicit review risk."
            ),
            evidence=[
                "SRC-IR-1393",
                "SRC-LIBLOUIS-2053",
                "SRC-LIBLOUIS-G1",
                "SRC-LIBLOUIS-2054",
            ],
            stable=row["liblouisStable"],
            draft=row["liblouisDraft"],
        )
    )

for row in latin["modeRules"]:
    subject = row["directive"]
    if row["name"] is not None:
        subject += f" {row['name']}"
    items.append(
        make_item(
            item_id=row["id"],
            stage="1.5",
            domain="mixed-latin-mode",
            subject=subject,
            code_points=[],
            classification=REVIEW,
            reason=(
                "The draft introduces the Latin-span/capitalization mechanism, "
                "but this is a policy-layer change requiring maintainer and "
                "Persian Braille-reader review before normative adoption."
            ),
            evidence=[
                "SRC-IR-1393",
                "SRC-LIBLOUIS-2053",
                "SRC-LIBLOUIS-2054",
            ],
            stable=row["liblouisStable"],
            draft=row["liblouisDraft"],
        )
    )

# ---------------------------------------------------------------------------
# Stage 1.6 — Whitespace/layout
# ---------------------------------------------------------------------------
for row in whitespace["rows"]:
    items.append(
        make_item(
            item_id=row["id"],
            stage="1.6",
            domain="whitespace-layout",
            subject=row["label"],
            code_points=[row["codePoint"]],
            classification=REVIEW,
            reason=(
                "This case crosses the boundary between translation semantics "
                "and document/layout semantics. Host adapter policy must be "
                "resolved separately from the Persian literary Braille rules."
            ),
            evidence=[
                "SRC-IR-1393",
                "SRC-LIBLOUIS-2053",
                "SRC-LIBLOUIS-G1",
                "SRC-LIBLOUIS-2054",
            ],
            stable=row["persianStable"],
            draft=row["persianDraft"],
            notes=[
                f"hostIntegrationDecision={row['hostIntegrationDecision']}"
            ],
        )
    )

# ---------------------------------------------------------------------------
# Stage 1.7 — Remaining coverage
# ---------------------------------------------------------------------------
for row in remaining["remainingScalars"]:
    notes = []
    if row["usesDot7Or8"]:
        notes.append("dot-7/dot-8 review queue")

    items.append(
        make_item(
            item_id=row["id"],
            stage="1.7",
            domain=f"remaining-scalar/{row['auditCategory']}",
            subject=row["character"],
            code_points=[row["codePoint"]],
            classification=REVIEW,
            reason=(
                "Stable and draft agree, but Stage 1.7 explicitly records that "
                "implementation agreement alone is not normative evidence. "
                "Remaining symbols/diacritics require source-level review."
            ),
            evidence=[
                "SRC-LIBLOUIS-G1",
                "SRC-LIBLOUIS-2054",
            ],
            stable=row["liblouisStable"],
            draft=row["liblouisDraft"],
            notes=notes,
        )
    )

for row in remaining["remainingContextRules"]:
    items.append(
        make_item(
            item_id=row["id"],
            stage="1.7",
            domain="remaining-context-rule",
            subject=f"{row['directive']} {row['token']}",
            code_points=row["codePoints"],
            classification=REVIEW,
            reason=(
                "Stable and draft agree, but contextual quote/punctuation "
                "behavior has not yet been validated against a current "
                "institutional source."
            ),
            evidence=[
                "SRC-LIBLOUIS-G1",
                "SRC-LIBLOUIS-2054",
            ],
            stable=row["liblouisStable"],
            draft=row["liblouisDraft"],
            notes=(
                ["dot-7/dot-8 review queue"]
                if row["usesDot7Or8"]
                else []
            ),
        )
    )

for row in remaining["emphasisRules"]:
    subject = f"{row['directive']} {row['class']}"
    items.append(
        make_item(
            item_id=row["id"],
            stage="1.7",
            domain="emphasis",
            subject=subject,
            code_points=[],
            classification=REVIEW,
            reason=(
                "Stable and draft emphasis rules agree, but no current "
                "institutional Persian source has been verified for these "
                "formatting indicators."
            ),
            evidence=[
                "SRC-LIBLOUIS-G1",
                "SRC-LIBLOUIS-2054",
            ],
            stable=row["liblouisStable"],
            draft=row["liblouisDraft"],
            notes=(
                ["dot-7/dot-8 review queue"]
                if row["usesDot7Or8"]
                else []
            ),
        )
    )

# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------
ids = [item["id"] for item in items]
if len(ids) != len(set(ids)):
    duplicates = sorted(
        item_id for item_id, count in Counter(ids).items() if count > 1
    )
    raise RuntimeError(f"Duplicate master decision IDs: {duplicates}")

stage_counts = Counter(item["stage"] for item in items)
for stage, expected in EXPECTED_STAGE_COUNTS.items():
    actual = stage_counts.get(stage, 0)
    if actual != expected:
        raise RuntimeError(
            f"Unexpected item count for Stage {stage}: "
            f"expected={expected}, actual={actual}"
        )

classification_counts = Counter(item["classification"] for item in items)
for classification, expected in EXPECTED_CLASS_COUNTS.items():
    actual = classification_counts.get(classification, 0)
    if actual != expected:
        raise RuntimeError(
            f"Unexpected classification count for {classification}: "
            f"expected={expected}, actual={actual}"
        )

if len(items) != 290:
    raise RuntimeError(
        f"Unexpected master decision count: expected=290, actual={len(items)}"
    )

unresolved = [item for item in items if item["classification"] == UNRESOLVED]
if len(unresolved) != 1 or unresolved[0]["id"] != "FA-VAR-013":
    raise RuntimeError(
        "Stage 1.8 expects FA-VAR-013 (U+0654) to be the single unresolved "
        "unique decision at this audit baseline."
    )

domain_counts = Counter(item["domain"] for item in items)
stage_class_counts: dict[str, Counter] = defaultdict(Counter)
for item in items:
    stage_class_counts[item["stage"]][item["classification"]] += 1

payload = {
    "schemaVersion": 1,
    "auditStage": "1.8",
    "title": "Persian Braille Phase 1 Master Evidence Decision Matrix",
    "normative": False,
    "decisionClasses": {
        CONSENSUS: (
            "No known evidence conflict for the proposed behavior, with "
            "institutional/manual evidence supporting the candidate."
        ),
        REVIEW: (
            "Evidence exists, but current institutional validation, Unicode "
            "policy, host policy, or conflict resolution is still required."
        ),
        UNRESOLVED: (
            "The evidence does not currently define a complete behavior or "
            "contains a gap that cannot yet be promoted."
        ),
    },
    "classificationPolicy": {
        "stableDraftAgreementAloneIsNotNormative": True,
        "historicalInstitutionalSourceCurrentStatusVerified": False,
        "draftPullRequestIsNormative": False,
        "legacyV1IsNormative": False,
        "phase2MayPromoteCandidatesOnlyAfterExplicitRuleDecision": True,
    },
    "summary": {
        "uniqueDecisionItems": len(items),
        "byStage": dict(sorted(stage_counts.items())),
        "byClassification": {
            key: classification_counts.get(key, 0)
            for key in [CONSENSUS, REVIEW, UNRESOLVED]
        },
        "dot78ReviewTaggedItems": sum(
            1
            for item in items
            if "dot-7/dot-8 review queue" in item["notes"]
        ),
    },
    "stageClassificationMatrix": {
        stage: {
            key: stage_class_counts[stage].get(key, 0)
            for key in [CONSENSUS, REVIEW, UNRESOLVED]
        }
        for stage in sorted(stage_class_counts)
    },
    "domainCounts": dict(sorted(domain_counts.items())),
    "items": items,
}

write_json(OUTPUT_JSON, payload)

md = []
md.append("# Persian Braille Phase 1 Master Decision Matrix")
md.append("")
md.append("Audit stage: **1.8**")
md.append("")
md.append(
    "This document consolidates the evidence datasets produced in Stages "
    "1.2 through 1.7 into one de-duplicated decision matrix."
)
md.append("")
md.append(
    "**This matrix is not the normative Persian Braille specification.** "
    "It is the gate between evidence collection and Phase 2 rule adoption."
)
md.append("")
md.append("## Decision classes")
md.append("")
md.append(
    f"- **{CONSENSUS}** — no known evidence conflict for the proposed "
    "behavior, with institutional/manual evidence supporting the candidate."
)
md.append(
    f"- **{REVIEW}** — evidence exists, but institutional validation, "
    "Unicode policy, host policy, or conflict resolution is still required."
)
md.append(
    f"- **{UNRESOLVED}** — the current evidence does not define a complete "
    "behavior suitable for promotion."
)
md.append("")
md.append("## Summary")
md.append("")
md.append(f"- Unique decision items: **{len(items)}**")
md.append(
    f"- {CONSENSUS}: **{classification_counts[CONSENSUS]}**"
)
md.append(
    f"- {REVIEW}: **{classification_counts[REVIEW]}**"
)
md.append(
    f"- {UNRESOLVED}: **{classification_counts[UNRESOLVED]}**"
)
md.append(
    f"- Dot-7/dot-8 review tagged items: "
    f"**{payload['summary']['dot78ReviewTaggedItems']}**"
)
md.append("")
md.append("## Stage matrix")
md.append("")
md.append(
    "| Stage | Items | Consensus candidate | Review required | Unresolved |"
)
md.append("|---|---:|---:|---:|---:|")
for stage in sorted(stage_counts):
    counts = stage_class_counts[stage]
    md.append(
        f"| {stage} | {stage_counts[stage]} | "
        f"{counts[CONSENSUS]} | {counts[REVIEW]} | "
        f"{counts[UNRESOLVED]} |"
    )

md.append("")
md.append("## Consensus candidates")
md.append("")
for item in items:
    if item["classification"] != CONSENSUS:
        continue
    cps = " ".join(item["codePoints"]) if item["codePoints"] else "—"
    md.append(
        f"- `{item['id']}` — {item['subject']} — `{cps}` — "
        f"{item['reason']}"
    )

md.append("")
md.append("## Unresolved")
md.append("")
for item in items:
    if item["classification"] != UNRESOLVED:
        continue
    cps = " ".join(item["codePoints"]) if item["codePoints"] else "—"
    md.append(
        f"- `{item['id']}` — {item['subject']} — `{cps}` — "
        f"{item['reason']}"
    )

md.append("")
md.append("## Review-required domains")
md.append("")
for domain, count in sorted(domain_counts.items()):
    review_count = sum(
        1
        for item in items
        if item["domain"] == domain
        and item["classification"] == REVIEW
    )
    if review_count:
        md.append(f"- `{domain}`: {review_count}")

md.append("")
md.append("## Phase 2 admission rule")
md.append("")
md.append(
    "A `CONSENSUS-CANDIDATE` item is still not normative. Phase 2 must "
    "create an explicit rule record with a stable rule ID, profile scope, "
    "input/context definition, Braille output, evidence citations, rationale, "
    "and conformance vectors before the item becomes normative."
)
md.append("")
md.append(
    "`REVIEW-REQUIRED` and `UNRESOLVED` items must not be silently copied "
    "from Liblouis, the draft pull request, or Persian-to-Braille v1."
)
md.append("")
md.append("## Phase 1 status")
md.append("")
md.append(
    "Stage 1.8 completes evidence consolidation for the pinned Persian "
    "Grade-1 implementation baseline. The remaining work is decision-making "
    "and specification authoring, not further unstructured extraction."
)

write_text(OUTPUT_MD, "\n".join(md))

print("Phase 1 master decision matrix built.")
print(f"Unique decision items     : {len(items)}")
print(f"{CONSENSUS:26}: {classification_counts[CONSENSUS]}")
print(f"{REVIEW:26}: {classification_counts[REVIEW]}")
print(f"{UNRESOLVED:26}: {classification_counts[UNRESOLVED]}")
print(
    f"Dot-7/dot-8 review tagged : "
    f"{payload['summary']['dot78ReviewTaggedItems']}"
)
print(f"Evidence JSON SHA-256      : {sha256_bytes(OUTPUT_JSON.read_bytes())}")
print(f"Audit Markdown SHA-256     : {sha256_bytes(OUTPUT_MD.read_bytes())}")
