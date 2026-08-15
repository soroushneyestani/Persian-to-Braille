import { readFile } from "node:fs/promises";

const root = new URL("../../", import.meta.url);

async function text(path) {
  return readFile(new URL(path, root), "utf8");
}

function fail(message) {
  throw new Error(`Phase 11.2 closure validation failed: ${message}`);
}

const closure = JSON.parse(
  await text("docs/architecture/phase-11.2-closure.json"),
);
const phase111 = JSON.parse(
  await text("docs/architecture/phase-11.1-marketplace-baseline.json"),
);
const phase112b = JSON.parse(
  await text("docs/architecture/phase-11.2b-live-deployment-evidence.json"),
);
const packageJson = JSON.parse(await text("package.json"));

if (phase111.status !== "closed-baseline-gaps-recorded") {
  fail("Phase 11.1 baseline is not closed");
}

if (closure.status !== "closed") {
  fail("Phase 11.2 closure status is not closed");
}

if (closure.subphases?.["11.2a"]?.status !== "closed") {
  fail("Phase 11.2a is not closed");
}

if (closure.subphases?.["11.2b"]?.status !== "closed") {
  fail("Phase 11.2b is not closed");
}

if (phase112b.status !== "verified-pass") {
  fail("Phase 11.2b live deployment is not verified");
}

if (
  closure.production?.origin !==
  "https://soroushneyestani.github.io/Persian-to-Braille"
) {
  fail("production origin mismatch");
}

if (closure.marketplaceSupportUrl !== "deferred-to-11.3") {
  fail("Support URL must remain deferred to Phase 11.3");
}

for (const script of [
  "validate:phase11-2b-live",
  "validate:phase11-2-closure",
  "validate:phase11-2",
]) {
  if (!packageJson.scripts?.[script]) {
    fail(`missing package script ${script}`);
  }
}

console.log(
  "Phase 11.2 Production Hosting / HTTPS / Production Manifest closure: PASS",
);
console.log("Phase 11.2a: CLOSED");
console.log("Phase 11.2b: CLOSED");
console.log("Production: GitHub Pages / HTTPS VERIFIED");
console.log(
  "Next: Phase 11.3 Support / Privacy / EULA / Publisher Identity",
);
