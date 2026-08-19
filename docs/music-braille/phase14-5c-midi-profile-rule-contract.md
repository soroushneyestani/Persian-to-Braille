# Phase 14.5c — MIDI Music Braille Profile + Rule Contract

## Status

Phase 14.5b established the authoritative MBC 2015 rule/sign seed. Phase 14.5c freezes the **MIDI-specific transcription profile** needed before a Unicode Music Braille encoder can be implemented.

This is a profile contract, not a claim that MIDI can reconstruct the original printed score.

## 1. Enharmonic spelling

MIDI supplies sounding pitch, not print spelling. The frozen profile is `KEY_SIGNATURE_DISTANCE_V1`:

1. Preserve explicit spelling if a future adapter supplies it.
2. For MIDI, derive spelling deterministically from pitch plus the active MIDI key signature.
3. Candidate spellings are scored first by distance from the key-signature accidental for that letter, then active key polarity, then accidental magnitude.
4. With no key signature, use the neutral (`sf = 0`) profile and prefer sharps only as a final deterministic tie-break.
5. Written octave is derived **after spelling** so B-sharp/C-flat boundary cases remain correct.

This profile is deterministic transcription, not source reconstruction.

## 2. Chord written note and interval direction

MBC 2015 normally uses print clef/part context. MIDI has no such surface, so the generic MIDI profile freezes:

- written chord note: **highest sounding note**;
- interval direction: **downward**;
- member order: descending sounding pitch;
- same-pitch duplicates: fail closed;
- compound intervals above an octave: fail closed in the first Phase 14.6 encoder until the additional authoritative rules are materialized.

A future MusicXML adapter in **Phase 19** may carry explicit clef/part semantics and select a documented alternative profile without changing the Music Braille engine boundary.

## 3. Numeric key and meter serialization

### Key signature

- `sf = 0`: no key signature.
- absolute count 1–3: repeat the authoritative sharp/flat sign.
- absolute count 4–7: numeric count + one sharp/flat sign.
- first following note requires an octave mark.

### Meter

The MIDI profile emits simple meter numerically. MIDI `4/4` is **not** silently converted to common time and MIDI `2/2` is **not** silently converted to cut time because SMF metadata does not preserve that print distinction.

Supported initial denominator set: `1, 2, 4, 8, 16, 32, 64`.

The exact BRF/Unicode digit-cell table remains an explicit Phase 14.6 implementation gate.

## 4. Encoder state / precedence

- Measure boundary resets measure-scoped accidental state.
- Key precedes meter at the same position.
- A key or meter signature forces an octave mark on the next note.
- Single note order: accidental → octave → note → augmentation dot(s) → tie.
- Rest order: rest → augmentation dot(s).
- Chord order: written-note cluster → intervals → chord/member tie handling.
- Unsupported cases fail closed.

## Conformance seed

Semantic profile fixtures: **12**.

No Unicode Braille strings are frozen here.

## Next gate

`READY_FOR_PHASE14_6_MUSIC_BRAILLE_ENCODER_FOUNDATION`
