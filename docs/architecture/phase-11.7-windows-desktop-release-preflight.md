# Phase 11.7 — Windows Desktop Release Preflight Evidence

## Status

**CLOSED — FINAL WINDOWS DESKTOP RELEASE PREFLIGHT VERIFIED**

Phase 11.7 freezes the final Windows Desktop release-preflight evidence for the
release-candidate commit:

```text
242547ed0a4262a6b56b06d22546a010ed07fc30
```

This is an internal project release preflight. It is not Microsoft
certification and it does not claim Microsoft Marketplace publication.

## Preflight result

```text
Phase 11.7 result: PASS
Working tree before preflight: CLEAN
Working tree after preflight: CLEAN
Phase 11.6 aggregate validation: PASS
Release provenance: PASS
Package SHA-256 integrity: PASS
Production manifest: PASS
GitHub Actions current-HEAD run: PASS
Windows Desktop CI release artifact: PASS
```

## Release provenance

The rebuilt Windows Desktop package recorded:

- branch: `phase11-marketplace`;
- HEAD:
  `242547ed0a4262a6b56b06d22546a010ed07fc30`;
- clean build provenance: PASS;
- release scope: Microsoft 365 Desktop on Windows;
- architecture boundary: `Microsoft365 -> SDK -> Core`.

The generated package contained 10 declared payload files.

The package-manifest SHA-256 was:

```text
8ebc50cf24b921d0dc75c3063df233bbc380d7cf617a4e9e60d8e814ea735ffc
```

## Production manifest

The preflight verified:

- no `localhost`;
- no `127.0.0.1`;
- expected production GitHub Pages base URL;
- expected add-in ID.

## GitHub Actions evidence

The current-HEAD workflow run was:

```text
run number: 13
attempt: 1
status: completed
conclusion: success
run id: 31900419098
```

The Windows Desktop release artifact was:

```text
name: persian-to-braille-windows-desktop-release-1
artifact id: 9250927199
size: 320238 bytes
expired: false
```

## Runtime regression boundary

The preflight reran the Phase 11.6 aggregate validation and preserved:

- Microsoft365 regression suite: 69/69 PASS;
- Word Windows contract: PASS;
- Excel Windows contract: PASS;
- PowerPoint Windows contract: PASS;
- public trust-wording guard: PASS;
- Windows Desktop release package: PASS;
- production HTTPS / no-localhost guard: PASS;
- SHA-256 package integrity: PASS.

## Scope boundary

Phase 11 release scope remains:

```text
Microsoft 365 Desktop on Windows
```

Deferred work remains:

- Office on the Web -> Phase 16;
- Microsoft 365 for Mac -> Phase 17;
- Microsoft Marketplace / Partner Center official publication -> Phase 18.

The historical external publisher gate is preserved but is not a blocker for
the Windows Desktop Phase 11 closure.

## Next

**Phase 11.8 — Final Windows Desktop Closure**
