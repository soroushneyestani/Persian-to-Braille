# Phase 11.5 — Windows Desktop Certification Matrix

## Status

**CLOSED — WINDOWS DESKTOP CERTIFICATION MATRIX VALIDATED**

This is an **internal Windows Desktop release-certification matrix** for the
Persian-to-Braille project. It is not Microsoft certification and it does not
claim Microsoft Marketplace publication.

Phase 11 uses only Microsoft 365 Desktop on Windows as its release scope.
Office on the web, Microsoft 365 for Mac, and official Microsoft Marketplace
publication are deferred to Phases 16, 17, and 18 respectively.

## Host matrix

| Host | Requirement | Selection contract | Mutations | Stale guard | Windows evidence |
|---|---|---|---|---|---|
| Word | WordApi 1.1 | Contiguous selected text range | Replace + Insert After | Exact source-text equality | PASS |
| Excel | ExcelApi 1.1 | Exactly one selected plain-text cell | Replace only | Exact cell snapshot | PASS |
| PowerPoint | PowerPointApi 1.5 | Selected text range | Replace only | Exact slide/shape/start/length/text snapshot | PASS |

## Word contract

The Word adapter remains the frozen Phase 9 contract:

- host: `Document`;
- runtime: `Word.run`;
- requirement set: `WordApi 1.1`;
- selection: contiguous text range;
- Replace Selection: supported;
- Insert After: supported;
- stale mutation protection: exact equality with the source text used for the
  preview;
- translation path: `Word -> Microsoft365 selection service -> SDK -> Core`.

Windows runtime and sideload behavior remain verified.

## Excel contract

The Excel adapter remains the frozen Phase 10 contract:

- host: `Workbook`;
- runtime: `Excel.run`;
- requirement set: `ExcelApi 1.1`;
- selection: exactly one selected plain-text cell;
- multi-cell selections are rejected;
- formulas and non-string cells are rejected;
- Replace Selection: supported;
- Insert After: not supported;
- stale mutation protection: exact selected-cell snapshot;
- translation path: `Excel -> Microsoft365 selection service -> SDK -> Core`.

Windows runtime behavior remains verified.

## PowerPoint contract

The PowerPoint adapter remains the frozen Phase 10 contract:

- host: `Presentation`;
- runtime: `PowerPoint.run`;
- requirement set: `PowerPointApi 1.5`;
- selection: selected text range;
- Replace Selection: supported;
- Insert After: not supported;
- stale mutation snapshot:
  `slideId + shapeId + start + length + text`;
- translation path:
  `PowerPoint -> Microsoft365 selection service -> SDK -> Core`.

Windows runtime behavior remains verified.

## Shared Microsoft 365 contract

The Windows release candidate preserves:

```text
Office.onReady()
  -> Word
  -> Excel
  -> PowerPoint
```

Shared invariants:

- add-in-only XML manifest;
- exactly one `VersionOverridesV1_0`;
- shared manifest requirement `AddinCommands 1.1`;
- permission `ReadWriteDocument`;
- host-specific runtime requirement checks;
- Office.js from the Microsoft CDN;
- Microsoft365 integration depends on the public SDK;
- SDK delegates to the standalone Core.

The Core remains Office-independent.

## Windows distribution evidence

The current Windows release scope has all required distribution evidence:

- production GitHub Pages HTTPS deployment: PASS;
- production manifest: PASS;
- public Windows Desktop Preview Installer: PASS;
- live installer download from GitHub Pages: PASS;
- real Windows installer execution: PASS;
- trusted local Office catalog setup: PASS;
- Office add-in discovery: PASS;
- `Persian-to-Braille -> Add`: PASS;
- `Translate Selection`: PASS;
- Braille preview/runtime flow: PASS.

## Windows host visual evidence

Listing / release screenshots are frozen for:

- Word: PASS;
- Excel: PASS;
- PowerPoint: PASS.

The screenshots are Windows Desktop evidence only.

## Regression boundary

Phase 11.5 does not introduce new translation semantics.

The release matrix requires all previously frozen contracts to remain green,
including:

- Phase 9 Word contract;
- Phase 10 Word / Excel / PowerPoint shared-host contracts;
- Microsoft365 test suite: 69/69;
- U+0622 / `آ` release correction;
- Phase 11 production hosting and compliance evidence;
- Phase 11.4e Windows installer evidence.

## Deferred work

The following are not Phase 11 blockers:

```text
Phase 16  Office on the Web
Phase 17  Microsoft 365 for Mac
Phase 18  Microsoft Marketplace / Partner Center official publication
```

The historical external publisher gate remains preserved as evidence but is not
part of the Windows Desktop closure gate.

## Phase 11.5 result

```text
Word / Windows:       PASS
Excel / Windows:      PASS
PowerPoint / Windows: PASS
Installer:            PASS
Production HTTPS:     PASS
Regression:           PASS

Web:                   DEFERRED TO PHASE 16
Mac:                   DEFERRED TO PHASE 17
Marketplace:           DEFERRED TO PHASE 18
```

## Next

**Phase 11.6 — Windows Desktop Release Package + Test Notes**
