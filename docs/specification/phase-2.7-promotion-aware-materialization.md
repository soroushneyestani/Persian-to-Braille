# Phase 2.7 — Promotion-Aware Rule Materialization

The 37 Phase 1 consensus decisions remain the reproducible baseline for `fa-ir-g1`, but lifecycle status is now materialized from explicit promotion records.

- Candidate rules: 37
- Normative rules: 0
- Promotion records applied: 0
- Active conformance vectors: 0

## Source of lifecycle status

Without a promotion record, a generated rule remains `candidate` and its conformance vector remains `draft`.

When a schema-valid promotion record targets the exact rule/version, the materializer emits that rule as `normative` and its vector as `active`.

The independent Phase 2.6 promotion validator remains responsible for cross-checking evidence provenance, registered sources, hard gates, and the project-vs-official-standard scope boundary.

## Status-neutral repository paths

Phase 2.7 migrates generated artifacts from `rules/candidates` and `conformance/candidates` to status-neutral `rules/records` and `conformance/records`. Profile semantics remain based on stable rule IDs, so this filesystem migration is non-normative.

## Profile status

Promoting individual rules does not promote the incomplete `fa-ir-g1` profile. The profile remains `draft` until a separate completeness gate is satisfied.

## Reversibility

Removing a promotion record and regenerating materializes the affected rule as `candidate` again. The repository therefore has one deterministic source of lifecycle truth: promotion records plus the Phase 1 baseline.
