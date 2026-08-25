/* PHASE16_PACK_B_MUSICXML
 * MusicXML -> existing encodeStatefulScore bridge.
 * Phase 16.5A adds standards-backed single-staff full-measure H4C polyphony.
 * Phase 16.5B adds frozen single-section terminal H4D part-measure polyphony.
 * Phase 16.5D3 adds a narrow BANA Table 22(A) single-articulation subset.
 * Phase 16.5 Unified Closure adds bounded grace, short-slur, repeat/volta,
 * independent dynamics, and measure-boundary key-change subsets.
 * Unsupported advanced semantics fail closed and are never silently discarded.
 */
import {
  adaptMusicXmlScore,
  type MusicXmlAdaptedMeasure,
  type MusicXmlAdaptedNote,
  type MusicXmlAdaptedPart,
} from "./musicxml-adapter.js";
import { loadMusicXmlFromMxl } from "./musicxml-mxl.js";
import { parseMusicXmlBytes, parseMusicXmlText } from "./musicxml-parser.js";
import {
  resolveMusicTerminology,
  type MusicTerminologyResolution,
} from "./music-terminology.js";
import type {
  MusicXmlFraction, MusicXmlMetronome, MusicXmlMxlFailureCode, MusicXmlParserFailureCode, MusicXmlScore,
} from "./musicxml-types.js";
import type { MusicValue } from "./music-braille-atomic-encoder.js";
import {
  MIDI_CHORD_PROFILE_ID, MIDI_STATEFUL_PROFILE_ID, KEYBOARD_DIRECTIONAL_CHORD_PROFILE_ID, encodeStatefulScore,
} from "./music-braille-stateful-encoder.js";
import type {
  StatefulArticulation, StatefulChordEvent, StatefulDynamic,
  StatefulFullMeasureInAccordEvent, StatefulGrace, StatefulInAccordAction,
  StatefulLinearMusicEvent, StatefulMusicEvent,
  StatefulPartMeasureInAccordEvent,
  StatefulKeyboardParallelEvent,
  StatefulNoteEvent, StatefulRestEvent, StatefulScoreEmission,
  StatefulWordExpression,
  StatefulScoreInput, StatefulWrittenPitch,
} from "./music-braille-stateful-encoder.js";

export const MUSICXML_TO_BRAILLE_BRIDGE_ID =
  "MUSICXML_TO_EXISTING_MBC2015_STATEFUL_V1" as const;
export const MUSICXML_PART_TRANSPORT_LAYOUT_ID =
  "MUSICXML_PARTS_NEWLINE_TRANSPORT_V1" as const;

export type MusicXmlToBrailleFailureCode =
  | MusicXmlParserFailureCode | MusicXmlMxlFailureCode
  | "NO_MUSICXML_PARTS" | "INVALID_SOURCE_STRUCTURE" | "UNSUPPORTED_SOURCE_STRUCTURE"
  | "UNSUPPORTED_CURSOR_OPERATION" | "UNSUPPORTED_POLYPHONY" | "UNSUPPORTED_GAP"
  | "UNSUPPORTED_MULTI_STAFF_POLYPHONY" | "UNSUPPORTED_CROSSED_VOICES"
  | "UNSUPPORTED_POLYPHONY_REST_GAP"
  | "UNSUPPORTED_NONTERMINAL_PART_MEASURE"
  | "UNSUPPORTED_GRACE" | "UNSUPPORTED_SLUR" | "UNSUPPORTED_ARTICULATION"
  | "UNSUPPORTED_DYNAMICS" | "UNSUPPORTED_DIRECTION_WORDS"
  | "UNSUPPORTED_DIRECTION_WORD_GLYPH"
  | "UNSUPPORTED_DIRECTION_WORD_CONTINUATION"
  | "UNSUPPORTED_DIRECTION_WORD_TEXT"
  | "UNSUPPORTED_DIRECTION_WORD_PLACEMENT"
  | "UNSUPPORTED_DIRECTION_STRUCTURAL_TERMINOLOGY"
  | "UNSUPPORTED_DIRECTION_TYPE"
  | "UNSUPPORTED_WEDGE" | "UNSUPPORTED_PEDAL" | "UNSUPPORTED_METRONOME"
  | "UNSUPPORTED_REPEAT" | "UNSUPPORTED_ENDING" | "UNSUPPORTED_KEY_CHANGE"
  | "UNSUPPORTED_KEY_CANCELLATION"
  | "UNSUPPORTED_DURATION" | "UNSUPPORTED_TUPLET" | "UNSUPPORTED_WRITTEN_PITCH"
  | "INVALID_CHORD" | "PARTIAL_CHORD_TIE" | "MUSIC_BRAILLE_ENCODING_FAILED";

export type MusicXmlToBrailleFailureStage =
  | "container" | "parser" | "adapter" | "bridge" | "encoder";

export interface MusicXmlToBrailleDiagnostic {
  readonly code:
    | "SOURCE_PRESERVED_NOT_EMITTED" | "CLEF_PRESERVED_NOT_EMITTED"
    | "TEMPO_PRESERVED_NOT_EMITTED" | "SOUND_DYNAMICS_PRESERVED_NOT_EMITTED"
    | "KEY_SIGNATURE_ABSENT_ENGINE_DEFAULT_ZERO"
    | "METER_ABSENT_NOT_SYNTHESIZED" | "ENGINE_PROFILE_REUSED"
    | "PART_MEASURE_IN_ACCORD_DERIVED"
    | "KEYBOARD_DOMINANT_VOICE_PROFILE_APPLIED"
    | "ENDING_TERMINATION_PRESERVED_NOT_EMITTED"
    | "KEYBOARD_STRUCTURAL_REST_ONLY_VOICE"
    | "OCTAVE_SHIFT_NONFACSIMILE_NOT_EMITTED";
  readonly message: string;
  readonly partId?: string;
  readonly measureIndex?: number;
}

export interface MusicXmlBraillePartEmission {
  readonly partId: string;
  readonly partName?: string;
  readonly brf: string;
  readonly unicodeBraille: string;
  readonly engineProfileId: typeof MIDI_STATEFUL_PROFILE_ID;
  readonly chordProfileId:
    | typeof MIDI_CHORD_PROFILE_ID
    | typeof KEYBOARD_DIRECTIONAL_CHORD_PROFILE_ID;
  readonly profileDisclosureRequired: true;
  readonly trace: StatefulScoreEmission["trace"];
}

export interface MusicXmlToBrailleSuccess {
  readonly ok: true;
  readonly bridgeId: typeof MUSICXML_TO_BRAILLE_BRIDGE_ID;
  readonly transportLayoutId: typeof MUSICXML_PART_TRANSPORT_LAYOUT_ID;
  readonly parts: readonly MusicXmlBraillePartEmission[];
  readonly brf: string;
  readonly unicodeBraille: string;
  readonly diagnostics: readonly MusicXmlToBrailleDiagnostic[];
}

export interface MusicXmlToBrailleFailure {
  readonly ok: false;
  readonly code: MusicXmlToBrailleFailureCode;
  readonly stage: MusicXmlToBrailleFailureStage;
  readonly message: string;
  readonly partId?: string;
  readonly measureIndex?: number;
}

export type MusicXmlToBrailleResult = MusicXmlToBrailleSuccess | MusicXmlToBrailleFailure;

interface DurationProjection {
  readonly value: MusicValue;
  readonly augmentationDots: number;
  readonly triplet: boolean;
}
interface ProjectedEvent {
  readonly event: StatefulLinearMusicEvent;
  readonly triplet: boolean;
  readonly start: boolean;
  readonly stop: boolean;
  readonly number?: number;
}

class BridgeError extends Error {
  readonly code: MusicXmlToBrailleFailureCode;
  readonly partId: string | undefined;
  readonly measureIndex: number | undefined;
  constructor(
    code: MusicXmlToBrailleFailureCode,
    message: string,
    partId?: string,
    measureIndex?: number,
  ) {
    super(message);
    this.name = "MusicXmlBridgeError";
    this.code = code;
    this.partId = partId;
    this.measureIndex = measureIndex;
  }
}

function failure(
  code: MusicXmlToBrailleFailureCode,
  stage: MusicXmlToBrailleFailureStage,
  message: string,
  details: Readonly<{ partId?: string; measureIndex?: number }> = {},
): MusicXmlToBrailleFailure {
  return Object.freeze({ ok: false, code, stage, message, ...details });
}

function gcd(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y !== 0) { const t = x % y; x = y; y = t; }
  return x === 0 ? 1 : x;
}
function cmp(a: MusicXmlFraction, b: MusicXmlFraction): number {
  return a.numerator * b.denominator - b.numerator * a.denominator;
}
function add(a: MusicXmlFraction, b: MusicXmlFraction): MusicXmlFraction {
  const n = a.numerator * b.denominator + b.numerator * a.denominator;
  const d = a.denominator * b.denominator;
  if (n === 0) return Object.freeze({ numerator: 0, denominator: 1 });
  const g = gcd(n, d);
  return Object.freeze({ numerator: n / g, denominator: d / g });
}
function key(f: MusicXmlFraction): string { return `${f.numerator}/${f.denominator}`; }

const NORMAL: Readonly<Record<string, Readonly<{ value: MusicValue; dots: number }>>> =
Object.freeze({
  "6/1": { value: "whole", dots: 1 }, "4/1": { value: "whole", dots: 0 },
  "3/1": { value: "half", dots: 1 }, "2/1": { value: "half", dots: 0 },
  "3/2": { value: "quarter", dots: 1 }, "1/1": { value: "quarter", dots: 0 },
  "3/4": { value: "eighth", dots: 1 }, "1/2": { value: "eighth", dots: 0 },
  "3/8": { value: "16th", dots: 1 }, "1/4": { value: "16th", dots: 0 },
  "3/16": { value: "32nd", dots: 1 }, "1/8": { value: "32nd", dots: 0 },
  "3/32": { value: "64th", dots: 1 }, "1/16": { value: "64th", dots: 0 },
  "1/32": { value: "128th", dots: 0 },
});
const TRIPLET: Readonly<Record<string, MusicValue>> = Object.freeze({
  "4/3": "half", "2/3": "quarter", "1/3": "eighth",
  "1/6": "16th", "1/12": "32nd",
});
const GRACE_TYPE_VALUES: Readonly<Record<string, MusicValue>> = Object.freeze({
  whole: "whole",
  half: "half",
  quarter: "quarter",
  eighth: "eighth",
  "16th": "16th",
  "32nd": "32nd",
  "64th": "64th",
  "128th": "128th",
});

function duration(
  note: MusicXmlAdaptedNote,
  partId: string,
  measureIndex: number,
): DurationProjection {
  if (note.dots > 1) {
    throw new BridgeError(
      "UNSUPPORTED_DURATION",
      `Pack B supports at most one augmentation dot; got ${note.dots}.`,
      partId, measureIndex,
    );
  }

  // PHASE16_R6A_MUSICXML_MEASURE_REST
  //
  // rest@measure=yes is authoritative notated-rest semantics. Its numeric
  // duration remains untouched for source timing / cursor arithmetic, while
  // the shared Braille Music engine receives the BANA whole-rest value.
  //
  // This first compatibility slice stays deliberately narrow: no grace,
  // tuplets/time-modification, augmentation dots, chord flag, or a printed
  // source type other than an optional whole-rest type.
  if (note.measureRest === true) {
    if (note.kind !== "rest") {
      throw new BridgeError(
        "INVALID_SOURCE_STRUCTURE",
        "MusicXML measure-rest semantics may only be attached to a rest.",
        partId,
        measureIndex,
      );
    }

    if (
      note.grace
      || note.chord
      || note.dots !== 0
      || note.timeModification !== undefined
      || note.tuplets.length > 0
      || (
        note.sourceType !== undefined
        && note.sourceType !== "whole"
      )
    ) {
      throw new BridgeError(
        "UNSUPPORTED_DURATION",
        "MusicXML complete-measure rest has conflicting printed duration semantics outside the Phase 16.R6A subset.",
        partId,
        measureIndex,
      );
    }

    return Object.freeze({
      value: "whole",
      augmentationDots: 0,
      triplet: false,
    });
  }

  if (note.grace) {
    if (note.timeModification !== undefined || note.tuplets.length > 0) {
      throw new BridgeError(
        "UNSUPPORTED_GRACE",
        "Grace notes combined with tuplets/time-modification are deferred in the Phase 16.5 closure profile.",
        partId,
        measureIndex,
      );
    }
    const value =
      note.sourceType !== undefined
        ? GRACE_TYPE_VALUES[note.sourceType]
        : undefined;
    if (value === undefined) {
      throw new BridgeError(
        "UNSUPPORTED_GRACE",
        `Grace note requires a supported MusicXML <type>; got ${String(note.sourceType)}.`,
        partId,
        measureIndex,
      );
    }
    return Object.freeze({
      value,
      augmentationDots: note.dots,
      triplet: false,
    });
  }

  if (note.timeModification !== undefined) {
    const tm = note.timeModification;
    if (tm.actualNotes !== 3 || tm.normalNotes !== 2 || tm.normalDots !== 0 || note.dots !== 0) {
      throw new BridgeError(
        "UNSUPPORTED_TUPLET",
        "Pack B supports only undotted 3:2 triplets.",
        partId, measureIndex,
      );
    }
    const value = TRIPLET[key(note.durationQuarter)];
    if (value === undefined) {
      throw new BridgeError(
        "UNSUPPORTED_DURATION",
        `Unsupported triplet duration ${key(note.durationQuarter)} quarter notes.`,
        partId, measureIndex,
      );
    }
    return Object.freeze({ value, augmentationDots: 0, triplet: true });
  }
  if (note.tuplets.length > 0) {
    throw new BridgeError(
      "UNSUPPORTED_TUPLET",
      "Tuplet notation without supported 3:2 time-modification is not representable.",
      partId, measureIndex,
    );
  }
  const mapped = NORMAL[key(note.durationQuarter)];
  if (mapped === undefined || mapped.dots !== note.dots) {
    throw new BridgeError(
      "UNSUPPORTED_DURATION",
      `Unsupported atomic duration ${key(note.durationQuarter)} with ${note.dots} dot(s).`,
      partId, measureIndex,
    );
  }
  return Object.freeze({
    value: mapped.value,
    augmentationDots: mapped.dots,
    triplet: false,
  });
}

const PC = Object.freeze({ C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 });

function pitch(
  note: MusicXmlAdaptedNote,
  partId: string,
  measureIndex: number,
): Readonly<{
  midiPitch: number;
  written?: StatefulWrittenPitch;
}> {
  const p = note.metadata.writtenPitch;

  if (p === undefined) {
    throw new BridgeError(
      "UNSUPPORTED_WRITTEN_PITCH",
      "Pitched MusicXML note has no preserved pitch.",
      partId,
      measureIndex,
    );
  }

  if (!Number.isInteger(p.alter)) {
    throw new BridgeError(
      "UNSUPPORTED_WRITTEN_PITCH",
      `MusicXML microtonal/non-integer alter ${p.alter} is outside the current discrete-pitch Braille profile.`,
      partId,
      measureIndex,
    );
  }

  if (
    !Number.isInteger(p.octave)
    || p.octave < 0
    || p.octave > 8
  ) {
    throw new BridgeError(
      "UNSUPPORTED_WRITTEN_PITCH",
      `MusicXML octave must be in 0..8; got ${p.octave}.`,
      partId,
      measureIndex,
    );
  }

  const midiPitch =
    (p.octave + 1) * 12
    + PC[p.step]
    + p.alter;

  if (
    !Number.isInteger(midiPitch)
    || midiPitch < 0
    || midiPitch > 127
  ) {
    throw new BridgeError(
      "UNSUPPORTED_WRITTEN_PITCH",
      `MusicXML pitch ${p.step}${p.alter >= 0 ? "+" : ""}${p.alter}/${p.octave} maps outside MIDI 0..127.`,
      partId,
      measureIndex,
    );
  }

  if (
    p.alter >= -2
    && p.alter <= 2
  ) {
    const accidental =
      p.alter as -2 | -1 | 0 | 1 | 2;

    return Object.freeze({
      midiPitch,
      written: Object.freeze({
        step: p.step,
        accidental,
        scientificOctave: p.octave,
      }),
    });
  }

  // PHASE16_R3_V7_INTEGER_ALTER_NORMALIZATION
  // MusicXML <alter> is a semitone count and is not schema-limited
  // to +/-2. Preserve exact sounding pitch; omit only the written
  // override that the current Braille accidental surface cannot
  // represent. The existing stateful key-aware spelling path is reused.
  return Object.freeze({
    midiPitch,
  });
}

function notePolicy(note: MusicXmlAdaptedNote, partId: string, measureIndex: number): void {
  if (note.grace && note.kind === "rest") {
    throw new BridgeError(
      "UNSUPPORTED_GRACE",
      "Grace rests are outside the frozen Phase 16.5 appoggiatura subset.",
      partId,
      measureIndex,
    );
  }
}

function supportedArticulations(
  note: MusicXmlAdaptedNote,
  partId: string,
  measureIndex: number,
): readonly StatefulArticulation[] | undefined {
  const values = note.metadata.articulations ?? [];
  if (values.length === 0) return undefined;

  if (note.kind === "rest") {
    throw new BridgeError(
      "UNSUPPORTED_ARTICULATION",
      "BANA Table 22(A) note articulations are not emitted on rests in Phase 16.5D3.",
      partId,
      measureIndex,
    );
  }

  if (values.length !== 1) {
    throw new BridgeError(
      "UNSUPPORTED_ARTICULATION",
      "Phase 16.5D3 supports exactly one explicit MusicXML articulation per note/chord.",
      partId,
      measureIndex,
    );
  }

  const value = values[0];
  if (
    value !== "staccato"
    && value !== "staccatissimo"
    && value !== "accent"
    && value !== "tenuto"
  ) {
    throw new BridgeError(
      "UNSUPPORTED_ARTICULATION",
      `MusicXML articulation ${String(value)} is preserved but is outside the frozen Phase 16.5D3 BANA subset.`,
      partId,
      measureIndex,
    );
  }

  return Object.freeze([value]);
}


