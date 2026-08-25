/* PHASE16_6_MXL_CLOSURE */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

import {
  loadMusicXmlFromMxl,
  parseMusicXmlBytes,
} from "../dist/index.js";

const SCORE = `<?xml version="1.0" encoding="UTF-8"?>
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
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note>
        <pitch><step>C</step><octave>4</octave></pitch>
        <duration>1</duration><type>quarter</type>
      </note>
    </measure>
  </part>
</score-partwise>`;

function container(fullPath = "score.xml") {
  return `<?xml version="1.0" encoding="UTF-8"?>
<container>
  <rootfiles>
    <rootfile full-path="${fullPath}" media-type="application/vnd.recordare.musicxml+xml"/>
  </rootfiles>
</container>`;
}

function u16(v) {
  return Buffer.from([v & 255, (v >>> 8) & 255]);
}

function u32(v) {
  return Buffer.from([
    v & 255,
    (v >>> 8) & 255,
    (v >>> 16) & 255,
    (v >>> 24) & 255,
  ]);
}

function zip(entries) {
  const locals = [];
  const centrals = [];
  let offset = 0;

  for (const entry of entries) {
    const centralName = Buffer.from(entry.centralName ?? entry.name, "utf8");
    const localName = Buffer.from(entry.localName ?? entry.name, "utf8");
    const raw = Buffer.from(entry.data ?? "");
    const defaultMethod = entry.deflate ? 8 : 0;
    const localMethod = entry.localMethod ?? entry.method ?? defaultMethod;
    const centralMethod = entry.centralMethod ?? entry.method ?? defaultMethod;
    const localFlags = entry.localFlags ?? entry.flags ?? 0;
    const centralFlags = entry.centralFlags ?? entry.flags ?? 0;

    const compressed = entry.deflate
      ? zlib.deflateRawSync(raw)
      : raw;

    const localCompressedSize =
      entry.localCompressedSize ?? entry.compressedSize ?? compressed.length;
    const centralCompressedSize =
      entry.centralCompressedSize ?? entry.compressedSize ?? compressed.length;
    const localUncompressedSize =
      entry.localUncompressedSize ?? entry.uncompressedSize ?? raw.length;
    const centralUncompressedSize =
      entry.centralUncompressedSize ?? entry.uncompressedSize ?? raw.length;

    const local = Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x03, 0x04]),
      u16(20),
      u16(localFlags),
      u16(localMethod),
      u16(0),
      u16(0),
      u32(0),
      u32(localCompressedSize),
      u32(localUncompressedSize),
      u16(localName.length),
      u16(0),
      localName,
      compressed,
    ]);
    locals.push(local);

    const central = Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x01, 0x02]),
      u16(20),
      u16(20),
      u16(centralFlags),
      u16(centralMethod),
      u16(0),
      u16(0),
      u32(0),
      u32(centralCompressedSize),
      u32(centralUncompressedSize),
      u16(centralName.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      centralName,
    ]);
    centrals.push(central);
    offset += local.length;
  }

  const centralDir = Buffer.concat(centrals);
  const eocd = Buffer.concat([
    Buffer.from([0x50, 0x4b, 0x05, 0x06]),
    u16(0),
    u16(0),
    u16(entries.length),
    u16(entries.length),
    u32(centralDir.length),
    u32(offset),
    u16(0),
  ]);

  return Buffer.concat([...locals, centralDir, eocd]);
}

function validArchive({
  containerDeflate = false,
  scoreDeflate = false,
} = {}) {
  return zip([
    {
      name: "META-INF/container.xml",
      data: container(),
      deflate: containerDeflate,
    },
    {
      name: "score.xml",
      data: SCORE,
      deflate: scoreDeflate,
    },
  ]);
}

async function expectFailure(archive, code) {
  const result = await loadMusicXmlFromMxl(new Uint8Array(archive));
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.code, code);
  }
}

test("stored MXL container and stored rootfile load successfully", async () => {
  const loaded = await loadMusicXmlFromMxl(
    new Uint8Array(validArchive()),
  );
  assert.equal(loaded.ok, true);
  if (!loaded.ok) return;
  assert.equal(loaded.rootfilePath, "score.xml");
  assert.equal(parseMusicXmlBytes(loaded.xml).ok, true);
});

test("deflated MXL container and rootfile load successfully", async () => {
  const loaded = await loadMusicXmlFromMxl(
    new Uint8Array(validArchive({
      containerDeflate: true,
      scoreDeflate: true,
    })),
  );
  assert.equal(loaded.ok, true);
  if (!loaded.ok) return;
  assert.equal(parseMusicXmlBytes(loaded.xml).ok, true);
});

test("real Beethoven MXL loads through hardened container loader", async (t) => {
  const corpus = new URL("../../../test-data/musicxml/downloads-import/Beethoven_Symphony_No._5_1st_movement_Piano_solo.mxl", import.meta.url);
  if (!fs.existsSync(corpus)) {
    t.skip("Beethoven corpus not present.");
    return;
  }

  const loaded = await loadMusicXmlFromMxl(
    new Uint8Array(fs.readFileSync(corpus)),
  );
  assert.equal(loaded.ok, true);
  if (!loaded.ok) return;

  assert.equal(loaded.rootfilePath.length > 0, true);
  const parsed = parseMusicXmlBytes(loaded.xml);
  assert.equal(parsed.ok, true);
});

test("invalid data with no ZIP central directory fails closed", async () => {
  await expectFailure(Buffer.from("not a zip"), "INVALID_ZIP");
});

