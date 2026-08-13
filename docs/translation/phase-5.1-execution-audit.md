# Phase 5.1 — Canonical Execution Audit

## Status

**Phase 5.1: CLOSED**

This audit freezes the execution semantics that Phase 5 may rely on before
implementing the Core forward translation engine.

It distinguishes canonical Braille rule semantics from engine mechanics that
the specification does not fully define.

## Canonical execution baseline

The current runtime profile is:

```text
profile                 fa-ir-g1 0.1.0
profile status          draft
direction               forward
admitted rules          175
conformance vectors     175
```

Lifecycle distribution:

```text
normative               37
candidate               138
```

Rule-type distribution:

```text
character               132
context                   7
layout                   27
mode                      5
normalization             1
sequence                  3
```

Input-kind distribution:

```text
scalar                   160
context                    7
sequence                   3
structural                 5
```

The profile fallback policy is:

```text
unknownCharacter         error
unknownSequence          error
```

Phase 5 must fail closed rather than silently pass through unsupported text.

## Canonical precedence semantics

The Phase 2 rule schema explicitly defines rule priority as deterministic
precedence:

```text
lower numeric priority = earlier / higher precedence
```

The current priority distribution is:

```text
100                      15 rules
200                       1 rule
1000                    159 rules
```

The Phase 2 validator also enforces:

```text
semantically overlapping longer-prefix rules must have higher precedence
```

and rejects equal-priority exact match-signature collisions.

The audited asterisk pair is the canonical representative:

```text
***   priority 100
*     priority 200
```

The longer `***` sequence therefore outranks the single `*` rule.

This is not permission to invent arbitrary asterisk-run behavior beyond the
materialized rules.

## Semantic context is part of eligibility

Phase 2 closure explicitly states that pure string-prefix matching is
insufficient.

A context rule is eligible only when its declared semantic context is
satisfied.

The current context vocabulary is:

```text
before = digit
after  = digit
```

Current same-text contextual/scalar overlaps include:

```text
%   context priority 100   vs scalar priority 1000
,   context priority 100   vs scalar priority 1000
.   context priority 100   vs scalar priority 1000
```

When the context predicate is satisfied, the eligible context rule outranks
the scalar fallback by priority.

When the predicate is not satisfied, the context rule is not eligible and
cannot win merely because its numeric priority is lower.

## Sequence overlap inventory

The current corpus contains three important sequence/component overlaps:

```text
هٔ   vs ه
***  vs *
...  vs .
```

The sequence rules all have priority 100.

The component scalar/context rules have lower precedence where semantic
overlap is possible, consistent with the Phase 2 validator.

Phase 5 must evaluate longer/specific sequence candidates before consuming
their scalar components.

## ZWNJ is not a single-winner collision

U+200C has two equal-priority scalar records:

```text
FA-G1-LAYOUT-027
FA-G1-NORM-ZWNJ-001
```

Both are candidate rules at priority 1000.

Phase 4 already established that these represent separate semantic layers and
must both remain observable.

Therefore Phase 5 must not apply a universal "one textual input -> one winning
rule" algorithm across normalization/layout/translation layers.

The Phase 4 preprocessor remains the owner of normalization-format-control
annotation semantics.

## Token-class inventory

The current rule corpus uses the following token classes:

```text
latin-character-class
latin-span-begin
latin-span-end
latin-capital-indicator
numeric-indicator
numeric-begin
numeric-internal
numeric-decimal-separator
numeric-end
numeric-fraction-separator
```

Five rules consume structural token-class input directly.

The seven context rules also carry token-class metadata.

## Digit context classification

The current admitted character-rule corpus contains 30 scalar digit rules:

```text
10 ASCII digits
10 Persian digits
10 Arabic-Indic digits
```

The authoritative Phase 2 documents require the numeric context class
`digit`, but they do not fully specify a general-purpose runtime classifier
algorithm.

Phase 5 may define deterministic engine mechanics for recognizing the
currently admitted digit context, but that implementation must be traceable to
the canonical rule corpus and must not invent additional digit families as
Braille rules.

This is an engine contract decision, not a normative Braille promotion.

## Structural token production remains an engine-contract concern

The canonical corpus defines structural input token classes and their outputs,
but the audited Phase 2 execution documents do not fully define a complete
runtime producer/state-machine algorithm for every structural token class.

In particular, numeric and Latin span/capitalization production mechanics
must be defined explicitly by the Phase 5 engine contract before execution.

Phase 5 must not infer undocumented policy from external implementations.

## Candidate rules remain executable profile content, not normative rules

The Phase 3 runtime bundle contains all profile-admitted rules, including
candidate rules.

Phase 5 may execute the draft `fa-ir-g1` profile as materialized, while
preserving lifecycle status in traces/results.

Execution therefore does not imply:

```text
candidate -> normative
draft vector -> active vector
CI PASS -> normative promotion
```

Governance remains owned by the specification layer.

## Conformance coverage

Every admitted rule has exactly one reciprocal conformance vector.

Current vector lifecycle distribution:

```text
active                  37
draft                  138
```

Phase 5 implementation testing must preserve this lifecycle distinction while
using the vectors as executable expectations for the draft profile.

## Frozen Phase 5.1 execution principles

Phase 5 implementation must follow these principles:

```text
1. Phase 4 preprocessing runs before translation matching.

2. Only profile-admitted forward rules are eligible.

3. Semantic context is evaluated before a context rule becomes eligible.

4. Lower numeric priority means higher precedence.

5. Semantically overlapping longer/specific textual rules must outrank their
   shorter components, as encoded by canonical priority.

6. A rule that fails its context predicate is excluded before precedence
   comparison.

7. Scalar character rules act as textual fallback where a more-specific
   eligible context/sequence rule exists.

8. Normalization/layout annotations are not collapsed into a universal
   single-winner translation match.

9. Unknown character and unknown sequence behavior is fail-closed (`error`).

10. Rule lifecycle status is preserved; execution never promotes candidates.

11. Token-class production/state mechanics not fully specified by Phase 2
    must be defined as explicit Phase 5 engine-contract behavior before use.

12. Braille mappings, cells, structural tokens, and rule content remain owned
    by the canonical specification; TypeScript must not duplicate them as an
    independent source of truth.
```

## Explicitly unresolved by the audit

The audit deliberately does not pretend that the specification already
defines every engine detail.

The following belong to Phase 5.2/5.3 design:

```text
translation result/trace data model
token/context classifier API
numeric structural-state production
Latin span/capital structural-state production
tie handling for future legal multi-layer matches
error result model
match trace/provenance representation
```

These are engine mechanics, not new Braille rules.

## Reproducibility

The repository contains the read-only audit tool:

```text
tools/translation/audit-phase5-execution.py
```

It derives the current execution inventory from the canonical specification
and writes no repository files.

## Handoff

The next deliverable is:

**Phase 5.2 — Translation Domain Contract**

That deliverable defines the Core execution types, classifier boundary,
translation result/failure model, rule-match trace, and lifecycle provenance
without yet implementing the rule-selection engine.
