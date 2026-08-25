/* PHASE16_5_UNIFIED_SHORT_SLUR */
import test from "node:test";
import assert from "node:assert/strict";

import { translateMusicXmlTextToBraille } from "../dist/index.js";
import {
  encodeStatefulScore,
  STATEFUL_SIMPLE_SLUR_BRF,
} from "../dist/music-braille-stateful-encoder.js";

function score(body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <part-list><score-part id="P1"><part-name>Slur</part-name></score-part></part-list>
  <part id="P1"><measure number="1">
    <attributes>
      <divisions>1</divisions>
      <key><fifths>0</fifths></key>
      <time><beats>4</beats><beat-type>4</beat-type></time>
      <clef number="1"><sign>G</sign><line>2</line></clef>
    </attributes>
    ${body}
  </measure></part>
</score-partwise>`;
}

function pitched(step, midiOctave, marker = "") {
  return `<note>
    <pitch><step>${step}</step><octave>${midiOctave}</octave></pitch>
    <duration>1</duration><voice>1</voice><type>quarter</type><staff>1</staff>
    ${marker}
  </note>`;
}

function slur(type, number = 1) {
  return `<notations><slur type="${type}" number="${number}"/></notations>`;
}

test("two-note MusicXML slur uses BANA simple short slur after the first note only", () => {
  const actual = translateMusicXmlTextToBraille(score(
    pitched("C", 4, slur("start"))
    + pitched("D", 4, slur("stop")),
  ));
  assert.equal(actual.ok, true);
  if (!actual.ok) return;

  const expected = encodeStatefulScore({
    keySharpsFlats: 0,
    meter: { numerator: 4, denominator: 4 },
    measures: [{
      events: [
        {
          kind: "note",
          midiPitch: 60,
          writtenPitch: { step: "C", accidental: 0, scientificOctave: 4 },
          value: "quarter",
          slurAfter: true,
        },
        {
          kind: "note",
          midiPitch: 62,
          writtenPitch: { step: "D", accidental: 0, scientificOctave: 4 },
          value: "quarter",
        },
      ],
    }],
  });

  assert.equal(actual.parts[0].brf, expected.brf);
  assert.equal(STATEFUL_SIMPLE_SLUR_BRF, "c");
});

test("simple short slur follows the final interval of a chord by suffixing the complete chord emission", () => {
  const actual = translateMusicXmlTextToBraille(score(`
    <note>
      <pitch><step>G</step><octave>4</octave></pitch>
      <duration>1</duration><voice>1</voice><type>quarter</type><staff>1</staff>
      ${slur("start")}
    </note>
    <note>
      <chord/>
      <pitch><step>E</step><octave>4</octave></pitch>
      <duration>1</duration><voice>1</voice><type>quarter</type><staff>1</staff>
    </note>
    ${pitched("A", 4, slur("stop"))}
  `));
  assert.equal(actual.ok, true);
  if (!actual.ok) return;

  assert.equal(actual.parts[0].trace[0].kind, "chord");
  assert.equal(actual.parts[0].trace[0].emittedBrf.endsWith("c"), true);
});

test("four-note contained phrase uses three simple short slur cells", () => {
  const actual = translateMusicXmlTextToBraille(score(
    pitched("C", 4, slur("start"))
    + pitched("D", 4)
    + pitched("E", 4)
    + pitched("F", 4, slur("stop")),
  ));
  assert.equal(actual.ok, true);
  if (!actual.ok) return;

  const trace = actual.parts[0].trace;
  assert.equal(trace.length, 4);
  assert.equal(trace.slice(0, 3).every((entry) => entry.emittedBrf.endsWith("c")), true);
  assert.equal(trace[3].emittedBrf.endsWith("c"), false);
});

test("rest inside a short slurred phrase is treated as a phrase member", () => {
  const actual = translateMusicXmlTextToBraille(score(`
    ${pitched("C", 4, slur("start"))}
    <note>
      <rest/><duration>1</duration><voice>1</voice><type>quarter</type><staff>1</staff>
    </note>
    ${pitched("D", 4, slur("stop"))}
  `));
  assert.equal(actual.ok, true);
  if (!actual.ok) return;

  assert.equal(actual.parts[0].trace[0].emittedBrf.endsWith("c"), true);
  assert.equal(actual.parts[0].trace[1].emittedBrf.endsWith("c"), true);
  assert.equal(actual.parts[0].trace[2].emittedBrf.endsWith("c"), false);
});

// PHASE16_R5_BANA_LONGER_SLUR
test("five-note contained phrase uses BANA 13.3 doubled-single-slur device", () => {
  const actual = translateMusicXmlTextToBraille(score(
    pitched("C", 4, slur("start"))
    + pitched("D", 4)
    + pitched("E", 4)
    + pitched("F", 4)
    + pitched("G", 4, slur("stop")),
  ));

  assert.equal(actual.ok, true);
  if (!actual.ok) return;

  const trace = actual.parts[0].trace;
  assert.equal(trace.length, 5);
  assert.equal(trace[0].emittedBrf.endsWith("cc"), true);
  assert.equal(trace[1].emittedBrf.endsWith("c"), false);
  assert.equal(trace[2].emittedBrf.endsWith("c"), false);
  assert.equal(trace[3].emittedBrf.endsWith("c"), true);
  assert.equal(trace[4].emittedBrf.endsWith("c"), false);
});

test("six-note contained phrase matches the first Moonlight longer-slur blocker shape", () => {
  const actual = translateMusicXmlTextToBraille(score(
    pitched("C", 4, slur("start"))
    + pitched("D", 4)
    + pitched("E", 4)
    + pitched("F", 4)
    + pitched("G", 4)
    + pitched("A", 4, slur("stop")),
  ));

  assert.equal(actual.ok, true);
  if (!actual.ok) return;

  const trace = actual.parts[0].trace;
  assert.equal(trace.length, 6);
  assert.equal(trace[0].emittedBrf.endsWith("cc"), true);
  assert.equal(trace[1].emittedBrf.endsWith("c"), false);
  assert.equal(trace[2].emittedBrf.endsWith("c"), false);
  assert.equal(trace[3].emittedBrf.endsWith("c"), false);
  assert.equal(trace[4].emittedBrf.endsWith("c"), true);
  assert.equal(trace[5].emittedBrf.endsWith("c"), false);
});

test("twelve-note contained phrase uses the same bounded BANA 13.3 device", () => {
  const steps = ["C", "D", "E", "F"];
  const body =
    Array.from({ length: 12 }, (_, index) =>
      pitched(
        steps[index % steps.length],
        4,
        index === 0
          ? slur("start")
          : index === 11
            ? slur("stop")
            : "",
      )
    ).join("");

  const actual =
    translateMusicXmlTextToBraille(
      score(body),
    );

  assert.equal(actual.ok, true);
  if (!actual.ok) return;

  const trace = actual.parts[0].trace;
  assert.equal(trace.length, 12);
  assert.equal(trace[0].emittedBrf.endsWith("cc"), true);

  for (let index = 1; index < 10; index += 1) {
    assert.equal(
      trace[index].emittedBrf.endsWith("c"),
      false,
    );
  }

  assert.equal(trace[10].emittedBrf.endsWith("c"), true);
  assert.equal(trace[11].emittedBrf.endsWith("c"), false);
});
test("slur plus tie remains fail-closed because BANA tie/slur redundancy requires dedicated policy", () => {
  const actual = translateMusicXmlTextToBraille(score(`
    <note>
      <pitch><step>C</step><octave>4</octave></pitch>
      <duration>1</duration><voice>1</voice><type>quarter</type><staff>1</staff>
      <tie type="start"/>
      <notations><tied type="start"/><slur type="start" number="1"/></notations>
    </note>
    <note>
      <pitch><step>C</step><octave>4</octave></pitch>
      <duration>1</duration><voice>1</voice><type>quarter</type><staff>1</staff>
      <tie type="stop"/>
      <notations><tied type="stop"/><slur type="stop" number="1"/></notations>
    </note>
  `));
  assert.equal(actual.ok, false);
  if (!actual.ok) assert.equal(actual.code, "UNSUPPORTED_SLUR");
});

// PHASE16_R5A_CROSS_MEASURE_SLUR
test("same-voice same-staff two-note cross-measure slur uses the existing BANA single-slur contract", () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <part-list><score-part id="P1"><part-name>Cross measure</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes><divisions>1</divisions><key><fifths>0</fifths></key><time><beats>4</beats><beat-type>4</beat-type></time></attributes>
      ${pitched("C", 4, slur("start"))}
    </measure>
    <measure number="2">
      ${pitched("D", 4, slur("stop"))}
    </measure>
  </part>
</score-partwise>`;

  const actual = translateMusicXmlTextToBraille(xml);
  assert.equal(actual.ok, true);
  if (!actual.ok) return;

  assert.equal(actual.parts[0].trace.length, 2);
  assert.equal(actual.parts[0].trace[0].emittedBrf.endsWith("c"), true);
  assert.equal(actual.parts[0].trace[1].emittedBrf.endsWith("c"), false);
});

