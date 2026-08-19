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

const profile = JSON.parse(
  await text(
    "docs/music-braille/phase14-9c-h4b-generic-midi-in-accord-profile.json",
  ),
);

const doc = await text(
  "docs/music-braille/phase14-9c-h4b-generic-midi-in-accord-profile.md",
);

assert.equal(
  profile.phase,
  "14.9c-H4B",
);

assert.equal(
  profile.status,
  "frozen",
);

assert.equal(
  profile.profileId,
  "GENERIC_MIDI_HIGH_TO_LOW_IN_ACCORD_V1",
);

assert.equal(
  profile.claims.originalHandAssignment,
  false,
);

assert.equal(
  profile.claims.originalVoiceNumbering,
  false,
);

assert.equal(
  profile.inAccordOrdering.canonicalDirection,
  "highest-to-lowest",
);

assert.equal(
  profile.voicePartition.minimumConcurrencyIntent,
  true,
);

assert.equal(
  profile.firstImplementation.construct,
  "full-measure in-accord",
);

assert.equal(
  profile.firstImplementation.brfSign,
  "<>",
);

assert.equal(
  profile.firstImplementation.transcriberAddedRestPrefix,
  "dot-5",
);

assert.equal(
  profile.failurePolicy.silentOverlapTrim,
  false,
);

assert.equal(
  profile.failurePolicy.fakeNewlineParts,
  false,
);

for (const marker of [
  "GENERIC_MIDI_HIGH_TO_LOW_IN_ACCORD_V1",
  "INFERRED_MIDI_VOICE_PARTITION",
  "IN_ACCORD_ORDER_CANONICALIZED_NO_STAFF",
  "TRANSCRIBER_ADDED_IN_ACCORD_REST",
  "full-measure",
  "dot-5",
]) {
  assert.ok(
    doc.includes(marker),
    `Missing H4B documentation marker: ${marker}`,
  );
}

console.log(
  "PHASE 14.9c H4B GENERIC MIDI IN-ACCORD PROFILE: PASS",
);
console.log(
  "Profile                        : GENERIC_MIDI_HIGH_TO_LOW_IN_ACCORD_V1",
);
console.log(
  "Original hand/staff claim      : NONE",
);
console.log(
  "Same-onset material            : CHORD",
);
console.log(
  "Derived action partition       : DETERMINISTIC / DISCLOSED",
);
console.log(
  "Canonical in-accord direction  : HIGH -> LOW",
);
console.log(
  "First construct                : FULL-MEASURE IN-ACCORD",
);
console.log(
  "Added rests                    : DOT-5 PREFIX REQUIRED",
);
console.log(
  "Incomplete polyphonic measure  : FAIL CLOSED UNTIL PART-MEASURE SUPPORT",
);
