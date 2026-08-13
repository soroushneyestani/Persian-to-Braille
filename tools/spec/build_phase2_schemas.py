from __future__ import annotations

from pathlib import Path
import hashlib
import json

ROOT = Path(__file__).resolve().parents[2]

SCHEMA_DIR = ROOT / "spec" / "fa-ir" / "schema"
DOCS_DIR = ROOT / "docs" / "specification"

RULE_SCHEMA = SCHEMA_DIR / "rule.schema.json"
PROFILE_SCHEMA = SCHEMA_DIR / "profile.schema.json"
CONFORMANCE_SCHEMA = SCHEMA_DIR / "conformance.schema.json"
DOC = DOCS_DIR / "phase-2-schema-design.md"

SCHEMA_VERSION = 1

RULE_TYPES = [
    "character",
    "sequence",
    "context",
    "normalization",
    "mode",
    "layout",
]

RULE_STATUSES = [
    "draft",
    "candidate",
    "normative",
    "deprecated",
]

PROFILE_STATUSES = [
    "draft",
    "candidate",
    "normative",
    "deprecated",
]

CONFORMANCE_STATUSES = [
    "draft",
    "active",
    "deprecated",
]


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest().upper()


def write_json(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        handle.write(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        handle.write(text.rstrip() + "\n")


dot_cell_schema = {
    "type": "string",
    "description": (
        "Braille dot pattern for one cell. '0' is the blank Braille cell. "
        "Otherwise digits 1-8 identify raised dots. Canonical ordering and "
        "duplicate-dot rejection are semantic validator responsibilities."
    ),
    "pattern": r"^(?:0|[1-8]{1,8})$",
    "examples": ["1", "1234", "3456", "0"],
}

code_point_schema = {
    "type": "string",
    "pattern": r"^U\+[0-9A-F]{4,6}$",
    "examples": ["U+067E", "U+2026"],
}

source_id_schema = {
    "type": "string",
    "pattern": r"^SRC-[A-Z0-9][A-Z0-9-]*$",
}

decision_item_id_schema = {
    "type": "string",
    "pattern": r"^FA-[A-Z0-9][A-Z0-9-]*$",
}

rule_id_schema = {
    "type": "string",
    "pattern": r"^FA-[A-Z0-9]+(?:-[A-Z0-9]+)*-\d{3,}$",
    "examples": ["FA-G1-LETTER-003", "FA-G1-PUNC-ELLIPSIS-001"],
}

profile_id_schema = {
    "type": "string",
    "pattern": r"^[a-z]{2,3}(?:-[a-z0-9]+)+$",
    "examples": ["fa-ir-g1"],
}

rule_schema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://soroushneyestani.github.io/Persian-to-Braille/spec/fa-ir/schema/rule.schema.json",
    "title": "Persian Braille Rule",
    "description": (
        "Schema for one auditable, profile-scoped Persian Braille rule. "
        "A rule is not normative merely because it validates against this schema."
    ),
    "type": "object",
    "additionalProperties": False,
    "required": [
        "schemaVersion",
        "id",
        "profile",
        "type",
        "status",
        "version",
        "direction",
        "input",
        "output",
        "evidence",
        "conformance",
    ],
    "properties": {
        "schemaVersion": {
            "type": "integer",
            "const": SCHEMA_VERSION,
        },
        "id": rule_id_schema,
        "profile": profile_id_schema,
        "type": {
            "type": "string",
            "enum": RULE_TYPES,
        },
        "status": {
            "type": "string",
            "enum": RULE_STATUSES,
        },
        "version": {
            "type": "string",
            "pattern": r"^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$",
            "description": "Semantic version of this rule artifact.",
        },
        "direction": {
            "type": "string",
            "enum": ["forward"],
            "description": (
                "Phase 2 defines forward print-to-Braille rules only. "
                "Reverse translation will use a later schema/version."
            ),
        },
        "priority": {
            "type": "integer",
            "minimum": 0,
            "default": 1000,
            "description": (
                "Deterministic rule precedence. Lower values run earlier. "
                "Equal-priority overlap must be rejected by semantic validation."
            ),
        },
        "input": {
            "type": "object",
            "additionalProperties": False,
            "required": ["kind"],
            "properties": {
                "kind": {
                    "type": "string",
                    "enum": [
                        "scalar",
                        "sequence",
                        "context",
                        "structural",
                    ],
                },
                "text": {
                    "type": "string",
                    "minLength": 1,
                },
                "codePoints": {
                    "type": "array",
                    "items": code_point_schema,
                    "minItems": 1,
                    "uniqueItems": False,
                },
                "before": {
                    "type": ["string", "null"],
                },
                "after": {
                    "type": ["string", "null"],
                },
                "tokenClass": {
                    "type": ["string", "null"],
                },
            },
            "allOf": [
                {
                    "if": {
                        "properties": {
                            "kind": {"enum": ["scalar", "sequence", "context"]}
                        }
                    },
                    "then": {
                        "required": ["text", "codePoints"]
                    },
                }
            ],
        },
        "output": {
            "type": "object",
            "additionalProperties": False,
            "required": ["cells"],
            "properties": {
                "cells": {
                    "type": "array",
                    "items": dot_cell_schema,
                    "minItems": 0,
                },
                "unicodeBraille": {
                    "type": ["string", "null"],
                    "description": (
                        "Canonical Unicode Braille rendering when every output "
                        "cell is representable in U+2800-U+28FF. Null for "
                        "structural/virtual output."
                    ),
                },
                "structuralToken": {
                    "type": ["string", "null"],
                    "description": (
                        "Optional non-cell output token for layout/host-aware rules."
                    ),
                },
            },
        },
        "normalization": {
            "type": "object",
            "additionalProperties": False,
            "properties": {
                "form": {
                    "type": "string",
                    "enum": ["none", "NFC", "NFD", "NFKC", "NFKD"],
                },
                "canonicalInput": {
                    "type": ["string", "null"],
                },
                "notes": {
                    "type": ["string", "null"],
                },
            },
        },
        "evidence": {
            "type": "object",
            "additionalProperties": False,
            "required": [
                "decisionItemIds",
                "sourceIds",
                "rationale",
            ],
            "properties": {
                "decisionItemIds": {
                    "type": "array",
                    "items": decision_item_id_schema,
                    "minItems": 1,
                    "uniqueItems": True,
                },
                "sourceIds": {
                    "type": "array",
                    "items": source_id_schema,
                    "minItems": 1,
                    "uniqueItems": True,
                },
                "rationale": {
                    "type": "string",
                    "minLength": 1,
                },
                "conflictsResolved": {
                    "type": "array",
                    "items": {"type": "string", "minLength": 1},
                    "default": [],
                },
            },
        },
        "conformance": {
            "type": "object",
            "additionalProperties": False,
            "required": ["vectorIds"],
            "properties": {
                "vectorIds": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "pattern": r"^FA-CONF-[A-Z0-9]+(?:-[A-Z0-9]+)*-\d{3,}$",
                    },
                    "minItems": 1,
                    "uniqueItems": True,
                },
            },
        },
        "notes": {
            "type": "array",
            "items": {"type": "string"},
            "default": [],
        },
    },
}

