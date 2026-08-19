import type {
  MidiFileFormat,
  MidiKeySignatureEvent,
  MidiNote,
  MidiParserDiagnostic,
  MidiParserFailure,
  MidiParserResult,
  MidiPitchBendEvent,
  MidiProgramChangeEvent,
  MidiSemanticSource,
  MidiSourcePart,
  MidiTempoEvent,
  MidiTimeSignatureEvent,
} from "./types.js";

interface TrackParseResult {
  readonly notes: readonly MidiNote[];
  readonly programChangeEvents:
    readonly MidiProgramChangeEvent[];
  readonly pitchBendEvents:
    readonly MidiPitchBendEvent[];
  readonly tempoEvents: readonly MidiTempoEvent[];
  readonly timeSignatureEvents: readonly MidiTimeSignatureEvent[];
  readonly keySignatureEvents: readonly MidiKeySignatureEvent[];
}

interface ActiveNote {
  readonly startTick: number;
  readonly velocity: number;
  readonly program: number;
}

type ParserFailureCode =
  | "INVALID_MIDI_FILE"
  | "UNSUPPORTED_MIDI_FORMAT"
  | "UNSUPPORTED_MIDI_TIME_DIVISION";

class SmfParseError extends Error {
  readonly code: ParserFailureCode;
  readonly byteOffset: number;

  constructor(
    code: ParserFailureCode,
    message: string,
    byteOffset: number,
  ) {
    super(message);
    this.name = "SmfParseError";
    this.code = code;
    this.byteOffset = byteOffset;
  }
}

function failure(
  code: MidiParserFailure["code"],
  message: string,
  byteOffset?: number,
): MidiParserFailure {
  if (byteOffset === undefined) {
    return Object.freeze({
      ok: false as const,
      code,
      message,
    });
  }

  return Object.freeze({
    ok: false as const,
    code,
    message,
    location: Object.freeze({
      byteOffset,
    }),
  });
}

const MAX_TRAILING_ASCII_WHITESPACE_BYTES =
  64;

function isAllowedTrailingAsciiWhitespace(
  value: number,
): boolean {
  return (
    value === 0x09
    || value === 0x0a
    || value === 0x0d
    || value === 0x20
  );
}

function acceptedTrailingWhitespaceLength(
  bytes: Uint8Array,
  offset: number,
): number | null {
  const length =
    bytes.length
    - offset;

  if (
    length <= 0
    || length
      > MAX_TRAILING_ASCII_WHITESPACE_BYTES
  ) {
    return null;
  }

  for (
    let index = offset;
    index < bytes.length;
    index += 1
  ) {
    if (
      !isAllowedTrailingAsciiWhitespace(
        bytes[index]!,
      )
    ) {
      return null;
    }
  }

  return length;
}

function requireRange(
  bytes: Uint8Array,
  offset: number,
  length: number,
  limit: number,
  message: string,
): void {
  if (
    offset < 0
    || length < 0
    || offset + length > limit
    || offset + length > bytes.length
  ) {
    throw new SmfParseError(
      "INVALID_MIDI_FILE",
      message,
      Math.max(0, offset),
    );
  }
}

function readAscii(
  bytes: Uint8Array,
  offset: number,
  length: number,
): string {
  requireRange(
    bytes,
    offset,
    length,
    bytes.length,
    "Unexpected end of MIDI data.",
  );

  let result = "";

  for (
    let index = offset;
    index < offset + length;
    index += 1
  ) {
    result += String.fromCharCode(
      bytes[index]!,
    );
  }

  return result;
}

function readUint16(
  bytes: Uint8Array,
  offset: number,
): number {
  requireRange(
    bytes,
    offset,
    2,
    bytes.length,
    "Unexpected end of MIDI data while reading a 16-bit value.",
  );

  return (
    (bytes[offset]! << 8)
    | bytes[offset + 1]!
  );
}

function readUint32(
  bytes: Uint8Array,
  offset: number,
): number {
  requireRange(
    bytes,
    offset,
    4,
    bytes.length,
    "Unexpected end of MIDI data while reading a 32-bit value.",
  );

  return (
    (
      bytes[offset]! * 0x1000000
    )
    + (
      bytes[offset + 1]! << 16
    )
    + (
      bytes[offset + 2]! << 8
    )
    + bytes[offset + 3]!
  ) >>> 0;
}

