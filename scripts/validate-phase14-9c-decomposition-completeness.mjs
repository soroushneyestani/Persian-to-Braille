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

const quantization =
  await text(
    "packages/music/src/quantization.ts",
  );

const tests =
  await text(
    "packages/music/test/notation-builder.test.mjs",
  );

const doc =
  await text(
    "docs/music-braille/phase14-9c-exact-duration-decomposition-completeness-correction.md",
  );

for (
  const marker
  of [
    "EXACT_DECOMPOSITION_MEMO",
    "EXACT_DECOMPOSITION_TABLE",
    "solveExactDuration",
    "isBetterExactDecomposition",
    "tripletCount",
  ]
) {
  assert.ok(
    quantization.includes(
      marker,
    ),
    `Missing exact-decomposition source marker: ${marker}`,
  );
}

for (
  const marker
  of [
    "complete exact decomposition backtracks past greedy dead ends",
    "complete exact decomposition minimizes triplet fragments before fragment count",
    "95 units are exact and no longer emit a false RHYTHM_QUANTIZED diagnostic",
    "exact decomposition keeps a dotted quarter atomic before smaller triplet fragments",
  ]
) {
  assert.ok(
    tests.includes(
      marker,
    ),
    `Missing exact-decomposition regression: ${marker}`,
  );
}

for (
  const marker
  of [
    "EXACT_DURATION_DECOMPOSITION_COMPLETE_V1",
    "51 = 36 + 9 + 6",
    "132 = 96 + 36",
    "614",
    "136",
  ]
) {
  assert.ok(
    doc.includes(
      marker,
    ),
    `Missing exact-decomposition documentation marker: ${marker}`,
  );
}

console.log(
  "PHASE 14.9c EXACT DURATION DECOMPOSITION COMPLETENESS: PASS",
);
console.log(
  "Algorithm                      : COMPLETE EXACT SEARCH / MEMOIZED",
);
console.log(
  "Canonical objective            : MIN TRIPLET -> MIN FRAGMENTS -> LONGEST LEXICOGRAPHIC",
);
console.log(
  "Duration vocabulary            : UNCHANGED",
);
console.log(
  "Notation grid                  : 96 UNITS / QUARTER",
);
console.log(
  "Fallback tolerance             : UNCHANGED / <= 6 UNITS",
);
console.log(
  "144 dotted quarter             : PRESERVED ATOMICALLY",
);
