import { readFile, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "../..");

const packageContracts = new Map([
  ["@persian-braille/core", { path: "packages/core", allowedInternalDependencies: new Set() }],
  ["@persian-braille/sdk", { path: "packages/sdk", allowedInternalDependencies: new Set(["@persian-braille/core"]) }],
  ["@persian-braille/cli", { path: "apps/cli", allowedInternalDependencies: new Set(["@persian-braille/sdk"]) }],
  ["@persian-braille/web", { path: "apps/web", allowedInternalDependencies: new Set(["@persian-braille/sdk"]) }],
  ["@persian-braille/microsoft365", { path: "integrations/microsoft365", allowedInternalDependencies: new Set(["@persian-braille/sdk"]) }],
]);

const dependencySections = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
];

function fail(message) {
  console.error(`ARCHITECTURE ERROR: ${message}`);
  process.exitCode = 1;
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function walkTypeScriptFiles(directory) {
  const results = [];

  async function walk(current) {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === "generated" || entry.name === "dist" || entry.name === "node_modules") {
        continue;
      }

      const fullPath = resolve(current, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && /\.(?:ts|tsx|mts|cts)$/.test(entry.name)) {
        results.push(fullPath);
      }
    }
  }

  await walk(directory);
  return results;
}

function internalPackageReferences(source) {
  const references = new Set();
  const patterns = [
    /\bfrom\s+["'](@persian-braille\/[^"']+)["']/g,
    /\bimport\s*\(\s*["'](@persian-braille\/[^"']+)["']\s*\)/g,
    /\brequire\s*\(\s*["'](@persian-braille\/[^"']+)["']\s*\)/g,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      references.add(match[1]);
    }
  }

  return references;
}

for (const [expectedName, contract] of packageContracts) {
  const manifestPath = resolve(repoRoot, contract.path, "package.json");
  const manifest = await readJson(manifestPath);

  if (manifest.name !== expectedName) {
    fail(
      `${contract.path}/package.json must be named ${expectedName}, found ${String(manifest.name)}.`,
    );
  }

  const declaredInternal = new Set();

  for (const section of dependencySections) {
    const dependencies = manifest[section] ?? {};
    for (const dependencyName of Object.keys(dependencies)) {
      if (!dependencyName.startsWith("@persian-braille/")) {
        continue;
      }

      declaredInternal.add(dependencyName);

      if (!packageContracts.has(dependencyName)) {
        fail(`${expectedName} declares unknown internal dependency ${dependencyName}.`);
      }

      if (!contract.allowedInternalDependencies.has(dependencyName)) {
        fail(`${expectedName} must not depend on ${dependencyName}.`);
      }

      const range = dependencies[dependencyName];
      if (range !== "workspace:*") {
        fail(
          `${expectedName} must reference ${dependencyName} as workspace:*, found ${String(range)}.`,
        );
      }
    }
  }

  for (const requiredDependency of contract.allowedInternalDependencies) {
    if (!declaredInternal.has(requiredDependency)) {
      fail(`${expectedName} must depend on ${requiredDependency}.`);
    }
  }

  const sourceDirectory = resolve(repoRoot, contract.path, "src");
  const sourceFiles = await walkTypeScriptFiles(sourceDirectory);

  for (const sourceFile of sourceFiles) {
    const source = await readFile(sourceFile, "utf8");
    for (const referencedPackage of internalPackageReferences(source)) {
      if (!contract.allowedInternalDependencies.has(referencedPackage)) {
        fail(
          `${expectedName} source imports forbidden internal package ${referencedPackage}.`,
        );
      }
    }
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("Package-boundary validation: PASS");
console.log("Validated internal dependency graph:");
console.log("  core -> none");
console.log("  sdk -> core");
console.log("  cli -> sdk");
console.log("  web -> sdk");
console.log("  microsoft365 -> sdk");
