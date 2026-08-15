import type {
  PersianBrailleTranslator,
} from "@persian-braille/sdk";

import type {
  OfficeMutationResult,
  OfficeSdkTranslationFailure,
  OfficeSdkTranslationSuccess,
} from "../shared/types.js";

export const POWERPOINT_HOST_FAILURE_CODES =
  Object.freeze({
    officeNotReady:
      "OFFICE_NOT_READY",
    wrongHost:
      "WRONG_HOST",
    unsupportedRequirementSet:
      "UNSUPPORTED_REQUIREMENT_SET",
    selectionUnavailable:
      "SELECTION_UNAVAILABLE",
    selectionChanged:
      "SELECTION_CHANGED",
    presentationWriteFailed:
      "PRESENTATION_WRITE_FAILED",
  } as const);

export type PowerPointHostFailureCode =
  (typeof POWERPOINT_HOST_FAILURE_CODES)[
    keyof typeof POWERPOINT_HOST_FAILURE_CODES
  ];

export interface PowerPointHostFailure {
  readonly ok: false;
  readonly domain: "host";
  readonly code:
    PowerPointHostFailureCode;
  readonly message:
    string;
}

export interface PowerPointSelectionSnapshot {
  readonly slideId:
    string;
  readonly shapeId:
    string;
  readonly start:
    number;
  readonly length:
    number;
  readonly text:
    string;
}

export interface PowerPointSelectionReadSuccess {
  readonly ok: true;
  readonly text:
    string;
  readonly snapshot:
    PowerPointSelectionSnapshot;
}

export type PowerPointSelectionReadResult =
  | PowerPointSelectionReadSuccess
  | PowerPointHostFailure;

export type PowerPointMutationResult =
  OfficeMutationResult;

export interface PersianBraillePowerPointHostAdapter {
  readSelection():
    Promise<PowerPointSelectionReadResult>;

  replaceSelection(
    expected:
      PowerPointSelectionSnapshot,
    replacementText:
      string,
  ): Promise<PowerPointMutationResult>;
}

export interface PowerPointSelectionTranslationSuccess {
  readonly ok: true;
  readonly sourceText:
    string;
  readonly translation:
    OfficeSdkTranslationSuccess;
  readonly mutationContext:
    PowerPointSelectionSnapshot;
}

export interface PowerPointEmptySelectionFailure {
  readonly ok: false;
  readonly source:
    "application";
  readonly code:
    "EMPTY_SELECTION";
  readonly message:
    "Select non-empty text in PowerPoint before translating.";
}

export interface PowerPointHostSelectionTranslationFailure {
  readonly ok: false;
  readonly source:
    "host";
  readonly failure:
    PowerPointHostFailure;
}

export interface PowerPointSdkSelectionTranslationFailure {
  readonly ok: false;
  readonly source:
    "translation";
  readonly sourceText:
    string;
  readonly translation:
    OfficeSdkTranslationFailure;
}

export type PowerPointSelectionTranslationResult =
  | PowerPointSelectionTranslationSuccess
  | PowerPointEmptySelectionFailure
  | PowerPointHostSelectionTranslationFailure
  | PowerPointSdkSelectionTranslationFailure;

export interface PersianBraillePowerPointSelectionService {
  readonly translator:
    PersianBrailleTranslator;

  translateSelection():
    Promise<PowerPointSelectionTranslationResult>;

  replaceWithBraille(
    preview:
      PowerPointSelectionTranslationSuccess,
  ): Promise<PowerPointMutationResult>;
}
