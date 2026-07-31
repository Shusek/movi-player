@file:OptIn(ExperimentalWasmJsInterop::class)

package io.github.shusek.kmedia.engine.wasm

import io.github.shusek.kmedia.engine.wasm.internal.NativePcmFrame
import io.github.shusek.kmedia.engine.wasm.internal.beginSoftwarePcmFrame
import io.github.shusek.kmedia.engine.wasm.internal.commitSoftwarePcmFrame
import io.github.shusek.kmedia.engine.wasm.internal.configureMediaPipeline
import io.github.shusek.kmedia.engine.wasm.internal.createMediaPipeline
import io.github.shusek.kmedia.engine.wasm.internal.destroyMediaPipeline
import io.github.shusek.kmedia.engine.wasm.internal.mediaPipelineAudioTimestampCorrections
import io.github.shusek.kmedia.engine.wasm.internal.mediaPipelineDroppedFrames
import io.github.shusek.kmedia.engine.wasm.internal.mediaPipelineIsBuffering
import io.github.shusek.kmedia.engine.wasm.internal.mediaPipelineOutputColorSpace
import io.github.shusek.kmedia.engine.wasm.internal.mediaPipelinePresentedFrames
import io.github.shusek.kmedia.engine.wasm.internal.mediaPipelineUsesWebGl
import io.github.shusek.kmedia.engine.wasm.internal.playMediaPipeline
import io.github.shusek.kmedia.engine.wasm.internal.pushMediaWebCodecsPacket
import io.github.shusek.kmedia.engine.wasm.internal.pushSoftwarePcmPlane
import io.github.shusek.kmedia.engine.wasm.internal.pushSoftwareVideoFrame
import io.github.shusek.kmedia.engine.wasm.internal.pushSoftwareYuvFrame
import io.github.shusek.kmedia.engine.wasm.internal.setMediaPipelineColor
import io.github.shusek.kmedia.engine.wasm.internal.setMediaPipelineMuted
import io.github.shusek.kmedia.engine.wasm.internal.setMediaPipelinePosition
import io.github.shusek.kmedia.engine.wasm.internal.setMediaPipelineProjection
import io.github.shusek.kmedia.engine.wasm.internal.setMediaPipelineStableVolume
import io.github.shusek.kmedia.engine.wasm.internal.setMediaPipelineVolume
import kotlinx.browser.document
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.test.runTest
import org.khronos.webgl.Int8Array
import org.khronos.webgl.toByteArray
import org.khronos.webgl.toInt8Array
import org.w3c.dom.HTMLCanvasElement
import kotlin.js.ExperimentalWasmJsInterop
import kotlin.js.JsAny
import kotlin.js.js
import kotlin.math.PI
import kotlin.math.sin
import kotlin.math.sqrt
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue
import kotlin.time.Duration.Companion.seconds

class MediaPipelineTest {
    @Test
    fun hardwareWithoutColorIsTriedBeforeNoPreference() =
        runTest(timeout = 30.seconds) {
            val canvas = document.createElement("canvas") as HTMLCanvasElement
            val errors = mutableListOf<String>()
            val pipeline =
                createMediaPipeline(
                    canvas = canvas,
                    stableVolume = false,
                    onTime = {},
                    onState = {},
                    onEnded = {},
                    onDecoderError = { kind, message -> errors += "$kind:$message" },
                    onError = errors::add,
                )
            installVideoDecoderProbe()
            try {
                val completed = CompletableDeferred<Pair<String, String>>()
                configureMediaPipeline(
                    pipeline = pipeline,
                    requestWebVideo = true,
                    videoCodec = "avc1.640028",
                    videoFallbackCodecs = "",
                    videoWidth = 1_920,
                    videoHeight = 1_080,
                    videoDescription = null,
                    colorPrimaries = "bt2020",
                    colorTransfer = "smpte2084",
                    colorMatrix = "bt2020nc",
                    requestWebAudio = false,
                    audioCodec = "",
                    audioSampleRate = 0,
                    audioChannels = 0,
                    audioDescription = null,
                    duration = 1.0,
                    onComplete = { videoMode, audioMode -> completed.complete(videoMode to audioMode) },
                    onError = { message -> completed.completeExceptionally(IllegalStateException(message)) },
                )

                assertEquals("web" to "none", completed.await())
                assertEquals(
                    "prefer-hardware:color|prefer-hardware:no-color",
                    readVideoDecoderProbeAttempts(),
                )
                assertTrue(errors.isEmpty())
            } finally {
                restoreVideoDecoderProbe()
                destroyMediaPipeline(pipeline)
            }
        }

