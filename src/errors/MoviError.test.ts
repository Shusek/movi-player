import { describe, expect, it } from "vitest";
import {
  MoviError,
  normalizeMoviError,
  redactSensitiveText,
} from "./MoviError";

describe("MoviError", () => {
  it("redacts credentials and URL query material", () => {
    const redacted = redactSensitiveText(
      "request https://user:pass@example.com/license?token=secret#fragment Authorization=secret",
    );

    expect(redacted).toContain("https://example.com/license");
    expect(redacted).not.toContain("user");
    expect(redacted).not.toContain("pass");
    expect(redacted).not.toContain("secret");
    expect(redacted).not.toContain("fragment");
    expect(redacted).toContain("Authorization=[redacted]");
  });

  it("serializes only the safe public contract", () => {
    const cause = new Error("https://example.com/media?token=secret");
    const error = new MoviError({
      code: "NETWORK",
      category: "network",
      message: cause.message,
      recoverable: true,
      cause,
    });

    expect(JSON.stringify(error)).not.toContain("secret");
    expect(error.toJSON()).toEqual({
      name: "MoviError",
      code: "NETWORK",
      category: "network",
      message: "https://example.com/media",
      recoverable: true,
    });
    expect(Object.keys(error)).not.toContain("cause");
  });

  it("classifies common runtime errors", () => {
    const error = normalizeMoviError(
      new Error("DRM license request failed"),
      { code: "INTERNAL", category: "internal" },
    );

    expect(error.code).toBe("DRM_LICENSE");
    expect(error.category).toBe("drm");
  });
});
