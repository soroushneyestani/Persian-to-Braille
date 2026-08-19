# Phase 14.9c — Scalable Task-Pane Feature Tabs

## Purpose

The live Word validation exposed a task-pane information-architecture issue:
Persian / English text translation and MIDI Music Braille were displayed as one long
vertical surface.

The task pane now has a feature-tab shell directly inside the application
header.

Current tabs:

- `Persian / English`
- `Music / MIDI` — Word only

The Microsoft Office-owned task-pane title bar itself cannot be modified by the
add-in. The custom tab strip therefore sits immediately below the application
title inside the hosted HTML surface.

## Future extensibility

The tab controller is intentionally feature-oriented rather than tied to the
current product name.

The existing text translator already includes the `fa-ir-g1` Latin-span
machinery used for ordinary uncontracted six-dot English/Latin text inside the
same translation surface. The visible text tab is therefore labeled
`Persian / English`.

This label does **not** claim a separate contracted UEB / English Grade-2
implementation. A future fully independent English standard profile, German
Braille profile, or other language profile can still be added as its own
feature surface without changing the Music controller.

## State preservation

Tab switching uses a CSS visibility class rather than overwriting the existing
`hidden` state owned by translation-result and error controllers. A hidden
Persian preview remains hidden after switching away and back.

## Host behavior

`Music / MIDI` is visible only when the live host is Word. Excel and PowerPoint
continue to expose the Persian / English text surface only.

## Architecture

The feature-tab controller is UI-only and does not import Core, Music, or SDK
packages. Translation and insertion semantics are unchanged.

MusicXML remains outside Phase 14 and reserved for Phase 19.
