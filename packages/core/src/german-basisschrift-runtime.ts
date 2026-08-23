import {
  GERMAN_BASISSCHRIFT_CONTEXTUAL_BEHAVIORAL_RECORDS,
  GERMAN_BASISSCHRIFT_DIRECT_STRUCTURAL_RECORDS,
  GERMAN_BASISSCHRIFT_INDICATOR_STATE_POLICY_RECORDS,
  GERMAN_BASISSCHRIFT_RUNTIME_SOURCE,
} from "./generated/de-basisschrift.runtime.js";

export type GermanBasisschriftRuntimeMaterializationStatus =
  "MATERIALIZED_NON_EXECUTABLE";

export interface GermanBasisschriftRuntimeMaterialization {
  readonly language: "de";
  readonly mode: "basisschrift";
  readonly direction: "print-to-braille";
  readonly cellSize: 6;
  readonly status:
    GermanBasisschriftRuntimeMaterializationStatus;
  readonly materialized: true;
  readonly executable: false;
  readonly runtimeRegistered: false;
  readonly runtimeConformanceProven: false;
  readonly loweringCoverage: "123/123";
  readonly directStructuralCount: 25;
  readonly indicatorStatePolicyCount: 62;
  readonly contextualBehavioralCount: 36;
  readonly recordCount: 123;
  readonly source:
    typeof GERMAN_BASISSCHRIFT_RUNTIME_SOURCE;
  readonly records: readonly unknown[];
}

const GERMAN_BASISSCHRIFT_RUNTIME_RECORDS:
  readonly unknown[] =
  Object.freeze([
    ...GERMAN_BASISSCHRIFT_DIRECT_STRUCTURAL_RECORDS,
    ...GERMAN_BASISSCHRIFT_INDICATOR_STATE_POLICY_RECORDS,
    ...GERMAN_BASISSCHRIFT_CONTEXTUAL_BEHAVIORAL_RECORDS,
  ]);

export function getGermanBasisschriftRuntimeMaterialization():
  GermanBasisschriftRuntimeMaterialization {
  return Object.freeze({
    language: "de",
    mode: "basisschrift",
    direction: "print-to-braille",
    cellSize: 6,
    status: "MATERIALIZED_NON_EXECUTABLE",
    materialized: true,
    executable: false,
    runtimeRegistered: false,
    runtimeConformanceProven: false,
    loweringCoverage: "123/123",
    directStructuralCount: 25,
    indicatorStatePolicyCount: 62,
    contextualBehavioralCount: 36,
    recordCount: 123,
    source:
      GERMAN_BASISSCHRIFT_RUNTIME_SOURCE,
    records:
      GERMAN_BASISSCHRIFT_RUNTIME_RECORDS,
  });
}

/**
 * Dedicated German Basisschrift executable surface.
 * Source-backed only; ambiguous carriers fail closed.
 */
export type GermanBasisschriftCaseMode = "selective" | "systematic";
export type GermanBasisschriftCaseContext =
  | "lowercase-abbreviation"
  | "mixed-case-sequence"
  | "greek-technical"
  | "non-derivable-case"
  | "internal-capital"
  | "abbreviation-with-point";
export type GermanBasisschriftAccentStrategy = "generic" | "exact";
export type GermanBasisschriftOrdinalStyle = "compact-lowered";
export type GermanBasisschriftNumericColon = "text";

export interface GermanBasisschriftExecutionOptions {
  readonly caseMode?: GermanBasisschriftCaseMode;
  readonly caseContext?: GermanBasisschriftCaseContext;
  readonly accentStrategy?: GermanBasisschriftAccentStrategy;
  readonly foreignLanguage?: string;
  readonly ordinalStyle?: GermanBasisschriftOrdinalStyle;
  readonly numericColon?: GermanBasisschriftNumericColon;
}

export type GermanBasisschriftExecutionFailureCode =
  | "CONTEXT_REQUIRED"
  | "UNSUPPORTED_INPUT";

export interface GermanBasisschriftExecutionLocation {
  readonly codePointIndex: number;
  readonly utf16Index: number;
}

export interface GermanBasisschriftExecutionSuccess {
  readonly ok: true;
  readonly input: string;
  readonly normalizedText: string;
  readonly unicodeBraille: string;
  readonly cells: readonly string[];
  readonly structuralTokens: readonly string[];
  readonly runtime: {
    readonly language: "de";
    readonly mode: "basisschrift";
    readonly executable: true;
    readonly runtimeRegistered: false;
    readonly conformanceScope:
      "ADMITTED_SOURCE_BACKED_BASISSCHRIFT_SURFACE";
  };
}

