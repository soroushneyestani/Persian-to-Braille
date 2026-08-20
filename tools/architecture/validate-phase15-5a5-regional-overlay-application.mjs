import {
  readFile,
  readdir,
} from "node:fs/promises";

import {
  resolve,
} from "node:path";


const root = process.cwd();

const contract =
  JSON.parse(
    await readFile(
      resolve(
        root,
        "spec/de/regional-overlay-application-contract.json",
      ),
      "utf8",
    ),
  );

const identity =
  JSON.parse(
    await readFile(
      resolve(
        root,
        "spec/de/regional-configuration-contract.json",
      ),
      "utf8",
    ),
  );

const modeMaterialization =
  JSON.parse(
    await readFile(
      resolve(
        root,
        "spec/de/text-mode-materialization-contract.json",
      ),
      "utf8",
    ),
  );

const topology =
  JSON.parse(
    await readFile(
      resolve(
        root,
        "spec/de/runtime-topology.json",
      ),
      "utf8",
    ),
  );

const manifest =
  JSON.parse(
    await readFile(
      resolve(
        root,
        "tools/architecture/runtime-spec-bundles.json",
      ),
      "utf8",
    ),
  );


function invariant(
  condition,
  message,
) {
  if (!condition) {
    throw new Error(message);
  }
}


invariant(
  contract.schemaVersion === 1,
  "A5.3 schemaVersion must be 1.",
);

invariant(
  contract.phase === "15.5A5.3",
  "Unexpected A5.3 phase.",
);

invariant(
  contract.status ===
    "OVERLAY_APPLICATION_CONTRACT",
  "Unexpected A5.3 contract status.",
);


const composition =
  contract.compositionModel ?? {};

invariant(
  composition.textModeMaterializationFirst ===
    true,
  "Text-mode materialization must occur first.",
);

invariant(
  composition.regionalConfigurationAppliedAfterTextModeMaterialization ===
    true,
  "Regional configuration must remain downstream of text-mode materialization.",
);

invariant(
  composition.applicationStage ===
    "AFTER_TEXT_MODE_MATERIALIZATION_BEFORE_FINAL_EXECUTABLE_SPECIFICATION",
  "Unexpected regional application stage.",
);

invariant(
  composition.output ===
    "ONE_EFFECTIVE_EXECUTABLE_SPECIFICATION",
  "Regional composition must yield one effective executable specification.",
);

invariant(
  composition.translatorChainingAllowed ===
    false,
  "Regional translator chaining is forbidden.",
);

invariant(
  composition.regionalSecondRuntimeBundleAllowed ===
    false,
  "Regional second-bundle execution is forbidden.",
);

invariant(
  composition.regionalBundleFamilyAllowed ===
    false,
  "A5.3 must not create a regional bundle family.",
);


const base =
  contract.baseConfiguration ?? {};

invariant(
  base.configuration?.overlay ===
    null,
  "Base regional configuration must remain overlay=null.",
);

invariant(
  base.behavior ===
    "IDENTITY",
  "Base regional configuration must be identity behavior.",
);

invariant(
  base.mustPreserveModeMaterializationExactly ===
    true,
  "overlay=null must preserve text-mode materialization exactly.",
);

invariant(
  base.regionalRulesActivated ===
    false,
  "overlay=null must not activate regional rules.",
);


const swiss =
  contract.swissOverlay ?? {};

invariant(
  swiss.configuration?.overlay ===
    "swiss",
  "Swiss overlay key changed.",
);

invariant(
  swiss.role ===
    "SCOPED_REGIONAL_APPLICABILITY_AND_CONSTRAINT_LAYER",
  "Swiss overlay semantic role changed.",
);

invariant(
  swiss.isFourthGermanTextMode ===
    false,
  "Swiss must not become a fourth German mode.",
);

invariant(
  swiss.participatesInTextModeInheritance ===
    false,
  "Swiss must not participate in text-mode inheritance.",
);

invariant(
  swiss.createsIndependentTranslator ===
    false,
  "Swiss must not create an independent translator.",
);

invariant(
  swiss.createsIndependentRuntimeBundle ===
    false,
  "Swiss must not create an independent runtime bundle.",
);

invariant(
  swiss.mayActivateOnlyExplicitlyAdmittedRegionalRules ===
    true,
  "Swiss may activate only explicitly admitted regional rules.",
);

