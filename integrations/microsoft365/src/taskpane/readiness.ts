import {
  WORD_HOST_FAILURE_CODES,
} from "../word/types.js";

import type {
  OfficeHostCapabilities,
  OfficeHostFailure,
} from "../shared/types.js";

import type {
  ExcelRuntimePort,
} from "../excel/runtime.js";

import type {
  WordHostFailure,
} from "../word/types.js";

import type {
  WordRuntimePort,
} from "../word/runtime.js";

import {
  EXCEL_TASK_PANE_CAPABILITIES,
  WORD_TASK_PANE_CAPABILITIES,
} from "./host-config.js";

export interface OfficeReadyInfoPort {
  readonly host?:
    unknown;
  readonly platform?:
    unknown;
}

export type WordTaskPaneReadinessResult =
  | {
      readonly ok: true;
    }
  | WordHostFailure;

export type OfficeTaskPaneReadinessResult =
  | {
      readonly ok: true;
      readonly hostKind:
        "word" |
        "excel";
      readonly capabilities:
        OfficeHostCapabilities;
    }
  | OfficeHostFailure;

function wordFailure(
  code:
    WordHostFailure["code"],
  message:
    string,
): WordHostFailure {
  return Object.freeze({
    ok: false,
    domain: "host",
    code,
    message,
  });
}

function officeFailure(
  code: string,
  message:
    string,
): OfficeHostFailure {
  return Object.freeze({
    ok: false,
    domain: "host",
    code,
    message,
  });
}

export function evaluateWordTaskPaneReadiness(
  info:
    OfficeReadyInfoPort |
    undefined,
  runtime:
    WordRuntimePort,
): WordTaskPaneReadinessResult {
  if (
    !info ||
    info.host ===
      null ||
    info.host ===
      undefined
  ) {
    return wordFailure(
      WORD_HOST_FAILURE_CODES
        .officeNotReady,
      "This page is not running inside a Microsoft Office host.",
    );
  }

  if (
    !runtime
      .isWordHost()
  ) {
    return wordFailure(
      WORD_HOST_FAILURE_CODES
        .wrongHost,
      "Phase 9 supports Microsoft Word only.",
    );
  }

  if (
    !runtime
      .isReady()
  ) {
    return wordFailure(
      WORD_HOST_FAILURE_CODES
        .officeNotReady,
      "Office.js and the Word runtime must be ready before document access.",
    );
  }

  if (
    !runtime
      .supportsWordApi11()
  ) {
    return wordFailure(
      WORD_HOST_FAILURE_CODES
        .unsupportedRequirementSet,
      "WordApi 1.1 is required for the Phase 9 Word add-in.",
    );
  }

  return Object.freeze({
    ok: true,
  });
}

export function evaluateOfficeTaskPaneReadiness(
  info:
    OfficeReadyInfoPort |
    undefined,
  wordRuntime:
    WordRuntimePort,
  excelRuntime:
    ExcelRuntimePort,
): OfficeTaskPaneReadinessResult {
  if (
    !info ||
    info.host ===
      null ||
    info.host ===
      undefined
  ) {
    return officeFailure(
      "OFFICE_NOT_READY",
      "This page is not running inside a Microsoft Office host.",
    );
  }

  if (
    wordRuntime
      .isWordHost()
  ) {
    if (
      !wordRuntime
        .isReady()
    ) {
      return officeFailure(
        "OFFICE_NOT_READY",
        "Office.js and the Word runtime must be ready before document access.",
      );
    }

    if (
      !wordRuntime
        .supportsWordApi11()
    ) {
      return officeFailure(
        "UNSUPPORTED_REQUIREMENT_SET",
        "WordApi 1.1 is required for Word translation.",
      );
    }

    return Object.freeze({
      ok: true,
      hostKind: "word",
      capabilities:
        WORD_TASK_PANE_CAPABILITIES,
    });
  }

  if (
    excelRuntime
      .isExcelHost()
  ) {
    if (
      !excelRuntime
        .isReady()
    ) {
      return officeFailure(
        "OFFICE_NOT_READY",
        "Office.js and the Excel runtime must be ready before workbook access.",
      );
    }

    if (
      !excelRuntime
        .supportsExcelApi11()
    ) {
      return officeFailure(
        "UNSUPPORTED_REQUIREMENT_SET",
        "ExcelApi 1.1 is required for Excel translation.",
      );
    }

    return Object.freeze({
      ok: true,
      hostKind: "excel",
      capabilities:
        EXCEL_TASK_PANE_CAPABILITIES,
    });
  }

  return officeFailure(
    "WRONG_HOST",
    "Phase 10.3 supports Microsoft Word and Excel task-pane translation.",
  );
}
