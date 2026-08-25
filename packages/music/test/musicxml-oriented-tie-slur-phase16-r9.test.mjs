import test from "node:test";
import assert from "node:assert/strict";

import {
  translateMusicXmlTextToBraille,
} from "../dist/musicxml-to-braille.js";

const moonlightShape = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list>
    <score-part id="P1"><part-name>Piano</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <time><beats>2</beats><beat-type>4</beat-type></time>
      </attributes>
      <note>
        <pitch><step>B</step><octave>2</octave></pitch>
        <duration>2</duration><voice>1</voice><type>half</type><staff>1</staff>
        <tie type="start"/>
      </note>
    </measure>
    <measure number="2">
      <note>
        <pitch><step>B</step><octave>2</octave></pitch>
        <duration>1</duration><voice>1</voice><type>quarter</type><staff>1</staff>
        <tie type="stop"/>
        <notations><slur type="start" number="1"/></notations>
      </note>
      <note>
        <pitch><step>E</step><octave>3</octave></pitch>
        <duration>1</duration><voice>1</voice><type>quarter</type><staff>1</staff>
        <notations><slur type="stop" number="1"/></notations>
      </note>
    </measure>
  </part>
</score-partwise>`;

test("V18O incoming tie-stop plus outgoing slur-start is not BANA same-link redundancy", () => {
  const actual =
    translateMusicXmlTextToBraille(
      moonlightShape,
    );

  assert.equal(
    actual.ok,
    true,
    actual.ok
      ? undefined
      : `${actual.stage}:${actual.code}:${actual.message}`,
  );
});

test("V18O same-direction tie-start plus slur-start remains fail-closed", () => {
  const xml =
    moonlightShape
      .replace(
        '<tie type="stop"/>',
        '<tie type="start"/>',
      );

  const actual =
    translateMusicXmlTextToBraille(xml);

  assert.equal(actual.ok, false);

  if (!actual.ok) {
    assert.equal(
      actual.code,
      "UNSUPPORTED_SLUR",
    );
  }
});
