# Phase 14.9c — Global Piano-Roll Reducer Core Implementation

Status: **CORE IMPLEMENTED / PRODUCTION ROUTING DEFERRED TO BOUNDED INTEGRATION**

Profile:

`GENERIC_MIDI_GLOBAL_PIANO_ROLL_REDUCTION_V1`

This tranche implements the deterministic reducer itself without yet routing
the production MIDI-to-Braille bridge through the resulting single dense part.

That separation is intentional. A prior read-only experiment proved that
flattening Oxygene and immediately sending the whole dense part through the
current notation solver can become CPU-bound. The frozen contract therefore
requires bounded downstream processing.

## Implemented core semantics

- every parsed MIDI note event participates;
- track, channel, and program do not filter notes;
- MIDI channel 10 is not removed;
- GM effect programs are not removed;
- duplicate identity is canonical onset unit + MIDI note number;
- duplicate contributor groups collapse to one attack;
- retained release is the maximum source end;
- retained velocity is the maximum contributor velocity;
- same pitch at a different canonical onset remains a distinct re-attack;
- output is one synthetic track-0/channel-0/program-0 source part;
- original contributor facts remain available as reducer provenance;
- pitch-bend metadata does not reject or delete the underlying discrete note.

## Production integration boundary

The production bridge is intentionally unchanged in this tranche.

The next tranche must route the bridge through this reducer while ensuring that
shared-boundary rhythm/polyphony solving remains bounded by measure and/or a
small connected constraint component.

Only after that bounded production integration passes the four SHA-pinned
real-world MIDI smoke fixtures should triplet provenance be re-audited.

MusicXML remains outside Phase 14 and reserved for Phase 19.
