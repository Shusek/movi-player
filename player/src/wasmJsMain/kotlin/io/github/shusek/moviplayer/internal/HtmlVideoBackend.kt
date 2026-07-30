@file:OptIn(ExperimentalWasmJsInterop::class)

package io.github.shusek.moviplayer.internal

import io.github.shusek.moviplayer.AudioTrack
import io.github.shusek.moviplayer.BufferedRange
import io.github.shusek.moviplayer.FitMode
import io.github.shusek.moviplayer.MediaInfo
import io.github.shusek.moviplayer.MediaSource
import io.github.shusek.moviplayer.MoviError
import io.github.shusek.moviplayer.MoviErrorCategory
import io.github.shusek.moviplayer.MoviErrorCode
import io.github.shusek.moviplayer.MoviPlayerConfig
import io.github.shusek.moviplayer.MoviPlayerState
import io.github.shusek.moviplayer.PlayerSurface
import io.github.shusek.moviplayer.RenderingBackend
import io.github.shusek.moviplayer.RenderingDiagnostics
import io.github.shusek.moviplayer.VideoTrack
import kotlinx.browser.document
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CompletableDeferred
import org.w3c.dom.HTMLVideoElement
import kotlin.js.ExperimentalWasmJsInterop
import kotlin.js.JsAny
import kotlin.js.js
import kotlin.time.Duration
import kotlin.time.Duration.Companion.seconds

