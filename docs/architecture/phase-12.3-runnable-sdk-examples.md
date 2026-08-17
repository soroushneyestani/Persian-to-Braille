# Phase 12.3 — Runnable SDK Examples and Quickstarts

## Status

Implementation candidate.

Phase 12.3 adds four developer-facing examples defined by the Phase 12.2
contract:

```text
examples/
├── node-basic/
├── browser-basic/
├── error-handling/
└── integration-adapter/
```

All examples use the public `@persian-braille/sdk` package entrypoint.

They do not import `@persian-braille/core` and do not use SDK deep imports.

## Node.js

`node-basic` demonstrates the smallest supported Node.js ESM flow:

```text
createPersianBrailleTranslator()
        |
        v
translator.translate(text)
        |
        v
PersianBrailleTranslationResult
```

Successful results expose the SDK's Unicode Braille output.

## Browser / bundler

`browser-basic` is deliberately a bundler-oriented source example. Phase 12
does not claim direct browser CDN package resolution.

The existing first-party web application remains the validated browser
integration evidence.

## Structured failure handling

`error-handling` demonstrates branching on `result.ok` and projecting the
public top-level `code` and `message` failure fields without inventing
translation semantics in the consumer.

## Third-party adapter

`integration-adapter` demonstrates how another product can wrap the SDK while
remaining independent of Microsoft Office and independent of Core internals.

## Regression

The examples regression executes all four example surfaces and verifies the
current U+0622 release-correction behavior through the public SDK.

Phase 12.4 remains responsible for validating a packed SDK artifact from an
isolated external consumer.
