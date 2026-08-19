# Phase 15.4E — BSKDL Swiss/Regional Audit Final Closure

Status: **PASS WITH ONE DOCUMENTED DEFERRED RUNTIME POLICY**

## Scope

Phase 15.4 audits BSKDL §4.10:

`Abweichungen in der Schweiz`

Normative source:

- Authority: BSKDL
- PDF SHA-256: `35f6cd3a8ef07ad33229398e6310dc778046df23fc13a61f0b7871e288c5d8ce`
- Canonical §4.10 SHA-256: `eafea077270a7a6caec77daec20f7a366a159b68301fbf483e19c31a17057e65`

## Completed audit chain

- Phase 15.4A — Source and binding audit: `CLOSED`
- Phase 15.4B — Formal rule taxonomy: `CLOSED`
- Phase 15.4C — Formal rule contract: `CLOSED`
- Phase 15.4D — Formal validation suite: `CLOSED`

## Final normative model

Two source statements produce two formal rules.

### DE-CH410-001

`SWISS_ESZETT_ORTHOGRAPHIC_USAGE_CONSTRAINT`

The standard states that Eszett is not used in Switzerland.

The existing German Braille mapping remains:

`ß → ⠮`

dots:

`2346`

That base mapping is not deleted or mutated.

No automatic `ß → ss` input normalization has been invented.

### DE-CH410-002

`SWISS_DOUBLE_S_KURZSCHRIFT_APPLICABILITY_EXTENSION`

The existing §4.4 contractions are extended to Swiss Doppel-s spellings:

- `gross` reuses the `groß` contraction `⠛⠮`
- `schliess` reuses the `schließ` contraction `⠱⠮`

No new Braille sequence is introduced.

No §4.4 base mapping is mutated.

Existing Kurzschrift restrictions remain inherited.

## Explicit non-binding

`DE-KURZ-LG-021`

remains independent.

Its §4.1.2.6 Doppel-s semantics concern SST precedence and are not the Swiss §4.10 regional rule.

## Validation

Formal validation cases:

`12`

Passed:

`12`

Failed:

`0`

Runtime translation cases executed:

`0`

This is intentional because Phase 15.4 is a normative audit, not German Core implementation.

Canonical validation-suite SHA-256:

`af529d6f13e1b8dffb0e1ba26b683662801af79465a6fbcabdc21268dda20e7e`

## Deferred runtime policy

One dependency remains open:

`SWISS_EXPLICIT_ESZETT_INPUT_POLICY`

Question:

How should runtime handle explicitly supplied `ß` while Swiss regional configuration is active?

The normative source does not prescribe automatic normalization or error handling.

Therefore this behavior is not invented during the standards audit.

The dependency:

- does not block Phase 15.4 closure,
- does block executable implementation of that specific Rule 001 branch,
- is handed forward to Phase 15.5 German Core.

## Architecture conclusion

Swiss is not a fourth German text mode.

The German text modes remain:

- Basisschrift
- Vollschrift
- Kurzschrift

Regional configuration is orthogonal to text mode.

The public profile identifier remains unfrozen.

`de-CH` is not frozen as a public API/profile identifier in Phase 15.4.

SDK/API shape also remains unfrozen.

## Final metrics

- Source statements: `2`
- Source statements bound: `2`
- Binding decisions: `2`
- Taxonomy families: `2`
- Formal rules: `2`
- Formal rule IDs: `2`
- Validation cases: `12`
- Passed: `12`
- Failed: `0`
- Runtime translation cases executed: `0`
- New Braille sequences: `0`
- Closed base artifacts modified: `0`
- Implementation changes: `0`
- Open runtime dependencies: `1`
- Blocking Phase 15.4 issues: `0`

## Canonical hashes

Source span:

`eafea077270a7a6caec77daec20f7a366a159b68301fbf483e19c31a17057e65`

Taxonomy:

`7cec6fca9bfd48ffd597bac190d27d0b41f48015bc3b4b5ecea6275cf04dfca5`

Formal rules:

`652d3bc8d491568f0b07e22f9271b9aac528b715bd2d24f10adf7d21f6fd9bc7`

Validation suite:

`af529d6f13e1b8dffb0e1ba26b683662801af79465a6fbcabdc21268dda20e7e`

Pre-closure artifact manifest:

`53884949414fbd68d8dced4bd03fff1e6503eefaf746cfb9d3ae216cc0d8daf9`

## Closure

**Phase 15.4 — Swiss / Regional Audit is CLOSED.**

No German Core implementation has started during this audit.

Next:

**Phase 15.5 — German Core**
