# Phase 2.14 — Adjudicated Candidate Admission

Phase 2.14 has completed adjudication for all 253 queued decisions.

This document defines the governance bridge for the **138 approved decisions**
whose adjudication records authorize creation of specification artifacts.

## Route

The route is:

`approved adjudication -> candidate artifact -> separate future promotion`

It is **not**:

`approved adjudication -> normative rule`

The existing Phase 2.5 normative-promotion policy remains unchanged and still
permits normative promotion only for Phase 1 `CONSENSUS-CANDIDATE` decisions.

## Current counts

- adjudication records: 253
- approved: 153
- deferred: 100
- candidate-admission eligible: 138
- approved but intentionally non-materializable: 15
- normative promotions authorized by this route: 0
- candidate artifacts materialized by this route definition: 0

## Eligible materialization types

- character: 98
- sequence: 1
- context: 6
- normalization: 1
- mode: 5
- layout: 27

## Authority

No second maintainer decision is required merely to create a **candidate**
artifact from one of these 138 records.

The explicit Phase 2.14 adjudication record already contains the maintainer
decision authorizing specification-artifact creation.

CI may reproduce that authorized candidate state. CI may not invent a new
admission decision.

## Normative boundary

Candidate admission:

- does not rewrite the historical Phase 1 classification;
- does not set `promotionEligible=true`;
- does not create a project-normative rule;
- does not claim current official Iranian-standard status;
- does not change the `fa-ir-g1` profile out of `draft`;
- does not bypass the existing normative-promotion policy.

Any later normative transition requires a separate explicit promotion
governance route and promotion record.

## Conformance boundary

When the 138 candidates are materialized, each must receive reciprocal draft
conformance coverage and must satisfy the six-dot `fa-ir-g1` profile.

Rule IDs and conformance-vector IDs are deliberately **not assigned by this
governance-route stage**. They become published stable identifiers only when
the candidate materialization is implemented.

## Deferred and non-materializable decisions

The 100 deferred decisions remain deferred.

The 15 approved but non-materializable decisions (`ignore-format-control`,
`explicitly-unsupported`, and `out-of-scope`) remain explicit project
decisions but do not create candidate rule artifacts.
