# Phase 11.6 — Windows Desktop Release Package + Test Notes

## Status

**CLOSED — WINDOWS DESKTOP RELEASE PACKAGE VALIDATED**

Phase 11.6 defines and validates the deliverable Windows Desktop release
candidate package for Persian-to-Braille.

This is an internal Windows Desktop release candidate. It is not Microsoft
certification and it is not Microsoft Marketplace publication.

## Release scope

```text
Microsoft 365 Desktop on Windows
```

Required hosts: Word, Excel, PowerPoint.

Deferred:
- Office on the Web -> Phase 16
- Microsoft 365 for Mac -> Phase 17
- Microsoft Marketplace / Partner Center -> Phase 18

## Generated package

```text
marketplace-dist/windows-desktop-release/
├── Persian-to-Braille-Windows-Preview-Installer.cmd
├── windows-preview-setup.ps1
├── manifest.xml
├── README.md
├── RELEASE-NOTES.md
├── TEST-NOTES.md
├── provenance.json
├── package-manifest.json
├── checksums.sha256
└── screenshots/
    ├── word-selection.png
    ├── excel-text-cell.png
    └── powerpoint-text-range.png
```

`marketplace-dist` remains generated build output and is not committed.

## Package integrity

`package-manifest.json` records every release payload file with relative path,
byte size, and SHA-256 digest.

`checksums.sha256` provides the checksum list for the payload plus the package
manifest.

`provenance.json` records current Git branch, Git HEAD, working-tree cleanliness
at build time, architecture boundary, release scope, public installation URL,
and deferred phases.

A clean committed provenance build is required by Phase 11.7 preflight.

## Production manifest

The package uses the generated production manifest, not the development
localhost manifest.

The build rejects localhost and 127.0.0.1 and requires the production GitHub
Pages origin plus the expected Persian-to-Braille add-in ID.

## User-facing documentation

The package includes English/Persian installation guidance, release notes, and
Windows test notes. A recipient can install and test the Windows package
without knowing the repository structure.

## CI artifact

The GitHub Pages workflow builds the package and uploads
`windows-desktop-release` as a separate GitHub Actions artifact.

The public Pages installation flow remains unchanged.

## Architecture boundary

```text
Microsoft 365 Desktop
  -> Microsoft365 integration
  -> public SDK
  -> standalone Core
```

## Next

**Phase 11.7 — Windows Desktop Release Preflight**

Phase 11.7 rebuilds the package from a clean committed HEAD, verifies
provenance/checksums, reruns the complete Windows release gate, and freezes the
final preflight evidence before Phase 11.8 closure.
