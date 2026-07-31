@file:OptIn(ExperimentalWasmJsInterop::class)

package io.github.shusek.kmedia.engine.wasm

import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.delay
import org.khronos.webgl.Int8Array
import org.khronos.webgl.toByteArray
import org.w3c.files.File
import kotlin.js.ExperimentalWasmJsInterop
import kotlin.js.JsAny
import kotlin.js.js

public interface SourceAdapter {
    public val key: String
        get() = "custom:${this::class.simpleName.orEmpty()}"

    public val position: Long
        get() = 0L

    public val supportsRandomAccess: Boolean
        get() = true

    public val sourceMode: SourceMode
        get() = SourceMode.UNKNOWN

    public val cacheStats: CacheStats
        get() = CacheStats()

    public val networkStats: NetworkStats
        get() = NetworkStats()

    public val contentDispositionFilename: String?
        get() = null

    public suspend fun getSize(): Long

    public suspend fun read(
        offset: Long,
        length: Int,
    ): ByteArray

    public fun seek(offset: Long): Long = offset

    public fun setListener(listener: SourceAdapterListener?) {}

    /**
     * Returns an independent cursor over the same source when isolated thumbnail or metadata
     * work is supported. Custom adapters may keep the default `null`.
     */
    public fun fork(): SourceAdapter? = null

    public fun close() {}
}

public interface SourceAdapterListener {
    public fun onSourceModeChanged(mode: SourceMode) {}

    public fun onFileAccessRevoked(
        offset: Long,
        length: Int,
        reason: String,
    ) {}

    public fun onStatisticsChanged(
        cache: CacheStats,
        network: NetworkStats,
    ) {}
}

public class FileSource(public val file: File) : SourceAdapter {
    private var currentPosition: Long = 0L
    private var listener: SourceAdapterListener? = null

    override val key: String
        get() = browserFileKey(file)

    override val position: Long
        get() = currentPosition

    override val sourceMode: SourceMode
        get() = SourceMode.LOCAL

    override val contentDispositionFilename: String
        get() = file.name

    override suspend fun getSize(): Long = browserFileSize(file).toLong()

    override suspend fun read(
        offset: Long,
        length: Int,
    ): ByteArray {
        if (length <= 0) return ByteArray(0)
        val deferred = CompletableDeferred<ByteArray>()
        readBrowserFile(
            file = file,
            offset = offset.toDouble(),
            length = length,
            onLoaded = { bytes -> deferred.complete(bytes.toByteArray()) },
            onError = { message ->
                deferred.completeExceptionally(
                    WasmMediaError(
                        WasmMediaErrorCategory.SOURCE,
                        WasmMediaErrorCode.SOURCE_UNAVAILABLE,
                        message,
                    ),
                )
            },
        )
        return try {
            deferred.await().also { bytes -> currentPosition = offset + bytes.size }
        } catch (error: Throwable) {
            listener?.onFileAccessRevoked(
                offset = offset,
                length = length,
                reason = redactSensitiveText(error.message ?: "The browser file is no longer readable."),
            )
            throw error
        }
    }

    override fun seek(offset: Long): Long = offset.coerceAtLeast(0L).also { currentPosition = it }

    override fun setListener(listener: SourceAdapterListener?) {
        this.listener = listener
        listener?.onSourceModeChanged(SourceMode.LOCAL)
    }

    override fun fork(): SourceAdapter = FileSource(file)

    override fun toString(): String = "FileSource(file=<browser-file>)"
}

