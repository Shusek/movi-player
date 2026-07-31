package io.github.shusek.kmedia.engine.wasm

import io.github.shusek.kmedia.engine.wasm.internal.NativeAttachment
import io.github.shusek.kmedia.engine.wasm.internal.NativeAudioPacket
import io.github.shusek.kmedia.engine.wasm.internal.NativeBindings
import io.github.shusek.kmedia.engine.wasm.internal.NativePacket
import io.github.shusek.kmedia.engine.wasm.internal.NativePcmFrame
import io.github.shusek.kmedia.engine.wasm.internal.NativeStreamInfo
import io.github.shusek.kmedia.engine.wasm.internal.NativeSubtitleFrame
import io.github.shusek.kmedia.engine.wasm.internal.NativeTimeStretcher
import io.github.shusek.kmedia.engine.wasm.internal.NativeVideoFrame
import io.github.shusek.kmedia.engine.wasm.internal.NativeYuvFrame
import io.github.shusek.kmedia.engine.wasm.internal.sharedNativeRuntimeLoader
import kotlin.time.Duration
import kotlin.time.Duration.Companion.seconds

public data class Packet(
    public val streamIndex: Int,
    public val data: ByteArray,
    public val presentationTime: Duration,
    public val decodeTime: Duration,
    public val duration: Duration,
    public val keyframe: Boolean,
    public val isIdr: Boolean,
    public val isRasl: Boolean,
    public val disposable: Boolean,
)

public data class DemuxerAttachment(
    public val streamIndex: Int,
    public val name: String,
    public val mimeType: String,
    public val data: ByteArray,
)

