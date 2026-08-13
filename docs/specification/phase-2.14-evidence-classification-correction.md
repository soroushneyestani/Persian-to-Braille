# Phase 2.14 — Evidence Classification Correction

## Purpose

This note records a transparent correction to the Phase 2.12 evidence-packet
classification and the derived Phase 2.13 adjudication plan.

No underlying source evidence changed. The correction fixes how the Phase 2.12
comparator interpreted the Phase 1.6 whitespace/layout evidence shape.

## Original classification

The original Phase 2.12 materialization reported:

- same observed behavior: 151
- different observed behavior: 75
- insufficient data: 27

The derived Phase 2.13 plan therefore contained:

- unresolved: 1
- evidence-gap: 27
- implementation-conflict: 75
- implementation-alignment: 150

## Root cause

The comparator understood the standard `liblouisStable` /
`liblouisDraft` evidence shape, but the Phase 1.6 whitespace/layout audit used
a different structure:

- `spacesUtility`
- `persianStable.localOverride`
- `persianDraft.localOverride`

As a result, 27 whitespace/layout records were incorrectly classified as
`insufficient-data` even though the evidence was present.

This was a parser/classification defect only. It was not a defect in the
registered evidence sources and did not require replacing or altering source
evidence.

## Corrected interpretation

After teaching the comparator to understand the Phase 1.6 evidence structure:

- 26 whitespace/layout records were correctly recognized as
  `same-observed-behavior`.
- U+200C ZERO WIDTH NON-JOINER was correctly recognized as a
  `different-observed-behavior` case:
  - the shared spaces utility did not provide a normal mapping;
  - the stable Persian table used a local space-style rule;
  - the draft Persian table ignored it through a context rule.

The corrected Phase 2.12 totals are therefore:

- same observed behavior: 177
- different observed behavior: 76
- insufficient data: 0

The corrected Phase 2.13 plan is:

- unresolved: 1
- evidence-gap: 0
- implementation-conflict: 76
- implementation-alignment: 176

Total planned decisions remain 253.

## Batch numbering

The former evidence-gap batch disappeared after correction.

Its old batch identifier is intentionally not reused. The corrected plan
contains only:

- Batch 00 — unresolved
- Batch 02 — implementation conflict
- Batch 03 — implementation alignment

This preserves auditability of the historical repository state instead of
rewriting history to make the earlier classification appear never to have
existed.

## Historical integrity

Earlier Git commits that contain the original classification remain part of
repository history. Generated Phase 2.12 and Phase 2.13 artifacts were
corrected forward on the Phase 2.14 adjudication branch.

No Phase 1 decision classification was rewritten by this correction.

## Effect on Phase 2.14

The correction changed routing, not evidence:

- 26 items moved from the obsolete evidence-gap track into implementation
  alignment.
- 1 item moved from the obsolete evidence-gap track into implementation
  conflict.
- the unresolved track remained unchanged.
- the total adjudication population remained 253.

Subsequent Phase 2.14 adjudication, candidate admission, candidate
materialization, and validation operate on the corrected evidence
classification.
