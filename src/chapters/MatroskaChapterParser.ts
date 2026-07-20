import type { SourceAdapter } from "../source/SourceAdapter";
import type { Chapter, ChapterLabel } from "../types";

const DEFAULT_SCAN_BYTES = 4 * 1024 * 1024;
const DEFAULT_MAX_CHAPTER_BYTES = 8 * 1024 * 1024;

const IDS = {
  SEGMENT: 0x18538067,
  SEEK_HEAD: 0x114d9b74,
  SEEK: 0x4dbb,
  SEEK_ID: 0x53ab,
  SEEK_POSITION: 0x53ac,
  CHAPTERS: 0x1043a770,
  EDITION_ENTRY: 0x45b9,
  EDITION_UID: 0x45bc,
  EDITION_FLAG_HIDDEN: 0x45bd,
  EDITION_FLAG_DEFAULT: 0x45db,
  CHAPTER_ATOM: 0xb6,
  CHAPTER_UID: 0x73c4,
  CHAPTER_STRING_UID: 0x5654,
  CHAPTER_TIME_START: 0x91,
  CHAPTER_TIME_END: 0x92,
  CHAPTER_FLAG_HIDDEN: 0x98,
  CHAPTER_FLAG_ENABLED: 0x4598,
  CHAPTER_DISPLAY: 0x80,
  CHAP_STRING: 0x85,
  CHAP_LANGUAGE: 0x437c,
  CHAP_LANGUAGE_IETF: 0x437d,
  CHAP_COUNTRY: 0x437e,
} as const;

const CHAPTERS_ID_BYTES = new Uint8Array([0x10, 0x43, 0xa7, 0x70]);
const SEGMENT_ID_BYTES = new Uint8Array([0x18, 0x53, 0x80, 0x67]);
const SEEK_HEAD_ID_BYTES = new Uint8Array([0x11, 0x4d, 0x9b, 0x74]);

interface EbmlElement {
  id: number;
  start: number;
  dataStart: number;
  dataEnd: number;
  end: number;
  complete: boolean;
}

interface ParsedChapterAtom {
  id?: string;
  start: number;
  end?: number;
  enabled: boolean;
  isHidden: boolean;
  labels: ChapterLabel[];
  children: ParsedChapterAtom[];
}

interface ParsedEdition {
  id?: string;
  isDefault: boolean;
  isHidden: boolean;
  atoms: ParsedChapterAtom[];
}

export interface MatroskaChapterReadOptions {
  scanBytes?: number;
  maxChapterBytes?: number;
}

function vintLength(firstByte: number, maxLength: number): number {
  let marker = 0x80;
  for (let length = 1; length <= maxLength; length++) {
    if ((firstByte & marker) !== 0) return length;
    marker >>= 1;
  }
  return 0;
}

function readElement(
  bytes: Uint8Array,
  offset: number,
  limit: number = bytes.byteLength,
): EbmlElement | null {
  if (offset < 0 || offset >= limit) return null;
  const idLength = vintLength(bytes[offset], 4);
  if (idLength === 0 || offset + idLength >= limit) return null;

  let id = 0;
  for (let index = 0; index < idLength; index++) {
    id = id * 256 + bytes[offset + index];
  }

  const sizeOffset = offset + idLength;
  const sizeLength = vintLength(bytes[sizeOffset], 8);
  if (sizeLength === 0 || sizeOffset + sizeLength > limit) return null;
  const marker = 1 << (8 - sizeLength);
  let size = BigInt(bytes[sizeOffset] & (marker - 1));
  for (let index = 1; index < sizeLength; index++) {
    size = size * 256n + BigInt(bytes[sizeOffset + index]);
  }
  const unknownSize = size === (1n << BigInt(7 * sizeLength)) - 1n;
  const dataStart = sizeOffset + sizeLength;
  const declaredEnd = unknownSize
    ? limit
    : dataStart + Number(size > BigInt(Number.MAX_SAFE_INTEGER)
      ? BigInt(Number.MAX_SAFE_INTEGER)
      : size);
  const dataEnd = Math.min(limit, declaredEnd);
  return {
    id,
    start: offset,
    dataStart,
    dataEnd,
    end: dataEnd,
    complete: unknownSize || declaredEnd <= limit,
  };
}

