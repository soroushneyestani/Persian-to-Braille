# Phase 15.1H — BSKDL Basisschrift Emphasis & Versalien Contract

Status: **EXTRACTED, NOT PROMOTED**

## Normative source

- Authority: `Brailleschriftkomitee der deutschsprachigen Länder`
- Edition: `2., korrigierte Auflage 2021`
- SHA-256: `35f6cd3a8ef07ad33229398e6310dc778046df23fc13a61f0b7871e288c5d8ce`

## Covered sections

- `2.7` Hervorhebungen
- `2.7.1` Erste Hervorhebungsart
- `2.7.2` Zweite Hervorhebungsart
- `2.7.3` Versalien

## Architectural conclusion

German Braille exposes two explicit emphasis channels.

Emphasis may apply to:

- one word,
- multiple words,
- a word-initial part,
- an internal word part.

Hyphen and slash are word boundaries for emphasis scope.

The second emphasis channel has its own start and end
sequences and can coexist with the first channel.

Print formatting such as bold, italic, underline, font color,
or highlighting is not mapped directly into Core rules.
That mapping belongs to a future host/transcription policy.

When all-capitals presentation must remain explicitly
recognizable, Versalien uses Basisschrift case machinery.

Versalien also permits an alternative emphasis-based
representation, which must remain a deliberate policy choice.

## Extracted contract

- Rule records: `15`
- Validation cases: `9`

## Promotion policy

No emphasis or Versalien behavior is executable in
Braille Hub Core or Microsoft 365 yet.

## Next

Phase 15.1I extracts accented letters and special-form
letters from BSKDL section `2.8`.

## Pre-closure precision consolidation

`DE-EMPH-001` is explicitly classified as architectural
synthesis derived from section 2.7 rather than as a direct
normative rule.
