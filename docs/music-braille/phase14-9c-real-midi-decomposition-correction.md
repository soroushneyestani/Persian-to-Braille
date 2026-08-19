# Phase 14.9c — Real MIDI Duration-Decomposition Correction

## Status

Discovered during real Microsoft Word / Windows validation with a valid external
Standard MIDI File.

This is a Phase 14.9c live-validation blocker correction. It is not a new
feature and does not change the frozen Music Braille rule profile.

## Root cause

`decomposeExactDurationUnits()` documented a greedy **longest-value**
decomposition policy but iterated `DURATION_TABLE` in declaration order.

The declaration order is not strictly descending by duration. In particular:

```text
half-triplet       = 128 units
dotted-quarter     = 144 units
```

Because `half-triplet` appeared before `dotted-quarter`, an exact 144-unit
dotted quarter could be decomposed incorrectly as:

```text
128 + 16
half-triplet + sixteenth-triplet
```

The MIDI-to-Braille bridge then correctly refused to invent a triplet group
from that false two-event run and returned:

```text
UNSUPPORTED_MUSIC_BRAILLE_CONSTRUCT
```

## Correction

Exact-duration decomposition now derives a local decomposition table sorted by
`duration.units` descending before applying the existing greedy algorithm.

Therefore an exact 144-unit span remains:

```text
dotted-quarter
```

rather than being fragmented into smaller triplet-valued durations.

The quantization table itself is not reordered. MIDI quantization semantics,
equal-distance tie-breaking, the 96-unit notation grid, and the supported
rhythmic vocabulary remain unchanged.

## Regression

A notation regression test now requires a 144-unit source note to remain one
atomic `dotted-quarter` with no derived tie fragments.

Existing complete-triplet regression tests remain responsible for proving that
real groups of three supported triplet-duration events still receive one
triplet indicator.

## Live gate

Phase 14.9c must be re-run in real Word on Windows after this correction.

No live PASS is claimed by this document.

MusicXML remains outside Phase 14 and reserved for Phase 19.
