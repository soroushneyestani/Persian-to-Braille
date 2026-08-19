# Phase 15.2A — BSKDL Vollschrift Rule-Family Inventory

Status: **EXTRACTED, NOT PROMOTED**

## Normative source

- Chapter: `3 Die Vollschrift`
- Source SHA-256: `35f6cd3a8ef07ad33229398e6310dc778046df23fc13a61f0b7871e288c5d8ce`
- Chapter extraction SHA-256: `a852e5acdf41910feb3cb1e91dceb9a7fbb9cecbb0a6db2766eed4d4c0df9e2a`
- PDF pages: `99–103`

## Profile relationship

Vollschrift is not modeled as an independent translator.

All Basisschrift signs and rules remain active.

Vollschrift adds a contraction layer and the rules that
govern whether those contractions are allowed.

## Eight Lautgruppenkürzungen

| Print | Braille |
|---|---|
| au | ⠡ |
| eu | ⠣ |
| ei | ⠩ |
| ch | ⠹ |
| sch | ⠱ |
| st | ⠾ |
| äu | ⠌ |
| ie | ⠬ |

## Rule-family inventory

1. Basisschrift inheritance
2. Eight Lautgruppenkürzungen
3. Compound-word seam restriction
4. Derivational seam restriction
5. Spoken-syllable boundary restriction
6. Pronunciation-sensitive eligibility
7. `st` exceptional policy
8. Standalone-word eligibility

## Critical architectural result

Vollschrift cannot be implemented as simple global
substring replacement.

Eligibility depends on:

- compound boundaries,
- prefix/suffix boundaries,
- spoken syllables,
- pronunciation,
- special `st` priority rules.

The eventual German engine therefore needs lexical
analysis before contraction serialization.

## Scope status

- Rule families: `8`
- Lautgruppenkürzungen: `8`
- Source examples: `16`
- Six-dot validation: `PASS`

## Promotion

No Vollschrift behavior is executable yet.

Chapter 4 dependencies remain explicitly open.

## Next

Phase 15.2B converts these rule families into a formal
Vollschrift eligibility and contraction contract.
