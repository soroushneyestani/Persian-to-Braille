import assert from "node:assert/strict";
import test from "node:test";

import {
  createEngineTokenProducer,
  createEngineTokenProducerForSpecification,
  createForwardTranslator,
  createForwardTranslatorForSpecification,
  createModeRuleExecutor,
  createModeRuleExecutorForSpecification,
  createRuleSelector,
  createRuleSelectorForSpecification,
  createUnicodePreprocessor,
  createUnicodePreprocessorForSpecification,
  getBundledSpecification,
} from "../dist/index.js";

test(
  "explicit specification factories preserve the bundled Persian execution boundary",
  () => {
    const specification =
      getBundledSpecification();

    const defaultPreprocessor =
      createUnicodePreprocessor();

    const injectedPreprocessor =
      createUnicodePreprocessorForSpecification(
        specification,
      );

    assert.deepEqual(
      injectedPreprocessor.normalize(""),
      defaultPreprocessor.normalize(""),
    );

    assert.equal(
      typeof createRuleSelector().select,
      "function",
    );

    assert.equal(
      typeof createRuleSelectorForSpecification(
        specification,
      ).select,
      "function",
    );

    assert.equal(
      typeof createModeRuleExecutor().execute,
      "function",
    );

    assert.equal(
      typeof createModeRuleExecutorForSpecification(
        specification,
      ).execute,
      "function",
    );

    assert.deepEqual(
      createEngineTokenProducerForSpecification(
        specification,
      ).produce({
        text: "",
        normalizationAnnotations: [],
      }),
      createEngineTokenProducer().produce({
        text: "",
        normalizationAnnotations: [],
      }),
    );
  },
);

test(
  "default and explicit forward factories are behaviorally identical for the bundled specification",
  () => {
    const specification =
      getBundledSpecification();

    const defaultTranslator =
      createForwardTranslator();

    const injectedTranslator =
      createForwardTranslatorForSpecification(
        specification,
      );

    const representativeTexts =
      specification.rules
        .filter((rule) => {
          const input =
            rule["input"];

          return (
            input !== null
            && typeof input === "object"
            && !Array.isArray(input)
            && typeof input["text"] === "string"
          );
        })
        .slice(0, 16)
        .map(
          (rule) =>
            rule["input"]["text"],
        );

    const corpus = [
      "",
      ...new Set(
        representativeTexts,
      ),
    ];

    for (const input of corpus) {
      assert.deepEqual(
        injectedTranslator.translate(
          input,
        ),
        defaultTranslator.translate(
          input,
        ),
        `Execution mismatch for ${JSON.stringify(input)}`,
      );
    }
  },
);

test(
  "forward specification injection is not silently replaced by the bundled singleton",
  () => {
    const bundled =
      getBundledSpecification();

    const injected = {
      ...bundled,
      profile: {
        ...bundled.profile,
        direction:
          "phase-15.5a2-injected-direction",
      },
    };

    const result =
      createForwardTranslatorForSpecification(
        injected,
      ).translate("");

    assert.equal(
      result.ok,
      true,
    );

    if (!result.ok) {
      assert.fail(
        "Expected empty input to remain translatable.",
      );
    }

    assert.equal(
      result.profile.direction,
      "phase-15.5a2-injected-direction",
    );
  },
);
