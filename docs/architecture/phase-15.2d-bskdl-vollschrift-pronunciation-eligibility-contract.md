# Phase 15.2D — BSKDL Vollschrift Pronunciation Eligibility Contract

Status: **EXTRACTED, NOT PROMOTED**

## Normative source

- Chapter: `3 Die Vollschrift`
- Source SHA-256: `35f6cd3a8ef07ad33229398e6310dc778046df23fc13a61f0b7871e288c5d8ce`
- Chapter SHA-256: `a852e5acdf41910feb3cb1e91dceb9a7fbb9cecbb0a6db2766eed4d4c0df9e2a`
- PDF pages: `99–103`

## Core pronunciation rule

Orthographic matching alone does not establish
contraction eligibility.

For the vowel groups:

`au, eu, ei, äu, ie`

the relevant letters must form one sound or diphthong.

Pronunciation may differ from ordinary German and still
permit contraction.

## Positive source examples

The source explicitly supports contraction in examples
including:

`dienen`, `Konnie`, `apple pie`, `Beige`,
`Marseille`, `Rio de Janeiro`.

## Negative source examples

The source explicitly prevents the relevant contraction
in examples including:

`Vietnam`, `Premierminister`, `Interview`, `Pierre`,
`Kapernaum`, `Museum`, `Koffein`, `Jubiläum`,
`Familie`.

## sch

`sch` is contractible only when the three letters are
pronounced as one sound.

`Scherzo` is an explicit negative example.

The source rendering of `Eschatologie` also demonstrates
that rejection of `sch` does not automatically reject
the nested `ch` candidate.

## Spoken syllable boundary

Except for `st`, Vollschrift contractions may not cross
spoken-syllable boundaries.

The dedicated `st` policy remains a separate contract.

## Unknown pronunciation

BSKDL defines pronunciation-sensitive eligibility but
does not define a software pronunciation service,
dictionary or algorithm.

Therefore the standards audit keeps three states:

- `ELIGIBLE`
- `INELIGIBLE`
- `UNRESOLVED_PRONUNCIATION`

No normative fallback is invented for an unknown
pronunciation.

## Coverage

- Formal rules: `14`
- Validation cases: `18`
- Vowel groups: `5`
- `sch` pronunciation policy: covered

## Promotion

No German runtime behavior is implemented yet.

## Next

Proceed to **Phase 15.2E — st Special Policy Contract**.
