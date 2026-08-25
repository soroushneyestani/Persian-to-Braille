import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  encodeStatefulScore,
  melodicDiatonicInterval,
  octaveMarkRequired,
  spellMidiPitch,
} from "../dist/music-braille-stateful-encoder.js";

const packageRoot = path.resolve(process.cwd());
const profileCases = JSON.parse(fs.readFileSync(path.join(packageRoot, "spec", "mbc-2015", "profile-conformance-seed.json"), "utf8"));
const BS = String.fromCharCode(92);

test("all six frozen enharmonic fixtures are executable after Phase 14.5c1", () => {
  const cases = profileCases.cases.filter((c) => c.kind === "enharmonic-spelling" || c.kind === "enharmonic-octave-boundary");
  assert.equal(cases.length, 6);
  for (const fixture of cases) {
    const actual = spellMidiPitch(fixture.input.midiPitch, fixture.input.keySharpsFlats);
    assert.equal(actual.step, fixture.expected.step, fixture.id);
    assert.equal(actual.accidental, fixture.expected.accidental, fixture.id);
    if (fixture.expected.scientificWrittenOctave !== undefined) {
      assert.equal(actual.scientificOctave, fixture.expected.scientificWrittenOctave, fixture.id);
    }
  }
});

test("melodic octave marks follow the frozen MBC 3.2.2 interval rules", () => {
  const c4 = spellMidiPitch(60, 0);
  const d4 = spellMidiPitch(62, 0);
  const g4 = spellMidiPitch(67, 0);
  const c5 = spellMidiPitch(72, 0);
  assert.equal(octaveMarkRequired(null, c4), true);
  assert.equal(melodicDiatonicInterval(c4, d4), 2);
  assert.equal(octaveMarkRequired(c4, d4), false);
  assert.equal(melodicDiatonicInterval(d4, g4), 4);
  assert.equal(octaveMarkRequired(d4, g4), false);
  assert.equal(melodicDiatonicInterval(g4, c5), 4);
  assert.equal(octaveMarkRequired(g4, c5), true);
  assert.equal(melodicDiatonicInterval(c5, c4), 8);
  assert.equal(octaveMarkRequired(c5, c4), true);
});

test("stateful melody suppresses and reinstates octave marks contextually", () => {
  const result = encodeStatefulScore({
    measures: [{ events: [
      { kind: "note", midiPitch: 60, value: "quarter" },
      { kind: "note", midiPitch: 62, value: "quarter" },
      { kind: "note", midiPitch: 67, value: "quarter" },
      { kind: "note", midiPitch: 72, value: "quarter" },
      { kind: "note", midiPitch: 60, value: "quarter" },
    ] }],
  });
  assert.equal(result.brf, `"?:${BS}.?"?`);
  assert.equal(result.profileDisclosureRequired, true);
});

test("measure-scoped accidental state carries, counteracts, and resets", () => {
  const result = encodeStatefulScore({
    measures: [
      { events: [
        { kind: "note", midiPitch: 61, value: "quarter" },
        { kind: "note", midiPitch: 61, value: "quarter" },
        { kind: "note", midiPitch: 60, value: "quarter" },
        { kind: "note", midiPitch: 60, value: "quarter" },
      ] },
      { events: [{ kind: "note", midiPitch: 60, value: "quarter" }] },
    ],
  });
  assert.equal(result.brf, '%"??*?? ?');
});

test("key and meter are adjacent and force octave on first following note", () => {
  const result = encodeStatefulScore({
    keySharpsFlats: 1,
    meter: { numerator: 4, denominator: 4 },
    measures: [{ events: [{ kind: "note", midiPitch: 66, value: "quarter" }] }],
  });
  assert.equal(result.brf, '%#d4 "]');
  assert.ok(result.unicode.startsWith('⠩⠼⠙⠲⠀'));
});

test("C-major triad uses highest written note and downward 3rd/5th intervals", () => {
  const result = encodeStatefulScore({
    measures: [{ events: [{ kind: "chord", midiPitches: [60, 64, 67], value: "quarter" }] }],
  });
  assert.equal(result.brf, `"${BS}+9`);
  assert.equal(result.unicode, '⠐⠳⠬⠔');
  assert.equal(result.trace[0].written?.midiPitch, 67);
  assert.deepEqual(result.trace[0].members?.map((x) => x.midiPitch), [64, 60]);
});

test("whole-chord tie uses the authoritative chord tie after interval members", () => {
  const result = encodeStatefulScore({
    measures: [{ events: [{ kind: "chord", midiPitches: [60, 64, 67], value: "quarter", tieAll: true }] }],
  });
  assert.equal(result.brf, `"${BS}+9.c`);
});

test("chord accidental state is available to following melodic notes", () => {
  const result = encodeStatefulScore({
    measures: [{ events: [
      { kind: "chord", midiPitches: [61, 64, 67], value: "quarter" },
      { kind: "note", midiPitch: 61, value: "quarter" },
      { kind: "note", midiPitch: 60, value: "quarter" },
    ] }],
  });
  assert.equal(result.brf, `"${BS}+%9?*?`);
});

