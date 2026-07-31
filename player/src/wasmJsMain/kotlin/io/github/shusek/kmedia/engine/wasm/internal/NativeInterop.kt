@file:OptIn(ExperimentalWasmJsInterop::class)

package io.github.shusek.kmedia.engine.wasm.internal

import io.github.shusek.kmedia.engine.wasm.WasmMediaError
import io.github.shusek.kmedia.engine.wasm.WasmMediaErrorCategory
import io.github.shusek.kmedia.engine.wasm.WasmMediaErrorCode
import io.github.shusek.kmedia.engine.wasm.WasmRuntimeConfig
import kotlinx.coroutines.CompletableDeferred
import org.khronos.webgl.ArrayBuffer
import org.khronos.webgl.DataView
import org.khronos.webgl.Float32Array
import org.khronos.webgl.Int8Array
import org.khronos.webgl.Uint8Array
import kotlin.js.ExperimentalWasmJsInterop
import kotlin.js.JsAny
import kotlin.js.js

internal external interface NativeModule : JsAny {
    val HEAPU8: Uint8Array
    val HEAPF32: Float32Array

    fun _malloc(size: Int): Int

    fun _free(pointer: Int)

    fun _movi_create(): Int

    fun _movi_destroy(context: Int)

    fun _movi_set_file_size(
        context: Int,
        sizeLow: Int,
        sizeHigh: Int,
    )

    fun _movi_get_duration(context: Int): Double

    fun _movi_get_start_time(context: Int): Double

    fun _movi_get_stream_count(context: Int): Int

    fun _movi_get_stream_info(
        context: Int,
        streamIndex: Int,
        infoPointer: Int,
    ): Int

    fun _movi_get_extradata(
        context: Int,
        streamIndex: Int,
        buffer: Int,
        bufferSize: Int,
    ): Int

    fun _movi_get_format_name(
        context: Int,
        buffer: Int,
        bufferSize: Int,
    ): Int

    fun _movi_get_metadata_title(
        context: Int,
        buffer: Int,
        bufferSize: Int,
    ): Int

    fun _movi_get_chapter_count(context: Int): Int

    fun _movi_get_chapter_start(
        context: Int,
        index: Int,
    ): Double

    fun _movi_get_chapter_end(
        context: Int,
        index: Int,
    ): Double

    fun _movi_get_chapter_title(
        context: Int,
        index: Int,
        buffer: Int,
        bufferSize: Int,
    ): Int

    fun _movi_get_chapter_id(
        context: Int,
        index: Int,
        buffer: Int,
        bufferSize: Int,
    ): Int

    fun _movi_get_chapter_language(
        context: Int,
        index: Int,
        buffer: Int,
        bufferSize: Int,
    ): Int

    fun _movi_get_chapter_hidden(
        context: Int,
        index: Int,
    ): Int

    fun _movi_get_attachment_count(context: Int): Int

    fun _movi_get_attachment_stream_index(
        context: Int,
        index: Int,
    ): Int

    fun _movi_get_attachment_size(
        context: Int,
        index: Int,
    ): Int

    fun _movi_get_attachment_name(
        context: Int,
        index: Int,
        buffer: Int,
        bufferSize: Int,
    ): Int

    fun _movi_get_attachment_mime_type(
        context: Int,
        index: Int,
        buffer: Int,
        bufferSize: Int,
    ): Int

    fun _movi_get_attachment_data(
        context: Int,
        index: Int,
        buffer: Int,
        bufferSize: Int,
    ): Int

    fun _movi_set_log_level(level: Int)

    fun _movi_set_stream_discard(
        context: Int,
        streamIndex: Int,
        discard: Int,
    )

    fun _movi_enable_decoder(
        context: Int,
        streamIndex: Int,
        extradata: Int,
        extradataSize: Int,
    ): Int

    fun _movi_send_packet(
        context: Int,
        streamIndex: Int,
        data: Int,
        size: Int,
        pts: Double,
        dts: Double,
        keyframe: Int,
    ): Int

    fun _movi_receive_frame(
        context: Int,
        streamIndex: Int,
    ): Int

    fun _movi_decode_audio_batch(
        context: Int,
        streamIndex: Int,
        blob: Int,
        sizes: Int,
        timestamps: Int,
        count: Int,
    ): Int

    fun _movi_audio_batch_samples(context: Int): Int

    fun _movi_audio_batch_channels(context: Int): Int

    fun _movi_audio_batch_sample_rate(context: Int): Int

    fun _movi_audio_batch_pts(context: Int): Double

    fun _movi_audio_batch_plane(
        context: Int,
        channel: Int,
    ): Int

    fun _movi_get_frame_width(context: Int): Int

    fun _movi_get_frame_height(context: Int): Int

    fun _movi_get_frame_format(context: Int): Int

    fun _movi_get_frame_data(
        context: Int,
        plane: Int,
    ): Int

    fun _movi_get_frame_linesize(
        context: Int,
        plane: Int,
    ): Int

    fun _movi_get_frame_samples(context: Int): Int

    fun _movi_get_frame_channels(context: Int): Int

    fun _movi_get_frame_sample_rate(context: Int): Int

    fun _movi_get_frame_pts(
        context: Int,
        streamIndex: Int,
    ): Double

    fun _movi_flush_decoder(
        context: Int,
        streamIndex: Int,
    )

    fun _movi_set_skip_frame(
        context: Int,
        streamIndex: Int,
        discard: Int,
    )

    fun _movi_enable_audio_downmix(
        context: Int,
        enabled: Int,
    )

    fun _movi_get_frame_rgba(
        context: Int,
        targetWidth: Int,
        targetHeight: Int,
    ): Int

    fun _movi_get_frame_rgba_size(context: Int): Int

    fun _movi_get_frame_rgba_linesize(context: Int): Int

    fun _movi_decode_subtitle(
        context: Int,
        streamIndex: Int,
        data: Int,
        size: Int,
        pts: Double,
        duration: Double,
    ): Int

    fun _movi_get_subtitle_text(
        context: Int,
        buffer: Int,
        bufferSize: Int,
    ): Int

    fun _movi_get_subtitle_times(
        context: Int,
        start: Int,
        end: Int,
    ): Int

    fun _movi_get_subtitle_image_info(
        context: Int,
        width: Int,
        height: Int,
        x: Int,
        y: Int,
    ): Int

    fun _movi_get_subtitle_image_data(
        context: Int,
        buffer: Int,
        bufferSize: Int,
    ): Int

    fun _movi_free_subtitle(context: Int)

    fun _movi_clear_prefetched_cues(context: Int)

    fun _movi_get_prefetched_cue_count(context: Int): Int

    fun _movi_get_prefetched_cue(
        context: Int,
        index: Int,
        start: Int,
        end: Int,
        text: Int,
        textSize: Int,
    ): Int

    fun _movi_stretch_new(
        channels: Int,
        sampleRate: Float,
    ): Int

    fun _movi_stretch_delete(handle: Int)

    fun _movi_stretch_reset(handle: Int)

    fun _movi_stretch_set_transpose_semitones(
        handle: Int,
        semitones: Float,
    )

    fun _movi_stretch_input_latency(handle: Int): Int

    fun _movi_stretch_output_latency(handle: Int): Int

    fun _movi_stretch_process(
        handle: Int,
        input: Int,
        inputFrames: Int,
        output: Int,
        outputFrames: Int,
    )

    fun UTF8ToString(pointer: Int): String
}

