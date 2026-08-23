import type {
  GermanRegionalOverlay,
} from "./german-regional-configuration.js";

import type {
  GermanTextMode,
} from "./german-text-mode.js";

import {
  getGermanKurzschriftMapping,
} from "./german-kurzschrift-runtime.js";

export const SWISS_EXPLICIT_ESZETT_INPUT_POLICY =
  "REJECT" as const;

export const SWISS_EXPLICIT_ESZETT_FORBIDDEN =
  "SWISS_EXPLICIT_ESZETT_FORBIDDEN" as const;

export interface GermanRegionalOverlaySuccess {
  readonly ok: true;
  readonly input: string;
  readonly mode: GermanTextMode;
  readonly regionalOverlay:
    GermanRegionalOverlay | null;
  readonly unicodeBraille: string;
  readonly overlayApplied: boolean;
  readonly regionalRuleId:
    | "DE-CH410-002"
    | null;
}

export interface GermanRegionalOverlayFailure {
  readonly ok: false;
  readonly input: string;
  readonly mode: GermanTextMode;
  readonly regionalOverlay: "swiss";
  readonly code:
    typeof SWISS_EXPLICIT_ESZETT_FORBIDDEN;
  readonly ruleId: "DE-CH410-001";
  readonly automaticNormalizationApplied: false;
}

export type GermanRegionalOverlayExecutionResult =
  | GermanRegionalOverlaySuccess
  | GermanRegionalOverlayFailure;

const SWISS_KURZSCHRIFT_TARGETS = Object.freeze({
  gross: "GROß",
  schliess: "SCHLIEß",
} as const);

export function applyGermanRegionalOverlay(
  input: string,
  mode: GermanTextMode,
  regionalOverlay: GermanRegionalOverlay | null,
  baseUnicodeBraille: string,
): GermanRegionalOverlayExecutionResult {
  if (regionalOverlay === null) {
    return Object.freeze({
      ok: true,
      input,
      mode,
      regionalOverlay,
      unicodeBraille:
        baseUnicodeBraille,
      overlayApplied: false,
      regionalRuleId: null,
    });
  }

  if (input.includes("ß")) {
    return Object.freeze({
      ok: false,
      input,
      mode,
      regionalOverlay: "swiss",
      code:
        SWISS_EXPLICIT_ESZETT_FORBIDDEN,
      ruleId: "DE-CH410-001",
      automaticNormalizationApplied: false,
    });
  }

  const normalized =
    input
      .normalize("NFC")
      .toLocaleLowerCase("de-DE");

  if (
    mode === "kurzschrift"
    && Object.prototype.hasOwnProperty.call(
      SWISS_KURZSCHRIFT_TARGETS,
      normalized,
    )
  ) {
    const baseMeaning =
      SWISS_KURZSCHRIFT_TARGETS[
        normalized as keyof
          typeof SWISS_KURZSCHRIFT_TARGETS
      ];

    const mapping =
      getGermanKurzschriftMapping(
        "twoForm",
        baseMeaning,
      );

    if (mapping.ok) {
      return Object.freeze({
        ok: true,
        input,
        mode,
        regionalOverlay: "swiss",
        unicodeBraille:
          mapping.unicodeBraille,
        overlayApplied: true,
        regionalRuleId:
          "DE-CH410-002",
      });
    }
  }

  return Object.freeze({
    ok: true,
    input,
    mode,
    regionalOverlay: "swiss",
    unicodeBraille:
      baseUnicodeBraille,
    overlayApplied: false,
    regionalRuleId: null,
  });
}
