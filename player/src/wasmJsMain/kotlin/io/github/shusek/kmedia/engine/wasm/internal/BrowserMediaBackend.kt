@file:OptIn(ExperimentalWasmJsInterop::class)

package io.github.shusek.kmedia.engine.wasm.internal

import io.github.shusek.kmedia.engine.wasm.AudioTrack
import io.github.shusek.kmedia.engine.wasm.BufferedRange
import io.github.shusek.kmedia.engine.wasm.BrowserMediaSourceAdapter
import io.github.shusek.kmedia.engine.wasm.ColorPipelineDiagnostics
import io.github.shusek.kmedia.engine.wasm.FitMode
import io.github.shusek.kmedia.engine.wasm.DynamicRange
import io.github.shusek.kmedia.engine.wasm.MediaInfo
import io.github.shusek.kmedia.engine.wasm.MediaSource
import io.github.shusek.kmedia.engine.wasm.WasmMediaError
import io.github.shusek.kmedia.engine.wasm.WasmMediaErrorCategory
import io.github.shusek.kmedia.engine.wasm.WasmMediaErrorCode
import io.github.shusek.kmedia.engine.wasm.WasmMediaPlayerConfig
import io.github.shusek.kmedia.engine.wasm.WasmMediaPlayerState
import io.github.shusek.kmedia.engine.wasm.PlayerSurface
import io.github.shusek.kmedia.engine.wasm.RenderingBackend
import io.github.shusek.kmedia.engine.wasm.RenderingDiagnostics
import io.github.shusek.kmedia.engine.wasm.SubtitleTrack
import io.github.shusek.kmedia.engine.wasm.SubtitleType
import io.github.shusek.kmedia.engine.wasm.VideoTrack
import io.github.shusek.kmedia.engine.wasm.DecoderBackend
import io.github.shusek.kmedia.engine.wasm.SourceMode
import io.github.shusek.kmedia.engine.wasm.ProjectionConfiguration
import io.github.shusek.kmedia.engine.wasm.ProjectionMode
import io.github.shusek.kmedia.engine.wasm.ProjectionStereoLayout
import io.github.shusek.kmedia.engine.wasm.OutputDynamicRangePolicy
import io.github.shusek.kmedia.engine.wasm.OutputVerification
import io.github.shusek.kmedia.engine.wasm.ToneMappingMode
import io.github.shusek.kmedia.engine.wasm.VideoSnapshot
import io.github.shusek.kmedia.engine.wasm.SubtitleCue
import io.github.shusek.kmedia.engine.wasm.TrackKind
import io.github.shusek.kmedia.engine.wasm.TrackSelectionOutcome
import io.github.shusek.kmedia.engine.wasm.TrackSelectionRequest
import io.github.shusek.kmedia.engine.wasm.TrackSelectionStatus
import io.github.shusek.kmedia.engine.wasm.buildAdaptiveDemuxFallback
import kotlinx.browser.document
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import org.w3c.dom.HTMLVideoElement
import kotlin.js.ExperimentalWasmJsInterop
import kotlin.js.JsAny
import kotlin.js.js
import kotlin.time.Duration
import kotlin.time.Duration.Companion.seconds