internal class NativeRuntimeLoader {
    suspend fun load(config: WasmRuntimeConfig): NativeModule {
        val normalized = config.assetBaseUrl.trimEnd('/') + "/"
        val discoveredAbi = loadRuntimeAbiVersion(normalized + "kmedia-wasm-runtime.json")
        if (discoveredAbi != config.expectedAbiVersion) {
            throw WasmMediaError(
                category = WasmMediaErrorCategory.INTERNAL,
                code = WasmMediaErrorCode.RUNTIME_ABI_MISMATCH,
                message =
                    "KMedia Wasm runtime ABI $discoveredAbi is incompatible with the expected ABI " +
                        "${config.expectedAbiVersion}.",
            )
        }
        val operation = CompletableDeferred<NativeModule>()
        importNativeModule(
            moduleUrl = normalized + "kmedia-wasm.js",
            wasmUrl = normalized + "kmedia-wasm.wasm",
            onLoaded = { module -> operation.complete(module) },
            onError = { message ->
                operation.completeExceptionally(IllegalStateException(message))
            },
        )
        return operation.await()
    }
}

internal val sharedNativeRuntimeLoader: NativeRuntimeLoader = NativeRuntimeLoader()

private suspend fun loadRuntimeAbiVersion(url: String): Int {
    val operation = CompletableDeferred<Int>()
    fetchRuntimeAbiManifest(
        url = url,
        onLoaded = operation::complete,
        onError = { message ->
            operation.completeExceptionally(
                WasmMediaError(
                    category = WasmMediaErrorCategory.INTERNAL,
                    code = WasmMediaErrorCode.RUNTIME_ABI_MISMATCH,
                    message = message,
                ),
            )
        },
    )
    return operation.await()
}

