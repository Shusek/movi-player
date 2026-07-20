import { describe, expect, it } from "vitest";
import { FileSource } from "./FileSource";

describe("FileSource", () => {
  it("forks Blob sources with an independent cursor", async () => {
    const source = new FileSource(
      new Blob([new Uint8Array([1, 2, 3, 4])]),
      null,
      "fixture.bin",
    );
    const fork = await source.fork();

    expect(new Uint8Array(await source.read(0, 2))).toEqual(
      new Uint8Array([1, 2]),
    );
    expect(new Uint8Array(await fork.read(2, 2))).toEqual(
      new Uint8Array([3, 4]),
    );
    expect(source.getPosition()).toBe(2);
    expect(fork.getPosition()).toBe(4);

    fork.close();
    source.close();
  });
});
