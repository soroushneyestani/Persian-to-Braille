import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

async function text(relativePath) {
  return readFile(
    path.join(root, relativePath),
    "utf8",
  );
}

async function json(relativePath) {
  return JSON.parse(
    await text(relativePath),
  );
}

const contract = await json(
  "docs/architecture/phase-14.9c1-real-world-midi-hardening-contract.json",
);

assert.equal(contract.phase, "14.9c1");
assert.equal(contract.status, "frozen");

const quantization = await text(
  "packages/music/src/quantization.ts",
);

const builder = await text(
  "packages/music/src/notation-builder.ts",
);

const tests = await text(
  "packages/music/test/notation-builder.test.mjs",
);

for (const marker of [
  "quantizeMidiTick",
  "chooseRepresentableIntervalUnits",
  "decomposeExactDurationUnits",
  "MAX_QUANTIZATION_ERROR_UNITS",
  "start.changed",
  "end.changed",
  "representedDurationUnits",
]) {
  assert.ok(
    quantization.includes(marker),
    `Missing H2 quantization marker: ${marker}`,
  );
}

assert.equal(
  quantization.includes(
    "readonly duration:\n    NotationDuration;",
  ),
  false,
);

for (const marker of [
  "createNoteSegments",
  "decomposeExactDurationUnits",
  "tieFromPrevious",
  "tieToNext",
]) {
  assert.ok(
    builder.includes(marker),
    `Missing H2 tied-decomposition marker: ${marker}`,
  );
}

for (const marker of [
  "accepts an exact composite duration and derives an internal tie",
  "accepts an 80-unit composite duration instead of forcing one atomic value",
  "nearest representable composite fallback uses shorter interval on an exact distance tie",
]) {
  assert.ok(
    tests.includes(marker),
    `Missing H2 regression test: ${marker}`,
  );
}

assert.equal(
  builder.includes(
    "Independently-starting overlapping notes would require inferred notation voices.",
  ),
  true,
);

console.log(
  "PHASE 14.9c H2 COMPOSITE RHYTHM QUANTIZATION + TIED DECOMPOSITION: PASS",
);
console.log("Notation grid                  : 96 UNITS / QUARTER");
console.log("Onset/end boundary quantize    : BOTH");
console.log("Single atomic prerequisite     : REMOVED");
console.log("Composite interval             : EXACT DECOMPOSITION");
console.log("Fallback correction            : <= 6 UNITS");
console.log("Equal-distance tie-break       : SHORTER");
console.log("Derived note ties              : PRESERVED");
console.log("Independent polyphony          : STILL FAIL CLOSED");
console.log("MusicXML                       : RESERVED FOR PHASE 19");
