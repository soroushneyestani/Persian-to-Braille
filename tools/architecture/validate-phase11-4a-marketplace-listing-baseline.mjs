import { readFile } from "node:fs/promises";
import { stat } from "node:fs/promises";

const root = new URL("../../", import.meta.url);

async function text(path) {
  return readFile(new URL(path, root), "utf8");
}

function fail(message) {
  throw new Error(`Phase 11.4a baseline validation failed: ${message}`);
}

function requireText(value, token, label) {
  if (!value.includes(token)) {
    fail(`${label}: missing ${JSON.stringify(token)}`);
  }
}

const evidence = JSON.parse(
  await text(
    "docs/architecture/phase-11.4a-marketplace-listing-baseline-audit.json",
  ),
);

const note = await text(
  "docs/architecture/phase-11.4a-marketplace-listing-baseline.md",
);

const audit = await text(
  "docs/architecture/phase-11.4a-marketplace-listing-baseline-audit.txt",
);

const manifest = await text(
  "integrations/microsoft365/manifest.xml",
);

const packageJson = JSON.parse(await text("package.json"));

if (evidence.phase !== "11.4a" || evidence.status !== "baseline-audited") {
  fail("machine-readable baseline phase/status mismatch");
}

if (evidence.baselineCommit !== "86bbfdf") {
  fail("unexpected baseline commit");
}

if (evidence.listingIdentity?.displayName !== "Persian-to-Braille") {
  fail("unexpected frozen DisplayName");
}

if (evidence.listingIdentity?.providerName !== "Soroush Neyestani") {
  fail("unexpected frozen ProviderName");
}

if (evidence.listingIdentity?.defaultLocale !== "en-US") {
  fail("unexpected frozen DefaultLocale");
}

const hi = evidence.iconAudit?.highResolutionIconUrl;
if (
  hi?.path !== "integrations/microsoft365/public/assets/icon-80.png"
  || hi?.dimensions?.[0] !== 80
  || hi?.dimensions?.[1] !== 80
  || hi?.requiredDimensions?.[0] !== 64
  || hi?.requiredDimensions?.[1] !== 64
  || hi?.classification !== "gap"
) {
  fail("HighResolutionIconUrl gap baseline changed");
}

for (const token of [
  "[PASS] Phase 11.3 baseline remains green.",
  "DisplayName: Persian-to-Braille",
  "ProviderName: Soroush Neyestani",
  "DefaultLocale: en-US",
  "[GAP] HighResolutionIconUrl dimensions do not match",
  "[GAP] No dedicated Marketplace listing metadata/assets directory exists yet.",
  "[EXTERNAL] Partner Center publisher enrollment remains blocked per Phase 11.3e",
]) {
  requireText(audit, token, "read-only audit evidence");
}

const normalizedNote = note.replace(/\s+/g, " ").trim();

for (const token of [
  "AUDITED / GAPS RECORDED",
  "HighResolutionIconUrl",
  "80 x 80",
  "64 x 64",
  "manual-preview installation page",
  "must not be represented as Microsoft Marketplace publication",
]) {
  requireText(normalizedNote, token, "Phase 11.4a baseline note");
}

requireText(
  manifest,
  '<DisplayName DefaultValue="Persian-to-Braille"/>',
  "development manifest",
);

requireText(
  manifest,
  '<ProviderName>Soroush Neyestani</ProviderName>',
  "development manifest",
);

requireText(
  manifest,
  '<DefaultLocale>en-US</DefaultLocale>',
  "development manifest",
);

requireText(
  manifest,
  'https://localhost:3000/assets/icon-32.png',
  "development manifest",
);

if (
  !manifest.includes("https://localhost:3000/assets/icon-80.png")
  && !manifest.includes("https://localhost:3000/assets/icon-64.png")
) {
  fail(
    "development manifest must preserve the audited high-resolution icon "
    + "baseline or a validated later remediation",
  );
}

await stat(
  new URL(
    "../../integrations/microsoft365/public/assets/icon-32.png",
    import.meta.url,
  ),
);

await stat(
  new URL(
    "../../integrations/microsoft365/public/assets/icon-80.png",
    import.meta.url,
  ),
);

if (
  packageJson.scripts?.["validate:phase11-4a-baseline"] !==
  "node tools/architecture/validate-phase11-4a-marketplace-listing-baseline.mjs"
) {
  fail("Phase 11.4a baseline validator script missing");
}

if (
  packageJson.scripts?.["validate:phase11-4a"] !==
  "pnpm run validate:phase11-3e && pnpm run validate:phase11-4a-baseline"
) {
  fail("Phase 11.4a aggregate validator script missing");
}

console.log("Phase 11.4a Marketplace listing baseline: PASS");
console.log("Listing identity: FROZEN");
console.log("32x32 manifest icon: PASS");
console.log("HighResolutionIconUrl 80x80 -> audited 64x64 target: GAP RECORDED");
console.log("Marketplace metadata/assets/screenshots: GAPS RECORDED");
console.log("Partner Center publisher gate: EXTERNAL BLOCKED / PRESERVED");
console.log("Next: Phase 11.4b Listing Metadata Contract + icon remediation");
