import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(name) {
  return readFile(
    new URL(`../public/${name}`, import.meta.url),
    "utf8",
  );
}

async function built(name) {
  return readFile(
    new URL(`../addin-dist/${name}`, import.meta.url),
    "utf8",
  );
}

const pages = [
  "support.html",
  "privacy.html",
  "eula.html",
];

test("public compliance pages exist and use the shared compliance stylesheet", async () => {
  for (const page of pages) {
    const value = await source(page);
    assert.match(value, /compliance\.css/);
    assert.match(value, /Persian-to-Braille/);
  }
});

test("support page is public-facing and points to the project issue tracker", async () => {
  const value = await source("support.html");
  assert.match(value, /<h1>Support<\/h1>/);
  assert.match(
    value,
    /https:\/\/github\.com\/soroushneyestani\/Persian-to-Braille\/issues/,
  );
  assert.match(value, /Do not include confidential document content/);
});

test("privacy policy matches the audited client-side data-handling baseline", async () => {
  const value = await source("privacy.html");

  for (const token of [
    "Privacy Policy",
    "client-side runtime",
    "does not implement its own account",
    "does not implement application-owned persistence",
    "does not implement an application-owned",
    "Microsoft Office",
    "GitHub Pages",
    "publisher-operated backend",
  ]) {
    assert.match(value, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.doesNotMatch(
    value,
    /no network activity occurs|nothing is ever logged|no third party ever/i,
  );
});

test("privacy page contains no analytics, tracking, or executable script", async () => {
  const value = await source("privacy.html");
  assert.doesNotMatch(value, /<script\b/i);
  assert.doesNotMatch(
    value,
    /googletagmanager|google-analytics|gtag\(|mixpanel|segment\.com|sentry\.io/i,
  );
});

test("EULA references MIT, warranty limits, mandatory rights, privacy, and support", async () => {
  const value = await source("eula.html");

  for (const token of [
    "End User License Agreement",
    "MIT License",
    'provided "AS IS"',
    "mandatory applicable law",
    "./privacy.html",
    "./support.html",
  ]) {
    assert.match(value, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("all three pages cross-link to Support, Privacy, and EULA", async () => {
  for (const page of pages) {
    const value = await source(page);
    assert.match(value, /\.\/support\.html/);
    assert.match(value, /\.\/privacy\.html/);
    assert.match(value, /\.\/eula\.html/);
  }
});

test("static build publishes compliance pages and stylesheet", async () => {
  for (const file of [
    ...pages,
    "compliance.css",
  ]) {
    const value = await built(file);
    assert.ok(value.length > 0, `${file} should be present in addin-dist`);
  }
});
