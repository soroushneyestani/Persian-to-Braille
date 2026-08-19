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

const audit = JSON.parse(
  await text(
    "docs/music-braille/phase14-9c-h4-bana-in-accord-rule-audit.json",
  ),
);

const doc = await text(
  "docs/music-braille/phase14-9c-h4-bana-in-accord-rule-audit.md",
);

assert.equal(
  audit.phase,
  "14.9c-H4",
);

assert.equal(
  audit.status,
  "frozen",
);

assert.equal(
  audit.signs.fullMeasureInAccord.brf,
  "<>",
);

assert.equal(
  audit.signs.partMeasureInAccord.brf,
  '"1',
);

assert.equal(
  audit.signs.measureDivision.brf,
  ".k",
);

assert.equal(
  audit.authoritativeRules.ordering.treble,
  "highest-to-lowest",
);

assert.equal(
  audit.authoritativeRules.ordering.bass,
  "lowest-to-highest",
);

assert.equal(
  audit.authoritativeRules.fullMeasure
    .transcriberAddedRest,
  "permitted when an implied rest is needed; each such added rest must be preceded by dot 5",
);

assert.equal(
  audit.authoritativeRules.partMeasure
    .incompleteMeasureRestriction,
  "only a part-measure in-accord may be used for an incomplete measure",
);

assert.equal(
  audit.authoritativeRules.nested
    .partMeasureFurtherSubdivision,
  false,
);

assert.equal(
  audit.midiReconstructionPolicy.staffDirectionProblem,
  "UNRESOLVED_PROFILE_DECISION",
);

assert.deepEqual(
  audit.jeanMichelTrailingDataPolicy
    .compatibilityPolicy
    .allowedByteValuesHex,
  ["09", "0a", "0d", "20"],
);

assert.equal(
  audit.jeanMichelTrailingDataPolicy
    .compatibilityPolicy
    .maximumBytes,
  64,
);

assert.equal(
  audit.jeanMichelTrailingDataPolicy
    .compatibilityPolicy
    .diagnostic,
  "TRAILING_ASCII_WHITESPACE_IGNORED",
);

assert.equal(
  audit.jeanMichelTrailingDataPolicy
    .compatibilityPolicy
    .allOtherUnexpectedTrailingData,
  "INVALID_MIDI_FILE",
);

assert.equal(
  audit.h3Evidence.oxygene4IndependentOverlaps,
  896,
);

assert.equal(
  audit.h3Evidence.jeanMichelIndependentOverlaps,
  1120,
);

assert.equal(
  audit.h3Evidence.dHo0606IndependentOverlaps,
  9,
);

for (const marker of [
  "Full-measure in-accord",
  "Part-measure in-accord",
  "Measure division",
  "dot 5",
  "TRAILING_ASCII_WHITESPACE_IGNORED",
  "0A 0A",
]) {
  assert.ok(
    doc.includes(marker),
    `Missing H4 documentation marker: ${marker}`,
  );
}

console.log(
  "PHASE 14.9c H4 BANA IN-ACCORD RULE AUDIT + TRAILING POLICY: PASS",
);
console.log(
  "Full-measure in-accord        : <>",
);
console.log(
  'Part-measure in-accord        : "1',
);
console.log(
  "Measure division             : .k",
);
console.log(
  "Transcriber-added rest       : DOT 5 REQUIRED",
);
console.log(
  "Jean-Michel trailing bytes   : 0A 0A / ASCII LF LF",
);
console.log(
  "Trailing compatibility       : ASCII WHITESPACE ONLY / <=64 BYTES",
);
console.log(
  "Generic MIDI staff direction : UNRESOLVED PROFILE DECISION",
);
console.log(
  "Next                         : H4A PARSER COMPATIBILITY + H4B PROFILE DECISION",
);
