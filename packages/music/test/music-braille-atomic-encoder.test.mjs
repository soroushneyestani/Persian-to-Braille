import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  BRAILLE_ASCII_6DOT_DOTS,
  brailleAsciiCharToUnicode,
  brfAsciiToUnicode,
  dotsToUnicodeBraille,
} from "../dist/braille-ascii.js";

import {
  encodeAtomicChord,
  encodeAtomicNote,
  encodeAtomicRest,
  encodeInterval,
  encodeKeySignature,
  encodeMeasureSeparator,
  encodeSimpleMeter,
  encodeTie,
  encodeTripletIndicator,
  fullMeasureInAccordBrf,
  keySignatureBrf,
  transcriberAddedRestPrefixBrf,
  simpleMeterBrf,
} from "../dist/music-braille-atomic-encoder.js";

const packageRoot = path.resolve(process.cwd());
const conformancePath = path.join(packageRoot, "spec", "mbc-2015", "conformance-seed.json");

test("six-dot Braille ASCII table has 64 unique canonical patterns", () => {
  const entries = Object.entries(BRAILLE_ASCII_6DOT_DOTS);
  assert.equal(entries.length, 64);
  const patterns = new Set(entries.map(([, dots]) => dotsToUnicodeBraille(dots)));
  assert.equal(patterns.size, 64);
});

test("known Braille ASCII cells convert to exact Unicode Braille Patterns", () => {
  assert.equal(brailleAsciiCharToUnicode("#"), "⠼");
  assert.equal(brailleAsciiCharToUnicode('"'), "⠐");
  assert.equal(brailleAsciiCharToUnicode("?"), "⠹");
  assert.equal(brailleAsciiCharToUnicode("%"), "⠩");
  assert.equal(brailleAsciiCharToUnicode("<"), "⠣");
  assert.equal(brailleAsciiCharToUnicode("*"), "⠡");
  assert.equal(brailleAsciiCharToUnicode("2"), "⠆");
  assert.equal(brfAsciiToUnicode("@c"), "⠈⠉");
  assert.equal(brfAsciiToUnicode(".c"), "⠨⠉");
  assert.equal(brfAsciiToUnicode(" "), "⠀");
});

test("all 68 authoritative Phase 14.5b BRF fixtures are convertible", () => {
  const seed = JSON.parse(fs.readFileSync(conformancePath, "utf8"));
  assert.equal(seed.cases.length, 68);
  for (const fixture of seed.cases) {
    const unicode = brfAsciiToUnicode(fixture.expectedBrf);
    assert.ok(unicode.length > 0, fixture.id);
    for (const ch of unicode) {
      const cp = ch.codePointAt(0);
      assert.ok(cp >= 0x2800 && cp <= 0x283f, `${fixture.id} emitted non-six-dot Unicode cell`);
    }
  }
});

test("first visible Music Braille note output: C4 quarter", () => {
  const result = encodeAtomicNote({ step: "C", scientificOctave: 4, value: "quarter" });
  assert.equal(result.brf, '"?');
  assert.equal(result.unicode, "⠐⠹");
});

test("explicit accidental, dotted value and single tie follow frozen emission order", () => {
  const result = encodeAtomicNote({
    step: "C", scientificOctave: 4, value: "quarter", accidental: "sharp", augmentationDots: 1, tie: true,
  });
  assert.equal(result.brf, '%"?\'@c');
  assert.equal(result.unicode, "⠩⠐⠹⠄⠈⠉");
});

test("dotted E4 half is encoded exactly", () => {
  const result = encodeAtomicNote({ step: "E", scientificOctave: 4, value: "half", augmentationDots: 1 });
  assert.equal(result.brf, '"p\'');
  assert.equal(result.unicode, "⠐⠏⠄");
});

test("quarter rest is emitted as real Unicode Braille", () => {
  const result = encodeAtomicRest({ value: "quarter" });
  assert.equal(result.brf, "v");
  assert.equal(result.unicode, "⠧");
});

test("simple key signatures use frozen MBC numeric policy", () => {
  assert.equal(keySignatureBrf(3), "%%%");
  assert.equal(encodeKeySignature(3).unicode, "⠩⠩⠩");
  assert.equal(keySignatureBrf(-4), "#d<");
  assert.equal(encodeKeySignature(-4).unicode, "⠼⠙⠣");
});

test("simple meter 4/4 emits canonical numeric Music Braille", () => {
  assert.equal(simpleMeterBrf(4, 4), "#d4");
  assert.equal(encodeSimpleMeter(4, 4).unicode, "⠼⠙⠲");
});

test("multi-digit meter serialization uses upper numerator and lower denominator cells", () => {
  assert.equal(simpleMeterBrf(11, 16), "#aa16");
  assert.equal(encodeSimpleMeter(11, 16).unicode, "⠼⠁⠁⠂⠖");
});

test("triplet, interval, tie and measure primitives emit Unicode cells", () => {
  assert.equal(encodeTripletIndicator().unicode, "⠆");
  assert.equal(encodeInterval(3).unicode, "⠬");
  assert.equal(encodeInterval(5).unicode, "⠔");
  assert.equal(encodeTie("single").unicode, "⠈⠉");
  assert.equal(encodeTie("chord").unicode, "⠨⠉");
  assert.equal(encodeMeasureSeparator().unicode, "⠀");
});

test("atomic C-major chord from written G4 + descending 3rd/5th is visible Braille", () => {
  const result = encodeAtomicChord({
    writtenNote: { step: "G", scientificOctave: 4, value: "quarter" },
    intervals: [{ diatonicInterval: 3 }, { diatonicInterval: 5 }],
  });
  assert.equal(result.brf, '"\\+9');
  assert.equal(result.unicode, "⠐⠳⠬⠔");
});

test("unsupported atomic inputs fail closed", () => {
  assert.throws(() => brfAsciiToUnicode("€"), /MUSIC_BRAILLE_ASCII_ERROR/);
  assert.throws(() => encodeSimpleMeter(4, 3), /MUSIC_BRAILLE_ENCODER_ERROR/);
  assert.throws(() => encodeKeySignature(8), /MUSIC_BRAILLE_ENCODER_ERROR/);
});

test("full-measure in-accord and transcriber-added rest prefix use frozen BANA BRF signs", () => {
  assert.equal(fullMeasureInAccordBrf(), "<>");
  assert.equal(transcriberAddedRestPrefixBrf(), '"');
});
