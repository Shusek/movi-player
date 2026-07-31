@file:OptIn(ExperimentalWasmJsInterop::class)

package io.github.shusek.kmedia.engine.wasm

import kotlin.js.ExperimentalWasmJsInterop
import kotlin.js.js

public data class WasmMediaCapabilitySnapshot(
    public val webCodecs: Boolean,
    public val mediaSourceExtensions: Boolean,
    public val encryptedMediaExtensions: Boolean,
    public val webGl2: Boolean,
    public val webAudio: Boolean,
    public val audioOutputSelection: Boolean,
    public val highDynamicRangeDisplay: Boolean,
)

/** Synchronous browser capability probe used before a player instance is created. */
public object WasmMediaCapabilities {
    public fun snapshot(): WasmMediaCapabilitySnapshot =
        WasmMediaCapabilitySnapshot(
            webCodecs = hasGlobal("VideoDecoder"),
            mediaSourceExtensions = hasGlobal("MediaSource"),
            encryptedMediaExtensions = hasNavigatorProperty("requestMediaKeySystemAccess"),
            webGl2 = hasWebGl2(),
            webAudio = hasAudioContext(),
            audioOutputSelection = hasAudioSinkSelection(),
            highDynamicRangeDisplay = hasHighDynamicRangeDisplay(),
        )

    public fun canPlay(
        url: String,
        mimeType: String? = null,
        drm: Boolean = false,
    ): Boolean {
        if (url.isBlank()) return false
        val capabilities = snapshot()
        if (drm) return capabilities.mediaSourceExtensions && capabilities.encryptedMediaExtensions
        return if (isAdaptive(url, mimeType)) {
            capabilities.mediaSourceExtensions || canNativePlayType(mimeType.orEmpty())
        } else {
            // Progressive/local sources use the bundled demuxer and therefore do not depend on
            // the browser's container support. A rendering backend is still required.
            capabilities.webGl2 || capabilities.webCodecs
        }
    }
}

private fun isAdaptive(
    url: String,
    mimeType: String?,
): Boolean {
    val normalizedMime = mimeType?.substringBefore(';')?.trim()?.lowercase()
    if (
        normalizedMime == "application/vnd.apple.mpegurl" ||
        normalizedMime == "application/x-mpegurl" ||
        normalizedMime == "application/dash+xml" ||
        normalizedMime == "application/vnd.ms-sstr+xml"
    ) {
        return true
    }
    val cleanUrl = url.substringBefore('?').substringBefore('#').lowercase()
    return cleanUrl.endsWith(".m3u8") ||
        cleanUrl.endsWith(".mpd") ||
        cleanUrl.endsWith(".ism") ||
        cleanUrl.endsWith(".isml") ||
        cleanUrl.contains(".ism/manifest") ||
        cleanUrl.contains(".isml/manifest")
}

@Suppress("UNUSED_PARAMETER")
private fun hasGlobal(name: String): Boolean = js("typeof globalThis[name] !== 'undefined'")

@Suppress("UNUSED_PARAMETER")
private fun hasNavigatorProperty(name: String): Boolean =
    js("typeof navigator !== 'undefined' && typeof navigator[name] !== 'undefined'")

private fun hasWebGl2(): Boolean =
    js(
        """
        (function() {
            try {
                const canvas = document.createElement("canvas");
                return Boolean(canvas.getContext("webgl2"));
            } catch (_) {
                return false;
            }
        })()
        """,
    )

private fun hasAudioContext(): Boolean =
    js("typeof globalThis.AudioContext === 'function' || typeof globalThis.webkitAudioContext === 'function'")

private fun hasAudioSinkSelection(): Boolean =
    js(
        """
        (function() {
            const Context = globalThis.AudioContext || globalThis.webkitAudioContext;
            return Boolean(Context && Context.prototype && typeof Context.prototype.setSinkId === "function");
        })()
        """,
    )

private fun hasHighDynamicRangeDisplay(): Boolean =
    js(
        """
        typeof globalThis.matchMedia === "function" &&
            globalThis.matchMedia("(dynamic-range: high)").matches
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun canNativePlayType(mimeType: String): Boolean =
    js(
        """
        (function() {
            if (!mimeType) return false;
            const video = document.createElement("video");
            return Boolean(video.canPlayType(mimeType));
        })()
        """,
    )
