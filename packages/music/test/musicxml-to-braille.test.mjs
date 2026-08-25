/* PHASE16_PACK_B_MUSICXML */
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import {
  translateMusicXmlTextToBraille,
  translateMxlToBraille,
} from "../dist/index.js";
import { encodeStatefulScore } from "../dist/music-braille-stateful-encoder.js";

function score(body, attributes = "<divisions>1</divisions><key><fifths>0</fifths></key>") {
  return `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <part-list><score-part id="P1"><part-name>Test</part-name></score-part></part-list>
  <part id="P1"><measure number="1"><attributes>${attributes}</attributes>${body}</measure></part>
</score-partwise>`;
}

test("simple MusicXML note has exact parity with existing stateful engine", () => {
  const actual = translateMusicXmlTextToBraille(score(
    `<note><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>`,
    `<divisions>1</divisions><key><fifths>0</fifths></key><time><beats>4</beats><beat-type>4</beat-type></time>`,
  ));
  assert.equal(actual.ok, true);
  if (!actual.ok) return;

  const expected = encodeStatefulScore({
    keySharpsFlats: 0,
    meter: { numerator: 4, denominator: 4 },
    measures: [{ events: [{
      kind: "note", midiPitch: 60,
      writtenPitch: { step: "C", accidental: 0, scientificOctave: 4 },
      value: "quarter",
    }] }],
  });

  assert.equal(actual.parts[0].brf, expected.brf);
  assert.equal(actual.parts[0].unicodeBraille, expected.unicode);
  assert.equal(actual.parts[0].engineProfileId, expected.profileId);
  assert.equal(actual.diagnostics.some((d) => d.code === "ENGINE_PROFILE_REUSED"), true);
});

test("MusicXML enharmonic spelling is preserved instead of canonicalized from MIDI", () => {
  const actual = translateMusicXmlTextToBraille(score(
    `<note><pitch><step>D</step><alter>-1</alter><octave>4</octave></pitch><duration>1</duration><type>quarter</type><accidental>flat</accidental></note>`,
  ));
  assert.equal(actual.ok, true);
  if (!actual.ok) return;

  const preserved = encodeStatefulScore({
    keySharpsFlats: 0,
    measures: [{ events: [{
      kind: "note", midiPitch: 61,
      writtenPitch: { step: "D", accidental: -1, scientificOctave: 4 },
      value: "quarter",
    }] }],
  });
  const canonical = encodeStatefulScore({
    keySharpsFlats: 0,
    measures: [{ events: [{ kind: "note", midiPitch: 61, value: "quarter" }] }],
  });

  assert.equal(actual.parts[0].brf, preserved.brf);
  assert.equal(actual.parts[0].trace[0].written?.display, "Db4");
  assert.notEqual(preserved.brf, canonical.brf);
});

test("MusicXML chord and whole-chord tie reuse existing chord encoder", () => {
  const actual = translateMusicXmlTextToBraille(score(`
    <note><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type><tie type="start"/><notations><tied type="start"/></notations></note>
    <note><chord/><pitch><step>E</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type><tie type="start"/><notations><tied type="start"/></notations></note>
    <note><chord/><pitch><step>G</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type><tie type="start"/><notations><tied type="start"/></notations></note>
  `));
  assert.equal(actual.ok, true);
  if (!actual.ok) return;

  const expected = encodeStatefulScore({
    keySharpsFlats: 0,
    measures: [{ events: [{
      kind: "chord",
      midiPitches: [60, 64, 67],
      writtenPitches: [
        { step: "C", accidental: 0, scientificOctave: 4 },
        { step: "E", accidental: 0, scientificOctave: 4 },
        { step: "G", accidental: 0, scientificOctave: 4 },
      ],
      value: "quarter",
      tieAll: true,
    }] }],
  });

  assert.equal(actual.parts[0].brf, expected.brf);
  assert.equal(actual.parts[0].trace[0].written?.display, "G4");
});

