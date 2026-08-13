from __future__ import annotations

from pathlib import Path
import hashlib
import json
import re
import shutil

try:
    from jsonschema import Draft202012Validator
    from jsonschema.exceptions import SchemaError, ValidationError
except ImportError as exc:
    raise SystemExit(
        "Missing dependency: jsonschema\n"
        "Install it with:\n"
        "  py -3 -m pip install -r requirements-spec.txt\n"
    ) from exc

ROOT = Path(__file__).resolve().parents[2]

MASTER = ROOT / "spec" / "fa-ir" / "evidence" / "master-decision-matrix.json"
NUMPUNC = ROOT / "spec" / "fa-ir" / "evidence" / "numbers-punctuation.json"

RULE_SCHEMA = ROOT / "spec" / "fa-ir" / "schema" / "rule.schema.json"
PROFILE_SCHEMA = ROOT / "spec" / "fa-ir" / "schema" / "profile.schema.json"
CONFORMANCE_SCHEMA = ROOT / "spec" / "fa-ir" / "schema" / "conformance.schema.json"
PROMOTION_SCHEMA = ROOT / "spec" / "fa-ir" / "schema" / "promotion-record.schema.json"
PROMOTION_POLICY = ROOT / "spec" / "fa-ir" / "governance" / "normative-promotion-policy.json"
PROMOTION_DIR = ROOT / "spec" / "fa-ir" / "promotions"

RULE_DIR = ROOT / "spec" / "fa-ir" / "rules" / "records"
CONF_DIR = ROOT / "spec" / "fa-ir" / "conformance" / "records"

LEGACY_RULE_DIR = ROOT / "spec" / "fa-ir" / "rules" / "candidates"
LEGACY_CONF_DIR = ROOT / "spec" / "fa-ir" / "conformance" / "candidates"
PROFILE_DIR = ROOT / "spec" / "fa-ir" / "profiles"
MANIFEST_DIR = ROOT / "spec" / "fa-ir" / "manifests"
DOCS_DIR = ROOT / "docs" / "specification"

PROFILE_FILE = PROFILE_DIR / "fa-ir-g1.json"
MANIFEST_FILE = MANIFEST_DIR / "fa-ir-g1-materialization.json"
LEGACY_MANIFEST_FILE = MANIFEST_DIR / "phase-2.2-candidate-package.json"
DOC_FILE = DOCS_DIR / "phase-2.7-promotion-aware-materialization.md"

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


def base_rule(
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
            "Materialized lifecycle status is controlled by promotion records.",
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
            "Materialized conformance vector for the fa-ir-g1 rule record."
        ],
    }


master = read_json(MASTER)
numpunc = read_json(NUMPUNC)

# Make sure Phase 2.1 revised schemas are actually present before generating
# artifacts that depend on their contracts.
rule_schema = read_json(RULE_SCHEMA)
profile_schema = read_json(PROFILE_SCHEMA)
conf_schema = read_json(CONFORMANCE_SCHEMA)
promotion_schema = read_json(PROMOTION_SCHEMA)
promotion_policy = read_json(PROMOTION_POLICY)

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

try:
    Draft202012Validator.check_schema(promotion_schema)
except SchemaError as exc:
    raise RuntimeError(
        f"Invalid promotion record schema: {exc.message}"
    ) from exc

if promotion_policy["promotion"]["automaticPromotionAllowed"] is not False:
    raise RuntimeError("Promotion materialization requires automatic promotion=false")
if promotion_policy["promotion"]["ciPassAloneMayPromote"] is not False:
    raise RuntimeError("Promotion materialization requires ciPassAloneMayPromote=false")

