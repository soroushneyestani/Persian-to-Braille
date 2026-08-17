import assert from "node:assert/strict";
import test from "node:test";

import {
  createPersianBrailleTranslator,
} from "@persian-braille/sdk";

import {
  runNodeBasic,
  translatePersian,
} from "../node-basic/index.mjs";

import {
  translateForBrowser,
} from "../browser-basic/index.mjs";

import {
  demonstrateFailure,
} from "../error-handling/index.mjs";

import {
  createPersianBrailleAdapter,
} from "../integration-adapter/index.mjs";

test(
  "node-basic translates through the public SDK",
  () => {
    const expected =
      createPersianBrailleTranslator()
        .translate("سلام");
    const actual =
      translatePersian("سلام");

    assert.deepEqual(actual, expected);
    assert.equal(actual.ok, true);
    assert.equal(
      typeof actual.unicodeBraille,
      "string",
    );
    assert.ok(
      actual.unicodeBraille.length > 0,
    );
  },
);

test(
  "node-basic executable path writes only the successful Braille result",
  () => {
    const output = [];
    const errors = [];

    const exitCode =
      runNodeBasic(
        "آ",
        {
          log(value) {
            output.push(value);
          },
          error(value) {
            errors.push(value);
          },
        },
      );

    assert.equal(exitCode, 0);
    assert.deepEqual(errors, []);
    assert.deepEqual(output, ["⠜"]);
  },
);

test(
  "browser-basic exposes a bundler-oriented public SDK projection",
  () => {
    const result =
      translateForBrowser("آ");

    assert.deepEqual(
      result,
      {
        ok: true,
        unicodeBraille: "⠜",
        cells: ["345"],
        normalizedText: "آ",
      },
    );
  },
);

test(
  "error-handling demonstrates a structured SDK failure",
  () => {
    const result =
      demonstrateFailure();

    assert.equal(result.ok, false);
    assert.equal(
      typeof result.code,
      "string",
    );
    assert.ok(result.code.length > 0);
    assert.equal(
      typeof result.message,
      "string",
    );
    assert.ok(result.message.length > 0);
  },
);

test(
  "integration-adapter delegates without owning Braille semantics",
  () => {
    const translator =
      createPersianBrailleTranslator();
    const expected =
      translator.translate("سلام");

    const adapter =
      createPersianBrailleAdapter(
        translator,
      );
    const actual =
      adapter.translate("سلام");

    assert.equal(expected.ok, true);
    assert.deepEqual(
      actual,
      {
        ok: true,
        braille:
          expected.unicodeBraille,
        cells:
          expected.cells,
      },
    );
  },
);