function readVlq(
  bytes: Uint8Array,
  offset: number,
  limit: number,
): {
  readonly value: number;
  readonly nextOffset: number;
} {
  let value = 0;
  let cursor = offset;

  for (
    let count = 0;
    count < 4;
    count += 1
  ) {
    requireRange(
      bytes,
      cursor,
      1,
      limit,
      "Truncated MIDI variable-length quantity.",
    );

    const current =
      bytes[cursor]!;
    cursor += 1;

    value =
      (value << 7)
      | (current & 0x7f);

    if (
      (current & 0x80) === 0
    ) {
      return Object.freeze({
        value,
        nextOffset: cursor,
      });
    }
  }

  throw new SmfParseError(
    "INVALID_MIDI_FILE",
    "MIDI variable-length quantity exceeds four bytes.",
    offset,
  );
}

function channelDataLength(
  status: number,
  byteOffset: number,
): number {
  const family =
    status & 0xf0;

  if (
    family === 0xc0
    || family === 0xd0
  ) {
    return 1;
  }

  if (
    family >= 0x80
    && family <= 0xe0
  ) {
    return 2;
  }

  throw new SmfParseError(
    "INVALID_MIDI_FILE",
    "Malformed MIDI channel status byte.",
    byteOffset,
  );
}

function noteKey(
  channel: number,
  noteNumber: number,
): string {
  return `${channel}:${noteNumber}`;
}

