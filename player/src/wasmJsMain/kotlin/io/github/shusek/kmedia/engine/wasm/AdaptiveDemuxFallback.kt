@file:OptIn(ExperimentalWasmJsInterop::class)

package io.github.shusek.kmedia.engine.wasm

import kotlinx.coroutines.CompletableDeferred
import org.khronos.webgl.Int8Array
import org.khronos.webgl.toByteArray
import kotlin.js.ExperimentalWasmJsInterop
import kotlin.js.js

/**
 * Builds a seekable FFmpeg input for adaptive VOD manifests when MSE cannot decode the
 * selected codec. Live playlists and manifests which cannot be represented as a finite byte
 * stream intentionally return `null`.
 */
internal suspend fun buildAdaptiveDemuxFallback(
    source: MediaSource.Url,
    cache: CacheConfig,
): MediaSource? {
    val manifest = fetchManifestText(source.url, source.headers)
    val normalizedMime = source.mimeType?.substringBefore(';')?.trim()?.lowercase()
    return when {
        normalizedMime in HLS_MANIFEST_MIME_TYPES ||
            source.url.substringBefore('?').substringBefore('#').endsWith(".m3u8", ignoreCase = true) ->
            buildHlsDemuxSource(source.url, source.headers, manifest, cache)
        normalizedMime == "application/dash+xml" ||
            source.url.substringBefore('?').substringBefore('#').endsWith(".mpd", ignoreCase = true) ->
            buildDashSingleFileSource(source.url, source.headers, manifest, cache)?.let(MediaSource::Adapter)
        else -> null
    }
}

private suspend fun buildHlsDemuxSource(
    manifestUrl: String,
    headers: Map<String, String>,
    manifest: String,
    cache: CacheConfig,
): MediaSource? {
    val lines = manifest.lineSequence().map(String::trim).filter(String::isNotEmpty).toList()
    if (lines.none { it.equals("#EXTM3U", ignoreCase = true) }) return null
    val variants =
        buildList {
            lines.forEachIndexed { index, line ->
                if (!line.startsWith("#EXT-X-STREAM-INF:", ignoreCase = true)) return@forEachIndexed
                val uri = lines.drop(index + 1).firstOrNull { !it.startsWith("#") } ?: return@forEachIndexed
                val resolution = HLS_RESOLUTION.find(line)
                add(
                    HlsVariantDescriptor(
                        url = resolveUrl(manifestUrl, uri),
                        bandwidth = HLS_BANDWIDTH.find(line)?.groupValues?.getOrNull(1)?.toLongOrNull(),
                        width = resolution?.groupValues?.getOrNull(1)?.toIntOrNull(),
                        height = resolution?.groupValues?.getOrNull(2)?.toIntOrNull(),
                        codecs = HLS_CODECS.find(line)?.groupValues?.getOrNull(1),
                        label = HLS_NAME.find(line)?.groupValues?.getOrNull(1),
                    ),
                )
            }
        }
    if (variants.isEmpty()) {
        return buildHlsSegmentSource(manifestUrl, headers, manifest, cache)?.let(MediaSource::Adapter)
    }

    val resolvedVariants =
        variants.mapNotNull { descriptor ->
            val adapter =
                buildHlsSegmentSource(
                    manifestUrl = descriptor.url,
                    headers = headers,
                    manifest = fetchManifestText(descriptor.url, headers),
                    cache = cache,
                    depth = 1,
                ) ?: return@mapNotNull null
            descriptor to adapter
        }
    if (resolvedVariants.isEmpty()) return null
    val primary = resolvedVariants.maxBy { it.first.bandwidth ?: 0L }
    val audio = mutableListOf<ExternalAudioSource>()
    val subtitles = mutableListOf<ExternalSubtitleSource>()
    var audioIndex = 0
    var subtitleIndex = 0
    lines.filter { it.startsWith("#EXT-X-MEDIA:", ignoreCase = true) }.forEach { line ->
        val type = HLS_TYPE.find(line)?.groupValues?.getOrNull(1)?.uppercase() ?: return@forEach
        val uri = HLS_URI.find(line)?.groupValues?.getOrNull(1) ?: return@forEach
        val resolvedUrl = resolveUrl(manifestUrl, uri)
        val adapter =
            buildHlsSegmentSource(
                manifestUrl = resolvedUrl,
                headers = headers,
                manifest = fetchManifestText(resolvedUrl, headers),
                cache = cache,
                depth = 1,
            ) ?: return@forEach
        val language = HLS_LANGUAGE.find(line)?.groupValues?.getOrNull(1)
        val label = HLS_NAME.find(line)?.groupValues?.getOrNull(1)
        val isDefault = HLS_DEFAULT.find(line)?.groupValues?.getOrNull(1)?.equals("YES", ignoreCase = true) == true
        when (type) {
            "AUDIO" ->
                audio +=
                    ExternalAudioSource(
                        id = "hls-audio-${audioIndex++}",
                        source = MediaSource.Adapter(adapter),
                        language = language,
                        label = label,
                        isDefault = isDefault,
                    )
            "SUBTITLES" ->
                subtitles +=
                    ExternalSubtitleSource(
                        id = "hls-subtitle-${subtitleIndex++}",
                        source = MediaSource.Adapter(adapter),
                        format = resolvedUrl.substringBefore('?').substringAfterLast('.', "vtt"),
                        language = language,
                        label = label,
                        isDefault = isDefault,
                    )
            else -> adapter.close()
        }
    }
    return MediaSource.Composite(
        primary = MediaSource.Adapter(primary.second),
        audioTracks = audio,
        subtitleTracks = subtitles,
        variants =
            resolvedVariants
                .filterNot { it === primary }
                .mapIndexed { index, (descriptor, adapter) ->
                    QualityVariantSource(
                        id = "hls-quality-$index",
                        source = MediaSource.Adapter(adapter),
                        width = descriptor.width,
                        height = descriptor.height,
                        bitRate = descriptor.bandwidth,
                        codecs = descriptor.codecs,
                        label = descriptor.label ?: descriptor.height?.let { "${it}p" },
                    )
                },
    )
}

