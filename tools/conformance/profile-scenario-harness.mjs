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
  createForwardTranslator,
  getBundledSpecification,
} from "../../packages/core/dist/index.js";

const here = dirname(
  fileURLToPath(import.meta.url),
);
const repoRoot = resolve(here, "..", "..");
const scenarioSchema = JSON.parse(
  readFileSync(
    resolve(
      repoRoot,
      "conformance",
      "schema",
      "profile-scenario.schema.json",
    ),
    "utf8",
  ),
);

export class ProfileScenarioHarnessError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "ProfileScenarioHarnessError";
    this.code = code;
  }
}

function isObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function deepEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function resolveLocalRef(ref, rootSchema) {
  if (
    typeof ref !== "string" ||
    !ref.startsWith("#/")
  ) {
    throw new Error(
      `Unsupported JSON Schema reference: ${String(ref)}`,
    );
  }

  let current = rootSchema;

  for (const rawPart of ref.slice(2).split("/")) {
    const part = rawPart
      .replaceAll("~1", "/")
      .replaceAll("~0", "~");

    if (!isObject(current) || !(part in current)) {
      throw new Error(
        `Broken JSON Schema reference: ${ref}`,
      );
    }

    current = current[part];
  }

  return current;
}

function schemaErrors(
  value,
  schema,
  rootSchema,
  path = "$",
) {
  if (!isObject(schema)) {
    return [
      `${path}: invalid validator schema node`,
    ];
  }

  if (schema.$ref !== undefined) {
    return schemaErrors(
      value,
      resolveLocalRef(schema.$ref, rootSchema),
      rootSchema,
      path,
    );
  }

  if (Array.isArray(schema.oneOf)) {
    const branchResults = schema.oneOf.map(
      (branch) =>
        schemaErrors(
          value,
          branch,
          rootSchema,
          path,
        ),
    );
    const successful = branchResults.filter(
      (errors) => errors.length === 0,
    );

    if (successful.length === 1) {
      return [];
    }

    return [
      `${path}: expected exactly one oneOf branch to match; matched ${successful.length}`,
    ];
  }

  const errors = [];

  if (
    schema.const !== undefined &&
    !deepEqual(value, schema.const)
  ) {
    errors.push(
      `${path}: expected constant ${JSON.stringify(schema.const)}`,
    );
    return errors;
  }

  if (
    Array.isArray(schema.enum) &&
    !schema.enum.some(
      (candidate) => deepEqual(value, candidate),
    )
  ) {
    errors.push(
      `${path}: value is not in the allowed enum`,
    );
    return errors;
  }

  if (schema.type !== undefined) {
    let validType = true;

    switch (schema.type) {
      case "object":
        validType = isObject(value);
        break;
      case "array":
        validType = Array.isArray(value);
        break;
      case "string":
        validType = typeof value === "string";
        break;
      case "integer":
        validType = Number.isInteger(value);
        break;
      case "number":
        validType =
          typeof value === "number" &&
          Number.isFinite(value);
        break;
      case "boolean":
        validType = typeof value === "boolean";
        break;
      case "null":
        validType = value === null;
        break;
      default:
        throw new Error(
          `Unsupported JSON Schema type: ${schema.type}`,
        );
    }

    if (!validType) {
      errors.push(
        `${path}: expected type ${schema.type}`,
      );
      return errors;
    }
  }

  if (typeof value === "string") {
    if (
      Number.isInteger(schema.minLength) &&
      value.length < schema.minLength
    ) {
      errors.push(
        `${path}: string is shorter than minLength ${schema.minLength}`,
      );
    }

    if (
      typeof schema.pattern === "string" &&
      !new RegExp(schema.pattern, "u").test(value)
    ) {
      errors.push(
        `${path}: string does not match ${schema.pattern}`,
      );
    }
  }

  if (
    typeof value === "number" &&
    typeof schema.minimum === "number" &&
    value < schema.minimum
  ) {
    errors.push(
      `${path}: number is below minimum ${schema.minimum}`,
    );
  }

  if (Array.isArray(value)) {
    if (schema.uniqueItems === true) {
      const seen = new Set();

      for (const item of value) {
        const key = JSON.stringify(item);

        if (seen.has(key)) {
          errors.push(
            `${path}: array items must be unique`,
          );
          break;
        }

        seen.add(key);
      }
    }

    if (schema.items !== undefined) {
      value.forEach((item, index) => {
        errors.push(
          ...schemaErrors(
            item,
            schema.items,
            rootSchema,
            `${path}[${index}]`,
          ),
        );
      });
    }
  }

  if (isObject(value)) {
    const required = Array.isArray(schema.required)
      ? schema.required
      : [];

    for (const key of required) {
      if (!(key in value)) {
        errors.push(
          `${path}: missing required property ${key}`,
        );
      }
    }

    const properties = isObject(schema.properties)
      ? schema.properties
      : {};

    for (const [key, childSchema] of Object.entries(
      properties,
    )) {
      if (key in value) {
        errors.push(
          ...schemaErrors(
            value[key],
            childSchema,
            rootSchema,
            `${path}.${key}`,
          ),
        );
      }
    }

    if (schema.propertyNames !== undefined) {
      for (const key of Object.keys(value)) {
        errors.push(
          ...schemaErrors(
            key,
            schema.propertyNames,
            rootSchema,
            `${path}{property:${key}}`,
          ),
        );
      }
    }

    for (const [key, childValue] of Object.entries(value)) {
      if (key in properties) {
        continue;
      }

      if (schema.additionalProperties === false) {
        errors.push(
          `${path}: unsupported property ${key}`,
        );
      } else if (isObject(schema.additionalProperties)) {
        errors.push(
          ...schemaErrors(
            childValue,
            schema.additionalProperties,
            rootSchema,
            `${path}.${key}`,
          ),
        );
      }
    }
  }

  return errors;
}

