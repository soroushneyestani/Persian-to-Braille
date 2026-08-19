import type {
  MidiNote,
  MidiSemanticSource,
  MidiSourcePart,
  MidiTimeSignatureEvent,
} from "./types.js";

import {
  NOTATION_UNITS_PER_QUARTER,
} from "./notation-types.js";

import type {
  NotationBuildFailure,
  NotationBuildResult,
  NotationChord,
  NotationDiagnostic,
  NotationDuration,
  NotationFullMeasureInAccord,
  NotationInAccordAction,
  NotationPartMeasureInAccord,
  NotationLinearMeasureEvent,
  NotationMeasure,
  NotationMeasureEvent,
  NotationNote,
  NotationPart,
  NotationPitchSource,
  NotationRest,
} from "./notation-types.js";

import {
  MAX_QUANTIZATION_ERROR_UNITS,
  decomposeExactDurationUnits,
  quantizeMidiNote,
  quantizeMidiTick,
} from "./quantization.js";

interface QuantizedSourceNote {
  readonly note: MidiNote;
  readonly startUnit: number;
  readonly endUnit: number;
}

interface MeasureBoundary {
  readonly index: number;
  readonly startUnit: number;
  readonly endUnit: number;
  readonly numerator: number;
  readonly denominator: number;
  readonly timeSignatureFromSource:
    boolean;
}

interface TimeSignatureChange {
  readonly unit: number;
  readonly numerator: number;
  readonly denominator: number;
  readonly fromSource: boolean;
}

export const GENERIC_MIDI_IN_ACCORD_PROFILE_ID =
  "GENERIC_MIDI_HIGH_TO_LOW_IN_ACCORD_V1" as const;

export const GENERIC_MIDI_SHARED_BOUNDARY_RHYTHM_PROFILE_ID =
  "GENERIC_MIDI_SHARED_BOUNDARY_RHYTHM_V1" as const;

const GLOBAL_PIANO_ROLL_CYCLIC_SEARCH_VISIT_LIMIT =
  100_000;

export const GENERIC_MIDI_PART_MEASURE_IN_ACCORD_PROFILE_ID =
  "GENERIC_MIDI_INCOMPLETE_MEASURE_PART_IN_ACCORD_V1" as const;

export interface NotationBuildOptions {
  readonly polyphonyProfile?:
    | "reject"
    | typeof GENERIC_MIDI_IN_ACCORD_PROFILE_ID;
  readonly partMeasureInAccordProfile?:
    typeof GENERIC_MIDI_PART_MEASURE_IN_ACCORD_PROFILE_ID;
  readonly rhythmProfile?:
    typeof GENERIC_MIDI_SHARED_BOUNDARY_RHYTHM_PROFILE_ID;
}

type RhythmQuantizationOverrideMap =
  ReadonlyMap<
    MidiNote,
    QuantizedSourceNote
  >;

interface MeasureOnsetGroup {
  readonly startUnit: number;
  readonly endUnit: number;
  readonly anchorMidiPitch: number;
  readonly highestMidiPitch: number;
  readonly items: readonly QuantizedSourceNote[];
}

interface DerivedAction {
  readonly stableIndex: number;
  readonly groups: MeasureOnsetGroup[];
  lastEndUnit: number;
  lastAnchorMidiPitch: number;
  highestMidiPitch: number;
}

function failure(
  code:
    NotationBuildFailure["code"],
  message: string,
  fields: {
    readonly trackIndex?: number;
    readonly channel?: number;
    readonly sourceTick?: number;
  } = {},
): NotationBuildFailure {
  return Object.freeze({
    ok: false as const,
    code,
    message,
    ...fields,
  });
}

function isNotationBuildFailure(
  value: unknown,
): value is NotationBuildFailure {
  return (
    typeof value === "object"
    && value !== null
    && !Array.isArray(
      value,
    )
    && "ok" in value
    && (
      value as {
        readonly ok?: unknown;
      }
    ).ok === false
  );
}

function pitchSource(
  midiNoteNumber: number,
): NotationPitchSource {
  return Object.freeze({
    midiNoteNumber,
    pitchClass:
      midiNoteNumber % 12,
    midiOctave:
      Math.floor(
        midiNoteNumber / 12,
      ) - 1,
  });
}

function measureLengthUnits(
  numerator: number,
  denominator: number,
): number | null {
  if (
    !Number.isInteger(
      numerator,
    )
    || numerator <= 0
    || !Number.isInteger(
      denominator,
    )
    || denominator <= 0
  ) {
    return null;
  }

  const numeratorUnits =
    numerator
    * 4
    * NOTATION_UNITS_PER_QUARTER;

  if (
    numeratorUnits
    % denominator
    !== 0
  ) {
    return null;
  }

  const value =
    numeratorUnits
    / denominator;

  return value > 0
    ? value
    : null;
}

function normalizeTimeSignatureChanges(
  source:
    MidiSemanticSource,
  diagnostics:
    NotationDiagnostic[],
):
  | readonly TimeSignatureChange[]
  | NotationBuildFailure {
  const byUnit =
    new Map<
      number,
      TimeSignatureChange
    >();

  for (
    const event
    of source.timeSignatureEvents
  ) {
    const quantized =
      quantizeMidiTick(
        event.tick,
        source.ticksPerQuarterNote,
      );

    const candidate =
      Object.freeze({
        unit:
          quantized.unit,
        numerator:
          event.numerator,
        denominator:
          event.denominator,
        fromSource:
          true,
      });

    const existing =
      byUnit.get(
        candidate.unit,
      );

    if (
      existing
      && (
        existing.numerator
          !== candidate.numerator
        || existing.denominator
          !== candidate.denominator
      )
    ) {
      return failure(
        "UNSUPPORTED_MUSIC_BRAILLE_CONSTRUCT",
        "Conflicting MIDI time signatures occur at the same quantized position.",
        {
          sourceTick:
            event.tick,
        },
      );
    }

    byUnit.set(
      candidate.unit,
      candidate,
    );
  }

  if (
    !byUnit.has(
      0,
    )
  ) {
    byUnit.set(
      0,
      Object.freeze({
        unit: 0,
        numerator: 4,
        denominator: 4,
        fromSource: false,
      }),
    );

    diagnostics.push(
      Object.freeze({
        code:
          "TIME_SIGNATURE_ABSENT",
        message:
          "No source time signature was available at the beginning; 4/4 is used only as an internal measure-construction fallback.",
      }),
    );
  }

  return Object.freeze(
    [
      ...byUnit.values(),
    ].sort(
      (left, right) =>
        left.unit
        - right.unit,
    ),
  );
}

function buildMeasureBoundaries(
  source:
    MidiSemanticSource,
  maxEndUnit: number,
  diagnostics:
    NotationDiagnostic[],
):
  | readonly MeasureBoundary[]
  | NotationBuildFailure {
  const normalized =
    normalizeTimeSignatureChanges(
      source,
      diagnostics,
    );

  if (
    isNotationBuildFailure(
      normalized,
    )
  ) {
    return normalized;
  }

  const changes =
    normalized;

  const boundaries:
    MeasureBoundary[] = [];

  let currentUnit = 0;
  let measureIndex = 0;
  let changeIndex = 0;

  let active =
    changes[0]!;

  while (
    currentUnit < maxEndUnit
  ) {
    while (
      changeIndex + 1
        < changes.length
      && changes[
        changeIndex + 1
      ]!.unit
        === currentUnit
    ) {
      changeIndex += 1;
      active =
        changes[
          changeIndex
        ]!;
    }

    const length =
      measureLengthUnits(
        active.numerator,
        active.denominator,
      );

    if (
      length === null
    ) {
      return failure(
        "UNSUPPORTED_MUSIC_BRAILLE_CONSTRUCT",
        "The active time signature cannot be represented on the frozen 96-unit notation grid.",
      );
    }

    const nextUnit =
      currentUnit
      + length;

    const nextChange =
      changes[
        changeIndex + 1
      ];

    if (
      nextChange
      && nextChange.unit
        > currentUnit
      && nextChange.unit
        < nextUnit
    ) {
      return failure(
        "UNSUPPORTED_MUSIC_BRAILLE_CONSTRUCT",
        "A time-signature change occurs inside a derived measure.",
      );
    }

    boundaries.push(
      Object.freeze({
        index:
          measureIndex,
        startUnit:
          currentUnit,
        endUnit:
          nextUnit,
        numerator:
          active.numerator,
        denominator:
          active.denominator,
        timeSignatureFromSource:
          active.fromSource,
      }),
    );

    currentUnit =
      nextUnit;
    measureIndex += 1;

    if (
      nextChange
      && nextChange.unit
        === currentUnit
    ) {
      changeIndex += 1;
      active =
        nextChange;
    }
  }

  return Object.freeze(
    boundaries,
  );
}

function findMeasure(
  boundaries:
    readonly MeasureBoundary[],
  unit: number,
): MeasureBoundary | null {
  for (
    const measure
    of boundaries
  ) {
    if (
      unit
        >= measure.startUnit
      && unit
        < measure.endUnit
    ) {
      return measure;
    }
  }

  return null;
}

function splitIntervalAtMeasures(
  startUnit: number,
  endUnit: number,
  boundaries:
    readonly MeasureBoundary[],
):
  | readonly {
      readonly startUnit: number;
      readonly endUnit: number;
      readonly measureIndex: number;
    }[]
  | null {
  const result: {
    startUnit: number;
    endUnit: number;
    measureIndex: number;
  }[] = [];

  let cursor =
    startUnit;

  while (
    cursor < endUnit
  ) {
    const measure =
      findMeasure(
        boundaries,
        cursor,
      );

    if (
      measure === null
    ) {
      return null;
    }

    const chunkEnd =
      Math.min(
        endUnit,
        measure.endUnit,
      );

    result.push({
      startUnit:
        cursor,
      endUnit:
        chunkEnd,
      measureIndex:
        measure.index,
    });

    cursor =
      chunkEnd;
  }

  return Object.freeze(
    result.map(
      (item) =>
        Object.freeze(
          item,
        ),
    ),
  );
}

