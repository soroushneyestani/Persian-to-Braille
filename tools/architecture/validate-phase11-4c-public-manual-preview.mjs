import {
  readFile,
} from "node:fs/promises";

const root = new URL("../../", import.meta.url);

async function text(path) {
  return readFile(new URL(path, root), "utf8");
}

function fail(message) {
  throw new Error(
    `Phase 11.4c public manual preview validation failed: ${message}`,
  );
}

function requireText(value, token, label) {
  if (!value.includes(token)) {
    fail(`${label}: missing ${JSON.stringify(token)}`);
  }
}

const page = await text(
  "integrations/microsoft365/public/install.html",
);

const builder = await text(
  "integrations/microsoft365/build-manual-preview.mjs",
);

const workflow = await text(
  ".github/workflows/microsoft365-marketplace-pages.yml",
);

const note = await text(
  "docs/architecture/phase-11.4c-public-manual-preview-distribution.md",
);

const packageJson = JSON.parse(await text("package.json"));

for (const token of [
  "Manual Preview Installation",
  "./install/manifest.xml",
  "https://soroushneyestani.github.io/Persian-to-Braille/install/manifest.xml",
  "Upload My Add-in",
  "Settings → Integrated apps",
  "not supported for",
  "production add-ins",
  "Web and Mac: release-gate execution remains pending",
  "not Microsoft Marketplace",
]) {
  requireText(page, token, "public install page");
}

for (const token of [
  "marketplace-dist",
  "manifest.xml",
  "site",
  "install",
  "localhost",
  "MANUAL SIDELOAD PREVIEW / NOT MARKETPLACE PUBLICATION",
]) {
  requireText(builder, token, "manual preview build");
}

requireText(
  workflow,
  "pnpm run build:marketplace-preview",
  "GitHub Pages workflow",
);

if (workflow.includes("pnpm run build:marketplace\n")) {
  fail(
    "GitHub Pages workflow still invokes the old build:marketplace command directly",
  );
}

const normalizedNote = note.replace(/\s+/g, " ").trim();

for (const token of [
  "MANUAL SIDELOAD PREVIEW",
  "NOT MICROSOFT MARKETPLACE PUBLICATION",
  "single production-manifest materialization path",
  "strongest non-Marketplace distribution path for organizations",
  "Web / Mac: EXPECTED / NOT EXECUTED",
  "EXTERNAL BLOCKED / NOT SATISFIED",
]) {
  requireText(normalizedNote, token, "Phase 11.4c architecture note");
}

const scripts = packageJson.scripts ?? {};

const expectedScripts = {
  "build:manual-preview":
    "node integrations/microsoft365/build-manual-preview.mjs",
  "build:marketplace-preview":
    "pnpm --filter @persian-braille/microsoft365 run build:marketplace && pnpm run build:manual-preview",
  "test:manual-preview":
    "node --test integrations/microsoft365/test/manual-preview-distribution.test.mjs",
  "validate:phase11-4c-manual-preview":
    "node tools/architecture/validate-phase11-4c-public-manual-preview.mjs",
  "validate:phase11-4c":
    "pnpm run validate:phase11-4b && pnpm run build:marketplace-preview && pnpm run test:manual-preview && pnpm run validate:phase11-4c-manual-preview",
};

for (const [name, expected] of Object.entries(expectedScripts)) {
  if (scripts[name] !== expected) {
    fail(
      `package script ${name} mismatch; expected ${JSON.stringify(expected)}`,
    );
  }
}

const candidateDistRoots = [
  "marketplace-dist",
  "integrations/microsoft365/marketplace-dist",
];

let resolvedDist = null;

for (const candidate of candidateDistRoots) {
  try {
    await text(`${candidate}/manifest.xml`);
    await text(`${candidate}/site/install.html`);
    resolvedDist = candidate;
    break;
  } catch {
    // Try the next supported output location.
  }
}

if (!resolvedDist) {
  fail("unable to locate generated marketplace-dist");
}

const builtManifest = await text(
  `${resolvedDist}/site/install/manifest.xml`,
);
const marketplaceManifest = await text(
  `${resolvedDist}/manifest.xml`,
);
const builtPage = await text(
  `${resolvedDist}/site/install.html`,
);

if (builtManifest !== marketplaceManifest) {
  fail("hosted preview manifest differs from generated Marketplace manifest");
}

if (builtManifest.includes("localhost")) {
  fail("hosted preview manifest contains localhost");
}

if (builtPage !== page) {
  fail("generated install page differs from committed source");
}

console.log("Phase 11.4c Public Manual Preview Distribution: PASS");
console.log("Install page: GENERATED / PASS");
console.log("Hosted production manifest: EXACT MARKETPLACE MANIFEST COPY / PASS");
console.log("Localhost in hosted manifest: NONE / PASS");
console.log("Office on the web: MANUAL SIDELOAD PREVIEW DOCUMENTED");
console.log("Microsoft 365 admin: CUSTOM MANIFEST DEPLOYMENT DOCUMENTED");
console.log("Mac: PREVIEW / NOT LIVE VERIFIED");
console.log("Windows network share: NOT RECOMMENDED FOR PUBLIC DISTRIBUTION");
console.log("Marketplace publication claim: NONE / PASS");
console.log("Publisher gate: EXTERNAL BLOCKED / PRESERVED");
console.log("Next: deploy branch and run Phase 11.4c live HTTPS verification");
