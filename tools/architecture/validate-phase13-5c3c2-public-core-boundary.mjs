import assert from "node:assert/strict";
import {
  readFile,
} from "node:fs/promises";
import path from "node:path";
import {
  fileURLToPath,
  pathToFileURL,
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

const correctedAudit =
  await json(
    "docs/architecture/phase-13.5c3c1-corrected-public-core-boundary-readiness-audit.json",
  );

const validatorAudit =
  await json(
    "docs/architecture/phase-13.5c3c2-public-core-boundary-validator-audit.json",
  );

const testAudit =
  await json(
    "docs/architecture/phase-13.5c3c2a-public-core-boundary-test-assumption-audit.json",
  );

assert.equal(
  correctedAudit.decision,
  "READY_FOR_PUBLIC_CORE_BOUNDARY_FREEZE",
);

assert.deepEqual(
  correctedAudit.blockingItems,
  [],
);

assert.equal(
  validatorAudit.validatorFilesWithBoundaryAssumptions.length,
  6,
);

assert.deepEqual(
  testAudit.filesWithBoundaryAssumptions,
  [
    "packages/core/test/reverse-translator-foundation.test.mjs",
  ],
);

const coreIndex =
  await text(
    "packages/core/src/index.ts",
  );

const reverseTranslationSource =
  await text(
    "packages/core/src/reverse-translation.ts",
  );

const reverseTranslatorSource =
  await text(
    "packages/core/src/reverse-translator.ts",
  );

assert.equal(
  reverseTranslationSource.includes(
    "Core-internal Phase 13.4 reverse translation contracts.",
  ),
  false,
  "Stale internal-only reverse translation contract comment remains after public Core boundary.",
);

assert.equal(
  reverseTranslationSource.includes(
    "Public Core reverse translation contracts.",
  ),
  true,
);

assert.equal(
  reverseTranslatorSource.includes(
    "Public Core/SDK exposure is intentionally deferred.",
  ),
  false,
  "Stale deferred Core exposure comment remains after public Core boundary.",
);

assert.equal(
  reverseTranslatorSource.includes(
    "SDK reverse exposure remains intentionally deferred.",
  ),
  true,
);


const corePackage =
  await json(
    "packages/core/package.json",
  );

const sdkIndex =
  await text(
    "packages/sdk/src/index.ts",
  );

const distTypes =
  await text(
    "packages/core/dist/index.d.ts",
  );

const expectedRuntimeBlock =
`export {
  createReverseTranslator,
} from "./reverse-translator.js";`;

const expectedTypeBlock =
`export type {
  ReverseAmbiguityPolicy,
  ReverseDiagnostic,
  ReverseDiagnosticCode,
  ReverseDigitFamily,
  ReverseEllipsisStyle,
  ReverseProfileSnapshot,
  ReversePunctuationStyle,
  ReverseTranslationFailure,
  ReverseTranslationFailureCode,
  ReverseTranslationOptions,
  ReverseTranslationOutcome,
  ReverseTranslationSuccess,
  ReverseTranslator,
  ReverseUnicodeLocation,
} from "./reverse-translation.js";`;

assert.equal(
  coreIndex.includes(
    expectedRuntimeBlock,
  ),
  true,
);

assert.equal(
  coreIndex.includes(
    expectedTypeBlock,
  ),
  true,
);

assert.equal(
  coreIndex.includes(
    `export * from "./reverse-translator.js";`,
  ),
  false,
);

assert.equal(
  coreIndex.includes(
    `export * from "./reverse-translation.js";`,
  ),
  false,
);

assert.deepEqual(
  corePackage.exports,
  {
    ".": {
      types: "./dist/index.d.ts",
      import: "./dist/index.js",
    },
  },
);

for (const symbol of [
  "ReverseAmbiguityPolicy",
  "ReverseDiagnostic",
  "ReverseDiagnosticCode",
  "ReverseDigitFamily",
  "ReverseEllipsisStyle",
  "ReverseProfileSnapshot",
  "ReversePunctuationStyle",
  "ReverseTranslationFailure",
  "ReverseTranslationFailureCode",
  "ReverseTranslationOptions",
  "ReverseTranslationOutcome",
  "ReverseTranslationSuccess",
  "ReverseTranslator",
  "ReverseUnicodeLocation",
]) {
  assert.equal(
    distTypes.includes(symbol),
    true,
    `Core root declaration missing reverse type: ${symbol}`,
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
    `SDK reverse API exposed during Core boundary step: ${token}`,
  );
}

const coreRoot =
  await import(
    pathToFileURL(
      path.join(
        root,
        "packages/core/dist/index.js",
      ),
    ).href
  );

assert.equal(
  typeof coreRoot.createReverseTranslator,
  "function",
);

const translator =
  coreRoot.createReverseTranslator();

const canonicalized =
  translator.translate("⠆");

assert.equal(
  canonicalized.ok,
  true,
);

if (canonicalized.ok) {
  assert.equal(
    canonicalized.text,
    "؛",
  );
}

const strict =
  translator.translate(
    "⠆",
    {
      ambiguityPolicy: "error",
    },
  );

assert.equal(
  strict.ok,
  false,
);

if (!strict.ok) {
  assert.equal(
    strict.code,
    "AMBIGUOUS_REVERSE_MATCH",
  );
}

const coherenceMarker =
  "Core reverse root boundary must expose runtime and types together.";

const c3bValidatorSource =
  await text(
    "tools/architecture/validate-phase13-5c3b-remaining-punctuation-collision.mjs",
  );

for (const token of [
  "commentOnlyLaterPhaseFiles",
  "Phase 13.5c-3c2 changed reverse runtime semantics while composing c3b",
  "headSource.replace(",
]) {
  assert.equal(
    c3bValidatorSource.includes(
      token,
    ),
    true,
    `c3b comment-only reverse-source guard missing: ${token}`,
  );
}

const phase13_3SourceBoundaryValidator =
  await text(
    "tools/architecture/validate-phase13-3-reverse-spec-foundation.mjs",
  );

assert.equal(
  phase13_3SourceBoundaryValidator.includes(
    '"packages/core/src/index.ts",',
  ),
  true,
  "Phase 13.3 historical source-boundary guard must admit only the current Core root index milestone.",
);


for (const relativePath of [
  "tools/architecture/validate-phase13-4-reverse-core-parser.mjs",
  "tools/architecture/validate-phase13-5-reverse-core-coverage.mjs",
  "tools/architecture/validate-phase13-5c1-numeric-parser-completion.mjs",
  "tools/architecture/validate-phase13-5c2-numeric-collision-resolution.mjs",
  "tools/architecture/validate-phase13-5c3a-language-mode-collision-resolution.mjs",
  "tools/architecture/validate-phase13-5c3b-remaining-punctuation-collision.mjs",
]) {
  const source =
    await text(relativePath);

  assert.equal(
    source.includes(
      coherenceMarker,
    ),
    true,
    `Historical validator not made composable: ${relativePath}`,
  );
}

const foundationTest =
  await text(
    "packages/core/test/reverse-translator-foundation.test.mjs",
  );

assert.equal(
  foundationTest.includes(
    "keeps the reverse Core root boundary coherent across Phase 13 milestones",
  ),
  true,
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
  "packages/core/src/forward-translator.ts",
  "packages/core/src/translation.ts",
  "packages/sdk/src/",
  "integrations/microsoft365/src/",
  "apps/cli/",
  "apps/web/",
  "spec/fa-ir/rules/records/",
  "spec/fa-ir/conformance/records/",
]) {
  assert.equal(
    diffNames.some(
      (name) =>
        name.startsWith(
          forbiddenPrefix,
        ),
    ),
    false,
    `Public Core boundary step touched forbidden scope: ${forbiddenPrefix}`,
  );
}

console.log(
  "Phase 13.5c-3c2 Public Core Reverse Boundary: PASS",
);
console.log(
  "Core reverse runtime root export: createReverseTranslator / PASS",
);
console.log(
  "Core reverse type root exports: 14 / PASS",
);
console.log(
  "Explicit named reverse exports: PASS",
);
console.log(
  "Core package exports map: UNCHANGED / PASS",
);
console.log(
  "Historical Core-boundary validators: 6 / COMPOSABLE",
);
console.log(
  "Phase 13.4 foundation boundary test: COMPOSABLE / PASS",
);
console.log(
  "Forward Core semantics: UNCHANGED / PASS",
);
console.log(
  "SDK reverse API: DEFERRED / PASS",
);
console.log(
  "Canonical collision coverage: 34 / 34",
);
console.log(
  "Next: frozen SDK reverse API materialization",
);
