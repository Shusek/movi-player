import { describe, expect, it, vi } from "vitest";
import { createLogger, LogLevel } from "./Logger";

describe("createLogger", () => {
  it("uses a per-instance sink and redacts unsafe details", () => {
    const sink = vi.fn();
    const logger = createLogger({ level: LogLevel.INFO, sink });

    logger.info(
      "test",
      "loading https://example.com/video?token=secret",
      { Authorization: "secret" },
    );

    expect(sink).toHaveBeenCalledOnce();
    const entry = sink.mock.calls[0][0];
    expect(entry.message).toBe("loading https://example.com/video");
    expect(entry.details).toEqual(["[redacted-object]"]);
  });

  it("does not invoke a sink below the configured level", () => {
    const sink = vi.fn();
    const logger = createLogger({ level: LogLevel.WARN, sink });

    logger.info("test", "ignored");

    expect(sink).not.toHaveBeenCalled();
  });
});
