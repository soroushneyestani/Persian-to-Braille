import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");

async function text(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

const scope = await text(
  "docs/architecture/phase-11-windows-desktop-scope-decision.md",
);
const live = await text(
  "docs/architecture/phase-11.4e-live-windows-preview-evidence.md",
);
const probe = JSON.parse(
  await text(
    "docs/architecture/phase-11.4e-live-windows-preview-probe.json",
  ),
);
const packageJson = JSON.parse(await text("package.json"));

for (const token of [
  "Phase 11 Scope Decision — Windows Desktop First",
  "Phase 16 — Office on the Web",
  "Phase 17 — Microsoft 365 for Mac",
  "Phase 18 — Microsoft Marketplace / Partner Center Official Publication",
  "11.5   Windows Desktop Certification Matrix",
  "11.8   Phase 11 Windows Desktop Closure",
  "it no longer blocks the Windows Desktop technical closure of",
]) {
  assert.ok(scope.includes(token), `scope decision missing ${token}`);
}

for (const token of [
  "CLOSED — LIVE WINDOWS DESKTOP INSTALLER VERIFIED",
  "Windows Desktop Preview Installer: PASS",
  "Office add-in discovery: PASS",
  "Translate Selection: PASS",
  "Braille preview/runtime flow: PASS",
  "does not claim Web or Mac execution",
  "does not claim Microsoft",
  "Marketplace publication",
]) {
  assert.ok(live.includes(token), `live evidence missing ${token}`);
}

assert.equal(probe.phase, "11.4e-live");
assert.equal(probe.result, "PASS");
assert.equal(
  probe.git.head,
  "8c42ea364f0c7c7bf7b44fec7eb3d9f8e9218ecf",
);
assert.equal(probe.githubActions?.conclusion, "success");
assert.equal(
  probe.platformClaims?.windowsDesktop,
  "verified-preview-distribution",
);
assert.equal(probe.platformClaims?.web, "expected-not-executed");
assert.equal(probe.platformClaims?.mac, "expected-not-executed");
assert.equal(probe.publisherGate, "external-blocked-preserved");
assert.deepEqual(probe.failures, []);

assert.equal(
  packageJson.scripts["validate:phase11-windows-desktop-scope"],
  "node tools/architecture/validate-phase11-windows-desktop-scope.mjs",
);
assert.equal(
  packageJson.scripts["validate:phase11-4e-live"],
  "pnpm run validate:phase11-4e && pnpm run validate:phase11-windows-desktop-scope",
);

console.log("Phase 11 Windows Desktop scope decision: PASS");
console.log("Phase 11.4e live Windows installer evidence: PASS");
console.log("Windows Desktop: RELEASE SCOPE");
console.log("Web: DEFERRED TO PHASE 16");
console.log("Mac: DEFERRED TO PHASE 17");
console.log("Marketplace / Partner Center: DEFERRED TO PHASE 18");
console.log("Historical external publisher gate: PRESERVED");
console.log("Next: Phase 11.5 Windows Desktop Certification Matrix");
