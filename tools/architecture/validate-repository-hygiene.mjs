import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "../..");

function fail(message) {
  console.error(`HYGIENE ERROR: ${message}`);
  process.exitCode = 1;
}

const trackedOutput = execFileSync(
  "git",
  ["ls-files", "-z"],
  {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  },
);

const trackedFiles = trackedOutput
  .split("\0")
  .filter(Boolean)
  .map((path) => path.replaceAll("\\", "/"));

const forbiddenTrackedPatterns = [
  {
    label: "node_modules",
    test: (path) => path.includes("/node_modules/") || path.startsWith("node_modules/"),
  },
  {
    label: "dist",
    test: (path) => path.includes("/dist/") || path.startsWith("dist/"),
  },
  {
    label: "TypeScript build info",
    test: (path) => path.endsWith(".tsbuildinfo"),
  },
  {
    label: "generated runtime specification",
    test: (path) => path.startsWith("packages/core/src/generated/"),
  },
];

for (const rule of forbiddenTrackedPatterns) {
  const offenders = trackedFiles.filter(rule.test);
  if (offenders.length > 0) {
    fail(`${rule.label} artifacts must not be tracked:\n  ${offenders.join("\n  ")}`);
  }
}

const gitignore = await readFile(resolve(repoRoot, ".gitignore"), "utf8");
const requiredIgnoreRules = [
  "node_modules/",
  "dist/",
  "*.tsbuildinfo",
  "/packages/core/src/generated/",
];

for (const rule of requiredIgnoreRules) {
  if (!gitignore.split(/\r?\n/).includes(rule)) {
    fail(`.gitignore must contain exact rule: ${rule}`);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("Repository-hygiene validation: PASS");
console.log(`Tracked files checked: ${trackedFiles.length}`);
console.log("Forbidden generated/dependency artifacts tracked: 0");
