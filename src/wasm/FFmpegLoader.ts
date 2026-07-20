/**
 * FFmpegLoader - Async loader for WASM module
 */

import type { MoviWasmModule } from './types';
import { Logger } from '../utils/Logger';

const TAG = 'FFmpegLoader';

let modulePromise: Promise<MoviWasmModule> | null = null;
let loadedModule: MoviWasmModule | null = null;
type MoviModuleFactory = (
  options: Record<string, unknown>,
) => Promise<MoviWasmModule>;
let bundledFactoryPromise: Promise<MoviModuleFactory> | null = null;
const externalFactoryPromises = new Map<
  string,
  Promise<MoviModuleFactory>
>();

// Embedded WASM binary (will be set if WASM is bundled)
let embeddedWasmBinary: Uint8Array | null = null;

export interface LoaderOptions {
  wasmBinary?: Uint8Array; // Embedded WASM binary data (required if embeddedWasmBinary not set)
  workerPath?: string;
  /**
   * Directory containing `wasm/movi.js` and `wasm/movi.wasm`.
   * Omit it to load the code-split assets relative to the installed bundle.
   */
  assetBaseUrl?: string;
}

function resolvedBaseUrl(baseUrl: string): string {
  const runtimeBase =
    typeof document !== 'undefined'
      ? document.baseURI
      : typeof location !== 'undefined'
        ? location.href
        : import.meta.url;
  const resolved = new URL(baseUrl, runtimeBase);
  if (!resolved.pathname.endsWith('/')) {
    resolved.pathname = `${resolved.pathname}/`;
  }
  return resolved.href;
}

async function moduleFactory(
  assetBaseUrl?: string,
): Promise<MoviModuleFactory> {
  if (assetBaseUrl) {
    const base = resolvedBaseUrl(assetBaseUrl);
    let operation = externalFactoryPromises.get(base);
    if (!operation) {
      const moduleUrl = new URL('wasm/movi.js', base).href;
      operation = import(/* @vite-ignore */ moduleUrl).then(
        (module) => module.default as MoviModuleFactory,
      );
      externalFactoryPromises.set(base, operation);
    }
    return operation;
  }

  if (!bundledFactoryPromise) {
    // Static string + dynamic import lets Rollup emit the generated Emscripten
    // glue as a separate chunk while preserving deterministic resolution.
    // @ts-ignore - movi.js is Emscripten-generated, no declarations available.
    bundledFactoryPromise = import('../../dist/wasm/movi.js').then(
      (module) => module.default as MoviModuleFactory,
    );
  }
  return bundledFactoryPromise;
}

function moduleOptions(
  options: LoaderOptions,
  wasmBinary?: Uint8Array | null,
): Record<string, unknown> {
  const result: Record<string, unknown> = {
    print: (text: string) => {
      if (text && text.trim()) {
        Logger.debug('WASM', text);
      }
    },
    printErr: (text: string) => {
      if (text && text.trim()) {
        // FFmpeg uses stderr for informational logging as well.
        Logger.debug('WASM', text);
      }
    },
  };
  if (wasmBinary) result.wasmBinary = wasmBinary;
  if (options.assetBaseUrl) {
    const wasmDirectory = new URL(
      'wasm/',
      resolvedBaseUrl(options.assetBaseUrl),
    );
    result.locateFile = (path: string) =>
      options.workerPath && path.endsWith('.worker.js')
        ? options.workerPath
        : new URL(path.split('/').pop() || path, wasmDirectory).href;
  } else if (options.workerPath) {
    result.locateFile = (path: string) =>
      path.endsWith('.worker.js') ? options.workerPath : path;
  }
  return result;
}

/**
 * Load the WASM module (cached singleton for main playback)
 */
export async function loadWasmModule(options: LoaderOptions = {}): Promise<MoviWasmModule> {
  if (loadedModule) {
    return loadedModule;
  }

  if (modulePromise) {
    return modulePromise;
  }

  modulePromise = (async () => {
    Logger.info(TAG, 'Loading WASM module...');
    
    // A caller may still inject bytes; otherwise the split `.wasm` asset is
    // resolved lazily by the Emscripten glue.
    const wasmBinary = options.wasmBinary || embeddedWasmBinary;
    
    try {
      const createModule = await moduleFactory(options.assetBaseUrl);
      const module: MoviWasmModule = await createModule(
        moduleOptions(options, wasmBinary),
      );
      
      Logger.info(TAG, 'WASM module loaded successfully');
      
      if ((module as any).FS) {
        Logger.debug(TAG, 'FS is present on module');
      } else {
        Logger.error(TAG, 'FS is MISSING from module!');
      }
      
      loadedModule = module;
      return module;
    } catch (error) {
      Logger.error(TAG, 'Failed to load WASM module', error);
      modulePromise = null;
      throw error;
    }
  })();

  return modulePromise;
}

/**
 * Load a NEW WASM module instance (not cached).
 * Use this for preview pipeline to get completely isolated WASM memory.
 * Each call creates a separate WebAssembly.Memory - no sharing with main module.
 */
export async function loadWasmModuleNew(options: LoaderOptions = {}): Promise<MoviWasmModule> {
  Logger.info(TAG, 'Loading NEW WASM module instance (isolated)...');
  
  const wasmBinary = options.wasmBinary || embeddedWasmBinary;
  
  try {
    const createModule = await moduleFactory(options.assetBaseUrl);
    // Always create fresh instance - no caching
    const module: MoviWasmModule = await createModule(
      moduleOptions(options, wasmBinary),
    );
    
    Logger.info(TAG, 'NEW WASM module instance loaded');
    return module;
  } catch (error) {
    Logger.error(TAG, 'Failed to load new WASM module', error);
    throw error;
  }
}

/**
 * Get the loaded module (throws if not loaded)
 */
export function getWasmModule(): MoviWasmModule {
  if (!loadedModule) {
    throw new Error('WASM module not loaded. Call loadWasmModule first.');
  }
  return loadedModule;
}

/**
 * Check if module is loaded
 */
export function isWasmModuleLoaded(): boolean {
  return loadedModule !== null;
}