test("rests do not destroy melodic octave context", () => {
  const result = encodeStatefulScore({
    measures: [{ events: [
      { kind: "note", midiPitch: 60, value: "quarter" },
      { kind: "rest", value: "quarter" },
      { kind: "note", midiPitch: 62, value: "quarter" },
    ] }],
  });
  assert.equal(result.brf, '"?v:');
});

test("measure separator is one Braille blank and does not force an octave by itself", () => {
  const result = encodeStatefulScore({
    measures: [
      { events: [{ kind: "note", midiPitch: 60, value: "quarter" }] },
      { events: [{ kind: "note", midiPitch: 60, value: "quarter" }] },
    ],
  });
  assert.equal(result.brf, '"? ?');
  assert.equal(result.unicode, '⠐⠹⠀⠹');
});

test("unsupported compound and duplicate chord pitches fail closed", () => {
  assert.throws(() => encodeStatefulScore({
    measures: [{ events: [{ kind: "chord", midiPitches: [48, 67], value: "quarter" }] }],
  }), /UNSUPPORTED_COMPOUND_CHORD_INTERVAL/);
  assert.throws(() => encodeStatefulScore({
    measures: [{ events: [{ kind: "chord", midiPitches: [60, 60, 67], value: "quarter" }] }],
  }), /DUPLICATE_CHORD_PITCH/);
});

test("invalid score/profile inputs fail closed", () => {
  assert.throws(() => encodeStatefulScore({ measures: [] }), /requires at least one measure/);
  assert.throws(() => spellMidiPitch(128, 0), /MIDI pitch/);
  assert.throws(() => spellMidiPitch(60, 8), /keySharpsFlats/);
});

test("stateful encoder emits full-measure in-accord with dot-5 added rests and forced octave after the sign", () => {
  const result = encodeStatefulScore({
    measures: [
      {
        events: [
          {
            kind: "full-measure-in-accord",
            actions: [
              {
                events: [
                  { kind: "rest", value: "quarter", transcriberAdded: true },
                  { kind: "note", midiPitch: 64, value: "quarter" },
                  { kind: "rest", value: "half", transcriberAdded: true },
                ],
              },
              {
                events: [
                  { kind: "note", midiPitch: 60, value: "whole" },
                ],
              },
            ],
          },
        ],
      },
    ],
  });

  assert.equal(result.brf.includes("<>"), true);
  assert.equal(result.brf.startsWith('"'), true);
  assert.equal(result.brf.split("<>")[1]?.startsWith('"'), true);
});

test("measure after an in-accord starts its first note with an octave mark", () => {
  const result = encodeStatefulScore({
    measures: [
      {
        events: [
          {
            kind: "full-measure-in-accord",
            actions: [
              { events: [{ kind: "note", midiPitch: 64, value: "whole" }] },
              { events: [{ kind: "note", midiPitch: 60, value: "whole" }] },
            ],
          },
        ],
      },
      {
        events: [
          { kind: "note", midiPitch: 60, value: "quarter" },
        ],
      },
    ],
  });

  const afterMeasureSeparator = result.brf.split(" ")[1];
  assert.equal(afterMeasureSeparator?.startsWith('"'), true);
});

test("R2B stateful engine emits a semantic single-word expression before the note", () => {
  const result = encodeStatefulScore({
    measures: [{
      events: [{
        kind: "note",
        midiPitch: 60,
        value: "quarter",
        wordExpressions: [{
          sourceText: "Allegro",
          normalizedText: "allegro",
          brfText: "allegro",
          categories: ["tempo"],
          semanticTags: ["tempo", "fast"],
          canonicalTerms: ["allegro"],
          policy: "word-expression",
        }],
      }],
    }],
  });
  assert.equal(result.trace[0].emittedBrf.startsWith(">allegro"), true);
});

test("R2B stateful engine encloses a longer expression and preserves a following blank", () => {
  const result = encodeStatefulScore({
    measures: [{
      events: [{
        kind: "note",
        midiPitch: 60,
        value: "quarter",
        wordExpressions: [{
          sourceText: "Adagio sostenuto",
          normalizedText: "adagio sostenuto",
          brfText: "adagio sostenuto",
          categories: ["composite-expression"],
          semanticTags: ["tempo", "slow", "sustained"],
          canonicalTerms: ["adagio sostenuto"],
          policy: "word-expression",
        }],
      }],
    }],
  });
  assert.equal(result.trace[0].emittedBrf.startsWith(">adagio sostenuto> "), true);
});

test("R2B stateful engine emits canonical cr. with Music-Braille dot-3 period", () => {
  const result = encodeStatefulScore({
    measures: [{
      events: [{
        kind: "note",
        midiPitch: 60,
        value: "quarter",
        wordExpressions: [{
          sourceText: "cresc.",
          normalizedText: "cresc.",
          brfText: "cr.",
          categories: ["dynamic-text"],
          semanticTags: ["dynamic-change", "increase"],
          canonicalTerms: ["crescendo"],
          policy: "canonical-word-expression",
        }],
      }],
    }],
  });
  assert.equal(result.trace[0].emittedBrf.startsWith(">cr'"), true);
});
