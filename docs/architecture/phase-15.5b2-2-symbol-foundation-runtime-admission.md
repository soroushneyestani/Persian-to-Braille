# Phase 15.5B2.2 — Symbol Foundation Runtime Admission

## Status

**SYMBOL_FOUNDATION_RUNTIME_CATALOG_ADMITTED**

## Explicit namespace admission

Phase 15.5A3.4 was a historical topology-only snapshot.

It modeled a `mappings` admission dimension with count zero but did not
reserve a concrete canonical mapping path.

Phase 15.5B2.2 therefore explicitly admits:

`spec/de/mappings/`

The historical A3 topology artifact is not modified or reopened.

## Source

Source artifact:

`docs/architecture/phase-15.1d-bskdl-basisschrift-normative-symbol-foundation.json`

SHA-256:

`D6A7AA450A9EDDC9DC7EE170C85622A24F85363D084753F23C546A8CA35FBB25`

Source records:

**95**

All 95 source records remain normative evidence and were non-executable
at the Phase 15.1D audit boundary.

## Catalog identity model

Physical catalog records:

**95**

Print-only records:

**30**

Print + semantic records:

**12**

Semantic-only records:

**53**

Therefore:

Print index entries:

**42**

Semantic index entries:

**65**

No source record is duplicated merely because it participates in both
indexes.

## Record identity

Each derived catalog record receives a non-normative internal key:

`<sourceContainer>:<one-based-index>`

Examples:

`alphabet:001`

`singleFormSigns:001`

`technicalSigns:002`

These keys are deterministic implementation identities only.

They do not freeze public German profile or SDK identifiers.

## Losslessness

Every catalog record embeds its complete original Phase 15.1D source
record.

Source round trip:

**95 / 95**

Round-trip failures:

**0**

Semantic loss:

**0**

Catalog payload canonical SHA-256:

`3D25D9A570F7D5194101C3AA601B36910EFEE8CC1080E0DF4DD11C23016D93ED`

## Symbol dispositions

Print-bearing source records are admitted as:

`DIRECT_PRINT_SYMBOL`

Records without direct print identity are admitted as:

`SEMANTIC_SYMBOL`

Single-form signs retain both lookup capabilities:

`PRINT`

and:

`SEMANTIC`

## Runtime boundary

The symbol catalog is non-executable.

No translator has started.

No numeric or other state machine has started.

No behavioral canonical rule has been lowered.

No German runtime TypeScript bundle has been generated.

The generic Persian runtime bundle manifest is unchanged.

## Canonical B1 boundary

The 150 closed German canonical rule records remain untouched.

Their frozen aggregate SHA remains:

`EEC320FB02554D838F5C7A1A31CFF04D75419718379F08EDA18577A5973790CB`

## Next

**15.5B2.3 — Punctuation behavior classification**
