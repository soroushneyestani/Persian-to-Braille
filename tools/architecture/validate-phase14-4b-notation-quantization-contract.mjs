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

const audit =
  JSON.parse(
    await readText(
      "docs/architecture/phase-14.4-notation-quantization-audit.json",
    ),
  );

const contract =
  JSON.parse(
    await readText(
      "docs/architecture/phase-14.4b-notation-quantization-contract.json",
    ),
  );

const doc =
  await readText(
    "docs/architecture/phase-14.4b-notation-quantization-contract.md",
  );

const normalizedDoc =
  doc.replace(
    /\s+/g,
    " ",
  );

assert.equal(
  audit.decision,
  "READY_TO_FREEZE_PHASE14_4B_NOTATION_QUANTIZATION_CONTRACT",
);

assert.equal(
  contract.phase,
  "14.4b",
);

assert.equal(
  contract.status,
  "frozen",
);

assert.equal(
  contract.timing.unitsPerQuarter,
  96,
);

assert.equal(
  contract.timing.floatingPointTiming,
  false,
);

assert.equal(
  contract.timing.maxSnapErrorUnits,
  6,
);

assert.equal(
  contract.timing.maxSnapErrorQuarter,
  "1/16",
);

assert.equal(
  contract.durations.singleDotted,
  true,
);

assert.deepEqual(
  contract.durations.tripletValues,
  [
    "half-triplet",
    "quarter-triplet",
    "eighth-triplet",
    "sixteenth-triplet",
    "thirty-second-triplet",
  ],
);

assert.equal(
  contract.durations.sixtyFourthTriplet,
  "deferred",
);

assert.equal(
  contract.notationModel.engravedVoicesInferred,
  false,
);

assert.equal(
  contract.notationModel.handAssignmentInferred,
  false,
);

assert.equal(
  contract.notationModel.independentOverlapFailure,
  "UNSUPPORTED_POLYPHONY",
);

assert.equal(
  contract.measures.missingTimeSignatureInternalFallback,
  "4/4",
);

assert.equal(
  contract.measures.fallbackClaimedAsSourceMetadata,
  false,
);

assert.equal(
  contract.measures.timeSignatureChangePolicy,
  "must-land-on-quantized-measure-boundary",
);

assert.equal(
  contract.measureCrossingNotes.policy,
  "split-at-measure-boundaries",
);

assert.equal(
  contract.measureCrossingNotes.derivedTieMetadata,
  true,
);

for (const required of [
  "96 integer notation units per quarter note",
  "UNQUANTIZABLE_RHYTHM",
  "UNSUPPORTED_POLYPHONY",
  "TIME_SIGNATURE_ABSENT",
  "UNSUPPORTED_MUSIC_BRAILLE_CONSTRUCT",
  "split into measure-bounded notation segments",
]) {
  assert.ok(
    normalizedDoc.includes(
      required,
    ),
    `Contract documentation missing: ${required}`,
  );
}

console.log(
  "Phase 14.4b Notation/Quantization Contract: PASS",
);
console.log(
  "Notation grid: 96 integer units / quarter",
);
console.log(
  "Dotted 64th: EXACT",
);
console.log(
  "Triplets: half through 32nd",
);
console.log(
  "64th triplet: DEFERRED",
);
console.log(
  "Independent overlap: UNSUPPORTED_POLYPHONY",
);
console.log(
  "Measure crossing: SPLIT + DERIVED TIE METADATA",
);
console.log(
  "Mid-measure time-signature change: REJECTED INITIALLY",
);
console.log(
  "Next: Phase 14.4c notation/quantization engine materialization",
);