private suspend fun buildHlsSegmentSource(
    manifestUrl: String,
    headers: Map<String, String>,
    manifest: String,
    cache: CacheConfig,
    depth: Int = 0,
): SourceAdapter? {
    if (depth > MAX_HLS_MASTER_DEPTH) return null
    val lines = manifest.lineSequence().map(String::trim).filter(String::isNotEmpty).toList()
    if (lines.none { it.equals("#EXTM3U", ignoreCase = true) }) return null
    val variants =
        buildList {
            lines.forEachIndexed { index, line ->
                if (!line.startsWith("#EXT-X-STREAM-INF:", ignoreCase = true)) return@forEachIndexed
                val uri = lines.drop(index + 1).firstOrNull { !it.startsWith("#") } ?: return@forEachIndexed
                val bandwidth =
                    HLS_BANDWIDTH.find(line)?.groupValues?.getOrNull(1)?.toLongOrNull() ?: 0L
                add(bandwidth to resolveUrl(manifestUrl, uri))
            }
        }
    if (variants.isNotEmpty()) {
        val selected = variants.maxBy { it.first }.second
        return buildHlsSegmentSource(
            manifestUrl = selected,
            headers = headers,
            manifest = fetchManifestText(selected, headers),
            cache = cache,
            depth = depth + 1,
        )
    }
    if (lines.none { it.equals("#EXT-X-ENDLIST", ignoreCase = true) }) return null

    val segments = mutableListOf<SegmentDescriptor>()
    var pendingRange: Pair<Long, Long?>? = null
    var nextImplicitRangeOffset = 0L
    lines.forEach { line ->
        when {
            line.startsWith("#EXT-X-MAP:", ignoreCase = true) -> {
                val uri = HLS_URI.find(line)?.groupValues?.getOrNull(1) ?: return@forEach
                val range = HLS_BYTERANGE_ATTRIBUTE.find(line)?.groupValues
                val length = range?.getOrNull(1)?.toLongOrNull()
                val offset = range?.getOrNull(2)?.toLongOrNull() ?: 0L
                segments += SegmentDescriptor(resolveUrl(manifestUrl, uri), offset, length)
            }
            line.startsWith("#EXT-X-BYTERANGE:", ignoreCase = true) -> {
                val match = HLS_BYTERANGE_LINE.find(line) ?: return@forEach
                val length = match.groupValues[1].toLongOrNull() ?: return@forEach
                val explicit = match.groupValues.getOrNull(2)?.takeIf(String::isNotBlank)?.toLongOrNull()
                pendingRange = length to explicit
            }
            !line.startsWith("#") -> {
                val (length, explicit) = pendingRange ?: (null to null)
                val offset = explicit ?: if (length != null) nextImplicitRangeOffset else 0L
                segments += SegmentDescriptor(resolveUrl(manifestUrl, line), offset, length)
                if (length != null) nextImplicitRangeOffset = offset + length
                pendingRange = null
            }
        }
    }
    if (segments.isEmpty()) return null
    return SegmentStreamSource(
        segments = segments,
        headers = headers,
        cache = cache,
        key = "hls:${stableManifestHash(manifestUrl)}",
    )
}

