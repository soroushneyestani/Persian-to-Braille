# Phase 5 — Core Translation Engine Closure

## Closure semantics

This document is the closure record for Phase 5.

The commit containing this document must be merged into `main` only after the
required GitHub validation checks are green. Therefore, once this document is
present on `main`, **Phase 5 — Core Translation Engine is CLOSED**.

## Finite exit criteria

Phase 5 was defined by six finite deliverables:

```text
1. Canonical Execution Audit
2. Translation Domain Contract
3. Rule Selection & Precedence Engine
4. Forward Translation Pipeline
5. Translation Conformance & Regression
6. Phase 5 Closure
```

All implementation deliverables are complete before this closure record is
merged.

## 1. Canonical Execution Audit

Phase 5 froze the canonical execution baseline before implementing translation.

Current profile:

```text
profile                 fa-ir-g1 0.1.0
profile status          draft
direction               print-to-braille
admitted rules          175
conformance vectors     175
```

Lifecycle:

```text
normative rules          37
candidate rules         138
active vectors           37
draft vectors           138
```

Rule types:

```text
character               132
context                    7
layout                    27
mode                       5
normalization              1
sequence                   3
```

Execution semantics frozen by the audit include:

```text
lower numeric priority = higher precedence
context eligibility is evaluated before precedence
canonical longer/specific rules outrank shorter overlapping components
unknownCharacter = error
unknownSequence  = error
candidate execution != normative promotion
```

Artifacts:

```text
tools/translation/audit-phase5-execution.py
docs/translation/phase-5.1-execution-audit.md
```

## 2. Translation Domain Contract

Core defines typed forward-translation contracts for:

```text
TranslationProfileSnapshot
UnicodeSpan
ContextSnapshot
EngineToken
RuleOutputSnapshot
RuleMatch
TranslationTrace
TranslationSuccess
TranslationFailure
TranslationOutcome
ContextClassifier
EngineTokenProducer
ForwardTranslator
```

Typed failure codes:

```text
PREPROCESSING_FAILED
UNKNOWN_CHARACTER
UNKNOWN_SEQUENCE
AMBIGUOUS_MATCH
UNSUPPORTED_ENGINE_STATE
```

The contract preserves both Unicode code-point and UTF-16 coordinates.

Artifact:

```text
packages/core/src/translation.ts
docs/translation/phase-5.2-domain-contract.md
```

## 3. Rule Selection & Precedence Engine

Core implements deterministic specification-driven selection for textual rules.

Eligible textual rule kinds:

```text
scalar
context
sequence
```

Eligible rule types in the selector:

```text
character
context
sequence
layout
```

Phase 4 normalization rules are deliberately excluded from textual
single-winner selection.

Mode/structural rules are executed by the later pipeline state layer.

Representative verified precedence cases:

```text
***  >  *
numeric-context "."  >  scalar "."
هٔ   >  ه
```

ZWNJ remains cross-layer:

```text
normalization layer -> Phase 4 annotation
layout layer        -> Phase 5 selector
```

The selector never resolves ties by source order or rule ID.

Artifacts:

```text
packages/core/src/rule-selector.ts
docs/translation/phase-5.3-rule-selection.md
```

## 4. Forward Translation Pipeline

Core implements the first complete specification-driven forward translator.

Pipeline:

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
canonical structural mode-rule execution
        |
        v
Phase 5 textual/context rule selection
        |
        v
output aggregation + execution trace
        |
        v
