@file:OptIn(ExperimentalWasmJsInterop::class)

package io.github.shusek.kmedia.engine.wasm.internal

import org.khronos.webgl.Int8Array
import org.w3c.dom.HTMLCanvasElement
import org.w3c.dom.HTMLVideoElement
import org.w3c.dom.ImageBitmap
import kotlin.js.ExperimentalWasmJsInterop
import kotlin.js.JsAny
import kotlin.js.js

/**
 * Browser-side rendering and audio scheduling used by the Kotlin/Wasm engine.
 *
 * This is deliberately an implementation detail rather than a JavaScript API. Kotlin owns
 * demuxing, decoder choice, recovery and public state; this small bridge only talks to browser
 * primitives which do not have complete Kotlin DOM declarations yet.
 */
@Suppress("UNUSED_PARAMETER", "LongParameterList")
internal fun createMediaPipeline(
    canvas: HTMLCanvasElement,
    stableVolume: Boolean,
    onTime: (Double) -> Unit,
    onState: (String) -> Unit,
    onEnded: () -> Unit,
    onDecoderError: (String, String) -> Unit,
    onError: (String) -> Unit,
    renderOnly: Boolean = false,
): JsAny =
    js(
        """
        (function() {
            const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
            const audioContext = !renderOnly && AudioContextClass
                ? new AudioContextClass({ latencyHint: "playback" })
                : null;
            const gain = audioContext ? audioContext.createGain() : null;
            const compressor = audioContext ? audioContext.createDynamicsCompressor() : null;
            if (compressor) {
                compressor.threshold.value = -24;
                compressor.knee.value = 18;
                compressor.ratio.value = 4;
                compressor.attack.value = 0.006;
                compressor.release.value = 0.22;
            }

            const state = {
                canvas,
                audioContext,
                gain,
                compressor,
                stableVolume: Boolean(stableVolume),
                videoDecoder: null,
                audioDecoder: null,
                videoFrames: [],
                audioSegments: [],
                scheduledSources: [],
                pendingPcm: null,
                playing: false,
                buffering: false,
                destroyed: false,
                eof: false,
                ended: false,
                duration: 0,
                position: 0,
                basePosition: 0,
                baseWallTime: performance.now(),
                baseContextTime: audioContext ? audioContext.currentTime : 0,
                audioClockMediaPosition: 0,
                audioClockContextTime: 0,
                audioClockMediaEnd: 0,
                audioClockValid: false,
                audioTimelineEnd: NaN,
                scheduledAudioContextEnd: 0,
                scheduledAudioMediaEnd: 0,
                audioUnderruns: 0,
                audioUnderrunActive: false,
                maximumAvDrift: 0,
                audioTimestampCorrections: 0,
                rate: 1,
                volume: 1,
                muted: false,
                fitMode: "contain",
                rotation: 0,
                projection: "flat",
                stereoLayout: "mono",
                eyeOrder: "left_first",
                yaw: 0,
                pitch: 0,
                fov: 90,
                sourceHdr: false,
                colorPrimaries: "",
                colorTransfer: "",
                toneMapping: "auto",
                outputColorSpace: "srgb",
                cropLeft: 0,
                cropTop: 0,
                cropRight: 0,
                cropBottom: 0,
                hasVideo: false,
                hasAudio: false,
                audioInputSeen: false,
                animationFrame: 0,
                presentedFrames: 0,
                droppedFrames: 0,
                videoChunksSubmitted: 0,
                videoFramesDecoded: 0,
                videoFirstChunkAt: 0,
                videoStartupTimeoutMs: 8000,
                videoStallReported: false,
                lastPresentedTimestamp: -1,
                lastQueuedVideoTimestamp: -1,
                estimatedVideoFrameInterval: 1 / 30,
                lastStatsAt: performance.now(),
                webgl: null,
                context2d: null,
                stagingCanvas: null,
                stagingContext: null,
                renderOnly: Boolean(renderOnly)
            };

            function messageOf(error) {
                return String(error && error.message ? error.message : error);
            }
            function report(error) {
                if (!state.destroyed) onError(messageOf(error || "Media pipeline failed."));
            }
            function reportDecoder(kind, error) {
                if (!state.destroyed) onDecoderError(kind, messageOf(error || (kind + " decoder failed.")));
            }
            function connectAudioGraph() {
                if (!gain || !audioContext) return;
                try { gain.disconnect(); } catch (_) {}
                try { if (compressor) compressor.disconnect(); } catch (_) {}
                if (state.stableVolume && compressor) {
                    gain.connect(compressor);
                    compressor.connect(audioContext.destination);
                } else {
                    gain.connect(audioContext.destination);
                }
            }
            connectAudioGraph();

            function compileShader(gl, type, source) {
                const shader = gl.createShader(type);
                gl.shaderSource(shader, source);
                gl.compileShader(shader);
                if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                    throw new Error("WebGL shader compilation failed: " + gl.getShaderInfoLog(shader));
                }
                return shader;
            }
            function initializeWebGl() {
                const gl = canvas.getContext("webgl2", {
                    alpha: false,
                    antialias: false,
                    desynchronized: true,
                    powerPreference: "high-performance",
                    preserveDrawingBuffer: true
                });
                if (!gl) return null;
                const vertexSource = `#version 300 es
                    in vec2 aPosition;
                    out vec2 vUv;
                    void main() {
                        vUv = aPosition * 0.5 + 0.5;
                        gl_Position = vec4(aPosition, 0.0, 1.0);
                    }`;
                const fragmentSource = `#version 300 es
                    precision highp float;
                    uniform sampler2D uTexture;
                    uniform sampler2D uPlaneY;
                    uniform sampler2D uPlaneU;
                    uniform sampler2D uPlaneV;
                    uniform int uInputMode;
                    uniform int uYuvMatrix;
                    uniform int uFullRange;
                    uniform int uProjection;
                    uniform int uStereoLayout;
                    uniform int uEyeOrder;
                    uniform float uRotation;
                    uniform float uYaw;
                    uniform float uPitch;
                    uniform float uFov;
                    uniform float uAspect;
                    uniform int uToneMap;
                    uniform int uTransfer;
                    uniform int uPrimaries;
                    uniform vec4 uCrop;
                    in vec2 vUv;
                    out vec4 outColor;
                    const float PI = 3.141592653589793;

                    vec3 rotateView(vec3 d) {
                        float cy = cos(uYaw), sy = sin(uYaw);
                        float cp = cos(uPitch), sp = sin(uPitch);
                        d = vec3(cy*d.x + sy*d.z, d.y, -sy*d.x + cy*d.z);
                        return vec3(d.x, cp*d.y - sp*d.z, sp*d.y + cp*d.z);
                    }
                    vec2 rotateUv(vec2 uv) {
                        vec2 p = uv - 0.5;
                        float c = cos(uRotation), s = sin(uRotation);
                        return vec2(c*p.x - s*p.y, s*p.x + c*p.y) + 0.5;
                    }
                    vec2 sphericalUv(vec2 screen) {
                        float t = tan(radians(uFov) * 0.5);
                        vec3 direction = normalize(vec3(screen.x * t * uAspect, -screen.y * t, -1.0));
                        direction = rotateView(direction);
                        float longitude = atan(direction.x, -direction.z);
                        float latitude = asin(clamp(direction.y, -1.0, 1.0));
                        return vec2(longitude / (2.0 * PI) + 0.5, 0.5 - latitude / PI);
                    }
                    vec2 projectedUv(vec2 uv) {
                        if (uProjection == 0) return rotateUv(uv);
                        vec2 screen = uv * 2.0 - 1.0;
                        if (uProjection == 6) {
                            float radius = length(screen);
                            float longitude = atan(screen.y, screen.x) + uYaw;
                            float latitude = PI * 0.5 - 2.0 * atan(radius * 0.72);
                            return vec2(fract(longitude / (2.0 * PI) + 0.5), 0.5 - latitude / PI);
                        }
                        if (uProjection == 4) {
                            float radius = length(screen);
                            if (radius > 1.0) return vec2(-1.0);
                            float angle = radius * radians(uFov) * 0.5;
                            float longitude = atan(screen.y, screen.x) + uYaw;
                            return vec2(
                                0.5 + cos(longitude) * sin(angle) * 0.5,
                                0.5 + sin(longitude) * sin(angle) * 0.5
                            );
                        }
                        vec2 result = sphericalUv(screen);
                        if (uProjection == 2 || uProjection == 3) {
                            // A 180-degree equirectangular eye spans PI radians,
                            // whereas sphericalUv() returns the 2*PI mapping.
                            result.x = result.x * 2.0 - 0.5;
                        }
                        return result;
                    }
                    vec3 pqToLinear(vec3 value) {
                        const float m1 = 0.1593017578125;
                        const float m2 = 78.84375;
                        const float c1 = 0.8359375;
                        const float c2 = 18.8515625;
                        const float c3 = 18.6875;
                        vec3 p = pow(max(value, vec3(0.0)), vec3(1.0 / m2));
                        return pow(max(p - c1, vec3(0.0)) / max(c2 - c3 * p, vec3(0.00001)), vec3(1.0 / m1));
                    }
                    vec3 hlgToLinear(vec3 value) {
                        const float a = 0.17883277;
                        const float b = 0.28466892;
                        const float c = 0.55991073;
                        vec3 low = value * value / 3.0;
                        vec3 high = (exp((value - c) / a) + b) / 12.0;
                        return mix(low, high, step(vec3(0.5), value));
                    }
                    vec3 bt2020ToDisplayP3(vec3 value) {
                        return mat3(
                            1.343578, -0.065298, 0.002822,
                            -0.282179, 1.075788, -0.019599,
                            -0.061399, -0.010490, 1.016777
                        ) * value;
                    }
                    vec3 toneMap(vec3 color) {
                        vec3 linearColor =
                            uTransfer == 1
                                ? pqToLinear(color) * 10.0
                                : uTransfer == 2
                                    ? hlgToLinear(color) * 4.0
                                    : pow(max(color, vec3(0.0)), vec3(2.2));
                        if (uPrimaries == 1) {
                            linearColor = max(bt2020ToDisplayP3(linearColor), vec3(0.0));
                        }
                        vec3 mapped = (linearColor * (2.51 * linearColor + 0.03)) /
                            max(linearColor * (2.43 * linearColor + 0.59) + 0.14, vec3(0.00001));
                        return pow(clamp(mapped, 0.0, 1.0), vec3(1.0 / 2.2));
                    }
                    vec3 sampleSource(vec2 uv) {
                        if (uInputMode == 0) return texture(uTexture, uv).rgb;

                        // Typed-array texture uploads are not affected by
                        // UNPACK_FLIP_Y_WEBGL. Their first row is the source's
                        // top row, so invert Y while sampling them.
                        vec2 yuvUv = vec2(uv.x, 1.0 - uv.y);
                        float y = texture(uPlaneY, yuvUv).r;
                        float u;
                        float v;
                        if (uInputMode == 1) {
                            u = texture(uPlaneU, yuvUv).r;
                            v = texture(uPlaneV, yuvUv).r;
                        } else {
                            vec2 chroma = texture(uPlaneU, yuvUv).rg;
                            u = uInputMode == 3 ? chroma.g : chroma.r;
                            v = uInputMode == 3 ? chroma.r : chroma.g;
                        }

                        float cb = u - (128.0 / 255.0);
                        float cr = v - (128.0 / 255.0);
                        float luma =
                            uFullRange == 1
                                ? y
                                : 1.164383 * (y - 16.0 / 255.0);
                        vec3 rgb;
                        if (uYuvMatrix == 2) {
                            rgb = uFullRange == 1
                                ? vec3(
                                    luma + 1.4746 * cr,
                                    luma - 0.1646 * cb - 0.5714 * cr,
                                    luma + 1.8814 * cb
                                )
                                : vec3(
                                    luma + 1.6787 * cr,
                                    luma - 0.1873 * cb - 0.6504 * cr,
                                    luma + 2.1418 * cb
                                );
                        } else if (uYuvMatrix == 1) {
                            rgb = uFullRange == 1
                                ? vec3(
                                    luma + 1.5748 * cr,
                                    luma - 0.1873 * cb - 0.4681 * cr,
                                    luma + 1.8556 * cb
                                )
                                : vec3(
                                    luma + 1.7927 * cr,
                                    luma - 0.2132 * cb - 0.5329 * cr,
                                    luma + 2.1124 * cb
                                );
                        } else {
                            rgb = uFullRange == 1
                                ? vec3(
                                    luma + 1.4020 * cr,
                                    luma - 0.3441 * cb - 0.7141 * cr,
                                    luma + 1.7720 * cb
                                )
                                : vec3(
                                    luma + 1.5960 * cr,
                                    luma - 0.3918 * cb - 0.8130 * cr,
                                    luma + 2.0172 * cb
                                );
                        }
                        return clamp(rgb, 0.0, 1.0);
                    }
                    void main() {
                        vec2 projected = projectedUv(vUv);
                        vec2 eyeUv = vec2(
                            uCrop.x + projected.x * (1.0 - uCrop.x - uCrop.z),
                            uCrop.y + projected.y * (1.0 - uCrop.y - uCrop.w)
                        );
                        vec2 uv = eyeUv;
                        if (uStereoLayout == 1) {
                            uv.x = eyeUv.x * 0.5 + (uEyeOrder == 1 ? 0.5 : 0.0);
                        } else if (uStereoLayout == 2) {
                            uv.y = eyeUv.y * 0.5 + (uEyeOrder == 1 ? 0.5 : 0.0);
                        }
                        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
                            outColor = vec4(0.0, 0.0, 0.0, 1.0);
                            return;
                        }
                        vec3 color = sampleSource(uv);
                        if (uToneMap == 1) color = toneMap(color);
                        outColor = vec4(color, 1.0);
                    }`;
                const program = gl.createProgram();
                gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, vertexSource));
                gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource));
                gl.linkProgram(program);
                if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                    throw new Error("WebGL shader link failed: " + gl.getProgramInfoLog(program));
                }
                const buffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.bufferData(
                    gl.ARRAY_BUFFER,
                    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
                    gl.STATIC_DRAW
                );
                const position = gl.getAttribLocation(program, "aPosition");
                gl.enableVertexAttribArray(position);
                gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
                const texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                function createPlaneTexture() {
                    const result = gl.createTexture();
                    gl.bindTexture(gl.TEXTURE_2D, result);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    return result;
                }
                const planeY = createPlaneTexture();
                const planeU = createPlaneTexture();
                const planeV = createPlaneTexture();
                try {
                    if ("drawingBufferColorSpace" in gl) {
                        gl.drawingBufferColorSpace = "display-p3";
                    }
                } catch (_) {}
                const outputColorSpace =
                    "drawingBufferColorSpace" in gl
                        ? String(gl.drawingBufferColorSpace || "srgb")
                        : "srgb";
                return {
                    gl,
                    program,
                    texture,
                    planeY,
                    planeU,
                    planeV,
                    uploadedFrame: null,
                    uploadedInputMode: -1,
                    outputColorSpace,
                    uniforms: {
                        texture: gl.getUniformLocation(program, "uTexture"),
                        planeY: gl.getUniformLocation(program, "uPlaneY"),
                        planeU: gl.getUniformLocation(program, "uPlaneU"),
                        planeV: gl.getUniformLocation(program, "uPlaneV"),
                        inputMode: gl.getUniformLocation(program, "uInputMode"),
                        yuvMatrix: gl.getUniformLocation(program, "uYuvMatrix"),
                        fullRange: gl.getUniformLocation(program, "uFullRange"),
                        projection: gl.getUniformLocation(program, "uProjection"),
                        stereoLayout: gl.getUniformLocation(program, "uStereoLayout"),
                        eyeOrder: gl.getUniformLocation(program, "uEyeOrder"),
                        rotation: gl.getUniformLocation(program, "uRotation"),
                        yaw: gl.getUniformLocation(program, "uYaw"),
                        pitch: gl.getUniformLocation(program, "uPitch"),
                        fov: gl.getUniformLocation(program, "uFov"),
                        aspect: gl.getUniformLocation(program, "uAspect"),
                        toneMap: gl.getUniformLocation(program, "uToneMap"),
                        transfer: gl.getUniformLocation(program, "uTransfer"),
                        primaries: gl.getUniformLocation(program, "uPrimaries"),
                        crop: gl.getUniformLocation(program, "uCrop")
                    }
                };
            }
            try {
                state.webgl = initializeWebGl();
                if (state.webgl) state.outputColorSpace = state.webgl.outputColorSpace;
            } catch (error) {
                state.webgl = null;
            }
            if (!state.webgl) {
                state.context2d = canvas.getContext("2d", {
                    alpha: false,
                    desynchronized: true,
                    colorSpace: "display-p3"
                }) || canvas.getContext("2d");
                if (!state.context2d) throw new Error("Neither WebGL2 nor Canvas2D is available.");
            }
            state.stagingCanvas =
                typeof OffscreenCanvas === "function"
                    ? new OffscreenCanvas(1, 1)
                    : document.createElement("canvas");
            state.stagingContext = state.stagingCanvas.getContext("2d", { alpha: false });

            function stopScheduledAudio() {
                state.scheduledSources.forEach(function(item) {
                    try { item.source.stop(); } catch (_) {}
                    item.segment.scheduled = false;
                });
                state.scheduledSources.length = 0;
                state.scheduledAudioContextEnd = 0;
                state.scheduledAudioMediaEnd = state.position;
                state.audioClockValid = false;
                state.audioUnderrunActive = false;
            }
            function closeFrame(frame) {
                try {
                    if (frame && typeof frame.close === "function") frame.close();
                } catch (_) {}
            }
            function closeFrames() {
                state.videoFrames.forEach(closeFrame);
                state.videoFrames.length = 0;
                if (state.webgl) state.webgl.uploadedFrame = null;
                state.lastPresentedTimestamp = -1;
                state.lastQueuedVideoTimestamp = -1;
                state.estimatedVideoFrameInterval = 1 / 30;
            }
            function enqueueVideoFrame(frame, maximumFrames) {
                const timestamp = Number(frame && frame.timestamp) / 1000000;
                if (!Number.isFinite(timestamp)) {
                    closeFrame(frame);
                    state.droppedFrames += 1;
                    return;
                }
                const timestampMicros = Number(frame.timestamp);
                if (
                    state.lastPresentedTimestamp >= 0 &&
                    timestampMicros < state.lastPresentedTimestamp
                ) {
                    closeFrame(frame);
                    state.droppedFrames += 1;
                    return;
                }
                if (state.lastQueuedVideoTimestamp >= 0 && timestamp > state.lastQueuedVideoTimestamp) {
                    const interval = timestamp - state.lastQueuedVideoTimestamp;
                    if (interval > 0.001 && interval < 1) {
                        state.estimatedVideoFrameInterval =
                            state.estimatedVideoFrameInterval * 0.85 + interval * 0.15;
                    }
                }
                state.lastQueuedVideoTimestamp = Math.max(
                    state.lastQueuedVideoTimestamp,
                    timestamp
                );
                const position =
                    state.playing && !state.buffering ? clockNow() : state.position;
                const lateTolerance = Math.max(
                    0.12,
                    state.estimatedVideoFrameInterval * 3
                );
                if (
                    state.playing &&
                    !state.buffering &&
                    timestamp < position - lateTolerance
                ) {
                    closeFrame(frame);
                    state.droppedFrames += 1;
                    return;
                }
                state.videoFrames.push(frame);
                state.videoFrames.sort(
                    (left, right) => Number(left.timestamp || 0) - Number(right.timestamp || 0)
                );
                while (state.videoFrames.length > maximumFrames) {
                    const discarded = state.videoFrames.shift();
                    if (Number(discarded && discarded.timestamp || 0) !== state.lastPresentedTimestamp) {
                        state.droppedFrames += 1;
                    }
                    closeFrame(discarded);
                }
                if (state.playing && state.buffering) maybeResumeAndSchedule();
            }
            function closeDecoders() {
                if (state.videoDecoder) {
                    try { state.videoDecoder.close(); } catch (_) {}
                    state.videoDecoder = null;
                }
                if (state.audioDecoder) {
                    try { state.audioDecoder.close(); } catch (_) {}
                    state.audioDecoder = null;
                }
            }
            function clockNow() {
                if (!state.playing || state.buffering) return state.position;
                const elapsed =
                    state.audioContext && state.audioContext.state === "running"
                        ? state.audioContext.currentTime - state.baseContextTime
                        : (performance.now() - state.baseWallTime) / 1000;
                const wallPosition = state.basePosition + Math.max(0, elapsed) * state.rate;
                if (
                    state.hasAudio &&
                    state.audioInputSeen &&
                    state.audioClockValid &&
                    state.audioContext &&
                    state.audioContext.state === "running"
                ) {
                    const audioPosition =
                        state.audioClockMediaPosition +
                        Math.max(0, state.audioContext.currentTime - state.audioClockContextTime) *
                            state.rate;
                    state.position = Math.min(audioPosition, state.audioClockMediaEnd);
                } else if (
                    state.hasAudio &&
                    state.audioInputSeen &&
                    state.audioContext &&
                    state.audioContext.state === "running"
                ) {
                    // Never let a wall clock run video past starved audio.
                    // The AudioContext timeline becomes authoritative as soon
                    // as the first PCM block has been observed.
                    state.position = Math.min(state.position, wallPosition);
                } else {
                    // Autoplay policies may keep AudioContext suspended until
                    // a user gesture. There is no audible clock in that state,
                    // so video/time must remain usable on the wall-clock path.
                    state.position = wallPosition;
                }
                if (state.duration > 0) state.position = Math.min(state.position, state.duration);
                return state.position;
            }
            function anchorClock(position) {
                state.position = Math.max(0, Number(position || 0));
                state.basePosition = state.position;
                state.baseWallTime = performance.now();
                state.baseContextTime = state.audioContext ? state.audioContext.currentTime : 0;
                state.audioClockValid = false;
                state.audioClockMediaEnd = state.position;
            }
            function setBuffering(buffering) {
                if (state.buffering === buffering || !state.playing) return;
                if (buffering) clockNow();
                state.buffering = buffering;
                anchorClock(state.position);
                onState(buffering ? "buffering" : "playing");
            }
            function ensureCanvasSize(sourceWidth, sourceHeight) {
                const pixelRatio = Number(globalThis.devicePixelRatio || 1);
                const rect = canvas.getBoundingClientRect();
                const rotated = Math.abs(state.rotation % 180) === 90;
                const displayWidth = rotated ? sourceHeight : sourceWidth;
                const displayHeight = rotated ? sourceWidth : sourceHeight;
                const targetWidth = Math.max(1, Math.round((rect.width || displayWidth) * pixelRatio));
                const targetHeight = Math.max(1, Math.round((rect.height || displayHeight) * pixelRatio));
                if (canvas.width !== targetWidth) canvas.width = targetWidth;
                if (canvas.height !== targetHeight) canvas.height = targetHeight;
                return { width: targetWidth, height: targetHeight };
            }
            function softwareFrameSource(frame) {
                const width = frame.width;
                const height = frame.height;
                const packedSize = width * height * 4;
                let packed;
                const input = new Uint8Array(frame.rgba.buffer, frame.rgba.byteOffset, frame.rgba.byteLength);
                if (frame.lineSize === width * 4 && input.byteLength >= packedSize) {
                    packed = new Uint8ClampedArray(input.buffer, input.byteOffset, packedSize);
                } else {
                    packed = new Uint8ClampedArray(packedSize);
                    for (let row = 0; row < height; row += 1) {
                        packed.set(input.subarray(row * frame.lineSize, row * frame.lineSize + width * 4), row * width * 4);
                    }
                }
                if (state.stagingCanvas.width !== width) state.stagingCanvas.width = width;
                if (state.stagingCanvas.height !== height) state.stagingCanvas.height = height;
                state.stagingContext.putImageData(new ImageData(packed, width, height), 0, 0);
                return state.stagingCanvas;
            }
            function softwareYuvFrameSource(frame) {
                if (frame.canvasSource) return frame.canvasSource;
                const width = frame.width;
                const height = frame.height;
                const yPlane = new Uint8Array(
                    frame.y.buffer,
                    frame.y.byteOffset,
                    frame.y.byteLength
                );
                const uPlane = new Uint8Array(
                    frame.u.buffer,
                    frame.u.byteOffset,
                    frame.u.byteLength
                );
                const vPlane = new Uint8Array(
                    frame.v.buffer,
                    frame.v.byteOffset,
                    frame.v.byteLength
                );
                const packed = new Uint8ClampedArray(width * height * 4);
                const format = String(frame.format || "").toLowerCase();
                const matrix = String(frame.matrix || "").toLowerCase();
                const fullRange = Boolean(frame.fullRange) || format.includes("yuvj");
                const subsampleX = format.includes("444") ? 1 : 2;
                const subsampleY = format.includes("420") || format === "nv12" || format === "nv21" ? 2 : 1;
                const isNv = format === "nv12" || format === "nv21";
                for (let row = 0; row < height; row += 1) {
                    for (let column = 0; column < width; column += 1) {
                        const yValue = yPlane[row * frame.lineY + column];
                        const chromaRow = Math.floor(row / subsampleY);
                        const chromaColumn = Math.floor(column / subsampleX);
                        let uValue;
                        let vValue;
                        if (isNv) {
                            const chromaOffset = chromaRow * frame.lineU + chromaColumn * 2;
                            const first = uPlane[chromaOffset];
                            const second = uPlane[chromaOffset + 1];
                            uValue = format === "nv21" ? second : first;
                            vValue = format === "nv21" ? first : second;
                        } else {
                            uValue = uPlane[chromaRow * frame.lineU + chromaColumn];
                            vValue = vPlane[chromaRow * frame.lineV + chromaColumn];
                        }
                        const u = uValue - 128;
                        const v = vValue - 128;
                        const y = fullRange ? yValue : 1.164383 * (yValue - 16);
                        let red;
                        let green;
                        let blue;
                        if (matrix.includes("2020")) {
                            red = y + (fullRange ? 1.4746 : 1.6787) * v;
                            green = y - (fullRange ? 0.1646 : 0.1873) * u -
                                (fullRange ? 0.5714 : 0.6504) * v;
                            blue = y + (fullRange ? 1.8814 : 2.1418) * u;
                        } else if (matrix.includes("709")) {
                            red = y + (fullRange ? 1.5748 : 1.7927) * v;
                            green = y - (fullRange ? 0.1873 : 0.2132) * u -
                                (fullRange ? 0.4681 : 0.5329) * v;
                            blue = y + (fullRange ? 1.8556 : 2.1124) * u;
                        } else {
                            red = y + (fullRange ? 1.4020 : 1.5960) * v;
                            green = y - (fullRange ? 0.3441 : 0.3918) * u -
                                (fullRange ? 0.7141 : 0.8130) * v;
                            blue = y + (fullRange ? 1.7720 : 2.0172) * u;
                        }
                        const target = (row * width + column) * 4;
                        packed[target] = Math.max(0, Math.min(255, Math.round(red)));
                        packed[target + 1] = Math.max(0, Math.min(255, Math.round(green)));
                        packed[target + 2] = Math.max(0, Math.min(255, Math.round(blue)));
                        packed[target + 3] = 255;
                    }
                }
                const converted =
                    typeof OffscreenCanvas === "function"
                        ? new OffscreenCanvas(width, height)
                        : document.createElement("canvas");
                converted.width = width;
                converted.height = height;
                const convertedContext = converted.getContext("2d", { alpha: false });
                convertedContext.putImageData(new ImageData(packed, width, height), 0, 0);
                frame.canvasSource = converted;
                return converted;
            }
            function projectionCode(name) {
                switch (name) {
                    case "equirectangular": return 1;
                    case "half_equirectangular": return 2;
                    case "vr180": return 3;
                    case "fisheye": return 4;
                    case "side_by_side": return 5;
                    case "little_planet": return 6;
                    default: return 0;
                }
            }
            function uploadPlaneTexture(
                renderer,
                texture,
                unit,
                width,
                height,
                lineSize,
                components,
                bytes,
                allocationKey
            ) {
                const gl = renderer.gl;
                const source = new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
                const format = components === 2 ? gl.RG : gl.RED;
                const internalFormat = components === 2 ? gl.RG8 : gl.R8;
                const rowLength = Math.max(width, Math.floor(lineSize / components));
                gl.activeTexture(gl.TEXTURE0 + unit);
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
                gl.pixelStorei(gl.UNPACK_ROW_LENGTH, rowLength);
                const allocation = renderer[allocationKey];
                if (
                    allocation &&
                    allocation.width === width &&
                    allocation.height === height &&
                    allocation.components === components
                ) {
                    gl.texSubImage2D(
                        gl.TEXTURE_2D,
                        0,
                        0,
                        0,
                        width,
                        height,
                        format,
                        gl.UNSIGNED_BYTE,
                        source
                    );
                } else {
                    gl.texImage2D(
                        gl.TEXTURE_2D,
                        0,
                        internalFormat,
                        width,
                        height,
                        0,
                        format,
                        gl.UNSIGNED_BYTE,
                        source
                    );
                    renderer[allocationKey] = { width, height, components };
                }
                gl.pixelStorei(gl.UNPACK_ROW_LENGTH, 0);
            }
            function uploadYuvFrame(renderer, frame) {
                const format = String(frame.format || "").toLowerCase();
                const planar444 = format.includes("444");
                const planar422 = format.includes("422");
                const nv = format === "nv12" || format === "nv21";
                const chromaWidth = planar444 ? frame.width : Math.ceil(frame.width / 2);
                const chromaHeight =
                    planar444 || planar422 ? frame.height : Math.ceil(frame.height / 2);
                uploadPlaneTexture(
                    renderer,
                    renderer.planeY,
                    1,
                    frame.width,
                    frame.height,
                    frame.lineY,
                    1,
                    frame.y,
                    "planeYAllocation"
                );
                uploadPlaneTexture(
                    renderer,
                    renderer.planeU,
                    2,
                    chromaWidth,
                    chromaHeight,
                    frame.lineU,
                    nv ? 2 : 1,
                    frame.u,
                    "planeUAllocation"
                );
                if (!nv) {
                    uploadPlaneTexture(
                        renderer,
                        renderer.planeV,
                        3,
                        chromaWidth,
                        chromaHeight,
                        frame.lineV,
                        1,
                        frame.v,
                        "planeVAllocation"
                    );
                }
                return nv ? (format === "nv21" ? 3 : 2) : 1;
            }
            function drawWithWebGl(source, sourceWidth, sourceHeight, frame) {
                const renderer = state.webgl;
                const gl = renderer.gl;
                const size = ensureCanvasSize(sourceWidth, sourceHeight);
                gl.viewport(0, 0, size.width, size.height);
                gl.useProgram(renderer.program);
                let inputMode = 0;
                if (frame && frame.softwareYuv) {
                    if (
                        renderer.uploadedFrame !== frame ||
                        renderer.uploadedInputMode === 0
                    ) {
                        inputMode = uploadYuvFrame(renderer, frame);
                        renderer.uploadedFrame = frame;
                        renderer.uploadedInputMode = inputMode;
                    } else {
                        inputMode = renderer.uploadedInputMode;
                    }
                } else {
                    if (
                        renderer.uploadedFrame !== frame ||
                        renderer.uploadedInputMode !== 0
                    ) {
                        gl.activeTexture(gl.TEXTURE0);
                        gl.bindTexture(gl.TEXTURE_2D, renderer.texture);
                        gl.pixelStorei(gl.UNPACK_ROW_LENGTH, 0);
                        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                        gl.texImage2D(
                            gl.TEXTURE_2D,
                            0,
                            gl.RGBA,
                            gl.RGBA,
                            gl.UNSIGNED_BYTE,
                            source
                        );
                        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                        renderer.uploadedFrame = frame;
                        renderer.uploadedInputMode = 0;
                    }
                }
                gl.uniform1i(renderer.uniforms.texture, 0);
                gl.uniform1i(renderer.uniforms.planeY, 1);
                gl.uniform1i(renderer.uniforms.planeU, 2);
                gl.uniform1i(renderer.uniforms.planeV, 3);
                gl.uniform1i(renderer.uniforms.inputMode, inputMode);
                const matrix = String(frame && frame.matrix || "").toLowerCase();
                gl.uniform1i(
                    renderer.uniforms.yuvMatrix,
                    matrix.includes("2020") ? 2 : matrix.includes("709") ? 1 : 0
                );
                gl.uniform1i(
                    renderer.uniforms.fullRange,
                    frame && (frame.fullRange || String(frame.format || "").includes("yuvj")) ? 1 : 0
                );
                gl.uniform1i(renderer.uniforms.projection, projectionCode(state.projection));
                gl.uniform1i(
                    renderer.uniforms.stereoLayout,
                    state.stereoLayout === "side_by_side" ? 1 :
                        state.stereoLayout === "over_under" ? 2 : 0
                );
                gl.uniform1i(renderer.uniforms.eyeOrder, state.eyeOrder === "right_first" ? 1 : 0);
                gl.uniform1f(renderer.uniforms.rotation, -state.rotation * Math.PI / 180);
                gl.uniform1f(renderer.uniforms.yaw, state.yaw * Math.PI / 180);
                gl.uniform1f(renderer.uniforms.pitch, state.pitch * Math.PI / 180);
                gl.uniform1f(renderer.uniforms.fov, state.fov);
                gl.uniform1f(renderer.uniforms.aspect, size.width / Math.max(1, size.height));
                const shouldToneMap =
                    state.sourceHdr &&
                    (state.toneMapping === "shader" || state.toneMapping === "auto");
                gl.uniform1i(renderer.uniforms.toneMap, shouldToneMap ? 1 : 0);
                gl.uniform1i(
                    renderer.uniforms.transfer,
                    state.colorTransfer === "pq" ? 1 : state.colorTransfer === "hlg" ? 2 : 0
                );
                gl.uniform1i(
                    renderer.uniforms.primaries,
                    state.colorPrimaries === "bt2020" ? 1 : 0
                );
                gl.uniform4f(
                    renderer.uniforms.crop,
                    state.cropLeft,
                    state.cropTop,
                    state.cropRight,
                    state.cropBottom
                );
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            }
            function drawWithCanvas2d(source, sourceWidth, sourceHeight) {
                const context = state.context2d;
                const size = ensureCanvasSize(sourceWidth, sourceHeight);
                let drawWidth = size.width;
                let drawHeight = size.height;
                let x = 0;
                let y = 0;
                if (state.fitMode !== "fill") {
                    const scale =
                        state.fitMode === "cover"
                            ? Math.max(size.width / sourceWidth, size.height / sourceHeight)
                            : Math.min(size.width / sourceWidth, size.height / sourceHeight);
                    drawWidth = sourceWidth * scale;
                    drawHeight = sourceHeight * scale;
                    x = (size.width - drawWidth) / 2;
                    y = (size.height - drawHeight) / 2;
                }
                context.save();
                context.fillStyle = "#000";
                context.fillRect(0, 0, size.width, size.height);
                context.translate(size.width / 2, size.height / 2);
                context.rotate(state.rotation * Math.PI / 180);
                context.translate(-size.width / 2, -size.height / 2);
                const cropX = sourceWidth * state.cropLeft;
                const cropY = sourceHeight * state.cropTop;
                const cropWidth = sourceWidth * (1 - state.cropLeft - state.cropRight);
                const cropHeight = sourceHeight * (1 - state.cropTop - state.cropBottom);
                context.drawImage(
                    source,
                    cropX,
                    cropY,
                    cropWidth,
                    cropHeight,
                    x,
                    y,
                    drawWidth,
                    drawHeight
                );
                context.restore();
            }
            function drawVideo(position) {
                const frames = state.videoFrames;
                const earlyTolerance = Math.min(
                    0.012,
                    Math.max(0.002, state.estimatedVideoFrameInterval * 0.25)
                );
                const lateTolerance = Math.max(
                    0.12,
                    state.estimatedVideoFrameInterval * 3
                );
                while (
                    frames.length > 1 &&
                    Number(frames[1].timestamp || 0) / 1000000 <= position + earlyTolerance
                ) {
                    const discarded = frames.shift();
                    if (Number(discarded && discarded.timestamp || 0) !== state.lastPresentedTimestamp) {
                        state.droppedFrames += 1;
                    }
                    closeFrame(discarded);
                }
                const frame = frames[0];
                if (!frame) return;
                const frameTime = Number(frame.timestamp || 0) / 1000000;
                if (
                    state.lastPresentedTimestamp >= 0 &&
                    Number(frame.timestamp || 0) < state.lastPresentedTimestamp
                ) {
                    frames.shift();
                    state.droppedFrames += 1;
                    closeFrame(frame);
                    return;
                }
                if (frameTime < position - lateTolerance) {
                    frames.shift();
                    if (Number(frame.timestamp || 0) !== state.lastPresentedTimestamp) {
                        state.droppedFrames += 1;
                    }
                    closeFrame(frame);
                    return;
                }
                if (frameTime > position + earlyTolerance) return;
                const sourceWidth = Number(frame.width || frame.displayWidth || frame.codedWidth || 1);
                const sourceHeight = Number(frame.height || frame.displayHeight || frame.codedHeight || 1);
                try {
                    const source =
                        frame.softwareYuv && state.webgl
                            ? null
                            : frame.softwareYuv
                            ? softwareYuvFrameSource(frame)
                            : frame.software
                                ? softwareFrameSource(frame)
                                : frame;
                    if (state.webgl) drawWithWebGl(source, sourceWidth, sourceHeight, frame);
                    else drawWithCanvas2d(source, sourceWidth, sourceHeight);
                    const timestamp = Number(frame.timestamp || 0);
                    if (timestamp !== state.lastPresentedTimestamp) {
                        state.presentedFrames += 1;
                        state.lastPresentedTimestamp = timestamp;
                        state.maximumAvDrift = Math.max(
                            state.maximumAvDrift,
                            Math.abs(timestamp / 1000000 - position)
                        );
                    }
                } catch (error) {
                    report(error);
                }
            }
            function drawExternalFrame(source, timestampSeconds) {
                if (state.destroyed || !source) return;
                const sourceWidth = Number(source.videoWidth || source.width || 0);
                const sourceHeight = Number(source.videoHeight || source.height || 0);
                if (!sourceWidth || !sourceHeight) return;
                const timestamp = Math.max(0, Number(timestampSeconds || 0)) * 1000000;
                const frame = {
                    timestamp,
                    width: sourceWidth,
                    height: sourceHeight,
                    mediaElementSource: source
                };
                if (state.webgl) drawWithWebGl(source, sourceWidth, sourceHeight, frame);
                else drawWithCanvas2d(source, sourceWidth, sourceHeight);
                if (timestamp !== state.lastPresentedTimestamp) {
                    state.presentedFrames += 1;
                    state.lastPresentedTimestamp = timestamp;
                }
            }
            function enqueueAudioSegment(segment) {
                if (!segment.frames || !segment.channels || !segment.sampleRate) return;
                const mediaDuration = Math.max(
                    0,
                    Number(segment.mediaDuration || segment.duration || 0)
                );
                if (!mediaDuration) return;
                const rawTimestamp = Math.max(0, Number(segment.timestamp || 0));
                let timestamp = rawTimestamp;
                if (Number.isFinite(state.audioTimelineEnd)) {
                    const delta = rawTimestamp - state.audioTimelineEnd;
                    // Decoder/container timestamp rounding often leaves a tiny
                    // hole or overlap between otherwise adjacent PCM blocks.
                    // A backward timestamp while packets are decoded in order
                    // is also an unusable decoder timestamp, not a reason to
                    // replay samples over already-scheduled audio.
                    if (delta <= 0.08) {
                        timestamp = state.audioTimelineEnd;
                        if (Math.abs(delta) > 0.0005) {
                            state.audioTimestampCorrections += 1;
                        }
                    }
                }
                segment.timestamp = timestamp;
                segment.mediaDuration = mediaDuration;
                state.audioTimelineEnd = timestamp + mediaDuration;
                state.audioInputSeen = true;
                state.audioSegments.push(segment);
                state.audioSegments.sort(function(a, b) { return a.timestamp - b.timestamp; });
                maybeResumeAndSchedule();
            }
            function copyAudioData(data) {
                const channels = Number(data.numberOfChannels || 0);
                const frames = Number(data.numberOfFrames || 0);
                const sampleRate = Number(data.sampleRate || 0);
                if (!channels || !frames || !sampleRate) {
                    try { data.close(); } catch (_) {}
                    return;
                }
                try {
                    const planes = [];
                    for (let channel = 0; channel < channels; channel += 1) {
                        const plane = new Float32Array(frames);
                        data.copyTo(plane, { planeIndex: channel, format: "f32-planar" });
                        planes.push(plane);
                    }
                    enqueueAudioSegment({
                        timestamp: Number(data.timestamp || 0) / 1000000,
                        mediaDuration: frames / sampleRate,
                        duration: frames / sampleRate,
                        sampleRate,
                        frames,
                        channels,
                        planes,
                        scheduled: false,
                        stretched: false
                    });
                } catch (error) {
                    reportDecoder("audio", error);
                } finally {
                    try { data.close(); } catch (_) {}
                }
            }
            function queuedAudioEnd() {
                let end = state.position;
                state.audioSegments.forEach(function(segment) {
                    end = Math.max(end, segment.timestamp + segment.mediaDuration);
                });
                state.scheduledSources.forEach(function(item) {
                    end = Math.max(end, item.segment.timestamp + item.segment.mediaDuration);
                });
                return end;
            }
            function audibleAudioAhead() {
                if (!state.audioContext) return 0;
                return Math.max(
                    0,
                    (state.scheduledAudioContextEnd - state.audioContext.currentTime) * state.rate
                );
            }
            function scheduleAudio(position) {
                if (!state.audioContext || !state.gain || !state.playing || state.buffering) return;
                state.gain.gain.value = state.muted ? 0 : Math.pow(state.volume, 2.0);
                state.audioSegments.forEach(function(segment) {
                    const end = segment.timestamp + segment.mediaDuration;
                    if (segment.scheduled || end < position - 0.05 || segment.timestamp > position + 6) return;
                    try {
                        const buffer = state.audioContext.createBuffer(
                            segment.channels,
                            segment.frames,
                            segment.sampleRate
                        );
                        for (let channel = 0; channel < segment.channels; channel += 1) {
                            buffer.copyToChannel(segment.planes[channel], channel);
                        }
                        const source = state.audioContext.createBufferSource();
                        source.buffer = buffer;
                        source.playbackRate.value = segment.stretched ? 1 : state.rate;
                        source.connect(state.gain);
                        const mediaOffset = Math.min(
                            segment.mediaDuration,
                            Math.max(0, position - segment.timestamp)
                        );
                        const bufferOffset =
                            segment.stretched
                                ? mediaOffset / Math.max(0.25, state.rate)
                                : mediaOffset;
                        if (bufferOffset >= buffer.duration - 0.0001) {
                            segment.scheduled = true;
                            return;
                        }
                        const now = state.audioContext.currentTime;
                        const minTime = now + 0.025;
                        const mediaAtStart = segment.timestamp + mediaOffset;
                        let when;
                        if (state.scheduledAudioContextEnd > now) {
                            const mediaGap = mediaAtStart - state.scheduledAudioMediaEnd;
                            when =
                                state.scheduledAudioContextEnd +
                                Math.max(0, mediaGap / state.rate);
                        } else {
                            when =
                                minTime +
                                Math.max(0, (mediaAtStart - position) / state.rate);
                        }
                        when = Math.max(when, minTime);
                        const wasUnderrun =
                            state.audioClockValid &&
                            state.scheduledAudioContextEnd > 0 &&
                            state.scheduledAudioContextEnd < now - 0.005;
                        if (!state.audioClockValid || wasUnderrun) {
                            if (wasUnderrun && !state.audioUnderrunActive) {
                                state.audioUnderruns += 1;
                                state.audioUnderrunActive = true;
                            }
                            state.audioClockMediaPosition = mediaAtStart;
                            state.audioClockContextTime = when;
                            state.audioClockValid = true;
                        }
                        source.start(when, bufferOffset);
                        segment.scheduled = true;
                        const playbackRate = Math.max(0.25, Number(source.playbackRate.value || 1));
                        const contextDuration = (buffer.duration - bufferOffset) / playbackRate;
                        const contextEnd = when + contextDuration;
                        const mediaEnd = segment.timestamp + segment.mediaDuration;
                        state.scheduledAudioContextEnd = Math.max(
                            state.scheduledAudioContextEnd,
                            contextEnd
                        );
                        state.scheduledAudioMediaEnd = Math.max(
                            state.scheduledAudioMediaEnd,
                            mediaEnd
                        );
                        state.audioClockMediaEnd = Math.max(state.audioClockMediaEnd, mediaEnd);
                        state.audioUnderrunActive = false;
                        const item = {
                            source,
                            segment,
                            contextStart: when,
                            contextEnd,
                            mediaEnd
                        };
                        state.scheduledSources.push(item);
                        source.onended = function() {
                            const index = state.scheduledSources.indexOf(item);
                            if (index >= 0) state.scheduledSources.splice(index, 1);
                        };
                    } catch (error) {
                        report(error);
                    }
                });
                state.audioSegments = state.audioSegments.filter(function(segment) {
                    return segment.timestamp + segment.mediaDuration >= position - 1;
                });
            }
            function maybeResumeAndSchedule() {
                if (!state.playing) return;
                const audioAhead = queuedAudioEnd() - state.position;
                if (state.buffering) {
                    const waitingForVideo =
                        state.hasVideo && state.videoFrames.length === 0;
                    const waitingForAudio =
                        state.hasAudio && state.audioInputSeen && audioAhead < 0.35;
                    if (!state.eof && (waitingForVideo || waitingForAudio)) return;
                    setBuffering(false);
                }
                scheduleAudio(clockNow());
            }
            function tick() {
                if (state.destroyed) return;
                maybeResumeAndSchedule();
                if (
                    state.playing &&
                    state.buffering &&
                    state.videoDecoder &&
                    !state.videoStallReported &&
                    state.videoChunksSubmitted > 0 &&
                    state.videoFramesDecoded === 0 &&
                    performance.now() - state.videoFirstChunkAt >= state.videoStartupTimeoutMs
                ) {
                    state.videoStallReported = true;
                    state.reportDecoder(
                        "video",
                        new Error(
                            "WebCodecs accepted the video configuration but produced no frame during preroll."
                        )
                    );
                }
                const position = clockNow();
                scheduleAudio(position);
                const audioAhead = queuedAudioEnd() - position;
                const audibleAhead = audibleAudioAhead();
                if (
                    state.hasAudio &&
                    state.audioInputSeen &&
                    !state.eof &&
                    state.audioContext &&
                    state.audioContext.state === "running"
                ) {
                    if (
                        !state.buffering &&
                        state.audioClockValid &&
                        audibleAhead < 0.005 &&
                        audioAhead < 0.02
                    ) {
                        if (!state.audioUnderrunActive) {
                            state.audioUnderruns += 1;
                            state.audioUnderrunActive = true;
                        }
                        setBuffering(true);
                    } else if (state.buffering && audioAhead >= 0.35) {
                        setBuffering(false);
                        scheduleAudio(state.position);
                    }
                }
                drawVideo(state.position);
                if (state.playing && !state.buffering) onTime(state.position);
                const finalVideoFrame = state.videoFrames[0];
                const videoQueueEmpty =
                    state.videoFrames.length === 0 ||
                    (
                        state.videoFrames.length === 1 &&
                        Number(finalVideoFrame && finalVideoFrame.timestamp || 0) ===
                            state.lastPresentedTimestamp
                    );
                const queuesEmpty =
                    videoQueueEmpty &&
                    state.audioSegments.length === 0 &&
                    state.scheduledSources.length === 0 &&
                    (!state.videoDecoder || state.videoDecoder.decodeQueueSize === 0) &&
                    (!state.audioDecoder || state.audioDecoder.decodeQueueSize === 0);
                if (
                    state.playing &&
                    state.eof &&
                    !state.ended &&
                    ((state.duration > 0 && state.position >= state.duration - 0.01) ||
                        queuesEmpty)
                ) {
                    state.ended = true;
                    state.playing = false;
                    onState("ended");
                    onEnded();
                }
                state.animationFrame = requestAnimationFrame(tick);
            }
            if (!state.renderOnly) state.animationFrame = requestAnimationFrame(tick);
            state.stopScheduledAudio = stopScheduledAudio;
            state.closeFrames = closeFrames;
            state.closeDecoders = closeDecoders;
            state.clockNow = clockNow;
            state.anchorClock = anchorClock;
            state.setBuffering = setBuffering;
            state.report = report;
            state.reportDecoder = reportDecoder;
            state.copyAudioData = copyAudioData;
            state.enqueueVideoFrame = enqueueVideoFrame;
            state.drawExternalFrame = drawExternalFrame;
            state.enqueueAudioSegment = enqueueAudioSegment;
            state.queuedAudioEnd = queuedAudioEnd;
            state.audibleAudioAhead = audibleAudioAhead;
            state.maybeResumeAndSchedule = maybeResumeAndSchedule;
            state.connectAudioGraph = connectAudioGraph;
            return state;
        })()
        """,
    )

