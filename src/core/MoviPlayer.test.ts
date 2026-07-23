import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  AudioTrack,
  SubtitleRenderer,
  SubtitleTrack,
  TrackSelectionOutcome,
} from "../types";
import { MoviPlayer } from "./MoviPlayer";

vi.mock("../wasm/FFmpegLoader", () => ({
  loadWasmModule: vi.fn(),
  loadWasmModuleNew: vi.fn(),
  getWasmModule: vi.fn(),
  isWasmModuleLoaded: vi.fn(() => false),
  resetWasmModule: vi.fn(),
}));

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

function subtitleTrack(id: number, codec = "ass"): SubtitleTrack {
  return {
    id,
    type: "subtitle",
    codec,
    language: "pl",
    label: "Polski",
    subtitleType: "text",
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
      hidden: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal("window", {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  it("commits audio state only after decoder preparation succeeds", async () => {
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

  it("serializes rapid audio switches and lets the latest request win", async () => {
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

  it("passes only bounded font attachments to a supporting renderer", async () => {
    const player = new MoviPlayer({});
    const track = subtitleTrack(7);
    player.trackManager.setTracks([track]);
    player.trackManager.selectSubtitleTrack(track.id);
    const configure = vi.fn();
    const renderer: SubtitleRenderer = {
      supports: (candidate) => candidate.codec === "ass",
      configure,
      pushPacket: vi.fn(),
      render: vi.fn(),
      setDelay: vi.fn(),
      clear: vi.fn(),
      destroy: vi.fn(),
    };
    const header = new Uint8Array([1, 2, 3]);
    const font = new Uint8Array([4, 5, 6]);
    (player as unknown as {
      _customSubtitleRenderer: SubtitleRenderer;
      demuxer: {
        getExtradata: () => Uint8Array;
        getAttachments: () => Array<{
          streamIndex: number;
          name: string;
          mimeType: string;
          data: Uint8Array;
        }>;
      };
      _configureCustomSubtitleRenderer: () => Promise<void>;
    })._customSubtitleRenderer = renderer;
    const internals = player as unknown as {
      demuxer: {
        getExtradata: () => Uint8Array;
        getAttachments: () => Array<{
          streamIndex: number;
          name: string;
          mimeType: string;
          data: Uint8Array;
        }>;
      };
      _configureCustomSubtitleRenderer: () => Promise<void>;
    };
    internals.demuxer = {
      getExtradata: () => header,
      getAttachments: () => [
        {
          streamIndex: 10,
          name: "Signs.ttf",
          mimeType: "application/x-truetype-font",
          data: font,
        },
        {
          streamIndex: 11,
          name: "cover.png",
          mimeType: "image/png",
          data: new Uint8Array([9]),
        },
      ],
    };

    await internals._configureCustomSubtitleRenderer();

    expect(configure).toHaveBeenCalledWith(track, header, [font]);
  });

  it("leaves tracks unsupported by the plugin on the built-in path", () => {
    const player = new MoviPlayer({});
    const renderer: SubtitleRenderer = {
      supports: (track) => track.codec === "ass",
      configure: vi.fn(),
      pushPacket: vi.fn(),
      render: vi.fn(),
      setDelay: vi.fn(),
      clear: vi.fn(),
      destroy: vi.fn(),
    };
    (player as unknown as {
      _customSubtitleRenderer: SubtitleRenderer;
    })._customSubtitleRenderer = renderer;

    const selected = (
      player as unknown as {
        customSubtitleRendererFor: (
          track: SubtitleTrack,
        ) => SubtitleRenderer | null;
      }
    ).customSubtitleRendererFor(subtitleTrack(8, "subrip"));

    expect(selected).toBeNull();
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
});
