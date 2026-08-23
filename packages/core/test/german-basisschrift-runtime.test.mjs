import assert from "node:assert/strict";
import test from "node:test";

import {
  translateGermanBasisschrift,
} from "../dist/index.js";

const vectors = [
  {
    "id": "DE-ACCENT-CASE-001",
    "semanticFamily": "STANDARD_CELL_VECTOR",
    "input": "è",
    "expectation": {
      "unicode": "⠈⠑",
      "codepoints": [
        "U+2808",
        "U+2811"
      ],
      "dots": [
        "4",
        "15"
      ],
      "cellCount": 2
    },
    "options": {
      "accentStrategy": "generic",
      "foreignLanguage": "fr"
    }
  },
  {
    "id": "DE-ACCENT-CASE-002",
    "semanticFamily": "STANDARD_CELL_VECTOR",
    "input": "è",
    "expectation": {
      "unicode": "⠈⠮",
      "codepoints": [
        "U+2808",
        "U+282E"
      ],
      "dots": [
        "4",
        "2346"
      ],
      "cellCount": 2
    },
    "options": {
      "accentStrategy": "exact",
      "foreignLanguage": "fr"
    }
  },
  {
    "id": "DE-ACCENT-CASE-003",
    "semanticFamily": "STANDARD_CELL_VECTOR",
    "input": "î",
    "expectation": {
      "unicode": "⠈⠊",
      "codepoints": [
        "U+2808",
        "U+280A"
      ],
      "dots": [
        "4",
        "24"
      ],
      "cellCount": 2
    },
    "options": {
      "accentStrategy": "generic",
      "foreignLanguage": "fr"
    }
  },
  {
    "id": "DE-ACCENT-CASE-004",
    "semanticFamily": "STANDARD_CELL_VECTOR",
    "input": "î",
    "expectation": {
      "unicode": "⠈⠩",
      "codepoints": [
        "U+2808",
        "U+2829"
      ],
      "dots": [
        "4",
        "146"
      ],
      "cellCount": 2
    },
    "options": {
      "accentStrategy": "exact",
      "foreignLanguage": "fr"
    }
  },
  {
    "id": "DE-ACCENT-CASE-005",
    "semanticFamily": "STANDARD_CELL_VECTOR",
    "input": "ñ",
    "expectation": {
      "unicode": "⠈⠝",
      "codepoints": [
        "U+2808",
        "U+281D"
      ],
      "dots": [
        "4",
        "1345"
      ],
      "cellCount": 2
    },
    "options": {
      "accentStrategy": "generic",
      "foreignLanguage": "es"
    }
  },
  {
    "id": "DE-ACCENT-CASE-006",
    "semanticFamily": "STANDARD_CELL_VECTOR",
    "input": "ñ",
    "expectation": {
      "unicode": "⠈⠻",
      "codepoints": [
        "U+2808",
        "U+283B"
      ],
      "dots": [
        "4",
        "12456"
      ],
      "cellCount": 2
    },
    "options": {
      "accentStrategy": "exact",
      "foreignLanguage": "es"
    }
  },
  {
    "id": "DE-ACCENT-CASE-007",
    "semanticFamily": "STANDARD_CELL_VECTOR",
    "input": "Å",
    "expectation": {
      "unicode": "⠈⠡",
      "codepoints": [
        "U+2808",
        "U+2821"
      ],
      "dots": [
        "4",
        "16"
      ],
      "cellCount": 2
    },
    "options": {
      "accentStrategy": "exact",
      "foreignLanguage": "sv"
    }
  },
  {
    "id": "DE-CASE-CASE-001",
    "semanticFamily": "STANDARD_CELL_VECTOR",
    "input": "Haus",
    "expectation": {
      "unicode": "⠨⠓⠁⠥⠎",
      "codepoints": [
        "U+2828",
        "U+2813",
        "U+2801",
        "U+2825",
        "U+280E"
      ],
      "dots": [
        "46",
        "125",
        "1",
        "136",
        "234"
      ],
      "cellCount": 5
    },
    "options": {
      "caseMode": "systematic"
    }
  },
  {
    "id": "DE-CASE-CASE-002",
    "semanticFamily": "STANDARD_CELL_VECTOR",
    "input": "AUA",
    "expectation": {
      "unicode": "⠘⠁⠥⠁",
      "codepoints": [
        "U+2818",
        "U+2801",
        "U+2825",
        "U+2801"
      ],
      "dots": [
        "45",
        "1",
        "136",
        "1"
      ],
      "cellCount": 4
    },
    "options": {
      "caseMode": "systematic"
    }
  },
  {
    "id": "DE-CASE-CASE-004",
    "semanticFamily": "STANDARD_CELL_VECTOR",
    "input": "abc",
    "expectation": {
      "unicode": "⠠⠁⠃⠉",
      "codepoints": [
        "U+2820",
        "U+2801",
        "U+2803",
        "U+2809"
      ],
      "dots": [
        "6",
        "1",
        "12",
        "14"
      ],
      "cellCount": 4
    },
    "options": {
      "caseContext": "lowercase-abbreviation"
    }
  },
  {
    "id": "DE-CASE-CASE-005",
    "semanticFamily": "STANDARD_CELL_VECTOR",
    "input": "kW",
    "expectation": {
      "unicode": "⠠⠅⠘⠺",
      "codepoints": [
        "U+2820",
        "U+2805",
        "U+2818",
        "U+283A"
      ],
      "dots": [
        "6",
        "13",
        "45",
        "2456"
      ],
      "cellCount": 4
    },
    "options": {
      "caseContext": "mixed-case-sequence"
    }
  },
  {
    "id": "DE-CASE-CASE-006",
    "semanticFamily": "STANDARD_CELL_VECTOR",
    "input": "hPa",
    "expectation": {
      "unicode": "⠠⠓⠨⠏⠁",
      "codepoints": [
        "U+2820",
        "U+2813",
        "U+2828",
        "U+280F",
        "U+2801"
      ],
      "dots": [
        "6",
        "125",
        "46",
        "1234",
        "1"
      ],
      "cellCount": 5
    },
    "options": {
      "caseContext": "mixed-case-sequence"
    }
  },
  {
    "id": "DE-CASE-CASE-007",
    "semanticFamily": "STANDARD_CELL_VECTOR",
    "input": "kΩ",
    "expectation": {
      "unicode": "⠠⠅⠰⠘⠺",
      "codepoints": [
        "U+2820",
        "U+2805",
        "U+2830",
        "U+2818",
        "U+283A"
      ],
      "dots": [
        "6",
        "13",
        "56",
        "45",
        "2456"
      ],
      "cellCount": 5
    },
    "options": {
      "caseContext": "greek-technical"
    }
  },
  {
    "id": "DE-CASE-CASE-008",
    "semanticFamily": "STANDARD_CELL_VECTOR",
    "input": "iPhone",
    "expectation": {
      "unicode": "⠠⠊⠨⠏⠓⠕⠝⠑",
      "codepoints": [
        "U+2820",
        "U+280A",
        "U+2828",
        "U+280F",
        "U+2813",
        "U+2815",
        "U+281D",
        "U+2811"
      ],
      "dots": [
        "6",
        "24",
        "46",
        "1234",
        "125",
        "135",
        "1345",
        "15"
      ],
      "cellCount": 8
    },
    "options": {
      "caseContext": "non-derivable-case"
    }
  },
  {
    "id": "DE-CASE-CASE-009",
    "semanticFamily": "STANDARD_CELL_VECTOR",
    "input": "McDonald",
    "expectation": {
      "unicode": "⠨⠍⠉⠨⠙⠕⠝⠁⠇⠙",
      "codepoints": [
        "U+2828",
        "U+280D",
        "U+2809",
        "U+2828",
        "U+2819",
        "U+2815",
        "U+281D",
        "U+2801",
        "U+2807",
        "U+2819"
      ],
      "dots": [
        "46",
        "134",
        "14",
        "46",
        "145",
        "135",
        "1345",
        "1",
        "123",
        "145"
      ],
      "cellCount": 10
    },
    "options": {
      "caseContext": "internal-capital"
    }
  },
  {
    "id": "DE-CASE-CASE-011",
    "semanticFamily": "STANDARD_CELL_VECTOR",
    "input": "z. B.",
    "expectation": {
      "unicode": "⠵⠄⠃⠄",
      "codepoints": [
        "U+2835",
        "U+2804",
        "U+2803",
        "U+2804"
      ],
      "dots": [
        "1356",
        "3",
        "12",
        "3"
      ],
      "cellCount": 4
    },
    "options": {
      "caseContext": "abbreviation-with-point"
    }
  },
  {
    "id": "DE-MATH-CASE-002",
    "semanticFamily": "STANDARD_CELL_VECTOR",
    "input": "++",
    "expectation": {
      "unicode": "⠈⠖⠖",
      "codepoints": [
        "U+2808",
        "U+2816",
        "U+2816"
      ],
      "dots": [
        "4",
        "235",
        "235"
      ],
      "cellCount": 3
    },
    "options": {}
  },
  {
    "id": "DE-NUM-CASE-001",
    "semanticFamily": "STANDARD_CELL_VECTOR",
    "input": "25",
    "expectation": {
      "unicode": "⠼⠃⠑",
      "codepoints": [
        "U+283C",
        "U+2803",
        "U+2811"
      ],
      "dots": [
        "3456",
        "12",
        "15"
      ],
      "cellCount": 3
    },
    "options": {}
  },
  {
    "id": "DE-NUM-CASE-002",
    "semanticFamily": "STANDARD_CELL_VECTOR",
    "input": "2,5",
    "expectation": {
      "unicode": "⠼⠃⠂⠑",
      "codepoints": [
        "U+283C",
        "U+2803",
        "U+2802",
        "U+2811"
      ],
      "dots": [
        "3456",
        "12",
        "2",
        "15"
      ],
      "cellCount": 4
    },
    "options": {}
  },
  {
    "id": "DE-NUM-CASE-003",
    "semanticFamily": "STANDARD_CELL_VECTOR",
    "input": "5.",
    "expectation": {
      "unicode": "⠼⠢",
      "codepoints": [
        "U+283C",
        "U+2822"
      ],
      "dots": [
        "3456",
        "26"
      ],
      "cellCount": 2
    },
    "options": {
      "ordinalStyle": "compact-lowered"
    }
  },
  {
    "id": "DE-NUM-CASE-004",
    "semanticFamily": "STANDARD_CELL_VECTOR",
    "input": "1/2",
    "expectation": {
      "unicode": "⠼⠁⠆",
      "codepoints": [
        "U+283C",
        "U+2801",
        "U+2806"
      ],
      "dots": [
        "3456",
        "1",
        "23"
      ],
      "cellCount": 3
    },
    "options": {}
  },
  {
    "id": "DE-NUM-CASE-005",
    "semanticFamily": "STANDARD_CELL_VECTOR",
    "input": "2026-08-19",
    "expectation": {
      "unicode": "⠼⠃⠚⠃⠋⠤⠼⠚⠓⠤⠼⠁⠊",
      "codepoints": [
        "U+283C",
        "U+2803",
        "U+281A",
        "U+2803",
        "U+280B",
        "U+2824",
        "U+283C",
        "U+281A",
        "U+2813",
        "U+2824",
        "U+283C",
        "U+2801",
        "U+280A"
      ],
      "dots": [
        "3456",
        "12",
        "245",
        "12",
        "124",
        "36",
        "3456",
        "245",
        "125",
        "36",
        "3456",
        "1",
        "24"
      ],
      "cellCount": 13
    },
    "options": {}
  },
  {
    "id": "DE-NUM-CASE-006",
    "semanticFamily": "STANDARD_CELL_VECTOR",
    "input": "11:20",
    "expectation": {
      "unicode": "⠼⠁⠁⠠⠒⠼⠃⠚",
      "codepoints": [
        "U+283C",
        "U+2801",
        "U+2801",
        "U+2820",
        "U+2812",
        "U+283C",
        "U+2803",
        "U+281A"
      ],
      "dots": [
        "3456",
        "1",
        "1",
        "6",
        "25",
        "3456",
        "12",
        "245"
      ],
      "cellCount": 8
    },
    "options": {
      "numericColon": "text"
    }
  },
  {
    "id": "DE-SPECIAL-CASE-001",
    "semanticFamily": "STANDARD_CELL_VECTOR",
    "input": "€20",
    "expectation": {
      "unicode": "⠈⠑⠼⠃⠚",
      "codepoints": [
        "U+2808",
        "U+2811",
        "U+283C",
        "U+2803",
        "U+281A"
      ],
      "dots": [
        "4",
        "15",
        "3456",
        "12",
        "245"
      ],
      "cellCount": 5
    },
    "options": {}
  },
  {
    "id": "DE-SPECIAL-CASE-002",
    "semanticFamily": "STANDARD_CELL_VECTOR",
    "input": "20€",
    "expectation": {
      "unicode": "⠼⠃⠚⠈⠑",
      "codepoints": [
        "U+283C",
        "U+2803",
        "U+281A",
        "U+2808",
        "U+2811"
      ],
      "dots": [
        "3456",
        "12",
        "245",
        "4",
        "15"
      ],
      "cellCount": 5
    },
    "options": {}
  },
  {
    "id": "DE-SPECIAL-CASE-003",
    "semanticFamily": "BOUNDARY_CONDITIONAL_VECTOR",
    "input": "20 €",
    "expectation": {
      "beforeBlank": {
        "unicode": "⠼⠃⠚",
        "codepoints": [
          "U+283C",
          "U+2803",
          "U+281A"
        ],
        "dots": [
          "3456",
          "12",
          "245"
        ],
        "cellCount": 3
      },
      "blank": "U+0020_OR_BRAILLE_BLANK",
      "afterBlank": {
        "unicode": "⠈⠑",
        "codepoints": [
          "U+2808",
          "U+2811"
        ],
        "dots": [
          "4",
          "15"
        ],
        "cellCount": 2
      }
    },
    "options": {}
  },
  {
    "id": "DE-STROKE-CASE-001",
    "semanticFamily": "CORE_CELL_VECTOR",
    "input": "Hamburg-Altona",
    "expectation": {
      "unicode": "⠤",
      "codepoints": [
        "U+2824"
      ],
      "dots": [
        "36"
      ],
      "cellCount": 1
    },
    "options": {}
  }
];

