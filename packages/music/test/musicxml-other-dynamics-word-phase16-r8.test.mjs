import test from "node:test";
import assert from "node:assert/strict";

import {
  translateMusicXmlTextToBraille,
} from "../dist/musicxml-to-braille.js";

function score(dynamicBody) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list><score-part id="P1"><part-name>Piano</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <time><beats>4</beats><beat-type>4</beat-type></time>
      </attributes>
      <direction>
        <direction-type>
          <dynamics>${dynamicBody}</dynamics>
        </direction-type>
      </direction>
      <note>
        <pitch><step>C</step><octave>4</octave></pitch>
        <duration>4</duration><voice>1</voice><type>whole</type>
      </note>
    </measure>
  </part>
</score-partwise>`;
}

test("V18N textual other-dynamics cresc. reuses frozen R2B cr. word expression", () => {
  const actual =
    translateMusicXmlTextToBraille(
      score(
        "<other-dynamics>cresc.</other-dynamics>",
      ),
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
    actual.parts[0].brf.includes(">cr'"),
    true,
  );
});

test("V18N unknown textual other-dynamics remains fail-closed", () => {
  const actual =
    translateMusicXmlTextToBraille(
      score(
        "<other-dynamics>mystery</other-dynamics>",
      ),
    );

  assert.equal(actual.ok, false);

  if (!actual.ok) {
    assert.equal(
      actual.code,
      "UNSUPPORTED_DYNAMICS",
    );
  }
});
