# Phase 14.9c — Single Source Line MIDI Profile

## Status

**Implemented for the Phase 14 Word product path.**

Real-world Oxygène isolation showed that 12 of 13 source parts reach notation
success when isolated. The line with the longest sustained note (27 quarter
notes) also succeeds in isolation, so long sustain is not the leading blocker.
The one isolated Oxygène failure is a dense channel-10 line containing 1695
very short note events.

Rather than spend the Phase 14 closure tranche on unbounded multi-line solver
hardening, Word now asks the user to choose exactly one source line.

## Source-line identity

A source line is the stable MIDI pair:

```text
(trackIndex, channel)
```

This is deliberately not physical-track-only. A Standard MIDI File Format 0
file can contain one physical track while exposing several channel-based
musical lines.

## Phase 14 Word workflow

```text
Choose MIDI
  -> inspect source lines
  -> choose exactly one source line
  -> selected line only
  -> deterministic piano-roll reduction
  -> notation / rhythm / in-accord
  -> Music Braille
  -> preview
  -> insert the exact successful preview into Word
```

A one-line MIDI may be selected automatically. Multi-select and `All Lines`
are not exposed in the Phase 14 Word UI.

## Inclusion semantics inside the selected line

The existing piano-roll inclusion rules remain intact inside the selected
line:

- every note event participates;
- channel 10 is not automatically removed;
- program/instrument identity does not remove notes;
- pitch-bend metadata does not alter the underlying discrete MIDI note number;
- duplicate attacks retain the frozen canonical-onset + MIDI-pitch reduction;
- no arrangement, melody extraction, percussion filtering, or AI
  simplification is performed.

The selection layer filters both `source.notes` and `source.parts`. It also
scopes program-change and pitch-bend metadata to the selected track/channel.

## Public SDK and Office boundary

The public SDK exposes source-line inspection and selected-line translation.
Microsoft 365 continues to depend only on the SDK:

```text
Office -> @persian-braille/sdk -> @persian-braille/music
```

Microsoft365 source does not import music-engine internals directly.

Changing the selected line invalidates any previous successful preview, so
Word insertion remains disabled until a new preview succeeds.

## Compatibility

The existing all-lines engine translation function remains available for
regression coverage and future solver hardening. It is not the Phase 14 Word
product workflow.

## Deferred

- Multi-line / All Lines UI: future hardening after Phase 14.
- MusicXML: Phase 19.

**DO NOT COMMIT YET.**
