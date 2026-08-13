import {
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import {
  dirname,
  resolve,
} from "node:path";
import {
  fileURLToPath,
} from "node:url";

import {
  getBundledSpecification,
} from "../../packages/core/dist/index.js";

import {
  ProfileScenarioHarnessError,
  runProfileScenarios,
  validateJsonSchemaSubset,
} from "./profile-scenario-harness.mjs";

const here = dirname(
  fileURLToPath(import.meta.url),
);
const repoRoot = resolve(here, "..", "..");

const scenarioDir = resolve(
  repoRoot,
  "conformance",
  "scenarios",
);
const reportSchemaPath = resolve(
  repoRoot,
  "conformance",
  "schema",
  "conformance-report.schema.json",
);
const reportPath = resolve(
  repoRoot,
  "conformance",
  "reports",
  "fa-ir-g1-0.1.0.json",
);

const categories = [
  "persian",
  "sequence",
  "numeric",
  "latin",
  "layout-normalization",
  "mixed",
  "negative",
];

function isObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

export function loadProfileScenarios() {
  return readdirSync(scenarioDir)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) =>
      JSON.parse(
        readFileSync(
          resolve(scenarioDir, name),
          "utf8",
        ),
      ),
    );
}

function createZeroCategoryCoverage() {
  return Object.fromEntries(
    categories.map(
      (category) => [category, 0],
    ),
  );
}

function readProfileStatus(specification) {
  if (
    typeof specification.profileStatus ===
    "string"
  ) {
    return specification.profileStatus;
  }

  if (
    isObject(specification.profile) &&
    typeof specification.profile.status ===
      "string"
  ) {
    return specification.profile.status;
  }

  throw new Error(
    "Bundled specification does not expose a profile status.",
  );
}

export function buildConformanceReport(
  scenarios = loadProfileScenarios(),
) {
  const specification =
    getBundledSpecification();
  const results =
    runProfileScenarios(scenarios);

  const coverage = {
    categories:
      createZeroCategoryCoverage(),
    lifecycles: {
      required: 0,
      draft: 0,
    },
    expectationKinds: {
      success: 0,
      failure: 0,
    },
  };

  for (const scenario of scenarios) {
    coverage.categories[
      scenario.category
    ] += 1;

    coverage.lifecycles[
      scenario.lifecycle
    ] += 1;

    coverage.expectationKinds[
      scenario.expected.kind
    ] += 1;
  }

  const passed = results.filter(
    (result) =>
      result.status === "pass",
  ).length;

  return {
    schemaVersion: 1,
    profile: {
      id: specification.profileId,
      version:
        specification.profileVersion,
      status:
        readProfileStatus(specification),
    },
    scenarioSchemaVersion: 1,
    summary: {
      total: scenarios.length,
      required:
        coverage.lifecycles.required,
      draft:
        coverage.lifecycles.draft,
      passed,
      failed: results.length - passed,
    },
    coverage,
    results,
  };
}

export function validateConformanceReport(
  report,
) {
  const reportSchema = JSON.parse(
    readFileSync(
      reportSchemaPath,
      "utf8",
    ),
  );

  const errors =
    validateJsonSchemaSubset(
      report,
      reportSchema,
    );

  if (errors.length > 0) {
    throw new ProfileScenarioHarnessError(
      "INVALID_CONFORMANCE_REPORT",
      errors.join("\n"),
    );
  }
}

export function enforceConformanceGates(
  report,
) {
  const failedRequired =
    report.results.filter(
      (result) =>
        result.lifecycle ===
          "required" &&
        result.status !== "pass",
    );

  if (failedRequired.length > 0) {
    throw new Error(
      [
        "Required profile conformance scenarios failed:",
        ...failedRequired.map(
          (result) =>
            `${result.id}: ${result.diagnostics.join("; ")}`,
        ),
      ].join("\n"),
    );
  }

  for (const category of categories) {
    if (
      report.coverage.categories[
        category
      ] < 1
    ) {
      throw new Error(
        `Missing required Phase 6 category coverage: ${category}`,
      );
    }
  }

  if (
    report.coverage.lifecycles.required <
      1 ||
    report.coverage.lifecycles.draft <
      1
  ) {
    throw new Error(
      "Both required and draft scenario lifecycle coverage must be present.",
    );
  }

  if (
    report.coverage.expectationKinds
      .success < 1 ||
    report.coverage.expectationKinds
      .failure < 1
  ) {
    throw new Error(
      "Both success and failure expectation coverage must be present.",
    );
  }
}

export function serializeConformanceReport(
  report,
) {
  return (
    JSON.stringify(report, null, 2) +
    "\n"
  );
}

export function generateConformanceReport() {
  const report =
    buildConformanceReport();

  validateConformanceReport(report);
  enforceConformanceGates(report);

  return report;
}

function writeReport() {
  const report =
    generateConformanceReport();

  writeFileSync(
    reportPath,
    serializeConformanceReport(report),
    "utf8",
  );

  console.log(
    "Profile conformance report written:",
  );
  console.log(
    resolve(reportPath),
  );
  printSummary(report);
}

function checkReport() {
  const report =
    generateConformanceReport();
  const expected =
    serializeConformanceReport(report);
  const actual =
    readFileSync(reportPath, "utf8");

  if (actual !== expected) {
    throw new Error(
      [
        "Committed profile conformance report is stale.",
        "Regenerate it with:",
        "pnpm run conformance:write-report",
      ].join("\n"),
    );
  }

  console.log(
    "Profile conformance report: PASS",
  );
  printSummary(report);
}

function printSummary(report) {
  console.log(
    `Profile: ${report.profile.id} ${report.profile.version} (${report.profile.status})`,
  );
  console.log(
    `Scenarios: ${report.summary.total}`,
  );
  console.log(
    `Lifecycle: required=${report.summary.required}, draft=${report.summary.draft}`,
  );
  console.log(
    `Results: pass=${report.summary.passed}, fail=${report.summary.failed}`,
  );
  console.log(
    "Categories:",
    Object.entries(
      report.coverage.categories,
    )
      .map(
        ([key, value]) =>
          `${key}=${value}`,
      )
      .join(", "),
  );
  console.log(
    `Expectation kinds: success=${report.coverage.expectationKinds.success}, failure=${report.coverage.expectationKinds.failure}`,
  );
}

function main() {
  const command =
    process.argv[2] ?? "--print";

  if (command === "--write") {
    writeReport();
    return;
  }

  if (command === "--check") {
    checkReport();
    return;
  }

  if (command === "--print") {
    const report =
      generateConformanceReport();

    process.stdout.write(
      serializeConformanceReport(report),
    );
    return;
  }

  throw new Error(
    `Unknown report command: ${command}`,
  );
}

const invokedPath =
  process.argv[1] === undefined
    ? undefined
    : resolve(process.argv[1]);

if (
  invokedPath ===
  resolve(fileURLToPath(import.meta.url))
) {
  main();
}