function quantizePartNotes(
  part:
    MidiSourcePart,
  source:
    MidiSemanticSource,
  diagnostics:
    NotationDiagnostic[],
  allowIndependentOverlap = false,
  quantizationOverrides?:
    RhythmQuantizationOverrideMap,
):
  | readonly QuantizedSourceNote[]
  | NotationBuildFailure {
  const result:
    QuantizedSourceNote[] = [];

  for (
    const note
    of part.notes
  ) {
    const override =
      quantizationOverrides?.get(
        note,
      );

    if (
      override !== undefined
    ) {
      result.push(
        override,
      );
      continue;
    }

    const quantized =
      quantizeMidiNote(
        note,
        source.ticksPerQuarterNote,
      );

    if (
      quantized === null
    ) {
      return failure(
        "UNQUANTIZABLE_RHYTHM",
        "A MIDI note duration cannot be represented inside the frozen quantization tolerance.",
        {
          trackIndex:
            part.trackIndex,
          channel:
            part.channel,
          sourceTick:
            note.startTick,
        },
      );
    }

    diagnostics.push(
      ...quantized.diagnostics,
    );

    result.push(
      Object.freeze({
        note,
        startUnit:
          quantized.startUnit,
        endUnit:
          quantized.endUnit,
      }),
    );
  }

  result.sort(
    (left, right) =>
      (
        left.startUnit
        - right.startUnit
      )
      || (
        left.note.noteNumber
        - right.note.noteNumber
      ),
  );

  const onsetGroups =
    new Map<
      number,
      QuantizedSourceNote[]
    >();

  for (
    const item
    of result
  ) {
    const group =
      onsetGroups.get(
        item.startUnit,
      ) ?? [];

    group.push(
      item,
    );

    onsetGroups.set(
      item.startUnit,
      group,
    );
  }

  const groups =
    [
      ...onsetGroups.entries(),
    ].sort(
      (left, right) =>
        left[0] - right[0],
    );

  let previousGroupEnd = 0;

  for (
    let index = 0;
    index < groups.length;
    index += 1
  ) {
    const [
      onset,
      group,
    ] =
      groups[index]!;

    if (
      !allowIndependentOverlap
      && index > 0
      && onset
        < previousGroupEnd
    ) {
      return failure(
        "UNSUPPORTED_POLYPHONY",
        "Independently-starting overlapping notes would require inferred notation voices.",
        {
          trackIndex:
            part.trackIndex,
          channel:
            part.channel,
        },
      );
    }

    previousGroupEnd =
      Math.max(
        ...group.map(
          (item) =>
            item.endUnit,
        ),
      );
  }

  return Object.freeze(
    result,
  );
}

function createNoteSegments(
  item:
    QuantizedSourceNote,
  boundaries:
    readonly MeasureBoundary[],
):
  | readonly {
      readonly measureIndex: number;
      readonly note:
        NotationNote;
    }[]
  | NotationBuildFailure {
  const chunks =
    splitIntervalAtMeasures(
      item.startUnit,
      item.endUnit,
      boundaries,
    );

  if (
    chunks === null
  ) {
    return failure(
      "UNSUPPORTED_MUSIC_BRAILLE_CONSTRUCT",
      "A quantized note falls outside the derived measure timeline.",
      {
        trackIndex:
          item.note.trackIndex,
        channel:
          item.note.channel,
        sourceTick:
          item.note.startTick,
      },
    );
  }

  const atomic: {
    measureIndex: number;
    startUnit: number;
    endUnit: number;
    duration:
      NotationDuration;
  }[] = [];

  for (
    const chunk
    of chunks
  ) {
    const durations =
      decomposeExactDurationUnits(
        chunk.endUnit
        - chunk.startUnit,
      );

    if (
      durations === null
    ) {
      return failure(
        "UNQUANTIZABLE_RHYTHM",
        "A measure-bounded note segment cannot be decomposed into supported rhythmic values.",
        {
          trackIndex:
            item.note.trackIndex,
          channel:
            item.note.channel,
          sourceTick:
            item.note.startTick,
        },
      );
    }

    let cursor =
      chunk.startUnit;

    for (
      const duration
      of durations
    ) {
      atomic.push({
        measureIndex:
          chunk.measureIndex,
        startUnit:
          cursor,
        endUnit:
          cursor
          + duration.units,
        duration,
      });

      cursor +=
        duration.units;
    }
  }

  return Object.freeze(
    atomic.map(
      (segment, index) =>
        Object.freeze({
          measureIndex:
            segment.measureIndex,
          note:
            Object.freeze({
              kind:
                "note",
              startUnit:
                segment.startUnit,
              endUnit:
                segment.endUnit,
              duration:
                segment.duration,
              pitch:
                pitchSource(
                  item.note.noteNumber,
                ),
              velocity:
                item.note.velocity,
              sourceStartTick:
                item.note.startTick,
              sourceEndTick:
                item.note.endTick,
              tieFromPrevious:
                index > 0,
              tieToNext:
                index
                < atomic.length - 1,
            }),
        }),
    ),
  );
}

function createRestSegments(
  startUnit: number,
  endUnit: number,
  boundaries:
    readonly MeasureBoundary[],
):
  | readonly {
      readonly measureIndex: number;
      readonly rest:
        NotationRest;
    }[]
  | NotationBuildFailure {
  const chunks =
    splitIntervalAtMeasures(
      startUnit,
      endUnit,
      boundaries,
    );

  if (
    chunks === null
  ) {
    return failure(
      "UNSUPPORTED_MUSIC_BRAILLE_CONSTRUCT",
      "A derived rest falls outside the measure timeline.",
    );
  }

  const result: {
    measureIndex: number;
    rest: NotationRest;
  }[] = [];

  for (
    const chunk
    of chunks
  ) {
    const durations =
      decomposeExactDurationUnits(
        chunk.endUnit
        - chunk.startUnit,
      );

    if (
      durations === null
    ) {
      return failure(
        "UNQUANTIZABLE_RHYTHM",
        "A derived rest cannot be decomposed exactly into supported rhythmic values.",
      );
    }

    let cursor =
      chunk.startUnit;

    for (
      const duration
      of durations
    ) {
      result.push({
        measureIndex:
          chunk.measureIndex,
        rest:
          Object.freeze({
            kind:
              "rest",
            startUnit:
              cursor,
            endUnit:
              cursor
              + duration.units,
            duration,
          }),
      });

      cursor +=
        duration.units;
    }
  }

  return Object.freeze(
    result.map(
      (item) =>
        Object.freeze(
          item,
        ),
    ),
  );
}

function groupMeasureEvents(
  events:
    readonly NotationLinearMeasureEvent[],
):
  readonly NotationLinearMeasureEvent[] {
  const rests =
    events.filter(
      (
        event,
      ): event is NotationRest =>
        event.kind === "rest",
    );

  const notes =
    events.filter(
      (
        event,
      ): event is NotationNote =>
        event.kind === "note",
    );

  const notesByInterval =
    new Map<
      string,
      NotationNote[]
    >();

  for (
    const note
    of notes
  ) {
    const key =
      `${note.startUnit}:${note.endUnit}`;

    const group =
      notesByInterval.get(
        key,
      ) ?? [];

    group.push(
      note,
    );

    notesByInterval.set(
      key,
      group,
    );
  }

  const grouped:
    NotationLinearMeasureEvent[] = [
      ...rests,
    ];

  for (
    const group
    of notesByInterval.values()
  ) {
    group.sort(
      (left, right) =>
        left.pitch.midiNoteNumber
        - right.pitch.midiNoteNumber,
    );

    if (
      group.length === 1
    ) {
      grouped.push(
        group[0]!,
      );
      continue;
    }

    const first =
      group[0]!;

    const chord:
      NotationChord =
        Object.freeze({
          kind:
            "chord",
          startUnit:
            first.startUnit,
          endUnit:
            first.endUnit,
          notes:
            Object.freeze(
              [
                ...group,
              ],
            ),
        });

    grouped.push(
      chord,
    );
  }

  grouped.sort(
    (left, right) =>
      (
        left.startUnit
        - right.startUnit
      )
      || (
        left.kind === "rest"
          ? -1
          : 1
      )
      || (
        left.endUnit
        - right.endUnit
      ),
  );

  return Object.freeze(
    grouped,
  );
}

function hasIndependentOverlap(
  quantized:
    readonly QuantizedSourceNote[],
): boolean {
  const groups =
    new Map<
      number,
      Set<number>
    >();

  for (
    const item
    of quantized
  ) {
    const endUnits =
      groups.get(
        item.startUnit,
      )
      ?? new Set<number>();

    endUnits.add(
      item.endUnit,
    );

    groups.set(
      item.startUnit,
      endUnits,
    );
  }

  // Equal-onset notes are an ordinary chord only when they also share
  // one corrected release. Different releases are simultaneous actions.
  for (
    const endUnits
    of groups.values()
  ) {
    if (
      endUnits.size > 1
    ) {
      return true;
    }
  }

  let previousGroupEnd = 0;
  let first = true;

  for (
    const [
      onset,
      endUnits,
    ]
    of [...groups.entries()].sort(
      (left, right) =>
        left[0] - right[0],
    )
  ) {
    const end =
      Math.max(
        ...endUnits,
      );

    if (
      !first
      && onset < previousGroupEnd
    ) {
      return true;
    }

    previousGroupEnd =
      Math.max(
        previousGroupEnd,
        end,
      );

    first = false;
  }

  return false;
}

function measureOnsetGroups(
  quantized:
    readonly QuantizedSourceNote[],
  boundary:
    MeasureBoundary,
): readonly MeasureOnsetGroup[] {
  const groups =
    new Map<
      string,
      {
        readonly startUnit: number;
        readonly endUnit: number;
        readonly items:
          QuantizedSourceNote[];
      }
    >();

  for (const item of quantized) {
    if (
      item.startUnit >= boundary.endUnit
      || item.endUnit <= boundary.startUnit
    ) {
      continue;
    }

    const startUnit =
      Math.max(
        item.startUnit,
        boundary.startUnit,
      );

    const endUnit =
      Math.min(
        item.endUnit,
        boundary.endUnit,
      );

    const key =
      `${startUnit}:${endUnit}`;

    const existing =
      groups.get(
        key,
      );

    if (
      existing !== undefined
    ) {
      existing.items.push(
        item,
      );
      continue;
    }

    groups.set(
      key,
      {
        startUnit,
        endUnit,
        items: [item],
      },
    );
  }

  return Object.freeze(
    [...groups.values()]
      .map((group) => {
        const highestMidiPitch =
          Math.max(
            ...group.items.map(
              (item) =>
                item.note.noteNumber,
            ),
          );

        return Object.freeze({
          startUnit:
            group.startUnit,
          endUnit:
            group.endUnit,
          anchorMidiPitch:
            highestMidiPitch,
          highestMidiPitch,
          items:
            Object.freeze(
              [...group.items],
            ),
        });
      })
      .sort((left, right) =>
        (
          left.startUnit
          - right.startUnit
        )
        || (
          right.highestMidiPitch
          - left.highestMidiPitch
        )
        || (
          right.endUnit
          - left.endUnit
        ),
      ),
  );
}

function partitionMeasureActions(
  groups:
    readonly MeasureOnsetGroup[],
): readonly DerivedAction[] {
  const actions:
    DerivedAction[] = [];

  for (const group of groups) {
    const available =
      actions
        .filter(
          (action) =>
            action.lastEndUnit
            <= group.startUnit,
        )
        .sort((left, right) => {
          const leftDistance =
            Math.abs(
              left.lastAnchorMidiPitch
              - group.anchorMidiPitch,
            );
          const rightDistance =
            Math.abs(
              right.lastAnchorMidiPitch
              - group.anchorMidiPitch,
            );

          return (
            leftDistance - rightDistance
            || right.lastEndUnit - left.lastEndUnit
            || left.stableIndex - right.stableIndex
          );
        });

    const chosen =
      available[0];

    if (chosen !== undefined) {
      chosen.groups.push(group);
      chosen.lastEndUnit =
        group.endUnit;
      chosen.lastAnchorMidiPitch =
        group.anchorMidiPitch;
      chosen.highestMidiPitch =
        Math.max(
          chosen.highestMidiPitch,
          group.highestMidiPitch,
        );
      continue;
    }

    actions.push({
      stableIndex:
        actions.length,
      groups: [group],
      lastEndUnit:
        group.endUnit,
      lastAnchorMidiPitch:
        group.anchorMidiPitch,
      highestMidiPitch:
        group.highestMidiPitch,
    });
  }

  return Object.freeze(
    actions,
  );
}


