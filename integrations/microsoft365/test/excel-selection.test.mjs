import assert from "node:assert/strict";
import test from "node:test";

import {
  createPersianBrailleTranslator,
} from "@persian-braille/sdk";

import {
  EXCEL_HOST_FAILURE_CODES,
  createExcelHostAdapter,
  createExcelSelectionService,
  createOfficeExcelRuntime,
} from "../dist/index.js";

function snapshot(
  overrides = {},
) {
  return Object.freeze({
    address: "Sheet1!A1",
    rowCount: 1,
    columnCount: 1,
    valueType: "String",
    rawValue: "سلام",
    formulaProjection: "سلام",
    ...overrides,
  });
}

function runtime(
  overrides = {},
) {
  return {
    isReady: () => true,
    isExcelHost: () => true,
    supportsExcelApi11: () => true,
    readSelectionSnapshot: async () =>
      snapshot(),
    replaceSelectedCell: async () =>
      "written",
    ...overrides,
  };
}

test(
  "Excel host adapter preserves one plain-text cell verbatim",
  async () => {
    const host =
      createExcelHostAdapter(
        runtime(),
      );

    assert.deepEqual(
      await host.readSelection(),
      {
        ok: true,
        text: "سلام",
        snapshot: snapshot(),
      },
    );
  },
);

test(
  "Excel adapter rejects access before Office readiness",
  async () => {
    const host =
      createExcelHostAdapter(
        runtime({
          isReady: () => false,
        }),
      );

    const result =
      await host.readSelection();

    assert.equal(result.ok, false);
    assert.equal(
      result.code,
      EXCEL_HOST_FAILURE_CODES
        .officeNotReady,
    );
  },
);

test(
  "Excel adapter rejects non-Excel Office hosts",
  async () => {
    const host =
      createExcelHostAdapter(
        runtime({
          isExcelHost: () => false,
        }),
      );

    const result =
      await host.readSelection();

    assert.equal(result.ok, false);
    assert.equal(
      result.code,
      EXCEL_HOST_FAILURE_CODES
        .wrongHost,
    );
  },
);

test(
  "Excel adapter enforces ExcelApi 1.1",
  async () => {
    const host =
      createExcelHostAdapter(
        runtime({
          supportsExcelApi11:
            () => false,
        }),
      );

    const result =
      await host.readSelection();

    assert.equal(result.ok, false);
    assert.equal(
      result.code,
      EXCEL_HOST_FAILURE_CODES
        .unsupportedRequirementSet,
    );
  },
);

test(
  "Excel adapter rejects multi-cell selections",
  async () => {
    const host =
      createExcelHostAdapter(
        runtime({
          readSelectionSnapshot:
            async () =>
              snapshot({
                columnCount: 2,
              }),
        }),
      );

    const result =
      await host.readSelection();

    assert.equal(result.ok, false);
    assert.equal(
      result.code,
      EXCEL_HOST_FAILURE_CODES
        .selectionShapeUnsupported,
    );
  },
);

test(
  "Excel adapter rejects non-string cells",
  async () => {
    const host =
      createExcelHostAdapter(
        runtime({
          readSelectionSnapshot:
            async () =>
              snapshot({
                valueType:
                  "Double",
                rawValue:
                  42,
                formulaProjection:
                  42,
              }),
        }),
      );

    const result =
      await host.readSelection();

    assert.equal(result.ok, false);
    assert.equal(
      result.code,
      EXCEL_HOST_FAILURE_CODES
        .selectionContentUnsupported,
    );
  },
);

test(
  "Excel adapter rejects formula cells even when their result is text",
  async () => {
    const host =
      createExcelHostAdapter(
        runtime({
          readSelectionSnapshot:
            async () =>
              snapshot({
                rawValue:
                  "سلام",
                formulaProjection:
                  '="سلام"',
              }),
        }),
      );

    const result =
      await host.readSelection();

    assert.equal(result.ok, false);
    assert.equal(
      result.code,
      EXCEL_HOST_FAILURE_CODES
        .selectionContentUnsupported,
    );
  },
);

test(
  "Excel selection service translates through the public SDK",
  async () => {
    const translator =
      createPersianBrailleTranslator();

    const service =
      createExcelSelectionService(
        createExcelHostAdapter(
          runtime(),
        ),
        translator,
      );

    const expected =
      translator.translate(
        "سلام",
      );

    const result =
      await service
        .translateSelection();

    assert.equal(result.ok, true);

    if (
      !result.ok ||
      !expected.ok
    ) {
      assert.fail(
        "Expected successful Persian translation.",
      );
    }

    assert.equal(
      result.sourceText,
      "سلام",
    );
    assert.equal(
      result.translation
        .unicodeBraille,
      expected.unicodeBraille,
    );
    assert.deepEqual(
      result.mutationContext,
      snapshot(),
    );
  },
);

test(
  "empty Excel text cell is an application failure",
  async () => {
    const service =
      createExcelSelectionService(
        createExcelHostAdapter(
          runtime({
            readSelectionSnapshot:
              async () =>
                snapshot({
                  rawValue: "",
                  formulaProjection:
                    "",
                }),
          }),
        ),
      );

    const result =
      await service
        .translateSelection();

    assert.equal(result.ok, false);
    assert.equal(
      result.source,
      "application",
    );

    if (
      result.source !==
      "application"
    ) {
      assert.fail(
        "Expected application failure.",
      );
    }

    assert.equal(
      result.code,
      "EMPTY_SELECTION",
    );
  },
);

