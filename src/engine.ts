/**
 * Headless player entrypoint.
 *
 * This is the smallest supported integration surface for hosts that already
 * own their UI. It deliberately excludes the web component and standalone
 * demuxer/decoder exports while retaining every runtime dependency needed by
 * `MoviPlayer`.
 */
export { MoviPlayer } from "./core/MoviPlayer";
export {
  MoviError,
  normalizeMoviError,
  redactSensitiveText,
  redactUrl,
} from "./errors/MoviError";
export type {
  MoviErrorCategory,
  MoviErrorCode,
  MoviErrorInit,
} from "./errors/MoviError";
export { LogLevel } from "./utils/Logger";
export type {
  LogEntry,
  LoggerConfig,
  MoviLogger,
} from "./utils/Logger";
export { MOVI_API_VERSION, MOVI_VERSION } from "./version";
export type {
  AudioTrack,
  Chapter,
  ChapterLabel,
  EmbeddedTextExportOptions,
  EmbeddedTextExportWarning,
  EmbeddedTextSubtitleFormat,
  EmbeddedTextTrackExport,
  MediaAttachment,
  MediaInfo,
  PlayerConfig,
  PlayerEventMap,
  PlayerState,
  PlayerSurface,
  RenderingBackend,
  RenderingDiagnostics,
  SourceConfig,
  SubtitleTrack,
  Track,
  TrackSelectionKind,
  TrackSelectionOutcome,
  TrackSelectionRequest,
  TrackSelectionStatus,
  VideoTrack,
} from "./types";
export type { SourceAdapter } from "./source/SourceAdapter";
