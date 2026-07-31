package io.github.shusek.kmedia.engine.wasm.internal

import io.github.shusek.kmedia.engine.wasm.EncryptedHttpSource
import io.github.shusek.kmedia.engine.wasm.CacheConfig
import io.github.shusek.kmedia.engine.wasm.ExternalSubtitleSource
import io.github.shusek.kmedia.engine.wasm.FileSource
import io.github.shusek.kmedia.engine.wasm.HttpSource
import io.github.shusek.kmedia.engine.wasm.MediaSource
import io.github.shusek.kmedia.engine.wasm.WasmMediaError
import io.github.shusek.kmedia.engine.wasm.WasmMediaErrorCategory
import io.github.shusek.kmedia.engine.wasm.WasmMediaErrorCode
import io.github.shusek.kmedia.engine.wasm.SourceAdapter
import io.github.shusek.kmedia.engine.wasm.SubtitleCue
import kotlin.time.Duration.Companion.milliseconds

internal suspend fun loadExternalSubtitleCues(source: ExternalSubtitleSource): List<SubtitleCue> {
    val adapter = source.source.toIndependentAdapter()
    try {
        val size = adapter.getSize()
        if (size !in 0..MAX_EXTERNAL_SUBTITLE_BYTES.toLong()) {
            throw WasmMediaError(
                WasmMediaErrorCategory.SOURCE,
                WasmMediaErrorCode.INVALID_SOURCE,
                "The external subtitle file exceeds the 16 MiB safety limit.",
            )
        }
        val bytes = adapter.read(0, size.toInt())
        val text = bytes.decodeToString().removePrefix("\uFEFF")
        val format =
            source.format
                ?.substringAfterLast('/')
                ?.lowercase()
                ?: source.source.externalSubtitleExtension()
        return parseExternalSubtitleText(text, format)
    } finally {
        adapter.close()
    }
}

internal fun parseExternalSubtitleText(
    text: String,
    format: String?,
): List<SubtitleCue> =
    when (format?.substringAfterLast('/')?.lowercase()) {
        "vtt", "webvtt" -> parseWebVtt(text)
        "ttml", "xml", "dfxp" -> parseTtml(text)
        else -> parseSrt(text)
    }

internal fun MediaSource.toIndependentAdapter(cache: CacheConfig = CacheConfig()): SourceAdapter =
    when (this) {
        is MediaSource.Url -> HttpSource(url, headers, cache)
        is MediaSource.BrowserFile -> FileSource(file)
        is MediaSource.Adapter ->
            adapter.fork()
                ?: throw WasmMediaError(
                    WasmMediaErrorCategory.SOURCE,
                    WasmMediaErrorCode.INVALID_SOURCE,
                    "External subtitle adapters must provide an independent cursor.",
                )
        is MediaSource.Encrypted -> EncryptedHttpSource(config, cache)
        is MediaSource.Composite -> primary.toIndependentAdapter(cache)
        is MediaSource.BrowserMedia ->
            throw WasmMediaError(
                WasmMediaErrorCategory.SOURCE,
                WasmMediaErrorCode.INVALID_SOURCE,
                "Prepared browser media cannot be used as an external subtitle document.",
            )
        is MediaSource.Drm ->
            throw WasmMediaError(
                WasmMediaErrorCategory.DRM,
                WasmMediaErrorCode.INVALID_SOURCE,
                "A DRM manifest cannot be used as an external subtitle document.",
            )
    }

private fun MediaSource.externalSubtitleExtension(): String? =
    when (this) {
        is MediaSource.Url -> url.substringBefore('?').substringBefore('#').substringAfterLast('.', "").lowercase()
        is MediaSource.BrowserFile -> file.name.substringAfterLast('.', "").lowercase()
        is MediaSource.Composite -> primary.externalSubtitleExtension()
        is MediaSource.BrowserMedia -> null
        else -> null
    }

private fun parseSrt(text: String): List<SubtitleCue> =
    text.normalizeSubtitleLines()
        .split(Regex("""\n\s*\n"""))
        .mapNotNull { block ->
            val lines = block.lines().filter(String::isNotBlank)
            val timingIndex = lines.indexOfFirst { "-->" in it }
            if (timingIndex < 0) return@mapNotNull null
            val times = lines[timingIndex].split("-->", limit = 2)
            val start = times.getOrNull(0)?.parseSubtitleTimestamp() ?: return@mapNotNull null
            val end =
                times.getOrNull(1)
                    ?.trim()
                    ?.split(Regex("""\s+"""), limit = 2)
                    ?.firstOrNull()
                    ?.parseSubtitleTimestamp()
                    ?: return@mapNotNull null
            val cueText = lines.drop(timingIndex + 1).joinToString("\n").decodeSubtitleEntities()
            cueText.takeIf(String::isNotBlank)?.let {
                SubtitleCue(start = start.milliseconds, end = end.coerceAtLeast(start).milliseconds, text = it)
            }
        }.sortedBy(SubtitleCue::start)

