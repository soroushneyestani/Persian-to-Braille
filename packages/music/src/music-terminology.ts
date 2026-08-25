import { MUSIC_TERMINOLOGY_REGISTRY } from "./generated/music-terminology-registry.generated.js";

export type MusicTerminologyPolicy =
  | "word-expression"
  | "canonical-word-expression"
  | "structural-fail-closed";

export type MusicTerminologyResolutionKind =
  | "exact" | "sequence" | "free-text"
  | "continuation-fragment" | "unsupported-glyph";

export interface MusicTerminologyEntryView {
  readonly term: string;
  readonly normalized: string;
  readonly language: string;
  readonly category: string;
  readonly semanticTags: readonly string[];
  readonly policy: MusicTerminologyPolicy;
  readonly aliases: readonly string[];
}

export interface MusicTerminologyResolution {
  readonly kind: MusicTerminologyResolutionKind;
  readonly sourceText: string;
  readonly normalizedText: string;
  readonly recognized: boolean;
  readonly entries: readonly MusicTerminologyEntryView[];
  readonly categories: readonly string[];
  readonly semanticTags: readonly string[];
  readonly policy:
    | MusicTerminologyPolicy
    | "bana-word-expression-fallback"
    | "explicit-fail-closed";
  readonly unknownTokens: readonly string[];
}

function normalize(text: string): string {
  return text.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
}

const ENTRIES: readonly MusicTerminologyEntryView[] = MUSIC_TERMINOLOGY_REGISTRY.entries;
const LOOKUP = new Map<string, MusicTerminologyEntryView>();
for (const entry of ENTRIES) {
  LOOKUP.set(entry.normalized, entry);
  for (const alias of entry.aliases) LOOKUP.set(normalize(alias), entry);
}
function unique(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)]);
}
function combinePolicy(entries: readonly MusicTerminologyEntryView[]): MusicTerminologyPolicy {
  if (entries.some((e) => e.policy === "structural-fail-closed")) return "structural-fail-closed";
  if (entries.some((e) => e.policy === "canonical-word-expression")) return "canonical-word-expression";
  return "word-expression";
}
function freeze(value: MusicTerminologyResolution): MusicTerminologyResolution {
  return Object.freeze({
    ...value,
    entries: Object.freeze([...value.entries]),
    categories: Object.freeze([...value.categories]),
    semanticTags: Object.freeze([...value.semanticTags]),
    unknownTokens: Object.freeze([...value.unknownTokens]),
  });
}

export function resolveMusicTerminology(sourceText: string): MusicTerminologyResolution {
  const normalizedText = normalize(sourceText);
  if (normalizedText === "-") {
    return freeze({kind:"continuation-fragment",sourceText,normalizedText,recognized:false,entries:[],categories:[],semanticTags:["continuation-fragment"],policy:"explicit-fail-closed",unknownTokens:["-"]});
  }
  for (const char of normalizedText) {
    const cp = char.codePointAt(0)!;
    if ((cp >= 0xe000 && cp <= 0xf8ff) || (cp >= 0xf0000 && cp <= 0xffffd) || (cp >= 0x100000 && cp <= 0x10fffd)) {
      return freeze({kind:"unsupported-glyph",sourceText,normalizedText,recognized:false,entries:[],categories:[],semanticTags:["private-use-glyph"],policy:"explicit-fail-closed",unknownTokens:[char]});
    }
  }
  const exact = LOOKUP.get(normalizedText);
  if (exact !== undefined) {
    return freeze({kind:"exact",sourceText,normalizedText,recognized:true,entries:[exact],categories:[exact.category],semanticTags:exact.semanticTags,policy:exact.policy,unknownTokens:[]});
  }
  if (normalizedText === "") {
    return freeze({kind:"free-text",sourceText,normalizedText,recognized:false,entries:[],categories:[],semanticTags:[],policy:"explicit-fail-closed",unknownTokens:[]});
  }
  const tokens = normalizedText.split(" ");
  const matched: MusicTerminologyEntryView[] = [];
  const unknownTokens: string[] = [];
  let index = 0;
  while (index < tokens.length) {
    let winner: MusicTerminologyEntryView | undefined;
    let winnerLength = 0;
    for (let end = tokens.length; end > index; end -= 1) {
      const candidate = LOOKUP.get(tokens.slice(index, end).join(" "));
      if (candidate !== undefined) {
        winner = candidate;
        winnerLength = end - index;
        break;
      }
    }
    if (winner === undefined) {
      unknownTokens.push(tokens[index]!);
      index += 1;
    } else {
      matched.push(winner);
      index += winnerLength;
    }
  }
  if (unknownTokens.length === 0 && matched.length > 0) {
    return freeze({kind:"sequence",sourceText,normalizedText,recognized:true,entries:matched,categories:unique(matched.map(e=>e.category)),semanticTags:unique(matched.flatMap(e=>[...e.semanticTags])),policy:combinePolicy(matched),unknownTokens:[]});
  }
  return freeze({kind:"free-text",sourceText,normalizedText,recognized:false,entries:matched,categories:unique(matched.map(e=>e.category)),semanticTags:unique(matched.flatMap(e=>[...e.semanticTags])),policy:"bana-word-expression-fallback",unknownTokens});
}

export function musicTerminologyRegistryInfo() {
  return Object.freeze({
    id: MUSIC_TERMINOLOGY_REGISTRY.id,
    schemaVersion: MUSIC_TERMINOLOGY_REGISTRY.schemaVersion,
    canonicalEntryCount: MUSIC_TERMINOLOGY_REGISTRY.entries.length,
    aliasCount: MUSIC_TERMINOLOGY_REGISTRY.entries.reduce((sum, e) => sum + e.aliases.length, 0),
  });
}