test("complete explicit 3:2 triplet maps to existing tripletStart surface", () => {
  const actual = translateMusicXmlTextToBraille(score(`
    <note><pitch><step>C</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type><time-modification><actual-notes>3</actual-notes><normal-notes>2</normal-notes></time-modification><notations><tuplet type="start" number="1"/></notations></note>
    <note><pitch><step>D</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type><time-modification><actual-notes>3</actual-notes><normal-notes>2</normal-notes></time-modification></note>
    <note><pitch><step>E</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type><time-modification><actual-notes>3</actual-notes><normal-notes>2</normal-notes></time-modification><notations><tuplet type="stop" number="1"/></notations></note>
  `, `<divisions>3</divisions><key><fifths>0</fifths></key>`));
  assert.equal(actual.ok, true);
  if (!actual.ok) return;

  const expected = encodeStatefulScore({
    keySharpsFlats: 0,
    measures: [{ events: [
      { kind: "note", midiPitch: 60, writtenPitch: { step: "C", accidental: 0, scientificOctave: 4 }, value: "quarter", tripletStart: true },
      { kind: "note", midiPitch: 62, writtenPitch: { step: "D", accidental: 0, scientificOctave: 4 }, value: "quarter" },
      { kind: "note", midiPitch: 64, writtenPitch: { step: "E", accidental: 0, scientificOctave: 4 }, value: "quarter" },
    ] }],
  });
  assert.equal(actual.parts[0].brf, expected.brf);
});

test("slur is explicit fail-closed, never silently discarded", () => {
  const actual = translateMusicXmlTextToBraille(score(
    `<note><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type><notations><slur type="start" number="1"/></notations></note>`,
  ));
  assert.equal(actual.ok, false);
  if (!actual.ok) {
    assert.equal(actual.code, "UNSUPPORTED_SLUR");
    assert.equal(actual.stage, "bridge");
  }
});

test("full-measure explicit MusicXML voice polyphony reuses frozen H4C in-accord", () => {
  const actual = translateMusicXmlTextToBraille(score(`
    <note><pitch><step>C</step><octave>5</octave></pitch><duration>4</duration><voice>1</voice><type>whole</type><staff>1</staff></note>
    <backup><duration>4</duration></backup>
    <note><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><voice>2</voice><type>whole</type><staff>1</staff></note>
  `, `<divisions>1</divisions><key><fifths>0</fifths></key><time><beats>4</beats><beat-type>4</beat-type></time><clef number="1"><sign>G</sign><line>2</line></clef>`));

  assert.equal(actual.ok, true);
  if (!actual.ok) return;

  const expected = encodeStatefulScore({
    keySharpsFlats: 0,
    meter: { numerator: 4, denominator: 4 },
    measures: [{
      events: [{
        kind: "full-measure-in-accord",
        actions: [
          { events: [{
            kind: "note",
            midiPitch: 72,
            writtenPitch: { step: "C", accidental: 0, scientificOctave: 5 },
            value: "whole",
          }] },
          { events: [{
            kind: "note",
            midiPitch: 60,
            writtenPitch: { step: "C", accidental: 0, scientificOctave: 4 },
            value: "whole",
          }] },
        ],
      }],
    }],
  });

  assert.equal(actual.parts[0].brf, expected.brf);
  assert.equal(actual.parts[0].unicodeBraille, expected.unicode);
  assert.equal(actual.parts[0].trace[0].kind, "full-measure-in-accord");
});

test("real Beethoven MXL reaches structured bridge decision without parser regression", async (t) => {
  const corpus = new URL("../../../test-data/musicxml/downloads-import/Beethoven_Symphony_No._5_1st_movement_Piano_solo.mxl", import.meta.url);
  if (!fs.existsSync(corpus)) {
    t.skip("Beethoven corpus not present.");
    return;
  }

  const actual = await translateMxlToBraille(new Uint8Array(fs.readFileSync(corpus)));
  if (actual.ok) {
    assert.ok(actual.parts.length > 0);
    assert.ok(actual.brf.length > 0);
    return;
  }

  assert.equal(["bridge", "adapter"].includes(actual.stage), true);
  assert.notEqual(actual.code, "INVALID_XML");
});
