import assert from "node:assert/strict";
import test from "node:test";

import * as coreRoot from "../dist/index.js";

import {
  GERMAN_REGIONAL_OVERLAYS,
  createGermanRegionalConfiguration,
  isGermanRegionalOverlay,
} from "../dist/german-regional-configuration.js";


test(
  "freezes the canonical internal German regional overlay inventory",
  () => {
    assert.deepEqual(
      [...GERMAN_REGIONAL_OVERLAYS],
      [
        "swiss",
      ],
    );

    assert.equal(
      isGermanRegionalOverlay("swiss"),
      true,
    );
  },
);


test(
  "rejects identifiers outside the internal regional overlay contract",
  () => {
    const rejected = [
      "de-ch",
      "DE-CH410",
      "ch",
      "base",
      "standard",
      "default",
      "Swiss",
      "",
      null,
      undefined,
      0,
      false,
    ];

    for (const value of rejected) {
      assert.equal(
        isGermanRegionalOverlay(value),
        false,
        `Expected ${String(value)} not to be a regional overlay key.`,
      );
    }
  },
);


test(
  "requires an explicit German regional configuration selection",
  () => {
    const base =
      createGermanRegionalConfiguration(
        null,
      );

    assert.deepEqual(
      base,
      {
        overlay: null,
      },
    );

    assert.equal(
      Object.isFrozen(base),
      true,
    );

    const swiss =
      createGermanRegionalConfiguration(
        "swiss",
      );

    assert.deepEqual(
      swiss,
      {
        overlay: "swiss",
      },
    );

    assert.equal(
      Object.isFrozen(swiss),
      true,
    );

    assert.throws(
      () =>
        createGermanRegionalConfiguration(
          undefined,
        ),
      TypeError,
    );

    for (const value of [
      "de-ch",
      "DE-CH410",
      "ch",
      "base",
      "standard",
      "default",
    ]) {
      assert.throws(
        () =>
          createGermanRegionalConfiguration(
            value,
          ),
        TypeError,
      );
    }
  },
);


// POST15_GERMAN_ONE_HOUR_CLOSURE_ACCELERATOR
test(
  "exports the closed German regional boundary through the Core root API after Phase 15",
  async () => {
    const root =
      await import(
        "../dist/index.js"
      );

    assert.equal(
      Object.prototype.hasOwnProperty.call(
        root,
        "GERMAN_REGIONAL_OVERLAYS",
      ),
      true,
    );
  },
);