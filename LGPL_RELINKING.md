# FFmpeg/WebAssembly source and relinking

The distributed `dist/wasm/movi.wasm` combines the Movi C/C++ wrapper with
FFmpeg libraries configured under LGPL-2.1-or-later. GPL and non-free FFmpeg
components are not enabled.

The materials needed to inspect, modify, rebuild, and relink this component
are included in the npm package:

- `wasm/` — the Movi C/C++ wrapper and JavaScript I/O library;
- `docker/Dockerfile` — pinned FFmpeg and dav1d source versions plus the
  Emscripten build environment;
- `docker/build-ffmpeg.sh` — complete configure, compile, export, and link
  commands;
- `compose.yaml` — the reproducible build entrypoint.

Run `npm run build:wasm` from the package/repository root with Docker
available. The build downloads the exact FFmpeg and dav1d source releases
identified in `docker/Dockerfile`, compiles them, and replaces
`dist/wasm/movi.js` and `dist/wasm/movi.wasm`.

The canonical corresponding source snapshot is the Git tag whose version
matches the npm package version:

`https://github.com/Shusek/movi-player/releases`

FFmpeg is available from `https://github.com/FFmpeg/FFmpeg` and its licensing
information from `https://ffmpeg.org/legal.html`. Nothing in this document
changes the terms of LGPL-2.1-or-later or any other included license.
