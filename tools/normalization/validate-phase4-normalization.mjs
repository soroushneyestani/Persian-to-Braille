import { readFile, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "../..");

const profilePath = resolve(
  repoRoot,
  "spec/fa-ir/profiles/fa-ir-g1.json",
);
const rulesDir = resolve(
  repoRoot,
  "spec/fa-ir/rules/records",
);
const zwnjVectorPath = resolve(
  repoRoot,
  "spec/fa-ir/conformance/records/fa-conf-norm-zwnj-001.json",
);

const FORMAT_CONTROL_PATTERN = /\p{General_Category=Format}/u;

function fail(message) {
  console.error(`PHASE 4 NORMALIZATION ERROR: ${message}`);
  process.exitCode = 1;
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

const profile = await readJson(profilePath);
const ruleFileNames = (await readdir(rulesDir))
  .filter((name) => name.endsWith(".json"))
  .sort();

const rulesById = new Map();

for (const fileName of ruleFileNames) {
  const rule = await readJson(resolve(rulesDir, fileName));

  if (typeof rule.id !== "string") {
    fail(`${fileName} has no string rule id.`);
    continue;
  }

  if (rulesById.has(rule.id)) {
    fail(`Duplicate rule id: ${rule.id}`);
  }

  rulesById.set(rule.id, rule);
}

if (profile.id !== "fa-ir-g1") {
  fail(`Expected profile fa-ir-g1, found ${String(profile.id)}.`);
}

if (profile.version !== "0.1.0") {
  fail(
    `Phase 4 baseline expects profile version 0.1.0, found ${String(profile.version)}.`,
  );
}

const policy = profile.normalizationPolicy ?? {};

if (policy.unicodeForm !== "none") {
  fail(
    `Phase 4 baseline requires unicodeForm=none, found ${String(policy.unicodeForm)}.`,
  );
}

if (policy.unknownFormatControls !== "error") {
  fail(
    "Phase 4 baseline requires unknownFormatControls=error, found " +
      `${String(policy.unknownFormatControls)}.`,
  );
}

if (!Array.isArray(profile.ruleIds)) {
  fail("profile.ruleIds must be an array.");
}

const admittedRules = [];

for (const ruleId of profile.ruleIds ?? []) {
  const rule = rulesById.get(ruleId);

  if (rule === undefined) {
    fail(`Profile references missing rule ${ruleId}.`);
    continue;
  }

  admittedRules.push(rule);
}

const canonicalInputMismatches = [];
const normalizationRules = [];
const formatControls = new Set();

for (const rule of admittedRules) {
  const normalization = rule.normalization ?? {};

  if (normalization.form !== "none") {
    fail(
      `${rule.id} changes the Phase 4 normalization form to ${String(normalization.form)}.`,
    );
  }

  const canonicalInput = normalization.canonicalInput;
  const inputText = rule.input?.text;

  if (
    canonicalInput !== null &&
    typeof canonicalInput === "string" &&
    typeof inputText === "string" &&
    canonicalInput !== inputText
  ) {
    canonicalInputMismatches.push(rule.id);
  }

  if (rule.type === "normalization") {
    normalizationRules.push(rule);
  }

  if (
    typeof inputText === "string" &&
    Array.from(inputText).length === 1 &&
    FORMAT_CONTROL_PATTERN.test(inputText)
  ) {
    formatControls.add(
      `U+${inputText
        .codePointAt(0)
        .toString(16)
        .toUpperCase()
        .padStart(4, "0")}`,
    );
  }
}

if (canonicalInputMismatches.length > 0) {
  fail(
    "Phase 4 baseline authorizes no canonicalInput rewrites; found: " +
      canonicalInputMismatches.join(", "),
  );
}

if (normalizationRules.length !== 1) {
  fail(
    `Phase 4 baseline expects exactly one normalization rule, found ${normalizationRules.length}.`,
  );
} else {
  const rule = normalizationRules[0];

  if (rule.id !== "FA-G1-NORM-ZWNJ-001") {
    fail(`Unexpected normalization rule: ${rule.id}`);
  }

  if (rule.status !== "candidate") {
    fail(
      `FA-G1-NORM-ZWNJ-001 must remain candidate during Phase 4, found ${String(rule.status)}.`,
    );
  }

  if (rule.input?.text !== "\u200C") {
    fail("FA-G1-NORM-ZWNJ-001 must target U+200C.");
  }

  if (
    rule.output?.structuralToken !==
    "normalization:zwnj-orthographic-boundary"
  ) {
    fail(
      "FA-G1-NORM-ZWNJ-001 structural token differs from the frozen Phase 4 baseline.",
    );
  }
}

const layoutZwnj = rulesById.get("FA-G1-LAYOUT-027");

if (layoutZwnj === undefined) {
  fail("Missing cross-layer ZWNJ layout rule FA-G1-LAYOUT-027.");
} else {
  if (layoutZwnj.status !== "candidate") {
    fail(
      `FA-G1-LAYOUT-027 must remain candidate during Phase 4, found ${String(layoutZwnj.status)}.`,
    );
  }

  if (layoutZwnj.input?.text !== "\u200C") {
    fail("FA-G1-LAYOUT-027 must target U+200C.");
  }

  if (
    layoutZwnj.output?.structuralToken !==
    "layout:shaping-control:U+200C"
  ) {
    fail(
      "FA-G1-LAYOUT-027 structural token differs from the frozen Phase 4 baseline.",
    );
  }
}

const expectedFormatControls = [
  "U+200B",
  "U+200C",
  "U+2060",
  "U+FEFF",
];

const actualFormatControls = [...formatControls].sort();

if (
  JSON.stringify(actualFormatControls) !==
  JSON.stringify(expectedFormatControls)
) {
  fail(
    "Admitted format-control set differs from the frozen Phase 4 baseline: " +
      JSON.stringify(actualFormatControls),
  );
}

const zwnjVector = await readJson(zwnjVectorPath);

if (zwnjVector.id !== "FA-CONF-NORM-ZWNJ-001") {
  fail(`Unexpected ZWNJ conformance vector id: ${String(zwnjVector.id)}.`);
}

if (zwnjVector.status !== "draft") {
  fail(
    `FA-CONF-NORM-ZWNJ-001 must remain draft during Phase 4, found ${String(zwnjVector.status)}.`,
  );
}

if (
  JSON.stringify(zwnjVector.ruleIds) !==
  JSON.stringify(["FA-G1-NORM-ZWNJ-001"])
) {
  fail("FA-CONF-NORM-ZWNJ-001 rule scope differs from the Phase 4 baseline.");
}

if (
  JSON.stringify(zwnjVector.expected?.structuralTokens) !==
  JSON.stringify(["normalization:zwnj-orthographic-boundary"])
) {
  fail(
    "FA-CONF-NORM-ZWNJ-001 structural expectation differs from the Phase 4 baseline.",
  );
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("Phase 4 normalization baseline validation: PASS");
console.log(`Profile: ${profile.id} ${profile.version}`);
console.log("unicodeForm: none");
console.log("unknownFormatControls: error");
console.log(`Admitted rules checked: ${admittedRules.length}`);
console.log("canonicalInput rewrites: 0");
console.log("normalization rules: 1");
console.log(
  `format controls: ${expectedFormatControls.join(", ")}`,
);
console.log(
  "ZWNJ cross-layer rules: FA-G1-LAYOUT-027, FA-G1-NORM-ZWNJ-001",
);
console.log("ZWNJ conformance vector: FA-CONF-NORM-ZWNJ-001 (draft)");
