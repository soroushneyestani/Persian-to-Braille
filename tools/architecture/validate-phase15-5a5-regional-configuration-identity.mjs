import {
  readFile,
  readdir,
} from "node:fs/promises";

import {
  resolve,
} from "node:path";


const repoRoot = process.cwd();

const contractPath = resolve(
  repoRoot,
  "spec/de/regional-configuration-contract.json",
);

const a51Path = resolve(
  repoRoot,
  "docs/architecture/phase-15.5a5-1-existing-regional-machinery-audit.json",
);

const topologyPath = resolve(
  repoRoot,
  "spec/de/runtime-topology.json",
);

const textModePath = resolve(
  repoRoot,
  "spec/de/text-mode-contract.json",
);

const manifestPath = resolve(
  repoRoot,
  "tools/architecture/runtime-spec-bundles.json",
);

const generatedDir = resolve(
  repoRoot,
  "packages/core/src/generated",
);

const coreSrcDir = resolve(
  repoRoot,
  "packages/core/src",
);


function invariant(
  condition,
  message,
) {
  if (!condition) {
    throw new Error(message);
  }
}


async function readJson(path) {
  return JSON.parse(
    await readFile(
      path,
      "utf8",
    ),
  );
}


const contract =
  await readJson(contractPath);

const a51 =
  await readJson(a51Path);

const topology =
  await readJson(topologyPath);

const textMode =
  await readJson(textModePath);

const manifest =
  await readJson(manifestPath);


invariant(
  contract.schemaVersion === 1,
  "Regional configuration contract schemaVersion must be 1.",
);

invariant(
  contract.phase === "15.5A5.2",
  "Unexpected A5.2 phase.",
);

invariant(
  contract.status === "IDENTITY_CONTRACT",
  "A5.2 must remain an identity contract.",
);

invariant(
  contract.language === "de",
  "A5.2 language must be de.",
);


invariant(
  contract.contract?.internalTypeName ===
    "GermanRegionalConfiguration",
  "Internal regional type must be GermanRegionalConfiguration.",
);

invariant(
  contract.contract?.overlayTypeName ===
    "GermanRegionalOverlay",
  "Internal overlay type must be GermanRegionalOverlay.",
);

invariant(
  contract.contract?.semanticRole ===
    "ORTHOGONAL_REGIONAL_CONFIGURATION_DIMENSION",
  "Regional configuration semantic role changed.",
);

invariant(
  contract.contract?.visibility ===
    "INTERNAL_CORE_CONTRACT",
  "A5.2 must remain an internal Core contract.",
);


const representation =
  contract.representation ?? {};

invariant(
  representation.configurationShape?.overlay ===
    "GermanRegionalOverlay | null",
  "Unexpected regional configuration shape.",
);

invariant(
  representation.baseConfiguration?.overlay ===
    null,
  "Base German regional configuration must use null overlay.",
);

invariant(
  representation.baseConfiguration?.meaning ===
    "NO_REGIONAL_OVERLAY",
  "Unexpected base regional configuration semantics.",
);


const overlays =
  representation.supportedOverlays;

invariant(
  Array.isArray(overlays)
  && overlays.length === 1
  && overlays[0]?.key === "swiss",
  "A5.2 must freeze exactly one current regional overlay: swiss.",
);

invariant(
  overlays[0]?.meaning ===
    "SWISS_REGIONAL_OVERLAY",
  "Unexpected Swiss overlay semantics.",
);


const selection =
  contract.selection ?? {};

invariant(
  selection.configurationCardinality ===
    "EXACTLY_ONE_PER_GERMAN_TRANSLATION_REQUEST",
  "Exactly one regional configuration must be supplied per German request.",
);

invariant(
  selection.explicitConfigurationRequired ===
    true,
  "German regional configuration must be explicit.",
);

invariant(
  selection.implicitDefaultAllowed ===
    false,
  "A5.2 must not authorize an implicit regional default.",
);

invariant(
  selection.overlayCardinality ===
    "ZERO_OR_ONE",
  "German regional overlay cardinality must be zero-or-one.",
);

invariant(
  selection.multipleOverlaysAllowed ===
    false,
  "Multiple German regional overlays are not admitted.",
);


const separation =
  contract.semanticSeparation ?? {};

invariant(
  separation.independentFromGermanTextMode ===
    true,
  "Regional configuration must remain independent from GermanTextMode.",
);

invariant(
  separation.swissIsGermanTextMode ===
    false,
  "Swiss must not become GermanTextMode.",
);

invariant(
  separation.swissIsFourthGermanMode ===
    false,
  "Swiss must not become a fourth German mode.",
);

invariant(
  separation.persianProfileRegionMetadataReusableAsSelector ===
    false,
  "Persian profile.region metadata must not become the German selector.",
);

invariant(
  separation.deCh410IsConfigurationKey ===
    false,
  "DE-CH410 must not become a regional configuration key.",
);

invariant(
  separation.deCh410Meaning ===
    "INTERNAL_NORMATIVE_RULE_NAMESPACE",
  "DE-CH410 namespace semantics changed.",
);


invariant(
  a51.status === "CLOSED",
  "A5.1 audit is not closed.",
);

invariant(
  a51.existingCoreState?.germanRegionalSelector ===
    "NONE",
  "A5.1 German regional selector state changed.",
);

