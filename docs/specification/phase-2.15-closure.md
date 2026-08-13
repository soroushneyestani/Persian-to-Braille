# Phase 2.15 — Phase 2 Closure

## Status

**Phase 2: CLOSED**

This document closes the Persian Braille specification phase for the `fa-ir-g1`
draft profile. It records the repository state that Phase 3 is allowed to
consume. It does not promote new rules, resolve deferred evidence, broaden
normative eligibility, or claim that this project represents an official
Iranian Braille standard.

The closure state was verified after a complete top-to-bottom regeneration of
the specification workflow. The workflow reached a fixed point with no
regeneration drift and a clean working tree.

---

## 1. Closure boundary

Phase 2 established the specification/governance layer required before the v2
repository architecture and implementation work begins.

Phase 2 closure means:

- the current evidence set has been audited and classified;
- all Phase 2 review-queue items have an adjudication outcome;
- all approved materializable decisions have a deterministic candidate
  representation;
- the existing normative baseline remains governed by the explicit promotion
  protocol;
- unresolved/deferred evidence is preserved as deferred work instead of being
  silently promoted or guessed;
- the current specification package validates and regenerates deterministically;
- Phase 3 may implement the frozen Phase 2 contracts without reopening Phase 2
  research by default.

Phase 2 closure does **not** mean that every historical or external Persian
Braille question has been conclusively resolved.

---

## 2. Final specification state

### Profile

- Profile: `fa-ir-g1`
- Version: `0.1.0`
- Profile status: `draft`
- Cell model: six-dot
- Dot-7/dot-8 violations: `0`

### Materialized rules

- Total rules: `175`
- Normative rules: `37`
- Candidate rules: `138`
- Structural rules: `29`

### Conformance

- Total conformance vectors: `175`
- Active vectors: `37`
- Draft vectors: `138`

### Promotion governance

- Promotion records: `37`
- Current normative promotion policy version: `1.0.0`
- Eligible Phase 1 classification for normative promotion:
  `CONSENSUS-CANDIDATE`
- Automatic normative promotion: `false`
- CI-only normative promotion: `false`
- Phase 2.14 promotion-eligible decisions: `0`
- Normative rules created by Phase 2.14 adjudication: `0`

The 138 adjudicated candidates are candidates only. Candidate materialization
is not normative promotion.

---

## 3. Review, evidence, and adjudication state

### Phase 2.11 review queue

- Master decision items: `290`
- Consensus items excluded from the review queue: `37`
- Review-queue items: `253`
- `REVIEW-REQUIRED`: `252`
- `UNRESOLVED`: `1`

### Corrected Phase 2.12 evidence classification

- Same observed behavior: `177`
- Different observed behavior: `76`
- Insufficient data: `0`

The historical classification correction is documented separately in
`docs/specification/phase-2.14-evidence-classification-correction.md`.

No underlying source evidence was changed by that correction.

### Corrected Phase 2.13 adjudication tracks

- Unresolved track: `1`
- Evidence-gap track: `0`
- Implementation-conflict track: `76`
- Implementation-alignment track: `176`
- Total planned decisions: `253`

The obsolete evidence-gap batch identifier was not reused.

### Phase 2.14 adjudication

- Adjudication records: `253`
- Approved: `153`
- Deferred: `100`
- Unadjudicated: `0`
- Approved materializable decisions: `138`
- Approved non-materializable decisions: `15`
- Deferred decisions: `100`

Final disposition counts:

- `accept-context-rule`: `6`
- `accept-layout-policy`: `27`
- `accept-mode-rule`: `5`
- `accept-normalization`: `1`
- `accept-rule`: `99`
- `defer-pending-evidence`: `100`
- `explicitly-unsupported`: `1`
- `ignore-format-control`: `11`
- `out-of-scope`: `3`

---

## 4. Candidate materialization

All `138` approved materializable adjudication decisions have been
materialized as candidate specification artifacts.

Target rule-type distribution:

- character: `98`
- context: `6`
- layout: `27`
- mode: `5`
- normalization: `1`
- sequence: `1`

Representation distribution:

- cell-based: `109`
- structural: `29`

Materialization readiness at closure:

- eligible admissions: `138`
- already materialized: `138`
- rule-ID collisions: `0`

---

## 5. NBSP ownership invariant

The Phase 2.14 NBSP scope amendment is binding at closure.

`FA-PUNC-018` does not create a scalar Braille-cell rule because the observed
Liblouis `a` operand is virtual/internal spacing behavior rather than a Braille
cell.

NBSP semantics are owned by:

- decision: `FA-WS-007`
- target type: `layout`
- disposition: `accept-layout-policy`

Closure invariants:

- `FA-PUNC-018`: out of scope for scalar artifact materialization;
- `FA-WS-007`: owns NBSP layout behavior;
- candidate-admission NBSP ownership validation: `PASS`.

---

## 6. Normative boundary

At Phase 2 closure, only the 37 explicitly promoted consensus-derived rules are
normative.

The following do not become normative merely because Phase 2 is closed:

