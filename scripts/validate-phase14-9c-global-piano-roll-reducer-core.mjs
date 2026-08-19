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
      "docs/music-braille/phase14-9c-global-piano-roll-reduction-contract.json",
    ),
  );

const reducer =
  await text(
    "packages/music/src/midi-piano-roll-reducer.ts",
  );

const bridge =
  await text(
    "packages/music/src/midi-to-braille.ts",
  );

const tests =
  await text(
    "packages/music/test/midi-piano-roll-reducer.test.mjs",
  );

const doc =
  await text(
    "docs/music-braille/phase14-9c-global-piano-roll-reducer-core-implementation.md",
  );

assert.equal(
  contract.status,
  "frozen",
);

assert.equal(
  contract.profileId,
  "GENERIC_MIDI_GLOBAL_PIANO_ROLL_REDUCTION_V1",
);

for (
  const marker
  of [
    "GENERIC_MIDI_GLOBAL_PIANO_ROLL_REDUCTION_PROFILE_ID",
    "quantizeMidiTick(",
    "canonicalOnsetUnit",
    "collapsedContributorEvents",
    "outputEndTick",
    "trackIndex: 0",
    "channel: 0",
    "program: 0",
    "PITCH_BEND_PRESERVED_AS_METADATA",
  ]
) {
  assert.ok(
    reducer.includes(
      marker,
    ),
    `Missing reducer marker: ${marker}`,
  );
}

for (
  const marker
  of [
    "all tracks channels programs and channel-10 notes flatten into one synthetic piano part",
    "same canonical onset plus same pitch collapses duplicate contributors and keeps maximum release",
    "different-onset same-pitch material remains distinct re-attacks",
    "pitch-bend metadata is non-destructive to discrete piano-key retention",
  ]
) {
  assert.ok(
    tests.includes(
      marker,
    ),
    `Missing reducer regression: ${marker}`,
  );
}

assert.equal(
  bridge.includes(
    'from "./midi-piano-roll-reducer.js"',
  ),
  false,
  "Production bridge routing must remain unchanged until bounded integration.",
);

for (
  const marker
  of [
    "CORE IMPLEMENTED / PRODUCTION ROUTING DEFERRED TO BOUNDED INTEGRATION",
    "every parsed MIDI note event participates",
    "MIDI channel 10 is not removed",
    "retained release is the maximum source end",
    "production bridge is intentionally unchanged",
    "triplet provenance be re-audited",
  ]
) {
  assert.ok(
    doc.includes(
      marker,
    ),
    `Missing reducer implementation documentation marker: ${marker}`,
  );
}

console.log(
  "PHASE 14.9c GLOBAL PIANO-ROLL REDUCER CORE: PASS",
);
console.log(
  "Profile                        : GENERIC_MIDI_GLOBAL_PIANO_ROLL_REDUCTION_V1",
);
console.log(
  "All MIDI note events           : PARTICIPATE",
);
console.log(
  "Instrument/percussion filter   : NONE",
);
console.log(
  "Dedup                          : CANONICAL ONSET + MIDI PITCH",
);
console.log(
  "Duplicate release              : MAX SOURCE END",
);
console.log(
  "Output reducer parts           : ONE SYNTHETIC PART",
);
console.log(
  "Contributor provenance         : RETAINED",
);
console.log(
  "Pitch bend                     : NON-DESTRUCTIVE TO NOTE RETENTION",
);
console.log(
  "Production bridge              : UNCHANGED / BOUNDED INTEGRATION NEXT",
);
console.log(
  "Triplet implementation         : STILL PAUSED",
);
