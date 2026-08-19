import type {
  MidiNote,
} from "./types.js";

import {
  NOTATION_UNITS_PER_QUARTER,
} from "./notation-types.js";

import type {
  NotationDiagnostic,
  NotationDuration,
  NotationDurationName,
} from "./notation-types.js";

export const MAX_QUANTIZATION_ERROR_UNITS =
  6 as const;

const DURATION_TABLE:
  readonly NotationDuration[] =
    Object.freeze([
      Object.freeze({
        name: "dotted-whole",
        units: 576,
        dotted: true,
        triplet: false,
      }),
      Object.freeze({
        name: "whole",
        units: 384,
        dotted: false,
        triplet: false,
      }),
      Object.freeze({
        name: "dotted-half",
        units: 288,
        dotted: true,
        triplet: false,
      }),
      Object.freeze({
        name: "half",
        units: 192,
        dotted: false,
        triplet: false,
      }),
      Object.freeze({
        name: "half-triplet",
        units: 128,
        dotted: false,
        triplet: true,
      }),
      Object.freeze({
        name: "dotted-quarter",
        units: 144,
        dotted: true,
        triplet: false,
      }),
      Object.freeze({
        name: "quarter",
        units: 96,
        dotted: false,
        triplet: false,
      }),
      Object.freeze({
        name: "dotted-eighth",
        units: 72,
        dotted: true,
        triplet: false,
      }),
      Object.freeze({
        name: "quarter-triplet",
        units: 64,
        dotted: false,
        triplet: true,
      }),
      Object.freeze({
        name: "eighth",
        units: 48,
        dotted: false,
        triplet: false,
      }),
      Object.freeze({
        name: "dotted-sixteenth",
        units: 36,
        dotted: true,
        triplet: false,
      }),
      Object.freeze({
        name: "eighth-triplet",
        units: 32,
        dotted: false,
        triplet: true,
      }),
      Object.freeze({
        name: "sixteenth",
        units: 24,
        dotted: false,
        triplet: false,
      }),
      Object.freeze({
        name: "dotted-thirty-second",
        units: 18,
        dotted: true,
        triplet: false,
      }),
      Object.freeze({
        name: "sixteenth-triplet",
        units: 16,
        dotted: false,
        triplet: true,
      }),
      Object.freeze({
        name: "thirty-second",
        units: 12,
        dotted: false,
        triplet: false,
      }),
      Object.freeze({
        name: "dotted-sixty-fourth",
        units: 9,
        dotted: true,
        triplet: false,
      }),
      Object.freeze({
        name: "thirty-second-triplet",
        units: 8,
        dotted: false,
        triplet: true,
      }),
      Object.freeze({
        name: "sixty-fourth",
        units: 6,
        dotted: false,
        triplet: false,
      }),
    ]);

const DURATION_BY_NAME =
  new Map<
    NotationDurationName,
    NotationDuration
  >(
    DURATION_TABLE.map(
      (duration) => [
        duration.name,
        duration,
      ],
    ),
  );

export function getNotationDuration(
  name:
    NotationDurationName,
): NotationDuration {
  const duration =
    DURATION_BY_NAME.get(
      name,
    );

  if (
    duration === undefined
  ) {
    throw new Error(
      `Unknown notation duration: ${name}`,
    );
  }

  return duration;
}

export function getSupportedNotationDurations():
  readonly NotationDuration[] {
  return DURATION_TABLE;
}

function roundRationalHalfForward(
  numerator: number,
  denominator: number,
): number {
  const quotient =
    Math.floor(
      numerator / denominator,
    );

  const remainder =
    numerator
    - (
      quotient
      * denominator
    );

  return (
    remainder * 2
    >= denominator
  )
    ? quotient + 1
    : quotient;
}

export interface QuantizedPosition {
  readonly unit: number;
  readonly changed: boolean;
}

export function quantizeMidiTick(
  tick: number,
  ticksPerQuarterNote: number,
): QuantizedPosition {
  if (
    !Number.isInteger(
      tick,
    )
    || tick < 0
  ) {
    throw new Error(
      "MIDI tick must be a non-negative integer.",
    );
  }

  if (
    !Number.isInteger(
      ticksPerQuarterNote,
    )
    || ticksPerQuarterNote <= 0
  ) {
    throw new Error(
      "PPQN must be a positive integer.",
    );
  }

  const numerator =
    tick
    * NOTATION_UNITS_PER_QUARTER;

  const unit =
    roundRationalHalfForward(
      numerator,
      ticksPerQuarterNote,
    );

  return Object.freeze({
    unit,
    changed:
      unit * ticksPerQuarterNote
      !== numerator,
  });
}

export interface QuantizedMidiNote {
  readonly startUnit: number;
  readonly endUnit: number;
  readonly diagnostics:
    readonly NotationDiagnostic[];
}

function chooseRepresentableIntervalUnits(
  targetUnits: number,
): number | null {
  if (
    !Number.isInteger(targetUnits)
    || targetUnits <= 0
  ) {
    return null;
  }

  if (
    decomposeExactDurationUnits(
      targetUnits,
    ) !== null
  ) {
    return targetUnits;
  }

  for (
    let distance = 1;
    distance <= MAX_QUANTIZATION_ERROR_UNITS;
    distance += 1
  ) {
    const shorter =
      targetUnits - distance;

    if (
      shorter > 0
      && decomposeExactDurationUnits(
        shorter,
      ) !== null
    ) {
      return shorter;
    }

    const longer =
      targetUnits + distance;

    if (
      decomposeExactDurationUnits(
        longer,
      ) !== null
    ) {
      return longer;
    }
  }

  return null;
}

