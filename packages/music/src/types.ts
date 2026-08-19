export type MidiFileFormat =
  | 0
  | 1;

export interface MidiSourceLocation {
  readonly byteOffset: number;
}

export type MidiParserFailureCode =
  | "INVALID_MIDI_FILE"
  | "UNSUPPORTED_MIDI_FORMAT"
  | "UNSUPPORTED_MIDI_TIME_DIVISION"
  | "NO_MUSICAL_NOTES";

export interface MidiParserFailure {
  readonly ok: false;
  readonly code: MidiParserFailureCode;
  readonly message: string;
  readonly location?: MidiSourceLocation;
}

export interface MidiTempoEvent {
  readonly kind: "tempo";
  readonly trackIndex: number;
  readonly tick: number;
  readonly microsecondsPerQuarterNote: number;
}

export interface MidiTimeSignatureEvent {
  readonly kind: "time-signature";
  readonly trackIndex: number;
  readonly tick: number;
  readonly numerator: number;
  readonly denominator: number;
  readonly clocksPerMetronomeClick: number;
  readonly thirtySecondNotesPerQuarter: number;
}

export interface MidiKeySignatureEvent {
  readonly kind: "key-signature";
  readonly trackIndex: number;
  readonly tick: number;
  readonly sharpsFlats: number;
  readonly mode: "major" | "minor";
}

export interface MidiProgramChangeEvent {
  readonly kind: "program-change";
  readonly trackIndex: number;
  readonly channel: number;
  readonly tick: number;
  readonly program: number;
}

export interface MidiPitchBendEvent {
  readonly kind: "pitch-bend";
  readonly trackIndex: number;
  readonly channel: number;
  readonly tick: number;
  readonly value: number;
  readonly effectiveProgram: number;
}

export interface MidiNote {
  readonly trackIndex: number;
  readonly channel: number;
  readonly noteNumber: number;
  readonly velocity: number;
  readonly program: number;
  readonly startTick: number;
  readonly endTick: number;
}

export interface MidiSourcePart {
  readonly trackIndex: number;
  readonly channel: number;
  readonly notes: readonly MidiNote[];
}

export interface MidiSemanticSource {
  readonly format: MidiFileFormat;
  readonly ticksPerQuarterNote: number;
  readonly trackCount: number;
  readonly notes: readonly MidiNote[];
  readonly parts: readonly MidiSourcePart[];
  readonly programChangeEvents:
    readonly MidiProgramChangeEvent[];
  readonly pitchBendEvents:
    readonly MidiPitchBendEvent[];
  readonly tempoEvents: readonly MidiTempoEvent[];
  readonly timeSignatureEvents: readonly MidiTimeSignatureEvent[];
  readonly keySignatureEvents: readonly MidiKeySignatureEvent[];
}

export type MidiParserDiagnosticCode =
  | "TRAILING_ASCII_WHITESPACE_IGNORED";

export interface MidiParserDiagnostic {
  readonly code:
    MidiParserDiagnosticCode;
  readonly message: string;
}

export interface MidiParserSuccess {
  readonly ok: true;
  readonly source: MidiSemanticSource;
  readonly diagnostics:
    readonly MidiParserDiagnostic[];
}

export type MidiParserResult =
  | MidiParserSuccess
  | MidiParserFailure;
