import {
  parseStandardMidiFile,
} from "./smf-parser.js";

import {
  selectMidiSourceLine,
} from "./midi-source-line.js";

import type {
  MidiSourceLineSelection,
} from "./midi-source-line.js";

import {
  reduceMidiToGlobalPianoRoll,
} from "./midi-piano-roll-reducer.js";

import type {
  MidiPianoRollReductionDiagnostic,
} from "./midi-piano-roll-reducer.js";

import {
  GENERIC_MIDI_IN_ACCORD_PROFILE_ID,
  GENERIC_MIDI_PART_MEASURE_IN_ACCORD_PROFILE_ID,
  GENERIC_MIDI_SHARED_BOUNDARY_RHYTHM_PROFILE_ID,
  buildNotationScore,
} from "./notation-builder.js";

import type {
  MidiParserDiagnostic,
  MidiParserFailureCode,
  MidiSemanticSource,
} from "./types.js";

import type {
  NotationBuildFailureCode,
  NotationDiagnostic,
  NotationDuration,
  NotationLinearMeasureEvent,
  NotationMeasureEvent,
  NotationPart,
  NotationScore,
} from "./notation-types.js";

import type {
  MusicValue,
} from "./music-braille-atomic-encoder.js";

import {
  MIDI_CHORD_PROFILE_ID,
  MIDI_STATEFUL_PROFILE_ID,
  encodeStatefulScore,
} from "./music-braille-stateful-encoder.js";

import type {
  StatefulChordEvent,
  StatefulFullMeasureInAccordEvent,
  StatefulPartMeasureInAccordEvent,
  StatefulInAccordAction,
  StatefulLinearMusicEvent,
  StatefulMusicEvent,
  StatefulNoteEvent,
  StatefulRestEvent,
  StatefulScoreEmission,
  StatefulScoreInput,
} from "./music-braille-stateful-encoder.js";

export const MIDI_TO_BRAILLE_BRIDGE_ID =
  "MIDI_TO_MBC2015_UNICODE_V1" as const;

export const MIDI_PART_TRANSPORT_LAYOUT_ID =
  "SOURCE_PARTS_NEWLINE_TRANSPORT_V1" as const;

export type MidiToBrailleFailureCode =
  | MidiParserFailureCode
  | NotationBuildFailureCode
  | "MIDI_SOURCE_LINE_NOT_FOUND"
  | "UNSUPPORTED_PITCH_BEND"
  | "UNSUPPORTED_MUSIC_BRAILLE_CONSTRUCT"
  | "MUSIC_BRAILLE_ENCODING_FAILED";

export type MidiToBrailleFailureStage =
  | "parser"
  | "classification"
  | "notation"
  | "bridge"
  | "encoder";

export type MidiToBrailleDiagnosticCode =
  | NotationDiagnostic["code"]
  | MidiPianoRollReductionDiagnostic["code"]
  | MidiParserDiagnostic["code"]
  | "PITCH_SPELLING_CANONICALIZED"
  | "TEMPO_METADATA_ABSENT"
  | "KEY_SIGNATURE_ABSENT"
  | "METER_CHANGE_SERIALIZED";

export interface MidiToBrailleDiagnostic {
  readonly code: MidiToBrailleDiagnosticCode;
  readonly message: string;
  readonly trackIndex?: number;
  readonly channel?: number;
  readonly sourceStartTick?: number;
  readonly sourceEndTick?: number;
}

export interface MidiBraillePartEmission {
  readonly trackIndex: number;
  readonly channel: number;
  readonly brf: string;
  readonly unicodeBraille: string;
  readonly profileId: typeof MIDI_STATEFUL_PROFILE_ID;
  readonly chordProfileId: typeof MIDI_CHORD_PROFILE_ID;
  readonly profileDisclosureRequired: true;
  readonly trace: StatefulScoreEmission["trace"];
}

export interface MidiToBrailleSuccess {
  readonly ok: true;
  readonly bridgeId: typeof MIDI_TO_BRAILLE_BRIDGE_ID;
  readonly transportLayoutId: typeof MIDI_PART_TRANSPORT_LAYOUT_ID;
  readonly format: 0 | 1;
  readonly ticksPerQuarterNote: number;
  readonly parts: readonly MidiBraillePartEmission[];
  readonly brf: string;
  readonly unicodeBraille: string;
  readonly diagnostics: readonly MidiToBrailleDiagnostic[];
}

