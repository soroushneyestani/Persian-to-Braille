import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");

function git(args) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
  }).trim();
}

async function text(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

const closure = JSON.parse(
  await text(
    "docs/architecture/phase-11.8-windows-desktop-closure.json",
  ),
);
const note = await text(
  "docs/architecture/phase-11.8-windows-desktop-closure.md",
);
const preflight = JSON.parse(
  await text(
    "docs/architecture/"
      + "phase-11.7-windows-desktop-release-preflight.json",
  ),
);
const scope = await text(
  "docs/architecture/phase-11-windows-desktop-scope-decision.md",
);
const matrix = JSON.parse(
  await text(
    "docs/architecture/"
      + "phase-11.5-windows-desktop-certification-matrix.json",
  ),
);
const packageJson = JSON.parse(await text("package.json"));

const candidate =
  "242547ed0a4262a6b56b06d22546a010ed07fc30";

assert.equal(closure.schemaVersion, 1);
assert.equal(closure.phase, "11.8");
assert.equal(closure.result, "CLOSED");
assert.equal(
  closure.releaseScope,
  "Microsoft 365 Desktop on Windows",
);
assert.equal(
  closure.architectureBoundary,
  "Microsoft365 -> SDK -> Core",
);

assert.equal(closure.finalWindowsCandidate.head, candidate);
assert.equal(closure.finalWindowsCandidate.phase117Result, "PASS");
assert.equal(closure.finalWindowsCandidate.githubActionsRunNumber, 13);
assert.equal(
  closure.finalWindowsCandidate.githubActionsConclusion,
  "success",
);
assert.equal(
  closure.finalWindowsCandidate.artifactName,
  "persian-to-braille-windows-desktop-release-1",
);
assert.equal(
  closure.finalWindowsCandidate.packageManifestSha256,
  "8ebc50cf24b921d0dc75c3063df233bbc380d7cf617a4e9e60d8e814ea735ffc",
);

assert.deepEqual(closure.windowsHosts, {
  word: "PASS",
  excel: "PASS",
  powerpoint: "PASS",
});

assert.equal(closure.regression.microsoft365, "69/69 PASS");
assert.equal(closure.regression.runtimeRules, 176);
assert.equal(closure.regression.candidateRules, 139);
assert.equal(closure.regression.normativeRules, 37);
assert.equal(closure.regression.u0622, "included");
assert.equal(closure.regression.publicTrustWording, "PASS");

assert.equal(closure.distribution.productionHttps, "PASS");
assert.equal(closure.distribution.windowsInstaller, "PASS");
assert.equal(closure.distribution.releasePackage, "PASS");
assert.equal(closure.distribution.releasePreflight, "PASS");
assert.equal(closure.distribution.ciArtifact, "PASS");

assert.equal(closure.deferred.web, "Phase 16");
assert.equal(closure.deferred.mac, "Phase 17");
assert.equal(
  closure.deferred.marketplacePartnerCenter,
  "Phase 18",
);

assert.equal(closure.next, "Phase 12 Developer Ecosystem");

assert.equal(preflight.phase, "11.7");
assert.equal(preflight.result, "PASS");
assert.equal(preflight.git.head, candidate);
assert.equal(preflight.git.cleanBefore, true);
assert.equal(preflight.git.cleanAfter, true);
assert.equal(preflight.phase116Validation, "PASS");
assert.deepEqual(preflight.failures, []);
assert.equal(preflight.githubActions.runNumber, 13);
assert.equal(preflight.githubActions.conclusion, "success");
assert.equal(preflight.githubArtifact.found, true);
assert.equal(preflight.githubArtifact.expired, false);

assert.equal(matrix.hosts.word.windowsRuntimeEvidence, "verified-pass");
assert.equal(matrix.hosts.excel.windowsRuntimeEvidence, "verified-pass");
assert.equal(
  matrix.hosts.powerpoint.windowsRuntimeEvidence,
  "verified-pass",
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
  "CLOSED — PHASE 11 WINDOWS DESKTOP RELEASE COMPLETE",
  "PHASE 11 WINDOWS DESKTOP: CLOSED / PASS",
  "Word / Windows:       PASS",
  "Excel / Windows:      PASS",
  "PowerPoint / Windows: PASS",
  "Phase 16 — Office on the Web",
  "Phase 17 — Microsoft 365 for Mac",
  "Phase 18 — Microsoft Marketplace / Partner Center official publication",
  "Phase 12 — Developer Ecosystem",
]) {
  assert.ok(note.includes(token), `closure note missing ${token}`);
}

const currentHead = git(["rev-parse", "HEAD"]);
const baseHead = closure.closurePreparationBaseHead;

assert.equal(
  git(["merge-base", "--is-ancestor", candidate, currentHead]),
  "",
);
assert.equal(
  git(["merge-base", "--is-ancestor", baseHead, currentHead]),
  "",
);

const allowedAfterCandidate = new Set([
  "docs/architecture/phase-11.7-windows-desktop-release-preflight.json",
  "docs/architecture/phase-11.7-windows-desktop-release-preflight.md",
  "docs/architecture/phase-11.7-windows-desktop-release-preflight.txt",
  "docs/architecture/phase-11.8-windows-desktop-closure.json",
  "docs/architecture/phase-11.8-windows-desktop-closure.md",
  "package.json",
  "tools/architecture/validate-phase11-7-windows-desktop-release-preflight.mjs",
  "tools/architecture/validate-phase11-8-windows-desktop-closure.mjs",
]);

const changed = git([
  "diff",
  "--name-only",
  `${candidate}..HEAD`,
])
  .split(/\r?\n/)
  .filter(Boolean);

for (const relativePath of changed) {
  assert.ok(
    allowedAfterCandidate.has(relativePath),
    `post-candidate runtime/source change is not allowed: ${relativePath}`,
  );
}

assert.equal(
  packageJson.scripts["validate:phase11-8-closure"],
  "node tools/architecture/validate-phase11-8-windows-desktop-closure.mjs",
);
assert.equal(
  packageJson.scripts["validate:phase11-8"],
  "pnpm run validate:phase11-7-preflight && pnpm run validate:phase11-windows-desktop-scope && pnpm run validate:phase11-public-trust-wording && pnpm run validate:phase11-8-closure",
);

console.log("Phase 11.8 Final Windows Desktop Closure: PASS");
console.log("PHASE 11 WINDOWS DESKTOP: CLOSED / PASS");
console.log("Final Windows candidate: 242547ed0a4262a6b56b06d22546a010ed07fc30");
console.log("Word / Windows: PASS");
console.log("Excel / Windows: PASS");
console.log("PowerPoint / Windows: PASS");
console.log("Microsoft365 regression: 69/69 PASS");
console.log("Windows release package + preflight: PASS");
console.log("Post-candidate runtime/source changes: NONE / PASS");
console.log("Web: DEFERRED TO PHASE 16");
console.log("Mac: DEFERRED TO PHASE 17");
console.log("Marketplace / Partner Center: DEFERRED TO PHASE 18");
console.log("Next: Phase 12 Developer Ecosystem");
