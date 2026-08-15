# Phase 11.4c — Live Manual Preview HTTPS Evidence

## Status

**LIVE VERIFIED / PASS**

Phase 11.4c public manual preview distribution was deployed from commit
`fc446963f7e8c8d4cb032a6eeff9fc9eb6fe85f1` on branch
`phase11-marketplace` and verified against the live GitHub Pages deployment.

## GitHub Pages deployment

```text
Workflow: Microsoft 365 Marketplace Pages
Run:      #5
Attempt:  1
Result:   success
Commit:   fc446963f7e8c8d4cb032a6eeff9fc9eb6fe85f1
```

Run URL:

```text
https://github.com/soroushneyestani/Persian-to-Braille/actions/runs/31892620659
```

## Live public endpoints

```text
Install page
https://soroushneyestani.github.io/Persian-to-Braille/install.html

Hosted production manifest
https://soroushneyestani.github.io/Persian-to-Braille/install/manifest.xml
```

Both endpoints returned HTTP 200 during the live probe.

## Frozen SHA-256 evidence

```text
install.html
a6fba93e1fe49138503a27c370f93ee65674d8efe47bd463fab796025f82d31d

install/manifest.xml
a3d05cadd9a668186b474e1222123717abc41893b247a5790498e87e0136ee73

compliance.css
266e0a66af351c382eebb75fff9b02a904f0b374340a5f3dd14a5e8ec0c02b05
```

The live installation page matched the committed source.

The live hosted manifest matched the locally generated production Marketplace
manifest exactly.

## Hosted manifest checks

The live manifest passed all of the following checks:

- no `localhost` references;
- production GitHub Pages base URL present;
- production SupportUrl present;
- 64 x 64 high-resolution icon URL present;
- Word host present;
- Excel host present;
- PowerPoint host present.

## Distribution classification

This public channel remains:

```text
MANUAL SIDELOAD PREVIEW
NOT MICROSOFT MARKETPLACE PUBLICATION
```

Partner Center publisher enrollment remains:

```text
EXTERNAL BLOCKED / NOT SATISFIED
```

The public manual distribution channel does not bypass or alter that external
publisher gate.

## Platform verification boundary

This live probe verifies public HTTPS hosting and manifest integrity. It does
not change the frozen Office runtime verification matrix:

```text
Word / Windows:       LIVE VERIFIED / PASS
Excel / Windows:      LIVE VERIFIED / PASS
PowerPoint / Windows: LIVE VERIFIED / PASS

Web / Mac:            EXPECTED / NOT EXECUTED
```

## Public-use decision

The following URL is now a verified public manual-preview entry point:

```text
https://soroushneyestani.github.io/Persian-to-Braille/install.html
```

It may be shared as a manual/sideload preview installation page, provided it is
not represented as Microsoft Marketplace publication or certification.

## Next

```text
11.4d  Marketplace Screenshots / Listing Assets
```
