import assert from "node:assert/strict";
import test from "node:test";

import {
  parseStandardMidiFile,
} from "../dist/index.js";

function be16(value) {
  return [
    (value >>> 8) & 0xff,
    value & 0xff,
  ];
}

function be32(value) {
  return [
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  ];
}

function ascii(value) {
  return Array.from(
    value,
    (character) =>
      character.charCodeAt(0),
  );
}

function vlq(value) {
  const bytes = [
    value & 0x7f,
  ];

  let remaining =
    value >>> 7;

  while (
    remaining > 0
  ) {
    bytes.unshift(
      (remaining & 0x7f) | 0x80,
    );

    remaining >>>= 7;
  }

  return bytes;
}

function track(events) {
  const payload =
    events.flat();

  return [
    ...ascii("MTrk"),
    ...be32(
      payload.length,
    ),
    ...payload,
  ];
}

function smf({
  format = 0,
  division = 480,
  tracks,
}) {
  return new Uint8Array([
    ...ascii("MThd"),
    ...be32(6),
    ...be16(format),
    ...be16(
      tracks.length,
    ),
    ...be16(division),
    ...tracks.flat(),
  ]);
}

const endOfTrack = [
  0x00,
  0xff,
  0x2f,
  0x00,
];

test(
  "parses one note into the neutral semantic source model",
  () => {
    const result =
      parseStandardMidiFile(
        smf({
          tracks: [
            track([
              [
                0x00,
                0x90,
                60,
                100,
              ],
              [
                ...vlq(480),
                0x80,
                60,
                64,
              ],
              endOfTrack,
            ]),
          ],
        }),
      );

    assert.equal(
      result.ok,
      true,
    );

    if (
      !result.ok
    ) {
      return;
    }

    assert.equal(
      result.source.format,
      0,
    );

    assert.equal(
      result.source.ticksPerQuarterNote,
      480,
    );

    assert.deepEqual(
      result.source.notes,
      [
        {
          trackIndex: 0,
          channel: 0,
          noteNumber: 60,
          velocity: 100,
          program: 0,
          startTick: 0,
          endTick: 480,
        },
      ],
    );
  },
);

test(
  "treats note-on velocity zero as note-off",
  () => {
    const result =
      parseStandardMidiFile(
        smf({
          tracks: [
            track([
              [
                0x00,
                0x90,
                64,
                90,
              ],
              [
                ...vlq(240),
                0x90,
                64,
                0,
              ],
              endOfTrack,
            ]),
          ],
        }),
      );

    assert.equal(
      result.ok,
      true,
    );

    if (
      result.ok
    ) {
      assert.equal(
        result.source.notes[0].endTick,
        240,
      );
    }
  },
);

test(
  "supports running status",
  () => {
    const result =
      parseStandardMidiFile(
        smf({
          tracks: [
            track([
              [
                0x00,
                0x90,
                60,
                100,
              ],
              [
                0x00,
                64,
                80,
              ],
              [
                ...vlq(120),
                0x80,
                60,
                0,
              ],
              [
                0x00,
                64,
                0,
              ],
              endOfTrack,
            ]),
          ],
        }),
      );

    assert.equal(
      result.ok,
      true,
    );

    if (
      result.ok
    ) {
      assert.equal(
        result.source.notes.length,
        2,
      );
    }
  },
);

test(
  "captures tempo, time signature, and key signature metadata",
  () => {
    const result =
      parseStandardMidiFile(
        smf({
          tracks: [
            track([
              [
                0x00,
                0xff,
                0x51,
                0x03,
                0x07,
                0xa1,
                0x20,
              ],
              [
                0x00,
                0xff,
                0x58,
                0x04,
                0x03,
                0x02,
                0x18,
                0x08,
              ],
              [
                0x00,
                0xff,
                0x59,
                0x02,
                0xff,
                0x01,
              ],
              [
                0x00,
                0x90,
                60,
                100,
              ],
              [
                ...vlq(120),
                0x80,
                60,
                0,
              ],
              endOfTrack,
            ]),
          ],
        }),
      );

    assert.equal(
      result.ok,
      true,
    );

    if (
      !result.ok
    ) {
      return;
    }

    assert.deepEqual(
      result.source.tempoEvents,
      [
        {
          kind: "tempo",
          trackIndex: 0,
          tick: 0,
          microsecondsPerQuarterNote:
            500000,
        },
      ],
    );

    assert.deepEqual(
      result.source.timeSignatureEvents,
      [
        {
          kind:
            "time-signature",
          trackIndex: 0,
          tick: 0,
          numerator: 3,
          denominator: 4,
          clocksPerMetronomeClick: 24,
          thirtySecondNotesPerQuarter: 8,
        },
      ],
    );

    assert.deepEqual(
      result.source.keySignatureEvents,
      [
        {
          kind:
            "key-signature",
          trackIndex: 0,
          tick: 0,
          sharpsFlats: -1,
          mode: "minor",
        },
      ],
    );
  },
);