function parseTrack(
  bytes: Uint8Array,
  start: number,
  end: number,
  trackIndex: number,
): TrackParseResult {
  let offset = start;
  let tick = 0;
  let runningStatus: number | null =
    null;

  const activeNotes =
    new Map<string, ActiveNote[]>();

  const channelPrograms =
    Array.from(
      { length: 16 },
      () => 0,
    );

  const notes: MidiNote[] = [];
  const programChangeEvents:
    MidiProgramChangeEvent[] = [];
  const pitchBendEvents:
    MidiPitchBendEvent[] = [];
  const tempoEvents:
    MidiTempoEvent[] = [];
  const timeSignatureEvents:
    MidiTimeSignatureEvent[] = [];
  const keySignatureEvents:
    MidiKeySignatureEvent[] = [];

  let sawEndOfTrack = false;

  while (
    offset < end
  ) {
    const delta =
      readVlq(
        bytes,
        offset,
        end,
      );

    tick +=
      delta.value;
    offset =
      delta.nextOffset;

    requireRange(
      bytes,
      offset,
      1,
      end,
      "Track ended immediately after a delta-time value.",
    );

    let status =
      bytes[offset]!;
    let firstData:
      number | null =
        null;
    let statusOffset =
      offset;

    if (
      status < 0x80
    ) {
      if (
        runningStatus === null
      ) {
        throw new SmfParseError(
          "INVALID_MIDI_FILE",
          "Running status was used before a channel status byte.",
          offset,
        );
      }

      status =
        runningStatus;
      firstData =
        bytes[offset]!;
      offset += 1;
      statusOffset =
        offset - 1;
    } else {
      offset += 1;

      if (
        status < 0xf0
      ) {
        runningStatus =
          status;
      } else {
        runningStatus =
          null;
      }
    }

    if (
      status === 0xff
    ) {
      requireRange(
        bytes,
        offset,
        1,
        end,
        "Truncated MIDI meta-event type.",
      );

      const metaType =
        bytes[offset]!;
      offset += 1;

      const length =
        readVlq(
          bytes,
          offset,
          end,
        );

      offset =
        length.nextOffset;

      requireRange(
        bytes,
        offset,
        length.value,
        end,
        "Truncated MIDI meta-event payload.",
      );

      if (
        metaType === 0x51
        && length.value === 3
      ) {
        const value =
          (
            bytes[offset]! << 16
          )
          | (
            bytes[offset + 1]! << 8
          )
          | bytes[offset + 2]!;

        tempoEvents.push(
          Object.freeze({
            kind: "tempo",
            trackIndex,
            tick,
            microsecondsPerQuarterNote:
              value,
          }),
        );
      } else if (
        metaType === 0x58
        && length.value === 4
      ) {
        const denominatorExponent =
          bytes[offset + 1]!;

        if (
          denominatorExponent > 7
        ) {
          throw new SmfParseError(
            "INVALID_MIDI_FILE",
            "Time-signature denominator exponent is out of the supported MIDI range.",
            offset + 1,
          );
        }

        timeSignatureEvents.push(
          Object.freeze({
            kind:
              "time-signature",
            trackIndex,
            tick,
            numerator:
              bytes[offset]!,
            denominator:
              2 ** denominatorExponent,
            clocksPerMetronomeClick:
              bytes[offset + 2]!,
            thirtySecondNotesPerQuarter:
              bytes[offset + 3]!,
          }),
        );
      } else if (
        metaType === 0x59
        && length.value === 2
      ) {
        const rawAccidentals =
          bytes[offset]!;

        const sharpsFlats =
          rawAccidentals > 127
            ? rawAccidentals - 256
            : rawAccidentals;

        if (
          sharpsFlats < -7
          || sharpsFlats > 7
        ) {
          throw new SmfParseError(
            "INVALID_MIDI_FILE",
            "Key-signature accidental count is outside -7..7.",
            offset,
          );
        }

        const mode =
          bytes[offset + 1]!;

        if (
          mode !== 0
          && mode !== 1
        ) {
          throw new SmfParseError(
            "INVALID_MIDI_FILE",
            "Key-signature mode must be major (0) or minor (1).",
            offset + 1,
          );
        }

        keySignatureEvents.push(
          Object.freeze({
            kind:
              "key-signature",
            trackIndex,
            tick,
            sharpsFlats,
            mode:
              mode === 0
                ? "major"
                : "minor",
          }),
        );
      }

      offset +=
        length.value;

      if (
        metaType === 0x2f
      ) {
        if (
          length.value !== 0
        ) {
          throw new SmfParseError(
            "INVALID_MIDI_FILE",
            "End-of-track meta event must have a zero-length payload.",
            offset,
          );
        }

        if (
          offset !== end
        ) {
          throw new SmfParseError(
            "INVALID_MIDI_FILE",
            "Data remains after the end-of-track meta event.",
            offset,
          );
        }

        sawEndOfTrack =
          true;
      }

      continue;
    }

    if (
      status === 0xf0
      || status === 0xf7
    ) {
      const length =
        readVlq(
          bytes,
          offset,
          end,
        );

      offset =
        length.nextOffset;

      requireRange(
        bytes,
        offset,
        length.value,
        end,
        "Truncated MIDI SysEx payload.",
      );

      offset +=
        length.value;
      continue;
    }

    if (
      status >= 0xf0
    ) {
      throw new SmfParseError(
        "INVALID_MIDI_FILE",
        "Unsupported system event in an SMF track.",
        statusOffset,
      );
    }

    const dataLength =
      channelDataLength(
        status,
        statusOffset,
      );

    const data: number[] = [];

    if (
      firstData !== null
    ) {
      data.push(
        firstData,
      );
    }

    const remaining =
      dataLength - data.length;

    requireRange(
      bytes,
      offset,
      remaining,
      end,
      "Truncated MIDI channel event.",
    );

    for (
      let index = 0;
      index < remaining;
      index += 1
    ) {
      const value =
        bytes[offset + index]!;

      if (
        value >= 0x80
      ) {
        throw new SmfParseError(
          "INVALID_MIDI_FILE",
          "MIDI channel data byte has its high bit set.",
          offset + index,
        );
      }

      data.push(
        value,
      );
    }

    offset +=
      remaining;

    const eventFamily =
      status & 0xf0;
    const channel =
      status & 0x0f;

    if (
      eventFamily === 0xc0
    ) {
      const program =
        data[0]!;

      channelPrograms[
        channel
      ] = program;

      programChangeEvents.push(
        Object.freeze({
          kind:
            "program-change",
          trackIndex,
          channel,
          tick,
          program,
        }),
      );

      continue;
    }

    if (
      eventFamily === 0xe0
    ) {
      const bendValue =
        data[0]!
        | (data[1]! << 7);

      pitchBendEvents.push(
        Object.freeze({
          kind:
            "pitch-bend",
          trackIndex,
          channel,
          tick,
          value:
            bendValue,
          effectiveProgram:
            channelPrograms[
              channel
            ]!,
        }),
      );

      continue;
    }

    if (
      eventFamily !== 0x80
      && eventFamily !== 0x90
    ) {
      continue;
    }

    const noteNumber =
      data[0]!;
    const velocity =
      data[1]!;

    const isNoteOn =
      eventFamily === 0x90
      && velocity > 0;

    const key =
      noteKey(
        channel,
        noteNumber,
      );

    if (
      isNoteOn
    ) {
      const queue =
        activeNotes.get(
          key,
        ) ?? [];

      queue.push(
        Object.freeze({
          startTick:
            tick,
          velocity,
          program:
            channelPrograms[
              channel
            ]!,
        }),
      );

      activeNotes.set(
        key,
        queue,
      );

      continue;
    }

    const queue =
      activeNotes.get(
        key,
      );

    if (
      !queue
      || queue.length === 0
    ) {
      continue;
    }

    const active =
      queue.shift()!;

    notes.push(
      Object.freeze({
        trackIndex,
        channel,
        noteNumber,
        velocity:
          active.velocity,
        program:
          active.program,
        startTick:
          active.startTick,
        endTick:
          tick,
      }),
    );

    if (
      queue.length === 0
    ) {
      activeNotes.delete(
        key,
      );
    }
  }

  if (
    !sawEndOfTrack
  ) {
    throw new SmfParseError(
      "INVALID_MIDI_FILE",
      "MIDI track is missing the required end-of-track meta event.",
      end,
    );
  }

  if (
    activeNotes.size > 0
  ) {
    throw new SmfParseError(
      "INVALID_MIDI_FILE",
      "One or more MIDI notes remain active at the end of the track.",
      end,
    );
  }

  return Object.freeze({
    notes:
      Object.freeze(
        notes,
      ),
    programChangeEvents:
      Object.freeze(
        programChangeEvents,
      ),
    pitchBendEvents:
      Object.freeze(
        pitchBendEvents,
      ),
    tempoEvents:
      Object.freeze(
        tempoEvents,
      ),
    timeSignatureEvents:
      Object.freeze(
        timeSignatureEvents,
      ),
    keySignatureEvents:
      Object.freeze(
        keySignatureEvents,
      ),
  });
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
    const note of notes
  ) {
    const key =
      `${note.trackIndex}:${note.channel}`;

    const existing =
      grouped.get(
        key,
      );

    if (
      existing
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

export function parseStandardMidiFile(
  input:
    | Uint8Array
    | ArrayBuffer,
): MidiParserResult {
  const bytes =
    input instanceof Uint8Array
      ? input
      : new Uint8Array(
          input,
        );

  try {
    if (
      bytes.length < 14
    ) {
      return failure(
        "INVALID_MIDI_FILE",
        "MIDI data is too short to contain a Standard MIDI File header.",
        0,
      );
    }

    if (
      readAscii(
        bytes,
        0,
        4,
      ) !== "MThd"
    ) {
      return failure(
        "INVALID_MIDI_FILE",
        "MIDI file does not begin with an MThd header chunk.",
        0,
      );
    }

    const headerLength =
      readUint32(
        bytes,
        4,
      );

    if (
      headerLength !== 6
    ) {
      return failure(
        "INVALID_MIDI_FILE",
        "Phase 14 requires the SMF header length to be exactly 6 bytes.",
        4,
      );
    }

    const formatValue =
      readUint16(
        bytes,
        8,
      );

    if (
      formatValue !== 0
      && formatValue !== 1
    ) {
      return failure(
        "UNSUPPORTED_MIDI_FORMAT",
        "Phase 14 accepts only Standard MIDI File format 0 or format 1.",
        8,
      );
    }

    const format =
      formatValue as MidiFileFormat;

    const trackCount =
      readUint16(
        bytes,
        10,
      );

    if (
      trackCount < 1
    ) {
      return failure(
        "INVALID_MIDI_FILE",
        "Standard MIDI File must declare at least one track.",
        10,
      );
    }

    if (
      format === 0
      && trackCount !== 1
    ) {
      return failure(
        "INVALID_MIDI_FILE",
        "SMF format 0 must declare exactly one track.",
        10,
      );
    }

    const division =
      readUint16(
        bytes,
        12,
      );

    if (
      (division & 0x8000) !== 0
    ) {
      return failure(
        "UNSUPPORTED_MIDI_TIME_DIVISION",
        "SMPTE time division is outside the frozen Phase 14 subset.",
        12,
      );
    }

    if (
      division === 0
    ) {
      return failure(
        "INVALID_MIDI_FILE",
        "PPQN division must be greater than zero.",
        12,
      );
    }

    let offset = 14;

    const parserDiagnostics:
      MidiParserDiagnostic[] = [];

    const notes: MidiNote[] = [];
    const programChangeEvents:
      MidiProgramChangeEvent[] = [];
    const pitchBendEvents:
      MidiPitchBendEvent[] = [];
    const tempoEvents:
      MidiTempoEvent[] = [];
    const timeSignatureEvents:
      MidiTimeSignatureEvent[] = [];
    const keySignatureEvents:
      MidiKeySignatureEvent[] = [];

    for (
      let trackIndex = 0;
      trackIndex < trackCount;
      trackIndex += 1
    ) {
      requireRange(
        bytes,
        offset,
        8,
        bytes.length,
        "MIDI file ended before all declared track chunks were found.",
      );

      if (
        readAscii(
          bytes,
          offset,
          4,
        ) !== "MTrk"
      ) {
        return failure(
          "INVALID_MIDI_FILE",
          "Expected an MTrk chunk for the next declared MIDI track.",
          offset,
        );
      }

      const trackLength =
        readUint32(
          bytes,
          offset + 4,
        );

      const trackStart =
        offset + 8;
      const trackEnd =
        trackStart + trackLength;

      if (
        trackEnd > bytes.length
      ) {
        return failure(
          "INVALID_MIDI_FILE",
          "Declared MIDI track length exceeds available file data.",
          offset + 4,
        );
      }

      const parsed =
        parseTrack(
          bytes,
          trackStart,
          trackEnd,
          trackIndex,
        );

      notes.push(
        ...parsed.notes,
      );
      programChangeEvents.push(
        ...parsed.programChangeEvents,
      );
      pitchBendEvents.push(
        ...parsed.pitchBendEvents,
      );
      tempoEvents.push(
        ...parsed.tempoEvents,
      );
      timeSignatureEvents.push(
        ...parsed.timeSignatureEvents,
      );
      keySignatureEvents.push(
        ...parsed.keySignatureEvents,
      );

      offset =
        trackEnd;
    }

    if (
      offset !== bytes.length
    ) {
      const trailingLength =
        acceptedTrailingWhitespaceLength(
          bytes,
          offset,
        );

      if (
        trailingLength === null
      ) {
        return failure(
          "INVALID_MIDI_FILE",
          "Unexpected data remains after the declared MIDI track chunks.",
          offset,
        );
      }

      parserDiagnostics.push(
        Object.freeze({
          code:
            "TRAILING_ASCII_WHITESPACE_IGNORED",
          message:
            `Ignored ${trailingLength} terminal ASCII whitespace byte(s) after the declared MIDI track chunks. No trailing byte was interpreted as MIDI data.`,
        }),
      );
    }

    if (
      notes.length === 0
    ) {
      return failure(
        "NO_MUSICAL_NOTES",
        "MIDI file contains no complete note events.",
      );
    }

    notes.sort(
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
          left.noteNumber
          - right.noteNumber
        ),
    );

    programChangeEvents.sort(
      (left, right) =>
        (
          left.tick
          - right.tick
        )
        || (
          left.trackIndex
          - right.trackIndex
        )
        || (
          left.channel
          - right.channel
        ),
    );

    pitchBendEvents.sort(
      (left, right) =>
        (
          left.tick
          - right.tick
        )
        || (
          left.trackIndex
          - right.trackIndex
        )
        || (
          left.channel
          - right.channel
        ),
    );

    tempoEvents.sort(
      (left, right) =>
        (
          left.tick
          - right.tick
        )
        || (
          left.trackIndex
          - right.trackIndex
        ),
    );

    timeSignatureEvents.sort(
      (left, right) =>
        (
          left.tick
          - right.tick
        )
        || (
          left.trackIndex
          - right.trackIndex
        ),
    );

    keySignatureEvents.sort(
      (left, right) =>
        (
          left.tick
          - right.tick
        )
        || (
          left.trackIndex
          - right.trackIndex
        ),
    );

    const frozenNotes =
      Object.freeze(
        [
          ...notes,
        ],
      );

    const source:
      MidiSemanticSource =
        Object.freeze({
          format,
          ticksPerQuarterNote:
            division,
          trackCount,
          notes:
            frozenNotes,
          parts:
            buildParts(
              frozenNotes,
            ),
          programChangeEvents:
            Object.freeze(
              [
                ...programChangeEvents,
              ],
            ),
          pitchBendEvents:
            Object.freeze(
              [
                ...pitchBendEvents,
              ],
            ),
          tempoEvents:
            Object.freeze(
              [
                ...tempoEvents,
              ],
            ),
          timeSignatureEvents:
            Object.freeze(
              [
                ...timeSignatureEvents,
              ],
            ),
          keySignatureEvents:
            Object.freeze(
              [
                ...keySignatureEvents,
              ],
            ),
        });

    return Object.freeze({
      ok: true as const,
      source,
      diagnostics:
        Object.freeze(
          parserDiagnostics,
        ),
    });
  } catch (
    error
  ) {
    if (
      error
      instanceof SmfParseError
    ) {
      return failure(
        error.code,
        error.message,
        error.byteOffset,
      );
    }

    throw error;
  }
}
