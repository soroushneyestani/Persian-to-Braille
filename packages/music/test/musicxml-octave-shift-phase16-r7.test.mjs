import test from "node:test";
import assert from "node:assert/strict";

import {
  translateMusicXmlTextToBraille,
} from "../dist/musicxml-to-braille.js";

import {
  parseMusicXmlText,
} from "../dist/musicxml-parser.js";

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list><score-part id="P1"><part-name>Piano</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>2</beats><beat-type>4</beat-type></time>
        <clef number="1"><sign>G</sign><line>2</line></clef>
      </attributes>
      <direction>
        <direction-type><octave-shift type="down" size="8" number="1"/></direction-type>
        <staff>1</staff>
      </direction>
      <note><pitch><step>C</step><octave>6</octave></pitch><duration>1</duration><voice>1</voice><type>quarter</type><staff>1</staff></note>
      <direction>
        <direction-type><octave-shift type="stop" size="8" number="1"/></direction-type>
        <staff>1</staff>
      </direction>
      <note><pitch><step>D</step><octave>5</octave></pitch><duration>1</duration><voice>1</voice><type>quarter</type><staff>1</staff></note>
    </measure>
  </part>
</score-partwise>`;

test("R7 parser structurally preserves MusicXML octave-shift instead of generic otherTypes", () => {
  const parsed = parseMusicXmlText(xml);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;

  const directions =
    parsed.source.parts[0].measures[0].items.filter(
      (item) => item.kind === "direction",
    );

  assert.equal(directions.length, 2);
  assert.equal(directions[0].otherTypes.length, 0);
  assert.equal(directions[0].octaveShifts[0].type, "down");
  assert.equal(directions[0].octaveShifts[0].size, 8);
});

test("R7 BANA nonfacsimile mode omits octave-shift sign and retains performed pitch data", () => {
  const actual = translateMusicXmlTextToBraille(xml);
  assert.equal(
    actual.ok,
    true,
    actual.ok ? undefined : `${actual.stage}:${actual.code}:${actual.message}`,
  );
  if (!actual.ok) return;

  assert.equal(
    actual.diagnostics.some(
      (d) => d.code === "OCTAVE_SHIFT_NONFACSIMILE_NOT_EMITTED",
    ),
    true,
  );
});
