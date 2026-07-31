package io.github.shusek.kmedia.engine.wasm.internal

import io.github.shusek.kmedia.engine.wasm.SourceAdapter
import io.github.shusek.kmedia.engine.wasm.WasmMediaError
import io.github.shusek.kmedia.engine.wasm.WasmMediaErrorCategory
import io.github.shusek.kmedia.engine.wasm.WasmMediaErrorCode
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Deferred
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.NonCancellable
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.async
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import org.khronos.webgl.DataView
import org.khronos.webgl.toByteArray
import org.khronos.webgl.toInt8Array

internal data class NativeStreamInfo(
    val index: Int,
    val type: Int,
    val codecId: Int,
    val codecName: String,
    val width: Int,
    val height: Int,
    val frameRate: Double,
    val channels: Int,
    val sampleRate: Int,
    val durationSeconds: Double,
    val bitRate: Long,
    val extradataSize: Int,
    val profile: Int,
    val level: Int,
    val language: String,
    val label: String,
    val rotation: Int,
    val colorPrimaries: String,
    val colorTransfer: String,
    val colorMatrix: String,
    val pixelFormat: String,
    val colorRange: String,
    val projection: Int,
    val isAttachedPicture: Boolean,
)

internal data class NativePacket(
    val streamIndex: Int,
    val keyframe: Boolean,
    val ptsSeconds: Double,
    val dtsSeconds: Double,
    val durationSeconds: Double,
    val data: ByteArray,
    val isIdr: Boolean,
    val isRasl: Boolean,
    val disposable: Boolean,
)

internal data class NativeAttachment(
    val streamIndex: Int,
    val name: String,
    val mimeType: String,
    val data: ByteArray,
)

internal data class NativeChapter(
    val id: String,
    val title: String,
    val language: String?,
    val startSeconds: Double,
    val endSeconds: Double,
    val hidden: Boolean,
)

internal data class NativeVideoFrame(
    val width: Int,
    val height: Int,
    val lineSize: Int,
    val ptsSeconds: Double,
    val rgba: ByteArray,
)

internal data class NativeYuvFrame(
    val width: Int,
    val height: Int,
    val format: String,
    val lineSizes: List<Int>,
    val ptsSeconds: Double,
    val planes: List<ByteArray>,
)

internal data class NativePcmFrame(
    val planes: List<ByteArray>,
    val numberOfFrames: Int,
    val numberOfChannels: Int,
    val sampleRate: Int,
    val ptsSeconds: Double,
)

internal data class NativeAudioPacket(
    val data: ByteArray,
    val ptsSeconds: Double,
)

internal data class NativeSubtitleBitmap(
    val width: Int,
    val height: Int,
    val x: Int,
    val y: Int,
    val rgba: ByteArray,
)

internal data class NativeSubtitleFrame(
    val startSeconds: Double,
    val endSeconds: Double,
    val text: String?,
    val bitmap: NativeSubtitleBitmap?,
)

/**
 * Emscripten Asyncify exposes one pending read/seek slot and one callback pair on the shared
 * module. Keep every asynchronous native operation serialized across all demuxer contexts.
 */
private val sharedNativeIoMutex: Mutex = Mutex()
private val sharedNativeCleanupScope: CoroutineScope =
    CoroutineScope(SupervisorJob() + Dispatchers.Default)

