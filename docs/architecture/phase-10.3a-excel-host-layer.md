# Phase 10.3a — Excel Host Layer

## Status

**EXCEL HOST LAYER IMPLEMENTED — TASK PANE WIRING STILL PENDING**

This patch is the first implementation slice inside Phase 10.3.

It deliberately adds the Excel object-model boundary and Excel selection
translation service before changing the live Phase 9 Word task pane.

That ordering keeps the verified Word user path stable while the Excel
semantics receive direct unit coverage.

## Architecture

```text
Specification -> Core -> SDK
                         ↑
            Microsoft 365 shared types
                         ↑
                  Excel service
                         ↑
                  Excel adapter
                         ↑
                  Excel runtime
```

The Excel layer depends on the public SDK for translation and uses local narrow
Office.js ports for host interaction.

No `office-js` type/runtime package is added.

## Excel runtime

The runtime uses:

```text
Excel.run()
Workbook.getSelectedRange()
Range.load()
Range.address
Range.rowCount
Range.columnCount
Range.values
Range.formulas
Range.valueTypes
context.sync()
```

Minimum requirement:

```text
ExcelApi 1.1
```

## Selection admission

The Phase 10 MVP accepts only:

```text
one selected cell
RangeValueType.String
non-formula content
```

Multi-cell, non-text, and formula selections fail before translation.

The source sent to the SDK is the raw string value, without trimming or Office
normalization.

## Formula protection

`Range.formulas` returns the formula when a formula exists and the cell value
otherwise.

A formula projection beginning with `=` is rejected.

This intentionally also rejects a rare plain-text cell whose raw stored text
starts with `=`. That is a conservative safety restriction for the Phase 10 MVP
and avoids risking destructive formula replacement.

## Stale-preview protection

A preview stores:

```text
address
rowCount
columnCount
valueType
rawValue
formulaProjection
```

Replace re-reads the current selection inside a fresh `Excel.run()` batch and
requires exact equality across the full snapshot.

A mismatch returns:

```text
SELECTION_CHANGED
```

## Replace

On a valid unchanged cell, Replace writes only:

```text
[[sdkResult.unicodeBraille]]
```

to `Range.values`.

The Braille output does not start with Excel formula markers and no
Office-specific mapping or normalization is performed.

## Insert After

Excel Insert After remains unsupported in the Phase 10 MVP, as frozen in
Phase 10.2.

No Excel method is invented to imitate Word `Range.insertText`.

## Word regression boundary

This patch does not modify:

```text
src/word/*
src/taskpane/*
manifest.xml
public/taskpane.html
```

Therefore the live Phase 9 Word composition remains untouched in 10.3a.

The full Microsoft 365 package test still executes the 33 existing Word/taskpane
tests in addition to the new Excel host-layer tests.

## Next

**Phase 10.3b — Shared Task Pane Refactor + Excel Host Dispatch**
