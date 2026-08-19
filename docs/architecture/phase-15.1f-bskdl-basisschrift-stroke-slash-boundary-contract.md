# Phase 15.1F — BSKDL Basisschrift Stroke / Slash / Boundary Contract

Status: **EXTRACTED, NOT PROMOTED**

## Normative source

- Authority: `Brailleschriftkomitee der deutschsprachigen Länder`
- Edition: `2., korrigierte Auflage 2021`
- SHA-256: `35f6cd3a8ef07ad33229398e6310dc778046df23fc13a61f0b7871e288c5d8ce`

## Covered sections

- `2.5` Striche
- `2.5.1` Waagerechter Strich
- `2.5.1.1` Trennungsstrich
- `2.5.1.2` Bindestrich
- `2.5.1.3` Gedanken-, Auslassungs-, Ergänzungs-, Strecken- und Vergleichsstrich
- `2.5.1.4` Aufzählungszeichen
- `2.5.1.5` Strich zwischen Zahlen
- `2.5.1.6` Strich als Minuszeichen
- `2.5.2` Schrägstrich
- `2.5.3` Senkrechter Strich

## Architectural conclusion

Stroke-like punctuation cannot be modeled as a simple
print-character-to-Braille lookup table.

The same Braille sequence has multiple semantic roles,
and those roles carry different:

- word-boundary semantics,
- spacing behavior,
- line-breaking behavior,
- numeric-state transitions,
- contraction implications,
- embedded-system implications.

The hyphen is a word boundary for normal German text
rules, while the supplementary dash is explicitly not.

Numeric dash and numeric slash contexts interact with
the numeric state machine and may require renewed number
announcement.

Minus and mathematical fraction-bar alternatives cross
into the mathematical announcement system.

## Extracted contract

- Rule records: `17`
- Synthetic cases: `6`

## Promotion policy

This is normative extraction only.

No stroke, slash, layout, or boundary rule is executable
in Braille Hub Core yet.

## Next

Phase 15.1G specifies German capitalization and case-state
behavior from BSKDL section `2.6`.
