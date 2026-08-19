# Phase 15.1J — BSKDL Basisschrift Foreign-Language Span Contract

Status: **EXTRACTED, NOT PROMOTED**

## Normative source

- Authority: `Brailleschriftkomitee der deutschsprachigen Länder`
- Edition: `2., korrigierte Auflage 2021`
- Source SHA-256: `35f6cd3a8ef07ad33229398e6310dc778046df23fc13a61f0b7871e288c5d8ce`
- Section: `2.9 Fremdsprachliche Einschübe`
- Section extraction SHA-256: `ab80df8d3743a5844a017d390a55f935cd9864b7fd3bf10b2b6e01aa6e19c25e`
- PDF pages: `81–83`

## Two distinct span modes

### German Braille rendering

Foreign-language content may remain under German
Basisschrift, Vollschrift, or Kurzschrift.

Only Lautgruppenkürzungen may be used.

Known pronunciation should influence contraction choice.

Contraction across a word seam is prohibited.

### Foreign Braille system

The active Braille profile may instead switch to the
foreign-language Braille system.

- One word: `⠰`
- Multiple words start: `⠰⠰`
- Multiple words end: `⠠⠄`

Inside that span, the signs and rules of the target
Braille system apply.

If the target alphabet/system is not clear from context,
it must be identified by annotation.

For spans of one to three words, each word may be
individually marked as a space-saving alternative.

## Architectural conclusion

Content language and active Braille profile are separate
dimensions.

A foreign-language token does not automatically imply
a profile switch.

The future resolver must choose between:

1. rendering foreign content under the German profile,
2. switching to a foreign Braille profile,
3. requesting explicit profile identity when ambiguous.

This is therefore a direct architectural precursor to the
Phase 17 BrailleProfile span resolver.

## Open dependency

Section `2.9` refers to section `4.8` for explicit
announcement and termination of Basis-/Vollschrift inserts.

The marker example observed in `2.9` is recorded, but its
general rule is intentionally **not frozen** until `4.8`
is audited directly.

## Extracted contract

- Rules: `14`
- Validation cases: `7`
- Span modes: `2`

## Promotion policy

No foreign-language span or profile-switch behavior is
executable in Braille Hub Core yet.

## Next

Phase 15.1K audits mathematical signs and mathematical
inserts from BSKDL section `2.10`.
