import test from "node:test";
import assert from "node:assert/strict";

import {
  translateMusicXmlTextToBraille,
} from "../dist/musicxml-to-braille.js";

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list>
    <score-part id="P1"><part-name>Piano</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>8</divisions>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <staves>2</staves>
        <clef number="1"><sign>G</sign><line>2</line></clef>
        <clef number="2"><sign>F</sign><line>4</line></clef>
      </attributes>
      <direction>
        <direction-type><words>Adagio</words></direction-type>
        <staff>1</staff>
      </direction>
      <note>
        <pitch><step>A</step><octave>5</octave></pitch>
        <duration>32</duration><voice>1</voice><type>whole</type><staff>1</staff>
      </note>
      <backup><duration>32</duration></backup>
      <note>
        <pitch><step>A</step><octave>2</octave></pitch>
        <duration>32</duration><voice>5</voice><type>whole</type><staff>2</staff>
      </note>
    </measure>
  </part>
</score-partwise>`;

test("V18P staff-1 Adagio at keyboard measure onset is promoted as a global tempo expression", () => {
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
    actual.parts[0].brf.length > 0,
    true,
  );
});
