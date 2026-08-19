# Phase 14.9c — Global Piano-Roll Bounded Production Integration Contract

Status: **FROZEN**

Profile:

`GENERIC_MIDI_GLOBAL_PIANO_ROLL_BOUNDED_INTEGRATION_V1`

This contract defines how the already-implemented
`GENERIC_MIDI_GLOBAL_PIANO_ROLL_REDUCTION_V1` reducer is allowed to enter the
production MIDI-to-Braille route.

## Production route

The production route becomes:

`SMF parser -> global piano-roll reducer -> notation/rhythm/polyphony -> Braille`

The old instrument-based classifier remains available as an internal fact and
compatibility module, but it is no longer allowed to remove Channel-10 notes,
GM effect-program notes, or notes with pitch-bend metadata from the production
global-piano-roll path.

Reducer diagnostics must be surfaced in the public translation diagnostics.

The output remains one synthetic musical part.

## Same-onset, different-release rule

Global piano-roll reduction exposes a case that did not matter when source
tracks/channels were kept as separate parts: several different pitches may
attack on the same canonical onset but release at different times.

Those notes must **not** be forced into one equal-duration chord.

The frozen musical grouping rule is:

`chord identity = shared corrected canonical onset + shared corrected release`

Therefore:

- same onset + same release + different pitches -> one chord;
- same onset + different release -> distinct simultaneous musical actions;
- those actions remain inside the one global piano part;
- independent simultaneous actions are serialized using the already-frozen
  H4C/H4D in-accord machinery where required;
- no note is dropped to make a chord homogeneous.

This is not a return to track/channel separation and makes no staff, hand,
instrument, or original-voice claim.

## Shared-boundary topology

The grouping topology used for production rendering must be derived from the
same shared-boundary rhythm baseline that the coherence solver uses.

It must not be reconstructed later from the older local H2 interval baseline.

After boundary solving, the same-onset/release action topology must be
rechecked. A topology-changing solution fails closed.

## Solver scalability

One global output part must not cause one unbounded whole-song search.

Existing exact tree/forest dynamic programming remains valid for acyclic
constraint components.

Cyclic components require an exact deterministic bounded solver. The
implementation may use variable elimination or an equivalent exact method, but
it must preserve the already-frozen optimization order:

1. minimum maximum absolute boundary correction;
2. minimum total absolute boundary correction;
3. minimum corrected boundary count;
4. minimum total represented note duration;
5. lexicographically lowest boundary vector.

There must be a hard complexity guard for the global-piano-roll production
profile.

If an exact cyclic component exceeds the implementation safety budget, the
translator must fail closed with an explicit complexity failure. It must not
fall back to an unbounded recursive search that can consume CPU indefinitely.

The concrete internal budget is an implementation/performance constant and is
not part of Music Braille semantics; changing it later must not alter accepted
solutions below the bound.

## Dense short-duration material

The global reducer intentionally retains material that the old classifier used
to remove.

This may expose very short note durations in real MIDI files.

This integration tranche must **not** solve that by reintroducing percussion,
channel, program, or instrument filtering.

It also must not silently widen the 96-unit grid, duration vocabulary, or the
existing <= 6-unit correction contract.

If retained material is not representable under the current rhythm contract,
the translator remains fail-closed and the evidence is handled in a separate
post-integration rhythm audit.

## Triplets

Triplet-provenance implementation remains paused.

After bounded global-piano-roll production integration is stable, the
triplet-provenance audit must be rerun on the new one-part representation.
Only then may a triplet-provenance fix be designed.

## Real-world acceptance targets

The SHA-pinned real-world fixtures are used as smoke evidence, not committed
test assets.

- `test.mid`: production must use one piano part and must no longer fail because
  same-onset notes have different release lengths.
- `oxygene4.mid` and `Jean_Michel_Jarre_OXYGENE4.mid`: production should reach
  the next genuine downstream blocker without CPU-bound whole-song solving.
- `d_HO0606.mid`: no note may be removed to recover the old classifier
  behavior. A rhythm-representability blocker is acceptable evidence and must
  be reported explicitly.

No exact BRF string for these real-world files is frozen in this contract.

## Preserved boundaries

- H4C full-measure in-accord remains authoritative.
- H4D terminal part-measure in-accord remains authoritative.
- H5 boundary-only meter-change serialization remains authoritative.
- shared-boundary rhythm correction remains <= 6 units.
- exact duration decomposition vocabulary remains unchanged.
- Microsoft365 continues to use the public SDK only.
- MusicXML remains outside Phase 14 and reserved for Phase 19.
- third-party MIDI bytes are never committed.

## Decision

`READY_FOR_PHASE14_9C_GLOBAL_PIANO_ROLL_BOUNDED_PRODUCTION_INTEGRATION_IMPLEMENTATION`

**DO NOT COMMIT YET.**
