/* PHASE16_PACK_A_MUSICXML */
import test from "node:test";
import assert from "node:assert/strict";
import zlib from "node:zlib";
import {adaptMusicXmlScore, loadMusicXmlFromMxl, parseMusicXmlBytes, parseMusicXmlText} from "../dist/index.js";

const XML = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <part-list><score-part id="P1"><part-name>Piano</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths><mode>major</mode></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef number="1"><sign>G</sign><line>2</line></clef>
        <clef number="2"><sign>F</sign><line>4</line></clef>
      </attributes>
      <direction><direction-type><dynamics><f/></dynamics></direction-type><sound tempo="120"/></direction>
      <note>
        <pitch><step>C</step><octave>4</octave></pitch>
        <duration>4</duration><voice>1</voice><type>quarter</type><staff>1</staff>
        <tie type="start"/>
        <notations><tied type="start"/><slur type="start" number="1"/><articulations><staccato/></articulations></notations>
      </note>
      <note><chord/><pitch><step>E</step><alter>-1</alter><octave>4</octave></pitch><duration>4</duration><voice>1</voice><type>quarter</type><staff>1</staff></note>
      <backup><duration>4</duration></backup>
      <note><rest/><duration>4</duration><voice>2</voice><type>quarter</type><staff>2</staff></note>
      <forward><duration>4</duration><voice>2</voice><staff>2</staff></forward>
      <barline location="right"><repeat direction="backward"/></barline>
    </measure>
  </part>
