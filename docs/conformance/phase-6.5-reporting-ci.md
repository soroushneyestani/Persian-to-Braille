# Phase 6.5 — Reporting & CI Enforcement

## Status

**Phase 6.5: IMPLEMENTED**

This deliverable turns the Phase 6 profile scenario corpus into a deterministic
machine-readable conformance gate.

## Report artifact

The committed report is:

```text
conformance/reports/fa-ir-g1-0.1.0.json
```

It conforms to:

```text
conformance/schema/conformance-report.schema.json
```

The report is generated from the committed scenario corpus and real Core
execution. It is not hand-authored.

## Current coverage fixed point

The Phase 6.4 corpus currently contains:

```text
total       15
required    13
draft        2
success     12
failure      3
```

Category coverage:

```text
persian                 1
sequence                1
numeric                 4
latin                   2
layout-normalization    2
mixed                   2
negative                3
```

## Required-scenario gate

`required` scenarios are CI-gating.

If any required scenario returns:

```text
status = fail
```

profile conformance fails.

A draft scenario is still executed and reported, but a draft failure by itself
does not acquire normative-promotion meaning and is not treated as a required
scenario failure.

This preserves the Phase 6 lifecycle contract:

```text
required != normative
draft    != candidate
PASS     != normative promotion
```

## Coverage gate

The Phase 6.5 gate requires non-zero coverage for every frozen Phase 6
category:

```text
persian
sequence
numeric
latin
layout-normalization
mixed
negative
```

It also requires both lifecycle classes and both expectation kinds to be
represented.

This prevents the corpus from silently losing a complete coverage dimension.

## Deterministic report generation

The report excludes volatile execution metadata.

It contains no:

```text
timestamp
duration
hostname
random ID
absolute source path
```

Result ordering is deterministic by scenario ID.

Serialization is stable UTF-8 JSON with a trailing newline.

## Report schema enforcement

Phase 6.5 reuses the finite JSON Schema subset validator from the Phase 6.3
harness.

The validator is now exposed as:

```text
validateJsonSchemaSubset()
```

Both profile scenario documents and the conformance report therefore use the
same fail-closed schema-validation mechanism.

## Commands

Write/update the committed report:

```text
pnpm run conformance:write-report
```

Run the conformance tooling tests:

```text
pnpm run test:conformance
```

Run the full profile conformance fixed point:

```text
pnpm run validate:conformance
```

`validate:conformance` performs:

```text
Core build
harness tests
profile corpus tests
report tests
report freshness check
required-scenario gate
coverage gate
report schema validation
```

## CI enforcement

Architecture Validation is extended to react to:

```text
conformance/**
docs/conformance/**
tools/conformance/**
```

and executes:

```text
pnpm run validate:conformance
```

The runtime conformance layer therefore has its own CI regression gate while
remaining separate from Specification Validation and normative-promotion
governance.

## Regression tests

Phase 6.5 tests:

```text
frozen summary counts
frozen category coverage
lifecycle coverage
success/failure coverage
report schema validity
unsupported report properties
required-scenario failure enforcement
draft-scenario lifecycle behavior
deterministic serialization
deterministic result ordering
committed report freshness
```

## Artifacts

```text
tools/conformance/profile-conformance-report.mjs
tools/conformance/profile-conformance-report.test.mjs
conformance/reports/fa-ir-g1-0.1.0.json
package.json
.github/workflows/architecture-validation.yml
docs/conformance/phase-6.5-reporting-ci.md
```

## Explicitly outside Phase 6.5

This deliverable does not:

```text
change Braille mappings
promote candidate rules
change profile status
implement SDK/CLI/Web/Microsoft 365 behavior
implement reverse translation
implement Braille Music
close Phase 6
```

## Handoff

The next deliverable is:

**Phase 6.6 — Phase 6 Closure**

Closure must run the complete local fixed point, freeze the Phase 6
conformance invariants, push the feature branch, obtain green GitHub
validation, and merge only after the closure commit is green.
