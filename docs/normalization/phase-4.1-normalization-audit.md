# Phase 4.1 — Canonical Unicode Normalization Audit

## Status

**Phase 4.1: CLOSED**

This audit freezes the canonical normalization baseline inherited from the
closed Phase 2 specification and the Phase 3 specification-consumption
boundary.

## Canonical profile policy

The active profile declares:

```json
{
  "unicodeForm": "none",
  "unknownFormatControls": "error"
}
```

Phase 4 therefore must not introduce NFC, NFD, NFKC, or NFKD as an implicit
global preprocessing step.

## Rule-level normalization baseline

All 175 admitted rules declare:

```text
normalization.form = none
```

The audit found:

```text
canonicalInput = null                  5
canonicalInput differs from input      0
```

There is no canonical remapping currently authorized by the admitted rule
set.

The five null `canonicalInput` values belong to token-class/mode-style rules
whose inputs are not scalar text mappings; they do not authorize text
rewriting.

## Explicit normalization rule

Exactly one admitted rule has `type = normalization`:

```text
FA-G1-NORM-ZWNJ-001
status: candidate
input: U+200C ZERO WIDTH NON-JOINER
structural token: normalization:zwnj-orthographic-boundary
```

Its conformance vector is:

```text
FA-CONF-NORM-ZWNJ-001
status: draft
```

Candidate materialization remains distinct from normative promotion.

## Format controls already represented by the specification

The admitted rule corpus references four distinct Unicode format controls
(General_Category=Cf):

```text
U+200B ZERO WIDTH SPACE
U+200C ZERO WIDTH NON-JOINER
U+2060 WORD JOINER
U+FEFF ZERO WIDTH NO-BREAK SPACE
```

U+200C has two intentional cross-layer representations:

```text
FA-G1-LAYOUT-027
  layout:shaping-control:U+200C

FA-G1-NORM-ZWNJ-001
  normalization:zwnj-orthographic-boundary
```

Phase 4 must preserve that distinction rather than collapsing the layout and
normalization layers into one rule.

## Unknown format controls

The profile policy is:

```text
unknownFormatControls = error
```

Therefore an unrecognized Unicode format control must not be silently
discarded, rewritten, or passed through as though the specification had
authorized it.

The precise runtime error contract is defined in the next Phase 4 deliverable.

## Deferred normalization-related evidence

The audit identified 12 deferred adjudication records related to
normalization, Unicode spelling, canonical Persian forms, sequences, or
orthographic variants:

```text
FA-SEQ-002
FA-SEQ-003
FA-VAR-001
FA-VAR-002
FA-VAR-003
FA-VAR-004
FA-VAR-005
FA-VAR-006
FA-VAR-007
FA-VAR-008
FA-VAR-009
FA-VAR-012
```

These remain deferred evidence backlog.

Phase 4 must not resolve them by inventing mappings in TypeScript.

In particular, Phase 4 does not gain permission to rewrite Arabic/Persian
orthographic variants merely because such rewriting may be conventional in
other software.

## Frozen Phase 4.1 conclusions

The normalization implementation that follows this audit is constrained by
the following baseline:

```text
global Unicode normalization     none
canonical scalar remapping       none unless explicitly specified
known format-control handling    specification-driven
unknown format controls          error
ZWNJ                              preserved for structural/context use
ZWNJ normalization semantics     candidate, not normative
deferred orthographic variants   remain deferred
Braille translation              outside Phase 4 normalization
```

## Reproducibility

The repository contains the read-only audit tool:

```text
tools/normalization/audit-phase4-normalization.py
```

It derives counts from the current canonical specification and writes no
repository files.

## Handoff

The next Phase 4 deliverable is:

**Phase 4.2 — Normalization Domain Contract**

That deliverable defines the Core TypeScript types and API boundary for
profile-driven Unicode preprocessing without implementing translation
semantics.
