# KMediaPlayer integration fork

This distribution is a compatibility-focused fork of
[`mrujjwalg/movi-player`](https://github.com/mrujjwalg/movi-player).
It is not affiliated with or endorsed by the upstream maintainer.

The fork keeps the upstream Apache-2.0 license and preserves upstream
copyright and attribution. Changes are maintained in small commits so that
generally useful pieces can be offered upstream without coupling upstream to
KMediaPlayer.

The `0.3.5-kmp.2` release is based on upstream's
`feat/pluggable-subtitle-renderer` branch at commit
`5a8e796e1c04b61b59412580b3a2bbb3ea6ba3ac`.

## Fork additions

- stable headless/player contracts, typed errors, and redaction-safe failures;
- transactional track selection with definitive outcomes;
- explicit rendering surfaces and conservative rendering diagnostics;
- pluggable embedded ASS/SSA rendering with bounded font attachment delivery;
- host-renderer ownership of the letterbox-aware subtitle overlay;
- Matroska default-edition chapter metadata;
- code-split adaptive engines and FFmpeg/WebAssembly assets;
- a minimal `./engine` entrypoint for hosts that provide their own UI.

The canonical fork source is
[`Shusek/movi-player`](https://github.com/Shusek/movi-player). A published
package version is built from the Git tag with the same version number.