function children(
  bytes: Uint8Array,
  parent: EbmlElement,
): EbmlElement[] {
  const result: EbmlElement[] = [];
  let offset = parent.dataStart;
  while (offset < parent.dataEnd) {
    const child = readElement(bytes, offset, parent.dataEnd);
    if (!child || child.end <= offset) break;
    result.push(child);
    if (!child.complete) break;
    offset = child.end;
  }
  return result;
}

function findBytes(
  haystack: Uint8Array,
  needle: Uint8Array,
  from: number = 0,
): number {
  const last = haystack.byteLength - needle.byteLength;
  outer: for (let index = Math.max(0, from); index <= last; index++) {
    for (let part = 0; part < needle.byteLength; part++) {
      if (haystack[index + part] !== needle[part]) continue outer;
    }
    return index;
  }
  return -1;
}

function elementPayload(
  bytes: Uint8Array,
  element: EbmlElement,
): Uint8Array {
  return bytes.subarray(element.dataStart, element.dataEnd);
}

function unsignedInteger(
  bytes: Uint8Array,
  element: EbmlElement,
): bigint {
  let value = 0n;
  for (let index = element.dataStart; index < element.dataEnd; index++) {
    value = value * 256n + BigInt(bytes[index]);
  }
  return value;
}

function flag(
  bytes: Uint8Array,
  element: EbmlElement | undefined,
  defaultValue: boolean,
): boolean {
  return element
    ? unsignedInteger(bytes, element) !== 0n
    : defaultValue;
}

function text(bytes: Uint8Array, element?: EbmlElement): string {
  if (!element) return "";
  return new TextDecoder("utf-8")
    .decode(elementPayload(bytes, element))
    .replace(/\0+$/gu, "")
    .trim();
}

function first(
  elements: EbmlElement[],
  id: number,
): EbmlElement | undefined {
  return elements.find((element) => element.id === id);
}

function parseDisplay(
  bytes: Uint8Array,
  element: EbmlElement,
): ChapterLabel | null {
  const fields = children(bytes, element);
  const displayText = text(bytes, first(fields, IDS.CHAP_STRING));
  if (!displayText) return null;
  const language =
    text(bytes, first(fields, IDS.CHAP_LANGUAGE_IETF)) ||
    text(bytes, first(fields, IDS.CHAP_LANGUAGE)) ||
    undefined;
  const country =
    text(bytes, first(fields, IDS.CHAP_COUNTRY)) || undefined;
  return { text: displayText, language, country };
}

function parseAtom(
  bytes: Uint8Array,
  element: EbmlElement,
): ParsedChapterAtom | null {
  const fields = children(bytes, element);
  const startElement = first(fields, IDS.CHAPTER_TIME_START);
  if (!startElement) return null;
  const stringId = text(bytes, first(fields, IDS.CHAPTER_STRING_UID));
  const numericId = first(fields, IDS.CHAPTER_UID);
  const labels = fields
    .filter((field) => field.id === IDS.CHAPTER_DISPLAY)
    .map((field) => parseDisplay(bytes, field))
    .filter((label): label is ChapterLabel => label !== null);
  const endElement = first(fields, IDS.CHAPTER_TIME_END);

  return {
    id:
      stringId ||
      (numericId ? unsignedInteger(bytes, numericId).toString() : undefined),
    start: Number(unsignedInteger(bytes, startElement)) / 1_000_000_000,
    end: endElement
      ? Number(unsignedInteger(bytes, endElement)) / 1_000_000_000
      : undefined,
    enabled: flag(
      bytes,
      first(fields, IDS.CHAPTER_FLAG_ENABLED),
      true,
    ),
    isHidden: flag(
      bytes,
      first(fields, IDS.CHAPTER_FLAG_HIDDEN),
      false,
    ),
    labels,
    children: fields
      .filter((field) => field.id === IDS.CHAPTER_ATOM)
      .map((field) => parseAtom(bytes, field))
      .filter((atom): atom is ParsedChapterAtom => atom !== null),
  };
}

function parseEdition(
  bytes: Uint8Array,
  element: EbmlElement,
): ParsedEdition {
  const fields = children(bytes, element);
  const uid = first(fields, IDS.EDITION_UID);
  return {
    id: uid ? unsignedInteger(bytes, uid).toString() : undefined,
    isDefault: flag(
      bytes,
      first(fields, IDS.EDITION_FLAG_DEFAULT),
      false,
    ),
    isHidden: flag(
      bytes,
      first(fields, IDS.EDITION_FLAG_HIDDEN),
      false,
    ),
    atoms: fields
      .filter((field) => field.id === IDS.CHAPTER_ATOM)
      .map((field) => parseAtom(bytes, field))
      .filter((atom): atom is ParsedChapterAtom => atom !== null),
  };
}

