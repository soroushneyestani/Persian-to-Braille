# Phase 7.4 — Consumer & Error-Surface Tests

## Status

**Phase 7.4: IMPLEMENTED**

This deliverable adds the first dedicated tests for
`@persian-braille/sdk`.

The tests exercise the built package through its package-name root:

```js
import("@persian-braille/sdk")
```

They do not import SDK implementation files directly.

## Consumer-facing test boundary

The SDK package already has an exports map:

```text
".":
  import -> ./dist/index.js
  types  -> ./dist/index.d.ts
```

Phase 7.4 tests the runtime surface that an ESM consumer receives through that
root export.

This verifies the public facade rather than internal file layout.

## Dedicated SDK test command

The SDK package now defines:

```text
pnpm --filter @persian-braille/sdk run test
```

The command:

```text
builds the Core dependency first
builds the SDK
runs packages/sdk/test/public-api.test.mjs
```

The explicit Core build is required because the SDK consumes Core through its
published package boundary (`dist/index.js` / `dist/index.d.ts`). After a clean
checkout or `pnpm run clean`, Core `dist` does not exist yet, so a standalone
filtered SDK test must materialize its workspace dependency before TypeScript
can resolve `@persian-braille/core`.

Because the repository root already uses recursive `--if-present` tests, the
new SDK test command is automatically included in:

```text
pnpm run test
```

No separate translation engine implementation is introduced.

## Frozen runtime export surface

The runtime package root is expected to export exactly:

```text
PersianBrailleTranslationError
createPersianBrailleTranslator
```

Type-only exports remain present in declarations but do not appear as runtime
JavaScript values.

The tests also assert that representative Core internals are not leaked:

```text
createForwardTranslator
getBundledSpecification
RuleSelector
```

## Success-surface coverage

The dedicated suite verifies:

```text
profile metadata
Persian word translation
numeric composition
ZWNJ structural semantics
normalized text
cells
Unicode Braille
structural tokens
```

It also verifies that Core execution details such as:

```text
trace
matches
engineTokens
```

are not present on the public SDK result.

## Failure-surface coverage

The suite verifies non-throwing failures for:

```text
UNKNOWN_CHARACTER
PREPROCESSING_FAILED
```

and preserves:

```text
code-point index
UTF-16 index
character
code point
preprocessing causeCode
```

while not exposing the internal Core `cause` object.

A valid translated prefix followed by an unsupported astral scalar is included
to ensure dual Unicode coordinates remain correct through the SDK projection.

## Throwing API coverage

`translateOrThrow()` is tested for both paths:

```text
success -> PersianBrailleTranslationSuccess
expected translation failure -> PersianBrailleTranslationError
```

The thrown error must be SDK-owned and expose:

```text
name
code
result
```

## Immutability coverage

The suite verifies that the public projection is immutable at runtime:

```text
profile
success result
success cells
success structuralTokens
failure result
failure location
SDK translation error
```

This protects consumers from mutating SDK-owned public result state.

## Determinism coverage

Repeated translation of the same input through one public translator instance
must produce deeply equal public results.

The SDK therefore preserves Core determinism at its consumer boundary.

## Workspace consumer compatibility

The current repository topology still declares the SDK dependency from:

```text
apps/cli
apps/web
integrations/microsoft365
```

and the Phase 7.1 audit found no direct Core imports outside SDK.

Phase 7.4 does not add UI behavior to those consumers.

Their build/typecheck compatibility is verified by the repository-level
workspace build/typecheck fixed point.

## Artifacts

```text
packages/sdk/test/public-api.test.mjs
packages/sdk/package.json
docs/sdk/phase-7.4-consumer-error-tests.md
```

## Explicitly outside Phase 7.4

This deliverable does not add:

```text
npm pack validation
publication metadata
package provenance
publishing automation
CLI behavior
Web behavior
Microsoft 365 behavior
new Braille mappings
new Core translation semantics
normative promotion
```

## Handoff

The next deliverable is:

**Phase 7.5 — Packaging & Release Readiness**

It will complete public package metadata, verify the exact npm package
contents, validate that the packed SDK is consumer-loadable, and add a
reproducible release-readiness gate without publishing automatically.
