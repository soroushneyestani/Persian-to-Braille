# Phase 15.5B3.3d — Indicator Materialization Model

## Status

**INDICATOR_MATERIALIZATION_MODEL_FROZEN**

This phase freezes the durable materialization model for the exact
Basisschrift `INDICATOR` primary-role set.

No contract schema or contract data file is created in this step.

## Adjudication

Broad indicator-relevant candidate pool:

**49**

Exact primary-role `INDICATOR` set:

**20**

Excluded broad candidates:

**29**

Remaining B3 rules after future Indicator materialization:

**87**

Indicator adjudication SHA-256:

`89FE527A937DFA115ADE87156F0237C8162FD6EF0104373AB95F44110AA73742`

## Future topology

Schema:

`spec/de/schema/contract-materialization-set.schema.json`

Contract directory:

`spec/de/contracts`

Indicator contract set:

`spec/de/contracts/de-basisschrift-indicators.json`

The contract directory does not exist yet and is intentionally created
only when materialization starts.

## Separation of layers

The B3 contract layer is separate from:

1. the immutable canonical German rule layer;
2. the B2 runtime-classification layer;
3. executable runtime lowering;
4. the German runtime bundle.

Materializing a contract is not the same as making that contract
executable.

## Record model

Every materialized Indicator record will contain:

- canonical rule ID;
- source rule path;
- source SHA-256;
- family;
- source kind;
- source section;
- primary role;
- materialization owner;
- adjudication rationale;
- source normative/status metadata;
- validation-case bindings;
- a lossless copy of the canonical semantic payload;
- explicit indicator-form roots when the source carries them;
- an explicit non-executable execution state.

Canonical records remain unchanged.

## Indicator forms

An explicit Braille form is **not required** for an Indicator contract.

Two exact Indicator rules are policy-level indicators without explicit
form roots:

- `DE-ACCENT-004`
- `DE-MATH-010`

`DE-CASE-013` has multiple explicit form roots:

- `prefix`
- `caseMarkers`

Therefore the contract model permits zero, one, or multiple explicit
form roots.

## Semantic preservation

`semanticPayload` is an exact, lossless copy of the canonical rule's
`semantics` object.

B3.3 does not reinterpret or lower that payload.

## Future materialized set

The future set will contain exactly **20** records and every record will
have:

`primaryRole = INDICATOR`

and:

`materializationOwner = 15.5B3.3`

The other **87** B3 rules remain unassigned until their owning B3
substeps.

## Execution boundary

No schema has been created.

No contract directory has been created.

No Indicator contract set has been created.

Formal materialized primary-role assignments remain **0**.

No behavioral lowering has started.

No numeric state machine has started.

No German translator has started.

No German runtime bundle has been generated or registered.

## Deterministic materialization model

`EAABC57C7D715B5EC4B5AD186C84E5FB7618EAC2F3BB47D207D1108C9F48177B`

## Next

**15.5B3.3e — Materialize 20 Indicator Contracts**
