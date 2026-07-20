#!/usr/bin/env node

import { brotliCompressSync, constants as zlibConstants } from "node:zlib";
import {
  readFile,
  readdir,
  stat,
  writeFile,
} from "node:fs/promises";
import { resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const dist = resolve(root, "dist");

async function filesBelow(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      result.push(...(await filesBelow(path)));
    } else {
      result.push(path);
    }
  }
  return result;
}

function brotliSize(bytes) {
  return brotliCompressSync(bytes, {
    params: {
      [zlibConstants.BROTLI_PARAM_QUALITY]: 11,
    },
  }).byteLength;
}

const enginePath = resolve(dist, "engine.js");
const wasmPath = resolve(dist, "wasm", "movi.wasm");
const engine = await readFile(enginePath);
const engineText = engine.toString("utf8");
const allFiles = await filesBelow(dist);
const chunks = allFiles.filter((path) =>
  relative(dist, path).startsWith(`chunks/`),
);
const chunkNames = chunks.map((path) => relative(dist, path));

if (!/\bimport\(/u.test(engineText)) {
  throw new Error("Bundle check failed: engine.js has no lazy imports");
}
if (engineText.includes("shaka.Player")) {
  throw new Error("Bundle check failed: Shaka was inlined into engine.js");
}
if (engineText.includes("Hls.Events")) {
  throw new Error("Bundle check failed: hls.js was inlined into engine.js");
}
if (engineText.includes("MediaPlayer().create")) {
  throw new Error("Bundle check failed: dash.js was inlined into engine.js");
}
if (chunks.length < 4) {
  throw new Error(
    `Bundle check failed: expected lazy chunks, found ${chunks.length}`,
  );
}

const wasmStats = await stat(wasmPath);
if (wasmStats.size < 1024 * 1024) {
  throw new Error(
    "Bundle check failed: split FFmpeg WebAssembly asset is missing or too small",
  );
}

const entries = {};
for (const name of ["engine.js", "engine.cjs", "player.js", "element.js"]) {
  const bytes = await readFile(resolve(dist, name));
  entries[name] = {
    bytes: bytes.byteLength,
    brotliBytes: brotliSize(bytes),
  };
}
const report = {
  generatedAt: new Date().toISOString(),
  entries,
  wasm: {
    bytes: wasmStats.size,
    brotliBytes: brotliSize(await readFile(wasmPath)),
  },
  chunks: await Promise.all(
    chunks.map(async (path) => {
      const bytes = await readFile(path);
      return {
        file: relative(dist, path),
        bytes: bytes.byteLength,
        brotliBytes: brotliSize(bytes),
      };
    }),
  ),
};

await writeFile(
  resolve(dist, "bundle-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);
console.log(JSON.stringify(report, null, 2));
