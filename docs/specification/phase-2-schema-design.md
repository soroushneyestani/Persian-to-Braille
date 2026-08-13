# Phase 2.1 — Formal Specification Schema Design

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
