#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

VERSION="${1:-18.0.0}"
SOURCE_MANIFEST="${2:-$REPO_ROOT/integrations/microsoft365/marketplace-dist/site/install/manifest.xml}"
OUT_DIR="${3:-$SCRIPT_DIR/dist}"

PKG_IDENTIFIER="com.soroushneyestani.braillehub.office365.preview"
PKG_NAME="Braille-Hub-Mac-Preview-Installer.pkg"

if [[ ! -f "$SOURCE_MANIFEST" ]]; then
  printf '%s\n' "ERROR: production manifest not found: $SOURCE_MANIFEST" >&2
  printf '%s\n' "Run the public manual-preview build first." >&2
  exit 1
fi

if grep -Fq "https://localhost" "$SOURCE_MANIFEST"; then
  printf '%s\n' "ERROR: refusing to package a localhost development manifest." >&2
  exit 1
fi

if ! grep -Fq "https://soroushneyestani.github.io/Persian-to-Braille" "$SOURCE_MANIFEST"; then
  printf '%s\n' "ERROR: expected production GitHub Pages origin not found in manifest." >&2
  exit 1
fi

if ! grep -Fq "<Id>33ec7928-1204-5bb3-88e6-d778413e9234</Id>" "$SOURCE_MANIFEST"; then
  printf '%s\n' "ERROR: Braille Hub add-in identity not found in manifest." >&2
  exit 1
fi

WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

PKG_ROOT="$WORK_DIR/root"
PKG_SCRIPTS="$WORK_DIR/scripts"

mkdir -p \
  "$PKG_ROOT/Library/Application Support/Braille Hub" \
  "$PKG_SCRIPTS" \
  "$OUT_DIR"

cp \
  "$SOURCE_MANIFEST" \
  "$PKG_ROOT/Library/Application Support/Braille Hub/manifest.xml"

cp \
  "$SCRIPT_DIR/scripts/postinstall" \
  "$PKG_SCRIPTS/postinstall"

chmod 0755 "$PKG_SCRIPTS/postinstall"

pkgbuild \
  --root "$PKG_ROOT" \
  --scripts "$PKG_SCRIPTS" \
  --identifier "$PKG_IDENTIFIER" \
  --version "$VERSION" \
  --install-location "/" \
  "$OUT_DIR/$PKG_NAME"

cp "$SOURCE_MANIFEST" "$OUT_DIR/Braille-Hub-manifest.xml"
cp "$SCRIPT_DIR/Braille-Hub-Mac-Uninstall.command" "$OUT_DIR/Braille-Hub-Mac-Uninstall.command"
chmod 0755 "$OUT_DIR/Braille-Hub-Mac-Uninstall.command"

cat > "$OUT_DIR/README-Mac.txt" <<'EOF'
Braille Hub Ã¢â‚¬â€ Microsoft 365 for Mac Preview Installer
=====================================================

STATUS
------
Preview / release candidate.
This package is intended for sideload testing before Microsoft Marketplace publication.

INSTALL
-------
1. Close Microsoft Word, Excel, and PowerPoint.
2. Open Braille-Hub-Mac-Preview-Installer.pkg.
3. Complete the macOS Installer steps.
4. Reopen Word, Excel, or PowerPoint.
5. Open Home > Add-ins and select Braille Hub.

The installer copies the same production Braille Hub manifest into the official
Microsoft Office sideload "wef" directory for each installed host:

Word:
~/Library/Containers/com.microsoft.Word/Data/Documents/wef

Excel:
~/Library/Containers/com.microsoft.Excel/Data/Documents/wef

PowerPoint:
~/Library/Containers/com.microsoft.Powerpoint/Data/Documents/wef

APPLE SILICON / INTEL
---------------------
The package contains only an XML Office add-in manifest and installer shell logic.
There is no native executable payload, so a separate Intel/Apple Silicon package is
not required.

UNSIGNED PREVIEW NOTE
---------------------
Unless the package has later been signed/notarized with an Apple Developer ID
Installer certificate, macOS may warn that it cannot verify the developer.

Do not disable macOS security features.
Use the normal macOS Privacy & Security "Open Anyway" flow only if you trust this
GitHub release and intentionally want to test the preview package.

UNINSTALL
---------
Run Braille-Hub-Mac-Uninstall.command from Terminal:

bash Braille-Hub-Mac-Uninstall.command

Then restart Office.

If Braille Hub still appears after removing the manifest, Office may be showing
cached sideload data. Follow Microsoft's Office Add-in cache-clearing guidance
rather than deleting unrelated add-in manifests.

SUPPORT
-------
https://soroushneyestani.github.io/Persian-to-Braille/support.html
EOF

(
  cd "$OUT_DIR"
  shasum -a 256 \
    "$PKG_NAME" \
    "Braille-Hub-manifest.xml" \
    "Braille-Hub-Mac-Uninstall.command" \
    "README-Mac.txt" \
    > "SHA256SUMS.txt"
)

printf '%s\n' "Braille Hub macOS preview package: PASS"
printf '%s\n' "Package: $OUT_DIR/$PKG_NAME"
printf '%s\n' "Manifest: $OUT_DIR/Braille-Hub-manifest.xml"
printf '%s\n' "Checksums: $OUT_DIR/SHA256SUMS.txt"