import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const base = path.join(root, "packages", "music", "spec", "mbc-2015");
const profilePath = path.join(base, "midi-profile-contract.json");
const casesPath = path.join(base, "profile-conformance-seed.json");
const seedPath = path.join(base, "authoritative-rule-seed.json");
const confPath = path.join(base, "conformance-seed.json");

for (const p of [profilePath, casesPath, seedPath, confPath]) {
  if (!fs.existsSync(p)) throw new Error(`missing ${path.relative(root, p)}`);
}

const profile = JSON.parse(fs.readFileSync(profilePath, "utf8"));
const cases = JSON.parse(fs.readFileSync(casesPath, "utf8"));
const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
const phase145b = JSON.parse(fs.readFileSync(confPath, "utf8"));

if (seed.families.length !== 10) throw new Error("Phase 14.5b family count changed");
if (phase145b.cases.length !== 68) throw new Error("Phase 14.5b fixture count changed");
if (seed.encoding.unicodeBraille !== "DEFERRED_TO_PHASE_14_6") throw new Error("Unicode boundary changed too early");

if (profile.enharmonicSpelling.policyId !== "KEY_SIGNATURE_DISTANCE_V1") throw new Error("enharmonic policy mismatch");
const spellingOrder = profile.enharmonicSpelling.candidateSelection;
const polarityIndex = spellingOrder.findIndex((x) => x.startsWith("Then prefer the active key polarity:"));
const magnitudeIndex = spellingOrder.indexOf("Then minimize accidental magnitude.");
if (polarityIndex < 0 || magnitudeIndex < 0 || polarityIndex >= magnitudeIndex) throw new Error("enharmonic tie-break order must be key polarity before accidental magnitude");
if (profile.enharmonicSpelling.tieBreakCorrection?.id !== "POLARITY_BEFORE_MAGNITUDE_14_5C1") throw new Error("Phase 14.5c1 correction marker missing");
if (profile.chordProfile.defaultWrittenNote !== "HIGHEST_SOUNDING_NOTE") throw new Error("chord written-note policy mismatch");
if (profile.chordProfile.intervalDirection !== "DOWNWARD") throw new Error("chord interval direction mismatch");
if (profile.chordProfile.compoundIntervals.initialPhase14_6Support !== "WITHIN_OCTAVE_2_TO_8") throw new Error("compound interval boundary mismatch");
if (profile.numericSerialization.meterSignature.commonAndCutTime.includes("DO_NOT_INFER_FROM_MIDI") === false) throw new Error("common/cut-time inference boundary missing");
if (profile.scope.musicXml !== "OUT_OF_SCOPE_RESERVED_FOR_PHASE_19") throw new Error("MusicXML boundary changed");
if (!profile.encoderStateAndPrecedence.failClosed) throw new Error("fail-closed policy changed");

if (!Array.isArray(cases.cases) || cases.cases.length !== 12) throw new Error("profile fixture count mismatch");
if (cases.caseCount !== cases.cases.length) throw new Error("profile caseCount mismatch");

const byId = Object.fromEntries(cases.cases.map((c) => [c.id, c]));
if (byId["spell-c-sharp-major-e-sharp"].expected.display !== "E#") throw new Error("C# major E# fixture mismatch");
if (byId["spell-g-flat-major-f-flat"].expected.display !== "Fb") throw new Error("Gb major Fb fixture mismatch");
if (byId["spell-c-sharp-major-b-sharp-crosses-c-boundary"].expected.scientificWrittenOctave !== 3) throw new Error("B# octave-boundary fixture mismatch");
if (byId["chord-c-major-triad-upper-down"].expected.writtenMidiPitch !== 67) throw new Error("chord written pitch mismatch");
if (byId["key-four-flats-numeric-count"].expected.strategy !== "numeric-count-plus-accidental") throw new Error("key serialization fixture mismatch");
if (byId["meter-four-four-numeric-not-common-time"].expected.inferCommonTime !== false) throw new Error("meter inference fixture mismatch");

console.log("PHASE 14.5c MIDI MUSIC BRAILLE PROFILE CONTRACT: PASS");
console.log(`Profile fixtures              : ${cases.cases.length}`);
console.log("Enharmonic spelling           : KEY_SIGNATURE_DISTANCE_V1");
console.log("Chord default                 : HIGHEST NOTE + DOWNWARD INTERVALS");
console.log("Numeric key/meter policy      : FROZEN SEMANTIC CONTRACT");
console.log("Unicode Braille               : STILL DEFERRED TO PHASE 14.6");
console.log("MusicXML                      : RESERVED FOR PHASE 19");
