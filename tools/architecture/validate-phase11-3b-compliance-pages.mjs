import { readFile } from "node:fs/promises";

const root = new URL("../../", import.meta.url);

async function text(path) {
  return readFile(new URL(path, root), "utf8");
}

function fail(message) {
  throw new Error(`Phase 11.3b public compliance pages validation failed: ${message}`);
}

function requireText(value, token, label) {
  if (!value.includes(token)) {
    fail(`${label}: missing ${JSON.stringify(token)}`);
  }
}

const support = await text(
  "integrations/microsoft365/public/support.html",
);
const privacy = await text(
  "integrations/microsoft365/public/privacy.html",
);
const eula = await text(
  "integrations/microsoft365/public/eula.html",
);
const css = await text(
  "integrations/microsoft365/public/compliance.css",
);
const manifest = await text(
  "integrations/microsoft365/manifest.xml",
);
const baseline = JSON.parse(
  await text("docs/architecture/phase-11.3a-compliance-baseline.json"),
);
const packageJson = JSON.parse(await text("package.json"));
const microsoft365Package = JSON.parse(
  await text("integrations/microsoft365/package.json"),
);

if (baseline.status !== "closed-baseline-gaps-recorded") {
  fail("Phase 11.3a baseline is not frozen");
}

requireText(support, "<h1>Support</h1>", "support page");
requireText(
  support,
  "https://github.com/soroushneyestani/Braille-Hub/issues",
  "support issue route",
);
requireText(
  support,
  "Do not include confidential document content",
  "support sensitive-data warning",
);

for (const token of [
  "<h1>Privacy Policy</h1>",
  "client-side runtime",
  "does not implement its own account",
  "does not implement application-owned persistence",
  "Microsoft Office",
  "GitHub Pages",
  "publisher-operated backend",
]) {
  requireText(privacy, token, "privacy policy");
}

for (const prohibited of [
  "No network activity occurs.",
  "No third party ever receives technical request metadata.",
  "Nothing is ever logged anywhere.",
]) {
  if (privacy.includes(prohibited)) {
    fail(`privacy policy contains prohibited absolute claim ${JSON.stringify(prohibited)}`);
  }
}

for (const token of [
  "<h1>End User License Agreement</h1>",
  "MIT License",
  'provided "AS IS"',
  "mandatory applicable law",
  "./privacy.html",
  "./support.html",
]) {
  requireText(eula, token, "EULA");
}

if (css.trim().length < 500) {
  fail("shared compliance stylesheet is unexpectedly small");
}

requireText(
  manifest,
  '<SupportUrl DefaultValue="https://github.com/soroushneyestani/Braille-Hub"/>',
  "11.3c-deferred development manifest SupportUrl",
);

if (
  microsoft365Package.scripts?.["test:marketplace-compliance"] !==
  "pnpm run build && node --test test/marketplace-compliance-pages.test.mjs"
) {
  fail("Microsoft365 compliance-page test script missing");
}

if (!packageJson.scripts?.["validate:phase11-3b-compliance-pages"]) {
  fail("Phase 11.3b page validator missing");
}
if (!packageJson.scripts?.["validate:phase11-3b"]) {
  fail("Phase 11.3b aggregate validator missing");
}

console.log("Phase 11.3b public Support / Privacy / EULA pages: PASS");
console.log("Privacy wording: ALIGNED TO 11.3a AUDIT");
console.log("Public support page: PRESENT");
console.log("Public privacy page: PRESENT");
console.log("Public EULA page: PRESENT");
console.log("Production SupportUrl replacement: DEFERRED TO 11.3c");
console.log("Next: Phase 11.3c Production SupportUrl integration");
