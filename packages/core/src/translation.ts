import type {
  NormalizationAnnotation,
  NormalizationFailure,
  NormalizationPolicySnapshot,
  UnicodeLocation,
} from "./normalization.js";

export type RuleLifecycleStatus = "candidate" | "normative";

export type TranslationRuleType =
  | "character"
  | "context"
  | "sequence"
  | "mode"
  | "layout"
  | "normalization";

export type TranslationInputKind =
  | "scalar"
  | "context"
  | "sequence"
  | "structural";

export type SemanticContextClass = "digit";

export type EngineTokenClass =
  | "latin-character-class"
  | "latin-span-begin"
  | "latin-span-end"
  | "latin-capital-indicator"
  | "numeric-indicator"
  | "numeric-begin"
  | "numeric-internal"
  | "numeric-decimal-separator"
  | "numeric-end"
  | "numeric-fraction-separator";

export interface TranslationProfileSnapshot {
  readonly profileId: string;
  readonly profileVersion: string;
  readonly profileStatus: string;
  readonly direction: string;
  readonly normalizationPolicy: NormalizationPolicySnapshot;
  readonly fallbackPolicy: {
    readonly unknownCharacter: "error";
    readonly unknownSequence: "error";
  };
}

export interface UnicodeSpan {
  /**
   * Inclusive start location.
   */
  readonly start: UnicodeLocation;

  /**
   * Exclusive end location.
   */
  readonly end: UnicodeLocation;
}

export interface ContextSnapshot {
  readonly before: readonly SemanticContextClass[];
  readonly after: readonly SemanticContextClass[];
}

export interface EngineToken {
  readonly tokenClass: EngineTokenClass;
  readonly span: UnicodeSpan;
}

export interface RuleOutputSnapshot {
  readonly cells: readonly string[];
  readonly unicodeBraille: string | null;
  readonly structuralToken: string | null;
}

export interface RuleMatch {
  readonly ruleId: string;
  readonly lifecycleStatus: RuleLifecycleStatus;
  readonly ruleType: TranslationRuleType;
  readonly inputKind: TranslationInputKind;
  readonly priority: number;
  readonly matchedText: string;
  readonly span: UnicodeSpan;
  readonly tokenClass: EngineTokenClass | null;
  readonly context: ContextSnapshot;
  readonly output: RuleOutputSnapshot;
}

export interface TranslationTrace {
  readonly normalizationAnnotations: readonly NormalizationAnnotation[];
  readonly engineTokens: readonly EngineToken[];
  readonly matches: readonly RuleMatch[];
}

export interface TranslationSuccess {
  readonly ok: true;
  readonly inputText: string;
  readonly normalizedText: string;
  readonly cells: readonly string[];
  readonly unicodeBraille: string;
  readonly structuralTokens: readonly string[];
  readonly profile: TranslationProfileSnapshot;
  readonly trace: TranslationTrace;
}

export type TranslationFailureCode =
  | "PREPROCESSING_FAILED"
  | "UNKNOWN_CHARACTER"
  | "UNKNOWN_SEQUENCE"
  | "AMBIGUOUS_MATCH"
  | "UNSUPPORTED_ENGINE_STATE";

export interface PreprocessingTranslationFailure {
  readonly ok: false;
  readonly code: "PREPROCESSING_FAILED";
  readonly message: string;
  readonly inputText: string;
  readonly cause: NormalizationFailure;
}

export interface UnknownCharacterFailure {
  readonly ok: false;
  readonly code: "UNKNOWN_CHARACTER";
  readonly message: string;
  readonly inputText: string;
  readonly character: string;
  readonly codePoint: string;
  readonly location: UnicodeLocation;
  readonly profile: TranslationProfileSnapshot;
}

export interface UnknownSequenceFailure {
  readonly ok: false;
  readonly code: "UNKNOWN_SEQUENCE";
  readonly message: string;
  readonly inputText: string;
  readonly fragment: string;
  readonly span: UnicodeSpan;
  readonly profile: TranslationProfileSnapshot;
}

export interface AmbiguousMatchFailure {
  readonly ok: false;
  readonly code: "AMBIGUOUS_MATCH";
  readonly message: string;
  readonly inputText: string;
  readonly span: UnicodeSpan;
  readonly candidateRuleIds: readonly string[];
  readonly profile: TranslationProfileSnapshot;
}

export interface UnsupportedEngineStateFailure {
  readonly ok: false;
  readonly code: "UNSUPPORTED_ENGINE_STATE";
  readonly message: string;
  readonly inputText: string;
  readonly detail: string;
  readonly location: UnicodeLocation | null;
  readonly profile: TranslationProfileSnapshot;
}

export type TranslationFailure =
  | PreprocessingTranslationFailure
  | UnknownCharacterFailure
  | UnknownSequenceFailure
  | AmbiguousMatchFailure
  | UnsupportedEngineStateFailure;

export type TranslationOutcome =
  | TranslationSuccess
  | TranslationFailure;

export interface ContextClassificationRequest {
  readonly text: string;
  readonly location: UnicodeLocation;
  readonly character: string;
}

export interface ContextClassifier {
  classify(
    request: ContextClassificationRequest,
  ): readonly SemanticContextClass[];
}

export interface EngineTokenProductionRequest {
  readonly text: string;
  readonly normalizationAnnotations: readonly NormalizationAnnotation[];
}

export interface EngineTokenProducer {
  produce(
    request: EngineTokenProductionRequest,
  ): readonly EngineToken[];
}

/**
 * Core forward-translation boundary.
 *
 * The implementation is responsible for invoking Phase 4 preprocessing before
 * rule matching. This interface does not define or authorize Braille mappings;
 * those remain owned by the canonical specification.
 */
export interface ForwardTranslator {
  translate(inputText: string): TranslationOutcome;
}
