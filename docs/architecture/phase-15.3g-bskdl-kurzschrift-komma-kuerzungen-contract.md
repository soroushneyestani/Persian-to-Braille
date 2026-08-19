# Phase 15.3G — BSKDL Kurzschrift Komma-Kürzungen Contract

Status: **FORMAL AUDIT COMPLETE — NOT PROMOTED**

## Normative source

- Section: `4.5 Komma-Kürzungen`
- Section SHA-256: `e95f900395c6b03188b32750dad818cd4ee30efa6ad3052f4fb77e3a1b9f35fa`

## Coverage

- Mappings: `23`
- Unique meanings: `23`
- Unique Braille sequences: `23`
- All mappings: `2 cells`
- All mappings begin with Punkt 2: `23 / 23`
- Six-dot validation: `PASS`
- Formal rules: `6`
- Validation cases: `28`

## Punkt 2 grammar

In §4.5, Punkt 2 (`⠂`) is an **integral component of the contraction**.

It must not be modeled as merely the same announcement marker used by §4.3.2.

Braille Hub therefore requires contextual dispatch for the grammatical role of Punkt 2.

## General semantics

- Standalone: `ALLOWED`
- Prefix/suffix extension: `ALLOWED`
- Word composition: `ALLOWED`
- Restrictions: `DEFER TO §4.9`

## LASS / LÄSST

`LASS` is directly mapped to `⠂⠇` in §4.5.

This resolves the base contraction, but the `LÄSST` interaction remains pending until §4.6 Umlautungspunkt is audited.

## Mapping inventory

| Meaning | Braille | Dots |
|---|---|---|
| ANDER | ⠂⠻ | 2+12456 |
| BRAUCH | ⠂⠌ | 2+34 |
| DÜRF | ⠂⠙ | 2+145 |
| EINANDER | ⠂⠫ | 2+1246 |
| FAHR | ⠂⠗ | 2+1235 |
| HAB | ⠂⠓ | 2+125 |
| INTERESS | ⠂⠔ | 2+35 |
| KÖNN | ⠂⠅ | 2+13 |
| LASS | ⠂⠇ | 2+123 |
| MÖG | ⠂⠪ | 2+246 |
| MÜSS | ⠂⠍ | 2+134 |
| RICHT | ⠂⠼ | 2+3456 |
| SCHRIEB | ⠂⠱ | 2+156 |
| SETZ | ⠂⠑ | 2+15 |
| SITZ | ⠂⠊ | 2+24 |
| SOLL | ⠂⠎ | 2+234 |
| SPIEL | ⠂⠬ | 2+346 |
| SPRECH | ⠂⠮ | 2+2346 |
| STAND | ⠂⠾ | 2+23456 |
| STELL | ⠂⠽ | 2+13456 |
| WEIS | ⠂⠩ | 2+146 |
| WERD | ⠂⠺ | 2+2456 |
| WOLL | ⠂⠕ | 2+135 |

## Formal rules

| ID | Kind |
|---|---|
| DE-KURZ-KOMMA-001 | KOMMA_CONTRACTION_INVENTORY |
| DE-KURZ-KOMMA-002 | POINT2_INTEGRAL_COMPONENT |
| DE-KURZ-KOMMA-003 | STANDALONE_ALLOWED |
| DE-KURZ-KOMMA-004 | PREFIX_SUFFIX_EXTENSION_ALLOWED |
| DE-KURZ-KOMMA-005 | WORD_COMPOSITION_ALLOWED |
| DE-KURZ-KOMMA-006 | APPLICATION_RESTRICTIONS_DEFERRED_TO_4_9 |

## Promotion state

- Formal §4.5 audit: `COMPLETE`
- §4.6 interaction: `PENDING`
- §4.9 restrictions: `PENDING`
- Executable specification: `NOT READY`
- Core implementation: `NOT STARTED`
- SDK implementation: `NOT STARTED`
- Office integration: `NOT STARTED`
- Conformance promotion: `NOT READY`

## Next

Proceed to **Phase 15.3H — Kurzschrift Umlautungspunkt Audit** for §4.6.
