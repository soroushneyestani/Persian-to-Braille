# Persian Braille Mixed Latin Audit

Audit stage: **1.5**

This stage compares the handling of embedded ASCII Latin letters in the pinned Persian Grade 1 stable and draft implementations.

No Stage 1.5 row is normative yet.

## Source-backed policy

`SRC-LIBLOUIS-2053` reports that printed page 46 of the Iranian 1393/2014 manual uses ordinary uncontracted six-dot English inside a Latin span bounded by dot 25 on each side.

The stable table instead encodes uppercase ASCII letters with dot 7 and lowercase ASCII letters with dot 8, with no Latin span boundary mode.

The draft replaces those allocations with ordinary six-dot English cells, adds a `latin` attribute, uses dot 25 for `begmode`/`endmode`, and uses dot 6 as the capital-letter indicator.

## Summary

- `asciiLetterCases`: 52
- `asciiLetterStableDraftDifferences`: 52
- `uppercaseCases`: 26
- `lowercaseCases`: 26
- `modeRuleCases`: 4
- `modeRuleStableDraftDifferences`: 4
- `normativeDecisionsPending`: 56

## Letter Matrix

| Letter | Case | Stable dots | Draft dots | Decision |
|---|---|---:|---:|---|
| `A` | uppercase | `17` | `1` | `pending` |
| `B` | uppercase | `127` | `12` | `pending` |
| `C` | uppercase | `147` | `14` | `pending` |
| `D` | uppercase | `1457` | `145` | `pending` |
| `E` | uppercase | `157` | `15` | `pending` |
| `F` | uppercase | `1247` | `124` | `pending` |
| `G` | uppercase | `12457` | `1245` | `pending` |
| `H` | uppercase | `1257` | `125` | `pending` |
| `I` | uppercase | `247` | `24` | `pending` |
| `J` | uppercase | `2457` | `245` | `pending` |
| `K` | uppercase | `137` | `13` | `pending` |
| `L` | uppercase | `1237` | `123` | `pending` |
| `M` | uppercase | `1347` | `134` | `pending` |
| `N` | uppercase | `13457` | `1345` | `pending` |
| `O` | uppercase | `1357` | `135` | `pending` |
| `P` | uppercase | `12347` | `1234` | `pending` |
| `Q` | uppercase | `123457` | `12345` | `pending` |
| `R` | uppercase | `12357` | `1235` | `pending` |
| `S` | uppercase | `2347` | `234` | `pending` |
| `T` | uppercase | `23457` | `2345` | `pending` |
| `U` | uppercase | `1367` | `136` | `pending` |
| `V` | uppercase | `12367` | `1236` | `pending` |
| `W` | uppercase | `24567` | `2456` | `pending` |
| `X` | uppercase | `13467` | `1346` | `pending` |
| `Y` | uppercase | `134567` | `13456` | `pending` |
| `Z` | uppercase | `13567` | `1356` | `pending` |
| `a` | lowercase | `18` | `1` | `pending` |
| `b` | lowercase | `128` | `12` | `pending` |
| `c` | lowercase | `148` | `14` | `pending` |
| `d` | lowercase | `1458` | `145` | `pending` |
| `e` | lowercase | `158` | `15` | `pending` |
| `f` | lowercase | `1248` | `124` | `pending` |
| `g` | lowercase | `12458` | `1245` | `pending` |
| `h` | lowercase | `1258` | `125` | `pending` |
| `i` | lowercase | `248` | `24` | `pending` |
| `j` | lowercase | `2458` | `245` | `pending` |
| `k` | lowercase | `138` | `13` | `pending` |
| `l` | lowercase | `1238` | `123` | `pending` |
| `m` | lowercase | `1348` | `134` | `pending` |
| `n` | lowercase | `13458` | `1345` | `pending` |
| `o` | lowercase | `1358` | `135` | `pending` |
| `p` | lowercase | `12348` | `1234` | `pending` |
| `q` | lowercase | `123458` | `12345` | `pending` |
| `r` | lowercase | `12358` | `1235` | `pending` |
| `s` | lowercase | `2348` | `234` | `pending` |
| `t` | lowercase | `23458` | `2345` | `pending` |
| `u` | lowercase | `1368` | `136` | `pending` |
| `v` | lowercase | `12368` | `1236` | `pending` |
| `w` | lowercase | `24568` | `2456` | `pending` |
| `x` | lowercase | `13468` | `1346` | `pending` |
| `y` | lowercase | `134568` | `13456` | `pending` |
| `z` | lowercase | `13568` | `1356` | `pending` |

## Mode Rules

| Directive | Name | Stable | Draft | Decision |
|---|---|---|---|---|
| `attribute` | `latin` | `absent` | `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz` | `pending` |
| `begmode` | `latin` | `absent` | `25` | `pending` |
| `endmode` | `latin` | `absent` | `25` | `pending` |
| `capsletter` | — | `absent` | `6` | `pending` |

## Representative Differences

- Stable `A`: `17`; draft `A`: `1` plus span/capital policy.
- Stable `a`: `18`; draft `a`: `1` plus span policy.
- Stable `Z`: `13567`; draft `Z`: `1356` plus span/capital policy.
- Stable `z`: `13568`; draft `z`: `1356` plus span policy.

## Legacy v1

The recovered v1 runtime artifacts do not contain an English alphabet translator. The historical project description states that English conversion was intended/supported, but the recovered file named `EnglishBrailleMaker.bas` is actually an Excel Persian-to-Braille macro. Stage 1.5 therefore records legacy English runtime evidence as unrecovered.

## Review risk

Automatic Latin-span boundaries remain a policy choice requiring explicit review. The current Liblouis PR itself calls this out for maintainer and Persian Braille-reader review.

## Deferred

- Latin digits and punctuation inside mixed spans
- non-ASCII Latin letters
- URLs, email addresses, code identifiers, and acronyms
- exact host behavior across Word/Excel/PowerPoint text runs
- eight-dot computer Braille