export function validateJsonSchemaSubset(
  value,
  schema,
) {
  return schemaErrors(
    value,
    schema,
    schema,
  );
}

export function validateProfileScenarioDocument(
  scenario,
) {
  const errors = validateJsonSchemaSubset(
    scenario,
    scenarioSchema,
  );

  if (errors.length > 0) {
    throw new ProfileScenarioHarnessError(
      "INVALID_SCENARIO",
      errors.join("\n"),
    );
  }
}

export function codePointsForText(text) {
  return Array.from(text).map((character) => {
    const value = character.codePointAt(0);

    if (value === undefined) {
      throw new Error(
        "Cannot derive a code point from an empty character.",
      );
    }

    return `U+${value
      .toString(16)
      .toUpperCase()
      .padStart(4, "0")}`;
  });
}

function validateInputIntegrity(scenario) {
  const actual = codePointsForText(
    scenario.input.text,
  );

  if (!deepEqual(actual, scenario.input.codePoints)) {
    throw new ProfileScenarioHarnessError(
      "UNICODE_INPUT_MISMATCH",
      [
        `Scenario ${scenario.id} text/codePoints mismatch.`,
        `Expected from text: ${JSON.stringify(actual)}`,
        `Fixture codePoints: ${JSON.stringify(scenario.input.codePoints)}`,
      ].join(" "),
    );
  }
}

function validateProfilePin(scenario) {
  const specification = getBundledSpecification();

  if (
    scenario.profile.id !== specification.profileId ||
    scenario.profile.version !==
      specification.profileVersion
  ) {
    throw new ProfileScenarioHarnessError(
      "PROFILE_MISMATCH",
      [
        `Scenario ${scenario.id} pins`,
        `${scenario.profile.id} ${scenario.profile.version},`,
        `runtime is ${specification.profileId} ${specification.profileVersion}.`,
      ].join(" "),
    );
  }
}