@Suppress("UNUSED_PARAMETER", "LongParameterList")
internal fun configureMediaPipeline(
    pipeline: JsAny,
    requestWebVideo: Boolean,
    preferHardwareVideo: Boolean = true,
    videoCodec: String,
    videoFallbackCodecs: String,
    videoWidth: Int,
    videoHeight: Int,
    videoDescription: Int8Array?,
    colorPrimaries: String,
    colorTransfer: String,
    colorMatrix: String,
    requestWebAudio: Boolean,
    audioCodec: String,
    audioSampleRate: Int,
    audioChannels: Int,
    audioDescription: Int8Array?,
    duration: Double,
    onComplete: (String, String) -> Unit,
    onError: (String) -> Unit,
): Unit =
    js(
        """
        {
            (async function() {
                pipeline.stopScheduledAudio();
                pipeline.closeFrames();
                pipeline.closeDecoders();
                pipeline.audioSegments.length = 0;
                pipeline.pendingPcm = null;
                pipeline.eof = false;
                pipeline.ended = false;
                pipeline.buffering = false;
                pipeline.audioInputSeen = false;
                pipeline.audioClockValid = false;
                pipeline.audioClockMediaEnd = pipeline.position;
                pipeline.audioTimelineEnd = NaN;
                pipeline.scheduledAudioContextEnd = 0;
                pipeline.scheduledAudioMediaEnd = pipeline.position;
                pipeline.audioUnderruns = 0;
                pipeline.audioUnderrunActive = false;
                pipeline.maximumAvDrift = 0;
                pipeline.audioTimestampCorrections = 0;
                pipeline.videoChunksSubmitted = 0;
                pipeline.videoFramesDecoded = 0;
                pipeline.videoFirstChunkAt = 0;
                pipeline.videoStallReported = false;
                pipeline.duration = Math.max(0, Number(duration || 0));
                pipeline.hasVideo = Boolean(videoCodec);
                pipeline.hasAudio = Boolean(audioCodec);

                function normalizePrimaries(value) {
                    value = String(value || "").toLowerCase();
                    if (value.includes("2020")) return "bt2020";
                    if (value.includes("709")) return "bt709";
                    if (value.includes("470bg")) return "bt470bg";
                    if (value.includes("170")) return "smpte170m";
                    return null;
                }
                function normalizeTransfer(value) {
                    value = String(value || "").toLowerCase();
                    if (value.includes("2084") || value === "pq") return "pq";
                    if (value.includes("b67") || value === "hlg") return "hlg";
                    if (value.includes("709")) return "bt709";
                    if (value.includes("srgb") || value.includes("61966")) return "iec61966-2-1";
                    return null;
                }
                function normalizeMatrix(value) {
                    value = String(value || "").toLowerCase();
                    if (value.includes("2020")) return "bt2020-ncl";
                    if (value.includes("709")) return "bt709";
                    if (value.includes("170")) return "smpte170m";
                    return null;
                }
                pipeline.colorPrimaries = normalizePrimaries(colorPrimaries) || "";
                pipeline.colorTransfer = normalizeTransfer(colorTransfer) || "";
                function isAnnexB(description) {
                    return description && description.byteLength >= 4 &&
                        description[0] === 0 && description[1] === 0 &&
                        (description[2] === 1 || (description[2] === 0 && description[3] === 1));
                }
                async function supportedVideoConfig(codec) {
                    const base = {
                        codec,
                        codedWidth: Math.max(1, videoWidth),
                        codedHeight: Math.max(1, videoHeight)
                    };
                    if (preferHardwareVideo) base.hardwareAcceleration = "prefer-hardware";
                    if (videoDescription && videoDescription.byteLength && !isAnnexB(videoDescription)) {
                        base.description = videoDescription;
                    }
                    const primaries = normalizePrimaries(colorPrimaries);
                    const transfer = normalizeTransfer(colorTransfer);
                    const matrix = normalizeMatrix(colorMatrix);
                    if (primaries || transfer || matrix) {
                        base.colorSpace = {};
                        if (primaries) base.colorSpace.primaries = primaries;
                        if (transfer) base.colorSpace.transfer = transfer;
                        if (matrix) base.colorSpace.matrix = matrix;
                    }
                    const candidates = [base];
                    if (base.colorSpace) {
                        const noColorHardware = { ...base };
                        delete noColorHardware.colorSpace;
                        candidates.push(noColorHardware);
                    }
                    if (preferHardwareVideo) {
                        const noPreference = { ...base };
                        delete noPreference.hardwareAcceleration;
                        candidates.push(noPreference);
                        if (base.colorSpace) {
                            const noColor = { ...noPreference };
                            delete noColor.colorSpace;
                            candidates.push(noColor);
                        }
                    }
                    for (const candidate of candidates) {
                        try {
                            const support = await globalThis.VideoDecoder.isConfigSupported(candidate);
                            if (support && support.supported) return candidate;
                        } catch (_) {}
                    }
                    return null;
                }

                let videoMode = videoCodec ? "software" : "none";
                let audioMode = audioCodec ? "software" : "none";
                if (requestWebVideo && videoCodec && typeof globalThis.VideoDecoder === "function") {
                    const codecs = [videoCodec].concat(
                        String(videoFallbackCodecs || "").split(",").map(v => v.trim()).filter(Boolean)
                    );
                    let selected = null;
                    for (const codec of codecs) {
                        selected = await supportedVideoConfig(codec);
                        if (selected) break;
                    }
                    if (selected) {
                        const decoder = new globalThis.VideoDecoder({
                            output: function(frame) {
                                if (pipeline.destroyed) {
                                    frame.close();
                                    return;
                                }
                                pipeline.videoFramesDecoded += 1;
                                pipeline.enqueueVideoFrame(frame, 120);
                            },
                            error: function(error) { pipeline.reportDecoder("video", error); }
                        });
                        decoder.configure(selected);
                        pipeline.videoDecoder = decoder;
                        videoMode = "web";
                    }
                }
                if (requestWebAudio && audioCodec && typeof globalThis.AudioDecoder === "function") {
                    const base = {
                        codec: audioCodec,
                        sampleRate: Math.max(1, audioSampleRate),
                        numberOfChannels: Math.max(1, audioChannels)
                    };
                    if (audioDescription && audioDescription.byteLength) base.description = audioDescription;
                    let supported = false;
                    try {
                        const result = await globalThis.AudioDecoder.isConfigSupported(base);
                        supported = Boolean(result && result.supported);
                    } catch (_) {}
                    if (supported) {
                        const decoder = new globalThis.AudioDecoder({
                            output: pipeline.copyAudioData,
                            error: function(error) { pipeline.reportDecoder("audio", error); }
                        });
                        decoder.configure(base);
                        pipeline.audioDecoder = decoder;
                        audioMode = "web";
                    }
                }
                onComplete(videoMode, audioMode);
            })().catch(function(error) {
                onError(String(error && error.message ? error.message : error));
            });
        }
        """,
    )

