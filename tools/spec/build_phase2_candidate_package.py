from __future__ import annotations

from pathlib import Path
import hashlib
import json
import re
import shutil

ROOT = Path(__file__).resolve().parents[2]

MASTER = ROOT / "spec" / "fa-ir" / "evidence" / "master-decision-matrix.json"
NUMPUNC = ROOT / "spec" / "fa-ir" / "evidence" / "numbers-punctuation.json"

RULE_SCHEMA = ROOT / "spec" / "fa-ir" / "schema" / "rule.schema.json"
PROFILE_SCHEMA = ROOT / "spec" / "fa-ir" / "schema" / "profile.schema.json"
CONFORMANCE_SCHEMA = ROOT / "spec" / "fa-ir" / "schema" / "conformance.schema.json"

RULE_DIR = ROOT / "spec" / "fa-ir" / "rules" / "candidates"
CONF_DIR = ROOT / "spec" / "fa-ir" / "conformance" / "candidates"
PROFILE_DIR = ROOT / "spec" / "fa-ir" / "profiles"
MANIFEST_DIR = ROOT / "spec" / "fa-ir" / "manifests"
DOCS_DIR = ROOT / "docs" / "specification"

PROFILE_FILE = PROFILE_DIR / "fa-ir-g1.json"
MANIFEST_FILE = MANIFEST_DIR / "phase-2.2-candidate-package.json"
DOC_FILE = DOCS_DIR / "phase-2.2-candidate-package.md"

PROFILE_ID = "fa-ir-g1"
PROFILE_VERSION = "0.1.0"
ARTIFACT_VERSION = "0.1.0"
SCHEMA_VERSION = 1

CONSENSUS = "CONSENSUS-CANDIDATE"

CORE_RULE_IDS = {
    f"FA-CORE-{index:03d}": f"FA-G1-LETTER-{index:03d}"
    for index in range(1, 33)
}

SPECIAL_RULE_IDS = {
    "FA-VAR-010": "FA-G1-ORTHO-SUPERSCRIPT-ALEF-001",
    "FA-CTX-001": "FA-G1-PUNC-ELLIPSIS-001",
    "FA-CTX-002": "FA-G1-NUM-FRACTION-SLASH-001",
    "FA-CTX-003": "FA-G1-PUNC-ASTERISK-SINGLE-001",
    "FA-CTX-004": "FA-G1-PUNC-ASTERISK-RUN-001",
}

DECISION_TO_RULE_ID = {**CORE_RULE_IDS, **SPECIAL_RULE_IDS}

