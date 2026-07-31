@file:Suppress("FunctionNaming")
@file:OptIn(kotlinx.coroutines.ExperimentalCoroutinesApi::class)

package io.github.shusek.kmedia.engine.wasm

import io.github.shusek.kmedia.engine.wasm.internal.BackendObserver
import io.github.shusek.kmedia.engine.wasm.internal.PlayerBackend
import io.github.shusek.kmedia.engine.wasm.internal.PlayerBackendFactory
import io.github.shusek.kmedia.engine.wasm.internal.normalizedPlaybackBufferedRange
import io.github.shusek.kmedia.engine.wasm.internal.packetContributesToPlaybackBuffer
import io.github.shusek.kmedia.engine.wasm.internal.parseExternalSubtitleText
import io.github.shusek.kmedia.engine.wasm.internal.requiresDemuxedPlayback
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.runCurrent
import kotlinx.coroutines.test.runTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue
import kotlin.time.Duration
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.Duration.Companion.seconds

class WasmMediaPlayerTest {
    @Test
    fun timedMetadataDoesNotStopPacketPumpingBeforeActiveMedia() {
        assertFalse(
            packetContributesToPlaybackBuffer(
                packetStreamIndex = 2,
                activeVideoStreamIndex = 0,
                activeAudioStreamIndex = 1,
                activeAudioIsExternal = false,
            ),
        )
        assertTrue(
            packetContributesToPlaybackBuffer(
                packetStreamIndex = 0,
                activeVideoStreamIndex = 0,
                activeAudioStreamIndex = 1,
                activeAudioIsExternal = false,
            ),
        )
        assertTrue(
            packetContributesToPlaybackBuffer(
                packetStreamIndex = 1,
                activeVideoStreamIndex = null,
                activeAudioStreamIndex = 1,
                activeAudioIsExternal = false,
            ),
        )
        assertFalse(
            packetContributesToPlaybackBuffer(
                packetStreamIndex = 1,
                activeVideoStreamIndex = null,
                activeAudioStreamIndex = 1,
                activeAudioIsExternal = true,
            ),
        )
    }

    @Test
    fun softwareBufferRangeNeverEndsBeforeThePlaybackClock() {
        assertEquals(
            BufferedRange(start = 2.seconds, end = 2.seconds),
            normalizedPlaybackBufferedRange(
                currentPosition = 2.seconds,
                bufferedEnd = 1.seconds,
            ),
        )
        assertEquals(
            BufferedRange(start = Duration.ZERO, end = 1.seconds),
            normalizedPlaybackBufferedRange(
                currentPosition = (-1).seconds,
                bufferedEnd = 1.seconds,
            ),
        )
    }

    @Test
    fun playerExposesTypedStateAndForwardsControls() =
        runTest {
            val backend = FakeBackend()
            val player =
                WasmMediaPlayer(
                    config = testConfig(),
                    backendFactory =
                        PlayerBackendFactory { _, observer ->
                            backend.observer = observer
                            backend
                        },
                )

            player.setVolume(0.4f)
            player.setMuted(true)
            player.setPlaybackRate(1.5f)
            player.load(MediaSource.Url("https://media.example.test/video.mp4"))

            assertEquals(WasmMediaPlayerState.READY, player.state.value)
            assertEquals(12.seconds, player.duration.value)
            assertEquals("fake", player.mediaInfo.value?.formatName)
            assertEquals(0.4f, backend.volume)
            assertTrue(backend.muted)
            assertEquals(1.5f, backend.rate)

            player.play()
            assertTrue(backend.playing)
            player.seek(4.seconds)
            assertEquals(4.seconds, backend.position)
            player.pause()
            assertFalse(backend.playing)
            player.close()

            assertEquals(WasmMediaPlayerState.CLOSED, player.state.value)
            assertNull(player.surface.value)
            assertTrue(backend.closed)
        }

    @Test
    fun closedPlayerRejectsFurtherLoads() =
        runTest {
            val player =
                WasmMediaPlayer(
                    config = testConfig(),
                    backendFactory = PlayerBackendFactory { _, _ -> FakeBackend() },
                )
            player.close()

            assertFailsWith<WasmMediaError> {
                player.load(MediaSource.Url("https://media.example.test/video.mp4"))
            }
        }