function addMismatch(
  diagnostics,
  label,
  expected,
  actual,
) {
  if (!deepEqual(expected, actual)) {
    diagnostics.push(
      `${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}

function compareTrace(
  expected,
  actualTrace,
  diagnostics,
) {
  if (expected === undefined) {
    return;
  }

  const actualRuleIds = actualTrace.matches.map(
    (match) => match.ruleId,
  );

  if (expected.ruleIdsInOrder !== undefined) {
    addMismatch(
      diagnostics,
      "trace.ruleIdsInOrder",
      expected.ruleIdsInOrder,
      actualRuleIds,
    );
  }

  if (expected.requiredRuleIds !== undefined) {
    for (const ruleId of expected.requiredRuleIds) {
      if (!actualRuleIds.includes(ruleId)) {
        diagnostics.push(
          `trace.requiredRuleIds: missing ${ruleId}`,
        );
      }
    }
  }

  if (expected.forbiddenRuleIds !== undefined) {
    for (const ruleId of expected.forbiddenRuleIds) {
      if (actualRuleIds.includes(ruleId)) {
        diagnostics.push(
          `trace.forbiddenRuleIds: unexpectedly present ${ruleId}`,
        );
      }
    }
  }

  if (
    expected.engineTokenClassesInOrder !== undefined
  ) {
    addMismatch(
      diagnostics,
      "trace.engineTokenClassesInOrder",
      expected.engineTokenClassesInOrder,
      actualTrace.engineTokens.map(
        (token) => token.tokenClass,
      ),
    );
  }

  if (
    expected.requiredNormalizationRuleIds !== undefined
  ) {
    const actualNormalizationRuleIds =
      actualTrace.normalizationAnnotations.flatMap(
        (annotation) => annotation.ruleIds,
      );

    for (
      const ruleId of
        expected.requiredNormalizationRuleIds
    ) {
      if (
        !actualNormalizationRuleIds.includes(ruleId)
      ) {
        diagnostics.push(
          `trace.requiredNormalizationRuleIds: missing ${ruleId}`,
        );
      }
    }
  }
}

function compareSuccess(
  scenario,
  actual,
) {
  const diagnostics = [];
  const expected = scenario.expected;

  if (!actual.ok) {
    diagnostics.push(
      `expected success, got failure ${actual.code}`,
    );
    return diagnostics;
  }

  addMismatch(
    diagnostics,
    "cells",
    expected.cells,
    actual.cells,
  );
  addMismatch(
    diagnostics,
    "unicodeBraille",
    expected.unicodeBraille,
    actual.unicodeBraille,
  );
  addMismatch(
    diagnostics,
    "structuralTokens",
    expected.structuralTokens,
    actual.structuralTokens,
  );

  if (expected.normalizedText !== undefined) {
    addMismatch(
      diagnostics,
      "normalizedText",
      expected.normalizedText,
      actual.normalizedText,
    );
  }

  compareTrace(
    expected.trace,
    actual.trace,
    diagnostics,
  );

  return diagnostics;
}

function readFailureCauseCode(actual) {
  return (
    isObject(actual.cause) &&
    typeof actual.cause.code === "string"
  )
    ? actual.cause.code
    : undefined;
}

function compareFailure(
  scenario,
  actual,
) {
  const diagnostics = [];
  const expected = scenario.expected;

  if (actual.ok) {
    diagnostics.push(
      "expected failure, got success",
    );
    return diagnostics;
  }

  addMismatch(
    diagnostics,
    "failure.code",
    expected.code,
    actual.code,
  );

  if (expected.causeCode !== undefined) {
    addMismatch(
      diagnostics,
      "failure.causeCode",
      expected.causeCode,
      readFailureCauseCode(actual),
    );
  }

  if (
    expected.messageIncludes !== undefined &&
    !actual.message.includes(
      expected.messageIncludes,
    )
  ) {
    diagnostics.push(
      `failure.messageIncludes: ${JSON.stringify(expected.messageIncludes)} not found`,
    );
  }

  for (const key of [
    "location",
    "character",
    "codePoint",
    "candidateRuleIds",
  ]) {
    if (expected[key] !== undefined) {
      addMismatch(
        diagnostics,
        `failure.${key}`,
        expected[key],
        actual[key],
      );
    }
  }

  return diagnostics;
}

export function runProfileScenario(scenario) {
  validateProfileScenarioDocument(scenario);
  validateInputIntegrity(scenario);
  validateProfilePin(scenario);

  const translator = createForwardTranslator();
  const actual = translator.translate(
    scenario.input.text,
  );
  const expectationKind =
    scenario.expected.kind;

  const diagnostics =
    expectationKind === "success"
      ? compareSuccess(scenario, actual)
      : compareFailure(scenario, actual);

  return {
    id: scenario.id,
    lifecycle: scenario.lifecycle,
    category: scenario.category,
    expectationKind,
    status:
      diagnostics.length === 0
        ? "pass"
        : "fail",
    diagnostics,
  };
}

export function runProfileScenarios(scenarios) {
  if (!Array.isArray(scenarios)) {
    throw new ProfileScenarioHarnessError(
      "INVALID_SCENARIO_SET",
      "Profile scenario set must be an array.",
    );
  }

  const seenIds = new Set();

  for (const scenario of scenarios) {
    validateProfileScenarioDocument(scenario);

    if (seenIds.has(scenario.id)) {
      throw new ProfileScenarioHarnessError(
        "DUPLICATE_SCENARIO_ID",
        `Duplicate profile scenario ID: ${scenario.id}`,
      );
    }

    seenIds.add(scenario.id);
  }

  return [...scenarios]
    .sort((left, right) =>
      left.id.localeCompare(right.id),
    )
    .map((scenario) =>
      runProfileScenario(scenario),
    );
}
