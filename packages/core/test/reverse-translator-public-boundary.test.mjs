import assert from "node:assert/strict";
import path from "node:path";
import {
  fileURLToPath,
  pathToFileURL,
} from "node:url";
import test from "node:test";

const here =
  path.dirname(
    fileURLToPath(import.meta.url),
  );

const root =
  path.resolve(
    here,
    "../../..",
  );

const coreRoot =
  await import(
    pathToFileURL(
      path.join(
        root,
        "packages/core/dist/index.js",
      ),
    ).href
  );

test(
  "exposes the frozen reverse translator through the Core root",
  () => {
    assert.equal(
      typeof coreRoot.createReverseTranslator,
      "function",
    );

    const translator =
      coreRoot.createReverseTranslator();

    const canonicalized =
      translator.translate("⠆");

    assert.equal(
      canonicalized.ok,
      true,
    );

    if (canonicalized.ok) {
      assert.equal(
        canonicalized.text,
        "؛",
      );

      assert.equal(
        canonicalized.lossy,
        true,
      );

      assert.deepEqual(
        canonicalized.diagnostics.map(
          (item) => item.code,
        ),
        [
          "CANONICALIZED_PUNCTUATION",
        ],
      );
    }

    const strict =
      translator.translate(
        "⠆",
        {
          ambiguityPolicy: "error",
        },
      );

    assert.equal(
      strict.ok,
      false,
    );

    if (!strict.ok) {
      assert.equal(
        strict.code,
        "AMBIGUOUS_REVERSE_MATCH",
      );

      assert.deepEqual(
        strict.candidateRuleIds,
        [
          "FA-G1-PUNC-SCALAR-007",
          "FA-G1-PUNC-SCALAR-008",
        ],
      );
    }
  },
);
