import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const root = new URL("../../", import.meta.url);

async function text(path) {
  return readFile(new URL(path, root), "utf8");
}

function fail(message) {
  throw new Error(
    `Phase 11.3d live compliance evidence validation failed: ${message}`,
  );
}

function requireText(value, token, label) {
  if (!value.includes(token)) {
    fail(`${label}: missing ${JSON.stringify(token)}`);
  }
}

function normalizedSha256(value) {
  const normalized =
    value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  return createHash("sha256")
    .update(normalized, "utf8")
    .digest("hex");
}

const raw =
  await text(
    "docs/architecture/phase-11.3d-live-compliance-probe.txt",
  );

const evidence =
  JSON.parse(
    await text(
      "docs/architecture/phase-11.3d-live-compliance-evidence.json",
    ),
  );

const note =
  await text(
    "docs/architecture/phase-11.3d-live-compliance-evidence.md",
  );

const packageJson =
  JSON.parse(await text("package.json"));

if (evidence.phase !== "11.3d") {
  fail("unexpected phase");
}

if (
  evidence.status !==
  "live-https-compliance-verified"
) {
  fail("live verification status is not closed/pass");
}

if (
  evidence.branch !== "phase11-marketplace"
  || evidence.head !==
    "93cbe792197ffe164224c75e327504ac3aa73fbf"
) {
  fail("branch/commit evidence mismatch");
}

if (
  evidence.deployment?.runNumber !== 4
  || evidence.deployment?.runAttempt !== 1
  || evidence.deployment?.status !== "completed"
  || evidence.deployment?.conclusion !== "success"
) {
  fail("deployment run evidence mismatch");
}

for (const token of [
  "[PASS] GitHub Actions deployment: current HEAD completed successfully",
  "[PASS] Support page: LIVE HTTPS / CONTENT VERIFIED",
  "[PASS] Privacy page: LIVE HTTPS / CONTENT VERIFIED",
  "[PASS] EULA page: LIVE HTTPS / CONTENT VERIFIED",
  "[PASS] Compliance stylesheet: LIVE HTTPS / CONTENT VERIFIED",
  "[PASS] Deployment run: CURRENT HEAD / SUCCESS",
  "Phase 11.3d live HTTPS compliance verification: PASS",
]) {
  requireText(raw, token, "raw live probe");
}

const sourceContracts = [
  {
    key: "support",
    path: "integrations/microsoft365/public/support.html",
    marker: "<h1>Support</h1>",
  },
  {
    key: "privacy",
    path: "integrations/microsoft365/public/privacy.html",
    marker: "<h1>Privacy Policy</h1>",
  },
  {
    key: "eula",
    path: "integrations/microsoft365/public/eula.html",
    marker: "<h1>End User License Agreement</h1>",
  },
  {
    key: "stylesheet",
    path: "integrations/microsoft365/public/compliance.css",
    marker: ".legal-shell",
  },
];

for (const contract of sourceContracts) {
  const source =
    await text(contract.path);

  requireText(
    source,
    contract.marker,
    contract.path,
  );

  const expected =
    evidence.endpoints?.[contract.key];

  if (!expected) {
    fail(`missing endpoint evidence for ${contract.key}`);
  }

  if (
    expected.http !== 200
    || expected.result !== "pass"
    || !expected.url.startsWith("https://")
  ) {
    fail(`invalid endpoint classification for ${contract.key}`);
  }

  const actualSha =
    normalizedSha256(source);

  if (
    actualSha !== expected.normalizedSha256
  ) {
    fail(
      `${contract.key} source SHA mismatch: `
      + `${actualSha} != ${expected.normalizedSha256}`,
    );
  }

  requireText(
    raw,
    expected.url,
    `${contract.key} live URL`,
  );
  requireText(
    raw,
    expected.normalizedSha256,
    `${contract.key} live SHA`,
  );
}

for (const token of [
  "CLOSED — LIVE VERIFIED / PASS",
  "Workflow run: #4",
  "support.html     HTTP 200 / HTTPS / content verified",
  "privacy.html     HTTP 200 / HTTPS / content verified",
  "eula.html        HTTP 200 / HTTPS / content verified",
  "Phase 11.3e — Publisher Identity / Partner Center external gate",
]) {
  requireText(note, token, "Phase 11.3d evidence note");
}

if (
  packageJson.scripts?.[
    "validate:phase11-3d-live-compliance"
  ] !==
  "node tools/architecture/validate-phase11-3d-live-compliance.mjs"
) {
  fail("Phase 11.3d live evidence validator script missing");
}

if (
  packageJson.scripts?.["validate:phase11-3d"] !==
  "pnpm run validate:phase11-3c && pnpm run validate:phase11-3d-live-compliance"
) {
  fail("Phase 11.3d aggregate validator script missing");
}

console.log(
  "Phase 11.3d live HTTPS compliance verification: PASS",
);
console.log(
  "Deployment run #4 / attempt 1: CURRENT HEAD / SUCCESS",
);
console.log(
  "Support / Privacy / EULA / CSS: LIVE HTTPS / CONTENT VERIFIED",
);
console.log(
  "Committed source SHA-256 values: MATCH LIVE EVIDENCE",
);
console.log(
  "Next: Phase 11.3e Publisher Identity / Partner Center external gate",
);
