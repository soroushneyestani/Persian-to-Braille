import assert from "node:assert/strict";
import {
  readFile,
} from "node:fs/promises";
import path from "node:path";
import {
  fileURLToPath,
} from "node:url";

const here =
  path.dirname(
    fileURLToPath(
      import.meta.url,
    ),
  );

const root =
  path.resolve(
    here,
    "../..",
  );

async function text(relativePath) {
  return readFile(
    path.join(root, relativePath),
    "utf8",
  );
}

async function json(relativePath) {
  return JSON.parse(
    await text(relativePath),
  );
}

const contract =
  await json(
    "docs/architecture/phase-13.2-reverse-translation-contract.json",
  );

const audit =
  await json(
    "docs/architecture/phase-13.1b-reverse-rule-classification-audit.json",
  );

const correction =
  await json(
    "docs/architecture/phase-13.1a-reverse-translation-baseline-correction.json",
  );

const rootPackage =
  await json(
    "package.json",
  );

const sdkIndex =
  await text(
    "packages/sdk/src/index.ts",
  );

const architecture =
  await text(
    "docs/architecture/phase-13.2-reverse-translation-architecture.md",
  );

assert.equal(
  contract.status,
  "FROZEN",
);

assert.equal(
  contract.profile.forwardProfileId,
  "fa-ir-g1",
);

assert.equal(
  contract.profile.reverseProfileId,
  "fa-ir-g1-reverse",
);

assert.equal(
  contract.profile.direction,
  "braille-to-print",
);

assert.equal(
  correction.forwardInventory.rules,
  176,
);

assert.equal(
  correction.forwardInventory.vectors,
  176,
);

assert.deepEqual(
  audit.summary.preliminaryClasses,
  {
    DIRECT_REVERSAL_CANDIDATE: 16,
    PARSER_RULE_REQUIRED: 8,
    STATE_OR_POLICY_REQUIRED: 123,
    STRUCTURAL_RECONSTRUCTION_REQUIRED: 29,
  },
);

assert.equal(
  audit.summary.collisionGroups,
  34,
);

assert.equal(
  audit.summary.segmentationOverlapSignatures,
  4,
);

assert.equal(
  audit.summary.policyRelevantCollisionGroups,
  15,
);

assert.equal(
  contract.architecture.naiveGlobalCellLookupAllowed,
  false,
);

assert.equal(
  contract.architecture.forwardRuleMutationRequired,
  false,
);

assert.equal(
  contract.outputPolicies.digitFamily.default,
  "persian",
);

assert.deepEqual(
  contract.outputPolicies.digitFamily.allowed,
  [
    "persian",
    "ascii",
    "arabic-indic",
  ],
);

assert.equal(
  contract.outputPolicies.punctuationStyle.default,
  "persian",
);

assert.equal(
  contract.outputPolicies.ellipsisStyle.default,
  "unicode",
);

assert.equal(
  contract.outputPolicies.ambiguityPolicy.default,
  "canonicalize",
);

assert.equal(
  contract.outputPolicies.pairedPunctuation.strategy,
  "parser-context",
);

assert.equal(
  contract.outputPolicies.layoutReconstruction.exactSourceLayoutRoundTripClaimed,
  false,
);

assert.equal(
  contract.outputPolicies.layoutReconstruction.zwnjExactRecoveryClaimed,
  false,
);

assert.equal(
  contract.sdkContract.forwardApiPreservedUnchanged,
  true,
);

for (const token of [
  "translateFromBraille",
  "translateFromBrailleOrThrow",
  "createPersianBrailleReverseTranslator",
  "PersianBrailleReverseTranslationError",
  "AMBIGUOUS_REVERSE_MATCH",
  "DANGLING_CAPITAL_INDICATOR",
]) {
  assert.ok(
    JSON.stringify(
      contract.sdkContract,
    ).includes(token),
    `reverse SDK contract missing: ${token}`,
  );
}

// Historical Phase 13.2 froze the SDK reverse contract before runtime exposure.
// Later milestones may expose the frozen runtime boundary atomically.
const reverseSdkFactoryRootExported =
  sdkIndex.includes(
    "createPersianBrailleReverseTranslator",
  );

const reverseSdkErrorRootExported =
  sdkIndex.includes(
    "PersianBrailleReverseTranslationError",
  );

assert.equal(
  reverseSdkFactoryRootExported,
  reverseSdkErrorRootExported,
  "SDK reverse runtime boundary must expose factory and error together.",
);

assert.equal(
  contract.conformanceContract.forwardVectorsMayBeBlindlySwapped,
  false,
);

assert.equal(
  contract.conformanceContract.reverseVectorsAreIndependent,
  true,
);

for (const required of [
  "numeric mode and digit-family rendering",
  "Latin span begin/end",
  "capital indicator handling",
  "punctuation canonicalization",
  "paired punctuation parser context",
  "longest-match sequences",
  "malformed Braille input",
  "Braille stability round trips",
  "canonical print round trips",
]) {
  assert.ok(
    contract.conformanceContract.requiredSuites.includes(
      required,
    ),
    `reverse conformance suite missing: ${required}`,
  );
}

for (const phrase of [
  "A global cell lookup table is explicitly prohibited.",
  "The default is Persian digits",
  "The default output style is `persian`.",
  "Default:",
  "canonicalize",
  "separate reverse translator",
  "Forward vectors are evidence, not reverse vectors with the fields swapped.",
  "Exact print round-trip is claimed only for an explicitly reversible subset.",
  "Phase 13.3 — Reverse Specification and Conformance Foundation",
]) {
  assert.ok(
    architecture.includes(
      phrase,
    ),
    `architecture note missing phrase: ${phrase}`,
  );
}

assert.equal(
  rootPackage.scripts[
    "validate:phase13-2"
  ],
  "node tools/architecture/validate-phase13-2-reverse-contract.mjs",
);

console.log(
  "Phase 13.2 Reverse Translation Architecture and Contract Freeze: PASS",
);

console.log(
  "Corrected Phase 13.1a canonical baseline: PASS",
);

console.log(
  "Phase 13.1b classification baseline: PASS",
);

console.log(
  "Naive global Braille lookup: DISALLOWED / PASS",
);

console.log(
  "Stateful parser architecture: FROZEN",
);

console.log(
  "Default digit family: PERSIAN",
);

console.log(
  "Default punctuation style: PERSIAN",
);

console.log(
  "Default ambiguity policy: CANONICALIZE + DIAGNOSTIC",
);

console.log(
  "Forward Phase 12 SDK API: PRESERVED / UNCHANGED",
);

console.log(
  "Reverse SDK runtime boundary coherence: PASS",
);

console.log(
  "Independent reverse conformance: REQUIRED",
);

console.log(
  "Next: Phase 13.3 Reverse Specification and Conformance Foundation",
);