test("five-event same-lane cross-measure phrase reuses V18C1 BANA 13.3 doubled-single-slur emission", () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list><score-part id="P1"><part-name>Long cross measure</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes><divisions>1</divisions><key><fifths>0</fifths></key><time><beats>4</beats><beat-type>4</beat-type></time></attributes>
      ${pitched("C", 4, slur("start"))}
      ${pitched("D", 4)}
      ${pitched("E", 4)}
      ${pitched("F", 4)}
    </measure>
    <measure number="2">
      ${pitched("G", 4, slur("stop"))}
    </measure>
  </part>
</score-partwise>`;

  const actual = translateMusicXmlTextToBraille(xml);
  assert.equal(actual.ok, true);
  if (!actual.ok) return;

  const trace = actual.parts[0].trace;
  assert.equal(trace.length, 5);
  assert.equal(trace[0].emittedBrf.endsWith("cc"), true);
  assert.equal(trace[1].emittedBrf.endsWith("c"), false);
  assert.equal(trace[2].emittedBrf.endsWith("c"), false);
  assert.equal(trace[3].emittedBrf.endsWith("c"), true);
  assert.equal(trace[4].emittedBrf.endsWith("c"), false);
});

test("cross-measure slur with different staff endpoints remains fail-closed", () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list><score-part id="P1"><part-name>Cross staff</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <staves>2</staves>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef number="1"><sign>G</sign><line>2</line></clef>
        <clef number="2"><sign>F</sign><line>4</line></clef>
      </attributes>
      <note>
        <pitch><step>C</step><octave>4</octave></pitch>
        <duration>1</duration><voice>1</voice><type>quarter</type><staff>1</staff>
        ${slur("start")}
      </note>
    </measure>
    <measure number="2">
      <note>
        <pitch><step>D</step><octave>3</octave></pitch>
        <duration>1</duration><voice>1</voice><type>quarter</type><staff>2</staff>
        ${slur("stop")}
      </note>
    </measure>
  </part>
</score-partwise>`;

  const actual = translateMusicXmlTextToBraille(xml);
  assert.equal(actual.ok, false);
  if (!actual.ok) assert.equal(actual.code, "UNSUPPORTED_SLUR");
});

