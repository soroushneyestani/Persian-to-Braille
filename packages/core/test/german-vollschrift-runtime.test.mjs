import assert from "node:assert/strict";
import test from "node:test";

import {
  resolveGermanVollschriftCandidate,
  translateGermanVollschriftResolved,
} from "../dist/index.js";

const VECTORS = {
  "direct": [
    {
      "id": "DE-VOLL-NORM-CASE-001",
      "input": "Baum",
      "candidate": "au",
      "fixtureClass": "MUST_CONTRACT",
      "expectedDecision": "CONTRACT",
      "expectedBraille": "⠃⠡⠍",
      "resolvedCandidates": [
        {
          "startCodePoint": 1,
          "candidate": "au",
          "decision": "CONTRACT"
        }
      ],
      "dependency": null
    },
    {
      "id": "DE-VOLL-NORM-CASE-002",
      "input": "heute",
      "candidate": "eu",
      "fixtureClass": "MUST_CONTRACT",
      "expectedDecision": "CONTRACT",
      "expectedBraille": "⠓⠣⠞⠑",
      "resolvedCandidates": [
        {
          "startCodePoint": 1,
          "candidate": "eu",
          "decision": "CONTRACT"
        }
      ],
      "dependency": null
    },
    {
      "id": "DE-VOLL-NORM-CASE-003",
      "input": "Eisen",
      "candidate": "ei",
      "fixtureClass": "MUST_CONTRACT",
      "expectedDecision": "CONTRACT",
      "expectedBraille": "⠩⠎⠑⠝",
      "resolvedCandidates": [
        {
          "startCodePoint": 0,
          "candidate": "ei",
          "decision": "CONTRACT"
        }
      ],
      "dependency": null
    },
    {
      "id": "DE-VOLL-NORM-CASE-004",
      "input": "Docht",
      "candidate": "ch",
      "fixtureClass": "MUST_CONTRACT",
      "expectedDecision": "CONTRACT",
      "expectedBraille": "⠙⠕⠹⠞",
      "resolvedCandidates": [
        {
          "startCodePoint": 2,
          "candidate": "ch",
          "decision": "CONTRACT"
        }
      ],
      "dependency": null
    },
    {
      "id": "DE-VOLL-NORM-CASE-005",
      "input": "Asche",
      "candidate": "sch",
      "fixtureClass": "MUST_CONTRACT",
      "expectedDecision": "CONTRACT",
      "expectedBraille": "⠁⠱⠑",
      "resolvedCandidates": [
        {
          "startCodePoint": 1,
          "candidate": "sch",
          "decision": "CONTRACT"
        },
        {
          "startCodePoint": 2,
          "candidate": "ch",
          "decision": "KEEP"
        }
      ],
      "dependency": null
    },
    {
      "id": "DE-VOLL-NORM-CASE-006",
      "input": "Stammgäste",
      "candidate": "st",
      "fixtureClass": "MUST_CONTRACT",
      "expectedDecision": "CONTRACT",
      "expectedBraille": "⠾⠁⠍⠍⠛⠜⠾⠑",
      "resolvedCandidates": [
        {
          "startCodePoint": 0,
          "candidate": "st",
          "decision": "CONTRACT"
        },
        {
          "startCodePoint": 7,
          "candidate": "st",
          "decision": "CONTRACT"
        }
      ],
      "dependency": null
    },
    {
      "id": "DE-VOLL-NORM-CASE-007",
      "input": "Bäume",
      "candidate": "äu",
      "fixtureClass": "MUST_CONTRACT",
      "expectedDecision": "CONTRACT",
      "expectedBraille": "⠃⠌⠍⠑",
      "resolvedCandidates": [
        {
          "startCodePoint": 1,
          "candidate": "äu",
          "decision": "CONTRACT"
        }
      ],
      "dependency": null
    },
    {
      "id": "DE-VOLL-NORM-CASE-008",
      "input": "Liebe",
      "candidate": "ie",
      "fixtureClass": "MUST_CONTRACT",
      "expectedDecision": "CONTRACT",
      "expectedBraille": "⠇⠬⠃⠑",
      "resolvedCandidates": [
        {
          "startCodePoint": 1,
          "candidate": "ie",
          "decision": "CONTRACT"
        }
      ],
      "dependency": null
    },
    {
      "id": "DE-VOLL-NORM-CASE-015",
      "input": "Au",
      "candidate": "au",
      "fixtureClass": "MUST_CONTRACT",
      "expectedDecision": "CONTRACT",
      "expectedBraille": "⠡",
      "resolvedCandidates": [
        {
          "startCodePoint": 0,
          "candidate": "au",
          "decision": "CONTRACT"
        }
      ],
      "dependency": null
    },
    {
      "id": "DE-VOLL-NORM-CASE-016",
      "input": "Ei",
      "candidate": "ei",
      "fixtureClass": "MUST_CONTRACT",
      "expectedDecision": "CONTRACT",
      "expectedBraille": "⠩",
      "resolvedCandidates": [
        {
          "startCodePoint": 0,
          "candidate": "ei",
          "decision": "CONTRACT"
        }
      ],
      "dependency": null
    },
    {
      "id": "DE-VOLL-NORM-CASE-031",
      "input": "Kapernaum",
      "candidate": "au",
      "fixtureClass": "MUST_NOT_CONTRACT",
      "expectedDecision": "KEEP_LETTERS",
      "expectedBraille": "⠅⠁⠏⠑⠗⠝⠁⠥⠍",
      "resolvedCandidates": [
        {
          "startCodePoint": 6,
          "candidate": "au",
          "decision": "KEEP"
        }
      ],
      "dependency": null
    },
    {
      "id": "DE-VOLL-NORM-CASE-032",
      "input": "Museum",
      "candidate": "eu",
      "fixtureClass": "MUST_NOT_CONTRACT",
      "expectedDecision": "KEEP_LETTERS",
      "expectedBraille": "⠍⠥⠎⠑⠥⠍",
      "resolvedCandidates": [
        {
          "startCodePoint": 3,
          "candidate": "eu",
          "decision": "KEEP"
        }
      ],
      "dependency": null
    },
    {
      "id": "DE-VOLL-NORM-CASE-033",
      "input": "Koffein",
      "candidate": "ei",
      "fixtureClass": "MUST_NOT_CONTRACT",
      "expectedDecision": "KEEP_LETTERS",
      "expectedBraille": "⠅⠕⠋⠋⠑⠊⠝",
      "resolvedCandidates": [
        {
          "startCodePoint": 4,
          "candidate": "ei",
          "decision": "KEEP"
        }
      ],
      "dependency": null
    },
    {
      "id": "DE-VOLL-NORM-CASE-034",
      "input": "Jubiläum",
      "candidate": "äu",
      "fixtureClass": "MUST_NOT_CONTRACT",
      "expectedDecision": "KEEP_LETTERS",
      "expectedBraille": "⠚⠥⠃⠊⠇⠜⠥⠍",
      "resolvedCandidates": [
        {
          "startCodePoint": 5,
          "candidate": "äu",
          "decision": "KEEP"
        }
      ],
      "dependency": null
    },
    {
      "id": "DE-VOLL-NORM-CASE-035",
      "input": "Familie",
      "candidate": "ie",
      "fixtureClass": "MUST_NOT_CONTRACT",
      "expectedDecision": "KEEP_LETTERS",
      "expectedBraille": "⠋⠁⠍⠊⠇⠊⠑",
      "resolvedCandidates": [
        {
          "startCodePoint": 5,
          "candidate": "ie",
          "decision": "KEEP"
        }
      ],
      "dependency": null
    },
    {
      "id": "DE-VOLL-NORM-CASE-037",
      "input": "Ästhet",
      "candidate": "st",
      "fixtureClass": "MUST_NOT_CONTRACT",
      "expectedDecision": "KEEP_LETTERS",
      "expectedBraille": "⠜⠎⠞⠓⠑⠞",
      "resolvedCandidates": [
        {
          "startCodePoint": 1,
          "candidate": "st",
          "decision": "KEEP"
        }
      ],
      "dependency": null
    },
    {
      "id": "DE-VOLL-NORM-CASE-038",
      "input": "Asthma",
      "candidate": "st",
      "fixtureClass": "MUST_NOT_CONTRACT",
      "expectedDecision": "KEEP_LETTERS",
      "expectedBraille": "⠁⠎⠞⠓⠍⠁",
      "resolvedCandidates": [
        {
          "startCodePoint": 1,
          "candidate": "st",
          "decision": "KEEP"
        }
      ],
      "dependency": null
    },
    {
      "id": "DE-VOLL-NORM-CASE-039",
      "input": "Esther",
      "candidate": "st",
      "fixtureClass": "MUST_NOT_CONTRACT",
      "expectedDecision": "KEEP_LETTERS",
      "expectedBraille": "⠑⠎⠞⠓⠑⠗",
      "resolvedCandidates": [
        {
          "startCodePoint": 1,
          "candidate": "st",
          "decision": "KEEP"
        }
      ],
      "dependency": null
    },
    {
      "id": "DE-VOLL-NORM-CASE-040",
      "input": "St. Gallen",
      "candidate": "st",
      "fixtureClass": "MUST_NOT_CONTRACT",
      "expectedDecision": "KEEP_LETTERS",
      "expectedBraille": "⠎⠞⠄⠀⠛⠁⠇⠇⠑⠝",
      "resolvedCandidates": [
        {
          "startCodePoint": 0,
          "candidate": "st",
          "decision": "KEEP"
        }
      ],
      "dependency": null
    },
    {
      "id": "DE-VOLL-NORM-CASE-041",
      "input": "St. Pölten",
      "candidate": "st",
      "fixtureClass": "MUST_NOT_CONTRACT",
      "expectedDecision": "KEEP_LETTERS",
      "expectedBraille": "⠎⠞⠄⠀⠏⠪⠇⠞⠑⠝",
      "resolvedCandidates": [
        {
          "startCodePoint": 0,
          "candidate": "st",
          "decision": "KEEP"
        }
      ],
      "dependency": null
    },
    {
      "id": "DE-VOLL-NORM-CASE-042",
      "input": "St. Pauli",
      "candidate": "st",
      "fixtureClass": "MUST_NOT_CONTRACT",
      "expectedDecision": "KEEP_LETTERS",
      "expectedBraille": "⠎⠞⠄⠀⠏⠡⠇⠊",
      "resolvedCandidates": [
        {
          "startCodePoint": 0,
          "candidate": "st",
          "decision": "KEEP"
        },
        {
          "startCodePoint": 5,
          "candidate": "au",
          "decision": "CONTRACT"
        }
      ],
      "dependency": null
    },
    {
      "id": "DE-VOLL-NORM-CASE-046",
      "input": "Bruschetta",
      "candidate": "sch",
      "fixtureClass": "PARTIAL_CANDIDATE_FALLBACK",
      "expectedDecision": "REJECT_SCH_ALLOW_CH",
      "expectedBraille": "⠃⠗⠥⠎⠹⠑⠞⠞⠁",
      "resolvedCandidates": [
        {
          "startCodePoint": 3,
          "candidate": "sch",
          "decision": "KEEP"
        },
        {
          "startCodePoint": 4,
          "candidate": "ch",
          "decision": "CONTRACT"
        }
      ],
      "dependency": null
    },
    {
      "id": "DE-VOLL-NORM-CASE-047",
      "input": "Eschatologie",
      "candidate": "sch",
      "fixtureClass": "PARTIAL_CANDIDATE_FALLBACK",
      "expectedDecision": "REJECT_SCH_ALLOW_CH",
      "expectedBraille": "⠑⠎⠹⠁⠞⠕⠇⠕⠛⠬",
      "resolvedCandidates": [
        {
          "startCodePoint": 1,
          "candidate": "sch",
          "decision": "KEEP"
        },
        {
          "startCodePoint": 2,
          "candidate": "ch",
          "decision": "CONTRACT"
        },
        {
          "startCodePoint": 10,
          "candidate": "ie",
          "decision": "CONTRACT"
        }
      ],
      "dependency": null
    },
    {
      "id": "DE-VOLL-NORM-CASE-048",
      "input": "bewusst",
      "candidate": "st",
      "fixtureClass": "DEFERRED_DEPENDENCY",
      "expectedDecision": "KEEP_ST_LETTERS",
      "expectedBraille": "⠃⠑⠺⠥⠎⠎⠞",
      "resolvedCandidates": [
        {
          "startCodePoint": 5,
          "candidate": "st",
          "decision": "KEEP"
        }
      ],
      "dependency": "CHAPTER_4_DOUBLE_S_PRIORITY"
    }
  ],
  "nonDirect": [
    {
      "id": "DE-VOLL-NORM-CASE-009",
      "input": "dienen",
      "candidate": "ie",
      "fixtureClass": "MUST_CONTRACT",
      "expectedDecision": "CONTRACT",
      "evidence": {
        "pronunciation": "ELIGIBLE",
        "boundaryCrosses": false
      },
      "ruleRefs": [
        "DE-VOLL-PRON-003",
        "DE-VOLL-PRON-006"
      ]
    },
    {
      "id": "DE-VOLL-NORM-CASE-010",
      "input": "Konnie",
      "candidate": "ie",
      "fixtureClass": "MUST_CONTRACT",
      "expectedDecision": "CONTRACT",
      "evidence": {
        "pronunciation": "ELIGIBLE",
        "boundaryCrosses": false
      },
      "ruleRefs": [
        "DE-VOLL-PRON-003",
        "DE-VOLL-PRON-006"
      ]
    },
    {
      "id": "DE-VOLL-NORM-CASE-011",
      "input": "apple pie",
      "candidate": "ie",
      "fixtureClass": "MUST_CONTRACT",
      "expectedDecision": "CONTRACT",
      "evidence": {
        "pronunciation": "ELIGIBLE",
        "boundaryCrosses": false
      },
      "ruleRefs": [
        "DE-VOLL-PRON-003",
        "DE-VOLL-PRON-005",
        "DE-VOLL-PRON-006"
      ]
    },
    {
      "id": "DE-VOLL-NORM-CASE-012",
      "input": "Beige",
      "candidate": "ei",
      "fixtureClass": "MUST_CONTRACT",
      "expectedDecision": "CONTRACT",
      "evidence": {
        "pronunciation": "ELIGIBLE",
        "boundaryCrosses": false
      },
      "ruleRefs": [
        "DE-VOLL-PRON-003",
        "DE-VOLL-PRON-005",
        "DE-VOLL-PRON-008"
      ]
    },
    {
      "id": "DE-VOLL-NORM-CASE-013",
      "input": "Marseille",
      "candidate": "ei",
      "fixtureClass": "MUST_CONTRACT",
      "expectedDecision": "CONTRACT",
      "evidence": {
        "pronunciation": "ELIGIBLE",
        "boundaryCrosses": false
      },
      "ruleRefs": [
        "DE-VOLL-PRON-003",
        "DE-VOLL-PRON-005",
        "DE-VOLL-PRON-008"
      ]
    },
    {
      "id": "DE-VOLL-NORM-CASE-014",
      "input": "Rio de Janeiro",
      "candidate": "ei",
      "fixtureClass": "MUST_CONTRACT",
      "expectedDecision": "CONTRACT",
      "evidence": {
        "pronunciation": "ELIGIBLE",
        "boundaryCrosses": false
      },
      "ruleRefs": [
        "DE-VOLL-PRON-003",
        "DE-VOLL-PRON-005",
        "DE-VOLL-PRON-008"
      ]
    },
    {
      "id": "DE-VOLL-NORM-CASE-017",
      "input": "Wolgaufer",
      "candidate": "au",
      "fixtureClass": "MUST_NOT_CONTRACT",
      "expectedDecision": "KEEP_LETTERS",
      "evidence": {
        "boundaryCrosses": true,
        "boundaryClass": "COMPOUND_WORD_SEAM"
      },
      "ruleRefs": [
        "DE-VOLL-MORPH-002"
      ]
    },
    {
      "id": "DE-VOLL-NORM-CASE-018",
      "input": "Wegeunfall",
      "candidate": "eu",
      "fixtureClass": "MUST_NOT_CONTRACT",
      "expectedDecision": "KEEP_LETTERS",
      "evidence": {
        "boundaryCrosses": true,
        "boundaryClass": "COMPOUND_WORD_SEAM"
      },
      "ruleRefs": [
        "DE-VOLL-MORPH-002"
      ]
    },
    {
      "id": "DE-VOLL-NORM-CASE-019",
      "input": "Nordseeinsel",
      "candidate": "ei",
      "fixtureClass": "MUST_NOT_CONTRACT",
      "expectedDecision": "KEEP_LETTERS",
      "evidence": {
        "boundaryCrosses": true,
        "boundaryClass": "COMPOUND_WORD_SEAM"
      },
      "ruleRefs": [
        "DE-VOLL-MORPH-002"
      ]
    },
    {
      "id": "DE-VOLL-NORM-CASE-020",
      "input": "Comicheft",
      "candidate": "ch",
      "fixtureClass": "MUST_NOT_CONTRACT",
      "expectedDecision": "KEEP_LETTERS",
      "evidence": {
        "boundaryCrosses": true,
        "boundaryClass": "COMPOUND_WORD_SEAM"
      },
      "ruleRefs": [
        "DE-VOLL-MORPH-002"
      ]
    },
    {
      "id": "DE-VOLL-NORM-CASE-021",
      "input": "Regierungschefin",
      "candidate": "sch",
      "fixtureClass": "MUST_NOT_CONTRACT",
      "expectedDecision": "KEEP_LETTERS",
      "evidence": {
        "boundaryCrosses": true,
        "boundaryClass": "COMPOUND_WORD_SEAM"
      },
      "ruleRefs": [
        "DE-VOLL-MORPH-002"
      ]
    },
    {
      "id": "DE-VOLL-NORM-CASE-022",
      "input": "Dienstag",
      "candidate": "st",
      "fixtureClass": "MUST_NOT_CONTRACT",
      "expectedDecision": "KEEP_LETTERS",
      "evidence": {
        "boundaryCrosses": true,
        "boundaryClass": "COMPOUND_WORD_SEAM"
      },
      "ruleRefs": [
        "DE-VOLL-MORPH-002"
      ]
    },
    {
      "id": "DE-VOLL-NORM-CASE-023",
      "input": "beurteilen",
      "candidate": "eu",
      "fixtureClass": "MUST_NOT_CONTRACT",
      "expectedDecision": "KEEP_LETTERS",
      "evidence": {
        "boundaryCrosses": true,
        "boundaryClass": "PREFIX_TO_STEM"
      },
      "ruleRefs": [
        "DE-VOLL-MORPH-004"
      ]
    },
    {
      "id": "DE-VOLL-NORM-CASE-024",
      "input": "geimpft",
      "candidate": "ei",
      "fixtureClass": "MUST_NOT_CONTRACT",
      "expectedDecision": "KEEP_LETTERS",
      "evidence": {
        "boundaryCrosses": true,
        "boundaryClass": "PREFIX_TO_STEM"
      },
      "ruleRefs": [
        "DE-VOLL-MORPH-004"
      ]
    },
    {
      "id": "DE-VOLL-NORM-CASE-025",
      "input": "eingeigelt",
      "candidate": "ei",
      "fixtureClass": "MUST_NOT_CONTRACT",
      "expectedDecision": "KEEP_LETTERS",
      "evidence": {
        "boundaryCrosses": true,
        "boundaryClass": "PREFIX_TO_STEM"
      },
      "ruleRefs": [
        "DE-VOLL-MORPH-004"
      ]
    },
    {
      "id": "DE-VOLL-NORM-CASE-026",
      "input": "Reimport",
      "candidate": "ei",
      "fixtureClass": "MUST_NOT_CONTRACT",
      "expectedDecision": "KEEP_LETTERS",
      "evidence": {
        "boundaryCrosses": true,
        "boundaryClass": "PREFIX_TO_STEM"
      },
      "ruleRefs": [
        "DE-VOLL-MORPH-004"
      ]
    },
    {
      "id": "DE-VOLL-NORM-CASE-027",
      "input": "Vietnam",
      "candidate": "ie",
      "fixtureClass": "MUST_NOT_CONTRACT",
      "expectedDecision": "KEEP_LETTERS",
      "evidence": {
        "pronunciation": "INELIGIBLE",
        "boundaryCrosses": false
      },
      "ruleRefs": [
        "DE-VOLL-PRON-007"
      ]
    },
    {
      "id": "DE-VOLL-NORM-CASE-028",
      "input": "Premierminister",
      "candidate": "ie",
      "fixtureClass": "MUST_NOT_CONTRACT",
      "expectedDecision": "KEEP_LETTERS",
      "evidence": {
        "pronunciation": "INELIGIBLE",
        "boundaryCrosses": false
      },
      "ruleRefs": [
        "DE-VOLL-PRON-007"
      ]
    },
    {
      "id": "DE-VOLL-NORM-CASE-029",
      "input": "Interview",
      "candidate": "ie",
      "fixtureClass": "MUST_NOT_CONTRACT",
      "expectedDecision": "KEEP_LETTERS",
      "evidence": {
        "pronunciation": "INELIGIBLE",
        "boundaryCrosses": false
      },
      "ruleRefs": [
        "DE-VOLL-PRON-007"
      ]
    },
    {
      "id": "DE-VOLL-NORM-CASE-030",
      "input": "Pierre",
      "candidate": "ie",
      "fixtureClass": "MUST_NOT_CONTRACT",
      "expectedDecision": "KEEP_LETTERS",
      "evidence": {
        "pronunciation": "INELIGIBLE",
        "boundaryCrosses": false
      },
      "ruleRefs": [
        "DE-VOLL-PRON-007"
      ]
    },
    {
      "id": "DE-VOLL-NORM-CASE-036",
      "input": "Scherzo",
      "candidate": "sch",
      "fixtureClass": "MUST_NOT_CONTRACT",
      "expectedDecision": "KEEP_LETTERS",
      "evidence": {
        "pronunciation": "INELIGIBLE",
        "boundaryCrosses": false
      },
      "ruleRefs": [
        "DE-VOLL-PRON-010",
        "DE-VOLL-PRON-011"
      ]
    },
    {
      "id": "DE-VOLL-NORM-CASE-043",
      "input": "Gässchen",
      "candidate": "sch",
      "fixtureClass": "PARTIAL_CANDIDATE_FALLBACK",
      "expectedDecision": "REJECT_SCH_ALLOW_CH",
      "evidence": {
        "boundaryCrosses": true,
        "boundaryClass": "STEM_TO_SUFFIX"
      },
      "ruleRefs": [
        "DE-VOLL-MORPH-007",
        "DE-VOLL-MORPH-008"
      ],
      "fallbackCandidate": "ch",
      "fallbackEvidence": {
        "boundaryCrosses": false
      }
    },
    {
      "id": "DE-VOLL-NORM-CASE-044",
      "input": "Häschen",
      "candidate": "sch",
      "fixtureClass": "PARTIAL_CANDIDATE_FALLBACK",
      "expectedDecision": "REJECT_SCH_ALLOW_CH",
      "evidence": {
        "boundaryCrosses": true,
        "boundaryClass": "STEM_TO_SUFFIX"
      },
      "ruleRefs": [
        "DE-VOLL-MORPH-007",
        "DE-VOLL-MORPH-008"
      ],
      "fallbackCandidate": "ch",
      "fallbackEvidence": {
        "boundaryCrosses": false
      }
    },
    {
      "id": "DE-VOLL-NORM-CASE-045",
      "input": "Häuschen",
      "candidate": "sch",
      "fixtureClass": "PARTIAL_CANDIDATE_FALLBACK",
      "expectedDecision": "REJECT_SCH_ALLOW_CH",
      "evidence": {
        "boundaryCrosses": true,
        "boundaryClass": "STEM_TO_SUFFIX"
      },
      "ruleRefs": [
        "DE-VOLL-MORPH-007",
        "DE-VOLL-MORPH-008"
      ],
      "fallbackCandidate": "ch",
      "fallbackEvidence": {
        "boundaryCrosses": false
      }
    }
  ],
  "contractionMap": {
    "au": "⠡",
    "eu": "⠣",
    "ei": "⠩",
    "ch": "⠹",
    "sch": "⠱",
    "st": "⠾",
    "äu": "⠌",
    "ie": "⠬"
  }
};

