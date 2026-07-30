@file:OptIn(ExperimentalWasmJsInterop::class)

package io.github.shusek.moviplayer.internal

import kotlinx.coroutines.CompletableDeferred
import org.khronos.webgl.ArrayBuffer
import org.khronos.webgl.DataView
import org.khronos.webgl.Int8Array
import org.khronos.webgl.Uint8Array
import kotlin.js.ExperimentalWasmJsInterop
import kotlin.js.JsAny
import kotlin.js.js

internal external interface NativeModule : JsAny {
    val HEAPU8: Uint8Array

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

    fun _movi_get_frame_rgba(
        context: Int,
        targetWidth: Int,
        targetHeight: Int,
    ): Int

    fun _movi_get_frame_rgba_size(context: Int): Int

    fun UTF8ToString(pointer: Int): String
}

internal class NativeRuntimeLoader {
    suspend fun load(assetBaseUrl: String): NativeModule {
        val normalized = assetBaseUrl.trimEnd('/') + "/"
        val operation = CompletableDeferred<NativeModule>()
        importNativeModule(
            moduleUrl = normalized + "movi.js",
            wasmUrl = normalized + "movi.wasm",
            onLoaded = { module -> operation.complete(module) },
            onError = { message ->
                operation.completeExceptionally(IllegalStateException(message))
            },
        )
        return operation.await()
    }
}

internal val sharedNativeRuntimeLoader: NativeRuntimeLoader = NativeRuntimeLoader()

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
                    const factory = namespace && (namespace.default || namespace.createMoviModule || namespace);
                    if (typeof factory !== "function") {
                        throw new Error("The Movi native runtime does not export its module factory.");
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
                    onError(String(message || "Unable to load the Movi native runtime."));
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
