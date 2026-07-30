package io.github.shusek.moviplayer.internal

import io.github.shusek.moviplayer.BufferedRange
import io.github.shusek.moviplayer.EmbeddedSubtitleRenderer
import io.github.shusek.moviplayer.FitMode
import io.github.shusek.moviplayer.MediaInfo
import io.github.shusek.moviplayer.MediaSource
import io.github.shusek.moviplayer.MediaTrack
import io.github.shusek.moviplayer.MoviError
import io.github.shusek.moviplayer.MoviPlayerState
import io.github.shusek.moviplayer.PlayerSurface
import io.github.shusek.moviplayer.RenderingDiagnostics
import io.github.shusek.moviplayer.TrackKind
import io.github.shusek.moviplayer.TrackSelectionOutcome
import io.github.shusek.moviplayer.TrackSelectionRequest
import io.github.shusek.moviplayer.TrackSelectionStatus
import kotlin.time.Duration

internal interface BackendObserver {
    fun onState(state: MoviPlayerState)

    fun onTime(position: Duration)

    fun onDuration(duration: Duration)

    fun onMediaInfo(info: MediaInfo)

    fun onBuffered(ranges: List<BufferedRange>)

    fun onSurface(surface: PlayerSurface)

    fun onDiagnostics(diagnostics: RenderingDiagnostics)

    fun onEnded()

    fun onError(error: MoviError)
}

internal interface PlayerBackend {
    suspend fun load(source: MediaSource)

    suspend fun play()

    fun pause()

    suspend fun seek(position: Duration)

    suspend fun selectTrack(request: TrackSelectionRequest): TrackSelectionOutcome =
        TrackSelectionOutcome(
            kind = request.kind,
            status = TrackSelectionStatus.NOT_SUPPORTED,
            requestedTrackId =
                when (request) {
                    is TrackSelectionRequest.Video -> request.trackId
                    is TrackSelectionRequest.Audio -> request.trackId
                    is TrackSelectionRequest.Subtitle -> request.trackId
                },
            activeTrack = activeTrack(request.kind),
        )

    fun activeTrack(kind: TrackKind): MediaTrack? = null

    fun setVolume(volume: Float)

    fun setMuted(muted: Boolean)

    fun setPlaybackRate(rate: Float)

    fun setFitMode(fitMode: FitMode) = Unit

    fun setEmbeddedSubtitleRenderer(
        renderer: EmbeddedSubtitleRenderer?,
        delay: Duration,
    ) = Unit

    fun close()
}

internal fun interface PlayerBackendFactory {
    fun create(
        source: MediaSource,
        observer: BackendObserver,
    ): PlayerBackend
}
