# Phase 15.5B3.2 — Contract Role Taxonomy

## Status

**CONTRACT_ROLE_TAXONOMY_FROZEN**

B3 input scope remains **107** canonical rules.

No rule has been assigned a primary contract role yet.

## Why raw signals are insufficient

Evidence contains:

- Multi-signal rules: **19**
- Zero-signal rules: **21**
- Profile/mode-sensitive rules: **9**
- Non-normative rules: **4**

Therefore JSON key presence is evidence only and is not itself a classifier.

## Final primary roles

1. `INDICATOR`
2. `STATE_SCOPE`
3. `STRUCTURAL`
4. `POLICY_SELECTION`
5. `BEHAVIORAL_CONSTRAINT`
6. `DELEGATED_REFERENCE`
7. `REFERENCE_ONLY`
8. `CROSS_MODE_DEFERRED`
9. `ARCHITECTURAL_ONLY`

Transitional value:

`NOT_ASSIGNED`

Every B3 rule must ultimately receive exactly one primary role.

## Semantic adjudication order

1. `ARCHITECTURAL_ONLY`
2. `CROSS_MODE_DEFERRED`
3. `REFERENCE_ONLY`
4. `DELEGATED_REFERENCE`
5. `STRUCTURAL`
6. `STATE_SCOPE`
7. `POLICY_SELECTION`
8. `INDICATOR`
9. `BEHAVIORAL_CONSTRAINT`

This is a semantic gate order, not JSON-key precedence.

## Guard rules

Marker presence does not automatically imply `INDICATOR`.

Dependency presence does not automatically imply `DELEGATED_REFERENCE`.

Profile presence does not automatically imply `CROSS_MODE_DEFERRED`.

`normative=false` does not automatically imply `ARCHITECTURAL_ONLY`.

## Materialization ownership

### B3.3

- `INDICATOR`

### B3.4

- `STATE_SCOPE`
- `POLICY_SELECTION`

### B3.5

- `STRUCTURAL`
- `BEHAVIORAL_CONSTRAINT`

### B3.6

- `DELEGATED_REFERENCE`
- `REFERENCE_ONLY`
- `CROSS_MODE_DEFERRED`
- `ARCHITECTURAL_ONLY`

## Important boundary evidence

`DE-CB-002` remains a candidate for `REFERENCE_ONLY` because it records
the primary eight-dot Computerbraille system while the German runtime is
six-dot-only.

`DE-CB-003` preserves the six-dot Computerbraille transport fallback.

`DE-CASE-019` and `DE-CASE-020` explicitly apply to Kurzschrift and are
therefore candidates for `CROSS_MODE_DEFERRED`.

These labels remain candidates in B3.2; they are not primary-role
assignments yet.

## Deterministic taxonomy identity

`8BC70F04793425FD9BE792B55F81D89F212ECB2CE43DE47AA9CCAAF977588C54`

## Execution boundary

B3.2 freezes classification semantics only.

No materialization has started.

No lowering has started.

No translator has started.

No German runtime bundle has been generated or registered.

## Next

**15.5B3.3 — Indicator Contract Materialization**
