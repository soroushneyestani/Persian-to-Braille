import assert from "node:assert/strict";
import {
  readFile,
} from "node:fs/promises";
import path from "node:path";

const root =
  process.cwd();

async function text(relativePath) {
  return readFile(
    path.join(root, relativePath),
    "utf8",
  );
}

const contract =
  JSON.parse(
    await text(
      "docs/music-braille/phase14-9c-global-piano-roll-reduction-contract.json",
    ),
  );

const doc =
  await text(
    "docs/music-braille/phase14-9c-global-piano-roll-reduction-contract.md",
  );

assert.equal(
  contract.status,
  "frozen",
);

assert.equal(
  contract.profileId,
  "GENERIC_MIDI_GLOBAL_PIANO_ROLL_REDUCTION_V1",
);

assert.equal(
  contract.semanticBoundary.outputPartCount,
  1,
);

assert.equal(
  contract.semanticBoundary.instrumentInterpretation,
  "none",
);

assert.equal(
  contract.semanticBoundary.percussionInterpretation,
  "none",
);

assert.equal(
  contract.semanticBoundary.channel10SpecialCase,
  false,
);

assert.equal(
  contract.semanticBoundary.gmEffectProgramSpecialCase,
  false,
);

assert.equal(
  contract.retentionPolicy.allMidiNoteEventsParticipate,
  true,
);

assert.equal(
  contract.retentionPolicy.automaticPercussionRemoval,
  false,
);

assert.equal(
  contract.duplicatePolicy.key,
  "canonical onset unit + MIDI note number",
);

assert.equal(
  contract.duplicatePolicy.release,
  "maximum source end",
);

assert.equal(
  contract.duplicatePolicy.samePitchDifferentCanonicalOnset,
  "never deduplicate",
);

assert.match(
  contract.nonNoteMidiPolicy.pitchBend,
  /retained at its discrete MIDI note number/i,
);

assert.match(
  contract.ordering.oldH1NonPitchedFiltering,
  /superseded/i,
);

assert.match(
  contract.scalability.requirement,
  /must not build one unbounded whole-song combinatorial/i,
);

assert.match(
  contract.userGuidance.shortWarning,
  /Nothing is removed automatically/,
);

assert.equal(
  contract.realWorldEvidence["oxygene4.mid"].rawNotes,
  4409,
);

assert.equal(
  contract.realWorldEvidence["oxygene4.mid"].oldClassifierRemoved,
  1745,
);

assert.equal(
  contract.realWorldEvidence["oxygene4.mid"].pianoAttacks,
  4022,
);

assert.equal(
  contract.realWorldEvidence["Jean_Michel_Jarre_OXYGENE4.mid"].pianoAttacks,
  4000,
);

assert.equal(
  contract.realWorldEvidence["d_HO0606.mid"].pianoAttacks,
  694,
);

assert.equal(
  contract.realWorldEvidence["test.mid"].pianoAttacks,
  41,
);

assert.equal(
  contract.decision,
  "READY_FOR_PHASE14_9C_GLOBAL_PIANO_ROLL_REDUCTION_IMPLEMENTATION",
);

for (
  const marker
  of [
    "GENERIC_MIDI_GLOBAL_PIANO_ROLL_REDUCTION_V1",
    "MIDI channel 10 has no special removal semantics",
    "Pitch bend must not remove the underlying note event",
    "one synthetic musical part",
    "must not imply an unbounded",
    "Triplet-provenance implementation remains paused",
    "Nothing is removed automatically",
  ]
) {
  assert.ok(
    doc.includes(marker),
    `Missing contract documentation marker: ${marker}`,
  );
}

console.log(
  "PHASE 14.9c GLOBAL PIANO-ROLL REDUCTION CONTRACT: PASS",
);
console.log(
  "Profile                        : GENERIC_MIDI_GLOBAL_PIANO_ROLL_REDUCTION_V1",
);
console.log(
  "Output musical parts           : ONE",
);
console.log(
  "All MIDI note events           : PARTICIPATE",
);
console.log(
  "Instrument/percussion filter   : NONE",
);
console.log(
  "Channel 10 special removal     : NONE",
);
console.log(
  "GM effect-program removal      : NONE",
);
console.log(
  "Dedup key                      : CANONICAL ONSET + MIDI PITCH",
);
console.log(
  "Duplicate release              : MAX SOURCE END",
);
console.log(
  "Different-onset same pitch     : RETAIN",
);
console.log(
  "Pitch bend                     : NON-DESTRUCTIVE TO NOTE RETENTION",
);
console.log(
  "Downstream solving             : BOUNDED BY MEASURE / COMPONENT",
);
console.log(
  "Triplet implementation         : PAUSED UNTIL REDUCTION RE-AUDIT",
);
console.log(
  "MusicXML                       : PHASE 19",
);