    @Test
    fun stalledWebCodecsPrerollReportsARecoverableDecoderFailure() =
        runTest(timeout = 30.seconds) {
            val canvas = document.createElement("canvas") as HTMLCanvasElement
            val decoderErrors = mutableListOf<String>()
            val pipeline =
                createMediaPipeline(
                    canvas = canvas,
                    stableVolume = false,
                    onTime = {},
                    onState = {},
                    onEnded = {},
                    onDecoderError = { kind, message -> decoderErrors += "$kind:$message" },
                    onError = { throw AssertionError(it) },
                )
            installVideoDecoderProbe()
            try {
                val configured = CompletableDeferred<Pair<String, String>>()
                configureMediaPipeline(
                    pipeline = pipeline,
                    requestWebVideo = true,
                    videoCodec = "av01.0.13M.08",
                    videoFallbackCodecs = "",
                    videoWidth = 8_000,
                    videoHeight = 4_000,
                    videoDescription = null,
                    colorPrimaries = "",
                    colorTransfer = "",
                    colorMatrix = "",
                    requestWebAudio = false,
                    audioCodec = "",
                    audioSampleRate = 0,
                    audioChannels = 0,
                    audioDescription = null,
                    duration = 10.0,
                    onComplete = { videoMode, audioMode -> configured.complete(videoMode to audioMode) },
                    onError = { configured.completeExceptionally(IllegalStateException(it)) },
                )
                assertEquals("web" to "none", configured.await())
                setPipelineVideoStartupTimeout(pipeline, 1.0)

                val started = CompletableDeferred<Unit>()
                playMediaPipeline(
                    pipeline = pipeline,
                    onComplete = { started.complete(Unit) },
                    onError = { started.completeExceptionally(IllegalStateException(it)) },
                )
                started.await()
                pushMediaWebCodecsPacket(
                    pipeline = pipeline,
                    kind = "video",
                    data = byteArrayOf(1, 2, 3).toInt8Array(),
                    timestamp = 0.0,
                    duration = 1.0 / 30.0,
                    keyframe = true,
                    drop = false,
                )
                awaitAnimationFrames(3)

                assertTrue(
                    decoderErrors.singleOrNull()?.contains("produced no frame") == true,
                    "Unexpected decoder errors: $decoderErrors",
                )
            } finally {
                restoreVideoDecoderProbe()
                destroyMediaPipeline(pipeline)
            }
        }