export interface GermanBasisschriftExecutionFailure {
  readonly ok: false;
  readonly input: string;
  readonly normalizedText: string;
  readonly code: GermanBasisschriftExecutionFailureCode;
  readonly message: string;
  readonly location: GermanBasisschriftExecutionLocation;
}

export type GermanBasisschriftExecutionResult =
  | GermanBasisschriftExecutionSuccess
  | GermanBasisschriftExecutionFailure;

const D = {"accentExactMap":{"es\u0000ñ":"⠈⠻","fr\u0000è":"⠈⠮","fr\u0000î":"⠈⠩","sv\u0000Å":"⠈⠡"},"currency":{"$":"⠈⠎","¢":"⠈⠉","£":"⠈⠇","€":"⠈⠑"},"digitMap":{"0":"⠚","1":"⠁","2":"⠃","3":"⠉","4":"⠙","5":"⠑","6":"⠋","7":"⠛","8":"⠓","9":"⠊"},"directMap":{"!":"⠖","(":"⠶","()":"⠶",")":"⠶",",":"⠂",".":"⠄",":":"⠒",";":"⠆","?":"⠢","a":"⠁","b":"⠃","c":"⠉","d":"⠙","e":"⠑","f":"⠋","g":"⠛","h":"⠓","i":"⠊","j":"⠚","k":"⠅","l":"⠇","m":"⠍","n":"⠝","o":"⠕","p":"⠏","q":"⠟","r":"⠗","s":"⠎","t":"⠞","u":"⠥","v":"⠧","w":"⠺","x":"⠭","y":"⠽","z":"⠵","§":"⠬","ß":"⠮","ä":"⠜","ö":"⠪","ü":"⠳","–":"⠤","‚":"⠠","“":"⠴","„":"⠦"},"letterMap":{"a":"⠁","b":"⠃","c":"⠉","d":"⠙","e":"⠑","f":"⠋","g":"⠛","h":"⠓","i":"⠊","j":"⠚","k":"⠅","l":"⠇","m":"⠍","n":"⠝","o":"⠕","p":"⠏","q":"⠟","r":"⠗","s":"⠎","t":"⠞","u":"⠥","v":"⠧","w":"⠺","x":"⠭","y":"⠽","z":"⠵","ß":"⠮","ä":"⠜","ö":"⠪","ü":"⠳"},"loweredDigitMap":{"0":"⠴","1":"⠂","2":"⠆","3":"⠒","4":"⠲","5":"⠢","6":"⠖","7":"⠶","8":"⠦","9":"⠔"},"markers":{"announcement":"⠈","brailleBlank":"⠀","capitalSequence":"⠘","dash":"⠤","decimalComma":"⠂","decimalPoint":"⠄","greek":"⠰","initialCapital":"⠨","lowercase":"⠠","number":"⠼","omega":"⠺","plus":"⠖","textAnnouncement":"⠠"}} as const;
const DIRECT: Readonly<Record<string, string>> = D.directMap;
const LETTER: Readonly<Record<string, string>> = D.letterMap;
const DIGIT: Readonly<Record<string, string>> = D.digitMap;
const LOWERED: Readonly<Record<string, string>> = D.loweredDigitMap;
const ACCENT_EXACT: Readonly<Record<string, string>> = D.accentExactMap;
const M = D.markers;
const CURRENCY: Readonly<Record<string, string>> = D.currency;

function lowerDe(ch: string): string {
  return ch.toLocaleLowerCase("de-DE");
}

function isLetter(ch: string): boolean {
  return Object.prototype.hasOwnProperty.call(LETTER, lowerDe(ch));
}

function isUpper(ch: string): boolean {
  if (!isLetter(ch)) return false;
  const lower = lowerDe(ch);
  return ch !== lower && ch === ch.toLocaleUpperCase("de-DE");
}

function isDigit(ch: string): boolean {
  return /^[0-9]$/.test(ch);
}

function loc(text: string, cp: number): GermanBasisschriftExecutionLocation {
  return Object.freeze({
    codePointIndex: cp,
    utf16Index: Array.from(text).slice(0, cp).join("").length,
  });
}

function bad(
  input: string,
  normalizedText: string,
  cp: number,
  code: GermanBasisschriftExecutionFailureCode,
  message: string,
): GermanBasisschriftExecutionFailure {
  return Object.freeze({
    ok: false,
    input,
    normalizedText,
    code,
    message,
    location: loc(normalizedText, cp),
  });
}

