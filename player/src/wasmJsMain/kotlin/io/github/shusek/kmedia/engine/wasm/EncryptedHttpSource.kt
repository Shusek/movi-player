@file:OptIn(ExperimentalWasmJsInterop::class)

package io.github.shusek.kmedia.engine.wasm

import kotlinx.coroutines.CompletableDeferred
import org.khronos.webgl.Int8Array
import org.khronos.webgl.toByteArray
import kotlin.js.ExperimentalWasmJsInterop
import kotlin.js.JsAny
import kotlin.js.js

/**
 * Random-access source for the movi ECDH P-256 + HKDF + framed AES-256-GCM
 * transport. Authentication material and derived keys never leave the private
 * browser-side bridge and are deliberately excluded from errors and diagnostics.
 */
public class EncryptedHttpSource(
    public val config: EncryptedSourceConfig,
    public val cacheConfig: CacheConfig = CacheConfig(),
) : SourceAdapter {
    private val bridge: JsAny =
        createEncryptedSourceBridge(
            videoUrl = config.videoUrl,
            tokenUrl = config.tokenUrl,
            videoId = config.videoId,
            fingerprint = config.fingerprint,
            sessionToken = config.sessionToken,
            headersJson = config.headers.toEncryptedHeadersJson(),
            refreshSeconds = config.tokenRefreshIntervalSeconds,
            maximumCacheBytes = cacheConfig.maximumBytes.toDouble(),
            onAuthenticationFailed = { reason ->
                config.onAuthenticationFailed?.invoke(redactSensitiveText(reason))
            },
        )
    private var currentPosition: Long = 0L
    private var closed: Boolean = false
    private var listener: SourceAdapterListener? = null

    override val key: String
        get() = "encrypted:${stableEncryptedSourceKey(config.videoId)}"

    override val position: Long
        get() = currentPosition

    override val supportsRandomAccess: Boolean
        get() = true

    override val sourceMode: SourceMode
        get() = SourceMode.RANGE

    override val contentDispositionFilename: String?
        get() = encryptedContentDispositionFilename(bridge).ifBlank { null }

    override val cacheStats: CacheStats
        get() =
            CacheStats(
                bytesStored = encryptedCacheBytes(bridge).toLong(),
                maximumBytes = cacheConfig.maximumBytes,
                hits = encryptedCacheHits(bridge).toLong(),
                misses = encryptedCacheMisses(bridge).toLong(),
            )

    override val networkStats: NetworkStats
        get() =
            NetworkStats(
                bytesDownloaded = encryptedNetworkBytes(bridge).toLong(),
                requestCount = encryptedNetworkRequests(bridge).toLong(),
                retryCount = encryptedNetworkRetries(bridge).toLong(),
                throughputBitsPerSecond =
                    encryptedNetworkThroughput(bridge)
                        .takeIf(Double::isFinite)
                        ?.takeIf { it >= 0.0 }
                        ?.toLong(),
            )

    override suspend fun getSize(): Long {
        ensureOpen()
        val deferred = CompletableDeferred<Long>()
        encryptedSourceGetSize(
            bridge = bridge,
            onComplete = { value -> deferred.complete(value.toLong()) },
            onError = { message ->
                deferred.completeExceptionally(message.toEncryptedSourceError())
            },
        )
        return deferred.await().also { notifyStatistics() }
    }

    override suspend fun read(
        offset: Long,
        length: Int,
    ): ByteArray {
        ensureOpen()
        require(offset >= 0L) { "offset must be non-negative." }
        if (length <= 0) return ByteArray(0)
        val deferred = CompletableDeferred<ByteArray>()
        encryptedSourceRead(
            bridge = bridge,
            offset = offset.toDouble(),
            length = length,
            onComplete = { bytes -> deferred.complete(bytes.toByteArray()) },
            onError = { message ->
                deferred.completeExceptionally(message.toEncryptedSourceError())
            },
        )
        return deferred.await().also { bytes ->
            currentPosition = offset + bytes.size
            notifyStatistics()
        }
    }

    override fun seek(offset: Long): Long =
        offset.coerceAtLeast(0L).also {
            cancelEncryptedSourceRequests(bridge)
            currentPosition = it
        }

    override fun setListener(listener: SourceAdapterListener?) {
        this.listener = listener
        listener?.onSourceModeChanged(SourceMode.RANGE)
        notifyStatistics()
    }

    override fun fork(): SourceAdapter = EncryptedHttpSource(config, cacheConfig)

    override fun close() {
        if (closed) return
        closed = true
        closeEncryptedSourceBridge(bridge)
    }

    override fun toString(): String = "EncryptedHttpSource(<redacted>)"

    private fun ensureOpen() {
        if (closed) {
            throw WasmMediaError(
                WasmMediaErrorCategory.SOURCE,
                WasmMediaErrorCode.CANCELLED,
                "The encrypted source is closed.",
            )
        }
    }

    private fun notifyStatistics() {
        listener?.onStatisticsChanged(cacheStats, networkStats)
    }
}

