import assert from "node:assert/strict";
import test from "node:test";

import {
  MusicBrailleMusicXmlTranslationError,
  createMusicBrailleMidiTranslator,
  createMusicBrailleMusicXmlTranslator,
} from "../dist/index.js";

import {
  translateMusicXmlBytesToBraille,
  translateMxlToBraille,
} from "@persian-braille/music";

const SCORE = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <part-list>
    <score-part id="P1"><part-name>SDK Test</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note>
        <pitch><step>C</step><octave>4</octave></pitch>
        <duration>1</duration><type>quarter</type>
      </note>
    </measure>
  </part>
</score-partwise>`;

function xmlBytes() {
  return new TextEncoder().encode(SCORE);
}

function u16(value) {
  return Buffer.from([
    value & 0xff,
    (value >>> 8) & 0xff,
  ]);
}

function u32(value) {
  return Buffer.from([
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 24) & 0xff,
  ]);
}

function storedZip(entries) {
  const locals = [];
  const centrals = [];
  let offset = 0;

  for (const entry of entries) {
    const name = Buffer.from(entry.name, "utf8");
    const data = Buffer.from(entry.data, "utf8");

    const local = Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x03, 0x04]),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(data.length),
      u32(data.length),
      u16(name.length),
      u16(0),
      name,
      data,
    ]);
    locals.push(local);

    const central = Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x01, 0x02]),
      u16(20),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(data.length),
      u32(data.length),
      u16(name.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      name,
    ]);
    centrals.push(central);
    offset += local.length;
  }

  const directory =
    Buffer.concat(centrals);

  return Buffer.concat([
    ...locals,
    directory,
    Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x05, 0x06]),
      u16(0),
      u16(0),
      u16(entries.length),
      u16(entries.length),
      u32(directory.length),
      u32(offset),
      u16(0),
    ]),
  ]);
}

function mxlBytes() {
  const container = `<?xml version="1.0" encoding="UTF-8"?>
<container>
  <rootfiles>
    <rootfile full-path="score.musicxml" media-type="application/vnd.recordare.musicxml+xml"/>
  </rootfiles>
