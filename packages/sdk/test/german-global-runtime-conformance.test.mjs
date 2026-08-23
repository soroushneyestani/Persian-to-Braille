import assert from "node:assert/strict";
import test from "node:test";

import {
  createGermanBrailleTranslator,
} from "../dist/index.js";

const MODES = [
  "basisschrift",
  "vollschrift",
  "kurzschrift",
];

const REGIONS = [
  {
    id: "de-at",
    overlay: null,
  },
  {
    id: "ch",
    overlay: "swiss",
  },
];

function translate(
  mode,
  regionalOverlay,
  input,
) {
  return createGermanBrailleTranslator({
    mode,
    regionalOverlay,
  }).translate(
    input,
  );
}

test(
  "public SDK exposes an executable registered 3-mode x 2-region matrix",
  () => {
    let cells = 0;

    for (const mode of MODES) {
      for (const region of REGIONS) {
        const result =
          translate(
            mode,
            region.overlay,
            "Brot",
          );

        assert.equal(
          result.ok,
          true,
          result.ok
            ? undefined
            : JSON.stringify(result),
        );

        if (!result.ok) {
          continue;
        }

        assert.equal(
          result.profile.mode,
          mode,
        );

        assert.equal(
          result.profile.regionalOverlay,
          region.overlay,
        );

        assert.equal(
          result.profile.runtimeStatus,
          "EXECUTABLE_RUNTIME_REGISTERED",
        );

        assert.equal(
          result.profile.runtimeDependency,
          "NONE",
        );

        assert.equal(
          result.profile.runtimeExecutable,
          true,
        );

        assert.equal(
          result.profile.runtimeRegistered,
          true,
        );

        cells += 1;
      }
    }

    assert.equal(
      cells,
      6,
    );
  },
);

test(
  "Swiss overlay is orthogonal for unrelated input across all three registered modes",
  () => {
    for (const mode of MODES) {
      const base =
        translate(
          mode,
          null,
          "Brot",
        );

      const swiss =
        translate(
          mode,
          "swiss",
          "Brot",
        );

      assert.equal(
        base.ok,
        true,
        base.ok
          ? undefined
          : JSON.stringify(base),
      );

      assert.equal(
        swiss.ok,
        true,
        swiss.ok
          ? undefined
          : JSON.stringify(swiss),
      );

      if (
        base.ok
        && swiss.ok
      ) {
        assert.equal(
          swiss.unicodeBraille,
          base.unicodeBraille,
        );
      }
    }
  },
);

test(
  "DE/AT explicit Eszett remains executable across all three modes",
  () => {
    let successCount = 0;

    for (const mode of MODES) {
      const result =
        translate(
          mode,
          null,
          "ß",
        );

      assert.equal(
        result.ok,
        true,
        result.ok
          ? undefined
          : JSON.stringify(result),
      );

      if (result.ok) {
        successCount += 1;
      }
    }

    assert.equal(
      successCount,
      3,
    );
  },
);

test(
  "Swiss explicit Eszett rejects across all three modes without normalization",
  () => {
    let rejectCount = 0;

    for (const mode of MODES) {
      const result =
        translate(
          mode,
          "swiss",
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
          result.profile.runtimeExecutable,
          true,
        );

        assert.equal(
          result.profile.runtimeRegistered,
          true,
        );

        rejectCount += 1;
      }
    }

    assert.equal(
      rejectCount,
      3,
    );
  },
);

test(
  "all three registered modes return the frozen real-output vectors",
  () => {
    const vectors = [
      [
        "basisschrift",
        "Hallo",
        "⠓⠁⠇⠇⠕",
      ],
      [
        "vollschrift",
        "Baum",
        "⠃⠡⠍",
      ],
      [
        "kurzschrift",
        "Center",
        "⠠⠉⠉⠞⠻",
      ],
    ];

    for (
      const [
        mode,
        input,
        expectedBraille,
      ]
      of vectors
    ) {
      const result =
        translate(
          mode,
          null,
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
          expectedBraille,
        );
      }
    }
  },
);

test(
  "unknown semantic context remains structured unresolved rather than guessed",
  () => {
    for (
      const mode
      of [
        "vollschrift",
        "kurzschrift",
      ]
    ) {
      const result =
        translate(
          mode,
          null,
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
    }
  },
);
