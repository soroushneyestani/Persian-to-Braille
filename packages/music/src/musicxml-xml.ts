/* PHASE16_PACK_A_MUSICXML
 * Small secure XML reader.
 * Standard DOCTYPE declarations are skipped syntactically.
 * Explicit ENTITY declarations are rejected.
 */
export interface MusicXmlXmlNode {
  readonly name: string;
  readonly attributes: Readonly<Record<string, string>>;
  readonly children: readonly MusicXmlXmlNode[];
  readonly text: string;
}

export class MusicXmlXmlError extends Error {
  readonly code: "INVALID_XML" | "UNSAFE_XML_ENTITY";

  constructor(code: "INVALID_XML" | "UNSAFE_XML_ENTITY", message: string) {
    super(message);
    this.name = "MusicXmlXmlError";
    this.code = code;
  }
}

function localName(name: string): string {
  const colon = name.indexOf(":");
  return colon >= 0 ? name.slice(colon + 1) : name;
}

function decodeEntity(entity: string): string {
  switch (entity) {
    case "amp": return "&";
    case "lt": return "<";
    case "gt": return ">";
    case "quot": return "\"";
    case "apos": return "'";
    default:
      if (entity.startsWith("#x") || entity.startsWith("#X")) {
        const value = Number.parseInt(entity.slice(2), 16);
        if (!Number.isFinite(value)) throw new MusicXmlXmlError("INVALID_XML", `Invalid entity &${entity};`);
        return String.fromCodePoint(value);
      }
      if (entity.startsWith("#")) {
        const value = Number.parseInt(entity.slice(1), 10);
        if (!Number.isFinite(value)) throw new MusicXmlXmlError("INVALID_XML", `Invalid entity &${entity};`);
        return String.fromCodePoint(value);
      }
      throw new MusicXmlXmlError("UNSAFE_XML_ENTITY", `Named entity &${entity}; is not accepted.`);
  }
}

function decodeEntities(text: string): string {
  return text.replace(/&([^;]+);/g, (_all, entity: string) => decodeEntity(entity));
}

function skipWhitespace(text: string, start: number): number {
  let i = start;
  while (i < text.length && /\s/.test(text[i]!)) i += 1;
  return i;
}

function parseTag(raw: string): Readonly<{name: string; attributes: Readonly<Record<string, string>>}> {
  let i = skipWhitespace(raw, 0);
  const nameMatch = /^[^\s/>]+/.exec(raw.slice(i));
  if (!nameMatch) throw new MusicXmlXmlError("INVALID_XML", `Invalid tag <${raw}>.`);
  const qName = nameMatch[0]!;
  i += qName.length;
  const attributes: Record<string, string> = {};

  while (i < raw.length) {
    i = skipWhitespace(raw, i);
    if (i >= raw.length) break;
    const attrMatch = /^[^\s=/>]+/.exec(raw.slice(i));
    if (!attrMatch) throw new MusicXmlXmlError("INVALID_XML", `Invalid attribute syntax in <${raw}>.`);
    const attrName = localName(attrMatch[0]!);
    i += attrMatch[0]!.length;
    i = skipWhitespace(raw, i);
    if (raw[i] !== "=") throw new MusicXmlXmlError("INVALID_XML", `Attribute ${attrName} has no '='.`);
    i += 1;
    i = skipWhitespace(raw, i);
    const quote = raw[i];
    if (quote !== "\"" && quote !== "'") throw new MusicXmlXmlError("INVALID_XML", `Attribute ${attrName} is not quoted.`);
    i += 1;
    const end = raw.indexOf(quote, i);
    if (end < 0) throw new MusicXmlXmlError("INVALID_XML", `Unterminated attribute ${attrName}.`);
    attributes[attrName] = decodeEntities(raw.slice(i, end));
    i = end + 1;
  }

  return Object.freeze({name: localName(qName), attributes: Object.freeze(attributes)});
}

function declarationEnd(text: string, start: number): number {
  let quote: string | null = null;
  let bracketDepth = 0;
  for (let i = start; i < text.length; i += 1) {
    const ch = text[i]!;
    if (quote !== null) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "\"" || ch === "'") { quote = ch; continue; }
    if (ch === "[") { bracketDepth += 1; continue; }
    if (ch === "]") { bracketDepth = Math.max(0, bracketDepth - 1); continue; }
    if (ch === ">" && bracketDepth === 0) return i + 1;
  }
  throw new MusicXmlXmlError("INVALID_XML", "Unterminated XML declaration.");
}