interface RhythmBoundaryKeys {
  readonly startKey:
    ReadonlyMap<MidiNote, string>;
  readonly endKey:
    ReadonlyMap<MidiNote, string>;
  readonly baselineByKey:
    ReadonlyMap<string, number>;
}

type RhythmConstraintKind =
  | "exact-positive"
  | "exact-nonnegative"
  | "equal"
  | "less-or-equal"
  | "less-than"
  | "greater-or-equal"
  | "greater-than";

interface RhythmConstraint {
  readonly leftKey: string;
  readonly rightKey: string;
  readonly kind:
    RhythmConstraintKind;
  readonly label: string;
}

interface RhythmConstraintScore {
  readonly totalAbsoluteCorrection:
    number;
  readonly correctedBoundaryCount:
    number;
  readonly totalRepresentedNoteDuration:
    number;
  readonly vector:
    readonly number[];
}

function prepareRhythmCoherenceSource(
  source:
    MidiSemanticSource,
  diagnostics:
    NotationDiagnostic[],
):
  | MidiSemanticSource
  | NotationBuildFailure {
  const omitted =
    new Set<MidiNote>();

  for (const note of source.notes) {
    if (
      note.endTick
      < note.startTick
    ) {
      return failure(
        "UNQUANTIZABLE_RHYTHM",
        "A MIDI note ends before it starts.",
        {
          trackIndex:
            note.trackIndex,
          channel:
            note.channel,
          sourceTick:
            note.startTick,
        },
      );
    }

    if (
      note.endTick
      !== note.startTick
    ) {
      continue;
    }

    omitted.add(
      note,
    );

    diagnostics.push(
      Object.freeze({
        code:
          "ZERO_DURATION_MIDI_NOTE_OMITTED",
        message:
          "An exact zero-duration MIDI note was omitted before notation quantization; no positive-duration note is covered by this policy.",
        trackIndex:
          note.trackIndex,
        channel:
          note.channel,
        sourceStartTick:
          note.startTick,
        sourceEndTick:
          note.endTick,
      }),
    );
  }

  if (
    omitted.size === 0
  ) {
    return source;
  }

  const notes =
    source.notes.filter(
      (note) =>
        !omitted.has(
          note,
        ),
    );

  if (
    notes.length === 0
  ) {
    return failure(
      "UNQUANTIZABLE_RHYTHM",
      "No positive-duration MIDI notes remain after exact zero-duration source events are disclosed and omitted.",
    );
  }

  const parts =
    source.parts
      .map((part) => {
        const partNotes =
          part.notes.filter(
            (note) =>
              !omitted.has(
                note,
              ),
          );

        return Object.freeze({
          ...part,
          notes:
            Object.freeze(
              partNotes,
            ),
        });
      })
      .filter(
        (part) =>
          part.notes.length > 0,
      );

  return Object.freeze({
    ...source,
    notes:
      Object.freeze(
        notes,
      ),
    parts:
      Object.freeze(
        parts,
      ),
  });
}

function baselineQuantizePartNotes(
  part:
    MidiSourcePart,
  source:
    MidiSemanticSource,
  diagnostics:
    NotationDiagnostic[],
):
  | readonly QuantizedSourceNote[]
  | NotationBuildFailure {
  const result:
    QuantizedSourceNote[] = [];

  for (const note of part.notes) {
    const start =
      quantizeMidiTick(
        note.startTick,
        source.ticksPerQuarterNote,
      );

    const end =
      quantizeMidiTick(
        note.endTick,
        source.ticksPerQuarterNote,
      );

    if (
      end.unit
      <= start.unit
    ) {
      return failure(
        "UNQUANTIZABLE_RHYTHM",
        "A positive-duration MIDI note collapses to zero or negative duration on the frozen notation grid.",
        {
          trackIndex:
            part.trackIndex,
          channel:
            part.channel,
          sourceTick:
            note.startTick,
        },
      );
    }

    if (
      start.changed
      || end.changed
    ) {
      diagnostics.push(
        Object.freeze({
          code:
            "RHYTHM_QUANTIZED",
          message:
            "MIDI timing was projected to the frozen 96-unit notation grid before shared-boundary coherence solving.",
          trackIndex:
            part.trackIndex,
          channel:
            part.channel,
          sourceStartTick:
            note.startTick,
          sourceEndTick:
            note.endTick,
        }),
      );
    }

    result.push(
      Object.freeze({
        note,
        startUnit:
          start.unit,
        endUnit:
          end.unit,
      }),
    );
  }

  result.sort(
    (left, right) =>
      (
        left.startUnit
        - right.startUnit
      )
      || (
        left.note.noteNumber
        - right.note.noteNumber
      ),
  );

  return Object.freeze(
    result,
  );
}

function fixedMeasureStartKey(
  boundary:
    MeasureBoundary,
): string {
  return (
    `@measure:${boundary.index}:start`
  );
}

function fixedMeasureEndKey(
  boundary:
    MeasureBoundary,
): string {
  return (
    `@measure:${boundary.index}:end`
  );
}

function buildRhythmBoundaryKeys(
  part:
    MidiSourcePart,
  quantized:
    readonly QuantizedSourceNote[],
): RhythmBoundaryKeys {
  const startKey =
    new Map<
      MidiNote,
      string
    >();

  const endKey =
    new Map<
      MidiNote,
      string
    >();

  const baselineByKey =
    new Map<
      string,
      number
    >();

  const onsetKeyByUnit =
    new Map<
      number,
      string
    >();

  const sourceTickToKey =
    new Map<
      number,
      string
    >();

  function setBaseline(
    key: string,
    unit: number,
  ): void {
    const existing =
      baselineByKey.get(
        key,
      );

    if (
      existing !== undefined
      && existing !== unit
    ) {
      throw new Error(
        "Shared MIDI boundary identity produced conflicting notation baselines.",
      );
    }

    baselineByKey.set(
      key,
      unit,
    );
  }

  for (const item of quantized) {
    let key =
      onsetKeyByUnit.get(
        item.startUnit,
      );

    if (
      key === undefined
    ) {
      key =
        `onset:${part.trackIndex}:${part.channel}:${item.startUnit}`;
      onsetKeyByUnit.set(
        item.startUnit,
        key,
      );
    }

    startKey.set(
      item.note,
      key,
    );
    setBaseline(
      key,
      item.startUnit,
    );

    const existingTickKey =
      sourceTickToKey.get(
        item.note.startTick,
      );

    if (
      existingTickKey !== undefined
      && existingTickKey !== key
    ) {
      throw new Error(
        "One source start tick was assigned to more than one onset group.",
      );
    }

    sourceTickToKey.set(
      item.note.startTick,
      key,
    );
  }

  for (const item of quantized) {
    let key =
      sourceTickToKey.get(
        item.note.endTick,
      );

    if (
      key === undefined
    ) {
      key =
        `tick:${part.trackIndex}:${part.channel}:${item.note.endTick}`;

      sourceTickToKey.set(
        item.note.endTick,
        key,
      );
    }

    endKey.set(
      item.note,
      key,
    );
    setBaseline(
      key,
      item.endUnit,
    );
  }

  return Object.freeze({
    startKey,
    endKey,
    baselineByKey,
  });
}

function addRhythmConstraint(
  target:
    RhythmConstraint[],
  leftKey: string,
  rightKey: string,
  kind:
    RhythmConstraintKind,
  label: string,
): void {
  target.push(
    Object.freeze({
      leftKey,
      rightKey,
      kind,
      label,
    }),
  );
}

function isExactPositiveUnits(
  units: number,
): boolean {
  return (
    units > 0
    && decomposeExactDurationUnits(
      units,
    ) !== null
  );
}

function rhythmConstraintSatisfied(
  constraint:
    RhythmConstraint,
  left: number,
  right: number,
): boolean {
  switch (
    constraint.kind
  ) {
    case "exact-positive":
      return (
        isExactPositiveUnits(
          right - left,
        )
      );

    case "exact-nonnegative": {
      const units =
        right - left;

      return (
        units === 0
        || isExactPositiveUnits(
          units,
        )
      );
    }

    case "equal":
      return left === right;

    case "less-or-equal":
      return left <= right;

    case "less-than":
      return left < right;

    case "greater-or-equal":
      return left >= right;

    case "greater-than":
      return left > right;
  }
}

function compareNumberVectors(
  left:
    readonly number[],
  right:
    readonly number[],
): number {
  const length =
    Math.min(
      left.length,
      right.length,
    );

  for (
    let index = 0;
    index < length;
    index += 1
  ) {
    if (
      left[index]
      !== right[index]
    ) {
      return (
        left[index]!
        - right[index]!
      );
    }
  }

  return (
    left.length
    - right.length
  );
}

function betterRhythmScore(
  candidate:
    RhythmConstraintScore,
  current:
    RhythmConstraintScore | null,
): boolean {
  if (
    current === null
  ) {
    return true;
  }

  if (
    candidate.totalAbsoluteCorrection
    !== current.totalAbsoluteCorrection
  ) {
    return (
      candidate.totalAbsoluteCorrection
      < current.totalAbsoluteCorrection
    );
  }

  if (
    candidate.correctedBoundaryCount
    !== current.correctedBoundaryCount
  ) {
    return (
      candidate.correctedBoundaryCount
      < current.correctedBoundaryCount
    );
  }

  if (
    candidate.totalRepresentedNoteDuration
    !== current.totalRepresentedNoteDuration
  ) {
    return (
      candidate.totalRepresentedNoteDuration
      < current.totalRepresentedNoteDuration
    );
  }

  return (
    compareNumberVectors(
      candidate.vector,
      current.vector,
    ) < 0
  );
}

function candidateDomainForNode(
  key: string,
  baseline: number,
  boundary:
    MeasureBoundary,
  radius: number,
  fixedUnits:
    ReadonlySet<number>,
): readonly number[] {
  if (
    key.startsWith(
      "@measure:",
    )
    || fixedUnits.has(
      baseline,
    )
  ) {
    return Object.freeze([
      baseline,
    ]);
  }

  const lower =
    Math.max(
      boundary.startUnit,
      baseline - radius,
    );

  const upper =
    Math.min(
      boundary.endUnit,
      baseline + radius,
    );

  const values:
    number[] = [];

  for (
    let value = lower;
    value <= upper;
    value += 1
  ) {
    values.push(
      value,
    );
  }

  values.sort(
    (left, right) =>
      (
        Math.abs(
          left - baseline,
        )
        - Math.abs(
          right - baseline,
        )
      )
      || (
        left - right
      ),
  );

  return Object.freeze(
    values,
  );
}

