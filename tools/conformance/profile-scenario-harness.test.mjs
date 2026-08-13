import test from "node:test";
import assert from "node:assert/strict";

import {
  ProfileScenarioHarnessError,
  codePointsForText,
  runProfileScenario,
  runProfileScenarios,
} from "./profile-scenario-harness.mjs";

const profile = {
  id: "fa-ir-g1",
  version: "0.1.0",
};

function scenario({
  id,
  category,
  input,
  expected,
  lifecycle = "required",
  tags = [],
}) {
  return {
    schemaVersion: 1,
    id,
    version: "1.0.0",
    lifecycle,
    category,
    profile,
    input: {
      text: input,
      codePoints: codePointsForText(input),
    },
    expected,
    tags,
  };
}

test("executes a valid Persian success scenario through the real Core translator", () => {
  const fixture = scenario({
    id: "FA-PROFILE-CONF-PERSIAN-HARNESS-001",
    category: "persian",
    input: "\u0633\u0644\u0627\u0645",
    expected: {
      kind: "success",
      cells: ["234", "123", "1", "134"],
      unicodeBraille:
        "\u280E\u2807\u2801\u280D",
      structuralTokens: [],
    },
    tags: ["harness", "persian"],
  });

  const result = runProfileScenario(fixture);

  assert.equal(result.status, "pass");
  assert.deepEqual(result.diagnostics, []);
});

test("executes a multi-rule numeric scenario and checks trace constraints", () => {
  const fixture = scenario({
    id: "FA-PROFILE-CONF-NUMERIC-HARNESS-001",
    category: "numeric",
    input: "1.2",
    expected: {
      kind: "success",
      cells: ["3456", "1", "2", "12"],
      unicodeBraille:
        "\u283C\u2801\u2802\u2803",
      structuralTokens: [],
      trace: {
        requiredRuleIds: [
          "FA-G1-NUMRULE-001",
          "FA-G1-NUMRULE-005",
        ],
        engineTokenClassesInOrder: [
          "numeric-indicator",
          "numeric-decimal-separator",
        ],
      },
    },
    tags: ["harness", "numeric"],
  });

  const result = runProfileScenario(fixture);

  assert.equal(result.status, "pass");
});

test("executes an unknown-character failure scenario", () => {
  const fixture = scenario({
    id: "FA-PROFILE-CONF-NEGATIVE-UNKNOWN-001",
    category: "negative",
    input: "\u{1F600}",
    expected: {
      kind: "failure",
      code: "UNKNOWN_CHARACTER",
      location: {
        codePointIndex: 0,
        utf16Index: 0,
      },
      character: "\u{1F600}",
      codePoint: "U+1F600",
    },
    tags: ["harness", "negative"],
  });

  const result = runProfileScenario(fixture);

  assert.equal(result.status, "pass");
});

test("executes an unknown-format-control failure scenario", () => {
  const fixture = scenario({
    id: "FA-PROFILE-CONF-NEGATIVE-FORMAT-001",
    category: "negative",
    input: "\u200D",
    expected: {
      kind: "failure",
      code: "PREPROCESSING_FAILED",
      causeCode: "UNKNOWN_FORMAT_CONTROL",
    },
    tags: ["harness", "negative"],
  });

  const result = runProfileScenario(fixture);

  assert.equal(result.status, "pass");
});

test("returns a deterministic fail result for a valid but incorrect expectation", () => {
  const fixture = scenario({
    id: "FA-PROFILE-CONF-PERSIAN-MISMATCH-001",
    category: "persian",
    input: "\u0627",
    expected: {
      kind: "success",
      cells: ["999"],
      unicodeBraille: "",
      structuralTokens: [],
    },
    tags: ["harness"],
  });

  const first = runProfileScenario(fixture);
  const second = runProfileScenario(fixture);

  assert.deepEqual(first, second);
  assert.equal(first.status, "fail");
  assert.ok(first.diagnostics.length > 0);
});

test("rejects unknown scenario properties through the machine-readable schema", () => {
  const fixture = scenario({
    id: "FA-PROFILE-CONF-SCHEMA-UNKNOWN-001",
    category: "persian",
    input: "\u0627",
    expected: {
      kind: "success",
      cells: ["1"],
      unicodeBraille: "\u2801",
      structuralTokens: [],
    },
  });

  fixture.unexpected = true;

  assert.throws(
    () => runProfileScenario(fixture),
    (error) =>
      error instanceof
        ProfileScenarioHarnessError &&
      error.code === "INVALID_SCENARIO",
  );
});

test("rejects text/codePoints mismatches before translation", () => {
  const fixture = scenario({
    id: "FA-PROFILE-CONF-UNICODE-MISMATCH-001",
    category: "persian",
    input: "\u0627",
    expected: {
      kind: "success",
      cells: ["1"],
      unicodeBraille: "\u2801",
      structuralTokens: [],
    },
  });

  fixture.input.codePoints = ["U+0628"];

  assert.throws(
    () => runProfileScenario(fixture),
    (error) =>
      error instanceof
        ProfileScenarioHarnessError &&
      error.code ===
        "UNICODE_INPUT_MISMATCH",
  );
});

test("rejects profile version mismatches before translation", () => {
  const fixture = scenario({
    id: "FA-PROFILE-CONF-PROFILE-MISMATCH-001",
    category: "persian",
    input: "\u0627",
    expected: {
      kind: "success",
      cells: ["1"],
      unicodeBraille: "\u2801",
      structuralTokens: [],
    },
  });

  fixture.profile = {
    id: "fa-ir-g1",
    version: "9.9.9",
  };

  assert.throws(
    () => runProfileScenario(fixture),
    (error) =>
      error instanceof
        ProfileScenarioHarnessError &&
      error.code === "PROFILE_MISMATCH",
  );
});

test("rejects duplicate scenario IDs in a scenario set", () => {
  const fixture = scenario({
    id: "FA-PROFILE-CONF-DUPLICATE-001",
    category: "persian",
    input: "\u0627",
    expected: {
      kind: "success",
      cells: ["1"],
      unicodeBraille: "\u2801",
      structuralTokens: [],
    },
  });

  assert.throws(
    () =>
      runProfileScenarios([
        fixture,
        structuredClone(fixture),
      ]),
    (error) =>
      error instanceof
        ProfileScenarioHarnessError &&
      error.code ===
        "DUPLICATE_SCENARIO_ID",
  );
});

test("orders scenario-set results deterministically by scenario ID", () => {
  const a = scenario({
    id: "FA-PROFILE-CONF-ORDER-A",
    category: "persian",
    input: "\u0627",
    expected: {
      kind: "success",
      cells: ["1"],
      unicodeBraille: "\u2801",
      structuralTokens: [],
    },
  });
  const b = scenario({
    id: "FA-PROFILE-CONF-ORDER-B",
    category: "persian",
    input: "\u0627",
    expected: {
      kind: "success",
      cells: ["1"],
      unicodeBraille: "\u2801",
      structuralTokens: [],
    },
  });

  const results = runProfileScenarios([b, a]);

  assert.deepEqual(
    results.map((result) => result.id),
    [a.id, b.id],
  );
});
