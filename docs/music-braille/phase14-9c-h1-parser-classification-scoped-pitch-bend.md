# Phase 14.9c H1 — Parser Metadata, Classification, and Scoped Pitch Bend

## Status

Implemented as the first materialized tranche of the frozen Phase 14.9c1
real-world MIDI hardening contract.

## Parser boundary

The Standard MIDI File parser now records, rather than interprets:

- Program Change events;
- pitch-bend events;
- the effective program at every note onset;
- the effective program attached to every pitch-bend event.

A non-center pitch bend is no longer rejected by the binary parser.

Malformed SMF input, format 2, and SMPTE time division remain fail-closed.

## Non-pitched source classification

Before notation reconstruction, H1 classifies the following as non-pitched
material:

- MIDI channel 10 (zero-based channel 9), reserved for percussion;
- General MIDI programs 120–128 (zero-based 119–127), from Reverse Cymbal
  through Gunshot.

GM Synth FX programs 97–104 remain pitched candidates.

Skipped non-pitched notes are disclosed with:

`NON_PITCHED_SOURCE_EVENT_SKIPPED`

Skipped non-center pitch bends attached to non-pitched material are disclosed
with:

`NON_PITCHED_PITCH_BEND_SKIPPED`

The diagnostics are aggregated by track/channel/effective-program and include
the exact skipped event count in the message. Skipping is therefore not silent.

## Pitched pitch bend

A non-center pitch bend attached to retained pitched material still fails
closed with:

`UNSUPPORTED_PITCH_BEND`

Its failure stage is now `classification`, not `parser`.

H1 does not flatten, transpose, or otherwise invent fixed-pitch notation for a
real pitched bend.

## Polyphony

H1 does not trim overlaps and does not infer voices.

Independent overlap remains `UNSUPPORTED_POLYPHONY` until the standards-backed
Music Braille in-accord rule surface is frozen and implemented.

## Rhythm

Composite rhythm is not modified by H1. That is H2.

## Package boundary

The runtime remains:

```text
Microsoft365 -> public SDK -> music engine
```

Microsoft365 does not import `@persian-braille/music` directly.

MusicXML remains outside Phase 14 and reserved for Phase 19.