internal class NativeBindings(
    private val module: NativeModule,
) {
    private val ioScope: CoroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private var source: SourceAdapter? = null
    private var sourceSize: Long = 0L
    private var context: Int = 0
    private var packetBuffer: Int = 0
    private var packetBufferSize: Int = DEFAULT_PACKET_BUFFER_SIZE
    private var closed: Boolean = false
    private var closeDeferred: Deferred<Unit>? = null

    init {
        module._movi_set_log_level(AV_LOG_QUIET)
    }

    suspend fun open(source: SourceAdapter): Int {
        check(!closed) { "Native bindings are closed." }
        this.source = source
        val size = source.getSize()
        sourceSize = size
        return withNativeIo {
            if (context != 0) closeContext()

            context = module._movi_create()
            if (context == 0) {
                throw nativeFailure("The native demuxer context could not be allocated.")
            }
            packetBuffer = module._malloc(packetBufferSize)
            if (packetBuffer == 0) {
                closeContext()
                throw nativeFailure("The native packet buffer could not be allocated.")
            }

            setNativeFileSize(module, size.toDouble())
            module._movi_set_file_size(
                context = context,
                sizeLow = size.toInt(),
                sizeHigh = (size ushr 32).toInt(),
            )

            val deferred = CompletableDeferred<Int>()
            invokeNativeOpen(
                module = module,
                context = context,
                onResult = deferred::complete,
                onError = { message -> deferred.completeExceptionally(nativeFailure(message)) },
            )
            val streamCount = deferred.await()
            if (streamCount < 0) {
                throw nativeFailure("The native demuxer rejected the media source (code $streamCount).")
            }
            streamCount
        }
    }

    fun durationSeconds(): Double = if (context == 0) 0.0 else module._movi_get_duration(context)

    fun startTimeSeconds(): Double = if (context == 0) 0.0 else module._movi_get_start_time(context)

    fun formatName(): String = readResultString(64) { pointer, size ->
        module._movi_get_format_name(context, pointer, size)
    }

    fun metadataTitle(): String = readResultString(512) { pointer, size ->
        module._movi_get_metadata_title(context, pointer, size)
    }

    fun streamCount(): Int = if (context == 0) 0 else module._movi_get_stream_count(context)

    fun streamInfo(streamIndex: Int): NativeStreamInfo? {
        if (context == 0) return null
        val pointer = module._malloc(STREAM_INFO_SIZE)
        if (pointer == 0) return null
        clearNativeMemory(module, pointer, pointer + STREAM_INFO_SIZE)
        try {
            if (module._movi_get_stream_info(context, streamIndex, pointer) != 0) return null
            val view = dataView(module, pointer, STREAM_INFO_SIZE)
            return NativeStreamInfo(
                index = view.getInt32(STREAM_INDEX, true),
                type = view.getInt32(STREAM_TYPE, true),
                codecId = view.getInt32(STREAM_CODEC_ID, true),
                codecName = module.UTF8ToString(pointer + STREAM_CODEC_NAME),
                width = view.getInt32(STREAM_WIDTH, true),
                height = view.getInt32(STREAM_HEIGHT, true),
                frameRate = view.getFloat64(STREAM_FRAME_RATE, true),
                channels = view.getInt32(STREAM_CHANNELS, true),
                sampleRate = view.getInt32(STREAM_SAMPLE_RATE, true),
                durationSeconds = view.getFloat64(STREAM_DURATION, true),
                bitRate = view.readSignedLong(STREAM_BIT_RATE),
                extradataSize = view.getInt32(STREAM_EXTRADATA_SIZE, true),
                profile = view.getInt32(STREAM_PROFILE, true),
                level = view.getInt32(STREAM_LEVEL, true),
                language = module.UTF8ToString(pointer + STREAM_LANGUAGE),
                label = module.UTF8ToString(pointer + STREAM_LABEL),
                rotation = view.getInt32(STREAM_ROTATION, true),
                colorPrimaries = module.UTF8ToString(pointer + STREAM_COLOR_PRIMARIES),
                colorTransfer = module.UTF8ToString(pointer + STREAM_COLOR_TRANSFER),
                colorMatrix = module.UTF8ToString(pointer + STREAM_COLOR_MATRIX),
                pixelFormat = module.UTF8ToString(pointer + STREAM_PIXEL_FORMAT),
                colorRange = module.UTF8ToString(pointer + STREAM_COLOR_RANGE),
                projection = view.getInt32(STREAM_PROJECTION, true),
                isAttachedPicture = view.getInt32(STREAM_ATTACHED_PICTURE, true) != 0,
            )
        } finally {
            module._free(pointer)
        }
    }

    fun extradata(streamIndex: Int): ByteArray? {
        val size = streamInfo(streamIndex)?.extradataSize ?: return null
        if (size <= 0) return null
        val pointer = module._malloc(size)
        if (pointer == 0) return null
        return try {
            val copied = module._movi_get_extradata(context, streamIndex, pointer, size)
            if (copied <= 0) null else heapSlice(module, pointer, pointer + copied).toByteArrayCopy()
        } finally {
            module._free(pointer)
        }
    }

    fun chapters(): List<NativeChapter> {
        if (context == 0) return emptyList()
        val count = module._movi_get_chapter_count(context).coerceAtLeast(0)
        if (count == 0) return emptyList()
        val title = module._malloc(512)
        val id = module._malloc(128)
        val language = module._malloc(64)
        if (title == 0 || id == 0 || language == 0) {
            if (title != 0) module._free(title)
            if (id != 0) module._free(id)
            if (language != 0) module._free(language)
            return emptyList()
        }
        return try {
            buildList {
                repeat(count) { index ->
                    clearNativeMemory(module, title, title + 512)
                    clearNativeMemory(module, id, id + 128)
                    clearNativeMemory(module, language, language + 64)
                    module._movi_get_chapter_title(context, index, title, 512)
                    module._movi_get_chapter_id(context, index, id, 128)
                    module._movi_get_chapter_language(context, index, language, 64)
                    add(
                        NativeChapter(
                            id = module.UTF8ToString(id).ifBlank { "chapter-$index" },
                            title = module.UTF8ToString(title).ifBlank { "Chapter ${index + 1}" },
                            language = module.UTF8ToString(language).ifBlank { null },
                            startSeconds = module._movi_get_chapter_start(context, index).coerceAtLeast(0.0),
                            endSeconds = module._movi_get_chapter_end(context, index).coerceAtLeast(0.0),
                            hidden = module._movi_get_chapter_hidden(context, index) == 1,
                        ),
                    )
                }
            }
        } finally {
            module._free(title)
            module._free(id)
            module._free(language)
        }
    }

    fun attachments(
        maxTotalBytes: Int = DEFAULT_MAX_ATTACHMENTS_TOTAL,
        maxCount: Int = DEFAULT_MAX_ATTACHMENTS,
        maxAttachmentBytes: Int = DEFAULT_MAX_ATTACHMENT_SIZE,
    ): List<NativeAttachment> {
        if (context == 0) return emptyList()
        val count = module._movi_get_attachment_count(context).coerceIn(0, maxCount)
        val name = module._malloc(512)
        val mime = module._malloc(128)
        if (name == 0 || mime == 0) {
            if (name != 0) module._free(name)
            if (mime != 0) module._free(mime)
            return emptyList()
        }
        var total = 0
        return try {
            buildList {
                repeat(count) { index ->
                    val size = module._movi_get_attachment_size(context, index)
                    if (size <= 0 || size > maxAttachmentBytes || total + size > maxTotalBytes) return@repeat
                    val dataPointer = module._malloc(size)
                    if (dataPointer == 0) return@repeat
                    try {
                        clearNativeMemory(module, name, name + 512)
                        clearNativeMemory(module, mime, mime + 128)
                        module._movi_get_attachment_name(context, index, name, 512)
                        module._movi_get_attachment_mime_type(context, index, mime, 128)
                        val copied = module._movi_get_attachment_data(context, index, dataPointer, size)
                        if (copied <= 0 || total + copied > maxTotalBytes) return@repeat
                        add(
                            NativeAttachment(
                                streamIndex = module._movi_get_attachment_stream_index(context, index),
                                name = module.UTF8ToString(name),
                                mimeType = module.UTF8ToString(mime),
                                data = heapSlice(module, dataPointer, dataPointer + copied).toByteArrayCopy(),
                            ),
                        )
                        total += copied
                    } finally {
                        module._free(dataPointer)
                    }
                }
            }
        } finally {
            module._free(name)
            module._free(mime)
        }
    }

    suspend fun readPacket(): NativePacket? =
        withNativeIo {
            if (context == 0 || closed) return@withNativeIo null
            val infoPointer = module._malloc(PACKET_INFO_SIZE)
            if (infoPointer == 0) throw nativeFailure("The packet metadata buffer could not be allocated.")
            clearNativeMemory(module, infoPointer, infoPointer + PACKET_INFO_SIZE)
            try {
                val deferred = CompletableDeferred<Int>()
                invokeNativeReadFrame(
                    module = module,
                    context = context,
                    infoPointer = infoPointer,
                    packetPointer = packetBuffer,
                    packetCapacity = packetBufferSize,
                    onResult = deferred::complete,
                    onError = { message -> deferred.completeExceptionally(nativeFailure(message)) },
                )
                val result = deferred.await()
                if (result == 0) return@withNativeIo null
                if (result < 0) throw nativeFailure("Native packet read failed (code $result).")

                val view = dataView(module, infoPointer, PACKET_INFO_SIZE)
                val size = view.getInt32(PACKET_SIZE, true)
                if (size !in 0..packetBufferSize) {
                    throw nativeFailure("Native packet metadata reported an invalid packet size.")
                }
                NativePacket(
                    streamIndex = view.getInt32(PACKET_STREAM_INDEX, true),
                    keyframe = view.getInt32(PACKET_KEYFRAME, true) != 0,
                    ptsSeconds = view.getFloat64(PACKET_PTS, true),
                    dtsSeconds = view.getFloat64(PACKET_DTS, true),
                    durationSeconds = view.getFloat64(PACKET_DURATION, true),
                    data = heapSlice(module, packetBuffer, packetBuffer + size).toByteArrayCopy(),
                    isIdr = view.getInt32(PACKET_IDR, true) != 0,
                    isRasl = view.getInt32(PACKET_RASL, true) != 0,
                    disposable = view.getInt32(PACKET_DISPOSABLE, true) != 0,
                )
            } finally {
                module._free(infoPointer)
            }
        }

    suspend fun seek(
        timestampSeconds: Double,
        streamIndex: Int = -1,
        flags: Int = 1,
    ): Unit =
        withNativeIo {
            if (context == 0 || closed) throw nativeFailure("The demuxer is not open.")
            val deferred = CompletableDeferred<Int>()
            invokeNativeSeek(
                module = module,
                context = context,
                timestamp = timestampSeconds,
                streamIndex = streamIndex,
                flags = flags,
                onResult = deferred::complete,
                onError = { message -> deferred.completeExceptionally(nativeFailure(message)) },
            )
            val result = deferred.await()
            if (result < 0) throw nativeFailure("Native seek failed (code $result).")
        }

    fun setStreamDiscard(
        streamIndex: Int,
        discard: Boolean,
    ) {
        if (context != 0) module._movi_set_stream_discard(context, streamIndex, if (discard) 1 else 0)
    }

    fun enableDecoder(
        streamIndex: Int,
        extradata: ByteArray?,
    ): Int {
        if (context == 0) return -1
        val bytes = extradata
        if (bytes == null || bytes.isEmpty()) return module._movi_enable_decoder(context, streamIndex, 0, 0)
        val pointer = module._malloc(bytes.size)
        if (pointer == 0) return -1
        return try {
            copyToNativeMemory(module, bytes.toInt8Array(), pointer)
            module._movi_enable_decoder(context, streamIndex, pointer, bytes.size)
        } finally {
            module._free(pointer)
        }
    }

    fun sendPacket(
        streamIndex: Int,
        data: ByteArray,
        ptsSeconds: Double,
        dtsSeconds: Double,
        keyframe: Boolean,
    ): Int {
        if (context == 0) return -1
        val allocationSize = data.size.coerceAtLeast(1)
        val pointer = module._malloc(allocationSize)
        if (pointer == 0) return -1
        return try {
            if (data.isNotEmpty()) copyToNativeMemory(module, data.toInt8Array(), pointer)
            module._movi_send_packet(
                context = context,
                streamIndex = streamIndex,
                data = pointer,
                size = data.size,
                pts = ptsSeconds,
                dts = dtsSeconds,
                keyframe = if (keyframe) 1 else 0,
            )
        } finally {
            module._free(pointer)
        }
    }

    fun receiveFrame(streamIndex: Int): Int =
        if (context == 0) -1 else module._movi_receive_frame(context, streamIndex)

    fun decodedVideoFrame(
        streamIndex: Int,
        maximumWidth: Int,
    ): NativeVideoFrame? {
        if (context == 0) return null
        val sourceWidth = module._movi_get_frame_width(context)
        val sourceHeight = module._movi_get_frame_height(context)
        if (sourceWidth <= 0 || sourceHeight <= 0) return null
        val targetWidth = sourceWidth.coerceAtMost(maximumWidth.coerceAtLeast(1))
        val targetHeight =
            if (targetWidth == sourceWidth) {
                sourceHeight
            } else {
                ((sourceHeight.toLong() * targetWidth) / sourceWidth)
                    .toInt()
                    .coerceAtLeast(1)
            }
        val pointer = module._movi_get_frame_rgba(context, targetWidth, targetHeight)
        if (pointer == 0) return null
        val lineSize = module._movi_get_frame_rgba_linesize(context)
        if (lineSize < targetWidth * RGBA_BYTES_PER_PIXEL) return null
        val byteCount = lineSize.toLong() * targetHeight
        if (byteCount <= 0 || byteCount > Int.MAX_VALUE) return null
        return NativeVideoFrame(
            width = targetWidth,
            height = targetHeight,
            lineSize = lineSize,
            ptsSeconds = module._movi_get_frame_pts(context, streamIndex),
            rgba = heapSlice(module, pointer, pointer + byteCount.toInt()).toByteArrayCopy(),
        )
    }

    fun decodedYuvVideoFrame(
        streamIndex: Int,
        maximumWidth: Int,
        pixelFormat: String?,
    ): NativeYuvFrame? {
        if (context == 0) return null
        val width = module._movi_get_frame_width(context)
        val height = module._movi_get_frame_height(context)
        if (width <= 0 || height <= 0 || width > maximumWidth.coerceAtLeast(1)) return null
        val format = pixelFormat.orEmpty().lowercase()
        val planeHeights =
            when (format) {
                "yuv420p", "yuvj420p" -> listOf(height, (height + 1) / 2, (height + 1) / 2)
                "yuv422p", "yuvj422p" -> listOf(height, height, height)
                "yuv444p", "yuvj444p" -> listOf(height, height, height)
                "nv12", "nv21" -> listOf(height, (height + 1) / 2)
                else -> return null
            }
        val lineSizes =
            planeHeights.indices.map { plane ->
                module._movi_get_frame_linesize(context, plane)
            }
        if (lineSizes.any { it <= 0 }) return null
        val planes =
            planeHeights.mapIndexed { plane, planeHeight ->
                val pointer = module._movi_get_frame_data(context, plane)
                val byteCount = lineSizes[plane].toLong() * planeHeight
                if (pointer == 0 || byteCount <= 0 || byteCount > Int.MAX_VALUE) return null
                heapSlice(module, pointer, pointer + byteCount.toInt()).toByteArrayCopy()
            }
        return NativeYuvFrame(
            width = width,
            height = height,
            format = format,
            lineSizes = lineSizes,
            ptsSeconds = module._movi_get_frame_pts(context, streamIndex),
            planes = planes,
        )
    }

    fun decodedAudioFrame(
        streamIndex: Int,
        fallbackPtsSeconds: Double,
    ): NativePcmFrame? {
        if (context == 0) return null
        val frames = module._movi_get_frame_samples(context)
        val channels = module._movi_get_frame_channels(context)
        val sampleRate = module._movi_get_frame_sample_rate(context)
        if (frames <= 0 || channels <= 0 || sampleRate <= 0 || channels > MAX_AUDIO_CHANNELS) return null
        val byteCount = frames.toLong() * Float.SIZE_BYTES
        if (byteCount <= 0 || byteCount > Int.MAX_VALUE) return null
        val planes =
            buildList(channels) {
                repeat(channels) { channel ->
                    val pointer = module._movi_get_frame_data(context, channel)
                    if (pointer == 0) return null
                    add(heapSlice(module, pointer, pointer + byteCount.toInt()).toByteArrayCopy())
                }
            }
        val nativePts = module._movi_get_frame_pts(context, streamIndex)
        return NativePcmFrame(
            planes = planes,
            numberOfFrames = frames,
            numberOfChannels = channels,
            sampleRate = sampleRate,
            ptsSeconds = nativePts.takeIf { it.isFinite() && it >= 0.0 } ?: fallbackPtsSeconds,
        )
    }

    fun decodeAudioBatch(
        streamIndex: Int,
        packets: List<NativeAudioPacket>,
    ): Pair<Int, NativePcmFrame?> {
        if (context == 0 || packets.isEmpty()) return 0 to null
        val totalBytes =
            packets.fold(0L) { total, packet -> total + packet.data.size }
                .takeIf { it in 0..Int.MAX_VALUE.toLong() }
                ?.toInt()
                ?: return -1 to null
        val blob = module._malloc(totalBytes.coerceAtLeast(1))
        val sizes = module._malloc(packets.size * Int.SIZE_BYTES)
        val timestamps = module._malloc(packets.size * Double.SIZE_BYTES)
        if (blob == 0 || sizes == 0 || timestamps == 0) {
            if (blob != 0) module._free(blob)
            if (sizes != 0) module._free(sizes)
            if (timestamps != 0) module._free(timestamps)
            return -1 to null
        }
        return try {
            val sizesView = dataView(module, sizes, packets.size * Int.SIZE_BYTES)
            val timestampsView = dataView(module, timestamps, packets.size * Double.SIZE_BYTES)
            var offset = 0
            packets.forEachIndexed { index, packet ->
                if (packet.data.isNotEmpty()) {
                    copyToNativeMemory(module, packet.data.toInt8Array(), blob + offset)
                }
                sizesView.setInt32(index * Int.SIZE_BYTES, packet.data.size, true)
                timestampsView.setFloat64(index * Double.SIZE_BYTES, packet.ptsSeconds, true)
                offset += packet.data.size
            }
            val consumed =
                module._movi_decode_audio_batch(
                    context,
                    streamIndex,
                    blob,
                    sizes,
                    timestamps,
                    packets.size,
                )
            consumed to if (consumed > 0) readAudioBatch() else null
        } finally {
            module._free(blob)
            module._free(sizes)
            module._free(timestamps)
        }
    }

    fun decodeSubtitle(
        streamIndex: Int,
        data: ByteArray,
        ptsSeconds: Double,
        durationSeconds: Double,
    ): NativeSubtitleFrame? {
        if (context == 0) return null
        val packet = module._malloc(data.size.coerceAtLeast(1))
        if (packet == 0) return null
        try {
            if (data.isNotEmpty()) copyToNativeMemory(module, data.toInt8Array(), packet)
            val result =
                module._movi_decode_subtitle(
                    context,
                    streamIndex,
                    packet,
                    data.size,
                    ptsSeconds,
                    durationSeconds,
                )
            if (result != 0) return null
            return readSubtitleFrame(ptsSeconds, durationSeconds)
        } finally {
            module._movi_free_subtitle(context)
            module._free(packet)
        }
    }

    suspend fun prefetchSubtitleCues(streamIndex: Int): List<NativeSubtitleFrame> =
        withNativeIo {
            if (context == 0 || closed) return@withNativeIo emptyList()
            module._movi_clear_prefetched_cues(context)
            val deferred = CompletableDeferred<Int>()
            invokeNativeSubtitlePrefetch(
                module = module,
                context = context,
                streamIndex = streamIndex,
                onResult = deferred::complete,
                onError = { message -> deferred.completeExceptionally(nativeFailure(message)) },
            )
            val result = deferred.await()
            if (result < 0) throw nativeFailure("Subtitle cue prefetch failed (code $result).")
            val count = module._movi_get_prefetched_cue_count(context).coerceIn(0, MAX_PREFETCHED_CUES)
            val times = module._malloc(2 * Double.SIZE_BYTES)
            val text = module._malloc(MAX_SUBTITLE_TEXT_BYTES)
            if (times == 0 || text == 0) {
                if (times != 0) module._free(times)
                if (text != 0) module._free(text)
                throw nativeFailure("Subtitle cue buffers could not be allocated.")
            }
            try {
                buildList(count) {
                    repeat(count) { index ->
                        clearNativeMemory(module, text, text + MAX_SUBTITLE_TEXT_BYTES)
                        val copied =
                            module._movi_get_prefetched_cue(
                                context,
                                index,
                                times,
                                times + Double.SIZE_BYTES,
                                text,
                                MAX_SUBTITLE_TEXT_BYTES,
                            )
                        if (copied >= 0) {
                            val view = dataView(module, times, 2 * Double.SIZE_BYTES)
                            add(
                                NativeSubtitleFrame(
                                    startSeconds = view.getFloat64(0, true),
                                    endSeconds = view.getFloat64(Double.SIZE_BYTES, true),
                                    text = module.UTF8ToString(text).ifBlank { null },
                                    bitmap = null,
                                ),
                            )
                        }
                    }
                }
            } finally {
                module._free(times)
                module._free(text)
            }
        }

    fun flushDecoder(streamIndex: Int) {
        if (context != 0) module._movi_flush_decoder(context, streamIndex)
    }

    fun setSkipFrame(
        streamIndex: Int,
        discardNonReference: Boolean,
    ) {
        if (context != 0) module._movi_set_skip_frame(context, streamIndex, if (discardNonReference) 1 else 0)
    }

    fun enableAudioDownmix(enabled: Boolean) {
        if (context != 0) module._movi_enable_audio_downmix(context, if (enabled) 1 else 0)
    }

    fun createTimeStretcher(
        channels: Int,
        sampleRate: Int,
    ): NativeTimeStretcher? {
        val handle = module._movi_stretch_new(channels, sampleRate.toFloat())
        return handle.takeIf { it != 0 }?.let { NativeTimeStretcher(module, it, channels) }
    }

    fun close() {
        requestClose()
    }

    suspend fun closeAndAwait() {
        requestClose().await()
    }

    private fun requestClose(): Deferred<Unit> {
        closeDeferred?.let { return it }
        closed = true
        return sharedNativeCleanupScope
            .async {
                sharedNativeIoMutex.withLock {
                    closeContext()
                    source?.close()
                    source = null
                    sourceSize = 0L
                }
                ioScope.cancel()
            }.also { closeDeferred = it }
    }

    private suspend fun <T> withNativeIo(operation: suspend () -> T): T =
        sharedNativeIoMutex.withLock {
            installNativeIoCallbacks(
                module = module,
                onRead = ::handleRead,
                onSeek = ::handleSeek,
            )
            setNativeFileSize(module, sourceSize.toDouble())
            withContext(NonCancellable) { operation() }
        }

    private fun closeContext() {
        if (packetBuffer != 0) {
            module._free(packetBuffer)
            packetBuffer = 0
        }
        if (context != 0) {
            module._movi_destroy(context)
            context = 0
        }
    }

    private fun handleRead(
        offset: Double,
        size: Int,
    ) {
        ioScope.launch {
            try {
                val bytes = source?.read(offset.toLong(), size) ?: ByteArray(0)
                fulfillNativeRead(module, bytes.toInt8Array(), bytes.size)
            } catch (_: Throwable) {
                fulfillNativeRead(module, ByteArray(0).toInt8Array(), -1)
            }
        }
    }

    private fun handleSeek(
        offset: Double,
        @Suppress("UNUSED_PARAMETER") whence: Int,
    ) {
        val resolved = source?.seek(offset.toLong()) ?: offset.toLong()
        fulfillNativeSeek(module, resolved.toDouble())
    }

    private fun readResultString(
        bufferSize: Int,
        operation: (Int, Int) -> Int,
    ): String {
        if (context == 0) return ""
        val pointer = module._malloc(bufferSize)
        if (pointer == 0) return ""
        clearNativeMemory(module, pointer, pointer + bufferSize)
        return try {
            if (operation(pointer, bufferSize) > 0) module.UTF8ToString(pointer) else ""
        } finally {
            module._free(pointer)
        }
    }

    private fun readAudioBatch(): NativePcmFrame? {
        val frames = module._movi_audio_batch_samples(context)
        val channels = module._movi_audio_batch_channels(context)
        val sampleRate = module._movi_audio_batch_sample_rate(context)
        if (frames <= 0 || channels <= 0 || sampleRate <= 0 || channels > MAX_AUDIO_CHANNELS) return null
        val byteCount = frames.toLong() * Float.SIZE_BYTES
        if (byteCount <= 0 || byteCount > Int.MAX_VALUE) return null
        val planes =
            buildList(channels) {
                repeat(channels) { channel ->
                    val pointer = module._movi_audio_batch_plane(context, channel)
                    if (pointer == 0) return null
                    add(heapSlice(module, pointer, pointer + byteCount.toInt()).toByteArrayCopy())
                }
            }
        return NativePcmFrame(
            planes = planes,
            numberOfFrames = frames,
            numberOfChannels = channels,
            sampleRate = sampleRate,
            ptsSeconds = module._movi_audio_batch_pts(context),
        )
    }

    private fun readSubtitleFrame(
        fallbackPtsSeconds: Double,
        fallbackDurationSeconds: Double,
    ): NativeSubtitleFrame {
        val times = module._malloc(2 * Double.SIZE_BYTES)
        val imageInfo = module._malloc(4 * Int.SIZE_BYTES)
        val text = module._malloc(MAX_SUBTITLE_TEXT_BYTES)
        var start = fallbackPtsSeconds
        var end = fallbackPtsSeconds + fallbackDurationSeconds.coerceAtLeast(DEFAULT_SUBTITLE_DURATION_SECONDS)
        var decodedText: String? = null
        var bitmap: NativeSubtitleBitmap? = null
        try {
            if (times != 0 && module._movi_get_subtitle_times(context, times, times + Double.SIZE_BYTES) == 0) {
                val view = dataView(module, times, 2 * Double.SIZE_BYTES)
                start = view.getFloat64(0, true)
                end = view.getFloat64(Double.SIZE_BYTES, true)
            }
            if (text != 0) {
                clearNativeMemory(module, text, text + MAX_SUBTITLE_TEXT_BYTES)
                if (module._movi_get_subtitle_text(context, text, MAX_SUBTITLE_TEXT_BYTES) > 0) {
                    decodedText = module.UTF8ToString(text).ifBlank { null }
                }
            }
            if (imageInfo != 0 && module._movi_get_subtitle_image_info(
                    context,
                    imageInfo,
                    imageInfo + Int.SIZE_BYTES,
                    imageInfo + 2 * Int.SIZE_BYTES,
                    imageInfo + 3 * Int.SIZE_BYTES,
                ) == 0
            ) {
                val view = dataView(module, imageInfo, 4 * Int.SIZE_BYTES)
                val width = view.getInt32(0, true)
                val height = view.getInt32(Int.SIZE_BYTES, true)
                val x = view.getInt32(2 * Int.SIZE_BYTES, true)
                val y = view.getInt32(3 * Int.SIZE_BYTES, true)
                val imageBytes = width.toLong() * height * RGBA_BYTES_PER_PIXEL
                if (width > 0 && height > 0 && imageBytes in 1..MAX_SUBTITLE_BITMAP_BYTES.toLong()) {
                    val image = module._malloc(imageBytes.toInt())
                    if (image != 0) {
                        try {
                            val copied = module._movi_get_subtitle_image_data(context, image, imageBytes.toInt())
                            if (copied > 0) {
                                bitmap =
                                    NativeSubtitleBitmap(
                                        width = width,
                                        height = height,
                                        x = x,
                                        y = y,
                                        rgba = heapSlice(module, image, image + copied).toByteArrayCopy(),
                                    )
                            }
                        } finally {
                            module._free(image)
                        }
                    }
                }
            }
        } finally {
            if (times != 0) module._free(times)
            if (imageInfo != 0) module._free(imageInfo)
            if (text != 0) module._free(text)
        }
        return NativeSubtitleFrame(
            startSeconds = start,
            endSeconds = end.coerceAtLeast(start),
            text = decodedText,
            bitmap = bitmap,
        )
    }
}

