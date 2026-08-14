# Phase 9.4 - Word Task Pane and Ribbon Command

## Status

**IMPLEMENTED**

Phase 9.4 turns the Word integration from a testable host adapter into a visible
Office Add-in surface.

## User workflow

```text
Word Home ribbon
      |
Persian-to-Braille
      |
Translate Selection
      |
task pane opens
      |
Translate Selection
      |
Braille preview
      |
Copy / Replace Selection / Insert After
```

## Manifest

Phase 9 continues to use the add-in only XML manifest selected in Phase 9.1.

The manifest targets:

```text
Host: Document
WordApi: 1.1
Permissions: ReadWriteDocument
```

The add-in command is a `ShowTaskpane` button on the built-in Word Home tab.

Development URLs are HTTPS localhost URLs on port 3000.

## Office.js

The task pane loads Office.js from Microsoft's production CDN:

```text
https://appsforoffice.microsoft.com/lib/1/hosted/office.js
```

No local copy of Office.js is committed.

## Task-pane architecture

```text
Office.js / Word
      |
Word runtime bridge
      |
Word host adapter
      |
Word selection service
      |
Public SDK
      |
Core
      |
Specification
```

The task-pane controller never imports Core or specification data.

## Browser runtime packaging

The static add-in build materializes:

```text
addin-dist/
  taskpane.html
  commands.html
  styles.css
  assets/
  app/
  vendor/sdk/
  vendor/core/
```

The task-pane source imports the Microsoft 365 integration layer, which reaches
translation only through the public SDK.

The import map exists only to satisfy the SDK's browser runtime dependency graph.

## Translation UI

The task pane displays:

```text
selected source text
Unicode Braille
Braille cells
normalized text
structural tokens
```

Expected SDK translation failures remain translation-domain failures.

Office host failures remain host-domain failures.

An empty Word selection remains an application-level failure.

## Document mutations

Replace Selection and Insert After continue to use the stale-preview protection
implemented in Phase 9.3.

The UI never writes directly to Word.

It passes the successful preview back to the selection service.

After a successful document mutation, the preview is invalidated and the user
must translate again before another mutation.

## Clipboard

Copy Braille writes the exact public SDK `unicodeBraille` result through the
browser Clipboard API.

Clipboard failure is presented as a UI/clipboard failure and is not rewritten as
a translation error.

## Accessibility

The task pane uses:

```text
native buttons
visible keyboard focus
semantic headings
role=alert for failures
aria-live for operational status
textual/selectable Braille output
```

No translation result is image-only.

## Local HTTPS preview

The package includes a small Node HTTPS static server.

It expects the trusted Office localhost development certificate at the standard
`office-addin-dev-certs` location, or custom paths through:

```text
OFFICE_ADDIN_CERT
OFFICE_ADDIN_KEY
```

The development origin is:

```text
https://localhost:3000
```

Certificate installation and actual Office sideloading are Phase 9.5 work.

## Ribbon icons

Development PNG icons are committed at the required command sizes:

```text
16x16
32x32
80x80
```

They are intentionally simple project-owned development assets.

Marketplace branding can replace them in Phase 11 without changing translation
architecture.

## Static contract validation

```text
pnpm run validate:phase9-word-addin
```

checks the Word host, WordApi baseline, HTTPS task-pane location, Home ribbon
command, Office.js CDN, SDK/Core browser import map, and absence of task-pane
storage persistence.

## Tests

The Microsoft 365 package tests cover both Phase 9.3 Word selection behavior and
Phase 9.4 task-pane behavior.

Phase 9.4 adds tests for:

```text
task-pane initialization
success projection
host failure projection
empty-selection projection
SDK failure projection
clipboard success/failure
Replace delegation
Insert After delegation
mutation failure projection
Office.js CDN reference
manifest ribbon command
static browser build
```

## Out of scope

Phase 9.4 does not claim cross-client execution yet.

Still pending:

```text
trusted localhost certificate installation
Microsoft manifest service validation
Word on the web sideload
Word for Microsoft 365 on Windows sideload
Word for Microsoft 365 on Mac sideload
cross-client evidence
```

Those belong to Phase 9.5.

## Next

**Phase 9.5 - Web / Windows / Mac Sideload and Regression**