interface EventProjectionContext {
  readonly grace?: StatefulGrace;
  readonly dynamic?: StatefulDynamic;
  readonly wordExpressions?: readonly StatefulWordExpression[];
  readonly slurAfter?: true | 2;
}

interface LinearSourceGroup {
  readonly base: MusicXmlAdaptedNote;
  readonly members: readonly MusicXmlAdaptedNote[];
}

function linearSourceGroups(
  measure: MusicXmlAdaptedMeasure,
  partId: string,
): readonly LinearSourceGroup[] {
  const groups: LinearSourceGroup[] = [];
  let index = 0;

  while (index < measure.notes.length) {
    const base = measure.notes[index]!;
    if (base.chord) {
      throw new BridgeError(
        "INVALID_CHORD",
        "Chord continuation has no root note.",
        partId,
        measure.index,
      );
    }

    const members: MusicXmlAdaptedNote[] = [base];
    let next = index + 1;
    while (next < measure.notes.length && measure.notes[next]!.chord) {
      const member = measure.notes[next]!;
      if (cmp(member.onsetQuarter, base.onsetQuarter) !== 0) {
        throw new BridgeError(
          "INVALID_CHORD",
          "Chord continuation has different onset.",
          partId,
          measure.index,
        );
      }
      members.push(member);
      next += 1;
    }

    groups.push(Object.freeze({
      base,
      members: Object.freeze(members),
    }));
    index = next;
  }

  return Object.freeze(groups);
}

function graceStyles(
  groups: readonly LinearSourceGroup[],
  partId: string,
  measureIndex: number,
): ReadonlyMap<number, StatefulGrace> {
  const result = new Map<number, StatefulGrace>();
  let index = 0;

  while (index < groups.length) {
    const group = groups[index]!;
    if (!group.base.grace) {
      if (group.members.some((member) => member.grace)) {
        throw new BridgeError(
          "UNSUPPORTED_GRACE",
          "Grace status differs within a chord; Phase 16.5 does not infer chord appoggiatura topology.",
          partId,
          measureIndex,
        );
      }
      index += 1;
      continue;
    }

    if (group.members.length !== 1) {
      throw new BridgeError(
        "UNSUPPORTED_GRACE",
        "Chord appoggiaturas are preserved but deferred from the Phase 16.5 executable subset.",
        partId,
        measureIndex,
      );
    }

    let end = index;
    while (
      end + 1 < groups.length
      && groups[end + 1]!.base.grace
      && groups[end + 1]!.members.length === 1
    ) {
      end += 1;
    }

    const run = groups.slice(index, end + 1);
    if (run.length >= 4) {
      throw new BridgeError(
        "UNSUPPORTED_GRACE",
        "Four or more successive appoggiaturas require the BANA doubled-sign procedure, which remains fail-closed in Phase 16.5.",
        partId,
        measureIndex,
      );
    }

    const following = groups[end + 1];
    if (following === undefined || following.base.grace) {
      throw new BridgeError(
        "UNSUPPORTED_GRACE",
        "Appoggiatura run must embellish a following regular note inside the same MusicXML measure.",
        partId,
        measureIndex,
      );
    }

    for (const candidate of run) {
      const note = candidate.base;
      // PHASE16_R7_APPOGGIATURA_SLUR
      //
      // BANA MBC 2015 13.9: in nonfacsimile transcription,
      // the short independent slurs normally printed with
      // appoggiaturas are shown as ordinary slurs. Therefore
      // slur metadata itself is not a reason to reject an
      // otherwise admitted appoggiatura. Ties, tuplets /
      // time-modification and articulations remain fail-closed.
      if (
        note.ties.length > 0
        || note.tuplets.length > 0
        || note.timeModification !== undefined
        || (note.metadata.articulations?.length ?? 0) > 0
      ) {
        throw new BridgeError(
          "UNSUPPORTED_GRACE",
          "Grace notes combined with ties, tuplets/time-modification, or articulations remain outside the bounded appoggiatura profile.",
          partId,
          measureIndex,
        );
      }

      const style: StatefulGrace =
        run.length > 1
          ? "short"
          : note.graceSlash === true
            ? "short"
            : "long";
      result.set(note.sourceOrder, style);
    }

    index = end + 1;
  }

  return result;
}

// PHASE16_R7_DIRECTION_MARKS
//
// Real-score compatibility profile:
// - explicit MusicXML staff 1 or 2
// - damper pedal: matched start -> stop only
// - wedge: matched crescendo/diminuendo -> stop only
// - source onset is preserved; engraving x/y does not become timing
// - other pedal/wedge semantics remain fail-closed
interface DirectionMarkPlan {
  readonly pedalDown?: true;
  readonly pedalUp?: true;
  readonly hairpinStart?: "crescendo" | "diminuendo";
  readonly hairpinStop?: "crescendo" | "diminuendo";
}

interface DirectionMarkRef {
  readonly measure: MusicXmlAdaptedMeasure;
  readonly onset: MusicXmlFraction;
  readonly staff: number;
  readonly type: string;
  readonly number: number;
  // PHASE16_R8_PEDAL_BURST_NORMALIZATION
  readonly line?: string;
  readonly sourceOrder: number;
}

const DIRECTION_MARK_PLAN =
  new WeakMap<
    MusicXmlAdaptedNote,
    DirectionMarkPlan
  >();

function directionMarkPosition(
  ref: DirectionMarkRef,
): string {
  return (
    `${ref.measure.index}|`
    + `${key(ref.onset)}|`
    + `${ref.staff}`
  );
}

function mergeDirectionMarkPlan(
  note: MusicXmlAdaptedNote,
  patch: DirectionMarkPlan,
  partId: string,
  measureIndex: number,
): void {
  const previous: DirectionMarkPlan =
    DIRECTION_MARK_PLAN.get(note)
    ?? Object.freeze({});

  if (
    previous.hairpinStart !== undefined
    && patch.hairpinStart !== undefined
    && previous.hairpinStart
      !== patch.hairpinStart
  ) {
    throw new BridgeError(
      "UNSUPPORTED_WEDGE",
      "Conflicting hairpin starts target the same MusicXML event.",
      partId,
      measureIndex,
    );
  }

  if (
    previous.hairpinStop !== undefined
    && patch.hairpinStop !== undefined
    && previous.hairpinStop
      !== patch.hairpinStop
  ) {
    throw new BridgeError(
      "UNSUPPORTED_WEDGE",
      "Conflicting hairpin stops target the same MusicXML event.",
      partId,
      measureIndex,
    );
  }

  DIRECTION_MARK_PLAN.set(
    note,
    Object.freeze({
      ...previous,
      ...patch,
    }),
  );
}

// PHASE16_R8_TEMPORAL_DIRECTION_TARGET
// Direction timing is primary. MusicXML staff remains a preference, not a
// license to move the mark to a later musical time when cross-staff notation
// places the nearest event on the other staff.
function nextDirectionTarget(
  part: MusicXmlAdaptedPart,
  ref: DirectionMarkRef,
  partId: string,
  code:
    | "UNSUPPORTED_PEDAL"
    | "UNSUPPORTED_WEDGE",
): MusicXmlAdaptedNote {
  for (
    let measureIndex = ref.measure.index;
    measureIndex < part.measures.length;
    measureIndex += 1
  ) {
    const measure =
      part.measures[measureIndex];

    if (measure === undefined) continue;

    const candidates =
      measure.notes
        .filter(
          (note) =>
            !note.chord
            && !note.grace
            && (
              measure.index !== ref.measure.index
              || cmp(note.onsetQuarter, ref.onset) >= 0
            ),
        )
        .slice()
        .sort(
          (a, b) =>
            cmp(a.onsetQuarter, b.onsetQuarter)
            || a.sourceOrder - b.sourceOrder,
        );

    const nearest = candidates[0];

    if (nearest === undefined) {
      continue;
    }

    const sameTime =
      candidates.filter(
        (candidate) =>
          cmp(
            candidate.onsetQuarter,
            nearest.onsetQuarter,
          ) === 0,
      );

    return (
      sameTime.find(
        (candidate) =>
          candidate.metadata.staff === ref.staff,
      )
      ?? sameTime[0]!
    );
  }

  throw new BridgeError(
    code,
    "No following non-grace base event exists for the MusicXML direction mark.",
    partId,
    ref.measure.index,
  );
}

function previousDirectionTarget(
  part: MusicXmlAdaptedPart,
  ref: DirectionMarkRef,
  partId: string,
  code:
    | "UNSUPPORTED_PEDAL"
    | "UNSUPPORTED_WEDGE",
): MusicXmlAdaptedNote {
  for (
    let measureIndex = ref.measure.index;
    measureIndex >= 0;
    measureIndex -= 1
  ) {
    const measure =
      part.measures[measureIndex];

    if (measure === undefined) continue;

    const candidates =
      measure.notes
        .filter((note) => {
          if (note.chord || note.grace) {
            return false;
          }

          return (
            measure.index !== ref.measure.index
            || cmp(
              add(
                note.onsetQuarter,
                note.durationQuarter,
              ),
              ref.onset,
            ) <= 0
          );
        })
        .slice()
        .sort((a, b) => {
          const endA =
            add(a.onsetQuarter, a.durationQuarter);

          const endB =
            add(b.onsetQuarter, b.durationQuarter);

          return (
            cmp(endA, endB)
            || cmp(a.onsetQuarter, b.onsetQuarter)
            || a.sourceOrder - b.sourceOrder
          );
        });

    const nearest =
      candidates[candidates.length - 1];

    if (nearest === undefined) {
      continue;
    }

    const nearestEnd =
      add(
        nearest.onsetQuarter,
        nearest.durationQuarter,
      );

    const sameTime =
      candidates.filter(
        (candidate) =>
          cmp(
            add(
              candidate.onsetQuarter,
              candidate.durationQuarter,
            ),
            nearestEnd,
          ) === 0,
      );

    const sameStaff =
      sameTime.filter(
        (candidate) =>
          candidate.metadata.staff === ref.staff,
      );

    return (
      sameStaff[sameStaff.length - 1]
      ?? sameTime[sameTime.length - 1]!
    );
  }

  throw new BridgeError(
    code,
    "No preceding completed non-grace base event exists for the MusicXML direction mark.",
    partId,
    ref.measure.index,
  );
}

function sortedDirectionMarks(
  refs: readonly DirectionMarkRef[],
): readonly DirectionMarkRef[] {
  return Object.freeze(
    refs.slice().sort((a, b) => {
      const measureOrder =
        a.measure.index - b.measure.index;

      if (measureOrder !== 0) {
        return measureOrder;
      }

      const onsetOrder =
        cmp(a.onset, b.onset);

      if (onsetOrder !== 0) {
        return onsetOrder;
      }

      // At an exact retake point, close the active
      // pedal/wedge before opening the next one.
      const aStop =
        a.type === "stop" ? 0 : 1;

      const bStop =
        b.type === "stop" ? 0 : 1;

      return (
        aStop - bStop
        || a.sourceOrder - b.sourceOrder
      );
    }),
  );
}

function uniqueDirectionMarks(
  refs: readonly DirectionMarkRef[],
): readonly DirectionMarkRef[] {
  const seen = new Set<string>();
  const result: DirectionMarkRef[] = [];

  for (const ref of refs) {
    const id =
      `${directionMarkPosition(ref)}|`
      + `${ref.type}|${ref.number}`;

    if (seen.has(id)) continue;

    seen.add(id);
    result.push(ref);
  }

  return Object.freeze(result);
}

function planPartDirectionMarks(
  part: MusicXmlAdaptedPart,
  partId: string,
): void {
  const pedalRefs: DirectionMarkRef[] = [];
  const wedgeRefs: DirectionMarkRef[] = [];

  for (const measure of part.measures) {
    for (
      const [sourceOrder, item]
      of measure.sourceItems.entries()
    ) {
      if (item.kind !== "direction") {
        continue;
      }

      if (
        item.pedals.length === 0
        && item.wedges.length === 0
      ) {
        continue;
      }

      if (
        item.staff !== 1
        && item.staff !== 2
      ) {
        throw new BridgeError(
          item.pedals.length > 0
            ? "UNSUPPORTED_PEDAL"
            : "UNSUPPORTED_WEDGE",
          "Direction-mark profile requires explicit MusicXML staff 1 or 2.",
          partId,
          measure.index,
        );
      }

      if (item.onsetQuarter === undefined) {
        throw new BridgeError(
          item.pedals.length > 0
            ? "UNSUPPORTED_PEDAL"
            : "UNSUPPORTED_WEDGE",
          "Direction mark has no preserved MusicXML onset.",
          partId,
          measure.index,
        );
      }

      for (const pedal of item.pedals) {
        const type = pedal.type ?? "";

        if (
          type !== "start"
          && type !== "stop"
        ) {
          throw new BridgeError(
            "UNSUPPORTED_PEDAL",
            `MusicXML pedal type ${JSON.stringify(type)} remains outside the matched damper start/stop profile.`,
            partId,
            measure.index,
          );
        }

        pedalRefs.push(
          Object.freeze({
            measure,
            onset: item.onsetQuarter,
            staff: item.staff,
            type,
            number: pedal.number ?? 1,
            ...(pedal.line !== undefined
              ? { line: pedal.line }
              : {}),
            sourceOrder,
          }),
        );
      }

      for (const wedge of item.wedges) {
        const type = wedge.type ?? "";

        if (
          type !== "crescendo"
          && type !== "diminuendo"
          && type !== "stop"
        ) {
          throw new BridgeError(
            "UNSUPPORTED_WEDGE",
            `MusicXML wedge type ${JSON.stringify(type)} remains outside the crescendo/diminuendo/stop profile.`,
            partId,
            measure.index,
          );
        }

        if (
          wedge.attributes["niente"]
            === "yes"
          || wedge.attributes["line-type"]
            === "dashed"
        ) {
          throw new BridgeError(
            "UNSUPPORTED_WEDGE",
            "Niente or dashed MusicXML wedge remains outside the bounded profile.",
            partId,
            measure.index,
          );
        }

        wedgeRefs.push(
          Object.freeze({
            measure,
            onset: item.onsetQuarter,
            staff: item.staff,
            type,
            number: wedge.number ?? 1,
            sourceOrder,
          }),
        );
      }
    }
  }

  // PHASE16_R8_PEDAL_BURST_NORMALIZATION
  //
  // Compatibility normalization for redundant line=yes pedal starts
  // followed by co-located terminal stops at the end of one measure.
  // This shape is emitted by some interchange exporters. It represents
  // one continuous line span for Braille import; ordinary nested or
  // alternating pedal semantics remain fail-closed.
  function normalizePedalImportBurst(
    lane: readonly DirectionMarkRef[],
  ): readonly DirectionMarkRef[] {
    const byMeasure =
      new Map<number, DirectionMarkRef[]>();

    for (const ref of lane) {
      const group =
        byMeasure.get(ref.measure.index)
        ?? [];

      group.push(ref);
      byMeasure.set(
        ref.measure.index,
        group,
      );
    }

    const normalized:
      DirectionMarkRef[] = [];

    for (const refs of byMeasure.values()) {
      const starts =
        refs.filter(
          (ref) => ref.type === "start",
        );

      const stops =
        refs.filter(
          (ref) => ref.type === "stop",
        );

      const contentEnd =
        refs[0]?.measure.notes
          .filter(
            (note) =>
              !note.grace
              && !note.chord,
          )
          .reduce<MusicXmlFraction | undefined>(
            (latest, note) => {
              const end =
                add(
                  note.onsetQuarter,
                  note.durationQuarter,
                );

              return (
                latest === undefined
                || cmp(end, latest) > 0
              )
                ? end
                : latest;
            },
            undefined,
          );

      const terminalStop =
        stops[0]?.onset;

      const isBoundedBurst =
        starts.length >= 2
        && stops.length >= 1
        && contentEnd !== undefined
        && terminalStop !== undefined
        && refs.every(
          (ref) =>
            ref.number === 1
            && ref.line === "yes",
        )
        && stops.every(
          (ref) =>
            cmp(
              ref.onset,
              terminalStop,
            ) === 0,
        )
        && cmp(
          terminalStop,
          contentEnd,
        ) === 0
        && starts.every(
          (ref) =>
            cmp(
              ref.onset,
              terminalStop,
            ) < 0,
        );

      if (!isBoundedBurst) {
        normalized.push(...refs);
        continue;
      }

      const earliestStart =
        starts
          .slice()
          .sort(
            (a, b) =>
              cmp(a.onset, b.onset)
              || a.sourceOrder
                - b.sourceOrder,
          )[0]!;

      const latestStop =
        stops
          .slice()
          .sort(
            (a, b) =>
              cmp(a.onset, b.onset)
              || a.sourceOrder
                - b.sourceOrder,
          )
          .at(-1)!;

      normalized.push(
        earliestStart,
        latestStop,
      );
    }

    return sortedDirectionMarks(
      Object.freeze(normalized),
    );
  }

  const pedalByStaff =
    new Map<number, DirectionMarkRef[]>();

  for (
    const ref of uniqueDirectionMarks(
      sortedDirectionMarks(pedalRefs),
    )
  ) {
    const lane =
      pedalByStaff.get(ref.staff)
      ?? [];

    lane.push(ref);
    pedalByStaff.set(ref.staff, lane);
  }

  for (const rawLane of pedalByStaff.values()) {
    const lane =
      normalizePedalImportBurst(
        rawLane,
      );

    let active:
      | DirectionMarkRef
      | undefined;

    const pairs:
      Array<
        Readonly<{
          start: DirectionMarkRef;
          stop: DirectionMarkRef;
        }>
      > = [];

    for (const ref of lane) {
      if (ref.type === "start") {
        if (active !== undefined) {
          throw new BridgeError(
            "UNSUPPORTED_PEDAL",
            "Nested or unmatched MusicXML pedal-down marks remain fail-closed.",
            partId,
            ref.measure.index,
          );
        }

        active = ref;
        continue;
      }

      if (active === undefined) {
        throw new BridgeError(
          "UNSUPPORTED_PEDAL",
          "MusicXML pedal-up has no active matched pedal-down.",
          partId,
          ref.measure.index,
        );
      }

      pairs.push(
        Object.freeze({
          start: active,
          stop: ref,
        }),
      );

      active = undefined;
    }

    if (active !== undefined) {
      throw new BridgeError(
        "UNSUPPORTED_PEDAL",
        "MusicXML pedal-down has no later matched pedal-up; unpaired Ped. word substitution remains separate.",
        partId,
        active.measure.index,
      );
    }

    const startPositions =
      new Set(
        pairs.map(
          (pair) =>
            directionMarkPosition(
              pair.start,
            ),
        ),
      );

    for (const pair of pairs) {
      const startTarget =
        nextDirectionTarget(
          part,
          pair.start,
          partId,
          "UNSUPPORTED_PEDAL",
        );

      const stopTarget =
        previousDirectionTarget(
          part,
          pair.stop,
          partId,
          "UNSUPPORTED_PEDAL",
        );

      mergeDirectionMarkPlan(
        startTarget,
        Object.freeze({
          pedalDown: true,
        }),
        partId,
        pair.start.measure.index,
      );

      const immediateRetake =
        startPositions.has(
          directionMarkPosition(
            pair.stop,
          ),
        );

      // BANA 29.10.1(b): omit pedal-up when
      // re-depression is immediate.
      if (!immediateRetake) {
        mergeDirectionMarkPlan(
          stopTarget,
          Object.freeze({
            pedalUp: true,
          }),
          partId,
          pair.stop.measure.index,
        );
      }
    }
  }

  const wedgeByLane =
    new Map<
      string,
      DirectionMarkRef[]
    >();

  for (
    const ref of uniqueDirectionMarks(
      sortedDirectionMarks(wedgeRefs),
    )
  ) {
    const laneKey =
      `${ref.staff}|${ref.number}`;

    const lane =
      wedgeByLane.get(laneKey)
      ?? [];

    lane.push(ref);
    wedgeByLane.set(
      laneKey,
      lane,
    );
  }

  for (const lane of wedgeByLane.values()) {
    let active:
      | Readonly<{
          ref: DirectionMarkRef;
          kind:
            | "crescendo"
            | "diminuendo";
        }>
      | undefined;

    for (const ref of lane) {
      if (
        ref.type === "crescendo"
        || ref.type === "diminuendo"
      ) {
        if (active !== undefined) {
          throw new BridgeError(
            "UNSUPPORTED_WEDGE",
            "Overlapping MusicXML wedges on one staff/number remain fail-closed.",
            partId,
            ref.measure.index,
          );
        }

        active =
          Object.freeze({
            ref,
            kind: ref.type,
          });

        const target =
          nextDirectionTarget(
            part,
            ref,
            partId,
            "UNSUPPORTED_WEDGE",
          );

        mergeDirectionMarkPlan(
          target,
          Object.freeze({
            hairpinStart: ref.type,
          }),
          partId,
          ref.measure.index,
        );

        continue;
      }

      if (active === undefined) {
        throw new BridgeError(
          "UNSUPPORTED_WEDGE",
          "MusicXML wedge stop has no matched active crescendo/diminuendo.",
          partId,
          ref.measure.index,
        );
      }

      const target =
        previousDirectionTarget(
          part,
          ref,
          partId,
          "UNSUPPORTED_WEDGE",
        );

      mergeDirectionMarkPlan(
        target,
        Object.freeze({
          hairpinStop: active.kind,
        }),
        partId,
        ref.measure.index,
      );

      active = undefined;
    }

    if (active !== undefined) {
      throw new BridgeError(
        "UNSUPPORTED_WEDGE",
        "MusicXML crescendo/diminuendo wedge has no later matched stop.",
        partId,
        active.ref.measure.index,
      );
    }
  }
}

