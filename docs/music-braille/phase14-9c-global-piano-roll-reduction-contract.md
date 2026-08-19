# Phase 14.9c — Global Piano-Roll Reduction Contract

Status: **FROZEN**

Profile:

`GENERIC_MIDI_GLOBAL_PIANO_ROLL_REDUCTION_V1`

## Product semantics

MIDI input is treated as one piano-roll source, not as an orchestration that
the converter must interpret.

Every parsed MIDI note event participates in the reduction regardless of:

- track,
- channel,
- General MIDI program,
- instrument family,
- percussion convention.

The converter does **not** decide which instrument is musically wanted.

The user is responsible for removing percussion, sound effects, accompaniment,
or any other source material that should not appear in the final piano
reduction.

## Reduction

All note events are projected to the existing canonical 96-units-per-quarter
timeline.

The duplicate identity is:

`canonical onset unit + MIDI note number`

Events with the same duplicate identity collapse to one piano attack.

The retained release is the maximum source end among all contributors.

A same-pitch event at a different canonical onset is a separate re-attack and
must never be removed by deduplication.

This operation is not arrangement or simplification. It removes duplicate
attacks only.

## Instrument and percussion policy

There is no automatic instrument filtering.

MIDI channel 10 has no special removal semantics in this profile.

General MIDI programs 120–128 have no special removal semantics in this
profile.

The H1 parser/classifier work remains useful for captured facts and legacy
diagnostics, but instrument-based note removal is superseded for this
production MIDI-to-Braille profile.

## Pitch bend

Pitch bend must not remove the underlying note event.

For the global piano-roll reduction, the discrete MIDI note number is the piano
key. Pitch-bend metadata may be retained for diagnostics/provenance but is not
a reason to reject the piano-key event.

## Output

The reduction produces one synthetic musical part.

Original track/channel/program information may survive as contributor
provenance, but it must not create separate Braille parts or change musical
note retention.

## Scalability boundary

Flattening all tracks into one output part must not imply an unbounded
whole-song combinatorial solve.

The first read-only whole-source notation simulation became CPU-bound on a
real Oxygene MIDI after flattening. The lightweight reduction audit itself
completed normally.

Therefore downstream notation/rhythm work must remain bounded by measure
and/or small connected constraint component.

## User-facing guide text

> **How MIDI conversion works**
>
> The MIDI converter performs a deterministic piano-roll reduction. All MIDI
> tracks, channels, and instruments are placed onto one shared musical timeline
> and treated as keys of a single piano. The converter does not classify or
> remove percussion, sound effects, or other instruments. If the source MIDI
> contains material that should not appear in the piano reduction, remove it
> before conversion.
>
> No musical material is removed for arrangement or simplification. Only
> duplicate attacks with the same canonical onset and MIDI pitch are collapsed;
> the longest contributor release is retained.

Short UI warning:

> **All MIDI tracks and channels are merged into one piano roll. Nothing is removed automatically. Remove any unwanted material before importing.**

## Real-world evidence

The V2 lightweight audit established that this is a material semantic change,
not a cosmetic refactor.

`oxygene4.mid`:

- 4,409 raw notes;
- old classifier removed 1,745 notes;
- new reduction keeps 4,022 unique piano attacks;
- 387 contributor events collapse as duplicates;
- maximum chord size 8;
- maximum concurrent piano notes 16.

`Jean_Michel_Jarre_OXYGENE4.mid`:

- 4,713 raw notes;
- old classifier removed 1,744 notes;
- new reduction keeps 4,000 unique piano attacks;
- 713 contributor events collapse as duplicates;
- maximum chord size 9;
- maximum concurrent piano notes 15.

`d_HO0606.mid`:

- 706 raw notes;
- old classifier removed 295 notes;
- new reduction keeps 694 unique piano attacks;
- 12 contributor events collapse as duplicates;
- maximum chord size 7;
- maximum concurrent piano notes 9.

`test.mid` remains a clean no-dedup case: 41 raw notes become 41 attacks in one
piano part.

## Triplet work

Triplet-provenance implementation remains paused.

After the global piano-roll reduction is implemented and its real-world smoke
passes, triplet provenance must be re-audited on the new representation before
any triplet fix is designed.

## Decision

`READY_FOR_PHASE14_9C_GLOBAL_PIANO_ROLL_REDUCTION_IMPLEMENTATION`

**DO NOT COMMIT YET.**
