import type {
  JsonObject,
  JsonValue,
  RuntimeSpecificationBundle,
} from "./specification.js";
import { getBundledSpecification } from "./specification.js";
import { createUnicodePreprocessor } from "./unicode-preprocessor.js";
import { createRuleSelector } from "./rule-selector.js";
import { createEngineTokenProducer } from "./engine-token-producer.js";
import { createModeRuleExecutor } from "./mode-rule-executor.js";
import type {
  EngineToken,
  ForwardTranslator,
  RuleMatch,
  TranslationOutcome,
  TranslationProfileSnapshot,
} from "./translation.js";

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

function createProfileSnapshot(
  specification: RuntimeSpecificationBundle,
  normalizationPolicy: TranslationProfileSnapshot["normalizationPolicy"],
): TranslationProfileSnapshot {
  const fallbackPolicy = readObject(
    specification.profile,
    "fallbackPolicy",
  );

  if (fallbackPolicy === undefined) {
    throw new Error(
      "Invalid canonical specification: profile.fallbackPolicy is required.",
    );
  }

  const unknownCharacter = readString(
    fallbackPolicy,
    "unknownCharacter",
  );
  const unknownSequence = readString(
    fallbackPolicy,
    "unknownSequence",
  );
  const direction = readString(
    specification.profile,
    "direction",
  );

  if (
    unknownCharacter !== "error" ||
    unknownSequence !== "error"
  ) {
    throw new Error(
      "Unsupported canonical fallback policy: Phase 5 requires fail-closed error behavior.",
    );
  }

  if (direction === undefined) {
    throw new Error(
      "Invalid canonical specification: profile.direction is required.",
    );
  }

  return {
    profileId: specification.profileId,
    profileVersion:
      specification.profileVersion,
    profileStatus:
      specification.profileStatus,
    direction,
    normalizationPolicy,
    fallbackPolicy: {
      unknownCharacter: "error",
      unknownSequence: "error",
    },
  };
}

function appendMatchOutput(
  match: RuleMatch,
  cells: string[],
  braille: string[],
  structuralTokens: string[],
): void {
  cells.push(...match.output.cells);

  if (match.output.unicodeBraille !== null) {
    braille.push(
      match.output.unicodeBraille,
    );
  }

  if (match.output.structuralToken !== null) {
    structuralTokens.push(
      match.output.structuralToken,
    );
  }
}

function tokenStartIndex(
  token: EngineToken,
): number {
  return token.span.start.codePointIndex;
}

class SpecificationDrivenForwardTranslator
  implements ForwardTranslator
{
  translate(
    inputText: string,
  ): TranslationOutcome {
    const specification =
      getBundledSpecification();
    const preprocessor =
      createUnicodePreprocessor();
    const preprocessing =
      preprocessor.normalize(inputText);

    if (!preprocessing.ok) {
      return {
        ok: false,
        code: "PREPROCESSING_FAILED",
        message:
          `Unicode preprocessing failed: ${preprocessing.message}`,
        inputText,
        cause: preprocessing,
      };
    }

    const profile = createProfileSnapshot(
      specification,
      preprocessing.policy,
    );
    const normalizedText =
      preprocessing.outputText;
    const characters =
      Array.from(normalizedText);
    const selector =
      createRuleSelector();
    const tokenProducer =
      createEngineTokenProducer();
    const modeExecutor =
      createModeRuleExecutor();

    const producedTokens =
      tokenProducer.produce({
        text: normalizedText,
        normalizationAnnotations:
          preprocessing.annotations,
      });

    const tokensByStart =
      new Map<number, EngineToken[]>();

    for (const token of producedTokens) {
      const index =
        tokenStartIndex(token);
      const bucket =
        tokensByStart.get(index) ?? [];
      bucket.push(token);
      tokensByStart.set(index, bucket);
    }

    const cells: string[] = [];
    const braille: string[] = [];
    const structuralTokens: string[] = [];
    const engineTokens: EngineToken[] = [];
    const matches: RuleMatch[] = [];

    for (
      const annotation of
        preprocessing.annotations
    ) {
      structuralTokens.push(
        ...annotation.structuralTokens,
      );
    }

    const executePointTokens = (
      codePointIndex: number,
    ): TranslationOutcome | null => {
      const tokens =
        tokensByStart.get(codePointIndex) ??
        [];

      for (const token of tokens) {
        engineTokens.push(token);

        const modeMatch =
          modeExecutor.execute(token);

        if (modeMatch === null) {
          return {
            ok: false,
            code: "UNSUPPORTED_ENGINE_STATE",
            message:
              `No canonical mode rule consumes engine token ${token.tokenClass}.`,
            inputText,
            detail:
              `Unconsumed engine token ${token.tokenClass}.`,
            location:
              token.span.start,
            profile,
          };
        }

        matches.push(modeMatch);
        appendMatchOutput(
          modeMatch,
          cells,
          braille,
          structuralTokens,
        );
      }

      return null;
    };

    let cursor = 0;

    while (cursor < characters.length) {
      const tokenFailure =
        executePointTokens(cursor);

      if (tokenFailure !== null) {
        return tokenFailure;
      }

      const selection =
        selector.select(
          normalizedText,
          cursor,
        );

      if (selection.kind === "ambiguous") {
        return {
          ok: false,
          code: "AMBIGUOUS_MATCH",
          message:
            "Multiple eligible canonical rules remain at the same precedence.",
          inputText,
          span: selection.span,
          candidateRuleIds:
            selection.candidateRuleIds,
          profile,
        };
      }

      if (selection.kind === "no-match") {
        return {
          ok: false,
          code: "UNKNOWN_CHARACTER",
          message:
            `No admitted canonical rule matches ${selection.codePoint}.`,
          inputText,
          character:
            selection.character,
          codePoint:
            selection.codePoint,
          location:
            selection.location,
          profile,
        };
      }

      const match = selection.match;

      if (match.tokenClass !== null) {
        engineTokens.push({
          tokenClass: match.tokenClass,
          span: match.span,
        });
      }

      matches.push(match);
      appendMatchOutput(
        match,
        cells,
        braille,
        structuralTokens,
      );

      const nextCursor =
        match.span.end.codePointIndex;

      if (nextCursor <= cursor) {
        return {
          ok: false,
          code: "UNSUPPORTED_ENGINE_STATE",
          message:
            "A textual rule did not advance the input cursor.",
          inputText,
          detail:
            `Non-advancing rule ${match.ruleId}.`,
          location:
            match.span.start,
          profile,
        };
      }

      for (
        let skipped = cursor + 1;
        skipped < nextCursor;
        skipped += 1
      ) {
        if (
          (tokensByStart.get(skipped) ??
            []).length > 0
        ) {
          return {
            ok: false,
            code: "UNSUPPORTED_ENGINE_STATE",
            message:
              "A multi-code-point textual rule crossed an engine-state token boundary.",
            inputText,
            detail:
              `Rule ${match.ruleId} skipped token boundary at code-point index ${skipped}.`,
            location:
              match.span.start,
            profile,
          };
        }
      }

      cursor = nextCursor;
    }

    const terminalTokenFailure =
      executePointTokens(
        characters.length,
      );

    if (terminalTokenFailure !== null) {
      return terminalTokenFailure;
    }

    return {
      ok: true,
      inputText,
      normalizedText,
      cells,
      unicodeBraille:
        braille.join(""),
      structuralTokens,
      profile,
      trace: {
        normalizationAnnotations:
          preprocessing.annotations,
        engineTokens,
        matches,
      },
    };
  }
}

export function createForwardTranslator(): ForwardTranslator {
  return new SpecificationDrivenForwardTranslator();
}
