# Phase 13.2 — Reverse Translation Architecture and Contract Freeze

## Status

**FROZEN**

Phase 13.2 freezes the architecture and public-contract target for
Braille-to-Persian translation before implementation begins.

The freeze is grounded in the corrected Phase 13.1 inventory and the Phase
13.1b ambiguity classification.

## Why a stateful reverse parser is required

The canonical forward profile contains 176 rules and 176 reciprocal conformance
vectors.

The Phase 13.1b audit classified them as:

```text
DIRECT_REVERSAL_CANDIDATE          16
PARSER_RULE_REQUIRED                8
STATE_OR_POLICY_REQUIRED          123
STRUCTURAL_RECONSTRUCTION_REQUIRED 29
```

There are 34 collided Braille cell signatures. Ten numeric cell families alone
collide across ASCII digits, Persian digits, Arabic-Indic digits, Latin letters,
and in many cases Persian letters.

Therefore reverse translation is **not**:

```text
Braille cell -> one print character
```

It is a parser/resolver pipeline.

## Frozen pipeline

```text
Unicode Braille input
        ↓
input normalization
        ↓
Braille cell tokenizer
        ↓
longest-match sequence recognizer
        ↓
stateful mode/context parser
        ↓
candidate resolver
        ↓
canonical print renderer
        ↓
SDK result + diagnostics
```

The parser owns at least:

- Persian/Latin language state;
- numeric mode;
- Latin-span state;
- pending capital state;
- delimiter stack for same-cell paired punctuation;
- contextual look-behind/look-ahead where forward rules depend on neighboring
  digits or mode boundaries.

A global cell lookup table is explicitly prohibited.

## Canonical derivation source

Reverse derivation may consume:

```text
spec/fa-ir/rules/records/*.json
spec/fa-ir/conformance/records/*.json
spec/fa-ir/profiles/fa-ir-g1.json
```

The forward records remain direction=`forward`. Phase 13 does not rewrite those
176 records into bidirectional records.

Reverse-specific decisions are materialized separately under:

```text
spec/fa-ir/reverse/policy/
spec/fa-ir/reverse/conformance/
```

## Input contract

The primary public input is a Unicode Braille string.

Braille cells are U+2800 through U+28FF. Literal SPACE, TAB, LF, and CR may also
be accepted as layout separators.

Non-Braille, non-layout input is an expected reverse-translation failure.

Plain Unicode Braille does not preserve every forward structural token. Exact
source layout and ZWNJ provenance are therefore not claimed.

## Canonical rendering policies

### Digits

Numeric mode determines that a cell is numeric, but it cannot determine whether
the original print source used:

```text
1
۱
١
```

The reverse API therefore exposes a digit-family option:

```text
persian      ← default
ascii
arabic-indic
```

The default is Persian digits because this is the Persian reverse profile.

### Punctuation

The default output style is `persian`.

Representative canonical forms:

```text
comma              ،
semicolon          ؛
question mark      ؟
decimal separator  ٫
group separator    ٬
percent             ٪
```

An `ascii` punctuation style is also supported by the contract.

### Ellipsis

The default canonical form is:

```text
…
```

The alternative policy is three ASCII periods:

```text
...
```

### Ambiguity

Default:

```text
canonicalize
```

When source spelling cannot be recovered, the engine selects the configured
canonical form and records a diagnostic.

Strict consumers can select:

```text
error
```

which produces `AMBIGUOUS_REVERSE_MATCH`.

This is especially important for collided punctuation and other cases where
mode/context still cannot prove the original print spelling.

### Paired punctuation

Open/close punctuation that shares one Braille cell must use parser position and
a delimiter stack. It must never be hard-coded as always-open or always-close.

If parser context cannot resolve it, the configured ambiguity policy applies.

## Public SDK target

The Phase 12 forward SDK remains unchanged.

Phase 13 adds a separate reverse translator rather than adding required methods
to the frozen Phase 12 `PersianBrailleTranslator` interface.

Runtime exports:

```text
PersianBrailleReverseTranslationError
createPersianBrailleReverseTranslator
```

Primary interface:

```ts
interface PersianBrailleReverseTranslator {
  translateFromBraille(
    input: string,
    options?: PersianBrailleReverseTranslationOptions,
  ): PersianBrailleReverseTranslationResult;

  translateFromBrailleOrThrow(
    input: string,
    options?: PersianBrailleReverseTranslationOptions,
  ): PersianBrailleReverseTranslationSuccess;
}
```

The reverse profile direction is:

```text
braille-to-print
```

The success result exposes the reconstructed print `text`, parsed `cells`,
diagnostics, and a `lossy` flag.

Expected failure codes are frozen as:

```text
INVALID_BRAILLE_INPUT
UNKNOWN_BRAILLE_CELL
UNKNOWN_BRAILLE_SEQUENCE
AMBIGUOUS_REVERSE_MATCH
MALFORMED_MODE_SEQUENCE
UNTERMINATED_LATIN_SPAN
DANGLING_CAPITAL_INDICATOR
UNSUPPORTED_REVERSE_STATE
```

## Diagnostics

Canonicalization is not hidden.

The reverse success result may expose diagnostics such as:

```text
CANONICALIZED_DIGIT_FAMILY
CANONICALIZED_PUNCTUATION
CANONICALIZED_ELLIPSIS
AMBIGUITY_CANONICALIZED
LOSSY_LAYOUT_RECONSTRUCTION
LOSSY_NORMALIZATION_RECONSTRUCTION
```

## Reverse conformance

Forward vectors are evidence, not reverse vectors with the fields swapped.

Phase 13 creates independent reverse conformance covering:

- direct unique-cell mappings;
- numeric mode;
- all three digit rendering policies;
- Latin spans;
- capital indicators;
- numeric separators;
- punctuation canonicalization;
- paired punctuation;
- longest-match sequences;
- ambiguity under both `canonicalize` and `error`;
- malformed Braille;
- malformed/unterminated mode state;
- layout/normalization lossiness;
- round-trip properties.

### Round-trip semantics

Exact print round-trip is claimed only for an explicitly reversible subset.

For lossy forward mappings:

```text
reverse(forward(print))
```

is compared with the configured **canonical print form**, not necessarily the
original source spelling.

For accepted supported Braille, the stronger useful invariant is Braille
stability:

```text
forward(reverse(braille)) == canonical accepted braille
```

for non-layout cases where the reverse policy defines a print rendering.

## Architecture boundary

The dependency direction remains:

```text
reverse specification/policy
          ↓
@persian-braille/core
          ↓
@persian-braille/sdk
          ↓
CLI / Web / integrations
```

Core remains platform-agnostic. Microsoft 365 does not own reverse translation
semantics.

## Scope guards

Phase 13 does not include:

```text
Phase 14 — Braille Music
Phase 15 — Multi-language / General Braille Framework
Phase 16 — Office on the Web
Phase 17 — Microsoft 365 Mac
Phase 18 — Marketplace
```

Forward Persian Braille semantics are not rewritten as part of the reverse
implementation.

## Next

```text
Phase 13.3 — Reverse Specification and Conformance Foundation
```
