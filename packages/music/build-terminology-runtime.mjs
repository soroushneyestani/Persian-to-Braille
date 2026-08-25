import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const specPath = path.join(here, "spec", "terminology", "music-terminology-registry.json");
const outputPath = path.join(here, "src", "generated", "music-terminology-registry.generated.ts");
const registry = JSON.parse(fs.readFileSync(specPath, "utf8"));
if (registry?.schemaVersion !== 1) throw new Error("MUSIC_TERMINOLOGY_SPEC_ERROR: schemaVersion");
if (!Array.isArray(registry.entries) || registry.entries.length < 150) throw new Error("MUSIC_TERMINOLOGY_SPEC_ERROR: registry too small");
const keys = new Set();
for (const entry of registry.entries) {
  if (keys.has(entry.normalized)) throw new Error(`MUSIC_TERMINOLOGY_SPEC_ERROR: duplicate ${entry.normalized}`);
  keys.add(entry.normalized);
}
const source = `/* GENERATED FILE - DO NOT EDIT.
 * Source: spec/terminology/music-terminology-registry.json
 */
export const MUSIC_TERMINOLOGY_REGISTRY = ${JSON.stringify(registry, null, 2)} as const;
`;
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, source, "utf8");
console.log(`Generated terminology runtime (${registry.entries.length} entries).`);