    @Test
    fun softwareFramesUseRotationProjectionCropAndHdrShader() =
        runTest(timeout = 30.seconds) {
            val canvas = document.createElement("canvas") as HTMLCanvasElement
            val errors = mutableListOf<String>()
            val pipeline =
                createMediaPipeline(
                    canvas = canvas,
                    stableVolume = false,
                    onTime = {},
                    onState = {},
                    onEnded = {},
                    onDecoderError = { kind, message -> errors += "$kind:$message" },
                    onError = errors::add,
                )
            try {
                configureSoftwarePipeline(pipeline)
                setMediaPipelineProjection(
                    pipeline = pipeline,
                    projection = "flat",
                    rotationDegrees = 0,
                    yawDegrees = 0f,
                    pitchDegrees = 0f,
                    fieldOfViewDegrees = 90f,
                    cropLeft = 0f,
                    cropTop = 0f,
                    cropRight = 0f,
                    cropBottom = 0f,
                )
                setMediaPipelineColor(pipeline, sourceHdr = false, toneMapping = "shader")
                pushSoftwareVideoFrame(
                    pipeline = pipeline,
                    rgba = QUADRANT_RGBA.toInt8Array(),
                    width = 2,
                    height = 2,
                    lineSize = 8,
                    timestamp = 0.0,
                )
                awaitAnimationFrames(3)
                val unrotated = readPipelinePixels(pipeline).toByteArray().toRgbaPixels()
                assertEquals(4, unrotated.size)

                setMediaPipelineProjection(
                    pipeline = pipeline,
                    projection = "flat",
                    rotationDegrees = 180,
                    yawDegrees = 0f,
                    pitchDegrees = 0f,
                    fieldOfViewDegrees = 90f,
                    cropLeft = 0f,
                    cropTop = 0f,
                    cropRight = 0f,
                    cropBottom = 0f,
                )
                awaitAnimationFrames(3)
                val rotated = readPipelinePixels(pipeline).toByteArray().toRgbaPixels()
                assertPixelsNear(unrotated.reversed(), rotated)

                PROJECTION_NAMES.forEach { projection ->
                    setMediaPipelineProjection(
                        pipeline = pipeline,
                        projection = projection,
                        rotationDegrees = 0,
                        yawDegrees = 18f,
                        pitchDegrees = -8f,
                        fieldOfViewDegrees = 100f,
                        cropLeft = 0.05f,
                        cropTop = 0.05f,
                        cropRight = 0.05f,
                        cropBottom = 0.05f,
                    )
                    awaitAnimationFrames(2)
                    assertEquals(16, readPipelinePixels(pipeline).length)
                }

                setMediaPipelineProjection(
                    pipeline = pipeline,
                    projection = "flat",
                    rotationDegrees = 0,
                    yawDegrees = 0f,
                    pitchDegrees = 0f,
                    fieldOfViewDegrees = 90f,
                    cropLeft = 0f,
                    cropTop = 0f,
                    cropRight = 0f,
                    cropBottom = 0f,
                )
                setMediaPipelineColor(pipeline, sourceHdr = false, toneMapping = "shader")
                awaitAnimationFrames(2)
                val sdr = readPipelinePixels(pipeline).toByteArray().toList()
                setMediaPipelineColor(pipeline, sourceHdr = true, toneMapping = "shader")
                awaitAnimationFrames(2)
                val toneMapped = readPipelinePixels(pipeline).toByteArray().toList()
                assertTrue(sdr != toneMapped, "PQ/BT.2020 tone mapping did not alter output pixels.")

                assertEquals(
                    1.0,
                    mediaPipelinePresentedFrames(pipeline),
                    "A frame held for multiple animation ticks must only be counted once.",
                )
                assertTrue(mediaPipelineOutputColorSpace(pipeline).isNotBlank())
                assertTrue(errors.isEmpty(), "Renderer errors: $errors")
            } finally {
                destroyMediaPipeline(pipeline)
            }
    }

    @Test
    fun planarYuvSoftwareFrameUsesTheSharedRenderer() =
        runTest(timeout = 30.seconds) {
            val canvas = document.createElement("canvas") as HTMLCanvasElement
            val errors = mutableListOf<String>()
            val pipeline =
                createMediaPipeline(
                    canvas = canvas,
                    stableVolume = false,
                    onTime = {},
                    onState = {},
                    onEnded = {},
                    onDecoderError = { kind, message -> errors += "$kind:$message" },
                    onError = errors::add,
                )
            try {
                configureSoftwarePipeline(pipeline)
                pushSoftwareYuvFrame(
                    pipeline = pipeline,
                    y = byteArrayOf(128.toByte(), 128.toByte(), 128.toByte(), 128.toByte()).toInt8Array(),
                    u = byteArrayOf(128.toByte()).toInt8Array(),
                    v = byteArrayOf(128.toByte()).toInt8Array(),
                    width = 2,
                    height = 2,
                    lineY = 2,
                    lineU = 1,
                    lineV = 1,
                    format = "yuv420p",
                    matrix = "bt709",
                    fullRange = true,
                    timestamp = 0.0,
                )
                awaitAnimationFrames(3)
                readPipelinePixels(pipeline)
                    .toByteArray()
                    .toRgbaPixels()
                    .forEach { pixel ->
                        assertTrue(pixel[0] in 124..132)
                        assertTrue(pixel[1] in 124..132)
                        assertTrue(pixel[2] in 124..132)
                    }
                if (mediaPipelineUsesWebGl(pipeline)) {
                    assertEquals(1, readPipelineInputMode(pipeline))
                }
                assertTrue(errors.isEmpty(), "Renderer errors: $errors")
            } finally {
                destroyMediaPipeline(pipeline)
            }
    }