public class HttpSource(
    public val url: String,
    headers: Map<String, String> = emptyMap(),
    public val cacheConfig: CacheConfig = CacheConfig(),
) : SourceAdapter {
    public val headers: Map<String, String> = headers.toMap()

    private var knownSize: Long? = null
    private var fullBody: ByteArray? = null
    private val rangeCache: MutableList<HttpCacheEntry> = mutableListOf()
    private var cachedRangeBytes: Long = 0L
    private var accessSequence: Long = 0L
    private var closed: Boolean = false
    private var currentPosition: Long = 0L
    private var listener: SourceAdapterListener? = null
    private var downloadedBytes: Long = 0L
    private var requests: Long = 0L
    private var cacheHits: Long = 0L
    private var cacheMisses: Long = 0L
    private var retries: Long = 0L
    private var networkElapsedMilliseconds: Double = 0.0
    private var detectedMode: SourceMode = SourceMode.UNKNOWN
    private var detectedFilename: String? = null
    private var abortGroup: JsAny = createHttpAbortGroup()

    override val key: String
        get() = "http:${stablePublicHash(url)}"

    override val position: Long
        get() = currentPosition

    override val sourceMode: SourceMode
        get() = detectedMode

    override val supportsRandomAccess: Boolean
        get() = fullBody != null || detectedMode != SourceMode.LINEAR

    override val contentDispositionFilename: String?
        get() = detectedFilename

    override val cacheStats: CacheStats
        get() =
            CacheStats(
                bytesStored = fullBody?.size?.toLong() ?: 0L,
                maximumBytes = cacheConfig.maximumBytes,
                hits = cacheHits,
                misses = cacheMisses,
            ).let { stats ->
                if (fullBody != null) stats else stats.copy(bytesStored = cachedRangeBytes)
            }

    override val networkStats: NetworkStats
        get() =
            NetworkStats(
                bytesDownloaded = downloadedBytes,
                requestCount = requests,
                retryCount = retries,
                throughputBitsPerSecond =
                    if (networkElapsedMilliseconds > 0.0) {
                        (downloadedBytes * BITS_PER_BYTE * MILLIS_PER_SECOND / networkElapsedMilliseconds)
                            .toLong()
                    } else {
                        null
                    },
            )

    init {
        require(url.isNotBlank()) { "URL must not be blank." }
        require(this.headers.keys.none(String::isBlank)) { "Header names must not be blank." }
    }

    override suspend fun getSize(): Long {
        ensureOpen()
        knownSize?.let { return it }
        request(offset = 0, length = HTTP_PREFETCH_BYTES)
        knownSize?.let { return it }
        probeSize()?.let { size ->
            knownSize = size
            return size
        }
        throw WasmMediaError(
            WasmMediaErrorCategory.NETWORK,
            WasmMediaErrorCode.SOURCE_UNAVAILABLE,
            "The media response did not expose its size.",
        )
    }

    override suspend fun read(
        offset: Long,
        length: Int,
    ): ByteArray {
        ensureOpen()
        require(offset >= 0) { "offset must be non-negative." }
        if (length <= 0) return ByteArray(0)
        knownSize?.let { size ->
            if (offset >= size) {
                currentPosition = size
                return ByteArray(0)
            }
        }

        fullBody?.let { body ->
            cacheHits += 1
            if (offset >= body.size) return ByteArray(0)
            val end = minOf(body.size.toLong(), offset + length).toInt()
            return body.copyOfRange(offset.toInt(), end).also { bytes ->
                currentPosition = offset + bytes.size
                notifyStatistics()
            }
        }
        findCachedRange(offset, length)?.let { bytes ->
            cacheHits += 1
            currentPosition = offset + bytes.size
            notifyStatistics()
            return bytes
        }
        cacheMisses += 1
        val requestLength =
            if (detectedMode == SourceMode.LINEAR) {
                length
            } else {
                maxOf(length, HTTP_PREFETCH_BYTES)
            }
        return request(offset, requestLength)
            .let { response ->
                if (response.size <= length) {
                    response
                } else {
                    response.copyOfRange(0, length)
                }
            }.also { bytes ->
            currentPosition = offset + bytes.size
            notifyStatistics()
        }
    }

    override fun seek(offset: Long): Long {
        val target = offset.coerceAtLeast(0L)
        if (
            detectedMode == SourceMode.LINEAR &&
            fullBody == null &&
            rangeCache.none { target in it.offset..it.endInclusive }
        ) {
            throw WasmMediaError(
                WasmMediaErrorCategory.SOURCE,
                WasmMediaErrorCode.RANGE_UNSUPPORTED,
                "This server does not support byte ranges; seeking outside the buffered linear window is unavailable.",
            )
        }
        abortHttpRequests(abortGroup)
        abortGroup = createHttpAbortGroup()
        currentPosition = target
        return target
    }

    override fun setListener(listener: SourceAdapterListener?) {
        this.listener = listener
        if (detectedMode != SourceMode.UNKNOWN) listener?.onSourceModeChanged(detectedMode)
        notifyStatistics()
    }

    override fun close() {
        closed = true
        abortHttpRequests(abortGroup)
        fullBody = null
        rangeCache.clear()
        cachedRangeBytes = 0
    }

    override fun fork(): SourceAdapter = HttpSource(url, headers, cacheConfig)

    override fun toString(): String = "HttpSource(url=<redacted>, headers=<redacted:${headers.size}>)"

    private suspend fun request(
        offset: Long,
        length: Int,
    ): ByteArray {
        val response = requestWithRetry(offset, length)
        downloadedBytes += response.downloadedBytes
        networkElapsedMilliseconds += response.elapsedMilliseconds
        response.totalSize?.let { knownSize = it }
        val nextMode = if (response.partial) SourceMode.RANGE else SourceMode.LINEAR
        if (detectedMode != nextMode) {
            detectedMode = nextMode
            listener?.onSourceModeChanged(nextMode)
        }
        if (!response.partial) {
            knownSize = response.totalSize ?: (response.responseOffset + response.bytes.size)
            if (
                response.completeBody &&
                response.responseOffset == 0L &&
                response.bytes.size.toLong() <= cacheConfig.maximumBytes
            ) {
                fullBody = response.bytes
                rangeCache.clear()
                cachedRangeBytes = 0
                if (offset >= response.bytes.size) return ByteArray(0)
                val end = minOf(response.bytes.size.toLong(), offset + length).toInt()
                return response.bytes.copyOfRange(offset.toInt(), end)
            }
            putCachedRange(response.responseOffset, response.bytes, replaceAll = false)
            return response.bytes.copyOfRange(0, minOf(length, response.bytes.size))
        }
        putCachedRange(response.responseOffset, response.bytes)
        return response.bytes
    }

    private suspend fun requestWithRetry(
        offset: Long,
        length: Int,
    ): RangeResponse {
        var lastMessage = "The media request failed."
        repeat(HTTP_MAX_ATTEMPTS) { attempt ->
            ensureOpen()
            requests += 1
            val deferred = CompletableDeferred<RangeResponse>()
            fetchRange(
                url = url,
                headersJson = headers.toJsonObject(),
                offset = offset.toDouble(),
                length = length,
                maximumFullBodyBytes = cacheConfig.maximumBytes.toDouble(),
                abortGroup = abortGroup,
                onLoaded = {
                        bytes,
                        totalSize,
                        partial,
                        elapsedMilliseconds,
                        filename,
                        responseOffset,
                        completeBody,
                        networkBytes,
                    ->
                    if (detectedFilename == null && filename.isNotBlank()) {
                        detectedFilename = filename
                    }
                    deferred.complete(
                        RangeResponse(
                            bytes = bytes.toByteArray(),
                            totalSize = totalSize.toLong().takeIf { it >= 0 },
                            partial = partial,
                            elapsedMilliseconds = elapsedMilliseconds,
                            responseOffset = responseOffset.toLong().coerceAtLeast(0L),
                            completeBody = completeBody,
                            downloadedBytes = networkBytes.toLong().coerceAtLeast(bytes.length.toLong()),
                        ),
                    )
                },
                onError = { message, retryable ->
                    deferred.completeExceptionally(HttpRequestFailure(message, retryable))
                },
            )
            try {
                return deferred.await()
            } catch (failure: HttpRequestFailure) {
                lastMessage = failure.message ?: lastMessage
                if (!failure.retryable || attempt == HTTP_MAX_ATTEMPTS - 1) {
                    throw WasmMediaError(
                        WasmMediaErrorCategory.NETWORK,
                        if (closed) WasmMediaErrorCode.CANCELLED else WasmMediaErrorCode.SOURCE_UNAVAILABLE,
                        lastMessage,
                    )
                }
                retries += 1
                waitForBrowserOnline()
                delay(HTTP_RETRY_BASE_MILLIS * (attempt + 1))
            }
        }
        throw WasmMediaError(
            WasmMediaErrorCategory.NETWORK,
            WasmMediaErrorCode.SOURCE_UNAVAILABLE,
            lastMessage,
        )
    }

    private suspend fun probeSize(): Long? {
        ensureOpen()
        requests += 1
        val deferred = CompletableDeferred<HttpSizeProbe>()
        fetchHttpSize(
            url = url,
            headersJson = headers.toJsonObject(),
            abortGroup = abortGroup,
            onComplete = { size, elapsedMilliseconds ->
                deferred.complete(
                    HttpSizeProbe(
                        size = size.toLong().takeIf { it >= 0L },
                        elapsedMilliseconds = elapsedMilliseconds,
                    ),
                )
            },
        )
        val probe = deferred.await()
        networkElapsedMilliseconds += probe.elapsedMilliseconds
        notifyStatistics()
        return probe.size
    }

    private fun findCachedRange(
        offset: Long,
        length: Int,
    ): ByteArray? {
        val endExclusive = offset + length
        val entry =
            rangeCache.firstOrNull { cached ->
                offset >= cached.offset && endExclusive <= cached.offset + cached.data.size
            } ?: return null
        entry.lastAccess = ++accessSequence
        val localStart = (offset - entry.offset).toInt()
        return entry.data.copyOfRange(localStart, localStart + length)
    }

    private fun putCachedRange(
        offset: Long,
        bytes: ByteArray,
        replaceAll: Boolean = false,
    ) {
        if (bytes.isEmpty()) return
        if (replaceAll) {
            rangeCache.clear()
            cachedRangeBytes = 0
        }
        val maximum = cacheConfig.maximumBytes
        if (bytes.size.toLong() > maximum) {
            val retained = bytes.copyOfRange(0, maximum.coerceAtMost(Int.MAX_VALUE.toLong()).toInt())
            putCachedRange(offset, retained, replaceAll = true)
            return
        }
        rangeCache.removeAll { existing ->
            val overlaps =
                existing.offset < offset + bytes.size &&
                    offset < existing.offset + existing.data.size
            if (overlaps) cachedRangeBytes -= existing.data.size
            overlaps
        }
        while (cachedRangeBytes + bytes.size > maximum && rangeCache.isNotEmpty()) {
            val oldest = rangeCache.minBy(HttpCacheEntry::lastAccess)
            rangeCache.remove(oldest)
            cachedRangeBytes -= oldest.data.size
        }
        rangeCache += HttpCacheEntry(offset, bytes, ++accessSequence)
        cachedRangeBytes += bytes.size
    }

    private fun notifyStatistics() {
        listener?.onStatisticsChanged(cacheStats, networkStats)
    }

    private fun ensureOpen() {
        check(!closed) { "The source is closed." }
    }
}

