import assert from "node:assert/strict";
import {
  readFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");

async function text(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

async function bytes(relativePath) {
  return readFile(path.join(root, relativePath));
}

function requireText(content, token, label) {
  assert.ok(
    content.includes(token),
    `${label} is missing ${JSON.stringify(token)}`,
  );
}

const page = await text(
  "integrations/microsoft365/public/install.html",
);
const builder = await text(
  "integrations/microsoft365/build-manual-preview.mjs",
);
const tests = await text(
  "integrations/microsoft365/test/manual-preview-distribution.test.mjs",
);
const bootstrapper = await bytes(
  "integrations/microsoft365/public/install/windows/"
    + "Braille-Hub-Windows-Preview-Installer.cmd",
);
const setupHelper = await bytes(
  "integrations/microsoft365/public/install/windows/"
    + "windows-preview-setup.ps1",
);
const note = await text(
  "docs/architecture/phase-11.4e-windows-preview-installer.md",
);
const packageJson = JSON.parse(
  await text("package.json"),
);

for (const token of [
  "Manual Preview Installation",
  "Windows Desktop Preview",
  "./install/windows/Braille-Hub-Windows-Preview-Installer.cmd",
  "راهنمای نصب نسخه دسکتاپ ویندوز",
  "Get Add-ins",
  "Advanced",
  "SHARED FOLDER",
  "Braille Hub",
  "Translate Selection",
  "./install/screenshots/word-selection.png",
  "./install/screenshots/excel-text-cell.png",
  "./install/screenshots/powerpoint-text-range.png",
  "./install/manifest.xml",
  "Web and Mac: release-gate execution remains pending",
  "not Microsoft Marketplace",
]) {
  requireText(page, token, "install page");
}

for (const [label, content] of [
  ["bootstrapper", bootstrapper],
  ["setup helper", setupHelper],
]) {
  assert.equal(
    [...content].every((byte) => byte < 0x80),
    true,
    `${label} must remain ASCII-only`,
  );
}

const bootstrapperText = bootstrapper.toString("utf8");
const setupText = setupHelper.toString("utf8");

for (const token of [
  "windows-preview-setup.ps1",
  "ExecutionPolicy Bypass",
  "https://soroushneyestani.github.io/Braille-Hub/",
  "NOT a Microsoft Marketplace installer",
]) {
  requireText(bootstrapperText, token, "Windows bootstrapper");
}

for (const token of [
  "https://soroushneyestani.github.io/Braille-Hub/install/manifest.xml",
  "33ec7928-1204-5bb3-88e6-d778413e9234",
  "New-SmbShare",
  "HKCU:\\Software\\Microsoft\\Office\\16.0\\WEF\\TrustedCatalogs",
  '"Flags"',
  "SHARED FOLDER",
  "Get Add-ins or Advanced",
  "It is not Microsoft Marketplace publication.",
]) {
  requireText(setupText, token, "Windows setup helper");
}

assert.doesNotMatch(bootstrapperText, /localhost/i);
assert.doesNotMatch(setupText, /localhost/i);
assert.doesNotMatch(setupText, /Stop-Process/);

for (const token of [
  "hostedWindowsDir",
  "hostedScreenshotDir",
  "Braille-Hub-Windows-Preview-Installer.cmd",
  "windows-preview-setup.ps1",
  "word-selection.png",
  "excel-text-cell.png",
  "powerpoint-text-range.png",
]) {
  requireText(builder, token, "manual preview builder");
}

for (const token of [
  "Windows preview section documents installer and final Office UI steps",
  "Windows installer sources are ASCII-only preview tooling",
  "manual preview build publishes exact Windows installer sources",
  "manual preview build publishes exact Phase 11.4d screenshot assets",
]) {
  requireText(tests, token, "manual preview tests");
}

for (const token of [
  "CLOSED — WINDOWS DESKTOP PREVIEW INSTALLER AND PERSIAN GUIDE VALIDATED",
  "network-share sideload/testing",
  "not Microsoft Marketplace publication",
  "Phase 11.4 internal listing preparation: COMPLETE",
  "Phase 11.5 Cross-platform Certification Matrix",
]) {
  requireText(note, token, "Phase 11.4e note");
}

assert.equal(
  packageJson.scripts["validate:phase11-4e-windows-preview-installer"],
  "node tools/architecture/validate-phase11-4e-windows-preview-installer.mjs",
);
assert.equal(
  packageJson.scripts["validate:phase11-4e"],
  "pnpm run validate:phase11-4d && pnpm run build:marketplace-preview && pnpm run test:manual-preview && pnpm run validate:phase11-4e-windows-preview-installer",
);

const distRoot = path.join(
  root,
  "integrations",
  "microsoft365",
  "marketplace-dist",
  "site",
);

for (const [sourceRel, hostedRel] of [
  [
    "integrations/microsoft365/public/install/windows/"
      + "Braille-Hub-Windows-Preview-Installer.cmd",
    "install/windows/Braille-Hub-Windows-Preview-Installer.cmd",
  ],
  [
    "integrations/microsoft365/public/install/windows/windows-preview-setup.ps1",
    "install/windows/windows-preview-setup.ps1",
  ],
  [
    "integrations/microsoft365/marketplace/listing/assets/screenshots/word-selection.png",
    "install/screenshots/word-selection.png",
  ],
  [
    "integrations/microsoft365/marketplace/listing/assets/screenshots/excel-text-cell.png",
    "install/screenshots/excel-text-cell.png",
  ],
  [
    "integrations/microsoft365/marketplace/listing/assets/screenshots/powerpoint-text-range.png",
    "install/screenshots/powerpoint-text-range.png",
  ],
]) {
  const source = await readFile(path.join(root, sourceRel));
  const hosted = await readFile(path.join(distRoot, hostedRel));

  assert.deepEqual(
    hosted,
    source,
    `hosted asset mismatch: ${hostedRel}`,
  );
}

console.log(
  "Phase 11.4e Windows Desktop Preview Installer + Persian guide: PASS",
);
console.log(
  "Windows installer bootstrapper: PUBLIC / PASS",
);
console.log(
  "PowerShell setup helper: PUBLIC / ASCII-ONLY / PASS",
);
console.log(
  "Trusted catalog: HKCU + LOCAL SMB SHARE / PASS",
);
console.log(
  "Persian installation guide: PRESENT / PASS",
);
console.log(
  "Word / Excel / PowerPoint screenshots: PUBLIC / SOURCE MATCH / PASS",
);
console.log(
  "Marketplace publication claim: NONE",
);
console.log(
  "Publisher gate: EXTERNAL BLOCKED / PRESERVED",
);
console.log(
  "Web / Mac: EXPECTED / NOT EXECUTED",
);
console.log(
  "Phase 11.4 internal listing preparation: COMPLETE",
);
console.log(
  "Next: Phase 11.5 Cross-platform Certification Matrix / Web + Mac + iOS decision",
);
