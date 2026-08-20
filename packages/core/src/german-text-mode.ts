/**
 * Internal German text-mode selection boundary.
 *
 * This module deliberately does not participate in the package root export
 * during Phase 15.5. Public German SDK/API design remains owned by Phase 15.6.
 *
 * GermanTextMode is a translation-configuration dimension. It is distinct
 * from the existing structural rule type named "mode" and from
 * ModeRuleExecutor.
 */

export const GERMAN_TEXT_MODES = [
  "basisschrift",
  "vollschrift",
  "kurzschrift",
] as const;

export type GermanTextMode =
  (typeof GERMAN_TEXT_MODES)[number];

export interface GermanTextModeSelection {
  readonly mode: GermanTextMode;
}

export function isGermanTextMode(
  value: unknown,
): value is GermanTextMode {
  return (
    typeof value === "string"
    && (
      GERMAN_TEXT_MODES as readonly string[]
    ).includes(value)
  );
}

export function createGermanTextModeSelection(
  value: unknown,
): GermanTextModeSelection {
  if (!isGermanTextMode(value)) {
    throw new TypeError(
      `Unsupported German text mode: ${String(value)}.`,
    );
  }

  return Object.freeze({
    mode: value,
  });
}
