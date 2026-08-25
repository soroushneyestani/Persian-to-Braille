# Phase 16.8 — Microsoft 365 Separate MusicXML Tab

## Decision

Microsoft 365 exposes two independent Word-only music feature tabs:

- **Music / MIDI** — `.mid`, `.midi`
- **MusicXML** — `.musicxml`, `.xml`, `.mxl`

They are intentionally separate at the UI and public-SDK boundaries.

## MIDI tab

The existing MIDI task pane remains compatibility-protected. It keeps MIDI file
selection, MIDI source-line inspection/selection,
`createMusicBrailleMidiTranslator()`, and the existing Word insertion service.

## MusicXML tab

The new MusicXML task pane owns `.musicxml`, `.xml`, and `.mxl` file selection,
`createMusicBrailleMusicXmlTranslator()`, preview/diagnostics, fail-closed SDK
errors, and insertion of the exact successful Unicode Music Braille preview.

It has no MIDI source-line selector.

## Shared engine boundary

```text
Music MIDI tab -> MIDI SDK -----------\
                                       -> existing Braille Music engine
MusicXML tab   -> MusicXML/MXL SDK ----/
```

There is no unified music picker and no `translateMusicFile()` facade.

## Host behavior

Both music tabs are Word-only. Leaving Word while either music tab is active
returns feature-tab state safely to Persian and hides both music tabs.

## Closure validation

Phase 16.8 requires the existing MIDI pane regression, new MusicXML pane tests,
feature-tab/accessibility regression, exact static HTML separation, full
Microsoft 365 regression, full SDK regression, full Phase 16 MusicXML/MXL
regression including Beethoven, package-boundary validation, typecheck/build,
git diff checks, and zero staged changes.
