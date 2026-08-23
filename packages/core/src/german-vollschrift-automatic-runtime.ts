import {
  resolveGermanVollschriftCandidate,
  translateGermanVollschriftResolved,
} from "./german-vollschrift-runtime.js";

import type {
  GermanVollschriftCandidateDecision,
  GermanVollschriftDecisionTrace,
  GermanVollschriftResolvedCandidate,
} from "./german-vollschrift-runtime.js";

export const GERMAN_VOLLSCHRIFT_AUTOMATIC_PROVIDER_KIND =
  "CLOSED_NORMATIVE_SOURCE_REGISTRY" as const;

export const GERMAN_VOLLSCHRIFT_AUTOMATIC_PROVIDER_IS_NORMATIVE =
  false as const;

export const GERMAN_VOLLSCHRIFT_AUTOMATIC_UNKNOWN_CONTEXT_POLICY =
  "STRUCTURED_UNRESOLVED" as const;

interface InternalWordDecision {
  readonly input: string;
  readonly candidate: string;
  readonly decision: GermanVollschriftCandidateDecision;
  readonly sourceFixtureId: string;
  readonly sourceKind:
    | "NORMATIVE_RENDERING_DERIVATION"
    | "CLOSED_NORMATIVE_DECISION_FIXTURE"
    | "CLOSED_NORMATIVE_PARTIAL_FALLBACK";
}

interface InternalFullPlan {
  readonly input: string;
  readonly sourceFixtureId: string;
  readonly expectedBraille: string;
  readonly resolvedCandidates:
    readonly GermanVollschriftResolvedCandidate[];
}

export interface GermanVollschriftAutomaticCandidateSuccess {
  readonly ok: true;
  readonly input: string;
  readonly candidate: string;
  readonly decision: GermanVollschriftCandidateDecision;
  readonly sourceFixtureId: string;
  readonly sourceKind: InternalWordDecision["sourceKind"];
}

export interface GermanVollschriftAutomaticCandidateFailure {
  readonly ok: false;
  readonly input: string;
  readonly candidate: string;
  readonly code: "SOURCE_CONTEXT_UNRESOLVED";
  readonly message: string;
}

export type GermanVollschriftAutomaticCandidateResult =
  | GermanVollschriftAutomaticCandidateSuccess
  | GermanVollschriftAutomaticCandidateFailure;

export interface GermanVollschriftAutomaticPlanSuccess {
  readonly ok: true;
  readonly input: string;
  readonly sourceFixtureId: string | null;
  readonly resolvedCandidates:
    readonly GermanVollschriftResolvedCandidate[];
  readonly provider:
    typeof GERMAN_VOLLSCHRIFT_AUTOMATIC_PROVIDER_KIND;
}

export interface GermanVollschriftAutomaticPlanFailure {
  readonly ok: false;
  readonly input: string;
  readonly code: "SOURCE_CONTEXT_UNRESOLVED";
  readonly message: string;
  readonly startCodePoint: number;
  readonly candidate: string;
  readonly provider:
    typeof GERMAN_VOLLSCHRIFT_AUTOMATIC_PROVIDER_KIND;
}

export type GermanVollschriftAutomaticPlanResult =
  | GermanVollschriftAutomaticPlanSuccess
  | GermanVollschriftAutomaticPlanFailure;

export interface GermanVollschriftAutomaticExecutionSuccess {
  readonly ok: true;
  readonly input: string;
  readonly normalizedText: string;
  readonly unicodeBraille: string;
  readonly cells: readonly string[];
  readonly decisionTrace:
    readonly GermanVollschriftDecisionTrace[];
  readonly sourceFixtureId: string | null;
  readonly runtime: {
    readonly language: "de";
    readonly mode: "vollschrift";
    readonly executable: true;
    readonly automaticProviderResolutionExecutable: true;
    readonly provider:
      typeof GERMAN_VOLLSCHRIFT_AUTOMATIC_PROVIDER_KIND;
    readonly providerCoverage:
      "CLOSED_NORMATIVE_SOURCE_REGISTRY";
    readonly unknownContextPolicy:
      "STRUCTURED_UNRESOLVED";
    readonly runtimeRegistered: false;
  };
}

export interface GermanVollschriftAutomaticExecutionFailure {
  readonly ok: false;
  readonly input: string;
  readonly code:
    | "SOURCE_CONTEXT_UNRESOLVED"
    | "RESOLVED_EXECUTION_FAILURE";
  readonly message: string;
  readonly startCodePoint?: number;
  readonly candidate?: string;
}

export type GermanVollschriftAutomaticExecutionResult =
  | GermanVollschriftAutomaticExecutionSuccess
  | GermanVollschriftAutomaticExecutionFailure;

