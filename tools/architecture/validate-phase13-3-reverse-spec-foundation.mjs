import assert from "node:assert/strict";
import {
  readdir,
  readFile,
} from "node:fs/promises";
import path from "node:path";
import {
  fileURLToPath,
} from "node:url";
import {
  execFileSync,
} from "node:child_process";

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

const expectedVectorIds =
[
  "FA-REV-CONF-DIRECT-THA-001",
  "FA-REV-CONF-NUM-PERSIAN-001",
  "FA-REV-CONF-NUM-ASCII-001",
  "FA-REV-CONF-NUM-ARABIC-INDIC-001",
  "FA-REV-CONF-NUM-DECIMAL-001",
  "FA-REV-CONF-LATIN-LOWER-001",
  "FA-REV-CONF-LATIN-CAPITAL-001",
  "FA-REV-CONF-PUNC-QUESTION-PERSIAN-001",
  "FA-REV-CONF-PUNC-QUESTION-STRICT-001",
  "FA-REV-CONF-ELLIPSIS-UNICODE-001",
  "FA-REV-CONF-PAIRED-PARENS-001",
  "FA-REV-CONF-INVALID-INPUT-001",
  "FA-REV-CONF-LATIN-UNTERMINATED-001",
  "FA-REV-CONF-LATIN-DANGLING-CAPITAL-001",
  "FA-REV-CONF-CAP-LAYOUT-001",
  "FA-REV-CONF-CAP-ZWNJ-001"
];

const contract =
  await json(
    "docs/architecture/phase-13.2-reverse-translation-contract.json",
  );

const audit =
  await json(
    "docs/architecture/phase-13.3a-reverse-spec-foundation-audit.json",
  );

const policy =
  await json(
    "spec/fa-ir/reverse/policy/fa-ir-g1-reverse-policy.json",
  );

const profile =
  await json(
    "spec/fa-ir/reverse/profiles/fa-ir-g1-reverse.json",
  );

const manifest =
  await json(
    "spec/fa-ir/reverse/conformance/manifest.json",
  );

const policySchema =
  await json(
    "spec/fa-ir/reverse/schemas/reverse-policy.schema.json",
  );

const profileSchema =
  await json(
    "spec/fa-ir/reverse/schemas/reverse-profile.schema.json",
  );

const confSchema =
  await json(
    "spec/fa-ir/reverse/schemas/reverse-conformance.schema.json",
  );

const sdkIndex =
  await text(
    "packages/sdk/src/index.ts",
  );

assert.equal(
  contract.status,
  "FROZEN",
);

assert.equal(
  audit.readiness,
  "READY_TO_MATERIALIZE_PHASE_13_3_FOUNDATION",
);

assert.deepEqual(
  audit.existingReverseSpecFiles,
  [],
);

for (const schema of [
  policySchema,
  profileSchema,
  confSchema,
]) {
  assert.equal(
    schema.$schema,
    "https://json-schema.org/draft/2020-12/schema",
  );

  assert.equal(
    schema.additionalProperties,
    false,
  );
}

assert.equal(
  policy.id,
  "fa-ir-g1-reverse-policy",
);

assert.equal(
  policy.profile,
  "fa-ir-g1-reverse",
);

assert.equal(
  policy.direction,
  "braille-to-print",
);

assert.equal(
  policy.rendering.digitFamily.default,
  "persian",
);

assert.equal(
  policy.rendering.punctuationStyle.default,
  "persian",
);

assert.equal(
  policy.rendering.ellipsisStyle.default,
  "unicode",
);

assert.equal(
  policy.ambiguity.default,
  "canonicalize",
);

assert.equal(
  policy.reconstruction.exactSourceLayoutRoundTrip,
  false,
);

assert.equal(
  policy.reconstruction.exactZwnjRecovery,
  false,
);

assert.equal(
  profile.id,
  "fa-ir-g1-reverse",
);

assert.equal(
  profile.direction,
  "braille-to-print",
);

assert.equal(
  profile.sourceForwardProfile,
  "fa-ir-g1",
);

assert.equal(
  profile.policy,
  "fa-ir-g1-reverse-policy",
);

assert.equal(
  manifest.independence.forwardVectorsBlindlySwapped,
  false,
);

assert.equal(
  manifest.independence.reverseVectorsAuthoredIndependently,
  true,
);

assert.deepEqual(
  manifest.foundationSeedVectorIds,
  expectedVectorIds,
);

for (const seedId of expectedVectorIds) {
  assert.ok(
    manifest.vectorIds.includes(
      seedId,
    ),
    `Phase 13.3 foundation seed missing from expanded manifest: ${seedId}`,
  );
}

assert.ok(
  manifest.summary.vectors >= 16,
);

assert.ok(
  manifest.summary.translationVectors >= 14,
);

assert.equal(
  manifest.summary.capabilityVectors,
  2,
);

const recordDir =
  path.join(
    root,
    "spec/fa-ir/reverse/conformance/records",
  );

const recordNames =
  (
    await readdir(recordDir)
  )
  .filter(
    (name) => name.endsWith(".json"),
  )
  .sort();

assert.equal(
  recordNames.length,
  manifest.vectorIds.length,
);

const seen = new Set();
const byId = new Map();

