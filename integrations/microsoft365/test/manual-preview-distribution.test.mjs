import assert from "node:assert/strict";
import {
  access,
  readFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const here = path.dirname(fileURLToPath(import.meta.url));
const microsoft365Root = path.resolve(here, "..");
const repoRoot = path.resolve(microsoft365Root, "../..");

async function text(filePath) {
  return readFile(filePath, "utf8");
}

async function bytes(filePath) {
  return readFile(filePath);
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function resolveMarketplaceDist() {
  const candidates = [
    path.join(repoRoot, "marketplace-dist"),
    path.join(microsoft365Root, "marketplace-dist"),
  ];

  for (const candidate of candidates) {
    if (
      await exists(path.join(candidate, "manifest.xml"))
      && await exists(path.join(candidate, "site"))
    ) {
      return candidate;
    }
  }

  throw new Error("Unable to locate generated marketplace-dist.");
}

test("public install page clearly identifies manual preview distribution", async () => {
  const page = await text(
    path.join(microsoft365Root, "public", "install.html"),
  );

  assert.match(page, /Manual Preview Installation/);
  assert.match(
    page,
    /not currently published through Microsoft\s+Marketplace/,
  );
  assert.match(page, /Upload My Add-in/);
  assert.match(page, /Settings → Integrated apps/);
  assert.match(
    page,
    /network-share deployment.*not supported\s+for production add-ins/is,
  );
  assert.match(
    page,
    /Manual Preview \/ Sideload Distribution — not Microsoft Marketplace\s+publication\./s,
  );
});

test("install page exposes the stable hosted production manifest", async () => {
  const page = await text(
    path.join(microsoft365Root, "public", "install.html"),
  );

  assert.match(page, /\.\/install\/manifest\.xml/);
  assert.match(
    page,
    /https:\/\/soroushneyestani\.github\.io\/Persian-to-Braille\/install\/manifest\.xml/,
  );
});

test("Windows preview section documents installer and final Office UI steps", async () => {
  const page = await text(
    path.join(microsoft365Root, "public", "install.html"),
  );

  for (const expected of [
    "Windows Desktop Preview",
    "./install/windows/Persian-to-Braille-Windows-Preview-Installer.cmd",
    "راهنمای نصب نسخه دسکتاپ ویندوز",
    "Get Add-ins",
    "Advanced",
    "SHARED FOLDER",
    "Persian-to-Braille",
    "Translate Selection",
    "not Microsoft Marketplace publication",
  ]) {
    assert.ok(page.includes(expected), `missing ${expected}`);
  }
});

test("install page publishes the three validated Windows screenshots", async () => {
  const page = await text(
    path.join(microsoft365Root, "public", "install.html"),
  );

  for (const filename of [
    "word-selection.png",
    "excel-text-cell.png",
    "powerpoint-text-range.png",
  ]) {
    assert.match(
      page,
      new RegExp(`\\.\\/install\\/screenshots\\/${filename.replace(".", "\\.")}`),
    );
  }
});

test("Windows installer sources are ASCII-only preview tooling", async () => {
  const windowsDir = path.join(
    microsoft365Root,
    "public",
    "install",
    "windows",
  );

  const bootstrapper = await bytes(
    path.join(
      windowsDir,
      "Persian-to-Braille-Windows-Preview-Installer.cmd",
    ),
  );
  const helper = await bytes(
    path.join(windowsDir, "windows-preview-setup.ps1"),
  );

  for (const [label, content] of [
    ["bootstrapper", bootstrapper],
    ["helper", helper],
  ]) {
    assert.equal(
      [...content].every((byte) => byte < 0x80),
      true,
      `${label} must remain ASCII-only for Windows PowerShell 5.1 safety`,
    );
  }

  const bootstrapperText = bootstrapper.toString("utf8");
  const helperText = helper.toString("utf8");

  assert.match(
    bootstrapperText,
    /windows-preview-setup\.ps1/,
  );
  assert.match(
    bootstrapperText,
    /ExecutionPolicy Bypass/,
  );
  assert.doesNotMatch(bootstrapperText, /localhost/i);

  assert.match(
    helperText,
    /HKCU:\\Software\\Microsoft\\Office\\16\.0\\WEF\\TrustedCatalogs/,
  );
  assert.match(helperText, /New-SmbShare/);
  assert.match(helperText, /Flags/);
  assert.match(helperText, /SHARED FOLDER/);
  assert.doesNotMatch(helperText, /Stop-Process/);
  assert.doesNotMatch(helperText, /localhost/i);
});

test("manual preview build copies the exact generated production manifest", async () => {
  const dist = await resolveMarketplaceDist();
  const generated = await text(path.join(dist, "manifest.xml"));
  const hosted = await text(
    path.join(dist, "site", "install", "manifest.xml"),
  );

  assert.equal(hosted, generated);
  assert.doesNotMatch(hosted, /localhost/);
  assert.match(
    hosted,
    /https:\/\/soroushneyestani\.github\.io\/Persian-to-Braille\//,
  );
});

test("manual preview page is included in the generated Pages site", async () => {
  const dist = await resolveMarketplaceDist();
  const source = await text(
    path.join(microsoft365Root, "public", "install.html"),
  );
  const built = await text(path.join(dist, "site", "install.html"));

  assert.equal(built, source);
});

test("manual preview build publishes exact Windows installer sources", async () => {
  const dist = await resolveMarketplaceDist();

  const sourceDir = path.join(
    microsoft365Root,
    "public",
    "install",
    "windows",
  );
  const hostedDir = path.join(
    dist,
    "site",
    "install",
    "windows",
  );

  for (const filename of [
    "Persian-to-Braille-Windows-Preview-Installer.cmd",
    "windows-preview-setup.ps1",
  ]) {
    assert.deepEqual(
      await bytes(path.join(hostedDir, filename)),
      await bytes(path.join(sourceDir, filename)),
    );
  }
});

test("manual preview build publishes exact Phase 11.4d screenshot assets", async () => {
  const dist = await resolveMarketplaceDist();

  const sourceDir = path.join(
    microsoft365Root,
    "marketplace",
    "listing",
    "assets",
    "screenshots",
  );
  const hostedDir = path.join(
    dist,
    "site",
    "install",
    "screenshots",
  );

  for (const filename of [
    "word-selection.png",
    "excel-text-cell.png",
    "powerpoint-text-range.png",
  ]) {
    assert.deepEqual(
      await bytes(path.join(hostedDir, filename)),
      await bytes(path.join(sourceDir, filename)),
    );
  }
});

test(
  "install page documents Phase 14 Braille Music selected-line workflow",
  async () => {
    const page =
      await text(
        path.join(
          microsoft365Root,
          "public",
          "install.html",
        ),
      );

    for (const expected of [
      "Braille Music from MIDI",
      "Microsoft Word Desktop",
      ".mid",
      ".midi",
      "Music / MIDI",
      "Track + Channel",
      "Preview Music Braille",
      "Unicode Music Braille",
      "BRF / Braille ASCII",
      "Insert Music Braille",
      "current Word caret or selection",
      "All Lines",
    ]) {
      assert.ok(
        page.includes(
          expected,
        ),
        `missing Phase 14 public install-page marker: ${expected}`,
      );
    }

    assert.match(
      page,
      /Choose exactly one MIDI line\./,
    );

    assert.match(
      page,
      /No notes inside the selected line are automatically removed/,
    );

    assert.match(
      page,
      /fail explicitly instead of silently\s+deleting or simplifying musical material/s,
    );
  },
);

test(
  "install page publishes the final Phase 14 Braille Music Word presentation screenshot",
  async () => {
    const page =
      await text(
        path.join(
          microsoft365Root,
          "public",
          "install.html",
        ),
      );

    assert.match(
      page,
      /phase14-braille-music-word-mozart\.png/,
    );

    assert.match(
      page,
      /Braille Music in Word — live preview/,
    );

    const sourceImage =
      path.join(
        microsoft365Root,
        "public",
        "install",
        "screenshots",
        "phase14-braille-music-word-mozart.png",
      );

    assert.equal(
      await exists(
        sourceImage,
      ),
      true,
    );

    const dist =
      await resolveMarketplaceDist();

    const generatedImage =
      path.join(
        dist,
        "site",
        "install",
        "screenshots",
        "phase14-braille-music-word-mozart.png",
      );

    assert.equal(
      await exists(
        generatedImage,
      ),
      true,
    );

    assert.deepEqual(
      await readFile(
        generatedImage,
      ),
      await readFile(
        sourceImage,
      ),
    );
  },
);