private suspend fun buildDashSingleFileSource(
    manifestUrl: String,
    headers: Map<String, String>,
    manifest: String,
    cache: CacheConfig,
): SourceAdapter? {
    val descriptor = parseDashSingleFileManifest(manifestUrl, manifest) ?: return null
    return HttpSource(descriptor.url, headers, cache)
}

public class SegmentStreamSource internal constructor(
    private val segments: List<SegmentDescriptor>,
    private val headers: Map<String, String>,
    private val cache: CacheConfig,
    override val key: String,
) : SourceAdapter {
    private var resolved: List<ResolvedSegment>? = null
    private var currentPosition: Long = 0L
    private var closed: Boolean = false
    private var hits: Long = 0
    private var misses: Long = 0
    private var downloaded: Long = 0
    private var requests: Long = 0
    private var listener: SourceAdapterListener? = null
    private val openSources: LinkedHashMap<String, HttpSource> = linkedMapOf()

    override val position: Long
        get() = currentPosition

    override val supportsRandomAccess: Boolean
        get() = true

    override val sourceMode: SourceMode
        get() = SourceMode.ADAPTIVE

    override val cacheStats: CacheStats
        get() =
            CacheStats(
                bytesStored = openSources.values.sumOf { it.cacheStats.bytesStored },
                maximumBytes = cache.maximumBytes,
                hits = hits + openSources.values.sumOf { it.cacheStats.hits },
                misses = misses + openSources.values.sumOf { it.cacheStats.misses },
            )

    override val networkStats: NetworkStats
        get() =
            NetworkStats(
                bytesDownloaded = downloaded + openSources.values.sumOf { it.networkStats.bytesDownloaded },
                requestCount = requests + openSources.values.sumOf { it.networkStats.requestCount },
                retryCount = openSources.values.sumOf { it.networkStats.retryCount },
            )

    override suspend fun getSize(): Long =
        resolveSegments().lastOrNull()?.virtualEnd ?: 0L

    override suspend fun read(
        offset: Long,
        length: Int,
    ): ByteArray {
        check(!closed) { "The segment stream is closed." }
        if (length <= 0) return ByteArray(0)
        val resolvedSegments = resolveSegments()
        val output = ByteArray(length)
        var written = 0
        var cursor = offset
        while (written < length) {
            val segment =
                resolvedSegments.firstOrNull { cursor >= it.virtualStart && cursor < it.virtualEnd }
                    ?: break
            val localOffset = cursor - segment.virtualStart
            val available = segment.virtualEnd - cursor
            val requested = minOf(length - written, available.coerceAtMost(Int.MAX_VALUE.toLong()).toInt())
            val source = sourceFor(segment.descriptor.url)
            val bytes = source.read(segment.descriptor.offset + localOffset, requested)
            if (bytes.isEmpty()) break
            bytes.copyInto(output, written)
            written += bytes.size
            cursor += bytes.size
            misses += 1
        }
        currentPosition = offset + written
        listener?.onStatisticsChanged(cacheStats, networkStats)
        return if (written == output.size) output else output.copyOf(written)
    }

    override fun seek(offset: Long): Long =
        offset.coerceAtLeast(0).also { currentPosition = it }

    override fun setListener(listener: SourceAdapterListener?) {
        this.listener = listener
        listener?.onSourceModeChanged(SourceMode.ADAPTIVE)
        listener?.onStatisticsChanged(cacheStats, networkStats)
    }

    override fun fork(): SourceAdapter =
        SegmentStreamSource(segments, headers, cache, key)

    override fun close() {
        if (closed) return
        closed = true
        openSources.values.forEach(HttpSource::close)
        openSources.clear()
    }

    override fun toString(): String = "SegmentStreamSource(segments=${segments.size}, key=$key)"

    private suspend fun resolveSegments(): List<ResolvedSegment> {
        resolved?.let { return it }
        var virtualOffset = 0L
        val value =
            buildList {
                segments.forEach { descriptor ->
                    val length =
                        descriptor.length
                            ?: probeRemoteSize(descriptor.url, headers)
                            ?: throw WasmMediaError(
                                WasmMediaErrorCategory.NETWORK,
                                WasmMediaErrorCode.RANGE_UNSUPPORTED,
                                "An adaptive segment did not expose a finite size.",
                            )
                    add(
                        ResolvedSegment(
                            descriptor = descriptor.copy(length = length),
                            virtualStart = virtualOffset,
                            virtualEnd = virtualOffset + length,
                        ),
                    )
                    virtualOffset += length
                }
            }
        resolved = value
        return value
    }

    private fun sourceFor(url: String): HttpSource {
        openSources[url]?.let { source ->
            openSources.remove(url)
            openSources[url] = source
            hits += 1
            return source
        }
        requests += 1
        val perSourceLimit =
            (cache.maximumBytes / MAX_OPEN_SEGMENT_SOURCES)
                .coerceAtLeast(1024L * 1024L)
        val source = HttpSource(url, headers, CacheConfig(perSourceLimit))
        openSources[url] = source
        while (openSources.size > MAX_OPEN_SEGMENT_SOURCES) {
            val oldestKey = openSources.keys.first()
            openSources.remove(oldestKey)?.close()
        }
        return source
    }
}