</container>`;

  return new Uint8Array(
    storedZip([
      {
        name: "META-INF/container.xml",
        data: container,
      },
      {
        name: "score.musicxml",
        data: SCORE,
      },
    ]),
  );
}

test(
  "MusicXML SDK exposes a separate frozen public profile from MIDI",
  () => {
    const musicXml =
      createMusicBrailleMusicXmlTranslator();
    const midi =
      createMusicBrailleMidiTranslator();

    assert.deepEqual(
      musicXml.profile,
      {
        id:
          "MUSICXML_TO_MBC2015_UNICODE_V1",
        sourceCode:
          "BANA-MBC-2015",
        inputs:
          ["musicxml", "mxl"],
        output:
          "unicode-music-braille",
        stateful:
          true,
        writtenPitchPreserved:
          true,
        midiApiIndependent:
          true,
        partTransportLayout:
          "MUSICXML_PARTS_NEWLINE_TRANSPORT_V1",
      },
    );
    assert.equal(
      Object.isFrozen(
        musicXml.profile,
      ),
      true,
    );
    assert.equal(
      "translateMidi" in musicXml,
      false,
    );
    assert.equal(
      "inspectMidi" in musicXml,
      false,
    );
    assert.equal(
      "translateMusicXml" in midi,
      false,
    );
    assert.equal(
      "translateMxl" in midi,
      false,
    );
  },
);

test(
  "public MusicXML bytes projection has exact engine output without leaking engine trace",
  () => {
    const translator =
      createMusicBrailleMusicXmlTranslator();
    const bytes =
      xmlBytes();

    const direct =
      translateMusicXmlBytesToBraille(
        bytes,
      );
    const result =
      translator.translateMusicXml(
        bytes,
      );

    assert.equal(
      direct.ok,
      true,
    );
    assert.equal(
      result.ok,
      true,
    );
    if (!direct.ok || !result.ok) return;

    assert.equal(
      result.sourceKind,
      "musicxml",
    );
    assert.equal(
      result.inputByteLength,
      bytes.byteLength,
    );
    assert.equal(
      result.brf,
      direct.brf,
    );
    assert.equal(
      result.unicodeBraille,
      direct.unicodeBraille,
    );
    assert.deepEqual(
      result.parts.map(
        (part) => ({
          partId: part.partId,
          partName: part.partName,
          brf: part.brf,
          unicodeBraille:
            part.unicodeBraille,
        }),
      ),
      direct.parts.map(
        (part) => ({
          partId: part.partId,
          partName: part.partName,
          brf: part.brf,
          unicodeBraille:
            part.unicodeBraille,
        }),
      ),
    );

    assert.equal(
      "trace" in result.parts[0],
      false,
    );
    assert.equal(
      "engineProfileId"
        in result.parts[0],
      false,
    );
    assert.equal(
      "chordProfileId"
        in result.parts[0],
      false,
    );
    assert.equal(
      Object.isFrozen(result),
      true,
    );
    assert.equal(
      Object.isFrozen(result.parts),
      true,
    );
    assert.equal(
      Object.isFrozen(result.parts[0]),
      true,
    );
    assert.equal(
      Object.isFrozen(
        result.diagnostics,
      ),
      true,
    );
  },
);

test(
  "public MusicXML expected parser failures remain non-throwing",
  () => {
    const translator =
      createMusicBrailleMusicXmlTranslator();

    const result =
      translator.translateMusicXml(
        new TextEncoder().encode(
          "<not-musicxml/>",
        ),
      );

    assert.equal(
      result.ok,
      false,
    );
    if (result.ok) return;

    assert.equal(
      result.sourceKind,
      "musicxml",
    );
    assert.equal(
      result.code,
      "UNSUPPORTED_ROOT",
    );
    assert.equal(
      result.stage,
      "parser",
    );
  },
);

test(
  "translateMusicXmlOrThrow uses the SDK-owned MusicXML error",
  () => {
    const translator =
      createMusicBrailleMusicXmlTranslator();

    assert.throws(
      () =>
        translator.translateMusicXmlOrThrow(
          new TextEncoder().encode(
            "<not-musicxml/>",
          ),
        ),
      (error) => {
        assert.equal(
          error instanceof
            MusicBrailleMusicXmlTranslationError,
          true,
        );
        assert.equal(
          error.code,
          "UNSUPPORTED_ROOT",
        );
        assert.equal(
          error.result.stage,
          "parser",
        );
        return true;
      },
    );
  },
);

test(
  "public MXL projection reuses the hardened container and existing MusicXML engine path",
  async () => {
    const translator =
      createMusicBrailleMusicXmlTranslator();
    const bytes =
      mxlBytes();

    const direct =
      await translateMxlToBraille(
        bytes,
      );
    const result =
      await translator.translateMxl(
        bytes,
      );

    assert.equal(
      direct.ok,
      true,
    );
    assert.equal(
      result.ok,
      true,
    );
    if (!direct.ok || !result.ok) return;

    assert.equal(
      result.sourceKind,
      "mxl",
    );
    assert.equal(
      result.inputByteLength,
      bytes.byteLength,
    );
    assert.equal(
      result.brf,
      direct.brf,
    );
    assert.equal(
      result.unicodeBraille,
      direct.unicodeBraille,
    );
  },
);

test(
  "public MXL container failures remain non-throwing and container-scoped",
  async () => {
    const translator =
      createMusicBrailleMusicXmlTranslator();

    const result =
      await translator.translateMxl(
        new Uint8Array([
          0x00,
          0x01,
        ]),
      );

    assert.equal(
      result.ok,
      false,
    );
    if (result.ok) return;

    assert.equal(
      result.sourceKind,
      "mxl",
    );
    assert.equal(
      result.code,
      "INVALID_ZIP",
    );
    assert.equal(
      result.stage,
      "container",
    );
  },
);

test(
  "translateMxlOrThrow uses the same SDK-owned MusicXML error class",
  async () => {
    const translator =
      createMusicBrailleMusicXmlTranslator();

    await assert.rejects(
      () =>
        translator.translateMxlOrThrow(
          new Uint8Array([
            0x00,
            0x01,
          ]),
        ),
      (error) => {
        assert.equal(
          error instanceof
            MusicBrailleMusicXmlTranslationError,
          true,
        );
        assert.equal(
          error.code,
          "INVALID_ZIP",
        );
        assert.equal(
          error.result.sourceKind,
          "mxl",
        );
        return true;
      },
    );
  },
);

test(
  "MusicXML SDK results are deterministic for repeated input",
  () => {
    const translator =
      createMusicBrailleMusicXmlTranslator();
    const bytes =
      xmlBytes();

    assert.deepEqual(
      translator.translateMusicXml(
        bytes,
      ),
      translator.translateMusicXml(
        bytes,
      ),
    );
  },
);

function r1DirectionBytes(direction) {
  return new TextEncoder().encode(`<?xml version="1.0"?><score-partwise version="3.1">
  <part-list><score-part id="P1"><part-name>R1</part-name></score-part></part-list>
  <part id="P1"><measure number="1">
  <attributes><divisions>1</divisions><key><fifths>0</fifths></key><time><beats>4</beats><beat-type>4</beat-type></time></attributes>
  ${direction}
  <note><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
  </measure></part></score-partwise>`);
}

for (const [name, direction, code] of [
  ["wedge", `<direction><direction-type><wedge type="crescendo"/></direction-type></direction>`, "UNSUPPORTED_WEDGE"],
  ["pedal", `<direction><direction-type><pedal type="start" line="yes"/></direction-type></direction>`, "UNSUPPORTED_PEDAL"],
  ["metronome", `<direction><direction-type><metronome><beat-unit>quarter</beat-unit><per-minute>88</per-minute></metronome></direction-type></direction>`, "UNSUPPORTED_METRONOME"],
]) {
  test(`public SDK preserves R1 ${name} fail-closed code`, () => {
    const result = createMusicBrailleMusicXmlTranslator().translateMusicXml(r1DirectionBytes(direction));
    assert.equal(result.ok, false);
    if (!result.ok) { assert.equal(result.code, code); assert.equal(result.stage, "bridge"); }
  });
}

test("public SDK exposes R1 playback metadata diagnostics without failure", () => {
  const result = createMusicBrailleMusicXmlTranslator().translateMusicXml(
    r1DirectionBytes(`<direction><sound tempo="88" dynamics="54.44"/></direction>`)
  );
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.diagnostics.some((d) => d.code === "TEMPO_PRESERVED_NOT_EMITTED"), true);
  assert.equal(result.diagnostics.some((d) => d.code === "SOUND_DYNAMICS_PRESERVED_NOT_EMITTED"), true);
});

function r2bDirectionBytes(direction) {
  return new TextEncoder().encode(`<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <part-list><score-part id="P1"><part-name>R2B</part-name></score-part></part-list>
  <part id="P1"><measure number="1">
    <attributes>
      <divisions>1</divisions>
      <key><fifths>0</fifths></key>
      <time><beats>4</beats><beat-type>4</beat-type></time>
    </attributes>
    ${direction}
    <note>
      <pitch><step>C</step><octave>4</octave></pitch>
      <duration>4</duration><type>whole</type>
    </note>
  </measure></part>
</score-partwise>`);
}

test("public MusicXML SDK emits R2B semantic word expression", () => {
  const translator = createMusicBrailleMusicXmlTranslator();
  const result = translator.translateMusicXml(
    r2bDirectionBytes(
      '<direction><direction-type><words>Allegro</words></direction-type></direction>',
    ),
  );
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.brf.includes(">allegro"), true);
});

test("public MusicXML SDK preserves R2B structural terminology failure", () => {
  const translator = createMusicBrailleMusicXmlTranslator();
  const result = translator.translateMusicXml(
    r2bDirectionBytes(
      '<direction><direction-type><words>Attacca</words></direction-type></direction>',
    ),
  );
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(
    result.code,
    "UNSUPPORTED_DIRECTION_STRUCTURAL_TERMINOLOGY",
  );
  assert.equal(result.stage, "bridge");
});