const AUTOMATIC_CANDIDATES = ["sch","au","ch","ei","eu","ie","st","äu"] as const;

const FULL_PLANS = {"asche":{"expectedBraille":"⠁⠱⠑","input":"Asche","resolvedCandidates":[{"candidate":"sch","decision":"CONTRACT","startCodePoint":1},{"candidate":"ch","decision":"KEEP","startCodePoint":2}],"sourceFixtureId":"DE-VOLL-NORM-CASE-005"},"asthma":{"expectedBraille":"⠁⠎⠞⠓⠍⠁","input":"Asthma","resolvedCandidates":[{"candidate":"st","decision":"KEEP","startCodePoint":1}],"sourceFixtureId":"DE-VOLL-NORM-CASE-038"},"au":{"expectedBraille":"⠡","input":"Au","resolvedCandidates":[{"candidate":"au","decision":"CONTRACT","startCodePoint":0}],"sourceFixtureId":"DE-VOLL-NORM-CASE-015"},"baum":{"expectedBraille":"⠃⠡⠍","input":"Baum","resolvedCandidates":[{"candidate":"au","decision":"CONTRACT","startCodePoint":1}],"sourceFixtureId":"DE-VOLL-NORM-CASE-001"},"bewusst":{"expectedBraille":"⠃⠑⠺⠥⠎⠎⠞","input":"bewusst","resolvedCandidates":[{"candidate":"st","decision":"KEEP","startCodePoint":5}],"sourceFixtureId":"DE-VOLL-NORM-CASE-048"},"bruschetta":{"expectedBraille":"⠃⠗⠥⠎⠹⠑⠞⠞⠁","input":"Bruschetta","resolvedCandidates":[{"candidate":"sch","decision":"KEEP","startCodePoint":3},{"candidate":"ch","decision":"CONTRACT","startCodePoint":4}],"sourceFixtureId":"DE-VOLL-NORM-CASE-046"},"bäume":{"expectedBraille":"⠃⠌⠍⠑","input":"Bäume","resolvedCandidates":[{"candidate":"äu","decision":"CONTRACT","startCodePoint":1}],"sourceFixtureId":"DE-VOLL-NORM-CASE-007"},"docht":{"expectedBraille":"⠙⠕⠹⠞","input":"Docht","resolvedCandidates":[{"candidate":"ch","decision":"CONTRACT","startCodePoint":2}],"sourceFixtureId":"DE-VOLL-NORM-CASE-004"},"ei":{"expectedBraille":"⠩","input":"Ei","resolvedCandidates":[{"candidate":"ei","decision":"CONTRACT","startCodePoint":0}],"sourceFixtureId":"DE-VOLL-NORM-CASE-016"},"eisen":{"expectedBraille":"⠩⠎⠑⠝","input":"Eisen","resolvedCandidates":[{"candidate":"ei","decision":"CONTRACT","startCodePoint":0}],"sourceFixtureId":"DE-VOLL-NORM-CASE-003"},"eschatologie":{"expectedBraille":"⠑⠎⠹⠁⠞⠕⠇⠕⠛⠬","input":"Eschatologie","resolvedCandidates":[{"candidate":"sch","decision":"KEEP","startCodePoint":1},{"candidate":"ch","decision":"CONTRACT","startCodePoint":2},{"candidate":"ie","decision":"CONTRACT","startCodePoint":10}],"sourceFixtureId":"DE-VOLL-NORM-CASE-047"},"esther":{"expectedBraille":"⠑⠎⠞⠓⠑⠗","input":"Esther","resolvedCandidates":[{"candidate":"st","decision":"KEEP","startCodePoint":1}],"sourceFixtureId":"DE-VOLL-NORM-CASE-039"},"familie":{"expectedBraille":"⠋⠁⠍⠊⠇⠊⠑","input":"Familie","resolvedCandidates":[{"candidate":"ie","decision":"KEEP","startCodePoint":5}],"sourceFixtureId":"DE-VOLL-NORM-CASE-035"},"heute":{"expectedBraille":"⠓⠣⠞⠑","input":"heute","resolvedCandidates":[{"candidate":"eu","decision":"CONTRACT","startCodePoint":1}],"sourceFixtureId":"DE-VOLL-NORM-CASE-002"},"jubiläum":{"expectedBraille":"⠚⠥⠃⠊⠇⠜⠥⠍","input":"Jubiläum","resolvedCandidates":[{"candidate":"äu","decision":"KEEP","startCodePoint":5}],"sourceFixtureId":"DE-VOLL-NORM-CASE-034"},"kapernaum":{"expectedBraille":"⠅⠁⠏⠑⠗⠝⠁⠥⠍","input":"Kapernaum","resolvedCandidates":[{"candidate":"au","decision":"KEEP","startCodePoint":6}],"sourceFixtureId":"DE-VOLL-NORM-CASE-031"},"koffein":{"expectedBraille":"⠅⠕⠋⠋⠑⠊⠝","input":"Koffein","resolvedCandidates":[{"candidate":"ei","decision":"KEEP","startCodePoint":4}],"sourceFixtureId":"DE-VOLL-NORM-CASE-033"},"liebe":{"expectedBraille":"⠇⠬⠃⠑","input":"Liebe","resolvedCandidates":[{"candidate":"ie","decision":"CONTRACT","startCodePoint":1}],"sourceFixtureId":"DE-VOLL-NORM-CASE-008"},"museum":{"expectedBraille":"⠍⠥⠎⠑⠥⠍","input":"Museum","resolvedCandidates":[{"candidate":"eu","decision":"KEEP","startCodePoint":3}],"sourceFixtureId":"DE-VOLL-NORM-CASE-032"},"st. gallen":{"expectedBraille":"⠎⠞⠄⠀⠛⠁⠇⠇⠑⠝","input":"St. Gallen","resolvedCandidates":[{"candidate":"st","decision":"KEEP","startCodePoint":0}],"sourceFixtureId":"DE-VOLL-NORM-CASE-040"},"st. pauli":{"expectedBraille":"⠎⠞⠄⠀⠏⠡⠇⠊","input":"St. Pauli","resolvedCandidates":[{"candidate":"st","decision":"KEEP","startCodePoint":0},{"candidate":"au","decision":"CONTRACT","startCodePoint":5}],"sourceFixtureId":"DE-VOLL-NORM-CASE-042"},"st. pölten":{"expectedBraille":"⠎⠞⠄⠀⠏⠪⠇⠞⠑⠝","input":"St. Pölten","resolvedCandidates":[{"candidate":"st","decision":"KEEP","startCodePoint":0}],"sourceFixtureId":"DE-VOLL-NORM-CASE-041"},"stammgäste":{"expectedBraille":"⠾⠁⠍⠍⠛⠜⠾⠑","input":"Stammgäste","resolvedCandidates":[{"candidate":"st","decision":"CONTRACT","startCodePoint":0},{"candidate":"st","decision":"CONTRACT","startCodePoint":7}],"sourceFixtureId":"DE-VOLL-NORM-CASE-006"},"ästhet":{"expectedBraille":"⠜⠎⠞⠓⠑⠞","input":"Ästhet","resolvedCandidates":[{"candidate":"st","decision":"KEEP","startCodePoint":1}],"sourceFixtureId":"DE-VOLL-NORM-CASE-037"}} as const;

