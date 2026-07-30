# FFmpeg/WebAssembly source and relinking

The `io.github.shusek:movi-player-runtime-assets` Maven artifact contains
`movi-runtime/movi.wasm` and its Emscripten loader. The WebAssembly binary combines the Movi C/C++
wrapper with FFmpeg libraries configured under LGPL-2.1-or-later. GPL and non-free FFmpeg
components are not enabled.

The corresponding source and relinking materials are in the movi-player Git source snapshot whose
version matches the Maven artifact:

- `wasm/` — the Movi C/C++ wrapper and JavaScript I/O library;
- `docker/Dockerfile` — pinned FFmpeg and dav1d source versions plus the Emscripten environment;
- `docker/build-ffmpeg.sh` — the complete configure, compile, export, and link commands;
- `compose.yaml` — the reproducible native-build entrypoint;
- `package.json` — the `build:wasm` command that invokes that container build.

From the corresponding source tree, run:

```shell
npm ci
npm run build:wasm
```

The build produces `dist/wasm/movi.js` and `dist/wasm/movi.wasm`. To prepare a new Kotlin/Wasm
runtime release, copy those two outputs to `cdn/chunks/`, update their entries in `cdn/SHA256SUMS`,
and run:

```shell
./gradlew :runtime-assets:runtimeArchive
```

The Gradle task verifies the pinned bytes before creating the Maven ZIP. The release tag and source
archive are published at:

`https://github.com/Shusek/movi-player/releases`

FFmpeg source is available from `https://github.com/FFmpeg/FFmpeg`; its licensing information is at
`https://ffmpeg.org/legal.html`. Nothing in this document changes the terms of
LGPL-2.1-or-later or any other included license.
