@file:OptIn(ExperimentalWasmJsInterop::class)

package io.github.shusek.kmedia.engine.wasm

import io.github.shusek.kmedia.engine.wasm.internal.NativeAudioPacket
import io.github.shusek.kmedia.engine.wasm.internal.NativePcmFrame
import io.github.shusek.kmedia.engine.wasm.internal.NativeVideoFrame
import io.github.shusek.kmedia.engine.wasm.internal.extractIsolatedAttachedPicture
import io.github.shusek.kmedia.engine.wasm.internal.generateIsolatedThumbnail
import kotlinx.browser.document
import kotlinx.coroutines.test.runTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue
import kotlin.time.Duration
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.Duration.Companion.seconds
import kotlin.js.ExperimentalWasmJsInterop

class NativeFixtureTest {
    @Test
    fun sharedRuntimeKeepsDemuxerIoIsolatedAcrossImmediateReplacement() =
        runTest(timeout = TEST_TIMEOUT) {
            val runtime = WasmRuntimeConfig(assetBaseUrl = RUNTIME_BASE_URL)
            val first =
                Demuxer(
                    HttpSource(fixtureUrl("h264-aac.mp4"), cacheConfig = TEST_CACHE),
                    runtime,
                )
            val second =
                Demuxer(
                    HttpSource(fixtureUrl("mpeg4-mp3.avi"), cacheConfig = TEST_CACHE),
                    runtime,
                )
            try {
                assertEquals("h264", first.open().videoTracks.single().codec)
                assertEquals("mpeg4", second.open().videoTracks.single().codec)

                first.seek(Duration.ZERO)
                assertNotNull(first.readPacket(), "The first demuxer lost its source callbacks.")
                second.seek(Duration.ZERO)
                assertNotNull(second.readPacket(), "The second demuxer lost its source callbacks.")

                first.close()
                val replacement =
                    Demuxer(
                        HttpSource(fixtureUrl("vp9-opus.mkv"), cacheConfig = TEST_CACHE),
                        runtime,
                    )
                try {
                    assertEquals("vp9", replacement.open().videoTracks.single().codec)
                    replacement.seek(Duration.ZERO)
                    assertNotNull(
                        replacement.readPacket(),
                        "Immediate replacement observed stale EOF from the closing demuxer.",
                    )
                } finally {
                    replacement.closeAndAwait()
                }
            } finally {
                first.closeAndAwait()
                second.closeAndAwait()
            }
        }

    @Test
    fun realContainerMatrixIsDemuxedByTheWasmRuntime() =
        runTest(timeout = TEST_TIMEOUT) {
            val fixtures =
                listOf(
                    FixtureExpectation("h264-aac.mp4", "mov", "h264", "aac"),
                    FixtureExpectation("vp9-opus.mkv", "matroska", "vp9", "opus"),
                    FixtureExpectation("av1-opus.mkv", "matroska", "av1", "opus"),
                    FixtureExpectation("vp8-vorbis.webm", "matroska", "vp8", "vorbis"),
                    FixtureExpectation("h264-pcm.mov", "mov", "h264", "pcm_s16le"),
                    FixtureExpectation("mpeg2-mp2.ts", "mpegts", "mpeg2video", "mp2"),
                    FixtureExpectation("mpeg4-mp3.avi", "avi", "mpeg4", "mp3"),
                )

            fixtures.forEach { fixture ->
                withFixture(fixture.fileName) { demuxer, info ->
                    assertTrue(
                        info.formatName.orEmpty().contains(fixture.formatToken, ignoreCase = true),
                        "${fixture.fileName} reported format ${info.formatName}.",
                    )
                    assertTrue(info.duration > 1.seconds, "${fixture.fileName} did not expose its duration.")
                    assertEquals(
                        fixture.videoCodec,
                        info.videoTracks.firstOrNull()?.codec,
                        "${fixture.fileName} video codec",
                    )
                    assertEquals(
                        fixture.audioCodec,
                        info.audioTracks.firstOrNull()?.codec,
                        "${fixture.fileName} audio codec",
                    )
                    val packet = assertNotNull(demuxer.readPacket(), "${fixture.fileName} did not yield packets.")
                    assertTrue(packet.data.isNotEmpty(), "${fixture.fileName} yielded an empty first packet.")
                    demuxer.seek(500.milliseconds)
                    assertNotNull(demuxer.readPacket(), "${fixture.fileName} did not yield packets after seek.")
                }
            }
        }

    @Test
    fun softwareAviPlaybackTerminatesWithoutRunningVideoAheadOfItsTimeline() =
        runTest(timeout = TEST_TIMEOUT) {
            val config =
                WasmMediaPlayerConfig(
                    runtime = WasmRuntimeConfig(assetBaseUrl = RUNTIME_BASE_URL),
                    decoderPreference = DecoderPreference.SOFTWARE,
                )
            val canvas = config.canvas
            document.body?.appendChild(canvas)
            val player = WasmMediaPlayer(config)
            try {
                player.load(MediaSource.Url(fixtureUrl("mpeg4-mp3.avi"), mimeType = "video/x-msvideo"))
                player.play()
                awaitBrowserAnimationFrames(240)

                val diagnostics = player.diagnostics.value
                assertEquals(WasmMediaPlayerState.ENDED, player.state.value)
                assertTrue(
                    diagnostics.presentedFrames in 1..90,
                    "Software AVI presented ${diagnostics.presentedFrames} frames.",
                )
                assertTrue(
                    diagnostics.droppedFrames <= 180,
                    "Software AVI dropped ${diagnostics.droppedFrames} frames.",
                )
                assertEquals(0, diagnostics.audioUnderruns)
                assertTrue(
                    diagnostics.maximumAvDrift <= 250.milliseconds,
                    "Software AVI drifted by ${diagnostics.maximumAvDrift}.",
                )
            } finally {
                player.close()
                canvas.remove()
            }
        }

