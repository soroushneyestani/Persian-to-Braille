# Phase 9.2 - Microsoft 365 Word Host Adapter Contract

## Status

**CONTRACT FROZEN**

Phase 9.2 defines the boundary between Microsoft Word and the existing public
Persian Braille SDK.

No Office implementation is introduced in this phase.

## Architecture

```text
Canonical Specification
        |
       Core
        |
    Public SDK
        |
Microsoft 365 Integration
        |
   Word Host Adapter
```

Translation ownership remains with:

```text
@persian-braille/sdk
```

The Word layer owns only:

```text
reading Word selection
validating that selection has not changed before a write
replacing selected document text
inserting text immediately after the selected document text
mapping Office host failures into adapter-level failures
```

The Word layer must not own:

```text
Braille mappings
normalization
rule precedence
translation fallback
profile governance
SDK failure semantics
```

## Minimum Word API contract

Phase 9 targets:

```text
WordApi 1.1
```

The MVP requires only capabilities available at this baseline:

```text
document.getSelection()
Range.text
Range.insertText(..., Replace)
Range.insertText(..., After)
Word.run(...)
context.sync()
```

No later Word API requirement set may be introduced during Phase 9 without an
explicit compatibility review.

## Adapter surface

The intended implementation contract is conceptually:

```ts
interface PersianBrailleWordHostAdapter {
  readSelection():
    Promise<WordSelectionReadResult>;

  replaceSelection(
    expectedSourceText: string,
    replacementText: string,
  ): Promise<WordMutationResult>;

  insertAfterSelection(
    expectedSourceText: string,
    insertedText: string,
  ): Promise<WordMutationResult>;
}
```

This is a host contract, not a translation API.

## Selection read semantics

`readSelection()` must:

```text
read the current selection at invocation time
load the selection text
sync the Word request context
return the exact selected string
```

It must not:

```text
trim
normalize
translate
change line endings intentionally
strip format controls
persist a Word.Range proxy for a later UI action
```

An empty selection is a valid host read.

Whether an empty selection may be translated is an application-level decision
for Phase 9.3.

## Why Word.Range is not persisted across UI actions

The MVP deliberately avoids preserving a live Office proxy object between:

```text
Translate Selection
        ...
user waits / edits / moves selection
        ...
Replace Selection
```

Instead, the application keeps the source text used for the preview.

Before a document mutation, the adapter obtains the current selection again and
compares it with that expected source text.

This produces a simple cross-client stale-preview guard without introducing
persistent bindings or long-lived tracked Office objects.

## Mutation guard

Both document mutation operations accept:

```text
expectedSourceText
```

Before writing, the adapter must:

```text
1. obtain the current Word selection
2. load its text
3. sync
4. compare the current text to expectedSourceText exactly
5. refuse the mutation if the strings differ
```

Failure code:

```text
SELECTION_CHANGED
```

This prevents a preview generated from one selection from being accidentally
written into a different selection later.

The equality policy is deliberately strict:

```text
exact JavaScript string equality
```

The adapter performs no normalization before comparison.

## Replace Selection

Successful replacement means:

```text
current selection == expectedSourceText
        |
Range.insertText(replacementText, Replace)
        |
context.sync()
```

The adapter must not add spaces, newlines, paragraphs, formatting rules, or
Braille-specific layout behavior.

The supplied replacement is inserted as supplied.

## Insert After Selection

Successful insertion means:

```text
current selection == expectedSourceText
        |
Range.insertText(insertedText, After)
        |
context.sync()
```

"After" means immediately after the current selected range.

The adapter does not automatically add a separator.

## Copy behavior

Copying generated Unicode Braille is not a Word document mutation.

```text
Copy Unicode Braille -> task pane UI
Replace Selection    -> Word host adapter
Insert After          -> Word host adapter
Translation           -> public SDK
```

## Host failure surface

The Word adapter owns these failure codes:

```text
OFFICE_NOT_READY
WRONG_HOST
UNSUPPORTED_REQUIREMENT_SET
SELECTION_UNAVAILABLE
SELECTION_CHANGED
DOCUMENT_WRITE_FAILED
```

These are host-integration failures and remain separate from SDK translation
failures.

## Office error isolation

Office/Word runtime error objects stay inside the integration layer.

The SDK remains Office-independent.

## Requirement-set failure

The Phase 9 implementation must verify:

```text
WordApi 1.1
```

If the required capability is unavailable:

```text
UNSUPPORTED_REQUIREMENT_SET
```

and no document mutation is attempted.

## Wrong host

Phase 9 is Word-only.

If the integration runs in another Office host:

```text
WRONG_HOST
```

## Office readiness

Host operations are unavailable before Office initialization completes.

Premature host access maps to:

```text
OFFICE_NOT_READY
```

## No translation semantics in the adapter

Prohibited examples:

```text
hardcoded Persian-to-Braille mappings
selection trimming before SDK translation
Word-specific Arabic/Persian normalization
Word-specific ZWNJ translation behavior
recomputing SDK cells
silent character substitution
```

The translation path remains:

```text
selected text
    |
task-pane application
    |
public SDK
    |
public SDK result
```

## Platforms

The same contract applies to:

```text
Word on the web
Word for Microsoft 365 on Windows
Word for Microsoft 365 on Mac
```

No platform-specific translation semantics are permitted.

## Manifest strategy

Phase 9 continues the 9.1 baseline:

```text
add-in only XML manifest
```

The manifest itself is not created in Phase 9.2.

## Out of scope for 9.2

No implementation is added for:

```text
Office.js
manifest.xml
task pane
ribbon
HTTPS local server
development certificates
sideloading
Word document writes
clipboard
Excel
PowerPoint
Marketplace
```

## Machine-readable contract

Authoritative companion:

```text
docs/architecture/phase-9.2-word-host-adapter-contract.json
```

Validation:

```text
pnpm run validate:phase9-word-contract
```

and it is included in:

```text
pnpm run validate:architecture
```

## Exit decision

Phase 9.2 is complete when the machine-readable contract, human-readable
contract, and validator are committed; validation is green; and no Office
implementation has been introduced.

The next finite deliverable is:

**Phase 9.3 - Word Selection Translation**
