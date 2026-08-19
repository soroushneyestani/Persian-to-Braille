# Phase 15.1I — BSKDL Basisschrift Accent & Special-Form Letter Contract

Status: **EXTRACTED, NOT PROMOTED**

## Normative source

- Authority: `Brailleschriftkomitee der deutschsprachigen Länder`
- Edition: `2., korrigierte Auflage 2021`
- SHA-256: `35f6cd3a8ef07ad33229398e6310dc778046df23fc13a61f0b7871e288c5d8ce`

## Covered sections

- `2.8` Akzentbuchstaben und Buchstaben in besonderer Form
- `2.8.1` Akzentbuchstaben
- `2.8.2` Buchstaben in besonderer Form

## Accent strategies

German text provides two representations for foreign
accented letters.

### Generic method

Point 4 precedes the German Braille cell of the base letter.

This preserves the fact that a diacritic exists without
identifying its exact foreign-language Braille value.

### Exact method

Point 4 precedes the language-specific Braille cell.

This requires language context because the same printed
accented letter may have different Braille values in
different Braille systems.

Point 4 remains required in German Basis-, Voll- and
Kurzschrift for both strategies.

## Normative exact tables

- French records: `14`
- Italian records: `6`

The French table also includes the `oe` ligature, which
is retained separately from generic diacritic handling.

## Span boundary

This mechanism is intended for individual foreign words
and short passages embedded in German text.

Longer foreign-language Braille spans belong to the
separate section `2.9` contract.

## Special-form letters

Euro, pound/lira, dollar and cent signs use the same
point-4 special-form mechanism.

They may occur before a number or after it.

When they follow the number, spacing may be preserved
with or without a blank according to the source.

## Architectural conclusion

Accent handling cannot be reduced to Unicode
normalization or diacritic stripping.

The German profile must know whether the caller wants:

- generic diacritic preservation,
- exact language-specific Braille,
- or a full foreign-language Braille span.

These are distinct translation policies.

## Extracted contract

- Rules: `12`
- Validation cases: `10`
- French exact mappings: `14`
- Italian exact mappings: `6`

## Promotion policy

No accent or special-form-letter behavior is executable
in Braille Hub Core yet.

## Next

Phase 15.1J specifies foreign-language span behavior
from BSKDL section `2.9`.

## Pre-closure precision consolidation

`DE-ACCENT-008` is explicitly classified as an inference
from the structure of the normative language-specific
table, not as independently stated normative prose.