export interface MidiToBrailleFailure {
  readonly ok: false;
  readonly code: MidiToBrailleFailureCode;
  readonly stage: MidiToBrailleFailureStage;
  readonly message: string;
  readonly byteOffset?: number;
  readonly trackIndex?: number;
  readonly channel?: number;
  readonly sourceTick?: number;
}

export type MidiToBrailleResult =
  | MidiToBrailleSuccess
  | MidiToBrailleFailure;

interface DurationProjection {
  readonly value: MusicValue;
  readonly augmentationDots: number;
  readonly triplet: boolean;
}

interface AdaptedEvent {
  event: StatefulLinearMusicEvent;
  readonly triplet: boolean;
}

interface AdaptedPart {
  readonly input: StatefulScoreInput;
  readonly trackIndex: number;
  readonly channel: number;
}

type BridgeResult<T> =
  | Readonly<{ ok: true; value: T }>
  | Readonly<{ ok: false; failure: MidiToBrailleFailure }>;

function failure(
  code: MidiToBrailleFailureCode,
  stage: MidiToBrailleFailureStage,
  message: string,
  details: Readonly<{
    byteOffset?: number;
    trackIndex?: number;
    channel?: number;
    sourceTick?: number;
  }> = {},
): MidiToBrailleFailure {
  return Object.freeze({
    ok: false,
    code,
    stage,
    message,
    ...details,
  });
}

function bridgeFailure(
  message: string,
): BridgeResult<never> {
  return Object.freeze({
    ok: false,
    failure: failure(
      "UNSUPPORTED_MUSIC_BRAILLE_CONSTRUCT",
      "bridge",
      message,
    ),
  });
}

function projectDuration(
  duration: NotationDuration,
): DurationProjection {
  switch (duration.name) {
    case "dotted-whole":
      return { value: "whole", augmentationDots: 1, triplet: false };
    case "whole":
      return { value: "whole", augmentationDots: 0, triplet: false };
    case "dotted-half":
      return { value: "half", augmentationDots: 1, triplet: false };
    case "half":
      return { value: "half", augmentationDots: 0, triplet: false };
    case "half-triplet":
      return { value: "half", augmentationDots: 0, triplet: true };
    case "dotted-quarter":
      return { value: "quarter", augmentationDots: 1, triplet: false };
    case "quarter":
      return { value: "quarter", augmentationDots: 0, triplet: false };
    case "quarter-triplet":
      return { value: "quarter", augmentationDots: 0, triplet: true };
    case "dotted-eighth":
      return { value: "eighth", augmentationDots: 1, triplet: false };
    case "eighth":
      return { value: "eighth", augmentationDots: 0, triplet: false };
    case "eighth-triplet":
      return { value: "eighth", augmentationDots: 0, triplet: true };
    case "dotted-sixteenth":
      return { value: "16th", augmentationDots: 1, triplet: false };
    case "sixteenth":
      return { value: "16th", augmentationDots: 0, triplet: false };
    case "sixteenth-triplet":
      return { value: "16th", augmentationDots: 0, triplet: true };
    case "dotted-thirty-second":
      return { value: "32nd", augmentationDots: 1, triplet: false };
    case "thirty-second":
      return { value: "32nd", augmentationDots: 0, triplet: false };
    case "thirty-second-triplet":
      return { value: "32nd", augmentationDots: 0, triplet: true };
    case "dotted-sixty-fourth":
      return { value: "64th", augmentationDots: 1, triplet: false };
    case "sixty-fourth":
      return { value: "64th", augmentationDots: 0, triplet: false };
  }
}

function withTripletStart(
  event: StatefulLinearMusicEvent,
): StatefulLinearMusicEvent {
  if (event.kind === "note") {
    return Object.freeze({
      ...event,
      tripletStart: true,
    });
  }

  if (event.kind === "rest") {
    return Object.freeze({
      ...event,
      tripletStart: true,
    });
  }

  return Object.freeze({
    ...event,
    tripletStart: true,
  });
}

