# Braille Hub â€” Microsoft 365 for Mac Preview Installer

Status: **RELEASE CANDIDATE / AWAITING LIVE MAC INSTALLER VERIFICATION**

This directory contains the packaging source for a direct macOS `.pkg` preview
installer for the existing Braille Hub Microsoft 365 Office Add-in.

## Scope

The installer does **not** contain a native Braille translation application.

It installs the existing production Office Add-in manifest into the Microsoft
Office sideload directories for supported Mac hosts:

```text
Word
~/Library/Containers/com.microsoft.Word/Data/Documents/wef

Excel
~/Library/Containers/com.microsoft.Excel/Data/Documents/wef

PowerPoint
~/Library/Containers/com.microsoft.Powerpoint/Data/Documents/wef
```

The actual Braille Hub UI and translation runtime remain hosted through the
existing HTTPS Microsoft 365 web assets and the existing SDK/Core architecture.

## Source manifest

The package must use the generated production/public manifest:

```text
integrations/microsoft365/marketplace-dist/site/install/manifest.xml
```

It must never package the localhost development manifest directly.

The current public manual-preview builder already materializes the production
manifest before the Mac packaging step.

## Build on macOS

```bash
node integrations/microsoft365/build-manual-preview.mjs

bash integrations/microsoft365/release/macos/build-pkg.sh \
  18.0.0
```

Output:

```text
integrations/microsoft365/release/macos/dist/
```

## GitHub Actions

`.github/workflows/macos-preview-installer.yml` builds the package on a GitHub
macOS runner.

Manual `workflow_dispatch` runs publish the output as a workflow artifact.

Tags matching:

```text
mac-preview-v*
```

also create a GitHub prerelease containing the `.pkg`, production manifest,
uninstaller, README, and SHA-256 checksums.

## Current trust status

The first release candidate is intentionally allowed to be **unsigned** because
there is not yet a frozen Apple Developer signing/notarization credential in the
repository workflow.

Unsigned status must be disclosed to testers.

A future hardening step may add:

```text
Developer ID Installer signing
Apple notarization
stapling
```

without changing the Office/Braille runtime architecture.

## Closure gate

Do not close Phase 18 solely because GitHub successfully builds the `.pkg`.

Phase 18 live closure requires at least one real Mac installation result from a
tester confirming either:

```text
MAC_INSTALLER_LIVE_TEST=PASS
```

or a reproducible failure report that can be repaired and retested.