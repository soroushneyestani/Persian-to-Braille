# Phase 4.5 — CI / Regression Enforcement

## Status

**Phase 4.5: CI CONTRACT ESTABLISHED**

This deliverable makes the frozen Phase 4 normalization assumptions and the
Core normalization conformance suite part of the repository CI gate.

## CI ownership

Phase 4 continues to use the existing `Architecture Validation` workflow.

A separate normalization workflow is intentionally not introduced because
normalization is an implementation concern inside the v2 Core architecture.

The existing `Specification Validation` workflow remains independent and
continues to own Phase 2 specification/governance validation.

## Frozen normalization baseline validator

The repository now provides:

```text
pnpm run validate:normalization
```

implemented by:

```text
tools/normalization/validate-phase4-normalization.mjs
```

The validator fails closed if the canonical specification changes any Phase 4
assumption that the current implementation is not authorized to handle.

It enforces the current baseline:

```text
profile                       fa-ir-g1 0.1.0
unicodeForm                   none
unknownFormatControls         error
canonicalInput rewrites       0
normalization rules           exactly 1
normalization rule            FA-G1-NORM-ZWNJ-001
ZWNJ normalization status     candidate
ZWNJ layout status            candidate
known format controls         U+200B,U+200C,U+2060,U+FEFF
ZWNJ conformance vector       draft
```

A future legitimate specification change must therefore update the
implementation and its Phase 4 contract deliberately rather than silently
changing runtime behavior.

## Runtime conformance enforcement

The existing repository-wide:

```text
pnpm run test
```

now executes the Core normalization suite because
`@persian-braille/core` defines its package-level test command.

The architecture CI already runs the repository-wide test command, so the
normalization suite becomes a required CI regression gate without duplicating
the test execution.

## Workflow triggers

The Architecture Validation workflow now also watches:

```text
docs/normalization/**
tools/normalization/**
```

Package implementation/test changes were already covered by:

```text
packages/**
```

This ensures normalization implementation, tests, validation tooling, and
contract documentation all cause the architecture CI gate to run.

## CI sequence

The architecture workflow validates, in order:

```text
workspace installation
architecture contracts
Phase 4 normalization baseline
workspace build
workspace typecheck
compiled Core specification consumption
workspace tests (including Phase 4 normalization suite)
cleanup
clean-repository fixed point
```

## Separation from specification governance

Phase 4 CI does not promote candidate rules and does not modify the canonical
specification.

The Phase 2 specification workflow remains the authority for schemas,
governance, adjudication, promotion, conformance artifact reproducibility, and
canonical specification integrity.

## Exit condition

Phase 4.5 is complete only after:

- local `validate:normalization` passes;
- all nine normalization tests pass;
- build/typecheck/architecture/runtime validation pass;
- the branch is pushed;
- GitHub `Architecture Validation` passes with the Phase 4 changes;
- GitHub `Specification Validation` remains green.

After those conditions, only **Phase 4.6 — Closure** remains.
