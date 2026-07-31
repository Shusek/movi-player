# Engine test fixtures

Binary media in this directory is generated locally from FFmpeg `lavfi` sources by
`scripts/generate-test-fixtures.sh`, except for the decoder-only VC-1 family acceptance fixtures
described below. Fixtures never contain credentials or tokens.

The generated matrix covers:

- MP4, Matroska, WebM, MOV, MPEG-TS and AVI containers;
- H.264, AV1, VP8, VP9, MPEG-2, MPEG-4, HEVC Open-GOP/Rext, WMV3 Simple/Main and VC-1 Advanced
  Profile video;
- AAC, MP2, MP3, PCM, Vorbis, AC-3, E-AC-3, FLAC, Opus, DTS and TrueHD audio;
- HLS VOD, HLS BYTERANGE, HLS master/split tracks, DASH SegmentTemplate and DASH single-file
  SegmentBase;
- SRT, ASS, WebVTT and TTML text subtitles;
- chapters, title metadata and embedded cover art.

Run:

```shell
bash scripts/generate-test-fixtures.sh
```

FFmpeg has no VC-1 or WMV3 encoder, so the decoder-only fixtures are short stream-copy excerpts
from FFmpeg's public samples.

`vc1-bluray.mkv` is a three-frame excerpt from `glitch-ffvc1.avi`:

```text
https://samples.ffmpeg.org/V-codecs/WVC1/glitch-ffvc1.avi
SHA-256: 9de31ffd7d674bf5856fededc9dd0c0e511ff21bf860c42fef7813dc05d5b37e
```

`wmv3-wmav2.wmv` is a 1.2-second excerpt from `buggyDMOdecoding.wmv`:

```text
https://samples.ffmpeg.org/V-codecs/WMV9/buggyDMOdecoding.wmv
Source SHA-256: e7868f27b8eb1c7e38e030aa05167b921c8e0402fb3b2b5a798147192185a1f2
Fixture SHA-256: e376791304aa47f153c6f8fea0bc3351667dc504fa769b96efa423c2e7b0b4d7
```

`wmapro.wma` is the small mono WMA Pro decoder sample retained in full from FFmpeg's public
sample archive:

```text
https://samples.ffmpeg.org/A-codecs/WMA9/wmapro/classical_16_16_1_8000_off_0_off_1_29.wma
SHA-256: 841e8b2b552c80152f8eee7a6b8ddb2d731b23b01951bf217fc12b05c3d7efb0
```

`vc1-wmapro.wmv` is a 1.2-second stream-copy excerpt from `piece.wmv`, combining 1080p-width
VC-1 video with six-channel WMA Pro audio:

```text
https://samples.ffmpeg.org/A-codecs/WMA9/wmapro/piece.wmv
Source SHA-256: 8a2a305ce027b8d268b88b170579f05206da95284c5e1395e75be896cd30898b
Fixture SHA-256: 1146dab624bbd6e7dfe105fe905a4d29e50208bf43a92451e968812318b149aa
```

They are retained only as decoder regression fixtures; the build still does not require or add a
VC-1 family encoder.

PGS, DVB and DVD bitmap subtitle decoding is compiled and bound into the Kotlin pipeline, but a
redistributable generated bitmap-subtitle sample is not yet present. That acceptance gate remains
explicitly open in `docs/engine-parity.md`.
