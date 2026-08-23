import {
  GERMAN_VOLLSCHRIFT_CONTRACTIONS,
  GERMAN_VOLLSCHRIFT_FORMAL_ELIGIBILITY_RULES,
  GERMAN_VOLLSCHRIFT_MORPHOLOGICAL_RULES,
  GERMAN_VOLLSCHRIFT_PRONUNCIATION_RULES,
  GERMAN_VOLLSCHRIFT_RUNTIME_SOURCE,
  GERMAN_VOLLSCHRIFT_ST_POLICY_RULES,
} from "./generated/de-vollschrift.runtime.js";

export type GermanVollschriftRuntimeMaterializationStatus =
  "MATERIALIZED_NON_EXECUTABLE";

export interface GermanVollschriftRuntimeMaterialization {
  readonly language: "de";
  readonly mode: "vollschrift";
  readonly direction: "print-to-braille";
  readonly cellSize: 6;
  readonly status:
    GermanVollschriftRuntimeMaterializationStatus;
  readonly materialized: true;
  readonly executable: false;
  readonly runtimeRegistered: false;
  readonly runtimeConformanceProven: false;
  readonly inheritsBasisschrift: true;
  readonly effectiveLayers:
    readonly ["basisschrift", "vollschrift"];
  readonly contractionCount: 8;
  readonly formalEligibilityRuleCount: 14;
  readonly morphologicalRuleCount: 10;
  readonly pronunciationRuleCount: 14;
  readonly stPolicyRuleCount: 12;
  readonly normativeFixtureCount: 48;
  readonly source:
    typeof GERMAN_VOLLSCHRIFT_RUNTIME_SOURCE;
  readonly contractions:
    typeof GERMAN_VOLLSCHRIFT_CONTRACTIONS;
  readonly formalEligibilityRules:
    typeof GERMAN_VOLLSCHRIFT_FORMAL_ELIGIBILITY_RULES;
  readonly morphologicalRules:
    typeof GERMAN_VOLLSCHRIFT_MORPHOLOGICAL_RULES;
  readonly pronunciationRules:
    typeof GERMAN_VOLLSCHRIFT_PRONUNCIATION_RULES;
  readonly stPolicyRules:
    typeof GERMAN_VOLLSCHRIFT_ST_POLICY_RULES;
}

export function getGermanVollschriftRuntimeMaterialization():
  GermanVollschriftRuntimeMaterialization {
  return Object.freeze({
    language: "de",
    mode: "vollschrift",
    direction: "print-to-braille",
    cellSize: 6,
    status: "MATERIALIZED_NON_EXECUTABLE",
    materialized: true,
    executable: false,
    runtimeRegistered: false,
    runtimeConformanceProven: false,
    inheritsBasisschrift: true,
    effectiveLayers:
      Object.freeze([
        "basisschrift",
        "vollschrift",
      ]) as readonly ["basisschrift", "vollschrift"],
    contractionCount: 8,
    formalEligibilityRuleCount: 14,
    morphologicalRuleCount: 10,
    pronunciationRuleCount: 14,
    stPolicyRuleCount: 12,
    normativeFixtureCount: 48,
    source:
      GERMAN_VOLLSCHRIFT_RUNTIME_SOURCE,
    contractions:
      GERMAN_VOLLSCHRIFT_CONTRACTIONS,
    formalEligibilityRules:
      GERMAN_VOLLSCHRIFT_FORMAL_ELIGIBILITY_RULES,
    morphologicalRules:
      GERMAN_VOLLSCHRIFT_MORPHOLOGICAL_RULES,
    pronunciationRules:
      GERMAN_VOLLSCHRIFT_PRONUNCIATION_RULES,
    stPolicyRules:
      GERMAN_VOLLSCHRIFT_ST_POLICY_RULES,
  });
}

import {
  translateGermanBasisschrift,
} from "./german-basisschrift-runtime.js";

export type GermanVollschriftCandidateDecision =
  | "CONTRACT"
  | "KEEP";

export type GermanVollschriftPronunciationState =
  | "ELIGIBLE"
  | "INELIGIBLE"
  | "UNRESOLVED_PRONUNCIATION";

export interface GermanVollschriftCandidateEvidence {
  readonly boundaryCrosses?: boolean;
  readonly boundaryClass?: string;
  readonly pronunciation?: GermanVollschriftPronunciationState;
  readonly sthThOneSound?: boolean;
  readonly sstDoubleSPriority?: boolean;
  readonly sanktAbbreviation?: boolean;
}

