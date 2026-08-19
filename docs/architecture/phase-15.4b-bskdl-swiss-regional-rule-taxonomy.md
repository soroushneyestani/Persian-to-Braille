# Phase 15.4B — BSKDL Swiss/Regional Formal Rule Taxonomy

Status: **TAXONOMY FROZEN — FORMAL RULE PROMOTION PENDING**

## Normative source

- BSKDL
- Section: `4.10 Abweichungen in der Schweiz`
- Canonical section SHA-256: `eafea077270a7a6caec77daec20f7a366a159b68301fbf483e19c31a17057e65`

Phase 15.4A source and binding closure is the direct input to this taxonomy.

## Taxonomy result

Exactly **2 normative rule families** are required.

Exactly **2 formal rules** are planned for Phase 15.4C.

No formal rule ID is assigned during Phase 15.4B.

## Family 1 — Swiss Eszett orthographic usage

Taxonomy ID:

`DE-CH410-TAX-001`

Class:

`REGIONAL_ORTHOGRAPHIC_USAGE_CONSTRAINT`

Affected modes:

- Basisschrift
- Vollschrift
- Kurzschrift

The existing normative mapping remains:

`ß → ⠮`

Dots:

`2346`

Section 4.10 does not delete this mapping.

It also does not authorize automatic `ß → ss` input normalization.

The eventual formalization shape is:

`ONE_POLICY_RULE`

Runtime behavior for explicit `ß` input under Swiss regional configuration remains unresolved.

## Family 2 — Swiss Doppel-s contraction applicability

Taxonomy ID:

`DE-CH410-TAX-002`

Class:

`REGIONAL_KURZSCHRIFT_APPLICABILITY_EXTENSION`

Affected mode:

- Kurzschrift

Base contraction family:

`§4.4 Zweiformige Kürzungen`

Base rule:

`DE-KURZ-ZWEI-001`

Regional targets:

### gross

Base form:

`groß`

Braille:

`⠛⠮`

Dots:

`1245, 2346`

### schliess

Base form:

`schließ`

Braille:

`⠱⠮`

Dots:

`156, 2346`

No new Braille sequences are introduced.

The existing §4.4 mappings are not modified.

The formalization shape is:

`ONE_RULE_WITH_TWO_LEXICAL_TARGETS`

The two lexical targets do **not** become two independent formal rules.

## Explicit non-binding

`DE-KURZ-LG-021`

from §4.1.2.6 remains unrelated to §4.10.

Its Doppel-s semantics concern SST precedence, not Swiss spelling.

## Architecture result

Swiss behavior is not a fourth German text mode.

The text-mode axis remains:

- Basisschrift
- Vollschrift
- Kurzschrift

The regional axis is orthogonal to the text-mode axis.

The public regional/profile identifier remains unfrozen.

No `de-CH` public identifier is promoted during this phase.

No SDK/API shape is frozen.

## Validation planning

No validation cases are created during taxonomy work.

Phase 15.4D must include:

- policy and mode-applicability validation for the Eszett rule,
- positive Swiss `gross` mapping,
- positive Swiss `schliess` mapping,
- proof that the original §4.4 mappings remain unchanged,
- a non-Swiss applicability boundary.

Executable behavior for explicit Swiss-profile `ß` input remains blocked until its runtime policy is formally resolved.

## Metrics

- Taxonomy families: `2`
- Planned formal rules: `2`
- Formal rule IDs assigned: `0`
- Formal rules materialized: `0`
- Validation cases created: `0`
- Implementation changes: `0`
- Closed base artifacts modified: `0`
- Normative changes to closed base artifacts: `0`

Canonical taxonomy SHA-256:

`7cec6fca9bfd48ffd597bac190d27d0b41f48015bc3b4b5ecea6275cf04dfca5`

## Closure

Phase 15.4B is closed.

Next:

**Phase 15.4C — Formal Swiss/Regional Rule Contract**
