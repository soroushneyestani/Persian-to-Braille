# Phase 16.R1 - MusicXML Direction Foundation

R1 closes direction-model silent-loss gaps without adding any new Braille Music cell mapping.

- `sound@tempo`: preserved playback metadata; diagnostic; non-fatal by itself.
- `sound@dynamics`: preserved playback metadata; diagnostic; non-fatal by itself.
- explicit `pp/p/mf/f/ff`: existing frozen Phase 16.5 behavior unchanged.
- arbitrary words: fail closed.
- wedge: structured preservation + `UNSUPPORTED_WEDGE`.
- pedal: structured preservation + `UNSUPPORTED_PEDAL`.
- metronome: structured preservation + `UNSUPPORTED_METRONOME`.
- unknown direction-type: `UNSUPPORTED_DIRECTION_TYPE`.

No second Braille Music engine is introduced. MIDI SDK and Office UI are not modified.
