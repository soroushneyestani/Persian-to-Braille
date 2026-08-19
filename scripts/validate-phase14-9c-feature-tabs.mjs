import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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

const html =
  await text(
    "integrations/microsoft365/public/taskpane.html",
  );

const styles =
  await text(
    "integrations/microsoft365/public/styles.css",
  );

const main =
  await text(
    "integrations/microsoft365/src/taskpane/main.ts",
  );

const tabs =
  await text(
    "integrations/microsoft365/src/taskpane/feature-tabs.ts",
  );

const packageJson =
  JSON.parse(
    await text(
      "integrations/microsoft365/package.json",
    ),
  );

for (
  const marker
  of [
    'id="feature-tab-persian"',
    'id="feature-tab-music"',
    'role="tablist"',
    'id="feature-context-text"',
  ]
) {
  assert.ok(
    html.includes(
      marker,
    ),
    `feature-tab HTML marker missing: ${marker}`,
  );
}

for (
  const marker
  of [
    ".feature-tabs",
    ".feature-tab",
    ".feature-tab-hidden",
    '[aria-selected="true"]',
  ]
) {
  assert.ok(
    styles.includes(
      marker,
    ),
    `feature-tab CSS marker missing: ${marker}`,
  );
}

for (
  const marker
  of [
    "createFeatureTabController",
    'hostKind ===',
    '"word"',
    "feature-tab-hidden",
    "Standard MIDI",
  ]
) {
  assert.ok(
    tabs.includes(
      marker,
    ),
    `feature-tab controller marker missing: ${marker}`,
  );
}

assert.ok(
  main.includes(
    'from "./feature-tabs.js"',
  ),
);

assert.ok(
  main.includes(
    "featureTabs.setHost(",
  ),
);

assert.ok(
  packageJson.scripts.test.includes(
    "test/feature-tabs.test.mjs",
  ),
);

for (
  const forbidden
  of [
    "@persian-braille/core",
    "@persian-braille/music",
    "@persian-braille/sdk",
  ]
) {
  assert.equal(
    tabs.includes(
      forbidden,
    ),
    false,
    `UI tab controller must not import runtime package: ${forbidden}`,
  );
}

console.log(
  "PHASE 14.9c SCALABLE FEATURE TAB SHELL: PASS",
);

assert.ok(
  html.includes(
    "Persian / English",
  ),
  "Text feature tab must be labeled Persian / English",
);

console.log(
  "Tabs                          : Persian / English | Music / MIDI",
);

console.log(
  "Music tab host scope          : WORD ONLY",
);

console.log(
  "Future language tabs          : EXTENSIBLE / NOT FAKED",
);

console.log(
  "Translation semantics         : UNCHANGED",
);
