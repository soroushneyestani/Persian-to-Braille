import {
  applyGermanRegionalOverlay,
  getGermanBrailleRuntimeCapability,
  translateGermanBasisschrift,
  translateGermanKurzschriftAutomatic,
  translateGermanVollschriftAutomatic,
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
    let normalizedText: string;
    let unicodeBraille: string;
    let structuralTokens:
      readonly string[];

    if (
      this.profile.mode
      === "basisschrift"
    ) {
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

      normalizedText =
        basis.normalizedText;
      unicodeBraille =
        basis.unicodeBraille;
      structuralTokens =
        basis.structuralTokens;
    } else if (
      this.profile.mode
      === "vollschrift"
    ) {
      const voll =
        translateGermanVollschriftAutomatic(
          input,
        );

      if (!voll.ok) {
        return failure(
          input,
          this.profile,
          (
            voll.code
            === "SOURCE_CONTEXT_UNRESOLVED"
              ? "RUNTIME_CONTEXT_REQUIRED"
              : "RUNTIME_EXECUTION_FAILED"
          ),
          voll.message,
        );
      }

      normalizedText =
        voll.normalizedText;
      unicodeBraille =
        voll.unicodeBraille;
      structuralTokens =
        Object.freeze([]);
    } else {
      const kurz =
        translateGermanKurzschriftAutomatic(
          input,
        );

      if (!kurz.ok) {
        return failure(
          input,
          this.profile,
          (
            kurz.code
            === "SOURCE_CONTEXT_UNRESOLVED"
            || kurz.code
              === "PARENT_VOLLSCHRIFT_FAILURE"
              ? "RUNTIME_CONTEXT_REQUIRED"
              : "RUNTIME_EXECUTION_FAILED"
          ),
          kurz.message,
        );
      }

      normalizedText =
        input.normalize("NFC");
      unicodeBraille =
        kurz.unicodeBraille;
      structuralTokens =
        Object.freeze([]);
    }

    const regional =
      applyGermanRegionalOverlay(
        input,
        this.profile.mode,
        this.profile.regionalOverlay,
        unicodeBraille,
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
      normalizedText,
      cells:
        Object.freeze(
          Array.from(
            regional.unicodeBraille,
          ),
        ),
      unicodeBraille:
        regional.unicodeBraille,
      structuralTokens,
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
