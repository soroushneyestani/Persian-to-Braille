import assert from "node:assert/strict";
import {
  execFileSync,
} from "node:child_process";
import {
  readFile,
} from "node:fs/promises";
import path from "node:path";
import {
  pathToFileURL,
} from "node:url";

const root =
  process.cwd();

async function text(
  relativePath,
) {
  return readFile(
    path.join(
      root,
      relativePath,
    ),
    "utf8",
  );
}

async function json(
  relativePath,
) {
  return JSON.parse(
    await text(
      relativePath,
    ),
  );
}

const a1 =
  await json(
    "docs/architecture/phase-13.6a1-corrected-sdk-reverse-contract-shape-audit.json",
  );

const a2 =
  await json(
    "docs/architecture/phase-13.6a2-sdk-reverse-projection-mapping-audit.json",
  );

const a3 =
  await json(
    "docs/architecture/phase-13.6a3-sdk-reverse-deferred-assumption-audit.json",
  );

assert.equal(
  a1.decision,
  "READY_TO_FREEZE_PHASE13_6_SDK_IMPLEMENTATION_SHAPE",
);

assert.deepEqual(
  a1.blockers,
  [],
);

assert.equal(
  a2.decision,
  "READY_TO_DESIGN_PHASE13_6B_SDK_REVERSE_PROJECTION",
);

assert.deepEqual(
  a2.blockers,
  [],
);

assert.equal(
  a3.decision,
  "READY_FOR_PHASE13_6B_MATERIALIZATION_PLANNING",
);

const contract =
  await json(
    "docs/architecture/phase-13.2-reverse-translation-contract.json",
  );

const canonicalRuntime =
  contract.sdkContract.newRuntimeExports;

const canonicalTypes =
  contract.sdkContract.newTypeExports;

assert.deepEqual(
  canonicalRuntime,
  [
    "PersianBrailleReverseTranslationError",
    "createPersianBrailleReverseTranslator",
  ],
);

assert.equal(
  canonicalTypes.length,
  14,
);

assert.equal(
  canonicalTypes.includes(
    "PersianBrailleReverseDiagnosticCode",
  ),
  false,
);

const sdkPackage =
  await json(
    "packages/sdk/package.json",
  );

assert.deepEqual(
  sdkPackage.exports,
  {
    ".": {
      types: "./dist/index.d.ts",
      import: "./dist/index.js",
    },
  },
);

const sdkIndex =
  await text(
    "packages/sdk/src/index.ts",
  );

for (const symbol of [
  ...canonicalRuntime,
  ...canonicalTypes,
]) {
  assert.equal(
    sdkIndex.includes(symbol),
    true,
    `SDK root missing canonical reverse symbol: ${symbol}`,
  );
}

assert.equal(
  sdkIndex.includes(
    "PersianBrailleReverseDiagnosticCode",
  ),
  false,
);

const distTypes =
  await text(
    "packages/sdk/dist/index.d.ts",
  );

for (const symbol of canonicalTypes) {
  assert.equal(
    distTypes.includes(symbol),
    true,
    `SDK declaration root missing reverse type: ${symbol}`,
  );
}

assert.equal(
  distTypes.includes(
    "PersianBrailleReverseDiagnosticCode",
  ),
  false,
);

const sdkRoot =
  await import(
    pathToFileURL(
      path.join(
        root,
        "packages/sdk/dist/index.js",
      ),
    ).href,
  );

for (const historicalRuntime of [
  "PersianBrailleReverseTranslationError",
  "PersianBrailleTranslationError",
  "createPersianBrailleReverseTranslator",
  "createPersianBrailleTranslator",
]) {
  assert.equal(
    typeof sdkRoot[historicalRuntime],
    "function",
    `Historical Phase 13 SDK runtime export missing: ${historicalRuntime}`,
  );
}

// Later public SDK milestones may add package-root runtime exports without
// invalidating the Phase 13 reverse-translation surface.


const reverse =
  sdkRoot.createPersianBrailleReverseTranslator();

const success =
  reverse.translateFromBraille(
    "\u2806",
  );

assert.equal(
  success.ok,
  true,
);

assert.equal(
  success.text,
  "\u061b",
);

assert.equal(
  success.lossy,
  true,
);

const strict =
  reverse.translateFromBraille(
    "\u2806",
    {
      ambiguityPolicy:
        "error",
    },
  );

assert.equal(
  strict.ok,
  false,
);

assert.equal(
  strict.code,
  "AMBIGUOUS_REVERSE_MATCH",
);

assert.throws(
  () =>
    reverse.translateFromBrailleOrThrow(
      "\u2806",
      {
        ambiguityPolicy:
          "error",
      },
    ),
  (error) =>
    error
    instanceof
      sdkRoot.PersianBrailleReverseTranslationError
    && error.code
      === "AMBIGUOUS_REVERSE_MATCH",
);

