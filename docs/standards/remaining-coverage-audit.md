# Persian Braille Remaining Coverage Audit

Audit stage: **1.7**

This stage closes the implementation-coverage inventory left after Stages 1.2 through 1.6.

Stable/draft agreement in this document is **not** treated as normative evidence by itself.

## Summary

- `definedScalarUnion`: 199
- `previouslyAuditedDefinedScalars`: 137
- `remainingScalarCases`: 62
- `remainingScalarStableDraftDifferences`: 0
- `remainingScalarDot78Exposures`: 18
- `remainingContextCases`: 15
- `remainingContextStableDraftDifferences`: 0
- `remainingContextDot78Exposures`: 5
- `emphasisCases`: 9
- `emphasisStableDraftDifferences`: 0
- `emphasisDot78Exposures`: 3
- `explicitKnownGapCases`: 1
- `normativeDecisionsPending`: 86

## Remaining scalar inventory

The pinned stable/draft scalar union contains 199 defined scalar characters. Previous audit stages cover 137 of those definitions. Stage 1.7 inventories the remaining 62.

All 62 remaining scalar mappings are identical between the pinned stable and draft tables.

| ID | Character | Code point | Category | Kind | Dots | Dot 7/8 | Decision |
|---|---|---|---|---|---|---|---|
| FA-REM-001 | " | `U+0022` | `quotation` | `punctuation` | `58` | yes | `pending` |
| FA-REM-002 | # | `U+0023` | `punctuation` | `sign` | `3456` | no | `pending` |
| FA-REM-003 | $ | `U+0024` | `symbol` | `sign` | `4-234` | no | `pending` |
| FA-REM-004 | & | `U+0026` | `punctuation` | `sign` | `123468` | yes | `pending` |
| FA-REM-005 | ' | `U+0027` | `quotation` | `punctuation` | `3` | no | `pending` |
| FA-REM-006 | + | `U+002B` | `math-symbol` | `math` | `56-235` | no | `pending` |
| FA-REM-007 | < | `U+003C` | `math-symbol` | `math` | `246` | no | `pending` |
| FA-REM-008 | = | `U+003D` | `math-symbol` | `math` | `56-2356` | no | `pending` |
| FA-REM-009 | > | `U+003E` | `math-symbol` | `math` | `135` | no | `pending` |
| FA-REM-010 | @ | `U+0040` | `punctuation` | `sign` | `4` | no | `pending` |
| FA-REM-011 | [ | `U+005B` | `bracket` | `punctuation` | `6-236` | no | `pending` |
| FA-REM-012 | \ | `U+005C` | `punctuation` | `sign` | `12568` | yes | `pending` |
| FA-REM-013 | ] | `U+005D` | `bracket` | `punctuation` | `356-3` | no | `pending` |
| FA-REM-014 | ^ | `U+005E` | `symbol` | `sign` | `3468` | yes | `pending` |
| FA-REM-015 | _ | `U+005F` | `punctuation` | `sign` | `78` | yes | `pending` |
| FA-REM-016 | ` | `U+0060` | `symbol` | `sign` | `48` | yes | `pending` |
| FA-REM-017 | { | `U+007B` | `bracket` | `punctuation` | `5-236` | no | `pending` |
| FA-REM-018 | | | `U+007C` | `symbol` | `sign` | `4568-1237` | yes | `pending` |
| FA-REM-019 | } | `U+007D` | `bracket` | `punctuation` | `356-2` | no | `pending` |
| FA-REM-020 | ~ | `U+007E` | `math-symbol` | `math` | `45` | no | `pending` |
| FA-REM-021 | ¢ | `U+00A2` | `symbol` | `sign` | `4-14` | no | `pending` |
| FA-REM-022 | £ | `U+00A3` | `symbol` | `sign` | `4-123` | no | `pending` |
| FA-REM-023 | ¥ | `U+00A5` | `symbol` | `sign` | `4-13456` | no | `pending` |
| FA-REM-024 | § | `U+00A7` | `punctuation` | `sign` | `4-234-3` | no | `pending` |
| FA-REM-025 | © | `U+00A9` | `symbol` | `sign` | `147-7` | yes | `pending` |
| FA-REM-026 | « | `U+00AB` | `quotation` | `sign` | `236` | no | `pending` |
| FA-REM-027 | SOFT HYPHEN | `U+00AD` | `other` | `punctuation` | `367` | yes | `pending` |
| FA-REM-028 | ® | `U+00AE` | `symbol` | `sign` | `12357-7` | yes | `pending` |
| FA-REM-029 | ° | `U+00B0` | `symbol` | `sign` | `3568` | yes | `pending` |
| FA-REM-030 | µ | `U+00B5` | `other` | `sign` | `46-134` | no | `pending` |
| FA-REM-031 | ¶ | `U+00B6` | `punctuation` | `sign` | `4-1234-345` | no | `pending` |
| FA-REM-032 | » | `U+00BB` | `quotation` | `sign` | `356` | no | `pending` |
| FA-REM-033 | ¿ | `U+00BF` | `punctuation` | `sign` | `236` | no | `pending` |
| FA-REM-034 | × | `U+00D7` | `math-symbol` | `math` | `56-236` | no | `pending` |
| FA-REM-035 | ÷ | `U+00F7` | `math-symbol` | `math` | `56-256` | no | `pending` |
| FA-REM-036 | ء | `U+0621` | `arabic-letter` | `sign` | `3` | no | `pending` |
| FA-REM-037 | ً | `U+064B` | `arabic-diacritic` | `sign` | `23` | no | `pending` |
| FA-REM-038 | ٌ | `U+064C` | `arabic-diacritic` | `sign` | `26` | no | `pending` |
| FA-REM-039 | ٍ | `U+064D` | `arabic-diacritic` | `sign` | `35` | no | `pending` |
| FA-REM-040 | َ | `U+064E` | `arabic-diacritic` | `sign` | `2` | no | `pending` |
| FA-REM-041 | ُ | `U+064F` | `arabic-diacritic` | `sign` | `136` | no | `pending` |
| FA-REM-042 | ِ | `U+0650` | `arabic-diacritic` | `sign` | `15` | no | `pending` |
| FA-REM-043 | ّ | `U+0651` | `arabic-diacritic` | `sign` | `6` | no | `pending` |
| FA-REM-044 | ْ | `U+0652` | `arabic-diacritic` | `sign` | `25` | no | `pending` |
| FA-REM-045 | ٫ | `U+066B` | `numeric-separator` | `sign` | `2` | no | `pending` |
| FA-REM-046 | ٬ | `U+066C` | `numeric-separator` | `sign` | `3` | no | `pending` |
| FA-REM-047 | ۔ | `U+06D4` | `punctuation` | `punctuation` | `256` | no | `pending` |
| FA-REM-048 | ‐ | `U+2010` | `punctuation` | `punctuation` | `368` | yes | `pending` |
| FA-REM-049 | ‑ | `U+2011` | `punctuation` | `punctuation` | `36-3` | no | `pending` |
| FA-REM-050 | ‘ | `U+2018` | `quotation` | `punctuation` | `236` | no | `pending` |
| FA-REM-051 | ’ | `U+2019` | `quotation` | `punctuation` | `356` | no | `pending` |
| FA-REM-052 | “ | `U+201C` | `quotation` | `punctuation` | `6-12356` | no | `pending` |
| FA-REM-053 | ” | `U+201D` | `quotation` | `punctuation` | `23456-3` | no | `pending` |
| FA-REM-054 | „ | `U+201E` | `quotation` | `punctuation` | `123567` | yes | `pending` |
| FA-REM-055 | ‟ | `U+201F` | `quotation` | `punctuation` | `234568` | yes | `pending` |
| FA-REM-056 | • | `U+2022` | `punctuation` | `sign` | `358` | yes | `pending` |
| FA-REM-057 | € | `U+20AC` | `symbol` | `sign` | `4-15` | no | `pending` |
| FA-REM-058 | − | `U+2212` | `math-symbol` | `math` | `56-36` | no | `pending` |
| FA-REM-059 | ● | `U+25CF` | `symbol` | `sign` | `134678` | yes | `pending` |
| FA-REM-060 | ◦ | `U+25E6` | `symbol` | `sign` | `3578` | yes | `pending` |
| FA-REM-061 | ◾ | `U+25FE` | `symbol` | `sign` | `35678` | yes | `pending` |
| FA-REM-062 | ﷼ | `U+FDFC` | `currency-symbol` | `sign` | `4-1235` | no | `pending` |

## Dot-7 / Dot-8 review queue

The external audit explicitly warns that the literary Grade-1 table contains additional dot-7/dot-8 allocations requiring a complete follow-up audit. Stage 1.7 identifies 18 remaining scalar mappings with dot 7 or 8.

- `U+0022` " — `58` (quotation)
- `U+0026` & — `123468` (punctuation)
- `U+005C` \ — `12568` (punctuation)
- `U+005E` ^ — `3468` (symbol)
- `U+005F` _ — `78` (punctuation)
- `U+0060` ` — `48` (symbol)
- `U+007C` | — `4568-1237` (symbol)
- `U+00A9` © — `147-7` (symbol)
- `U+00AD` SOFT HYPHEN — `367` (other)
- `U+00AE` ® — `12357-7` (symbol)
- `U+00B0` ° — `3568` (symbol)
- `U+2010` ‐ — `368` (punctuation)
- `U+201E` „ — `123567` (quotation)
- `U+201F` ‟ — `234568` (quotation)
- `U+2022` • — `358` (punctuation)
- `U+25CF` ● — `134678` (symbol)
- `U+25E6` ◦ — `3578` (symbol)
- `U+25FE` ◾ — `35678` (symbol)