// PHASE16_R7_CURSOR_GRACE
//
// Grace semantics already exist in the shared engine. This planner only
// supplies the existing graceStyles() result to explicit keyboard
// backup/forward lanes, preserving the old 1..3-note bounded run and
// grace-chord fail-closed boundaries.
const CURSOR_GRACE_PLAN =
  new WeakMap<MusicXmlAdaptedNote, StatefulGrace>();

function planCursorGraceStyles(
  part: MusicXmlAdaptedPart,
  partId: string,
): void {
  for (const measure of part.measures) {
    if (
      measure.cursorOperations.length === 0
      || !measure.notes.some((note) => note.grace)
    ) {
      continue;
    }

    const lanes =
      new Map<string, LinearSourceGroup[]>();

    for (const group of linearSourceGroups(measure, partId)) {
      const voice = group.base.metadata.voice;
      const staff = group.base.metadata.staff;

      if (voice === undefined || staff === undefined) {
        throw new BridgeError(
          "UNSUPPORTED_GRACE",
          "Grace inside backup/forward requires explicit MusicXML voice and staff.",
          partId,
          measure.index,
        );
      }

      const laneKey = `${voice}|${staff}`;
      const lane = lanes.get(laneKey) ?? [];
      lane.push(group);
      lanes.set(laneKey, lane);
    }

    for (const lane of lanes.values()) {
      const styles =
        graceStyles(Object.freeze(lane), partId, measure.index);

      for (const group of lane) {
        const style = styles.get(group.base.sourceOrder);
        if (style !== undefined) {
          CURSOR_GRACE_PLAN.set(group.base, style);
        }
      }
    }
  }
}

// PHASE16_R5A_CROSS_MEASURE_SLUR
//
// V18C2A does not thread a new plan parameter through every linear / in-accord /
// keyboard projection layer. Adapted note objects are immutable identities
// shared by those paths, so a WeakMap carries one bounded part-level plan while
// the existing shared Braille Music stateful engine remains the only emitter.
//
// Frozen subset:
// - normal start -> stop MusicXML document order
// - different measures
// - explicit same voice and explicit same staff
// - bounded appoggiatura grace is admitted; tie, nested/layered/interior slur and chord-continuation slur remain guarded
// - BANA 13.2 for 2..4 lane events
// - existing V18C1 BANA 13.3 doubled-single-slur device for >4 lane events
//
// Cross-staff, cross-voice, continue, ambiguous ordering and ordinary
// non-keyboard backup/forward slur semantics remain fail-closed.
interface CrossMeasureSlurNotePlan {
  readonly suppressMarker?: true;
  readonly slurAfter?: true | 2;
}

interface CrossMeasureSlurGroupRef {
  readonly measure: MusicXmlAdaptedMeasure;
  readonly group: LinearSourceGroup;
  readonly ordinal: number;
}

interface CrossMeasureSlurMarkerRef {
  readonly note: MusicXmlAdaptedNote;
  readonly measureIndex: number;
  readonly ordinal: number;
  readonly number: number;
  readonly voice: string;
  readonly staff: number;
}

const CROSS_MEASURE_SLUR_NOTE_PLAN =
  new WeakMap<MusicXmlAdaptedNote, CrossMeasureSlurNotePlan>();

function mergeCrossMeasureSlurNotePlan(
  note: MusicXmlAdaptedNote,
  patch: CrossMeasureSlurNotePlan,
): void {
  const current =
    CROSS_MEASURE_SLUR_NOTE_PLAN.get(note);

  CROSS_MEASURE_SLUR_NOTE_PLAN.set(
    note,
    Object.freeze({
      ...(current ?? {}),
      ...patch,
    }),
  );
}

function explicitSlurLaneKey(
  note: MusicXmlAdaptedNote,
  number: number,
): string | undefined {
  const voice = note.metadata.voice;
  const staff = note.metadata.staff;

  if (voice === undefined || staff === undefined) {
    return undefined;
  }

  return `${voice}\u0000${staff}\u0000${number}`;
}

function planSameLaneCrossMeasureSlurs(
  part: MusicXmlAdaptedPart,
  partId: string,
): void {
  const allGroups: CrossMeasureSlurGroupRef[] = [];

  for (const measure of part.measures) {
    const groups =
      linearSourceGroups(measure, partId);

    for (const group of groups) {
      allGroups.push(
        Object.freeze({
          measure,
          group,
          ordinal: allGroups.length,
        }),
      );
    }
  }

  const active =
    new Map<string, CrossMeasureSlurMarkerRef>();
  const blockedActive = new Set<string>();
  const occupiedCrossMeasureNotes =
    new WeakSet<MusicXmlAdaptedNote>();

  for (const ref of allGroups) {
    const base = ref.group.base;

    for (const continuation of ref.group.members.slice(1)) {
      for (const marker of continuation.metadata.slurs ?? []) {
        const number = marker.number ?? 1;
        const lane = explicitSlurLaneKey(continuation, number);

        if (lane !== undefined && active.has(lane)) {
          blockedActive.add(lane);
        }
      }
    }

    const markers = base.metadata.slurs ?? [];

    if (markers.length !== 1) {
      for (const marker of markers) {
        const number = marker.number ?? 1;
        const lane = explicitSlurLaneKey(base, number);

        if (lane !== undefined && active.has(lane)) {
          blockedActive.add(lane);
        }
      }

      continue;
    }

    const marker = markers[0]!;
    const number = marker.number ?? 1;
    const lane = explicitSlurLaneKey(base, number);

    if (lane === undefined) {
      continue;
    }

    const voice = base.metadata.voice!;
    const staff = base.metadata.staff!;

    if (marker.type === "continue") {
      if (active.has(lane)) {
        blockedActive.add(lane);
      }

      continue;
    }

    if (marker.type === "start") {
      if (active.has(lane)) {
        blockedActive.add(lane);
        continue;
      }

      active.set(
        lane,
        Object.freeze({
          note: base,
          measureIndex: ref.measure.index,
          ordinal: ref.ordinal,
          number,
          voice,
          staff,
        }),
      );

      continue;
    }

    const start = active.get(lane);
    if (start === undefined) {
      continue;
    }

    const blocked = blockedActive.has(lane);

    active.delete(lane);
    blockedActive.delete(lane);

    if (blocked) {
      continue;
    }

    if (start.measureIndex === ref.measure.index) {
      continue;
    }

    if (
      start.voice !== voice
      || start.staff !== staff
    ) {
      continue;
    }

    if (ref.ordinal <= start.ordinal) {
      throw new BridgeError(
        "UNSUPPORTED_SLUR",
        `Cross-measure slur ${number} has non-monotonic document ordering in the bounded same-lane subset.`,
        partId,
        start.measureIndex,
      );
    }

    const window =
      allGroups.slice(start.ordinal, ref.ordinal + 1);

    const phrase =
      window.filter(
        (candidate) =>
          candidate.group.base.metadata.voice === start.voice
          && candidate.group.base.metadata.staff === start.staff,
      );

    if (
      phrase.length < 2
      || phrase[0]?.group.base !== start.note
      || phrase[phrase.length - 1]?.group.base !== base
    ) {
      throw new BridgeError(
        "UNSUPPORTED_SLUR",
        `Cross-measure slur ${number} cannot be resolved to one explicit same-voice/same-staff lane.`,
        partId,
        start.measureIndex,
      );
    }

    for (let index = 1; index < phrase.length; index += 1) {
      const previous = phrase[index - 1]!;
      const current = phrase[index]!;

      if (
        previous.measure.index === current.measure.index
        && cmp(
          previous.group.base.onsetQuarter,
          current.group.base.onsetQuarter,
        ) > 0
      ) {
        throw new BridgeError(
          "UNSUPPORTED_SLUR",
          `Cross-measure slur ${number} uses non-monotonic same-lane source order.`,
          partId,
          current.measure.index,
        );
      }
    }

    for (const [phraseIndex, candidate] of phrase.entries()) {
      const group = candidate.group;
      const note = group.base;

      // PHASE16_R7_CROSS_MEASURE_APPOGGIATURA_SLUR
      //
      // BANA MBC 2015 13.9 nonfacsimile appoggiatura
      // slurs use the ordinary slur system. Cross-measure
      // planning may therefore include an otherwise admitted
      // grace event. The existing same-lane, monotonic,
      // non-nested, chord-continuation and tie/slur collision
      // guards remain authoritative.
      if (
        note.grace
        && (
          note.ties.length > 0
          || note.tuplets.length > 0
          || note.timeModification !== undefined
          || (note.metadata.articulations?.length ?? 0) > 0
        )
      ) {
        throw new BridgeError(
          "UNSUPPORTED_SLUR",
          "Cross-measure appoggiatura slur carries additional grace semantics outside the bounded profile.",
          partId,
          candidate.measure.index,
        );
      }

      // PHASE16_R7_INTERNAL_TIE_SLUR
      // A tie wholly inside a larger slur phrase does not collide with the
      // slur endpoints. Keep fail-closed behavior only when a tied event
      // itself also carries slur metadata; that coincidence requires the
      // separate BANA 13.5 redundancy policy.
      if (
        group.members.some((member) => member.ties.length > 0)
        && group.members.some(
          (member) => (member.metadata.slurs?.length ?? 0) > 0,
        )
      ) {
        throw new BridgeError(
          "UNSUPPORTED_SLUR",
          "Tie/slur coincidence on the same cross-measure event remains deferred; internal ties without slur markers are supported.",
          partId,
          candidate.measure.index,
        );
      }

      if (
        group.members
          .slice(1)
          .some(
            (member) =>
              (member.metadata.slurs?.length ?? 0) > 0,
          )
      ) {
        throw new BridgeError(
          "UNSUPPORTED_SLUR",
          "Cross-measure slur metadata on a chord continuation member remains deferred.",
          partId,
          candidate.measure.index,
        );
      }

      const candidateMarkers =
        note.metadata.slurs ?? [];

      const endpoint =
        phraseIndex === 0
        || phraseIndex === phrase.length - 1;

      if (!endpoint && candidateMarkers.length > 0) {
        throw new BridgeError(
          "UNSUPPORTED_SLUR",
          "Nested, layered, or overlapping slurs inside a cross-measure phrase remain deferred from Phase 16.R5A.",
          partId,
          candidate.measure.index,
        );
      }

      if (occupiedCrossMeasureNotes.has(note)) {
        throw new BridgeError(
          "UNSUPPORTED_SLUR",
          "Overlapping cross-measure slur phrases remain deferred from Phase 16.R5A.",
          partId,
          candidate.measure.index,
        );
      }
    }

    for (const candidate of phrase) {
      occupiedCrossMeasureNotes.add(candidate.group.base);
    }

    mergeCrossMeasureSlurNotePlan(
      start.note,
      Object.freeze({
        suppressMarker: true,
      }),
    );

    mergeCrossMeasureSlurNotePlan(
      base,
      Object.freeze({
        suppressMarker: true,
      }),
    );

    if (phrase.length <= 4) {
      for (let index = 0; index < phrase.length - 1; index += 1) {
        mergeCrossMeasureSlurNotePlan(
          phrase[index]!.group.base,
          Object.freeze({
            slurAfter: true,
          }),
        );
      }

      continue;
    }

    mergeCrossMeasureSlurNotePlan(
      phrase[0]!.group.base,
      Object.freeze({
        slurAfter: 2,
      }),
    );

    mergeCrossMeasureSlurNotePlan(
      phrase[phrase.length - 2]!.group.base,
      Object.freeze({
        slurAfter: true,
      }),
    );
  }
}
function shortSlurAfter(
  groups: readonly LinearSourceGroup[],
  partId: string,
  measureIndex: number,
): ReadonlyMap<number, true | 2> {
  // PHASE16_R4_SEQUENTIAL_SLUR_NUMBER_REUSE
  // PHASE16_R5_BANA_LONGER_SLUR
  //
  // MusicXML slur @number identifies an active slur lane; the same number may
  // be reused after a complete start -> stop pair.
  //
  // BANA MBC 2015:
  // - 13.2: 2..4-event phrases use one single-slur cell after every event
  //   except the final event.
  // - 13.3: for a contained phrase of >4 events, this frozen Braille Hub
  //   transcriber policy selects the permitted doubled-single-slur device:
  //   two single-slur cells after the first event and one after the
  //   next-to-last event.
  //
  // Cross-measure/cross-staff planning remains outside V18C1 and therefore
  // continues to fail closed before any contained-span emission is produced.
  const active = new Map<number, number>();
  const spans: Array<{ number: number; start: number; stop: number }> = [];

  for (const [groupIndex, group] of groups.entries()) {
    for (const continuation of group.members.slice(1)) {
      if ((continuation.metadata.slurs?.length ?? 0) > 0) {
        throw new BridgeError(
          "UNSUPPORTED_SLUR",
          "Slur metadata on a MusicXML <chord/> continuation member is deferred.",
          partId,
          measureIndex,
        );
      }
    }

    const crossMeasurePlan =
      CROSS_MEASURE_SLUR_NOTE_PLAN.get(group.base);

    const markers =
      crossMeasurePlan?.suppressMarker === true
        ? []
        : (group.base.metadata.slurs ?? []);
    if (markers.length > 1) {
      throw new BridgeError(
        "UNSUPPORTED_SLUR",
        "Convergent, nested, or layered slurs are deferred from the contained Phase 16.R5 subset.",
        partId,
        measureIndex,
      );
    }

    const marker = markers[0];
    if (marker === undefined) continue;

    if (marker.type === "continue") {
      throw new BridgeError(
        "UNSUPPORTED_SLUR",
        "MusicXML slur continue markers are outside the contained Phase 16.R5 subset.",
        partId,
        measureIndex,
      );
    }

    const number = marker.number ?? 1;

    if (marker.type === "start") {
      if (active.has(number)) {
        throw new BridgeError(
          "UNSUPPORTED_SLUR",
          `Duplicate active slur start for number ${number}.`,
          partId,
          measureIndex,
        );
      }

      active.set(number, groupIndex);
      continue;
    }

    const startIndex = active.get(number);
    if (startIndex === undefined) {
      throw new BridgeError(
        "UNSUPPORTED_SLUR",
        `Slur stop for number ${number} has no active start in this measure.`,
        partId,
        measureIndex,
      );
    }

    spans.push({
      number,
      start: startIndex,
      stop: groupIndex,
    });
    active.delete(number);
  }

  if (active.size > 0) {
    const [number] = active.keys();

    throw new BridgeError(
      "UNSUPPORTED_SLUR",
      `Slur ${number} crosses a measure boundary or has an unmatched endpoint.`,
      partId,
      measureIndex,
    );
  }

  const slurAfter =
    new Map<number, true | 2>();
  const occupied = new Set<number>();

  for (const span of spans) {
    const { number, start, stop } = span;

    if (stop <= start) {
      throw new BridgeError(
        "UNSUPPORTED_SLUR",
        `Slur ${number} has invalid endpoint ordering.`,
        partId,
        measureIndex,
      );
    }

    const phrase = groups.slice(start, stop + 1);

    if (phrase.length < 2) {
      throw new BridgeError(
        "UNSUPPORTED_SLUR",
        `Slur ${number} must contain at least two phrase events.`,
        partId,
        measureIndex,
      );
    }

    for (let index = start; index <= stop; index += 1) {
      if (occupied.has(index)) {
        throw new BridgeError(
          "UNSUPPORTED_SLUR",
          "Overlapping/nested slur phrases are deferred from Phase 16.R5.",
          partId,
          measureIndex,
        );
      }

      occupied.add(index);

      const group = groups[index]!;

      // PHASE16_R7_APPOGGIATURA_SLUR
      //
      // BANA MBC 2015 13.9 nonfacsimile transcription:
      // ordinary slur treatment is admitted for an otherwise
      // bounded appoggiatura. Keep independent fail-closed
      // guards for ties, tuplets/time-modification and
      // articulations.
      if (
        group.base.grace
        && (
          group.base.tuplets.length > 0
          || group.base.timeModification !== undefined
          || (group.base.metadata.articulations?.length ?? 0) > 0
        )
      ) {
        throw new BridgeError(
          "UNSUPPORTED_SLUR",
          "Appoggiatura slur carries tuplet/time-modification or articulation semantics outside the bounded nonfacsimile profile.",
          partId,
          measureIndex,
        );
      }

      // PHASE16_R9_ORIENTED_TIE_SLUR
      //
      // BANA 13.5 redundancy applies when a note is tied AND
      // slurred to the same following/preceding note. An incoming
      // tie-stop plus outgoing slur-start is a different topology,
      // as is outgoing tie-start plus incoming slur-stop.
      if (
        group.members.some(
          (member) =>
            member.ties.length > 0,
        )
      ) {
        const markers =
          group.base.metadata.slurs
          ?? [];

        const hasTieStart =
          group.members.some(
            (member) =>
              member.ties.includes("start"),
          );

        const hasTieStop =
          group.members.some(
            (member) =>
              member.ties.includes("stop"),
          );

        const hasSlurStart =
          index === start
          && markers.some(
            (marker) =>
              marker.type === "start",
          );

        const hasSlurStop =
          index === stop
          && markers.some(
            (marker) =>
              marker.type === "stop",
          );

        const sameLinkCollision =
          (hasTieStart && hasSlurStart)
          || (hasTieStop && hasSlurStop);

        if (sameLinkCollision) {
          throw new BridgeError(
            "UNSUPPORTED_SLUR",
            "Same-link tie/slur coincidence remains fail-closed pending the explicit BANA 13.5 redundancy/facsimile policy.",
            partId,
            measureIndex,
          );
        }
      }
    }

    if (phrase.length <= 4) {
      for (let index = start; index < stop; index += 1) {
        slurAfter.set(
          groups[index]!.base.sourceOrder,
          true,
        );
      }

      continue;
    }

    // BANA 13.3 doubled-single-slur device for a contained >4-event phrase.
    slurAfter.set(
      groups[start]!.base.sourceOrder,
      2,
    );
    slurAfter.set(
      groups[stop - 1]!.base.sourceOrder,
      true,
    );
  }

  for (const group of groups) {
    const planned =
      CROSS_MEASURE_SLUR_NOTE_PLAN.get(group.base)?.slurAfter;

    if (planned === undefined) continue;

    const sourceOrder = group.base.sourceOrder;
    if (slurAfter.has(sourceOrder)) {
      throw new BridgeError(
        "UNSUPPORTED_SLUR",
        "A preplanned cross-measure slur collides with a contained slur suffix on the same event.",
        partId,
        measureIndex,
      );
    }

    slurAfter.set(sourceOrder, planned);
  }

  return slurAfter;
}
const SUPPORTED_DYNAMICS =
  new Set<StatefulDynamic>(
    ["pp", "p", "mp", "mf", "f", "ff", "fff", "sf", "sfz"],
  );

