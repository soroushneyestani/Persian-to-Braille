# Phase 15.2F — BSKDL Vollschrift Positive / Negative Normative Suite

Status: **EXTRACTED, NOT PROMOTED**

## Normative source

- Chapter: `3 Die Vollschrift`
- Source SHA-256: `35f6cd3a8ef07ad33229398e6310dc778046df23fc13a61f0b7871e288c5d8ce`
- Chapter SHA-256: `a852e5acdf41910feb3cb1e91dceb9a7fbb9cecbb0a6db2766eed4d4c0df9e2a`
- PDF pages: `99–103`

## Purpose

This artifact consolidates direct Chapter 3 examples into
a conformance-ready normative fixture dataset.

It does not implement a translator.

## Fixture classes

| Class | Count |
|---|---:|
| MUST_CONTRACT | 16 |
| MUST_NOT_CONTRACT | 26 |
| PARTIAL_CANDIDATE_FALLBACK | 5 |
| DEFERRED_DEPENDENCY | 1 |
| **Total** | **48** |

## Direct source renderings

`24` fixtures contain exact Braille
renderings captured directly from Chapter 3.

Full Braille output is not invented for prose-only source
examples.

Those cases instead assert the candidate-level behavior
that the normative prose explicitly establishes.

## Positive coverage

The suite contains the eight introductory
Lautgruppenkürzung examples, pronunciation-positive
examples, and standalone-word examples.

## Negative coverage

The suite includes:

- compound-word seams,
- derivational seams,
- pronunciation exclusions,
- `sch` exclusions,
- `sth` exclusions,
- `St. = Sankt` exclusions.

## Partial fallback coverage

The suite preserves source cases where rejection of a
larger candidate must not suppress a smaller candidate.

This includes:

`Gässchen`, `Häschen`, `Häuschen`, `Bruschetta`,
`Eschatologie`.

## Deferred dependency

`bewusst` retains its Chapter 3 normative output and
non-`st` behavior, while the independent audit of the
Kurzschrift double-s priority is deferred to Chapter 4.

## Bordeaux

`Bordeaux` is retained as direct rule evidence for the
multi-vowel pronunciation statement.

It is deliberately not converted into a more specific
candidate/output fixture without additional normative
support.

## Coverage

- Normative fixtures: `48`
- Direct source renderings: `24`
- Rule references: `PASS`
- Six-dot validation: `PASS`

## Promotion

No fixture is executable translation logic.

No German Core, SDK or Office implementation has started.

## Next

Proceed to **Phase 15.2G — Liblouis Vollschrift Differential Audit**.