profile_schema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://soroushneyestani.github.io/Persian-to-Braille/spec/fa-ir/schema/profile.schema.json",
    "title": "Persian Braille Profile",
    "description": (
        "Schema for a versioned Persian Braille translation profile. "
        "Profiles select rule sets; they do not duplicate rule definitions."
    ),
    "type": "object",
    "additionalProperties": False,
    "required": [
        "schemaVersion",
        "id",
        "status",
        "language",
        "region",
        "grade",
        "cellSize",
        "direction",
        "version",
        "ruleIds",
        "normalizationPolicy",
        "fallbackPolicy",
    ],
    "properties": {
        "schemaVersion": {
            "type": "integer",
            "const": SCHEMA_VERSION,
        },
        "id": profile_id_schema,
        "status": {
            "type": "string",
            "enum": PROFILE_STATUSES,
        },
        "language": {
            "type": "string",
            "const": "fa",
        },
        "region": {
            "type": "string",
            "const": "IR",
        },
        "grade": {
            "type": "integer",
            "minimum": 1,
        },
        "cellSize": {
            "type": "integer",
            "enum": [6, 8],
        },
        "direction": {
            "type": "string",
            "enum": ["print-to-braille"],
        },
        "ruleIds": {
            "type": "array",
            "description": (
                "Stable rule identifiers selected by this profile. "
                "Filesystem layout is deliberately non-normative."
            ),
            "items": rule_id_schema,
            "minItems": 1,
            "uniqueItems": True,
        },
        "normalizationPolicy": {
            "type": "object",
            "additionalProperties": False,
            "required": ["unicodeForm", "unknownFormatControls"],
            "properties": {
                "unicodeForm": {
                    "type": "string",
                    "enum": ["none", "NFC", "NFKC"],
                },
                "unknownFormatControls": {
                    "type": "string",
                    "enum": ["preserve", "ignore", "error"],
                },
            },
        },
        "fallbackPolicy": {
            "type": "object",
            "additionalProperties": False,
            "required": ["unknownCharacter", "unknownSequence"],
            "properties": {
                "unknownCharacter": {
                    "type": "string",
                    "enum": ["preserve", "replace", "error"],
                },
                "unknownSequence": {
                    "type": "string",
                    "enum": ["scalar-fallback", "preserve", "error"],
                },
            },
        },
        "evidenceBaseline": {
            "type": "object",
            "additionalProperties": False,
            "properties": {
                "masterDecisionMatrix": {
                    "type": "string",
                    "const": "spec/fa-ir/evidence/master-decision-matrix.json",
                },
                "minimumClassification": {
                    "type": "string",
                    "enum": [
                        "CONSENSUS-CANDIDATE",
                        "REVIEW-REQUIRED",
                        "UNRESOLVED",
                    ],
                },
            },
        },
        "version": {
            "type": "string",
            "pattern": r"^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$",
            "description": "Semantic version of this profile artifact.",
        },
    },
}

