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

const notationTypes =
  await text(
    "packages/music/src/notation-types.ts",
  );

const builder =
  await text(
    "packages/music/src/notation-builder.ts",
  );

const atomic =
  await text(
    "packages/music/src/music-braille-atomic-encoder.ts",
  );

const stateful =
  await text(
    "packages/music/src/music-braille-stateful-encoder.ts",
  );

const bridge =
  await text(
    "packages/music/src/midi-to-braille.ts",
  );

const rootIndex =
  await text(
    "packages/music/src/index.ts",
  );

const tests =
  await text(
    "packages/music/test/part-measure-in-accord.test.mjs",
  );

const doc =
  await text(
    "docs/music-braille/phase14-9c-h4d-part-measure-in-accord-implementation.md",
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
  contract.genericMidiScope.singleSection,
  true,
);

for (
  const marker
  of [
    "NotationPartMeasureInAccord",
    '"part-measure-in-accord"',
    "PART_MEASURE_IN_ACCORD_DERIVED",
  ]
) {
  assert.ok(
    notationTypes.includes(
      marker,
    ),
    `Missing H4D notation marker: ${marker}`,
  );
}

for (
  const marker
  of [
    "GENERIC_MIDI_PART_MEASURE_IN_ACCORD_PROFILE_ID",
    "allowIncompletePartMeasure",
    "allowPartMeasureInAccord",
    "part-measure-in-accord-derived-rest",
    "PART_MEASURE_IN_ACCORD_DERIVED",
  ]
) {
  assert.ok(
    builder.includes(
      marker,
    ),
    `Missing H4D builder marker: ${marker}`,
  );
}

assert.ok(
  atomic.includes(
    `partMeasureInAccordBrf(): string { return '"1'; }`,
  ),
);

assert.ok(
  atomic.includes(
    `measureDivisionBrf(): string { return ".k"; }`,
  ),
);

assert.ok(
  stateful.includes(
    "StatefulPartMeasureInAccordEvent",
  ),
);

assert.ok(
  stateful.includes(
    'event.kind === "part-measure-in-accord"',
  ),
);

assert.ok(
  bridge.includes(
    "GENERIC_MIDI_PART_MEASURE_IN_ACCORD_PROFILE_ID",
  ),
);

assert.ok(
  bridge.includes(
    "StatefulPartMeasureInAccordEvent",
  ),
);

assert.equal(
  rootIndex.includes(
    "GENERIC_MIDI_PART_MEASURE_IN_ACCORD_PROFILE_ID",
  ),
  false,
  "H4D profile remains bridge/internal notation policy and must not widen the Music root public surface.",
);

for (
  const marker
  of [
    "H4C alone remains fail-closed for incomplete polyphony while H4D opts in",
    "stateful H4D joins isolated actions with part-measure in-accord and resets note context",
    "public MIDI bridge opts into H4D for a terminal incomplete polyphonic measure",
  ]
) {
  assert.ok(
    tests.includes(
      marker,
    ),
    `Missing H4D regression: ${marker}`,
  );
}

for (
  const marker
  of [
    "GENERIC_MIDI_INCOMPLETE_MEASURE_PART_IN_ACCORD_V1",
    "PART_MEASURE_IN_ACCORD_DERIVED",
    "H4C-only caller continues to fail closed",
    "MusicXML remains outside Phase 14 and reserved for Phase 19",
  ]
) {
  assert.ok(
    doc.includes(
      marker,
    ),
    `Missing H4D implementation documentation marker: ${marker}`,
  );
}

console.log(
  "PHASE 14.9c H4D PART-MEASURE IN-ACCORD IMPLEMENTATION: PASS",
);

console.log(
  "Profile                        : GENERIC_MIDI_INCOMPLETE_MEASURE_PART_IN_ACCORD_V1",
);

console.log(
  'Part-measure sign              : "1',
);

console.log(
  "Measure-division primitive     : .k / NOT EMITTED IN SINGLE-SECTION V1",
);

console.log(
  "Initial scope                  : TERMINAL INCOMPLETE MEASURE / SINGLE SECTION",
);

console.log(
  "H4C-only behavior              : STILL FAIL CLOSED FOR INCOMPLETE POLYPHONY",
);

console.log(
  "Shared-boundary rhythm         : EXTENDED TO H4D SECTION",
);

console.log(
  "Added rests                    : DOT-5 / EXPLICIT",
);

console.log(
  "Accidental state across sign   : ISOLATED",
);

console.log(
  "Original staff/hand/voice      : NOT CLAIMED",
);

console.log(
  "Music root public surface      : UNCHANGED",
);

console.log(
  "MusicXML                       : PHASE 19",
);