    @Test
    fun playbackClockWaitsForTheFirstVideoFrame() =
        runTest(timeout = 30.seconds) {
            val canvas = document.createElement("canvas") as HTMLCanvasElement
            val times = mutableListOf<Double>()
            val states = mutableListOf<String>()
            val errors = mutableListOf<String>()
            val pipeline =
                createMediaPipeline(
                    canvas = canvas,
                    stableVolume = false,
                    onTime = times::add,
                    onState = states::add,
                    onEnded = {},
                    onDecoderError = { kind, message -> errors += "$kind:$message" },
                    onError = errors::add,
                )
            try {
                configureSoftwarePipeline(pipeline)

                val started = CompletableDeferred<Unit>()
                playMediaPipeline(
                    pipeline = pipeline,
                    onComplete = { started.complete(Unit) },
                    onError = { started.completeExceptionally(IllegalStateException(it)) },
                )
                started.await()
                awaitAnimationFrames(8)

                assertTrue(mediaPipelineIsBuffering(pipeline))
                assertTrue("buffering" in states)
                assertTrue(times.isEmpty(), "The media clock advanced before video preroll: $times")

                pushSoftwareVideoFrame(
                    pipeline = pipeline,
                    rgba = QUADRANT_RGBA.toInt8Array(),
                    width = 2,
                    height = 2,
                    lineSize = 8,
                    timestamp = 0.0,
                )
                awaitAnimationFrames(3)

                assertTrue(!mediaPipelineIsBuffering(pipeline))
                assertEquals(1.0, mediaPipelinePresentedFrames(pipeline))
                assertEquals(0.0, mediaPipelineDroppedFrames(pipeline))
                assertTrue(errors.isEmpty(), "Pipeline errors: $errors")
            } finally {
                destroyMediaPipeline(pipeline)
            }
        }

    @Test
    fun vrVideoStartsBeforeTheFirstAudioFrameArrives() =
        runTest(timeout = 30.seconds) {
            val canvas = document.createElement("canvas") as HTMLCanvasElement
            val states = mutableListOf<String>()
            val errors = mutableListOf<String>()
            val pipeline =
                createMediaPipeline(
                    canvas = canvas,
                    stableVolume = false,
                    onTime = {},
                    onState = states::add,
                    onEnded = {},
                    onDecoderError = { kind, message -> errors += "$kind:$message" },
                    onError = errors::add,
                )
            try {
                configureSoftwareAudioVideoPipeline(pipeline)
                setMediaPipelineProjection(
                    pipeline = pipeline,
                    projection = "vr180",
                    stereoLayout = "side_by_side",
                    eyeOrder = "right_first",
                    rotationDegrees = 0,
                    yawDegrees = 0f,
                    pitchDegrees = 0f,
                    fieldOfViewDegrees = 90f,
                    cropLeft = 0f,
                    cropTop = 0f,
                    cropRight = 0f,
                    cropBottom = 0f,
                )
                pushSoftwareVideoFrame(
                    pipeline = pipeline,
                    rgba = QUADRANT_RGBA.toInt8Array(),
                    width = 2,
                    height = 2,
                    lineSize = 8,
                    timestamp = 0.0,
                )

                val started = CompletableDeferred<Unit>()
                playMediaPipeline(
                    pipeline = pipeline,
                    onComplete = { started.complete(Unit) },
                    onError = { started.completeExceptionally(IllegalStateException(it)) },
                )
                started.await()
                awaitAnimationFrames(3)

                assertTrue(!mediaPipelineIsBuffering(pipeline))
                assertTrue("buffering" !in states)
                assertEquals("vr180|side_by_side|right_first", readProjectionConfiguration(pipeline))
                assertEquals(1.0, mediaPipelinePresentedFrames(pipeline))
                assertTrue(errors.isEmpty(), "Pipeline errors: $errors")
            } finally {
                destroyMediaPipeline(pipeline)
            }
        }

    @Test
    fun softwareRendererDropsOnlyFramesThatWereNeverPresentedAndAreAlreadyLate() =
        runTest(timeout = 30.seconds) {
            val canvas = document.createElement("canvas") as HTMLCanvasElement
            val pipeline =
                createMediaPipeline(
                    canvas = canvas,
                    stableVolume = false,
                    onTime = {},
                    onState = {},
                    onEnded = {},
                    onDecoderError = { _, _ -> },
                    onError = { throw AssertionError(it) },
                )
            try {
                configureSoftwarePipeline(pipeline)
                pushSoftwareVideoFrame(
                    pipeline = pipeline,
                    rgba = QUADRANT_RGBA.toInt8Array(),
                    width = 2,
                    height = 2,
                    lineSize = 8,
                    timestamp = 0.0,
                )
                awaitAnimationFrames(3)

                pushSoftwareVideoFrame(
                    pipeline = pipeline,
                    rgba = QUADRANT_RGBA.toInt8Array(),
                    width = 2,
                    height = 2,
                    lineSize = 8,
                    timestamp = 0.033,
                )
                setMediaPipelinePosition(pipeline, 0.033)
                awaitAnimationFrames(3)
                assertEquals(2.0, mediaPipelinePresentedFrames(pipeline))
                assertEquals(
                    0.0,
                    mediaPipelineDroppedFrames(pipeline),
                    "Advancing past an already-presented frame is not a dropped frame.",
                )

                pushSoftwareVideoFrame(
                    pipeline = pipeline,
                    rgba = QUADRANT_RGBA.toInt8Array(),
                    width = 2,
                    height = 2,
                    lineSize = 8,
                    timestamp = 0.5,
                )
                setMediaPipelinePosition(pipeline, 1.0)
                awaitAnimationFrames(3)
                assertEquals(1.0, mediaPipelineDroppedFrames(pipeline))
            } finally {
                destroyMediaPipeline(pipeline)
            }
        }

