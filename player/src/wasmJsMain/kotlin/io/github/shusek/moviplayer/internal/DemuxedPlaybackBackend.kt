@file:OptIn(ExperimentalWasmJsInterop::class)

package io.github.shusek.moviplayer.internal

import io.github.shusek.moviplayer.AudioTrack
import io.github.shusek.moviplayer.BufferedRange
import io.github.shusek.moviplayer.Demuxer
import io.github.shusek.moviplayer.EmbeddedSubtitleRenderer
import io.github.shusek.moviplayer.FileSource
import io.github.shusek.moviplayer.FitMode
import io.github.shusek.moviplayer.HttpSource
import io.github.shusek.moviplayer.MediaInfo
import io.github.shusek.moviplayer.MediaSource
import io.github.shusek.moviplayer.MediaTrack
import io.github.shusek.moviplayer.MoviError
import io.github.shusek.moviplayer.MoviErrorCategory
import io.github.shusek.moviplayer.MoviErrorCode
import io.github.shusek.moviplayer.MoviPlayerConfig
import io.github.shusek.moviplayer.MoviPlayerState
import io.github.shusek.moviplayer.Packet
import io.github.shusek.moviplayer.PlayerSurface
import io.github.shusek.moviplayer.RenderingBackend
import io.github.shusek.moviplayer.RenderingDiagnostics
import io.github.shusek.moviplayer.SubtitleFontAttachment
import io.github.shusek.moviplayer.SubtitlePacket
import io.github.shusek.moviplayer.SubtitleRendererConfiguration
import io.github.shusek.moviplayer.SubtitleTrack
import io.github.shusek.moviplayer.TrackKind
import io.github.shusek.moviplayer.TrackSelectionOutcome
import io.github.shusek.moviplayer.TrackSelectionRequest
import io.github.shusek.moviplayer.TrackSelectionStatus
import io.github.shusek.moviplayer.VideoTrack
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
import kotlin.time.Duration
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.Duration.Companion.seconds

