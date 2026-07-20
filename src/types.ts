/**
 * Movi Types - Core type definitions for the streaming video library
 */

import type { MoviError } from "./errors/MoviError";
import type { LoggerConfig } from "./utils/Logger";

// ============================================================================
// Track Types
// ============================================================================

export type TrackType = "video" | "audio" | "subtitle";

export interface Track {
  id: number;
  type: "video" | "audio" | "subtitle";
  codec: string;
  codecString?: string;
  extradata?: Uint8Array;
  profile?: number;
  level?: number;
  language?: string;
  label?: string;
  isDefault?: boolean;
  isForced?: boolean;
  // Video-specific
  width?: number;
  height?: number;
  frameRate?: number;
  // Audio-specific
  channels?: number;
  sampleRate?: number;
  // Subtitle-specific
  subtitleType?: "text" | "image";
}

export interface VideoTrack extends Track {
  type: "video";
  width: number;
  height: number;
  frameRate: number;
  pixelFormat?: string;
  colorSpace?: string;
  colorPrimaries?: string;
  colorTransfer?: string;
  bitRate?: number;
  rotation?: number;
  colorRange?: string;
  isHDR?: boolean;
  /**
   * 360° spherical projection from container metadata: 0 / undefined = not a
   * 360 video, else AVSphericalProjection+1 (1=equirectangular, 2=cubemap,
   * 3=equirectangular-tile, 4=half-equirectangular). Only equirectangular
   * (1 and 3) is renderable by the current 360 viewer.
   */
  projection?: number;
  /**
   * True when this is an embedded cover-art pseudo-stream (ID3v2 APIC,
   * FLAC PICTURE, MP4 covr, Matroska attachment). These look like single-
   * frame PNG/JPEG video streams to the demuxer; consumers picking an
   * active video track should skip them and read the picture via the
   * player's cover-art accessor instead.
   */
  isAttachedPic?: boolean;
}

export interface AudioTrack extends Track {
  type: "audio";
  channels: number;
  sampleRate: number;
  bitRate?: number;
}

export interface SubtitleTrack extends Track {
  type: "subtitle";
  subtitleType: "text" | "image";
}

export type TrackSelectionKind = "video" | "audio" | "subtitle";

export type TrackSelectionRequest =
  | { kind: "video"; trackId: number | null }
  | { kind: "audio"; trackId: number | null }
  | { kind: "subtitle"; trackId: number | null };

export type TrackSelectionStatus =
  | "selected"
  | "unchanged"
  | "auto"
  | "disabled"
  | "not-found"
  | "not-supported"
  | "failed"
  | "superseded";

export interface TrackSelectionOutcome {
  kind: TrackSelectionKind;
  status: TrackSelectionStatus;
  requestedTrackId: number | null;
  activeTrack: Track | null;
  error?: MoviError;
}

// ============================================================================
// Subtitle Types
// ============================================================================

export interface SubtitleCue {
  start: number;
  end: number;
  text?: string;
  image?: ImageBitmap;
  position?: { x: number; y: number };
}

export type EmbeddedTextSubtitleFormat =
  | "ass"
  | "ssa"
  | "srt"
  | "webvtt"
  | "text";

export interface MediaAttachment {
  id: string;
  name: string;
  mimeType: string;
  kind: "font" | "other";
  data: Uint8Array;
}

export interface EmbeddedTextExportWarning {
  code: "ATTACHMENT_SKIPPED" | "ATTACHMENT_LIMIT";
  message: string;
}

export interface EmbeddedTextExportOptions {
  signal?: AbortSignal;
  maxTextBytes?: number;
  maxFontCount?: number;
  maxFontBytes?: number;
  maxTotalFontBytes?: number;
}

export interface EmbeddedTextTrackExport {
  trackId: number;
  format: EmbeddedTextSubtitleFormat;
  content: string;
  attachments: MediaAttachment[];
  warnings: EmbeddedTextExportWarning[];
}

// ============================================================================
// Player Configuration
// ============================================================================

export interface UrlSourceConfig {
  type: "url";
  url: string;
  headers?: Record<string, string>;
}

export interface FileSourceConfig {
  type: "file";
  file: File | Blob;
  /** Optional display/cache name for anonymous Blob values. */
  name?: string;
}

export interface EncryptedSourceDescriptor {
  type: "encrypted";
  headers?: Record<string, string>;
  encrypted: {
    videoUrl: string;
    tokenUrl: string;
    videoId: string;
    fingerprint: string;
    sessionToken: string;
    tokenRefreshInterval?: number;
    onAuthFailed?: (reason: string) => void;
  };
}

export type SourceConfig =
  | UrlSourceConfig
  | FileSourceConfig
  | EncryptedSourceDescriptor;

