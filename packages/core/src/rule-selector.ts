import type {
  JsonObject,
  JsonValue,
  RuntimeSpecificationBundle,
} from "./specification.js";
import { getBundledSpecification } from "./specification.js";
import type {
  ContextClassifier,
  ContextClassificationRequest,
  ContextSnapshot,
  EngineTokenClass,
  RuleLifecycleStatus,
  RuleMatch,
  RuleOutputSnapshot,
  SemanticContextClass,
  TranslationInputKind,
  TranslationRuleType,
  UnicodeSpan,
} from "./translation.js";
import type { UnicodeLocation } from "./normalization.js";

const DECIMAL_NUMBER_PATTERN = /^\p{Decimal_Number}$/u;

interface TextualRuleView {
  readonly id: string;
  readonly lifecycleStatus: RuleLifecycleStatus;
  readonly ruleType:
    | "character"
    | "context"
    | "sequence"
    | "layout";
  readonly inputKind: "scalar" | "context" | "sequence";
  readonly priority: number;
  readonly text: string;
  readonly textCodePointLength: number;
  readonly before?: SemanticContextClass;
  readonly after?: SemanticContextClass;
  readonly tokenClass: EngineTokenClass | null;
  readonly output: RuleOutputSnapshot;
}

export interface RuleSelectionMatch {
  readonly kind: "match";
  readonly match: RuleMatch;
}

export interface RuleSelectionNoMatch {
  readonly kind: "no-match";
  readonly location: UnicodeLocation;
  readonly character: string;
  readonly codePoint: string;
}

export interface RuleSelectionAmbiguous {
  readonly kind: "ambiguous";
  readonly span: UnicodeSpan;
  readonly candidateRuleIds: readonly string[];
}

export type RuleSelectionOutcome =
  | RuleSelectionMatch
  | RuleSelectionNoMatch
  | RuleSelectionAmbiguous;