internal class DemuxedPlaybackBackend(
    private val config: MoviPlayerConfig,
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

    init {
        showCanvas(config.canvas)
        observer.onSurface(PlayerSurface.Canvas(config.canvas))
    }

    override suspend fun load(source: MediaSource) {
        check(!closed) { "The backend is closed." }
        val adapter =
            when (source) {
                is MediaSource.BrowserFile -> FileSource(source.file)
                is MediaSource.Url -> HttpSource(source.url, source.headers)
                is MediaSource.Drm ->
                    throw MoviError(
                        MoviErrorCategory.DRM,
                        MoviErrorCode.DRM_CONFIGURATION_FAILED,
                        "DRM sources must use the browser media backend.",
                    )
            }
        val createdDemuxer = Demuxer(adapter, config.runtime)
        demuxer = createdDemuxer
        val info =
            demuxMutex.withLock {
                createdDemuxer.open()
            }
        if (closed) throw CancellationException("The backend was closed while loading.")
        mediaInfo = info
        activeVideo = info.videoTracks.firstOrNull { it.isDefault } ?: info.videoTracks.firstOrNull()
        activeAudio = info.audioTracks.firstOrNull { it.isDefault } ?: info.audioTracks.firstOrNull()
        activeSubtitle = null
        applyStreamDiscard()

        val createdPipeline =
            createWebCodecsPipeline(
                canvas = config.canvas,
                onTime = { seconds ->
                    if (closed) return@createWebCodecsPipeline
                    currentPosition = seconds.safeSeconds()
                    observer.onTime(currentPosition)
                },
                onState = { state ->
                    if (!closed) observer.onState(state.toMoviState())
                },
                onEnded = {
                    if (!closed) {
                        playing = false
                        observer.onEnded()
                    }
                },
                onError = { message ->
                    if (!closed) observer.onError(decodeError(message))
                },
            )
        pipeline = createdPipeline
        configurePipeline()
        applyPipelineSettings(createdPipeline)

        observer.onDuration(info.duration)
        observer.onMediaInfo(info)
        observer.onDiagnostics(
            RenderingDiagnostics(
                backend = RenderingBackend.WEBCODECS,
                decoder = "WebCodecs",
                renderer = "Canvas2D + Web Audio",
                container = info.formatName,
            ),
        )
        observer.onState(MoviPlayerState.READY)
        startPump()
    }

    override suspend fun play() {
        val activePipeline = pipeline ?: throw invalidState()
        val deferred = CompletableDeferred<Unit>()
        playWebCodecsPipeline(
            pipeline = activePipeline,
            onComplete = { deferred.complete(Unit) },
            onError = { message -> deferred.completeExceptionally(decodeError(message)) },
        )
        deferred.await()
        playing = true
        observer.onState(MoviPlayerState.PLAYING)
        if (pumpJob?.isActive != true && !endOfInput) startPump()
    }

    override fun pause() {
        playing = false
        pipeline?.let(::pauseWebCodecsPipeline)
        observer.onState(MoviPlayerState.PAUSED)
    }

    override suspend fun seek(position: Duration) {
        val activeDemuxer = demuxer ?: throw invalidState()
        val activePipeline = pipeline ?: throw invalidState()
        val safePosition = position.coerceIn(Duration.ZERO, mediaInfo?.duration ?: position)
        val resume = playing
        playing = false
        pauseWebCodecsPipeline(activePipeline)
        pumpJob?.cancelAndJoin()
        demuxMutex.withLock {
            activeDemuxer.seek(safePosition)
        }
        currentPosition = safePosition
        bufferedEnd = safePosition
        lastReportedBufferEnd = safePosition
        endOfInput = false
        configurePipeline()
        setWebCodecsPipelinePosition(activePipeline, safePosition.inWholeMilliseconds / 1_000.0)
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
                TrackKind.VIDEO -> activeVideo
                TrackKind.AUDIO -> activeAudio
                TrackKind.SUBTITLE -> activeSubtitle
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
            TrackKind.VIDEO -> activeVideo
            TrackKind.AUDIO -> activeAudio
            TrackKind.SUBTITLE -> activeSubtitle
        }

    override fun setVolume(volume: Float) {
        requestedVolume = volume.coerceIn(0f, 1f)
        pipeline?.let { setWebCodecsPipelineVolume(it, requestedVolume) }
    }

    override fun setMuted(muted: Boolean) {
        requestedMuted = muted
        pipeline?.let { setWebCodecsPipelineMuted(it, muted) }
    }

    override fun setPlaybackRate(rate: Float) {
        requestedRate = rate.coerceIn(0.25f, 4f)
        pipeline?.let { setWebCodecsPipelineRate(it, requestedRate) }
    }

    override fun setFitMode(fitMode: FitMode) {
        pipeline?.let { setWebCodecsPipelineFitMode(it, fitMode.name.lowercase()) }
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

    override fun close() {
        if (closed) return
        closed = true
        playing = false
        val closingPump = pumpJob
        val closingDemuxer = demuxer
        closingPump?.cancel()
        pumpJob = null
        scope.cancel()
        pipeline?.let(::destroyWebCodecsPipeline)
        pipeline = null
        demuxer = null
        subtitleRenderer?.clear()
        subtitleRenderer = null
        subtitleOverlay?.let(::removeSubtitleOverlay)
        subtitleOverlay = null
        cleanupScope.launch {
            closingPump?.cancelAndJoin()
            demuxMutex.withLock {
                closingDemuxer?.close()
            }
        }
    }

    private suspend fun configurePipeline() {
        val activePipeline = pipeline ?: throw invalidState()
        val activeDemuxer = demuxer ?: throw invalidState()
        val video = activeVideo
        val audio = activeAudio
        val videoDescription = video?.let { activeDemuxer.getExtradata(it.id) }
        val audioDescription = audio?.let { activeDemuxer.getExtradata(it.id) }
        val videoCodec = video?.webCodecsCodec(videoDescription)
        val audioCodec = audio?.webCodecsCodec()
        if (video != null && videoCodec == null && audioCodec == null) {
            throw MoviError(
                MoviErrorCategory.DECODER,
                MoviErrorCode.UNSUPPORTED_CODEC,
                "No selected media track has a WebCodecs-compatible codec.",
            )
        }

        val deferred = CompletableDeferred<Unit>()
        configureWebCodecsPipeline(
            pipeline = activePipeline,
            videoCodec = videoCodec.orEmpty(),
            videoWidth = video?.width ?: 0,
            videoHeight = video?.height ?: 0,
            videoDescription = videoDescription?.toInt8Array(),
            audioCodec = audioCodec.orEmpty(),
            audioSampleRate = audio?.sampleRate ?: 0,
            audioChannels = audio?.channels ?: 0,
            audioDescription = audioDescription?.toInt8Array(),
            duration = mediaInfo?.duration?.inWholeMilliseconds?.div(1_000.0) ?: 0.0,
            onComplete = { deferred.complete(Unit) },
            onError = { message -> deferred.completeExceptionally(decodeError(message)) },
        )
        deferred.await()
    }

    private suspend fun configureSubtitleRenderer() {
        val renderer = subtitleRenderer ?: return
        val track = activeSubtitle
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
    }

    private suspend fun pumpPackets() {
        val activeDemuxer = demuxer ?: return
        while (currentCoroutineContext().isActive && !closed && !endOfInput) {
            val ahead = bufferedEnd - currentPosition
            val queueSize = pipeline?.let(::webCodecsDecodeQueueSize) ?: 0
            if (ahead > MAX_BUFFER_AHEAD || queueSize > MAX_DECODE_QUEUE) {
                delay(PUMP_BACKOFF_MILLIS)
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
                endOfInput = true
                pipeline?.let(::signalWebCodecsEndOfInput)
                return
            }
            bufferedEnd = maxOf(bufferedEnd, packet.presentationTime + packet.duration)
            dispatchPacket(packet)
            if (bufferedEnd - lastReportedBufferEnd >= BUFFER_REPORT_STEP) {
                lastReportedBufferEnd = bufferedEnd
                observer.onBuffered(
                    listOf(
                        BufferedRange(
                            start = currentPosition.coerceAtLeast(Duration.ZERO),
                            end = bufferedEnd,
                        ),
                    ),
                )
            }
            delay(PUMP_YIELD_MILLIS)
        }
    }

    private suspend fun dispatchPacket(packet: Packet) {
        when (packet.streamIndex) {
            activeVideo?.id ->
                pipeline?.let { activePipeline ->
                    pushWebCodecsPacket(
                        pipeline = activePipeline,
                        kind = "video",
                        data = packet.data.toInt8Array(),
                        timestamp = packet.presentationTime.inWholeMilliseconds / 1_000.0,
                        duration = packet.duration.inWholeMilliseconds / 1_000.0,
                        keyframe = packet.keyframe,
                        drop = packet.isRasl,
                    )
                }
            activeAudio?.id ->
                pipeline?.let { activePipeline ->
                    pushWebCodecsPacket(
                        pipeline = activePipeline,
                        kind = "audio",
                        data = packet.data.toInt8Array(),
                        timestamp = packet.presentationTime.inWholeMilliseconds / 1_000.0,
                        duration = packet.duration.inWholeMilliseconds / 1_000.0,
                        keyframe = true,
                        drop = false,
                    )
                }
            activeSubtitle?.id ->
                subtitleRenderer?.pushPacket(
                    SubtitlePacket(
                        data = packet.data,
                        presentationTime = packet.presentationTime,
                        duration = packet.duration,
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
            activeDemuxer.setStreamDiscard(track.id, !enabled)
        }
    }

    private fun applyPipelineSettings(activePipeline: JsAny) {
        setWebCodecsPipelineVolume(activePipeline, requestedVolume)
        setWebCodecsPipelineMuted(activePipeline, requestedMuted)
        setWebCodecsPipelineRate(activePipeline, requestedRate)
    }

    private fun notReadyOutcome(request: TrackSelectionRequest): TrackSelectionOutcome =
        TrackSelectionOutcome(
            kind = request.kind,
            status = TrackSelectionStatus.FAILED,
            requestedTrackId = request.requestedTrackId(),
            activeTrack = null,
            error = invalidState(),
        )

    private fun invalidState(): MoviError =
        MoviError(
            MoviErrorCategory.STATE,
            MoviErrorCode.INVALID_STATE,
            "The demuxed playback backend is not loaded.",
        )
}

internal fun MediaSource.requiresDemuxedPlayback(): Boolean {
    if (this is MediaSource.Url && url.startsWith("blob:", ignoreCase = true)) return true
    val extension =
        when (this) {
            is MediaSource.Url -> url.substringBefore('?').substringBefore('#').substringAfterLast('.', "")
            is MediaSource.BrowserFile -> file.name.substringAfterLast('.', "")
            is MediaSource.Drm -> return false
        }.lowercase()
    return extension in DEMUXED_CONTAINER_EXTENSIONS
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
        "av1", "av01" -> "av01.0.08M.${if (pixelFormat.orEmpty().contains("10")) "10" else "08"}"
        "h264", "avc", "avc1" -> description?.avcCodecString() ?: "avc1.42E01E"
        "hevc", "h265", "hvc1", "hev1" -> "hvc1.1.6.L93.B0"
        else -> codecString
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

private fun ByteArray.avcCodecString(): String? {
    if (size < 4 || this[0].toInt() != 1) return null
    return "avc1." +
        listOf(this[1], this[2], this[3]).joinToString("") { byte ->
            (byte.toInt() and 0xff).toString(16).padStart(2, '0')
        }
}

private fun Double.safeSeconds(): Duration =
    if (isFinite() && this >= 0.0) seconds else Duration.ZERO

private fun String.toMoviState(): MoviPlayerState =
    when (this) {
        "playing" -> MoviPlayerState.PLAYING
        "paused" -> MoviPlayerState.PAUSED
        "buffering" -> MoviPlayerState.BUFFERING
        "ended" -> MoviPlayerState.ENDED
        else -> MoviPlayerState.READY
    }

private fun decodeError(message: String): MoviError =
    MoviError(
        MoviErrorCategory.DECODER,
        MoviErrorCode.DECODE_FAILED,
        message,
    )

private fun Throwable.toDecoderError(): MoviError =
    this as? MoviError
        ?: MoviError(
            MoviErrorCategory.DECODER,
            MoviErrorCode.DECODE_FAILED,
            message ?: "The demuxed playback pipeline failed.",
            this,
        )

private fun Throwable.toRendererError(): MoviError =
    this as? MoviError
        ?: MoviError(
            MoviErrorCategory.RENDERER,
            MoviErrorCode.RENDER_FAILED,
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

private val DEMUXED_CONTAINER_EXTENSIONS: Set<String> =
    setOf("mkv", "mka", "avi", "ts", "m2ts", "mts")
private val MAX_BUFFER_AHEAD: Duration = 8.seconds
private val BUFFER_REPORT_STEP: Duration = 250L.milliseconds
private const val MAX_DECODE_QUEUE: Int = 48
private const val PUMP_BACKOFF_MILLIS: Long = 20
private const val PUMP_YIELD_MILLIS: Long = 1