/** Audio source with language metadata for multi-language support */
export interface AudioSourceEntry {
  url: string;
  type?: string;
  lang: string;       // BCP 47 language code (e.g., "en", "hi", "ja")
  label: string;      // Display name (e.g., "English", "Hindi")
}

/** External subtitle source (VTT/SRT) with language metadata */
export interface SubtitleSourceEntry {
  url: string;
  lang: string;       // BCP 47 language code
  label: string;      // Display name
  format?: "vtt" | "srt"; // Auto-detected from URL extension if omitted
}

export interface CacheConfig {
  type: "lru";
  maxSizeMB: number;
}

export type RendererType = "canvas";
export type DecoderType = "auto" | "software";

export interface PlayerConfig {
  /**
   * Standard source descriptor (url / file / encrypted). Optional when a
   * pre-built `sourceAdapter` is supplied instead.
   */
  source?: SourceConfig;
  /**
   * Pre-built SourceAdapter — overrides `source` when present.
   * Use this to feed media from a custom protocol (WebSocket, WebRTC data
   * channel, IndexedDB, encrypted blob, etc.) without writing a SourceConfig
   * branch. The adapter's `getSize()` and `read()` are called directly.
   */
  sourceAdapter?: import("./source/SourceAdapter").SourceAdapter;
  /** Separate audio source — single or multi-language */
  audioSource?: SourceConfig;
  /** Multiple audio tracks with language metadata */
  audioTracks?: AudioSourceEntry[];
  /** External subtitle tracks (VTT/SRT) with language metadata */
  subtitleTracks?: SubtitleSourceEntry[];
  renderer?: RendererType;
  decoder?: DecoderType;
  cache?: CacheConfig;
  canvas?: HTMLCanvasElement | OffscreenCanvas;
  wasmBinary?: Uint8Array; // Embedded WASM binary data
  enablePreviews?: boolean; // Enable thumbnail preview pipeline (default: false)
  frameRate?: number; // Override frame rate (fps) - 0 = auto
  headers?: Record<string, string>; // Custom HTTP headers for media network requests — adaptive manifest + segments (HLS/DASH) and progressive downloads alike (e.g. auth tokens, signed cookies)
  audioOnly?: boolean; // Audio-only mode: skip video decode (CPU) and, for adaptive streams, fetch only audio renditions (bandwidth). UI shows album art / strip.
  drm?: boolean; // Enable DRM mode for HLS (native video element, no canvas)
  licenseUrl?: string; // Widevine/FairPlay license server URL
  licenseHeaders?: Record<string, string>; // Custom headers for license requests (e.g., auth tokens)
  /** Preferred typed DRM configuration. Legacy DRM fields remain supported. */
  drmConfig?: {
    licenseUrl: string;
    licenseHeaders?: Record<string, string>;
  };
  /** Per-player structured logger. Sensitive fields are always redacted. */
  logger?: LoggerConfig;
  /** Optional base URL for lazily loaded player assets. */
  assetBaseUrl?: string;
  /**
   * Selects who renders progressive embedded text subtitles.
   *
   * `internal` keeps the built-in renderer (default). `host` keeps track
   * selection and export available through the public API, but does not decode
   * or draw text subtitle packets. This lets an embedding application render
   * exported ASS/SSA/SRT/WebVTT itself without duplicate cues. Image subtitles
   * and adaptive-stream subtitles always remain internally rendered.
   */
  embeddedTextSubtitleRenderer?: "internal" | "host";
  lcevc?: boolean; // Enable MPEG-5 Part 2 LCEVC decoding (needs the lcevc_dec.js library)
  lcevcUrl?: string; // Optional URL to lazy-load the lcevc_dec.js decoder library (else expect a global LCEVCdec)
}

export type PlayerSurface =
  | {
      kind: "canvas";
      element: HTMLCanvasElement | OffscreenCanvas;
      reason: "progressive" | "adaptive";
    }
  | {
      kind: "video";
      element: HTMLVideoElement;
      reason: "adaptive" | "drm";
    };

export type RenderingBackend =
  | "progressive-wasm"
  | "shaka"
  | "hls.js"
  | "dash.js"
  | "unknown";

export interface RenderingDiagnostics {
  backend: RenderingBackend;
  container?: string;
  decoder: "webcodecs" | "wasm" | "native" | "none" | "unknown";
  renderer: "canvas" | "native-video" | "none" | "unknown";
  sourceDynamicRange: "sdr" | "hdr10" | "hlg" | "dolby-vision" | "unknown";
  outputDynamicRange: "sdr" | "hdr" | "unknown";
  outputVerification: "confirmed" | "inferred" | "unknown";
  requestedColorSpace?: string;
  appliedColorSpace?: string;
  toneMapping: "none" | "native" | "shader" | "unknown";
}

