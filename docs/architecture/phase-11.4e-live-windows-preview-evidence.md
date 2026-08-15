# Phase 11.4e — Live Windows Desktop Preview Installer Evidence

## Status

**CLOSED — LIVE WINDOWS DESKTOP INSTALLER VERIFIED**

Phase 11.4e is closed after both remote HTTPS verification and real Windows
Desktop execution of the public preview installer.

## Deployment evidence

The GitHub Pages deployment for commit:

```text
8c42ea364f0c7c7bf7b44fec7eb3d9f8e9218ecf
```

completed successfully as workflow run #9 / attempt 1.

The live probe verified exact source matches for:

```text
install.html
install/windows/Persian-to-Braille-Windows-Preview-Installer.cmd
install/windows/windows-preview-setup.ps1
install/screenshots/word-selection.png
install/screenshots/excel-text-cell.png
install/screenshots/powerpoint-text-range.png
install/manifest.xml
```

The hosted manifest was verified as production HTTPS, with no localhost
references and with the expected Persian-to-Braille add-in identity.

## Real Windows execution

After the live probe passed, the public CMD installer was downloaded from the
GitHub Pages installation page and executed on a real Windows Microsoft 365
Desktop environment.

Manual execution result:

```text
Windows Desktop Preview Installer: PASS
Trusted local catalog setup: PASS
Office add-in discovery: PASS
Persian-to-Braille add-in insertion: PASS
Translate Selection: PASS
Braille preview/runtime flow: PASS
```

The user confirmed that the full installation and translation flow worked
correctly.

## Product boundary

This evidence proves the public Windows Desktop preview flow only.

It does not claim Web or Mac execution and it does not claim Microsoft
Marketplace publication.

The external publisher gate is preserved historically but is deferred to the
dedicated official-publication phase.
