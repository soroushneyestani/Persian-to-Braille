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
 * Public Core capability boundary for German Braille after Phase 15.8.
 *
 * Basisschrift has an automatic executable Core surface and is registered
 * for the public SDK. Vollschrift and Kurzschrift are executable only through
 * their explicit source-backed resolution surfaces; no lexical, morphological,
 * pronunciation, or precedence provider is invented here.
 */
export type GermanBrailleRuntimeStatus =
  | "EXECUTABLE_RUNTIME_REGISTERED"
  | "EXPLICIT_RESOLUTION_CONTEXT_REQUIRED"
  | "EXPLICIT_RESOLVED_PLAN_REQUIRED";

export type GermanBrailleRuntimeDependency =
  | "NONE"
  | "GERMAN_VOLLSCHRIFT_EXPLICIT_RESOLUTION_CONTEXT"
  | "GERMAN_KURZSCHRIFT_EXPLICIT_RESOLVED_PLAN";

export interface GermanBrailleRuntimeCapability {
  readonly language: "de";
  readonly mode: GermanTextMode;
  readonly regionalOverlay:
    GermanRegionalOverlay | null;
  readonly executable: boolean;
  readonly runtimeRegistered: boolean;
  readonly status:
    GermanBrailleRuntimeStatus;
  readonly dependency:
    GermanBrailleRuntimeDependency;
  readonly loweringCoverage:
    | "123/123"
    | "SOURCE_FIXTURE_SURFACE";
  readonly phase15_5Closed: true;
  readonly phase15_8Required: boolean;
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

  if (
    modeSelection.mode
    === "basisschrift"
  ) {
    return Object.freeze({
      language: "de",
      mode: modeSelection.mode,
      regionalOverlay:
        regionalConfiguration.overlay,
      executable: true,
      runtimeRegistered: true,
      status:
        "EXECUTABLE_RUNTIME_REGISTERED",
      dependency: "NONE",
      loweringCoverage: "123/123",
      phase15_5Closed: true,
      phase15_8Required: false,
    });
  }

  if (
    modeSelection.mode
    === "vollschrift"
  ) {
    return Object.freeze({
      language: "de",
      mode: modeSelection.mode,
      regionalOverlay:
        regionalConfiguration.overlay,
      executable: false,
      runtimeRegistered: false,
      status:
        "EXPLICIT_RESOLUTION_CONTEXT_REQUIRED",
      dependency:
        "GERMAN_VOLLSCHRIFT_EXPLICIT_RESOLUTION_CONTEXT",
      loweringCoverage:
        "SOURCE_FIXTURE_SURFACE",
      phase15_5Closed: true,
      phase15_8Required: true,
    });
  }

  return Object.freeze({
    language: "de",
    mode: modeSelection.mode,
    regionalOverlay:
      regionalConfiguration.overlay,
    executable: false,
    runtimeRegistered: false,
    status:
      "EXPLICIT_RESOLVED_PLAN_REQUIRED",
    dependency:
      "GERMAN_KURZSCHRIFT_EXPLICIT_RESOLVED_PLAN",
    loweringCoverage:
      "SOURCE_FIXTURE_SURFACE",
    phase15_5Closed: true,
    phase15_8Required: true,
  });
}