public class Demuxer(
    private val source: SourceAdapter,
    private val runtime: WasmRuntimeConfig = WasmRuntimeConfig(),
) {
    private var bindings: NativeBindings? = null
    private var closingBindings: NativeBindings? = null
    private var mediaInfo: MediaInfo? = null
    private var closed: Boolean = false
    private val extradataCache: MutableMap<Int, ByteArray?> = mutableMapOf()

    public suspend fun open(): MediaInfo {
        check(!closed) { "The demuxer is closed." }
        mediaInfo?.let { return it }

        val module =
            try {
                sharedNativeRuntimeLoader.load(runtime)
            } catch (error: Throwable) {
                if (error is WasmMediaError) throw error
                throw WasmMediaError(
                    WasmMediaErrorCategory.INTERNAL,
                    WasmMediaErrorCode.NATIVE_RUNTIME_FAILED,
                    error.message ?: "The native runtime could not be loaded.",
                    error,
                )
            }
        val nativeBindings = NativeBindings(module)
        bindings = nativeBindings
        nativeBindings.open(source)

        val nativeStreams =
            buildList {
                repeat(nativeBindings.streamCount()) { index ->
                    nativeBindings.streamInfo(index)?.let(::add)
                }
            }
        val tracks = nativeStreams.mapIndexedNotNull { index, stream -> stream.toTrack(index, nativeStreams) }
        val title = nativeBindings.metadataTitle()
        val sourceFilename = source.contentDispositionFilename
        val metadata =
            buildMap {
                if (title.isNotBlank()) put("title", title)
                if (!sourceFilename.isNullOrBlank()) {
                    put("contentDispositionFilename", sourceFilename)
                    if ("title" !in this) {
                        put("title", sourceFilename.substringBeforeLast('.').ifBlank { sourceFilename })
                    }
                }
            }
        val info =
            MediaInfo(
                formatName = nativeBindings.formatName().ifBlank { null },
                duration = nativeBindings.durationSeconds().safeSeconds(),
                startTime = nativeBindings.startTimeSeconds().safeSeconds(),
                bitRate = tracks.mapNotNull(::trackBitRate).sum().takeIf { it > 0 },
                tracks = tracks,
                chapters =
                    nativeBindings.chapters().map { chapter ->
                        Chapter(
                            id = chapter.id,
                            start = chapter.startSeconds.safeSeconds(),
                            end = chapter.endSeconds.safeSeconds(),
                            title = chapter.title,
                            language = chapter.language,
                            isHidden = chapter.hidden,
                        )
                    },
                metadata = metadata,
            )
        mediaInfo = info
        return info
    }

    public fun getMediaInfo(): MediaInfo? = mediaInfo

    public fun getTracks(): List<MediaTrack> = mediaInfo?.tracks.orEmpty()

    public fun getVideoTracks(): List<VideoTrack> = mediaInfo?.videoTracks.orEmpty()

    public fun getAudioTracks(): List<AudioTrack> = mediaInfo?.audioTracks.orEmpty()

    public fun getSubtitleTracks(): List<SubtitleTrack> = mediaInfo?.subtitleTracks.orEmpty()

    public fun getExtradata(trackId: Int): ByteArray? {
        if (trackId in extradataCache) return extradataCache[trackId]?.copyOf()
        val value = bindings?.extradata(trackId)
        extradataCache[trackId] = value
        return value?.copyOf()
    }

    public fun getAttachments(
        maxTotalBytes: Int = 32 * 1024 * 1024,
        maxCount: Int = 64,
        maxAttachmentBytes: Int = 16 * 1024 * 1024,
    ): List<DemuxerAttachment> =
        bindings
            ?.attachments(
                maxTotalBytes = maxTotalBytes,
                maxCount = maxCount,
                maxAttachmentBytes = maxAttachmentBytes,
            )?.map(NativeAttachment::toPublic)
            .orEmpty()

    public suspend fun readPacket(): Packet? = bindings?.readPacket()?.toPublic()

    public suspend fun seek(
        position: Duration,
        streamIndex: Int = -1,
        flags: Int = 1,
    ) {
        if (!source.supportsRandomAccess) {
            throw WasmMediaError(
                WasmMediaErrorCategory.SOURCE,
                WasmMediaErrorCode.RANGE_UNSUPPORTED,
                "Seeking is unavailable because this source is being read as a bounded linear stream.",
            )
        }
        bindings?.seek(position.inWholeMilliseconds / 1_000.0, streamIndex, flags)
            ?: throw WasmMediaError(
                WasmMediaErrorCategory.STATE,
                WasmMediaErrorCode.INVALID_STATE,
                "The demuxer is not open.",
            )
    }

    public fun setStreamDiscard(
        streamIndex: Int,
        discard: Boolean,
    ) {
        bindings?.setStreamDiscard(streamIndex, discard)
    }

    internal fun enableDecoder(
        streamIndex: Int,
        extradata: ByteArray? = getExtradata(streamIndex),
    ): Int = bindings?.enableDecoder(streamIndex, extradata) ?: -1

    internal fun sendPacket(
        streamIndex: Int,
        data: ByteArray,
        ptsSeconds: Double,
        dtsSeconds: Double,
        keyframe: Boolean,
    ): Int = bindings?.sendPacket(streamIndex, data, ptsSeconds, dtsSeconds, keyframe) ?: -1

    internal fun receiveFrame(streamIndex: Int): Int = bindings?.receiveFrame(streamIndex) ?: -1

    internal fun decodedVideoFrame(
        streamIndex: Int,
        maximumWidth: Int,
    ): NativeVideoFrame? = bindings?.decodedVideoFrame(streamIndex, maximumWidth)

    internal fun decodedYuvVideoFrame(
        streamIndex: Int,
        maximumWidth: Int,
        pixelFormat: String?,
    ): NativeYuvFrame? = bindings?.decodedYuvVideoFrame(streamIndex, maximumWidth, pixelFormat)

    internal fun decodedAudioFrame(
        streamIndex: Int,
        fallbackPtsSeconds: Double,
    ): NativePcmFrame? = bindings?.decodedAudioFrame(streamIndex, fallbackPtsSeconds)

    internal fun decodeAudioBatch(
        streamIndex: Int,
        packets: List<NativeAudioPacket>,
    ): Pair<Int, NativePcmFrame?> = bindings?.decodeAudioBatch(streamIndex, packets) ?: (-1 to null)

    internal fun decodeSubtitle(
        streamIndex: Int,
        data: ByteArray,
        ptsSeconds: Double,
        durationSeconds: Double,
    ): NativeSubtitleFrame? = bindings?.decodeSubtitle(streamIndex, data, ptsSeconds, durationSeconds)

    internal suspend fun prefetchSubtitleCues(streamIndex: Int): List<NativeSubtitleFrame> =
        bindings?.prefetchSubtitleCues(streamIndex).orEmpty()

    internal fun flushDecoder(streamIndex: Int) {
        bindings?.flushDecoder(streamIndex)
    }

    internal fun setSkipFrame(
        streamIndex: Int,
        discardNonReference: Boolean,
    ) {
        bindings?.setSkipFrame(streamIndex, discardNonReference)
    }

    internal fun enableAudioDownmix(enabled: Boolean) {
        bindings?.enableAudioDownmix(enabled)
    }

    internal fun createTimeStretcher(
        channels: Int,
        sampleRate: Int,
    ): NativeTimeStretcher? = bindings?.createTimeStretcher(channels, sampleRate)

    internal val sourceMode: SourceMode
        get() = source.sourceMode

    internal val supportsRandomAccess: Boolean
        get() = source.supportsRandomAccess

    internal val cacheStats: CacheStats
        get() = source.cacheStats

    internal val networkStats: NetworkStats
        get() = source.networkStats

    public fun close() {
        detachBindingsForClose()?.close()
    }

    internal suspend fun closeAndAwait() {
        val nativeBindings = detachBindingsForClose() ?: closingBindings ?: return
        nativeBindings.closeAndAwait()
        if (closingBindings === nativeBindings) closingBindings = null
    }

    private fun detachBindingsForClose(): NativeBindings? {
        if (closed) return null
        closed = true
        return bindings.also { nativeBindings ->
            closingBindings = nativeBindings
            bindings = null
            mediaInfo = null
            extradataCache.clear()
        }
    }
}

