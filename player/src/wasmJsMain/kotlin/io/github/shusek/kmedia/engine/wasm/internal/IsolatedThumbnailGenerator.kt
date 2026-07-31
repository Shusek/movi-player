@file:OptIn(ExperimentalWasmJsInterop::class)

package io.github.shusek.kmedia.engine.wasm.internal

import io.github.shusek.kmedia.engine.wasm.Demuxer
import io.github.shusek.kmedia.engine.wasm.EncryptedHttpSource
import io.github.shusek.kmedia.engine.wasm.FileSource
import io.github.shusek.kmedia.engine.wasm.HttpSource
import io.github.shusek.kmedia.engine.wasm.MediaSource
import io.github.shusek.kmedia.engine.wasm.WasmMediaError
import io.github.shusek.kmedia.engine.wasm.WasmMediaErrorCategory
import io.github.shusek.kmedia.engine.wasm.WasmMediaErrorCode
import io.github.shusek.kmedia.engine.wasm.WasmRuntimeConfig
import io.github.shusek.kmedia.engine.wasm.SourceAdapter
import io.github.shusek.kmedia.engine.wasm.VideoSnapshot
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.delay
import org.khronos.webgl.Int8Array
import org.khronos.webgl.toInt8Array
import org.w3c.dom.ImageBitmap
import kotlin.js.ExperimentalWasmJsInterop
import kotlin.js.js
import kotlin.time.Duration
import kotlin.time.Duration.Companion.seconds

internal suspend fun generateIsolatedThumbnail(
    source: MediaSource,
    runtime: WasmRuntimeConfig,
    position: Duration,
    maximumWidth: Int,
    rotationDegrees: Int,
): VideoSnapshot {
    val adapter =
        source.thumbnailAdapter()
            ?: throw WasmMediaError(
                WasmMediaErrorCategory.SOURCE,
                WasmMediaErrorCode.THUMBNAIL_FAILED,
                "This source cannot create an independent thumbnail cursor.",
            )
    val demuxer = Demuxer(adapter, runtime)
    try {
        val info = demuxer.open()
        val track =
            info.videoTracks.firstOrNull { !it.isAttachedPicture }
                ?: throw WasmMediaError(
                    WasmMediaErrorCategory.FORMAT,
                    WasmMediaErrorCode.THUMBNAIL_FAILED,
                    "The source has no video track for thumbnail generation.",
                )
        info.tracks.forEach { demuxer.setStreamDiscard(it.id, it.id != track.id) }
        if (demuxer.enableDecoder(track.id) < 0) {
            throw WasmMediaError(
                WasmMediaErrorCategory.DECODER,
                WasmMediaErrorCode.THUMBNAIL_FAILED,
                "The thumbnail video decoder could not be initialized.",
            )
        }
        val target = position.coerceIn(Duration.ZERO, info.duration)
        demuxer.seek(target, streamIndex = track.id, flags = 1)
        var selected: NativeVideoFrame? = null
        var packetIndex = 0
        while (packetIndex < MAX_THUMBNAIL_PACKETS) {
            val packet = demuxer.readPacket() ?: break
            if (packet.streamIndex != track.id || packet.isRasl) {
                packetIndex += 1
                continue
            }
            val pts = packet.presentationTime.inWholeMilliseconds / 1_000.0
            val dts = packet.decodeTime.inWholeMilliseconds / 1_000.0
            if (demuxer.sendPacket(track.id, packet.data, pts, dts, packet.keyframe) >= 0) {
                while (demuxer.receiveFrame(track.id) == 0) {
                    val frame = demuxer.decodedVideoFrame(track.id, maximumWidth) ?: continue
                    selected = frame
                    if (frame.ptsSeconds >= target.inWholeMilliseconds / 1_000.0) {
                        break
                    }
                }
            }
            if (selected?.ptsSeconds?.let { it >= target.inWholeMilliseconds / 1_000.0 } == true) {
                break
            }
            if (packetIndex % THUMBNAIL_YIELD_INTERVAL == 0) delay(0)
            packetIndex += 1
        }
        val frame =
            selected
                ?: throw WasmMediaError(
                    WasmMediaErrorCategory.DECODER,
                    WasmMediaErrorCode.THUMBNAIL_FAILED,
                    "No decodable frame was found near the requested thumbnail time.",
                )
        val image = rgbaToImageBitmap(frame, track.rotationDegrees + rotationDegrees)
        val rotated = (track.rotationDegrees + rotationDegrees).normalizedRotation()
        return VideoSnapshot(
            image = image,
            timestamp =
                frame.ptsSeconds
                    .takeIf { it.isFinite() && it >= 0.0 }
                    ?.seconds
                    ?: target,
            width = if (rotated == 90 || rotated == 270) frame.height else frame.width,
            height = if (rotated == 90 || rotated == 270) frame.width else frame.height,
        )
    } finally {
        demuxer.closeAndAwait()
    }
}

