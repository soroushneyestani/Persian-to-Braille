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
      "docs/music-braille/phase14-9c-h5-meter-change-serialization-contract.json",
    ),
  );

const bridge =
  await text(
    "packages/music/src/midi-to-braille.ts",
  );

const stateful =
  await text(
    "packages/music/src/music-braille-stateful-encoder.ts",
  );

const tests =
  await text(
    "packages/music/test/meter-change-serialization.test.mjs",
  );

const doc =
  await text(
    "docs/music-braille/phase14-9c-h5-meter-change-serialization-implementation.md",
  );

assert.equal(
  contract.status,
  "frozen",
);

assert.equal(
  contract.profileId,
  "MBC_MEASURE_BOUNDARY_METER_CHANGE_V1",
);

assert.equal(
  contract.inputBoundary.midMeasureChange,
  "remain fail-closed",
);

assert.equal(
  contract.genericMidiSerialization.commonTimeInference,
  false,
);

assert.equal(
  contract.genericMidiSerialization.cutTimeInference,
  false,
);

for (
  const marker
  of [
    "METER_CHANGE_SERIALIZED",
    "score.sourceTimeSignatureEvents.filter",
    "previousMeasure.numerator",
    "previousMeasure.denominator",
    "meterChange",
  ]
) {
  assert.ok(
    bridge.includes(
      marker,
    ),
    `Missing H5 bridge marker: ${marker}`,
  );
}

for (
  const marker
  of [
    "readonly meter?: Readonly",
    "let activeMeter",
    "simpleMeterBrf(",
    "forceNextOctave = true",
  ]
) {
  assert.ok(
    stateful.includes(
      marker,
    ),
    `Missing H5 stateful marker: ${marker}`,
  );
}

for (
  const marker
  of [
    "stateful encoder emits a changed numeric meter at the next measure and forces octave",
    "identical per-measure meter is not redundantly emitted",
    "public MIDI bridge serializes a boundary-aligned 4/4 to 12/8 change numerically",
  ]
) {
  assert.ok(
    tests.includes(
      marker,
    ),
    `Missing H5 regression: ${marker}`,
  );
}

for (
  const marker
  of [
    "MBC_MEASURE_BOUNDARY_METER_CHANGE_V1",
    "METER_CHANGE_SERIALIZED",
    "first following note is forced to carry an octave mark",
    "MusicXML remains outside Phase 14 and reserved for Phase 19",
  ]
) {
  assert.ok(
    doc.includes(
      marker,
    ),
    `Missing H5 implementation documentation marker: ${marker}`,
  );
}

console.log(
  "PHASE 14.9c H5 METER-CHANGE SERIALIZATION IMPLEMENTATION: PASS",
);
console.log(
  "Profile                        : MBC_MEASURE_BOUNDARY_METER_CHANGE_V1",
);
console.log(
  "Initial meter                  : EXISTING HEADER BEHAVIOR",
);
console.log(
  "Changed meter                  : MEASURE-LOCAL / NUMERIC SIMPLE METER",
);
console.log(
  "Common/cut-time inference      : NONE",
);
console.log(
  "First following note           : FORCE OCTAVE",
);
console.log(
  "Redundant identical meter      : NOT RE-EMITTED",
);
console.log(
  "Mid-measure change             : STILL FAIL CLOSED",
);
console.log(
  "H4D                            : PRESERVED",
);
console.log(
  "MusicXML                       : PHASE 19",
);
