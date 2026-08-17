import {
  getBundledSpecification,
} from "./specification.js";
import type {
  ReverseAmbiguityPolicy,
  ReverseDiagnostic,
  ReverseDiagnosticCode,
  ReverseDigitFamily,
  ReverseEllipsisStyle,
  ReverseProfileSnapshot,
  ReversePunctuationStyle,
  ReverseTranslationFailure,
  ReverseTranslationFailureCode,
  ReverseTranslationOptions,
  ReverseTranslationOutcome,
  ReverseTranslationSuccess,
  ReverseTranslator,
  ReverseUnicodeLocation,
} from "./reverse-translation.js";

interface Candidate {
  readonly ruleId: string;
  readonly type: string;
  readonly text: string | null;
  readonly tokenClass: string | null;
  readonly cells: readonly string[];
}

interface CellToken {
  readonly kind: "cell";
  readonly character: string;
  readonly cell: string;
  readonly utf16Offset: number;
  readonly codePointIndex: number;
}

interface LayoutToken {
  readonly kind: "layout";
  readonly character: string;
  readonly utf16Offset: number;
  readonly codePointIndex: number;
}

type InputToken =
  | CellToken
  | LayoutToken;

interface ParserState {
  numericMode: boolean;
  numericSawDigit: boolean;
  latinSpan: boolean;
  pendingCapital: boolean;
  readonly delimiterStack: string[];
}

interface ResolvedOptions {
  readonly digitFamily: ReverseDigitFamily;
  readonly punctuationStyle: ReversePunctuationStyle;
  readonly ellipsisStyle: ReverseEllipsisStyle;
  readonly ambiguityPolicy: ReverseAmbiguityPolicy;
}

const PROFILE: ReverseProfileSnapshot = {
  profileId: "fa-ir-g1-reverse",
  profileVersion: "0.1.0",
  profileStatus: "draft",
  direction: "braille-to-print",
};

const DEFAULT_OPTIONS: ResolvedOptions = {
  digitFamily: "persian",
  punctuationStyle: "persian",
  ellipsisStyle: "unicode",
  ambiguityPolicy: "canonicalize",
};

const PERSIAN_PUNCTUATION =
  new Set(["،", "؛", "؟", "٫", "٬", "٪"]);

const ASCII_PUNCTUATION =
  new Set([",", ";", "?", ".", "%"]);

function isObject(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object"
    && value !== null
    && !Array.isArray(value)
  );
}

function readString(
  object: Record<string, unknown>,
  key: string,
): string | null {
  const value = object[key];
  return typeof value === "string"
    ? value
    : null;
}

function readObject(
  object: Record<string, unknown>,
  key: string,
): Record<string, unknown> | null {
  const value = object[key];
  return isObject(value)
    ? value
    : null;
}

function readStringArray(
  object: Record<string, unknown>,
  key: string,
): readonly string[] | null {
  const value = object[key];

  if (
    !Array.isArray(value)
    || !value.every(
      (item) => typeof item === "string",
    )
  ) {
    return null;
  }

  return value;
}

function signature(
  cells: readonly string[],
): string {
  return cells.join(" ");
}

function isLayout(
  character: string,
): boolean {
  return (
    character === " "
    || character === "\t"
    || character === "\n"
    || character === "\r"
  );
}

function brailleCell(
  character: string,
): string {
  const codePoint =
    character.codePointAt(0);

  if (
    codePoint === undefined
    || codePoint < 0x2800
    || codePoint > 0x28ff
  ) {
    throw new Error(
      "Expected Unicode Braille.",
    );
  }

  const bits =
    codePoint - 0x2800;

  if (bits === 0) {
    return "0";
  }

  let result = "";

  for (
    let dot = 1;
    dot <= 8;
    dot += 1
  ) {
    if (
      (bits & (1 << (dot - 1)))
      !== 0
    ) {
      result += String(dot);
    }
  }

  return result;
}

function location(
  token: InputToken,
): ReverseUnicodeLocation {
  const codePoint =
    token.character.codePointAt(0)!;

  return {
    utf16Offset: token.utf16Offset,
    codePointIndex: token.codePointIndex,
    codePoint:
      `U+${codePoint
        .toString(16)
        .toUpperCase()
        .padStart(4, "0")}`,
  };
}