const WORD_DECISIONS = {"apple pie\u0000ie":{"candidate":"ie","decision":"CONTRACT","input":"apple pie","sourceFixtureId":"DE-VOLL-NORM-CASE-011","sourceKind":"CLOSED_NORMATIVE_DECISION_FIXTURE"},"asche\u0000ch":{"candidate":"ch","decision":"KEEP","input":"Asche","sourceFixtureId":"DE-VOLL-NORM-CASE-005","sourceKind":"NORMATIVE_RENDERING_DERIVATION"},"asche\u0000sch":{"candidate":"sch","decision":"CONTRACT","input":"Asche","sourceFixtureId":"DE-VOLL-NORM-CASE-005","sourceKind":"NORMATIVE_RENDERING_DERIVATION"},"asthma\u0000st":{"candidate":"st","decision":"KEEP","input":"Asthma","sourceFixtureId":"DE-VOLL-NORM-CASE-038","sourceKind":"NORMATIVE_RENDERING_DERIVATION"},"au\u0000au":{"candidate":"au","decision":"CONTRACT","input":"Au","sourceFixtureId":"DE-VOLL-NORM-CASE-015","sourceKind":"NORMATIVE_RENDERING_DERIVATION"},"baum\u0000au":{"candidate":"au","decision":"CONTRACT","input":"Baum","sourceFixtureId":"DE-VOLL-NORM-CASE-001","sourceKind":"NORMATIVE_RENDERING_DERIVATION"},"beige\u0000ei":{"candidate":"ei","decision":"CONTRACT","input":"Beige","sourceFixtureId":"DE-VOLL-NORM-CASE-012","sourceKind":"CLOSED_NORMATIVE_DECISION_FIXTURE"},"beurteilen\u0000eu":{"candidate":"eu","decision":"KEEP","input":"beurteilen","sourceFixtureId":"DE-VOLL-NORM-CASE-023","sourceKind":"CLOSED_NORMATIVE_DECISION_FIXTURE"},"bewusst\u0000st":{"candidate":"st","decision":"KEEP","input":"bewusst","sourceFixtureId":"DE-VOLL-NORM-CASE-048","sourceKind":"NORMATIVE_RENDERING_DERIVATION"},"bruschetta\u0000ch":{"candidate":"ch","decision":"CONTRACT","input":"Bruschetta","sourceFixtureId":"DE-VOLL-NORM-CASE-046","sourceKind":"NORMATIVE_RENDERING_DERIVATION"},"bruschetta\u0000sch":{"candidate":"sch","decision":"KEEP","input":"Bruschetta","sourceFixtureId":"DE-VOLL-NORM-CASE-046","sourceKind":"NORMATIVE_RENDERING_DERIVATION"},"bäume\u0000äu":{"candidate":"äu","decision":"CONTRACT","input":"Bäume","sourceFixtureId":"DE-VOLL-NORM-CASE-007","sourceKind":"NORMATIVE_RENDERING_DERIVATION"},"comicheft\u0000ch":{"candidate":"ch","decision":"KEEP","input":"Comicheft","sourceFixtureId":"DE-VOLL-NORM-CASE-020","sourceKind":"CLOSED_NORMATIVE_DECISION_FIXTURE"},"dienen\u0000ie":{"candidate":"ie","decision":"CONTRACT","input":"dienen","sourceFixtureId":"DE-VOLL-NORM-CASE-009","sourceKind":"CLOSED_NORMATIVE_DECISION_FIXTURE"},"dienstag\u0000st":{"candidate":"st","decision":"KEEP","input":"Dienstag","sourceFixtureId":"DE-VOLL-NORM-CASE-022","sourceKind":"CLOSED_NORMATIVE_DECISION_FIXTURE"},"docht\u0000ch":{"candidate":"ch","decision":"CONTRACT","input":"Docht","sourceFixtureId":"DE-VOLL-NORM-CASE-004","sourceKind":"NORMATIVE_RENDERING_DERIVATION"},"ei\u0000ei":{"candidate":"ei","decision":"CONTRACT","input":"Ei","sourceFixtureId":"DE-VOLL-NORM-CASE-016","sourceKind":"NORMATIVE_RENDERING_DERIVATION"},"eingeigelt\u0000ei":{"candidate":"ei","decision":"KEEP","input":"eingeigelt","sourceFixtureId":"DE-VOLL-NORM-CASE-025","sourceKind":"CLOSED_NORMATIVE_DECISION_FIXTURE"},"eisen\u0000ei":{"candidate":"ei","decision":"CONTRACT","input":"Eisen","sourceFixtureId":"DE-VOLL-NORM-CASE-003","sourceKind":"NORMATIVE_RENDERING_DERIVATION"},"eschatologie\u0000ch":{"candidate":"ch","decision":"CONTRACT","input":"Eschatologie","sourceFixtureId":"DE-VOLL-NORM-CASE-047","sourceKind":"NORMATIVE_RENDERING_DERIVATION"},"eschatologie\u0000ie":{"candidate":"ie","decision":"CONTRACT","input":"Eschatologie","sourceFixtureId":"DE-VOLL-NORM-CASE-047","sourceKind":"NORMATIVE_RENDERING_DERIVATION"},"eschatologie\u0000sch":{"candidate":"sch","decision":"KEEP","input":"Eschatologie","sourceFixtureId":"DE-VOLL-NORM-CASE-047","sourceKind":"NORMATIVE_RENDERING_DERIVATION"},"esther\u0000st":{"candidate":"st","decision":"KEEP","input":"Esther","sourceFixtureId":"DE-VOLL-NORM-CASE-039","sourceKind":"NORMATIVE_RENDERING_DERIVATION"},"familie\u0000ie":{"candidate":"ie","decision":"KEEP","input":"Familie","sourceFixtureId":"DE-VOLL-NORM-CASE-035","sourceKind":"NORMATIVE_RENDERING_DERIVATION"},"geimpft\u0000ei":{"candidate":"ei","decision":"KEEP","input":"geimpft","sourceFixtureId":"DE-VOLL-NORM-CASE-024","sourceKind":"CLOSED_NORMATIVE_DECISION_FIXTURE"},"gässchen\u0000ch":{"candidate":"ch","decision":"CONTRACT","input":"Gässchen","sourceFixtureId":"DE-VOLL-NORM-CASE-043","sourceKind":"CLOSED_NORMATIVE_PARTIAL_FALLBACK"},"gässchen\u0000sch":{"candidate":"sch","decision":"KEEP","input":"Gässchen","sourceFixtureId":"DE-VOLL-NORM-CASE-043","sourceKind":"CLOSED_NORMATIVE_DECISION_FIXTURE"},"heute\u0000eu":{"candidate":"eu","decision":"CONTRACT","input":"heute","sourceFixtureId":"DE-VOLL-NORM-CASE-002","sourceKind":"NORMATIVE_RENDERING_DERIVATION"},"häschen\u0000ch":{"candidate":"ch","decision":"CONTRACT","input":"Häschen","sourceFixtureId":"DE-VOLL-NORM-CASE-044","sourceKind":"CLOSED_NORMATIVE_PARTIAL_FALLBACK"},"häschen\u0000sch":{"candidate":"sch","decision":"KEEP","input":"Häschen","sourceFixtureId":"DE-VOLL-NORM-CASE-044","sourceKind":"CLOSED_NORMATIVE_DECISION_FIXTURE"},"häuschen\u0000ch":{"candidate":"ch","decision":"CONTRACT","input":"Häuschen","sourceFixtureId":"DE-VOLL-NORM-CASE-045","sourceKind":"CLOSED_NORMATIVE_PARTIAL_FALLBACK"},"häuschen\u0000sch":{"candidate":"sch","decision":"KEEP","input":"Häuschen","sourceFixtureId":"DE-VOLL-NORM-CASE-045","sourceKind":"CLOSED_NORMATIVE_DECISION_FIXTURE"},"interview\u0000ie":{"candidate":"ie","decision":"KEEP","input":"Interview","sourceFixtureId":"DE-VOLL-NORM-CASE-029","sourceKind":"CLOSED_NORMATIVE_DECISION_FIXTURE"},"jubiläum\u0000äu":{"candidate":"äu","decision":"KEEP","input":"Jubiläum","sourceFixtureId":"DE-VOLL-NORM-CASE-034","sourceKind":"NORMATIVE_RENDERING_DERIVATION"},"kapernaum\u0000au":{"candidate":"au","decision":"KEEP","input":"Kapernaum","sourceFixtureId":"DE-VOLL-NORM-CASE-031","sourceKind":"NORMATIVE_RENDERING_DERIVATION"},"koffein\u0000ei":{"candidate":"ei","decision":"KEEP","input":"Koffein","sourceFixtureId":"DE-VOLL-NORM-CASE-033","sourceKind":"NORMATIVE_RENDERING_DERIVATION"},"konnie\u0000ie":{"candidate":"ie","decision":"CONTRACT","input":"Konnie","sourceFixtureId":"DE-VOLL-NORM-CASE-010","sourceKind":"CLOSED_NORMATIVE_DECISION_FIXTURE"},"liebe\u0000ie":{"candidate":"ie","decision":"CONTRACT","input":"Liebe","sourceFixtureId":"DE-VOLL-NORM-CASE-008","sourceKind":"NORMATIVE_RENDERING_DERIVATION"},"marseille\u0000ei":{"candidate":"ei","decision":"CONTRACT","input":"Marseille","sourceFixtureId":"DE-VOLL-NORM-CASE-013","sourceKind":"CLOSED_NORMATIVE_DECISION_FIXTURE"},"museum\u0000eu":{"candidate":"eu","decision":"KEEP","input":"Museum","sourceFixtureId":"DE-VOLL-NORM-CASE-032","sourceKind":"NORMATIVE_RENDERING_DERIVATION"},"nordseeinsel\u0000ei":{"candidate":"ei","decision":"KEEP","input":"Nordseeinsel","sourceFixtureId":"DE-VOLL-NORM-CASE-019","sourceKind":"CLOSED_NORMATIVE_DECISION_FIXTURE"},"pierre\u0000ie":{"candidate":"ie","decision":"KEEP","input":"Pierre","sourceFixtureId":"DE-VOLL-NORM-CASE-030","sourceKind":"CLOSED_NORMATIVE_DECISION_FIXTURE"},"premierminister\u0000ie":{"candidate":"ie","decision":"KEEP","input":"Premierminister","sourceFixtureId":"DE-VOLL-NORM-CASE-028","sourceKind":"CLOSED_NORMATIVE_DECISION_FIXTURE"},"regierungschefin\u0000sch":{"candidate":"sch","decision":"KEEP","input":"Regierungschefin","sourceFixtureId":"DE-VOLL-NORM-CASE-021","sourceKind":"CLOSED_NORMATIVE_DECISION_FIXTURE"},"reimport\u0000ei":{"candidate":"ei","decision":"KEEP","input":"Reimport","sourceFixtureId":"DE-VOLL-NORM-CASE-026","sourceKind":"CLOSED_NORMATIVE_DECISION_FIXTURE"},"rio de janeiro\u0000ei":{"candidate":"ei","decision":"CONTRACT","input":"Rio de Janeiro","sourceFixtureId":"DE-VOLL-NORM-CASE-014","sourceKind":"CLOSED_NORMATIVE_DECISION_FIXTURE"},"scherzo\u0000sch":{"candidate":"sch","decision":"KEEP","input":"Scherzo","sourceFixtureId":"DE-VOLL-NORM-CASE-036","sourceKind":"CLOSED_NORMATIVE_DECISION_FIXTURE"},"st. gallen\u0000st":{"candidate":"st","decision":"KEEP","input":"St. Gallen","sourceFixtureId":"DE-VOLL-NORM-CASE-040","sourceKind":"NORMATIVE_RENDERING_DERIVATION"},"st. pauli\u0000au":{"candidate":"au","decision":"CONTRACT","input":"St. Pauli","sourceFixtureId":"DE-VOLL-NORM-CASE-042","sourceKind":"NORMATIVE_RENDERING_DERIVATION"},"st. pauli\u0000st":{"candidate":"st","decision":"KEEP","input":"St. Pauli","sourceFixtureId":"DE-VOLL-NORM-CASE-042","sourceKind":"NORMATIVE_RENDERING_DERIVATION"},"st. pölten\u0000st":{"candidate":"st","decision":"KEEP","input":"St. Pölten","sourceFixtureId":"DE-VOLL-NORM-CASE-041","sourceKind":"NORMATIVE_RENDERING_DERIVATION"},"stammgäste\u0000st":{"candidate":"st","decision":"CONTRACT","input":"Stammgäste","sourceFixtureId":"DE-VOLL-NORM-CASE-006","sourceKind":"NORMATIVE_RENDERING_DERIVATION"},"vietnam\u0000ie":{"candidate":"ie","decision":"KEEP","input":"Vietnam","sourceFixtureId":"DE-VOLL-NORM-CASE-027","sourceKind":"CLOSED_NORMATIVE_DECISION_FIXTURE"},"wegeunfall\u0000eu":{"candidate":"eu","decision":"KEEP","input":"Wegeunfall","sourceFixtureId":"DE-VOLL-NORM-CASE-018","sourceKind":"CLOSED_NORMATIVE_DECISION_FIXTURE"},"wolgaufer\u0000au":{"candidate":"au","decision":"KEEP","input":"Wolgaufer","sourceFixtureId":"DE-VOLL-NORM-CASE-017","sourceKind":"CLOSED_NORMATIVE_DECISION_FIXTURE"},"ästhet\u0000st":{"candidate":"st","decision":"KEEP","input":"Ästhet","sourceFixtureId":"DE-VOLL-NORM-CASE-037","sourceKind":"NORMATIVE_RENDERING_DERIVATION"}} as const;

