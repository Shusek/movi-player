# Immutable browser distribution

This directory contains the minimal ESM runtime used by KMediaPlayer. Every
runtime file and the bundle report were copied without modification from the
`movi-player-distribution` artifact produced by GitHub Actions run
[`30004292851`](https://github.com/Shusek/movi-player/actions/runs/30004292851)
for source commit `71b375efed690d34f7513c14652b59e74e5880e5`.

The versioned entrypoint is:

```text
https://cdn.jsdelivr.net/gh/Shusek/movi-player@v0.3.5-kmp.2/cdn/engine.js
```

Only the headless engine graph is included. The web component, CommonJS
bundles, declarations, source maps and static build archives are intentionally
excluded. The initial graph is 83,274 Brotli bytes. FFmpeg's 20,610-byte
Emscripten glue and 1,703,548-byte Wasm payload, together with Shaka, hls.js
and dash.js, are fetched only by the playback routes that use them.

The complete source, notices, third-party licenses, FFmpeg build recipe and
relinking instructions are part of the same Git tag at the repository root.
The full npm-compatible tarball is attached to the GitHub release.
