import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

async function text(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

async function json(relativePath) {
  return JSON.parse(await text(relativePath));
}

async function walk(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      result.push(...await walk(full));
    } else {
      result.push(full);
    }
  }
  return result;
}

const audit = await json(
  "stage14-8a-word-music-taskpane-file-picker-audit.json",
);
assert.equal(
  audit.decision,
  "READY_FOR_PHASE14_8B_WORD_MUSIC_TASKPANE_FILE_PICKER_PREVIEW_MATERIALIZATION",
);
assert.deepEqual(audit.blockers, []);

const html = await text("integrations/microsoft365/public/taskpane.html");
const main = await text("integrations/microsoft365/src/taskpane/main.ts");
const musicPane = await text(
  "integrations/microsoft365/src/taskpane/music-pane.ts",
);
const buildAddin = await text("integrations/microsoft365/build-addin.mjs");
const microsoftPackage = await json(
  "integrations/microsoft365/package.json",
);
const boundary = await text(
  "tools/architecture/validate-package-boundaries.mjs",
);
const docs = await text(
  "docs/music-braille/phase14-8b-word-music-taskpane-preview.md",
);

for (const marker of [
  'id="music-braille-section"',
  'id="music-midi-file"',
  'accept=".mid,.midi"',
  'id="music-preview-midi"',
  'id="music-unicode-output"',
  'id="music-brf-output"',
  '"@persian-braille/music": "./vendor/music/index.js"',
]) {
  assert.ok(html.includes(marker), `Task-pane marker missing: ${marker}`);
}

assert.ok(main.includes('from "./music-pane.js"'));
assert.ok(main.includes("musicPane.setHost("));
assert.ok(musicPane.includes('from "@persian-braille/sdk"'));
assert.ok(musicPane.includes("createMusicBrailleMidiTranslator"));
assert.ok(musicPane.includes(".arrayBuffer()"));

for (const forbidden of [
  "@persian-braille/music",
  "localStorage",
  "sessionStorage",
  "fetch(",
  "XMLHttpRequest",
]) {
  assert.equal(
    musicPane.includes(forbidden),
    false,
    `Forbidden Music task-pane marker: ${forbidden}`,
  );
}

for (const file of await walk(
  path.join(root, "integrations/microsoft365/src"),
)) {
  if (!/\.(?:ts|tsx|js|mjs)$/.test(file)) continue;
  const source = await readFile(file, "utf8");
  assert.equal(
    source.includes("@persian-braille/music"),
    false,
    `Microsoft365 direct music dependency leaked: ${path.relative(root, file)}`,
  );
}

for (const marker of [
  "packages/music/dist",
  '"vendor/music"',
  "SDK -> Music",
]) {
  assert.ok(buildAddin.includes(marker), `Build closure missing: ${marker}`);
}

assert.ok(
  microsoftPackage.scripts.typecheck.includes("@persian-braille/music"),
);
assert.ok(
  microsoftPackage.scripts.test.includes("@persian-braille/music"),
);
assert.ok(
  microsoftPackage.scripts.test.includes("test/music-taskpane.test.mjs"),
);

assert.ok(boundary.includes('console.log("  music -> none");'));
assert.ok(boundary.includes('console.log("  sdk -> core + music");'));
assert.equal(boundary.includes('console.log("  sdk -> core");'), false);

const musicStart = html.indexOf('id="music-braille-section"');
const textResult = html.indexOf('id="translation-result"');
const musicSection = html.slice(musicStart, textResult);
assert.equal(musicSection.includes("replace-selection"), false);
assert.equal(musicSection.includes("insert-after-selection"), false);

for (const marker of ["Phase 14.9", "Phase 14.10", "MusicXML", "Phase 19"]) {
  assert.ok(docs.includes(marker));
}

console.log("PHASE 14.8b WORD MUSIC TASK PANE + MIDI FILE PICKER PREVIEW: PASS");
console.log("Host scope                     : WORD ONLY");
console.log("MIDI file picker               : .mid + .midi");
console.log("Browser read                   : File.arrayBuffer()");
console.log("Music translation boundary     : Microsoft365 -> SDK");
console.log("Microsoft365 direct music      : NONE");
console.log("Static browser closure         : Core + Music + SDK");
console.log("Word insertion                 : DEFERRED TO PHASE 14.9");
console.log("MusicXML                       : RESERVED FOR PHASE 19");
