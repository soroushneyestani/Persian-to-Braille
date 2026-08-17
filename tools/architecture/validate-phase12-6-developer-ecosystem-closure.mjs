import assert from "node:assert/strict";
import {
  access,
  readFile,
  readdir,
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

async function walk(dir) {
  const files = [];
  const entries =
    await readdir(
      dir,
      {
        withFileTypes: true,
      },
    );

  for (const entry of entries) {
    const full =
      path.join(
        dir,
        entry.name,
      );

    if (entry.isDirectory()) {
      files.push(
        ...await walk(full),
      );
      continue;
    }

    files.push(full);
  }

  return files;
}

const contract =
  await json(
    "docs/architecture/phase-12.2-developer-sdk-contract.json",
  );

const rootPackage =
  await json(
    "package.json",
  );

const sdkPackage =
  await json(
    "packages/sdk/package.json",
  );

const closure =
  await text(
    "docs/architecture/phase-12.6-developer-ecosystem-closure.md",
  );

assert.equal(
  contract.status,
  "FROZEN",
);

for (const relativePath of [
  "docs/architecture/phase-12.3-runnable-sdk-examples.md",
  "docs/architecture/phase-12.4-packed-consumer-validation.md",
  "docs/architecture/phase-12.5-developer-documentation-and-integration-guide.md",
  "examples/node-basic/index.mjs",
  "examples/browser-basic/index.mjs",
  "examples/error-handling/index.mjs",
  "examples/integration-adapter/index.mjs",
]) {
  await access(
    path.join(
      root,
      relativePath,
    ),
  );
}

assert.equal(
  sdkPackage.private,
  false,
);

assert.deepEqual(
  Object.keys(
    sdkPackage.exports,
  ),
  ["."],
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
  contract.architecture.deepImportsFromSdkAllowed,
  false,
);

const expectedPhase126 =
  "pnpm run validate:phase12-3 && "
  + "pnpm run validate:phase12-5 && "
  + "pnpm run validate:boundaries && "
  + "pnpm run validate:hygiene && "
  + "pnpm --filter @persian-braille/core run test && "
  + "pnpm --filter @persian-braille/sdk run test && "
  + "node tools/architecture/"
  + "validate-phase12-6-developer-ecosystem-closure.mjs";

assert.equal(
  rootPackage.scripts[
    "validate:phase12-6"
  ],
  expectedPhase126,
);

assert.equal(
  rootPackage.scripts[
    "validate:phase12"
  ],
  "pnpm run validate:phase12-6",
);

for (const scriptName of [
  "validate:phase12-2",
  "validate:phase12-3",
  "validate:phase12-4",
  "validate:phase12-5",
  "validate:phase12-6",
  "validate:phase12",
]) {
  assert.ok(
    rootPackage.scripts[
      scriptName
    ],
    `missing Phase 12 script: ${scriptName}`,
  );
}

const sdkSourceFiles =
  (
    await walk(
      path.join(
        root,
        "packages/sdk/src",
      ),
    )
  ).filter(
    (file) =>
      /\.(?:ts|mts|cts|js|mjs|cjs)$/.test(
        file,
      ),
  );

for (const file of sdkSourceFiles) {
  const source =
    await readFile(
      file,
      "utf8",
    );

  assert.equal(
    source.includes(
      "translateFromBraille",
    ),
    false,
    `Phase 13 reverse API leaked into Phase 12 source: ${
      path.relative(root, file).replaceAll("\\", "/")
    }`,
  );
}

const normalizedClosure =
  closure.replace(
    /\s+/g,
    " ",
  );

for (const token of [
  "Phase 12.3",
  "Phase 12.5",
  "repository package-boundary validation",
  "Core tests",
  "SDK tests",
  "Phase 13 — Reverse Translation",
  "Phase 14 — Braille Music",
  "Phase 15 — Multi-language / General Braille Framework",
  "Phase 16 — Office on the Web",
  "Phase 17 — Microsoft 365 Mac",
  "Phase 18 — Microsoft Marketplace / Partner Center",
  "does not itself assert that the package has been published",
]) {
  assert.ok(
    normalizedClosure.includes(
      token,
    ),
    `Phase 12.6 closure note missing: ${token}`,
  );
}

console.log(
  "Phase 12.6 Developer Ecosystem Regression and Closure: PASS",
);

console.log(
  "Phase 12.2 frozen SDK contract: PASS",
);

console.log(
  "Phase 12.3 runnable examples: PRESENT / REGRESSION PASS",
);

console.log(
  "Phase 12.4 packed consumer boundary: PRESENT / REGRESSION PASS",
);

console.log(
  "Phase 12.5 developer documentation: PRESENT / REGRESSION PASS",
);

console.log(
  "SDK public package root: @persian-braille/sdk / PASS",
);

console.log(
  "SDK deep imports: DISALLOWED / PASS",
);

console.log(
  "Reverse translation API in Phase 12 source: NONE / PASS",
);

console.log(
  "Deferred roadmap phases 13-18: PRESERVED",
);

console.log(
  "PHASE 12 — DEVELOPER ECOSYSTEM: READY TO CLOSE",
);
