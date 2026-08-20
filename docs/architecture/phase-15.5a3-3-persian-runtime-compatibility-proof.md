# Phase 15.5A3.3 — Persian Runtime Compatibility Proof

## Status

**PASS**

## Baseline

- Branch: `phase15-german-braille`
- Pre-manifest builder baseline: `3db6701e9718b40c22d1c987d90e8a08db543c2b`
- Manifest-driven builder commit: `c380315611252226770546436f2c1b6674fb0532`

## Persian Runtime Invariant

Generated runtime:

`packages/core/src/generated/fa-ir-g1.runtime.ts`

SHA-256:

`09D350BD40C4E801377A59CEC6D0BEDA56D0CD2B0C80708C38E4753BDBEC4094`

The SHA-256 is byte-for-byte identical to the frozen pre-refactor runtime baseline.

Canonical source SHA-256:

`82fa5523b90c3b422542ba1f43ccbcdadc94bd9c38cf224672d60ee3621a13d9`

## Canonical Runtime Inventory

- Profile: `fa-ir-g1`
- Version: `0.1.0`
- Status: `draft`
- Rules: `176`
- Candidate rules: `139`
- Normative rules: `37`

Rule types:

- character: `133`
- context: `7`
- layout: `27`
- mode: `5`
- normalization: `1`
- sequence: `3`

## Verification Gates

- Manifest-driven runtime builder: **PASS**
- Generated runtime byte compatibility: **PASS**
- Generated runtime Git diff: **NONE**
- Runtime specification determinism: **PASS**
- Compiled Core specification consumption: **PASS**
- Core regression: **223 / 223 PASS**

## Compatibility Decision

Phase 15.5A3.2 changed runtime bundle discovery/configuration from a hard-coded Persian builder to a manifest-driven builder.

It did **not** change:

- the canonical Persian specification,
- the generated Persian runtime bytes,
- Persian execution semantics,
- existing Persian API behavior.

The manifest currently admits only `fa-ir-g1`.

No German profile, German rule, German runtime bundle, Swiss runtime behavior, or German Braille mapping is admitted by this proof.

## Next

**Phase 15.5A3.4 — German Empty Canonical Topology Admission**