@Suppress("UNUSED_PARAMETER")
private fun fetchRuntimeAbiManifest(
    url: String,
    onLoaded: (Int) -> Unit,
    onError: (String) -> Unit,
): Unit =
    js(
        """
        {
        const prefixes = globalThis.__karma__ && !/^(?:[a-z]+:|\/)/i.test(url)
            ? ["", "/base/kotlin/"]
            : [""];
        const candidates = prefixes.map(function(prefix) {
            return new URL(prefix + url, document.baseURI).href;
        });
        const fetchCandidate = function(index) {
            return fetch(candidates[index], { cache: "no-store" })
            .then(function(response) {
                if (!response.ok) {
                    throw new Error("KMedia Wasm runtime manifest request failed with HTTP " + response.status + ".");
                }
                return response.json();
            })
            .catch(function(error) {
                if (index + 1 < candidates.length) return fetchCandidate(index + 1);
                throw error;
            });
        };
        fetchCandidate(0)
            .then(function(manifest) {
                const version = Number(manifest && manifest.abiVersion);
                if (!Number.isSafeInteger(version) || version <= 0) {
                    throw new Error("KMedia Wasm runtime manifest does not contain a valid ABI version.");
                }
                onLoaded(version);
            })
            .catch(function(error) {
                const message = error && error.message ? error.message : String(error);
                onError(String(message || "Unable to verify the KMedia Wasm runtime ABI."));
            });
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
private fun importNativeModule(
    moduleUrl: String,
    wasmUrl: String,
    onLoaded: (NativeModule) -> Unit,
    onError: (String) -> Unit,
): Unit =
    js(
        """
        {
            const prefixes = globalThis.__karma__ && !/^(?:[a-z]+:|\/)/i.test(moduleUrl)
                ? ["", "/base/kotlin/"]
                : [""];
            const candidates = prefixes.map(function(prefix) {
                return {
                    moduleUrl: new URL(prefix + moduleUrl, document.baseURI).href,
                    wasmUrl: new URL(prefix + wasmUrl, document.baseURI).href
                };
            });
            const importCandidate = function(index) {
                const candidate = candidates[index];
                return import(/* webpackIgnore: true */ candidate.moduleUrl)
                    .then(function(imported) {
                        return { imported: imported, wasmUrl: candidate.wasmUrl };
                    })
                    .catch(function(error) {
                        if (index + 1 < candidates.length) return importCandidate(index + 1);
                        throw error;
                    });
            };
            importCandidate(0)
                .then(function(imported) {
                    const namespace = imported.imported;
                    const factory = namespace && (namespace.default || namespace.createKMediaWasmModule || namespace);
                    if (typeof factory !== "function") {
                        throw new Error("The KMedia Wasm native runtime does not export its module factory.");
                    }
                    return factory({
                        locateFile: function(path) {
                            return path && path.endsWith(".wasm") ? imported.wasmUrl : path;
                        },
                        print: function() {},
                        printErr: function() {}
                    });
                })
                .then(function(module) { onLoaded(module); })
                .catch(function(error) {
                    const message = error && error.message ? error.message : String(error);
                    onError(String(message || "Unable to load the KMedia Wasm native runtime."));
                });
        }
        """,
    )

internal fun dataView(
    module: NativeModule,
    pointer: Int,
    size: Int,
): DataView = DataView(module.HEAPU8.buffer, pointer, size)

internal fun heapSlice(
    module: NativeModule,
    start: Int,
    endExclusive: Int,
): Uint8Array = copyHeapSlice(module, start, endExclusive)

@Suppress("UNUSED_PARAMETER")
private fun copyHeapSlice(
    module: NativeModule,
    start: Int,
    endExclusive: Int,
): Uint8Array = js("module.HEAPU8.slice(start, endExclusive)")

internal fun uint8Array(buffer: ArrayBuffer): Uint8Array = Uint8Array(buffer)

@Suppress("UNUSED_PARAMETER")
internal fun asInt8Array(bytes: Uint8Array): Int8Array =
    js("new Int8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength)")

@Suppress("UNUSED_PARAMETER")
internal fun installNativeIoCallbacks(
    module: NativeModule,
    onRead: (Double, Int) -> Unit,
    onSeek: (Double, Int) -> Unit,
): Unit =
    js(
        """
        {
            module.onReadRequest = function(offset, size) {
                onRead(Number(offset), Number(size));
            };
            module.onSeekRequest = function(offset, whence) {
                onSeek(Number(offset), Number(whence));
            };
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
internal fun setNativeFileSize(
    module: NativeModule,
    size: Double,
): Unit = js("module._fileSize = BigInt(Math.floor(size))")

@Suppress("UNUSED_PARAMETER")
internal fun fulfillNativeRead(
    module: NativeModule,
    data: Int8Array,
    bytesRead: Int,
): Unit =
    js(
        """
        {
            const pending = module._pendingRead;
            if (!pending) return;
            if (bytesRead > 0) {
                module.HEAPU8.set(data.subarray(0, bytesRead), pending.buffer);
            }
            pending.resolve(bytesRead);
            module._pendingRead = null;
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
internal fun clearNativeMemory(
    module: NativeModule,
    start: Int,
    endExclusive: Int,
): Unit = js("module.HEAPU8.fill(0, start, endExclusive)")

@Suppress("UNUSED_PARAMETER")
internal fun copyToNativeMemory(
    module: NativeModule,
    data: Int8Array,
    destination: Int,
): Unit = js("module.HEAPU8.set(data, destination)")

@Suppress("UNUSED_PARAMETER")
internal fun fulfillNativeSeek(
    module: NativeModule,
    position: Double,
): Unit =
    js(
        """
        {
            const pending = module._pendingSeek;
            if (!pending) return;
            pending.resolve(BigInt(Math.floor(position)));
            module._pendingSeek = null;
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
internal fun invokeNativeOpen(
    module: NativeModule,
    context: Int,
    onResult: (Int) -> Unit,
    onError: (String) -> Unit,
): Unit =
    js(
        """
        {
            Promise.resolve(
                module.ccall(
                    "movi_open",
                    "number",
                    ["number"],
                    [context],
                    { async: true }
                )
            )
                .then(function(value) { onResult(Number(value)); })
                .catch(function(error) {
                    onError(String(error && error.message ? error.message : error));
                });
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
internal fun invokeNativeReadFrame(
    module: NativeModule,
    context: Int,
    infoPointer: Int,
    packetPointer: Int,
    packetCapacity: Int,
    onResult: (Int) -> Unit,
    onError: (String) -> Unit,
): Unit =
    js(
        """
        {
            Promise.resolve(
                module.ccall(
                    "movi_read_frame",
                    "number",
                    ["number", "number", "number", "number"],
                    [context, infoPointer, packetPointer, packetCapacity],
                    { async: true }
                )
            )
                .then(function(value) { onResult(Number(value)); })
                .catch(function(error) {
                    onError(String(error && error.message ? error.message : error));
                });
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
internal fun invokeNativeSeek(
    module: NativeModule,
    context: Int,
    timestamp: Double,
    streamIndex: Int,
    flags: Int,
    onResult: (Int) -> Unit,
    onError: (String) -> Unit,
): Unit =
    js(
        """
        {
            Promise.resolve(
                module.ccall(
                    "movi_seek_to",
                    "number",
                    ["number", "number", "number", "number"],
                    [context, timestamp, streamIndex, flags],
                    { async: true }
                )
            )
                .then(function(value) { onResult(Number(value)); })
                .catch(function(error) {
                    onError(String(error && error.message ? error.message : error));
                });
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
internal fun invokeNativeSubtitlePrefetch(
    module: NativeModule,
    context: Int,
    streamIndex: Int,
    onResult: (Int) -> Unit,
    onError: (String) -> Unit,
): Unit =
    js(
        """
        {
            Promise.resolve(
                module.ccall(
                    "movi_prefetch_subtitle_cues",
                    "number",
                    ["number", "number"],
                    [context, streamIndex],
                    { async: true }
                )
            )
                .then(function(value) { onResult(Number(value)); })
                .catch(function(error) {
                    onError(String(error && error.message ? error.message : error));
                });
        }
        """,
    )
