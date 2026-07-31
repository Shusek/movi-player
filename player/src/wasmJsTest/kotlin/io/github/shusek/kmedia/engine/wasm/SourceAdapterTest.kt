@file:OptIn(ExperimentalWasmJsInterop::class)

package io.github.shusek.kmedia.engine.wasm

import kotlinx.coroutines.test.runTest
import org.w3c.files.File
import kotlin.js.ExperimentalWasmJsInterop
import kotlin.js.JsAny
import kotlin.js.js
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue
import kotlin.time.Duration.Companion.seconds

class SourceAdapterTest {
    @Test
    fun browserFilePreservesOffsetsBeyondFourGiB() =
        runTest(timeout = 10.seconds) {
            val source = FileSource(createVirtualLargeBrowserFile())
            try {
                assertEquals(VIRTUAL_LARGE_FILE_SIZE, source.getSize())
                val offset = 80L * 1024L * 1024L * 1024L + 123L
                val bytes = source.read(offset, 8)

                assertEquals(offset, virtualLargeFileLastReadOffset().toLong())
                assertEquals(offset + bytes.size, source.position)
                assertEquals(
                    ByteArray(8) { index -> ((offset + index) and 0xff).toByte() }.toList(),
                    bytes.toList(),
                )
            } finally {
                source.close()
                clearVirtualLargeBrowserFileState()
            }
        }

    @Test
    fun transientCdnResponsesRetryAndLargeNoRangeBodiesStayBounded() =
        runTest(timeout = 30.seconds) {
            val fixture = installHttpSourceFetchFixture()
            try {
                val retrying =
                    HttpSource(
                        url = RETRY_SOURCE_URL,
                        cacheConfig = CacheConfig(maximumBytes = 1024L * 1024L),
                    )
                try {
                    assertEquals(4_096L, retrying.getSize())
                    assertEquals(2L, retrying.networkStats.retryCount)
                    assertEquals(3L, retrying.networkStats.requestCount)
                    assertEquals(SourceMode.RANGE, retrying.sourceMode)
                } finally {
                    retrying.close()
                }

                val hiddenRangeSize =
                    HttpSource(
                        url = HIDDEN_RANGE_SIZE_URL,
                        cacheConfig = CacheConfig(maximumBytes = 1024L * 1024L),
                    )
                try {
                    assertEquals(4_096L, hiddenRangeSize.getSize())
                    assertEquals(SourceMode.RANGE, hiddenRangeSize.sourceMode)
                    assertEquals(2L, hiddenRangeSize.networkStats.requestCount)
                    assertEquals(
                        expectedHttpFixtureBytes(128, 64).toList(),
                        hiddenRangeSize.read(128, 64).toList(),
                    )
                    assertTrue(hiddenRangeSize.read(4_096, 64).isEmpty())
                    assertEquals(2L, hiddenRangeSize.networkStats.requestCount)
                } finally {
                    hiddenRangeSize.close()
                }

                val linear =
                    HttpSource(
                        url = NO_RANGE_SOURCE_URL,
                        cacheConfig = CacheConfig(maximumBytes = 1024L * 1024L),
                    )
                try {
                    assertEquals(NO_RANGE_FIXTURE_SIZE.toLong(), linear.getSize())
                    assertEquals(SourceMode.LINEAR, linear.sourceMode)
                    assertTrue(!linear.supportsRandomAccess)
                    assertTrue(linear.cacheStats.bytesStored <= 1024L * 1024L)
                    val offset = 5 * 1024 * 1024 / 2
                    val bytes = linear.read(offset.toLong(), 64)
                    assertEquals(expectedHttpFixtureBytes(offset, 64).toList(), bytes.toList())
                    assertTrue(linear.cacheStats.bytesStored <= 1024L * 1024L)
                    assertFailsWith<WasmMediaError> { linear.seek(0) }
                    assertEquals("large-fixture.bin", linear.contentDispositionFilename)
                } finally {
                    linear.close()
                }
            } finally {
                restoreHttpSourceFetchFixture(fixture)
            }
        }

    @Test
    fun revokedBrowserFileNotifiesTheHost() =
        runTest(timeout = 10.seconds) {
            val source = FileSource(createRevokedBrowserFile())
            var revoked = false
            var safeReason = ""
            source.setListener(
                object : SourceAdapterListener {
                    override fun onFileAccessRevoked(
                        offset: Long,
                        length: Int,
                        reason: String,
                    ) {
                        revoked = true
                        safeReason = reason
                    }
                },
            )
            assertEquals(32L, source.getSize())
            val error = assertFailsWith<WasmMediaError> { source.read(0, 8) }
            assertEquals(WasmMediaErrorCode.SOURCE_UNAVAILABLE, error.code)
            assertTrue(revoked)
            assertTrue(safeReason.isNotBlank())
        }
}

