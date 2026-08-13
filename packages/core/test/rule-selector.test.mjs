import test from "node:test";
import assert from "node:assert/strict";

import {
  createRuleSelector,
} from "../dist/index.js";

test("selects the canonical asterisk sequence before its scalar component", () => {
  const selector = createRuleSelector();
  const result = selector.select("***", 0);

  assert.equal(result.kind, "match");
  assert.equal(
    result.match.ruleId,
    "FA-G1-PUNC-ASTERISK-RUN-001",
  );
  assert.equal(result.match.priority, 100);
  assert.equal(result.match.lifecycleStatus, "normative");
  assert.deepEqual(result.match.output.cells, [
    "35",
    "35",
    "35",
    "35",
  ]);
});

test("selects the scalar asterisk when no longer sequence is eligible", () => {
  const selector = createRuleSelector();
  const result = selector.select("*", 0);

  assert.equal(result.kind, "match");
  assert.equal(
    result.match.ruleId,
    "FA-G1-PUNC-ASTERISK-SINGLE-001",
  );
  assert.equal(result.match.priority, 200);
});

test("selects the numeric-context period when surrounded by admitted digits", () => {
  const selector = createRuleSelector();
  const result = selector.select("1.2", 1);

  assert.equal(result.kind, "match");
  assert.equal(
    result.match.ruleId,
    "FA-G1-NUMRULE-005",
  );
  assert.deepEqual(
    result.match.context.before,
    ["digit"],
  );
  assert.deepEqual(
    result.match.context.after,
    ["digit"],
  );
  assert.equal(
    result.match.tokenClass,
    "numeric-decimal-separator",
  );
});

test("falls back to the scalar period when numeric context is ineligible", () => {
  const selector = createRuleSelector();
  const result = selector.select("a.b", 1);

  assert.equal(result.kind, "match");
  assert.equal(
    result.match.ruleId,
    "FA-G1-PUNC-SCALAR-004",
  );
  assert.equal(result.match.priority, 1000);
});

test("selects the canonical ezafe sequence before its scalar component", () => {
  const selector = createRuleSelector();
  const input = "\u0647\u0654";
  const result = selector.select(input, 0);

  assert.equal(result.kind, "match");
  assert.equal(
    result.match.ruleId,
    "FA-G1-ORTHO-EZAFE-SEQUENCE-001",
  );
  assert.equal(
    result.match.span.end.codePointIndex,
    2,
  );
});

test("keeps ZWNJ normalization outside the textual selector and selects layout", () => {
  const selector = createRuleSelector();
  const result = selector.select("\u200C", 0);

  assert.equal(result.kind, "match");
  assert.equal(
    result.match.ruleId,
    "FA-G1-LAYOUT-027",
  );
  assert.equal(
    result.match.output.structuralToken,
    "layout:shaping-control:U+200C",
  );
});

test("reports no-match for an unsupported scalar", () => {
  const selector = createRuleSelector();
  const result = selector.select(
    "\u{1F600}",
    0,
  );

  assert.equal(result.kind, "no-match");
  assert.equal(result.codePoint, "U+1F600");
  assert.deepEqual(result.location, {
    codePointIndex: 0,
    utf16Index: 0,
  });
});

test("preserves code-point and UTF-16 coordinates after a supplementary scalar", () => {
  const selector = createRuleSelector();
  const input = "\u{1F600}*";
  const result = selector.select(input, 1);

  assert.equal(result.kind, "match");
  assert.equal(
    result.match.ruleId,
    "FA-G1-PUNC-ASTERISK-SINGLE-001",
  );
  assert.deepEqual(result.match.span.start, {
    codePointIndex: 1,
    utf16Index: 2,
  });
  assert.deepEqual(result.match.span.end, {
    codePointIndex: 2,
    utf16Index: 3,
  });
});

test("returns deterministic rule-selection results", () => {
  const selector = createRuleSelector();

  assert.deepEqual(
    selector.select("1.2", 1),
    selector.select("1.2", 1),
  );
});