test("MXL without META-INF/container.xml fails closed", async () => {
  const archive = zip([{name: "score.xml", data: SCORE}]);
  await expectFailure(archive, "MISSING_CONTAINER");
});

test("container without rootfile full-path fails closed", async () => {
  const archive = zip([
    {
      name: "META-INF/container.xml",
      data: `<?xml version="1.0"?><container><rootfiles><rootfile/></rootfiles></container>`,
    },
  ]);
  await expectFailure(archive, "MISSING_ROOTFILE");
});

test("declared rootfile that is absent fails closed", async () => {
  const archive = zip([
    {
      name: "META-INF/container.xml",
      data: container("missing.xml"),
    },
  ]);
  await expectFailure(archive, "ROOTFILE_NOT_FOUND");
});

test("unsafe rootfile path in container.xml fails closed", async () => {
  const archive = zip([
    {
      name: "META-INF/container.xml",
      data: container("../score.xml"),
    },
    {name: "score.xml", data: SCORE},
  ]);
  await expectFailure(archive, "UNSAFE_ZIP_PATH");
});

test("unsafe archive member path is rejected even when not selected", async () => {
  const archive = zip([
    {name: "META-INF/container.xml", data: container()},
    {name: "score.xml", data: SCORE},
    {name: "../evil.xml", data: "<evil/>"},
  ]);
  await expectFailure(archive, "ZIP_LIMIT_EXCEEDED");
});

test("duplicate normalized ZIP member names fail closed", async () => {
  const archive = zip([
    {name: "META-INF/container.xml", data: container()},
    {name: "score.xml", data: SCORE},
    {name: "score.xml", data: SCORE},
  ]);
  await expectFailure(archive, "INVALID_ZIP");
});

test("encrypted ZIP member flag fails closed", async () => {
  const archive = zip([
    {name: "META-INF/container.xml", data: container()},
    {name: "score.xml", data: SCORE, flags: 1},
  ]);
  await expectFailure(archive, "INVALID_ZIP");
});

test("local and central compression-method mismatch fails closed", async () => {
  const archive = zip([
    {name: "META-INF/container.xml", data: container()},
    {
      name: "score.xml",
      data: SCORE,
      localMethod: 0,
      centralMethod: 8,
    },
  ]);
  await expectFailure(archive, "INVALID_ZIP");
});

test("local and central member-name mismatch fails closed", async () => {
  const archive = zip([
    {name: "META-INF/container.xml", data: container()},
    {
      name: "score.xml",
      localName: "other.xml",
      centralName: "score.xml",
      data: SCORE,
    },
  ]);
  await expectFailure(archive, "INVALID_ZIP");
});

test("unsupported selected ZIP compression method fails closed", async () => {
  const archive = zip([
    {name: "META-INF/container.xml", data: container()},
    {name: "score.xml", data: SCORE, method: 12},
  ]);
  await expectFailure(archive, "UNSUPPORTED_ZIP_COMPRESSION");
});

test("more than 256 members hits frozen member-count limit", async () => {
  const entries = Array.from({length: 257}, (_, index) => ({
    name: `f${index}.txt`,
    data: "",
  }));
  const archive = zip(entries);
  await expectFailure(archive, "ZIP_LIMIT_EXCEEDED");
});

test("declared member larger than 32 MiB hits frozen member-size limit", async () => {
  const archive = zip([
    {
      name: "META-INF/container.xml",
      data: container(),
      uncompressedSize: 33 * 1024 * 1024,
      compressedSize: 33 * 1024 * 1024,
    },
  ]);
  await expectFailure(archive, "ZIP_LIMIT_EXCEEDED");
});

test("declared total uncompressed size above 64 MiB hits frozen total limit", async () => {
  const archive = zip([
    {
      name: "a",
      data: "",
      uncompressedSize: 24 * 1024 * 1024,
      compressedSize: 24 * 1024 * 1024,
    },
    {
      name: "b",
      data: "",
      uncompressedSize: 24 * 1024 * 1024,
      compressedSize: 24 * 1024 * 1024,
    },
    {
      name: "c",
      data: "",
      uncompressedSize: 24 * 1024 * 1024,
      compressedSize: 24 * 1024 * 1024,
    },
  ]);
  await expectFailure(archive, "ZIP_LIMIT_EXCEEDED");
});

test("declared compression ratio above 200 hits frozen ratio limit", async () => {
  const archive = zip([
    {
      name: "META-INF/container.xml",
      data: container(),
      uncompressedSize: 1000,
      compressedSize: 1,
    },
  ]);
  await expectFailure(archive, "ZIP_LIMIT_EXCEEDED");
});

test("deflate stream cannot expand beyond its declared uncompressed size", async () => {
  const bomb = "A".repeat(200_000);
  const compressed = zlib.deflateRawSync(Buffer.from(bomb));
  assert.equal(1000 / compressed.length < 200, true);

  const archive = zip([
    {name: "META-INF/container.xml", data: container()},
    {
      name: "score.xml",
      data: bomb,
      deflate: true,
      uncompressedSize: 1000,
    },
  ]);
  await expectFailure(archive, "ZIP_LIMIT_EXCEEDED");
});

test("deflate stream with fewer bytes than declared is invalid ZIP data", async () => {
  const raw = "abcde";
  const compressed = zlib.deflateRawSync(Buffer.from(raw));
  assert.equal(500 / compressed.length < 200, true);

  const archive = zip([
    {name: "META-INF/container.xml", data: container()},
    {
      name: "score.xml",
      data: raw,
      deflate: true,
      uncompressedSize: 500,
    },
  ]);
  await expectFailure(archive, "INVALID_ZIP");
});