private data class RangeResponse(
    val bytes: ByteArray,
    val totalSize: Long?,
    val partial: Boolean,
    val elapsedMilliseconds: Double,
    val responseOffset: Long,
    val completeBody: Boolean,
    val downloadedBytes: Long,
)

private data class HttpSizeProbe(
    val size: Long?,
    val elapsedMilliseconds: Double,
)

private data class HttpCacheEntry(
    val offset: Long,
    val data: ByteArray,
    var lastAccess: Long,
) {
    val endInclusive: Long
        get() = offset + data.size - 1L
}

private class HttpRequestFailure(
    message: String,
    val retryable: Boolean,
) : Exception(redactSensitiveText(message))

private fun Map<String, String>.toJsonObject(): String =
    entries.joinToString(prefix = "{", postfix = "}") { (key, value) ->
        "\"${key.jsonEscape()}\":\"${value.jsonEscape()}\""
    }

private fun String.jsonEscape(): String =
    buildString(length + 8) {
        for (character in this@jsonEscape) {
            when (character) {
                '\\' -> append("\\\\")
                '"' -> append("\\\"")
                '\b' -> append("\\b")
                '\u000C' -> append("\\f")
                '\n' -> append("\\n")
                '\r' -> append("\\r")
                '\t' -> append("\\t")
                else ->
                    if (character.code < 0x20) {
                        append("\\u")
                        append(character.code.toString(16).padStart(4, '0'))
                    } else {
                        append(character)
                    }
            }
        }
    }

