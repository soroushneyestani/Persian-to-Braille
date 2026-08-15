export {
  WORD_HOST_FAILURE_CODES,
} from "./word/types.js";

export {
  createGlobalOfficeWordRuntime,
  createOfficeWordRuntime,
} from "./word/runtime.js";

export {
  createWordHostAdapter,
} from "./word/adapter.js";

export {
  createWordSelectionService,
} from "./word/selection-service.js";

export type {
  EmptySelectionFailure,
  HostSelectionTranslationFailure,
  PersianBrailleWordHostAdapter,
  PersianBrailleWordSelectionService,
  SdkSelectionTranslationFailure,
  SdkTranslationFailure,
  SdkTranslationSuccess,
  WordHostFailure,
  WordHostFailureCode,
  WordMutationResult,
  WordSelectionReadResult,
  WordSelectionTranslationResult,
  WordSelectionTranslationSuccess,
} from "./word/types.js";

export type {
  OfficeWordGlobals,
  WordMutationLocation,
  WordRuntimeMutationOutcome,
  WordRuntimePort,
} from "./word/runtime.js";
export {
  EXCEL_HOST_FAILURE_CODES,
} from "./excel/types.js";

export {
  createGlobalOfficeExcelRuntime,
  createOfficeExcelRuntime,
} from "./excel/runtime.js";

export {
  createExcelHostAdapter,
} from "./excel/adapter.js";

export {
  createExcelSelectionService,
} from "./excel/selection-service.js";

export type {
  ExcelEmptySelectionFailure,
  ExcelHostFailure,
  ExcelHostFailureCode,
  ExcelHostSelectionTranslationFailure,
  ExcelMutationResult,
  ExcelSdkSelectionTranslationFailure,
  ExcelSelectionReadResult,
  ExcelSelectionSnapshot,
  ExcelSelectionTranslationResult,
  ExcelSelectionTranslationSuccess,
  PersianBrailleExcelHostAdapter,
  PersianBrailleExcelSelectionService,
} from "./excel/types.js";

export type {
  ExcelRuntimeMutationOutcome,
  ExcelRuntimePort,
  OfficeExcelGlobals,
} from "./excel/runtime.js";

export type {
  OfficeApplicationFailure,
  OfficeHostCapabilities,
  OfficeHostFailure,
  OfficeHostKind,
  OfficeHostTranslationFailure,
  OfficeMutationResult,
  OfficeMutationSuccess,
  OfficeSdkTranslationFailure,
  OfficeSdkTranslationFailureResult,
  OfficeSdkTranslationSuccess,
  OfficeSelectionService,
  OfficeSelectionTranslationResult,
  OfficeTranslationPreview,
} from "./shared/types.js";
