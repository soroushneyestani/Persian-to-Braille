# Phase 2.5 — Normative Promotion Protocol

Phase 2.5 defines how a Persian Braille rule may move from `candidate` to
`normative`.

This stage defines the **process**. It does not promote any rule.

## Meaning of normative

`normative` means authoritative for the Persian-to-Braille project
specification.

It does **not** mean that the project is claiming the rule is the current
official Iranian national Braille standard.

The Phase 1 audit deliberately left the current normative status of the
1393/2014 institutional manual unverified. Promotion inside this project must
not erase that distinction.

## No automatic promotion

A rule cannot become normative merely because:

- Liblouis contains the mapping;
- stable and draft Liblouis agree;
- a GitHub Actions workflow passes;
- all conformance vectors pass;
- the rule existed in Persian-to-Braille v1.

Promotion requires an explicit machine-readable promotion record and an
explicit maintainer decision.

## Eligibility

Policy version 1.0.0 permits promotion only from:

`candidate -> normative`

and only when every consumed Phase 1 decision item is currently classified:

`CONSENSUS-CANDIDATE`

`REVIEW-REQUIRED` and `UNRESOLVED` evidence is not eligible under this first
promotion policy.

## Hard gates

The promotion policy currently defines eleven hard gates:

1. source rule is still a candidate;
2. Phase 1 evidence classification is consensus-candidate;
3. all evidence sources are registered;
4. Phase 2 JSON Schema validation passes;
5. independent semantic validation passes;
6. reciprocal conformance coverage exists;
7. negative validator fixtures pass;
8. regeneration is reproducible;
9. target-profile constraints pass;
10. a maintainer explicitly approves promotion;
11. the promotion record preserves the project-vs-official-standard scope
    disclaimer.

## Promotion records

Every promoted rule/version requires its own record conforming to:

`spec/fa-ir/schema/promotion-record.schema.json`

A batch Pull Request may contain multiple promotions, but each rule/version
must have an independent record.

Promotion records capture:

- rule and profile identity;
- exact rule version;
- Phase 1 decision IDs;
- source IDs;
- validation gates;
- maintainer authority;
- optional external review;
- project-normative scope;
- rationale.

## External review

External review is recommended but is not a hard gate in policy version 1.0.0.

This keeps the project operable with a single maintainer while still making
external review visible and auditable. A future policy version may strengthen
this requirement.

## Rule status vs profile status

Rule promotion and profile promotion are deliberately separate.

Individual rules may become normative while `fa-ir-g1` remains `draft`.

The profile must not become normative until a later profile-level gate resolves
coverage completeness and the remaining Phase 1 `REVIEW-REQUIRED` and
`UNRESOLVED` domains.

## Change control

Published rule IDs remain stable.

A semantic rule change requires a rule-version change and a new promotion
record for that version.

Passing CI does not itself mutate status. Promotion occurs only through an
explicit Pull Request containing the rule status/version change and its
promotion record.

## Next stage

Phase 2.6 will make this governance executable:

- validate promotion records against the new schema;
- cross-check a promotion record against the referenced rule, profile, source
  registry, and Phase 1 decision matrix;
- add those checks to the existing specification CI gate;
- create the first real promotion Pull Request only after the promotion
  validator itself has positive and negative tests.
