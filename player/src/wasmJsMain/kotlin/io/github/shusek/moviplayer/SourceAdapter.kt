@file:OptIn(ExperimentalWasmJsInterop::class)

package io.github.shusek.moviplayer

import kotlinx.coroutines.CompletableDeferred
import org.khronos.webgl.Int8Array
import org.khronos.webgl.toByteArray
import org.w3c.files.File
import kotlin.js.ExperimentalWasmJsInterop
import kotlin.js.js

public interface SourceAdapter {
    public suspend fun getSize(): Long

    public suspend fun read(
        offset: Long,
        length: Int,
    ): ByteArray

    public fun seek(offset: Long): Long = offset

    public fun close() {}
}

public class FileSource(public val file: File) : SourceAdapter {
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
                    MoviError(
                        MoviErrorCategory.SOURCE,
                        MoviErrorCode.SOURCE_UNAVAILABLE,
                        message,
                    ),
                )
            },
        )
        return deferred.await()
    }

    override fun toString(): String = "FileSource(file=<browser-file>)"
}

public class HttpSource(
    public val url: String,
    headers: Map<String, String> = emptyMap(),
) : SourceAdapter {
    public val headers: Map<String, String> = headers.toMap()

    private var knownSize: Long? = null
    private var fullBody: ByteArray? = null
    private var closed: Boolean = false

    init {
        require(url.isNotBlank()) { "URL must not be blank." }
        require(this.headers.keys.none(String::isBlank)) { "Header names must not be blank." }
    }

    override suspend fun getSize(): Long {
        ensureOpen()
        knownSize?.let { return it }
        request(offset = 0, length = 1)
        return knownSize
            ?: throw MoviError(
                MoviErrorCategory.NETWORK,
                MoviErrorCode.SOURCE_UNAVAILABLE,
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

        fullBody?.let { body ->
            if (offset >= body.size) return ByteArray(0)
            val end = minOf(body.size.toLong(), offset + length).toInt()
            return body.copyOfRange(offset.toInt(), end)
        }
        return request(offset, length)
    }

    override fun close() {
        closed = true
        fullBody = null
    }

    override fun toString(): String = "HttpSource(url=<redacted>, headers=<redacted:${headers.size}>)"

    private suspend fun request(
        offset: Long,
        length: Int,
    ): ByteArray {
        val deferred = CompletableDeferred<RangeResponse>()
        fetchRange(
            url = url,
            headersJson = headers.toJsonObject(),
            offset = offset.toDouble(),
            length = length,
            onLoaded = { bytes, totalSize, partial ->
                deferred.complete(
                    RangeResponse(
                        bytes = bytes.toByteArray(),
                        totalSize = totalSize.toLong().takeIf { it >= 0 },
                        partial = partial,
                    ),
                )
            },
            onError = { message ->
                deferred.completeExceptionally(
                    MoviError(
                        MoviErrorCategory.NETWORK,
                        MoviErrorCode.SOURCE_UNAVAILABLE,
                        message,
                    ),
                )
            },
        )
        val response = deferred.await()
        response.totalSize?.let { knownSize = it }
        if (!response.partial) {
            fullBody = response.bytes
            knownSize = response.totalSize ?: response.bytes.size.toLong()
            if (offset >= response.bytes.size) return ByteArray(0)
            val end = minOf(response.bytes.size.toLong(), offset + length).toInt()
            return response.bytes.copyOfRange(offset.toInt(), end)
        }
        return response.bytes
    }

    private fun ensureOpen() {
        check(!closed) { "The source is closed." }
    }
}

private data class RangeResponse(
    val bytes: ByteArray,
    val totalSize: Long?,
    val partial: Boolean,
)

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
    onLoaded: (Int8Array, Double, Boolean) -> Unit,
    onError: (String) -> Unit,
): Unit =
    js(
        """
        {
            let headers = {};
            try { headers = JSON.parse(headersJson || "{}") || {}; } catch (_) {}
            const start = Math.max(0, Math.floor(offset));
            const end = start + Math.max(1, length) - 1;
            headers.Range = "bytes=" + start + "-" + end;
            fetch(url, { headers: headers })
                .then(async function(response) {
                    if (!response.ok && response.status !== 206) {
                        throw new Error("Media request failed with HTTP " + response.status + ".");
                    }
                    const partial = response.status === 206;
                    const contentRange = response.headers.get("content-range") || "";
                    const match = /\/(\d+)$/.exec(contentRange);
                    const contentLength = Number(response.headers.get("content-length") || -1);
                    const buffer = await response.arrayBuffer();
                    const bytes = new Uint8Array(buffer);
                    const total = match
                        ? Number(match[1])
                        : partial
                            ? -1
                            : contentLength >= 0
                                ? contentLength
                                : bytes.byteLength;
                    onLoaded(new Int8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength), total, partial);
                })
                .catch(function(error) {
                    onError(String(error && error.message ? error.message : error));
                });
        }
        """,
    )
