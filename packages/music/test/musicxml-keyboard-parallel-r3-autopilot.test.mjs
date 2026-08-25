/* PHASE16_R3_KEYBOARD_PARALLEL_AUTOPILOT */
import test from "node:test";
import assert from "node:assert/strict";

import {
  KEYBOARD_DIRECTIONAL_CHORD_PROFILE_ID,
  encodeStatefulScore,
} from "../dist/music-braille-stateful-encoder.js";
import {
  translateMusicXmlTextToBraille,
} from "../dist/index.js";

test("left-hand chord direction can be upward without changing generic MIDI default", () => {
  const down = encodeStatefulScore({
    measures: [{
      events: [{
        kind: "chord",
        midiPitches: [48, 55],
        value: "whole",
      }],
    }],
  });

  const up = encodeStatefulScore({
    intervalDirection: "up",
    measures: [{
      events: [{
        kind: "chord",
        midiPitches: [48, 55],
        value: "whole",
      }],
    }],
  });

  assert.equal(down.trace[0].written?.midiPitch, 55);
  assert.equal(up.trace[0].written?.midiPitch, 48);
});

test("two-staff cursor polyphony emits right/left keyboard lines and mp", () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <part-list>
    <score-part id="P1"><part-name>Piano</part-name></score-part>
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
      <direction>
        <direction-type><dynamics><mp/></dynamics></direction-type>
        <staff>1</staff>
      </direction>
      <note>
        <pitch><step>C</step><octave>5</octave></pitch>
        <duration>4</duration><voice>1</voice><type>whole</type><staff>1</staff>
      </note>
      <note>
        <chord/>
        <pitch><step>E</step><octave>5</octave></pitch>
        <duration>4</duration><voice>1</voice><type>whole</type><staff>1</staff>
      </note>
      <backup><duration>4</duration></backup>
      <note>
        <pitch><step>C</step><octave>3</octave></pitch>
        <duration>4</duration><voice>5</voice><type>whole</type><staff>2</staff>
      </note>
      <note>
        <chord/>
        <pitch><step>G</step><octave>3</octave></pitch>
        <duration>4</duration><voice>5</voice><type>whole</type><staff>2</staff>
      </note>
    </measure>
  </part>
</score-partwise>`;

  const actual = translateMusicXmlTextToBraille(xml);
  assert.equal(actual.ok, true);
  if (!actual.ok) return;

  assert.equal(
    actual.parts[0].chordProfileId,
    KEYBOARD_DIRECTIONAL_CHORD_PROFILE_ID,
  );
  const keyboardTrace =
    actual.parts[0].trace.find(
      (entry) => entry.kind === "keyboard-parallel",
    );

  assert.notEqual(keyboardTrace, undefined);
  if (keyboardTrace === undefined) return;

  // Score-level BRF may begin with the existing meter/key signature.
  // Hand signs belong to the keyboard event itself.
  assert.equal(
    keyboardTrace.emittedBrf.startsWith(".>"),
    true,
  );
  assert.equal(
    keyboardTrace.emittedBrf.includes("\n_>"),
    true,
  );
  assert.equal(
    keyboardTrace.emittedBrf.includes(">mp"),
    true,
  );
  assert.equal(
    actual.diagnostics.some(
      (d) =>
        d.code === "KEYBOARD_DOMINANT_VOICE_PROFILE_APPLIED",
    ),
    true,
  );
});
