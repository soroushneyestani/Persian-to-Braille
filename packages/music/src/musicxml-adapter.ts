/* PHASE16_PACK_A_MUSICXML
 * Semantic adapter foundation. Raw divisions is normalized before this boundary.
 * PHASE16_PACK_B_MUSICXML preserves bridge-relevant source semantics.
 */
import type {
  MusicXmlBackup, MusicXmlBarline, MusicXmlDirection, MusicXmlForward,
  MusicXmlFraction, MusicXmlMeasure, MusicXmlNote, MusicXmlPart, MusicXmlScore,
} from "./musicxml-types.js";
import type {
  MusicXmlMeasureMetadata, MusicXmlNoteMetadata, MusicXmlPartMetadata,
} from "./notation-types.js";

export interface MusicXmlAdaptedNote {
  readonly kind: "note" | "rest";
  readonly sourceOrder: number;
  readonly onsetQuarter: MusicXmlFraction;
  readonly durationQuarter: MusicXmlFraction;
  // PHASE16_R6A_MUSICXML_MEASURE_REST
  readonly measureRest?: true;
  readonly chord: boolean;
  readonly grace: boolean;
  readonly graceSlash?: boolean;
  readonly stem?: string;
  readonly sourceType?: string;
  readonly ties: MusicXmlNote["ties"];
  readonly tuplets: MusicXmlNote["tuplets"];
  readonly timeModification?: MusicXmlNote["timeModification"];
  readonly dots: number;
  readonly metadata: MusicXmlNoteMetadata;
}

export interface MusicXmlAdaptedMeasure {
  readonly index: number;
  readonly number: string;
  // PHASE16_R6_INITIAL_IMPLICIT_PICKUP
  // Structural MusicXML measure semantics must survive the adapter boundary.
  readonly implicit: boolean;
  readonly notes: readonly MusicXmlAdaptedNote[];
  readonly sourceItems: MusicXmlMeasure["items"];
  readonly directions: readonly MusicXmlDirection[];
  readonly barlines: readonly MusicXmlBarline[];
  readonly cursorOperations: readonly (MusicXmlBackup | MusicXmlForward)[];
  readonly metadata: MusicXmlMeasureMetadata;
}

export interface MusicXmlAdaptedPart {
  readonly id: string;
  readonly measures: readonly MusicXmlAdaptedMeasure[];
  readonly metadata: MusicXmlPartMetadata;
}

export interface MusicXmlAdaptedScore {
  readonly format: "musicxml";
  readonly parts: readonly MusicXmlAdaptedPart[];
}

function noteMetadata(note: MusicXmlNote): MusicXmlNoteMetadata {
  return Object.freeze({
    ...(note.voice ? { voice: note.voice } : {}),
    ...(note.staff !== undefined ? { staff: note.staff } : {}),
    ...(note.writtenPitch ? {
      writtenPitch: Object.freeze({
        step: note.writtenPitch.step,
        alter: note.writtenPitch.alter,
        octave: note.writtenPitch.octave,
      }),
    } : {}),
    ...(note.slurs.length > 0 ? {
      slurs: Object.freeze(note.slurs.map((slur) => Object.freeze({
        type: slur.type,
        ...(slur.number !== undefined ? { number: slur.number } : {}),
        ...(slur.placement ? { placement: slur.placement } : {}),
      }))),
    } : {}),
    ...(note.articulations.length > 0
      ? { articulations: Object.freeze([...note.articulations]) }
      : {}),
  });
}

function measureMetadata(measure: MusicXmlMeasure): MusicXmlMeasureMetadata {
  let key: MusicXmlMeasureMetadata["key"];
  let time: MusicXmlMeasureMetadata["time"];
  const clefs: NonNullable<MusicXmlMeasureMetadata["clefs"]>[number][] = [];
  for (const item of measure.items) {
    if (item.kind !== "attributes") continue;
    if (item.key) key = Object.freeze({
      fifths: item.key.fifths,
      ...(item.key.mode ? { mode: item.key.mode } : {}),
    });
    if (item.time) time = Object.freeze({
      beats: item.time.beats,
      beatType: item.time.beatType,
    });
    for (const clef of item.clefs) {
      clefs.push(Object.freeze({
        ...(clef.number !== undefined ? { number: clef.number } : {}),
        sign: clef.sign,
        ...(clef.line !== undefined ? { line: clef.line } : {}),
        ...(clef.octaveChange !== undefined ? { octaveChange: clef.octaveChange } : {}),
      }));
    }
  }
  return Object.freeze({
    measureNumber: measure.number,
    ...(key ? { key } : {}),
    ...(time ? { time } : {}),
    ...(clefs.length > 0 ? { clefs: Object.freeze(clefs) } : {}),
  });
}

function partMetadata(part: MusicXmlPart): MusicXmlPartMetadata {
  return Object.freeze({ id: part.id, ...(part.name ? { name: part.name } : {}) });
}

export function adaptMusicXmlScore(score: MusicXmlScore): MusicXmlAdaptedScore {
  return Object.freeze({
    format: "musicxml",
    parts: Object.freeze(score.parts.map((part) => Object.freeze({
      id: part.id,
      metadata: partMetadata(part),
      measures: Object.freeze(part.measures.map((measure) => Object.freeze({
        index: measure.index,
        number: measure.number,
        implicit: measure.implicit,
        metadata: measureMetadata(measure),
        notes: Object.freeze(
          measure.items
            .filter((item): item is MusicXmlNote => item.kind === "note")
            .map((note) => Object.freeze({
              kind: note.rest ? "rest" : "note",
              sourceOrder: note.sourceOrder,
              onsetQuarter: note.onsetQuarter,
              durationQuarter: note.durationQuarter,
              ...(note.measureRest === true
                ? {measureRest: true as const}
                : {}),
              chord: note.chord,
              grace: note.grace,
              ...(note.graceSlash !== undefined ? {graceSlash: note.graceSlash} : {}),
              ...(note.stem !== undefined ? {stem: note.stem} : {}),
              ...(note.type !== undefined ? {sourceType: note.type} : {}),
              ties: note.ties,
              tuplets: note.tuplets,
              ...(note.timeModification ? { timeModification: note.timeModification } : {}),
              dots: note.dots,
              metadata: noteMetadata(note),
            })),
        ),
        sourceItems: measure.items,
        directions: Object.freeze(
          measure.items.filter((item): item is MusicXmlDirection => item.kind === "direction"),
        ),
        barlines: Object.freeze(
          measure.items.filter((item): item is MusicXmlBarline => item.kind === "barline"),
        ),
        cursorOperations: Object.freeze(
          measure.items.filter(
            (item): item is MusicXmlBackup | MusicXmlForward =>
              item.kind === "backup" || item.kind === "forward",
          ),
        ),
      }))),
    }))),
  });
}
