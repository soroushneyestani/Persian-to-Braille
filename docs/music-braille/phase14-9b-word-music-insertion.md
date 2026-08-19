# Phase 14.9b — Word Music Braille insertion

## Status

**IMPLEMENTED — pending real Windows Word live validation in Phase 14.9c.**

Phase 14.9b extends the Word-only Music Braille task pane from preview to
document insertion.

## Frozen insertion contract

The insertion source is the exact successful Unicode Music Braille preview
already returned by the public SDK:

```text
successful MIDI preview
  -> unicodeBraille
  -> Word Music insertion service
  -> current Word selection/caret
```

The insertion action does **not**:

- parse the MIDI file again;
- rebuild `NotationScore`;
- call the Music Braille engine again;
- call the public Music translator again;
- import `@persian-braille/music` from Microsoft365 source.

## Word write

The Office.js operation is:

```text
Word.run
  -> context.document.getSelection()
  -> range.insertText(unicodeBraille, "Replace")
  -> context.sync()
```

For a non-collapsed Word selection, the selected content is replaced by the
exact preview. For a collapsed selection, `Replace` inserts at the caret.

The Persian-text stale-selection contract is intentionally not reused. A MIDI
file is the source of the Music Braille preview, not Word selection text.

## Failure projection

The dedicated insertion service keeps Word host failures in the host domain:

```text
OFFICE_NOT_READY
WRONG_HOST
UNSUPPORTED_REQUIREMENT_SET
DOCUMENT_WRITE_FAILED
```

An expected host failure does not erase or recompute the successful Music
Braille preview.

## Host scope

- Word: Music preview + insertion.
- Excel: Persian text flow only; Music remains excluded.
- PowerPoint: Persian text flow only; Music remains excluded.

## Manifest

No manifest mutation is required.

The shared multi-host base manifest continues to use:

```text
Document + Workbook + Presentation
ReadWriteDocument
```

Application-specific API baselines remain runtime-gated.

## Next gate

Phase 14.9c performs **real Microsoft Word for Windows live validation**.

No live PASS claim is made by Phase 14.9b.

MusicXML remains reserved for **Phase 19**.
