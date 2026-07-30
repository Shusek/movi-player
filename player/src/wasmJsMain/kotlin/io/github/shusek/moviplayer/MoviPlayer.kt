package io.github.shusek.moviplayer

import io.github.shusek.moviplayer.internal.BackendObserver
import io.github.shusek.moviplayer.internal.DemuxedPlaybackBackend
import io.github.shusek.moviplayer.internal.HtmlVideoBackend
import io.github.shusek.moviplayer.internal.PlayerBackend
import io.github.shusek.moviplayer.internal.PlayerBackendFactory
import io.github.shusek.moviplayer.internal.requiresDemuxedPlayback
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlin.time.Duration

/**
 * Typed Kotlin/Wasm entry point for Movi playback.
 *
 * The player owns the browser playback surface created for each loaded source.
 * Call [close] when the hosting composable or page is disposed.
 */
public class MoviPlayer public constructor(
    public val config: MoviPlayerConfig,
) {
    private val operationMutex: Mutex = Mutex()
    private val cleanupScope: CoroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private var backendFactory: PlayerBackendFactory =
        PlayerBackendFactory { source, observer ->
            if (source.requiresDemuxedPlayback()) {
                DemuxedPlaybackBackend(config, observer)
            } else {
                HtmlVideoBackend(config, observer)
            }
        }
    private var backend: PlayerBackend? = null
    private var generation: Long = 0
    private var closed: Boolean = false
    private var subtitleRenderer: EmbeddedSubtitleRenderer? = null
    private var subtitleDelay: Duration = Duration.ZERO

    private val mutableState: MutableStateFlow<MoviPlayerState> = MutableStateFlow(MoviPlayerState.IDLE)
    private val mutablePosition: MutableStateFlow<Duration> = MutableStateFlow(Duration.ZERO)
    private val mutableDuration: MutableStateFlow<Duration> = MutableStateFlow(Duration.ZERO)
    private val mutableMediaInfo: MutableStateFlow<MediaInfo?> = MutableStateFlow(null)
    private val mutableBufferedRanges: MutableStateFlow<List<BufferedRange>> = MutableStateFlow(emptyList())
    private val mutableSurface: MutableStateFlow<PlayerSurface?> = MutableStateFlow(null)
    private val mutableDiagnostics: MutableStateFlow<RenderingDiagnostics> =
        MutableStateFlow(RenderingDiagnostics())
    private val mutableLastError: MutableStateFlow<MoviError?> = MutableStateFlow(null)
    private val mutableActiveVideoTrack: MutableStateFlow<VideoTrack?> = MutableStateFlow(null)
    private val mutableActiveAudioTrack: MutableStateFlow<AudioTrack?> = MutableStateFlow(null)
    private val mutableActiveSubtitleTrack: MutableStateFlow<SubtitleTrack?> = MutableStateFlow(null)
    private val mutableEvents: MutableSharedFlow<PlaybackEvent> = MutableSharedFlow(extraBufferCapacity = 64)

    private var requestedVolume: Float = 1f
    private var requestedMuted: Boolean = false
    private var requestedPlaybackRate: Float = 1f
    private var requestedFitMode: FitMode = FitMode.CONTAIN

    public val state: StateFlow<MoviPlayerState> = mutableState.asStateFlow()
    public val position: StateFlow<Duration> = mutablePosition.asStateFlow()
    public val duration: StateFlow<Duration> = mutableDuration.asStateFlow()
    public val mediaInfo: StateFlow<MediaInfo?> = mutableMediaInfo.asStateFlow()
    public val bufferedRanges: StateFlow<List<BufferedRange>> = mutableBufferedRanges.asStateFlow()
    public val surface: StateFlow<PlayerSurface?> = mutableSurface.asStateFlow()
    public val diagnostics: StateFlow<RenderingDiagnostics> = mutableDiagnostics.asStateFlow()
    public val lastError: StateFlow<MoviError?> = mutableLastError.asStateFlow()
    public val activeVideoTrack: StateFlow<VideoTrack?> = mutableActiveVideoTrack.asStateFlow()
    public val activeAudioTrack: StateFlow<AudioTrack?> = mutableActiveAudioTrack.asStateFlow()
    public val activeSubtitleTrack: StateFlow<SubtitleTrack?> = mutableActiveSubtitleTrack.asStateFlow()
    public val events: SharedFlow<PlaybackEvent> = mutableEvents.asSharedFlow()

    internal constructor(
        config: MoviPlayerConfig,
        backendFactory: PlayerBackendFactory,
    ) : this(config) {
        this.backendFactory = backendFactory
    }

    public suspend fun load(source: MediaSource): Unit =
        operationMutex.withLock {
            ensureOpen()
            generation += 1
            val loadGeneration = generation
            backend?.close()
            resetForLoad()
            updateState(MoviPlayerState.LOADING)

            val createdBackend = backendFactory.create(source, createObserver(loadGeneration))
            backend = createdBackend
            createdBackend.setVolume(requestedVolume)
            createdBackend.setMuted(requestedMuted)
            createdBackend.setPlaybackRate(requestedPlaybackRate)
            createdBackend.setFitMode(requestedFitMode)
            createdBackend.setEmbeddedSubtitleRenderer(subtitleRenderer, subtitleDelay)

            try {
                createdBackend.load(source)
                if (isCurrent(loadGeneration) && mutableState.value == MoviPlayerState.LOADING) {
                    updateState(MoviPlayerState.READY)
                }
            } catch (error: Throwable) {
                if (isCurrent(loadGeneration)) {
                    val publicError = error.toMoviError()
                    recordError(publicError)
                    createdBackend.close()
                    if (backend === createdBackend) backend = null
                }
                throw error
            }
        }

    public suspend fun play(): Unit =
        operationMutex.withLock {
            ensureOpen()
            requireBackend().play()
        }

    public fun pause() {
        ensureOpen()
        requireBackend().pause()
    }

    public suspend fun seek(position: Duration): Unit =
        operationMutex.withLock {
            ensureOpen()
            require(position >= Duration.ZERO) { "Seek position must not be negative." }
            val activeBackend = requireBackend()
            mutableEvents.tryEmit(PlaybackEvent.Seeking)
            updateState(MoviPlayerState.SEEKING)
            try {
                activeBackend.seek(position)
                mutablePosition.value = position
                mutableEvents.tryEmit(PlaybackEvent.TimeChanged(position))
                mutableEvents.tryEmit(PlaybackEvent.Seeked)
            } catch (error: Throwable) {
                recordError(error.toMoviError())
                throw error
            }
        }

    public suspend fun selectTrack(request: TrackSelectionRequest): TrackSelectionOutcome =
        operationMutex.withLock {
            ensureOpen()
            val outcome = requireBackend().selectTrack(request)
            when (val track = outcome.activeTrack) {
                is VideoTrack -> mutableActiveVideoTrack.value = track
                is AudioTrack -> mutableActiveAudioTrack.value = track
                is SubtitleTrack -> mutableActiveSubtitleTrack.value = track
                null ->
                    when (outcome.kind) {
                        TrackKind.VIDEO -> mutableActiveVideoTrack.value = null
                        TrackKind.AUDIO -> mutableActiveAudioTrack.value = null
                        TrackKind.SUBTITLE -> mutableActiveSubtitleTrack.value = null
                    }
            }
            mutableEvents.tryEmit(PlaybackEvent.TrackChanged(outcome.kind, outcome.activeTrack))
            outcome
        }

    public fun setVolume(volume: Float) {
        require(volume.isFinite()) { "Volume must be finite." }
        requestedVolume = volume.coerceIn(0f, 1f)
        backend?.setVolume(requestedVolume)
    }

    public fun setMuted(muted: Boolean) {
        requestedMuted = muted
        backend?.setMuted(muted)
    }

    public fun setPlaybackRate(rate: Float) {
        require(rate.isFinite() && rate > 0f) { "Playback rate must be finite and positive." }
        requestedPlaybackRate = rate.coerceIn(MIN_PLAYBACK_RATE, MAX_PLAYBACK_RATE)
        backend?.setPlaybackRate(requestedPlaybackRate)
    }

    public fun setFitMode(fitMode: FitMode) {
        requestedFitMode = fitMode
        backend?.setFitMode(fitMode)
    }

    public fun setEmbeddedSubtitleRenderer(renderer: EmbeddedSubtitleRenderer?) {
        if (subtitleRenderer === renderer) return
        subtitleRenderer?.let(::disposeRenderer)
        subtitleRenderer = renderer
        renderer?.setDelay(subtitleDelay)
        backend?.setEmbeddedSubtitleRenderer(renderer, subtitleDelay)
    }

    public fun setSubtitleDelay(delay: Duration) {
        subtitleDelay = delay
        subtitleRenderer?.setDelay(delay)
        backend?.setEmbeddedSubtitleRenderer(subtitleRenderer, delay)
    }

    public fun close() {
        if (closed) return
        closed = true
        generation += 1
        backend?.close()
        backend = null
        subtitleRenderer?.let(::disposeRenderer)
        subtitleRenderer = null
        mutableSurface.value = null
        updateState(MoviPlayerState.CLOSED)
    }

    private fun disposeRenderer(renderer: EmbeddedSubtitleRenderer) {
        renderer.clear()
        cleanupScope.launch {
            runCatching { renderer.close() }
                .onFailure { error ->
                    config.logger.log(
                        MoviLogLevel.ERROR,
                        "subtitle",
                        redactSensitiveText(error.message ?: "Subtitle renderer cleanup failed."),
                    )
                }
        }
    }

    private fun createObserver(observerGeneration: Long): BackendObserver =
        object : BackendObserver {
            override fun onState(state: MoviPlayerState) {
                if (isCurrent(observerGeneration)) updateState(state)
            }

            override fun onTime(position: Duration) {
                if (!isCurrent(observerGeneration)) return
                mutablePosition.value = position
                mutableEvents.tryEmit(PlaybackEvent.TimeChanged(position))
                subtitleRenderer?.render(position)
            }

            override fun onDuration(duration: Duration) {
                if (!isCurrent(observerGeneration)) return
                mutableDuration.value = duration
                mutableEvents.tryEmit(PlaybackEvent.DurationChanged(duration))
            }

            override fun onMediaInfo(info: MediaInfo) {
                if (!isCurrent(observerGeneration)) return
                mutableMediaInfo.value = info
                mutableActiveVideoTrack.value = info.videoTracks.firstOrNull { it.isDefault } ?: info.videoTracks.firstOrNull()
                mutableActiveAudioTrack.value = info.audioTracks.firstOrNull { it.isDefault } ?: info.audioTracks.firstOrNull()
                mutableActiveSubtitleTrack.value = null
                mutableEvents.tryEmit(PlaybackEvent.TracksChanged(info))
            }

            override fun onBuffered(ranges: List<BufferedRange>) {
                if (!isCurrent(observerGeneration)) return
                mutableBufferedRanges.value = ranges
                mutableEvents.tryEmit(PlaybackEvent.BufferChanged(ranges))
            }

            override fun onSurface(surface: PlayerSurface) {
                if (isCurrent(observerGeneration)) mutableSurface.value = surface
            }

            override fun onDiagnostics(diagnostics: RenderingDiagnostics) {
                if (isCurrent(observerGeneration)) mutableDiagnostics.value = diagnostics
            }

            override fun onEnded() {
                if (!isCurrent(observerGeneration)) return
                updateState(MoviPlayerState.ENDED)
                mutableEvents.tryEmit(PlaybackEvent.Ended)
            }

            override fun onError(error: MoviError) {
                if (isCurrent(observerGeneration)) recordError(error)
            }
        }

    private fun resetForLoad() {
        mutablePosition.value = Duration.ZERO
        mutableDuration.value = Duration.ZERO
        mutableMediaInfo.value = null
        mutableBufferedRanges.value = emptyList()
        mutableSurface.value = null
        mutableDiagnostics.value = RenderingDiagnostics()
        mutableLastError.value = null
        mutableActiveVideoTrack.value = null
        mutableActiveAudioTrack.value = null
        mutableActiveSubtitleTrack.value = null
        subtitleRenderer?.clear()
    }

    private fun updateState(state: MoviPlayerState) {
        if (mutableState.value == state) return
        mutableState.value = state
        mutableEvents.tryEmit(PlaybackEvent.StateChanged(state))
    }

    private fun recordError(error: MoviError) {
        mutableLastError.value = error
        updateState(MoviPlayerState.ERROR)
        mutableEvents.tryEmit(PlaybackEvent.Failed(error))
    }

    private fun requireBackend(): PlayerBackend =
        backend
            ?: throw MoviError(
                MoviErrorCategory.STATE,
                MoviErrorCode.INVALID_STATE,
                "No media source has been loaded.",
            )

    private fun ensureOpen() {
        if (closed) {
            throw MoviError(
                MoviErrorCategory.STATE,
                MoviErrorCode.INVALID_STATE,
                "The player is closed.",
            )
        }
    }

    private fun isCurrent(observerGeneration: Long): Boolean = !closed && generation == observerGeneration

    private companion object {
        const val MIN_PLAYBACK_RATE: Float = 0.25f
        const val MAX_PLAYBACK_RATE: Float = 4f
    }
}

private fun Throwable.toMoviError(): MoviError =
    this as? MoviError
        ?: MoviError(
            category = MoviErrorCategory.INTERNAL,
            code = MoviErrorCode.UNKNOWN,
            message = message ?: "Movi playback failed.",
            cause = this,
        )