function lowerWord(word: string): string | null {
  let out = "";
  for (const ch of Array.from(word)) {
    const cell = LETTER[lowerDe(ch)];
    if (cell === undefined) return null;
    out += cell;
  }
  return out;
}

function explicitWord(word: string): string | null {
  const chars = Array.from(word);
  if (chars.length === 0) return "";

  const upper = chars.map(isUpper);
  if (upper.every((v) => !v)) {
    const body = lowerWord(word);
    return body === null ? null : M.lowercase + body;
  }
  if (upper.every(Boolean)) {
    const body = lowerWord(word);
    return body === null ? null : M.capitalSequence + body;
  }

  let out = "";
  let i = 0;

  if (!upper[0]) out += M.lowercase;

  while (i < chars.length) {
    if (!upper[i]) {
      const cell = LETTER[lowerDe(chars[i]!)];
      if (cell === undefined) return null;
      out += cell;
      i += 1;
      continue;
    }

    let end = i + 1;
    while (end < chars.length && upper[end]) end += 1;

    const followedByLower =
      end < chars.length && !upper[end];

    if (end - i === 1 && followedByLower) {
      const cell = LETTER[lowerDe(chars[i]!)];
      if (cell === undefined) return null;
      out += M.initialCapital + cell;
      i += 1;
      continue;
    }

    out += M.capitalSequence;
    while (i < end) {
      const cell = LETTER[lowerDe(chars[i]!)];
      if (cell === undefined) return null;
      out += cell;
      i += 1;
    }
  }

  return out;
}

function genericAccentBase(ch: string): string | null {
  const first = Array.from(ch.normalize("NFD"))[0];
  if (first === undefined) return null;
  const base = lowerDe(first);
  return LETTER[base] === undefined ? null : base;
}

function abbreviationWithPoint(input: string): string | null {
  const chars = Array.from(input);
  let out = "";
  let i = 0;

  while (i < chars.length) {
    const ch = chars[i]!;

    if (/\s/u.test(ch)) {
      const prev = i > 0 ? chars[i - 1] : undefined;
      let next = i + 1;
      while (next < chars.length && /\s/u.test(chars[next]!)) next += 1;

      if (
        prev === "."
        && next < chars.length
        && isLetter(chars[next]!)
      ) {
        i = next;
        continue;
      }

      out += M.brailleBlank;
      i += 1;
      continue;
    }

    if (isLetter(ch)) {
      const cell = LETTER[lowerDe(ch)];
      if (cell === undefined) return null;
      out += cell;
      i += 1;
      continue;
    }

    const cell = DIRECT[ch];
    if (cell === undefined) return null;
    out += cell;
    i += 1;
  }

  return out;
}

function greekTechnical(input: string): string | null {
  const chars = Array.from(input);
  let out = "";
  let lowerMarked = false;

  for (const ch of chars) {
    if (isLetter(ch)) {
      if (!lowerMarked) {
        out += M.lowercase;
        lowerMarked = true;
      }
      const cell = LETTER[lowerDe(ch)];
      if (cell === undefined) return null;
      out += cell;
      continue;
    }

    if (ch === "Ω") {
      out += M.greek + M.capitalSequence + M.omega;
      continue;
    }

    return null;
  }

  return out;
}

interface NumericEmission {
  readonly output: string;
  readonly consumed: number;
  readonly tokens: readonly string[];
}