function resolveInitialKey(
  score: NotationScore,
): BridgeResult<number | undefined> {
  const events =
    score.sourceKeySignatureEvents;

  if (events.length === 0) {
    return Object.freeze({
      ok: true,
      value: undefined,
    });
  }

  for (const event of events) {
    if (event.tick !== 0) {
      return bridgeFailure(
        "Phase 14.7 cannot yet serialize a key-signature change after tick 0.",
      );
    }
  }

  const first = events[0];

  if (first === undefined) {
    return Object.freeze({
      ok: true,
      value: undefined,
    });
  }

  for (const event of events.slice(1)) {
    if (
      event.sharpsFlats !== first.sharpsFlats
    ) {
      return bridgeFailure(
        "Conflicting key signatures occur at the initial MIDI position.",
      );
    }
  }

  return Object.freeze({
    ok: true,
    value: first.sharpsFlats,
  });
}

function resolveInitialMeter(
  score: NotationScore,
): BridgeResult<
  Readonly<{
    numerator: number;
    denominator: number;
  }> | undefined
> {
  const events =
    score.sourceTimeSignatureEvents.filter(
      (event) =>
        event.tick === 0,
    );

  if (events.length === 0) {
    return Object.freeze({
      ok: true,
      value: undefined,
    });
  }

  const first = events[0];

  if (first === undefined) {
    return Object.freeze({
      ok: true,
      value: undefined,
    });
  }

  for (const event of events.slice(1)) {
    if (
      event.numerator !== first.numerator
      || event.denominator !== first.denominator
    ) {
      return bridgeFailure(
        "Conflicting meters occur at the initial MIDI position.",
      );
    }
  }

  return Object.freeze({
    ok: true,
    value: Object.freeze({
      numerator: first.numerator,
      denominator: first.denominator,
    }),
  });
}

function adaptNotationEvent(
  event: NotationLinearMeasureEvent,
): BridgeResult<AdaptedEvent> {
  if (event.kind === "rest") {
    const duration =
      projectDuration(event.duration);

    const stateful: StatefulRestEvent =
      Object.freeze({
        kind: "rest",
        value: duration.value,
        ...(duration.augmentationDots > 0
          ? { augmentationDots: duration.augmentationDots }
          : {}),
        ...(event.transcriberAdded === true
          ? { transcriberAdded: true as const }
          : {}),
      });

    return Object.freeze({
      ok: true,
      value: {
        event: stateful,
        triplet: duration.triplet,
      },
    });
  }

  if (event.kind === "note") {
    const duration =
      projectDuration(event.duration);

    const stateful: StatefulNoteEvent =
      Object.freeze({
        kind: "note",
        midiPitch:
          event.pitch.midiNoteNumber,
        value: duration.value,
        ...(duration.augmentationDots > 0
          ? { augmentationDots: duration.augmentationDots }
          : {}),
        ...(event.tieToNext
          ? { tie: true }
          : {}),
      });

    return Object.freeze({
      ok: true,
      value: {
        event: stateful,
        triplet: duration.triplet,
      },
    });
  }

  const first =
    event.notes[0];

  if (first === undefined) {
    return bridgeFailure(
      "Notation chord contains no notes.",
    );
  }

  const firstDuration =
    first.duration;

  for (const note of event.notes.slice(1)) {
    if (
      note.duration.name
      !== firstDuration.name
    ) {
      return bridgeFailure(
        "A chord contains notes with different quantized duration classes.",
      );
    }
  }

  const tieCount =
    event.notes.filter(
      (note) =>
        note.tieToNext,
    ).length;

  if (
    tieCount !== 0
    && tieCount !== event.notes.length
  ) {
    return bridgeFailure(
      "Partial chord ties are not representable by the Phase 14.6b whole-chord tie surface.",
    );
  }

  const duration =
    projectDuration(firstDuration);

  const stateful: StatefulChordEvent =
    Object.freeze({
      kind: "chord",
      midiPitches:
        Object.freeze(
          event.notes.map(
            (note) =>
              note.pitch.midiNoteNumber,
          ),
        ),
      value: duration.value,
      ...(duration.augmentationDots > 0
        ? { augmentationDots: duration.augmentationDots }
        : {}),
      ...(tieCount === event.notes.length
        ? { tieAll: true }
        : {}),
    });

  return Object.freeze({
    ok: true,
    value: {
      event: stateful,
      triplet: duration.triplet,
    },
  });
}

