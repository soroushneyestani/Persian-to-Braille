# Phase 15.7F — Windows Desktop German Live Sideload Evidence

## Status

**LIVE SCREENSHOT EVIDENCE / PASS — WORD / EXCEL / POWERPOINT**

Baseline:

```text
branch  phase15-german-braille
HEAD    9f8bb2db8e1da91df32404dfdbf34d1abd893917
```

External screenshot evidence bundle:

```text
tools/phase15-7/runtime/live-evidence/phase15-7f-live-evidence.zip
SHA-256  4B7D1A11B0FB5F2BBA356893070556FC327003FA8BC2D1A437021B2245FFA7A2
screenshots  9
```

The screenshot bundle is runtime evidence only and is intentionally not
tracked as project source. This document records the validated evidence
contract.

## Windows Desktop host coverage

```text
Word        LIVE SCREENSHOT EVIDENCE / PASS
Excel       LIVE SCREENSHOT EVIDENCE / PASS
PowerPoint  LIVE SCREENSHOT EVIDENCE / PASS
Office Web  NOT EXECUTED / NO PASS CLAIM
Office Mac  NOT EXECUTED / NO PASS CLAIM
```

Each Windows host has three independent screenshots in the evidence bundle:

1. German workspace visible in the real Office desktop host.
2. Germany / Austria + Basisschrift sentinel.
3. Switzerland + Kurzschrift sentinel.

## German workspace

Observed region choices:

```text
Germany / Austria
Switzerland
```

Observed Braille levels:

```text
Basisschrift
Vollschrift
Kurzschrift
```

The UI therefore exposes the frozen 2 x 3 configuration matrix.

The Word screenshot also visibly preserves:

```text
Persian / English
German
Music / MIDI
```

The Excel and PowerPoint screenshots preserve the two text tabs and do not
show Music / MIDI.

## Sentinel A — Germany / Austria + Basisschrift

Observed on Word, Excel, and PowerPoint:

```text
failureCode        RUNTIME_NOT_EXECUTABLE
language           de
mode               basisschrift
regionalOverlay    null
runtimeStatus      LOWERING_IR_NON_EXECUTABLE
runtimeDependency  GERMAN_EXECUTABLE_RUNTIME_ADAPTER
runtimeExecutable  false
runtimeRegistered  false
loweringCoverage   123/123
```

## Sentinel B — Switzerland + Kurzschrift

Observed on Word, Excel, and PowerPoint:

```text
failureCode        RUNTIME_NOT_EXECUTABLE
language           de
mode               kurzschrift
regionalOverlay    swiss
runtimeStatus      MODE_RUNTIME_NOT_MATERIALIZED
runtimeDependency  GERMAN_MODE_EXECUTABLE_RUNTIME_MATERIALIZATION
runtimeExecutable  false
runtimeRegistered  false
loweringCoverage   NOT_MATERIALIZED
```

## Write boundary

The German workspace screenshots expose only:

```text
Translate Selection
Clear
```

No German Replace Selection or Insert After action is claimed or exposed in
Phase 15.7.

## Keyboard navigation evidence boundary

No screenshot can prove keypress behavior, so this live evidence does **not**
invent a keyboard-navigation claim.

Keyboard feature-tab behavior remains covered by the automated Microsoft365
regression suite that passed in Phase 15.7E.

## Runtime boundary

```text
GERMAN_RUNTIME_EXECUTABLE=false
GERMAN_RUNTIME_REGISTERED=false
SUCCESSFUL_GERMAN_TRANSLATION_CLAIMED=false
FAIL_CLOSED_CODE=RUNTIME_NOT_EXECUTABLE
PHASE15_8_REQUIRED=true
```

Phase 15.7 establishes the real Windows Office integration surface and
structured fail-closed projection. Executable German Braille materialization
remains a Phase 15.8 responsibility.
