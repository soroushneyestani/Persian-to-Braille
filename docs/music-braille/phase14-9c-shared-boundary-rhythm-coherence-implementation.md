# Phase 14.9c — Shared-Boundary Rhythm Coherence Implementation

Status: **IMPLEMENTED / REAL-WORLD SMOKE GATED**

Profile:

`GENERIC_MIDI_SHARED_BOUNDARY_RHYTHM_V1`

Baseline evidence revision:

`EXACT_DURATION_DECOMPOSITION_COMPLETENESS_V1`

## Scope

The generic MIDI-to-Braille bridge now opts into a shared-boundary rhythm
coherence profile after H1 source classification and before H4C notation
materialization.

The default notation-builder surface remains unchanged unless the rhythm
profile is explicitly selected.

The Microsoft 365 integration remains:

`Microsoft365 -> public SDK -> Music`

No Microsoft 365 module imports Music internals.

## Zero-duration MIDI source events

An exact source event whose `startTick == endTick` is omitted before notation
quantization and disclosed with:

`ZERO_DURATION_MIDI_NOTE_OMITTED`

A positive source duration that collapses to zero on the frozen notation grid
remains fail-closed as `UNQUANTIZABLE_RHYTHM`.

## Diagnostics

Every successful shared-boundary correction is disclosed with:

`RHYTHM_BOUNDARY_COHERENCE_QUANTIZED`

Exact zero-duration source omission remains explicitly disclosed with:

`ZERO_DURATION_MIDI_NOTE_OMITTED`

No rhythm correction or source omission is silent.

## Shared boundary identity

Source-derived timing boundaries are represented as shared nodes. A source tick
reused by note boundaries receives one correction, not independent local
rounding.

H4C equal-onset chord/group membership is retained.

Measure starts, measure ends, and boundary-aligned meter changes remain fixed.

Movable boundaries remain limited to the frozen six-unit window.

## Exact constraints

The solver requires exact decomposition for every emitted note segment and
every emitted rest.

A derived rest is not independently rounded.

Instead, the adjacent shared source boundary moves so the complete action and
measure timeline remains arithmetically coherent.

A positive source gap may collapse to a touching boundary only when required
for a coherent solution inside the six-unit window. This does not trim an
overlap: corrected ordering remains non-overlapping and the H4C derived-action
partition must remain unchanged. A baseline zero gap remains exactly zero.

## Determinism

The outer correction-radius search minimizes maximum absolute correction.

Within that radius the objective remains:

1. minimum total absolute boundary correction;
2. minimum number of corrected boundaries;
3. minimum total represented note duration;
4. lexicographically lowest corrected boundary vector.

Acyclic constraint components use exact dynamic programming. Cyclic H4C
constraint graphs retain the deterministic bounded search path.

## H4C preservation

After solving, the H4C action-partition signature is recomputed. Any correction
that would alter derived action membership fails closed.

Distinct source onset groups that become equal only because both are clipped to
the same measure boundary do not receive an impossible strict ordering
constraint.

No original voice numbering, hand assignment, or staff direction is claimed.

## Triplets

The existing bridge triplet-group validator is unchanged and remains
fail-closed. Rhythm coherence does not relax incomplete triplet-run rejection.

## Synthetic regressions

The implementation includes synthetic tests for:

- a measure-edge note/rest coherence correction;
- explicit zero-duration source omission;
- a short positive gap collapsing to a touching boundary without overlap
  trimming;
- a carried note plus a measure-boundary onset preserving distinct H4C groups;
- a positive source duration collapsing to zero on the notation grid remaining
  fail-closed.

No third-party MIDI bytes are committed.

## Real-world post-implementation gate

The same four SHA-pinned local MIDI fixtures are smoke-tested without copying
their bytes into the repository.

Expected next blockers after rhythm coherence:

- `test.mid`: success, unchanged 2-part / BRF-length-72 no-op result;
- `oxygene4.mid`: part-measure in-accord required;
- `Jean_Michel_Jarre_OXYGENE4.mid`: part-measure in-accord required;
- `d_HO0606.mid`: boundary-aligned meter-change serialization required.

MusicXML remains outside Phase 14 and reserved for Phase 19.
