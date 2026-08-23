import assert from "node:assert/strict";
import test from "node:test";

import {
  applyGermanRegionalOverlay,
  executeGermanKurzschriftResolvedPlan,
  getGermanKurzschriftMapping,
  translateGermanBasisschrift,
  translateGermanVollschriftResolved,
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

function executeResolvedMode(
  mode,
  input,
) {
  if (mode === "basisschrift") {
    return translateGermanBasisschrift(
      input,
    );
  }

  if (mode === "vollschrift") {
    return translateGermanVollschriftResolved(
      input,
      [],
    );
  }

  return executeGermanKurzschriftResolvedPlan([
    {
      kind: "basisschrift",
      text: input,
    },
  ]);
}

function assertModeSuccess(
  result,
) {
  assert.equal(
    result.ok,
    true,
    result.ok
      ? undefined
      : JSON.stringify(result),
  );

  if (!result.ok) {
    throw new Error(
      JSON.stringify(result),
    );
  }

  return result;
}

test(
  "three-mode two-region matrix is executable for unrelated text",
  () => {
    let matrixCells = 0;

    for (const mode of MODES) {
      const modeResult =
        assertModeSuccess(
          executeResolvedMode(
            mode,
            "probe",
          ),
        );

      for (const region of REGIONS) {
        const regional =
          applyGermanRegionalOverlay(
            "probe",
            mode,
            region.overlay,
            modeResult.unicodeBraille,
          );

        assert.equal(
          regional.ok,
          true,
        );

        if (!regional.ok) {
          continue;
        }

        assert.equal(
          regional.unicodeBraille,
          modeResult.unicodeBraille,
        );

        assert.equal(
          regional.overlayApplied,
          false,
        );

        matrixCells += 1;
      }
    }

    assert.equal(
      matrixCells,
      6,
    );
  },
);

test(
  "DE/AT null profile preserves explicit Eszett across all modes",
  () => {
    for (const mode of MODES) {
      const modeResult =
        assertModeSuccess(
          executeResolvedMode(
            mode,
            "groß",
          ),
        );

      const regional =
        applyGermanRegionalOverlay(
          "groß",
          mode,
          null,
          modeResult.unicodeBraille,
        );

      assert.equal(
        regional.ok,
        true,
      );

      if (regional.ok) {
        assert.equal(
          regional.unicodeBraille,
          modeResult.unicodeBraille,
        );

        assert.equal(
          regional.overlayApplied,
          false,
        );
      }
    }
  },
);

test(
  "Swiss profile rejects explicit Eszett across all modes without normalization",
  () => {
    for (const mode of MODES) {
      const modeResult =
        assertModeSuccess(
          executeResolvedMode(
            mode,
            "groß",
          ),
        );

      const regional =
        applyGermanRegionalOverlay(
          "groß",
          mode,
          "swiss",
          modeResult.unicodeBraille,
        );

      assert.equal(
        regional.ok,
        false,
      );

      if (!regional.ok) {
        assert.equal(
          regional.code,
          "SWISS_EXPLICIT_ESZETT_FORBIDDEN",
        );

        assert.equal(
          regional.ruleId,
          "DE-CH410-001",
        );

        assert.equal(
          regional.automaticNormalizationApplied,
          false,
        );
      }
    }
  },
);

test(
  "Swiss gross extension is Kurzschrift-only and equals existing GROß mapping",
  () => {
    const baseMapping =
      getGermanKurzschriftMapping(
        "twoForm",
        "GROß",
      );

    assert.equal(
      baseMapping.ok,
      true,
    );

    if (!baseMapping.ok) {
      return;
    }

    const kurzBase =
      assertModeSuccess(
        executeGermanKurzschriftResolvedPlan([
          {
            kind: "basisschrift",
            text: "gross",
          },
        ]),
      );

    const swissKurz =
      applyGermanRegionalOverlay(
        "gross",
        "kurzschrift",
        "swiss",
        kurzBase.unicodeBraille,
      );

    assert.equal(
      swissKurz.ok,
      true,
    );

    if (swissKurz.ok) {
      assert.equal(
        swissKurz.unicodeBraille,
        baseMapping.unicodeBraille,
      );

      assert.equal(
        swissKurz.unicodeBraille,
        "⠛⠮",
      );

      assert.equal(
        swissKurz.overlayApplied,
        true,
      );

      assert.equal(
        swissKurz.regionalRuleId,
        "DE-CH410-002",
      );
    }

    for (
      const mode
      of [
        "basisschrift",
        "vollschrift",
      ]
    ) {
      const modeResult =
        assertModeSuccess(
          executeResolvedMode(
            mode,
            "gross",
          ),
        );

      const regional =
        applyGermanRegionalOverlay(
          "gross",
          mode,
          "swiss",
          modeResult.unicodeBraille,
        );

      assert.equal(
        regional.ok,
        true,
      );

      if (regional.ok) {
        assert.equal(
          regional.unicodeBraille,
          modeResult.unicodeBraille,
        );

        assert.equal(
          regional.overlayApplied,
          false,
        );
      }
    }
  },
);

test(
  "Swiss schliess extension equals existing SCHLIEß Kurzschrift mapping",
  () => {
    const baseMapping =
      getGermanKurzschriftMapping(
        "twoForm",
        "SCHLIEß",
      );

    assert.equal(
      baseMapping.ok,
      true,
    );

    if (!baseMapping.ok) {
      return;
    }

    const resolvedBase =
      assertModeSuccess(
        executeGermanKurzschriftResolvedPlan([
          {
            kind: "basisschrift",
            text: "schliess",
          },
        ]),
      );

    const swiss =
      applyGermanRegionalOverlay(
        "schliess",
        "kurzschrift",
        "swiss",
        resolvedBase.unicodeBraille,
      );

    assert.equal(
      swiss.ok,
      true,
    );

    if (swiss.ok) {
      assert.equal(
        swiss.unicodeBraille,
        baseMapping.unicodeBraille,
      );

      assert.equal(
        swiss.unicodeBraille,
        "⠱⠮",
      );

      assert.equal(
        swiss.overlayApplied,
        true,
      );

      assert.equal(
        swiss.regionalRuleId,
        "DE-CH410-002",
      );
    }
  },
);

test(
  "Swiss unrelated input does not leak regional behavior across modes",
  () => {
    for (const mode of MODES) {
      const modeResult =
        assertModeSuccess(
          executeResolvedMode(
            mode,
            "probe",
          ),
        );

      const base =
        applyGermanRegionalOverlay(
          "probe",
          mode,
          null,
          modeResult.unicodeBraille,
        );

      const swiss =
        applyGermanRegionalOverlay(
          "probe",
          mode,
          "swiss",
          modeResult.unicodeBraille,
        );

      assert.equal(
        base.ok,
        true,
      );

      assert.equal(
        swiss.ok,
        true,
      );

      if (
        base.ok
        && swiss.ok
      ) {
        assert.equal(
          swiss.unicodeBraille,
          base.unicodeBraille,
        );

        assert.equal(
          swiss.overlayApplied,
          false,
        );
      }
    }
  },
);
