# Phase 6.4 — Composition & Negative Suites

## Status

**Phase 6.4: IMPLEMENTED**

This deliverable creates the first finite committed profile-level conformance
corpus for the draft `fa-ir-g1 0.1.0` profile.

It builds on the Phase 6.3 harness and does not modify canonical Phase 2
single-rule vectors.

## Corpus location

Committed scenarios live under:

```text
conformance/scenarios
```

The corpus contains exactly:

```text
15 scenarios
13 required
2 draft
```

All seven Phase 6 scenario categories are represented:

```text
persian
sequence
numeric
latin
layout-normalization
mixed
negative
```

## Composition coverage

The corpus includes multi-rule/profile-level behavior that did not exist in
the 175 Phase 2 rule vectors.

Representative composition boundaries include:

```text
Persian word execution
sequence precedence followed by scalar continuation
ASCII numeric run
numeric decimal context
numeric-begin without duplicate number indicator
Persian digit numeric run
lowercase Latin embedded span
Latin capital indicator
ZWNJ normalization/layout cross-layer behavior
Persian + ZWNJ composition
Persian -> numeric transition
Latin -> numeric transition
```

Scenarios tagged `composition` are intentionally profile-level. They exercise
multiple admitted rules and/or execution layers through the real forward
translator.

## Negative coverage

The committed runtime-negative corpus includes:

```text
unknown ordinary scalar at input start
unknown Unicode format control during preprocessing
unknown ordinary scalar after a valid translated prefix
```

These are runtime conformance negatives.

They are deliberately separate from the specification/governance validator
negative fixtures under `tools/spec`.

## Required versus draft scenarios

Scenario lifecycle is the independent Phase 6 lifecycle defined in the domain
contract.

Current corpus:

```text
required  13
draft      2
```

Draft scenarios currently pass and are committed for visibility.

Their lifecycle does not imply candidate/normative rule status.

## Exact and invariant assertions

Scenarios assert exact output where appropriate:

```text
cells
unicodeBraille
structuralTokens
```

They additionally use selective trace invariants such as:

```text
requiredRuleIds
forbiddenRuleIds
ruleIdsInOrder
engineTokenClassesInOrder
requiredNormalizationRuleIds
```

This avoids turning every scenario into a brittle full internal trace snapshot
while still testing the execution boundary that motivated the scenario.

## Unicode fixture safety

Every JSON fixture contains both:

```text
input.text
input.codePoints
```

The Phase 6.3 harness verifies exact agreement before translation.

This keeps committed Persian/Braille-related fixtures safe from shell encoding
corruption.

## Corpus regression test

`tools/conformance/profile-scenario-suite.test.mjs` freezes:

```text
scenario count
scenario ID uniqueness
required/draft counts
category coverage
minimum negative coverage
minimum composition coverage
all-scenario PASS state
deterministic execution
deterministic result ordering
```

The suite does not yet generate a machine-readable report.

That remains Phase 6.5.

## Artifacts

```text
conformance/scenarios/*.json
tools/conformance/profile-scenario-suite.test.mjs
docs/conformance/phase-6.4-composition-negative-suites.md
```

## Explicitly outside Phase 6.4

This deliverable does not add:

```text
report generator
coverage report artifact
root conformance command
GitHub conformance CI gate
Braille mappings
normative promotions
SDK/CLI/Web/Microsoft 365 behavior
```

## Phase 6.4 corpus-discovery correction

The first execution of the committed profile corpus exposed four expectation
mismatches.

Three were fixture-authoring mistakes:

```text
Persian word trace used incorrect canonical letter rule IDs.
The `****` scenario assumed the scalar `*` emitted one cell instead of the
canonical two-cell scalar output.
```

The two ZWNJ scenario failures exposed a real forward-aggregation regression:

```text
Phase 4 preprocessing intentionally annotates ZWNJ with both its layout and
normalization structural tokens.

Phase 5 textual execution also executes the ZWNJ layout rule.

The forward translator had copied every preprocessing structural token into
the final aggregate and then appended the layout token again, causing the
layout token to appear twice.
```

The correction keeps the complete Phase 4 annotation in the execution trace,
but imports only normalization-rule structural tokens from preprocessing into
the final translation-level `structuralTokens` aggregate. Layout tokens are
then contributed exactly once by textual layout-rule execution.

The Phase 5 forward regression was strengthened from `includes(...)` checks to
an exact two-token ZWNJ assertion so this duplicate-layer bug cannot regress
silently.

The Phase 6.4 suite is not considered closed until the corrected corpus and
Core aggregation pass together.

## Handoff

The next deliverable is:

**Phase 6.5 — Reporting & CI Enforcement**

It will aggregate deterministic scenario results, enforce required-scenario
success, emit a machine-readable report conforming to the Phase 6.2 report
schema, add coverage gates, and wire profile conformance into CI.
