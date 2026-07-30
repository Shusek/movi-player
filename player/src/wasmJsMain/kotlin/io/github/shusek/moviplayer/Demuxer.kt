package io.github.shusek.moviplayer

import io.github.shusek.moviplayer.internal.NativeAttachment
import io.github.shusek.moviplayer.internal.NativeBindings
import io.github.shusek.moviplayer.internal.NativePacket
import io.github.shusek.moviplayer.internal.NativeStreamInfo
import io.github.shusek.moviplayer.internal.sharedNativeRuntimeLoader
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
    private val runtime: MoviRuntimeConfig = MoviRuntimeConfig(),
) {
    private var bindings: NativeBindings? = null
    private var mediaInfo: MediaInfo? = null
    private var closed: Boolean = false
    private val extradataCache: MutableMap<Int, ByteArray?> = mutableMapOf()

    public suspend fun open(): MediaInfo {
        check(!closed) { "The demuxer is closed." }
        mediaInfo?.let { return it }

        val module =
            try {
                sharedNativeRuntimeLoader.load(runtime.assetBaseUrl)
            } catch (error: Throwable) {
                throw MoviError(
                    MoviErrorCategory.INTERNAL,
                    MoviErrorCode.NATIVE_RUNTIME_FAILED,
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
                metadata = if (title.isBlank()) emptyMap() else mapOf("title" to title),
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
        bindings?.seek(position.inWholeMilliseconds / 1_000.0, streamIndex, flags)
            ?: throw MoviError(
                MoviErrorCategory.STATE,
                MoviErrorCode.INVALID_STATE,
                "The demuxer is not open.",
            )
    }

    public fun setStreamDiscard(
        streamIndex: Int,
        discard: Boolean,
    ) {
        bindings?.setStreamDiscard(streamIndex, discard)
    }

    public fun close() {
        if (closed) return
        closed = true
        bindings?.close()
        bindings = null
        mediaInfo = null
        extradataCache.clear()
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