test(
  "supports format 1 and derives parts from track plus channel",
  () => {
    const result =
      parseStandardMidiFile(
        smf({
          format: 1,
          tracks: [
            track([
              [
                0x00,
                0x90,
                60,
                100,
              ],
              [
                ...vlq(120),
                0x80,
                60,
                0,
              ],
              endOfTrack,
            ]),
            track([
              [
                0x00,
                0x91,
                67,
                70,
              ],
              [
                ...vlq(240),
                0x81,
                67,
                0,
              ],
              endOfTrack,
            ]),
          ],
        }),
      );

    assert.equal(
      result.ok,
      true,
    );

    if (
      result.ok
    ) {
      assert.deepEqual(
        result.source.parts.map(
          (part) => [
            part.trackIndex,
            part.channel,
          ],
        ),
        [
          [0, 0],
          [1, 1],
        ],
      );
    }
  },
);

test(
  "skips SysEx and unknown meta events by declared length",
  () => {
    const result =
      parseStandardMidiFile(
        smf({
          tracks: [
            track([
              [
                0x00,
                0xf0,
                0x03,
                0x01,
                0x02,
                0x03,
              ],
              [
                0x00,
                0xff,
                0x7f,
                0x02,
                0x11,
                0x22,
              ],
              [
                0x00,
                0x90,
                60,
                100,
              ],
              [
                ...vlq(60),
                0x80,
                60,
                0,
              ],
              endOfTrack,
            ]),
          ],
        }),
      );

    assert.equal(
      result.ok,
      true,
    );
  },
);

test(
  "rejects format 2",
  () => {
    const result =
      parseStandardMidiFile(
        smf({
          format: 2,
          tracks: [
            track([
              endOfTrack,
            ]),
          ],
        }),
      );

    assert.equal(
      result.ok,
      false,
    );

    if (
      !result.ok
    ) {
      assert.equal(
        result.code,
        "UNSUPPORTED_MIDI_FORMAT",
      );
    }
  },
);

test(
  "rejects SMPTE time division",
  () => {
    const result =
      parseStandardMidiFile(
        smf({
          division: 0xe728,
          tracks: [
            track([
              endOfTrack,
            ]),
          ],
        }),
      );

    assert.equal(
      result.ok,
      false,
    );

    if (
      !result.ok
    ) {
      assert.equal(
        result.code,
        "UNSUPPORTED_MIDI_TIME_DIVISION",
      );
    }
  },
);

test(
  "fails closed on truncated track data",
  () => {
    const bytes =
      smf({
        tracks: [
          track([
            [
              0x00,
              0x90,
              60,
              100,
            ],
            [
              ...vlq(120),
              0x80,
              60,
              0,
            ],
            endOfTrack,
          ]),
        ],
      });

    const result =
      parseStandardMidiFile(
        bytes.slice(
          0,
          bytes.length - 2,
        ),
      );

    assert.equal(
      result.ok,
      false,
    );

    if (
      !result.ok
    ) {
      assert.equal(
        result.code,
        "INVALID_MIDI_FILE",
      );
    }
  },
);

test(
  "returns NO_MUSICAL_NOTES for a valid empty track",
  () => {
    const result =
      parseStandardMidiFile(
        smf({
          tracks: [
            track([
              endOfTrack,
            ]),
          ],
        }),
      );

    assert.deepEqual(
      result,
      {
        ok: false,
        code:
          "NO_MUSICAL_NOTES",
        message:
          "MIDI file contains no complete note events.",
      },
    );
  },
);

test(
  "returns immutable success structures",
  () => {
    const result =
      parseStandardMidiFile(
        smf({
          tracks: [
            track([
              [
                0x00,
                0x90,
                60,
                100,
              ],
              [
                ...vlq(120),
                0x80,
                60,
                0,
              ],
              endOfTrack,
            ]),
          ],
        }),
      );

    assert.equal(
      result.ok,
      true,
    );

    if (
      result.ok
    ) {
      assert.equal(
        Object.isFrozen(
          result,
        ),
        true,
      );

      assert.equal(
        Object.isFrozen(
          result.source,
        ),
        true,
      );

      assert.equal(
        Object.isFrozen(
          result.source.notes,
        ),
        true,
      );

      assert.equal(
        Object.isFrozen(
          result.source.parts,
        ),
        true,
      );
    }
  },
);