</score-partwise>`;

test("MusicXML parser preserves print semantics and exact timing", () => {
  const result = parseMusicXmlText(XML);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const measure = result.source.parts[0].measures[0];
  const notes = measure.items.filter((item) => item.kind === "note");
  assert.equal(result.source.version, "3.1");
  assert.equal(notes.length, 3);
  assert.deepEqual(notes[0].onsetQuarter, {numerator: 0, denominator: 1});
  assert.deepEqual(notes[0].durationQuarter, {numerator: 1, denominator: 1});
  assert.equal(notes[0].voice, "1");
  assert.equal(notes[0].staff, 1);
  assert.equal(notes[0].slurs[0].type, "start");
  assert.deepEqual(notes[0].articulations, ["staccato"]);
  assert.equal(notes[1].chord, true);
  assert.deepEqual(notes[1].onsetQuarter, {numerator: 0, denominator: 1});
  assert.equal(notes[1].writtenPitch.alter, -1);
  assert.equal(notes[2].rest, true);
  assert.equal(notes[2].voice, "2");
  assert.equal(notes[2].staff, 2);
});

test("adapter does not leak raw divisions", () => {
  const parsed = parseMusicXmlText(XML);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const adapted = adaptMusicXmlScore(parsed.source);
  const measure = adapted.parts[0].measures[0];
  const first = measure.notes[0];
  assert.deepEqual(first.durationQuarter, {numerator: 1, denominator: 1});
  assert.equal("effectiveDivisions" in first, false);
  assert.equal("durationDivisions" in first, false);
  assert.equal(first.metadata.voice, "1");
  assert.equal(first.metadata.staff, 1);
  assert.deepEqual(first.metadata.writtenPitch, {step: "C", alter: 0, octave: 4});
  assert.equal(first.metadata.slurs[0].type, "start");
  assert.deepEqual(first.metadata.articulations, ["staccato"]);
  assert.equal(measure.metadata.clefs.length, 2);
});

function u16(v) { return Buffer.from([v & 255, (v >>> 8) & 255]); }
function u32(v) { return Buffer.from([v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255]); }
function zip(entries) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.name, "utf8");
    const raw = Buffer.from(entry.data);
    const compressed = entry.deflate ? zlib.deflateRawSync(raw) : raw;
    const method = entry.deflate ? 8 : 0;
    const local = Buffer.concat([
      Buffer.from([0x50,0x4b,0x03,0x04]), u16(20), u16(0), u16(method), u16(0), u16(0),
      u32(0), u32(compressed.length), u32(raw.length), u16(name.length), u16(0), name, compressed,
    ]);
    locals.push(local);
    const central = Buffer.concat([
      Buffer.from([0x50,0x4b,0x01,0x02]), u16(20), u16(20), u16(0), u16(method), u16(0), u16(0),
      u32(0), u32(compressed.length), u32(raw.length), u16(name.length), u16(0), u16(0), u16(0), u16(0),
      u32(0), u32(offset), name,
    ]);
    centrals.push(central);
    offset += local.length;
  }
  const centralDir = Buffer.concat(centrals);
  const eocd = Buffer.concat([
    Buffer.from([0x50,0x4b,0x05,0x06]), u16(0), u16(0), u16(entries.length), u16(entries.length),
    u32(centralDir.length), u32(offset), u16(0),
  ]);
  return Buffer.concat([...locals, centralDir, eocd]);
}

test("MXL loader resolves container.xml and deflated rootfile", async (t) => {
  const container = `<?xml version="1.0"?><container><rootfiles><rootfile full-path="score.xml" media-type="application/vnd.recordare.musicxml+xml"/></rootfiles></container>`;
  const archive = zip([
    {name: "META-INF/container.xml", data: container, deflate: true},
    {name: "score.xml", data: XML, deflate: true},
  ]);
  const loaded = await loadMusicXmlFromMxl(new Uint8Array(archive));
  if (!loaded.ok && loaded.code === "DECOMPRESSION_UNAVAILABLE") {
    t.skip("Runtime does not expose deflate-raw DecompressionStream.");
    return;
  }
  assert.equal(loaded.ok, true);
  if (!loaded.ok) return;
  assert.equal(loaded.rootfilePath, "score.xml");
  const parsed = parseMusicXmlBytes(loaded.xml);
  assert.equal(parsed.ok, true);
});

test("explicit ENTITY declarations are rejected", () => {
  const unsafe = `<?xml version="1.0"?><!DOCTYPE score-partwise [<!ENTITY xxe "unsafe">]><score-partwise><part-list/><part id="P1"/></score-partwise>`;
  const result = parseMusicXmlText(unsafe);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, "UNSAFE_XML_ENTITY");
});

test("R1 parser preserves playback metadata plus structured wedge pedal metronome", () => {
  const xml = `<?xml version="1.0"?><score-partwise version="3.1">
  <part-list><score-part id="P1"><part-name>R1</part-name></score-part></part-list>
  <part id="P1"><measure number="1"><attributes><divisions>1</divisions></attributes>
  <direction>
    <direction-type><wedge type="crescendo" number="1" default-y="-88.04"/></direction-type>
    <direction-type><pedal type="start" number="2" line="yes" default-y="-80.00"/></direction-type>
    <direction-type><metronome><beat-unit>quarter</beat-unit><per-minute>96</per-minute></metronome></direction-type>
    <sound tempo="96" dynamics="54.44"/><staff>1</staff>
  </direction>
  <note><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
  </measure></part></score-partwise>`;
  const result = parseMusicXmlText(xml);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const d = result.source.parts[0].measures[0].items.find((x) => x.kind === "direction");
  assert.ok(d);
  assert.equal(d.tempo, 96);
  assert.equal(d.soundDynamics, 54.44);
  assert.equal(d.staff, 1);
  assert.equal(d.wedges[0].type, "crescendo");
  assert.equal(d.wedges[0].number, 1);
  assert.equal(d.wedges[0].attributes["default-y"], "-88.04");
  assert.equal(d.pedals[0].type, "start");
  assert.equal(d.pedals[0].number, 2);
  assert.equal(d.pedals[0].line, "yes");
  assert.equal(d.metronomes[0].beatUnit, "quarter");
  assert.equal(d.metronomes[0].beatUnitDots, 0);
  assert.equal(d.metronomes[0].perMinute, "96");
  assert.deepEqual(d.otherTypes, []);
});

test("R1 parser keeps unknown direction-types generic", () => {
  const xml = `<?xml version="1.0"?><score-partwise version="3.1">
  <part-list><score-part id="P1"><part-name>R1</part-name></score-part></part-list>
  <part id="P1"><measure number="1"><attributes><divisions>1</divisions></attributes>
  <direction><direction-type><rehearsal>A</rehearsal></direction-type></direction>
  <note><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
  </measure></part></score-partwise>`;
  const result = parseMusicXmlText(xml);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const d = result.source.parts[0].measures[0].items.find((x) => x.kind === "direction");
  assert.ok(d);
  assert.deepEqual(d.otherTypes, ["rehearsal"]);
  assert.deepEqual(d.wedges, []);
  assert.deepEqual(d.pedals, []);
  assert.deepEqual(d.metronomes, []);
});

