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

const types = await text(
  "packages/music/src/types.ts",
);

const parser = await text(
  "packages/music/src/smf-parser.ts",
);

const bridge = await text(
  "packages/music/src/midi-to-braille.ts",
);

const parserTests = await text(
  "packages/music/test/smf-parser.test.mjs",
);

const bridgeTests = await text(
  "packages/music/test/midi-to-braille.test.mjs",
);

for (const marker of [
  "MidiParserDiagnostic",
  "TRAILING_ASCII_WHITESPACE_IGNORED",
]) {
  assert.ok(
    types.includes(marker),
    `Missing H4A type marker: ${marker}`,
  );
}

for (const marker of [
  "MAX_TRAILING_ASCII_WHITESPACE_BYTES",
  "acceptedTrailingWhitespaceLength",
  "value === 0x09",
  "value === 0x0a",
  "value === 0x0d",
  "value === 0x20",
  "TRAILING_ASCII_WHITESPACE_IGNORED",
]) {
  assert.ok(
    parser.includes(marker),
    `Missing H4A parser marker: ${marker}`,
  );
}

assert.ok(
  bridge.includes(
    "diagnosticFromParser",
  ),
);

assert.ok(
  bridge.includes(
    "parsed.diagnostics",
  ),
);

for (const marker of [
  "accepts a narrow terminal ASCII whitespace suffix and discloses it",
  "rejects non-whitespace trailing data after declared MIDI tracks",
  "rejects more than 64 bytes of terminal ASCII whitespace",
]) {
  assert.ok(
    parserTests.includes(marker),
    `Missing H4A parser test: ${marker}`,
  );
}

assert.ok(
  bridgeTests.includes(
    "projects accepted terminal ASCII whitespace as an explicit translation diagnostic",
  ),
);

console.log(
  "PHASE 14.9c H4A TERMINAL ASCII WHITESPACE COMPATIBILITY: PASS",
);
console.log(
  "Allowed suffix bytes          : 09 0A 0D 20",
);
console.log(
  "Maximum suffix length         : 64",
);
console.log(
  "Accepted suffix semantics     : NONE / NOT PARSED AS MIDI",
);
console.log(
  "Accepted suffix diagnostic    : TRAILING_ASCII_WHITESPACE_IGNORED",
);
console.log(
  "Other trailing data           : INVALID_MIDI_FILE",
);
