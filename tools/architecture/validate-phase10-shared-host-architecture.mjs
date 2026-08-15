import { readFile } from "node:fs/promises";

const root = new URL("../../", import.meta.url);

const contract = JSON.parse(
  await readFile(
    new URL(
      "docs/architecture/phase-10.2-shared-microsoft365-host-architecture.json",
      root,
    ),
    "utf8",
  ),
);

const packageJson = JSON.parse(
  await readFile(new URL("package.json", root), "utf8"),
);

function fail(message) {
  throw new Error(`Phase 10.2 architecture validation failed: ${message}`);
}

function equal(actual, expected, label) {
  if (actual !== expected) {
    fail(
      `${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}

equal(contract.schemaVersion, "1", "schemaVersion");
equal(contract.phase, "10.2", "phase");
equal(
  contract.architecture?.sdkIsOnlyTranslationDependency,
  true,
  "SDK-only translation boundary",
);
equal(
  contract.architecture?.coreDirectAccessFromMicrosoft365Forbidden,
  true,
  "Core direct-access prohibition",
);

for (const [host, set, version] of [
  ["word", "WordApi", "1.1"],
  ["excel", "ExcelApi", "1.1"],
  ["powerpoint", "PowerPointApi", "1.5"],
]) {
  equal(
    contract.hostProfiles?.[host]?.requirementSet,
    set,
    `${host} requirement set`,
  );
  equal(
    contract.hostProfiles?.[host]?.minimumVersion,
    version,
    `${host} requirement version`,
  );
}

equal(
  contract.hostProfiles?.excel?.selectionModel,
  "single-cell-plain-text-only",
  "Excel selection contract",
);
equal(
  contract.hostProfiles?.excel?.phase10Actions?.insertAfter,
  false,
  "Excel Insert After",
);
equal(
  contract.hostProfiles?.powerpoint?.phase10Actions?.insertAfter,
  false,
  "PowerPoint Insert After",
);
equal(
  contract.hostProfiles?.word?.phase10Actions?.insertAfter,
  true,
  "Word Insert After regression contract",
);

equal(
  contract.manifestArchitecture?.family,
  "add-in-only XML",
  "manifest family",
);
equal(
  contract.manifestArchitecture?.versionOverridesStrategy,
  "one sibling VersionOverridesV1_0 per Office application",
  "VersionOverrides strategy",
);
equal(
  contract.manifestArchitecture?.officialManifestValidationRequiredBeforeAcceptance,
  true,
  "official manifest validator gate",
);

if (!packageJson.scripts?.["validate:phase10-shared-host-architecture"]) {
  fail("root validation script is not registered");
}

// Phase 10.2 validates the frozen architecture contract only.
// Later implementation phases are allowed to materialize Excel and PowerPoint
// source trees as long as they preserve this contract.

console.log("Phase 10.2 shared Microsoft 365 host architecture: PASS");
console.log("Word: WordApi 1.1 | Replace + Insert After");
console.log("Excel: ExcelApi 1.1 | single text cell | Replace only");
console.log("PowerPoint: PowerPointApi 1.5 | selected text | Replace only");
console.log("Manifest: add-in-only XML | host-scoped VersionOverrides");
console.log("Translation boundary: Microsoft365 -> SDK -> Core");
console.log("Contract scope: frozen host architecture; later implementations are allowed.");
