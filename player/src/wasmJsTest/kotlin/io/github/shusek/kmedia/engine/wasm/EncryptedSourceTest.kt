@file:OptIn(ExperimentalWasmJsInterop::class)

package io.github.shusek.kmedia.engine.wasm

import kotlinx.coroutines.test.runTest
import kotlin.js.ExperimentalWasmJsInterop
import kotlin.js.JsAny
import kotlin.js.js
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue
import kotlin.time.Duration.Companion.seconds

class EncryptedSourceTest {
    @Test
    fun localFakeEcdhAndAesGcmTransportSupportsRangeCacheAndClose() =
        runTest(timeout = 30.seconds) {
            val fixture = installEncryptedFetchFixture(ENCRYPTED_FIXTURE_SIZE)
            val source =
                EncryptedHttpSource(
                    EncryptedSourceConfig(
                        videoUrl = ENCRYPTED_VIDEO_URL,
                        tokenUrl = ENCRYPTED_TOKEN_URL,
                        videoId = "fixture-video",
                        fingerprint = "fixture-fingerprint",
                        sessionToken = "fixture-session",
                    ),
                    CacheConfig(maximumBytes = 4L * 1024L * 1024L),
                )
            try {
                assertEquals(ENCRYPTED_FIXTURE_SIZE.toLong(), source.getSize())
                assertEquals("encrypted-fixture.bin", source.contentDispositionFilename)
                val first = source.read(offset = 137, length = 511)
                val second = source.read(offset = 137, length = 511)
                assertEquals(expectedEncryptedFixtureBytes(137, 511).toList(), first.toList())
                assertEquals(first.toList(), second.toList())
                assertTrue(source.cacheStats.hits > 0)
                assertTrue(source.cacheStats.misses > 0)
                assertTrue(source.networkStats.requestCount >= 2)
                assertTrue(source.networkStats.bytesDownloaded > 0)
                assertEquals(777L, source.seek(777))

                source.close()
                val error = assertFailsWith<WasmMediaError> { source.read(0, 1) }
                assertEquals(WasmMediaErrorCode.CANCELLED, error.code)
            } finally {
                source.close()
                restoreEncryptedFetchFixture(fixture)
            }
        }
}

@Suppress("UNUSED_PARAMETER")
private fun installEncryptedFetchFixture(size: Int): JsAny =
    js(
        """
        (function() {
            const originalFetch = globalThis.fetch;
            const textEncoder = new TextEncoder();
            const plaintext = new Uint8Array(size);
            for (let index = 0; index < plaintext.length; index++) {
                plaintext[index] = (index * 31 + 7) & 255;
            }
            let masterKey = null;
            const decodeBase64 = function(value) {
                const binary = atob(value);
                const result = new Uint8Array(binary.length);
                for (let index = 0; index < binary.length; index++) {
                    result[index] = binary.charCodeAt(index);
                }
                return result;
            };
            const encodeBase64 = function(bytes) {
                let binary = "";
                for (let index = 0; index < bytes.length; index++) {
                    binary += String.fromCharCode(bytes[index]);
                }
                return btoa(binary);
            };
            globalThis.fetch = async function(input, init) {
                const url = String(input && input.url ? input.url : input);
                if (url === "https://fixture.invalid/token") {
                    const request = JSON.parse(String(init && init.body ? init.body : "{}"));
                    const clientPublicKey = await crypto.subtle.importKey(
                        "raw",
                        decodeBase64(request.clientPubKey),
                        { name: "ECDH", namedCurve: "P-256" },
                        false,
                        []
                    );
                    const serverPair = await crypto.subtle.generateKey(
                        { name: "ECDH", namedCurve: "P-256" },
                        true,
                        ["deriveBits"]
                    );
                    const sharedBits = await crypto.subtle.deriveBits(
                        { name: "ECDH", public: clientPublicKey },
                        serverPair.privateKey,
                        256
                    );
                    const shared = await crypto.subtle.importKey(
                        "raw",
                        sharedBits,
                        { name: "HKDF" },
                        false,
                        ["deriveBits"]
                    );
                    const salt = new Uint8Array(32);
                    const masterBits = await crypto.subtle.deriveBits(
                        {
                            name: "HKDF",
                            hash: "SHA-256",
                            salt,
                            info: textEncoder.encode("enc:master-aes")
                        },
                        shared,
                        256
                    );
                    masterKey = await crypto.subtle.importKey(
                        "raw",
                        masterBits,
                        { name: "AES-GCM" },
                        false,
                        ["encrypt"]
                    );
                    const serverPublic = new Uint8Array(
                        await crypto.subtle.exportKey("raw", serverPair.publicKey)
                    );
                    return new Response(
                        JSON.stringify({
                            token: "fixture-token",
                            serverPubKey: encodeBase64(serverPublic),
                            hkdfSalt: encodeBase64(salt),
                            fileSize: plaintext.byteLength,
                            contentDispositionFilename: "encrypted-fixture.bin",
                            expiresAt: Date.now() + 60000
                        }),
                        { status: 200, headers: { "Content-Type": "application/json" } }
                    );
                }
                if (url === "https://fixture.invalid/video") {
                    if (!masterKey) return new Response("", { status: 401 });
                    const headers = new Headers(init && init.headers ? init.headers : {});
                    const match = /^bytes=(\d+)-(\d+)$/.exec(headers.get("Range") || "");
                    if (!match) return new Response("", { status: 416 });
                    const start = Math.max(0, Number(match[1]));
                    const end = Math.min(plaintext.byteLength - 1, Number(match[2]));
                    const clear = plaintext.slice(start, end + 1);
                    const iv = new Uint8Array(12);
                    crypto.getRandomValues(iv);
                    const encrypted = new Uint8Array(
                        await crypto.subtle.encrypt({ name: "AES-GCM", iv }, masterKey, clear)
                    );
                    const frameLength = iv.byteLength + encrypted.byteLength;
                    const framed = new Uint8Array(4 + frameLength);
                    new DataView(framed.buffer).setUint32(0, frameLength, false);
                    framed.set(iv, 4);
                    framed.set(encrypted, 4 + iv.byteLength);
                    return new Response(framed, {
                        status: 206,
                        headers: {
                            "Content-Type": "application/octet-stream",
                            "Content-Range":
                                "bytes " + start + "-" + end + "/" + plaintext.byteLength
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
private fun restoreEncryptedFetchFixture(fixture: JsAny): Unit =
    js(
        """
        {
            fixture.restore();
        }
        """,
    )

private fun expectedEncryptedFixtureBytes(
    offset: Int,
    length: Int,
): ByteArray =
    ByteArray(length) { index -> ((offset + index) * 31 + 7).toByte() }

private const val ENCRYPTED_FIXTURE_SIZE = 8_192
private const val ENCRYPTED_VIDEO_URL = "https://fixture.invalid/video"
private const val ENCRYPTED_TOKEN_URL = "https://fixture.invalid/token"