    @Test
    fun progressiveSourcesAlwaysUseTheDemuxerWhileAdaptiveAndDrmUseBrowserEngines() {
        assertTrue(MediaSource.Url("https://media.example.test/movie.mkv?token=hidden").requiresDemuxedPlayback())
        assertTrue(MediaSource.Url("https://media.example.test/capture.m2ts").requiresDemuxedPlayback())
        assertTrue(MediaSource.Url("https://media.example.test/movie.mp4").requiresDemuxedPlayback())
        assertTrue(
            MediaSource.Url(
                "https://media.example.test/stream",
                mimeType = "video/mp4",
            ).requiresDemuxedPlayback(),
        )
        assertFalse(MediaSource.Url("https://media.example.test/master.m3u8").requiresDemuxedPlayback())
        assertFalse(
            MediaSource.Url(
                "https://media.example.test/playback",
                mimeType = "application/dash+xml; charset=utf-8",
            ).requiresDemuxedPlayback(),
        )
        assertFalse(
            MediaSource.Url("https://media.example.test/channel.ism/Manifest").requiresDemuxedPlayback(),
        )
        assertFalse(
            MediaSource.Composite(
                primary = MediaSource.Url("https://media.example.test/master.m3u8"),
            ).requiresDemuxedPlayback(),
        )
        assertFalse(
            MediaSource.Drm(
                mediaUrl = "https://media.example.test/manifest.mpd",
                licenseUrl = "https://license.example.test/widevine",
            ).requiresDemuxedPlayback(),
        )
        assertFalse(
            MediaSource.BrowserMedia(
                object : BrowserMediaSourceAdapter {
                    override val url: String = "blob:prepared"
                    override val mimeType: String? = "video/mp4"
                    override fun attach(video: org.w3c.dom.HTMLVideoElement, onFailure: (String) -> Unit) = Unit
                    override fun detach(video: org.w3c.dom.HTMLVideoElement) = Unit
                    override fun close() = Unit
                },
            ).requiresDemuxedPlayback(),
        )
    }

    @Test
    fun publicErrorsAndSourcesDoNotExposeRequestCredentials() {
        val source =
            MediaSource.Url(
                url = "https://user:password@media.example.test/video.mkv?token=private",
                headers = mapOf("Authorization" to "Bearer private"),
            )
        val error =
            WasmMediaError(
                WasmMediaErrorCategory.NETWORK,
                WasmMediaErrorCode.SOURCE_UNAVAILABLE,
                "GET https://user:password@media.example.test/video.mkv?token=private\n" +
                    "Authorization: Bearer private",
            )

        assertFalse("password" in source.toString())
        assertFalse("private" in source.toString())
        assertFalse("password" in error.message.orEmpty())
        assertFalse("private" in error.message.orEmpty())
        assertTrue("<redacted>" in error.message.orEmpty())
    }

    @Test
    fun configurationAndCompositeSourceValidateSafetyLimits() {
        val defaults = testConfig()
        assertEquals(200L * 1024L * 1024L, defaults.cache.maximumBytes)
        assertEquals(1_920, defaults.softwareDecode.maximumVideoWidth)
        assertEquals(8, defaults.softwareDecode.workSliceMilliseconds)
        assertEquals(DecoderPreference.AUTO, defaults.decoderPreference)
        assertEquals(OutputDynamicRangePolicy.AUTO, defaults.outputDynamicRangePolicy)
        assertEquals(4, KMEDIA_WASM_RUNTIME_ABI_VERSION)
        assertFailsWith<IllegalArgumentException> {
            ProjectionConfiguration(cropLeft = 0.5f)
        }
        assertFailsWith<IllegalArgumentException> {
            MediaSource.Composite(
                primary = MediaSource.Url("https://media.example.test/video.mp4"),
                audioTracks =
                    listOf(
                        ExternalAudioSource("duplicate", MediaSource.Url("https://media.example.test/a.m4a")),
                        ExternalAudioSource("duplicate", MediaSource.Url("https://media.example.test/b.m4a")),
                    ),
            )
        }
    }

