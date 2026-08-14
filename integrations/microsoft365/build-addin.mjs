import {
  cp,
  mkdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";

import {
  dirname,
  resolve,
} from "node:path";

import {
  fileURLToPath,
} from "node:url";

const here =
  dirname(
    fileURLToPath(
      import.meta.url,
    ),
  );

const repoRoot =
  resolve(
    here,
    "../..",
  );

const output =
  resolve(
    here,
    "addin-dist",
  );

const compiled =
  resolve(
    here,
    "dist",
  );

const publicDir =
  resolve(
    here,
    "public",
  );

const sdkDist =
  resolve(
    repoRoot,
    "packages/sdk/dist",
  );

const coreDist =
  resolve(
    repoRoot,
    "packages/core/dist",
  );

async function requirePath(
  path,
  label,
) {
  try {
    await stat(path);
  } catch {
    throw new Error(
      `${label} is missing: ${path}`,
    );
  }
}

await Promise.all([
  requirePath(
    compiled,
    "Microsoft 365 compiled output",
  ),
  requirePath(
    publicDir,
    "Microsoft 365 public directory",
  ),
  requirePath(
    sdkDist,
    "SDK compiled output",
  ),
  requirePath(
    coreDist,
    "Core compiled output",
  ),
]);

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
  publicDir,
  output,
  {
    recursive: true,
  },
);

await cp(
  compiled,
  resolve(
    output,
    "app",
  ),
  {
    recursive: true,
  },
);

await cp(
  sdkDist,
  resolve(
    output,
    "vendor/sdk",
  ),
  {
    recursive: true,
  },
);

await cp(
  coreDist,
  resolve(
    output,
    "vendor/core",
  ),
  {
    recursive: true,
  },
);

const manifest =
  await readFile(
    resolve(
      here,
      "manifest.xml",
    ),
    "utf8",
  );

await writeFile(
  resolve(
    output,
    "manifest.xml",
  ),
  manifest,
  "utf8",
);

console.log(
  "Persian-to-Braille Word Add-in static build: PASS",
);
console.log(
  "Task pane: addin-dist/taskpane.html",
);
console.log(
  "Runtime boundary: Microsoft365 -> SDK -> Core",
);
console.log(
  "Office.js: Microsoft CDN",
);
