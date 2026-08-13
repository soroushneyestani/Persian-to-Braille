import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "../..");

const profilePath = resolve(repoRoot, "spec/fa-ir/profiles/fa-ir-g1.json");
const rulesDir = resolve(repoRoot, "spec/fa-ir/rules/records");
const coreEntryPath = resolve(repoRoot, "packages/core/dist/index.js");

function invariant(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function canonicalJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }

  if (value !== null && typeof value === "object") {
    const entries = Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`);
    return `{${entries.join(",")}}`;
  }

  return JSON.stringify(value);
}

function sha256(text) {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

const profile = await readJson(profilePath);
const fileNames = (await readdir(rulesDir))
  .filter((name) => name.endsWith(".json"))
  .sort();

const rulesById = new Map();

for (const fileName of fileNames) {
  const rule = await readJson(resolve(rulesDir, fileName));
  invariant(typeof rule.id === "string", `Rule ${fileName} has no string id.`);
  invariant(!rulesById.has(rule.id), `Duplicate canonical rule id: ${rule.id}`);
  rulesById.set(rule.id, rule);
}

const canonicalRules = profile.ruleIds.map((ruleId) => {
  const rule = rulesById.get(ruleId);
  invariant(rule, `Canonical profile references missing rule: ${ruleId}`);
  return rule;
});

const expectedStatusCounts = {};
const expectedTypeCounts = {};

for (const rule of canonicalRules) {
  const status = String(rule.status);
  const type = String(rule.type);
  expectedStatusCounts[status] = (expectedStatusCounts[status] ?? 0) + 1;
  expectedTypeCounts[type] = (expectedTypeCounts[type] ?? 0) + 1;
}

const expectedDigest = sha256(
  canonicalJson({
    profile,
    rules: canonicalRules,
  }),
);

const coreModule = await import(pathToFileURL(coreEntryPath).href);
invariant(
  typeof coreModule.getBundledSpecification === "function",
  "Compiled Core must export getBundledSpecification().",
);

const bundle = coreModule.getBundledSpecification();

invariant(bundle.profileId === profile.id, "Runtime profile id differs from canonical profile.");
invariant(
  bundle.profileVersion === profile.version,
  "Runtime profile version differs from canonical profile.",
);
invariant(
  bundle.profileStatus === profile.status,
  "Runtime profile status differs from canonical profile.",
);
invariant(
  bundle.summary.ruleCount === canonicalRules.length,
  "Runtime rule count differs from canonical profile admission list.",
);
invariant(
  bundle.source.canonicalJsonSha256 === expectedDigest,
  "Runtime canonical source digest differs from canonical specification.",
);
invariant(
  JSON.stringify(bundle.profile) === JSON.stringify(profile),
  "Runtime profile document differs from canonical profile document.",
);
invariant(
  JSON.stringify(bundle.rules) === JSON.stringify(canonicalRules),
  "Runtime rule documents differ from canonical admitted rules.",
);
invariant(
  JSON.stringify(bundle.summary.statusCounts) === JSON.stringify(expectedStatusCounts),
  "Runtime lifecycle counts differ from canonical rules.",
);
invariant(
  JSON.stringify(bundle.summary.typeCounts) === JSON.stringify(expectedTypeCounts),
  "Runtime type counts differ from canonical rules.",
);

console.log("Compiled Core specification-consumption validation: PASS");
console.log(`Profile: ${bundle.profileId} ${bundle.profileVersion} (${bundle.profileStatus})`);
console.log(`Rules: ${bundle.summary.ruleCount}`);
console.log(
  `Statuses: ${Object.entries(bundle.summary.statusCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([status, count]) => `${status}=${count}`)
    .join(", ")}`,
);
console.log(`Canonical source SHA-256: ${bundle.source.canonicalJsonSha256}`);
