# Phase 10.5c — Cross-host Regression Evidence

## Status

**CLOSED — VALIDATED**

Phase 10.5c consolidates the static, automated, manifest, and real-client
evidence for the three Microsoft 365 hosts.

## Cross-host matrix

| Contract | Word | Excel | PowerPoint |
|---|---|---|---|
| Windows live host launch | PASS | PASS | PASS |
| Ribbon command | PASS | PASS | PASS |
| Shared task pane | PASS | PASS | PASS |
| Host readiness gate | WordApi 1.1 | ExcelApi 1.1 | PowerPointApi 1.5 |
| Selection model | text range | one plain-text cell | selected text range |
| Public SDK translation | PASS | PASS | PASS |
| Copy Braille | PASS | PASS | PASS |
| Replace | PASS | PASS | PASS |
| Insert After | PASS | not supported | not supported |
| stale mutation guard | PASS | PASS | PASS |

## Excel-specific protection evidence

```text
SELECTION_SHAPE_UNSUPPORTED    PASS
SELECTION_CONTENT_UNSUPPORTED  PASS
SELECTION_CHANGED              PASS
```

## PowerPoint-specific mutation evidence

```text
Replace selected TextRange     PASS
Insert After unavailable       PASS
SELECTION_CHANGED              PASS
```

## Word regression evidence

Phase 10.5 did not weaken the frozen Phase 9 Word behavior:

```text
Replace Selection              PASS
Insert After                   PASS
SELECTION_CHANGED              PASS
```

## Automated regression snapshot

At live verification time:

```text
Microsoft365 tests   69
pass                 69
fail                 0
```

The full Phase 9 Word regression also remained green.

## Manifest evidence

The single add-in-only XML manifest declares:

```text
Document
Workbook
Presentation
```

and passed the official Microsoft manifest validator before live execution.

The manifest intentionally carries only the shared command requirement:

```text
AddinCommands 1.1
```

Host-specific API baselines remain runtime gates:

```text
WordApi       1.1
ExcelApi      1.1
PowerPointApi 1.5
```

## Platform claim rule

Only these clients are currently end-to-end verified:

```text
Word for Microsoft 365 on Windows
Excel for Microsoft 365 on Windows
PowerPoint for Microsoft 365 on Windows
```

Web and Mac must not be described as live verified until they are actually
executed.