function normalizeKey(
  value: string,
): string {
  return value
    .normalize("NFC")
    .toLocaleLowerCase("de-DE");
}

function decisionKey(
  input: string,
  candidate: string,
): string {
  return (
    normalizeKey(input)
    + "\u0000"
    + normalizeKey(candidate)
  );
}

function candidateAt(
  chars: readonly string[],
  startCodePoint: number,
): string | null {
  const rest =
    chars
      .slice(startCodePoint)
      .join("")
      .toLocaleLowerCase("de-DE");

  for (
    const candidate
    of AUTOMATIC_CANDIDATES
  ) {
    if (rest.startsWith(candidate)) {
      return candidate;
    }
  }

  return null;
}

// POST15_GERMAN_SENTENCE_COMPOSITION_FIX
//
// Registry decisions are source-backed at word/phrase level. When Office sends
// a larger selection, first keep the existing full-input decision lookup; if
// that key is absent, retry against the lexical word containing the candidate.
function isGermanLexicalCodePoint(
  value: string,
): boolean {
  return /^[\p{L}\p{M}]$/u.test(value);
}

function lexicalContextAt(
  chars: readonly string[],
  startCodePoint: number,
): string | null {
  if (
    startCodePoint < 0
    || startCodePoint >= chars.length
    || !isGermanLexicalCodePoint(
      chars[startCodePoint]!,
    )
  ) {
    return null;
  }

  let start =
    startCodePoint;

  while (
    start > 0
    && isGermanLexicalCodePoint(
      chars[start - 1]!,
    )
  ) {
    start -= 1;
  }

  let end =
    startCodePoint + 1;

  while (
    end < chars.length
    && isGermanLexicalCodePoint(
      chars[end]!,
    )
  ) {
    end += 1;
  }

  return chars
    .slice(start, end)
    .join("");
}

