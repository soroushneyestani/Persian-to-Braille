import assert from "node:assert/strict";
import test from "node:test";

import {
  createPersianBrailleTranslator,
} from "../../packages/sdk/dist/index.js";

const translator =
  createPersianBrailleTranslator();

test(
  "U+0622 ALEF WITH MADDA translates through the public SDK as dots 345",
  () => {
    const result =
      translator.translate("آ");

    assert.equal(result.ok, true);

    if (!result.ok) {
      assert.fail(
        `Expected U+0622 translation success, received ${result.code}`,
      );
    }

    assert.equal(
      result.unicodeBraille,
      "⠜",
    );
  },
);

test(
  "Persian words beginning with U+0622 remain translatable",
  () => {
    const result =
      translator.translate("آموزش");

    assert.equal(result.ok, true);

    if (!result.ok) {
      assert.fail(
        `Expected آموزش translation success, received ${result.code}`,
      );
    }

    assert.equal(
      result.unicodeBraille.startsWith(
        "⠜",
      ),
      true,
    );
  },
);
