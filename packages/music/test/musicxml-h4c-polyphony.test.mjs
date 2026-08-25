/* PHASE16_5A_MUSICXML_H4C */
import test from "node:test";
import assert from "node:assert/strict";
import {
  translateMusicXmlTextToBraille,
} from "../dist/index.js";
import {
  encodeStatefulScore,
} from "../dist/music-braille-stateful-encoder.js";

function score(body, clef = "G") {
  return `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <part-list><score-part id="P1"><part-name>Polyphony</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef number="1"><sign>${clef}</sign><line>${clef === "G" ? 2 : 4}</line></clef>
      </attributes>
      ${body}
    </measure>
  </part>
</score-partwise>`;
}

test("treble H4C orders explicit voices highest-to-lowest", () => {
  const actual = translateMusicXmlTextToBraille(score(`
    <note><pitch><step>C</step><octave>5</octave></pitch><duration>4</duration><voice>upper</voice><type>whole</type><staff>1</staff></note>
    <backup><duration>4</duration></backup>
    <note><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><voice>lower</voice><type>whole</type><staff>1</staff></note>
  `));

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
            kind: "note", midiPitch: 72,
            writtenPitch: { step: "C", accidental: 0, scientificOctave: 5 },
            value: "whole",
          }] },
          { events: [{
            kind: "note", midiPitch: 60,
            writtenPitch: { step: "C", accidental: 0, scientificOctave: 4 },
            value: "whole",
          }] },
        ],
      }],
    }],
  });

  assert.equal(actual.parts[0].brf, expected.brf);
});

test("bass H4C orders explicit voices lowest-to-highest", () => {
  const actual = translateMusicXmlTextToBraille(score(`
    <note><pitch><step>C</step><octave>3</octave></pitch><duration>4</duration><voice>upper</voice><type>whole</type><staff>1</staff></note>
    <backup><duration>4</duration></backup>
    <note><pitch><step>C</step><octave>2</octave></pitch><duration>4</duration><voice>lower</voice><type>whole</type><staff>1</staff></note>
  `, "F"));

  assert.equal(actual.ok, true);
  if (!actual.ok) return;

  assert.equal(actual.parts[0].trace[0].kind, "full-measure-in-accord");

  const expected = encodeStatefulScore({
    keySharpsFlats: 0,
    meter: { numerator: 4, denominator: 4 },
    measures: [{
      events: [{
        kind: "full-measure-in-accord",
        actions: [
          { events: [{
            kind: "note", midiPitch: 36,
            writtenPitch: { step: "C", accidental: 0, scientificOctave: 2 },
            value: "whole",
          }] },
          { events: [{
            kind: "note", midiPitch: 48,
            writtenPitch: { step: "C", accidental: 0, scientificOctave: 3 },
            value: "whole",
          }] },
        ],
      }],
    }],
  });

  assert.equal(actual.parts[0].brf, expected.brf);
});

test("implied voice rest is emitted as transcriber-added rest through existing H4C engine", () => {
  const actual = translateMusicXmlTextToBraille(score(`
    <note><pitch><step>C</step><octave>5</octave></pitch><duration>2</duration><voice>1</voice><type>half</type><staff>1</staff></note>
    <forward><duration>2</duration></forward>
    <backup><duration>4</duration></backup>
    <note><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><voice>2</voice><type>whole</type><staff>1</staff></note>
  `));

  assert.equal(actual.ok, true);
  if (!actual.ok) return;

  const expected = encodeStatefulScore({
    keySharpsFlats: 0,
    meter: { numerator: 4, denominator: 4 },
    measures: [{
      events: [{
        kind: "full-measure-in-accord",
        actions: [
          { events: [
            {
              kind: "note", midiPitch: 72,
              writtenPitch: { step: "C", accidental: 0, scientificOctave: 5 },
              value: "half",
            },
            { kind: "rest", value: "half", transcriberAdded: true },
          ] },
          { events: [{
            kind: "note", midiPitch: 60,
            writtenPitch: { step: "C", accidental: 0, scientificOctave: 4 },
            value: "whole",
          }] },
        ],
      }],
    }],
  });

  assert.equal(actual.parts[0].brf, expected.brf);
});

test("multi-staff cursor polyphony uses the bounded keyboard parallel compatibility profile", () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <part-list><score-part id="P1"><part-name>Piano</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <staves>2</staves>
        <clef number="1"><sign>G</sign><line>2</line></clef>
        <clef number="2"><sign>F</sign><line>4</line></clef>
      </attributes>
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>4</duration><voice>1</voice><type>whole</type><staff>1</staff></note>
      <backup><duration>4</duration></backup>
      <note><pitch><step>C</step><octave>3</octave></pitch><duration>4</duration><voice>2</voice><type>whole</type><staff>2</staff></note>
    </measure>
  </part>
</score-partwise>`;

  const actual = translateMusicXmlTextToBraille(xml);
  assert.equal(actual.ok, true);
  if (!actual.ok) {
    assert.equal(actual.code, "UNSUPPORTED_MULTI_STAFF_POLYPHONY");
    assert.equal(actual.stage, "bridge");
  }
});

test("crossed or register-overlapping explicit voices remain fail-closed", () => {
  const actual = translateMusicXmlTextToBraille(score(`
    <note><pitch><step>C</step><octave>5</octave></pitch><duration>2</duration><voice>1</voice><type>half</type><staff>1</staff></note>
    <note><pitch><step>C</step><octave>4</octave></pitch><duration>2</duration><voice>1</voice><type>half</type><staff>1</staff></note>
    <backup><duration>4</duration></backup>
    <note><pitch><step>G</step><octave>4</octave></pitch><duration>2</duration><voice>2</voice><type>half</type><staff>1</staff></note>
    <note><pitch><step>G</step><octave>5</octave></pitch><duration>2</duration><voice>2</voice><type>half</type><staff>1</staff></note>
  `));

  assert.equal(actual.ok, false);
  if (!actual.ok) {
    assert.equal(actual.code, "UNSUPPORTED_CROSSED_VOICES");
    assert.equal(actual.stage, "bridge");
  }
});
