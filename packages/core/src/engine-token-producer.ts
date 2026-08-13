import { createRuleSelector } from "./rule-selector.js";
import type {
  EngineToken,
  EngineTokenProducer,
  EngineTokenProductionRequest,
  RuleMatch,
  UnicodeSpan,
} from "./translation.js";
import type { UnicodeLocation } from "./normalization.js";

const LATIN_RULE_PREFIX = "FA-G1-LATIN-";

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

function pointSpan(
  location: UnicodeLocation,
): UnicodeSpan {
  return {
    start: location,
    end: location,
  };
}

function characterSpan(
  locations: readonly UnicodeLocation[],
  codePointIndex: number,
): UnicodeSpan {
  const start = locations[codePointIndex];
  const end = locations[codePointIndex + 1];

  if (start === undefined || end === undefined) {
    throw new RangeError(
      "Cannot create a character span outside the input text.",
    );
  }

  return { start, end };
}

function textualMatchAt(
  text: string,
  codePointIndex: number,
): RuleMatch | null {
  const outcome =
    createRuleSelector().select(
      text,
      codePointIndex,
    );

  return outcome.kind === "match"
    ? outcome.match
    : null;
}

function isLatinCharacterMatch(
  match: RuleMatch | null,
): boolean {
  return (
    match !== null &&
    match.ruleType === "character" &&
    match.inputKind === "scalar" &&
    Array.from(match.matchedText).length === 1 &&
    match.ruleId.startsWith(LATIN_RULE_PREFIX)
  );
}

function isDigitCharacterMatch(
  match: RuleMatch | null,
): boolean {
  return (
    match !== null &&
    match.ruleType === "character" &&
    match.inputKind === "scalar" &&
    Array.from(match.matchedText).length === 1 &&
    match.ruleId.startsWith("FA-G1-DIGIT-")
  );
}

function isUpperAsciiLatin(
  character: string,
): boolean {
  return (
    character.length === 1 &&
    character >= "A" &&
    character <= "Z"
  );
}

function continuesNumericRun(
  previousMatch: RuleMatch | null,
): boolean {
  if (isDigitCharacterMatch(previousMatch)) {
    return true;
  }

  return (
    previousMatch?.tokenClass === "numeric-begin" ||
    previousMatch?.tokenClass === "numeric-internal" ||
    previousMatch?.tokenClass ===
      "numeric-decimal-separator" ||
    previousMatch?.tokenClass ===
      "numeric-fraction-separator"
  );
}

class SpecificationDrivenEngineTokenProducer
  implements EngineTokenProducer
{
  produce(
    request: EngineTokenProductionRequest,
  ): readonly EngineToken[] {
    const text = request.text;
    const characters = Array.from(text);
    const locations = toLocations(text);
    const selector = createRuleSelector();
    const matches = characters.map(
      (_, codePointIndex) => {
        const outcome = selector.select(
          text,
          codePointIndex,
        );

        return outcome.kind === "match"
          ? outcome.match
          : null;
      },
    );

    const tokens: EngineToken[] = [];

    for (
      let codePointIndex = 0;
      codePointIndex < characters.length;
      codePointIndex += 1
    ) {
      const character =
        characters[codePointIndex]!;
      const currentMatch =
        matches[codePointIndex] ?? null;
      const previousMatch =
        codePointIndex > 0
          ? matches[codePointIndex - 1] ?? null
          : null;
      const nextMatch =
        codePointIndex + 1 < matches.length
          ? matches[codePointIndex + 1] ?? null
          : null;
      const currentLocation =
        locations[codePointIndex]!;
      const nextLocation =
        locations[codePointIndex + 1]!;

      if (
        isDigitCharacterMatch(currentMatch) &&
        !continuesNumericRun(previousMatch)
      ) {
        tokens.push({
          tokenClass: "numeric-indicator",
          span: pointSpan(currentLocation),
        });
      }

      if (!isLatinCharacterMatch(currentMatch)) {
        continue;
      }

      if (!isLatinCharacterMatch(previousMatch)) {
        tokens.push({
          tokenClass: "latin-span-begin",
          span: pointSpan(currentLocation),
        });
      }

      if (isUpperAsciiLatin(character)) {
        tokens.push({
          tokenClass: "latin-capital-indicator",
          span: pointSpan(currentLocation),
        });
      }

      tokens.push({
        tokenClass: "latin-character-class",
        span: characterSpan(
          locations,
          codePointIndex,
        ),
      });

      if (!isLatinCharacterMatch(nextMatch)) {
        tokens.push({
          tokenClass: "latin-span-end",
          span: pointSpan(nextLocation),
        });
      }
    }

    return tokens;
  }
}

/**
 * Produces Phase 5.4 engine-state tokens from admitted runtime rule classes.
 *
 * The current engine mechanics are deliberately narrow:
 * - numeric indicator at the beginning of a run of admitted digit rules;
 * - an admitted numeric begin/internal/decimal/fraction rule keeps the run
 *   open for the following digit;
 * - contiguous admitted ASCII Latin character rules form a Latin span;
 * - each uppercase ASCII Latin character receives a capital indicator.
 *
 * The producer never defines Braille cell values; structural mode rules in
 * the canonical specification own those outputs.
 */
export function createEngineTokenProducer(): EngineTokenProducer {
  return new SpecificationDrivenEngineTokenProducer();
}