// POST15_GENERAL_VOLLSCHRIFT_RESOLVER_PACK
//
// Resolution precedence:
//   1. exact full plans
//   2. closed source-backed word/candidate decisions
//   3. general lexical rule fallback
//
// The general fallback is algorithmic. It does not add the audited words to a
// dictionary one by one. Existing closed decisions keep higher priority and
// therefore preserve known source-backed exceptions.
function generalRuleDrivenDecisionAt(
  chars: readonly string[],
  startCodePoint: number,
  candidate: string,
): GermanVollschriftCandidateDecision | null {
  if (
    startCodePoint < 0
    || startCodePoint >= chars.length
    || !isGermanLexicalCodePoint(
      chars[startCodePoint]!,
    )
  ) {
    return null;
  }

  let lexicalStart =
    startCodePoint;

  while (
    lexicalStart > 0
    && isGermanLexicalCodePoint(
      chars[lexicalStart - 1]!,
    )
  ) {
    lexicalStart -= 1;
  }

  let lexicalEnd =
    startCodePoint + 1;

  while (
    lexicalEnd < chars.length
    && isGermanLexicalCodePoint(
      chars[lexicalEnd]!,
    )
  ) {
    lexicalEnd += 1;
  }

  const lexicalChars =
    chars.slice(
      lexicalStart,
      lexicalEnd,
    );

  const lexicalWord =
    lexicalChars
      .join("")
      .normalize("NFC")
      .toLocaleLowerCase("de-DE");

  const relativeStart =
    startCodePoint
    - lexicalStart;

  const candidateLength =
    Array.from(candidate).length;

  const actualCandidate =
    lexicalChars
      .slice(
        relativeStart,
        relativeStart
          + candidateLength,
      )
      .join("")
      .normalize("NFC")
      .toLocaleLowerCase("de-DE");

  const normalizedCandidate =
    candidate
      .normalize("NFC")
      .toLocaleLowerCase("de-DE");

  if (
    actualCandidate
    !== normalizedCandidate
  ) {
    return null;
  }

  const previous =
    relativeStart > 0
      ? lexicalChars[
          relativeStart - 1
        ]!
          .normalize("NFC")
          .toLocaleLowerCase("de-DE")
      : null;

  const sstDoubleSPriority =
    normalizedCandidate === "st"
    && previous === "s";

  const sanktAbbreviation =
    normalizedCandidate === "st"
    && lexicalWord === "st";

  const resolution =
    resolveGermanVollschriftCandidate(
      normalizedCandidate,
      {
        boundaryCrosses: false,

        ...(
          normalizedCandidate === "ch"
          || normalizedCandidate === "st"
            ? {}
            : {
                pronunciation:
                  "ELIGIBLE" as const,
              }
        ),

        ...(sstDoubleSPriority
          ? {
              sstDoubleSPriority:
                true,
            }
          : {}),

        ...(sanktAbbreviation
          ? {
              sanktAbbreviation:
                true,
            }
          : {}),
      },
    );

  return resolution.ok
    ? resolution.decision
    : null;
}

