# Phase 15.5B2.3 — Punctuation Runtime Classification

## Status

**PUNCTUATION_RUNTIME_CLASSIFICATION_MATERIALIZED**

## Scope

The classification covers exactly **28** canonical behavioral rules:

- 11 `INWORD`
- 17 `STROKE`

The closed canonical records remain unchanged.

## Derived classification namespace

Phase 15.5B2.3 explicitly admits:

`spec/de/runtime-classification/`

Classification is stored outside the closed B1 canonical records.

## Distribution

- `CONTEXTUAL`: **16**
- `DELEGATED`: **5**
- `STRUCTURAL`: **4**
- `STATEFUL`: **2**
- `ARCHITECTURAL_ONLY`: **1**
- `DIRECT_MAPPING`: **0**
- `DEFERRED`: **0**

The zero direct-mapping count is intentional.

Simple symbol mappings are already owned by the B2.2 Basisschrift
symbol catalog. B2.3 classifies behavioral punctuation semantics.

## Important ownership boundaries

`DE-STROKE-010` and `DE-STROKE-014` are `STATEFUL` because they change
numeric-state behavior.

`DE-STROKE-011` and `DE-STROKE-015` are `DELEGATED` to the mathematical
sign resolver.

`DE-STROKE-001`, `DE-STROKE-004`, `DE-STROKE-008`, and
`DE-STROKE-009` are `STRUCTURAL`.

`DE-INWORD-011` is `ARCHITECTURAL_ONLY`.

`DE-INWORD-009` and `DE-INWORD-010` preserve later contraction-engine
ownership instead of creating Basisschrift contraction behavior.

## Runtime boundary

Classification only has been materialized.

Behavioral lowering has not started.

No translator or state machine has started.

No German executable runtime bundle exists.

## Payload

Classification payload canonical SHA-256:

`1B55016286D178876E735A6D24F6CEFB9BBA4E98C0AE6F4A33644FBD68CBB13F`

## Next

**15.5B2.4 — Numeric behavior classification**
