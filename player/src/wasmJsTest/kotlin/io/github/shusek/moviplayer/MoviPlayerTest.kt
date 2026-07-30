@file:Suppress("FunctionNaming")

package io.github.shusek.moviplayer

import io.github.shusek.moviplayer.internal.BackendObserver
import io.github.shusek.moviplayer.internal.PlayerBackend
import io.github.shusek.moviplayer.internal.PlayerBackendFactory
import io.github.shusek.moviplayer.internal.requiresDemuxedPlayback
import kotlinx.browser.document
import kotlinx.coroutines.test.runTest
import org.w3c.dom.HTMLCanvasElement
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue
import kotlin.time.Duration
import kotlin.time.Duration.Companion.seconds

class MoviPlayerTest {
    @Test
    fun playerExposesTypedStateAndForwardsControls() =
        runTest {
            val backend = FakeBackend()
            val player =
                MoviPlayer(
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

            assertEquals(MoviPlayerState.READY, player.state.value)
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

            assertEquals(MoviPlayerState.CLOSED, player.state.value)
            assertNull(player.surface.value)
            assertTrue(backend.closed)
        }

    @Test
    fun closedPlayerRejectsFurtherLoads() =
        runTest {
            val player =
                MoviPlayer(
                    config = testConfig(),
                    backendFactory = PlayerBackendFactory { _, _ -> FakeBackend() },
                )
            player.close()

            assertFailsWith<MoviError> {
                player.load(MediaSource.Url("https://media.example.test/video.mp4"))
            }
        }

    @Test
    fun containerRoutingUsesDemuxerOnlyForRawContainerFormats() {
        assertTrue(MediaSource.Url("https://media.example.test/movie.mkv?token=hidden").requiresDemuxedPlayback())
        assertTrue(MediaSource.Url("https://media.example.test/capture.m2ts").requiresDemuxedPlayback())
        assertFalse(MediaSource.Url("https://media.example.test/movie.mp4").requiresDemuxedPlayback())
        assertFalse(MediaSource.Url("https://media.example.test/master.m3u8").requiresDemuxedPlayback())
        assertFalse(
            MediaSource.Url("https://media.example.test/channel.ism/Manifest").requiresDemuxedPlayback(),
        )
        assertFalse(
            MediaSource.Drm(
                mediaUrl = "https://media.example.test/manifest.mpd",
                licenseUrl = "https://license.example.test/widevine",
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
            MoviError(
                MoviErrorCategory.NETWORK,
                MoviErrorCode.SOURCE_UNAVAILABLE,
                "GET https://user:password@media.example.test/video.mkv?token=private\n" +
                    "Authorization: Bearer private",
            )

        assertFalse("password" in source.toString())
        assertFalse("private" in source.toString())
        assertFalse("password" in error.message.orEmpty())
        assertFalse("private" in error.message.orEmpty())
        assertTrue("<redacted>" in error.message.orEmpty())
    }
}

private fun testConfig(): MoviPlayerConfig =
    MoviPlayerConfig(document.createElement("canvas") as HTMLCanvasElement)

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
        observer.onState(MoviPlayerState.READY)
    }

    override suspend fun play() {
        playing = true
        observer.onState(MoviPlayerState.PLAYING)
    }

    override fun pause() {
        playing = false
        observer.onState(MoviPlayerState.PAUSED)
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