// Phase 13.6b must validate both before and after its final commit.
// Compare the committed milestone against the frozen Phase 13.5c-3c2
// baseline, then compose any still-uncommitted working-tree additions.
const milestoneDiffNames =
  execFileSync(
    "git",
    [
      "diff",
      "--name-only",
      "aa5ce927d218ab2535d93e7b1e36d2fdb7a97317",
      "HEAD",
    ],
    {
      cwd: root,
      encoding: "utf8",
    },
  )
  .split(/\r?\n/)
  .filter(Boolean);

const workingTreeDiffNames =
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

const untrackedNames =
  execFileSync(
    "git",
    [
      "ls-files",
      "--others",
      "--exclude-standard",
    ],
    {
      cwd: root,
      encoding: "utf8",
    },
  )
  .split(/\r?\n/)
  .filter(Boolean);

const changedNames =
  [
    ...new Set([
      ...milestoneDiffNames,
      ...workingTreeDiffNames,
      ...untrackedNames,
    ]),
  ];

for (const frozenPath of [
  "packages/core/",
  "packages/sdk/src/public-api.ts",
  "packages/sdk/src/translator.ts",
  "integrations/microsoft365/",
  "apps/cli/",
  "apps/web/",
]) {
  assert.equal(
    changedNames.some(
      (name) =>
        name.startsWith(
          frozenPath,
        ),
    ),
    false,
    `Phase 13.6b touched frozen scope: ${frozenPath}`,
  );
}

for (const requiredPath of [
  "packages/sdk/src/index.ts",
  "packages/sdk/src/reverse-public-api.ts",
  "packages/sdk/src/reverse-translator.ts",
  "packages/sdk/test/public-api.test.mjs",
  "packages/sdk/test/reverse-public-api.test.mjs",
]) {
  assert.equal(
    changedNames.includes(
      requiredPath,
    ),
    true,
    `Phase 13.6b expected change missing: ${requiredPath}`,
  );
}

for (const validatorPath of [
  "tools/architecture/validate-phase13-2-reverse-contract.mjs",
  "tools/architecture/validate-phase13-3-reverse-spec-foundation.mjs",
  "tools/architecture/validate-phase13-5-reverse-core-coverage.mjs",
  "tools/architecture/validate-phase13-5c1-numeric-parser-completion.mjs",
  "tools/architecture/validate-phase13-5c2-numeric-collision-resolution.mjs",
  "tools/architecture/validate-phase13-5c3a-language-mode-collision-resolution.mjs",
  "tools/architecture/validate-phase13-5c3b-remaining-punctuation-collision.mjs",
  "tools/architecture/validate-phase13-5c3c2-public-core-boundary.mjs",
]) {
  const source =
    await text(
      validatorPath,
    );

  assert.equal(
    source.includes(
      "SDK reverse runtime boundary must expose factory and error together.",
    ),
    true,
    `Historical SDK guard not composable: ${validatorPath}`,
  );
}

const phase13_4 =
  await text(
    "tools/architecture/validate-phase13-4-reverse-core-parser.mjs",
  );

for (const token of [
  "packages/sdk/src/public-api.ts",
  "packages/sdk/src/translator.ts",
  "Phase 13.4 frozen SDK source / CLI / Web / Microsoft 365 boundaries: PRESERVED / PASS",
]) {
  assert.equal(
    phase13_4.includes(
      token,
    ),
    true,
    `Phase 13.4 SDK source-boundary composition missing: ${token}`,
  );
}

assert.equal(
  phase13_4.includes(
    '"packages/sdk/src/",',
  ),
  false,
  "Phase 13.4 still forbids the entire SDK source tree after Phase 13.6b.",
);

const phase12_6 =
  await text(
    "tools/architecture/validate-phase12-6-developer-ecosystem-closure.mjs",
  );

assert.equal(
  phase12_6.includes(
    "phase12FrozenSdkSourceFiles",
  ),
  true,
);

const publicApiTest =
  await text(
    "packages/sdk/test/public-api.test.mjs",
  );

for (const symbol of canonicalRuntime) {
  assert.equal(
    publicApiTest.includes(
      symbol,
    ),
    true,
  );
}

console.log(
  "Phase 13.6b SDK Reverse API Materialization: PASS",
);
console.log(
  "Reverse SDK runtime exports: 2 / PASS",
);
console.log(
  "Reverse SDK type exports: 14 / PASS",
);
console.log(
  "Reverse diagnostic code public type: ABSENT / PASS",
);
console.log(
  "SDK-owned reverse projections: PASS",
);
console.log(
  "Factory default + per-call options: PASS",
);
console.log(
  "SDK reverse expected-failure error: PASS",
);
console.log(
  "Forward SDK source: UNCHANGED / PASS",
);
console.log(
  "Core reverse semantics: UNCHANGED / PASS",
);
console.log(
  "Microsoft 365 reverse consumption: NONE / PASS",
);
console.log(
  "Historical SDK-deferred validators: 8 / COMPOSABLE",
);
console.log(
  "Phase 13.4 SDK source boundary: COMPOSABLE / PASS",
);
console.log(
  "Next: Phase 13.6 SDK documentation and closure",
);