function propagateRhythmDomains(
  domains:
    Map<string, number[]>,
  constraints:
    readonly RhythmConstraint[],
): boolean {
  let changed =
    true;

  while (changed) {
    changed =
      false;

    for (
      const constraint
      of constraints
    ) {
      const leftDomain =
        domains.get(
          constraint.leftKey,
        );

      const rightDomain =
        domains.get(
          constraint.rightKey,
        );

      if (
        leftDomain === undefined
        || rightDomain === undefined
      ) {
        throw new Error(
          "Rhythm solver constraint references an unknown boundary node.",
        );
      }

      const filteredLeft =
        leftDomain.filter(
          (left) =>
            rightDomain.some(
              (right) =>
                rhythmConstraintSatisfied(
                  constraint,
                  left,
                  right,
                ),
            ),
        );

      if (
        filteredLeft.length === 0
      ) {
        return false;
      }

      if (
        filteredLeft.length
        !== leftDomain.length
      ) {
        domains.set(
          constraint.leftKey,
          filteredLeft,
        );
        changed =
          true;
      }

      const currentLeft =
        domains.get(
          constraint.leftKey,
        )!;

      const filteredRight =
        rightDomain.filter(
          (right) =>
            currentLeft.some(
              (left) =>
                rhythmConstraintSatisfied(
                  constraint,
                  left,
                  right,
                ),
            ),
        );

      if (
        filteredRight.length === 0
      ) {
        return false;
      }

      if (
        filteredRight.length
        !== rightDomain.length
      ) {
        domains.set(
          constraint.rightKey,
          filteredRight,
        );
        changed =
          true;
      }
    }
  }

  return true;
}

interface RhythmTreeCandidate {
  readonly totalAbsoluteCorrection:
    number;
  readonly correctedBoundaryCount:
    number;
  readonly totalRepresentedNoteDuration:
    number;
  readonly assignment:
    ReadonlyMap<string, number>;
}

function compareRhythmTreeCandidates(
  left:
    RhythmTreeCandidate,
  right:
    RhythmTreeCandidate | null,
  orderedKeys:
    readonly string[],
): boolean {
  if (
    right === null
  ) {
    return true;
  }

  if (
    left.totalAbsoluteCorrection
    !== right.totalAbsoluteCorrection
  ) {
    return (
      left.totalAbsoluteCorrection
      < right.totalAbsoluteCorrection
    );
  }

  if (
    left.correctedBoundaryCount
    !== right.correctedBoundaryCount
  ) {
    return (
      left.correctedBoundaryCount
      < right.correctedBoundaryCount
    );
  }

  if (
    left.totalRepresentedNoteDuration
    !== right.totalRepresentedNoteDuration
  ) {
    return (
      left.totalRepresentedNoteDuration
      < right.totalRepresentedNoteDuration
    );
  }

  for (const key of orderedKeys) {
    const leftValue =
      left.assignment.get(
        key,
      );
    const rightValue =
      right.assignment.get(
        key,
      );

    if (
      leftValue === undefined
      || rightValue === undefined
      || leftValue === rightValue
    ) {
      continue;
    }

    return (
      leftValue
      < rightValue
    );
  }

  return false;
}

function solveAcyclicRhythmConstraints(
  orderedKeys:
    readonly string[],
  domains:
    ReadonlyMap<string, readonly number[]>,
  baselineByKey:
    ReadonlyMap<string, number>,
  constraints:
    readonly RhythmConstraint[],
  noteConstraints:
    readonly RhythmConstraint[],
): ReadonlyMap<string, number> | null | undefined {
  const adjacency =
    new Map<
      string,
      Set<string>
    >();

  const pairConstraints =
    new Map<
      string,
      RhythmConstraint[]
    >();

  const selfConstraints =
    new Map<
      string,
      RhythmConstraint[]
    >();

  const pairKey = (
    left: string,
    right: string,
  ): string => (
    left < right
      ? `${left}\u0000${right}`
      : `${right}\u0000${left}`
  );

  for (const key of orderedKeys) {
    adjacency.set(
      key,
      new Set<string>(),
    );
  }

  for (const constraint of constraints) {
    if (
      constraint.leftKey
      === constraint.rightKey
    ) {
      const list =
        selfConstraints.get(
          constraint.leftKey,
        )
        ?? [];
      list.push(
        constraint,
      );
      selfConstraints.set(
        constraint.leftKey,
        list,
      );
      continue;
    }

    adjacency.get(
      constraint.leftKey,
    )!.add(
      constraint.rightKey,
    );
    adjacency.get(
      constraint.rightKey,
    )!.add(
      constraint.leftKey,
    );

    const key =
      pairKey(
        constraint.leftKey,
        constraint.rightKey,
      );
    const list =
      pairConstraints.get(
        key,
      )
      ?? [];
    list.push(
      constraint,
    );
    pairConstraints.set(
      key,
      list,
    );
  }

  // This exact dynamic-programming path is intentionally used only when
  // the binary constraint graph is a forest. Cyclic H4C measures continue
  // through the existing deterministic generic search below.
  const visited =
    new Set<string>();

  function isForest(
    key: string,
    parent: string | null,
  ): boolean {
    if (
      visited.has(
        key,
      )
    ) {
      return false;
    }

    visited.add(
      key,
    );

    for (
      const neighbor
      of adjacency.get(
        key,
      )!
    ) {
      if (
        neighbor === parent
      ) {
        continue;
      }

      if (
        visited.has(
          neighbor,
        )
        || !isForest(
          neighbor,
          key,
        )
      ) {
        return false;
      }
    }

    return true;
  }

  for (const key of orderedKeys) {
    if (
      visited.has(
        key,
      )
    ) {
      continue;
    }

    if (
      !isForest(
        key,
        null,
      )
    ) {
      return undefined;
    }
  }

  function constraintsSatisfiedForPair(
    leftKey: string,
    leftValue: number,
    rightKey: string,
    rightValue: number,
  ): boolean {
    const list =
      pairConstraints.get(
        pairKey(
          leftKey,
          rightKey,
        ),
      )
      ?? [];

    return list.every(
      (constraint) => {
        const left =
          constraint.leftKey
          === leftKey
            ? leftValue
            : rightValue;
        const right =
          constraint.rightKey
          === rightKey
            ? rightValue
            : leftValue;

        return rhythmConstraintSatisfied(
          constraint,
          left,
          right,
        );
      },
    );
  }

  function noteDurationForPair(
    leftKey: string,
    leftValue: number,
    rightKey: string,
    rightValue: number,
  ): number {
    let total = 0;

    for (
      const constraint
      of noteConstraints
    ) {
      if (
        !(
          (
            constraint.leftKey === leftKey
            && constraint.rightKey === rightKey
          )
          || (
            constraint.leftKey === rightKey
            && constraint.rightKey === leftKey
          )
        )
      ) {
        continue;
      }

      const left =
        constraint.leftKey
        === leftKey
          ? leftValue
          : rightValue;
      const right =
        constraint.rightKey
        === rightKey
          ? rightValue
          : leftValue;

      total +=
        right - left;
    }

    return total;
  }

  const indexByKey =
    new Map(
      orderedKeys.map(
        (key, index) => [
          key,
          index,
        ],
      ),
    );

  function solveComponent(
    root: string,
  ): RhythmTreeCandidate | null {
    const parent =
      new Map<
        string,
        string | null
      >();
    const children =
      new Map<
        string,
        string[]
      >();
    const order:
      string[] = [];
    const stack = [
      root,
    ];

    parent.set(
      root,
      null,
    );

    while (
      stack.length > 0
    ) {
      const key =
        stack.pop()!;
      order.push(
        key,
      );
      const childList:
        string[] = [];

      for (
        const neighbor
        of adjacency.get(
          key,
        )!
      ) {
        if (
          neighbor
          === parent.get(
            key,
          )
        ) {
          continue;
        }

        parent.set(
          neighbor,
          key,
        );
        childList.push(
          neighbor,
        );
        stack.push(
          neighbor,
        );
      }

      childList.sort(
        (left, right) =>
          indexByKey.get(
            left,
          )!
          - indexByKey.get(
            right,
          )!,
      );
      children.set(
        key,
        childList,
      );
    }

    const table =
      new Map<
        string,
        Map<number, RhythmTreeCandidate>
      >();

    for (
      const key
      of [...order].reverse()
    ) {
      const valueTable =
        new Map<
          number,
          RhythmTreeCandidate
        >();
      const baseline =
        baselineByKey.get(
          key,
        )!;
      const self =
        selfConstraints.get(
          key,
        )
        ?? [];

      for (
        const value
        of domains.get(
          key,
        )!
      ) {
        if (
          !self.every(
            (constraint) =>
              rhythmConstraintSatisfied(
                constraint,
                value,
                value,
              ),
          )
        ) {
          continue;
        }

        let candidate:
          RhythmTreeCandidate | null =
            Object.freeze({
              totalAbsoluteCorrection:
                Math.abs(
                  value - baseline,
                ),
              correctedBoundaryCount:
                value === baseline
                  ? 0
                  : 1,
              totalRepresentedNoteDuration:
                0,
              assignment:
                new Map([
                  [
                    key,
                    value,
                  ],
                ]),
            });

        for (
          const child
          of children.get(
            key,
          )
          ?? []
        ) {
          let bestChild:
            RhythmTreeCandidate | null =
              null;

          for (
            const [
              childValue,
              childCandidate,
            ]
            of table.get(
              child,
            )!
          ) {
            if (
              !constraintsSatisfiedForPair(
                key,
                value,
                child,
                childValue,
              )
            ) {
              continue;
            }

            const edgeNoteDuration =
              noteDurationForPair(
                key,
                value,
                child,
                childValue,
              );

            const withEdge:
              RhythmTreeCandidate =
                Object.freeze({
                  ...childCandidate,
                  totalRepresentedNoteDuration:
                    childCandidate.totalRepresentedNoteDuration
                    + edgeNoteDuration,
                });

            if (
              compareRhythmTreeCandidates(
                withEdge,
                bestChild,
                orderedKeys,
              )
            ) {
              bestChild =
                withEdge;
            }
          }

          if (
            bestChild === null
          ) {
            candidate =
              null;
            break;
          }

          const merged:
            Map<string, number> =
              new Map(
                candidate!.assignment,
              );

          for (
            const [
              childKey,
              childValue,
            ]
            of bestChild.assignment
          ) {
            merged.set(
              childKey,
              childValue,
            );
          }

          candidate =
            Object.freeze({
              totalAbsoluteCorrection:
                candidate!.totalAbsoluteCorrection
                + bestChild.totalAbsoluteCorrection,
              correctedBoundaryCount:
                candidate!.correctedBoundaryCount
                + bestChild.correctedBoundaryCount,
              totalRepresentedNoteDuration:
                candidate!.totalRepresentedNoteDuration
                + bestChild.totalRepresentedNoteDuration,
              assignment:
                merged,
            });
        }

        if (
          candidate !== null
        ) {
          valueTable.set(
            value,
            candidate,
          );
        }
      }

      if (
        valueTable.size === 0
      ) {
        return null;
      }

      table.set(
        key,
        valueTable,
      );
    }

    let best:
      RhythmTreeCandidate | null =
        null;

    for (
      const candidate
      of table.get(
        root,
      )!.values()
    ) {
      if (
        compareRhythmTreeCandidates(
          candidate,
          best,
          orderedKeys,
        )
      ) {
        best =
          candidate;
      }
    }

    return best;
  }

  const componentSeen =
    new Set<string>();
  const componentCandidates:
    RhythmTreeCandidate[] = [];

  for (const key of orderedKeys) {
    if (
      componentSeen.has(
        key,
      )
    ) {
      continue;
    }

    const stack = [
      key,
    ];

    while (
      stack.length > 0
    ) {
      const current =
        stack.pop()!;

      if (
        componentSeen.has(
          current,
        )
      ) {
        continue;
      }

      componentSeen.add(
        current,
      );
      stack.push(
        ...adjacency.get(
          current,
        )!,
      );
    }

    const candidate =
      solveComponent(
        key,
      );

    if (
      candidate === null
    ) {
      return null;
    }

    componentCandidates.push(
      candidate,
    );
  }

  const assignment =
    new Map<string, number>();

  for (
    const candidate
    of componentCandidates
  ) {
    for (
      const [
        key,
        value,
      ]
      of candidate.assignment
    ) {
      assignment.set(
        key,
        value,
      );
    }
  }

  return Object.freeze(
    assignment,
  );
}

