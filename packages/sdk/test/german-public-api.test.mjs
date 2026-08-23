import assert from "node:assert/strict";
import test from "node:test";

import {
  GermanBrailleTranslationError,
  createGermanBrailleTranslator,
} from "../dist/index.js";

for (
  const [
    mode,
    loweringCoverage,
  ]
  of [
    ["basisschrift", "123/123"],
    ["vollschrift", "SOURCE_FIXTURE_SURFACE"],
    ["kurzschrift", "SOURCE_FIXTURE_SURFACE"],
  ]
) {
  test(
    `${mode} is executable and registered through the public German SDK`,
    () => {
      const translator =
        createGermanBrailleTranslator({
          mode,
        });

      assert.equal(
        translator.profile.runtimeStatus,
        "EXECUTABLE_RUNTIME_REGISTERED",
      );
      assert.equal(
        translator.profile.runtimeDependency,
        "NONE",
      );
      assert.equal(
        translator.profile.runtimeExecutable,
        true,
      );
      assert.equal(
        translator.profile.runtimeRegistered,
        true,
      );
      assert.equal(
        translator.profile.loweringCoverage,
        loweringCoverage,
      );
    },
  );
}

for (
  const [
    mode,
    input,
    expected,
  ]
  of [
    ["basisschrift", "Hallo", "⠓⠁⠇⠇⠕"],
    ["vollschrift", "Baum", "⠃⠡⠍"],
    ["kurzschrift", "Center", "⠠⠉⠉⠞⠻"],
  ]
) {
  test(
    `${mode} returns real Unicode Braille through the public SDK`,
    () => {
      const result =
        createGermanBrailleTranslator({
          mode,
        }).translate(
          input,
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
          expected,
        );
      }
    },
  );
}

test(
  "candidate-free text stays automatically executable in Vollschrift and Kurzschrift",
  () => {
    for (
      const mode
      of [
        "vollschrift",
        "kurzschrift",
      ]
    ) {
      const result =
        createGermanBrailleTranslator({
          mode,
        }).translate(
          "Brot",
        );

      assert.equal(
        result.ok,
        true,
        result.ok
          ? undefined
          : JSON.stringify(result),
      );
    }
  },
);

test(
  "unknown Vollschrift context remains structured unresolved after registration",
  () => {
    const result =
      createGermanBrailleTranslator({
        mode: "vollschrift",
      }).translate(
        "xaux",
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

test(
  "Swiss regional overlay remains orthogonal after full runtime registration",
  () => {
    const result =
      createGermanBrailleTranslator({
        mode: "basisschrift",
        regionalOverlay: "swiss",
      }).translate(
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

for (
  const mode
  of [
    "basisschrift",
    "vollschrift",
    "kurzschrift",
  ]
) {
  test(
    `Swiss explicit Eszett remains fail-closed in ${mode}`,
    () => {
      const result =
        createGermanBrailleTranslator({
          mode,
          regionalOverlay: "swiss",
        }).translate(
          "ß",
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
          result.profile.runtimeRegistered,
          true,
        );
      }
    },
  );
}

test(
  "translateOrThrow still throws the public error for unresolved automatic context",
  () => {
    const translator =
      createGermanBrailleTranslator({
        mode: "vollschrift",
      });

    assert.throws(
      () =>
        translator.translateOrThrow(
          "xaux",
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
