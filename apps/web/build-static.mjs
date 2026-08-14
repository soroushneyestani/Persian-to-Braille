import {
  cp,
  mkdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import {
  dirname,
  resolve,
} from "node:path";
import {
  fileURLToPath,
} from "node:url";

const appDir =
  dirname(
    fileURLToPath(
      import.meta.url,
    ),
  );
const repoRoot =
  resolve(
    appDir,
    "../..",
  );
const dist =
  resolve(
    appDir,
    "dist",
  );
const publicDir =
  resolve(
    appDir,
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

async function assertBuilt(
  path,
  name,
) {
  try {
    await readFile(
      resolve(
        path,
        "index.js",
      ),
      "utf8",
    );
  } catch {
    throw new Error(
      `${name} must be built before the Web Playground static build.`,
    );
  }
}

await assertBuilt(
  sdkDist,
  "SDK",
);
await assertBuilt(
  coreDist,
  "Core",
);

await mkdir(
  dist,
  {
    recursive: true,
  },
);

await cp(
  publicDir,
  dist,
  {
    recursive: true,
  },
);

const vendorDir =
  resolve(
    dist,
    "vendor",
  );

await rm(
  vendorDir,
  {
    recursive: true,
    force: true,
  },
);

await mkdir(
  vendorDir,
  {
    recursive: true,
  },
);

await cp(
  sdkDist,
  resolve(
    vendorDir,
    "sdk",
  ),
  {
    recursive: true,
  },
);

await cp(
  coreDist,
  resolve(
    vendorDir,
    "core",
  ),
  {
    recursive: true,
  },
);

await writeFile(
  resolve(
    dist,
    "build-info.json",
  ),
  `${JSON.stringify({
    application:
      "@persian-braille/web",
    runtime:
      "browser-local",
    translationNetworkRequests:
      false,
    inputPersistence:
      "none",
  }, null, 2)}\n`,
  "utf8",
);

console.log(
  "Persian Braille Web Playground static build: PASS",
);
console.log(
  "Runtime: browser-local",
);
console.log(
  "Vendor boundary: SDK + Core compiled artifacts",
);
