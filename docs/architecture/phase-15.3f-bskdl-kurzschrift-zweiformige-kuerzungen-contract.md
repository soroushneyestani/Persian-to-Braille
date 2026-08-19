# Phase 15.3F — BSKDL Kurzschrift Zweiformige Kürzungen Contract

Status: **FORMAL AUDIT COMPLETE — NOT PROMOTED**

## Normative source

- Chapter: `4 Die Kurzschrift`
- Section: `4.4 Zweiformige Kürzungen`
- Section SHA-256: `881f39f3cb3390c9a1d0899b506cbd739cae90d604cada73918e272227b23c42`

## Coverage

- Mappings: `165`
- Unique meanings: `165`
- Unique Braille sequences: `165`
- Every mapping: `2 cells`
- Six-dot validation: `PASS`
- Formal rules: `5`
- Mapping validation cases: `165`
- Policy validation cases: `4`
- Validation cases total: `169`

## General §4.4 semantics

- Standalone use: `ALLOWED`
- Prefix/suffix extension: `ALLOWED`
- Word composition: `ALLOWED`
- Application restrictions: `DEFER TO §4.9`

## Cross-phase resolutions

`BEIM`, `NICHTS`, `VOM`, `ZUM`, and `ZUR` are directly present in the §4.4 inventory.

`ÜBRIG` is directly mapped to `⠳⠘`, resolving the §4.3.5 WÜRD/ÜBRIG collision evidence.

## Taxonomy precision

The source phrase `zweiformige Lautgruppenkürzungen` from §4.3 must not automatically be equated with the `Zweiformige Kürzungen` inventory of §4.4.

The former is explicitly described as not usable standalone, whereas §4.4 explicitly permits standalone use for its listed contractions.

This is recorded as an architectural taxonomy finding, not as a new normative rule.

## Promotion state

- Formal §4.4 audit: `COMPLETE`
- §4.9 restrictions: `PENDING`
- Executable specification: `NOT READY`
- Core implementation: `NOT STARTED`
- SDK implementation: `NOT STARTED`
- Office integration: `NOT STARTED`
- Conformance promotion: `NOT READY`

## Next

Proceed to **Phase 15.3G — Kurzschrift Komma-Kürzungen Audit** for §4.5.
