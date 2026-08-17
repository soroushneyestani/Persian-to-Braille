# Phase 12.4 — Packed Package Consumer Validation

## Status

Implementation candidate.

Phase 12.4 does not duplicate the package-validation infrastructure created in
Phase 7.5.

The Phase 12.4a baseline audit established that the existing Phase 7.5 package
validator already satisfies **4 of 5** Phase 12.4 guarantees:

1. build and pack the SDK;
2. install packed artifacts into an isolated consumer;
3. compile a TypeScript consumer against emitted declarations;
4. execute translation through the public package entrypoint.

The only missing Phase 12 guarantee was an explicit **deep import** boundary
check.

## Phase 12.4b hardening

Phase 12.4b adds the missing negative boundary guarantee without changing Core,
SDK translation behavior, Microsoft 365 integration behavior, or the Phase 7.5
packing implementation.

The SDK package export map is expected to expose only:

```text
@persian-braille/sdk
```

The following workspace-style/private-path access is unsupported:

```text
@persian-braille/sdk/dist/index.js
```

A consumer-side runtime probe must reject that subpath with:

```text
ERR_PACKAGE_PATH_NOT_EXPORTED
```

The same validation also confirms that the documented package root remains
usable and preserves the current U+0622 release-correction result through the
public SDK.

## Aggregate validation

```text
pnpm run validate:sdk-package
        +
Phase 12 deep-import/package-boundary validation
        =
Phase 12.4 packed consumer contract
```

`validate:sdk-package` remains the source of truth for the packed SDK artifact,
isolated packed consumer installation, TypeScript declaration consumption, and
runtime smoke.

The Phase 12.4 validator adds only the missing public-entrypoint/deep-import
boundary guarantee.

## Scope

No reverse translation is added.

No Core rule is changed.

No SDK public API is renamed or removed.

No Microsoft 365 source is changed.

No new browser, Mac, or Marketplace claim is introduced.

## Next

After Phase 12.4 validation is clean:

```text
Phase 12.5 — Developer Documentation and Integration Guide
```
