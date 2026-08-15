# Phase 11.3c — Production SupportUrl Integration

## Status

**IMPLEMENTED — VALIDATION REQUIRED BEFORE COMMIT**

## Objective

Phase 11.3c promotes the public Support page from a hosted asset to the
`SupportUrl` used by the generated Marketplace submission manifest.

The frozen development manifest remains unchanged:

```text
SupportUrl:
https://github.com/soroushneyestani/Persian-to-Braille

Task pane:
https://localhost:3000/taskpane.html
```

The generated Marketplace submission manifest uses:

```text
https://soroushneyestani.github.io/Persian-to-Braille/support.html
```

## Historical Phase 11.2a preservation

`createProductionManifest(...)` remains the Phase 11.2a production-base
materializer and continues to preserve the historical 11.2a behavior.

Phase 11.3c introduces a later, explicit layer:

```text
createMarketplaceSubmissionManifest(...)
```

This prevents the 11.3 change from rewriting the frozen meaning of the
Phase 11.2a contract.

## Compliance URLs

The production base deterministically yields:

```text
Support:
https://soroushneyestani.github.io/Persian-to-Braille/support.html

Privacy:
https://soroushneyestani.github.io/Persian-to-Braille/privacy.html

EULA:
https://soroushneyestani.github.io/Persian-to-Braille/eula.html
```

Only SupportUrl belongs in the add-in-only XML manifest. Privacy and EULA URLs
are retained as validated Marketplace/Partner Center metadata inputs for later
submission work.

## Build path

The Marketplace bundle now uses the later submission materializer:

```text
development manifest
  -> createProductionManifest(...)
  -> createMarketplaceSubmissionManifest(...)
  -> marketplace-dist/manifest.xml
```

The normal development/sideload manifest is not rewritten on disk.

## Next

```text
Phase 11.3d — Live HTTPS compliance-page verification
```
