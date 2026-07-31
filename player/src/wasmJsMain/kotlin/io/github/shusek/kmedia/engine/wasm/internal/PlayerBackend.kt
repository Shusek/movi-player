package io.github.shusek.kmedia.engine.wasm.internal

import io.github.shusek.kmedia.engine.wasm.BufferedRange
import io.github.shusek.kmedia.engine.wasm.EmbeddedSubtitleRenderer
import io.github.shusek.kmedia.engine.wasm.FitMode
import io.github.shusek.kmedia.engine.wasm.MediaInfo
import io.github.shusek.kmedia.engine.wasm.MediaSource
import io.github.shusek.kmedia.engine.wasm.MediaTrack
import io.github.shusek.kmedia.engine.wasm.WasmMediaError
import io.github.shusek.kmedia.engine.wasm.WasmMediaPlayerState
import io.github.shusek.kmedia.engine.wasm.PlayerSurface
import io.github.shusek.kmedia.engine.wasm.RenderingDiagnostics
import io.github.shusek.kmedia.engine.wasm.LivePlaybackWindow
import io.github.shusek.kmedia.engine.wasm.SourceMode
import io.github.shusek.kmedia.engine.wasm.SubtitleCue
import io.github.shusek.kmedia.engine.wasm.VideoSnapshot
import io.github.shusek.kmedia.engine.wasm.ProjectionConfiguration
import io.github.shusek.kmedia.engine.wasm.ToneMappingMode
import org.w3c.dom.ImageBitmap
import io.github.shusek.kmedia.engine.wasm.TrackKind
import io.github.shusek.kmedia.engine.wasm.TrackSelectionOutcome
import io.github.shusek.kmedia.engine.wasm.TrackSelectionRequest
import io.github.shusek.kmedia.engine.wasm.TrackSelectionStatus
import kotlin.time.Duration

internal interface BackendObserver {
    fun onState(state: WasmMediaPlayerState)

    fun onTime(position: Duration)

    fun onDuration(duration: Duration)

    fun onMediaInfo(info: MediaInfo)

    fun onBuffered(ranges: List<BufferedRange>)

    fun onSurface(surface: PlayerSurface)

    fun onDiagnostics(diagnostics: RenderingDiagnostics)

    fun onSourceModeChanged(mode: SourceMode) = Unit

    fun onLiveWindowChanged(window: LivePlaybackWindow?) = Unit

    fun onFileAccessRevoked(
        offset: Long,
        length: Int,
        reason: String,
    ) = Unit

    fun onCoverArt(image: ImageBitmap?) = Unit

    fun onSubtitleCues(cues: List<SubtitleCue>) = Unit

    fun onEnded()

    fun onError(error: WasmMediaError)
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

    fun setStableVolume(enabled: Boolean) = Unit

    suspend fun setAudioOnly(enabled: Boolean) = Unit

    fun setRotation(rotationDegrees: Int) = Unit

    fun setProjection(configuration: ProjectionConfiguration) = Unit

    fun setToneMapping(mode: ToneMappingMode) = Unit

    suspend fun setAudioOutput(deviceId: String?) {
        throw WasmMediaError(
            io.github.shusek.kmedia.engine.wasm.WasmMediaErrorCategory.RENDERER,
            io.github.shusek.kmedia.engine.wasm.WasmMediaErrorCode.OUTPUT_DEVICE_FAILED,
            "Audio output selection is unavailable for this backend.",
        )
    }

    suspend fun snapshot(): VideoSnapshot {
        throw WasmMediaError(
            io.github.shusek.kmedia.engine.wasm.WasmMediaErrorCategory.RENDERER,
            io.github.shusek.kmedia.engine.wasm.WasmMediaErrorCode.RENDER_FAILED,
            "Frame capture is unavailable for this backend.",
        )
    }

    suspend fun thumbnail(position: Duration): VideoSnapshot {
        throw WasmMediaError(
            io.github.shusek.kmedia.engine.wasm.WasmMediaErrorCategory.RENDERER,
            io.github.shusek.kmedia.engine.wasm.WasmMediaErrorCode.THUMBNAIL_FAILED,
            "Thumbnail generation is unavailable for this backend.",
        )
    }

    suspend fun prefetchSubtitleCues(): List<SubtitleCue> = emptyList()

    suspend fun seekToLive() {
        throw WasmMediaError(
            io.github.shusek.kmedia.engine.wasm.WasmMediaErrorCategory.STATE,
            io.github.shusek.kmedia.engine.wasm.WasmMediaErrorCode.LIVE_WINDOW_UNAVAILABLE,
            "This source does not expose a live playback window.",
        )
    }

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
