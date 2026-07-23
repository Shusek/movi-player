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
  /** Directory containing `wasm/movi.js` and `wasm/movi.wasm`. */
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
    // Keep Emscripten's glue outside Rollup's module graph. Vite library mode
    // otherwise converts `new URL("movi.wasm", import.meta.url)` inside the
    // generated module into a multi-megabyte data URL, duplicating the split
    // movi.wasm asset. The release build copies both sibling files into chunks/.
    const moduleUrl = new URL(
      ['.', 'movi.js'].join('/'),
      import.meta.url,
    ).href;
    bundledFactoryPromise = import(/* @vite-ignore */ moduleUrl).then(
      (module) => module.default as MoviModuleFactory,
    );
  }
  return bundledFactoryPromise;
}

function createModuleOptions(
  options: LoaderOptions,
  wasmBinary: Uint8Array | null,
  onAbort?: (reason: unknown) => void,
): Record<string, unknown> {
  const result: Record<string, unknown> = {
    print: (text: string) => {
      if (text && text.trim()) Logger.debug('WASM', text);
    },
    printErr: (text: string) => {
      if (text && text.trim()) Logger.debug('WASM', text);
    },
  };
  if (wasmBinary) result.wasmBinary = wasmBinary;
  if (onAbort) result.onAbort = onAbort;
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
 * Discard the cached main-playback module so the next loadWasmModule() builds a
 * fresh one. Emscripten's abort() (a WASM trap / OOB in an FFmpeg call) leaves
 * the module PERMANENTLY dead: every later avformat_open_input on it fails with
 * "File is corrupted or in an unsupported format". Because the main demuxer uses
 * this cached singleton, that error then repeats for EVERY source — a new video,
 * a quality switch, anything — until a full page reload rebuilds the JS context.
 * Calling this on a fatal WASM error makes the next load recover in-page, exactly
 * as a reload would.
 */
export function resetWasmModule(): void {
  loadedModule = null;
  modulePromise = null;
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
    
    // The split WASM asset is fetched only when the player opens media.
    const wasmBinary = options.wasmBinary || embeddedWasmBinary;
    
    try {
      const createModule = await moduleFactory(options.assetBaseUrl);
      const module = await createModule(
        createModuleOptions(options, wasmBinary, (what: unknown) => {
          Logger.error(TAG, `WASM aborted — discarding dead cached module: ${what}`);
          resetWasmModule();
        }),
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
    const module = await createModule(
      createModuleOptions(options, wasmBinary),
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
