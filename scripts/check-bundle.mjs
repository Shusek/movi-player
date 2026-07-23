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
const lazyGluePath = resolve(dist, "chunks", "movi.js");
const lazyWasmPath = resolve(dist, "chunks", "movi.wasm");
const engine = await readFile(enginePath);
const allFiles = await filesBelow(dist);
const chunks = allFiles.filter((path) =>
  relative(dist, path).startsWith(`chunks/`),
);
const chunkNames = chunks.map((path) => relative(dist, path));

function staticModuleSpecifiers(source) {
  const result = new Set();
  const fromPattern =
    /\b(?:import|export)(?!\s*\()\s*[^"'`;]*?\bfrom\s*["']([^"']+)["']/gu;
  for (const match of source.matchAll(fromPattern)) {
    if (match[1]?.startsWith(".")) result.add(match[1]);
  }
  const sideEffectPattern = /\bimport\s*["']([^"']+)["']/gu;
  for (const match of source.matchAll(sideEffectPattern)) {
    if (match[1]?.startsWith(".")) result.add(match[1]);
  }
  return [...result];
}

async function initialModuleGraph(entryPath) {
  const pending = [entryPath];
  const visited = new Set();
  const modules = [];
  while (pending.length > 0) {
    const path = pending.pop();
    if (!path || visited.has(path)) continue;
    visited.add(path);
    const bytes = await readFile(path);
    const source = bytes.toString("utf8");
    modules.push({ path, bytes, source });
    for (const specifier of staticModuleSpecifiers(source)) {
      const dependency = resolve(path, "..", specifier);
      if (!dependency.startsWith(`${dist}/`)) {
        throw new Error(
          `Bundle check failed: engine static import escaped dist: ${specifier}`,
        );
      }
      pending.push(dependency);
    }
  }
  return modules;
}

const engineGraph = await initialModuleGraph(enginePath);
const engineGraphText = engineGraph
  .map(({ source }) => source)
  .join("\n");

if (!/\bimport\(/u.test(engineGraphText)) {
  throw new Error(
    "Bundle check failed: the engine initial module graph has no lazy imports",
  );
}
for (const [marker, dependency] of [
  ["shaka.Player", "Shaka"],
  ["Hls.Events", "hls.js"],
  ["MediaPlayer().create", "dash.js"],
  ["customElements.define", "Movi web-component UI"],
]) {
  if (engineGraphText.includes(marker)) {
    throw new Error(
      `Bundle check failed: ${dependency} was inlined into the engine initial graph`,
    );
  }
}
if (chunks.length < 4) {
  throw new Error(
    `Bundle check failed: expected lazy chunks, found ${chunks.length}`,
  );
}

const wasmStats = await stat(wasmPath);
const lazyGlue = await readFile(lazyGluePath);
const lazyGlueStats = await stat(lazyGluePath);
const lazyWasmStats = await stat(lazyWasmPath);
if (lazyGlueStats.size < 16 * 1024 || lazyGlueStats.size > 1024 * 1024) {
  throw new Error(
    "Bundle check failed: external Emscripten glue is missing or unexpectedly large",
  );
}
if (lazyGlue.includes("data:application/wasm;base64")) {
  throw new Error(
    "Bundle check failed: Emscripten glue contains an inlined WebAssembly data URL",
  );
}
for (const { source } of engineGraph) {
  if (source.includes("data:application/wasm;base64")) {
    throw new Error(
      "Bundle check failed: WebAssembly was inlined into the engine module graph",
    );
  }
}
if (wasmStats.size < 1024 * 1024) {
  throw new Error(
    "Bundle check failed: split FFmpeg WebAssembly asset is missing or too small",
  );
}
if (lazyWasmStats.size !== wasmStats.size) {
  throw new Error(
    "Bundle check failed: lazy FFmpeg WebAssembly asset does not match dist/wasm/movi.wasm",
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
entries["engine.js"].initialGraph = {
  files: engineGraph.map(({ path }) => relative(dist, path)),
  bytes: engineGraph.reduce((total, module) => total + module.bytes.byteLength, 0),
  brotliBytes: engineGraph.reduce(
    (total, module) => total + brotliSize(module.bytes),
    0,
  ),
};
const report = {
  generatedAt: new Date().toISOString(),
  entries,
  wasm: {
    bytes: wasmStats.size,
    brotliBytes: brotliSize(await readFile(wasmPath)),
  },
  emscriptenGlue: {
    bytes: lazyGlueStats.size,
    brotliBytes: brotliSize(lazyGlue),
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
