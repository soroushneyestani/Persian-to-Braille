# Phase 8.5 — Consumer Integration & Regression

## Status

**Phase 8.5: IMPLEMENTED**

This deliverable validates the completed Phase 8 CLI and Web consumers together
against the public SDK.

It introduces no new translation feature.

## Purpose

Phase 8.3 and 8.4 already verify each consumer independently.

Phase 8.5 adds cross-consumer invariants:

```text
SDK result
   ├── CLI JSON
   └── Web projection
```

For the same input and bundled profile, both consumer surfaces must preserve the
same public translation outcome.

## Integration suite

```text
tools/consumers/phase8-consumer-integration.test.mjs
```

Root gate:

```text
pnpm run validate:phase8-consumers
```

The gate first executes the root workspace build so all package export
boundaries are materialized from a clean state, then executes the integration
suite.

## Success parity

The suite verifies a normal Persian translation across:

```text
@persian-braille/sdk
@persian-braille/cli JSON mode
@persian-braille/web public projection
```

The consumers preserve:

```text
unicodeBraille
cells
normalizedText
structuralTokens
```

The applications do not recompute these values.

## Layout-bearing input

A multiline input is included to ensure consumer orchestration does not trim or
rewrite layout-bearing text before SDK translation.

The CLI JSON `result.input` and SDK `result.input` must remain the exact supplied
string.

## U+0622 / ALEF WITH MADDA parity

The Phase 8 manual browser audit exposed U+0622 (`آ`) as a useful current
specification-edge case.

Phase 8.5 intentionally does **not** hard-code its current semantic result.

Instead:

```text
expected = current public SDK result
CLI must equal expected
Web must equal expected
```

This distinction is important. The regression suite freezes consumer parity,
not the future adjudication of a specification candidate.

If a later specification phase legitimately admits U+0622, this integration
test remains valid as long as CLI and Web continue to reflect the SDK result.

## Expected failure parity

An unsupported emoji input verifies expected-failure parity.

The integration contract preserves:

```text
SDK failure code
CLI JSON failure result
CLI process exit code = 1
Web failure code/message
```

## Profile parity

The bundled profile is checked across:

```text
translator.profile
persian-braille profile --format=json
Web controller profile
```

No consumer may invent a different profile lifecycle status.

## Determinism

Repeated CLI JSON execution for the same input must be byte-identical.

Repeated Web projection of the same public SDK result must be structurally
identical.

## Public boundary

The suite checks that CLI JSON remains the public SDK projection and does not
surface known Core-only execution concepts.

This complements, rather than replaces, the repository package-boundary
validator.

## CI integration

The existing Architecture Validation workflow runs:

```text
pnpm run validate:phase8-consumers
```

after workspace package tests.

The workflow push path filter explicitly includes:

```text
tools/consumers/**
```

so a future change limited to the Phase 8 consumer-integration harness still
triggers Architecture Validation on `main`.

Therefore Phase 8 consumer parity is enforced on pull requests, merge queues,
manual workflow runs, and relevant pushes to `main`.

## Fixed-point expectations

Phase 8.5 must pass together with:

```text
pnpm run typecheck
pnpm run test
pnpm run validate:normalization
pnpm run validate:architecture
pnpm run validate:runtime
pnpm run validate:conformance
pnpm run validate:sdk-package
pnpm run validate:phase8-consumers
```

followed by repository cleanup and hygiene checks.

## Explicitly unchanged

Phase 8.5 does not change:

```text
canonical specification
Core semantics
SDK public API
CLI behavior
Web behavior
profile lifecycle
Microsoft 365 integration
npm publication
```

## Next

After this integration gate reaches a clean fixed point, the final finite
deliverable is:

**Phase 8.6 — Phase 8 Closure**
