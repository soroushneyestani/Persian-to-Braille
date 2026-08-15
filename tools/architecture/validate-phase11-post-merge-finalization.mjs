import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");

function git(args) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
  }).trim();
}

async function text(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

async function json(relativePath) {
  return JSON.parse(await text(relativePath));
}

const record = await json(
  "docs/architecture/phase-11-post-merge-finalization.json",
);
const note = await text(
  "docs/architecture/phase-11-post-merge-finalization.md",
);
const closure118 = await json(
  "docs/architecture/phase-11.8-windows-desktop-closure.json",
);
const packageJson = await json("package.json");

assert.equal(record.schemaVersion, 1);
assert.equal(record.result, "CLOSED");
assert.equal(record.finalPhase11Status, "CLOSED / FINAL");
assert.equal(record.releaseScope, "Microsoft 365 Desktop on Windows");
assert.equal(record.phase12Started, false);

const baseHead = record.main.baseHead;
const repairCommit = record.main.integratedRepairCommit;
const closureCommit = record.main.integratedClosureCommit;

assert.equal(
  git(["merge-base", "--is-ancestor", repairCommit, "HEAD"]),
  "",
);
assert.equal(
  git(["merge-base", "--is-ancestor", closureCommit, "HEAD"]),
  "",
);
assert.equal(
  git(["merge-base", "--is-ancestor", baseHead, "HEAD"]),
  "",
);

const expectedRepairFiles = new Set(["docs/specification/phase-2.14-adjudicated-candidate-materialization.md", "docs/specification/phase-2.3-validation.md", "docs/specification/phase-2.6-promotion-validation.md", "packages/core/test/canonical-execution-bridge.test.mjs", "spec/fa-ir/adjudications/candidate-admission-manifest.json", "spec/fa-ir/adjudications/manifest.json", "spec/fa-ir/conformance/records/fa-conf-var-001.json", "spec/fa-ir/governance/adjudication-policy.json", "spec/fa-ir/manifests/fa-ir-g1-materialization.json", "spec/fa-ir/rules/records/fa-g1-var-001.json", "spec/fa-ir/validation/phase-2.2-validation.json", "spec/fa-ir/validation/phase-2.5-promotion-validation.json", "tools/architecture/validate-u0622-release-correction.mjs", "tools/spec/build_phase2_candidate_package.py", "tools/spec/test_phase2_validator_negative.py", "tools/spec/validate_phase2_spec.py"]);
const actualRepairFiles = new Set(
  git(["show", "--format=", "--name-only", repairCommit])
    .split(/\r?\n/)
    .filter(Boolean),
);
assert.deepEqual(actualRepairFiles, expectedRepairFiles);

assert.equal(
  record.preMergeHistory.phase117Candidate,
  "242547ed0a4262a6b56b06d22546a010ed07fc30",
);
assert.equal(
  record.preMergeHistory.closureBranchHead,
  "e44d0c3",
);
assert.equal(
  record.preMergeHistory.finalFeatureBranchHead,
  "3423e97",
);

assert.equal(record.githubPullRequest.status, "MERGED_AND_CLOSED");
assert.equal(record.githubPullRequest.checks.architectureValidation, "PASS");
assert.equal(record.githubPullRequest.checks.specificationValidation, "PASS");
assert.equal(record.githubPullRequest.checks.marketplacePagesBuild, "PASS");
assert.equal(record.githubPullRequest.checks.marketplacePagesDeploy, "PASS");
assert.equal(record.githubPullRequest.checks.total, "4/4 PASS");
assert.equal(record.githubPullRequest.remoteFeatureBranch, "DELETED");

assert.deepEqual(record.canonicalInventory, {
  rules: 176,
  candidate: 139,
  normative: 37,
  vectors: 176,
  draft: 139,
  active: 37,
});

assert.equal(
  record.u0622Repair.historicalAdjudication,
  "DEFERRED / PRESERVED",
);
assert.equal(record.u0622Repair.normativePromotion, "NONE");
assert.equal(record.u0622Repair.phase214AdmittedCandidates, 138);
assert.equal(record.u0622Repair.releaseCorrections, 1);
assert.equal(record.u0622Repair.rule.status, "candidate");
assert.equal(record.u0622Repair.vector.status, "draft");

const rule = await json(
  "spec/fa-ir/rules/records/fa-g1-var-001.json",
);
const vector = await json(
  "spec/fa-ir/conformance/records/fa-conf-var-001.json",
);

assert.equal(rule.id, "FA-G1-VAR-001");
assert.equal(rule.status, "candidate");
assert.deepEqual(rule.output.cells, ["345"]);
assert.equal(rule.output.unicodeBraille, "⠜");
assert.deepEqual(rule.conformance.vectorIds, ["FA-CONF-VAR-001"]);

assert.equal(vector.id, "FA-CONF-VAR-001");
assert.equal(vector.status, "draft");
assert.deepEqual(vector.ruleIds, ["FA-G1-VAR-001"]);
assert.deepEqual(vector.expected.cells, ["345"]);
assert.equal(vector.expected.unicodeBraille, "⠜");

const ruleFiles = (await readdir(
  path.join(root, "spec/fa-ir/rules/records"),
)).filter((name) => name.endsWith(".json"));
const vectorFiles = (await readdir(
  path.join(root, "spec/fa-ir/conformance/records"),
)).filter((name) => name.endsWith(".json"));

assert.equal(ruleFiles.length, 176);
assert.equal(vectorFiles.length, 176);

assert.equal(
  closure118.finalWindowsCandidate.head,
  "242547ed0a4262a6b56b06d22546a010ed07fc30",
);
assert.equal(closure118.result, "CLOSED");

for (const token of [
  "PHASE 11 WINDOWS DESKTOP: CLOSED / FINAL",
  "4/4 PASS",
  "211/211 PASS",
  "69/69 PASS",
  "Phase 12",
  "NOT STARTED",
]) {
  assert.ok(
    note.includes(token),
    `post-merge finalization note missing ${token}`,
  );
}

assert.equal(
  packageJson.scripts["validate:phase11-post-merge-finalization"],
  "node tools/architecture/"
    + "validate-phase11-post-merge-finalization.mjs",
);
assert.equal(
  packageJson.scripts["validate:phase11-final"],
  "pnpm run validate:phase11-8 && "
    + "pnpm run validate:phase11-post-merge-finalization",
);

console.log("Phase 11 Post-Merge Finalization: PASS");
console.log("PHASE 11 WINDOWS DESKTOP: CLOSED / FINAL");
console.log(`Main base: ${baseHead}`);
console.log(`Integrated repair: ${repairCommit}`);
console.log("GitHub PR checks: 4/4 PASS");
console.log("Canonical inventory: 176 / 139 / 37");
console.log("Core: 211/211 PASS");
console.log("Microsoft365: 69/69 PASS");
console.log("FA-VAR-001: DEFERRED / PRESERVED");
console.log("FA-G1-VAR-001: candidate / dots 345");
console.log("FA-CONF-VAR-001: draft");
console.log("Web: DEFERRED TO PHASE 16");
console.log("Mac: DEFERRED TO PHASE 17");
console.log("Marketplace: DEFERRED TO PHASE 18");
console.log("Phase 12: NOT STARTED");
