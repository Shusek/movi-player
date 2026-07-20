/**
 * Stable, redaction-safe errors exposed by the public player API.
 *
 * Internal causes are intentionally non-enumerable. Consumers may use them
 * while debugging in memory, but JSON/log output only contains safe fields.
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
  | "SUBTITLE_EXPORT_UNSUPPORTED"
  | "SUBTITLE_EXPORT_LIMIT"
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

    // Error.cause is useful in a debugger but must not be copied by generic
    // object serializers or structured loggers.
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

export function normalizeMoviError(
  error: unknown,
  fallback: Pick<MoviErrorInit, "code" | "category"> & Partial<MoviErrorInit>,
): MoviError {
  if (error instanceof MoviError) return error;

  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : fallback.message ?? "Movi operation failed.";
  const lower = rawMessage.toLowerCase();

  let code = fallback.code;
  let category = fallback.category;
  if (lower.includes("cors")) {
    code = "CORS";
    category = "network";
  } else if (lower.includes("license")) {
    code = "DRM_LICENSE";
    category = "drm";
  } else if (lower.includes("drm") || lower.includes("eme")) {
    code = "DRM_EME";
    category = "drm";
  } else if (lower.includes("codec") || lower.includes("decoder")) {
    code = "DECODE";
    category = "codec";
  } else if (
    lower.includes("network") ||
    lower.includes("failed to fetch") ||
    lower.includes("http")
  ) {
    code = "NETWORK";
    category = "network";
  }

  return new MoviError({
    code,
    category,
    message: rawMessage || fallback.message || "Movi operation failed.",
    recoverable: fallback.recoverable,
    cause: error,
  });
}
