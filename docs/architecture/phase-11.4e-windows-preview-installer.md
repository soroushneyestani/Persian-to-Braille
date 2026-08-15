# Phase 11.4e — Windows Desktop Preview Installer + Persian Guide

## Status

**CLOSED — WINDOWS DESKTOP PREVIEW INSTALLER AND PERSIAN GUIDE VALIDATED**

Phase 11.4e adds a simple public Windows Desktop Preview installer to the
existing manual-preview distribution.

The deployment classification remains:

```text
MANUAL SIDELOAD PREVIEW / NOT MARKETPLACE PUBLICATION
```

The installer is a convenience around Microsoft's Windows network-share
sideload/testing mechanism. It is not Microsoft Marketplace publication.
It is not represented as a Microsoft Marketplace installer and does not change
the external publisher gate.

## Public Windows preview files

```text
install/windows/Persian-to-Braille-Windows-Preview-Installer.cmd
install/windows/windows-preview-setup.ps1
```

The CMD file is the user-facing download. It downloads the project-controlled
PowerShell setup helper over HTTPS and executes it with Windows PowerShell.

Both Windows script files remain ASCII-only to avoid Windows PowerShell 5.1
source-encoding/parser problems.

## Setup behavior

The setup helper:

1. verifies Windows;
2. requests UAC elevation only because local SMB-share creation requires it;
3. never force-closes Word, Excel, or PowerPoint;
4. downloads the stable production manifest over HTTPS;
5. rejects localhost or an unexpected add-in identity;
6. creates a dedicated local catalog under the current user's LocalAppData;
7. creates or repairs the dedicated `PersianToBrailleAddin` SMB share;
8. registers only the dedicated Office trusted-catalog record under HKCU;
9. uses `Flags = 1` so the catalog is shown in the Office add-in menu;
10. verifies the registered URL and flags;
11. opens Word when possible;
12. leaves the final Office add-in selection as an explicit user action.

No unrelated Office trusted catalog is removed or modified.

## Final Office UI step

After setup, the user completes the supported Office UI flow:

```text
Home
→ Add-ins
→ Get Add-ins / Advanced
→ SHARED FOLDER
→ Persian-to-Braille
→ Add
```

The wording includes both `Get Add-ins` and `Advanced` because Microsoft 365
desktop UI labels can differ between builds.

## Persian installation guide

`install.html` now includes a complete Persian right-to-left guide covering:

- downloading and running the installer;
- the UAC prompt;
- safely closing Office when requested;
- opening Add-ins;
- selecting Get Add-ins / Advanced;
- opening SHARED FOLDER;
- selecting Persian-to-Braille;
- choosing Add;
- using Translate Selection.

The page also publishes the three Windows Desktop screenshots frozen in Phase
11.4d.

## Build boundary

`build-manual-preview.mjs` now materializes into the Pages site:

```text
install/manifest.xml
install/windows/Persian-to-Braille-Windows-Preview-Installer.cmd
install/windows/windows-preview-setup.ps1
install/screenshots/word-selection.png
install/screenshots/excel-text-cell.png
install/screenshots/powerpoint-text-range.png
```

The hosted manifest remains an exact copy of the generated production
Marketplace manifest.

## Certification boundary

This work establishes a convenient Windows network-share sideload/testing
preview only.

It does not claim:

- Microsoft Marketplace publication;
- Partner Center publisher enrollment;
- Web live verification;
- Mac live verification;
- iOS/iPad certification.

The Phase 11.3e publisher gate remains externally blocked and unchanged.

## Phase 11.4 closure

**Phase 11.4 internal listing preparation: COMPLETE**

Completed internal artifacts now include:

- listing metadata contract;
- manifest icon remediation;
- public manual preview distribution;
- Word / Excel / PowerPoint Marketplace screenshots;
- Windows Desktop Preview Installer;
- Persian and English desktop installation guidance.

Partner Center-only category selection remains an external submission-time
item and is not invented locally.

## Next

**Phase 11.5 Cross-platform Certification Matrix / Web + Mac + iOS decision**
