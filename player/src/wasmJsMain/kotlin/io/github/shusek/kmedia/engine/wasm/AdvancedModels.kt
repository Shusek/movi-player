package io.github.shusek.kmedia.engine.wasm

import org.w3c.dom.ImageBitmap
import kotlinx.coroutines.flow.StateFlow
import kotlin.time.Duration

public enum class DecoderBackend {
    WEB_CODECS,
    SOFTWARE_WASM,
    BROWSER_NATIVE,
    NONE,
    UNKNOWN,
}

public enum class SourceMode {
    RANGE,
    LINEAR,
    ADAPTIVE,
    LOCAL,
    UNKNOWN,
}

public enum class DynamicRange {
    SDR,
    HDR10,
    HLG,
    DOLBY_VISION,
    UNKNOWN,
}

/** Controls the required output dynamic range and its failure semantics. */
public enum class OutputDynamicRangePolicy {
    AUTO,
    PREFER_HDR,
    REQUIRE_HDR,
    FORCE_SDR,
}

public enum class ToneMappingMode {
    AUTO,
    NATIVE,
    SHADER,
    DISABLED,
}

public enum class OutputVerification {
    CONFIRMED,
    INFERRED,
    UNKNOWN,
}

public data class ColorPipelineDiagnostics(
    public val sourceDynamicRange: DynamicRange = DynamicRange.UNKNOWN,
    public val outputDynamicRange: DynamicRange = DynamicRange.UNKNOWN,
    public val outputVerification: OutputVerification = OutputVerification.UNKNOWN,
    public val requestedColorSpace: String? = null,
    public val appliedColorSpace: String? = null,
    public val toneMapping: ToneMappingMode = ToneMappingMode.AUTO,
)

public data class CacheStats(
    public val bytesStored: Long = 0,
    public val maximumBytes: Long = 0,
    public val hits: Long = 0,
    public val misses: Long = 0,
) {
    public val hitRate: Double
        get() {
            val requests = hits + misses
            return if (requests == 0L) 0.0 else hits.toDouble() / requests.toDouble()
        }
}

public data class NetworkStats(
    public val bytesDownloaded: Long = 0,
    public val requestCount: Long = 0,
    public val retryCount: Long = 0,
    public val throughputBitsPerSecond: Long? = null,
)

public data class LivePlaybackWindow(
    public val start: Duration,
    public val end: Duration,
    public val liveEdge: Duration,
) {
    init {
        require(start >= Duration.ZERO) { "Live-window start must not be negative." }
        require(end >= start) { "Live-window end must not precede its start." }
        require(liveEdge in start..end) { "Live edge must be inside the live window." }
    }
}

public data class SubtitleCue(
    public val start: Duration,
    public val end: Duration,
    public val text: String? = null,
    public val image: ImageBitmap? = null,
    public val x: Int? = null,
    public val y: Int? = null,
) {
    init {
        require(start >= Duration.ZERO) { "Subtitle cue start must not be negative." }
        require(end >= start) { "Subtitle cue end must not precede its start." }
        require(text != null || image != null) { "A subtitle cue must contain text or an image." }
    }
}

public data class AudioOutputDevice(
    public val id: String,
    public val label: String,
    public val isDefault: Boolean = false,
)

public data class SoftwareDecodeConfig(
    public val maximumVideoWidth: Int = 1_920,
    public val downmixToStereo: Boolean = true,
    public val workSliceMilliseconds: Int = 8,
) {
    init {
        require(maximumVideoWidth > 0) { "maximumVideoWidth must be positive." }
        require(workSliceMilliseconds in 1..32) { "workSliceMilliseconds must be between 1 and 32." }
    }
}

public data class CacheConfig(
    public val maximumBytes: Long = 200L * 1024L * 1024L,
) {
    init {
        require(maximumBytes >= 1024L * 1024L) { "maximumBytes must be at least 1 MiB." }
    }
}

