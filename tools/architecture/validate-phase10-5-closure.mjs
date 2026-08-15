import { readFile } from "node:fs/promises";

const root = new URL("../../", import.meta.url);

async function text(path) {
  return readFile(new URL(path, root), "utf8");
}

function fail(message) {
  throw new Error(
    `Phase 10.5 closure validation failed: ${message}`,
  );
}

function equal(actual, expected, label) {
  if (actual !== expected) {
    fail(
      `${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}

function requireText(value, expected, label) {
  if (!value.includes(expected)) {
    fail(`${label}: missing ${JSON.stringify(expected)}`);
  }
}

const closure = JSON.parse(
  await text(
    "docs/architecture/phase-10.5d-closure.json",
  ),
);

const liveEvidence = JSON.parse(
  await text(
    "docs/architecture/phase-10.5b-windows-live-sideload-evidence.json",
  ),
);

const manifestEvidence = await text(
  "docs/architecture/phase-10.5a-office-manifest-validation.txt",
);

const crossHostEvidence = await text(
  "docs/architecture/phase-10.5c-cross-host-regression-evidence.md",
);

const manifest = await text(
  "integrations/microsoft365/manifest.xml",
);

const packageJson = JSON.parse(
  await text("package.json"),
);

equal(closure.phase, "10.5d", "phase");
equal(closure.status, "closed", "closure status");
equal(closure.nextPhase, "10.6", "next phase");

for (const phase of ["10.5a", "10.5b", "10.5c"]) {
  equal(
    closure.subphases?.[phase]?.status,
    "closed",
    `${phase} status`,
  );
}

equal(
  closure.subphases?.["10.5c"]?.automatedRegression
    ?.microsoft365Tests?.tests,
  69,
  "Microsoft365 test count",
);
equal(
  closure.subphases?.["10.5c"]?.automatedRegression
    ?.microsoft365Tests?.pass,
  69,
  "Microsoft365 pass count",
);
equal(
  closure.subphases?.["10.5c"]?.automatedRegression
    ?.microsoft365Tests?.fail,
  0,
  "Microsoft365 fail count",
);

for (const host of ["word", "excel", "powerpoint"]) {
  equal(
    liveEvidence.clients?.[host]?.status,
    "verified-pass",
    `${host} Windows live status`,
  );
  equal(
    closure.hostMatrix?.[host]?.windows,
    "verified-pass",
    `${host} closure Windows status`,
  );
}

equal(
  closure.hostMatrix?.word?.insertAfter,
  true,
  "Word Insert After",
);
equal(
  closure.hostMatrix?.excel?.insertAfter,
  false,
  "Excel Insert After",
);
equal(
  closure.hostMatrix?.powerpoint?.insertAfter,
  false,
  "PowerPoint Insert After",
);

equal(
  closure.hostMatrix?.excel?.multiCellGuard,
  "SELECTION_SHAPE_UNSUPPORTED",
  "Excel multi-cell guard",
);
equal(
  closure.hostMatrix?.excel?.formulaGuard,
  "SELECTION_CONTENT_UNSUPPORTED",
  "Excel formula guard",
);

for (const host of ["word", "excel", "powerpoint"]) {
  equal(
    closure.hostMatrix?.[host]?.staleGuard,
    "SELECTION_CHANGED",
    `${host} stale guard`,
  );
}

equal(
  closure.manifest?.officialValidation,
  "pass",
  "official manifest validation",
);
equal(
  closure.manifest?.versionOverrides?.count,
  1,
  "VersionOverrides count",
);

requireText(
  manifestEvidence,
  "The manifest is valid.",
  "official Microsoft validation evidence",
);

for (const host of ["Document", "Workbook", "Presentation"]) {
  requireText(
    manifest,
    `<Host Name="${host}"/>`,
    `base manifest host ${host}`,
  );
  requireText(
    manifest,
    `<Host xsi:type="${host}">`,
    `VersionOverrides host ${host}`,
  );
}

requireText(
  crossHostEvidence,
  "**CLOSED — VALIDATED**",
  "10.5c status",
);

equal(
  closure.deferred?.web,
  "expected-not-executed",
  "Web deferred status",
);
equal(
  closure.deferred?.mac,
  "expected-not-executed",
  "Mac deferred status",
);

if (
  !packageJson.scripts?.["validate:phase10-5-closure"]
) {
  fail(
    "Phase 10.5 closure validator script is not registered",
  );
}

if (
  !packageJson.scripts?.["validate:phase10-5"]
) {
  fail(
    "Phase 10.5 aggregate validator script is not registered",
  );
}

console.log("Phase 10.5 closure validation: PASS");
console.log("10.5a manifest + Microsoft validation: CLOSED");
console.log("10.5b Windows live sideload: CLOSED");
console.log("10.5c cross-host regression evidence: CLOSED");
console.log("Word / Excel / PowerPoint Windows: VERIFIED / PASS");
console.log("Web / Mac: EXPECTED / NOT EXECUTED");
console.log("Next: Phase 10.6 Phase 10 Closure");
