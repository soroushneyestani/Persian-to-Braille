import assert from "node:assert/strict";
import {
  readFile,
  readdir,
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

const audit =
  await json(
    "docs/architecture/phase-13.5a-reverse-core-coverage-public-boundary-audit.json",
  );

const manifest =
  await json(
    "spec/fa-ir/reverse/conformance/manifest.json",
  );

const coreIndex =
  await text(
    "packages/core/src/index.ts",
  );

const sdkIndex =
  await text(
    "packages/sdk/src/index.ts",
  );

assert.equal(
  audit.publicCoreExportReadiness.ready,
  false,
);

assert.equal(
  audit.coverage.directCandidates.total,
  16,
);

assert.equal(
  audit.coverage.directCandidates.covered,
  1,
);

assert.equal(
  audit.coverage.parserRequired.total,
  8,
);

assert.equal(
  audit.coverage.parserRequired.covered,
  2,
);

assert.ok(
  Array.isArray(
    manifest.foundationSeedVectorIds,
  ),
);

assert.equal(
  manifest.foundationSeedVectorIds.length,
  16,
);

assert.ok(
  manifest.summary.vectors >= 35,
);

assert.ok(
  manifest.summary.translationVectors >= 33,
);

assert.equal(
  manifest.summary.capabilityVectors,
  2,
);

const coverageIds =
  manifest.vectorIds.filter(
    (id) =>
      id.startsWith(
        "FA-REV-CONF-COVERAGE-",
      ),
  );

assert.equal(
  coverageIds.length,
  19,
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
    (name) =>
      name.endsWith(".json"),
  );

assert.equal(
  recordNames.length,
  manifest.vectorIds.length,
);

const coveredRuleIds =
  new Set();

for (const name of recordNames) {
  const record =
    JSON.parse(
      await readFile(
        path.join(
          recordDir,
          name,
        ),
        "utf8",
      ),
    );

  if (
    !record.id.startsWith(
      "FA-REV-CONF-COVERAGE-",
    )
  ) {
    continue;
  }

  assert.equal(
    record.kind,
    "translation",
  );

  assert.equal(
    record.expected.ok,
    true,
  );

  assert.equal(
    record.expected.lossy,
    false,
  );

  for (
    const ruleId
    of record.sourceForwardRuleIds
  ) {
    coveredRuleIds.add(
      ruleId,
    );
  }
}

for (
  const ruleId
  of audit.coverage
    .directCandidates
    .uncoveredRuleIds
) {
  assert.ok(
    coveredRuleIds.has(
      ruleId,
    ),
    `missing direct coverage: ${ruleId}`,
  );
}

for (const ruleId of [
  "FA-G1-ORTHO-EZAFE-SEQUENCE-001",
  "FA-G1-PUNC-ASTERISK-RUN-001",
  "FA-G1-PUNC-ASTERISK-SINGLE-001",
  "FA-G1-PUNC-SCALAR-011",
]) {
  assert.ok(
    coveredRuleIds.has(
      ruleId,
    ),
    `missing unique parser coverage: ${ruleId}`,
  );
}

for (const ruleId of [
  "FA-G1-NUM-FRACTION-SLASH-001",
  "FA-G1-NUMRULE-002",
]) {
  assert.equal(
    coveredRuleIds.has(
      ruleId,
    ),
    false,
    `numeric-state rule covered prematurely: ${ruleId}`,
  );
}

const reverseRuntimeRootExported =
  coreIndex.includes(
    "./reverse-translator.js",
  );

const reverseTypesRootExported =
  coreIndex.includes(
    "./reverse-translation.js",
  );

assert.equal(
  reverseRuntimeRootExported,
  reverseTypesRootExported,
  "Core reverse root boundary must expose runtime and types together.",
);

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

for (const forbiddenPrefix of [
  "spec/fa-ir/rules/records/",
  "spec/fa-ir/conformance/records/",
  "packages/core/src/forward-translator.ts",
  "packages/core/src/rule-selector.ts",
  "packages/core/src/mode-rule-executor.ts",
  "packages/sdk/src/public-api.ts",
  "packages/sdk/src/translator.ts",
  "integrations/microsoft365/src/",
  "apps/cli/",
  "apps/web/",
]) {
  assert.equal(
    diffNames.some(
      (name) =>
        name.startsWith(
          forbiddenPrefix,
        ),
    ),
    false,
    `Phase 13.5b touched frozen/deferred boundary: ${forbiddenPrefix}`,
  );
}

console.log(
  "Phase 13.5b Unique Reverse Coverage Expansion: PASS",
);
console.log(
  "Direct reversal candidate coverage: 16 / 16",
);
console.log(
  "Parser-required coverage: 6 / 8",
);
console.log(
  "New independent reverse vectors: 19 / PASS",
);
console.log(
  "Foundation seed vectors preserved: 16 / PASS",
);
console.log(
  "Remaining numeric parser rules: 2",
);
console.log(
  "Collision signatures still requiring state coverage: 27",
);
console.log(
  "Core reverse root boundary coherence: PASS",
);
console.log(
  "SDK reverse runtime boundary coherence: PASS",
);
console.log(
  "Next: Phase 13.5c Stateful Numeric and Collision Coverage",
);
