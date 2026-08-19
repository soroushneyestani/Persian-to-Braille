import assert from "node:assert/strict";
import test from "node:test";

import {
  GENERIC_MIDI_IN_ACCORD_PROFILE_ID,
  GENERIC_MIDI_PART_MEASURE_IN_ACCORD_PROFILE_ID,
  GENERIC_MIDI_SHARED_BOUNDARY_RHYTHM_PROFILE_ID,
  buildNotationScore,
} from "../dist/notation-builder.js";

import {
  fullMeasureInAccordBrf,
  measureDivisionBrf,
  partMeasureInAccordBrf,
} from "../dist/music-braille-atomic-encoder.js";

import {
  encodeStatefulScore,
} from "../dist/music-braille-stateful-encoder.js";

import {
  translateMidiToBraille,
} from "../dist/index.js";

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

test(
  "H4D freezes the authoritative part-measure and measure-division BRF signs",
  () => {
    assert.equal(
      partMeasureInAccordBrf(),
      '"1',
    );

    assert.equal(
      measureDivisionBrf(),
      ".k",
    );

    assert.equal(
      fullMeasureInAccordBrf(),
      "<>",
    );
  },
);

test(
  "H4C alone remains fail-closed for incomplete polyphony while H4D opts in",
  () => {
    const input =
      source({
        notes: [
          note({
            noteNumber: 60,
            startTick: 0,
            endTick: 300,
          }),
          note({
            noteNumber: 64,
            startTick: 96,
            endTick: 192,
          }),
        ],
      });

    const h4cOnly =
      buildNotationScore(
        input,
        {
          polyphonyProfile:
            GENERIC_MIDI_IN_ACCORD_PROFILE_ID,
          rhythmProfile:
            GENERIC_MIDI_SHARED_BOUNDARY_RHYTHM_PROFILE_ID,
        },
      );

    assert.equal(
      h4cOnly.ok,
      false,
    );

    if (h4cOnly.ok) return;

    assert.equal(
      h4cOnly.code,
      "UNSUPPORTED_POLYPHONY",
    );

    assert.match(
      h4cOnly.message,
      /part-measure in-accord/i,
    );

    const h4d =
      buildNotationScore(
        input,
        {
          polyphonyProfile:
            GENERIC_MIDI_IN_ACCORD_PROFILE_ID,
          partMeasureInAccordProfile:
            GENERIC_MIDI_PART_MEASURE_IN_ACCORD_PROFILE_ID,
          rhythmProfile:
            GENERIC_MIDI_SHARED_BOUNDARY_RHYTHM_PROFILE_ID,
        },
      );

    assert.equal(
      h4d.ok,
      true,
    );

    if (!h4d.ok) return;

    const event =
      h4d.score.parts[0]
        ?.measures[0]
        ?.events[0];

    assert.ok(
      event
      && event.kind
        === "part-measure-in-accord",
    );

    if (
      !event
      || event.kind
        !== "part-measure-in-accord"
    ) {
      return;
    }

    assert.equal(
      event.startUnit,
      0,
    );

    assert.equal(
      event.endUnit,
      300,
    );

    assert.equal(
      event.actions.length,
      2,
    );

    for (
      const action
      of event.actions
    ) {
      const total =
        action.events.reduce(
          (
            sum,
            item,
          ) => {
            if (
              item.kind === "chord"
            ) {
              return (
                sum
                + (
                  item.notes[0]
                    ?.duration.units
                  ?? 0
                )
              );
            }

            return (
              sum
              + item.duration.units
            );
          },
          0,
        );

      assert.equal(
        total,
        300,
      );
    }

    assert.equal(
      h4d.score.diagnostics.some(
        (diagnostic) =>
          diagnostic.code
          === "PART_MEASURE_IN_ACCORD_DERIVED",
      ),
      true,
    );
  },
);

test(
  "stateful H4D joins isolated actions with part-measure in-accord and resets note context",
  () => {
    const result =
      encodeStatefulScore({
        measures: [
          {
            events: [
              {
                kind:
                  "part-measure-in-accord",
                actions: [
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
                    events: [
                      {
                        kind: "note",
                        midiPitch: 64,
                        value: "quarter",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });

    assert.equal(
      result.brf.includes(
        '"1',
      ),
      true,
    );

    assert.equal(
      result.trace[0]?.kind,
      "part-measure-in-accord",
    );
  },
);

test(
  "public MIDI bridge opts into H4D for a terminal incomplete polyphonic measure",
  () => {
    const midi =
      smf([
        time44,
        keyC,
        [0x00, 0x90, 60, 100],
        [...vlq(96), 0x90, 64, 100],
        [...vlq(96), 0x80, 64, 0],
        [...vlq(108), 0x80, 60, 0],
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

    if (!result.ok) return;

    const codes =
      new Set(
        result.diagnostics.map(
          (diagnostic) =>
            diagnostic.code,
        ),
      );

    assert.equal(
      codes.has(
        "PART_MEASURE_IN_ACCORD_DERIVED",
      ),
      true,
    );

    assert.equal(
      result.brf.includes(
        '"1',
      ),
      true,
    );
  },
);
