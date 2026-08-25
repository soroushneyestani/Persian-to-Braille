import test from "node:test";
import assert from "node:assert/strict";

import {
  translateMusicXmlTextToBraille,
} from "../dist/musicxml-to-braille.js";

import {
  STATEFUL_GRACE_BRF,
  STATEFUL_SIMPLE_SLUR_BRF,
} from "../dist/music-braille-stateful-encoder.js";

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list>
    <score-part id="P1">
      <part-name>Piano</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>1</beats><beat-type>4</beat-type></time>
        <clef number="1"><sign>G</sign><line>2</line></clef>
      </attributes>
      <note>
        <grace slash="yes"/>
        <pitch><step>C</step><octave>5</octave></pitch>
        <voice>1</voice><type>eighth</type><staff>1</staff>
        <notations>
          <slur type="start" number="1"/>
        </notations>
      </note>
      <note>
        <pitch><step>D</step><octave>5</octave></pitch>
        <duration>1</duration>
        <voice>1</voice><type>quarter</type><staff>1</staff>
      </note>
    </measure>
    <measure number="2">
      <note>
        <pitch><step>E</step><octave>5</octave></pitch>
        <duration>1</duration>
        <voice>1</voice><type>quarter</type><staff>1</staff>
        <notations>
          <slur type="stop" number="1"/>
        </notations>
      </note>
    </measure>
  </part>
</score-partwise>`;

test("V18J same-lane cross-measure appoggiatura slur reuses existing BANA slur planner", () => {
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

  const trace =
    actual.parts[0].trace;

  assert.equal(
    trace[0].emittedBrf.startsWith(
      STATEFUL_GRACE_BRF.short,
    ),
    true,
  );

  assert.equal(
    trace[0].emittedBrf.endsWith(
      STATEFUL_SIMPLE_SLUR_BRF,
    ),
    true,
  );

  assert.equal(
    trace[1].emittedBrf.endsWith(
      STATEFUL_SIMPLE_SLUR_BRF,
    ),
    true,
  );
});
