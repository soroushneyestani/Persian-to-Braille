import test from "node:test";
import assert from "node:assert/strict";

import {
  translateMusicXmlTextToBraille,
} from "../dist/musicxml-to-braille.js";

function score(firstChord, secondChord) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list>
    <score-part id="P1"><part-name>Piano</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>-3</fifths></key>
        <time><beats>2</beats><beat-type>4</beat-type></time>
      </attributes>
      ${firstChord}
    </measure>
    <measure number="2">
      ${secondChord}
    </measure>
  </part>
</score-partwise>`;
}

const first =
  `<note>
    <pitch><step>A</step><alter>-1</alter><octave>4</octave></pitch>
    <duration>2</duration><voice>1</voice><type>half</type>
    <tie type="start"/>
  </note>
  <note>
    <chord/>
    <pitch><step>C</step><octave>5</octave></pitch>
    <duration>2</duration><voice>1</voice><type>half</type>
  </note>`;

const second =
  `<note>
    <pitch><step>A</step><alter>-1</alter><octave>4</octave></pitch>
    <duration>2</duration><voice>1</voice><type>half</type>
    <tie type="stop"/>
  </note>
  <note>
    <chord/>
    <pitch><step>B</step><octave>4</octave></pitch>
    <duration>2</duration><voice>1</voice><type>half</type>
  </note>`;

test("V18L exactly one tied chord member uses a single tie instead of whole-chord rejection", () => {
  const actual =
    translateMusicXmlTextToBraille(
      score(first, second),
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
    actual.parts[0].brf.includes("@c"),
    true,
  );
});

test("V18L multiple-but-not-all tied members remain explicit fail-closed", () => {
  const firstThree =
    `<note>
      <pitch><step>C</step><octave>4</octave></pitch>
      <duration>2</duration><voice>1</voice><type>half</type>
      <tie type="start"/>
    </note>
    <note>
      <chord/><pitch><step>E</step><octave>4</octave></pitch>
      <duration>2</duration><voice>1</voice><type>half</type>
      <tie type="start"/>
    </note>
    <note>
      <chord/><pitch><step>G</step><octave>4</octave></pitch>
      <duration>2</duration><voice>1</voice><type>half</type>
    </note>`;

  const nextThree =
    `<note>
      <pitch><step>C</step><octave>4</octave></pitch>
      <duration>2</duration><voice>1</voice><type>half</type>
      <tie type="stop"/>
    </note>
    <note>
      <chord/><pitch><step>E</step><octave>4</octave></pitch>
      <duration>2</duration><voice>1</voice><type>half</type>
      <tie type="stop"/>
    </note>
    <note>
      <chord/><pitch><step>F</step><octave>4</octave></pitch>
      <duration>2</duration><voice>1</voice><type>half</type>
    </note>`;

  const actual =
    translateMusicXmlTextToBraille(
      score(firstThree, nextThree),
    );

  assert.equal(actual.ok, false);

  if (!actual.ok) {
    assert.equal(
      actual.code,
      "PARTIAL_CHORD_TIE",
    );
  }
});
