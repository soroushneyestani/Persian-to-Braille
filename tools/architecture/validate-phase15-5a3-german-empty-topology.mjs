import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";

const repoRoot = process.cwd();

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

const topology = await readJson(topologyPath);

invariant(
  topology.schemaVersion === 1,
  "German topology schemaVersion must be 1.",
);

invariant(
  topology.phase === "15.5A3.4",
  "German topology phase must be 15.5A3.4.",
);

invariant(
  topology.status === "TOPOLOGY_ONLY",
  "German topology must remain TOPOLOGY_ONLY.",
);

invariant(
  topology.language === "de",
  "German topology language must be de.",
);

invariant(
  topology.runtimeModel ===
    "THREE_INTERNAL_EXECUTABLE_BUNDLES",
  "Unexpected German runtime model.",
);

invariant(
  JSON.stringify(
    topology.productModel?.modes,
  ) ===
    JSON.stringify([
      "basisschrift",
      "vollschrift",
      "kurzschrift",
    ]),
  "German mode inventory must be exactly Basisschrift, Vollschrift, Kurzschrift.",
);

invariant(
  topology.regionalModel?.dimension ===
    "ORTHOGONAL_OVERLAY",
  "Swiss regional behavior must remain an orthogonal overlay.",
);

invariant(
  topology.regionalModel?.swiss
    ?.isFourthGermanMode === false,
  "Swiss must not be represented as a fourth German mode.",
);

invariant(
  topology.regionalModel?.swiss
    ?.internalNormativeNamespace ===
    "DE-CH410",
  "Swiss internal normative namespace must remain DE-CH410.",
);

invariant(
  topology.regionalModel?.swiss
    ?.publicIdentifier ===
    "NOT_FROZEN",
  "Swiss public identifier must remain NOT_FROZEN.",
);

invariant(
  topology.regionalModel?.swiss
    ?.explicitEszettInputPolicy ===
    "OPEN",
  "SWISS_EXPLICIT_ESZETT_INPUT_POLICY must remain OPEN in A3.4.",
);

invariant(
  topology.identifiers
    ?.publicGermanProfileIdentifier ===
    "NOT_FROZEN",
  "German public profile identifier must remain NOT_FROZEN.",
);

const admission = topology.admissionState;

invariant(
  admission?.profiles === 0 &&
    admission?.rules === 0 &&
    admission?.regionalRules === 0 &&
    admission?.generatedRuntimeBundles === 0 &&
    admission?.mappings === 0,
  "A3.4 must admit zero executable German specification content.",
);

const runtimeManifest =
  await readJson(runtimeManifestPath);

invariant(
  Array.isArray(runtimeManifest.bundles),
  "Runtime bundle manifest must contain bundles.",
);

invariant(
  runtimeManifest.bundles.length === 1,
  "A3.4 runtime manifest must still contain exactly one bundle.",
);

invariant(
  runtimeManifest.bundles[0]?.key ===
    "fa-ir-g1",
  "A3.4 runtime manifest must still admit only fa-ir-g1.",
);

const serializedManifest =
  JSON.stringify(runtimeManifest);

invariant(
  !serializedManifest.includes(
    "spec/de/",
  ),
  "German specification must not yet be registered in the runtime bundle manifest.",
);

const generatedNames =
  (await readdir(generatedDir))
    .filter(
      (name) =>
        name.endsWith(".runtime.ts"),
    );

const germanGenerated =
  generatedNames.filter(
    (name) =>
      /^(de-|german)/i.test(name),
  );

invariant(
  germanGenerated.length === 0,
  `A3.4 must not generate German runtime bundles: ${germanGenerated.join(", ")}`,
);

console.log(
  "Phase 15.5A3.4 German empty topology validation: PASS",
);
console.log(
  "German modes: basisschrift, vollschrift, kurzschrift",
);
console.log(
  "Swiss model: ORTHOGONAL_OVERLAY",
);
console.log(
  "German profiles: 0",
);
console.log(
  "German rules: 0",
);
console.log(
  "German generated runtime bundles: 0",
);
console.log(
  "Runtime manifest admission: fa-ir-g1 only",
);
