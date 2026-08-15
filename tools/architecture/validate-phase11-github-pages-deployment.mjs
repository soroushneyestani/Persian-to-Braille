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
    new URL(
      path,
      root,
    ),
    "utf8",
  );
}

function fail(message) {
  throw new Error(
    `Phase 11.2b GitHub Pages deployment validation failed: ${message}`,
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

const workflow =
  await text(
    ".github/workflows/microsoft365-marketplace-pages.yml",
  );

const note =
  await text(
    "docs/architecture/phase-11.2b-github-pages-deployment.md",
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

const manifest =
  await text(
    "integrations/microsoft365/manifest.xml",
  );

for (
  const token of [
    "phase11-marketplace",
    "main",
    "actions/checkout@v6",
    "actions/configure-pages@v5",
    "actions/upload-pages-artifact@v4",
    "actions/deploy-pages@v4",
    "pages: write",
    "id-token: write",
    "OFFICE_ADDIN_PRODUCTION_BASE_URL: https://soroushneyestani.github.io/Persian-to-Braille",
    "integrations/microsoft365/marketplace-dist/site",
    "microsoft365-marketplace-manifest",
  ]
) {
  requireText(
    workflow,
    token,
    "GitHub Pages workflow",
  );
}

requireText(
  manifest,
  "https://localhost:3000/taskpane.html",
  "preserved development manifest",
);

if (
  microsoft365Package.scripts?.["build:marketplace"] !==
  "pnpm run build && node build-marketplace.mjs"
) {
  fail(
    "Microsoft365 build:marketplace contract changed",
  );
}

for (
  const script of [
    "validate:phase11-pages-deployment",
    "validate:phase11-2b-candidate",
    "probe:phase11-marketplace-remote",
  ]
) {
  if (
    !packageJson.scripts?.[script]
  ) {
    fail(
      `root script missing: ${script}`,
    );
  }
}

requireText(
  note,
  "LIVE DEPLOYMENT REQUIRED BEFORE CLOSURE",
  "Phase 11.2b status",
);

console.log(
  "Phase 11.2b GitHub Pages deployment candidate validation: PASS",
);
console.log(
  "Expected origin: https://soroushneyestani.github.io/Persian-to-Braille",
);
console.log(
  "Development localhost manifest: PRESERVED",
);
console.log(
  "Pages deployment: SOURCE-CONTROLLED / LIVE EXECUTION REQUIRED",
);
console.log(
  "Next gate: enable Pages -> push branch -> run remote probe",
);
