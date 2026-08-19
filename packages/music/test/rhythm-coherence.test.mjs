import assert from "node:assert/strict";
import test from "node:test";

import {
  GENERIC_MIDI_IN_ACCORD_PROFILE_ID,
  GENERIC_MIDI_SHARED_BOUNDARY_RHYTHM_PROFILE_ID,
  buildNotationScore,
} from "../dist/notation-builder.js";

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
  division = 96,
  tracks,
}) {
  return new Uint8Array([
    ...ascii("MThd"),
    ...be32(6),
    ...be16(0),
    ...be16(tracks.length),
    ...be16(division),
    ...tracks.flat(),
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

function note({
  startTick,
  endTick,
  noteNumber = 60,
}) {
  return Object.freeze({
    trackIndex: 0,
    channel: 0,
    noteNumber,
    velocity: 100,
    program: 0,
    startTick,
    endTick,
  });
}

function source({
  ppqn = 96,
  notes,
}) {
  const frozenNotes =
    Object.freeze([
      ...notes,
    ]);

  return Object.freeze({
    format: 1,
    ticksPerQuarterNote: ppqn,
    trackCount: 1,
    notes: frozenNotes,
    parts:
      Object.freeze([
        Object.freeze({
          trackIndex: 0,
          channel: 0,
          notes: frozenNotes,
        }),
      ]),
    tempoEvents:
      Object.freeze([]),
    timeSignatureEvents:
      Object.freeze([
        Object.freeze({
          kind: "time-signature",
          trackIndex: 0,
          tick: 0,
          numerator: 4,
          denominator: 4,
          clocksPerMetronomeClick: 24,
          thirtySecondNotesPerQuarter: 8,
        }),
      ]),
    keySignatureEvents:
      Object.freeze([]),
    programChangeEvents:
      Object.freeze([]),
    pitchBendEvents:
      Object.freeze([]),
  });
}

test(
  "shared-boundary coherence repairs a measure-edge note/rest pair without rest-only rounding",
  () => {
    const midi =
      smf({
        tracks: [
          track([
            time44,
            keyC,
            [
              ...vlq(379),
              0x90,
              60,
              100,
            ],
            [
              ...vlq(101),
              0x80,
              60,
              0,
            ],
            endOfTrack,
          ]),
        ],
      });

    const result =
      translateMidiToBraille(
        midi,
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
          === "RHYTHM_BOUNDARY_COHERENCE_QUANTIZED",
      ),
      true,
    );
  },
);

test(
  "an exact zero-duration MIDI note is omitted only with explicit disclosure",
  () => {
    const midi =
      smf({
        tracks: [
          track([
            time44,
            keyC,
            [0x00, 0x90, 70, 100],
            [0x00, 0x80, 70, 0],
            [0x00, 0x90, 60, 100],
            [...vlq(96), 0x80, 60, 0],
            endOfTrack,
          ]),
        ],
      });

    const result =
      translateMidiToBraille(
        midi,
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
          === "ZERO_DURATION_MIDI_NOTE_OMITTED",
      ),
      true,
    );
  },
);

test(
  "a positive source gap may collapse to a touching boundary when exact rests and the immutable measure edge require it",
  () => {
    const midi =
      smf({
        tracks: [
          track([
            time44,
            keyC,
            [...vlq(336), 0x90, 60, 100],
            [...vlq(43), 0x80, 60, 0],
            [...vlq(4), 0x90, 62, 100],
            [...vlq(97), 0x80, 62, 0],
            endOfTrack,
          ]),
        ],
      });

    const result =
      translateMidiToBraille(
        midi,
      );

    assert.equal(
      result.ok,
      true,
    );

    if (!result.ok) return;

    assert.equal(
      result.diagnostics.filter(
        (diagnostic) =>
          diagnostic.code
          === "RHYTHM_BOUNDARY_COHERENCE_QUANTIZED",
      ).length >= 1,
      true,
    );
  },
);

test(
  "a carried note and a boundary-onset note keep distinct H4C groups without an impossible clipped-onset ordering constraint",
  () => {
    const midi =
      smf({
        tracks: [
          track([
            time44,
            keyC,
            [...vlq(300), 0x90, 60, 100],
            [...vlq(84), 0x90, 64, 100],
            [...vlq(96), 0x80, 64, 0],
            [...vlq(288), 0x80, 60, 0],
            endOfTrack,
          ]),
        ],
      });

    const result =
      translateMidiToBraille(
        midi,
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
          === "INFERRED_MIDI_VOICE_PARTITION",
      ),
      true,
    );
  },
);

test(
  "positive MIDI duration that collapses to zero on the frozen grid still fails closed",
  () => {
    const result =
      buildNotationScore(
        source({
          ppqn: 960,
          notes: [
            note({
              startTick: 0,
              endTick: 1,
            }),
          ],
        }),
        {
          polyphonyProfile:
            GENERIC_MIDI_IN_ACCORD_PROFILE_ID,
          rhythmProfile:
            GENERIC_MIDI_SHARED_BOUNDARY_RHYTHM_PROFILE_ID,
        },
      );

    assert.equal(
      result.ok,
      false,
    );

    if (result.ok) return;

    assert.equal(
      result.code,
      "UNQUANTIZABLE_RHYTHM",
    );

    assert.match(
      result.message,
      /positive-duration MIDI note collapses/i,
    );
  },
);
