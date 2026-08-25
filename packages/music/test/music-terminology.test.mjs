import test from "node:test";
import assert from "node:assert/strict";
import { musicTerminologyRegistryInfo, resolveMusicTerminology } from "../dist/music-terminology.js";

test("terminology registry is substantive and generated from spec", () => {
  const info = musicTerminologyRegistryInfo();
  assert.equal(info.id, "braille-hub-music-terminology-v1");
  assert.ok(info.canonicalEntryCount >= 150);
  assert.ok(info.aliasCount >= 20);
});

for (const [source, tag] of [
  ["Allegro", "fast"],
  ["Adagio sostenuto", "slow"],
  ["con brio", "spirited"],
  ["senza sordini", "mute-off"],
  ["dolce", "sweet"],
]) {
  test(`recognizes ${source}`, () => {
    const r = resolveMusicTerminology(source);
    assert.equal(r.recognized, true);
    assert.equal(r.semanticTags.includes(tag), true);
  });
}

test("canonical aliases resolve", () => {
  const c = resolveMusicTerminology("cresc.");
  assert.equal(c.entries[0].term, "crescendo");
  assert.equal(c.policy, "canonical-word-expression");
  const d = resolveMusicTerminology("dim.");
  assert.equal(d.entries[0].term, "diminuendo");
});

test("navigation is semantic structural fail-closed", () => {
  for (const source of ["D.C. al Fine","D.S.","Coda","Fine","Attacca"]) {
    const r = resolveMusicTerminology(source);
    assert.equal(r.recognized, true, source);
    assert.equal(r.policy, "structural-fail-closed", source);
    assert.equal(r.semanticTags.includes("navigation"), true, source);
  }
});

test("register instructions are structural", () => {
  for (const source of ["8va","8vb","loco"]) {
    const r = resolveMusicTerminology(source);
    assert.equal(r.recognized, true);
    assert.equal(r.policy, "structural-fail-closed");
  }
});

test("known sequence uses longest semantic matching", () => {
  const r = resolveMusicTerminology("molto dolce e cantabile");
  assert.equal(r.kind, "sequence");
  assert.equal(r.recognized, true);
  assert.equal(r.semanticTags.includes("sweet"), true);
  assert.equal(r.semanticTags.includes("singing"), true);
});

test("free composer instruction becomes BANA fallback candidate", () => {
  const r = resolveMusicTerminology("Si deve suonare tutto questo pezzo delicatissimamente e senza sordini");
  assert.equal(r.kind, "free-text");
  assert.equal(r.policy, "bana-word-expression-fallback");
  assert.equal(r.semanticTags.includes("mute-off"), true);
});

test("continuation fragment is explicit", () => {
  const r = resolveMusicTerminology("-");
  assert.equal(r.kind, "continuation-fragment");
  assert.equal(r.policy, "explicit-fail-closed");
});

test("private-use glyph is explicit", () => {
  const r = resolveMusicTerminology(`[${String.fromCodePoint(0xe107)} ]`);
  assert.equal(r.kind, "unsupported-glyph");
});
