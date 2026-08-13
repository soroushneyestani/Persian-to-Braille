# Phase 6 — Conformance Suite Closure

## Closure semantics

This document is the closure record for Phase 6.

The commit containing this document must be merged into `main` only after the
required GitHub validation checks are green.

Therefore, once this document is present on `main`:

**Phase 6 — Conformance Suite is CLOSED.**

## Finite exit criteria

Phase 6 was defined by exactly six deliverables:

```text
1. Conformance Baseline Audit
2. Conformance Domain Contract
3. Profile Scenario Harness
4. Composition & Negative Suites
5. Reporting & CI Enforcement
6. Phase 6 Closure
```

All implementation deliverables are complete before this closure record is
merged.

## 1. Conformance Baseline Audit

Phase 6 began by freezing the profile-level validation gap inherited from
Phase 5.

Baseline:

```text
profile                 fa-ir-g1 0.1.0
profile status          draft
direction               print-to-braille

canonical rules         175
canonical vectors       175
multi-rule vectors        0

normative rules          37
candidate rules         138
active vectors           37
draft vectors           138

Core test files           4
machine-readable profile
conformance reports       0
```

The baseline established that the existing canonical vector corpus was a
single-rule conformance corpus rather than a profile-scenario corpus.

Artifacts:

```text
tools/conformance/audit-phase6-baseline.py
docs/conformance/phase-6.1-baseline-audit.md
```

## 2. Conformance Domain Contract

Phase 6 defines a separate profile-level scenario model instead of modifying
the Phase 2 canonical rule-vector schema.

Machine-readable schemas:

```text
conformance/schema/profile-scenario.schema.json
conformance/schema/conformance-report.schema.json
```

Documentation:

```text
docs/conformance/phase-6.2-domain-contract.md
```

Scenario lifecycle:

```text
required
draft
```

This lifecycle is independent of specification governance:

```text
required != normative
draft    != candidate
scenario PASS != normative promotion
```

Frozen scenario categories:

```text
persian
sequence
numeric
latin
layout-normalization
mixed
negative
```

Expected outcome kinds:

```text
success
failure
```

Scenario inputs carry both:

```text
text
codePoints
```

The harness treats any mismatch between them as a configuration failure.

## 3. Profile Scenario Harness

Phase 6 implements deterministic scenario execution through the real Core
forward translator.

Artifacts:

```text
tools/conformance/profile-scenario-harness.mjs
tools/conformance/profile-scenario-harness.test.mjs
docs/conformance/phase-6.3-profile-scenario-harness.md
```

Execution path:

```text
scenario document
    |
    v
schema validation
    |
    v
Unicode text/codePoints integrity
    |
    v
profile ID/version pinning
    |
    v
Core createForwardTranslator()
    |
    v
typed success/failure comparison
    |
    v
deterministic ScenarioResult
```

The harness does not duplicate translation semantics.

It distinguishes:

```text
invalid scenario/configuration -> ProfileScenarioHarnessError
valid scenario, wrong behavior -> status=fail + diagnostics
```

Current harness regression suite:

```text
10 tests
10 pass
0 fail
```

## 4. Composition & Negative Suites

Phase 6 adds a finite committed profile-level corpus under:

```text
conformance/scenarios
```

Current corpus:

```text
total       15
required    13
draft        2
```

All frozen categories are represented:

```text
persian                 1
sequence                1
numeric                 4
latin                   2
layout-normalization    2
mixed                   2
negative                3
```

Expectation kinds:

```text
success                 12
failure                  3
```

Representative composition boundaries include:

```text
Persian word execution
sequence precedence + scalar continuation
ASCII numeric run
numeric decimal context
numeric-begin behavior
Persian-digit numeric run
Latin embedded span
Latin capital indicator
ZWNJ normalization/layout composition
Persian + ZWNJ
Persian -> numeric transition
Latin -> numeric transition
unknown scalar failure
unknown format-control preprocessing failure
valid prefix + later unknown scalar
```

Artifacts:

```text
tools/conformance/profile-scenario-suite.test.mjs
docs/conformance/phase-6.4-composition-negative-suites.md
```

### ZWNJ profile-composition correction

The first profile-level corpus execution exposed a real cross-layer aggregation
bug that the Phase 5 single-rule suite did not detect.

Phase 4 preprocessing intentionally preserved both ZWNJ semantic rule layers in
its annotation, while Phase 5 textual execution separately executed the ZWNJ
layout rule.

The old forward aggregate copied all preprocessing structural tokens and then
appended the layout token again.