- the 138 adjudicated candidate rules;
- the 100 deferred decisions;
- any `REVIEW-REQUIRED` or `UNRESOLVED` Phase 1 classification;
- any rule that lacks a valid promotion record under the active promotion
  policy.

Phase 3 must preserve this lifecycle distinction in code and APIs.

---

## 7. Deferred work

The `100` deferred decisions are intentionally carried forward as evidence
backlog.

Their presence does not block Phase 2 closure because:

1. each has an explicit adjudication record;
2. none is unadjudicated;
3. none is promotion eligible;
4. none is silently materialized as normative;
5. the implementation contract can distinguish normative, candidate,
   unsupported/out-of-scope, and deferred states.

Future evidence may reopen individual deferred decisions through governance,
but Phase 3 does not need to resolve all 100 before architecture and core
implementation begin.

---

## 8. Validation state at closure

The final full workflow was regenerated top-to-bottom after the Phase 2.14
console-output cleanup.

Observed closure invariants include:

- review-queue validation: `PASS`
- review-queue negative suite: `PASS`
- evidence-packet validation: `PASS`
- evidence-packet negative suite: `PASS`
- adjudication-plan validation: `PASS`
- adjudication-plan negative suite: `PASS`
- adjudication validation: `PASS`
- Phase 2.14 completion validation: `PASS`
- adjudication negative suite: `PASS`
- adjudication determinism: `PASS`
- candidate-admission validation: `PASS`
- candidate-admission negative suite: `PASS`
- candidate-admission determinism: `PASS`
- candidate-materialization readiness: `PASS`
- promotion-aware materialization suite: `PASS`
- specification validation: `PASS`
- specification negative suite: `PASS`
- normative-promotion validation: `PASS`
- normative-promotion fixture suite: `PASS`
- final regeneration fixed point: `PASS`
- working tree after final verification: clean

Specification validator closure counts:

- materialized rules: `175`
- candidate rules: `138`
- normative rules: `37`
- conformance vectors: `175`
- active vectors: `37`
- draft vectors: `138`
- promotion records observed: `37`
- unique decision items consumed: `175`
- consensus decision items consumed: `37`
- adjudicated decision items consumed: `138`
- structural rules: `29`
- registered sources referenced: `6`
- dot-7/dot-8 violations: `0`
- schema errors: `0`
- semantic errors: `0`

---

## 9. Contract handed to Phase 3

Phase 3 may treat the following as the frozen Phase 2 input contract:

### Specification ownership

The specification owns Braille behavior. Implementations consume the
specification; they do not redefine it independently.

### Lifecycle states

Implementation architecture must preserve at least:

- normative rule;
- candidate rule;
- draft profile;
- active vs draft conformance vectors;
- deferred/unmaterialized evidence decisions.

### Rule model

Phase 3 must support the Phase 2 rule categories already present:

- character
- sequence
- context
- mode
- normalization
- layout

It must also support both:

- cell-producing rules;
- structural-token rules.

### Unicode and Braille constraints

Phase 3 must not infer eight-dot behavior from external implementations for the
six-dot `fa-ir-g1` profile.

Dots 7 and 8 are invalid for this profile unless a future specification change
explicitly changes that contract.

### Context and precedence

Rule matching must respect semantic context and precedence. Pure string-prefix
logic is insufficient for context-sensitive overlaps.

### Governance

Phase 3 implementation, tests, SDKs, CLI tools, web tools, and future Office
integration must not silently convert candidate rules to normative rules.

A future normative promotion requires the governance route defined by the
specification.

---

## 10. Claims explicitly not made

Phase 2 closure does not assert:

- that `fa-ir-g1` is an official Iranian national Braille standard;
- that all external Persian Braille implementations agree;
- that all 100 deferred decisions are resolved;
- that candidate rules have normative authority;
- that the draft profile is ready for a stable standards release.

Those claims require evidence and governance beyond the Phase 2 closure state.

---

## 11. Exit criteria

Phase 2 exit criteria are satisfied:

- [x] formal schema layer established;
- [x] candidate/normative lifecycle established;
- [x] normative promotion governance established;
- [x] consensus baseline promoted through explicit records;
- [x] non-consensus review queue fully processed;
- [x] evidence packets generated and corrected;
- [x] adjudication plan generated and corrected;
- [x] all 253 planned items adjudicated;
- [x] accepted materializable decisions admitted through explicit governance;
- [x] all 138 admitted candidates materialized;
- [x] conformance vectors materialized;
- [x] NBSP ownership ambiguity resolved;
- [x] validators and negative suites pass;
- [x] deterministic regeneration reaches a fixed point;
- [x] audit correction retained without rewriting Git history;
- [x] no known Phase 2 blocker remains for Phase 3.

---

## 12. Closure decision

**Phase 2 is closed.**

Any newly discovered issue after this point should be classified as one of:

1. a genuine defect in the frozen Phase 2 contract that requires a narrowly
   scoped corrective change; or
2. future specification/evidence work that belongs in backlog and does not
   automatically reopen Phase 2.

The next planned project phase is:

**Phase 3 — v2 Repository Architecture**
