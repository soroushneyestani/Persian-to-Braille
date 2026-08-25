import test from "node:test";
import assert from "node:assert/strict";
import {
  translateMusicXmlTextToBraille,
} from "../dist/musicxml-to-braille.js";

function scoreWithMetronome({
  beatUnit,
  perMinute,
  dot = false,
  relation,
  staff = "1",
}) {
  return `<?xml version="1.0" encoding="UTF-8"?>
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
      <direction placement="above">
        <direction-type>
          <metronome>
            <beat-unit>${beatUnit}</beat-unit>
            ${dot ? "<beat-unit-dot/>" : ""}
            ${relation ? `<metronome-relation>${relation}</metronome-relation>` : ""}
            <per-minute>${perMinute}</per-minute>
          </metronome>
        </direction-type>
        ${staff === null ? "" : `<staff>${staff}</staff>`}
      </direction>
      <note>
        <pitch><step>C</step><octave>4</octave></pitch>
        <duration>4</duration>
        <voice>1</voice>
        <type>whole</type>
      </note>
    </measure>
  </part>
</score-partwise>`;
}

test("V18B emits BANA embedded quarter=60 metronome with music parentheses", () => {
  const result = translateMusicXmlTextToBraille(
    scoreWithMetronome({
      beatUnit: "quarter",
      perMinute: "60",
    }),
  );

  assert.equal(result.ok, true);
  const serialized = JSON.stringify(result);
  assert.match(serialized, /,'\?7#fj,'/);
  assert.doesNotMatch(serialized, /,'\?7#fj,'\s*'/);
});

test("V18B emits BANA embedded eighth=120 metronome with one numeric indicator", () => {
  const result = translateMusicXmlTextToBraille(
    scoreWithMetronome({
      beatUnit: "eighth",
      perMinute: "120",
    }),
  );

  assert.equal(result.ok, true);
  const serialized = JSON.stringify(result);
  assert.match(serialized, /,'D7#abj,'/);
  assert.doesNotMatch(serialized, /,'D7#abj,'\s*'/);
});

test("V18B keeps dotted metronome beat unit explicit fail-closed", () => {
  const result = translateMusicXmlTextToBraille(
    scoreWithMetronome({
      beatUnit: "quarter",
      perMinute: "60",
      dot: true,
    }),
  );

  assert.equal(result.ok, false);
  if (result.ok === false) {
    assert.equal(result.code, "UNSUPPORTED_METRONOME");
  }
});

test("V18B keeps metronome relation explicit fail-closed", () => {
  const result = translateMusicXmlTextToBraille(
    scoreWithMetronome({
      beatUnit: "quarter",
      perMinute: "60",
      relation: "equals",
    }),
  );

  assert.equal(result.ok, false);
  if (result.ok === false) {
    assert.equal(result.code, "UNSUPPORTED_METRONOME");
  }
});

test("V18B keeps unstaffed metronome placement fail-closed", () => {
  const result = translateMusicXmlTextToBraille(
    scoreWithMetronome({
      beatUnit: "quarter",
      perMinute: "60",
      staff: null,
    }),
  );

  assert.equal(result.ok, false);
  if (result.ok === false) {
    assert.equal(result.code, "UNSUPPORTED_METRONOME");
  }
});