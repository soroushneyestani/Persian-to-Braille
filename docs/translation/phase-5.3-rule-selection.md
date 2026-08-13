# Phase 5.3 — Rule Selection & Precedence Engine

## Status

**Phase 5.3: IMPLEMENTED**

This deliverable implements deterministic textual/context rule selection in
`@persian-braille/core`.

It does not yet implement the complete forward translation pipeline.

## Canonical source of truth

The selector consumes the Phase 3 runtime specification bundle.

It does not maintain an independent Braille mapping table.

The implementation derives:

```text
rule id
lifecycle status
rule type
input kind
priority
text
context constraints
token class
cells
Unicode Braille
structural token
```

from canonical runtime rule records.

## Scope of Phase 5.3 selection

The selector considers textual rules whose runtime inputs are:

```text
scalar
context
sequence
```

and whose rule types are:

```text
character
context
sequence
layout
```

It deliberately excludes:

```text
normalization
mode
structural input
```

Normalization remains owned by Phase 4.

Structural/mode-state execution remains a Phase 5.4 pipeline concern.

## Context classification

The current semantic context vocabulary is:

```text
digit
```

The default classifier builds the admitted digit set from canonical scalar
character rules that are Unicode decimal-number scalars.

Only characters represented by admitted canonical character rules enter that
set.

The current Phase 5 baseline requires exactly 30 such digits:

```text
10 ASCII
10 Persian
10 Arabic-Indic
```

A different canonical inventory causes construction to fail closed until the
engine contract is deliberately updated.

## Context eligibility

A context rule is considered for precedence only after all declared context
predicates are satisfied.

For current rules:

```text
before = digit
after  = digit
```

are evaluated against the immediately adjacent Unicode scalar outside the
matched rule text.

A failed context predicate excludes the rule from selection.

## Precedence

Selection uses canonical numeric priority:

```text
lower number = higher precedence
```

No filesystem ordering or rule-ID ordering is used as a tie breaker.

Current representative cases include:

```text
***  priority 100  outranks  *  priority 200

1.2  numeric "." priority 100
     outranks scalar "." priority 1000

a.b  numeric context is ineligible
     scalar "." remains eligible
```

Longer/specific precedence is therefore consumed from canonical priority
rather than re-invented as an unrelated TypeScript ranking table.

## Ambiguity behavior

After context eligibility, the selector finds the lowest numeric priority.

If exactly one candidate remains at that priority, it wins.

If multiple eligible candidates remain at the same highest precedence, the
selector returns:

```text
kind = ambiguous
candidateRuleIds
span
```

It does not silently choose one by source order.

The current Phase 2 validator is expected to prevent legal textual
same-priority overlaps. The runtime ambiguity branch is a fail-closed safety
boundary for future specification evolution.

## Sequence behavior

Sequence rules participate in the same candidate collection at the current
input position.

Because canonical priority encodes the audited specificity relationship,
representative sequences win before their scalar components are consumed:

```text
هٔ
***
...
```

Phase 5.3 does not generalize arbitrary sequences that do not exist in the
canonical rule corpus.

## ZWNJ layering

Phase 5.3 excludes the normalization rule from textual translation selection.

Therefore U+200C is not treated as an equal-priority collision between:

```text
FA-G1-LAYOUT-027
FA-G1-NORM-ZWNJ-001
```

Phase 4 preprocessing already preserves the normalization annotation.

Phase 5.3 may select the layout rule independently for later pipeline
aggregation.

## Unicode positions

Selection accepts a Unicode code-point index.

Every match records a `UnicodeSpan` containing both:

```text
codePointIndex
utf16Index
```

with an inclusive start and exclusive end.

This keeps selection traces correct after supplementary-plane characters.

## No-match behavior

The selector returns:

```text
kind = no-match
location
character
codePoint
```

It does not decide `UNKNOWN_CHARACTER` versus `UNKNOWN_SEQUENCE`.

That fallback translation failure distinction belongs to the Phase 5.4
forward pipeline.

## Explicitly outside Phase 5.3

This deliverable does not implement:

```text
Phase 4 preprocessing orchestration
full forward iteration over input
Braille-output concatenation
structural token aggregation
numeric indicator/state production
Latin span/capital state production
mode-rule execution
translation failure mapping
SDK/CLI/Web/Microsoft 365 behavior
```

## Handoff

The next deliverable is:

**Phase 5.4 — Forward Translation Pipeline**

It will orchestrate Phase 4 preprocessing, rule selection, structural/mode
state mechanics, output aggregation, trace construction, and typed
translation failures.
