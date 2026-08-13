# Phase 5.5 — Translation Conformance & Regression

## Status

**Phase 5.5: IMPLEMENTED**

This deliverable converts the Phase 5 manual smoke checks into committed,
encoding-safe Node.js tests and adds a canonical single-rule execution bridge
for all 175 current conformance vectors.

It does not replace the broader Phase 6 conformance-suite roadmap.

## Test layers

Core now tests four layers:

```text
Phase 4 Unicode preprocessing
Phase 5.3 rule selection
Phase 5.4 forward translation
canonical rule/vector execution bridge
```

The package test command builds Core once and runs all committed test files
explicitly.

## Encoding safety

All Persian, Braille, format-control, and supplementary-plane regression
inputs that could be corrupted by shell/terminal encoding are represented with
JavaScript Unicode escapes inside committed test files.

This removes the PowerShell here-string ambiguity observed during the manual
Phase 5.4 smoke run.

## Rule-selection regressions

The committed selector suite covers:

```text
*** versus *
numeric-context period versus scalar period
context-ineligible scalar fallback
ezafe sequence precedence
ZWNJ layout/normalization layer separation
unknown scalar no-match
Unicode code-point versus UTF-16 span coordinates
deterministic repeated selection
```

## Forward-pipeline regressions

The committed forward suite covers:

```text
Persian scalar translation
sequence execution
numeric decimal run
numeric-begin behavior
fraction slash inside a numeric run
ASCII/Persian/Arabic-Indic digit families
Latin span begin/end
Latin capitalization
ZWNJ cross-layer structural tokens
unknown ordinary scalar failure
unknown format-control preprocessing failure
empty input
lifecycle provenance
deterministic repeated translation
```

## Canonical 175-vector bridge

The canonical bridge reads the committed specification records directly from:

```text
spec/fa-ir/rules/records
spec/fa-ir/conformance/records
```

It freezes:

```text
175 rules
175 vectors
37 active vectors
138 draft vectors
```

and verifies lifecycle compatibility:

```text
normative rule -> active vector
candidate rule -> draft vector
```

Every current canonical vector is then executed through its owning Core layer.

### Textual/context/sequence/layout rules

These are exercised through the Phase 5.3 selector.

For context vectors, the test harness synthesizes only the declared semantic
`digit` context required by the vector before selecting the target input.

It compares:

```text
ruleId
cells
Unicode Braille
structural tokens
```

### Mode rules

Structural token-class vectors are exercised through the canonical mode-rule
executor.

The test supplies the vector token class and compares the canonical output.

### Normalization rule

The ZWNJ normalization vector is exercised through the Phase 4 preprocessor.

Its rule ID and structural-token expectation must be present in the
preprocessing annotation.

## Why this does not close Phase 6

Phase 5.5 proves that every current single-rule conformance vector has a
deterministic executable Core owner.

Phase 6 remains responsible for a broader profile-level conformance system,
including such concerns as:

```text
multi-rule composition scenarios
negative/invalid-input conformance
profile-level end-to-end vector suites
machine-readable conformance reports
coverage accounting by rule/vector lifecycle and category
future conformance fixtures beyond the current single-rule records
```

Phase 5 therefore does not claim that the complete conformance roadmap is
already finished.

## CI regression enforcement

`Architecture Validation` already executes the repository-wide test command.

This deliverable also adds:

```text
docs/translation/**
tools/translation/**
```

to the Architecture Validation path triggers.

A translation-documentation or translation-audit change therefore participates
in the same architecture CI fixed point.

## Governance

The bridge explicitly checks lifecycle rather than flattening it.

Passing a candidate/draft vector means only that the draft profile executes its
admitted record consistently.

It does not mean normative promotion.

## Handoff

The next deliverable is:

**Phase 5.6 — Phase 5 Closure**

Closure must run the complete local fixed point, freeze Phase 5 artifacts and
invariants, push the feature branch, obtain green GitHub Architecture and
Specification validation, and merge only after the closure commit is green.