export function quantizeMidiNote(
  note: MidiNote,
  ticksPerQuarterNote: number,
): QuantizedMidiNote | null {
  const start =
    quantizeMidiTick(
      note.startTick,
      ticksPerQuarterNote,
    );

  const end =
    quantizeMidiTick(
      note.endTick,
      ticksPerQuarterNote,
    );

  const boundaryDurationUnits =
    end.unit - start.unit;

  if (
    boundaryDurationUnits <= 0
  ) {
    return null;
  }

  const representedDurationUnits =
    chooseRepresentableIntervalUnits(
      boundaryDurationUnits,
    );

  if (
    representedDurationUnits === null
  ) {
    return null;
  }

  const diagnostics:
    NotationDiagnostic[] = [];

  const intervalCorrected =
    representedDurationUnits
    !== boundaryDurationUnits;

  if (
    start.changed
    || end.changed
    || intervalCorrected
  ) {
    diagnostics.push(
      Object.freeze({
        code:
          "RHYTHM_QUANTIZED",
        message:
          "MIDI timing was quantized to the frozen 96-unit notation grid and, when necessary, to the nearest exactly decomposable rhythmic interval within the six-unit tolerance.",
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

  return Object.freeze({
    startUnit:
      start.unit,
    endUnit:
      start.unit
      + representedDurationUnits,
    diagnostics:
      Object.freeze(
        diagnostics,
      ),
  });
}

interface ExactDecompositionCandidate {
  readonly durations:
    readonly NotationDuration[];
  readonly tripletCount: number;
}

const EXACT_DECOMPOSITION_MEMO =
  new Map<
    string,
    ExactDecompositionCandidate | null
  >();

const EXACT_DECOMPOSITION_TABLE =
  Object.freeze(
    [...DURATION_TABLE].sort(
      (left, right) =>
        right.units - left.units,
    ),
  );

function compareExactDurationSequences(
  left:
    readonly NotationDuration[],
  right:
    readonly NotationDuration[],
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
    const leftUnits =
      left[index]!.units;
    const rightUnits =
      right[index]!.units;

    if (
      leftUnits !== rightUnits
    ) {
      return (
        rightUnits - leftUnits
      );
    }
  }

  return (
    left.length - right.length
  );
}

function isBetterExactDecomposition(
  candidate:
    ExactDecompositionCandidate,
  current:
    ExactDecompositionCandidate | null,
): boolean {
  if (
    current === null
  ) {
    return true;
  }

  if (
    candidate.tripletCount
    !== current.tripletCount
  ) {
    return (
      candidate.tripletCount
      < current.tripletCount
    );
  }

  if (
    candidate.durations.length
    !== current.durations.length
  ) {
    return (
      candidate.durations.length
      < current.durations.length
    );
  }

  return (
    compareExactDurationSequences(
      candidate.durations,
      current.durations,
    ) < 0
  );
}

function solveExactDuration(
  remaining: number,
  minimumIndex: number,
): ExactDecompositionCandidate | null {
  if (
    remaining === 0
  ) {
    return Object.freeze({
      durations:
        Object.freeze([]),
      tripletCount: 0,
    });
  }

  const key =
    `${remaining}:${minimumIndex}`;

  if (
    EXACT_DECOMPOSITION_MEMO.has(
      key,
    )
  ) {
    return (
      EXACT_DECOMPOSITION_MEMO.get(
        key,
      ) ?? null
    );
  }

  let best:
    ExactDecompositionCandidate | null =
      null;

  for (
    let index = minimumIndex;
    index
      < EXACT_DECOMPOSITION_TABLE.length;
    index += 1
  ) {
    const duration =
      EXACT_DECOMPOSITION_TABLE[
        index
      ];

    if (
      duration === undefined
      || duration.units > remaining
    ) {
      continue;
    }

    const tail =
      solveExactDuration(
        remaining - duration.units,
        index,
      );

    if (
      tail === null
    ) {
      continue;
    }

    const candidate:
      ExactDecompositionCandidate =
        Object.freeze({
          durations:
            Object.freeze([
              duration,
              ...tail.durations,
            ]),
          tripletCount:
            tail.tripletCount
            + (
              duration.triplet
                ? 1
                : 0
            ),
        });

    if (
      isBetterExactDecomposition(
        candidate,
        best,
      )
    ) {
      best =
        candidate;
    }
  }

  EXACT_DECOMPOSITION_MEMO.set(
    key,
    best,
  );

  return best;
}

export function decomposeExactDurationUnits(
  units: number,
): readonly NotationDuration[] | null {
  if (
    !Number.isInteger(
      units,
    )
    || units < 0
  ) {
    return null;
  }

  if (
    units === 0
  ) {
    return Object.freeze([]);
  }

  const result =
    solveExactDuration(
      units,
      0,
    );

  return (
    result === null
      ? null
      : result.durations
  );
}