    @Test
    fun completeAviPacketStreamReachesEofOnce() =
        runTest(timeout = TEST_TIMEOUT) {
            withFixture("mpeg4-mp3.avi") { demuxer, _ ->
                var packetCount = 0
                var reachedEof = false
                repeat(2_000) {
                    if (!reachedEof) {
                        val packet = demuxer.readPacket()
                        if (packet == null) {
                            reachedEof = true
                        } else {
                            packetCount += 1
                        }
                    }
                }
                assertTrue(reachedEof, "AVI demux did not terminate at EOF.")
                assertTrue(packetCount in 10..1_000, "Unexpected AVI packet count: $packetCount.")
                assertNull(demuxer.readPacket(), "AVI emitted packets again after EOF.")
            }
        }

    @Test
    fun decodedMpeg4BFramesKeepPresentationOrder() =
        runTest(timeout = TEST_TIMEOUT) {
            withFixture("mpeg4-mp3.avi") { demuxer, info ->
                val track = assertNotNull(info.videoTracks.firstOrNull())
                val timestamps = mutableListOf<Double>()
                assertEquals(0, demuxer.enableDecoder(track.id))

                while (true) {
                    val packet = demuxer.readPacket() ?: break
                    if (packet.streamIndex != track.id) continue
                    var sent =
                        demuxer.sendPacket(
                            streamIndex = track.id,
                            data = packet.data,
                            ptsSeconds = packet.presentationTime.inWholeMilliseconds / 1_000.0,
                            dtsSeconds = packet.decodeTime.inWholeMilliseconds / 1_000.0,
                            keyframe = packet.keyframe,
                        )
                    if (sent < 0) {
                        drainDecodedVideoTimestamps(demuxer, track, timestamps)
                        sent =
                            demuxer.sendPacket(
                                streamIndex = track.id,
                                data = packet.data,
                                ptsSeconds = packet.presentationTime.inWholeMilliseconds / 1_000.0,
                                dtsSeconds = packet.decodeTime.inWholeMilliseconds / 1_000.0,
                                keyframe = packet.keyframe,
                            )
                    }
                    assertTrue(sent >= 0, "MPEG-4 decoder rejected an AVI packet ($sent).")
                    drainDecodedVideoTimestamps(demuxer, track, timestamps)
                }
                demuxer.sendPacket(
                    streamIndex = track.id,
                    data = ByteArray(0),
                    ptsSeconds = -1.0,
                    dtsSeconds = -1.0,
                    keyframe = false,
                )
                drainDecodedVideoTimestamps(demuxer, track, timestamps)

                assertTrue(timestamps.size >= 12, "Only ${timestamps.size} MPEG-4 frames were decoded.")
                timestamps.zipWithNext().forEachIndexed { index, (previous, next) ->
                    assertTrue(
                        next > previous,
                        "Decoded AVI PTS regressed at frame ${index + 1}: $previous -> $next ($timestamps).",
                    )
                }
            }
        }

    @Test
    fun nativeMetadataIncludesTitleAndOrderedChapters() =
        runTest(timeout = TEST_TIMEOUT) {
            withFixture("chaptered.mkv") { _, info ->
                assertEquals("Fixture title", info.metadata["title"])
                assertEquals(listOf("Intro", "Main"), info.chapters.map { it.title })
                assertEquals(Duration.ZERO, info.chapters.first().start)
                assertEquals(1_500.milliseconds, info.chapters.last().end)
            }
        }

    @Test
    fun softwareVideoDecodesH264Av1HevcVc1AndWmv3() =
        runTest(timeout = TEST_TIMEOUT) {
            listOf(
                SoftwareVideoExpectation("h264-aac.mp4", "h264", 160),
                SoftwareVideoExpectation("av1-opus.mkv", "av1", 160),
                SoftwareVideoExpectation("hevc-open-gop.mp4", "hevc", 160),
                SoftwareVideoExpectation("hevc-rext-flac.mkv", "hevc", 160),
                SoftwareVideoExpectation("vc1-bluray.mkv", "vc1", 1_920),
                SoftwareVideoExpectation("wmv3-wmav2.wmv", "wmv3", 320),
            ).forEach { (fileName, codec, expectedWidth) ->
                withFixture(fileName) { demuxer, info ->
                    val track = assertNotNull(info.videoTracks.firstOrNull(), "$fileName has no video track.")
                    assertEquals(codec, track.codec)
                    assertTrue(demuxer.enableDecoder(track.id) >= 0, "Decoder could not open $fileName.")
                    val frame = decodeFirstVideoFrame(demuxer, track.id)
                    assertNotNull(frame, "Software video did not decode a frame from $fileName.")
                    assertEquals(expectedWidth, frame.width)
                    assertTrue(frame.height > 0)
                    assertTrue(frame.lineSize >= frame.width * 4)
                    assertEquals(frame.lineSize * frame.height, frame.rgba.size)
                    assertTrue(frame.ptsSeconds.isFinite())
                }
            }
        }

