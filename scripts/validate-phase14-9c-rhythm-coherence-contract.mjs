import assert from "node:assert/strict";
import {
  readFile,
} from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

async function text(relativePath) {
  return readFile(
    path.join(root, relativePath),
    "utf8",
  );
}

const contract =
  JSON.parse(
    await text(
      "docs/music-braille/phase14-9c-post-h4c-rhythm-coherence-contract.json",
    ),
  );

const audit =
  JSON.parse(
    await text(
      "stage14-9c-h4c-post-implementation-blocker-audit.json",
    ),
  );

const doc =
  await text(
    "docs/music-braille/phase14-9c-post-h4c-rhythm-coherence-contract.md",
  );

assert.equal(
  audit.classification.decision,
  "READY_FOR_PHASE14_9C_POST_H4C_RHYTHM_COHERENCE_POLICY_DESIGN",
);
assert.equal(contract.status, "frozen");
assert.equal(
  contract.profileId,
  "GENERIC_MIDI_SHARED_BOUNDARY_RHYTHM_V1",
);
assert.equal(
  contract.evidenceRevision,
  "EXACT_DURATION_DECOMPOSITION_COMPLETENESS_V1",
);
assert.equal(
  contract.basis.decompositionCompletenessCorrection.profileId,
  "EXACT_DURATION_DECOMPOSITION_COMPLETE_V1",
);
assert.equal(
  contract.basis.totals.derivedRestFailures,
  614,
);
assert.equal(
  contract.basis.totals.measureBoundedNoteSegmentFailures,
  136,
);
assert.equal(
  contract.basis.totals.incompletePolyphonicMeasures,
  11,
);
assert.equal(
  contract.basis.totals.rawNoteIntervalFailures,
  1,
);
assert.equal(
  contract.grid.maximumSourceBoundaryCorrectionUnits,
  6,
);
assert.equal(
  contract.grid.observedRequiredMaximumUnits,
  5,
);
assert.equal(contract.grid.widenTolerance, false);
assert.equal(
  contract.implementationGate.requiresCompleteExactDecomposition,
  true,
);
assert.equal(
  contract.deferredAfterRhythm.meterSerialization.stillDeferredToH5,
  true,
);
assert.equal(
  contract.deferredAfterRhythm.musicXML,
  "Phase 19",
);
assert.equal(
  contract.decision,
  "READY_FOR_PHASE14_9C_RHYTHM_COHERENCE_IMPLEMENTATION",
);

for (const marker of [
  "EXACT_DURATION_DECOMPOSITION_COMPLETENESS_V1",
  "EXACT_DURATION_DECOMPOSITION_COMPLETE_V1",
  "51 = 36 + 9 + 6",
  "baseline ± 6",
  "Triplet recovery remains fail-closed",
  "READY_FOR_PHASE14_9C_RHYTHM_COHERENCE_IMPLEMENTATION",
]) {
  assert.ok(
    doc.includes(marker),
    `Missing revised rhythm-contract marker: ${marker}`,
  );
}

console.log(
  "PHASE 14.9c POST-H4C RHYTHM COHERENCE CONTRACT: PASS",
);
console.log(
  "Evidence revision              : EXACT_DURATION_DECOMPOSITION_COMPLETENESS_V1",
);
console.log(
  "Profile                        : GENERIC_MIDI_SHARED_BOUNDARY_RHYTHM_V1",
);
console.log(
  "Exact decomposition            : COMPLETE / MEMOIZED",
);
console.log(
  "Corrected derived-rest count   : 614",
);
console.log(
  "Corrected note-segment count   : 136",
);
console.log(
  "Incomplete poly measures       : 11",
);
console.log(
  "Global tolerance               : UNCHANGED / <= 6 UNITS",
);
console.log(
  "Observed correction maximum    : <= 5 UNITS",
);
console.log(
  "Meter serialization            : H5",
);
console.log(
  "MusicXML                       : PHASE 19",
);
