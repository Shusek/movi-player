package io.github.shusek.kmedia.engine.wasm

import kotlin.time.Duration

public sealed interface PlaybackEvent {
    public data class StateChanged(public val state: WasmMediaPlayerState) : PlaybackEvent

    public data class TimeChanged(public val position: Duration) : PlaybackEvent

    public data class DurationChanged(public val duration: Duration) : PlaybackEvent

    public data class TracksChanged(public val mediaInfo: MediaInfo) : PlaybackEvent

    public data class BufferChanged(public val ranges: List<BufferedRange>) : PlaybackEvent

    public data class DiagnosticsChanged(public val diagnostics: RenderingDiagnostics) : PlaybackEvent

    public data class SourceModeChanged(public val mode: SourceMode) : PlaybackEvent

    public data class LiveWindowChanged(public val window: LivePlaybackWindow?) : PlaybackEvent

    public data class FileAccessRevoked(
        public val offset: Long,
        public val length: Int,
        public val reason: String,
    ) : PlaybackEvent

    public data class CoverArtChanged(public val image: org.w3c.dom.ImageBitmap?) : PlaybackEvent

    public data class TrackChanged(
        public val kind: TrackKind,
        public val activeTrack: MediaTrack?,
    ) : PlaybackEvent

    public data object Seeking : PlaybackEvent

    public data object Seeked : PlaybackEvent

    public data object Ended : PlaybackEvent

    public data class Failed(public val error: WasmMediaError) : PlaybackEvent
}
