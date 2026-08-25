import {
  readFile,
} from "node:fs/promises";

const root =
  new URL(
    "../../",
    import.meta.url,
  );

async function text(path) {
  return readFile(
    new URL(path, root),
    "utf8",
  );
}

function fail(message) {
  throw new Error(
    `Phase 18 macOS preview installer validation failed: ${message}`,
  );
}

function requireText(value, expected, label) {
  if (!value.includes(expected)) {
    fail(`${label}: missing ${JSON.stringify(expected)}`);
  }
}

function forbidText(value, forbidden, label) {
  if (value.includes(forbidden)) {
    fail(`${label}: forbidden ${JSON.stringify(forbidden)}`);
  }
}

const postinstall =
  await text(
    "integrations/microsoft365/release/macos/scripts/postinstall",
  );

const buildPkg =
  await text(
    "integrations/microsoft365/release/macos/build-pkg.sh",
  );

const readme =
  await text(
    "integrations/microsoft365/release/macos/README.md",
  );

const workflow =
  await text(
    ".github/workflows/macos-preview-installer.yml",
  );

const uninstall =
  await text(
    "integrations/microsoft365/release/macos/Braille-Hub-Mac-Uninstall.command",
  );

for (
  const [value, label]
  of [
    [postinstall, "postinstall"],
    [buildPkg, "build-pkg"],
    [readme, "README"],
    [workflow, "workflow"],
    [uninstall, "uninstaller"],
  ]
) {
  forbidText(
    value,
    "https://localhost:3000",
    label,
  );
}

requireText(
  postinstall,
  "com.microsoft.Word",
  "Word sideload target",
);

requireText(
  postinstall,
  "com.microsoft.Excel",
  "Excel sideload target",
);

requireText(
  postinstall,
  "com.microsoft.Powerpoint",
  "PowerPoint sideload target",
);

requireText(
  postinstall,
  "33ec7928-1204-5bb3-88e6-d778413e9234",
  "Braille Hub add-in identity",
);

requireText(
  buildPkg,
  "pkgbuild",
  "macOS package builder",
);

requireText(
  buildPkg,
  "marketplace-dist/site/install/manifest.xml",
  "production manifest input",
);

requireText(
  buildPkg,
  "refusing to package a localhost development manifest",
  "localhost packaging guard",
);

requireText(
  buildPkg,
  "cached sideload data",
  "generated Mac README cache guidance",
);

requireText(
  workflow,
  "runs-on: macos-14",
  "GitHub macOS runner",
);

requireText(
  workflow,
  "uses: pnpm/action-setup@v4",
  "pnpm setup action",
);


const pnpmSetupIndex =
  workflow.indexOf(
    "uses: pnpm/action-setup@v4",
  );

const nodeSetupIndex =
  workflow.indexOf(
    "uses: actions/setup-node@v4",
  );

if (
  pnpmSetupIndex === -1 ||
  nodeSetupIndex === -1 ||
  pnpmSetupIndex > nodeSetupIndex
) {
  fail(
    "pnpm must be installed before setup-node enables pnpm caching",
  );
}

requireText(
  workflow,
  'cache-dependency-path: "pnpm-lock.yaml"',
  "pnpm cache dependency path",
);

requireText(
  workflow,
  "build-manual-preview.mjs",
  "production preview materialization",
);

requireText(
  workflow,
  'mac-preview-v*',
  "preview tag trigger",
);

requireText(
  workflow,
  "gh release create",
  "GitHub prerelease publishing",
);

requireText(
  readme,
  "AWAITING LIVE MAC INSTALLER VERIFICATION",
  "live-test gate",
);

requireText(
  readme,
  "unsigned",
  "unsigned preview disclosure",
);

console.log(
  "Phase 18 macOS preview installer static contract: PASS",
);

console.log(
  "Installer payload: production Office manifest only",
);

console.log(
  "Word/Excel/PowerPoint wef targets: PRESENT",
);

console.log(
  "GitHub macOS PKG build: CONFIGURED",
);

console.log(
  "GitHub prerelease publishing: CONFIGURED",
);

console.log(
  "Apple signing/notarization: DEFERRED / NOT CLAIMED",
);

console.log(
  "Live Mac installer test: REQUIRED BEFORE PHASE CLOSURE",
);
