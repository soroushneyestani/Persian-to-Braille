import test from "node:test";
import assert from "node:assert/strict";
import {
  readFileSync,
} from "node:fs";
import {
  dirname,
  resolve,
} from "node:path";
import {
  fileURLToPath,
} from "node:url";

import {
  buildConformanceReport,
  enforceConformanceGates,
  generateConformanceReport,
  serializeConformanceReport,
  validateConformanceReport,
} from "./profile-conformance-report.mjs";

const here = dirname(
  fileURLToPath(import.meta.url),
);
const repoRoot = resolve(here, "..", "..");
const committedReportPath = resolve(
  repoRoot,
  "conformance",
  "reports",
  "fa-ir-g1-0.1.0.json",
);

test("builds the frozen Phase 6.5 coverage summary", () => {
  const report =
    generateConformanceReport();

  assert.deepEqual(
    report.summary,
    {
      total: 15,
      required: 13,
      draft: 2,
      passed: 15,
      failed: 0,
    },
  );

  assert.deepEqual(
    report.coverage.categories,
    {
      persian: 1,
      sequence: 1,
      numeric: 4,
      latin: 2,
      "layout-normalization": 2,
      mixed: 2,
      negative: 3,
    },
  );

  assert.deepEqual(
    report.coverage.lifecycles,
    {
      required: 13,
      draft: 2,
    },
  );

  assert.deepEqual(
    report.coverage.expectationKinds,
    {
      success: 12,
      failure: 3,
    },
  );
});

test("validates the generated report against the machine-readable report schema", () => {
  const report =
    buildConformanceReport();

  assert.doesNotThrow(() =>
    validateConformanceReport(report),
  );
});

test("rejects a report with an unsupported property", () => {
  const report =
    buildConformanceReport();

  report.unexpected = true;

  assert.throws(
    () =>
      validateConformanceReport(report),
    /unsupported property unexpected/,
  );
});

test("fails the required-scenario gate when a required result fails", () => {
  const report =
    structuredClone(
      buildConformanceReport(),
    );

  const required =
    report.results.find(
      (result) =>
        result.lifecycle ===
        "required",
    );

  assert.ok(required);

  required.status = "fail";
  required.diagnostics = [
    "synthetic required failure",
  ];

  assert.throws(
    () =>
      enforceConformanceGates(report),
    /Required profile conformance scenarios failed/,
  );
});

test("does not treat a draft scenario failure as normative promotion logic", () => {
  const report =
    structuredClone(
      buildConformanceReport(),
    );

  const draft =
    report.results.find(
      (result) =>
        result.lifecycle === "draft",
    );

  assert.ok(draft);

  draft.status = "fail";
  draft.diagnostics = [
    "synthetic draft failure",
  ];

  assert.doesNotThrow(() =>
    enforceConformanceGates(report),
  );
});

test("serializes the report deterministically", () => {
  assert.equal(
    serializeConformanceReport(
      generateConformanceReport(),
    ),
    serializeConformanceReport(
      generateConformanceReport(),
    ),
  );
});

test("keeps result ordering deterministic by scenario ID", () => {
  const report =
    generateConformanceReport();
  const ids =
    report.results.map(
      (result) => result.id,
    );

  assert.deepEqual(
    ids,
    [...ids].sort(
      (left, right) =>
        left.localeCompare(right),
    ),
  );
});

test("keeps the committed machine-readable report at the generated fixed point", () => {
  const expected =
    serializeConformanceReport(
      generateConformanceReport(),
    );
  const actual =
    readFileSync(
      committedReportPath,
      "utf8",
    );

  assert.equal(actual, expected);
});
