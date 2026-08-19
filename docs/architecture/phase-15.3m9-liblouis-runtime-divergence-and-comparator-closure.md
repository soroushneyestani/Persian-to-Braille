# Phase 15.3M9 — Liblouis Runtime Divergence and Comparator Closure

**Status:** `PASS_WITH_DOCUMENTED_COMPARATOR_DIVERGENCE`  
**Comparator role:** `NON_NORMATIVE_COMPARATOR`  
**Normative authority:** No  
**Normative decision:** None

## Objective

M9 closes the Liblouis comparator track for German Kurzschrift.

No new runtime translation audit is performed in this phase. M9 validates and freezes the conclusions already established by M7 and M8.

## Normative baseline

The frozen Kurzschrift formal baseline remains:

```text
formal rule IDs              119
unique formal rule IDs       119
validation case IDs          645
unique validation case IDs   645
````

The normative authority remains the BSKDL-backed formal artifacts.

Liblouis has no authority to modify this baseline.

## Comparator track

The comparator track established:

```text
M7  Frozen comparator build / runtime verification
M8  Runtime differential comparator audit
M9  Comparator boundary and divergence closure
```

Frozen comparator:

```text
Liblouis version      3.38.0
translation table     de-g2.ctb
display table         unicode.dis
role                  NON_NORMATIVE_COMPARATOR
```

## Runtime audit accounting

M8 processed 258 runtime probes from the 645-case formal corpus.

Raw result:

```text
EXACT_MATCH          246
RUNTIME_DIVERGENCE    12
```

After deterministic triage and source-backed adjudication:

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

## Lexical-label finding

Three raw lexical-label mismatches required additional treatment.

### JED

Final disposition:

```text
NON_ADJUDICABLE_LEXICAL_LABEL_PROBE
```

The normative mapping remains unchanged.

### INTERESS

Final disposition:

```text
NON_ADJUDICABLE_LEXICAL_LABEL_PROBE
```

The normative mapping remains unchanged.

### LÄSS

The bare mapping label was not treated as sufficient runtime evidence.

The source-backed context:

```text
lässig
```

matched the frozen comparator exactly.

Final disposition:

```text
SOURCE_BACKED_CONTEXT_MATCH
```

## Confirmed comparator divergence

Exactly one source-backed comparator divergence remains:

```text
validation ID  DE-KURZ-REST-493-RESOLVE-001
print          Den Haag
expected       ⠙⠉ ⠓⠁⠁⠛
comparator     ⠑⠀⠓⠁⠁⠛
```

Classification:

```text
CONFIRMED_SOURCE_BACKED_COMPARATOR_DIVERGENCE
```

Disposition:

```text
DOCUMENTED_NON_NORMATIVE_DIFFERENCE
```

Normative impact:

```text
NONE
```

The comparator difference does not invalidate or modify the BSKDL-backed rule.

## Comparator boundary

The following constraints are frozen:

```text
Liblouis is normative                         NO
Liblouis may override BSKDL                  NO
Comparator match creates normative rule      NO
Comparator divergence creates normative rule NO
Comparator divergence invalidates BSKDL      NO

German Core depends on Liblouis              NO
German Core depends on Wine                  NO
German Core depends on WSL                   NO
German Core depends on Ubuntu                NO

Comparator required in production            NO
Comparator artifacts are audit evidence      YES
```

## Materialization invariant

M8/M9 freeze the following invariant:

> Mapping-backed lexical evidence does not automatically imply that the mapping label itself is a valid source-backed runtime print input.

A source-backed print context is required before a lexical-label mismatch may be classified as a confirmed semantic comparator divergence.

## Blocking status

```text
blocking normative issues       0
blocking comparator issues      0
documented comparator divergence 1
normative changes               0
```

The documented `Den Haag` difference is closed as non-normative comparator evidence and does not block Kurzschrift closure.

## M9 closure

```text
Normative baseline preserved                PASS
M7 runtime comparator verification          PASS
M8 differential audit                       PASS
Divergence adjudication                     PASS
Comparator authority boundary               PASS
Production dependency isolation             PASS

Confirmed source-backed divergences            1
Blocking comparator issues                     0
Normative changes                               0
```

**Phase 15.3M9 is closed.**

The Liblouis comparator track for German Kurzschrift is closed.

Next:

```text
Phase 15.3N
Final Kurzschrift Closure
```

