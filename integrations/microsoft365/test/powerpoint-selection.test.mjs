import assert from "node:assert/strict";
import test from "node:test";

import {
  createPersianBrailleTranslator,
} from "@persian-braille/sdk";

import {
  createGlobalOfficePowerPointRuntime,
  createOfficePowerPointRuntime,
  createPowerPointHostAdapter,
  createPowerPointSelectionService,
} from "../dist/index.js";

const baseSnapshot =
  Object.freeze({
    slideId:
      "slide-1",
    shapeId:
      "shape-7",
    start:
      3,
    length:
      4,
    text:
      "سلام",
  });

function runtime(
  overrides = {},
) {
  return {
    isReady: () => true,
    isPowerPointHost:
      () => true,
    supportsPowerPointApi15:
      () => true,
    async readSelectionSnapshot() {
      return baseSnapshot;
    },
    async replaceSelectedText() {
      return "written";
    },
    ...overrides,
  };
}

test(
  "PowerPoint host adapter preserves selected text and five-field snapshot",
  async () => {
    const result =
      await createPowerPointHostAdapter(
        runtime(),
      ).readSelection();

    assert.equal(
      result.ok,
      true,
    );
    assert.equal(
      result.text,
      "سلام",
    );
    assert.deepEqual(
      result.snapshot,
      baseSnapshot,
    );
  },
);

test(
  "PowerPoint adapter rejects access before Office readiness",
  async () => {
    const result =
      await createPowerPointHostAdapter(
        runtime({
          isReady:
            () => false,
        }),
      ).readSelection();

    assert.equal(
      result.ok,
      false,
    );
    assert.equal(
      result.code,
      "OFFICE_NOT_READY",
    );
  },
);

test(
  "PowerPoint adapter rejects non-PowerPoint Office hosts",
  async () => {
    const result =
      await createPowerPointHostAdapter(
        runtime({
          isPowerPointHost:
            () => false,
        }),
      ).readSelection();

    assert.equal(
      result.ok,
      false,
    );
    assert.equal(
      result.code,
      "WRONG_HOST",
    );
  },
);

test(
  "PowerPoint adapter enforces PowerPointApi 1.5",
  async () => {
    const result =
      await createPowerPointHostAdapter(
        runtime({
          supportsPowerPointApi15:
            () => false,
        }),
      ).readSelection();

    assert.equal(
      result.ok,
      false,
    );
    assert.equal(
      result.code,
      "UNSUPPORTED_REQUIREMENT_SET",
    );
  },
);

test(
  "PowerPoint adapter reports no selected text as SELECTION_UNAVAILABLE",
  async () => {
    const result =
      await createPowerPointHostAdapter(
        runtime({
          async readSelectionSnapshot() {
            return null;
          },
        }),
      ).readSelection();

    assert.equal(
      result.ok,
      false,
    );
    assert.equal(
      result.code,
      "SELECTION_UNAVAILABLE",
    );
  },
);

test(
  "PowerPoint selection service translates through the public SDK",
  async () => {
    const translator =
      createPersianBrailleTranslator();

    const service =
      createPowerPointSelectionService(
        createPowerPointHostAdapter(
          runtime(),
        ),
        translator,
      );

    const direct =
      translator.translate(
        baseSnapshot.text,
      );

    const result =
      await service
        .translateSelection();

    assert.equal(
      result.ok,
      direct.ok,
    );

    if (
      result.ok &&
      direct.ok
    ) {
      assert.deepEqual(
        result.translation,
        direct,
      );
      assert.deepEqual(
        result.mutationContext,
        baseSnapshot,
      );
    }
  },
);

test(
  "empty PowerPoint selected text is an application failure",
  async () => {
    const empty =
      Object.freeze({
        ...baseSnapshot,
        length: 0,
        text: "",
      });

    const result =
      await createPowerPointSelectionService(
        createPowerPointHostAdapter(
          runtime({
            async readSelectionSnapshot() {
              return empty;
            },
          }),
        ),
      ).translateSelection();

    assert.equal(
      result.ok,
      false,
    );
    assert.equal(
      result.source,
      "application",
    );
    assert.equal(
      result.code,
      "EMPTY_SELECTION",
    );
  },
);

test(
  "PowerPoint SDK failures remain translation-domain results",
  async () => {
    const service =
      createPowerPointSelectionService(
        createPowerPointHostAdapter(
          runtime({
            async readSelectionSnapshot() {
              return Object.freeze({
                ...baseSnapshot,
                text:
                  "\u0000",
                length: 1,
              });
            },
          }),
        ),
      );

    const result =
      await service
        .translateSelection();

    assert.equal(
      result.ok,
      false,
    );
    assert.equal(
      result.source,
      "translation",
    );
  },
);

