package io.github.shusek.kmedia.engine.wasm

import org.w3c.dom.HTMLElement
import kotlin.time.Duration

public data class SubtitleRendererConfiguration(
    public val codec: String,
    public val codecPrivate: ByteArray?,
    public val width: Int,
    public val height: Int,
    public val attachments: List<SubtitleFontAttachment>,
)

public data class SubtitleFontAttachment(
    public val name: String,
    public val mimeType: String,
    public val data: ByteArray,
)

public data class SubtitlePacket(
    public val data: ByteArray,
    public val presentationTime: Duration,
    public val duration: Duration,
)

public interface EmbeddedSubtitleRenderer {
    public suspend fun configure(
        configuration: SubtitleRendererConfiguration,
        overlay: HTMLElement,
    )

    public suspend fun pushPacket(packet: SubtitlePacket)

    public fun render(position: Duration)

    public fun setDelay(delay: Duration)

    public fun clear()

    public suspend fun close()
}
