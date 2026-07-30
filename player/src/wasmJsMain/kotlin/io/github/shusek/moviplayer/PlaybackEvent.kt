package io.github.shusek.moviplayer

import kotlin.time.Duration

public sealed interface PlaybackEvent {
    public data class StateChanged(public val state: MoviPlayerState) : PlaybackEvent

    public data class TimeChanged(public val position: Duration) : PlaybackEvent

    public data class DurationChanged(public val duration: Duration) : PlaybackEvent

    public data class TracksChanged(public val mediaInfo: MediaInfo) : PlaybackEvent

    public data class BufferChanged(public val ranges: List<BufferedRange>) : PlaybackEvent

    public data class TrackChanged(
        public val kind: TrackKind,
        public val activeTrack: MediaTrack?,
    ) : PlaybackEvent

    public data object Seeking : PlaybackEvent

    public data object Seeked : PlaybackEvent

    public data object Ended : PlaybackEvent

    public data class Failed(public val error: MoviError) : PlaybackEvent
}
