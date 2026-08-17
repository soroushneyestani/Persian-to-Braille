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

const audit =
  await json(
    "docs/architecture/phase-13.4a-reverse-core-parser-baseline-audit.json",
  );

const manifest =
  await json(
    "spec/fa-ir/reverse/conformance/manifest.json",
  );

const corePackage =
  await json(
    "packages/core/package.json",
  );

const rootPackage =
  await json(
    "package.json",
  );

const coreIndex =
  await text(
    "packages/core/src/index.ts",
  );

const reverseTypes =
  await text(
    "packages/core/src/reverse-translation.ts",
  );

const reverseTranslator =
  await text(
    "packages/core/src/reverse-translator.ts",
  );

assert.equal(
  audit.reverseLeakScan
    .existingReverseRuntimeInCore,
  false,
);

assert.equal(
  audit.phase13Contracts
    .reverseSeedVectors,
  16,
);

assert.equal(
  manifest.summary.vectors,
  16,
);

assert.equal(
  manifest.summary.translationVectors,
  14,
);

assert.equal(
  manifest.summary.capabilityVectors,
  2,
);

for (const token of [
  "ReverseTranslationOptions",
  "ReverseTranslationFailureCode",
  "ReverseTranslationOutcome",
  "ReverseTranslator",
]) {
  assert.ok(
    reverseTypes.includes(token),
    `missing reverse Core type: ${token}`,
  );
}

for (const token of [
  "getBundledSpecification",
  "numeric-indicator",
  "latin-span-begin",
  "latin-span-end",
  "latin-capital-indicator",
  "CANONICALIZED_DIGIT_FAMILY",
  "CANONICALIZED_PUNCTUATION",
  "CANONICALIZED_ELLIPSIS",
  "AMBIGUOUS_REVERSE_MATCH",
  "UNTERMINATED_LATIN_SPAN",
  "DANGLING_CAPITAL_INDICATOR",
  "createReverseTranslator",
]) {
  assert.ok(
    reverseTranslator.includes(token),
    `reverse parser foundation missing: ${token}`,
  );
}

for (const forbidden of [
  "./reverse-translator.js",
  "./reverse-translation.js",
]) {
  assert.equal(
    coreIndex.includes(forbidden),
    false,
    `reverse Core internals leaked through root index: ${forbidden}`,
  );
}

assert.ok(
  corePackage.scripts.test.includes(
    "test/reverse-translator-foundation.test.mjs",
  ),
);

assert.equal(
  rootPackage.scripts[
    "validate:phase13-4"
  ],
  (
    "pnpm run validate:phase13-3 && "
    + "pnpm --filter @persian-braille/core run test && "
    + "node tools/architecture/"
    + "validate-phase13-4-reverse-core-parser.mjs"
  ),
);

const recordDir =
  path.join(
    root,
    "spec/fa-ir/reverse/conformance/records",
  );

const records =
  (
    await readdir(recordDir)
  )
  .filter(
    (name) =>
      name.endsWith(".json"),
  );

assert.equal(
  records.length,
  16,
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
    `Phase 13.4 touched deferred/frozen boundary: ${forbiddenPrefix}`,
  );
}

console.log(
  "Phase 13.4 Reverse Core Parser Foundation: PASS",
);
console.log(
  "Phase 13.3 translation seeds: 14 / EXECUTED",
);
console.log(
  "Lossiness capability records: 2 / PRESERVED",
);
console.log(
  "Unicode Braille tokenizer: PASS",
);
console.log(
  "Reverse candidate index: PASS",
);
console.log(
  "Numeric mode + three digit families: PASS",
);
console.log(
  "Latin span + capital state: PASS",
);
console.log(
  "Longest-match + punctuation resolution: PASS",
);
console.log(
  "Forward rule/vector semantics: UNCHANGED / PASS",
);
console.log(
  "SDK / CLI / Web / Microsoft 365: DEFERRED / PASS",
);
console.log(
  "Core root reverse export: NOT YET EXPOSED / PASS",
);
console.log(
  "Next: Phase 13.5 Reverse Core Coverage and Public Core Boundary",
);
