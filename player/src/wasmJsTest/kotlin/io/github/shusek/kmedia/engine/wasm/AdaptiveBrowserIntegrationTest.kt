@file:OptIn(
    kotlinx.coroutines.ExperimentalCoroutinesApi::class,
    kotlin.js.ExperimentalWasmJsInterop::class,
)

package io.github.shusek.kmedia.engine.wasm

import kotlinx.browser.document
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.cancelAndJoin
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.test.runCurrent
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout
import org.w3c.dom.HTMLVideoElement
import kotlin.js.ExperimentalWasmJsInterop
import kotlin.js.js
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertFalse
import kotlin.test.assertTrue
import kotlin.time.Duration.Companion.seconds

class AdaptiveBrowserIntegrationTest {
    @Test
    fun preparedBrowserSourceAttachesBeforeLoadAndIsReleasedExactlyOnce() =
        runTest(timeout = 60.seconds) {
            val config = WasmMediaPlayerConfig()
            val canvas = config.canvas
            document.body?.appendChild(canvas)
            val adapter =
                RecordingBrowserMediaSourceAdapter(
                    url = "/base/kotlin/media/vp8-vorbis.webm",
                    mimeType = "video/webm",
                )
            val player = WasmMediaPlayer(config)
            try {
                player.load(MediaSource.BrowserMedia(adapter))
                assertEquals(WasmMediaPlayerState.READY, player.state.value)
                assertEquals(1, adapter.attachCount)
                assertTrue(adapter.attachedBeforeSourceAssignment)
                assertTrue(player.surface.value is PlayerSurface.NativeVideo)
            } finally {
                player.close()
                player.close()
                canvas.remove()
            }
            assertEquals(1, adapter.detachCount)
            assertEquals(1, adapter.closeCount)
        }

    @Test
    fun preparedBrowserSourceOwnershipSurvivesReplacementFailureAndCancellation() =
        runTest(timeout = 60.seconds) {
            val first =
                RecordingBrowserMediaSourceAdapter(
                    url = "/base/kotlin/media/vp8-vorbis.webm",
                    mimeType = "video/webm",
                )
            val second =
                RecordingBrowserMediaSourceAdapter(
                    url = "/base/kotlin/media/vp8-vorbis.webm",
                    mimeType = "video/webm",
                )
            val player = WasmMediaPlayer(WasmMediaPlayerConfig())
            player.load(MediaSource.BrowserMedia(first))
            player.load(MediaSource.BrowserMedia(second))
            assertEquals(1, first.detachCount)
            assertEquals(1, first.closeCount)
            assertEquals(0, second.detachCount)
            assertEquals(0, second.closeCount)
            player.close()
            player.close()
            assertEquals(1, second.detachCount)
            assertEquals(1, second.closeCount)

            val failed =
                RecordingBrowserMediaSourceAdapter(
                    url = "/base/kotlin/media/h264-aac.mp4",
                    mimeType = "video/mp4",
                    attachFailure = "prepared source failed",
                )
            val failedPlayer = WasmMediaPlayer(WasmMediaPlayerConfig())
            assertFailsWith<WasmMediaError> {
                failedPlayer.load(MediaSource.BrowserMedia(failed))
            }
            assertEquals(1, failed.detachCount)
            assertEquals(1, failed.closeCount)
            failedPlayer.close()
            assertEquals(1, failed.detachCount)
            assertEquals(1, failed.closeCount)

            val cancelled =
                RecordingBrowserMediaSourceAdapter(
                    url = "/base/kotlin/media/never-resolves.mp4",
                    mimeType = "video/mp4",
                )
            val cancelledPlayer = WasmMediaPlayer(WasmMediaPlayerConfig())
            val loadJob = launch { cancelledPlayer.load(MediaSource.BrowserMedia(cancelled)) }
            runCurrent()
            loadJob.cancelAndJoin()
            assertEquals(1, cancelled.detachCount)
            assertEquals(1, cancelled.closeCount)
            cancelledPlayer.close()
            assertEquals(1, cancelled.detachCount)
            assertEquals(1, cancelled.closeCount)
        }

