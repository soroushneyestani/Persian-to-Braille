# Phase 2.14 — Adjudication Framework + Execution

Phase 2.14 is the execution phase for the 253 decisions prepared in Phase 2.13.

This framework introduces a machine-readable adjudication record, an explicit
project-maintainer adjudication policy, and an execution manifest.

## Initial framework state

- Planned decisions: 253
- Adjudication records: 0
- Approved dispositions: 0
- Deferred dispositions: 0
- Unadjudicated decisions: 253
- Promotion-eligible decisions: 0
- Normative rules created by adjudication: 0
- Profile: `fa-ir-g1` (`draft`)

## Execution rule

No generator may invent a maintainer decision.

Each adjudication record must represent an explicit project-maintainer decision
for exactly one Phase 2.13 item and must preserve the exact evidence-packet hash
used as its basis.

Batch approval is allowed, but each decision still receives an independent
record.

## Adjudication is not promotion

The current normative-promotion policy remains version
`1.0.0` and only admits the Phase 1
`CONSENSUS-CANDIDATE` classification.

Therefore a Phase 2.14 adjudication:

- does not rewrite Phase 1 classification;
- does not directly create a normative rule;
- does not set `promotionEligible = true`;
- does not modify the Phase 2.13 plan or Phase 2.12 evidence packets;
- makes no claim of current official Iranian national-standard status.

A later action inside Phase 2.14 may define an explicit governance route for
accepted adjudications before rule promotion. That route must remain separate
from the adjudication decision itself.

## Allowed dispositions

- `accept-rule`
- `accept-normalization`
- `accept-context-rule`
- `accept-mode-rule`
- `accept-layout-policy`
- `ignore-format-control`
- `explicitly-unsupported`
- `out-of-scope`
- `defer-pending-evidence`

## Generated artifacts

- `spec/fa-ir/schema/adjudication-record.schema.json`
- `spec/fa-ir/governance/adjudication-policy.json`
- `spec/fa-ir/adjudications/manifest.json`

The execution manifest is materialized separately from explicit adjudication
records by `tools/spec/materialize_adjudications.py`. The framework generator
never resets an execution manifest after maintainer decisions exist.
