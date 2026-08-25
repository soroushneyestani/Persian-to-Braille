import test from "node:test";
import assert from "node:assert/strict";

import {
  translateMusicXmlTextToBraille,
} from "../dist/musicxml-to-braille.js";

import {
  STATEFUL_HAIRPIN_START_BRF,
  STATEFUL_HAIRPIN_STOP_BRF,
  STATEFUL_PEDAL_DOWN_BRF,
  STATEFUL_PEDAL_UP_BRF,
} from "../dist/music-braille-stateful-encoder.js";

function score(body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list>
    <score-part id="P1">
      <part-name>Piano</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>0</fifths></key>
        <time>
          <beats>2</beats>
          <beat-type>4</beat-type>
        </time>
        <clef number="1">
          <sign>G</sign><line>2</line>
        </clef>
      </attributes>
      ${body}
    </measure>
  </part>
</score-partwise>`;
}

const noteC =
  `<note>
    <pitch><step>C</step><octave>4</octave></pitch>
    <duration>1</duration>
    <voice>1</voice><type>quarter</type><staff>1</staff>
  </note>`;

const noteD =
  `<note>
    <pitch><step>D</step><octave>4</octave></pitch>
    <duration>1</duration>
    <voice>1</voice><type>quarter</type><staff>1</staff>
  </note>`;

test("V18E matched damper pedal start/stop emits BANA pedal signs", () => {
  const actual =
    translateMusicXmlTextToBraille(
      score(
        `<direction>
          <direction-type>
            <pedal type="start" line="yes"/>
          </direction-type>
          <staff>1</staff>
        </direction>`
        + noteC
        + `<direction>
          <direction-type>
            <pedal type="stop" line="yes"/>
          </direction-type>
          <staff>1</staff>
        </direction>`
        + noteD,
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
    actual.parts[0].brf.includes(
      STATEFUL_PEDAL_DOWN_BRF,
    ),
    true,
  );

  assert.equal(
    actual.parts[0].brf.includes(
      STATEFUL_PEDAL_UP_BRF,
    ),
    true,
  );
});

for (
  const kind of [
    "crescendo",
    "diminuendo",
  ]
) {
  test(`V18E matched ${kind} wedge emits BANA start and terminator`, () => {
    const actual =
      translateMusicXmlTextToBraille(
        score(
          `<direction>
            <direction-type>
              <wedge type="${kind}" number="1"/>
            </direction-type>
            <staff>1</staff>
          </direction>`
          + noteC
          + `<direction>
            <direction-type>
              <wedge type="stop" number="1"/>
            </direction-type>
            <staff>1</staff>
          </direction>`
          + noteD,
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
      actual.parts[0].brf.includes(
        STATEFUL_HAIRPIN_START_BRF[kind],
      ),
      true,
    );

    assert.equal(
      actual.parts[0].brf.includes(
        STATEFUL_HAIRPIN_STOP_BRF[kind],
      ),
      true,
    );
  });
}

test("V18E unmatched pedal remains fail-closed", () => {
  const actual =
    translateMusicXmlTextToBraille(
      score(
        `<direction>
          <direction-type>
            <pedal type="start" line="yes"/>
          </direction-type>
          <staff>1</staff>
        </direction>`
        + noteC
        + noteD,
      ),
    );

  assert.equal(actual.ok, false);

  if (!actual.ok) {
    assert.equal(
      actual.code,
      "UNSUPPORTED_PEDAL",
    );
  }
});

test("V18E pedal change remains outside bounded start/stop profile", () => {
  const actual =
    translateMusicXmlTextToBraille(
      score(
        `<direction>
          <direction-type>
            <pedal type="change" line="yes"/>
          </direction-type>
          <staff>1</staff>
        </direction>`
        + noteC
        + noteD,
      ),
    );

  assert.equal(actual.ok, false);

  if (!actual.ok) {
    assert.equal(
      actual.code,
      "UNSUPPORTED_PEDAL",
    );
  }
});

test("V18E wedge continue remains outside bounded profile", () => {
  const actual =
    translateMusicXmlTextToBraille(
      score(
        `<direction>
          <direction-type>
            <wedge type="continue" number="1"/>
          </direction-type>
          <staff>1</staff>
        </direction>`
        + noteC
        + noteD,
      ),
    );

  assert.equal(actual.ok, false);

  if (!actual.ok) {
    assert.equal(
      actual.code,
      "UNSUPPORTED_WEDGE",
    );
  }
});
