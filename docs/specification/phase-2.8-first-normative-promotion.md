# Phase 2.8 — First Normative Persian Braille Rule

Phase 2.8 records the first real governed normative transition in the
Persian-to-Braille v2 specification.

## Promoted rule

- Rule ID: `FA-G1-LETTER-001`
- Character: `ا`
- Unicode scalar: `U+0627`
- Braille cells: `1`
- Unicode Braille: `⠁`
- Rule version: `0.1.0`
- Phase 1 decision: `FA-CORE-001`

The lifecycle transition is:

`candidate -> normative`

The corresponding conformance vector transitions:

`draft -> active`

The `fa-ir-g1` profile itself remains `draft`.

## Decision authority

The project maintainer explicitly approved this promotion.

The machine-readable decision is stored in:

`spec/fa-ir/promotions/fa-promo-g1-letter-001-001.json`

The promotion is normative only within the Persian-to-Braille project
specification.

It does not claim that the project has established the mapping as the current
official Iranian national Braille standard.

## Evidence and governance

The promotion record preserves the rule's Phase 1 provenance and requires the
decision to remain `CONSENSUS-CANDIDATE`.

The promotion remains subject to the Phase 2.5 policy, the Phase 2.6
independent promotion validator, the general specification validator, negative
fixtures, deterministic materialization, and the protected GitHub CI gate.

## Fixture hardening discovered during the first real promotion

The first real promotion changes the repository baseline from zero normative
rules to one normative rule.

Therefore negative-test sandboxes must copy real promotion records when they
claim to reproduce the current repository state.

The Phase 2.8 fixture update makes that baseline repository-aware and moves
synthetic promotion mutations to the next still-candidate rule,
`FA-G1-LETTER-002`.

This prevents the test suite from incorrectly assuming that the repository will
always contain zero real promotions.

## Expected materialized state

After regeneration:

- total rules: 37
- candidate rules: 36
- normative rules: 1
- conformance vectors: 37
- active vectors: 1
- applied promotion records: 1
- profile status: `draft`

This state must be reproducible from repository inputs alone.
