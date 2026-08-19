# Phase 3 — Architecture Validation Contract

## Status

Repository architecture is enforced locally and in GitHub Actions.

## Validation layers

The architecture gate consists of four independent checks.

### Package boundaries

`pnpm run validate:boundaries` verifies the internal package graph:

```text
core -> none
sdk -> core
cli -> sdk
web -> sdk
microsoft365 -> sdk
```

The validator checks both package manifests and TypeScript source imports.

### Repository hygiene

`pnpm run validate:hygiene` rejects tracked:

```text
node_modules/
dist/
*.tsbuildinfo
packages/core/src/generated/
```

It also verifies the corresponding ignore rules.

### Runtime specification determinism

`pnpm run validate:spec-determinism` regenerates the runtime specification
bundle twice and requires byte-identical output.

### Compiled runtime consumption

After the workspace is built, `pnpm run validate:runtime` imports the compiled
Core package and compares its runtime specification bundle against the
canonical profile and admitted rule documents under `spec/fa-ir/`.

The check is data-driven: legitimate future specification changes do not
require hard-coded rule-count changes in the validator, provided the generated
runtime bundle remains exactly consistent with the canonical specification.

## CI separation

The existing `Specification Validation` workflow remains responsible for the
Phase 2 specification/governance pipeline.

The new `Architecture Validation` workflow is responsible for the v2
TypeScript workspace, package boundaries, specification-consumption boundary,
build/typecheck, runtime smoke validation, and repository hygiene.

Specification profile/rule changes trigger both concerns where appropriate:
the specification workflow validates canonical artifacts, while architecture
validation proves that Core still consumes them correctly.

## Supply-chain posture

GitHub Actions dependencies are pinned to full commit SHAs.

The architecture workflow installs the exact pnpm version and uses the frozen
lockfile with install scripts disabled for the Phase 3 dependency set.

## Clean-checkout invariant

CI must finish with no tracked or untracked repository drift after cleanup.

A successful architecture validation therefore demonstrates:

- workspace installation from the committed lockfile;
- architecture-boundary compliance;
- deterministic runtime-spec generation;
- successful build and typecheck;
- successful compiled-Core specification consumption;
- no generated repository pollution.

## Phase 14 Music Domain Extension

Phase 14 adds `packages/music` as a zero-internal-dependency platform-agnostic
engine and extends the allowed graph to `sdk -> core + music`. Microsoft 365
continues to depend on the SDK only; direct Office-to-music imports remain
forbidden.
