# Phase 13.5c-2 — Numeric Collision Resolution

## Status

**MATERIALIZED / VALIDATION REQUIRED**

This subphase is grounded in the two read-only audits:

```text
phase-13.5c2-numeric-collision-behavior-audit
phase-13.5c2a-numeric-collision-resolution-design-audit
```

They identified ten remaining collision signatures whose resolution depends on
numeric state:

```text
8 digit / text / Latin cross-mode signatures
1 numeric-internal separator signature
1 numeric-end / percent signature
```

## Frozen decisions

### Base Persian preference

When a digit/text collision contains exactly one canonical
`FA-G1-LETTER-*` candidate, base Persian state selects that candidate before
generic ambiguity handling. The rule is deliberately narrow and only applies
when the same candidate set also contains a digit-family rule.

Signature `15` remains ambiguous in base mode because it has digit and Latin
candidates but no Persian-letter candidate.

### Numeric internal separator

`FA-G1-NUMRULE-003` and `FA-G1-NUMRULE-004` share cell `3`.

Inside an active numeric run, after a digit and before another admitted digit:

```text
punctuationStyle=persian -> ٬
punctuationStyle=ascii   -> ,
ambiguityPolicy=error    -> AMBIGUOUS_REVERSE_MATCH
```

Numeric mode remains active.

### Numeric end / percent

Braille sequence `25 1234` is shared by:

```text
FA-G1-NUMRULE-007       %
FA-G1-PUNC-SCALAR-016   %
FA-G1-PUNC-SCALAR-017   ٪
```

Inside numeric mode it is recognized as numeric-end, canonicalized through the
punctuation policy, consumed as one two-cell sequence, and numeric mode
terminates.

Outside numeric mode the scalar percent candidates receive multi-cell
precedence before dot-25 can open a Latin span.

```text
punctuationStyle=persian -> ٪
punctuationStyle=ascii   -> %
ambiguityPolicy=error    -> AMBIGUOUS_REVERSE_MATCH
```

## Conformance expansion

This subphase adds 34 reverse collision vectors:

```text
24  per-signature numeric/base/Latin-lower cases
 2  representative Latin-upper / ASCII-digit policy cases
 3  numeric-internal cases
 5  numeric-end / percent cases
---
34
```

Expected manifest:

```text
reverse vectors      71
translation vectors  69
capability vectors    2
```

The ten numeric-related collision signatures become covered. Seventeen
non-numeric collision signatures remain.

## Boundary

Core root reverse export and the public SDK reverse API remain deferred.

## Next

```text
Phase 13.5c-3 — Remaining Cross-Mode Collision Coverage
```
