import {
  applyGermanRegionalOverlay,
  getGermanBrailleRuntimeCapability,
  translateGermanBasisschrift,
} from "@persian-braille/core";

import type {
  GermanBrailleProfileInfo,
  GermanBrailleTranslationErrorData,
  GermanBrailleTranslationFailure,
  GermanBrailleTranslationFailureCode,
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

function failure(
  input: string,
  profile: GermanBrailleProfileInfo,
  code: GermanBrailleTranslationFailureCode,
  message: string,
  location?:
    GermanBrailleTranslationFailure["location"],
): GermanBrailleTranslationFailure {
  return Object.freeze({
    ok: false,
    input,
    profile,
    code,
    message,
    ...(location === undefined
      ? {}
      : {
          location,
        }),
  });
}

export class GermanBrailleTranslationError
  extends Error
  implements GermanBrailleTranslationErrorData {
  readonly code:
    GermanBrailleTranslationFailureCode;

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
      result.code;

    this.result =
      result;

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
    if (
      this.profile.mode
      !== "basisschrift"
    ) {
      return failure(
        input,
        this.profile,
        "RUNTIME_CONTEXT_REQUIRED",
        (
          `German ${this.profile.mode} has a source-backed executable Core `
          + "surface, but automatic public translation requires explicit "
          + `resolution context. Required dependency: ${this.profile.runtimeDependency}.`
        ),
      );
    }

    const basis =
      translateGermanBasisschrift(
        input,
      );

    if (!basis.ok) {
      return failure(
        input,
        this.profile,
        "RUNTIME_EXECUTION_FAILED",
        basis.message,
        basis.location,
      );
    }

    const regional =
      applyGermanRegionalOverlay(
        input,
        "basisschrift",
        this.profile.regionalOverlay,
        basis.unicodeBraille,
      );

    if (!regional.ok) {
      return failure(
        input,
        this.profile,
        regional.code,
        (
          "The selected Swiss regional profile rejects explicit ß input; "
          + "automatic ß-to-ss normalization is not applied."
        ),
      );
    }

    return Object.freeze({
      ok: true,
      input,
      profile:
        this.profile,
      normalizedText:
        basis.normalizedText,
      cells:
        Object.freeze(
          Array.from(
            regional.unicodeBraille,
          ),
        ),
      unicodeBraille:
        regional.unicodeBraille,
      structuralTokens:
        basis.structuralTokens,
    });
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
