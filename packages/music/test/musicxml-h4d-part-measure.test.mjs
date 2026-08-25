/* PHASE16_5B_MUSICXML_H4D */
import test from "node:test";
import assert from "node:assert/strict";

import {
  translateMusicXmlTextToBraille,
} from "../dist/index.js";
import {
  measureDivisionBrf,
  partMeasureInAccordBrf,
} from "../dist/music-braille-atomic-encoder.js";
import {
  encodeStatefulScore,
} from "../dist/music-braille-stateful-encoder.js";

function singleMeasureScore(body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <part-list>
    <score-part id="P1"><part-name>H4D</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef number="1"><sign>G</sign><line>2</line></clef>
      </attributes>
      ${body}
    </measure>
  </part>
</score-partwise>`;
}

test("terminal incomplete MusicXML polyphony reuses frozen single-section H4D", () => {
  const actual = translateMusicXmlTextToBraille(singleMeasureScore(`
    <note>
      <pitch><step>C</step><octave>5</octave></pitch>
      <duration>3</duration><voice>1</voice><type>half</type><dot/><staff>1</staff>
    </note>
    <backup><duration>2</duration></backup>
    <note>
      <pitch><step>E</step><octave>4</octave></pitch>
      <duration>1</duration><voice>2</voice><type>quarter</type><staff>1</staff>
    </note>
  `));

  assert.equal(actual.ok, true);
  if (!actual.ok) return;

  const expected = encodeStatefulScore({
    keySharpsFlats: 0,
    meter: { numerator: 4, denominator: 4 },
    measures: [{
      events: [{
        kind: "part-measure-in-accord",
        actions: [
          {
            events: [{
              kind: "note",
              midiPitch: 72,
              writtenPitch: {
                step: "C",
                accidental: 0,
                scientificOctave: 5,
              },
              value: "half",
              augmentationDots: 1,
            }],
          },
          {
            events: [
              {
                kind: "rest",
                value: "quarter",
                transcriberAdded: true,
              },
              {
                kind: "note",
                midiPitch: 64,
                writtenPitch: {
                  step: "E",
                  accidental: 0,
                  scientificOctave: 4,
                },
                value: "quarter",
              },
              {
                kind: "rest",
                value: "quarter",
                transcriberAdded: true,
              },
            ],
          },
        ],
      }],
    }],
  });

  assert.equal(actual.parts[0].brf, expected.brf);
  assert.equal(actual.parts[0].unicodeBraille, expected.unicode);
  assert.equal(actual.parts[0].trace[0].kind, "part-measure-in-accord");
  assert.equal(actual.parts[0].brf.includes(partMeasureInAccordBrf()), true);
  assert.equal(actual.parts[0].brf.includes(measureDivisionBrf()), false);
  assert.equal(
    actual.diagnostics.some(
      (diagnostic) =>
        diagnostic.code === "PART_MEASURE_IN_ACCORD_DERIVED",
    ),
    true,
  );
});

test("complete terminal polyphonic measure continues to use H4C, not H4D", () => {
  const actual = translateMusicXmlTextToBraille(singleMeasureScore(`
    <note>
      <pitch><step>C</step><octave>5</octave></pitch>
      <duration>4</duration><voice>1</voice><type>whole</type><staff>1</staff>
    </note>
    <backup><duration>4</duration></backup>
    <note>
      <pitch><step>C</step><octave>4</octave></pitch>
      <duration>4</duration><voice>2</voice><type>whole</type><staff>1</staff>
    </note>
  `));

  assert.equal(actual.ok, true);
  if (!actual.ok) return;

  assert.equal(actual.parts[0].trace[0].kind, "full-measure-in-accord");
  assert.equal(
    actual.diagnostics.some(
      (diagnostic) =>
        diagnostic.code === "PART_MEASURE_IN_ACCORD_DERIVED",
    ),
    false,
  );
});

test("incomplete nonterminal polyphonic measure remains fail-closed", () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <part-list>
    <score-part id="P1"><part-name>H4D Nonterminal</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef number="1"><sign>G</sign><line>2</line></clef>
      </attributes>
      <note>
        <pitch><step>C</step><octave>5</octave></pitch>
        <duration>3</duration><voice>1</voice><type>half</type><dot/><staff>1</staff>
      </note>
      <backup><duration>2</duration></backup>
      <note>
        <pitch><step>E</step><octave>4</octave></pitch>
        <duration>1</duration><voice>2</voice><type>quarter</type><staff>1</staff>
      </note>
    </measure>
    <measure number="2">
      <note>
        <pitch><step>C</step><octave>5</octave></pitch>
        <duration>4</duration><voice>1</voice><type>whole</type><staff>1</staff>
      </note>
    </measure>
  </part>
</score-partwise>`;

  const actual = translateMusicXmlTextToBraille(xml);
  assert.equal(actual.ok, false);
  if (!actual.ok) {
    assert.equal(actual.code, "UNSUPPORTED_NONTERMINAL_PART_MEASURE");
    assert.equal(actual.stage, "bridge");
    assert.equal(actual.measureIndex, 0);
  }
});

test("H4D single-section transport never invents a measure-division sign", () => {
  const actual = translateMusicXmlTextToBraille(singleMeasureScore(`
    <note>
      <pitch><step>G</step><octave>5</octave></pitch>
      <duration>2</duration><voice>1</voice><type>half</type><staff>1</staff>
    </note>
    <backup><duration>1</duration></backup>
    <note>
      <pitch><step>C</step><octave>4</octave></pitch>
      <duration>1</duration><voice>2</voice><type>quarter</type><staff>1</staff>
    </note>
  `));

  assert.equal(actual.ok, true);
  if (!actual.ok) return;

  assert.equal(actual.parts[0].trace[0].kind, "part-measure-in-accord");
  assert.equal(actual.parts[0].brf.includes(partMeasureInAccordBrf()), true);
  assert.equal(actual.parts[0].brf.includes(measureDivisionBrf()), false);
});