public enum class ProjectionMode {
    AUTO,
    FLAT,
    EQUIRECTANGULAR,
    HALF_EQUIRECTANGULAR,
    VR180,
    FISHEYE,
    SIDE_BY_SIDE,
    LITTLE_PLANET,
}

public enum class ProjectionStereoLayout {
    MONO,
    SIDE_BY_SIDE,
    OVER_UNDER,
}

public enum class ProjectionEyeOrder {
    LEFT_FIRST,
    RIGHT_FIRST,
}

public data class ProjectionConfiguration(
    public val mode: ProjectionMode = ProjectionMode.AUTO,
    public val stereoLayout: ProjectionStereoLayout = ProjectionStereoLayout.MONO,
    public val eyeOrder: ProjectionEyeOrder = ProjectionEyeOrder.LEFT_FIRST,
    public val yawDegrees: Float = 0f,
    public val pitchDegrees: Float = 0f,
    public val fieldOfViewDegrees: Float = 90f,
    public val cropLeft: Float = 0f,
    public val cropTop: Float = 0f,
    public val cropRight: Float = 0f,
    public val cropBottom: Float = 0f,
) {
    init {
        require(yawDegrees.isFinite()) { "yawDegrees must be finite." }
        require(pitchDegrees.isFinite()) { "pitchDegrees must be finite." }
        require(fieldOfViewDegrees.isFinite() && fieldOfViewDegrees in 20f..150f) {
            "fieldOfViewDegrees must be between 20 and 150."
        }
        listOf(cropLeft, cropTop, cropRight, cropBottom).forEach { edge ->
            require(edge.isFinite() && edge in 0f..0.49f) {
                "Projection crop edges must be between 0 and 0.49."
            }
        }
        require(cropLeft + cropRight < 1f && cropTop + cropBottom < 1f) {
            "Projection crop edges must leave a non-empty image."
        }
    }
}

public fun interface LcevcAdapter {
    public fun attach(surface: PlayerSurface): LcevcSession
}

public interface LcevcSession {
    public fun setEnabled(enabled: Boolean)

    public fun close()
}

public data class VideoSnapshot(
    public val image: ImageBitmap,
    public val timestamp: Duration,
    public val width: Int,
    public val height: Int,
)

public data class ExternalAudioSource(
    public val id: String,
    public val source: MediaSource,
    public val language: String? = null,
    public val label: String? = null,
    public val isDefault: Boolean = false,
)

public data class ExternalSubtitleSource(
    public val id: String,
    public val source: MediaSource,
    public val format: String? = null,
    public val language: String? = null,
    public val label: String? = null,
    public val isDefault: Boolean = false,
)

public data class QualityVariantSource(
    public val id: String,
    public val source: MediaSource,
    public val width: Int? = null,
    public val height: Int? = null,
    public val bitRate: Long? = null,
    public val codecs: String? = null,
    public val label: String? = null,
)

/**
 * Wasm-specific controls kept outside cross-platform media-player contracts.
 */
public interface WasmMediaAdvancedControls {
    public val subtitleCues: StateFlow<List<SubtitleCue>>

    public val coverArt: StateFlow<ImageBitmap?>

    public val liveWindow: StateFlow<LivePlaybackWindow?>

    public fun setStableVolume(enabled: Boolean)

    public suspend fun setAudioOnly(enabled: Boolean)

    public fun setRotation(rotationDegrees: Int)

    public fun setProjection(configuration: ProjectionConfiguration)

    public fun setToneMapping(mode: ToneMappingMode)

    public suspend fun listAudioOutputs(): List<AudioOutputDevice>

    public suspend fun setAudioOutput(deviceId: String?)

    public suspend fun snapshot(): VideoSnapshot

    public suspend fun thumbnail(position: Duration): VideoSnapshot

    public suspend fun prefetchSubtitleCues(): List<SubtitleCue>

    public suspend fun seekToLive()
}
