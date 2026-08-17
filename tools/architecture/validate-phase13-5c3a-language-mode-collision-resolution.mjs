import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");

async function text(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

async function json(relativePath) {
  return JSON.parse(await text(relativePath));
}

const coverageAudit = await json(
  "docs/architecture/phase-13.5c3-remaining-collision-coverage-audit.json",
);
const behaviorAudit = await json(
  "docs/architecture/phase-13.5c3a-latin-persian-cross-mode-behavior-audit.json",
);
const designAudit = await json(
  "docs/architecture/phase-13.5c3a2-language-mode-percent-overlap-design-audit.json",
);
const manifest = await json(
  "spec/fa-ir/reverse/conformance/manifest.json",
);
const reverseSource = await text(
  "packages/core/src/reverse-translator.ts",
);
const coreIndex = await text("packages/core/src/index.ts");
const sdkIndex = await text("packages/sdk/src/index.ts");

assert.equal(coverageAudit.baseline.remainingCollisionSignatures, 17);
assert.equal(coverageAudit.remainingFamilyCounts["cross-mode"], 12);
assert.equal(coverageAudit.remainingFamilyCounts.latin, 4);
assert.equal(coverageAudit.remainingFamilyCounts["punctuation-sequence"], 1);

assert.deepEqual(
  behaviorAudit.latinStateFailures,
  ["cross-mode-1234-latin-lower"],
);
assert.equal(designAudit.allCrossModeShapeUniform, true);

assert.equal(manifest.summary.vectors, 139);
assert.equal(manifest.summary.translationVectors, 137);
assert.equal(manifest.summary.capabilityVectors, 2);

const phaseIds = manifest.vectorIds.filter(
  (id) =>
    id.startsWith("FA-REV-CONF-COLLISION-LANGUAGE-")
    || id.startsWith("FA-REV-CONF-OVERLAP-PERCENT-LATIN-"),
);
assert.equal(phaseIds.length, 68);

const ruleDir = path.join(root, "spec/fa-ir/rules/records");
const ruleNames = (await readdir(ruleDir))
  .filter((name) => name.endsWith(".json"));

const bySignature = new Map();

for (const name of ruleNames) {
  const rule = JSON.parse(
    await readFile(path.join(ruleDir, name), "utf8"),
  );
  const cells = rule.output?.cells;

  if (!Array.isArray(cells) || cells.length === 0) {
    continue;
  }

  const signature = cells.join(" ");
  const ids = bySignature.get(signature) ?? [];
  ids.push(rule.id);
  bySignature.set(signature, ids);
}

const collisionEntries = [...bySignature.entries()]
  .filter(([, ids]) => ids.length > 1);

assert.equal(collisionEntries.length, 34);

const recordDir = path.join(
  root,
  "spec/fa-ir/reverse/conformance/records",
);
const recordNames = (await readdir(recordDir))
  .filter((name) => name.endsWith(".json"));

assert.equal(recordNames.length, manifest.vectorIds.length);

const coveredRuleIds = new Set();

for (const name of recordNames) {
  const record = JSON.parse(
    await readFile(path.join(recordDir, name), "utf8"),
  );

  for (const ruleId of record.sourceForwardRuleIds) {
    coveredRuleIds.add(ruleId);
  }
}

const remainingSignatures = collisionEntries
  .filter(
    ([, ids]) =>
      !ids.some((ruleId) => coveredRuleIds.has(ruleId)),
  )
  .map(([signature]) => signature)
  .sort();

assert.deepEqual(remainingSignatures, ["23"]);

for (const token of [
  "languageModeCollision",
  "basePersianCandidate",
  "hasClosableLatinSpan",
  "preLatinPercentMatch",
]) {
  assert.ok(
    reverseSource.includes(token),
    `Phase 13.5c-3a source marker missing: ${token}`,
  );
}

for (const token of [
  "./reverse-translator.js",
  "./reverse-translation.js",
]) {
  assert.equal(
    coreIndex.includes(token),
    false,
    `Core reverse API exposed prematurely: ${token}`,
  );
}

for (const token of [
  "createPersianBrailleReverseTranslator",
  "translateFromBraille",
  "PersianBrailleReverseTranslationError",
]) {
  assert.equal(
    sdkIndex.includes(token),
    false,
    `SDK reverse API exposed prematurely: ${token}`,
  );
}

const diffNames = execFileSync(
  "git",
  ["diff", "--name-only", "HEAD"],
  { cwd: root, encoding: "utf8" },
)
  .split(/\r?\n/)
  .filter(Boolean);

for (const forbiddenPrefix of [
  "spec/fa-ir/rules/records/",
  "spec/fa-ir/conformance/records/",
  "packages/core/src/forward-translator.ts",
  "packages/core/src/rule-selector.ts",
  "packages/core/src/mode-rule-executor.ts",
  "packages/sdk/src/",
  "integrations/microsoft365/src/",
  "apps/cli/",
  "apps/web/",
]) {
  assert.equal(
    diffNames.some((name) => name.startsWith(forbiddenPrefix)),
    false,
    `Phase 13.5c-3a touched frozen/deferred boundary: ${forbiddenPrefix}`,
  );
}

console.log("Phase 13.5c-3a Language-Mode Collision Resolution: PASS");
console.log("Cross-mode Persian/Latin signatures: 12 / 12");
console.log("Latin-only signatures: 4 / 4");
console.log("Percent / lowercase-p overlap: PASS");
console.log("New language-mode vectors: 68 / PASS");
console.log("Reverse conformance vectors: 139");
console.log("Canonical collision coverage: 33 / 34");
console.log("Remaining collision signature: 23");
console.log("Core root reverse export: DEFERRED / PASS");
console.log("SDK reverse API: DEFERRED / PASS");
console.log("Next: Phase 13.5c-3b Remaining Punctuation Collision");
