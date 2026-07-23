#!/usr/bin/env node
import { access } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const wasmDirectory = join(__dirname, '..', 'dist', 'wasm');
const requiredFiles = ['movi.js', 'movi.wasm'];

try {
  await Promise.all(
    requiredFiles.map((name) => access(join(wasmDirectory, name))),
  );
} catch (error) {
  console.error('Error: split dist/wasm/movi.js + movi.wasm assets were not found.');
  console.error('Please run: npm run build:wasm');
  process.exit(1);
}
