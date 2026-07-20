# Immutable browser distribution

This directory contains the minimal ESM runtime used by KMediaPlayer. It was
copied without modification from the `movi-player-distribution` artifact
produced by GitHub Actions run
[`29742692322`](https://github.com/Shusek/movi-player/actions/runs/29742692322)
for source commit `6f59189fb5cc73831c62480d35570533e8e6b847`.

The entrypoint is:

```text
https://cdn.jsdelivr.net/gh/Shusek/movi-player@v0.3.5-kmp.1/cdn/engine.js
```

Only the headless engine graph is included here. The web component, CommonJS
bundles, declarations, source maps and static build archives are intentionally
excluded. `engine.js` imports its initial engine chunk, and that chunk loads
the FFmpeg/WebAssembly glue, Shaka, hls.js or dash.js chunk only for the
selected playback route.

The complete source, notices, third-party licenses, FFmpeg build recipe and
relinking instructions are part of the same Git tag at the repository root.
The full npm-compatible tarball remains attached to the GitHub release.

