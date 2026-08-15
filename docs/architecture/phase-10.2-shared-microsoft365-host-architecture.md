# Phase 10.2 — Shared Microsoft 365 Host Architecture

## Status

**ARCHITECTURE FROZEN — NO EXCEL/POWERPOINT RUNTIME IMPLEMENTATION YET**

Phase 10.2 closes the five architecture questions intentionally left open by
Phase 10.1. It does not yet add `Excel.run` or `PowerPoint.run`.

The dependency law remains:

```text
Specification
    ↓
Core
    ↓
SDK
    ↓
Microsoft 365 shared host layer
    ├── Word adapter
    ├── Excel adapter
    └── PowerPoint adapter
```

The Microsoft 365 package may translate only through
`@persian-braille/sdk`.

## Decision 1 — Excel selection cardinality

Phase 10 Excel MVP supports:

```text
exactly one selected cell
plain-text value only
```

It does **not** flatten or reinterpret a multi-cell range.

Reasons:

- `Workbook.getSelectedRange()` returns a cell range rather than a textual
  selection.
- The existing task-pane contract has one source string and one SDK result.
- A 2D range needs independent rules for ordering, blank cells, partial
  failures, copy serialization, and mutation.
- Those semantics should not be invented as a side effect of adding Excel.

Phase 10 therefore rejects:

```text
multi-cell selection
discontiguous selection
non-text cell
formula cell
```

with host/application failures rather than silently coercing them.

A future phase may introduce a first-class 2D translation model.

## Decision 2 — Excel formula and non-text protection

The Excel host adapter will snapshot a selected single cell using:

```text
address
rowCount
columnCount
valueType
rawValue
formulaProjection
```

The source passed to the SDK is the raw string value of an admitted plain-text
cell.

Formula cells are not translation targets in Phase 10.

Before Replace, the Excel adapter obtains a fresh selection and requires the
snapshot to match exactly. Only then may it write the exact SDK
`unicodeBraille` string to the cell.

Phase 10 does not support Excel **Insert After**.

Appending by rewriting an Excel cell can re-trigger Excel's interpretation of
strings beginning with formula markers such as `=`, `+`, or `-`. Avoiding that
safely would require explicit escaping/number-format semantics. Phase 10 does
not alter number formats or invent escaping rules merely to imitate Word's
`insertText(..., "After")`.

Excel Phase 10 capabilities are therefore:

```text
Translate       yes
Copy Braille    yes
Replace         yes
Insert After    no
```

## Decision 3 — PowerPoint selection and Insert After

PowerPoint Phase 10 uses the selected `PowerPoint.TextRange`.

Minimum requirement:

```text
PowerPointApi 1.5
```

A preview mutation context will snapshot:

```text
slideId
shapeId
start
length
text
```

The adapter obtains parent shape/slide identity through the selected text
range's parent text frame and shape.

Before Replace, a fresh PowerPoint selection must match all five snapshot
values exactly.

Replace writes:

```text
selectedTextRange.text = sdkResult.unicodeBraille
```

Phase 10 does not support PowerPoint **Insert After**.

PowerPoint `TextRange` does not expose the same insertion primitive as
`Word.Range.insertText`. Replacing a selected range with
`source + braille` would be a replacement operation and may have formatting
consequences. The MVP does not mislabel such behavior as Insert After.

PowerPoint Phase 10 capabilities are:

```text
Translate       yes
Copy Braille    yes
Replace         yes
Insert After    no
```

## Decision 4 — Shared task-pane capability model

The Phase 9 task pane is visually reusable but structurally Word-coupled.
Phase 10.3 will generalize it around a host capability descriptor.

Conceptually:

```ts
type OfficeHostKind =
  | "word"
  | "excel"
  | "powerpoint";

interface HostCapabilities {
  hostKind: OfficeHostKind;
  hostLabel: string;
  requirementSet: string;
  minimumVersion: string;
  canReplace: boolean;
  canInsertAfter: boolean;
}
```

The shared controller owns:

```text
busy state
preview state
SDK-result projection
Copy Braille
common error projection
capability-driven action enablement
```

The host selection service owns:

```text
Office runtime/object model
selection acquisition
host-specific preview mutation context
stale-selection validation
document/workbook/presentation mutation
```

The controller may inspect only:

```text
sourceText
translation
```

from a successful preview.

Host mutation context is opaque to the shared task pane.

The service shape is conceptually generic:

```ts
interface SelectionService<TPreview> {
  translateSelection(): Promise<...>;
  replaceWithBraille(
    preview: TPreview,
  ): Promise<HostMutationResult>;

  insertBrailleAfter?(
    preview: TPreview,
  ): Promise<HostMutationResult>;
}
```

No unsupported method is simulated. The capability descriptor controls whether
the corresponding UI action is available.

## Decision 5 — Three-host manifest architecture

Phase 10 keeps the production-supported:

```text
add-in-only XML manifest
```

Base hosts become:

```text
Document
Workbook
Presentation
```

The base manifest must not contain application-specific API sets that would
need to be simultaneously supported by every target host.

Phase 10.5 will materialize three sibling `VersionOverridesV1_0` sections:

```text
Document
  AddinCommands 1.1
  WordApi 1.1

Workbook
  AddinCommands 1.1
  ExcelApi 1.1

Presentation
  AddinCommands 1.1
  PowerPointApi 1.5
```

Each VersionOverrides section owns its corresponding host command structure.

The three-host XML is not accepted until the official Microsoft manifest
validator passes.

## Readiness architecture

The current Word bootstrap directly constructs a Word runtime before host
dispatch.

Phase 10.3 changes the bootstrap model to:

```text
Office.onReady
      ↓
resolve Office host
      ↓
resolve registered host descriptor
      ↓
construct that host runtime + adapter + selection service
      ↓
check requirement set
      ↓
initialize shared task-pane controller
```

A host adapter must still independently reject an incorrect host. Dispatch is
not considered a security/correctness boundary by itself.

Standalone browser behavior remains a required negative test:

```text
OFFICE_NOT_READY
```

## Failure-domain rule

The shared UI consumes structural host failures:

```text
ok: false
domain: host
code: string
message: string
```

Phase 9 Word error codes stay valid and are not renamed retroactively.

Excel and PowerPoint may add host-appropriate failure codes without changing
translation semantics.

Planned Excel-specific failures include:

```text
SELECTION_SHAPE_UNSUPPORTED
SELECTION_CONTENT_UNSUPPORTED
WORKBOOK_WRITE_FAILED
```

Planned PowerPoint write failure:

```text
PRESENTATION_WRITE_FAILED
```

## Frozen Word behavior

Phase 10 refactoring must preserve:

```text
WordApi 1.1
Word.run
exact selected text
Replace
Insert After
SELECTION_CHANGED guard
33/33 Phase 9 Microsoft 365 tests
real Windows behavior already evidenced in Phase 9
```

No Excel/PowerPoint generalization is allowed to weaken these semantics.

## Implementation sequence

```text
10.2  architecture contract only              ← current
10.3  shared task-pane refactor + Excel
10.4  PowerPoint
10.5  three-host manifest + regression/evidence
10.6  closure
```

## Explicit Phase 10 MVP non-goals

```text
Excel multi-cell translation
Excel formula translation
Excel formula rewriting
Excel Insert After
PowerPoint Insert After
Office-owned Braille rules
Office-owned Unicode normalization
direct Microsoft365 -> Core dependency
unverified Excel/PPT compatibility claims
```

## Exit decision

Phase 10.2 closes when this contract and its machine-readable representation are
committed and validated.

Next:

**Phase 10.3 — Shared Task Pane Refactor + Excel Integration**
