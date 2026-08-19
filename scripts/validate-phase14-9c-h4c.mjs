import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

async function text(relativePath) {
  return readFile(
    path.join(root, relativePath),
    "utf8",
  );
}

const fixture = JSON.parse(
  await text(
    "packages/music/spec/mbc-2015/h4c-full-measure-in-accord-conformance.json",
  ),
);

const h4b = JSON.parse(
  await text(
    "docs/music-braille/phase14-9c-h4b-generic-midi-in-accord-profile.json",
  ),
);

assert.equal(fixture.status, "frozen");
assert.equal(fixture.source.code, "BANA-MBC-2015");
assert.equal(fixture.profileId, "GENERIC_MIDI_HIGH_TO_LOW_IN_ACCORD_V1");
assert.equal(fixture.signs.fullMeasureInAccordBrf, "<>");
assert.equal(fixture.signs.transcriberAddedRestPrefixBrf, '"');
assert.deepEqual(fixture.syntheticCase.expectedActionAnchors, [64, 60]);
assert.equal(fixture.syntheticCase.expectedBrf, '#d4 "v"$"u<>"y');
assert.equal(fixture.claims.originalHandAssignment, false);
assert.equal(fixture.claims.originalVoiceNumbering, false);
assert.equal(fixture.claims.silentOverlapTrimming, false);
assert.equal(fixture.claims.fakeSourcePartSplitting, false);
assert.equal(h4b.status, "frozen");
assert.equal(h4b.profileId, fixture.profileId);

const notationTypes = await text("packages/music/src/notation-types.ts");
const builder = await text("packages/music/src/notation-builder.ts");
const atomic = await text("packages/music/src/music-braille-atomic-encoder.ts");
const stateful = await text("packages/music/src/music-braille-stateful-encoder.ts");
const bridge = await text("packages/music/src/midi-to-braille.ts");

for (const marker of [
  "NotationFullMeasureInAccord",
  "NotationInAccordAction",
  "transcriberAdded?: true",
]) {
  assert.ok(notationTypes.includes(marker), `Missing notation marker: ${marker}`);
}

for (const marker of [
  "GENERIC_MIDI_IN_ACCORD_PROFILE_ID",
  "partitionMeasureActions",
  "INFERRED_MIDI_VOICE_PARTITION",
  "IN_ACCORD_ORDER_CANONICALIZED_NO_STAFF",
  "TRANSCRIBER_ADDED_IN_ACCORD_REST",
  "Polyphony occurs in an incomplete final measure",
]) {
  assert.ok(builder.includes(marker), `Missing builder marker: ${marker}`);
}

assert.ok(
  builder.includes(
    "Independently-starting overlapping notes would require inferred notation voices.",
  ),
  "Default notation-builder fail-closed profile must remain available.",
);

assert.ok(atomic.includes('return "<>"'));
assert.ok(atomic.includes("transcriberAddedRestPrefixBrf"));
assert.ok(stateful.includes('"full-measure-in-accord"'));
assert.ok(stateful.includes("fullMeasureInAccordBrf"));
assert.ok(stateful.includes("transcriberAddedRestPrefixBrf"));
assert.ok(bridge.includes("GENERIC_MIDI_IN_ACCORD_PROFILE_ID"));
assert.ok(bridge.includes("StatefulFullMeasureInAccordEvent"));
assert.equal(
  bridge.includes("SOURCE_PARTS_NEWLINE_TRANSPORT_V2"),
  false,
);

console.log("PHASE 14.9c H4C FULL-MEASURE IN-ACCORD: PASS");
console.log("BANA construct                  : FULL-MEASURE IN-ACCORD / <>");
console.log("Generic MIDI profile            : GENERIC_MIDI_HIGH_TO_LOW_IN_ACCORD_V1");
console.log("Same-onset material             : CHORD");
console.log("Independent overlap             : DETERMINISTIC DERIVED ACTIONS");
console.log("Original hand/voice claim       : NONE");
console.log("Transcriber-added rests         : DOT-5 PREFIX");
console.log("Default builder profile         : STILL FAIL CLOSED");
console.log("Incomplete polyphonic measure   : FAIL CLOSED / PART-MEASURE DEFERRED");
console.log("Source-part transport           : UNCHANGED / NEWLINE ONLY BETWEEN SOURCE PARTS");
console.log("MusicXML                        : RESERVED FOR PHASE 19");
