import { describe, expect, it } from "vitest";
import {
  MoviError,
  redactSensitiveText,
} from "./MoviError";

describe("MoviError", () => {
  it("redacts URLs and credential-shaped pairs", () => {
    const redacted = redactSensitiveText(
      "licenseUrl=https://license.invalid/path?token=secret Authorization=secret",
    );

    expect(redacted).not.toContain("secret");
    expect(redacted).not.toContain("?token=");
  });

  it("does not enumerate its cause", () => {
    const error = new MoviError({
      code: "DRM_LICENSE",
      category: "drm",
      message: "License request failed.",
      cause: new Error("private detail"),
    });

    expect(Object.keys(error)).not.toContain("cause");
    expect(error.toJSON()).toEqual({
      name: "MoviError",
      code: "DRM_LICENSE",
      category: "drm",
      message: "License request failed.",
      recoverable: false,
    });
  });
});
