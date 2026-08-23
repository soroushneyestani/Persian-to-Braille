import assert from "node:assert/strict";
import test from "node:test";

import {
  GERMAN_VOLLSCHRIFT_AUTOMATIC_PROVIDER_IS_NORMATIVE,
  GERMAN_VOLLSCHRIFT_AUTOMATIC_PROVIDER_KIND,
  GERMAN_VOLLSCHRIFT_AUTOMATIC_UNKNOWN_CONTEXT_POLICY,
  resolveGermanVollschriftAutomaticCandidate,
  resolveGermanVollschriftAutomatically,
  translateGermanVollschriftAutomatic,
} from "../dist/index.js";

const VECTORS = {
  "direct": [
    {
      "id": "DE-VOLL-NORM-CASE-001",
      "input": "Baum",
      "expectedBraille": "⠃⠡⠍"
    },
    {
      "id": "DE-VOLL-NORM-CASE-002",
      "input": "heute",
      "expectedBraille": "⠓⠣⠞⠑"
    },
    {
      "id": "DE-VOLL-NORM-CASE-003",
      "input": "Eisen",
      "expectedBraille": "⠩⠎⠑⠝"
    },
    {
      "id": "DE-VOLL-NORM-CASE-004",
      "input": "Docht",
      "expectedBraille": "⠙⠕⠹⠞"
    },
    {
      "id": "DE-VOLL-NORM-CASE-005",
      "input": "Asche",
      "expectedBraille": "⠁⠱⠑"
    },
    {
      "id": "DE-VOLL-NORM-CASE-006",
      "input": "Stammgäste",
      "expectedBraille": "⠾⠁⠍⠍⠛⠜⠾⠑"
    },
    {
      "id": "DE-VOLL-NORM-CASE-007",
      "input": "Bäume",
      "expectedBraille": "⠃⠌⠍⠑"
    },
    {
      "id": "DE-VOLL-NORM-CASE-008",
      "input": "Liebe",
      "expectedBraille": "⠇⠬⠃⠑"
    },
    {
      "id": "DE-VOLL-NORM-CASE-015",
      "input": "Au",
      "expectedBraille": "⠡"
    },
    {
      "id": "DE-VOLL-NORM-CASE-016",
      "input": "Ei",
      "expectedBraille": "⠩"
    },
    {
      "id": "DE-VOLL-NORM-CASE-031",
      "input": "Kapernaum",
      "expectedBraille": "⠅⠁⠏⠑⠗⠝⠁⠥⠍"
    },
    {
      "id": "DE-VOLL-NORM-CASE-032",
      "input": "Museum",
      "expectedBraille": "⠍⠥⠎⠑⠥⠍"
    },
    {
      "id": "DE-VOLL-NORM-CASE-033",
      "input": "Koffein",
      "expectedBraille": "⠅⠕⠋⠋⠑⠊⠝"
    },
    {
      "id": "DE-VOLL-NORM-CASE-034",
      "input": "Jubiläum",
      "expectedBraille": "⠚⠥⠃⠊⠇⠜⠥⠍"
    },
    {
      "id": "DE-VOLL-NORM-CASE-035",
      "input": "Familie",
      "expectedBraille": "⠋⠁⠍⠊⠇⠊⠑"
    },
    {
      "id": "DE-VOLL-NORM-CASE-037",
      "input": "Ästhet",
      "expectedBraille": "⠜⠎⠞⠓⠑⠞"
    },
    {
      "id": "DE-VOLL-NORM-CASE-038",
      "input": "Asthma",
      "expectedBraille": "⠁⠎⠞⠓⠍⠁"
    },
    {
      "id": "DE-VOLL-NORM-CASE-039",
      "input": "Esther",
      "expectedBraille": "⠑⠎⠞⠓⠑⠗"
    },
    {
      "id": "DE-VOLL-NORM-CASE-040",
      "input": "St. Gallen",
      "expectedBraille": "⠎⠞⠄⠀⠛⠁⠇⠇⠑⠝"
    },
    {
      "id": "DE-VOLL-NORM-CASE-041",
      "input": "St. Pölten",
      "expectedBraille": "⠎⠞⠄⠀⠏⠪⠇⠞⠑⠝"
    },
    {
      "id": "DE-VOLL-NORM-CASE-042",
      "input": "St. Pauli",
      "expectedBraille": "⠎⠞⠄⠀⠏⠡⠇⠊"
    },
    {
      "id": "DE-VOLL-NORM-CASE-046",
      "input": "Bruschetta",
      "expectedBraille": "⠃⠗⠥⠎⠹⠑⠞⠞⠁"
    },
    {
      "id": "DE-VOLL-NORM-CASE-047",
      "input": "Eschatologie",
      "expectedBraille": "⠑⠎⠹⠁⠞⠕⠇⠕⠛⠬"
    },
    {
      "id": "DE-VOLL-NORM-CASE-048",
      "input": "bewusst",
      "expectedBraille": "⠃⠑⠺⠥⠎⠎⠞"
    }
  ],
  "targets": [
    {
      "id": "DE-VOLL-NORM-CASE-001",
      "input": "Baum",
      "candidate": "au",
      "expectedDecision": "CONTRACT"
    },
    {
      "id": "DE-VOLL-NORM-CASE-002",
      "input": "heute",
      "candidate": "eu",
      "expectedDecision": "CONTRACT"
    },
    {
      "id": "DE-VOLL-NORM-CASE-003",
      "input": "Eisen",
      "candidate": "ei",
      "expectedDecision": "CONTRACT"
    },
    {
      "id": "DE-VOLL-NORM-CASE-004",
      "input": "Docht",
      "candidate": "ch",
      "expectedDecision": "CONTRACT"
    },
    {
      "id": "DE-VOLL-NORM-CASE-005",
      "input": "Asche",
      "candidate": "sch",
      "expectedDecision": "CONTRACT"
    },
    {
      "id": "DE-VOLL-NORM-CASE-006",
      "input": "Stammgäste",
      "candidate": "st",
      "expectedDecision": "CONTRACT"
    },
    {
      "id": "DE-VOLL-NORM-CASE-007",
      "input": "Bäume",
      "candidate": "äu",
      "expectedDecision": "CONTRACT"
    },
    {
      "id": "DE-VOLL-NORM-CASE-008",
      "input": "Liebe",
      "candidate": "ie",
      "expectedDecision": "CONTRACT"
    },
    {
      "id": "DE-VOLL-NORM-CASE-015",
      "input": "Au",
      "candidate": "au",
      "expectedDecision": "CONTRACT"
    },
    {
      "id": "DE-VOLL-NORM-CASE-016",
      "input": "Ei",
      "candidate": "ei",
      "expectedDecision": "CONTRACT"
    },
    {
      "id": "DE-VOLL-NORM-CASE-031",
      "input": "Kapernaum",
      "candidate": "au",
      "expectedDecision": "KEEP"
    },
    {
      "id": "DE-VOLL-NORM-CASE-032",
      "input": "Museum",
      "candidate": "eu",
      "expectedDecision": "KEEP"
    },
    {
      "id": "DE-VOLL-NORM-CASE-033",
      "input": "Koffein",
      "candidate": "ei",
      "expectedDecision": "KEEP"
    },
    {
      "id": "DE-VOLL-NORM-CASE-034",
      "input": "Jubiläum",
      "candidate": "äu",
      "expectedDecision": "KEEP"
    },
    {
      "id": "DE-VOLL-NORM-CASE-035",
      "input": "Familie",
      "candidate": "ie",
      "expectedDecision": "KEEP"
    },
    {
      "id": "DE-VOLL-NORM-CASE-037",
      "input": "Ästhet",
      "candidate": "st",
      "expectedDecision": "KEEP"
    },
    {
      "id": "DE-VOLL-NORM-CASE-038",
      "input": "Asthma",
      "candidate": "st",
      "expectedDecision": "KEEP"
    },
    {
      "id": "DE-VOLL-NORM-CASE-039",
      "input": "Esther",
      "candidate": "st",
      "expectedDecision": "KEEP"
    },
    {
      "id": "DE-VOLL-NORM-CASE-040",
      "input": "St. Gallen",
      "candidate": "st",
      "expectedDecision": "KEEP"
    },
    {
      "id": "DE-VOLL-NORM-CASE-041",
      "input": "St. Pölten",
      "candidate": "st",
      "expectedDecision": "KEEP"
    },
    {
      "id": "DE-VOLL-NORM-CASE-042",
      "input": "St. Pauli",
      "candidate": "st",
      "expectedDecision": "KEEP"
    },
    {
      "id": "DE-VOLL-NORM-CASE-046",
      "input": "Bruschetta",
      "candidate": "sch",
      "expectedDecision": "KEEP"
    },
    {
      "id": "DE-VOLL-NORM-CASE-047",
      "input": "Eschatologie",
      "candidate": "sch",
      "expectedDecision": "KEEP"
    },
    {
      "id": "DE-VOLL-NORM-CASE-048",
      "input": "bewusst",
      "candidate": "st",
      "expectedDecision": "KEEP"
    },
    {
      "id": "DE-VOLL-NORM-CASE-009",
      "input": "dienen",
      "candidate": "ie",
      "expectedDecision": "CONTRACT"
    },
    {
      "id": "DE-VOLL-NORM-CASE-010",
      "input": "Konnie",
      "candidate": "ie",
      "expectedDecision": "CONTRACT"
    },
    {
      "id": "DE-VOLL-NORM-CASE-011",
      "input": "apple pie",
      "candidate": "ie",
      "expectedDecision": "CONTRACT"
    },
    {
      "id": "DE-VOLL-NORM-CASE-012",
      "input": "Beige",
      "candidate": "ei",
      "expectedDecision": "CONTRACT"
    },
    {
      "id": "DE-VOLL-NORM-CASE-013",
      "input": "Marseille",
      "candidate": "ei",
      "expectedDecision": "CONTRACT"
    },
    {
      "id": "DE-VOLL-NORM-CASE-014",
      "input": "Rio de Janeiro",
      "candidate": "ei",
      "expectedDecision": "CONTRACT"
    },
    {
      "id": "DE-VOLL-NORM-CASE-017",
      "input": "Wolgaufer",
      "candidate": "au",
      "expectedDecision": "KEEP"
    },
    {
      "id": "DE-VOLL-NORM-CASE-018",
      "input": "Wegeunfall",
      "candidate": "eu",
      "expectedDecision": "KEEP"
    },
    {
      "id": "DE-VOLL-NORM-CASE-019",
      "input": "Nordseeinsel",
      "candidate": "ei",
      "expectedDecision": "KEEP"
    },
    {
      "id": "DE-VOLL-NORM-CASE-020",
      "input": "Comicheft",
      "candidate": "ch",
      "expectedDecision": "KEEP"
    },
    {
      "id": "DE-VOLL-NORM-CASE-021",
      "input": "Regierungschefin",
      "candidate": "sch",
      "expectedDecision": "KEEP"
    },
    {
      "id": "DE-VOLL-NORM-CASE-022",
      "input": "Dienstag",
      "candidate": "st",
      "expectedDecision": "KEEP"
    },
    {
      "id": "DE-VOLL-NORM-CASE-023",
      "input": "beurteilen",
      "candidate": "eu",
      "expectedDecision": "KEEP"
    },
    {
      "id": "DE-VOLL-NORM-CASE-024",
      "input": "geimpft",
      "candidate": "ei",
      "expectedDecision": "KEEP"
    },
    {
      "id": "DE-VOLL-NORM-CASE-025",
      "input": "eingeigelt",
      "candidate": "ei",
      "expectedDecision": "KEEP"
    },
    {
      "id": "DE-VOLL-NORM-CASE-026",
      "input": "Reimport",
      "candidate": "ei",
      "expectedDecision": "KEEP"
    },
    {
      "id": "DE-VOLL-NORM-CASE-027",
      "input": "Vietnam",
      "candidate": "ie",
      "expectedDecision": "KEEP"
    },
    {
      "id": "DE-VOLL-NORM-CASE-028",
      "input": "Premierminister",
      "candidate": "ie",
      "expectedDecision": "KEEP"
    },
    {
      "id": "DE-VOLL-NORM-CASE-029",
      "input": "Interview",
      "candidate": "ie",
      "expectedDecision": "KEEP"
    },
    {
      "id": "DE-VOLL-NORM-CASE-030",
      "input": "Pierre",
      "candidate": "ie",
      "expectedDecision": "KEEP"
    },
    {
      "id": "DE-VOLL-NORM-CASE-036",
      "input": "Scherzo",
      "candidate": "sch",
      "expectedDecision": "KEEP"
    },
    {
      "id": "DE-VOLL-NORM-CASE-043",
      "input": "Gässchen",
      "candidate": "sch",
      "expectedDecision": "KEEP"
    },
    {
      "id": "DE-VOLL-NORM-CASE-044",
      "input": "Häschen",
      "candidate": "sch",
      "expectedDecision": "KEEP"
    },
    {
      "id": "DE-VOLL-NORM-CASE-045",
      "input": "Häuschen",
      "candidate": "sch",
      "expectedDecision": "KEEP"
    }
  ],
  "fallback": [
    {
      "id": "DE-VOLL-NORM-CASE-043",
      "input": "Gässchen",
      "candidate": "ch",
      "expectedDecision": "CONTRACT"
    },
    {
      "id": "DE-VOLL-NORM-CASE-044",
      "input": "Häschen",
      "candidate": "ch",
      "expectedDecision": "CONTRACT"
    },
    {
      "id": "DE-VOLL-NORM-CASE-045",
      "input": "Häuschen",
      "candidate": "ch",
      "expectedDecision": "CONTRACT"
    }
  ]
};

