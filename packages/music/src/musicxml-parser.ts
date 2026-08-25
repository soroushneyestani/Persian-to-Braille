/* PHASE16_PACK_A_MUSICXML
 * score-partwise MusicXML parser with exact rational quarter-note cursor.
 */
import type {
  MusicXmlAttributes, MusicXmlBarline, MusicXmlClef, MusicXmlDiagnostic,
  MusicXmlDirection, MusicXmlFraction, MusicXmlMeasure, MusicXmlMeasureItem,
  MusicXmlMetronome, MusicXmlOctaveShift, MusicXmlNote, MusicXmlParserResult, MusicXmlPart,
  MusicXmlPedal, MusicXmlScore, MusicXmlSlur, MusicXmlStep, MusicXmlTieType,
  MusicXmlTimeModification, MusicXmlTuplet, MusicXmlWedge,
  MusicXmlWrittenPitch,
} from "./musicxml-types.js";
import {
  MusicXmlXmlError, musicXmlChild, musicXmlChildren, musicXmlText,
  parseMusicXmlXml, type MusicXmlXmlNode,
} from "./musicxml-xml.js";

function intValue(value: string | undefined): number | undefined {
  if (value === undefined || value.trim() === "") return undefined;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : undefined;
}
function numberValue(value: string | undefined): number | undefined {
  if (value === undefined || value.trim() === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}
function gcd(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y !== 0) { const t = x % y; x = y; y = t; }
  return x === 0 ? 1 : x;
}
function fraction(numerator: number, denominator: number): MusicXmlFraction {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) throw new Error("invalid MusicXML rational time");
  if (numerator === 0) return Object.freeze({numerator: 0, denominator: 1});
  const d = gcd(numerator, denominator);
  return Object.freeze({numerator: Math.trunc(numerator / d), denominator: Math.trunc(denominator / d)});
}
function add(a: MusicXmlFraction, b: MusicXmlFraction): MusicXmlFraction {
  return fraction(a.numerator * b.denominator + b.numerator * a.denominator, a.denominator * b.denominator);
}
function subtract(a: MusicXmlFraction, b: MusicXmlFraction): MusicXmlFraction {
  return fraction(a.numerator * b.denominator - b.numerator * a.denominator, a.denominator * b.denominator);
}
function durationFraction(duration: number, divisions: number): MusicXmlFraction {
  return fraction(duration, divisions);
}
function parsePitch(node: MusicXmlXmlNode): MusicXmlWrittenPitch | undefined {
  const pitch = musicXmlChild(node, "pitch");
  if (!pitch) return undefined;
  const stepText = musicXmlText(pitch, "step");
  const octave = intValue(musicXmlText(pitch, "octave"));
  if (!stepText || octave === undefined || !/^[A-G]$/.test(stepText)) return undefined;
  return Object.freeze({step: stepText as MusicXmlStep, alter: numberValue(musicXmlText(pitch, "alter")) ?? 0, octave});
}
function parseClefs(attributes: MusicXmlXmlNode): readonly MusicXmlClef[] {
  return Object.freeze(musicXmlChildren(attributes, "clef").map((clef) => Object.freeze({
    ...(intValue(clef.attributes["number"]) !== undefined ? {number: intValue(clef.attributes["number"])!} : {}),
    sign: musicXmlText(clef, "sign") ?? "",
    ...(intValue(musicXmlText(clef, "line")) !== undefined ? {line: intValue(musicXmlText(clef, "line"))!} : {}),
    ...(intValue(musicXmlText(clef, "clef-octave-change")) !== undefined ? {octaveChange: intValue(musicXmlText(clef, "clef-octave-change"))!} : {}),
  })));
}
function parseAttributes(node: MusicXmlXmlNode): MusicXmlAttributes {
  const keyNode = musicXmlChild(node, "key");
  const timeNode = musicXmlChild(node, "time");
  const fifths = intValue(keyNode ? musicXmlText(keyNode, "fifths") : undefined);
  const beats = intValue(timeNode ? musicXmlText(timeNode, "beats") : undefined);
  const beatType = intValue(timeNode ? musicXmlText(timeNode, "beat-type") : undefined);
  return Object.freeze({
    kind: "attributes",
    ...(intValue(musicXmlText(node, "divisions")) !== undefined ? {divisions: intValue(musicXmlText(node, "divisions"))!} : {}),
    ...(fifths !== undefined ? {key: Object.freeze({fifths, ...(musicXmlText(keyNode!, "mode") ? {mode: musicXmlText(keyNode!, "mode")!} : {})})} : {}),
    ...(beats !== undefined && beatType !== undefined ? {time: Object.freeze({beats, beatType})} : {}),
    clefs: parseClefs(node),
  });
}
function parseNotations(note: MusicXmlXmlNode): Readonly<{
  slurs: readonly MusicXmlSlur[];
  tuplets: readonly MusicXmlTuplet[];
  articulations: readonly string[];
  tied: readonly MusicXmlTieType[];
}> {
  const notations = musicXmlChild(note, "notations");
  if (!notations) return Object.freeze({slurs: Object.freeze([]), tuplets: Object.freeze([]), articulations: Object.freeze([]), tied: Object.freeze([])});
  const slurs = musicXmlChildren(notations, "slur").map((node) => {
    const type = node.attributes["type"];
    if (type !== "start" && type !== "stop" && type !== "continue") return undefined;
    return Object.freeze({type, ...(intValue(node.attributes["number"]) !== undefined ? {number: intValue(node.attributes["number"])!} : {}), ...(node.attributes["placement"] ? {placement: node.attributes["placement"]} : {})}) as MusicXmlSlur;
  }).filter((v): v is MusicXmlSlur => v !== undefined);
  const tuplets = musicXmlChildren(notations, "tuplet").map((node) => {
    const type = node.attributes["type"];
    if (type !== "start" && type !== "stop") return undefined;
    return Object.freeze({type, ...(intValue(node.attributes["number"]) !== undefined ? {number: intValue(node.attributes["number"])!} : {})}) as MusicXmlTuplet;
  }).filter((v): v is MusicXmlTuplet => v !== undefined);
  const articulationsNode = musicXmlChild(notations, "articulations");
  const articulations = articulationsNode ? articulationsNode.children.map((child) => child.name) : [];
  const tied = musicXmlChildren(notations, "tied").map((node) => node.attributes["type"])
    .filter((v): v is MusicXmlTieType => v === "start" || v === "stop");
  return Object.freeze({slurs: Object.freeze(slurs), tuplets: Object.freeze(tuplets), articulations: Object.freeze(articulations), tied: Object.freeze(tied)});
}
function parseTimeModification(note: MusicXmlXmlNode): MusicXmlTimeModification | undefined {
  const tm = musicXmlChild(note, "time-modification");
  if (!tm) return undefined;
  const actualNotes = intValue(musicXmlText(tm, "actual-notes"));
  const normalNotes = intValue(musicXmlText(tm, "normal-notes"));
  if (actualNotes === undefined || normalNotes === undefined) return undefined;
  return Object.freeze({actualNotes, normalNotes, ...(musicXmlText(tm, "normal-type") ? {normalType: musicXmlText(tm, "normal-type")!} : {}), normalDots: musicXmlChildren(tm, "normal-dot").length});
}
function frozenAttributes(node: MusicXmlXmlNode): Readonly<Record<string, string>> {
  return Object.freeze({...node.attributes});
}
function parseDirection(
  node: MusicXmlXmlNode,
  currentOnset: MusicXmlFraction,
  divisions: number,
): MusicXmlDirection {
  const offsetDivisions = intValue(musicXmlText(node, "offset")) ?? 0;
  const onsetQuarter =
    offsetDivisions === 0
      ? currentOnset
      : add(
          currentOnset,
          durationFraction(offsetDivisions, divisions),
        );
  const sound = musicXmlChild(node, "sound");
  const tempo = numberValue(sound?.attributes["tempo"]);
  const soundDynamics = numberValue(sound?.attributes["dynamics"]);
  const dynamics: string[] = [];
  const words: string[] = [];
  const wedges: MusicXmlWedge[] = [];
  const pedals: MusicXmlPedal[] = [];
  const octaveShifts: MusicXmlOctaveShift[] = [];
  const metronomes: MusicXmlMetronome[] = [];
  const otherTypes: string[] = [];
  for (const directionType of musicXmlChildren(node, "direction-type")) {
    for (const child of directionType.children) {
      if (child.name === "dynamics") {
        // PHASE16_R8_OTHER_DYNAMICS_WORD
        for (const dynamic of child.children) {
          if (
            dynamic.name === "other-dynamics"
            && (
              dynamic.text?.trim() === "cresc."
              || dynamic.text?.trim() === "decresc."
              || dynamic.text?.trim() === "dimin."
            )
          ) {
            // These exact textual dynamic-change aliases already have
            // frozen R2B terminology/BANA word-expression contracts.
            words.push(dynamic.text.trim());
          }
          else {
            dynamics.push(dynamic.name);
          }
        }
      } else if (child.name === "words") {
        if (child.text) words.push(child.text);
      } else if (child.name === "wedge") {
        const number = intValue(child.attributes["number"]);
        wedges.push(Object.freeze({
          ...(child.attributes["type"] ? {type: child.attributes["type"]} : {}),
          ...(number !== undefined ? {number} : {}),
          attributes: frozenAttributes(child),
        }));
      } else if (child.name === "pedal") {
        const number = intValue(child.attributes["number"]);
        pedals.push(Object.freeze({
          ...(child.attributes["type"] ? {type: child.attributes["type"]} : {}),
          ...(number !== undefined ? {number} : {}),
          ...(child.attributes["line"] ? {line: child.attributes["line"]} : {}),
          ...(child.attributes["sign"] ? {sign: child.attributes["sign"]} : {}),
          attributes: frozenAttributes(child),
        }));
      } else if (child.name === "octave-shift") {
        const size = intValue(child.attributes["size"]);
        const number = intValue(child.attributes["number"]);
        octaveShifts.push(Object.freeze({
          ...(child.attributes["type"] ? {type: child.attributes["type"]} : {}),
          ...(size !== undefined ? {size} : {}),
          ...(number !== undefined ? {number} : {}),
          attributes: frozenAttributes(child),
        }));
      } else if (child.name === "metronome") {
        const beatUnit = musicXmlText(child, "beat-unit");
        const perMinute = musicXmlText(child, "per-minute");
        const relation = musicXmlText(child, "metronome-relation");
        metronomes.push(Object.freeze({
          ...(beatUnit ? {beatUnit} : {}),
          beatUnitDots: musicXmlChildren(child, "beat-unit-dot").length,
          ...(perMinute ? {perMinute} : {}),
          ...(relation ? {relation} : {}),
          attributes: frozenAttributes(child),
        }));
      } else {
        otherTypes.push(child.name);
      }
    }
  }
  return Object.freeze({
    kind: "direction",
    onsetQuarter,
    ...(tempo !== undefined ? {tempo} : {}),
    ...(soundDynamics !== undefined ? {soundDynamics} : {}),
    dynamics: Object.freeze(dynamics),
    words: Object.freeze(words),
    wedges: Object.freeze(wedges),
    pedals: Object.freeze(pedals),
    ...(octaveShifts.length > 0
      ? {octaveShifts: Object.freeze(octaveShifts)}
      : {}),
    metronomes: Object.freeze(metronomes),
    otherTypes: Object.freeze(otherTypes),
    ...(intValue(musicXmlText(node, "staff")) !== undefined ? {staff: intValue(musicXmlText(node, "staff"))!} : {}),
  });
}
function parseBarline(node: MusicXmlXmlNode): MusicXmlBarline {
  const repeat = musicXmlChild(node, "repeat");
  const ending = musicXmlChild(node, "ending");
  const direction = repeat?.attributes["direction"];
  return Object.freeze({
    kind: "barline",
    ...(node.attributes["location"] ? {location: node.attributes["location"]} : {}),
    ...(direction === "forward" || direction === "backward" ? {repeat: direction} : {}),
    ...(intValue(repeat?.attributes["times"]) !== undefined ? {repeatTimes: intValue(repeat?.attributes["times"])!} : {}),
    ...(ending ? {ending: Object.freeze({...(ending.attributes["number"] ? {number: ending.attributes["number"]} : {}), ...(ending.attributes["type"] ? {type: ending.attributes["type"]} : {})})} : {}),
  });
}
function parsePart(partNode: MusicXmlXmlNode, partName: string | undefined, diagnostics: MusicXmlDiagnostic[]): MusicXmlPart {
  const id = partNode.attributes["id"] ?? "";
  let divisions = 1;
  const measures: MusicXmlMeasure[] = [];
  for (const [measureIndex, measureNode] of musicXmlChildren(partNode, "measure").entries()) {
    let cursor: MusicXmlFraction = fraction(0, 1);
    let lastNoteOnset: MusicXmlFraction = cursor;
    let sourceOrder = 0;
    const items: MusicXmlMeasureItem[] = [];
    for (const child of measureNode.children) {
      switch (child.name) {
        case "attributes": {
          const parsed = parseAttributes(child);
          if (parsed.divisions !== undefined) {
            if (parsed.divisions <= 0) diagnostics.push(Object.freeze({classification: "INVALID", code: "INVALID_DIVISIONS", message: `MusicXML divisions must be positive; got ${parsed.divisions}.`, partId: id, measureIndex}));
            else divisions = parsed.divisions;
          }
          items.push(parsed);
          break;
        }
        case "note": {
          const chord = musicXmlChild(child, "chord") !== undefined;
          const graceNode = musicXmlChild(child, "grace");
          const grace = graceNode !== undefined;
          const graceSlash =
            graceNode?.attributes["slash"] === "yes"
              ? true
              : graceNode?.attributes["slash"] === "no"
                ? false
                : undefined;
          const restNode = musicXmlChild(child, "rest");
          const rest = restNode !== undefined;
          // PHASE16_R6A_MUSICXML_MEASURE_REST
          const measureRest =
            restNode?.attributes["measure"] === "yes";
          const durationDivisions = intValue(musicXmlText(child, "duration"));
          const durationQuarter = durationDivisions !== undefined ? durationFraction(durationDivisions, divisions) : fraction(0, 1);
          const onsetQuarter = chord ? lastNoteOnset : cursor;
          const notations = parseNotations(child);
          const directTies = musicXmlChildren(child, "tie").map((node) => node.attributes["type"])
            .filter((v): v is MusicXmlTieType => v === "start" || v === "stop");
          const ties = Array.from(new Set<MusicXmlTieType>([...directTies, ...notations.tied]));
          const pitch = parsePitch(child);
          const tm = parseTimeModification(child);
          const parsed: MusicXmlNote = Object.freeze({
            kind: "note", sourceOrder, onsetQuarter, durationQuarter,
            ...(durationDivisions !== undefined ? {durationDivisions} : {}),
            effectiveDivisions: divisions,
            ...(pitch ? {writtenPitch: pitch} : {}),
            rest,
            ...(measureRest ? {measureRest: true as const} : {}),
            chord, grace,
            ...(graceSlash !== undefined ? {graceSlash} : {}),
            ...(musicXmlText(child, "stem") ? {stem: musicXmlText(child, "stem")!} : {}),
            ...(musicXmlText(child, "type") ? {type: musicXmlText(child, "type")!} : {}),
            dots: musicXmlChildren(child, "dot").length,
            ...(musicXmlText(child, "accidental") ? {accidental: musicXmlText(child, "accidental")!} : {}),
            ...(musicXmlText(child, "voice") ? {voice: musicXmlText(child, "voice")!} : {}),
            ...(intValue(musicXmlText(child, "staff")) !== undefined ? {staff: intValue(musicXmlText(child, "staff"))!} : {}),
            ties: Object.freeze(ties), slurs: notations.slurs, tuplets: notations.tuplets,
            ...(tm ? {timeModification: tm} : {}),
            articulations: notations.articulations,
          });
          items.push(parsed);
          sourceOrder += 1;
          if (!chord) {
            lastNoteOnset = onsetQuarter;
            if (!grace) cursor = add(cursor, durationQuarter);
          }
          break;
        }
        case "backup": {
          const d = intValue(musicXmlText(child, "duration"));
          if (d !== undefined) {
            items.push(Object.freeze({kind: "backup", durationDivisions: d, effectiveDivisions: divisions}));
            cursor = subtract(cursor, durationFraction(d, divisions));
          }
          break;
        }
        case "forward": {
          const d = intValue(musicXmlText(child, "duration"));
          if (d !== undefined) {
            items.push(Object.freeze({kind: "forward", durationDivisions: d, effectiveDivisions: divisions, ...(musicXmlText(child, "voice") ? {voice: musicXmlText(child, "voice")!} : {}), ...(intValue(musicXmlText(child, "staff")) !== undefined ? {staff: intValue(musicXmlText(child, "staff"))!} : {})}));
            cursor = add(cursor, durationFraction(d, divisions));
          }
          break;
        }
        case "direction": items.push(parseDirection(child, cursor, divisions)); break;
        case "barline": items.push(parseBarline(child)); break;
        case "print":
        case "sound":
        case "harmony":
        case "figured-bass":
        case "grouping":
        case "link":
        case "bookmark":
          diagnostics.push(Object.freeze({classification: "PRESERVED_BUT_IGNORED", code: `IGNORED_${child.name.toUpperCase().replace(/-/g, "_")}`, message: `MusicXML <${child.name}> is outside Pack A semantic projection.`, partId: id, measureIndex}));
          break;
        default:
          diagnostics.push(Object.freeze({classification: "UNSUPPORTED", code: "UNSUPPORTED_MEASURE_CHILD", message: `Unsupported significant MusicXML measure child <${child.name}>.`, partId: id, measureIndex}));
      }
    }
    measures.push(Object.freeze({index: measureIndex, number: measureNode.attributes["number"] ?? String(measureIndex + 1), implicit: measureNode.attributes["implicit"] === "yes", items: Object.freeze(items)}));
  }
  return Object.freeze({id, ...(partName ? {name: partName} : {}), measures: Object.freeze(measures)});
}
export function parseMusicXmlText(text: string): MusicXmlParserResult {
  let root: MusicXmlXmlNode;
  try { root = parseMusicXmlXml(text); }
  catch (error) {
    if (error instanceof MusicXmlXmlError) return Object.freeze({ok: false, code: error.code, message: error.message});
    return Object.freeze({ok: false, code: "INVALID_XML", message: error instanceof Error ? error.message : String(error)});
  }
  if (root.name !== "score-partwise") return Object.freeze({ok: false, code: "UNSUPPORTED_ROOT", message: `Phase 16 Pack A supports score-partwise; got <${root.name}>.`});
  const partNames = new Map<string, string>();
  const partList = musicXmlChild(root, "part-list");
  if (partList) for (const scorePart of musicXmlChildren(partList, "score-part")) {
    const id = scorePart.attributes["id"];
    const name = musicXmlText(scorePart, "part-name");
    if (id && name) partNames.set(id, name);
  }
  const diagnostics: MusicXmlDiagnostic[] = [];
  const parts = musicXmlChildren(root, "part").map((part) => parsePart(part, partNames.get(part.attributes["id"] ?? ""), diagnostics));
  const score: MusicXmlScore = Object.freeze({format: "musicxml", root: "score-partwise", ...(root.attributes["version"] ? {version: root.attributes["version"]} : {}), parts: Object.freeze(parts), diagnostics: Object.freeze(diagnostics)});
  return Object.freeze({ok: true, source: score});
}
export function parseMusicXmlBytes(bytes: Uint8Array): MusicXmlParserResult {
  const Decoder = (globalThis as unknown as {TextDecoder?: new (label?: string, options?: unknown) => {decode(input?: Uint8Array): string}}).TextDecoder;
  if (!Decoder) return Object.freeze({ok: false, code: "INVALID_XML", message: "TextDecoder is unavailable."});
  try { return parseMusicXmlText(new Decoder("utf-8", {fatal: true}).decode(bytes)); }
  catch (error) { return Object.freeze({ok: false, code: "INVALID_XML", message: error instanceof Error ? error.message : String(error)}); }
}
