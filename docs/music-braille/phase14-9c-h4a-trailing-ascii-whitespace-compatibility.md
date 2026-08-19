# Phase 14.9c H4A — Terminal ASCII Whitespace Compatibility

Status: **IMPLEMENTED**

The frozen H4 compatibility policy permits a very narrow suffix after all
header-declared SMF track chunks.

Accepted trailing bytes are TAB `09`, LF `0A`, CR `0D`, and SPACE `20`.

The complete suffix must contain only those bytes, be no longer than 64 bytes,
and occur only after all declared track chunks have ended.

Accepted suffix bytes are not parsed as MIDI and have no musical semantics.

A successful parse exposes:

`TRAILING_ASCII_WHITESPACE_IGNORED`

Any non-whitespace trailing byte, any suffix longer than 64 bytes, or an extra
`MTrk` chunk beyond the header-declared track count remains
`INVALID_MIDI_FILE`.

This compatibility rule exists because the real
`Jean_Michel_Jarre_OXYGENE4.mid` fixture contains exactly two terminal LF
bytes (`0A 0A`) after its declared tracks.
