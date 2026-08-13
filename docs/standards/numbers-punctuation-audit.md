# Persian Braille Numbers and Punctuation Audit

Audit stage: **1.4**

This stage compares decimal digit repertoires, number syntax directives, selected punctuation scalars, and source-backed context-sensitive cases.

All normative decisions remain pending.

## Summary

- `digitCases`: 30
- `digitStableDraftDifferences`: 0
- `punctuationScalarCases`: 20
- `punctuationScalarStableDraftDifferences`: 4
- `numberDirectiveCases`: 7
- `numberDirectiveStableDraftDifferences`: 0
- `contextCases`: 4
- `contextStableDraftDifferences`: 4
- `normativeDecisionsPending`: 61

## Digit Repertoires

| Set | Value | Character | Code point | Stable | Draft | Legacy Word | Legacy Excel | Legacy SQL |
|---|---:|---|---|---:|---:|---|---|---|
| ascii | 0 | 0 | `U+0030` | `245` | `245` | `#j` | `#j` | `#j` |
| ascii | 1 | 1 | `U+0031` | `1` | `1` | `#a` | `#a` | `#a` |
| ascii | 2 | 2 | `U+0032` | `12` | `12` | `#b` | `#b` | `#b` |
| ascii | 3 | 3 | `U+0033` | `14` | `14` | `#c` | `#c` | `#c` |
| ascii | 4 | 4 | `U+0034` | `145` | `145` | `#d` | `#d` | `#d` |
| ascii | 5 | 5 | `U+0035` | `15` | `15` | `#e` | `#e` | `#e` |
| ascii | 6 | 6 | `U+0036` | `124` | `124` | `#f` | `#f` | `#f` |
| ascii | 7 | 7 | `U+0037` | `1245` | `1245` | `#g` | `#g` | `#g` |
| ascii | 8 | 8 | `U+0038` | `125` | `125` | `#h` | `#h` | `#h` |
| ascii | 9 | 9 | `U+0039` | `24` | `24` | `#i` | `#i` | `#i` |
| arabic-indic | 0 | ٠ | `U+0660` | `245` | `245` | — | — | — |
| arabic-indic | 1 | ١ | `U+0661` | `1` | `1` | — | — | — |
| arabic-indic | 2 | ٢ | `U+0662` | `12` | `12` | — | — | — |
| arabic-indic | 3 | ٣ | `U+0663` | `14` | `14` | — | — | — |
| arabic-indic | 4 | ٤ | `U+0664` | `145` | `145` | — | — | — |
| arabic-indic | 5 | ٥ | `U+0665` | `15` | `15` | — | — | — |
| arabic-indic | 6 | ٦ | `U+0666` | `124` | `124` | — | — | — |
| arabic-indic | 7 | ٧ | `U+0667` | `1245` | `1245` | — | — | — |
| arabic-indic | 8 | ٨ | `U+0668` | `125` | `125` | — | — | — |
| arabic-indic | 9 | ٩ | `U+0669` | `24` | `24` | — | — | — |
| persian | 0 | ۰ | `U+06F0` | `245` | `245` | — | — | — |
| persian | 1 | ۱ | `U+06F1` | `1` | `1` | — | — | — |
| persian | 2 | ۲ | `U+06F2` | `12` | `12` | — | — | — |
| persian | 3 | ۳ | `U+06F3` | `14` | `14` | — | — | — |
| persian | 4 | ۴ | `U+06F4` | `145` | `145` | — | — | — |
| persian | 5 | ۵ | `U+06F5` | `15` | `15` | — | — | — |
| persian | 6 | ۶ | `U+06F6` | `124` | `124` | — | — | — |
| persian | 7 | ۷ | `U+06F7` | `1245` | `1245` | — | — | — |
| persian | 8 | ۸ | `U+06F8` | `125` | `125` | — | — | — |
| persian | 9 | ۹ | `U+06F9` | `24` | `24` | — | — | — |

## Number Directives

| Directive | Token | Stable | Draft | Decision |
|---|---|---|---|---|
| `numsign` | — | `3456` | `3456` | `pending` |
| `begnum` | `#` | `3456-4` | `3456-4` | `pending` |
| `midnum` | `,` | `3` | `3` | `pending` |
| `midnum` | `٬` | `3` | `3` | `pending` |
| `decpoint` | `.` | `2` | `2` | `pending` |
| `decpoint` | `٫` | `2` | `2` | `pending` |
| `endnum` | `%` | `25-1234` | `25-1234` | `pending` |

## Punctuation Scalar Matrix

