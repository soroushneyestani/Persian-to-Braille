# Phase 13.4 — Reverse Core Parser Foundation

## Status

**MATERIALIZED / VALIDATION REQUIRED**

Phase 13.4 is the first reverse runtime implementation step. It is limited to
`@persian-braille/core` and the independent Phase 13.3 seed vectors.

The SDK, CLI, Web, and Microsoft 365 integrations remain unchanged.

## Baseline

The Phase 13.4a audit established:

```text
Core package                  @persian-braille/core 2.0.0-dev
Core source files             10
Core tests                    4
Existing reverse Core runtime NONE
Reverse seed records          16
```

The forward pipeline remains intact.

## New Core-internal modules

```text
packages/core/src/reverse-translation.ts
packages/core/src/reverse-translator.ts
```

These modules are deliberately not exported from `packages/core/src/index.ts`
during Phase 13.4.

## Parser foundation

The implementation builds a reverse candidate index from the existing canonical
forward runtime bundle returned by `getBundledSpecification()`.

Reverse-only state handles:

- Unicode Braille tokenization;
- numeric indicator state;
- Persian / ASCII / Arabic-Indic digit rendering;
- numeric decimal context;
- Latin span begin/end state;
- Latin capital indicator state;
- longest-match sequence recognition;
- Persian punctuation canonicalization;
- strict ambiguity failure;
- ellipsis canonicalization;
- paired-parenthesis delimiter state;
- malformed mode failures.

The forward selector and mode executor are not mechanically inverted.

## Seed execution

All 14 translation vectors from Phase 13.3 are executable Core tests.

The two capability vectors remain specification assertions:

```text
exact-source-layout-round-trip = unsupported
exact-zwnj-recovery            = unsupported
```

## Boundary

Phase 13.4 changes no forward rule/vector records and adds no SDK, CLI, Web, or
Microsoft 365 reverse integration.

## Next

```text
Phase 13.5 — Reverse Core Coverage and Public Core Boundary
```
