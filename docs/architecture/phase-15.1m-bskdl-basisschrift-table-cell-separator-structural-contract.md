# Phase 15.1M — BSKDL Basisschrift Table-Cell Separator & Structural Table Contract

Status: **EXTRACTED, NOT PROMOTED**

## Normative source

- Authority: `Brailleschriftkomitee der deutschsprachigen Länder`
- Edition: `2., korrigierte Auflage 2021`
- Source SHA-256: `35f6cd3a8ef07ad33229398e6310dc778046df23fc13a61f0b7871e288c5d8ce`
- Section: `2.12 Trennzeichen für Tabellenzellen`
- Section extraction SHA-256: `485087e9e8e2d7a953eec343eb5d481498fb6a680b9553b3f0ca1764ea4464de`
- PDF pages: `94–95`

## Structural table serialization

When table columns cannot be reproduced side by side,
cells of one row may be serialized sequentially.

The table-cell separator is:

`⠒⠒`

It normally stands between Braille blanks.

## Optional target-column number

The number of the following column may be written
immediately after the separator.

Normative example for column 7:

`⠒⠒⠼⠛`

There is no Braille blank between the separator and the
number indicator.

## Empty cells

When the target-column-number technique is used, empty
cells do not have to be represented by repeated
table-cell separators.

Section `2.12` does **not** establish a complete general
empty-cell serialization rule for the unnumbered form.

That behavior is therefore deliberately left unresolved
rather than inferred.

## Architectural conclusion

The table-cell separator is structural serialization,
not ordinary punctuation.

Its interpretation depends on:

- table structure,
- row linearization,
- optional column identity,
- numeric notation,
- layout policy.

This belongs to a future document-structure/layout layer,
not to a context-free German character map.

## Extracted contract

- Rules: `8`
- Validation cases: `5`

## Promotion policy

No structural table serialization behavior is executable
in Braille Hub Core yet.

The unresolved unnumbered-empty-cell case remains
explicitly open.

## Next

Phase 15.1N audits punctuation occurring inside words
from BSKDL section `2.13`.