internal class NativeTimeStretcher(
    private val module: NativeModule,
    private val handle: Int,
    private val channels: Int,
) {
    private var closed: Boolean = false

    val inputLatencyFrames: Int
        get() = if (closed) 0 else module._movi_stretch_input_latency(handle)

    val outputLatencyFrames: Int
        get() = if (closed) 0 else module._movi_stretch_output_latency(handle)

    fun process(
        interleavedPcm: ByteArray,
        inputFrames: Int,
        outputFrames: Int,
    ): ByteArray {
        check(!closed) { "The time stretcher is closed." }
        require(inputFrames >= 0 && outputFrames >= 0)
        val inputBytes = inputFrames.toLong() * channels * Float.SIZE_BYTES
        val outputBytes = outputFrames.toLong() * channels * Float.SIZE_BYTES
        require(inputBytes <= interleavedPcm.size && outputBytes <= Int.MAX_VALUE)
        val input = module._malloc(inputBytes.toInt().coerceAtLeast(1))
        val output = module._malloc(outputBytes.toInt().coerceAtLeast(1))
        if (input == 0 || output == 0) {
            if (input != 0) module._free(input)
            if (output != 0) module._free(output)
            throw nativeFailure("Signalsmith Stretch buffers could not be allocated.")
        }
        return try {
            copyToNativeMemory(module, interleavedPcm.toInt8Array(), input)
            module._movi_stretch_process(handle, input, inputFrames, output, outputFrames)
            heapSlice(module, output, output + outputBytes.toInt()).toByteArrayCopy()
        } finally {
            module._free(input)
            module._free(output)
        }
    }

    fun processPlanar(
        frame: NativePcmFrame,
        playbackRate: Float,
    ): NativePcmFrame {
        require(frame.numberOfChannels == channels) { "PCM channel count changed while stretching." }
        require(playbackRate.isFinite() && playbackRate > 0f)
        if (playbackRate == 1f || frame.numberOfFrames == 0) return frame
        val inputFrames = frame.numberOfFrames
        val outputFrames = (inputFrames / playbackRate).toInt().coerceAtLeast(1)
        val input = ByteArray(inputFrames * channels * Float.SIZE_BYTES)
        repeat(inputFrames) { sample ->
            repeat(channels) { channel ->
                val source = frame.planes[channel]
                val sourceOffset = sample * Float.SIZE_BYTES
                val targetOffset = (sample * channels + channel) * Float.SIZE_BYTES
                repeat(Float.SIZE_BYTES) { byte ->
                    input[targetOffset + byte] = source[sourceOffset + byte]
                }
            }
        }
        val stretched = process(input, inputFrames, outputFrames)
        val planes =
            List(channels) { channel ->
                ByteArray(outputFrames * Float.SIZE_BYTES).also { plane ->
                    repeat(outputFrames) { sample ->
                        val sourceOffset = (sample * channels + channel) * Float.SIZE_BYTES
                        val targetOffset = sample * Float.SIZE_BYTES
                        repeat(Float.SIZE_BYTES) { byte ->
                            plane[targetOffset + byte] = stretched[sourceOffset + byte]
                        }
                    }
                }
            }
        return NativePcmFrame(
            planes = planes,
            numberOfFrames = outputFrames,
            numberOfChannels = channels,
            sampleRate = frame.sampleRate,
            ptsSeconds = frame.ptsSeconds,
        )
    }

    fun reset() {
        if (!closed) module._movi_stretch_reset(handle)
    }

    fun close() {
        if (closed) return
        closed = true
        module._movi_stretch_delete(handle)
    }
}

