# Phase 15.5B3.4c — State / Policy Materialization Model

## Status

**STATE_POLICY_MATERIALIZATION_MODEL_FROZEN**

This phase freezes the materialization model for two exact Basisschrift
primary-role sets:

- `STATE_SCOPE` — **12**
- `POLICY_SELECTION` — **22**

No new contract set is materialized in this step.

## Existing assignment baseline

B3 scope:

**107**

Already materialized `INDICATOR` contracts:

**20**

Remaining before B3.4:

**87**

## B3.4 adjudication

Broad State/Policy candidate pool:

**64**

Exact `STATE_SCOPE` set:

**12**

Exact `POLICY_SELECTION` set:

**22**

Excluded from B3.4:

**30**

Future new assignments:

**34**

Future total assignments after B3.4:

**54**

Future remaining unassigned:

**53**

State/Policy adjudication SHA-256:

`E867AF4B2F273F97C0BE787BE8DBC102E3EB77906079126137F3F854E3AF4589`

## Schema boundary

The existing B3.3 schema is frozen:

`spec/de/schema/contract-materialization-set.schema.json`

It is intentionally **not** reused for B3.4 because its record contract
requires the Indicator-specific field:

`explicitIndicatorFormRoots`

Closed B3.3 artifacts remain immutable.

A role-neutral schema will instead be created during B3.4 materialization:

`spec/de/schema/contract-role-materialization-set.schema.json`

## Future contract topology

State Scope:

`spec/de/contracts/de-basisschrift-state-scope.json`

Policy Selection:

`spec/de/contracts/de-basisschrift-policy-selection.json`

## Role-neutral record model

Every B3.4 materialized record will preserve:

- canonical rule ID;
- canonical source path;
- canonical source SHA-256;
- family;
- kind;
- source section;
- exactly one primary role;
- materialization owner;
- adjudication rationale;
- source normative/status metadata;
- validation-case bindings;
- the complete canonical `semantics` object as `semanticPayload`;
- optional top-level `semanticEvidenceRoots` metadata;
- an explicit non-executable execution state.

`semanticEvidenceRoots` is metadata only.

It does not replace, truncate, normalize or reinterpret
`semanticPayload`.

## Execution boundary

The existing 20 Indicator assignments remain materialized.

Formal State Scope assignments remain **0**.

Formal Policy Selection assignments remain **0**.

Total materialized primary-role assignments therefore remain **20**.

Remaining unassigned B3 rules remain **87**.

No behavioral lowering has started.

No numeric state machine has started.

No translator has started.

No German runtime bundle has been generated or registered.

## Materialization model SHA-256

`B358212E7F08B26AFE1D4C5EAC1080FCD025B693E2AD2BF83F665F2AC409F475`

## Next

**15.5B3.4d — Materialize State Scope and Policy Selection Contracts**
