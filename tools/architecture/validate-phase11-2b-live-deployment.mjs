import { readFile } from "node:fs/promises";

const root = new URL("../../", import.meta.url);

async function text(path) {
  return readFile(new URL(path, root), "utf8");
}

function fail(message) {
  throw new Error(`Phase 11.2b live deployment validation failed: ${message}`);
}

function requireText(value, token, label) {
  if (!value.includes(token)) {
    fail(`${label}: missing ${JSON.stringify(token)}`);
  }
}

const evidence = JSON.parse(
  await text("docs/architecture/phase-11.2b-live-deployment-evidence.json"),
);
const raw = await text(
  "docs/architecture/phase-11.2b-live-deployment-evidence.txt",
);
const note = await text(
  "docs/architecture/phase-11.2b-live-deployment-evidence.md",
);
const workflow = await text(
  ".github/workflows/microsoft365-marketplace-pages.yml",
);

if (evidence.status !== "verified-pass") {
  fail("live evidence is not VERIFIED / PASS");
}

if (
  evidence.hosting?.origin !==
  "https://soroushneyestani.github.io/Braille-Hub"
) {
  fail("production origin changed");
}

if (evidence.remoteProbe?.status !== "pass") {
  fail("remote probe is not PASS");
}

for (const token of [
  "Phase 11.2b remote Marketplace HTTPS probe: PASS",
  "Task pane Office.js CDN: PASS",
  "Required static endpoints: PASS",
  "Icon cache headers: PASS",
  "cache-control: max-age=600",
]) {
  requireText(raw, token, "raw live evidence");
}

for (const token of [
  "github-pages-${{ github.run_attempt }}",
  "artifact_name: github-pages-${{ github.run_attempt }}",
  "actions/deploy-pages@v4",
]) {
  requireText(workflow, token, "GitHub Pages workflow");
}

requireText(
  note,
  "Phase 11.2b: CLOSED",
  "live deployment note",
);

console.log("Phase 11.2b live GitHub Pages deployment evidence: PASS");
console.log("Production HTTPS: VERIFIED / PASS");
console.log("Remote endpoints: PASS");
console.log("Office.js CDN: PASS");
console.log("Icon cache headers: PASS");
