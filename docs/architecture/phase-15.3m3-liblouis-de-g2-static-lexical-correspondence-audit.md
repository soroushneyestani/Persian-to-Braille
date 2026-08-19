# Phase 15.3M3 — Liblouis de-g2 Static Lexical Correspondence Audit

Status: **PASS**

Role: **NON-NORMATIVE COMPARATOR**

## Decision

```text
Candidate terms:                         4
EXACT_PHYSICAL_STATIC_MATCH:             1
VIRTUAL_DOT_MEDIATED_STATIC_MATCH:       1
CONTEXTUAL_IMPLEMENTATION_REPRESENTATION:1
NO_STATIC_EQUIVALENCE:                   1
Runtime differential testing:            NOT STARTED
Liblouis rule promotion:                 NO
```

## LÄSS

```text
Liblouis: 5-123 → ⠐⠇
BSKDL:    5-123 → ⠐⠇
```

Classification: `EXACT_PHYSICAL_STATIC_MATCH`.

Only the physical cells are declared an exact static match. Liblouis `nocross always` eligibility is not treated as BSKDL semantics.

## ÜBRIG

```text
Liblouis raw:        1256a-45a
Physical projection:1256-45 → ⠳⠘
BSKDL:               1256-45 → ⠳⠘
```

Explicit pass2 cleanup exists for `@1256a → @1256` and `@45a → @45`.

Classification: `VIRTUAL_DOT_MEDIATED_STATIC_MATCH`.

## WÄRTS

```text
Liblouis static rule: 2456 → ⠺
BSKDL full sigel:     6-36-2456 → ⠠⠤⠺
```

The terminal sigel cell agrees, but the full BSKDL control sequence is not present in this single Liblouis rule.

Classification: `CONTEXTUAL_IMPLEMENTATION_REPRESENTATION`.

## SCHAFT

```text
Liblouis raw:         156a-1-124-2345
Physical projection: 156-1-124-2345 → ⠱⠁⠋⠞
BSKDL full sigel:     6-36-156 → ⠠⠤⠱
```

The single static Liblouis rule is not equivalent to the complete BSKDL contraction.

Classification: `NO_STATIC_EQUIVALENCE`.

## Important boundary

```text
STATIC MATCH ≠ RUNTIME CONFORMANCE
STATIC MATCH ≠ NORMATIVE AUTHORITY
```

BSKDL remains the normative source. Liblouis remains only a comparator.

## Next

Proceed to **Phase 15.3M4 — Liblouis de-g2 Runtime Comparator Preparation**.