| Character | Code point | Label | Stable | Draft | Manual evidence | Decision |
|---|---|---|---|---|---|---|
| ! | `U+0021` | EXCLAMATION MARK | `235` | `235` | not-established-in-this-focused-audit | `pending` |
| ? | `U+003F` | QUESTION MARK | `236` | `236` | not-established-in-this-focused-audit | `pending` |
| ؟ | `U+061F` | ARABIC QUESTION MARK | `236` | `236` | not-established-in-this-focused-audit | `pending` |
| . | `U+002E` | FULL STOP | `256` | `256` | not-established-in-this-focused-audit | `pending` |
| , | `U+002C` | COMMA | `2` | `2` | not-established-in-this-focused-audit | `pending` |
| ، | `U+060C` | ARABIC COMMA | `2` | `2` | not-established-in-this-focused-audit | `pending` |
| ; | `U+003B` | SEMICOLON | `23` | `23` | not-established-in-this-focused-audit | `pending` |
| ؛ | `U+061B` | ARABIC SEMICOLON | `23` | `23` | not-established-in-this-focused-audit | `pending` |
| : | `U+003A` | COLON | `25` | `25` | not-established-in-this-focused-audit | `pending` |
| - | `U+002D` | HYPHEN-MINUS | `36` | `36` | not-established-in-this-focused-audit | `pending` |
| – | `U+2013` | EN DASH | `6-36` | `6-36` | not-established-in-this-focused-audit | `pending` |
| — | `U+2014` | EM DASH | `unmapped` | `6-36` | not-established-in-this-focused-audit | `pending` |
| … | `U+2026` | HORIZONTAL ELLIPSIS | `3-3-3` | `6-6-6` | reported (`6-6-6`) | `pending` |
| * | `U+002A` | ASTERISK | `246-135` | `35` | context-sensitive-run-rule-reported | `pending` |
| / | `U+002F` | SOLIDUS | `348` | `34` | reported-numeric-fraction-slash (`34`) | `pending` |
| % | `U+0025` | PERCENT SIGN | `25-1234` | `25-1234` | not-established-in-this-focused-audit | `pending` |
| ٪ | `U+066A` | ARABIC PERCENT SIGN | `25-1234` | `25-1234` | not-established-in-this-focused-audit | `pending` |
|   | `U+00A0` | NO-BREAK SPACE | `a` | `a` | spacing-behavior-reported | `pending` |
| ( | `U+0028` | LEFT PARENTHESIS | `2356` | `2356` | not-established-in-this-focused-audit | `pending` |
| ) | `U+0029` | RIGHT PARENTHESIS | `2356` | `2356` | not-established-in-this-focused-audit | `pending` |

## Context-Sensitive Cases

### FA-CTX-001 — ASCII three-dot ellipsis

- Input: `...`
- Stable explicit rule: `3-3-3`
- Draft explicit rule: `6-6-6`
- Manual audit, printed p. 35: `6-6-6`

### FA-CTX-002 — Numeric fraction slash

- Input: `1/2`
- Stable numeric slash rule: `no-midnum-rule`
- Draft numeric slash rule: `34`
- Manual audit, printed p. 40: slash `34`

### FA-CTX-003 — Single asterisk

- Input: `*`
- Stable: `no-asterisk-run-correction`
- Draft: `asterisk-run-context-rules-present`
- Manual expected dots: `35-35`

### FA-CTX-004 — Adjacent asterisk run

- Input: `***`
- Stable: `no-asterisk-run-correction`
- Draft: `asterisk-run-context-rules-present`
- Manual expected dots: `35-35-35-35`

## Stage 1.4 Findings

- ASCII, Arabic-Indic, and Persian decimal digit cells are unchanged between the pinned stable and draft implementations.
- The focused scalar differences are em dash, Unicode ellipsis, asterisk, and slash.
- The manual audit reports ellipsis as `6-6-6` on printed p. 35, while stable uses `3-3-3`; the draft changes both U+2026 and `...`.
- The manual audit reports a context-sensitive asterisk run on printed p. 36; the draft changes the base asterisk cell and adds contextual correction rules.
- The manual audit reports fraction slash as dots `34` on printed p. 40; the draft changes `/` from stable `348` to `34` and adds a numeric `midnum` rule.
- NBSP retains Liblouis virtual-dot `a` behavior in both pinned tables; this is a layout/integration concern rather than an ordinary Unicode Braille cell.

## Deferred

- embedded Latin spans and capitalization
- full quote/open-close punctuation semantics
- complete punctuation inventory outside the focused matrix
- mathematical notation beyond numeric fraction slash
- eight-dot computer Braille
