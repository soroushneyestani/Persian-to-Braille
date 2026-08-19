# Phase 15.2G — Liblouis Vollschrift Static Differential Audit

Status: **STATIC DIFFERENTIAL COMPLETE — RUNTIME NOT EXECUTED**

## Role

Liblouis is a **non-normative comparator**.

BSKDL remains the normative authority.

## Frozen comparator

- Commit: `fefb3a218cead90cf5e6df6a5fc8d6a69f4dbf2e`
- Table: `de-g1.ctb`
- Comparison mode: `STATIC_TABLE_DIFFERENTIAL_ONLY`

No `lou_translate` executable or importable Python
`louis` binding was available in the audit environment.

## Static topology

`de-g1.ctb` includes:

- `de-g0.utb`
- `de-g1-core.cti`

`de-g1-core.cti` includes:

- `de-g1-core-patterns.dic`

Observed active source surface:

- `de-g1.ctb`: 2 active lines
- `de-g1-core.cti`: 34 active lines
- pattern dictionary: 4863 active lines

## Eight contraction mappings

All eight Chapter 3 contraction cells have an explicit
static match in the frozen Liblouis core source:

| Print | BSKDL dots | Static result |
|---|---:|---|
| au | 16 | STATIC_EXPLICIT_MATCH |
| eu | 126 | STATIC_EXPLICIT_MATCH |
| ei | 146 | STATIC_EXPLICIT_MATCH |
| ch | 1456 | STATIC_EXPLICIT_MATCH |
| sch | 156 | STATIC_EXPLICIT_MATCH |
| st | 23456 | STATIC_EXPLICIT_MATCH |
| äu | 34 | STATIC_EXPLICIT_MATCH |
| ie | 346 | STATIC_EXPLICIT_MATCH |

This is source-level correspondence only.

It is not a claim that the Liblouis runtime produced
the same output for every Chapter 3 context.

## Structural findings

Basisschrift inheritance has a static structural
correspondence because `de-g1.ctb` directly includes
`de-g0.utb`.

A dedicated Vollschrift pattern dictionary is also
present.

The eight contraction rules contain `nocross` in the
observed source.

These observations provide structural evidence but do
not prove that all BSKDL compound, derivational and
spoken-syllable restrictions are behaviorally equivalent.

## Runtime-undetermined areas

Static inspection alone does not establish behavioral
equivalence for:

- vowel pronunciation eligibility,
- the `sch` single-sound restriction,
- the special `st` exclusions,
- standalone-word examples.

These remain explicitly
`NOT_DETERMINABLE_WITHOUT_RUNTIME`.

## Pattern dictionary observation

The frozen pattern dictionary contains
`4863` active pattern lines.

A literal search for the selected Chapter 3 example
words found only `Pierre`.

This must not be interpreted as absence of support for
the other examples: the dictionary is a pattern source,
not an inventory of normative example words.

## Normative fixture matrix

Phase 15.2F contains 48 normative fixtures.

Runtime execution in this audit:

- executed: `0`
- not executed: `48`

Every fixture therefore remains:

`NOT_EXECUTED_RUNTIME_UNAVAILABLE`

for the Liblouis behavioral comparator.

## Static classification

- `STATIC_EXPLICIT_MATCH`: 8
- `STATIC_STRUCTURAL_MATCH`: 2
- `STATIC_PARTIAL_MATCH`: 1
- `NOT_DETERMINABLE_WITHOUT_RUNTIME`: 4
- established static divergence: 0

Zero established static divergence does **not** mean
behavioral parity has been proven.

## Closure policy

Runtime Liblouis comparison is not a blocker for
Phase 15.2 closure because Liblouis is not normative.

No rule is promoted into Braille Hub from Liblouis.

## Next

Proceed to **Phase 15.2H — Vollschrift Closure Audit**.
