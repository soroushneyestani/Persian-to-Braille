/* PHASE16_PACK_A_MUSICXML
 * MusicXML source model. This preserves source semantics before projection
 * into the existing notation / Music Braille pipeline.
 */
export type MusicXmlStep = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export interface MusicXmlFraction {
  readonly numerator: number;
  readonly denominator: number;
}

export interface MusicXmlWrittenPitch {
  readonly step: MusicXmlStep;
  readonly alter: number;
  readonly octave: number;
}

export interface MusicXmlKeySignature {
  readonly fifths: number;
  readonly mode?: string;
}

export interface MusicXmlTimeSignature {
  readonly beats: number;
  readonly beatType: number;
}

export interface MusicXmlClef {
  readonly number?: number;
  readonly sign: string;
  readonly line?: number;
  readonly octaveChange?: number;
}

export type MusicXmlTieType = "start" | "stop";
export type MusicXmlSlurType = "start" | "stop" | "continue";
export type MusicXmlTupletType = "start" | "stop";

export interface MusicXmlSlur {
  readonly type: MusicXmlSlurType;
  readonly number?: number;
  readonly placement?: string;
}

export interface MusicXmlTuplet {
  readonly type: MusicXmlTupletType;
  readonly number?: number;
}

export interface MusicXmlTimeModification {
  readonly actualNotes: number;
  readonly normalNotes: number;
  readonly normalType?: string;
  readonly normalDots: number;
}

export interface MusicXmlNote {
  readonly kind: "note";
  readonly sourceOrder: number;
  readonly onsetQuarter: MusicXmlFraction;
  readonly durationQuarter: MusicXmlFraction;
  readonly durationDivisions?: number;
  readonly effectiveDivisions: number;
  readonly writtenPitch?: MusicXmlWrittenPitch;
  readonly rest: boolean;
  // PHASE16_R6A_MUSICXML_MEASURE_REST
  // MusicXML <rest measure="yes"/> is a complete-measure rest semantic,
  // not an augmentation-dot assertion derived from numeric duration.
  readonly measureRest?: true;
  readonly chord: boolean;
  readonly grace: boolean;
  readonly graceSlash?: boolean;
  readonly stem?: string;
  readonly type?: string;
  readonly dots: number;
  readonly accidental?: string;
  readonly voice?: string;
  readonly staff?: number;
  readonly ties: readonly MusicXmlTieType[];
  readonly slurs: readonly MusicXmlSlur[];
  readonly tuplets: readonly MusicXmlTuplet[];
  readonly timeModification?: MusicXmlTimeModification;
  readonly articulations: readonly string[];
}

export interface MusicXmlAttributes {
  readonly kind: "attributes";
  readonly divisions?: number;
  readonly key?: MusicXmlKeySignature;
  readonly time?: MusicXmlTimeSignature;
  readonly clefs: readonly MusicXmlClef[];
}

export interface MusicXmlBackup {
  readonly kind: "backup";
  readonly durationDivisions: number;
  readonly effectiveDivisions: number;
}

export interface MusicXmlForward {
  readonly kind: "forward";
  readonly durationDivisions: number;
  readonly effectiveDivisions: number;
  readonly voice?: string;
  readonly staff?: number;
}

export interface MusicXmlWedge {
  readonly type?: string;
  readonly number?: number;
  readonly attributes: Readonly<Record<string, string>>;
}

// PHASE16_R7_OCTAVE_SHIFT_NONFACSIMILE
export interface MusicXmlOctaveShift {
  readonly type?: string;
  readonly size?: number;
  readonly number?: number;
  readonly attributes: Readonly<Record<string, string>>;
}

export interface MusicXmlPedal {
  readonly type?: string;
  readonly number?: number;
  readonly line?: string;
  readonly sign?: string;
  readonly attributes: Readonly<Record<string, string>>;
}

export interface MusicXmlMetronome {
  readonly beatUnit?: string;
  readonly beatUnitDots: number;
  readonly perMinute?: string;
  readonly relation?: string;
  readonly attributes: Readonly<Record<string, string>>;
}

export interface MusicXmlDirection {
  readonly kind: "direction";
  readonly onsetQuarter?: MusicXmlFraction;
  readonly tempo?: number;
  readonly soundDynamics?: number;
  readonly dynamics: readonly string[];
  readonly words: readonly string[];
  readonly wedges: readonly MusicXmlWedge[];
  readonly pedals: readonly MusicXmlPedal[];
  readonly octaveShifts?: readonly MusicXmlOctaveShift[];
  readonly metronomes: readonly MusicXmlMetronome[];
  readonly otherTypes: readonly string[];
  readonly staff?: number;
}

export interface MusicXmlBarline {
  readonly kind: "barline";
  readonly location?: string;
  readonly repeat?: "forward" | "backward";
  readonly repeatTimes?: number;
  readonly ending?: Readonly<{
    readonly number?: string;
    readonly type?: string;
  }>;
}

export type MusicXmlMeasureItem =
  | MusicXmlNote
  | MusicXmlAttributes
  | MusicXmlBackup
  | MusicXmlForward
  | MusicXmlDirection
  | MusicXmlBarline;

export interface MusicXmlMeasure {
  readonly index: number;
  readonly number: string;
  readonly implicit: boolean;
  readonly items: readonly MusicXmlMeasureItem[];
}

export interface MusicXmlPart {
  readonly id: string;
  readonly name?: string;
  readonly measures: readonly MusicXmlMeasure[];
}

export type MusicXmlDiagnosticClassification =
  | "PRESERVED_BUT_IGNORED"
  | "UNSUPPORTED"
  | "INVALID";

export interface MusicXmlDiagnostic {
  readonly classification: MusicXmlDiagnosticClassification;
  readonly code: string;
  readonly message: string;
  readonly partId?: string;
  readonly measureIndex?: number;
}

export interface MusicXmlScore {
  readonly format: "musicxml";
  readonly root: "score-partwise";
  readonly version?: string;
  readonly parts: readonly MusicXmlPart[];
  readonly diagnostics: readonly MusicXmlDiagnostic[];
}

export type MusicXmlParserFailureCode =
  | "INVALID_XML"
  | "UNSUPPORTED_ROOT"
  | "INVALID_MUSICXML"
  | "UNSAFE_XML_ENTITY";

export interface MusicXmlParserFailure {
  readonly ok: false;
  readonly code: MusicXmlParserFailureCode;
  readonly message: string;
}

export interface MusicXmlParserSuccess {
  readonly ok: true;
  readonly source: MusicXmlScore;
}

export type MusicXmlParserResult =
  | MusicXmlParserFailure
  | MusicXmlParserSuccess;

export type MusicXmlMxlFailureCode =
  | "INVALID_ZIP"
  | "UNSAFE_ZIP_PATH"
  | "ZIP_LIMIT_EXCEEDED"
  | "UNSUPPORTED_ZIP_COMPRESSION"
  | "DECOMPRESSION_UNAVAILABLE"
  | "MISSING_CONTAINER"
  | "INVALID_CONTAINER"
  | "MISSING_ROOTFILE"
  | "ROOTFILE_NOT_FOUND";

export interface MusicXmlMxlFailure {
  readonly ok: false;
  readonly code: MusicXmlMxlFailureCode;
  readonly message: string;
}

export interface MusicXmlMxlSuccess {
  readonly ok: true;
  readonly xml: Uint8Array;
  readonly rootfilePath: string;
}

export type MusicXmlMxlLoadResult =
  | MusicXmlMxlFailure
  | MusicXmlMxlSuccess;
