# Phase 7.1 — Public SDK Baseline Audit

## Status

**Phase 7.1: CLOSED**

This audit freezes the starting point for the public SDK work.

Phase 7 does not create translation semantics. The SDK is an API and packaging
layer over Core.

The architecture boundary remains:

```text
Specification -> Core -> SDK -> Consumers
```

## Current SDK package

```text
package        @persian-braille/sdk
version        2.0.0-dev
module type    ESM
```

The package already has:

```text
types   ./dist/index.d.ts

exports
  ".":
    import  ./dist/index.js
    types   ./dist/index.d.ts

files
  dist
```

It also already depends on:

```text
@persian-braille/core = workspace:*
```

This means Phase 7 is not starting from an empty package.

## Current source footprint

The SDK currently has exactly one source file:

```text
packages/sdk/src/index.ts
```

Therefore the public SDK surface is still only a skeleton.

Phase 7.2 must define the consumer-facing API contract before adding behavior.

## Current SDK tests

The baseline contains:

```text
dedicated SDK tests = 0
```

This is a real Phase 7 deliverable.

SDK tests must validate the consumer contract rather than duplicate Core
translation-engine tests.

## Existing package readiness

Already present:

```text
packages/sdk/tsconfig.json
packages/sdk/README.md
```

Not currently present:

```text
packages/sdk/LICENSE
packages/sdk/.npmignore
```

Absence of `.npmignore` is not itself a problem because the package already
uses an explicit `files` allowlist.

License packaging must be resolved by Phase 7.5 from repository-level license
policy rather than inventing a new SDK-only license.

## Core public surface

Core currently exports eight implementation/domain modules through its root
index:

```text
specification
normalization
unicode-preprocessor
translation
rule-selector
engine-token-producer
mode-rule-executor
forward-translator
```

The public SDK must not simply re-export this entire implementation surface.

Phase 7 must provide a deliberately smaller consumer contract.

In particular, rule selection, engine token production, mode-rule execution,
and normalization internals remain Core concerns unless a future public API
decision explicitly promotes a stable abstraction.

## Current consumer topology

Three workspace consumer packages already declare the SDK as their dependency:

```text
apps/cli
apps/web
integrations/microsoft365
```

The audit found:

```text
direct Core imports outside SDK = 0
```

This is an important architecture invariant to preserve.

Consumers should continue to depend on SDK rather than bypassing it and
importing Core directly.

## Root release tooling baseline

There are currently no root scripts specifically for:

```text
SDK packaging
npm pack verification
SDK publication
```

Phase 7.5 therefore has a concrete packaging/release-readiness task.

## Frozen release-readiness gaps

The baseline identified exactly two current gaps:

```text
1. no dedicated SDK tests
2. minimal public-publication metadata
```

The package already has an exports map, types entry, published-files allowlist,
README, version, and Core dependency.

## Frozen Phase 7 problem statement

Phase 7 exists to turn the current SDK skeleton into a stable
consumer-oriented interface over Core.

The missing capabilities are:

```text
explicit public API contract
consumer-friendly translator facade
stable success/failure surface
profile metadata exposure
dedicated SDK tests
consumer compatibility checks
public package metadata
package-content verification
release-readiness validation
```

## Non-goals

Phase 7 does not:

```text
change Braille mappings
change Core precedence semantics
change normalization semantics
change profile conformance behavior
promote candidate rules
change profile status
implement CLI UX
implement Web UI
implement Microsoft 365 Office behavior
implement reverse translation
implement Braille Music
```

## Frozen Phase 7 exit criteria

Phase 7 remains finite and is defined by exactly six deliverables:

```text
1. SDK Baseline Audit
2. Public API Contract
3. SDK Implementation
4. Consumer & Error-Surface Tests
5. Packaging & Release Readiness
6. Phase 7 Closure
```

### 1. SDK Baseline Audit

Freeze package topology, current exports, tests, consumers, and release gaps.

### 2. Public API Contract

Define the stable consumer-facing API and types.

No SDK translation behavior is implemented here.

### 3. SDK Implementation

Implement the public facade strictly as a consumer of Core.

No mapping or translation semantics may be duplicated in SDK.

### 4. Consumer & Error-Surface Tests

Add dedicated SDK tests and representative consumer-contract verification,
including stable failure behavior.

### 5. Packaging & Release Readiness

Freeze public package metadata, verify package contents, add packaging
validation, and make the SDK releasable without publishing it automatically.

### 6. Phase 7 Closure

Run the complete local/CI fixed point, freeze final SDK invariants, and merge
only after required checks are green.

## Handoff

The next deliverable is:

**Phase 7.2 — Public API Contract**

It must define the public SDK surface before the SDK implementation is
expanded.
