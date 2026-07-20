import { Demuxer } from "../demux/Demuxer";
import { MoviError } from "../errors/MoviError";
import type { SourceAdapter } from "../source/SourceAdapter";
import type {
  EmbeddedTextExportOptions,
  EmbeddedTextExportWarning,
  EmbeddedTextSubtitleFormat,
  EmbeddedTextTrackExport,
  MediaAttachment,
  Packet,
  SubtitleTrack,
} from "../types";
import type { WasmAttachment } from "../wasm/bindings";

const DEFAULT_MAX_TEXT_BYTES = 64 * 1024 * 1024;
const DEFAULT_MAX_FONT_COUNT = 64;
const DEFAULT_MAX_FONT_BYTES = 16 * 1024 * 1024;
const DEFAULT_MAX_TOTAL_FONT_BYTES = 32 * 1024 * 1024;

const FONT_EXTENSIONS = new Set([
  "ttf",
  "otf",
  "ttc",
  "woff",
  "woff2",
]);

export interface EmbeddedTextExportSource {
  source: SourceAdapter;
  trackId: number;
  wasmBinary?: Uint8Array;
  options?: EmbeddedTextExportOptions;
}

function throwIfAborted(signal?: AbortSignal): void {
  if (!signal?.aborted) return;
  throw new MoviError({
    code: "ABORTED",
    category: "lifecycle",
    message: "Embedded subtitle export was aborted.",
    recoverable: true,
  });
}

function subtitleFormat(track: SubtitleTrack): EmbeddedTextSubtitleFormat {
  const codec = track.codec.toLowerCase();
  if (codec === "ass" || codec.includes("ass")) return "ass";
  if (codec === "ssa" || codec.includes("ssa")) return "ssa";
  if (codec === "subrip" || codec === "srt") return "srt";
  if (codec.includes("webvtt") || codec === "vtt") return "webvtt";
  return "text";
}

function decodeUtf8(data?: Uint8Array | null): string {
  if (!data || data.length === 0) return "";
  return new TextDecoder("utf-8").decode(data).replace(/\0+$/gu, "");
}

function assTime(seconds: number): string {
  const centiseconds = Math.max(0, Math.round(seconds * 100));
  const cs = centiseconds % 100;
  const totalSeconds = Math.floor(centiseconds / 100);
  const s = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const m = totalMinutes % 60;
  const h = Math.floor(totalMinutes / 60);
  return `${h}:${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")}.${cs.toString().padStart(2, "0")}`;
}

function srtTime(seconds: number, separator: "," | "."): string {
  const milliseconds = Math.max(0, Math.round(seconds * 1000));
  const ms = milliseconds % 1000;
  const totalSeconds = Math.floor(milliseconds / 1000);
  const s = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const m = totalMinutes % 60;
  const h = Math.floor(totalMinutes / 60);
  return `${h.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")}:${s.toString().padStart(2, "0")}${separator}${ms
    .toString()
    .padStart(3, "0")}`;
}

function packetTimes(
  packet: Packet,
  startTime: number,
): { start: number; end: number } {
  const start = Math.max(0, packet.timestamp - startTime);
  const duration =
    Number.isFinite(packet.duration) && packet.duration > 0
      ? packet.duration
      : 5;
  return { start, end: start + duration };
}

function defaultAssHeader(format: "ass" | "ssa"): string {
  const styleSection = format === "ssa" ? "[V4 Styles]" : "[V4+ Styles]";
  return [
    "[Script Info]",
    format === "ssa" ? "ScriptType: v4.00" : "ScriptType: v4.00+",
    "",
    styleSection,
    "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
    "Style: Default,Arial,24,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,1,2,10,10,18,1",
    "",
    "[Events]",
    "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
  ].join("\n");
}

function ensureAssHeader(
  header: string,
  format: "ass" | "ssa",
): string {
  const normalized = header.trimEnd();
  if (!normalized) return defaultAssHeader(format);
  if (/\[Events\]/iu.test(normalized)) return normalized;
  return `${normalized}\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text`;
}

function assDialogue(
  packet: Packet,
  startTime: number,
): string | null {
  const payload = decodeUtf8(packet.data).replace(/\r?\n$/u, "");
  if (!payload) return null;
  const fields = payload.split(",");
  const times = packetTimes(packet, startTime);
  if (fields.length >= 9) {
    const layer = fields[1] || "0";
    const style = fields[2] || "Default";
    const name = fields[3] || "";
    const marginL = fields[4] || "0";
    const marginR = fields[5] || "0";
    const marginV = fields[6] || "0";
    const effect = fields[7] || "";
    const text = fields.slice(8).join(",");
    return `Dialogue: ${layer},${assTime(times.start)},${assTime(
      times.end,
    )},${style},${name},${marginL},${marginR},${marginV},${effect},${text}`;
  }
  return `Dialogue: 0,${assTime(times.start)},${assTime(
    times.end,
  )},Default,,0,0,0,,${payload}`;
}

function isFontAttachment(attachment: WasmAttachment): boolean {
  const mime = attachment.mimeType.toLowerCase();
  if (mime.startsWith("font/") || mime.includes("font")) return true;
  const extension = attachment.name.split(".").pop()?.toLowerCase() ?? "";
  return FONT_EXTENSIONS.has(extension);
}

