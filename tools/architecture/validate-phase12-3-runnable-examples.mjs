import assert from "node:assert/strict";
import {
  readFile,
  readdir,
  stat,
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

const requiredDirs = [
  "examples/node-basic",
  "examples/browser-basic",
  "examples/error-handling",
  "examples/integration-adapter",
];

const requiredFiles = [
  "examples/package.json",
  "examples/README.md",
  "examples/node-basic/index.mjs",
  "examples/node-basic/README.md",
  "examples/browser-basic/index.mjs",
  "examples/browser-basic/README.md",
  "examples/error-handling/index.mjs",
  "examples/error-handling/README.md",
  "examples/integration-adapter/index.mjs",
  "examples/integration-adapter/README.md",
  "examples/test/examples.test.mjs",
  "docs/architecture/phase-12.3-runnable-sdk-examples.md",
];

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

for (const relativePath of requiredDirs) {
  const info =
    await stat(
      path.join(root, relativePath),
    );
  assert.equal(
    info.isDirectory(),
    true,
    `required example directory missing: ${relativePath}`,
  );
}

for (const relativePath of requiredFiles) {
  const info =
    await stat(
      path.join(root, relativePath),
    );
  assert.equal(
    info.isFile(),
    true,
    `required example file missing: ${relativePath}`,
  );
}

const contract =
  await json(
    "docs/architecture/phase-12.2-developer-sdk-contract.json",
  );
const packageJson =
  await json("package.json");
const examplesPackage =
  await json(
    "examples/package.json",
  );
const workspace =
  await text(
    "pnpm-workspace.yaml",
  );
const note =
  await text(
    "docs/architecture/phase-12.3-runnable-sdk-examples.md",
  );

assert.equal(
  contract.status,
  "FROZEN",
);
assert.equal(
  contract.examplesArchitecture.implementationPhase,
  "12.3",
);
assert.deepEqual(
  contract.examplesArchitecture.required
    .map((item) => item.path),
  requiredDirs,
);

assert.equal(
  examplesPackage.name,
  "@persian-braille/examples",
);
assert.equal(
  examplesPackage.private,
  true,
);
assert.equal(
  examplesPackage.dependencies[
    "@persian-braille/sdk"
  ],
  "workspace:*",
);
assert.equal(
  examplesPackage.dependencies[
    "@persian-braille/core"
  ],
  undefined,
);

assert.match(
  workspace,
  /-\s+['"]examples['"]/,
);

const sourceFiles = [];

async function collect(dir) {
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
      if (
        entry.name === "node_modules"
      ) {
        continue;
      }
      await collect(full);
      continue;
    }

    if (
      entry.name.endsWith(".mjs")
    ) {
      sourceFiles.push(full);
    }
  }
}

await collect(
  path.join(root, "examples"),
);

let publicSdkImportCount = 0;

for (const full of sourceFiles) {
  const relative =
    path.relative(
      root,
      full,
    ).replaceAll("\\", "/");
  const source =
    await readFile(
      full,
      "utf8",
    );

  assert.equal(
    source.includes(
      "@persian-braille/core",
    ),
    false,
    `executable example directly imports Core: ${relative}`,
  );

  assert.equal(
    /@persian-braille\/sdk\//.test(
      source,
    ),
    false,
    `example uses an SDK deep import: ${relative}`,
  );

  if (
    source.includes(
      'from "@persian-braille/sdk"',
    )
    || source.includes(
      "from '@persian-braille/sdk'",
    )
  ) {
    publicSdkImportCount += 1;
  }
}

assert.ok(
  publicSdkImportCount >= 4,
  "all executable example surfaces must demonstrate the public SDK entrypoint",
);

const browserReadme =
  await text(
    "examples/browser-basic/README.md",
  );

assert.match(
  browserReadme,
  /bundler-oriented/i,
);
assert.match(
  browserReadme,
  /does \*\*not\*\* claim direct CDN\/browser package imports/i,
);

const errorExample =
  await text(
    "examples/error-handling/index.mjs",
  );
assert.match(
  errorExample,
  /result\.ok/,
);
assert.match(
  errorExample,
  /result\.code/,
);
assert.match(
  errorExample,
  /result\.message/,
);
assert.equal(
  errorExample.includes(
    "result.error",
  ),
  false,
  "error-handling example must use the frozen top-level failure contract",
);

const integrationExample =
  await text(
    "examples/integration-adapter/index.mjs",
  );
assert.match(
  integrationExample,
  /createPersianBrailleTranslator/,
);
assert.match(
  integrationExample,
  /translator\.translate/,
);

assert.equal(
  packageJson.scripts[
    "validate:phase12-3"
  ],
  "pnpm run validate:phase12-2 && "
    + "pnpm --filter @persian-braille/core run build && "
    + "pnpm --filter @persian-braille/sdk run build && "
    + "pnpm --filter @persian-braille/examples run test && "
    + "node tools/architecture/validate-phase12-3-runnable-examples.mjs",
);

for (const token of [
  "node-basic",
  "browser-basic",
  "error-handling",
  "integration-adapter",
  "public `@persian-braille/sdk`",
  "does not claim direct browser CDN",
  "Phase 12.4",
]) {
  assert.ok(
    note.includes(token),
    `Phase 12.3 note missing: ${token}`,
  );
}

console.log(
  "Phase 12.3 Runnable SDK Examples: PASS",
);
console.log(
  "Examples: 4 / 4 PRESENT",
);
console.log(
  "Public SDK entrypoint only: PASS",
);
console.log(
  "Direct Core imports in examples: NONE / PASS",
);
console.log(
  "SDK deep imports in examples: NONE / PASS",
);
console.log(
  "Node basic example: PASS",
);
console.log(
  "Browser/bundler example: PASS",
);
console.log(
  "Structured failure example: PASS",
);
console.log(
  "Third-party adapter example: PASS",
);
console.log(
  "Packed package validation: DEFERRED TO PHASE 12.4",
);
