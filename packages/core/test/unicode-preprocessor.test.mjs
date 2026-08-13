import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  createUnicodePreprocessor,
  getBundledSpecification,
} from "../dist/index.js";

const FORMAT_CONTROL_PATTERN = /\p{General_Category=Format}/u;

function admittedFormatControlRules() {
  const specification = getBundledSpecification();
  const byCharacter = new Map();

  for (const rule of specification.rules) {
    const text = rule?.input?.text;

    if (
      typeof text !== "string" ||
      Array.from(text).length !== 1 ||
      !FORMAT_CONTROL_PATTERN.test(text)
    ) {
      continue;
    }

    const current = byCharacter.get(text) ?? [];
    current.push({
      id: rule.id,
      status: rule.status,
      structuralToken: rule?.output?.structuralToken,
    });
    byCharacter.set(text, current);
  }

  return byCharacter;
}

test("preserves ordinary Persian text without mutation", () => {
  const preprocessor = createUnicodePreprocessor();
  const input = "سلام دنیا ۱۲۳";
  const result = preprocessor.normalize(input);

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.inputText, input);
  assert.equal(result.outputText, input);
  assert.equal(result.changed, false);
  assert.deepEqual(result.annotations, []);
  assert.deepEqual(result.policy, {
    profileId: "fa-ir-g1",
    profileVersion: "0.1.0",
    unicodeForm: "none",
    unknownFormatControls: "error",
  });
});

test("does not invent Persian/Arabic orthographic remapping", () => {
  const preprocessor = createUnicodePreprocessor();

  // U+064A ARABIC LETTER YEH and U+0643 ARABIC LETTER KAF remain untouched.
  const input = "\u064A\u0643";
  const result = preprocessor.normalize(input);

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.outputText, input);
  assert.equal(result.changed, false);
  assert.deepEqual(result.annotations, []);
});

test("recognizes every admitted single-code-point format control from the canonical specification", () => {
  const preprocessor = createUnicodePreprocessor();
  const expected = admittedFormatControlRules();

  assert.ok(expected.size > 0);

  for (const [character, rules] of expected) {
    const result = preprocessor.normalize(character);

    assert.equal(result.ok, true);
    if (!result.ok) continue;

    assert.equal(result.outputText, character);
    assert.equal(result.changed, false);
    assert.equal(result.annotations.length, 1);

    const annotation = result.annotations[0];
    assert.equal(annotation.kind, "recognized-format-control");
    assert.equal(annotation.character, character);
    assert.deepEqual(
      annotation.ruleIds,
      rules.map((rule) => rule.id),
    );
    assert.deepEqual(
      annotation.ruleStatuses,
      rules.map((rule) => rule.status),
    );
    assert.deepEqual(
      annotation.structuralTokens,
      rules.flatMap((rule) =>
        typeof rule.structuralToken === "string"
          ? [rule.structuralToken]
          : [],
      ),
    );
  }
});

test("satisfies the canonical draft ZWNJ normalization conformance vector", async () => {
  const vectorUrl = new URL(
    "../../../spec/fa-ir/conformance/records/fa-conf-norm-zwnj-001.json",
    import.meta.url,
  );
  const vector = JSON.parse(await readFile(vectorUrl, "utf8"));

  const preprocessor = createUnicodePreprocessor();
  const result = preprocessor.normalize(vector.input.text);

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.outputText, vector.input.text);
  assert.equal(result.annotations.length, 1);

  const annotation = result.annotations[0];

  for (const ruleId of vector.ruleIds) {
    assert.ok(
      annotation.ruleIds.includes(ruleId),
      `Missing conformance rule ${ruleId}`,
    );
  }

  for (const structuralToken of vector.expected.structuralTokens) {
    assert.ok(
      annotation.structuralTokens.includes(structuralToken),
      `Missing conformance structural token ${structuralToken}`,
    );
  }
});

test("preserves the intentional cross-layer ZWNJ representation", () => {
  const preprocessor = createUnicodePreprocessor();
  const result = preprocessor.normalize("\u200C");

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.annotations.length, 1);
  const annotation = result.annotations[0];

  assert.equal(annotation.codePoint, "U+200C");
  assert.deepEqual(annotation.ruleIds, [
    "FA-G1-LAYOUT-027",
    "FA-G1-NORM-ZWNJ-001",
  ]);
  assert.deepEqual(annotation.structuralTokens, [
    "layout:shaping-control:U+200C",
    "normalization:zwnj-orthographic-boundary",
  ]);
  assert.deepEqual(annotation.ruleStatuses, [
    "candidate",
    "candidate",
  ]);
});

test("reports both code-point and UTF-16 positions after a supplementary character", () => {
  const preprocessor = createUnicodePreprocessor();
  const input = "A\u{1F600}\u200CB";
  const result = preprocessor.normalize(input);

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.annotations.length, 1);
  assert.deepEqual(result.annotations[0].location, {
    codePointIndex: 2,
    utf16Index: 3,
  });
});

test("rejects an unknown Unicode format control without mutating it", () => {
  const preprocessor = createUnicodePreprocessor();
  const input = "A\u{1F600}\u200DB";
  const result = preprocessor.normalize(input);

  assert.equal(result.ok, false);
  if (result.ok) return;

  assert.equal(result.code, "UNKNOWN_FORMAT_CONTROL");
  assert.equal(result.codePoint, "U+200D");
  assert.equal(result.character, "\u200D");
  assert.deepEqual(result.location, {
    codePointIndex: 2,
    utf16Index: 3,
  });
  assert.deepEqual(result.policy, {
    profileId: "fa-ir-g1",
    profileVersion: "0.1.0",
    unicodeForm: "none",
    unknownFormatControls: "error",
  });
});

test("returns deterministic results for repeated preprocessing", () => {
  const preprocessor = createUnicodePreprocessor();
  const input = "الف\u200Cب\u200Bج\u2060د\uFEFFه";

  const first = preprocessor.normalize(input);
  const second = preprocessor.normalize(input);

  assert.deepEqual(second, first);
});

test("is idempotence-compatible under the current no-rewrite policy", () => {
  const preprocessor = createUnicodePreprocessor();
  const input = "الف\u200Cب";

  const first = preprocessor.normalize(input);
  assert.equal(first.ok, true);
  if (!first.ok) return;

  const second = preprocessor.normalize(first.outputText);
  assert.deepEqual(second, first);
});
