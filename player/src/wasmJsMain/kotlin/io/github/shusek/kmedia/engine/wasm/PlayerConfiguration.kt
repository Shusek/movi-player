package io.github.shusek.kmedia.engine.wasm

import kotlinx.browser.document
import org.w3c.dom.HTMLCanvasElement
import org.w3c.dom.HTMLVideoElement
import org.w3c.files.File

public class WasmRuntimeConfig(
    public val assetBaseUrl: String = "kmedia-wasm-runtime/",
    public val expectedAbiVersion: Int = KMEDIA_WASM_RUNTIME_ABI_VERSION,
) {
    init {
        require(assetBaseUrl.isNotBlank()) { "assetBaseUrl must not be blank." }
        require(expectedAbiVersion > 0) { "expectedAbiVersion must be positive." }
    }

    override fun toString(): String =
        "WasmRuntimeConfig(assetBaseUrl=<public-runtime-location>, expectedAbiVersion=$expectedAbiVersion)"
}

public enum class DecoderPreference {
    AUTO,
    SOFTWARE,
}

public enum class FitMode {
    CONTAIN,
    COVER,
    FILL,
}

public fun interface WasmMediaLogger {
    public fun log(level: WasmMediaLogLevel, tag: String, message: String)
}

public enum class WasmMediaLogLevel {
    SILENT,
    ERROR,
    WARN,
    INFO,
    DEBUG,
}

public class WasmMediaPlayerConfig(
    public val runtime: WasmRuntimeConfig = WasmRuntimeConfig(),
    public val decoderPreference: DecoderPreference = DecoderPreference.AUTO,
    public val cache: CacheConfig = CacheConfig(),
    public val softwareDecode: SoftwareDecodeConfig = SoftwareDecodeConfig(),
    public val stableVolume: Boolean = false,
    public val audioOnly: Boolean = false,
    public val outputDynamicRangePolicy: OutputDynamicRangePolicy = OutputDynamicRangePolicy.AUTO,
    public val toneMapping: ToneMappingMode = ToneMappingMode.AUTO,
    public val initialRotationDegrees: Int = 0,
    public val projection: ProjectionConfiguration = ProjectionConfiguration(),
    public val lcevcAdapter: LcevcAdapter? = null,
    public val logger: WasmMediaLogger = WasmMediaLogger { _, _, _ -> },
) {
    /** Render target created and owned by the engine, never by its KMediaPlayer host. */
    internal val canvas: HTMLCanvasElement = document.createElement("canvas") as HTMLCanvasElement

    init {
        require(initialRotationDegrees % 90 == 0) { "initialRotationDegrees must be a multiple of 90." }
    }
}

public sealed interface MediaSource {
    public class Url(
        public val url: String,
        headers: Map<String, String> = emptyMap(),
        public val mimeType: String? = null,
    ) : MediaSource {
        public val headers: Map<String, String> = headers.toMap()

        init {
            require(url.isNotBlank()) { "Media URL must not be blank." }
            require(this.headers.keys.none(String::isBlank)) { "Header names must not be blank." }
            require(mimeType == null || mimeType.isNotBlank()) { "mimeType must be null or non-blank." }
        }

        override fun toString(): String =
            "MediaSource.Url(url=<redacted>, headers=<redacted:${headers.size}>, mimeType=$mimeType)"
    }

    public class BrowserFile(public val file: File) : MediaSource {
        override fun toString(): String = "MediaSource.BrowserFile(file=<browser-file>)"
    }

    /**
     * A browser-native source whose transport lifecycle is owned by the caller-provided adapter.
     *
     * This is intentionally distinct from [Url]: it is always routed through the browser media
     * backend and is suitable for bounded MediaSource transports prepared by extensions.
     */
    public class BrowserMedia(public val adapter: BrowserMediaSourceAdapter) : MediaSource {
        override fun toString(): String = "MediaSource.BrowserMedia(adapter=<browser-media-source>)"
    }

    public class Adapter(public val adapter: SourceAdapter) : MediaSource {
        override fun toString(): String = "MediaSource.Adapter(adapter=<custom-source>)"
    }

    public class Encrypted(public val config: EncryptedSourceConfig) : MediaSource {
        override fun toString(): String = "MediaSource.Encrypted(config=<redacted>)"
    }