private fun DataView.readSignedLong(offset: Int): Long {
    val low = getInt32(offset, true).toLong() and 0xffffffffL
    val high = getInt32(offset + 4, true).toLong()
    return (high shl 32) or low
}

private fun org.khronos.webgl.Uint8Array.toByteArrayCopy(): ByteArray {
    return asInt8Array(this).toByteArray()
}

private fun nativeFailure(message: String): WasmMediaError =
    WasmMediaError(
        WasmMediaErrorCategory.INTERNAL,
        WasmMediaErrorCode.NATIVE_RUNTIME_FAILED,
        message,
    )

private const val AV_LOG_QUIET: Int = -8
private const val DEFAULT_PACKET_BUFFER_SIZE: Int = 10 * 1024 * 1024
private const val DEFAULT_MAX_ATTACHMENTS_TOTAL: Int = 32 * 1024 * 1024
private const val DEFAULT_MAX_ATTACHMENTS: Int = 64
private const val DEFAULT_MAX_ATTACHMENT_SIZE: Int = 16 * 1024 * 1024
private const val RGBA_BYTES_PER_PIXEL: Int = 4
private const val MAX_AUDIO_CHANNELS: Int = 32
private const val MAX_SUBTITLE_TEXT_BYTES: Int = 64 * 1024
private const val MAX_SUBTITLE_BITMAP_BYTES: Int = 64 * 1024 * 1024
private const val MAX_PREFETCHED_CUES: Int = 100_000
private const val DEFAULT_SUBTITLE_DURATION_SECONDS: Double = 2.0

