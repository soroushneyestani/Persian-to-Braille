import {
  readFile,
  readdir,
} from "node:fs/promises";
import { resolve } from "node:path";

const repoRoot = process.cwd();

const contractPath = resolve(
  repoRoot,
  "spec/de/text-mode-contract.json",
);

const topologyPath = resolve(
  repoRoot,
  "spec/de/runtime-topology.json",
);

const runtimeManifestPath = resolve(
  repoRoot,
  "tools/architecture/runtime-spec-bundles.json",
);

const modeExecutorPath = resolve(
  repoRoot,
  "packages/core/src/mode-rule-executor.ts",
);

const generatedDir = resolve(
  repoRoot,
  "packages/core/src/generated",
);


function invariant(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}


async function readJson(path) {
  return JSON.parse(
    await readFile(path, "utf8"),
  );
}


const contract = await readJson(contractPath);
const topology = await readJson(topologyPath);
const runtimeManifest =
  await readJson(runtimeManifestPath);

const expectedModes = [
  "basisschrift",
  "vollschrift",
  "kurzschrift",
];


invariant(
  contract.schemaVersion === 1,
  "German text-mode contract schemaVersion must be 1.",
);

invariant(
  contract.phase === "15.5A4.2",
  "Unexpected German text-mode contract phase.",
);

invariant(
  contract.status === "IDENTITY_CONTRACT",
  "German text-mode contract must be IDENTITY_CONTRACT.",
);

invariant(
  contract.language === "de",
  "German text-mode contract language must be de.",
);


invariant(
  contract.contract?.internalTypeName ===
    "GermanTextMode",
  "Internal German mode type must be GermanTextMode.",
);

invariant(
  contract.contract?.semanticRole ===
    "TRANSLATION_CONFIGURATION_DIMENSION",
  "GermanTextMode must remain a translation configuration dimension.",
);

invariant(
  contract.contract?.visibility ===
    "INTERNAL_CORE_CONTRACT",
  "GermanTextMode must remain an internal Core contract.",
);


const values = contract.values;

invariant(
  Array.isArray(values),
  "German text-mode values must be an array.",
);

const modeKeys = values.map(
  (item) => item?.key,
);

invariant(
  JSON.stringify(modeKeys) ===
    JSON.stringify(expectedModes),
  `Unexpected GermanTextMode keys: ${JSON.stringify(modeKeys)}`,
);


const topologyModes =
  topology.productModel?.modes;

invariant(
  JSON.stringify(topologyModes) ===
    JSON.stringify(expectedModes),
  "German mode identity contract diverges from frozen A3 topology.",
);


const selection = contract.selection ?? {};

invariant(
  selection.cardinality ===
    "EXACTLY_ONE_PER_TRANSLATION_REQUEST",
  "German text-mode cardinality must be exactly one per translation request.",
);

invariant(
  selection.explicitSelectionRequired === true,
  "German text-mode selection must be explicit.",
);

invariant(
  selection.implicitDefaultAllowed === false,
  "German Core mode identity contract must not authorize an implicit default.",
);

invariant(
  selection.multipleModesAllowed === false,
  "Multiple German text modes must not be selected simultaneously.",
);

invariant(
  selection.caseSensitiveKeys === true,
  "Canonical GermanTextMode keys must remain case-sensitive.",
);


const separation =
  contract.semanticSeparation ?? {};

invariant(
  separation.existingRuleTypeMode ===
    "STRUCTURAL_ENGINE_RULE",
  "Existing rule type mode must remain structural-engine semantics.",
);

invariant(
  separation.existingExecutor ===
    "ModeRuleExecutor",
  "Unexpected existing structural mode executor identity.",
);

invariant(
  separation.existingExecutorMaySelectGermanTextMode ===
    false,
  "ModeRuleExecutor must not become the German text-mode selector.",
);

invariant(
  separation.sameConcept === false,
  "Structural mode rules and GermanTextMode must remain distinct concepts.",
);


const regional =
  contract.regionalSeparation ?? {};

invariant(
  regional.swissIsGermanTextMode === false,
  "Swiss must not become a GermanTextMode value.",
);

invariant(
  regional.swissDimension ===
    "ORTHOGONAL_REGIONAL_CONFIGURATION",
  "Swiss must remain an orthogonal regional dimension.",
);

invariant(
  regional.swissExplicitEszettInputPolicy ===
    "OPEN",
  "A4.2 must not resolve SWISS_EXPLICIT_ESZETT_INPUT_POLICY.",
);

invariant(
  !modeKeys.includes("swiss") &&
    !modeKeys.includes("de-ch") &&
    !modeKeys.includes("ch"),
  "Swiss identifiers must not appear in GermanTextMode.",
);


const identifiers =
  contract.identifierPolicy ?? {};

invariant(
  identifiers.internalModeKeysFrozenByThisContract ===
    true,
  "A4.2 must freeze the internal German mode keys.",
);

invariant(
  identifiers.publicGermanProfileIdentifier ===
    "NOT_FROZEN",
  "A4.2 must not freeze the public German profile identifier.",
);

invariant(
  identifiers.publicSwissProfileIdentifier ===
    "NOT_FROZEN",
  "A4.2 must not freeze the public Swiss identifier.",
);

invariant(
  identifiers.publicSdkModeApi ===
    "NOT_FROZEN",
  "A4.2 must not define the public SDK mode API.",
);


const admission =
  contract.admissionState ?? {};

for (const field of [
  "germanProfiles",
  "germanRules",
  "germanMappings",
  "germanGeneratedRuntimeBundles",
]) {
  invariant(
    admission[field] === 0,
    `${field} must remain zero during A4.2.`,
  );
}


const manifestBundles =
  runtimeManifest.bundles;

invariant(
  Array.isArray(manifestBundles) &&
    manifestBundles.length === 1 &&
    manifestBundles[0]?.key === "fa-ir-g1",
  "A4.2 must not admit a German runtime bundle.",
);

invariant(
  !JSON.stringify(runtimeManifest).includes(
    "spec/de/",
  ),
  "A4.2 must not register German runtime specification paths.",
);


const generatedFiles =
  await readdir(generatedDir);

const germanGenerated =
  generatedFiles.filter(
    (name) =>
      name.endsWith(".runtime.ts") &&
      (
        name.startsWith("de-") ||
        name.startsWith("german")
      ),
  );

invariant(
  germanGenerated.length === 0,
  `German generated runtime bundle admitted too early: ${germanGenerated.join(", ")}`,
);


const modeExecutor =
  await readFile(
    modeExecutorPath,
    "utf8",
  );

invariant(
  !modeExecutor.includes(
    "GermanTextMode",
  ),
  "A4.2 must not couple GermanTextMode to ModeRuleExecutor.",
);


console.log(
  "Phase 15.5A4.2 German mode identity validation: PASS",
);

console.log(
  `Internal type: ${contract.contract.internalTypeName}`,
);

console.log(
  `Mode keys: ${modeKeys.join(", ")}`,
);

console.log(
  "Selection cardinality: EXACTLY_ONE_PER_TRANSLATION_REQUEST",
);

console.log(
  "Implicit default: FORBIDDEN",
);

console.log(
  "Structural ModeRuleExecutor reuse: FORBIDDEN",
);

console.log(
  "Swiss fourth mode: FALSE",
);

console.log(
  "German profiles: 0",
);

console.log(
  "German rules: 0",
);

console.log(
  "German mappings: 0",
);

console.log(
  "German generated runtime bundles: 0",
);

console.log(
  "Public SDK mode API: NOT_FROZEN",
);