    @Test
    fun wmv3ContainerDecodesItsCompanionWmav2Audio() =
        runTest(timeout = TEST_TIMEOUT) {
            withFixture("wmv3-wmav2.wmv") { demuxer, info ->
                val track = assertNotNull(info.audioTracks.firstOrNull())
                assertEquals("wmav2", track.codec)
                assertTrue(demuxer.enableDecoder(track.id) >= 0, "WMAv2 decoder could not be opened.")
                val frame = assertNotNull(decodeFirstAudioFramePerTrack(demuxer, setOf(track.id))[track.id])
                assertTrue(frame.numberOfFrames > 0, "WMAv2 produced no PCM.")
                assertTrue(frame.numberOfChannels > 0)
                assertTrue(frame.sampleRate > 0)
                assertTrue(frame.planes.any(ByteArray::isNotEmpty))
            }
        }

    @Test
    fun wmaProMonoAndMultichannelDecodeToPlanarPcmWithoutAWebCodecsFallback() =
        runTest(timeout = TEST_TIMEOUT) {
            listOf(
                WmaProExpectation("wmapro.wma", channels = 1, sampleRate = 16_000),
                WmaProExpectation("vc1-wmapro.wmv", channels = 6, sampleRate = 48_000, videoCodec = "vc1"),
            ).forEach { fixture ->
                withFixture(fixture.fileName) { demuxer, info ->
                    assertEquals(fixture.videoCodec, info.videoTracks.firstOrNull()?.codec)
                    val track = assertNotNull(info.audioTracks.firstOrNull())
                    assertEquals("wmapro", track.codec)
                    assertTrue(demuxer.enableDecoder(track.id) >= 0, "WMA Pro decoder could not be opened.")
                    val frame = assertNotNull(decodeFirstAudioFramePerTrack(demuxer, setOf(track.id))[track.id])
                    assertTrue(frame.numberOfFrames > 0, "WMA Pro produced no PCM from ${fixture.fileName}.")
                    assertEquals(fixture.channels, frame.numberOfChannels)
                    assertEquals(fixture.sampleRate, frame.sampleRate)
                    assertEquals(fixture.channels, frame.planes.size)
                    assertTrue(frame.planes.all(ByteArray::isNotEmpty))
                }
            }
        }

    @Test
    fun nativeRuntimeExposesPlanarYuvWithPtsAndLineSizes() =
        runTest(timeout = TEST_TIMEOUT) {
            withFixture("h264-aac.mp4") { demuxer, info ->
                val track = assertNotNull(info.videoTracks.firstOrNull())
                assertEquals("yuv420p", track.pixelFormat)
                assertTrue(demuxer.enableDecoder(track.id) >= 0)
                var decoded = false
                repeat(MAX_DECODE_PACKETS) {
                    if (decoded) return@repeat
                    val packet = demuxer.readPacket() ?: return@repeat
                    if (packet.streamIndex != track.id) return@repeat
                    if (
                        demuxer.sendPacket(
                            streamIndex = track.id,
                            data = packet.data,
                            ptsSeconds = packet.presentationTime.inWholeMilliseconds / 1_000.0,
                            dtsSeconds = packet.decodeTime.inWholeMilliseconds / 1_000.0,
                            keyframe = packet.keyframe,
                        ) < 0
                    ) {
                        return@repeat
                    }
                    while (demuxer.receiveFrame(track.id) == 0) {
                        val frame =
                            demuxer.decodedYuvVideoFrame(
                                streamIndex = track.id,
                                maximumWidth = 1_920,
                                pixelFormat = track.pixelFormat,
                            ) ?: continue
                        assertEquals(3, frame.planes.size)
                        assertEquals(3, frame.lineSizes.size)
                        assertTrue(frame.planes[0].size >= frame.width * frame.height)
                        assertTrue(frame.ptsSeconds.isFinite())
                        decoded = true
                        return@repeat
                    }
                }
                assertTrue(decoded, "FFmpeg did not expose a planar YUV frame.")
            }
        }

    @Test
    fun autoDecoderConfiguresAv1VideoWithForcedSoftwareOpusAudio() =
        runTest(timeout = TEST_TIMEOUT) {
            val config =
                WasmMediaPlayerConfig(
                    runtime = WasmRuntimeConfig(assetBaseUrl = RUNTIME_BASE_URL),
                    decoderPreference = DecoderPreference.AUTO,
                )
            val canvas = config.canvas
            document.body?.appendChild(canvas)
            val player = WasmMediaPlayer(config)
            try {
                player.load(MediaSource.Url(fixtureUrl("av1-opus.mkv"), mimeType = "video/x-matroska"))
                assertEquals(WasmMediaPlayerState.READY, player.state.value)
                assertTrue(
                    player.diagnostics.value.videoDecoderBackend in
                        setOf(DecoderBackend.WEB_CODECS, DecoderBackend.SOFTWARE_WASM),
                )
                assertEquals(DecoderBackend.SOFTWARE_WASM, player.diagnostics.value.audioDecoderBackend)
            } finally {
                player.close()
                canvas.remove()
            }
        }