function solveRhythmMeasureConstraints(
  boundary:
    MeasureBoundary,
  baselineByKey:
    ReadonlyMap<string, number>,
  constraints:
    readonly RhythmConstraint[],
  noteConstraints:
    readonly RhythmConstraint[],
  fixedUnits:
    ReadonlySet<number>,
):
  | ReadonlyMap<string, number>
  | "complexity-exceeded"
  | null {
  const constrainedKeys =
    new Set<string>();

  for (
    const constraint
    of constraints
  ) {
    constrainedKeys.add(
      constraint.leftKey,
    );
    constrainedKeys.add(
      constraint.rightKey,
    );
  }

  const orderedKeys =
    [...constrainedKeys]
      .sort((left, right) => {
        const leftBaseline =
          baselineByKey.get(
            left,
          );
        const rightBaseline =
          baselineByKey.get(
            right,
          );

        if (
          leftBaseline === undefined
          || rightBaseline === undefined
        ) {
          throw new Error(
            "Rhythm solver boundary baseline is missing.",
          );
        }

        return (
          leftBaseline
          - rightBaseline
          || left.localeCompare(
            right,
          )
        );
      });

  for (
    let radius = 0;
    radius
      <= MAX_QUANTIZATION_ERROR_UNITS;
    radius += 1
  ) {
    const initialDomains =
      new Map<
        string,
        number[]
      >();

    for (
      const key
      of orderedKeys
    ) {
      const baseline =
        baselineByKey.get(
          key,
        );

      if (
        baseline === undefined
      ) {
        throw new Error(
          "Rhythm solver boundary baseline is missing.",
        );
      }

      initialDomains.set(
        key,
        [
          ...candidateDomainForNode(
            key,
            baseline,
            boundary,
            radius,
            fixedUnits,
          ),
        ],
      );
    }

    if (
      !propagateRhythmDomains(
        initialDomains,
        constraints,
      )
    ) {
      continue;
    }

    const acyclicAssignment =
      solveAcyclicRhythmConstraints(
        orderedKeys,
        initialDomains,
        baselineByKey,
        constraints,
        noteConstraints,
      );

    if (
      acyclicAssignment !== undefined
    ) {
      if (
        acyclicAssignment !== null
      ) {
        return acyclicAssignment;
      }

      continue;
    }

    let bestAssignment:
      Map<string, number> | null =
        null;

    let bestScore:
      RhythmConstraintScore | null =
        null;

    let visited =
      0;

    let complexityExceeded =
      false;

    function lowerBound(
      domains:
        ReadonlyMap<
          string,
          readonly number[]
        >,
    ): {
      readonly absolute:
        number;
      readonly corrected:
        number;
    } {
      let absolute = 0;
      let corrected = 0;

      for (
        const key
        of orderedKeys
      ) {
        const baseline =
          baselineByKey.get(
            key,
          )!;

        const domain =
          domains.get(
            key,
          )!;

        const minimum =
          Math.min(
            ...domain.map(
              (value) =>
                Math.abs(
                  value - baseline,
                ),
            ),
          );

        absolute +=
          minimum;

        if (
          !domain.includes(
            baseline,
          )
        ) {
          corrected +=
            1;
        }
      }

      return Object.freeze({
        absolute,
        corrected,
      });
    }

    function search(
      domains:
        Map<string, number[]>,
    ): void {
      visited +=
        1;

      if (
        visited
        > GLOBAL_PIANO_ROLL_CYCLIC_SEARCH_VISIT_LIMIT
      ) {
        complexityExceeded =
          true;
        return;
      }

      const bound =
        lowerBound(
          domains,
        );

      if (
        bestScore !== null
        && (
          bound.absolute
            > bestScore.totalAbsoluteCorrection
          || (
            bound.absolute
              === bestScore.totalAbsoluteCorrection
            && bound.corrected
              > bestScore.correctedBoundaryCount
          )
        )
      ) {
        return;
      }

      const unresolved =
        orderedKeys
          .filter(
            (key) =>
              domains.get(
                key,
              )!.length > 1,
          )
          .sort((left, right) => {
            const leftDomain =
              domains.get(
                left,
              )!;
            const rightDomain =
              domains.get(
                right,
              )!;

            return (
              leftDomain.length
              - rightDomain.length
              || (
                baselineByKey.get(
                  left,
                )!
                - baselineByKey.get(
                  right,
                )!
              )
              || left.localeCompare(
                right,
              )
            );
          });

      if (
        unresolved.length === 0
      ) {
        const assignment =
          new Map<
            string,
            number
          >();

        for (
          const key
          of orderedKeys
        ) {
          assignment.set(
            key,
            domains.get(
              key,
            )![0]!,
          );
        }

        let totalAbsoluteCorrection =
          0;
        let correctedBoundaryCount =
          0;

        for (
          const key
          of orderedKeys
        ) {
          const value =
            assignment.get(
              key,
            )!;
          const baseline =
            baselineByKey.get(
              key,
            )!;
          const correction =
            Math.abs(
              value - baseline,
            );

          totalAbsoluteCorrection +=
            correction;

          if (
            correction !== 0
          ) {
            correctedBoundaryCount +=
              1;
          }
        }

        let totalRepresentedNoteDuration =
          0;

        for (
          const constraint
          of noteConstraints
        ) {
          totalRepresentedNoteDuration +=
            assignment.get(
              constraint.rightKey,
            )!
            - assignment.get(
              constraint.leftKey,
            )!;
        }

        const score:
          RhythmConstraintScore =
            Object.freeze({
              totalAbsoluteCorrection,
              correctedBoundaryCount,
              totalRepresentedNoteDuration,
              vector:
                Object.freeze(
                  orderedKeys.map(
                    (key) =>
                      assignment.get(
                        key,
                      )!,
                  ),
                ),
            });

        if (
          betterRhythmScore(
            score,
            bestScore,
          )
        ) {
          bestScore =
            score;
          bestAssignment =
            assignment;
        }

        return;
      }

      const key =
        unresolved[0]!;

      for (
        const value
        of domains.get(
          key,
        )!
      ) {
        const next =
          new Map<
            string,
            number[]
          >(
            [...domains.entries()]
              .map(
                ([entryKey, domain]) => [
                  entryKey,
                  entryKey === key
                    ? [value]
                    : [...domain],
                ],
              ),
          );

        if (
          !propagateRhythmDomains(
            next,
            constraints,
          )
        ) {
          continue;
        }

        search(
          next,
        );

        if (
          complexityExceeded
        ) {
          return;
        }
      }
    }

    search(
      initialDomains,
    );

    if (
      complexityExceeded
    ) {
      return "complexity-exceeded";
    }

    if (
      bestAssignment !== null
    ) {
      return Object.freeze(
        bestAssignment,
      );
    }
  }

  return null;
}

function buildGroupEndpointMap(
  groups:
    readonly MeasureOnsetGroup[],
  boundary:
    MeasureBoundary,
  keys:
    RhythmBoundaryKeys,
  baselineByKey:
    Map<string, number>,
  constraints:
    RhythmConstraint[],
): ReadonlyMap<
  MeasureOnsetGroup,
  Readonly<{
    startKey: string;
    endKey: string;
  }>
> {
  const result =
    new Map<
      MeasureOnsetGroup,
      Readonly<{
        startKey: string;
        endKey: string;
      }>
    >();

  const measureStartKey =
    fixedMeasureStartKey(
      boundary,
    );
  const measureEndKey =
    fixedMeasureEndKey(
      boundary,
    );

  baselineByKey.set(
    measureStartKey,
    boundary.startUnit,
  );
  baselineByKey.set(
    measureEndKey,
    boundary.endUnit,
  );

  for (
    const group
    of groups
  ) {
    const firstItem =
      group.items[0]!;

    const groupStartKey =
      group.startUnit
        === boundary.startUnit
        ? measureStartKey
        : keys.startKey.get(
            firstItem.note,
          )!;

    let groupEndKey =
      measureEndKey;

    if (
      group.endUnit
      !== boundary.endUnit
    ) {
      const endItem =
        group.items.find(
          (item) =>
            item.endUnit
            === group.endUnit,
        );

      if (
        endItem === undefined
      ) {
        throw new Error(
          "Unable to resolve the H4C group-end boundary identity.",
        );
      }

      groupEndKey =
        keys.endKey.get(
          endItem.note,
        )!;
    }

    for (
      const item
      of group.items
    ) {
      const itemEndKey =
        item.endUnit
          >= boundary.endUnit
          ? measureEndKey
          : keys.endKey.get(
              item.note,
            )!;

      if (
        itemEndKey
        !== groupEndKey
      ) {
        addRhythmConstraint(
          constraints,
          itemEndKey,
          groupEndKey,
          "less-or-equal",
          "preserve-group-max-end",
        );
      }
    }

    result.set(
      group,
      Object.freeze({
        startKey:
          groupStartKey,
        endKey:
          groupEndKey,
      }),
    );
  }

  return result;
}

function addGapConstraint(
  constraints:
    RhythmConstraint[],
  leftKey: string,
  rightKey: string,
  baselineGap: number,
  label: string,
): void {
  if (
    baselineGap < 0
  ) {
    throw new Error(
      "A rhythm gap constraint cannot begin from a negative baseline gap.",
    );
  }

  // A positive MIDI gap smaller than the minimum exact rest may collapse
  // to a touching boundary when that is the only coherent solution inside
  // the frozen six-unit window. Equality preserves source order and H4C
  // action membership without trimming an overlap; it emits no invented
  // rest. A baseline zero gap remains exactly zero.
  addRhythmConstraint(
    constraints,
    leftKey,
    rightKey,
    baselineGap === 0
      ? "equal"
      : "exact-nonnegative",
    label,
  );
}

function actionPartitionSignature(
  quantized:
    readonly QuantizedSourceNote[],
  boundary:
    MeasureBoundary,
  noteIndex:
    ReadonlyMap<MidiNote, number>,
): string {
  const groups =
    measureOnsetGroups(
      quantized,
      boundary,
    );

  const actions =
    partitionMeasureActions(
      groups,
    );

  return JSON.stringify(
    actions.map(
      (action) =>
        action.groups.map(
          (group) =>
            group.items
              .map(
                (item) =>
                  noteIndex.get(
                    item.note,
                  )!,
              )
              .sort(
                (left, right) =>
                  left - right,
              ),
        ),
    ),
  );
}

