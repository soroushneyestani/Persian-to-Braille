# Phase 16.5A - MusicXML H4C Full-Measure Polyphony

## Frozen source

Phase 16.5A reuses the existing H4C full-measure in-accord surface already
implemented by the stateful Music Braille engine.

The source-backed constraints applied here are:

- simultaneous independent actions are written successively and joined by the
  full-measure in-accord sign without spaces;
- treble ordering is highest-to-lowest;
- bass ordering is lowest-to-highest;
- each action must contain exactly one full measure of note values;
- an implied rest may be inserted as a transcriber-added rest and must carry
  the existing dot-5 prefix;
- the first note after an in-accord sign is handled by the already-frozen
  stateful engine octave-reset behavior.

## MusicXML boundary

Phase 16.5A accepts `backup` / `forward` cursor syntax only when it resolves to:

- at least two explicit `<voice>` streams;
- one MusicXML staff;
- an active G or F clef for that staff;
- full-measure voice coverage under the active meter;
- non-crossing, register-separated voice streams.

The bridge uses preserved MusicXML voice/staff/clef metadata. It does not infer
staff or hand identity from MIDI.

## Explicitly deferred

- part-measure H4D MusicXML segmentation;
- multi-staff polyphony;
- crossed voices / nested in-accord;
- non-atomic implied-rest decomposition;
- repeat barlines;
- measure-local key transitions/cancellation;
- generic irregular tuplets;
- slur, grace, articulation, ending, dynamics, direction words.

All deferred cases remain fail-closed.
