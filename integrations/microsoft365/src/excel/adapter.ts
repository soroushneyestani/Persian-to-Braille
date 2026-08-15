import {
  EXCEL_HOST_FAILURE_CODES,
} from "./types.js";

import type {
  ExcelHostFailure,
  ExcelMutationResult,
  ExcelSelectionReadResult,
  ExcelSelectionSnapshot,
  PersianBrailleExcelHostAdapter,
} from "./types.js";

import type {
  ExcelRuntimePort,
} from "./runtime.js";

function failure(
  code:
    ExcelHostFailure["code"],
  message:
    string,
): ExcelHostFailure {
  return Object.freeze({
    ok: false,
    domain: "host",
    code,
    message,
  });
}

function preflight(
  runtime:
    ExcelRuntimePort,
): ExcelHostFailure | null {
  if (!runtime.isReady()) {
    return failure(
      EXCEL_HOST_FAILURE_CODES
        .officeNotReady,
      "Office.js and the Excel runtime must be ready before workbook access.",
    );
  }

  if (!runtime.isExcelHost()) {
    return failure(
      EXCEL_HOST_FAILURE_CODES
        .wrongHost,
      "This adapter requires Microsoft Excel.",
    );
  }

  if (
    !runtime
      .supportsExcelApi11()
  ) {
    return failure(
      EXCEL_HOST_FAILURE_CODES
        .unsupportedRequirementSet,
      "ExcelApi 1.1 is required for the Phase 10 Excel add-in.",
    );
  }

  return null;
}

function validateSnapshot(
  snapshot:
    ExcelSelectionSnapshot,
): ExcelHostFailure | null {
  if (
    snapshot.rowCount !==
      1 ||
    snapshot.columnCount !==
      1
  ) {
    return failure(
      EXCEL_HOST_FAILURE_CODES
        .selectionShapeUnsupported,
      "Phase 10 Excel translation requires exactly one selected cell.",
    );
  }

  if (
    snapshot.valueType !==
      "String" ||
    typeof snapshot.rawValue !==
      "string"
  ) {
    return failure(
      EXCEL_HOST_FAILURE_CODES
        .selectionContentUnsupported,
      "Phase 10 Excel translation accepts plain-text cells only.",
    );
  }

  if (
    typeof snapshot
      .formulaProjection ===
        "string" &&
    snapshot
      .formulaProjection
      .startsWith("=")
  ) {
    return failure(
      EXCEL_HOST_FAILURE_CODES
        .selectionContentUnsupported,
      "Formula cells are not translation targets in the Phase 10 Excel MVP.",
    );
  }

  return null;
}

export function createExcelHostAdapter(
  runtime:
    ExcelRuntimePort,
): PersianBrailleExcelHostAdapter {
  return Object.freeze({
    async readSelection():
      Promise<ExcelSelectionReadResult> {
      const blocked =
        preflight(runtime);

      if (blocked) {
        return blocked;
      }

      try {
        const snapshot =
          await runtime
            .readSelectionSnapshot();

        const invalid =
          validateSnapshot(
            snapshot,
          );

        if (invalid) {
          return invalid;
        }

        return Object.freeze({
          ok: true,
          text:
            snapshot.rawValue as string,
          snapshot,
        });
      } catch {
        return failure(
          EXCEL_HOST_FAILURE_CODES
            .selectionUnavailable,
          "Excel could not read the current cell selection.",
        );
      }
    },

    async replaceSelection(
      expected:
        ExcelSelectionSnapshot,
      replacementText:
        string,
    ): Promise<ExcelMutationResult> {
      const blocked =
        preflight(runtime);

      if (blocked) {
        return blocked;
      }

      try {
        const outcome =
          await runtime
            .replaceSelectedCell(
              expected,
              replacementText,
            );

        if (
          outcome ===
          "selection-changed"
        ) {
          return failure(
            EXCEL_HOST_FAILURE_CODES
              .selectionChanged,
            "The current Excel cell no longer matches the cell used to create the Braille preview.",
          );
        }

        return Object.freeze({
          ok: true,
        });
      } catch {
        return failure(
          EXCEL_HOST_FAILURE_CODES
            .workbookWriteFailed,
          "Excel could not replace the current cell value.",
        );
      }
    },
  });
}
