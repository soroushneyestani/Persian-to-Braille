/**
 * Public MusicXML/MXL-to-Music-Braille SDK contract.
 *
 * This surface is intentionally separate from the public MIDI SDK contract.
 * Both routes reuse @persian-braille/music and the same Braille Music engine.
 */

export type MusicBrailleMusicXmlSourceKind =
  | "musicxml"
  | "mxl";

export type MusicBrailleMusicXmlTranslationFailureCode =
  | "INVALID_XML"
  | "UNSUPPORTED_ROOT"
  | "INVALID_MUSICXML"
  | "UNSAFE_XML_ENTITY"
  | "INVALID_ZIP"
  | "UNSAFE_ZIP_PATH"
  | "ZIP_LIMIT_EXCEEDED"
  | "UNSUPPORTED_ZIP_COMPRESSION"
  | "DECOMPRESSION_UNAVAILABLE"
  | "MISSING_CONTAINER"
  | "INVALID_CONTAINER"
  | "MISSING_ROOTFILE"
  | "ROOTFILE_NOT_FOUND"
  | "NO_MUSICXML_PARTS"
  | "INVALID_SOURCE_STRUCTURE"
  | "UNSUPPORTED_SOURCE_STRUCTURE"
  | "UNSUPPORTED_CURSOR_OPERATION"
  | "UNSUPPORTED_POLYPHONY"
  | "UNSUPPORTED_GAP"
  | "UNSUPPORTED_MULTI_STAFF_POLYPHONY"
  | "UNSUPPORTED_CROSSED_VOICES"
  | "UNSUPPORTED_POLYPHONY_REST_GAP"
  | "UNSUPPORTED_NONTERMINAL_PART_MEASURE"
  | "UNSUPPORTED_GRACE"
  | "UNSUPPORTED_SLUR"
  | "UNSUPPORTED_ARTICULATION"
  | "UNSUPPORTED_DYNAMICS"
  | "UNSUPPORTED_DIRECTION_WORDS"
  | "UNSUPPORTED_DIRECTION_WORD_GLYPH"
  | "UNSUPPORTED_DIRECTION_WORD_CONTINUATION"
  | "UNSUPPORTED_DIRECTION_WORD_TEXT"
  | "UNSUPPORTED_DIRECTION_WORD_PLACEMENT"
  | "UNSUPPORTED_DIRECTION_STRUCTURAL_TERMINOLOGY"
  | "UNSUPPORTED_DIRECTION_TYPE"
  | "UNSUPPORTED_WEDGE"
  | "UNSUPPORTED_PEDAL"
  | "UNSUPPORTED_METRONOME"
  | "UNSUPPORTED_REPEAT"
  | "UNSUPPORTED_ENDING"
  | "UNSUPPORTED_KEY_CHANGE"
  | "UNSUPPORTED_KEY_CANCELLATION"
  | "UNSUPPORTED_DURATION"
  | "UNSUPPORTED_TUPLET"
  | "UNSUPPORTED_WRITTEN_PITCH"
  | "INVALID_CHORD"
  | "PARTIAL_CHORD_TIE"
  | "MUSIC_BRAILLE_ENCODING_FAILED";

export type MusicBrailleMusicXmlTranslationFailureStage =
  | "container"
  | "parser"
  | "adapter"
  | "bridge"
  | "encoder";

export interface MusicBrailleMusicXmlProfileInfo {
  readonly id: "MUSICXML_TO_MBC2015_UNICODE_V1";
  readonly sourceCode: "BANA-MBC-2015";
  readonly inputs:
    readonly ["musicxml", "mxl"];
  readonly output: "unicode-music-braille";
  readonly stateful: true;
  readonly writtenPitchPreserved: true;
  readonly midiApiIndependent: true;
  readonly partTransportLayout:
    "MUSICXML_PARTS_NEWLINE_TRANSPORT_V1";
}

export interface MusicBrailleMusicXmlDiagnostic {
  readonly code: string;
  readonly message: string;
  readonly partId?: string;
  readonly measureIndex?: number;
}

export interface MusicBrailleMusicXmlPart {
  readonly partId: string;
  readonly partName?: string;
  readonly brf: string;
  readonly unicodeBraille: string;
}

export interface MusicBrailleMusicXmlTranslationSuccess {
  readonly ok: true;
  readonly inputByteLength: number;
  readonly sourceKind:
    MusicBrailleMusicXmlSourceKind;
  readonly profile:
    MusicBrailleMusicXmlProfileInfo;
  readonly parts:
    readonly MusicBrailleMusicXmlPart[];
  readonly brf: string;
  readonly unicodeBraille: string;
  readonly diagnostics:
    readonly MusicBrailleMusicXmlDiagnostic[];
}

export interface MusicBrailleMusicXmlTranslationFailure {
  readonly ok: false;
  readonly inputByteLength: number;
  readonly sourceKind:
    MusicBrailleMusicXmlSourceKind;
  readonly profile:
    MusicBrailleMusicXmlProfileInfo;
  readonly code:
    MusicBrailleMusicXmlTranslationFailureCode;
  readonly stage:
    MusicBrailleMusicXmlTranslationFailureStage;
  readonly message: string;
  readonly partId?: string;
  readonly measureIndex?: number;
}

export type MusicBrailleMusicXmlTranslationResult =
  | MusicBrailleMusicXmlTranslationSuccess
  | MusicBrailleMusicXmlTranslationFailure;

export interface MusicBrailleMusicXmlTranslator {
  readonly profile:
    MusicBrailleMusicXmlProfileInfo;

  translateMusicXml(
    input:
      | Uint8Array
      | ArrayBuffer,
  ): MusicBrailleMusicXmlTranslationResult;

  translateMusicXmlOrThrow(
    input:
      | Uint8Array
      | ArrayBuffer,
  ): MusicBrailleMusicXmlTranslationSuccess;

  translateMxl(
    input:
      | Uint8Array
      | ArrayBuffer,
  ): Promise<MusicBrailleMusicXmlTranslationResult>;

  translateMxlOrThrow(
    input:
      | Uint8Array
      | ArrayBuffer,
  ): Promise<MusicBrailleMusicXmlTranslationSuccess>;
}

export type CreateMusicBrailleMusicXmlTranslator = (
) => MusicBrailleMusicXmlTranslator;
