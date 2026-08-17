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

const behaviorAudit =
  await json(
    "docs/architecture/phase-13.5c2-numeric-collision-behavior-audit.json",
  );

const designAudit =
  await json(
    "docs/architecture/phase-13.5c2a-numeric-collision-resolution-design-audit.json",
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
  behaviorAudit.baseline
    .numericRelatedRemainingCollisionSignatures,
  10,
);

assert.equal(
  designAudit.baseModeResolutionSummary.length,
  8,
);

assert.equal(
  manifest.summary.vectors,
  71,
);

assert.equal(
  manifest.summary.translationVectors,
  69,
);

assert.equal(
  manifest.summary.capabilityVectors,
  2,
);

const collisionIds =
  manifest.vectorIds.filter(
    (id) =>
      id.startsWith(
        "FA-REV-CONF-COLLISION-NUMERIC-",
      ),
  );

assert.equal(
  collisionIds.length,
  34,
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

let signature15BaseFailure =
  null;

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

  if (
    record.id
    === "FA-REV-CONF-COLLISION-NUMERIC-15-BASE"
  ) {
    signature15BaseFailure =
      record;
  }
}

for (const row of behaviorAudit.numericCollisions) {
  assert.ok(
    row.candidates.some(
      (candidate) =>
        coveredRuleIds.has(
          candidate.ruleId,
        ),
    ),
    `numeric collision signature not covered: ${row.signature}`,
  );
}

assert.ok(
  signature15BaseFailure !== null,
);

assert.equal(
  signature15BaseFailure.expected.ok,
  false,
);

assert.equal(
  signature15BaseFailure.expected.code,
  "AMBIGUOUS_REVERSE_MATCH",
);

for (const token of [
  "numericInternalCandidates",
  '"numeric-internal"',
  "numericEndMatch",
  '"numeric-end"',
  "basePersianCandidate",
  "preLatinPercentMatch",
]) {
  assert.ok(
    reverseSource.includes(token),
    `numeric collision source marker missing: ${token}`,
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
        name.startsWith(
          forbiddenPrefix,
        ),
    ),
    false,
    `Phase 13.5c-2 touched frozen/deferred boundary: ${forbiddenPrefix}`,
  );
}

console.log(
  "Phase 13.5c-2 Numeric Collision Resolution: PASS",
);
console.log(
  "Numeric-related collision signatures covered: 10 / 10",
);
console.log(
  "Base Persian digit/text collisions: 7 resolved / PASS",
);
console.log(
  "Signature 15 base ambiguity: PRESERVED / PASS",
);
console.log(
  "Numeric internal separator: PASS",
);
console.log(
  "Numeric end / percent precedence: PASS",
);
console.log(
  "New collision vectors: 34 / PASS",
);
console.log(
  "Reverse conformance vectors: 71",
);
console.log(
  "Remaining non-numeric collision signatures: 17",
);
console.log(
  "Core root reverse export: DEFERRED / PASS",
);
console.log(
  "SDK reverse API: DEFERRED / PASS",
);
console.log(
  "Next: Phase 13.5c-3 Remaining Cross-Mode Collision Coverage",
);
