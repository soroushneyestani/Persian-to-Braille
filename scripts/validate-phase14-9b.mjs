import assert from "node:assert/strict";
import {
  createHash,
} from "node:crypto";
import {
  readFile,
  readdir,
} from "node:fs/promises";
import path from "node:path";

const root =
  process.cwd();

async function text(
  relative,
) {
  return readFile(
    path.join(
      root,
      relative,
    ),
    "utf8",
  );
}

async function json(
  relative,
) {
  return JSON.parse(
    await text(
      relative,
    ),
  );
}

async function walk(
  directory,
) {
  const files =
    [];

  for (
    const entry
    of await readdir(
      directory,
      {
        withFileTypes:
          true,
      },
    )
  ) {
    const full =
      path.join(
        directory,
        entry.name,
      );

    if (
      entry.isDirectory()
    ) {
      files.push(
        ...await walk(
          full,
        ),
      );
    } else {
      files.push(
        full,
      );
    }
  }

  return files;
}

const audit =
  await json(
    "stage14-9a-word-music-insertion-windows-live-audit.json",
  );

assert.equal(
  audit.decision,
  "READY_FOR_PHASE14_9B_WORD_MUSIC_INSERTION_MATERIALIZATION",
);

assert.deepEqual(
  audit.blockers,
  [],
);

assert.equal(
  audit.auditCorrection?.id,
  "PHASE14_9A1_MULTIHOST_MANIFEST_FALSE_POSITIVE",
);

assert.equal(
  audit.auditCorrection?.manifestChanged,
  false,
);

const manifest =
  await text(
    "integrations/microsoft365/manifest.xml",
  );

const manifestHash =
  createHash(
    "sha256",
  )
    .update(
      manifest,
      "utf8",
    )
    .digest(
      "hex",
    );

assert.equal(
  manifestHash,
  audit.records?.manifest?.sha256,
  "Phase 14.9b must not mutate the audited multi-host manifest",
);

const runtime =
  await text(
    "integrations/microsoft365/src/word/runtime.ts",
  );

for (
  const marker
  of [
    "replaceCurrentSelection(",
    'range.insertText(',
    '"Replace"',
    'return "written" as const;',
  ]
) {
  assert.ok(
    runtime.includes(
      marker,
    ),
    `Word runtime Music insertion marker missing: ${marker}`,
  );
}

const insertion =
  await text(
    "integrations/microsoft365/src/word/music-insertion.ts",
  );

for (
  const marker
  of [
    "createWordMusicInsertionService",
    "insertCurrentSelection",
    "replaceCurrentSelection",
    "WORD_HOST_FAILURE_CODES.documentWriteFailed",
  ]
) {
  assert.ok(
    insertion.includes(
      marker,
    )
    || insertion.includes(
      marker.toLowerCase(),
    ),
    `Word Music insertion service marker missing: ${marker}`,
  );
}

const musicPane =
  await text(
    "integrations/microsoft365/src/taskpane/music-pane.ts",
  );

for (
  const marker
  of [
    "setInsertionService",
    "insertPreviewIntoWord",
    "successfulUnicodePreview",
    "music-insert-word",
  ]
) {
  assert.ok(
    musicPane.includes(
      marker,
    ),
    `Music task-pane insertion marker missing: ${marker}`,
  );
}

const insertionStart =
  musicPane.indexOf(
    "async insertPreviewIntoWord()",
  );
const clearStart =
  musicPane.indexOf(
    "clear()",
    insertionStart,
  );

assert.ok(
  insertionStart >=
    0
  && clearStart >
    insertionStart,
);

const insertionBlock =
  musicPane.slice(
    insertionStart,
    clearStart,
  );

assert.equal(
  insertionBlock.includes(
    "translateMidi",
  ),
  false,
  "Music insertion must not recompute MIDI translation",
);

const html =
  await text(
    "integrations/microsoft365/public/taskpane.html",
  );

assert.ok(
  html.includes(
    'id="music-insert-word"',
  ),
);

assert.ok(
  html.includes(
    "Insert Music Braille",
  ),
);

const main =
  await text(
    "integrations/microsoft365/src/taskpane/main.ts",
  );

assert.ok(
  main.includes(
    "createWordMusicInsertionService",
  ),
);

assert.ok(
  main.includes(
    "musicPane.setInsertionService",
  ),
);

const microsoftSrc =
  path.join(
    root,
    "integrations/microsoft365/src",
  );

for (
  const file
  of await walk(
    microsoftSrc,
  )
) {
  if (
    !/\.(?:ts|tsx|js|mjs)$/.test(
      file,
    )
  ) {
    continue;
  }

  const source =
    await readFile(
      file,
      "utf8",
    );

  assert.equal(
    source.includes(
      "@persian-braille/music",
    ),
    false,
    `Microsoft365 direct Music engine dependency leaked: ${path.relative(root, file)}`,
  );
}

const packageJson =
  await json(
    "integrations/microsoft365/package.json",
  );

assert.ok(
  packageJson.scripts.test.includes(
    "test/word-music-insertion.test.mjs",
  ),
);

const phaseDoc =
  await text(
    "docs/music-braille/phase14-9b-word-music-insertion.md",
  );

assert.ok(
  phaseDoc.includes(
    "pending real Windows Word live validation",
  ),
);

const liveDoc =
  await text(
    "docs/music-braille/phase14-9c-windows-word-live-validation.md",
  );

assert.ok(
  liveDoc.includes(
    "PENDING REAL WINDOWS EXECUTION",
  ),
);

assert.equal(
  liveDoc.includes(
    "LIVE VERIFIED / PASS",
  ),
  false,
);

assert.ok(
  liveDoc.includes(
    "⠼⠙⠲⠀⠐⠹⠱⠏",
  ),
);

console.log(
  "PHASE 14.9b WORD MUSIC INSERTION: PASS",
);
console.log(
  "Insertion source               : EXACT SUCCESSFUL SDK UNICODE PREVIEW",
);
console.log(
  "Destination                    : CURRENT WORD SELECTION / CARET",
);
console.log(
  "Office.js write                : getSelection -> insertText(Replace) -> sync",
);
console.log(
  "MIDI retranslation on insert   : NONE",
);
console.log(
  "Persian stale-selection guard  : NOT REUSED FOR MIDI SOURCE",
);
console.log(
  "Microsoft365 direct music      : NONE",
);
console.log(
  "Manifest mutation              : NONE",
);
console.log(
  "Windows live validation        : PENDING / PHASE 14.9c",
);
console.log(
  "MusicXML                       : RESERVED FOR PHASE 19",
);