    @Test
    fun softwareRendererNeverPresentsARegressingTimestamp() =
        runTest(timeout = 30.seconds) {
            val canvas = document.createElement("canvas") as HTMLCanvasElement
            val pipeline =
                createMediaPipeline(
                    canvas = canvas,
                    stableVolume = false,
                    onTime = {},
                    onState = {},
                    onEnded = {},
                    onDecoderError = { _, _ -> },
                    onError = { throw AssertionError(it) },
                )
            try {
                configureSoftwarePipeline(pipeline)
                pushSoftwareVideoFrame(
                    pipeline = pipeline,
                    rgba = QUADRANT_RGBA.toInt8Array(),
                    width = 2,
                    height = 2,
                    lineSize = 8,
                    timestamp = 0.2,
                )
                setMediaPipelinePosition(pipeline, 0.2)
                awaitAnimationFrames(3)
                assertEquals(1.0, mediaPipelinePresentedFrames(pipeline))

                // AVI/MPEG-4 Part 2 streams with B-frames can yield a delayed
                // frame after its successor. It must never replace the frame
                // which has already been presented.
                pushSoftwareVideoFrame(
                    pipeline = pipeline,
                    rgba = QUADRANT_RGBA.reversedArray().toInt8Array(),
                    width = 2,
                    height = 2,
                    lineSize = 8,
                    timestamp = 0.16,
                )
                awaitAnimationFrames(3)

                assertEquals(1.0, mediaPipelinePresentedFrames(pipeline))
                assertEquals(1.0, mediaPipelineDroppedFrames(pipeline))
            } finally {
                destroyMediaPipeline(pipeline)
            }
        }

    @Test
    fun stableVolumeUsesCompressorAndPerceptualGainCurve() {
        val canvas = document.createElement("canvas") as HTMLCanvasElement
        val errors = mutableListOf<String>()
        val pipeline =
            createMediaPipeline(
                canvas = canvas,
                stableVolume = false,
                onTime = {},
                onState = {},
                onEnded = {},
                onDecoderError = { kind, message -> errors += "$kind:$message" },
                onError = errors::add,
            )
        try {
            setMediaPipelineVolume(pipeline, 0.5f)
            assertTrue(readPipelineGain(pipeline) in 0.249..0.251)
            setMediaPipelineMuted(pipeline, true)
            assertEquals(0.0, readPipelineGain(pipeline))
            setMediaPipelineMuted(pipeline, false)
            setMediaPipelineStableVolume(pipeline, true)
            assertTrue(readStableVolumeEnabled(pipeline))
            assertTrue(readCompressorAvailable(pipeline))
            assertTrue(errors.isEmpty())
        } finally {
            destroyMediaPipeline(pipeline)
        }
    }

