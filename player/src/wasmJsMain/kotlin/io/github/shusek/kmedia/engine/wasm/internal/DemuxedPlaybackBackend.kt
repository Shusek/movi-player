@file:OptIn(ExperimentalWasmJsInterop::class)

package io.github.shusek.kmedia.engine.wasm.internal

import io.github.shusek.kmedia.engine.wasm.AudioTrack
import io.github.shusek.kmedia.engine.wasm.BufferedRange
import io.github.shusek.kmedia.engine.wasm.ColorPipelineDiagnostics
import io.github.shusek.kmedia.engine.wasm.DecoderBackend
import io.github.shusek.kmedia.engine.wasm.DecoderPreference
import io.github.shusek.kmedia.engine.wasm.Demuxer
import io.github.shusek.kmedia.engine.wasm.DynamicRange
import io.github.shusek.kmedia.engine.wasm.EmbeddedSubtitleRenderer
import io.github.shusek.kmedia.engine.wasm.EncryptedHttpSource
import io.github.shusek.kmedia.engine.wasm.ExternalAudioSource
import io.github.shusek.kmedia.engine.wasm.ExternalSubtitleSource
import io.github.shusek.kmedia.engine.wasm.FileSource
import io.github.shusek.kmedia.engine.wasm.FitMode
import io.github.shusek.kmedia.engine.wasm.HttpSource
import io.github.shusek.kmedia.engine.wasm.MediaInfo
import io.github.shusek.kmedia.engine.wasm.MediaSource
import io.github.shusek.kmedia.engine.wasm.MediaTrack
import io.github.shusek.kmedia.engine.wasm.WasmMediaError
import io.github.shusek.kmedia.engine.wasm.WasmMediaErrorCategory
import io.github.shusek.kmedia.engine.wasm.WasmMediaErrorCode
import io.github.shusek.kmedia.engine.wasm.WasmMediaPlayerConfig
import io.github.shusek.kmedia.engine.wasm.WasmMediaPlayerState
import io.github.shusek.kmedia.engine.wasm.Packet
import io.github.shusek.kmedia.engine.wasm.PlayerSurface
import io.github.shusek.kmedia.engine.wasm.ProjectionMode
import io.github.shusek.kmedia.engine.wasm.ProjectionConfiguration
import io.github.shusek.kmedia.engine.wasm.ProjectionStereoLayout
import io.github.shusek.kmedia.engine.wasm.RenderingBackend
import io.github.shusek.kmedia.engine.wasm.RenderingDiagnostics
import io.github.shusek.kmedia.engine.wasm.OutputVerification
import io.github.shusek.kmedia.engine.wasm.OutputDynamicRangePolicy
import io.github.shusek.kmedia.engine.wasm.ToneMappingMode
import io.github.shusek.kmedia.engine.wasm.SubtitleCue
import io.github.shusek.kmedia.engine.wasm.VideoSnapshot
import io.github.shusek.kmedia.engine.wasm.SubtitleFontAttachment
import io.github.shusek.kmedia.engine.wasm.SubtitlePacket
import io.github.shusek.kmedia.engine.wasm.SubtitleRendererConfiguration
import io.github.shusek.kmedia.engine.wasm.SubtitleTrack
import io.github.shusek.kmedia.engine.wasm.SourceAdapterListener
import io.github.shusek.kmedia.engine.wasm.TrackKind
import io.github.shusek.kmedia.engine.wasm.TrackSelectionOutcome
import io.github.shusek.kmedia.engine.wasm.TrackSelectionRequest
import io.github.shusek.kmedia.engine.wasm.TrackSelectionStatus
import io.github.shusek.kmedia.engine.wasm.VideoTrack
import io.github.shusek.kmedia.engine.wasm.QualityVariantSource
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.NonCancellable
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.cancelAndJoin
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import org.khronos.webgl.Int8Array
import org.khronos.webgl.toInt8Array
import org.w3c.dom.HTMLElement
import kotlin.js.ExperimentalWasmJsInterop
import kotlin.js.JsAny
import kotlin.js.js
import kotlin.math.max
import kotlin.math.roundToInt
import kotlin.time.Duration
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.Duration.Companion.seconds

