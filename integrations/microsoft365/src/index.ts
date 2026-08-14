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