    @Test
    fun softwarePcmUsesAContinuousPreScheduledAudioTimeline() =
        runTest(timeout = 30.seconds) {
            val canvas = document.createElement("canvas") as HTMLCanvasElement
            val errors = mutableListOf<String>()
            val pipeline =
                createMediaPipeline(
                    canvas = canvas,
                    stableVolume = false,
                    onTime = {},
                    onState = {},
                    onEnded = {},
                    onDecoderError = { kind, message -> errors += "$kind:$message" },
                    onError = errors::add,
                )
            try {
                configureSoftwareAudioPipeline(pipeline)
                val silentPlane = ByteArray(PCM_TEST_FRAMES * Float.SIZE_BYTES).toInt8Array()
                listOf(0.0, 0.099, 0.198, 0.297).forEach { timestamp ->
                    beginSoftwarePcmFrame(
                        pipeline = pipeline,
                        timestamp = timestamp,
                        mediaDuration = PCM_TEST_DURATION,
                        frames = PCM_TEST_FRAMES,
                        channels = 2,
                        sampleRate = PCM_TEST_SAMPLE_RATE,
                        stretched = false,
                    )
                    pushSoftwarePcmPlane(pipeline, 0, silentPlane)
                    pushSoftwarePcmPlane(pipeline, 1, silentPlane)
                    commitSoftwarePcmFrame(pipeline)
                }

                assertEquals(
                    "0.000|0.100|0.200|0.300",
                    readAudioSegmentTimestamps(pipeline),
                )
                assertTrue(mediaPipelineAudioTimestampCorrections(pipeline) >= 3.0)

                val started = CompletableDeferred<Unit>()
                playMediaPipeline(
                    pipeline = pipeline,
                    onComplete = { started.complete(Unit) },
                    onError = { started.completeExceptionally(IllegalStateException(it)) },
                )
                started.await()

                assertEquals(4, readScheduledAudioCount(pipeline))
                assertTrue(
                    readMaximumScheduledAudioGap(pipeline) < 0.001,
                    "PCM blocks were not scheduled as one continuous Web Audio timeline.",
                )
                assertTrue(errors.isEmpty(), "Audio pipeline errors: $errors")
            } finally {
                destroyMediaPipeline(pipeline)
            }
        }

    @Test
    fun signalsmithStretchPreservesPitchAndResetsCleanly() =
        runTest(timeout = 30.seconds) {
            val demuxer =
                Demuxer(
                    HttpSource("/base/kotlin/media/h264-aac.mp4", cacheConfig = TEST_PIPELINE_CACHE),
                    WasmRuntimeConfig(assetBaseUrl = "/base/kotlin/kmedia-wasm-runtime/"),
                )
            try {
                demuxer.open()
                val stretcher = assertNotNull(demuxer.createTimeStretcher(channels = 2, sampleRate = SAMPLE_RATE))
                try {
                    val source = syntheticStereoSine()
                    val faster = stretcher.processPlanar(source, playbackRate = 1.5f)
                    assertTrue(faster.numberOfFrames in 31_900..32_100)
                    assertFrequencyPreserved(faster.planes.first(), faster.sampleRate)

                    stretcher.reset()
                    val slower = stretcher.processPlanar(source, playbackRate = 0.75f)
                    assertTrue(slower.numberOfFrames in 63_900..64_100)
                    assertFrequencyPreserved(slower.planes.first(), slower.sampleRate)
                } finally {
                    stretcher.close()
                }
            } finally {
                demuxer.close()
            }
        }
}

private suspend fun configureSoftwarePipeline(pipeline: JsAny) {
    val completed = CompletableDeferred<Unit>()
    configureMediaPipeline(
        pipeline = pipeline,
        requestWebVideo = false,
        videoCodec = "software",
        videoFallbackCodecs = "",
        videoWidth = 2,
        videoHeight = 2,
        videoDescription = null,
        colorPrimaries = "bt2020",
        colorTransfer = "smpte2084",
        colorMatrix = "bt2020nc",
        requestWebAudio = false,
        audioCodec = "",
        audioSampleRate = 0,
        audioChannels = 0,
        audioDescription = null,
        duration = 1.0,
        onComplete = { _, _ -> completed.complete(Unit) },
        onError = { message -> completed.completeExceptionally(IllegalStateException(message)) },
    )
    completed.await()
}

private suspend fun configureSoftwareAudioPipeline(pipeline: JsAny) {
    val completed = CompletableDeferred<Unit>()
    configureMediaPipeline(
        pipeline = pipeline,
        requestWebVideo = false,
        videoCodec = "",
        videoFallbackCodecs = "",
        videoWidth = 0,
        videoHeight = 0,
        videoDescription = null,
        colorPrimaries = "",
        colorTransfer = "",
        colorMatrix = "",
        requestWebAudio = false,
        audioCodec = "wmapro",
        audioSampleRate = PCM_TEST_SAMPLE_RATE,
        audioChannels = 2,
        audioDescription = null,
        duration = 1.0,
        onComplete = { _, _ -> completed.complete(Unit) },
        onError = { message -> completed.completeExceptionally(IllegalStateException(message)) },
    )
    completed.await()
}

