package io.github.shusek.kmedia.engine.wasm

import org.w3c.dom.HTMLCanvasElement
import org.w3c.dom.HTMLVideoElement
import kotlin.time.Duration

public enum class TrackKind {
    VIDEO,
    AUDIO,
    SUBTITLE,
}

public sealed interface MediaTrack {
    public val id: Int
    public val kind: TrackKind
    public val codec: String
    public val language: String?
    public val label: String?
    public val isDefault: Boolean
}

public data class VideoTrack(
    override val id: Int,
    override val codec: String,
    public val codecString: String? = null,
    public val width: Int,
    public val height: Int,
    public val frameRate: Double,
    public val bitRate: Long? = null,
    public val profile: Int? = null,
    public val level: Int? = null,
    public val pixelFormat: String? = null,
    public val colorPrimaries: String? = null,
    public val colorTransfer: String? = null,
    public val colorMatrix: String? = null,
    public val colorRange: String? = null,
    public val rotationDegrees: Int = 0,
    public val projection: Int? = null,
    public val isHdr: Boolean = false,
    public val isAttachedPicture: Boolean = false,
    override val language: String? = null,
    override val label: String? = null,
    override val isDefault: Boolean = false,
) : MediaTrack {
    override val kind: TrackKind = TrackKind.VIDEO
}

public data class AudioTrack(
    override val id: Int,
    override val codec: String,
    public val channels: Int,
    public val sampleRate: Int,
    public val bitRate: Long? = null,
    override val language: String? = null,
    override val label: String? = null,
    override val isDefault: Boolean = false,
) : MediaTrack {
    override val kind: TrackKind = TrackKind.AUDIO
}

public enum class SubtitleType {
    TEXT,
    IMAGE,
}

public data class SubtitleTrack(
    override val id: Int,
    override val codec: String,
    public val subtitleType: SubtitleType,
    public val isForced: Boolean = false,
    override val language: String? = null,
    override val label: String? = null,
    override val isDefault: Boolean = false,
) : MediaTrack {
    override val kind: TrackKind = TrackKind.SUBTITLE
}

public data class Chapter(
    public val id: String?,
    public val start: Duration,
    public val end: Duration,
    public val title: String?,
    public val language: String? = null,
    public val isHidden: Boolean = false,
)

public data class MediaInfo(
    public val formatName: String?,
    public val duration: Duration,
    public val startTime: Duration,
    public val bitRate: Long?,
    public val tracks: List<MediaTrack>,
    public val chapters: List<Chapter> = emptyList(),
    public val metadata: Map<String, String> = emptyMap(),
) {
    public val videoTracks: List<VideoTrack>
        get() = tracks.filterIsInstance<VideoTrack>()

    public val audioTracks: List<AudioTrack>
        get() = tracks.filterIsInstance<AudioTrack>()

    public val subtitleTracks: List<SubtitleTrack>
        get() = tracks.filterIsInstance<SubtitleTrack>()
}

public data class BufferedRange(
    public val start: Duration,
    public val end: Duration,
)

public enum class RenderingBackend {
    WEBCODECS,
    SOFTWARE_WASM,
    NATIVE_VIDEO,
    HLS_JS,
    DASH_JS,
    SHAKA,
    UNKNOWN,
}

public data class RenderingDiagnostics(
    public val backend: RenderingBackend = RenderingBackend.UNKNOWN,
    public val videoDecoderBackend: DecoderBackend = DecoderBackend.UNKNOWN,
    public val audioDecoderBackend: DecoderBackend = DecoderBackend.UNKNOWN,
    public val sourceMode: SourceMode = SourceMode.UNKNOWN,
    public val decoder: String? = null,
    public val renderer: String? = null,
    public val container: String? = null,
    public val droppedFrames: Long = 0,
    public val presentedFrames: Long = 0,
    public val decodeQueueSize: Int = 0,
    public val demuxedPackets: Long = 0,
    public val demuxSeekCount: Long = 0,
    public val submittedVideoPackets: Long = 0,
    public val decodedVideoFrames: Long = 0,
    public val endOfInput: Boolean = false,
    public val lastPacketTimestamp: Duration? = null,
    public val lastPacketStreamIndex: Int? = null,
    public val lastPacketBytes: Int = 0,
    public val audioBufferAhead: Duration = Duration.ZERO,
    public val audioUnderruns: Long = 0,
    public val maximumAvDrift: Duration = Duration.ZERO,
    public val audioTimestampCorrections: Long = 0,
    public val colorPipeline: ColorPipelineDiagnostics = ColorPipelineDiagnostics(),
    public val cache: CacheStats = CacheStats(),
    public val network: NetworkStats = NetworkStats(),
    public val liveWindow: LivePlaybackWindow? = null,
)

public sealed interface PlayerSurface {
    public data class Canvas(
        public val element: HTMLCanvasElement,
        /** Engine-owned timing/source element used by controlled adaptive rendering, when present. */
        public val mediaElement: HTMLVideoElement? = null,
    ) : PlayerSurface

    public data class NativeVideo(public val element: HTMLVideoElement) : PlayerSurface
}

public enum class WasmMediaPlayerState {
    IDLE,
    LOADING,
    READY,
    PLAYING,
    PAUSED,
    SEEKING,
    BUFFERING,
    ENDED,
    ERROR,
    CLOSED,
}

public sealed interface TrackSelectionRequest {
    public val kind: TrackKind

    public data class Video(public val trackId: Int?) : TrackSelectionRequest {
        override val kind: TrackKind = TrackKind.VIDEO
    }

    public data class Audio(public val trackId: Int?) : TrackSelectionRequest {
        override val kind: TrackKind = TrackKind.AUDIO
    }

    public data class Subtitle(public val trackId: Int?) : TrackSelectionRequest {
        override val kind: TrackKind = TrackKind.SUBTITLE
    }
}

public enum class TrackSelectionStatus {
    SELECTED,
    UNCHANGED,
    AUTO,
    DISABLED,
    NOT_FOUND,
    NOT_SUPPORTED,
    FAILED,
    SUPERSEDED,
}

public data class TrackSelectionOutcome(
    public val kind: TrackKind,
    public val status: TrackSelectionStatus,
    public val requestedTrackId: Int?,
    public val activeTrack: MediaTrack?,
    public val error: WasmMediaError? = null,
)
