import { readFile } from "node:fs/promises";

const root = new URL("../../", import.meta.url);

async function text(path) {
  return readFile(new URL(path, root), "utf8");
}

function fail(message) {
  throw new Error(
    `Phase 11.3e external publisher-gate record validation failed: ${message}`,
  );
}

function requireText(value, token, label) {
  if (!value.includes(token)) {
    fail(`${label}: missing ${JSON.stringify(token)}`);
  }
}

const evidence =
  JSON.parse(
    await text(
      "docs/architecture/phase-11.3e-publisher-identity-external-gate.json",
    ),
  );

const note =
  await text(
    "docs/architecture/phase-11.3e-publisher-identity-external-gate.md",
  );

const manifest =
  await text("integrations/microsoft365/manifest.xml");

const phase113d =
  JSON.parse(
    await text(
      "docs/architecture/phase-11.3d-live-compliance-evidence.json",
    ),
  );

const packageJson =
  JSON.parse(await text("package.json"));

if (evidence.phase !== "11.3e") {
  fail("unexpected phase");
}

if (evidence.status !== "external-blocked") {
  fail("publisher gate must remain explicitly external-blocked");
}

if (
  evidence.publisherEnrollment !== "not-completed"
  || evidence.publisherIdentityVerification !== "not-available-yet"
) {
  fail("external publisher state is inconsistent");
}

if (
  evidence.privacy?.recordPersonalImmigrationDetails !== false
  || evidence.privacy?.recordSensitiveLegalStatus !== false
) {
  fail("public-repository privacy guard is not explicit");
}

if (
  phase113d.status !== "live-https-compliance-verified"
) {
  fail("Phase 11.3d must remain closed/pass");
}

requireText(
  manifest,
  "<ProviderName>Soroush Neyestani</ProviderName>",
  "manifest ProviderName",
);

for (const token of [
  "EXTERNAL BLOCKED / NOT SATISFIED",
  "Do not invent or misstate a legal business name.",
  "No legal-business details, immigration details, or other sensitive personal",
  "11.4   Marketplace Listing Metadata and Assets     NEXT IN PARALLEL",
  "must not be declared fully closed",
]) {
  requireText(note, token, "Phase 11.3e note");
}

if (
  packageJson.scripts?.["validate:phase11-3e-external-gate"] !==
  "node tools/architecture/validate-phase11-3e-external-gate.mjs"
) {
  fail("Phase 11.3e external-gate validator script missing");
}

if (
  packageJson.scripts?.["validate:phase11-3e"] !==
  "pnpm run validate:phase11-3d && pnpm run validate:phase11-3e-external-gate"
) {
  fail("Phase 11.3e aggregate validator script missing");
}

console.log("Phase 11.3e external publisher-gate record: PASS");
console.log("Publisher enrollment: EXTERNAL BLOCKED / NOT SATISFIED");
console.log("Manifest ProviderName: PRESERVED");
console.log("Sensitive personal/legal status: NOT RECORDED");
console.log(
  "Parallel work allowed: Phase 11.4 Marketplace Listing Metadata and Assets",
);
