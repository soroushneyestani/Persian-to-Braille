# Phase 16 Pack A — MusicXML Foundation

## Frozen architecture

```text
MusicXML / MXL
    ↓
MusicXML source parser
    ↓
exact divisions-aware rational timing
    ↓
MusicXML semantic adapter
    ↓
existing neutral notation model (+ optional MusicXML print metadata)
    ↓
existing Braille Music engine
```

Pack A does **not** create a second Braille Music engine.

## Model decisions

- `divisions` is input-resolution metadata and is normalized to exact rational quarter-note timing.
- Explicit MusicXML staff, voice, clef and written pitch are preserved rather than reconstructed through the MIDI-only policy.
- Slur and articulation semantics are preserved as optional MusicXML metadata on the existing notation layer.
- Existing MIDI builders remain source-compatible because all new notation fields are optional.
- Existing tie and triplet surfaces are reused.

## Pack A parser scope

- score-partwise
- part-list / score-part / part / measure
- divisions, key, time, clef
- pitch, rest, duration, type, dot, accidental, voice, staff, chord, grace
- tie / tied
- slur
- tuplet / time-modification
- backup / forward
- direction: tempo, dynamics, words
- barline: repeat, ending

Significant unsupported measure children are diagnosed rather than silently discarded.

## XML / MXL safety

- no external DTD resolution
- standard DOCTYPE accepted syntactically
- explicit ENTITY rejected
- no ZIP extraction to disk
- path traversal checks
- member/size/ratio limits
- rootfile resolved through `META-INF/container.xml`

## Next boundary

Pack A stops before the final adapted-event → existing stateful Braille Music serialization bridge.
