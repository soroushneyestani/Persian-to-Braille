# Phase 10.5b — Windows Live Sideload Evidence

## Status

**CLOSED — WORD / EXCEL / POWERPOINT WINDOWS LIVE VERIFIED / PASS**

Verification date:

```text
2026-08-15
```

Baseline:

```text
branch: phase10-excel-powerpoint
commit: 77d47b0
```

Add-in ID:

```text
33ec7928-1204-5bb3-88e6-d778413e9234
```

## Manifest prerequisite

The Phase 10.5a multi-host add-in-only XML manifest had already passed the
official Microsoft manifest validator before live execution.

Evidence:

```text
docs/architecture/phase-10.5a-office-manifest-validation.txt
```

Terminal result:

```text
The manifest is valid.
```

## Windows sideload lifecycle

Each Office application was launched through the same multi-host manifest with:

```text
pnpm dlx office-addin-debugging start integrations/microsoft365/manifest.xml desktop
```

The interactive host selector was used independently for:

```text
Word
Excel
PowerPoint
```

For every host the observed lifecycle reached:

```text
Enabled debugging
Sideloading the Office Add-in
Launching <host>
Debugging started
```

After each verification session the development registration was removed with:

```text
pnpm dlx office-addin-debugging stop integrations/microsoft365/manifest.xml
```

Observed cleanup result:

```text
Debugging has been stopped.
```

## Word for Microsoft 365 / Windows

Status:

```text
LIVE VERIFIED / PASS
```

Observed workflow:

```text
Ribbon command                 PASS
Task pane open                 PASS
Word readiness                 PASS
Selection read                 PASS
SDK translation                PASS
Braille preview                PASS
Copy Braille                   PASS
Replace Selection              PASS
Insert After                   PASS
SELECTION_CHANGED stale guard  PASS
```

## Excel for Microsoft 365 / Windows

Status:

```text
LIVE VERIFIED / PASS
```

Observed workflow:

```text
Ribbon command                         PASS
Task pane open                         PASS
Excel readiness                        PASS
Single plain-text cell                 PASS
SDK translation                        PASS
Braille preview                        PASS
Copy Braille                           PASS
Replace Selection                      PASS
Insert After unavailable               PASS
Multi-cell rejection                   PASS
Formula protection                     PASS
SELECTION_CHANGED exact snapshot guard PASS
```

Observed protected failures:

```text
multi-cell selection
  -> SELECTION_SHAPE_UNSUPPORTED

formula cell
  -> SELECTION_CONTENT_UNSUPPORTED

changed cell after preview
  -> SELECTION_CHANGED
```

## PowerPoint for Microsoft 365 / Windows

Status:

```text
LIVE VERIFIED / PASS
```

Observed workflow:

```text
Ribbon command                 PASS
Task pane open                 PASS
PowerPoint readiness           PASS
Selected-text read             PASS
SDK translation                PASS
Braille preview                PASS
Copy Braille                   PASS
Replace Selection              PASS
Insert After unavailable       PASS
SELECTION_CHANGED stale guard  PASS
```

## Evidence boundary

This document records real Windows Office desktop execution.

It does **not** convert schema support or static compatibility into a Web or Mac
execution claim.

Still not executed:

```text
Word on the web
Word for Microsoft 365 on Mac
Excel on the web
Excel for Microsoft 365 on Mac
PowerPoint on the web
PowerPoint for Microsoft 365 on Mac
```

Those clients remain:

```text
EXPECTED / NOT EXECUTED
```
