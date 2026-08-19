import assert from "node:assert/strict";

import {
  decomposeExactDurationUnits,
} from "../dist/quantization.js";
import test from "node:test";

import {
  GENERIC_MIDI_IN_ACCORD_PROFILE_ID,
  buildNotationScore,
  getNotationDuration,
  NOTATION_UNITS_PER_QUARTER,
} from "../dist/index.js";

function note({
  trackIndex = 0,
  channel = 0,
  noteNumber = 60,
  velocity = 100,
  startTick,
  endTick,
}) {
  return Object.freeze({
    trackIndex,
    channel,
    noteNumber,
    velocity,
    startTick,
    endTick,
  });
}

function source({
  ppqn = 96,
  notes,
  timeSignatureEvents = [],
}) {
  const frozenNotes =
    Object.freeze(
      [
        ...notes,
      ],
    );

  const grouped =
    new Map();

  for (
    const current
    of frozenNotes
  ) {
    const key =
      `${current.trackIndex}:${current.channel}`;

    const value =
      grouped.get(
        key,
      ) ?? {
        trackIndex:
          current.trackIndex,
        channel:
          current.channel,
        notes: [],
      };

    value.notes.push(
      current,
    );

    grouped.set(
      key,
      value,
    );
  }

  return Object.freeze({
    format: 1,
    ticksPerQuarterNote:
      ppqn,
    trackCount:
      Math.max(
        1,
        ...frozenNotes.map(
          (current) =>
            current.trackIndex + 1,
        ),
      ),
    notes:
      frozenNotes,
    parts:
      Object.freeze(
        [
          ...grouped.values(),
        ].map(
          (part) =>
            Object.freeze({
              trackIndex:
                part.trackIndex,
              channel:
                part.channel,
              notes:
                Object.freeze(
                  part.notes,
                ),
            }),
        ),
      ),
    tempoEvents:
      Object.freeze([]),
    timeSignatureEvents:
      Object.freeze(
        timeSignatureEvents,
      ),
    keySignatureEvents:
      Object.freeze([]),
  });
}

test(
  "uses the frozen 96-unit notation grid",
  () => {
    assert.equal(
      NOTATION_UNITS_PER_QUARTER,
      96,
    );

    assert.equal(
      getNotationDuration(
        "dotted-sixty-fourth",
      ).units,
      9,
    );

    assert.equal(
      getNotationDuration(
        "quarter-triplet",
      ).units,
      64,
    );
  },
);

