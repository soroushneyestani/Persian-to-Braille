# Phase 14.9c — Exact Duration Decomposition Completeness Correction

Status: **IMPLEMENTED AND RE-AUDITED**

Profile:

`EXACT_DURATION_DECOMPOSITION_COMPLETE_V1`

## Root cause

The previous `decomposeExactDurationUnits()` implementation preserved the
longest-value ordering fix, but still consumed that table greedily without
backtracking. That is not a complete exact-decomposition algorithm.

False-negative examples from the already-frozen duration vocabulary:

- `51 = 36 + 9 + 6`
- `132 = 96 + 36`
- `95 = 72 + 9 + 8 + 6`

## Corrected algorithm

The implementation now performs complete exact search with memoization.

Canonical ranking is deterministic and conservative:

1. minimum number of triplet-valued fragments;
2. minimum fragment count;
3. longest-duration lexicographic preference.

The duration vocabulary is unchanged. The notation grid remains 96 units per
quarter. The global fallback tolerance remains at most 6 units. The 144-unit
dotted-quarter atomic regression remains atomic.

## Corrected real-world evidence

The same four SHA-pinned real-world fixtures are re-audited after rebuilding
the music package.

Corrected totals:

- derived-rest failures: **614**
- measure-bounded note-segment failures: **136**
- incomplete polyphonic measures: **11**
- raw note-interval failures: **1**

The single raw-note failure remains the exact zero-duration source event in
`d_HO0606.mid` at tick `61378 -> 61378`.

The maximum nearest correction for the remaining genuine rhythm-coherence
cases remains **5 units**.

Therefore `GENERIC_MIDI_SHARED_BOUNDARY_RHYTHM_V1` remains required, but its
evidence is revised before implementation.

MusicXML remains outside Phase 14 and reserved for Phase 19.