applied_promotions: dict[tuple[str, str], dict] = {}
if PROMOTION_DIR.exists():
    promotion_validator = Draft202012Validator(promotion_schema)
    for promotion_path in sorted(PROMOTION_DIR.glob("*.json")):
        promotion = read_json(promotion_path)
        try:
            promotion_validator.validate(promotion)
        except ValidationError as exc:
            location = "/".join(str(part) for part in exc.absolute_path)
            suffix = f" at {location}" if location else ""
            raise RuntimeError(
                f"Invalid promotion record {promotion_path.name}{suffix}: "
                f"{exc.message}"
            ) from exc

        if promotion["policyVersion"] != promotion_policy["policyVersion"]:
            raise RuntimeError(
                f"Promotion policy mismatch in {promotion_path.name}: "
                f"{promotion['policyVersion']} != "
                f"{promotion_policy['policyVersion']}"
            )

        key = (promotion["ruleId"], promotion["ruleVersion"])
        if key in applied_promotions:
            raise RuntimeError(
                "Duplicate promotion record for rule/version: "
                f"{key[0]} {key[1]}"
            )
        applied_promotions[key] = promotion

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
        base_rule(
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
    base_rule(
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
    base_rule(
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
    base_rule(
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
    base_rule(
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
    base_rule(
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

# Apply explicit promotion records to the generated baseline.
rules_by_id = {rule["id"]: rule for rule in rules}
vectors_by_id = {vector["id"]: vector for vector in vectors}

for (promoted_rule_id, promoted_version), promotion in applied_promotions.items():
    if promoted_rule_id not in rules_by_id:
        raise RuntimeError(
            f"Promotion targets unknown materialized rule: {promoted_rule_id}"
        )

    rule = rules_by_id[promoted_rule_id]
    if rule["version"] != promoted_version:
        raise RuntimeError(
            f"Promotion version mismatch for {promoted_rule_id}: "
            f"record={promoted_version}, materialized={rule['version']}"
        )

    rule["status"] = "normative"
    rule["notes"].append(
        f"Normative status materialized from promotion record {promotion['id']}."
    )

    vector_id = rule["conformance"]["vectorIds"][0]
    vector = vectors_by_id[vector_id]
    vector["status"] = "active"
    vector["notes"].append(
        f"Activated because {promoted_rule_id} is normative."
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

# Rebuild generated directories deterministically.
# Phase 2.7 migrates status-bearing artifacts out of status-specific paths.
for obsolete_dir in (LEGACY_RULE_DIR, LEGACY_CONF_DIR):
    if obsolete_dir.exists():
        shutil.rmtree(obsolete_dir)

if LEGACY_MANIFEST_FILE.exists():
    LEGACY_MANIFEST_FILE.unlink()

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
            "status": rule["status"],
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
            "status": vector["status"],
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

candidate_count = sum(1 for rule in rules if rule["status"] == "candidate")
normative_count = sum(1 for rule in rules if rule["status"] == "normative")
active_vector_count = sum(1 for vector in vectors if vector["status"] == "active")

manifest = {
    "schemaVersion": 1,
    "stage": "2.7",
    "profile": {
        "id": PROFILE_ID,
        "version": PROFILE_VERSION,
        "status": "draft",
        "path": str(PROFILE_FILE.relative_to(ROOT)).replace("\\", "/"),
        "sha256": sha256_bytes(PROFILE_FILE.read_bytes()),
    },
    "status": "materialized-package",
    "profileNormative": False,
    "summary": {
        "decisionItemsConsumed": 37,
        "rules": len(rules),
        "candidateRules": candidate_count,
        "normativeRules": normative_count,
        "conformanceVectors": len(vectors),
        "activeConformanceVectors": active_vector_count,
        "coreAlphabetRules": 32,
        "orthographicRules": 1,
        "punctuationOrNumberRules": 4,
        "dot78Rules": 0,
        "promotionRecordsApplied": len(applied_promotions),
    },
    "rules": rule_manifest_entries,
    "conformanceVectors": conf_manifest_entries,
}

write_json(MANIFEST_FILE, manifest)

doc_lines = [
    "# Phase 2.7 — Promotion-Aware Rule Materialization",
    "",
    "The 37 Phase 1 consensus decisions remain the reproducible baseline for "
    "`fa-ir-g1`, but lifecycle status is now materialized from explicit "
    "promotion records.",
    "",
    f"- Candidate rules: {candidate_count}",
    f"- Normative rules: {normative_count}",
    f"- Promotion records applied: {len(applied_promotions)}",
    f"- Active conformance vectors: {active_vector_count}",
    "",
    "## Source of lifecycle status",
    "",
    "Without a promotion record, a generated rule remains `candidate` and its "
    "conformance vector remains `draft`.",
    "",
    "When a schema-valid promotion record targets the exact rule/version, the "
    "materializer emits that rule as `normative` and its vector as `active`.",
    "",
    "The independent Phase 2.6 promotion validator remains responsible for "
    "cross-checking evidence provenance, registered sources, hard gates, and "
    "the project-vs-official-standard scope boundary.",
    "",
    "## Status-neutral repository paths",
    "",
    "Phase 2.7 migrates generated artifacts from `rules/candidates` and "
    "`conformance/candidates` to status-neutral `rules/records` and "
    "`conformance/records`. Profile semantics remain based on stable rule IDs, "
    "so this filesystem migration is non-normative.",
    "",
    "## Profile status",
    "",
    "Promoting individual rules does not promote the incomplete `fa-ir-g1` "
    "profile. The profile remains `draft` until a separate completeness gate "
    "is satisfied.",
    "",
    "## Reversibility",
    "",
    "Removing a promotion record and regenerating materializes the affected "
    "rule as `candidate` again. The repository therefore has one deterministic "
    "source of lifecycle truth: promotion records plus the Phase 1 baseline.",
]

write_text(DOC_FILE, "\n".join(doc_lines))

# Final manifest is written before this final report, so all user-facing
# generated artifacts are deterministic.
generated_files = (
    [PROFILE_FILE, MANIFEST_FILE, DOC_FILE]
    + [ROOT / entry["path"] for entry in rule_manifest_entries]
    + [ROOT / entry["path"] for entry in conf_manifest_entries]
)

print("Phase 2.7 promotion-aware package materialized.")
print(f"Profile                 : {PROFILE_ID} {PROFILE_VERSION} (draft)")
print(f"Rules                    : {len(rules)}")
print(f"Candidate rules          : {candidate_count}")
print(f"Normative rules          : {normative_count}")
print(f"Conformance vectors      : {len(vectors)}")
print(f"Active vectors           : {active_vector_count}")
print(f"Promotion records applied: {len(applied_promotions)}")
print(f"Dot-7/dot-8 rules        : 0")
print(f"Generated data/docs      : {len(generated_files)}")
print(f"Profile SHA-256          : {sha256_bytes(PROFILE_FILE.read_bytes())}")
print(f"Manifest SHA-256         : {sha256_bytes(MANIFEST_FILE.read_bytes())}")
print(f"Documentation SHA-256    : {sha256_bytes(DOC_FILE.read_bytes())}")
