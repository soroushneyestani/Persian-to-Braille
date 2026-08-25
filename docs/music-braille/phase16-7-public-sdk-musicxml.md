# Phase 16.7 — Public SDK Integration

## Decision

The public SDK exposes **two independent music entry points**:

```ts
createMusicBrailleMidiTranslator()
createMusicBrailleMusicXmlTranslator()
```

There is no `translateMusicFile()` façade and no automatic cross-format routing.

This is intentional. Microsoft 365 Phase 16.8 will expose **Music MIDI** and
**MusicXML** as separate tabs.

## MIDI public surface

The existing MIDI SDK remains unchanged and compatibility-protected:

- `.mid` / `.midi`
- source-line inspection and selection
- `translateMidi`
- `translateMidiLine`
- throwing variants
- existing MIDI profile/result/error contract

The legacy `musicXml: "reserved-for-phase-19"` property in the MIDI profile is
retained byte-for-byte for compatibility. It is historical metadata only and
does not merge the MusicXML API into MIDI.

## MusicXML public surface

The new factory is:

```ts
const translator =
  createMusicBrailleMusicXmlTranslator();
```

It exposes:

```ts
translator.translateMusicXml(bytes)
translator.translateMusicXmlOrThrow(bytes)

await translator.translateMxl(bytes)
await translator.translateMxlOrThrow(bytes)
```

Accepted file families for the future MusicXML tab are:

- `.musicxml`
- `.xml`
- `.mxl`

The SDK does **not** expose MusicXML engine trace, engine profile internals, or
ZIP internals. It projects stable public parts, BRF, Unicode Braille,
diagnostics, structured failures, and the SDK-owned error class.

## Engine invariant

Both SDK surfaces converge internally on the same existing Braille Music engine:

```text
MIDI --------------------\
                          -> existing Braille Music engine
MusicXML / MXL ----------/
```

No second Braille Music engine is introduced.

## Microsoft 365 boundary

Phase 16.7 does not modify the Office UI.

Phase 16.8 must preserve two distinct taskpane features:

```text
Music MIDI
MusicXML
```

The MIDI tab keeps source-line selection. The MusicXML tab does not inherit that
MIDI-specific control.
