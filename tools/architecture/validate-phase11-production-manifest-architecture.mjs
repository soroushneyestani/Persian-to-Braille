import {
  readFile,
} from "node:fs/promises";

import {
  createProductionManifest,
  normalizeProductionBaseUrl,
} from "../../integrations/microsoft365/marketplace/production-manifest.mjs";

const root =
  new URL(
    "../../",
    import.meta.url,
  );

async function text(path) {
  return readFile(
    new URL(
      path,
      root,
    ),
    "utf8",
  );
}

function fail(message) {
  throw new Error(
    `Phase 11.2a production-manifest architecture validation failed: ${message}`,
  );
}

function requireText(
  value,
  token,
  label,
) {
  if (!value.includes(token)) {
    fail(
      `${label}: missing ${JSON.stringify(token)}`,
    );
  }
}

const developmentManifest =
  await text(
    "integrations/microsoft365/manifest.xml",
  );

const buildScript =
  await text(
    "integrations/microsoft365/build-marketplace.mjs",
  );

const packageJson =
  JSON.parse(
    await text(
      "package.json",
    ),
  );

const microsoft365Package =
  JSON.parse(
    await text(
      "integrations/microsoft365/package.json",
    ),
  );

const phase111 =
  JSON.parse(
    await text(
      "docs/architecture/phase-11.1-marketplace-baseline.json",
    ),
  );

if (
  phase111.status !==
  "closed-baseline-gaps-recorded"
) {
  fail(
    "Phase 11.1 baseline is not frozen",
  );
}

requireText(
  developmentManifest,
  "https://localhost:3000/taskpane.html",
  "frozen development manifest",
);

const fixtureBaseUrl =
  normalizeProductionBaseUrl(
    "https://example.com/persian-to-braille/",
  );

if (
  fixtureBaseUrl !==
  "https://example.com/persian-to-braille"
) {
  fail(
    "production base URL normalization changed unexpectedly",
  );
}

const production =
  createProductionManifest(
    developmentManifest,
    fixtureBaseUrl,
  );

if (
  production.manifest.includes(
    "https://localhost:3000",
  )
) {
  fail(
    "fixture production manifest still contains localhost",
  );
}

for (
  const token of [
    "https://example.com/persian-to-braille/taskpane.html",
    "https://example.com/persian-to-braille/commands.html",
    "https://example.com/persian-to-braille/assets/icon-16.png",
    "https://example.com/persian-to-braille/assets/icon-32.png",
    "https://example.com/persian-to-braille/assets/icon-80.png",
  ]
) {
  requireText(
    production.manifest,
    token,
    "fixture production manifest",
  );
}

for (
  const token of [
    '<Host Name="Document"/>',
    '<Host Name="Workbook"/>',
    '<Host Name="Presentation"/>',
    '<bt:Set Name="AddinCommands" MinVersion="1.1"/>',
    "<Permissions>ReadWriteDocument</Permissions>",
  ]
) {
  requireText(
    production.manifest,
    token,
    "preserved production manifest contract",
  );
}

requireText(
  production.manifest,
  '<SupportUrl DefaultValue="https://github.com/soroushneyestani/Persian-to-Braille"/>',
  "11.3-deferred SupportUrl",
);

for (
  const token of [
    "OFFICE_ADDIN_PRODUCTION_BASE_URL",
    "marketplace-dist",
    "site",
    "manifest.xml",
  ]
) {
  requireText(
    buildScript,
    token,
    "Marketplace build script",
  );
}

if (
  microsoft365Package.scripts?.["build:marketplace"] !==
  "pnpm run build && node build-marketplace.mjs"
) {
  fail(
    "Microsoft365 build:marketplace script is missing",
  );
}

if (
  microsoft365Package.scripts?.["test:marketplace"] !==
  "node --test test/marketplace-build.test.mjs"
) {
  fail(
    "Microsoft365 test:marketplace script is missing",
  );
}

if (
  !packageJson.scripts
    ?.["validate:phase11-production-manifest"]
) {
  fail(
    "root production-manifest validator is not registered",
  );
}

if (
  !packageJson.scripts
    ?.["validate:phase11-2a"]
) {
  fail(
    "Phase 11.2a aggregate validator is not registered",
  );
}

console.log(
  "Phase 11.2a production manifest / deployment architecture: PASS",
);
console.log(
  "Development manifest: PRESERVED / localhost",
);
console.log(
  "Marketplace manifest: GENERATED FROM EXPLICIT HTTPS BASE URL",
);
console.log(
  "Production hosting: NOT YET EXECUTED",
);
console.log(
  "SupportUrl replacement: DEFERRED TO 11.3",
);
console.log(
  "Next: Phase 11.2b actual HTTPS hosting + remote validation",
);
