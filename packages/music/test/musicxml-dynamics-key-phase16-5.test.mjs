/* PHASE16_5_UNIFIED_DYNAMICS_KEY */
import test from "node:test";
import assert from "node:assert/strict";

import { translateMusicXmlTextToBraille } from "../dist/index.js";
import {
  encodeStatefulScore,
  STATEFUL_DYNAMIC_BRF,
} from "../dist/music-braille-stateful-encoder.js";

function oneMeasure(direction) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <part-list><score-part id="P1"><part-name>Direction</part-name></score-part></part-list>
  <part id="P1"><measure number="1">
    <attributes>
      <divisions>1</divisions>
      <key><fifths>0</fifths></key>
      <time><beats>4</beats><beat-type>4</beat-type></time>
      <clef number="1"><sign>G</sign><line>2</line></clef>
    </attributes>
    ${direction}
    <note>
      <pitch><step>C</step><octave>4</octave></pitch>
      <duration>4</duration><voice>1</voice><type>whole</type><staff>1</staff>
    </note>
  </measure></part>
</score-partwise>`;
}

for (const dynamic of ["pp", "p", "mf", "f", "ff"]) {
  test(`independent MusicXML ${dynamic} dynamic uses frozen BANA word-sign expression`, () => {
    const actual = translateMusicXmlTextToBraille(oneMeasure(`
      <direction>
        <direction-type><dynamics><${dynamic}/></dynamics></direction-type>
        <staff>1</staff>
      </direction>
    `));
    assert.equal(actual.ok, true);
    if (!actual.ok) return;

    const expected = encodeStatefulScore({
      keySharpsFlats: 0,
      meter: { numerator: 4, denominator: 4 },
      measures: [{
        events: [{
          kind: "note",
          midiPitch: 60,
          writtenPitch: { step: "C", accidental: 0, scientificOctave: 4 },
          value: "whole",
          dynamic,
        }],
      }],
    });

    assert.equal(actual.parts[0].brf, expected.brf);
    assert.equal(actual.parts[0].brf.includes(STATEFUL_DYNAMIC_BRF[dynamic]), true);
  });
}

test("independent dynamic precedes a supported Table 22(A) articulation on the same note", () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <part-list><score-part id="P1"><part-name>Dynamic articulation</part-name></score-part></part-list>
  <part id="P1"><measure number="1">
    <attributes><divisions>1</divisions><key><fifths>0</fifths></key><time><beats>4</beats><beat-type>4</beat-type></time></attributes>
    <direction><direction-type><dynamics><p/></dynamics></direction-type></direction>
    <note>
      <pitch><step>C</step><octave>4</octave></pitch>
      <duration>4</duration><type>whole</type>
      <notations><articulations><staccato/></articulations></notations>
    </note>
  </measure></part>
</score-partwise>`;

  const actual = translateMusicXmlTextToBraille(xml);
  assert.equal(actual.ok, true);
  if (!actual.ok) return;

  const emitted = actual.parts[0].trace[0].emittedBrf;
  assert.equal(emitted.startsWith(">p"), true);
  assert.equal(emitted.indexOf("8") > emitted.indexOf(">p"), true);
});

test("real-score independent fff dynamic is supported", () => {
  const actual = translateMusicXmlTextToBraille(oneMeasure(`
    <direction><direction-type><dynamics><fff/></dynamics></direction-type></direction>
  `));
  assert.equal(actual.ok, true);
  if (!actual.ok) return;
  assert.equal(
    actual.parts[0].trace[0].emittedBrf.startsWith(">fff"),
    true,
  );
});

test("R2B basic-Latin free expression uses semantic/BANA word-expression fallback", () => {
  const actual = translateMusicXmlTextToBraille(oneMeasure(`
    <direction><direction-type><words>molto espressivo</words></direction-type></direction>
  `));
  assert.equal(actual.ok, true);
  if (!actual.ok) return;
  assert.equal(
    actual.parts[0].trace[0].emittedBrf.startsWith(">molto espressivo> "),
    true,
  );
});

test("MusicXML wedge is structurally classified and remains explicit fail-closed", () => {
  const actual = translateMusicXmlTextToBraille(oneMeasure(`
    <direction><direction-type><wedge type="crescendo"/></direction-type></direction>
  `));
  assert.equal(actual.ok, false);
  if (!actual.ok) assert.equal(actual.code, "UNSUPPORTED_WEDGE");
});