    @Test
    fun av1FisheyePlaybackPresentsFramesAfterVideoPreroll() =
        runTest(timeout = TEST_TIMEOUT) {
            val config =
                WasmMediaPlayerConfig(
                    runtime = WasmRuntimeConfig(assetBaseUrl = RUNTIME_BASE_URL),
                    decoderPreference = DecoderPreference.AUTO,
                    projection = ProjectionConfiguration(mode = ProjectionMode.FISHEYE),
                )
            val canvas = config.canvas
            document.body?.appendChild(canvas)
            val player = WasmMediaPlayer(config)
            try {
                player.load(MediaSource.Url(fixtureUrl("av1-opus.mkv"), mimeType = "video/x-matroska"))
                // Let READY preroll consume this short fixture completely. The
                // first play must rewind the demuxer instead of inheriting the
                // probe/preroll cursor at EOF. Waiting for the observable EOF
                // state keeps this regression test independent of runner speed:
                // software AV1 decode is substantially slower on headless CI.
                val prerollDiagnostics =
                    awaitPlayerDiagnostics(player) { diagnostics -> diagnostics.endOfInput }
                assertTrue(
                    prerollDiagnostics.endOfInput,
                    "AV1 preroll did not reach end of input: $prerollDiagnostics",
                )
                assertEquals(WasmMediaPlayerState.READY, player.state.value)
                val presentedBeforePlay = player.diagnostics.value.presentedFrames
                player.play()
                val diagnostics =
                    awaitPlayerDiagnostics(player) { current ->
                        current.presentedFrames > presentedBeforePlay
                    }
                assertTrue(
                    diagnostics.presentedFrames > presentedBeforePlay,
                    "AV1 fisheye playback did not present a frame: $diagnostics",
                )
                assertTrue(
                    canvas.width > 1 && canvas.height > 1,
                    "AV1 fisheye renderer kept an empty ${canvas.width}x${canvas.height} canvas.",
                )
            } finally {
                player.close()
                canvas.remove()
            }
        }

    @Test
    fun audioOnlyDiscardsAndRestoresTheVideoDecoder() =
        runTest(timeout = TEST_TIMEOUT) {
            val config =
                WasmMediaPlayerConfig(
                    runtime = WasmRuntimeConfig(assetBaseUrl = RUNTIME_BASE_URL),
                    decoderPreference = DecoderPreference.SOFTWARE,
                )
            val canvas = config.canvas
            document.body?.appendChild(canvas)
            val player = WasmMediaPlayer(config)
            try {
                player.load(MediaSource.Url(fixtureUrl("h264-aac.mp4"), mimeType = "video/mp4"))
                assertNotNull(player.activeVideoTrack.value)

                player.setAudioOnly(true)
                assertNull(player.activeVideoTrack.value)
                assertEquals(DecoderBackend.NONE, player.diagnostics.value.videoDecoderBackend)
                assertEquals(DecoderBackend.SOFTWARE_WASM, player.diagnostics.value.audioDecoderBackend)

                player.setAudioOnly(false)
                assertNotNull(player.activeVideoTrack.value)
                assertEquals(DecoderBackend.SOFTWARE_WASM, player.diagnostics.value.videoDecoderBackend)
            } finally {
                player.close()
                canvas.remove()
            }
        }

    @Test
    fun compositeSourceSwitchesExternalAudioSubtitlesAndPremuxedQuality() =
        runTest(timeout = TEST_TIMEOUT) {
            val config =
                WasmMediaPlayerConfig(
                    runtime = WasmRuntimeConfig(assetBaseUrl = RUNTIME_BASE_URL),
                    decoderPreference = DecoderPreference.SOFTWARE,
                )
            val canvas = config.canvas
            document.body?.appendChild(canvas)
            val player = WasmMediaPlayer(config)
            try {
                player.load(
                    MediaSource.Composite(
                        primary = MediaSource.Url(fixtureUrl("h264-aac.mp4"), mimeType = "video/mp4"),
                        audioTracks =
                            listOf(
                                ExternalAudioSource(
                                    id = "alternate-audio",
                                    source = MediaSource.Url(fixtureUrl("multichannel-software-audio.mka")),
                                    language = "en",
                                    label = "Alternate audio",
                                ),
                            ),
                        subtitleTracks =
                            listOf(
                                ExternalSubtitleSource(
                                    id = "external-vtt",
                                    source = MediaSource.Url(fixtureUrl("../subtitles/sample.vtt")),
                                    format = "vtt",
                                    language = "en",
                                    label = "External VTT",
                                ),
                            ),
                        variants =
                            listOf(
                                QualityVariantSource(
                                    id = "alternate-quality",
                                    source = MediaSource.Url(fixtureUrl("vp8-vorbis.webm")),
                                    width = 160,
                                    height = 90,
                                    label = "Alternate quality",
                                ),
                            ),
                    ),
                )
                val info = assertNotNull(player.mediaInfo.value)
                val externalAudio = assertNotNull(info.audioTracks.firstOrNull { it.label == "Alternate audio" })
                val externalSubtitle = assertNotNull(info.subtitleTracks.firstOrNull { it.label == "External VTT" })
                val externalQuality = assertNotNull(info.videoTracks.firstOrNull { it.label == "Alternate quality" })

                val audioOutcome = player.selectTrack(TrackSelectionRequest.Audio(externalAudio.id))
                assertEquals(TrackSelectionStatus.SELECTED, audioOutcome.status)
                assertEquals(externalAudio.id, player.activeAudioTrack.value?.id)

                val subtitleOutcome = player.selectTrack(TrackSelectionRequest.Subtitle(externalSubtitle.id))
                assertEquals(TrackSelectionStatus.SELECTED, subtitleOutcome.status)
                assertEquals(externalSubtitle.id, player.activeSubtitleTrack.value?.id)
                assertTrue(player.subtitleCues.value.isNotEmpty())

                val qualityOutcome = player.selectTrack(TrackSelectionRequest.Video(externalQuality.id))
                assertEquals(TrackSelectionStatus.SELECTED, qualityOutcome.status)
                assertEquals(externalQuality.id, player.activeVideoTrack.value?.id)

                val autoOutcome = player.selectTrack(TrackSelectionRequest.Video(null))
                assertEquals(TrackSelectionStatus.AUTO, autoOutcome.status)
                assertTrue(player.activeVideoTrack.value?.id != externalQuality.id)
            } finally {
                player.close()
                canvas.remove()
            }
        }

