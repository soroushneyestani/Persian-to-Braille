import type {
  MidiKeySignatureEvent,
  MidiTempoEvent,
  MidiTimeSignatureEvent,
} from "./types.js";

export const NOTATION_UNITS_PER_QUARTER =
  96 as const;

export type NotationDiagnosticCode =
  | "RHYTHM_QUANTIZED"
  | "RHYTHM_BOUNDARY_COHERENCE_QUANTIZED"
  | "ZERO_DURATION_MIDI_NOTE_OMITTED"
  | "TIME_SIGNATURE_ABSENT"
  | "SOURCE_PART_DERIVED_FROM_TRACK_CHANNEL"
  | "INFERRED_MIDI_VOICE_PARTITION"
  | "IN_ACCORD_ORDER_CANONICALIZED_NO_STAFF"
  | "TRANSCRIBER_ADDED_IN_ACCORD_REST"
  | "PART_MEASURE_IN_ACCORD_DERIVED"
  | "LOSSY_MIDI_TO_NOTATION_RECONSTRUCTION";

export interface NotationDiagnostic {
  readonly code:
    NotationDiagnosticCode;
  readonly message: string;
  readonly trackIndex?: number;
  readonly channel?: number;
  readonly sourceStartTick?: number;
  readonly sourceEndTick?: number;
}

export type NotationDurationName =
  | "dotted-whole"
  | "whole"
  | "dotted-half"
  | "half"
  | "half-triplet"
  | "dotted-quarter"
  | "quarter"
  | "quarter-triplet"
  | "dotted-eighth"
  | "eighth"
  | "eighth-triplet"
  | "dotted-sixteenth"
  | "sixteenth"
  | "sixteenth-triplet"
  | "dotted-thirty-second"
  | "thirty-second"
  | "thirty-second-triplet"
  | "dotted-sixty-fourth"
  | "sixty-fourth";

export interface NotationDuration {
  readonly name:
    NotationDurationName;
  readonly units: number;
  readonly dotted: boolean;
  readonly triplet: boolean;
}

export interface NotationPitchSource {
  readonly midiNoteNumber: number;
  readonly pitchClass: number;
  readonly midiOctave: number;
}

export interface NotationNote {
  readonly kind: "note";
  readonly startUnit: number;
  readonly endUnit: number;
  readonly duration:
    NotationDuration;
  readonly pitch:
    NotationPitchSource;
  readonly velocity: number;
  readonly sourceStartTick: number;
  readonly sourceEndTick: number;
  readonly tieFromPrevious: boolean;
  readonly tieToNext: boolean;
}

export interface NotationChord {
  readonly kind: "chord";
  readonly startUnit: number;
  readonly endUnit: number;
  readonly notes:
    readonly NotationNote[];
}

export interface NotationRest {
  readonly kind: "rest";
  readonly startUnit: number;
  readonly endUnit: number;
  readonly duration:
    NotationDuration;
  readonly transcriberAdded?: true;
}

export type NotationLinearMeasureEvent =
  | NotationNote
  | NotationChord
  | NotationRest;

export interface NotationInAccordAction {
  readonly stableIndex: number;
  readonly anchorMidiPitch: number;
  readonly highestMidiPitch: number;
  readonly events:
    readonly NotationLinearMeasureEvent[];
}

export interface NotationFullMeasureInAccord {
  readonly kind:
    "full-measure-in-accord";
  readonly startUnit: number;
  readonly endUnit: number;
  readonly actions:
    readonly NotationInAccordAction[];
}

export interface NotationPartMeasureInAccord {
  readonly kind:
    "part-measure-in-accord";
  readonly startUnit: number;
  readonly endUnit: number;
  readonly actions:
    readonly NotationInAccordAction[];
}

export type NotationMeasureEvent =
  | NotationLinearMeasureEvent
  | NotationFullMeasureInAccord
  | NotationPartMeasureInAccord;

export interface NotationMeasure {
  readonly index: number;
  readonly startUnit: number;
  readonly endUnit: number;
  readonly numerator: number;
  readonly denominator: number;
  readonly timeSignatureFromSource:
    boolean;
  readonly events:
    readonly NotationMeasureEvent[];
}

export interface NotationPart {
  readonly trackIndex: number;
  readonly channel: number;
  readonly measures:
    readonly NotationMeasure[];
}

export interface NotationScore {
  readonly unitsPerQuarter:
    typeof NOTATION_UNITS_PER_QUARTER;
  readonly parts:
    readonly NotationPart[];
  readonly diagnostics:
    readonly NotationDiagnostic[];
  readonly sourceTempoEvents:
    readonly MidiTempoEvent[];
  readonly sourceTimeSignatureEvents:
    readonly MidiTimeSignatureEvent[];
  readonly sourceKeySignatureEvents:
    readonly MidiKeySignatureEvent[];
}

export type NotationBuildFailureCode =
  | "UNQUANTIZABLE_RHYTHM"
  | "RHYTHM_COMPLEXITY_LIMIT_EXCEEDED"
  | "UNSUPPORTED_POLYPHONY"
  | "UNSUPPORTED_MUSIC_BRAILLE_CONSTRUCT";

export interface NotationBuildFailure {
  readonly ok: false;
  readonly code:
    NotationBuildFailureCode;
  readonly message: string;
  readonly trackIndex?: number;
  readonly channel?: number;
  readonly sourceTick?: number;
}

export interface NotationBuildSuccess {
  readonly ok: true;
  readonly score:
    NotationScore;
}

export type NotationBuildResult =
  | NotationBuildSuccess
  | NotationBuildFailure;