function flattenAtoms(
  atoms: ParsedChapterAtom[],
  editionId: string,
  path: number[] = [],
): Array<Omit<Chapter, "end"> & { end?: number }> {
  const result: Array<Omit<Chapter, "end"> & { end?: number }> = [];
  atoms.forEach((atom, index) => {
    if (!atom.enabled) return;
    const currentPath = [...path, index];
    const title =
      atom.labels[0]?.text ||
      `Chapter ${currentPath.map((part) => part + 1).join(".")}`;
    const language = atom.labels[0]?.language;
    result.push({
      id: atom.id || `${editionId}:${currentPath.join(".")}`,
      title,
      start: atom.start,
      end: atom.end,
      labels: atom.labels.length > 0
        ? atom.labels.map((label) => ({ ...label }))
        : [{ text: title }],
      language,
      isHidden: atom.isHidden,
    });
    result.push(
      ...flattenAtoms(atom.children, editionId, currentPath),
    );
  });
  return result;
}

/**
 * Parse a complete Matroska Chapters element (including its EBML header).
 */
export function parseMatroskaChaptersElement(
  bytes: Uint8Array,
  mediaDuration: number,
): Chapter[] {
  const candidate = readElement(bytes, 0);
  const chaptersElement =
    candidate?.id === IDS.CHAPTERS
      ? candidate
      : (() => {
          const offset = findBytes(bytes, CHAPTERS_ID_BYTES);
          return offset >= 0 ? readElement(bytes, offset) : null;
        })();
  if (
    !chaptersElement ||
    chaptersElement.id !== IDS.CHAPTERS ||
    !chaptersElement.complete
  ) {
    return [];
  }

  const editions = children(bytes, chaptersElement)
    .filter((element) => element.id === IDS.EDITION_ENTRY)
    .map((element) => parseEdition(bytes, element));
  const visibleEditions = editions.filter((edition) => !edition.isHidden);
  const pool = visibleEditions.length > 0 ? visibleEditions : editions;
  const edition =
    pool.find((candidateEdition) => candidateEdition.isDefault) ?? pool[0];
  if (!edition) return [];

  const flattened = flattenAtoms(
    edition.atoms,
    edition.id || "edition-0",
  )
    .map((chapter, index) => ({ ...chapter, sourceOrder: index }))
    .sort(
      (left, right) =>
        left.start - right.start || left.sourceOrder - right.sourceOrder,
    );

  return flattened.map((chapter, index) => {
    const nextStart = flattened
      .slice(index + 1)
      .find((candidateChapter) => candidateChapter.start > chapter.start)
      ?.start;
    const inferredEnd =
      nextStart ??
      (Number.isFinite(mediaDuration) && mediaDuration > chapter.start
        ? mediaDuration
        : chapter.start);
    const { sourceOrder: _sourceOrder, ...publicChapter } = chapter;
    return {
      ...publicChapter,
      end:
        chapter.end !== undefined && chapter.end >= chapter.start
          ? chapter.end
          : inferredEnd,
    };
  });
}

function seekPositionFromHead(
  bytes: Uint8Array,
  seekHead: EbmlElement,
): number | null {
  for (const seek of children(bytes, seekHead)) {
    if (seek.id !== IDS.SEEK) continue;
    const fields = children(bytes, seek);
    const id = first(fields, IDS.SEEK_ID);
    const position = first(fields, IDS.SEEK_POSITION);
    if (!id || !position) continue;
    const payload = elementPayload(bytes, id);
    if (
      payload.byteLength === CHAPTERS_ID_BYTES.byteLength &&
      payload.every((value, index) => value === CHAPTERS_ID_BYTES[index])
    ) {
      const offset = unsignedInteger(bytes, position);
      return offset <= BigInt(Number.MAX_SAFE_INTEGER)
        ? Number(offset)
        : null;
    }
  }
  return null;
}

