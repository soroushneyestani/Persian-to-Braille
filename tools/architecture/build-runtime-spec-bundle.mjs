import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "../..");

const manifestPath = resolve(
  repoRoot,
  "tools/architecture/runtime-spec-bundles.json",
);

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

function relativePosix(path) {
  return relative(repoRoot, path).replaceAll("\\", "/");
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function requireNonEmptyString(value, field, bundleKey) {
  invariant(
    typeof value === "string" && value.length > 0,
    `Runtime bundle ${bundleKey}: ${field} must be a non-empty string.`,
  );
}

function validateManifest(manifest) {
  invariant(
    manifest !== null && typeof manifest === "object",
    "Runtime bundle manifest must be an object.",
  );
  invariant(
    manifest.schemaVersion === 1,
    "Runtime bundle manifest schemaVersion must be 1.",
  );
  invariant(
    Array.isArray(manifest.bundles) &&
      manifest.bundles.length > 0,
    "Runtime bundle manifest must contain at least one bundle.",
  );

  const keys = new Set();
  const outputPaths = new Set();
  const exportNames = new Set();

  for (const definition of manifest.bundles) {
    invariant(
      definition !== null &&
        typeof definition === "object",
      "Every runtime bundle definition must be an object.",
    );

    requireNonEmptyString(
      definition.key,
      "key",
      "<unknown>",
    );

    const bundleKey = definition.key;

    requireNonEmptyString(
      definition.profilePath,
      "profilePath",
      bundleKey,
    );
    requireNonEmptyString(
      definition.rulesDirectory,
      "rulesDirectory",
      bundleKey,
    );
    requireNonEmptyString(
      definition.outputPath,
      "outputPath",
      bundleKey,
    );
    requireNonEmptyString(
      definition.exportName,
      "exportName",
      bundleKey,
    );
    requireNonEmptyString(
      definition.sourceOfTruth,
      "sourceOfTruth",
      bundleKey,
    );
    requireNonEmptyString(
      definition.generatedMessage,
      "generatedMessage",
      bundleKey,
    );

    invariant(
      !keys.has(bundleKey),
      `Duplicate runtime bundle key: ${bundleKey}`,
    );
    invariant(
      !outputPaths.has(definition.outputPath),
      `Duplicate runtime bundle outputPath: ${definition.outputPath}`,
    );
    invariant(
      !exportNames.has(definition.exportName),
      `Duplicate runtime bundle exportName: ${definition.exportName}`,
    );

    keys.add(bundleKey);
    outputPaths.add(definition.outputPath);
    exportNames.add(definition.exportName);
  }
}

async function buildBundle(definition) {
  const profilePath = resolve(
    repoRoot,
    definition.profilePath,
  );
  const rulesDir = resolve(
    repoRoot,
    definition.rulesDirectory,
  );
  const outputPath = resolve(
    repoRoot,
    definition.outputPath,
  );

  const profile = await readJson(profilePath);

  invariant(
    typeof profile.id === "string" &&
      profile.id.length > 0,
    `Runtime bundle ${definition.key}: profile must have a non-empty string id.`,
  );
  invariant(
    typeof profile.version === "string" &&
      profile.version.length > 0,
    `Runtime bundle ${definition.key}: profile must have a non-empty string version.`,
  );
  invariant(
    Array.isArray(profile.ruleIds),
    `Runtime bundle ${definition.key}: profile ruleIds must be an array.`,
  );
  invariant(
    new Set(profile.ruleIds).size ===
      profile.ruleIds.length,
    `Runtime bundle ${definition.key}: profile ruleIds must be unique.`,
  );

  const ruleFileNames = (
    await readdir(rulesDir)
  )
    .filter((name) => name.endsWith(".json"))
    .sort();

  const rulesById = new Map();
  const currentProfileRuleIdsOnDisk =
    new Set();

  for (const fileName of ruleFileNames) {
    const path = resolve(rulesDir, fileName);
    const rule = await readJson(path);

    invariant(
      typeof rule.id === "string" &&
        rule.id.length > 0,
      `Rule ${fileName} must have a non-empty string id.`,
    );
    invariant(
      !rulesById.has(rule.id),
      `Duplicate rule id: ${rule.id}`,
    );

    rulesById.set(
      rule.id,
      {
        fileName,
        path,
        rule,
      },
    );

    if (rule.profile === profile.id) {
      currentProfileRuleIdsOnDisk.add(
        rule.id,
      );
    }
  }

  const selectedRules = profile.ruleIds.map(
    (ruleId) => {
      invariant(
        typeof ruleId === "string" &&
          ruleId.length > 0,
        "Every profile ruleId must be a non-empty string.",
      );

      const record = rulesById.get(ruleId);

      invariant(
        record,
        `Profile references missing rule: ${ruleId}`,
      );
      invariant(
        record.rule.profile === profile.id,
        `Rule ${ruleId} belongs to ${String(
          record.rule.profile,
        )}, not ${profile.id}.`,
      );

      return record;
    },
  );

  const profileRuleIdSet =
    new Set(profile.ruleIds);

  const orphanedCurrentProfileRules = [
    ...currentProfileRuleIdsOnDisk,
  ]
    .filter(
      (ruleId) =>
        !profileRuleIdSet.has(ruleId),
    )
    .sort();

  invariant(
    orphanedCurrentProfileRules.length === 0,
    `Rules for ${profile.id} exist on disk but are absent from profile.ruleIds: ` +
      orphanedCurrentProfileRules.join(", "),
  );

  const statusCounts = {};
  const typeCounts = {};

  for (const { rule } of selectedRules) {
    const status = String(rule.status);
    const type = String(rule.type);

    statusCounts[status] =
      (statusCounts[status] ?? 0) + 1;
    typeCounts[type] =
      (typeCounts[type] ?? 0) + 1;
  }

  const canonicalProfile =
    canonicalJson(profile);

  const canonicalRules =
    selectedRules.map(
      ({ rule }) => canonicalJson(rule),
    );

  const sourceDigestInput =
    canonicalJson({
      profile,
      rules: selectedRules.map(
        ({ rule }) => rule,
      ),
    });

  const bundle = {
    schemaVersion: 1,
    profileId: profile.id,
    profileVersion: profile.version,
    profileStatus: profile.status,
    source: {
      profilePath:
        relativePosix(profilePath),
      rulesDirectory:
        relativePosix(rulesDir),
      canonicalJsonSha256:
        sha256(sourceDigestInput),
      profileCanonicalJsonSha256:
        sha256(canonicalProfile),
      ruleCanonicalJsonSha256:
        sha256(canonicalRules.join("\n")),
    },
    summary: {
      ruleCount: selectedRules.length,
      statusCounts,
      typeCounts,
    },
    profile,
    rules: selectedRules.map(
      ({ rule }) => rule,
    ),
  };

  const output =
    "// GENERATED FILE \u2014 DO NOT EDIT.\n" +
    `// Source of truth: ${definition.sourceOfTruth}\n` +
    "// Regenerate with: pnpm run spec:bundle\n\n" +
    `export const ${definition.exportName} = ${JSON.stringify(
      bundle,
      null,
      2,
    )} as const;\n`;

  await mkdir(
    dirname(outputPath),
    {
      recursive: true,
    },
  );

  await writeFile(
    outputPath,
    output,
    "utf8",
  );

  console.log(
    definition.generatedMessage,
  );
  console.log(
    `Profile: ${bundle.profileId} ${bundle.profileVersion} (${bundle.profileStatus})`,
  );
  console.log(
    `Rules: ${bundle.summary.ruleCount}`,
  );
  console.log(
    `Statuses: ${Object.entries(
      bundle.summary.statusCounts,
    )
      .sort(([a], [b]) =>
        a.localeCompare(b),
      )
      .map(
        ([status, count]) =>
          `${status}=${count}`,
      )
      .join(", ")}`,
  );
  console.log(
    `Types: ${Object.entries(
      bundle.summary.typeCounts,
    )
      .sort(([a], [b]) =>
        a.localeCompare(b),
      )
      .map(
        ([type, count]) =>
          `${type}=${count}`,
      )
      .join(", ")}`,
  );
  console.log(
    `Canonical source SHA-256: ${bundle.source.canonicalJsonSha256}`,
  );
  console.log(
    `Output: ${relativePosix(outputPath)}`,
  );
}

const manifest = await readJson(
  manifestPath,
);

validateManifest(manifest);

for (const definition of manifest.bundles) {
  await buildBundle(definition);
}
