/**
 * Public Core reverse translation contracts.
 *
 * The frozen Phase 13.5c-3c2 Core root boundary explicitly re-exports
 * these types from @persian-braille/core.
 */

export type ReverseDigitFamily =
  | "persian"
  | "ascii"
  | "arabic-indic";

export type ReversePunctuationStyle =
  | "persian"
  | "ascii";

export type ReverseEllipsisStyle =
  | "unicode"
  | "three-dots";

export type ReverseAmbiguityPolicy =
  | "canonicalize"
  | "error";

export interface ReverseTranslationOptions {
  readonly digitFamily?: ReverseDigitFamily;
  readonly punctuationStyle?: ReversePunctuationStyle;
  readonly ellipsisStyle?: ReverseEllipsisStyle;
  readonly ambiguityPolicy?: ReverseAmbiguityPolicy;
}

export type ReverseDiagnosticCode =
  | "CANONICALIZED_DIGIT_FAMILY"
  | "CANONICALIZED_PUNCTUATION"
  | "CANONICALIZED_ELLIPSIS"
  | "AMBIGUITY_CANONICALIZED"
  | "LOSSY_LAYOUT_RECONSTRUCTION"
  | "LOSSY_NORMALIZATION_RECONSTRUCTION";

export interface ReverseDiagnostic {
  readonly code: ReverseDiagnosticCode;
  readonly message: string;
  readonly ruleIds: readonly string[];
}

export interface ReverseProfileSnapshot {
  readonly profileId: "fa-ir-g1-reverse";
  readonly profileVersion: "0.1.0";
  readonly profileStatus: "draft";
  readonly direction: "braille-to-print";
}

export interface ReverseUnicodeLocation {
  readonly utf16Offset: number;
  readonly codePointIndex: number;
  readonly codePoint: string;
}

export type ReverseTranslationFailureCode =
  | "INVALID_BRAILLE_INPUT"
  | "UNKNOWN_BRAILLE_CELL"
  | "UNKNOWN_BRAILLE_SEQUENCE"
  | "AMBIGUOUS_REVERSE_MATCH"
  | "MALFORMED_MODE_SEQUENCE"
  | "UNTERMINATED_LATIN_SPAN"
  | "DANGLING_CAPITAL_INDICATOR"
  | "UNSUPPORTED_REVERSE_STATE";

export interface ReverseTranslationSuccess {
  readonly ok: true;
  readonly input: string;
  readonly profile: ReverseProfileSnapshot;
  readonly text: string;
  readonly cells: readonly string[];
  readonly diagnostics: readonly ReverseDiagnostic[];
  readonly lossy: boolean;
}

export interface ReverseTranslationFailure {
  readonly ok: false;
  readonly input: string;
  readonly profile: ReverseProfileSnapshot;
  readonly code: ReverseTranslationFailureCode;
  readonly message: string;
  readonly location?: ReverseUnicodeLocation;
  readonly brailleCharacter?: string;
  readonly candidateRuleIds?: readonly string[];
  readonly candidateTexts?: readonly string[];
  readonly causeCode?: string;
}

export type ReverseTranslationOutcome =
  | ReverseTranslationSuccess
  | ReverseTranslationFailure;

export interface ReverseTranslator {
  translate(
    inputBraille: string,
    options?: ReverseTranslationOptions,
  ): ReverseTranslationOutcome;
}
