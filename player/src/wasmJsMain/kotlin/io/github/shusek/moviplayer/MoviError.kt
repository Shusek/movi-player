package io.github.shusek.moviplayer

public enum class MoviErrorCategory {
    SOURCE,
    NETWORK,
    FORMAT,
    DECODER,
    RENDERER,
    DRM,
    STATE,
    INTERNAL,
}

public enum class MoviErrorCode {
    INVALID_SOURCE,
    SOURCE_UNAVAILABLE,
    RANGE_UNSUPPORTED,
    UNSUPPORTED_FORMAT,
    UNSUPPORTED_CODEC,
    DECODER_CONFIGURATION_FAILED,
    DECODE_FAILED,
    RENDER_FAILED,
    DRM_CONFIGURATION_FAILED,
    DRM_LICENSE_FAILED,
    INVALID_STATE,
    CANCELLED,
    NATIVE_RUNTIME_FAILED,
    UNKNOWN,
}

public class MoviError(
    public val category: MoviErrorCategory,
    public val code: MoviErrorCode,
    message: String,
    cause: Throwable? = null,
) : Exception(redactSensitiveText(message), cause) {
    override fun toString(): String = "MoviError(category=$category, code=$code, message=${message.orEmpty()})"
}

public fun redactSensitiveText(value: String): String {
    var redacted = value
    redacted = redacted.replace(URL_WITH_CREDENTIALS, "$1<redacted>@")
    redacted = redacted.replace(BEARER_TOKEN, "$1<redacted>")
    redacted = redacted.replace(SENSITIVE_QUERY_VALUE, "$1=<redacted>")
    redacted = redacted.replace(SENSITIVE_HEADER_VALUE, "$1: <redacted>")
    return redacted.take(MAX_PUBLIC_ERROR_LENGTH)
}

private val URL_WITH_CREDENTIALS: Regex = Regex("""(https?://)[^/@\s]+@""", RegexOption.IGNORE_CASE)
private val BEARER_TOKEN: Regex = Regex("""(?i)(bearer\s+)[A-Za-z0-9._~+/=-]+""")
private val SENSITIVE_QUERY_VALUE: Regex =
    Regex("""(?i)(token|key|secret|signature|sig|authorization|credential|license)=([^&#\s]+)""")
private val SENSITIVE_HEADER_VALUE: Regex =
    Regex("""(?im)^(authorization|cookie|set-cookie|x-api-key|x-auth-token)\s*:\s*.+$""")
private const val MAX_PUBLIC_ERROR_LENGTH: Int = 1_024