function numeric(
  chars: readonly string[],
  start: number,
  options: GermanBasisschriftExecutionOptions,
): NumericEmission | GermanBasisschriftExecutionFailureCode {
  const rest = chars.slice(start).join("");

  const fraction = /^([0-9]+)\/([0-9]+)/.exec(rest);
  if (fraction !== null) {
    const numerator =
      Array.from(fraction[1]!).map((d) => DIGIT[d]!).join("");
    const denominator =
      Array.from(fraction[2]!).map((d) => LOWERED[d]!).join("");
    return {
      output: M.number + numerator + denominator,
      consumed: Array.from(fraction[0]!).length,
      tokens: ["NUMBER:BEGIN", "NUMBER:FRACTION"],
    };
  }

  const ordinal = /^([0-9]+)\./.exec(rest);
  if (ordinal !== null && options.ordinalStyle === "compact-lowered") {
    return {
      output:
        M.number
        + Array.from(ordinal[1]!).map((d) => LOWERED[d]!).join(""),
      consumed: Array.from(ordinal[0]!).length,
      tokens: ["NUMBER:BEGIN", "NUMBER:ORDINAL_COMPACT"],
    };
  }

  let out = M.number;
  let i = start;
  const tokens: string[] = ["NUMBER:BEGIN"];

  while (i < chars.length) {
    let read = 0;
    while (i + read < chars.length && isDigit(chars[i + read]!)) {
      out += DIGIT[chars[i + read]!]!;
      read += 1;
    }
    if (read === 0) break;
    i += read;

    if (i >= chars.length) break;

    const sep = chars[i]!;
    const next = i + 1 < chars.length ? chars[i + 1]! : undefined;

    if ((sep === "," || sep === ".") && next !== undefined && isDigit(next)) {
      out += sep === "," ? M.decimalComma : M.decimalPoint;
      tokens.push(sep === "," ? "NUMBER:DECIMAL_COMMA" : "NUMBER:DECIMAL_POINT");
      i += 1;
      continue;
    }

    if (sep === "-" && next !== undefined && isDigit(next)) {
      out += M.dash + M.number;
      tokens.push("NUMBER:HYPHEN_RESET");
      i += 1;
      continue;
    }

    if (sep === ":" && next !== undefined && isDigit(next)) {
      if (options.numericColon !== "text") return "CONTEXT_REQUIRED";
      const colon = DIRECT[":"];
      if (colon === undefined) return "UNSUPPORTED_INPUT";
      out += M.textAnnouncement + colon + M.number;
      tokens.push("NUMBER:TEXT_COLON_RESET");
      i += 1;
      continue;
    }

    break;
  }

  return {
    output: out,
    consumed: i - start,
    tokens,
  };
}

