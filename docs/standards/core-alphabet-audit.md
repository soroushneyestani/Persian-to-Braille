# Persian Braille Core Alphabet Audit

Audit stage: **1.2**

This audit covers the 32 core letters of the modern Persian alphabet. It is an evidence matrix, not yet a normative v2 specification.

## Evidence Handling

- Liblouis stable evidence is pinned to commit `092e56062d1771b3ca9080651375284adaa5dfad`.
- Liblouis draft evidence is pinned to commit `d47d3f9caa67163bc57aa7f0caf6ccb1ece7b417`.
- The Iranian 1393/2014 manual is not represented here as a direct project transcription. `SRC-LIBLOUIS-2053` reports that printed pages 32-33 match the current core alphabet; this is explicitly recorded as secondary evidence.
- Legacy v1 values remain historical evidence only.
- Every normative decision remains `pending` in Stage 1.2.

## Summary

- `coreLetters`: 32
- `stableMapped`: 32
- `draftMapped`: 32
- `stableDraftExactMatches`: 32
- `manualReportedCoreMatches`: 32
- `normativeDecisionsPending`: 32

## Matrix

| ID | Letter | Code point | Stable dots | Draft dots | Unicode Braille | Legacy Word | Legacy Excel | Legacy SQL | Decision |
|---|---|---|---:|---:|---|---|---|---|---|
| FA-CORE-001 | ا | `U+0627` | `1` | `1` | ⠁ `U+2801` | `a` | `a` | `a` | `pending` |
| FA-CORE-002 | ب | `U+0628` | `12` | `12` | ⠃ `U+2803` | `b` | `b` | `b` | `pending` |
| FA-CORE-003 | پ | `U+067E` | `1234` | `1234` | ⠏ `U+280F` | `p` | `p` | `p` | `pending` |
| FA-CORE-004 | ت | `U+062A` | `2345` | `2345` | ⠞ `U+281E` | `t` | `t` | `t` | `pending` |
| FA-CORE-005 | ث | `U+062B` | `1456` | `1456` | ⠹ `U+2839` | `?` | `?` | `?` | `pending` |
| FA-CORE-006 | ج | `U+062C` | `245` | `245` | ⠚ `U+281A` | `j` | `j` | `j` | `pending` |
| FA-CORE-007 | چ | `U+0686` | `14` | `14` | ⠉ `U+2809` | `c` | `c` | `c` | `pending` |
| FA-CORE-008 | ح | `U+062D` | `156` | `156` | ⠱ `U+2831` | `:` | `:` | `:` | `pending` |
| FA-CORE-009 | خ | `U+062E` | `1346` | `1346` | ⠭ `U+282D` | `x` | `x` | `x` | `pending` |
| FA-CORE-010 | د | `U+062F` | `145` | `145` | ⠙ `U+2819` | `d` | `d` | `d` | `pending` |
| FA-CORE-011 | ذ | `U+0630` | `2346` | `2346` | ⠮ `U+282E` | `!` | `!` | `!` | `pending` |
| FA-CORE-012 | ر | `U+0631` | `1235` | `1235` | ⠗ `U+2817` | `r` | `r` | `r` | `pending` |
| FA-CORE-013 | ز | `U+0632` | `1356` | `1356` | ⠵ `U+2835` | `z` | `z` | `z` | `pending` |
| FA-CORE-014 | ژ | `U+0698` | `346` | `346` | ⠬ `U+282C` | `+` | `+` | `+` | `pending` |
| FA-CORE-015 | س | `U+0633` | `234` | `234` | ⠎ `U+280E` | `s` | `s` | `s` | `pending` |
| FA-CORE-016 | ش | `U+0634` | `146` | `146` | ⠩ `U+2829` | `%` | `%` | `%` | `pending` |
| FA-CORE-017 | ص | `U+0635` | `12346` | `12346` | ⠯ `U+282F` | `&` | `&` | `&` | `pending` |
| FA-CORE-018 | ض | `U+0636` | `1246` | `1246` | ⠫ `U+282B` | `$` | `$` | `$` | `pending` |
| FA-CORE-019 | ط | `U+0637` | `23456` | `23456` | ⠾ `U+283E` | `)` | `)` | `)` | `pending` |
| FA-CORE-020 | ظ | `U+0638` | `123456` | `123456` | ⠿ `U+283F` | `=` | `=` | `=` | `pending` |
| FA-CORE-021 | ع | `U+0639` | `12356` | `12356` | ⠷ `U+2837` | `(` | `(` | `(d` | `pending` |
| FA-CORE-022 | غ | `U+063A` | `126` | `126` | ⠣ `U+2823` | `<` | `<` | `< ` | `pending` |
| FA-CORE-023 | ف | `U+0641` | `124` | `124` | ⠋ `U+280B` | `f` | `f` | `f` | `pending` |
| FA-CORE-024 | ق | `U+0642` | `12345` | `12345` | ⠟ `U+281F` | `q` | `q` | `q` | `pending` |
| FA-CORE-025 | ک | `U+06A9` | `13` | `13` | ⠅ `U+2805` | `k` | `k` | `k` | `pending` |
| FA-CORE-026 | گ | `U+06AF` | `1245` | `1245` | ⠛ `U+281B` | `g` | `g` | `g` | `pending` |
| FA-CORE-027 | ل | `U+0644` | `123` | `123` | ⠇ `U+2807` | `l` | `l` | `l` | `pending` |
| FA-CORE-028 | م | `U+0645` | `134` | `134` | ⠍ `U+280D` | `m` | `m` | `m` | `pending` |
| FA-CORE-029 | ن | `U+0646` | `1345` | `1345` | ⠝ `U+281D` | `n` | `n` | `n` | `pending` |
| FA-CORE-030 | و | `U+0648` | `2456` | `2456` | ⠺ `U+283A` | `w` | `w` | `w` | `pending` |
| FA-CORE-031 | ه | `U+0647` | `125` | `125` | ⠓ `U+2813` | `h` | `h` | `h` | `pending` |
| FA-CORE-032 | ی | `U+06CC` | `24` | `24` | ⠊ `U+280A` | — | `i` | `i` | `pending` |

## Stage 1.2 Findings

All 32 core Persian letters are mapped in both pinned Liblouis tables.
The stable and draft Liblouis mappings are identical for all 32 core letters.
The external audit in `SRC-LIBLOUIS-2053` reports that the Iranian 1393/2014 manual's core alphabet on printed pages 32-33 agrees with the current Liblouis table, including Persian kaf and Persian yeh.
This supports a strong core-alphabet consensus candidate, but Stage 1.2 does not promote those mappings to normative project rules.

## Deferred

The following are intentionally excluded from this stage and require separate evidence matrices:

- alef with madda and hamza forms
- Arabic kaf / Arabic yeh aliases
- teh marbuta and alef maksura
- combining marks and vowel signs
- punctuation and symbols
- digits and numeric contexts
- ZWNJ, NBSP, and bidi controls
- embedded Latin
- Ezafe normalization
- eight-dot computer Braille
