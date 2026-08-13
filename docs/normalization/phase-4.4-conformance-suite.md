# Phase 4.4 — Normalization Conformance Suite

## Status

**Phase 4.4: CONFORMANCE SUITE ESTABLISHED**

This deliverable converts the Phase 4.3 manual smoke checks into a committed,
repeatable Core test suite.

## Test runner

The Core package uses the Node.js built-in test runner.

No new third-party test framework is introduced.

The package command is:

```text
pnpm --filter @persian-braille/core run test
```

and the repository-wide command remains:

```text
pnpm run test
```

## Coverage

The suite verifies the following Phase 4 normalization invariants.

### Plain-text preservation

Ordinary Persian text must pass through unchanged:

```text
outputText === inputText
changed === false
annotations.length === 0
```

### No invented orthographic rewriting

Arabic-script spelling variants that are not canonically authorized for
normalization remain unchanged.

This protects the Phase 2 deferred evidence boundary from accidental
hard-coded rewriting.

### Canonical format-control admission

The suite discovers every admitted single-code-point Unicode format control
from the canonical runtime specification and verifies that the preprocessor
recognizes it.

The test does not maintain a second hard-coded list of all admitted format
controls.

### Canonical ZWNJ conformance bridge

The suite reads the canonical Phase 2 draft vector:

```text
FA-CONF-NORM-ZWNJ-001
```

directly from `spec/fa-ir/conformance/records/` and verifies that the
vector-scoped rule IDs and structural tokens are present in Core output.

The assertion is intentionally subset-based. A conformance vector is scoped
to its own rule IDs, while the normalization preprocessor may preserve
additional cross-layer annotations for the same Unicode scalar. For ZWNJ,
the layout rule is therefore allowed alongside the normalization rule.

This gives Phase 4 an implementation-level bridge to the canonical
conformance corpus without copying the vector into TypeScript source or
incorrectly requiring vector scope to equal the complete cross-layer runtime
annotation.

### ZWNJ cross-layer preservation

The suite explicitly verifies the current intentional U+200C representation:

```text
FA-G1-LAYOUT-027
FA-G1-NORM-ZWNJ-001
```

including structural tokens and candidate lifecycle states.

### Unicode position accounting

A supplementary-plane character is placed before ZWNJ to prove that:

```text
codePointIndex
utf16Index
```

remain distinct and correct.

The test source uses `\u{1F600}` rather than a literal emoji so the test is
independent of terminal/code-page behavior.

### Unknown format-control rejection

U+200D ZERO WIDTH JOINER is currently not admitted by the canonical profile
rule set.

The suite verifies a typed:

```text
UNKNOWN_FORMAT_CONTROL
```

failure with correct Unicode and UTF-16 positions.

### Determinism

Repeated preprocessing of the same input must produce deeply identical
results.

### Idempotence-compatible behavior

Under the current `unicodeForm = none` and no-rewrite policy, preprocessing
the successful output again must produce the same result.

This is intentionally scoped to the current Phase 4 baseline.

## Relationship to canonical conformance data

The Core suite is an implementation-level regression suite. It does not
replace or rewrite the Phase 2 conformance corpus.

Phase 4.5 will connect the normalization implementation suite to the CI
regression gate while preserving the existing specification-validation
workflow.

## Handoff

The next deliverable is:

**Phase 4.5 — CI / Regression Enforcement**