invariant(
  swiss.implicitRegionalBehaviorAllowed ===
    false,
  "Implicit Swiss runtime behavior is forbidden.",
);


const rules =
  contract.ruleComposition ?? {};

for (const field of [
  "canonicalBaseRuleMutationAllowed",
  "implicitRuleReplacementAllowed",
  "lastWriteWinsAllowed",
  "duplicateCanonicalRuleIdAcrossBaseAndRegionalLayersAllowed",
  "inheritanceOrderDefinesRuntimePrecedence",
  "regionalPresenceDefinesAutomaticPrecedence",
]) {
  invariant(
    rules[field] === false,
    `${field} must remain false.`,
  );
}

invariant(
  rules.regionalRuleMustHaveUniqueCanonicalRuleId ===
    true,
  "Regional rules must use unique canonical rule IDs.",
);

invariant(
  Array.isArray(
    rules.resolutionMechanism,
  )
  && rules.resolutionMechanism.join(",") ===
    [
      "EXPLICIT_CANONICAL_RULE_PRIORITY",
      "EXPLICIT_RULE_APPLICABILITY",
      "SEMANTIC_VALIDATION",
    ].join(","),
  "Regional conflict-resolution mechanism changed.",
);

invariant(
  rules.unresolvedEqualPrecedenceConflict ===
    "REJECT",
  "Unresolved equal-precedence regional conflict must reject.",
);


const extension =
  contract.regionalApplicabilityExtension ?? {};

invariant(
  extension.mayExtendExistingBaseRuleApplicability ===
    true,
  "Regional applicability extension must remain expressible.",
);

invariant(
  extension.mustReferenceUnderlyingCanonicalSemantics ===
    true,
  "Regional applicability extension must reference canonical semantics.",
);

invariant(
  extension.mayBypassUnderlyingRestrictions ===
    false,
  "Regional applicability must not bypass base restrictions.",
);

for (const field of [
  "inheritsUnderlyingBoundaryRules",
  "inheritsUnderlyingMorphologyRules",
  "inheritsUnderlyingProperNameRules",
  "inheritsUnderlyingPrecedenceRules",
  "inheritsUnderlyingCancellationRules",
]) {
  invariant(
    extension[field] === true,
    `Regional applicability must preserve ${field}.`,
  );
}

invariant(
  extension.mayCreateNewBrailleSequenceImplicitly ===
    false,
  "Regional applicability must not invent Braille sequences.",
);


const modeScope =
  contract.modeScope ?? {};

invariant(
  modeScope.regionalRuleMustDeclareOrInheritApplicableTextModeScope ===
    true,
  "Regional rules must have explicit/inherited text-mode scope.",
);

invariant(
  modeScope.regionalRuleMayActivateOutsideApplicableTextMode ===
    false,
  "Regional rules must not escape their text-mode scope.",
);

invariant(
  modeScope.swissOverlayDoesNotMakeKurzschriftRulesAvailableInOtherModes ===
    true,
  "Swiss must not promote Kurzschrift rules into other modes.",
);


const ortho =
  contract.orthographicPolicyBoundary ?? {};

invariant(
  ortho.automaticEszettToDoubleSNormalizationAuthorized ===
    false,
  "A5.3 must not authorize automatic ß→ss normalization.",
);

invariant(
  ortho.explicitEszettInputRuntimeBehavior ===
    "OPEN",
  "A5.3 must not resolve explicit Swiss Eszett behavior.",
);

invariant(
  ortho.openDependency ===
    "SWISS_EXPLICIT_ESZETT_INPUT_POLICY",
  "Unexpected Swiss Eszett dependency.",
);

invariant(
  ortho.decisionOwner ===
    "15.5A6",
  "Swiss Eszett decision owner changed.",
);

invariant(
  ortho.a5MayResolve ===
    false,
  "A5 is forbidden from resolving Swiss Eszett runtime behavior.",
);


const identifiers =
  contract.identifierBoundary ?? {};

invariant(
  identifiers.regionalOverlayKey ===
    "swiss",
  "Internal Swiss overlay key changed.",
);

invariant(
  identifiers.deCh410Role ===
    "INTERNAL_NORMATIVE_RULE_NAMESPACE",
  "DE-CH410 role changed.",
);

