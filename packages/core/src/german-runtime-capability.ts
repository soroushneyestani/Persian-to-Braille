import {
  createGermanRegionalConfiguration,
} from "./german-regional-configuration.js";

import type {
  GermanRegionalOverlay,
} from "./german-regional-configuration.js";

import {
  createGermanTextModeSelection,
} from "./german-text-mode.js";

import type {
  GermanTextMode,
} from "./german-text-mode.js";

/**
 * Public Core capability boundary for German Braille.
 *
 * Phase 15.5 closed the German semantic Core and materialized complete
 * Basisschrift execution IR, but it deliberately did not promote that IR to
 * executable runtime behavior. Phase 15.6 therefore exposes capability state
 * explicitly and fails closed instead of reusing the Persian runtime or
 * inventing German execution semantics.
 */
export type GermanBrailleRuntimeStatus =
  | "LOWERING_IR_NON_EXECUTABLE"
  | "MODE_RUNTIME_NOT_MATERIALIZED";

export type GermanBrailleRuntimeDependency =
  | "GERMAN_EXECUTABLE_RUNTIME_ADAPTER"
  | "GERMAN_MODE_EXECUTABLE_RUNTIME_MATERIALIZATION";

export interface GermanBrailleRuntimeCapability {
  readonly language: "de";
  readonly mode: GermanTextMode;
  readonly regionalOverlay:
    GermanRegionalOverlay | null;
  readonly executable: false;
  readonly runtimeRegistered: false;
  readonly status:
    GermanBrailleRuntimeStatus;
  readonly dependency:
    GermanBrailleRuntimeDependency;
  readonly loweringCoverage:
    "123/123" | "NOT_MATERIALIZED";
  readonly phase15_5Closed: true;
  readonly phase15_8Required: true;
}

export interface GermanBrailleRuntimeCapabilityOptions {
  readonly mode: unknown;
  readonly regionalOverlay?: unknown;
}

export function getGermanBrailleRuntimeCapability(
  options: GermanBrailleRuntimeCapabilityOptions,
): GermanBrailleRuntimeCapability {
  const modeSelection =
    createGermanTextModeSelection(
      options.mode,
    );

  const regionalConfiguration =
    createGermanRegionalConfiguration(
      options.regionalOverlay ?? null,
    );

  const isBasisschrift =
    modeSelection.mode === "basisschrift";

  return Object.freeze({
    language: "de",
    mode: modeSelection.mode,
    regionalOverlay:
      regionalConfiguration.overlay,
    executable: false,
    runtimeRegistered: false,
    status:
      isBasisschrift
        ? "LOWERING_IR_NON_EXECUTABLE"
        : "MODE_RUNTIME_NOT_MATERIALIZED",
    dependency:
      isBasisschrift
        ? "GERMAN_EXECUTABLE_RUNTIME_ADAPTER"
        : "GERMAN_MODE_EXECUTABLE_RUNTIME_MATERIALIZATION",
    loweringCoverage:
      isBasisschrift
        ? "123/123"
        : "NOT_MATERIALIZED",
    phase15_5Closed: true,
    phase15_8Required: true,
  });
}