export interface GermanVollschriftCandidateResolutionSuccess {
  readonly ok: true;
  readonly candidate: string;
  readonly decision: GermanVollschriftCandidateDecision;
  readonly reason: string;
}

export interface GermanVollschriftCandidateResolutionFailure {
  readonly ok: false;
  readonly candidate: string;
  readonly code:
    | "UNSUPPORTED_CANDIDATE"
    | "CONTEXT_REQUIRED";
  readonly message: string;
}

export type GermanVollschriftCandidateResolution =
  | GermanVollschriftCandidateResolutionSuccess
  | GermanVollschriftCandidateResolutionFailure;

export interface GermanVollschriftResolvedCandidate {
  readonly startCodePoint: number;
  readonly candidate: string;
  readonly decision: GermanVollschriftCandidateDecision;
}

export interface GermanVollschriftDecisionTrace {
  readonly startCodePoint: number;
  readonly candidate: string;
  readonly decision: GermanVollschriftCandidateDecision;
}

export interface GermanVollschriftExecutionSuccess {
  readonly ok: true;
  readonly input: string;
  readonly normalizedText: string;
  readonly unicodeBraille: string;
  readonly cells: readonly string[];
  readonly decisionTrace:
    readonly GermanVollschriftDecisionTrace[];
  readonly runtime: {
    readonly language: "de";
    readonly mode: "vollschrift";
    readonly executable: true;
    readonly resolutionBoundary:
      "EXPLICIT_RESOLUTION_CONTEXT_REQUIRED";
    readonly runtimeRegistered: false;
  };
}

export interface GermanVollschriftExecutionFailure {
  readonly ok: false;
  readonly input: string;
  readonly code:
    | "BASISSCHRIFT_FAILURE"
    | "BASELINE_ALIGNMENT_UNAVAILABLE"
    | "INVALID_RESOLUTION"
    | "CONTEXT_REQUIRED";
  readonly message: string;
  readonly startCodePoint?: number;
  readonly candidate?: string;
}

export type GermanVollschriftExecutionResult =
  | GermanVollschriftExecutionSuccess
  | GermanVollschriftExecutionFailure;

const VOLLSCHRIFT_CONTRACTION_CELLS: Readonly<Record<string, string>> = {"au":"⠡","ch":"⠹","ei":"⠩","eu":"⠣","ie":"⠬","sch":"⠱","st":"⠾","äu":"⠌"};

const VOLLSCHRIFT_CANDIDATE_ORDER =
  Object.freeze(
    Object.keys(
      VOLLSCHRIFT_CONTRACTION_CELLS,
    ).sort(
      (left, right) =>
        right.length - left.length
        || left.localeCompare(right),
    ),
  );

function normalizeCandidate(
  candidate: string,
): string {
  return candidate
    .normalize("NFC")
    .toLocaleLowerCase("de-DE");
}

function isSupportedCandidate(
  candidate: string,
): boolean {
  return Object.prototype.hasOwnProperty.call(
    VOLLSCHRIFT_CONTRACTION_CELLS,
    candidate,
  );
}

