#!/usr/bin/env node
import { access } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const wasmDirectory = join(__dirname, '..', 'dist', 'wasm');
const gluePath = join(wasmDirectory, 'movi.js');
const binaryPath = join(wasmDirectory, 'movi.wasm');

try {
  await Promise.all([access(gluePath), access(binaryPath)]);
} catch (error) {
  console.error('Error: dist/wasm/movi.js or dist/wasm/movi.wasm not found.');
  console.error('Please run: npm run build:wasm');
  process.exit(1);
}