internal class BrowserMediaBackend(
    private val config: WasmMediaPlayerConfig,
    private val observer: BackendObserver,
) : PlayerBackend {
    private val video: HTMLVideoElement = document.createElement("video") as HTMLVideoElement
    private var bridge: JsAny? = null
    private var controlledPipeline: JsAny? = null
    private var controlledFramePump: JsAny? = null
    private var nativeAudioGraph: JsAny? = null
    private var objectUrl: String? = null
    private var closed: Boolean = false
    private var duration: Duration = Duration.ZERO
    private var currentInfo: MediaInfo? = null
    private val pendingRanges: MutableList<BufferedRange> = mutableListOf()
    private val pendingOperations: MutableSet<CompletableDeferred<Unit>> = mutableSetOf()
    private val scope: CoroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private var fallbackBackend: DemuxedPlaybackBackend? = null
    private var fallbackStarted: Boolean = false
    private var loadedSource: MediaSource? = null
    private var loadOperation: CompletableDeferred<Unit>? = null
    private var browserMediaAdapter: BrowserMediaSourceAdapter? = null
    private var browserMediaAttached: Boolean = false
    private var browserMediaReleased: Boolean = false
    private var requestedVolume: Float = 1f
    private var requestedMuted: Boolean = false
    private var requestedRate: Float = 1f
    private var requestedFitMode: FitMode = FitMode.CONTAIN
    private var requestedStableVolume: Boolean = config.stableVolume
    private var requestedAudioOnly: Boolean = config.audioOnly
    private var requestedRotation: Int = config.initialRotationDegrees
    private var requestedProjection: ProjectionConfiguration = config.projection
    private var requestedToneMapping: ToneMappingMode =
        when (config.outputDynamicRangePolicy) {
            OutputDynamicRangePolicy.FORCE_SDR -> ToneMappingMode.SHADER
            OutputDynamicRangePolicy.REQUIRE_HDR -> ToneMappingMode.NATIVE
            OutputDynamicRangePolicy.AUTO,
            OutputDynamicRangePolicy.PREFER_HDR,
            -> config.toneMapping
        }
    private var activeRenderingBackend: RenderingBackend = RenderingBackend.UNKNOWN
    private var adaptiveVideoTracks: List<VideoTrack> = emptyList()
    private var adaptiveAudioTracks: List<AudioTrack> = emptyList()
    private var adaptiveSubtitleTracks: List<SubtitleTrack> = emptyList()
    private var activeAdaptiveVideoTrack: VideoTrack? = null
    private var activeAdaptiveAudioTrack: AudioTrack? = null
    private var activeAdaptiveSubtitleTrack: SubtitleTrack? = null
    private var liveWindow: io.github.shusek.kmedia.engine.wasm.LivePlaybackWindow? = null

    init {
        configureNativeVideo(config.canvas, video)
        updateControlledRenderer()
    }

    override suspend fun load(source: MediaSource) {
        check(!closed) { "The backend is closed." }
        val deferred = CompletableDeferred<Unit>()
        loadedSource = source
        loadOperation = deferred
        source.browserMediaAdapterOrNull()?.let { adapter ->
            browserMediaAdapter = adapter
            browserMediaAttached = true
            try {
                adapter.attach(video) { message ->
                    if (!closed) handlePreparedSourceFailure(message)
                }
            } catch (error: Throwable) {
                throw WasmMediaError(
                    WasmMediaErrorCategory.SOURCE,
                    WasmMediaErrorCode.SOURCE_UNAVAILABLE,
                    error.message ?: "The prepared browser source could not be attached.",
                    error,
                )
            }
        }
        validateOutputRequirements(source)
        val descriptor = source.toDescriptor()
        activeRenderingBackend = descriptor.backend
        if (source is MediaSource.BrowserFile) {
            objectUrl = createObjectUrl(source.file)
        }
        bridge =
            createVideoBridge(
                video = video,
                kind = descriptor.kind,
                sourceUrl = objectUrl ?: descriptor.sourceUrl,
                mediaHeadersJson = descriptor.mediaHeaders.toJsonObject(),
                licenseServersJson = descriptor.licenseServers.toJsonObject(),
                licenseHeadersJson = descriptor.licenseHeaders.toJsonObject(),
                onReady = { durationSeconds ->
                    if (closed) return@createVideoBridge
                    duration = durationSeconds.validSeconds()
                    val info =
                        MediaInfo(
                            formatName = descriptor.kind,
                            duration = duration,
                            startTime = Duration.ZERO,
                            bitRate = null,
                            tracks =
                                (
                                    adaptiveVideoTracks.ifEmpty {
                                        listOf(
                                            VideoTrack(
                                                id = 0,
                                                codec = descriptor.kind,
                                                width = videoWidth(video),
                                                height = videoHeight(video),
                                                frameRate = 0.0,
                                                isDefault = true,
                                            ),
                                        )
                                    } +
                                        adaptiveAudioTracks.ifEmpty {
                                            listOf(
                                                AudioTrack(
                                                    id = 0,
                                                    codec = "browser",
                                                    channels = 0,
                                                    sampleRate = 0,
                                                    isDefault = true,
                                                ),
                                            )
                                        } +
                                        adaptiveSubtitleTracks
                                ),
                        )
                    currentInfo = info
                    observer.onDuration(duration)
                    observer.onMediaInfo(info)
                    applyControlledVisualSettings()
                    publishDiagnostics(descriptor.kind)
                    observer.onState(WasmMediaPlayerState.READY)
                    if (!deferred.isCompleted) deferred.complete(Unit)
                },
                onState = { state ->
                    if (!closed) observer.onState(state.toPlayerState())
                },
                onTime = { seconds ->
                    if (!closed) observer.onTime(seconds.validSeconds())
                },
                onBufferReset = {
                    if (!closed) pendingRanges.clear()
                },
                onBufferRange = { start, end, last ->
                    if (closed) return@createVideoBridge
                    pendingRanges += BufferedRange(start.validSeconds(), end.validSeconds())
                    if (last) observer.onBuffered(pendingRanges.toList())
                },
                onEnded = {
                    if (!closed) observer.onEnded()
                },
                onEngineChanged = { engine ->
                    activeRenderingBackend = engine.toRenderingBackend()
                    publishDiagnostics(descriptor.kind)
                },
                onAdaptiveTracks = { rows ->
                    if (!closed) updateAdaptiveTracks(rows, descriptor)
                },
                onAdaptiveAudioTracks = { rows ->
                    if (!closed) updateAdaptiveAudioTracks(rows)
                },
                onAdaptiveSubtitleTracks = { rows ->
                    if (!closed) updateAdaptiveSubtitleTracks(rows)
                },
                onLiveWindow = { start, end, edge, isLive ->
                    if (closed) return@createVideoBridge
                    liveWindow =
                        if (isLive && end >= start) {
                            io.github.shusek.kmedia.engine.wasm.LivePlaybackWindow(
                                start = start.validSeconds(),
                                end = end.validSeconds(),
                                liveEdge = edge.coerceIn(start, end).validSeconds(),
                            )
                        } else {
                            null
                        }
                    observer.onLiveWindowChanged(liveWindow)
                },
                onDemuxFallback = { reason ->
                    if (!closed) startAdaptiveDemuxFallback(source, deferred, reason)
                },
                onError = { message ->
                    val error =
                        WasmMediaError(
                            category =
                                if (source is MediaSource.Drm) {
                                    WasmMediaErrorCategory.DRM
                                } else {
                                    WasmMediaErrorCategory.SOURCE
                                },
                            code =
                                if (source is MediaSource.Drm) {
                                    WasmMediaErrorCode.DRM_CONFIGURATION_FAILED
                                } else {
                                    WasmMediaErrorCode.SOURCE_UNAVAILABLE
                                },
                            message = message,
                        )
                    if (!deferred.isCompleted) deferred.completeExceptionally(error)
                    observer.onError(error)
                },
            )
        applyRequestedSettings()
        deferred.awaitTracked()
    }

    override suspend fun play() {
        fallbackBackend?.let {
            it.play()
            return
        }
        val active = bridge ?: throw invalidState()
        val deferred = CompletableDeferred<Unit>()
        playVideoBridge(
            bridge = active,
            onPlayed = { deferred.complete(Unit) },
            onError = { message ->
                deferred.completeExceptionally(
                    WasmMediaError(
                        WasmMediaErrorCategory.STATE,
                        WasmMediaErrorCode.INVALID_STATE,
                        message,
                    ),
                )
            },
        )
        deferred.awaitTracked()
    }

    override fun pause() {
        fallbackBackend?.let {
            it.pause()
            return
        }
        bridge?.let(::pauseVideoBridge)
    }

    override suspend fun seek(position: Duration) {
        fallbackBackend?.let {
            it.seek(position)
            return
        }
        val active = bridge ?: throw invalidState()
        val deferred = CompletableDeferred<Unit>()
        seekVideoBridge(
            bridge = active,
            seconds = position.inWholeMilliseconds / 1_000.0,
            onSeeked = { deferred.complete(Unit) },
            onError = { message ->
                deferred.completeExceptionally(
                    WasmMediaError(
                        WasmMediaErrorCategory.STATE,
                        WasmMediaErrorCode.INVALID_STATE,
                        message,
                    ),
                )
            },
        )
        deferred.awaitTracked()
    }

    override fun setVolume(volume: Float) {
        requestedVolume = volume.coerceIn(0f, 1f)
        fallbackBackend?.setVolume(requestedVolume)
        bridge?.let { setVideoBridgeVolume(it, requestedVolume) }
    }

    override fun setMuted(muted: Boolean) {
        requestedMuted = muted
        fallbackBackend?.setMuted(muted)
        bridge?.let { setVideoBridgeMuted(it, muted) }
    }

    override fun setPlaybackRate(rate: Float) {
        requestedRate = rate.coerceIn(0.25f, 4f)
        fallbackBackend?.setPlaybackRate(requestedRate)
        bridge?.let { setVideoBridgeRate(it, requestedRate) }
    }

    override fun setFitMode(fitMode: FitMode) {
        requestedFitMode = fitMode
        fallbackBackend?.setFitMode(fitMode)
        controlledPipeline?.let { setMediaPipelineFitMode(it, fitMode.name.lowercase()) }
        setVideoFitMode(
            video = video,
            fitMode =
                when (fitMode) {
                    FitMode.CONTAIN -> "contain"
                    FitMode.COVER -> "cover"
                    FitMode.FILL -> "fill"
                },
        )
    }

    override suspend fun selectTrack(request: TrackSelectionRequest): TrackSelectionOutcome {
        fallbackBackend?.let { return it.selectTrack(request) }
        return when (request) {
            is TrackSelectionRequest.Video -> selectAdaptiveVideo(request)
            is TrackSelectionRequest.Audio -> selectAdaptiveAudio(request)
            is TrackSelectionRequest.Subtitle -> selectAdaptiveSubtitle(request)
        }
    }

    override fun activeTrack(kind: TrackKind): io.github.shusek.kmedia.engine.wasm.MediaTrack? =
        when (kind) {
            TrackKind.VIDEO ->
                if (requestedAudioOnly) {
                    null
                } else {
                    activeAdaptiveVideoTrack ?: currentInfo?.videoTracks?.firstOrNull()
                }
            TrackKind.AUDIO -> activeAdaptiveAudioTrack ?: currentInfo?.audioTracks?.firstOrNull()
            TrackKind.SUBTITLE -> activeAdaptiveSubtitleTrack
        }

    override fun setStableVolume(enabled: Boolean) {
        requestedStableVolume = enabled
        fallbackBackend?.setStableVolume(enabled)
        if (fallbackBackend != null) return
        val graph =
            nativeAudioGraph
                ?: if (enabled) {
                    runCatching { createNativeAudioGraph(video) }
                        .getOrNull()
                        ?.also { nativeAudioGraph = it }
                } else {
                    null
                }
        graph?.let { setNativeAudioGraphStableVolume(it, enabled) }
    }

    override suspend fun setAudioOnly(enabled: Boolean) {
        requestedAudioOnly = enabled
        fallbackBackend?.let {
            it.setAudioOnly(enabled)
            return
        }
        bridge?.let { setAdaptiveAudioOnly(it, enabled) }
        if (enabled) {
            setNativeVideoVisibility(video, false)
        } else {
            updateControlledRenderer()
        }
    }

    override fun setRotation(rotationDegrees: Int) {
        requestedRotation = rotationDegrees
        fallbackBackend?.setRotation(rotationDegrees)
        if (fallbackBackend == null) updateControlledRenderer()
    }

    override fun setProjection(configuration: ProjectionConfiguration) {
        requestedProjection = configuration
        fallbackBackend?.setProjection(configuration)
        if (fallbackBackend == null) updateControlledRenderer()
    }

    override fun setToneMapping(mode: ToneMappingMode) {
        requestedToneMapping =
            if (config.outputDynamicRangePolicy == OutputDynamicRangePolicy.FORCE_SDR) {
                ToneMappingMode.SHADER
            } else {
                mode
            }
        fallbackBackend?.setToneMapping(mode)
        if (fallbackBackend == null) updateControlledRenderer()
    }

    override suspend fun setAudioOutput(deviceId: String?) {
        fallbackBackend?.let {
            it.setAudioOutput(deviceId)
            return
        }
        val deferred = CompletableDeferred<Unit>()
        val onComplete: () -> Unit = {
            deferred.complete(Unit)
        }
        val onError: (String) -> Unit = { message ->
            deferred.completeExceptionally(
                WasmMediaError(
                    WasmMediaErrorCategory.RENDERER,
                    WasmMediaErrorCode.OUTPUT_DEVICE_FAILED,
                    message,
                ),
            )
        }
        nativeAudioGraph?.let { graph ->
            setNativeAudioGraphSink(graph, deviceId ?: "", onComplete, onError)
        } ?: setNativeVideoSink(video, deviceId ?: "", onComplete, onError)
        deferred.await()
    }

    override suspend fun snapshot(): VideoSnapshot {
        fallbackBackend?.let { return it.snapshot() }
        val deferred = CompletableDeferred<org.w3c.dom.ImageBitmap>()
        snapshotNativeVideo(
            video,
            onComplete = deferred::complete,
            onError = { message ->
                deferred.completeExceptionally(
                    WasmMediaError(
                        WasmMediaErrorCategory.RENDERER,
                        WasmMediaErrorCode.RENDER_FAILED,
                        message,
                    ),
                )
            },
        )
        val image = deferred.await()
        return VideoSnapshot(
            image = image,
            timestamp = nativeVideoCurrentTime(video).validSeconds(),
            width = videoWidth(video),
            height = videoHeight(video),
        )
    }

    override suspend fun thumbnail(position: Duration): VideoSnapshot {
        fallbackBackend?.let { return it.thumbnail(position) }
        throw WasmMediaError(
            WasmMediaErrorCategory.RENDERER,
            WasmMediaErrorCode.THUMBNAIL_FAILED,
            "Isolated adaptive thumbnails require the FFmpeg demux fallback.",
        )
    }

    override suspend fun prefetchSubtitleCues(): List<SubtitleCue> {
        fallbackBackend?.let { return it.prefetchSubtitleCues() }
        if (activeAdaptiveSubtitleTrack == null) return emptyList()
        val deferred = CompletableDeferred<String>()
        collectAdaptiveSubtitleCues(
            video = video,
            onComplete = deferred::complete,
            onError = { deferred.complete("") },
        )
        return deferred.await()
            .lineSequence()
            .filter(String::isNotBlank)
            .mapNotNull { row ->
                val columns = row.split('\t', limit = 3)
                val start = columns.getOrNull(0)?.toDoubleOrNull() ?: return@mapNotNull null
                val end = columns.getOrNull(1)?.toDoubleOrNull() ?: return@mapNotNull null
                SubtitleCue(
                    start = start.validSeconds(),
                    end = end.validSeconds(),
                    text = columns.getOrNull(2).orEmpty(),
                )
            }.toList()
            .also(observer::onSubtitleCues)
    }

    override suspend fun seekToLive() {
        fallbackBackend?.let {
            it.seekToLive()
            return
        }
        val window =
            liveWindow
                ?: throw WasmMediaError(
                    WasmMediaErrorCategory.STATE,
                    WasmMediaErrorCode.LIVE_WINDOW_UNAVAILABLE,
                    "This adaptive source has no live playback window.",
                )
        seek(window.liveEdge)
    }

    override fun close() {
        if (closed) return
        closed = true
        val cancellation = CancellationException("The browser media backend was closed.")
        pendingOperations.toList().forEach { operation ->
            operation.completeExceptionally(cancellation)
        }
        pendingOperations.clear()
        scope.cancel()
        fallbackBackend?.close()
        fallbackBackend = null
        releaseControlledRenderer()
        nativeAudioGraph?.let(::destroyNativeAudioGraph)
        nativeAudioGraph = null
        bridge?.let(::destroyVideoBridge)
        bridge = null
        releaseBrowserMediaAdapter()
        objectUrl?.let(::revokeObjectUrl)
        objectUrl = null
        video.remove()
    }

    private fun applyRequestedSettings() {
        setVolume(requestedVolume)
        setMuted(requestedMuted)
        setPlaybackRate(requestedRate)
        setFitMode(requestedFitMode)
        updateControlledRenderer()
        setStableVolume(requestedStableVolume)
        bridge?.let { setAdaptiveAudioOnly(it, requestedAudioOnly) }
        setNativeVideoVisibility(video, !requestedAudioOnly)
    }

    private fun validateOutputRequirements(source: MediaSource) {
        val effectiveSource = source.primarySource()
        if (config.outputDynamicRangePolicy == OutputDynamicRangePolicy.REQUIRE_HDR) {
            throw WasmMediaError(
                WasmMediaErrorCategory.RENDERER,
                WasmMediaErrorCode.OUTPUT_REQUIREMENT_UNAVAILABLE,
                "The browser media backend cannot verify HDR output for this source.",
            )
        }
        if (effectiveSource is MediaSource.Drm && requiresControlledRenderer()) {
            throw WasmMediaError(
                WasmMediaErrorCategory.DRM,
                WasmMediaErrorCode.PROTECTED_CONTENT_TRANSFORM_UNSUPPORTED,
                "Protected media cannot be sampled for projection, crop, rotation, or shader tone mapping.",
            )
        }
    }

    private fun updateControlledRenderer() {
        if (closed || fallbackBackend != null) return
        if (requiresControlledRenderer()) {
            ensureControlledRenderer()
            applyControlledVisualSettings()
            setNativeVideoRotation(video, 0)
            setNativeVideoCanvasMode(config.canvas, video, enabled = true)
            observer.onSurface(PlayerSurface.Canvas(config.canvas, video))
        } else {
            releaseControlledRenderer()
            setNativeVideoRotation(video, requestedRotation)
            setNativeVideoCanvasMode(config.canvas, video, enabled = false)
            observer.onSurface(PlayerSurface.NativeVideo(video))
        }
    }

    private fun requiresControlledRenderer(): Boolean {
        val projection = requestedProjection
        return config.outputDynamicRangePolicy == OutputDynamicRangePolicy.FORCE_SDR ||
            requestedToneMapping == ToneMappingMode.SHADER ||
            requestedRotation % 360 != 0 ||
            projection.mode != ProjectionMode.AUTO && projection.mode != ProjectionMode.FLAT ||
            projection.stereoLayout != ProjectionStereoLayout.MONO ||
            projection.cropLeft > 0f ||
            projection.cropTop > 0f ||
            projection.cropRight > 0f ||
            projection.cropBottom > 0f
    }

    private fun ensureControlledRenderer() {
        if (controlledPipeline != null) return
        val created =
            createMediaPipeline(
                canvas = config.canvas,
                stableVolume = false,
                onTime = {},
                onState = {},
                onEnded = {},
                onDecoderError = { _, message -> handleControlledRendererFailure(message) },
                onError = ::handleControlledRendererFailure,
                renderOnly = true,
            )
        controlledPipeline = created
        controlledFramePump =
            createNativeVideoFramePump(
                video = video,
                pipeline = created,
                onError = ::handleControlledRendererFailure,
            )
    }

    private fun releaseControlledRenderer() {
        controlledFramePump?.let { pump -> destroyNativeVideoFramePump(video, pump) }
        controlledFramePump = null
        controlledPipeline?.let(::destroyMediaPipeline)
        controlledPipeline = null
    }

    private fun applyControlledVisualSettings() {
        val activePipeline = controlledPipeline ?: return
        val projection =
            requestedProjection.mode
                .takeUnless { it == ProjectionMode.AUTO }
                ?: ProjectionMode.FLAT
        val stereoLayout =
            if (
                projection == ProjectionMode.SIDE_BY_SIDE &&
                requestedProjection.stereoLayout == ProjectionStereoLayout.MONO
            ) {
                ProjectionStereoLayout.SIDE_BY_SIDE
            } else {
                requestedProjection.stereoLayout
            }
        setMediaPipelineFitMode(activePipeline, requestedFitMode.name.lowercase())
        setMediaPipelineProjection(
            pipeline = activePipeline,
            projection = projection.name.lowercase(),
            stereoLayout = stereoLayout.name.lowercase(),
            eyeOrder = requestedProjection.eyeOrder.name.lowercase(),
            rotationDegrees = requestedRotation,
            yawDegrees = requestedProjection.yawDegrees,
            pitchDegrees = requestedProjection.pitchDegrees,
            fieldOfViewDegrees = requestedProjection.fieldOfViewDegrees,
            cropLeft = requestedProjection.cropLeft,
            cropTop = requestedProjection.cropTop,
            cropRight = requestedProjection.cropRight,
            cropBottom = requestedProjection.cropBottom,
        )
        setMediaPipelineColor(
            pipeline = activePipeline,
            sourceHdr = currentInfo?.videoTracks?.firstOrNull()?.isHdr == true,
            toneMapping = requestedToneMapping.name.lowercase(),
        )
    }

    private fun handleControlledRendererFailure(message: String) {
        if (closed || fallbackBackend != null) return
        releaseControlledRenderer()
        val source = loadedSource
        val operation = loadOperation
        if (source != null && operation != null && source.primarySource() is MediaSource.Url) {
            startAdaptiveDemuxFallback(source, operation, "Controlled browser rendering failed: $message")
            return
        }
        val error =
            WasmMediaError(
                WasmMediaErrorCategory.RENDERER,
                WasmMediaErrorCode.RENDER_FAILED,
                message,
            )
        if (operation != null && !operation.isCompleted) operation.completeExceptionally(error)
        observer.onError(error)
    }

    private fun handlePreparedSourceFailure(message: String) {
        val error =
            WasmMediaError(
                WasmMediaErrorCategory.SOURCE,
                WasmMediaErrorCode.SOURCE_UNAVAILABLE,
                message,
            )
        loadOperation?.takeUnless(CompletableDeferred<Unit>::isCompleted)?.completeExceptionally(error)
        observer.onError(error)
    }

    private fun releaseBrowserMediaAdapter() {
        if (browserMediaReleased) return
        browserMediaReleased = true
        val adapter = browserMediaAdapter ?: return
        if (browserMediaAttached) {
            runCatching { adapter.detach(video) }
            browserMediaAttached = false
        }
        runCatching { adapter.close() }
        browserMediaAdapter = null
    }

    private fun startAdaptiveDemuxFallback(
        source: MediaSource,
        loadOperation: CompletableDeferred<Unit>,
        reason: String,
    ) {
        if (fallbackStarted) return
        fallbackStarted = true
        val urlSource =
            when (source) {
                is MediaSource.Url -> source
                is MediaSource.Composite -> source.primary as? MediaSource.Url
                else -> null
            }
        if (urlSource == null || source is MediaSource.Drm) {
            val error =
                WasmMediaError(
                    WasmMediaErrorCategory.SOURCE,
                    WasmMediaErrorCode.UNSUPPORTED_FORMAT,
                    "The adaptive MSE engines failed and this manifest has no safe demux fallback. $reason",
                )
            if (!loadOperation.isCompleted) loadOperation.completeExceptionally(error)
            observer.onError(error)
            return
        }
        scope.launch {
            runCatching {
                buildAdaptiveDemuxFallback(urlSource, config.cache)
                    ?: throw WasmMediaError(
                        WasmMediaErrorCategory.SOURCE,
                        WasmMediaErrorCode.RANGE_UNSUPPORTED,
                        "The adaptive manifest cannot be represented as a finite seekable FFmpeg source.",
                    )
            }.onSuccess { fallbackSource ->
                if (closed) {
                    fallbackSource.closeUnloadedSource()
                    return@onSuccess
                }
                bridge?.let(::destroyVideoBridge)
                bridge = null
                setNativeVideoVisibility(video, false)
                val fallback = DemuxedPlaybackBackend(config, observer)
                fallbackBackend = fallback
                fallback.setVolume(requestedVolume)
                fallback.setMuted(requestedMuted)
                fallback.setPlaybackRate(requestedRate)
                fallback.setFitMode(requestedFitMode)
                fallback.setStableVolume(requestedStableVolume)
                fallback.setRotation(requestedRotation)
                fallback.setProjection(requestedProjection)
                fallback.setToneMapping(requestedToneMapping)
                runCatching {
                    fallback.load(fallbackSource)
                    fallback.setAudioOnly(requestedAudioOnly)
                }.onSuccess {
                    if (!loadOperation.isCompleted) loadOperation.complete(Unit)
                }.onFailure { error ->
                    fallback.close()
                    fallbackBackend = null
                    val publicError =
                        error as? WasmMediaError
                            ?: WasmMediaError(
                                WasmMediaErrorCategory.FORMAT,
                                WasmMediaErrorCode.UNSUPPORTED_FORMAT,
                                error.message ?: "The FFmpeg adaptive fallback failed.",
                                error,
                            )
                    if (!loadOperation.isCompleted) loadOperation.completeExceptionally(publicError)
                    observer.onError(publicError)
                }
            }.onFailure { error ->
                val publicError =
                    error as? WasmMediaError
                        ?: WasmMediaError(
                            WasmMediaErrorCategory.FORMAT,
                            WasmMediaErrorCode.UNSUPPORTED_FORMAT,
                            error.message ?: "The adaptive demux fallback could not be created.",
                            error,
                        )
                if (!loadOperation.isCompleted) loadOperation.completeExceptionally(publicError)
                observer.onError(publicError)
            }
        }
    }

    private fun MediaSource.closeUnloadedSource() {
        when (this) {
            is MediaSource.Adapter -> adapter.close()
            is MediaSource.Composite -> {
                primary.closeUnloadedSource()
                audioTracks.forEach { it.source.closeUnloadedSource() }
                subtitleTracks.forEach { it.source.closeUnloadedSource() }
                variants.forEach { it.source.closeUnloadedSource() }
            }
            is MediaSource.BrowserFile,
            is MediaSource.BrowserMedia,
            is MediaSource.Drm,
            is MediaSource.Encrypted,
            is MediaSource.Url,
            -> Unit
        }
    }

    private suspend fun selectAdaptiveVideo(request: TrackSelectionRequest.Video): TrackSelectionOutcome {
        if (adaptiveVideoTracks.isEmpty()) return super.selectTrack(request)
        val targetId = request.trackId
        val target = targetId?.let { id -> adaptiveVideoTracks.firstOrNull { it.id == id } }
        if (targetId != null && target == null) {
            return notFoundOutcome(TrackKind.VIDEO, targetId, activeAdaptiveVideoTrack)
        }
        val activeBridge = bridge ?: return super.selectTrack(request)
        val applied =
            awaitAdaptiveSelection { onComplete, onError ->
                selectAdaptiveVariant(
                    bridge = activeBridge,
                    variantId = targetId ?: -1,
                    automatic = targetId == null,
                    onComplete = onComplete,
                    onError = onError,
                )
            }
        if (!applied) {
            return failedSelectionOutcome(
                kind = TrackKind.VIDEO,
                requestedTrackId = targetId,
                activeTrack = activeAdaptiveVideoTrack,
                message = "The adaptive engine did not confirm the quality change.",
            )
        }
        activeAdaptiveVideoTrack =
            if (targetId == null) adaptiveVideoTracks.firstOrNull { it.isDefault } else target
        return TrackSelectionOutcome(
            kind = TrackKind.VIDEO,
            status = if (targetId == null) TrackSelectionStatus.AUTO else TrackSelectionStatus.SELECTED,
            requestedTrackId = targetId,
            activeTrack = activeAdaptiveVideoTrack,
        )
    }

    private suspend fun selectAdaptiveAudio(request: TrackSelectionRequest.Audio): TrackSelectionOutcome {
        if (adaptiveAudioTracks.isEmpty()) return super.selectTrack(request)
        val target =
            request.trackId?.let { id -> adaptiveAudioTracks.firstOrNull { it.id == id } }
                ?: adaptiveAudioTracks.firstOrNull { it.isDefault }
                ?: adaptiveAudioTracks.firstOrNull()
        if (request.trackId != null && target == null) {
            return notFoundOutcome(TrackKind.AUDIO, request.trackId, activeAdaptiveAudioTrack)
        }
        val activeBridge = bridge ?: return super.selectTrack(request)
        val targetId = target?.id ?: return super.selectTrack(request)
        val applied =
            awaitAdaptiveSelection { onComplete, onError ->
                selectAdaptiveAudioTrack(
                    bridge = activeBridge,
                    trackId = targetId,
                    onComplete = onComplete,
                    onError = onError,
                )
            }
        if (!applied) {
            return failedSelectionOutcome(
                kind = TrackKind.AUDIO,
                requestedTrackId = request.trackId,
                activeTrack = activeAdaptiveAudioTrack,
                message = "The adaptive engine did not confirm the audio-track change.",
            )
        }
        activeAdaptiveAudioTrack = target
        return TrackSelectionOutcome(
            kind = TrackKind.AUDIO,
            status = if (request.trackId == null) TrackSelectionStatus.AUTO else TrackSelectionStatus.SELECTED,
            requestedTrackId = request.trackId,
            activeTrack = target,
        )
    }

    private suspend fun selectAdaptiveSubtitle(request: TrackSelectionRequest.Subtitle): TrackSelectionOutcome {
        if (adaptiveSubtitleTracks.isEmpty() && request.trackId != null) return super.selectTrack(request)
        val target = request.trackId?.let { id -> adaptiveSubtitleTracks.firstOrNull { it.id == id } }
        if (request.trackId != null && target == null) {
            return notFoundOutcome(TrackKind.SUBTITLE, request.trackId, activeAdaptiveSubtitleTrack)
        }
        val activeBridge = bridge ?: return super.selectTrack(request)
        val applied =
            awaitAdaptiveSelection { onComplete, onError ->
                selectAdaptiveTextTrack(
                    bridge = activeBridge,
                    trackId = target?.id ?: -1,
                    disabled = target == null,
                    onComplete = onComplete,
                    onError = onError,
                )
            }
        if (!applied) {
            return failedSelectionOutcome(
                kind = TrackKind.SUBTITLE,
                requestedTrackId = request.trackId,
                activeTrack = activeAdaptiveSubtitleTrack,
                message = "The adaptive engine did not confirm the subtitle-track change.",
            )
        }
        activeAdaptiveSubtitleTrack = target
        if (target == null) {
            observer.onSubtitleCues(emptyList())
        } else {
            prefetchSubtitleCues()
        }
        return TrackSelectionOutcome(
            kind = TrackKind.SUBTITLE,
            status = if (target == null) TrackSelectionStatus.DISABLED else TrackSelectionStatus.SELECTED,
            requestedTrackId = request.trackId,
            activeTrack = target,
        )
    }

    private suspend fun awaitAdaptiveSelection(
        start: (
            onComplete: (Boolean) -> Unit,
            onError: (String) -> Unit,
        ) -> Unit,
    ): Boolean {
        val deferred = CompletableDeferred<Boolean>()
        start(deferred::complete) { deferred.complete(false) }
        return deferred.await()
    }

    private fun notFoundOutcome(
        kind: TrackKind,
        requestedTrackId: Int,
        activeTrack: io.github.shusek.kmedia.engine.wasm.MediaTrack?,
    ): TrackSelectionOutcome =
        TrackSelectionOutcome(
            kind = kind,
            status = TrackSelectionStatus.NOT_FOUND,
            requestedTrackId = requestedTrackId,
            activeTrack = activeTrack,
        )

    private fun failedSelectionOutcome(
        kind: TrackKind,
        requestedTrackId: Int?,
        activeTrack: io.github.shusek.kmedia.engine.wasm.MediaTrack?,
        message: String,
    ): TrackSelectionOutcome =
        TrackSelectionOutcome(
            kind = kind,
            status = TrackSelectionStatus.FAILED,
            requestedTrackId = requestedTrackId,
            activeTrack = activeTrack,
            error =
                WasmMediaError(
                    WasmMediaErrorCategory.STATE,
                    WasmMediaErrorCode.INVALID_STATE,
                    message,
                ),
        )

    private fun updateAdaptiveTracks(
        rows: String,
        descriptor: VideoSourceDescriptor,
    ) {
        val tracks =
            rows.lineSequence()
                .filter(String::isNotBlank)
                .mapNotNull { row ->
                    val columns = row.split('\t', limit = 7)
                    val id = columns.getOrNull(0)?.toIntOrNull() ?: return@mapNotNull null
                    VideoTrack(
                        id = id,
                        codec = columns.getOrNull(4).orEmpty().ifBlank { descriptor.kind },
                        codecString = columns.getOrNull(4)?.ifBlank { null },
                        width = columns.getOrNull(1)?.toIntOrNull() ?: 0,
                        height = columns.getOrNull(2)?.toIntOrNull() ?: 0,
                        frameRate = 0.0,
                        bitRate = columns.getOrNull(3)?.toLongOrNull()?.takeIf { it > 0L },
                        label = columns.getOrNull(5)?.ifBlank { null },
                        isDefault = columns.getOrNull(6) == "true",
                    )
                }.toList()
        if (tracks.isEmpty()) return
        adaptiveVideoTracks = tracks
        activeAdaptiveVideoTrack = tracks.firstOrNull { it.isDefault } ?: tracks.firstOrNull()
        val previous = currentInfo ?: return
        val updated =
            previous.copy(
                tracks =
                    tracks +
                        previous.tracks.filterNot { it is VideoTrack },
            )
        currentInfo = updated
        observer.onMediaInfo(updated)
        publishDiagnostics(descriptor.kind)
    }

    private fun updateAdaptiveAudioTracks(rows: String) {
        val tracks =
            rows.lineSequence()
                .filter(String::isNotBlank)
                .mapNotNull { row ->
                    val columns = row.split('\t', limit = 9)
                    val id = columns.getOrNull(0)?.toIntOrNull() ?: return@mapNotNull null
                    AudioTrack(
                        id = id,
                        codec = columns.getOrNull(1).orEmpty().ifBlank { "browser" },
                        channels = columns.getOrNull(2)?.toIntOrNull() ?: 0,
                        sampleRate = columns.getOrNull(3)?.toIntOrNull() ?: 0,
                        bitRate = columns.getOrNull(4)?.toLongOrNull()?.takeIf { it > 0L },
                        language = columns.getOrNull(5)?.ifBlank { null },
                        label = columns.getOrNull(6)?.ifBlank { null },
                        isDefault = columns.getOrNull(7) == "true",
                    )
                }.toList()
        adaptiveAudioTracks = tracks
        activeAdaptiveAudioTrack =
            tracks.firstOrNull { it.isDefault }
                ?: activeAdaptiveAudioTrack?.let { active -> tracks.firstOrNull { it.id == active.id } }
                ?: tracks.firstOrNull()
        val previous = currentInfo ?: return
        val updated =
            previous.copy(
                tracks =
                    previous.tracks.filterNot { it is AudioTrack } +
                        tracks.ifEmpty {
                            listOf(
                                AudioTrack(
                                    id = 0,
                                    codec = "browser",
                                    channels = 0,
                                    sampleRate = 0,
                                    isDefault = true,
                                ),
                            )
                        },
            )
        currentInfo = updated
        observer.onMediaInfo(updated)
    }

    private fun updateAdaptiveSubtitleTracks(rows: String) {
        val tracks =
            rows.lineSequence()
                .filter(String::isNotBlank)
                .mapNotNull { row ->
                    val columns = row.split('\t', limit = 8)
                    val id = columns.getOrNull(0)?.toIntOrNull() ?: return@mapNotNull null
                    SubtitleTrack(
                        id = id,
                        codec = columns.getOrNull(1).orEmpty().ifBlank { "text" },
                        subtitleType = SubtitleType.TEXT,
                        language = columns.getOrNull(2)?.ifBlank { null },
                        label = columns.getOrNull(3)?.ifBlank { null },
                        isDefault = columns.getOrNull(4) == "true",
                        isForced = columns.getOrNull(5) == "true",
                    )
                }.toList()
        adaptiveSubtitleTracks = tracks
        activeAdaptiveSubtitleTrack =
            tracks.firstOrNull { it.isDefault }
                ?: activeAdaptiveSubtitleTrack?.let { active -> tracks.firstOrNull { it.id == active.id } }
        val previous = currentInfo ?: return
        val updated =
            previous.copy(
                tracks = previous.tracks.filterNot { it is SubtitleTrack } + tracks,
            )
        currentInfo = updated
        observer.onMediaInfo(updated)
    }

    private fun publishDiagnostics(container: String) {
        val controlled = controlledPipeline
        val sourceHdr = currentInfo?.videoTracks?.firstOrNull()?.isHdr == true
        observer.onDiagnostics(
            RenderingDiagnostics(
                backend = activeRenderingBackend,
                videoDecoderBackend = DecoderBackend.BROWSER_NATIVE,
                audioDecoderBackend = DecoderBackend.BROWSER_NATIVE,
                sourceMode =
                    if (container in ADAPTIVE_KINDS) SourceMode.ADAPTIVE else SourceMode.LOCAL,
                decoder = "browser",
                renderer = if (controlled == null) "HTMLVideoElement" else "WebGL2 native-video canvas",
                container = container,
                droppedFrames = controlled?.let(::mediaPipelineDroppedFrames)?.toLong() ?: 0,
                presentedFrames = controlled?.let(::mediaPipelinePresentedFrames)?.toLong() ?: 0,
                colorPipeline =
                    ColorPipelineDiagnostics(
                        sourceDynamicRange = if (sourceHdr) DynamicRange.HDR10 else DynamicRange.UNKNOWN,
                        outputDynamicRange =
                            when {
                                config.outputDynamicRangePolicy == OutputDynamicRangePolicy.FORCE_SDR ->
                                    DynamicRange.SDR
                                sourceHdr -> DynamicRange.HDR10
                                else -> DynamicRange.UNKNOWN
                            },
                        outputVerification =
                            when {
                                config.outputDynamicRangePolicy == OutputDynamicRangePolicy.FORCE_SDR &&
                                    controlled != null -> OutputVerification.CONFIRMED
                                sourceHdr -> OutputVerification.INFERRED
                                else -> OutputVerification.UNKNOWN
                            },
                        requestedColorSpace = if (sourceHdr) "display-p3" else "srgb",
                        appliedColorSpace = controlled?.let(::mediaPipelineOutputColorSpace),
                        toneMapping = requestedToneMapping,
                    ),
                liveWindow = liveWindow,
            ),
        )
    }

    private fun invalidState(): WasmMediaError =
        WasmMediaError(
            WasmMediaErrorCategory.STATE,
            WasmMediaErrorCode.INVALID_STATE,
            "The browser video backend is not loaded.",
        )

    private suspend fun CompletableDeferred<Unit>.awaitTracked() {
        pendingOperations += this
        try {
            await()
        } finally {
            pendingOperations -= this
        }
    }
}

