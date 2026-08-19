import assert from "node:assert/strict";
import test from "node:test";

import {
  reduceMidiToGlobalPianoRoll,
} from "../dist/midi-piano-roll-reducer.js";

function note({
  trackIndex = 0,
  channel = 0,
  noteNumber = 60,
  velocity = 100,
  program = 0,
  startTick = 0,
  endTick = 96,
} = {}) {
  return Object.freeze({
    trackIndex,
    channel,
    noteNumber,
    velocity,
    program,
    startTick,
    endTick,
  });
}

function source(notes) {
  const frozen =
    Object.freeze([
      ...notes,
    ]);

  return Object.freeze({
    format: 1,
    ticksPerQuarterNote: 96,
    trackCount: 8,
    notes:
      frozen,
    parts:
      Object.freeze([
        Object.freeze({
          trackIndex: 0,
          channel: 0,
          notes:
            Object.freeze(
              frozen.filter(
                (item) =>
                  item.trackIndex === 0,
              ),
            ),
        }),
        Object.freeze({
          trackIndex: 1,
          channel: 9,
          notes:
            Object.freeze(
              frozen.filter(
                (item) =>
                  item.trackIndex === 1,
              ),
            ),
        }),
      ]),
    programChangeEvents:
      Object.freeze([]),
    pitchBendEvents:
      Object.freeze([]),
    tempoEvents:
      Object.freeze([]),
    timeSignatureEvents:
      Object.freeze([]),
    keySignatureEvents:
      Object.freeze([]),
  });
}

test(
  "all tracks channels programs and channel-10 notes flatten into one synthetic piano part",
  () => {
    const result =
      reduceMidiToGlobalPianoRoll(
        source([
          note({
            trackIndex: 0,
            channel: 0,
            noteNumber: 60,
            program: 0,
          }),
          note({
            trackIndex: 1,
            channel: 9,
            noteNumber: 38,
            program: 127,
          }),
        ]),
      );

    assert.equal(
      result.source.parts.length,
      1,
    );

    assert.equal(
      result.source.notes.length,
      2,
    );

    assert.deepEqual(
      result.source.notes.map(
        (item) => [
          item.noteNumber,
          item.trackIndex,
          item.channel,
          item.program,
        ],
      ),
      [
        [38, 0, 0, 0],
        [60, 0, 0, 0],
      ],
    );
  },
);

test(
  "same canonical onset plus same pitch collapses duplicate contributors and keeps maximum release",
  () => {
    const result =
      reduceMidiToGlobalPianoRoll(
        source([
          note({
            trackIndex: 0,
            noteNumber: 60,
            startTick: 100,
            endTick: 180,
            velocity: 70,
          }),
          note({
            trackIndex: 1,
            channel: 4,
            noteNumber: 60,
            startTick: 100,
            endTick: 260,
            velocity: 110,
          }),
          note({
            trackIndex: 7,
            channel: 9,
            noteNumber: 60,
            startTick: 100,
            endTick: 220,
            velocity: 90,
          }),
        ]),
      );

    assert.equal(
      result.pianoAttackCount,
      1,
    );

    assert.equal(
      result.duplicateAttackGroupCount,
      1,
    );

    assert.equal(
      result.collapsedContributorEvents,
      2,
    );

    assert.deepEqual(
      {
        startTick:
          result.source.notes[0]?.startTick,
        endTick:
          result.source.notes[0]?.endTick,
        velocity:
          result.source.notes[0]?.velocity,
      },
      {
        startTick: 100,
        endTick: 260,
        velocity: 110,
      },
    );

    assert.equal(
      result.provenance[0]
        ?.contributors.length,
      3,
    );
  },
);

test(
  "different-onset same-pitch material remains distinct re-attacks",
  () => {
    const result =
      reduceMidiToGlobalPianoRoll(
        source([
          note({
            noteNumber: 60,
            startTick: 0,
            endTick: 192,
          }),
          note({
            trackIndex: 4,
            channel: 6,
            noteNumber: 60,
            startTick: 96,
            endTick: 288,
          }),
        ]),
      );

    assert.equal(
      result.pianoAttackCount,
      2,
    );

    assert.equal(
      result.collapsedContributorEvents,
      0,
    );
  },
);

test(
  "pitch-bend metadata is non-destructive to discrete piano-key retention",
  () => {
    const base =
      source([
        note({
          noteNumber: 67,
        }),
      ]);

    const result =
      reduceMidiToGlobalPianoRoll(
        Object.freeze({
          ...base,
          pitchBendEvents:
            Object.freeze([
              Object.freeze({
                kind: "pitch-bend",
                trackIndex: 0,
                channel: 0,
                tick: 0,
                value: 9000,
                effectiveProgram: 0,
              }),
            ]),
        }),
      );

    assert.equal(
      result.source.notes.length,
      1,
    );

    assert.equal(
      result.source.pitchBendEvents.length,
      1,
    );

    assert.equal(
      result.diagnostics.some(
        (item) =>
          item.code
          === "PITCH_BEND_PRESERVED_AS_METADATA",
      ),
      true,
    );
  },
);
