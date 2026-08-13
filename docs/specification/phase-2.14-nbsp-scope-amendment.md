# Phase 2.14 — NBSP Scope Amendment

## Decision

`FA-PUNC-018` (`U+00A0 NO-BREAK SPACE`) was originally adjudicated as:

- disposition: `accept-rule`
- target type: `character`
- creates specification artifact: `true`

The candidate-materialization readiness audit identified that the observed
Liblouis value `a` is not a Braille cell and cannot be represented by the
current six-dot rule schema as a character output.

NBSP already has a dedicated whitespace/layout decision:

- `FA-WS-007`
- disposition: `accept-layout-policy`
- target type: `layout`

Following explicit project-maintainer approval, `FA-PUNC-018` is amended to:

- disposition: `out-of-scope`
- creates specification artifact: `false`
- target type: `null`
- promotion eligible: `false`
- project normative: `false`

## Rationale

Amended after the Phase 2.14 candidate-materialization readiness audit. NO-BREAK SPACE (U+00A0) is not a standalone punctuation/Braille character rule in this project. The observed Liblouis operand 'a' is a virtual/internal space operand, not a publishable Braille cell, and NBSP translation/layout semantics are already owned by FA-WS-007. The scalar punctuation decision is therefore out of scope to avoid a duplicate specification artifact.

## Count impact

Adjudication totals remain unchanged:

- records: 253
- approved: 153
- deferred: 100
- unadjudicated: 0

Materializable/admission decisions change from 139 to 138.

Global disposition changes:

- `accept-rule`: 100 -> 99
- `out-of-scope`: 2 -> 3

Candidate target-type changes:

- `character`: 99 -> 98

All other disposition and target-type counts are unchanged.

## Historical integrity

The Phase 1 classification is not rewritten. The earlier adjudication remains
visible in Git history; this amendment records a later scope correction caused
by materialization-readiness validation. No normative promotion is performed.