internal suspend fun extractIsolatedAttachedPicture(
    source: MediaSource,
    runtime: WasmRuntimeConfig,
): EncodedPicture? {
    val adapter = source.thumbnailAdapter() ?: return null
    val demuxer = Demuxer(adapter, runtime)
    return try {
        val info = demuxer.open()
        val track = info.videoTracks.firstOrNull { it.isAttachedPicture } ?: return null
        info.tracks.forEach { demuxer.setStreamDiscard(it.id, it.id != track.id) }
        var remaining = MAX_COVER_ART_PACKETS
        while (remaining-- > 0) {
            val packet = demuxer.readPacket() ?: break
            if (packet.streamIndex == track.id && packet.data.isNotEmpty()) {
                return EncodedPicture(
                    data = packet.data,
                    mimeType = track.codec.coverArtMimeType(),
                )
            }
        }
        null
    } finally {
        demuxer.closeAndAwait()
    }
}

internal data class EncodedPicture(
    val data: ByteArray,
    val mimeType: String,
)

private fun MediaSource.thumbnailAdapter(): SourceAdapter? =
    when (this) {
        is MediaSource.Url -> HttpSource(url, headers)
        is MediaSource.BrowserFile -> FileSource(file)
        is MediaSource.Adapter -> adapter.fork()
        is MediaSource.Composite -> primary.thumbnailAdapter()
        is MediaSource.Encrypted -> EncryptedHttpSource(config)
        is MediaSource.BrowserMedia -> null
        is MediaSource.Drm -> null
    }

private fun String.coverArtMimeType(): String =
    when (lowercase()) {
        "mjpeg", "jpeg", "jpg" -> "image/jpeg"
        "png" -> "image/png"
        "webp" -> "image/webp"
        "bmp" -> "image/bmp"
        "gif" -> "image/gif"
        "tiff" -> "image/tiff"
        else -> "application/octet-stream"
    }

private suspend fun rgbaToImageBitmap(
    frame: NativeVideoFrame,
    rotationDegrees: Int,
): ImageBitmap {
    val deferred = CompletableDeferred<ImageBitmap>()
    createRotatedRgbaBitmap(
        rgba = frame.rgba.toInt8Array(),
        width = frame.width,
        height = frame.height,
        lineSize = frame.lineSize,
        rotationDegrees = rotationDegrees.normalizedRotation(),
        onComplete = deferred::complete,
        onError = { message ->
            deferred.completeExceptionally(
                WasmMediaError(
                    WasmMediaErrorCategory.RENDERER,
                    WasmMediaErrorCode.THUMBNAIL_FAILED,
                    message,
                ),
            )
        },
    )
    return deferred.await()
}

private fun Int.normalizedRotation(): Int = ((this % 360) + 360) % 360

@Suppress("UNUSED_PARAMETER", "LongParameterList")
private fun createRotatedRgbaBitmap(
    rgba: Int8Array,
    width: Int,
    height: Int,
    lineSize: Int,
    rotationDegrees: Int,
    onComplete: (ImageBitmap) -> Unit,
    onError: (String) -> Unit,
): Unit =
    js(
        """
        {
            try {
                const input = new Uint8Array(rgba.buffer, rgba.byteOffset, rgba.byteLength);
                const packed = new Uint8ClampedArray(width * height * 4);
                for (let row = 0; row < height; row += 1) {
                    packed.set(
                        input.subarray(row * lineSize, row * lineSize + width * 4),
                        row * width * 4
                    );
                }
                const source =
                    typeof OffscreenCanvas === "function"
                        ? new OffscreenCanvas(width, height)
                        : document.createElement("canvas");
                source.width = width;
                source.height = height;
                source.getContext("2d").putImageData(new ImageData(packed, width, height), 0, 0);
                const sideways = rotationDegrees === 90 || rotationDegrees === 270;
                const targetWidth = sideways ? height : width;
                const targetHeight = sideways ? width : height;
                const output =
                    typeof OffscreenCanvas === "function"
                        ? new OffscreenCanvas(targetWidth, targetHeight)
                        : document.createElement("canvas");
                output.width = targetWidth;
                output.height = targetHeight;
                const context = output.getContext("2d");
                context.translate(targetWidth / 2, targetHeight / 2);
                context.rotate(rotationDegrees * Math.PI / 180);
                context.drawImage(source, -width / 2, -height / 2);
                Promise.resolve(createImageBitmap(output))
                    .then(function(bitmap) { onComplete(bitmap); })
                    .catch(function(error) {
                        onError(String(error && error.message ? error.message : error));
                    });
            } catch (error) {
                onError(String(error && error.message ? error.message : error));
            }
        }
        """,
    )

private const val MAX_THUMBNAIL_PACKETS: Int = 2_000
private const val THUMBNAIL_YIELD_INTERVAL: Int = 8
private const val MAX_COVER_ART_PACKETS: Int = 64
