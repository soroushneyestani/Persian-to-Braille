# Phase 15.5B3.5d — Structural / Behavioral Contract Materialization

## Status

**STRUCTURAL_BEHAVIORAL_CONTRACTS_MATERIALIZED_NON_EXECUTABLE**

## Assignment state

B3 scope:

**107**

Existing assignments before B3.5:

**54**

New `STRUCTURAL` assignments:

**19**

New `BEHAVIORAL_CONSTRAINT` assignments:

**14**

Total new assignments:

**33**

Total materialized assignments:

**87**

Remaining unassigned:

**20**

## Structural contracts

`spec/de/contracts/de-basisschrift-structural.json`

Records:

**19**

SHA-256:

`2E46C9D74FBC01797A8E64FFFCF621F7C695C0E147D88A5FBB6A996257FAE4AC`

Canonical JSON SHA-256:

`8A5DC08F277B23D12FAB6400C9108068A0668FE8A951100912E1FD7D94A3E5AF`

Records canonical JSON SHA-256:

`1493C753D66AFA3F0A783240A141B21D363EEE39AF43AE206D8FD612BD392BC2`

## Behavioral Constraint contracts

`spec/de/contracts/de-basisschrift-behavioral-constraint.json`

Records:

**14**

SHA-256:

`14FA11CB29408FDC50DCD35A78320001DDF55D7050EEB9A381BFD6F0D8740960`

Canonical JSON SHA-256:

`B03FD5D7AF0FB12B89EE15D3736820BEFFF559D8F594AE562AEAA367FB91E2B4`

Records canonical JSON SHA-256:

`062EF5727F77C34C1674CD2F2F31A4DE10E5D91B25B82D7F5B333C44CB867C91`

## Schema boundary

The existing role-neutral schema is reused unchanged:

`spec/de/schema/contract-role-materialization-set.schema.json`

No schema was created or mutated in B3.5d.

## Integrity

Structural semantic copies:

**19/19**

Behavioral semantic copies:

**14/14**

Structural source bindings:

**19/19**

Behavioral source bindings:

**14/14**

Structural validation bindings:

**19/19**

Behavioral validation bindings:

**14/14**

All materialized primary-role sets remain disjoint.

All 150 canonical German records remain unmodified.

## Remaining B3 scope

Exactly **20** rules remain unassigned.

They are reserved for B3.6 adjudication across:

- `DELEGATED_REFERENCE`
- `REFERENCE_ONLY`
- `CROSS_MODE_DEFERRED`
- `ARCHITECTURAL_ONLY`

No B3.6 role is assigned by this step.

## Execution boundary

Contract materialization is complete for Structural and Behavioral
Constraint roles.

Behavioral lowering has **not** started.

The numeric state machine has **not** started.

The translator has **not** started.

No German runtime bundle has been generated or registered.

## Next

Independent validation and repository closure of **15.5B3.5d**.
