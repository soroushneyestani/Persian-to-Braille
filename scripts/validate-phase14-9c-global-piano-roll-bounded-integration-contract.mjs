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

const doc =
  await text(
    "docs/music-braille/phase14-9c-global-piano-roll-bounded-integration-contract.md",
  );

const reducer =
  await text(
    "packages/music/src/midi-piano-roll-reducer.ts",
  );

const bridge =
  await text(
    "packages/music/src/midi-to-braille.ts",
  );

assert.equal(
  contract.status,
  "frozen",
);

assert.equal(
  contract.profileId,
  "GENERIC_MIDI_GLOBAL_PIANO_ROLL_BOUNDED_INTEGRATION_V1",
);

assert.equal(
  contract.productionRoute.classifierMayRemoveNotes,
  false,
);

assert.equal(
  contract.productionRoute.outputMusicalParts,
  1,
);

assert.equal(
  contract.simultaneity.chordIdentity,
  "corrected canonical onset + corrected release",
);

assert.equal(
  contract.simultaneity.sameOnsetDifferentRelease,
  "distinct simultaneous actions in the same piano part",
);

assert.equal(
  contract.simultaneity.noteDroppingToHomogenizeChord,
  false,
);

assert.equal(
  contract.topology.baseline,
  "shared-boundary rhythm baseline",
);

assert.equal(
  contract.topology.postSolveRecheck,
  true,
);

assert.equal(
  contract.solver.wholeSongUnboundedSearch,
  false,
);

assert.equal(
  contract.solver.unboundedRecursiveFallback,
  false,
);

assert.equal(
  contract.solver.exactBelowComplexityGuard,
  true,
);

assert.deepEqual(
  contract.solver.objectiveOrder,
  [
    "minimum maximum absolute boundary correction",
    "minimum total absolute boundary correction",
    "minimum corrected boundary count",
    "minimum total represented note duration",
    "lexicographically lowest boundary vector",
  ],
);

assert.equal(
  contract.denseShortDuration.reintroduceInstrumentFiltering,
  false,
);

assert.equal(
  contract.denseShortDuration.widenCorrectionTolerance,
  false,
);

assert.equal(
  contract.denseShortDuration.widenDurationVocabulary,
  false,
);

assert.equal(
  contract.triplet.status,
  "paused until post-integration re-audit",
);

assert.equal(
  contract.realWorld.thirdPartyMidiCommitted,
  false,
);

assert.equal(
  contract.decision,
  "READY_FOR_PHASE14_9C_GLOBAL_PIANO_ROLL_BOUNDED_PRODUCTION_INTEGRATION_IMPLEMENTATION",
);

assert.ok(
  reducer.includes(
    "GENERIC_MIDI_GLOBAL_PIANO_ROLL_REDUCTION_PROFILE_ID",
  ),
  "Reducer core baseline is missing.",
);

assert.equal(
  bridge.includes(
    'from "./midi-piano-roll-reducer.js"',
  ),
  false,
  "Contract freeze must not route production yet.",
);

const normalizedDoc =
  doc
    .replace(
      /\*\*/g,
      "",
    )
    .replace(
      /\s+/g,
      " ",
    );

for (
  const marker
  of [
    "same onset + same release + different pitches -> one chord",
    "same onset + different release -> distinct simultaneous musical actions",
    "must not be reconstructed later from the older local H2 interval baseline",
    "must not fall back to an unbounded recursive search",
    "must not solve that by reintroducing percussion",
    "Triplet-provenance implementation remains paused",
    "MusicXML remains outside Phase 14 and reserved for Phase 19",
  ]
) {
  assert.ok(
    normalizedDoc.includes(
      marker,
    ),
    `Missing bounded-integration contract marker: ${marker}`,
  );
}

console.log(
  "PHASE 14.9c GLOBAL PIANO-ROLL BOUNDED INTEGRATION CONTRACT: PASS",
);
console.log(
  "Profile                        : GENERIC_MIDI_GLOBAL_PIANO_ROLL_BOUNDED_INTEGRATION_V1",
);
console.log(
  "Production route               : PARSE -> REDUCE -> NOTATION",
);
console.log(
  "Classifier note filtering      : SUPERSEDED",
);
console.log(
  "Output musical parts           : ONE",
);
console.log(
  "Chord identity                 : CORRECTED ONSET + CORRECTED RELEASE",
);
console.log(
  "Same onset / different release : DISTINCT SIMULTANEOUS ACTIONS",
);
console.log(
  "Topology baseline              : SHARED-BOUNDARY RHYTHM BASELINE",
);
console.log(
  "Cyclic solver                  : EXACT + DETERMINISTIC + HARD COMPLEXITY GUARD",
);
console.log(
  "Unbounded recursive fallback   : PROHIBITED",
);
console.log(
  "Dense short-note filtering     : PROHIBITED",
);
console.log(
  "Triplet implementation         : PAUSED UNTIL POST-INTEGRATION RE-AUDIT",
);
console.log(
  "MusicXML                       : PHASE 19",
);