private data class VideoSourceDescriptor(
    val kind: String,
    val sourceUrl: String,
    val mediaHeaders: Map<String, String>,
    val licenseServers: Map<String, String>,
    val licenseHeaders: Map<String, String>,
    val backend: RenderingBackend,
)

private fun MediaSource.primarySource(): MediaSource =
    if (this is MediaSource.Composite) primary else this

private fun MediaSource.browserMediaAdapterOrNull(): BrowserMediaSourceAdapter? =
    (primarySource() as? MediaSource.BrowserMedia)?.adapter

private fun MediaSource.toDescriptor(): VideoSourceDescriptor =
    when (this) {
        is MediaSource.Composite -> primary.toDescriptor()

        is MediaSource.Adapter ->
            throw WasmMediaError(
                WasmMediaErrorCategory.SOURCE,
                WasmMediaErrorCode.INVALID_SOURCE,
                "Custom source adapters require the demuxed playback backend.",
            )

        is MediaSource.Encrypted ->
            throw WasmMediaError(
                WasmMediaErrorCategory.SOURCE,
                WasmMediaErrorCode.INVALID_SOURCE,
                "Encrypted media requires the demuxed playback backend.",
            )

        is MediaSource.BrowserFile ->
            VideoSourceDescriptor(
                kind = file.name.substringAfterLast('.', "file").lowercase(),
                sourceUrl = "",
                mediaHeaders = emptyMap(),
                licenseServers = emptyMap(),
                licenseHeaders = emptyMap(),
                backend = RenderingBackend.NATIVE_VIDEO,
            )

        is MediaSource.BrowserMedia ->
            VideoSourceDescriptor(
                kind = adapter.mimeType?.substringBefore(';')?.trim()?.ifBlank { null } ?: "browser-media",
                sourceUrl = adapter.url,
                mediaHeaders = emptyMap(),
                licenseServers = emptyMap(),
                licenseHeaders = emptyMap(),
                backend = RenderingBackend.NATIVE_VIDEO,
            )

        is MediaSource.Drm ->
            VideoSourceDescriptor(
                kind = "drm",
                sourceUrl = mediaUrl,
                mediaHeaders = mediaHeaders,
                licenseServers = licenseServers,
                licenseHeaders = licenseHeaders,
                backend = RenderingBackend.SHAKA,
            )

        is MediaSource.Url -> {
            val dataMime =
                mimeType
                    ?.substringBefore(';')
                    ?.trim()
                    ?.lowercase()
                    ?: url
                        .takeIf { it.startsWith("data:", ignoreCase = true) }
                        ?.substringAfter("data:", "")
                        ?.substringBefore(';')
                        ?.lowercase()
            val clean = url.substringBefore('?').substringBefore('#').lowercase()
            when {
                dataMime in HLS_MIME_TYPES || clean.endsWith(".m3u8") ->
                    VideoSourceDescriptor(
                        kind = "hls",
                        sourceUrl = url,
                        mediaHeaders = headers,
                        licenseServers = emptyMap(),
                        licenseHeaders = emptyMap(),
                        backend = RenderingBackend.SHAKA,
                    )

                dataMime == "application/dash+xml" || clean.endsWith(".mpd") ->
                    VideoSourceDescriptor(
                        kind = "dash",
                        sourceUrl = url,
                        mediaHeaders = headers,
                        licenseServers = emptyMap(),
                        licenseHeaders = emptyMap(),
                        backend = RenderingBackend.SHAKA,
                    )

                clean.endsWith(".ism") ||
                    clean.endsWith(".isml") ||
                    clean.contains(".ism/manifest") ||
                    clean.contains(".isml/manifest") ->
                    VideoSourceDescriptor(
                        kind = "mss",
                        sourceUrl = url,
                        mediaHeaders = headers,
                        licenseServers = emptyMap(),
                        licenseHeaders = emptyMap(),
                        backend = RenderingBackend.SHAKA,
                    )

                else ->
                    VideoSourceDescriptor(
                        kind = clean.substringAfterLast('.', "video"),
                        sourceUrl = url,
                        mediaHeaders = headers,
                        licenseServers = emptyMap(),
                        licenseHeaders = emptyMap(),
                        backend = RenderingBackend.NATIVE_VIDEO,
                    )
            }
        }
    }