internal data class SegmentDescriptor(
    val url: String,
    val offset: Long = 0,
    val length: Long? = null,
)

private data class ResolvedSegment(
    val descriptor: SegmentDescriptor,
    val virtualStart: Long,
    val virtualEnd: Long,
)

private data class HlsVariantDescriptor(
    val url: String,
    val bandwidth: Long?,
    val width: Int?,
    val height: Int?,
    val codecs: String?,
    val label: String?,
)

private suspend fun fetchManifestText(
    url: String,
    headers: Map<String, String>,
): String {
    val deferred = CompletableDeferred<String>()
    fetchText(
        url = url,
        headersJson = headers.toSafeJson(),
        onComplete = deferred::complete,
        onError = { message ->
            deferred.completeExceptionally(
                WasmMediaError(
                    WasmMediaErrorCategory.NETWORK,
                    WasmMediaErrorCode.SOURCE_UNAVAILABLE,
                    message,
                ),
            )
        },
    )
    return deferred.await()
}

private suspend fun probeRemoteSize(
    url: String,
    headers: Map<String, String>,
): Long? {
    val deferred = CompletableDeferred<Double>()
    probeSize(
        url = url,
        headersJson = headers.toSafeJson(),
        onComplete = deferred::complete,
        onError = { deferred.complete(-1.0) },
    )
    return deferred.await().toLong().takeIf { it >= 0 }
}

private fun Map<String, String>.toSafeJson(): String =
    entries.joinToString(prefix = "{", postfix = "}") { (key, value) ->
        "\"${key.adaptiveJsonEscape()}\":\"${value.adaptiveJsonEscape()}\""
    }

private fun String.adaptiveJsonEscape(): String =
    replace("\\", "\\\\").replace("\"", "\\\"").replace("\r", "\\r").replace("\n", "\\n")

private fun stableManifestHash(value: String): String {
    var result = 0x811c9dc5u
    value.forEach { result = (result xor it.code.toUInt()) * 0x01000193u }
    return result.toString(16)
}

@Suppress("UNUSED_PARAMETER")
private fun resolveUrl(
    base: String,
    relative: String,
): String = js("new URL(relative, new URL(base, globalThis.location.href)).href")

@Suppress("UNUSED_PARAMETER")
private fun parseDashSingleFileManifest(
    manifestUrl: String,
    manifest: String,
): SegmentDescriptor? =
    parseDashSingleFileManifestRow(manifestUrl, manifest)
        .takeIf(String::isNotBlank)
        ?.split('\t', limit = 3)
        ?.let { columns ->
            SegmentDescriptor(
                url = columns[0],
                offset = columns.getOrNull(1)?.toLongOrNull() ?: 0L,
                length = columns.getOrNull(2)?.toLongOrNull(),
            )
        }

