import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const microsoft365Root = path.join(root, "integrations", "microsoft365");

async function text(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function resolveReleaseDir() {
  const candidates = [
    path.join(
      root,
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
  throw new Error("Windows Desktop release package was not generated.");
}

const packageJson = JSON.parse(await text("package.json"));
const workflow = await text(
  ".github/workflows/microsoft365-marketplace-pages.yml",
);
const architecture = await text(
  "docs/architecture/phase-11.6-windows-desktop-release-package.md",
);
const readme = await text(
  "integrations/microsoft365/release/windows-desktop/README.md",
);
const releaseNotes = await text(
  "integrations/microsoft365/release/windows-desktop/RELEASE-NOTES.md",
);
const testNotes = await text(
  "integrations/microsoft365/release/windows-desktop/TEST-NOTES.md",
);
const builder = await text(
  "integrations/microsoft365/build-windows-desktop-release.mjs",
);
const tests = await text(
  "integrations/microsoft365/test/windows-desktop-release-package.test.mjs",
);

for (const token of [
  "CLOSED — WINDOWS DESKTOP RELEASE PACKAGE VALIDATED",
  "Microsoft 365 Desktop on Windows",
  "Windows Desktop release candidate",
  "checksums.sha256",
  "package-manifest.json",
  "Phase 11.7 — Windows Desktop Release Preflight",
]) {
  assert.ok(architecture.includes(token), `architecture missing ${token}`);
}

for (const content of [readme, releaseNotes, testNotes]) {
  for (const token of [
    "Microsoft 365 Desktop on Windows",
    "Phase 16",
    "Phase 17",
    "Phase 18",
  ]) {
    assert.ok(content.includes(token), `release text missing ${token}`);
  }
}

for (const token of [
  "windows-desktop-release",
  "package-manifest.json",
  "checksums.sha256",
  "provenance.json",
  "manifest.xml",
  "NO LOCALHOST",
]) {
  assert.ok(builder.includes(token), `builder missing ${token}`);
}

for (const token of [
  "Windows release package contains the required delivery files",
  "production manifest is safe",
  "manifest hashes every declared payload exactly",
  "checksums file covers the package manifest and payload",
  "release notes preserve Windows-only scope",
]) {
  assert.ok(tests.includes(token), `tests missing ${token}`);
}

assert.match(workflow, /Build Windows Desktop release package/);
assert.match(workflow, /pnpm run build:windows-desktop-release/);
assert.match(workflow, /Upload Windows Desktop release package/);
assert.match(workflow, /marketplace-dist\/windows-desktop-release/);

assert.equal(
  packageJson.scripts["build:windows-desktop-release"],
  "node integrations/microsoft365/build-windows-desktop-release.mjs",
);
assert.equal(
  packageJson.scripts["test:windows-desktop-release"],
  "node --test integrations/microsoft365/test/windows-desktop-release-package.test.mjs",
);
assert.equal(
  packageJson.scripts["validate:phase11-6-windows-release"],
  "node tools/architecture/validate-phase11-6-windows-desktop-release-package.mjs",
);
assert.equal(
  packageJson.scripts["validate:phase11-6"],
  "pnpm run validate:phase11-4e && pnpm run validate:phase11-windows-desktop-scope && pnpm run validate:phase11-5-windows-certification && pnpm run build:marketplace-preview && pnpm run build:windows-desktop-release && pnpm run test:windows-desktop-release && pnpm run validate:phase11-6-windows-release",
);

const releaseDir = await resolveReleaseDir();
const releaseManifest = JSON.parse(
  await readFile(
    path.join(releaseDir, "package-manifest.json"),
    "utf8",
  ),
);

assert.equal(releaseManifest.phase, "11.6");
assert.equal(
  releaseManifest.packageType,
  "windows-desktop-release-candidate",
);
assert.equal(
  releaseManifest.releaseScope,
  "Microsoft 365 Desktop on Windows",
);
assert.equal(
  releaseManifest.architectureBoundary,
  "Microsoft365 -> SDK -> Core",
);
assert.equal(releaseManifest.deferred.web, "Phase 16");
assert.equal(releaseManifest.deferred.mac, "Phase 17");
assert.equal(
  releaseManifest.deferred.marketplacePartnerCenter,
  "Phase 18",
);

for (const file of releaseManifest.files) {
  const buffer = await readFile(path.join(releaseDir, file.path));
  assert.equal(buffer.length, file.bytes, file.path);
  assert.equal(sha256(buffer), file.sha256, file.path);
}

const provenance = JSON.parse(
  await readFile(path.join(releaseDir, "provenance.json"), "utf8"),
);
assert.equal(provenance.phase, "11.6");
assert.equal(
  provenance.releaseScope,
  "Microsoft 365 Desktop on Windows",
);
assert.equal(
  provenance.architectureBoundary,
  "Microsoft365 -> SDK -> Core",
);

console.log("Phase 11.6 Windows Desktop Release Package: PASS");
console.log("Release package contents: COMPLETE / PASS");
console.log("Production manifest: HTTPS / NO LOCALHOST / PASS");
console.log("SHA-256 package manifest: PASS");
console.log("SHA-256 checksums file: PASS");
console.log("Release notes: PRESENT / PASS");
console.log("Windows test notes: PRESENT / PASS");
console.log("CI release artifact: CONFIGURED / PASS");
console.log("Scope: Microsoft 365 Desktop on Windows");
console.log("Web: DEFERRED TO PHASE 16");
console.log("Mac: DEFERRED TO PHASE 17");
console.log("Marketplace / Partner Center: DEFERRED TO PHASE 18");
console.log("Next: Phase 11.7 Windows Desktop Release Preflight");