function wordDecision(
  input: string,
  candidate: string,
): InternalWordDecision | undefined {
  const key =
    decisionKey(
      input,
      candidate,
    );

  const registry:
    Readonly<Record<string, InternalWordDecision>> =
      WORD_DECISIONS;

  return registry[key];
}

export function resolveGermanVollschriftAutomaticCandidate(
  input: string,
  candidateInput: string,
): GermanVollschriftAutomaticCandidateResult {
  const candidate =
    normalizeKey(
      candidateInput,
    );

  const record =
    wordDecision(
      input,
      candidate,
    );

  if (record === undefined) {
    return Object.freeze({
      ok: false,
      input,
      candidate,
      code:
        "SOURCE_CONTEXT_UNRESOLVED",
      message:
        "No closed source-backed Vollschrift decision is registered for this word/candidate context.",
    });
  }

  return Object.freeze({
    ok: true,
    input,
    candidate:
      record.candidate,
    decision:
      record.decision,
    sourceFixtureId:
      record.sourceFixtureId,
    sourceKind:
      record.sourceKind,
  });
}

export function resolveGermanVollschriftAutomatically(
  input: string,
): GermanVollschriftAutomaticPlanResult {
  const normalized =
    normalizeKey(input);

  const fullPlanRegistry:
    Readonly<Record<string, InternalFullPlan>> =
      FULL_PLANS;

  const exactPlan =
    fullPlanRegistry[
      normalized
    ];

  if (exactPlan !== undefined) {
    return Object.freeze({
      ok: true,
      input,
      sourceFixtureId:
        exactPlan.sourceFixtureId,
      resolvedCandidates:
        Object.freeze(
          exactPlan.resolvedCandidates.map(
            (item) =>
              Object.freeze({
                startCodePoint:
                  item.startCodePoint,
                candidate:
                  item.candidate,
                decision:
                  item.decision,
              }),
          ),
        ),
      provider:
        GERMAN_VOLLSCHRIFT_AUTOMATIC_PROVIDER_KIND,
    });
  }

  const chars =
    Array.from(
      input.normalize("NFC"),
    );

  const plan:
    GermanVollschriftResolvedCandidate[] = [];

  let index = 0;

  while (index < chars.length) {
    const candidate =
      candidateAt(
        chars,
        index,
      );

    if (candidate === null) {
      index += 1;
      continue;
    }

    let resolved =
      resolveGermanVollschriftAutomaticCandidate(
        input,
        candidate,
      );

    if (!resolved.ok) {
      const lexicalContext =
        lexicalContextAt(
          chars,
          index,
        );

      if (
        lexicalContext !== null
        && normalizeKey(
          lexicalContext,
        ) !== normalizeKey(
          input,
        )
      ) {
        resolved =
          resolveGermanVollschriftAutomaticCandidate(
            lexicalContext,
            candidate,
          );
      }
    }

    const generalDecision =
      resolved.ok
        ? null
        : generalRuleDrivenDecisionAt(
            chars,
            index,
            candidate,
          );

    if (
      !resolved.ok
      && generalDecision === null
    ) {
      return Object.freeze({
        ok: false,
        input,
        code:
          "SOURCE_CONTEXT_UNRESOLVED",
        message:
          "Automatic Vollschrift could not resolve this candidate from either the closed source registry or the general lexical rule fallback.",
        startCodePoint:
          index,
        candidate,
        provider:
          GERMAN_VOLLSCHRIFT_AUTOMATIC_PROVIDER_KIND,
      });
    }

    const decision:
      GermanVollschriftCandidateDecision =
        resolved.ok
          ? resolved.decision
          : generalDecision!;

    plan.push(
      Object.freeze({
        startCodePoint:
          index,
        candidate,
        decision,
      }),
    );

    if (decision === "CONTRACT") {
      index +=
        Array.from(candidate).length;
    } else {
      index += 1;
    }
  }

  return Object.freeze({
    ok: true,
    input,
    sourceFixtureId: null,
    resolvedCandidates:
      Object.freeze(
        plan.slice(),
      ),
    provider:
      GERMAN_VOLLSCHRIFT_AUTOMATIC_PROVIDER_KIND,
  });
}

