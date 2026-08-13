# Phase 2.6 — Normative Promotion Validation

Result: **PASS**

This report validates the Phase 2.5 normative-promotion governance independently from the policy generator.

A PASS result does not promote any rule.

## Current repository state

- Policy version: `1.0.0`
- Hard gates validated: 11
- Rule artifacts inspected: 175
- Candidate rules: 138
- Normative rules: 37
- Promotion records: 37
- Semantic errors: 0

The current zero-promotion state is valid. Phase 2.6 establishes the validator before the first real normative transition.

## Enforced invariants

- Automatic promotion is forbidden.
- Passing CI alone cannot promote a rule.
- Only Phase 1 CONSENSUS-CANDIDATE decisions are eligible.
- Every promotion record validates against the promotion schema.
- Every promotion record targets an existing rule and profile.
- Promotion rule/profile/version identity must match current artifacts.
- Every applied promotion record corresponds to a normative rule.
- Every normative rule has exactly one promotion record for its version.
- Candidate rules cannot already have an applied promotion record.
- Promotion evidence provenance matches the rule provenance.
- All promotion source IDs are registered.
- All promotion decision items remain CONSENSUS-CANDIDATE.
- All recorded hard checks are true.
- Promotion records cannot claim official Iranian-standard status.

## Materialization boundary

Phase 2.7 materialization is promotion-aware: a schema-valid promotion record can materialize the matching rule/version as normative and its conformance vector as active. This validator remains the independent governance gate for whether that materialized promotion is actually acceptable.
