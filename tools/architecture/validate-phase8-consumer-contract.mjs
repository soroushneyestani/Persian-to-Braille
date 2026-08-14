import {
  readFile,
} from "node:fs/promises";
import {
  dirname,
  resolve,
} from "node:path";
import {
  fileURLToPath,
} from "node:url";

const scriptDir =
  dirname(
    fileURLToPath(import.meta.url),
  );
const repoRoot =
  resolve(scriptDir, "../..");

const contractPath =
  resolve(
    repoRoot,
    "docs/architecture/phase-8.2-consumer-application-contract.json",
  );

const contract =
  JSON.parse(
    await readFile(
      contractPath,
      "utf8",
    ),
  );

function fail(message) {
  console.error(
    `PHASE 8 CONSUMER CONTRACT ERROR: ${message}`,
  );
  process.exitCode = 1;
}

function expect(
  condition,
  message,
) {
  if (!condition) {
    fail(message);
  }
}

expect(
  contract.contractVersion === "1.0.0",
  "contractVersion must be 1.0.0.",
);
expect(
  contract.phase === "8.2",
  "phase must be 8.2.",
);
expect(
  contract.translationOwner ===
    "@persian-braille/sdk",
  "translationOwner must be the public SDK.",
);
expect(
  contract.architecture?.cliDependency ===
    "@persian-braille/sdk",
  "CLI dependency boundary drifted.",
);
expect(
  contract.architecture?.webDependency ===
    "@persian-braille/sdk",
  "Web dependency boundary drifted.",
);
expect(
  contract.architecture
    ?.applicationOwnedTranslationSemantics ===
    false,
  "Applications must not own translation semantics.",
);

const cli =
  contract.cli;
expect(
  cli?.package ===
    "@persian-braille/cli",
  "CLI package name drifted.",
);
expect(
  cli?.executable ===
    "persian-braille",
  "CLI executable name drifted.",
);

const translate =
  cli?.commands?.translate;
expect(
  JSON.stringify(
    translate?.inputSources,
  ) ===
    JSON.stringify([
      "arguments",
      "stdin",
    ]),
  "CLI input-source contract drifted.",
);
expect(
  translate?.inputSourceRule ===
    "exactly-one",
  "CLI must accept exactly one translation input source.",
);
expect(
  JSON.stringify(
    translate?.formats,
  ) ===
    JSON.stringify([
      "unicode",
      "cells",
      "json",
    ]),
  "CLI translation formats drifted.",
);
expect(
  translate?.defaultFormat ===
    "unicode",
  "CLI default format must be unicode.",
);
expect(
  translate?.jsonEnvelopeVersion ===
    "1",
  "CLI JSON envelope version drifted.",
);

const exitCodes =
  cli?.exitCodes ?? {};
expect(
  exitCodes.success === 0 &&
    exitCodes.translationFailure === 1 &&
    exitCodes.usageError === 2 &&
    exitCodes.internalError === 3,
  "CLI exit-code contract drifted.",
);
expect(
  new Set(
    Object.values(exitCodes),
  ).size === 4,
  "CLI exit codes must remain distinct.",
);

expect(
  contract.web?.package ===
    "@persian-braille/web",
  "Web package name drifted.",
);
expect(
  contract.web?.runtime ===
    "browser-local",
  "Web runtime must remain browser-local.",
);
expect(
  contract.web
    ?.translationNetworkRequests ===
    false,
  "Phase 8 Web must not send translation input to a network service.",
);
expect(
  contract.web?.inputPersistence ===
    "none",
  "Phase 8 Web must not persist translation input.",
);
expect(
  contract.web
    ?.draftProfileDisclosure ===
    true,
  "Web must disclose draft profile status.",
);

const requiredControls =
  new Set(
    contract.web
      ?.requiredControls ?? [],
  );
for (
  const control of [
    "print-text-input",
    "translate",
    "clear",
    "copy-unicode-braille",
  ]
) {
  expect(
    requiredControls.has(control),
    `Web required control missing: ${control}.`,
  );
}

const requiredPresentation =
  new Set(
    contract.web
      ?.requiredPresentation ?? [],
  );
for (
  const field of [
    "unicode-braille",
    "cells",
    "profile-id",
    "profile-version",
    "profile-status",
    "profile-direction",
    "normalized-text",
    "structural-tokens",
    "translation-error",
  ]
) {
  expect(
    requiredPresentation.has(field),
    `Web required presentation field missing: ${field}.`,
  );
}

const parity =
  contract.parity?.required ?? [];
expect(
  parity.length >= 5,
  "CLI/Web parity contract is incomplete.",
);

const outOfScope =
  new Set(
    contract.outOfScope ?? [],
  );
for (
  const item of [
    "server-side translation API",
    "Core trace exposure",
    "normative rule promotion",
    "reverse Braille translation",
    "npm publication",
  ]
) {
  expect(
    outOfScope.has(item),
    `Finite Phase 8 scope exclusion missing: ${item}.`,
  );
}

for (
  const [packagePath, expectedName] of [
    [
      "apps/cli/package.json",
      "@persian-braille/cli",
    ],
    [
      "apps/web/package.json",
      "@persian-braille/web",
    ],
  ]
) {
  const manifest =
    JSON.parse(
      await readFile(
        resolve(
          repoRoot,
          packagePath,
        ),
        "utf8",
      ),
    );

  expect(
    manifest.name === expectedName,
    `${packagePath} package name drifted.`,
  );
  expect(
    manifest.dependencies?.[
      "@persian-braille/sdk"
    ] === "workspace:*",
    `${expectedName} must depend on SDK via workspace:*.`,
  );
  expect(
    !manifest.dependencies?.[
      "@persian-braille/core"
    ],
    `${expectedName} must not directly depend on Core.`,
  );
}

if (process.exitCode) {
  process.exit(
    process.exitCode,
  );
}

console.log(
  "Phase 8 consumer application contract validation: PASS",
);
console.log(
  "CLI: persian-braille translate/profile",
);
console.log(
  "CLI formats: unicode, cells, json",
);
console.log(
  "CLI exit codes: success=0, translationFailure=1, usageError=2, internalError=3",
);
console.log(
  "Web runtime: browser-local",
);
console.log(
  "Translation network requests: disabled",
);
console.log(
  "Input persistence: none",
);
console.log(
  "Architecture: CLI/Web -> SDK only",
);
