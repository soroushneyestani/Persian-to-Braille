# Phase 15.1E — BSKDL Basisschrift Numeric Grammar & State Contract

Status: **EXTRACTED, NOT PROMOTED**

## Normative source

- Authority: `Brailleschriftkomitee der deutschsprachigen Länder`
- Edition: `2., korrigierte Auflage 2021`
- SHA-256: `35f6cd3a8ef07ad33229398e6310dc778046df23fc13a61f0b7871e288c5d8ce`

## Covered sections

- `2.3` Zahlen
- `2.3.1` Arabische Zahlen
- `2.3.1.1` Grundzahlen
- `2.3.1.2` Ordnungszahlen
- `2.3.1.3` Zeitangaben
- `2.3.1.4` Dezimalklassifikatoren, Kapitel- und Versnummern
- `2.3.1.5` Zahlenbrüche
- `2.3.1.6` Prozent, Promille, Grad, Minute, Sekunde
- `2.3.1.7` Paragrafzeichen
- `2.3.1.8` Ankündigungspflichtige Satzzeichen
- `2.3.2` Römische Zahlen
- `2.4` Verbindungen mit Zahlen
- `2.4.1` Zahlen am Anfang von Wörtern
- `2.4.2` Zahlen und Einheiten

## Architectural conclusion

German numeric Braille is modeled as a grammar with state.

The number indicator establishes Arabic numeric context.
That context has explicit continuation and termination rules.

Lowered digits form a distinct numeric sub-alphabet used by
ordinal, fraction, date/classifier and related compact notation.

Punctuation ambiguity is resolved through explicit announcement
rather than by treating punctuation as context-free mappings.

Roman numerals depend on the German capitalization machinery
and are therefore not fully executable before section `2.6`
is specified.

Number-to-word and number-to-unit boundaries are part of the
numeric grammar and cannot be delegated to generic whitespace
handling.

## Extracted contract

- Numeric rules: `15`
- Synthetic validation cases: `6`
- Arabic digit cells: `10`
- Lowered digit cells: `10`

## Promotion policy

This contract is normative extraction only.

No numeric rule has been promoted into Braille Hub Core,
SDK, Microsoft 365 integration, or public conformance claims.

## Next

Phase 15.1F audits horizontal strokes, slashes, and related
boundary-sensitive punctuation from BSKDL section `2.5`.

## Pre-closure precision consolidation

Numeric precision was tightened before closure:

- print apostrophe grouping is explicitly normalized to the
  grouping point,
- long ungrouped numbers may be grouped for readability,
- ordinal lowered-digit notation is described as compact,
  not contracted,
- ambiguous punctuation and the flowing-text closing-sign
  exception are explicit,
- date and time validation cases are no longer ambiguous,
- cross-dependencies on dash, slash, case, and mathematics
  are explicit,
- rule-family coverage is distinguished from full
  conformance promotion.
