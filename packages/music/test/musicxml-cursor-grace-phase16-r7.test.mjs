import test from "node:test";
import assert from "node:assert/strict";

import {
  translateMusicXmlTextToBraille,
} from "../dist/musicxml-to-braille.js";

import {
  STATEFUL_GRACE_BRF,
} from "../dist/music-braille-stateful-encoder.js";

const keyboardGrace = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
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
      <note>
        <grace slash="yes"/>
        <pitch><step>C</step><octave>5</octave></pitch>
        <voice>1</voice><type>eighth</type><staff>1</staff>
      </note>
      <note>
        <pitch><step>D</step><octave>5</octave></pitch>
        <duration>4</duration><voice>1</voice><type>whole</type><staff>1</staff>
      </note>
      <backup><duration>4</duration></backup>
      <note>
        <rest measure="yes"/>
        <duration>4</duration><voice>5</voice><staff>2</staff>
      </note>
    </measure>
  </part>
</score-partwise>`;

test("R7 slashed grace survives explicit keyboard backup/forward lane", () => {
  const actual = translateMusicXmlTextToBraille(keyboardGrace);
  assert.equal(
    actual.ok,
    true,
    actual.ok ? undefined : `${actual.stage}:${actual.code}:${actual.message}`,
  );
  if (!actual.ok) return;

  assert.equal(actual.parts[0].brf.includes(STATEFUL_GRACE_BRF.short), true);
});

test("R7 ordinary non-keyboard backup/forward grace remains fail-closed", () => {
  const xml = keyboardGrace
    .replace("<staves>2</staves>", "")
    .replace("<staff>2</staff>", "<staff>1</staff>")
    .replace('<clef number="2"><sign>F</sign><line>4</line></clef>', "");

  const actual = translateMusicXmlTextToBraille(xml);
  assert.equal(actual.ok, false);
  if (!actual.ok) assert.equal(actual.code, "UNSUPPORTED_GRACE");
});
