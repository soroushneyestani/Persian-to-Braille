# Phase 14.7b — MIDI to Braille End-to-End + Public SDK Facade

## Status

Phase 14.7a found no blockers and identified the exact existing runtime chain:

```text
MIDI bytes
  -> parseStandardMidiFile
  -> MidiSemanticSource
  -> buildNotationScore
  -> NotationScore
  -> NotationScore-to-stateful adapter
  -> encodeStatefulScore
  -> BRF + Unicode Braille
  -> @persian-braille/sdk
```

Phase 14.7b materializes that chain without introducing a second parser, notation
model, or Music Braille engine.

## Public SDK boundary

`@persian-braille/sdk` exposes only SDK-owned MIDI Music Braille projections:

- `createMusicBrailleMidiTranslator`
- `MusicBrailleMidiTranslationError`
- public result/profile/diagnostic types from `music-public-api.ts`

Engine types such as `MidiSemanticSource`, `NotationScore`, `StatefulScoreInput`,
`parseStandardMidiFile`, `buildNotationScore`, and `encodeStatefulScore` are not
part of the SDK public surface.

Microsoft 365 remains `Office -> SDK`; it does not import `@persian-braille/music`
directly.

## End-to-end acceptance fixture

The canonical in-memory fixture contains explicit 4/4, explicit C major, and:

```text
C4 quarter
D4 quarter
E4 half
```

Expected result:

```text
BRF     : #d4 "?:p
Unicode : ⠼⠙⠲⠀⠐⠹⠱⠏
```

## MIDI reconstruction profile

The bridge preserves the frozen Phase 14 constraints:

- active non-center pitch bend fails closed;
- center pitch bend is neutral;
- source parts remain separate and are joined only by a documented newline
  transport layout, not by inferred score engraving;
- missing key/time/tempo metadata is diagnostic and is not falsely rendered as
  source notation;
- original enharmonic spelling is not claimed to be recovered;
- triplet duration is only promoted to a triplet indicator when a complete
  group of three can be recovered within a measure;
- incomplete triplet runs fail closed;
- key or meter changes after tick 0 remain unsupported in this initial bridge;
- partial chord ties remain unsupported rather than guessed.

## Package topology

Phase 14.7 extends the internal workspace graph to:

```text
music -> none
core  -> none
sdk   -> core + music
microsoft365 -> sdk
```

`@persian-braille/music` remains private in Phase 14.7. Public package/release
packaging for the music dependency is intentionally deferred to Phase 14.10,
before any Phase 14 release is committed/published.

## Later Phase 14 milestones

- Phase 14.8: Word Music Task Pane, MIDI file picker, options, preview.
- Phase 14.9: insert into Word + Windows live validation.
- Phase 14.10: regression, documentation, public packaging/release, Phase 14 closure.
- MusicXML: Phase 19.
