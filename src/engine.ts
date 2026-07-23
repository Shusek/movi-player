/**
 * Small programmatic entry point for hosts that already own their controls and
 * layout. Adaptive engines and the FFmpeg glue remain lazy imports.
 */
export { MoviPlayer } from "./core/MoviPlayer";
export {
  MoviError,
  redactSensitiveText,
  redactUrl,
} from "./errors/MoviError";
export type {
  MoviErrorCategory,
  MoviErrorCode,
  MoviErrorInit,
} from "./errors/MoviError";
export { LogLevel } from "./utils/Logger";
export { MOVI_API_VERSION, MOVI_VERSION } from "./version";
export type {
  AudioTrack,
  Chapter,
  MediaInfo,
  PlayerConfig,
  PlayerEventMap,
  PlayerState,
  PlayerSurface,
  RenderingBackend,
  RenderingDiagnostics,
  SourceConfig,
  SubtitleRenderer,
  SubtitleTrack,
  Track,
  TrackSelectionKind,
  TrackSelectionOutcome,
  TrackSelectionRequest,
  TrackSelectionStatus,
  VideoTrack,
} from "./types";
export type { SourceAdapter } from "./source/SourceAdapter";
