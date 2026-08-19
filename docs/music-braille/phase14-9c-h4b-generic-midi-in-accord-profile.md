# Phase 14.9c H4B — Generic MIDI In-Accord Profile

Status: **FROZEN**

Profile:

`GENERIC_MIDI_HIGH_TO_LOW_IN_ACCORD_V1`

BANA defines in-accord ordering differently for print-defined treble and bass
parts. Standard MIDI does not preserve the original print staff, hand, or stem
direction, so this translator must not claim that those properties were
recovered.

H4B therefore freezes a canonical generic-MIDI ordering, not an original staff
assignment.

Notes with the same quantized onset remain a chord. Their tones are not split
merely to manufacture voices.

Derived action partitioning is performed independently for each source
track/channel and derived measure. Onset-groups are processed by start unit
ascending, highest MIDI pitch descending, then end unit descending.

An onset-group reuses an available action when that action's prior event ends
no later than the new onset. When several actions are available, preference is
smallest anchor-pitch distance, then most recent prior end, then lowest stable
derived action index. A new action is created only when every existing action
is still sounding.

This is disclosed as:

`INFERRED_MIDI_VOICE_PARTITION`

No original voice numbering is claimed.

Because staff identity is unavailable, the canonical H4B action order is
**highest to lowest**. The anchor is the highest MIDI pitch of the first
sounding event within the measure. Ties use the highest pitch encountered in
the measure and then the stable derived action index.

This is disclosed as:

`IN_ACCORD_ORDER_CANONICALIZED_NO_STAFF`

The profile does not claim that the source was a treble staff.

H4C initially implements only complete derived measures using full-measure
in-accord `<>`. Every derived action must total exactly one full measure.

Gaps are filled with rests. Because these rests are introduced by
reconstruction rather than being literal source notes, they require the BANA
dot-5 prefix and emit:

`TRANSCRIBER_ADDED_IN_ACCORD_REST`

The first note after an in-accord sign requires an octave mark.

H4C must not trim overlaps, claim original hands or voice numbers, create fake
newline source parts, or omit dot-5 from an added in-accord rest.

If polyphony occurs in an incomplete measure that cannot be expressed by the
full-measure profile, translation remains fail-closed until part-measure
in-accord support exists.

MusicXML remains outside Phase 14 and reserved for Phase 19.