interface MutableNode {
  name: string;
  attributes: Record<string, string>;
  children: MutableNode[];
  textParts: string[];
}

function freezeNode(node: MutableNode): MusicXmlXmlNode {
  return Object.freeze({
    name: node.name,
    attributes: Object.freeze({...node.attributes}),
    children: Object.freeze(node.children.map(freezeNode)),
    text: node.textParts.join("").trim(),
  });
}

export function parseMusicXmlXml(textInput: string): MusicXmlXmlNode {
  const text = textInput.replace(/^\uFEFF/, "");
  if (/<!ENTITY\b/i.test(text)) {
    throw new MusicXmlXmlError("UNSAFE_XML_ENTITY", "Explicit ENTITY declarations are rejected.");
  }

  const stack: MutableNode[] = [];
  let root: MutableNode | null = null;
  let i = 0;

  while (i < text.length) {
    const lt = text.indexOf("<", i);
    if (lt < 0) {
      if (stack.length > 0) stack[stack.length - 1]!.textParts.push(decodeEntities(text.slice(i)));
      break;
    }
    if (lt > i && stack.length > 0) stack[stack.length - 1]!.textParts.push(decodeEntities(text.slice(i, lt)));

    if (text.startsWith("<!--", lt)) {
      const end = text.indexOf("-->", lt + 4);
      if (end < 0) throw new MusicXmlXmlError("INVALID_XML", "Unterminated comment.");
      i = end + 3; continue;
    }
    if (text.startsWith("<![CDATA[", lt)) {
      const end = text.indexOf("]]>", lt + 9);
      if (end < 0) throw new MusicXmlXmlError("INVALID_XML", "Unterminated CDATA.");
      if (stack.length > 0) stack[stack.length - 1]!.textParts.push(text.slice(lt + 9, end));
      i = end + 3; continue;
    }
    if (text.startsWith("<?", lt)) {
      const end = text.indexOf("?>", lt + 2);
      if (end < 0) throw new MusicXmlXmlError("INVALID_XML", "Unterminated processing instruction.");
      i = end + 2; continue;
    }
    if (/^<!DOCTYPE\b/i.test(text.slice(lt))) {
      i = declarationEnd(text, lt + 2); continue;
    }
    if (text.startsWith("<!", lt)) {
      i = declarationEnd(text, lt + 2); continue;
    }
    if (text.startsWith("</", lt)) {
      const gt = text.indexOf(">", lt + 2);
      if (gt < 0) throw new MusicXmlXmlError("INVALID_XML", "Unterminated closing tag.");
      const closeName = localName(text.slice(lt + 2, gt).trim());
      const node = stack.pop();
      if (!node || node.name !== closeName) throw new MusicXmlXmlError("INVALID_XML", `Mismatched closing tag </${closeName}>.`);
      i = gt + 1; continue;
    }

    let gt = lt + 1;
    let quote: string | null = null;
    while (gt < text.length) {
      const ch = text[gt]!;
      if (quote !== null) {
        if (ch === quote) quote = null;
      } else if (ch === "\"" || ch === "'") {
        quote = ch;
      } else if (ch === ">") break;
      gt += 1;
    }
    if (gt >= text.length) throw new MusicXmlXmlError("INVALID_XML", "Unterminated start tag.");

    let raw = text.slice(lt + 1, gt);
    const selfClosing = /\/\s*$/.test(raw);
    if (selfClosing) raw = raw.replace(/\/\s*$/, "");
    const parsed = parseTag(raw);
    const mutable: MutableNode = {name: parsed.name, attributes: {...parsed.attributes}, children: [], textParts: []};

    if (stack.length > 0) stack[stack.length - 1]!.children.push(mutable);
    else {
      if (root !== null) throw new MusicXmlXmlError("INVALID_XML", "Multiple root elements.");
      root = mutable;
    }
    if (!selfClosing) stack.push(mutable);
    i = gt + 1;
  }

  if (stack.length !== 0) throw new MusicXmlXmlError("INVALID_XML", "Document ended before elements closed.");
  if (root === null) throw new MusicXmlXmlError("INVALID_XML", "No root element.");
  return freezeNode(root);
}

export function musicXmlChildren(node: MusicXmlXmlNode, name: string): readonly MusicXmlXmlNode[] {
  return node.children.filter((child) => child.name === name);
}
export function musicXmlChild(node: MusicXmlXmlNode, name: string): MusicXmlXmlNode | undefined {
  return node.children.find((child) => child.name === name);
}
export function musicXmlText(node: MusicXmlXmlNode, name: string): string | undefined {
  return musicXmlChild(node, name)?.text;
}
