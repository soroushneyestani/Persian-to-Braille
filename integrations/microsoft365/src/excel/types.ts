import type {
  PersianBrailleTranslator,
} from "@persian-braille/sdk";

import type {
  OfficeMutationResult,
  OfficeSdkTranslationFailure,
  OfficeSdkTranslationSuccess,
} from "../shared/types.js";

export const EXCEL_HOST_FAILURE_CODES =
  Object.freeze({
    officeNotReady:
      "OFFICE_NOT_READY",
    wrongHost:
      "WRONG_HOST",
    unsupportedRequirementSet:
      "UNSUPPORTED_REQUIREMENT_SET",
    selectionUnavailable:
      "SELECTION_UNAVAILABLE",
    selectionShapeUnsupported:
      "SELECTION_SHAPE_UNSUPPORTED",
    selectionContentUnsupported:
      "SELECTION_CONTENT_UNSUPPORTED",
    selectionChanged:
      "SELECTION_CHANGED",
    workbookWriteFailed:
      "WORKBOOK_WRITE_FAILED",
  } as const);

export type ExcelHostFailureCode =
  (typeof EXCEL_HOST_FAILURE_CODES)[
    keyof typeof EXCEL_HOST_FAILURE_CODES
  ];

export interface ExcelHostFailure {
  readonly ok: false;
  readonly domain: "host";
  readonly code:
    ExcelHostFailureCode;
  readonly message:
    string;
}

export interface ExcelSelectionSnapshot {
  readonly address:
    string;
  readonly rowCount:
    number;
  readonly columnCount:
    number;
  readonly valueType:
    string;
  readonly rawValue:
    unknown;
  readonly formulaProjection:
    unknown;
}

export interface ExcelSelectionReadSuccess {
  readonly ok: true;
  readonly text:
    string;
  readonly snapshot:
    ExcelSelectionSnapshot;
}

export type ExcelSelectionReadResult =
  | ExcelSelectionReadSuccess
  | ExcelHostFailure;

export type ExcelMutationResult =
  OfficeMutationResult;

export interface PersianBrailleExcelHostAdapter {
  readSelection():
    Promise<ExcelSelectionReadResult>;

  replaceSelection(
    expected:
      ExcelSelectionSnapshot,
    replacementText:
      string,
  ): Promise<ExcelMutationResult>;
}

export interface ExcelSelectionTranslationSuccess {
  readonly ok: true;
  readonly sourceText:
    string;
  readonly translation:
    OfficeSdkTranslationSuccess;
  readonly mutationContext:
    ExcelSelectionSnapshot;
}

export interface ExcelEmptySelectionFailure {
  readonly ok: false;
  readonly source:
    "application";
  readonly code:
    "EMPTY_SELECTION";
  readonly message:
    "Select a non-empty plain-text cell in Excel before translating.";
}

export interface ExcelHostSelectionTranslationFailure {
  readonly ok: false;
  readonly source:
    "host";
  readonly failure:
    ExcelHostFailure;
}

export interface ExcelSdkSelectionTranslationFailure {
  readonly ok: false;
  readonly source:
    "translation";
  readonly sourceText:
    string;
  readonly translation:
    OfficeSdkTranslationFailure;
}

export type ExcelSelectionTranslationResult =
  | ExcelSelectionTranslationSuccess
  | ExcelEmptySelectionFailure
  | ExcelHostSelectionTranslationFailure
  | ExcelSdkSelectionTranslationFailure;

export interface PersianBrailleExcelSelectionService {
  readonly translator:
    PersianBrailleTranslator;

  translateSelection():
    Promise<ExcelSelectionTranslationResult>;

  replaceWithBraille(
    preview:
      ExcelSelectionTranslationSuccess,
  ): Promise<ExcelMutationResult>;
}
