# Phase 14.9c H4D — Part-Measure In-Accord Contract

Status: **FROZEN**

Profile:

`GENERIC_MIDI_INCOMPLETE_MEASURE_PART_IN_ACCORD_V1`

## Authoritative rule surface

Music Braille Code 2015 §11.1.2 defines part-measure in-accord.

A measure may be divided into isolated sections. A measure-division sign stands
between sections without spaces, and the part-measure in-accord sign joins the
parts of one section.

Every side of one part-measure in-accord section must contain exactly the same
total note value.

Only the part-measure form may be used for an incomplete measure.

The frozen signs are:

- part-measure in-accord: `"1`
- measure division: `.k`
- full-measure in-accord: `<>`

The first note after an in-accord or measure-division sign requires an octave
mark.

Part-measure in-accord may occur inside full-measure in-accord, but a
part-measure in-accord may not itself be subdivided.

## H4D generic MIDI scope

H4D intentionally starts narrower than the full §11.1.2 surface.

The first implementation handles only a **terminal incomplete measure of one
source part** when H4C has derived two or more independent actions.

One isolated section spans:

`measure start -> last corrected retained content boundary`

and must end before the nominal full-measure end.

Each H4C-derived action is padded with exact rests so that every side has the
same section duration.

Reconstruction-added rests retain the existing dot-5 policy and diagnostic:

`TRANSCRIBER_ADDED_IN_ACCORD_REST`

Action partition, high-to-low canonical MIDI ordering, same-onset chord
membership, shared-boundary rhythm coherence, and the complete exact
decomposition baseline all remain unchanged.

A complete polyphonic measure continues to use H4C full-measure in-accord.

## Section serialization

The initial H4D profile has exactly one section, therefore it emits no
measure-division sign:

`action1 "1 action2 ["1 actionN ...]`

with no spaces around the in-accord sign.

The first note after each `"1` is forced to carry an octave mark.

The `.k` measure-division primitive is frozen now, but arbitrary multi-section
division is not authorized by this first generic MIDI profile.

## Accidentals

BANA §11.2 states that accidentals do not carry across a measure-division or
in-accord sign.

H4D therefore restarts generated accidental state from the active key signature
after those boundaries.

Generic MIDI has no original print accidental-presence information, so this
profile does not claim whether an accidental was visibly restated in the
unavailable print source. A future adapter carrying explicit print semantics
may apply source-aware transcriber-added accidental-restatement handling.

## Fail closed

H4D does not authorize:

- overlap trimming;
- fake newline voices;
- original hand/voice reconstruction claims;
- arbitrary multi-section division;
- subdivision of a part-measure section;
- silent rhythm repair outside the frozen shared-boundary profile.

## Real-world gate

Both Oxygène fixtures must progress beyond their current:

`Polyphony occurs in an incomplete final measure; part-measure in-accord support is required.`

No third-party MIDI bytes are committed.

MusicXML remains outside Phase 14 and reserved for Phase 19.

## Decision

**READY_FOR_PHASE14_9C_H4D_PART_MEASURE_IN_ACCORD_IMPLEMENTATION**