function dynamicsBySourceOrder(
  measure: MusicXmlAdaptedMeasure,
  partId: string,
): ReadonlyMap<number, StatefulDynamic> {
  const result = new Map<number, StatefulDynamic>();

  for (const [itemIndex, item] of measure.sourceItems.entries()) {
    if (item.kind !== "direction" || item.dynamics.length === 0) continue;

    // R2B keeps semantic word expressions and independent dynamics
    // distinct; the stateful encoder orders the word expression first.
    if (item.dynamics.length !== 1) {
      throw new BridgeError(
        "UNSUPPORTED_DYNAMICS",
        "Phase 16.5 accepts exactly one independent MusicXML dynamic marking at a source position.",
        partId,
        measure.index,
      );
    }

    const raw = item.dynamics[0]!;
    if (!SUPPORTED_DYNAMICS.has(raw as StatefulDynamic)) {
      throw new BridgeError(
        "UNSUPPORTED_DYNAMICS",
        `Dynamic ${raw} is preserved but outside the frozen Phase 16.5 subset (pp, p, mf, f, ff).`,
        partId,
        measure.index,
      );
    }

    let targetSourceOrder: number | undefined;
    for (let next = itemIndex + 1; next < measure.sourceItems.length; next += 1) {
      const candidate = measure.sourceItems[next]!;
      if (candidate.kind === "backup" || candidate.kind === "forward") {
        throw new BridgeError(
          "UNSUPPORTED_DYNAMICS",
          "Dynamic placement across MusicXML backup/forward polyphony is deferred.",
          partId,
          measure.index,
        );
      }
      if (candidate.kind === "direction") {
        if (
          candidate.dynamics.length > 0
        ) {
          throw new BridgeError(
            "UNSUPPORTED_DYNAMICS",
            "Multiple adjacent semantic directions before one note are deferred.",
            partId,
            measure.index,
          );
        }
        continue;
      }
      if (candidate.kind !== "note") continue;
      if (candidate.chord) {
        throw new BridgeError(
          "UNSUPPORTED_DYNAMICS",
          "A dynamic cannot target a chord-continuation member in the Phase 16.5 subset.",
          partId,
          measure.index,
        );
      }
      if (candidate.rest) {
        throw new BridgeError(
          "UNSUPPORTED_DYNAMICS",
          "BANA independent dynamics in this profile must precede a note, not a rest.",
          partId,
          measure.index,
        );
      }
      if (
        item.staff !== undefined
        && candidate.staff !== undefined
        && item.staff !== candidate.staff
      ) {
        throw new BridgeError(
          "UNSUPPORTED_DYNAMICS",
          "Direction staff and target-note staff differ.",
          partId,
          measure.index,
        );
      }
      targetSourceOrder = candidate.sourceOrder;
      break;
    }

    if (targetSourceOrder === undefined) {
      throw new BridgeError(
        "UNSUPPORTED_DYNAMICS",
        "Independent dynamic has no following pitched note in the same measure.",
        partId,
        measure.index,
      );
    }
    if (result.has(targetSourceOrder)) {
      throw new BridgeError(
        "UNSUPPORTED_DYNAMICS",
        "More than one dynamic targets the same note.",
        partId,
        measure.index,
      );
    }

    result.set(targetSourceOrder, raw as StatefulDynamic);
  }

  return result;
}

interface MeasureDecorations {
  readonly initialRepeat?: true;
  readonly terminalRepeat?: true;
  readonly volta?: 1 | 2;
}

function measureDecorations(
  measure: MusicXmlAdaptedMeasure,
  partId: string,
  diagnostics: MusicXmlToBrailleDiagnostic[],
): MeasureDecorations {
  let initialRepeat: true | undefined;
  let terminalRepeat: true | undefined;
  let volta: 1 | 2 | undefined;

  for (const barline of measure.barlines) {
    if (barline.repeat === "forward") {
      if (barline.location !== undefined && barline.location !== "left") {
        throw new BridgeError(
          "UNSUPPORTED_REPEAT",
          "Forward print repeat is supported only at the left/start boundary of a measure.",
          partId,
          measure.index,
        );
      }
      if (barline.repeatTimes !== undefined && barline.repeatTimes !== 2) {
        throw new BridgeError(
          "UNSUPPORTED_REPEAT",
          `Explicit repeat-times=${barline.repeatTimes} is outside the simple print-repeat subset.`,
          partId,
          measure.index,
        );
      }
      if (initialRepeat === true) {
        throw new BridgeError(
          "UNSUPPORTED_REPEAT",
          "Duplicate forward repeat barlines in one measure are unsupported.",
          partId,
          measure.index,
        );
      }
      initialRepeat = true;
    }

    if (barline.repeat === "backward") {
      if (barline.location !== undefined && barline.location !== "right") {
        throw new BridgeError(
          "UNSUPPORTED_REPEAT",
          "Backward print repeat is supported only at the right/end boundary of a measure.",
          partId,
          measure.index,
        );
      }
      if (barline.repeatTimes !== undefined && barline.repeatTimes !== 2) {
        throw new BridgeError(
          "UNSUPPORTED_REPEAT",
          `Explicit repeat-times=${barline.repeatTimes} is outside the simple print-repeat subset.`,
          partId,
          measure.index,
        );
      }
      if (terminalRepeat === true) {
        throw new BridgeError(
          "UNSUPPORTED_REPEAT",
          "Duplicate backward repeat barlines in one measure are unsupported.",
          partId,
          measure.index,
        );
      }
      terminalRepeat = true;
    }

    if (barline.ending !== undefined) {
      const endingType = barline.ending.type;
      if (endingType === "start") {
        const numberText = barline.ending.number?.trim();
        if (numberText !== "1" && numberText !== "2") {
          throw new BridgeError(
            "UNSUPPORTED_ENDING",
            `Phase 16.5 freezes simple first/second volta only; got ${String(numberText)}.`,
            partId,
            measure.index,
          );
        }
        if (volta !== undefined) {
          throw new BridgeError(
            "UNSUPPORTED_ENDING",
            "Multiple volta-start markers in one measure are deferred.",
            partId,
            measure.index,
          );
        }
        volta = numberText === "1" ? 1 : 2;
      } else if (endingType === "stop" || endingType === "discontinue") {
        diagnostics.push(Object.freeze({
          code: "ENDING_TERMINATION_PRESERVED_NOT_EMITTED",
          message:
            "MusicXML ending termination is preserved but emits no separate bracket sign in the frozen simple BANA volta profile.",
          partId,
          measureIndex: measure.index,
        }));
      } else {
        throw new BridgeError(
          "UNSUPPORTED_ENDING",
          `Unsupported MusicXML ending type ${String(endingType)}.`,
          partId,
          measure.index,
        );
      }
    }
  }

  if (initialRepeat === true && volta !== undefined) {
    throw new BridgeError(
      "UNSUPPORTED_ENDING",
      "Combined initial-repeat plus volta prefix ordering is deferred from the Phase 16.5 subset.",
      partId,
      measure.index,
    );
  }

  return Object.freeze({
    ...(initialRepeat === true ? {initialRepeat: true as const} : {}),
    ...(terminalRepeat === true ? {terminalRepeat: true as const} : {}),
    ...(volta !== undefined ? {volta} : {}),
  });
}

function sourceBoundaryKey(
  measure: MusicXmlAdaptedMeasure,
  partId: string,
): number | undefined {
  const keyItems = measure.sourceItems
    .map((item, index) => ({item, index}))
    .filter(
      (entry) =>
        entry.item.kind === "attributes"
        && entry.item.key !== undefined,
    );

  if (keyItems.length === 0) return undefined;
  if (keyItems.length !== 1) {
    throw new BridgeError(
      "UNSUPPORTED_KEY_CHANGE",
      "Multiple key-signature attribute changes inside one measure are deferred.",
      partId,
      measure.index,
    );
  }

  const entry = keyItems[0]!;
  const firstTimedIndex = measure.sourceItems.findIndex(
    (item) =>
      item.kind === "note"
      || item.kind === "backup"
      || item.kind === "forward",
  );
  if (firstTimedIndex !== -1 && entry.index > firstTimedIndex) {
    throw new BridgeError(
      "UNSUPPORTED_KEY_CHANGE",
      "Mid-measure key changes are preserved but the Phase 16.5 executable subset supports measure-boundary changes only.",
      partId,
      measure.index,
    );
  }

  const item = entry.item;
  if (item.kind !== "attributes" || item.key === undefined) return undefined;
  const fifths = item.key.fifths;
  if (!Number.isInteger(fifths) || fifths < -7 || fifths > 7) {
    throw new BridgeError(
      "UNSUPPORTED_SOURCE_STRUCTURE",
      `Key fifths must be in -7..7; got ${fifths}.`,
      partId,
      measure.index,
    );
  }
  return fifths;
}

function canonicalR2BWordText(
  resolution: MusicTerminologyResolution,
): string {
  if (resolution.policy !== "canonical-word-expression") {
    return resolution.normalizedText;
  }

  const canonical =
    resolution.entries[0]?.term.toLowerCase();

  if (canonical === "crescendo") return "cr.";
  if (canonical === "decrescendo") return "decr.";
  if (canonical === "diminuendo") return "dim.";

  return resolution.normalizedText;
}

function terminologyRank(
  expression: StatefulWordExpression,
): number {
  if (expression.semanticTags.includes("tempo")) return 0;
  if (expression.policy === "music-metronome-expression") return 5;
  if (
    expression.semanticTags.includes("dynamic")
    || expression.semanticTags.includes("dynamic-change")
  ) {
    return 20;
  }
  return 10;
}

function stableTerminologyOrder(
  expressions: readonly StatefulWordExpression[],
): readonly StatefulWordExpression[] {
  return Object.freeze(
    expressions
      .map((expression, index) => ({expression, index}))
      .sort(
        (a, b) =>
          terminologyRank(a.expression)
          - terminologyRank(b.expression)
          || a.index - b.index,
      )
      .map(({expression}) => expression),
  );
}

function projectR2BWordExpression(
  sourceText: string,
  partId: string,
  measureIndex: number,
): StatefulWordExpression {
  const resolution =
    resolveMusicTerminology(sourceText);

  if (resolution.kind === "continuation-fragment") {
    throw new BridgeError(
      "UNSUPPORTED_DIRECTION_WORD_CONTINUATION",
      "A MusicXML words continuation fragment was preserved but R2B does not reconstruct split print typography into a musical term.",
      partId,
      measureIndex,
    );
  }

  if (resolution.kind === "unsupported-glyph") {
    throw new BridgeError(
      "UNSUPPORTED_DIRECTION_WORD_GLYPH",
      "MusicXML words contains a private-use score glyph. R2B does not guess the glyph's musical identity.",
      partId,
      measureIndex,
    );
  }

  if (resolution.policy === "structural-fail-closed") {
    throw new BridgeError(
      "UNSUPPORTED_DIRECTION_STRUCTURAL_TERMINOLOGY",
      `Recognized structural terminology ${JSON.stringify(sourceText)} requires a dedicated navigation/register contract rather than literary word-sign emission.`,
      partId,
      measureIndex,
    );
  }

  if (resolution.policy === "explicit-fail-closed") {
    throw new BridgeError(
      "UNSUPPORTED_DIRECTION_WORDS",
      `MusicXML words ${JSON.stringify(sourceText)} is explicitly outside the R2B executable word-expression surface.`,
      partId,
      measureIndex,
    );
  }

  const brfText =
    canonicalR2BWordText(resolution);

  if (!/^[a-z. ]+$/.test(brfText)) {
    throw new BridgeError(
      "UNSUPPORTED_DIRECTION_WORD_TEXT",
      `MusicXML words ${JSON.stringify(sourceText)} resolved semantically but requires literary punctuation/character support outside the bounded R2B Latin surface.`,
      partId,
      measureIndex,
    );
  }

  return Object.freeze({
    sourceText,
    normalizedText: resolution.normalizedText,
    brfText,
    categories: Object.freeze([...resolution.categories]),
    semanticTags: Object.freeze([...resolution.semanticTags]),
    canonicalTerms: Object.freeze(
      resolution.entries.map((entry) => entry.term),
    ),
    policy:
      resolution.policy === "bana-word-expression-fallback"
        ? "bana-word-expression-fallback"
        : resolution.policy,
  });
}

