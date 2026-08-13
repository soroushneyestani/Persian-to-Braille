# Phase 5.4 — Forward Translation Pipeline

## Status

**Phase 5.4: IMPLEMENTED**

This deliverable composes Phase 4 preprocessing, Phase 5.3 rule selection,
canonical structural mode rules, engine-state token production, output
aggregation, and typed failures into the first complete Core forward
translator.

## Audited state semantics

The Phase 5.4 audit confirmed five canonical mode rules:

```text
numeric-indicator        -> dots 3456
latin-character-class    -> structural mode token
latin-span-begin         -> dots 25
latin-span-end           -> dots 25
latin-capital-indicator  -> dot 6
```

It also confirmed:

```text
numeric rules                   8
ASCII Latin scalar rules       52
Latin-related rules            56
token-class conformance vectors 12
```

The Latin evidence explicitly records an embedded six-dot English span bounded
by dot-25 markers, with dot 6 before a capital letter.

The numeric evidence records Liblouis-style `numsign`, `begnum`, `midnum`,
`decpoint`, and `endnum` infrastructure. The canonical specification
materializes their outputs separately from scalar digit mappings.

## Pipeline

The translator executes:

```text
raw Unicode input
        |
        v
Phase 4 Unicode preprocessing
        |
        v
engine-state token production
        |
        v
canonical structural mode rules
        |
        v
Phase 5.3 textual/context selector
        |
        v
output aggregation + trace
        |
        v
TranslationOutcome
```

## Numeric engine mechanics

The canonical specification owns all numeric cell outputs.

Phase 5.4 defines only the runtime mechanics required to invoke those rules.

A `numeric-indicator` token is produced before an admitted digit that starts a
numeric run.

A preceding admitted digit keeps the run open.

The following eligible numeric context rules also keep the run open for the
following digit:

```text
numeric-begin
numeric-internal
numeric-decimal-separator
numeric-fraction-separator
```

This means the current engine produces one numeric indicator for examples such
as:

```text
12
1.2
1/2
```

The `numeric-begin` rule for `#` already contains the canonical numeric-sign
cells in its own output, so a following admitted digit does not receive a
second numeric indicator.

`numeric-end` does not keep the run open; a later digit begins a new numeric
run.

This is explicitly an engine execution contract over the admitted numeric
rules. It is not a new Braille mapping and does not promote candidate rules.

## Latin engine mechanics

The current canonical corpus contains exactly 52 admitted ASCII Latin scalar
character rules.

Phase 5.4 treats a contiguous run of those admitted Latin character rules as
one embedded Latin span.

At span entry it produces:

```text
latin-span-begin
```

At span exit it produces:

```text
latin-span-end
```

For every admitted Latin character it produces:

```text
latin-character-class
```

For each ASCII uppercase Latin character it additionally produces:

```text
latin-capital-indicator
```

Punctuation or other non-Latin characters terminate the current Latin span.
Phase 5.4 does not generalize unsupported punctuation into a Latin span.

The Braille cells for span/capital markers come from canonical mode rules, not
from hard-coded TypeScript cell tables.

## Mode-rule execution

`mode-rule-executor.ts` indexes canonical structural mode rules by token class.

Construction fails if:

```text
the current mode-rule inventory is not exactly five
a mode token class is duplicated
a canonical mode rule has an unsupported lifecycle/input/output shape
```

No source-order tie breaker exists.

## Translation output

A successful result aggregates:

```text
cells
unicodeBraille
structuralTokens
profile provenance
normalization annotations
engine tokens
rule matches
```

Normalization structural tokens are preserved from Phase 4 annotations.

Layout and mode structural tokens are preserved from canonical rule outputs.

## Trace ordering

Engine-state tokens are executed at their Unicode code-point boundary before
textual selection at that boundary.

A terminal token at the end of input is also executed, which allows a final
Latin span-end marker to be emitted after the last Latin character.

Context-rule token classes are retained in the execution trace when their
textual rules match.

## Unicode position safety

All token and rule spans preserve both:

```text
codePointIndex
utf16Index
```

The pipeline therefore remains compatible with supplementary-plane characters
and the Phase 4 position model.

## Fail-closed behavior

The translator returns typed failures for:

```text
PREPROCESSING_FAILED
UNKNOWN_CHARACTER
AMBIGUOUS_MATCH
UNSUPPORTED_ENGINE_STATE
```

`UNKNOWN_SEQUENCE` remains part of the Phase 5 domain contract, but the
current admitted corpus does not require a separate runtime branch for a
partial sequence whose scalar fallback is absent.

Unknown format controls fail during Phase 4 preprocessing before rule
selection.

An unknown ordinary character fails as `UNKNOWN_CHARACTER`.

## Multi-code-point safety boundary

If a future multi-code-point textual rule crosses a generated engine-state
token boundary inside its span, Phase 5.4 fails with
`UNSUPPORTED_ENGINE_STATE` rather than silently reordering state events.

The current admitted sequence corpus does not cross numeric or Latin
state-token boundaries.

## Governance

The translator executes the draft profile exactly as admitted.

Execution preserves rule lifecycle in every trace:

```text
candidate
normative
```

Execution does not imply normative promotion.

## Explicitly outside Phase 5.4

This deliverable does not add:

```text
new Braille mappings
new canonical rules
SDK public API
CLI UX
Web UI
Microsoft 365 behavior
reverse translation
Braille Music
multi-language framework
```

## Handoff

The next deliverable is:

**Phase 5.5 — Translation Conformance & Regression**

It must convert the currently manual selector/pipeline smoke coverage into a
committed regression suite and bridge canonical conformance vectors to the
forward translator while preserving active/draft lifecycle distinctions.
