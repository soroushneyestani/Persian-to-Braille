# Phase 15.4C — BSKDL Swiss/Regional Formal Rule Contract

Status: **FORMAL RULE CONTRACT COMPLETE — ONE RUNTIME POLICY DEFERRED**

## Normative source

- Authority: BSKDL
- Section: `4.10 Abweichungen in der Schweiz`
- Canonical section SHA-256: `eafea077270a7a6caec77daec20f7a366a159b68301fbf483e19c31a17057e65`

## Formal rule set

Exactly two formal rules are materialized.

Canonical formal-rule SHA-256:

`652d3bc8d491568f0b07e22f9271b9aac528b715bd2d24f10adf7d21f6fd9bc7`

The `DE-CH410` namespace is an internal normative-rule namespace.

It does **not** freeze a public `de-CH` profile identifier.

## DE-CH410-001

Kind:

`SWISS_ESZETT_ORTHOGRAPHIC_USAGE_CONSTRAINT`

Source:

`Das Eszett (ß) wird in der Schweiz nicht verwendet.`

Affected text modes:

- Basisschrift
- Vollschrift
- Kurzschrift

Existing normative mapping:

`ß → ⠮`

Dots:

`2346`

The existing mapping is preserved.

The rule does not authorize automatic `ß → ss` normalization.

The normative policy is formally represented, but executable handling of explicit `ß` input under Swiss regional configuration remains unresolved.

Open runtime dependency:

`SWISS_EXPLICIT_ESZETT_INPUT_POLICY`

This does not block formal-rule closure.

It does block executable implementation of that specific input-policy branch until resolved.

## DE-CH410-002

Kind:

`SWISS_DOUBLE_S_KURZSCHRIFT_APPLICABILITY_EXTENSION`

Affected mode:

- Kurzschrift

Base rule:

`DE-KURZ-ZWEI-001`

### gross

Base form:

`groß`

Existing Braille:

`⠛⠮`

Dots:

`1245, 2346`

### schliess

Base form:

`schließ`

Existing Braille:

`⠱⠮`

Dots:

`156, 2346`

The rule introduces:

- no new Braille sequence,
- no mutation of §4.4 mappings,
- no replacement of the base rule.

It extends regional applicability to Swiss Doppel-s spelling.

Both lexical targets belong to the **same formal rule**.

## Existing Kurzschrift restrictions

The Swiss regional extension does not create an unrestricted shortcut.

The underlying contractions continue to be governed by the existing Kurzschrift application system, including applicable:

- boundary rules,
- morphological restrictions,
- proper-name restrictions,
- precedence rules,
- cancellation behavior,
- German case rules.

## Explicit non-binding

`DE-KURZ-LG-021`

remains unrelated to §4.10.

Its Doppel-s semantics concern `sst` precedence from §4.1.2.6.

## Validation boundary

No validation cases are created in Phase 15.4C.

Phase 15.4D must validate:

1. Rule 001 policy structure.
2. Rule 001 applicability to all three German text modes.
3. Absence of an invented automatic `ß → ss` normalization rule.
4. Positive Swiss `gross`.
5. Positive Swiss `schliess`.
6. Preservation of the original §4.4 mappings.
7. Non-Swiss applicability boundary.
8. Inheritance of existing Kurzschrift restrictions.
9. Explicit non-binding of `DE-KURZ-LG-021`.

## Architecture boundary

Swiss remains an orthogonal regional configuration dimension.

It is not a fourth German text mode.

The public profile identifier is still not frozen.

The SDK/API representation is still not frozen.

Implementation has not started.

## Metrics

- Formal rule IDs assigned: `2`
- Formal rules materialized: `2`
- Normative formal rules: `2`
- Fully executable semantic contracts: `1`
- Formal normative policies with deferred runtime execution: `1`
- Lexical regional targets: `2`
- New Braille sequences: `0`
- Base mappings mutated: `0`
- Closed base artifacts modified: `0`
- Validation cases created: `0`
- Implementation changes: `0`
- Blocking formal issues: `0`
- Open runtime dependencies: `1`

## Closure

Phase 15.4C is closed.

Next:

**Phase 15.4D — Swiss/Regional Formal Validation Suite**
