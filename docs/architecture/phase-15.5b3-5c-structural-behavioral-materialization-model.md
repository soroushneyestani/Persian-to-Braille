# Phase 15.5B3.5c — Structural / Behavioral Materialization Model

## Status

**STRUCTURAL_BEHAVIORAL_MATERIALIZATION_MODEL_FROZEN**

No new contract set is materialized in this step.

## Existing assignment baseline

B3 scope:

**107**

Existing materialized assignments:

**54**

Remaining before B3.5:

**53**

## Exact B3.5 adjudication

`STRUCTURAL`:

**19**

`BEHAVIORAL_CONSTRAINT`:

**14**

Excluded from B3.5 and reserved for B3.6 adjudication:

**20**

Future new assignments:

**33**

Future materialized assignment total:

**87**

Future remaining unassigned:

**20**

Structural / Behavioral adjudication SHA-256:

`C0E70546692EB0999E2B2C50BD0C8425CF0D197A5AD5794ACE17C3503B5F2C2B`

## Schema strategy

B3.5 reuses the already-frozen role-neutral schema:

`spec/de/schema/contract-role-materialization-set.schema.json`

No new schema is required.

The schema must not be mutated during B3.5 materialization.

## Future contract topology

Structural:

`spec/de/contracts/de-basisschrift-structural.json`

Behavioral Constraint:

`spec/de/contracts/de-basisschrift-behavioral-constraint.json`

## Semantic payload

Every future contract preserves the complete canonical `semantics`
object as a lossless exact copy.

`semanticEvidenceRoots` is metadata only.

For B3.5 it is deterministically defined as the sorted set of
top-level canonical semantic roots except `summary`.

An empty evidence-root set is valid.

## Execution boundary

Current formal assignments remain:

**54**

Formal `STRUCTURAL` assignments remain:

**0**

Formal `BEHAVIORAL_CONSTRAINT` assignments remain:

**0**

Remaining unassigned remains:

**53**

No behavioral lowering has started.

No numeric state machine has started.

No translator has started.

No German runtime bundle has been generated or registered.

## Materialization model SHA-256

`8C227150AAF441DFB8B3808DA474411448F74B3ED1A1CFBEAE6D2D4257E52E20`

## Next

**15.5B3.5d — Materialize Structural and Behavioral Constraint Contracts**
