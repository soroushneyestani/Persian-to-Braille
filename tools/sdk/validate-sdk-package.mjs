import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import {
  tmpdir,
} from "node:os";
import {
  dirname,
  extname,
  join,
  relative,
  resolve,
} from "node:path";
import {
  fileURLToPath,
} from "node:url";
import {
  gunzipSync,
} from "node:zlib";
import {
  spawnSync,
} from "node:child_process";

const here = dirname(
  fileURLToPath(import.meta.url),
);
const repoRoot = resolve(here, "..", "..");

const packages = {
  core: resolve(
    repoRoot,
    "packages",
    "core",
  ),
  sdk: resolve(
    repoRoot,
    "packages",
    "sdk",
  ),
};

const expected = {
  author: "Soroush Neyestani",
  license: "MIT",
  repository:
    "git+https://github.com/soroushneyestani/Persian-to-Braille.git",
  homepage:
    "https://github.com/soroushneyestani/Persian-to-Braille#readme",
  bugs:
    "https://github.com/soroushneyestani/Persian-to-Braille/issues",
};

function fail(message) {
  throw new Error(message);
}

function readJson(path) {
  return JSON.parse(
    readFileSync(path, "utf8"),
  );
}

function assert(
  condition,
  message,
) {
  if (!condition) {
    fail(message);
  }
}

function run(
  command,
  args,
  options = {},
) {
  let executable = command;
  let executableArgs = args;

  if (command === "pnpm") {
    const pnpmCli =
      process.env.npm_execpath;

    if (!pnpmCli) {
      fail(
        "pnpm CLI path is unavailable. Run this validator through `pnpm run validate:sdk-package`.",
      );
    }

    const pnpmExtension =
      extname(pnpmCli)
        .toLowerCase();

    if (
      pnpmExtension === ".js" ||
      pnpmExtension === ".cjs" ||
      pnpmExtension === ".mjs"
    ) {
      executable =
        process.execPath;
      executableArgs = [
        pnpmCli,
        ...args,
      ];
    } else if (
      pnpmExtension === ".cmd" ||
      pnpmExtension === ".bat"
    ) {
      fail(
        [
          "pnpm resolved to a Windows command shim that requires a shell:",
          pnpmCli,
          "Use a native pnpm executable or a Node-based pnpm CLI for this release validator.",
        ].join("\n"),
      );
    } else {
      executable =
        pnpmCli;
      executableArgs =
        args;
    }
  }

  const result = spawnSync(
    executable,
    executableArgs,
    {
      cwd: options.cwd ?? repoRoot,
      encoding: "utf8",
      shell:
        options.shell ?? false,
      env: process.env,
    },
  );

  if (result.status !== 0) {
    fail(
      [
        `Command failed: ${command} ${args.join(" ")}`,
        result.stdout ?? "",
        result.stderr ?? "",
      ].join("\n"),
    );
  }

  return result.stdout ?? "";
}

