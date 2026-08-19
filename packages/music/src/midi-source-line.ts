import {
  parseStandardMidiFile,
} from "./smf-parser.js";

import type {
  MidiParserFailureCode,
  MidiSemanticSource,
} from "./types.js";

export interface MidiSourceLineSelection {
  readonly trackIndex: number;
  readonly channel: number;
}

export interface MidiSourceLineInfo
  extends MidiSourceLineSelection {
  readonly id: string;
  readonly channelOneBased: number;
  readonly noteCount: number;
}

export interface MidiSourceLineInspectionSuccess {
  readonly ok: true;
  readonly format: 0 | 1;
  readonly ticksPerQuarterNote: number;
  readonly lines: readonly MidiSourceLineInfo[];
}

export interface MidiSourceLineInspectionFailure {
  readonly ok: false;
  readonly code: MidiParserFailureCode;
  readonly message: string;
  readonly byteOffset?: number;
}

export type MidiSourceLineInspectionResult =
  | MidiSourceLineInspectionSuccess
  | MidiSourceLineInspectionFailure;

function lineId(
  trackIndex: number,
  channel: number,
): string {
  return `${trackIndex}:${channel}`;
}

export function inspectMidiSourceLines(
  input:
    | Uint8Array
    | ArrayBuffer,
): MidiSourceLineInspectionResult {
  const parsed =
    parseStandardMidiFile(
      input,
    );

  if (parsed.ok === false) {
    return Object.freeze({
      ok: false,
      code:
        parsed.code,
      message:
        parsed.message,
      ...(parsed.location !== undefined
        ? {
            byteOffset:
              parsed.location.byteOffset,
          }
        : {}),
    });
  }

  const lines =
    parsed.source.parts
      .filter(
        (part) =>
          part.notes.length > 0,
      )
      .map(
        (part): MidiSourceLineInfo =>
          Object.freeze({
            id:
              lineId(
                part.trackIndex,
                part.channel,
              ),
            trackIndex:
              part.trackIndex,
            channel:
              part.channel,
            channelOneBased:
              part.channel + 1,
            noteCount:
              part.notes.length,
          }),
      )
      .sort(
        (left, right) =>
          left.trackIndex - right.trackIndex
          || left.channel - right.channel,
      );

  return Object.freeze({
    ok: true,
    format:
      parsed.source.format,
    ticksPerQuarterNote:
      parsed.source.ticksPerQuarterNote,
    lines:
      Object.freeze(
        lines,
      ),
  });
}

export function selectMidiSourceLine(
  source: MidiSemanticSource,
  selection: MidiSourceLineSelection,
): MidiSemanticSource | null {
  const matchingParts =
    source.parts.filter(
      (part) =>
        part.trackIndex
          === selection.trackIndex
        && part.channel
          === selection.channel,
    );

  if (matchingParts.length !== 1) {
    return null;
  }

  const selectedNotes =
    source.notes.filter(
      (note) =>
        note.trackIndex
          === selection.trackIndex
        && note.channel
          === selection.channel,
    );

  if (selectedNotes.length === 0) {
    return null;
  }

  const notes =
    Object.freeze(
      [...selectedNotes],
    );

  const selectedPart =
    matchingParts[0]!;

  return Object.freeze({
    ...source,
    notes,
    parts:
      Object.freeze([
        Object.freeze({
          ...selectedPart,
          notes,
        }),
      ]),
    programChangeEvents:
      Object.freeze(
        source.programChangeEvents.filter(
          (event) =>
            event.trackIndex
              === selection.trackIndex
            && event.channel
              === selection.channel,
        ),
      ),
    pitchBendEvents:
      Object.freeze(
        source.pitchBendEvents.filter(
          (event) =>
            event.trackIndex
              === selection.trackIndex
            && event.channel
              === selection.channel,
        ),
      ),
  });
}
