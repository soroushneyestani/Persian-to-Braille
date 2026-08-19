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

const contract =
  JSON.parse(
    await readText(
      "docs/architecture/phase-14.2b-music-braille-contract.json",
    ),
  );

const phase14_1 =
  JSON.parse(
    await readText(
      "docs/architecture/phase-14.1-music-braille-architecture-audit.json",
    ),
  );

const phase14_2 =
  JSON.parse(
    await readText(
      "docs/architecture/phase-14.2-music-braille-contract-source-audit.json",
    ),
  );

const sourcePolicy =
  await readText(
    "docs/architecture/phase-14.2b-music-braille-source-policy.md",
  );

const contractDoc =
  await readText(
    "docs/architecture/phase-14.2b-music-braille-contract.md",
  );

assert.equal(
  phase14_1.decision,
  "READY_FOR_PHASE14_2_MUSIC_BRAILLE_CONTRACT_AND_SOURCE_AUDIT",
);

assert.equal(
  phase14_2.decision,
  "READY_TO_FREEZE_PHASE14_2B_MUSIC_BRAILLE_CONTRACT",
);

assert.equal(
  contract.phase,
  "14.2b",
);

assert.equal(
  contract.status,
  "frozen",
);

assert.deepEqual(
  contract.scope,
  {
    host: "word-desktop-windows",
    input: [
      "mid",
      "midi",
    ],
    musicXml: "deferred",
    otherOfficeHosts: "excluded",
    web: "excluded",
    mac: "excluded",
  },
);

assert.deepEqual(
  contract.midi.formats,
  [
    0,
    1,
  ],
);

assert.equal(
  contract.midi.timeDivision,
  "PPQN",
);

assert.equal(
  contract.midi.rejectSmpteDivision,
  true,
);

assert.equal(
  contract.architecture.directMidiToBrailleMapping,
  false,
);

assert.equal(
  contract.architecture.officePrivateMusicEngineDependency,
  false,
);

assert.equal(
  contract.architecture.futureInputAdaptersReuseSemanticModel,
  true,
);

assert.equal(
  contract.quantization.maxSnapErrorQuarterUnits,
  "1/16",
);

assert.equal(
  contract.pitchSpelling.originalEnharmonicRecoveryClaimed,
  false,
);

assert.equal(
  contract.partsAndPolyphony.tracksEqualNotationVoices,
  false,
);

assert.equal(
  contract.partsAndPolyphony.inferVoiceNumbers,
  false,
);

assert.equal(
  contract.partsAndPolyphony.inferHandAssignment,
  false,
);

assert.equal(
  contract.ui.wordOnly,
  true,
);

assert.equal(
  contract.ui.filePickerAcceptanceTestRequired,
  true,
);

assert.deepEqual(
  contract.failures,
  [
    "INVALID_MIDI_FILE",
    "UNSUPPORTED_MIDI_FORMAT",
    "UNSUPPORTED_MIDI_TIME_DIVISION",
    "NO_MUSICAL_NOTES",
    "UNQUANTIZABLE_RHYTHM",
    "UNSUPPORTED_POLYPHONY",
    "UNSUPPORTED_PITCH_BEND",
    "UNSUPPORTED_MUSIC_BRAILLE_CONSTRUCT",
  ],
);

assert.deepEqual(
  contract.diagnostics,
  [
    "RHYTHM_QUANTIZED",
    "PITCH_SPELLING_CANONICALIZED",
    "TEMPO_METADATA_ABSENT",
    "TIME_SIGNATURE_ABSENT",
    "KEY_SIGNATURE_ABSENT",
    "SOURCE_PART_DERIVED_FROM_TRACK_CHANNEL",
    "NON_NOTATIONAL_MIDI_EVENT_OMITTED",
    "LOSSY_MIDI_TO_NOTATION_RECONSTRUCTION",
  ],
);

for (const required of [
  "Music Braille Code 2015",
  "New International Manual of Braille Music Notation (1996)",
  "https://midi.org/standard-midi-files",
  "Microsoft Learn",
]) {
  assert.ok(
    sourcePolicy.includes(
      required,
    ),
    `Source policy missing: ${required}`,
  );
}

for (const required of [
  "Direct `MIDI event -> Braille cell` mapping is prohibited.",
  "SMF format 2",
  "SMPTE time-division",
  "UNQUANTIZABLE_RHYTHM",
  "PITCH_SPELLING_CANONICALIZED",
  "Word Desktop task pane",
  "MusicXML",
]) {
  assert.ok(
    contractDoc.includes(
      required,
    ),
    `Contract documentation missing: ${required}`,
  );
}

console.log(
  "Phase 14.2b Music Braille Contract Freeze: PASS",
);
console.log(
  "Host: Word Desktop Windows ONLY",
);
console.log(
  "Input: SMF type 0/1 + PPQN ONLY",
);
console.log(
  "MusicXML: DEFERRED",
);
console.log(
  "Direct MIDI -> Braille mapping: DISALLOWED",
);
console.log(
  "Office -> public SDK -> music engine: FROZEN",
);
console.log(
  "Failure codes: 8 / FROZEN",
);
console.log(
  "Diagnostic codes: 8 / FROZEN",
);
console.log(
  "Next: Phase 14.3 MIDI parser / semantic-model dependency and implementation audit",
);
