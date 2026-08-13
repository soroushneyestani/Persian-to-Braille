# Phase 3 — Specification Consumption Contract

## Status

The runtime specification-consumption boundary is frozen for Phase 3.

## Source of truth

The canonical Persian Braille specification remains under:

```text
spec/fa-ir/
```

TypeScript source code is not a second source of Braille rules.

The runtime bundle consumed by `@persian-braille/core` is a deterministic,
generated derivative of the canonical profile and rule records.

## Runtime admission boundary

The active runtime rule set is profile-driven:

```text
spec/fa-ir/profiles/fa-ir-g1.json
              |
              | ruleIds
              v
spec/fa-ir/rules/records/*.json
              |
              v
deterministic runtime bundle
              |
              v
@persian-braille/core
```

The builder resolves rules in `profile.ruleIds` order and fails if:

- a profile rule ID is missing;
- profile rule IDs are duplicated;
- a referenced rule belongs to another profile;
- two rule records share an ID;
- a rule for the current profile exists on disk but is omitted from
  `profile.ruleIds`.

This makes the profile the explicit admission list for runtime rules.

## Lifecycle preservation

The generated runtime bundle preserves the complete canonical rule documents,
including their lifecycle state.

At the Phase 2 closure baseline this means both:

```text
normative
candidate
```

rules remain distinguishable at runtime. Candidate materialization does not
silently become normative promotion.

## Runtime payload

The runtime bundle contains:

- canonical profile document;
- all profile-admitted rule documents;
- computed status/type counts;
- canonical JSON SHA-256 provenance digests;
- canonical source paths.

It intentionally does not include adjudication records, governance records,
promotion records, or conformance vectors in the production runtime payload.

Those artifacts remain available to repository validation and conformance
testing without being shipped merely to perform translation.

## Determinism

The generated module contains no timestamp or machine-specific path.

Its content depends only on the canonical JSON meaning of the admitted profile
and rule documents plus stable repository-relative source labels.

Regenerating from unchanged canonical inputs must produce byte-identical
output.

## Generated-source policy

The generated TypeScript module lives under:

```text
packages/core/src/generated/
```

and is ignored by Git.

It is recreated by:

```text
pnpm run spec:bundle
```

and automatically before `@persian-braille/core` build/typecheck.

The generator itself is tracked. The derivative payload is not.

## Core API boundary

`@persian-braille/core` exposes a stable specification-facing API without
exporting a gigantic literal TypeScript type derived from every rule.

The initial Phase 3 API exposes the runtime bundle as JSON-shaped immutable
interfaces. Translation semantics are intentionally not implemented here.

## Phase boundary

This phase defines how canonical specification data enters the future engine.

It does not implement:

- Unicode normalization behavior;
- rule matching;
- context resolution;
- mode transitions;
- layout semantics;
- translation;
- reverse translation.

Those behaviors belong to subsequent implementation phases.
