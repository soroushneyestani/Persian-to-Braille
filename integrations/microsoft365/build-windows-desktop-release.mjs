import {
  access,
  copyFile,
  mkdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
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
    if (
      await exists(path.join(candidate, "manifest.xml"))
      && await exists(path.join(candidate, "site"))
    ) {
      return candidate;
    }
  }
  throw new Error("Unable to locate generated marketplace-dist.");
}

function git(args) {
  return execFileSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
  }).trim();
}

function digest(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

const marketplaceDist = await resolveMarketplaceDist();
const releaseDir = path.join(
  marketplaceDist,
  "windows-desktop-release",
);

await rm(releaseDir, { recursive: true, force: true });
await mkdir(path.join(releaseDir, "screenshots"), {
  recursive: true,
});

const sourceReleaseDir = path.join(
  here,
  "release",
  "windows-desktop",
);

const copies = [
  [
    path.join(
      here,
      "public",
      "install",
      "windows",
      "Braille-Hub-Windows-Preview-Installer.cmd",
    ),
    "Braille-Hub-Windows-Preview-Installer.cmd",
  ],
  [
    path.join(
      here,
      "public",
      "install",
      "windows",
      "windows-preview-setup.ps1",
    ),
    "windows-preview-setup.ps1",
  ],
  [path.join(marketplaceDist, "manifest.xml"), "manifest.xml"],
  [path.join(sourceReleaseDir, "README.md"), "README.md"],
  [path.join(sourceReleaseDir, "RELEASE-NOTES.md"), "RELEASE-NOTES.md"],
  [path.join(sourceReleaseDir, "TEST-NOTES.md"), "TEST-NOTES.md"],
  [
    path.join(
      here,
      "marketplace",
      "listing",
      "assets",
      "screenshots",
      "word-selection.png",
    ),
    path.join("screenshots", "word-selection.png"),
  ],
  [
    path.join(
      here,
      "marketplace",
      "listing",
      "assets",
      "screenshots",
      "excel-text-cell.png",
    ),
    path.join("screenshots", "excel-text-cell.png"),
  ],
  [
    path.join(
      here,
      "marketplace",
      "listing",
      "assets",
      "screenshots",
      "powerpoint-text-range.png",
    ),
    path.join("screenshots", "powerpoint-text-range.png"),
  ],
];

for (const [source, relativeTarget] of copies) {
  await access(source);
  const target = path.join(releaseDir, relativeTarget);
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(source, target);
}

const manifestText = await readFile(
  path.join(releaseDir, "manifest.xml"),
  "utf8",
);

if (/localhost|127\.0\.0\.1/i.test(manifestText)) {
  throw new Error(
    "Windows release manifest must contain NO LOCALHOST development host.",
  );
}

for (const required of [
  "https://soroushneyestani.github.io/Braille-Hub/",
  "33ec7928-1204-5bb3-88e6-d778413e9234",
]) {
  if (!manifestText.includes(required)) {
    throw new Error(`Windows release manifest is missing ${required}`);
  }
}

const provenance = {
  schemaVersion: 1,
  phase: "11.6",
  packageType: "windows-desktop-release-candidate",
  releaseScope: "Microsoft 365 Desktop on Windows",
  git: {
    branch: git(["branch", "--show-current"]),
    head: git(["rev-parse", "HEAD"]),
    workingTreeClean:
      git(["status", "--short", "--untracked-files=no"]) === "",
  },
  architectureBoundary: "Microsoft365 -> SDK -> Core",
  distribution: "manual Windows sideload/testing preview",
  publicInstallUrl:
    "https://soroushneyestani.github.io/Braille-Hub/install.html",
  deferred: {
    web: "Phase 16",
    mac: "Phase 17",
    marketplacePartnerCenter: "Phase 18",
  },
};

await writeFile(
  path.join(releaseDir, "provenance.json"),
  JSON.stringify(provenance, null, 2) + "\n",
  "utf8",
);

const payloadFiles = [
  "Braille-Hub-Windows-Preview-Installer.cmd",
  "windows-preview-setup.ps1",
  "manifest.xml",
  "README.md",
  "RELEASE-NOTES.md",
  "TEST-NOTES.md",
  "provenance.json",
  "screenshots/word-selection.png",
  "screenshots/excel-text-cell.png",
  "screenshots/powerpoint-text-range.png",
];

const fileRecords = [];

for (const relativePath of payloadFiles) {
  const buffer = await readFile(path.join(releaseDir, relativePath));
  fileRecords.push({
    path: relativePath.replaceAll("\\", "/"),
    bytes: buffer.length,
    sha256: digest(buffer),
  });
}

fileRecords.sort((a, b) => a.path.localeCompare(b.path));

const packageManifest = {
  schemaVersion: 1,
  phase: "11.6",
  title: "Braille Hub Windows Desktop Release Package",
  packageType: "windows-desktop-release-candidate",
  releaseScope: "Microsoft 365 Desktop on Windows",
  architectureBoundary: "Microsoft365 -> SDK -> Core",
  files: fileRecords,
  deferred: {
    web: "Phase 16",
    mac: "Phase 17",
    marketplacePartnerCenter: "Phase 18",
  },
  next: "Phase 11.7 Windows Desktop Release Preflight",
};

await writeFile(
  path.join(releaseDir, "package-manifest.json"),
  JSON.stringify(packageManifest, null, 2) + "\n",
  "utf8",
);

const checksumFiles = [
  ...payloadFiles,
  "package-manifest.json",
].sort();

const checksumLines = [];
for (const relativePath of checksumFiles) {
  const buffer = await readFile(path.join(releaseDir, relativePath));
  checksumLines.push(
    `${digest(buffer)}  ${relativePath.replaceAll("\\", "/")}`,
  );
}

await writeFile(
  path.join(releaseDir, "checksums.sha256"),
  checksumLines.join("\n") + "\n",
  "utf8",
);

console.log("Braille Hub Windows Desktop release package: PASS");
console.log(`Release package: ${releaseDir}`);
console.log(`Payload files: ${payloadFiles.length}`);
console.log("Production manifest: HTTPS / NO LOCALHOST / PASS");
console.log("Checksums: SHA-256 / PASS");
console.log("Scope: Microsoft 365 Desktop on Windows");
console.log("Classification: INTERNAL WINDOWS RELEASE CANDIDATE");
console.log("Web: DEFERRED TO PHASE 18");
console.log("Mac: DEFERRED TO PHASE 19");
console.log("Marketplace / Partner Center: DEFERRED TO PHASE 20");