function normalizeTarPath(path) {
  return path
    .replaceAll("\\", "/")
    .replace(/^\.?\//, "");
}

function parseOctal(buffer) {
  const text = buffer
    .toString("utf8")
    .replace(/\0/g, "")
    .trim();

  if (text.length === 0) {
    return 0;
  }

  return Number.parseInt(text, 8);
}

function readTarEntries(tgzPath) {
  const tar = gunzipSync(
    readFileSync(tgzPath),
  );
  const entries =
    new Map();

  let offset = 0;

  while (
    offset + 512 <= tar.length
  ) {
    const header =
      tar.subarray(
        offset,
        offset + 512,
      );

    const empty =
      header.every(
        (byte) => byte === 0,
      );

    if (empty) {
      break;
    }

    const name =
      header
        .subarray(0, 100)
        .toString("utf8")
        .replace(/\0.*$/s, "");

    const prefix =
      header
        .subarray(345, 500)
        .toString("utf8")
        .replace(/\0.*$/s, "");

    const fullName =
      normalizeTarPath(
        prefix.length > 0
          ? `${prefix}/${name}`
          : name,
      );

    const size =
      parseOctal(
        header.subarray(
          124,
          136,
        ),
      );

    const type =
      header
        .subarray(156, 157)
        .toString("utf8");

    const dataStart =
      offset + 512;
    const dataEnd =
      dataStart + size;

    if (
      type === "" ||
      type === "\0" ||
      type === "0"
    ) {
      entries.set(
        fullName,
        tar.subarray(
          dataStart,
          dataEnd,
        ),
      );
    }

    offset =
      dataStart +
      Math.ceil(size / 512) *
        512;
  }

  return entries;
}

function assertMetadata(
  manifest,
  packageName,
) {
  assert(
    manifest.name === packageName,
    `${packageName}: unexpected name.`,
  );
  assert(
    manifest.version ===
      "2.0.0-dev",
    `${packageName}: unexpected version.`,
  );
  assert(
    manifest.private !== true,
    `${packageName}: package is still private.`,
  );
  assert(
    manifest.license ===
      expected.license,
    `${packageName}: license must be MIT.`,
  );
  assert(
    manifest.author ===
      expected.author,
    `${packageName}: author metadata mismatch.`,
  );
  assert(
    manifest.homepage ===
      expected.homepage,
    `${packageName}: homepage metadata mismatch.`,
  );
  assert(
    manifest.bugs?.url ===
      expected.bugs,
    `${packageName}: bugs URL mismatch.`,
  );
  assert(
    manifest.repository?.type ===
      "git" &&
      manifest.repository?.url ===
        expected.repository,
    `${packageName}: repository metadata mismatch.`,
  );
  assert(
    Array.isArray(
      manifest.keywords,
    ) &&
      manifest.keywords.length >= 4,
    `${packageName}: keywords are incomplete.`,
  );
  assert(
    manifest.publishConfig?.access ===
      "public",
    `${packageName}: publishConfig.access must be public.`,
  );
  assert(
    manifest.engines?.node ===
      ">=24.19.0 <25",
    `${packageName}: Node engine baseline drifted.`,
  );
  assert(
    manifest.files?.length === 1 &&
      manifest.files[0] ===
        "dist",
    `${packageName}: published files allowlist drifted.`,
  );
  assert(
    manifest.exports?.["."]?.import ===
      "./dist/index.js" &&
      manifest.exports?.["."]?.types ===
        "./dist/index.d.ts",
    `${packageName}: exports map drifted.`,
  );
}

function pack(
  packageDir,
  destination,
) {
  run(
    "pnpm",
    [
      "pack",
      "--pack-destination",
      destination,
    ],
    {
      cwd: packageDir,
    },
  );

  const tarballs =
    readdirSync(destination)
      .filter(
        (name) =>
          name.endsWith(".tgz"),
      );

  assert(
    tarballs.length === 1,
    `Expected exactly one tarball in ${destination}.`,
  );

  return resolve(
    destination,
    tarballs[0],
  );
}

function assertTarballContents(
  packageName,
  entries,
  requiredFiles,
) {
  for (
    const file of requiredFiles
  ) {
    assert(
      entries.has(
        `package/${file}`,
      ),
      `${packageName}: packed tarball is missing ${file}.`,
    );
  }

  const forbiddenPrefixes = [
    "package/src/",
    "package/test/",
    "package/tests/",
    "package/node_modules/",
  ];

  for (
    const name of entries.keys()
  ) {
    for (
      const prefix of
      forbiddenPrefixes
    ) {
      assert(
        !name.startsWith(prefix),
        `${packageName}: forbidden packed path ${name}.`,
      );
    }

    assert(
      !name.endsWith(
        ".tsbuildinfo",
      ),
      `${packageName}: tracked/generated tsbuildinfo leaked into tarball.`,
    );
  }
}

function relativeFileSpec(
  fromDir,
  target,
) {
  const rel =
    relative(
      fromDir,
      target,
    )
      .replaceAll("\\", "/");

  return `file:${rel}`;
}

const rootLicense =
  readFileSync(
    resolve(
      repoRoot,
      "LICENSE",
    ),
    "utf8",
  );

for (
  const packageDir of
  Object.values(packages)
) {
  const packageLicense =
    readFileSync(
      resolve(
        packageDir,
        "LICENSE",
      ),
      "utf8",
    );

  assert(
    packageLicense ===
      rootLicense,
    `${packageDir}: package LICENSE differs from repository LICENSE.`,
  );
}

const coreManifest =
  readJson(
    resolve(
      packages.core,
      "package.json",
    ),
  );
const sdkManifest =
  readJson(
    resolve(
      packages.sdk,
      "package.json",
    ),
  );

assertMetadata(
  coreManifest,
  "@persian-braille/core",
);
assertMetadata(
  sdkManifest,
  "@persian-braille/sdk",
);

assert(
  sdkManifest.dependencies?.[
    "@persian-braille/core"
  ] === "workspace:*",
  "SDK development manifest must keep the workspace:* Core dependency.",
);

const sdkReadme =
  readFileSync(
    resolve(
      packages.sdk,
      "README.md",
    ),
    "utf8",
  );

for (
  const marker of [
    "createPersianBrailleTranslator",
    "translateOrThrow",
    "PersianBrailleTranslationError",
    "UNKNOWN_CHARACTER",
    "@persian-braille/core",
    "MIT",
  ]
) {
  assert(
    sdkReadme.includes(marker),
    `SDK README is missing public marker: ${marker}`,
  );
}

const tempRoot =
  mkdtempSync(
    join(
      tmpdir(),
      "persian-braille-sdk-pack-",
    ),
  );

try {
  const corePackDir =
    resolve(
      tempRoot,
      "core",
    );
  const sdkPackDir =
    resolve(
      tempRoot,
      "sdk",
    );

  mkdirSync(
    corePackDir,
    {
      recursive: true,
    },
  );
  mkdirSync(
    sdkPackDir,
    {
      recursive: true,
    },
  );

  const coreTarball =
    pack(
      packages.core,
      corePackDir,
    );
  const sdkTarball =
    pack(
      packages.sdk,
      sdkPackDir,
    );

  const coreEntries =
    readTarEntries(
      coreTarball,
    );
  const sdkEntries =
    readTarEntries(
      sdkTarball,
    );

  assertTarballContents(
    "@persian-braille/core",
    coreEntries,
    [
      "package.json",
      "README.md",
      "LICENSE",
      "dist/index.js",
      "dist/index.d.ts",
    ],
  );

  assertTarballContents(
    "@persian-braille/sdk",
    sdkEntries,
    [
      "package.json",
      "README.md",
      "LICENSE",
      "dist/index.js",
      "dist/index.d.ts",
      "dist/public-api.js",
      "dist/public-api.d.ts",
      "dist/translator.js",
      "dist/translator.d.ts",
    ],
  );

  const packedCoreManifest =
    JSON.parse(
      coreEntries
        .get(
          "package/package.json",
        )
        .toString("utf8"),
    );

  const packedSdkManifest =
    JSON.parse(
      sdkEntries
        .get(
          "package/package.json",
        )
        .toString("utf8"),
    );

  assertMetadata(
    packedCoreManifest,
    "@persian-braille/core",
  );
  assertMetadata(
    packedSdkManifest,
    "@persian-braille/sdk",
  );

  const packedCoreDependency =
    packedSdkManifest
      .dependencies?.[
        "@persian-braille/core"
      ];

  assert(
    packedCoreDependency ===
      coreManifest.version,
    [
      "SDK packed manifest did not resolve workspace:* to the exact Core version.",
      `Expected: ${coreManifest.version}`,
      `Actual: ${String(packedCoreDependency)}`,
    ].join("\n"),
  );

  assert(
    !String(
      packedCoreDependency,
    ).startsWith(
      "workspace:",
    ),
    "SDK packed manifest leaked workspace: protocol.",
  );

  const installDir =
    resolve(
      tempRoot,
      "isolated-consumer",
    );

  mkdirSync(
    installDir,
    {
      recursive: true,
    },
  );

  const coreSpec =
    relativeFileSpec(
      installDir,
      coreTarball,
    );
  const sdkSpec =
    relativeFileSpec(
      installDir,
      sdkTarball,
    );

  writeFileSync(
    resolve(
      installDir,
      "package.json",
    ),
    JSON.stringify(
      {
        name:
          "persian-braille-sdk-isolated-smoke",
        version: "0.0.0",
        private: true,
        type: "module",
        dependencies: {
          "@persian-braille/core":
            coreSpec,
          "@persian-braille/sdk":
            sdkSpec,
        },
      },
      null,
      2,
    ) + "\n",
    "utf8",
  );

  writeFileSync(
    resolve(
      installDir,
      "pnpm-workspace.yaml",
    ),
    [
      "packages:",
      '  - "."',
      "overrides:",
      `  "@persian-braille/core": "${coreSpec}"`,
      "",
    ].join("\n"),
    "utf8",
  );

  run(
    "pnpm",
    [
      "install",
      "--offline",
      "--ignore-scripts",
    ],
    {
      cwd: installDir,
    },
  );

  const smoke = `
    const sdk = await import("@persian-braille/sdk");
    const translator = sdk.createPersianBrailleTranslator();

    const ok = translator.translate("\\u0633\\u0644\\u0627\\u0645");
    if (!ok.ok) {
      throw new Error(JSON.stringify(ok));
    }
    if (ok.unicodeBraille !== "\\u280E\\u2807\\u2801\\u280D") {
      throw new Error("Unexpected isolated Persian Braille output");
    }

    const failure = translator.translate("\\u{1F600}");
    if (failure.ok || failure.code !== "UNKNOWN_CHARACTER") {
      throw new Error("Expected isolated UNKNOWN_CHARACTER failure");
    }

    if (
      typeof sdk.createForwardTranslator !== "undefined" ||
      typeof sdk.getBundledSpecification !== "undefined"
    ) {
      throw new Error("Core internals leaked from packed SDK root");
    }

    console.log("ISOLATED PACKED SDK SMOKE: PASS");
  `;

  run(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      smoke,
    ],
    {
      cwd: installDir,
      shell: false,
    },
  );

  console.log(
    "Phase 7.5 SDK package validation: PASS",
  );
  console.log(
    `Core: ${coreManifest.name}@${coreManifest.version}`,
  );
  console.log(
    `SDK: ${sdkManifest.name}@${sdkManifest.version}`,
  );
  console.log(
    `Packed SDK Core dependency: ${packedCoreDependency}`,
  );
  console.log(
    "Packed license: MIT",
  );
  console.log(
    "Scoped publication access: public",
  );
  console.log(
    "Prerelease publication tag policy: next (explicit CLI gate)",
  );
  console.log(
    "Isolated packed SDK smoke: PASS",
  );
} finally {
  rmSync(
    tempRoot,
    {
      recursive: true,
      force: true,
    },
  );
}