export function translateGermanVollschriftAutomatic(
  input: string,
): GermanVollschriftAutomaticExecutionResult {
  const automatic =
    resolveGermanVollschriftAutomatically(
      input,
    );

  if (!automatic.ok) {
    return Object.freeze({
      ok: false,
      input,
      code:
        automatic.code,
      message:
        automatic.message,
      startCodePoint:
        automatic.startCodePoint,
      candidate:
        automatic.candidate,
    });
  }

  const executed =
    translateGermanVollschriftResolved(
      input,
      automatic.resolvedCandidates,
    );

  if (!executed.ok) {
    return Object.freeze({
      ok: false,
      input,
      code:
        "RESOLVED_EXECUTION_FAILURE",
      message:
        executed.message,
      ...(executed.startCodePoint === undefined
        ? {}
        : {
            startCodePoint:
              executed.startCodePoint,
          }),
      ...(executed.candidate === undefined
        ? {}
        : {
            candidate:
              executed.candidate,
          }),
    });
  }

  return Object.freeze({
    ok: true,
    input,
    normalizedText:
      executed.normalizedText,
    unicodeBraille:
      executed.unicodeBraille,
    cells:
      executed.cells,
    decisionTrace:
      executed.decisionTrace,
    sourceFixtureId:
      automatic.sourceFixtureId,
    runtime:
      Object.freeze({
        language: "de",
        mode: "vollschrift",
        executable: true,
        automaticProviderResolutionExecutable:
          true,
        provider:
          GERMAN_VOLLSCHRIFT_AUTOMATIC_PROVIDER_KIND,
        providerCoverage:
          "CLOSED_NORMATIVE_SOURCE_REGISTRY",
        unknownContextPolicy:
          "STRUCTURED_UNRESOLVED",
        runtimeRegistered: false,
      }),
  });
}