conformance_schema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://soroushneyestani.github.io/Persian-to-Braille/spec/fa-ir/schema/conformance.schema.json",
    "title": "Persian Braille Conformance Vector",
    "description": (
        "Schema for deterministic print-to-Braille conformance vectors."
    ),
    "type": "object",
    "additionalProperties": False,
    "required": [
        "schemaVersion",
        "id",
        "status",
        "version",
        "profile",
        "profileVersion",
        "ruleIds",
        "input",
        "expected",
    ],
    "properties": {
        "schemaVersion": {
            "type": "integer",
            "const": SCHEMA_VERSION,
        },
        "id": {
            "type": "string",
            "pattern": r"^FA-CONF-[A-Z0-9]+(?:-[A-Z0-9]+)*-\d{3,}$",
        },
        "status": {
            "type": "string",
            "enum": CONFORMANCE_STATUSES,
        },
        "version": {
            "type": "string",
            "pattern": r"^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$",
            "description": "Semantic version of this conformance vector.",
        },
        "profile": profile_id_schema,
        "profileVersion": {
            "type": "string",
            "pattern": r"^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$",
            "description": "Exact profile version used by this vector.",
        },
        "ruleIds": {
            "type": "array",
            "items": rule_id_schema,
            "minItems": 1,
            "uniqueItems": True,
        },
        "input": {
            "type": "object",
            "additionalProperties": False,
            "required": ["text", "codePoints"],
            "properties": {
                "text": {
                    "type": "string",
                },
                "codePoints": {
                    "type": "array",
                    "items": code_point_schema,
                },
                "before": {
                    "type": ["string", "null"],
                    "description": "Optional left-context predicate/token class.",
                },
                "after": {
                    "type": ["string", "null"],
                    "description": "Optional right-context predicate/token class.",
                },
                "tokenClass": {
                    "type": ["string", "null"],
                    "description": "Optional semantic token-class constraint.",
                },
            },
        },
        "expected": {
            "type": "object",
            "additionalProperties": False,
            "required": ["cells"],
            "properties": {
                "cells": {
                    "type": "array",
                    "items": dot_cell_schema,
                },
                "unicodeBraille": {
                    "type": ["string", "null"],
                },
                "structuralTokens": {
                    "type": "array",
                    "items": {"type": "string"},
                    "default": [],
                },
            },
        },
        "tags": {
            "type": "array",
            "items": {"type": "string"},
            "uniqueItems": True,
            "default": [],
        },
        "notes": {
            "type": "array",
            "items": {"type": "string"},
            "default": [],
        },
    },
}

# Generator-level structural invariants.
if len(RULE_TYPES) != len(set(RULE_TYPES)):
    raise RuntimeError("Duplicate rule type")
if len(RULE_STATUSES) != len(set(RULE_STATUSES)):
    raise RuntimeError("Duplicate rule status")
if rule_schema["properties"]["direction"]["enum"] != ["forward"]:
    raise RuntimeError("Phase 2.1 must remain forward-only")
if profile_schema["properties"]["cellSize"]["enum"] != [6, 8]:
    raise RuntimeError("Profile schema must preserve six/eight-dot separation")
if "decisionItemIds" not in rule_schema["properties"]["evidence"]["required"]:
    raise RuntimeError("Rules must remain traceable to Phase 1 decision items")
if "vectorIds" not in rule_schema["properties"]["conformance"]["required"]:
    raise RuntimeError("Rules must require conformance-vector traceability")
if "version" not in rule_schema["required"]:
    raise RuntimeError("Rule artifacts must be versioned")
