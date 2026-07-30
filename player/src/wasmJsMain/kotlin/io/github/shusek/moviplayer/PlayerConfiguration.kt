package io.github.shusek.moviplayer

import org.w3c.dom.HTMLCanvasElement
import org.w3c.files.File

public class MoviRuntimeConfig(
    public val assetBaseUrl: String = "movi-runtime/",
) {
    init {
        require(assetBaseUrl.isNotBlank()) { "assetBaseUrl must not be blank." }
    }

    override fun toString(): String = "MoviRuntimeConfig(assetBaseUrl=<public-runtime-location>)"
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

public fun interface MoviLogger {
    public fun log(level: MoviLogLevel, tag: String, message: String)
}

public enum class MoviLogLevel {
    SILENT,
    ERROR,
    WARN,
    INFO,
    DEBUG,
}

public class MoviPlayerConfig(
    public val canvas: HTMLCanvasElement,
    public val runtime: MoviRuntimeConfig = MoviRuntimeConfig(),
    public val decoderPreference: DecoderPreference = DecoderPreference.AUTO,
    public val logger: MoviLogger = MoviLogger { _, _, _ -> },
)

public sealed interface MediaSource {
    public class Url(
        public val url: String,
        headers: Map<String, String> = emptyMap(),
    ) : MediaSource {
        public val headers: Map<String, String> = headers.toMap()

        init {
            require(url.isNotBlank()) { "Media URL must not be blank." }
            require(this.headers.keys.none(String::isBlank)) { "Header names must not be blank." }
        }

        override fun toString(): String = "MediaSource.Url(url=<redacted>, headers=<redacted:${headers.size}>)"
    }

    public class BrowserFile(public val file: File) : MediaSource {
        override fun toString(): String = "MediaSource.BrowserFile(file=<browser-file>)"
    }

    public class Drm(
        public val mediaUrl: String,
        public val licenseUrl: String,
        mediaHeaders: Map<String, String> = emptyMap(),
        licenseHeaders: Map<String, String> = emptyMap(),
    ) : MediaSource {
        public val mediaHeaders: Map<String, String> = mediaHeaders.toMap()
        public val licenseHeaders: Map<String, String> = licenseHeaders.toMap()

        init {
            require(mediaUrl.isNotBlank()) { "DRM media URL must not be blank." }
            require(licenseUrl.isNotBlank()) { "DRM license URL must not be blank." }
            require(this.mediaHeaders.keys.none(String::isBlank)) { "Media header names must not be blank." }
            require(this.licenseHeaders.keys.none(String::isBlank)) { "License header names must not be blank." }
        }

        override fun toString(): String =
            "MediaSource.Drm(mediaUrl=<redacted>, licenseUrl=<redacted>, " +
                "mediaHeaders=<redacted:${mediaHeaders.size}>, licenseHeaders=<redacted:${licenseHeaders.size}>)"
    }
}
