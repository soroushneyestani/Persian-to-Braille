# Phase 14.8b — Word Music Task Pane, MIDI File Picker, and Preview

## Status

Implemented after the Phase 14.8a baseline audit reported no blockers.

## Workflow

```text
Choose .mid / .midi
  -> browser File.arrayBuffer()
  -> @persian-braille/sdk
  -> createMusicBrailleMidiTranslator()
  -> Unicode Music Braille preview
```

The MIDI file remains local to the task pane. Phase 14.8 adds no upload,
network transport, localStorage, sessionStorage, or other MIDI persistence.

## Host boundary

The existing Microsoft 365 task pane remains shared across Word, Excel, and
PowerPoint for Persian text translation. The Braille Music section is enabled
only for Word. Excel and PowerPoint do not expose the Music UI.

Microsoft365 source imports only `@persian-braille/sdk`. The browser build may
materialize `@persian-braille/music` only as the SDK transitive dependency.

## Browser dependency closure

```text
vendor/core
vendor/music
vendor/sdk
```

## Preview contract

The Word Music pane displays the selected MIDI filename, Unicode Music Braille,
BRF/Braille-ASCII, diagnostics, and SDK-owned failure information.

Canonical acceptance fixture:

```text
BRF     : #d4 "?:p
Unicode : ⠼⠙⠲⠀⠐⠹⠱⠏
```

## Deferred

- Music Braille insertion into Word: **Phase 14.9**.
- Windows live file-picker / preview / insertion acceptance: **Phase 14.9**.
- Music package publication/release closure: **Phase 14.10**.
- MusicXML: **Phase 19**.