    @Test
    fun softwareAudioDecodesAllForcedFallbackFamiliesWithoutSilentTracks() =
        runTest(timeout = TEST_TIMEOUT) {
            withFixture("multichannel-software-audio.mka") { demuxer, info ->
                val expected = setOf("ac3", "eac3", "flac", "opus", "dts", "truehd")
                val tracks = info.audioTracks.filter { it.codec in expected }
                assertEquals(expected, tracks.map { it.codec }.toSet())
                tracks.forEach { track ->
                    assertTrue(
                        demuxer.enableDecoder(track.id) >= 0,
                        "Software decoder could not open ${track.codec}.",
                    )
                }

                val decoded = decodeFirstAudioFramePerTrack(demuxer, tracks.map(AudioTrack::id).toSet())
                assertEquals(
                    tracks.map(AudioTrack::id).toSet(),
                    decoded.keys,
                    "At least one mandatory software audio codec produced no PCM.",
                )
                decoded.forEach { (trackId, frame) ->
                    assertTrue(frame.numberOfFrames > 0, "Track $trackId produced no samples.")
                    assertEquals(6, frame.numberOfChannels, "Track $trackId lost multichannel layout.")
                    assertEquals(48_000, frame.sampleRate)
                    assertEquals(frame.numberOfChannels, frame.planes.size)
                    assertTrue(frame.planes.all(ByteArray::isNotEmpty))
                }
            }
        }

    @Test
    fun batchAudioDecodeAndTextSubtitlePrefetchUseTheNativeAbi() =
        runTest(timeout = TEST_TIMEOUT) {
            withFixture("h264-aac.mp4") { demuxer, info ->
                val audio = assertNotNull(info.audioTracks.firstOrNull())
                assertTrue(demuxer.enableDecoder(audio.id) >= 0)
                val packets = mutableListOf<NativeAudioPacket>()
                while (packets.size < 16) {
                    val packet = demuxer.readPacket() ?: break
                    if (packet.streamIndex == audio.id) {
                        packets +=
                            NativeAudioPacket(
                                data = packet.data,
                                ptsSeconds = packet.presentationTime.inWholeMilliseconds / 1_000.0,
                            )
                    }
                }
                assertTrue(packets.isNotEmpty())
                val (consumed, frame) = demuxer.decodeAudioBatch(audio.id, packets)
                assertTrue(consumed > 0, "Native batch audio decoder consumed no packets.")
                assertNotNull(frame, "Native batch audio decoder produced no PCM.")
            }

            withFixture("text-subtitles.mkv") { demuxer, info ->
                assertEquals(setOf("subrip", "ass"), info.subtitleTracks.map { it.codec }.toSet())
                info.subtitleTracks.forEach { track ->
                    assertTrue(demuxer.enableDecoder(track.id) >= 0)
                    val cues = demuxer.prefetchSubtitleCues(track.id)
                    assertTrue(cues.isNotEmpty(), "${track.codec} prefetch returned no cues.")
                    assertTrue(cues.all { it.endSeconds >= it.startSeconds })
                    assertTrue(cues.any { !it.text.isNullOrBlank() })
                }
            }
        }

    @Test
    fun softwareDownmixProducesStereoPcm() =
        runTest(timeout = TEST_TIMEOUT) {
            withFixture("multichannel-software-audio.mka") { demuxer, info ->
                val track = assertNotNull(info.audioTracks.firstOrNull { it.codec == "ac3" })
                demuxer.enableAudioDownmix(true)
                assertTrue(demuxer.enableDecoder(track.id) >= 0)
                val decoded = decodeFirstAudioFramePerTrack(demuxer, setOf(track.id))
                assertEquals(2, assertNotNull(decoded[track.id]).numberOfChannels)
            }
        }