const PHASE16_R4_METRONOME_DIGIT_BRF =
  Object.freeze({
    "0": "j",
    "1": "a",
    "2": "b",
    "3": "c",
    "4": "d",
    "5": "e",
    "6": "f",
    "7": "g",
    "8": "h",
    "9": "i",
  } as const);

function phase16R4MetronomeNumberBrf(value: string): string {
  const normalized = value.trim();
  if (!/^[1-9][0-9]*$/.test(normalized)) {
    throw new Error(
      `PHASE16_R4_NON_INTEGER_METRONOME_BPM:${JSON.stringify(value)}`,
    );
  }

  return "#"
    + [...normalized]
      .map((digit) =>
        PHASE16_R4_METRONOME_DIGIT_BRF[
          digit as keyof typeof PHASE16_R4_METRONOME_DIGIT_BRF
        ]
      )
      .join("");
}

function projectSimpleMetronomeExpression(
  metronome: MusicXmlMetronome,
  partId: string,
  measureIndex: number,
): StatefulWordExpression {
  // PHASE16_R4_SIMPLE_METRONOME
  //
  // Frozen real-score subset:
  // - undotted C-quarter or C-eighth beat unit
  // - positive integer per-minute
  // - no metronome relation / equivalency topology
  // - BANA music-parentheses form inside the music line
  if (
    metronome.beatUnit !== "quarter"
    && metronome.beatUnit !== "eighth"
  ) {
    throw new BridgeError(
      "UNSUPPORTED_METRONOME",
      `MusicXML metronome beat-unit ${JSON.stringify(metronome.beatUnit)} is outside the Phase 16.R4 quarter/eighth subset.`,
      partId,
      measureIndex,
    );
  }

  if (metronome.beatUnitDots !== 0) {
    throw new BridgeError(
      "UNSUPPORTED_METRONOME",
      "Dotted MusicXML metronome beat units remain fail-closed in Phase 16.R4.",
      partId,
      measureIndex,
    );
  }

  if (
    metronome.relation !== undefined
    && metronome.relation.trim() !== ""
  ) {
    throw new BridgeError(
      "UNSUPPORTED_METRONOME",
      "MusicXML metronome equivalency/relation remains fail-closed in Phase 16.R4.",
      partId,
      measureIndex,
    );
  }

  const perMinute = metronome.perMinute?.trim();
  if (
    perMinute === undefined
    || !/^[1-9][0-9]*$/.test(perMinute)
  ) {
    throw new BridgeError(
      "UNSUPPORTED_METRONOME",
      `MusicXML per-minute ${JSON.stringify(metronome.perMinute)} is not a positive integer in the Phase 16.R4 subset.`,
      partId,
      measureIndex,
    );
  }

  // BANA Table 2: C-quarter = "?", C-eighth = "D".
  // BANA 1.8: equals = "7"; one numeric indicator precedes the BPM.
  // BANA 1.8.1: embedded marking is advisably enclosed in music
  // parentheses; the symmetric music-parenthesis BRF is ",'".
  const noteBrf =
    metronome.beatUnit === "quarter"
      ? "?"
      : "D";
  const brfText =
    `,'${noteBrf}7${phase16R4MetronomeNumberBrf(perMinute)},'`;

  return Object.freeze({
    sourceText: `${metronome.beatUnit}=${perMinute}`,
    normalizedText: `${metronome.beatUnit}=${perMinute}`,
    brfText,
    categories: Object.freeze(["metronome"]),
    semanticTags: Object.freeze(["metronome"]),
    canonicalTerms: Object.freeze([]),
    policy: "music-metronome-expression",
  });
}

function projectDirectionExpressions(
  direction: Readonly<{
    words: readonly string[];
    metronomes: readonly MusicXmlMetronome[];
  }>,
  partId: string,
  measureIndex: number,
): readonly StatefulWordExpression[] {
  return Object.freeze([
    ...direction.words.map((word) =>
      projectR2BWordExpression(
        word,
        partId,
        measureIndex,
      )
    ),
    ...direction.metronomes.map((metronome) =>
      projectSimpleMetronomeExpression(
        metronome,
        partId,
        measureIndex,
      )
    ),
  ]);
}
function wordExpressionsBySourceOrder(
  measure: MusicXmlAdaptedMeasure,
  partId: string,
): ReadonlyMap<number, readonly StatefulWordExpression[]> {
  const result =
    new Map<number, StatefulWordExpression[]>();

  for (
    const [itemIndex, item]
    of measure.sourceItems.entries()
  ) {
    if (
      item.kind !== "direction"
      || (item.words.length === 0 && item.metronomes.length === 0)
    ) {
      continue;
    }

    const expressions =
      projectDirectionExpressions(
        item,
        partId,
        measure.index,
      );

    let targetSourceOrder: number | undefined;

    for (
      let next = itemIndex + 1;
      next < measure.sourceItems.length;
      next += 1
    ) {
      const candidate =
        measure.sourceItems[next]!;

      if (
        candidate.kind === "backup"
        || candidate.kind === "forward"
      ) {
        throw new BridgeError(
          "UNSUPPORTED_DIRECTION_WORD_PLACEMENT",
          "R2B does not move a linear word expression across a MusicXML backup/forward cursor operation.",
          partId,
          measure.index,
        );
      }

      if (
        candidate.kind === "note"
        && !candidate.chord
      ) {
        targetSourceOrder =
          candidate.sourceOrder;
        break;
      }
    }

    if (targetSourceOrder === undefined) {
      throw new BridgeError(
        "UNSUPPORTED_DIRECTION_WORD_PLACEMENT",
        "R2B word expressions require a following source event; terminal/preceding-note placement remains fail-closed.",
        partId,
        measure.index,
      );
    }

    const current =
      result.get(targetSourceOrder) ?? [];
    result.set(
      targetSourceOrder,
      [...current, ...expressions],
    );
  }

  return new Map(
    [...result.entries()].map(
      ([sourceOrder, expressions]) => [
        sourceOrder,
        stableTerminologyOrder(expressions),
      ],
    ),
  );
}

// PHASE16_R9_KEYBOARD_MEASURE_START_TEMPO
const KEYBOARD_GLOBAL_TEMPO_DIRECTIONS =
  new WeakSet<object>();

function measureStartPolyphonyWordExpressions(
  measure: MusicXmlAdaptedMeasure,
  partId: string,
  keyboardProfile?: KeyboardImportProfile,
): readonly StatefulWordExpression[] {
  if (keyboardProfile === undefined) {
    const firstNoteIndex =
      measure.sourceItems.findIndex(
        (item) => item.kind === "note",
      );

    if (firstNoteIndex < 0) {
      return Object.freeze([]);
    }

    const expressions: StatefulWordExpression[] = [];

    for (
      const [index, item]
      of measure.sourceItems.entries()
    ) {
      if (
        item.kind !== "direction"
        || (item.words.length === 0 && item.metronomes.length === 0)
      ) {
        continue;
      }

      if (index >= firstNoteIndex) {
        throw new BridgeError(
          "UNSUPPORTED_DIRECTION_WORD_PLACEMENT",
          "In ordinary backup/forward polyphony R2B only executes global word expressions that occur before the first source note.",
          partId,
          measure.index,
        );
      }

      expressions.push(
        ...projectDirectionExpressions(
          item,
          partId,
          measure.index,
        ),
      );
    }

    return stableTerminologyOrder(expressions);
  }

  const zero: MusicXmlFraction =
    Object.freeze({
      numerator: 0,
      denominator: 1,
    });

  const expressions: StatefulWordExpression[] = [];

  for (const item of measure.sourceItems) {
    if (
      item.kind !== "direction"
      || (item.words.length === 0 && item.metronomes.length === 0)
    ) {
      continue;
    }

    // PHASE16_R9_KEYBOARD_MEASURE_START_TEMPO
    //
    // A measure-opening tempo term can be staff=1 in MusicXML
    // purely for engraving. Promote only a tempo-only expression
    // at exact measure onset when the source itself contains a
    // non-grace base note on that same staff/onset.
    if (item.staff === 1 || item.staff === 2) {
      const atMeasureStart =
        item.onsetQuarter !== undefined
        && cmp(
          item.onsetQuarter,
          zero,
        ) === 0;

      if (atMeasureStart) {
        const projected =
          projectDirectionExpressions(
            item,
            partId,
            measure.index,
          );

        const tempoOnly =
          projected.length > 0
          && projected.every(
            (expression) =>
              expression.semanticTags.includes(
                "tempo",
              )
              || expression.policy
                === "music-metronome-expression",
          );

        const exactSourceHost =
          measure.notes.some(
            (note) =>
              !note.chord
              && !note.grace
              && note.metadata.staff
                === item.staff
              && cmp(
                note.onsetQuarter,
                zero,
              ) === 0,
          );

        if (
          tempoOnly
          && exactSourceHost
        ) {
          expressions.push(
            ...projected,
          );

          KEYBOARD_GLOBAL_TEMPO_DIRECTIONS.add(
            item,
          );

          continue;
        }
      }

      continue;
    }

    if (
      item.onsetQuarter === undefined
      || cmp(item.onsetQuarter, zero) !== 0
    ) {
      throw new BridgeError(
        "UNSUPPORTED_DIRECTION_WORD_PLACEMENT",
        "An unstaffed keyboard word expression away from measure onset remains ambiguous between the whole texture and one hand.",
        partId,
        measure.index,
      );
    }

      expressions.push(
        ...projectDirectionExpressions(
          item,
          partId,
          measure.index,
        ),
      );
  }

  return stableTerminologyOrder(expressions);
}

function marker(
  notes: readonly MusicXmlAdaptedNote[],
  partId: string,
  measureIndex: number,
): Readonly<{ start: boolean; stop: boolean; number?: number }> {
  const tuplets = notes.flatMap((note) => note.tuplets);
  const starts = tuplets.filter((t) => t.type === "start");
  const stops = tuplets.filter((t) => t.type === "stop");
  if (starts.length > 1 || stops.length > 1) {
    throw new BridgeError(
      "UNSUPPORTED_TUPLET",
      "Pack B supports one explicit triplet boundary per event.",
      partId, measureIndex,
    );
  }
  const a = starts[0]?.number;
  const b = stops[0]?.number;
  if (a !== undefined && b !== undefined && a !== b) {
    throw new BridgeError("UNSUPPORTED_TUPLET", "Conflicting tuplet numbers.", partId, measureIndex);
  }
  return Object.freeze({
    start: starts.length === 1,
    stop: stops.length === 1,
    ...(a !== undefined ? { number: a } : b !== undefined ? { number: b } : {}),
  });
}

function single(
  note: MusicXmlAdaptedNote,
  partId: string,
  measureIndex: number,
  context: EventProjectionContext = {},
): ProjectedEvent {
  notePolicy(note, partId, measureIndex);
  const effectiveGrace =
    context.grace ?? CURSOR_GRACE_PLAN.get(note);
  const articulations =
    supportedArticulations(
      note,
      partId,
      measureIndex,
    );

  // PHASE16_R9_GRACE_DYNAMIC
  if (
    effectiveGrace !== undefined
    && (
      context.wordExpressions !== undefined
      || articulations !== undefined
    )
  ) {
    throw new BridgeError(
      "UNSUPPORTED_GRACE",
      "Grace notes combined with word expressions or articulations remain deferred; an independent dynamic before an admitted grace note is supported.",
      partId,
      measureIndex,
    );
  }

  const d = duration(
    note,
    partId,
    measureIndex,
  );
  const m = marker(
    [note],
    partId,
    measureIndex,
  );

  if (note.kind === "rest") {
    if (effectiveGrace !== undefined) {
      throw new BridgeError(
        "UNSUPPORTED_GRACE",
        "Grace projection cannot target a rest.",
        partId,
        measureIndex,
      );
    }

    if (note.ties.length > 0) {
      throw new BridgeError(
        "INVALID_SOURCE_STRUCTURE",
        "Rest cannot carry tie.",
        partId,
        measureIndex,
      );
    }

    const event: StatefulRestEvent =
      Object.freeze({
        ...(DIRECTION_MARK_PLAN.get(note) ?? {}),
        kind: "rest",
        value: d.value,
        ...(d.augmentationDots > 0
          ? {
              augmentationDots:
                d.augmentationDots,
            }
          : {}),
        ...(context.dynamic !== undefined
          ? { dynamic: context.dynamic }
          : {}),
        ...(context.wordExpressions !== undefined
          ? {
              wordExpressions:
                context.wordExpressions,
            }
          : {}),
        ...(context.slurAfter !== undefined
          ? { slurAfter: context.slurAfter }
          : {}),
      });

    return Object.freeze({
      event,
      triplet: d.triplet,
      start: m.start,
      stop: m.stop,
      ...(m.number !== undefined
        ? { number: m.number }
        : {}),
    });
  }

  const p = pitch(
    note,
    partId,
    measureIndex,
  );

  const event: StatefulNoteEvent =
    Object.freeze({
      ...(DIRECTION_MARK_PLAN.get(note) ?? {}),
      kind: "note",
      midiPitch: p.midiPitch,
      ...(p.written !== undefined
        ? { writtenPitch: p.written }
        : {}),
      value: d.value,
      ...(d.augmentationDots > 0
        ? {
            augmentationDots:
              d.augmentationDots,
          }
        : {}),
      ...(note.ties.includes("start")
        ? { tie: true }
        : {}),
      ...(articulations !== undefined
        ? { articulations }
        : {}),
      ...(effectiveGrace !== undefined
        ? { grace: effectiveGrace }
        : {}),
      ...(context.dynamic !== undefined
        ? { dynamic: context.dynamic }
        : {}),
      ...(context.wordExpressions !== undefined
        ? {
            wordExpressions:
              context.wordExpressions,
          }
        : {}),
      ...(context.slurAfter !== undefined
        ? { slurAfter: context.slurAfter }
        : {}),
    });

  return Object.freeze({
    event,
    triplet: d.triplet,
    start: m.start,
    stop: m.stop,
    ...(m.number !== undefined
      ? { number: m.number }
      : {}),
  });
}

function chord(
  notes: readonly MusicXmlAdaptedNote[],
  partId: string,
  measureIndex: number,
  context: EventProjectionContext = {},
): ProjectedEvent {
  if (notes.length < 2) throw new BridgeError("INVALID_CHORD", "Chord needs at least two notes.", partId, measureIndex);
  for (const note of notes) {
    notePolicy(note, partId, measureIndex);
    if (note.kind === "rest") throw new BridgeError("INVALID_CHORD", "Chord cannot contain rest.", partId, measureIndex);
  }

  const first = notes[0]!;
  const plannedCursorGrace = CURSOR_GRACE_PLAN.get(first);
  if (
    context.grace !== undefined
    || plannedCursorGrace !== undefined
  ) {
    throw new BridgeError(
      "UNSUPPORTED_GRACE",
      "Chord appoggiaturas are preserved but deferred from the Phase 16.5 executable subset.",
      partId,
      measureIndex,
    );
  }
  const articulations = supportedArticulations(first, partId, measureIndex);
  for (const continuation of notes.slice(1)) {
    if ((continuation.metadata.articulations?.length ?? 0) > 0) {
      throw new BridgeError(
        "UNSUPPORTED_ARTICULATION",
        "Phase 16.5D3 accepts chord articulation only on the base MusicXML note, not on <chord/> continuation members.",
        partId,
        measureIndex,
      );
    }
  }

  const d = duration(first, partId, measureIndex);
  for (const note of notes.slice(1)) {
    const other = duration(note, partId, measureIndex);
    if (
      other.value !== d.value
      || other.augmentationDots !== d.augmentationDots
      || other.triplet !== d.triplet
      || cmp(note.durationQuarter, first.durationQuarter) !== 0
    ) {
      throw new BridgeError("INVALID_CHORD", "Chord members have different duration semantics.", partId, measureIndex);
    }
  }

  const pitches = notes.map((note) => pitch(note, partId, measureIndex));
  const tieStartIndexes =
    notes
      .map((note, index) =>
        note.ties.includes("start")
          ? index
          : -1,
      )
      .filter((index) => index >= 0);

  const tieCount = tieStartIndexes.length;

  // PHASE16_R8_SINGLE_MEMBER_CHORD_TIE
  //
  // BANA MBC 2015 10.1 / 10.2:
  // one tied note inside a chord uses the single-tie sign on that
  // written note/interval. Two or more tied members may use chord-tie
  // semantics, but the existing bridge keeps non-total multi-member
  // partial ties fail-closed until successor-chord repetition semantics
  // are frozen explicitly.
  if (
    tieCount > 1
    && tieCount !== notes.length
  ) {
    throw new BridgeError(
      "PARTIAL_CHORD_TIE",
      "Multiple but non-total chord-member ties require a dedicated repeated-versus-tied successor-chord contract.",
      partId,
      measureIndex,
    );
  }

  const singleTieMidiPitch =
    tieCount === 1
      ? pitches[tieStartIndexes[0]!]!.midiPitch
      : undefined;

  const m = marker(notes, partId, measureIndex);
  const event: StatefulChordEvent = Object.freeze({
    ...(DIRECTION_MARK_PLAN.get(first) ?? {}),
    kind: "chord",
    midiPitches: Object.freeze(pitches.map((p) => p.midiPitch)),
    ...(pitches.every((p) => p.written !== undefined)
      ? {
          writtenPitches: Object.freeze(
            pitches.map((p) => p.written!),
          ),
        }
      : {}),
    value: d.value,
    ...(d.augmentationDots > 0 ? { augmentationDots: d.augmentationDots } : {}),
    ...(tieCount === notes.length ? { tieAll: true } : {}),
    ...(singleTieMidiPitch !== undefined
      ? { singleTieMidiPitch }
      : {}),
    ...(articulations !== undefined ? { articulations } : {}),
    ...(context.dynamic !== undefined ? { dynamic: context.dynamic } : {}),
    ...(context.wordExpressions !== undefined
      ? { wordExpressions: context.wordExpressions }
      : {}),
    ...(context.slurAfter !== undefined ? { slurAfter: context.slurAfter } : {}),
  });

  return Object.freeze({
    event, triplet: d.triplet, start: m.start, stop: m.stop,
    ...(m.number !== undefined ? { number: m.number } : {}),
  });
}

