import {
  WORD_HOST_FAILURE_CODES,
} from "../word/types.js";

import type {
  WordHostFailure,
} from "../word/types.js";

import type {
  WordRuntimePort,
} from "../word/runtime.js";

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

function failure(
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
    return failure(
      WORD_HOST_FAILURE_CODES
        .officeNotReady,
      "This page is not running inside a Microsoft Office host.",
    );
  }

  if (
    !runtime
      .isWordHost()
  ) {
    return failure(
      WORD_HOST_FAILURE_CODES
        .wrongHost,
      "Phase 9 supports Microsoft Word only.",
    );
  }

  if (
    !runtime
      .isReady()
  ) {
    return failure(
      WORD_HOST_FAILURE_CODES
        .officeNotReady,
      "Office.js and the Word runtime must be ready before document access.",
    );
  }

  if (
    !runtime
      .supportsWordApi11()
  ) {
    return failure(
      WORD_HOST_FAILURE_CODES
        .unsupportedRequirementSet,
      "WordApi 1.1 is required for the Phase 9 Word add-in.",
    );
  }

  return Object.freeze({
    ok: true,
  });
}
