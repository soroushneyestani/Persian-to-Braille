import assert from "node:assert/strict";
import test from "node:test";

import * as coreRoot from "../dist/index.js";

import {
  GERMAN_TEXT_MODES,
  createGermanTextModeSelection,
  isGermanTextMode,
} from "../dist/german-text-mode.js";


const expectedModes = [
  "basisschrift",
  "vollschrift",
  "kurzschrift",
];


test(
  "freezes the canonical internal GermanTextMode inventory",
  () => {
    assert.deepEqual(
      [...GERMAN_TEXT_MODES],
      expectedModes,
    );

    for (const mode of expectedModes) {
      assert.equal(
        isGermanTextMode(mode),
        true,
      );
    }
  },
);


test(
  "rejects values outside the GermanTextMode identity contract",
  () => {
    const rejected = [
      "swiss",
      "de-ch",
      "ch",
      "basis",
      "voll",
      "kurz",
      "Basisschrift",
      "",
      null,
      undefined,
      0,
      false,
    ];

    for (const value of rejected) {
      assert.equal(
        isGermanTextMode(value),
        false,
        `Expected ${String(value)} to be rejected.`,
      );
    }
  },
);


test(
  "requires one explicit valid German text mode selection",
  () => {
    for (const mode of expectedModes) {
      const selection =
        createGermanTextModeSelection(mode);

      assert.deepEqual(
        selection,
        {
          mode,
        },
      );

      assert.equal(
        Object.isFrozen(selection),
        true,
      );
    }

    assert.throws(
      () =>
        createGermanTextModeSelection(
          undefined,
        ),
      TypeError,
    );

    assert.throws(
      () =>
        createGermanTextModeSelection(
          "swiss",
        ),
      TypeError,
    );
  },
);


test(
  "keeps the German text-mode boundary outside the Core root API during Phase 15.5",
  () => {
    const forbiddenRootExports = [
      "GERMAN_TEXT_MODES",
      "createGermanTextModeSelection",
      "isGermanTextMode",
    ];

    for (const name of forbiddenRootExports) {
      assert.equal(
        Object.prototype.hasOwnProperty.call(
          coreRoot,
          name,
        ),
        false,
        `${name} leaked through the Core root export.`,
      );
    }
  },
);
