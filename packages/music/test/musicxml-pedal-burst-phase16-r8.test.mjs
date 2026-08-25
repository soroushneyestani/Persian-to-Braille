import test from "node:test";
import assert from "node:assert/strict";

import {
  translateMusicXmlTextToBraille,
} from "../dist/musicxml-to-braille.js";

import {
  STATEFUL_PEDAL_DOWN_BRF,
  STATEFUL_PEDAL_UP_BRF,
} from "../dist/music-braille-stateful-encoder.js";

function note(step) {
  return `<note>
    <pitch><step>${step}</step><octave>3</octave></pitch>
    <duration>1</duration><voice>1</voice><type>quarter</type><staff>2</staff>
  </note>`;
}

const burst = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list>
    <score-part id="P1"><part-name>Piano</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <staves>2</staves>
      </attributes>
      <direction><direction-type><pedal type="start" line="yes"/></direction-type><staff>2</staff></direction>
      ${note("C")}
      <direction><direction-type><pedal type="start" line="yes"/></direction-type><staff>2</staff></direction>
      ${note("D")}
      <direction><direction-type><pedal type="start" line="yes"/></direction-type><staff>2</staff></direction>
      ${note("E")}
      ${note("F")}
      <direction><direction-type><pedal type="stop" line="yes"/></direction-type><staff>2</staff></direction>
      <direction><direction-type><pedal type="stop" line="yes"/></direction-type><staff>2</staff></direction>
    </measure>
  </part>
</score-partwise>`;

test("V18M redundant line=yes starts plus terminal co-located stops normalize to one pedal span", () => {
  const actual =
    translateMusicXmlTextToBraille(
      burst,
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
    actual.parts[0].brf.split(
      STATEFUL_PEDAL_DOWN_BRF,
    ).length - 1,
    1,
  );

  assert.equal(
    actual.parts[0].brf.split(
      STATEFUL_PEDAL_UP_BRF,
    ).length - 1,
    1,
  );
});

test("V18M does not normalize a nonterminal nested pedal shape", () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list><score-part id="P1"><part-name>Piano</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes><divisions>1</divisions><time><beats>4</beats><beat-type>4</beat-type></time></attributes>
      <direction><direction-type><pedal type="start" line="yes"/></direction-type><staff>1</staff></direction>
      ${note("C").replaceAll("<staff>2</staff>", "<staff>1</staff>")}
      <direction><direction-type><pedal type="start" line="yes"/></direction-type><staff>1</staff></direction>
      ${note("D").replaceAll("<staff>2</staff>", "<staff>1</staff>")}
      <direction><direction-type><pedal type="stop" line="yes"/></direction-type><staff>1</staff></direction>
      ${note("E").replaceAll("<staff>2</staff>", "<staff>1</staff>")}
      ${note("F").replaceAll("<staff>2</staff>", "<staff>1</staff>")}
    </measure>
  </part>
</score-partwise>`;

  const actual =
    translateMusicXmlTextToBraille(xml);

  assert.equal(actual.ok, false);

  if (!actual.ok) {
    assert.equal(
      actual.code,
      "UNSUPPORTED_PEDAL",
    );
  }
});