test(
  "Excel SDK failures remain translation-domain results",
  async () => {
    const service =
      createExcelSelectionService(
        createExcelHostAdapter(
          runtime({
            readSelectionSnapshot:
              async () =>
                snapshot({
                  rawValue: "😀",
                  formulaProjection:
                    "😀",
                }),
          }),
        ),
      );

    const result =
      await service
        .translateSelection();

    assert.equal(result.ok, false);
    assert.equal(
      result.source,
      "translation",
    );
  },
);

test(
  "Excel replace writes the exact successful SDK Unicode Braille result",
  async () => {
    const calls = [];

    const host =
      createExcelHostAdapter(
        runtime({
          replaceSelectedCell:
            async (
              expected,
              replacement,
            ) => {
              calls.push({
                expected,
                replacement,
              });

              return "written";
            },
        }),
      );

    const service =
      createExcelSelectionService(
        host,
      );

    const preview =
      await service
        .translateSelection();

    assert.equal(preview.ok, true);

    if (!preview.ok) {
      assert.fail(
        "Expected successful preview.",
      );
    }

    const result =
      await service
        .replaceWithBraille(
          preview,
        );

    assert.deepEqual(
      result,
      { ok: true },
    );
    assert.equal(
      calls.length,
      1,
    );
    assert.deepEqual(
      calls[0].expected,
      snapshot(),
    );
    assert.equal(
      calls[0].replacement,
      preview.translation
        .unicodeBraille,
    );
  },
);

test(
  "Excel selection change blocks stale preview mutation",
  async () => {
    const host =
      createExcelHostAdapter(
        runtime({
          replaceSelectedCell:
            async () =>
              "selection-changed",
        }),
      );

    const result =
      await host
        .replaceSelection(
          snapshot(),
          "⠎",
        );

    assert.equal(result.ok, false);
    assert.equal(
      result.code,
      EXCEL_HOST_FAILURE_CODES
        .selectionChanged,
    );
  },
);

test(
  "Excel workbook write exceptions map to WORKBOOK_WRITE_FAILED",
  async () => {
    const host =
      createExcelHostAdapter(
        runtime({
          replaceSelectedCell:
            async () => {
              throw new Error(
                "write failed",
              );
            },
        }),
      );

    const result =
      await host
        .replaceSelection(
          snapshot(),
          "⠎",
        );

    assert.equal(result.ok, false);
    assert.equal(
      result.code,
      EXCEL_HOST_FAILURE_CODES
        .workbookWriteFailed,
    );
  },
);

test(
  "global Excel runtime reports not ready outside an Office host",
  () => {
    const runtime =
      createOfficeExcelRuntime(
        {},
      );

    assert.equal(
      runtime.isReady(),
      false,
    );
    assert.equal(
      runtime.isExcelHost(),
      false,
    );
    assert.equal(
      runtime
        .supportsExcelApi11(),
      false,
    );
  },
);

test(
  "Office Excel runtime uses Excel.run and exact snapshot stale guard",
  async () => {
    const range = {
      address: "Sheet1!A1",
      rowCount: 1,
      columnCount: 1,
      values: [["سلام"]],
      formulas: [["سلام"]],
      valueTypes: [["String"]],
      loaded: [],
      load(properties) {
        this.loaded.push(
          ...(
            Array.isArray(
              properties,
            )
              ? properties
              : [properties]
          ),
        );
      },
    };

    let syncCount = 0;
    let runCount = 0;

    const runtime =
      createOfficeExcelRuntime({
        Office: {
          context: {
            host: "Excel",
            requirements: {
              isSetSupported(
                name,
                version,
              ) {
                return (
                  name ===
                    "ExcelApi" &&
                  version ===
                    "1.1"
                );
              },
            },
          },
          HostType: {
            Excel: "Excel",
          },
        },
        Excel: {
          async run(callback) {
            runCount += 1;

            return callback({
              workbook: {
                getSelectedRange() {
                  return range;
                },
              },
              async sync() {
                syncCount += 1;
              },
            });
          },
        },
      });

    assert.equal(
      runtime.isReady(),
      true,
    );
    assert.equal(
      runtime.isExcelHost(),
      true,
    );
    assert.equal(
      runtime
        .supportsExcelApi11(),
      true,
    );

    const current =
      await runtime
        .readSelectionSnapshot();

    assert.deepEqual(
      current,
      snapshot(),
    );

    assert.equal(
      await runtime
        .replaceSelectedCell(
          current,
          "⠎⠇⠁⠍",
        ),
      "written",
    );

    assert.deepEqual(
      range.values,
      [["⠎⠇⠁⠍"]],
    );

    range.values = [[
      "changed",
    ]];

    assert.equal(
      await runtime
        .replaceSelectedCell(
          current,
          "ignored",
        ),
      "selection-changed",
    );

    assert.equal(
      runCount,
      3,
    );
    assert.equal(
      syncCount,
      4,
    );

    for (const property of [
      "address",
      "rowCount",
      "columnCount",
      "values",
      "formulas",
      "valueTypes",
    ]) {
      assert.ok(
        range.loaded.includes(
          property,
        ),
      );
    }
  },
);