    @Test
    fun adaptiveFallbackBuildsFiniteHlsAndSingleFileDashButRejectsSegmentTemplateDash() =
        runTest(timeout = TEST_TIMEOUT) {
            val hls =
                buildAdaptiveDemuxFallback(
                    MediaSource.Url(
                        url = fixtureUrl("vod.m3u8"),
                        mimeType = "application/vnd.apple.mpegurl",
                    ),
                    TEST_CACHE,
                )
            val adapterSource = hls as? MediaSource.Adapter
            assertNotNull(adapterSource, "Finite HLS VOD did not produce a demux fallback.")
            try {
                assertEquals(SourceMode.ADAPTIVE, adapterSource.adapter.sourceMode)
                assertTrue(adapterSource.adapter.getSize() > 0)
                val firstBytes = adapterSource.adapter.read(0, 188)
                assertTrue(firstBytes.isNotEmpty())
                assertEquals(0x47, firstBytes[0].toInt() and 0xff, "HLS fallback is not an MPEG-TS stream.")
            } finally {
                adapterSource.adapter.close()
            }

            val byteRangeHls =
                buildAdaptiveDemuxFallback(
                    MediaSource.Url(
                        url = fixtureUrl("byterange.m3u8"),
                        mimeType = "application/vnd.apple.mpegurl",
                    ),
                    TEST_CACHE,
                ) as? MediaSource.Adapter
            assertNotNull(byteRangeHls, "HLS BYTERANGE VOD did not produce a demux fallback.")
            val byteRangeDemuxer =
                Demuxer(
                    byteRangeHls.adapter,
                    WasmRuntimeConfig(assetBaseUrl = RUNTIME_BASE_URL),
                )
            try {
                val virtualSize = byteRangeHls.adapter.getSize()
                val rawSource = HttpSource(fixtureUrl("hls-byterange.mp4"), cacheConfig = TEST_CACHE)
                try {
                    val rawSize = rawSource.getSize()
                    assertEquals(rawSize, virtualSize)
                    assertEquals(
                        rawSource.read(0, rawSize.toInt()).toList(),
                        byteRangeHls.adapter.read(0, virtualSize.toInt()).toList(),
                        "HLS BYTERANGE adapter did not reconstruct the referenced media object.",
                    )
                    byteRangeHls.adapter.seek(0)
                } finally {
                    rawSource.close()
                }
                val byteRangeInfo =
                    runCatching { byteRangeDemuxer.open() }
                        .getOrElse { error ->
                            throw AssertionError("HLS BYTERANGE demux failed: ${error.message}", error)
                        }
                assertEquals("h264", byteRangeInfo.videoTracks.firstOrNull()?.codec)
                assertEquals("aac", byteRangeInfo.audioTracks.firstOrNull()?.codec)
            } finally {
                byteRangeDemuxer.close()
            }

            val masterHls =
                buildAdaptiveDemuxFallback(
                    MediaSource.Url(
                        url = fixtureUrl("master.m3u8"),
                        mimeType = "application/vnd.apple.mpegurl",
                    ),
                    TEST_CACHE,
                ) as? MediaSource.Composite
            assertNotNull(masterHls, "HLS master playlist did not preserve its split tracks and variants.")
            try {
                assertEquals(1, masterHls.audioTracks.size)
                assertEquals(1, masterHls.subtitleTracks.size)
                assertEquals(1, masterHls.variants.size)
                assertTrue((masterHls.primary as MediaSource.Adapter).adapter.getSize() > 0)
                assertTrue((masterHls.audioTracks.single().source as MediaSource.Adapter).adapter.getSize() > 0)
                assertTrue((masterHls.subtitleTracks.single().source as MediaSource.Adapter).adapter.getSize() > 0)
            } finally {
                (masterHls.primary as MediaSource.Adapter).adapter.close()
                masterHls.audioTracks.forEach { (it.source as MediaSource.Adapter).adapter.close() }
                masterHls.subtitleTracks.forEach { (it.source as MediaSource.Adapter).adapter.close() }
                masterHls.variants.forEach { (it.source as MediaSource.Adapter).adapter.close() }
            }

            val singleFileDash =
                buildAdaptiveDemuxFallback(
                    MediaSource.Url(
                        url = fixtureUrl("single-file.mpd"),
                        mimeType = "application/dash+xml",
                    ),
                    TEST_CACHE,
                ) as? MediaSource.Adapter
            assertNotNull(singleFileDash, "Single-file SegmentBase DASH did not produce a demux fallback.")
            val dashDemuxer =
                Demuxer(
                    singleFileDash.adapter,
                    WasmRuntimeConfig(assetBaseUrl = RUNTIME_BASE_URL),
                )
            try {
                val dashInfo =
                    runCatching { dashDemuxer.open() }
                        .getOrElse { error ->
                            throw AssertionError("DASH single-file demux failed: ${error.message}", error)
                        }
                assertEquals("h264", dashInfo.videoTracks.firstOrNull()?.codec)
                assertEquals("aac", dashInfo.audioTracks.firstOrNull()?.codec)
                assertTrue(dashInfo.duration > 1.seconds)
            } finally {
                dashDemuxer.close()
            }

            val unsupportedDash =
                buildAdaptiveDemuxFallback(
                    MediaSource.Url(
                        url = fixtureUrl("vod.mpd"),
                        mimeType = "application/dash+xml",
                    ),
                    TEST_CACHE,
                )
            assertNull(
                unsupportedDash,
                "SegmentTemplate DASH must not be advertised as a seekable single-file fallback.",
            )
        }

