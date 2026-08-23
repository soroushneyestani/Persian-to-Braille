import type {
  GermanBrailleRuntimeDependency,
  GermanBrailleRuntimeStatus,
  GermanRegionalOverlay,
  GermanTextMode,
} from "@persian-braille/core";

export type GermanBrailleTextMode =
  GermanTextMode;

export type GermanBrailleRegionalOverlay =
  GermanRegionalOverlay;

export interface GermanBrailleTranslationOptions {
  readonly mode: GermanBrailleTextMode;
  readonly regionalOverlay?:
    GermanBrailleRegionalOverlay | null;
}

export type GermanBrailleTranslationFailureCode =
  | "RUNTIME_CONTEXT_REQUIRED"
  | "RUNTIME_EXECUTION_FAILED"
  | "SWISS_EXPLICIT_ESZETT_FORBIDDEN";

export interface GermanBrailleProfileInfo {
  readonly language: "de";
  readonly mode: GermanBrailleTextMode;
  readonly regionalOverlay:
    GermanBrailleRegionalOverlay | null;
  readonly direction: "print-to-braille";
  readonly runtimeStatus:
    GermanBrailleRuntimeStatus;
  readonly runtimeDependency:
    GermanBrailleRuntimeDependency;
  readonly runtimeExecutable: boolean;
  readonly runtimeRegistered: boolean;
  readonly loweringCoverage:
    | "123/123"
    | "SOURCE_FIXTURE_SURFACE";
}

export interface GermanBrailleUnicodeLocation {
  readonly codePointIndex: number;
  readonly utf16Index: number;
}

export interface GermanBrailleTranslationSuccess {
  readonly ok: true;
  readonly input: string;
  readonly profile: GermanBrailleProfileInfo;
  readonly normalizedText: string;
  readonly cells: readonly string[];
  readonly unicodeBraille: string;
  readonly structuralTokens: readonly string[];
}

export interface GermanBrailleTranslationFailure {
  readonly ok: false;
  readonly input: string;
  readonly profile: GermanBrailleProfileInfo;
  readonly code:
    GermanBrailleTranslationFailureCode;
  readonly message: string;
  readonly location?:
    GermanBrailleUnicodeLocation;
}

export type GermanBrailleTranslationResult =
  | GermanBrailleTranslationSuccess
  | GermanBrailleTranslationFailure;

export interface GermanBrailleTranslationErrorData {
  readonly code:
    GermanBrailleTranslationFailureCode;
  readonly result:
    GermanBrailleTranslationFailure;
}

export interface GermanBrailleTranslator {
  readonly profile:
    GermanBrailleProfileInfo;

  translate(
    input: string,
  ): GermanBrailleTranslationResult;

  translateOrThrow(
    input: string,
  ): GermanBrailleTranslationSuccess;
}

export type CreateGermanBrailleTranslator = (
  options: GermanBrailleTranslationOptions,
) => GermanBrailleTranslator;
