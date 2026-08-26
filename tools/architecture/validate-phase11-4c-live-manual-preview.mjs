import { readFile } from "node:fs/promises";

const root = new URL("../../", import.meta.url);

async function text(path) {
  return readFile(new URL(path, root), "utf8");
}

function fail(message) {
  throw new Error(
    `Phase 11.4c live evidence validation failed: ${message}`,
  );
}

function requireText(value, token, label) {
  if (!value.includes(token)) {
    fail(`${label}: missing ${JSON.stringify(token)}`);
  }
}

const evidenceText = await text(
  "docs/architecture/phase-11.4c-live-manual-preview-probe.txt",
);

const evidenceJson = JSON.parse(
  await text(
    "docs/architecture/phase-11.4c-live-manual-preview-probe.json",
  ),
);

const note = await text(
  "docs/architecture/phase-11.4c-live-manual-preview-evidence.md",
);

const packageJson = JSON.parse(await text("package.json"));

const expectedHead =
  "fc446963f7e8c8d4cb032a6eeff9fc9eb6fe85f1";

if (evidenceJson.phase !== "11.4c-live") {
  fail("unexpected evidence phase");
}

if (evidenceJson.result !== "PASS") {
  fail("frozen live probe is not PASS");
}

if (
  evidenceJson.branch !== "phase11-marketplace"
  || evidenceJson.head !== expectedHead
) {
  fail("branch/HEAD evidence mismatch");
}

if (evidenceJson.remoteHead !== expectedHead) {
  fail("remote branch did not match frozen HEAD");
}

const workflow = evidenceJson.workflow ?? {};

if (
  workflow.runNumber !== 5
  || workflow.runAttempt !== 1
  || workflow.status !== "completed"
  || workflow.conclusion !== "success"
  || workflow.headSha !== expectedHead
) {
  fail("GitHub Pages workflow evidence mismatch");
}

const expectedEndpoints = {
  install: {
    status: 200,
    sha256:
      "a6fba93e1fe49138503a27c370f93ee65674d8efe47bd463fab796025f82d31d",
  },
  manifest: {
    status: 200,
    sha256:
      "a3d05cadd9a668186b474e1222123717abc41893b247a5790498e87e0136ee73",
  },
  css: {
    status: 200,
    sha256:
      "266e0a66af351c382eebb75fff9b02a904f0b374340a5f3dd14a5e8ec0c02b05",
  },
};

for (const [name, expected] of Object.entries(expectedEndpoints)) {
  const actual = evidenceJson.endpoints?.[name];

  if (
    actual?.status !== expected.status
    || actual?.sha256 !== expected.sha256
  ) {
    fail(`${name} endpoint evidence mismatch`);
  }
}

if (evidenceJson.installLiveMatchesCommittedSource !== true) {
  fail("live install page did not match committed source");
}

if (evidenceJson.localGeneratedManifest?.liveMatches !== true) {
  fail("live hosted manifest did not match generated production manifest");
}

for (const check of Object.values(evidenceJson.checks ?? {})) {
  if (check?.pass !== true) {
    fail("at least one frozen live-probe check is not PASS");
  }
}

for (const token of [
  "[PASS] Phase 11.4c live manual preview HTTPS verification",
  "[PASS] Word host: PASS",
  "[PASS] Excel host: PASS",
  "[PASS] PowerPoint host: PASS",
  "MANUAL SIDELOAD PREVIEW / NOT MARKETPLACE PUBLICATION",
  "Web / Mac remain EXPECTED / NOT EXECUTED",
]) {
  requireText(evidenceText, token, "frozen live probe");
}

const normalizedNote = note.replace(/\s+/g, " ").trim();

for (const token of [
  "LIVE VERIFIED / PASS",
  "MANUAL SIDELOAD PREVIEW",
  "NOT MICROSOFT MARKETPLACE PUBLICATION",
  "EXTERNAL BLOCKED / NOT SATISFIED",
  "Web / Mac: EXPECTED / NOT EXECUTED",
  "https://soroushneyestani.github.io/Braille-Hub/install.html",
  "11.4d Marketplace Screenshots / Listing Assets",
]) {
  requireText(normalizedNote, token, "Phase 11.4c live evidence note");
}

if (
  packageJson.scripts?.["validate:phase11-4c-live-manual-preview"] !==
  "node tools/architecture/validate-phase11-4c-live-manual-preview.mjs"
) {
  fail("live evidence validator package script missing");
}

if (
  packageJson.scripts?.["validate:phase11-4c-live"] !==
  "pnpm run validate:phase11-4c && pnpm run validate:phase11-4c-live-manual-preview"
) {
  fail("Phase 11.4c live aggregate validator package script missing");
}

console.log("Phase 11.4c live manual preview evidence: PASS");
console.log("GitHub Pages run #5 / attempt 1: SUCCESS");
console.log("install.html: LIVE HTTPS / SOURCE MATCH / PASS");
console.log("install/manifest.xml: LIVE HTTPS / GENERATED MANIFEST MATCH / PASS");
console.log("Word / Excel / PowerPoint hosts: PRESENT / PASS");
console.log("Public classification: MANUAL SIDELOAD PREVIEW");
console.log("Marketplace publication claim: NONE");
console.log("Publisher gate: EXTERNAL BLOCKED / PRESERVED");
console.log("Web / Mac: EXPECTED / NOT EXECUTED");
console.log("Public install URL: VERIFIED / SHAREABLE");
console.log("Next: Phase 11.4d Marketplace Screenshots / Listing Assets");
