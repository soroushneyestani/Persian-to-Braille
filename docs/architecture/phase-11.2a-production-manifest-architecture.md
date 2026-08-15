# Phase 11.2a — Production Manifest / Deployment Architecture

## Status

**IMPLEMENTED — VALIDATION REQUIRED BEFORE COMMIT**

## Objective

Phase 11.2a creates a production deployment boundary without modifying the
frozen Phase 10 local sideload manifest or Office host behavior.

The development path remains:

```text
integrations/microsoft365/manifest.xml
  -> https://localhost:3000
  -> local trusted development certificate
  -> Windows sideload / regression workflow
```

The Marketplace path becomes:

```text
OFFICE_ADDIN_PRODUCTION_BASE_URL
  -> production manifest materialization
  -> marketplace-dist/manifest.xml

addin-dist
  -> marketplace-dist/site
  -> external HTTPS hosting
```

## Why the development manifest remains unchanged

Phase 9 and Phase 10 live evidence was produced against the localhost
development manifest.

Phase 11 must not silently rewrite that historical development contract.

The Marketplace bundle therefore materializes a separate production manifest
from the validated source manifest at build time.

## Production base URL contract

`OFFICE_ADDIN_PRODUCTION_BASE_URL` must be:

- an absolute URL,
- HTTPS,
- non-loopback,
- free of embedded credentials,
- free of query strings,
- free of fragments.

A project path is supported.

Examples:

```text
https://example.com
https://example.com/persian-to-braille
```

Rejected examples:

```text
http://example.com
https://localhost:3000
https://127.0.0.1:3000
```

## Marketplace bundle

The production build creates:

```text
integrations/microsoft365/marketplace-dist/
  manifest.xml
  site/
    taskpane.html
    commands.html
    styles.css
    assets/
    app/
    vendor/
```

The development `manifest.xml` copied by the normal static build is explicitly
removed from the hosted `site/` payload.

The production manifest is kept separately as the submission artifact.

## Deferred from 11.2a

This subphase does not claim that production hosting exists yet.

Still deferred:

```text
11.2b  actual HTTPS hosting and remote endpoint validation
11.3   Support / Privacy / EULA / publisher identity
11.5   Web / Mac certification execution
```

The existing GitHub repository SupportUrl is intentionally not rewritten in
11.2a. Its replacement belongs to 11.3.

## Frozen invariants

11.2a must preserve:

- the Phase 10 development manifest,
- Word / Excel / PowerPoint host contracts,
- Microsoft365 -> SDK -> Core,
- the 69-test Phase 10 historical snapshot,
- Windows live-verification evidence,
- Web/Mac as not yet live verified.
