# Phase 10.1 — Excel / PowerPoint Host Baseline Audit

## Status

**BASELINE FROZEN — NO EXCEL OR POWERPOINT FEATURE CODE YET**

Phase 10 starts from the merged Phase 9 Word add-in fixed point. The raw
read-only repository audit is identified by:

```text
SHA-256: a1dd6346b4e604a1a8c4b18cbaa001d80e6d2b692ae7cdbdd38b1fa637ed667b
```

Repository baseline at audit start:

```text
branch:      phase10-excel-powerpoint
HEAD:        548d9b9e99e6abb1d8d98c8e1ee465dc3127dfd1
main:        548d9b9e99e6abb1d8d98c8e1ee465dc3127dfd1
origin/main: 548d9b9e99e6abb1d8d98c8e1ee465dc3127dfd1
```

The raw audit confirmed that the Microsoft 365 integration is currently a
Word implementation: the manifest targets `Document`, the base application
requirement is `WordApi 1.1`, the runtime uses `Word.run`, and no `Excel.run`
or `PowerPoint.run` implementation exists.

## Existing architecture that Phase 10 inherits

```text
Specification
    ↓
Core
    ↓
SDK
    ↓
@persian-braille/microsoft365
    ↓
Word
```

The Microsoft 365 package has one workspace dependency:

```text
@persian-braille/sdk
```

That boundary remains mandatory. Excel and PowerPoint do not get direct Core
access and do not own translation semantics.

## Production manifest family

Phase 10 keeps the:

```text
add-in-only XML manifest
```

Microsoft currently documents the add-in-only manifest as usable for
production add-ins in Excel, PowerPoint, and Word.

There is no Phase 10 requirement that justifies migrating the manifest family
while host adapters are being introduced.

The intended task-pane host set is:

```text
Document       -> Word
Workbook       -> Excel
Presentation   -> PowerPoint
```

### Application-specific requirement sets

The current base manifest contains:

```text
WordApi 1.1
```

That shape cannot simply be extended by placing WordApi, ExcelApi, and
PowerPointApi together in one shared requirement block.

Microsoft's current multi-application requirement guidance warns that all
requirement sets in such a block must be supported together and specifically
describes moving application-specific sets out of the shared base and using
host-scoped VersionOverrides/Requirements.

Phase 10 therefore freezes this rule:

> Do not combine WordApi, ExcelApi, and PowerPointApi application-specific Sets
> in one base Requirements block.

The concrete three-host VersionOverrides structure is a Phase 10.2
materialization task and **must pass Microsoft's official manifest validator**
before it is accepted.

## Minimum API baselines

### Word

```text
WordApi 1.1
```

This remains unchanged from Phase 9.

No Phase 10 refactor may weaken the verified Word selection and stale-preview
behavior.

### Excel

```text
ExcelApi 1.1
```

The current Microsoft API reference places the required baseline primitives in
ExcelApi 1.1:

```text
Workbook.getSelectedRange()
Range.text
Range.values
Range.formulas
Range.rowCount
Range.columnCount
```

Important semantic facts:

- `getSelectedRange()` returns the current single contiguous selected range and
  throws when multiple discontiguous ranges are selected.
- `Range.text` is a 2D read-only string projection.
- `Range.values` is a writable 2D raw-value projection.
- `Range.formulas` exposes formulas and returns the value for non-formula cells.

This is enough to establish the platform baseline, but it does **not** decide
how multi-cell or formula-containing selections should behave.

Those semantics belong to Phase 10.2.

### PowerPoint

```text
PowerPointApi 1.5
```

The current Presentation member reference identifies:

```text
getSelectedTextRange()
getSelectedTextRangeOrNullObject()
```

as `PowerPointApi 1.5`.

`PowerPoint.TextRange.text` is writable and belongs to `PowerPointApi 1.4`, so
the selected-text acquisition API is the limiting requirement for the planned
text-selection workflow.

The dedicated PowerPointApi 1.5 API-list page also includes the selected text
range APIs.

A PowerPoint requirement-set overview currently contains summary prose that
does not line up perfectly with those two more specific references. Phase 10
therefore uses the dedicated API list and member-level API annotations for the
baseline and requires both runtime requirement checks and manifest validation.

## What can be shared

Phase 10.2 should extract/reuse host-neutral behavior where it is genuinely
host-neutral:

```text
public SDK translation delegation
translation projection rendering
clipboard Copy Braille
profile/lifecycle disclosure
host-vs-SDK failure-domain separation
task-pane visual shell
```

## What must stay host-specific

The following are not safe to flatten into a fake universal selection API
without explicit host contracts:

```text
host identity
requirement-set preflight
Office object-model runtime bridge
selection snapshot
stale-selection validation
mutation semantics
```

The target architecture remains conceptually:

```text
                         ┌─ Word adapter
Task pane -> host layer -├─ Excel adapter  -> SDK -> Core
                         └─ PowerPoint adapter
```

The direction is illustrative; Specification still owns all Braille rules.

## Phase 9 coupling found by the audit

The raw audit found material Word coupling in:

```text
src/taskpane/controller.ts
src/taskpane/dom-view.ts
src/taskpane/main.ts
src/taskpane/readiness.ts
src/word/*
public/taskpane.html
README.md
manifest.xml
build/preview status text
tests
```

This means Phase 10 should generalize the task-pane bootstrap/capability layer
deliberately. It should not copy the Word controller twice.

At the same time, `src/word/*` is already a useful host-specific boundary and
should remain independently testable.

## Open decisions for Phase 10.2

### P10-ARCH-001 — Excel selection cardinality

Freeze one of:

```text
single cell only
single contiguous multi-cell range
deterministic 2D cell projection
```

The decision must define preview, mutation, and failure semantics.

### P10-ARCH-002 — Excel formula/non-text protection

Define behavior for:

```text
formula
number
boolean
error
blank
rich data
plain text
```

`Range.values` must never be used in a way that silently destroys formulas.

### P10-ARCH-003 — PowerPoint Insert After

Do not assume Word's:

```text
Range.insertText(..., "After")
```

exists in PowerPoint.

PowerPoint has a writable `TextRange.text`, so Replace is straightforward at
the platform level, but Insert After needs an explicit PowerPoint contract.

### P10-ARCH-004 — Shared task-pane capability model

The current controller exposes Word-specific actions and messages.

Phase 10.2 must decide how the UI discovers host capabilities and labels/actions
without putting Excel/PowerPoint semantics into the SDK.

### P10-ARCH-005 — Three-host XML

Materialize and officially validate the exact:

```text
Document / WordApi
Workbook / ExcelApi
Presentation / PowerPointApi
```

command and requirement structure.

No manifest design is accepted merely because a local XML parser accepts it.

## Non-negotiable constraints

Phase 10 must not:

```text
redefine Persian Braille rules in Office code
normalize Persian differently by Office host
call Core directly from Microsoft 365
weaken the Word stale-preview guard
claim Excel/PPT live verification before it exists
pretend Excel.Range == Word.Range
pretend PowerPoint.TextRange == Word.Range
```

## Phase 10.1 exit

Phase 10.1 closes with:

```text
repository baseline audited
production manifest family retained
three target Office hosts identified
minimum host API baselines frozen
Word regression boundary protected
Excel/PPT implementation absence recorded
host-specific semantic gaps explicitly deferred to Phase 10.2
```

Next finite deliverable:

**Phase 10.2 — Shared Microsoft 365 Host Architecture**