function solvePartRhythmCoherence(
  part:
    MidiSourcePart,
  baseline:
    readonly QuantizedSourceNote[],
  boundaries:
    readonly MeasureBoundary[],
  diagnostics:
    NotationDiagnostic[],
  allowIncompletePartMeasure:
    boolean,
):
  | readonly QuantizedSourceNote[]
  | NotationBuildFailure {
  const keys =
    buildRhythmBoundaryKeys(
      part,
      baseline,
    );

  const baselineByKey =
    new Map(
      keys.baselineByKey,
    );

  const fixedUnits =
    new Set<number>();

  for (
    const boundary
    of boundaries
  ) {
    fixedUnits.add(
      boundary.startUnit,
    );
    fixedUnits.add(
      boundary.endUnit,
    );

    baselineByKey.set(
      fixedMeasureStartKey(
        boundary,
      ),
      boundary.startUnit,
    );
    baselineByKey.set(
      fixedMeasureEndKey(
        boundary,
      ),
      boundary.endUnit,
    );
  }

  const correctedByKey =
    new Map<
      string,
      number
    >();

  const partEnd =
    Math.max(
      ...baseline.map(
        (item) =>
          item.endUnit,
      ),
    );

  const noteIndex =
    new Map<
      MidiNote,
      number
    >(
      part.notes.map(
        (note, index) => [
          note,
          index,
        ],
      ),
    );

  const baselineSignatures =
    new Map<
      number,
      string
    >();

  for (
    const boundary
    of boundaries
  ) {
    if (
      boundary.startUnit
      >= partEnd
    ) {
      break;
    }

    const constraints:
      RhythmConstraint[] = [];

    const noteConstraints:
      RhythmConstraint[] = [];

    const measureStartKey =
      fixedMeasureStartKey(
        boundary,
      );
    const measureEndKey =
      fixedMeasureEndKey(
        boundary,
      );

    for (
      const item
      of baseline
    ) {
      if (
        item.startUnit
          >= boundary.endUnit
        || item.endUnit
          <= boundary.startUnit
      ) {
        continue;
      }

      const leftKey =
        item.startUnit
          <= boundary.startUnit
          ? measureStartKey
          : keys.startKey.get(
              item.note,
            )!;

      const rightKey =
        item.endUnit
          >= boundary.endUnit
          ? measureEndKey
          : keys.endKey.get(
              item.note,
            )!;

      const noteConstraint:
        RhythmConstraint =
          Object.freeze({
            leftKey,
            rightKey,
            kind:
              "exact-positive",
            label:
              `note:${noteIndex.get(item.note)}`,
          });

      constraints.push(
        noteConstraint,
      );
      noteConstraints.push(
        noteConstraint,
      );
    }

    const groups =
      measureOnsetGroups(
        baseline,
        boundary,
      );

    baselineSignatures.set(
      boundary.index,
      actionPartitionSignature(
        baseline,
        boundary,
        noteIndex,
      ),
    );

    const endpointMap =
      buildGroupEndpointMap(
        groups,
        boundary,
        keys,
        baselineByKey,
        constraints,
      );

    const actions =
      partitionMeasureActions(
        groups,
      );

    for (
      let index = 1;
      index < groups.length;
      index += 1
    ) {
      const previousGroup =
        groups[index - 1]!;
      const currentGroup =
        groups[index]!;

      // A note carried into this measure and a note beginning exactly on
      // the measure boundary can be distinct H4C onset groups while both
      // are clipped to the same measure-local start. Preserve temporal
      // ordering only when the frozen H4C starts are actually distinct.
      if (
        actions.length > 1
        && previousGroup.startUnit
          < currentGroup.startUnit
      ) {
        addRhythmConstraint(
          constraints,
          endpointMap.get(
            previousGroup,
          )!.startKey,
          endpointMap.get(
            currentGroup,
          )!.startKey,
          "less-than",
          "preserve-distinct-onset-order",
        );
      }
    }

    interface ActionState {
      readonly stableIndex: number;
      lastEndKey: string;
      lastEndUnit: number;
      lastAnchorMidiPitch: number;
      highestMidiPitch: number;
    }

    const actionStates:
      ActionState[] = [];

    for (
      const group
      of groups
    ) {
      const endpoints =
        endpointMap.get(
          group,
        )!;

      const availability =
        actionStates.map(
          (action) =>
            Object.freeze({
              action,
              available:
                action.lastEndUnit
                <= group.startUnit,
            }),
        );

      for (
        const entry
        of availability
      ) {
        addRhythmConstraint(
          constraints,
          entry.action.lastEndKey,
          endpoints.startKey,
          entry.available
            ? "less-or-equal"
            : "greater-than",
          "preserve-h4c-action-availability",
        );
      }

      const available =
        availability
          .filter(
            (entry) =>
              entry.available,
          )
          .map(
            (entry) =>
              entry.action,
          )
          .sort(
            (left, right) => {
              const leftDistance =
                Math.abs(
                  left.lastAnchorMidiPitch
                  - group.anchorMidiPitch,
                );
              const rightDistance =
                Math.abs(
                  right.lastAnchorMidiPitch
                  - group.anchorMidiPitch,
                );

              return (
                leftDistance
                - rightDistance
                || right.lastEndUnit
                - left.lastEndUnit
                || left.stableIndex
                - right.stableIndex
              );
            },
          );

      const chosen =
        available[0];

      if (
        chosen !== undefined
      ) {
        const chosenDistance =
          Math.abs(
            chosen.lastAnchorMidiPitch
            - group.anchorMidiPitch,
          );

        for (
          const competitor
          of available.slice(
            1,
          )
        ) {
          const competitorDistance =
            Math.abs(
              competitor.lastAnchorMidiPitch
              - group.anchorMidiPitch,
            );

          if (
            competitorDistance
            !== chosenDistance
          ) {
            continue;
          }

          addRhythmConstraint(
            constraints,
            chosen.lastEndKey,
            competitor.lastEndKey,
            "greater-or-equal",
            "preserve-h4c-action-reuse-tie-break",
          );
        }

        chosen.lastEndKey =
          endpoints.endKey;
        chosen.lastEndUnit =
          group.endUnit;
        chosen.lastAnchorMidiPitch =
          group.anchorMidiPitch;
        chosen.highestMidiPitch =
          Math.max(
            chosen.highestMidiPitch,
            group.highestMidiPitch,
          );
      } else {
        actionStates.push({
          stableIndex:
            actionStates.length,
          lastEndKey:
            endpoints.endKey,
          lastEndUnit:
            group.endUnit,
          lastAnchorMidiPitch:
            group.anchorMidiPitch,
          highestMidiPitch:
            group.highestMidiPitch,
        });
      }
    }

    const partHasLaterNotes =
      baseline.some(
        (item) =>
          item.startUnit
          >= boundary.endUnit,
      );

    if (
      actions.length <= 1
    ) {
      if (
        groups.length === 0
      ) {
        if (
          partHasLaterNotes
          && decomposeExactDurationUnits(
            boundary.endUnit
            - boundary.startUnit,
          ) === null
        ) {
          return failure(
            "UNQUANTIZABLE_RHYTHM",
            "A complete derived empty measure cannot be decomposed exactly.",
            {
              trackIndex:
                part.trackIndex,
              channel:
                part.channel,
            },
          );
        }
      } else {
        let previousEndKey =
          measureStartKey;
        let previousEndUnit =
          boundary.startUnit;

        for (
          const group
          of groups
        ) {
          const endpoints =
            endpointMap.get(
              group,
            )!;

          addGapConstraint(
            constraints,
            previousEndKey,
            endpoints.startKey,
            group.startUnit
            - previousEndUnit,
            "linear-derived-rest",
          );

          previousEndKey =
            endpoints.endKey;
          previousEndUnit =
            group.endUnit;
        }

        if (
          partHasLaterNotes
        ) {
          addGapConstraint(
            constraints,
            previousEndKey,
            measureEndKey,
            boundary.endUnit
            - previousEndUnit,
            "linear-derived-tail-rest",
          );
        }
      }
    } else {
      const incompletePartMeasure =
        partEnd
        < boundary.endUnit;

      if (
        !incompletePartMeasure
        || allowIncompletePartMeasure
      ) {
        let sectionEndKey =
          measureEndKey;
        let sectionEndUnit =
          boundary.endUnit;

        if (incompletePartMeasure) {
          const terminalItem =
            [...baseline]
              .filter(
                (item) =>
                  item.endUnit
                  === partEnd
                  && item.startUnit
                  < boundary.endUnit
                  && item.endUnit
                  > boundary.startUnit,
              )
              .sort(
                (left, right) =>
                  (
                    right.note.endTick
                    - left.note.endTick
                  )
                  || (
                    right.note.noteNumber
                    - left.note.noteNumber
                  ),
              )[0];

          if (terminalItem === undefined) {
            return failure(
              "UNQUANTIZABLE_RHYTHM",
              "Unable to resolve the terminal shared boundary for an incomplete part-measure in-accord section.",
              {
                trackIndex:
                  part.trackIndex,
                channel:
                  part.channel,
              },
            );
          }

          sectionEndKey =
            keys.endKey.get(
              terminalItem.note,
            )!;
          sectionEndUnit =
            partEnd;
        }

        for (
          const action
          of actions
        ) {
          let previousEndKey =
            measureStartKey;
          let previousEndUnit =
            boundary.startUnit;

          for (
            const group
            of action.groups
          ) {
            const endpoints =
              endpointMap.get(
                group,
              )!;

            addGapConstraint(
              constraints,
              previousEndKey,
              endpoints.startKey,
              group.startUnit
              - previousEndUnit,
              incompletePartMeasure
                ? "part-measure-in-accord-derived-rest"
                : "in-accord-derived-rest",
            );

            previousEndKey =
              endpoints.endKey;
            previousEndUnit =
              group.endUnit;
          }

          addGapConstraint(
            constraints,
            previousEndKey,
            sectionEndKey,
            sectionEndUnit
            - previousEndUnit,
            incompletePartMeasure
              ? "part-measure-in-accord-derived-tail-rest"
              : "in-accord-derived-tail-rest",
          );
        }
      }
    }

    const assignment =
      solveRhythmMeasureConstraints(
        boundary,
        baselineByKey,
        constraints,
        noteConstraints,
        fixedUnits,
      );

    if (
      assignment
      === "complexity-exceeded"
    ) {
      return failure(
        "RHYTHM_COMPLEXITY_LIMIT_EXCEEDED",
        `The exact deterministic cyclic rhythm solver exceeded its bounded search budget in measure ${boundary.index}.`,
        {
          trackIndex:
            part.trackIndex,
          channel:
            part.channel,
        },
      );
    }

    if (
      assignment === null
    ) {
      return failure(
        "UNQUANTIZABLE_RHYTHM",
        `No shared-boundary rhythm solution satisfies all note/rest constraints within the frozen six-unit tolerance (measure ${boundary.index}).`,
        {
          trackIndex:
            part.trackIndex,
          channel:
            part.channel,
        },
      );
    }

    for (
      const [
        key,
        value,
      ]
      of assignment
    ) {
      const existing =
        correctedByKey.get(
          key,
        );

      if (
        existing !== undefined
        && existing !== value
      ) {
        return failure(
          "UNQUANTIZABLE_RHYTHM",
          "A shared MIDI boundary received inconsistent corrections across derived measures.",
          {
            trackIndex:
              part.trackIndex,
            channel:
              part.channel,
          },
        );
      }

      correctedByKey.set(
        key,
        value,
      );
    }
  }

  const corrected =
    baseline.map(
      (item) => {
        const startKey =
          keys.startKey.get(
            item.note,
          )!;
        const endKey =
          keys.endKey.get(
            item.note,
          )!;

        const startUnit =
          correctedByKey.get(
            startKey,
          )
          ?? item.startUnit;

        const endUnit =
          correctedByKey.get(
            endKey,
          )
          ?? item.endUnit;

        if (
          endUnit
          <= startUnit
        ) {
          throw new Error(
            "Shared-boundary rhythm solving collapsed a positive-duration MIDI note.",
          );
        }

        if (
          startUnit
            !== item.startUnit
          || endUnit
            !== item.endUnit
        ) {
          diagnostics.push(
            Object.freeze({
              code:
                "RHYTHM_BOUNDARY_COHERENCE_QUANTIZED",
              message:
                "A source-derived notation boundary was moved within the frozen six-unit window so notes, rests, and measure-bounded segments share one exactly decomposable timeline.",
              trackIndex:
                part.trackIndex,
              channel:
                part.channel,
              sourceStartTick:
                item.note.startTick,
              sourceEndTick:
                item.note.endTick,
            }),
          );
        }

        return Object.freeze({
          note:
            item.note,
          startUnit,
          endUnit,
        });
      },
    )
      .sort(
        (left, right) =>
          (
            left.startUnit
            - right.startUnit
          )
          || (
            left.note.noteNumber
            - right.note.noteNumber
          ),
      );

  for (
    const boundary
    of boundaries
  ) {
    if (
      boundary.startUnit
      >= partEnd
    ) {
      break;
    }

    const baselineSignature =
      baselineSignatures.get(
        boundary.index,
      );

    const correctedSignature =
      actionPartitionSignature(
        corrected,
        boundary,
        noteIndex,
      );

    if (
      baselineSignature
      !== correctedSignature
    ) {
      return failure(
        "UNQUANTIZABLE_RHYTHM",
        "Shared-boundary correction would change the frozen H4C derived-action partition.",
        {
          trackIndex:
            part.trackIndex,
          channel:
            part.channel,
        },
      );
    }
  }

  return Object.freeze(
    corrected,
  );
}