export function translateGermanBasisschrift(
  input: string,
  options: GermanBasisschriftExecutionOptions = {},
): GermanBasisschriftExecutionResult {
  const normalizedText = input.normalize("NFC");

  if (options.caseContext === "abbreviation-with-point") {
    const out = abbreviationWithPoint(normalizedText);
    if (out === null) {
      return bad(input, normalizedText, 0, "UNSUPPORTED_INPUT",
        "Unsupported abbreviation-with-point carrier.");
    }
    return Object.freeze({
      ok: true,
      input,
      normalizedText,
      unicodeBraille: out,
      cells: Object.freeze(Array.from(out)),
      structuralTokens: Object.freeze(["CASE:ABBREVIATION_WITH_POINT"]),
      runtime: Object.freeze({
        language: "de",
        mode: "basisschrift",
        executable: true,
        runtimeRegistered: false,
        conformanceScope: "ADMITTED_SOURCE_BACKED_BASISSCHRIFT_SURFACE",
      }),
    });
  }

  if (options.caseContext === "greek-technical") {
    const out = greekTechnical(normalizedText);
    if (out === null) {
      return bad(input, normalizedText, 0, "CONTEXT_REQUIRED",
        "Greek carrier is outside the source-backed admitted exemplar.");
    }
    return Object.freeze({
      ok: true,
      input,
      normalizedText,
      unicodeBraille: out,
      cells: Object.freeze(Array.from(out)),
      structuralTokens: Object.freeze(["CASE:GREEK_TECHNICAL"]),
      runtime: Object.freeze({
        language: "de",
        mode: "basisschrift",
        executable: true,
        runtimeRegistered: false,
        conformanceScope: "ADMITTED_SOURCE_BACKED_BASISSCHRIFT_SURFACE",
      }),
    });
  }

  const chars = Array.from(normalizedText);
  const chunks: string[] = [];
  const tokens: string[] = [];
  let i = 0;

  while (i < chars.length) {
    const ch = chars[i]!;

    if (ch === "\r") {
      i += 1;
      continue;
    }
    if (ch === "\n") {
      chunks.push("\n");
      tokens.push("LAYOUT:LINE_BREAK");
      i += 1;
      continue;
    }
    if (/\s/u.test(ch)) {
      chunks.push(M.brailleBlank);
      tokens.push("LAYOUT:BRAILLE_BLANK");
      i += 1;
      continue;
    }

    if (isDigit(ch)) {
      const emitted = numeric(chars, i, options);
      if (typeof emitted === "string") {
        return bad(
          input,
          normalizedText,
          i,
          emitted,
          emitted === "CONTEXT_REQUIRED"
            ? "Numeric punctuation requires explicit context."
            : "Numeric carrier is unsupported.",
        );
      }
      chunks.push(emitted.output);
      tokens.push(...emitted.tokens);
      i += emitted.consumed;
      continue;
    }

    const currency = CURRENCY[ch];
    if (currency !== undefined) {
      chunks.push(currency);
      tokens.push("SPECIAL:CURRENCY");
      i += 1;
      continue;
    }

    if (ch === "+") {
      let end = i;
      while (end < chars.length && chars[end] === "+") end += 1;
      chunks.push(M.announcement + M.plus.repeat(end - i));
      tokens.push("MATH:PLUS_RUN");
      i = end;
      continue;
    }

    if (
      ch === "-"
      && i > 0
      && i + 1 < chars.length
      && isLetter(chars[i - 1]!)
      && isLetter(chars[i + 1]!)
    ) {
      chunks.push(M.dash);
      tokens.push("STROKE:HYPHENATED_WORD");
      i += 1;
      continue;
    }

    if (isLetter(ch)) {
      let end = i + 1;
      while (end < chars.length && isLetter(chars[end]!)) end += 1;
      const word = chars.slice(i, end).join("");
      const flags = Array.from(word).map(isUpper);
      const hasUpper = flags.some(Boolean);
      const hasLower = flags.some((v) => !v);

      let rendered: string | null;

      if (options.caseContext === "lowercase-abbreviation") {
        const body = lowerWord(word);
        rendered = body === null ? null : M.lowercase + body;
        tokens.push("CASE:LOWERCASE_ABBREVIATION");
      } else if (
        options.caseMode === "systematic"
        || options.caseContext === "mixed-case-sequence"
        || options.caseContext === "non-derivable-case"
        || options.caseContext === "internal-capital"
      ) {
        rendered = explicitWord(word);
        tokens.push("CASE:EXPLICIT");
      } else {
        if (hasUpper && !hasLower) {
          return bad(input, normalizedText, i, "CONTEXT_REQUIRED",
            "All-uppercase input requires explicit case semantics.");
        }
        if (hasUpper && hasLower && !isUpper(Array.from(word)[0]!)) {
          return bad(input, normalizedText, i, "CONTEXT_REQUIRED",
            "Internal capitalization requires explicit case context.");
        }
        rendered = lowerWord(word);
        tokens.push("CASE:SELECTIVE_IMPLICIT");
      }

      if (rendered === null) {
        return bad(input, normalizedText, i, "UNSUPPORTED_INPUT",
          "German letter carrier could not be serialized.");
      }

      chunks.push(rendered);
      i = end;
      continue;
    }

    const direct = DIRECT[ch];
    if (direct !== undefined) {
      chunks.push(direct);
      tokens.push("DIRECT:PRINT_SYMBOL");
      i += 1;
      continue;
    }

    const base = genericAccentBase(ch);
    if (base !== null) {
      if (options.accentStrategy === undefined) {
        return bad(input, normalizedText, i, "CONTEXT_REQUIRED",
          "Accented letter requires generic or exact strategy.");
      }

      if (options.accentStrategy === "generic") {
        const baseCell = LETTER[base];
        if (baseCell === undefined) {
          return bad(input, normalizedText, i, "UNSUPPORTED_INPUT",
            "Generic accent base cell is unavailable.");
        }
        chunks.push(M.announcement + baseCell);
        tokens.push("ACCENT:GENERIC");
        i += 1;
        continue;
      }

      if (options.foreignLanguage === undefined) {
        return bad(input, normalizedText, i, "CONTEXT_REQUIRED",
          "Exact accent strategy requires foreignLanguage.");
      }

      const exact =
        ACCENT_EXACT[options.foreignLanguage + "\u0000" + ch];

      if (exact === undefined) {
        return bad(input, normalizedText, i, "CONTEXT_REQUIRED",
          "No exact source-backed accent mapping exists for this language/input.");
      }

      chunks.push(exact);
      tokens.push("ACCENT:EXACT");
      i += 1;
      continue;
    }

    return bad(input, normalizedText, i, "UNSUPPORTED_INPUT",
      "Input carrier is outside the admitted Basisschrift executable surface.");
  }

  const unicodeBraille = chunks.join("");

  return Object.freeze({
    ok: true,
    input,
    normalizedText,
    unicodeBraille,
    cells: Object.freeze(Array.from(unicodeBraille)),
    structuralTokens: Object.freeze(tokens.slice()),
    runtime: Object.freeze({
      language: "de",
      mode: "basisschrift",
      executable: true,
      runtimeRegistered: false,
      conformanceScope: "ADMITTED_SOURCE_BACKED_BASISSCHRIFT_SURFACE",
    }),
  });
}
