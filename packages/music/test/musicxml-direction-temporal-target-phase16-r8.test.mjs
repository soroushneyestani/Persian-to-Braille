import test from "node:test";
import assert from "node:assert/strict";

import {
  translateMusicXmlTextToBraille,
} from "../dist/musicxml-to-braille.js";

import {
  STATEFUL_HAIRPIN_START_BRF,
  STATEFUL_HAIRPIN_STOP_BRF,
} from "../dist/music-braille-stateful-encoder.js";

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list>
    <score-part id="P1"><part-name>Piano</part-name></score-part>
  </part-list>
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
        <pitch><step>C</step><octave>4</octave></pitch>
        <duration>1</duration><voice>1</voice><type>quarter</type><staff>2</staff>
      </note>
      <direction>
        <direction-type><wedge type="crescendo" number="1"/></direction-type>
        <staff>1</staff>
      </direction>
      <note>
        <pitch><step>D</step><octave>4</octave></pitch>
        <duration>1</duration><voice>1</voice><type>quarter</type><staff>2</staff>
      </note>
      <direction>
        <direction-type><wedge type="stop" number="1"/></direction-type>
        <staff>1</staff>
      </direction>
      <direction>
        <direction-type><wedge type="diminuendo" number="1"/></direction-type>
        <staff>1</staff>
      </direction>
      <note>
        <pitch><step>E</step><octave>4</octave></pitch>
        <duration>1</duration><voice>1</voice><type>quarter</type><staff>2</staff>
      </note>
      <direction>
        <direction-type><wedge type="stop" number="1"/></direction-type>
        <staff>1</staff>
      </direction>
      <note>
        <pitch><step>F</step><octave>4</octave></pitch>
        <duration>1</duration><voice>1</voice><type>quarter</type><staff>2</staff>
      </note>
    </measure>
  </part>
</score-partwise>`;

test("V18K crossed-staff layout does not move two hairpin starts onto one future event", () => {
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

  for (const sign of [
    STATEFUL_HAIRPIN_START_BRF.crescendo,
    STATEFUL_HAIRPIN_STOP_BRF.crescendo,
    STATEFUL_HAIRPIN_START_BRF.diminuendo,
    STATEFUL_HAIRPIN_STOP_BRF.diminuendo,
  ]) {
    assert.equal(actual.parts[0].brf.includes(sign), true);
  }
});
