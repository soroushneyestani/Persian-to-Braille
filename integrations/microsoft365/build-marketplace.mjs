import {
  cp,
  mkdir,
  readFile,
  rm,
  unlink,
  writeFile,
} from "node:fs/promises";

import {
  dirname,
  resolve,
} from "node:path";

import {
  fileURLToPath,
} from "node:url";

import {
  createMarketplaceSubmissionManifest,
} from "./marketplace/production-manifest.mjs";

const here =
  dirname(
    fileURLToPath(
      import.meta.url,
    ),
  );

const addinDist =
  resolve(
    here,
    "addin-dist",
  );

const output =
  resolve(
    here,
    "marketplace-dist",
  );

const siteOutput =
  resolve(
    output,
    "site",
  );

const sourceManifest =
  resolve(
    here,
    "manifest.xml",
  );

const productionBaseUrl =
  process.env
    .OFFICE_ADDIN_PRODUCTION_BASE_URL;

const developmentManifest =
  await readFile(
    sourceManifest,
    "utf8",
  );

const production =
  createMarketplaceSubmissionManifest(
    developmentManifest,
    productionBaseUrl,
  );

await rm(
  output,
  {
    recursive: true,
    force: true,
  },
);

await mkdir(
  output,
  {
    recursive: true,
  },
);

await cp(
  addinDist,
  siteOutput,
  {
    recursive: true,
  },
);

await unlink(
  resolve(
    siteOutput,
    "manifest.xml",
  ),
);

await writeFile(
  resolve(
    output,
    "manifest.xml",
  ),
  production.manifest,
  "utf8",
);

console.log(
  "Braille Hub Marketplace bundle: PASS",
);
console.log(
  `Production base URL: ${production.baseUrl}`,
);

console.log(
  `Marketplace Support URL: ${production.complianceUrls.support}`,
);

console.log(
  `Marketplace Privacy URL: ${production.complianceUrls.privacy}`,
);

console.log(
  `Marketplace EULA URL: ${production.complianceUrls.eula}`,
);
console.log(
  "Hosted site payload: marketplace-dist/site",
);
console.log(
  "Submission manifest: marketplace-dist/manifest.xml",
);
console.log(
  "Development manifest remains unchanged: manifest.xml",
);