private const val STREAM_INFO_SIZE: Int = 344
private const val STREAM_INDEX: Int = 0
private const val STREAM_TYPE: Int = 4
private const val STREAM_CODEC_ID: Int = 8
private const val STREAM_CODEC_NAME: Int = 12
private const val STREAM_WIDTH: Int = 44
private const val STREAM_HEIGHT: Int = 48
private const val STREAM_FRAME_RATE: Int = 56
private const val STREAM_CHANNELS: Int = 64
private const val STREAM_SAMPLE_RATE: Int = 68
private const val STREAM_DURATION: Int = 72
private const val STREAM_BIT_RATE: Int = 80
private const val STREAM_EXTRADATA_SIZE: Int = 88
private const val STREAM_PROFILE: Int = 92
private const val STREAM_LEVEL: Int = 96
private const val STREAM_LANGUAGE: Int = 100
private const val STREAM_LABEL: Int = 108
private const val STREAM_ROTATION: Int = 172
private const val STREAM_COLOR_PRIMARIES: Int = 176
private const val STREAM_COLOR_TRANSFER: Int = 208
private const val STREAM_COLOR_MATRIX: Int = 240
private const val STREAM_PIXEL_FORMAT: Int = 272
private const val STREAM_COLOR_RANGE: Int = 304
private const val STREAM_PROJECTION: Int = 336
private const val STREAM_ATTACHED_PICTURE: Int = 340

private const val PACKET_INFO_SIZE: Int = 48
private const val PACKET_STREAM_INDEX: Int = 0
private const val PACKET_KEYFRAME: Int = 4
private const val PACKET_PTS: Int = 8
private const val PACKET_DTS: Int = 16
private const val PACKET_DURATION: Int = 24
private const val PACKET_SIZE: Int = 32
private const val PACKET_IDR: Int = 36
private const val PACKET_RASL: Int = 40
private const val PACKET_DISPOSABLE: Int = 44
