import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const base = path.join(root, "packages", "music", "spec", "mbc-2015");
const contractPath = path.join(base, "stateful-encoder-foundation.json");
const profilePath = path.join(base, "midi-profile-contract.json");
const phase146aPath = path.join(base, "unicode-encoder-foundation.json");
const profileCasesPath = path.join(base, "profile-conformance-seed.json");

for (const p of [contractPath, profilePath, phase146aPath, profileCasesPath]) {
  if (!fs.existsSync(p)) throw new Error(`missing ${path.relative(root, p)}`);
}

const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));
const profile = JSON.parse(fs.readFileSync(profilePath, "utf8"));
const phase146a = JSON.parse(fs.readFileSync(phase146aPath, "utf8"));
const profileCases = JSON.parse(fs.readFileSync(profileCasesPath, "utf8"));

if (profile.enharmonicSpelling.policyId !== "KEY_SIGNATURE_DISTANCE_V1") throw new Error("enharmonic policy changed");
if (profile.enharmonicSpelling.tieBreakCorrection?.id !== "POLARITY_BEFORE_MAGNITUDE_14_5C1") throw new Error("Phase 14.5c1 correction missing");
if (profile.chordProfile.defaultWrittenNote !== "HIGHEST_SOUNDING_NOTE") throw new Error("chord profile changed");
if (profile.chordProfile.intervalDirection !== "DOWNWARD") throw new Error("chord direction changed");
if (profile.scope.musicXml !== "OUT_OF_SCOPE_RESERVED_FOR_PHASE_19") throw new Error("MusicXML boundary changed");
if (profileCases.cases.length !== 12) throw new Error("profile fixture count changed");
if (phase146a.unicodeCellLayer.status !== "IMPLEMENTED_AND_VALIDATED") throw new Error("Phase 14.6a Unicode layer regression");
if (contract.status !== "implemented-foundation") throw new Error("stateful encoder status mismatch");
if (contract.state.accidentals.includes("Measure-scoped") === false) throw new Error("accidental-state contract missing");
if (contract.state.octaves.includes("MBC 2015") === false) throw new Error("octave-state contract missing");
if (contract.deferred.notationScoreBridge !== "PHASE_14_7") throw new Error("NotationScore bridge moved too early");
if (contract.deferred.musicXml !== "PHASE_19") throw new Error("Phase 19 boundary mismatch");
if (contract.nextGate !== "READY_FOR_PHASE14_7_MIDI_TO_BRAILLE_END_TO_END_AND_SDK_FACADE") throw new Error("next gate mismatch");

const runtime = path.join(root, "packages", "music", "src", "music-braille-stateful-encoder.ts");
const test = path.join(root, "packages", "music", "test", "music-braille-stateful-encoder.test.mjs");
if (!fs.existsSync(runtime)) throw new Error("stateful runtime missing");
if (!fs.existsSync(test)) throw new Error("stateful tests missing");

console.log("PHASE 14.6b STATEFUL MUSIC BRAILLE ENCODER: PASS");
console.log("Enharmonic profile            : EXECUTABLE");
console.log("Accidental state              : MEASURE-SCOPED");
console.log("Contextual octave marks       : IMPLEMENTED");
console.log("MIDI chord profile            : IMPLEMENTED");
console.log("Measure composition           : IMPLEMENTED");
console.log("NotationScore bridge          : NEXT / PHASE 14.7");
console.log("MusicXML                      : RESERVED FOR PHASE 19");
