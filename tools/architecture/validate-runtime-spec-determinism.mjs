import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "../..");
const builderPath = resolve(scriptDir, "build-runtime-spec-bundle.mjs");
const generatedPath = resolve(
  repoRoot,
  "packages/core/src/generated/fa-ir-g1.runtime.ts",
);

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function build() {
  execFileSync(process.execPath, [builderPath], {
    cwd: repoRoot,
    stdio: "inherit",
  });
}

build();
const first = await readFile(generatedPath);
const firstHash = sha256(first);

build();
const second = await readFile(generatedPath);
const secondHash = sha256(second);

if (!first.equals(second)) {
  throw new Error(
    `Runtime specification bundle is not deterministic: ${firstHash} != ${secondHash}`,
  );
}

console.log("Runtime specification determinism: PASS");
console.log(`Generated SHA-256: ${firstHash}`);
