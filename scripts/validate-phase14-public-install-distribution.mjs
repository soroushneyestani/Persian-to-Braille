import assert from "node:assert/strict";
import {
  access,
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

async function exists(
  relativePath,
) {
  try {
    await access(
      path.join(
        root,
        relativePath,
      ),
    );

    return true;
  } catch {
    return false;
  }
}

const installSource =
  await text(
    "integrations/microsoft365/public/install.html",
  );

for (const marker of [
  'id="phase14-current-features"',
  "Braille Music from MIDI",
  "Persian / English",
  "uncontracted six-dot English/Latin",
  "Microsoft Word Desktop",
  ".mid",
  ".midi",
  "Music / MIDI",
  "Track + Channel",
  "Choose exactly one MIDI line",
  "Preview Music Braille",
  "Unicode Music Braille",
  "BRF / Braille ASCII",
  "Insert Music Braille",
  "current Word caret or selection",
  "All Lines",
  "not currently published through Microsoft",
]) {
  assert.ok(
    installSource.includes(
      marker,
    ),
    `public install source missing marker: ${marker}`,
  );
}

const workflow =
  await text(
    ".github/workflows/microsoft365-marketplace-pages.yml",
  );

assert.ok(
  workflow.includes(
    "- phase14-braille-music",
  ),
  "GitHub Pages workflow must deploy pushes from the Phase 14 branch.",
);

assert.ok(
  workflow.includes(
    '"packages/music/**"',
  ),
  "GitHub Pages workflow must rebuild when the Music package changes.",
);

const generatedInstall =
  await text(
    "integrations/microsoft365/marketplace-dist/site/install.html",
  );

assert.equal(
  generatedInstall,
  installSource,
  "generated Pages install.html must exactly match the committed install-page source",
);

const generatedTaskpane =
  await text(
    "integrations/microsoft365/marketplace-dist/site/taskpane.html",
  );

for (const marker of [
  "Persian / English",
  "Music / MIDI",
  'id="music-source-line"',
  "Choose one MIDI line",
  "Preview Music Braille",
  "Insert Music Braille",
]) {
  assert.ok(
    generatedTaskpane.includes(
      marker,
    ),
    `generated production task pane missing Phase 14 marker: ${marker}`,
  );
}

const generatedManifest =
  await text(
    "integrations/microsoft365/marketplace-dist/site/install/manifest.xml",
  );

assert.doesNotMatch(
  generatedManifest,
  /localhost/i,
);

assert.match(
  generatedManifest,
  /https:\/\/soroushneyestani\.github\.io\/Persian-to-Braille\//,
);

assert.equal(
  await exists(
    "integrations/microsoft365/marketplace-dist/site/install/windows/Braille-Hub-Windows-Preview-Installer.cmd",
  ),
  true,
  "Windows public preview installer must remain in the generated Pages site",
);

assert.equal(
  await exists(
    "integrations/microsoft365/marketplace-dist/site/install/windows/windows-preview-setup.ps1",
  ),
  true,
  "Windows setup helper must remain in the generated Pages site",
);


assert.equal(
  await exists(
    "integrations/microsoft365/marketplace-dist/site/install/screenshots/phase14-braille-music-word-mozart.png",
  ),
  true,
  "Final Phase 14 Braille Music Word presentation screenshot must be present in the generated Pages site",
);

const closure =
  JSON.parse(
    await text(
      "docs/music-braille/phase14-closure.json",
    ),
  );

assert.equal(
  closure.status,
  "COMPLETE",
);

assert.equal(
  closure.decision,
  "READY_TO_COMMIT_PHASE14_BRAILLE_MUSIC",
);

console.log(
  "PHASE 14 PUBLIC INSTALL DISTRIBUTION: PASS",
);

console.log(
  "Install page                    : PHASE 14 BRAILLE MUSIC DOCUMENTED",
);

console.log(
  "Production task pane            : MUSIC / MIDI + SOURCE-LINE SELECTOR PRESENT",
);

console.log(
  "Hosted manifest                 : PRODUCTION HTTPS / NO LOCALHOST",
);

console.log(
  "Windows preview installer       : PRESENT",
);

console.log(
  "GitHub Pages branch trigger     : phase14-braille-music",
);

console.log(
  "GitHub Pages Music path trigger : packages/music/**",
);

console.log(
  "Publication classification      : MANUAL SIDELOAD PREVIEW / NOT MARKETPLACE",
);

console.log(
  "Decision                        : READY_TO_COMMIT_AND_DEPLOY_PHASE14_BRAILLE_MUSIC",
);
