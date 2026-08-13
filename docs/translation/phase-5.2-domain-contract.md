# Phase 5.2 — Translation Domain Contract

## Status

**Phase 5.2: DOMAIN CONTRACT DEFINED**

This deliverable defines the Core data model and execution boundaries required
for forward print-to-Braille translation.

It does not implement rule selection or translation behavior.

## Architectural position

Phase 5 translation consumes the Phase 4 preprocessing contract:

```text
raw Unicode input
        |
        v
Phase 4 Unicode preprocessing
        |
        v
normalized/preserved text + normalization annotations
        |
        v
Phase 5 matching / token-state mechanics
        |
        v
translation result + trace
```

The Core translation contract does not duplicate canonical Braille mappings.

## Profile provenance

Every successful translation and every post-preprocessing translation failure
carries a `TranslationProfileSnapshot`.

It records:

```text
profileId
profileVersion
profileStatus
direction
normalizationPolicy
fallbackPolicy
```

The current fallback contract remains fail-closed:

```text
unknownCharacter = error
unknownSequence  = error
```

## Unicode spans

Translation matching uses `UnicodeSpan` with:

```text
start
end
```

where `start` is inclusive and `end` is exclusive.

Each location retains the Phase 4 dual coordinate model:

```text
codePointIndex
utf16Index
```

This allows a rule match to be traced correctly even when supplementary-plane
characters occur before the matched text.

## Rule lifecycle and provenance

Every `RuleMatch` records:

```text
ruleId
lifecycleStatus
ruleType
inputKind
priority
matchedText
span
tokenClass
context
output
```

Lifecycle is explicit:

```text
candidate
normative
```

Executing a candidate rule does not promote it.

## Rule output snapshot

The match trace retains canonical output materialization:

```text
cells
unicodeBraille
structuralToken
```

These values are trace data sourced from the canonical runtime specification.

The TypeScript domain contract does not define an independent Braille mapping
table.

## Semantic context

The current audited context vocabulary contains one class:

```text
digit
```

The domain contract therefore defines `SemanticContextClass = "digit"`.

A future specification change that introduces new semantic context classes
must deliberately extend the contract and engine implementation.

## Context classifier boundary

The Core contract defines:

```text
ContextClassifier
```

which classifies a character/location into semantic context classes.

This separates context eligibility from precedence selection.

For example, a numeric-context period rule may only become an eligible
candidate when its surrounding context has been classified as `digit`.

The contract does not yet implement the classifier.

## Engine token boundary

The audited specification currently references these input token classes:

```text
latin-character-class
latin-span-begin
latin-span-end
latin-capital-indicator
numeric-indicator
numeric-begin
numeric-internal
numeric-decimal-separator
numeric-end
numeric-fraction-separator
```

The contract represents them as `EngineTokenClass`.

`EngineTokenProducer` is the explicit boundary for runtime token/state
production.

This is intentionally separate from canonical rule output
`structuralToken` strings.

Phase 5.2 does not decide the numeric or Latin state-machine algorithm.

## Translation trace

A successful result contains a `TranslationTrace` with:

```text
normalizationAnnotations
engineTokens
matches
```

This makes the execution path auditable from raw preprocessing annotations
through engine-generated token classes to the canonical rules that produced
Braille output.

## Translation success

`TranslationSuccess` contains:

```text
inputText
normalizedText
cells
unicodeBraille
structuralTokens
profile
trace
```

The final `structuralTokens` array represents canonical rule-output structural
tokens that later consumers may need for layout/integration behavior.

It is distinct from internal `EngineToken` input classes.

## Failure model

The domain contract defines typed failures:

```text
PREPROCESSING_FAILED
UNKNOWN_CHARACTER
UNKNOWN_SEQUENCE
AMBIGUOUS_MATCH
UNSUPPORTED_ENGINE_STATE
```

### PREPROCESSING_FAILED

Wraps a Phase 4 `NormalizationFailure`.

### UNKNOWN_CHARACTER

Represents the profile's fail-closed unknown-character fallback.

### UNKNOWN_SEQUENCE

Represents the profile's fail-closed unknown-sequence fallback.

The precise distinction between unknown scalar and unknown sequence is an
engine-selection concern to be implemented later.

### AMBIGUOUS_MATCH

Represents a deterministic-selection failure where multiple rule candidates
remain unresolved after legal eligibility and precedence processing.

The engine must fail rather than silently choose by filesystem order.

### UNSUPPORTED_ENGINE_STATE

Represents an engine mechanics/state condition that the current implementation
has not explicitly implemented.

This is especially important for numeric/Latin structural state while Phase 5
is still being built.

## Forward translator boundary

Core exposes the interface:

```text
ForwardTranslator
```

with:

```text
translate(inputText) -> TranslationOutcome
```

The implementation must invoke Phase 4 preprocessing before translation
matching.

The SDK public API remains outside Phase 5.

## Explicitly not implemented here

Phase 5.2 does not implement:

```text
rule candidate collection
sequence matching
context eligibility
priority resolution
longest/specific matching
digit classifier behavior
numeric-state production
Latin-state production
Braille concatenation
layout rendering
CLI behavior
SDK behavior
Web behavior
Microsoft 365 behavior
```

Those behaviors begin in the next Phase 5 deliverables.

## Handoff

The next deliverable is:

**Phase 5.3 — Rule Selection & Precedence Engine**

It will implement deterministic textual/context candidate selection using the
canonical runtime specification and the Phase 5.1 precedence contract.

Structural numeric/Latin execution may remain fail-closed until the forward
pipeline deliverable explicitly defines its state mechanics.
