# Phase 2.14 — Adjudicated Candidate Materialization

The canonical `fa-ir-g1` package now materializes both the previously promoted Phase 1 consensus baseline and the explicitly approved Phase 2.14 adjudicated candidates in one deterministic pass.

- Total rules: 176
- Normative baseline rules: 37
- Candidate rules: 139
- Phase 2.14 adjudicated candidates: 138
- Phase 11 release corrections: 1
- Total conformance vectors: 176
- Active vectors: 37
- Draft vectors: 139
- Promotion records applied: 37

## Lifecycle boundary

The 37 previously promoted baseline rules retain `normative` status and their reciprocal conformance vectors remain `active`.

The 138 Phase 2.14 materializations remain `candidate`; their reciprocal conformance vectors remain `draft`. Candidate admission does not set `promotionEligible` and does not authorize normative promotion.

Explicit maintainer release corrections are materialized through a separate non-normative route. They do not rewrite historical adjudications and their conformance vectors remain `draft` until separate promotion governance.

The `fa-ir-g1` profile remains `draft`.

## Provenance

Each adjudicated candidate rule points to exactly one preserved Phase 1 decision item and carries the source IDs and rationale from its explicit Phase 2.14 adjudication record. The package manifest additionally binds candidate rules to adjudication record IDs, paths, and SHA-256 hashes.

Historical Phase 1 classifications are not rewritten.

## Six-dot constraint

Every materialized candidate is compatible with the six-dot `fa-ir-g1` profile. Structural normalization/layout/mode rules emit structural tokens rather than virtual Liblouis operands.

## Canonical ownership

`build_phase2_candidate_package.py` remains the single owner of `rules/records`, `conformance/records`, the profile, and the combined materialization manifest. This prevents the older 37-rule builder state from deleting Phase 2.14 candidates on regeneration.