@Suppress("UNUSED_PARAMETER", "LongParameterList")
internal fun pushMediaWebCodecsPacket(
    pipeline: JsAny,
    kind: String,
    data: Int8Array,
    timestamp: Double,
    duration: Double,
    keyframe: Boolean,
    drop: Boolean,
): Unit =
    js(
        """
        {
            if (pipeline.destroyed || drop || !data || data.byteLength === 0) {
                if (drop && kind === "video") pipeline.droppedFrames += 1;
                return;
            }
            try {
                const options = {
                    type: keyframe ? "key" : "delta",
                    timestamp: Math.round(Math.max(0, timestamp) * 1000000),
                    duration: Math.max(1, Math.round(Math.max(0, duration) * 1000000)),
                    data
                };
                if (kind === "video" && pipeline.videoDecoder) {
                    pipeline.videoChunksSubmitted += 1;
                    if (!pipeline.videoFirstChunkAt) pipeline.videoFirstChunkAt = performance.now();
                    pipeline.videoDecoder.decode(new EncodedVideoChunk(options));
                } else if (kind === "audio" && pipeline.audioDecoder) {
                    options.type = "key";
                    pipeline.audioDecoder.decode(new EncodedAudioChunk(options));
                }
            } catch (error) {
                pipeline.reportDecoder(kind, error);
            }
        }
        """,
    )

