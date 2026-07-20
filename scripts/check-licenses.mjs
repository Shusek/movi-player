#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));

async function text(path) {
  return readFile(resolve(root, path), "utf8");
}

function requireMatch(value, pattern, description) {
  if (!pattern.test(value)) {
    throw new Error(`License audit failed: ${description}`);
  }
}

const [license, notice, packageJsonText, dockerfile, buildScript] =
  await Promise.all([
    text("LICENSE"),
    text("NOTICE"),
    text("package.json"),
    text("docker/Dockerfile"),
    text("docker/build-ffmpeg.sh"),
  ]);
const packageJson = JSON.parse(packageJsonText);

for (const heading of [
  "FFmpeg",
  "dav1d",
  "Emscripten",
  "musl libc",
  "Signalsmith Stretch",
  "zlib",
  "hls.js",
  "dash.js",
  "Shaka Player",
]) {
  if (!license.includes(heading)) {
    throw new Error(`License audit failed: LICENSE is missing ${heading}`);
  }
}

for (const requiredFile of [
  "LICENSE",
  "NOTICE",
  "FORK.md",
  "LGPL_RELINKING.md",
  "compose.yaml",
  "docker/Dockerfile",
  "docker/build-ffmpeg.sh",
  "wasm",
]) {
  if (!packageJson.files?.includes(requiredFile)) {
    throw new Error(
      `License audit failed: npm package omits ${requiredFile}`,
    );
  }
}

requireMatch(
  dockerfile,
  /ARG FFMPEG_VERSION=n[0-9.]+/u,
  "FFmpeg source version is not pinned",
);
requireMatch(
  dockerfile,
  /ARG DAV1D_VERSION=[0-9.]+/u,
  "dav1d source version is not pinned",
);
if (/--enable-(?:gpl|nonfree)\b/u.test(buildScript)) {
  throw new Error(
    "License audit failed: GPL or non-free FFmpeg components are enabled",
  );
}
requireMatch(
  buildScript,
  /--disable-all/u,
  "FFmpeg is not using an explicit component allowlist",
);
requireMatch(
  notice,
  /LGPL_RELINKING\.md/u,
  "NOTICE does not point to relinking instructions",
);

const expectedRuntimeLicenses = new Map([
  ["hls.js", /Apache-2\.0/iu],
  ["dashjs", /BSD-3-Clause/iu],
  ["shaka-player", /Apache-2\.0/iu],
]);
for (const [dependency, expected] of expectedRuntimeLicenses) {
  const dependencyPackage = JSON.parse(
    await text(`node_modules/${dependency}/package.json`),
  );
  if (!expected.test(String(dependencyPackage.license ?? ""))) {
    throw new Error(
      `License audit failed: unexpected ${dependency} license metadata`,
    );
  }
}

console.log(
  "License audit passed: notices, source/relinking materials, FFmpeg flags, and runtime dependency metadata are present.",
);
