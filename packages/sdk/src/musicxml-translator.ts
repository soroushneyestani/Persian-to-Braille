import {
  translateMusicXmlBytesToBraille,
  translateMxlToBraille,
} from "@persian-braille/music";

import type {
  MusicXmlToBrailleResult,
} from "@persian-braille/music";

import type {
  MusicBrailleMusicXmlDiagnostic,
  MusicBrailleMusicXmlPart,
  MusicBrailleMusicXmlProfileInfo,
  MusicBrailleMusicXmlSourceKind,
  MusicBrailleMusicXmlTranslationFailure,
  MusicBrailleMusicXmlTranslationFailureCode,
  MusicBrailleMusicXmlTranslationResult,
  MusicBrailleMusicXmlTranslationSuccess,
  MusicBrailleMusicXmlTranslator,
} from "./musicxml-public-api.js";

const PROFILE:
  MusicBrailleMusicXmlProfileInfo =
    Object.freeze({
      id:
        "MUSICXML_TO_MBC2015_UNICODE_V1",
      sourceCode:
        "BANA-MBC-2015",
      inputs:
        Object.freeze([
          "musicxml",
          "mxl",
        ] as const),
      output:
        "unicode-music-braille",
      stateful:
        true,
      writtenPitchPreserved:
        true,
      midiApiIndependent:
        true,
      partTransportLayout:
        "MUSICXML_PARTS_NEWLINE_TRANSPORT_V1",
    });

function inputBytes(
  input:
    | Uint8Array
    | ArrayBuffer,
): Uint8Array {
  return input instanceof Uint8Array
    ? input
    : new Uint8Array(input);
}

function freezeDiagnostic(
  input: Readonly<{
    code: string;
    message: string;
    partId?: string;
    measureIndex?: number;
  }>,
): MusicBrailleMusicXmlDiagnostic {
  return Object.freeze({
    code:
      input.code,
    message:
      input.message,
    ...(input.partId !== undefined
      ? { partId: input.partId }
      : {}),
    ...(input.measureIndex !== undefined
      ? { measureIndex: input.measureIndex }
      : {}),
  });
}

function freezePart(
  input: Readonly<{
    partId: string;
    partName?: string;
    brf: string;
    unicodeBraille: string;
  }>,
): MusicBrailleMusicXmlPart {
  return Object.freeze({
    partId:
      input.partId,
    ...(input.partName !== undefined
      ? { partName: input.partName }
      : {}),
    brf:
      input.brf,
    unicodeBraille:
      input.unicodeBraille,
  });
}

function projectResult(
  inputByteLength: number,
  sourceKind:
    MusicBrailleMusicXmlSourceKind,
  result:
    MusicXmlToBrailleResult,
): MusicBrailleMusicXmlTranslationResult {
  if (result.ok === false) {
    return Object.freeze({
      ok: false,
      inputByteLength,
      sourceKind,
      profile:
        PROFILE,
      code:
        result.code as
          MusicBrailleMusicXmlTranslationFailureCode,
      stage:
        result.stage,
      message:
        result.message,
      ...(result.partId !== undefined
        ? { partId: result.partId }
        : {}),
      ...(result.measureIndex !== undefined
        ? { measureIndex: result.measureIndex }
        : {}),
    });
  }

  return Object.freeze({
    ok: true,
    inputByteLength,
    sourceKind,
    profile:
      PROFILE,
    parts:
      Object.freeze(
        result.parts.map(
          freezePart,
        ),
      ),
    brf:
      result.brf,
    unicodeBraille:
      result.unicodeBraille,
    diagnostics:
      Object.freeze(
        result.diagnostics.map(
          freezeDiagnostic,
        ),
      ),
  });
}

class DefaultMusicBrailleMusicXmlTranslator
  implements MusicBrailleMusicXmlTranslator {
  readonly profile =
    PROFILE;

  translateMusicXml(
    input:
      | Uint8Array
      | ArrayBuffer,
  ): MusicBrailleMusicXmlTranslationResult {
    const bytes =
      inputBytes(input);

    return projectResult(
      bytes.byteLength,
      "musicxml",
      translateMusicXmlBytesToBraille(
        bytes,
      ),
    );
  }

  translateMusicXmlOrThrow(
    input:
      | Uint8Array
      | ArrayBuffer,
  ): MusicBrailleMusicXmlTranslationSuccess {
    const result =
      this.translateMusicXml(
        input,
      );

    if (result.ok === false) {
      throw new MusicBrailleMusicXmlTranslationError(
        result,
      );
    }

    return result;
  }

  async translateMxl(
    input:
      | Uint8Array
      | ArrayBuffer,
  ): Promise<MusicBrailleMusicXmlTranslationResult> {
    const bytes =
      inputBytes(input);

    return projectResult(
      bytes.byteLength,
      "mxl",
      await translateMxlToBraille(
        bytes,
      ),
    );
  }

  async translateMxlOrThrow(
    input:
      | Uint8Array
      | ArrayBuffer,
  ): Promise<MusicBrailleMusicXmlTranslationSuccess> {
    const result =
      await this.translateMxl(
        input,
      );

    if (result.ok === false) {
      throw new MusicBrailleMusicXmlTranslationError(
        result,
      );
    }

    return result;
  }
}

export class MusicBrailleMusicXmlTranslationError
  extends Error {
  readonly code:
    MusicBrailleMusicXmlTranslationFailureCode;

  readonly result:
    MusicBrailleMusicXmlTranslationFailure;

  constructor(
    result:
      MusicBrailleMusicXmlTranslationFailure,
  ) {
    super(result.message);

    this.name =
      "MusicBrailleMusicXmlTranslationError";
    this.code =
      result.code;
    this.result =
      result;

    Object.freeze(this);
  }
}

export function createMusicBrailleMusicXmlTranslator(
): MusicBrailleMusicXmlTranslator {
  return new DefaultMusicBrailleMusicXmlTranslator();
}
