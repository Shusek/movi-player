import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  AudioTrack,
  SubtitleTrack,
  TrackSelectionOutcome,
} from "../types";
import { MoviPlayer } from "./MoviPlayer";

function audioTrack(id: number, language: string): AudioTrack {
  return {
    id,
    type: "audio",
    codec: "opus",
    channels: 2,
    sampleRate: 48_000,
    language,
    label: language.toUpperCase(),
    isDefault: id === 1,
  };
}

function subtitleTrack(
  id: number,
  subtitleType: "text" | "image",
): SubtitleTrack {
  return {
    id,
    type: "subtitle",
    codec: subtitleType === "text" ? "ass" : "hdmv_pgs_subtitle",
    language: "pl",
    label: "Polski",
    subtitleType,
    isDefault: false,
    isForced: false,
  };
}

function deferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
} {
  let resolve: (value: T) => void = () => {};
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe("MoviPlayer programmatic contracts", () => {
  beforeEach(() => {
    vi.stubGlobal("document", {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal("window", {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  it("commits audio state and emits trackChange only after success", async () => {
    const player = new MoviPlayer({});
    player.trackManager.setTracks([
      audioTrack(1, "en"),
      audioTrack(2, "pl"),
    ]);
    const configure = vi.fn(async (track: AudioTrack) => track.id !== 2);
    (player as unknown as {
      configureAudioTrack: typeof configure;
    }).configureAudioTrack = configure;
    const changes: TrackSelectionOutcome[] = [];
    player.on("trackChange", (outcome) => changes.push(outcome));

    const outcome = await player.selectTrack({
      kind: "audio",
      trackId: 2,
    });

    expect(outcome.status).toBe("failed");
    expect(outcome.error?.code).toBe("TRACK_SWITCH_FAILED");
    expect(player.getActiveAudioTrack()?.id).toBe(1);
    expect(changes).toEqual([]);
    expect(configure.mock.calls.map(([track]) => track.id)).toEqual([2, 1]);
  });

  it("serializes rapid audio switches and makes the latest request win", async () => {
    const player = new MoviPlayer({});
    player.trackManager.setTracks([
      audioTrack(1, "en"),
      audioTrack(2, "pl"),
      audioTrack(3, "de"),
    ]);
    const firstConfiguration = deferred<boolean>();
    const configure = vi.fn((track: AudioTrack): Promise<boolean> =>
      track.id === 2 ? firstConfiguration.promise : Promise.resolve(true),
    );
    (player as unknown as {
      configureAudioTrack: typeof configure;
    }).configureAudioTrack = configure;
    const changes: TrackSelectionOutcome[] = [];
    player.on("trackChange", (outcome) => changes.push(outcome));

    const first = player.selectTrack({ kind: "audio", trackId: 2 });
    await vi.waitFor(() =>
      expect(configure).toHaveBeenCalledWith(
        expect.objectContaining({ id: 2 }),
      ),
    );
    const latest = player.selectTrack({ kind: "audio", trackId: 3 });
    firstConfiguration.resolve(true);

    const [firstOutcome, latestOutcome] = await Promise.all([
      first,
      latest,
    ]);

    expect(firstOutcome.status).toBe("superseded");
    expect(latestOutcome.status).toBe("selected");
    expect(player.getActiveAudioTrack()?.id).toBe(3);
    expect(changes.map(({ activeTrack }) => activeTrack?.id)).toEqual([3]);
    expect(configure.mock.calls.map(([track]) => track.id)).toEqual([
      2,
      1,
      3,
    ]);
  });

  it("destroys idempotently and invalidates the public surface", () => {
    const player = new MoviPlayer({});
    const surfaces: unknown[] = [];
    player.on("surfaceChange", (surface) => surfaces.push(surface));

    player.destroy();
    player.destroy();

    expect(player.getSurface()).toBeNull();
    expect(surfaces).toEqual([null]);
    expect(player.getRenderingDiagnostics()).toMatchObject({
      backend: "unknown",
      decoder: "none",
      renderer: "none",
      outputVerification: "unknown",
    });
  });

  it("leaves progressive embedded text subtitle rendering to the host", async () => {
    const player = new MoviPlayer({
      embeddedTextSubtitleRenderer: "host",
    });
    player.trackManager.setTracks([subtitleTrack(7, "text")]);
    const decoder = (player as unknown as {
      subtitleDecoder: {
        configure: (...args: unknown[]) => Promise<boolean>;
        close: () => void;
      };
    }).subtitleDecoder;
    const configure = vi.spyOn(decoder, "configure");
    const close = vi.spyOn(decoder, "close");

    const outcome = await player.selectTrack({
      kind: "subtitle",
      trackId: 7,
    });

    expect(outcome.status).toBe("selected");
    expect(player.getActiveSubtitleTrack()?.id).toBe(7);
    expect(configure).not.toHaveBeenCalled();
    expect(close).toHaveBeenCalledOnce();
  });
});
