/* PHASE16_5D3_MUSICXML_ARTICULATION */
import test from "node:test";
import assert from "node:assert/strict";

import {
  translateMusicXmlTextToBraille,
} from "../dist/index.js";
import {
  encodeStatefulScore,
  STATEFUL_ARTICULATION_BRF,
} from "../dist/music-braille-stateful-encoder.js";

function score(body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <part-list>
    <score-part id="P1"><part-name>Articulation</part-name></score-part>
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

function noteXml(articulation, step = "C", alter = "") {
  return `
    <note>
      <pitch><step>${step}</step>${alter}<octave>4</octave></pitch>
      <duration>1</duration><voice>1</voice><type>quarter</type><staff>1</staff>
      <notations><articulations><${articulation}/></articulations></notations>
    </note>`;
}

const mappings = [
  ["staccato", "8"],
  ["staccatissimo", ",8"],
  ["accent", ".8"],
  ["tenuto", "_8"],
];

for (const [name, brf] of mappings) {
  test(`MusicXML ${name} reuses exact BANA Table 22(A) prefix ${brf}`, () => {
    const actual = translateMusicXmlTextToBraille(score(noteXml(name)));
    assert.equal(actual.ok, true);
    if (!actual.ok) return;

    const expected = encodeStatefulScore({
      keySharpsFlats: 0,
      meter: { numerator: 4, denominator: 4 },
      measures: [{
        events: [{
          kind: "note",
          midiPitch: 60,
          writtenPitch: {
            step: "C",
            accidental: 0,
            scientificOctave: 4,
          },
          value: "quarter",
          articulations: [name],
        }],
      }],
    });

    assert.equal(actual.parts[0].brf, expected.brf);
    assert.equal(STATEFUL_ARTICULATION_BRF[name], brf);

    const bodyBrf = actual.parts[0].brf.split(" ").at(-1);
    assert.equal(bodyBrf?.startsWith(brf), true);
  });
}

test("articulation prefix precedes accidental and octave mark", () => {
  const actual = translateMusicXmlTextToBraille(
    score(noteXml("staccato", "C", "<alter>1</alter>")),
  );
  assert.equal(actual.ok, true);
  if (!actual.ok) return;

  const bodyBrf = actual.parts[0].brf.split(" ").at(-1);
  assert.equal(bodyBrf?.startsWith('8%"'), true);
});

test("base-note chord articulation is carried to the existing stateful chord encoder", () => {
  const actual = translateMusicXmlTextToBraille(score(`
    <note>
      <pitch><step>G</step><octave>4</octave></pitch>
      <duration>1</duration><voice>1</voice><type>quarter</type><staff>1</staff>
      <notations><articulations><accent/></articulations></notations>
    </note>
    <note>
      <chord/>
      <pitch><step>E</step><octave>4</octave></pitch>
      <duration>1</duration><voice>1</voice><type>quarter</type><staff>1</staff>
    </note>
  `));

  assert.equal(actual.ok, true);
  if (!actual.ok) return;
  assert.equal(actual.parts[0].brf.split(" ").at(-1)?.startsWith(".8"), true);
});

test("strong-accent remains explicit fail-closed", () => {
  const actual = translateMusicXmlTextToBraille(score(noteXml("strong-accent")));
  assert.equal(actual.ok, false);
  if (!actual.ok) {
    assert.equal(actual.code, "UNSUPPORTED_ARTICULATION");
    assert.equal(actual.stage, "bridge");
  }
});

test("detached-legato remains explicit fail-closed pending exact semantic mapping", () => {
  const actual = translateMusicXmlTextToBraille(score(noteXml("detached-legato")));
  assert.equal(actual.ok, false);
  if (!actual.ok) {
    assert.equal(actual.code, "UNSUPPORTED_ARTICULATION");
    assert.equal(actual.stage, "bridge");
  }
});

test("multiple simultaneous articulations remain fail-closed in initial subset", () => {
  const actual = translateMusicXmlTextToBraille(score(`
    <note>
      <pitch><step>C</step><octave>4</octave></pitch>
      <duration>1</duration><voice>1</voice><type>quarter</type><staff>1</staff>
      <notations>
        <articulations><staccato/><accent/></articulations>
      </notations>
    </note>
  `));

  assert.equal(actual.ok, false);
  if (!actual.ok) {
    assert.equal(actual.code, "UNSUPPORTED_ARTICULATION");
    assert.equal(actual.stage, "bridge");
  }
});

test("articulation on a rest remains fail-closed", () => {
  const actual = translateMusicXmlTextToBraille(score(`
    <note>
      <rest/>
      <duration>1</duration><voice>1</voice><type>quarter</type><staff>1</staff>
      <notations><articulations><staccato/></articulations></notations>
    </note>
  `));

  assert.equal(actual.ok, false);
  if (!actual.ok) {
    assert.equal(actual.code, "UNSUPPORTED_ARTICULATION");
    assert.equal(actual.stage, "bridge");
  }
});