test(
  "PowerPoint replace writes the exact successful SDK Unicode Braille result",
  async () => {
    let observedExpected =
      null;
    let observedReplacement =
      null;

    const service =
      createPowerPointSelectionService(
        createPowerPointHostAdapter(
          runtime({
            async replaceSelectedText(
              expected,
              replacement,
            ) {
              observedExpected =
                expected;
              observedReplacement =
                replacement;
              return "written";
            },
          }),
        ),
      );

    const preview =
      await service
        .translateSelection();

    assert.equal(
      preview.ok,
      true,
    );

    const mutation =
      await service
        .replaceWithBraille(
          preview,
        );

    assert.equal(
      mutation.ok,
      true,
    );
    assert.deepEqual(
      observedExpected,
      baseSnapshot,
    );
    assert.equal(
      observedReplacement,
      preview.translation
        .unicodeBraille,
    );
  },
);

test(
  "PowerPoint selection change blocks stale preview mutation",
  async () => {
    const service =
      createPowerPointSelectionService(
        createPowerPointHostAdapter(
          runtime({
            async replaceSelectedText() {
              return "selection-changed";
            },
          }),
        ),
      );

    const preview =
      await service
        .translateSelection();

    assert.equal(
      preview.ok,
      true,
    );

    const mutation =
      await service
        .replaceWithBraille(
          preview,
        );

    assert.equal(
      mutation.ok,
      false,
    );
    assert.equal(
      mutation.code,
      "SELECTION_CHANGED",
    );
  },
);

test(
  "PowerPoint presentation write exceptions map to PRESENTATION_WRITE_FAILED",
  async () => {
    const service =
      createPowerPointSelectionService(
        createPowerPointHostAdapter(
          runtime({
            async replaceSelectedText() {
              throw new Error(
                "write failed",
              );
            },
          }),
        ),
      );

    const preview =
      await service
        .translateSelection();

    assert.equal(
      preview.ok,
      true,
    );

    const mutation =
      await service
        .replaceWithBraille(
          preview,
        );

    assert.equal(
      mutation.ok,
      false,
    );
    assert.equal(
      mutation.code,
      "PRESENTATION_WRITE_FAILED",
    );
  },
);

test(
  "global PowerPoint runtime reports not ready outside an Office host",
  () => {
    const runtime =
      createGlobalOfficePowerPointRuntime();

    assert.equal(
      runtime.isReady(),
      false,
    );
  },
);

test(
  "Office PowerPoint runtime uses PowerPoint.run and exact five-field stale guard",
  async () => {
    let runCount = 0;
    let syncCount = 0;

    const loadedRange = [];
    const loadedShape = [];
    const loadedSlide = [];

    const range = {
      isNullObject:
        false,
      start: 3,
      length: 4,
      text: "سلام",
      load(properties) {
        if (
          Array.isArray(
            properties,
          )
        ) {
          loadedRange.push(
            ...properties,
          );
        } else {
          loadedRange.push(
            properties,
          );
        }
      },
      getParentTextFrame() {
        return textFrame;
      },
    };

    const slide = {
      id: "slide-1",
      load(properties) {
        loadedSlide.push(
          properties,
        );
      },
    };

    const shape = {
      id: "shape-7",
      load(properties) {
        loadedShape.push(
          properties,
        );
      },
      getParentSlide() {
        return slide;
      },
    };

    const textFrame = {
      getParentShape() {
        return shape;
      },
    };

    const context = {
      presentation: {
        getSelectedTextRangeOrNullObject() {
          return range;
        },
      },
      async sync() {
        syncCount += 1;
      },
    };

    const powerPoint = {
      async run(callback) {
        runCount += 1;
        return callback(
          context,
        );
      },
    };

    const runtime =
      createOfficePowerPointRuntime({
        Office: {
          HostType: {
            PowerPoint:
              "PowerPoint",
          },
          context: {
            host:
              "PowerPoint",
            requirements: {
              isSetSupported(
                name,
                version,
              ) {
                return (
                  name ===
                    "PowerPointApi" &&
                  version ===
                    "1.5"
                );
              },
            },
          },
        },
        PowerPoint:
          powerPoint,
      });

    assert.equal(
      runtime.isReady(),
      true,
    );
    assert.equal(
      runtime.isPowerPointHost(),
      true,
    );
    assert.equal(
      runtime.supportsPowerPointApi15(),
      true,
    );

    const snapshot =
      await runtime
        .readSelectionSnapshot();

    assert.deepEqual(
      snapshot,
      baseSnapshot,
    );

    const written =
      await runtime
        .replaceSelectedText(
          baseSnapshot,
          "BRAILLE",
        );

    assert.equal(
      written,
      "written",
    );
    assert.equal(
      range.text,
      "BRAILLE",
    );

    range.text =
      "changed";

    const stale =
      await runtime
        .replaceSelectedText(
          baseSnapshot,
          "SHOULD-NOT-WRITE",
        );

    assert.equal(
      stale,
      "selection-changed",
    );
    assert.equal(
      range.text,
      "changed",
    );

    assert.equal(
      runCount,
      3,
    );
    assert.equal(
      syncCount,
      7,
    );

    for (
      const property of
      [
        "isNullObject",
        "start",
        "length",
        "text",
      ]
    ) {
      assert.ok(
        loadedRange.includes(
          property,
        ),
      );
    }

    assert.ok(
      loadedShape.includes(
        "id",
      ),
    );
    assert.ok(
      loadedSlide.includes(
        "id",
      ),
    );
  },
);
