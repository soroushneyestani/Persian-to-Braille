/* PHASE16_5_UNIFIED_REPEAT_ENDING */
import test from "node:test";
import assert from "node:assert/strict";

import { translateMusicXmlTextToBraille } from "../dist/index.js";
import {
  encodeStatefulScore,
  STATEFUL_INITIAL_REPEAT_BRF,
  STATEFUL_TERMINAL_REPEAT_BRF,
  STATEFUL_VOLTA_BRF,
} from "../dist/music-braille-stateful-encoder.js";

function score(prefix, suffix = "") {
  return `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <part-list><score-part id="P1"><part-name>Repeat</part-name></score-part></part-list>
  <part id="P1"><measure number="1">
    <attributes>
      <divisions>1</divisions>
      <key><fifths>0</fifths></key>
      <time><beats>4</beats><beat-type>4</beat-type></time>
      <clef number="1"><sign>G</sign><line>2</line></clef>
    </attributes>
    ${prefix}
    <note>
      <pitch><step>C</step><octave>4</octave></pitch>
      <duration>4</duration><voice>1</voice><type>whole</type><staff>1</staff>
    </note>
    ${suffix}
  </measure></part>
</score-partwise>`;
}

test("MusicXML forward print repeat maps to exact BANA initial-repeat sign <7", () => {
  const actual = translateMusicXmlTextToBraille(
    score(`<barline location="left"><repeat direction="forward"/></barline>`),
  );
  assert.equal(actual.ok, true);
  if (!actual.ok) return;

  const expected = encodeStatefulScore({
    keySharpsFlats: 0,
    meter: { numerator: 4, denominator: 4 },
    measures: [{
      initialRepeat: true,
      events: [{
        kind: "note",
        midiPitch: 60,
        writtenPitch: { step: "C", accidental: 0, scientificOctave: 4 },
        value: "whole",
      }],
    }],
  });

  assert.equal(actual.parts[0].brf, expected.brf);
  assert.equal(STATEFUL_INITIAL_REPEAT_BRF, "<7");
});

test("MusicXML backward print repeat maps to exact BANA terminal-repeat sign <2", () => {
  const actual = translateMusicXmlTextToBraille(
    score("", `<barline location="right"><repeat direction="backward"/></barline>`),
  );
  assert.equal(actual.ok, true);
  if (!actual.ok) return;

  assert.equal(actual.parts[0].brf.endsWith(STATEFUL_TERMINAL_REPEAT_BRF), true);
  assert.equal(STATEFUL_TERMINAL_REPEAT_BRF, "<2");
});

for (const number of [1, 2]) {
  test(`MusicXML volta ${number} maps to BANA numeric ending sign`, () => {
    const actual = translateMusicXmlTextToBraille(
      score(`<barline location="left"><ending number="${number}" type="start"/></barline>`),
    );
    assert.equal(actual.ok, true);
    if (!actual.ok) return;

    assert.equal(
      actual.parts[0].brf.includes(STATEFUL_VOLTA_BRF[number]),
      true,
    );
  });
}

test("ending stop/discontinue carries no invented bracket emission", () => {
  const actual = translateMusicXmlTextToBraille(score(
    `<barline location="left"><ending number="1" type="start"/></barline>`,
    `<barline location="right"><ending number="1" type="stop"/></barline>`,
  ));
  assert.equal(actual.ok, true);
  if (!actual.ok) return;

  assert.equal(
    actual.diagnostics.some(
      (diagnostic) => diagnostic.code === "ENDING_TERMINATION_PRESERVED_NOT_EMITTED",
    ),
    true,
  );
});

test("third ending remains explicit fail-closed", () => {
  const actual = translateMusicXmlTextToBraille(
    score(`<barline location="left"><ending number="3" type="start"/></barline>`),
  );
  assert.equal(actual.ok, false);
  if (!actual.ok) assert.equal(actual.code, "UNSUPPORTED_ENDING");
});

test("nonstandard repeat count remains explicit fail-closed", () => {
  const actual = translateMusicXmlTextToBraille(
    score("", `<barline location="right"><repeat direction="backward" times="3"/></barline>`),
  );
  assert.equal(actual.ok, false);
  if (!actual.ok) assert.equal(actual.code, "UNSUPPORTED_REPEAT");
});
