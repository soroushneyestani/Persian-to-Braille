import assert from "node:assert/strict";
import test from "node:test";

import {
  GermanBrailleTranslationError,
  createGermanBrailleTranslator,
} from "../dist/index.js";

test(
  "Basisschrift is registered through the public SDK and returns real Unicode Braille",
  () => {
    const translator =
      createGermanBrailleTranslator({
        mode: "basisschrift",
      });

    assert.deepEqual(
      translator.profile,
      {
        language: "de",
        mode: "basisschrift",
        regionalOverlay: null,
        direction: "print-to-braille",
        runtimeStatus:
          "EXECUTABLE_RUNTIME_REGISTERED",
        runtimeDependency:
          "NONE",
        runtimeExecutable: true,
        runtimeRegistered: true,
        loweringCoverage: "123/123",
      },
    );

    const result =
      translator.translate(
        "Hallo",
      );

    assert.equal(
      result.ok,
      true,
      result.ok
        ? undefined
        : JSON.stringify(result),
    );

    if (result.ok) {
      assert.equal(
        result.unicodeBraille,
        "⠓⠁⠇⠇⠕",
      );

      assert.deepEqual(
        result.cells,
        [
          "⠓",
          "⠁",
          "⠇",
          "⠇",
          "⠕",
        ],
      );
    }
  },
);

test(
  "Swiss Basisschrift returns real Braille without becoming a fourth mode",
  () => {
    const translator =
      createGermanBrailleTranslator({
        mode: "basisschrift",
        regionalOverlay: "swiss",
      });

    const result =
      translator.translate(
        "Schweiz",
      );

    assert.equal(
      result.ok,
      true,
      result.ok
        ? undefined
        : JSON.stringify(result),
    );

    if (result.ok) {
      assert.equal(
        result.profile.mode,
        "basisschrift",
      );

      assert.equal(
        result.profile.regionalOverlay,
        "swiss",
      );

      assert.equal(
        result.unicodeBraille,
        "⠎⠉⠓⠺⠑⠊⠵",
      );
    }
  },
);

test(
  "Swiss explicit Eszett remains fail-closed and is never normalized automatically",
  () => {
    const translator =
      createGermanBrailleTranslator({
        mode: "basisschrift",
        regionalOverlay: "swiss",
      });

    const result =
      translator.translate(
        "groß",
      );

    assert.equal(
      result.ok,
      false,
    );

    if (!result.ok) {
      assert.equal(
        result.code,
        "SWISS_EXPLICIT_ESZETT_FORBIDDEN",
      );

      assert.equal(
        result.profile.runtimeExecutable,
        true,
      );

      assert.equal(
        result.profile.runtimeRegistered,
        true,
      );
    }
  },
);

for (
  const [
    mode,
    status,
    dependency,
  ]
  of [
    [
      "vollschrift",
      "EXPLICIT_RESOLUTION_CONTEXT_REQUIRED",
      "GERMAN_VOLLSCHRIFT_EXPLICIT_RESOLUTION_CONTEXT",
    ],
    [
      "kurzschrift",
      "EXPLICIT_RESOLVED_PLAN_REQUIRED",
      "GERMAN_KURZSCHRIFT_EXPLICIT_RESOLVED_PLAN",
    ],
  ]
) {
  test(
    `${mode} stays source-backed and fails closed without explicit resolution context`,
    () => {
      const translator =
        createGermanBrailleTranslator({
          mode,
        });

      assert.equal(
        translator.profile.runtimeStatus,
        status,
      );

      assert.equal(
        translator.profile.runtimeDependency,
        dependency,
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
          "Probe",
        );

      assert.equal(
        result.ok,
        false,
      );

      if (!result.ok) {
        assert.equal(
          result.code,
          "RUNTIME_CONTEXT_REQUIRED",
        );
      }
    },
  );
}

test(
  "Basisschrift execution failure remains structured",
  () => {
    const translator =
      createGermanBrailleTranslator({
        mode: "basisschrift",
      });

    const result =
      translator.translate(
        "🙂",
      );

    assert.equal(
      result.ok,
      false,
    );

    if (!result.ok) {
      assert.equal(
        result.code,
        "RUNTIME_EXECUTION_FAILED",
      );

      assert.equal(
        result.location?.codePointIndex,
        0,
      );
    }
  },
);

test(
  "translateOrThrow throws the public German error for unresolved mode context",
  () => {
    const translator =
      createGermanBrailleTranslator({
        mode: "vollschrift",
      });

    assert.throws(
      () =>
        translator.translateOrThrow(
          "Probe",
        ),
      (error) => {
        assert.ok(
          error
          instanceof GermanBrailleTranslationError,
        );

        assert.equal(
          error.code,
          "RUNTIME_CONTEXT_REQUIRED",
        );

        return true;
      },
    );
  },
);

test(
  "unsupported text mode is rejected by the Core configuration boundary",
  () => {
    assert.throws(
      () =>
        createGermanBrailleTranslator({
          mode: "unsupported",
        }),
    );
  },
);
