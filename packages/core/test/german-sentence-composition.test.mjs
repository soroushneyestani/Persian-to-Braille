// POST15_GERMAN_SENTENCE_COMPOSITION_FIX
import assert from "node:assert/strict";
import test from "node:test";

import {
  translateGermanVollschriftAutomatic,
} from "../dist/german-vollschrift-automatic-runtime.js";

import {
  translateGermanKurzschriftAutomatic,
} from "../dist/german-kurzschrift-automatic-runtime.js";

test(
  "Vollschrift composes two independently source-backed words",
  () => {
    const result =
      translateGermanVollschriftAutomatic(
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
  "Vollschrift preserves the existing source-backed multiword fixture",
  () => {
    const result =
      translateGermanVollschriftAutomatic(
        "St. Pauli",
      );

    assert.equal(result.ok, true);

    if (!result.ok) {
      return;
    }

    assert.equal(
      result.unicodeBraille,
      "⠎⠞⠄⠀⠏⠡⠇⠊",
    );
  },
);

test(
  "Kurzschrift composes repeated source-backed lexical words",
  () => {
    const result =
      translateGermanKurzschriftAutomatic(
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
    assert.equal(
      result.path,
      "COMPOSED_SEGMENTS",
    );
  },
);