async function readChaptersAt(
  source: SourceAdapter,
  offset: number,
  sourceSize: number,
  maxChapterBytes: number,
  mediaDuration: number,
): Promise<Chapter[]> {
  if (offset < 0 || offset >= sourceSize) return [];
  const header = new Uint8Array(
    await source.read(offset, Math.min(16, sourceSize - offset)),
  );
  const idLength = vintLength(header[0], 4);
  if (idLength === 0 || idLength >= header.byteLength) return [];
  let id = 0;
  for (let index = 0; index < idLength; index++) {
    id = id * 256 + header[index];
  }
  if (id !== IDS.CHAPTERS) return [];
  const sizeLength = vintLength(header[idLength], 8);
  if (
    sizeLength === 0 ||
    idLength + sizeLength > header.byteLength
  ) {
    return [];
  }
  const marker = 1 << (8 - sizeLength);
  let declaredSize = BigInt(header[idLength] & (marker - 1));
  for (let index = 1; index < sizeLength; index++) {
    declaredSize =
      declaredSize * 256n + BigInt(header[idLength + index]);
  }
  if (
    declaredSize === (1n << BigInt(7 * sizeLength)) - 1n ||
    declaredSize > BigInt(maxChapterBytes) ||
    declaredSize > BigInt(Number.MAX_SAFE_INTEGER)
  ) {
    return [];
  }
  const headerSize = idLength + sizeLength;
  const declaredPayloadSize = Number(declaredSize);
  if (
    declaredPayloadSize < 0 ||
    declaredPayloadSize > maxChapterBytes ||
    offset + headerSize + declaredPayloadSize > sourceSize
  ) {
    return [];
  }
  const bytes = new Uint8Array(
    await source.read(offset, headerSize + declaredPayloadSize),
  );
  return parseMatroskaChaptersElement(bytes, mediaDuration);
}

/**
 * Read Matroska chapter metadata without seeking or consuming the playback
 * demuxer. Reads are bounded and performed through an independent source fork.
 */
export async function readMatroskaChapters(
  source: SourceAdapter,
  mediaDuration: number,
  options: MatroskaChapterReadOptions = {},
): Promise<Chapter[]> {
  const fork = await source.fork?.();
  if (!fork) return [];
  const scanBytes = Math.max(64 * 1024, options.scanBytes ?? DEFAULT_SCAN_BYTES);
  const maxChapterBytes = Math.max(
    64 * 1024,
    options.maxChapterBytes ?? DEFAULT_MAX_CHAPTER_BYTES,
  );

  try {
    const size = await fork.getSize();
    if (size <= 0) return [];
    const prefix = new Uint8Array(
      await fork.read(0, Math.min(size, scanBytes)),
    );
    const segmentOffset = findBytes(prefix, SEGMENT_ID_BYTES);
    const segment =
      segmentOffset >= 0 ? readElement(prefix, segmentOffset) : null;
    if (!segment || segment.id !== IDS.SEGMENT) return [];
    const segmentDataOffset = segment.dataStart;

    const seekHeadOffset = findBytes(
      prefix,
      SEEK_HEAD_ID_BYTES,
      segmentDataOffset,
    );
    if (seekHeadOffset >= 0) {
      const seekHead = readElement(prefix, seekHeadOffset);
      if (seekHead?.id === IDS.SEEK_HEAD && seekHead.complete) {
        const relativePosition = seekPositionFromHead(prefix, seekHead);
        if (relativePosition !== null) {
          const chapters = await readChaptersAt(
            fork,
            segmentDataOffset + relativePosition,
            size,
            maxChapterBytes,
            mediaDuration,
          );
          if (chapters.length > 0) return chapters;
        }
      }
    }

    let directOffset = findBytes(
      prefix,
      CHAPTERS_ID_BYTES,
      segmentDataOffset,
    );
    while (directOffset >= 0) {
      const chapters = await readChaptersAt(
        fork,
        directOffset,
        size,
        maxChapterBytes,
        mediaDuration,
      );
      if (chapters.length > 0) return chapters;
      directOffset = findBytes(
        prefix,
        CHAPTERS_ID_BYTES,
        directOffset + 1,
      );
    }

    if (size > prefix.byteLength) {
      const tailOffset = Math.max(0, size - scanBytes);
      const tail = new Uint8Array(
        await fork.read(tailOffset, size - tailOffset),
      );
      let tailChapterOffset = findBytes(tail, CHAPTERS_ID_BYTES);
      while (tailChapterOffset >= 0) {
        const chapters = await readChaptersAt(
          fork,
          tailOffset + tailChapterOffset,
          size,
          maxChapterBytes,
          mediaDuration,
        );
        if (chapters.length > 0) return chapters;
        tailChapterOffset = findBytes(
          tail,
          CHAPTERS_ID_BYTES,
          tailChapterOffset + 1,
        );
      }
    }
    return [];
  } finally {
    fork.close();
  }
}