internal class DemuxedPlaybackBackend(
    private val config: WasmMediaPlayerConfig,
    private val observer: BackendObserver,
) : PlayerBackend {
    private val scope: CoroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private val cleanupScope: CoroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private val demuxMutex: Mutex = Mutex()
    private var demuxer: Demuxer? = null
    private var mediaInfo: MediaInfo? = null
    private var pipeline: JsAny? = null
    private var pumpJob: Job? = null
    private var closed: Boolean = false
    private var playing: Boolean = false
    private var firstPlayPending: Boolean = true
    private var endOfInput: Boolean = false
    private var currentPosition: Duration = Duration.ZERO
    private var bufferedEnd: Duration = Duration.ZERO
    private var lastReportedBufferEnd: Duration = Duration.ZERO
    private var activeVideo: VideoTrack? = null
    private var activeAudio: AudioTrack? = null
    private var activeSubtitle: SubtitleTrack? = null
    private var subtitleRenderer: EmbeddedSubtitleRenderer? = null
    private var subtitleDelay: Duration = Duration.ZERO
    private var subtitleOverlay: HTMLElement? = null
    private var requestedVolume: Float = 1f
    private var requestedMuted: Boolean = false
    private var requestedRate: Float = 1f
    private var requestedFitMode: FitMode = FitMode.CONTAIN
    private var requestedStableVolume: Boolean = config.stableVolume
    private var requestedAudioOnly: Boolean = config.audioOnly
    private var requestedRotationDegrees: Int = config.initialRotationDegrees
    private var requestedProjection: ProjectionConfiguration = config.projection
    private var requestedToneMapping: ToneMappingMode =
        when (config.outputDynamicRangePolicy) {
            OutputDynamicRangePolicy.FORCE_SDR -> ToneMappingMode.SHADER
            OutputDynamicRangePolicy.PREFER_HDR,
            OutputDynamicRangePolicy.REQUIRE_HDR,
            -> ToneMappingMode.NATIVE
            OutputDynamicRangePolicy.AUTO -> config.toneMapping
        }
    private var videoDecoderBackend: DecoderBackend = DecoderBackend.NONE
    private var audioDecoderBackend: DecoderBackend = DecoderBackend.NONE
    private val hardwareVideoFailedTracks: MutableSet<Int> = mutableSetOf()
    private val softwareVideoTracks: MutableSet<Int> = mutableSetOf()
    private val softwareAudioTracks: MutableSet<Int> = mutableSetOf()
    private val pendingSoftwareAudio: MutableList<Packet> = mutableListOf()
    private var pendingSoftwareAudioBytes: Int = 0
    private var audioStretcher: NativeTimeStretcher? = null
    private var audioStretcherChannels: Int = 0
    private var audioStretcherSampleRate: Int = 0
    private var softwareVideoFailures: Int = 0
    private var softwareAudioFailures: Int = 0
    private var lastSoftwareVideoTimestampSeconds: Double = Double.NaN
    private var softwareVideoFrameIntervalSeconds: Double = 1.0 / 30.0
    private var recoveryJob: Job? = null
    private var recoveryGeneration: Int = 0
    private var lcevcSession: io.github.shusek.kmedia.engine.wasm.LcevcSession? = null
    private var packetsSinceDiagnostics: Int = 0
    private var demuxedPackets: Long = 0
    private var demuxSeekCount: Long = 0
    private var lastPacketTimestamp: Duration? = null
    private var lastPacketStreamIndex: Int? = null
    private var lastPacketBytes: Int = 0
    private val decodedSubtitleCues: MutableList<NativeSubtitleFrame> = mutableListOf()
    private var externalSubtitleCues: List<SubtitleCue> = emptyList()
    private val externalSubtitleSources: MutableMap<Int, ExternalSubtitleSource> = mutableMapOf()
    private val externalAudioSources: MutableMap<Int, ExternalAudioSource> = mutableMapOf()
    private val qualityVariantSources: MutableMap<Int, QualityVariantSource> = mutableMapOf()
    private var renderedSubtitleKey: String? = null
    private var loadedSource: MediaSource? = null
    private var compositeSource: MediaSource.Composite? = null
    private var selectedQualityVariantId: Int? = null
    private var externalAudioDemuxer: Demuxer? = null
    private var externalAudioNativeTrack: AudioTrack? = null
    private var externalAudioPumpJob: Job? = null
    private var externalAudioEndOfInput: Boolean = false

    init {
        showCanvas(config.canvas)
        observer.onSurface(PlayerSurface.Canvas(config.canvas))
    }

    override suspend fun load(source: MediaSource) {
        check(!closed) { "The backend is closed." }
        if (demuxer != null || pipeline != null) releaseLoadedPlayback()
        resetDemuxDiagnostics(resetSeekCount = true)
        loadedSource = source
        compositeSource = source as? MediaSource.Composite
        if (compositeSource == null) selectedQualityVariantId = null
        val effectiveSource = if (source is MediaSource.Composite) source.primary else source
        val adapter =
            when (effectiveSource) {
                is MediaSource.BrowserFile -> FileSource(effectiveSource.file)
                is MediaSource.Url -> HttpSource(effectiveSource.url, effectiveSource.headers, config.cache)
                is MediaSource.Adapter -> effectiveSource.adapter
                is MediaSource.Encrypted -> EncryptedHttpSource(effectiveSource.config, config.cache)
                is MediaSource.BrowserMedia ->
                    throw WasmMediaError(
                        WasmMediaErrorCategory.SOURCE,
                        WasmMediaErrorCode.INVALID_SOURCE,
                        "Prepared browser media must use the browser media backend.",
                    )
                is MediaSource.Drm ->
                    throw WasmMediaError(
                        WasmMediaErrorCategory.DRM,
                        WasmMediaErrorCode.DRM_CONFIGURATION_FAILED,
                        "DRM sources must use the browser media backend.",
                    )
                is MediaSource.Composite -> error("Nested composite media sources are not supported.")
            }
        adapter.setListener(
            object : SourceAdapterListener {
                override fun onSourceModeChanged(mode: io.github.shusek.kmedia.engine.wasm.SourceMode) {
                    observer.onSourceModeChanged(mode)
                    if (pipeline != null) publishDiagnostics()
                }

                override fun onFileAccessRevoked(
                    offset: Long,
                    length: Int,
                    reason: String,
                ) {
                    observer.onFileAccessRevoked(offset, length, reason)
                }

                override fun onStatisticsChanged(
                    cache: io.github.shusek.kmedia.engine.wasm.CacheStats,
                    network: io.github.shusek.kmedia.engine.wasm.NetworkStats,
                ) {
                    if (pipeline != null) publishDiagnostics()
                }
            },
        )
        val createdDemuxer = Demuxer(adapter, config.runtime)
        demuxer = createdDemuxer
        val nativeInfo =
            demuxMutex.withLock {
                createdDemuxer.open()
            }
        if (createdDemuxer.supportsRandomAccess) {
            // avformat_find_stream_info may inspect an MP4's tail (for example
            // a non-faststart moov atom) and leave queued/probe packets there.
            // Rewind before READY so the preload pump never interprets a tail
            // packet as a fully buffered movie. The first-play rewind remains
            // as a second guard for poster/preload read-ahead.
            demuxMutex.withLock {
                createdDemuxer.seek(Duration.ZERO)
            }
            demuxSeekCount += 1
        }
        val info = enrichCompositeMediaInfo(nativeInfo, source as? MediaSource.Composite)
        if (closed) throw CancellationException("The backend was closed while loading.")
        mediaInfo = info
        activeVideo =
            if (requestedAudioOnly) {
                null
            } else {
                info.videoTracks.firstOrNull {
                    it.id < QUALITY_VARIANT_TRACK_BASE && it.isDefault && !it.isAttachedPicture
                } ?: info.videoTracks.firstOrNull {
                    it.id < QUALITY_VARIANT_TRACK_BASE && !it.isAttachedPicture
                }
            }
        if (
            config.outputDynamicRangePolicy == OutputDynamicRangePolicy.REQUIRE_HDR &&
            activeVideo?.isHdr != true
        ) {
            throw outputRequirementError("The selected video track is not HDR.")
        }
        activeAudio = info.audioTracks.firstOrNull { it.isDefault } ?: info.audioTracks.firstOrNull()
        activeAudio
            ?.let { externalAudioSources[it.id] }
            ?.let { prepareExternalAudio(it) }
        activeSubtitle = info.subtitleTracks.firstOrNull { it.isDefault && it.id in externalSubtitleSources }
        externalSubtitleCues =
            activeSubtitle
                ?.let { externalSubtitleSources[it.id] }
                ?.let { loadExternalSubtitleCues(it) }
                .orEmpty()
        if (externalSubtitleCues.isNotEmpty()) observer.onSubtitleCues(externalSubtitleCues)
        applyStreamDiscard()

        val createdPipeline =
            createMediaPipeline(
                canvas = config.canvas,
                stableVolume = requestedStableVolume,
                onTime = { seconds ->
                    if (closed) return@createMediaPipeline
                    currentPosition = seconds.safeSeconds()
                    observer.onTime(currentPosition)
                    renderNativeSubtitleAt(currentPosition)
                },
                onState = { state ->
                    if (!closed) observer.onState(state.toWasmMediaState())
                },
                onEnded = {
                    if (!closed) {
                        playing = false
                        publishDiagnostics()
                        observer.onEnded()
                    }
                },
                onDecoderError = { kind, message ->
                    if (!closed) recoverDecoder(kind, message)
                },
                onError = { message ->
                    if (!closed) observer.onError(renderError(message))
                },
            )
        pipeline = createdPipeline
        configurePipeline()
        applyPipelineSettings(createdPipeline)
        applyVisualSettings(createdPipeline)
        if (
            config.outputDynamicRangePolicy == OutputDynamicRangePolicy.REQUIRE_HDR &&
            !mediaPipelineHasConfirmedHdrOutput(createdPipeline)
        ) {
            throw outputRequirementError("A verified HDR canvas output is unavailable in this browser.")
        }
        publishCoverArt(createdDemuxer)
        config.lcevcAdapter?.let { adapter ->
            lcevcSession =
                runCatching { adapter.attach(PlayerSurface.Canvas(config.canvas)) }
                    .onFailure { error ->
                        config.logger.log(
                            io.github.shusek.kmedia.engine.wasm.WasmMediaLogLevel.WARN,
                            "lcevc",
                            io.github.shusek.kmedia.engine.wasm.redactSensitiveText(
                                error.message ?: "The optional LCEVC adapter failed to attach.",
                            ),
                        )
                    }.getOrNull()
            lcevcSession?.setEnabled(true)
        }

        observer.onDuration(info.duration)
        observer.onMediaInfo(info)
        publishDiagnostics()
        observer.onState(WasmMediaPlayerState.READY)
        firstPlayPending = true
        startPump()
    }

    override suspend fun play() {
        val activePipeline = pipeline ?: throw invalidState()
        if (firstPlayPending) {
            firstPlayPending = false
            // Opening/probing a large seekable file can leave FFmpeg's physical
            // cursor well ahead of the requested media time (notably MP4 files
            // whose metadata lives near the tail). The preload pump is allowed
            // to inspect that data while READY, but the first real play must
            // always realign the demuxer with the media clock. This mirrors the
            // original engine's first-play seek and prevents a permanent black
            // frame when probing reached EOF before any frame was submitted.
            if (currentPosition <= FIRST_PLAY_REWIND_THRESHOLD) {
                seek(Duration.ZERO)
            }
        }
        val deferred = CompletableDeferred<Unit>()
        playMediaPipeline(
            pipeline = activePipeline,
            onComplete = { deferred.complete(Unit) },
            onError = { message -> deferred.completeExceptionally(decodeError(message)) },
        )
        deferred.await()
        playing = true
        observer.onState(
            if (mediaPipelineIsBuffering(activePipeline)) {
                WasmMediaPlayerState.BUFFERING
            } else {
                WasmMediaPlayerState.PLAYING
            },
        )
        if (pumpJob?.isActive != true && !endOfInput) startPump()
    }

    override fun pause() {
        playing = false
        pipeline?.let(::pauseMediaPipeline)
        observer.onState(WasmMediaPlayerState.PAUSED)
    }

    override suspend fun seek(position: Duration) {
        val activeDemuxer = demuxer ?: throw invalidState()
        val activePipeline = pipeline ?: throw invalidState()
        val safePosition = position.coerceIn(Duration.ZERO, mediaInfo?.duration ?: position)
        val resume = playing
        playing = false
        pauseMediaPipeline(activePipeline)
        pumpJob?.cancelAndJoin()
        externalAudioPumpJob?.cancelAndJoin()
        externalAudioPumpJob = null
        flushPendingSoftwareAudio()
        demuxMutex.withLock {
            activeDemuxer.seek(safePosition)
        }
        demuxSeekCount += 1
        resetDemuxDiagnostics(resetSeekCount = false)
        externalAudioDemuxer?.let { externalDemuxer ->
            val externalTrack = externalAudioNativeTrack
            if (externalTrack != null) {
                externalDemuxer.seek(safePosition, streamIndex = externalTrack.id)
                externalDemuxer.flushDecoder(externalTrack.id)
            }
        }
        currentPosition = safePosition
        bufferedEnd = safePosition
        lastReportedBufferEnd = safePosition
        endOfInput = false
        externalAudioEndOfInput = false
        flushNativeDecoders()
        configurePipeline()
        setMediaPipelinePosition(activePipeline, safePosition.inWholeMilliseconds / 1_000.0)
        observer.onTime(safePosition)
        observer.onBuffered(emptyList())
        subtitleRenderer?.clear()
        if (activeSubtitle != null) configureSubtitleRenderer()
        startPump()
        if (resume) play()
    }

    override suspend fun selectTrack(request: TrackSelectionRequest): TrackSelectionOutcome {
        val info = mediaInfo ?: return notReadyOutcome(request)
        val previous =
            when (request.kind) {
                TrackKind.VIDEO -> activeTrack(TrackKind.VIDEO)
                TrackKind.AUDIO -> activeAudio
                TrackKind.SUBTITLE -> activeSubtitle
            }
        if (request is TrackSelectionRequest.Video) {
            val composite = compositeSource
            val requestedVariant = request.trackId?.let(qualityVariantSources::get)
            if (requestedVariant != null && composite != null) {
                return switchQualityVariant(
                    trackId = requireNotNull(request.trackId),
                    source = requestedVariant.source,
                    status = TrackSelectionStatus.SELECTED,
                )
            }
            if (request.trackId == null && selectedQualityVariantId != null && composite != null) {
                return switchQualityVariant(
                    trackId = null,
                    source = composite.primary,
                    status = TrackSelectionStatus.AUTO,
                )
            }
        }
        val target: MediaTrack? =
            when (request) {
                is TrackSelectionRequest.Video ->
                    request.trackId?.let { id -> info.videoTracks.firstOrNull { it.id == id } }
                        ?: info.videoTracks.firstOrNull { it.isDefault }
                        ?: info.videoTracks.firstOrNull()
                is TrackSelectionRequest.Audio ->
                    request.trackId?.let { id -> info.audioTracks.firstOrNull { it.id == id } }
                        ?: info.audioTracks.firstOrNull { it.isDefault }
                        ?: info.audioTracks.firstOrNull()
                is TrackSelectionRequest.Subtitle ->
                    request.trackId?.let { id -> info.subtitleTracks.firstOrNull { it.id == id } }
            }
        val requestedId = request.requestedTrackId()
        if (requestedId != null && target == null) {
            return TrackSelectionOutcome(
                kind = request.kind,
                status = TrackSelectionStatus.NOT_FOUND,
                requestedTrackId = requestedId,
                activeTrack = previous,
            )
        }
        if (target == previous) {
            return TrackSelectionOutcome(
                kind = request.kind,
                status = TrackSelectionStatus.UNCHANGED,
                requestedTrackId = requestedId,
                activeTrack = previous,
            )
        }

        if (request.kind == TrackKind.SUBTITLE) {
            val externalSource = (target as? SubtitleTrack)?.let { externalSubtitleSources[it.id] }
            if (externalSource != null) {
                val cues =
                    try {
                        loadExternalSubtitleCues(externalSource)
                    } catch (error: Throwable) {
                        return TrackSelectionOutcome(
                            kind = TrackKind.SUBTITLE,
                            status = TrackSelectionStatus.FAILED,
                            requestedTrackId = requestedId,
                            activeTrack = previous,
                            error = error.toDecoderError(),
                        )
                    }
                activeSubtitle = target
                externalSubtitleCues = cues
                decodedSubtitleCues.clear()
                renderedSubtitleKey = null
                subtitleRenderer?.clear()
                applyStreamDiscard()
                observer.onSubtitleCues(cues)
                renderNativeSubtitleAt(currentPosition)
                return TrackSelectionOutcome(
                    kind = TrackKind.SUBTITLE,
                    status = TrackSelectionStatus.SELECTED,
                    requestedTrackId = requestedId,
                    activeTrack = target,
                )
            }
            externalSubtitleCues = emptyList()
            observer.onSubtitleCues(emptyList())
        }
        if (request.kind == TrackKind.AUDIO) {
            val externalSource = (target as? AudioTrack)?.let { externalAudioSources[it.id] }
            try {
                if (externalSource != null) {
                    prepareExternalAudio(externalSource)
                } else {
                    closeExternalAudio()
                }
            } catch (error: Throwable) {
                return TrackSelectionOutcome(
                    kind = TrackKind.AUDIO,
                    status = TrackSelectionStatus.FAILED,
                    requestedTrackId = requestedId,
                    activeTrack = previous,
                    error =
                        error as? WasmMediaError
                            ?: WasmMediaError(
                                WasmMediaErrorCategory.DECODER,
                                WasmMediaErrorCode.UNSUPPORTED_CODEC,
                                error.message ?: "The external audio source could not be opened.",
                                error,
                            ),
                )
            }
        }

        when (target) {
            is VideoTrack -> activeVideo = target
            is AudioTrack -> activeAudio = target
            is SubtitleTrack -> activeSubtitle = target
            null ->
                when (request.kind) {
                    TrackKind.VIDEO -> activeVideo = null
                    TrackKind.AUDIO -> activeAudio = null
                    TrackKind.SUBTITLE -> activeSubtitle = null
                }
        }
        applyStreamDiscard()
        restartAtCurrentPosition()
        return TrackSelectionOutcome(
            kind = request.kind,
            status =
                when {
                    target == null -> TrackSelectionStatus.DISABLED
                    requestedId == null -> TrackSelectionStatus.AUTO
                    else -> TrackSelectionStatus.SELECTED
                },
            requestedTrackId = requestedId,
            activeTrack = target,
        )
    }

    override fun activeTrack(kind: TrackKind): MediaTrack? =
        when (kind) {
            TrackKind.VIDEO ->
                selectedQualityVariantId
                    ?.let { selectedId -> mediaInfo?.videoTracks?.firstOrNull { it.id == selectedId } }
                    ?: activeVideo
            TrackKind.AUDIO -> activeAudio
            TrackKind.SUBTITLE -> activeSubtitle
        }

    override fun setVolume(volume: Float) {
        requestedVolume = volume.coerceIn(0f, 1f)
        pipeline?.let { setMediaPipelineVolume(it, requestedVolume) }
    }

    override fun setMuted(muted: Boolean) {
        requestedMuted = muted
        pipeline?.let { setMediaPipelineMuted(it, muted) }
    }

    override fun setPlaybackRate(rate: Float) {
        requestedRate = rate.coerceIn(0.25f, 4f)
        pipeline?.let { setMediaPipelineRate(it, requestedRate) }
        if (requestedRate != 1f && audioDecoderBackend == DecoderBackend.WEB_CODECS) {
            activeAudio?.id?.let(softwareAudioTracks::add)
            scheduleDecoderRecovery()
        }
    }

    override fun setFitMode(fitMode: FitMode) {
        requestedFitMode = fitMode
        pipeline?.let { setMediaPipelineFitMode(it, fitMode.name.lowercase()) }
    }

    override fun setStableVolume(enabled: Boolean) {
        requestedStableVolume = enabled
        pipeline?.let { setMediaPipelineStableVolume(it, enabled) }
    }

    override suspend fun setAudioOnly(enabled: Boolean) {
        if (requestedAudioOnly == enabled) return
        requestedAudioOnly = enabled
        val info = mediaInfo ?: return
        activeVideo =
            if (enabled) {
                null
            } else {
                info.videoTracks.firstOrNull { it.isDefault && !it.isAttachedPicture }
                    ?: info.videoTracks.firstOrNull { !it.isAttachedPicture }
            }
        applyStreamDiscard()
        restartAtCurrentPosition()
    }

    override fun setRotation(rotationDegrees: Int) {
        require(rotationDegrees % 90 == 0) { "rotationDegrees must be a multiple of 90." }
        requestedRotationDegrees = rotationDegrees
        pipeline?.let(::applyVisualSettings)
    }

    override fun setProjection(configuration: ProjectionConfiguration) {
        requestedProjection = configuration
        pipeline?.let(::applyVisualSettings)
    }

    override fun setToneMapping(mode: ToneMappingMode) {
        requestedToneMapping =
            when (config.outputDynamicRangePolicy) {
                OutputDynamicRangePolicy.FORCE_SDR -> ToneMappingMode.SHADER
                OutputDynamicRangePolicy.PREFER_HDR,
                OutputDynamicRangePolicy.REQUIRE_HDR,
                -> ToneMappingMode.NATIVE
                OutputDynamicRangePolicy.AUTO -> mode
            }
        pipeline?.let(::applyVisualSettings)
        publishDiagnostics()
    }

    override suspend fun setAudioOutput(deviceId: String?) {
        val activePipeline = pipeline ?: throw invalidState()
        val deferred = CompletableDeferred<Unit>()
        setMediaPipelineSinkId(
            pipeline = activePipeline,
            sinkId = deviceId ?: "",
            onComplete = { deferred.complete(Unit) },
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
        deferred.await()
    }

    override suspend fun snapshot(): VideoSnapshot {
        val activePipeline = pipeline ?: throw invalidState()
        val deferred = CompletableDeferred<org.w3c.dom.ImageBitmap>()
        captureMediaPipelineSnapshot(
            pipeline = activePipeline,
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
            timestamp = currentPosition,
            width = imageBitmapWidth(image),
            height = imageBitmapHeight(image),
        )
    }

    override suspend fun thumbnail(position: Duration): VideoSnapshot {
        val source = loadedSource ?: throw invalidState()
        return generateIsolatedThumbnail(
            source = source,
            runtime = config.runtime,
            position = position,
            maximumWidth = config.softwareDecode.maximumVideoWidth,
            rotationDegrees = requestedRotationDegrees,
        )
    }

    override suspend fun prefetchSubtitleCues(): List<SubtitleCue> {
        val activeDemuxer = demuxer ?: throw invalidState()
        val track = activeSubtitle ?: return emptyList()
        if (track.id in externalSubtitleSources) {
            observer.onSubtitleCues(externalSubtitleCues)
            return externalSubtitleCues
        }
        val native =
            demuxMutex.withLock {
                activeDemuxer.prefetchSubtitleCues(track.id)
            }
        val cues =
            native.mapNotNull { cue ->
                cue.text?.let { text ->
                    SubtitleCue(
                        start = cue.startSeconds.safeSeconds(),
                        end = cue.endSeconds.safeSeconds(),
                        text = text,
                    )
                }
            }
        observer.onSubtitleCues(cues)
        return cues
    }

    override fun setEmbeddedSubtitleRenderer(
        renderer: EmbeddedSubtitleRenderer?,
        delay: Duration,
    ) {
        subtitleRenderer?.clear()
        subtitleRenderer = renderer
        subtitleDelay = delay
        renderer?.setDelay(delay)
        if (renderer != null && activeSubtitle != null) {
            scope.launch {
                runCatching { restartAtCurrentPosition() }
                    .onFailure { observer.onError(it.toRendererError()) }
            }
        }
    }

    private suspend fun switchQualityVariant(
        trackId: Int?,
        source: MediaSource,
        status: TrackSelectionStatus,
    ): TrackSelectionOutcome {
        val definition = compositeSource ?: return notReadyOutcome(TrackSelectionRequest.Video(trackId))
        val previousSelection = selectedQualityVariantId
        val resumePosition = currentPosition
        val resumePlayback = playing
        selectedQualityVariantId = trackId
        val replacement =
            MediaSource.Composite(
                primary = source.freshForReload(),
                audioTracks = definition.audioTracks,
                subtitleTracks = definition.subtitleTracks,
                variants = definition.variants,
            )
        return try {
            load(replacement)
            compositeSource = definition
            if (resumePosition > Duration.ZERO) seek(resumePosition)
            if (resumePlayback) play()
            val confirmed = activeTrack(TrackKind.VIDEO)
            TrackSelectionOutcome(
                kind = TrackKind.VIDEO,
                status = status,
                requestedTrackId = trackId,
                activeTrack = confirmed,
            )
        } catch (error: Throwable) {
            selectedQualityVariantId = previousSelection
            compositeSource = definition
            TrackSelectionOutcome(
                kind = TrackKind.VIDEO,
                status = TrackSelectionStatus.FAILED,
                requestedTrackId = trackId,
                activeTrack = activeTrack(TrackKind.VIDEO),
                error =
                    error as? WasmMediaError
                        ?: WasmMediaError(
                            WasmMediaErrorCategory.SOURCE,
                            WasmMediaErrorCode.SOURCE_UNAVAILABLE,
                            error.message ?: "The premuxed quality source could not be opened.",
                            error,
                        ),
            )
        }
    }

    private suspend fun prepareExternalAudio(source: ExternalAudioSource) {
        closeExternalAudio()
        val adapter = source.source.toIndependentAdapter(config.cache)
        val created = Demuxer(adapter, config.runtime)
        try {
            val info = created.open()
            val track =
                info.audioTracks.firstOrNull { it.isDefault }
                    ?: info.audioTracks.firstOrNull()
                    ?: throw WasmMediaError(
                        WasmMediaErrorCategory.FORMAT,
                        WasmMediaErrorCode.UNSUPPORTED_FORMAT,
                        "The external audio source contains no audio track.",
                    )
            info.tracks.forEach { candidate ->
                created.setStreamDiscard(candidate.id, candidate.id != track.id)
            }
            if (created.enableDecoder(track.id) < 0) {
                throw unsupportedCodec("audio", track.codec)
            }
            created.enableAudioDownmix(config.softwareDecode.downmixToStereo)
            if (currentPosition > Duration.ZERO) {
                created.seek(currentPosition, streamIndex = track.id)
                created.flushDecoder(track.id)
            }
            externalAudioDemuxer = created
            externalAudioNativeTrack = track
            externalAudioEndOfInput = false
        } catch (error: Throwable) {
            created.closeAndAwait()
            throw error
        }
    }

    private suspend fun closeExternalAudio() {
        externalAudioPumpJob?.cancelAndJoin()
        externalAudioPumpJob = null
        externalAudioDemuxer?.closeAndAwait()
        externalAudioDemuxer = null
        externalAudioNativeTrack = null
        externalAudioEndOfInput = false
    }

    private suspend fun releaseLoadedPlayback() {
        playing = false
        recoveryJob?.cancelAndJoin()
        recoveryJob = null
        pumpJob?.cancelAndJoin()
        pumpJob = null
        closeExternalAudio()
        pipeline?.let(::destroyMediaPipeline)
        pipeline = null
        val closingDemuxer = demuxer
        demuxer = null
        demuxMutex.withLock {
            closingDemuxer?.closeAndAwait()
        }
        audioStretcher?.close()
        audioStretcher = null
        audioStretcherChannels = 0
        audioStretcherSampleRate = 0
        pendingSoftwareAudio.clear()
        pendingSoftwareAudioBytes = 0
        decodedSubtitleCues.clear()
        externalSubtitleCues = emptyList()
        renderedSubtitleKey = null
        subtitleOverlay?.let(::clearNativeSubtitleOverlay)
        lcevcSession?.close()
        lcevcSession = null
        mediaInfo = null
        firstPlayPending = true
        endOfInput = false
        bufferedEnd = Duration.ZERO
        lastReportedBufferEnd = Duration.ZERO
    }

    override fun close() {
        if (closed) return
        closed = true
        playing = false
        val closingPump = pumpJob
        val closingDemuxer = demuxer
        val closingExternalPump = externalAudioPumpJob
        val closingExternalDemuxer = externalAudioDemuxer
        recoveryJob?.cancel()
        recoveryJob = null
        closingPump?.cancel()
        closingExternalPump?.cancel()
        pumpJob = null
        externalAudioPumpJob = null
        scope.cancel()
        pipeline?.let(::destroyMediaPipeline)
        pipeline = null
        demuxer = null
        externalAudioDemuxer = null
        externalAudioNativeTrack = null
        externalAudioEndOfInput = false
        loadedSource = null
        audioStretcher?.close()
        audioStretcher = null
        audioStretcherChannels = 0
        audioStretcherSampleRate = 0
        pendingSoftwareAudio.clear()
        externalSubtitleCues = emptyList()
        externalSubtitleSources.clear()
        externalAudioSources.clear()
        qualityVariantSources.clear()
        lcevcSession?.close()
        lcevcSession = null
        subtitleRenderer?.clear()
        subtitleRenderer = null
        subtitleOverlay?.let(::removeSubtitleOverlay)
        subtitleOverlay = null
        cleanupScope.launch {
            closingPump?.cancelAndJoin()
            closingExternalPump?.cancelAndJoin()
            closingExternalDemuxer?.closeAndAwait()
            demuxMutex.withLock {
                closingDemuxer?.closeAndAwait()
            }
        }
    }

    private suspend fun configurePipeline() {
        val activePipeline = pipeline ?: throw invalidState()
        val activeDemuxer = demuxer ?: throw invalidState()
        val video = activeVideo
        val audio = activeAudio
        val externalAudioActive = audio?.id in externalAudioSources
        val decodingAudio = if (externalAudioActive) externalAudioNativeTrack else audio
        val audioDemuxer = if (externalAudioActive) externalAudioDemuxer else activeDemuxer
        val videoDescription = video?.let { activeDemuxer.getExtradata(it.id) }
        val audioDescription = decodingAudio?.let { track -> audioDemuxer?.getExtradata(track.id) }
        val videoCodec = video?.webCodecsCodec(videoDescription)
        val audioCodec = decodingAudio?.webCodecsCodec()
        val requestWebVideo =
            video != null &&
                config.decoderPreference == DecoderPreference.AUTO &&
                video.id !in softwareVideoTracks &&
                videoCodec != null
        val requestWebAudio =
            decodingAudio != null &&
                !externalAudioActive &&
                config.decoderPreference == DecoderPreference.AUTO &&
                decodingAudio.id !in softwareAudioTracks &&
                !decodingAudio.requiresSoftwareDecoder() &&
                requestedRate == 1f &&
                audioCodec != null

        val deferred = CompletableDeferred<Pair<String, String>>()
        configureMediaPipeline(
            pipeline = activePipeline,
            requestWebVideo = requestWebVideo,
            preferHardwareVideo = video?.id !in hardwareVideoFailedTracks,
            videoCodec = videoCodec ?: video?.codec.orEmpty(),
            videoFallbackCodecs = video?.webCodecsFallbacks().orEmpty(),
            videoWidth = video?.width ?: 0,
            videoHeight = video?.height ?: 0,
            videoDescription = videoDescription?.toInt8Array(),
            colorPrimaries = video?.colorPrimaries.orEmpty(),
            colorTransfer = video?.colorTransfer.orEmpty(),
            colorMatrix = video?.colorMatrix.orEmpty(),
            requestWebAudio = requestWebAudio,
            audioCodec = audioCodec ?: decodingAudio?.codec.orEmpty(),
            audioSampleRate = decodingAudio?.sampleRate ?: 0,
            audioChannels = decodingAudio?.channels ?: 0,
            audioDescription = audioDescription?.toInt8Array(),
            duration = mediaInfo?.duration?.inWholeMilliseconds?.div(1_000.0) ?: 0.0,
            onComplete = { videoMode, audioMode -> deferred.complete(videoMode to audioMode) },
            onError = { message -> deferred.completeExceptionally(decodeError(message)) },
        )
        val (videoMode, audioMode) = deferred.await()
        videoDecoderBackend = videoMode.toDecoderBackend()
        audioDecoderBackend =
            if (externalAudioActive && decodingAudio != null) {
                DecoderBackend.SOFTWARE_WASM
            } else {
                audioMode.toDecoderBackend()
            }

        if (video != null && videoDecoderBackend == DecoderBackend.SOFTWARE_WASM) {
            if (activeDemuxer.enableDecoder(video.id, videoDescription) < 0) {
                throw unsupportedCodec("video", video.codec)
            }
            softwareVideoTracks += video.id
        }
        if (decodingAudio != null && audioDecoderBackend == DecoderBackend.SOFTWARE_WASM) {
            if (!externalAudioActive && activeDemuxer.enableDecoder(decodingAudio.id, audioDescription) < 0) {
                throw unsupportedCodec("audio", decodingAudio.codec)
            }
            audioDemuxer?.enableAudioDownmix(config.softwareDecode.downmixToStereo)
            softwareAudioTracks += decodingAudio.id
            audioStretcher?.close()
            audioStretcher =
                if (requestedRate == 1f) {
                    null
                } else {
                    audioDemuxer?.createTimeStretcher(
                        channels =
                            if (config.softwareDecode.downmixToStereo) {
                                decodingAudio.channels.coerceAtMost(2)
                            } else {
                                decodingAudio.channels
                            },
                        sampleRate = decodingAudio.sampleRate,
                    )
                }
            audioStretcherChannels =
                if (audioStretcher == null) {
                    0
                } else if (config.softwareDecode.downmixToStereo) {
                    decodingAudio.channels.coerceAtMost(2)
                } else {
                    decodingAudio.channels
                }
            audioStretcherSampleRate = if (audioStretcher == null) 0 else decodingAudio.sampleRate
        } else {
            audioStretcher?.close()
            audioStretcher = null
            audioStretcherChannels = 0
            audioStretcherSampleRate = 0
        }
        activeSubtitle
            ?.takeIf { subtitleRenderer == null && it.id !in externalSubtitleSources }
            ?.let { subtitle ->
            if (activeDemuxer.enableDecoder(subtitle.id) < 0) {
                throw unsupportedCodec("subtitle", subtitle.codec)
            }
        }
        pendingSoftwareAudio.clear()
        pendingSoftwareAudioBytes = 0
        softwareVideoFailures = 0
        softwareAudioFailures = 0
        resetSoftwareVideoTimeline()
        applyVisualSettings(activePipeline)
        publishDiagnostics()
    }

    private suspend fun configureSubtitleRenderer() {
        val renderer = subtitleRenderer ?: return
        val track = activeSubtitle?.takeIf { it.id !in externalSubtitleSources }
        if (track == null) {
            renderer.clear()
            return
        }
        val info = mediaInfo ?: return
        val activeDemuxer = demuxer ?: return
        val video = activeVideo
        val overlay =
            subtitleOverlay
                ?: createSubtitleOverlay(config.canvas).also { subtitleOverlay = it }
        val attachments =
            activeDemuxer.getAttachments().map { attachment ->
                SubtitleFontAttachment(
                    name = attachment.name,
                    mimeType = attachment.mimeType,
                    data = attachment.data,
                )
            }
        renderer.configure(
            configuration =
                SubtitleRendererConfiguration(
                    codec = track.codec,
                    codecPrivate = activeDemuxer.getExtradata(track.id),
                    width = video?.width ?: 0,
                    height = video?.height ?: 0,
                    attachments = attachments,
                ),
            overlay = overlay,
        )
        renderer.setDelay(subtitleDelay)
        if (info.subtitleTracks.none { it.id == track.id }) renderer.clear()
    }

    private fun startPump() {
        pumpJob?.cancel()
        pumpJob =
            scope.launch {
                try {
                    pumpPackets()
                } catch (cancelled: CancellationException) {
                    throw cancelled
                } catch (error: Throwable) {
                    if (!closed) observer.onError(error.toDecoderError())
                }
            }
        startExternalAudioPump()
    }

    private fun startExternalAudioPump() {
        externalAudioPumpJob?.cancel()
        val activeExternalDemuxer = externalAudioDemuxer ?: return
        val track = externalAudioNativeTrack ?: return
        if (activeAudio?.id !in externalAudioSources) return
        externalAudioPumpJob =
            scope.launch {
                val pending = mutableListOf<NativeAudioPacket>()
                var pendingBytes = 0
                try {
                    while (currentCoroutineContext().isActive && !closed && !externalAudioEndOfInput) {
                        val audioAhead = pipeline?.let(::mediaPipelineAudioAheadSeconds) ?: 0.0
                        if (audioAhead > EXTERNAL_AUDIO_BUFFER_AHEAD_SECONDS) {
                            delay(PUMP_BACKOFF_MILLIS)
                            continue
                        }
                        val packet =
                            withContext(NonCancellable) {
                                activeExternalDemuxer.readPacket()
                            }
                        if (packet == null) {
                            decodeExternalAudioBatch(activeExternalDemuxer, track, pending)
                            pending.clear()
                            externalAudioEndOfInput = true
                            maybeSignalMediaPipelineEndOfInput()
                            break
                        }
                        if (packet.streamIndex != track.id) continue
                        pending +=
                            NativeAudioPacket(
                                data = packet.data,
                                ptsSeconds = packet.presentationTime.inWholeMilliseconds / 1_000.0,
                            )
                        pendingBytes += packet.data.size
                        if (
                            pending.size >= SOFTWARE_AUDIO_BATCH_PACKETS ||
                            pendingBytes >= SOFTWARE_AUDIO_BATCH_BYTES
                        ) {
                            decodeExternalAudioBatch(activeExternalDemuxer, track, pending)
                            pending.clear()
                            pendingBytes = 0
                        }
                        delay(PUMP_YIELD_MILLIS)
                    }
                } catch (cancelled: CancellationException) {
                    throw cancelled
                } catch (error: Throwable) {
                    if (!closed) observer.onError(error.toDecoderError())
                }
            }
    }

    private fun decodeExternalAudioBatch(
        activeExternalDemuxer: Demuxer,
        track: AudioTrack,
        packets: List<NativeAudioPacket>,
    ) {
        var cursor = 0
        while (cursor < packets.size) {
            val (consumed, frame) =
                activeExternalDemuxer.decodeAudioBatch(track.id, packets.subList(cursor, packets.size))
            if (consumed > 0) {
                frame?.let(::pushPcmFrame)
                cursor += consumed
                continue
            }
            packets.subList(cursor, packets.size).forEach { packet ->
                var sent =
                    activeExternalDemuxer.sendPacket(
                        streamIndex = track.id,
                        data = packet.data,
                        ptsSeconds = packet.ptsSeconds,
                        dtsSeconds = packet.ptsSeconds,
                        keyframe = true,
                    )
                if (sent < 0) {
                    drainExternalAudioFrames(activeExternalDemuxer, track, packet.ptsSeconds)
                    sent =
                        activeExternalDemuxer.sendPacket(
                            streamIndex = track.id,
                            data = packet.data,
                            ptsSeconds = packet.ptsSeconds,
                            dtsSeconds = packet.ptsSeconds,
                            keyframe = true,
                        )
                }
                if (sent < 0) throw decoderExhausted("audio", track.codec, sent)
                drainExternalAudioFrames(activeExternalDemuxer, track, packet.ptsSeconds)
            }
            return
        }
    }

    private fun drainExternalAudioFrames(
        activeExternalDemuxer: Demuxer,
        track: AudioTrack,
        ptsSeconds: Double,
    ) {
        while (activeExternalDemuxer.receiveFrame(track.id) == 0) {
            activeExternalDemuxer
                .decodedAudioFrame(
                    streamIndex = track.id,
                    fallbackPtsSeconds = ptsSeconds,
                )?.let(::pushPcmFrame)
        }
    }

    private suspend fun pumpPackets() {
        val activeDemuxer = demuxer ?: return
        var workSliceStarted = browserMonotonicMilliseconds()
        while (currentCoroutineContext().isActive && !closed && !endOfInput) {
            val ahead = bufferedEnd - currentPosition
            val activePipeline = pipeline
            val queueSize = activePipeline?.let(::mediaPipelineDecodeQueueSize) ?: 0
            val audioAhead = activePipeline?.let(::mediaPipelineAudioAheadSeconds) ?: 0.0
            val queueLimit = adaptiveDecodeQueueLimit()
            val audioHungry = activeAudio != null && audioAhead < AUDIO_PRIORITY_SECONDS
            val bufferLimit =
                if (audioHungry) {
                    HUNGRY_AUDIO_BUFFER_AHEAD
                } else {
                    adaptiveBufferAhead()
                }
            val overloaded = queueSize > queueLimit
            if (videoDecoderBackend == DecoderBackend.SOFTWARE_WASM) {
                activeVideo?.let { activeDemuxer.setSkipFrame(it.id, overloaded) }
            }
            if (ahead > bufferLimit || (overloaded && !audioHungry)) {
                delay(PUMP_BACKOFF_MILLIS)
                workSliceStarted = browserMonotonicMilliseconds()
                continue
            }
            val packet =
                demuxMutex.withLock {
                    // Emscripten Asyncify calls cannot be interrupted safely. Let the current
                    // native read unwind before a seek re-enters the same runtime.
                    withContext(NonCancellable) {
                        activeDemuxer.readPacket()
                    }
                }
            if (packet == null) {
                flushPendingSoftwareAudio()
                flushSoftwareVideoAtEndOfInput(activeDemuxer)
                endOfInput = true
                maybeSignalMediaPipelineEndOfInput()
                publishDiagnostics()
                return
            }
            demuxedPackets += 1
            lastPacketTimestamp = packet.presentationTime
            lastPacketStreamIndex = packet.streamIndex
            lastPacketBytes = packet.data.size
            val advancesPlaybackBuffer =
                packetContributesToPlaybackBuffer(
                    packetStreamIndex = packet.streamIndex,
                    activeVideoStreamIndex = activeVideo?.id,
                    activeAudioStreamIndex = activeAudio?.id,
                    activeAudioIsExternal = activeAudio?.id in externalAudioSources,
                )
            if (advancesPlaybackBuffer) {
                bufferedEnd = maxOf(bufferedEnd, packet.presentationTime + packet.duration)
            }
            dispatchPacket(packet)
            packetsSinceDiagnostics += 1
            if (demuxedPackets == 1L) publishDiagnostics()
            if (packetsSinceDiagnostics >= DIAGNOSTICS_PACKET_INTERVAL) {
                packetsSinceDiagnostics = 0
                publishDiagnostics()
            }
            if (
                advancesPlaybackBuffer &&
                bufferedEnd - lastReportedBufferEnd >= BUFFER_REPORT_STEP
            ) {
                lastReportedBufferEnd = bufferedEnd
                observer.onBuffered(
                    listOf(normalizedPlaybackBufferedRange(currentPosition, bufferedEnd)),
                )
            }
            if (
                browserMonotonicMilliseconds() - workSliceStarted >=
                config.softwareDecode.workSliceMilliseconds
            ) {
                delay(PUMP_YIELD_MILLIS)
                workSliceStarted = browserMonotonicMilliseconds()
            }
        }
    }

    private suspend fun dispatchPacket(packet: Packet) {
        when (packet.streamIndex) {
            activeVideo?.id -> {
                when (videoDecoderBackend) {
                    DecoderBackend.WEB_CODECS ->
                        pipeline?.let { activePipeline ->
                            val overloaded = mediaPipelineDecodeQueueSize(activePipeline) > adaptiveDecodeQueueLimit()
                            pushMediaWebCodecsPacket(
                                pipeline = activePipeline,
                                kind = "video",
                                data = packet.data.toInt8Array(),
                                timestamp = packet.presentationTime.inWholeMilliseconds / 1_000.0,
                                duration = packet.duration.inWholeMilliseconds / 1_000.0,
                                keyframe = packet.isIdr || (packet.keyframe && !packet.isRasl),
                                drop = packet.isRasl || (overloaded && packet.disposable),
                            )
                        }
                    DecoderBackend.SOFTWARE_WASM -> decodeSoftwareVideo(packet)
                    else -> Unit
                }
            }
            activeAudio?.id ->
                when (audioDecoderBackend) {
                    DecoderBackend.WEB_CODECS ->
                        pipeline?.let { activePipeline ->
                            pushMediaWebCodecsPacket(
                                pipeline = activePipeline,
                                kind = "audio",
                                data = packet.data.toInt8Array(),
                                timestamp = packet.presentationTime.inWholeMilliseconds / 1_000.0,
                                duration = packet.duration.inWholeMilliseconds / 1_000.0,
                                keyframe = true,
                                drop = false,
                            )
                        }
                    DecoderBackend.SOFTWARE_WASM -> {
                        pendingSoftwareAudio += packet
                        pendingSoftwareAudioBytes += packet.data.size
                        val activePipeline = pipeline
                        val audioAhead =
                            activePipeline?.let(::mediaPipelineAudioAheadSeconds) ?: 0.0
                        val batchDuration = pendingSoftwareAudioDurationSeconds()
                        if (
                            pendingSoftwareAudio.size >= SOFTWARE_AUDIO_BATCH_PACKETS ||
                            pendingSoftwareAudioBytes >= SOFTWARE_AUDIO_BATCH_BYTES ||
                            batchDuration >= SOFTWARE_AUDIO_BATCH_SECONDS ||
                            (
                                audioAhead < AUDIO_PRIORITY_SECONDS &&
                                    batchDuration >= HUNGRY_SOFTWARE_AUDIO_BATCH_SECONDS
                            )
                        ) {
                            flushPendingSoftwareAudio()
                        }
                    }
                    else -> Unit
                }
            activeSubtitle?.id -> {
                dispatchSubtitle(packet)
            }
        }
    }

    private fun pendingSoftwareAudioDurationSeconds(): Double {
        val first = pendingSoftwareAudio.firstOrNull() ?: return 0.0
        val last = pendingSoftwareAudio.last()
        val start = first.presentationTime.inWholeMilliseconds / 1_000.0
        val end =
            (last.presentationTime + last.duration).inWholeMilliseconds / 1_000.0
        return (end - start).coerceAtLeast(0.0)
    }

    private fun decodeSoftwareVideo(packet: Packet) {
        if (packet.isRasl) return
        val activeDemuxer = demuxer ?: return
        val track = activeVideo ?: return
        val activePipeline = pipeline ?: return
        val packetSeconds = packet.presentationTime.inWholeMilliseconds / 1_000.0
        val overloaded = mediaPipelineDecodeQueueSize(activePipeline) > adaptiveDecodeQueueLimit()
        val lateToleranceSeconds =
            (3.0 / track.frameRate.coerceAtLeast(1.0)).coerceIn(
                MINIMUM_LATE_VIDEO_TOLERANCE_SECONDS,
                MAXIMUM_LATE_VIDEO_TOLERANCE_SECONDS,
            )
        val chronicallyLate =
            playing &&
                currentPosition.inWholeMilliseconds / 1_000.0 - packetSeconds >
                lateToleranceSeconds
        activeDemuxer.setSkipFrame(track.id, overloaded || chronicallyLate)
        if ((overloaded || chronicallyLate) && packet.disposable) return
        var sent =
            activeDemuxer.sendPacket(
                streamIndex = track.id,
                data = packet.data,
                ptsSeconds = packetSeconds,
                dtsSeconds = packet.decodeTime.inWholeMilliseconds / 1_000.0,
                keyframe = packet.keyframe,
            )
        if (sent < 0) {
            drainSoftwareVideoFrames(activeDemuxer, track.id, packetSeconds)
            sent =
                activeDemuxer.sendPacket(
                    streamIndex = track.id,
                    data = packet.data,
                    ptsSeconds = packetSeconds,
                    dtsSeconds = packet.decodeTime.inWholeMilliseconds / 1_000.0,
                    keyframe = packet.keyframe,
                )
        }
        if (sent < 0) {
            softwareVideoFailures += 1
            if (softwareVideoFailures >= MAX_CONSECUTIVE_SOFTWARE_FAILURES) {
                throw decoderExhausted("video", track.codec, sent)
            }
            return
        }
        softwareVideoFailures = 0
        drainSoftwareVideoFrames(activeDemuxer, track.id, packetSeconds)
    }

    private fun drainSoftwareVideoFrames(
        activeDemuxer: Demuxer,
        streamIndex: Int,
        fallbackTimestampSeconds: Double,
    ) {
        val activePipeline = pipeline ?: return
        val track = activeVideo ?: return
        while (activeDemuxer.receiveFrame(streamIndex) == 0) {
            val yuvFrame =
                activeDemuxer.decodedYuvVideoFrame(
                    streamIndex = streamIndex,
                    maximumWidth = config.softwareDecode.maximumVideoWidth,
                    pixelFormat = track.pixelFormat,
                )
            if (yuvFrame != null) {
                val timestamp =
                    normalizeSoftwareVideoTimestamp(
                        candidate =
                            yuvFrame.ptsSeconds.takeIf { it.isFinite() && it >= 0.0 }
                                ?: fallbackTimestampSeconds,
                        track = track,
                    )
                pushSoftwareYuvFrame(
                    pipeline = activePipeline,
                    y = yuvFrame.planes[0].toInt8Array(),
                    u = yuvFrame.planes[1].toInt8Array(),
                    v = (yuvFrame.planes.getOrNull(2) ?: ByteArray(0)).toInt8Array(),
                    width = yuvFrame.width,
                    height = yuvFrame.height,
                    lineY = yuvFrame.lineSizes[0],
                    lineU = yuvFrame.lineSizes[1],
                    lineV = yuvFrame.lineSizes.getOrNull(2) ?: 0,
                    format = yuvFrame.format,
                    matrix = track.colorMatrix.orEmpty(),
                    fullRange =
                        track.colorRange.orEmpty().contains("full", ignoreCase = true) ||
                            track.colorRange.orEmpty().contains("pc", ignoreCase = true),
                    timestamp = timestamp,
                )
                continue
            }
            val frame =
                activeDemuxer.decodedVideoFrame(
                    streamIndex = streamIndex,
                    maximumWidth = config.softwareDecode.maximumVideoWidth,
                ) ?: continue
            val timestamp =
                normalizeSoftwareVideoTimestamp(
                    candidate =
                        frame.ptsSeconds.takeIf { it.isFinite() && it >= 0.0 }
                            ?: fallbackTimestampSeconds,
                    track = track,
                )
            pushSoftwareVideoFrame(
                pipeline = activePipeline,
                rgba = frame.rgba.toInt8Array(),
                width = frame.width,
                height = frame.height,
                lineSize = frame.lineSize,
                timestamp = timestamp,
            )
        }
    }

    private fun flushSoftwareVideoAtEndOfInput(activeDemuxer: Demuxer) {
        val track = activeVideo ?: return
        if (videoDecoderBackend != DecoderBackend.SOFTWARE_WASM) return
        activeDemuxer.sendPacket(
            streamIndex = track.id,
            data = ByteArray(0),
            ptsSeconds = -1.0,
            dtsSeconds = -1.0,
            keyframe = false,
        )
        drainSoftwareVideoFrames(
            activeDemuxer = activeDemuxer,
            streamIndex = track.id,
            fallbackTimestampSeconds = bufferedEnd.inWholeMilliseconds / 1_000.0,
        )
    }

    private fun normalizeSoftwareVideoTimestamp(
        candidate: Double,
        track: VideoTrack,
    ): Double {
        val nominalInterval =
            track.frameRate
                .takeIf { it.isFinite() && it > 0.0 }
                ?.let { 1.0 / it }
                ?.coerceIn(MINIMUM_VIDEO_FRAME_INTERVAL_SECONDS, MAXIMUM_VIDEO_FRAME_INTERVAL_SECONDS)
                ?: softwareVideoFrameIntervalSeconds
        val previous = lastSoftwareVideoTimestampSeconds
        val resolved =
            when {
                !previous.isFinite() -> candidate.coerceAtLeast(0.0)
                !candidate.isFinite() || candidate < 0.0 -> previous + nominalInterval
                candidate <= previous -> previous + nominalInterval
                else -> candidate
            }
        if (previous.isFinite()) {
            val interval = resolved - previous
            if (
                interval >= nominalInterval * 0.5 &&
                interval <= nominalInterval * 1.5
            ) {
                softwareVideoFrameIntervalSeconds =
                    softwareVideoFrameIntervalSeconds * 0.8 + interval * 0.2
            }
        } else {
            softwareVideoFrameIntervalSeconds = nominalInterval
        }
        lastSoftwareVideoTimestampSeconds = resolved
        return resolved
    }

    private fun resetSoftwareVideoTimeline() {
        lastSoftwareVideoTimestampSeconds = Double.NaN
        softwareVideoFrameIntervalSeconds =
            activeVideo
                ?.frameRate
                ?.takeIf { it.isFinite() && it > 0.0 }
                ?.let { 1.0 / it }
                ?.coerceIn(MINIMUM_VIDEO_FRAME_INTERVAL_SECONDS, MAXIMUM_VIDEO_FRAME_INTERVAL_SECONDS)
                ?: 1.0 / 30.0
    }

    private suspend fun flushPendingSoftwareAudio() {
        if (pendingSoftwareAudio.isEmpty()) return
        val packets = pendingSoftwareAudio.toList()
        pendingSoftwareAudio.clear()
        pendingSoftwareAudioBytes = 0
        if (audioDecoderBackend != DecoderBackend.SOFTWARE_WASM) return
        val activeDemuxer = demuxer ?: return
        val track = activeAudio ?: return
        var cursor = 0
        while (cursor < packets.size) {
            val nativePackets =
                packets.subList(cursor, packets.size).map { packet ->
                    NativeAudioPacket(
                        data = packet.data,
                        ptsSeconds = packet.presentationTime.inWholeMilliseconds / 1_000.0,
                    )
                }
            val (consumed, frame) = activeDemuxer.decodeAudioBatch(track.id, nativePackets)
            if (consumed <= 0) {
                decodeSoftwareAudioIndividually(activeDemuxer, track, packets.subList(cursor, packets.size))
                return
            }
            frame?.let(::pushPcmFrame)
            cursor += consumed
            delay(0)
        }
    }

    private fun decodeSoftwareAudioIndividually(
        activeDemuxer: Demuxer,
        track: AudioTrack,
        packets: List<Packet>,
    ) {
        packets.forEach { packet ->
            var sent =
                activeDemuxer.sendPacket(
                    streamIndex = track.id,
                    data = packet.data,
                    ptsSeconds = packet.presentationTime.inWholeMilliseconds / 1_000.0,
                    dtsSeconds = packet.decodeTime.inWholeMilliseconds / 1_000.0,
                    keyframe = true,
                )
            if (sent < 0) {
                while (activeDemuxer.receiveFrame(track.id) == 0) {
                    activeDemuxer
                        .decodedAudioFrame(
                            track.id,
                            packet.presentationTime.inWholeMilliseconds / 1_000.0,
                        )?.let(::pushPcmFrame)
                }
                sent =
                    activeDemuxer.sendPacket(
                        streamIndex = track.id,
                        data = packet.data,
                        ptsSeconds = packet.presentationTime.inWholeMilliseconds / 1_000.0,
                        dtsSeconds = packet.decodeTime.inWholeMilliseconds / 1_000.0,
                        keyframe = true,
                    )
            }
            if (sent < 0) {
                softwareAudioFailures += 1
                if (softwareAudioFailures >= MAX_CONSECUTIVE_SOFTWARE_FAILURES) {
                    throw decoderExhausted("audio", track.codec, sent)
                }
                return@forEach
            }
            softwareAudioFailures = 0
            while (activeDemuxer.receiveFrame(track.id) == 0) {
                activeDemuxer
                    .decodedAudioFrame(
                        track.id,
                        packet.presentationTime.inWholeMilliseconds / 1_000.0,
                    )?.let(::pushPcmFrame)
            }
        }
    }

    private fun pushPcmFrame(frame: NativePcmFrame) {
        val activePipeline = pipeline ?: return
        val mediaDuration = frame.numberOfFrames.toDouble() / frame.sampleRate.coerceAtLeast(1)
        val output =
            if (requestedRate == 1f) {
                frame
            } else {
                ensureAudioStretcher(frame).processPlanar(frame, requestedRate)
            }
        beginSoftwarePcmFrame(
            pipeline = activePipeline,
            timestamp = output.ptsSeconds,
            mediaDuration = mediaDuration,
            frames = output.numberOfFrames,
            channels = output.numberOfChannels,
            sampleRate = output.sampleRate,
            stretched = requestedRate != 1f,
        )
        output.planes.forEachIndexed { channel, bytes ->
            pushSoftwarePcmPlane(activePipeline, channel, bytes.toInt8Array())
        }
        commitSoftwarePcmFrame(activePipeline)
    }

    private fun ensureAudioStretcher(frame: NativePcmFrame): NativeTimeStretcher {
        val activeDemuxer =
            if (activeAudio?.id in externalAudioSources) {
                externalAudioDemuxer
            } else {
                demuxer
            } ?: throw invalidState()
        val existing = audioStretcher
        if (
            existing != null &&
            audioStretcherChannels == frame.numberOfChannels &&
            audioStretcherSampleRate == frame.sampleRate
        ) {
            return existing
        }
        existing?.close()
        audioStretcher =
            activeDemuxer.createTimeStretcher(frame.numberOfChannels, frame.sampleRate)
                ?: throw WasmMediaError(
                    WasmMediaErrorCategory.DECODER,
                    WasmMediaErrorCode.DECODE_FAILED,
                    "Signalsmith Stretch could not be initialized.",
                )
        audioStretcherChannels = frame.numberOfChannels
        audioStretcherSampleRate = frame.sampleRate
        return requireNotNull(audioStretcher)
    }

    private suspend fun dispatchSubtitle(packet: Packet) {
        val renderer = subtitleRenderer
        if (renderer != null) {
            renderer.pushPacket(
                SubtitlePacket(
                    data = packet.data,
                    presentationTime = packet.presentationTime,
                    duration = packet.duration,
                ),
            )
            return
        }
        val activeDemuxer = demuxer ?: return
        val track = activeSubtitle ?: return
        val cue =
            activeDemuxer.decodeSubtitle(
                streamIndex = track.id,
                data = packet.data,
                ptsSeconds = packet.presentationTime.inWholeMilliseconds / 1_000.0,
                durationSeconds = packet.duration.inWholeMilliseconds / 1_000.0,
            ) ?: return
        decodedSubtitleCues += cue
        if (decodedSubtitleCues.size > MAX_RETAINED_SUBTITLE_CUES) {
            decodedSubtitleCues.removeAt(0)
        }
    }

    private fun renderNativeSubtitleAt(position: Duration) {
        if (subtitleRenderer != null || activeSubtitle == null) return
        val seconds = position.inWholeMilliseconds / 1_000.0
        val delaySeconds = subtitleDelay.inWholeMilliseconds / 1_000.0
        if (activeSubtitle?.id in externalSubtitleSources) {
            val externalCue =
                externalSubtitleCues.lastOrNull { candidate ->
                    val start = candidate.start.inWholeMilliseconds / 1_000.0
                    val end = candidate.end.inWholeMilliseconds / 1_000.0
                    seconds >= start + delaySeconds && seconds < end + delaySeconds
                }
            val externalKey =
                externalCue?.let { "${it.start.inWholeMilliseconds}:${it.end.inWholeMilliseconds}:${it.text}" }
            if (externalKey == renderedSubtitleKey) return
            renderedSubtitleKey = externalKey
            val overlay =
                subtitleOverlay
                    ?: runCatching { createSubtitleOverlay(config.canvas) }
                        .getOrNull()
                        ?.also { subtitleOverlay = it }
                    ?: return
            if (externalCue == null) {
                clearNativeSubtitleOverlay(overlay)
            } else {
                renderNativeSubtitleOverlay(
                    overlay = overlay,
                    text = externalCue.text.orEmpty(),
                    rgba = null,
                    width = 0,
                    height = 0,
                    x = externalCue.x ?: 0,
                    y = externalCue.y ?: 0,
                )
            }
            return
        }
        val cue =
            decodedSubtitleCues.lastOrNull { candidate ->
                seconds >= candidate.startSeconds + delaySeconds &&
                    seconds < candidate.endSeconds + delaySeconds
            }
        val key = cue?.let { "${it.startSeconds}:${it.endSeconds}:${it.text}:${it.bitmap?.rgba?.size}" }
        if (key == renderedSubtitleKey) return
        renderedSubtitleKey = key
        val overlay =
            subtitleOverlay
                ?: runCatching { createSubtitleOverlay(config.canvas) }
                    .getOrNull()
                    ?.also { subtitleOverlay = it }
                ?: return
        if (cue == null) {
            clearNativeSubtitleOverlay(overlay)
            return
        }
        val bitmap = cue.bitmap
        renderNativeSubtitleOverlay(
            overlay = overlay,
            text = cue.text.orEmpty(),
            rgba = bitmap?.rgba?.toInt8Array(),
            width = bitmap?.width ?: 0,
            height = bitmap?.height ?: 0,
            x = bitmap?.x ?: 0,
            y = bitmap?.y ?: 0,
        )
    }

    private fun flushNativeDecoders() {
        val activeDemuxer = demuxer ?: return
        activeVideo?.let { activeDemuxer.flushDecoder(it.id) }
        activeAudio
            ?.takeIf { it.id !in externalAudioSources }
            ?.let { activeDemuxer.flushDecoder(it.id) }
        externalAudioNativeTrack?.let { track ->
            externalAudioDemuxer?.flushDecoder(track.id)
        }
        activeSubtitle?.takeIf { it.id !in externalSubtitleSources }?.let { activeDemuxer.flushDecoder(it.id) }
        audioStretcher?.reset()
        pendingSoftwareAudio.clear()
        pendingSoftwareAudioBytes = 0
        resetSoftwareVideoTimeline()
        decodedSubtitleCues.clear()
        renderedSubtitleKey = null
        subtitleOverlay?.let(::clearNativeSubtitleOverlay)
    }

    private fun maybeSignalMediaPipelineEndOfInput() {
        val externalAudioActive = activeAudio?.id in externalAudioSources
        if (endOfInput && (!externalAudioActive || externalAudioEndOfInput)) {
            pipeline?.let(::signalMediaPipelineEndOfInput)
        }
    }

    private fun recoverDecoder(
        kind: String,
        message: String,
    ) {
        when (kind) {
            "video" -> {
                val track = activeVideo ?: return
                if (videoDecoderBackend == DecoderBackend.SOFTWARE_WASM) {
                    observer.onError(decoderExhausted("video", track.codec, null, message))
                    return
                }
                if (track.id !in hardwareVideoFailedTracks) {
                    hardwareVideoFailedTracks += track.id
                } else {
                    softwareVideoTracks += track.id
                }
            }
            "audio" -> {
                val track = activeAudio ?: return
                if (audioDecoderBackend == DecoderBackend.SOFTWARE_WASM) {
                    observer.onError(decoderExhausted("audio", track.codec, null, message))
                    return
                }
                softwareAudioTracks += track.id
            }
            else -> {
                observer.onError(decodeError(message))
                return
            }
        }
        scheduleDecoderRecovery()
    }

    private fun scheduleDecoderRecovery() {
        if (closed || recoveryJob?.isActive == true) return
        val generation = ++recoveryGeneration
        recoveryJob =
            scope.launch {
                observer.onState(WasmMediaPlayerState.BUFFERING)
                runCatching { restartAtCurrentPosition() }
                    .onFailure { error ->
                        if (!closed && generation == recoveryGeneration) {
                            observer.onError(error.toDecoderError())
                        }
                    }
            }
    }

    private fun adaptiveDecodeQueueLimit(): Int {
        val track = activeVideo ?: return MAX_DECODE_QUEUE
        val pixels = (track.width.toLong() * track.height).coerceAtLeast(1)
        val resolutionFactor = (FULL_HD_PIXELS.toDouble() / pixels).coerceIn(0.25, 2.0)
        val fpsFactor = (30.0 / track.frameRate.coerceAtLeast(1.0)).coerceIn(0.5, 2.0)
        val base = if (videoDecoderBackend == DecoderBackend.SOFTWARE_WASM) 16.0 else 36.0
        return (base * resolutionFactor * fpsFactor).roundToInt().coerceIn(6, MAX_DECODE_QUEUE)
    }

    private fun adaptiveBufferAhead(): Duration {
        val track = activeVideo ?: return MAX_BUFFER_AHEAD
        val pixels = (track.width.toLong() * track.height).coerceAtLeast(1)
        return when {
            pixels >= UHD_PIXELS -> 4.seconds
            track.frameRate >= 60.0 -> 6.seconds
            else -> MAX_BUFFER_AHEAD
        }
    }

    private fun publishDiagnostics() {
        val activeDemuxer = demuxer
        val activePipeline = pipeline
        val sourceHdr = activeVideo?.isHdr == true
        val webGlConfirmed = activePipeline?.let(::mediaPipelineUsesWebGl) == true
        val outputColorSpace =
            activePipeline
                ?.let(::mediaPipelineOutputColorSpace)
                ?.takeIf(String::isNotBlank)
                ?: "srgb"
        val toneMapsToSdr =
            sourceHdr &&
                (
                    requestedToneMapping == io.github.shusek.kmedia.engine.wasm.ToneMappingMode.AUTO ||
                        requestedToneMapping == io.github.shusek.kmedia.engine.wasm.ToneMappingMode.SHADER
                ) &&
                webGlConfirmed
        val confirmedHdrOutput =
            sourceHdr &&
                !toneMapsToSdr &&
                activePipeline?.let(::mediaPipelineHasConfirmedHdrOutput) == true
        val renderingBackend =
            when {
                videoDecoderBackend == DecoderBackend.SOFTWARE_WASM -> RenderingBackend.SOFTWARE_WASM
                videoDecoderBackend == DecoderBackend.WEB_CODECS -> RenderingBackend.WEBCODECS
                audioDecoderBackend == DecoderBackend.SOFTWARE_WASM -> RenderingBackend.SOFTWARE_WASM
                else -> RenderingBackend.UNKNOWN
            }
        observer.onDiagnostics(
            RenderingDiagnostics(
                backend = renderingBackend,
                videoDecoderBackend = videoDecoderBackend,
                audioDecoderBackend = audioDecoderBackend,
                sourceMode = activeDemuxer?.sourceMode ?: io.github.shusek.kmedia.engine.wasm.SourceMode.UNKNOWN,
                decoder =
                    "video=${videoDecoderBackend.name.lowercase()}, " +
                        "audio=${audioDecoderBackend.name.lowercase()}",
                renderer = "WebGL2 + Web Audio + Signalsmith Stretch",
                container = mediaInfo?.formatName,
                droppedFrames = activePipeline?.let(::mediaPipelineDroppedFrames)?.toLong() ?: 0,
                presentedFrames = activePipeline?.let(::mediaPipelinePresentedFrames)?.toLong() ?: 0,
                decodeQueueSize = activePipeline?.let(::mediaPipelineDecodeQueueSize) ?: 0,
                demuxedPackets = demuxedPackets,
                demuxSeekCount = demuxSeekCount,
                submittedVideoPackets =
                    activePipeline?.let(::mediaPipelineSubmittedVideoPackets)?.toLong() ?: 0,
                decodedVideoFrames =
                    activePipeline?.let(::mediaPipelineDecodedVideoFrames)?.toLong() ?: 0,
                endOfInput = endOfInput,
                lastPacketTimestamp = lastPacketTimestamp,
                lastPacketStreamIndex = lastPacketStreamIndex,
                lastPacketBytes = lastPacketBytes,
                audioBufferAhead =
                    (
                        activePipeline?.let(::mediaPipelineAudibleAudioAheadSeconds) ?: 0.0
                    ).seconds,
                audioUnderruns =
                    activePipeline?.let(::mediaPipelineAudioUnderruns)?.toLong() ?: 0,
                maximumAvDrift =
                    (
                        activePipeline?.let(::mediaPipelineMaximumAvDriftSeconds) ?: 0.0
                    ).seconds,
                audioTimestampCorrections =
                    activePipeline
                        ?.let(::mediaPipelineAudioTimestampCorrections)
                        ?.toLong()
                        ?: 0,
                colorPipeline =
                    ColorPipelineDiagnostics(
                        sourceDynamicRange =
                            when {
                                !sourceHdr -> DynamicRange.SDR
                                activeVideo
                                    ?.codecString
                                    .orEmpty()
                                    .contains("dv", ignoreCase = true) -> DynamicRange.DOLBY_VISION
                                activeVideo?.colorTransfer.orEmpty().contains("b67", ignoreCase = true) ->
                                    DynamicRange.HLG
                                else -> DynamicRange.HDR10
                            },
                        outputDynamicRange =
                            when {
                                toneMapsToSdr || !sourceHdr -> DynamicRange.SDR
                                requestedToneMapping == ToneMappingMode.DISABLED -> DynamicRange.UNKNOWN
                                else -> DynamicRange.HDR10
                            },
                        outputVerification =
                            when {
                                toneMapsToSdr -> OutputVerification.CONFIRMED
                                !sourceHdr && webGlConfirmed -> OutputVerification.CONFIRMED
                                confirmedHdrOutput -> OutputVerification.CONFIRMED
                                sourceHdr -> OutputVerification.INFERRED
                                else -> OutputVerification.UNKNOWN
                            },
                        requestedColorSpace = if (sourceHdr) "display-p3" else "srgb",
                        appliedColorSpace = outputColorSpace,
                        toneMapping = requestedToneMapping,
                    ),
                cache = activeDemuxer?.cacheStats ?: io.github.shusek.kmedia.engine.wasm.CacheStats(),
                network = activeDemuxer?.networkStats ?: io.github.shusek.kmedia.engine.wasm.NetworkStats(),
            ),
        )
    }

    private fun resetDemuxDiagnostics(resetSeekCount: Boolean) {
        demuxedPackets = 0
        if (resetSeekCount) demuxSeekCount = 0
        lastPacketTimestamp = null
        lastPacketStreamIndex = null
        lastPacketBytes = 0
        packetsSinceDiagnostics = 0
    }

    private fun applyVisualSettings(activePipeline: JsAny) {
        val track = activeVideo
        val projection = requestedProjection.mode.resolve(track?.projection)
        val stereoLayout =
            if (
                projection == ProjectionMode.SIDE_BY_SIDE &&
                requestedProjection.stereoLayout == ProjectionStereoLayout.MONO
            ) {
                ProjectionStereoLayout.SIDE_BY_SIDE
            } else {
                requestedProjection.stereoLayout
            }
        setMediaPipelineProjection(
            pipeline = activePipeline,
            projection = projection.name.lowercase(),
            stereoLayout = stereoLayout.name.lowercase(),
            eyeOrder = requestedProjection.eyeOrder.name.lowercase(),
            rotationDegrees = (track?.rotationDegrees ?: 0) + requestedRotationDegrees,
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
            sourceHdr = track?.isHdr == true,
            toneMapping = requestedToneMapping.name.lowercase(),
        )
    }

    private suspend fun publishCoverArt(activeDemuxer: Demuxer) {
        val attachment =
            activeDemuxer.getAttachments().firstOrNull { candidate ->
                candidate.mimeType.startsWith("image/", ignoreCase = true) ||
                    candidate.name.substringAfterLast('.', "").lowercase() in COVER_ART_EXTENSIONS
            }
        val encodedPicture =
            if (attachment != null) {
                EncodedPicture(
                    data = attachment.data,
                    mimeType = attachment.mimeType.ifBlank { "application/octet-stream" },
                )
            } else {
                loadedSource?.let { source ->
                    runCatching { extractIsolatedAttachedPicture(source, config.runtime) }.getOrNull()
                }
            } ?: return
        val deferred = CompletableDeferred<org.w3c.dom.ImageBitmap>()
        decodeEncodedImage(
            bytes = encodedPicture.data.toInt8Array(),
            mimeType = encodedPicture.mimeType,
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
        runCatching { deferred.await() }
            .onSuccess(observer::onCoverArt)
            .onFailure { error ->
                config.logger.log(
                    io.github.shusek.kmedia.engine.wasm.WasmMediaLogLevel.WARN,
                    "cover-art",
                    io.github.shusek.kmedia.engine.wasm.redactSensitiveText(
                        error.message ?: "Embedded cover art could not be decoded.",
                    ),
                )
            }
    }

    private suspend fun restartAtCurrentPosition() {
        val resume = playing
        seek(currentPosition)
        if (!resume) pause()
    }

    private fun applyStreamDiscard() {
        val activeDemuxer = demuxer ?: return
        mediaInfo?.tracks.orEmpty().forEach { track ->
            val enabled =
                track.id == activeVideo?.id ||
                    track.id == activeAudio?.id ||
                    track.id == activeSubtitle?.id
            if (
                track.id !in externalSubtitleSources &&
                track.id !in externalAudioSources &&
                track.id !in qualityVariantSources
            ) {
                activeDemuxer.setStreamDiscard(track.id, !enabled)
            }
        }
    }

    private fun MediaSource.freshForReload(): MediaSource =
        when (this) {
            is MediaSource.Adapter -> adapter.fork()?.let(MediaSource::Adapter) ?: this
            is MediaSource.BrowserFile -> MediaSource.BrowserFile(file)
            is MediaSource.BrowserMedia ->
                throw WasmMediaError(
                    WasmMediaErrorCategory.SOURCE,
                    WasmMediaErrorCode.INVALID_STATE,
                    "Prepared browser media cannot be reloaded through the demuxed backend.",
                )
            is MediaSource.Drm ->
                MediaSource.Drm(
                    mediaUrl = mediaUrl,
                    licenseUrl = licenseUrl,
                    mediaHeaders = mediaHeaders,
                    licenseHeaders = licenseHeaders,
                    licenseServers = licenseServers,
                )
            is MediaSource.Encrypted -> MediaSource.Encrypted(config)
            is MediaSource.Url -> MediaSource.Url(url, headers, mimeType)
            is MediaSource.Composite -> error("Nested composite media sources are not supported.")
        }

    private fun applyPipelineSettings(activePipeline: JsAny) {
        setMediaPipelineVolume(activePipeline, requestedVolume)
        setMediaPipelineMuted(activePipeline, requestedMuted)
        setMediaPipelineRate(activePipeline, requestedRate)
        setMediaPipelineFitMode(activePipeline, requestedFitMode.name.lowercase())
        setMediaPipelineStableVolume(activePipeline, requestedStableVolume)
    }

    private fun notReadyOutcome(request: TrackSelectionRequest): TrackSelectionOutcome =
        TrackSelectionOutcome(
            kind = request.kind,
            status = TrackSelectionStatus.FAILED,
            requestedTrackId = request.requestedTrackId(),
            activeTrack = null,
            error = invalidState(),
        )

    private fun invalidState(): WasmMediaError =
        WasmMediaError(
            WasmMediaErrorCategory.STATE,
            WasmMediaErrorCode.INVALID_STATE,
            "The demuxed playback backend is not loaded.",
        )

    private fun outputRequirementError(message: String): WasmMediaError =
        WasmMediaError(
            WasmMediaErrorCategory.RENDERER,
            WasmMediaErrorCode.OUTPUT_REQUIREMENT_UNAVAILABLE,
            message,
        )

    private fun enrichCompositeMediaInfo(
        nativeInfo: MediaInfo,
        composite: MediaSource.Composite?,
    ): MediaInfo {
        externalSubtitleSources.clear()
        externalAudioSources.clear()
        qualityVariantSources.clear()
        if (composite == null) return nativeInfo

        val externalAudioTracks =
            composite.audioTracks.mapIndexed { index, source ->
                val id = EXTERNAL_AUDIO_TRACK_BASE + index
                externalAudioSources[id] = source
                AudioTrack(
                    id = id,
                    codec = "external",
                    channels = 0,
                    sampleRate = 0,
                    language = source.language,
                    label = source.label ?: source.id,
                    isDefault = source.isDefault,
                )
            }
        val externalSubtitleTracks =
            composite.subtitleTracks.mapIndexed { index, source ->
                val id = EXTERNAL_SUBTITLE_TRACK_BASE + index
                externalSubtitleSources[id] = source
                SubtitleTrack(
                    id = id,
                    codec = source.format ?: "external",
                    subtitleType = io.github.shusek.kmedia.engine.wasm.SubtitleType.TEXT,
                    language = source.language,
                    label = source.label ?: source.id,
                    isDefault = source.isDefault,
                )
            }
        val qualityTracks =
            composite.variants.mapIndexed { index, source ->
                val id = QUALITY_VARIANT_TRACK_BASE + index
                qualityVariantSources[id] = source
                VideoTrack(
                    id = id,
                    codec = source.codecs ?: "external",
                    codecString = source.codecs,
                    width = source.width ?: 0,
                    height = source.height ?: 0,
                    frameRate = 0.0,
                    bitRate = source.bitRate,
                    label = source.label ?: source.id,
                    isDefault = id == selectedQualityVariantId,
                )
            }
        val primaryTracks =
            if (selectedQualityVariantId == null) {
                nativeInfo.tracks
            } else {
                nativeInfo.tracks.map { track ->
                    if (track is VideoTrack) track.copy(isDefault = false) else track
                }
            }
        return nativeInfo.copy(
            tracks = primaryTracks + qualityTracks + externalAudioTracks + externalSubtitleTracks,
        )
    }
}

internal fun MediaSource.requiresDemuxedPlayback(): Boolean {
    val source = if (this is MediaSource.Composite) primary else this
    return when (source) {
        is MediaSource.Drm -> false
        is MediaSource.BrowserMedia -> false
        is MediaSource.Encrypted,
        is MediaSource.Adapter,
        is MediaSource.BrowserFile,
        -> true
        is MediaSource.Url -> !source.isAdaptiveStream()
        is MediaSource.Composite -> error("Nested composite media sources are not supported.")
    }
}

private fun MediaSource.Url.isAdaptiveStream(): Boolean {
    val normalizedMime = mimeType?.substringBefore(';')?.trim()?.lowercase()
    if (normalizedMime in ADAPTIVE_MIME_TYPES) return true
    val clean = url.substringBefore('?').substringBefore('#').lowercase()
    return clean.endsWith(".m3u8") ||
        clean.endsWith(".mpd") ||
        clean.endsWith(".ism") ||
        clean.endsWith(".isml") ||
        clean.contains(".ism/manifest") ||
        clean.contains(".isml/manifest")
}

private fun TrackSelectionRequest.requestedTrackId(): Int? =
    when (this) {
        is TrackSelectionRequest.Video -> trackId
        is TrackSelectionRequest.Audio -> trackId
        is TrackSelectionRequest.Subtitle -> trackId
    }

private fun VideoTrack.webCodecsCodec(description: ByteArray?): String? =
    when (codec.lowercase()) {
        "vp8", "vp8.0" -> "vp8"
        "vp9", "vp09" -> {
            val profileValue = profile?.coerceIn(0, 3) ?: 0
            val levelValue =
                when {
                    width > 1_920 -> 51
                    width > 1_280 -> 41
                    else -> 31
                }
            val bitDepth = if (pixelFormat.orEmpty().contains("10")) 10 else 8
            "vp09." +
                profileValue.toString().padStart(2, '0') +
                "." +
                levelValue.toString().padStart(2, '0') +
                "." +
                bitDepth.toString().padStart(2, '0') +
                ".01.01.01.01.00"
        }
        "av1", "av01" ->
            description?.av1CodecString()
                ?: "av01.${profile?.coerceIn(0, 2) ?: 0}.08M.${if (pixelFormat.orEmpty().contains("10")) "10" else "08"}"
        "h264", "avc", "avc1" -> description?.avcCodecString() ?: "avc1.42E01E"
        "hevc", "h265", "hvc1", "hev1" ->
            description?.hevcCodecString(width, height)
                ?: when (profile) {
                    4 -> "hvc1.4.10.L${level ?: 120}.B0"
                    2 -> "hvc1.2.4.L${level ?: 120}.B0"
                    else -> "hvc1.1.6.L${level ?: 93}.B0"
                }
        // WebCodecs has no VC-1 registration. FFmpeg reports Advanced Profile as `vc1` and
        // Simple/Main Profile from common WMV9 files as `wmv3`; both must bypass browser probing.
        "vc1", "wmv3" -> null
        else -> codecString
    }

private fun VideoTrack.webCodecsFallbacks(): String {
    val levelString = "L${level ?: if (width >= 3_840) 153 else 120}"
    return when {
        codec.lowercase() !in HEVC_CODEC_NAMES -> ""
        profile == 4 ->
            listOf(
                "hvc1.4.10.$levelString.B0",
                "hvc1.4.10.L93.B0",
                "hvc1.2.4.$levelString.B0",
                "hvc1.1.6.$levelString.B0",
            ).distinct().joinToString(",")
        profile == 2 ->
            listOf(
                "hvc1.2.4.$levelString.B0",
                "hvc1.2.4.L93.B0",
                "hvc1.1.6.$levelString.B0",
            ).distinct().joinToString(",")
        else -> "hvc1.1.6.$levelString.B0,hvc1.1.6.L93.B0"
    }
}

private fun AudioTrack.webCodecsCodec(): String? =
    when (codec.lowercase()) {
        "aac", "mp4a", "mp4a_latm" -> "mp4a.40.2"
        "opus" -> "opus"
        "vorbis" -> "vorbis"
        "flac" -> "flac"
        "mp3", "mp3float" -> "mp3"
        else -> null
    }

private fun AudioTrack.requiresSoftwareDecoder(): Boolean =
    channels > 2 || codec.lowercase() in SOFTWARE_AUDIO_CODECS

private fun ByteArray.avcCodecString(): String? {
    if (size < 4 || this[0].toInt() != 1) return null
    return "avc1." +
        listOf(this[1], this[2], this[3]).joinToString("") { byte ->
            (byte.toInt() and 0xff).toString(16).padStart(2, '0')
        }
}

private fun ByteArray.hevcCodecString(
    width: Int,
    height: Int,
): String? {
    if (size < 13) return null
    if (isAnnexB()) {
        return if (width >= 3_840 || height >= 2_160) "hvc1.2.4.L153.B0" else null
    }
    if ((this[0].toInt() and 0xff) != 1) return null
    val profileByte = this[1].toInt() and 0xff
    val profileSpace =
        when ((profileByte ushr 6) and 0x03) {
            1 -> "A"
            2 -> "B"
            3 -> "C"
            else -> ""
        }
    val tier = if ((profileByte and 0x20) == 0) "L" else "H"
    val profile = profileByte and 0x1f
    var compatibility = 0u
    repeat(4) { index ->
        compatibility = (compatibility shl 8) or (this[2 + index].toInt() and 0xff).toUInt()
    }
    val reversedCompatibility = compatibility.reverseBits()
    val level = this[12].toInt() and 0xff
    val constraintBytes = (6..11).map { this[it].toInt() and 0xff }
    val lastConstraint = constraintBytes.indexOfLast { it != 0 }
    val constraints =
        if (lastConstraint < 0) {
            ".B0"
        } else {
            constraintBytes
                .take(lastConstraint + 1)
                .asReversed()
                .joinToString(separator = ".", prefix = ".") { it.toString(16) }
        }
    return "hvc1.$profileSpace$profile.${reversedCompatibility.toString(16)}.$tier$level$constraints"
}

private fun ByteArray.av1CodecString(): String? {
    if (size < 4) return null
    val profile = (this[1].toInt() ushr 5) and 0x07
    val level = this[1].toInt() and 0x1f
    val tier = if ((this[2].toInt() and 0x80) != 0) "H" else "M"
    val highBitDepth = (this[2].toInt() ushr 6) and 1
    val twelveBit = (this[2].toInt() ushr 5) and 1
    val depth = 8 + highBitDepth * 2 + twelveBit * 2
    return "av01.$profile.${level.toString().padStart(2, '0')}$tier.${depth.toString().padStart(2, '0')}"
}

private fun ByteArray.isAnnexB(): Boolean =
    size >= 4 &&
        this[0] == 0.toByte() &&
        this[1] == 0.toByte() &&
        (this[2] == 1.toByte() || (this[2] == 0.toByte() && this[3] == 1.toByte()))

private fun UInt.reverseBits(): UInt {
    var source = this
    var output = 0u
    repeat(Int.SIZE_BITS) {
        output = (output shl 1) or (source and 1u)
        source = source shr 1
    }
    return output
}

private fun String.toDecoderBackend(): DecoderBackend =
    when (this) {
        "web" -> DecoderBackend.WEB_CODECS
        "software" -> DecoderBackend.SOFTWARE_WASM
        "none" -> DecoderBackend.NONE
        else -> DecoderBackend.UNKNOWN
    }

private fun ProjectionMode.resolve(nativeProjection: Int?): ProjectionMode =
    if (this != ProjectionMode.AUTO) {
        this
    } else {
        when (nativeProjection) {
            1 -> ProjectionMode.EQUIRECTANGULAR
            3 -> ProjectionMode.EQUIRECTANGULAR
            4 -> ProjectionMode.HALF_EQUIRECTANGULAR
            else -> ProjectionMode.FLAT
        }
    }

private fun Double.safeSeconds(): Duration =
    if (isFinite() && this >= 0.0) seconds else Duration.ZERO

private fun String.toWasmMediaState(): WasmMediaPlayerState =
    when (this) {
        "playing" -> WasmMediaPlayerState.PLAYING
        "paused" -> WasmMediaPlayerState.PAUSED
        "buffering" -> WasmMediaPlayerState.BUFFERING
        "ended" -> WasmMediaPlayerState.ENDED
        else -> WasmMediaPlayerState.READY
    }

private fun decodeError(message: String): WasmMediaError =
    WasmMediaError(
        WasmMediaErrorCategory.DECODER,
        WasmMediaErrorCode.DECODE_FAILED,
        message,
    )

private fun renderError(message: String): WasmMediaError =
    WasmMediaError(
        WasmMediaErrorCategory.RENDERER,
        WasmMediaErrorCode.RENDER_FAILED,
        message,
    )

private fun unsupportedCodec(
    kind: String,
    codec: String,
): WasmMediaError =
    WasmMediaError(
        WasmMediaErrorCategory.DECODER,
        WasmMediaErrorCode.UNSUPPORTED_CODEC,
        "No usable $kind decoder is available for codec '$codec'.",
    )

private fun decoderExhausted(
    kind: String,
    codec: String,
    nativeCode: Int?,
    detail: String? = null,
): WasmMediaError =
    WasmMediaError(
        WasmMediaErrorCategory.DECODER,
        WasmMediaErrorCode.DECODE_FAILED,
        buildString {
            append("The active $kind track using '$codec' failed after WebCodecs and FFmpeg-WASM recovery.")
            if (nativeCode != null) append(" Native decoder code: $nativeCode.")
            if (!detail.isNullOrBlank()) append(" ").append(detail)
        },
    )

private fun Throwable.toDecoderError(): WasmMediaError =
    this as? WasmMediaError
        ?: WasmMediaError(
            WasmMediaErrorCategory.DECODER,
            WasmMediaErrorCode.DECODE_FAILED,
            message ?: "The demuxed playback pipeline failed.",
            this,
        )

private fun Throwable.toRendererError(): WasmMediaError =
    this as? WasmMediaError
        ?: WasmMediaError(
            WasmMediaErrorCategory.RENDERER,
            WasmMediaErrorCode.RENDER_FAILED,
            message ?: "The subtitle renderer failed.",
            this,
        )

@Suppress("UNUSED_PARAMETER")
private fun showCanvas(canvas: org.w3c.dom.HTMLCanvasElement): Unit =
    js(
        """
        {
            canvas.style.visibility = "visible";
            canvas.style.display = "block";
            canvas.style.width = "100%";
            canvas.style.height = "100%";
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun createSubtitleOverlay(canvas: org.w3c.dom.HTMLCanvasElement): HTMLElement =
    js(
        """
        (function() {
            const parent = canvas.parentElement;
            if (!parent) throw new Error("The player canvas must be mounted before subtitles are configured.");
            const overlay = document.createElement("div");
            overlay.style.position = "absolute";
            overlay.style.inset = "0";
            overlay.style.pointerEvents = "none";
            overlay.style.zIndex = "2";
            parent.appendChild(overlay);
            return overlay;
        })()
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun removeSubtitleOverlay(overlay: HTMLElement): Unit = js("overlay.remove()")

@Suppress("UNUSED_PARAMETER")
private fun imageBitmapWidth(image: org.w3c.dom.ImageBitmap): Int = js("Number(image.width || 0)")

@Suppress("UNUSED_PARAMETER")
private fun imageBitmapHeight(image: org.w3c.dom.ImageBitmap): Int = js("Number(image.height || 0)")

@Suppress("UNUSED_PARAMETER")
private fun clearNativeSubtitleOverlay(overlay: HTMLElement): Unit =
    js(
        """
        {
            while (overlay.firstChild) overlay.removeChild(overlay.firstChild);
        }
        """,
    )

@Suppress("UNUSED_PARAMETER", "LongParameterList")
private fun renderNativeSubtitleOverlay(
    overlay: HTMLElement,
    text: String,
    rgba: Int8Array?,
    width: Int,
    height: Int,
    x: Int,
    y: Int,
): Unit =
    js(
        """
        {
            while (overlay.firstChild) overlay.removeChild(overlay.firstChild);
            if (rgba && width > 0 && height > 0) {
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                canvas.style.position = "absolute";
                canvas.style.left = Math.max(0, x) + "px";
                canvas.style.top = Math.max(0, y) + "px";
                canvas.style.maxWidth = "100%";
                canvas.style.maxHeight = "100%";
                const context = canvas.getContext("2d");
                if (context) {
                    const source = new Uint8ClampedArray(rgba.buffer, rgba.byteOffset, width * height * 4);
                    context.putImageData(new ImageData(new Uint8ClampedArray(source), width, height), 0, 0);
                    overlay.appendChild(canvas);
                }
            }
            if (text) {
                const element = document.createElement("div");
                element.textContent = text;
                element.style.position = "absolute";
                element.style.left = "5%";
                element.style.right = "5%";
                element.style.bottom = "5%";
                element.style.textAlign = "center";
                element.style.whiteSpace = "pre-wrap";
                element.style.color = "white";
                element.style.font = "600 1.25rem/1.35 sans-serif";
                element.style.textShadow = "0 1px 3px black, 0 0 2px black";
                overlay.appendChild(element);
            }
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun decodeEncodedImage(
    bytes: Int8Array,
    mimeType: String,
    onComplete: (org.w3c.dom.ImageBitmap) -> Unit,
    onError: (String) -> Unit,
): Unit =
    js(
        """
        {
            try {
                const copy = new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength).slice();
                const blob = new Blob([copy], { type: mimeType || "application/octet-stream" });
                Promise.resolve(createImageBitmap(blob))
                    .then(function(image) { onComplete(image); })
                    .catch(function(error) {
                        onError(String(error && error.message ? error.message : error));
                    });
            } catch (error) {
                onError(String(error && error.message ? error.message : error));
            }
        }
        """,
    )

@Suppress("UNUSED_PARAMETER", "LongParameterList")
private fun createWebCodecsPipeline(
    canvas: org.w3c.dom.HTMLCanvasElement,
    onTime: (Double) -> Unit,
    onState: (String) -> Unit,
    onEnded: () -> Unit,
    onError: (String) -> Unit,
): JsAny =
    js(
        """
        (function() {
            const context = canvas.getContext("2d", {
                alpha: false,
                desynchronized: true,
                colorSpace: "srgb"
            });
            if (!context) throw new Error("Canvas2D is unavailable.");
            const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
            const audioContext = AudioContextClass ? new AudioContextClass() : null;
            const gain = audioContext ? audioContext.createGain() : null;
            if (gain) gain.connect(audioContext.destination);
            const state = {
                canvas: canvas,
                context: context,
                audioContext: audioContext,
                gain: gain,
                videoDecoder: null,
                audioDecoder: null,
                videoFrames: [],
                audioSegments: [],
                scheduledSources: [],
                playing: false,
                destroyed: false,
                eof: false,
                ended: false,
                duration: 0,
                position: 0,
                basePosition: 0,
                baseWallTime: performance.now(),
                rate: 1,
                volume: 1,
                muted: false,
                fitMode: "contain",
                animationFrame: 0
            };
            function messageOf(error) {
                return String(error && error.message ? error.message : error);
            }
            function report(error) {
                if (!state.destroyed) onError(messageOf(error || "WebCodecs playback failed."));
            }
            function stopScheduledAudio() {
                state.scheduledSources.forEach(function(item) {
                    try { item.source.stop(); } catch (_) {}
                    item.segment.scheduled = false;
                });
                state.scheduledSources.length = 0;
            }
            function closeFrames() {
                state.videoFrames.forEach(function(frame) {
                    try { frame.close(); } catch (_) {}
                });
                state.videoFrames.length = 0;
            }
            function closeDecoders() {
                if (state.videoDecoder) {
                    try { state.videoDecoder.close(); } catch (_) {}
                    state.videoDecoder = null;
                }
                if (state.audioDecoder) {
                    try { state.audioDecoder.close(); } catch (_) {}
                    state.audioDecoder = null;
                }
            }
            function updatePosition() {
                if (state.playing) {
                    state.position =
                        state.basePosition +
                        ((performance.now() - state.baseWallTime) / 1000) * state.rate;
                    if (state.duration > 0) state.position = Math.min(state.position, state.duration);
                }
                return state.position;
            }
            function drawVideo(position) {
                const frames = state.videoFrames;
                while (frames.length > 1 && frames[1].timestamp / 1000000 <= position + 0.002) {
                    const discarded = frames.shift();
                    try { discarded.close(); } catch (_) {}
                }
                const frame = frames[0];
                if (!frame || frame.timestamp / 1000000 > position + 0.08) return;
                const sourceWidth = Number(frame.displayWidth || frame.codedWidth || 1);
                const sourceHeight = Number(frame.displayHeight || frame.codedHeight || 1);
                const pixelRatio = Number(globalThis.devicePixelRatio || 1);
                const rect = canvas.getBoundingClientRect();
                const targetWidth = Math.max(1, Math.round((rect.width || sourceWidth) * pixelRatio));
                const targetHeight = Math.max(1, Math.round((rect.height || sourceHeight) * pixelRatio));
                if (canvas.width !== targetWidth) canvas.width = targetWidth;
                if (canvas.height !== targetHeight) canvas.height = targetHeight;
                let drawWidth = targetWidth;
                let drawHeight = targetHeight;
                let x = 0;
                let y = 0;
                if (state.fitMode !== "fill") {
                    const containScale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
                    const coverScale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight);
                    const scale = state.fitMode === "cover" ? coverScale : containScale;
                    drawWidth = sourceWidth * scale;
                    drawHeight = sourceHeight * scale;
                    x = (targetWidth - drawWidth) / 2;
                    y = (targetHeight - drawHeight) / 2;
                }
                state.context.fillStyle = "#000";
                state.context.fillRect(0, 0, targetWidth, targetHeight);
                try {
                    state.context.drawImage(frame, x, y, drawWidth, drawHeight);
                } catch (error) {
                    report(error);
                }
            }
            function copyAudioData(data) {
                const channels = Number(data.numberOfChannels || 0);
                const frames = Number(data.numberOfFrames || 0);
                const sampleRate = Number(data.sampleRate || 0);
                if (!channels || !frames || !sampleRate) {
                    data.close();
                    return;
                }
                const planes = [];
                try {
                    for (let channel = 0; channel < channels; channel += 1) {
                        const plane = new Float32Array(frames);
                        data.copyTo(plane, { planeIndex: channel, format: "f32-planar" });
                        planes.push(plane);
                    }
                    state.audioSegments.push({
                        timestamp: Number(data.timestamp || 0) / 1000000,
                        duration: frames / sampleRate,
                        sampleRate: sampleRate,
                        frames: frames,
                        channels: channels,
                        planes: planes,
                        scheduled: false
                    });
                    state.audioSegments.sort(function(a, b) { return a.timestamp - b.timestamp; });
                } catch (error) {
                    report(error);
                } finally {
                    data.close();
                }
            }
            function scheduleAudio(position) {
                if (!state.audioContext || !state.gain || !state.playing) return;
                state.gain.gain.value = state.muted ? 0 : state.volume;
                state.audioSegments.forEach(function(segment) {
                    const end = segment.timestamp + segment.duration;
                    if (segment.scheduled || end < position - 0.05 || segment.timestamp > position + 2) return;
                    try {
                        const buffer = state.audioContext.createBuffer(
                            segment.channels,
                            segment.frames,
                            segment.sampleRate
                        );
                        for (let channel = 0; channel < segment.channels; channel += 1) {
                            buffer.copyToChannel(segment.planes[channel], channel);
                        }
                        const source = state.audioContext.createBufferSource();
                        source.buffer = buffer;
                        source.playbackRate.value = state.rate;
                        source.connect(state.gain);
                        const offset = Math.max(0, position - segment.timestamp);
                        const when =
                            state.audioContext.currentTime +
                            Math.max(0, (segment.timestamp - position) / state.rate);
                        source.start(when, offset);
                        segment.scheduled = true;
                        const item = { source: source, segment: segment };
                        state.scheduledSources.push(item);
                        source.onended = function() {
                            const index = state.scheduledSources.indexOf(item);
                            if (index >= 0) state.scheduledSources.splice(index, 1);
                        };
                    } catch (error) {
                        report(error);
                    }
                });
                state.audioSegments = state.audioSegments.filter(function(segment) {
                    return segment.timestamp + segment.duration >= position - 1;
                });
            }
            function tick() {
                if (state.destroyed) return;
                const position = updatePosition();
                drawVideo(position);
                scheduleAudio(position);
                if (state.playing) onTime(position);
                const queuesEmpty =
                    state.videoFrames.length <= 1 &&
                    state.audioSegments.length === 0 &&
                    (!state.videoDecoder || state.videoDecoder.decodeQueueSize === 0) &&
                    (!state.audioDecoder || state.audioDecoder.decodeQueueSize === 0);
                if (
                    state.playing &&
                    state.eof &&
                    !state.ended &&
                    ((state.duration > 0 && position >= state.duration - 0.01) ||
                        (state.duration <= 0 && queuesEmpty))
                ) {
                    state.ended = true;
                    state.playing = false;
                    onState("ended");
                    onEnded();
                }
                state.animationFrame = requestAnimationFrame(tick);
            }
            state.animationFrame = requestAnimationFrame(tick);
            state.closeDecoders = closeDecoders;
            state.closeFrames = closeFrames;
            state.stopScheduledAudio = stopScheduledAudio;
            state.report = report;
            state.copyAudioData = copyAudioData;
            state.updatePosition = updatePosition;
            return state;
        })()
        """,
    )

@Suppress("UNUSED_PARAMETER", "LongParameterList")
private fun configureWebCodecsPipeline(
    pipeline: JsAny,
    videoCodec: String,
    videoWidth: Int,
    videoHeight: Int,
    videoDescription: Int8Array?,
    audioCodec: String,
    audioSampleRate: Int,
    audioChannels: Int,
    audioDescription: Int8Array?,
    duration: Double,
    onComplete: () -> Unit,
    onError: (String) -> Unit,
): Unit =
    js(
        """
        {
            try {
                pipeline.stopScheduledAudio();
                pipeline.closeFrames();
                pipeline.closeDecoders();
                pipeline.audioSegments.length = 0;
                pipeline.eof = false;
                pipeline.ended = false;
                pipeline.duration = Math.max(0, Number(duration || 0));
                if (videoCodec) {
                    if (typeof globalThis.VideoDecoder !== "function") {
                        throw new Error("This browser does not expose WebCodecs VideoDecoder.");
                    }
                    const decoder = new globalThis.VideoDecoder({
                        output: function(frame) {
                            if (pipeline.destroyed) {
                                frame.close();
                                return;
                            }
                            pipeline.videoFrames.push(frame);
                            pipeline.videoFrames.sort(function(a, b) {
                                return Number(a.timestamp || 0) - Number(b.timestamp || 0);
                            });
                            while (pipeline.videoFrames.length > 180) {
                                const old = pipeline.videoFrames.shift();
                                try { old.close(); } catch (_) {}
                            }
                        },
                        error: pipeline.report
                    });
                    const config = {
                        codec: videoCodec,
                        codedWidth: Math.max(1, videoWidth),
                        codedHeight: Math.max(1, videoHeight)
                    };
                    if (videoDescription && videoDescription.byteLength) {
                        config.description = videoDescription;
                    }
                    decoder.configure(config);
                    pipeline.videoDecoder = decoder;
                }
                if (audioCodec) {
                    if (typeof globalThis.AudioDecoder !== "function") {
                        throw new Error("This browser does not expose WebCodecs AudioDecoder.");
                    }
                    const decoder = new globalThis.AudioDecoder({
                        output: pipeline.copyAudioData,
                        error: pipeline.report
                    });
                    const config = {
                        codec: audioCodec,
                        sampleRate: Math.max(1, audioSampleRate),
                        numberOfChannels: Math.max(1, audioChannels)
                    };
                    if (audioDescription && audioDescription.byteLength) {
                        config.description = audioDescription;
                    }
                    decoder.configure(config);
                    pipeline.audioDecoder = decoder;
                }
                onComplete();
            } catch (error) {
                onError(String(error && error.message ? error.message : error));
            }
        }
        """,
    )

@Suppress("UNUSED_PARAMETER", "LongParameterList")
private fun pushWebCodecsPacket(
    pipeline: JsAny,
    kind: String,
    data: Int8Array,
    timestamp: Double,
    duration: Double,
    keyframe: Boolean,
    drop: Boolean,
): Unit =
    js(
        """
        {
            if (pipeline.destroyed || drop || !data || data.byteLength === 0) return;
            try {
                const options = {
                    type: keyframe ? "key" : "delta",
                    timestamp: Math.round(Math.max(0, timestamp) * 1000000),
                    duration: Math.max(1, Math.round(Math.max(0, duration) * 1000000)),
                    data: data
                };
                if (kind === "video" && pipeline.videoDecoder) {
                    pipeline.videoDecoder.decode(new EncodedVideoChunk(options));
                } else if (kind === "audio" && pipeline.audioDecoder) {
                    options.type = "key";
                    pipeline.audioDecoder.decode(new EncodedAudioChunk(options));
                }
            } catch (error) {
                pipeline.report(error);
            }
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun playWebCodecsPipeline(
    pipeline: JsAny,
    onComplete: () -> Unit,
    onError: (String) -> Unit,
): Unit =
    js(
        """
        {
            try {
                pipeline.basePosition = pipeline.position;
                pipeline.baseWallTime = performance.now();
                pipeline.playing = true;
                pipeline.ended = false;
                const resumed =
                    pipeline.audioContext && pipeline.audioContext.state !== "running"
                        ? pipeline.audioContext.resume()
                        : Promise.resolve();
                // Browsers may keep resume() pending until a user gesture. Video and
                // the media clock can still start, so this must not hold the player's
                // serialized operation lock and block a later pause or seek.
                Promise.resolve(resumed).catch(function() {});
                onComplete();
            } catch (error) {
                pipeline.playing = false;
                onError(String(error && error.message ? error.message : error));
            }
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun pauseWebCodecsPipeline(pipeline: JsAny): Unit =
    js(
        """
        {
            pipeline.updatePosition();
            pipeline.playing = false;
            pipeline.basePosition = pipeline.position;
            pipeline.stopScheduledAudio();
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun setWebCodecsPipelinePosition(
    pipeline: JsAny,
    seconds: Double,
): Unit =
    js(
        """
        {
            pipeline.position = Math.max(0, seconds);
            pipeline.basePosition = pipeline.position;
            pipeline.baseWallTime = performance.now();
            pipeline.ended = false;
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun setWebCodecsPipelineVolume(
    pipeline: JsAny,
    volume: Float,
): Unit =
    js(
        """
        {
            pipeline.volume = Math.max(0, Math.min(1, volume));
            if (pipeline.gain) pipeline.gain.gain.value = pipeline.muted ? 0 : pipeline.volume;
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun setWebCodecsPipelineMuted(
    pipeline: JsAny,
    muted: Boolean,
): Unit =
    js(
        """
        {
            pipeline.muted = muted;
            if (pipeline.gain) pipeline.gain.gain.value = muted ? 0 : pipeline.volume;
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun setWebCodecsPipelineRate(
    pipeline: JsAny,
    rate: Float,
): Unit =
    js(
        """
        {
            pipeline.updatePosition();
            pipeline.rate = Math.max(0.25, Math.min(4, rate));
            pipeline.basePosition = pipeline.position;
            pipeline.baseWallTime = performance.now();
            pipeline.stopScheduledAudio();
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun setWebCodecsPipelineFitMode(
    pipeline: JsAny,
    fitMode: String,
): Unit = js("pipeline.fitMode = fitMode")

@Suppress("UNUSED_PARAMETER")
private fun webCodecsDecodeQueueSize(pipeline: JsAny): Int =
    js(
        """
        Number(
            (pipeline.videoDecoder ? pipeline.videoDecoder.decodeQueueSize : 0) +
            (pipeline.audioDecoder ? pipeline.audioDecoder.decodeQueueSize : 0)
        )
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun signalWebCodecsEndOfInput(pipeline: JsAny): Unit = js("pipeline.eof = true")

@Suppress("UNUSED_PARAMETER")
private fun destroyWebCodecsPipeline(pipeline: JsAny): Unit =
    js(
        """
        {
            if (pipeline.destroyed) return;
            pipeline.destroyed = true;
            pipeline.playing = false;
            cancelAnimationFrame(pipeline.animationFrame);
            pipeline.stopScheduledAudio();
            pipeline.closeFrames();
            pipeline.closeDecoders();
            pipeline.audioSegments.length = 0;
            if (pipeline.audioContext) {
                try { pipeline.audioContext.close(); } catch (_) {}
            }
        }
        """,
    )

private val ADAPTIVE_MIME_TYPES: Set<String> =
    setOf(
        "application/vnd.apple.mpegurl",
        "application/x-mpegurl",
        "audio/mpegurl",
        "audio/x-mpegurl",
        "application/dash+xml",
        "application/vnd.ms-sstr+xml",
    )

internal fun normalizedPlaybackBufferedRange(
    currentPosition: Duration,
    bufferedEnd: Duration,
): BufferedRange {
    val start = currentPosition.coerceAtLeast(Duration.ZERO)
    return BufferedRange(
        start = start,
        end = bufferedEnd.coerceAtLeast(start),
    )
}

internal fun packetContributesToPlaybackBuffer(
    packetStreamIndex: Int,
    activeVideoStreamIndex: Int?,
    activeAudioStreamIndex: Int?,
    activeAudioIsExternal: Boolean,
): Boolean =
    packetStreamIndex == activeVideoStreamIndex ||
        (!activeAudioIsExternal && packetStreamIndex == activeAudioStreamIndex)

private val HEVC_CODEC_NAMES: Set<String> = setOf("hevc", "h265", "hvc1", "hev1")
private val SOFTWARE_AUDIO_CODECS: Set<String> =
    setOf(
        "ac3",
        "ac-3",
        "eac3",
        "e-ac-3",
        "dts",
        "dca",
        "truehd",
        "mlp",
        "opus",
        "flac",
        "wmav2",
        "wmapro",
    )
private val COVER_ART_EXTENSIONS: Set<String> = setOf("jpg", "jpeg", "png", "webp", "avif", "gif")
private val FIRST_PLAY_REWIND_THRESHOLD: Duration = 1.seconds
private val MAX_BUFFER_AHEAD: Duration = 8.seconds
private val HUNGRY_AUDIO_BUFFER_AHEAD: Duration = 12.seconds
private val BUFFER_REPORT_STEP: Duration = 250L.milliseconds
private const val MAX_DECODE_QUEUE: Int = 48
private const val MAX_CONSECUTIVE_SOFTWARE_FAILURES: Int = 8
private const val SOFTWARE_AUDIO_BATCH_PACKETS: Int = 32
private const val SOFTWARE_AUDIO_BATCH_BYTES: Int = 512 * 1024
private const val SOFTWARE_AUDIO_BATCH_SECONDS: Double = 0.18
private const val HUNGRY_SOFTWARE_AUDIO_BATCH_SECONDS: Double = 0.08
private const val MAX_RETAINED_SUBTITLE_CUES: Int = 10_000
private const val DIAGNOSTICS_PACKET_INTERVAL: Int = 64
private const val QUALITY_VARIANT_TRACK_BASE: Int = 1_000_000
private const val EXTERNAL_AUDIO_TRACK_BASE: Int = 2_000_000
private const val EXTERNAL_SUBTITLE_TRACK_BASE: Int = 3_000_000
private const val AUDIO_PRIORITY_SECONDS: Double = 0.5
private const val MINIMUM_LATE_VIDEO_TOLERANCE_SECONDS: Double = 0.12
private const val MAXIMUM_LATE_VIDEO_TOLERANCE_SECONDS: Double = 0.25
private const val MINIMUM_VIDEO_FRAME_INTERVAL_SECONDS: Double = 1.0 / 240.0
private const val MAXIMUM_VIDEO_FRAME_INTERVAL_SECONDS: Double = 1.0
private const val EXTERNAL_AUDIO_BUFFER_AHEAD_SECONDS: Double = 8.0
private const val FULL_HD_PIXELS: Long = 1_920L * 1_080L
private const val UHD_PIXELS: Long = 3_840L * 2_160L
private const val PUMP_BACKOFF_MILLIS: Long = 20
private const val PUMP_YIELD_MILLIS: Long = 1

private fun browserMonotonicMilliseconds(): Double = js("performance.now()")
