import test from "node:test";
import assert from "node:assert/strict";

import {
  createForwardTranslator,
} from "../dist/index.js";

function translateOk(input) {
  const translator = createForwardTranslator();
  const result = translator.translate(input);

  assert.equal(
    result.ok,
    true,
    result.ok ? undefined : JSON.stringify(result),
  );

  return result;
}

test("translates a Persian scalar sequence end-to-end", () => {
  const result = translateOk(
    "\u0633\u0644\u0627\u0645",
  );

  assert.equal(
    result.unicodeBraille,
    "\u280E\u2807\u2801\u280D",
  );
  assert.equal(result.trace.matches.length, 4);
  assert.equal(
    result.trace.matches
      .map((match) => match.matchedText)
      .join(""),
    "\u0633\u0644\u0627\u0645",
  );
});

test("uses the canonical sequence rule in the forward pipeline", () => {
  const result = translateOk("***");

  assert.equal(
    result.unicodeBraille,
    "\u2814\u2814\u2814\u2814",
  );
  assert.deepEqual(
    result.trace.matches.map(
      (match) => match.ruleId,
    ),
    ["FA-G1-PUNC-ASTERISK-RUN-001"],
  );
});

test("emits one numeric indicator for a decimal numeric run", () => {
  const result = translateOk("1.2");

  assert.deepEqual(result.cells, [
    "3456",
    "1",
    "2",
    "12",
  ]);
  assert.equal(
    result.unicodeBraille,
    "\u283C\u2801\u2802\u2803",
  );
  assert.equal(
    result.trace.matches.filter(
      (match) =>
        match.ruleId ===
        "FA-G1-NUMRULE-001",
    ).length,
    1,
  );
});

test("does not duplicate the numeric indicator after numeric-begin", () => {
  const result = translateOk("#1");

  assert.deepEqual(result.cells, [
    "3456",
    "4",
    "1",
  ]);
  assert.equal(
    result.trace.matches.some(
      (match) =>
        match.ruleId ===
        "FA-G1-NUMRULE-001",
    ),
    false,
  );
  assert.equal(
    result.trace.matches[0].ruleId,
    "FA-G1-NUMRULE-002",
  );
});

test("keeps a fraction slash inside one numeric run", () => {
  const result = translateOk("1/2");

  assert.equal(
    result.trace.matches.filter(
      (match) =>
        match.ruleId ===
        "FA-G1-NUMRULE-001",
    ).length,
    1,
  );
  assert.equal(
    result.trace.matches.some(
      (match) =>
        match.ruleId ===
        "FA-G1-NUM-FRACTION-SLASH-001",
    ),
    true,
  );
});

test("supports all three admitted digit families as numeric runs", () => {
  for (const input of [
    "12",
    "\u06F1\u06F2",
    "\u0661\u0662",
  ]) {
    const result = translateOk(input);

    assert.equal(
      result.trace.matches.filter(
        (match) =>
          match.ruleId ===
          "FA-G1-NUMRULE-001",
      ).length,
      1,
      input,
    );
  }
});

test("wraps a contiguous lowercase Latin span with canonical dot-25 boundaries", () => {
  const result = translateOk("test");

  assert.equal(
    result.unicodeBraille,
    "\u2812\u281E\u2811\u280E\u281E\u2812",
  );

  assert.equal(
    result.trace.matches.filter(
      (match) =>
        match.ruleId ===
        "FA-G1-LATIN-MODE-002",
    ).length,
    1,
  );

  assert.equal(
    result.trace.matches.filter(
      (match) =>
        match.ruleId ===
        "FA-G1-LATIN-MODE-003",
    ).length,
    1,
  );
});

test("emits the canonical dot-6 indicator for an uppercase Latin character", () => {
  const result = translateOk("Test");

  assert.equal(
    result.unicodeBraille,
    "\u2812\u2820\u281E\u2811\u280E\u281E\u2812",
  );
  assert.equal(
    result.trace.matches.filter(
      (match) =>
        match.ruleId ===
        "FA-G1-LATIN-MODE-004",
    ).length,
    1,
  );
});

test("preserves both ZWNJ semantic layers in the forward result", () => {
  const result = translateOk("\u200C");

  assert.equal(result.unicodeBraille, "");
  assert.equal(
    result.structuralTokens.includes(
      "normalization:zwnj-orthographic-boundary",
    ),
    true,
  );
  assert.equal(
    result.structuralTokens.includes(
      "layout:shaping-control:U+200C",
    ),
    true,
  );
});

test("fails closed on an unknown ordinary character", () => {
  const translator = createForwardTranslator();
  const result = translator.translate(
    "\u{1F600}",
  );

  assert.equal(result.ok, false);

  if (result.ok) {
    return;
  }

  assert.equal(
    result.code,
    "UNKNOWN_CHARACTER",
  );
  assert.deepEqual(result.location, {
    codePointIndex: 0,
    utf16Index: 0,
  });
});

test("maps an unknown format control to preprocessing failure", () => {
  const translator = createForwardTranslator();
  const result = translator.translate(
    "\u200D",
  );

  assert.equal(result.ok, false);

  if (result.ok) {
    return;
  }

  assert.equal(
    result.code,
    "PREPROCESSING_FAILED",
  );
  assert.equal(
    result.cause.code,
    "UNKNOWN_FORMAT_CONTROL",
  );
});

test("translates an empty input deterministically", () => {
  const translator = createForwardTranslator();

  const first = translator.translate("");
  const second = translator.translate("");

  assert.deepEqual(first, second);
  assert.equal(first.ok, true);

  if (!first.ok) {
    return;
  }

  assert.deepEqual(first.cells, []);
  assert.equal(first.unicodeBraille, "");
  assert.deepEqual(first.structuralTokens, []);
  assert.deepEqual(first.trace.matches, []);
});

test("preserves rule lifecycle provenance in the execution trace", () => {
  const latin = translateOk("a");
  const sequence = translateOk("***");

  assert.equal(
    latin.trace.matches.some(
      (match) =>
        match.ruleId ===
          "FA-G1-LATIN-027" &&
        match.lifecycleStatus ===
          "candidate",
    ),
    true,
  );

  assert.equal(
    sequence.trace.matches.some(
      (match) =>
        match.ruleId ===
          "FA-G1-PUNC-ASTERISK-RUN-001" &&
        match.lifecycleStatus ===
          "normative",
    ),
    true,
  );
});

test("returns deterministic forward-translation results", () => {
  const translator = createForwardTranslator();
  const input =
    "\u0633\u0644\u0627\u0645 1.2 Test";

  assert.deepEqual(
    translator.translate(input),
    translator.translate(input),
  );
});