test(
  "automatic Vollschrift provider boundary is explicit",
  () => {
    assert.equal(
      GERMAN_VOLLSCHRIFT_AUTOMATIC_PROVIDER_KIND,
      "CLOSED_NORMATIVE_SOURCE_REGISTRY",
    );
    assert.equal(
      GERMAN_VOLLSCHRIFT_AUTOMATIC_PROVIDER_IS_NORMATIVE,
      false,
    );
    assert.equal(
      GERMAN_VOLLSCHRIFT_AUTOMATIC_UNKNOWN_CONTEXT_POLICY,
      "STRUCTURED_UNRESOLVED",
    );
  },
);

for (const vector of VECTORS.direct) {
  test(
    `automatic Vollschrift exact source rendering ${vector.id}`,
    () => {
      const result =
        translateGermanVollschriftAutomatic(
          vector.input,
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
      assert.equal(
        result.sourceFixtureId,
        vector.id,
      );
      assert.equal(
        result.runtime.automaticProviderResolutionExecutable,
        true,
      );
      assert.equal(
        result.runtime.runtimeRegistered,
        false,
      );
    },
  );
}

for (const vector of VECTORS.targets) {
  test(
    `automatic Vollschrift source decision ${vector.id}`,
    () => {
      const result =
        resolveGermanVollschriftAutomaticCandidate(
          vector.input,
          vector.candidate,
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
          result.decision,
          vector.expectedDecision,
        );
      }
    },
  );
}

