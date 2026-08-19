# Phase 14.4b — Deterministic Notation Model and Quantization Contract

## Status

Frozen before notation-engine implementation.

This contract refines Phase 14.2b without modifying that historical contract.
It resolves the timing-grid ambiguity found by the Phase 14.4 audit.

## Integer timing grid

Derived notation uses **96 integer notation units per quarter note**.

The project must not use floating-point values as the canonical notation
timeline.

Original MIDI ticks remain preserved separately as source evidence.

The conversion from MIDI tick position to notation units is deterministic:

```text
nearest(tick * 96 / PPQN)
```

Exact half-way cases round forward.

The maximum allowed snap error is:

```text
1/16 quarter note = 6 notation units
```

Any non-zero snap emits `RHYTHM_QUANTIZED`.

If onset or duration cannot be represented inside the frozen tolerance, return:

```text
UNQUANTIZABLE_RHYTHM
```

## Supported rhythmic vocabulary

Base values:

- whole
- half
- quarter
- eighth
- sixteenth
- thirty-second
- sixty-fourth

Single-dotted forms of the supported base values are supported, including the
dotted sixty-fourth.

Initial simple triplet values:

- half-note triplet
- quarter-note triplet
- eighth-note triplet
- sixteenth-note triplet
- thirty-second-note triplet

Sixty-fourth-note triplets and irregular tuplets are deferred.

When two supported duration values are equally near, choose the longer value.

## Why 96 units per quarter

The Phase 14.4 audit found that a 48-unit grid cannot exactly represent a
dotted sixty-fourth:

```text
3/32 quarter * 48 = 4.5
```

A 96-unit grid represents it exactly:

```text
3/32 quarter * 96 = 9
```

The 96-unit grid also keeps the initially supported simple triplet values on an
integer timeline. Canonical notation timing therefore remains exact integer
arithmetic.

## Neutral notation model

The implementation foundation must be able to represent:

- `NotationDiagnostic`
- `NotationDuration`
- `NotationPitchSource`
- `NotationNote`
- `NotationChord`
- `NotationRest`
- `NotationMeasure`
- `NotationPart`
- `NotationScore`
- `NotationBuildFailure`
- `NotationBuildResult`

This notation model is distinct from raw MIDI source structures and from final
Music Braille cells.

## Parts and polyphony

The parser's source-part identity remains:

```text
(trackIndex, channel)
```

The notation foundation preserves that part identity.

It does not infer:

- engraved voice numbers;
- left/right hand;
- staff assignment.

Notes in the same source part with the same quantized onset form one
simultaneous group/chord.

If independently-starting overlapping material would require multiple engraved
voices, return:

```text
UNSUPPORTED_POLYPHONY
```

Do not invent voice structure.

## Rests

Rests are derived from quantized gaps.

Rest duration is decomposed deterministically with longest supported values
first, constrained by measure boundaries.

If an exact supported decomposition cannot be produced, return
`UNQUANTIZABLE_RHYTHM`; do not invent a duration.

## Measures

Use explicit MIDI time-signature metadata when present.

If no time-signature metadata exists, use `4/4` only as an **internal**
measure-construction fallback and emit:

```text
TIME_SIGNATURE_ABSENT
```

The fallback must not be represented as if the MIDI file explicitly contained
a 4/4 marking.

A time-signature change is accepted initially only when it lands on an already
quantized measure boundary. Otherwise return:

```text
UNSUPPORTED_MUSIC_BRAILLE_CONSTRUCT
```

## Notes crossing measure boundaries

A note crossing a derived measure boundary is split into measure-bounded
notation segments.

The segments carry derived tie metadata indicating that they originate from
one continuous MIDI note.

Actual Music Braille tie-cell rendering is deferred to the Music Braille rule
phase.

## Source truthfulness

Source and derived information must remain distinguishable.

The notation layer may derive rhythm, rests, chords, measures, and tie
segmentation, but must retain diagnostics for canonicalization or loss.

No rule in this phase may claim reconstruction of notation that MIDI did not
preserve.

## Non-goals

This phase does not implement:

- Music Braille cell encoding;
- Word task-pane UI;
- public SDK Music Braille API;
- MusicXML;
- sixty-fourth-note triplets;
- irregular tuplets;
- voice inference;
- hand inference.
