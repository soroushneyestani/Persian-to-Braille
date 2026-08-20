import {
  readFile,
  readdir,
} from "node:fs/promises";
import { resolve } from "node:path";

const repoRoot = process.cwd();

const contractPath = resolve(
  repoRoot,
  "spec/de/text-mode-materialization-contract.json",
);

const identityPath = resolve(
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
const identity = await readJson(identityPath);
const topology = await readJson(topologyPath);
const runtimeManifest =
  await readJson(runtimeManifestPath);


const expectedModes = [
  "basisschrift",
  "vollschrift",
  "kurzschrift",
];

const expectedEffectiveLayers = {
  basisschrift: [
    "basisschrift",
  ],
  vollschrift: [
    "basisschrift",
    "vollschrift",
  ],
  kurzschrift: [
    "basisschrift",
    "vollschrift",
    "kurzschrift",
  ],
};


invariant(
  contract.schemaVersion === 1,
  "German materialization contract schemaVersion must be 1.",
);

invariant(
  contract.phase === "15.5A4.3",
  "Unexpected German materialization contract phase.",
);

invariant(
  contract.status ===
    "MATERIALIZATION_CONTRACT",
  "German mode materialization contract status is invalid.",
);

invariant(
  contract.language === "de",
  "German materialization contract language must be de.",
);


const identityModes = identity.values.map(
  (item) => item?.key,
);

invariant(
  JSON.stringify(identityModes) ===
    JSON.stringify(expectedModes),
  "A4.3 diverges from the A4.2 GermanTextMode identity contract.",
);

invariant(
  JSON.stringify(
    topology.productModel?.modes,
  ) === JSON.stringify(expectedModes),
  "A4.3 diverges from frozen A3 German topology.",
);


const semantic =
  contract.semanticModel ?? {};

invariant(
  semantic.inheritanceMeaning ===
    "SPECIFICATION_MATERIALIZATION",
  "German mode inheritance must mean specification materialization.",
);

invariant(
  semantic.runtimeExecutionModel ===
    "ONE_EFFECTIVE_BUNDLE_PER_SELECTED_MODE",
  "German runtime must execute one effective bundle per selected mode.",
);

invariant(
  semantic.runtimeParentFallbackChainAllowed ===
    false,
  "Runtime parent-bundle fallback chaining is forbidden.",
);

invariant(
  semantic.translatorChainingAllowed ===
    false,
  "German text modes must not be implemented as chained translators.",
);


const modeRecords =
  contract.modes;

invariant(
  Array.isArray(modeRecords) &&
    modeRecords.length === 3,
  "Exactly three German materialization mode records are required.",
);

const modeKeys = modeRecords.map(
  (item) => item?.mode,
);

invariant(
  JSON.stringify(modeKeys) ===
    JSON.stringify(expectedModes),
  "Unexpected German materialization mode order.",
);


for (const record of modeRecords) {
  const expected =
    expectedEffectiveLayers[record.mode];

  invariant(
    expected !== undefined,
    `Unknown German mode ${record.mode}.`,
  );

  invariant(
    JSON.stringify(
      record.effectiveLayers,
    ) === JSON.stringify(expected),
    `Unexpected effective layers for ${record.mode}.`,
  );

  invariant(
    record.effectiveLayers.at(-1) ===
      record.mode,
    `The most-specific materialized layer must be ${record.mode}.`,
  );

  invariant(
    new Set(
      record.effectiveLayers,
    ).size === record.effectiveLayers.length,
    `Duplicate materialization layer detected for ${record.mode}.`,
  );
}


const directParents = Object.fromEntries(
  modeRecords.map(
    (item) => [
      item.mode,
      item.directParents,
    ],
  ),
);

invariant(
  JSON.stringify(
    directParents.basisschrift,
  ) === JSON.stringify([]),
  "Basisschrift must have no direct parent.",
);

invariant(
  JSON.stringify(
    directParents.vollschrift,
  ) === JSON.stringify([
    "basisschrift",
  ]),
  "Vollschrift must directly inherit Basisschrift.",
);

invariant(
  JSON.stringify(
    directParents.kurzschrift,
  ) === JSON.stringify([
    "vollschrift",
  ]),
  "Kurzschrift must directly inherit Vollschrift.",
);


const topologyInheritance =
  topology.inheritanceModel ?? [];

const topologyEffectiveParents =
  Object.fromEntries(
    topologyInheritance.map(
      (item) => [
        item.mode,
        item.inherits,
      ],
    ),
  );

invariant(
  JSON.stringify(
    topologyEffectiveParents.basisschrift,
  ) === JSON.stringify([]),
  "A3 Basisschrift inheritance changed.",
);

invariant(
  JSON.stringify(
    topologyEffectiveParents.vollschrift,
  ) === JSON.stringify([
    "basisschrift",
  ]),
  "A3 Vollschrift inheritance changed.",
);

invariant(
  JSON.stringify(
    topologyEffectiveParents.kurzschrift,
  ) === JSON.stringify([
    "basisschrift",
    "vollschrift",
  ]),
  "A3 Kurzschrift inheritance changed.",
);


const materialization =
  contract.materialization ?? {};

invariant(
  materialization.layerOrder ===
    "BASE_TO_MOST_SPECIFIC",
  "Materialization layer order must remain base-to-most-specific.",
);

invariant(
  materialization.outputCardinality ===
    "ONE_EFFECTIVE_SPECIFICATION",
  "Materialization must produce exactly one effective specification.",
);

invariant(
  materialization.selfContainedEffectiveSpecificationRequired ===
    true,
  "Each materialized German specification must be self-contained.",
);

invariant(
  materialization.runtimeDependencyOnParentBundle ===
    false,
  "A materialized German runtime must not depend on a parent runtime bundle.",
);


const ruleIdPolicy =
  materialization.canonicalRuleIdPolicy ?? {};

invariant(
  ruleIdPolicy.duplicateRuleIdAcrossLayersAllowed ===
    false,
  "Duplicate canonical rule IDs across layers are forbidden.",
);

invariant(
  ruleIdPolicy.implicitReplacementByRuleIdAllowed ===
    false,
  "Implicit rule replacement by canonical ID is forbidden.",
);


const overlap =
  materialization.semanticOverlapPolicy ?? {};

invariant(
  overlap.inheritanceOrderDefinesRuntimePrecedence ===
    false,
  "Inheritance order must not silently define runtime precedence.",
);

invariant(
  overlap.lastWriteWinsAllowed ===
    false,
  "Last-write-wins materialization is forbidden.",
);

invariant(
  overlap.implicitChildOverrideAllowed ===
    false,
  "Implicit child-layer override is forbidden.",
);

invariant(
  overlap.unresolvedEqualPrecedenceOverlap ===
    "REJECT",
  "Unresolved equal-precedence overlap must be rejected.",
);

const mechanisms =
  overlap.resolutionMechanism;

invariant(
  JSON.stringify(mechanisms) ===
    JSON.stringify([
      "EXPLICIT_CANONICAL_RULE_PRIORITY",
      "EXPLICIT_RULE_APPLICABILITY",
      "SEMANTIC_VALIDATION",
    ]),
  "Unexpected semantic-overlap resolution mechanism.",
);


const missingMatch =
  materialization.missingMatchPolicy ?? {};

invariant(
  missingMatch.dynamicParentBundleFallbackAllowed ===
    false,
  "Dynamic parent-bundle fallback must remain forbidden.",
);

invariant(
  missingMatch.behavior ===
    "FAIL_CLOSED_ACCORDING_TO_EFFECTIVE_PROFILE",
  "Unexpected German missing-match policy.",
);


const topologyRelation =
  contract.topologyRelationship ?? {};

invariant(
  topologyRelation.runtimeModel ===
    "THREE_INTERNAL_EXECUTABLE_BUNDLES",
  "A4.3 must preserve the frozen A3 runtime model.",
);

invariant(
  topologyRelation.selectedModeProducesExactlyOneInternalBundle ===
    true,
  "Each selected mode must resolve to one internal runtime bundle.",
);

invariant(
  topologyRelation.generatedRuntimeFilenamesFrozenHere ===
    false,
  "A4.3 must not freeze generated runtime filenames.",
);

invariant(
  topologyRelation.publicProfileIdentifiersFrozenHere ===
    false,
  "A4.3 must not freeze public German profile identifiers.",
);


const regional =
  contract.regionalSeparation ?? {};

invariant(
  regional.swissParticipatesInModeInheritance ===
    false,
  "Swiss must not participate in German text-mode inheritance.",
);

invariant(
  regional.swissDimension ===
    "ORTHOGONAL_REGIONAL_CONFIGURATION",
  "Swiss must remain an orthogonal regional dimension.",
);

invariant(
  regional.swissExplicitEszettInputPolicy ===
    "OPEN",
  "A4.3 must not resolve SWISS_EXPLICIT_ESZETT_INPUT_POLICY.",
);


const admission =
  contract.admissionState ?? {};

for (const field of [
  "germanProfiles",
  "germanRules",
  "germanMappings",
  "germanGeneratedRuntimeBundles",
  "germanExecutableMaterializations",
]) {
  invariant(
    admission[field] === 0,
    `${field} must remain zero during A4.3.`,
  );
}


const bundles =
  runtimeManifest.bundles;

invariant(
  Array.isArray(bundles) &&
    bundles.length === 1 &&
    bundles[0]?.key === "fa-ir-g1",
  "A4.3 must not admit German runtime bundles.",
);

invariant(
  !JSON.stringify(runtimeManifest).includes(
    "spec/de/",
  ),
  "A4.3 must not register German runtime specification paths.",
);


const generatedFiles =
  await readdir(generatedDir);

const germanRuntimeFiles =
  generatedFiles.filter(
    (name) =>
      name.endsWith(".runtime.ts") &&
      (
        name.startsWith("de-") ||
        name.startsWith("german")
      ),
  );

invariant(
  germanRuntimeFiles.length === 0,
  `German runtime generated too early: ${germanRuntimeFiles.join(", ")}`,
);


console.log(
  "Phase 15.5A4.3 German mode materialization validation: PASS",
);

console.log(
  "Inheritance meaning: SPECIFICATION_MATERIALIZATION",
);

console.log(
  "Basisschrift layers: basisschrift",
);

console.log(
  "Vollschrift layers: basisschrift, vollschrift",
);

console.log(
  "Kurzschrift layers: basisschrift, vollschrift, kurzschrift",
);

console.log(
  "Runtime execution: ONE_EFFECTIVE_BUNDLE_PER_SELECTED_MODE",
);

console.log(
  "Runtime parent fallback chain: FORBIDDEN",
);

console.log(
  "Last-write-wins: FORBIDDEN",
);

console.log(
  "Duplicate canonical rule IDs across layers: FORBIDDEN",
);

console.log(
  "Implicit child override: FORBIDDEN",
);

console.log(
  "Swiss participates in mode inheritance: FALSE",
);

console.log(
  "German executable materializations: 0",
);