function cloneTranscriberAddedRest(
  rest: NotationRest,
): NotationRest {
  return Object.freeze({
    ...rest,
    transcriberAdded: true,
  });
}

function pushRestRange(
  target:
    NotationLinearMeasureEvent[],
  startUnit: number,
  endUnit: number,
  boundary:
    MeasureBoundary,
  boundaries:
    readonly MeasureBoundary[],
  transcriberAdded: boolean,
): NotationBuildFailure | null {
  if (endUnit <= startUnit) {
    return null;
  }

  const rests =
    createRestSegments(
      startUnit,
      endUnit,
      boundaries,
    );

  if (
    isNotationBuildFailure(rests)
  ) {
    return rests;
  }

  for (const item of rests) {
    if (
      item.measureIndex
      !== boundary.index
    ) {
      continue;
    }

    target.push(
      transcriberAdded
        ? cloneTranscriberAddedRest(
            item.rest,
          )
        : item.rest,
    );
  }

  return null;
}

function pushGroupNotes(
  target:
    NotationLinearMeasureEvent[],
  group:
    MeasureOnsetGroup,
  boundary:
    MeasureBoundary,
  boundaries:
    readonly MeasureBoundary[],
): NotationBuildFailure | null {
  for (const item of group.items) {
    const segments =
      createNoteSegments(
        item,
        boundaries,
      );

    if (
      isNotationBuildFailure(
        segments,
      )
    ) {
      return segments;
    }

    for (const segment of segments) {
      if (
        segment.measureIndex
        === boundary.index
      ) {
        target.push(
          segment.note,
        );
      }
    }
  }

  return null;
}

function buildActionEvents(
  action:
    DerivedAction,
  boundary:
    MeasureBoundary,
  boundaries:
    readonly MeasureBoundary[],
):
  | readonly NotationLinearMeasureEvent[]
  | NotationBuildFailure {
  const events:
    NotationLinearMeasureEvent[] = [];

  let cursor =
    boundary.startUnit;

  for (const group of action.groups) {
    const restFailure =
      pushRestRange(
        events,
        cursor,
        group.startUnit,
        boundary,
        boundaries,
        true,
      );

    if (restFailure !== null) {
      return restFailure;
    }

    const noteFailure =
      pushGroupNotes(
        events,
        group,
        boundary,
        boundaries,
      );

    if (noteFailure !== null) {
      return noteFailure;
    }

    cursor =
      Math.max(
        cursor,
        group.endUnit,
      );
  }

  const tailFailure =
    pushRestRange(
      events,
      cursor,
      boundary.endUnit,
      boundary,
      boundaries,
      true,
    );

  if (tailFailure !== null) {
    return tailFailure;
  }

  return groupMeasureEvents(events);
}

function buildLinearMeasureEvents(
  groups:
    readonly MeasureOnsetGroup[],
  boundary:
    MeasureBoundary,
  boundaries:
    readonly MeasureBoundary[],
  partHasLaterNotes: boolean,
):
  | readonly NotationLinearMeasureEvent[]
  | NotationBuildFailure {
  const events:
    NotationLinearMeasureEvent[] = [];

  if (groups.length === 0) {
    if (!partHasLaterNotes) {
      return Object.freeze([]);
    }

    const failureValue =
      pushRestRange(
        events,
        boundary.startUnit,
        boundary.endUnit,
        boundary,
        boundaries,
        false,
      );

    if (failureValue !== null) {
      return failureValue;
    }

    return groupMeasureEvents(events);
  }

  let cursor =
    boundary.startUnit;

  for (const group of groups) {
    const restFailure =
      pushRestRange(
        events,
        cursor,
        group.startUnit,
        boundary,
        boundaries,
        false,
      );

    if (restFailure !== null) {
      return restFailure;
    }

    const noteFailure =
      pushGroupNotes(
        events,
        group,
        boundary,
        boundaries,
      );

    if (noteFailure !== null) {
      return noteFailure;
    }

    cursor =
      Math.max(
        cursor,
        group.endUnit,
      );
  }

  if (
    partHasLaterNotes
    && cursor < boundary.endUnit
  ) {
    const tailFailure =
      pushRestRange(
        events,
        cursor,
        boundary.endUnit,
        boundary,
        boundaries,
        false,
      );

    if (tailFailure !== null) {
      return tailFailure;
    }
  }

  return groupMeasureEvents(events);
}

function buildPartWithInAccord(
  part:
    MidiSourcePart,
  source:
    MidiSemanticSource,
  boundaries:
    readonly MeasureBoundary[],
  diagnostics:
    NotationDiagnostic[],
  quantizationOverrides?:
    RhythmQuantizationOverrideMap,
  allowPartMeasureInAccord = false,
):
  | NotationPart
  | NotationBuildFailure {
  const polyphonyDiagnostics:
    NotationDiagnostic[] = [];

  const quantized =
    quantizePartNotes(
      part,
      source,
      polyphonyDiagnostics,
      true,
      quantizationOverrides,
    );

  if (
    isNotationBuildFailure(
      quantized,
    )
  ) {
    return quantized;
  }

  if (
    !hasIndependentOverlap(
      quantized,
    )
  ) {
    return buildPart(
      part,
      source,
      boundaries,
      diagnostics,
      quantizationOverrides,
    );
  }

  diagnostics.push(
    Object.freeze({
      code:
        "SOURCE_PART_DERIVED_FROM_TRACK_CHANNEL",
      message:
        "Notation part identity is conservatively derived from MIDI track plus channel.",
      trackIndex:
        part.trackIndex,
      channel:
        part.channel,
    }),
    ...polyphonyDiagnostics,
  );

  const partEnd =
    Math.max(
      ...quantized.map(
        (item) => item.endUnit,
      ),
    );

  const measures:
    NotationMeasure[] = [];

  let disclosedPartition = false;
  let disclosedOrdering = false;
  let disclosedAddedRest = false;
  let disclosedPartMeasure = false;

  for (const boundary of boundaries) {
    if (
      boundary.startUnit
      >= partEnd
    ) {
      break;
    }

    const groups =
      measureOnsetGroups(
        quantized,
        boundary,
      );

    const actions =
      partitionMeasureActions(
        groups,
      );

    const partHasLaterNotes =
      quantized.some(
        (item) =>
          item.startUnit
          >= boundary.endUnit,
      );

    let events:
      readonly NotationMeasureEvent[];

    if (actions.length <= 1) {
      const linear =
        buildLinearMeasureEvents(
          groups,
          boundary,
          boundaries,
          partHasLaterNotes,
        );

      if (
        isNotationBuildFailure(
          linear,
        )
      ) {
        return linear;
      }

      events = linear;
    } else {
      const incompletePartMeasure =
        partEnd
        < boundary.endUnit;

      if (
        incompletePartMeasure
        && !allowPartMeasureInAccord
      ) {
        return failure(
          "UNSUPPORTED_POLYPHONY",
          "Polyphony occurs in an incomplete final measure; part-measure in-accord support is required.",
          {
            trackIndex:
              part.trackIndex,
            channel:
              part.channel,
          },
        );
      }

      const inAccordBoundary:
        MeasureBoundary =
          incompletePartMeasure
            ? Object.freeze({
                ...boundary,
                endUnit:
                  partEnd,
              })
            : boundary;

      const ordered =
        [...actions]
          .sort((left, right) => {
            const leftAnchor =
              left.groups[0]
                ?.anchorMidiPitch
              ?? left.highestMidiPitch;
            const rightAnchor =
              right.groups[0]
                ?.anchorMidiPitch
              ?? right.highestMidiPitch;

            return (
              rightAnchor - leftAnchor
              || right.highestMidiPitch - left.highestMidiPitch
              || left.stableIndex - right.stableIndex
            );
          });

      const inAccordActions:
        NotationInAccordAction[] = [];

      for (const action of ordered) {
        const actionEvents =
          buildActionEvents(
            action,
            inAccordBoundary,
            boundaries,
          );

        if (
          isNotationBuildFailure(
            actionEvents,
          )
        ) {
          return actionEvents;
        }

        if (
          actionEvents.some(
            (event) =>
              event.kind === "rest"
              && event.transcriberAdded === true,
          )
        ) {
          disclosedAddedRest = true;
        }

        inAccordActions.push(
          Object.freeze({
            stableIndex:
              action.stableIndex,
            anchorMidiPitch:
              action.groups[0]
                ?.anchorMidiPitch
              ?? action.highestMidiPitch,
            highestMidiPitch:
              action.highestMidiPitch,
            events:
              Object.freeze(
                [...actionEvents],
              ),
          }),
        );
      }

      const inAccord:
        | NotationFullMeasureInAccord
        | NotationPartMeasureInAccord =
          incompletePartMeasure
            ? Object.freeze({
                kind:
                  "part-measure-in-accord",
                startUnit:
                  inAccordBoundary.startUnit,
                endUnit:
                  inAccordBoundary.endUnit,
                actions:
                  Object.freeze(
                    inAccordActions,
                  ),
              })
            : Object.freeze({
                kind:
                  "full-measure-in-accord",
                startUnit:
                  inAccordBoundary.startUnit,
                endUnit:
                  inAccordBoundary.endUnit,
                actions:
                  Object.freeze(
                    inAccordActions,
                  ),
              });

      events =
        Object.freeze([
          inAccord,
        ]);

      disclosedPartition = true;
      disclosedOrdering = true;
      disclosedPartMeasure =
        disclosedPartMeasure
        || incompletePartMeasure;
    }

    measures.push(
      Object.freeze({
        index:
          boundary.index,
        startUnit:
          boundary.startUnit,
        endUnit:
          boundary.endUnit,
        numerator:
          boundary.numerator,
        denominator:
          boundary.denominator,
        timeSignatureFromSource:
          boundary.timeSignatureFromSource,
        events,
      }),
    );
  }

  if (disclosedPartition) {
    diagnostics.push(
      Object.freeze({
        code:
          "INFERRED_MIDI_VOICE_PARTITION",
        message:
          "Independent MIDI overlap was partitioned deterministically into derived Music Braille in-accord actions; original voice numbering is not claimed.",
        trackIndex:
          part.trackIndex,
        channel:
          part.channel,
      }),
    );
  }

  if (disclosedOrdering) {
    diagnostics.push(
      Object.freeze({
        code:
          "IN_ACCORD_ORDER_CANONICALIZED_NO_STAFF",
        message:
          "MIDI does not preserve print staff/hand identity; derived in-accord actions use the frozen generic-MIDI highest-to-lowest canonical order.",
        trackIndex:
          part.trackIndex,
        channel:
          part.channel,
      }),
    );
  }

  if (disclosedAddedRest) {
    diagnostics.push(
      Object.freeze({
        code:
          "TRANSCRIBER_ADDED_IN_ACCORD_REST",
        message:
          "Derived in-accord actions contain gap rests that must be marked as transcriber-added with dot 5.",
        trackIndex:
          part.trackIndex,
        channel:
          part.channel,
      }),
    );
  }

  if (disclosedPartMeasure) {
    diagnostics.push(
      Object.freeze({
        code:
          "PART_MEASURE_IN_ACCORD_DERIVED",
        message:
          "A terminal incomplete MIDI measure was represented by the frozen single-section part-measure in-accord profile; no original print sectioning is claimed.",
        trackIndex:
          part.trackIndex,
        channel:
          part.channel,
      }),
    );
  }

  return Object.freeze({
    trackIndex:
      part.trackIndex,
    channel:
      part.channel,
    measures:
      Object.freeze(
        measures,
      ),
  });
}

