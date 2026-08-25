import test from "node:test";
import assert from "node:assert/strict";

import {
  translateMusicXmlTextToBraille,
} from "../dist/musicxml-to-braille.js";

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list><score-part id="P1"><part-name>Piano</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>8</divisions>
        <time><beats>2</beats><beat-type>4</beat-type></time>
      </attributes>
      <direction>
        <direction-type><dynamics><mp/></dynamics></direction-type>
        <staff>1</staff>
      </direction>
      <note>
        <grace slash="yes"/>
        <pitch><step>F</step><octave>4</octave></pitch>
        <voice>1</voice><type>eighth</type><staff>1</staff>
        <notations><slur type="start" number="1"/></notations>
      </note>
      <note>
        <grace/>
        <pitch><step>A</step><octave>4</octave></pitch>
        <voice>1</voice><type>eighth</type><staff>1</staff>
      </note>
      <note>
        <pitch><step>E</step><octave>5</octave></pitch>
        <duration>16</duration><voice>1</voice><type>half</type><staff>1</staff>
        <notations><slur type="stop" number="1"/></notations>
      </note>
    </measure>
  </part>
</score-partwise>`;

test("V18R mp before a two-note appoggiatura run emits instead of rejecting grace+dynamic", () => {
  const actual =
    translateMusicXmlTextToBraille(xml);

  assert.equal(
    actual.ok,
    true,
    actual.ok
      ? undefined
      : `${actual.stage}:${actual.code}:${actual.message}`,
  );

  if (!actual.ok) return;

  assert.equal(
    actual.parts[0].brf.includes(">mp"),
    true,
  );
});

test("V18R grace plus articulation remains fail-closed", () => {
  const withArticulation =
    xml.replace(
      '<notations><slur type="start" number="1"/></notations>',
      '<notations><slur type="start" number="1"/><articulations><staccato/></articulations></notations>',
    );

  const actual =
    translateMusicXmlTextToBraille(
      withArticulation,
    );

  assert.equal(actual.ok, false);

  if (!actual.ok) {
    assert.equal(
      actual.code,
      "UNSUPPORTED_GRACE",
    );
  }
});
