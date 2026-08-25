import test from "node:test";
import assert from "node:assert/strict";

const sdk = await import(
  "@persian-braille/sdk"
);

function createTranslator() {
  return sdk.createPersianBrailleTranslator();
}

test("exports only the selected runtime SDK surface", () => {
  assert.deepEqual(
    Object.keys(sdk).sort(),
    [
      "GermanBrailleTranslationError",
    "MusicBrailleMidiTranslationError",
    "MusicBrailleMusicXmlTranslationError",
      "PersianBrailleReverseTranslationError",
      "PersianBrailleTranslationError",
      "createGermanBrailleTranslator",
    "createMusicBrailleMidiTranslator",
    "createMusicBrailleMusicXmlTranslator",
      "createPersianBrailleReverseTranslator",
      "createPersianBrailleTranslator",
    ],
  );

  assert.equal(
    "createForwardTranslator" in sdk,
    false,
  );
  assert.equal(
    "getBundledSpecification" in sdk,
    false,
  );
  assert.equal(
    "RuleSelector" in sdk,
    false,
  );
});

test("exposes bundled profile metadata through the public translator", () => {
  const translator = createTranslator();

  assert.deepEqual(
    translator.profile,
    {
      id: "fa-ir-g1",
      version: "0.1.0",
      status: "draft",
      direction: "print-to-braille",
    },
  );

  assert.equal(
    Object.isFrozen(
      translator.profile,
    ),
    true,
  );
});

test("translates representative Persian text through the package root", () => {
  const result =
    createTranslator().translate(
      "\u0633\u0644\u0627\u0645",
    );

  assert.equal(result.ok, true);

  if (!result.ok) {
    assert.fail(
      JSON.stringify(result),
    );
  }

  assert.deepEqual(
    result.cells,
    ["234", "123", "1", "134"],
  );
  assert.equal(
    result.unicodeBraille,
    "\u280E\u2807\u2801\u280D",
  );
  assert.deepEqual(
    result.structuralTokens,
    [],
  );
  assert.equal(
    result.normalizedText,
    "\u0633\u0644\u0627\u0645",
  );
});

test("preserves exact ZWNJ structural semantics without leaking Core trace", () => {
  const result =
    createTranslator().translate(
      "\u200C",
    );

  assert.equal(result.ok, true);

  if (!result.ok) {
    assert.fail(
      JSON.stringify(result),
    );
  }

  assert.deepEqual(
    result.structuralTokens,
    [
      "normalization:zwnj-orthographic-boundary",
      "layout:shaping-control:U+200C",
    ],
  );

  assert.equal(
    "trace" in result,
    false,
  );
  assert.equal(
    "matches" in result,
    false,
  );
  assert.equal(
    "engineTokens" in result,
    false,
  );
});

test("preserves numeric composition through the public facade", () => {
  const result =
    createTranslator().translate("1.2");

  assert.equal(result.ok, true);

  if (!result.ok) {
    assert.fail(
      JSON.stringify(result),
    );
  }

  assert.deepEqual(
    result.cells,
    ["3456", "1", "2", "12"],
  );
  assert.equal(
    result.unicodeBraille,
    "\u283C\u2801\u2802\u2803",
  );
});

test("returns a stable non-throwing unknown-character failure", () => {
  const result =
    createTranslator().translate(
      "\u{1F600}",
    );

  assert.equal(result.ok, false);

  if (result.ok) {
    assert.fail(
      "Expected translation failure.",
    );
  }

  assert.equal(
    result.code,
    "UNKNOWN_CHARACTER",
  );
  assert.equal(
    result.input,
    "\u{1F600}",
  );
  assert.deepEqual(
    result.location,
    {
      codePointIndex: 0,
      utf16Index: 0,
    },
  );
  assert.equal(
    result.character,
    "\u{1F600}",
  );
  assert.equal(
    result.codePoint,
    "U+1F600",
  );
});

test("projects preprocessing failure cause codes without exposing the Core cause object", () => {
  const result =
    createTranslator().translate(
      "\u200D",
    );

  assert.equal(result.ok, false);

  if (result.ok) {
    assert.fail(
      "Expected preprocessing failure.",
    );
  }

  assert.equal(
    result.code,
    "PREPROCESSING_FAILED",
  );
  assert.equal(
    result.causeCode,
    "UNKNOWN_FORMAT_CONTROL",
  );
  assert.equal(
    "cause" in result,
    false,
  );
});

test("preserves dual Unicode locations after a valid prefix", () => {
  const result =
    createTranslator().translate(
      "\u0627\u{1F600}",
    );

  assert.equal(result.ok, false);

  if (result.ok) {
    assert.fail(
      "Expected translation failure.",
    );
  }

  assert.equal(
    result.code,
    "UNKNOWN_CHARACTER",
  );
  assert.deepEqual(
    result.location,
    {
      codePointIndex: 1,
      utf16Index: 1,
    },
  );
});

test("translateOrThrow returns the public success shape on success", () => {
  const result =
    createTranslator().translateOrThrow(
      "\u0627",
    );

  assert.equal(result.ok, true);
  assert.deepEqual(
    result.cells,
    ["1"],
  );
  assert.equal(
    result.unicodeBraille,
    "\u2801",
  );
});

test("translateOrThrow throws the SDK-owned translation error on expected failure", () => {
  const translator =
    createTranslator();

  assert.throws(
    () =>
      translator.translateOrThrow(
        "\u{1F600}",
      ),
    (error) => {
      assert.equal(
        error instanceof
          sdk.PersianBrailleTranslationError,
        true,
      );
      assert.equal(
        error.name,
        "PersianBrailleTranslationError",
      );
      assert.equal(
        error.code,
        "UNKNOWN_CHARACTER",
      );
      assert.equal(
        error.result.ok,
        false,
      );
      assert.equal(
        error.result.code,
        "UNKNOWN_CHARACTER",
      );
      assert.equal(
        Object.isFrozen(error),
        true,
      );

      return true;
    },
  );
});

test("returns immutable public result objects and arrays", () => {
  const translator =
    createTranslator();
  const success =
    translator.translate("\u0627");
  const failure =
    translator.translate(
      "\u{1F600}",
    );

  assert.equal(success.ok, true);
  assert.equal(failure.ok, false);

  assert.equal(
    Object.isFrozen(success),
    true,
  );
  assert.equal(
    Object.isFrozen(success.cells),
    true,
  );
  assert.equal(
    Object.isFrozen(
      success.structuralTokens,
    ),
    true,
  );

  assert.equal(
    Object.isFrozen(failure),
    true,
  );

  if (!failure.ok) {
    assert.equal(
      Object.isFrozen(
        failure.location,
      ),
      true,
    );
  }
});

test("returns deterministic public projections for repeated input", () => {
  const translator =
    createTranslator();

  const first =
    translator.translate(
      "\u0633\u0644\u0627\u0645",
    );
  const second =
    translator.translate(
      "\u0633\u0644\u0627\u0645",
    );

  assert.deepEqual(
    first,
    second,
  );
});