function applyTripletGrouping(
  measures:
    Array<{
      events: AdaptedEvent[];
    }>,
): BridgeResult<void> {
  const run:
    Array<{
      measureIndex: number;
      eventIndex: number;
    }> = [];

  const flush = (): BridgeResult<void> => {
    if (run.length === 0) {
      return Object.freeze({
        ok: true,
        value: undefined,
      });
    }

    if (run.length % 3 !== 0) {
      return bridgeFailure(
        "Triplet-duration events are not recoverable as complete groups of three from the current MIDI notation model.",
      );
    }

    for (
      let index = 0;
      index < run.length;
      index += 3
    ) {
      const location =
        run[index];

      if (location === undefined) {
        return bridgeFailure(
          "Internal triplet grouping location is unavailable.",
        );
      }

      const measure =
        measures[location.measureIndex];
      const adapted =
        measure?.events[location.eventIndex];

      if (
        measure === undefined
        || adapted === undefined
      ) {
        return bridgeFailure(
          "Internal triplet grouping location is outside the adapted measure set.",
        );
      }

      adapted.event =
        withTripletStart(
          adapted.event,
        );
    }

    run.length = 0;

    return Object.freeze({
      ok: true,
      value: undefined,
    });
  };

  for (
    let measureIndex = 0;
    measureIndex < measures.length;
    measureIndex += 1
  ) {
    const measure =
      measures[measureIndex];

    if (measure === undefined) {
      return bridgeFailure(
        "Adapted measure is unavailable.",
      );
    }

    for (
      let eventIndex = 0;
      eventIndex < measure.events.length;
      eventIndex += 1
    ) {
      const adapted =
        measure.events[eventIndex];

      if (adapted === undefined) {
        return bridgeFailure(
          "Adapted event is unavailable.",
        );
      }

      if (adapted.triplet) {
        run.push({
          measureIndex,
          eventIndex,
        });
        continue;
      }

      const flushed =
        flush();

      if (flushed.ok === false) {
        return Object.freeze({
          ok: false,
          failure: flushed.failure,
        });
      }
    }

    // Do not infer a triplet group across a measure boundary. The current
    // MIDI notation model preserves triplet duration but not the original
    // beaming/group object, so a cross-measure grouping would be guesswork.
    const measureFlushed =
      flush();

    if (measureFlushed.ok === false) {
      return Object.freeze({
        ok: false,
        failure: measureFlushed.failure,
      });
    }
  }

  return Object.freeze({
    ok: true,
    value: undefined,
  });
}

function adaptLinearEvents(
  events:
    readonly NotationLinearMeasureEvent[],
): BridgeResult<readonly StatefulLinearMusicEvent[]> {
  const adaptedEvents:
    AdaptedEvent[] = [];

  for (const event of events) {
    const adapted =
      adaptNotationEvent(event);

    if (adapted.ok === false) {
      return Object.freeze({
        ok: false,
        failure: adapted.failure,
      });
    }

    adaptedEvents.push(
      adapted.value,
    );
  }

  const measures = [
    {
      events:
        adaptedEvents,
    },
  ];

  const triplets =
    applyTripletGrouping(
      measures,
    );

  if (triplets.ok === false) {
    return Object.freeze({
      ok: false,
      failure: triplets.failure,
    });
  }

  return Object.freeze({
    ok: true,
    value:
      Object.freeze(
        adaptedEvents.map(
          (item) => item.event,
        ),
      ),
  });
}

