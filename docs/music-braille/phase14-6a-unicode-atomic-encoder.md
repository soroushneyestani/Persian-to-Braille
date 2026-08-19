# Phase 14.6a — Unicode Cell Layer + Atomic Music Braille Encoder

## Status

Phase 14.5c froze the MIDI-specific profile. Phase 14.6a implements the first **real Unicode Braille emission layer**.

This is intentionally an atomic encoder foundation. It does not yet bridge `NotationScore`; that remains Phase 14.7 after the stateful encoder is complete.

## Unicode cell layer

Canonical six-dot Braille ASCII entries: **64**.

The runtime converts BRF/Braille-ASCII tokens to Unicode Braille Patterns (`U+2800..U+283F`) through an explicit auditable dot table.

Known conversion gates include:

- `#d4` → `⠼⠙⠲`
- `"?` → `⠐⠹`
- `@c` → `⠈⠉`
- `.c` → `⠨⠉`
- `%` → `⠩`
- `<` → `⠣`
- `*` → `⠡`

All 68 authoritative Phase 14.5b BRF fixtures must pass conversion.

## Atomic encoder coverage

Implemented: notes/rests, explicit octave/accidental signs, augmentation dots, simple key signatures, simple numeric meters, triplet indicator, intervals 2..8, ties, measure separator, and pre-resolved atomic chord emission.

Still deferred inside Phase 14.6: measure-scoped accidental state, contextual octave suppression/reinstatement, automatic MIDI-profile chord written-note selection, and complete stateful measure/document composition.

## First visible output

```text
BRF     : "?
Unicode : ⠐⠹
```

## Boundaries

- `NotationScore → encoder`: Phase 14.7.
- Public SDK facade: Phase 14.7.
- Word Task Pane: Phase 14.8.
- Word insertion/live validation: Phase 14.9.
- MusicXML: Phase 19.

## Next gate

`READY_FOR_PHASE14_6B_STATEFUL_MUSIC_BRAILLE_ENCODER`
