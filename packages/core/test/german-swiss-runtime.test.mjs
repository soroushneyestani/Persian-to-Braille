import assert from "node:assert/strict";
import test from "node:test";

import {
  SWISS_EXPLICIT_ESZETT_FORBIDDEN,
  SWISS_EXPLICIT_ESZETT_INPUT_POLICY,
  applyGermanRegionalOverlay,
  translateGermanBasisschrift,
} from "../dist/index.js";

const MODES = [
  "basisschrift",
  "vollschrift",
  "kurzschrift",
];

test(
  "Swiss explicit Eszett policy is frozen to REJECT",
  () => {
    assert.equal(
      SWISS_EXPLICIT_ESZETT_INPUT_POLICY,
      "REJECT",
    );

    assert.equal(
      SWISS_EXPLICIT_ESZETT_FORBIDDEN,
      "SWISS_EXPLICIT_ESZETT_FORBIDDEN",
    );
  },
);

test(
  "null regional overlay is identity across all three German modes",
  () => {
    for (const mode of MODES) {
      const result =
        applyGermanRegionalOverlay(
          "probe",
          mode,
          null,
          "⠏⠗⠕⠃⠑",
        );

      assert.equal(result.ok, true);

      if (result.ok) {
        assert.equal(
          result.unicodeBraille,
          "⠏⠗⠕⠃⠑",
        );

        assert.equal(
          result.overlayApplied,
          false,
        );

        assert.equal(
          result.regionalRuleId,
          null,
        );
      }
    }
  },
);

test(
  "non-Swiss base Eszett mapping remains active",
  () => {
    const base =
      translateGermanBasisschrift("ß");

    assert.equal(base.ok, true);

    if (!base.ok) {
      return;
    }

    assert.equal(
      base.unicodeBraille,
      "⠮",
    );

    const result =
      applyGermanRegionalOverlay(
        "ß",
        "basisschrift",
        null,
        base.unicodeBraille,
      );

    assert.equal(result.ok, true);

    if (result.ok) {
      assert.equal(
        result.unicodeBraille,
        "⠮",
      );
    }
  },
);

test(
  "Swiss explicit Eszett fails closed in all three modes",
  () => {
    for (const mode of MODES) {
      const result =
        applyGermanRegionalOverlay(
          "groß",
          mode,
          "swiss",
          "⠛⠗⠕⠮",
        );

      assert.equal(result.ok, false);

      if (!result.ok) {
        assert.equal(
          result.code,
          "SWISS_EXPLICIT_ESZETT_FORBIDDEN",
        );

        assert.equal(
          result.ruleId,
          "DE-CH410-001",
        );

        assert.equal(
          result.automaticNormalizationApplied,
          false,
        );
      }
    }
  },
);

test(
  "Swiss gross reuses existing GROß Kurzschrift mapping",
  () => {
    const result =
      applyGermanRegionalOverlay(
        "gross",
        "kurzschrift",
        "swiss",
        "⠛⠗⠕⠎⠎",
      );

    assert.equal(result.ok, true);

    if (result.ok) {
      assert.equal(
        result.unicodeBraille,
        "⠛⠮",
      );

      assert.equal(
        result.overlayApplied,
        true,
      );

      assert.equal(
        result.regionalRuleId,
        "DE-CH410-002",
      );
    }
  },
);

test(
  "Swiss schliess reuses existing SCHLIEß Kurzschrift mapping",
  () => {
    const result =
      applyGermanRegionalOverlay(
        "schliess",
        "kurzschrift",
        "swiss",
        "⠎⠉⠓⠇⠊⠑⠎⠎",
      );

    assert.equal(result.ok, true);

    if (result.ok) {
      assert.equal(
        result.unicodeBraille,
        "⠱⠮",
      );

      assert.equal(
        result.overlayApplied,
        true,
      );

      assert.equal(
        result.regionalRuleId,
        "DE-CH410-002",
      );
    }
  },
);

test(
  "Swiss double-s extension does not activate in Basis or Voll",
  () => {
    for (
      const mode
      of [
        "basisschrift",
        "vollschrift",
      ]
    ) {
      const base = "⠛⠗⠕⠎⠎";

      const result =
        applyGermanRegionalOverlay(
          "gross",
          mode,
          "swiss",
          base,
        );

      assert.equal(result.ok, true);

      if (result.ok) {
        assert.equal(
          result.unicodeBraille,
          base,
        );

        assert.equal(
          result.overlayApplied,
          false,
        );
      }
    }
  },
);

test(
  "Swiss overlay is identity for unrelated Kurzschrift input",
  () => {
    const result =
      applyGermanRegionalOverlay(
        "haus",
        "kurzschrift",
        "swiss",
        "⠓⠁⠥⠎",
      );

    assert.equal(result.ok, true);

    if (result.ok) {
      assert.equal(
        result.unicodeBraille,
        "⠓⠁⠥⠎",
      );

      assert.equal(
        result.overlayApplied,
        false,
      );
    }
  },
);
