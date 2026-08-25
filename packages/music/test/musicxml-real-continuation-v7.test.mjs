/* PHASE16_R3_V6_REAL_CONTINUATION */
import test from "node:test";
import assert from "node:assert/strict";

import {
  translateMusicXmlTextToBraille,
} from "../dist/index.js";

function keyboardScore(body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
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
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <staves>2</staves>
        <clef number="1"><sign>G</sign><line>2</line></clef>
        <clef number="2"><sign>F</sign><line>4</line></clef>
      </attributes>
      ${body}
    </measure>
  </part>
</score-partwise>`;
}

test(
  "keyboard staff-scoped word expression follows exact musical onset instead of raw XML position",
  () => {
    const actual =
      translateMusicXmlTextToBraille(
        keyboardScore(`
          <note>
            <rest/>
            <duration>1</duration>
            <voice>1</voice>
            <type>quarter</type>
            <staff>1</staff>
          </note>
          <direction>
            <direction-type>
              <words>Allegro con brio</words>
            </direction-type>
            <staff>1</staff>
          </direction>
          <note>
            <pitch>
              <step>G</step>
              <octave>4</octave>
            </pitch>
            <duration>3</duration>
            <voice>1</voice>
            <type>half</type>
            <dot/>
            <staff>1</staff>
          </note>
          <backup><duration>4</duration></backup>
          <note>
            <pitch>
              <step>G</step>
              <octave>2</octave>
            </pitch>
            <duration>4</duration>
            <voice>5</voice>
            <type>whole</type>
            <staff>2</staff>
          </note>
        `),
      );

    assert.equal(actual.ok, true);
    if (!actual.ok) return;

    const keyboard =
      actual.parts[0].trace.find(
        (entry) =>
          entry.kind === "keyboard-parallel",
      );

    assert.notEqual(
      keyboard,
      undefined,
    );

    assert.equal(
      keyboard?.emittedBrf.includes(
        ">allegro con brio",
      ),
      true,
    );
  },
);

test(
  "keyboard independent dynamic may prefix an exact-onset rest",
  () => {
    const actual =
      translateMusicXmlTextToBraille(
        keyboardScore(`
          <direction>
            <direction-type>
              <dynamics><ff/></dynamics>
            </direction-type>
            <staff>1</staff>
          </direction>
          <note>
            <rest/>
            <duration>4</duration>
            <voice>1</voice>
            <type>whole</type>
            <staff>1</staff>
          </note>
          <backup><duration>4</duration></backup>
          <note>
            <pitch>
              <step>C</step>
              <octave>3</octave>
            </pitch>
            <duration>4</duration>
            <voice>5</voice>
            <type>whole</type>
            <staff>2</staff>
          </note>
        `),
      );

    assert.equal(actual.ok, true);
    if (!actual.ok) return;

    const keyboard =
      actual.parts[0].trace.find(
        (entry) =>
          entry.kind === "keyboard-parallel",
      );

    assert.equal(
      keyboard?.emittedBrf.includes(">ff"),
      true,
    );
  },
);

test(
  "keyboard per-voice short slur reuses existing contained short-slur policy",
  () => {
    const actual =
      translateMusicXmlTextToBraille(
        keyboardScore(`
          <note>
            <pitch>
              <step>C</step>
              <octave>5</octave>
            </pitch>
            <duration>2</duration>
            <voice>1</voice>
            <type>half</type>
            <staff>1</staff>
            <notations>
              <slur type="start" number="1"/>
            </notations>
          </note>
          <note>
            <pitch>
              <step>D</step>
              <octave>5</octave>
            </pitch>
            <duration>2</duration>
            <voice>1</voice>
            <type>half</type>
            <staff>1</staff>
            <notations>
              <slur type="stop" number="1"/>
            </notations>
          </note>
          <backup><duration>4</duration></backup>
          <note>
            <pitch>
              <step>C</step>
              <octave>3</octave>
            </pitch>
            <duration>4</duration>
            <voice>5</voice>
            <type>whole</type>
            <staff>2</staff>
          </note>
        `),
      );

    assert.equal(actual.ok, true);
  },
);

test(
  "extreme integer MusicXML alter preserves sounding pitch and reuses deterministic spelling",
  () => {
    const extreme =
      translateMusicXmlTextToBraille(
        keyboardScore(`
          <note>
            <pitch>
              <step>F</step>
              <alter>9</alter>
              <octave>3</octave>
            </pitch>
            <duration>4</duration>
            <voice>1</voice>
            <type>whole</type>
            <staff>1</staff>
          </note>
          <backup><duration>4</duration></backup>
          <note>
            <pitch><step>C</step><octave>3</octave></pitch>
            <duration>4</duration>
            <voice>5</voice>
            <type>whole</type>
            <staff>2</staff>
          </note>
        `),
      );

    const canonical =
      translateMusicXmlTextToBraille(
        keyboardScore(`
          <note>
            <pitch><step>D</step><octave>4</octave></pitch>
            <duration>4</duration>
            <voice>1</voice>
            <type>whole</type>
            <staff>1</staff>
          </note>
          <backup><duration>4</duration></backup>
          <note>
            <pitch><step>C</step><octave>3</octave></pitch>
            <duration>4</duration>
            <voice>5</voice>
            <type>whole</type>
            <staff>2</staff>
          </note>
        `),
      );

    assert.equal(extreme.ok, true);
    assert.equal(canonical.ok, true);

    if (!extreme.ok || !canonical.ok) return;

    assert.equal(extreme.brf, canonical.brf);

    assert.equal(
      extreme.diagnostics.some(
        (diagnostic) =>
          diagnostic.code ===
            "SOURCE_PRESERVED_NOT_EMITTED"
          && diagnostic.message.includes(
            "extreme integer MusicXML alter",
          ),
      ),
      true,
    );
  },
);

test(
  "non-integer MusicXML alter remains explicit fail-closed",
  () => {
    const actual =
      translateMusicXmlTextToBraille(
        keyboardScore(`
          <note>
            <pitch>
              <step>C</step>
              <alter>0.5</alter>
              <octave>5</octave>
            </pitch>
            <duration>4</duration>
            <voice>1</voice>
            <type>whole</type>
            <staff>1</staff>
          </note>
          <backup><duration>4</duration></backup>
          <note>
            <pitch><step>C</step><octave>3</octave></pitch>
            <duration>4</duration>
            <voice>5</voice>
            <type>whole</type>
            <staff>2</staff>
          </note>
        `),
      );

    assert.equal(actual.ok, false);

    if (!actual.ok) {
      assert.equal(
        actual.code,
        "UNSUPPORTED_WRITTEN_PITCH",
      );
    }
  },
);