test(
  "captures non-center pitch bend as neutral semantic metadata",
  () => {
    const result =
      parseStandardMidiFile(
        smf({
          tracks: [
            track([
              [0x00, 0xe0, 0x01, 0x40],
              [0x00, 0x90, 60, 100],
              [...vlq(480), 0x80, 60, 0],
              endOfTrack,
            ]),
          ],
        }),
      );

    assert.equal(result.ok, true);

    if (!result.ok) return;

    assert.deepEqual(
      result.source.pitchBendEvents,
      [
        {
          kind: "pitch-bend",
          trackIndex: 0,
          channel: 0,
          tick: 0,
          value: 8193,
          effectiveProgram: 0,
        },
      ],
    );
  },
);

test(
  "captures Program Change and applies effective program at note and bend onset",
  () => {
    const result =
      parseStandardMidiFile(
        smf({
          tracks: [
            track([
              [0x00, 0xc2, 0x77],
              [0x00, 0xe2, 0x01, 0x40],
              [0x00, 0x92, 60, 100],
              [...vlq(480), 0x82, 60, 0],
              endOfTrack,
            ]),
          ],
        }),
      );

    assert.equal(result.ok, true);

    if (!result.ok) return;

    assert.deepEqual(
      result.source.programChangeEvents,
      [
        {
          kind: "program-change",
          trackIndex: 0,
          channel: 2,
          tick: 0,
          program: 119,
        },
      ],
    );

    assert.equal(
      result.source.pitchBendEvents[0]?.effectiveProgram,
      119,
    );

    assert.equal(
      result.source.notes[0]?.program,
      119,
    );
  },
);

test(
  "captures center pitch bend without applying notation policy",
  () => {
    const result =
      parseStandardMidiFile(
        smf({
          tracks: [
            track([
              [0x00, 0xe0, 0x00, 0x40],
              [0x00, 0x90, 60, 100],
              [...vlq(480), 0x80, 60, 0],
              endOfTrack,
            ]),
          ],
        }),
      );

    assert.equal(result.ok, true);

    if (!result.ok) return;

    assert.equal(
      result.source.pitchBendEvents[0]?.value,
      8192,
    );
  },
);

test(
  "accepts a narrow terminal ASCII whitespace suffix and discloses it",
  () => {
    const base =
      smf({
        tracks: [
          track([
            [0x00, 0x90, 60, 100],
            [...vlq(480), 0x80, 60, 0],
            endOfTrack,
          ]),
        ],
      });

    const input =
      new Uint8Array([
        ...base,
        0x0a,
        0x0a,
      ]);

    const result =
      parseStandardMidiFile(
        input,
      );

    assert.equal(
      result.ok,
      true,
    );

    if (!result.ok) return;

    assert.deepEqual(
      result.diagnostics.map(
        (diagnostic) =>
          diagnostic.code,
      ),
      [
        "TRAILING_ASCII_WHITESPACE_IGNORED",
      ],
    );
  },
);

test(
  "rejects non-whitespace trailing data after declared MIDI tracks",
  () => {
    const base =
      smf({
        tracks: [
          track([
            [0x00, 0x90, 60, 100],
            [...vlq(480), 0x80, 60, 0],
            endOfTrack,
          ]),
        ],
      });

    const result =
      parseStandardMidiFile(
        new Uint8Array([
          ...base,
          0x0a,
          0x41,
        ]),
      );

    assert.equal(
      result.ok,
      false,
    );

    if (result.ok) return;

    assert.equal(
      result.code,
      "INVALID_MIDI_FILE",
    );
  },
);

test(
  "rejects more than 64 bytes of terminal ASCII whitespace",
  () => {
    const base =
      smf({
        tracks: [
          track([
            [0x00, 0x90, 60, 100],
            [...vlq(480), 0x80, 60, 0],
            endOfTrack,
          ]),
        ],
      });

    const result =
      parseStandardMidiFile(
        new Uint8Array([
          ...base,
          ...Array.from(
            { length: 65 },
            () => 0x20,
          ),
        ]),
      );

    assert.equal(
      result.ok,
      false,
    );

    if (result.ok) return;

    assert.equal(
      result.code,
      "INVALID_MIDI_FILE",
    );
  },
);
