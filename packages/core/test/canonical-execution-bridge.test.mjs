import test from "node:test";
import assert from "node:assert/strict";
import {
  readFileSync,
  readdirSync,
} from "node:fs";
import {
  dirname,
  join,
} from "node:path";
import {
  fileURLToPath,
} from "node:url";

import {
  createModeRuleExecutor,
  createRuleSelector,
  createUnicodePreprocessor,
} from "../dist/index.js";

const here = dirname(
  fileURLToPath(import.meta.url),
);
const repoRoot = join(
  here,
  "..",
  "..",
  "..",
);

function readJson(path) {
  return JSON.parse(
    readFileSync(path, "utf8"),
  );
}

function readRecordDirectory(path) {
  return readdirSync(path)
    .filter((name) =>
      name.endsWith(".json"),
    )
    .sort()
    .map((name) =>
      readJson(join(path, name)),
    );
}

const rules = readRecordDirectory(
  join(
    repoRoot,
    "spec",
    "fa-ir",
    "rules",
    "records",
  ),
);

const vectors = readRecordDirectory(
  join(
    repoRoot,
    "spec",
    "fa-ir",
    "conformance",
    "records",
  ),
);

const ruleById = new Map(
  rules.map((rule) => [
    rule.id,
    rule,
  ]),
);

function expectedStructuralTokens(match) {
  return match.output.structuralToken === null
    ? []
    : [match.output.structuralToken];
}

function syntheticTextForVector(vector) {
  const before =
    vector.input.before === "digit"
      ? "1"
      : "";
  const after =
    vector.input.after === "digit"
      ? "1"
      : "";

  return {
    text:
      before +
      vector.input.text +
      after,
    codePointIndex:
      Array.from(before).length,
  };
}

test("freezes the canonical Phase 5 rule/vector inventory", () => {
  assert.equal(rules.length, 175);
  assert.equal(vectors.length, 175);

  const active = vectors.filter(
    (vector) =>
      vector.status === "active",
  );
  const draft = vectors.filter(
    (vector) =>
      vector.status === "draft",
  );

  assert.equal(active.length, 37);
  assert.equal(draft.length, 138);
});

test("preserves vector lifecycle against rule lifecycle for all 175 records", () => {
  for (const vector of vectors) {
    assert.equal(
      vector.ruleIds.length,
      1,
      vector.id,
    );

    const rule =
      ruleById.get(vector.ruleIds[0]);

    assert.ok(rule, vector.id);

    assert.equal(
      vector.status,
      rule.status === "normative"
        ? "active"
        : "draft",
      vector.id,
    );
  }
});

test("bridges every canonical rule vector to its owning Core execution layer", async (t) => {
  const selector = createRuleSelector();
  const modeExecutor =
    createModeRuleExecutor();
  const preprocessor =
    createUnicodePreprocessor();

  for (const vector of vectors) {
    await t.test(vector.id, () => {
      const ruleId =
        vector.ruleIds[0];
      const rule =
        ruleById.get(ruleId);

      assert.ok(rule, vector.id);

      if (rule.type === "mode") {
        const tokenClass =
          vector.input.tokenClass;

        assert.equal(
          typeof tokenClass,
          "string",
          vector.id,
        );

        const zero = {
          codePointIndex: 0,
          utf16Index: 0,
        };

        const match =
          modeExecutor.execute({
            tokenClass,
            span: {
              start: zero,
              end: zero,
            },
          });

        assert.ok(match, vector.id);
        assert.equal(
          match.ruleId,
          ruleId,
          vector.id,
        );
        assert.deepEqual(
          match.output.cells,
          vector.expected.cells,
          vector.id,
        );
        assert.equal(
          match.output.unicodeBraille,
          vector.expected.unicodeBraille,
          vector.id,
        );
        assert.deepEqual(
          expectedStructuralTokens(match),
          vector.expected.structuralTokens,
          vector.id,
        );
        return;
      }

      if (
        rule.type === "normalization"
      ) {
        const outcome =
          preprocessor.normalize(
            vector.input.text,
          );

        assert.equal(
          outcome.ok,
          true,
          vector.id,
        );

        if (!outcome.ok) {
          return;
        }

        const annotation =
          outcome.annotations.find(
            (item) =>
              item.ruleIds.includes(
                ruleId,
              ),
          );

        assert.ok(
          annotation,
          vector.id,
        );
        assert.deepEqual(
          vector.expected.cells,
          [],
          vector.id,
        );
        assert.equal(
          vector.expected.unicodeBraille,
          null,
          vector.id,
        );

        for (
          const token of
            vector.expected
              .structuralTokens
        ) {
          assert.equal(
            annotation.structuralTokens.includes(
              token,
            ),
            true,
            `${vector.id}: ${token}`,
          );
        }

        return;
      }

      const synthetic =
        syntheticTextForVector(
          vector,
        );
      const selection =
        selector.select(
          synthetic.text,
          synthetic.codePointIndex,
        );

      assert.equal(
        selection.kind,
        "match",
        vector.id,
      );

      if (
        selection.kind !== "match"
      ) {
        return;
      }

      assert.equal(
        selection.match.ruleId,
        ruleId,
        vector.id,
      );
      assert.deepEqual(
        selection.match.output.cells,
        vector.expected.cells,
        vector.id,
      );
      assert.equal(
        selection.match.output
          .unicodeBraille,
        vector.expected.unicodeBraille,
        vector.id,
      );
      assert.deepEqual(
        expectedStructuralTokens(
          selection.match,
        ),
        vector.expected.structuralTokens,
        vector.id,
      );
    });
  }
});