private suspend fun configureSoftwareAudioVideoPipeline(pipeline: JsAny) {
    val completed = CompletableDeferred<Unit>()
    configureMediaPipeline(
        pipeline = pipeline,
        requestWebVideo = false,
        videoCodec = "software",
        videoFallbackCodecs = "",
        videoWidth = 2,
        videoHeight = 2,
        videoDescription = null,
        colorPrimaries = "bt709",
        colorTransfer = "bt709",
        colorMatrix = "bt709",
        requestWebAudio = false,
        audioCodec = "aac",
        audioSampleRate = PCM_TEST_SAMPLE_RATE,
        audioChannels = 2,
        audioDescription = null,
        duration = 1.0,
        onComplete = { _, _ -> completed.complete(Unit) },
        onError = { message -> completed.completeExceptionally(IllegalStateException(message)) },
    )
    completed.await()
}

private suspend fun awaitAnimationFrames(count: Int) {
    val completed = CompletableDeferred<Unit>()
    scheduleAnimationFrames(count) { completed.complete(Unit) }
    completed.await()
}

@Suppress("UNUSED_PARAMETER")
private fun scheduleAnimationFrames(
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

@Suppress("UNUSED_PARAMETER")
private fun readPipelinePixels(pipeline: JsAny): Int8Array =
    js(
        """
        (function() {
            const width = pipeline.canvas.width;
            const height = pipeline.canvas.height;
            if (pipeline.webgl) {
                const gl = pipeline.webgl.gl;
                const pixels = new Uint8Array(width * height * 4);
                gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                return new Int8Array(pixels.buffer);
            }
            const pixels = pipeline.context2d.getImageData(0, 0, width, height).data;
            return new Int8Array(pixels.buffer, pixels.byteOffset, pixels.byteLength);
        })()
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun readPipelineInputMode(pipeline: JsAny): Int =
    js("Number(pipeline.webgl ? pipeline.webgl.uploadedInputMode : -1)")

@Suppress("UNUSED_PARAMETER")
private fun readAudioSegmentTimestamps(pipeline: JsAny): String =
    js("pipeline.audioSegments.map(segment => segment.timestamp.toFixed(3)).join('|')")

@Suppress("UNUSED_PARAMETER")
private fun readScheduledAudioCount(pipeline: JsAny): Int =
    js("Number(pipeline.scheduledSources.length)")

@Suppress("UNUSED_PARAMETER")
private fun readMaximumScheduledAudioGap(pipeline: JsAny): Double =
    js(
        """
        (function() {
            const scheduled = pipeline.scheduledSources
                .slice()
                .sort((a, b) => a.contextStart - b.contextStart);
            let maximum = 0;
            for (let index = 1; index < scheduled.length; index += 1) {
                maximum = Math.max(
                    maximum,
                    Math.abs(scheduled[index].contextStart - scheduled[index - 1].contextEnd)
                );
            }
            return maximum;
        })()
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun readPipelineGain(pipeline: JsAny): Double =
    js("pipeline.gain ? Number(pipeline.gain.gain.value) : 0")

@Suppress("UNUSED_PARAMETER")
private fun readStableVolumeEnabled(pipeline: JsAny): Boolean =
    js("Boolean(pipeline.stableVolume)")

@Suppress("UNUSED_PARAMETER")
private fun readProjectionConfiguration(pipeline: JsAny): String =
    js("[pipeline.projection, pipeline.stereoLayout, pipeline.eyeOrder].join('|')")

@Suppress("UNUSED_PARAMETER")
private fun readCompressorAvailable(pipeline: JsAny): Boolean =
    js("Boolean(pipeline.compressor)")

private fun installVideoDecoderProbe(): Unit =
    js(
        """
        {
            const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, "VideoDecoder");
            const attempts = [];
            class ProbeVideoDecoder {
                static async isConfigSupported(config) {
                    attempts.push(
                        (config.hardwareAcceleration || "no-preference") +
                        ":" +
                        (config.colorSpace ? "color" : "no-color")
                    );
                    return {
                        supported:
                            config.hardwareAcceleration === "prefer-hardware" &&
                            !config.colorSpace,
                        config
                    };
                }
                constructor() {
                    this.state = "unconfigured";
                    this.decodeQueueSize = 0;
                }
                configure() {
                    this.state = "configured";
                }
                decode() {
                    this.decodeQueueSize += 1;
                }
                close() {
                    this.state = "closed";
                }
            }
            globalThis.__moviVideoDecoderProbe = { originalDescriptor, attempts };
            Object.defineProperty(globalThis, "VideoDecoder", {
                configurable: true,
                writable: true,
                value: ProbeVideoDecoder
            });
        }
        """,
    )

private fun readVideoDecoderProbeAttempts(): String =
    js("globalThis.__moviVideoDecoderProbe.attempts.join('|')")

@Suppress("UNUSED_PARAMETER")
private fun setPipelineVideoStartupTimeout(
    pipeline: JsAny,
    milliseconds: Double,
): Unit = js("pipeline.videoStartupTimeoutMs = Math.max(0, milliseconds)")

private fun restoreVideoDecoderProbe(): Unit =
    js(
        """
        {
            const probe = globalThis.__moviVideoDecoderProbe;
            if (!probe) return;
            if (probe.originalDescriptor) {
                Object.defineProperty(globalThis, "VideoDecoder", probe.originalDescriptor);
            } else {
                delete globalThis.VideoDecoder;
            }
            delete globalThis.__moviVideoDecoderProbe;
        }
        """,
    )

private fun ByteArray.toRgbaPixels(): List<List<Int>> =
    asList()
        .chunked(4)
        .map { pixel -> pixel.map { it.toInt() and 0xff } }

private fun assertPixelsNear(
    expected: List<List<Int>>,
    actual: List<List<Int>>,
) {
    assertEquals(expected.size, actual.size)
    expected.zip(actual).forEachIndexed { index, (left, right) ->
        val delta = left.zip(right).sumOf { (a, b) -> kotlin.math.abs(a - b) }
        assertTrue(delta <= 8, "Pixel $index differs by $delta: expected $left, actual $right.")
    }
}

private fun syntheticStereoSine(): NativePcmFrame {
    val samples =
        FloatArray(SAMPLE_RATE) { index ->
            (sin(2.0 * PI * TEST_FREQUENCY_HZ * index / SAMPLE_RATE) * 0.5).toFloat()
        }
    val bytes = samples.toLittleEndianBytes()
    return NativePcmFrame(
        planes = listOf(bytes.copyOf(), bytes.copyOf()),
        numberOfFrames = samples.size,
        numberOfChannels = 2,
        sampleRate = SAMPLE_RATE,
        ptsSeconds = 0.0,
    )
}

private fun FloatArray.toLittleEndianBytes(): ByteArray =
    ByteArray(size * Float.SIZE_BYTES).also { output ->
        forEachIndexed { index, value ->
            val bits = value.toBits()
            repeat(Float.SIZE_BYTES) { byte ->
                output[index * Float.SIZE_BYTES + byte] = (bits ushr (byte * 8)).toByte()
            }
        }
    }

private fun ByteArray.readLittleEndianFloat(sample: Int): Float {
    val offset = sample * Float.SIZE_BYTES
    val bits =
        (this[offset].toInt() and 0xff) or
            ((this[offset + 1].toInt() and 0xff) shl 8) or
            ((this[offset + 2].toInt() and 0xff) shl 16) or
            ((this[offset + 3].toInt() and 0xff) shl 24)
    return Float.fromBits(bits)
}

private fun assertFrequencyPreserved(
    plane: ByteArray,
    sampleRate: Int,
) {
    val sampleCount = plane.size / Float.SIZE_BYTES
    val margin = minOf(4_096, sampleCount / 6)
    val start = margin
    val end = sampleCount - margin
    var crossings = 0
    var sumSquares = 0.0
    var previous = plane.readLittleEndianFloat(start)
    for (sample in start + 1 until end) {
        val current = plane.readLittleEndianFloat(sample)
        if (previous <= 0f && current > 0f) crossings += 1
        sumSquares += current * current
        previous = current
    }
    val measuredFrequency = crossings * sampleRate.toDouble() / (end - start)
    val rms = sqrt(sumSquares / (end - start))
    assertTrue(measuredFrequency in 420.0..460.0, "Pitch shifted to $measuredFrequency Hz.")
    assertTrue(rms > 0.05, "Stretched signal is effectively silent (RMS=$rms).")
}

private val QUADRANT_RGBA =
    byteArrayOf(
        -1, 0, 0, -1,
        0, -1, 0, -1,
        0, 0, -1, -1,
        -1, -1, -1, -1,
    )
private val PROJECTION_NAMES =
    listOf(
        "equirectangular",
        "half_equirectangular",
        "vr180",
        "fisheye",
        "side_by_side",
        "little_planet",
    )
private val TEST_PIPELINE_CACHE = CacheConfig(maximumBytes = 4L * 1024L * 1024L)
private const val SAMPLE_RATE = 48_000
private const val TEST_FREQUENCY_HZ = 440.0
private const val PCM_TEST_SAMPLE_RATE = 48_000
private const val PCM_TEST_FRAMES = 4_800
private const val PCM_TEST_DURATION = 0.1
