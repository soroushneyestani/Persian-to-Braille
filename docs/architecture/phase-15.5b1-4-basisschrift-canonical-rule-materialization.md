# Phase 15.5B1.4 — Basisschrift Canonical Rule Materialization

## Status

**CANONICAL_RULES_MATERIALIZED**

## Result

The Phase 15.1 Basisschrift audit has been promoted into exactly
**150 canonical German rule records**.

Source contracts: **10**

Canonical records: **150**

## Canonical/runtime separation

These records are canonical normative/audit records.

They are **not** executable runtime rules.

Every record therefore keeps:

- canonical identity,
- Basisschrift introduction ownership,
- exact source-contract binding,
- source normative/executable audit state,
- lossless heterogeneous semantics,
- validation-case linkage,
- runtime promotion metadata.

`runtimeDisposition` remains `NOT_CLASSIFIED` for every record.

Runtime classification and lowering are deliberately deferred to B2/B3/B4.

## Losslessness

All 150 records passed semantic round-trip reconstruction.

The canonical envelope was converted back to its original Phase 15.1
source-rule object and compared using JSON semantic equality.

Round-trip failures: **0**

Semantic loss: **0**

## Validation linkage

Validation cases: **88**

Single-rule cases: **63**

Multi-rule cases: **25**

Unlinked cases: **0**

Validation linkage is created only from explicit `rule` or `rules`
fields in the Phase 15.1 audit artifacts.

No linkage is inferred from names, sections, examples, or proximity.

Total explicit validation-to-rule edges: **117**

Rules with at least one linked validation case:
**85**

Rules without an explicit linked validation case:
**65**

A rule without a linked case is not treated as invalid in B1.4 because
Phase 15.1 closed on 88 validation cases for 150 normative/audit rules.

## Filenames

Canonical record filenames are the lowercase Rule ID plus `.json`.

Example:

`DE-NUM-001`

becomes:

`spec/de/rules/records/de-num-001.json`

Filesystem ordering remains non-semantic.

## Runtime boundary

No German runtime lowering has started.

No German runtime bundle exists.

The runtime manifest and runtime builder remain unchanged.

## Regional boundary

Swiss configuration is not applied in B1.4.

Swiss remains an orthogonal regional runtime concern owned by Phase 15.5F.

## Next

**15.5B1.5 — Deterministic canonical materialization validation**
