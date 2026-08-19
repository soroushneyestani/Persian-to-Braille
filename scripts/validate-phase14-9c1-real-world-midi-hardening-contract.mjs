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

const contract = JSON.parse(
  await text(
    "docs/architecture/phase-14.9c1-real-world-midi-hardening-contract.json",
  ),
);

const doc = await text(
  "docs/architecture/phase-14.9c1-real-world-midi-hardening-contract.md",
);

const audit = JSON.parse(
  await text(
    "stage14-9c-real-world-midi-compatibility-audit.json",
  ),
);

assert.equal(contract.phase, "14.9c1");
assert.equal(contract.status, "frozen");

assert.equal(
  audit.decision,
  "READY_FOR_PHASE14_9C_REAL_WORLD_MIDI_HARDENING_DESIGN",
);

assert.equal(
  contract.parser.pitchBends.globalParserRejection,
  false,
);

assert.equal(
  contract.parser.pitchBends.capture,
  true,
);

assert.equal(
  contract.parser.programChanges.capture,
  true,
);

assert.equal(
  contract.classification.nonPitched.percussionChannelZeroBased,
  9,
);

assert.deepEqual(
  contract.classification.nonPitched.generalMidiProgramZeroBasedRange,
  [119, 127],
);

assert.equal(
  contract.classification.nonPitched.fxPrograms96To103RemainPitchedCandidates,
  true,
);

assert.equal(
  contract.pitchBendPolicy.nonCenterOnRetainedPitchedMaterial,
  "UNSUPPORTED_PITCH_BEND",
);

assert.equal(
  contract.pitchBendPolicy.nonCenterOnSkippedNonPitchedMaterial,
  "does-not-block-pitched-transcription",
);

assert.equal(
  contract.rhythm.notationGridUnitsPerQuarter,
  96,
);

assert.equal(
  contract.rhythm.maxSnapErrorUnits,
  6,
);

assert.equal(
  contract.rhythm.singleAtomicDurationPrerequisite,
  false,
);

assert.equal(
  contract.overlap.sameQuantizedOnset,
  "chord",
);

assert.equal(
  contract.overlap.performanceTailNormalization
    .enabledInFirstHardeningImplementation,
  false,
);

assert.equal(
  contract.overlap.genuineIndependentOverlap,
  "must remain fail-closed until standards-backed in-accord support is added",
);

assert.equal(
  contract.overlap.doNotFakeAsNewlineParts,
  true,
);

assert.equal(
  contract.polyphony.targetRepresentation,
  "Music Braille in-accord",
);

assert.match(
  contract.polyphony.implementationGate,
  /BANA in-accord/,
);

assert.equal(
  contract.meter.target,
  "serialize measure-boundary meter changes only",
);

assert.equal(
  contract.keySignature.afterTick0,
  "remain fail-closed in this hardening tranche",
);

assert.equal(
  contract.acceptance.noSilentNoteDropping,
  true,
);

assert.equal(
  contract.acceptance.noSilentPitchBendFlattening,
  true,
);

assert.equal(
  contract.architecture.officeBoundary,
  "Microsoft365 -> public SDK only",
);

assert.equal(
  contract.architecture.musicXml,
  "out-of-phase-14-reserved-for-phase-19",
);

const fixtureNames = new Set(
  contract.basis.realWorldEvidence.map(
    (item) => item.name,
  ),
);

for (const required of [
  "test.mid",
  "oxygene4.mid",
  "Jean_Michel_Jarre_OXYGENE4.mid",
  "d_HO0606.mid",
]) {
  assert.equal(
    fixtureNames.has(required),
    true,
    `Missing real-world evidence fixture: ${required}`,
  );
}

for (const marker of [
  "NON_PITCHED_PITCH_BEND_SKIPPED",
  "UNSUPPORTED_PITCH_BEND",
  "in-accord",
  "Composite rhythm",
  "no silent note dropping",
  "MusicXML remains outside Phase 14",
]) {
  assert.ok(
    doc.includes(marker),
    `Hardening contract documentation marker missing: ${marker}`,
  );
}

console.log(
  "PHASE 14.9c1 REAL-WORLD MIDI HARDENING CONTRACT: PASS",
);
console.log(
  "Parser pitch-bend policy       : CAPTURE FIRST / CLASSIFY LATER",
);
console.log(
  "Non-pitched classification     : CHANNEL 10 + GM 120..128",
);
console.log(
  "Pitched non-center bend        : FAIL CLOSED",
);
console.log(
  "Composite rhythm               : DECOMPOSITION + DERIVED TIES",
);
console.log(
  "Independent overlap            : FAIL CLOSED UNTIL BANA IN-ACCORD",
);
console.log(
  "Meter changes                  : MEASURE-BOUNDARY TARGET",
);
console.log(
  "Microsoft365 direct music      : NONE",
);
console.log(
  "MusicXML                       : RESERVED FOR PHASE 19",
);
console.log(
  "Next                           : H1 PARSER METADATA + CLASSIFICATION",
);
