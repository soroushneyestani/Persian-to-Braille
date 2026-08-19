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
      "docs/music-braille/phase14-9c-h4d-part-measure-in-accord-contract.json",
    ),
  );

const doc =
  await text(
    "docs/music-braille/phase14-9c-h4d-part-measure-in-accord-contract.md",
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
  "GENERIC_MIDI_INCOMPLETE_MEASURE_PART_IN_ACCORD_V1",
);

assert.equal(
  contract.signs.partMeasureInAccordBrf,
  '"1',
);

assert.equal(
  contract.signs.measureDivisionBrf,
  ".k",
);

assert.equal(
  contract.authoritativeRules.equalTotalNoteValueOnEachSide,
  true,
);

assert.equal(
  contract.authoritativeRules.incompleteMeasureRequiresPartMeasureForm,
  true,
);

assert.equal(
  contract.authoritativeRules.partMeasureMayNotBeFurtherSubdivided,
  true,
);

assert.equal(
  contract.genericMidiScope.singleSection,
  true,
);

assert.equal(
  contract.genericMidiScope.multiplePartMeasureSections,
  "deferred",
);

assert.equal(
  contract.actionPolicy.rhythmProfile,
  "GENERIC_MIDI_SHARED_BOUNDARY_RHYTHM_V1",
);

assert.equal(
  contract.serialization.forceOctaveAfterPartMeasureSign,
  true,
);

assert.equal(
  contract.accidentalState.isolateAcrossPartMeasureInAccordSign,
  true,
);

assert.equal(
  contract.failurePolicy.silentOverlapTrim,
  false,
);

assert.equal(
  contract.failurePolicy.fakeNewlineParts,
  false,
);

assert.equal(
  contract.decision,
  "READY_FOR_PHASE14_9C_H4D_PART_MEASURE_IN_ACCORD_IMPLEMENTATION",
);

for (
  const marker
  of [
    "GENERIC_MIDI_INCOMPLETE_MEASURE_PART_IN_ACCORD_V1",
    'part-measure in-accord: `"1`',
    "measure division: `.k`",
    "TRANSCRIBER_ADDED_IN_ACCORD_REST",
    "BANA §11.2",
    "READY_FOR_PHASE14_9C_H4D_PART_MEASURE_IN_ACCORD_IMPLEMENTATION",
  ]
) {
  assert.ok(
    doc.includes(
      marker,
    ),
    `Missing H4D documentation marker: ${marker}`,
  );
}

console.log(
  "PHASE 14.9c H4D PART-MEASURE IN-ACCORD CONTRACT: PASS",
);

console.log(
  "Profile                        : GENERIC_MIDI_INCOMPLETE_MEASURE_PART_IN_ACCORD_V1",
);

console.log(
  'Part-measure sign              : "1',
);

console.log(
  "Measure-division sign          : .k",
);

console.log(
  "Initial MIDI scope             : TERMINAL INCOMPLETE MEASURE / SINGLE SECTION",
);

console.log(
  "Equal action value             : REQUIRED",
);

console.log(
  "Added rests                    : DOT-5 / EXPLICIT",
);

console.log(
  "Octave after in-accord         : REQUIRED",
);

console.log(
  "Accidental state across sign   : ISOLATED",
);

console.log(
  "Multiple sections              : DEFERRED",
);

console.log(
  "Nested subdivision             : FAIL CLOSED",
);
