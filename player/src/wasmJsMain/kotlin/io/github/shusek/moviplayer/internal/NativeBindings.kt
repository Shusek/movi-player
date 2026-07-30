package io.github.shusek.moviplayer.internal

import io.github.shusek.moviplayer.MoviError
import io.github.shusek.moviplayer.MoviErrorCategory
import io.github.shusek.moviplayer.MoviErrorCode
import io.github.shusek.moviplayer.SourceAdapter
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
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

internal class NativeBindings(
    private val module: NativeModule,
) {
    private val ioScope: CoroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private var source: SourceAdapter? = null
    private var context: Int = 0
    private var packetBuffer: Int = 0
    private var packetBufferSize: Int = DEFAULT_PACKET_BUFFER_SIZE
    private var closed: Boolean = false

    init {
        module._movi_set_log_level(AV_LOG_QUIET)
        installNativeIoCallbacks(
            module = module,
            onRead = ::handleRead,
            onSeek = ::handleSeek,
        )
    }

    suspend fun open(source: SourceAdapter): Int {
        check(!closed) { "Native bindings are closed." }
        this.source = source
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

        val size = source.getSize()
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
        return streamCount
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

    suspend fun readPacket(): NativePacket? {
        if (context == 0) return null
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
            if (result == 0) return null
            if (result < 0) throw nativeFailure("Native packet read failed (code $result).")

            val view = dataView(module, infoPointer, PACKET_INFO_SIZE)
            val size = view.getInt32(PACKET_SIZE, true)
            if (size !in 0..packetBufferSize) {
                throw nativeFailure("Native packet metadata reported an invalid packet size.")
            }
            return NativePacket(
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
    ) {
        if (context == 0) throw nativeFailure("The demuxer is not open.")
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

    fun close() {
        if (closed) return
        closed = true
        closeContext()
        source?.close()
        source = null
        ioScope.cancel()
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
}

private fun DataView.readSignedLong(offset: Int): Long {
    val low = getInt32(offset, true).toLong() and 0xffffffffL
    val high = getInt32(offset + 4, true).toLong()
    return (high shl 32) or low
}

private fun org.khronos.webgl.Uint8Array.toByteArrayCopy(): ByteArray {
    return asInt8Array(this).toByteArray()
}

private fun nativeFailure(message: String): MoviError =
    MoviError(
        MoviErrorCategory.INTERNAL,
        MoviErrorCode.NATIVE_RUNTIME_FAILED,
        message,
    )

private const val AV_LOG_QUIET: Int = -8
private const val DEFAULT_PACKET_BUFFER_SIZE: Int = 10 * 1024 * 1024
private const val DEFAULT_MAX_ATTACHMENTS_TOTAL: Int = 32 * 1024 * 1024
private const val DEFAULT_MAX_ATTACHMENTS: Int = 64
private const val DEFAULT_MAX_ATTACHMENT_SIZE: Int = 16 * 1024 * 1024

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