    @Test
    fun clearAdaptiveTransformsUseEngineOwnedCanvasWhileProtectedTransformsFailClosed() =
        runTest(timeout = 60.seconds) {
            val config =
                WasmMediaPlayerConfig(
                    projection = ProjectionConfiguration(mode = ProjectionMode.EQUIRECTANGULAR),
                )
            val canvas = config.canvas
            document.body?.appendChild(canvas)
            val player =
                WasmMediaPlayer(config)
            try {
                player.load(
                    MediaSource.Url(
                        "/base/kotlin/media/vod.m3u8",
                        mimeType = "application/vnd.apple.mpegurl",
                    ),
                )
                val surface = player.surface.value as PlayerSurface.Canvas
                assertTrue(surface.mediaElement != null)
                assertTrue(player.diagnostics.value.renderer.orEmpty().contains("canvas"))
            } finally {
                player.close()
            }

            val protectedPlayer =
                WasmMediaPlayer(
                    WasmMediaPlayerConfig(
                        projection = ProjectionConfiguration(mode = ProjectionMode.EQUIRECTANGULAR),
                    ),
                )
            val failure =
                assertFailsWith<WasmMediaError> {
                    protectedPlayer.load(
                        MediaSource.Drm(
                            mediaUrl = "https://media.example.test/manifest.mpd",
                            licenseUrl = "https://license.example.test/widevine",
                        ),
                    )
                }
            assertEquals(WasmMediaErrorCode.PROTECTED_CONTENT_TRANSFORM_UNSUPPORTED, failure.code)
            protectedPlayer.close()
            canvas.remove()
        }

    @Test
    fun shakaOrNativeFallbackLoadsRealHlsAndDashManifests() =
        runTest(timeout = 60.seconds) {
            listOf(
                "/base/kotlin/media/vod.m3u8" to "application/vnd.apple.mpegurl",
                (
                    if (browserSupportsH264Mse()) {
                        "/base/kotlin/media/vod.mpd"
                    } else {
                        "/base/kotlin/media/single-file.mpd"
                    }
                ) to "application/dash+xml",
            ).forEach { (url, mimeType) ->
                val config =
                    WasmMediaPlayerConfig(
                        runtime = WasmRuntimeConfig("/base/kotlin/kmedia-wasm-runtime/"),
                    )
                val canvas = config.canvas
                document.body?.appendChild(canvas)
                val player = WasmMediaPlayer(config)
                try {
                    player.load(MediaSource.Url(url, mimeType = mimeType))
                    assertEquals(WasmMediaPlayerState.READY, player.state.value)
                    assertEquals(SourceMode.ADAPTIVE, player.diagnostics.value.sourceMode)
                    assertTrue(
                        player.diagnostics.value.backend in
                            setOf(
                                RenderingBackend.SHAKA,
                                RenderingBackend.HLS_JS,
                                RenderingBackend.DASH_JS,
                                RenderingBackend.SOFTWARE_WASM,
                            ),
                    )
                    assertTrue(player.mediaInfo.value?.videoTracks?.isNotEmpty() == true)
                    assertTrue(player.mediaInfo.value?.audioTracks?.isNotEmpty() == true)
                } finally {
                    player.close()
                    canvas.remove()
                }
            }
        }

    @Test
    fun liveHlsPublishesDvrWindowAndSeeksToLiveEdge() =
        runTest(timeout = 60.seconds) {
            val config =
                WasmMediaPlayerConfig(
                    runtime = WasmRuntimeConfig("/base/kotlin/kmedia-wasm-runtime/"),
                )
            val canvas = config.canvas
            document.body?.appendChild(canvas)
            val player = WasmMediaPlayer(config)
            try {
                player.load(
                    MediaSource.Url(
                        "/base/kotlin/media/live.m3u8",
                        mimeType = "application/vnd.apple.mpegurl",
                    ),
                )
                val window =
                    withContext(Dispatchers.Default.limitedParallelism(1)) {
                        withTimeout(10.seconds) {
                            player.liveWindow.filterNotNull().first()
                        }
                    }
                assertTrue(window.end > window.start)
                assertEquals(window.end, window.liveEdge)
                if (browserSupportsH264Mse()) player.seekToLive()
                assertEquals(window, player.diagnostics.value.liveWindow)
            } finally {
                player.close()
                canvas.remove()
            }
        }
}

@OptIn(ExperimentalWasmJsInterop::class)
private fun browserSupportsH264Mse(): Boolean =
    js(
        """
        typeof MediaSource === "function" &&
            typeof MediaSource.isTypeSupported === "function" &&
            MediaSource.isTypeSupported('video/mp4; codecs="avc1.42c00a, mp4a.40.2"')
        """,
    )

private class RecordingBrowserMediaSourceAdapter(
    override val url: String,
    override val mimeType: String?,
    private val attachFailure: String? = null,
) : BrowserMediaSourceAdapter {
    var attachCount: Int = 0
    var detachCount: Int = 0
    var closeCount: Int = 0
    var attachedBeforeSourceAssignment: Boolean = false

    override fun attach(
        video: HTMLVideoElement,
        onFailure: (String) -> Unit,
    ) {
        attachCount += 1
        attachedBeforeSourceAssignment = video.getAttribute("src").isNullOrBlank() && video.currentSrc.isBlank()
        attachFailure?.let(onFailure)
    }

    override fun detach(video: HTMLVideoElement) {
        detachCount += 1
    }

    override fun close() {
        closeCount += 1
    }
}
