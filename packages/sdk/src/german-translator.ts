import {
  getGermanBrailleRuntimeCapability,
} from "@persian-braille/core";

import type {
  GermanBrailleProfileInfo,
  GermanBrailleTranslationErrorData,
  GermanBrailleTranslationFailure,
  GermanBrailleTranslationOptions,
  GermanBrailleTranslationResult,
  GermanBrailleTranslationSuccess,
  GermanBrailleTranslator,
} from "./german-public-api.js";

function createProfileInfo(
  options: GermanBrailleTranslationOptions,
): GermanBrailleProfileInfo {
  const capability =
    getGermanBrailleRuntimeCapability({
      mode: options.mode,
      regionalOverlay:
        options.regionalOverlay ?? null,
    });

  return Object.freeze({
    language: capability.language,
    mode: capability.mode,
    regionalOverlay:
      capability.regionalOverlay,
    direction: "print-to-braille",
    runtimeStatus:
      capability.status,
    runtimeDependency:
      capability.dependency,
    runtimeExecutable:
      capability.executable,
    runtimeRegistered:
      capability.runtimeRegistered,
    loweringCoverage:
      capability.loweringCoverage,
  });
}

function runtimeUnavailableFailure(
  input: string,
  profile: GermanBrailleProfileInfo,
): GermanBrailleTranslationFailure {
  return Object.freeze({
    ok: false,
    input,
    profile,
    code: "RUNTIME_NOT_EXECUTABLE",
    message:
      "German Braille semantic Core is closed, but executable runtime " +
      `materialization is not available for mode ${profile.mode}. ` +
      `Required dependency: ${profile.runtimeDependency}.`,
  });
}

export class GermanBrailleTranslationError
  extends Error
  implements GermanBrailleTranslationErrorData {
  readonly code:
    "RUNTIME_NOT_EXECUTABLE";

  readonly result:
    GermanBrailleTranslationFailure;

  constructor(
    result:
      GermanBrailleTranslationFailure,
  ) {
    super(result.message);

    this.name =
      "GermanBrailleTranslationError";
    this.code =
      "RUNTIME_NOT_EXECUTABLE";
    this.result = result;

    Object.freeze(this);
  }
}

class CapabilityBackedGermanBrailleTranslator
  implements GermanBrailleTranslator {
  readonly profile:
    GermanBrailleProfileInfo;

  constructor(
    options: GermanBrailleTranslationOptions,
  ) {
    this.profile =
      createProfileInfo(options);
  }

  translate(
    input: string,
  ): GermanBrailleTranslationResult {
    return runtimeUnavailableFailure(
      input,
      this.profile,
    );
  }

  translateOrThrow(
    input: string,
  ): GermanBrailleTranslationSuccess {
    const result =
      this.translate(input);

    if (!result.ok) {
      throw new GermanBrailleTranslationError(
        result,
      );
    }

    return result;
  }
}

export function createGermanBrailleTranslator(
  options: GermanBrailleTranslationOptions,
): GermanBrailleTranslator {
  return new CapabilityBackedGermanBrailleTranslator(
    options,
  );
}