@Suppress("UNUSED_PARAMETER")
private fun browserFileSize(file: File): Double = js("Number(file.size || 0)")

@Suppress("UNUSED_PARAMETER")
private fun browserFileKey(file: File): String =
    js(
        """
        "file:" + String(file.name || "") + ":" + Number(file.size || 0) + ":" + Number(file.lastModified || 0)
        """,
    )

private fun stablePublicHash(value: String): String {
    var result = 0x811c9dc5u
    value.forEach { character ->
        result = (result xor character.code.toUInt()) * 0x01000193u
    }
    return result.toString(16)
}

private suspend fun waitForBrowserOnline() {
    if (browserIsOnline()) return
    val deferred = CompletableDeferred<Unit>()
    waitForOnlineSignal { deferred.complete(Unit) }
    deferred.await()
}

@Suppress("UNUSED_PARAMETER")
private fun browserIsOnline(): Boolean = js("globalThis.navigator ? navigator.onLine !== false : true")

@Suppress("UNUSED_PARAMETER")
private fun waitForOnlineSignal(onReady: () -> Unit): Unit =
    js(
        """
        {
            if (!globalThis.addEventListener || !globalThis.navigator || navigator.onLine !== false) {
                onReady();
            } else {
                let completed = false;
                const finish = function() {
                    if (completed) return;
                    completed = true;
                    globalThis.removeEventListener("online", finish);
                    onReady();
                };
                globalThis.addEventListener("online", finish, { once: true });
                setTimeout(finish, 3000);
            }
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun createHttpAbortGroup(): JsAny =
    js("({ controllers: new Set(), closed: false })")

@Suppress("UNUSED_PARAMETER")
private fun abortHttpRequests(group: JsAny): Unit =
    js(
        """
        {
            group.closed = true;
            group.controllers.forEach(function(controller) {
                try { controller.abort(); } catch (_) {}
            });
            group.controllers.clear();
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun readBrowserFile(
    file: File,
    offset: Double,
    length: Int,
    onLoaded: (Int8Array) -> Unit,
    onError: (String) -> Unit,
): Unit =
    js(
        """
        {
            const start = Math.max(0, Math.floor(offset));
            const end = Math.max(start, start + Math.max(0, length));
            Promise.resolve(file.slice(start, end).arrayBuffer())
                .then(function(buffer) { onLoaded(new Int8Array(buffer)); })
                .catch(function(error) {
                    onError(String(error && error.message ? error.message : error));
                });
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun fetchRange(
    url: String,
    headersJson: String,
    offset: Double,
    length: Int,
    maximumFullBodyBytes: Double,
    abortGroup: JsAny,
    onLoaded: (Int8Array, Double, Boolean, Double, String, Double, Boolean, Double) -> Unit,
    onError: (String, Boolean) -> Unit,
): Unit =
    js(
        """
        {
            if (abortGroup.closed) {
                onError("The media request was cancelled.", false);
                return;
            }
            let headers = {};
            try { headers = JSON.parse(headersJson || "{}") || {}; } catch (_) {}
            const start = Math.max(0, Math.floor(offset));
            const end = start + Math.max(1, length) - 1;
            headers.Range = "bytes=" + start + "-" + end;
            const controller = new AbortController();
            abortGroup.controllers.add(controller);
            const startedAt = performance.now();
            fetch(url, { headers: headers, signal: controller.signal })
                .then(async function(response) {
                    if (!response.ok && response.status !== 206) {
                        const error = new Error("Media request failed with HTTP " + response.status + ".");
                        error.retryable = [408, 425, 429, 500, 502, 503, 504].includes(response.status);
                        throw error;
                    }
                    const partial = response.status === 206;
                    const contentRange = response.headers.get("content-range") || "";
                    const match = /\/(\d+)$/.exec(contentRange);
                    const contentLength = Number(response.headers.get("content-length") || -1);
                    let bytes;
                    let networkBytes = 0;
                    let responseOffset = partial ? start : 0;
                    let completeBody = false;
                    if (partial) {
                        bytes = new Uint8Array(await response.arrayBuffer());
                        networkBytes = bytes.byteLength;
                    } else if (
                        contentLength >= 0 &&
                        contentLength <= Math.max(0, Number(maximumFullBodyBytes || 0))
                    ) {
                        bytes = new Uint8Array(await response.arrayBuffer());
                        networkBytes = bytes.byteLength;
                        completeBody = true;
                    } else if (response.body && typeof response.body.getReader === "function") {
                        const reader = response.body.getReader();
                        const retained = [];
                        let retainedLength = 0;
                        let absoluteOffset = 0;
                        const wantedEnd = start + Math.max(1, length);
                        try {
                            while (absoluteOffset < wantedEnd) {
                                const result = await reader.read();
                                if (result.done) {
                                    completeBody = true;
                                    break;
                                }
                                const chunk = result.value || new Uint8Array(0);
                                networkBytes += chunk.byteLength;
                                const chunkStart = absoluteOffset;
                                const chunkEnd = chunkStart + chunk.byteLength;
                                const overlapStart = Math.max(start, chunkStart);
                                const overlapEnd = Math.min(wantedEnd, chunkEnd);
                                if (overlapEnd > overlapStart) {
                                    const part = chunk.slice(
                                        overlapStart - chunkStart,
                                        overlapEnd - chunkStart
                                    );
                                    retained.push(part);
                                    retainedLength += part.byteLength;
                                }
                                absoluteOffset = chunkEnd;
                            }
                        } finally {
                            if (!completeBody) {
                                try { await reader.cancel(); } catch (_) {}
                            }
                        }
                        bytes = new Uint8Array(retainedLength);
                        let writeOffset = 0;
                        retained.forEach(function(part) {
                            bytes.set(part, writeOffset);
                            writeOffset += part.byteLength;
                        });
                        responseOffset = start;
                        completeBody = completeBody && start === 0 && bytes.byteLength === absoluteOffset;
                    } else {
                        const body = new Uint8Array(await response.arrayBuffer());
                        networkBytes = body.byteLength;
                        const sliceStart = Math.min(start, body.byteLength);
                        const sliceEnd = Math.min(body.byteLength, start + Math.max(1, length));
                        bytes = body.slice(sliceStart, sliceEnd);
                        responseOffset = start;
                        completeBody = start === 0 && bytes.byteLength === body.byteLength;
                    }
                    const total = match
                        ? Number(match[1])
                        : partial
                            ? -1
                            : contentLength >= 0
                                ? contentLength
                                : completeBody
                                    ? networkBytes
                                    : -1;
                    const disposition = response.headers.get("content-disposition") || "";
                    let filename = "";
                    const encoded = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(disposition);
                    const quoted = /filename\s*=\s*"([^"]+)"/i.exec(disposition);
                    const plain = /filename\s*=\s*([^;]+)/i.exec(disposition);
                    try {
                        filename = encoded
                            ? decodeURIComponent(encoded[1])
                            : quoted
                                ? quoted[1]
                                : plain
                                    ? plain[1].trim()
                                    : "";
                    } catch (_) {
                        filename = "";
                    }
                    onLoaded(
                        new Int8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength),
                        total,
                        partial,
                        Math.max(0.01, performance.now() - startedAt),
                        filename.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 512),
                        responseOffset,
                        completeBody,
                        networkBytes
                    );
                })
                .catch(function(error) {
                    const cancelled = error && error.name === "AbortError";
                    const offline = globalThis.navigator && navigator.onLine === false;
                    const retryable = !cancelled && (offline || error.retryable === true || error instanceof TypeError);
                    const message = cancelled
                        ? "The media request was cancelled."
                        : error && error.retryable !== undefined
                            ? String(error.message || "The media request failed.")
                            : offline
                                ? "The browser is offline."
                                : "The media request could not be completed.";
                    onError(message, retryable);
                })
                .finally(function() {
                    abortGroup.controllers.delete(controller);
                });
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun fetchHttpSize(
    url: String,
    headersJson: String,
    abortGroup: JsAny,
    onComplete: (Double, Double) -> Unit,
): Unit =
    js(
        """
        {
            if (abortGroup.closed) {
                onComplete(-1, 0);
                return;
            }
            let headers = {};
            try { headers = JSON.parse(headersJson || "{}") || {}; } catch (_) {}
            Object.keys(headers).forEach(function(name) {
                if (name.toLowerCase() === "range") delete headers[name];
            });
            const controller = new AbortController();
            abortGroup.controllers.add(controller);
            const startedAt = performance.now();
            fetch(url, { method: "HEAD", headers: headers, signal: controller.signal })
                .then(function(response) {
                    const contentLength = response.ok
                        ? Number(response.headers.get("content-length") || -1)
                        : -1;
                    onComplete(
                        Number.isFinite(contentLength) && contentLength >= 0 ? contentLength : -1,
                        Math.max(0.01, performance.now() - startedAt)
                    );
                })
                .catch(function() {
                    onComplete(-1, Math.max(0.01, performance.now() - startedAt));
                })
                .finally(function() {
                    abortGroup.controllers.delete(controller);
                });
        }
        """,
    )

private const val HTTP_PREFETCH_BYTES: Int = 2 * 1024 * 1024
private const val HTTP_MAX_ATTEMPTS: Int = 4
private const val HTTP_RETRY_BASE_MILLIS: Long = 150
private const val BITS_PER_BYTE: Long = 8
private const val MILLIS_PER_SECOND: Long = 1_000