private val HLS_MIME_TYPES: Set<String> =
    setOf(
        "application/vnd.apple.mpegurl",
        "application/x-mpegurl",
        "audio/mpegurl",
        "audio/x-mpegurl",
    )

private val ADAPTIVE_KINDS: Set<String> = setOf("hls", "dash", "mss", "drm")

private fun String.toRenderingBackend(): RenderingBackend =
    when (lowercase()) {
        "native" -> RenderingBackend.NATIVE_VIDEO
        "hls" -> RenderingBackend.HLS_JS
        "dash" -> RenderingBackend.DASH_JS
        "shaka" -> RenderingBackend.SHAKA
        else -> RenderingBackend.UNKNOWN
    }

private fun Double.validSeconds(): Duration =
    if (isFinite() && this >= 0.0) seconds else Duration.ZERO

private fun String.toPlayerState(): WasmMediaPlayerState =
    when (this) {
        "playing" -> WasmMediaPlayerState.PLAYING
        "paused" -> WasmMediaPlayerState.PAUSED
        "seeking" -> WasmMediaPlayerState.SEEKING
        "buffering" -> WasmMediaPlayerState.BUFFERING
        "ended" -> WasmMediaPlayerState.ENDED
        "ready" -> WasmMediaPlayerState.READY
        else -> WasmMediaPlayerState.READY
    }

