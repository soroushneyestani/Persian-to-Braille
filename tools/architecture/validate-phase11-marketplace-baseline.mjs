import { readFile } from "node:fs/promises";

const root = new URL("../../", import.meta.url);

async function text(path) {
  return readFile(new URL(path, root), "utf8");
}

function fail(message) {
  throw new Error(`Phase 11.1 Marketplace baseline validation failed: ${message}`);
}

function equal(actual, expected, label) {
  if (actual !== expected) {
    fail(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function requireText(value, token, label) {
  if (!value.includes(token)) {
    fail(`${label}: missing ${JSON.stringify(token)}`);
  }
}

const baseline = JSON.parse(
  await text("docs/architecture/phase-11.1-marketplace-baseline.json"),
);
const evidence = await text(
  "docs/architecture/phase-11.1-marketplace-baseline-audit.txt",
);
const note = await text(
  "docs/architecture/phase-11.1-marketplace-baseline.md",
);
const manifest = await text("integrations/microsoft365/manifest.xml");
const taskPane = await text(
  "integrations/microsoft365/public/taskpane.html",
);
const phase10 = JSON.parse(
  await text("docs/architecture/phase-10.6-closure.json"),
);
const packageJson = JSON.parse(await text("package.json"));

equal(baseline.phase, "11.1", "phase");
equal(
  baseline.status,
  "closed-baseline-gaps-recorded",
  "baseline status",
);
equal(
  baseline.baselineCommit,
  "c9a82483354832a3f292117ca20ae4875881e324",
  "Phase 11 baseline commit",
);
equal(baseline.phase10Regression, "pass", "Phase 10 regression snapshot");
equal(phase10.status, "closed", "Phase 10 closure status");

for (const host of ["Document", "Workbook", "Presentation"]) {
  requireText(manifest, `<Host Name="${host}"/>`, `manifest host ${host}`);
}

requireText(
  manifest,
  '<SupportUrl DefaultValue="https://github.com/soroushneyestani/Braille-Hub"/>',
  "development SupportUrl baseline",
);
requireText(
  manifest,
  "https://localhost:3000/taskpane.html",
  "development task-pane URL baseline",
);
requireText(
  manifest,
  "https://localhost:3000/assets/icon-80.png",
  "development high-resolution icon baseline",
);
requireText(
  taskPane,
  "https://appsforoffice.microsoft.com/lib/1/hosted/office.js",
  "production Office.js CDN",
);

for (const token of [
  "[PASS] Phase 10 regression at Phase 11 entry",
  "[FAIL] Support URL is Marketplace-suitable",
  "[FAIL] Production source locations",
  "[FAIL] Production manifest icons",
  "[GAP] Privacy Policy HTTPS URL",
  "[GAP] EULA / Terms HTTPS URL",
  "[RELEASE-GATE] Office on the web verification",
  "[RELEASE-GATE] Office on Mac verification",
  "[DECISION-GATE] iPad/iOS applicability",
]) {
  requireText(evidence, token, "Phase 11.1 raw audit evidence");
}

requireText(
  note,
  "Phase 11.2 — Production Hosting / HTTPS / Production Manifest",
  "Phase 11.1 next-phase note",
);

equal(
  baseline.platformGates?.windows,
  "verified-pass",
  "Windows platform baseline",
);
equal(
  baseline.platformGates?.web,
  "release-gate-not-executed",
  "Web platform baseline",
);
equal(
  baseline.platformGates?.mac,
  "release-gate-not-executed",
  "Mac platform baseline",
);
equal(
  baseline.platformGates?.ios,
  "decision-gate",
  "iOS platform baseline",
);

if (!packageJson.scripts?.["validate:phase11-marketplace-baseline"]) {
  fail("Marketplace baseline validator is not registered");
}
if (!packageJson.scripts?.["validate:phase11-1"]) {
  fail("Phase 11.1 aggregate validator is not registered");
}

console.log("Phase 11.1 Marketplace submission baseline validation: PASS");
console.log("Phase 10 merged regression baseline: PASS");
console.log("Windows: VERIFIED / PASS");
console.log("Production hosting / Support / Privacy / EULA: GAPS RECORDED");
console.log("Web / Mac: RELEASE GATES");
console.log("iOS/iPad: DECISION GATE");
console.log("Next: Phase 11.2 Production Hosting / HTTPS / Production Manifest");
