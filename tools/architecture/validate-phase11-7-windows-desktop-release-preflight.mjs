import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");

async function text(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

const evidence = JSON.parse(
  await text(
    "docs/architecture/"
      + "phase-11.7-windows-desktop-release-preflight.json",
  ),
);
const note = await text(
  "docs/architecture/"
    + "phase-11.7-windows-desktop-release-preflight.md",
);
const raw = await text(
  "docs/architecture/"
    + "phase-11.7-windows-desktop-release-preflight.txt",
);
const packageJson = JSON.parse(await text("package.json"));

assert.equal(evidence.schemaVersion, 1);
assert.equal(evidence.phase, "11.7");
assert.equal(evidence.result, "PASS");
assert.equal(
  evidence.classification,
  "internal-windows-desktop-release-preflight",
);

assert.equal(
  evidence.git.branch,
  "phase11-marketplace",
);
assert.equal(
  evidence.git.head,
  "242547ed0a4262a6b56b06d22546a010ed07fc30",
);
assert.equal(evidence.git.cleanBefore, true);
assert.equal(evidence.git.cleanAfter, true);

assert.equal(evidence.runtime.node, "v22.14.0");
assert.equal(evidence.runtime.pnpm, "11.21.0");

assert.equal(
  evidence.productionBase,
  "https://soroushneyestani.github.io/Persian-to-Braille",
);
assert.equal(evidence.phase116Validation, "PASS");

for (const [key, value] of Object.entries(
  evidence.releasePackage.provenanceChecks,
)) {
  assert.equal(value, true, `provenance check ${key}`);
}

for (const [key, value] of Object.entries(
  evidence.releasePackage.packageChecks,
)) {
  assert.equal(value, true, `package check ${key}`);
}

for (const [key, value] of Object.entries(
  evidence.releasePackage.productionManifestChecks,
)) {
  assert.equal(value, true, `manifest check ${key}`);
}

assert.equal(evidence.releasePackage.declaredPayloadCount, 10);
assert.equal(
  evidence.releasePackage.packageManifestSha256,
  "8ebc50cf24b921d0dc75c3063df233bbc380d7cf617a4e9e60d8e814ea735ffc",
);

assert.equal(evidence.githubActions.matchingRunFound, true);
assert.equal(evidence.githubActions.runNumber, 13);
assert.equal(evidence.githubActions.runAttempt, 1);
assert.equal(evidence.githubActions.status, "completed");
assert.equal(evidence.githubActions.conclusion, "success");
assert.equal(
  evidence.githubActions.headSha,
  "242547ed0a4262a6b56b06d22546a010ed07fc30",
);

assert.equal(evidence.githubArtifact.found, true);
assert.equal(
  evidence.githubArtifact.name,
  "persian-to-braille-windows-desktop-release-1",
);
assert.equal(evidence.githubArtifact.expired, false);
assert.ok(evidence.githubArtifact.sizeInBytes > 0);

assert.equal(evidence.scope.windowsDesktop, "release-scope");
assert.equal(evidence.scope.web, "Phase 16");
assert.equal(evidence.scope.mac, "Phase 17");
assert.equal(
  evidence.scope.marketplacePartnerCenter,
  "Phase 18",
);
assert.deepEqual(evidence.failures, []);

for (const token of [
  "CLOSED — FINAL WINDOWS DESKTOP RELEASE PREFLIGHT VERIFIED",
  "Phase 11.7 result: PASS",
  "242547ed0a4262a6b56b06d22546a010ed07fc30",
  "8ebc50cf24b921d0dc75c3063df233bbc380d7cf617a4e9e60d8e814ea735ffc",
  "run number: 13",
  "persian-to-braille-windows-desktop-release-1",
  "69/69 PASS",
  "Phase 16",
  "Phase 17",
  "Phase 18",
  "Phase 11.8 — Final Windows Desktop Closure",
]) {
  assert.ok(note.includes(token), `preflight note missing ${token}`);
}

for (const token of [
  "PHASE 11.7 WINDOWS DESKTOP RELEASE PREFLIGHT: PASS",
  "Committed clean HEAD build: PASS",
  "Phase 11.6 aggregate validation: PASS",
  "Release provenance: PASS",
  "Package SHA-256 integrity: PASS",
  "Production manifest: PASS",
  "Working tree stability: PASS",
  "GitHub Actions current-HEAD run: PASS",
  "Windows Desktop CI release artifact: PASS",
]) {
  assert.ok(raw.includes(token), `raw preflight missing ${token}`);
}

assert.equal(
  packageJson.scripts["validate:phase11-7-preflight"],
  "node tools/architecture/validate-phase11-7-windows-desktop-release-preflight.mjs",
);
assert.equal(
  packageJson.scripts["validate:phase11-7"],
  "pnpm run validate:phase11-6 && pnpm run validate:phase11-7-preflight",
);

console.log("Phase 11.7 Windows Desktop Release Preflight: PASS");
console.log("Candidate HEAD: 242547ed0a4262a6b56b06d22546a010ed07fc30");
console.log("Committed clean-HEAD rebuild: PASS");
console.log("Package SHA-256 integrity: PASS");
console.log("GitHub Actions run #13: SUCCESS");
console.log("Windows Desktop CI artifact: PASS");
console.log("Web: DEFERRED TO PHASE 16");
console.log("Mac: DEFERRED TO PHASE 17");
console.log("Marketplace / Partner Center: DEFERRED TO PHASE 18");
console.log("Next: Phase 11.8 Final Windows Desktop Closure");
