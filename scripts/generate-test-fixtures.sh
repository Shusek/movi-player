#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
fixture_dir="$repo_root/test-fixtures/media"
subtitle_dir="$repo_root/test-fixtures/subtitles"
metadata_dir="$repo_root/test-fixtures/metadata"
mkdir -p "$fixture_dir"

common_video=( -f lavfi -i "testsrc2=size=160x90:rate=12" )
common_audio=( -f lavfi -i "sine=frequency=440:sample_rate=48000" )
common_tail=( -t 1.5 -shortest -map_metadata -1 -y )

ffmpeg -hide_banner -loglevel error \
  "${common_video[@]}" "${common_audio[@]}" \
  -map 0:v -map 1:a -c:v libx264 -preset ultrafast -g 12 -pix_fmt yuv420p \
  -c:a aac -movflags +faststart "${common_tail[@]}" "$fixture_dir/h264-aac.mp4"

ffmpeg -hide_banner -loglevel error \
  -i "$fixture_dir/h264-aac.mp4" -i "$metadata_dir/chapters.ffmeta" \
  -map 0 -map_metadata 1 -map_chapters 1 -c copy -y "$fixture_dir/chaptered.mkv"

ffmpeg -hide_banner -loglevel error \
  "${common_video[@]}" "${common_audio[@]}" \
  -map 0:v -map 1:a -c:v libvpx-vp9 -deadline realtime -cpu-used 8 -b:v 180k \
  -c:a libopus "${common_tail[@]}" "$fixture_dir/vp9-opus.mkv"

ffmpeg -hide_banner -loglevel error \
  "${common_video[@]}" "${common_audio[@]}" \
  -map 0:v -map 1:a -c:v libsvtav1 -preset 13 -g 12 -pix_fmt yuv420p \
  -c:a libopus "${common_tail[@]}" "$fixture_dir/av1-opus.mkv"

ffmpeg -hide_banner -loglevel error \
  "${common_video[@]}" "${common_audio[@]}" \
  -map 0:v -map 1:a -c:v libvpx -deadline realtime -cpu-used 8 -b:v 180k \
  -c:a vorbis -strict -2 -ac 2 "${common_tail[@]}" "$fixture_dir/vp8-vorbis.webm"

ffmpeg -hide_banner -loglevel error \
  "${common_video[@]}" "${common_audio[@]}" \
  -map 0:v -map 1:a -c:v libx264 -preset ultrafast -g 12 -pix_fmt yuv420p \
  -c:a pcm_s16le "${common_tail[@]}" "$fixture_dir/h264-pcm.mov"

ffmpeg -hide_banner -loglevel error \
  "${common_video[@]}" "${common_audio[@]}" \
  -map 0:v -map 1:a -c:v mpeg2video -g 12 -b:v 300k -c:a mp2 \
  "${common_tail[@]}" "$fixture_dir/mpeg2-mp2.ts"

ffmpeg -hide_banner -loglevel error \
  "${common_video[@]}" "${common_audio[@]}" \
  -map 0:v -map 1:a -c:v mpeg4 -bf 2 -g 12 -q:v 5 -c:a libmp3lame \
  "${common_tail[@]}" "$fixture_dir/mpeg4-mp3.avi"

ffmpeg -hide_banner -loglevel error \
  "${common_video[@]}" "${common_audio[@]}" \
  -i "$subtitle_dir/sample.srt" -i "$subtitle_dir/sample.ass" \
  -map 0:v -map 1:a -map 2:s -map 3:s \
  -c:v libx264 -preset ultrafast -g 12 -pix_fmt yuv420p -c:a aac \
  -c:s:0 srt -c:s:1 ass -metadata:s:s:0 language=eng -metadata:s:s:1 language=pol \
  "${common_tail[@]}" "$fixture_dir/text-subtitles.mkv"

ffmpeg -hide_banner -loglevel error \
  "${common_video[@]}" "${common_audio[@]}" \
  -map 0:v -map 1:a -c:v libx265 -preset ultrafast -tag:v hvc1 -pix_fmt yuv420p \
  -x265-params "keyint=24:min-keyint=24:open-gop=1:repeat-headers=1:log-level=error" \
  -c:a aac "${common_tail[@]}" "$fixture_dir/hevc-open-gop.mp4"

ffmpeg -hide_banner -loglevel error \
  "${common_video[@]}" "${common_audio[@]}" \
  -map 0:v -map 1:a -vf format=yuv444p10le \
  -c:v libx265 -preset ultrafast -tag:v hvc1 -profile:v main444-10 \
  -x265-params "keyint=12:repeat-headers=1:log-level=error" \
  -c:a flac "${common_tail[@]}" "$fixture_dir/hevc-rext-flac.mkv"

ffmpeg -hide_banner -loglevel error \
  -f lavfi -i "aevalsrc=sin(2*PI*220*t)|sin(2*PI*330*t)|sin(2*PI*440*t)|sin(2*PI*550*t)|sin(2*PI*660*t)|sin(2*PI*770*t):s=48000:c=5.1" \
  -t 1.5 \
  -map 0:a -map 0:a -map 0:a -map 0:a -map 0:a -map 0:a \
  -c:a:0 ac3 -b:a:0 384k \
  -c:a:1 eac3 -b:a:1 384k \
  -c:a:2 flac \
  -c:a:3 libopus -b:a:3 192k \
  -c:a:4 dca -b:a:4 768k -strict:a:4 experimental \
  -c:a:5 truehd -strict:a:5 experimental \
  -metadata:s:a:0 title=AC-3 -metadata:s:a:1 title=E-AC-3 \
  -metadata:s:a:2 title=FLAC -metadata:s:a:3 title=Opus \
  -metadata:s:a:4 title=DTS -metadata:s:a:5 title=TrueHD \
  -map_metadata -1 -y "$fixture_dir/multichannel-software-audio.mka"

ffmpeg -hide_banner -loglevel error \
  -f lavfi -i "color=c=0x3366cc:s=64x64" -frames:v 1 -y "$fixture_dir/cover-art.jpg"

ffmpeg -hide_banner -loglevel error \
  "${common_audio[@]}" -i "$fixture_dir/cover-art.jpg" \
  -map 0:a -map 1:v -t 1.5 -c:a libmp3lame -c:v copy \
  -id3v2_version 3 -metadata:s:v title="Fixture cover" \
  -metadata:s:v comment="Cover (front)" -disposition:v:0 attached_pic \
  -map_metadata -1 -y "$fixture_dir/cover-art.mp3"

ffmpeg -hide_banner -loglevel error \
  -i "$fixture_dir/h264-aac.mp4" -codec copy -hls_time 0.5 -hls_list_size 0 \
  -hls_segment_filename "$fixture_dir/hls-segment-%02d.ts" -y "$fixture_dir/vod.m3u8"

ffmpeg -hide_banner -loglevel error \
  -i "$fixture_dir/h264-aac.mp4" -codec copy -hls_time 0.5 -hls_list_size 0 \
  -hls_segment_type fmp4 -hls_flags single_file \
  -hls_segment_filename "$fixture_dir/hls-byterange.mp4" -y "$fixture_dir/byterange.m3u8"

ffmpeg -hide_banner -loglevel error \
  -i "$fixture_dir/h264-aac.mp4" -codec copy -seg_duration 0.5 \
  -use_template 1 -use_timeline 1 -init_seg_name "dash-init-\$RepresentationID\$.mp4" \
  -media_seg_name "dash-chunk-\$RepresentationID\$-\$Number%02d\$.m4s" \
  -y "$fixture_dir/vod.mpd"