function adaptPart(
  part: NotationPart,
  keySharpsFlats: number | undefined,
  meter:
    Readonly<{
      numerator: number;
      denominator: number;
    }> | undefined,
): BridgeResult<AdaptedPart> {
  if (part.measures.length === 0) {
    return bridgeFailure(
      "Notation part contains no measures.",
    );
  }

  const measures:
    Array<{
      meter?: Readonly<{
        numerator: number;
        denominator: number;
      }>;
      events: StatefulMusicEvent[];
    }> = [];

  for (
    let measureIndex = 0;
    measureIndex < part.measures.length;
    measureIndex += 1
  ) {
    const measure =
      part.measures[
        measureIndex
      ]!;

    const previousMeasure =
      measureIndex > 0
        ? part.measures[
            measureIndex - 1
          ]
        : undefined;

    const meterChange =
      previousMeasure !== undefined
      && (
        previousMeasure.numerator
          !== measure.numerator
        || previousMeasure.denominator
          !== measure.denominator
      )
        ? Object.freeze({
            numerator:
              measure.numerator,
            denominator:
              measure.denominator,
          })
        : undefined;
    const inAccordEvents =
      measure.events.filter(
        (event) =>
          event.kind
          === "full-measure-in-accord"
          || event.kind
          === "part-measure-in-accord",
      );

    if (inAccordEvents.length > 0) {
      if (
        measure.events.length !== 1
        || inAccordEvents.length !== 1
      ) {
        return bridgeFailure(
          "An in-accord must be the sole top-level event in its derived measure.",
        );
      }

      const sourceInAccord =
        inAccordEvents[0];

      if (
        sourceInAccord === undefined
        || (
          sourceInAccord.kind
          !== "full-measure-in-accord"
          && sourceInAccord.kind
          !== "part-measure-in-accord"
        )
      ) {
        return bridgeFailure(
          "Derived in-accord event is unavailable.",
        );
      }

      const actions:
        StatefulInAccordAction[] = [];

      for (
        const sourceAction
        of sourceInAccord.actions
      ) {
        const adaptedAction =
          adaptLinearEvents(
            sourceAction.events,
          );

        if (adaptedAction.ok === false) {
          return Object.freeze({
            ok: false,
            failure:
              adaptedAction.failure,
          });
        }

        actions.push(
          Object.freeze({
            events:
              adaptedAction.value,
          }),
        );
      }

      const frozenActions =
        Object.freeze(
          actions,
        );

      const inAccord:
        | StatefulFullMeasureInAccordEvent
        | StatefulPartMeasureInAccordEvent =
          sourceInAccord.kind
          === "full-measure-in-accord"
            ? Object.freeze({
                kind:
                  "full-measure-in-accord",
                actions:
                  frozenActions,
              })
            : Object.freeze({
                kind:
                  "part-measure-in-accord",
                actions:
                  frozenActions,
              });

      measures.push({
        ...(meterChange !== undefined
          ? { meter: meterChange }
          : {}),
        events: [inAccord],
      });
      continue;
    }

    const linearEvents =
      measure.events as
        readonly NotationLinearMeasureEvent[];

    const adaptedLinear =
      adaptLinearEvents(
        linearEvents,
      );

    if (adaptedLinear.ok === false) {
      return Object.freeze({
        ok: false,
        failure:
          adaptedLinear.failure,
      });
    }

    measures.push({
      ...(meterChange !== undefined
        ? { meter: meterChange }
        : {}),
      events:
        [...adaptedLinear.value],
    });
  }

  const input:
    StatefulScoreInput =
      Object.freeze({
        ...(keySharpsFlats !== undefined
          ? { keySharpsFlats }
          : {}),
        ...(meter !== undefined
          ? { meter }
          : {}),
        measures:
          Object.freeze(
            measures.map(
              (measure) =>
                Object.freeze({
                  ...(measure.meter !== undefined
                    ? {
                        meter:
                          measure.meter,
                      }
                    : {}),
                  events:
                    Object.freeze(
                      [...measure.events],
                    ),
                }),
            ),
          ),
      });

  return Object.freeze({
    ok: true,
    value: Object.freeze({
      input,
      trackIndex:
        part.trackIndex,
      channel:
        part.channel,
    }),
  });
}

function diagnosticFromParser(
  diagnostic:
    MidiParserDiagnostic,
): MidiToBrailleDiagnostic {
  return Object.freeze({
    code:
      diagnostic.code,
    message:
      diagnostic.message,
  });
}

function diagnosticFromReduction(
  diagnostic:
    MidiPianoRollReductionDiagnostic,
): MidiToBrailleDiagnostic {
  return Object.freeze({
    code:
      diagnostic.code,
    message:
      diagnostic.message,
  });
}

