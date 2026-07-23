/**
 * Stable, redaction-safe errors exposed by the programmatic player API.
 *
 * The original cause stays non-enumerable so generic logging and JSON
 * serialization cannot accidentally copy request credentials.
 */
export type MoviErrorCategory =
  | "source"
  | "network"
  | "demux"
  | "codec"
  | "drm"
  | "track"
  | "subtitle"
  | "lifecycle"
  | "internal";

export type MoviErrorCode =
  | "SOURCE_INVALID"
  | "SOURCE_UNAVAILABLE"
  | "NETWORK"
  | "HTTP"
  | "CORS"
  | "DEMUX"
  | "UNSUPPORTED_CONTAINER"
  | "UNSUPPORTED_CODEC"
  | "DECODE"
  | "DRM_CONFIG"
  | "DRM_LICENSE"
  | "DRM_EME"
  | "TRACK_NOT_FOUND"
  | "TRACK_NOT_SUPPORTED"
  | "TRACK_SWITCH_FAILED"
  | "DESTROYED"
  | "ABORTED"
  | "INTERNAL";

export interface MoviErrorInit {
  code: MoviErrorCode;
  category: MoviErrorCategory;
  message: string;
  recoverable?: boolean;
  cause?: unknown;
}

export class MoviError extends Error {
  readonly code: MoviErrorCode;
  readonly category: MoviErrorCategory;
  readonly recoverable: boolean;

  constructor(init: MoviErrorInit) {
    super(redactSensitiveText(init.message), { cause: init.cause });
    this.name = "MoviError";
    this.code = init.code;
    this.category = init.category;
    this.recoverable = init.recoverable ?? false;

    if (init.cause !== undefined) {
      Object.defineProperty(this, "cause", {
        value: init.cause,
        enumerable: false,
        configurable: true,
      });
    }
  }

  toJSON(): Record<string, string | boolean> {
    return {
      name: this.name,
      code: this.code,
      category: this.category,
      message: this.message,
      recoverable: this.recoverable,
    };
  }
}

const URL_PATTERN = /\bhttps?:\/\/[^\s"'<>]+/giu;
const SENSITIVE_PAIR_PATTERN =
  /\b(authorization|cookie|set-cookie|token|session|signature|license(?:url|header)?|api[-_]?key)\b\s*[:=]\s*[^\s,;]+/giu;

export function redactSensitiveText(value: string): string {
  return value
    .replace(SENSITIVE_PAIR_PATTERN, "$1=[redacted]")
    .replace(URL_PATTERN, (candidate) => redactUrl(candidate));
}

export function redactUrl(value: string): string {
  try {
    const parsed = new URL(value);
    parsed.username = "";
    parsed.password = "";
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return "[redacted-url]";
  }
}
