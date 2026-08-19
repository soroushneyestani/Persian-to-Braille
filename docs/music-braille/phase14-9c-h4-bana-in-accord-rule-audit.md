# Phase 14.9c H4 — BANA In-Accord Rule Audit and Trailing-Data Policy

Status: **FROZEN**

## Authoritative source

The rule surface is taken from *Music Braille Code 2015*:

- Table 11, PDF page 32 / print page 8;
- §11.1 and §11.1.1, PDF page 111 / print page 87;
- §11.1.2, PDF page 112 / print page 88;
- §11.1.2–11.1.4, PDF page 113 / print page 89.

This file records a concise implementation contract rather than reproducing the
source text.

## Table 11 signs

| Construct | BRF |
|---|---|
| Full-measure in-accord | `<>` |
| Part-measure in-accord | `"1` |
| Measure division | `.k` |

## Frozen in-accord rules

Two or more simultaneous independent actions that cannot be expressed as one
chord are represented successively and joined by an in-accord sign without
intervening spaces.

For print-defined treble parts, in-accord actions are ordered from highest to
lowest. For print-defined bass parts, they are ordered from lowest to highest.

The first note after an in-accord or measure-division sign requires an octave
mark. A measure following a measure that ends in an in-accord likewise starts
with an octave mark.

A full-measure in-accord requires every side to contain a complete measure of
note values. An implied rest added by the transcriber is permitted for this
purpose, but the added rest must be explicitly preceded by dot 5.

A part-measure in-accord requires equal total note value on every side of the
section. Measure-division signs separate sections. An incomplete measure may
use only the part-measure form.

A part-measure in-accord may occur inside a full-measure in-accord, but a
part-measure in-accord cannot be subdivided again.

Print stem direction may help determine ordering for crossed voices. MIDI does
not preserve print stem direction.

## MIDI reconstruction consequence

Equal quantized onsets remain chords.

Independent-onset overlap is a valid candidate for Music Braille in-accord,
but H4 does **not** yet authorize arbitrary voice inference. Standard MIDI
track/channel identity does not preserve print staff or hand identity, while
the authoritative rule distinguishes treble and bass ordering.

The first implementation target is full-measure in-accord for complete derived
measures, with explicitly marked dot-5 transcriber-added rests when needed to
equalize the sides.

The following remain forbidden:

- silent overlap trimming;
- invented original hand assignment;
- invented original voice numbering;
- newline-separated source parts used as fake polyphony;
- unmarked transcriber-added rests.

## Jean-Michel trailing bytes

`Jean_Michel_Jarre_OXYGENE4.mid` ends its 14 declared track chunks at byte
35228, while the file length is 35230. The only remaining bytes are:

```text
0A 0A
```

They are two ASCII line-feed bytes outside all declared SMF chunks.

The frozen compatibility policy is intentionally narrow:

- accept only terminal ASCII whitespace after all declared track chunks;
- allowed bytes: TAB `09`, LF `0A`, CR `0D`, SPACE `20`;
- maximum accepted suffix: 64 bytes;
- emit `TRAILING_ASCII_WHITESPACE_IGNORED`;
- do not interpret the suffix as MIDI;
- any other trailing data remains `INVALID_MIDI_FILE`;
- an extra `MTrk` beyond the header-declared track count remains invalid until
  separately specified.

## H3 evidence

- `oxygene4.mid`: 896 independent pitched overlaps;
- `Jean_Michel_Jarre_OXYGENE4.mid`: 1120 independent pitched overlaps;
- `d_HO0606.mid`: 9 independent pitched overlaps;
- `d_HO0606.mid` changes 4/4 → 12/8 at a valid measure boundary.

## Gates

**H4A** parser terminal-whitespace compatibility is ready for implementation.

**H4B** in-accord reconstruction still requires one explicit generic-MIDI
profile decision: how to choose the BANA treble/bass ordering direction when
the MIDI source does not preserve print staff/hand semantics.

H5 measure-boundary meter serialization remains ready after the polyphony gate.

MusicXML remains outside Phase 14 and reserved for Phase 19.