CONF_IDS = {
    rule_id: "FA-CONF-" + rule_id.removeprefix("FA-G1-")
    for rule_id in DECISION_TO_RULE_ID.values()
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


def code_points(text: str) -> list[str]:
    return [f"U+{ord(ch):04X}" for ch in text]


def split_dots(dots: str) -> list[str]:
    if not dots:
        raise RuntimeError("Empty Braille dot pattern")
    return dots.split("-")


def braille_char(cell: str) -> str:
    if cell == "0":
        return chr(0x2800)

    if not re.fullmatch(r"[1-8]{1,8}", cell):
        raise RuntimeError(f"Invalid Braille cell: {cell!r}")

    if len(set(cell)) != len(cell):
        raise RuntimeError(f"Duplicate Braille dot in cell: {cell!r}")

    value = 0
    for digit in cell:
        value |= 1 << (int(digit) - 1)
    return chr(0x2800 + value)


def unicode_braille(cells: list[str]) -> str:
    return "".join(braille_char(cell) for cell in cells)


def safe_file_id(rule_id: str) -> str:
    return rule_id.lower() + ".json"


def candidate_rule(
    *,
    rule_id: str,
    rule_type: str,
    input_kind: str,
    text: str,
    cells: list[str],
    decision_item,
    vector_id: str,
    priority: int = 1000,
    before: str | None = None,
    after: str | None = None,
    token_class: str | None = None,
    rationale_suffix: str = "",
):
    input_obj = {
        "kind": input_kind,
        "text": text,
        "codePoints": code_points(text),
    }
    if before is not None:
        input_obj["before"] = before
    if after is not None:
        input_obj["after"] = after
    if token_class is not None:
        input_obj["tokenClass"] = token_class

    rationale = decision_item["reason"]
    if rationale_suffix:
        rationale += " " + rationale_suffix

    return {
        "schemaVersion": SCHEMA_VERSION,
        "id": rule_id,
        "profile": PROFILE_ID,
        "type": rule_type,
        "status": "candidate",
        "version": ARTIFACT_VERSION,
        "direction": "forward",
        "priority": priority,
        "input": input_obj,
        "output": {
            "cells": cells,
            "unicodeBraille": unicode_braille(cells),
            "structuralToken": None,
        },
        "normalization": {
            "form": "none",
            "canonicalInput": text,
            "notes": (
                "Phase 2.2 does not promote unresolved global Unicode "
                "normalization policy."
            ),
        },
        "evidence": {
            "decisionItemIds": [decision_item["id"]],
            "sourceIds": list(dict.fromkeys(decision_item["evidence"])),
            "rationale": rationale,
            "conflictsResolved": [],
        },
        "conformance": {
            "vectorIds": [vector_id],
        },
        "notes": [
            "Generated from a Phase 1 CONSENSUS-CANDIDATE decision.",
            "Candidate status is non-normative.",
        ],
    }


def conformance_vector(
    *,
    vector_id: str,
    rule_id: str,
    text: str,
    cells: list[str],
    before: str | None = None,
    after: str | None = None,
    token_class: str | None = None,
    tags: list[str] | None = None,
):
    input_obj = {
        "text": text,
        "codePoints": code_points(text),
    }
    if before is not None:
        input_obj["before"] = before
    if after is not None:
        input_obj["after"] = after
    if token_class is not None:
        input_obj["tokenClass"] = token_class

    return {
        "schemaVersion": SCHEMA_VERSION,
        "id": vector_id,
        "status": "draft",
        "version": ARTIFACT_VERSION,
        "profile": PROFILE_ID,
        "profileVersion": PROFILE_VERSION,
        "ruleIds": [rule_id],
        "input": input_obj,
        "expected": {
            "cells": cells,
            "unicodeBraille": unicode_braille(cells),
            "structuralTokens": [],
        },
        "tags": tags or [],
        "notes": [
            "Phase 2.2 candidate conformance vector; not normative."
        ],
    }


master = read_json(MASTER)
numpunc = read_json(NUMPUNC)

# Make sure Phase 2.1 revised schemas are actually present before generating
# artifacts that depend on their contracts.
rule_schema = read_json(RULE_SCHEMA)
profile_schema = read_json(PROFILE_SCHEMA)
conf_schema = read_json(CONFORMANCE_SCHEMA)

required_rule_fields = set(rule_schema["required"])
required_profile_fields = set(profile_schema["required"])
required_conf_fields = set(conf_schema["required"])

for required in {"version", "evidence", "conformance"}:
    if required not in required_rule_fields:
        raise RuntimeError(f"Phase 2.1 rule schema missing required field: {required}")

if "ruleIds" not in required_profile_fields or "version" not in required_profile_fields:
    raise RuntimeError("Phase 2.1 profile schema is not the revised stable-ID schema")

if "rules" in profile_schema["properties"]:
    raise RuntimeError("Profile schema still contains filesystem-coupled 'rules'")

for required in {"version", "profileVersion"}:
    if required not in required_conf_fields:
        raise RuntimeError(
            f"Phase 2.1 conformance schema missing required field: {required}"
        )

for context_field in {"before", "after", "tokenClass"}:
    if context_field not in conf_schema["properties"]["input"]["properties"]:
        raise RuntimeError(
            f"Phase 2.1 conformance schema missing context field: {context_field}"
        )

master_items = {row["id"]: row for row in master["items"]}
consensus_ids = sorted(
    row["id"]
    for row in master["items"]
    if row["classification"] == CONSENSUS
)

if len(consensus_ids) != 37:
    raise RuntimeError(
        f"Expected 37 Phase 1 consensus candidates, found {len(consensus_ids)}"
    )

if set(consensus_ids) != set(DECISION_TO_RULE_ID):
    missing = sorted(set(consensus_ids) - set(DECISION_TO_RULE_ID))
    extra = sorted(set(DECISION_TO_RULE_ID) - set(consensus_ids))
    raise RuntimeError(
        f"Decision/rule mapping mismatch. Missing={missing}, extra={extra}"
    )

context_cases = {row["id"]: row for row in numpunc["contextCases"]}

rules = []
vectors = []

# Core 32 letters.
for index in range(1, 33):
    decision_id = f"FA-CORE-{index:03d}"
    decision = master_items[decision_id]
    rule_id = CORE_RULE_IDS[decision_id]
    vector_id = CONF_IDS[rule_id]

    text = decision["subject"]
    dots = decision["stable"]["dots"]
    cells = split_dots(dots)

    rules.append(
        candidate_rule(
            rule_id=rule_id,
            rule_type="character",
            input_kind="scalar",
            text=text,
            cells=cells,
            decision_item=decision,
            vector_id=vector_id,
        )
    )
    vectors.append(
        conformance_vector(
            vector_id=vector_id,
            rule_id=rule_id,
            text=text,
            cells=cells,
            tags=["core-alphabet", "scalar"],
        )
    )

# U+0670 superscript alef: the draft implements the institutionally reported dot 5.
decision = master_items["FA-VAR-010"]
rule_id = SPECIAL_RULE_IDS["FA-VAR-010"]
vector_id = CONF_IDS[rule_id]
cells = split_dots(decision["draft"]["dots"])

rules.append(
    candidate_rule(
        rule_id=rule_id,
        rule_type="character",
        input_kind="scalar",
        text=decision["subject"],
        cells=cells,
        decision_item=decision,
        vector_id=vector_id,
        rationale_suffix=(
            "The candidate output intentionally follows the institutionally "
            "reported draft mapping rather than the unmapped stable baseline."
        ),
    )
)
vectors.append(
    conformance_vector(
        vector_id=vector_id,
        rule_id=rule_id,
        text=decision["subject"],
        cells=cells,
        tags=["orthography", "diacritic", "manual-backed"],
    )
)

# ASCII three-dot ellipsis.
decision = master_items["FA-CTX-001"]
case = context_cases["FA-CTX-001"]
rule_id = SPECIAL_RULE_IDS["FA-CTX-001"]
vector_id = CONF_IDS[rule_id]
cells = split_dots(case["manual"]["expectedDots"])

rules.append(
    candidate_rule(
        rule_id=rule_id,
        rule_type="sequence",
        input_kind="sequence",
        text=case["input"],
        cells=cells,
        decision_item=decision,
        vector_id=vector_id,
        priority=100,
    )
)
vectors.append(
    conformance_vector(
        vector_id=vector_id,
        rule_id=rule_id,
        text=case["input"],
        cells=cells,
        tags=["punctuation", "ellipsis", "manual-backed"],
    )
)

# Fraction slash: context rule over slash between numeric tokens.
decision = master_items["FA-CTX-002"]
case = context_cases["FA-CTX-002"]
rule_id = SPECIAL_RULE_IDS["FA-CTX-002"]
vector_id = CONF_IDS[rule_id]
cells = [case["manual"]["slashDots"]]

rules.append(
    candidate_rule(
        rule_id=rule_id,
        rule_type="context",
        input_kind="context",
        text="/",
        cells=cells,
        decision_item=decision,
        vector_id=vector_id,
        priority=100,
        before="digit",
        after="digit",
        token_class="numeric-fraction-separator",
    )
)
vectors.append(
    conformance_vector(
        vector_id=vector_id,
        rule_id=rule_id,
        text="/",
        cells=cells,
        before="digit",
        after="digit",
        token_class="numeric-fraction-separator",
        tags=["number", "fraction", "context", "manual-backed"],
    )
)

# Single asterisk. This is kept distinct from longer adjacent runs.
decision = master_items["FA-CTX-003"]
case = context_cases["FA-CTX-003"]
rule_id = SPECIAL_RULE_IDS["FA-CTX-003"]
vector_id = CONF_IDS[rule_id]
cells = split_dots(case["manual"]["expectedDots"])

rules.append(
    candidate_rule(
        rule_id=rule_id,
        rule_type="character",
        input_kind="scalar",
        text=case["input"],
        cells=cells,
        decision_item=decision,
        vector_id=vector_id,
        priority=200,
        rationale_suffix=(
            "A longer adjacent asterisk-run candidate has higher precedence."
        ),
    )
)
vectors.append(
    conformance_vector(
        vector_id=vector_id,
        rule_id=rule_id,
        text=case["input"],
        cells=cells,
        tags=["punctuation", "asterisk", "manual-backed"],
    )
)

# Three-asterisk representative run from the audited evidence.
decision = master_items["FA-CTX-004"]
case = context_cases["FA-CTX-004"]
rule_id = SPECIAL_RULE_IDS["FA-CTX-004"]
vector_id = CONF_IDS[rule_id]
cells = split_dots(case["manual"]["expectedDots"])

rules.append(
    candidate_rule(
        rule_id=rule_id,
        rule_type="sequence",
        input_kind="sequence",
        text=case["input"],
        cells=cells,
        decision_item=decision,
        vector_id=vector_id,
        priority=100,
        rationale_suffix=(
            "This Phase 2.2 record captures the audited three-asterisk "
            "representative run. Generalized arbitrary-length run semantics "
            "are deliberately deferred."
        ),
    )
)
vectors.append(
    conformance_vector(
        vector_id=vector_id,
        rule_id=rule_id,
        text=case["input"],
        cells=cells,
        tags=["punctuation", "asterisk-run", "manual-backed"],
    )
)

# Stable deterministic order.
rules.sort(key=lambda row: row["id"])
vectors.sort(key=lambda row: row["id"])

if len(rules) != 37 or len(vectors) != 37:
    raise RuntimeError(
        f"Expected 37 rules/vectors, got {len(rules)}/{len(vectors)}"
    )

rule_ids = [row["id"] for row in rules]
vector_ids = [row["id"] for row in vectors]

if len(rule_ids) != len(set(rule_ids)):
    raise RuntimeError("Duplicate Phase 2.2 rule IDs")
if len(vector_ids) != len(set(vector_ids)):
    raise RuntimeError("Duplicate Phase 2.2 conformance IDs")

# All initial fa-ir-g1 candidates are six-dot.
for rule in rules:
    for cell in rule["output"]["cells"]:
        if any(dot in cell for dot in "78"):
            raise RuntimeError(
                f"Six-dot candidate package contains dot 7/8: {rule['id']} {cell}"
            )

# Every rule must have exactly one vector and vice versa.
rule_to_vector = {
    rule["id"]: rule["conformance"]["vectorIds"][0]
    for rule in rules
}
vector_to_rule = {
    vector["id"]: vector["ruleIds"][0]
    for vector in vectors
}

for rule_id, vector_id in rule_to_vector.items():
    if vector_id not in vector_to_rule:
        raise RuntimeError(f"Rule references missing vector: {rule_id}")
    if vector_to_rule[vector_id] != rule_id:
        raise RuntimeError(f"Rule/vector mismatch: {rule_id} <-> {vector_id}")

# Rebuild generated directories atomically enough for deterministic local use:
# remove only the candidate directories owned by this generator.
for generated_dir in (RULE_DIR, CONF_DIR):
    if generated_dir.exists():
        shutil.rmtree(generated_dir)
    generated_dir.mkdir(parents=True, exist_ok=True)

rule_manifest_entries = []
for rule in rules:
    path = RULE_DIR / safe_file_id(rule["id"])
    write_json(path, rule)
    rule_manifest_entries.append(
        {
            "id": rule["id"],
            "path": str(path.relative_to(ROOT)).replace("\\", "/"),
            "sha256": sha256_bytes(path.read_bytes()),
        }
    )

conf_manifest_entries = []
for vector in vectors:
    path = CONF_DIR / safe_file_id(vector["id"])
    write_json(path, vector)
    conf_manifest_entries.append(
        {
            "id": vector["id"],
            "path": str(path.relative_to(ROOT)).replace("\\", "/"),
            "sha256": sha256_bytes(path.read_bytes()),
        }
    )

profile = {
    "schemaVersion": SCHEMA_VERSION,
    "id": PROFILE_ID,
    "status": "draft",
    "language": "fa",
    "region": "IR",
    "grade": 1,
    "cellSize": 6,
    "direction": "print-to-braille",
    "version": PROFILE_VERSION,
    "ruleIds": rule_ids,
    "normalizationPolicy": {
        "unicodeForm": "none",
        "unknownFormatControls": "error",
    },
    "fallbackPolicy": {
        "unknownCharacter": "error",
        "unknownSequence": "error",
    },
    "evidenceBaseline": {
        "masterDecisionMatrix": (
            "spec/fa-ir/evidence/master-decision-matrix.json"
        ),
        "minimumClassification": CONSENSUS,
    },
}

write_json(PROFILE_FILE, profile)

manifest = {
    "schemaVersion": 1,
    "stage": "2.2",
    "profile": {
        "id": PROFILE_ID,
        "version": PROFILE_VERSION,
        "path": str(PROFILE_FILE.relative_to(ROOT)).replace("\\", "/"),
        "sha256": sha256_bytes(PROFILE_FILE.read_bytes()),
    },
    "status": "candidate-package",
    "normative": False,
    "summary": {
        "decisionItemsConsumed": 37,
        "rules": len(rules),
        "conformanceVectors": len(vectors),
        "coreAlphabetRules": 32,
        "orthographicRules": 1,
        "punctuationOrNumberRules": 4,
        "dot78Rules": 0,
    },
    "rules": rule_manifest_entries,
    "conformanceVectors": conf_manifest_entries,
}

write_json(MANIFEST_FILE, manifest)

doc_lines = [
    "# Phase 2.2 — Initial `fa-ir-g1` Candidate Package",
    "",
    "This stage materializes the 37 Phase 1 `CONSENSUS-CANDIDATE` decisions "
    "as machine-readable **candidate** rules and draft conformance vectors.",
    "",
    "**Nothing in this package is normative yet.**",
    "",
    "## Package summary",
    "",
    "- 32 core Persian alphabet candidate rules",
    "- 1 U+0670 superscript-alef candidate rule",
    "- 4 audited punctuation/number-context candidate rules",
    "- 37 draft conformance vectors",
    "- 1 incomplete `fa-ir-g1` draft profile",
    "- 0 dot-7/dot-8 rules",
    "",
    "## Safety boundary",
    "",
    "The draft profile uses `error` fallback for unknown characters and "
    "unknown sequences. Phase 2.2 intentionally does not pretend that the "
    "37-rule subset is a complete Persian Braille translator.",
    "",
    "Global Unicode normalization is also left as `none`; unresolved "
    "normalization and format-control policy from Phase 1 is not silently "
    "promoted.",
    "",
    "## Candidate precedence",
    "",
    "The audited `***` asterisk run is assigned higher precedence than the "
    "single `*` candidate so that a later engine can implement deterministic "
    "longest/specific-match behavior without conflating the two records.",
    "",
    "The three-asterisk rule is deliberately representative only. Phase 2.2 "
    "does not generalize arbitrary-length asterisk runs beyond the audited "
    "evidence.",
    "",
    "## Fraction slash",
    "",
    "The `/` candidate is explicitly contextual: left and right context are "
    "`digit`, with token class `numeric-fraction-separator`. The conformance "
    "vector tests the same context rather than treating slash-alone behavior "
    "as equivalent.",
    "",
    "## File paths",
    "",
    "Rule and conformance file paths are repository metadata only. The draft "
    "profile selects stable rule IDs, not filesystem paths.",
    "",
    "## Next gate",
    "",
    "Phase 2.3 should validate every generated artifact against the Phase 2.1 "
    "JSON Schemas and add semantic cross-file validation: profile→rule, "
    "rule→vector, vector→rule, decision-item provenance, six-dot profile "
    "constraints, and Unicode-Braille derivation.",
]

write_text(DOC_FILE, "\n".join(doc_lines))

# Final manifest is written before this final report, so all user-facing
# generated artifacts are deterministic.
generated_files = (
    [PROFILE_FILE, MANIFEST_FILE, DOC_FILE]
    + [ROOT / entry["path"] for entry in rule_manifest_entries]
    + [ROOT / entry["path"] for entry in conf_manifest_entries]
)

print("Phase 2.2 candidate package built.")
print(f"Profile                 : {PROFILE_ID} {PROFILE_VERSION} (draft)")
print(f"Candidate rules         : {len(rules)}")
print(f"Conformance vectors     : {len(vectors)}")
print(f"Core alphabet rules     : 32")
print(f"Other consensus rules   : 5")
print(f"Dot-7/dot-8 rules       : 0")
print(f"Generated data/docs     : {len(generated_files)}")
print(f"Profile SHA-256         : {sha256_bytes(PROFILE_FILE.read_bytes())}")
print(f"Manifest SHA-256        : {sha256_bytes(MANIFEST_FILE.read_bytes())}")
print(f"Documentation SHA-256   : {sha256_bytes(DOC_FILE.read_bytes())}")
