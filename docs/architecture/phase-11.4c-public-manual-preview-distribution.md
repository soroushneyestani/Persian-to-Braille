# Phase 11.4c — Public Manual Preview Distribution

## Status

**IMPLEMENTED / VALIDATION REQUIRED**

Phase 11.4c adds a public, source-controlled manual preview distribution
channel for the Microsoft 365 add-in while Microsoft Marketplace publisher
enrollment remains externally blocked.

## Classification

This channel is explicitly:

```text
MANUAL SIDELOAD PREVIEW
NOT MICROSOFT MARKETPLACE PUBLICATION
```

It is not a workaround that claims Marketplace certification or publication.

## Public endpoints

After the GitHub Pages workflow deploys this phase, the intended stable
endpoints are:

```text
https://soroushneyestani.github.io/Persian-to-Braille/install.html
https://soroushneyestani.github.io/Persian-to-Braille/install/manifest.xml
```

The hosted manifest is not maintained as a second hand-edited manifest. The
manual-preview build copies the exact generated production Marketplace
manifest into the Pages site after the normal Marketplace build completes.

That preserves a single production-manifest materialization path.

## Supported distribution paths

### Individual Office on the web preview

Microsoft documents manual sideloading for add-in-only manifests:

```text
Home
-> Add-ins
-> More Settings
-> Upload My Add-in
-> choose manifest XML
-> Upload
```

This is documented by Microsoft as a development/testing sideload mechanism.
The public page therefore describes it as a preview rather than ordinary Store
installation.

Microsoft also documents that a web-sideloaded manifest is stored in browser
local storage and can need to be re-sideloaded after browser storage is
cleared or a different browser is used.

### Organization / Microsoft 365 admin deployment

Microsoft documents centralized deployment of custom add-ins through the
Microsoft 365 admin center. For an add-in-only manifest, an administrator can
upload the manifest file or, where offered by the deployment UI, provide a URL
for the manifest.

This is the strongest non-Marketplace distribution path for organizations.

### Mac preview

Microsoft documents manual manifest sideloading on Mac for testing by placing
the XML manifest in the host application's `wef` directory and restarting the
Office host.

The public page does not claim Mac live verification. Mac remains a later
release gate.

### Windows network share

The public page deliberately does not recommend a network-share catalog as a
general distribution mechanism. Microsoft states that network-share
deployment is for testing and is not supported for production add-ins.

## Verification claims preserved

```text
Word / Windows:       LIVE VERIFIED / PASS
Excel / Windows:      LIVE VERIFIED / PASS
PowerPoint / Windows: LIVE VERIFIED / PASS

Web / Mac:            EXPECTED / NOT EXECUTED
```

Publishing the manual preview page does not upgrade Web or Mac verification
status.

## Build architecture

```text
pnpm run build:marketplace
  -> marketplace-dist/manifest.xml
  -> marketplace-dist/site/*

pnpm run build:manual-preview
  -> verify production manifest has no localhost
  -> copy exact marketplace-dist/manifest.xml
     to marketplace-dist/site/install/manifest.xml

pnpm run build:marketplace-preview
  -> build:marketplace
  -> build:manual-preview
```

The GitHub Pages workflow uses `build:marketplace-preview`, so the stable
manifest and installation page are deployed together with the same production
site.

## External publisher gate

Phase 11.3e remains:

```text
EXTERNAL BLOCKED / NOT SATISFIED
```

No legal-business identity or Partner Center state is fabricated or bypassed.

## Next

After live deployment and remote verification of the two new HTTPS endpoints:

```text
11.4c-live  Manual Preview HTTPS verification
11.4d       Marketplace Screenshots / Listing Assets
```
