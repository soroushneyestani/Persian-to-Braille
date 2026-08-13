# Phase 6.1 — Conformance Baseline Audit

## Status

**Phase 6.1: CLOSED**

This audit freezes the starting point for the profile-level conformance system.

Phase 5 already proved that every current single-rule conformance vector has a
deterministic executable owner in Core. Phase 6 therefore does not repeat that
work as its primary objective.

## Current profile

```text
profile                 fa-ir-g1 0.1.0
profile status          draft
direction               print-to-braille
admitted rules          175
fallback policy         error / error
```

Current lifecycle:

```text
normative rules          37
candidate rules         138
active vectors           37
draft vectors           138
```

## Current canonical vector model

There are exactly 175 canonical conformance vectors.

Every current vector references exactly one rule:

```text
ruleIdsPerVector = 1 for all 175 vectors
```

Therefore:

```text
multi-rule vectors       0
profile-level vectors    0
```

The existing vector corpus is a single-rule conformance corpus, not a
profile-scenario corpus.

## Rule-type coverage

The 175 current vectors cover all admitted rule records by rule type:

```text
character               132
context                    7
layout                    27
mode                       5
normalization              1
sequence                   3
```

Phase 5.5 already bridges these records to their owning Core execution layer.

## Current expected-output model

Every canonical vector currently uses the same expected-output shape:

```text
cells
unicodeBraille
structuralTokens
```

This is sufficient for rule-level output conformance.

It is not yet a full profile-level scenario model because it does not directly
encode:

```text
expected translation failure
expected match trace
expected engine-token trace
expected normalization failure
expected profile provenance
multi-step composition assertions
```

Phase 6 may define a separate scenario contract for those concerns without
silently changing the Phase 2 canonical rule-vector schema.

## Existing Core regression baseline

Core currently has four committed test files:

```text
unicode-preprocessor.test.mjs
rule-selector.test.mjs
forward-translator.test.mjs
canonical-execution-bridge.test.mjs
```

Phase 5 closure records the current fixed point as:

```text
tests      210
pass       210
fail       0
```

The canonical bridge already verifies all 175 rule vectors.

## Existing negative coverage

Negative testing exists in two different domains:

1. specification/governance validator negative fixtures under `tools/spec`;
2. selected runtime negative cases in the forward translator regression suite.

This does not yet constitute a systematic profile-level negative conformance
corpus.

Phase 6 must distinguish specification-validator negatives from runtime
translation-conformance negatives.

## Current CI coverage

Architecture Validation executes the repository-wide test command.

Specification Validation protects the canonical specification package and its
validator-negative fixtures.

Phase 6 must preserve that separation of concerns.

A future profile-conformance workflow may consume both, but it must not turn
runtime execution into normative-promotion authority.

## Machine-readable reporting gap

The baseline contains no machine-readable profile conformance report artifact:

```text
machine-readable conformance reports = 0
```

Phase 6 therefore has a real reporting deliverable rather than merely a
documentation task.

## Frozen Phase 6 problem statement

Phase 6 exists to add the layer currently missing between single-rule
execution and release-quality profile validation.

The missing capabilities are:

```text
profile-level scenario contract
multi-rule composition scenarios
systematic runtime negative scenarios
scenario execution harness
coverage accounting
machine-readable report generation
CI regression enforcement
```

## Non-goals

Phase 6 does not:

```text
change Braille mappings
promote candidate rules
change the draft profile lifecycle
implement the public SDK
implement CLI/Web/Microsoft 365 UI
implement reverse translation
implement Braille Music
implement the multi-language framework
```

## Governance boundary

Conformance success means:

```text
the tested draft profile behaves consistently with its admitted specification
and declared engine contract
```

It does not mean:

```text
candidate -> normative
draft vector -> active
CI PASS -> normative promotion
```

Normative promotion remains owned by specification governance.

## Frozen Phase 6 exit criteria

Phase 6 remains finite and is defined by exactly six deliverables:

```text
1. Conformance Baseline Audit
2. Conformance Domain Contract
3. Profile Scenario Harness
4. Composition & Negative Suites
5. Reporting & CI Enforcement
6. Phase 6 Closure
```

### 1. Conformance Baseline Audit

Freeze the current single-rule/vector/test/reporting baseline.

### 2. Conformance Domain Contract

Define the profile-scenario schema, expected success/failure model, scenario
lifecycle/category metadata, and machine-readable result/report types.

No scenario runner behavior is implemented here.

### 3. Profile Scenario Harness

Implement deterministic execution of profile-level scenarios through the real
Core forward translator.

The harness must not duplicate translation behavior.

### 4. Composition & Negative Suites

Add a finite committed corpus covering representative composition boundaries
and runtime failure behavior.

The scenario corpus must include Persian, sequence, numeric, Latin, layout /
normalization interaction, unknown character, and unknown format-control
boundaries.

### 5. Reporting & CI Enforcement

Produce deterministic machine-readable conformance reports with coverage
accounting and add CI enforcement.

### 6. Phase 6 Closure

Run the full local/CI fixed point, freeze the final Phase 6 invariants, and
merge only after required checks are green.

## Handoff

The next deliverable is:

**Phase 6.2 — Conformance Domain Contract**

It must define the scenario/result/report data model before the harness or
scenario corpus is implemented.