test("measure-boundary C-major to G-major key change is emitted by the existing stateful engine", () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <part-list><score-part id="P1"><part-name>Key</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes><divisions>1</divisions><key><fifths>0</fifths></key><time><beats>4</beats><beat-type>4</beat-type></time></attributes>
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><voice>1</voice><type>whole</type></note>
    </measure>
    <measure number="2">
      <attributes><key><fifths>1</fifths></key></attributes>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><voice>1</voice><type>whole</type></note>
    </measure>
  </part>
</score-partwise>`;

  const actual = translateMusicXmlTextToBraille(xml);
  assert.equal(actual.ok, true);
  if (!actual.ok) return;

  const expected = encodeStatefulScore({
    keySharpsFlats: 0,
    meter: { numerator: 4, denominator: 4 },
    measures: [
      {
        events: [{
          kind: "note",
          midiPitch: 60,
          writtenPitch: { step: "C", accidental: 0, scientificOctave: 4 },
          value: "whole",
        }],
      },
      {
        keySharpsFlats: 1,
        events: [{
          kind: "note",
          midiPitch: 67,
          writtenPitch: { step: "G", accidental: 0, scientificOctave: 4 },
          value: "whole",
        }],
      },
    ],
  });

  assert.equal(actual.parts[0].brf, expected.brf);
});

test("nonzero key to zero-signature cancellation remains explicit fail-closed", () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <part-list><score-part id="P1"><part-name>Key cancellation</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes><divisions>1</divisions><key><fifths>1</fifths></key><time><beats>4</beats><beat-type>4</beat-type></time></attributes>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
    </measure>
    <measure number="2">
      <attributes><key><fifths>0</fifths></key></attributes>
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
    </measure>
  </part>
</score-partwise>`;

  const actual = translateMusicXmlTextToBraille(xml);
  assert.equal(actual.ok, false);
  if (!actual.ok) assert.equal(actual.code, "UNSUPPORTED_KEY_CANCELLATION");
});