for (const vector of VECTORS.direct) {
  test(
    `Vollschrift direct normative rendering ${vector.id}`,
    () => {
      const result =
        translateGermanVollschriftResolved(
          vector.input,
          vector.resolvedCandidates,
        );

      assert.equal(
        result.ok,
        true,
        result.ok
          ? undefined
          : JSON.stringify(result),
      );

      if (!result.ok) {
        return;
      }

      assert.equal(
        result.unicodeBraille,
        vector.expectedBraille,
      );

      const targetTrace =
        result.decisionTrace.filter(
          (item) =>
            item.candidate
            === vector.candidate,
        );

      assert.ok(
        targetTrace.length > 0,
        `No target trace for ${vector.id}`,
      );

      if (
        vector.expectedDecision
        === "CONTRACT"
      ) {
        assert.ok(
          targetTrace.some(
            (item) =>
              item.decision
              === "CONTRACT",
          ),
        );
      } else {
        assert.ok(
          targetTrace.some(
            (item) =>
              item.decision
              === "KEEP",
          ),
        );
      }

      if (
        vector.expectedDecision
        === "REJECT_SCH_ALLOW_CH"
      ) {
        assert.ok(
          result.decisionTrace.some(
            (item) =>
              item.candidate
              === "sch"
              && item.decision
              === "KEEP",
          ),
        );

        assert.ok(
          result.decisionTrace.some(
            (item) =>
              item.candidate
              === "ch"
              && item.decision
              === "CONTRACT",
          ),
        );
      }
    },
  );
}

