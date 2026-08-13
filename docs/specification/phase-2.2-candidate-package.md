# Phase 2.2 — Initial `fa-ir-g1` Candidate Package

This stage materializes the 37 Phase 1 `CONSENSUS-CANDIDATE` decisions as machine-readable **candidate** rules and draft conformance vectors.

**Nothing in this package is normative yet.**

## Package summary

- 32 core Persian alphabet candidate rules
- 1 U+0670 superscript-alef candidate rule
- 4 audited punctuation/number-context candidate rules
- 37 draft conformance vectors
- 1 incomplete `fa-ir-g1` draft profile
- 0 dot-7/dot-8 rules

## Safety boundary

The draft profile uses `error` fallback for unknown characters and unknown sequences. Phase 2.2 intentionally does not pretend that the 37-rule subset is a complete Persian Braille translator.

Global Unicode normalization is also left as `none`; unresolved normalization and format-control policy from Phase 1 is not silently promoted.

## Candidate precedence

The audited `***` asterisk run is assigned higher precedence than the single `*` candidate so that a later engine can implement deterministic longest/specific-match behavior without conflating the two records.

The three-asterisk rule is deliberately representative only. Phase 2.2 does not generalize arbitrary-length asterisk runs beyond the audited evidence.

## Fraction slash

The `/` candidate is explicitly contextual: left and right context are `digit`, with token class `numeric-fraction-separator`. The conformance vector tests the same context rather than treating slash-alone behavior as equivalent.

## File paths

Rule and conformance file paths are repository metadata only. The draft profile selects stable rule IDs, not filesystem paths.

## Next gate

Phase 2.3 should validate every generated artifact against the Phase 2.1 JSON Schemas and add semantic cross-file validation: profile→rule, rule→vector, vector→rule, decision-item provenance, six-dot profile constraints, and Unicode-Braille derivation.
