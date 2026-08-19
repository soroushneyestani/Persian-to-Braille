import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const base = path.join(root, "packages", "music", "spec", "mbc-2015");
const seedPath = path.join(base, "authoritative-rule-seed.json");
const confPath = path.join(base, "conformance-seed.json");
const manifestPath = path.join(base, "source-manifest.json");

for (const p of [seedPath, confPath, manifestPath]) {
  if (!fs.existsSync(p)) throw new Error(`missing ${path.relative(root, p)}`);
}

const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
const conf = JSON.parse(fs.readFileSync(confPath, "utf8"));
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const required = [
  "MBR-NOTE-DURATION", "MBR-REST", "MBR-OCTAVE", "MBR-ACCIDENTAL",
  "MBR-KEY-SIGNATURE", "MBR-TIME-SIGNATURE", "MBR-NOTE-GROUPING",
  "MBR-CHORD-INTERVAL", "MBR-TIE", "MBR-MEASURE"
];
const ids = new Set(seed.families.map((x) => x.id));
for (const id of required) if (!ids.has(id)) throw new Error(`missing family ${id}`);

const family = Object.fromEntries(seed.families.map((x) => [x.id, x]));
if (family["MBR-NOTE-DURATION"].symbols.quarterOr64th.C !== "?") throw new Error("C quarter/64th mismatch");
if (family["MBR-REST"].symbols.quarterOr64th !== "v") throw new Error("quarter/64th rest mismatch");
if (family["MBR-OCTAVE"].prefixes["4"] !== '"') throw new Error("fourth-octave prefix mismatch");
if (family["MBR-ACCIDENTAL"].symbols.sharp !== "%") throw new Error("sharp mismatch");
if (family["MBR-TIME-SIGNATURE"].examples["4/4"] !== "#d4") throw new Error("4/4 mismatch");
if (family["MBR-NOTE-GROUPING"].symbols.tripletSingleCell !== "2") throw new Error("triplet mismatch");
if (family["MBR-CHORD-INTERVAL"].intervals["2"] !== "/") throw new Error("second interval mismatch");
if (family["MBR-CHORD-INTERVAL"].intervals["8"] !== "-") throw new Error("octave interval mismatch");
if (family["MBR-TIE"].symbols.single !== "@c") throw new Error("single tie mismatch");
if (family["MBR-MEASURE"].normalMeasureSeparator !== " ") throw new Error("measure separator mismatch");

if (seed.encoding.unicodeBraille !== "DEFERRED_TO_PHASE_14_6") throw new Error("Unicode boundary changed");
if (!Array.isArray(conf.cases) || conf.cases.length < 60) throw new Error("conformance seed unexpectedly small");
if (conf.caseCount !== conf.cases.length) throw new Error("conformance caseCount mismatch");
if (manifest.sources.pdf.sha256 !== "34d769731f69ed7586f96b221ca4e22d3e009d36e8024008dfe0fc935348595c") throw new Error("PDF provenance mismatch");
if (manifest.sources.brfZip.sha256 !== "b936fd42d257eefaa0a7f90975588e60e97c4e0371f7a04f0e108441075401e3") throw new Error("BRF provenance mismatch");

const allCasesHaveFamilies = conf.cases.every((c) => ids.has(c.family));
if (!allCasesHaveFamilies) throw new Error("conformance case references unknown family");

console.log("PHASE 14.5b AUTHORITATIVE RULE SEED: PASS");
console.log(`Families                      : ${seed.families.length}`);
console.log(`Atomic BRF fixtures           : ${conf.cases.length}`);
console.log("Unicode Braille               : DEFERRED_TO_PHASE_14_6");
console.log("Source provenance             : PASS");
