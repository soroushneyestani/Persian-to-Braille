# Phase 14.9c H5 — Measure-Boundary Meter-Change Serialization Contract

Status: **FROZEN**

Profile:

`MBC_MEASURE_BOUNDARY_METER_CHANGE_V1`

## Authoritative rule surface

Music Braille Code 2015 §7.1 requires a meter signature to be placed where the
meter changes, preferably with the following note. The first note after a meter
signature requires an octave mark.

The project already has frozen numeric simple-meter serialization.

MIDI `4/4` is not inferred as common time, and MIDI `2/2` is not inferred as
cut time.

## H5 boundary

The notation builder already requires time-signature changes to occur at a
derived measure boundary.

H5 does not weaken that rule.

A mid-measure change remains fail-closed.

At the beginning of a measure whose effective numerator/denominator differs
from the preceding measure, the stateful bridge/encoder emits the new simple
numeric meter before the first musical event.

The next note is forced to carry an octave mark.

A repeated source time-signature event that does not change the effective meter
does not emit a redundant meter signature.

If a key and meter signature occupy the same score position, key precedes
meter. Phase 14 still keeps key changes after tick 0 fail-closed.

## Existing behavior preserved

- initial meter serialization remains unchanged;
- supported denominator set remains `1,2,4,8,16,32,64`;
- no new Braille digit/cell mapping is invented;
- measure boundaries still reset measure-scoped accidentals;
- combined meters remain deferred.

Successful mid-score meter serialization is disclosed with:

`METER_CHANGE_SERIALIZED`

## Real-world gate

`d_HO0606.mid` contains a boundary-aligned change:

`4/4@0u -> 12/8@768u`

corresponding to source tick 3072.

After H5, the file must progress beyond the current bridge error, serialize
12/8 numerically, and force an octave mark on the next note.

No third-party MIDI bytes are committed.

MusicXML remains outside Phase 14 and reserved for Phase 19.

## Decision

**READY_FOR_PHASE14_9C_H5_METER_CHANGE_SERIALIZATION_IMPLEMENTATION**
