import type {
  JsonObject,
  JsonValue,
  RuntimeSpecificationBundle,
} from "./specification.js";
import { getBundledSpecification } from "./specification.js";
import type {
  NormalizationAnnotation,
  NormalizationOutcome,
  NormalizationPolicySnapshot,
  RecognizedFormatControl,
  UnicodeLocation,
  UnicodePreprocessor,
} from "./normalization.js";

const FORMAT_CONTROL_PATTERN = /\p{General_Category=Format}/u;

interface FormatControlRuleView {
  readonly id: string;
  readonly status: string;
  readonly structuralToken?: string;
}

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
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

function toCodePoint(character: string): string {
  const value = character.codePointAt(0);

  if (value === undefined) {
    throw new Error("Cannot derive a code point from an empty character.");
  }

  return `U+${value.toString(16).toUpperCase().padStart(4, "0")}`;
}

function isFormatControl(character: string): boolean {
  return FORMAT_CONTROL_PATTERN.test(character);
}

function createPolicySnapshot(
  specification: RuntimeSpecificationBundle,
): NormalizationPolicySnapshot {
  const normalizationPolicy = readObject(
    specification.profile,
    "normalizationPolicy",
  );

  if (normalizationPolicy === undefined) {
    throw new Error(
      "Invalid canonical specification: profile.normalizationPolicy is required.",
    );
  }

  const unicodeForm = requireString(
    normalizationPolicy,
    "unicodeForm",
    "profile.normalizationPolicy",
  );
  const unknownFormatControls = requireString(
    normalizationPolicy,
    "unknownFormatControls",
    "profile.normalizationPolicy",
  );

  // Phase 4 implements exactly the currently admitted policy. A future
  // specification change must fail closed until the implementation contract
  // is deliberately extended.
  if (unicodeForm !== "none") {
    throw new Error(
      `Unsupported canonical normalization policy: unicodeForm=${unicodeForm}.`,
    );
  }

  if (unknownFormatControls !== "error") {
    throw new Error(
      "Unsupported canonical normalization policy: " +
        `unknownFormatControls=${unknownFormatControls}.`,
    );
  }

  return {
    profileId: specification.profileId,
    profileVersion: specification.profileVersion,
    unicodeForm,
    unknownFormatControls,
  };
}

function createFormatControlIndex(
  specification: RuntimeSpecificationBundle,
): ReadonlyMap<string, readonly FormatControlRuleView[]> {
  const mutable = new Map<string, FormatControlRuleView[]>();

  for (const rule of specification.rules) {
    const input = readObject(rule, "input");
    if (input === undefined) {
      continue;
    }

    const text = readString(input, "text");
    if (text === undefined) {
      continue;
    }

    const characters = Array.from(text);
    if (
      characters.length !== 1 ||
      !isFormatControl(characters[0]!)
    ) {
      continue;
    }

    const id = requireString(rule, "id", "rule");
    const status = requireString(rule, "status", `rule ${id}`);
    const output = readObject(rule, "output");
    const structuralToken =
      output === undefined
        ? undefined
        : readString(output, "structuralToken");

    const entry: FormatControlRuleView =
      structuralToken === undefined
        ? { id, status }
        : { id, status, structuralToken };

    const current = mutable.get(text);
    if (current === undefined) {
      mutable.set(text, [entry]);
    } else {
      current.push(entry);
    }
  }

  return mutable;
}

function createAnnotation(
  character: string,
  location: UnicodeLocation,
  rules: readonly FormatControlRuleView[],
): RecognizedFormatControl {
  const structuralTokens = rules.flatMap((rule) =>
    rule.structuralToken === undefined
      ? []
      : [rule.structuralToken],
  );

  return {
    kind: "recognized-format-control",
    codePoint: toCodePoint(character),
    character,
    location,
    ruleIds: rules.map((rule) => rule.id),
    structuralTokens,
    ruleStatuses: rules.map((rule) => rule.status),
  };
}

class SpecificationDrivenUnicodePreprocessor
  implements UnicodePreprocessor
{
  readonly #policy: NormalizationPolicySnapshot;
  readonly #formatControls: ReadonlyMap<
    string,
    readonly FormatControlRuleView[]
  >;

  constructor(specification: RuntimeSpecificationBundle) {
    this.#policy = createPolicySnapshot(specification);
    this.#formatControls = createFormatControlIndex(specification);
  }

  normalize(inputText: string): NormalizationOutcome {
    const annotations: NormalizationAnnotation[] = [];

    let codePointIndex = 0;
    let utf16Index = 0;

    for (const character of inputText) {
      const location: UnicodeLocation = {
        codePointIndex,
        utf16Index,
      };

      if (isFormatControl(character)) {
        const rules = this.#formatControls.get(character);

        if (rules === undefined || rules.length === 0) {
          return {
            ok: false,
            code: "UNKNOWN_FORMAT_CONTROL",
            message:
              `Unknown Unicode format control ${toCodePoint(character)} ` +
              `at codePointIndex=${codePointIndex}, utf16Index=${utf16Index}.`,
            codePoint: toCodePoint(character),
            character,
            location,
            policy: this.#policy,
          };
        }

        annotations.push(
          createAnnotation(character, location, rules),
        );
      }

      codePointIndex += 1;
      utf16Index += character.length;
    }

    return {
      ok: true,
      inputText,
      outputText: inputText,
      changed: false,
      policy: this.#policy,
      annotations,
    };
  }
}

/**
 * Creates the default Persian Braille Unicode preprocessor from the canonical
 * runtime specification bundle.
 *
 * This factory intentionally fails closed if the canonical profile begins to
 * request a Unicode-normalization policy that Phase 4 has not implemented.
 */
export function createUnicodePreprocessorForSpecification(
  specification: RuntimeSpecificationBundle,
): UnicodePreprocessor {
  return new SpecificationDrivenUnicodePreprocessor(
    specification,
  );
}

export function createUnicodePreprocessor(): UnicodePreprocessor {
  return createUnicodePreprocessorForSpecification(
    getBundledSpecification(),
  );
}
