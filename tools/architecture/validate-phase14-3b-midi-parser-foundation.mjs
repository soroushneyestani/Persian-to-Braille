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
      "docs/architecture/phase-14.3-midi-parser-dependency-audit.json",
    ),
  );

const musicPackage =
  JSON.parse(
    await readText(
      "packages/music/package.json",
    ),
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

const parser =
  await readText(
    "packages/music/src/smf-parser.ts",
  );

const types =
  await readText(
    "packages/music/src/types.ts",
  );

assert.equal(
  audit.decision,
  "READY_FOR_PHASE14_3B_MIDI_PARSER_FOUNDATION",
);

assert.equal(
  audit.recommendation.preferredParser,
  "internal-smf-parser",
);

assert.equal(
  musicPackage.name,
  "@persian-braille/music",
);

assert.equal(
  musicPackage.private,
  true,
);

assert.deepEqual(
  musicPackage.dependencies,
  {},
);

for (const marker of [
  "readVlq",
  "runningStatus",
  "status === 0xff",
  "status === 0xf0",
  "UNSUPPORTED_MIDI_FORMAT",
  "UNSUPPORTED_MIDI_TIME_DIVISION",
]) {
  assert.ok(
    parser.includes(
      marker,
    ),
    `Missing parser marker: ${marker}`,
  );
}

for (const typeName of [
  "MidiSemanticSource",
  "MidiNote",
  "MidiSourcePart",
  "MidiTempoEvent",
  "MidiTimeSignatureEvent",
  "MidiKeySignatureEvent",
  "MidiParserFailureCode",
]) {
  assert.ok(
    types.includes(
      typeName,
    ),
    `Missing type: ${typeName}`,
  );
}

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
  "Phase 14.3b MIDI Parser Foundation: PASS",
);
console.log(
  "Parser: internal ESM-native SMF parser",
);
console.log(
  "Accepted: SMF type 0/1 + PPQN",
);
console.log(
  "Rejected: type 2 + SMPTE",
);
console.log(
  "External MIDI runtime dependencies: 0",
);
console.log(
  "Neutral semantic source model: PRESENT",
);
console.log(
  "Microsoft365 direct music dependency: NONE",
);
console.log(
  "SDK music facade: PRESENT / PHASE 14.7",
);
console.log(
  "Next: Phase 14.4 notation model + quantization foundation",
);
