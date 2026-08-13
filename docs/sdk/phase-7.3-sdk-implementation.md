# Phase 7.3 — SDK Implementation

## Status

**Phase 7.3: IMPLEMENTED**

This deliverable implements the Phase 7.2 public API contract as a strict
consumer-facing projection over Core.

It adds no Braille or translation semantics to the SDK.

## Runtime entry point

The SDK root now exports:

```ts
createPersianBrailleTranslator()
PersianBrailleTranslationError
```

and the selected Phase 7.2 public types.

It does not re-export Core wholesale.

## Core-backed translator

The implementation creates the real Core forward translator:

```ts
createForwardTranslator()
```

and wraps it behind:

```ts
PersianBrailleTranslator
```

Execution therefore remains:

```text
Specification -> Core -> SDK
```

The SDK does not implement:

```text
Unicode preprocessing
rule selection
precedence
numeric-state handling
Latin-state handling
mode rules
layout rules
normalization rules
Braille mappings
```

## Public result projection

Core outcomes are projected into immutable SDK-owned result objects.

A successful SDK result contains:

```text
ok
input
profile
normalizedText
cells
unicodeBraille
structuralTokens
```

The SDK deliberately does not return Core trace/match/token objects.

Arrays exposed by the public result are copied and frozen so consumers do not
receive mutable references to Core-owned arrays.

## Profile metadata

The translator exposes:

```ts
translator.profile
```

The profile ID/version/status are read from the bundled Core specification.

The SDK does not maintain a second hardcoded profile ID/version/status record.

The direction is exposed as:

```text
print-to-braille
```

which is the only direction supported by the Phase 7 public translator
contract.

## Failure projection

Expected Core translation failures are projected to:

```ts
PersianBrailleTranslationFailure
```

The SDK recognizes exactly the failure vocabulary frozen in Phase 7.2:

```text
PREPROCESSING_FAILED
UNKNOWN_CHARACTER
UNKNOWN_SEQUENCE
AMBIGUOUS_MATCH
UNSUPPORTED_ENGINE_STATE
```

If Core were to return an unsupported failure code, the SDK fails loudly
instead of silently converting it to a different public error code.

Optional failure diagnostics are projected only when supplied by Core:

```text
location
character
codePoint
candidateRuleIds
causeCode
```

## Throwing convenience API

`translateOrThrow()` uses the same `translate()` projection.

For an expected translation failure it throws:

```ts
PersianBrailleTranslationError
```

The error is SDK-owned and exposes:

```text
name
message
code
result
```

where `result` is the same public failure shape returned by `translate()`.

Unexpected programming/runtime faults are not swallowed and are not converted
to expected translation failures.

## Public root exports

`packages/sdk/src/index.ts` explicitly exports only the selected SDK contract.

The root is intentionally not:

```ts
export * from "@persian-braille/core";
```

This prevents accidental coupling of SDK semver to Core implementation growth.

## Immutability

The implementation freezes:

```text
profile metadata
success result
failure result
location object
public output arrays
SDK translation error object
```

This matches the readonly public type contract and prevents accidental
consumer mutation of SDK result objects.

## Artifacts

```text
packages/sdk/src/translator.ts
packages/sdk/src/index.ts
docs/sdk/phase-7.3-sdk-implementation.md
```

Phase 7.2 contract remains:

```text
packages/sdk/src/public-api.ts
```

## Explicitly outside Phase 7.3

This deliverable does not add:

```text
dedicated SDK tests
consumer contract fixtures
npm pack validation
publication metadata
publishing automation
CLI/Web/Microsoft 365 UI behavior
new translation semantics
normative promotions
```

## Handoff

The next deliverable is:

**Phase 7.4 — Consumer & Error-Surface Tests**

It will test the SDK through its built package root, verify public success and
failure stability, throwing/non-throwing behavior, immutability, profile
metadata, and representative workspace consumer compatibility.
