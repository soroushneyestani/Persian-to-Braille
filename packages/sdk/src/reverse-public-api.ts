/**
 * Stable consumer-facing reverse-translation contract for
 * @persian-braille/sdk.
 *
 * Phase 13.6 maps the frozen Phase 13.2 SDK contract onto the public
 * platform-agnostic Core reverse translator without exposing Core internals.
 */

export type PersianBrailleReverseDigitFamily =
  | "persian"
  | "ascii"
  | "arabic-indic";

export type PersianBrailleReversePunctuationStyle =
  | "persian"
  | "ascii";

export type PersianBrailleReverseEllipsisStyle =
  | "unicode"
  | "three-dots";

export type PersianBrailleReverseAmbiguityPolicy =
  | "canonicalize"
  | "error";

export interface PersianBrailleReverseTranslationOptions {
  readonly digitFamily?: PersianBrailleReverseDigitFamily;
  readonly punctuationStyle?: PersianBrailleReversePunctuationStyle;
  readonly ellipsisStyle?: PersianBrailleReverseEllipsisStyle;
  readonly ambiguityPolicy?: PersianBrailleReverseAmbiguityPolicy;
}

export interface PersianBrailleReverseProfileInfo {
  readonly id: string;
  readonly version: string;
  readonly status: string;
  readonly direction: "braille-to-print";
}

export interface PersianBrailleReverseUnicodeLocation {
  readonly utf16Offset: number;
  readonly codePointIndex: number;
  readonly codePoint: string;
}

export interface PersianBrailleReverseDiagnostic {
  readonly code:
    | "CANONICALIZED_DIGIT_FAMILY"
    | "CANONICALIZED_PUNCTUATION"
    | "CANONICALIZED_ELLIPSIS"
    | "AMBIGUITY_CANONICALIZED"
    | "LOSSY_LAYOUT_RECONSTRUCTION"
    | "LOSSY_NORMALIZATION_RECONSTRUCTION";
  readonly message: string;
  readonly ruleIds: readonly string[];
}

export type PersianBrailleReverseTranslationFailureCode =
  | "INVALID_BRAILLE_INPUT"
  | "UNKNOWN_BRAILLE_CELL"
  | "UNKNOWN_BRAILLE_SEQUENCE"
  | "AMBIGUOUS_REVERSE_MATCH"
  | "MALFORMED_MODE_SEQUENCE"
  | "UNTERMINATED_LATIN_SPAN"
  | "DANGLING_CAPITAL_INDICATOR"
  | "UNSUPPORTED_REVERSE_STATE";

export interface PersianBrailleReverseTranslationSuccess {
  readonly ok: true;
  readonly input: string;
  readonly profile: PersianBrailleReverseProfileInfo;
  readonly text: string;
  readonly cells: readonly string[];
  readonly diagnostics: readonly PersianBrailleReverseDiagnostic[];
  readonly lossy: boolean;
}

export interface PersianBrailleReverseTranslationFailure {
  readonly ok: false;
  readonly input: string;
  readonly profile: PersianBrailleReverseProfileInfo;
  readonly code: PersianBrailleReverseTranslationFailureCode;
  readonly message: string;
  readonly location?: PersianBrailleReverseUnicodeLocation;
  readonly brailleCharacter?: string;
  readonly candidateRuleIds?: readonly string[];
  readonly candidateTexts?: readonly string[];
  readonly causeCode?: string;
}

export type PersianBrailleReverseTranslationResult =
  | PersianBrailleReverseTranslationSuccess
  | PersianBrailleReverseTranslationFailure;

export interface PersianBrailleReverseTranslator {
  readonly profile: PersianBrailleReverseProfileInfo;

  translateFromBraille(
    input: string,
    options?: PersianBrailleReverseTranslationOptions,
  ): PersianBrailleReverseTranslationResult;

  translateFromBrailleOrThrow(
    input: string,
    options?: PersianBrailleReverseTranslationOptions,
  ): PersianBrailleReverseTranslationSuccess;
}

export type CreatePersianBrailleReverseTranslator = (
  defaultOptions?: PersianBrailleReverseTranslationOptions,
) => PersianBrailleReverseTranslator;
