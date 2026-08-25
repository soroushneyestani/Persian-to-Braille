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
import {
  encodeStatefulScore,
} from "../dist/music-braille-stateful-encoder.js";

const singleMeasureRest = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list>
    <score-part id="P1"><part-name>Measure Rest</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>3</beats><beat-type>8</beat-type></time>
        <clef number="1"><sign>G</sign><line>2</line></clef>
      </attributes>
      <note>
        <rest measure="yes"/>
        <duration>6</duration>
        <voice>1</voice>
        <staff>1</staff>
      </note>
    </measure>
  </part>
</score-partwise>`;

const keyboardMeasureRest = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list>
    <score-part id="P1"><part-name>Keyboard Measure Rest</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>3</beats><beat-type>8</beat-type></time>
        <staves>2</staves>
        <clef number="1"><sign>G</sign><line>2</line></clef>
        <clef number="2"><sign>F</sign><line>4</line></clef>
      </attributes>

      <note>
        <pitch><step>C</step><octave>5</octave></pitch>
        <duration>2</duration><voice>1</voice><type>eighth</type><staff>1</staff>
      </note>
      <note>
        <pitch><step>D</step><octave>5</octave></pitch>
        <duration>2</duration><voice>1</voice><type>eighth</type><staff>1</staff>
      </note>
      <note>
        <pitch><step>E</step><octave>5</octave></pitch>
        <duration>2</duration><voice>1</voice><type>eighth</type><staff>1</staff>
      </note>

      <backup><duration>6</duration></backup>

      <note>
        <rest measure="yes"/>
        <duration>6</duration>
        <voice>5</voice>
        <staff>2</staff>
      </note>
    </measure>
  </part>
</score-partwise>`;

const ordinaryUndottedThreeOverTwoRest = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list>
    <score-part id="P1"><part-name>Ordinary Rest</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>3</beats><beat-type>8</beat-type></time>
        <clef number="1"><sign>G</sign><line>2</line></clef>
      </attributes>
      <note>
        <rest/>
        <duration>6</duration>
        <voice>1</voice>
        <staff>1</staff>
      </note>
    </measure>
  </part>
</score-partwise>`;

const conflictingMeasureRest = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list>
    <score-part id="P1"><part-name>Conflicting Measure Rest</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>3</beats><beat-type>8</beat-type></time>
        <clef number="1"><sign>G</sign><line>2</line></clef>
      </attributes>
      <note>
        <rest measure="yes"/>
        <duration>6</duration>
        <voice>1</voice>
        <type>quarter</type>
        <staff>1</staff>
      </note>
    </measure>
  </part>
</score-partwise>`;

test("V18D2 parser and adapter preserve MusicXML rest@measure=yes", () => {
  const parsed = parseMusicXmlText(singleMeasureRest);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;

  const sourceRest =
    parsed.source.parts[0].measures[0].items.find(
      (item) => item.kind === "note",
    );

  assert.equal(sourceRest?.kind, "note");
  if (sourceRest?.kind !== "note") return;

  assert.equal(sourceRest.rest, true);
  assert.equal(sourceRest.measureRest, true);
  assert.deepEqual(
    sourceRest.durationQuarter,
    {numerator: 3, denominator: 2},
  );
  assert.equal(sourceRest.dots, 0);
  assert.equal(sourceRest.type, undefined);

  const adapted = adaptMusicXmlScore(parsed.source);
  const adaptedRest = adapted.parts[0].measures[0].notes[0];

  assert.equal(adaptedRest.kind, "rest");
  assert.equal(adaptedRest.measureRest, true);
  assert.deepEqual(
    adaptedRest.durationQuarter,
    {numerator: 3, denominator: 2},
  );
});

test("V18D2 complete 3/8 MusicXML measure rest emits existing BANA whole-rest semantics while keeping 3/2 source timing", () => {
  const actual =
    translateMusicXmlTextToBraille(singleMeasureRest);

  assert.equal(
    actual.ok,
    true,
    actual.ok
      ? undefined
      : `${actual.stage}:${actual.code}:${actual.message}`,
  );
  if (!actual.ok) return;

  const expected = encodeStatefulScore({
    keySharpsFlats: 0,
    meter: {numerator: 3, denominator: 8},
    measures: [{
      events: [{
        kind: "rest",
        value: "whole",
      }],
    }],
  });

  assert.equal(actual.parts[0].brf, expected.brf);
});

test("V18D2 full-measure rest works in the audited two-staff keyboard rest-only lane", () => {
  const actual =
    translateMusicXmlTextToBraille(keyboardMeasureRest);

  assert.equal(
    actual.ok,
    true,
    actual.ok
      ? undefined
      : `${actual.stage}:${actual.code}:${actual.message}`,
  );
  if (!actual.ok) return;

  assert.equal(actual.parts.length, 1);
  assert.equal(actual.parts[0].brf.length > 0, true);
});

test("V18D2 does not reinterpret an ordinary undotted 3/2 rest as a dotted quarter", () => {
  const actual =
    translateMusicXmlTextToBraille(
      ordinaryUndottedThreeOverTwoRest,
    );

  assert.equal(actual.ok, false);
  if (actual.ok) return;

  assert.equal(actual.code, "UNSUPPORTED_DURATION");
});

test("V18D2 keeps conflicting printed type on measure-rest explicit fail-closed", () => {
  const actual =
    translateMusicXmlTextToBraille(conflictingMeasureRest);

  assert.equal(actual.ok, false);
  if (actual.ok) return;

  assert.equal(actual.code, "UNSUPPORTED_DURATION");
});