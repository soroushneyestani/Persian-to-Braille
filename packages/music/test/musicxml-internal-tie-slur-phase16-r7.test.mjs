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
        <divisions>1</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef number="1"><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration><voice>1</voice><type>quarter</type><staff>1</staff></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>1</duration><voice>1</voice><type>quarter</type><staff>1</staff></note>
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>1</duration><voice>1</voice><type>quarter</type><staff>1</staff></note>
      <note>
        <pitch><step>F</step><octave>4</octave></pitch><duration>1</duration>
        <voice>1</voice><type>quarter</type><staff>1</staff>
        <notations><slur type="start" number="1"/></notations>
      </note>
    </measure>
    <measure number="2">
      <note>
        <pitch><step>G</step><octave>4</octave></pitch><duration>1</duration>
        <voice>1</voice><type>quarter</type><staff>1</staff>
        <tie type="start"/><notations><tied type="start"/></notations>
      </note>
      <note>
        <pitch><step>G</step><octave>4</octave></pitch><duration>1</duration>
        <voice>1</voice><type>quarter</type><staff>1</staff>
        <tie type="stop"/><notations><tied type="stop"/></notations>
      </note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>1</duration><voice>1</voice><type>quarter</type><staff>1</staff></note>
      <note>
        <pitch><step>B</step><octave>4</octave></pitch><duration>1</duration>
        <voice>1</voice><type>quarter</type><staff>1</staff>
        <notations><slur type="stop" number="1"/></notations>
      </note>
    </measure>
  </part>
</score-partwise>`;

test("R7 cross-measure phrase admits an internal tie away from slur endpoints", () => {
  const actual = translateMusicXmlTextToBraille(xml);
  assert.equal(
    actual.ok,
    true,
    actual.ok ? undefined : `${actual.stage}:${actual.code}:${actual.message}`,
  );
});
