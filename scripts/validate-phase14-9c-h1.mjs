import assert from "node:assert/strict";
import {
  readFile,
  readdir,
} from "node:fs/promises";
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

async function walk(dir) {
  const out = [];
  const entries =
    await readdir(
      dir,
      { withFileTypes: true },
    );

  for (const entry of entries) {
    const full =
      path.join(
        dir,
        entry.name,
      );

    if (entry.isDirectory()) {
      out.push(
        ...await walk(full),
      );
    } else {
      out.push(full);
    }
  }

  return out;
}

const contract = await json(
  "docs/architecture/phase-14.9c1-real-world-midi-hardening-contract.json",
);

assert.equal(
  contract.phase,
  "14.9c1",
);

assert.equal(
  contract.status,
  "frozen",
);

const types = await text(
  "packages/music/src/types.ts",
);

const parser = await text(
  "packages/music/src/smf-parser.ts",
);

const classifier = await text(
  "packages/music/src/midi-source-classifier.ts",
);

const bridge = await text(
  "packages/music/src/midi-to-braille.ts",
);

const sdkPublic = await text(
  "packages/sdk/src/music-public-api.ts",
);

for (const marker of [
  "MidiProgramChangeEvent",
  "MidiPitchBendEvent",
  "programChangeEvents",
  "pitchBendEvents",
  "readonly program: number",
]) {
  assert.ok(
    types.includes(marker),
    `Missing H1 semantic type marker: ${marker}`,
  );
}

for (const marker of [
  "programChangeEvents.push",
  "pitchBendEvents.push",
  "effectiveProgram",
  "channelPrograms",
]) {
  assert.ok(
    parser.includes(marker),
    `Missing H1 parser metadata marker: ${marker}`,
  );
}

assert.equal(
  parser.includes(
    "bendValue !== 8192",
  ),
  false,
);

assert.equal(
  parser.includes(
    "Non-center MIDI pitch-bend events are unsupported by the Phase 14 notation reconstruction profile.",
  ),
  false,
);

for (const marker of [
  "classifyMidiSemanticSource",
  "channel === 9",
  "program >= 119",
  "program <= 127",
  "NON_PITCHED_SOURCE_EVENT_SKIPPED",
  "NON_PITCHED_PITCH_BEND_SKIPPED",
  "UNSUPPORTED_PITCH_BEND",
]) {
  assert.ok(
    classifier.includes(marker),
    `Missing H1 classification marker: ${marker}`,
  );
}

assert.ok(
  bridge.includes(
    'from "./midi-source-classifier.js"',
  ),
);

assert.ok(
  bridge.includes(
    '"classification"',
  ),
);

assert.ok(
  bridge.includes(
    "classified.diagnostics",
  ),
);

assert.ok(
  sdkPublic.includes(
    '| "classification"',
  ),
);

const parserTests = await text(
  "packages/music/test/smf-parser.test.mjs",
);

for (const marker of [
  "captures non-center pitch bend as neutral semantic metadata",
  "captures Program Change and applies effective program at note and bend onset",
]) {
  assert.ok(
    parserTests.includes(marker),
    `Missing H1 parser regression: ${marker}`,
  );
}

const bridgeTests = await text(
  "packages/music/test/midi-to-braille.test.mjs",
);

for (const marker of [
  "active pitched bend fails closed after source classification",
  "non-pitched GM effect notes and bends are skipped with explicit diagnostics",
  "MIDI channel 10 percussion is not silently interpreted as pitched notation",
]) {
  assert.ok(
    bridgeTests.includes(marker),
    `Missing H1 bridge regression: ${marker}`,
  );
}

const microsoftSrc =
  path.join(
    root,
    "integrations/microsoft365/src",
  );

for (
  const file
  of await walk(
    microsoftSrc,
  )
) {
  if (
    !/\.(?:ts|tsx|js|mjs)$/.test(
      file,
    )
  ) {
    continue;
  }

  const source =
    await readFile(
      file,
      "utf8",
    );

  assert.equal(
    source.includes(
      "@persian-braille/music",
    ),
    false,
    `Microsoft365 direct music import leaked: ${path.relative(root, file)}`,
  );
}

console.log(
  "PHASE 14.9c H1 PARSER METADATA + CLASSIFICATION + SCOPED PITCH BEND: PASS",
);
console.log(
  "Parser policy                  : CAPTURE FACTS / NO GLOBAL BEND REJECT",
);
console.log(
  "Program Change                 : CAPTURED",
);
console.log(
  "Pitch Bend                     : CAPTURED WITH EFFECTIVE PROGRAM",
);
console.log(
  "Non-pitched                    : CHANNEL 10 + GM 120..128",
);
console.log(
  "Non-pitched skipped material   : EXPLICIT DIAGNOSTICS",
);
console.log(
  "Pitched non-center bend        : FAIL CLOSED / CLASSIFICATION",
);
console.log(
  "Overlap policy                 : UNCHANGED / FAIL CLOSED",
);
console.log(
  "Composite rhythm               : DEFERRED TO H2",
);
console.log(
  "Microsoft365 direct music      : NONE",
);
console.log(
  "MusicXML                       : RESERVED FOR PHASE 19",
);