function failure(
  input: string,
  code: ReverseTranslationFailureCode,
  message: string,
  details: {
    readonly token?: InputToken;
    readonly candidateRuleIds?: readonly string[];
    readonly candidateTexts?: readonly string[];
  } = {},
): ReverseTranslationFailure {
  return {
    ok: false,
    input,
    profile: PROFILE,
    code,
    message,
    ...(
      details.token === undefined
        ? {}
        : {
            location:
              location(details.token),
            brailleCharacter:
              details.token.character,
          }
    ),
    ...(
      details.candidateRuleIds === undefined
        ? {}
        : {
            candidateRuleIds:
              details.candidateRuleIds,
          }
    ),
    ...(
      details.candidateTexts === undefined
        ? {}
        : {
            candidateTexts:
              details.candidateTexts,
          }
    ),
  };
}

function tokenize(
  input: string,
):
  | {
      readonly ok: true;
      readonly tokens:
        readonly InputToken[];
      readonly cells:
        readonly string[];
    }
  | {
      readonly ok: false;
      readonly failure:
        ReverseTranslationFailure;
    } {
  const tokens:
    InputToken[] = [];
  const cells:
    string[] = [];

  let utf16Offset = 0;
  let codePointIndex = 0;

  for (const character of input) {
    if (isLayout(character)) {
      tokens.push({
        kind: "layout",
        character,
        utf16Offset,
        codePointIndex,
      });
    } else {
      const codePoint =
        character.codePointAt(0);

      if (
        codePoint === undefined
        || codePoint < 0x2800
        || codePoint > 0x28ff
      ) {
        const token: LayoutToken = {
          kind: "layout",
          character,
          utf16Offset,
          codePointIndex,
        };

        return {
          ok: false,
          failure: failure(
            input,
            "INVALID_BRAILLE_INPUT",
            (
              "Expected Unicode Braille cells "
              + "or literal SPACE/TAB/LF/CR."
            ),
            { token },
          ),
        };
      }

      const cell =
        brailleCell(character);

      tokens.push({
        kind: "cell",
        character,
        cell,
        utf16Offset,
        codePointIndex,
      });

      cells.push(cell);
    }

    utf16Offset +=
      character.length;
    codePointIndex += 1;
  }

  return {
    ok: true,
    tokens,
    cells,
  };
}

function optionsWithDefaults(
  options: ReverseTranslationOptions,
): ResolvedOptions {
  return {
    digitFamily:
      options.digitFamily
      ?? DEFAULT_OPTIONS.digitFamily,
    punctuationStyle:
      options.punctuationStyle
      ?? DEFAULT_OPTIONS.punctuationStyle,
    ellipsisStyle:
      options.ellipsisStyle
      ?? DEFAULT_OPTIONS.ellipsisStyle,
    ambiguityPolicy:
      options.ambiguityPolicy
      ?? DEFAULT_OPTIONS.ambiguityPolicy,
  };
}

function candidateDetails(
  candidates: readonly Candidate[],
): {
  readonly ruleIds: readonly string[];
  readonly texts: readonly string[];
} {
  const sorted =
    [...candidates].sort(
      (left, right) =>
        left.ruleId.localeCompare(
          right.ruleId,
        ),
    );

  return {
    ruleIds:
      sorted.map(
        (candidate) =>
          candidate.ruleId,
      ),
    texts:
      sorted.flatMap(
        (candidate) =>
          candidate.text === null
            ? []
            : [candidate.text],
      ),
  };
}

function diagnosticMessage(
  code: ReverseDiagnosticCode,
): string {
  switch (code) {
    case "CANONICALIZED_DIGIT_FAMILY":
      return (
        "Original print digit family is "
        + "not recoverable from numeric Braille."
      );
    case "CANONICALIZED_PUNCTUATION":
      return (
        "Original print punctuation style is "
        + "not recoverable from this Braille form."
      );
    case "CANONICALIZED_ELLIPSIS":
      return (
        "The shared ellipsis form was rendered "
        + "using the configured canonical style."
      );
    case "AMBIGUITY_CANONICALIZED":
      return "An ambiguous source spelling was canonicalized.";
    case "LOSSY_LAYOUT_RECONSTRUCTION":
      return "Exact source layout provenance is not recoverable.";
    case "LOSSY_NORMALIZATION_RECONSTRUCTION":
      return "Exact normalization provenance is not recoverable.";
  }
}

