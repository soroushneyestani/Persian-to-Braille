# Phase 18 â€” Microsoft 365 for Mac Preview Installer RC

Status: **IMPLEMENTED AS RELEASE CANDIDATE / LIVE MAC INSTALLER TEST PENDING**

## Objective

Phase 18 adds a direct macOS installation package for the existing Braille Hub
Microsoft 365 Add-in.

The Mac package does not create a second Braille implementation.

It delivers the same production Office Add-in manifest already used by the
public HTTPS preview distribution.

## Packaging model

```text
GitHub Actions macOS runner
        â†“
public/manual preview build
        â†“
production manifest
        â†“
pkgbuild
        â†“
Braille-Hub-Mac-Preview-Installer.pkg
        â†“
macOS Installer
        â†“
current user's Office wef directories
        â”œâ”€â”€ Word
        â”œâ”€â”€ Excel
        â””â”€â”€ PowerPoint
```

## Runtime invariants

The installer changes only deployment convenience.

Braille semantics remain behind:

```text
Microsoft 365
    â†“
public SDK
    â†“
Core / German / Music
```

No Persian, English, German, MIDI, MusicXML, or Braille Music rule is duplicated
inside the Mac installer.

## Official sideload targets used

```text
~/Library/Containers/com.microsoft.Word/Data/Documents/wef

~/Library/Containers/com.microsoft.Excel/Data/Documents/wef

~/Library/Containers/com.microsoft.Powerpoint/Data/Documents/wef
```

The installer installs only into detected Office host containers and replaces
only previous XML manifests containing the exact Braille Hub Office Add-in ID.

## Distribution classification

```text
MANUAL SIDELOAD PREVIEW
GITHUB PRERELEASE
NOT MICROSOFT MARKETPLACE PUBLICATION
```

## Apple trust state

Initial Phase 18 RC:

```text
PKG_BUILD=SUPPORTED
DEVELOPER_ID_INSTALLER_SIGNING=NOT_CONFIGURED
APPLE_NOTARIZATION=NOT_CONFIGURED
```

This is acceptable for a bounded tester release provided the unsigned status is
disclosed.

Signing and notarization are release hardening, not Braille runtime work.

## Verification state

Static/build verification can be completed without owning a Mac because the
GitHub workflow builds with a hosted macOS runner.

However, actual installation and Office discovery must remain honest:

```text
MAC_INSTALLER_LIVE_TEST=PENDING
PHASE18_STATUS=RC_NOT_CLOSED
```

A tester may validate the package later.

If no defect is reported after successful real installation, record explicit
live evidence before closing Phase 18.