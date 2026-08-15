import {
  readFile,
  readdir,
} from "node:fs/promises";

const root = new URL("../../", import.meta.url);

async function text(path) {
  return readFile(new URL(path, root), "utf8");
}

function fail(message) {
  throw new Error(`Phase 10 closure validation failed: ${message}`);
}

function equal(actual, expected, label) {
  if (actual !== expected) {
    fail(
      `${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}

function requireText(value, token, label) {
  if (!value.includes(token)) {
    fail(`${label}: missing ${JSON.stringify(token)}`);
  }
}

async function collectSourceFiles(directoryUrl) {
  const entries = await readdir(directoryUrl, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const child = new URL(
      `${entry.name}${entry.isDirectory() ? "/" : ""}`,
      directoryUrl,
    );

    if (entry.isDirectory()) {
      files.push(...await collectSourceFiles(child));
      continue;
    }

    if (entry.isFile() && /\.(?:ts|js|mjs)$/.test(entry.name)) {
      files.push(child);
    }
  }

  return files;
}

const closure = JSON.parse(
  await text("docs/architecture/phase-10.6-closure.json"),
);
const phase105Closure = JSON.parse(
  await text("docs/architecture/phase-10.5d-closure.json"),
);
const liveEvidence = JSON.parse(
  await text("docs/architecture/phase-10.5b-windows-live-sideload-evidence.json"),
);
const architecture = JSON.parse(
  await text("docs/architecture/phase-10.2-shared-microsoft365-host-architecture.json"),
);
const manifest = await text("integrations/microsoft365/manifest.xml");
const microsoft365Package = JSON.parse(
  await text("integrations/microsoft365/package.json"),
);
const hostConfig = await text(
  "integrations/microsoft365/src/taskpane/host-config.ts",
);
const readiness = await text(
  "integrations/microsoft365/src/taskpane/readiness.ts",
);
const manifestEvidence = await text(
  "docs/architecture/phase-10.5a-office-manifest-validation.txt",
);
const phase105aNote = await text(
  "docs/architecture/phase-10.5a-three-host-manifest.md",
);
const rawAudit = await text(
  "docs/architecture/phase-10.6-final-closure-audit.txt",
);
const packageJson = JSON.parse(await text("package.json"));

equal(closure.phase, "10.6", "closure phase");
equal(closure.status, "closed", "Phase 10 status");
equal(
  closure.baselineCommit,
  "4c670f7d9df94b402ee167e29a3732485937784f",
  "Phase 10.6 baseline",
);

for (const phase of ["10.1", "10.2", "10.3", "10.4", "10.5", "10.6"]) {
  equal(closure.phases?.[phase]?.status, "closed", `${phase} status`);
}

equal(phase105Closure.status, "closed", "Phase 10.5 closure status");
equal(
  closure.architecture?.microsoft365DirectCoreAccess,
  false,
  "direct Core access policy",
);
equal(
  closure.architecture?.sdkIsOnlyTranslationDependency,
  true,
  "SDK-only translation dependency policy",
);
equal(
  architecture.architecture?.coreDirectAccessFromMicrosoft365Forbidden,
  true,
  "frozen Core access policy",
);
equal(
  architecture.architecture?.sdkIsOnlyTranslationDependency,
  true,
  "frozen SDK dependency policy",
);
equal(
  microsoft365Package.dependencies?.["@persian-braille/sdk"],
  "workspace:*",
  "Microsoft365 SDK dependency",
);

if (microsoft365Package.dependencies?.["@persian-braille/core"]) {
  fail("Microsoft365 package must not depend directly on Core");
}

const sourceFiles = await collectSourceFiles(
  new URL("integrations/microsoft365/src/", root),
);

let sdkImportCount = 0;

for (const fileUrl of sourceFiles) {
  const value = await readFile(fileUrl, "utf8");

  if (value.includes("@persian-braille/core")) {
    fail(`direct Core import found in ${fileUrl.pathname}`);
  }

  if (value.includes("@persian-braille/sdk")) {
    sdkImportCount += 1;
  }
}

if (sdkImportCount < 1) {
  fail("no public SDK imports found in Microsoft365 source tree");
}

for (const host of ["Document", "Workbook", "Presentation"]) {
  requireText(
    manifest,
    `<Host Name="${host}"/>`,
    `base manifest host ${host}`,
  );
  requireText(
    manifest,
    `<Host xsi:type="${host}">`,
    `VersionOverrides host ${host}`,
  );
}

requireText(
  manifest,
  '<bt:Set Name="AddinCommands" MinVersion="1.1"/>',
  "manifest command requirement",
);
requireText(
  manifest,
  "<Permissions>ReadWriteDocument</Permissions>",
  "manifest permission",
);

const versionOverrideCount =
  (manifest.match(/<VersionOverrides\b/g) ?? []).length;
equal(versionOverrideCount, 1, "VersionOverrides count");

for (const token of ["WordApi", "ExcelApi", "PowerPointApi"]) {
  requireText(hostConfig, token, "host capability configuration");
}

for (const token of [
  "supportsWordApi11",
  "supportsExcelApi11",
  "supportsPowerPointApi15",
]) {
  requireText(readiness, token, "runtime requirement gate");
}

for (const host of ["word", "excel", "powerpoint"]) {
  equal(
    liveEvidence.clients?.[host]?.status,
    "verified-pass",
    `${host} Windows live evidence`,
  );
  equal(
    closure.platformClaims?.windows?.[host],
    "verified-pass",
    `${host} closure Windows claim`,
  );
}

equal(
  closure.platformClaims?.web,
  "expected-not-executed",
  "Web claim",
);
equal(
  closure.platformClaims?.mac,
  "expected-not-executed",
  "Mac claim",
);

equal(
  closure.regression?.microsoft365Tests?.tests,
  69,
  "Microsoft365 test count",
);
equal(
  closure.regression?.microsoft365Tests?.pass,
  69,
  "Microsoft365 pass count",
);
equal(
  closure.regression?.microsoft365Tests?.fail,
  0,
  "Microsoft365 fail count",
);
equal(
  closure.regression?.phase9Regression,
  "pass",
  "Phase 9 regression",
);

requireText(
  manifestEvidence,
  "The manifest is valid.",
  "official Microsoft manifest validation",
);
requireText(
  phase105aNote,
  "**CLOSED — OFFICIAL MICROSOFT MANIFEST VALIDATION PASS**",
  "Phase 10.5a corrected status",
);

if (
  phase105aNote.includes(
    "command surface, WordApi 1.1 requirement, HTTPS task pane",
  )
) {
  fail(
    "Phase 10.5a note still describes WordApi 1.1 as a manifest requirement",
  );
}

requireText(
  phase105aNote,
  "runtime WordApi 1.1 gate",
  "Phase 10.5a runtime requirement wording",
);
requireText(
  rawAudit,
  "Executable gate failures: [none]",
  "Phase 10.6 executable audit",
);
requireText(
  rawAudit,
  "Windows Word/Excel/PowerPoint VERIFIED / PASS",
  "Phase 10.6 Windows audit result",
);
requireText(
  rawAudit,
  "Web/Mac EXPECTED / NOT EXECUTED",
  "Phase 10.6 deferred platform audit result",
);

if (!packageJson.scripts?.["validate:phase10-closure"]) {
  fail("Phase 10 closure validator script is not registered");
}
if (!packageJson.scripts?.["validate:phase10"]) {
  fail("Phase 10 aggregate validator script is not registered");
}

console.log("Phase 10 Microsoft 365 Full Add-in closure validation: PASS");
console.log("Phase 10.1: CLOSED");
console.log("Phase 10.2: CLOSED");
console.log("Phase 10.3: CLOSED");
console.log("Phase 10.4: CLOSED");
console.log("Phase 10.5: CLOSED");
console.log("Phase 10.6: CLOSED");
console.log("Word / Excel / PowerPoint Windows: VERIFIED / PASS");
console.log("Web / Mac: EXPECTED / NOT EXECUTED");
console.log("Boundary: Microsoft365 -> SDK -> Core");
console.log("Next: Phase 11 Microsoft Marketplace");
