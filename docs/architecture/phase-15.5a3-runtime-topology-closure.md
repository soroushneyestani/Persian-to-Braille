# Phase 15.5A3 — German Runtime Specification Topology Closure

## Status

**CLOSED**

Subphase: `15.5A3.5`

Baseline:

`ca22fadb2087ea56697f034d047ce3d6c38b3127`

## Closed milestones

### 15.5A3.2 — Manifest-Driven Runtime Bundle Generator

Commit:

`c380315611252226770546436f2c1b6674fb0532`

### 15.5A3.3 — Persian Runtime Compatibility Proof

Commit:

`973d830017568d8e15be284f865b6bc6979d8990`

### 15.5A3.4 — German Empty Canonical Topology Admission

Commit:

`ca22fadb2087ea56697f034d047ce3d6c38b3127`

## Frozen runtime topology

Internal German runtime model:

`THREE_INTERNAL_EXECUTABLE_BUNDLES`

German modes:

- `basisschrift`
- `vollschrift`
- `kurzschrift`

Swiss behavior remains:

`ORTHOGONAL_OVERLAY`

Swiss is not a fourth German mode.

## Runtime admission at closure

The runtime bundle manifest still admits exactly one executable bundle:

`fa-ir-g1`

German executable admission remains zero:

- German profiles: `0`
- German rules: `0`
- German regional rules: `0`
- German mappings: `0`
- German generated runtime bundles: `0`

## Persian compatibility invariant

Generated Persian runtime:

`packages/core/src/generated/fa-ir-g1.runtime.ts`

SHA-256:

`09D350BD40C4E801377A59CEC6D0BEDA56D0CD2B0C80708C38E4753BDBEC4094`

This remains byte-for-byte compatible with the frozen pre-A3 baseline.

## Verification gates

- German empty topology validator: **PASS**
- Runtime specification determinism: **PASS**
- Compiled Core runtime consumption: **PASS**
- Core regression: **PASS**

## Deferred decisions

The following are intentionally not resolved by A3:

- public German profile identifier,
- public Swiss profile identifier,
- German SDK API,
- executable German mode contract,
- Swiss regional runtime contract,
- `SWISS_EXPLICIT_ESZETT_INPUT_POLICY`,
- German mappings,
- German reverse translation.

## Next

**Phase 15.5A4 — German Mode Contract**
