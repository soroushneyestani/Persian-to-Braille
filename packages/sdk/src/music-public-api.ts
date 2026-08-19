/**
 * Public MIDI-to-Music-Braille SDK contract.
 *
 * This projection intentionally hides @persian-braille/music internals.
 * MusicXML is not part of this surface and remains reserved for Phase 19.
 */

export type MusicBrailleMidiTranslationFailureCode =
  | "INVALID_MIDI_FILE"
  | "UNSUPPORTED_MIDI_FORMAT"
  | "UNSUPPORTED_MIDI_TIME_DIVISION"
  | "UNSUPPORTED_PITCH_BEND"
  | "NO_MUSICAL_NOTES"
  | "MIDI_SOURCE_LINE_NOT_FOUND"
  | "UNQUANTIZABLE_RHYTHM"
  | "RHYTHM_COMPLEXITY_LIMIT_EXCEEDED"
  | "UNSUPPORTED_POLYPHONY"
  | "UNSUPPORTED_MUSIC_BRAILLE_CONSTRUCT"
  | "MUSIC_BRAILLE_ENCODING_FAILED";

export type MusicBrailleMidiTranslationFailureStage =
  | "parser"
  | "classification"
  | "notation"
  | "bridge"
  | "encoder";

export interface MusicBrailleMidiProfileInfo {
  readonly id: string;
  readonly sourceCode: "BANA-MBC-2015";
  readonly input: "midi";
  readonly output: "unicode-music-braille";
  readonly stateful: true;
  readonly originalEnharmonicRecoveryClaimed: false;
  readonly sourceSelection:
    "explicit-source-line-supported";
  readonly partTransportLayout:
    "SOURCE_PARTS_NEWLINE_TRANSPORT_V1";
  readonly musicXml: "reserved-for-phase-19";
}

export interface MusicBrailleMidiDiagnostic {
  readonly code: string;
  readonly message: string;
  readonly trackIndex?: number;
  readonly channel?: number;
  readonly sourceStartTick?: number;
  readonly sourceEndTick?: number;
}

export interface MusicBrailleMidiPart {
  readonly trackIndex: number;
  readonly channel: number;
  readonly brf: string;
  readonly unicodeBraille: string;
}

export interface MusicBrailleMidiTranslationSuccess {
  readonly ok: true;
  readonly inputByteLength: number;
  readonly profile: MusicBrailleMidiProfileInfo;
  readonly format: 0 | 1;
  readonly ticksPerQuarterNote: number;
  readonly parts: readonly MusicBrailleMidiPart[];
  readonly brf: string;
  readonly unicodeBraille: string;
  readonly diagnostics:
    readonly MusicBrailleMidiDiagnostic[];
}

export interface MusicBrailleMidiTranslationFailure {
  readonly ok: false;
  readonly inputByteLength: number;
  readonly profile: MusicBrailleMidiProfileInfo;
  readonly code:
    MusicBrailleMidiTranslationFailureCode;
  readonly stage:
    MusicBrailleMidiTranslationFailureStage;
  readonly message: string;
  readonly byteOffset?: number;
  readonly trackIndex?: number;
  readonly channel?: number;
  readonly sourceTick?: number;
}

export type MusicBrailleMidiTranslationResult =
  | MusicBrailleMidiTranslationSuccess
  | MusicBrailleMidiTranslationFailure;

export interface MusicBrailleMidiSourceLineSelection {
  readonly trackIndex: number;
  readonly channel: number;
}

export interface MusicBrailleMidiSourceLine
  extends MusicBrailleMidiSourceLineSelection {
  readonly id: string;
  readonly channelOneBased: number;
  readonly noteCount: number;
}

export interface MusicBrailleMidiSourceLineInspectionSuccess {
  readonly ok: true;
  readonly inputByteLength: number;
  readonly format: 0 | 1;
  readonly ticksPerQuarterNote: number;
  readonly lines:
    readonly MusicBrailleMidiSourceLine[];
}

export interface MusicBrailleMidiSourceLineInspectionFailure {
  readonly ok: false;
  readonly inputByteLength: number;
  readonly code:
    | "INVALID_MIDI_FILE"
    | "UNSUPPORTED_MIDI_FORMAT"
    | "UNSUPPORTED_MIDI_TIME_DIVISION"
    | "NO_MUSICAL_NOTES";
  readonly message: string;
  readonly byteOffset?: number;
}

export type MusicBrailleMidiSourceLineInspectionResult =
  | MusicBrailleMidiSourceLineInspectionSuccess
  | MusicBrailleMidiSourceLineInspectionFailure;

export interface MusicBrailleMidiTranslator {
  readonly profile:
    MusicBrailleMidiProfileInfo;

  inspectMidi(
    input:
      | Uint8Array
      | ArrayBuffer,
  ): MusicBrailleMidiSourceLineInspectionResult;

  translateMidiLine(
    input:
      | Uint8Array
      | ArrayBuffer,
    sourceLine:
      MusicBrailleMidiSourceLineSelection,
  ): MusicBrailleMidiTranslationResult;

  translateMidiLineOrThrow(
    input:
      | Uint8Array
      | ArrayBuffer,
    sourceLine:
      MusicBrailleMidiSourceLineSelection,
  ): MusicBrailleMidiTranslationSuccess;

  translateMidi(
    input:
      | Uint8Array
      | ArrayBuffer,
  ): MusicBrailleMidiTranslationResult;

  translateMidiOrThrow(
    input:
      | Uint8Array
      | ArrayBuffer,
  ): MusicBrailleMidiTranslationSuccess;
}

export type CreateMusicBrailleMidiTranslator = (
) => MusicBrailleMidiTranslator;