invariant(
  a51.reuseDecisions?.reuseDE_CH410AsConfigurationKey ===
    "FORBIDDEN",
  "A5.1 DE-CH410 reuse constraint changed.",
);


invariant(
  topology.regionalModel?.dimension ===
    "ORTHOGONAL_OVERLAY",
  "Frozen A3 regional topology changed.",
);

invariant(
  topology.regionalModel?.swiss?.isFourthGermanMode ===
    false,
  "Frozen A3 Swiss mode separation changed.",
);

invariant(
  topology.regionalModel?.swiss?.explicitEszettInputPolicy ===
    "OPEN",
  "A5.2 must not resolve Swiss explicit Eszett behavior.",
);

invariant(
  topology.regionalModel?.swiss?.publicIdentifier ===
    "NOT_FROZEN",
  "A5.2 must not freeze the Swiss public identifier.",
);


invariant(
  textMode.regionalSeparation?.swissIsGermanTextMode ===
    false,
  "A4 text-mode/regional separation changed.",
);


const identifierPolicy =
  contract.identifierPolicy ?? {};

invariant(
  identifierPolicy.internalOverlayKeyFrozenByThisContract ===
    true,
  "A5.2 must freeze the internal swiss overlay key.",
);

for (const field of [
  "publicGermanProfileIdentifier",
  "publicSwissProfileIdentifier",
  "publicLocaleIdentifier",
  "publicSdkRegionalApi",
]) {
  invariant(
    identifierPolicy[field] ===
      "NOT_FROZEN",
    `${field} must remain NOT_FROZEN.`,
  );
}


const runtime =
  contract.runtimePolicy ?? {};

invariant(
  runtime.regionalOverlayExecution ===
    "DEFERRED",
  "A5.2 must not execute regional overlays.",
);

invariant(
  runtime.swissExplicitEszettInputPolicy ===
    "OPEN",
  "A5.2 must not resolve SWISS_EXPLICIT_ESZETT_INPUT_POLICY.",
);

invariant(
  runtime.swissExplicitEszettDecisionOwner ===
    "15.5A6",
  "Swiss explicit Eszett decision owner changed.",
);


const forbiddenAliases =
  new Set(
    contract.forbiddenAliases ?? [],
  );

for (const alias of [
  "de-ch",
  "DE-CH410",
  "ch",
  "base",
  "standard",
  "default",
]) {
  invariant(
    forbiddenAliases.has(alias),
    `Missing forbidden regional alias: ${alias}`,
  );
}


const admission =
  contract.admissionState ?? {};

for (const field of [
  "germanProfiles",
  "germanRules",
  "germanRegionalRules",
  "germanMappings",
  "germanGeneratedRuntimeBundles",
  "swissExecutableRuntimeBehavior",
]) {
  invariant(
    admission[field] === 0,
    `${field} must remain zero during A5.2.`,
  );
}


const bundles =
  manifest.bundles;

invariant(
  Array.isArray(bundles)
  && bundles.length === 1
  && bundles[0]?.key === "fa-ir-g1",
  "A5.2 must not admit German runtime bundles.",
);

invariant(
  !JSON.stringify(manifest).includes(
    "spec/de/",
  ),
  "A5.2 must not register German runtime specification paths.",
);


const generatedFiles =
  await readdir(generatedDir);

const germanRuntimeFiles =
  generatedFiles.filter(
    (name) =>
      name.endsWith(".runtime.ts")
      && (
        name.startsWith("de-")
        || name.startsWith("german")
      ),
  );

invariant(
  germanRuntimeFiles.length === 0,
  `German runtime generated too early: ${germanRuntimeFiles.join(", ")}`,
);


const coreFiles =
  (
    await readdir(coreSrcDir)
  ).filter(
    (name) =>
      name.endsWith(".ts"),
  );

for (const file of coreFiles) {
  const text =
    await readFile(
      resolve(
        coreSrcDir,
        file,
      ),
      "utf8",
    );

  invariant(
    !text.includes(
      "GermanRegionalConfiguration",
    ),
    `A5.2 must not implement GermanRegionalConfiguration yet: ${file}`,
  );

  invariant(
    !text.includes(
      "GermanRegionalOverlay",
    ),
    `A5.2 must not implement GermanRegionalOverlay yet: ${file}`,
  );
}


console.log(
  "Phase 15.5A5.2 regional configuration identity validation: PASS",
);

console.log(
  "Internal type: GermanRegionalConfiguration",
);

console.log(
  "Overlay type: GermanRegionalOverlay",
);

console.log(
  "Base configuration: overlay=null",
);

console.log(
  "Swiss overlay key: swiss",
);

console.log(
  "Explicit configuration required: TRUE",
);

console.log(
  "Implicit regional default: FORBIDDEN",
);

console.log(
  "Multiple regional overlays: FORBIDDEN",
);

console.log(
  "GermanTextMode coupling: NONE",
);

console.log(
  "DE-CH410 configuration-key reuse: FORBIDDEN",
);

console.log(
  "Swiss fourth mode: FALSE",
);

console.log(
  "Swiss explicit Eszett policy: OPEN",
);

console.log(
  "German regional rules: 0",
);

console.log(
  "German runtime bundles: 0",
);

console.log(
  "Public regional identifiers/API: NOT_FROZEN",
);