This caused duplicate layout output.

Phase 6 corrected the aggregation so preprocessing contributes only
normalization-rule structural tokens to the final aggregate, while textual
layout execution contributes the layout token exactly once.

The final exact ZWNJ aggregate is:

```text
normalization:zwnj-orthographic-boundary
layout:shaping-control:U+200C
```

The Phase 5 forward regression was strengthened to assert this exact result.

After correction:

```text
Core tests                 210 / 210 PASS
Phase 6 harness/suite       14 / 14 PASS
ZWNJ exact aggregation      PASS
```

## 5. Reporting & CI Enforcement

Phase 6 adds deterministic machine-readable profile reporting.

Committed report:

```text
conformance/reports/fa-ir-g1-0.1.0.json
```

Report generator and tests:

```text
tools/conformance/profile-conformance-report.mjs
tools/conformance/profile-conformance-report.test.mjs
```

Documentation:

```text
docs/conformance/phase-6.5-reporting-ci.md
```

Root commands:

```text
pnpm run conformance:write-report
pnpm run test:conformance
pnpm run validate:conformance
```

Current profile report fixed point:

```text
Profile: fa-ir-g1 0.1.0 (draft)

Scenarios: 15

Lifecycle:
  required = 13
  draft    = 2

Results:
  pass = 15
  fail = 0

Expectation kinds:
  success = 12
  failure = 3
```

Phase 6 conformance tooling tests:

```text
tests  22
pass   22
fail    0
```

`validate:conformance` additionally verifies:

```text
scenario execution
report schema validity
required-scenario gate
coverage gate
deterministic result ordering
deterministic serialization
committed report freshness
```

## CI integration

Architecture Validation reacts to:

```text
conformance/**
docs/conformance/**
tools/conformance/**
```

and runs:

```text
pnpm run validate:conformance
```

Specification Validation remains independent.

Runtime conformance therefore does not become normative-promotion authority.

## Current complete regression fixed point

Before this closure record is committed, the branch must pass:

```text
pnpm run clean

pnpm run build
pnpm run typecheck
pnpm run validate:normalization
pnpm run validate:architecture
pnpm run validate:runtime
pnpm run test
pnpm run validate:conformance

pnpm run clean
git diff --check
```

Current expected regression counts:

```text
Core tests                 210 / 210 PASS
Phase 6 conformance tests   22 / 22 PASS
Profile scenarios           15 / 15 PASS
Required scenarios          13 / 13 PASS
Draft scenarios              2 / 2 PASS
```

Repository hygiene must show no tracked:

```text
dist
node_modules
*.tsbuildinfo
packages/core/src/generated
```

## Architecture invariants preserved

The dependency direction remains:

```text
specification
    |
    v
core
    |
    v
sdk
    |
    +--> cli
    +--> web
    +--> integrations/microsoft365
```

The conformance tooling consumes Core.

It does not become a new translation implementation.

The architecture principle remains:

```text
Specification owns the rules.
Core executes them.
SDK exposes them.
Microsoft 365 is one consumer.
```

## Specification-governance invariants preserved

Phase 6 does not alter normative promotion.

In particular:

```text
candidate != normative
draft canonical vector != active canonical vector
required profile scenario != normative rule
draft profile scenario != candidate rule
runtime admission != normative promotion
scenario PASS != normative promotion
report PASS != normative promotion
CI PASS != normative promotion
```

The profile remains:

```text
fa-ir-g1 0.1.0
status = draft
```

## Explicitly outside Phase 6

Phase 6 does not implement:

```text
public SDK surface
CLI translation UX
Web playground UI
Microsoft 365 Office Add-in behavior
reverse translation
Braille Music
multi-language Braille framework
normative promotion of draft/candidate material
```

These remain later roadmap responsibilities.

## Phase 7 boundary

The next roadmap phase is:

**Phase 7 — Public SDK**

Phase 7 may expose the stable Core translation capabilities through a
consumer-facing SDK while preserving:

```text
Specification -> Core -> SDK
```

Phase 7 must not move specification ownership or translation semantics into the
SDK layer.

## Required pull-request closure

After the closure commit is pushed, the pull request must return green for all
required repository checks, including the Architecture Validation workflow
that now runs profile conformance.

Only then may the closure commit be merged.

## Closure statement

Presence of this document on `main` means the Phase 6 feature branch passed the
required local and GitHub validation fixed point and was merged deliberately.

At that point:

**Phase 6 — Conformance Suite: CLOSED**
