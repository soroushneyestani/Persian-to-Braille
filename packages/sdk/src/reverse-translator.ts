import {
  createReverseTranslator,
  type ReverseDiagnostic,
  type ReverseProfileSnapshot,
  type ReverseTranslationFailure,
  type ReverseTranslationOptions,
  type ReverseTranslationSuccess,
} from "@persian-braille/core";

import type {
  PersianBrailleReverseDiagnostic,
  PersianBrailleReverseProfileInfo,
  PersianBrailleReverseTranslationFailure,
  PersianBrailleReverseTranslationOptions,
  PersianBrailleReverseTranslationResult,
  PersianBrailleReverseTranslationSuccess,
  PersianBrailleReverseTranslator,
  PersianBrailleReverseUnicodeLocation,
} from "./reverse-public-api.js";

const REVERSE_PROFILE:
PersianBrailleReverseProfileInfo =
  Object.freeze({
    id: "fa-ir-g1-reverse",
    version: "0.1.0",
    status: "draft",
    direction: "braille-to-print",
  });

function freezeStrings(
  values: readonly string[],
): readonly string[] {
  return Object.freeze([...values]);
}

function projectProfile(
  profile: ReverseProfileSnapshot,
): PersianBrailleReverseProfileInfo {
  return Object.freeze({
    id: profile.profileId,
    version: profile.profileVersion,
    status: profile.profileStatus,
    direction: profile.direction,
  });
}

function projectLocation(
  location:
    | ReverseTranslationFailure["location"]
    | undefined,
): PersianBrailleReverseUnicodeLocation | undefined {
  if (location === undefined) {
    return undefined;
  }

  return Object.freeze({
    utf16Offset: location.utf16Offset,
    codePointIndex: location.codePointIndex,
    codePoint: location.codePoint,
  });
}

function projectDiagnostic(
  diagnostic: ReverseDiagnostic,
): PersianBrailleReverseDiagnostic {
  return Object.freeze({
    code: diagnostic.code,
    message: diagnostic.message,
    ruleIds:
      freezeStrings(
        diagnostic.ruleIds,
      ),
  });
}

function projectDiagnostics(
  diagnostics: readonly ReverseDiagnostic[],
): readonly PersianBrailleReverseDiagnostic[] {
  return Object.freeze(
    diagnostics.map(
      projectDiagnostic,
    ),
  );
}

function projectSuccess(
  input: string,
  outcome: ReverseTranslationSuccess,
): PersianBrailleReverseTranslationSuccess {
  return Object.freeze({
    ok: true,
    input,
    profile:
      projectProfile(
        outcome.profile,
      ),
    text: outcome.text,
    cells:
      freezeStrings(
        outcome.cells,
      ),
    diagnostics:
      projectDiagnostics(
        outcome.diagnostics,
      ),
    lossy: outcome.lossy,
  });
}

function projectFailure(
  input: string,
  outcome: ReverseTranslationFailure,
): PersianBrailleReverseTranslationFailure {
  const failure: {
    ok: false;
    input: string;
    profile: PersianBrailleReverseProfileInfo;
    code: PersianBrailleReverseTranslationFailure["code"];
    message: string;
    location?: PersianBrailleReverseUnicodeLocation;
    brailleCharacter?: string;
    candidateRuleIds?: readonly string[];
    candidateTexts?: readonly string[];
    causeCode?: string;
  } = {
    ok: false,
    input,
    profile:
      projectProfile(
        outcome.profile,
      ),
    code: outcome.code,
    message: outcome.message,
  };

  const location =
    projectLocation(
      outcome.location,
    );

  if (location !== undefined) {
    failure.location = location;
  }

  if (
    outcome.brailleCharacter
    !== undefined
  ) {
    failure.brailleCharacter =
      outcome.brailleCharacter;
  }

  if (
    outcome.candidateRuleIds
    !== undefined
  ) {
    failure.candidateRuleIds =
      freezeStrings(
        outcome.candidateRuleIds,
      );
  }

  if (
    outcome.candidateTexts
    !== undefined
  ) {
    failure.candidateTexts =
      freezeStrings(
        outcome.candidateTexts,
      );
  }

  if (
    outcome.causeCode
    !== undefined
  ) {
    failure.causeCode =
      outcome.causeCode;
  }

  return Object.freeze(
    failure,
  );
}

function mergeOptions(
  defaults:
    Readonly<PersianBrailleReverseTranslationOptions>,
  overrides:
    PersianBrailleReverseTranslationOptions | undefined,
): ReverseTranslationOptions {
  return {
    ...defaults,
    ...overrides,
  };
}

export class PersianBrailleReverseTranslationError
  extends Error {
  readonly code:
    PersianBrailleReverseTranslationFailure["code"];

  readonly result:
    PersianBrailleReverseTranslationFailure;

  constructor(
    result:
      PersianBrailleReverseTranslationFailure,
  ) {
    super(result.message);

    this.name =
      "PersianBrailleReverseTranslationError";
    this.code = result.code;
    this.result = result;

    Object.freeze(this);
  }
}

class CoreBackedPersianBrailleReverseTranslator
  implements PersianBrailleReverseTranslator {
  readonly profile:
    PersianBrailleReverseProfileInfo;

  readonly #coreTranslator =
    createReverseTranslator();

  readonly #defaultOptions:
    Readonly<PersianBrailleReverseTranslationOptions>;

  constructor(
    defaultOptions:
      PersianBrailleReverseTranslationOptions = {},
  ) {
    this.profile =
      REVERSE_PROFILE;

    this.#defaultOptions =
      Object.freeze({
        ...defaultOptions,
      });
  }

  translateFromBraille(
    input: string,
    options?:
      PersianBrailleReverseTranslationOptions,
  ): PersianBrailleReverseTranslationResult {
    const outcome =
      this.#coreTranslator.translate(
        input,
        mergeOptions(
          this.#defaultOptions,
          options,
        ),
      );

    if (outcome.ok) {
      return projectSuccess(
        input,
        outcome,
      );
    }

    return projectFailure(
      input,
      outcome,
    );
  }

  translateFromBrailleOrThrow(
    input: string,
    options?:
      PersianBrailleReverseTranslationOptions,
  ): PersianBrailleReverseTranslationSuccess {
    const result =
      this.translateFromBraille(
        input,
        options,
      );

    if (!result.ok) {
      throw new PersianBrailleReverseTranslationError(
        result,
      );
    }

    return result;
  }
}

export function createPersianBrailleReverseTranslator(
  defaultOptions:
    PersianBrailleReverseTranslationOptions = {},
): PersianBrailleReverseTranslator {
  return new CoreBackedPersianBrailleReverseTranslator(
    defaultOptions,
  );
}
