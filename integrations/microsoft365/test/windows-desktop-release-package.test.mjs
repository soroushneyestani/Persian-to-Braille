import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const here = path.dirname(fileURLToPath(import.meta.url));
const microsoft365Root = path.resolve(here, "..");
const repoRoot = path.resolve(microsoft365Root, "../..");

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function resolveReleaseDir() {
  const candidates = [
    path.join(
      repoRoot,
      "marketplace-dist",
      "windows-desktop-release",
    ),
    path.join(
      microsoft365Root,
      "marketplace-dist",
      "windows-desktop-release",
    ),
  ];
  for (const candidate of candidates) {
    if (await exists(path.join(candidate, "package-manifest.json"))) {
      return candidate;
    }
  }
  throw new Error("Unable to locate Windows Desktop release package.");
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

test("Windows release package contains the required delivery files", async () => {
  const releaseDir = await resolveReleaseDir();
  for (const relativePath of [
    "Braille-Hub-Windows-Preview-Installer.cmd",
    "windows-preview-setup.ps1",
    "manifest.xml",
    "README.md",
    "RELEASE-NOTES.md",
    "TEST-NOTES.md",
    "provenance.json",
    "package-manifest.json",
    "checksums.sha256",
    "screenshots/word-selection.png",
    "screenshots/excel-text-cell.png",
    "screenshots/powerpoint-text-range.png",
  ]) {
    assert.equal(
      await exists(path.join(releaseDir, relativePath)),
      true,
      `missing ${relativePath}`,
    );
  }
});

test("Windows release package production manifest is safe", async () => {
  const releaseDir = await resolveReleaseDir();
  const manifest = await readFile(
    path.join(releaseDir, "manifest.xml"),
    "utf8",
  );
  assert.doesNotMatch(manifest, /localhost|127\.0\.0\.1/i);
  assert.match(
    manifest,
    /https:\/\/soroushneyestani\.github\.io\/Persian-to-Braille\//,
  );
  assert.match(
    manifest,
    /33ec7928-1204-5bb3-88e6-d778413e9234/,
  );
});

test("release package manifest hashes every declared payload exactly", async () => {
  const releaseDir = await resolveReleaseDir();
  const manifest = JSON.parse(
    await readFile(
      path.join(releaseDir, "package-manifest.json"),
      "utf8",
    ),
  );
  assert.equal(manifest.phase, "11.6");
  assert.equal(
    manifest.releaseScope,
    "Microsoft 365 Desktop on Windows",
  );
  for (const file of manifest.files) {
    const buffer = await readFile(path.join(releaseDir, file.path));
    assert.equal(buffer.length, file.bytes, file.path);
    assert.equal(sha256(buffer), file.sha256, file.path);
  }
});

test("checksums file covers the package manifest and payload", async () => {
  const releaseDir = await resolveReleaseDir();
  const checksumText = await readFile(
    path.join(releaseDir, "checksums.sha256"),
    "utf8",
  );
  for (const relativePath of [
    "Braille-Hub-Windows-Preview-Installer.cmd",
    "windows-preview-setup.ps1",
    "manifest.xml",
    "README.md",
    "RELEASE-NOTES.md",
    "TEST-NOTES.md",
    "provenance.json",
    "package-manifest.json",
    "screenshots/word-selection.png",
    "screenshots/excel-text-cell.png",
    "screenshots/powerpoint-text-range.png",
  ]) {
    const buffer = await readFile(path.join(releaseDir, relativePath));
    assert.ok(
      checksumText.includes(`${sha256(buffer)}  ${relativePath}`),
      relativePath,
    );
  }
});

test("release notes preserve Windows-only scope", async () => {
  const releaseDir = await resolveReleaseDir();
  for (const relativePath of [
    "README.md",
    "RELEASE-NOTES.md",
    "TEST-NOTES.md",
  ]) {
    const content = await readFile(
      path.join(releaseDir, relativePath),
      "utf8",
    );
    assert.match(content, /Microsoft 365 Desktop on Windows/);
    assert.match(content, /Phase 16/);
    assert.match(content, /Phase 17/);
    assert.match(content, /Phase 18/);
  }
  const testNotes = await readFile(
    path.join(releaseDir, "TEST-NOTES.md"),
    "utf8",
  );
  assert.match(testNotes, /Microsoft365 tests: 69\/69 PASS/);
  assert.match(testNotes, /آموزش و دسترسی‌پذیری/);
});
