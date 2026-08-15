# Phase 10.3b — Shared Task Pane + Excel Dispatch

## Status

Implemented as the second implementation patch of Phase 10.3.

Phase 10.3a established the Excel runtime, adapter, selection service, failure
surface, stale-selection guard, and regression tests. Phase 10.3b connects that
host layer to the existing Microsoft 365 task pane without changing the
manifest.

## Architectural boundary

The browser task pane is now host-neutral:

```text
Office.onReady
  -> host readiness dispatch
     -> Word runtime / adapter / selection service
     -> Excel runtime / adapter / selection service
  -> shared task-pane controller
  -> capability-driven DOM view
```

The task pane continues to call only the Microsoft 365 integration layer and
the public SDK boundary. It does not import Core directly.

## Host capabilities

### Word

- Requirement set: `WordApi 1.1`
- Selection model: current Word selection
- Replace: enabled
- Insert After: enabled
- Existing exact-selection stale guard remains in the Word runtime

### Excel

- Requirement set: `ExcelApi 1.1`
- Selection model: exactly one plain-text cell
- Replace: enabled
- Insert After: disabled
- Existing exact-cell-snapshot stale guard remains in the Excel runtime

The shared controller does not duplicate Word or Excel mutation semantics.
Host-specific behavior remains behind each host selection service.

## Backward compatibility

The Phase 9 public task-pane symbols remain available:

- `createWordTaskPaneController`
- `evaluateWordTaskPaneReadiness`
- `createWordTaskPaneDomView`

They are retained as compatibility entry points so the established Word
regression suite remains meaningful while the live task pane moves to the
shared implementation.

## Manifest policy

`manifest.xml` is intentionally unchanged in Phase 10.3b.

The currently verified manifest remains Word-only. Multi-host manifest work,
including Excel application declarations and host-specific
`VersionOverrides`, belongs to Phase 10.5 together with sideload,
cross-host regression, and official manifest validation evidence.

Therefore Phase 10.3b proves the Excel task-pane dispatch path in compiled and
unit-tested code without prematurely changing the accepted Word manifest.

## Acceptance gates

Phase 10.3b is accepted only when all of the following are green:

1. Microsoft 365 package typecheck.
2. Microsoft 365 Word + Excel + task-pane tests.
3. Phase 10.3a Excel host-layer validator.
4. Phase 10.3b shared task-pane validator.
5. Full Phase 9 Word regression validation.
6. `git diff --check`.

## Next phase

Phase 10.4 implements the PowerPoint translation host layer and connects it to
the shared Microsoft 365 architecture. Manifest expansion remains deferred to
Phase 10.5.