function uni(value) {
  return (
    value
    && typeof value === "object"
    && typeof value.unicode === "string"
  )
    ? value.unicode
    : null;
}

for (const vector of vectors) {
  test(`historical fixture ${vector.id}`, () => {
    const result =
      translateGermanBasisschrift(
        vector.input,
        vector.options,
      );

    assert.equal(
      result.ok,
      true,
      result.ok ? undefined : JSON.stringify(result),
    );

    if (!result.ok) return;

    if (vector.semanticFamily === "BOUNDARY_CONDITIONAL_VECTOR") {
      const before = uni(vector.expectation.beforeBlank);
      const after = uni(vector.expectation.afterBlank);
      assert.equal(typeof before, "string");
      assert.equal(typeof after, "string");
      assert.ok(result.unicodeBraille.startsWith(before));
      assert.ok(result.unicodeBraille.endsWith(after));
      assert.ok(result.unicodeBraille.includes("\u2800"));
      return;
    }

    if (vector.semanticFamily === "CORE_CELL_VECTOR") {
      const core = uni(vector.expectation);
      assert.equal(typeof core, "string");
      assert.ok(result.unicodeBraille.includes(core));
      return;
    }

    const expected = uni(vector.expectation);
    assert.equal(typeof expected, "string");
    assert.equal(result.unicodeBraille, expected);
  });
}

test("selective ordinary initial capital remains implicit", () => {
  const result = translateGermanBasisschrift("Haus");
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.unicodeBraille, "⠓⠁⠥⠎");
  }
});

test("accent without strategy fails closed", () => {
  const result = translateGermanBasisschrift("è");
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, "CONTEXT_REQUIRED");
});

test("internal capital without context fails closed", () => {
  const result = translateGermanBasisschrift("iPhone");
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, "CONTEXT_REQUIRED");
});

test("unknown carrier fails closed", () => {
  const result = translateGermanBasisschrift("🙂");
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, "UNSUPPORTED_INPUT");
});
