import {
  quantizeMidiTick,
} from "./quantization.js";

import type {
  MidiNote,
  MidiSemanticSource,
  MidiSourcePart,
} from "./types.js";

export const GENERIC_MIDI_GLOBAL_PIANO_ROLL_REDUCTION_PROFILE_ID =
  "GENERIC_MIDI_GLOBAL_PIANO_ROLL_REDUCTION_V1" as const;

export type MidiPianoRollReductionDiagnosticCode =
  | "GLOBAL_PIANO_ROLL_REDUCTION_APPLIED"
  | "DUPLICATE_PIANO_ATTACKS_COLLAPSED"
  | "PITCH_BEND_PRESERVED_AS_METADATA";

export interface MidiPianoRollReductionDiagnostic {
  readonly code:
    MidiPianoRollReductionDiagnosticCode;
  readonly message: string;
}

export interface MidiPianoRollContributor {
  readonly trackIndex: number;
  readonly channel: number;
  readonly program: number;
  readonly startTick: number;
  readonly endTick: number;
  readonly velocity: number;
}

export interface MidiPianoRollProvenanceEntry {
  readonly canonicalOnsetUnit: number;
  readonly midiNoteNumber: number;
  readonly outputStartTick: number;
  readonly outputEndTick: number;
  readonly contributors:
    readonly MidiPianoRollContributor[];
}

export interface MidiGlobalPianoRollReduction {
  readonly profileId:
    typeof GENERIC_MIDI_GLOBAL_PIANO_ROLL_REDUCTION_PROFILE_ID;
  readonly source:
    MidiSemanticSource;
  readonly diagnostics:
    readonly MidiPianoRollReductionDiagnostic[];
  readonly provenance:
    readonly MidiPianoRollProvenanceEntry[];
  readonly rawNoteCount: number;
  readonly pianoAttackCount: number;
  readonly duplicateAttackGroupCount: number;
  readonly collapsedContributorEvents: number;
}

interface MutableGroup {
  readonly canonicalOnsetUnit: number;
  readonly midiNoteNumber: number;
  readonly notes: MidiNote[];
}

function groupKey(
  canonicalOnsetUnit: number,
  midiNoteNumber: number,
): string {
  return (
    `${canonicalOnsetUnit}:`
    + `${midiNoteNumber}`
  );
}

function freezeContributor(
  note: MidiNote,
): MidiPianoRollContributor {
  return Object.freeze({
    trackIndex:
      note.trackIndex,
    channel:
      note.channel,
    program:
      note.program,
    startTick:
      note.startTick,
    endTick:
      note.endTick,
    velocity:
      note.velocity,
  });
}

