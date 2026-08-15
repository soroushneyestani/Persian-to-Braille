# Phase 10.4b — Shared Task Pane + PowerPoint Dispatch

## Status

Implemented as the task-pane half of Phase 10.4.

Phase 10.4a established the PowerPoint runtime, adapter, selection service,
five-field stale-selection snapshot, and host-layer regression suite.
Phase 10.4b connects that already validated service to the shared Microsoft 365
task pane.

## Three-host dispatch

The live task pane now has one host-neutral Office readiness path:

```text
Office.onReady()
  -> shared readiness
     -> Word
     -> Excel
     -> PowerPoint
```

Each host still keeps its own runtime, adapter, selection service, and mutation
semantics.

## Capabilities

### Word

```text
WordApi 1.1
Replace       yes
Insert After  yes
```

### Excel

```text
ExcelApi 1.1
Replace       yes
Insert After  no
```

### PowerPoint

```text
PowerPointApi 1.5
Replace       yes
Insert After  no
```

The existing capability-driven DOM automatically hides/disables unsupported
actions. No PowerPoint-specific UI branch is added to the DOM view.

## Readiness

Shared task-pane readiness now accepts a PowerPoint runtime in addition to the
existing Word and Excel runtime ports.

PowerPoint dispatch requires:

```text
Office host = PowerPoint
runtime ready
PowerPointApi 1.5 supported
```

The fourth PowerPoint runtime argument is optional at the TypeScript API
boundary so the existing Word/Excel readiness regression calls remain
backward-compatible.

## Translation boundary

PowerPoint follows the same architecture as the other hosts:

```text
Task Pane
  -> PowerPoint selection service
  -> @persian-braille/sdk
  -> Core
```

The shared task-pane controller does not import or execute PowerPoint APIs.

## Mutation semantics

The task pane delegates Replace to the PowerPoint selection service created in
Phase 10.4a.

That host layer remains responsible for the exact five-field stale guard:

```text
slideId
shapeId
start
length
text
```

The shared controller does not duplicate this logic.

## Insert After

PowerPoint's capability profile sets:

```text
canInsertAfter = false
```

The shared controller therefore rejects the action as unsupported and the DOM
view hides the button for PowerPoint.

## Manifest policy

`manifest.xml` remains unchanged in Phase 10.4b.

The current verified manifest is still the Phase 9 Word-only manifest.
Three-host manifest materialization, official manifest validation, sideloading,
and real cross-host evidence belong to Phase 10.5.

## Acceptance gates

1. Microsoft 365 package typecheck.
2. Word + Excel + PowerPoint + shared task-pane tests.
3. Phase 10.4a PowerPoint host-layer validator.
4. Phase 10.4b PowerPoint task-pane validator.
5. Phase 10.3 Excel validators.
6. Full Phase 9 Word regression.
7. `git diff --check`.

## Next phase

Phase 10.5 performs the multi-host manifest work and real sideload/regression
evidence for Word, Excel, and PowerPoint.
