# Phase 16.R3 — Real MusicXML Autopilot Continuation v7

v6 stopped before repository mutation. v7 therefore starts directly from the retained validated v5 keyboard-parallel checkpoint.

## MusicXML pitch policy

MusicXML defines `<alter>` as chromatic alteration in semitones and its data type is decimal. The source format is not limited to the accidental inventory currently representable by the Braille written-pitch override.

v7 freezes this bounded policy:

- integer `alter` in `-2..2`: preserve source written spelling exactly;
- integer `alter` outside `-2..2`: preserve exact MusicXML sounding pitch, omit the unrepresentable written-spelling override, and reuse the existing deterministic key-aware stateful spelling path;
- non-integer `alter`: fail closed because the current engine is a discrete-pitch profile;
- sounding pitch outside MIDI `0..127`: fail closed;
- every measure using extreme integer normalization emits a `SOURCE_PRESERVED_NOT_EMITTED` diagnostic.

This does not create a second Braille Music engine and does not silently claim reconstruction of an unrepresentable source spelling.

## Other bounded additions

- staff-scoped keyboard word expressions use parser-preserved musical onset;
- keyboard short slurs reuse existing `shortSlurAfter` per persistent source voice;
- independent dynamics may prefix an exact-onset rest in the keyboard profile.

MIDI public API and Office source remain unchanged. Validation failure rolls back v7 only.
