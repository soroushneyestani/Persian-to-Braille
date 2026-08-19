import assert from "node:assert/strict";
import test from "node:test";

import {
  MusicBrailleMidiTranslationError,
  createMusicBrailleMidiTranslator,
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
  const bytes = [value & 0x7f];
  let remaining = value >>> 7;

  while (remaining > 0) {
    bytes.unshift(
      (remaining & 0x7f) | 0x80,
    );
    remaining >>>= 7;
  }

  return bytes;
}

function track(events) {
  const payload = events.flat();
  return [
    ...ascii("MTrk"),
    ...be32(payload.length),
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

test(
  "public SDK translates MIDI bytes to Unicode Music Braille without exposing engine internals",
  () => {
    const translator =
      createMusicBrailleMidiTranslator();

    const bytes =
      smf([
        [
          0x00,
          0xff,
          0x58,
          0x04,
          0x04,
          0x02,
          0x18,
          0x08,
        ],
        [
          0x00,
          0xff,
          0x59,
          0x02,
          0x00,
          0x00,
        ],
        [0x00, 0x90, 60, 100],
        [...vlq(96), 0x80, 60, 0],
        [0x00, 0x90, 62, 100],
        [...vlq(96), 0x80, 62, 0],
        [0x00, 0x90, 64, 100],
        [...vlq(192), 0x80, 64, 0],
        endOfTrack,
      ]);

    const result =
      translator.translateMidi(
        bytes,
      );

    assert.equal(
      result.ok,
      true,
    );

    if (!result.ok) return;

    assert.equal(
      result.unicodeBraille,
      "⠼⠙⠲⠀⠐⠹⠱⠏",
    );
    assert.equal(
      result.profile.sourceCode,
      "BANA-MBC-2015",
    );
    assert.equal(
      result.profile.musicXml,
      "reserved-for-phase-19",
    );
    assert.equal(
      result.parts.length,
      1,
    );
  },
);

test(
  "public SDK expected MIDI failures remain non-throwing",
  () => {
    const translator =
      createMusicBrailleMidiTranslator();

    const result =
      translator.translateMidi(
        new Uint8Array([
          0x00,
          0x01,
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
    assert.equal(
      result.stage,
      "parser",
    );
  },
);

test(
  "translateMidiOrThrow uses the SDK-owned Music Braille error",
  () => {
    const translator =
      createMusicBrailleMidiTranslator();

    assert.throws(
      () =>
        translator.translateMidiOrThrow(
          new Uint8Array([
            0x00,
            0x01,
          ]),
        ),
      (error) =>
        error instanceof
          MusicBrailleMidiTranslationError
        && error.code
          === "INVALID_MIDI_FILE",
    );
  },
);

test(
  "public SDK inspects Format-0 channel lines and translates only the selected line",
  () => {
    const translator =
      createMusicBrailleMidiTranslator();

    const bytes =
      smf([
        [
          0x00,
          0xff,
          0x58,
          0x04,
          0x04,
          0x02,
          0x18,
          0x08,
        ],
        [
          0x00,
          0xff,
          0x59,
          0x02,
          0x00,
          0x00,
        ],
        [0x00, 0x90, 60, 100],
        [0x00, 0x91, 67, 100],
        [...vlq(96), 0x80, 60, 0],
        [0x00, 0x81, 67, 0],
        endOfTrack,
      ]);

    const inspection =
      translator.inspectMidi(
        bytes,
      );

    assert.equal(
      inspection.ok,
      true,
    );

    if (!inspection.ok) return;

    assert.deepEqual(
      inspection.lines.map(
        (line) => [
          line.id,
          line.trackIndex,
          line.channel,
          line.noteCount,
        ],
      ),
      [
        ["0:0", 0, 0, 1],
        ["0:1", 0, 1, 1],
      ],
    );

    const result =
      translator.translateMidiLine(
        bytes,
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
    assert.equal(
      result.profile.sourceSelection,
      "explicit-source-line-supported",
    );
  },
);

test(
  "public SDK selected-line translation never falls back to all lines",
  () => {
    const translator =
      createMusicBrailleMidiTranslator();

    const result =
      translator.translateMidiLine(
        smf([
          [0x00, 0x90, 60, 100],
          [...vlq(96), 0x80, 60, 0],
          endOfTrack,
        ]),
        {
          trackIndex: 9,
          channel: 9,
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
