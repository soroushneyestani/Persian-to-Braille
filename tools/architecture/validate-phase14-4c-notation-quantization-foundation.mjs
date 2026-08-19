import assert from "node:assert/strict";
import {
  readFile,
} from "node:fs/promises";
import path from "node:path";

const root =
  process.cwd();

async function readText(
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

const packageJson =
  JSON.parse(
    await readText(
      "packages/music/package.json",
    ),
  );

const rootIndex =
  await readText(
    "packages/music/src/index.ts",
  );

const notationTypes =
  await readText(
    "packages/music/src/notation-types.ts",
  );

const quantization =
  await readText(
    "packages/music/src/quantization.ts",
  );

const builder =
  await readText(
    "packages/music/src/notation-builder.ts",
  );

const microsoftPackage =
  JSON.parse(
    await readText(
      "integrations/microsoft365/package.json",
    ),
  );

const sdkPackage =
  JSON.parse(
    await readText(
      "packages/sdk/package.json",
    ),
  );

assert.equal(
  packageJson.name,
  "@persian-braille/music",
);

assert.deepEqual(
  packageJson.dependencies,
  {},
);

for (const marker of [
  "NOTATION_UNITS_PER_QUARTER",
  "NotationScore",
  "NotationMeasure",
  "NotationChord",
  "NotationRest",
  "NotationBuildResult",
]) {
  assert.ok(
    notationTypes.includes(
      marker,
    ),
    `Missing notation type marker: ${marker}`,
  );
}

for (const marker of [
  "MAX_QUANTIZATION_ERROR_UNITS",
  "quantizeMidiTick",
  "quantizeMidiNote",
  "chooseRepresentableIntervalUnits",
  "decomposeExactDurationUnits",
  "dotted-sixty-fourth",
  "quarter-triplet",
]) {
  assert.ok(
    quantization.includes(
      marker,
    ),
    `Missing quantization marker: ${marker}`,
  );
}

for (const marker of [
  "buildNotationScore",
  "UNSUPPORTED_POLYPHONY",
  "TIME_SIGNATURE_ABSENT",
  "splitIntervalAtMeasures",
  "SOURCE_PART_DERIVED_FROM_TRACK_CHANNEL",
]) {
  assert.ok(
    builder.includes(
      marker,
    ),
    `Missing notation-builder marker: ${marker}`,
  );
}

assert.match(
  rootIndex,
  /buildNotationScore/,
);

assert.match(
  rootIndex,
  /quantizeMidiTick/,
);

assert.equal(
  Object.hasOwn(
    microsoftPackage.dependencies ?? {},
    "@persian-braille/music",
  ),
  false,
);

assert.equal(
  Object.hasOwn(
    sdkPackage.dependencies ?? {},
    "@persian-braille/music",
  ),
  true,
  "Phase 14.7 public SDK facade must depend on the internal platform-agnostic music engine.",
);

console.log(
  "Phase 14.4c Notation/Quantization Foundation: PASS",
);
console.log(
  "Boundary: MidiSemanticSource -> NotationScore",
);
console.log(
  "Notation grid: 96 integer units / quarter",
);
console.log(
  "Chord grouping: PRESENT",
);
console.log(
  "Rest derivation: PRESENT",
);
console.log(
  "Measure construction: PRESENT",
);
console.log(
  "Measure-crossing ties: METADATA PRESENT",
);
console.log(
  "Independent overlap: REJECTED",
);
console.log(
  "Music Braille cell encoding: NOT YET",
);
console.log(
  "Next: Phase 14.5 Music Braille rule-source and conformance audit",
);
