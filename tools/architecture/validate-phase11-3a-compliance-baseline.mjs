import { readFile } from "node:fs/promises";

const root = new URL("../../", import.meta.url);

async function text(path) {
  return readFile(new URL(path, root), "utf8");
}

function fail(message) {
  throw new Error(`Phase 11.3a compliance baseline validation failed: ${message}`);
}

function requireText(value, token, label) {
  if (!value.includes(token)) {
    fail(`${label}: missing ${JSON.stringify(token)}`);
  }
}

const baseline = JSON.parse(
  await text("docs/architecture/phase-11.3a-compliance-baseline.json"),
);
const evidence = await text(
  "docs/architecture/phase-11.3a-compliance-baseline-audit.txt",
);
const note = await text(
  "docs/architecture/phase-11.3a-compliance-baseline.md",
);
const manifest = await text("integrations/microsoft365/manifest.xml");
const phase112 = JSON.parse(
  await text("docs/architecture/phase-11.2-closure.json"),
);
const packageJson = JSON.parse(await text("package.json"));

if (baseline.phase !== "11.3a") {
  fail("phase mismatch");
}
if (baseline.status !== "closed-baseline-gaps-recorded") {
  fail("baseline status mismatch");
}
if (baseline.phase112Regression !== "pass") {
  fail("Phase 11.2 regression snapshot is not PASS");
}
if (phase112.status !== "closed") {
  fail("Phase 11.2 closure is not CLOSED");
}

requireText(
  manifest,
  "<ProviderName>Soroush Neyestani</ProviderName>",
  "manifest ProviderName baseline",
);
requireText(
  manifest,
  '<SupportUrl DefaultValue="https://github.com/soroushneyestani/Braille-Hub"/>',
  "manifest SupportUrl baseline",
);

for (const token of [
  "[PASS] Phase 11.2 aggregate regression: exit=0",
  "[GAP] Marketplace SupportUrl: https://github.com/soroushneyestani/Braille-Hub",
  "[GAP] Public support page: not present",
  "[GAP] Public privacy page: not present",
  "[GAP] Public eula page: not present",
  "[EXTERNAL] Partner Center publisher account enrollment",
  "[EXTERNAL] Partner Center publisher name must be checked",
  "[EXTERNAL] Microsoft 365 and Copilot program enrollment",
]) {
  requireText(evidence, token, "raw Phase 11.3a audit");
}

for (const token of [
  "RUNTIME BROWSER STORAGE / COOKIE SCAN",
  "RUNTIME IDENTITY / AUTHENTICATION SCAN",
  "RUNTIME ANALYTICS / TELEMETRY SCAN",
  "[none]",
]) {
  requireText(evidence, token, "runtime privacy evidence");
}

if (baseline.runtimeFindings?.browserStorage !== "none-found") {
  fail("browser-storage finding changed");
}
if (baseline.runtimeFindings?.authentication !== "none-found") {
  fail("authentication finding changed");
}
if (baseline.runtimeFindings?.analyticsTelemetry !== "none-found") {
  fail("analytics/telemetry finding changed");
}
if (baseline.runtimeFindings?.appOwnedFetchXhrWebSocket !== "none-found") {
  fail("app-owned network finding changed");
}

requireText(
  note,
  "Phase 11.3b — Public Support / Privacy / EULA pages",
  "next-phase note",
);

if (!packageJson.scripts?.["validate:phase11-3a-compliance-baseline"]) {
  fail("Phase 11.3a baseline validator is not registered");
}
if (!packageJson.scripts?.["validate:phase11-3a"]) {
  fail("Phase 11.3a aggregate validator is not registered");
}

console.log("Phase 11.3a compliance baseline validation: PASS");
console.log("Phase 11.2 frozen regression: PASS");
console.log("App-owned analytics/storage/auth/network transport: NONE FOUND");
console.log("Support / Privacy / EULA public pages: GAPS RECORDED");
console.log("Publisher identity / Partner Center enrollment: EXTERNAL GATES");
console.log("Next: Phase 11.3b Public Support / Privacy / EULA pages");