internal class HtmlVideoBackend(
    private val config: MoviPlayerConfig,
    private val observer: BackendObserver,
) : PlayerBackend {
    private val video: HTMLVideoElement = document.createElement("video") as HTMLVideoElement
    private var bridge: JsAny? = null
    private var objectUrl: String? = null
    private var closed: Boolean = false
    private var duration: Duration = Duration.ZERO
    private var currentInfo: MediaInfo? = null
    private val pendingRanges: MutableList<BufferedRange> = mutableListOf()
    private val pendingOperations: MutableSet<CompletableDeferred<Unit>> = mutableSetOf()

    init {
        mountNativeVideo(config.canvas, video)
        observer.onSurface(PlayerSurface.NativeVideo(video))
    }

    override suspend fun load(source: MediaSource) {
        check(!closed) { "The backend is closed." }
        val deferred = CompletableDeferred<Unit>()
        val descriptor = source.toDescriptor()
        if (source is MediaSource.BrowserFile) {
            objectUrl = createObjectUrl(source.file)
        }
        bridge =
            createVideoBridge(
                video = video,
                kind = descriptor.kind,
                sourceUrl = objectUrl ?: descriptor.sourceUrl,
                mediaHeadersJson = descriptor.mediaHeaders.toJsonObject(),
                licenseUrl = descriptor.licenseUrl.orEmpty(),
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
                                listOf(
                                    VideoTrack(
                                        id = 0,
                                        codec = descriptor.kind,
                                        width = videoWidth(video),
                                        height = videoHeight(video),
                                        frameRate = 0.0,
                                        isDefault = true,
                                    ),
                                    AudioTrack(
                                        id = 1,
                                        codec = "browser",
                                        channels = 0,
                                        sampleRate = 0,
                                        isDefault = true,
                                    ),
                                ),
                        )
                    currentInfo = info
                    observer.onDuration(duration)
                    observer.onMediaInfo(info)
                    observer.onDiagnostics(
                        RenderingDiagnostics(
                            backend = descriptor.backend,
                            decoder = "browser",
                            renderer = "HTMLVideoElement",
                            container = descriptor.kind,
                        ),
                    )
                    observer.onState(MoviPlayerState.READY)
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
                onError = { message ->
                    val error =
                        MoviError(
                            category =
                                if (source is MediaSource.Drm) {
                                    MoviErrorCategory.DRM
                                } else {
                                    MoviErrorCategory.SOURCE
                                },
                            code =
                                if (source is MediaSource.Drm) {
                                    MoviErrorCode.DRM_CONFIGURATION_FAILED
                                } else {
                                    MoviErrorCode.SOURCE_UNAVAILABLE
                                },
                            message = message,
                        )
                    if (!deferred.isCompleted) deferred.completeExceptionally(error)
                    observer.onError(error)
                },
            )
        deferred.awaitTracked()
    }

    override suspend fun play() {
        val active = bridge ?: throw invalidState()
        val deferred = CompletableDeferred<Unit>()
        playVideoBridge(
            bridge = active,
            onPlayed = { deferred.complete(Unit) },
            onError = { message ->
                deferred.completeExceptionally(
                    MoviError(
                        MoviErrorCategory.STATE,
                        MoviErrorCode.INVALID_STATE,
                        message,
                    ),
                )
            },
        )
        deferred.awaitTracked()
    }

    override fun pause() {
        bridge?.let(::pauseVideoBridge)
    }

    override suspend fun seek(position: Duration) {
        val active = bridge ?: throw invalidState()
        val deferred = CompletableDeferred<Unit>()
        seekVideoBridge(
            bridge = active,
            seconds = position.inWholeMilliseconds / 1_000.0,
            onSeeked = { deferred.complete(Unit) },
            onError = { message ->
                deferred.completeExceptionally(
                    MoviError(
                        MoviErrorCategory.STATE,
                        MoviErrorCode.INVALID_STATE,
                        message,
                    ),
                )
            },
        )
        deferred.awaitTracked()
    }

    override fun setVolume(volume: Float) {
        bridge?.let { setVideoBridgeVolume(it, volume.coerceIn(0f, 1f)) }
    }

    override fun setMuted(muted: Boolean) {
        bridge?.let { setVideoBridgeMuted(it, muted) }
    }

    override fun setPlaybackRate(rate: Float) {
        bridge?.let { setVideoBridgeRate(it, rate.coerceIn(0.25f, 4f)) }
    }

    override fun setFitMode(fitMode: FitMode) {
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

    override fun close() {
        if (closed) return
        closed = true
        val cancellation = CancellationException("The browser media backend was closed.")
        pendingOperations.toList().forEach { operation ->
            operation.completeExceptionally(cancellation)
        }
        pendingOperations.clear()
        bridge?.let(::destroyVideoBridge)
        bridge = null
        objectUrl?.let(::revokeObjectUrl)
        objectUrl = null
        video.remove()
    }

    private fun invalidState(): MoviError =
        MoviError(
            MoviErrorCategory.STATE,
            MoviErrorCode.INVALID_STATE,
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
    val licenseUrl: String?,
    val licenseHeaders: Map<String, String>,
    val backend: RenderingBackend,
)

private fun MediaSource.toDescriptor(): VideoSourceDescriptor =
    when (this) {
        is MediaSource.BrowserFile ->
            VideoSourceDescriptor(
                kind = file.name.substringAfterLast('.', "file").lowercase(),
                sourceUrl = "",
                mediaHeaders = emptyMap(),
                licenseUrl = null,
                licenseHeaders = emptyMap(),
                backend = RenderingBackend.NATIVE_VIDEO,
            )

        is MediaSource.Drm ->
            VideoSourceDescriptor(
                kind = "drm",
                sourceUrl = mediaUrl,
                mediaHeaders = mediaHeaders,
                licenseUrl = licenseUrl,
                licenseHeaders = licenseHeaders,
                backend = RenderingBackend.SHAKA,
            )

        is MediaSource.Url -> {
            val dataMime =
                url
                    .takeIf { it.startsWith("data:", ignoreCase = true) }
                    ?.substringAfter("data:", "")
                    ?.substringBefore(';')
                    ?.lowercase()
            val clean = url.substringBefore('?').substringBefore('#').lowercase()
            when {
                dataMime == "video/mp4" ->
                    VideoSourceDescriptor(
                        kind = "mp4",
                        sourceUrl = url,
                        mediaHeaders = headers,
                        licenseUrl = null,
                        licenseHeaders = emptyMap(),
                        backend = RenderingBackend.NATIVE_VIDEO,
                    )

                dataMime == "video/webm" ->
                    VideoSourceDescriptor(
                        kind = "webm",
                        sourceUrl = url,
                        mediaHeaders = headers,
                        licenseUrl = null,
                        licenseHeaders = emptyMap(),
                        backend = RenderingBackend.NATIVE_VIDEO,
                    )

                clean.endsWith(".m3u8") ->
                    VideoSourceDescriptor(
                        kind = "hls",
                        sourceUrl = url,
                        mediaHeaders = headers,
                        licenseUrl = null,
                        licenseHeaders = emptyMap(),
                        backend = RenderingBackend.HLS_JS,
                    )

                clean.endsWith(".mpd") ->
                    VideoSourceDescriptor(
                        kind = "dash",
                        sourceUrl = url,
                        mediaHeaders = headers,
                        licenseUrl = null,
                        licenseHeaders = emptyMap(),
                        backend = RenderingBackend.DASH_JS,
                    )

                clean.endsWith(".ism") ||
                    clean.endsWith(".isml") ||
                    clean.contains(".ism/manifest") ||
                    clean.contains(".isml/manifest") ->
                    VideoSourceDescriptor(
                        kind = "mss",
                        sourceUrl = url,
                        mediaHeaders = headers,
                        licenseUrl = null,
                        licenseHeaders = emptyMap(),
                        backend = RenderingBackend.SHAKA,
                    )

                else ->
                    VideoSourceDescriptor(
                        kind = clean.substringAfterLast('.', "video"),
                        sourceUrl = url,
                        mediaHeaders = headers,
                        licenseUrl = null,
                        licenseHeaders = emptyMap(),
                        backend = RenderingBackend.NATIVE_VIDEO,
                    )
            }
        }
    }

private fun Double.validSeconds(): Duration =
    if (isFinite() && this >= 0.0) seconds else Duration.ZERO

private fun String.toPlayerState(): MoviPlayerState =
    when (this) {
        "playing" -> MoviPlayerState.PLAYING
        "paused" -> MoviPlayerState.PAUSED
        "seeking" -> MoviPlayerState.SEEKING
        "buffering" -> MoviPlayerState.BUFFERING
        "ended" -> MoviPlayerState.ENDED
        "ready" -> MoviPlayerState.READY
        else -> MoviPlayerState.READY
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
private fun mountNativeVideo(
    canvas: org.w3c.dom.HTMLCanvasElement,
    video: HTMLVideoElement,
): Unit =
    js(
        """
        {
            const parent = canvas.parentElement;
            if (!parent) throw new Error("The player canvas must be mounted before loading media.");
            video.playsInline = true;
            video.preload = "auto";
            video.style.position = "absolute";
            video.style.inset = "0";
            video.style.width = "100%";
            video.style.height = "100%";
            video.style.objectFit = "contain";
            video.style.zIndex = "1";
            canvas.style.visibility = "hidden";
            parent.appendChild(video);
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
    licenseUrl: String,
    licenseHeadersJson: String,
    onReady: (Double) -> Unit,
    onState: (String) -> Unit,
    onTime: (Double) -> Unit,
    onBufferReset: () -> Unit,
    onBufferRange: (Double, Double, Boolean) -> Unit,
    onEnded: () -> Unit,
    onError: (String) -> Unit,
): JsAny =
    js(
        """
        (function() {
            const subscriptions = [];
            const bridge = {
                video: video,
                engine: null,
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
            const licenseHeaders = parseHeaders(licenseHeadersJson);
            const reportError = function(error) {
                if (bridge.destroyed) return;
                const message = error && error.message ? error.message : String(error || "Playback failed.");
                onError(message);
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
            listen("loadedmetadata", function() {
                onReady(Number.isFinite(video.duration) ? video.duration : 0);
            });
            listen("durationchange", function() {
                if (video.readyState >= 1) onReady(Number.isFinite(video.duration) ? video.duration : 0);
            });
            listen("timeupdate", function() { onTime(Number(video.currentTime || 0)); });
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
                video.src = sourceUrl;
                video.load();
            };
            if (kind === "hls") {
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
                        engine.on(Hls.Events.ERROR, function(_, data) {
                            if (data && data.fatal) reportError(data.details || data.type || "HLS playback failed.");
                        });
                        engine.loadSource(sourceUrl);
                        engine.attachMedia(video);
                    })
                    .catch(reportError);
            } else if (kind === "dash") {
                import("dashjs")
                    .then(function(imported) {
                        if (bridge.destroyed) return;
                        const dash = imported.default || imported;
                        const factory = dash.MediaPlayer || imported.MediaPlayer;
                        if (typeof factory !== "function") throw new Error("dash.js is unavailable.");
                        const engine = factory().create();
                        bridge.engine = engine;
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
                        engine.initialize(video, sourceUrl, false);
                    })
                    .catch(reportError);
            } else if (kind === "drm" || kind === "mss") {
                import("shaka-player")
                    .then(function(imported) {
                        if (bridge.destroyed) return;
                        const shaka = imported.default || imported;
                        const Player = shaka.Player || imported.Player;
                        if (typeof Player !== "function") throw new Error("Shaka Player is unavailable.");
                        const engine = new Player();
                        bridge.engine = engine;
                        return Promise.resolve(engine.attach(video)).then(function() {
                            if (kind === "drm") {
                                const config = { drm: { servers: { "com.widevine.alpha": licenseUrl } } };
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
                            return engine.load(sourceUrl);
                        });
                    })
                    .catch(reportError);
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
): Unit = js("bridge.video.volume = volume")

@Suppress("UNUSED_PARAMETER")
private fun setVideoBridgeMuted(
    bridge: JsAny,
    muted: Boolean,
): Unit = js("bridge.video.muted = muted")

@Suppress("UNUSED_PARAMETER")
private fun setVideoBridgeRate(
    bridge: JsAny,
    rate: Float,
): Unit = js("bridge.video.playbackRate = rate")

@Suppress("UNUSED_PARAMETER")
private fun setVideoFitMode(
    video: HTMLVideoElement,
    fitMode: String,
): Unit = js("video.style.objectFit = fitMode")

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
