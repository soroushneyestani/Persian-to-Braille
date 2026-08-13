import {
  createForwardTranslator,
  getBundledSpecification,
} from "@persian-braille/core";

import type {
  PersianBrailleProfileInfo,
  PersianBrailleTranslationErrorData,
  PersianBrailleTranslationFailure,
  PersianBrailleTranslationFailureCode,
  PersianBrailleTranslationResult,
  PersianBrailleTranslationSuccess,
  PersianBrailleTranslator,
  PersianBrailleUnicodeLocation,
} from "./public-api.js";

type UnknownRecord = Readonly<
  Record<string, unknown>
>;

const failureCodes =
  new Set<PersianBrailleTranslationFailureCode>([
    "PREPROCESSING_FAILED",
    "UNKNOWN_CHARACTER",
    "UNKNOWN_SEQUENCE",
    "AMBIGUOUS_MATCH",
    "UNSUPPORTED_ENGINE_STATE",
  ]);

function isRecord(
  value: unknown,
): value is UnknownRecord {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function readString(
  value: unknown,
  key: string,
): string | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const candidate = value[key];

  return typeof candidate === "string"
    ? candidate
    : undefined;
}

function readStringArray(
  value: unknown,
  key: string,
): readonly string[] | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const candidate = value[key];

  if (
    !Array.isArray(candidate) ||
    !candidate.every(
      (item) => typeof item === "string",
    )
  ) {
    return undefined;
  }

  return Object.freeze([...candidate]);
}

function readFailureCode(
  value: unknown,
): PersianBrailleTranslationFailureCode {
  const code = readString(value, "code");

  if (
    code !== undefined &&
    failureCodes.has(
      code as PersianBrailleTranslationFailureCode,
    )
  ) {
    return code as PersianBrailleTranslationFailureCode;
  }

  throw new Error(
    `Core returned an unsupported translation failure code: ${String(code)}`,
  );
}

function readLocation(
  value: unknown,
): PersianBrailleUnicodeLocation | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const location = value["location"];

  if (!isRecord(location)) {
    return undefined;
  }

  const codePointIndex =
    location["codePointIndex"];
  const utf16Index =
    location["utf16Index"];

  if (
    !Number.isInteger(codePointIndex) ||
    !Number.isInteger(utf16Index)
  ) {
    return undefined;
  }

  return Object.freeze({
    codePointIndex:
      codePointIndex as number,
    utf16Index:
      utf16Index as number,
  });
}

function readCauseCode(
  value: unknown,
): string | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  return readString(
    value["cause"],
    "code",
  );
}

function readProfileStatus(
  specification: unknown,
): string {
  const direct =
    readString(
      specification,
      "profileStatus",
    );

  if (direct !== undefined) {
    return direct;
  }

  if (isRecord(specification)) {
    const nested =
      readString(
        specification["profile"],
        "status",
      );

    if (nested !== undefined) {
      return nested;
    }
  }

  throw new Error(
    "Bundled specification does not expose profile status.",
  );
}

function createProfileInfo(): PersianBrailleProfileInfo {
  const specification =
    getBundledSpecification();

  return Object.freeze({
    id: specification.profileId,
    version:
      specification.profileVersion,
    status:
      readProfileStatus(
        specification,
      ),
    direction: "print-to-braille",
  });
}

function freezeStrings(
  values: readonly string[],
): readonly string[] {
  return Object.freeze([...values]);
}

function projectSuccess(
  input: string,
  profile: PersianBrailleProfileInfo,
  outcome: {
    readonly normalizedText: string;
    readonly cells: readonly string[];
    readonly unicodeBraille: string;
    readonly structuralTokens:
      readonly string[];
  },
): PersianBrailleTranslationSuccess {
  return Object.freeze({
    ok: true,
    input,
    profile,
    normalizedText:
      outcome.normalizedText,
    cells:
      freezeStrings(outcome.cells),
    unicodeBraille:
      outcome.unicodeBraille,
    structuralTokens:
      freezeStrings(
        outcome.structuralTokens,
      ),
  });
}

function projectFailure(
  input: string,
  profile: PersianBrailleProfileInfo,
  outcome: unknown,
): PersianBrailleTranslationFailure {
  const message =
    readString(outcome, "message");

  if (message === undefined) {
    throw new Error(
      "Core translation failure did not expose a message.",
    );
  }

  const failure: {
    ok: false;
    input: string;
    profile: PersianBrailleProfileInfo;
    code: PersianBrailleTranslationFailureCode;
    message: string;
    location?: PersianBrailleUnicodeLocation;
    character?: string;
    codePoint?: string;
    candidateRuleIds?: readonly string[];
    causeCode?: string;
  } = {
    ok: false,
    input,
    profile,
    code:
      readFailureCode(outcome),
    message,
  };

  const location =
    readLocation(outcome);
  const character =
    readString(
      outcome,
      "character",
    );
  const codePoint =
    readString(
      outcome,
      "codePoint",
    );
  const candidateRuleIds =
    readStringArray(
      outcome,
      "candidateRuleIds",
    );
  const causeCode =
    readCauseCode(outcome);

  if (location !== undefined) {
    failure.location = location;
  }

  if (character !== undefined) {
    failure.character = character;
  }

  if (codePoint !== undefined) {
    failure.codePoint = codePoint;
  }

  if (
    candidateRuleIds !== undefined
  ) {
    failure.candidateRuleIds =
      candidateRuleIds;
  }

  if (causeCode !== undefined) {
    failure.causeCode = causeCode;
  }

  return Object.freeze(failure);
}

export class PersianBrailleTranslationError
  extends Error
  implements PersianBrailleTranslationErrorData {
  readonly code:
    PersianBrailleTranslationFailureCode;

  readonly result:
    PersianBrailleTranslationFailure;

  constructor(
    result:
      PersianBrailleTranslationFailure,
  ) {
    super(result.message);

    this.name =
      "PersianBrailleTranslationError";
    this.code = result.code;
    this.result = result;

    Object.freeze(this);
  }
}

class CoreBackedPersianBrailleTranslator
  implements PersianBrailleTranslator {
  readonly profile:
    PersianBrailleProfileInfo;

  readonly #coreTranslator =
    createForwardTranslator();

  constructor() {
    this.profile =
      createProfileInfo();
  }

  translate(
    input: string,
  ): PersianBrailleTranslationResult {
    const outcome =
      this.#coreTranslator.translate(
        input,
      );

    if (outcome.ok) {
      return projectSuccess(
        input,
        this.profile,
        outcome,
      );
    }

    return projectFailure(
      input,
      this.profile,
      outcome,
    );
  }

  translateOrThrow(
    input: string,
  ): PersianBrailleTranslationSuccess {
    const result =
      this.translate(input);

    if (!result.ok) {
      throw new PersianBrailleTranslationError(
        result,
      );
    }

    return result;
  }
}

export function createPersianBrailleTranslator(
): PersianBrailleTranslator {
  return new CoreBackedPersianBrailleTranslator();
}