export interface RuleSelector {
  select(
    text: string,
    codePointIndex: number,
  ): RuleSelectionOutcome;
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

function toCodePoint(character: string): string {
  const value = character.codePointAt(0);

  if (value === undefined) {
    throw new Error("Cannot derive a code point from an empty character.");
  }

  return `U+${value
    .toString(16)
    .toUpperCase()
    .padStart(4, "0")}`;
}

function toLocations(
  text: string,
): readonly UnicodeLocation[] {
  const locations: UnicodeLocation[] = [];
  let codePointIndex = 0;
  let utf16Index = 0;

  for (const character of text) {
    locations.push({
      codePointIndex,
      utf16Index,
    });

    codePointIndex += 1;
    utf16Index += character.length;
  }

  locations.push({
    codePointIndex,
    utf16Index,
  });

  return locations;
}

function createSpan(
  locations: readonly UnicodeLocation[],
  startCodePointIndex: number,
  codePointLength: number,
): UnicodeSpan {
  const start = locations[startCodePointIndex];
  const end = locations[startCodePointIndex + codePointLength];

  if (start === undefined || end === undefined) {
    throw new RangeError(
      "Cannot create a Unicode span outside the input text.",
    );
  }

  return { start, end };
}

function isRuleLifecycleStatus(
  value: string,
): value is RuleLifecycleStatus {
  return value === "candidate" || value === "normative";
}

function isTranslationRuleType(
  value: string,
): value is TranslationRuleType {
  return (
    value === "character" ||
    value === "context" ||
    value === "sequence" ||
    value === "mode" ||
    value === "layout" ||
    value === "normalization"
  );
}

function isTranslationInputKind(
  value: string,
): value is TranslationInputKind {
  return (
    value === "scalar" ||
    value === "context" ||
    value === "sequence" ||
    value === "structural"
  );
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

function isSemanticContextClass(
  value: string,
): value is SemanticContextClass {
  return value === "digit";
}

function createRuleOutputSnapshot(
  output: JsonObject,
  ruleId: string,
): RuleOutputSnapshot {
  const unicodeBrailleValue = output["unicodeBraille"];
  const structuralTokenValue = output["structuralToken"];

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

function createTextualRuleViews(
  specification: RuntimeSpecificationBundle,
): readonly TextualRuleView[] {
  const result: TextualRuleView[] = [];

  for (const rawRule of specification.rules) {
    const id = requireString(rawRule, "id", "rule");
    const rawType = requireString(
      rawRule,
      "type",
      `rule ${id}`,
    );
    const rawStatus = requireString(
      rawRule,
      "status",
      `rule ${id}`,
    );
    const priority = requireNumber(
      rawRule,
      "priority",
      `rule ${id}`,
    );
    const input = readObject(rawRule, "input");
    const output = readObject(rawRule, "output");

    if (input === undefined || output === undefined) {
      throw new Error(
        `Invalid canonical specification: rule ${id} requires input/output objects.`,
      );
    }

    const rawKind = requireString(
      input,
      "kind",
      `rule ${id}.input`,
    );

    if (!isTranslationRuleType(rawType)) {
      throw new Error(
        `Unsupported canonical rule type: ${rawType}.`,
      );
    }

    if (!isTranslationInputKind(rawKind)) {
      throw new Error(
        `Unsupported canonical input kind: ${rawKind}.`,
      );
    }

    if (!isRuleLifecycleStatus(rawStatus)) {
      throw new Error(
        `Unsupported canonical lifecycle status: ${rawStatus}.`,
      );
    }

    // Phase 4 owns normalization semantics. Phase 5.3 also leaves structural
    // mode rules to the later forward-pipeline/state-machine deliverable.
    if (
      rawType === "normalization" ||
      rawType === "mode" ||
      rawKind === "structural"
    ) {
      continue;
    }

    if (
      rawType !== "character" &&
      rawType !== "context" &&
      rawType !== "sequence" &&
      rawType !== "layout"
    ) {
      continue;
    }

    if (
      rawKind !== "scalar" &&
      rawKind !== "context" &&
      rawKind !== "sequence"
    ) {
      continue;
    }

    const text = requireString(
      input,
      "text",
      `rule ${id}.input`,
    );

    const beforeRaw = readString(input, "before");
    const afterRaw = readString(input, "after");
    const tokenClassRaw = readString(input, "tokenClass");

    if (
      beforeRaw !== undefined &&
      !isSemanticContextClass(beforeRaw)
    ) {
      throw new Error(
        `Unsupported canonical before-context class ${beforeRaw} in ${id}.`,
      );
    }

    if (
      afterRaw !== undefined &&
      !isSemanticContextClass(afterRaw)
    ) {
      throw new Error(
        `Unsupported canonical after-context class ${afterRaw} in ${id}.`,
      );
    }

    if (
      tokenClassRaw !== undefined &&
      !isEngineTokenClass(tokenClassRaw)
    ) {
      throw new Error(
        `Unsupported canonical token class ${tokenClassRaw} in ${id}.`,
      );
    }

    result.push({
      id,
      lifecycleStatus: rawStatus,
      ruleType: rawType,
      inputKind: rawKind,
      priority,
      text,
      textCodePointLength: Array.from(text).length,
      ...(beforeRaw === undefined
        ? {}
        : { before: beforeRaw }),
      ...(afterRaw === undefined
        ? {}
        : { after: afterRaw }),
      tokenClass:
        tokenClassRaw === undefined
          ? null
          : tokenClassRaw,
      output: createRuleOutputSnapshot(output, id),
    });
  }

  return result;
}

class SpecificationDrivenContextClassifier
  implements ContextClassifier
{
  readonly #digits: ReadonlySet<string>;

  constructor(
    specification: RuntimeSpecificationBundle,
  ) {
    const digits = new Set<string>();

    for (const rule of specification.rules) {
      const type = readString(rule, "type");
      const input = readObject(rule, "input");

      if (type !== "character" || input === undefined) {
        continue;
      }

      if (readString(input, "kind") !== "scalar") {
        continue;
      }

      const text = readString(input, "text");

      if (
        text !== undefined &&
        Array.from(text).length === 1 &&
        DECIMAL_NUMBER_PATTERN.test(text)
      ) {
        digits.add(text);
      }
    }

    if (digits.size !== 30) {
      throw new Error(
        `Unsupported canonical digit inventory: expected 30 admitted digits, found ${digits.size}.`,
      );
    }

    this.#digits = digits;
  }

  classify(
    request: ContextClassificationRequest,
  ): readonly SemanticContextClass[] {
    return this.#digits.has(request.character)
      ? ["digit"]
      : [];
  }
}

function classifyAt(
  classifier: ContextClassifier,
  text: string,
  characters: readonly string[],
  locations: readonly UnicodeLocation[],
  codePointIndex: number,
): readonly SemanticContextClass[] {
  const character = characters[codePointIndex];
  const location = locations[codePointIndex];

  if (character === undefined || location === undefined) {
    return [];
  }

  return classifier.classify({
    text,
    location,
    character,
  });
}

function contextMatches(
  required: SemanticContextClass | undefined,
  actual: readonly SemanticContextClass[],
): boolean {
  return (
    required === undefined ||
    actual.includes(required)
  );
}

function startsWithAt(
  characters: readonly string[],
  ruleCharacters: readonly string[],
  codePointIndex: number,
): boolean {
  if (
    codePointIndex + ruleCharacters.length >
    characters.length
  ) {
    return false;
  }

  for (
    let offset = 0;
    offset < ruleCharacters.length;
    offset += 1
  ) {
    if (
      characters[codePointIndex + offset] !==
      ruleCharacters[offset]
    ) {
      return false;
    }
  }

  return true;
}

class SpecificationDrivenRuleSelector
  implements RuleSelector
{
  readonly #rules: readonly TextualRuleView[];
  readonly #classifier: ContextClassifier;

  constructor(
    specification: RuntimeSpecificationBundle,
    classifier: ContextClassifier,
  ) {
    this.#rules = createTextualRuleViews(specification);
    this.#classifier = classifier;
  }

  select(
    text: string,
    codePointIndex: number,
  ): RuleSelectionOutcome {
    const characters = Array.from(text);
    const locations = toLocations(text);

    if (
      codePointIndex < 0 ||
      codePointIndex >= characters.length
    ) {
      throw new RangeError(
        `codePointIndex ${codePointIndex} is outside the input text.`,
      );
    }

    const currentCharacter = characters[codePointIndex]!;
    const currentLocation = locations[codePointIndex]!;
    const eligible: Array<{
      readonly rule: TextualRuleView;
      readonly context: ContextSnapshot;
      readonly span: UnicodeSpan;
    }> = [];

    for (const rule of this.#rules) {
      const ruleCharacters = Array.from(rule.text);

      if (
        !startsWithAt(
          characters,
          ruleCharacters,
          codePointIndex,
        )
      ) {
        continue;
      }

      const beforeIndex = codePointIndex - 1;
      const afterIndex =
        codePointIndex + rule.textCodePointLength;

      const beforeClasses = classifyAt(
        this.#classifier,
        text,
        characters,
        locations,
        beforeIndex,
      );
      const afterClasses = classifyAt(
        this.#classifier,
        text,
        characters,
        locations,
        afterIndex,
      );

      if (
        !contextMatches(rule.before, beforeClasses) ||
        !contextMatches(rule.after, afterClasses)
      ) {
        continue;
      }

      eligible.push({
        rule,
        context: {
          before: beforeClasses,
          after: afterClasses,
        },
        span: createSpan(
          locations,
          codePointIndex,
          rule.textCodePointLength,
        ),
      });
    }

    if (eligible.length === 0) {
      return {
        kind: "no-match",
        location: currentLocation,
        character: currentCharacter,
        codePoint: toCodePoint(currentCharacter),
      };
    }

    const highestPrecedence = Math.min(
      ...eligible.map(({ rule }) => rule.priority),
    );

    const winners = eligible.filter(
      ({ rule }) => rule.priority === highestPrecedence,
    );

    if (winners.length !== 1) {
      const longest = Math.max(
        ...winners.map(
          ({ rule }) => rule.textCodePointLength,
        ),
      );

      const span = createSpan(
        locations,
        codePointIndex,
        longest,
      );

      return {
        kind: "ambiguous",
        span,
        candidateRuleIds: winners.map(
          ({ rule }) => rule.id,
        ),
      };
    }

    const winner = winners[0]!;

    return {
      kind: "match",
      match: {
        ruleId: winner.rule.id,
        lifecycleStatus:
          winner.rule.lifecycleStatus,
        ruleType: winner.rule.ruleType,
        inputKind: winner.rule.inputKind,
        priority: winner.rule.priority,
        matchedText: winner.rule.text,
        span: winner.span,
        tokenClass: winner.rule.tokenClass,
        context: winner.context,
        output: winner.rule.output,
      },
    };
  }
}

/**
 * Creates the Phase 5.3 textual/context rule selector from the canonical
 * runtime specification bundle.
 *
 * The selector intentionally excludes Phase 4 normalization rules and Phase
 * 5.4 structural/mode-state execution.
 */
export function createRuleSelectorForSpecification(
  specification: RuntimeSpecificationBundle,
): RuleSelector {
  const classifier =
    new SpecificationDrivenContextClassifier(
      specification,
    );

  return new SpecificationDrivenRuleSelector(
    specification,
    classifier,
  );
}

export function createRuleSelector(): RuleSelector {
  return createRuleSelectorForSpecification(
    getBundledSpecification(),
  );
}
