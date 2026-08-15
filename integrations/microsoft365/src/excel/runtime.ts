import type {
  ExcelSelectionSnapshot,
} from "./types.js";

export type ExcelRuntimeMutationOutcome =
  | "written"
  | "selection-changed";

export interface ExcelRuntimePort {
  isReady(): boolean;
  isExcelHost(): boolean;
  supportsExcelApi11(): boolean;

  readSelectionSnapshot():
    Promise<ExcelSelectionSnapshot>;

  replaceSelectedCell(
    expected:
      ExcelSelectionSnapshot,
    replacementText:
      string,
  ): Promise<ExcelRuntimeMutationOutcome>;
}

interface OfficeRequirementsPort {
  isSetSupported(
    name: string,
    version: string,
  ): boolean;
}

interface OfficeContextPort {
  readonly host:
    unknown;
  readonly requirements:
    OfficeRequirementsPort;
}

interface OfficeGlobalPort {
  readonly context:
    OfficeContextPort;
  readonly HostType?: {
    readonly Excel?:
      unknown;
  };
}

interface ExcelRangePort {
  address:
    string;
  rowCount:
    number;
  columnCount:
    number;
  values:
    unknown[][];
  formulas:
    unknown[][];
  valueTypes:
    unknown[][];

  load(
    properties:
      string | string[],
  ): void;
}

interface ExcelWorkbookPort {
  getSelectedRange():
    ExcelRangePort;
}

interface ExcelRequestContextPort {
  readonly workbook:
    ExcelWorkbookPort;

  sync():
    Promise<void>;
}

interface ExcelGlobalPort {
  run<T>(
    callback: (
      context:
        ExcelRequestContextPort,
    ) => Promise<T>,
  ): Promise<T>;
}

export interface OfficeExcelGlobals {
  readonly Office?:
    OfficeGlobalPort;
  readonly Excel?:
    ExcelGlobalPort;
}

function excelHostValue(
  office:
    OfficeGlobalPort,
): unknown {
  return (
    office.HostType?.Excel ??
    "Excel"
  );
}

function singleValue(
  values:
    unknown[][],
): unknown {
  return values[0]?.[0];
}

function snapshotFromRange(
  range:
    ExcelRangePort,
): ExcelSelectionSnapshot {
  return Object.freeze({
    address:
      range.address,
    rowCount:
      range.rowCount,
    columnCount:
      range.columnCount,
    valueType:
      String(
        singleValue(
          range.valueTypes,
        ) ??
        "Unknown",
      ),
    rawValue:
      singleValue(
        range.values,
      ),
    formulaProjection:
      singleValue(
        range.formulas,
      ),
  });
}

function sameSnapshot(
  left:
    ExcelSelectionSnapshot,
  right:
    ExcelSelectionSnapshot,
): boolean {
  return (
    left.address ===
      right.address &&
    left.rowCount ===
      right.rowCount &&
    left.columnCount ===
      right.columnCount &&
    left.valueType ===
      right.valueType &&
    Object.is(
      left.rawValue,
      right.rawValue,
    ) &&
    Object.is(
      left.formulaProjection,
      right.formulaProjection,
    )
  );
}

function loadSnapshot(
  range:
    ExcelRangePort,
): void {
  range.load([
    "address",
    "rowCount",
    "columnCount",
    "values",
    "formulas",
    "valueTypes",
  ]);
}

export function createOfficeExcelRuntime(
  globals:
    OfficeExcelGlobals,
): ExcelRuntimePort {
  function office():
    OfficeGlobalPort | undefined {
    return globals.Office;
  }

  function excel():
    ExcelGlobalPort | undefined {
    return globals.Excel;
  }

  return Object.freeze({
    isReady() {
      return Boolean(
        office() &&
        excel(),
      );
    },

    isExcelHost() {
      const currentOffice =
        office();

      if (!currentOffice) {
        return false;
      }

      return (
        currentOffice.context.host ===
        excelHostValue(
          currentOffice,
        )
      );
    },

    supportsExcelApi11() {
      const currentOffice =
        office();

      if (!currentOffice) {
        return false;
      }

      return currentOffice
        .context
        .requirements
        .isSetSupported(
          "ExcelApi",
          "1.1",
        );
    },

    async readSelectionSnapshot() {
      const currentExcel =
        excel();

      if (!currentExcel) {
        throw new Error(
          "Excel runtime unavailable.",
        );
      }

      return currentExcel.run(
        async (context) => {
          const range =
            context.workbook
              .getSelectedRange();

          loadSnapshot(
            range,
          );
          await context.sync();

          return snapshotFromRange(
            range,
          );
        },
      );
    },

    async replaceSelectedCell(
      expected:
        ExcelSelectionSnapshot,
      replacementText:
        string,
    ) {
      const currentExcel =
        excel();

      if (!currentExcel) {
        throw new Error(
          "Excel runtime unavailable.",
        );
      }

      return currentExcel.run(
        async (context) => {
          const range =
            context.workbook
              .getSelectedRange();

          loadSnapshot(
            range,
          );
          await context.sync();

          const current =
            snapshotFromRange(
              range,
            );

          if (
            !sameSnapshot(
              current,
              expected,
            )
          ) {
            return "selection-changed";
          }

          range.values = [[
            replacementText,
          ]];

          await context.sync();

          return "written";
        },
      );
    },
  });
}

export function createGlobalOfficeExcelRuntime():
  ExcelRuntimePort {
  return createOfficeExcelRuntime(
    globalThis as unknown as
      OfficeExcelGlobals,
  );
}