    @Test
    fun httpCacheAndRuntimeAbiFailuresAreTyped() =
        runTest(timeout = TEST_TIMEOUT) {
            val source = HttpSource(fixtureUrl("h264-aac.mp4"), cacheConfig = TEST_CACHE)
            try {
                val size = source.getSize()
                assertTrue(size > 0)
                val first = source.read(0, 128)
                val second = source.read(0, 128)
                assertEquals(first.toList(), second.toList())
                assertTrue(source.cacheStats.hits > 0)
                assertTrue(source.networkStats.bytesDownloaded >= first.size)
                assertTrue(source.supportsRandomAccess)
                assertEquals(256L, source.seek(256))
            } finally {
                source.close()
            }

            val demuxer =
                Demuxer(
                    source = HttpSource(fixtureUrl("h264-aac.mp4"), cacheConfig = TEST_CACHE),
                    runtime =
                        WasmRuntimeConfig(
                            assetBaseUrl = RUNTIME_BASE_URL,
                            expectedAbiVersion = KMEDIA_WASM_RUNTIME_ABI_VERSION + 1,
                        ),
                )
            try {
                val error = assertFailsWith<WasmMediaError> { demuxer.open() }
                assertEquals(WasmMediaErrorCode.RUNTIME_ABI_MISMATCH, error.code)
            } finally {
                demuxer.close()
            }
        }

    @Test
    fun coverArtAndRotatedThumbnailUseIndependentDemuxers() =
        runTest(timeout = TEST_TIMEOUT) {
            val runtime = WasmRuntimeConfig(assetBaseUrl = RUNTIME_BASE_URL)
            val picture =
                assertNotNull(
                    extractIsolatedAttachedPicture(
                        MediaSource.Url(fixtureUrl("cover-art.mp3")),
                        runtime,
                    ),
                )
            assertEquals("image/jpeg", picture.mimeType)
            assertTrue(picture.data.size > 64)
            assertEquals(0xff, picture.data[0].toInt() and 0xff)
            assertEquals(0xd8, picture.data[1].toInt() and 0xff)

            val thumbnail =
                generateIsolatedThumbnail(
                    source = MediaSource.Url(fixtureUrl("h264-aac.mp4")),
                    runtime = runtime,
                    position = 500.milliseconds,
                    maximumWidth = 160,
                    rotationDegrees = 90,
                )
            try {
                assertEquals(90, thumbnail.width)
                assertEquals(160, thumbnail.height)
                assertTrue(thumbnail.timestamp >= Duration.ZERO)
            } finally {
                closeTestImageBitmap(thumbnail.image)
            }
        }
}

private data class FixtureExpectation(
    val fileName: String,
    val formatToken: String,
    val videoCodec: String,
    val audioCodec: String,
)

private data class SoftwareVideoExpectation(
    val fileName: String,
    val codec: String,
    val expectedWidth: Int,
)

private data class WmaProExpectation(
    val fileName: String,
    val channels: Int,
    val sampleRate: Int,
    val videoCodec: String? = null,
)

private suspend fun <T> withFixture(
    fileName: String,
    block: suspend (Demuxer, MediaInfo) -> T,
): T {
    val demuxer =
        Demuxer(
            HttpSource(fixtureUrl(fileName), cacheConfig = TEST_CACHE),
            WasmRuntimeConfig(assetBaseUrl = RUNTIME_BASE_URL),
        )
    return try {
        block(demuxer, demuxer.open())
    } finally {
        demuxer.closeAndAwait()
    }
}

@Suppress("UNUSED_PARAMETER")
private suspend fun awaitBrowserAnimationFrames(count: Int) {
    val completed = kotlinx.coroutines.CompletableDeferred<Unit>()
    scheduleBrowserAnimationFrames(count) { completed.complete(Unit) }
    completed.await()
}

private suspend fun awaitPlayerDiagnostics(
    player: WasmMediaPlayer,
    timeoutMilliseconds: Int = 20_000,
    predicate: (RenderingDiagnostics) -> Boolean,
): RenderingDiagnostics {
    var diagnostics = player.diagnostics.value
    val deadline = browserPerformanceMilliseconds() + timeoutMilliseconds
    while (browserPerformanceMilliseconds() < deadline && !predicate(diagnostics)) {
        awaitBrowserTimeout(50)
        diagnostics = player.diagnostics.value
    }
    return diagnostics
}

private suspend fun awaitBrowserTimeout(milliseconds: Int) {
    val completed = kotlinx.coroutines.CompletableDeferred<Unit>()
    scheduleBrowserTimeout(milliseconds) { completed.complete(Unit) }
    completed.await()
}

@Suppress("UNUSED_PARAMETER")
private fun scheduleBrowserTimeout(
    milliseconds: Int,
    onComplete: () -> Unit,
): Unit = js("globalThis.setTimeout(onComplete, milliseconds)")

