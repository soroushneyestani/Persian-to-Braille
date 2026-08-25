/* PHASE16_5_UNIFIED_GRACE */
import test from "node:test";
import assert from "node:assert/strict";

import { translateMusicXmlTextToBraille } from "../dist/index.js";
import {
  encodeStatefulScore,
  STATEFUL_GRACE_BRF,
} from "../dist/music-braille-stateful-encoder.js";

function score(body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <part-list><score-part id="P1"><part-name>Grace</part-name></score-part></part-list>
  <part id="P1"><measure number="1">
    <attributes>
      <divisions>1</divisions>
      <key><fifths>0</fifths></key>
      <time><beats>4</beats><beat-type>4</beat-type></time>
      <clef number="1"><sign>G</sign><line>2</line></clef>
    </attributes>
    ${body}
  </measure></part>
</score-partwise>`;
}

function grace(step, octave, slash) {
  const slashAttr = slash === undefined ? "" : ` slash="${slash ? "yes" : "no"}"`;
  return `<note>
    <grace${slashAttr}/>
    <pitch><step>${step}</step><octave>${octave}</octave></pitch>
    <voice>1</voice><type>eighth</type><staff>1</staff>
  </note>`;
}

function regular(step, octave, duration = 1, type = "quarter") {
  return `<note>
    <pitch><step>${step}</step><octave>${octave}</octave></pitch>
    <duration>${duration}</duration><voice>1</voice><type>${type}</type><staff>1</staff>
  </note>`;
}

test("single slashed grace note maps to frozen BANA short-appoggiatura sign", () => {
  const actual = translateMusicXmlTextToBraille(
    score(grace("D", 4, true) + regular("E", 4)),
  );
  assert.equal(actual.ok, true);
  if (!actual.ok) return;

  const expected = encodeStatefulScore({
    keySharpsFlats: 0,
    meter: { numerator: 4, denominator: 4 },
    measures: [{
      events: [
        {
          kind: "note",
          midiPitch: 62,
          writtenPitch: { step: "D", accidental: 0, scientificOctave: 4 },
          value: "eighth",
          grace: "short",
        },
        {
          kind: "note",
          midiPitch: 64,
          writtenPitch: { step: "E", accidental: 0, scientificOctave: 4 },
          value: "quarter",
        },
      ],
    }],
  });

  assert.equal(actual.parts[0].brf, expected.brf);
  assert.equal(STATEFUL_GRACE_BRF.short, "5");
});

test("single unslashed grace note maps to frozen BANA long-appoggiatura sign", () => {
  const actual = translateMusicXmlTextToBraille(
    score(grace("D", 4, false) + regular("E", 4)),
  );
  assert.equal(actual.ok, true);
  if (!actual.ok) return;

  const expected = encodeStatefulScore({
    keySharpsFlats: 0,
    meter: { numerator: 4, denominator: 4 },
    measures: [{
      events: [
        {
          kind: "note",
          midiPitch: 62,
          writtenPitch: { step: "D", accidental: 0, scientificOctave: 4 },
          value: "eighth",
          grace: "long",
        },
        {
          kind: "note",
          midiPitch: 64,
          writtenPitch: { step: "E", accidental: 0, scientificOctave: 4 },
          value: "quarter",
        },
      ],
    }],
  });

  assert.equal(actual.parts[0].brf, expected.brf);
  assert.equal(STATEFUL_GRACE_BRF.long, '"5');
});

test("short appoggiatura prefix precedes accidental and octave material", () => {
  const actual = translateMusicXmlTextToBraille(score(`
    <note>
      <grace slash="yes"/>
      <pitch><step>C</step><alter>1</alter><octave>5</octave></pitch>
      <voice>1</voice><type>eighth</type><staff>1</staff>
    </note>
    ${regular("D", 5)}
  `));
  assert.equal(actual.ok, true);
  if (!actual.ok) return;

  assert.equal(actual.parts[0].trace[0].emittedBrf.startsWith("5"), true);
});

test("a run of three successive grace notes is treated as short appoggiaturas without consuming measure time", () => {
  const actual = translateMusicXmlTextToBraille(score(
    grace("C", 4)
    + grace("D", 4)
    + grace("E", 4)
    + regular("F", 4, 4, "whole"),
  ));
  assert.equal(actual.ok, true);
  if (!actual.ok) return;

  const expected = encodeStatefulScore({
    keySharpsFlats: 0,
    meter: { numerator: 4, denominator: 4 },
    measures: [{
      events: [
        {
          kind: "note", midiPitch: 60,
          writtenPitch: { step: "C", accidental: 0, scientificOctave: 4 },
          value: "eighth", grace: "short",
        },
        {
          kind: "note", midiPitch: 62,
          writtenPitch: { step: "D", accidental: 0, scientificOctave: 4 },
          value: "eighth", grace: "short",
        },
        {
          kind: "note", midiPitch: 64,
          writtenPitch: { step: "E", accidental: 0, scientificOctave: 4 },
          value: "eighth", grace: "short",
        },
        {
          kind: "note", midiPitch: 65,
          writtenPitch: { step: "F", accidental: 0, scientificOctave: 4 },
          value: "whole",
        },
      ],
    }],
  });

  assert.equal(actual.parts[0].brf, expected.brf);
});

test("four or more successive appoggiaturas remain fail-closed because BANA doubling is not auto-selected", () => {
  const actual = translateMusicXmlTextToBraille(score(
    grace("C", 4)
    + grace("D", 4)
    + grace("E", 4)
    + grace("F", 4)
    + regular("G", 4),
  ));
  assert.equal(actual.ok, false);
  if (!actual.ok) {
    assert.equal(actual.code, "UNSUPPORTED_GRACE");
    assert.equal(actual.stage, "bridge");
  }
});

test("grace chord remains explicit fail-closed in the unified Phase 16.5 subset", () => {
  const actual = translateMusicXmlTextToBraille(score(`
    <note>
      <grace slash="yes"/>
      <pitch><step>C</step><octave>4</octave></pitch>
      <voice>1</voice><type>eighth</type><staff>1</staff>
    </note>
    <note>
      <chord/><grace slash="yes"/>
      <pitch><step>E</step><octave>4</octave></pitch>
      <voice>1</voice><type>eighth</type><staff>1</staff>
    </note>
    ${regular("G", 4)}
  `));
  assert.equal(actual.ok, false);
  if (!actual.ok) assert.equal(actual.code, "UNSUPPORTED_GRACE");
});

test("grace note combined with an articulation remains fail-closed instead of guessing BANA ordering", () => {
  const actual = translateMusicXmlTextToBraille(score(`
    <note>
      <grace slash="yes"/>
      <pitch><step>C</step><octave>4</octave></pitch>
      <voice>1</voice><type>eighth</type><staff>1</staff>
      <notations><articulations><staccato/></articulations></notations>
    </note>
    ${regular("D", 4)}
  `));
  assert.equal(actual.ok, false);
  if (!actual.ok) assert.equal(actual.code, "UNSUPPORTED_GRACE");
});
