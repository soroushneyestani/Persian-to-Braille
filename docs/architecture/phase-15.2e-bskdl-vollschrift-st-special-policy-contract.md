# Phase 15.2E — BSKDL Vollschrift st Special Policy Contract

Status: **EXTRACTED, NOT PROMOTED**

## Normative source

- Chapter: `3 Die Vollschrift`
- Source SHA-256: `35f6cd3a8ef07ad33229398e6310dc778046df23fc13a61f0b7871e288c5d8ce`
- Chapter SHA-256: `a852e5acdf41910feb3cb1e91dceb9a7fbb9cecbb0a6db2766eed4d4c0df9e2a`
- PDF pages: `99–103`

## st contraction

`st` is represented by:

`⠾`

## Spoken-syllable exception

The general Vollschrift rule that prohibits contraction
across spoken-syllable boundaries explicitly excludes
the `st` contraction.

This exception is not an unconditional permission.

Independent compound and derivational boundary rules
remain relevant.

## Explicit exclusions

### sth

`st` is not contracted in `sth` when `th` is pronounced
as one sound.

Source examples:

- `Ästhet`
- `Asthma`
- `Esther`

### sst

`st` is not contracted in `sst`.

The source explains this through priority of the
Kurzschrift double-s contraction.

Source example:

- `bewusst`

That Chapter 4 priority rule remains an explicit open
dependency until Kurzschrift is independently audited.

### St. = Sankt

`st` is not contracted in the abbreviation `St.` when
the abbreviation means `Sankt`.

Source examples:

- `St. Gallen`
- `St. Pölten`
- `St. Pauli`

The semantic condition matters. The source does not
establish a blanket prohibition for every possible
character sequence `St.` independent of meaning.

## Architectural result

A future `st` resolver must combine:

- ordinary candidate detection,
- compound/derivational boundaries,
- spoken-syllable exception handling,
- `sth` pronunciation,
- `sst` priority,
- abbreviation semantics.

## Coverage

- Formal rules: `12`
- Validation cases: `10`
- `sth` source examples: `3`
- `sst` source examples: `1`
- `St. = Sankt` source examples: `3`

## Promotion

No executable German runtime behavior exists yet.

## Next

Proceed to **Phase 15.2F — Vollschrift Positive / Negative Normative Suite**.
