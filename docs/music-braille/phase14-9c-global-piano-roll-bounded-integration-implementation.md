# Phase 14.9c — Global Piano-Roll Bounded Production Integration

Status: **IMPLEMENTED / REAL-WORLD TIMEOUT-GATED**

Profile:

`GENERIC_MIDI_GLOBAL_PIANO_ROLL_BOUNDED_INTEGRATION_V1`

## Production route

The production MIDI route is now:

`SMF parser -> global piano-roll reducer -> notation/rhythm/polyphony -> Braille`

The historical H1 classifier remains in the repository as an internal
classification utility, but production no longer invokes it and no parsed
MIDI note is removed because of channel, program, percussion convention, or
pitch-bend metadata.

Reducer diagnostics are surfaced through the public translation result.

## One merged musical part

All parsed note events enter the reducer and the resulting synthetic
track-0/channel-0/program-0 source is the only production notation part.

The old `SOURCE_PART_DERIVED_FROM_TRACK_CHANNEL` disclosure is retained by the
generic notation-builder API for its historical source-part mode, but is
suppressed from the global-piano-roll production result because that claim is
not true for the merged synthetic part.

## Simultaneous-note topology

Chord identity is:

`corrected onset + corrected release`

Same-onset notes with different corrected releases are not coerced into one
mixed-duration chord. They remain distinct simultaneous actions in the same
piano part and use the existing H4C/H4D in-accord machinery when independence
requires it.

The same endpoint-aware grouping is used by the shared-boundary solver before
and after correction, so a correction that changes action topology still fails
closed.

## Bounded cyclic solver

The existing exact acyclic tree/forest dynamic programming is unchanged.

The cyclic fallback remains exact and deterministic below a hard implementation
visit budget. It is measure-bounded and preserves the frozen objective order.
Safety-bound exhaustion is projected as the explicit notation failure:

`RHYTHM_COMPLEXITY_LIMIT_EXCEEDED`

The current implementation budget is 100000 visited cyclic search states per
radius/measure. This number is a performance guard, not Music Braille
semantics. The six-unit rhythm tolerance and duration vocabulary are unchanged.

No unbounded recursive fallback continues after the guard is exceeded.

## Real-world safety

The four SHA-pinned local MIDI fixtures are executed only as local smoke
evidence. Each subprocess has a hard timeout so a dense MIDI file cannot leave
the integration gate in an unbounded CPU-bound state.

Third-party MIDI bytes are never copied into or committed to the repository.

Triplet-provenance implementation remains paused. The next tranche is a
post-integration triplet recovery re-audit on this new single-piano-part
baseline.

Microsoft365 continues to consume only the public SDK.

MusicXML remains outside Phase 14 and reserved for Phase 19.

**DO NOT COMMIT YET.**
