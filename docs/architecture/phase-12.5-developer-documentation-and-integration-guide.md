# Phase 12.5 — Developer Documentation and Integration Guide

## Status

Implementation candidate.

Phase 12.5 hardens the developer-facing documentation around the SDK contract
that was frozen in Phase 12.2 and exercised by the runnable examples and packed
consumer validation in Phases 12.3 and 12.4.

## Baseline

The Phase 12.5a audit found that the repository already documented:

- package installation;
- a minimal translation quickstart;
- success and failure result handling;
- the current SDK runtime and TypeScript export surface;
- four runnable examples;
- the third-party adapter pattern;
- the packed-package deep-import rejection evidence;
- deferred reverse-translation scope.

The audit identified three explicit documentation gaps:

1. public entrypoint and deep-import policy;
2. SDK README navigation to the runnable examples;
3. versioning and compatibility policy.

The audit also found no current overclaim for CommonJS, direct browser/CDN
imports, Deno, Bun, or reverse translation.

## Phase 12.5b hardening

`packages/sdk/README.md` is the primary developer entrypoint and now documents:

- the supported/validated runtime matrix;
- the public package-root import;
- the unsupported deep-import boundary;
- the `ERR_PACKAGE_PATH_NOT_EXPORTED` guarantee validated in Phase 12.4;
- direct links to all four runnable examples;
- the intended Application/Integration -> SDK -> Core dependency direction;
- the compatibility-protected runtime and TypeScript export surface;
- additive-versus-breaking API expectations;
- reverse translation as deferred to Phase 13.

The historical `docs/sdk/phase-7.*` files remain historical evidence and are not
rewritten by Phase 12.5.

## Developer integration pattern

Recommended integration flow:

```text
Host / Product / Service
          |
          v
Application adapter
          |
          v
@persian-braille/sdk
          |
          v
@persian-braille/core
```

The adapter owns host concerns. The SDK owns the public translation contract.
Core remains the specification-driven translation engine.

A third-party integration should therefore:

1. import only from `@persian-braille/sdk`;
2. branch on `result.ok` for the non-throwing API;
3. use top-level `result.code` and `result.message` on failures;
4. avoid deep imports and package-internal emitted paths;
5. avoid duplicating Braille translation semantics in the adapter;
6. avoid depending on Microsoft 365 unless the integration itself targets
   Microsoft Office.

## Runtime claims

Phase 12 claims are intentionally narrow:

| Consumer/runtime | Claim |
| --- | --- |
| Node.js ESM `>=24.19.0 <25` | Supported by package engine |
| Browser through a bundler | Validated first-party consumer |
| Microsoft 365 task-pane bundle | Validated first-party consumer |
| CommonJS | Not claimed |
| Deno | Not claimed |
| Bun | Not claimed |
| Direct browser/CDN package import | Not claimed |

## Public package boundary

Supported import:

```ts
import {
  createPersianBrailleTranslator,
} from "@persian-braille/sdk";
```

Unsupported private path:

```text
@persian-braille/sdk/dist/index.js
```

Phase 12.4 requires the unsupported subpath to fail with
`ERR_PACKAGE_PATH_NOT_EXPORTED`.

## Compatibility policy

Phase 12 protects the public SDK root and the frozen runtime/type exports from
renaming or removal.

Compatible additive APIs may be introduced only with validation and
documentation.

Reverse translation is not part of Phase 12 and remains assigned to Phase 13.

## Validation

Phase 12.5 validation checks that:

- the SDK README exposes the three missing documentation areas from the 12.5a
  audit;
- all four example links resolve locally;
- the runtime matrix does not overclaim unsupported environments;
- the frozen Phase 12 runtime/type exports are still documented and present;
- the SDK still exposes only the package-root export;
- the Phase 12.4 deep-import rule remains documented;
- Phase 12.3 and 12.4 validators remain chained as prerequisites.

## Next

After this documentation gate is clean:

```text
Phase 12.6 — Developer Ecosystem Regression and Closure
```