test("cross-measure slur with different voice endpoints remains fail-closed", () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list><score-part id="P1"><part-name>Cross voice</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes><divisions>1</divisions><time><beats>4</beats><beat-type>4</beat-type></time></attributes>
      <note>
        <pitch><step>C</step><octave>4</octave></pitch>
        <duration>1</duration><voice>1</voice><type>quarter</type><staff>1</staff>
        ${slur("start")}
      </note>
    </measure>
    <measure number="2">
      <note>
        <pitch><step>D</step><octave>4</octave></pitch>
        <duration>1</duration><voice>2</voice><type>quarter</type><staff>1</staff>
        ${slur("stop")}
      </note>
    </measure>
  </part>
</score-partwise>`;

  const actual = translateMusicXmlTextToBraille(xml);
  assert.equal(actual.ok, false);
  if (!actual.ok) assert.equal(actual.code, "UNSUPPORTED_SLUR");
});

test("same slur number may be sequentially reused across two completed cross-measure pairs", () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list><score-part id="P1"><part-name>Cross-measure reuse</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes><divisions>1</divisions><time><beats>4</beats><beat-type>4</beat-type></time></attributes>
      ${pitched("C", 4, slur("start"))}
    </measure>
    <measure number="2">
      ${pitched("D", 4, slur("stop"))}
    </measure>
    <measure number="3">
      ${pitched("E", 4, slur("start"))}
    </measure>
    <measure number="4">
      ${pitched("F", 4, slur("stop"))}
    </measure>
  </part>
</score-partwise>`;

  const actual = translateMusicXmlTextToBraille(xml);
  assert.equal(actual.ok, true);
  if (!actual.ok) return;

  const trace = actual.parts[0].trace;
  assert.equal(trace.length, 4);
  assert.equal(trace[0].emittedBrf.endsWith("c"), true);
  assert.equal(trace[1].emittedBrf.endsWith("c"), false);
  assert.equal(trace[2].emittedBrf.endsWith("c"), true);
  assert.equal(trace[3].emittedBrf.endsWith("c"), false);
});
// PHASE16_R4_SEQUENTIAL_SLUR_NUMBER_REUSE
test("sequential MusicXML slurs may legally reuse the same number after a completed pair", () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list>
    <score-part id="P1"><part-name>Piano</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
      </attributes>
      <note>
        <pitch><step>C</step><octave>4</octave></pitch>
        <duration>1</duration><voice>1</voice><type>quarter</type>
        <notations><slur type="start" number="1"/></notations>
      </note>
      <note>
        <pitch><step>D</step><octave>4</octave></pitch>
        <duration>1</duration><voice>1</voice><type>quarter</type>
        <notations><slur type="stop" number="1"/></notations>
      </note>
      <note>
        <pitch><step>E</step><octave>4</octave></pitch>
        <duration>1</duration><voice>1</voice><type>quarter</type>
        <notations><slur type="start" number="1"/></notations>
      </note>
      <note>
        <pitch><step>F</step><octave>4</octave></pitch>
        <duration>1</duration><voice>1</voice><type>quarter</type>
        <notations><slur type="stop" number="1"/></notations>
      </note>
    </measure>
  </part>
</score-partwise>`;

  const result = translateMusicXmlTextToBraille(xml);
  assert.equal(result.ok, true);
});

test("a second slur start is still rejected while the same numbered slur is active", () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list>
    <score-part id="P1"><part-name>Piano</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <time><beats>4</beats><beat-type>4</beat-type></time>
      </attributes>
      <note>
        <pitch><step>C</step><octave>4</octave></pitch>
        <duration>1</duration><voice>1</voice><type>quarter</type>
        <notations><slur type="start" number="1"/></notations>
      </note>
      <note>
        <pitch><step>D</step><octave>4</octave></pitch>
        <duration>1</duration><voice>1</voice><type>quarter</type>
        <notations><slur type="start" number="1"/></notations>
      </note>
      <note>
        <pitch><step>E</step><octave>4</octave></pitch>
        <duration>1</duration><voice>1</voice><type>quarter</type>
      </note>
      <note>
        <pitch><step>F</step><octave>4</octave></pitch>
        <duration>1</duration><voice>1</voice><type>quarter</type>
        <notations><slur type="stop" number="1"/></notations>
      </note>
    </measure>
  </part>
</score-partwise>`;

  const result = translateMusicXmlTextToBraille(xml);
  assert.equal(result.ok, false);
  if (result.ok === false) {
    assert.equal(result.code, "UNSUPPORTED_SLUR");
  }
});