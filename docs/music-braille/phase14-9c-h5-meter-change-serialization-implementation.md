# Phase 14.9c H5 — Measure-Boundary Meter-Change Serialization Implementation

Status: **IMPLEMENTED / REAL-WORLD SMOKE GATED**

Profile:

`MBC_MEASURE_BOUNDARY_METER_CHANGE_V1`

## Implemented boundary

The notation builder remains the authority for meter placement on the frozen
96-unit timeline.

H5 does not relax the existing rule that a time-signature change inside a
derived measure fails closed.

The bridge now separates two responsibilities:

1. source events at tick 0 determine the existing initial-meter header;
2. later effective numerator/denominator changes are projected from successive
   `NotationMeasure` values onto the stateful measure stream.

## Serialization

`StatefulMeasureInput` may now carry a meter change.

At a changed measure boundary the stateful encoder emits the existing numeric
simple-meter serializer before that measure's first musical event.

The first following note is forced to carry an octave mark.

A repeated effective meter is not redundantly emitted.

No common-time or cut-time symbol is inferred from MIDI.

## Diagnostics

Successful boundary-aligned meter serialization is disclosed with:

`METER_CHANGE_SERIALIZED`

The diagnostic explicitly records that MIDI does not preserve whether the
original print used common-time or cut-time symbols.

## Preserved behavior

- initial meter output remains unchanged;
- simple meter cell mapping is reused;
- denominator support remains unchanged;
- measure-scoped accidental reset remains unchanged;
- H4C and H4D in-accord behavior remains unchanged;
- key changes after tick 0 remain fail-closed;
- combined meters remain outside this implementation.

MusicXML remains outside Phase 14 and reserved for Phase 19.