if "version" not in profile_schema["required"]:
    raise RuntimeError("Profiles must be versioned")
if "ruleIds" not in profile_schema["required"]:
    raise RuntimeError("Profiles must select stable rule IDs")
if "rules" in profile_schema["properties"]:
    raise RuntimeError("Profile semantics must not depend on filesystem rule paths")
if "version" not in conformance_schema["required"]:
    raise RuntimeError("Conformance vectors must be versioned")
if "profileVersion" not in conformance_schema["required"]:
    raise RuntimeError("Conformance vectors must pin a profile version")
for context_key in ("before", "after", "tokenClass"):
    if context_key not in conformance_schema["properties"]["input"]["properties"]:
        raise RuntimeError(
            f"Conformance input must support context field: {context_key}"
        )

write_json(RULE_SCHEMA, rule_schema)
write_json(PROFILE_SCHEMA, profile_schema)
write_json(CONFORMANCE_SCHEMA, conformance_schema)

doc = f"""# Phase 2.1 — Formal Specification Schema Design

Phase 2 starts from machine-readable contracts, not from translator code.

The schemas in `spec/fa-ir/schema/` define three distinct artifact types:

1. **Rule** — one auditable print-to-Braille rule.
2. **Profile** — a versioned selection and policy envelope over stable rule IDs.
3. **Conformance vector** — a versioned deterministic input/expected-output test case pinned to an exact profile version.

## Normative boundary

Schema validation does **not** make a rule normative.

A rule becomes normative only when its own `status` is explicitly promoted to
`normative` after a Phase 2 decision, with evidence and conformance traceability.

The Phase 1 master decision matrix remains evidence:

`spec/fa-ir/evidence/master-decision-matrix.json`

It is not itself the normative specification.

## Rule identity

Normative rules use stable IDs such as:

`FA-G1-LETTER-003`

Rule IDs must remain stable after publication. Every rule artifact also carries
an explicit semantic `version`. Corrections evolve that version rather than
silently reusing an ID for unrelated semantics.

## Profile identity and file layout

Profiles select stable `ruleIds`, not rule-file paths. Repository layout is an
implementation detail and may be reorganized without changing profile semantics.

Profiles are explicitly versioned. Conformance vectors pin the exact
`profileVersion` they test.

## Context conformance

Conformance-vector input may carry optional `before`, `after`, and `tokenClass`
constraints. This is required for rules such as a slash whose Braille behavior
depends on numeric context; a vector must not pretend that translating `/`
alone is equivalent to translating a slash between digits.

## Output model

The primary Braille representation is an array of dot-pattern cells:

`["1234"]`

Unicode Braille is a derived/rendering form:

`"⠏"`

This keeps the specification independent from fonts and from Microsoft Office.

The dot-cell schema permits dots 1–8 so the framework can later host a separate
eight-dot computer-Braille profile. A six-dot profile must enforce six-dot
semantics at profile/semantic-validation level.

## Evidence traceability

Every rule requires:

- one or more Phase 1 `decisionItemIds`;
- one or more registered `sourceIds`;
- a written rationale;
- one or more conformance-vector IDs.

No implementation table or legacy mapping can become normative by being copied
without this traceability.

## Direction

Phase 2.1 is deliberately forward-only:

`print-to-braille`

Reverse translation is a later roadmap phase and must not constrain the first
normative schema prematurely.

## Structural semantics

The schema permits `layout` rules and optional `structuralToken` output so that
tabs, paragraph boundaries, no-break semantics, and host metadata are not forced
into ordinary Braille cells.

Office.js, CLI, Web, LibreOffice, Android, iOS, and other adapters remain
consumers of this specification rather than owners of its rules.

## Next stage

Phase 2.2 will create the draft `fa-ir-g1` profile manifest and the first
normative-candidate rule package from the 37 Phase 1 consensus candidates.
Those candidates will still be reviewed rule-by-rule before any status is set
to `normative`.
"""

write_text(DOC, doc)

outputs = [RULE_SCHEMA, PROFILE_SCHEMA, CONFORMANCE_SCHEMA, DOC]

print("Phase 2.1 formal schemas built.")
print(f"Schema version          : {SCHEMA_VERSION}")
print(f"Rule types              : {len(RULE_TYPES)}")
print(f"Rule statuses           : {len(RULE_STATUSES)}")
print(f"Generated artifacts     : {len(outputs)}")
for path in outputs:
    rel = path.relative_to(ROOT)
    print(f"{str(rel):55} {sha256_bytes(path.read_bytes())}")