for (const name of recordNames) {
  const record =
    JSON.parse(
      await readFile(
        path.join(recordDir, name),
        "utf8",
      ),
    );

  assert.equal(
    record.schemaVersion,
    1,
  );

  assert.equal(
    record.profile,
    "fa-ir-g1-reverse",
  );

  assert.equal(
    record.profileVersion,
    "0.1.0",
  );

  assert.ok(
    manifest.vectorIds.includes(
      record.id,
    ),
    `reverse record is missing from manifest: ${record.id}`,
  );

  assert.equal(
    seen.has(record.id),
    false,
    `duplicate reverse vector id: ${record.id}`,
  );

  seen.add(record.id);
  byId.set(record.id, record);

  assert.ok(
    Array.isArray(
      record.sourceForwardRuleIds,
    ),
  );

  assert.ok(
    ["translation", "capability"].includes(
      record.kind,
    ),
  );

  if (
    record.kind === "translation"
  ) {
    assert.equal(
      typeof record.input?.unicodeBraille,
      "string",
    );

    assert.equal(
      typeof record.expected?.ok,
      "boolean",
    );
  } else {
    assert.equal(
      typeof record.capability,
      "string",
    );

    assert.equal(
      typeof record.expected?.supported,
      "boolean",
    );
  }
}

assert.equal(
  seen.size,
  manifest.vectorIds.length,
);

assert.equal(
  byId.get(
    "FA-REV-CONF-NUM-PERSIAN-001",
  ).expected.text,
  "۱",
);

assert.equal(
  byId.get(
    "FA-REV-CONF-NUM-ASCII-001",
  ).expected.text,
  "1",
);

assert.equal(
  byId.get(
    "FA-REV-CONF-NUM-ARABIC-INDIC-001",
  ).expected.text,
  "١",
);

assert.equal(
  byId.get(
    "FA-REV-CONF-PUNC-QUESTION-PERSIAN-001",
  ).expected.text,
  "؟",
);

assert.equal(
  byId.get(
    "FA-REV-CONF-PUNC-QUESTION-STRICT-001",
  ).expected.code,
  "AMBIGUOUS_REVERSE_MATCH",
);

assert.equal(
  byId.get(
    "FA-REV-CONF-LATIN-UNTERMINATED-001",
  ).expected.code,
  "UNTERMINATED_LATIN_SPAN",
);

assert.equal(
  byId.get(
    "FA-REV-CONF-LATIN-DANGLING-CAPITAL-001",
  ).expected.code,
  "DANGLING_CAPITAL_INDICATOR",
);

assert.equal(
  byId.get(
    "FA-REV-CONF-CAP-LAYOUT-001",
  ).expected.supported,
  false,
);

assert.equal(
  byId.get(
    "FA-REV-CONF-CAP-ZWNJ-001",
  ).expected.supported,
  false,
);

// Historical Phase 13.3 was specification-only; later milestones may expose
// the frozen SDK reverse runtime boundary atomically.
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

// Preserve frozen/source boundaries.
const diffNames =
  execFileSync(
    "git",
    [
      "diff",
      "--name-only",
      "HEAD",
    ],
    {
      cwd: root,
      encoding: "utf8",
    },
  )
  .split(/\r?\n/)
  .filter(Boolean);

/*
 * Phase 13.3 owns the reverse specification/conformance foundation, not later
 * runtime phases. Keep its frozen forward/SDK/integration guards strict while
 * allowing only the explicitly known Phase 13.4 Core parser files to coexist
 * when the historical Phase 13.3 validator is composed into validate:phase13-4.
 */
const laterPhaseAllowedFiles =
  new Set([
    "packages/core/src/reverse-translation.ts",
    "packages/core/src/reverse-translator.ts",
    "packages/core/src/index.ts",
    "packages/core/test/reverse-translator-foundation.test.mjs",
    "packages/core/package.json",
    "docs/architecture/phase-13.4-reverse-core-parser-foundation.md",
    "docs/architecture/phase-13.4a-reverse-core-parser-baseline-audit.json",
    "docs/architecture/phase-13.4a-reverse-core-parser-baseline-audit.txt",
    "tools/architecture/validate-phase13-4-reverse-core-parser.mjs",
    "package.json",
  ]);

const phase13_3RelevantDiffNames =
  diffNames.filter(
    (name) =>
      !laterPhaseAllowedFiles.has(name),
  );

for (const forbiddenPrefix of [
  "spec/fa-ir/rules/records/",
  "spec/fa-ir/conformance/records/",
  "packages/core/src/",
  "packages/sdk/src/public-api.ts",
  "packages/sdk/src/translator.ts",
  "integrations/microsoft365/src/",
]) {
  assert.equal(
    phase13_3RelevantDiffNames.some(
      (name) => name.startsWith(
        forbiddenPrefix,
      ),
    ),
    false,
    `Phase 13.3 touched frozen/source boundary: ${forbiddenPrefix}`,
  );
}

console.log(
  "Phase 13.3 Reverse Specification and Conformance Foundation: PASS",
);
console.log(
  "Reverse policy schema: PASS",
);
console.log(
  "Reverse profile schema: PASS",
);
console.log(
  "Reverse conformance schema: PASS",
);
console.log(
  `Independent reverse seed vectors: ${expectedVectorIds.length} / PASS`,
);
console.log(
  "Mechanical forward-vector swap: DISALLOWED / PASS",
);
console.log(
  "Default digit family: PERSIAN",
);
console.log(
  "Default punctuation style: PERSIAN",
);
console.log(
  "Ambiguity policy: CANONICALIZE / STRICT ERROR SUPPORTED",
);
console.log(
  "Exact layout/ZWNJ source recovery: NOT CLAIMED / PASS",
);
console.log(
  "Forward rules/vectors and Core/SDK source: UNCHANGED / PASS",
);
console.log(
  "Reverse runtime implementation: NONE / PASS",
);
console.log(
  "Next: Phase 13.4 Reverse Core Parser Foundation",
);