@Suppress("UNUSED_PARAMETER", "LongParameterList")
internal fun pushSoftwareVideoFrame(
    pipeline: JsAny,
    rgba: Int8Array,
    width: Int,
    height: Int,
    lineSize: Int,
    timestamp: Double,
): Unit =
    js(
        """
        {
            if (pipeline.destroyed || !rgba || !rgba.byteLength) return;
            pipeline.enqueueVideoFrame({
                software: true,
                rgba,
                width,
                height,
                lineSize,
                timestamp: Math.round(Math.max(0, timestamp) * 1000000),
                close: function() {}
            }, 90);
        }
        """,
    )

@Suppress("UNUSED_PARAMETER", "LongParameterList")
internal fun pushSoftwareYuvFrame(
    pipeline: JsAny,
    y: Int8Array,
    u: Int8Array,
    v: Int8Array,
    width: Int,
    height: Int,
    lineY: Int,
    lineU: Int,
    lineV: Int,
    format: String,
    matrix: String,
    fullRange: Boolean,
    timestamp: Double,
): Unit =
    js(
        """
        {
            if (pipeline.destroyed || !y || !y.byteLength || !u || !u.byteLength) return;
            pipeline.enqueueVideoFrame({
                softwareYuv: true,
                y,
                u,
                v,
                width,
                height,
                lineY,
                lineU,
                lineV,
                format,
                matrix,
                fullRange,
                timestamp: Math.round(Math.max(0, timestamp) * 1000000),
                close: function() {}
            }, 90);
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
internal fun beginSoftwarePcmFrame(
    pipeline: JsAny,
    timestamp: Double,
    mediaDuration: Double,
    frames: Int,
    channels: Int,
    sampleRate: Int,
    stretched: Boolean,
): Unit =
    js(
        """
        {
            pipeline.pendingPcm = {
                timestamp: Math.max(0, timestamp),
                mediaDuration: Math.max(0, mediaDuration),
                duration: frames / Math.max(1, sampleRate),
                frames,
                channels,
                sampleRate,
                stretched,
                planes: new Array(channels),
                scheduled: false
            };
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
internal fun pushSoftwarePcmPlane(
    pipeline: JsAny,
    channel: Int,
    bytes: Int8Array,
): Unit =
    js(
        """
        {
            const pending = pipeline.pendingPcm;
            if (!pending || channel < 0 || channel >= pending.channels) return;
            const source = new Float32Array(bytes.buffer, bytes.byteOffset, pending.frames);
            pending.planes[channel] = new Float32Array(source);
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
internal fun commitSoftwarePcmFrame(pipeline: JsAny): Unit =
    js(
        """
        {
            const pending = pipeline.pendingPcm;
            pipeline.pendingPcm = null;
            if (!pending || pending.planes.some(plane => !plane)) return;
            pipeline.enqueueAudioSegment(pending);
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
internal fun playMediaPipeline(
    pipeline: JsAny,
    onComplete: () -> Unit,
    onError: (String) -> Unit,
): Unit =
    js(
        """
        {
            try {
                pipeline.anchorClock(pipeline.position);
                pipeline.playing = true;
                pipeline.buffering = false;
                pipeline.ended = false;
                const waitingForVideo =
                    pipeline.hasVideo && pipeline.videoFrames.length === 0;
                const waitingForAudio =
                    pipeline.hasAudio &&
                    pipeline.audioInputSeen &&
                    pipeline.queuedAudioEnd() - pipeline.position < 0.35;
                if (!pipeline.eof && (waitingForVideo || waitingForAudio)) {
                    pipeline.setBuffering(true);
                }
                const resumed =
                    pipeline.audioContext && pipeline.audioContext.state !== "running"
                        ? pipeline.audioContext.resume()
                        : Promise.resolve();
                Promise.resolve(resumed)
                    .then(function() { pipeline.maybeResumeAndSchedule(); })
                    .catch(function() {});
                pipeline.maybeResumeAndSchedule();
                onComplete();
            } catch (error) {
                pipeline.playing = false;
                onError(String(error && error.message ? error.message : error));
            }
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
internal fun pauseMediaPipeline(pipeline: JsAny): Unit =
    js(
        """
        {
            pipeline.clockNow();
            pipeline.playing = false;
            pipeline.buffering = false;
            pipeline.anchorClock(pipeline.position);
            pipeline.stopScheduledAudio();
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
internal fun setMediaPipelinePosition(
    pipeline: JsAny,
    seconds: Double,
): Unit =
    js(
        """
        {
            pipeline.anchorClock(Math.max(0, seconds));
            pipeline.ended = false;
            pipeline.buffering = false;
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
internal fun setMediaPipelineVolume(
    pipeline: JsAny,
    volume: Float,
): Unit =
    js(
        """
        {
            pipeline.volume = Math.max(0, Math.min(1, volume));
            if (pipeline.gain) {
                pipeline.gain.gain.value = pipeline.muted ? 0 : Math.pow(pipeline.volume, 2.0);
            }
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
internal fun setMediaPipelineMuted(
    pipeline: JsAny,
    muted: Boolean,
): Unit =
    js(
        """
        {
            pipeline.muted = Boolean(muted);
            if (pipeline.gain) {
                pipeline.gain.gain.value = pipeline.muted ? 0 : Math.pow(pipeline.volume, 2.0);
            }
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
internal fun setMediaPipelineRate(
    pipeline: JsAny,
    rate: Float,
): Unit =
    js(
        """
        {
            pipeline.clockNow();
            pipeline.rate = Math.max(0.25, Math.min(4, rate));
            pipeline.anchorClock(pipeline.position);
            pipeline.stopScheduledAudio();
            pipeline.audioSegments.forEach(segment => { segment.scheduled = false; });
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
internal fun setMediaPipelineFitMode(
    pipeline: JsAny,
    fitMode: String,
): Unit = js("pipeline.fitMode = fitMode")

@Suppress("UNUSED_PARAMETER", "LongParameterList")
internal fun setMediaPipelineProjection(
    pipeline: JsAny,
    projection: String,
    stereoLayout: String = "mono",
    eyeOrder: String = "left_first",
    rotationDegrees: Int,
    yawDegrees: Float,
    pitchDegrees: Float,
    fieldOfViewDegrees: Float,
    cropLeft: Float,
    cropTop: Float,
    cropRight: Float,
    cropBottom: Float,
): Unit =
    js(
        """
        {
            pipeline.projection = projection;
            pipeline.stereoLayout = stereoLayout;
            pipeline.eyeOrder = eyeOrder;
            pipeline.rotation = ((Number(rotationDegrees) % 360) + 360) % 360;
            pipeline.yaw = Number(yawDegrees);
            pipeline.pitch = Number(pitchDegrees);
            pipeline.fov = Math.max(20, Math.min(150, Number(fieldOfViewDegrees)));
            pipeline.cropLeft = Math.max(0, Math.min(0.49, Number(cropLeft)));
            pipeline.cropTop = Math.max(0, Math.min(0.49, Number(cropTop)));
            pipeline.cropRight = Math.max(0, Math.min(0.49, Number(cropRight)));
            pipeline.cropBottom = Math.max(0, Math.min(0.49, Number(cropBottom)));
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
internal fun setMediaPipelineColor(
    pipeline: JsAny,
    sourceHdr: Boolean,
    toneMapping: String,
): Unit =
    js(
        """
        {
            pipeline.sourceHdr = Boolean(sourceHdr);
            pipeline.toneMapping = toneMapping;
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
internal fun setMediaPipelineStableVolume(
    pipeline: JsAny,
    enabled: Boolean,
): Unit =
    js(
        """
        {
            pipeline.stableVolume = Boolean(enabled);
            pipeline.connectAudioGraph();
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
internal fun setMediaPipelineSinkId(
    pipeline: JsAny,
    sinkId: String,
    onComplete: () -> Unit,
    onError: (String) -> Unit,
): Unit =
    js(
        """
        {
            const context = pipeline.audioContext;
            if (!context || typeof context.setSinkId !== "function") {
                onError("AudioContext.setSinkId is unavailable in this browser.");
            } else {
                Promise.resolve(context.setSinkId(sinkId))
                    .then(function() { onComplete(); })
                    .catch(function(error) {
                        onError(String(error && error.message ? error.message : error));
                    });
            }
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
internal fun captureMediaPipelineSnapshot(
    pipeline: JsAny,
    onComplete: (ImageBitmap) -> Unit,
    onError: (String) -> Unit,
): Unit =
    js(
        """
        {
            if (typeof createImageBitmap !== "function") {
                onError("createImageBitmap is unavailable.");
            } else {
                Promise.resolve(createImageBitmap(pipeline.canvas))
                    .then(function(image) { onComplete(image); })
                    .catch(function(error) {
                        onError(String(error && error.message ? error.message : error));
                    });
            }
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
internal fun mediaPipelineDecodeQueueSize(pipeline: JsAny): Int =
    js(
        """
        Number(
            (pipeline.videoDecoder ? pipeline.videoDecoder.decodeQueueSize : 0) +
            (pipeline.audioDecoder ? pipeline.audioDecoder.decodeQueueSize : 0) +
            pipeline.videoFrames.length
        )
        """,
    )

@Suppress("UNUSED_PARAMETER")
internal fun mediaPipelineAudioAheadSeconds(pipeline: JsAny): Double =
    js("Math.max(0, pipeline.queuedAudioEnd() - pipeline.position)")

@Suppress("UNUSED_PARAMETER")
internal fun mediaPipelineAudibleAudioAheadSeconds(pipeline: JsAny): Double =
    js("Number(pipeline.audibleAudioAhead ? pipeline.audibleAudioAhead() : 0)")

@Suppress("UNUSED_PARAMETER")
internal fun mediaPipelineAudioUnderruns(pipeline: JsAny): Double =
    js("Number(pipeline.audioUnderruns || 0)")

@Suppress("UNUSED_PARAMETER")
internal fun mediaPipelineMaximumAvDriftSeconds(pipeline: JsAny): Double =
    js("Number(pipeline.maximumAvDrift || 0)")

@Suppress("UNUSED_PARAMETER")
internal fun mediaPipelineAudioTimestampCorrections(pipeline: JsAny): Double =
    js("Number(pipeline.audioTimestampCorrections || 0)")

@Suppress("UNUSED_PARAMETER")
internal fun mediaPipelineIsBuffering(pipeline: JsAny): Boolean =
    js("Boolean(pipeline.buffering)")

@Suppress("UNUSED_PARAMETER")
internal fun mediaPipelinePresentedFrames(pipeline: JsAny): Double =
    js("Number(pipeline.presentedFrames || 0)")

@Suppress("UNUSED_PARAMETER")
internal fun mediaPipelineDroppedFrames(pipeline: JsAny): Double =
    js("Number(pipeline.droppedFrames || 0)")

@Suppress("UNUSED_PARAMETER")
internal fun mediaPipelineSubmittedVideoPackets(pipeline: JsAny): Double =
    js("Number(pipeline.videoChunksSubmitted || 0)")

@Suppress("UNUSED_PARAMETER")
internal fun mediaPipelineDecodedVideoFrames(pipeline: JsAny): Double =
    js("Number(pipeline.videoFramesDecoded || 0)")

@Suppress("UNUSED_PARAMETER")
internal fun mediaPipelineUsesWebGl(pipeline: JsAny): Boolean =
    js("Boolean(pipeline && pipeline.webgl)")

@Suppress("UNUSED_PARAMETER")
internal fun mediaPipelineOutputColorSpace(pipeline: JsAny): String =
    js("String((pipeline && pipeline.outputColorSpace) || 'srgb')")

@Suppress("UNUSED_PARAMETER")
internal fun mediaPipelineHasConfirmedHdrOutput(pipeline: JsAny): Boolean =
    js(
        """
        Boolean(
            pipeline &&
            pipeline.webgl &&
            String(pipeline.outputColorSpace || "").toLowerCase() === "display-p3" &&
            typeof globalThis.matchMedia === "function" &&
            globalThis.matchMedia("(dynamic-range: high)").matches
        )
        """,
    )

@Suppress("UNUSED_PARAMETER")
internal fun signalMediaPipelineEndOfInput(pipeline: JsAny): Unit = js("pipeline.eof = true")

@Suppress("UNUSED_PARAMETER")
internal fun destroyMediaPipeline(pipeline: JsAny): Unit =
    js(
        """
        {
            if (pipeline.destroyed) return;
            pipeline.destroyed = true;
            pipeline.playing = false;
            cancelAnimationFrame(pipeline.animationFrame);
            pipeline.stopScheduledAudio();
            pipeline.closeFrames();
            pipeline.closeDecoders();
            pipeline.audioSegments.length = 0;
            if (pipeline.audioContext) {
                try { pipeline.audioContext.close(); } catch (_) {}
            }
        }
        """,
    )

@Suppress("UNUSED_PARAMETER")
internal fun createNativeVideoFramePump(
    video: HTMLVideoElement,
    pipeline: JsAny,
    onError: (String) -> Unit,
): JsAny =
    js(
        """
        (function() {
            const pump = { stopped: false, callbackId: 0, mode: "" };
            const report = function(error) {
                if (pump.stopped) return;
                pump.stopped = true;
                onError(String(error && error.message ? error.message : error));
            };
            const draw = function(now, metadata) {
                if (pump.stopped || pipeline.destroyed) return;
                try {
                    const mediaTime = metadata && Number.isFinite(metadata.mediaTime)
                        ? metadata.mediaTime
                        : Number(video.currentTime || 0);
                    pipeline.drawExternalFrame(video, mediaTime);
                } catch (error) {
                    report(error);
                    return;
                }
                schedule();
            };
            const schedule = function() {
                if (pump.stopped || pipeline.destroyed) return;
                if (typeof video.requestVideoFrameCallback === "function") {
                    pump.mode = "video";
                    pump.callbackId = video.requestVideoFrameCallback(draw);
                } else {
                    pump.mode = "animation";
                    pump.callbackId = requestAnimationFrame(draw);
                }
            };
            schedule();
            return pump;
        })()
        """,
    )

@Suppress("UNUSED_PARAMETER")
internal fun destroyNativeVideoFramePump(
    video: HTMLVideoElement,
    pump: JsAny,
): Unit =
    js(
        """
        {
            if (pump.stopped) return;
            pump.stopped = true;
            if (pump.mode === "video" && typeof video.cancelVideoFrameCallback === "function") {
                try { video.cancelVideoFrameCallback(pump.callbackId); } catch (_) {}
            } else if (pump.mode === "animation") {
                cancelAnimationFrame(pump.callbackId);
            }
        }
        """,
    )
