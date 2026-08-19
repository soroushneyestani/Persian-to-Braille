import type {
  MidiNote,
  MidiPitchBendEvent,
  MidiSemanticSource,
  MidiSourcePart,
} from "./types.js";

export type MidiSourceClassificationDiagnosticCode =
  | "NON_PITCHED_SOURCE_EVENT_SKIPPED"
  | "NON_PITCHED_PITCH_BEND_SKIPPED";

export interface MidiSourceClassificationDiagnostic {
  readonly code:
    MidiSourceClassificationDiagnosticCode;
  readonly message: string;
  readonly trackIndex: number;
  readonly channel: number;
  readonly sourceStartTick?: number;
  readonly sourceEndTick?: number;
}

export interface MidiSourceClassificationSuccess {
  readonly ok: true;
  readonly source:
    MidiSemanticSource;
  readonly diagnostics:
    readonly MidiSourceClassificationDiagnostic[];
}

export interface MidiSourceClassificationFailure {
  readonly ok: false;
  readonly code:
    | "UNSUPPORTED_PITCH_BEND"
    | "NO_MUSICAL_NOTES";
  readonly message: string;
  readonly trackIndex?: number;
  readonly channel?: number;
  readonly sourceTick?: number;
}

export type MidiSourceClassificationResult =
  | MidiSourceClassificationSuccess
  | MidiSourceClassificationFailure;

interface SkippedGroup {
  readonly trackIndex: number;
  readonly channel: number;
  readonly program: number;
  count: number;
  startTick: number;
  endTick: number;
}

function isNonPitched(
  channel: number,
  program: number,
): boolean {
  return (
    channel === 9
    || (
      program >= 119
      && program <= 127
    )
  );
}

function buildParts(
  notes: readonly MidiNote[],
): readonly MidiSourcePart[] {
  const grouped =
    new Map<
      string,
      {
        readonly trackIndex: number;
        readonly channel: number;
        readonly notes: MidiNote[];
      }
    >();

  for (
    const note
    of notes
  ) {
    const key =
      `${note.trackIndex}:${note.channel}`;

    const existing =
      grouped.get(
        key,
      );

    if (
      existing !== undefined
    ) {
      existing.notes.push(
        note,
      );
      continue;
    }

    grouped.set(
      key,
      {
        trackIndex:
          note.trackIndex,
        channel:
          note.channel,
        notes: [
          note,
        ],
      },
    );
  }

  return Object.freeze(
    [
      ...grouped.values(),
    ]
      .sort(
        (left, right) =>
          (
            left.trackIndex
            - right.trackIndex
          )
          || (
            left.channel
            - right.channel
          ),
      )
      .map(
        (part) =>
          Object.freeze({
            trackIndex:
              part.trackIndex,
            channel:
              part.channel,
            notes:
              Object.freeze(
                [
                  ...part.notes,
                ],
              ),
          }),
      ),
  );
}

function noteSkipKey(
  note: MidiNote,
): string {
  return (
    `${note.trackIndex}:`
    + `${note.channel}:`
    + `${note.program}`
  );
}

function bendSkipKey(
  bend: MidiPitchBendEvent,
): string {
  return (
    `${bend.trackIndex}:`
    + `${bend.channel}:`
    + `${bend.effectiveProgram}`
  );
}

function pushSkippedNote(
  groups: Map<string, SkippedGroup>,
  note: MidiNote,
): void {
  const key =
    noteSkipKey(
      note,
    );

  const existing =
    groups.get(
      key,
    );

  if (
    existing !== undefined
  ) {
    existing.count += 1;
    existing.startTick =
      Math.min(
        existing.startTick,
        note.startTick,
      );
    existing.endTick =
      Math.max(
        existing.endTick,
        note.endTick,
      );
    return;
  }

  groups.set(
    key,
    {
      trackIndex:
        note.trackIndex,
      channel:
        note.channel,
      program:
        note.program,
      count: 1,
      startTick:
        note.startTick,
      endTick:
        note.endTick,
    },
  );
}