function diagnosticFromNotation(
  diagnostic: NotationDiagnostic,
): MidiToBrailleDiagnostic {
  return Object.freeze({
    code: diagnostic.code,
    message: diagnostic.message,
    ...(diagnostic.trackIndex !== undefined
      ? { trackIndex: diagnostic.trackIndex }
      : {}),
    ...(diagnostic.channel !== undefined
      ? { channel: diagnostic.channel }
      : {}),
    ...(diagnostic.sourceStartTick !== undefined
      ? { sourceStartTick: diagnostic.sourceStartTick }
      : {}),
    ...(diagnostic.sourceEndTick !== undefined
      ? { sourceEndTick: diagnostic.sourceEndTick }
      : {}),
  });
}

function buildDiagnostics(
  source: MidiSemanticSource,
  score: NotationScore,
  parserDiagnostics:
    readonly MidiParserDiagnostic[],
  reductionDiagnostics:
    readonly MidiPianoRollReductionDiagnostic[],
): readonly MidiToBrailleDiagnostic[] {
  const diagnostics:
    MidiToBrailleDiagnostic[] = [
      ...parserDiagnostics.map(
        diagnosticFromParser,
      ),
      ...reductionDiagnostics.map(
        diagnosticFromReduction,
      ),
      ...score.diagnostics
        .filter(
          (diagnostic) =>
            diagnostic.code
            !== "SOURCE_PART_DERIVED_FROM_TRACK_CHANNEL",
        )
        .map(
          diagnosticFromNotation,
        ),
    ];

  if (source.tempoEvents.length === 0) {
    diagnostics.push(
      Object.freeze({
        code: "TEMPO_METADATA_ABSENT",
        message:
          "No MIDI tempo metadata was present. Tempo is not synthesized for Music Braille output.",
      }),
    );
  }

  if (source.keySignatureEvents.length === 0) {
    diagnostics.push(
      Object.freeze({
        code: "KEY_SIGNATURE_ABSENT",
        message:
          "No MIDI key signature was present. C-major/A-minor context is used only for deterministic pitch spelling and is not rendered as a source key signature.",
      }),
    );
  }

  const hasSerializedMeterChange =
    score.parts.some(
      (part) =>
        part.measures.some(
          (
            measure,
            index,
          ) => {
            const previous =
              index > 0
                ? part.measures[
                    index - 1
                  ]
                : undefined;

            return (
              previous !== undefined
              && (
                previous.numerator
                  !== measure.numerator
                || previous.denominator
                  !== measure.denominator
              )
            );
          },
        ),
    );

  if (hasSerializedMeterChange) {
    diagnostics.push(
      Object.freeze({
        code:
          "METER_CHANGE_SERIALIZED",
        message:
          "A boundary-aligned MIDI meter change was serialized with the frozen numeric simple-meter profile; original common/cut-time print symbols are not inferred.",
      }),
    );
  }

  diagnostics.push(
    Object.freeze({
      code:
        "PITCH_SPELLING_CANONICALIZED",
      message:
        "MIDI pitch numbers do not preserve original enharmonic spelling; KEY_SIGNATURE_DISTANCE_V1 canonicalization was applied.",
    }),
  );

  if (
    !diagnostics.some(
      (diagnostic) =>
        diagnostic.code
        === "LOSSY_MIDI_TO_NOTATION_RECONSTRUCTION",
    )
  ) {
    diagnostics.push(
      Object.freeze({
        code:
          "LOSSY_MIDI_TO_NOTATION_RECONSTRUCTION",
        message:
          "MIDI does not preserve print-only notation semantics; the Phase 14 MIDI profile emits only supported recoverable notation.",
      }),
    );
  }

  return Object.freeze(
    diagnostics,
  );
}

function freezePartEmission(
  part: AdaptedPart,
  emission: StatefulScoreEmission,
): MidiBraillePartEmission {
  return Object.freeze({
    trackIndex:
      part.trackIndex,
    channel:
      part.channel,
    brf:
      emission.brf,
    unicodeBraille:
      emission.unicode,
    profileId:
      emission.profileId,
    chordProfileId:
      emission.chordProfileId,
    profileDisclosureRequired:
      emission.profileDisclosureRequired,
    trace:
      emission.trace,
  });
}

