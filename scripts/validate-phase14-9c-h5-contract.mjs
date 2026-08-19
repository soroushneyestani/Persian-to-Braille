import assert from "node:assert/strict";
import {
  readFile,
} from "node:fs/promises";
import path from "node:path";

const root =
  process.cwd();

async function text(
  relativePath,
) {
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

const doc =
  await text(
    "docs/music-braille/phase14-9c-h5-meter-change-serialization-contract.md",
  );

const smoke =
  JSON.parse(
    await text(
      "stage14-9c-rhythm-coherence-post-implementation-smoke.json",
    ),
  );

assert.equal(
  smoke.decision,
  "READY_FOR_PHASE14_9C_H4D_PART_MEASURE_IN_ACCORD_AND_H5_METER_SERIALIZATION_DESIGN",
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
  contract.genericMidiSerialization.strategy,
  "numeric-simple-meter",
);

assert.equal(
  contract.genericMidiSerialization.commonTimeInference,
  false,
);

assert.equal(
  contract.genericMidiSerialization.cutTimeInference,
  false,
);

assert.deepEqual(
  contract.genericMidiSerialization.supportedDenominators,
  [1, 2, 4, 8, 16, 32, 64],
);

assert.equal(
  contract.genericMidiSerialization.firstFollowingNote,
  "force octave mark",
);

assert.equal(
  contract.statefulEncoderExtension.measureMayCarryMeterChange,
  true,
);

assert.equal(
  contract.statefulEncoderExtension.existingNumericMeterEmitterReused,
  true,
);

assert.equal(
  contract.diagnostics.serializedMeterChange,
  "METER_CHANGE_SERIALIZED",
);

assert.equal(
  contract.realWorldAcceptance.sourceChange.tick,
  3072,
);

assert.equal(
  contract.realWorldAcceptance.sourceChange.notationUnit,
  768,
);

assert.equal(
  contract.realWorldAcceptance.sourceChange.to,
  "12/8",
);

assert.equal(
  contract.decision,
  "READY_FOR_PHASE14_9C_H5_METER_CHANGE_SERIALIZATION_IMPLEMENTATION",
);

for (
  const marker
  of [
    "MBC_MEASURE_BOUNDARY_METER_CHANGE_V1",
    "4/4@0u -> 12/8@768u",
    "METER_CHANGE_SERIALIZED",
    "mid-measure change remains fail-closed",
    "READY_FOR_PHASE14_9C_H5_METER_CHANGE_SERIALIZATION_IMPLEMENTATION",
  ]
) {
  assert.ok(
    doc.includes(
      marker,
    ),
    `Missing H5 documentation marker: ${marker}`,
  );
}

console.log(
  "PHASE 14.9c H5 METER-CHANGE SERIALIZATION CONTRACT: PASS",
);

console.log(
  "Profile                        : MBC_MEASURE_BOUNDARY_METER_CHANGE_V1",
);

console.log(
  "Change location                : MEASURE BOUNDARY ONLY",
);

console.log(
  "Serialization                  : EXISTING NUMERIC SIMPLE METER",
);

console.log(
  "4/4 common-time inference      : NONE",
);

console.log(
  "2/2 cut-time inference         : NONE",
);

console.log(
  "First following note           : FORCE OCTAVE",
);

console.log(
  "Mid-measure change             : FAIL CLOSED",
);

console.log(
  "d_HO0606 target                : 4/4 -> 12/8 @ 768u",
);
