# Phase 10.4a — PowerPoint Host Layer

## Status

Implemented as the host-layer half of Phase 10.4.

This subphase adds PowerPoint runtime access, the host adapter, the SDK-facing
selection service, tests, and an architecture validator. It intentionally does
not change the shared task pane or the manifest.

## Frozen host contract

The implementation follows the Phase 10.1/10.2 contract:

```text
Host:                 PowerPoint
Requirement set:      PowerPointApi 1.5
Selection model:      selected-text-range
Translate:            yes
Copy Braille:         yes
Replace:              yes
Insert After:         no
```

PowerPointApi 1.5 remains the minimum because the selected-text APIs,
`TextRange.start`, `TextRange.length`, and navigation from the selected text
range to its parent shape/slide are part of the frozen baseline used by this
repository.

## Selection snapshot

Every successful preview carries this mutation context:

```text
slideId
shapeId
start
length
text
```

The runtime obtains it through:

```text
Presentation.getSelectedTextRangeOrNullObject()
  -> TextRange
  -> TextRange.getParentTextFrame()
  -> TextFrame.getParentShape()
  -> Shape.getParentSlide()
```

No selected text produces a host-domain `SELECTION_UNAVAILABLE` failure.

## Replace semantics

Before writing, the runtime reacquires the current selected text range and
rebuilds the full five-field snapshot.

Mutation is allowed only when all five fields match the preview snapshot
exactly.

A successful write is:

```text
selectedTextRange.text = sdkResult.unicodeBraille
```

A mismatch produces `SELECTION_CHANGED` and performs no write.

A host write exception produces `PRESENTATION_WRITE_FAILED`.

## SDK boundary

The PowerPoint selection service imports only `@persian-braille/sdk`.

The architecture remains:

```text
PowerPoint
  -> Microsoft 365 runtime / adapter / selection service
  -> public SDK
  -> Core
```

The PowerPoint host layer does not import Core directly.

## Insert After

Phase 10 PowerPoint does not expose Insert After.

The MVP does not emulate Word's `Range.insertText("After")` by reconstructing
the selected source text plus Braille because that would actually be a
replacement operation and could alter PowerPoint text formatting semantics.

## Deferred integration

Phase 10.4a does **not** modify:

- `manifest.xml`
- `src/taskpane/main.ts`
- `src/taskpane/readiness.ts`
- `src/taskpane/host-config.ts`
- the shared DOM view/controller

Phase 10.4b will add PowerPoint to the already capability-driven shared task
pane after the host layer is independently green.

## Acceptance gates

1. Microsoft 365 package typecheck.
2. Word + Excel + PowerPoint + task-pane tests.
3. Phase 10.4a PowerPoint host-layer validator.
4. Phase 10.3a Excel host-layer validator.
5. Phase 10.3b Excel task-pane validator.
6. Full Phase 9 Word regression.
7. `git diff --check`.
