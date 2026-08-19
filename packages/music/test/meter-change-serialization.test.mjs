import assert from "node:assert/strict";
import test from "node:test";

import {
  octavePrefixBrf,
  simpleMeterBrf,
} from "../dist/music-braille-atomic-encoder.js";

import {
  encodeStatefulScore,
} from "../dist/music-braille-stateful-encoder.js";

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
  const payload =
    events.flat();

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

const time128AtBoundary = [
  ...vlq(288),
  0xff,
  0x58,
  0x04,
  0x0c,
  0x03,
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

const endOfTrack = [
  0x00,
  0xff,
  0x2f,
  0x00,
];

test(
  "stateful encoder emits a changed numeric meter at the next measure and forces octave",
  () => {
    const result =
      encodeStatefulScore({
        meter: {
          numerator: 4,
          denominator: 4,
        },
        measures: [
          {
            events: [
              {
                kind: "note",
                midiPitch: 60,
                value: "quarter",
              },
            ],
          },
          {
            meter: {
              numerator: 12,
              denominator: 8,
            },
            events: [
              {
                kind: "note",
                midiPitch: 62,
                value: "quarter",
              },
            ],
          },
        ],
      });

    const changedMeter =
      simpleMeterBrf(
        12,
        8,
      );

    assert.equal(
      result.brf.includes(
        ` ${changedMeter} `,
      ),
      true,
    );

    assert.equal(
      result.trace[1]
        ?.emittedBrf
        .startsWith(
          octavePrefixBrf(4),
        ),
      true,
    );
  },
);

test(
  "identical per-measure meter is not redundantly emitted",
  () => {
    const meter44 =
      simpleMeterBrf(
        4,
        4,
      );

    const result =
      encodeStatefulScore({
        meter: {
          numerator: 4,
          denominator: 4,
        },
        measures: [
          {
            events: [
              {
                kind: "note",
                midiPitch: 60,
                value: "quarter",
              },
            ],
          },
          {
            meter: {
              numerator: 4,
              denominator: 4,
            },
            events: [
              {
                kind: "note",
                midiPitch: 62,
                value: "quarter",
              },
            ],
          },
        ],
      });

    assert.equal(
      result.brf.split(
        meter44,
      ).length - 1,
      1,
    );
  },
);

test(
  "public MIDI bridge serializes a boundary-aligned 4/4 to 12/8 change numerically",
  () => {
    const midi =
      smf([
        time44,
        keyC,
        [
          0x00,
          0x90,
          60,
          100,
        ],
        [
          ...vlq(96),
          0x80,
          60,
          0,
        ],
        time128AtBoundary,
        [
          0x00,
          0x90,
          62,
          100,
        ],
        [
          ...vlq(96),
          0x80,
          62,
          0,
        ],
        endOfTrack,
      ]);

    const result =
      translateMidiToBraille(
        midi,
      );

    assert.equal(
      result.ok,
      true,
    );

    if (!result.ok) {
      return;
    }

    assert.equal(
      result.brf.includes(
        ` ${simpleMeterBrf(
          12,
          8,
        )} `,
      ),
      true,
    );

    assert.equal(
      result.diagnostics.some(
        (diagnostic) =>
          diagnostic.code
          === "METER_CHANGE_SERIALIZED",
      ),
      true,
    );

    assert.equal(
      result.parts[0]
        ?.trace[2]
        ?.emittedBrf
        .startsWith(
          octavePrefixBrf(4),
        ),
      true,
    );
  },
);