test(
  "builds a quarter note with internal 4/4 fallback",
  () => {
    const result =
      buildNotationScore(
        source({
          notes: [
            note({
              startTick: 0,
              endTick: 96,
            }),
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
      result.score.parts[0]
        .measures[0]
        .numerator,
      4,
    );

    assert.equal(
      result.score.parts[0]
        .measures[0]
        .timeSignatureFromSource,
      false,
    );

    assert.ok(
      result.score.diagnostics.some(
        (diagnostic) =>
          diagnostic.code
          === "TIME_SIGNATURE_ABSENT",
      ),
    );
  },
);

test(
  "represents a dotted sixty-fourth exactly",
  () => {
    const result =
      buildNotationScore(
        source({
          ppqn: 960,
          notes: [
            note({
              startTick: 0,
              endTick: 90,
            }),
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
      const event =
        result.score.parts[0]
          .measures[0]
          .events[0];

      assert.equal(
        event.kind,
        "note",
      );

      if (
        event.kind === "note"
      ) {
        assert.equal(
          event.duration.name,
          "dotted-sixty-fourth",
        );

        assert.equal(
          event.duration.units,
          9,
        );
      }
    }
  },
);

test(
  "represents a quarter-note triplet as 64 units",
  () => {
    const result =
      buildNotationScore(
        source({
          ppqn: 480,
          notes: [
            note({
              startTick: 0,
              endTick: 320,
            }),
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
      const event =
        result.score.parts[0]
          .measures[0]
          .events[0];

      assert.equal(
        event.kind,
        "note",
      );

      if (
        event.kind === "note"
      ) {
        assert.equal(
          event.duration.name,
          "quarter-triplet",
        );
      }
    }
  },
);

test(
  "complete exact decomposition backtracks past greedy dead ends",
  () => {
    assert.deepEqual(
      decomposeExactDurationUnits(
        51,
      )?.map(
        (duration) =>
          duration.units,
      ),
      [
        36,
        9,
        6,
      ],
    );

    assert.deepEqual(
      decomposeExactDurationUnits(
        132,
      )?.map(
        (duration) =>
          duration.units,
      ),
      [
        96,
        36,
      ],
    );
  },
);

test(
  "complete exact decomposition minimizes triplet fragments before fragment count",
  () => {
    const result =
      decomposeExactDurationUnits(
        40,
      );

    assert.deepEqual(
      result?.map(
        (duration) =>
          duration.units,
      ),
      [
        24,
        16,
      ],
    );

    assert.deepEqual(
      result?.map(
        (duration) =>
          duration.triplet,
      ),
      [
        false,
        true,
      ],
    );
  },
);

test(
  "95 units are exact and no longer emit a false RHYTHM_QUANTIZED diagnostic",
  () => {
    assert.deepEqual(
      decomposeExactDurationUnits(
        95,
      )?.map(
        (duration) =>
          duration.units,
      ),
      [
        72,
        9,
        8,
        6,
      ],
    );

    const result =
      buildNotationScore(
        source({
          ppqn: 96,
          notes: [
            note({
              startTick: 0,
              endTick: 95,
            }),
          ],
        }),
      );

    assert.equal(
      result.ok,
      true,
    );

    if (!result.ok) {
      return;
    }

    assert.equal(
      result.score.diagnostics.some(
        (diagnostic) =>
          diagnostic.code
          === "RHYTHM_QUANTIZED",
      ),
      false,
    );
  },
);

test(
  "emits RHYTHM_QUANTIZED only for a genuinely non-representable small duration",
  () => {
    const result =
      buildNotationScore(
        source({
          ppqn: 96,
          notes: [
            note({
              startTick: 0,
              endTick: 7,
            }),
          ],
        }),
      );

    assert.equal(
      result.ok,
      true,
    );

    if (!result.ok) {
      return;
    }

    assert.equal(
      result.score.diagnostics.some(
        (diagnostic) =>
          diagnostic.code
          === "RHYTHM_QUANTIZED",
      ),
      true,
    );
  },
);

test(
  "accepts an exact composite duration and derives an internal tie",
  () => {
    const result =
      buildNotationScore(
        source({
          ppqn: 96,
          notes: [
            note({
              startTick: 0,
              endTick: 84,
            }),
          ],
        }),
      );

    assert.equal(
      result.ok,
      true,
    );

    if (!result.ok) return;

    const notes =
      result.score.parts[0]
        .measures[0]
        .events.filter(
          (event) =>
            event.kind === "note",
        );

    assert.deepEqual(
      notes.map(
        (event) =>
          event.duration.units,
      ),
      [72, 12],
    );

    assert.equal(
      notes[0]?.tieToNext,
      true,
    );

    assert.equal(
      notes[1]?.tieFromPrevious,
      true,
    );
  },
);

test(
  "accepts an 80-unit composite duration instead of forcing one atomic value",
  () => {
    const result =
      buildNotationScore(
        source({
          ppqn: 96,
          notes: [
            note({
              startTick: 0,
              endTick: 80,
            }),
          ],
        }),
      );

    assert.equal(
      result.ok,
      true,
    );

    if (!result.ok) return;

    const notes =
      result.score.parts[0]
        .measures[0]
        .events.filter(
          (event) =>
            event.kind === "note",
        );

    assert.equal(
      notes.reduce(
        (sum, event) =>
          sum + event.duration.units,
        0,
      ),
      80,
    );

    assert.equal(
      notes.length > 1,
      true,
    );
  },
);

test(
  "nearest representable composite fallback uses shorter interval on an exact distance tie",
  () => {
    const result =
      buildNotationScore(
        source({
          ppqn: 96,
          notes: [
            note({
              startTick: 0,
              endTick: 7,
            }),
          ],
        }),
      );

    assert.equal(
      result.ok,
      true,
    );

    if (!result.ok) return;

    const event =
      result.score.parts[0]
        .measures[0]
        .events.find(
          (item) =>
            item.kind === "note",
        );

    assert.ok(
      event
      && event.kind === "note",
    );

    if (
      !event
      || event.kind !== "note"
    ) {
      return;
    }

    assert.equal(
      event.duration.units,
      6,
    );

    assert.equal(
      result.score.diagnostics.some(
        (diagnostic) =>
          diagnostic.code
          === "RHYTHM_QUANTIZED",
      ),
      true,
    );
  },
);

test(
  "groups equal-onset notes into a chord",
  () => {
    const result =
      buildNotationScore(
        source({
          notes: [
            note({
              noteNumber: 60,
              startTick: 0,
              endTick: 96,
            }),
            note({
              noteNumber: 64,
              startTick: 0,
              endTick: 96,
            }),
            note({
              noteNumber: 67,
              startTick: 0,
              endTick: 96,
            }),
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
      const event =
        result.score.parts[0]
          .measures[0]
          .events[0];

      assert.equal(
        event.kind,
        "chord",
      );

      if (
        event.kind === "chord"
      ) {
        assert.deepEqual(
          event.notes.map(
            (current) =>
              current.pitch
                .midiNoteNumber,
          ),
          [
            60,
            64,
            67,
          ],
        );
      }
    }
  },
);

test(
  "rejects independently-starting overlap",
  () => {
    const result =
      buildNotationScore(
        source({
          notes: [
            note({
              noteNumber: 60,
              startTick: 0,
              endTick: 192,
            }),
            note({
              noteNumber: 64,
              startTick: 96,
              endTick: 192,
            }),
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
        "UNSUPPORTED_POLYPHONY",
      );
    }
  },
);

test(
  "derives rests from quantized gaps",
  () => {
    const result =
      buildNotationScore(
        source({
          notes: [
            note({
              startTick: 96,
              endTick: 192,
            }),
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
      const events =
        result.score.parts[0]
          .measures[0]
          .events;

      assert.equal(
        events[0].kind,
        "rest",
      );

      assert.equal(
        events[1].kind,
        "note",
      );

      if (
        events[0].kind
        === "rest"
      ) {
        assert.equal(
          events[0].duration.name,
          "quarter",
        );
      }
    }
  },
);

test(
  "splits a measure-crossing note and carries derived tie metadata",
  () => {
    const result =
      buildNotationScore(
        source({
          notes: [
            note({
              startTick: 288,
              endTick: 480,
            }),
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
      const firstMeasure =
        result.score.parts[0]
          .measures[0];

      const secondMeasure =
        result.score.parts[0]
          .measures[1];

      const firstNote =
        firstMeasure.events.find(
          (event) =>
            event.kind
            === "note",
        );

      const secondNote =
        secondMeasure.events.find(
          (event) =>
            event.kind
            === "note",
        );

      assert.ok(
        firstNote
        && firstNote.kind
          === "note",
      );

      assert.ok(
        secondNote
        && secondNote.kind
          === "note",
      );

      if (
        firstNote
        && firstNote.kind
          === "note"
        && secondNote
        && secondNote.kind
          === "note"
      ) {
        assert.equal(
          firstNote.tieToNext,
          true,
        );

        assert.equal(
          secondNote.tieFromPrevious,
          true,
        );
      }
    }
  },
);

test(
  "accepts an explicit 3/4 signature at the beginning",
  () => {
    const result =
      buildNotationScore(
        source({
          notes: [
            note({
              startTick: 0,
              endTick: 96,
            }),
          ],
          timeSignatureEvents: [
            Object.freeze({
              kind:
                "time-signature",
              trackIndex: 0,
              tick: 0,
              numerator: 3,
              denominator: 4,
              clocksPerMetronomeClick: 24,
              thirtySecondNotesPerQuarter: 8,
            }),
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
        result.score.parts[0]
          .measures[0]
          .endUnit,
        288,
      );

      assert.equal(
        result.score.parts[0]
          .measures[0]
          .timeSignatureFromSource,
        true,
      );
    }
  },
);

test(
  "rejects a time-signature change inside a derived measure",
  () => {
    const result =
      buildNotationScore(
        source({
          notes: [
            note({
              startTick: 0,
              endTick: 384,
            }),
          ],
          timeSignatureEvents: [
            Object.freeze({
              kind:
                "time-signature",
              trackIndex: 0,
              tick: 0,
              numerator: 4,
              denominator: 4,
              clocksPerMetronomeClick: 24,
              thirtySecondNotesPerQuarter: 8,
            }),
            Object.freeze({
              kind:
                "time-signature",
              trackIndex: 0,
              tick: 192,
              numerator: 3,
              denominator: 4,
              clocksPerMetronomeClick: 24,
              thirtySecondNotesPerQuarter: 8,
            }),
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
        "UNSUPPORTED_MUSIC_BRAILLE_CONSTRUCT",
      );
    }
  },
);

test(
  "exact decomposition keeps a dotted quarter atomic before smaller triplet fragments",
  () => {
    const result =
      buildNotationScore(
        source({
          ppqn: 96,
          notes: [
            note({
              startTick: 0,
              endTick: 144,
            }),
          ],
        }),
      );

    assert.equal(
      result.ok,
      true,
    );

    if (!result.ok) {
      return;
    }

    const events =
      result.score.parts[0]
        .measures[0]
        .events;

    assert.equal(
      events[0]?.kind,
      "note",
    );

    const first =
      events[0];

    if (
      first === undefined
      || first.kind !== "note"
    ) {
      return;
    }

    assert.equal(
      first.duration.name,
      "dotted-quarter",
    );

    assert.equal(
      first.duration.units,
      144,
    );

    assert.equal(
      first.tieFromPrevious,
      false,
    );

    assert.equal(
      first.tieToNext,
      false,
    );
  },
);

test(
  "generic MIDI profile derives a full-measure in-accord without changing default fail-closed behavior",
  () => {
    const input =
      source({
        ppqn: 96,
        timeSignatureEvents: [
          {
            kind: "time-signature",
            trackIndex: 0,
            tick: 0,
            numerator: 4,
            denominator: 4,
            clocksPerMetronomeClick: 24,
            thirtySecondNotesPerQuarter: 8,
          },
        ],
        notes: [
          note({ noteNumber: 60, startTick: 0, endTick: 384 }),
          note({ noteNumber: 64, startTick: 96, endTick: 192 }),
        ],
      });

    const strict =
      buildNotationScore(input);

    assert.equal(strict.ok, false);
    if (strict.ok) return;
    assert.equal(strict.code, "UNSUPPORTED_POLYPHONY");

    const result =
      buildNotationScore(
        input,
        {
          polyphonyProfile:
            GENERIC_MIDI_IN_ACCORD_PROFILE_ID,
        },
      );

    assert.equal(result.ok, true);
    if (!result.ok) return;

    const event =
      result.score.parts[0]
        ?.measures[0]
        ?.events[0];

    assert.ok(
      event
      && event.kind === "full-measure-in-accord",
    );
    if (!event || event.kind !== "full-measure-in-accord") return;

    assert.equal(event.actions.length, 2);
    assert.equal(event.actions[0]?.anchorMidiPitch, 64);
    assert.equal(event.actions[1]?.anchorMidiPitch, 60);

    const codes =
      new Set(
        result.score.diagnostics.map(
          (item) => item.code,
        ),
      );

    assert.equal(codes.has("INFERRED_MIDI_VOICE_PARTITION"), true);
    assert.equal(codes.has("IN_ACCORD_ORDER_CANONICALIZED_NO_STAFF"), true);
    assert.equal(codes.has("TRANSCRIBER_ADDED_IN_ACCORD_REST"), true);

    const addedRests =
      event.actions
        .flatMap((action) => action.events)
        .filter(
          (item) =>
            item.kind === "rest"
            && item.transcriberAdded === true,
        );

    assert.equal(addedRests.length > 0, true);
  },
);

test(
  "generic MIDI full-measure profile fails closed when polyphony occurs in an incomplete final measure",
  () => {
    const result =
      buildNotationScore(
        source({
          ppqn: 96,
          timeSignatureEvents: [
            {
              kind: "time-signature",
              trackIndex: 0,
              tick: 0,
              numerator: 4,
              denominator: 4,
              clocksPerMetronomeClick: 24,
              thirtySecondNotesPerQuarter: 8,
            },
          ],
          notes: [
            note({ noteNumber: 60, startTick: 0, endTick: 300 }),
            note({ noteNumber: 64, startTick: 96, endTick: 192 }),
          ],
        }),
        {
          polyphonyProfile:
            GENERIC_MIDI_IN_ACCORD_PROFILE_ID,
        },
      );

    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.code, "UNSUPPORTED_POLYPHONY");
    assert.match(result.message, /part-measure in-accord/i);
  },
);
