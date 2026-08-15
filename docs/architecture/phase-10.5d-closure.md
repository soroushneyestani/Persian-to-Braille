# Phase 10.5d — Sideload / Regression / Cross-host Evidence Closure

## Status

**CLOSED**

Closure date:

```text
2026-08-15
```

Phase 10.5 is complete.

## 10.5a — Multi-host manifest

Status:

```text
CLOSED
```

The add-in-only XML manifest was corrected to the schema-valid architecture:

```text
OfficeApp
  Hosts
    Document
    Workbook
    Presentation

VersionOverridesV1_0
  Requirements
    AddinCommands 1.1

  Hosts
    Document
    Workbook
    Presentation
```

Host-specific API baselines remain runtime gates:

```text
WordApi       1.1
ExcelApi      1.1
PowerPointApi 1.5
```

The official Microsoft manifest validator result is preserved in:

```text
docs/architecture/phase-10.5a-office-manifest-validation.txt
```

Result:

```text
The manifest is valid.
```

## 10.5b — Windows live sideload

Status:

```text
CLOSED
```

All three Microsoft 365 desktop hosts were actually sideloaded and executed on
Windows:

```text
Word        LIVE VERIFIED / PASS
Excel       LIVE VERIFIED / PASS
PowerPoint  LIVE VERIFIED / PASS
```

Each host completed the debugging lifecycle and was cleaned up with
`office-addin-debugging stop`.

Evidence:

```text
docs/architecture/phase-10.5b-windows-live-sideload-evidence.json
docs/architecture/phase-10.5b-windows-live-sideload-evidence.md
```

## 10.5c — Cross-host regression

Status:

```text
CLOSED
```

The final automated snapshot remained:

```text
Microsoft365 tests   69
pass                 69
fail                 0
```

The full Phase 9 Word regression also remained green.

Evidence:

```text
docs/architecture/phase-10.5c-cross-host-regression-evidence.md
```

## Final Windows host contract

| Host | API baseline | Replace | Insert After | Live Windows |
|---|---|---:|---:|---|
| Word | WordApi 1.1 | yes | yes | VERIFIED / PASS |
| Excel | ExcelApi 1.1 | yes | no | VERIFIED / PASS |
| PowerPoint | PowerPointApi 1.5 | yes | no | VERIFIED / PASS |

Protection behavior:

```text
Word
  stale selection
    -> SELECTION_CHANGED

Excel
  multi-cell selection
    -> SELECTION_SHAPE_UNSUPPORTED
  formula cell
    -> SELECTION_CONTENT_UNSUPPORTED
  stale cell snapshot
    -> SELECTION_CHANGED

PowerPoint
  stale selected-text snapshot
    -> SELECTION_CHANGED
```

## Platform claim boundary

Phase 10.5 closes only the Windows real-client verification scope.

These remain:

```text
Web  EXPECTED / NOT EXECUTED
Mac  EXPECTED / NOT EXECUTED
```

No Web or Mac live-pass claim is made by this closure.

## Next phase

```text
Phase 10.6 — Phase 10 Closure
```