private fun String.toEncryptedSourceError(): WasmMediaError {
    val safe = redactSensitiveText(this)
    val authentication = safe.startsWith("AUTHENTICATION_FAILED")
    return WasmMediaError(
        category = if (authentication) WasmMediaErrorCategory.SOURCE else WasmMediaErrorCategory.NETWORK,
        code = if (authentication) WasmMediaErrorCode.AUTHENTICATION_FAILED else WasmMediaErrorCode.ENCRYPTION_FAILED,
        message =
            if (authentication) {
                "Encrypted-source authentication failed."
            } else if (safe.startsWith("CANCELLED")) {
                "The encrypted-source request was cancelled."
            } else {
                "The encrypted media request or decryption failed."
            },
    )
}

private fun Map<String, String>.toEncryptedHeadersJson(): String =
    entries.joinToString(prefix = "{", postfix = "}") { (key, value) ->
        "\"${key.encryptedJsonEscape()}\":\"${value.encryptedJsonEscape()}\""
    }

private fun String.encryptedJsonEscape(): String =
    replace("\\", "\\\\")
        .replace("\"", "\\\"")
        .replace("\n", "\\n")
        .replace("\r", "\\r")

private fun stableEncryptedSourceKey(value: String): String {
    var hash = 0x811c9dc5u
    value.forEach { character ->
        hash = (hash xor character.code.toUInt()) * 0x01000193u
    }
    return hash.toString(16)
}