private fun Map<String, String>.toJsonObject(): String =
    entries.joinToString(prefix = "{", postfix = "}") { (key, value) ->
        "\"${key.escapeJson()}\":\"${value.escapeJson()}\""
    }

private fun String.escapeJson(): String =
    replace("\\", "\\\\")
        .replace("\"", "\\\"")
        .replace("\n", "\\n")
        .replace("\r", "\\r")

@Suppress("UNUSED_PARAMETER")
private fun configureNativeVideo(
    canvas: org.w3c.dom.HTMLCanvasElement,
    video: HTMLVideoElement,
): Unit =
    js(
        """
        {
            video.playsInline = true;
            video.preload = "auto";
            video.style.position = "absolute";
            video.style.inset = "0";
            video.style.width = "100%";
            video.style.height = "100%";
            video.style.objectFit = "contain";
            video.style.zIndex = "1";
            canvas.style.visibility = "hidden";
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun setNativeVideoCanvasMode(
    canvas: org.w3c.dom.HTMLCanvasElement,
    video: HTMLVideoElement,
    enabled: Boolean,
): Unit =
    js(
        """
        {
            canvas.style.visibility = enabled ? "visible" : "hidden";
            canvas.style.pointerEvents = "none";
            video.style.visibility = "visible";
            video.style.opacity = enabled ? "0" : "1";
            video.style.pointerEvents = "none";
            video.setAttribute("aria-hidden", enabled ? "true" : "false");
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun createObjectUrl(file: org.w3c.files.File): String = js("URL.createObjectURL(file)")

@Suppress("UNUSED_PARAMETER")
private fun revokeObjectUrl(url: String): Unit = js("URL.revokeObjectURL(url)")

@Suppress("UNUSED_PARAMETER")
private fun videoWidth(video: HTMLVideoElement): Int = js("Number(video.videoWidth || 0)")

@Suppress("UNUSED_PARAMETER")
private fun videoHeight(video: HTMLVideoElement): Int = js("Number(video.videoHeight || 0)")

@Suppress("UNUSED_PARAMETER", "LongParameterList")
private fun createVideoBridge(
    video: HTMLVideoElement,
    kind: String,
    sourceUrl: String,
    mediaHeadersJson: String,
    licenseServersJson: String,
    licenseHeadersJson: String,
    onReady: (Double) -> Unit,
    onState: (String) -> Unit,
    onTime: (Double) -> Unit,
    onBufferReset: () -> Unit,
    onBufferRange: (Double, Double, Boolean) -> Unit,
    onEnded: () -> Unit,
    onEngineChanged: (String) -> Unit,
    onAdaptiveTracks: (String) -> Unit,
    onAdaptiveAudioTracks: (String) -> Unit,
    onAdaptiveSubtitleTracks: (String) -> Unit,
    onLiveWindow: (Double, Double, Double, Boolean) -> Unit,
    onDemuxFallback: (String) -> Unit,
    onError: (String) -> Unit,
): JsAny =
    js(
        """
        (function() {
            const subscriptions = [];
            const bridge = {
                video: video,
                engine: null,
                engineKind: "native",
                destroyed: false,
                seekCallback: null,
                cleanup: function() {
                    subscriptions.forEach(function(dispose) { try { dispose(); } catch (_) {} });
                    subscriptions.length = 0;
                }
            };
            const listen = function(name, callback) {
                video.addEventListener(name, callback);
                subscriptions.push(function() { video.removeEventListener(name, callback); });
            };
            const parseHeaders = function(value) {
                try { return JSON.parse(value || "{}") || {}; } catch (_) { return {}; }
            };
            const mediaHeaders = parseHeaders(mediaHeadersJson);
            const licenseServers = parseHeaders(licenseServersJson);
            const licenseHeaders = parseHeaders(licenseHeadersJson);
            let readyReported = false;
            const reportError = function(error) {
                if (bridge.destroyed) return;
                const message = error && error.message ? error.message : String(error || "Playback failed.");
                onError(message);
            };
            const reportReady = function(durationSeconds) {
                if (bridge.destroyed || readyReported) return;
                const duration = Number(durationSeconds);
                if (!Number.isFinite(duration) || duration < 0) return;
                readyReported = true;
                onReady(duration);
            };
            const adaptiveDuration = function(engine) {
                if (Number.isFinite(video.duration) && video.duration >= 0) {
                    return Number(video.duration);
                }
                try {
                    if (engine && typeof engine.seekRange === "function") {
                        const range = engine.seekRange();
                        const start = Number(range && range.start || 0);
                        const end = Number(range && range.end || 0);
                        if (Number.isFinite(start) && Number.isFinite(end) && end >= start) {
                            return end - start;
                        }
                    }
                    if (engine && typeof engine.duration === "function") {
                        const duration = Number(engine.duration());
                        if (Number.isFinite(duration) && duration >= 0) return duration;
                    }
                    if (engine && typeof engine.getDuration === "function") {
                        const duration = Number(engine.getDuration());
                        if (Number.isFinite(duration) && duration >= 0) return duration;
                    }
                } catch (_) {}
                return null;
            };
            const reportAdaptiveReady = function(engine) {
                const duration = adaptiveDuration(engine);
                if (duration != null && duration > 0) reportReady(duration);
            };
            const reportBuffer = function() {
                if (bridge.destroyed) return;
                onBufferReset();
                const ranges = video.buffered;
                if (!ranges || ranges.length === 0) {
                    onBufferRange(0, 0, true);
                    return;
                }
                for (let index = 0; index < ranges.length; index++) {
                    onBufferRange(ranges.start(index), ranges.end(index), index === ranges.length - 1);
                }
            };
            const reportLive = function(engine) {
                const ranges = video.seekable;
                let isLive = !Number.isFinite(video.duration) || video.duration === Infinity;
                let start = 0;
                let end = 0;
                const activeEngine = engine || bridge.engine;
                try {
                    if (activeEngine && typeof activeEngine.isLive === "function") {
                        isLive = Boolean(activeEngine.isLive());
                    } else if (activeEngine && typeof activeEngine.isDynamic === "function") {
                        isLive = Boolean(activeEngine.isDynamic());
                    } else if (
                        activeEngine &&
                        activeEngine.latestLevelDetails &&
                        activeEngine.latestLevelDetails.live
                    ) {
                        isLive = true;
                    }
                    if (isLive && activeEngine && typeof activeEngine.seekRange === "function") {
                        const range = activeEngine.seekRange();
                        start = Number(range && range.start || 0);
                        end = Number(range && range.end || 0);
                    }
                } catch (_) {}
                if (isLive && end <= start && ranges && ranges.length > 0) {
                    const index = ranges.length - 1;
                    start = Number(ranges.start(index) || 0);
                    end = Number(ranges.end(index) || 0);
                }
                if (!isLive || end <= start) {
                    onLiveWindow(0, 0, 0, false);
                    return;
                }
                onLiveWindow(start, end, end, true);
            };
            const safeCell = value => String(value == null ? "" : value).replace(/[\t\r\n]/g, " ");
            const publishTracks = function(tracks) {
                const rows = (tracks || []).map(function(track) {
                    return [
                        Number(track.id),
                        Number(track.width || 0),
                        Number(track.height || 0),
                        Number(track.bandwidth || track.bitrate || 0),
                        safeCell(track.codecs || track.videoCodec || ""),
                        safeCell(track.label || (track.height ? track.height + "p" : "Auto")),
                        String(Boolean(track.active))
                    ].join("\t");
                });
                onAdaptiveTracks(rows.join("\n"));
            };
            const publishAudioTracks = function(tracks) {
                const rows = (tracks || []).map(function(track) {
                    return [
                        Number(track.id),
                        safeCell(track.codec || track.audioCodec || ""),
                        Number(track.channels || track.channelsCount || 0),
                        Number(track.sampleRate || track.audioSamplingRate || 0),
                        Number(track.bandwidth || track.bitrate || 0),
                        safeCell(track.language || track.lang || ""),
                        safeCell(track.label || track.name || track.language || ""),
                        String(Boolean(track.active)),
                        safeCell(track.role || "")
                    ].join("\t");
                });
                onAdaptiveAudioTracks(rows.join("\n"));
            };
            const publishSubtitleTracks = function(tracks) {
                const rows = (tracks || []).map(function(track) {
                    return [
                        Number(track.id),
                        safeCell(track.codec || track.mimeType || track.type || "text"),
                        safeCell(track.language || track.lang || ""),
                        safeCell(track.label || track.name || track.language || ""),
                        String(Boolean(track.active)),
                        String(Boolean(track.forced)),
                        safeCell(track.role || ""),
                        safeCell(track.kind || "")
                    ].join("\t");
                });
                onAdaptiveSubtitleTracks(rows.join("\n"));
            };
            bridge.publishTracks = publishTracks;
            bridge.publishAudioTracks = publishAudioTracks;
            bridge.publishSubtitleTracks = publishSubtitleTracks;
            listen("loadedmetadata", function() {
                reportReady(Number.isFinite(video.duration) ? video.duration : 0);
            });
            listen("durationchange", function() {
                if (video.readyState >= 1) {
                    reportReady(Number.isFinite(video.duration) ? video.duration : 0);
                }
            });
            listen("timeupdate", function() {
                onTime(Number(video.currentTime || 0));
                reportLive();
            });
            listen("progress", reportBuffer);
            listen("playing", function() { onState("playing"); });
            listen("pause", function() { if (!video.ended) onState("paused"); });
            listen("waiting", function() { onState("buffering"); });
            listen("seeking", function() { onState("seeking"); });
            listen("seeked", function() {
                onState(video.paused ? "paused" : "playing");
                const callback = bridge.seekCallback;
                bridge.seekCallback = null;
                if (callback) callback();
            });
            listen("ended", function() { onState("ended"); onEnded(); });
            listen("error", function() {
                const error = video.error;
                reportError(error ? "Browser media error " + error.code + "." : "Browser media playback failed.");
            });

            const attachNative = function() {
                bridge.engineKind = "native";
                onEngineChanged("native");
                video.src = sourceUrl;
                video.load();
            };
            const destroyEngine = async function() {
                const engine = bridge.engine;
                bridge.engine = null;
                if (!engine) return;
                try {
                    if (typeof engine.destroy === "function") await engine.destroy();
                    else if (typeof engine.reset === "function") engine.reset();
                } catch (_) {}
            };
            const startHlsFallback = function(reason) {
                destroyEngine().then(function() {
                import("hls.js")
                    .then(function(imported) {
                        if (bridge.destroyed) return;
                        const Hls = imported.default || imported.Hls || imported;
                        if (!Hls || !Hls.isSupported || !Hls.isSupported()) {
                            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                                attachNative();
                                return;
                            }
                            throw new Error("hls.js is unavailable in this browser.");
                        }
                        const engine = new Hls({
                            enableWorker: false,
                            xhrSetup: function(xhr) {
                                Object.keys(mediaHeaders).forEach(function(name) {
                                    xhr.setRequestHeader(name, mediaHeaders[name]);
                                });
                            }
                        });
                        bridge.engine = engine;
                        bridge.engineKind = "hls";
                        onEngineChanged("hls");
                        engine.on(Hls.Events.MANIFEST_PARSED, function(_, data) {
                            const levels = (data && data.levels ? data.levels : engine.levels || []).map(
                                (level, index) => ({
                                    id: index,
                                    width: level.width,
                                    height: level.height,
                                    bitrate: level.bitrate,
                                    codecs: level.videoCodec || level.codecSet || "",
                                    label: level.name || (level.height ? level.height + "p" : "Level " + index),
                                    active: engine.currentLevel === index
                                })
                            );
                            publishTracks(levels);
                            publishAudioTracks((engine.audioTracks || []).map((track, index) => ({
                                id: index,
                                codec: track.audioCodec || "",
                                channels: track.channels || 0,
                                language: track.lang || "",
                                label: track.name || track.lang || "Audio " + index,
                                active: Number(engine.audioTrack) === index
                            })));
                            publishSubtitleTracks((engine.subtitleTracks || []).map((track, index) => ({
                                id: index,
                                codec: track.type || "text/vtt",
                                language: track.lang || "",
                                label: track.name || track.lang || "Subtitle " + index,
                                forced: Boolean(track.forced),
                                active: Number(engine.subtitleTrack) === index
                            })));
                        });
                        if (Hls.Events.LEVEL_LOADED) {
                            engine.on(Hls.Events.LEVEL_LOADED, function(_, data) {
                                const details = data && data.details;
                                const duration = Number(details && details.totalduration);
                                if (Number.isFinite(duration) && duration > 0) reportReady(duration);
                                reportLive(engine);
                            });
                        }
                        engine.on(Hls.Events.LEVEL_SWITCHED, function(_, data) {
                            const current = Number(data && data.level);
                            publishTracks((engine.levels || []).map((level, index) => ({
                                id: index,
                                width: level.width,
                                height: level.height,
                                bitrate: level.bitrate,
                                codecs: level.videoCodec || "",
                                active: index === current
                            })));
                        });
                        if (Hls.Events.AUDIO_TRACKS_UPDATED) {
                            engine.on(Hls.Events.AUDIO_TRACKS_UPDATED, function() {
                                publishAudioTracks((engine.audioTracks || []).map((track, index) => ({
                                    id: index,
                                    codec: track.audioCodec || "",
                                    channels: track.channels || 0,
                                    language: track.lang || "",
                                    label: track.name || track.lang || "Audio " + index,
                                    active: Number(engine.audioTrack) === index
                                })));
                            });
                        }
                        if (Hls.Events.AUDIO_TRACK_SWITCHED) {
                            engine.on(Hls.Events.AUDIO_TRACK_SWITCHED, function(_, data) {
                                const current = Number(data && data.id);
                                publishAudioTracks((engine.audioTracks || []).map((track, index) => ({
                                    id: index,
                                    codec: track.audioCodec || "",
                                    channels: track.channels || 0,
                                    language: track.lang || "",
                                    label: track.name || track.lang || "Audio " + index,
                                    active: index === current
                                })));
                            });
                        }
                        if (Hls.Events.SUBTITLE_TRACKS_UPDATED) {
                            engine.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, function() {
                                publishSubtitleTracks((engine.subtitleTracks || []).map((track, index) => ({
                                    id: index,
                                    codec: track.type || "text/vtt",
                                    language: track.lang || "",
                                    label: track.name || track.lang || "Subtitle " + index,
                                    forced: Boolean(track.forced),
                                    active: Number(engine.subtitleTrack) === index
                                })));
                            });
                        }
                        if (Hls.Events.SUBTITLE_TRACK_SWITCH) {
                            engine.on(Hls.Events.SUBTITLE_TRACK_SWITCH, function(_, data) {
                                const current = Number(data && data.id);
                                publishSubtitleTracks((engine.subtitleTracks || []).map((track, index) => ({
                                    id: index,
                                    codec: track.type || "text/vtt",
                                    language: track.lang || "",
                                    label: track.name || track.lang || "Subtitle " + index,
                                    forced: Boolean(track.forced),
                                    active: index === current
                                })));
                            });
                        }
                        engine.on(Hls.Events.ERROR, function(_, data) {
                            if (data && data.fatal) {
                                onDemuxFallback(String(data.details || data.type || reason || "HLS MSE playback failed."));
                            }
                        });
                        engine.loadSource(sourceUrl);
                        engine.attachMedia(video);
                    })
                    .catch(function(error) {
                        onDemuxFallback(String(error && error.message ? error.message : error));
                    });
                });
            };
            const startDashFallback = function(reason) {
                destroyEngine().then(function() {
                import("dashjs")
                    .then(function(imported) {
                        if (bridge.destroyed) return;
                        const dash = imported.default || imported;
                        const factory = dash.MediaPlayer || imported.MediaPlayer;
                        if (typeof factory !== "function") throw new Error("dash.js is unavailable.");
                        const engine = factory().create();
                        bridge.engine = engine;
                        bridge.engineKind = "dash";
                        onEngineChanged("dash");
                        if (engine.extend && Object.keys(mediaHeaders).length > 0) {
                            engine.extend("RequestModifier", function() {
                                return {
                                    modifyRequestHeader: function(xhr) {
                                        Object.keys(mediaHeaders).forEach(function(name) {
                                            xhr.setRequestHeader(name, mediaHeaders[name]);
                                        });
                                        return xhr;
                                    },
                                    modifyRequestURL: function(url) { return url; }
                                };
                            }, true);
                        }
                        const events = dash.MediaPlayer && dash.MediaPlayer.events
                            ? dash.MediaPlayer.events
                            : imported.MediaPlayer && imported.MediaPlayer.events
                                ? imported.MediaPlayer.events
                                : {};
                        const publishDash = function() {
                            const qualities =
                                typeof engine.getBitrateInfoListFor === "function"
                                    ? engine.getBitrateInfoListFor("video") || []
                                    : [];
                            const current =
                                typeof engine.getQualityFor === "function"
                                    ? Number(engine.getQualityFor("video"))
                                    : -1;
                            publishTracks(qualities.map((quality, index) => ({
                                id: index,
                                width: quality.width,
                                height: quality.height,
                                bitrate: quality.bitrate,
                                codecs: quality.codec || "",
                                active: index === current
                            })));
                            const audioTracks =
                                typeof engine.getTracksFor === "function"
                                    ? engine.getTracksFor("audio") || []
                                    : [];
                            const currentAudio =
                                typeof engine.getCurrentTrackFor === "function"
                                    ? engine.getCurrentTrackFor("audio")
                                    : null;
                            bridge.dashAudioTracks = audioTracks;
                            publishAudioTracks(audioTracks.map((track, index) => ({
                                id: index,
                                codec: track.codec || track.mimeType || "",
                                channels: track.channels || 0,
                                sampleRate: track.samplingRate || 0,
                                bitrate: track.bitrate || 0,
                                language: track.lang || "",
                                label: track.labels && track.labels.length
                                    ? track.labels[0].text
                                    : track.lang || "Audio " + index,
                                active: track === currentAudio ||
                                    (currentAudio && track.id != null && track.id === currentAudio.id)
                            })));
                            const textTracks =
                                typeof engine.getTracksFor === "function"
                                    ? engine.getTracksFor("text") || []
                                    : [];
                            const currentText =
                                typeof engine.getCurrentTrackFor === "function"
                                    ? engine.getCurrentTrackFor("text")
                                    : null;
                            bridge.dashTextTracks = textTracks;
                            publishSubtitleTracks(textTracks.map((track, index) => ({
                                id: index,
                                codec: track.codec || track.mimeType || "text",
                                language: track.lang || "",
                                label: track.labels && track.labels.length
                                    ? track.labels[0].text
                                    : track.lang || "Subtitle " + index,
                                forced: Boolean(track.isForced),
                                active: track === currentText ||
                                    (currentText && track.id != null && track.id === currentText.id)
                            })));
                            reportAdaptiveReady(engine);
                        };
                        if (engine.on) {
                            if (events.STREAM_INITIALIZED) engine.on(events.STREAM_INITIALIZED, publishDash);
                            if (events.QUALITY_CHANGE_RENDERED) engine.on(events.QUALITY_CHANGE_RENDERED, publishDash);
                            if (events.CURRENT_TRACK_CHANGED) engine.on(events.CURRENT_TRACK_CHANGED, publishDash);
                            if (events.ERROR) {
                                engine.on(events.ERROR, function(error) {
                                    if (error && (error.error || error.event)) {
                                        onDemuxFallback("dash.js could not decode the selected representation.");
                                    }
                                });
                            }
                        }
                        engine.initialize(video, sourceUrl, false);
                    })
                    .catch(function(error) {
                        onDemuxFallback(String(error && error.message ? error.message : error || reason));
                    });
                });
            };
            const startShaka = function() {
                import("shaka-player")
                    .then(function(imported) {
                        if (bridge.destroyed) return;
                        const shaka = imported.default || imported;
                        const Player = shaka.Player || imported.Player;
                        if (typeof Player !== "function") throw new Error("Shaka Player is unavailable.");
                        const engine = new Player();
                        bridge.engine = engine;
                        bridge.engineKind = "shaka";
                        onEngineChanged("shaka");
                        return Promise.resolve(engine.attach(video)).then(function() {
                            if (kind === "drm") {
                                const config = { drm: { servers: licenseServers } };
                                engine.configure(config);
                            }
                            const networking = engine.getNetworkingEngine && engine.getNetworkingEngine();
                            if (networking) {
                                networking.registerRequestFilter(function(type, request) {
                                    const isLicense = shaka.net &&
                                        shaka.net.NetworkingEngine &&
                                        type === shaka.net.NetworkingEngine.RequestType.LICENSE;
                                    const headers = isLicense ? licenseHeaders : mediaHeaders;
                                    request.headers = request.headers || {};
                                    Object.keys(headers).forEach(function(name) {
                                        request.headers[name] = headers[name];
                                    });
                                });
                            }
                            const publishShaka = function() {
                                const tracks =
                                    typeof engine.getVariantTracks === "function"
                                        ? engine.getVariantTracks()
                                        : [];
                                publishTracks(tracks.map(track => ({
                                    id: track.id,
                                    width: track.width,
                                    height: track.height,
                                    bandwidth: track.bandwidth,
                                    videoCodec: track.videoCodec,
                                    label: track.label,
                                    active: track.active
                                })));
                                const activeVariant = tracks.find(track => track.active);
                                let audioChoices = [];
                                if (typeof engine.getAudioLanguagesAndRoles === "function") {
                                    audioChoices = engine.getAudioLanguagesAndRoles() || [];
                                } else {
                                    const seen = new Set();
                                    tracks.forEach(function(track) {
                                        const roles = track.audioRoles || [];
                                        const role = roles.length ? roles[0] : "";
                                        const key = String(track.language || "") + "\u0000" + String(role);
                                        if (!seen.has(key)) {
                                            seen.add(key);
                                            audioChoices.push({ language: track.language || "", role: role });
                                        }
                                    });
                                }
                                bridge.shakaAudioChoices = audioChoices;
                                publishAudioTracks(audioChoices.map((choice, index) => ({
                                    id: index,
                                    codec: tracks.find(track =>
                                        String(track.language || "") === String(choice.language || "")
                                    )?.audioCodec || "",
                                    channels: tracks.find(track =>
                                        String(track.language || "") === String(choice.language || "")
                                    )?.channelsCount || 0,
                                    language: choice.language || "",
                                    role: choice.role || "",
                                    label: choice.label || choice.language ||
                                        (choice.role ? "Audio " + choice.role : "Audio " + index),
                                    active: Boolean(activeVariant) &&
                                        String(activeVariant.language || "") === String(choice.language || "") &&
                                        (!(choice.role || "") ||
                                            (activeVariant.audioRoles || []).includes(choice.role))
                                })));
                                const textTracks =
                                    typeof engine.getTextTracks === "function"
                                        ? engine.getTextTracks() || []
                                        : [];
                                publishSubtitleTracks(textTracks.map(track => ({
                                    id: track.id,
                                    codec: track.mimeType || track.codecs || "text",
                                    language: track.language || "",
                                    label: track.label || track.language || "",
                                    role: track.roles && track.roles.length ? track.roles[0] : "",
                                    forced: Boolean(track.forced),
                                    active: Boolean(track.active)
                                })));
                                reportLive(engine);
                                if (tracks.length > 0) reportAdaptiveReady(engine);
                            };
                            if (engine.addEventListener) {
                                engine.addEventListener("variantchanged", publishShaka);
                                engine.addEventListener("trackschanged", publishShaka);
                                engine.addEventListener("adaptation", publishShaka);
                                engine.addEventListener("textchanged", publishShaka);
                                engine.addEventListener("texttrackvisibility", publishShaka);
                            }
                            return engine.load(sourceUrl).then(publishShaka);
                        });
                    })
                    .catch(function(error) {
                        if (kind === "hls") startHlsFallback(error && error.message);
                        else if (kind === "dash") startDashFallback(error && error.message);
                        else reportError(error);
                    });
            };
            if (kind === "hls" || kind === "dash" || kind === "drm" || kind === "mss") {
                startShaka();
            } else {
                attachNative();
            }
            return bridge;
        })()
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun playVideoBridge(
    bridge: JsAny,
    onPlayed: () -> Unit,
    onError: (String) -> Unit,
): Unit =
    js(
        """
        {
            Promise.resolve(bridge.video.play())
                .then(function() { onPlayed(); })
                .catch(function(error) {
                    onError(String(error && error.message ? error.message : error));
                });
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun pauseVideoBridge(bridge: JsAny): Unit = js("bridge.video.pause()")

@Suppress("UNUSED_PARAMETER")
private fun seekVideoBridge(
    bridge: JsAny,
    seconds: Double,
    onSeeked: () -> Unit,
    onError: (String) -> Unit,
): Unit =
    js(
        """
        {
            try {
                bridge.seekCallback = onSeeked;
                bridge.video.currentTime = Math.max(0, seconds);
                if (Math.abs(bridge.video.currentTime - seconds) < 0.001) {
                    const callback = bridge.seekCallback;
                    bridge.seekCallback = null;
                    if (callback) callback();
                }
            } catch (error) {
                bridge.seekCallback = null;
                onError(String(error && error.message ? error.message : error));
            }
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun setVideoBridgeVolume(
    bridge: JsAny,
    volume: Float,
): Unit = js("bridge.video.volume = Math.pow(Math.max(0, Math.min(1, volume)), 2)")

@Suppress("UNUSED_PARAMETER")
private fun setVideoBridgeMuted(
    bridge: JsAny,
    muted: Boolean,
): Unit = js("bridge.video.muted = muted")

@Suppress("UNUSED_PARAMETER")
private fun setVideoBridgeRate(
    bridge: JsAny,
    rate: Float,
): Unit =
    js(
        """
        {
            bridge.video.playbackRate = rate;
            if ("preservesPitch" in bridge.video) bridge.video.preservesPitch = true;
            if ("webkitPreservesPitch" in bridge.video) bridge.video.webkitPreservesPitch = true;
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun createNativeAudioGraph(video: HTMLVideoElement): JsAny =
    js(
        """
        (function() {
            const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
            if (!AudioContextClass) throw new Error("Web Audio is unavailable.");
            const context = new AudioContextClass({ latencyHint: "playback" });
            const source = context.createMediaElementSource(video);
            const compressor = context.createDynamicsCompressor();
            compressor.threshold.value = -24;
            compressor.knee.value = 18;
            compressor.ratio.value = 4;
            compressor.attack.value = 0.006;
            compressor.release.value = 0.22;
            const graph = { context, source, compressor, stable: false };
            source.connect(context.destination);
            return graph;
        })()
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun setNativeAudioGraphStableVolume(
    graph: JsAny,
    enabled: Boolean,
): Unit =
    js(
        """
        {
            try { graph.source.disconnect(); } catch (_) {}
            try { graph.compressor.disconnect(); } catch (_) {}
            graph.stable = Boolean(enabled);
            if (graph.stable) {
                graph.source.connect(graph.compressor);
                graph.compressor.connect(graph.context.destination);
            } else {
                graph.source.connect(graph.context.destination);
            }
            if (graph.context.state === "suspended") {
                Promise.resolve(graph.context.resume()).catch(function() {});
            }
        }
        """,
    )

@Suppress("UNUSED_PARAMETER", "LongParameterList")
private fun setNativeAudioGraphSink(
    graph: JsAny,
    deviceId: String,
    onComplete: () -> Unit,
    onError: (String) -> Unit,
): Unit =
    js(
        """
        {
            if (!graph.context || typeof graph.context.setSinkId !== "function") {
                if (!deviceId || deviceId === "default") onComplete();
                else onError("AudioContext.setSinkId is unavailable in this browser.");
                return;
            }
            Promise.resolve(graph.context.setSinkId(deviceId || "default"))
                .then(function() { onComplete(); })
                .catch(function(error) {
                    onError(String(error && error.message ? error.message : error));
                });
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun destroyNativeAudioGraph(graph: JsAny): Unit =
    js(
        """
        {
            try { graph.source.disconnect(); } catch (_) {}
            try { graph.compressor.disconnect(); } catch (_) {}
            try { graph.context.close(); } catch (_) {}
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun setVideoFitMode(
    video: HTMLVideoElement,
    fitMode: String,
): Unit = js("video.style.objectFit = fitMode")

@Suppress("UNUSED_PARAMETER")
private fun setNativeVideoVisibility(
    video: HTMLVideoElement,
    visible: Boolean,
): Unit = js("video.style.visibility = visible ? 'visible' : 'hidden'")

@Suppress("UNUSED_PARAMETER")
private fun setNativeVideoRotation(
    video: HTMLVideoElement,
    rotationDegrees: Int,
): Unit =
    js(
        """
        {
            const normalized = ((rotationDegrees % 360) + 360) % 360;
            video.style.transform = "rotate(" + normalized + "deg)";
            video.style.transformOrigin = "center center";
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun nativeVideoCurrentTime(video: HTMLVideoElement): Double =
    js("Number(video.currentTime || 0)")

@Suppress("UNUSED_PARAMETER")
private fun setNativeVideoSink(
    video: HTMLVideoElement,
    deviceId: String,
    onComplete: () -> Unit,
    onError: (String) -> Unit,
): Unit =
    js(
        """
        {
            const setter = video.setSinkId;
            if (typeof setter !== "function") {
                if (!deviceId || deviceId === "default") {
                    onComplete();
                } else {
                    onError("Audio-output routing is not supported by this browser.");
                }
            } else {
                Promise.resolve(setter.call(video, deviceId || "default"))
                    .then(function() { onComplete(); })
                    .catch(function(error) {
                        onError(String(error && error.message ? error.message : error));
                    });
            }
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun snapshotNativeVideo(
    video: HTMLVideoElement,
    onComplete: (org.w3c.dom.ImageBitmap) -> Unit,
    onError: (String) -> Unit,
): Unit =
    js(
        """
        {
            if (!video.videoWidth || !video.videoHeight) {
                onError("No decoded video frame is currently available.");
            } else {
                Promise.resolve(createImageBitmap(video))
                    .then(function(image) { onComplete(image); })
                    .catch(function(error) {
                        onError(String(error && error.message ? error.message : error));
                    });
            }
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun setAdaptiveAudioOnly(
    bridge: JsAny,
    enabled: Boolean,
): Unit =
    js(
        """
        {
            const engine = bridge && bridge.engine;
            if (!engine) return;
            try {
                if (bridge.engineKind === "shaka" && typeof engine.configure === "function") {
                    engine.configure({
                        restrictions: enabled
                            ? { maxWidth: 1, maxHeight: 1 }
                            : { maxWidth: Infinity, maxHeight: Infinity }
                    });
                } else if (bridge.engineKind === "hls") {
                    const levels = Array.isArray(engine.levels) ? engine.levels : [];
                    const audioOnlyLevel = levels.findIndex(function(level) {
                        return !level.videoCodec && !Number(level.width || 0) && !Number(level.height || 0);
                    });
                    if (enabled && audioOnlyLevel >= 0) {
                        engine.currentLevel = audioOnlyLevel;
                        engine.nextLevel = audioOnlyLevel;
                    } else if (enabled) {
                        engine.autoLevelCapping = 0;
                    } else {
                        engine.autoLevelCapping = -1;
                        engine.currentLevel = -1;
                    }
                }
            } catch (_) {}
        }
        """,
    )

@Suppress("UNUSED_PARAMETER", "LongParameterList")
private fun selectAdaptiveVariant(
    bridge: JsAny,
    variantId: Int,
    automatic: Boolean,
    onComplete: (Boolean) -> Unit,
    onError: (String) -> Unit,
): Unit =
    js(
        """
        {
            const engine = bridge && bridge.engine;
            if (!engine) {
                onError("The adaptive engine is not ready.");
            } else {
                let settled = false;
                let timeout = 0;
                const finish = function(result) {
                    if (settled) return;
                    settled = true;
                    if (timeout) clearTimeout(timeout);
                    onComplete(Boolean(result));
                };
                const fail = function(error) {
                    if (settled) return;
                    settled = true;
                    if (timeout) clearTimeout(timeout);
                    onError(String(error && error.message ? error.message : error));
                };
                timeout = setTimeout(function() {
                    try {
                        if (automatic) {
                            finish(true);
                        } else if (bridge.engineKind === "hls") {
                            finish(Number(engine.currentLevel) === variantId);
                        } else if (bridge.engineKind === "dash") {
                            finish(Number(engine.getQualityFor("video")) === variantId);
                        } else if (bridge.engineKind === "shaka") {
                            const active = (engine.getVariantTracks() || [])
                                .find(track => Number(track.id) === variantId);
                            finish(Boolean(active && active.active));
                        } else {
                            finish(false);
                        }
                    } catch (error) {
                        fail(error);
                    }
                }, 5000);
                try {
                    if (bridge.engineKind === "shaka") {
                        engine.configure({ abr: { enabled: Boolean(automatic) } });
                        if (automatic) {
                            finish(true);
                        } else {
                            const track = (engine.getVariantTracks() || [])
                                .find(candidate => Number(candidate.id) === variantId);
                            if (!track) {
                                finish(false);
                            } else {
                                const handler = function() {
                                    if (engine.removeEventListener) {
                                        engine.removeEventListener("variantchanged", handler);
                                    }
                                    const active = (engine.getVariantTracks() || [])
                                        .find(candidate => Number(candidate.id) === variantId);
                                    finish(Boolean(active && active.active));
                                };
                                if (engine.addEventListener) {
                                    engine.addEventListener("variantchanged", handler);
                                }
                                engine.selectVariantTrack(track, true);
                            }
                        }
                    } else if (bridge.engineKind === "hls") {
                        if (automatic) {
                            engine.currentLevel = -1;
                            finish(true);
                        } else if (!(engine.levels || [])[variantId]) {
                            finish(false);
                        } else {
                            const eventName =
                                engine.constructor &&
                                engine.constructor.Events &&
                                engine.constructor.Events.LEVEL_SWITCHED;
                            const handler = function(_, data) {
                                if (eventName && engine.off) engine.off(eventName, handler);
                                finish(Number(data && data.level) === variantId);
                            };
                            if (eventName && engine.on) engine.on(eventName, handler);
                            engine.currentLevel = variantId;
                        }
                    } else if (bridge.engineKind === "dash") {
                        if (automatic) {
                            engine.updateSettings({ streaming: { abr: { autoSwitchBitrate: { video: true } } } });
                            finish(true);
                        } else {
                            const available = engine.getBitrateInfoListFor("video") || [];
                            if (!available[variantId]) {
                                finish(false);
                            } else {
                                engine.updateSettings({
                                    streaming: { abr: { autoSwitchBitrate: { video: false } } }
                                });
                                engine.setQualityFor("video", variantId, true);
                            }
                        }
                    } else {
                        finish(false);
                    }
                } catch (error) {
                    fail(error);
                }
            }
        }
        """,
    )

@Suppress("UNUSED_PARAMETER", "LongParameterList")
private fun selectAdaptiveAudioTrack(
    bridge: JsAny,
    trackId: Int,
    onComplete: (Boolean) -> Unit,
    onError: (String) -> Unit,
): Unit =
    js(
        """
        {
            const engine = bridge && bridge.engine;
            if (!engine) {
                onError("The adaptive engine is not ready.");
            } else {
                let settled = false;
                let timeout = 0;
                const finish = function(result) {
                    if (settled) return;
                    settled = true;
                    if (timeout) clearTimeout(timeout);
                    onComplete(Boolean(result));
                };
                const fail = function(error) {
                    if (settled) return;
                    settled = true;
                    if (timeout) clearTimeout(timeout);
                    onError(String(error && error.message ? error.message : error));
                };
                const verify = function() {
                    try {
                        if (bridge.engineKind === "shaka") {
                            const choice = (bridge.shakaAudioChoices || [])[trackId];
                            const active = (engine.getVariantTracks() || []).find(track => track.active);
                            finish(Boolean(choice && active &&
                                String(active.language || "") === String(choice.language || "") &&
                                (!(choice.role || "") || (active.audioRoles || []).includes(choice.role))));
                        } else if (bridge.engineKind === "hls") {
                            finish(Number(engine.audioTrack) === trackId);
                        } else if (bridge.engineKind === "dash") {
                            const selected = (bridge.dashAudioTracks || [])[trackId];
                            const active = engine.getCurrentTrackFor("audio");
                            finish(Boolean(selected && active &&
                                (selected === active ||
                                    (selected.id != null && selected.id === active.id))));
                        } else {
                            finish(false);
                        }
                    } catch (error) {
                        fail(error);
                    }
                };
                timeout = setTimeout(verify, 5000);
                try {
                    if (bridge.engineKind === "shaka") {
                        const choice = (bridge.shakaAudioChoices || [])[trackId];
                        if (!choice) {
                            finish(false);
                        } else {
                            const handler = function() {
                                if (engine.removeEventListener) {
                                    engine.removeEventListener("variantchanged", handler);
                                }
                                verify();
                            };
                            if (engine.addEventListener) {
                                engine.addEventListener("variantchanged", handler);
                            }
                            engine.selectAudioLanguage(choice.language || "", choice.role || "");
                            setTimeout(verify, 0);
                        }
                    } else if (bridge.engineKind === "hls") {
                        if (!(engine.audioTracks || [])[trackId]) {
                            finish(false);
                        } else {
                            const events = engine.constructor && engine.constructor.Events;
                            const eventName = events && events.AUDIO_TRACK_SWITCHED;
                            const handler = function(_, data) {
                                if (eventName && engine.off) engine.off(eventName, handler);
                                finish(Number(data && data.id) === trackId);
                            };
                            if (eventName && engine.on) engine.on(eventName, handler);
                            engine.audioTrack = trackId;
                            setTimeout(verify, 0);
                        }
                    } else if (bridge.engineKind === "dash") {
                        const track = (bridge.dashAudioTracks || [])[trackId];
                        if (!track || typeof engine.setCurrentTrack !== "function") {
                            finish(false);
                        } else {
                            engine.setCurrentTrack(track);
                            setTimeout(verify, 0);
                        }
                    } else {
                        finish(false);
                    }
                } catch (error) {
                    fail(error);
                }
            }
        }
        """,
    )

@Suppress("UNUSED_PARAMETER", "LongParameterList")
private fun selectAdaptiveTextTrack(
    bridge: JsAny,
    trackId: Int,
    disabled: Boolean,
    onComplete: (Boolean) -> Unit,
    onError: (String) -> Unit,
): Unit =
    js(
        """
        {
            const engine = bridge && bridge.engine;
            if (!engine) {
                onError("The adaptive engine is not ready.");
            } else {
                let settled = false;
                let timeout = 0;
                const finish = function(result) {
                    if (settled) return;
                    settled = true;
                    if (timeout) clearTimeout(timeout);
                    onComplete(Boolean(result));
                };
                const fail = function(error) {
                    if (settled) return;
                    settled = true;
                    if (timeout) clearTimeout(timeout);
                    onError(String(error && error.message ? error.message : error));
                };
                const verify = function() {
                    try {
                        if (bridge.engineKind === "shaka") {
                            if (disabled) {
                                finish(!engine.isTextTrackVisible());
                            } else {
                                const active = (engine.getTextTracks() || [])
                                    .find(track => Number(track.id) === trackId);
                                finish(Boolean(active && active.active && engine.isTextTrackVisible()));
                            }
                        } else if (bridge.engineKind === "hls") {
                            finish(Number(engine.subtitleTrack) === (disabled ? -1 : trackId));
                        } else if (bridge.engineKind === "dash") {
                            if (disabled) {
                                const enabled = typeof engine.isTextEnabled === "function"
                                    ? engine.isTextEnabled()
                                    : false;
                                finish(!enabled);
                            } else {
                                const selected = (bridge.dashTextTracks || [])[trackId];
                                const active = engine.getCurrentTrackFor("text");
                                finish(Boolean(selected && active &&
                                    (selected === active ||
                                        (selected.id != null && selected.id === active.id))));
                            }
                        } else {
                            finish(false);
                        }
                    } catch (error) {
                        fail(error);
                    }
                };
                timeout = setTimeout(verify, 5000);
                try {
                    if (bridge.engineKind === "shaka") {
                        if (disabled) {
                            engine.setTextTrackVisibility(false);
                            setTimeout(verify, 0);
                        } else {
                            const track = (engine.getTextTracks() || [])
                                .find(candidate => Number(candidate.id) === trackId);
                            if (!track) {
                                finish(false);
                            } else {
                                const handler = function() {
                                    if (engine.removeEventListener) {
                                        engine.removeEventListener("textchanged", handler);
                                    }
                                    verify();
                                };
                                if (engine.addEventListener) {
                                    engine.addEventListener("textchanged", handler);
                                }
                                engine.selectTextTrack(track);
                                engine.setTextTrackVisibility(true);
                                setTimeout(verify, 0);
                            }
                        }
                    } else if (bridge.engineKind === "hls") {
                        if (!disabled && !(engine.subtitleTracks || [])[trackId]) {
                            finish(false);
                        } else {
                            const events = engine.constructor && engine.constructor.Events;
                            const eventName = events && events.SUBTITLE_TRACK_SWITCH;
                            const handler = function(_, data) {
                                if (eventName && engine.off) engine.off(eventName, handler);
                                finish(Number(data && data.id) === (disabled ? -1 : trackId));
                            };
                            if (eventName && engine.on) engine.on(eventName, handler);
                            engine.subtitleTrack = disabled ? -1 : trackId;
                            setTimeout(verify, 0);
                        }
                    } else if (bridge.engineKind === "dash") {
                        if (disabled) {
                            if (typeof engine.enableText === "function") engine.enableText(false);
                            setTimeout(verify, 0);
                        } else {
                            const track = (bridge.dashTextTracks || [])[trackId];
                            if (!track || typeof engine.setCurrentTrack !== "function") {
                                finish(false);
                            } else {
                                if (typeof engine.enableText === "function") engine.enableText(true);
                                engine.setCurrentTrack(track);
                                setTimeout(verify, 0);
                            }
                        }
                    } else {
                        finish(false);
                    }
                } catch (error) {
                    fail(error);
                }
            }
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun collectAdaptiveSubtitleCues(
    video: HTMLVideoElement,
    onComplete: (String) -> Unit,
    onError: (String) -> Unit,
): Unit =
    js(
        """
        {
            try {
                const rows = [];
                const safe = value => String(value == null ? "" : value).replace(/[\t\r\n]/g, " ");
                const tracks = video.textTracks || [];
                for (let trackIndex = 0; trackIndex < tracks.length; trackIndex++) {
                    const track = tracks[trackIndex];
                    if (track.mode === "disabled") continue;
                    const cues = track.cues || [];
                    for (let cueIndex = 0; cueIndex < cues.length; cueIndex++) {
                        const cue = cues[cueIndex];
                        rows.push([
                            Number(cue.startTime || 0),
                            Number(cue.endTime || 0),
                            safe(cue.text || cue.payload || "")
                        ].join("\t"));
                    }
                }
                onComplete(rows.join("\n"));
            } catch (error) {
                onError(String(error && error.message ? error.message : error));
            }
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun destroyVideoBridge(bridge: JsAny): Unit =
    js(
        """
        {
            if (bridge.destroyed) return;
            bridge.destroyed = true;
            bridge.cleanup();
            try {
                if (bridge.engine && typeof bridge.engine.destroy === "function") {
                    bridge.engine.destroy();
                } else if (bridge.engine && typeof bridge.engine.reset === "function") {
                    bridge.engine.reset();
                }
            } catch (_) {}
            bridge.video.pause();
            bridge.video.removeAttribute("src");
            bridge.video.load();
        }
        """,
    )