function buildPart(
  part:
    MidiSourcePart,
  source:
    MidiSemanticSource,
  boundaries:
    readonly MeasureBoundary[],
  diagnostics:
    NotationDiagnostic[],
  quantizationOverrides?:
    RhythmQuantizationOverrideMap,
):
  | NotationPart
  | NotationBuildFailure {
  diagnostics.push(
    Object.freeze({
      code:
        "SOURCE_PART_DERIVED_FROM_TRACK_CHANNEL",
      message:
        "Notation part identity is conservatively derived from MIDI track plus channel.",
      trackIndex:
        part.trackIndex,
      channel:
        part.channel,
    }),
  );

  const quantized =
    quantizePartNotes(
      part,
      source,
      diagnostics,
      false,
      quantizationOverrides,
    );

  if (
    isNotationBuildFailure(
      quantized,
    )
  ) {
    return quantized;
  }

  const eventsByMeasure =
    new Map<
      number,
      NotationLinearMeasureEvent[]
    >();

  const onsetGroups =
    new Map<
      number,
      QuantizedSourceNote[]
    >();

  for (
    const item
    of quantized
  ) {
    const group =
      onsetGroups.get(
        item.startUnit,
      ) ?? [];

    group.push(
      item,
    );

    onsetGroups.set(
      item.startUnit,
      group,
    );
  }

  const groups =
    [
      ...onsetGroups.entries(),
    ].sort(
      (left, right) =>
        left[0] - right[0],
    );

  let soundingEnd = 0;

  for (
    const [
      onset,
      group,
    ]
    of groups
  ) {
    if (
      onset > soundingEnd
    ) {
      const rests =
        createRestSegments(
          soundingEnd,
          onset,
          boundaries,
        );

      if (
        isNotationBuildFailure(
          rests,
        )
      ) {
        return rests;
      }

      for (
        const item
        of rests
      ) {
        const measureEvents =
          eventsByMeasure.get(
            item.measureIndex,
          ) ?? [];

        measureEvents.push(
          item.rest,
        );

        eventsByMeasure.set(
          item.measureIndex,
          measureEvents,
        );
      }
    }

    for (
      const item
      of group
    ) {
      const segments =
        createNoteSegments(
          item,
          boundaries,
        );

      if (
        isNotationBuildFailure(
          segments,
        )
      ) {
        return segments;
      }

      for (
        const segment
        of segments
      ) {
        const measureEvents =
          eventsByMeasure.get(
            segment.measureIndex,
          ) ?? [];

        measureEvents.push(
          segment.note,
        );

        eventsByMeasure.set(
          segment.measureIndex,
          measureEvents,
        );
      }
    }

    soundingEnd =
      Math.max(
        ...group.map(
          (item) =>
            item.endUnit,
        ),
      );
  }

  const partEnd =
    quantized.length === 0
      ? 0
      : Math.max(
          ...quantized.map(
            (item) =>
              item.endUnit,
          ),
        );

  const measures:
    NotationMeasure[] = [];

  for (
    const boundary
    of boundaries
  ) {
    if (
      boundary.startUnit
      >= partEnd
    ) {
      break;
    }

    measures.push(
      Object.freeze({
        index:
          boundary.index,
        startUnit:
          boundary.startUnit,
        endUnit:
          boundary.endUnit,
        numerator:
          boundary.numerator,
        denominator:
          boundary.denominator,
        timeSignatureFromSource:
          boundary
            .timeSignatureFromSource,
        events:
          groupMeasureEvents(
            eventsByMeasure.get(
              boundary.index,
            ) ?? [],
          ),
      }),
    );
  }

  return Object.freeze({
    trackIndex:
      part.trackIndex,
    channel:
      part.channel,
    measures:
      Object.freeze(
        measures,
      ),
  });
}

export function buildNotationScore(
  source:
    MidiSemanticSource,
  options:
    NotationBuildOptions = {},
): NotationBuildResult {
  const diagnostics:
    NotationDiagnostic[] = [];

  const coherenceEnabled =
    options.rhythmProfile
    === GENERIC_MIDI_SHARED_BOUNDARY_RHYTHM_PROFILE_ID;

  const partMeasureEnabled =
    options.partMeasureInAccordProfile
    === GENERIC_MIDI_PART_MEASURE_IN_ACCORD_PROFILE_ID;

  if (
    partMeasureEnabled
    && options.polyphonyProfile
      !== GENERIC_MIDI_IN_ACCORD_PROFILE_ID
  ) {
    return failure(
      "UNSUPPORTED_MUSIC_BRAILLE_CONSTRUCT",
      "The part-measure in-accord profile requires the frozen generic MIDI in-accord polyphony profile.",
    );
  }

  const prepared =
    coherenceEnabled
      ? prepareRhythmCoherenceSource(
          source,
          diagnostics,
        )
      : source;

  if (
    isNotationBuildFailure(
      prepared,
    )
  ) {
    return prepared;
  }

  const workingSource =
    prepared;

  const temporaryQuantized:
    QuantizedSourceNote[] = [];

  const baselineByPart =
    new Map<
      MidiSourcePart,
      readonly QuantizedSourceNote[]
    >();

  for (
    const part
    of workingSource.parts
  ) {
    const result =
      coherenceEnabled
        ? baselineQuantizePartNotes(
            part,
            workingSource,
            diagnostics,
          )
        : quantizePartNotes(
            part,
            workingSource,
            [],
            options.polyphonyProfile
              === GENERIC_MIDI_IN_ACCORD_PROFILE_ID,
          );

    if (
      isNotationBuildFailure(
        result,
      )
    ) {
      return result;
    }

    if (
      coherenceEnabled
    ) {
      baselineByPart.set(
        part,
        result,
      );
    }

    temporaryQuantized.push(
      ...result,
    );
  }

  if (
    temporaryQuantized.length === 0
  ) {
    return failure(
      "UNQUANTIZABLE_RHYTHM",
      "No positive-duration MIDI notes are available for notation construction.",
    );
  }

  const maxEndUnit =
    Math.max(
      ...temporaryQuantized.map(
        (item) =>
          item.endUnit,
      ),
    );

  const boundaries =
    buildMeasureBoundaries(
      workingSource,
      maxEndUnit,
      diagnostics,
    );

  if (
    isNotationBuildFailure(
      boundaries,
    )
  ) {
    return boundaries;
  }

  let quantizationOverrides:
    Map<
      MidiNote,
      QuantizedSourceNote
    > | undefined;

  if (
    coherenceEnabled
  ) {
    quantizationOverrides =
      new Map<
        MidiNote,
        QuantizedSourceNote
      >();

    for (
      const part
      of workingSource.parts
    ) {
      const baseline =
        baselineByPart.get(
          part,
        );

      if (
        baseline === undefined
      ) {
        throw new Error(
          "Rhythm coherence baseline is missing for a source part.",
        );
      }

      const corrected =
        solvePartRhythmCoherence(
          part,
          baseline,
          boundaries,
          diagnostics,
          partMeasureEnabled,
        );

      if (
        isNotationBuildFailure(
          corrected,
        )
      ) {
        return corrected;
      }

      for (
        const item
        of corrected
      ) {
        quantizationOverrides.set(
          item.note,
          item,
        );
      }
    }
  }

  const parts:
    NotationPart[] = [];

  for (
    const sourcePart
    of workingSource.parts
  ) {
    const part =
      options.polyphonyProfile
        === GENERIC_MIDI_IN_ACCORD_PROFILE_ID
        ? buildPartWithInAccord(
            sourcePart,
            workingSource,
            boundaries,
            diagnostics,
            quantizationOverrides,
            partMeasureEnabled,
          )
        : buildPart(
            sourcePart,
            workingSource,
            boundaries,
            diagnostics,
            quantizationOverrides,
          );

    if (
      "ok"
      in part
    ) {
      return part;
    }

    parts.push(
      part,
    );
  }

  return Object.freeze({
    ok: true as const,
    score:
      Object.freeze({
        unitsPerQuarter:
          NOTATION_UNITS_PER_QUARTER,
        parts:
          Object.freeze(
            parts,
          ),
        diagnostics:
          Object.freeze(
            diagnostics,
          ),
        sourceTempoEvents:
          source.tempoEvents,
        sourceTimeSignatureEvents:
          source.timeSignatureEvents,
        sourceKeySignatureEvents:
          source.keySignatureEvents,
      }),
  });
}
