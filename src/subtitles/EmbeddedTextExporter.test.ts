import { describe, expect, it, vi } from "vitest";
import { MoviError } from "../errors/MoviError";
import type { Packet, SubtitleTrack } from "../types";
import type { WasmAttachment } from "../wasm/bindings";
import { assembleEmbeddedTextTrack } from "./EmbeddedTextExporter";

vi.mock("../demux/Demuxer", () => ({ Demuxer: class {} }));

const encoder = new TextEncoder();

function subtitleTrack(
  codec: string,
  id: number = 7,
): SubtitleTrack {
  return {
    id,
    type: "subtitle",
    codec,
    subtitleType: "text",
    language: "pl",
    label: "Polski",
  };
}

function packet(
  text: string,
  timestamp: number,
  duration: number,
  streamIndex: number = 7,
): Packet {
  return {
    streamIndex,
    keyframe: true,
    timestamp,
    dts: timestamp,
    duration,
    data: encoder.encode(text),
    isIdr: false,
    isRasl: false,
    disposable: false,
  };
}

function attachment(
  streamIndex: number,
  name: string,
  mimeType: string,
  size: number,
): WasmAttachment {
  return {
    streamIndex,
    name,
    mimeType,
    data: new Uint8Array(size).fill(streamIndex),
  };
}

describe("assembleEmbeddedTextTrack", () => {
  it("reconstructs Matroska ASS packets without losing dialogue fields", () => {
    const header = [
      "[Script Info]",
      "ScriptType: v4.00+",
      "",
      "[V4+ Styles]",
      "Format: Name, Fontname, Fontsize",
      "Style: Fancy,Inter,28",
    ].join("\n");
    const result = assembleEmbeddedTextTrack(
      subtitleTrack("ass"),
      [
        packet(
          "42,3,Fancy,Alice,0010,0020,0030,fx,Hello, world",
          12.345,
          1.235,
        ),
      ],
      encoder.encode(header),
      [],
      10,
    );

    expect(result.format).toBe("ass");
    expect(result.content).toContain(header);
    expect(result.content).toContain(
      "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
    );
    expect(result.content).toContain(
      "Dialogue: 3,0:00:02.35,0:00:03.58,Fancy,Alice,0010,0020,0030,fx,Hello, world",
    );
  });

  it("exports only font attachments and enforces per-file and total caps", () => {
    const result = assembleEmbeddedTextTrack(
      subtitleTrack("subrip"),
      [packet("Dzień dobry", 0, 2)],
      null,
      [
        attachment(10, "regular.ttf", "application/x-truetype-font", 4),
        attachment(11, "large.otf", "font/otf", 9),
        attachment(12, "poster.jpg", "image/jpeg", 2),
        attachment(13, "fallback.woff2", "font/woff2", 4),
      ],
      0,
      {
        maxFontCount: 2,
        maxFontBytes: 8,
        maxTotalFontBytes: 8,
      },
    );

    expect(result.attachments.map(({ name }) => name)).toEqual([
      "regular.ttf",
      "fallback.woff2",
    ]);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].code).toBe("ATTACHMENT_LIMIT");
  });

  it("fails with a typed error when the text limit is exceeded", () => {
    expect(() =>
      assembleEmbeddedTextTrack(
        subtitleTrack("webvtt"),
        [packet("too long", 0, 1)],
        null,
        [],
        0,
        { maxTextBytes: 8 },
      ),
    ).toThrowError(
      expect.objectContaining<Partial<MoviError>>({
        code: "SUBTITLE_EXPORT_LIMIT",
        category: "subtitle",
      }),
    );
  });
});
