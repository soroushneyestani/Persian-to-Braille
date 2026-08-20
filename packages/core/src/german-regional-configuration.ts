/**
 * Internal German regional-configuration selection boundary.
 *
 * This module deliberately does not participate in the package root export
 * during Phase 15.5. Public regional SDK/API design remains owned by
 * Phase 15.6.
 *
 * Regional configuration is orthogonal to GermanTextMode. This boundary
 * selects configuration identity only; it does not execute Swiss rules.
 */

export const GERMAN_REGIONAL_OVERLAYS = [
  "swiss",
] as const;

export type GermanRegionalOverlay =
  (typeof GERMAN_REGIONAL_OVERLAYS)[number];

export interface GermanRegionalConfiguration {
  readonly overlay: GermanRegionalOverlay | null;
}

export function isGermanRegionalOverlay(
  value: unknown,
): value is GermanRegionalOverlay {
  return (
    typeof value === "string"
    && (
      GERMAN_REGIONAL_OVERLAYS as readonly string[]
    ).includes(value)
  );
}

export function createGermanRegionalConfiguration(
  overlay: unknown,
): GermanRegionalConfiguration {
  if (
    overlay !== null
    && !isGermanRegionalOverlay(overlay)
  ) {
    throw new TypeError(
      `Unsupported German regional overlay: ${String(overlay)}.`,
    );
  }

  return Object.freeze({
    overlay,
  });
}
