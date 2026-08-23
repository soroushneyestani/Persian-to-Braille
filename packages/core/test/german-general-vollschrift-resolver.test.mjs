// POST15_GENERAL_VOLLSCHRIFT_RESOLVER_PACK
import assert from "node:assert/strict";
import test from "node:test";

import {
  translateGermanVollschriftAutomatic,
} from "../dist/german-vollschrift-automatic-runtime.js";

const exactCases = [
  ["schnell", "⠱⠝⠑⠇⠇"],
  ["schwierig", "⠱⠺⠬⠗⠊⠛"],
  ["durch", "⠙⠥⠗⠹"],
  ["auf", "⠡⠋"],
  ["weil", "⠺⠩⠇"],
  ["Liebe", "⠇⠬⠃⠑"],
  ["Stadt", "⠾⠁⠙⠞"],
  ["Häuser", "⠓⠌⠎⠑⠗"],
];

for (const [input, expected] of exactCases) {
  test(
    `general Vollschrift resolves ${input}`,
    () => {
      const result =
        translateGermanVollschriftAutomatic(
          input,
        );

      assert.equal(
        result.ok,
        true,
        result.ok
          ? undefined
          : result.message,
      );

      if (!result.ok) {
        return;
      }

      assert.equal(
        result.unicodeBraille,
        expected,
      );
    },
  );
}

test(
  "general Vollschrift resolves the original free-text paragraph",
  () => {
    const input =
      "Lernen schwierig\n"
      + "untere schnell Veränderung. Während vermindern hinten langsam Vater hinten.\n"
      + "Erste danach fortsetzen auf. Genügend klar von zu Demokratie. Dreifach aber\n"
      + "weil wandern, denn bewundernlichen. Langsam lieben niemals denn lesen, durch\n"
      + "Ohr.";

    const result =
      translateGermanVollschriftAutomatic(
        input,
      );

    assert.equal(
      result.ok,
      true,
      result.ok
        ? undefined
        : result.message,
    );
  },
);

test(
  "closed exact Vollschrift plan still has precedence",
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
