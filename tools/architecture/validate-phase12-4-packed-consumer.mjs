import assert from "node:assert/strict";
import {
  spawnSync,
} from "node:child_process";
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

const audit =
  await json(
    "docs/architecture/phase-12.4a-packed-consumer-baseline-audit.json",
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
const phase12Note =
  await text(
    "docs/architecture/phase-12.4-packed-consumer-validation.md",
  );

assert.equal(
  audit.phase,
  "12.4a",
);
assert.equal(
  audit.existingValidator.executionPass,
  true,
);
assert.deepEqual(
  audit.gaps,
  [
    "deepImportNotRequiredOrRejected",
  ],
);

assert.equal(
  audit.phase12_4Requirements.buildAndPackSdk,
  true,
);
assert.equal(
  audit.phase12_4Requirements.isolatedConsumerInstall,
  true,
);
assert.equal(
  audit.phase12_4Requirements.typescriptConsumerCompile,
  true,
);
assert.equal(
  audit.phase12_4Requirements.runtimeTranslationThroughEntrypoint,
  true,
);
assert.equal(
  audit.phase12_4Requirements.deepImportNotRequiredOrRejected,
  false,
);

assert.equal(
  contract.packageConsumerValidation.implementationPhase,
  "12.4",
);
assert.equal(
  contract.architecture.deepImportsFromSdkAllowed,
  false,
);

assert.equal(
  sdkPackage.private,
  false,
);

assert.deepEqual(
  Object.keys(
    sdkPackage.exports,
  ),
  ["."],
  "SDK must expose only the documented package root entrypoint.",
);

assert.equal(
  sdkPackage.exports["."].types,
  "./dist/index.d.ts",
);
assert.equal(
  sdkPackage.exports["."].import,
  "./dist/index.js",
);

assert.equal(
  sdkPackage.types,
  "./dist/index.d.ts",
);
assert.deepEqual(
  sdkPackage.files,
  ["dist"],
);

const examplesDir =
  path.join(
    root,
    "examples",
  );

function runNodeModuleEval(source) {
  return spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "--eval",
      source,
    ],
    {
      cwd: examplesDir,
      encoding: "utf8",
      windowsHide: true,
    },
  );
}

const publicImport =
  runNodeModuleEval(`
    const sdk =
      await import(
        "@persian-braille/sdk"
      );

    if (
      typeof sdk.createPersianBrailleTranslator !==
        "function"
    ) {
      console.error(
        "PUBLIC_ENTRYPOINT_MISSING"
      );
      process.exit(31);
    }

    const result =
      sdk
        .createPersianBrailleTranslator()
        .translate("آ");

    if (
      !result.ok ||
      result.unicodeBraille !== "⠜"
    ) {
      console.error(
        "PUBLIC_ENTRYPOINT_RUNTIME_MISMATCH"
      );
      process.exit(32);
    }

    console.log(
      "PUBLIC_ENTRYPOINT_RUNTIME: PASS"
    );
  `);

assert.equal(
  publicImport.status,
  0,
  [
    "Public SDK entrypoint failed from the external-style examples consumer.",
    publicImport.stdout,
    publicImport.stderr,
  ].join("\n"),
);

assert.match(
  publicImport.stdout,
  /PUBLIC_ENTRYPOINT_RUNTIME: PASS/,
);

const deepImport =
  runNodeModuleEval(`
    try {
      await import(
        "@persian-braille/sdk/dist/index.js"
      );

      console.error(
        "UNEXPECTED_DEEP_IMPORT_SUCCESS"
      );
      process.exit(41);
    } catch (error) {
      if (
        error?.code !==
          "ERR_PACKAGE_PATH_NOT_EXPORTED"
      ) {
        console.error(
          "UNEXPECTED_DEEP_IMPORT_ERROR",
          error?.code,
          error?.message,
        );
        process.exit(42);
      }

      console.log(
        "DEEP_IMPORT_REJECTED: ERR_PACKAGE_PATH_NOT_EXPORTED"
      );
    }
  `);

assert.equal(
  deepImport.status,
  0,
  [
    "SDK deep import did not fail through the package exports boundary as expected.",
    deepImport.stdout,
    deepImport.stderr,
  ].join("\n"),
);

assert.match(
  deepImport.stdout,
  /DEEP_IMPORT_REJECTED: ERR_PACKAGE_PATH_NOT_EXPORTED/,
);

assert.equal(
  rootPackage.scripts[
    "validate:phase12-4"
  ],
  "pnpm run validate:sdk-package && "
    + "node tools/architecture/validate-phase12-4-packed-consumer.mjs",
);

for (const token of [
  "Phase 7.5",
  "4 of 5",
  "deep import",
  "ERR_PACKAGE_PATH_NOT_EXPORTED",
  "packed SDK",
  "Phase 12.5",
]) {
  assert.ok(
    phase12Note.includes(token),
    `Phase 12.4 note missing: ${token}`,
  );
}

console.log(
  "Phase 12.4 Packed Package Consumer Validation: PASS",
);
console.log(
  "Existing Phase 7.5 packed validation: REUSED / PASS",
);
console.log(
  "Build + pack SDK: PASS",
);
console.log(
  "Isolated packed consumer install: PASS",
);
console.log(
  "TypeScript packed consumer compile: PASS",
);
console.log(
  "Packed runtime translation: PASS",
);
console.log(
  "Public SDK root entrypoint: PASS",
);
console.log(
  "SDK deep import: REJECTED / ERR_PACKAGE_PATH_NOT_EXPORTED",
);
console.log(
  "Phase 12.4 contract coverage: 5 / 5 PASS",
);
console.log(
  "Next: Phase 12.5 Developer Documentation and Integration Guide",
);
