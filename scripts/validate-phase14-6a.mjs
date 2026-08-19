import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const base = path.join(root, "packages", "music", "spec", "mbc-2015");
const tablePath = path.join(base, "braille-ascii-unicode-table.json");
const contractPath = path.join(base, "unicode-encoder-foundation.json");
const seedPath = path.join(base, "authoritative-rule-seed.json");
const confPath = path.join(base, "conformance-seed.json");
const profilePath = path.join(base, "midi-profile-contract.json");
const profileCasesPath = path.join(base, "profile-conformance-seed.json");

for (const p of [tablePath, contractPath, seedPath, confPath, profilePath, profileCasesPath]) {
  if (!fs.existsSync(p)) throw new Error(`missing ${path.relative(root, p)}`);
}

const table = JSON.parse(fs.readFileSync(tablePath, "utf8"));
const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));
const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
const conf = JSON.parse(fs.readFileSync(confPath, "utf8"));
const profile = JSON.parse(fs.readFileSync(profilePath, "utf8"));
const profileCases = JSON.parse(fs.readFileSync(profileCasesPath, "utf8"));

if (table.entries.length !== 64) throw new Error("Braille ASCII canonical table must have 64 entries");
if (table.canonicalAsciiRange.min !== 32 || table.canonicalAsciiRange.max !== 95) throw new Error("Braille ASCII canonical range mismatch");
const ascii = table.entries.map((x) => x.ascii);
const unicode = table.entries.map((x) => x.unicode);
if (new Set(ascii).size !== 64) throw new Error("duplicate canonical ASCII entry");
if (new Set(unicode).size !== 64) throw new Error("duplicate Unicode six-dot pattern");
for (let i = 0; i < 64; i += 1) {
  if (table.entries[i].asciiCode !== 32 + i) throw new Error(`ASCII ordering mismatch at ${i}`);
  const cp = table.entries[i].unicode.codePointAt(0);
  if (cp < 0x2800 || cp > 0x283f) throw new Error(`non-six-dot Unicode code point at ${i}`);
}

const byAscii = Object.fromEntries(table.entries.map((x) => [x.ascii, x]));
const known = { "#": "⠼", '"': "⠐", "?": "⠹", "%": "⠩", "<": "⠣", "*": "⠡", "2": "⠆", "@": "⠈", "C": "⠉", ".": "⠨", " ": "⠀" };
for (const [key, expected] of Object.entries(known)) {
  if (byAscii[key]?.unicode !== expected) throw new Error(`known mapping mismatch for ${JSON.stringify(key)}`);
}

if (seed.families.length !== 10) throw new Error("Phase 14.5b family count changed");
if (conf.cases.length !== 68) throw new Error("Phase 14.5b fixture count changed");
if (profileCases.cases.length !== 12) throw new Error("Phase 14.5c fixture count changed");
if (profile.enharmonicSpelling.policyId !== "KEY_SIGNATURE_DISTANCE_V1") throw new Error("Phase 14.5c profile changed");
if (profile.scope.musicXml !== "OUT_OF_SCOPE_RESERVED_FOR_PHASE_19") throw new Error("MusicXML boundary changed");
if (contract.unicodeCellLayer.status !== "IMPLEMENTED_AND_VALIDATED") throw new Error("Unicode layer status mismatch");
if (contract.scope.notationScoreBridge !== "DEFERRED_TO_PHASE_14_7") throw new Error("NotationScore bridge moved too early");
if (contract.scope.musicXml !== "OUT_OF_PHASE_14_RESERVED_FOR_PHASE_19") throw new Error("Phase 19 boundary mismatch");
if (contract.nextGate !== "READY_FOR_PHASE14_6B_STATEFUL_MUSIC_BRAILLE_ENCODER") throw new Error("next gate mismatch");

console.log("PHASE 14.6a UNICODE + ATOMIC MUSIC BRAILLE ENCODER: PASS");
console.log("Braille ASCII canonical cells : 64");
console.log("Phase 14.5b BRF fixtures      : 68");
console.log("Phase 14.5c profile fixtures  : 12");
console.log("Unicode Braille layer         : IMPLEMENTED");
console.log('Visible C4 quarter            : ⠐⠹');
console.log("NotationScore bridge          : DEFERRED TO PHASE 14.7");
console.log("MusicXML                      : RESERVED FOR PHASE 19");