    @Test
    fun externalSubtitleParsersPreserveTimingAndText() {
        val srt =
            parseExternalSubtitleText(
                "1\n00:00:01,250 --> 00:00:02,500\nHello &amp; goodbye\n",
                "srt",
            )
        val vtt =
            parseExternalSubtitleText(
                "WEBVTT\n\ncue-1\n00:00.500 --> 00:01.250 align:start\nWeb cue\n",
                "text/vtt",
            )
        val ttml =
            parseExternalSubtitleText(
                """<tt><body><p begin="2s" dur="750ms">Line<br/>two</p></body></tt>""",
                "ttml",
            )

        assertEquals(1_250.milliseconds, srt.single().start)
        assertEquals("Hello & goodbye", srt.single().text)
        assertEquals(500.milliseconds, vtt.single().start)
        assertEquals(1_250.milliseconds, vtt.single().end)
        assertEquals("Line\ntwo", ttml.single().text)
        assertEquals(2_750.milliseconds, ttml.single().end)
    }

    @Test
    fun aNewerTrackRequestSupersedesAnInFlightSelection() =
        runTest {
            val backend = RacingTrackBackend()
            val player =
                WasmMediaPlayer(
                    config = testConfig(),
                    backendFactory =
                        PlayerBackendFactory { _, observer ->
                            backend.observer = observer
                            backend
                        },
                )
            player.load(MediaSource.Url("https://media.example.test/video.mp4"))

            val first = async { player.selectTrack(TrackSelectionRequest.Video(1)) }
            backend.firstSelectionStarted.await()
            val second = async { player.selectTrack(TrackSelectionRequest.Video(2)) }
            testScheduler.runCurrent()
            backend.releaseFirstSelection.complete(Unit)

            assertEquals(TrackSelectionStatus.SUPERSEDED, first.await().status)
            assertEquals(TrackSelectionStatus.SELECTED, second.await().status)
            assertEquals(2, player.activeVideoTrack.value?.id)
            player.close()
        }

    @Test
    fun rejectedTrackSelectionDoesNotMutateStateOrEmitAChange() =
        runTest {
            val backend = RacingTrackBackend()
            val player =
                WasmMediaPlayer(
                    config = testConfig(),
                    backendFactory =
                        PlayerBackendFactory { _, observer ->
                            backend.observer = observer
                            backend
                        },
                )
            val events = mutableListOf<PlaybackEvent>()
            backgroundScope.launch(UnconfinedTestDispatcher(testScheduler)) {
                player.events.collect { events += it }
            }
            player.load(MediaSource.Url("https://media.example.test/video.mp4"))
            runCurrent()
            events.clear()

            val outcome = player.selectTrack(TrackSelectionRequest.Video(404))
            runCurrent()

            assertEquals(TrackSelectionStatus.NOT_FOUND, outcome.status)
            assertEquals(1, player.activeVideoTrack.value?.id)
            assertTrue(events.none { it is PlaybackEvent.TrackChanged })
            player.close()
        }

    @Test
    fun optionalLcevcAdapterAttachesLazilyAndClosesWithPlayback() =
        runTest(timeout = 30.seconds) {
            val session = RecordingLcevcSession()
            var attachedSurface: PlayerSurface? = null
            val player =
                WasmMediaPlayer(
                    WasmMediaPlayerConfig(
                        runtime = WasmRuntimeConfig("/base/kotlin/kmedia-wasm-runtime/"),
                        decoderPreference = DecoderPreference.SOFTWARE,
                        lcevcAdapter =
                            LcevcAdapter { surface ->
                                attachedSurface = surface
                                session
                            },
                    ),
                )

            player.load(MediaSource.Url("/base/kotlin/media/h264-aac.mp4", mimeType = "video/mp4"))
            assertTrue(attachedSurface is PlayerSurface.Canvas)
            assertTrue(session.enabled)
            assertEquals(WasmMediaPlayerState.READY, player.state.value)
            player.close()
            assertTrue(session.closed)
        }
}

