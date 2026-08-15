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
    /network-share deployment.*not supported for\s+production add-ins/is,
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

test("manual preview build copies the exact generated production manifest", async () => {
  const dist = await resolveMarketplaceDist();
  const generated = await text(path.join(dist, "manifest.xml"));
  const hosted = await text(path.join(dist, "site", "install", "manifest.xml"));

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
