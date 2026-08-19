# Phase 15.4D — BSKDL Swiss/Regional Formal Validation Suite

Status: **FORMAL VALIDATION COMPLETE — ONE DEFERRED RUNTIME BRANCH PRESERVED**

## Input contract

Phase 15.4C formal-rule contract:

- Formal rules: `2`
- Formal-rule SHA-256: `652d3bc8d491568f0b07e22f9271b9aac528b715bd2d24f10adf7d21f6fd9bc7`

## Validation result

- Total cases: `12`
- Passed: `12`
- Failed: `0`
- Rule 001 cases: `5`
- Rule 002 cases: `6`
- Rule-set integrity cases: `1`

Canonical validation-suite SHA-256:

`af529d6f13e1b8dffb0e1ba26b683662801af79465a6fbcabdc21268dda20e7e`

## DE-CH410-001

Five formal validations pass.

The suite confirms:

1. Rule identity and normative classification.
2. Applicability to Basisschrift, Vollschrift and Kurzschrift.
3. Preservation of the existing `ß → ⠮` mapping.
4. No invented automatic `ß → ss` normalization.
5. Explicit runtime handling of supplied `ß` remains deferred.

The deferred dependency is:

`SWISS_EXPLICIT_ESZETT_INPUT_POLICY`

No runtime output is invented for that unresolved branch.

## DE-CH410-002

Six formal validations pass.

The suite confirms:

1. `gross` reuses the existing `groß` contraction `⠛⠮`.
2. `schliess` reuses the existing `schließ` contraction `⠱⠮`.
3. `DE-KURZ-ZWEI-001` is not mutated.
4. The extension is regional to Switzerland and specific to Kurzschrift.
5. Existing Kurzschrift restriction semantics remain inherited.
6. `DE-KURZ-LG-021` remains explicitly unrelated to §4.10.

No new Braille sequence is introduced.

## Rule-set integrity

The §4.10 contract contains exactly:

- `DE-CH410-001`
- `DE-CH410-002`

The second rule owns two lexical targets.

The lexical targets are not split into separate formal rules.

## Runtime boundary

Runtime translation tests executed in Phase 15.4D:

`0`

This is intentional.

Phase 15.4D validates the formal standards contract, not the future German Core implementation.

The unresolved explicit-Eszett input branch is preserved without guessing.

## Architecture boundary

Swiss remains an orthogonal regional configuration dimension.

It is not a fourth German text mode.

No public `de-CH` identifier is frozen.

No SDK/API representation is frozen.

No implementation has started.

## Metrics

- Formal rules: `2`
- Validation cases: `12`
- Pass: `12`
- Fail: `0`
- Deferred runtime boundary cases: `1`
- Runtime translation cases executed: `0`
- New Braille sequences: `0`
- Closed base artifacts modified: `0`
- Implementation changes: `0`
- Blocking formal validation issues: `0`
- Open runtime dependencies: `1`

## Closure

Phase 15.4D is closed.

Next:

**Phase 15.4E — Swiss/Regional Audit Final Closure**
