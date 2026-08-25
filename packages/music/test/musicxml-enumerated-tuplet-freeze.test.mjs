/* PHASE16_5C_ENUMERATED_TUPLET_FREEZE */
import test from "node:test";
import assert from "node:assert/strict";

import {
  GROUPING_SYMBOLS,
  tripletIndicatorBrf,
} from "../dist/music-braille-atomic-encoder.js";
import {
  translateMusicXmlTextToBraille,
} from "../dist/index.js";

function score(body, divisions = 1) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <part-list>
    <score-part id="P1"><part-name>Tuplets</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>${divisions}</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef number="1"><sign>G</sign><line>2</line></clef>
      </attributes>
      ${body}
    </measure>
  </part>
</score-partwise>`;
}

test("Phase 16.5C freezes only the four authoritative enumerated grouping signs", () => {
  assert.deepEqual(
    GROUPING_SYMBOLS,
    {
      tripletSingleCell: "2",
      tripletThreeCell: "_3'",
      groupTwo: "_2'",
      groupTen: "_10'",
    },
  );
});

test("existing MusicXML 3:2 triplet continues to use the single-cell triplet sign", () => {
  const xml = score(`
    <note>
      <pitch><step>C</step><octave>4</octave></pitch>
      <duration>2</duration><type>quarter</type>
      <time-modification>
        <actual-notes>3</actual-notes><normal-notes>2</normal-notes>
      </time-modification>
      <notations><tuplet type="start" number="1"/></notations>
    </note>
    <note>
      <pitch><step>D</step><octave>4</octave></pitch>
      <duration>2</duration><type>quarter</type>
      <time-modification>
        <actual-notes>3</actual-notes><normal-notes>2</normal-notes>
      </time-modification>
    </note>
    <note>
      <pitch><step>E</step><octave>4</octave></pitch>
      <duration>2</duration><type>quarter</type>
      <time-modification>
        <actual-notes>3</actual-notes><normal-notes>2</normal-notes>
      </time-modification>
      <notations><tuplet type="stop" number="1"/></notations>
    </note>
  `, 3);

  const actual = translateMusicXmlTextToBraille(xml);
  assert.equal(actual.ok, true);
  if (!actual.ok) return;

  assert.equal(actual.parts[0].brf.includes(tripletIndicatorBrf()), true);
  assert.equal(actual.parts[0].brf.includes(GROUPING_SYMBOLS.tripletThreeCell), false);
});

test("enumerated group-of-two sign is not auto-bridged without a frozen MusicXML selection contract", () => {
  const xml = score(`
    <note>
      <pitch><step>C</step><octave>4</octave></pitch>
      <duration>3</duration><type>quarter</type>
      <time-modification>
        <actual-notes>2</actual-notes><normal-notes>3</normal-notes>
      </time-modification>
      <notations><tuplet type="start" number="1"/></notations>
    </note>
    <note>
      <pitch><step>D</step><octave>4</octave></pitch>
      <duration>3</duration><type>quarter</type>
      <time-modification>
        <actual-notes>2</actual-notes><normal-notes>3</normal-notes>
      </time-modification>
      <notations><tuplet type="stop" number="1"/></notations>
    </note>
  `, 2);

  const actual = translateMusicXmlTextToBraille(xml);
  assert.equal(actual.ok, false);
  if (!actual.ok) {
    assert.equal(actual.code, "UNSUPPORTED_TUPLET");
    assert.equal(actual.stage, "bridge");
  }
});

test("enumerated group-of-ten sign is not auto-bridged without a frozen MusicXML selection contract", () => {
  const note = (step, start, stop) => `
    <note>
      <pitch><step>${step}</step><octave>4</octave></pitch>
      <duration>1</duration><type>16th</type>
      <time-modification>
        <actual-notes>10</actual-notes><normal-notes>8</normal-notes>
      </time-modification>
      ${start || stop ? `<notations><tuplet type="${start ? "start" : "stop"}" number="1"/></notations>` : ""}
    </note>`;

  const body = [
    note("C", true, false),
    note("D", false, false),
    note("E", false, false),
    note("F", false, false),
    note("G", false, false),
    note("A", false, false),
    note("B", false, false),
    note("C", false, false),
    note("D", false, false),
    note("E", false, true),
  ].join("");

  const actual = translateMusicXmlTextToBraille(score(body, 10));
  assert.equal(actual.ok, false);
  if (!actual.ok) {
    assert.equal(actual.code, "UNSUPPORTED_TUPLET");
    assert.equal(actual.stage, "bridge");
  }
});

test("arbitrary irregular group-of-five remains fail-closed; no generic _N apostrophe synthesis is inferred", () => {
  const xml = score(`
    <note>
      <pitch><step>C</step><octave>4</octave></pitch>
      <duration>4</duration><type>quarter</type>
      <time-modification>
        <actual-notes>5</actual-notes><normal-notes>4</normal-notes>
      </time-modification>
      <notations><tuplet type="start" number="1"/></notations>
    </note>
  `, 5);

  const actual = translateMusicXmlTextToBraille(xml);
  assert.equal(actual.ok, false);
  if (!actual.ok) {
    assert.equal(actual.code, "UNSUPPORTED_TUPLET");
    assert.equal(actual.stage, "bridge");
  }
});