private fun testConfig(): WasmMediaPlayerConfig = WasmMediaPlayerConfig()

private class FakeBackend : PlayerBackend {
    lateinit var observer: BackendObserver
    var playing: Boolean = false
    var closed: Boolean = false
    var muted: Boolean = false
    var volume: Float = 1f
    var rate: Float = 1f
    var position: Duration = Duration.ZERO

    override suspend fun load(source: MediaSource) {
        val info =
            MediaInfo(
                formatName = "fake",
                duration = 12.seconds,
                startTime = Duration.ZERO,
                bitRate = 1_000,
                tracks =
                    listOf(
                        VideoTrack(
                            id = 0,
                            codec = "vp9",
                            width = 320,
                            height = 180,
                            frameRate = 24.0,
                            isDefault = true,
                        ),
                    ),
            )
        observer.onDuration(info.duration)
        observer.onMediaInfo(info)
        observer.onState(WasmMediaPlayerState.READY)
    }

    override suspend fun play() {
        playing = true
        observer.onState(WasmMediaPlayerState.PLAYING)
    }

    override fun pause() {
        playing = false
        observer.onState(WasmMediaPlayerState.PAUSED)
    }

    override suspend fun seek(position: Duration) {
        this.position = position
        observer.onTime(position)
    }

    override fun setVolume(volume: Float) {
        this.volume = volume
    }

    override fun setMuted(muted: Boolean) {
        this.muted = muted
    }

    override fun setPlaybackRate(rate: Float) {
        this.rate = rate
    }

    override fun close() {
        closed = true
    }
}

private class RacingTrackBackend : PlayerBackend {
    lateinit var observer: BackendObserver
    val firstSelectionStarted: CompletableDeferred<Unit> = CompletableDeferred()
    val releaseFirstSelection: CompletableDeferred<Unit> = CompletableDeferred()
    private val tracks =
        listOf(
            VideoTrack(
                id = 1,
                codec = "avc1",
                width = 640,
                height = 360,
                frameRate = 24.0,
                isDefault = true,
            ),
            VideoTrack(
                id = 2,
                codec = "avc1",
                width = 1_280,
                height = 720,
                frameRate = 24.0,
            ),
        )
    private var active: VideoTrack = tracks.first()

    override suspend fun load(source: MediaSource) {
        val info =
            MediaInfo(
                formatName = "fake",
                duration = 30.seconds,
                startTime = Duration.ZERO,
                bitRate = null,
                tracks = tracks,
            )
        observer.onDuration(info.duration)
        observer.onMediaInfo(info)
        observer.onState(WasmMediaPlayerState.READY)
    }

    override suspend fun play() = Unit

    override fun pause() = Unit

    override suspend fun seek(position: Duration) = Unit

    override suspend fun selectTrack(request: TrackSelectionRequest): TrackSelectionOutcome {
        val id = (request as TrackSelectionRequest.Video).trackId
        if (tracks.none { it.id == id }) {
            return TrackSelectionOutcome(
                kind = TrackKind.VIDEO,
                status = TrackSelectionStatus.NOT_FOUND,
                requestedTrackId = id,
                activeTrack = active,
            )
        }
        if (id == 1) {
            firstSelectionStarted.complete(Unit)
            releaseFirstSelection.await()
        }
        active = tracks.first { it.id == id }
        return TrackSelectionOutcome(
            kind = TrackKind.VIDEO,
            status = TrackSelectionStatus.SELECTED,
            requestedTrackId = id,
            activeTrack = active,
        )
    }

    override fun activeTrack(kind: TrackKind): MediaTrack? = active.takeIf { kind == TrackKind.VIDEO }

    override fun setVolume(volume: Float) = Unit

    override fun setMuted(muted: Boolean) = Unit

    override fun setPlaybackRate(rate: Float) = Unit

    override fun close() = Unit
}

private class RecordingLcevcSession : LcevcSession {
    var enabled: Boolean = false
    var closed: Boolean = false

    override fun setEnabled(enabled: Boolean) {
        this.enabled = enabled
    }

    override fun close() {
        closed = true
    }
}
