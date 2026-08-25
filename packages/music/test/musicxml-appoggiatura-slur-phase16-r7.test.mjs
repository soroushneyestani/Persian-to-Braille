import test from "node:test";
import assert from "node:assert/strict";

import {
  translateMusicXmlTextToBraille,
} from "../dist/musicxml-to-braille.js";

import {
  STATEFUL_GRACE_BRF,
  STATEFUL_SIMPLE_SLUR_BRF,
} from "../dist/music-braille-stateful-encoder.js";

function score(body, attributes = "") {
  return `<?xml version="1.0" encoding="UTF-8"?>
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
        <time><beats>4</beats><beat-type>4</beat-type></time>
        ${attributes}
        <clef number="1"><sign>G</sign><line>2</line></clef>
      </attributes>
      ${body}
    </measure>
  </part>
</score-partwise>`;
}

const appoggiaturaPhrase =
  `<note>
    <grace slash="yes"/>
    <pitch><step>C</step><octave>5</octave></pitch>
    <voice>1</voice><type>eighth</type><staff>1</staff>
    <notations>
      <slur type="start" number="1"/>
    </notations>
  </note>
  <note>
    <grace/>
    <pitch><step>D</step><octave>5</octave></pitch>
    <voice>1</voice><type>eighth</type><staff>1</staff>
  </note>
  <note>
    <pitch><step>E</step><octave>5</octave></pitch>
    <duration>4</duration>
    <voice>1</voice><type>whole</type><staff>1</staff>
    <notations>
      <slur type="stop" number="1"/>
    </notations>
  </note>`;

test("V18I nonfacsimile appoggiatura slur reuses ordinary short-slur semantics", () => {
  const actual =
    translateMusicXmlTextToBraille(
      score(appoggiaturaPhrase),
    );

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

test("V18I appoggiatura slur also survives retained keyboard backup/forward routing", () => {
  const keyboard =
    score(
      appoggiaturaPhrase
      + `<backup><duration>4</duration></backup>
      <note>
        <rest measure="yes"/>
        <duration>4</duration>
        <voice>5</voice><staff>2</staff>
      </note>`,
      `<staves>2</staves>
       <clef number="2"><sign>F</sign><line>4</line></clef>`,
    );

  const actual =
    translateMusicXmlTextToBraille(
      keyboard,
    );

  assert.equal(
    actual.ok,
    true,
    actual.ok
      ? undefined
      : `${actual.stage}:${actual.code}:${actual.message}`,
  );

  if (!actual.ok) return;

  assert.equal(
    actual.parts[0].brf.includes(
      STATEFUL_GRACE_BRF.short,
    ),
    true,
  );

  assert.equal(
    actual.parts[0].brf.includes(
      STATEFUL_SIMPLE_SLUR_BRF,
    ),
    true,
  );
});

test("V18I grace plus articulation remains fail-closed", () => {
  const xml =
    score(
      `<note>
        <grace slash="yes"/>
        <pitch><step>C</step><octave>5</octave></pitch>
        <voice>1</voice><type>eighth</type><staff>1</staff>
        <notations>
          <articulations><staccato/></articulations>
        </notations>
      </note>
      <note>
        <pitch><step>D</step><octave>5</octave></pitch>
        <duration>4</duration>
        <voice>1</voice><type>whole</type><staff>1</staff>
      </note>`,
    );

  const actual =
    translateMusicXmlTextToBraille(xml);

  assert.equal(actual.ok, false);

  if (!actual.ok) {
    assert.equal(
      actual.code,
      "UNSUPPORTED_GRACE",
    );
  }
});

test("V18I grace plus tie remains fail-closed", () => {
  const xml =
    score(
      `<note>
        <grace slash="yes"/>
        <pitch><step>C</step><octave>5</octave></pitch>
        <voice>1</voice><type>eighth</type><staff>1</staff>
        <tie type="start"/>
      </note>
      <note>
        <pitch><step>D</step><octave>5</octave></pitch>
        <duration>4</duration>
        <voice>1</voice><type>whole</type><staff>1</staff>
      </note>`,
    );

  const actual =
    translateMusicXmlTextToBraille(xml);

  assert.equal(actual.ok, false);

  if (!actual.ok) {
    assert.equal(
      actual.code,
      "UNSUPPORTED_GRACE",
    );
  }
});