function pushSkippedBend(
  groups: Map<string, SkippedGroup>,
  bend: MidiPitchBendEvent,
): void {
  const key =
    bendSkipKey(
      bend,
    );

  const existing =
    groups.get(
      key,
    );

  if (
    existing !== undefined
  ) {
    existing.count += 1;
    existing.startTick =
      Math.min(
        existing.startTick,
        bend.tick,
      );
    existing.endTick =
      Math.max(
        existing.endTick,
        bend.tick,
      );
    return;
  }

  groups.set(
    key,
    {
      trackIndex:
        bend.trackIndex,
      channel:
        bend.channel,
      program:
        bend.effectiveProgram,
      count: 1,
      startTick:
        bend.tick,
      endTick:
        bend.tick,
    },
  );
}

function skippedNoteDiagnostic(
  group: SkippedGroup,
): MidiSourceClassificationDiagnostic {
  return Object.freeze({
    code:
      "NON_PITCHED_SOURCE_EVENT_SKIPPED",
    message:
      `Skipped ${group.count} non-pitched MIDI note event(s) `
      + `from track ${group.trackIndex}, channel ${group.channel}, `
      + `program ${group.program}.`,
    trackIndex:
      group.trackIndex,
    channel:
      group.channel,
    sourceStartTick:
      group.startTick,
    sourceEndTick:
      group.endTick,
  });
}

function skippedBendDiagnostic(
  group: SkippedGroup,
): MidiSourceClassificationDiagnostic {
  return Object.freeze({
    code:
      "NON_PITCHED_PITCH_BEND_SKIPPED",
    message:
      `Skipped ${group.count} non-center pitch-bend event(s) `
      + `attached to non-pitched MIDI material on track `
      + `${group.trackIndex}, channel ${group.channel}, `
      + `program ${group.program}.`,
    trackIndex:
      group.trackIndex,
    channel:
      group.channel,
    sourceStartTick:
      group.startTick,
    sourceEndTick:
      group.endTick,
  });
}

export function classifyMidiSemanticSource(
  source: MidiSemanticSource,
): MidiSourceClassificationResult {
  const retainedNotes:
    MidiNote[] = [];

  const skippedNotes =
    new Map<
      string,
      SkippedGroup
    >();

  for (
    const note
    of source.notes
  ) {
    if (
      isNonPitched(
        note.channel,
        note.program,
      )
    ) {
      pushSkippedNote(
        skippedNotes,
        note,
      );
      continue;
    }

    retainedNotes.push(
      note,
    );
  }

  const skippedBends =
    new Map<
      string,
      SkippedGroup
    >();

  for (
    const bend
    of source.pitchBendEvents
  ) {
    if (
      bend.value === 8192
    ) {
      continue;
    }

    if (
      isNonPitched(
        bend.channel,
        bend.effectiveProgram,
      )
    ) {
      pushSkippedBend(
        skippedBends,
        bend,
      );
      continue;
    }

    return Object.freeze({
      ok: false,
      code:
        "UNSUPPORTED_PITCH_BEND",
      message:
        "A non-center MIDI pitch bend affects retained pitched material and cannot be flattened by the Phase 14 transcription profile.",
      trackIndex:
        bend.trackIndex,
      channel:
        bend.channel,
      sourceTick:
        bend.tick,
    });
  }

  if (
    retainedNotes.length === 0
  ) {
    return Object.freeze({
      ok: false,
      code:
        "NO_MUSICAL_NOTES",
      message:
        "MIDI contains no retained pitched note events after non-pitched source classification.",
    });
  }

  const frozenNotes =
    Object.freeze(
      [
        ...retainedNotes,
      ],
    );

  const diagnostics =
    Object.freeze([
      ...[
        ...skippedNotes.values(),
      ].map(
        skippedNoteDiagnostic,
      ),
      ...[
        ...skippedBends.values(),
      ].map(
        skippedBendDiagnostic,
      ),
    ]);

  return Object.freeze({
    ok: true,
    source:
      Object.freeze({
        ...source,
        notes:
          frozenNotes,
        parts:
          buildParts(
            frozenNotes,
          ),
      }),
    diagnostics,
  });
}