@Suppress("UNUSED_PARAMETER", "LongParameterList")
private fun createEncryptedSourceBridge(
    videoUrl: String,
    tokenUrl: String,
    videoId: String,
    fingerprint: String,
    sessionToken: String,
    headersJson: String,
    refreshSeconds: Int,
    maximumCacheBytes: Double,
    onAuthenticationFailed: (String) -> Unit,
): JsAny =
    js(
        """
        (function() {
            const BLOCK_SIZE = 2 * 1024 * 1024;
            const MAX_ATTEMPTS = 4;
            let parsedHeaders = {};
            try { parsedHeaders = JSON.parse(headersJson || "{}") || {}; } catch (_) {}
            const state = {
                closed: false,
                abortController: new AbortController(),
                headers: parsedHeaders,
                privateKey: null,
                publicKey: "",
                masterKey: null,
                hmacKey: null,
                token: "",
                expiresAt: 0,
                fileSize: -1,
                contentDispositionFilename: "",
                tokenPromise: null,
                initPromise: null,
                cache: new Map(),
                inflight: new Map(),
                cacheBytes: 0,
                maxCacheBytes: Math.max(BLOCK_SIZE, Number(maximumCacheBytes || BLOCK_SIZE)),
                hits: 0,
                misses: 0,
                networkBytes: 0,
                networkRequests: 0,
                networkRetries: 0,
                networkMilliseconds: 0
            };
            const textEncoder = new TextEncoder();
            const base64Encode = function(bytes) {
                let binary = "";
                for (let index = 0; index < bytes.length; index++) {
                    binary += String.fromCharCode(bytes[index]);
                }
                return btoa(binary);
            };
            const base64Decode = function(value) {
                const binary = atob(String(value || ""));
                const bytes = new Uint8Array(binary.length);
                for (let index = 0; index < binary.length; index++) {
                    bytes[index] = binary.charCodeAt(index);
                }
                return bytes;
            };
            const hex = function(bytes) {
                let result = "";
                for (let index = 0; index < bytes.length; index++) {
                    result += bytes[index].toString(16).padStart(2, "0");
                }
                return result;
            };
            const randomNonce = function() {
                const bytes = new Uint8Array(16);
                crypto.getRandomValues(bytes);
                return hex(bytes);
            };
            const authFailure = function() {
                try { onAuthenticationFailed("AUTHENTICATION_FAILED"); } catch (_) {}
                const error = new Error("AUTHENTICATION_FAILED");
                error.authenticationFailure = true;
                return error;
            };
            const safeFailure = function(error) {
                if (state.closed || (error && error.name === "AbortError")) return "CANCELLED";
                if (error && error.authenticationFailure) return "AUTHENTICATION_FAILED";
                return "ENCRYPTION_FAILED";
            };
            const delay = milliseconds =>
                new Promise(resolve => setTimeout(resolve, milliseconds));
            const waitUntilOnline = async function() {
                if (typeof navigator === "undefined" || navigator.onLine !== false) return;
                await new Promise(resolve => {
                    const done = function() {
                        globalThis.removeEventListener("online", done);
                        resolve();
                    };
                    globalThis.addEventListener("online", done, { once: true });
                    setTimeout(done, 4000);
                });
            };
            const initialize = async function() {
                const pair = await crypto.subtle.generateKey(
                    { name: "ECDH", namedCurve: "P-256" },
                    true,
                    ["deriveBits"]
                );
                const rawPublic = new Uint8Array(
                    await crypto.subtle.exportKey("raw", pair.publicKey)
                );
                state.publicKey = base64Encode(rawPublic);
                const privatePkcs8 = await crypto.subtle.exportKey("pkcs8", pair.privateKey);
                state.privateKey = await crypto.subtle.importKey(
                    "pkcs8",
                    privatePkcs8,
                    { name: "ECDH", namedCurve: "P-256" },
                    false,
                    ["deriveBits"]
                );
            };
            state.initPromise = initialize();
            const refreshToken = async function() {
                await state.initPromise;
                if (state.closed) throw new DOMException("Closed", "AbortError");
                state.networkRequests++;
                const started = performance.now();
                let response;
                try {
                    response = await fetch(tokenUrl, {
                        method: "POST",
                        headers: Object.assign(
                            {
                                "Content-Type": "application/json",
                                "Authorization": "Bearer " + sessionToken
                            },
                            state.headers
                        ),
                        body: JSON.stringify({
                            url: videoId,
                            videoId: videoId,
                            fingerprint: fingerprint,
                            clientPubKey: state.publicKey
                        }),
                        credentials: "include",
                        signal: state.abortController.signal
                    });
                } finally {
                    state.networkMilliseconds += performance.now() - started;
                }
                if (response.status === 401 || response.status === 403) throw authFailure();
                if (!response.ok) throw new Error("Token request failed");
                const data = await response.json();
                if (
                    !data ||
                    typeof data.token !== "string" ||
                    typeof data.serverPubKey !== "string" ||
                    typeof data.fileSize !== "number"
                ) {
                    throw new Error("Invalid token response");
                }
                const serverKey = await crypto.subtle.importKey(
                    "raw",
                    base64Decode(data.serverPubKey),
                    { name: "ECDH", namedCurve: "P-256" },
                    false,
                    []
                );
                const sharedBits = await crypto.subtle.deriveBits(
                    { name: "ECDH", public: serverKey },
                    state.privateKey,
                    256
                );
                const shared = await crypto.subtle.importKey(
                    "raw",
                    sharedBits,
                    { name: "HKDF" },
                    false,
                    ["deriveBits"]
                );
                const salt =
                    typeof data.hkdfSalt === "string"
                        ? base64Decode(data.hkdfSalt)
                        : new Uint8Array(32);
                const masterBits = await crypto.subtle.deriveBits(
                    {
                        name: "HKDF",
                        hash: "SHA-256",
                        salt: salt,
                        info: textEncoder.encode("enc:master-aes")
                    },
                    shared,
                    256
                );
                const hmacBits = await crypto.subtle.deriveBits(
                    {
                        name: "HKDF",
                        hash: "SHA-256",
                        salt: salt,
                        info: textEncoder.encode("enc:req-hmac")
                    },
                    shared,
                    256
                );
                state.masterKey = await crypto.subtle.importKey(
                    "raw",
                    masterBits,
                    { name: "AES-GCM" },
                    false,
                    ["decrypt"]
                );
                state.hmacKey = await crypto.subtle.importKey(
                    "raw",
                    hmacBits,
                    { name: "HMAC", hash: "SHA-256" },
                    false,
                    ["sign"]
                );
                state.token = data.token;
                state.fileSize = Math.max(0, Number(data.fileSize));
                if (
                    !state.contentDispositionFilename &&
                    typeof data.contentDispositionFilename === "string"
                ) {
                    state.contentDispositionFilename =
                        data.contentDispositionFilename
                            .replace(/[\u0000-\u001f\u007f]/g, "")
                            .slice(0, 512);
                }
                const configuredExpiry = Date.now() + Math.max(1, refreshSeconds) * 1000;
                state.expiresAt = Math.min(
                    Number(data.expiresAt || configuredExpiry),
                    configuredExpiry
                );
            };
            const ensureToken = async function(force) {
                if (
                    !force &&
                    state.token &&
                    state.masterKey &&
                    state.hmacKey &&
                    Date.now() + 500 < state.expiresAt
                ) return;
                if (!state.tokenPromise) {
                    state.tokenPromise = refreshToken().finally(function() {
                        state.tokenPromise = null;
                    });
                }
                await state.tokenPromise;
            };
            const remember = function(index, bytes) {
                const previous = state.cache.get(index);
                if (previous) state.cacheBytes -= previous.byteLength;
                state.cache.delete(index);
                state.cache.set(index, bytes);
                state.cacheBytes += bytes.byteLength;
                while (state.cacheBytes > state.maxCacheBytes && state.cache.size > 1) {
                    const oldestIndex = state.cache.keys().next().value;
                    const oldest = state.cache.get(oldestIndex);
                    state.cache.delete(oldestIndex);
                    state.cacheBytes -= oldest.byteLength;
                }
            };
            const decryptResponse = async function(response, sessionKey) {
                const encrypted = new Uint8Array(await response.arrayBuffer());
                state.networkBytes += encrypted.byteLength;
                const blocks = [];
                let position = 0;
                while (position + 4 <= encrypted.byteLength) {
                    const length =
                        (
                            (encrypted[position] << 24) |
                            (encrypted[position + 1] << 16) |
                            (encrypted[position + 2] << 8) |
                            encrypted[position + 3]
                        ) >>> 0;
                    position += 4;
                    if (length < 28 || position + length > encrypted.byteLength) {
                        throw new Error("Invalid encrypted frame");
                    }
                    const iv = encrypted.slice(position, position + 12);
                    const cipherText = encrypted.slice(position + 12, position + length);
                    position += length;
                    const plaintext = await crypto.subtle.decrypt(
                        { name: "AES-GCM", iv: iv },
                        sessionKey,
                        cipherText
                    );
                    blocks.push(new Uint8Array(plaintext));
                }
                if (position !== encrypted.byteLength || blocks.length === 0) {
                    throw new Error("Truncated encrypted response");
                }
                const total = blocks.reduce((sum, block) => sum + block.byteLength, 0);
                const result = new Uint8Array(total);
                let offset = 0;
                for (const block of blocks) {
                    result.set(block, offset);
                    offset += block.byteLength;
                }
                return result;
            };
            const requestBlock = async function(index, forceTokenRefresh) {
                await ensureToken(Boolean(forceTokenRefresh));
                if (state.closed) throw new DOMException("Closed", "AbortError");
                const start = index * BLOCK_SIZE;
                if (state.fileSize >= 0 && start >= state.fileSize) return new Uint8Array(0);
                const end = Math.min(start + BLOCK_SIZE, state.fileSize) - 1;
                const length = end - start + 1;
                const tokenSnapshot = state.token;
                const masterKeySnapshot = state.masterKey;
                const hmacKeySnapshot = state.hmacKey;
                const nonce = randomNonce();
                const timestamp = Date.now();
                const message = "GET:" + tokenSnapshot + ":" + nonce + ":" +
                    timestamp + ":" + start + ":" + length;
                const signature = new Uint8Array(
                    await crypto.subtle.sign(
                        "HMAC",
                        hmacKeySnapshot,
                        textEncoder.encode(message)
                    )
                );
                state.networkRequests++;
                const started = performance.now();
                let response;
                try {
                    response = await fetch(videoUrl, {
                        method: "GET",
                        headers: Object.assign(
                            {
                                "Range": "bytes=" + start + "-" + end,
                                "X-Token": tokenSnapshot,
                                "X-Fingerprint": fingerprint,
                                "X-Nonce": nonce,
                                "X-Timestamp": String(timestamp),
                                "X-Signature": hex(signature)
                            },
                            state.headers
                        ),
                        credentials: "include",
                        signal: state.abortController.signal
                    });
                } finally {
                    state.networkMilliseconds += performance.now() - started;
                }
                if (response.status === 401 || response.status === 403) {
                    state.token = "";
                    state.expiresAt = 0;
                    if (!forceTokenRefresh) return requestBlock(index, true);
                    throw authFailure();
                }
                if (!response.ok && response.status !== 206) {
                    const error = new Error("Encrypted range request failed");
                    error.retryable =
                        response.status === 408 ||
                        response.status === 425 ||
                        response.status === 429 ||
                        response.status >= 500;
                    throw error;
                }
                return decryptResponse(response, masterKeySnapshot);
            };
            const fetchBlock = async function(index) {
                const cached = state.cache.get(index);
                if (cached) {
                    state.hits++;
                    state.cache.delete(index);
                    state.cache.set(index, cached);
                    return cached;
                }
                const existing = state.inflight.get(index);
                if (existing) {
                    state.hits++;
                    return existing;
                }
                state.misses++;
                const operation = (async function() {
                    let lastError = null;
                    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
                        try {
                            const bytes = await requestBlock(index, false);
                            remember(index, bytes);
                            return bytes;
                        } catch (error) {
                            lastError = error;
                            if (
                                state.closed ||
                                (error && error.authenticationFailure) ||
                                (error && error.name === "AbortError") ||
                                (error && error.retryable === false)
                            ) throw error;
                            if (attempt === MAX_ATTEMPTS - 1) throw error;
                            state.networkRetries++;
                            await waitUntilOnline();
                            await delay(150 * (attempt + 1));
                        }
                    }
                    throw lastError || new Error("Encrypted block request failed");
                })();
                operation.finally(function() {
                    if (state.inflight.get(index) === operation) {
                        state.inflight.delete(index);
                    }
                }).catch(function() {});
                state.inflight.set(index, operation);
                return operation;
            };
            state.getSize = async function() {
                await ensureToken(false);
                return state.fileSize;
            };
            state.read = async function(offset, length) {
                await ensureToken(false);
                const start = Math.max(0, Math.floor(offset));
                const available =
                    state.fileSize >= 0
                        ? Math.max(0, Math.min(Math.floor(length), state.fileSize - start))
                        : Math.max(0, Math.floor(length));
                if (available <= 0) return new Uint8Array(0);
                const firstBlock = Math.floor(start / BLOCK_SIZE);
                const lastBlock = Math.floor((start + available - 1) / BLOCK_SIZE);
                const blocks = [];
                for (let index = firstBlock; index <= lastBlock; index++) {
                    blocks.push(await fetchBlock(index));
                }
                const result = new Uint8Array(available);
                let outputOffset = 0;
                for (let index = firstBlock; index <= lastBlock; index++) {
                    const block = blocks[index - firstBlock];
                    const localStart = index === firstBlock ? start - index * BLOCK_SIZE : 0;
                    const count = Math.min(block.byteLength - localStart, available - outputOffset);
                    if (count > 0) result.set(block.subarray(localStart, localStart + count), outputOffset);
                    outputOffset += Math.max(0, count);
                }
                const prefetchLimit = Math.min(
                    Math.ceil(state.maxCacheBytes / BLOCK_SIZE),
                    4
                );
                for (let lookahead = 1; lookahead <= prefetchLimit; lookahead++) {
                    const next = lastBlock + lookahead;
                    if (next * BLOCK_SIZE >= state.fileSize) break;
                    if (!state.cache.has(next) && !state.inflight.has(next)) {
                        fetchBlock(next).catch(function() {});
                    }
                }
                return outputOffset === result.byteLength ? result : result.slice(0, outputOffset);
            };
            state.safeFailure = safeFailure;
            return state;
        })()
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun encryptedSourceGetSize(
    bridge: JsAny,
    onComplete: (Double) -> Unit,
    onError: (String) -> Unit,
): Unit =
    js(
        """
        {
            bridge.getSize()
                .then(function(size) { onComplete(Number(size)); })
                .catch(function(error) { onError(bridge.safeFailure(error)); });
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun encryptedSourceRead(
    bridge: JsAny,
    offset: Double,
    length: Int,
    onComplete: (Int8Array) -> Unit,
    onError: (String) -> Unit,
): Unit =
    js(
        """
        {
            bridge.read(offset, length)
                .then(function(bytes) { onComplete(new Int8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength)); })
                .catch(function(error) { onError(bridge.safeFailure(error)); });
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun cancelEncryptedSourceRequests(bridge: JsAny): Unit =
    js(
        """
        {
            if (bridge.closed) return;
            try { bridge.abortController.abort(); } catch (_) {}
            bridge.abortController = new AbortController();
            bridge.inflight.clear();
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun closeEncryptedSourceBridge(bridge: JsAny): Unit =
    js(
        """
        {
            if (bridge.closed) return;
            bridge.closed = true;
            try { bridge.abortController.abort(); } catch (_) {}
            bridge.token = "";
            bridge.expiresAt = 0;
            bridge.privateKey = null;
            bridge.masterKey = null;
            bridge.hmacKey = null;
            bridge.publicKey = "";
            bridge.cache.clear();
            bridge.inflight.clear();
            bridge.cacheBytes = 0;
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun encryptedCacheBytes(bridge: JsAny): Double = js("Number(bridge.cacheBytes || 0)")

@Suppress("UNUSED_PARAMETER")
private fun encryptedCacheHits(bridge: JsAny): Double = js("Number(bridge.hits || 0)")

@Suppress("UNUSED_PARAMETER")
private fun encryptedCacheMisses(bridge: JsAny): Double = js("Number(bridge.misses || 0)")

@Suppress("UNUSED_PARAMETER")
private fun encryptedNetworkBytes(bridge: JsAny): Double = js("Number(bridge.networkBytes || 0)")

@Suppress("UNUSED_PARAMETER")
private fun encryptedNetworkRequests(bridge: JsAny): Double = js("Number(bridge.networkRequests || 0)")

@Suppress("UNUSED_PARAMETER")
private fun encryptedNetworkRetries(bridge: JsAny): Double = js("Number(bridge.networkRetries || 0)")

@Suppress("UNUSED_PARAMETER")
private fun encryptedNetworkThroughput(bridge: JsAny): Double =
    js(
        """
        bridge.networkMilliseconds > 0
            ? bridge.networkBytes * 8 * 1000 / bridge.networkMilliseconds
            : -1
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun encryptedContentDispositionFilename(bridge: JsAny): String =
    js("String(bridge.contentDispositionFilename || '')")