export function resolveGermanVollschriftCandidate(
  candidateInput: string,
  evidence: GermanVollschriftCandidateEvidence,
): GermanVollschriftCandidateResolution {
  const candidate =
    normalizeCandidate(
      candidateInput,
    );

  if (!isSupportedCandidate(candidate)) {
    return Object.freeze({
      ok: false,
      candidate,
      code: "UNSUPPORTED_CANDIDATE",
      message:
        "Candidate is not one of the eight canonical Vollschrift contractions.",
    });
  }

  if (evidence.boundaryCrosses === true) {
    return Object.freeze({
      ok: true,
      candidate,
      decision: "KEEP",
      reason:
        evidence.boundaryClass
        ?? "MORPHOLOGICAL_BOUNDARY",
    });
  }

  if (candidate === "st") {
    if (evidence.sthThOneSound === true) {
      return Object.freeze({
        ok: true,
        candidate,
        decision: "KEEP",
        reason: "STH_TH_ONE_SOUND",
      });
    }

    if (evidence.sstDoubleSPriority === true) {
      return Object.freeze({
        ok: true,
        candidate,
        decision: "KEEP",
        reason: "SST_DOUBLE_S_PRIORITY",
      });
    }

    if (evidence.sanktAbbreviation === true) {
      return Object.freeze({
        ok: true,
        candidate,
        decision: "KEEP",
        reason: "ST_ABBREVIATES_SANKT",
      });
    }

    if (evidence.boundaryCrosses === false) {
      return Object.freeze({
        ok: true,
        candidate,
        decision: "CONTRACT",
        reason: "ST_ALLOWED_WITH_RESOLVED_BOUNDARY_CONTEXT",
      });
    }

    return Object.freeze({
      ok: false,
      candidate,
      code: "CONTEXT_REQUIRED",
      message:
        "st requires resolved morphology or an explicit exclusion context.",
    });
  }

  if (candidate === "ch") {
    if (evidence.boundaryCrosses === false) {
      return Object.freeze({
        ok: true,
        candidate,
        decision: "CONTRACT",
        reason: "CH_ALLOWED_WITH_RESOLVED_BOUNDARY_CONTEXT",
      });
    }

    return Object.freeze({
      ok: false,
      candidate,
      code: "CONTEXT_REQUIRED",
      message:
        "ch requires resolved morphology context.",
    });
  }

  if (evidence.pronunciation === "INELIGIBLE") {
    return Object.freeze({
      ok: true,
      candidate,
      decision: "KEEP",
      reason: "PRONUNCIATION_INELIGIBLE",
    });
  }

  if (
    evidence.boundaryCrosses === false
    && evidence.pronunciation === "ELIGIBLE"
  ) {
    return Object.freeze({
      ok: true,
      candidate,
      decision: "CONTRACT",
      reason:
        "RESOLVED_MORPHOLOGY_AND_PRONUNCIATION",
    });
  }

  return Object.freeze({
    ok: false,
    candidate,
    code: "CONTEXT_REQUIRED",
    message:
      "Candidate requires explicit resolved morphology/pronunciation context.",
  });
}

function resolutionKey(
  startCodePoint: number,
  candidate: string,
): string {
  return (
    String(startCodePoint)
    + ":"
    + normalizeCandidate(candidate)
  );
}

function candidateAt(
  chars: readonly string[],
  start: number,
): string | null {
  const rest =
    chars
      .slice(start)
      .join("")
      .toLocaleLowerCase("de-DE");

  for (
    const candidate
    of VOLLSCHRIFT_CANDIDATE_ORDER
  ) {
    if (rest.startsWith(candidate)) {
      return candidate;
    }
  }

  return null;
}

// POST15_GERMAN_SENTENCE_COMPOSITION_FIX
//
// Vollschrift candidates operate on lexical code-point positions, while
// Basisschrift is allowed to emit structural output for spaces/punctuation.
// Rebuild an index-preserving baseline only when the original one-cell-per-
// code-point assumption is not available. Lexical runs must still remain
// exactly aligned; structural runs are preserved as an opaque Braille chunk.
function isGermanLexicalCodePoint(
  value: string,
): boolean {
  return /^[\p{L}\p{M}]$/u.test(value);
}

function rebuildBasisschriftAlignment(
  normalizedText: string,
): readonly string[] | null {
  const chars =
    Array.from(normalizedText);

  const chunks =
    new Array<string>(
      chars.length,
    ).fill("");

  let start = 0;

  while (start < chars.length) {
    const lexical =
      isGermanLexicalCodePoint(
        chars[start]!,
      );

    let end =
      start + 1;

    while (
      end < chars.length
      && isGermanLexicalCodePoint(
        chars[end]!,
      ) === lexical
    ) {
      end += 1;
    }

    const source =
      chars
        .slice(start, end)
        .join("");

    const translated =
      translateGermanBasisschrift(
        source,
      );

    if (!translated.ok) {
      return null;
    }

    if (lexical) {
      const cells =
        Array.from(
          translated.unicodeBraille,
        );

      if (
        cells.length
        !== end - start
      ) {
        return null;
      }

      for (
        let offset = 0;
        offset < cells.length;
        offset += 1
      ) {
        chunks[start + offset] =
          cells[offset]!;
      }
    } else {
      chunks[start] =
        translated.unicodeBraille;
    }

    start = end;
  }

  return Object.freeze(
    chunks.slice(),
  );
}

