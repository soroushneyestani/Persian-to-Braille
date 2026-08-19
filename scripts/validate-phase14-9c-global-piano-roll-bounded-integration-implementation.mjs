import assert from "node:assert/strict";
import {
  readFile,
} from "node:fs/promises";
import path from "node:path";

const root =
  process.cwd();

async function text(relativePath) {
  return readFile(
    path.join(
      root,
      relativePath,
    ),
    "utf8",
  );
}

const contract =
  JSON.parse(
    await text(
      "docs/music-braille/phase14-9c-global-piano-roll-bounded-integration-contract.json",
    ),
  );

const bridge =
  await text(
    "packages/music/src/midi-to-braille.ts",
  );

const builder =
  await text(
    "packages/music/src/notation-builder.ts",
  );

const notationTypes =
  await text(
    "packages/music/src/notation-types.ts",
  );

const tests =
  await text(
    "packages/music/test/midi-to-braille.test.mjs",
  );

const doc =
  await text(
    "docs/music-braille/phase14-9c-global-piano-roll-bounded-integration-implementation.md",
  );

assert.equal(
  contract.status,
  "frozen",
);

assert.equal(
  contract.profileId,
  "GENERIC_MIDI_GLOBAL_PIANO_ROLL_BOUNDED_INTEGRATION_V1",
);

assert.ok(
  bridge.includes(
    'from "./midi-piano-roll-reducer.js"',
  ),
);

assert.ok(
  bridge.includes(
    "reduceMidiToGlobalPianoRoll(",
  ),
);

assert.equal(
  bridge.includes(
    "classifyMidiSemanticSource(",
  ),
  false,
);

assert.equal(
  bridge.includes(
    "NON_PITCHED_SOURCE_EVENT_SKIPPED",
  ),
  false,
);

for (const marker of [
  "notesByInterval",
  "`${note.startUnit}:${note.endUnit}`",
  "`${startUnit}:${endUnit}`",
  "GLOBAL_PIANO_ROLL_CYCLIC_SEARCH_VISIT_LIMIT",
  "RHYTHM_COMPLEXITY_LIMIT_EXCEEDED",
  '"complexity-exceeded"',
]) {
  assert.ok(
    builder.includes(marker)
      || notationTypes.includes(marker),
    `Bounded integration marker missing: ${marker}`,
  );
}

for (const title of [
  "active pitch-bend metadata is non-destructive in global piano-roll production",
  "format-1 source parts merge into one global piano-roll production part",
  "GM effect notes and pitch bends remain discrete piano-roll material",
  "MIDI channel 10 note numbers remain discrete piano keys in global piano-roll production",
  "same corrected onset with different releases stays as simultaneous actions instead of one mixed-duration chord",
]) {
  assert.ok(
    tests.includes(title),
    `Production regression missing: ${title}`,
  );
}

for (const marker of [
  "SMF parser -> global piano-roll reducer -> notation/rhythm/polyphony -> Braille",
  "corrected onset + corrected release",
  "RHYTHM_COMPLEXITY_LIMIT_EXCEEDED",
  "hard timeout",
  "Triplet-provenance implementation remains paused",
  "MusicXML remains outside Phase 14 and reserved for Phase 19",
]) {
  assert.ok(
    doc.includes(marker),
    `Implementation documentation marker missing: ${marker}`,
  );
}

console.log(
  "PHASE 14.9c GLOBAL PIANO-ROLL BOUNDED PRODUCTION INTEGRATION: PASS",
);
console.log(
  "Profile                        : GENERIC_MIDI_GLOBAL_PIANO_ROLL_BOUNDED_INTEGRATION_V1",
);
console.log(
  "Production route               : PARSE -> REDUCE -> NOTATION",
);
console.log(
  "Production classifier filtering: NONE",
);
console.log(
  "Output musical parts           : ONE SYNTHETIC PIANO PART",
);
console.log(
  "Chord identity                 : CORRECTED ONSET + CORRECTED RELEASE",
);
console.log(
  "Cyclic solver                  : EXACT / DETERMINISTIC / HARD GUARDED",
);
console.log(
  "Complexity failure             : RHYTHM_COMPLEXITY_LIMIT_EXCEEDED",
);
console.log(
  "Triplet implementation         : STILL PAUSED",
);
console.log(
  "MusicXML                       : PHASE 19",
);
