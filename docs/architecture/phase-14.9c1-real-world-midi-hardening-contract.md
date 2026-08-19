# Phase 14.9c1 â€” Real-world MIDI Hardening Contract

Status: **FROZEN**

This contract is based on the read-only Phase 14.9c audit of four real Standard
MIDI Files. It defines how the project may broaden real-world MIDI compatibility
without silently changing musical meaning.

## Evidence

| MIDI | Notes | Non-center bends | Independent overlaps | Current first blocker |
|---|---:|---:|---:|---|
| test.mid | 41 | 0 | 0 | none |
| oxygene4.mid | 4409 | 1518 | 1040 | UNSUPPORTED_PITCH_BEND |
| Jean_Michel_Jarre_OXYGENE4.mid | 4713 | 0 | 1288 | UNSUPPORTED_POLYPHONY |
| d_HO0606.mid | 705 | 0 | 67 | UNSUPPORTED_POLYPHONY |

Third-party MIDI files are **not** committed. SHA-256 and structural evidence
are the acceptance reference.

## 1. Parser boundary

The SMF parser is a fact-capture layer, not a notation-policy layer.

It must preserve:

- Program Change state per channel;
- pitch-bend events with track, channel, tick, value, and effective program;
- the existing SMF 0/1 + PPQN, running-status, bounds, and malformed-input rules.

The raw parser must no longer reject every non-center pitch bend globally.
Semantic policy is applied only after source-event classification.

## 2. Pitched vs non-pitched classification

The initial non-pitched classes are:

- MIDI channel 10 (zero-based channel 9): percussion;
- GM programs 120â€“128 (zero-based 119â€“127): Reverse Cymbal through Gunshot.

GM Synth FX programs 97â€“104 (zero-based 96â€“103) remain pitched candidates.

Classification is based on the effective program at the note/event onset.
A channel that changes program may therefore contain retained pitched notes and
skipped non-pitched events.

Every skipped source event must be disclosed through diagnostics. Silent
dropping is forbidden.

## 3. Pitch bend

A non-center bend on skipped non-pitched material does not block pitched
transcription and produces `NON_PITCHED_PITCH_BEND_SKIPPED`.

A non-center bend on retained pitched material remains
`UNSUPPORTED_PITCH_BEND`.

Phase 14 does **not** flatten real pitched bends into fixed notes.

## 4. Composite rhythm

The frozen 96-unit notation grid remains unchanged.

The hardening removes the artificial requirement that every source note must
map to one atomic duration. A positive measure-bounded interval may be
decomposed into multiple supported durations joined by derived ties.

If an interval requires correction, the maximum correction remains 6 notation
units. Deterministic choice:

1. minimum absolute correction;
2. on an exact tie, the shorter representable interval.

Corrections emit `RHYTHM_QUANTIZED`.

Existing triplet fail-closed grouping is preserved.

## 5. Overlap and polyphony

Equal quantized onsets remain chords.

Independent overlap remains fail-closed until standards-backed **Music Braille
in-accord** support is added. It must not be faked by turning derived voices
into unrelated newline source parts.

Short-overlap/legato trimming is **not** enabled by this contract. MIDI duration
alone does not prove whether an overlap is articulation or an independent
voice.

Before genuine polyphony is implemented, the BANA in-accord rule surface and
its conformance fixtures must be extended explicitly, including the treatment
of transcriber-added rests.

## 6. Meter changes

The notation layer may retain time-signature changes that land on a derived
measure boundary.

The current bridge still supports only the initial meter. A later hardening
step may serialize measure-boundary meter changes; mid-measure changes remain
rejected.

Key-signature changes after tick 0 remain fail-closed in this tranche because
none of the four acceptance files requires widening that scope.

## 7. Implementation order

H1. Parser metadata + non-pitched classification + scoped pitch-bend policy.
H2. Composite rhythm quantization + tied decomposition.
H3. Re-audit the same four real files and measure the remaining blockers.
H4. BANA in-accord source/conformance extension, then genuine polyphony.
H5. Measure-boundary meter-change serialization.
H6. Real Word/Windows acceptance.

## 8. Non-negotiable integrity rules

- no silent note dropping;
- no silent pitched-bend flattening;
- no invented hand assignment;
- no invented original voice numbering;
- no fake polyphony as newline source parts;
- success diagnostics must disclose lossy reconstruction;
- Microsoft365 continues to consume only the public SDK;
- MusicXML remains outside Phase 14 and reserved for Phase 19.

## Next

**H1 â€” parser metadata + classification + scoped pitch-bend policy.**
