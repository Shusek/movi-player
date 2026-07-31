@file:OptIn(ExperimentalWasmJsInterop::class)

package io.github.shusek.kmedia.engine.wasm

import io.github.shusek.kmedia.engine.wasm.internal.BackendObserver
import io.github.shusek.kmedia.engine.wasm.internal.DemuxedPlaybackBackend
import io.github.shusek.kmedia.engine.wasm.internal.BrowserMediaBackend
import io.github.shusek.kmedia.engine.wasm.internal.PlayerBackend
import io.github.shusek.kmedia.engine.wasm.internal.PlayerBackendFactory
import io.github.shusek.kmedia.engine.wasm.internal.requiresDemuxedPlayback
import kotlinx.coroutines.CompletableDeferred
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
import org.w3c.dom.ImageBitmap
import kotlin.js.ExperimentalWasmJsInterop
import kotlin.js.js
import kotlin.time.Duration

/**
 * Typed Kotlin/Wasm entry point for browser media playback.
 *
 * The player owns the browser playback surface created for each loaded source.
 * Call [close] when the hosting composable or page is disposed.
 */
public class WasmMediaPlayer public constructor(
    public val config: WasmMediaPlayerConfig,
) : WasmMediaAdvancedControls {
    private val operationMutex: Mutex = Mutex()
    private val cleanupScope: CoroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private var backendFactory: PlayerBackendFactory =
        PlayerBackendFactory { source, observer ->
            if (source.requiresDemuxedPlayback()) {
                DemuxedPlaybackBackend(config, observer)
            } else {
                BrowserMediaBackend(config, observer)
            }
        }
    private var backend: PlayerBackend? = null
    private var generation: Long = 0
    private var closed: Boolean = false
    private var subtitleRenderer: EmbeddedSubtitleRenderer? = null
    private var subtitleDelay: Duration = Duration.ZERO

    private val mutableState: MutableStateFlow<WasmMediaPlayerState> = MutableStateFlow(WasmMediaPlayerState.IDLE)
    private val mutablePosition: MutableStateFlow<Duration> = MutableStateFlow(Duration.ZERO)
    private val mutableDuration: MutableStateFlow<Duration> = MutableStateFlow(Duration.ZERO)
    private val mutableMediaInfo: MutableStateFlow<MediaInfo?> = MutableStateFlow(null)
    private val mutableBufferedRanges: MutableStateFlow<List<BufferedRange>> = MutableStateFlow(emptyList())
    private val mutableSurface: MutableStateFlow<PlayerSurface?> = MutableStateFlow(null)
    private val mutableDiagnostics: MutableStateFlow<RenderingDiagnostics> =
        MutableStateFlow(RenderingDiagnostics())
    private val mutableLastError: MutableStateFlow<WasmMediaError?> = MutableStateFlow(null)
    private val mutableActiveVideoTrack: MutableStateFlow<VideoTrack?> = MutableStateFlow(null)
    private val mutableActiveAudioTrack: MutableStateFlow<AudioTrack?> = MutableStateFlow(null)
    private val mutableActiveSubtitleTrack: MutableStateFlow<SubtitleTrack?> = MutableStateFlow(null)
    private val mutableSubtitleCues: MutableStateFlow<List<SubtitleCue>> = MutableStateFlow(emptyList())
    private val mutableCoverArt: MutableStateFlow<ImageBitmap?> = MutableStateFlow(null)
    private val mutableLiveWindow: MutableStateFlow<LivePlaybackWindow?> = MutableStateFlow(null)
    private val mutableEvents: MutableSharedFlow<PlaybackEvent> = MutableSharedFlow(extraBufferCapacity = 64)

    private var requestedVolume: Float = 1f
    private var requestedMuted: Boolean = false
    private var requestedPlaybackRate: Float = 1f
    private var requestedFitMode: FitMode = FitMode.CONTAIN
    private var requestedStableVolume: Boolean = config.stableVolume
    private var requestedAudioOnly: Boolean = config.audioOnly
    private var requestedRotation: Int = config.initialRotationDegrees
    private var requestedProjection: ProjectionConfiguration = config.projection
    private var requestedToneMapping: ToneMappingMode = config.toneMapping
    private val trackSelectionGenerations: MutableMap<TrackKind, Long> = mutableMapOf()

    public val state: StateFlow<WasmMediaPlayerState> = mutableState.asStateFlow()
    public val position: StateFlow<Duration> = mutablePosition.asStateFlow()
    public val duration: StateFlow<Duration> = mutableDuration.asStateFlow()
    public val mediaInfo: StateFlow<MediaInfo?> = mutableMediaInfo.asStateFlow()
    public val bufferedRanges: StateFlow<List<BufferedRange>> = mutableBufferedRanges.asStateFlow()
    public val surface: StateFlow<PlayerSurface?> = mutableSurface.asStateFlow()
    public val diagnostics: StateFlow<RenderingDiagnostics> = mutableDiagnostics.asStateFlow()
    public val lastError: StateFlow<WasmMediaError?> = mutableLastError.asStateFlow()
    public val activeVideoTrack: StateFlow<VideoTrack?> = mutableActiveVideoTrack.asStateFlow()
    public val activeAudioTrack: StateFlow<AudioTrack?> = mutableActiveAudioTrack.asStateFlow()
    public val activeSubtitleTrack: StateFlow<SubtitleTrack?> = mutableActiveSubtitleTrack.asStateFlow()
    override val subtitleCues: StateFlow<List<SubtitleCue>> = mutableSubtitleCues.asStateFlow()
    override val coverArt: StateFlow<ImageBitmap?> = mutableCoverArt.asStateFlow()
    override val liveWindow: StateFlow<LivePlaybackWindow?> = mutableLiveWindow.asStateFlow()
    public val events: SharedFlow<PlaybackEvent> = mutableEvents.asSharedFlow()

    internal constructor(
        config: WasmMediaPlayerConfig,
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
            updateState(WasmMediaPlayerState.LOADING)

            val createdBackend = backendFactory.create(source, createObserver(loadGeneration))
            backend = createdBackend
            createdBackend.setVolume(requestedVolume)
            createdBackend.setMuted(requestedMuted)
            createdBackend.setPlaybackRate(requestedPlaybackRate)
            createdBackend.setFitMode(requestedFitMode)
            createdBackend.setStableVolume(requestedStableVolume)
            createdBackend.setRotation(requestedRotation)
            createdBackend.setProjection(requestedProjection)
            createdBackend.setToneMapping(requestedToneMapping)
            createdBackend.setAudioOnly(requestedAudioOnly)
            createdBackend.setEmbeddedSubtitleRenderer(subtitleRenderer, subtitleDelay)

            try {
                createdBackend.load(source)
                if (isCurrent(loadGeneration) && mutableState.value == WasmMediaPlayerState.LOADING) {
                    updateState(WasmMediaPlayerState.READY)
                }
            } catch (error: Throwable) {
                if (isCurrent(loadGeneration)) {
                    val publicError = error.toWasmMediaError()
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
            updateState(WasmMediaPlayerState.SEEKING)
            try {
                activeBackend.seek(position)
                mutablePosition.value = position
                mutableEvents.tryEmit(PlaybackEvent.TimeChanged(position))
                mutableEvents.tryEmit(PlaybackEvent.Seeked)
            } catch (error: Throwable) {
                recordError(error.toWasmMediaError())
                throw error
            }
        }

    public suspend fun selectTrack(request: TrackSelectionRequest): TrackSelectionOutcome {
        val requestGeneration = (trackSelectionGenerations[request.kind] ?: 0L) + 1L
        trackSelectionGenerations[request.kind] = requestGeneration
        return operationMutex.withLock {
            ensureOpen()
            if (trackSelectionGenerations[request.kind] != requestGeneration) {
                return@withLock request.supersededOutcome(backend?.activeTrack(request.kind))
            }
            val outcome = requireBackend().selectTrack(request)
            if (trackSelectionGenerations[request.kind] != requestGeneration) {
                return@withLock request.supersededOutcome(outcome.activeTrack)
            }
            if (!outcome.status.isAppliedSelection()) return@withLock outcome
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
            if (outcome.status != TrackSelectionStatus.UNCHANGED) {
                mutableEvents.tryEmit(PlaybackEvent.TrackChanged(outcome.kind, outcome.activeTrack))
            }
            outcome
        }
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

    override fun setStableVolume(enabled: Boolean) {
        requestedStableVolume = enabled
        backend?.setStableVolume(enabled)
    }

    override suspend fun setAudioOnly(enabled: Boolean): Unit =
        operationMutex.withLock {
            ensureOpen()
            requestedAudioOnly = enabled
            val activeBackend = backend ?: return@withLock
            val previous = mutableActiveVideoTrack.value
            activeBackend.setAudioOnly(enabled)
            val confirmed =
                if (enabled) {
                    null
                } else {
                    activeBackend.activeTrack(TrackKind.VIDEO) as? VideoTrack
                }
            mutableActiveVideoTrack.value = confirmed
            if (previous != confirmed) {
                mutableEvents.tryEmit(PlaybackEvent.TrackChanged(TrackKind.VIDEO, confirmed))
            }
        }

    override fun setRotation(rotationDegrees: Int) {
        require(rotationDegrees % 90 == 0) { "rotationDegrees must be a multiple of 90." }
        requestedRotation = rotationDegrees
        backend?.setRotation(rotationDegrees)
    }

    override fun setProjection(configuration: ProjectionConfiguration) {
        requestedProjection = configuration
        backend?.setProjection(configuration)
    }

    override fun setToneMapping(mode: ToneMappingMode) {
        requestedToneMapping = mode
        backend?.setToneMapping(mode)
    }

    override suspend fun listAudioOutputs(): List<AudioOutputDevice> {
        ensureOpen()
        val deferred = CompletableDeferred<String>()
        enumerateAudioOutputs(
            onComplete = deferred::complete,
            onError = { message ->
                deferred.completeExceptionally(
                    WasmMediaError(
                        WasmMediaErrorCategory.RENDERER,
                        WasmMediaErrorCode.OUTPUT_DEVICE_FAILED,
                        message,
                    ),
                )
            },
        )
        return deferred.await()
            .lineSequence()
            .filter(String::isNotBlank)
            .map { row ->
                val columns = row.split('\t', limit = 3)
                AudioOutputDevice(
                    id = columns.getOrElse(0) { "" },
                    label = columns.getOrElse(1) { "" }.ifBlank { "Audio output" },
                    isDefault = columns.getOrElse(2) { "false" } == "true",
                )
            }.filter { it.id.isNotBlank() }
            .toList()
    }

    override suspend fun setAudioOutput(deviceId: String?): Unit =
        operationMutex.withLock {
            ensureOpen()
            requireBackend().setAudioOutput(deviceId)
        }

    override suspend fun snapshot(): VideoSnapshot =
        operationMutex.withLock {
            ensureOpen()
            requireBackend().snapshot()
        }

    override suspend fun thumbnail(position: Duration): VideoSnapshot =
        operationMutex.withLock {
            ensureOpen()
            require(position >= Duration.ZERO) { "Thumbnail position must not be negative." }
            requireBackend().thumbnail(position)
        }

    override suspend fun prefetchSubtitleCues(): List<SubtitleCue> =
        operationMutex.withLock {
            ensureOpen()
            requireBackend().prefetchSubtitleCues().also { cues ->
                mutableSubtitleCues.value = cues
            }
        }

    override suspend fun seekToLive(): Unit =
        operationMutex.withLock {
            ensureOpen()
            requireBackend().seekToLive()
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
        mutableCoverArt.value?.let(::closeImageBitmap)
        mutableCoverArt.value = null
        mutableSubtitleCues.value = emptyList()
        mutableLiveWindow.value = null
        mutableSurface.value = null
        updateState(WasmMediaPlayerState.CLOSED)
    }

    private fun disposeRenderer(renderer: EmbeddedSubtitleRenderer) {
        renderer.clear()
        cleanupScope.launch {
            runCatching { renderer.close() }
                .onFailure { error ->
                    config.logger.log(
                        WasmMediaLogLevel.ERROR,
                        "subtitle",
                        redactSensitiveText(error.message ?: "Subtitle renderer cleanup failed."),
                    )
                }
        }
    }

    private fun createObserver(observerGeneration: Long): BackendObserver =
        object : BackendObserver {
            override fun onState(state: WasmMediaPlayerState) {
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
                if (!isCurrent(observerGeneration)) return
                val current =
                    diagnostics.copy(
                        liveWindow = mutableLiveWindow.value,
                    )
                mutableDiagnostics.value = current
                mutableEvents.tryEmit(PlaybackEvent.DiagnosticsChanged(current))
            }

            override fun onSourceModeChanged(mode: SourceMode) {
                if (isCurrent(observerGeneration)) {
                    mutableEvents.tryEmit(PlaybackEvent.SourceModeChanged(mode))
                }
            }

            override fun onLiveWindowChanged(window: LivePlaybackWindow?) {
                if (!isCurrent(observerGeneration)) return
                mutableDiagnostics.value =
                    mutableDiagnostics.value.copy(
                        liveWindow = window,
                    )
                mutableLiveWindow.value = window
                mutableEvents.tryEmit(PlaybackEvent.LiveWindowChanged(window))
                mutableEvents.tryEmit(PlaybackEvent.DiagnosticsChanged(mutableDiagnostics.value))
            }

            override fun onFileAccessRevoked(
                offset: Long,
                length: Int,
                reason: String,
            ) {
                if (isCurrent(observerGeneration)) {
                    mutableEvents.tryEmit(PlaybackEvent.FileAccessRevoked(offset, length, reason))
                }
            }

            override fun onCoverArt(image: ImageBitmap?) {
                if (!isCurrent(observerGeneration)) {
                    image?.let(::closeImageBitmap)
                    return
                }
                mutableCoverArt.value?.let(::closeImageBitmap)
                mutableCoverArt.value = image
                mutableEvents.tryEmit(PlaybackEvent.CoverArtChanged(image))
            }

            override fun onSubtitleCues(cues: List<SubtitleCue>) {
                if (isCurrent(observerGeneration)) mutableSubtitleCues.value = cues
            }

            override fun onEnded() {
                if (!isCurrent(observerGeneration)) return
                updateState(WasmMediaPlayerState.ENDED)
                mutableEvents.tryEmit(PlaybackEvent.Ended)
            }

            override fun onError(error: WasmMediaError) {
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
        mutableSubtitleCues.value = emptyList()
        mutableCoverArt.value?.let(::closeImageBitmap)
        mutableCoverArt.value = null
        mutableLiveWindow.value = null
        subtitleRenderer?.clear()
    }

    private fun updateState(state: WasmMediaPlayerState) {
        if (mutableState.value == state) return
        mutableState.value = state
        mutableEvents.tryEmit(PlaybackEvent.StateChanged(state))
    }

    private fun recordError(error: WasmMediaError) {
        mutableLastError.value = error
        updateState(WasmMediaPlayerState.ERROR)
        mutableEvents.tryEmit(PlaybackEvent.Failed(error))
    }

    private fun requireBackend(): PlayerBackend =
        backend
            ?: throw WasmMediaError(
                WasmMediaErrorCategory.STATE,
                WasmMediaErrorCode.INVALID_STATE,
                "No media source has been loaded.",
            )

    private fun ensureOpen() {
        if (closed) {
            throw WasmMediaError(
                WasmMediaErrorCategory.STATE,
                WasmMediaErrorCode.INVALID_STATE,
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

private fun TrackSelectionStatus.isAppliedSelection(): Boolean =
    this == TrackSelectionStatus.SELECTED ||
        this == TrackSelectionStatus.UNCHANGED ||
        this == TrackSelectionStatus.AUTO ||
        this == TrackSelectionStatus.DISABLED

private fun Throwable.toWasmMediaError(): WasmMediaError =
    this as? WasmMediaError
        ?: WasmMediaError(
            category = WasmMediaErrorCategory.INTERNAL,
            code = WasmMediaErrorCode.UNKNOWN,
            message = message ?: "KMedia Wasm playback failed.",
            cause = this,
        )

private fun TrackSelectionRequest.supersededOutcome(activeTrack: MediaTrack?): TrackSelectionOutcome =
    TrackSelectionOutcome(
        kind = kind,
        status = TrackSelectionStatus.SUPERSEDED,
        requestedTrackId =
            when (this) {
                is TrackSelectionRequest.Video -> trackId
                is TrackSelectionRequest.Audio -> trackId
                is TrackSelectionRequest.Subtitle -> trackId
            },
        activeTrack = activeTrack,
    )

@Suppress("UNUSED_PARAMETER")
private fun enumerateAudioOutputs(
    onComplete: (String) -> Unit,
    onError: (String) -> Unit,
): Unit =
    js(
        """
        {
            const mediaDevices = globalThis.navigator && navigator.mediaDevices;
            if (!mediaDevices || typeof mediaDevices.enumerateDevices !== "function") {
                onComplete("");
            } else {
                Promise.resolve(mediaDevices.enumerateDevices())
                    .then(function(devices) {
                        const clean = value => String(value || "").replace(/[\t\r\n]/g, " ");
                        const rows = devices
                            .filter(device => device.kind === "audiooutput")
                            .map(device =>
                                clean(device.deviceId) + "\t" +
                                clean(device.label) + "\t" +
                                String(device.deviceId === "default")
                            );
                        onComplete(rows.join("\n"));
                    })
                    .catch(function(error) {
                        onError(String(error && error.message ? error.message : error));
                    });
            }
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun closeImageBitmap(image: ImageBitmap): Unit =
    js(
        """
        {
            try { image.close(); } catch (_) {}
        }
        """,
    )
