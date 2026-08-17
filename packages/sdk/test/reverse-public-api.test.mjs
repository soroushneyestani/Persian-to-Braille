import assert from "node:assert/strict";
import test from "node:test";

import {
  PersianBrailleReverseTranslationError,
  createPersianBrailleReverseTranslator,
} from "@persian-braille/sdk";

const SEMICOLON_BRAILLE = "\u2806";

test(
  "exposes the frozen reverse SDK profile and canonical success projection",
  () => {
    const translator =
      createPersianBrailleReverseTranslator();

    assert.deepEqual(
      translator.profile,
      {
        id: "fa-ir-g1-reverse",
        version: "0.1.0",
        status: "draft",
        direction: "braille-to-print",
      },
    );

    assert.equal(
      Object.isFrozen(
        translator.profile,
      ),
      true,
    );

    const result =
      translator.translateFromBraille(
        SEMICOLON_BRAILLE,
      );

    assert.equal(
      result.ok,
      true,
    );

    if (!result.ok) {
      return;
    }

    assert.equal(
      result.text,
      "\u061b",
    );
    assert.deepEqual(
      result.cells,
      ["23"],
    );
    assert.equal(
      result.lossy,
      true,
    );
    assert.equal(
      result.diagnostics.some(
        (diagnostic) =>
          diagnostic.code
          === "CANONICALIZED_PUNCTUATION",
      ),
      true,
    );
    assert.equal(
      Object.isFrozen(result),
      true,
    );
    assert.equal(
      Object.isFrozen(
        result.cells,
      ),
      true,
    );
    assert.equal(
      Object.isFrozen(
        result.diagnostics,
      ),
      true,
    );
    assert.equal(
      Object.isFrozen(
        result.diagnostics[0],
      ),
      true,
    );
    assert.equal(
      Object.isFrozen(
        result.diagnostics[0].ruleIds,
      ),
      true,
    );
  },
);

test(
  "applies factory defaults and per-call reverse option overrides",
  () => {
    const translator =
      createPersianBrailleReverseTranslator({
        punctuationStyle: "ascii",
      });

    const ascii =
      translator.translateFromBraille(
        SEMICOLON_BRAILLE,
      );

    assert.equal(
      ascii.ok,
      true,
    );

    if (ascii.ok) {
      assert.equal(
        ascii.text,
        ";",
      );
    }

    const persian =
      translator.translateFromBraille(
        SEMICOLON_BRAILLE,
        {
          punctuationStyle:
            "persian",
        },
      );

    assert.equal(
      persian.ok,
      true,
    );

    if (persian.ok) {
      assert.equal(
        persian.text,
        "\u061b",
      );
    }
  },
);

test(
  "returns the frozen strict ambiguity failure without throwing",
  () => {
    const translator =
      createPersianBrailleReverseTranslator();

    const result =
      translator.translateFromBraille(
        SEMICOLON_BRAILLE,
        {
          ambiguityPolicy:
            "error",
        },
      );

    assert.equal(
      result.ok,
      false,
    );

    if (result.ok) {
      return;
    }

    assert.equal(
      result.code,
      "AMBIGUOUS_REVERSE_MATCH",
    );
    assert.equal(
      result.brailleCharacter,
      SEMICOLON_BRAILLE,
    );
    assert.deepEqual(
      new Set(
        result.candidateTexts,
      ),
      new Set([
        ";",
        "\u061b",
      ]),
    );
    assert.equal(
      Object.isFrozen(result),
      true,
    );
    assert.equal(
      Object.isFrozen(
        result.candidateRuleIds,
      ),
      true,
    );
    assert.equal(
      Object.isFrozen(
        result.candidateTexts,
      ),
      true,
    );
  },
);

test(
  "throws only the SDK-owned reverse translation error for expected failures",
  () => {
    const translator =
      createPersianBrailleReverseTranslator();

    assert.throws(
      () =>
        translator.translateFromBrailleOrThrow(
          SEMICOLON_BRAILLE,
          {
            ambiguityPolicy:
              "error",
          },
        ),
      (error) => {
        assert.equal(
          error
          instanceof
            PersianBrailleReverseTranslationError,
          true,
        );

        assert.equal(
          error.name,
          "PersianBrailleReverseTranslationError",
        );
        assert.equal(
          error.code,
          "AMBIGUOUS_REVERSE_MATCH",
        );
        assert.equal(
          error.result.ok,
          false,
        );
        assert.equal(
          Object.isFrozen(error),
          true,
        );

        return true;
      },
    );
  },
);