@Suppress("UNUSED_PARAMETER")
private fun installHttpSourceFetchFixture(): JsAny =
    js(
        """
        (function() {
            const originalFetch = globalThis.fetch;
            let retryAttempts = 0;
            const createBytes = function(size, offset) {
                const bytes = new Uint8Array(size);
                for (let index = 0; index < size; index++) {
                    bytes[index] = ((offset + index) * 17 + 11) & 255;
                }
                return bytes;
            };
            globalThis.fetch = async function(input, init) {
                const url = String(input && input.url ? input.url : input);
                if (url === "https://fixture.invalid/retry-range") {
                    retryAttempts += 1;
                    if (retryAttempts <= 2) return new Response("", { status: 503 });
                    const headers = new Headers(init && init.headers ? init.headers : {});
                    const match = /^bytes=(\d+)-(\d+)$/.exec(headers.get("Range") || "");
                    const start = match ? Number(match[1]) : 0;
                    const requestedEnd = match ? Number(match[2]) : 4095;
                    const end = Math.min(4095, requestedEnd);
                    const bytes = createBytes(Math.max(0, end - start + 1), start);
                    return new Response(bytes, {
                        status: 206,
                        headers: {
                            "Content-Length": String(bytes.byteLength),
                            "Content-Range": "bytes " + start + "-" + end + "/4096"
                        }
                    });
                }
                if (url === "https://fixture.invalid/hidden-range-size") {
                    const method = String(init && init.method ? init.method : "GET").toUpperCase();
                    if (method === "HEAD") {
                        return new Response(null, {
                            status: 200,
                            headers: { "Content-Length": "4096" }
                        });
                    }
                    const headers = new Headers(init && init.headers ? init.headers : {});
                    const match = /^bytes=(\d+)-(\d+)$/.exec(headers.get("Range") || "");
                    const start = match ? Number(match[1]) : 0;
                    const requestedEnd = match ? Number(match[2]) : 4095;
                    const end = Math.min(4095, requestedEnd);
                    const bytes = createBytes(Math.max(0, end - start + 1), start);
                    return new Response(bytes, {
                        status: 206,
                        headers: { "Content-Length": String(bytes.byteLength) }
                    });
                }
                if (url === "https://fixture.invalid/no-range") {
                    const size = 3 * 1024 * 1024;
                    const bytes = createBytes(size, 0);
                    return new Response(bytes, {
                        status: 200,
                        headers: {
                            "Content-Length": String(size),
                            "Content-Disposition": "attachment; filename=\"large-fixture.bin\""
                        }
                    });
                }
                return originalFetch(input, init);
            };
            return {
                restore: function() {
                    if (globalThis.fetch !== originalFetch) globalThis.fetch = originalFetch;
                }
            };
        })()
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun restoreHttpSourceFetchFixture(fixture: JsAny): Unit =
    js(
        """
        {
            fixture.restore();
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun createRevokedBrowserFile(): File =
    js(
        """
        (function() {
            const file = new File([new Uint8Array(32)], "revoked-fixture.mkv");
            file.slice = function() {
                return {
                    arrayBuffer: function() {
                        return Promise.reject(new DOMException("File permission was revoked.", "NotReadableError"));
                    }
                };
            };
            return file;
        })()
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun createVirtualLargeBrowserFile(): File =
    js(
        """
        (function() {
            return {
                name: "virtual-large.mp4",
                size: 90 * 1024 * 1024 * 1024 + 321,
                lastModified: 1,
                slice: function(start, end) {
                    globalThis.__moviVirtualLargeFileOffset = start;
                    const length = Math.max(0, end - start);
                    const bytes = new Uint8Array(length);
                    for (let index = 0; index < length; index++) {
                        bytes[index] = (start + index) & 255;
                    }
                    return { arrayBuffer: async function() { return bytes.buffer; } };
                }
            };
        })()
        """,
    )

private fun virtualLargeFileLastReadOffset(): Double =
    js("Number(globalThis.__moviVirtualLargeFileOffset || 0)")

private fun clearVirtualLargeBrowserFileState() {
    js("delete globalThis.__moviVirtualLargeFileOffset")
}

private fun expectedHttpFixtureBytes(
    offset: Int,
    length: Int,
): ByteArray =
    ByteArray(length) { index -> ((offset + index) * 17 + 11).toByte() }

private const val RETRY_SOURCE_URL = "https://fixture.invalid/retry-range"
private const val HIDDEN_RANGE_SIZE_URL = "https://fixture.invalid/hidden-range-size"
private const val NO_RANGE_SOURCE_URL = "https://fixture.invalid/no-range"
private const val NO_RANGE_FIXTURE_SIZE = 3 * 1024 * 1024
private const val VIRTUAL_LARGE_FILE_SIZE: Long = 96_636_764_481L
