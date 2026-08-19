# Phase 14.5b — Authoritative Music Braille Rule Seed

## Status

This phase materializes an **authoritative BRF-level rule seed** for the Phase 14 Music Braille engine. It does **not** implement the Unicode Braille encoder.

## Source provenance

- BANA Music Braille Code 2015 PDF SHA-256: `34d769731f69ed7586f96b221ca4e22d3e009d36e8024008dfe0fc935348595c`
- BANA Music Braille Code 2015 BRF ZIP SHA-256: `b936fd42d257eefaa0a7f90975588e60e97c4e0371f7a04f0e108441075401e3`
- BRF volumes: 5
- Full source publications are not vendored into this repository.

## Frozen seed families

- `MBR-NOTE-DURATION`
- `MBR-REST`
- `MBR-OCTAVE`
- `MBR-ACCIDENTAL`
- `MBR-KEY-SIGNATURE`
- `MBR-TIME-SIGNATURE`
- `MBR-NOTE-GROUPING`
- `MBR-CHORD-INTERVAL`
- `MBR-TIE`
- `MBR-MEASURE`

`MBR-NOTE-GROUPING` is added here because the already-frozen Phase 14.4 notation contract supports triplets, and MBC 2015 Table 8 is therefore an encoder dependency.

## Encoding boundary

Authoritative signs in this seed are stored as **BRF/Braille-ASCII tokens copied from the official BRF source**. Conversion to Unicode Braille is deliberately deferred to Phase 14.6 and must use an explicit validated conversion table. This prevents guessed dot patterns from entering the normative seed.

## Important profile decisions before encoder implementation

1. **Enharmonic spelling:** MIDI pitch alone cannot prove C-sharp vs D-flat. The notation/profile layer must carry or deterministically derive spelling.
2. **Chord direction:** MBC 2015 normally chooses the written chord note and interval direction from clef/part context. MIDI does not contain that print context, so the MIDI profile needs an explicit deterministic policy.
3. **Generic numeric serialization:** key signatures with four or more accidentals and arbitrary meter signatures require an explicit numeric-cell contract; examples alone are not enough.

## Phase boundary

Phase 14.5b freezes source-backed atomic signs and contextual rules. It does not:

- emit Unicode Braille,
- implement the full Music Braille encoder,
- expose a public SDK facade,
- modify Word UI,
- introduce MusicXML (reserved for Phase 19).

## Next gate

`READY_FOR_PHASE14_5C_MUSIC_BRAILLE_PROFILE_AND_RULE_CONTRACT`
