import assert from "node:assert/strict";
import {
  access,
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

const audit =
  await json(
    "docs/architecture/phase-12.5a-developer-docs-baseline-audit.json",
  );

const contract =
  await json(
    "docs/architecture/phase-12.2-developer-sdk-contract.json",
  );

const sdkPackage =
  await json(
    "packages/sdk/package.json",
  );

const rootPackage =
  await json(
    "package.json",
  );

const sdkReadme =
  await text(
    "packages/sdk/README.md",
  );

const guide =
  await text(
    "docs/architecture/phase-12.5-developer-documentation-and-integration-guide.md",
  );

const sdkIndex =
  await text(
    "packages/sdk/src/index.ts",
  );

assert.equal(
  audit.phase,
  "12.5a",
);

assert.deepEqual(
  audit.missingPhase12_5Sections,
  [
    "publicEntrypointAndDeepImportPolicy",
    "examplesNavigation",
    "versioningAndCompatibility",
  ],
);

assert.equal(
  contract.status,
  "FROZEN",
);

const requiredReadmeHeadings = [
  "### Supported environments",
  "### Public entrypoint and package boundary",
  "### Examples and quickstarts",
  "### Versioning and compatibility",
];

for (const heading of requiredReadmeHeadings) {
  assert.ok(
    sdkReadme.includes(
      heading,
    ),
    `SDK README missing heading: ${heading}`,
  );
}

for (const token of [
  'from "@persian-braille/sdk"',
  "@persian-braille/sdk/dist/index.js",
  "ERR_PACKAGE_PATH_NOT_EXPORTED",
  "CommonJS",
  "Deno",
  "Bun",
  "Direct browser/CDN package import",
  "Phase 13",
]) {
  assert.ok(
    sdkReadme.includes(
      token,
    ),
    `SDK README missing contract token: ${token}`,
  );
}

for (const token of [
  "CommonJS | Not claimed",
  "Deno | Not claimed",
  "Bun | Not claimed",
  "Direct browser/CDN package import | Not claimed",
]) {
  assert.ok(
    sdkReadme.includes(
      token,
    ),
    `SDK README runtime matrix missing: ${token}`,
  );
}

const exampleLinks = [
  "../../examples/",
  "../../examples/node-basic/",
  "../../examples/browser-basic/",
  "../../examples/error-handling/",
  "../../examples/integration-adapter/",
];

for (const relative of exampleLinks) {
  const resolved =
    path.resolve(
      root,
      "packages/sdk",
      relative,
    );

  await access(
    resolved,
  );

  assert.ok(
    sdkReadme.includes(
      `(${relative})`,
    ),
    `SDK README missing local example link: ${relative}`,
  );
}

const runtimeExports = [
  "PersianBrailleTranslationError",
  "createPersianBrailleTranslator",
];

const typeExports = [
  "CreatePersianBrailleTranslator",
  "PersianBrailleProfileInfo",
  "PersianBrailleTranslationErrorData",
  "PersianBrailleTranslationFailure",
  "PersianBrailleTranslationFailureCode",
  "PersianBrailleTranslationResult",
  "PersianBrailleTranslationSuccess",
  "PersianBrailleTranslator",
  "PersianBrailleUnicodeLocation",
];

for (const symbol of [
  ...runtimeExports,
  ...typeExports,
]) {
  assert.ok(
    sdkIndex.includes(
      symbol,
    ),
    `SDK public index missing frozen symbol: ${symbol}`,
  );

  assert.ok(
    sdkReadme.includes(
      `\`${symbol}\``,
    ),
    `SDK README missing frozen public symbol: ${symbol}`,
  );
}

assert.deepEqual(
  Object.keys(
    sdkPackage.exports,
  ),
  ["."],
);

assert.equal(
  contract.architecture.deepImportsFromSdkAllowed,
  false,
);

assert.equal(
  sdkReadme.includes(
    "translateFromBraille",
  ),
  true,
  "README must explicitly defer, not silently omit, reverse translation.",
);

for (const phrase of [
  "does not expose or promise a `translateFromBraille` API",
  "Reverse translation is deliberately outside this phase",
]) {
  assert.ok(
    sdkReadme.includes(
      phrase,
    ),
    `SDK README scope guard missing: ${phrase}`,
  );
}

for (const token of [
  "public entrypoint and deep-import policy",
  "SDK README navigation to the runnable examples",
  "versioning and compatibility policy",
  "Application/Integration -> SDK -> Core",
  "ERR_PACKAGE_PATH_NOT_EXPORTED",
  "Phase 12.6",
]) {
  assert.ok(
    guide.includes(
      token,
    ),
    `Phase 12.5 guide missing: ${token}`,
  );
}

assert.equal(
  rootPackage.scripts[
    "validate:phase12-5"
  ],
  "pnpm run validate:phase12-4 && "
    + "node tools/architecture/validate-phase12-5-developer-docs.mjs",
);

console.log(
  "Phase 12.5 Developer Documentation and Integration Guide: PASS",
);

console.log(
  "Phase 12.5a targeted gaps: 3 / 3 HARDENED",
);

console.log(
  "SDK installation and quickstart: PASS",
);

console.log(
  "Public entrypoint / deep-import policy: PASS",
);

console.log(
  "Runnable examples navigation: 4 / 4 PASS",
);

console.log(
  "Runtime support matrix: PASS",
);

console.log(
  "Versioning and compatibility policy: PASS",
);

console.log(
  "Reverse translation scope guard: Phase 13 / PASS",
);

console.log(
  "Frozen SDK runtime/type surface documentation: PASS",
);

console.log(
  "Next: Phase 12.6 Developer Ecosystem Regression and Closure",
);
