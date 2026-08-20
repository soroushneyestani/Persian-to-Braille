# Phase 15.5B2.1 — Runtime Classification Taxonomy

## Status

**RUNTIME_CLASSIFICATION_TAXONOMY_FROZEN**

## Discovery baseline

The Basisschrift symbol foundation contains exactly **95** records:

- alphabet: **30**
- single-form signs: **12**
- multi-form signs: **32**
- technical signs: **21**

The closed B1 canonical specification contains **150** immutable rule records.

## Canonical immutability

B2 does not mutate the B1 canonical records.

The closed B1 canonical aggregate remains:

`EEC320FB02554D838F5C7A1A31CFF04D75419718379F08EDA18577A5973790CB`

Runtime classification is stored as a derived layer.

## Symbol taxonomy

### DIRECT_PRINT_SYMBOL

A source symbol with an explicit unique print key and deterministic
Braille sequence.

Containers:

- `alphabet`
- `singleFormSigns`

Count:

**42**

A Braille result may contain more than one cell and still be a direct
symbol mapping.

### SEMANTIC_SYMBOL

A source symbol identified by semantic identity with no direct print
lookup key.

Containers:

- `multiFormSigns`
- `technicalSigns`

Count:

**53**

These symbols require an owning behavioral rule, state, context, or
structural selector before emission.

## Behavioral rule taxonomy

Primary runtime dispositions:

1. `ARCHITECTURAL_ONLY`
2. `DEFERRED`
3. `DELEGATED`
4. `STRUCTURAL`
5. `STATEFUL`
6. `CONTEXTUAL`
7. `DIRECT_MAPPING`

`NOT_CLASSIFIED` remains transitional only.

A Braille cell or marker inside a canonical rule does **not** by itself
make that rule a direct mapping.

For example, a rule containing Braille output plus numeric-state
semantics is classified as `STATEFUL`, not `DIRECT_MAPPING`.

## B2 behavioral scope

Numeric rules:

**15**

Punctuation behavior rules:

**28**

Total B2 behavioral rules:

**43**

Canonical rules outside B2:

**107**

Owned families:

- `NUM`
- `STROKE`
- `INWORD`

## Runtime boundary

No German executable runtime has been created.

Runtime lowering has not started.

Execution remains owned by Phase 15.5B4.

## Next

**15.5B2.2 — Symbol foundation runtime admission**
