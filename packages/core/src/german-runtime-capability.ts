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
 * Public Core capability boundary for German Braille after Phase 15.9.
 *
 * All three text modes have automatic executable Core surfaces and are
 * registered for the public SDK. Vollschrift and Kurzschrift still return
 * structured unresolved results when closed source evidence is insufficient;
 * registration never authorizes guessed pronunciation, morphology, lexical
 * context, or precedence.
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
    loweringCoverage:
      modeSelection.mode === "basisschrift"
        ? "123/123"
        : "SOURCE_FIXTURE_SURFACE",
    phase15_5Closed: true,
    phase15_8Required:
      modeSelection.mode !== "basisschrift",
  });
}
