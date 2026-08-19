# Phase 14.9c H2 — Composite Rhythm Quantization and Tied Decomposition

## Status

Implemented from the frozen Phase 14.9c1 real-world MIDI hardening contract.

## Problem removed

Before H2, `quantizeMidiNote()` searched for one atomic notation duration that
was close to the raw MIDI duration. That rejected valid composite rhythmic
intervals even though the notation builder already knew how to decompose an
interval into supported values and derive ties.

Example:

```text
84 notation units
= 72 + 12
= dotted eighth + thirty-second
```

H2 removes that artificial single-atomic-duration prerequisite.

## Boundary quantization

Both the MIDI note onset and note end are projected independently to the frozen
96-unit notation grid.

The resulting positive interval is checked for exact decomposition. If exact
decomposition is impossible, H2 searches at most six notation units away.

Selection is deterministic:

1. minimum absolute correction;
2. if shorter and longer candidates are equally distant, choose the shorter
   representable interval.

A correction emits `RHYTHM_QUANTIZED`.

## Tied decomposition

The existing notation builder already decomposes measure-bounded intervals into
supported durations and sets `tieFromPrevious` / `tieToNext`. H2 now allows
composite intervals to reach that existing mechanism.

## Scope

H2 does not trim note tails, infer articulation, or infer voices.

Independent overlap remains fail-closed as `UNSUPPORTED_POLYPHONY`.

Microsoft365 remains on the public SDK boundary.

MusicXML remains outside Phase 14 and reserved for Phase 19.