function tripletStart(event: StatefulLinearMusicEvent): StatefulLinearMusicEvent {
  return Object.freeze({ ...event, tripletStart: true });
}

function groupTriplets(
  projected: readonly ProjectedEvent[],
  partId: string,
  measureIndex: number,
): readonly StatefulLinearMusicEvent[] {
  const out: StatefulLinearMusicEvent[] = [];
  let i = 0;
  while (i < projected.length) {
    const current = projected[i]!;
    if (!current.triplet) {
      if (current.start || current.stop) {
        throw new BridgeError("UNSUPPORTED_TUPLET", "Tuplet marker on non-triplet duration.", partId, measureIndex);
      }
      out.push(current.event);
      i += 1;
      continue;
    }

    const g = projected.slice(i, i + 3);
    if (
      !current.start
      || g.length !== 3
      || g.some((x) => !x.triplet)
      || g[1]!.start
      || g[0]!.stop
      || g[1]!.stop
      || !g[2]!.stop
    ) {
      throw new BridgeError(
        "UNSUPPORTED_TUPLET",
        "Pack B requires one complete explicit three-event 3:2 triplet group.",
        partId, measureIndex,
      );
    }

    const nums = g.map((x) => x.number).filter((x): x is number => x !== undefined);
    if (new Set(nums).size > 1) {
      throw new BridgeError("UNSUPPORTED_TUPLET", "Conflicting triplet numbers.", partId, measureIndex);
    }

    out.push(tripletStart(g[0]!.event), g[1]!.event, g[2]!.event);
    i += 3;
  }
  return Object.freeze(out);
}


function meterLength(
  meter: Readonly<{ numerator: number; denominator: number }>,
): MusicXmlFraction {
  if (
    !Number.isInteger(meter.numerator)
    || meter.numerator <= 0
    || !Number.isInteger(meter.denominator)
    || meter.denominator <= 0
  ) {
    throw new BridgeError(
      "UNSUPPORTED_POLYPHONY",
      `Invalid active meter ${meter.numerator}/${meter.denominator}.`,
    );
  }
  const numerator = meter.numerator * 4;
  const denominator = meter.denominator;
  const divisor = gcd(numerator, denominator);
  return Object.freeze({
    numerator: numerator / divisor,
    denominator: denominator / divisor,
  });
}

function transcriberAddedGap(
  gap: MusicXmlFraction,
  partId: string,
  measureIndex: number,
): ProjectedEvent {
  const mapped = NORMAL[key(gap)];
  if (mapped === undefined) {
    throw new BridgeError(
      "UNSUPPORTED_POLYPHONY_REST_GAP",
      `Implied in-accord voice rest gap ${key(gap)} quarter notes is not atomic in Phase 16.5A.`,
      partId,
      measureIndex,
    );
  }

  const event: StatefulRestEvent = Object.freeze({
    kind: "rest",
    value: mapped.value,
    ...(mapped.dots > 0 ? { augmentationDots: mapped.dots } : {}),
    transcriberAdded: true,
  });

  return Object.freeze({
    event,
    triplet: false,
    start: false,
    stop: false,
  });
}


type KeyboardLane = 1 | 2;

interface KeyboardVoiceProfile {
  readonly lane: KeyboardLane;
  readonly medianMidi?: number;
}

interface KeyboardImportProfile {
  readonly byVoice: ReadonlyMap<string, KeyboardVoiceProfile>;
  readonly rightOrder: readonly string[];
  readonly leftOrder: readonly string[];
}

