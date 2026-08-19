import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();

async function text(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

async function json(relativePath) {
  return JSON.parse(await text(relativePath));
}

async function walk(dir) {
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...await walk(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

const audit = await json(
  "docs/architecture/phase-14.7a-midi-to-braille-sdk-bridge-audit.json",
);
assert.equal(
  audit.decision,
  "READY_FOR_PHASE14_7B_END_TO_END_MIDI_BRAILLE_BRIDGE_AND_SDK_FACADE",
);
assert.deepEqual(audit.blockers, []);

const musicPackage = await json("packages/music/package.json");
const sdkPackage = await json("packages/sdk/package.json");
const microsoftPackage = await json("integrations/microsoft365/package.json");

assert.equal(musicPackage.name, "@persian-braille/music");
assert.equal(musicPackage.private, true);
assert.deepEqual(musicPackage.dependencies, {});
assert.equal(sdkPackage.name, "@persian-braille/sdk");
assert.equal(sdkPackage.private, false);
assert.equal(
  sdkPackage.dependencies["@persian-braille/music"],
  "workspace:*",
);
assert.deepEqual(
  sdkPackage.exports,
  {
    ".": {
      types: "./dist/index.d.ts",
      import: "./dist/index.js",
    },
  },
);
assert.equal(
  Object.hasOwn(microsoftPackage.dependencies ?? {}, "@persian-braille/music"),
  false,
);
assert.equal(
  Object.hasOwn(microsoftPackage.dependencies ?? {}, "@persian-braille/sdk"),
  true,
);

const bridge = await text("packages/music/src/midi-to-braille.ts");
for (const marker of [
  "parseStandardMidiFile",
  "buildNotationScore",
  "encodeStatefulScore",
  "MIDI_TO_MBC2015_UNICODE_V1",
  "SOURCE_PARTS_NEWLINE_TRANSPORT_V1",
  "PITCH_SPELLING_CANONICALIZED",
  "TEMPO_METADATA_ABSENT",
  "KEY_SIGNATURE_ABSENT",
  "LOSSY_MIDI_TO_NOTATION_RECONSTRUCTION",
]) {
  assert.ok(bridge.includes(marker), `missing bridge marker: ${marker}`);
}

const parserTypes = await text("packages/music/src/types.ts");
const parser = await text("packages/music/src/smf-parser.ts");
const classifier = await text("packages/music/src/midi-source-classifier.ts");
assert.ok(parserTypes.includes("MidiProgramChangeEvent"));
assert.ok(parserTypes.includes("MidiPitchBendEvent"));
assert.ok(parser.includes("programChangeEvents.push"));
assert.ok(parser.includes("pitchBendEvents.push"));
assert.equal(parser.includes("bendValue !== 8192"), false);
assert.ok(classifier.includes("UNSUPPORTED_PITCH_BEND"));
assert.ok(classifier.includes("NON_PITCHED_PITCH_BEND_SKIPPED"));

const musicIndex = await text("packages/music/src/index.ts");
for (const marker of [
  "translateMidiToBraille",
  "MidiToBrailleResult",
  "MIDI_TO_BRAILLE_BRIDGE_ID",
]) {
  assert.ok(musicIndex.includes(marker), `music root missing: ${marker}`);
}

const sdkIndex = await text("packages/sdk/src/index.ts");
const sdkMusicApi = await text("packages/sdk/src/music-public-api.ts");
const sdkMusicTranslator = await text("packages/sdk/src/music-translator.ts");
for (const marker of [
  "MusicBrailleMidiTranslationError",
  "createMusicBrailleMidiTranslator",
  "MusicBrailleMidiTranslator",
  "MusicBrailleMidiTranslationResult",
]) {
  assert.ok(sdkIndex.includes(marker), `SDK root missing: ${marker}`);
}

for (const forbidden of [
  "MidiSemanticSource",
  "NotationScore",
  "StatefulScoreInput",
  "encodeStatefulScore",
  "parseStandardMidiFile",
  "buildNotationScore",
]) {
  assert.equal(
    sdkMusicApi.includes(forbidden),
    false,
    `SDK public music contract leaked engine type: ${forbidden}`,
  );
}
assert.ok(sdkMusicTranslator.includes("@persian-braille/music"));

const exactUnicode = "⠼⠙⠲⠀⠐⠹⠱⠏";
assert.ok((await text("packages/music/test/midi-to-braille.test.mjs")).includes(exactUnicode));
assert.ok((await text("packages/sdk/test/music-public-api.test.mjs")).includes(exactUnicode));

const microsoftSrcRoot = path.join(root, "integrations/microsoft365/src");
for (const file of await walk(microsoftSrcRoot)) {
  if (!/\.(?:ts|tsx|js|mjs)$/.test(file)) continue;
  const source = await readFile(file, "utf8");
  assert.equal(
    source.includes("@persian-braille/music"),
    false,
    `Microsoft365 direct music import leaked: ${path.relative(root, file)}`,
  );
}

const sdkRoot = await import(
  pathToFileURL(path.join(root, "packages/sdk/dist/index.js")).href,
);

for (const runtime of [
  "MusicBrailleMidiTranslationError",
  "PersianBrailleReverseTranslationError",
  "PersianBrailleTranslationError",
  "createMusicBrailleMidiTranslator",
  "createPersianBrailleReverseTranslator",
  "createPersianBrailleTranslator",
]) {
  assert.equal(typeof sdkRoot[runtime], "function", `SDK runtime export missing: ${runtime}`);
}

for (const forbidden of [
  "translateMidiToBraille",
  "parseStandardMidiFile",
  "buildNotationScore",
  "encodeStatefulScore",
]) {
  assert.equal(forbidden in sdkRoot, false, `engine runtime leaked through SDK: ${forbidden}`);
}

const docs = await text("docs/music-braille/phase14-7b-midi-to-braille-sdk-facade.md");
for (const marker of [
  "Phase 14.8",
  "Phase 14.9",
  "Phase 14.10",
  "MusicXML: Phase 19",
]) {
  assert.ok(docs.includes(marker), `documentation marker missing: ${marker}`);
}

const boundaryValidator = await text("tools/architecture/validate-package-boundaries.mjs");
assert.ok(boundaryValidator.includes('"@persian-braille/music"'));
assert.ok(boundaryValidator.includes('new Set(["@persian-braille/core", "@persian-braille/music"])'));

console.log("PHASE 14.7b MIDI -> BRAILLE END-TO-END + PUBLIC SDK FACADE: PASS");
console.log("Bridge: parseStandardMidiFile -> buildNotationScore -> encodeStatefulScore");
console.log("Exact MIDI fixture Unicode    : ⠼⠙⠲⠀⠐⠹⠱⠏");
console.log("Pitch bend                    : SCOPED FAIL CLOSED AFTER CLASSIFICATION");
console.log("SDK root facade               : PRESENT");
console.log("Microsoft365 direct music     : NONE");
console.log("Package boundary graph        : music -> none; sdk -> core + music");
console.log("Music package publication     : DEFERRED TO PHASE 14.10");
console.log("MusicXML                      : RESERVED FOR PHASE 19");
