/* PHASE16_PACK_A_MUSICXML
 * Safe MXL ZIP container loader. No extraction to disk.
 * PHASE16_6_MXL_CLOSURE hardens ZIP structure, duplicate members,
 * local/central header agreement, encryption rejection, and streamed
 * decompression-size enforcement.
 */
import type {MusicXmlMxlLoadResult} from "./musicxml-types.js";
import {musicXmlChild, musicXmlChildren, parseMusicXmlXml} from "./musicxml-xml.js";

const MAX_ZIP_MEMBERS = 256;
const MAX_MEMBER_BYTES = 32 * 1024 * 1024;
const MAX_TOTAL_UNCOMPRESSED_BYTES = 64 * 1024 * 1024;
const MAX_COMPRESSION_RATIO = 200;

interface ZipEntry {
  readonly name: string;
  readonly normalizedName: string;
  readonly flags: number;
  readonly method: number;
  readonly compressedSize: number;
  readonly uncompressedSize: number;
  readonly localHeaderOffset: number;
}

type ZipDirectoryResult =
  | Readonly<{kind: "ok"; entries: readonly ZipEntry[]}>
  | Readonly<{kind: "invalid"}>
  | Readonly<{kind: "limit"}>;

type EntryBytesResult =
  | Readonly<{kind: "ok"; bytes: Uint8Array}>
  | Readonly<{kind: "invalid"}>
  | Readonly<{kind: "limit"}>
  | Readonly<{kind: "decompression-unavailable"}>;

function u16(data: Uint8Array, offset: number): number {
  return data[offset]! | (data[offset + 1]! << 8);
}

function u32(data: Uint8Array, offset: number): number {
  return (
    data[offset]!
    | (data[offset + 1]! << 8)
    | (data[offset + 2]! << 16)
    | (data[offset + 3]! << 24)
  ) >>> 0;
}

function decoder(): {decode(input?: Uint8Array): string} | null {
  const Decoder = (
    globalThis as unknown as {
      TextDecoder?: new (
        label?: string,
      ) => {decode(input?: Uint8Array): string};
    }
  ).TextDecoder;
  return Decoder ? new Decoder("utf-8") : null;
}

function normalizePath(name: string): string {
  return name.replace(/\\/g, "/");
}

function unsafePath(name: string): boolean {
  const normalized = normalizePath(name);
  return normalized.startsWith("/")
    || /^[A-Za-z]:\//.test(normalized)
    || normalized.split("/").some((part) => part === "..");
}

function findEocd(data: Uint8Array): number {
  const min = Math.max(0, data.length - 65557);
  for (let i = data.length - 22; i >= min; i -= 1) {
    if (u32(data, i) === 0x06054b50) return i;
  }
  return -1;
}

function readEntries(data: Uint8Array): ZipDirectoryResult {
  const dec = decoder();
  if (!dec) return Object.freeze({kind: "invalid"});

  const eocd = findEocd(data);
  if (eocd < 0 || eocd + 22 > data.length) {
    return Object.freeze({kind: "invalid"});
  }

  const diskNumber = u16(data, eocd + 4);
  const centralDisk = u16(data, eocd + 6);
  const entriesOnDisk = u16(data, eocd + 8);
  const count = u16(data, eocd + 10);
  const centralSize = u32(data, eocd + 12);
  const centralOffset = u32(data, eocd + 16);

  // Multi-disk and ZIP64 are outside the frozen Phase 16.6 contract.
  if (
    diskNumber !== 0
    || centralDisk !== 0
    || entriesOnDisk !== count
    || count === 0xffff
    || centralSize === 0xffffffff
    || centralOffset === 0xffffffff
  ) {
    return Object.freeze({kind: "invalid"});
  }

  if (count > MAX_ZIP_MEMBERS) {
    return Object.freeze({kind: "limit"});
  }

  if (
    centralOffset > data.length
    || centralSize > data.length
    || centralOffset + centralSize > data.length
    || centralOffset + centralSize > eocd
  ) {
    return Object.freeze({kind: "invalid"});
  }

  const result: ZipEntry[] = [];
  const normalizedNames = new Set<string>();
  let p = centralOffset;
  let total = 0;

  for (let i = 0; i < count; i += 1) {
    if (p + 46 > data.length || u32(data, p) !== 0x02014b50) {
      return Object.freeze({kind: "invalid"});
    }

    const flags = u16(data, p + 8);
    const method = u16(data, p + 10);
    const compressedSize = u32(data, p + 20);
    const uncompressedSize = u32(data, p + 24);
    const nameLength = u16(data, p + 28);
    const extraLength = u16(data, p + 30);
    const commentLength = u16(data, p + 32);
    const diskStart = u16(data, p + 34);
    const localHeaderOffset = u32(data, p + 42);
    const nameStart = p + 46;
    const nameEnd = nameStart + nameLength;
    const next = nameEnd + extraLength + commentLength;

    if (
      diskStart !== 0
      || nameEnd > data.length
      || next > data.length
      || next > centralOffset + centralSize
      || localHeaderOffset === 0xffffffff
    ) {
      return Object.freeze({kind: "invalid"});
    }

    const name = dec.decode(data.slice(nameStart, nameEnd));
    const normalizedName = normalizePath(name);

    // Encrypted MXL members are not accepted.
    if ((flags & 0x0001) !== 0) {
      return Object.freeze({kind: "invalid"});
    }

    if (
      name.length === 0
      || unsafePath(name)
      || normalizedNames.has(normalizedName)
    ) {
      return unsafePath(name)
        ? Object.freeze({kind: "limit"})
        : Object.freeze({kind: "invalid"});
    }
    normalizedNames.add(normalizedName);

    total += uncompressedSize;
    if (
      uncompressedSize > MAX_MEMBER_BYTES
      || total > MAX_TOTAL_UNCOMPRESSED_BYTES
      || (
        compressedSize > 0
        && uncompressedSize / compressedSize > MAX_COMPRESSION_RATIO
      )
    ) {
      return Object.freeze({kind: "limit"});
    }

    result.push(Object.freeze({
      name,
      normalizedName,
      flags,
      method,
      compressedSize,
      uncompressedSize,
      localHeaderOffset,
    }));

    p = next;
  }

  if (p > centralOffset + centralSize) {
    return Object.freeze({kind: "invalid"});
  }

  return Object.freeze({
    kind: "ok",
    entries: Object.freeze(result),
  });
}

