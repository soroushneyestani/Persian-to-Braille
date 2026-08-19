# Phase 15.3N — German Kurzschrift Final Closure

**Status:** `PASS_WITH_DOCUMENTED_NON_NORMATIVE_COMPARATOR_DIVERGENCE`  
**Language:** German  
**Mode:** Kurzschrift  
**Normative authority:** BSKDL-backed formal artifacts  
**Comparator:** Liblouis — `NON_NORMATIVE_COMPARATOR`

## Closure scope

Phase 15.3 is the formal German Kurzschrift specification audit.

This closure does **not** claim that the production German Core runtime has already been implemented.

It closes the normative/source audit required before later German Core implementation work.

## Formal baseline

```text
formal rule IDs               119
unique formal rule IDs        119

validation case IDs           645
unique validation case IDs    645

duplicate formal rule IDs       0
duplicate validation IDs        0

formal source blockers           0
````

The BSKDL-backed Kurzschrift formal baseline is internally consistent and closed.

## Audit progression

The Phase 15.3 chain is complete:

```text
15.3A   Rule-family inventory
15.3B   Lautgruppenkürzungen inventory
15.3C   Lautgruppen application rules
15.3D   Prefix/suffix contractions
15.3E   Einformige word/stem contractions
15.3F   Zweiformige Kürzungen
15.3G   Komma-Kürzungen
15.3H   Umlautungspunkt
15.3I   Aufhebungspunkt
15.3J   Basis/Vollschrift inserts

15.3K1  Vollschrift inheritance
15.3K2  Wortfugen restriction
15.3K3  Eigennamen restriction
15.3K4  Wortstamm restriction
15.3K5  Prefix/suffix boundary restriction
15.3K6  §4.9 application-restriction closure

15.3L1  Taxonomy precision patch
15.3L2  Cross-artifact consistency closure

15.3M1–M6   Static comparator / environment preparation
15.3M7      Frozen Liblouis runtime verification
15.3M8      Runtime differential audit
15.3M9      Comparator divergence / boundary closure

15.3N       Final Kurzschrift closure
```

## Comparator result

The frozen Liblouis comparator processed 258 runtime probes.

```text
raw exact matches       246
raw divergences          12
```

After triage and source-backed adjudication:

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

## Documented comparator divergence

Exactly one source-backed comparator divergence remains:

```text
validation ID  DE-KURZ-REST-493-RESOLVE-001
print          Den Haag
expected       ⠙⠉ ⠓⠁⠁⠛
comparator     ⠑⠀⠓⠁⠁⠛
```

Disposition:

```text
DOCUMENTED_NON_NORMATIVE_DIFFERENCE
```

Normative impact:

```text
NONE
```

This comparator difference does not modify, invalidate, or supersede the BSKDL-backed specification.

## Lexical-label audit invariant

Phase 15.3 establishes the following invariant:

> Mapping-backed lexical evidence does not automatically imply that the lexical mapping label itself is a valid source-backed runtime print input.

A source-backed print context is required before an apparent lexical-label mismatch can be treated as a confirmed semantic comparator divergence.

This distinction resolved the `JED`, `INTERESS`, and `LÄSS` runtime observations without changing their normative mappings.

## Runtime/generalization boundary

Some dependencies may remain relevant to later executable runtime/generalization work.

They do not block this formal specification closure.

```text
open dependencies                          4
formal-source blockers                     0
runtime-generalization dependencies        2
```

No total runtime precedence rule has been invented from comparator behavior.

## Production isolation

The following constraints remain frozen:

```text
German Core depends on Liblouis     NO
German Core depends on Wine         NO
German Core depends on WSL          NO
German Core depends on Ubuntu       NO

Liblouis is normative               NO
Comparator output is normative      NO
Comparator required in production   NO
```

Liblouis remains audit evidence only.

## Artifact manifest

Pre-N Phase 15.3 artifacts:

```text
artifact pairs    29
files             58
manifest SHA256   777c474b5368872171b7f18fa9d188b05b1b3090839f396c0b18f3892956b992
```

The N closure pair is added after that frozen pre-closure manifest.

Repository state recorded by the closure:

```text
branch  phase15-german-braille
HEAD    5830e59c9bc3b8fcbc69f3efd1cb89666c30ccf7
```

## Final decision

```text
Formal Kurzschrift specification      CLOSED
Cross-artifact consistency            PASS
Comparator track                      CLOSED
Blocking formal issues                0
Blocking comparator issues            0
Normative changes from comparator     0
Documented comparator divergences     1
```

**Phase 15.3 — German Kurzschrift is formally closed.**

Next:

```text
Phase 15.4
Swiss / regional German Braille audit
```

