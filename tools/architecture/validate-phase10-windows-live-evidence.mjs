import { readFile } from "node:fs/promises";

const root = new URL("../../", import.meta.url);

async function text(path) {
  return readFile(new URL(path, root), "utf8");
}

function fail(message) {
  throw new Error(
    `Phase 10.5 Windows live evidence validation failed: ${message}`,
  );
}

function equal(actual, expected, label) {
  if (actual !== expected) {
    fail(
      `${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}

function requireText(value, expected, label) {
  if (!value.includes(expected)) {
    fail(`${label}: missing ${JSON.stringify(expected)}`);
  }
}

const evidence = JSON.parse(
  await text(
    "docs/architecture/phase-10.5b-windows-live-sideload-evidence.json",
  ),
);

const manifest = await text(
  "integrations/microsoft365/manifest.xml",
);

const readiness = await text(
  "integrations/microsoft365/src/taskpane/readiness.ts",
);

const packageJson = JSON.parse(
  await text("package.json"),
);

equal(evidence.phase, "10.5b", "phase");
equal(evidence.verificationDate, "2026-08-15", "verification date");
equal(evidence.baselineCommit, "77d47b0", "baseline commit");
equal(
  evidence.addInId,
  "33ec7928-1204-5bb3-88e6-d778413e9234",
  "add-in ID",
);
equal(
  evidence.manifest?.microsoftValidator?.status,
  "pass",
  "official manifest validator",
);
equal(
  evidence.manifest?.microsoftValidator?.terminalResult,
  "The manifest is valid.",
  "official manifest terminal result",
);

const hosts = evidence.sideloadLifecycle?.hosts ?? [];
equal(hosts.length, 3, "sideload host count");

for (const expected of [
  ["word", "Word"],
  ["excel", "Excel"],
  ["powerpoint", "PowerPoint"],
]) {
  const item = hosts.find((host) => host.host === expected[0]);

  if (!item) {
    fail(`missing sideload host ${expected[0]}`);
  }

  equal(item.officeApp, expected[1], `${expected[0]} Office app`);
  equal(item.launch, "pass", `${expected[0]} launch`);
  equal(item.debuggingStarted, true, `${expected[0]} debugging`);
  equal(item.cleanup, "pass", `${expected[0]} cleanup`);
}

const word = evidence.clients?.word;
equal(word?.status, "verified-pass", "Word Windows status");
equal(word?.minimumVersion, "1.1", "WordApi baseline");

for (const key of [
  "ribbonCommand",
  "taskPaneOpen",
  "hostReadiness",
  "selectionRead",
  "sdkTranslation",
  "braillePreview",
  "copyBraille",
  "replaceSelection",
  "insertAfter",
]) {
  equal(word?.checks?.[key], "pass", `Word ${key}`);
}

equal(
  word?.checks?.staleSelectionGuard?.expectedCode,
  "SELECTION_CHANGED",
  "Word stale code",
);

const excel = evidence.clients?.excel;
equal(excel?.status, "verified-pass", "Excel Windows status");
equal(excel?.minimumVersion, "1.1", "ExcelApi baseline");

for (const key of [
  "ribbonCommand",
  "taskPaneOpen",
  "hostReadiness",
  "singlePlainTextCell",
  "sdkTranslation",
  "braillePreview",
  "copyBraille",
  "replaceSelection",
]) {
  equal(excel?.checks?.[key], "pass", `Excel ${key}`);
}

equal(
  excel?.checks?.insertAfter,
  "not-supported",
  "Excel Insert After capability",
);
equal(
  excel?.checks?.multiCellRejection?.status,
  "pass",
  "Excel multi-cell rejection",
);
equal(
  excel?.checks?.multiCellRejection?.expectedCode,
  "SELECTION_SHAPE_UNSUPPORTED",
  "Excel multi-cell code",
);
equal(
  excel?.checks?.formulaProtection?.status,
  "pass",
  "Excel formula protection",
);
equal(
  excel?.checks?.formulaProtection?.expectedCode,
  "SELECTION_CONTENT_UNSUPPORTED",
  "Excel formula code",
);
equal(
  excel?.checks?.staleSelectionGuard?.status,
  "pass",
  "Excel stale guard",
);
equal(
  excel?.checks?.staleSelectionGuard?.expectedCode,
  "SELECTION_CHANGED",
  "Excel stale code",
);

const powerpoint = evidence.clients?.powerpoint;
equal(
  powerpoint?.status,
  "verified-pass",
  "PowerPoint Windows status",
);
equal(
  powerpoint?.minimumVersion,
  "1.5",
  "PowerPointApi baseline",
);

for (const key of [
  "ribbonCommand",
  "taskPaneOpen",
  "hostReadiness",
  "selectedTextRead",
  "sdkTranslation",
  "braillePreview",
  "copyBraille",
  "replaceSelection",
]) {
  equal(powerpoint?.checks?.[key], "pass", `PowerPoint ${key}`);
}

equal(
  powerpoint?.checks?.insertAfter,
  "not-supported",
  "PowerPoint Insert After capability",
);
equal(
  powerpoint?.checks?.staleSelectionGuard?.status,
  "pass",
  "PowerPoint stale guard",
);
equal(
  powerpoint?.checks?.staleSelectionGuard?.expectedCode,
  "SELECTION_CHANGED",
  "PowerPoint stale code",
);

for (const deferred of evidence.deferredClients ?? []) {
  equal(
    deferred.status,
    "expected-not-executed",
    `${deferred.client} status`,
  );
}

equal(
  evidence.evidencePolicy?.webOrMacPassClaimAllowed,
  false,
  "Web/Mac pass claim policy",
);
equal(
  evidence.regressionSnapshot?.microsoft365Tests?.tests,
  69,
  "Microsoft365 historical test count",
);
equal(
  evidence.regressionSnapshot?.microsoft365Tests?.pass,
  69,
  "Microsoft365 historical pass count",
);
equal(
  evidence.regressionSnapshot?.microsoft365Tests?.fail,
  0,
  "Microsoft365 historical fail count",
);

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

for (const token of [
  "supportsWordApi11",
  "supportsExcelApi11",
  "supportsPowerPointApi15",
]) {
  requireText(
    readiness,
    token,
    "runtime requirement gate",
  );
}

if (
  !packageJson.scripts?.["validate:phase10-windows-live-evidence"]
) {
  fail("root live-evidence validator script is not registered");
}

console.log("Phase 10.5 Windows live evidence validation: PASS");
console.log("Word / Windows: LIVE VERIFIED / PASS");
console.log("Excel / Windows: LIVE VERIFIED / PASS");
console.log("PowerPoint / Windows: LIVE VERIFIED / PASS");
console.log("Web / Mac: EXPECTED / NOT EXECUTED");
console.log("Next: Phase 10.5d closure");
