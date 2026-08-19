import assert from "node:assert/strict";
import {
  readFile,
} from "node:fs/promises";
import path from "node:path";

const root =
  process.cwd();

async function text(
  relativePath,
) {
  return readFile(
    path.join(
      root,
      relativePath,
    ),
    "utf8",
  );
}

async function json(
  relativePath,
) {
  return JSON.parse(
    await text(
      relativePath,
    ),
  );
}

const acceptance =
  await json(
    "docs/music-braille/phase14-9c-windows-word-live-acceptance.json",
  );

assert.equal(
  acceptance.phase,
  "14.9c-windows-word-live-acceptance",
);

assert.equal(
  acceptance.decision,
  "READY_FOR_PHASE14_10_REGRESSION_DOCS_AND_PHASE14_CLOSURE",
);

assert.equal(
  acceptance.manualEvidence.wordInsertionObserved,
  true,
);

assert.equal(
  acceptance.manualEvidence.samePreviewInsertedAtTwoDifferentCaretLocations,
  true,
);

assert.equal(
  acceptance.manualEvidence.sourceLineSelectorVisible,
  true,
);

assert.equal(
  acceptance.productContract.phase14Selection,
  "exactly one source line",
);

assert.equal(
  acceptance.productContract.sourceLineDefinition,
  "track+channel",
);

assert.equal(
  acceptance.productContract.allLinesUi,
  "not exposed",
);

assert.equal(
  acceptance.productContract.multiSelectUi,
  "not exposed",
);

assert.equal(
  acceptance.productContract.automaticNoteFilteringInsideSelectedLine,
  false,
);

const sourceLine =
  await text(
    "packages/music/src/midi-source-line.ts",
  );

for (const marker of [
  "inspectMidiSourceLines",
  "selectMidiSourceLine",
  "source.notes.filter",
  "source.parts.filter",
]) {
  assert.ok(
    sourceLine.includes(
      marker,
    ),
    `missing source-line engine marker: ${marker}`,
  );
}

const sdkApi =
  await text(
    "packages/sdk/src/music-public-api.ts",
  );

for (const marker of [
  "MusicBrailleMidiSourceLineSelection",
  "inspectMidi(",
  "translateMidiLine(",
]) {
  assert.ok(
    sdkApi.includes(
      marker,
    ),
    `missing SDK selected-line marker: ${marker}`,
  );
}

const pane =
  await text(
    "integrations/microsoft365/src/taskpane/music-pane.ts",
  );

const html =
  await text(
    "integrations/microsoft365/public/taskpane.html",
  );

assert.ok(
  pane.includes(
    "translator.inspectMidi(",
  ),
);

assert.ok(
  pane.includes(
    "translator.translateMidiLine(",
  ),
);

assert.ok(
  html.includes(
    'id="music-source-line"',
  ),
);

assert.equal(
  pane.includes(
    "@persian-braille/music",
  ),
  false,
);

assert.equal(
  html.includes(
    "All Lines",
  ),
  false,
);

const closure =
  await json(
    "docs/music-braille/phase14-closure.json",
  );

assert.equal(
  closure.phase,
  "Phase 14 — Braille Music",
);

assert.equal(
  closure.status,
  "COMPLETE",
);

assert.equal(
  closure.productionWorkflow.selection,
  "exactly-one-source-line",
);

assert.equal(
  closure.productionWorkflow.wordDesktopWindowsLiveAcceptance,
  "PASS",
);

assert.equal(
  closure.deferred.musicXml,
  "Phase 19",
);

assert.equal(
  closure.decision,
  "READY_TO_COMMIT_PHASE14_BRAILLE_MUSIC",
);

console.log(
  "PHASE 14 — BRAILLE MUSIC CLOSURE: PASS",
);

console.log(
  "Product input                   : MIDI .mid/.midi",
);

console.log(
  "Phase 14 selection              : EXACTLY ONE SOURCE LINE",
);

console.log(
  "Source line                     : TRACK + CHANNEL",
);

console.log(
  "Word Desktop / Windows          : LIVE ACCEPTED",
);

console.log(
  "All Lines / multi-select        : NOT EXPOSED",
);

console.log(
  "Automatic note filtering        : NONE",
);

console.log(
  "Known unsupported lines         : FAIL CLOSED / DOCUMENTED",
);

console.log(
  "MusicXML                        : PHASE 19",
);

console.log(
  "Decision                        : READY_TO_COMMIT_PHASE14_BRAILLE_MUSIC",
);
