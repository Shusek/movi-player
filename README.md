# Movi Player for Kotlin/Wasm

This branch is a headless browser media engine written for Kotlin/Wasm. Its public API is a typed
Kotlin KLIB; it does not publish a Kotlin/JS target, JavaScript compatibility facade, web component,
or npm API.

The project is maintained at [Shusek/movi-player](https://github.com/Shusek/movi-player) and is
derived from the original [MrUjjwalG/movi-player](https://github.com/MrUjjwalG/movi-player). The
existing FFmpeg, dav1d, and Signalsmith Emscripten runtime remains the native media foundation.
Attribution and third-party terms are recorded in [NOTICE](NOTICE) and
[LGPL_RELINKING.md](LGPL_RELINKING.md).

## Published artifacts

Version `0.4.0-alpha.1` consists of two coordinated Maven artifacts:

| Artifact | Purpose |
|---|---|
| `io.github.shusek:movi-player` | Kotlin/Wasm KLIB with the typed player API |
| `io.github.shusek:movi-player-runtime-assets` | ZIP containing `movi-runtime/movi.js` and `movi-runtime/movi.wasm` |

The runtime archive is separate so a consumer can put the native payload at a stable public URL
without importing executable JavaScript dynamically. Both artifacts must use the same version.

## Consumer setup

Declare the KLIB in `wasmJsMain`:

```kotlin
kotlin {
    wasmJs {
        browser()
    }

    sourceSets {
        wasmJsMain.dependencies {
            implementation("io.github.shusek:movi-player:0.4.0-alpha.1")
        }
    }
}
```

Resolve `io.github.shusek:movi-player-runtime-assets:0.4.0-alpha.1@zip`, unpack its
`movi-runtime/` directory into the browser distribution, and pass its public base URL to
`MoviRuntimeConfig`. The base URL may be relative to the application:

```kotlin
import io.github.shusek.moviplayer.MediaSource
import io.github.shusek.moviplayer.MoviPlayer
import io.github.shusek.moviplayer.MoviPlayerConfig
import io.github.shusek.moviplayer.MoviRuntimeConfig
import kotlinx.browser.document
import org.w3c.dom.HTMLCanvasElement

val canvas = document.createElement("canvas") as HTMLCanvasElement
val player =
    MoviPlayer(
        MoviPlayerConfig(
            canvas = canvas,
            runtime = MoviRuntimeConfig(assetBaseUrl = "/assets/movi-runtime/"),
        ),
    )

player.load(MediaSource.Url("https://media.example/movie.mkv"))
player.play()
```

The API exposes typed state and event flows, source/header models, media metadata, track selection,
seeking, buffering diagnostics, canvas/native-video surfaces, DRM configuration, and a pluggable
embedded-subtitle renderer. Call `close()` when the host UI is disposed.

## Playback routes

- MP4, WebM, HLS, DASH, Smooth Streaming, and EME sources use the browser media stack and the bundled adaptive
  engines where needed.
- Raw MKV, MKA, AVI, MPEG-TS, M2TS, MTS, browser `File`, and Blob-backed sources use the native
  FFmpeg demuxer with WebCodecs, Canvas 2D, and Web Audio.
- Media request headers and license request headers remain separate typed maps.
- ASS/SSA integrations can implement `EmbeddedSubtitleRenderer`; subtitle packets and font
  attachments cross a Kotlin interface rather than an untyped JavaScript object.

Chrome and Edge are the release-blocking browsers for the initial Kotlin/Wasm release. Other
browsers may lack the WebCodecs or media primitives required by a particular source.

## KMediaPlayer integration

KMediaPlayer links the KLIB directly and packages the runtime ZIP as Compose resources. During
coordinated development, point its composite build at this checkout:

```shell
./gradlew :mediaplayer:wasmJsBrowserTest \
  -PmoviPlayerProjectDir=/absolute/path/to/movi-player
```

No `engine.js` import, npm dependency, `JsAny` player facade, or Kotlin/JS compatibility target is
involved.

## Build and verify

JDK 25 and a locally installed Chrome are required:

```shell
./gradlew :player:wasmJsBrowserTest
./gradlew \
  :player:publishAllPublicationsToProjectLocalRepository \
  :runtime-assets:publishAllPublicationsToProjectLocalRepository
```

The local publication is written to `build/project-local-repository/`. Runtime publication first
checks `cdn/chunks/movi.js` and `cdn/chunks/movi.wasm` against `cdn/SHA256SUMS`.

The historical TypeScript/npm application sources remain in the repository for upstream history
and native-runtime maintenance, but they are not built or published by this Kotlin/Wasm project.

## Migration

See [docs/KOTLIN_WASM_MIGRATION.md](docs/KOTLIN_WASM_MIGRATION.md) for the intentional
incompatibilities with the earlier JavaScript engine.

## License

Kotlin sources are licensed under Apache License 2.0. The runtime archive contains third-party
components under their respective terms; consult [NOTICE](NOTICE) and
[LGPL_RELINKING.md](LGPL_RELINKING.md) before redistributing it.
