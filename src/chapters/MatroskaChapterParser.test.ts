import { describe, expect, it } from "vitest";
import type { SourceAdapter } from "../source/SourceAdapter";
import {
  parseMatroskaChaptersElement,
  readMatroskaChapters,
} from "./MatroskaChapterParser";

const encoder = new TextEncoder();

function concat(...parts: Uint8Array[]): Uint8Array {
  const length = parts.reduce((sum, part) => sum + part.byteLength, 0);
  const result = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.byteLength;
  }
  return result;
}

function idBytes(id: number): Uint8Array {
  const bytes: number[] = [];
  let remainder = id;
  while (remainder > 0) {
    bytes.unshift(remainder % 256);
    remainder = Math.floor(remainder / 256);
  }
  return new Uint8Array(bytes);
}

function sizeBytes(size: number): Uint8Array {
  const length =
    size <= 0x7e ? 1 : size <= 0x3ffe ? 2 : size <= 0x1ffffe ? 3 : 4;
  const bytes = new Uint8Array(length);
  let remainder = size;
  for (let index = length - 1; index >= 0; index--) {
    bytes[index] = remainder % 256;
    remainder = Math.floor(remainder / 256);
  }
  bytes[0] |= 1 << (8 - length);
  return bytes;
}

function element(id: number, ...payload: Uint8Array[]): Uint8Array {
  const body = concat(...payload);
  return concat(idBytes(id), sizeBytes(body.byteLength), body);
}

function unsigned(value: bigint): Uint8Array {
  if (value === 0n) return new Uint8Array([0]);
  const bytes: number[] = [];
  let remainder = value;
  while (remainder > 0n) {
    bytes.unshift(Number(remainder & 0xffn));
    remainder >>= 8n;
  }
  return new Uint8Array(bytes);
}

function display(
  title: string,
  language: string,
  country?: string,
): Uint8Array {
  return element(
    0x80,
    element(0x85, encoder.encode(title)),
    element(0x437d, encoder.encode(language)),
    ...(country ? [element(0x437e, encoder.encode(country))] : []),
  );
}

function chapter(
  id: bigint,
  startNanoseconds: bigint,
  endNanoseconds: bigint | null,
  displays: Uint8Array[],
  flags: { hidden?: boolean; enabled?: boolean } = {},
): Uint8Array {
  return element(
    0xb6,
    element(0x73c4, unsigned(id)),
    element(0x91, unsigned(startNanoseconds)),
    ...(endNanoseconds === null
      ? []
      : [element(0x92, unsigned(endNanoseconds))]),
    element(0x98, unsigned(flags.hidden ? 1n : 0n)),
    element(0x4598, unsigned(flags.enabled === false ? 0n : 1n)),
    ...displays,
  );
}

function edition(
  uid: bigint,
  isDefault: boolean,
  ...chapters: Uint8Array[]
): Uint8Array {
  return element(
    0x45b9,
    element(0x45bc, unsigned(uid)),
    element(0x45db, unsigned(isDefault ? 1n : 0n)),
    ...chapters,
  );
}

function chaptersFixture(): Uint8Array {
  return element(
    0x1043a770,
    edition(
      1n,
      false,
      chapter(1n, 0n, 1_000_000_000n, [display("Wrong edition", "en")]),
    ),
    edition(
      99n,
      true,
      chapter(
        123n,
        1_000_000_000n,
        3_000_000_000n,
        [display("Początek", "pl-PL", "PL"), display("Opening", "en")],
        { hidden: true },
      ),
      chapter(124n, 3_000_000_000n, null, [display("Koniec", "pl")]),
      chapter(
        125n,
        4_000_000_000n,
        null,
        [display("Disabled", "en")],
        { enabled: false },
      ),
    ),
  );
}

class MemorySource implements SourceAdapter {
  private position = 0;

  constructor(private readonly bytes: Uint8Array) {}

  async getSize(): Promise<number> {
    return this.bytes.byteLength;
  }

  async read(offset: number, length: number): Promise<ArrayBuffer> {
    const data = this.bytes.slice(offset, offset + length);
    this.position = offset + data.byteLength;
    return data.buffer;
  }

  seek(offset: number): number {
    this.position = offset;
    return offset;
  }

  getPosition(): number {
    return this.position;
  }

  close(): void {}

  getKey(): string {
    return "memory";
  }

  async fork(): Promise<SourceAdapter> {
    return new MemorySource(this.bytes);
  }
}

describe("MatroskaChapterParser", () => {
  it("selects the default edition and preserves stable IDs and labels", () => {
    const result = parseMatroskaChaptersElement(chaptersFixture(), 8);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: "123",
      title: "Początek",
      start: 1,
      end: 3,
      language: "pl-PL",
      labels: [
        { text: "Początek", language: "pl-PL", country: "PL" },
        { text: "Opening", language: "en", country: undefined },
      ],
      isHidden: true,
    });
    expect(result[1]).toMatchObject({
      id: "124",
      title: "Koniec",
      start: 3,
      end: 8,
      language: "pl",
      isHidden: false,
    });
  });

  it("finds a Chapters element through a bounded independent source", async () => {
    const segment = element(
      0x18538067,
      element(0x1549a966, element(0x2ad7b1, unsigned(1_000_000n))),
      chaptersFixture(),
    );
    const file = concat(
      element(0x1a45dfa3, element(0x4286, unsigned(1n))),
      segment,
    );

    const result = await readMatroskaChapters(
      new MemorySource(file),
      8,
      { scanBytes: 64 * 1024 },
    );

    expect(result.map(({ id }) => id)).toEqual(["123", "124"]);
  });
});
