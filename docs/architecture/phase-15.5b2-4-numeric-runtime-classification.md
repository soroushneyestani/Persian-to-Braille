# Phase 15.5B2.4 — Numeric Runtime Classification

## Status

**NUMERIC_RUNTIME_CLASSIFICATION_MATERIALIZED**

## Scope

Exactly **15** Basisschrift `NUM` behavioral rules are classified.

Closed B1 canonical records remain unchanged.

## Schema

B2.4 reuses the classification-set schema admitted by B2.3:

`spec/de/schema/rule-classification-set.schema.json`

No schema mutation is required.

## Distribution

- `STATEFUL`: **6**
- `CONTEXTUAL`: **6**
- `DIRECT_MAPPING`: **1**
- `STRUCTURAL`: **1**
- `DEFERRED`: **1**
- `DELEGATED`: **0**
- `ARCHITECTURAL_ONLY`: **0**

## Runtime partition

Mapping:

**1**

State:

**6**

Context:

**6**

Structure:

**1**

Deferred:

**1**

## Direct mapping

`DE-NUM-003` is the only primary `DIRECT_MAPPING` rule.

It provides deterministic Braille serialization for decimal comma and
decimal/grouping point after their numeric semantic role is known.

The existence of Braille data alone does not make other rules direct
mappings.

## Numeric state

The following rules are `STATEFUL`:

- `DE-NUM-001`
- `DE-NUM-002`
- `DE-NUM-004`
- `DE-NUM-005`
- `DE-NUM-007`
- `DE-NUM-009`

This includes both explicitly named `ARABIC_NUMERIC` state contracts
and rules whose source semantics explicitly require number-indicator
continuity, repetition, or re-entry.

## Contextual rules

The following rules require semantic or representation context:

- `DE-NUM-006`
- `DE-NUM-008`
- `DE-NUM-010`
- `DE-NUM-011`
- `DE-NUM-012`
- `DE-NUM-014`

## Deferred case state

`DE-NUM-013` remains `DEFERRED`.

Its source explicitly states:

`caseStateImplementation = DEFERRED`

B2.4 does not pull German case-state execution forward.

## Structural boundary

`DE-NUM-015` is `STRUCTURAL` because the number-unit contract includes
a line-break prohibition.

## Runtime boundary

This is classification only.

The German numeric state machine has not started.

Behavioral lowering has not started.

No translator has started.

No German runtime bundle has been generated or registered.

## Payload

Classification payload canonical SHA-256:

`98C2142EDD3DA5534F9FF8110AF9B95FB3850D8722D7550A8699718789AC9AC1`

## Next

**15.5B2.5 — Classification validation and determinism**