private fun browserPerformanceMilliseconds(): Double = js("performance.now()")

@Suppress("UNUSED_PARAMETER")
private fun scheduleBrowserAnimationFrames(
    count: Int,
    onComplete: () -> Unit,
): Unit =
    js(
        """
        {
            let remaining = Math.max(1, count);
            const next = function() {
                remaining -= 1;
                if (remaining <= 0) onComplete();
                else requestAnimationFrame(next);
            };
            requestAnimationFrame(next);
        }
        """,
    )

private suspend fun decodeFirstVideoFrame(
    demuxer: Demuxer,
    streamIndex: Int,
): NativeVideoFrame? {
    repeat(MAX_DECODE_PACKETS) {
        val packet = demuxer.readPacket() ?: return null
        if (packet.streamIndex != streamIndex) return@repeat
        var result =
            demuxer.sendPacket(
                streamIndex = streamIndex,
                data = packet.data,
                ptsSeconds = packet.presentationTime.inWholeMilliseconds / 1_000.0,
                dtsSeconds = packet.decodeTime.inWholeMilliseconds / 1_000.0,
                keyframe = packet.keyframe,
            )
        if (result < 0) {
            drainVideoFrame(demuxer, streamIndex)?.let { return it }
            result =
                demuxer.sendPacket(
                    streamIndex = streamIndex,
                    data = packet.data,
                    ptsSeconds = packet.presentationTime.inWholeMilliseconds / 1_000.0,
                    dtsSeconds = packet.decodeTime.inWholeMilliseconds / 1_000.0,
                    keyframe = packet.keyframe,
                )
        }
        if (result >= 0) drainVideoFrame(demuxer, streamIndex)?.let { return it }
    }
    return null
}

private fun drainDecodedVideoTimestamps(
    demuxer: Demuxer,
    track: VideoTrack,
    output: MutableList<Double>,
) {
    while (demuxer.receiveFrame(track.id) == 0) {
        demuxer
            .decodedYuvVideoFrame(
                streamIndex = track.id,
                maximumWidth = 1_920,
                pixelFormat = track.pixelFormat,
            )?.let { output += it.ptsSeconds }
    }
}

private fun drainVideoFrame(
    demuxer: Demuxer,
    streamIndex: Int,
): NativeVideoFrame? {
    while (demuxer.receiveFrame(streamIndex) == 0) {
        demuxer.decodedVideoFrame(streamIndex, maximumWidth = 1_920)?.let { return it }
    }
    return null
}

private suspend fun decodeFirstAudioFramePerTrack(
    demuxer: Demuxer,
    trackIds: Set<Int>,
): Map<Int, NativePcmFrame> {
    val result = mutableMapOf<Int, NativePcmFrame>()
    repeat(MAX_DECODE_PACKETS * trackIds.size) {
        if (result.keys.containsAll(trackIds)) return result
        val packet = demuxer.readPacket() ?: return result
        if (packet.streamIndex !in trackIds || packet.streamIndex in result) return@repeat
        var sent =
            demuxer.sendPacket(
                streamIndex = packet.streamIndex,
                data = packet.data,
                ptsSeconds = packet.presentationTime.inWholeMilliseconds / 1_000.0,
                dtsSeconds = packet.decodeTime.inWholeMilliseconds / 1_000.0,
                keyframe = true,
            )
        if (sent < 0) {
            drainAudioFrame(demuxer, packet.streamIndex, packet.presentationTime.inWholeMilliseconds / 1_000.0)
                ?.let { result[packet.streamIndex] = it }
            sent =
                demuxer.sendPacket(
                    streamIndex = packet.streamIndex,
                    data = packet.data,
                    ptsSeconds = packet.presentationTime.inWholeMilliseconds / 1_000.0,
                    dtsSeconds = packet.decodeTime.inWholeMilliseconds / 1_000.0,
                    keyframe = true,
                )
        }
        if (sent >= 0) {
            drainAudioFrame(demuxer, packet.streamIndex, packet.presentationTime.inWholeMilliseconds / 1_000.0)
                ?.let { result[packet.streamIndex] = it }
        }
    }
    return result
}

private fun drainAudioFrame(
    demuxer: Demuxer,
    streamIndex: Int,
    fallbackPtsSeconds: Double,
): NativePcmFrame? {
    while (demuxer.receiveFrame(streamIndex) == 0) {
        demuxer.decodedAudioFrame(streamIndex, fallbackPtsSeconds)?.let { return it }
    }
    return null
}

private fun fixtureUrl(fileName: String): String = "/base/kotlin/media/$fileName"

private val TEST_TIMEOUT = 90.seconds
private val TEST_CACHE = CacheConfig(maximumBytes = 4L * 1024L * 1024L)
private const val RUNTIME_BASE_URL = "/base/kotlin/kmedia-wasm-runtime/"
private const val MAX_DECODE_PACKETS = 512

@Suppress("UNUSED_PARAMETER")
private fun closeTestImageBitmap(image: org.w3c.dom.ImageBitmap): Unit =
    kotlin.js.js(
        """
        {
            try { image.close(); } catch (_) {}
        }
        """,
    )