    public class Drm(
        public val mediaUrl: String,
        public val licenseUrl: String,
        mediaHeaders: Map<String, String> = emptyMap(),
        licenseHeaders: Map<String, String> = emptyMap(),
        licenseServers: Map<String, String> =
            DEFAULT_DRM_KEY_SYSTEMS.associateWith { licenseUrl },
    ) : MediaSource {
        public val mediaHeaders: Map<String, String> = mediaHeaders.toMap()
        public val licenseHeaders: Map<String, String> = licenseHeaders.toMap()
        public val licenseServers: Map<String, String> = licenseServers.toMap()

        init {
            require(mediaUrl.isNotBlank()) { "DRM media URL must not be blank." }
            require(licenseUrl.isNotBlank()) { "DRM license URL must not be blank." }
            require(this.mediaHeaders.keys.none(String::isBlank)) { "Media header names must not be blank." }
            require(this.licenseHeaders.keys.none(String::isBlank)) { "License header names must not be blank." }
            require(this.licenseServers.isNotEmpty()) { "At least one DRM key system must be configured." }
            require(this.licenseServers.keys.none(String::isBlank)) { "DRM key-system names must not be blank." }
            require(this.licenseServers.values.none(String::isBlank)) { "DRM license URLs must not be blank." }
        }

        override fun toString(): String =
            "MediaSource.Drm(mediaUrl=<redacted>, licenseUrl=<redacted>, " +
                "mediaHeaders=<redacted:${mediaHeaders.size}>, licenseHeaders=<redacted:${licenseHeaders.size}>, " +
                "licenseServers=<redacted:${licenseServers.size}>)"
    }

    public class Composite(
        public val primary: MediaSource,
        audioTracks: List<ExternalAudioSource> = emptyList(),
        subtitleTracks: List<ExternalSubtitleSource> = emptyList(),
        variants: List<QualityVariantSource> = emptyList(),
    ) : MediaSource {
        public val audioTracks: List<ExternalAudioSource> = audioTracks.toList()
        public val subtitleTracks: List<ExternalSubtitleSource> = subtitleTracks.toList()
        public val variants: List<QualityVariantSource> = variants.toList()

        init {
            require(primary !is Composite) { "Nested composite media sources are not supported." }
            require(this.audioTracks.map(ExternalAudioSource::id).distinct().size == this.audioTracks.size) {
                "External audio source ids must be unique."
            }
            require(this.subtitleTracks.map(ExternalSubtitleSource::id).distinct().size == this.subtitleTracks.size) {
                "External subtitle source ids must be unique."
            }
            require(this.variants.map(QualityVariantSource::id).distinct().size == this.variants.size) {
                "Quality variant source ids must be unique."
            }
        }

        override fun toString(): String =
            "MediaSource.Composite(primary=$primary, audioTracks=${audioTracks.size}, " +
                "subtitleTracks=${subtitleTracks.size}, variants=${variants.size})"
    }
}

/**
 * Attaches a prepared browser transport to the engine-owned media element.
 *
 * Once [MediaSource.BrowserMedia] is passed to [WasmMediaPlayer.load], the player owns this
 * adapter and calls [detach] and [close] exactly once when the source is replaced, fails, or is closed.
 */
public interface BrowserMediaSourceAdapter {
    public val url: String

    public val mimeType: String?

    public fun attach(
        video: HTMLVideoElement,
        onFailure: (String) -> Unit,
    )

    public fun detach(video: HTMLVideoElement)

    public fun close()
}

public class EncryptedSourceConfig(
    public val videoUrl: String,
    public val tokenUrl: String,
    public val videoId: String,
    public val fingerprint: String,
    public val sessionToken: String,
    headers: Map<String, String> = emptyMap(),
    public val tokenRefreshIntervalSeconds: Int = 240,
    public val onAuthenticationFailed: ((String) -> Unit)? = null,
) {
    public val headers: Map<String, String> = headers.toMap()

    init {
        require(videoUrl.isNotBlank()) { "videoUrl must not be blank." }
        require(tokenUrl.isNotBlank()) { "tokenUrl must not be blank." }
        require(videoId.isNotBlank()) { "videoId must not be blank." }
        require(fingerprint.isNotBlank()) { "fingerprint must not be blank." }
        require(sessionToken.isNotBlank()) { "sessionToken must not be blank." }
        require(this.headers.keys.none(String::isBlank)) { "Header names must not be blank." }
        require(tokenRefreshIntervalSeconds > 0) { "tokenRefreshIntervalSeconds must be positive." }
    }

    override fun toString(): String = "EncryptedSourceConfig(<redacted>)"
}

public const val KMEDIA_WASM_RUNTIME_ABI_VERSION: Int = 4

public val DEFAULT_DRM_KEY_SYSTEMS: List<String> =
    listOf(
        "com.widevine.alpha",
        "com.microsoft.playready",
        "com.apple.fps",
        "org.w3.clearkey",
    )
