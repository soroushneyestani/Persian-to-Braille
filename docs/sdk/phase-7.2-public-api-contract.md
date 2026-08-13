# Phase 7.2 — Public API Contract

## Status

**Phase 7.2: PUBLIC API CONTRACT DEFINED**

This deliverable freezes the first consumer-facing API contract for
`@persian-braille/sdk`.

It defines types only.

Runtime SDK behavior is implemented in Phase 7.3.

## Architecture boundary

The SDK remains a facade over Core:

```text
Specification -> Core -> SDK -> Consumers
```

The SDK does not own:

```text
Braille mappings
normalization rules
rule selection
precedence
engine tokens
mode-rule execution
profile conformance semantics
```

Those remain specification/Core responsibilities.

## Public surface philosophy

The SDK contract is deliberately smaller than the Core root export surface.

Core currently exposes implementation/domain modules including:

```text
specification
normalization
unicode-preprocessor
translation
rule-selector
engine-token-producer
mode-rule-executor
forward-translator
```

Phase 7 does **not** make all of those SDK API.

The v2 SDK contract exposes a consumer-oriented translator facade instead.

## Reserved runtime factory

Phase 7.3 will implement and export:

```ts
createPersianBrailleTranslator(): PersianBrailleTranslator
```

The translator is intended to be reusable and stateless from the consumer's
point of view.

No options object is introduced in the initial contract because the current
SDK has exactly one bundled forward profile:

```text
fa-ir-g1 0.1.0
direction = print-to-braille
```

Future profile selection can be added deliberately rather than pre-designing
an unused configuration surface.

## Translator contract

```ts
interface PersianBrailleTranslator {
  readonly profile: PersianBrailleProfileInfo;

  translate(
    input: string,
  ): PersianBrailleTranslationResult;

  translateOrThrow(
    input: string,
  ): PersianBrailleTranslationSuccess;
}
```

### `translate()`

`translate()` is the default non-throwing API for expected translation
failures.

It returns a discriminated union:

```text
ok = true  -> PersianBrailleTranslationSuccess
ok = false -> PersianBrailleTranslationFailure
```

This allows applications to handle unsupported/invalid translation input
without exception-driven control flow.

### `translateOrThrow()`

`translateOrThrow()` is the convenience API for consumers that prefer
exception-driven handling.

On success it returns the same public success shape.

On an expected translation failure, Phase 7.3 will throw a stable SDK error
whose public data contains the corresponding
`PersianBrailleTranslationFailure`.

Unexpected programmer/runtime faults are not to be silently converted into
translation failures.

## Public profile metadata

The SDK exposes immutable profile metadata through:

```ts
translator.profile
```

Shape:

```ts
interface PersianBrailleProfileInfo {
  readonly id: string;
  readonly version: string;
  readonly status: string;
  readonly direction: "print-to-braille";
}
```

`status` remains a string rather than a hardcoded `"draft"` literal so a future
profile lifecycle change does not require an SDK type redesign.

The SDK must report the profile metadata supplied by Core/runtime
specification consumption; it must not maintain a second hardcoded profile
record.

## Public success shape

```ts
interface PersianBrailleTranslationSuccess {
  readonly ok: true;
  readonly input: string;
  readonly profile: PersianBrailleProfileInfo;
  readonly normalizedText: string;
  readonly cells: readonly string[];
  readonly unicodeBraille: string;
  readonly structuralTokens: readonly string[];
}
```

The public success surface intentionally exposes final translation products,
not engine internals.

## Public failure shape

```ts
interface PersianBrailleTranslationFailure {
  readonly ok: false;
  readonly input: string;
  readonly profile: PersianBrailleProfileInfo;
  readonly code: PersianBrailleTranslationFailureCode;
  readonly message: string;
  readonly location?: PersianBrailleUnicodeLocation;
  readonly character?: string;
  readonly codePoint?: string;
  readonly candidateRuleIds?: readonly string[];
  readonly causeCode?: string;
}
```

Stable failure-code vocabulary:

```text
PREPROCESSING_FAILED
UNKNOWN_CHARACTER
UNKNOWN_SEQUENCE
AMBIGUOUS_MATCH
UNSUPPORTED_ENGINE_STATE
```

These codes mirror the typed Core translation contract without exposing the
entire Core failure object.

## Unicode locations

When available, the public SDK preserves both coordinate systems:

```ts
interface PersianBrailleUnicodeLocation {
  readonly codePointIndex: number;
  readonly utf16Index: number;
}
```

This preserves the Phase 4/5 Unicode-location invariant and supports
JavaScript/Office consumers that use UTF-16 indexing.

## What is intentionally hidden

The initial public result does not expose:

```text
RuleMatch[]
engine-token stream
normalization annotation objects
selector internals
mode-rule executor internals
canonical runtime rule records
full Core TranslationTrace
```

Those are valuable diagnostics internally but would unnecessarily couple
third-party consumers to the translation engine's implementation structure.

If a future diagnostics API is required, it should be added explicitly under a
separate stable contract.

## Immutability

Public result/profile arrays and fields are declared `readonly`.

The SDK implementation should create a consumer-safe public projection instead
of returning mutable Core objects directly.

## Error-data contract

The contract reserves:

```ts
interface PersianBrailleTranslationErrorData {
  readonly code: PersianBrailleTranslationFailureCode;
  readonly result: PersianBrailleTranslationFailure;
}
```

Phase 7.3 will use this shape for the runtime SDK translation error.

The exact runtime class must be SDK-owned rather than leaking an internal Core
error implementation.

## No direct Core re-export

The SDK root must not become:

```ts
export * from "@persian-braille/core";
```

Public SDK symbols must be explicitly selected and maintained.

This prevents accidental semver coupling between internal Core growth and the
consumer-facing SDK.

## Current consumer compatibility target

The workspace consumer topology remains:

```text
apps/cli                 -> SDK
apps/web                 -> SDK
integrations/microsoft365 -> SDK
```

Direct Core bypass outside SDK remains forbidden.

Phase 7.4 will add tests that exercise the SDK from the same public package
surface consumers are expected to use.

## Contract artifact

Type contract:

```text
packages/sdk/src/public-api.ts
```

Documentation:

```text
docs/sdk/phase-7.2-public-api-contract.md
```

The contract type file is intentionally not exported from the package root in
Phase 7.2.

Phase 7.3 will implement the runtime facade and then expose the selected public
types and runtime symbols from `packages/sdk/src/index.ts`.

This keeps Phase 7.2 free of runtime behavior changes.

## Explicitly not implemented here

Phase 7.2 does not add:

```text
createPersianBrailleTranslator runtime implementation
SDK translation behavior
SDK runtime error class
SDK tests
consumer integration tests
npm pack validation
publication metadata
publishing automation
```

## Handoff

The next deliverable is:

**Phase 7.3 — SDK Implementation**

It will implement the translator facade as a strict projection over Core,
expose the selected public symbols from the SDK root, and add no independent
translation semantics.
