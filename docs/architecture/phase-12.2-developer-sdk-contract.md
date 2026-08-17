# Phase 12.2 — Developer SDK Contract and Examples Architecture Freeze

## Status

**FROZEN**

Phase 12 starts from an already functional public-shaped Core and SDK. The
baseline correction established that the CLI already exists under `apps/cli`
and that Microsoft 365 source code preserves the intended dependency boundary:

```text
Consumer / Integration
        ↓
@persian-braille/sdk
        ↓
@persian-braille/core
```

Generated build output is not treated as source architecture.

## Developer-facing dependency rule

Application and integration developers SHOULD consume:

```text
@persian-braille/sdk
```

They MUST NOT depend on SDK deep-import paths.

Microsoft 365 source MUST NOT import `@persian-braille/core` directly.

The Core remains independently usable, but the supported application-level
integration boundary is the public SDK.

## Frozen Phase 12 SDK surface

Runtime exports protected during Phase 12:

- `PersianBrailleTranslationError`
- `createPersianBrailleTranslator`

Type exports protected during Phase 12:

- `CreatePersianBrailleTranslator`
- `PersianBrailleProfileInfo`
- `PersianBrailleTranslationErrorData`
- `PersianBrailleTranslationFailure`
- `PersianBrailleTranslationFailureCode`
- `PersianBrailleTranslationResult`
- `PersianBrailleTranslationSuccess`
- `PersianBrailleTranslator`
- `PersianBrailleUnicodeLocation`

Phase 12 may add compatible forward-translation developer APIs when justified
and validated, but it must not rename or remove the existing public contract.

Reverse translation is explicitly outside this phase.

## Consumer/runtime claims

Current claims are intentionally narrow:

- Node.js `>=24.19.0 <25`, ESM: supported by package engine contract.
- Browser/bundler consumption: validated by the existing first-party web app.
- Office task-pane bundled consumption: validated by the Microsoft 365 integration.

Phase 12 does **not** claim CommonJS, Deno, Bun, direct browser-CDN imports, or
other runtimes unless a later Phase 12 subphase explicitly validates them.

## Error contract

Developer documentation and examples must use the existing structured public
error/failure model:

- `PersianBrailleTranslationError`
- `PersianBrailleTranslationFailure`
- `PersianBrailleTranslationFailureCode`
- `PersianBrailleTranslationErrorData`

At least one runnable example must demonstrate failure handling.

## Required examples architecture

Phase 12.3 will implement:

```text
examples/
├── node-basic/
├── browser-basic/
├── error-handling/
└── integration-adapter/
```

Rules:

1. Examples import `@persian-braille/sdk` only.
2. Examples do not import `@persian-braille/core`.
3. Examples use only the documented public SDK entrypoint.
4. Examples are runnable and covered by validation.
5. Error handling is demonstrated explicitly.
6. The integration-adapter example shows how a third party can wrap the SDK
   without depending on Microsoft Office.

## Packed consumer validation

Phase 12.4 will validate the package as an external consumer would receive it:

1. build SDK;
2. create a packed package artifact;
3. install it into an isolated fixture;
4. compile a TypeScript consumer against emitted declarations;
5. run an actual translation through the package entrypoint;
6. verify that workspace-only/deep imports are not required.

## Planned remainder of Phase 12

```text
12.3  Runnable SDK Examples and Quickstarts
12.4  Packed Package Consumer Validation
12.5  Developer Documentation and Integration Guide
12.6  Developer Ecosystem Regression and Closure
```

## Scope guard

Not part of Phase 12:

- reverse translation → Phase 13;
- Braille Music → Phase 14;
- general multi-language framework → Phase 15;
- Office on the Web → Phase 16;
- Office for Mac → Phase 17;
- Microsoft Marketplace / Partner Center publication → Phase 18.

Phase 12 is strictly the **Developer Ecosystem** phase.
