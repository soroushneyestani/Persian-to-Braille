import {
  inspectMidiSourceLines,
  translateMidiSourceLineToBraille,
  translateMidiToBraille,
} from "@persian-braille/music";

import type {
  MusicBrailleMidiDiagnostic,
  MusicBrailleMidiPart,
  MusicBrailleMidiProfileInfo,
  MusicBrailleMidiSourceLine,
  MusicBrailleMidiSourceLineInspectionResult,
  MusicBrailleMidiSourceLineSelection,
  MusicBrailleMidiTranslationFailure,
  MusicBrailleMidiTranslationFailureCode,
  MusicBrailleMidiTranslationResult,
  MusicBrailleMidiTranslationSuccess,
  MusicBrailleMidiTranslator,
} from "./music-public-api.js";

const PROFILE:
  MusicBrailleMidiProfileInfo =
    Object.freeze({
      id:
        "MIDI_TO_MBC2015_UNICODE_V1",
      sourceCode:
        "BANA-MBC-2015",
      input:
        "midi",
      output:
        "unicode-music-braille",
      stateful:
        true,
      originalEnharmonicRecoveryClaimed:
        false,
      sourceSelection:
        "explicit-source-line-supported",
      partTransportLayout:
        "SOURCE_PARTS_NEWLINE_TRANSPORT_V1",
      musicXml:
        "reserved-for-phase-19",
    });

function inputByteLength(
  input:
    | Uint8Array
    | ArrayBuffer,
): number {
  return input.byteLength;
}

function freezeDiagnostic(
  input: Readonly<{
    code: string;
    message: string;
    trackIndex?: number;
    channel?: number;
    sourceStartTick?: number;
    sourceEndTick?: number;
  }>,
): MusicBrailleMidiDiagnostic {
  return Object.freeze({
    code:
      input.code,
    message:
      input.message,
    ...(input.trackIndex !== undefined
      ? { trackIndex: input.trackIndex }
      : {}),
    ...(input.channel !== undefined
      ? { channel: input.channel }
      : {}),
    ...(input.sourceStartTick !== undefined
      ? { sourceStartTick: input.sourceStartTick }
      : {}),
    ...(input.sourceEndTick !== undefined
      ? { sourceEndTick: input.sourceEndTick }
      : {}),
  });
}

function freezePart(
  input: Readonly<{
    trackIndex: number;
    channel: number;
    brf: string;
    unicodeBraille: string;
  }>,
): MusicBrailleMidiPart {
  return Object.freeze({
    trackIndex:
      input.trackIndex,
    channel:
      input.channel,
    brf:
      input.brf,
    unicodeBraille:
      input.unicodeBraille,
  });
}


function freezeSourceLine(
  input: Readonly<{
    id: string;
    trackIndex: number;
    channel: number;
    channelOneBased: number;
    noteCount: number;
  }>,
): MusicBrailleMidiSourceLine {
  return Object.freeze({
    id:
      input.id,
    trackIndex:
      input.trackIndex,
    channel:
      input.channel,
    channelOneBased:
      input.channelOneBased,
    noteCount:
      input.noteCount,
  });
}

function projectInspection(
  input:
    | Uint8Array
    | ArrayBuffer,
): MusicBrailleMidiSourceLineInspectionResult {
  const result =
    inspectMidiSourceLines(
      input,
    );

  const byteLength =
    inputByteLength(
      input,
    );

  if (result.ok === false) {
    return Object.freeze({
      ok: false,
      inputByteLength:
        byteLength,
      code:
        result.code,
      message:
        result.message,
      ...(result.byteOffset !== undefined
        ? {
            byteOffset:
              result.byteOffset,
          }
        : {}),
    });
  }

  return Object.freeze({
    ok: true,
    inputByteLength:
      byteLength,
    format:
      result.format,
    ticksPerQuarterNote:
      result.ticksPerQuarterNote,
    lines:
      Object.freeze(
        result.lines.map(
          freezeSourceLine,
        ),
      ),
  });
}

function projectResult(
  input:
    | Uint8Array
    | ArrayBuffer,
  sourceLine?:
    MusicBrailleMidiSourceLineSelection,
): MusicBrailleMidiTranslationResult {
  const result =
    sourceLine === undefined
      ? translateMidiToBraille(
          input,
        )
      : translateMidiSourceLineToBraille(
          input,
          sourceLine,
        );

  const byteLength =
    inputByteLength(
      input,
    );

  if (result.ok === false) {
    return Object.freeze({
      ok: false,
      inputByteLength:
        byteLength,
      profile:
        PROFILE,
      code:
        result.code as
          MusicBrailleMidiTranslationFailureCode,
      stage:
        result.stage,
      message:
        result.message,
      ...(result.byteOffset !== undefined
        ? { byteOffset: result.byteOffset }
        : {}),
      ...(result.trackIndex !== undefined
        ? { trackIndex: result.trackIndex }
        : {}),
      ...(result.channel !== undefined
        ? { channel: result.channel }
        : {}),
      ...(result.sourceTick !== undefined
        ? { sourceTick: result.sourceTick }
        : {}),
    });
  }

  return Object.freeze({
    ok: true,
    inputByteLength:
      byteLength,
    profile:
      PROFILE,
    format:
      result.format,
    ticksPerQuarterNote:
      result.ticksPerQuarterNote,
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

class DefaultMusicBrailleMidiTranslator
  implements MusicBrailleMidiTranslator {
  readonly profile =
    PROFILE;

  inspectMidi(
    input:
      | Uint8Array
      | ArrayBuffer,
  ): MusicBrailleMidiSourceLineInspectionResult {
    return projectInspection(
      input,
    );
  }

  translateMidiLine(
    input:
      | Uint8Array
      | ArrayBuffer,
    sourceLine:
      MusicBrailleMidiSourceLineSelection,
  ): MusicBrailleMidiTranslationResult {
    return projectResult(
      input,
      sourceLine,
    );
  }

  translateMidiLineOrThrow(
    input:
      | Uint8Array
      | ArrayBuffer,
    sourceLine:
      MusicBrailleMidiSourceLineSelection,
  ): MusicBrailleMidiTranslationSuccess {
    const result =
      this.translateMidiLine(
        input,
        sourceLine,
      );

    if (result.ok === false) {
      throw new MusicBrailleMidiTranslationError(
        result,
      );
    }

    return result;
  }

  translateMidi(
    input:
      | Uint8Array
      | ArrayBuffer,
  ): MusicBrailleMidiTranslationResult {
    return projectResult(
      input,
    );
  }

  translateMidiOrThrow(
    input:
      | Uint8Array
      | ArrayBuffer,
  ): MusicBrailleMidiTranslationSuccess {
    const result =
      this.translateMidi(
        input,
      );

    if (result.ok === false) {
      throw new MusicBrailleMidiTranslationError(
        result,
      );
    }

    return result;
  }
}

export class MusicBrailleMidiTranslationError
  extends Error {
  readonly code:
    MusicBrailleMidiTranslationFailureCode;

  readonly result:
    MusicBrailleMidiTranslationFailure;

  constructor(
    result:
      MusicBrailleMidiTranslationFailure,
  ) {
    super(result.message);

    this.name =
      "MusicBrailleMidiTranslationError";
    this.code =
      result.code;
    this.result =
      result;

    Object.freeze(this);
  }
}

export function createMusicBrailleMidiTranslator(
): MusicBrailleMidiTranslator {
  return new DefaultMusicBrailleMidiTranslator();
}