function keyboardMedian(values: readonly number[]): number {
  if (values.length === 0) {
    throw new Error("keyboard median requires at least one pitch");
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 1
    ? sorted[middle]!
    : (sorted[middle - 1]! + sorted[middle]!) / 2;
}

function keyboardImportProfile(
  part: MusicXmlAdaptedPart,
  diagnostics: MusicXmlToBrailleDiagnostic[],
): KeyboardImportProfile | undefined {
  const cursorMeasures =
    part.measures.filter(
      (measure) => measure.cursorOperations.length > 0,
    );

  if (cursorMeasures.length === 0) return undefined;

  const cursorStaffs = new Set<number>();

  for (const measure of cursorMeasures) {
    for (const note of measure.notes) {
      if (note.metadata.staff !== undefined) {
        cursorStaffs.add(note.metadata.staff);
      }
    }
  }

  if (cursorStaffs.size <= 1) return undefined;

  if (
    cursorStaffs.size !== 2
    || !cursorStaffs.has(1)
    || !cursorStaffs.has(2)
  ) {
    throw new BridgeError(
      "UNSUPPORTED_MULTI_STAFF_POLYPHONY",
      `Keyboard compatibility requires exactly MusicXML staff 1 and 2; got ${[...cursorStaffs].join(",")}.`,
      part.id,
    );
  }

  // Import normalization:
  // voice/staff identity includes BOTH notes and rests.
  // Sounding pitch is sampled independently only for register ordering.
  const counts =
    new Map<string, Map<number, number>>();
  const pitches =
    new Map<string, number[]>();

  for (const measure of part.measures) {
    for (const note of measure.notes) {
      const voice = note.metadata.voice;
      const staff = note.metadata.staff;

      if (
        voice === undefined
        || voice.trim() === ""
        || staff === undefined
      ) {
        throw new BridgeError(
          "UNSUPPORTED_MULTI_STAFF_POLYPHONY",
          "Keyboard compatibility requires explicit voice and staff for every retained note/rest.",
          part.id,
          measure.index,
        );
      }

      if (staff !== 1 && staff !== 2) {
        throw new BridgeError(
          "UNSUPPORTED_MULTI_STAFF_POLYPHONY",
          `Keyboard compatibility only accepts staff 1/2; got ${staff}.`,
          part.id,
          measure.index,
        );
      }

      let byStaff = counts.get(voice);
      if (byStaff === undefined) {
        byStaff = new Map<number, number>();
        counts.set(voice, byStaff);
      }
      byStaff.set(
        staff,
        (byStaff.get(staff) ?? 0) + 1,
      );

      if (note.kind !== "rest") {
        let voicePitches = pitches.get(voice);
        if (voicePitches === undefined) {
          voicePitches = [];
          pitches.set(voice, voicePitches);
        }
        voicePitches.push(
          pitch(
            note,
            part.id,
            measure.index,
          ).midiPitch,
        );
      }
    }
  }

  const byVoice =
    new Map<string, KeyboardVoiceProfile>();
  const restOnlyVoices: string[] = [];

  for (const [voice, byStaff] of counts.entries()) {
    const ranked =
      [...byStaff.entries()].sort(
        (a, b) => b[1] - a[1] || a[0] - b[0],
      );

    if (
      ranked.length > 1
      && ranked[0]![1] === ranked[1]![1]
    ) {
      throw new BridgeError(
        "UNSUPPORTED_MULTI_STAFF_POLYPHONY",
        `Voice ${voice} has no unique dominant printed staff.`,
        part.id,
      );
    }

    const lane = ranked[0]?.[0];
    if (lane !== 1 && lane !== 2) {
      throw new BridgeError(
        "UNSUPPORTED_MULTI_STAFF_POLYPHONY",
        `Voice ${voice} has no valid keyboard hand lane.`,
        part.id,
      );
    }

    const voicePitches =
      pitches.get(voice) ?? [];

    const medianMidi =
      voicePitches.length === 0
        ? undefined
        : keyboardMedian(voicePitches);

    if (medianMidi === undefined) {
      restOnlyVoices.push(voice);
    }

    byVoice.set(
      voice,
      Object.freeze({
        lane,
        ...(medianMidi !== undefined
          ? { medianMidi }
          : {}),
      }),
    );
  }

  const orderForLane = (
    lane: KeyboardLane,
  ): readonly string[] => {
    const entries =
      [...byVoice.entries()].filter(
        ([, profile]) => profile.lane === lane,
      );

    // One structural voice in a hand needs no pitch-derived ordering.
    if (entries.length <= 1) {
      return Object.freeze(
        entries.map(([voice]) => voice),
      );
    }

    const withoutRegister =
      entries.filter(
        ([, profile]) =>
          profile.medianMidi === undefined,
      );

    // Multiple same-hand voices DO require register ordering.
    // Never invent a fake median pitch for a rest-only voice.
    if (withoutRegister.length > 0) {
      throw new BridgeError(
        "UNSUPPORTED_CROSSED_VOICES",
        `Keyboard hand ${lane} contains multiple persistent voices but ${withoutRegister.map(([voice]) => voice).join(", ")} never sound; register ordering would require a transcriber choice.`,
        part.id,
      );
    }

    entries.sort((a, b) =>
      lane === 1
        ? b[1].medianMidi! - a[1].medianMidi!
          || a[0].localeCompare(b[0])
        : a[1].medianMidi! - b[1].medianMidi!
          || a[0].localeCompare(b[0]),
    );

    for (
      let index = 0;
      index + 1 < entries.length;
      index += 1
    ) {
      if (
        entries[index]![1].medianMidi
        === entries[index + 1]![1].medianMidi
      ) {
        throw new BridgeError(
          "UNSUPPORTED_CROSSED_VOICES",
          `Voices ${entries[index]![0]} and ${entries[index + 1]![0]} have identical whole-part median register.`,
          part.id,
        );
      }
    }

    return Object.freeze(
      entries.map(([voice]) => voice),
    );
  };

  const rightOrder = orderForLane(1);
  const leftOrder = orderForLane(2);

  if (
    rightOrder.length === 0
    || leftOrder.length === 0
  ) {
    throw new BridgeError(
      "UNSUPPORTED_MULTI_STAFF_POLYPHONY",
      "Keyboard compatibility requires at least one derived voice in each hand.",
      part.id,
    );
  }

  diagnostics.push(Object.freeze({
    code: "KEYBOARD_DOMINANT_VOICE_PROFILE_APPLIED",
    message:
      "Persistent MusicXML voices were mapped to BANA right/left hand lanes by unique whole-part dominant printed staff; voice identity is structural and independent of sounding pitch.",
    partId: part.id,
  }));

  if (restOnlyVoices.length > 0) {
    diagnostics.push(Object.freeze({
      code: "KEYBOARD_STRUCTURAL_REST_ONLY_VOICE",
      message:
        `Rest-only MusicXML voice(s) ${restOnlyVoices.join(", ")} were retained structurally without inventing a pitch; execution is allowed only where same-hand ordering is unambiguous.`,
      partId: part.id,
    }));
  }

  return Object.freeze({
    byVoice,
    rightOrder,
    leftOrder,
  });
}


interface ExplicitVoiceGroup {
  readonly key: string;
  readonly voice: string;
  readonly staff: number;
  readonly notes: readonly MusicXmlAdaptedNote[];
  readonly minMidi?: number;
  readonly maxMidi?: number;
}

function voiceRegister(
  notes: readonly MusicXmlAdaptedNote[],
  partId: string,
  measureIndex: number,
  fallbackMidi?: number,
): Readonly<{ minMidi: number; maxMidi: number }> {
  const sounding: number[] = [];
  for (const note of notes) {
    if (note.kind === "rest") continue;
    sounding.push(pitch(note, partId, measureIndex).midiPitch);
  }
  if (sounding.length === 0) {
    if (fallbackMidi !== undefined) {
      return Object.freeze({
        minMidi: fallbackMidi,
        maxMidi: fallbackMidi,
      });
    }

    throw new BridgeError(
      "UNSUPPORTED_POLYPHONY",
      "An all-rest in-accord voice has no safe local register and no stable part-level fallback.",
      partId,
      measureIndex,
    );
  }
  return Object.freeze({
    minMidi: Math.min(...sounding),
    maxMidi: Math.max(...sounding),
  });
}

function explicitVoiceGroups(
  measure: MusicXmlAdaptedMeasure,
  partId: string,
  keyboardProfile?: KeyboardImportProfile,
): readonly ExplicitVoiceGroup[] {
  const grouped = new Map<
    string,
    { voice: string; staff: number; notes: MusicXmlAdaptedNote[] }
  >();

  for (const note of measure.notes) {
    const voice = note.metadata.voice;

    if (
      voice === undefined
      || voice.trim() === ""
    ) {
      throw new BridgeError(
        "UNSUPPORTED_POLYPHONY",
        "MusicXML backup/forward polyphony requires explicit <voice> identity.",
        partId,
        measure.index,
      );
    }

    const sourceStaff =
      note.metadata.staff ?? 1;

    const profile =
      keyboardProfile?.byVoice.get(voice);

    if (
      keyboardProfile !== undefined
      && profile === undefined
    ) {
      throw new BridgeError(
        "UNSUPPORTED_MULTI_STAFF_POLYPHONY",
        `Voice ${voice} is absent from the keyboard hand profile.`,
        partId,
        measure.index,
      );
    }

    const staff =
      profile?.lane ?? sourceStaff;

    const groupKey =
      keyboardProfile === undefined
        ? `${staff}:${voice}`
        : `voice:${voice}`;

    let group = grouped.get(groupKey);

    if (group === undefined) {
      group = {
        voice,
        staff,
        notes: [],
      };
      grouped.set(groupKey, group);
    }

    group.notes.push(note);
  }

  if (
    grouped.size < 2
    && keyboardProfile === undefined
  ) {
    throw new BridgeError(
      "UNSUPPORTED_CURSOR_OPERATION",
      "MusicXML cursor operations are present but fewer than two explicit voice streams were recovered.",
      partId,
      measure.index,
    );
  }

  const staffs =
    new Set(
      [...grouped.values()].map(
        (group) => group.staff,
      ),
    );

  if (
    keyboardProfile === undefined
    && staffs.size !== 1
  ) {
    throw new BridgeError(
      "UNSUPPORTED_MULTI_STAFF_POLYPHONY",
      "Generic H4C full-measure in-accord requires all explicit voices on one MusicXML staff.",
      partId,
      measure.index,
    );
  }

  return Object.freeze(
    [...grouped.entries()].map(
      ([groupKey, group]) => {
        const profile =
          keyboardProfile?.byVoice.get(
            group.voice,
          );

        const hasSounding =
          group.notes.some(
            (note) => note.kind !== "rest",
          );

        let register:
          | Readonly<{
              minMidi: number;
              maxMidi: number;
            }>
          | undefined;

        if (keyboardProfile === undefined) {
          register = voiceRegister(
            group.notes,
            partId,
            measure.index,
          );
        } else if (
          hasSounding
          || profile?.medianMidi !== undefined
        ) {
          register = voiceRegister(
            group.notes,
            partId,
            measure.index,
            profile?.medianMidi,
          );
        }

        // A keyboard rest-only structural voice may intentionally
        // have no register. keyboardImportProfile already proved that
        // no same-hand register ordering is required. No fake pitch.
        return Object.freeze({
          key: groupKey,
          voice: group.voice,
          staff: group.staff,
          notes:
            Object.freeze(
              [...group.notes],
            ),
          ...(register !== undefined
            ? {
                minMidi: register.minMidi,
                maxMidi: register.maxMidi,
              }
            : {}),
        });
      },
    ),
  );
}

function orderVoiceGroups(
  groups: readonly ExplicitVoiceGroup[],
  clefSign: string,
  partId: string,
  measureIndex: number,
): readonly ExplicitVoiceGroup[] {
  if (
    clefSign !== "G"
    && clefSign !== "F"
  ) {
    throw new BridgeError(
      "UNSUPPORTED_POLYPHONY",
      `Phase 16.5A requires an explicit G or F clef for voice ordering; got ${clefSign}.`,
      partId,
      measureIndex,
    );
  }

  if (
    groups.some(
      (group) =>
        group.minMidi === undefined
        || group.maxMidi === undefined,
    )
  ) {
    throw new BridgeError(
      "UNSUPPORTED_POLYPHONY",
      "Generic H4 ordering requires a sounding register for every voice; register-free rest voices are confined to the keyboard compatibility path.",
      partId,
      measureIndex,
    );
  }

  const ordered =
    [...groups].sort((a, b) =>
      clefSign === "G"
        ? b.maxMidi! - a.maxMidi!
          || b.minMidi! - a.minMidi!
          || a.key.localeCompare(b.key)
        : a.minMidi! - b.minMidi!
          || a.maxMidi! - b.maxMidi!
          || a.key.localeCompare(b.key),
    );

  for (
    let index = 0;
    index + 1 < ordered.length;
    index += 1
  ) {
    const first = ordered[index]!;
    const second = ordered[index + 1]!;

    const separated =
      clefSign === "G"
        ? first.minMidi! > second.maxMidi!
        : first.maxMidi! < second.minMidi!;

    if (!separated) {
      throw new BridgeError(
        "UNSUPPORTED_CROSSED_VOICES",
        "Explicit MusicXML voices overlap or cross in register; generic H4 ordering remains fail-closed.",
        partId,
        measureIndex,
      );
    }
  }

  return Object.freeze(ordered);
}

function voiceAction(
  group: ExplicitVoiceGroup,
  measureLength: MusicXmlFraction,
  partId: string,
  measureIndex: number,
  dynamicByOnset?: ReadonlyMap<
    string,
    StatefulDynamic
  >,
  wordExpressionsByOnset?: ReadonlyMap<
    string,
    readonly StatefulWordExpression[]
  >,
): StatefulInAccordAction {
  const sourceOrder =
    new Map<MusicXmlAdaptedNote, number>();

  group.notes.forEach(
    (note, index) =>
      sourceOrder.set(note, index),
  );

  const notes =
    [...group.notes].sort((a, b) => {
      const onset =
        cmp(
          a.onsetQuarter,
          b.onsetQuarter,
        );

      if (onset !== 0) return onset;

      return (
        (sourceOrder.get(a) ?? 0)
        - (sourceOrder.get(b) ?? 0)
      );
    });

  const slurGroups: LinearSourceGroup[] = [];
  let slurIndex = 0;

  while (slurIndex < notes.length) {
    const base = notes[slurIndex]!;

    if (base.chord) {
      throw new BridgeError(
        "INVALID_CHORD",
        "A keyboard voice begins a slur source group with a chord continuation.",
        partId,
        measureIndex,
      );
    }

    const members:
      MusicXmlAdaptedNote[] =
        [base];

    let next = slurIndex + 1;

    while (
      next < notes.length
      && notes[next]!.chord
    ) {
      const member = notes[next]!;

      if (
        cmp(
          member.onsetQuarter,
          base.onsetQuarter,
        ) !== 0
      ) {
        throw new BridgeError(
          "INVALID_CHORD",
          "A keyboard chord continuation has a different onset.",
          partId,
          measureIndex,
        );
      }

      members.push(member);
      next += 1;
    }

    slurGroups.push(
      Object.freeze({
        base,
        members:
          Object.freeze(members),
      }),
    );

    slurIndex = next;
  }

  const slurs =
    shortSlurAfter(
      Object.freeze(slurGroups),
      partId,
      measureIndex,
    );

  let cursor: MusicXmlFraction =
    Object.freeze({
      numerator: 0,
      denominator: 1,
    });

  const projected:
    ProjectedEvent[] = [];

  let index = 0;

  while (index < notes.length) {
    const first = notes[index]!;

    if (first.chord) {
      throw new BridgeError(
        "INVALID_CHORD",
        "A voice begins an onset group with a chord-continuation note.",
        partId,
        measureIndex,
      );
    }

    const relation =
      cmp(
        first.onsetQuarter,
        cursor,
      );

    if (relation < 0) {
      throw new BridgeError(
        "UNSUPPORTED_POLYPHONY",
        `Voice ${group.voice} contains overlapping independent events.`,
        partId,
        measureIndex,
      );
    }

    if (relation > 0) {
      projected.push(
        transcriberAddedGap(
          Object.freeze({
            numerator:
              first.onsetQuarter.numerator
              * cursor.denominator
              - cursor.numerator
              * first.onsetQuarter.denominator,
            denominator:
              first.onsetQuarter.denominator
              * cursor.denominator,
          }),
          partId,
          measureIndex,
        ),
      );
    }

    const chordGroup:
      MusicXmlAdaptedNote[] =
        [first];

    let next = index + 1;

    while (
      next < notes.length
      && notes[next]!.chord
    ) {
      const member = notes[next]!;

      if (
        cmp(
          member.onsetQuarter,
          first.onsetQuarter,
        ) !== 0
      ) {
        throw new BridgeError(
          "INVALID_CHORD",
          "Chord continuation has a different onset inside an explicit voice.",
          partId,
          measureIndex,
        );
      }

      chordGroup.push(member);
      next += 1;
    }

    const onsetKey =
      `${first.onsetQuarter.numerator}/${first.onsetQuarter.denominator}`;

    const dynamic =
      dynamicByOnset?.get(onsetKey);

    const wordExpressions =
      wordExpressionsByOnset?.get(
        onsetKey,
      );

    const context:
      EventProjectionContext =
        Object.freeze({
          ...(dynamic !== undefined
            ? { dynamic }
            : {}),
          ...(wordExpressions !== undefined
            && wordExpressions.length > 0
            ? { wordExpressions }
            : {}),
          ...(slurs.get(first.sourceOrder) !== undefined
            ? {
                slurAfter:
                  slurs.get(first.sourceOrder)!,
              }
            : {}),
        });

    projected.push(
      chordGroup.length === 1
        ? single(
            first,
            partId,
            measureIndex,
            context,
          )
        : chord(
            Object.freeze(
              chordGroup,
            ),
            partId,
            measureIndex,
            context,
          ),
    );

    cursor =
      add(
        first.onsetQuarter,
        first.durationQuarter,
      );

    index = next;
  }

  const endRelation =
    cmp(
      cursor,
      measureLength,
    );

  if (endRelation > 0) {
    throw new BridgeError(
      "UNSUPPORTED_POLYPHONY",
      `Voice ${group.voice} exceeds the active measure length.`,
      partId,
      measureIndex,
    );
  }

  if (endRelation < 0) {
    projected.push(
      transcriberAddedGap(
        Object.freeze({
          numerator:
            measureLength.numerator
            * cursor.denominator
            - cursor.numerator
            * measureLength.denominator,
          denominator:
            measureLength.denominator
            * cursor.denominator,
        }),
        partId,
        measureIndex,
      ),
    );
  }

  return Object.freeze({
    events:
      groupTriplets(
        Object.freeze(projected),
        partId,
        measureIndex,
      ),
  });
}



function keyboardParallelEvent(
  measure: MusicXmlAdaptedMeasure,
  partId: string,
  activeMeter:
    Readonly<{ numerator: number; denominator: number }>
    | undefined,
  keyboardProfile: KeyboardImportProfile,
  wordExpressions:
    readonly StatefulWordExpression[],
): StatefulKeyboardParallelEvent {
  if (activeMeter === undefined) {
    throw new BridgeError(
      "UNSUPPORTED_POLYPHONY",
      "Keyboard parallel requires an active MusicXML meter.",
      partId,
      measure.index,
    );
  }

  const fullLength = meterLength(activeMeter);
  const contentEnd = retainedContentEnd(measure);
  const lengthRelation = cmp(contentEnd, fullLength);

  if (lengthRelation > 0) {
    throw new BridgeError(
      "UNSUPPORTED_POLYPHONY",
      "MusicXML retained keyboard content exceeds the active measure length.",
      partId,
      measure.index,
    );
  }

  // PHASE16_R6_INITIAL_IMPLICIT_PICKUP
  // MusicXML implicit=yes also has non-pickup uses. This bounded compatibility
  // contract recognizes only an initial implicit measure as a pickup.
  const initialImplicitPickup =
    measure.implicit === true
    && measure.index === 0
    && lengthRelation < 0;

  if (
    measure.implicit === true
    && measure.index !== 0
    && lengthRelation < 0
  ) {
    throw new BridgeError(
      "UNSUPPORTED_POLYPHONY",
      "A non-initial implicit incomplete MusicXML keyboard measure is outside the bounded pickup contract.",
      partId,
      measure.index,
    );
  }

  if (
    initialImplicitPickup
    && cmp(
      contentEnd,
      Object.freeze({ numerator: 0, denominator: 1 }),
    ) <= 0
  ) {
    throw new BridgeError(
      "UNSUPPORTED_POLYPHONY",
      "An initial implicit MusicXML pickup has no retained source-derived duration.",
      partId,
      measure.index,
    );
  }

  const actionLength =
    initialImplicitPickup
      ? contentEnd
      : fullLength;

  const groups =
    explicitVoiceGroups(
      measure,
      partId,
      keyboardProfile,
    );

  const rightRank =
    new Map(
      keyboardProfile.rightOrder.map(
        (voice, index) => [voice, index] as const,
      ),
    );

  const leftRank =
    new Map(
      keyboardProfile.leftOrder.map(
        (voice, index) => [voice, index] as const,
      ),
    );

  const laneGroups = (
    lane: KeyboardLane,
  ): readonly ExplicitVoiceGroup[] => {
    const rank = lane === 1 ? rightRank : leftRank;

    return Object.freeze(
      groups
        .filter((group) => group.staff === lane)
        .sort(
          (a, b) =>
            (rank.get(a.voice) ?? Number.MAX_SAFE_INTEGER)
            - (rank.get(b.voice) ?? Number.MAX_SAFE_INTEGER),
        ),
    );
  };

  const rightGroups = laneGroups(1);
  const leftGroups = laneGroups(2);

  const dynamicMaps =
    new Map<string, Map<string, StatefulDynamic>>();

  const wordMaps =
    new Map<
      string,
      Map<
        string,
        readonly StatefulWordExpression[]
      >
    >();

  for (const direction of measure.directions) {
    if (direction.dynamics.length === 0) continue;

    if (direction.dynamics.length !== 1) {
      throw new BridgeError(
        "UNSUPPORTED_DYNAMICS",
        "Keyboard parallel accepts one independent dynamic at one source position.",
        partId,
        measure.index,
      );
    }

    const raw = direction.dynamics[0]!;

    if (!SUPPORTED_DYNAMICS.has(raw as StatefulDynamic)) {
      throw new BridgeError(
        "UNSUPPORTED_DYNAMICS",
        `Dynamic ${raw} is outside the real-score dynamic contract.`,
        partId,
        measure.index,
      );
    }

    if (
      direction.staff !== 1
      && direction.staff !== 2
    ) {
      throw new BridgeError(
        "UNSUPPORTED_DYNAMICS",
        "Keyboard dynamic requires explicit staff 1/2 scope.",
        partId,
        measure.index,
      );
    }

    if (direction.onsetQuarter === undefined) {
      throw new BridgeError(
        "UNSUPPORTED_DYNAMICS",
        "Keyboard dynamic has no preserved source onset.",
        partId,
        measure.index,
      );
    }

    const candidates =
      direction.staff === 1
        ? rightGroups
        : leftGroups;

    const host =
      candidates.find((group) =>
        group.notes.some(
          (note) =>
            !note.chord
            && cmp(
              note.onsetQuarter,
              direction.onsetQuarter!,
            ) === 0,
        ),
      );

    if (host === undefined) {
      throw new BridgeError(
        "UNSUPPORTED_DYNAMICS",
        "No derived hand-part event is active at the dynamic onset.",
        partId,
        measure.index,
      );
    }

    let map = dynamicMaps.get(host.voice);
    if (map === undefined) {
      map = new Map<string, StatefulDynamic>();
      dynamicMaps.set(host.voice, map);
    }

    const key =
      `${direction.onsetQuarter.numerator}/${direction.onsetQuarter.denominator}`;

    const prior = map.get(key);
    if (prior !== undefined && prior !== raw) {
      throw new BridgeError(
        "UNSUPPORTED_DYNAMICS",
        "Conflicting dynamics target one keyboard hand-part onset.",
        partId,
        measure.index,
      );
    }

    map.set(key, raw as StatefulDynamic);
  }


  for (const direction of measure.directions) {
    if (direction.words.length === 0 && direction.metronomes.length === 0) continue;

    if (direction.onsetQuarter === undefined) {
      throw new BridgeError(
        "UNSUPPORTED_DIRECTION_WORD_PLACEMENT",
        "Keyboard word expression has no parser-preserved onset.",
        partId,
        measure.index,
      );
    }

    const atMeasureStart =
      direction.onsetQuarter.numerator === 0;

    if (direction.staff === undefined) {
      // Unstaffed measure-start expressions are emitted once
      // before the keyboard parallel event.
      if (atMeasureStart) continue;

      throw new BridgeError(
        "UNSUPPORTED_DIRECTION_WORD_PLACEMENT",
        "An unstaffed mid-measure keyboard word expression remains ambiguous.",
        partId,
        measure.index,
      );
    }

    if (
      direction.staff !== 1
      && direction.staff !== 2
    ) {
      throw new BridgeError(
        "UNSUPPORTED_DIRECTION_WORD_PLACEMENT",
        `Keyboard word expression uses unsupported staff ${direction.staff}.`,
        partId,
        measure.index,
      );
    }

    const candidates =
      direction.staff === 1
        ? rightGroups
        : leftGroups;

    const host =
      candidates.find((group) =>
        group.notes.some(
          (note) =>
            !note.chord
            && cmp(
              note.onsetQuarter,
              direction.onsetQuarter!,
            ) === 0,
        ),
      );

    if (host === undefined) {
      if (
          KEYBOARD_GLOBAL_TEMPO_DIRECTIONS.has(
            direction,
          )
        ) {
          continue;
        }

        throw new BridgeError(
        "UNSUPPORTED_DIRECTION_WORD_PLACEMENT",
        "No derived hand-part event is active at the staff-scoped word-expression onset.",
        partId,
        measure.index,
      );
    }

    const expressions =
      stableTerminologyOrder(
        projectDirectionExpressions(
          direction,
          partId,
          measure.index,
        ),
      );

    let map = wordMaps.get(host.voice);

    if (map === undefined) {
      map =
        new Map<
          string,
          readonly StatefulWordExpression[]
        >();
      wordMaps.set(host.voice, map);
    }

    const key =
      `${direction.onsetQuarter.numerator}/${direction.onsetQuarter.denominator}`;

    const prior = map.get(key) ?? [];

    map.set(
      key,
      stableTerminologyOrder([
        ...prior,
        ...expressions,
      ]),
    );
  }

  const syntheticRestAction =
    (): StatefulInAccordAction =>
      Object.freeze({
        events: Object.freeze([
          transcriberAddedGap(
            actionLength,
            partId,
            measure.index,
          ).event,
        ]),
      });

  const actions = (
    laneGroupsValue:
      readonly ExplicitVoiceGroup[],
  ): readonly StatefulInAccordAction[] =>
    laneGroupsValue.length === 0
      ? Object.freeze([syntheticRestAction()])
      : Object.freeze(
          laneGroupsValue.map((group) =>
            voiceAction(
              group,
              actionLength,
              partId,
              measure.index,
              dynamicMaps.get(group.voice),
              wordMaps.get(group.voice),
            ),
          ),
        );

  return Object.freeze({
    kind: "keyboard-parallel",
    rightActions: actions(rightGroups),
    leftActions: actions(leftGroups),
    ...(wordExpressions.length > 0
      ? {
          wordExpressions:
            Object.freeze([...wordExpressions]),
        }
      : {}),
  });
}


function retainedContentEnd(
  measure: MusicXmlAdaptedMeasure,
): MusicXmlFraction {
  let end: MusicXmlFraction = Object.freeze({
    numerator: 0,
    denominator: 1,
  });

  for (const note of measure.notes) {
    const candidate = add(
      note.onsetQuarter,
      note.durationQuarter,
    );
    if (cmp(candidate, end) > 0) {
      end = candidate;
    }
  }

  return end;
}

function polyphonyInAccordEvent(
  measure: MusicXmlAdaptedMeasure,
  partId: string,
  activeMeter: Readonly<{ numerator: number; denominator: number }> | undefined,
  activeClefs: ReadonlyMap<number, string>,
  terminalMeasure: boolean,
  diagnostics: MusicXmlToBrailleDiagnostic[],
): StatefulFullMeasureInAccordEvent | StatefulPartMeasureInAccordEvent {
  if (activeMeter === undefined) {
    throw new BridgeError(
      "UNSUPPORTED_POLYPHONY",
      "H4C/H4D in-accord requires an active MusicXML meter.",
      partId,
      measure.index,
    );
  }

  const groups = explicitVoiceGroups(measure, partId);
  const staff = groups[0]!.staff;
  const clefSign = activeClefs.get(staff);
  if (clefSign === undefined) {
    throw new BridgeError(
      "UNSUPPORTED_POLYPHONY",
      `No active MusicXML clef is available for staff ${staff}.`,
      partId,
      measure.index,
    );
  }

  const ordered = orderVoiceGroups(
    groups,
    clefSign,
    partId,
    measure.index,
  );

  const fullLength = meterLength(activeMeter);
  const contentEnd = retainedContentEnd(measure);
  const lengthRelation = cmp(contentEnd, fullLength);

  // PHASE16_R6_INITIAL_IMPLICIT_PICKUP
  // MusicXML implicit=yes is broader than pickup semantics, therefore only
  // the first implicit incomplete measure is promoted to the existing
  // source-derived part-measure in-accord profile.
  const initialImplicitPickup =
    measure.implicit === true
    && measure.index === 0
    && lengthRelation < 0;

  if (lengthRelation > 0) {
    throw new BridgeError(
      "UNSUPPORTED_POLYPHONY",
      "MusicXML retained polyphonic content exceeds the active measure length.",
      partId,
      measure.index,
    );
  }

  if (lengthRelation === 0) {
    return Object.freeze({
      kind: "full-measure-in-accord",
      actions: Object.freeze(
        ordered.map((group) =>
          voiceAction(
            group,
            fullLength,
            partId,
            measure.index,
          ),
        ),
      ),
    });
  }

  if (!terminalMeasure && !initialImplicitPickup) {
    throw new BridgeError(
      "UNSUPPORTED_NONTERMINAL_PART_MEASURE",
      "Part-measure in-accord is bounded to either an initial implicit pickup or the terminal incomplete measure of a MusicXML part.",
      partId,
      measure.index,
    );
  }

  if (cmp(contentEnd, Object.freeze({ numerator: 0, denominator: 1 })) <= 0) {
    throw new BridgeError(
      "UNSUPPORTED_POLYPHONY",
      "Terminal H4D section has no retained source-derived duration.",
      partId,
      measure.index,
    );
  }

  diagnostics.push(Object.freeze({
    code: "PART_MEASURE_IN_ACCORD_DERIVED",
    message:
      initialImplicitPickup
        ? "An initial implicit MusicXML pickup was represented by the existing source-derived part-measure in-accord profile; the nominal meter tail was not synthesized as silence."
        : "A terminal incomplete MusicXML measure was represented by the frozen single-section H4D part-measure in-accord profile; no Braille multi-section layout was invented.",
    partId,
    measureIndex: measure.index,
  }));

  return Object.freeze({
    kind: "part-measure-in-accord",
    actions: Object.freeze(
      ordered.map((group) =>
        voiceAction(
          group,
          contentEnd,
          partId,
          measure.index,
        ),
      ),
    ),
  });
}

function measureEvents(
  measure: MusicXmlAdaptedMeasure,
  partId: string,
  activeMeter: Readonly<{ numerator: number; denominator: number }> | undefined,
  activeClefs: ReadonlyMap<number, string>,
  terminalMeasure: boolean,
  diagnostics: MusicXmlToBrailleDiagnostic[],
  keyboardProfile?: KeyboardImportProfile,
): readonly StatefulMusicEvent[] {
  if (measure.cursorOperations.length > 0) {
    if (
      measure.notes.some((note) => note.grace)
      && keyboardProfile === undefined
    ) {
      throw new BridgeError(
        "UNSUPPORTED_GRACE",
        "Grace notes inside backup/forward polyphony are deferred from Phase 16.5.",
        partId,
        measure.index,
      );
    }
    if (
      keyboardProfile === undefined
      && measure.notes.some(
        (note) =>
          (note.metadata.slurs?.length ?? 0) > 0,
      )
    ) {
      throw new BridgeError(
        "UNSUPPORTED_SLUR",
        "Slurs inside ordinary backup/forward polyphony remain deferred; the bounded keyboard profile reuses the existing per-voice short-slur contract.",
        partId,
        measure.index,
      );
    }
    if (
      keyboardProfile === undefined
      && measure.directions.some(
        (direction) => direction.dynamics.length > 0,
      )
    ) {
      throw new BridgeError(
        "UNSUPPORTED_DYNAMICS",
        "Dynamics inside backup/forward polyphony remain deferred outside the bounded keyboard compatibility profile.",
        partId,
        measure.index,
      );
    }

    const wordExpressions =
      measureStartPolyphonyWordExpressions(
        measure,
        partId,
        keyboardProfile,
      );

    if (keyboardProfile !== undefined) {
      return Object.freeze([
        keyboardParallelEvent(
          measure,
          partId,
          activeMeter,
          keyboardProfile,
          wordExpressions,
        ),
      ]);
    }

    const inAccord =
      polyphonyInAccordEvent(
        measure,
        partId,
        activeMeter,
        activeClefs,
        terminalMeasure,
        diagnostics,
      );

    return Object.freeze([
      Object.freeze({
        ...inAccord,
        ...(wordExpressions.length > 0
          ? {wordExpressions}
          : {}),
      }),
    ]);
  }

  if (measure.notes.length === 0) {
    throw new BridgeError(
      "UNSUPPORTED_SOURCE_STRUCTURE",
      "Phase 16.5 requires explicit note/rest material in each serialized measure.",
      partId,
      measure.index,
    );
  }

  const groups = linearSourceGroups(measure, partId);
  const grace = graceStyles(groups, partId, measure.index);
  const slurs = shortSlurAfter(groups, partId, measure.index);
  const dynamics = dynamicsBySourceOrder(measure, partId);
  const wordExpressions =
    wordExpressionsBySourceOrder(
      measure,
      partId,
    );

  let cursor: MusicXmlFraction = Object.freeze({ numerator: 0, denominator: 1 });
  const projected: ProjectedEvent[] = [];

  for (const group of groups) {
    const first = group.base;
    const relation = cmp(first.onsetQuarter, cursor);

    if (relation < 0) {
      throw new BridgeError(
        "UNSUPPORTED_POLYPHONY",
        "Overlapping independent events require the in-accord bridge.",
        partId,
        measure.index,
      );
    }
    if (relation > 0) {
      throw new BridgeError(
        "UNSUPPORTED_GAP",
        "Onset gap is not represented by an explicit rest.",
        partId,
        measure.index,
      );
    }

    const context: EventProjectionContext = Object.freeze({
      ...(grace.get(first.sourceOrder) !== undefined
        ? { grace: grace.get(first.sourceOrder)! }
        : {}),
      ...(dynamics.get(first.sourceOrder) !== undefined
        ? { dynamic: dynamics.get(first.sourceOrder)! }
        : {}),
      ...(wordExpressions.get(first.sourceOrder) !== undefined
        ? { wordExpressions: wordExpressions.get(first.sourceOrder)! }
        : {}),
      ...(slurs.get(first.sourceOrder) !== undefined
        ? { slurAfter: slurs.get(first.sourceOrder)! }
        : {}),
    });

    projected.push(
      group.members.length === 1
        ? single(first, partId, measure.index, context)
        : chord(group.members, partId, measure.index, context),
    );

    if (!first.grace) {
      cursor = add(first.onsetQuarter, first.durationQuarter);
    }
  }

  return groupTriplets(
    Object.freeze(projected),
    partId,
    measure.index,
  );
}

function measurePolicy(
  measure: MusicXmlAdaptedMeasure,
  partId: string,
  diagnostics: MusicXmlToBrailleDiagnostic[],
): void {
  if ((measure.metadata.clefs?.length ?? 0) > 0) {
    diagnostics.push(Object.freeze({
      code: "CLEF_PRESERVED_NOT_EMITTED",
      message: `Clef metadata for measure ${measure.number} is preserved but not emitted by the frozen engine.`,
      partId,
      measureIndex: measure.index,
    }));
  }

  for (const direction of measure.directions) {
    if (direction.otherTypes.length > 0) {
      throw new BridgeError(
        "UNSUPPORTED_DIRECTION_TYPE",
        `MusicXML direction-type ${direction.otherTypes.join(", ")} is preserved but outside the frozen Phase 16.R1 executable subset.`,
        partId,
        measure.index,
      );
    }
    // PHASE16_R7_OCTAVE_SHIFT_NONFACSIMILE
    // MusicXML pitch data represents performed pitch while octave-shift
    // describes print displacement. BANA 3.3 nonfacsimile transcription
    // uses the performed octave and omits 8va/15ma/loco expressions.
    for (const octaveShift of direction.octaveShifts ?? []) {
      const type = octaveShift.type ?? "";
      const size = octaveShift.size ?? 8;
      if (
        (type !== "up" && type !== "down" && type !== "stop")
        || (size !== 8 && size !== 15 && size !== 22)
      ) {
        throw new BridgeError(
          "UNSUPPORTED_DIRECTION_TYPE",
          `MusicXML octave-shift type/size ${JSON.stringify(type)}/${size} remains outside the nonfacsimile profile.`,
          partId,
          measure.index,
        );
      }

      diagnostics.push(Object.freeze({
        code: "OCTAVE_SHIFT_NONFACSIMILE_NOT_EMITTED",
        message:
          `MusicXML octave-shift ${type} size ${size} is intentionally omitted in BANA nonfacsimile mode; performed pitch data is retained.`,
        partId,
        measureIndex: measure.index,
      }));
    }

    // PHASE16_R7_DIRECTION_MARKS
    // Wedges are validated and paired by planPartDirectionMarks().
    // PHASE16_R7_DIRECTION_MARKS
    // Pedals are validated and paired by planPartDirectionMarks().
    if (direction.metronomes.length > 0) {
      // V18B deliberately requires explicit staff scope. This keeps the
      // compatibility surface bounded while covering the audited Beethoven
      // and Fur Elise real-score corpus. Unstaffed print metronome topology
      // remains fail-closed for a later generalized placement contract.
      if (direction.staff !== 1 && direction.staff !== 2) {
        throw new BridgeError(
          "UNSUPPORTED_METRONOME",
          "Phase 16.R4 simple metronome emission currently requires explicit MusicXML staff 1/2 scope.",
          partId,
          measure.index,
        );
      }

      // Validate every mark here as well as at its projection site so a
      // preserved mark can never be silently skipped.
      for (const metronome of direction.metronomes) {
        projectSimpleMetronomeExpression(
          metronome,
          partId,
          measure.index,
        );
      }
    }
    if (direction.tempo !== undefined) {
      diagnostics.push(Object.freeze({
        code: "TEMPO_PRESERVED_NOT_EMITTED",
        message: `MusicXML sound@tempo ${direction.tempo} is preserved as playback metadata but not synthesized as print notation.`,
        partId, measureIndex: measure.index,
      }));
    }
    if (direction.soundDynamics !== undefined) {
      diagnostics.push(Object.freeze({
        code: "SOUND_DYNAMICS_PRESERVED_NOT_EMITTED",
        message: `MusicXML sound@dynamics ${direction.soundDynamics} is preserved as playback metadata and does not replace explicit print dynamics.`,
        partId, measureIndex: measure.index,
      }));
    }
  }
}

function partInput(
  part: MusicXmlAdaptedPart,
  diagnostics: MusicXmlToBrailleDiagnostic[],
): StatefulScoreInput {
  planSameLaneCrossMeasureSlurs(
    part,
    part.id,
  );
  planPartDirectionMarks(
    part,
    part.id,
  );
  planCursorGraceStyles(
    part,
    part.id,
  );
  if (part.measures.length === 0) {
    throw new BridgeError(
      "UNSUPPORTED_SOURCE_STRUCTURE",
      "MusicXML part has no measures.",
      part.id,
    );
  }

  const first = part.measures[0]!;
  const initialKey = sourceBoundaryKey(first, part.id);
  const initialMeter = first.metadata.time;

  if (initialKey === undefined) {
    diagnostics.push(Object.freeze({
      code: "KEY_SIGNATURE_ABSENT_ENGINE_DEFAULT_ZERO",
      message:
        "No initial key signature; existing engine retains zero-sharps/flats default.",
      partId: part.id,
      measureIndex: first.index,
    }));
  }

  if (initialMeter === undefined) {
    diagnostics.push(Object.freeze({
      code: "METER_ABSENT_NOT_SYNTHESIZED",
      message: "No initial meter; Phase 16 does not synthesize one.",
      partId: part.id,
      measureIndex: first.index,
    }));
  }

  let activeKey = initialKey ?? 0;
  let activeMeter:
    Readonly<{ numerator: number; denominator: number }>
    | undefined =
      initialMeter === undefined
        ? undefined
        : Object.freeze({
            numerator: initialMeter.beats,
            denominator: initialMeter.beatType,
          });

  const keyboardProfile =
    keyboardImportProfile(part, diagnostics);

  const activeClefs = new Map<number, string>();
  const measures: StatefulScoreInput["measures"][number][] = [];

  for (const [measurePosition, measure] of part.measures.entries()) {
    measurePolicy(measure, part.id, diagnostics);

    const extremeIntegerAlters =
      measure.notes.filter((note) => {
        const p = note.metadata.writtenPitch;
        return (
          p !== undefined
          && Number.isInteger(p.alter)
          && (p.alter < -2 || p.alter > 2)
        );
      });

    if (extremeIntegerAlters.length > 0) {
      diagnostics.push(Object.freeze({
        code: "SOURCE_PRESERVED_NOT_EMITTED",
        message:
          `${extremeIntegerAlters.length} extreme integer MusicXML alter value(s) preserve exact sounding pitch, while the unrepresentable source written-spelling override is not asserted; the existing deterministic key-aware spelling profile is reused.`,
        partId: part.id,
        measureIndex: measure.index,
      }));
    }

    for (const clef of measure.metadata.clefs ?? []) {
      activeClefs.set(clef.number ?? 1, clef.sign);
    }

    if (measure.metadata.time !== undefined) {
      activeMeter = Object.freeze({
        numerator: measure.metadata.time.beats,
        denominator: measure.metadata.time.beatType,
      });
    }

    const sourceKey = sourceBoundaryKey(measure, part.id);
    let emittedMeasureKey: number | undefined;
    if (
      measurePosition > 0
      && sourceKey !== undefined
      && sourceKey !== activeKey
    ) {
      if (sourceKey === 0 && activeKey !== 0) {
        throw new BridgeError(
          "UNSUPPORTED_KEY_CANCELLATION",
          "BANA confirms key-change placement, but transition to a zero-signature key requires a cancellation rule not frozen by the current contract.",
          part.id,
          measure.index,
        );
      }
      emittedMeasureKey = sourceKey;
      activeKey = sourceKey;
    }

    const decorations = measureDecorations(
      measure,
      part.id,
      diagnostics,
    );

    measures.push(Object.freeze({
      ...(emittedMeasureKey !== undefined
        ? { keySharpsFlats: emittedMeasureKey }
        : {}),
      ...(measure.index > 0 && measure.metadata.time !== undefined
        ? {
            meter: Object.freeze({
              numerator: measure.metadata.time.beats,
              denominator: measure.metadata.time.beatType,
            }),
          }
        : {}),
      ...decorations,
      events: measureEvents(
        measure,
        part.id,
        activeMeter,
        activeClefs,
        measurePosition === part.measures.length - 1,
        diagnostics,
        keyboardProfile,
      ),
    }));
  }

  return Object.freeze({
    ...(initialKey !== undefined ? { keySharpsFlats: initialKey } : {}),
    ...(initialMeter !== undefined
      ? {
          meter: Object.freeze({
            numerator: initialMeter.beats,
            denominator: initialMeter.beatType,
          }),
        }
      : {}),
    measures: Object.freeze(measures),
  });
}

function partEmission(
  part: MusicXmlAdaptedPart,
  emission: StatefulScoreEmission,
): MusicXmlBraillePartEmission {
  return Object.freeze({
    partId: part.id,
    ...(part.metadata.name ? { partName: part.metadata.name } : {}),
    brf: emission.brf,
    unicodeBraille: emission.unicode,
    engineProfileId: emission.profileId,
    chordProfileId:
      emission.keyboardChordProfileId
      ?? emission.chordProfileId,
    profileDisclosureRequired: emission.profileDisclosureRequired,
    trace: emission.trace,
  });
}

export function translateMusicXmlScoreToBraille(
  score: MusicXmlScore,
): MusicXmlToBrailleResult {
  const diagnostics: MusicXmlToBrailleDiagnostic[] = [];

  for (const d of score.diagnostics) {
    if (d.classification === "INVALID") {
      return failure("INVALID_SOURCE_STRUCTURE", "adapter", d.message, {
        ...(d.partId ? { partId: d.partId } : {}),
        ...(d.measureIndex !== undefined ? { measureIndex: d.measureIndex } : {}),
      });
    }
    if (d.classification === "UNSUPPORTED") {
      return failure("UNSUPPORTED_SOURCE_STRUCTURE", "adapter", d.message, {
        ...(d.partId ? { partId: d.partId } : {}),
        ...(d.measureIndex !== undefined ? { measureIndex: d.measureIndex } : {}),
      });
    }
    diagnostics.push(Object.freeze({
      code: "SOURCE_PRESERVED_NOT_EMITTED",
      message: `${d.code}: ${d.message}`,
      ...(d.partId ? { partId: d.partId } : {}),
      ...(d.measureIndex !== undefined ? { measureIndex: d.measureIndex } : {}),
    }));
  }

  const adapted = adaptMusicXmlScore(score);
  if (adapted.parts.length === 0) {
    return failure("NO_MUSICXML_PARTS", "bridge", "MusicXML score contains no parts.");
  }

  diagnostics.push(Object.freeze({
    code: "ENGINE_PROFILE_REUSED",
    message:
      `MusicXML uses existing ${MIDI_STATEFUL_PROFILE_ID}; no second Braille Music engine is created.`,
  }));

  const parts: MusicXmlBraillePartEmission[] = [];
  try {
    for (const part of adapted.parts) {
      parts.push(partEmission(part, encodeStatefulScore(partInput(part, diagnostics))));
    }
  } catch (error) {
    if (error instanceof BridgeError) {
      return failure(error.code, "bridge", error.message, {
        ...(error.partId !== undefined ? { partId: error.partId } : {}),
        ...(error.measureIndex !== undefined ? { measureIndex: error.measureIndex } : {}),
      });
    }
    return failure(
      "MUSIC_BRAILLE_ENCODING_FAILED",
      "encoder",
      error instanceof Error ? error.message : String(error),
    );
  }

  const frozen = Object.freeze(parts);
  return Object.freeze({
    ok: true,
    bridgeId: MUSICXML_TO_BRAILLE_BRIDGE_ID,
    transportLayoutId: MUSICXML_PART_TRANSPORT_LAYOUT_ID,
    parts: frozen,
    brf: frozen.map((part) => part.brf).join("\n"),
    unicodeBraille: frozen.map((part) => part.unicodeBraille).join("\n"),
    diagnostics: Object.freeze(diagnostics),
  });
}

export function translateMusicXmlTextToBraille(input: string): MusicXmlToBrailleResult {
  const parsed = parseMusicXmlText(input);
  return parsed.ok
    ? translateMusicXmlScoreToBraille(parsed.source)
    : failure(parsed.code, "parser", parsed.message);
}

export function translateMusicXmlBytesToBraille(input: Uint8Array): MusicXmlToBrailleResult {
  const parsed = parseMusicXmlBytes(input);
  return parsed.ok
    ? translateMusicXmlScoreToBraille(parsed.source)
    : failure(parsed.code, "parser", parsed.message);
}

export async function translateMxlToBraille(
  input: Uint8Array,
): Promise<MusicXmlToBrailleResult> {
  const loaded = await loadMusicXmlFromMxl(input);
  return loaded.ok
    ? translateMusicXmlBytesToBraille(loaded.xml)
    : failure(loaded.code, "container", loaded.message);
}
