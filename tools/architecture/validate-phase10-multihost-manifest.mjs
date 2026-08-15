import {
  readFile,
} from "node:fs/promises";

const root =
  new URL(
    "../../",
    import.meta.url,
  );

async function text(path) {
  return readFile(
    new URL(path, root),
    "utf8",
  );
}

function fail(message) {
  throw new Error(
    `Phase 10.5a multi-host manifest validation failed: ${message}`,
  );
}

function requireText(value, expected, label) {
  if (!value.includes(expected)) {
    fail(`${label}: missing ${JSON.stringify(expected)}`);
  }
}

function forbidText(value, forbidden, label) {
  if (value.includes(forbidden)) {
    fail(`${label}: forbidden ${JSON.stringify(forbidden)}`);
  }
}

function count(value, token) {
  return value.split(token).length - 1;
}

const manifest =
  await text(
    "integrations/microsoft365/manifest.xml",
  );

const taskpane =
  await text(
    "integrations/microsoft365/public/taskpane.html",
  );

const build =
  await text(
    "integrations/microsoft365/build-addin.mjs",
  );

const preview =
  await text(
    "integrations/microsoft365/preview-addin.mjs",
  );

const readiness =
  await text(
    "integrations/microsoft365/src/taskpane/readiness.ts",
  );

const contract =
  JSON.parse(
    await text(
      "docs/architecture/phase-10.2-shared-microsoft365-host-architecture.json",
    ),
  );

const packageJson =
  JSON.parse(
    await text(
      "package.json",
    ),
  );

if (
  contract.manifestArchitecture?.family !== "add-in-only XML" ||
  contract.manifestArchitecture?.versionOverridesStrategy !==
    "one VersionOverridesV1_0 with three host command entries"
) {
  fail(
    "manifest no longer follows the corrected Phase 10.2 architecture",
  );
}

const firstOverride =
  manifest.indexOf(
    "<VersionOverrides",
  );

if (firstOverride < 0) {
  fail("no VersionOverrides section found");
}

const base =
  manifest.slice(
    0,
    firstOverride,
  );

for (const host of ["Document", "Workbook", "Presentation"]) {
  requireText(
    base,
    `<Host Name="${host}"/>`,
    `base host ${host}`,
  );
}

for (const set of ["WordApi", "ExcelApi", "PowerPointApi"]) {
  forbidText(
    manifest,
    `Name="${set}"`,
    "application-specific API sets must be runtime-gated",
  );
}

requireText(
  base,
  "<Permissions>ReadWriteDocument</Permissions>",
  "shared read/write permission",
);

if (
  count(
    manifest,
    'xsi:type="VersionOverridesV1_0"',
  ) !== 1
) {
  fail(
    "expected exactly one VersionOverridesV1_0 section",
  );
}

requireText(
  manifest,
  '<bt:Set Name="AddinCommands" MinVersion="1.1"/>',
  "shared AddinCommands requirement",
);

for (const host of ["Document", "Workbook", "Presentation"]) {
  requireText(
    manifest,
    `<Host xsi:type="${host}">`,
    `${host} command host`,
  );
}

for (const token of [
  'id="PersianBraille.TranslateSelectionButton"',
  'id="PersianBraille.Excel.TranslateSelectionButton"',
  'id="PersianBraille.PowerPoint.TranslateSelectionButton"',
  'xsi:type="PrimaryCommandSurface"',
  '<OfficeTab id="TabHome">',
  'xsi:type="ShowTaskpane"',
  'DefaultValue="https://localhost:3000/taskpane.html"',
  'DefaultValue="https://localhost:3000/commands.html"',
]) {
  requireText(
    manifest,
    token,
    "three-host command surface",
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
    "runtime API requirement gating",
  );
}

for (const oldText of [
  "Persian-to-Braille for Word",
  "Microsoft Word Add-in",
  "Waiting for Word",
  "current Word selection",
]) {
  forbidText(
    taskpane,
    oldText,
    "host-neutral task pane",
  );
}

for (const [value, oldText, label] of [
  [build, "Word Add-in static build", "build status"],
  [preview, "Word Add-in:", "preview status"],
]) {
  forbidText(
    value,
    oldText,
    label,
  );
}

if (
  !packageJson.scripts?.["validate:phase10-multihost-manifest"]
) {
  fail(
    "root multi-host manifest validation script is not registered",
  );
}

console.log(
  "Phase 10.5a multi-host manifest static validation: PASS",
);
console.log(
  "Base hosts: Document | Workbook | Presentation",
);
console.log(
  "VersionOverrides: one V1_0 section with three Host command entries",
);
console.log(
  "Manifest requirement: AddinCommands 1.1 only",
);
console.log(
  "Runtime API gates: WordApi 1.1 | ExcelApi 1.1 | PowerPointApi 1.5",
);
console.log(
  "Permission: ReadWriteDocument",
);
console.log(
  "Official Microsoft manifest validation: REQUIRED SEPARATELY",
);
