import test from "node:test";
import assert from "node:assert/strict";
import {
  readFileSync,
  readdirSync,
} from "node:fs";
import {
  dirname,
  resolve,
} from "node:path";
import {
  fileURLToPath,
} from "node:url";

import {
  runProfileScenarios,
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

function loadScenarios() {
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

test("freezes the finite Phase 6.4 profile scenario corpus", () => {
  const scenarios = loadScenarios();

  assert.equal(scenarios.length, 15);
  assert.equal(
    new Set(
      scenarios.map(
        (scenario) => scenario.id,
      ),
    ).size,
    15,
  );

  const required = scenarios.filter(
    (scenario) =>
      scenario.lifecycle === "required",
  );
  const draft = scenarios.filter(
    (scenario) =>
      scenario.lifecycle === "draft",
  );

  assert.equal(required.length, 13);
  assert.equal(draft.length, 2);

  const categories = new Set(
    scenarios.map(
      (scenario) => scenario.category,
    ),
  );

  assert.deepEqual(
    [...categories].sort(),
    [
      "latin",
      "layout-normalization",
      "mixed",
      "negative",
      "numeric",
      "persian",
      "sequence",
    ],
  );

  assert.ok(
    scenarios.filter(
      (scenario) =>
        scenario.category === "negative",
    ).length >= 3,
  );

  assert.ok(
    scenarios.filter(
      (scenario) =>
        scenario.tags.includes("composition"),
    ).length >= 8,
  );
});

test("executes every committed Phase 6.4 scenario successfully", () => {
  const scenarios = loadScenarios();
  const results =
    runProfileScenarios(scenarios);

  assert.equal(results.length, 15);

  const failed = results.filter(
    (result) =>
      result.status !== "pass",
  );

  assert.deepEqual(
    failed,
    [],
    JSON.stringify(failed, null, 2),
  );
});

test("keeps the committed corpus execution deterministic", () => {
  const scenarios = loadScenarios();

  assert.deepEqual(
    runProfileScenarios(scenarios),
    runProfileScenarios(scenarios),
  );
});

test("orders committed results by scenario ID", () => {
  const results =
    runProfileScenarios(loadScenarios());

  const ids = results.map(
    (result) => result.id,
  );

  assert.deepEqual(
    ids,
    [...ids].sort((left, right) =>
      left.localeCompare(right),
    ),
  );
});
