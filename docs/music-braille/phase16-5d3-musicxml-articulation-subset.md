# Phase 16.5D3 - MusicXML Articulation Subset

## Authoritative source

Braille Authority of North America, *Music Braille Code, 2015*.

The direct-source audit verified Table 22(A) and section 22.1.

Frozen mappings:

- MusicXML `staccato` -> BRF `8`
- MusicXML `staccatissimo` -> BRF `,8`
- MusicXML `accent` -> BRF `.8`
- MusicXML `tenuto` -> BRF `_8`

BANA requires these note-expression/articulation signs before the affected note,
before any accidental and before any octave mark.

## Initial executable scope

Phase 16.5D3 intentionally accepts exactly one supported articulation on a
note or on the base MusicXML note of a chord.

It does not infer or combine articulation semantics.

The following remain fail-closed:

- more than one articulation on the same event;
- articulation attached to a rest;
- articulation attached only to a `<chord/>` continuation member;
- `strong-accent`;
- `detached-legato`;
- other MusicXML articulation children;
- BANA doubling of articulation signs across four or more successive notes.

Existing MIDI behavior remains unchanged because the new stateful event field is
optional.

H4C, H4D, triplet behavior, ties and written-pitch preservation remain unchanged.
