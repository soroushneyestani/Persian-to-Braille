import type {
  PersianBrailleTranslationResult,
  PersianBrailleTranslator,
} from "@persian-braille/sdk";

export const WORD_HOST_FAILURE_CODES = Object.freeze({
  officeNotReady: "OFFICE_NOT_READY",
  wrongHost: "WRONG_HOST",
  unsupportedRequirementSet:
    "UNSUPPORTED_REQUIREMENT_SET",
  selectionUnavailable:
    "SELECTION_UNAVAILABLE",
  selectionChanged:
    "SELECTION_CHANGED",
  documentWriteFailed:
    "DOCUMENT_WRITE_FAILED",
} as const);

export type WordHostFailureCode =
  (typeof WORD_HOST_FAILURE_CODES)[
    keyof typeof WORD_HOST_FAILURE_CODES
  ];

export interface WordHostFailure {
  readonly ok: false;
  readonly domain: "host";
  readonly code: WordHostFailureCode;
  readonly message: string;
}

export interface WordSelectionReadSuccess {
  readonly ok: true;
  readonly text: string;
}

export type WordSelectionReadResult =
  | WordSelectionReadSuccess
  | WordHostFailure;

export interface WordMutationSuccess {
  readonly ok: true;
}

export type WordMutationResult =
  | WordMutationSuccess
  | WordHostFailure;

export interface PersianBrailleWordHostAdapter {
  readSelection():
    Promise<WordSelectionReadResult>;

  replaceSelection(
    expectedSourceText: string,
    replacementText: string,
  ): Promise<WordMutationResult>;

  insertAfterSelection(
    expectedSourceText: string,
    insertedText: string,
  ): Promise<WordMutationResult>;
}

export type SdkTranslationSuccess =
  Extract<
    PersianBrailleTranslationResult,
    { readonly ok: true }
  >;

export type SdkTranslationFailure =
  Extract<
    PersianBrailleTranslationResult,
    { readonly ok: false }
  >;

export interface WordSelectionTranslationSuccess {
  readonly ok: true;
  readonly sourceText: string;
  readonly translation:
    SdkTranslationSuccess;
}

export interface EmptySelectionFailure {
  readonly ok: false;
  readonly source: "application";
  readonly code: "EMPTY_SELECTION";
  readonly message:
    "Select text in Word before translating.";
}

export interface HostSelectionTranslationFailure {
  readonly ok: false;
  readonly source: "host";
  readonly failure:
    WordHostFailure;
}

export interface SdkSelectionTranslationFailure {
  readonly ok: false;
  readonly source: "translation";
  readonly sourceText: string;
  readonly translation:
    SdkTranslationFailure;
}

export type WordSelectionTranslationResult =
  | WordSelectionTranslationSuccess
  | EmptySelectionFailure
  | HostSelectionTranslationFailure
  | SdkSelectionTranslationFailure;

export interface PersianBrailleWordSelectionService {
  readonly translator:
    PersianBrailleTranslator;

  translateSelection():
    Promise<WordSelectionTranslationResult>;

  replaceWithBraille(
    preview:
      WordSelectionTranslationSuccess,
  ): Promise<WordMutationResult>;

  insertBrailleAfter(
    preview:
      WordSelectionTranslationSuccess,
  ): Promise<WordMutationResult>;
}