test("mid-measure key change remains explicit fail-closed", () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <part-list><score-part id="P1"><part-name>Mid key</part-name></score-part></part-list>
  <part id="P1"><measure number="1">
    <attributes><divisions>1</divisions><key><fifths>0</fifths></key><time><beats>4</beats><beat-type>4</beat-type></time></attributes>
    <note><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
    <attributes><key><fifths>1</fifths></key></attributes>
    <note><pitch><step>G</step><octave>4</octave></pitch><duration>3</duration><type>half</type><dot/></note>
  </measure></part>
</score-partwise>`;

  const actual = translateMusicXmlTextToBraille(xml);
  assert.equal(actual.ok, false);
  if (!actual.ok) assert.equal(actual.code, "UNSUPPORTED_KEY_CHANGE");
});

test("R1 sound tempo and dynamics are non-fatal playback metadata diagnostics", () => {
  const actual = translateMusicXmlTextToBraille(oneMeasure(
    `<direction><sound tempo="88" dynamics="54.44"/></direction>`
  ));
  assert.equal(actual.ok, true);
  if (!actual.ok) return;
  assert.equal(actual.diagnostics.some((d) => d.code === "TEMPO_PRESERVED_NOT_EMITTED"), true);
  assert.equal(actual.diagnostics.some((d) => d.code === "SOUND_DYNAMICS_PRESERVED_NOT_EMITTED"), true);
});

test("R1 sound dynamics does not replace explicit supported print dynamics", () => {
  const actual = translateMusicXmlTextToBraille(oneMeasure(`
    <direction><direction-type><dynamics><p/></dynamics></direction-type><sound dynamics="54.44"/></direction>
  `));
  assert.equal(actual.ok, true);
  if (!actual.ok) return;
  assert.equal(actual.parts[0].brf.includes(STATEFUL_DYNAMIC_BRF.p), true);
  assert.equal(actual.diagnostics.some((d) => d.code === "SOUND_DYNAMICS_PRESERVED_NOT_EMITTED"), true);
});

test("R1 pedal is structurally preserved and explicit fail-closed", () => {
  const actual = translateMusicXmlTextToBraille(oneMeasure(
    `<direction><direction-type><pedal type="start" line="yes"/></direction-type></direction>`
  ));
  assert.equal(actual.ok, false);
  if (!actual.ok) assert.equal(actual.code, "UNSUPPORTED_PEDAL");
});

test("R1 metronome is structurally preserved and explicit fail-closed", () => {
  const actual = translateMusicXmlTextToBraille(oneMeasure(
    `<direction><direction-type><metronome><beat-unit>quarter</beat-unit><per-minute>88</per-minute></metronome></direction-type></direction>`
  ));
  assert.equal(actual.ok, false);
  if (!actual.ok) assert.equal(actual.code, "UNSUPPORTED_METRONOME");
});

test("R1 unknown direction-type remains generic fail-closed", () => {
  const actual = translateMusicXmlTextToBraille(oneMeasure(
    `<direction><direction-type><rehearsal>A</rehearsal></direction-type></direction>`
  ));
  assert.equal(actual.ok, false);
  if (!actual.ok) assert.equal(actual.code, "UNSUPPORTED_DIRECTION_TYPE");
});

test("R2B recognizes Allegro through terminology and emits a BANA word expression", () => {
  const actual = translateMusicXmlTextToBraille(oneMeasure(`
    <direction><direction-type><words>Allegro</words></direction-type></direction>
  `));
  assert.equal(actual.ok, true);
  if (!actual.ok) return;
  assert.equal(actual.parts[0].trace[0].emittedBrf.startsWith(">allegro"), true);
});

test("R2B canonicalizes cresc. to the BANA cr. word expression", () => {
  const actual = translateMusicXmlTextToBraille(oneMeasure(`
    <direction><direction-type><words>cresc.</words></direction-type></direction>
  `));
  assert.equal(actual.ok, true);
  if (!actual.ok) return;
  assert.equal(actual.parts[0].trace[0].emittedBrf.startsWith(">cr'"), true);
});

test("R2B orders a semantic expression before an independent dynamic", () => {
  const actual = translateMusicXmlTextToBraille(oneMeasure(`
    <direction>
      <direction-type><words>dolce</words></direction-type>
      <direction-type><dynamics><p/></dynamics></direction-type>
    </direction>
  `));
  assert.equal(actual.ok, true);
  if (!actual.ok) return;
  const emitted = actual.parts[0].trace[0].emittedBrf;
  assert.equal(emitted.indexOf(">dolce") >= 0, true);
  assert.equal(emitted.indexOf(">p") > emitted.indexOf(">dolce"), true);
});

test("R2B executes a basic-Latin free composer instruction through BANA fallback", () => {
  const actual = translateMusicXmlTextToBraille(oneMeasure(`
    <direction>
      <direction-type><words>Si deve suonare tutto questo pezzo</words></direction-type>
    </direction>
  `));
  assert.equal(actual.ok, true);
  if (!actual.ok) return;
  assert.equal(
    actual.parts[0].trace[0].emittedBrf.startsWith(">si deve suonare tutto questo pezzo> "),
    true,
  );
});

test("R2B keeps continuation fragments explicit fail-closed", () => {
  const actual = translateMusicXmlTextToBraille(oneMeasure(`
    <direction><direction-type><words>-</words></direction-type></direction>
  `));
  assert.equal(actual.ok, false);
  if (!actual.ok) {
    assert.equal(actual.code, "UNSUPPORTED_DIRECTION_WORD_CONTINUATION");
  }
});

test("R2B keeps private-use score glyphs explicit fail-closed", () => {
  const privateGlyph = String.fromCodePoint(0xe107);
  const actual = translateMusicXmlTextToBraille(oneMeasure(`
    <direction><direction-type><words>[${privateGlyph} ]</words></direction-type></direction>
  `));
  assert.equal(actual.ok, false);
  if (!actual.ok) {
    assert.equal(actual.code, "UNSUPPORTED_DIRECTION_WORD_GLYPH");
  }
});

test("R2B recognizes navigation but refuses literary emission", () => {
  const actual = translateMusicXmlTextToBraille(oneMeasure(`
    <direction>
      <direction-type><words>Attacca subito il seguente</words></direction-type>
    </direction>
  `));
  assert.equal(actual.ok, false);
  if (!actual.ok) {
    assert.equal(
      actual.code,
      "UNSUPPORTED_DIRECTION_STRUCTURAL_TERMINOLOGY",
    );
  }
});

test("R2B projects global measure-start terminology before an in-accord event", () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <part-list><score-part id="P1"><part-name>Piano</part-name></score-part></part-list>
  <part id="P1"><measure number="1">
    <attributes>
      <divisions>1</divisions>
      <key><fifths>0</fifths></key>
      <time><beats>4</beats><beat-type>4</beat-type></time>
      <clef><sign>G</sign><line>2</line></clef>
    </attributes>
    <direction><direction-type><words>Allegro con brio</words></direction-type></direction>
    <note><pitch><step>G</step><octave>5</octave></pitch><duration>4</duration><voice>1</voice><type>whole</type><staff>1</staff></note>
    <backup><duration>4</duration></backup>
    <note><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><voice>2</voice><type>whole</type><staff>1</staff></note>
  </measure></part>
</score-partwise>`;
  const actual = translateMusicXmlTextToBraille(xml);
  assert.equal(actual.ok, true);
  if (!actual.ok) return;
  assert.equal(
    actual.parts[0].trace[0].emittedBrf.startsWith(">allegro con brio> "),
    true,
  );
});
