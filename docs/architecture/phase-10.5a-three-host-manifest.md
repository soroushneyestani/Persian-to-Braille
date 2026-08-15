# Phase 10.5a — Three-host Add-in-only Manifest

## Status

**IMPLEMENTED — OFFICIAL MICROSOFT MANIFEST VALIDATION REQUIRED BEFORE ACCEPTANCE**

Phase 10.5a materializes the manifest architecture frozen in Phase 10.2 after
the Word, Excel, and PowerPoint runtime/task-pane integrations have all been
implemented and regression-tested.

## Manifest family

The project continues to use the add-in-only XML manifest.

The unified manifest is not introduced in Phase 10. The add-in-only manifest
remains the production baseline used by this project for Excel, PowerPoint, and
Word task-pane hosts.

## Base host declaration

The base manifest now declares all three applications:

```text
Document       -> Word
Workbook       -> Excel
Presentation   -> PowerPoint
```

The manifest deliberately contains **no application-specific API requirement
sets**. This prevents WordApi + ExcelApi + PowerPointApi from being evaluated
as shared requirements across different Office applications.

The shared base permission remains:

```text
ReadWriteDocument
```

## Host-scoped VersionOverrides

Phase 10.5a uses one `VersionOverridesV1_0` containing three host command entries.

The single override has one shared manifest requirement:

```text
AddinCommands 1.1
```

Its `Hosts` collection contains:

```text
Document       -> Word command surface
Workbook       -> Excel command surface
Presentation   -> PowerPoint command surface
```

Application-specific API baselines are checked at runtime instead of being
placed in the shared `VersionOverrides` requirements:

```text
Word        -> WordApi 1.1
Excel       -> ExcelApi 1.1
PowerPoint  -> PowerPointApi 1.5
```

This corrected shape was chosen after the official Microsoft validator rejected
the earlier three-sibling `VersionOverridesV1_0` attempt.

Every host exposes:

```text
Home
  -> Persian-to-Braille
     -> Translate Selection
        -> ShowTaskpane
```

All hosts open the same shared task pane:

```text
https://localhost:3000/taskpane.html
```

Runtime host dispatch remains responsible for selecting the correct Word,
Excel, or PowerPoint selection service.

## Static-shell generalization

The runtime was already host-neutral before Phase 10.5, but several static
labels still described the surface as Word-only.

Phase 10.5a changes those labels to Microsoft 365 terminology in:

- `public/taskpane.html`
- `build-addin.mjs`
- `preview-addin.mjs`

No translation or mutation semantics are changed.

## Historical validator compatibility

Earlier validators previously enforced that the manifest must remain identical
to the Phase 9 Word-only manifest. That restriction was correct during
Phases 10.1 through 10.4 but becomes obsolete when Phase 10.5 intentionally
materializes the three-host manifest.

Those validators are updated to validate their historical runtime/task-pane
invariants without forbidding the manifest evolution that their own roadmap
deferred to Phase 10.5.

The Phase 9 Word static validator continues to require the Word host, Word
command surface, WordApi 1.1 requirement, HTTPS task pane, and
ReadWriteDocument permission.

## Acceptance gates

The manifest is **not accepted** merely because the local static validator
passes.

Required gates:

1. `git diff --check`
2. Microsoft 365 typecheck
3. Microsoft 365 regression tests
4. Phase 10.5a local multi-host manifest validator
5. Official Microsoft `office-addin-manifest` validation
6. Phase 10.1–10.4 architecture regressions
7. Full Phase 9 Word regression
8. clean final diff check

Official validation command:

```text
pnpm dlx office-addin-manifest validate integrations/microsoft365/manifest.xml
```

The exact validator output must be preserved as Phase 10.5 evidence before
this subphase is committed.

## Deferred to Phase 10.5b

Phase 10.5a does not claim real-client execution.

The next subphase performs Windows sideload and live workflow validation in:

- Word for Microsoft 365
- Excel for Microsoft 365
- PowerPoint for Microsoft 365
