import {
  access,
  copyFile,
  mkdir,
  readFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");

const candidates = [
  path.join(repoRoot, "marketplace-dist"),
  path.join(here, "marketplace-dist"),
];

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function resolveMarketplaceDist() {
  for (const candidate of candidates) {
    const manifest = path.join(candidate, "manifest.xml");
    const site = path.join(candidate, "site");

    if (await exists(manifest) && await exists(site)) {
      return candidate;
    }
  }

  throw new Error(
    "Unable to locate generated marketplace-dist. Expected either "
      + `${path.join(repoRoot, "marketplace-dist")} or `
      + `${path.join(here, "marketplace-dist")}.`,
  );
}

const marketplaceDist = await resolveMarketplaceDist();
const marketplaceManifest = path.join(marketplaceDist, "manifest.xml");
const siteDir = path.join(marketplaceDist, "site");
const hostedManifestDir = path.join(siteDir, "install");
const hostedManifest = path.join(hostedManifestDir, "manifest.xml");
const installPage = path.join(siteDir, "install.html");

const manifest = await readFile(marketplaceManifest, "utf8");

if (manifest.includes("localhost")) {
  throw new Error(
    "Manual preview manifest must be generated from the production Marketplace manifest; localhost was found.",
  );
}

for (const required of [
  "https://soroushneyestani.github.io/Persian-to-Braille/",
  "https://soroushneyestani.github.io/Persian-to-Braille/support.html",
]) {
  if (!manifest.includes(required)) {
    throw new Error(
      `Manual preview manifest is missing required production URL: ${required}`,
    );
  }
}

await readFile(installPage, "utf8");
await mkdir(hostedManifestDir, { recursive: true });
await copyFile(marketplaceManifest, hostedManifest);

console.log("Persian-to-Braille public manual preview build: PASS");
console.log(`Marketplace dist: ${marketplaceDist}`);
console.log(`Install page: ${installPage}`);
console.log(`Hosted manifest: ${hostedManifest}`);
console.log("Classification: MANUAL SIDELOAD PREVIEW / NOT MARKETPLACE PUBLICATION");
