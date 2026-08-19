# Phase 15.1G — BSKDL Basisschrift Capitalization & Case-State Contract

Status: **EXTRACTED, NOT PROMOTED**

## Normative source

- Authority: `Brailleschriftkomitee der deutschsprachigen Länder`
- Edition: `2., korrigierte Auflage 2021`
- SHA-256: `35f6cd3a8ef07ad33229398e6310dc778046df23fc13a61f0b7871e288c5d8ce`

## Covered sections

`2.6` through `2.6.8`

## Case markers

- Initial capital followed by lowercase: `⠨`
- Single/sequence uppercase: `⠘`
- Explicit lowercase: `⠠`
- Internal capital in Voll-/Kurzschrift: `⠐⠨`
- Greek letter announcement: `⠰`

## Architectural conclusion

German capitalization is not a direct transformation of
Unicode uppercase/lowercase state.

Ordinary running text normally leaves case implicit.

Mandatory case contexts, systematic-capital mode,
Roman numerals, units, abbreviations, mixed-case sequences,
Greek letters, nonstandard lowercase spelling and internal
capitalization introduce explicit state transitions.

Some case forms force Basisschrift and suppress contractions.

Mixed-case segmentation is semantic: meaningful groups are
preferred before minimizing the number of announcement signs.

Binnengroßschreibung has both a general Basisschrift strategy
and a compact Voll-/Kurzschrift strategy.

Abbreviations with an abbreviation point follow a separate
case policy and normally do not preserve printed case.

## Extracted contract

- Rule records: `21`
- Validation cases: `12`
- Case modes: `2`

## Promotion policy

No capitalization rule is executable in Braille Hub Core yet.

## Next

Phase 15.1H extracts emphasis behavior from section `2.7`,
including first and second emphasis systems and Versalien.

## Pre-closure precision consolidation

The case-state contract now records 21 rules and 12
validation cases.

Additional precision covers:

- contraction suppression without falsely requiring a
  literal Basisschrift sequence,
- Kurzschrift initial uppercase C/Q/X/Y ordering,
- Kurzschrift lowercase c/q/x/y/sharp-s disambiguation,
- optional customary capitalization of polite forms,
- the specific pure-Basisschrift-passage omission policy
  of section 2.6.7.
