import { readFile } from "node:fs/promises";

const root = new URL("../../", import.meta.url);

const data = JSON.parse(
  await readFile(
    new URL(
      "docs/architecture/phase-10.1-excel-powerpoint-baseline-audit.json",
      root,
    ),
    "utf8",
  ),
);

const manifest = await readFile(
  new URL("integrations/microsoft365/manifest.xml", root),
  "utf8",
);

const packageJson = JSON.parse(
  await readFile(new URL("package.json", root), "utf8"),
);

function fail(message) {
  throw new Error(`Phase 10.1 baseline validation failed: ${message}`);
}

function equal(actual, expected, label) {
  if (actual !== expected) {
    fail(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

equal(data.schemaVersion, "1", "schemaVersion");
equal(data.phase, "10.1", "phase");
equal(
  data.currentMicrosoft365State?.package,
  "@persian-braille/microsoft365",
  "Microsoft 365 package",
);
equal(
  data.currentMicrosoft365State?.sdkDependency,
  "@persian-braille/sdk",
  "SDK boundary",
);
equal(
  data.currentMicrosoft365State?.excelRuntimeImplemented,
  false,
  "Excel implementation baseline",
);
equal(
  data.currentMicrosoft365State?.powerPointRuntimeImplemented,
  false,
  "PowerPoint implementation baseline",
);
equal(
  data.phase10ProductionManifestDecision?.format,
  "add-in-only XML",
  "manifest family",
);
equal(data.minimumHostApiBaselines?.word?.set, "WordApi", "Word requirement set");
equal(data.minimumHostApiBaselines?.word?.minVersion, "1.1", "Word requirement version");
equal(data.minimumHostApiBaselines?.excel?.set, "ExcelApi", "Excel requirement set");
equal(data.minimumHostApiBaselines?.excel?.minVersion, "1.1", "Excel requirement version");
equal(
  data.minimumHostApiBaselines?.powerPoint?.set,
  "PowerPointApi",
  "PowerPoint requirement set",
);
equal(
  data.minimumHostApiBaselines?.powerPoint?.minVersion,
  "1.5",
  "PowerPoint requirement version",
);

if (!manifest.includes('<Host Name="Document"/>')) {
  fail("Phase 9 Word manifest baseline is no longer present during Phase 10.1.");
}

if (!manifest.includes('<Set Name="WordApi" MinVersion="1.1"/>')) {
  fail("Phase 9 WordApi 1.1 baseline changed before Phase 10.2.");
}

if (
  manifest.includes('Name="ExcelApi"') ||
  manifest.includes('Name="PowerPointApi"')
) {
  fail("Phase 10.1 must not implement Excel/PowerPoint manifest requirements yet.");
}

const openIds = new Set(
  data.openDecisionsForPhase10_2.map((item) => item.id),
);

for (const id of [
  "P10-ARCH-001",
  "P10-ARCH-002",
  "P10-ARCH-003",
  "P10-ARCH-004",
  "P10-ARCH-005",
]) {
  if (!openIds.has(id)) {
    fail(`missing Phase 10.2 handoff decision ${id}`);
  }
}

if (!packageJson.scripts?.["validate:phase10-office-baseline"]) {
  fail("root validation script is not registered");
}

console.log("Phase 10.1 Excel / PowerPoint baseline validation: PASS");
console.log("Current implementation: Word only");
console.log("Production manifest family: add-in-only XML");
console.log("Word baseline: WordApi 1.1");
console.log("Excel baseline: ExcelApi 1.1");
console.log("PowerPoint baseline: PowerPointApi 1.5");
console.log("Next: Phase 10.2 shared host architecture");
