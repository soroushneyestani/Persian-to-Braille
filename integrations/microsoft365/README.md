# Microsoft 365 Integration

Official Microsoft 365 Office Add-in consumer.

## Phase 9 scope

Phase 9 targets Microsoft Word only:

```text
Word on the web
Word for Microsoft 365 on Windows
Word for Microsoft 365 on Mac
```

Excel and PowerPoint remain future host adapters.

## Architecture

```text
Specification -> Core -> SDK -> Microsoft 365 -> Word
```

The integration may depend on `@persian-braille/sdk`.

It must not import Core or canonical specification files directly and must not
own Persian Braille mappings, normalization, precedence, or fallback behavior.

## Phase 9.3 Word selection layer

The current Word layer provides:

```text
readSelection()
replaceSelection(expectedSourceText, replacementText)
insertAfterSelection(expectedSourceText, insertedText)
```

and a selection translation service that delegates translation exclusively to
the public SDK.

Successful preview mutation uses the SDK's exact `unicodeBraille` result.

### Stale-preview protection

A successful preview records the exact selected source text.

Before Replace or Insert After, the Word adapter re-reads the current selection
inside the mutation operation and requires exact equality.

If the selection changed:

```text
SELECTION_CHANGED
```

is returned and no document write occurs.

## Host failure domain

```text
OFFICE_NOT_READY
WRONG_HOST
UNSUPPORTED_REQUIREMENT_SET
SELECTION_UNAVAILABLE
SELECTION_CHANGED
DOCUMENT_WRITE_FAILED
```

These failures remain separate from SDK translation failures.

## Word API baseline

```text
WordApi 1.1
```

The runtime bridge is intentionally limited to:

```text
Office.context.host
Office.context.requirements.isSetSupported()
Word.run()
document.getSelection()
Range.text
Range.insertText()
context.sync()
```

The Office.js script itself is loaded by the future task-pane composition root
in Phase 9.4.

## Tests

```text
pnpm --filter @persian-braille/microsoft365 run test
```

The Phase 9.3 suite validates host preflight, exact selection preservation, SDK
translation delegation, SDK/host error separation, Word mutations, stale-preview
protection, and the Word.run/load/sync runtime bridge.
