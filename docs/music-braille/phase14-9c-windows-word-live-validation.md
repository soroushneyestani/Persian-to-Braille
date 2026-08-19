# Phase 14.9c — Windows Word live validation

## Status

**PENDING REAL WINDOWS EXECUTION — NO PASS CLAIM YET.**

This checklist must be executed against Microsoft Word for Microsoft 365 on
Windows after Phase 14.9b is green.

## Sideload

Use the existing multi-host add-in manifest and select Word:

```powershell
pnpm dlx office-addin-debugging start integrations/microsoft365/manifest.xml desktop
```

After the verification session:

```powershell
pnpm dlx office-addin-debugging stop integrations/microsoft365/manifest.xml
```

## Required live acceptance

Record each item as PASS or FAIL only after observing it in the actual Word
desktop host:

```text
[ ] Word desktop opens with the add-in sideloaded
[ ] Task pane opens from the existing ribbon command
[ ] Braille Music section is visible in Word
[ ] .mid picker accepts a MIDI file
[ ] .midi picker accepts a MIDI file
[ ] Canonical MIDI preview equals: ⠼⠙⠲⠀⠐⠹⠱⠏
[ ] Insert Music Braille becomes enabled only after successful preview
[ ] With selected text: Insert Music Braille replaces the selection exactly
[ ] With a collapsed caret: Insert Music Braille inserts the exact preview
[ ] Insertion does not cause a second MIDI translation
[ ] Invalid MIDI keeps insertion unavailable
[ ] A write failure is surfaced as a host-domain failure
```

The exact canonical preview used in the Phase 14.7/14.8 automated fixtures is:

```text
BRF     : #d4 "?:p
Unicode : ⠼⠙⠲⠀⠐⠹⠱⠏
```

## Cross-host regression boundary

Phase 14.9c must not claim new Music support for Excel or PowerPoint. Their
existing Persian-text behavior remains unchanged.

## Evidence policy

Automated tests are not a substitute for this live Word/Windows execution.

Do not change this document to VERIFIED/PASS until the live checks have
actually been performed.

MusicXML remains reserved for Phase 19.
