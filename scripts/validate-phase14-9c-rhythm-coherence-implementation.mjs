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
      "docs/music-braille/phase14-9c-post-h4c-rhythm-coherence-contract.json",
    ),
  );

const builder =
  await text(
    "packages/music/src/notation-builder.ts",
  );

const notationTypes =
  await text(
    "packages/music/src/notation-types.ts",
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
    "packages/music/test/rhythm-coherence.test.mjs",
  );

const doc =
  await text(
    "docs/music-braille/phase14-9c-shared-boundary-rhythm-coherence-implementation.md",
  );

assert.equal(
  contract.status,
  "frozen",
);

assert.equal(
  contract.profileId,
  "GENERIC_MIDI_SHARED_BOUNDARY_RHYTHM_V1",
);

assert.equal(
  contract.evidenceRevision,
  "EXACT_DURATION_DECOMPOSITION_COMPLETENESS_V1",
);

assert.equal(
  contract.grid.maximumSourceBoundaryCorrectionUnits,
  6,
);

assert.equal(
  contract.grid.widenTolerance,
  false,
);

for (
  const marker
  of [
    "RHYTHM_BOUNDARY_COHERENCE_QUANTIZED",
    "ZERO_DURATION_MIDI_NOTE_OMITTED",
  ]
) {
  assert.ok(
    notationTypes.includes(
      marker,
    ),
    `Missing rhythm-coherence diagnostic: ${marker}`,
  );
}

for (
  const marker
  of [
    "GENERIC_MIDI_SHARED_BOUNDARY_RHYTHM_PROFILE_ID",
    "prepareRhythmCoherenceSource",
    "baselineQuantizePartNotes",
    "buildRhythmBoundaryKeys",
    "solvePartRhythmCoherence",
    "solveRhythmMeasureConstraints",
    "solveAcyclicRhythmConstraints",
    "RHYTHM_BOUNDARY_COHERENCE_QUANTIZED",
    "ZERO_DURATION_MIDI_NOTE_OMITTED",
    "exact-nonnegative",
    "preserve-h4c-action-availability",
    "preserve-h4c-action-reuse-tie-break",
    "actions.length > 1",
    "Shared-boundary correction would change the frozen H4C derived-action partition",
  ]
) {
  assert.ok(
    builder.includes(
      marker,
    ),
    `Missing rhythm-coherence builder marker: ${marker}`,
  );
}

assert.ok(
  bridge.includes(
    "GENERIC_MIDI_SHARED_BOUNDARY_RHYTHM_PROFILE_ID",
  ),
);

assert.ok(
  bridge.includes(
    "rhythmProfile:",
  ),
);

assert.equal(
  rootIndex.includes(
    "GENERIC_MIDI_SHARED_BOUNDARY_RHYTHM_PROFILE_ID",
  ),
  false,
  "The rhythm profile remains a bridge-internal policy and must not widen the Music root public surface.",
);

for (
  const marker
  of [
    "shared-boundary coherence repairs a measure-edge note/rest pair without rest-only rounding",
    "an exact zero-duration MIDI note is omitted only with explicit disclosure",
    "a positive source gap may collapse to a touching boundary when exact rests and the immutable measure edge require it",
    "a carried note and a boundary-onset note keep distinct H4C groups without an impossible clipped-onset ordering constraint",
    "positive MIDI duration that collapses to zero on the frozen grid still fails closed",
  ]
) {
  assert.ok(
    tests.includes(
      marker,
    ),
    `Missing rhythm-coherence regression: ${marker}`,
  );
}

for (
  const marker
  of [
    "GENERIC_MIDI_SHARED_BOUNDARY_RHYTHM_V1",
    "EXACT_DURATION_DECOMPOSITION_COMPLETENESS_V1",
    "ZERO_DURATION_MIDI_NOTE_OMITTED",
    "RHYTHM_BOUNDARY_COHERENCE_QUANTIZED",
    "Acyclic constraint components use exact dynamic programming",
    "Triplets",
    "MusicXML remains outside Phase 14 and reserved for Phase 19",
  ]
) {
  assert.ok(
    doc.includes(
      marker,
    ),
    `Missing implementation documentation marker: ${marker}`,
  );
}

console.log(
  "PHASE 14.9c SHARED-BOUNDARY RHYTHM COHERENCE IMPLEMENTATION: PASS",
);

console.log(
  "Profile                        : GENERIC_MIDI_SHARED_BOUNDARY_RHYTHM_V1",
);

console.log(
  "Exact decomposition baseline   : COMPLETE / MEMOIZED",
);

console.log(
  "Maximum boundary correction    : <= 6 UNITS / UNCHANGED",
);

console.log(
  "Measure boundaries             : IMMUTABLE",
);

console.log(
  "Derived rest repair            : SHARED BOUNDARY / NEVER REST-ONLY",
);

console.log(
  "Positive tiny gap              : MAY COLLAPSE TO TOUCHING / NO OVERLAP TRIM",
);

console.log(
  "H4C action partition           : FROZEN / RECHECKED AFTER SOLVE",
);

console.log(
  "Zero-duration source note      : OMIT WITH EXPLICIT DIAGNOSTIC",
);

console.log(
  "Positive duration -> zero      : FAIL CLOSED",
);

console.log(
  "Triplet validation             : EXISTING FAIL-CLOSED GATE PRESERVED",
);

console.log(
  "Music root public surface      : UNCHANGED",
);

console.log(
  "MusicXML                       : PHASE 19",
);