for (const vector of VECTORS.nonDirect) {
  test(
    `Vollschrift non-direct normative decision ${vector.id}`,
    () => {
      const result =
        resolveGermanVollschriftCandidate(
          vector.candidate,
          vector.evidence,
        );

      assert.equal(
        result.ok,
        true,
        result.ok
          ? undefined
          : JSON.stringify(result),
      );

      if (!result.ok) {
        return;
      }

      if (
        vector.expectedDecision
        === "CONTRACT"
      ) {
        assert.equal(
          result.decision,
          "CONTRACT",
        );
      } else {
        assert.equal(
          result.decision,
          "KEEP",
        );
      }

      if (
        vector.expectedDecision
        === "REJECT_SCH_ALLOW_CH"
      ) {
        assert.equal(
          result.decision,
          "KEEP",
        );

        const fallback =
          resolveGermanVollschriftCandidate(
            vector.fallbackCandidate,
            vector.fallbackEvidence,
          );

        assert.equal(
          fallback.ok,
          true,
          fallback.ok
            ? undefined
            : JSON.stringify(fallback),
        );

        if (fallback.ok) {
          assert.equal(
            fallback.decision,
            "CONTRACT",
          );
        }
      }
    },
  );
}

test(
  "Vollschrift candidate resolution fails closed without provider context",
  () => {
    const result =
      resolveGermanVollschriftCandidate(
        "au",
        {},
      );

    assert.equal(
      result.ok,
      false,
    );

    if (!result.ok) {
      assert.equal(
        result.code,
        "CONTEXT_REQUIRED",
      );
    }
  },
);

test(
  "Vollschrift text execution fails closed without explicit reachable resolution",
  () => {
    const result =
      translateGermanVollschriftResolved(
        "Baum",
        [],
      );

    assert.equal(
      result.ok,
      false,
    );

    if (!result.ok) {
      assert.equal(
        result.code,
        "CONTEXT_REQUIRED",
      );
    }
  },
);

test(
  "st remains non-unconditional",
  () => {
    const result =
      resolveGermanVollschriftCandidate(
        "st",
        {},
      );

    assert.equal(
      result.ok,
      false,
    );

    if (!result.ok) {
      assert.equal(
        result.code,
        "CONTEXT_REQUIRED",
      );
    }
  },
);
