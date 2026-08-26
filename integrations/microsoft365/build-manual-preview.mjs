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

const publicInstallDir = path.join(here, "public", "install");
const windowsSourceDir = path.join(publicInstallDir, "windows");
const hostedWindowsDir = path.join(hostedManifestDir, "windows");

const screenshotSourceDir = path.join(
  here,
  "marketplace",
  "listing",
  "assets",
  "screenshots",
);
const hostedScreenshotDir = path.join(hostedManifestDir, "screenshots");

const windowsFiles = [
  "Braille-Hub-Windows-Preview-Installer.cmd",
  "windows-preview-setup.ps1",
];

const screenshotFiles = [
  "word-selection.png",
  "excel-text-cell.png",
  "powerpoint-text-range.png",
];

const manifest = await readFile(marketplaceManifest, "utf8");

if (manifest.includes("localhost")) {
  throw new Error(
    "Manual preview manifest must be generated from the production Marketplace manifest; localhost was found.",
  );
}

for (const required of [
  "https://soroushneyestani.github.io/Braille-Hub/",
  "https://soroushneyestani.github.io/Braille-Hub/support.html",
]) {
  if (!manifest.includes(required)) {
    throw new Error(
      `Manual preview manifest is missing required production URL: ${required}`,
    );
  }
}

const page = await readFile(installPage, "utf8");

for (const required of [
  "./install/windows/Braille-Hub-Windows-Preview-Installer.cmd",
  "./install/screenshots/word-selection.png",
  "./install/screenshots/excel-text-cell.png",
  "./install/screenshots/powerpoint-text-range.png",
  "راهنمای نصب نسخه دسکتاپ ویندوز",
]) {
  if (!page.includes(required)) {
    throw new Error(
      `Manual preview install page is missing Phase 11.4e content: ${required}`,
    );
  }
}

await mkdir(hostedManifestDir, { recursive: true });
await mkdir(hostedWindowsDir, { recursive: true });
await mkdir(hostedScreenshotDir, { recursive: true });

await copyFile(marketplaceManifest, hostedManifest);

for (const fileName of windowsFiles) {
  const source = path.join(windowsSourceDir, fileName);
  const target = path.join(hostedWindowsDir, fileName);

  await access(source);
  await copyFile(source, target);
}

for (const fileName of screenshotFiles) {
  const source = path.join(screenshotSourceDir, fileName);
  const target = path.join(hostedScreenshotDir, fileName);

  await access(source);
  await copyFile(source, target);
}

const bootstrapper = await readFile(
  path.join(hostedWindowsDir, windowsFiles[0]),
  "utf8",
);
const setupHelper = await readFile(
  path.join(hostedWindowsDir, windowsFiles[1]),
  "utf8",
);

for (const [label, content] of [
  ["Windows installer bootstrapper", bootstrapper],
  ["Windows setup helper", setupHelper],
]) {
  if (content.includes("localhost")) {
    throw new Error(`${label} must not reference localhost.`);
  }
}

console.log("Braille Hub public manual preview build: PASS");
console.log(`Marketplace dist: ${marketplaceDist}`);
console.log(`Install page: ${installPage}`);
console.log(`Hosted manifest: ${hostedManifest}`);
console.log(`Windows preview installer: ${path.join(hostedWindowsDir, windowsFiles[0])}`);
console.log(`Windows setup helper: ${path.join(hostedWindowsDir, windowsFiles[1])}`);
console.log(`Windows screenshots: ${hostedScreenshotDir}`);
console.log("Classification: MANUAL SIDELOAD PREVIEW / NOT MARKETPLACE PUBLICATION");
