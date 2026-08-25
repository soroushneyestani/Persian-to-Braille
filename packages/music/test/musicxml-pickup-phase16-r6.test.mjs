import test from "node:test";
import assert from "node:assert/strict";

import {
  parseMusicXmlText,
} from "../dist/musicxml-parser.js";
import {
  adaptMusicXmlScore,
} from "../dist/musicxml-adapter.js";
import {
  translateMusicXmlTextToBraille,
} from "../dist/musicxml-to-braille.js";

const genericPickup = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list>
    <score-part id="P1"><part-name>Generic pickup</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="0" implicit="yes">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>3</beats><beat-type>8</beat-type></time>
        <clef number="1"><sign>G</sign><line>2</line></clef>
      </attributes>
      <note>
        <pitch><step>C</step><octave>5</octave></pitch>
        <duration>2</duration>
        <voice>1</voice>
        <type>eighth</type>
        <staff>1</staff>
      </note>
      <backup><duration>2</duration></backup>
      <note>
        <pitch><step>E</step><octave>4</octave></pitch>
        <duration>2</duration>
        <voice>2</voice>
        <type>eighth</type>
        <staff>1</staff>
      </note>
    </measure>
    <measure number="1">
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>2</duration><voice>1</voice><type>eighth</type><staff>1</staff></note>
      <note><pitch><step>D</step><octave>5</octave></pitch><duration>2</duration><voice>1</voice><type>eighth</type><staff>1</staff></note>
      <note><pitch><step>E</step><octave>5</octave></pitch><duration>2</duration><voice>1</voice><type>eighth</type><staff>1</staff></note>
    </measure>
  </part>
</score-partwise>`;

const keyboardPickup = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list>
    <score-part id="P1"><part-name>Keyboard pickup</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="0" implicit="yes">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>3</beats><beat-type>8</beat-type></time>
        <staves>2</staves>
        <clef number="1"><sign>G</sign><line>2</line></clef>
        <clef number="2"><sign>F</sign><line>4</line></clef>
      </attributes>
      <note><pitch><step>E</step><octave>5</octave></pitch><duration>1</duration><voice>1</voice><type>16th</type><staff>1</staff></note>
      <note><pitch><step>D</step><octave>5</octave></pitch><duration>1</duration><voice>1</voice><type>16th</type><staff>1</staff></note>
      <backup><duration>2</duration></backup>
      <note><rest/><duration>2</duration><voice>2</voice><type>eighth</type><staff>2</staff></note>
    </measure>
    <measure number="1">
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>2</duration><voice>1</voice><type>eighth</type><staff>1</staff></note>
      <note><pitch><step>D</step><octave>5</octave></pitch><duration>2</duration><voice>1</voice><type>eighth</type><staff>1</staff></note>
      <note><pitch><step>E</step><octave>5</octave></pitch><duration>2</duration><voice>1</voice><type>eighth</type><staff>1</staff></note>
      <backup><duration>6</duration></backup>
      <note><pitch><step>C</step><octave>3</octave></pitch><duration>2</duration><voice>2</voice><type>eighth</type><staff>2</staff></note>
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>2</duration><voice>2</voice><type>eighth</type><staff>2</staff></note>
      <note><pitch><step>E</step><octave>3</octave></pitch><duration>2</duration><voice>2</voice><type>eighth</type><staff>2</staff></note>
    </measure>
  </part>
</score-partwise>`;

const middleImplicit = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list>
    <score-part id="P1"><part-name>Middle implicit</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <time><beats>3</beats><beat-type>8</beat-type></time>
        <clef number="1"><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>2</duration><voice>1</voice><type>eighth</type><staff>1</staff></note>
      <note><pitch><step>D</step><octave>5</octave></pitch><duration>2</duration><voice>1</voice><type>eighth</type><staff>1</staff></note>
      <note><pitch><step>E</step><octave>5</octave></pitch><duration>2</duration><voice>1</voice><type>eighth</type><staff>1</staff></note>
    </measure>
    <measure number="1A" implicit="yes">
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>2</duration><voice>1</voice><type>eighth</type><staff>1</staff></note>
      <backup><duration>2</duration></backup>
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>2</duration><voice>2</voice><type>eighth</type><staff>1</staff></note>
    </measure>
    <measure number="2">
      <note><pitch><step>F</step><octave>5</octave></pitch><duration>2</duration><voice>1</voice><type>eighth</type><staff>1</staff></note>
      <note><pitch><step>G</step><octave>5</octave></pitch><duration>2</duration><voice>1</voice><type>eighth</type><staff>1</staff></note>
      <note><pitch><step>A</step><octave>5</octave></pitch><duration>2</duration><voice>1</voice><type>eighth</type><staff>1</staff></note>
    </measure>
  </part>
</score-partwise>`;

test("V18D1 parser-to-adapter preserves initial implicit measure semantics", () => {
  const parsed = parseMusicXmlText(genericPickup);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;

  assert.equal(parsed.source.parts[0].measures[0].implicit, true);

  const adapted = adaptMusicXmlScore(parsed.source);
  assert.equal(adapted.parts[0].measures[0].implicit, true);
  assert.equal(adapted.parts[0].measures[1].implicit, false);
});

test("V18D1 generic nonterminal initial pickup uses source-derived part-measure in-accord extent", () => {
  const actual = translateMusicXmlTextToBraille(genericPickup);

  assert.equal(actual.ok, true);
  if (!actual.ok) return;

  assert.equal(
    actual.diagnostics.some(
      (diagnostic) =>
        diagnostic.code === "PART_MEASURE_IN_ACCORD_DERIVED"
        && diagnostic.measureIndex === 0,
    ),
    true,
  );
});

test("V18D1 keyboard pickup does not synthesize the nominal meter tail as an implied rest gap", () => {
  const actual = translateMusicXmlTextToBraille(keyboardPickup);

  assert.equal(actual.ok, true);
  if (!actual.ok) return;

  assert.equal(actual.parts.length, 1);
  assert.equal(actual.parts[0].brf.length > 0, true);
});

test("V18D1 does not generalize non-initial implicit incomplete measures into pickup semantics", () => {
  const actual = translateMusicXmlTextToBraille(middleImplicit);

  assert.equal(actual.ok, false);
  if (actual.ok) return;

  assert.equal(
    actual.code,
    "UNSUPPORTED_NONTERMINAL_PART_MEASURE",
  );
});