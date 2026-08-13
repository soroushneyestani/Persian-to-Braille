import type {
  JsonObject,
  JsonValue,
  RuntimeSpecificationBundle,
} from "./specification.js";
import { getBundledSpecification } from "./specification.js";
import type {
  ContextSnapshot,
  EngineToken,
  EngineTokenClass,
  RuleLifecycleStatus,
  RuleMatch,
  RuleOutputSnapshot,
} from "./translation.js";

interface ModeRuleView {
  readonly id: string;
  readonly lifecycleStatus: RuleLifecycleStatus;
  readonly priority: number;
  readonly tokenClass: EngineTokenClass;
  readonly output: RuleOutputSnapshot;
}

export interface ModeRuleExecutor {
  execute(token: EngineToken): RuleMatch | null;
}

function isJsonObject(
  value: JsonValue | undefined,
): value is JsonObject {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function readObject(
  object: JsonObject,
  key: string,
): JsonObject | undefined {
  const value = object[key];
  return isJsonObject(value) ? value : undefined;
}

function readString(
  object: JsonObject,
  key: string,
): string | undefined {
  const value = object[key];
  return typeof value === "string" ? value : undefined;
}

function readNumber(
  object: JsonObject,
  key: string,
): number | undefined {
  const value = object[key];
  return typeof value === "number" ? value : undefined;
}

function requireString(
  object: JsonObject,
  key: string,
  context: string,
): string {
  const value = readString(object, key);

  if (value === undefined) {
    throw new Error(
      `Invalid canonical specification: ${context}.${key} must be a string.`,
    );
  }

  return value;
}

function requireNumber(
  object: JsonObject,
  key: string,
  context: string,
): number {
  const value = readNumber(object, key);

  if (value === undefined) {
    throw new Error(
      `Invalid canonical specification: ${context}.${key} must be a number.`,
    );
  }

  return value;
}

function requireStringArray(
  object: JsonObject,
  key: string,
  context: string,
): readonly string[] {
  const value = object[key];

  if (
    !Array.isArray(value) ||
    value.some((item) => typeof item !== "string")
  ) {
    throw new Error(
      `Invalid canonical specification: ${context}.${key} must be a string array.`,
    );
  }

  return value as readonly string[];
}

function isRuleLifecycleStatus(
  value: string,
): value is RuleLifecycleStatus {
  return value === "candidate" || value === "normative";
}

function isEngineTokenClass(
  value: string,
): value is EngineTokenClass {
  return (
    value === "latin-character-class" ||
    value === "latin-span-begin" ||
    value === "latin-span-end" ||
    value === "latin-capital-indicator" ||
    value === "numeric-indicator" ||
    value === "numeric-begin" ||
    value === "numeric-internal" ||
    value === "numeric-decimal-separator" ||
    value === "numeric-end" ||
    value === "numeric-fraction-separator"
  );
}

function createOutput(
  output: JsonObject,
  ruleId: string,
): RuleOutputSnapshot {
  const unicodeBrailleValue =
    output["unicodeBraille"];
  const structuralTokenValue =
    output["structuralToken"];

  const unicodeBraille =
    unicodeBrailleValue === null
      ? null
      : typeof unicodeBrailleValue === "string"
        ? unicodeBrailleValue
        : undefined;

  const structuralToken =
    structuralTokenValue === null
      ? null
      : typeof structuralTokenValue === "string"
        ? structuralTokenValue
        : undefined;

  if (unicodeBraille === undefined) {
    throw new Error(
      `Invalid canonical specification: rule ${ruleId} output.unicodeBraille must be string|null.`,
    );
  }

  if (structuralToken === undefined) {
    throw new Error(
      `Invalid canonical specification: rule ${ruleId} output.structuralToken must be string|null.`,
    );
  }

  return {
    cells: requireStringArray(
      output,
      "cells",
      `rule ${ruleId}.output`,
    ),
    unicodeBraille,
    structuralToken,
  };
}

function buildModeRules(
  specification: RuntimeSpecificationBundle,
): ReadonlyMap<EngineTokenClass, ModeRuleView> {
  const result =
    new Map<EngineTokenClass, ModeRuleView>();

  for (const rule of specification.rules) {
    if (readString(rule, "type") !== "mode") {
      continue;
    }

    const id = requireString(
      rule,
      "id",
      "mode rule",
    );
    const status = requireString(
      rule,
      "status",
      `rule ${id}`,
    );
    const priority = requireNumber(
      rule,
      "priority",
      `rule ${id}`,
    );
    const input = readObject(rule, "input");
    const output = readObject(rule, "output");

    if (input === undefined || output === undefined) {
      throw new Error(
        `Invalid canonical specification: mode rule ${id} requires input/output objects.`,
      );
    }

    if (readString(input, "kind") !== "structural") {
      throw new Error(
        `Invalid canonical specification: mode rule ${id} must use structural input.`,
      );
    }

    const tokenClassRaw = requireString(
      input,
      "tokenClass",
      `rule ${id}.input`,
    );

    if (!isEngineTokenClass(tokenClassRaw)) {
      throw new Error(
        `Unsupported canonical mode token class ${tokenClassRaw} in ${id}.`,
      );
    }

    if (!isRuleLifecycleStatus(status)) {
      throw new Error(
        `Unsupported canonical lifecycle status ${status} in ${id}.`,
      );
    }

    if (result.has(tokenClassRaw)) {
      throw new Error(
        `Ambiguous canonical mode token class ${tokenClassRaw}.`,
      );
    }

    result.set(tokenClassRaw, {
      id,
      lifecycleStatus: status,
      priority,
      tokenClass: tokenClassRaw,
      output: createOutput(output, id),
    });
  }

  if (result.size !== 5) {
    throw new Error(
      `Unsupported canonical mode-rule inventory: expected 5, found ${result.size}.`,
    );
  }

  return result;
}

class SpecificationDrivenModeRuleExecutor
  implements ModeRuleExecutor
{
  readonly #rules:
    ReadonlyMap<EngineTokenClass, ModeRuleView>;

  constructor(
    specification: RuntimeSpecificationBundle,
  ) {
    this.#rules = buildModeRules(specification);
  }

  execute(token: EngineToken): RuleMatch | null {
    const rule = this.#rules.get(
      token.tokenClass,
    );

    if (rule === undefined) {
      return null;
    }

    const emptyContext: ContextSnapshot = {
      before: [],
      after: [],
    };

    return {
      ruleId: rule.id,
      lifecycleStatus:
        rule.lifecycleStatus,
      ruleType: "mode",
      inputKind: "structural",
      priority: rule.priority,
      matchedText: "",
      span: token.span,
      tokenClass: rule.tokenClass,
      context: emptyContext,
      output: rule.output,
    };
  }
}

export function createModeRuleExecutor(): ModeRuleExecutor {
  return new SpecificationDrivenModeRuleExecutor(
    getBundledSpecification(),
  );
}
