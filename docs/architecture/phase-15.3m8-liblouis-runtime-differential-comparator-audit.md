# Phase 15.3M8 — Liblouis Runtime Differential Comparator Audit

**Status:** `PASS_WITH_DOCUMENTED_SOURCE_BACKED_COMPARATOR_DIVERGENCE`  
**Comparator role:** `NON_NORMATIVE_COMPARATOR`  
**Normative authority:** No  
**Normative decision:** None

## Objective

M8 executes the frozen Liblouis German Grade-2 comparator against the formal Kurzschrift audit corpus and classifies observed runtime differences.

Comparator behavior is evidence only. It does not define or modify the normative German Braille specification.

## Corpus

The formal Phase 15.3 Kurzschrift corpus contains:

```text
formal validation cases       645
runtime-executable probes      258
non-direct runtime cases       387
````

The 258 executable probes consisted of:

```text
DIRECT_PRINT_BRAILLE                 37
LEXICAL_MEANING_BRAILLE             221
```

All 221 lexical cases were mapping-backed during corpus materialization.

M8 subsequently established an important qualification: mapping-backed lexical labels are not automatically source-backed print strings suitable for semantic runtime adjudication.

## Frozen comparator execution

The frozen comparator completed the 258-case batch with exit code 0.

Raw differential:

```text
INPUT_CASES          258
OUTPUT_CASES         258
EXACT_MATCH          246
RUNTIME_DIVERGENCE    12
```

## Divergence triage

The twelve apparent runtime divergences were classified as:

```text
BRAILLE_SPACE_SERIALIZATION_DIFFERENCE       6
SOURCE_ANNOTATION_SCOPE_DIFFERENCE           2
UNRESOLVED_RUNTIME_DIVERGENCE                4
```

The six serialization differences arose from ordinary-space versus Braille-blank representation.

The two annotation-scope cases matched once source annotations that were not part of the expected translated span were removed.

## Final adjudication of the remaining four cases

### JED

`JED` had a normative lexical mapping but no independent source-backed print context in the audited artifacts.

Final classification:

```text
NON_ADJUDICABLE_LEXICAL_LABEL_PROBE
```

No normative mapping was changed.

### INTERESS

`INTERESS` likewise had a normative lexical mapping but no independent source-backed print context suitable for direct runtime adjudication.

Final classification:

```text
NON_ADJUDICABLE_LEXICAL_LABEL_PROBE
```

No normative mapping was changed.

### LÄSS

The bare lexical label was insufficient for direct semantic runtime adjudication.

A source-backed print example was available:

```text
print     = lässig
expected  = ⠐⠇⠘
actual    = ⠐⠇⠘
```

The frozen comparator matched the source-backed example exactly.

Final classification:

```text
SOURCE_BACKED_CONTEXT_MATCH
```

### Den Haag

`Den Haag` is a direct source-backed resolution example in the formal Kurzschrift restriction artifacts.

The frozen comparator produced a different result:

```text
print       = Den Haag
expected    = ⠙⠉ ⠓⠁⠁⠛
comparator  = ⠑⠀⠓⠁⠁⠛
```

Final classification:

```text
CONFIRMED_SOURCE_BACKED_COMPARATOR_DIVERGENCE
```

This is a comparator divergence only.

It does not invalidate, replace, or modify the BSKDL-backed normative artifact.

## Final accounting

```text
EXACT_MATCH                                      246
BRAILLE_SPACE_SERIALIZATION_DIFFERENCE             6
SOURCE_ANNOTATION_SCOPE_DIFFERENCE                  2
SOURCE_BACKED_CONTEXT_MATCH                         1
NON_ADJUDICABLE_LEXICAL_LABEL_PROBE                 2
CONFIRMED_SOURCE_BACKED_COMPARATOR_DIVERGENCE        1
────────────────────────────────────────────────────
TOTAL                                              258
```

## Materialization finding

M8 established the following audit invariant:

> Mapping-backed lexical evidence does not necessarily imply that the mapping label itself is a valid source-backed runtime print input.

A source-backed print context is required before an apparent lexical-label mismatch may be promoted to a confirmed semantic comparator divergence.

## Normative boundary

Liblouis remains strictly:

```text
NON_NORMATIVE_COMPARATOR
```

M8 makes **zero normative changes**.

In particular:

* comparator matches do not create normative rules;
* comparator divergences do not invalidate BSKDL rules;
* comparator output is not normative Braille;
* non-adjudicable lexical-label probes do not change mappings;
* the confirmed `Den Haag` divergence has no normative impact.

Normative authority remains with the frozen BSKDL-backed formal artifacts.

## M8 closure

```text
Formal corpus audited                         PASS
Frozen runtime execution                     PASS
258 / 258 output accounting                  PASS
Raw divergences classified                   PASS
Source-backed contextual adjudication        PASS
Confirmed comparator divergences                1
Normative changes                               0
Comparator role                 NON_NORMATIVE_COMPARATOR
```

**Phase 15.3M8 is closed.**

Next:

```text
Phase 15.3M9
Runtime Divergence / Comparator Closure
```

