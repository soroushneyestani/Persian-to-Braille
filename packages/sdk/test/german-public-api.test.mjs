import test from "node:test";
import assert from "node:assert/strict";

import {
  GermanBrailleTranslationError,
  createGermanBrailleTranslator,
} from "../dist/index.js";

const MODES = [
  "basisschrift",
  "vollschrift",
  "kurzschrift",
];

test(
  "German SDK exposes all three frozen text modes and fails closed",
  () => {
    for (const mode of MODES) {
      const translator =
        createGermanBrailleTranslator({
          mode,
        });

      assert.equal(
        translator.profile.language,
        "de",
      );

      assert.equal(
        translator.profile.mode,
        mode,
      );

      assert.equal(
        translator.profile.regionalOverlay,
        null,
      );

      assert.equal(
        translator.profile.direction,
        "print-to-braille",
      );

      assert.equal(
        translator.profile.runtimeExecutable,
        false,
      );

      assert.equal(
        translator.profile.runtimeRegistered,
        false,
      );

      const result =
        translator.translate(
          "Test",
        );

      assert.equal(
        result.ok,
        false,
      );

      assert.equal(
        result.code,
        "RUNTIME_NOT_EXECUTABLE",
      );

      assert.equal(
        result.profile.mode,
        mode,
      );

      assert.equal(
        result.input,
        "Test",
      );

      if (
        mode === "basisschrift"
      ) {
        assert.equal(
          result.profile.runtimeStatus,
          "LOWERING_IR_NON_EXECUTABLE",
        );

        assert.equal(
          result.profile.runtimeDependency,
          "GERMAN_EXECUTABLE_RUNTIME_ADAPTER",
        );

        assert.equal(
          result.profile.loweringCoverage,
          "123/123",
        );
      } else {
        assert.equal(
          result.profile.runtimeStatus,
          "MODE_RUNTIME_NOT_MATERIALIZED",
        );

        assert.equal(
          result.profile.runtimeDependency,
          "GERMAN_MODE_EXECUTABLE_RUNTIME_MATERIALIZATION",
        );

        assert.equal(
          result.profile.loweringCoverage,
          "NOT_MATERIALIZED",
        );
      }
    }
  },
);

test(
  "Swiss remains an orthogonal regional overlay, not a fourth mode",
  () => {
    const translator =
      createGermanBrailleTranslator({
        mode: "basisschrift",
        regionalOverlay: "swiss",
      });

    assert.equal(
      translator.profile.mode,
      "basisschrift",
    );

    assert.equal(
      translator.profile.regionalOverlay,
      "swiss",
    );

    const result =
      translator.translate(
        "Schweiz",
      );

    assert.equal(
      result.ok,
      false,
    );

    assert.equal(
      result.code,
      "RUNTIME_NOT_EXECUTABLE",
    );

    assert.equal(
      result.profile.regionalOverlay,
      "swiss",
    );
  },
);

test(
  "German SDK rejects an unsupported text mode at the Core capability boundary",
  () => {
    assert.throws(
      () =>
        createGermanBrailleTranslator({
          mode: "swiss",
        }),
    );
  },
);

test(
  "translateOrThrow preserves structured German runtime dependency information",
  () => {
    const translator =
      createGermanBrailleTranslator({
        mode: "basisschrift",
      });

    assert.throws(
      () =>
        translator.translateOrThrow(
          "Test",
        ),
      (error) => {
        assert.ok(
          error
          instanceof
          GermanBrailleTranslationError,
        );

        assert.equal(
          error.code,
          "RUNTIME_NOT_EXECUTABLE",
        );

        assert.equal(
          error.result.ok,
          false,
        );

        assert.equal(
          error.result.profile.mode,
          "basisschrift",
        );

        assert.equal(
          error.result.profile.runtimeDependency,
          "GERMAN_EXECUTABLE_RUNTIME_ADAPTER",
        );

        assert.equal(
          error.result.profile.loweringCoverage,
          "123/123",
        );

        return true;
      },
    );
  },
);