@Suppress("UNUSED_PARAMETER")
private fun parseDashSingleFileManifestRow(
    manifestUrl: String,
    manifest: String,
): String =
    js(
        """
        (function() {
            try {
                const documentValue = new DOMParser().parseFromString(manifest, "application/xml");
                if (documentValue.querySelector("parsererror")) return "";
                const representations = Array.from(documentValue.querySelectorAll("Representation"))
                    .filter(node => node.querySelector("SegmentTemplate") === null);
                if (!representations.length) return "";
                representations.sort((a, b) =>
                    Number(b.getAttribute("bandwidth") || 0) - Number(a.getAttribute("bandwidth") || 0)
                );
                const representation = representations[0];
                const adaptation = representation.parentElement;
                const period = adaptation && adaptation.parentElement;
                const mpd = documentValue.documentElement;
                const baseNode =
                    representation.querySelector(":scope > BaseURL") ||
                    (adaptation && adaptation.querySelector(":scope > BaseURL")) ||
                    (period && period.querySelector(":scope > BaseURL")) ||
                    mpd.querySelector(":scope > BaseURL");
                if (!baseNode || !baseNode.textContent) return "";
                const url = new URL(
                    baseNode.textContent.trim(),
                    new URL(manifestUrl, globalThis.location.href)
                ).href;
                // A SegmentBase representation is a single seekable media object. Its
                // Initialization range only locates metadata inside that object; exposing just
                // that range would truncate the FFmpeg input before the media samples.
                return url + "\t0\t";
            } catch (_) {
                return "";
            }
        })()
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun fetchText(
    url: String,
    headersJson: String,
    onComplete: (String) -> Unit,
    onError: (String) -> Unit,
): Unit =
    js(
        """
        {
            let headers = {};
            try { headers = JSON.parse(headersJson || "{}") || {}; } catch (_) {}
            fetch(url, { headers })
                .then(function(response) {
                    if (!response.ok) throw new Error("Manifest request failed with HTTP " + response.status + ".");
                    return response.text();
                })
                .then(function(text) { onComplete(text); })
                .catch(function(error) {
                    onError(String(error && error.message ? error.message : error));
                });
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun probeSize(
    url: String,
    headersJson: String,
    onComplete: (Double) -> Unit,
    onError: (String) -> Unit,
): Unit =
    js(
        """
        {
            let headers = {};
            try { headers = JSON.parse(headersJson || "{}") || {}; } catch (_) {}
            const rangeHeaders = { ...headers, Range: "bytes=0-0" };
            fetch(url, { method: "GET", headers: rangeHeaders })
                .then(function(response) {
                    if (!response.ok && response.status !== 206) {
                        throw new Error("Segment size probe failed with HTTP " + response.status + ".");
                    }
                    const contentRange = response.headers.get("content-range") || "";
                    const match = /\/(\d+)$/.exec(contentRange);
                    const length = Number(response.headers.get("content-length") || -1);
                    try { if (response.body) response.body.cancel(); } catch (_) {}
                    onComplete(match ? Number(match[1]) : length);
                })
                .catch(function(error) {
                    onError(String(error && error.message ? error.message : error));
                });
        }
        """,
    )

private val HLS_MANIFEST_MIME_TYPES: Set<String> =
    setOf(
        "application/vnd.apple.mpegurl",
        "application/x-mpegurl",
        "audio/mpegurl",
        "audio/x-mpegurl",
    )
private val HLS_BANDWIDTH: Regex = Regex("""(?i)(?:^|[:,])BANDWIDTH=(\d+)""")
private val HLS_URI: Regex = Regex("""(?i)(?:^|[:,])URI="([^"]+)"""")
private val HLS_TYPE: Regex = Regex("""(?i)(?:^|[:,])TYPE=([^,]+)""")
private val HLS_LANGUAGE: Regex = Regex("""(?i)(?:^|,)LANGUAGE="([^"]+)"""")
private val HLS_NAME: Regex = Regex("""(?i)(?:^|,)NAME="([^"]+)"""")
private val HLS_CODECS: Regex = Regex("""(?i)(?:^|,)CODECS="([^"]+)"""")
private val HLS_RESOLUTION: Regex = Regex("""(?i)(?:^|,)RESOLUTION=(\d+)x(\d+)""")
private val HLS_DEFAULT: Regex = Regex("""(?i)(?:^|,)DEFAULT=(YES|NO)""")
private val HLS_BYTERANGE_ATTRIBUTE: Regex = Regex("""(?i)BYTERANGE="(\d+)(?:@(\d+))?"""")
private val HLS_BYTERANGE_LINE: Regex = Regex("""(?i)^#EXT-X-BYTERANGE:(\d+)(?:@(\d+))?""")
private const val MAX_HLS_MASTER_DEPTH: Int = 3
private const val MAX_OPEN_SEGMENT_SOURCES: Int = 4
