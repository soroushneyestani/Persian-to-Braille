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
    fileURLToPath(import.meta.url),
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
    "docs/architecture/phase-13.5c3b-remaining-punctuation-collision-audit.json",
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
  audit.phase,
  "13.5c-3b",
);

assert.deepEqual(
  audit.baseline.remainingCollisionSignatures,
  [
    "23",
  ],
);

assert.equal(
  audit.allExpectedRuntimeHintsMatch,
  true,
);

assert.equal(
  manifest.summary.vectors,
  142,
);

assert.equal(
  manifest.summary.translationVectors,
  140,
);

assert.equal(
  manifest.summary.capabilityVectors,
  2,
);

const phaseIds =
  manifest.vectorIds.filter(
    (id) =>
      id.startsWith(
        "FA-REV-CONF-COLLISION-PUNCTUATION-SEMICOLON-",
      ),
  );

assert.equal(
  phaseIds.length,
  3,
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

const ruleDir =
  path.join(
    root,
    "spec/fa-ir/rules/records",
  );

const ruleNames =
  (
    await readdir(ruleDir)
  )
  .filter(
    (name) =>
      name.endsWith(".json"),
  );

const bySignature =
  new Map();

for (const name of ruleNames) {
  const rule =
    JSON.parse(
      await readFile(
        path.join(
          ruleDir,
          name,
        ),
        "utf8",
      ),
    );

  const cells =
    rule.output?.cells;

  if (
    !Array.isArray(cells)
    || cells.length === 0
  ) {
    continue;
  }

  const signature =
    cells.join(" ");

  const ids =
    bySignature.get(signature)
    ?? [];

  ids.push(rule.id);

  bySignature.set(
    signature,
    ids,
  );
}

const collisionEntries =
  [
    ...bySignature.entries(),
  ]
  .filter(
    ([, ids]) =>
      ids.length > 1,
  );

assert.equal(
  collisionEntries.length,
  34,
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

  for (
    const ruleId
    of record.sourceForwardRuleIds
  ) {
    coveredRuleIds.add(
      ruleId,
    );
  }
}

const remainingSignatures =
  collisionEntries
  .filter(
    ([, ids]) =>
      !ids.some(
        (ruleId) =>
          coveredRuleIds.has(
            ruleId,
          ),
      ),
  )
  .map(
    ([signature]) =>
      signature,
  )
  .sort();

assert.deepEqual(
  remainingSignatures,
  [],
);

const semicolonRecords =
  phaseIds.map(
    (id) =>
      manifest.vectorIds.includes(id),
  );

assert.ok(
  semicolonRecords.every(Boolean),
);

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

const commentOnlyLaterPhaseFiles =
  new Map([
    [
      "packages/core/src/reverse-translation.ts",
      {
        oldComment:
`/**
 * Core-internal Phase 13.4 reverse translation contracts.
 * Not re-exported from the Core root in this phase.
 */`,
        newComment:
`/**
 * Public Core reverse translation contracts.
 *
 * The frozen Phase 13.5c-3c2 Core root boundary explicitly re-exports
 * these types from @persian-braille/core.
 */`,
      },
    ],
    [
      "packages/core/src/reverse-translator.ts",
      {
        oldComment:
`/**
 * Phase 13.4 Core-internal factory.
 * Public Core/SDK exposure is intentionally deferred.
 */`,
        newComment:
`/**
 * Public Core reverse translator factory.
 *
 * Exposed from @persian-braille/core in Phase 13.5c-3c2.
 * SDK reverse exposure remains intentionally deferred.
 */`,
      },
    ],
  ]);

for (const [
  relativePath,
  {
    oldComment,
    newComment,
  },
] of commentOnlyLaterPhaseFiles) {
  if (!diffNames.includes(relativePath)) {
    continue;
  }

  const headSource =
    execFileSync(
      "git",
      [
        "show",
        `HEAD:${relativePath}`,
      ],
      {
        cwd: root,
        encoding: "utf8",
      },
    );

  const currentSource =
    await readFile(
      path.join(
        root,
        relativePath,
      ),
      "utf8",
    );

  assert.equal(
    headSource.includes(
      oldComment,
    ),
    true,
    `Historical reverse source baseline comment missing: ${relativePath}`,
  );

  assert.equal(
    currentSource.includes(
      newComment,
    ),
    true,
    `Current public-Core comment missing: ${relativePath}`,
  );

  assert.equal(
    currentSource,
    headSource.replace(
      oldComment,
      newComment,
    ),
    `Phase 13.5c-3c2 changed reverse runtime semantics while composing c3b: ${relativePath}`,
  );
}

const c3bRelevantDiffNames =
  diffNames.filter(
    (name) =>
      !commentOnlyLaterPhaseFiles.has(
        name,
      ),
  );

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
    c3bRelevantDiffNames.some(
      (name) =>
        name.startsWith(
          forbiddenPrefix,
        ),
    ),
    false,
    `Phase 13.5c-3b touched frozen/deferred boundary: ${forbiddenPrefix}`,
  );
}

console.log(
  "Phase 13.5c-3b Remaining Punctuation Collision: PASS",
);
console.log(
  "Semicolon punctuation collision: PASS",
);
console.log(
  "Parser semantic changes: NONE / PASS",
);
console.log(
  "New punctuation vectors: 3 / PASS",
);
console.log(
  "Reverse conformance vectors: 142",
);
console.log(
  "Canonical collision coverage: 34 / 34",
);
console.log(
  "Remaining collision signatures: 0",
);
console.log(
  "Core reverse root boundary coherence: PASS",
);
console.log(
  "SDK reverse runtime boundary coherence: PASS",
);
console.log(
  "Next: Phase 13.5c-3c Final Coverage and Public Core Boundary Reassessment",
);
