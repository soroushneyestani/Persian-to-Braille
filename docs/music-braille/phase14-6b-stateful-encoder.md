# Phase 14.6b — Stateful MIDI-Profile Music Braille Encoder

## Status

Phase 14.6a established authoritative BRF/Braille-ASCII → Unicode Braille conversion and atomic sign emission. Phase 14.6b adds the first stateful MIDI-profile encoder while preserving the `NotationScore` boundary for Phase 14.7.

## Implemented state

### Enharmonic spelling

`KEY_SIGNATURE_DISTANCE_V1` is executable with the Phase 14.5c1 correction:

1. distance from the active key-signature accidental;
2. active key polarity;
3. accidental magnitude;
4. stable letter order.

All six frozen spelling fixtures remain executable, including E-sharp, F-flat and B-sharp octave-boundary cases.

### Accidentals

Accidental state is measure-scoped and keyed by the spelled note plus written octave. The state starts from the active key signature, carries until countermanded, and resets at each measure boundary.

The MIDI profile treats accidentals created by deterministic generated notation as part of that generated notation, not as corrections to an existing print source. No claim of original print reconstruction is made.

### Octave marks

The first musical note is marked. Subsequent melodic notes apply MBC 2015 §3.2.2:

- interval smaller than a fourth → omit;
- interval greater than a fifth → mark;
- fourth/fifth → mark only when the written octave changes.

An initial key or meter signature also forces the first following note to carry an octave mark.

### Chords

The frozen generic MIDI profile is executable:

- highest sounding pitch is the written note;
- remaining members are intervals downward;
- same-pitch duplicates fail closed;
- intervals larger than an octave fail closed;
- whole-chord ties use the authoritative chord-tie sign.

The structured result carries `MIDI_GENERIC_UPPER_NOTE_DOWNWARD_INTERVALS_V1` so later UI/documentation can disclose the chosen interval direction.

### Measures and signatures

- key signature precedes meter when both are present;
- no blank appears between adjacent key and meter signatures;
- a single Braille blank separates measures;
- measure boundaries reset accidentals but do not themselves force octave restatement.

## Still deferred

- `NotationScore → StatefulScoreInput` bridge: Phase 14.7;
- public SDK facade: Phase 14.7;
- Word Task Pane: Phase 14.8;
- Word insertion/live validation: Phase 14.9;
- MusicXML adapter: Phase 19;
- mid-score key/meter changes and compound chord intervals remain fail-closed until separately specified.

## Next gate

`READY_FOR_PHASE14_7_MIDI_TO_BRAILLE_END_TO_END_AND_SDK_FACADE`
