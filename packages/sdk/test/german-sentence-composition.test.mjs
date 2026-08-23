// POST15_GERMAN_SENTENCE_COMPOSITION_FIX
import assert from "node:assert/strict";
import test from "node:test";

import {
  createGermanBrailleTranslator,
} from "../dist/german-translator.js";

test(
  "public German SDK translates a multiword Vollschrift selection",
  () => {
    const translator =
      createGermanBrailleTranslator({
        mode: "vollschrift",
        regionalOverlay: null,
      });

    const result =
      translator.translate(
        "Baum Liebe",
      );

    assert.equal(result.ok, true);

    if (!result.ok) {
      return;
    }

    assert.equal(
      result.unicodeBraille,
      "⠃⠡⠍⠀⠇⠬⠃⠑",
    );
  },
);

test(
  "public German SDK translates a multiword Kurzschrift selection",
  () => {
    const translator =
      createGermanBrailleTranslator({
        mode: "kurzschrift",
        regionalOverlay: null,
      });

    const result =
      translator.translate(
        "Center Center",
      );

    assert.equal(result.ok, true);

    if (!result.ok) {
      return;
    }

    assert.equal(
      result.unicodeBraille,
      "⠠⠉⠉⠞⠻⠀⠠⠉⠉⠞⠻",
    );
  },
);
