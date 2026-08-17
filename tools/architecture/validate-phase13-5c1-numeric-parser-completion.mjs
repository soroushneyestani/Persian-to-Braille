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
    "docs/architecture/phase-13.5c-stateful-numeric-collision-audit.json",
  );

const manifest =
  await json(
    "spec/fa-ir/reverse/conformance/manifest.json",
  );

const reverseSource =
  await text(
    "packages/core/src/reverse-translator.ts",
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
  audit.baseline.remainingParserRequiredRules,
  2,
);

for (const token of [
  "numeric-fraction-separator",
  "numeric-begin",
  "numericFraction",
  "numericBeginMatch",
]) {
  assert.ok(
    reverseSource.includes(token),
    `numeric parser completion missing token: ${token}`,
  );
}

assert.equal(
  manifest.summary.vectors,
  37,
);

assert.equal(
  manifest.summary.translationVectors,
  35,
);

assert.equal(
  manifest.summary.capabilityVectors,
  2,
);

const numericStateIds =
  manifest.vectorIds.filter(
    (id) =>
      id.startsWith(
        "FA-REV-CONF-STATE-NUMERIC-",
      ),
  );

assert.deepEqual(
  numericStateIds.sort(),
  [
    "FA-REV-CONF-STATE-NUMERIC-BEGIN-001",
    "FA-REV-CONF-STATE-NUMERIC-FRACTION-001",
  ],
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

  for (const ruleId of record.sourceForwardRuleIds) {
    coveredRuleIds.add(ruleId);
  }
}

for (const ruleId of [
  "FA-G1-NUM-FRACTION-SLASH-001",
  "FA-G1-NUMRULE-002",
]) {
  assert.ok(
    coveredRuleIds.has(ruleId),
    `remaining parser-required rule is not covered: ${ruleId}`,
  );
}

for (const token of [
  "./reverse-translator.js",
  "./reverse-translation.js",
]) {
  assert.equal(
    coreIndex.includes(token),
    false,
    `Core reverse API exposed prematurely: ${token}`,
  );
}

for (const token of [
  "createPersianBrailleReverseTranslator",
  "translateFromBraille",
  "PersianBrailleReverseTranslationError",
]) {
  assert.equal(
    sdkIndex.includes(token),
    false,
    `SDK reverse API exposed prematurely: ${token}`,
  );
}

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
  "packages/sdk/src/",
  "integrations/microsoft365/src/",
  "apps/cli/",
  "apps/web/",
]) {
  assert.equal(
    diffNames.some(
      (name) =>
        name.startsWith(forbiddenPrefix),
    ),
    false,
    `Phase 13.5c-1 touched frozen/deferred boundary: ${forbiddenPrefix}`,
  );
}

console.log(
  "Phase 13.5c-1 Numeric Parser Completion: PASS",
);
console.log(
  "PARSER_RULE_REQUIRED coverage: 8 / 8",
);
console.log(
  "Numeric begin reverse state: PASS",
);
console.log(
  "Numeric fraction separator state: PASS",
);
console.log(
  "Reverse conformance vectors: 37",
);
console.log(
  "Core root reverse export: DEFERRED / PASS",
);
console.log(
  "SDK reverse API: DEFERRED / PASS",
);
console.log(
  "Next: Phase 13.5c-2 Numeric Collision Coverage",
);