// ============================================================================
// Media Info
// ============================================================================

export interface ChapterLabel {
  text: string;
  language?: string;
  country?: string;
}

export interface Chapter {
  title: string;
  start: number; // seconds
  end: number;   // seconds
  /** Stable within this media source. Always populated by Movi at runtime. */
  id?: string;
  labels?: ChapterLabel[];
  language?: string;
  isHidden?: boolean;
}

export interface MediaInfo {
  formatName: string;
  duration: number;
  bitRate: number;
  startTime: number;
  tracks: Track[];
  chapters: Chapter[];
  metadata?: {
    [key: string]: string;
  };
}

// ============================================================================
// Decoder Config Types (WebCodecs compatible)
// ============================================================================

export interface VideoDecoderConfig {
  codec: string;
  codedWidth: number;
  codedHeight: number;
  description?: Uint8Array;
  colorSpace?: {
    primaries?: VideoColorPrimaries | null;
    transfer?: VideoTransferCharacteristics | null;
    matrix?: VideoMatrixCoefficients | null;
    fullRange?: boolean | null;
  };
  hardwareAcceleration?: "no-preference" | "prefer-hardware" | "prefer-software";
}

export interface AudioDecoderConfig {
  codec: string;
  sampleRate: number;
  numberOfChannels: number;
  description?: Uint8Array;
}

// ============================================================================
// Packet Types
// ============================================================================

export interface Packet {
  streamIndex: number;
  keyframe: boolean;
  timestamp: number; // PTS
  dts: number; // DTS
  duration: number;
  data: Uint8Array;
  // True only for a real IDR/BLA random-access keyframe. False for open-GOP
  // CRA sync frames (flagged keyframe but must be sent as delta mid-stream) and
  // for non-keyframes. See VideoDecoder.decode.
  isIdr: boolean;
  // True for an HEVC RASL leading picture (NAL 8/9) that trails a CRA/BLA. After
  // a random-access resume these reference an absent (pre-RAP) GOP and must be
  // skipped — Safari's decoder hard-errors on them. See VideoDecoder.decode.
  isRasl: boolean;
  // True for a disposable (non-reference) frame — safe to drop under load since
  // nothing references it. VideoDecoder drops these before the decoder when the
  // renderer's adaptive detector reports the device can't keep up. Always false
  // for keyframes. See VideoDecoder.decode.
  disposable: boolean;
}

// ============================================================================
// Frame Types
// ============================================================================

export interface DecodedVideoFrame {
  timestamp: number;
  duration: number;
  width: number;
  height: number;
  format: "yuv420p" | "rgb24" | "rgba";
  data: Uint8Array;
  planes?: {
    y?: Uint8Array;
    u?: Uint8Array;
    v?: Uint8Array;
  };
}

export interface DecodedAudioFrame {
  timestamp: number;
  duration: number;
  sampleRate: number;
  channels: number;
  numFrames: number;
  format: "f32-planar";
  channelData: Float32Array[];
}

// ============================================================================
// Player State
// ============================================================================

export type PlayerState =
  | "idle"
  | "loading"
  | "ready"
  | "playing"
  | "paused"
  | "seeking"
  | "buffering"
  | "ended"
  | "error";

// ============================================================================
// Event Types
// ============================================================================

export interface PlayerEventMap {
  frame: DecodedVideoFrame;
  audio: DecodedAudioFrame;
  subtitle: SubtitleCue;
  stateChange: PlayerState;
  timeUpdate: number;
  durationChange: number;
  tracksChange: Track[];
  error: MoviError;
  trackChange: TrackSelectionOutcome;
  surfaceChange: PlayerSurface | null;
  chaptersChange: Chapter[];
  diagnosticsChange: RenderingDiagnostics;
  filerevoked: { offset: number; length: number; reason: string };
  loadStart: void;
  loadEnd: void;
  seeking: number;
  seeked: number;
  bufferUpdate: { start: number; end: number }[];
  ended: void;
  preloadcomplete: void;
  /**
   * Embedded cover art extracted from the source (ID3v2 APIC, FLAC PICTURE,
   * MP4 covr, Matroska attachment). Fires once after track enumeration when
   * an attached_pic pseudo-stream is present. Recipients own the bitmap and
   * should close() it on disposal. Fires with `null` when an art track was
   * present but extraction failed, so listeners waiting on it can stop.
   */
  coverart: ImageBitmap | null;
  /**
   * Fired once when playback falls back to linear (forward-only, non-seekable)
   * mode because the server has no HTTP Range support and the file is too large
   * to cache whole. The UI hides the timeline and disables seeking/thumbnails.
   */
  linearmode: void;
}
