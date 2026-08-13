/**
 * Stable consumer-facing contract for @persian-braille/sdk.
 *
 * Phase 7.2 defines types only. Runtime behavior is implemented in Phase 7.3.
 * The SDK contract deliberately does not expose Core execution internals.
 */

export type PersianBrailleTranslationFailureCode =
  | "PREPROCESSING_FAILED"
  | "UNKNOWN_CHARACTER"
  | "UNKNOWN_SEQUENCE"
  | "AMBIGUOUS_MATCH"
  | "UNSUPPORTED_ENGINE_STATE";

export interface PersianBrailleUnicodeLocation {
  readonly codePointIndex: number;
  readonly utf16Index: number;
}

export interface PersianBrailleProfileInfo {
  readonly id: string;
  readonly version: string;
  readonly status: string;
  readonly direction: "print-to-braille";
}

export interface PersianBrailleTranslationSuccess {
  readonly ok: true;
  readonly input: string;
  readonly profile: PersianBrailleProfileInfo;
  readonly normalizedText: string;
  readonly cells: readonly string[];
  readonly unicodeBraille: string;
  readonly structuralTokens: readonly string[];
}

export interface PersianBrailleTranslationFailure {
  readonly ok: false;
  readonly input: string;
  readonly profile: PersianBrailleProfileInfo;
  readonly code: PersianBrailleTranslationFailureCode;
  readonly message: string;
  readonly location?: PersianBrailleUnicodeLocation;
  readonly character?: string;
  readonly codePoint?: string;
  readonly candidateRuleIds?: readonly string[];
  readonly causeCode?: string;
}

export type PersianBrailleTranslationResult =
  | PersianBrailleTranslationSuccess
  | PersianBrailleTranslationFailure;

export interface PersianBrailleTranslationErrorData {
  readonly code: PersianBrailleTranslationFailureCode;
  readonly result: PersianBrailleTranslationFailure;
}

export interface PersianBrailleTranslator {
  /**
   * Immutable metadata for the bundled profile used by this translator.
   */
  readonly profile: PersianBrailleProfileInfo;

  /**
   * Translate print text to Persian Braille without throwing for expected
   * translation failures.
   */
  translate(
    input: string,
  ): PersianBrailleTranslationResult;

  /**
   * Translate print text to Persian Braille and throw the SDK translation
   * error for an expected translation failure.
   */
  translateOrThrow(
    input: string,
  ): PersianBrailleTranslationSuccess;
}

/**
 * Runtime factory signature reserved by the Phase 7 public API contract.
 *
 * Phase 7.3 will export a function named `createPersianBrailleTranslator`
 * with this signature.
 */
export type CreatePersianBrailleTranslator = (
) => PersianBrailleTranslator;