private fun parseWebVtt(text: String): List<SubtitleCue> =
    text.normalizeSubtitleLines()
        .substringAfter('\n', "")
        .split(Regex("""\n\s*\n"""))
        .mapNotNull { block ->
            val lines = block.lines().filter(String::isNotBlank)
            if (lines.firstOrNull()?.startsWith("NOTE") == true) return@mapNotNull null
            val timingIndex = lines.indexOfFirst { "-->" in it }
            if (timingIndex < 0) return@mapNotNull null
            val times = lines[timingIndex].split("-->", limit = 2)
            val start = times[0].parseSubtitleTimestamp() ?: return@mapNotNull null
            val end =
                times.getOrNull(1)
                    ?.trim()
                    ?.split(Regex("""\s+"""), limit = 2)
                    ?.firstOrNull()
                    ?.parseSubtitleTimestamp()
                    ?: return@mapNotNull null
            val cueText = lines.drop(timingIndex + 1).joinToString("\n").decodeSubtitleEntities()
            cueText.takeIf(String::isNotBlank)?.let {
                SubtitleCue(start = start.milliseconds, end = end.coerceAtLeast(start).milliseconds, text = it)
            }
        }.sortedBy(SubtitleCue::start)

private fun parseTtml(text: String): List<SubtitleCue> =
    TTML_CUE.findAll(text).mapNotNull { match ->
        val attributes = match.groupValues[1]
        val body = match.groupValues[2]
        val begin = TTML_BEGIN.find(attributes)?.groupValues?.getOrNull(1)?.parseTtmlTime() ?: return@mapNotNull null
        val explicitEnd = TTML_END.find(attributes)?.groupValues?.getOrNull(1)?.parseTtmlTime()
        val duration = TTML_DURATION.find(attributes)?.groupValues?.getOrNull(1)?.parseTtmlTime()
        val end = explicitEnd ?: duration?.let(begin::plus) ?: return@mapNotNull null
        val cueText =
            body
                .replace(TTML_BREAK, "\n")
                .replace(TTML_TAG, "")
                .decodeSubtitleEntities()
                .trim()
        cueText.takeIf(String::isNotBlank)?.let {
            SubtitleCue(start = begin.milliseconds, end = end.coerceAtLeast(begin).milliseconds, text = it)
        }
    }.sortedBy(SubtitleCue::start).toList()

private fun String.normalizeSubtitleLines(): String = replace("\r\n", "\n").replace('\r', '\n').trim()

private fun String.parseSubtitleTimestamp(): Long? {
    val clean = trim().replace(',', '.')
    val parts = clean.split(':')
    if (parts.size !in 2..3) return null
    val seconds = parts.last().toDoubleOrNull() ?: return null
    val minutes = parts[parts.lastIndex - 1].toLongOrNull() ?: return null
    val hours = if (parts.size == 3) parts[0].toLongOrNull() ?: return null else 0L
    return ((hours * 3_600 + minutes * 60) * 1_000 + seconds * 1_000).toLong().coerceAtLeast(0L)
}

private fun String.parseTtmlTime(): Long? {
    val clean = trim()
    return when {
        clean.endsWith("ms") -> clean.removeSuffix("ms").toDoubleOrNull()?.toLong()
        clean.endsWith("s") -> clean.removeSuffix("s").toDoubleOrNull()?.times(1_000)?.toLong()
        clean.endsWith("m") -> clean.removeSuffix("m").toDoubleOrNull()?.times(60_000)?.toLong()
        clean.endsWith("h") -> clean.removeSuffix("h").toDoubleOrNull()?.times(3_600_000)?.toLong()
        else -> clean.parseSubtitleTimestamp()
    }?.coerceAtLeast(0L)
}

private fun String.decodeSubtitleEntities(): String =
    replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&amp;", "&")
        .replace("&quot;", "\"")
        .replace("&apos;", "'")
        .replace(Regex("""<br\s*/?>""", RegexOption.IGNORE_CASE), "\n")
        .replace(Regex("""</?(?:b|i|u|c(?:\.[^>]*)?|v(?:\s+[^>]*)?)>""", RegexOption.IGNORE_CASE), "")

private val TTML_CUE: Regex = Regex("""<p\b([^>]*)>([\s\S]*?)</p>""", RegexOption.IGNORE_CASE)
private val TTML_BEGIN: Regex = Regex("""\bbegin\s*=\s*["']([^"']+)["']""", RegexOption.IGNORE_CASE)
private val TTML_END: Regex = Regex("""\bend\s*=\s*["']([^"']+)["']""", RegexOption.IGNORE_CASE)
private val TTML_DURATION: Regex = Regex("""\bdur\s*=\s*["']([^"']+)["']""", RegexOption.IGNORE_CASE)
private val TTML_BREAK: Regex = Regex("""<br\s*/?>""", RegexOption.IGNORE_CASE)
private val TTML_TAG: Regex = Regex("""<[^>]+>""")
private const val MAX_EXTERNAL_SUBTITLE_BYTES: Int = 16 * 1024 * 1024