function compressedPayload(
  data: Uint8Array,
  entry: ZipEntry,
): Uint8Array | null {
  const p = entry.localHeaderOffset;
  if (p + 30 > data.length || u32(data, p) !== 0x04034b50) return null;

  const localFlags = u16(data, p + 6);
  const localMethod = u16(data, p + 8);
  const localCompressedSize = u32(data, p + 18);
  const localUncompressedSize = u32(data, p + 22);
  const nameLength = u16(data, p + 26);
  const extraLength = u16(data, p + 28);
  const nameStart = p + 30;
  const nameEnd = nameStart + nameLength;
  const dec = decoder();

  if (
    !dec
    || nameEnd > data.length
    || localFlags !== entry.flags
    || localMethod !== entry.method
  ) {
    return null;
  }

  const localName = normalizePath(dec.decode(data.slice(nameStart, nameEnd)));
  if (localName !== entry.normalizedName) return null;

  // If bit 3 is clear, sizes in the local header must agree with central data.
  if (
    (localFlags & 0x0008) === 0
    && (
      localCompressedSize !== entry.compressedSize
      || localUncompressedSize !== entry.uncompressedSize
    )
  ) {
    return null;
  }

  const start = nameEnd + extraLength;
  const end = start + entry.compressedSize;
  return end <= data.length ? data.slice(start, end) : null;
}

async function inflateRaw(
  data: Uint8Array,
  expectedBytes: number,
): Promise<EntryBytesResult> {
  const g = globalThis as unknown as {
    DecompressionStream?: new (format: string) => unknown;
    Blob?: new (parts?: readonly unknown[]) => {stream(): unknown};
  };

  if (!g.DecompressionStream || !g.Blob) {
    return Object.freeze({kind: "decompression-unavailable"});
  }

  interface Reader {
    read(): Promise<Readonly<{done: boolean; value?: Uint8Array}>>;
    cancel(reason?: unknown): Promise<void> | void;
  }

  try {
    const output = (
      new g.Blob([data]).stream() as {
        pipeThrough(transform: unknown): unknown;
      }
    ).pipeThrough(new g.DecompressionStream("deflate-raw"));

    const reader = (output as {getReader(): Reader}).getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;

    while (true) {
      const item = await reader.read();
      if (item.done) break;
      const value = item.value;
      if (!value) continue;

      total += value.byteLength;
      if (
        total > expectedBytes
        || total > MAX_MEMBER_BYTES
      ) {
        await reader.cancel("MXL decompression limit exceeded.");
        return Object.freeze({kind: "limit"});
      }
      chunks.push(value);
    }

    if (total !== expectedBytes) {
      return Object.freeze({kind: "invalid"});
    }

    const combined = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.byteLength;
    }

    return Object.freeze({kind: "ok", bytes: combined});
  } catch {
    return Object.freeze({kind: "invalid"});
  }
}

async function entryBytes(
  archive: Uint8Array,
  entry: ZipEntry,
): Promise<EntryBytesResult> {
  const payload = compressedPayload(archive, entry);
  if (!payload) return Object.freeze({kind: "invalid"});

  if (entry.method === 0) {
    if (
      payload.byteLength !== entry.uncompressedSize
      || entry.compressedSize !== entry.uncompressedSize
    ) {
      return Object.freeze({kind: "invalid"});
    }
    return Object.freeze({kind: "ok", bytes: payload});
  }

  if (entry.method === 8) {
    return inflateRaw(payload, entry.uncompressedSize);
  }

  return Object.freeze({kind: "invalid"});
}

