# Phase 13.5c-3a — Language-Mode Collision Resolution

## Status

**MATERIALIZED / VALIDATION REQUIRED**

This subphase is grounded in three read-only audits:

```text
phase-13.5c3-remaining-collision-coverage-audit
phase-13.5c3a-latin-persian-cross-mode-behavior-audit
phase-13.5c3a2-language-mode-percent-overlap-design-audit
```

The Phase 13.5c-3 baseline contained 17 remaining collision signatures:

```text
12 cross-mode Persian / Latin
 4 Latin-only upper / lower
 1 punctuation print variant
```

The punctuation signature is intentionally deferred to Phase 13.5c-3b.

## Frozen decisions

### Base Persian state

When a collision contains exactly one canonical Persian letter plus Latin
lowercase/uppercase candidates, base Persian state selects the Persian letter
before generic ambiguity handling.

This broadens the Phase 13.5c-2 base-Persian rule while preserving existing
digit-collision behavior.

### Latin-only outside a Latin span

A cell with only Latin lowercase/uppercase candidates remains ambiguous when no
Latin span is active.

### Active Latin span

Within an explicit Latin span, lowercase state selects the Latin lowercase
candidate and pending-capital state selects the uppercase candidate. Parser
state resolves before strict ambiguity policy.

## Percent / lowercase-p overlap

`25 1234` is both standalone percent punctuation and the prefix of a Latin span
containing lowercase `p`.

A conservative closable-Latin-span lookahead now applies:

```text
25 1234          -> ٪   default punctuation policy
25 1234          -> %   ASCII punctuation policy
25 1234 25       -> p
25 1234 123 25   -> pl
25 6 1234 25     -> P
```

If the opening dot-25 can be parsed through valid Latin content to a matching
Latin end, Latin mode wins. Otherwise standalone percent precedence is
preserved.

## Conformance expansion

```text
48  12 cross-mode signatures × 4 states
16   4 Latin-only signatures × 4 states
 4  percent / Latin-p overlap regressions
---
68
```

Expected manifest:

```text
reverse vectors       139
translation vectors   137
capability vectors      2
```

After this subphase, canonical collision coverage is 33/34. The only remaining
collision is signature `23` (`;` versus `؛`).

Core root reverse export and the SDK reverse runtime remain deferred.

## Next

```text
Phase 13.5c-3b — Remaining Punctuation Collision
```
