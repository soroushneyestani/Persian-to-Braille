# Phase 14.9c — Post-Integration Scope Decision

Status: **ACCEPTED FOR PHASE 14**

The Global Piano-Roll production integration is retained as the Phase 14
production baseline.

## Accepted production behavior

- MIDI production route: `PARSE -> REDUCE -> NOTATION -> BRAILLE`.
- All MIDI note events participate in one synthetic piano part.
- Instrument, channel-10, percussion and GM-effect classification does not
  remove notes.
- Same corrected onset + corrected release forms a chord.
- Same corrected onset + different release remains simultaneous independent
  material and uses the existing in-accord machinery.
- Cyclic rhythm solving is exact/deterministic below its hard implementation
  guard and fails explicitly with `RHYTHM_COMPLEXITY_LIMIT_EXCEEDED` when that
  guard is exceeded.
- The frozen `<= 6` shared-boundary correction tolerance is not widened.

## Real-world evidence

`test.mid` succeeds as one production part. Its reachable notation contains
one three-event triplet run and zero invalid current-bridge triplet runs.

`oxygene4.mid` is accepted as a Phase 14 fail-closed complexity-limit fixture:
`RHYTHM_COMPLEXITY_LIMIT_EXCEEDED` in measure 6.

`Jean_Michel_Jarre_OXYGENE4.mid` is accepted as a Phase 14 fail-closed
complexity-limit fixture: `RHYTHM_COMPLEXITY_LIMIT_EXCEEDED` in measure 5.

`d_HO0606.mid` is accepted as a Phase 14 fail-closed rhythm-representability
fixture: `UNQUANTIZABLE_RHYTHM` in measure 10 under the frozen <= 6-unit
correction contract.

These are scoped initial-profile limitations, not claims that future releases
must retain the same implementation bounds.

## Triplet decision

No Triplet Provenance implementation is added in this tranche.

The only SHA-pinned real-world score that reaches notation completion has a
valid three-event triplet run. The remaining three files fail before triplet
recovery. Adding triplet provenance now would therefore be speculative and
would not address their actual blockers.

Triplet provenance is reopened only when a notation-reachable score provides
evidence that duration-class recovery is ambiguous or invalid.

## Next gate

`PHASE14_9C_WINDOWS_WORD_LIVE_ACCEPTANCE`

The live gate must verify the already-frozen product route, not reopen MIDI
arrangement or solver semantics.

**DO NOT COMMIT YET.**