function entryFailure(
  result: Exclude<EntryBytesResult, Readonly<{kind: "ok"; bytes: Uint8Array}>>,
  entry: ZipEntry,
  role: string,
): MusicXmlMxlLoadResult {
  if (result.kind === "limit") {
    return Object.freeze({
      ok: false,
      code: "ZIP_LIMIT_EXCEEDED",
      message: `${role} exceeded the frozen MXL decompression limits.`,
    });
  }

  if (result.kind === "decompression-unavailable") {
    return Object.freeze({
      ok: false,
      code: "DECOMPRESSION_UNAVAILABLE",
      message: `Could not decompress ${entry.normalizedName}: deflate-raw support is unavailable.`,
    });
  }

  return Object.freeze({
    ok: false,
    code: "INVALID_ZIP",
    message: `Could not safely read ${entry.normalizedName}.`,
  });
}

export async function loadMusicXmlFromMxl(
  archive: Uint8Array,
): Promise<MusicXmlMxlLoadResult> {
  const directory = readEntries(archive);

  if (directory.kind === "invalid") {
    return Object.freeze({
      ok: false,
      code: "INVALID_ZIP",
      message: "MXL archive has no valid single-disk ZIP central directory.",
    });
  }

  if (directory.kind === "limit") {
    return Object.freeze({
      ok: false,
      code: "ZIP_LIMIT_EXCEEDED",
      message: "MXL archive violated path/member/size/ratio limits.",
    });
  }

  const entries = directory.entries;
  const byName = new Map(
    entries.map((entry) => [entry.normalizedName, entry]),
  );

  const containerEntry = byName.get("META-INF/container.xml");
  if (!containerEntry) {
    return Object.freeze({
      ok: false,
      code: "MISSING_CONTAINER",
      message: "MXL archive has no META-INF/container.xml.",
    });
  }

  if (containerEntry.method !== 0 && containerEntry.method !== 8) {
    return Object.freeze({
      ok: false,
      code: "UNSUPPORTED_ZIP_COMPRESSION",
      message: `Unsupported ZIP method ${containerEntry.method}.`,
    });
  }

  const containerResult = await entryBytes(archive, containerEntry);
  if (containerResult.kind !== "ok") {
    if (containerResult.kind === "decompression-unavailable") {
      return Object.freeze({
        ok: false,
        code: "DECOMPRESSION_UNAVAILABLE",
        message: "Could not decompress container.xml.",
      });
    }
    if (containerResult.kind === "limit") {
      return Object.freeze({
        ok: false,
        code: "ZIP_LIMIT_EXCEEDED",
        message: "container.xml exceeded the frozen MXL decompression limits.",
      });
    }
    return Object.freeze({
      ok: false,
      code: "INVALID_CONTAINER",
      message: "Could not safely read container.xml.",
    });
  }

  const dec = decoder();
  if (!dec) {
    return Object.freeze({
      ok: false,
      code: "INVALID_CONTAINER",
      message: "TextDecoder unavailable.",
    });
  }

  let root;
  try {
    root = parseMusicXmlXml(dec.decode(containerResult.bytes));
  } catch (error) {
    return Object.freeze({
      ok: false,
      code: "INVALID_CONTAINER",
      message: error instanceof Error ? error.message : String(error),
    });
  }

  const rootfiles = musicXmlChild(root, "rootfiles");
  const rootfile = rootfiles
    ? musicXmlChildren(rootfiles, "rootfile")[0]
    : undefined;
  const fullPath = rootfile?.attributes["full-path"];

  if (!fullPath) {
    return Object.freeze({
      ok: false,
      code: "MISSING_ROOTFILE",
      message: "container.xml has no rootfile full-path.",
    });
  }

  if (unsafePath(fullPath)) {
    return Object.freeze({
      ok: false,
      code: "UNSAFE_ZIP_PATH",
      message: `Unsafe MXL rootfile path: ${fullPath}.`,
    });
  }

  const normalized = normalizePath(fullPath);
  const rootEntry = byName.get(normalized);
  if (!rootEntry) {
    return Object.freeze({
      ok: false,
      code: "ROOTFILE_NOT_FOUND",
      message: `Declared rootfile not found: ${normalized}.`,
    });
  }

  if (rootEntry.method !== 0 && rootEntry.method !== 8) {
    return Object.freeze({
      ok: false,
      code: "UNSUPPORTED_ZIP_COMPRESSION",
      message: `Unsupported ZIP method ${rootEntry.method}.`,
    });
  }

  const xmlResult = await entryBytes(archive, rootEntry);
  if (xmlResult.kind !== "ok") {
    return entryFailure(xmlResult, rootEntry, "MusicXML rootfile");
  }

  return Object.freeze({
    ok: true,
    xml: xmlResult.bytes,
    rootfilePath: normalized,
  });
}
