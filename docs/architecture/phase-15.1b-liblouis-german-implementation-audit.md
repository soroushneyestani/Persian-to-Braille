# Phase 15.1B — Liblouis German Implementation Audit

Status: **IN PROGRESS**

## Role

Liblouis is used as a **non-normative implementation comparator**.

BSKDL remains the normative authority for German Braille in Phase 15.

## Upstream snapshot

- Repository: `liblouis/liblouis`
- Branch: `master`
- Commit: `fefb3a218cead90cf5e6df6a5fc8d6a69f4dbf2e`
- Retrieved: `2026-08-19`

The source tree is inspected from a temporary shallow clone and is not vendored.

## Table correspondence

### basisschrift

- Table: `de-g0.utb`
- Name: `Deutsche Basisschrift`
- Grade: `0`
- Contraction: `no`
- Direction: `forward`
- SHA-256: `4708e78848eff4bc35f33035013a346c122a203ee36ce84a9ee5410616481ca9`
- Dependency closure: `11` files

Direct includes:

- `de-eurobrl6.dis`
- `de-chardefs6.cti`
- `de-accents.cti`
- `de-g0-core.uti`
- `latinLowercase.uti`

### vollschrift

- Table: `de-g1.ctb`
- Name: `Deutsche Vollschrift`
- Grade: `1`
- Contraction: `partial`
- Direction: `forward`
- SHA-256: `e19b87ed623a5d41270783414023f38810001f4cbc0894548908159d5c01eeba`
- Dependency closure: `14` files

Direct includes:

- `de-g0.utb`
- `de-g1-core.cti`

### kurzschrift

- Table: `de-g2.ctb`
- Name: `Deutsche Kurzschrift`
- Grade: `2`
- Contraction: `full`
- Direction: `forward`
- SHA-256: `eb00a9c603885434bdc0615e1d7090d4e68db1d51a0f299f500c5d9d9494016e`
- Dependency closure: `15` files

Direct includes:

- `de-g0.utb`
- `de-g2-core.cti`
- `braille-patterns.cti`

## Interpretation

The Liblouis grade labels are recorded as comparator metadata only.

Braille Hub does not freeze German profile identifiers from g0/g1/g2.

Forward output may later be used for differential tests.

Reverse translation is treated as an independent capability and no symmetric coverage is assumed.

Capitalization, regional deviations, foreign-language spans, punctuation, numbers, and contraction contexts remain subject to direct BSKDL audit.

No Liblouis rule is promoted into Braille Hub Core behavior in Phase 15.1B.

## Next

Phase 15.1C builds the BSKDL Basisschrift rule-family inventory.
