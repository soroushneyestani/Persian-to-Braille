# Phase 14.9c H4D — Part-Measure In-Accord Implementation

Status: **IMPLEMENTED / REAL-WORLD SMOKE GATED**

Profile:

`GENERIC_MIDI_INCOMPLETE_MEASURE_PART_IN_ACCORD_V1`

## Preserved H4C behavior

`GENERIC_MIDI_HIGH_TO_LOW_IN_ACCORD_V1` still provides full-measure in-accord
only.

An H4C-only caller continues to fail closed for incomplete polyphonic measures.

H4D is an additional explicit notation-builder opt-in used by the production
MIDI bridge.

## Implemented H4D scope

The first H4D implementation handles a terminal incomplete measure as one
isolated part-measure section.

The section begins at the derived measure start and ends at the last corrected
retained source-content boundary.

Every H4C-derived action is padded with exact transcriber-added rests until all
actions total the same section duration.

The existing shared-boundary rhythm solver participates in the incomplete
section. It does not independently round H4D rests.

## Signs and state

Part-measure in-accord uses:

`"1`

The measure-division primitive is materialized as:

`.k`

but the initial single-section profile does not emit `.k`.

The first note of every recursively encoded action receives an octave mark.

Accidental state restarts from the active key-signature state for each action,
so accidental state does not leak across the part-measure in-accord sign.

## Diagnostics

Successful derivation is disclosed with:

`PART_MEASURE_IN_ACCORD_DERIVED`

Existing reconstruction diagnostics remain:

- `INFERRED_MIDI_VOICE_PARTITION`
- `IN_ACCORD_ORDER_CANONICALIZED_NO_STAFF`
- `TRANSCRIBER_ADDED_IN_ACCORD_REST`
- `RHYTHM_BOUNDARY_COHERENCE_QUANTIZED` when a boundary correction is needed.

No original print sectioning, staff, hand, or voice numbering is claimed.

## Still fail closed

This implementation does not authorize arbitrary multi-section division,
nested part-measure subdivision, overlap trimming, fake newline voices, or a
wider rhythm tolerance.

H4C complete measures continue to use full-measure in-accord `<>`.

MusicXML remains outside Phase 14 and reserved for Phase 19.
