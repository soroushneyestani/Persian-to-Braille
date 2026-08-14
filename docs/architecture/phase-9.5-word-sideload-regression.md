# Phase 9.5 - Word Sideload & Cross-Client Regression Evidence

## Status

**EVIDENCE FROZEN — WINDOWS VERIFIED; WEB/MAC EXECUTION DEFERRED**

Phase 9.5 records the first real Microsoft Word execution of the
Persian-to-Braille Office Add-in.

The implementation is not being represented as fully cross-client verified.
Only the Windows Microsoft 365 client was executed end-to-end in this phase.

The maintainer explicitly accepted deferring Word on the web and Word on Mac
execution so Phase 9 can proceed to closure without inventing test evidence.

## Microsoft manifest validation

The production-oriented add-in-only XML manifest was validated with Microsoft's
manifest validator:

```text
pnpm dlx office-addin-manifest validate integrations/microsoft365/manifest.xml
```

Observed final result:

```text
The manifest is valid.
```

This establishes schema/manifest validity. It is not a substitute for actual
client execution.

## Local HTTPS development host

The Office development certificate was generated and trusted with:

```text
pnpm dlx office-addin-dev-certs install
```

Observed certificate files:

```text
%USERPROFILE%\.office-addin-dev-certs\ca.crt
%USERPROFILE%\.office-addin-dev-certs\localhost.crt
%USERPROFILE%\.office-addin-dev-certs\localhost.key
```

The development task pane was served at:

```text
https://localhost:3000/taskpane.html
```

An HTTP 200 response was observed.

The standalone-browser readiness guard correctly remained:

```text
Waiting for Word
OFFICE_NOT_READY
```

rather than falsely reporting a live Word host.

## Windows Microsoft 365 verification

Status:

```text
VERIFIED / PASS
```

The add-in was sideloaded through the Office debugging tooling and launched in
Word for Microsoft 365 on Windows.

Observed real-client evidence:

```text
Home ribbon command visible
Persian-to-Braille group visible
Translate Selection command visible
task pane opened
task pane reported Word ready
live Word selection read successfully
public SDK translation rendered in the task pane
Copy Braille worked
Insert After worked
Replace Selection worked
stale-preview mutation was blocked with SELECTION_CHANGED
```

The live selection used for the first visible verification was Persian text
(`سلام`), and the task pane displayed the public SDK projection including cells:

```text
234 123 1 134
```

The exact Braille result remains owned by the SDK/profile and is not redefined by
this evidence document.

## Windows sideload lifecycle

The development sequence reached:

```text
Enabled debugging
Sideloading the Office Add-in
Launching Word
Debugging started
```

After verification, the development registration was removed with:

```text
pnpm dlx office-addin-debugging stop integrations/microsoft365/manifest.xml
```

Observed result:

```text
Debugging has been stopped.
```

Therefore the Windows verification did not intentionally leave an active debug
registration behind.

## Word on the web

Status:

```text
EXPECTED / NOT EXECUTED
```

Word on the web was not available as an actual test environment during Phase 9.

Evidence that supports expected compatibility, but does not constitute a pass:

```text
Microsoft-valid add-in-only XML manifest
WordApi 1.1 baseline
HTTPS task-pane resources
shared Office.js host adapter
shared SDK translation path
no Web-specific translation semantics
```

Phase 9 does **not** claim that Word on the web passed end-to-end testing.

Actual Word-on-the-web sideload and workflow verification is a mandatory
pre-Marketplace release gate before Phase 11 can close.

## Word for Microsoft 365 on Mac

Status:

```text
EXPECTED / NOT EXECUTED
```

A macOS Word environment was not available during Phase 9.

Evidence that supports expected compatibility, but does not constitute a pass:

```text
Microsoft-valid add-in-only XML manifest
WordApi 1.1 baseline
host-neutral Phase 9 Office.js interaction contract
shared SDK translation path
no Mac-specific translation semantics
```

Phase 9 does **not** claim that Word for Microsoft 365 on Mac passed end-to-end
testing.

Actual Mac sideload and workflow verification is a mandatory pre-Marketplace
release gate before Phase 11 can close.

## Phase 9.5 platform matrix

```text
Word for Microsoft 365 / Windows   VERIFIED / PASS
Word on the web                    EXPECTED / NOT EXECUTED
Word for Microsoft 365 / Mac       EXPECTED / NOT EXECUTED
```

`EXPECTED` means that the implementation and manifest are designed for the
target and no known architectural incompatibility has been introduced.

It does not mean that a manual client test passed.

## Windows workflow regression matrix

```text
Ribbon command             PASS
Task pane open             PASS
Word readiness             PASS
Selection read             PASS
SDK translation            PASS
Copy Braille               PASS
Insert After               PASS
Replace Selection          PASS
SELECTION_CHANGED guard    PASS
```

These checks were performed against a real Word for Microsoft 365 Windows host,
not only a mocked Office runtime.

## Deferred release gates

Before Phase 11 Marketplace submission can be considered complete, the project
must obtain actual execution evidence for:

```text
Word on the web
Word for Microsoft 365 on Mac
```

At minimum each deferred target must verify:

```text
manifest/add-in installation
ribbon command
task pane startup
Word ready state
selection translation
Copy Braille
Insert After
Replace Selection
SELECTION_CHANGED protection
```

A future successful run may upgrade each status from:

```text
EXPECTED / NOT EXECUTED
```

to:

```text
VERIFIED / PASS
```

without changing translation semantics.

## Non-claims

Phase 9.5 does not claim:

```text
full cross-client verification
Marketplace readiness
Web execution
Mac execution
normative completion of fa-ir-g1
reverse translation
Excel support
PowerPoint support
```

The Persian Braille profile remains draft.

## Exit decision

Phase 9.5 is considered complete for the Phase 9 development milestone because:

```text
Microsoft manifest validation passed
trusted HTTPS localhost development works
Windows Word executed end-to-end
all Windows MVP mutations passed
stale-preview protection passed in live Word
debug registration was cleaned up
Web/Mac execution gaps are explicitly documented
Web/Mac are mandatory pre-Marketplace release gates
maintainer accepted the deferral
```

The next finite deliverable is:

**Phase 9.6 - Phase 9 Closure**