for (const vector of VECTORS.fallback) {
  test(
    `automatic Vollschrift ch fallback ${vector.id}`,
    () => {
      const result =
        resolveGermanVollschriftAutomaticCandidate(
          vector.input,
          vector.candidate,
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
          result.decision,
          "CONTRACT",
        );
      }
    },
  );
}

test(
  "eingeigelt word-level non-contraction applies conservatively to both ei occurrences",
  () => {
    const result =
      translateGermanVollschriftAutomatic(
        "eingeigelt",
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

    const eiTrace =
      result.decisionTrace.filter(
        (item) =>
          item.candidate === "ei",
      );

    assert.equal(
      eiTrace.length,
      2,
    );
    assert.ok(
      eiTrace.every(
        (item) =>
          item.decision === "KEEP",
      ),
    );
  },
);

test(
  "Gässchen preserves sch and activates source-backed ch fallback",
  () => {
    const plan =
      resolveGermanVollschriftAutomatically(
        "Gässchen",
      );

    assert.equal(
      plan.ok,
      true,
      plan.ok
        ? undefined
        : JSON.stringify(plan),
    );

    if (!plan.ok) {
      return;
    }

    assert.ok(
      plan.resolvedCandidates.some(
        (item) =>
          item.candidate === "sch"
          && item.decision === "KEEP",
      ),
    );
    assert.ok(
      plan.resolvedCandidates.some(
        (item) =>
          item.candidate === "ch"
          && item.decision === "CONTRACT",
      ),
    );
  },
);

test(
  "candidate-free text is automatically executable",
  () => {
    const result =
      translateGermanVollschriftAutomatic(
        "Brot",
      );

    assert.equal(
      result.ok,
      true,
      result.ok
        ? undefined
        : JSON.stringify(result),
    );
  },
);

test(
  "unknown pronunciation or morphology context fails closed",
  () => {
    const result =
      translateGermanVollschriftAutomatic(
        "xaux",
      );

    assert.equal(
      result.ok,
      false,
    );

    if (!result.ok) {
      assert.equal(
        result.code,
        "SOURCE_CONTEXT_UNRESOLVED",
      );
      assert.equal(
        result.candidate,
        "au",
      );
    }
  },
);
