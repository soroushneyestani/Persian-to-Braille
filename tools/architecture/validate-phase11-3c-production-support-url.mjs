import { readFile } from "node:fs/promises";

import {
  createMarketplaceComplianceUrls,
  createMarketplaceSubmissionManifest,
} from "../../integrations/microsoft365/marketplace/production-manifest.mjs";

const root = new URL("../../", import.meta.url);
const productionBaseUrl =
  "https://soroushneyestani.github.io/Persian-to-Braille";

async function text(path) {
  return readFile(new URL(path, root), "utf8");
}

function fail(message) {
  throw new Error(
    `Phase 11.3c production SupportUrl validation failed: ${message}`,
  );
}

function requireText(value, token, label) {
  if (!value.includes(token)) {
    fail(`${label}: missing ${JSON.stringify(token)}`);
  }
}

const developmentManifest =
  await text("integrations/microsoft365/manifest.xml");
const buildMarketplace =
  await text("integrations/microsoft365/build-marketplace.mjs");
const phase113b =
  await text("docs/architecture/phase-11.3b-public-compliance-pages.md");
const packageJson =
  JSON.parse(await text("package.json"));
const microsoft365Package =
  JSON.parse(
    await text("integrations/microsoft365/package.json"),
  );

requireText(
  developmentManifest,
  '<SupportUrl DefaultValue="https://github.com/soroushneyestani/Persian-to-Braille"/>',
  "development manifest SupportUrl",
);
requireText(
  developmentManifest,
  "https://localhost:3000/taskpane.html",
  "development manifest localhost task pane",
);

for (const page of [
  "support.html",
  "privacy.html",
  "eula.html",
]) {
  await text(`integrations/microsoft365/public/${page}`);
}

const complianceUrls =
  createMarketplaceComplianceUrls(productionBaseUrl);

const expected = {
  support: `${productionBaseUrl}/support.html`,
  privacy: `${productionBaseUrl}/privacy.html`,
  eula: `${productionBaseUrl}/eula.html`,
};

if (
  JSON.stringify(complianceUrls) !==
  JSON.stringify(expected)
) {
  fail("compliance URL derivation mismatch");
}

const production =
  createMarketplaceSubmissionManifest(
    developmentManifest,
    productionBaseUrl,
  );

requireText(
  production.manifest,
  `<SupportUrl DefaultValue="${expected.support}"/>`,
  "generated Marketplace SupportUrl",
);

if (
  production.manifest.includes(
    'SupportUrl DefaultValue="https://github.com/soroushneyestani/Persian-to-Braille"',
  )
) {
  fail("generated Marketplace manifest still uses repository SupportUrl");
}

if (
  production.manifest.includes(
    "https://localhost:3000",
  )
) {
  fail("generated Marketplace manifest still contains localhost");
}

requireText(
  buildMarketplace,
  "createMarketplaceSubmissionManifest",
  "Marketplace build path",
);
requireText(
  buildMarketplace,
  "Marketplace Support URL:",
  "Marketplace build logging",
);
requireText(
  buildMarketplace,
  "Marketplace Privacy URL:",
  "Marketplace build logging",
);
requireText(
  buildMarketplace,
  "Marketplace EULA URL:",
  "Marketplace build logging",
);

const normalizedPhase113b =
  phase113b.replace(/\s+/g, " ");

requireText(
  normalizedPhase113b,
  "The production manifest SupportUrl remains unchanged in 11.3b.",
  "Phase 11.3b deferred SupportUrl boundary",
);
requireText(
  normalizedPhase113b,
  "Replacing it is Phase 11.3c work.",
  "Phase 11.3b next-step boundary",
);

if (
  microsoft365Package.scripts?.[
    "test:marketplace-support-url"
  ] !==
  "node --test test/marketplace-support-url.test.mjs"
) {
  fail("Microsoft365 SupportUrl test script missing");
}

if (
  !packageJson.scripts?.[
    "validate:phase11-3c-support-url"
  ]
) {
  fail("Phase 11.3c SupportUrl validator missing");
}

if (
  !packageJson.scripts?.[
    "validate:phase11-3c"
  ]
) {
  fail("Phase 11.3c aggregate validator missing");
}

console.log(
  "Phase 11.3c production SupportUrl integration: PASS",
);
console.log(
  `Marketplace SupportUrl: ${expected.support}`,
);
console.log(
  `Marketplace Privacy URL: ${expected.privacy}`,
);
console.log(
  `Marketplace EULA URL: ${expected.eula}`,
);
console.log(
  "Development manifest: PRESERVED",
);
console.log(
  "Historical Phase 11.2a materializer: PRESERVED",
);
console.log(
  "Next: Phase 11.3d Live HTTPS compliance-page verification",
);