export function reduceMidiToGlobalPianoRoll(
  source:
    MidiSemanticSource,
): MidiGlobalPianoRollReduction {
  const groups =
    new Map<
      string,
      MutableGroup
    >();

  for (
    const note
    of source.notes
  ) {
    const canonicalOnsetUnit =
      quantizeMidiTick(
        note.startTick,
        source.ticksPerQuarterNote,
      ).unit;

    const key =
      groupKey(
        canonicalOnsetUnit,
        note.noteNumber,
      );

    const existing =
      groups.get(
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

    groups.set(
      key,
      {
        canonicalOnsetUnit,
        midiNoteNumber:
          note.noteNumber,
        notes: [
          note,
        ],
      },
    );
  }

  const reduced:
    Array<
      Readonly<{
        note: MidiNote;
        canonicalOnsetUnit: number;
        contributors:
          readonly MidiPianoRollContributor[];
      }>
    > = [];

  let duplicateAttackGroupCount = 0;
  let collapsedContributorEvents = 0;

  for (
    const group
    of groups.values()
  ) {
    const contributors =
      [...group.notes]
        .sort(
          (left, right) =>
            (
              left.startTick
              - right.startTick
            )
            || (
              left.trackIndex
              - right.trackIndex
            )
            || (
              left.channel
              - right.channel
            )
            || (
              left.program
              - right.program
            )
            || (
              left.endTick
              - right.endTick
            ),
        );

    const outputStartTick =
      Math.min(
        ...contributors.map(
          (note) =>
            note.startTick,
        ),
      );

    const outputEndTick =
      Math.max(
        ...contributors.map(
          (note) =>
            note.endTick,
        ),
      );

    const outputVelocity =
      Math.max(
        ...contributors.map(
          (note) =>
            note.velocity,
        ),
      );

    if (
      contributors.length > 1
    ) {
      duplicateAttackGroupCount +=
        1;

      collapsedContributorEvents +=
        contributors.length - 1;
    }

    reduced.push(
      Object.freeze({
        canonicalOnsetUnit:
          group.canonicalOnsetUnit,
        note:
          Object.freeze({
            trackIndex: 0,
            channel: 0,
            noteNumber:
              group.midiNoteNumber,
            velocity:
              outputVelocity,
            program: 0,
            startTick:
              outputStartTick,
            endTick:
              outputEndTick,
          }),
        contributors:
          Object.freeze(
            contributors.map(
              freezeContributor,
            ),
          ),
      }),
    );
  }

  reduced.sort(
    (left, right) =>
      (
        left.canonicalOnsetUnit
        - right.canonicalOnsetUnit
      )
      || (
        left.note.noteNumber
        - right.note.noteNumber
      )
      || (
        left.note.startTick
        - right.note.startTick
      )
      || (
        left.note.endTick
        - right.note.endTick
      ),
  );

  const frozenNotes =
    Object.freeze(
      reduced.map(
        (item) =>
          item.note,
      ),
    );

  const syntheticPart:
    MidiSourcePart =
      Object.freeze({
        trackIndex: 0,
        channel: 0,
        notes:
          frozenNotes,
      });

  const diagnostics:
    MidiPianoRollReductionDiagnostic[] = [
      Object.freeze({
        code:
          "GLOBAL_PIANO_ROLL_REDUCTION_APPLIED",
        message:
          `Merged ${source.parts.length} MIDI source part(s) and ${source.notes.length} note event(s) into one synthetic piano-roll part with ${frozenNotes.length} unique piano attack(s).`,
      }),
    ];

  if (
    collapsedContributorEvents > 0
  ) {
    diagnostics.push(
      Object.freeze({
        code:
          "DUPLICATE_PIANO_ATTACKS_COLLAPSED",
        message:
          `Collapsed ${collapsedContributorEvents} duplicate contributor event(s) across ${duplicateAttackGroupCount} same-canonical-onset/same-pitch attack group(s); each retained attack uses the maximum contributor release.`,
      }),
    );
  }

  if (
    source.pitchBendEvents.length > 0
  ) {
    diagnostics.push(
      Object.freeze({
        code:
          "PITCH_BEND_PRESERVED_AS_METADATA",
        message:
          "Pitch-bend metadata was preserved as source metadata and did not remove or reject any underlying discrete MIDI piano-key event.",
      }),
    );
  }

  const provenance =
    Object.freeze(
      reduced.map(
        (item) =>
          Object.freeze({
            canonicalOnsetUnit:
              item.canonicalOnsetUnit,
            midiNoteNumber:
              item.note.noteNumber,
            outputStartTick:
              item.note.startTick,
            outputEndTick:
              item.note.endTick,
            contributors:
              item.contributors,
          }),
      ),
    );

  return Object.freeze({
    profileId:
      GENERIC_MIDI_GLOBAL_PIANO_ROLL_REDUCTION_PROFILE_ID,
    source:
      Object.freeze({
        ...source,
        notes:
          frozenNotes,
        parts:
          Object.freeze([
            syntheticPart,
          ]),
      }),
    diagnostics:
      Object.freeze(
        diagnostics,
      ),
    provenance,
    rawNoteCount:
      source.notes.length,
    pianoAttackCount:
      frozenNotes.length,
    duplicateAttackGroupCount,
    collapsedContributorEvents,
  });
}
