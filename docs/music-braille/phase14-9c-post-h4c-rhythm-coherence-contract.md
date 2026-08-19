# Phase 14.9c — Post-H4C Rhythm Coherence Contract

Status: **FROZEN — EVIDENCE CORRECTED**

Profile:

`GENERIC_MIDI_SHARED_BOUNDARY_RHYTHM_V1`

Evidence revision:

`EXACT_DURATION_DECOMPOSITION_COMPLETENESS_V1`

## Exact-decomposition correction

The previous evidence was collected while `decomposeExactDurationUnits()` used
longest-value greedy consumption without backtracking. That algorithm had false
negatives for already-supported exact values.

The corrected profile is:

`EXACT_DURATION_DECOMPOSITION_COMPLETE_V1`

Examples:

- `51 = 36 + 9 + 6`
- `132 = 96 + 36`
- `95 = 72 + 9 + 8 + 6`

Canonical exact decomposition minimizes triplet-valued fragments first, then
fragment count, then prefers the longest-duration lexicographic sequence.

The duration vocabulary, 96-unit grid, and six-unit fallback tolerance are
unchanged.

## Corrected real-world evidence

| Fixture | raw note failures | derived-rest failures | note-segment failures | incomplete polyphonic measures |
|---|---:|---:|---:|---:|
| test.mid | 0 | 0 | 0 | 0 |
| oxygene4.mid | 0 | 265 | 50 | 5 |
| Jean_Michel_Jarre_OXYGENE4.mid | 0 | 235 | 73 | 6 |
| d_HO0606.mid | 1 | 114 | 13 | 0 |

Corrected totals:

- derived-rest failures: **614**
- measure-bounded note-segment failures: **136**
- incomplete polyphonic measures: **11**
- raw note failures: **1**

The remaining genuine rhythm-coherence cases still require no more than 5 units
of nearest correction. The frozen maximum remains `baseline ± 6`.

## Shared-boundary policy

The policy itself is unchanged.

A movable source-derived boundary is corrected once. Every note, rest, and H4C
action constraint referencing that boundary uses the same corrected unit.

Measure starts, measure ends, and boundary-aligned meter changes remain fixed.

H4C same-onset chord membership and derived-action membership remain fixed.

A rest is never repaired independently by substituting only its duration.

Triplet recovery remains fail-closed.

No solution inside six units remains `UNQUANTIZABLE_RHYTHM`.

## Exact zero-duration source event

Only a source event with `startTick == endTick` may be omitted, and only with:

`ZERO_DURATION_MIDI_NOTE_OMITTED`

A positive source duration that collapses to zero remains fail-closed.

## Still deferred

Part-measure in-accord remains deferred until post-rhythm re-audit. Corrected
evidence: 5 in oxygene4.mid and 6 in Jean_Michel_Jarre_OXYGENE4.mid.

The boundary-aligned `4/4 -> 12/8` serialization in `d_HO0606.mid` remains H5.

MusicXML remains outside Phase 14 and reserved for Phase 19.

## Decision

**READY_FOR_PHASE14_9C_RHYTHM_COHERENCE_IMPLEMENTATION**
