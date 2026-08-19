# Phase 14.5c1 — Enharmonic Tie-Break Contract Correction

## Root cause

Phase 14.5c froze both a textual candidate ordering and executable profile fixtures, but one edge case exposed an internal contradiction before Phase 14.6b implementation:

- frozen fixture: MIDI pitch 64 with `sf = -6` → `F-flat`;
- old textual order: key-signature distance → accidental magnitude → key polarity;
- that old order deterministically selects `E-natural`, not `F-flat`.

## Correction

`KEY_SIGNATURE_DISTANCE_V1` keeps the same policy id and the same 12 frozen fixtures. Only the tie-break ordering is corrected to:

1. key-signature accidental distance;
2. active key polarity;
3. accidental magnitude;
4. stable letter order.

This makes the executable algorithm agree with all six existing spelling fixtures, including `E#`, `F-flat`, and `B#3` boundary cases.

No Music Braille sign mappings, MIDI parser behavior, notation quantization, Unicode mapping, chord policy, numeric signature policy, or Phase 19 boundary are changed.

## Gate

After correction, Phase 14.5b, 14.5c, and 14.6a validators plus the full music package tests must remain green before Phase 14.6b is materialized.
