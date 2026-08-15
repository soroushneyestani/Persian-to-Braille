import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");

async function text(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

const matrix = JSON.parse(
  await text(
    "docs/architecture/phase-11.5-windows-desktop-certification-matrix.json",
  ),
);
const note = await text(
  "docs/architecture/phase-11.5-windows-desktop-certification-matrix.md",
);
const scope = await text(
  "docs/architecture/phase-11-windows-desktop-scope-decision.md",
);
const live = await text(
  "docs/architecture/phase-11.4e-live-windows-preview-evidence.md",
);
const liveProbe = JSON.parse(
  await text(
    "docs/architecture/phase-11.4e-live-windows-preview-probe.json",
  ),
);
const packageJson = JSON.parse(await text("package.json"));

assert.equal(matrix.schemaVersion, 1);
assert.equal(matrix.phase, "11.5");
assert.equal(
  matrix.matrixType,
  "internal-windows-desktop-release-certification",
);
assert.equal(
  matrix.releaseScope,
  "Microsoft 365 Desktop on Windows",
);
assert.equal(
  matrix.architectureBoundary,
  "Microsoft365 -> SDK -> Core",
);

assert.deepEqual(
  Object.keys(matrix.hosts).sort(),
  ["excel", "powerpoint", "word"],
);

const word = matrix.hosts.word;
assert.equal(word.manifestHost, "Document");
assert.equal(word.requirementSet, "WordApi");
assert.equal(word.minimumVersion, "1.1");
assert.equal(word.replace, true);
assert.equal(word.insertAfter, true);
assert.equal(word.runtimeBatch, "Word.run");
assert.equal(word.windowsRuntimeEvidence, "verified-pass");

const excel = matrix.hosts.excel;
assert.equal(excel.manifestHost, "Workbook");
assert.equal(excel.requirementSet, "ExcelApi");
assert.equal(excel.minimumVersion, "1.1");
assert.equal(excel.replace, true);
assert.equal(excel.insertAfter, false);
assert.equal(
  excel.multiCellGuard,
  "SELECTION_SHAPE_UNSUPPORTED",
);
assert.equal(
  excel.formulaAndNonStringGuard,
  "SELECTION_CONTENT_UNSUPPORTED",
);
assert.equal(excel.runtimeBatch, "Excel.run");
assert.equal(excel.windowsRuntimeEvidence, "verified-pass");

const powerpoint = matrix.hosts.powerpoint;
assert.equal(powerpoint.manifestHost, "Presentation");
assert.equal(powerpoint.requirementSet, "PowerPointApi");
assert.equal(powerpoint.minimumVersion, "1.5");
assert.equal(powerpoint.replace, true);
assert.equal(powerpoint.insertAfter, false);
assert.deepEqual(
  powerpoint.snapshotFields,
  ["slideId", "shapeId", "start", "length", "text"],
);
assert.equal(powerpoint.runtimeBatch, "PowerPoint.run");
assert.equal(
  powerpoint.windowsRuntimeEvidence,
  "verified-pass",
);

assert.equal(matrix.shared.manifestFamily, "add-in-only XML");
assert.equal(matrix.shared.versionOverridesCount, 1);
assert.equal(
  matrix.shared.sharedRequirement,
  "AddinCommands 1.1",
);
assert.equal(matrix.shared.permission, "ReadWriteDocument");
assert.equal(
  matrix.shared.taskPaneDispatch,
  "Office.onReady -> Word | Excel | PowerPoint",
);
assert.equal(
  matrix.shared.translationBoundary,
  "Microsoft365 -> SDK -> Core",
);
assert.equal(matrix.shared.officeJs, "Microsoft CDN");
assert.equal(
  matrix.shared.windowsPreviewInstaller,
  "live-https-and-real-windows-verified",
);
assert.deepEqual(
  matrix.shared.microsoft365RegressionTests,
  { expected: 69, pass: 69, fail: 0 },
);

for (const [key, value] of Object.entries(matrix.releaseChecks)) {
  assert.equal(value, "pass", `release check ${key}`);
}

assert.equal(matrix.deferred.officeOnTheWeb, "Phase 16");
assert.equal(matrix.deferred.microsoft365Mac, "Phase 17");
assert.equal(
  matrix.deferred.microsoftMarketplacePartnerCenter,
  "Phase 18",
);

assert.equal(liveProbe.result, "PASS");
assert.equal(liveProbe.failures.length, 0);
assert.equal(
  liveProbe.platformClaims.windowsDesktop,
  "verified-preview-distribution",
);

for (const token of [
  "Windows Desktop First",
  "Phase 16 — Office on the Web",
  "Phase 17 — Microsoft 365 for Mac",
  "Phase 18 — Microsoft Marketplace / Partner Center Official Publication",
]) {
  assert.ok(scope.includes(token), `scope missing ${token}`);
}

for (const token of [
  "CLOSED — LIVE WINDOWS DESKTOP INSTALLER VERIFIED",
  "Windows Desktop Preview Installer: PASS",
  "Translate Selection: PASS",
  "Braille preview/runtime flow: PASS",
]) {
  assert.ok(live.includes(token), `live evidence missing ${token}`);
}

for (const token of [
  "CLOSED — WINDOWS DESKTOP CERTIFICATION MATRIX VALIDATED",
  "internal Windows Desktop release-certification matrix",
  "Word / Windows:       PASS",
  "Excel / Windows:      PASS",
  "PowerPoint / Windows: PASS",
  "Phase 16  Office on the Web",
  "Phase 17  Microsoft 365 for Mac",
  "Phase 18  Microsoft Marketplace / Partner Center official publication",
  "Phase 11.6 — Windows Desktop Release Package + Test Notes",
]) {
  assert.ok(note.includes(token), `note missing ${token}`);
}

assert.equal(
  packageJson.scripts["validate:phase11-5-windows-certification"],
  "node tools/architecture/validate-phase11-5-windows-desktop-certification.mjs",
);
assert.equal(
  packageJson.scripts["validate:phase11-5"],
  "pnpm run validate:phase11-4e-live && pnpm run validate:phase11-5-windows-certification",
);

console.log("Phase 11.5 Windows Desktop Certification Matrix: PASS");
console.log("Word / Windows: PASS");
console.log("Excel / Windows: PASS");
console.log("PowerPoint / Windows: PASS");
console.log("Windows installer / live distribution: PASS");
console.log("Microsoft365 regression baseline: 69/69 PASS");
console.log("Architecture: Microsoft365 -> SDK -> Core");
console.log("Web: DEFERRED TO PHASE 16");
console.log("Mac: DEFERRED TO PHASE 17");
console.log("Marketplace / Partner Center: DEFERRED TO PHASE 18");
console.log("Next: Phase 11.6 Windows Desktop Release Package + Test Notes");