function selectFontAttachments(
  source: WasmAttachment[],
  options: EmbeddedTextExportOptions,
): {
  attachments: MediaAttachment[];
  warnings: EmbeddedTextExportWarning[];
} {
  const maxCount = options.maxFontCount ?? DEFAULT_MAX_FONT_COUNT;
  const maxFontBytes = options.maxFontBytes ?? DEFAULT_MAX_FONT_BYTES;
  const maxTotalBytes =
    options.maxTotalFontBytes ?? DEFAULT_MAX_TOTAL_FONT_BYTES;
  const attachments: MediaAttachment[] = [];
  const warnings: EmbeddedTextExportWarning[] = [];
  let totalBytes = 0;

  for (const attachment of source) {
    if (!isFontAttachment(attachment)) continue;
    if (
      attachments.length >= maxCount ||
      attachment.data.byteLength > maxFontBytes ||
      totalBytes + attachment.data.byteLength > maxTotalBytes
    ) {
      warnings.push({
        code: "ATTACHMENT_LIMIT",
        message: "An embedded font was skipped because an export limit was reached.",
      });
      continue;
    }
    const name =
      attachment.name.trim() || `font-${attachment.streamIndex}`;
    attachments.push({
      id: `${attachment.streamIndex}:${name}:${attachment.data.byteLength}`,
      name,
      mimeType: attachment.mimeType || "application/octet-stream",
      kind: "font",
      data: attachment.data,
    });
    totalBytes += attachment.data.byteLength;
  }

  return { attachments, warnings };
}

export function assembleEmbeddedTextTrack(
  track: SubtitleTrack,
  packets: Packet[],
  extradata: Uint8Array | null,
  rawAttachments: WasmAttachment[],
  startTime: number,
  options: EmbeddedTextExportOptions = {},
): EmbeddedTextTrackExport {
  const format = subtitleFormat(track);
  let content: string;
  if (format === "ass" || format === "ssa") {
    const lines = packets
      .sort((left, right) => left.timestamp - right.timestamp)
      .map((packet) => assDialogue(packet, startTime))
      .filter((line): line is string => line !== null);
    content = `${ensureAssHeader(decodeUtf8(extradata), format)}\n${lines.join(
      "\n",
    )}\n`;
  } else if (format === "webvtt") {
    const cues = packets.map((packet) => {
      const times = packetTimes(packet, startTime);
      return `${srtTime(times.start, ".")} --> ${srtTime(
        times.end,
        ".",
      )}\n${decodeUtf8(packet.data)}`;
    });
    content = `WEBVTT\n\n${cues.join("\n\n")}\n`;
  } else {
    const cues = packets.map((packet, index) => {
      const times = packetTimes(packet, startTime);
      return `${index + 1}\n${srtTime(times.start, ",")} --> ${srtTime(
        times.end,
        ",",
      )}\n${decodeUtf8(packet.data)}`;
    });
    content = `${cues.join("\n\n")}\n`;
  }

  const maxTextBytes = options.maxTextBytes ?? DEFAULT_MAX_TEXT_BYTES;
  if (new TextEncoder().encode(content).byteLength > maxTextBytes) {
    throw new MoviError({
      code: "SUBTITLE_EXPORT_LIMIT",
      category: "subtitle",
      message: "The embedded subtitle track exceeds the configured export limit.",
      recoverable: true,
    });
  }

  const fonts = selectFontAttachments(rawAttachments, options);
  return {
    trackId: track.id,
    format,
    content,
    attachments: fonts.attachments,
    warnings: fonts.warnings,
  };
}

export async function exportEmbeddedTextTrackFromSource({
  source,
  trackId,
  wasmBinary,
  options = {},
}: EmbeddedTextExportSource): Promise<EmbeddedTextTrackExport> {
  throwIfAborted(options.signal);
  const fork = await source.fork?.();
  if (!fork) {
    throw new MoviError({
      code: "SUBTITLE_EXPORT_UNSUPPORTED",
      category: "subtitle",
      message: "The source cannot create an independent subtitle reader.",
      recoverable: true,
    });
  }

  const demuxer = new Demuxer(fork, wasmBinary, true);
  try {
    const mediaInfo = await demuxer.open();
    throwIfAborted(options.signal);
    const track =
      demuxer
        .getSubtitleTracks()
        .find((candidate) => candidate.id === trackId) ?? null;
    if (!track || track.subtitleType !== "text") {
      throw new MoviError({
        code: "SUBTITLE_EXPORT_UNSUPPORTED",
        category: "subtitle",
        message: "The requested track is not an embedded text subtitle.",
        recoverable: true,
      });
    }

    const maxTextBytes = options.maxTextBytes ?? DEFAULT_MAX_TEXT_BYTES;
    const packets: Packet[] = [];
    let packetBytes = 0;
    while (true) {
      throwIfAborted(options.signal);
      const packet = await demuxer.readPacket();
      if (!packet) break;
      if (packet.streamIndex !== trackId) continue;
      packetBytes += packet.data.byteLength;
      if (packetBytes > maxTextBytes) {
        throw new MoviError({
          code: "SUBTITLE_EXPORT_LIMIT",
          category: "subtitle",
          message: "The embedded subtitle track exceeds the configured export limit.",
          recoverable: true,
        });
      }
      packets.push(packet);
    }

    const attachments = demuxer.getAttachments(
      options.maxTotalFontBytes ?? DEFAULT_MAX_TOTAL_FONT_BYTES,
    );
    return assembleEmbeddedTextTrack(
      track,
      packets,
      demuxer.getExtradata(trackId),
      attachments,
      mediaInfo.startTime,
      options,
    );
  } finally {
    demuxer.close();
    fork.close();
  }
}
