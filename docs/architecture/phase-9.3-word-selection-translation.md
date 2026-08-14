# Phase 9.3 - Word Selection Translation

## Status

**IMPLEMENTED**

Phase 9.3 introduces the first real Microsoft Word integration code while
keeping UI, manifest, ribbon, hosting, and sideloading outside this deliverable.

## Runtime model

Microsoft documents Word APIs through the Office.js batch model:

```text
Word.run(...)
Range.load(...)
context.sync()
```

The Phase 9 runtime bridge uses only the WordApi 1.1 capability baseline frozen
in Phase 9.2.

## Source structure

```text
integrations/microsoft365/src/word/types.ts
integrations/microsoft365/src/word/runtime.ts
integrations/microsoft365/src/word/adapter.ts
integrations/microsoft365/src/word/selection-service.ts
```

`runtime.ts` is the narrow Office.js bridge.

`adapter.ts` owns host preflight and host-domain failure mapping.

`selection-service.ts` owns application orchestration between the Word adapter
and the public SDK.

No source file imports Core or canonical specification data.

## Office runtime bridge

The runtime bridge checks:

```text
Office/Word globals present
Office host == Word
WordApi 1.1 supported
```

It reads selection with:

```text
Word.run
  -> document.getSelection()
  -> range.load("text")
  -> context.sync()
  -> range.text
```

Mutations use a fresh current selection inside the same Word.run callback.

## Stale-preview guard

A preview stores only the exact source string used for translation.

The integration deliberately does not persist a Word.Range proxy across user
actions.

Before Replace or Insert After:

```text
get current selection
load text
sync
compare exactly with expectedSourceText
```

If it differs:

```text
SELECTION_CHANGED
```

and no insertText call occurs.

## Translation ownership

The service calls:

```text
translator.translate(selection.text)
```

using the public SDK.

It does not trim or normalize the selected string first.

SDK failures remain SDK translation results.

Host failures remain Word host failures.

An empty Word selection is represented separately as:

```text
EMPTY_SELECTION
```

which is an application-level state rather than a translation or Office failure.

## Document mutation

Replace uses:

```text
Range.insertText(unicodeBraille, "Replace")
```

Insert After uses:

```text
Range.insertText(unicodeBraille, "After")
```

The Unicode Braille string is taken directly from the successful SDK result.

The integration does not recompute cells or Braille output.

## Office.js loading

Phase 9.3 implements the runtime bridge but does not yet create the task-pane
HTML that loads Office.js.

That composition root belongs to Phase 9.4.

This keeps the current phase testable in Node while freezing the exact host
interaction needed by the later task pane.

## Test coverage

The Phase 9.3 Microsoft 365 test suite covers:

```text
Office-not-ready behavior
wrong-host behavior
WordApi 1.1 requirement check
verbatim selection reads
selection read failures
public SDK success delegation
empty selection
public SDK translation failure delegation
U+0622 SDK ownership
Replace with exact SDK Unicode Braille
Insert After with exact SDK Unicode Braille
stale-preview mutation blocking
document write failure mapping
Word.run/load/sync bridge behavior
```

## Clean-state build

The package follows the same clean-state convention as CLI and Web.

`tsBuildInfoFile` lives outside `dist`, and `clean` removes both.

A dependency-aware build from a clean workspace is:

```text
pnpm --filter @persian-braille/microsoft365... run build
```

which materializes:

```text
Core -> SDK -> Microsoft 365
```

## Explicitly unchanged

Phase 9.3 does not add:

```text
manifest.xml
task pane UI
ribbon command
Office.js CDN script tag
HTTPS development server
development certificates
sideloading
Excel
PowerPoint
Marketplace publication
```

## Next

The next finite deliverable is:

**Phase 9.4 - Word Task Pane + Ribbon Command**