invariant(
  identifiers.deCh410IsRuntimeOverlayKey ===
    false,
  "DE-CH410 must not become the runtime overlay key.",
);

for (const field of [
  "publicGermanProfileIdentifier",
  "publicSwissProfileIdentifier",
  "publicLocaleIdentifier",
  "publicSdkRegionalApi",
]) {
  invariant(
    identifiers[field] ===
      "NOT_FROZEN",
    `${field} must remain NOT_FROZEN.`,
  );
}


const runtime =
  contract.runtimeTopologyCompatibility ?? {};

invariant(
  runtime.runtimeModel ===
    "THREE_INTERNAL_EXECUTABLE_BUNDLES",
  "A5.3 runtime model changed.",
);

invariant(
  runtime.selectedTextModeStillOwnsExactlyOneInternalBundle ===
    true,
  "Selected mode must still own exactly one internal bundle.",
);

invariant(
  runtime.swissCreatesFourthBundle ===
    false,
  "Swiss must not create a fourth bundle.",
);

invariant(
  runtime.swissCreatesThreeAdditionalBundleVariants ===
    false,
  "Swiss must not create three additional bundle variants.",
);

invariant(
  runtime.regionalBehaviorMustRemainOrthogonalToBundleIdentity ===
    true,
  "Regional behavior must remain orthogonal to bundle identity.",
);


invariant(
  identity.representation?.baseConfiguration?.overlay ===
    null,
  "A5.2 base configuration changed.",
);

const overlays =
  identity.representation?.supportedOverlays ?? [];

invariant(
  overlays.length === 1
  && overlays[0]?.key === "swiss",
  "A5.2 overlay identity changed.",
);

invariant(
  identity.runtimePolicy?.swissExplicitEszettInputPolicy ===
    "OPEN",
  "A5.2 Swiss Eszett policy unexpectedly changed.",
);


invariant(
  modeMaterialization.semanticModel?.runtimeExecutionModel ===
    "ONE_EFFECTIVE_BUNDLE_PER_SELECTED_MODE",
  "A4 runtime execution invariant changed.",
);

invariant(
  modeMaterialization.regionalSeparation?.swissParticipatesInModeInheritance ===
    false,
  "A4 Swiss mode-inheritance separation changed.",
);


invariant(
  topology.runtimeModel ===
    "THREE_INTERNAL_EXECUTABLE_BUNDLES",
  "A3 topology runtime model changed.",
);

invariant(
  topology.regionalModel?.swiss?.isFourthGermanMode ===
    false,
  "A3 Swiss fourth-mode invariant changed.",
);


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
    `${field} must remain zero during A5.3.`,
  );
}


const bundles =
  manifest.bundles;

invariant(
  Array.isArray(bundles)
  && bundles.length === 1
  && bundles[0]?.key === "fa-ir-g1",
  "A5.3 must not admit German runtime bundles.",
);


const generatedDir =
  resolve(
    root,
    "packages/core/src/generated",
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
  `German runtime generated during A5.3: ${germanRuntimeFiles.join(", ")}`,
);


console.log(
  "Phase 15.5A5.3 regional overlay application validation: PASS",
);

console.log(
  "Application stage: AFTER_TEXT_MODE_MATERIALIZATION_BEFORE_FINAL_EXECUTABLE_SPECIFICATION",
);

console.log(
  "Base overlay=null behavior: IDENTITY",
);

console.log(
  "Swiss overlay role: SCOPED_REGIONAL_APPLICABILITY_AND_CONSTRAINT_LAYER",
);

console.log(
  "Canonical base-rule mutation: FORBIDDEN",
);

console.log(
  "Implicit replacement: FORBIDDEN",
);

console.log(
  "Last-write-wins: FORBIDDEN",
);

console.log(
  "Runtime parent/translator chaining: FORBIDDEN",
);

console.log(
  "Regional second bundle: FORBIDDEN",
);

console.log(
  "Swiss additional bundle variants: 0",
);

console.log(
  "Underlying restriction inheritance: REQUIRED",
);

console.log(
  "Cross-mode regional activation: FORBIDDEN",
);

console.log(
  "Automatic ß->ss normalization authorized: FALSE",
);

console.log(
  "Explicit Swiss Eszett input policy: OPEN",
);

console.log(
  "German regional rules: 0",
);

console.log(
  "German runtime bundles: 0",
);