export function translateMidiToBraille(
  input:
    | Uint8Array
    | ArrayBuffer,
  sourceLine?:
    MidiSourceLineSelection,
): MidiToBrailleResult {
  const parsed =
    parseStandardMidiFile(
      input,
    );

  if (parsed.ok === false) {
    return failure(
      parsed.code,
      "parser",
      parsed.message,
      parsed.location !== undefined
        ? {
            byteOffset:
              parsed.location.byteOffset,
          }
        : {},
    );
  }

  const selectedSource =
    sourceLine === undefined
      ? parsed.source
      : selectMidiSourceLine(
          parsed.source,
          sourceLine,
        );

  if (selectedSource === null) {
    return failure(
      "MIDI_SOURCE_LINE_NOT_FOUND",
      "bridge",
      `The selected MIDI source line does not exist or contains no notes: track ${sourceLine!.trackIndex}, channel ${sourceLine!.channel + 1}.`,
      {
        trackIndex:
          sourceLine!.trackIndex,
        channel:
          sourceLine!.channel,
      },
    );
  }

  const reduced =
    reduceMidiToGlobalPianoRoll(
      selectedSource,
    );

  const notation =
    buildNotationScore(
      reduced.source,
      {
        polyphonyProfile:
          GENERIC_MIDI_IN_ACCORD_PROFILE_ID,
        partMeasureInAccordProfile:
          GENERIC_MIDI_PART_MEASURE_IN_ACCORD_PROFILE_ID,
        rhythmProfile:
          GENERIC_MIDI_SHARED_BOUNDARY_RHYTHM_PROFILE_ID,
      },
    );

  if (notation.ok === false) {
    return failure(
      notation.code,
      "notation",
      notation.message,
      {
        ...(notation.trackIndex !== undefined
          ? { trackIndex: notation.trackIndex }
          : {}),
        ...(notation.channel !== undefined
          ? { channel: notation.channel }
          : {}),
        ...(notation.sourceTick !== undefined
          ? { sourceTick: notation.sourceTick }
          : {}),
      },
    );
  }

  const key =
    resolveInitialKey(
      notation.score,
    );

  if (key.ok === false) {
    return key.failure;
  }

  const meter =
    resolveInitialMeter(
      notation.score,
    );

  if (meter.ok === false) {
    return meter.failure;
  }

  const adaptedParts:
    AdaptedPart[] = [];

  for (
    const part
    of notation.score.parts
  ) {
    const adapted =
      adaptPart(
        part,
        key.value,
        meter.value,
      );

    if (adapted.ok === false) {
      return adapted.failure;
    }

    adaptedParts.push(
      adapted.value,
    );
  }

  if (adaptedParts.length === 0) {
    return failure(
      "NO_MUSICAL_NOTES",
      "bridge",
      "NotationScore contains no source parts.",
    );
  }

  const emissions:
    MidiBraillePartEmission[] = [];

  try {
    for (
      const part
      of adaptedParts
    ) {
      const encoded =
        encodeStatefulScore(
          part.input,
        );

      emissions.push(
        freezePartEmission(
          part,
          encoded,
        ),
      );
    }
  } catch (error) {
    if (
      error instanceof Error
      && error.message.startsWith(
        "MUSIC_BRAILLE_",
      )
    ) {
      return failure(
        "MUSIC_BRAILLE_ENCODING_FAILED",
        "encoder",
        error.message,
      );
    }

    throw error;
  }

  const parts =
    Object.freeze(
      emissions,
    );

  return Object.freeze({
    ok: true,
    bridgeId:
      MIDI_TO_BRAILLE_BRIDGE_ID,
    transportLayoutId:
      MIDI_PART_TRANSPORT_LAYOUT_ID,
    format:
      reduced.source.format,
    ticksPerQuarterNote:
      reduced.source.ticksPerQuarterNote,
    parts,
    brf:
      parts.map(
        (part) =>
          part.brf,
      ).join("\n"),
    unicodeBraille:
      parts.map(
        (part) =>
          part.unicodeBraille,
      ).join("\n"),
    diagnostics:
      buildDiagnostics(
        reduced.source,
        notation.score,
        parsed.diagnostics,
        reduced.diagnostics,
      ),
  });
}

export function translateMidiSourceLineToBraille(
  input:
    | Uint8Array
    | ArrayBuffer,
  sourceLine:
    MidiSourceLineSelection,
): MidiToBrailleResult {
  return translateMidiToBraille(
    input,
    sourceLine,
  );
}
