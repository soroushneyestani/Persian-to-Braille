import assert from "node:assert/strict";
import test from "node:test";

import {
  translateMidiToBraille,
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

function smf({
  format = 0,
  division = 96,
  tracks,
}) {
  return new Uint8Array([
    ...ascii("MThd"),
    ...be32(6),
    ...be16(format),
    ...be16(tracks.length),
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

function cMajorPhrase() {
  return smf({
    tracks: [
      track([
        time44,
        keyC,
        [0x00, 0x90, 60, 100],
        [...vlq(96), 0x80, 60, 0],
        [0x00, 0x90, 62, 100],
        [...vlq(96), 0x80, 62, 0],
        [0x00, 0x90, 64, 100],
        [...vlq(192), 0x80, 64, 0],
        endOfTrack,
      ]),
    ],
  });
}

test(
  "translates a real in-memory MIDI phrase through parser, notation, stateful encoder, and Unicode Braille",
  () => {
    const result =
      translateMidiToBraille(
        cMajorPhrase(),
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
      result.brf,
      '#d4 "?:p',
    );
    assert.equal(
      result.unicodeBraille,
      "⠼⠙⠲⠀⠐⠹⠱⠏",
    );
    assert.equal(
      result.parts[0].unicodeBraille,
      result.unicodeBraille,
    );
  },
);

test(
  "missing key/time/tempo metadata remains diagnostic instead of being rendered as source",
  () => {
    const result =
      translateMidiToBraille(
        smf({
          tracks: [
            track([
              [0x00, 0x90, 60, 100],
              [...vlq(96), 0x80, 60, 0],
              endOfTrack,
            ]),
          ],
        }),
      );

    assert.equal(result.ok, true);
    if (!result.ok) return;

    assert.equal(
      result.brf,
      '"?',
    );

    const codes =
      new Set(
        result.diagnostics.map(
          (item) =>
            item.code,
        ),
      );

    assert.equal(
      codes.has("TIME_SIGNATURE_ABSENT"),
      true,
    );
    assert.equal(
      codes.has("KEY_SIGNATURE_ABSENT"),
      true,
    );
    assert.equal(
      codes.has("TEMPO_METADATA_ABSENT"),
      true,
    );
    assert.equal(
      codes.has("PITCH_SPELLING_CANONICALIZED"),
      true,
    );
    assert.equal(
      codes.has("LOSSY_MIDI_TO_NOTATION_RECONSTRUCTION"),
      true,
    );
  },
);

test(
  "active pitch-bend metadata is non-destructive in global piano-roll production",
  () => {
    const result =
      translateMidiToBraille(
        smf({
          tracks: [
            track([
              [0x00, 0xe0, 0x01, 0x40],
              [0x00, 0x90, 60, 100],
              [...vlq(96), 0x80, 60, 0],
              endOfTrack,
            ]),
          ],
        }),
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
      result.diagnostics.some(
        (diagnostic) =>
          diagnostic.code
          === "PITCH_BEND_PRESERVED_AS_METADATA",
      ),
      true,
    );
  },
);

test(
  "center pitch-bend messages are neutral and do not block translation",
  () => {
    const result =
      translateMidiToBraille(
        smf({
          tracks: [
            track([
              [0x00, 0xe0, 0x00, 0x40],
              [0x00, 0x90, 60, 100],
              [...vlq(96), 0x80, 60, 0],
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
  "format-1 source parts merge into one global piano-roll production part",
  () => {
    const result =
      translateMidiToBraille(
        smf({
          format: 1,
          tracks: [
            track([
              time44,
              keyC,
              [0x00, 0x90, 60, 100],
              [...vlq(96), 0x80, 60, 0],
              endOfTrack,
            ]),
            track([
              [0x00, 0x91, 67, 100],
              [...vlq(96), 0x81, 67, 0],
              endOfTrack,
            ]),
          ],
        }),
      );

    assert.equal(result.ok, true);
    if (!result.ok) return;

    assert.equal(
      result.parts.length,
      1,
    );
    assert.equal(
      result.unicodeBraille.includes("\n"),
      false,
    );
    assert.deepEqual(
      result.parts.map(
        (part) => [
          part.trackIndex,
          part.channel,
        ],
      ),
      [
        [0, 0],
      ],
    );
    assert.equal(
      result.diagnostics.some(
        (diagnostic) =>
          diagnostic.code
          === "GLOBAL_PIANO_ROLL_REDUCTION_APPLIED",
      ),
      true,
    );
  },
);

test(
  "a complete group of three triplet-duration notes gets one triplet indicator",
  () => {
    const result =
      translateMidiToBraille(
        smf({
          division: 96,
          tracks: [
            track([
              [0x00, 0x90, 60, 100],
              [...vlq(64), 0x80, 60, 0],
              [0x00, 0x90, 62, 100],
              [...vlq(64), 0x80, 62, 0],
              [0x00, 0x90, 64, 100],
              [...vlq(64), 0x80, 64, 0],
              endOfTrack,
            ]),
          ],
        }),
      );

    assert.equal(
      result.ok,
      true,
    );

    if (!result.ok) return;

    assert.equal(
      result.brf.startsWith('2"?'),
      true,
    );
    assert.equal(
      [...result.brf].filter(
        (char) => char === "2",
      ).length,
      1,
    );
  },
);

test(
  "an incomplete recovered triplet run fails closed instead of guessing grouping",
  () => {
    const result =
      translateMidiToBraille(
        smf({
          division: 96,
          tracks: [
            track([
              [0x00, 0x90, 60, 100],
              [...vlq(64), 0x80, 60, 0],
              endOfTrack,
            ]),
          ],
        }),
      );

    assert.equal(
      result.ok,
      false,
    );

    if (result.ok) return;

    assert.equal(
      result.code,
      "UNSUPPORTED_MUSIC_BRAILLE_CONSTRUCT",
    );
    assert.equal(
      result.stage,
      "bridge",
    );
  },
);

test(
  "GM effect notes and pitch bends remain discrete piano-roll material",
  () => {
    const result =
      translateMidiToBraille(
        smf({
          division: 96,
          tracks: [
            track([
              time44,
              keyC,
              [0x00, 0xcb, 0x77],
              [0x00, 0xeb, 0x01, 0x40],
              [0x00, 0x9b, 60, 100],
              [...vlq(96), 0x8b, 60, 0],
              [0x00, 0x90, 64, 100],
              [...vlq(96), 0x80, 64, 0],
              endOfTrack,
            ]),
          ],
        }),
      );

    assert.equal(result.ok, true);
    if (!result.ok) return;

    const codes =
      new Set(
        result.diagnostics.map(
          (diagnostic) =>
            diagnostic.code,
        ),
      );

    assert.equal(
      codes.has("GLOBAL_PIANO_ROLL_REDUCTION_APPLIED"),
      true,
    );
    assert.equal(
      codes.has("PITCH_BEND_PRESERVED_AS_METADATA"),
      true,
    );
    assert.equal(
      codes.has("NON_PITCHED_SOURCE_EVENT_SKIPPED"),
      false,
    );
    assert.equal(
      codes.has("NON_PITCHED_PITCH_BEND_SKIPPED"),
      false,
    );
    assert.equal(
      result.parts.length,
      1,
    );
  },
);

test(
  "MIDI channel 10 note numbers remain discrete piano keys in global piano-roll production",
  () => {
    const result =
      translateMidiToBraille(
        smf({
          division: 96,
          tracks: [
            track([
              time44,
              keyC,
              [0x00, 0x99, 36, 100],
              [...vlq(96), 0x89, 36, 0],
              [0x00, 0x90, 60, 100],
              [...vlq(96), 0x80, 60, 0],
              endOfTrack,
            ]),
          ],
        }),
      );

    assert.equal(result.ok, true);
    if (!result.ok) return;

    assert.equal(
      result.diagnostics.some(
        (diagnostic) =>
          diagnostic.code
          === "NON_PITCHED_SOURCE_EVENT_SKIPPED",
      ),
      false,
    );
    assert.equal(
      result.diagnostics.some(
        (diagnostic) =>
          diagnostic.code
          === "GLOBAL_PIANO_ROLL_REDUCTION_APPLIED",
      ),
      true,
    );
    assert.equal(
      result.parts.length,
      1,
    );
  },
);

test(
  "projects accepted terminal ASCII whitespace as an explicit translation diagnostic",
  () => {
    const base =
      smf({
        division: 96,
        tracks: [
          track([
            time44,
            keyC,
            [0x00, 0x90, 60, 100],
            [...vlq(96), 0x80, 60, 0],
            endOfTrack,
          ]),
        ],
      });

    const result =
      translateMidiToBraille(
        new Uint8Array([
          ...base,
          0x0d,
          0x0a,
        ]),
      );

    assert.equal(
      result.ok,
      true,
    );

    if (!result.ok) return;

    assert.equal(
      result.diagnostics.some(
        (diagnostic) =>
          diagnostic.code
          === "TRAILING_ASCII_WHITESPACE_IGNORED",
      ),
      true,
    );
  },
);

test(
  "full-measure independent overlap is encoded as one in-accord inside the merged piano part",
  () => {
    const result =
      translateMidiToBraille(
        smf({
          division: 96,
          tracks: [
            track([
              time44,
              keyC,
              [0x00, 0x90, 60, 100],
              [...vlq(96), 0x90, 64, 100],
              [...vlq(96), 0x80, 64, 0],
              [...vlq(192), 0x80, 60, 0],
              endOfTrack,
            ]),
          ],
        }),
      );

    assert.equal(result.ok, true);
    if (!result.ok) return;

    assert.equal(result.parts.length, 1);
    assert.equal(
      result.brf,
      '#d4 "v"$"u<>"y',
    );

    const codes =
      new Set(
        result.diagnostics.map(
          (item) => item.code,
        ),
      );

    assert.equal(codes.has("INFERRED_MIDI_VOICE_PARTITION"), true);
    assert.equal(codes.has("IN_ACCORD_ORDER_CANONICALIZED_NO_STAFF"), true);
    assert.equal(codes.has("TRANSCRIBER_ADDED_IN_ACCORD_REST"), true);
  },
);

test(
  "same corrected onset with different releases stays as simultaneous actions instead of one mixed-duration chord",
  () => {
    const result =
      translateMidiToBraille(
        smf({
          division: 96,
          tracks: [
            track([
              time44,
              keyC,
              [0x00, 0x90, 60, 100],
              [0x00, 0x90, 64, 100],
              [...vlq(96), 0x80, 64, 0],
              [...vlq(96), 0x80, 60, 0],
              endOfTrack,
            ]),
          ],
        }),
      );

    assert.equal(result.ok, true);
    if (!result.ok) return;

    assert.equal(
      result.parts.length,
      1,
    );
    assert.equal(
      result.diagnostics.some(
        (diagnostic) =>
          diagnostic.code
          === "PART_MEASURE_IN_ACCORD_DERIVED",
      ),
      true,
    );
  },
);
