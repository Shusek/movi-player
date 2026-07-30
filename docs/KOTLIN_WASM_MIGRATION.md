# Migration from the JavaScript engine

`0.4.0-alpha.1` starts a new Kotlin/Wasm-only API line. It is not source- or binary-compatible with
the `0.3.x` npm package, `/engine` entrypoint, web component, or Kotlin/JS consumers.

## What changed

- Link `io.github.shusek:movi-player` in `wasmJsMain`; do not load an npm module.
- Construct `MoviPlayer` with a typed `MoviPlayerConfig`.
- Pass `MediaSource.Url`, `MediaSource.BrowserFile`, or `MediaSource.Drm` to `load`.
- Collect Kotlin `StateFlow` and `SharedFlow` values instead of installing JavaScript callbacks.
- Select tracks with `TrackSelectionRequest` and inspect `TrackSelectionOutcome`.
- Implement `EmbeddedSubtitleRenderer` for custom ASS/SSA rendering.
- Publish `movi.js` and `movi.wasm` from the matching runtime-assets ZIP and configure only their
  base URL.

There is deliberately no adapter for the old constructor shape, dynamic method names, JavaScript
event payloads, `<movi-player>` element, or npm package exports.

## Coordinated rollout

1. Publish the KLIB and runtime-assets ZIP under the same version.
2. Update the consuming Kotlin/Wasm project to the new Maven coordinate.
3. Package the runtime files with the web application and set `MoviRuntimeConfig.assetBaseUrl`.
4. Replace dynamic player calls with the typed API.
5. Replace JavaScript subtitle objects with `EmbeddedSubtitleRenderer`.
6. Run browser tests against the packaged runtime, not a mutable CDN URL.

KMediaPlayer supports step 1 during local development with
`-PmoviPlayerProjectDir=/absolute/path/to/movi-player`, which substitutes both Maven artifacts from
the included build.
