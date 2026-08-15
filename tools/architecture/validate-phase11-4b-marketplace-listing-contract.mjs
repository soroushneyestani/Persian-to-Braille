import { readFile } from "node:fs/promises";

const root = new URL("../../", import.meta.url);

async function readText(path) {
  return readFile(new URL(path, root), "utf8");
}

async function readBytes(path) {
  return readFile(new URL(path, root));
}

function fail(message) {
  throw new Error(`Phase 11.4b listing contract validation failed: ${message}`);
}

function requireText(value, token, label) {
  if (!value.includes(token)) {
    fail(`${label}: missing ${JSON.stringify(token)}`);
  }
}

function pngDimensions(buffer) {
  if (
    buffer.length < 24
    || buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a"
    || buffer.subarray(12, 16).toString("ascii") !== "IHDR"
  ) {
    fail("icon-64.png is not a valid PNG with an IHDR header");
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

const listing = JSON.parse(
  await readText("integrations/microsoft365/marketplace/listing/en-US.json"),
);

const note = await readText(
  "docs/architecture/phase-11.4b-marketplace-listing-contract.md",
);

const manifest = await readText("integrations/microsoft365/manifest.xml");
const packageJson = JSON.parse(await readText("package.json"));

if (listing.schemaVersion !== 1 || listing.phase !== "11.4b") {
  fail("unexpected listing schema/phase");
}

if (listing.locale !== "en-US") {
  fail("listing locale must remain en-US");
}

if (listing.name !== "Persian-to-Braille") {
  fail("listing name must match the manifest DisplayName");
}

if (listing.name.length > 50) {
  fail("listing name exceeds the current 50-character maximum");
}

if (!listing.summary || listing.summary.length > 100) {
  fail("listing summary must be non-empty and at most 100 characters");
}

if (!listing.description || listing.description.length > 10000) {
  fail("listing description must be non-empty and at most 10,000 characters");
}

const descriptionWords = listing.description
  .trim()
  .split(/\s+/)
  .filter(Boolean)
  .length;

if (descriptionWords < 300 || descriptionWords > 500) {
  fail(
    `listing description should remain in the 300-500 word target; got ${descriptionWords}`,
  );
}

if (
  listing.publisher?.manifestProviderName !== "Soroush Neyestani"
  || listing.publisher?.partnerCenterStatus !== "external-blocked"
) {
  fail("publisher baseline changed");
}

if (
  JSON.stringify(listing.hosts) !==
  JSON.stringify(["Word", "Excel", "PowerPoint"])
) {
  fail("listing host set changed");
}

if (
  listing.categories?.status !== "deferred-to-live-partner-center-ui"
  || listing.categories?.requiredCount?.min !== 1
  || listing.categories?.requiredCount?.max !== 3
) {
  fail("category decision contract is inconsistent");
}

if (
  !Array.isArray(listing.industries?.selected)
  || listing.industries.selected.length !== 0
) {
  fail("industries must remain intentionally unselected");
}

if (
  !Array.isArray(listing.screenshots)
  || listing.screenshots.length !== 3
  || listing.screenshots.some((item) => item.status !== "planned")
) {
  fail("three-host screenshot plan is incomplete");
}

for (const url of Object.values(listing.complianceUrls ?? {})) {
  if (typeof url !== "string" || !url.startsWith("https://")) {
    fail("all compliance URLs must be HTTPS");
  }
}

if (
  listing.manualPreviewDistribution?.classification !== "manual-sideload-preview"
  || listing.manualPreviewDistribution?.mustNotClaimMarketplacePublication !== true
) {
  fail("manual preview distribution guard is missing");
}

requireText(
  manifest,
  '<DisplayName DefaultValue="Persian-to-Braille"/>',
  "development manifest",
);

requireText(
  manifest,
  '<HighResolutionIconUrl DefaultValue="https://localhost:3000/assets/icon-64.png"/>',
  "development manifest",
);

if (
  manifest.includes(
    '<HighResolutionIconUrl DefaultValue="https://localhost:3000/assets/icon-80.png"/>',
  )
) {
  fail("legacy 80x80 HighResolutionIconUrl is still active");
}

requireText(
  manifest,
  "assets/icon-80.png",
  "development manifest command icon preservation",
);

const icon = pngDimensions(
  await readBytes("integrations/microsoft365/public/assets/icon-64.png"),
);

if (icon.width !== 64 || icon.height !== 64) {
  fail(`icon-64.png must be 64x64; got ${icon.width}x${icon.height}`);
}

const normalizedNote = note.replace(/\s+/g, " ").trim();

for (const token of [
  "IMPLEMENTED / VALIDATION REQUIRED",
  "do not invent a category identifier in the repository",
  "select no industry because this add-in is not industry-specific",
  "The existing `icon-80.png` remains in the repository",
  "manual/sideload preview distribution",
  "must not be described as Microsoft Marketplace publication",
]) {
  requireText(normalizedNote, token, "Phase 11.4b contract note");
}

if (
  packageJson.scripts?.["validate:phase11-4b-listing-contract"] !==
  "node tools/architecture/validate-phase11-4b-marketplace-listing-contract.mjs"
) {
  fail("Phase 11.4b listing validator package script missing");
}

if (
  packageJson.scripts?.["validate:phase11-4b"] !==
  "pnpm run validate:phase11-4a && pnpm run validate:phase11-4b-listing-contract"
) {
  fail("Phase 11.4b aggregate validator package script missing");
}

console.log("Phase 11.4b Marketplace listing contract: PASS");
console.log("Name / locale / publisher identity: FROZEN");
console.log(`Summary: ${listing.summary.length} chars / PASS`);
console.log(`Description: ${descriptionWords} words / PASS`);
console.log("Manifest high-resolution icon: 64x64 / PASS");
console.log("Command icon-80 asset: PRESERVED");
console.log("Categories: LIVE PARTNER CENTER UI COMPLETION ITEM");
console.log("Industries: NONE / INTENTIONAL");
console.log("Screenshots: 3 HOST PLAN / PENDING CAPTURE");
console.log("Publisher gate: EXTERNAL BLOCKED / PRESERVED");
console.log("Next: Phase 11.4c Public Manual Preview Distribution");
