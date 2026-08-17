import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");

async function text(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

async function json(relativePath) {
  return JSON.parse(await text(relativePath));
}

const contract = await json(
  "docs/architecture/phase-12.2-developer-sdk-contract.json",
);
const note = await text(
  "docs/architecture/phase-12.2-developer-sdk-contract.md",
);
const correction = await json(
  "docs/architecture/phase-12.1a-developer-ecosystem-baseline-correction.json",
);
const sdkPackage = await json("packages/sdk/package.json");
const corePackage = await json("packages/core/package.json");
const sdkIndex = await text("packages/sdk/src/index.ts");
const packageJson = await json("package.json");

assert.equal(contract.schemaVersion, 1);
assert.equal(contract.phase, "12.2");
assert.equal(contract.status, "FROZEN");
assert.equal(
  contract.baseline.head,
  "77b7b20f66e9fcd758d6cca36aa76749667ac13c",
);

assert.equal(correction.conclusions.cliLocationCorrected, true);
assert.equal(correction.conclusions.microsoft365SourceBoundaryPass, true);
assert.equal(correction.conclusions.sdkAlreadyPublicPackageShape, true);
assert.equal(correction.conclusions.coreAlreadyPublicPackageShape, true);
assert.equal(correction.conclusions.dedicatedExamplesGap, true);

assert.equal(sdkPackage.private, false);
assert.equal(corePackage.private, false);
assert.equal(sdkPackage.publishConfig.access, "public");
assert.equal(corePackage.publishConfig.access, "public");
assert.equal(sdkPackage.license, "MIT");
assert.equal(corePackage.license, "MIT");

const runtimeExports = [
  "PersianBrailleTranslationError",
  "createPersianBrailleTranslator",
];
const typeExports = [
  "CreatePersianBrailleTranslator",
  "PersianBrailleProfileInfo",
  "PersianBrailleTranslationErrorData",
  "PersianBrailleTranslationFailure",
  "PersianBrailleTranslationFailureCode",
  "PersianBrailleTranslationResult",
  "PersianBrailleTranslationSuccess",
  "PersianBrailleTranslator",
  "PersianBrailleUnicodeLocation",
];

assert.deepEqual(contract.sdk.runtimeExports, runtimeExports);
assert.deepEqual(contract.sdk.typeExports, typeExports);

for (const symbol of [...runtimeExports, ...typeExports]) {
  assert.ok(sdkIndex.includes(symbol), `SDK export missing: ${symbol}`);
}

assert.equal(
  contract.architecture.dependencyDirection,
  "Consumer -> Public SDK -> Core",
);
assert.equal(
  contract.architecture.officeDirectCoreSourceImportsAllowed,
  false,
);
assert.equal(contract.architecture.deepImportsFromSdkAllowed, false);

const microsoftSourceRoot = path.join(
  root,
  "integrations/microsoft365/src",
);
const sourceEntries = await readdir(microsoftSourceRoot, {
  recursive: true,
  withFileTypes: true,
});
for (const entry of sourceEntries) {
  if (!entry.isFile() || !entry.name.endsWith(".ts")) continue;
  const full = path.join(entry.parentPath, entry.name);
  const relative = path.relative(root, full).replaceAll("\\", "/");
  const source = await readFile(full, "utf8");
  assert.ok(
    !source.includes("@persian-braille/core"),
    `Microsoft365 source directly imports Core: ${relative}`,
  );
}

assert.equal(contract.examplesArchitecture.root, "examples");
assert.equal(contract.examplesArchitecture.implementationPhase, "12.3");
assert.deepEqual(
  contract.examplesArchitecture.required.map((x) => x.id),
  [
    "node-basic",
    "browser-basic",
    "error-handling",
    "integration-adapter",
  ],
);

assert.equal(
  contract.packageConsumerValidation.implementationPhase,
  "12.4",
);

assert.equal(
  contract.scopeGuard.reverseTranslation,
  "DEFERRED_TO_PHASE_13",
);
assert.equal(
  contract.scopeGuard.brailleMusic,
  "DEFERRED_TO_PHASE_14",
);
assert.equal(
  contract.scopeGuard.generalMultilanguageFramework,
  "DEFERRED_TO_PHASE_15",
);
assert.equal(
  contract.scopeGuard.officeWeb,
  "DEFERRED_TO_PHASE_16",
);
assert.equal(
  contract.scopeGuard.officeMac,
  "DEFERRED_TO_PHASE_17",
);
assert.equal(
  contract.scopeGuard.marketplacePublication,
  "DEFERRED_TO_PHASE_18",
);

for (const requiredText of [
  "Consumer / Integration",
  "@persian-braille/sdk",
  "@persian-braille/core",
  "examples/",
  "node-basic",
  "browser-basic",
  "error-handling",
  "integration-adapter",
  "Packed consumer validation",
  "Phase 13",
  "Phase 18",
]) {
  assert.ok(
    note.includes(requiredText),
    `Phase 12.2 note missing: ${requiredText}`,
  );
}

assert.equal(
  packageJson.scripts["validate:phase12-2"],
  "node tools/architecture/validate-phase12-2-developer-sdk-contract.mjs",
);

console.log("Phase 12.2 Developer SDK Contract: PASS");
console.log("SDK public contract: FROZEN");
console.log("Office source boundary: Office -> SDK -> Core / PASS");
console.log("CLI surface: apps/cli / PRESENT");
console.log("Core package shape: PUBLIC / PASS");
console.log("SDK package shape: PUBLIC / PASS");
console.log("Dedicated examples: REQUIRED IN PHASE 12.3");
console.log("Packed consumer validation: REQUIRED IN PHASE 12.4");
console.log("Reverse translation: DEFERRED TO PHASE 13");
console.log("Braille Music: DEFERRED TO PHASE 14");
console.log("General framework: DEFERRED TO PHASE 15");
console.log("Office Web: DEFERRED TO PHASE 16");
console.log("Office Mac: DEFERRED TO PHASE 17");
console.log("Marketplace: DEFERRED TO PHASE 18");
