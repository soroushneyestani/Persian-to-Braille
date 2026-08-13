/**
 * Phase 4 normalization domain contract.
 *
 * This module defines data shapes only. It does not implement Unicode
 * normalization, Braille translation, or rule execution.
 */

export type UnicodeNormalizationForm =
  | "none"
  | "NFC"
  | "NFD"
  | "NFKC"
  | "NFKD";

export type UnknownFormatControlPolicy = "error";

export interface NormalizationPolicySnapshot {
  readonly profileId: string;
  readonly profileVersion: string;
  readonly unicodeForm: UnicodeNormalizationForm;
  readonly unknownFormatControls: UnknownFormatControlPolicy;
}

export interface UnicodeLocation {
  /**
   * Zero-based index by Unicode scalar value/code point.
   */
  readonly codePointIndex: number;

  /**
   * Zero-based JavaScript UTF-16 code-unit index.
   */
  readonly utf16Index: number;
}

export interface RecognizedFormatControl {
  readonly kind: "recognized-format-control";
  readonly codePoint: string;
  readonly character: string;
  readonly location: UnicodeLocation;

  /**
   * Canonical specification rules that recognize this code point.
   * Multiple rules are allowed because one code point may participate in
   * multiple semantic layers (for example ZWNJ in layout + normalization).
   */
  readonly ruleIds: readonly string[];

  /**
   * Structural tokens exposed by the recognizing rules, when present.
   */
  readonly structuralTokens: readonly string[];

  /**
   * Lifecycle states are preserved; candidate recognition must not be
   * mistaken for normative promotion.
   */
  readonly ruleStatuses: readonly string[];
}

export type NormalizationAnnotation = RecognizedFormatControl;

export interface NormalizationSuccess {
  readonly ok: true;
  readonly inputText: string;
  readonly outputText: string;

  /**
   * True only when the preprocessing pipeline has changed text content.
   * Under the current fa-ir-g1 Phase 4 baseline this is expected to remain
   * false because unicodeForm=none and no canonical rewrites are admitted.
   */
  readonly changed: boolean;

  readonly policy: NormalizationPolicySnapshot;
  readonly annotations: readonly NormalizationAnnotation[];
}

export type NormalizationFailureCode = "UNKNOWN_FORMAT_CONTROL";

export interface UnknownFormatControlFailure {
  readonly ok: false;
  readonly code: "UNKNOWN_FORMAT_CONTROL";
  readonly message: string;
  readonly codePoint: string;
  readonly character: string;
  readonly location: UnicodeLocation;
  readonly policy: NormalizationPolicySnapshot;
}

export type NormalizationFailure = UnknownFormatControlFailure;

export type NormalizationOutcome =
  | NormalizationSuccess
  | NormalizationFailure;

/**
 * Contract for deterministic, profile-driven Unicode preprocessing.
 *
 * Implementations must preserve the canonical specification as the authority.
 * This interface does not authorize any Unicode rewrite by itself.
 */
export interface UnicodePreprocessor {
  normalize(inputText: string): NormalizationOutcome;
}