class SpecificationDrivenReverseTranslator
implements ReverseTranslator {
  private readonly candidatesBySignature:
    ReadonlyMap<
      string,
      readonly Candidate[]
    >;

  private readonly modeCells:
    ReadonlyMap<string, string>;

  private readonly digits:
    ReadonlyMap<
      string,
      ReadonlyMap<
        ReverseDigitFamily,
        Candidate
      >
    >;

  private readonly latin:
    ReadonlyMap<
      string,
      readonly Candidate[]
    >;

  private readonly maxLength:
    number;

  constructor() {
    const specification =
      getBundledSpecification();

    const candidates =
      new Map<string, Candidate[]>();

    const modeCells =
      new Map<string, string>();

    const digits =
      new Map<
        string,
        Map<
          ReverseDigitFamily,
          Candidate
        >
      >();

    const latin =
      new Map<string, Candidate[]>();

    let maxLength = 1;

    for (
      const raw
      of specification.rules
    ) {
      if (!isObject(raw)) {
        continue;
      }

      const ruleId =
        readString(raw, "id");
      const type =
        readString(raw, "type");
      const input =
        readObject(raw, "input");
      const output =
        readObject(raw, "output");

      if (
        ruleId === null
        || type === null
        || input === null
        || output === null
      ) {
        continue;
      }

      const cells =
        readStringArray(
          output,
          "cells",
        );

      if (
        cells === null
        || cells.length === 0
      ) {
        continue;
      }

      const candidate: Candidate = {
        ruleId,
        type,
        text:
          readString(input, "text"),
        tokenClass:
          readString(
            input,
            "tokenClass",
          ),
        cells,
      };

      const key =
        signature(cells);

      const group =
        candidates.get(key)
        ?? [];

      group.push(candidate);
      candidates.set(key, group);

      maxLength =
        Math.max(
          maxLength,
          cells.length,
        );

      if (
        type === "mode"
        && candidate.tokenClass
        !== null
      ) {
        modeCells.set(
          candidate.tokenClass,
          key,
        );
      }

      const family =
        this.digitFamily(
          ruleId,
        );

      if (
        family !== null
        && candidate.text !== null
      ) {
        const familyMap =
          digits.get(key)
          ?? new Map();

        familyMap.set(
          family,
          candidate,
        );
        digits.set(
          key,
          familyMap,
        );
      }

      if (
        ruleId.startsWith(
          "FA-G1-LATIN-",
        )
        && !ruleId.startsWith(
          "FA-G1-LATIN-MODE-",
        )
        && candidate.text !== null
      ) {
        const latinGroup =
          latin.get(key)
          ?? [];

        latinGroup.push(
          candidate,
        );

        latin.set(
          key,
          latinGroup,
        );
      }
    }

    this.candidatesBySignature =
      new Map(
        [...candidates.entries()]
          .map(
            ([key, group]) => [
              key,
              [...group].sort(
                (left, right) =>
                  left.ruleId.localeCompare(
                    right.ruleId,
                  ),
              ),
            ],
          ),
      );

    this.modeCells =
      modeCells;

    this.digits =
      digits;

    this.latin =
      latin;

    this.maxLength =
      maxLength;
  }

  translate(
    inputBraille: string,
    options:
      ReverseTranslationOptions = {},
  ): ReverseTranslationOutcome {
    const tokenized =
      tokenize(inputBraille);

    if (!tokenized.ok) {
      return tokenized.failure;
    }

    const resolved =
      optionsWithDefaults(options);

    const state: ParserState = {
      numericMode: false,
      numericSawDigit: false,
      latinSpan: false,
      pendingCapital: false,
      delimiterStack: [],
    };

    const output:
      string[] = [];

    const diagnostics:
      ReverseDiagnostic[] = [];

    const diagnosticCodes =
      new Set<ReverseDiagnosticCode>();

    let index = 0;

    while (
      index < tokenized.tokens.length
    ) {
      const token =
        tokenized.tokens[index]!;

      if (token.kind === "layout") {
        if (state.pendingCapital) {
          return failure(
            inputBraille,
            "DANGLING_CAPITAL_INDICATOR",
            "Capital indicator reached a layout boundary.",
            { token },
          );
        }

        if (state.latinSpan) {
          return failure(
            inputBraille,
            "UNTERMINATED_LATIN_SPAN",
            "Latin span reached a layout boundary.",
            { token },
          );
        }

        state.numericMode = false;
        state.numericSawDigit = false;

        output.push(
          token.character,
        );
        index += 1;
        continue;
      }

      if (state.numericMode) {
        const digit =
          this.digits
            .get(token.cell)
            ?.get(
              resolved.digitFamily,
            );

        if (digit !== undefined) {
          output.push(
            digit.text!,
          );

          state.numericSawDigit = true;

          this.addDiagnostic(
            diagnostics,
            diagnosticCodes,
            "CANONICALIZED_DIGIT_FAMILY",
            (
              this.candidatesBySignature
                .get(token.cell)
              ?? []
            )
            .filter(
              (candidate) =>
                this.digitFamily(
                  candidate.ruleId,
                ) !== null,
            )
            .map(
              (candidate) =>
                candidate.ruleId,
            ),
          );

          index += 1;
          continue;
        }

        const decimal =
          this.numericDecimal(
            tokenized.tokens,
            index,
            state,
            resolved,
          );

        if (decimal !== null) {
          output.push(
            decimal.text,
          );

          this.addDiagnostic(
            diagnostics,
            diagnosticCodes,
            "CANONICALIZED_PUNCTUATION",
            decimal.ruleIds,
          );

          index += 1;
          continue;
        }

        const fraction =
          this.numericFraction(
            tokenized.tokens,
            index,
            state,
            resolved,
          );

        if (fraction !== null) {
          output.push(
            fraction.text,
          );

          index += 1;
          continue;
        }

        if (!state.numericSawDigit) {
          return failure(
            inputBraille,
            "MALFORMED_MODE_SEQUENCE",
            "Numeric indicator was not followed by a digit.",
            { token },
          );
        }

        state.numericMode = false;
        state.numericSawDigit = false;
        continue;
      }

      if (state.latinSpan) {
        const latinEnd =
          this.modeCells.get(
            "latin-span-end",
          );

        if (
          latinEnd !== undefined
          && token.cell === latinEnd
        ) {
          if (state.pendingCapital) {
            return failure(
              inputBraille,
              "DANGLING_CAPITAL_INDICATOR",
              "Latin span ended with a pending capital indicator.",
              { token },
            );
          }

          state.latinSpan = false;
          index += 1;
          continue;
        }

        const capital =
          this.modeCells.get(
            "latin-capital-indicator",
          );

        if (
          capital !== undefined
          && token.cell === capital
        ) {
          if (state.pendingCapital) {
            return failure(
              inputBraille,
              "MALFORMED_MODE_SEQUENCE",
              "Repeated Latin capital indicator.",
              { token },
            );
          }

          state.pendingCapital = true;
          index += 1;
          continue;
        }

        const latinCandidate =
          this.pickLatin(
            this.latin.get(
              token.cell,
            ) ?? [],
            state.pendingCapital,
          );

        if (latinCandidate === null) {
          return failure(
            inputBraille,
            "UNKNOWN_BRAILLE_CELL",
            "No Latin candidate is admitted for this cell.",
            { token },
          );
        }

        output.push(
          latinCandidate.text!,
        );

        state.pendingCapital = false;
        index += 1;
        continue;
      }

      const numericBeginMatch =
        this.longestMatch(
          tokenized.tokens,
          index,
        );

      const numericBeginCandidate =
        numericBeginMatch
          ?.candidates.find(
            (candidate) =>
              candidate.tokenClass
              === "numeric-begin",
          );

      if (
        numericBeginMatch !== null
        && numericBeginMatch !== undefined
        && numericBeginCandidate !== undefined
        && numericBeginCandidate.text !== null
      ) {
        const next =
          tokenized.tokens[
            index
            + numericBeginMatch.length
          ];

        if (
          next === undefined
          || next.kind !== "cell"
          || this.digits
            .get(next.cell)
            ?.get(
              resolved.digitFamily,
            ) === undefined
        ) {
          return failure(
            inputBraille,
            "MALFORMED_MODE_SEQUENCE",
            "Numeric-begin sequence was not followed by an admitted digit.",
            { token },
          );
        }

        output.push(
          numericBeginCandidate.text,
        );

        state.numericMode = true;
        state.numericSawDigit = false;

        index +=
          numericBeginMatch.length;

        continue;
      }

      const numericIndicator =
        this.modeCells.get(
          "numeric-indicator",
        );

      if (
        numericIndicator !== undefined
        && token.cell
        === numericIndicator
      ) {
        state.numericMode = true;
        state.numericSawDigit = false;
        index += 1;
        continue;
      }

      const latinBegin =
        this.modeCells.get(
          "latin-span-begin",
        );

      if (
        latinBegin !== undefined
        && token.cell === latinBegin
      ) {
        state.latinSpan = true;
        state.pendingCapital = false;
        index += 1;
        continue;
      }

      const match =
        this.longestMatch(
          tokenized.tokens,
          index,
        );

      /*
       * A single dot-6 is the Latin capital indicator, but the canonical
       * ellipsis is the three-cell sequence dot-6 dot-6 dot-6.
       *
       * Outside an active Latin span the capital indicator is not an eligible
       * mode transition. Therefore a valid multi-cell rule must be given
       * longest-match precedence before the dangling-capital failure is
       * considered. This keeps dot-6 context-sensitive rather than globally
       * reserved.
       */
      if (
        match !== null
        && match.length > 1
      ) {
        const resolvedSequence =
          this.resolveCandidates(
            inputBraille,
            match.candidates,
            resolved,
            state,
            token,
            diagnostics,
            diagnosticCodes,
          );

        if (!resolvedSequence.ok) {
          return resolvedSequence.failure;
        }

        output.push(
          resolvedSequence.text,
        );

        index += match.length;
        continue;
      }

      const capital =
        this.modeCells.get(
          "latin-capital-indicator",
        );

      if (
        capital !== undefined
        && token.cell === capital
      ) {
        return failure(
          inputBraille,
          "DANGLING_CAPITAL_INDICATOR",
          "Latin capital indicator appeared outside a Latin span.",
          { token },
        );
      }

      if (match === null) {
        return failure(
          inputBraille,
          "UNKNOWN_BRAILLE_CELL",
          "No admitted forward rule emits this Braille cell.",
          { token },
        );
      }

      const resolvedCandidate =
        this.resolveCandidates(
          inputBraille,
          match.candidates,
          resolved,
          state,
          token,
          diagnostics,
          diagnosticCodes,
        );

      if (!resolvedCandidate.ok) {
        return resolvedCandidate.failure;
      }

      output.push(
        resolvedCandidate.text,
      );

      index += match.length;
    }

    const last =
      tokenized.tokens.at(-1);

    if (state.pendingCapital) {
      return failure(
        inputBraille,
        "DANGLING_CAPITAL_INDICATOR",
        "Input ended with a pending Latin capital indicator.",
        last === undefined
          ? {}
          : { token: last },
      );
    }

    if (state.latinSpan) {
      return failure(
        inputBraille,
        "UNTERMINATED_LATIN_SPAN",
        "Input ended inside an open Latin span.",
        last === undefined
          ? {}
          : { token: last },
      );
    }

    if (
      state.numericMode
      && !state.numericSawDigit
    ) {
      return failure(
        inputBraille,
        "MALFORMED_MODE_SEQUENCE",
        "Input ended immediately after a numeric indicator.",
        last === undefined
          ? {}
          : { token: last },
      );
    }

    const success:
      ReverseTranslationSuccess = {
        ok: true,
        input: inputBraille,
        profile: PROFILE,
        text: output.join(""),
        cells: tokenized.cells,
        diagnostics,
        lossy:
          diagnostics.length > 0,
      };

    return success;
  }

  private digitFamily(
    ruleId: string,
  ): ReverseDigitFamily | null {
    if (
      ruleId.startsWith(
        "FA-G1-DIGIT-PERSIAN-",
      )
    ) {
      return "persian";
    }

    if (
      ruleId.startsWith(
        "FA-G1-DIGIT-ASCII-",
      )
    ) {
      return "ascii";
    }

    if (
      ruleId.startsWith(
        "FA-G1-DIGIT-ARABIC-INDIC-",
      )
    ) {
      return "arabic-indic";
    }

    return null;
  }

  private pickLatin(
    candidates:
      readonly Candidate[],
    uppercase: boolean,
  ): Candidate | null {
    for (const candidate of candidates) {
      const text =
        candidate.text;

      if (
        text === null
        || text.length !== 1
      ) {
        continue;
      }

      const isUpper =
        text >= "A"
        && text <= "Z";

      const isLower =
        text >= "a"
        && text <= "z";

      if (
        uppercase
          ? isUpper
          : isLower
      ) {
        return candidate;
      }
    }

    return null;
  }

  private numericDecimal(
    tokens: readonly InputToken[],
    index: number,
    state: ParserState,
    options: ResolvedOptions,
  ): {
    readonly text: string;
    readonly ruleIds:
      readonly string[];
  } | null {
    if (!state.numericSawDigit) {
      return null;
    }

    const token =
      tokens[index];

    if (
      token === undefined
      || token.kind !== "cell"
    ) {
      return null;
    }

    const candidates =
      (
        this.candidatesBySignature
          .get(token.cell)
        ?? []
      )
      .filter(
        (candidate) =>
          candidate.tokenClass
          === "numeric-decimal-separator",
      );

    if (candidates.length === 0) {
      return null;
    }

    const next =
      tokens[index + 1];

    if (
      next === undefined
      || next.kind !== "cell"
      || this.digits
        .get(next.cell)
        ?.get(
          options.digitFamily,
        ) === undefined
    ) {
      return null;
    }

    const wanted =
      options.punctuationStyle
      === "persian"
        ? "٫"
        : ".";

    const selected =
      candidates.find(
        (candidate) =>
          candidate.text === wanted,
      );

    if (
      selected === undefined
      || selected.text === null
    ) {
      return null;
    }

    return {
      text: selected.text,
      ruleIds:
        candidates.map(
          (candidate) =>
            candidate.ruleId,
        ),
    };
  }

  private numericFraction(
    tokens: readonly InputToken[],
    index: number,
    state: ParserState,
    options: ResolvedOptions,
  ): {
    readonly text: string;
    readonly ruleIds:
      readonly string[];
  } | null {
    if (!state.numericSawDigit) {
      return null;
    }

    const token =
      tokens[index];

    if (
      token === undefined
      || token.kind !== "cell"
    ) {
      return null;
    }

    const candidates =
      (
        this.candidatesBySignature
          .get(token.cell)
        ?? []
      )
      .filter(
        (candidate) =>
          candidate.tokenClass
          === "numeric-fraction-separator",
      );

    if (candidates.length === 0) {
      return null;
    }

    const next =
      tokens[index + 1];

    if (
      next === undefined
      || next.kind !== "cell"
      || this.digits
        .get(next.cell)
        ?.get(
          options.digitFamily,
        ) === undefined
    ) {
      return null;
    }

    const selected =
      candidates.find(
        (candidate) =>
          candidate.text === "/",
      );

    if (
      selected === undefined
      || selected.text === null
    ) {
      return null;
    }

    return {
      text: selected.text,
      ruleIds:
        candidates.map(
          (candidate) =>
            candidate.ruleId,
        ),
    };
  }

  private longestMatch(
    tokens: readonly InputToken[],
    index: number,
  ): {
    readonly length: number;
    readonly candidates:
      readonly Candidate[];
  } | null {
    const available:
      string[] = [];

    for (
      let offset = 0;
      offset < this.maxLength;
      offset += 1
    ) {
      const token =
        tokens[index + offset];

      if (
        token === undefined
        || token.kind !== "cell"
      ) {
        break;
      }

      available.push(
        token.cell,
      );
    }

    for (
      let length = available.length;
      length >= 1;
      length -= 1
    ) {
      const candidates =
        this.candidatesBySignature
          .get(
            signature(
              available.slice(
                0,
                length,
              ),
            ),
          );

      if (
        candidates !== undefined
        && candidates.length > 0
      ) {
        return {
          length,
          candidates,
        };
      }
    }

    return null;
  }

  private resolveCandidates(
    input: string,
    candidates: readonly Candidate[],
    options: ResolvedOptions,
    state: ParserState,
    token: CellToken,
    diagnostics: ReverseDiagnostic[],
    diagnosticCodes:
      Set<ReverseDiagnosticCode>,
  ):
    | {
        readonly ok: true;
        readonly text: string;
      }
    | {
        readonly ok: false;
        readonly failure:
          ReverseTranslationFailure;
      } {
    const texts =
      [
        ...new Set(
          candidates.flatMap(
            (candidate) =>
              candidate.text === null
                ? []
                : [candidate.text],
          ),
        ),
      ];

    if (texts.length === 1) {
      return {
        ok: true,
        text: texts[0]!,
      };
    }

    if (
      texts.includes("…")
      && texts.includes("...")
    ) {
      this.addDiagnostic(
        diagnostics,
        diagnosticCodes,
        "CANONICALIZED_ELLIPSIS",
        candidates.map(
          (candidate) =>
            candidate.ruleId,
        ),
      );

      return {
        ok: true,
        text:
          options.ellipsisStyle
          === "unicode"
            ? "…"
            : "...",
      };
    }

    if (
      texts.includes("(")
      && texts.includes(")")
    ) {
      if (
        state.delimiterStack.at(-1)
        === "("
      ) {
        state.delimiterStack.pop();

        return {
          ok: true,
          text: ")",
        };
      }

      state.delimiterStack.push("(");

      return {
        ok: true,
        text: "(",
      };
    }

    const punctuation =
      this.pickPunctuation(
        texts,
        options.punctuationStyle,
      );

    if (punctuation !== null) {
      if (
        options.ambiguityPolicy
        === "error"
      ) {
        const details =
          candidateDetails(
            candidates,
          );

        return {
          ok: false,
          failure: failure(
            input,
            "AMBIGUOUS_REVERSE_MATCH",
            "Multiple print punctuation forms share this Braille form.",
            {
              token,
              candidateRuleIds:
                details.ruleIds,
              candidateTexts:
                details.texts,
            },
          ),
        };
      }

      this.addDiagnostic(
        diagnostics,
        diagnosticCodes,
        "CANONICALIZED_PUNCTUATION",
        candidates.map(
          (candidate) =>
            candidate.ruleId,
        ),
      );

      return {
        ok: true,
        text: punctuation,
      };
    }

    const details =
      candidateDetails(
        candidates,
      );

    return {
      ok: false,
      failure: failure(
        input,
        "AMBIGUOUS_REVERSE_MATCH",
        "Parser state and configured policy cannot resolve this collision.",
        {
          token,
          candidateRuleIds:
            details.ruleIds,
          candidateTexts:
            details.texts,
        },
      ),
    };
  }

  private pickPunctuation(
    texts: readonly string[],
    style:
      ReversePunctuationStyle,
  ): string | null {
    const set =
      style === "persian"
        ? PERSIAN_PUNCTUATION
        : ASCII_PUNCTUATION;

    for (const text of texts) {
      if (set.has(text)) {
        return text;
      }
    }

    return null;
  }

  private addDiagnostic(
    diagnostics: ReverseDiagnostic[],
    seen: Set<ReverseDiagnosticCode>,
    code: ReverseDiagnosticCode,
    ruleIds: readonly string[],
  ): void {
    if (seen.has(code)) {
      return;
    }

    seen.add(code);

    diagnostics.push({
      code,
      message:
        diagnosticMessage(code),
      ruleIds:
        [...new Set(ruleIds)]
          .sort(),
    });
  }
}

/**
 * Phase 13.4 Core-internal factory.
 * Public Core/SDK exposure is intentionally deferred.
 */
export function createReverseTranslator():
ReverseTranslator {
  return new SpecificationDrivenReverseTranslator();
}
