# Persian Braille Orthographic Variants Audit

Audit stage: **1.3**

This stage audits Persian/Arabic code-point variants, several related Arabic scalars, Ezafe spellings, and non-printing Unicode format controls.

No row in this document is normative yet; all decisions remain pending.

## Summary

- `scalarCases`: 13
- `sequenceCases`: 3
- `formatControlCases`: 12
- `scalarStableDraftDifferences`: 2
- `sequenceStableDraftDifferences`: 2
- `formatStableDraftDifferences`: 12
- `normativeDecisionsPending`: 28

## Scalar Matrix

| ID | Character | Code point | Stable | Draft | Legacy Word | Legacy Excel | Legacy SQL | Manual evidence | Decision |
|---|---|---|---|---|---|---|---|---|---|
| FA-VAR-001 | آ | `U+0622` | `345` | `345` | `>` | `>` | `> ` | not-yet-established-for-this-scalar | `pending` |
| FA-VAR-002 | أ | `U+0623` | `34` | `34` | `/` | `/` | `/` | not-yet-established-for-this-scalar | `pending` |
| FA-VAR-003 | إ | `U+0625` | `34` | `34` | `/` | `/` | `/` | not-yet-established-for-this-scalar | `pending` |
| FA-VAR-004 | ؤ | `U+0624` | `1256` | `1256` | — | — | `\` | not-yet-established-for-this-scalar | `pending` |
| FA-VAR-005 | ئ | `U+0626` | `13456` | `13456` | `y` | `y` | `y` | not-yet-established-for-this-scalar | `pending` |
| FA-VAR-006 | ة | `U+0629` | `16` | `16` | — | — | — | not-yet-established-for-this-scalar | `pending` |
| FA-VAR-007 | ك | `U+0643` | `13` | `13` | — | — | — | not-yet-established-for-this-scalar | `pending` |
| FA-VAR-008 | ي | `U+064A` | `24` | `24` | `i` | — | — | not-yet-established-for-this-scalar | `pending` |
| FA-VAR-009 | ى | `U+0649` | `135` | `135` | — | — | — | not-yet-established-for-this-scalar | `pending` |
| FA-VAR-010 | ٰ | `U+0670` | `unmapped` | `5` | — | — | — | reported-dot-5 (`5`) | `pending` |
| FA-VAR-011 | ۀ | `U+06C0` | `unmapped` | `125-0-24` | — | — | — | not-yet-established-for-this-scalar | `pending` |
| FA-VAR-012 | ـ | `U+0640` | `6-3` | `6-3` | — | — | — | not-yet-established-for-this-scalar | `pending` |
| FA-VAR-013 | ٔ | `U+0654` | `unmapped` | `unmapped` | — | — | — | not-yet-established-for-this-scalar | `pending` |

## Ezafe / Sequence Matrix

| ID | Input | Code points | Stable | Draft | Manual evidence | Decision |
|---|---|---|---|---|---|---|
| FA-SEQ-001 | `هٔ` | `U+0647 U+0654` | no-explicit-always-rule | explicit-always-rule `125-0-24` | manual-reports-separate-yeh-for-ezafe | `pending` |
| FA-SEQ-002 | `ۀ` | `U+06C0` | no-explicit-always-rule | no-explicit-always-rule | unicode-spelling-not-directly-defined-by-print-era-manual | `pending` |
| FA-SEQ-003 | `ه‌ی` | `U+0647 U+200C U+06CC` | no-explicit-always-rule | explicit-always-rule `125-0-24` | unicode-spelling-not-directly-defined-by-print-era-manual | `pending` |

## Unicode Format Controls

| ID | Code point | Control | Stable | Draft | Decision |
|---|---|---|---|---|---|
| FA-FMT-001 | `U+200C` | ZERO WIDTH NON-JOINER | `mapped` | `ignored-by-context-rule` | `pending` |
| FA-FMT-002 | `U+200E` | LEFT-TO-RIGHT MARK | `unmapped` | `ignored-by-replace` | `pending` |
| FA-FMT-003 | `U+200F` | RIGHT-TO-LEFT MARK | `unmapped` | `ignored-by-replace` | `pending` |
| FA-FMT-004 | `U+202A` | LEFT-TO-RIGHT EMBEDDING | `unmapped` | `ignored-by-replace` | `pending` |
| FA-FMT-005 | `U+202B` | RIGHT-TO-LEFT EMBEDDING | `unmapped` | `ignored-by-replace` | `pending` |
| FA-FMT-006 | `U+202C` | POP DIRECTIONAL FORMATTING | `unmapped` | `ignored-by-replace` | `pending` |
| FA-FMT-007 | `U+202D` | LEFT-TO-RIGHT OVERRIDE | `unmapped` | `ignored-by-replace` | `pending` |
| FA-FMT-008 | `U+202E` | RIGHT-TO-LEFT OVERRIDE | `unmapped` | `ignored-by-replace` | `pending` |
| FA-FMT-009 | `U+2066` | LEFT-TO-RIGHT ISOLATE | `unmapped` | `ignored-by-replace` | `pending` |
| FA-FMT-010 | `U+2067` | RIGHT-TO-LEFT ISOLATE | `unmapped` | `ignored-by-replace` | `pending` |
| FA-FMT-011 | `U+2068` | FIRST STRONG ISOLATE | `unmapped` | `ignored-by-replace` | `pending` |
| FA-FMT-012 | `U+2069` | POP DIRECTIONAL ISOLATE | `unmapped` | `ignored-by-replace` | `pending` |

## Key Stage 1.3 Observations

- Stable and draft both map Arabic kaf and Persian kaf to the same six-dot cell, and Arabic yeh and Persian yeh to the same six-dot cell.
- The draft adds U+0670 ARABIC LETTER SUPERSCRIPT ALEF as dot 5, matching the source audit's report for printed page 28.
- The draft adds explicit Ezafe normalization rules for `هٔ` and `ه‌ی`, while the stable table has no corresponding explicit `always` rules.
- The stable table emits dot 8 for ZWNJ through a `space` mapping; the draft instead suppresses ZWNJ through a context rule.
- The draft explicitly removes several Unicode bidi format controls with `replace` rules.

## Deferred

- punctuation and typographic symbols
- number contexts and fraction slash
- embedded Latin spans
- NBSP/layout semantics
- combining vowel marks as a complete category
- computer/eight-dot Braille