## Remaining contextual punctuation

Fifteen contextual punctuation/hyphen rules remain after subtracting the number-directive cases explicitly audited in Stage 1.4. Stable and draft agree on all fifteen.

| Directive | Token | Stable | Draft | Dot 7/8 | Decision |
|---|---|---|---|---|---|
| `hyphen` | `-` | `36` | `36` | no | `pending` |
| `midnum` | `-` | `36` | `36` | no | `pending` |
| `postpunc` | `!` | `235` | `235` | no | `pending` |
| `postpunc` | `"` | `58` | `58` | yes | `pending` |
| `postpunc` | `'` | `3567` | `3567` | yes | `pending` |
| `postpunc` | `(` | `2356` | `2356` | no | `pending` |
| `postpunc` | `,` | `2` | `2` | no | `pending` |
| `postpunc` | `.` | `256` | `256` | no | `pending` |
| `postpunc` | `:` | `25` | `25` | no | `pending` |
| `postpunc` | `;` | `23` | `23` | no | `pending` |
| `postpunc` | `?` | `236` | `236` | no | `pending` |
| `prepunc` | `"` | `57` | `57` | yes | `pending` |
| `prepunc` | `'` | `2367` | `2367` | yes | `pending` |
| `prepunc` | `)` | `2356` | `2356` | no | `pending` |
| `prepunc` | ``` | `48` | `48` | yes | `pending` |

## Emphasis indicators

The pinned Grade-1 tables contain nine emphasis declarations/rules for italic, bold, and underline. Stable and draft agree on all nine. Three indicator rules contain dot 7 or 8 and therefore remain in the explicit source-review queue.

| Directive | Class | Stable | Draft | Dot 7/8 | Decision |
|---|---|---|---|---|---|
| `begemph` | `bold` | `456-456` | `456-456` | no | `pending` |
| `emphclass` | `bold` | `class declaration` | `class declaration` | no | `pending` |
| `endemph` | `bold` | `4568` | `4568` | yes | `pending` |
| `begemph` | `italic` | `46-46` | `46-46` | no | `pending` |
| `emphclass` | `italic` | `class declaration` | `class declaration` | no | `pending` |
| `endemph` | `italic` | `46` | `46` | no | `pending` |
| `begemph` | `underline` | `78-78` | `78-78` | yes | `pending` |
| `emphclass` | `underline` | `class declaration` | `class declaration` | no | `pending` |
| `endemph` | `underline` | `78` | `78` | yes | `pending` |

## Explicit known gap

U+0654 ARABIC HAMZA ABOVE remains unmapped as a standalone scalar in both pinned tables. The draft does handle it inside the explicit Ezafe sequence `هٔ`, so scalar coverage and sequence normalization must remain distinct concepts.

This is not counted as a second pending normative decision in Stage 1.7. The scalar itself was already audited as `FA-VAR-013` in Stage 1.3; `FA-GAP-001` is a coverage cross-reference only.

## Phase 1 consequence

After Stage 1.7, the project has a complete inventory of the scalar definitions present in the pinned Persian Grade-1 implementation, plus the contextual punctuation and emphasis rules intentionally deferred by the earlier focused audits.

This closes implementation coverage inventory, but it does not close normative validation. The remaining source-review queue, especially dot-7/dot-8 literary mappings, quotations, symbols, and emphasis indicators, must be resolved before those rules can enter a normative Persian profile.

## Out of Grade-1 scope

Persian eight-dot computer Braille remains a separate future profile and must not be inferred from this six-dot literary Grade-1 inventory.