private fun NativeStreamInfo.toTrack(
    index: Int,
    allStreams: List<NativeStreamInfo>,
): MediaTrack? {
    val firstOfType = allStreams.indexOfFirst { it.type == type } == index
    return when (type) {
        0 ->
            VideoTrack(
                id = this.index,
                codec = codecName,
                width = width,
                height = height,
                frameRate = frameRate.takeIf(Double::isFinite)?.coerceAtLeast(0.0) ?: 0.0,
                bitRate = bitRate.takeIf { it > 0 },
                profile = profile.takeIf { it >= 0 },
                level = level.takeIf { it >= 0 },
                pixelFormat = pixelFormat.ifUseful(),
                colorPrimaries = colorPrimaries.ifUseful(),
                colorTransfer = colorTransfer.ifUseful(),
                colorMatrix = colorMatrix.ifUseful(),
                colorRange = colorRange.ifUseful(),
                rotationDegrees = rotation,
                projection = projection.takeIf { it != 0 },
                isHdr = isHdr(colorPrimaries, colorTransfer),
                isAttachedPicture = isAttachedPicture,
                language = language.ifBlank { null },
                label = label.ifBlank { null },
                isDefault = firstOfType,
            )

        1 ->
            AudioTrack(
                id = this.index,
                codec = codecName,
                channels = channels,
                sampleRate = sampleRate,
                bitRate = bitRate.takeIf { it > 0 },
                language = language.ifBlank { null },
                label = label.ifBlank { null },
                isDefault = firstOfType,
            )

        2 ->
            SubtitleTrack(
                id = this.index,
                codec = codecName,
                subtitleType = if (codecName.lowercase() in IMAGE_SUBTITLE_CODECS) SubtitleType.IMAGE else SubtitleType.TEXT,
                language = language.ifBlank { null },
                label = label.ifBlank { null },
                isDefault = firstOfType,
            )

        else -> null
    }
}

private fun NativePacket.toPublic(): Packet =
    Packet(
        streamIndex = streamIndex,
        data = data,
        presentationTime = ptsSeconds.safeSeconds(),
        decodeTime = dtsSeconds.safeSeconds(),
        duration = durationSeconds.safeSeconds(),
        keyframe = keyframe,
        isIdr = isIdr,
        isRasl = isRasl,
        disposable = disposable,
    )

private fun NativeAttachment.toPublic(): DemuxerAttachment =
    DemuxerAttachment(
        streamIndex = streamIndex,
        name = name,
        mimeType = mimeType,
        data = data,
    )

private fun Double.safeSeconds(): Duration =
    if (isFinite() && this >= 0.0) seconds else Duration.ZERO

private fun String.ifUseful(): String? =
    takeUnless {
        isBlank() ||
            equals("unknown", ignoreCase = true) ||
            equals("reserved", ignoreCase = true) ||
            equals("unspecified", ignoreCase = true)
    }

private fun isHdr(
    primaries: String,
    transfer: String,
): Boolean {
    val normalizedPrimaries = primaries.lowercase()
    val normalizedTransfer = transfer.lowercase()
    return "bt2020" in normalizedPrimaries ||
        "smpte2084" in normalizedTransfer ||
        "pq" in normalizedTransfer ||
        "arib-std-b67" in normalizedTransfer ||
        "hlg" in normalizedTransfer
}

private fun trackBitRate(track: MediaTrack): Long? =
    when (track) {
        is VideoTrack -> track.bitRate
        is AudioTrack -> track.bitRate
        is SubtitleTrack -> null
    }

private val IMAGE_SUBTITLE_CODECS: Set<String> =
    setOf(
        "hdmv_pgs_subtitle",
        "pgssub",
        "dvb_subtitle",
        "dvbsub",
        "dvd_subtitle",
        "dvdsub",
    )
