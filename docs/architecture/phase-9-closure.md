# Phase 9 Closure - Microsoft Word Add-in MVP

## Status

**PHASE 9 CLOSED**

Phase 9 delivers the Microsoft Word Office Add-in MVP as a consumer of the
existing Persian Braille SDK.

The architecture remains:

```text
Specification -> Core -> SDK -> Microsoft 365 -> Word
```

No Office-specific Braille mapping, normalization, precedence, or fallback logic
was introduced.

## Finite Phase 9 criteria

```text
[1/6] Word Office Platform & Manifest Baseline Audit      COMPLETE
[2/6] Microsoft 365 Word Host Adapter Contract            COMPLETE
[3/6] Word Selection Translation                          COMPLETE
[4/6] Task Pane + Ribbon Command                          COMPLETE
[5/6] Web / Windows / Mac Sideload & Regression           COMPLETE WITH EXPLICIT CROSS-CLIENT DEFERRAL
[6/6] Phase 9 Closure                                     COMPLETE
```

Phase 9.5 is considered complete for this development milestone because the
Windows Microsoft 365 client was verified end-to-end and the unavailable Web
and Mac executions are explicitly recorded as deferred release gates rather
than falsely reported as passes.

## Delivered Word MVP

The implemented user workflow is:

```text
Select Persian text in Word
        |
Home ribbon -> Persian-to-Braille -> Translate Selection
        |
Word task pane
        |
Translate Selection
        |
Public SDK
        |
Braille preview
        |
Copy Braille / Replace Selection / Insert After
```

The task pane exposes the SDK projection and does not reimplement translation
rules.

## Word host adapter

The Word adapter provides:

```text
readSelection()
replaceSelection(expectedSourceText, replacementText)
insertAfterSelection(expectedSourceText, insertedText)
```

Host failures remain distinct from SDK translation failures.

Frozen host failure codes:

```text
OFFICE_NOT_READY
WRONG_HOST
UNSUPPORTED_REQUIREMENT_SET
SELECTION_UNAVAILABLE
SELECTION_CHANGED
DOCUMENT_WRITE_FAILED
```

The stale-preview guard re-reads the current selection immediately before a
document mutation and requires exact equality with the source text used to
create the preview.

## Office API baseline

Phase 9 uses:

```text
WordApi 1.1
```

The runtime bridge is intentionally limited to the capabilities required by the
MVP:

```text
Office.context.host
Office.context.requirements.isSetSupported()
Word.run()
document.getSelection()
Range.text
Range.insertText()
context.sync()
```

## Manifest

Phase 9 uses the production-oriented add-in-only XML manifest baseline.

Microsoft manifest validation was executed with:

```text
pnpm dlx office-addin-manifest validate integrations/microsoft365/manifest.xml
```

Observed final result:

```text
The manifest is valid.
```

The Phase 9 manifest contains:

```text
Word Document host
WordApi 1.1 requirement
ReadWriteDocument permission
Home ribbon command
ShowTaskpane action
HTTPS localhost development resources
```

Unified manifest remains deferred for a later production-status re-audit.

## Task pane and ribbon

The visible Word integration contains:

```text
Home ribbon:
  Persian-to-Braille
    Translate Selection

Task pane:
  Translate Selection
  Clear
  Unicode Braille preview
  Cells
  Normalized text
  Structural tokens
  Copy Braille
  Replace Selection
  Insert After
```

Office.js is loaded from Microsoft's hosted production CDN.

## Readiness correctness

A standalone-browser smoke test exposed and fixed an Office readiness false
positive.

The task pane now reports `Word ready` only when:

```text
Office.onReady supplied a real Office host
current host is Word
Word runtime is available
WordApi 1.1 is supported
```

A standalone browser remains:

```text
Waiting for Word
OFFICE_NOT_READY
```

## Clean-state development workflow

The Microsoft 365 preview command builds its complete dependency closure:

```text
pnpm --filter @persian-braille/microsoft365... run build
```

which materializes:

```text
Core -> SDK -> Microsoft 365
```

before starting the HTTPS server.

Generated `addin-dist` output is a local build artifact and is ignored by Git.

## Real Windows verification

Word for Microsoft 365 on Windows was executed end-to-end.

Verified live-client behavior:

```text
Ribbon command                          PASS
Task pane open                          PASS
Word readiness                          PASS
Selection read                          PASS
SDK translation                         PASS
Copy Braille                            PASS
Insert After                            PASS
Replace Selection                       PASS
SELECTION_CHANGED stale-preview guard   PASS
```

The debug registration was removed after verification.

## Cross-client status

```text
Word for Microsoft 365 / Windows   VERIFIED / PASS
Word on the web                    EXPECTED / NOT EXECUTED
Word for Microsoft 365 / Mac       EXPECTED / NOT EXECUTED
```

No Phase 9 artifact may describe Web or Mac as end-to-end verified.

Actual Web and Mac execution are mandatory release gates before Phase 11
Marketplace closure.

## Regression fixed point

The Phase 9 fixed point includes the established project suites plus the Word
integration suites.

Expected fixed-point counts at Phase 9 closure:

```text
Core tests                         210
SDK tests                           12
CLI tests                           13
Web tests                           13
Microsoft 365 Word tests            33
Phase 8 consumer integration         8
Conformance tool tests              22
Conformance scenarios               15 / 15 pass
```

Required validation gates:

```text
pnpm run typecheck
pnpm run test
pnpm run validate:normalization
pnpm run validate:architecture
pnpm run validate:runtime
pnpm run validate:conformance
pnpm run validate:sdk-package
pnpm run validate:phase8-consumers
pnpm run validate:phase9-word-selection
pnpm run validate:phase9-word-addin
pnpm run validate:phase9-word-sideload-evidence
pnpm run validate:phase9
```

## Profile lifecycle

The executable profile remains:

```text
fa-ir-g1 0.1.0
status: draft
```

Phase 9 does not promote any specification rule to normative status.

Microsoft Word is a consumer only.

## Explicitly out of Phase 9

```text
Excel host adapter
PowerPoint host adapter
Microsoft Marketplace submission
actual Web verification
actual Mac verification
reverse translation
Braille Music
npm publication
normative completion of the Persian Braille profile
```

Excel and PowerPoint begin in Phase 10.

Marketplace production work begins in Phase 11, where actual Web and Mac
execution return as mandatory release gates.

## Phase 9 exit decision

Phase 9 is closed when:

```text
all Phase 9 repository artifacts are committed
Phase 9 validation passes
full project regression passes
generated build output is untracked/ignored
feature branch is clean
GitHub CI passes after push
Phase 9 changes are merged to main
```

Local Phase 9 implementation closure is not the same as merge closure. The phase
is externally complete only after the Phase 9 branch is pushed, CI is green,
and the changes are merged to `main`.

## Next phase

**Phase 10 - Excel + PowerPoint Host Adapters**