export function translateGermanVollschriftResolved(
  input: string,
  resolvedCandidates:
    readonly GermanVollschriftResolvedCandidate[],
): GermanVollschriftExecutionResult {
  const baseline =
    translateGermanBasisschrift(input);

  if (!baseline.ok) {
    return Object.freeze({
      ok: false,
      input,
      code: "BASISSCHRIFT_FAILURE",
      message:
        "Basisschrift inheritance failed before Vollschrift resolution.",
    });
  }

  const normalizedText =
    baseline.normalizedText;

  const chars =
    Array.from(normalizedText);

  let baselineCells =
    Array.from(
      baseline.unicodeBraille,
    );

  if (
    baselineCells.length
    !== chars.length
  ) {
    const rebuilt =
      rebuildBasisschriftAlignment(
        normalizedText,
      );

    if (rebuilt === null) {
      return Object.freeze({
        ok: false,
        input,
        code: "BASELINE_ALIGNMENT_UNAVAILABLE",
        message:
          "Vollschrift could not preserve Basisschrift alignment for this lexical/structural composition.",
      });
    }

    baselineCells =
      Array.from(rebuilt);
  }

  const resolutionMap =
    new Map<
      string,
      GermanVollschriftResolvedCandidate
    >();

  for (const item of resolvedCandidates) {
    const candidate =
      normalizeCandidate(
        item.candidate,
      );

    if (
      !Number.isInteger(
        item.startCodePoint,
      )
      || item.startCodePoint < 0
      || item.startCodePoint >= chars.length
      || !isSupportedCandidate(candidate)
    ) {
      return Object.freeze({
        ok: false,
        input,
        code: "INVALID_RESOLUTION",
        message:
          "Resolved candidate has invalid start/candidate identity.",
        startCodePoint:
          item.startCodePoint,
        candidate,
      });
    }

    const actual =
      chars
        .slice(
          item.startCodePoint,
          item.startCodePoint
            + Array.from(candidate).length,
        )
        .join("")
        .toLocaleLowerCase("de-DE");

    if (actual !== candidate) {
      return Object.freeze({
        ok: false,
        input,
        code: "INVALID_RESOLUTION",
        message:
          "Resolved candidate does not match input at startCodePoint.",
        startCodePoint:
          item.startCodePoint,
        candidate,
      });
    }

    const key =
      resolutionKey(
        item.startCodePoint,
        candidate,
      );

    if (resolutionMap.has(key)) {
      return Object.freeze({
        ok: false,
        input,
        code: "INVALID_RESOLUTION",
        message:
          "Duplicate resolution for candidate occurrence.",
        startCodePoint:
          item.startCodePoint,
        candidate,
      });
    }

    resolutionMap.set(
      key,
      Object.freeze({
        startCodePoint:
          item.startCodePoint,
        candidate,
        decision:
          item.decision,
      }),
    );
  }

  const output: string[] = [];
  const trace:
    GermanVollschriftDecisionTrace[] = [];

  let index = 0;

  while (index < chars.length) {
    const candidate =
      candidateAt(
        chars,
        index,
      );

    if (candidate === null) {
      output.push(
        baselineCells[index]!,
      );
      index += 1;
      continue;
    }

    const resolution =
      resolutionMap.get(
        resolutionKey(
          index,
          candidate,
        ),
      );

    if (resolution === undefined) {
      return Object.freeze({
        ok: false,
        input,
        code: "CONTEXT_REQUIRED",
        message:
          "Every reachable Vollschrift candidate requires an explicit resolution.",
        startCodePoint:
          index,
        candidate,
      });
    }

    trace.push(
      Object.freeze({
        startCodePoint:
          index,
        candidate,
        decision:
          resolution.decision,
      }),
    );

    if (
      resolution.decision
      === "CONTRACT"
    ) {
      const cell =
        VOLLSCHRIFT_CONTRACTION_CELLS[
          candidate
        ];

      if (cell === undefined) {
        return Object.freeze({
          ok: false,
          input,
          code: "INVALID_RESOLUTION",
          message:
            "Canonical contraction cell disappeared.",
          startCodePoint:
            index,
          candidate,
        });
      }

      output.push(cell);
      index +=
        Array.from(candidate).length;
      continue;
    }

    output.push(
      baselineCells[index]!,
    );
    index += 1;
  }

  const unicodeBraille =
    output.join("");

  return Object.freeze({
    ok: true,
    input,
    normalizedText,
    unicodeBraille,
    cells:
      Object.freeze(
        Array.from(
          unicodeBraille,
        ),
      ),
    decisionTrace:
      Object.freeze(
        trace.slice(),
      ),
    runtime:
      Object.freeze({
        language: "de",
        mode: "vollschrift",
        executable: true,
        resolutionBoundary:
          "EXPLICIT_RESOLUTION_CONTEXT_REQUIRED",
        runtimeRegistered: false,
      }),
  });
}
