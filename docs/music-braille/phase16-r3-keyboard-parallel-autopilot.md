# Phase 16.R3 — Keyboard Parallel Real-Score Compatibility

This pack reuses the existing Braille Music stateful engine.

## Frozen compatibility model

For a multi-staff MusicXML keyboard part using backup/forward cursor polyphony:

1. Every explicit source voice must have a unique whole-part dominant printed staff.
2. Dominant staff 1 becomes the compatibility right-hand lane.
3. Dominant staff 2 becomes the compatibility left-hand lane.
4. Cross-staff notes remain inside their persistent source voice and therefore remain in the same derived hand.
5. Whole-part median written register supplies stable voice ordering inside each hand and an all-rest-measure fallback.
6. Right-hand chords use downward interval reading.
7. Left-hand chords use upward interval reading.
8. The existing stateful Braille Music engine remains the only engine.

The compatibility importer fails closed when these conditions are ambiguous.

## Dynamics

The real-score independent subset is:

`pp p mp mf f ff fff sf sfz`

A staff-scoped dynamic inside keyboard polyphony is attached at its exact parser-preserved onset to the first ordered pitched source voice active in that derived hand lane.

## Autopilot policy

The master BAT performs readiness, guarded mutation, targeted tests, full Music/SDK/Microsoft365 regression, typechecks, package-boundary validation, git diff validation and awaited real-score probing in one run.

No git add, commit, push or clean is performed.