TranslationOutcome
```

Artifacts:

```text
packages/core/src/engine-token-producer.ts
packages/core/src/mode-rule-executor.ts
packages/core/src/forward-translator.ts
docs/translation/phase-5.4-forward-pipeline.md
```

### Numeric execution mechanics

The canonical specification owns all numeric Braille cells.

The engine provides only the state mechanics needed to invoke admitted
numeric rules.

The current engine:

```text
starts a numeric run with numeric-indicator
keeps a run open across admitted digit characters
keeps a run open across numeric-begin/internal/decimal/fraction separators
does not duplicate the numeric indicator after numeric-begin
starts a new run after numeric-end when appropriate
```

Verified representative output:

```text
1.2 -> ⠼⠁⠂⠃
```

### Latin execution mechanics

The current canonical corpus contains 52 admitted ASCII Latin scalar rules.

Contiguous admitted Latin letters form an embedded Latin span.

The engine produces:

```text
latin-span-begin
latin-character-class
latin-capital-indicator
latin-span-end
```

Canonical mode rules supply the Braille cells.

Verified representative outputs:

```text
test -> ⠒⠞⠑⠎⠞⠒
Test -> ⠒⠠⠞⠑⠎⠞⠒
```

### Persian end-to-end execution

The forward translator now translates Persian text through the complete Core
pipeline.

Verified representative output:

```text
سلام -> ⠎⠇⠁⠍
```

### ZWNJ cross-layer preservation

Forward translation preserves both canonical semantic layers:

```text
normalization:zwnj-orthographic-boundary
layout:shaping-control:U+200C
```

The current ZWNJ itself produces no Braille cell.

## 5. Translation Conformance & Regression

Phase 5 converts manual smoke checks into committed encoding-safe Node.js
regression tests.

Committed suites:

```text
packages/core/test/unicode-preprocessor.test.mjs
packages/core/test/rule-selector.test.mjs
packages/core/test/forward-translator.test.mjs
packages/core/test/canonical-execution-bridge.test.mjs
```

The Core package test command builds once and executes all four suites.

Current result at Phase 5.5 closure:

```text
tests      210
pass       210
fail       0
cancelled  0
skipped    0
todo       0
```

### Canonical execution bridge

All 175 current canonical vectors are bridged to their owning Core execution
layer:

```text
character/context/sequence/layout -> RuleSelector
mode                              -> ModeRuleExecutor
normalization                     -> UnicodePreprocessor
```

The bridge verifies:

```text
175 rules
175 vectors
37 active vectors
138 draft vectors
```

and preserves lifecycle compatibility:

```text
normative rule -> active vector
candidate rule -> draft vector
```

Passing a candidate/draft vector does not promote it.

Artifact:

```text
docs/translation/phase-5.5-conformance-regression.md
```

## CI integration

Architecture Validation covers translation implementation and supporting
translation documentation/tooling.

The workflow path triggers include:

```text
packages/**
docs/translation/**
tools/translation/**
```

The repository-wide test command executes the 210-test Core regression suite.

Specification Validation remains independently responsible for specification
and governance integrity.

## Architecture invariants preserved

The Phase 3 dependency direction remains unchanged:

```text
specification
    |
    v
core
    |
    v
sdk
    |
    +--> cli
    +--> web
    +--> integrations/microsoft365
```

Phase 5 behavior is implemented entirely inside Core.

No Office-specific logic enters Core.

## Specification ownership preserved

The architecture principle remains:

```text
Specification owns the rules.
Core executes them.
SDK exposes them.
Microsoft 365 is one consumer.
```

Core does not maintain an independent Braille mapping table.

Braille cells, Unicode Braille outputs, structural tokens, rule lifecycle, and
canonical rule content continue to come from the specification runtime bundle.

## Governance invariants preserved

Phase 5 does not alter normative-promotion governance.

In particular:

```text
candidate != normative
draft vector != active vector
runtime admission != normative promotion
successful execution != normative promotion
CI PASS != normative promotion
```

The draft `fa-ir-g1 0.1.0` profile remains draft.

## Encoding-safety lesson retained

The first manual Phase 5.4 PowerShell smoke run demonstrated that terminal
encoding can corrupt literal Persian/Braille test data.

Committed regression tests therefore use Unicode escapes for non-ASCII values
where shell/terminal encoding could alter the source.

The encoding-safe rerun passed all forward-pipeline checks before Phase 5.5 was
committed.

## Explicitly outside Phase 5

Phase 5 does not implement:

```text
public SDK surface
CLI translation UX
Web playground UI
Microsoft 365 Office Add-in behavior
reverse translation
Braille Music
multi-language Braille framework
complete profile-level conformance reporting
```

These remain later roadmap responsibilities.

## Phase 6 boundary

The next roadmap phase is:

**Phase 6 — Conformance Suite**

Phase 5.5 deliberately does not claim to complete Phase 6.

Phase 6 may build on the current executable rule bridge and add broader
profile-level conformance capabilities such as:

```text
multi-rule composition scenarios
negative/invalid-input conformance
profile-level end-to-end fixtures
machine-readable conformance reports
coverage accounting by category and lifecycle
future conformance fixtures beyond current single-rule records
```

## Required closure fixed point

Before the closure commit is pushed, the feature branch must pass:

```text
pnpm run clean
pnpm run build
pnpm run typecheck
pnpm run validate:normalization
pnpm run validate:architecture
pnpm run validate:runtime
pnpm run test
pnpm run clean
git diff --check
```

Repository hygiene must show no tracked:

```text
dist
node_modules
*.tsbuildinfo
packages/core/src/generated
```

After the closure commit is pushed, the pull request must return green for:

```text
Architecture Validation
Specification Validation
```

Only then may the closure commit be merged.

## Closure statement

Presence of this document on `main` means the closure commit passed the
required pull-request validation and was merged deliberately.

At that point:

**Phase 5 — Core Translation Engine: CLOSED**
