import assert from "node:assert/strict";
import test from "node:test";

import {
  inspectMidiSourceLines,
  parseStandardMidiFile,
  selectMidiSourceLine,
  translateMidiSourceLineToBraille,
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

  while (remaining > 0) {
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

function smf(events) {
  const trackBytes =
    track(events);

  return new Uint8Array([
    ...ascii("MThd"),
    ...be32(6),
    ...be16(0),
    ...be16(1),
    ...be16(96),
    ...trackBytes,
  ]);
}

const endOfTrack = [
  0x00,
  0xff,
  0x2f,
  0x00,
];

const time44 = [
  0x00,
  0xff,
  0x58,
  0x04,
  0x04,
  0x02,
  0x18,
  0x08,
];

const keyC = [
  0x00,
  0xff,
  0x59,
  0x02,
  0x00,
  0x00,
];

function twoLineMidi() {
  return smf([
    time44,
    keyC,
    [0x00, 0xc0, 0x00],
    [0x00, 0xc1, 0x28],
    [0x00, 0x90, 60, 100],
    [0x00, 0x91, 67, 100],
    [...vlq(96), 0x80, 60, 0],
    [0x00, 0x81, 67, 0],
    endOfTrack,
  ]);
}

test(
  "Format-0 channels are exposed as separate MIDI source lines",
  () => {
    const result =
      inspectMidiSourceLines(
        twoLineMidi(),
      );

    assert.equal(
      result.ok,
      true,
    );

    if (!result.ok) return;

    assert.deepEqual(
      result.lines.map(
        (line) => [
          line.id,
          line.trackIndex,
          line.channel,
          line.channelOneBased,
          line.noteCount,
        ],
      ),
      [
        ["0:0", 0, 0, 1, 1],
        ["0:1", 0, 1, 2, 1],
      ],
    );
  },
);

test(
  "source-line selection filters both top-level notes and source parts",
  () => {
    const parsed =
      parseStandardMidiFile(
        twoLineMidi(),
      );

    assert.equal(
      parsed.ok,
      true,
    );

    if (!parsed.ok) return;

    const selected =
      selectMidiSourceLine(
        parsed.source,
        {
          trackIndex: 0,
          channel: 1,
        },
      );

    assert.notEqual(
      selected,
      null,
    );

    if (selected === null) return;

    assert.equal(
      selected.notes.length,
      1,
    );
    assert.equal(
      selected.parts.length,
      1,
    );
    assert.equal(
      selected.notes[0]?.channel,
      1,
    );
    assert.equal(
      selected.parts[0]?.channel,
      1,
    );
    assert.equal(
      selected.programChangeEvents.every(
        (event) =>
          event.channel === 1,
      ),
      true,
    );
    assert.equal(
      selected.pitchBendEvents.every(
        (event) =>
          event.channel === 1,
      ),
      true,
    );
  },
);

test(
  "selected MIDI source line uses the existing piano-roll and notation route",
  () => {
    const result =
      translateMidiSourceLineToBraille(
        twoLineMidi(),
        {
          trackIndex: 0,
          channel: 1,
        },
      );

    assert.equal(
      result.ok,
      true,
    );

    if (!result.ok) return;

    assert.equal(
      result.parts.length,
      1,
    );
  },
);

test(
  "missing MIDI source line fails explicitly instead of falling back to all lines",
  () => {
    const result =
      translateMidiSourceLineToBraille(
        twoLineMidi(),
        {
          trackIndex: 99,
          channel: 15,
        },
      );

    assert.equal(
      result.ok,
      false,
    );

    if (result.ok) return;

    assert.equal(
      result.code,
      "MIDI_SOURCE_LINE_NOT_FOUND",
    );
    assert.equal(
      result.stage,
      "bridge",
    );
  },
);
