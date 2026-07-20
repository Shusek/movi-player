class MoviError extends Error {
  code;
  category;
  recoverable;
  constructor(e2) {
    super(i(e2.message), { cause: e2.cause }), this.name = "MoviError", this.code = e2.code, this.category = e2.category, this.recoverable = e2.recoverable ?? false, void 0 !== e2.cause && Object.defineProperty(this, "cause", { value: e2.cause, enumerable: false, configurable: true });
  }
  toJSON() {
    return { name: this.name, code: this.code, category: this.category, message: this.message, recoverable: this.recoverable };
  }
}
const e = /\bhttps?:\/\/[^\s"'<>]+/giu, t = /\b(authorization|cookie|set-cookie|token|session|signature|license(?:url|header)?|api[-_]?key)\b\s*[:=]\s*[^\s,;]+/giu;
function i(i2) {
  return i2.replace(t, "$1=[redacted]").replace(e, (e2) => r(e2));
}
function r(e2) {
  try {
    const t2 = new URL(e2);
    return t2.username = "", t2.password = "", t2.search = "", t2.hash = "", t2.toString();
  } catch {
    return "[redacted-url]";
  }
}
function s(e2, t2) {
  if (e2 instanceof MoviError) return e2;
  const i2 = e2 instanceof Error ? e2.message : "string" == typeof e2 ? e2 : t2.message ?? "Movi operation failed.", r2 = i2.toLowerCase();
  let s2 = t2.code, a2 = t2.category;
  return r2.includes("cors") ? (s2 = "CORS", a2 = "network") : r2.includes("license") ? (s2 = "DRM_LICENSE", a2 = "drm") : r2.includes("drm") || r2.includes("eme") ? (s2 = "DRM_EME", a2 = "drm") : r2.includes("codec") || r2.includes("decoder") ? (s2 = "DECODE", a2 = "codec") : (r2.includes("network") || r2.includes("failed to fetch") || r2.includes("http")) && (s2 = "NETWORK", a2 = "network"), new MoviError({ code: s2, category: a2, message: i2 || t2.message || "Movi operation failed.", recoverable: t2.recoverable, cause: e2 });
}
var a = ((e2) => (e2[e2.SILENT = 0] = "SILENT", e2[e2.ERROR = 1] = "ERROR", e2[e2.WARN = 2] = "WARN", e2[e2.INFO = 3] = "INFO", e2[e2.DEBUG = 4] = "DEBUG", e2[e2.TRACE = 5] = "TRACE", e2))(a || {});
let n = 0;
function o(e2) {
  return "string" == typeof e2 ? i(e2) : e2 instanceof Error ? { name: e2.name, message: i(e2.message) } : e2 && "object" == typeof e2 ? "[redacted-object]" : e2;
}
function h(e2) {
  return i(e2);
}
const d = { setLevel(e2) {
  n = e2;
}, getLevel: () => n, error(e2, t2, ...i2) {
  n >= 1 && globalThis.__movilog?.error(`[movi:${e2}]`, h(t2), ...i2.map(o));
}, warn(e2, t2, ...i2) {
  n >= 2 && globalThis.__movilog?.warn(`[movi:${e2}]`, h(t2), ...i2.map(o));
}, info(e2, t2, ...i2) {
  n >= 3 && globalThis.__movilog?.info(`[movi:${e2}]`, h(t2), ...i2.map(o));
}, debug(e2, t2, ...i2) {
  n >= 4 && globalThis.__movilog?.debug(`[movi:${e2}]`, h(t2), ...i2.map(o));
}, trace(e2, t2, ...i2) {
} };
class EventEmitter {
  listeners = /* @__PURE__ */ new Map();
  on(e2, t2) {
    return this.listeners.has(e2) || this.listeners.set(e2, /* @__PURE__ */ new Set()), this.listeners.get(e2).add(t2), () => this.off(e2, t2);
  }
  off(e2, t2) {
    const i2 = this.listeners.get(e2);
    i2 && i2.delete(t2);
  }
  emit(e2, t2) {
    const i2 = this.listeners.get(e2);
    if (i2) for (const r2 of i2) try {
      r2(t2);
    } catch (t3) {
      d.error("EventEmitter", `Error in event listener for ${String(e2)}:`, t3);
    }
  }
  once(e2, t2) {
    const i2 = (r2) => {
      t2(r2), this.off(e2, i2);
    };
    return this.on(e2, i2);
  }
  removeAllListeners(e2) {
    e2 ? this.listeners.delete(e2) : this.listeners.clear();
  }
  listenerCount(e2) {
    return this.listeners.get(e2)?.size ?? 0;
  }
}
const c = "HttpSource", u = 2097152, l = 262144e3, f = 131072;
class HttpSource {
  url;
  headers;
  size = -1;
  position = 0;
  _contentDispositionFilename = null;
  headBuffer = null;
  metadataCache = /* @__PURE__ */ new Map();
  metadataCacheBytes = 0;
  sharedBuffer = null;
  headerView = null;
  dataView = null;
  useSharedBuffer = false;
  fallbackBuffer = null;
  fallbackStart = 0;
  fallbackWritePos = 0;
  fallbackStreaming = false;
  bufferWaiters = /* @__PURE__ */ new Set();
  reader = null;
  abortController = null;
  streamError = null;
  maxBufferedEnd = 0;
  fullyBuffered = false;
  rangeUnsupported = false;
  linearMode = false;
  onLinearMode = null;
  readMax = 0;
  recentReads = [];
  consecutiveForceRestarts = 0;
  lastForceRestartTime = 0;
  MAX_FORCE_RESTARTS = 3;
  consecutiveOneOffFetches = 0;
  MAX_ONEOFF_BEFORE_RESTART = 2;
  seekHinted = false;
  bufferSize = u;
  totalBytesDownloaded = 0;
  streamStartTime = 0;
  lastSpeedBytes = 0;
  lastSpeedTime = 0;
  currentSpeed = 0;
  maxBufferSizeMB;
  constructor(e2, t2 = {}, i2) {
    this.url = e2, this.headers = t2, this.maxBufferSizeMB = i2 ?? 250, this.initBuffer();
  }
  initBuffer() {
    this.bufferSize = u, this.resizeBuffer(this.bufferSize);
  }
  setMaxBufferSize(e2) {
    if (e2 > 0 && (this.maxBufferSizeMB = e2, this.size > 0)) {
      const t2 = 1024 * e2 * 1024, i2 = this.size <= t2 ? this.size : Math.floor(0.08 * this.size);
      this.resizeBuffer(i2);
    }
  }
  setOnLinearMode(e2) {
    this.onLinearMode = e2, this.linearMode && e2();
  }
  isLinearMode() {
    return this.linearMode;
  }
  isRangeUnsupported() {
    return this.rangeUnsupported;
  }
  resizeBuffer(e2) {
    const t2 = 1024 * this.maxBufferSizeMB * 1024, i2 = Math.max(u, Math.min(t2, e2));
    if (this.bufferSize !== i2 || !this.sharedBuffer && !this.fallbackBuffer) {
      this.bufferSize = i2;
      try {
        "undefined" != typeof SharedArrayBuffer && crossOriginIsolated ? (this.sharedBuffer = new SharedArrayBuffer(24 + this.bufferSize), this.headerView = new Int32Array(this.sharedBuffer, 0, 6), this.dataView = new Uint8Array(this.sharedBuffer, 24, this.bufferSize), this.useSharedBuffer = true, d.info(c, `Using SharedArrayBuffer for zero-copy streaming (${(this.bufferSize / 1024 / 1024).toFixed(2)} MB)`)) : (this.fallbackBuffer = new Uint8Array(this.bufferSize), d.info(c, `Using standard ArrayBuffer (${(this.bufferSize / 1024 / 1024).toFixed(2)} MB)`));
      } catch {
        this.fallbackBuffer = new Uint8Array(this.bufferSize), d.warn(c, `SharedArrayBuffer init failed, using fallback (${(this.bufferSize / 1024 / 1024).toFixed(2)} MB)`);
      }
    }
  }
  atomicGetWritePos() {
    return this.useSharedBuffer && this.headerView ? Atomics.load(this.headerView, 0) : this.fallbackWritePos;
  }
  atomicSetWritePos(e2) {
    this.useSharedBuffer && this.headerView ? Atomics.store(this.headerView, 0, e2) : this.fallbackWritePos = e2, this.wakeBufferWaiters();
  }
  wakeBufferWaiters(e2 = false) {
    if (0 === this.bufferWaiters.size) return;
    const t2 = e2 ? 1 / 0 : this.bufferEnd;
    for (const e3 of [...this.bufferWaiters]) t2 >= e3.needed && e3.wake();
  }
  waitForBufferAdvance(e2, t2) {
    return new Promise((i2) => {
      let r2, s2 = false;
      const a2 = { needed: e2, wake: () => {
        s2 || (s2 = true, void 0 !== r2 && clearTimeout(r2), this.bufferWaiters.delete(a2), i2());
      } };
      this.bufferWaiters.add(a2), r2 = setTimeout(a2.wake, t2);
    });
  }
  atomicGetBufferStart() {
    return this.useSharedBuffer && this.headerView ? (Atomics.load(this.headerView, 1) >>> 0) + 4294967296 * (Atomics.load(this.headerView, 2) >>> 0) : this.fallbackStart;
  }
  atomicSetBufferStart(e2) {
    if (this.useSharedBuffer && this.headerView) {
      const t2 = (4294967295 & e2) >>> 0, i2 = (e2 / 4294967296 | 0) >>> 0;
      Atomics.store(this.headerView, 1, t2), Atomics.store(this.headerView, 2, i2);
    } else this.fallbackStart = e2;
  }
  _prefetchThrottled = false;
  setPrefetchThrottle(e2) {
    this._prefetchThrottled = e2;
  }
  hintSeek() {
    this.seekHinted = true;
  }
  async awaitPrefetchGate() {
    for (; this._prefetchThrottled && this.atomicIsStreaming(); ) await new Promise((e2) => setTimeout(e2, 100));
  }
  atomicIsStreaming() {
    return this.useSharedBuffer && this.headerView ? 1 === Atomics.load(this.headerView, 4) : this.fallbackStreaming;
  }
  atomicSetStreaming(e2) {
    this.useSharedBuffer && this.headerView ? Atomics.store(this.headerView, 4, e2 ? 1 : 0) : this.fallbackStreaming = e2, e2 || this.wakeBufferWaiters(true);
  }
  atomicIncrementVersion() {
    this.useSharedBuffer && this.headerView && Atomics.add(this.headerView, 5, 1);
  }
  tryLock() {
    return !this.useSharedBuffer || !this.headerView || 0 === Atomics.compareExchange(this.headerView, 3, 0, 1);
  }
  unlock() {
    this.useSharedBuffer && this.headerView && Atomics.store(this.headerView, 3, 0);
  }
  async resolveSize() {
    let e2 = new Error("Content-Length missing");
    for (let t2 = 0; t2 < 4; t2++) {
      try {
        const t3 = await fetch(this.url, { method: "HEAD", headers: await this.buildRequestHeaders() });
        if (t3.ok) {
          this.setFilenameFromDisposition(t3.headers.get("Content-Disposition"));
          const i2 = t3.headers.get("Content-Length");
          if (i2) return parseInt(i2, 10);
          const r2 = await this.resolveSizeViaRange();
          if (null !== r2) return r2;
          const s2 = await this.resolveSizeViaPlainGet();
          if (null !== s2) return s2;
          e2 = new Error("Content-Length missing");
        } else {
          if (404 === t3.status) throw new Error("Video not found.");
          if (403 === t3.status || 401 === t3.status) {
            const e3 = await this.resolveSizeViaRange();
            if (null !== e3) return e3;
            const i2 = await this.resolveSizeViaPlainGet();
            if (null !== i2) return i2;
            throw new Error(403 === t3.status ? "Access denied. Check video permissions." : "Authentication required.");
          }
          e2 = new Error(`HTTP ${t3.status}`);
        }
      } catch (t3) {
        if (/Access denied|Authentication required|Video not found/.test(t3?.message || "")) throw t3;
        const i2 = await this.resolveSizeViaRange();
        if (null !== i2) return i2;
        const r2 = await this.resolveSizeViaPlainGet();
        if (null !== r2) return r2;
        e2 = t3 instanceof Error ? t3 : new Error(String(t3));
      }
      t2 < 3 && await new Promise((e3) => setTimeout(e3, 400 * (t2 + 1)));
    }
    throw e2;
  }
  async resolveSizeViaRange() {
    let e2;
    try {
      e2 = await fetch(this.url, { method: "GET", headers: await this.buildRequestHeaders({ offset: 0, length: 1 }) });
    } catch {
      return null;
    }
    if (e2.body?.cancel().catch(() => {
    }), !e2.ok && 206 !== e2.status) return null;
    this.setFilenameFromDisposition(e2.headers.get("Content-Disposition"));
    const t2 = e2.headers.get("Content-Range");
    if (t2) {
      const e3 = /\/\s*(\d+)\s*$/.exec(t2);
      if (e3) return parseInt(e3[1], 10);
    }
    const i2 = e2.headers.get("Content-Length");
    return 200 === e2.status && i2 ? parseInt(i2, 10) : null;
  }
  async resolveSizeViaPlainGet() {
    let e2;
    try {
      e2 = await fetch(this.url, { method: "GET", headers: await this.buildRequestHeaders() });
    } catch {
      return null;
    }
    if (e2.body?.cancel().catch(() => {
    }), !e2.ok) return null;
    const t2 = e2.headers.get("Content-Length");
    if (200 === e2.status && t2) return parseInt(t2, 10);
    const i2 = e2.headers.get("Content-Range");
    if (i2) {
      const e3 = /\/\s*(\d+)\s*$/.exec(i2);
      if (e3) return parseInt(e3[1], 10);
    }
    return null;
  }
  setFilenameFromDisposition(e2) {
    if (!e2) return;
    let t2 = e2.match(/filename\*\s*=\s*(?:UTF-8''|utf-8'')([^;]+)/i);
    if (t2) try {
      this._contentDispositionFilename = decodeURIComponent(t2[1].trim());
    } catch {
      this._contentDispositionFilename = t2[1].trim();
    }
    if (!this._contentDispositionFilename && (t2 = e2.match(/filename\s*=\s*"([^"]+)"/i), t2 || (t2 = e2.match(/filename\s*=\s*([^;]+)/i)), t2)) {
      const e3 = t2[1].trim();
      try {
        this._contentDispositionFilename = decodeURIComponent(e3);
      } catch {
        this._contentDispositionFilename = e3;
      }
    }
    this._contentDispositionFilename && d.debug(c, `Content-Disposition filename: ${this._contentDispositionFilename}`);
  }
  async buildRequestHeaders(e2) {
    return e2 ? { ...this.headers, Range: e2.openEnded ? `bytes=${e2.offset}-` : `bytes=${e2.offset}-${e2.offset + e2.length - 1}` } : { ...this.headers };
  }
  async getSize() {
    if (this.size >= 0) return this.size;
    try {
      this.size = await this.resolveSize(), d.debug(c, `File size: ${this.size} bytes`);
      const e2 = 1024 * this.maxBufferSizeMB * 1024, t2 = this.size <= e2, i2 = t2 ? this.size : Math.floor(0.08 * this.size);
      return this.resizeBuffer(i2), d.info(c, `Buffer: ${(this.bufferSize / 1024 / 1024).toFixed(1)}MB ${t2 ? "(full file cache)" : "(8% sliding window)"} for ${(this.size / 1024 / 1024).toFixed(1)}MB file`), this.size;
    } catch (e2) {
      const t2 = e2.message || "";
      if ("TypeError" === e2.name && t2.includes("Failed to fetch") && !t2.includes("HTTP")) throw new Error("Failed to fetch video resource. Check your connection or CORS settings.");
      throw e2;
    }
  }
  getContentDispositionFilename() {
    return this._contentDispositionFilename;
  }
  get bufferEnd() {
    return this.atomicGetBufferStart() + this.atomicGetWritePos();
  }
  isInBuffer(e2, t2) {
    const i2 = this.atomicGetBufferStart(), r2 = this.bufferEnd;
    return e2 >= i2 && e2 + t2 <= r2;
  }
  getBuffer() {
    return this.useSharedBuffer ? this.dataView : this.fallbackBuffer;
  }
  peekHead(e2, t2) {
    if (!this.headBuffer) return null;
    if (e2 < 0 || e2 + t2 > this.headBuffer.length) return null;
    const i2 = new Uint8Array(t2);
    return i2.set(this.headBuffer.subarray(e2, e2 + t2)), i2;
  }
  cacheMetadataRead(e2, t2) {
    if (0 === t2.length || t2.length > f) return;
    const i2 = this.metadataCache.get(e2);
    for (i2 && (this.metadataCache.delete(e2), this.metadataCacheBytes -= i2.length), this.metadataCache.set(e2, t2), this.metadataCacheBytes += t2.length; (this.metadataCacheBytes > 8388608 || this.metadataCache.size > 128) && this.metadataCache.size > 0; ) {
      const e3 = this.metadataCache.keys().next().value;
      if (void 0 === e3) break;
      const t3 = this.metadataCache.get(e3);
      this.metadataCache.delete(e3), this.metadataCacheBytes -= t3.length;
    }
  }
  peekMetadata(e2, t2) {
    if (t2 <= 0 || 0 === this.metadataCache.size) return null;
    for (const [i2, r2] of this.metadataCache) if (i2 <= e2 && i2 + r2.length >= e2 + t2) {
      const s2 = e2 - i2, a2 = new Uint8Array(t2);
      return a2.set(r2.subarray(s2, s2 + t2)), this.metadataCache.delete(i2), this.metadataCache.set(i2, r2), a2;
    }
    return null;
  }
  peekRange(e2, t2) {
    if (t2 <= 0) return null;
    const i2 = this.useSharedBuffer && this.headerView ? Atomics.load(this.headerView, 5) : 0, r2 = this.atomicGetBufferStart(), s2 = this.atomicGetWritePos();
    if (e2 < r2 || e2 + t2 > r2 + s2) return null;
    const a2 = this.getBuffer();
    if (!a2) return null;
    const n2 = e2 - r2, o2 = new Uint8Array(t2);
    return o2.set(a2.subarray(n2, n2 + t2)), this.useSharedBuffer && this.headerView && i2 !== Atomics.load(this.headerView, 5) ? null : o2;
  }
  async startStream(e2) {
    if (this.fullyBuffered) d.debug(c, `startStream(${e2}): skipped — file fully cached`);
    else {
      if (await this.stopStream(), d.info(c, `Starting stream from ${e2}`), this.streamError = null, this.size > 0 && e2 >= this.size) return d.debug(c, "Requested stream at or past EOF. Ignoring."), this.atomicSetBufferStart(e2), this.atomicSetWritePos(0), void this.atomicSetStreaming(false);
      this.atomicSetBufferStart(e2), this.atomicSetWritePos(0), this.atomicSetStreaming(true), this.atomicIncrementVersion(), this.fullyBuffered = false, this.maxBufferedEnd = e2, this.abortController = new AbortController(), this.readStreamBackground(e2).catch((e3) => {
        d.error(c, "Background stream failed fatally", e3), this.atomicSetStreaming(false);
      });
    }
  }
  async readStreamBackground(e2) {
    let t2 = 0, i2 = false, r2 = 0, s2 = 0, a2 = e2, n2 = false;
    for (; this.atomicIsStreaming(); ) try {
      const o2 = this.getBuffer();
      let h2;
      if (h2 = i2 ? this.atomicGetBufferStart() + this.atomicGetWritePos() : e2, this.size > 0 && h2 >= this.size) {
        d.debug(c, "Stream reached end of requested range (EOF)"), this.atomicSetStreaming(false);
        break;
      }
      const u2 = this.size > 0 && this.bufferSize >= this.size ? this.size : Math.floor(Math.min(l, 0.9 * this.bufferSize)), f2 = this.size > 0 ? Math.min(h2 + u2 - 1, this.size - 1) : h2 + u2 - 1;
      d.debug(c, `Fetching range: ${h2}-${f2} (max ${(u2 / 1024 / 1024).toFixed(1)}MB)`);
      const m2 = await fetch(this.url, { headers: await this.buildRequestHeaders({ offset: h2, length: f2 - h2 + 1, openEnded: n2 }), cache: "no-store", signal: this.abortController.signal });
      if (403 === m2.status && !n2) {
        n2 = true;
        try {
          m2.body?.cancel();
        } catch {
        }
        d.warn(c, `403 for bounded range ${h2}-${f2}; retrying open-ended (bytes=${h2}-)`);
        continue;
      }
      if (200 === m2.status) {
        if (r2++, r2 <= 3) {
          try {
            m2.body?.cancel();
          } catch {
          }
          d.warn(c, `Server returned 200 instead of 206 (attempt ${r2}/3). CDN may be caching — retrying in 1500ms...`), await new Promise((e3) => setTimeout(e3, 1500));
          continue;
        }
        if (0 === e2) return d.warn(c, "No Range support after 3 retries — falling back to sequential playback."), void await this.consumeNonRangeStream(m2);
        try {
          m2.body?.cancel();
        } catch {
        }
        const t3 = new Error("Server does not support range requests.");
        throw d.error(c, `Server returned 200 for offset ${e2}; range requests not supported.`), this.abortController?.abort(), this.atomicSetStreaming(false), this.streamError = t3, t3;
      }
      if (r2 = 0, !m2.ok && 206 !== m2.status) {
        if (m2.status >= 400 && m2.status < 500) {
          if (416 === m2.status) {
            d.warn(c, "Range not satisfiable, assuming EOF"), this.atomicSetStreaming(false);
            break;
          }
          throw new Error(`HTTP ${m2.status} (Fatal)`);
        }
        throw new Error(`HTTP ${m2.status}`);
      }
      this.reader = m2.body.getReader();
      const g2 = this.reader;
      t2 = 0, s2 = 0, i2 || (this.atomicSetBufferStart(e2), this.atomicSetWritePos(0), i2 = true);
      let p2 = 0, b2 = 0;
      const v2 = Date.now();
      for (0 === this.streamStartTime && (this.streamStartTime = v2, this.lastSpeedTime = v2); this.atomicIsStreaming() && (await this.awaitPrefetchGate(), this.atomicIsStreaming() && this.reader === g2); ) {
        const { done: e3, value: t3 } = await g2.read();
        if (e3) {
          this.atomicSetStreaming(false);
          break;
        }
        if (t3) {
          p2 += t3.length, this.totalBytesDownloaded += t3.length;
          const e4 = Date.now(), i3 = (e4 - this.lastSpeedTime) / 1e3;
          if (i3 >= 0.5) {
            const t4 = this.totalBytesDownloaded - this.lastSpeedBytes;
            this.currentSpeed = t4 / i3, this.lastSpeedBytes = this.totalBytesDownloaded, this.lastSpeedTime = e4;
          }
          if (p2 - b2 > 1048576) {
            const e5 = (Date.now() - v2) / 1e3, t4 = e5 > 0 ? p2 / 1024 / 1024 / e5 : 0;
            d.debug(c, `Stream progress: ${(p2 / 1024 / 1024).toFixed(2)} MB read @ ${t4.toFixed(2)} MB/s`), b2 = p2;
          }
          let r3 = this.atomicGetWritePos();
          if (!(r3 + t3.length <= o2.length)) {
            d.debug(c, "Buffer full, stopping stream"), this.atomicSetStreaming(false);
            break;
          }
          {
            let e5 = false;
            for (let t4 = 0; t4 < 5; t4++) {
              if (this.tryLock()) {
                e5 = true;
                break;
              }
              await new Promise((e6) => setTimeout(e6, 1));
            }
            if (!e5) {
              d.error(c, "Failed to acquire lock for writing"), this.atomicSetStreaming(false);
              break;
            }
            {
              o2.set(t3, r3);
              const e6 = r3 + t3.length;
              this.atomicSetWritePos(e6);
              const i4 = this.atomicGetBufferStart() + e6;
              i4 > this.maxBufferedEnd && (this.maxBufferedEnd = i4);
              const s3 = this.size > 0 && this.bufferSize >= this.size, n3 = i4 - a2, h3 = Math.floor(Math.min(l, 0.9 * this.bufferSize)), u3 = !s3 && n3 >= h3, f3 = !s3 && e6 >= 0.9 * o2.length;
              if (u3 || f3) {
                const t4 = this.atomicGetBufferStart(), r4 = this.position - t4;
                if (r4 > 0.25 * this.bufferSize && this.size > 0 && i4 < this.size) {
                  const i5 = Math.floor(r4);
                  if (i5 > 0 && e6 > i5) {
                    o2.copyWithin(0, i5, e6), this.atomicSetBufferStart(t4 + i5), this.atomicSetWritePos(e6 - i5), a2 = t4 + i5, this.unlock(), d.debug(c, `Buffer compacted: reclaimed ${(i5 / 1024 / 1024).toFixed(1)}MB`);
                    break;
                  }
                }
                this.unlock(), d.debug(c, `Downloaded ${(n3 / 1024 / 1024).toFixed(1)}MB (${u3 ? "limit reached" : "buffer full"}), stopping stream`), this.atomicSetStreaming(false);
                break;
              }
              if (this.unlock(), this.size > 0 && i4 >= this.size) {
                const e7 = this.atomicGetBufferStart();
                0 === e7 && this.bufferSize >= this.size && (this.fullyBuffered = true, d.info(c, `Entire file cached in memory (${(this.size / 1024 / 1024).toFixed(1)}MB)`)), d.debug(c, `Reached EOF (bufferStart=${e7}, bufferEnd=${i4}), stopping stream`), this.atomicSetStreaming(false);
                break;
              }
            }
          }
        }
      }
      try {
        await this.reader?.cancel();
      } catch {
      }
      this.reader = null;
    } catch (e3) {
      if ("AbortError" === e3.name) break;
      const i3 = e3.message || "", r3 = "TypeError" === e3.name && i3.includes("Failed to fetch"), a3 = "undefined" != typeof self && self.navigator && !self.navigator.onLine;
      if (r3) if (a3) s2 = 0;
      else {
        if (s2++, s2 >= 3) {
          const e4 = new Error("Failed to fetch video resource. Check your connection or CORS settings.");
          throw d.error(c, `CORS error accessing ${this.url} (${s2} consecutive failures while online)`), this.atomicSetStreaming(false), this.streamError = e4, e4;
        }
        d.warn(c, `Fetch failed while online (${s2}/3), may be transient network issue`);
      }
      if (e3.message && e3.message.includes("does not support range requests")) throw d.error(c, "Range requests not supported, cannot stream this URL"), this.atomicSetStreaming(false), e3;
      const n3 = e3?.message || "";
      if (n3.includes("(Fatal)")) {
        d.error(c, `Fatal HTTP error, not retrying: ${n3}`), this.atomicSetStreaming(false), this.streamError = e3 instanceof Error ? e3 : new Error(n3);
        break;
      }
      d.warn(c, "Stream error, retrying...", e3);
      try {
        this.reader && await this.reader.cancel();
      } catch {
      }
      if (this.reader = null, "undefined" != typeof self && self.navigator && !self.navigator.onLine) {
        d.warn(c, "Network offline, waiting for connection...");
        const e4 = this.abortController?.signal;
        if (await new Promise((t3) => {
          let i4 = false;
          const r4 = () => {
            i4 || (i4 = true, clearTimeout(s3), "undefined" != typeof self && self.removeEventListener("online", a4), e4?.removeEventListener("abort", n4), t3());
          }, s3 = setTimeout(() => {
            d.warn(c, "Offline wait timeout, retrying anyway..."), r4();
          }, 3e4), a4 = () => {
            d.info(c, "Network online, resuming..."), r4();
          }, n4 = () => r4();
          "undefined" != typeof self && self.addEventListener("online", a4), e4?.addEventListener("abort", n4);
        }), !this.atomicIsStreaming()) break;
        t2 = 0;
        continue;
      }
      if (t2++, t2 > 10) {
        d.error(c, "Max retries (10) reached, giving up."), this.atomicSetStreaming(false), this.streamError = e3 instanceof Error ? e3 : new Error("string" == typeof e3 ? e3 : "Stream failed after maximum retries");
        break;
      }
      const o2 = Math.min(1e3 * Math.pow(1.5, t2), 1e4), h2 = this.abortController?.signal;
      await new Promise((e4) => {
        let i4 = false;
        const r4 = () => {
          i4 || (i4 = true, clearTimeout(a4), "undefined" != typeof self && self.removeEventListener("online", n4), h2?.removeEventListener("abort", u2), e4());
        }, a4 = setTimeout(r4, o2), n4 = () => {
          d.info(c, "Online event during backoff — retrying immediately"), t2 = 0, s2 = 0, r4();
        }, u2 = () => r4();
        "undefined" != typeof self && self.addEventListener && self.addEventListener("online", n4), h2?.addEventListener("abort", u2);
      });
    }
    if (this.reader) {
      try {
        await this.reader.cancel();
      } catch {
      }
      this.reader = null;
    }
  }
  async consumeNonRangeStream(e2) {
    if (this.rangeUnsupported = true, this.size > 0) {
      const e3 = this.useSharedBuffer && this.headerView ? Atomics.load(this.headerView, 5) : 0;
      this.resizeBuffer(this.size), this.useSharedBuffer && this.headerView && Atomics.store(this.headerView, 5, e3);
    }
    const t2 = this.getBuffer(), i2 = this.size > 0 && this.bufferSize >= this.size;
    if (i2) d.info(c, `Caching entire ${(this.size / 1048576).toFixed(1)}MB file in memory (no Range support).`);
    else {
      this.linearMode = true, d.warn(c, `Linear (non-seekable) playback: ${this.size > 0 ? (this.size / 1048576).toFixed(0) + "MB" : "unknown size"} exceeds the ${this.maxBufferSizeMB}MB cache cap or size is unknown.`);
      try {
        this.onLinearMode?.();
      } catch {
      }
    }
    if (this.atomicSetBufferStart(0), this.atomicSetWritePos(0), this.maxBufferedEnd = 0, this.fullyBuffered = false, this.atomicSetStreaming(true), !e2.body) return this.streamError = new Error("Empty response body"), void this.atomicSetStreaming(false);
    const r2 = e2.body.getReader();
    this.reader = r2;
    try {
      for (; this.atomicIsStreaming() && (await this.awaitPrefetchGate(), this.atomicIsStreaming()); ) {
        const { done: e3, value: s3 } = await r2.read();
        if (e3) break;
        s3 && 0 !== s3.length && (this.totalBytesDownloaded += s3.length, await this.writeSequential(s3, t2, i2));
      }
    } catch (e3) {
      "AbortError" !== e3?.name && (this.streamError = e3 instanceof Error ? e3 : new Error(String(e3)), d.error(c, "Non-range stream failed", e3));
    } finally {
      try {
        await r2.cancel();
      } catch {
      }
      this.reader = null;
    }
    const s2 = this.atomicGetBufferStart() + this.atomicGetWritePos();
    this.size <= 0 && (this.size = s2), i2 && 0 === this.atomicGetBufferStart() && this.size > 0 && s2 >= this.size && (this.fullyBuffered = true, d.info(c, `Entire file cached (${(this.size / 1048576).toFixed(1)}MB) — full random access.`)), this.atomicSetStreaming(false);
  }
  async writeSequential(e2, t2, i2) {
    let r2 = 0;
    for (; r2 < e2.length; ) {
      if (!this.atomicIsStreaming()) return;
      let s2 = this.atomicGetWritePos();
      if (s2 >= t2.length) {
        if (i2) return;
        if (!await this.slideWindow(t2)) {
          await new Promise((e3) => setTimeout(e3, 5));
          continue;
        }
        s2 = this.atomicGetWritePos();
      }
      const a2 = t2.length - s2, n2 = Math.min(a2, e2.length - r2);
      let o2 = false;
      for (let e3 = 0; e3 < 50; e3++) {
        if (this.tryLock()) {
          o2 = true;
          break;
        }
        await new Promise((e4) => setTimeout(e4, 1));
      }
      if (!o2) {
        await new Promise((e3) => setTimeout(e3, 5));
        continue;
      }
      t2.set(e2.subarray(r2, r2 + n2), s2);
      const h2 = s2 + n2;
      this.atomicSetWritePos(h2);
      const d2 = this.atomicGetBufferStart() + h2;
      d2 > this.maxBufferedEnd && (this.maxBufferedEnd = d2), this.unlock(), r2 += n2;
    }
  }
  async slideWindow(e2) {
    const t2 = this.atomicGetBufferStart(), i2 = this.atomicGetWritePos(), r2 = Math.floor(this.bufferSize / 2), s2 = this.recentReads.length ? Math.min(...this.recentReads) : this.readMax, a2 = Math.max(0, Math.min(s2, this.readMax - r2)), n2 = Math.min(a2 - t2, i2);
    if (n2 <= 0) return false;
    let o2 = false;
    for (let e3 = 0; e3 < 50; e3++) {
      if (this.tryLock()) {
        o2 = true;
        break;
      }
      await new Promise((e4) => setTimeout(e4, 1));
    }
    return !!o2 && (e2.copyWithin(0, n2, i2), this.atomicSetBufferStart(t2 + n2), this.atomicSetWritePos(i2 - n2), this.unlock(), true);
  }
  async stopStream() {
    if (this.atomicSetStreaming(false), this.abortController && (this.abortController.abort(), this.abortController = null), this.reader) {
      try {
        await this.reader.cancel();
      } catch {
      }
      this.reader = null;
    }
  }
  async waitForData(e2, t2, i2 = 3e4) {
    const r2 = Date.now();
    let s2 = r2 + i2, a2 = e2 + t2;
    if (this.size > 0 && a2 > this.size && (a2 = this.size), e2 >= a2 && this.size > 0 && e2 >= this.size) return true;
    const n2 = this.useSharedBuffer && this.headerView ? Atomics.load(this.headerView, 5) : 0;
    let o2 = this.bufferEnd, h2 = Date.now();
    for (; this.bufferEnd < a2 && this.atomicIsStreaming(); ) {
      if (this.streamError) throw this.streamError;
      const t3 = Date.now();
      this.bufferEnd > o2 && (o2 = this.bufferEnd, h2 = t3, t3 - r2 > 0.8 * i2 && (s2 = t3 + 15e3));
      const u3 = t3 - h2;
      if (u3 > 15e3) return d.error(c, `Stream stalled: no progress for ${(u3 / 1e3).toFixed(1)}s at ${e2}, needed ${a2}, currently ${this.bufferEnd}`), false;
      if (t3 > s2) return d.error(c, `Timeout waiting for data at ${e2}, needed ${a2}, currently ${this.bufferEnd}`), false;
      if (this.useSharedBuffer && this.headerView && Atomics.load(this.headerView, 5) !== n2) return d.warn(c, `Stream superseded while waiting for ${e2}`), false;
      this.useSharedBuffer && this.headerView ? await new Promise((e3) => setTimeout(e3, 2)) : await this.waitForBufferAdvance(a2, 250);
    }
    const u2 = this.bufferEnd >= a2;
    if (this.streamError) throw this.streamError;
    if (!u2 && !this.atomicIsStreaming()) {
      if (this.size > 0 && this.bufferEnd >= this.size) return true;
      if (this.bufferEnd >= a2) return true;
      d.warn(c, `Stream ended before reaching needed offset ${a2} (current end: ${this.bufferEnd})`);
    }
    return u2;
  }
  async read(e2, t2) {
    const i2 = this.peekMetadata(e2, t2);
    if (i2) return this.position = e2 + t2, d.debug(c, "Read: served from metadata LRU"), i2.buffer;
    const r2 = await this._readInternal(e2, t2);
    return r2.byteLength > 0 && r2.byteLength <= f && this.cacheMetadataRead(e2, new Uint8Array(r2)), r2;
  }
  async _readInternal(e2, t2) {
    if (d.debug(c, `Read: offset=${e2}, length=${t2}, bufferStart=${this.atomicGetBufferStart()}, bufferEnd=${this.bufferEnd}, streaming=${this.atomicIsStreaming()}`), this.size > 0 && e2 >= this.size) return d.debug(c, "Read: returning empty (EOF)"), new ArrayBuffer(0);
    if (this.fullyBuffered && e2 >= this.atomicGetBufferStart() && e2 < this.bufferEnd) return this.consecutiveForceRestarts = 0, d.debug(c, "Read: served from full-file cache"), this.readFromBuffer(e2, t2);
    if (this.headBuffer && e2 + t2 <= this.headBuffer.length) {
      const i3 = new Uint8Array(t2);
      return i3.set(this.headBuffer.subarray(e2, e2 + t2)), this.position = e2 + t2, d.debug(c, "Read: served from head cache"), i3.buffer;
    }
    if (this.isInBuffer(e2, t2)) return this.consecutiveForceRestarts = 0, this.consecutiveOneOffFetches = 0, this.seekHinted = false, d.debug(c, "Read: serving from buffer"), this.readFromBuffer(e2, t2);
    if (this.rangeUnsupported) {
      if (e2 < this.atomicGetBufferStart()) throw new Error("Server does not support range requests.");
      if (this.linearMode && e2 + t2 > this.atomicGetBufferStart() + this.bufferSize) throw new Error("Server does not support range requests.");
      if (this.atomicIsStreaming() && await this.waitForData(e2, t2)) return this.readFromBuffer(e2, t2);
      if (this.isInBuffer(e2, t2)) return this.readFromBuffer(e2, t2);
      if (this.streamError) throw this.streamError;
      throw new Error("Server does not support range requests.");
    }
    const i2 = this.atomicGetBufferStart(), r2 = e2 - this.bufferEnd, s2 = this.atomicIsStreaming() && e2 >= i2 && e2 < i2 + this.bufferSize && r2 <= 2097152;
    if (d.debug(c, `Read: isCoveredByStream=${s2}, gap=${(r2 / 1024).toFixed(0)}KB`), s2) {
      d.debug(c, "Read: waiting for data from active stream...");
      const i3 = await this.waitForData(e2, t2);
      if (d.debug(c, `Read: waitForData returned ${i3}`), i3) return this.consecutiveForceRestarts = 0, this.consecutiveOneOffFetches = 0, this.seekHinted = false, this.readFromBuffer(e2, t2);
      if (this.atomicIsStreaming()) {
        if (this.isInBuffer(e2, t2)) return this.readFromBuffer(e2, t2);
        const i4 = Date.now();
        if (i4 - this.lastForceRestartTime > 5e3 && (this.consecutiveForceRestarts = 0), this.consecutiveForceRestarts >= this.MAX_FORCE_RESTARTS) throw d.error(c, `Too many consecutive force restarts (${this.consecutiveForceRestarts}), giving up.`), new Error(`Stream failed after ${this.consecutiveForceRestarts} restart attempts`);
        const r3 = Math.min(100 * Math.pow(2, this.consecutiveForceRestarts), 500);
        d.warn(c, `Read timeout for ${e2} but stream is active. Force restarting after ${r3}ms (attempt ${this.consecutiveForceRestarts + 1}/${this.MAX_FORCE_RESTARTS}).`), await new Promise((e3) => setTimeout(e3, r3)), this.consecutiveForceRestarts++, this.lastForceRestartTime = i4;
      }
    }
    if (!s2 && this.atomicIsStreaming() && !this.seekHinted && t2 <= 15728640 && this.consecutiveOneOffFetches < this.MAX_ONEOFF_BEFORE_RESTART) {
      d.info(c, `Read: one-off range fetch for offset=${e2}, length=${t2} (outside stream window, main stream continues)`);
      try {
        const i3 = (this.size > 0 ? Math.min(e2 + t2 - 1, this.size - 1) : e2 + t2 - 1) - e2 + 1, r3 = await fetch(this.url, { headers: await this.buildRequestHeaders({ offset: e2, length: i3 }) });
        if (206 === r3.status || r3.ok) {
          const t3 = r3.headers.get("content-length");
          if (t3 && parseInt(t3, 10) > 1.5 * i3) throw new Error(`Server ignored Range (Content-Length ${t3} for a ${i3}-byte request)`);
          const s3 = await r3.arrayBuffer();
          if (206 !== r3.status && s3.byteLength > 1.5 * i3) throw new Error(`Server ignored Range (returned ${s3.byteLength} bytes for a ${i3}-byte request)`);
          const a3 = new Uint8Array(s3), n2 = this.getBuffer(), o2 = e2 - this.atomicGetBufferStart();
          o2 >= 0 && o2 + a3.length <= n2.length && n2.set(a3, o2);
          const h2 = new Uint8Array(a3.length);
          return h2.set(a3), this.position = e2 + a3.length, this.consecutiveForceRestarts = 0, this.consecutiveOneOffFetches++, h2.buffer;
        }
      } catch (e3) {
        d.warn(c, "One-off range fetch failed, falling back to stream restart", e3);
      }
    }
    d.debug(c, `Read: starting new stream from ${e2}`), await this.startStream(e2), d.debug(c, "Read: waiting for data...");
    const a2 = await this.waitForData(e2, t2);
    if (d.debug(c, `Read: waitForData returned ${a2}`), !a2) throw new Error(`Timeout at ${e2}`);
    return this.consecutiveForceRestarts = 0, this.consecutiveOneOffFetches = 0, this.seekHinted = false, this.readFromBuffer(e2, t2);
  }
  readFromBuffer(e2, t2) {
    const i2 = this.getBuffer(), r2 = e2 - this.atomicGetBufferStart(), s2 = Math.min(t2, this.bufferEnd - e2), a2 = new Uint8Array(s2);
    return a2.set(i2.subarray(r2, r2 + s2)), this.position = e2 + s2, this.position > this.readMax && (this.readMax = this.position), this.recentReads.push(e2), this.recentReads.length > 64 && this.recentReads.shift(), a2.buffer;
  }
  seek(e2) {
    return this.position = e2, this.position;
  }
  getPosition() {
    return this.position;
  }
  getSharedBuffer() {
    return this.sharedBuffer;
  }
  close() {
    this.stopStream(), d.debug(c, "Source closed");
  }
  getKey() {
    return this.url;
  }
  async fork() {
    return new HttpSource(this.url, { ...this.headers }, this.maxBufferSizeMB);
  }
  getUrl() {
    return this.url;
  }
  isFullyCached() {
    return this.fullyBuffered;
  }
  getBufferedEnd() {
    if (this.fullyBuffered && this.size > 0) return this.size;
    const e2 = this.bufferEnd, t2 = this.atomicGetBufferStart();
    if (this.position < t2 || this.position > e2) return this.position;
    const i2 = t2 + 2 * this.bufferSize;
    let r2 = e2;
    return this.maxBufferedEnd > e2 && this.maxBufferedEnd <= i2 && (r2 = this.maxBufferedEnd), this.size > 0 && r2 > this.size ? this.size : r2;
  }
  getBufferStart() {
    return this.atomicGetBufferStart();
  }
  getNetworkStats() {
    const e2 = (this.lastSpeedTime > 0 ? (Date.now() - this.lastSpeedTime) / 1e3 : 0) > 1 ? 0 : this.currentSpeed;
    return { totalBytes: this.totalBytesDownloaded, currentSpeed: e2, elapsed: this.streamStartTime > 0 ? (Date.now() - this.streamStartTime) / 1e3 : 0 };
  }
}
const m = "LRUCache";
class LRUCache {
  cache = /* @__PURE__ */ new Map();
  maxSizeBytes;
  currentSizeBytes = 0;
  constructor(e2 = 100) {
    this.maxSizeBytes = 1024 * e2 * 1024, d.debug(m, `Created with max size: ${e2}MB`);
  }
  makeKey(e2, t2, i2) {
    return `${e2}:${t2}:${i2}`;
  }
  get(e2, t2, i2) {
    const r2 = this.makeKey(e2, t2, i2), s2 = this.cache.get(r2);
    return s2 ? (s2.accessTime = performance.now(), d.debug(m, `Cache hit: ${r2}`), s2.data) : null;
  }
  set(e2, t2, i2, r2) {
    const s2 = this.makeKey(e2, t2, i2);
    if (this.cache.has(s2)) {
      const e3 = this.cache.get(s2);
      this.currentSizeBytes -= e3.data.byteLength, this.cache.delete(s2);
    }
    for (; this.currentSizeBytes + r2.byteLength > this.maxSizeBytes && this.cache.size > 0; ) this.evictLRU();
    const a2 = { key: s2, data: r2, accessTime: performance.now() };
    this.cache.set(s2, a2), this.currentSizeBytes += r2.byteLength, d.debug(m, `Cache set: ${s2}, size: ${r2.byteLength}, total: ${this.currentSizeBytes}`);
  }
  findOverlapping(e2, t2, i2) {
    const r2 = [], s2 = t2 + i2;
    for (const [i3, a2] of this.cache) {
      if (!i3.startsWith(e2 + ":")) continue;
      const n2 = i3.split(":"), o2 = parseInt(n2[n2.length - 2], 10), h2 = parseInt(n2[n2.length - 1], 10);
      o2 < s2 && o2 + h2 > t2 && (a2.accessTime = performance.now(), r2.push({ offset: o2, length: h2, data: a2.data }));
    }
    return r2;
  }
  evictLRU() {
    let e2 = null, t2 = 1 / 0;
    for (const [i2, r2] of this.cache) r2.accessTime < t2 && (t2 = r2.accessTime, e2 = i2);
    if (e2) {
      const t3 = this.cache.get(e2);
      this.currentSizeBytes -= t3.data.byteLength, this.cache.delete(e2), d.debug(m, `Evicted: ${e2}`);
    }
  }
  clear() {
    this.cache.clear(), this.currentSizeBytes = 0, d.debug(m, "Cache cleared");
  }
  getSize() {
    return this.currentSizeBytes;
  }
  getEntryCount() {
    return this.cache.size;
  }
  getUtilization() {
    return this.currentSizeBytes / this.maxSizeBytes * 100;
  }
  getMaxSize() {
    return this.maxSizeBytes;
  }
  getCachedRanges(e2) {
    const t2 = [];
    for (const [i2] of this.cache) {
      if (!i2.startsWith(e2 + ":")) continue;
      const r2 = i2.split(":"), s2 = parseInt(r2[r2.length - 2], 10), a2 = parseInt(r2[r2.length - 1], 10);
      t2.push({ offset: s2, length: a2 });
    }
    return t2.sort((e3, t3) => e3.offset - t3.offset), t2;
  }
}
const g = "FileSource", p = 2097152, b = /* @__PURE__ */ new WeakMap();
let v = 1;
function y(e2) {
  const t2 = b.get(e2);
  if (void 0 !== t2) return t2;
  const i2 = v++;
  return b.set(e2, i2), i2;
}
class FileSource {
  file;
  displayName;
  cache;
  size = -1;
  position = 0;
  preloadPromise = null;
  sourceKey;
  currentTime = 0;
  duration = 0;
  preloadOffset = 0;
  preloadAbort = false;
  fullFilePreload = true;
  totalBytesRead = 0;
  lastSpeedBytes = 0;
  lastSpeedTime = 0;
  currentReadSpeed = 0;
  readStartTime = 0;
  onRevokedCallback = null;
  revokedFired = false;
  preloadComplete = false;
  onPreloadCompleteCallback = null;
  constructor(e2, t2 = null, i2) {
    this.file = e2, this.displayName = i2 ?? ("undefined" != typeof File && e2 instanceof File ? e2.name : `blob-${y(e2)}`), this.size = e2.size, this.cache = t2 || new LRUCache(100), this.sourceKey = this.getKey();
  }
  setOnRevoked(e2) {
    this.onRevokedCallback = e2;
  }
  setFullFilePreload(e2) {
    this.fullFilePreload = e2;
  }
  setOnPreloadComplete(e2) {
    this.preloadComplete ? e2() : this.onPreloadCompleteCallback = e2;
  }
  isPreloadComplete() {
    return this.preloadComplete;
  }
  async getSize() {
    return -1 === this.size && (this.size = this.file.size), this.startPreload(), this.size;
  }
  updatePreloadPosition(e2, t2) {
    t2 <= 0 || this.size <= 0 || (this.currentTime = e2, this.duration = t2);
  }
  async read(e2, t2) {
    const i2 = Math.max(0, Math.min(e2, this.size)), r2 = this.size - i2, s2 = Math.max(0, Math.min(t2, r2));
    if (0 === s2) return new ArrayBuffer(0);
    this.position = i2 + s2;
    const a2 = this.cache.get(this.sourceKey, i2, s2);
    if (a2) return a2;
    const n2 = this.cache.findOverlapping(this.sourceKey, i2, s2);
    if (n2.length > 0) {
      const e3 = this.constructFromOverlapping(n2, i2, s2);
      if (e3) return e3;
    }
    return await this.readFromFile(i2, s2);
  }
  seek(e2) {
    return this.position = Math.max(0, Math.min(e2, this.size)), this.position;
  }
  getPosition() {
    return this.position;
  }
  getDiskStats() {
    const e2 = (this.lastSpeedTime > 0 ? (Date.now() - this.lastSpeedTime) / 1e3 : 0) > 1 ? 0 : this.currentReadSpeed;
    return { totalBytes: this.totalBytesRead, currentSpeed: e2, elapsed: this.readStartTime > 0 ? (Date.now() - this.readStartTime) / 1e3 : 0 };
  }
  close() {
    this.cache.clear(), this.position = 0;
  }
  getKey() {
    const e2 = "undefined" != typeof File && this.file instanceof File ? this.file.lastModified : 0;
    return `file:${this.displayName}:${this.file.size}:${e2}:${y(this.file)}`;
  }
  async fork() {
    const e2 = new FileSource(this.file, null, this.displayName);
    return e2.setFullFilePreload(false), e2;
  }
  startPreload() {
    this.preloadPromise || (this.preloadPromise = this.preloadChunks());
  }
  async preloadChunks() {
    this.preloadAbort = false;
    try {
      const e2 = this.preloadOffset > 0 ? this.preloadOffset : 0, t2 = this.duration > 0 && this.currentTime > 0 ? ` (time: ${this.currentTime.toFixed(2)}s / ${this.duration.toFixed(2)}s)` : "";
      d.debug(g, `Starting preload for file: ${this.displayName} around offset ${e2}${t2} (${this.size} bytes)`);
      const i2 = Math.ceil(this.size / p), r2 = this.cache.getMaxSize(), s2 = this.fullFilePreload && r2 > 0 && this.size < 0.8 * r2, a2 = s2 ? i2 : 20, n2 = s2 ? 0 : 5, o2 = Math.floor(e2 / p), h2 = s2 ? 0 : o2, c2 = Math.min((s2 ? 0 : o2) + a2, i2), u2 = Math.max(0, o2 - n2), l2 = o2;
      for (let e3 = h2; e3 < c2 && !this.preloadAbort && !await this.shouldStopPreload(); e3++) {
        const t3 = e3 * p, i3 = Math.min(p, this.size - t3);
        if (i3 <= 0) break;
        if (this.cache.get(this.sourceKey, t3, i3)) continue;
        const r3 = await this.readChunkFromFile(t3, i3);
        this.cache.set(this.sourceKey, t3, i3, r3);
      }
      for (let e3 = l2 - 1; e3 >= u2 && !this.preloadAbort && !await this.shouldStopPreload(); e3--) {
        const t3 = e3 * p, i3 = Math.min(p, this.size - t3);
        if (i3 <= 0) continue;
        if (this.cache.get(this.sourceKey, t3, i3)) continue;
        const r3 = await this.readChunkFromFile(t3, i3);
        this.cache.set(this.sourceKey, t3, i3, r3);
      }
      this.preloadAbort || d.debug(g, `Preload completed for file: ${this.displayName} around offset ${e2}`);
    } catch (e2) {
      d.error(g, `Failed to preload file: ${this.displayName}`, e2);
    } finally {
      if (this.preloadPromise = null, this.preloadAbort = false, !this.preloadComplete) {
        this.preloadComplete = true;
        const e2 = this.onPreloadCompleteCallback;
        this.onPreloadCompleteCallback = null, e2 && e2();
      }
    }
  }
  async shouldStopPreload() {
    const e2 = this.cache.getUtilization();
    return e2 >= 95 && (d.debug(g, `Cache nearly full (${e2.toFixed(1)}%), stopping preload`), true);
  }
  async readChunkFromFile(e2, t2) {
    const i2 = this.file.slice(e2, e2 + t2), r2 = `FileSource read timeout (8000ms) at offset=${e2} length=${t2} — file handle likely revoked by browser; user must re-pick the file`;
    let s2;
    try {
      s2 = await Promise.race([i2.arrayBuffer(), new Promise((e3, t3) => setTimeout(() => t3(new Error(r2)), 8e3))]);
    } catch (i3) {
      if (!this.revokedFired && this.onRevokedCallback) {
        this.revokedFired = true;
        try {
          this.onRevokedCallback({ offset: e2, length: t2, reason: r2 });
        } catch {
        }
      }
      throw i3;
    }
    0 === this.readStartTime && (this.readStartTime = Date.now(), this.lastSpeedTime = this.readStartTime), this.totalBytesRead += s2.byteLength;
    const a2 = Date.now(), n2 = (a2 - this.lastSpeedTime) / 1e3;
    return n2 >= 0.5 && (this.currentReadSpeed = (this.totalBytesRead - this.lastSpeedBytes) / n2, this.lastSpeedBytes = this.totalBytesRead, this.lastSpeedTime = a2), s2;
  }
  async readFromFile(e2, t2) {
    const i2 = new ArrayBuffer(t2), r2 = new Uint8Array(i2), s2 = Math.floor(e2 / p), a2 = Math.floor((e2 + t2 - 1) / p);
    for (let i3 = s2; i3 <= a2; i3++) {
      const s3 = i3 * p, a3 = Math.min(p, this.size - s3);
      if (a3 <= 0) break;
      let n2 = this.cache.get(this.sourceKey, s3, a3);
      n2 || (n2 = await this.readChunkFromFile(s3, a3), this.cache.set(this.sourceKey, s3, a3, n2));
      const o2 = Math.max(e2, s3), h2 = Math.min(e2 + t2, s3 + a3);
      if (h2 > o2) {
        const t3 = o2 - e2, i4 = o2 - s3, a4 = h2 - o2;
        r2.set(new Uint8Array(n2, i4, a4), t3);
      }
    }
    return i2;
  }
  constructFromOverlapping(e2, t2, i2) {
    const r2 = t2 + i2, s2 = new ArrayBuffer(i2), a2 = new Uint8Array(s2);
    let n2 = 0;
    e2.sort((e3, t3) => e3.offset - t3.offset);
    for (const i3 of e2) {
      const e3 = i3.offset + i3.length, s3 = Math.max(t2, i3.offset), o2 = Math.min(r2, e3);
      if (s3 < o2) {
        const e4 = o2 - s3, r3 = s3 - i3.offset, h2 = s3 - t2;
        a2.set(new Uint8Array(i3.data, r3, e4), h2), n2 += e4;
      }
    }
    return n2 === i2 ? s2 : null;
  }
}
const S = "ThumbnailHttpSource";
class ThumbnailHttpSource {
  url;
  headers;
  size = -1;
  position = 0;
  abortController = null;
  rangeUnsupported = false;
  buffer = null;
  bufferStart = 0;
  bufferEnd = 0;
  borrowSource = null;
  constructor(e2, t2 = {}, i2 = null) {
    this.url = e2, this.headers = t2, this.borrowSource = i2;
  }
  setBorrowSource(e2) {
    this.borrowSource = e2;
  }
  seedSize(e2) {
    e2 > 0 && (this.size = e2);
  }
  async getSize() {
    if (this.size >= 0) return this.size;
    const e2 = await fetch(this.url, { method: "HEAD", headers: this.headers });
    if (!e2.ok) throw new Error(`HTTP ${e2.status}`);
    const t2 = e2.headers.get("Content-Length");
    if (t2) this.size = parseInt(t2, 10);
    else {
      const e3 = await this.resolveSizeViaRange();
      if (null === e3) throw new Error("Content-Length missing");
      this.size = e3;
    }
    return d.debug(S, `File size: ${this.size} bytes`), this.size;
  }
  async resolveSizeViaRange() {
    let e2;
    try {
      e2 = await fetch(this.url, { method: "GET", headers: { ...this.headers, Range: "bytes=0-0" } });
    } catch {
      return null;
    }
    if (e2.body?.cancel().catch(() => {
    }), !e2.ok && 206 !== e2.status) return null;
    const t2 = e2.headers.get("Content-Range");
    if (t2) {
      const e3 = /\/\s*(\d+)\s*$/.exec(t2);
      if (e3) return parseInt(e3[1], 10);
    }
    const i2 = e2.headers.get("Content-Length");
    return 200 === e2.status && i2 ? parseInt(i2, 10) : null;
  }
  isInBuffer(e2, t2) {
    return null !== this.buffer && e2 >= this.bufferStart && e2 + t2 <= this.bufferEnd;
  }
  async read(e2, t2) {
    if (this.size > 0 && e2 >= this.size) return new ArrayBuffer(0);
    if (this.isInBuffer(e2, t2)) {
      const i3 = e2 - this.bufferStart, r3 = new Uint8Array(t2);
      return r3.set(this.buffer.subarray(i3, i3 + t2)), this.position = e2 + t2, d.debug(S, `Read from buffer: offset=${e2}, length=${t2}`), r3.buffer;
    }
    if (this.borrowSource) {
      const i3 = this.borrowSource.peekMetadata(e2, t2);
      if (i3) return this.position = e2 + t2, d.debug(S, `Read borrowed from metadata LRU: offset=${e2}, length=${t2}`), i3.buffer;
      const r3 = this.borrowSource.peekRange(e2, t2);
      if (r3) return this.position = e2 + t2, d.debug(S, `Read borrowed from main window: offset=${e2}, length=${t2}`), r3.buffer;
    }
    if (this.rangeUnsupported) return new ArrayBuffer(0);
    const i2 = e2, r2 = Math.min(Math.max(2097152, t2), 5242880), s2 = this.size > 0 ? Math.min(i2 + r2 - 1, this.size - 1) : i2 + r2 - 1;
    d.debug(S, `Fetching: range=${i2}-${s2} (${((s2 - i2 + 1) / 1024).toFixed(1)} KB)`);
    for (let r3 = 0; r3 <= 5; r3++) {
      "undefined" != typeof self && self.navigator && !self.navigator.onLine && (d.warn(S, "Network offline, waiting for connection..."), await new Promise((e3) => {
        const t3 = () => {
          self.removeEventListener("online", t3), e3();
        };
        self.addEventListener("online", t3);
      }), d.info(S, "Network online, resuming..."), r3 = 0);
      const a2 = new AbortController(), n2 = setTimeout(() => a2.abort(), 1e4);
      try {
        const r4 = await fetch(this.url, { headers: { ...this.headers, Range: `bytes=${i2}-${s2}` }, cache: "no-store", signal: a2.signal });
        if (clearTimeout(n2), 200 === r4.status) return d.info(S, "Server returned 200 (no Range support) — thumbnails switch to borrow-only."), a2.abort(), this.rangeUnsupported = true, new ArrayBuffer(0);
        if (!r4.ok && 206 !== r4.status) {
          if (416 === r4.status) return d.warn(S, `HTTP 416 (Range Not Satisfiable) at ${i2}-${s2}. Treating as EOF.`), new ArrayBuffer(0);
          throw r4.status >= 500 || 429 === r4.status ? new Error(`HTTP ${r4.status}`) : new Error(`HTTP ${r4.status} (Fatal)`);
        }
        const o2 = await r4.arrayBuffer();
        this.buffer = new Uint8Array(o2), this.bufferStart = i2, this.bufferEnd = i2 + o2.byteLength, d.debug(S, `Buffered: ${this.bufferStart}-${this.bufferEnd} (${(o2.byteLength / 1024).toFixed(1)} KB)`);
        const h2 = Math.min(t2, o2.byteLength), c2 = new Uint8Array(h2);
        return c2.set(this.buffer.subarray(0, h2)), this.position = e2 + h2, c2.buffer;
      } catch (t3) {
        if (clearTimeout(n2), "AbortError" === t3.name) return d.debug(S, `Read aborted at offset ${e2}`), new ArrayBuffer(0);
        const i3 = t3.message || "";
        if ("TypeError" === t3.name && i3.includes("Failed to fetch")) throw d.error(S, `CORS error accessing ${this.url}`), new Error("Failed to fetch video resource. Check your connection or CORS settings.");
        if (t3.message && t3.message.includes("(Fatal)")) throw t3;
        if (5 === r3) throw d.error(S, "Max retries (5) reached for thumbnail fetch, giving up."), t3;
        d.warn(S, `Fetch error (attempt ${r3 + 1}/5), retrying...`, t3);
        const s3 = Math.min(1e3 * Math.pow(1.5, r3), 5e3);
        await new Promise((e3) => setTimeout(e3, s3));
      }
    }
    return new ArrayBuffer(0);
  }
  seek(e2) {
    return this.position = e2, this.position;
  }
  getPosition() {
    return this.position;
  }
  clearBuffer() {
    this.buffer = null, this.bufferStart = 0, this.bufferEnd = 0, d.debug(S, "Buffer cleared");
  }
  close() {
    this.abortController && (this.abortController.abort(), this.abortController = null), this.buffer = null, d.debug(S, "Source closed");
  }
  getKey() {
    return `thumbnail:${this.url}`;
  }
  getUrl() {
    return this.url;
  }
  getBufferedEnd() {
    return this.bufferEnd;
  }
  getBufferStart() {
    return this.bufferStart;
  }
}
const w = "EncryptedSource";
function k(e2) {
  const t2 = atob(e2), i2 = new ArrayBuffer(t2.length), r2 = new Uint8Array(i2);
  for (let e3 = 0; e3 < t2.length; e3++) r2[e3] = t2.charCodeAt(e3);
  return r2;
}
function _(e2) {
  let t2 = "";
  for (const i2 of e2) t2 += i2.toString(16).padStart(2, "0");
  return t2;
}
class EncryptedHttpSource extends HttpSource {
  _encConfig;
  _cryptoReady;
  _clientPrivKey = null;
  _clientPubB64 = "";
  _masterKey = null;
  _hmacKey = null;
  _token = "";
  _expiresAt = 0;
  _knownFileSize = -1;
  _encContentDispositionFilename = null;
  _tokenRefresh = null;
  _usedNonces = /* @__PURE__ */ new Set();
  _abortCtrl = new AbortController();
  _authFailed = false;
  static BLOCK_SIZE = 2097152;
  static MAX_CACHED_BLOCKS = 160;
  static READAHEAD_BLOCKS = 16;
  static PREFETCH_LOW_WATER = 32;
  static PREFETCH_HIGH_WATER = 96;
  static MAX_CONCURRENT_STREAMS = 2;
  _maxCachedBlocks = EncryptedHttpSource.MAX_CACHED_BLOCKS;
  _prefetchLowWater = EncryptedHttpSource.PREFETCH_LOW_WATER;
  _prefetchHighWater = EncryptedHttpSource.PREFETCH_HIGH_WATER;
  _lastReadEnd = 0;
  _blockCache = /* @__PURE__ */ new Map();
  _blockInflight = /* @__PURE__ */ new Map();
  _activeStreams = /* @__PURE__ */ new Set();
  constructor(e2) {
    super(e2.videoUrl, e2.headers ?? {}), this._encConfig = e2, this._cryptoReady = this.initCrypto(), d.info(w, "Created (ECDH protected)");
  }
  async initCrypto() {
    const e2 = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]), t2 = new Uint8Array(await crypto.subtle.exportKey("raw", e2.publicKey));
    this._clientPubB64 = function(e3) {
      let t3 = "";
      for (const i3 of e3) t3 += String.fromCharCode(i3);
      return btoa(t3);
    }(t2);
    const i2 = await crypto.subtle.exportKey("pkcs8", e2.privateKey);
    this._clientPrivKey = await crypto.subtle.importKey("pkcs8", i2, { name: "ECDH", namedCurve: "P-256" }, false, ["deriveBits"]);
  }
  async resolveSize() {
    if (await this.ensureValidToken(), this._knownFileSize < 0) throw new Error("Token did not include fileSize");
    return this._knownFileSize;
  }
  async read(e2, t2) {
    const i2 = Math.max(0, e2);
    let r2 = Math.max(0, t2);
    if (0 === r2) return new ArrayBuffer(0);
    if (this._knownFileSize > 0) {
      if (i2 >= this._knownFileSize) return new ArrayBuffer(0);
      if (r2 = Math.min(r2, this._knownFileSize - i2), r2 <= 0) return new ArrayBuffer(0);
    }
    const s2 = EncryptedHttpSource.BLOCK_SIZE, a2 = Math.floor(i2 / s2), n2 = Math.floor((i2 + r2 - 1) / s2);
    this._lastReadEnd = i2 + r2, this.seek(this._lastReadEnd);
    const o2 = performance.now(), h2 = [], d2 = [];
    for (let e3 = a2; e3 <= n2; e3++) this._blockCache.has(e3) ? h2.push(e3) : d2.push(e3);
    globalThis.__movilog?.log(`[EncSrc] read offset=${i2} len=${r2} blocks=[${a2}..${n2}] hits=${h2.length} misses=${d2.length}${d2.length ? ` missBlocks=${d2.join(",")}` : ""}`);
    const c2 = [];
    for (let e3 = a2; e3 <= n2; e3++) c2.push(await this.fetchBlock(e3));
    const u2 = performance.now() - o2;
    u2 > 100 && globalThis.__movilog?.log(`[EncSrc] read DONE offset=${i2} blocks=[${a2}..${n2}] took ${u2.toFixed(0)}ms`);
    const l2 = new Uint8Array(r2);
    let f2 = 0;
    for (let e3 = a2; e3 <= n2; e3++) {
      const t3 = c2[e3 - a2], n3 = e3 * s2, o3 = Math.max(0, i2 - n3), h3 = Math.min(t3.length, i2 + r2 - n3);
      if (h3 <= o3) continue;
      const d3 = t3.subarray(o3, h3);
      l2.set(d3, f2), f2 += d3.length;
    }
    const m2 = i2 + f2;
    return this.maybePrefetch(m2), f2 === r2 ? l2.buffer : l2.slice(0, f2).buffer;
  }
  maybePrefetch(e2) {
    if (this._authFailed) return;
    const t2 = EncryptedHttpSource.BLOCK_SIZE;
    if (this._knownFileSize > 0 && e2 >= this._knownFileSize) return;
    const i2 = Math.floor(e2 / t2), r2 = this._knownFileSize > 0 ? Math.floor((this._knownFileSize - 1) / t2) : i2 + this._prefetchHighWater;
    for (; ; ) {
      if (this._activeStreams.size >= EncryptedHttpSource.MAX_CONCURRENT_STREAMS) return;
      const e3 = Math.min(r2, i2 + this._prefetchHighWater);
      let t3 = -1;
      for (let r3 = i2; r3 <= e3; r3++) if (!this._blockCache.has(r3) && !this._blockInflight.has(r3)) {
        t3 = r3;
        break;
      }
      if (t3 < 0) return;
      if (t3 - i2 >= this._prefetchLowWater) return;
      this.fetchBlock(t3).catch(() => {
      });
    }
  }
  getBufferedEnd() {
    const e2 = EncryptedHttpSource.BLOCK_SIZE, t2 = Math.floor(this._lastReadEnd / e2), i2 = (e3) => this._blockCache.has(e3) || this._blockInflight.has(e3);
    let r2 = t2;
    if (!i2(r2)) {
      r2 = -1;
      const e3 = Math.max(0, t2 - 3);
      for (let s3 = t2 - 1; s3 >= e3; s3--) if (i2(s3)) {
        r2 = s3;
        break;
      }
      if (r2 < 0) return 0;
    }
    let s2 = r2;
    for (let e3 = r2 + 1; i2(e3); e3++) s2 = e3;
    const a2 = (s2 + 1) * e2;
    return this._knownFileSize > 0 ? Math.min(a2, this._knownFileSize) : a2;
  }
  setMaxBufferSize(e2) {
    if (!(e2 > 0)) return;
    const t2 = EncryptedHttpSource.BLOCK_SIZE / 1048576, i2 = Math.max(4, Math.floor(e2 / t2));
    this._prefetchHighWater = i2, this._prefetchLowWater = Math.max(2, Math.floor(i2 / 2)), this._maxCachedBlocks = Math.max(EncryptedHttpSource.MAX_CACHED_BLOCKS, Math.floor(1.5 * i2));
  }
  async fetchBlock(e2) {
    const t2 = this._blockCache.get(e2);
    if (t2) return t2;
    const i2 = this._blockInflight.get(e2);
    if (i2) return globalThis.__movilog?.log(`[EncSrc] fetchBlock(${e2}) awaiting existing inflight`), i2;
    const r2 = e2;
    let s2 = e2 + EncryptedHttpSource.READAHEAD_BLOCKS;
    if (this._knownFileSize > 0) {
      const e3 = Math.floor((this._knownFileSize - 1) / EncryptedHttpSource.BLOCK_SIZE);
      s2 > e3 && (s2 = e3);
    }
    globalThis.__movilog?.log(`[EncSrc] fetchBlock(${e2}) → NEW stream [${r2}..${s2}] (cache=${this._blockCache.size}, inflight=${this._blockInflight.size}, activeStreams=${this._activeStreams.size})`);
    const a2 = r2 - 8, n2 = s2 + EncryptedHttpSource.PREFETCH_HIGH_WATER;
    for (const e3 of this._activeStreams) if (e3.lastBlock < a2 || e3.firstBlock > n2) {
      if (e3.resolvers.size > 0) continue;
      globalThis.__movilog?.log(`[EncSrc] Aborting stale stream [${e3.firstBlock}..${e3.lastBlock}] — outside [${a2}..${n2}]`);
      try {
        e3.abortCtrl.abort();
      } catch {
      }
    }
    if (this._activeStreams.size >= EncryptedHttpSource.MAX_CONCURRENT_STREAMS) {
      for (const e3 of this._activeStreams) if (0 === e3.resolvers.size) {
        globalThis.__movilog?.log(`[EncSrc] Evicting active stream [${e3.firstBlock}..${e3.lastBlock}] to stay under concurrent cap`);
        try {
          e3.abortCtrl.abort();
        } catch {
        }
        if (this._activeStreams.delete(e3), this._activeStreams.size < EncryptedHttpSource.MAX_CONCURRENT_STREAMS) break;
      }
    }
    const o2 = /* @__PURE__ */ new Map();
    for (let e3 = r2; e3 <= s2; e3++) {
      if (this._blockCache.has(e3) || this._blockInflight.has(e3)) continue;
      const t3 = new Promise((t4, i3) => {
        o2.set(e3, { resolve: t4, reject: i3 });
      });
      t3.catch(() => {
      }), this._blockInflight.set(e3, t3);
    }
    return this.streamBlocks(r2, s2, o2).catch((e3) => {
      for (const [t3, i3] of o2) i3.reject(e3), this._blockInflight.delete(t3);
    }), this._blockInflight.get(e2) ?? Promise.reject(new Error("block was neither cached nor inflight"));
  }
  async streamBlocks(e2, t2, i2) {
    const r2 = Math.floor(1e4 * Math.random()), s2 = performance.now();
    globalThis.__movilog?.log(`[EncSrc] stream#${r2} START [${e2}..${t2}] ensuring token...`);
    const a2 = new AbortController(), n2 = this._abortCtrl, o2 = () => a2.abort();
    n2.signal.aborted ? a2.abort() : n2.signal.addEventListener("abort", o2);
    const h2 = { firstBlock: e2, lastBlock: t2, abortCtrl: a2, resolvers: i2 };
    if (this._activeStreams.add(h2), await this.ensureValidToken(), !this._masterKey || !this._hmacKey) throw this._activeStreams.delete(h2), n2.signal.removeEventListener("abort", o2), new Error("Session keys unavailable");
    const d2 = this._masterKey, c2 = this._token, u2 = this._hmacKey, l2 = EncryptedHttpSource.BLOCK_SIZE, f2 = e2 * l2;
    let m2 = (t2 + 1) * l2 - 1;
    this._knownFileSize > 0 && (m2 = Math.min(m2, this._knownFileSize - 1));
    const g2 = m2 - f2 + 1;
    globalThis.__movilog?.log(`[EncSrc] stream#${r2} token ready (${(performance.now() - s2).toFixed(0)}ms), range=${f2}-${m2} (${(g2 / 1024 / 1024).toFixed(1)} MB)`);
    const p2 = this.generateNonce(), b2 = Date.now(), v2 = `GET:${c2}:${p2}:${b2}:${f2}:${g2}`, y2 = new Uint8Array(await crypto.subtle.sign("HMAC", u2, new TextEncoder().encode(v2))), S2 = performance.now(), w2 = await fetch(this._encConfig.videoUrl, { method: "GET", headers: { Range: `bytes=${f2}-${m2}`, "X-Token": c2, "X-Fingerprint": this._encConfig.fingerprint, "X-Nonce": p2, "X-Timestamp": String(b2), "X-Signature": _(y2), ...this._encConfig.headers }, credentials: "include", signal: a2.signal });
    if (globalThis.__movilog?.log(`[EncSrc] stream#${r2} fetch() returned ${w2.status} in ${(performance.now() - S2).toFixed(0)}ms`), 401 === w2.status || 403 === w2.status) throw this._token = "", this._expiresAt = 0, this._authFailed = true, this._encConfig.onAuthFailed?.(`Auth failed: ${w2.status}`), new Error(`Auth failed: ${w2.status}`);
    if (!w2.ok && 206 !== w2.status || !w2.body) throw new Error(`HTTP ${w2.status}: ${w2.statusText}`);
    const k2 = w2.body.getReader();
    let T2 = new Uint8Array(0), A2 = e2;
    const R2 = (e3) => {
      const t3 = performance.now();
      if (this._blockCache.set(A2, e3), this._blockCache.size > this._maxCachedBlocks) {
        const e4 = this._blockCache.keys().next().value;
        void 0 !== e4 && this._blockCache.delete(e4);
      }
      const a3 = i2.get(A2), n3 = !!a3;
      a3 && (a3.resolve(e3), i2.delete(A2)), this._blockInflight.delete(A2), globalThis.__movilog?.log(`[EncSrc] stream#${r2} commit block=${A2}${n3 ? " (resolver fired)" : ""} @ ${(t3 - s2).toFixed(0)}ms since stream start`), A2++;
    };
    let x2 = 0, P2 = Promise.resolve();
    const E2 = (e3, t3) => {
      const i3 = crypto.subtle.decrypt({ name: "AES-GCM", iv: e3 }, d2, t3).then((e4) => new Uint8Array(e4));
      x2++, P2 = P2.then(async () => {
        const e4 = await i3;
        R2(e4), x2--;
      });
    };
    let C2 = false;
    try {
      for (; ; ) {
        const { done: e3, value: t3 } = await k2.read();
        if (t3 && t3.length > 0) {
          C2 || (globalThis.__movilog?.log(`[EncSrc] stream#${r2} first bytes (${t3.length}B) @ ${(performance.now() - s2).toFixed(0)}ms since start`), C2 = true);
          const e4 = new Uint8Array(T2.length + t3.length);
          e4.set(T2, 0), e4.set(t3, T2.length), T2 = e4;
        }
        for (; T2.length >= 4; ) {
          const e4 = new DataView(T2.buffer, T2.byteOffset, 4).getUint32(0, false);
          if (T2.length < 4 + e4) break;
          const t4 = new Uint8Array(new ArrayBuffer(12));
          t4.set(T2.subarray(4, 16));
          const i3 = new Uint8Array(new ArrayBuffer(e4 - 12));
          for (i3.set(T2.subarray(16, 4 + e4)), T2 = T2.slice(4 + e4); x2 >= 2; ) await P2;
          E2(t4, i3);
        }
        if (e3) break;
      }
      await P2, globalThis.__movilog?.log(`[EncSrc] stream#${r2} END total=${(performance.now() - s2).toFixed(0)}ms, delivered [${e2}..${A2 - 1}]`);
    } finally {
      try {
        k2.releaseLock();
      } catch {
      }
      this._activeStreams.delete(h2), n2.signal.removeEventListener("abort", o2);
    }
    for (const [e3, t3] of i2) t3.reject(new Error(`Stream ended before block ${e3}`)), this._blockInflight.delete(e3);
  }
  getKey() {
    return `encrypted:${this._encConfig.videoId}`;
  }
  getContentDispositionFilename() {
    return this._encContentDispositionFilename;
  }
  close() {
    try {
      this._abortCtrl.abort();
    } catch {
    }
    this._token = "", this._expiresAt = 0, this._masterKey = null, this._hmacKey = null, this._clientPrivKey = null, this._usedNonces.clear(), this._blockCache.clear(), this._blockInflight.clear(), super.close(), d.info(w, "Closed");
  }
  async ensureValidToken() {
    this._token && Date.now() + 500 < this._expiresAt || (this._tokenRefresh || (this._tokenRefresh = this.refreshToken().finally(() => {
      this._tokenRefresh = null;
    })), await this._tokenRefresh);
  }
  async refreshToken() {
    if (await this._cryptoReady, !this._clientPrivKey || !this._clientPubB64) throw new Error("Client ECDH keypair not ready");
    const e2 = await fetch(this._encConfig.tokenUrl, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${this._encConfig.sessionToken}`, ...this._encConfig.headers }, body: JSON.stringify({ url: this._encConfig.videoId, videoId: this._encConfig.videoId, fingerprint: this._encConfig.fingerprint, clientPubKey: this._clientPubB64 }), credentials: "include", signal: this._abortCtrl.signal });
    if (!e2.ok) {
      const t3 = `Token request failed: ${e2.status}`;
      throw d.error(w, t3), this._encConfig.onAuthFailed?.(t3), new Error(t3);
    }
    const t2 = await e2.json();
    this._token = t2.token, this._expiresAt = t2.expiresAt, this._knownFileSize < 0 && "number" == typeof t2.fileSize && (this._knownFileSize = t2.fileSize), !this._encContentDispositionFilename && "string" == typeof t2.contentDispositionFilename && t2.contentDispositionFilename && (this._encContentDispositionFilename = t2.contentDispositionFilename);
    const i2 = await crypto.subtle.importKey("raw", k(t2.serverPubKey), { name: "ECDH", namedCurve: "P-256" }, false, []), r2 = await crypto.subtle.deriveBits({ name: "ECDH", public: i2 }, this._clientPrivKey, 256), s2 = await crypto.subtle.importKey("raw", r2, { name: "HKDF" }, false, ["deriveBits"]), a2 = t2.hkdfSalt ? k(t2.hkdfSalt) : new Uint8Array(32), n2 = await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt: a2, info: new TextEncoder().encode("enc:master-aes") }, s2, 256);
    this._masterKey = await crypto.subtle.importKey("raw", n2, { name: "AES-GCM" }, false, ["decrypt"]);
    const o2 = await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt: a2, info: new TextEncoder().encode("enc:req-hmac") }, s2, 256);
    this._hmacKey = await crypto.subtle.importKey("raw", o2, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]), this._usedNonces.clear(), d.debug(w, `Token refreshed, expires in ${t2.expiresAt - Date.now()}ms`);
  }
  generateNonce() {
    const e2 = new Uint8Array(16);
    crypto.getRandomValues(e2);
    const t2 = _(e2);
    if (this._usedNonces.has(t2)) return this.generateNonce();
    if (this._usedNonces.add(t2), this._usedNonces.size > 1e3) {
      const e3 = Array.from(this._usedNonces);
      this._usedNonces.clear();
      for (const t3 of e3.slice(-500)) this._usedNonces.add(t3);
    }
    return t2;
  }
}
const T = "DashFallback", A = /\b(mp4a|ac-3|ec-3|ac-4|opus|vorbis|flac|dtsc|dtse)\b/i, R = /\b(avc[13]|hvc1|hev1|vp0[89]|vp8|vp9|av01|dvh)/i;
function x(e2, t2) {
  if (!t2) return e2;
  try {
    return new URL(t2, e2).href;
  } catch {
    return e2;
  }
}
function P(e2) {
  if (!e2) return null;
  for (const t2 of Array.from(e2.children)) if ("BaseURL" === t2.localName) return t2.textContent?.trim() || null;
  return null;
}
function E(e2, t2) {
  if (!P(e2)) return false;
  const i2 = (e3) => e3.getElementsByTagName("SegmentTemplate").length > 0 || e3.getElementsByTagName("SegmentList").length > 0 || e3.getElementsByTagName("SegmentBase").length > 0;
  return !i2(e2) && !i2(t2);
}
function C(e2, t2) {
  const i2 = (t2.getAttribute("contentType") || e2.getAttribute("mimeType") || t2.getAttribute("mimeType") || "").toLowerCase();
  if (i2.includes("audio")) return "audio";
  if (i2.includes("video")) return "video";
  const r2 = e2.getAttribute("codecs") || t2.getAttribute("codecs") || "";
  return R.test(r2) ? "video" : A.test(r2) ? "audio" : "other";
}
const F = "FFmpegLoader";
let B = null, D = null, M = null;
const $ = /* @__PURE__ */ new Map();
function I(e2) {
  const t2 = "undefined" != typeof document ? document.baseURI : "undefined" != typeof location ? location.href : import.meta.url, i2 = new URL(e2, t2);
  return i2.pathname.endsWith("/") || (i2.pathname = `${i2.pathname}/`), i2.href;
}
async function L(e2) {
  if (e2) {
    const t2 = I(e2);
    let i2 = $.get(t2);
    if (!i2) {
      const e3 = new URL("wasm/movi.js", t2).href;
      i2 = import(e3).then((e4) => e4.default), $.set(t2, i2);
    }
    return i2;
  }
  return M || (M = import("./movi-gLxgMAG1.js").then((e3) => e3.default)), M;
}
function O(e2, wasmBinary) {
  const t2 = { print: (e3) => {
    e3 && e3.trim() && d.debug("WASM", e3);
  }, printErr: (e3) => {
    e3 && e3.trim() && d.debug("WASM", e3);
  } };
  if (wasmBinary && (t2.wasmBinary = wasmBinary), e2.assetBaseUrl) {
    const i2 = new URL("wasm/", I(e2.assetBaseUrl));
    t2.locateFile = (t3) => e2.workerPath && t3.endsWith(".worker.js") ? e2.workerPath : new URL(t3.split("/").pop() || t3, i2).href;
  } else e2.workerPath && (t2.locateFile = (t3) => t3.endsWith(".worker.js") ? e2.workerPath : t3);
  return t2;
}
async function U(e2 = {}) {
  return D || B || (B = (async () => {
    d.info(F, "Loading WASM module...");
    const wasmBinary = e2.wasmBinary || null;
    try {
      const t2 = await L(e2.assetBaseUrl), i2 = await t2(O(e2, wasmBinary));
      return d.info(F, "WASM module loaded successfully"), i2.FS ? d.debug(F, "FS is present on module") : d.error(F, "FS is MISSING from module!"), D = i2, i2;
    } catch (e3) {
      throw d.error(F, "Failed to load WASM module", e3), B = null, e3;
    }
  })(), B);
}
async function V(e2 = {}) {
  d.info(F, "Loading NEW WASM module instance (isolated)...");
  const wasmBinary = e2.wasmBinary || null;
  try {
    const t2 = await L(e2.assetBaseUrl), i2 = await t2(O(e2, wasmBinary));
    return d.info(F, "NEW WASM module instance loaded"), i2;
  } catch (e3) {
    throw d.error(F, "Failed to load new WASM module", e3), e3;
  }
}
const z = 344, N = "Bindings";
function H(e2) {
  switch (e2) {
    case a.SILENT:
      return -8;
    case a.ERROR:
      return 16;
    case a.WARN:
      return 24;
    case a.INFO:
      return 32;
    case a.DEBUG:
      return 48;
    case a.TRACE:
      return 56;
    default:
      return 24;
  }
}
const W = /* @__PURE__ */ new Set();
function K(e2, t2) {
  const i2 = new DataView(e2.HEAPU8.buffer, t2, z), r2 = e2.HEAPU8.subarray(t2 + 12, t2 + 12 + 32), s2 = new TextDecoder().decode(r2.slice(0, r2.indexOf(0))), a2 = e2.HEAPU8.subarray(t2 + 100, t2 + 100 + 8), n2 = new TextDecoder().decode(a2.slice(0, a2.indexOf(0))), o2 = e2.HEAPU8.subarray(t2 + 108, t2 + 108 + 64), h2 = new TextDecoder().decode(o2.slice(0, o2.indexOf(0)));
  return { index: i2.getInt32(0, true), type: i2.getInt32(4, true), codecId: i2.getInt32(8, true), codecName: s2, width: i2.getInt32(44, true), height: i2.getInt32(48, true), frameRate: i2.getFloat64(56, true), channels: i2.getInt32(64, true), sampleRate: i2.getInt32(68, true), duration: i2.getFloat64(72, true), bitRate: Number(i2.getBigInt64(80, true)), extradataSize: i2.getInt32(88, true), profile: i2.getInt32(92, true), level: i2.getInt32(96, true), language: n2 || "", label: h2 || "", rotation: i2.getInt32(172, true), colorPrimaries: G(e2, t2 + 176, 32), colorTransfer: G(e2, t2 + 208, 32), colorMatrix: G(e2, t2 + 240, 32), pixelFormat: G(e2, t2 + 272, 32), colorRange: G(e2, t2 + 304, 32), projection: i2.getInt32(336, true), isAttachedPic: 0 !== i2.getInt32(340, true) };
}
function G(e2, t2, i2) {
  const r2 = e2.HEAPU8.subarray(t2, t2 + i2), s2 = r2.indexOf(0);
  return new TextDecoder().decode(r2.slice(0, s2 >= 0 ? s2 : i2));
}
class WasmBindings {
  module;
  contextPtr = 0;
  packetBuffer = 0;
  packetBufferSize = 0;
  dataSource = null;
  fileSize = 0;
  lastError = null;
  constructor(e2) {
    this.module = e2, this.setupAsyncHandlers(), W.add(this);
    const t2 = null !== X ? X : d.getLevel();
    this.setLogLevel(H(t2));
  }
  getHumanReadableError(e2) {
    const t2 = -e2 >>> 0, i2 = `${String.fromCharCode(255 & t2)}${String.fromCharCode(t2 >> 8 & 255)}${String.fromCharCode(t2 >> 16 & 255)}${String.fromCharCode(t2 >> 24 & 255)}`, r2 = { INDA: ": File is corrupted or in an unsupported format", FEND: ": Unexpected end of file", NDPA: ": Cannot detect file format — file may be corrupted or incomplete", NFED: ": Could not find a suitable decoder for this file", NFMX: ": Could not find a suitable demuxer for this file", EXIT: ": Operation was interrupted" };
    if (r2[i2]) return r2[i2];
    if (e2 > -100) {
      const t3 = { [-2]: ": File not found", [-13]: ": Permission denied", [-12]: ": Not enough memory to process this file", [-5]: ": Read error — file may be incomplete or inaccessible" };
      if (t3[e2]) return t3[e2];
    }
    return d.debug(N, `Unknown FFmpeg error: code=${e2}, tag=${i2}`), ": Unable to open this file";
  }
  setupAsyncHandlers() {
    const e2 = this;
    this.module.onReadRequest = async (t2, i2) => {
      try {
        if (!e2.dataSource) return d.error(N, "No data source set for read request"), void e2.fulfillRead(new Uint8Array(0), -1);
        const r2 = "bigint" == typeof t2 ? Number(t2) : t2;
        r2 > Number.MAX_SAFE_INTEGER && d.warn(N, `Read offset ${t2} exceeds MAX_SAFE_INTEGER, precision may be lost`);
        const s2 = await e2.dataSource.read(r2, i2);
        e2.fulfillRead(new Uint8Array(s2), s2.byteLength);
      } catch (t3) {
        e2.lastError = t3.message || String(t3), d.error(N, "Read request failed", t3), e2.fulfillRead(new Uint8Array(0), -1);
      }
    }, this.module.onSeekRequest = async (t2, i2) => {
      const r2 = "bigint" == typeof t2 ? Number(t2) : t2;
      if (r2 > Number.MAX_SAFE_INTEGER && d.warn(N, `Seek offset ${t2} exceeds MAX_SAFE_INTEGER, precision may be lost`), e2.dataSource && "function" == typeof e2.dataSource.seek) try {
        e2.dataSource.seek(r2);
      } catch (e3) {
        d.warn(N, "Source seek failed, continuing anyway", e3);
      }
      const s2 = "bigint" == typeof t2 ? t2 : BigInt(Math.floor(r2));
      e2.fulfillSeek(s2);
    };
  }
  fulfillRead(e2, t2) {
    const i2 = this.module._pendingRead;
    i2 ? (t2 > 0 && e2.byteLength > 0 && this.module.HEAPU8.set(e2.subarray(0, t2), i2.buffer), i2.resolve(t2), this.module._pendingRead = null) : d.warn(N, "No pending read to fulfill");
  }
  fulfillSeek(e2) {
    const t2 = this.module._pendingSeek;
    if (!t2) return void d.warn(N, "No pending seek to fulfill");
    const i2 = "bigint" == typeof e2 ? e2 : BigInt(Math.floor(e2));
    t2.resolve(i2), this.module._pendingSeek = null;
  }
  setDataSource(e2) {
    this.dataSource = e2;
  }
  setFileSize(e2) {
    if (!this.contextPtr) return void d.warn(N, "Cannot set file size: context not created");
    const t2 = 4294967295 & e2, i2 = Math.floor(e2 / 4294967296);
    this.module._movi_set_file_size(this.contextPtr, t2, i2), d.debug(N, `File size set: ${e2} bytes`);
  }
  create() {
    return this.contextPtr && (d.warn(N, "Context already exists, destroying old context"), this.destroy()), this.contextPtr = this.module._movi_create(), this.contextPtr ? (this.packetBufferSize = 10485760, this.packetBuffer = this.module._malloc(this.packetBufferSize), d.debug(N, "Context created"), true) : (d.error(N, "Failed to create movi context"), false);
  }
  destroy() {
    W.delete(this), this.packetBuffer && (this.module._free(this.packetBuffer), this.packetBuffer = 0), this.contextPtr && (this.module._movi_destroy(this.contextPtr), this.contextPtr = 0), this.dataSource = null, this.fileSize = 0, d.debug(N, "Context destroyed");
  }
  async open() {
    if (!this.contextPtr) throw new Error("Context not created");
    if (!this.dataSource) throw new Error("Data source not set");
    this.fileSize = await this.dataSource.getSize(), this.module._fileSize = BigInt(Math.floor(this.fileSize));
    const e2 = BigInt(Math.floor(this.fileSize)), t2 = Number(0xffffffffn & e2), i2 = Number(e2 >> 32n);
    this.module._movi_set_file_size(this.contextPtr, t2, i2), this.lastError = null;
    const r2 = await this.module.ccall("movi_open", "number", ["number"], [this.contextPtr], { async: true });
    if (r2 < 0) {
      let e3;
      throw e3 = this.lastError ? `: ${this.lastError}` : this.getHumanReadableError(r2), new Error(`Failed to open media${e3}`);
    }
    return d.debug(N, `Media opened with ${r2} streams`), r2;
  }
  getDuration() {
    return this.contextPtr ? this.module._movi_get_duration(this.contextPtr) : 0;
  }
  getStartTime() {
    return this.contextPtr ? this.module._movi_get_start_time(this.contextPtr) : 0;
  }
  getFormatName() {
    if (!this.contextPtr) return "UNKNOWN";
    const e2 = this.module._malloc(64);
    try {
      return this.module._movi_get_format_name(this.contextPtr, e2, 64) > 0 ? this.module.UTF8ToString(e2) : "UNKNOWN";
    } catch (e3) {
      return "UNKNOWN";
    } finally {
      this.module._free(e2);
    }
  }
  getMetadataTitle() {
    if (!this.contextPtr) return "";
    const e2 = this.module._malloc(256);
    try {
      return this.module._movi_get_metadata_title(this.contextPtr, e2, 256) > 0 ? this.module.UTF8ToString(e2) : "";
    } catch (e3) {
      return "";
    } finally {
      this.module._free(e2);
    }
  }
  getStreamCount() {
    return this.contextPtr ? this.module._movi_get_stream_count(this.contextPtr) : 0;
  }
  getStreamInfo(e2) {
    if (!this.contextPtr) return null;
    const t2 = this.module._malloc(z);
    this.module.HEAPU8.fill(0, t2, t2 + z);
    try {
      return 0 !== this.module._movi_get_stream_info(this.contextPtr, e2, t2) ? null : K(this.module, t2);
    } finally {
      this.module._free(t2);
    }
  }
  getExtradata(e2) {
    if (!this.contextPtr) return null;
    const t2 = this.getStreamInfo(e2);
    if (!t2 || 0 === t2.extradataSize) return null;
    const i2 = this.module._malloc(t2.extradataSize);
    try {
      const r2 = this.module._movi_get_extradata(this.contextPtr, e2, i2, t2.extradataSize);
      if (r2 <= 0) return null;
      const s2 = new Uint8Array(r2);
      return s2.set(this.module.HEAPU8.subarray(i2, i2 + r2)), s2;
    } finally {
      this.module._free(i2);
    }
  }
  getAttachedPicData(e2) {
    if (!this.contextPtr) return null;
    let t2 = 1048576;
    for (; t2 <= 16777216; ) {
      const i2 = this.module._malloc(t2);
      try {
        const r2 = this.module._movi_get_attached_pic_data(this.contextPtr, e2, i2, t2);
        if (0 === r2) return null;
        if (r2 < 0) {
          t2 *= 2;
          continue;
        }
        const s2 = new Uint8Array(r2);
        return s2.set(this.module.HEAPU8.subarray(i2, i2 + r2)), s2;
      } finally {
        this.module._free(i2);
      }
    }
    return null;
  }
  getChapterCount() {
    return this.contextPtr ? this.module._movi_get_chapter_count(this.contextPtr) : 0;
  }
  getAttachments(e2 = 33554432) {
    if (!this.contextPtr) return [];
    const t2 = this.module._movi_get_attachment_count, i2 = this.module._movi_get_attachment_stream_index, r2 = this.module._movi_get_attachment_size, s2 = this.module._movi_get_attachment_name, a2 = this.module._movi_get_attachment_mime_type, n2 = this.module._movi_get_attachment_data;
    if (!(t2 && i2 && r2 && s2 && a2 && n2)) return [];
    const o2 = t2(this.contextPtr), h2 = [], d2 = this.module._malloc(512), c2 = this.module._malloc(128);
    try {
      for (let t3 = 0; t3 < o2; t3++) {
        const o3 = r2(this.contextPtr, t3);
        if (o3 <= 0 || o3 > e2) continue;
        const u2 = this.module._malloc(o3);
        if (u2) try {
          this.module.HEAPU8.fill(0, d2, d2 + 512), this.module.HEAPU8.fill(0, c2, c2 + 128), s2(this.contextPtr, t3, d2, 512), a2(this.contextPtr, t3, c2, 128);
          const e3 = n2(this.contextPtr, t3, u2, o3);
          if (e3 <= 0) continue;
          const r3 = new Uint8Array(e3);
          r3.set(this.module.HEAPU8.subarray(u2, u2 + e3)), h2.push({ streamIndex: i2(this.contextPtr, t3), name: G(this.module, d2, 512), mimeType: G(this.module, c2, 128), data: r3 });
        } finally {
          this.module._free(u2);
        }
      }
    } finally {
      this.module._free(d2), this.module._free(c2);
    }
    return h2;
  }
  getChapters() {
    if (!this.contextPtr) return [];
    const e2 = this.getChapterCount();
    if (e2 <= 0) return [];
    const t2 = [], i2 = this.module._malloc(256), r2 = this.module._malloc(64), s2 = this.module._malloc(32);
    try {
      for (let a2 = 0; a2 < e2; a2++) {
        const e3 = this.module._movi_get_chapter_start(this.contextPtr, a2), n2 = this.module._movi_get_chapter_end(this.contextPtr, a2);
        this.module.HEAPU8.fill(0, i2, i2 + 256), this.module._movi_get_chapter_title(this.contextPtr, a2, i2, 256);
        const o2 = G(this.module, i2, 256);
        this.module.HEAPU8.fill(0, r2, r2 + 64), this.module._movi_get_chapter_id?.(this.contextPtr, a2, r2, 64), this.module.HEAPU8.fill(0, s2, s2 + 32), this.module._movi_get_chapter_language?.(this.contextPtr, a2, s2, 32);
        const h2 = G(this.module, s2, 32) || void 0, d2 = o2 || `Chapter ${a2 + 1}`;
        t2.push({ id: G(this.module, r2, 64) || `chapter-${a2}`, title: d2, start: e3 >= 0 ? e3 : 0, end: n2 >= 0 ? n2 : 0, language: h2, labels: [{ text: d2, language: h2 }], isHidden: 1 === this.module._movi_get_chapter_hidden?.(this.contextPtr, a2) });
      }
    } finally {
      this.module._free(i2), this.module._free(r2), this.module._free(s2);
    }
    return t2;
  }
  async seek(e2, t2 = -1, i2 = 1) {
    if (!this.contextPtr) throw new Error("Context not created");
    const r2 = await this.module.ccall("movi_seek_to", "number", ["number", "number", "number", "number"], [this.contextPtr, e2, t2, i2], { async: true });
    if (r2 < 0) throw new Error(`Seek failed: error ${r2}`);
    d.debug(N, `Seeked to ${e2}s`);
  }
  async readFrame() {
    if (!this.contextPtr) return null;
    const e2 = this.module._malloc(48);
    try {
      let t2 = await this.module.ccall("movi_read_frame", "number", ["number", "number", "number", "number"], [this.contextPtr, e2, this.packetBuffer, this.packetBufferSize], { async: true });
      if (t2 < 0 && -1 !== t2) throw d.error(N, `Read frame failed: error ${t2}. This might be due to a packet larger than ${this.packetBufferSize} bytes.`), new Error(`Read frame failed: error ${t2}`);
      if (0 === t2) return null;
      const i2 = function(e3, t3) {
        const i3 = new DataView(e3.HEAPU8.buffer, t3, 48);
        return { streamIndex: i3.getInt32(0, true), keyframe: 0 !== i3.getInt32(4, true), pts: i3.getFloat64(8, true), dts: i3.getFloat64(16, true), duration: i3.getFloat64(24, true), size: i3.getInt32(32, true), isIdr: 0 !== i3.getInt32(36, true), isRasl: 0 !== i3.getInt32(40, true), disposable: 0 !== i3.getInt32(44, true) };
      }(this.module, e2);
      if (i2.size < 0 || i2.size > this.packetBufferSize) return d.warn(N, `Invalid packet size: ${i2.size} (buffer size: ${this.packetBufferSize}), treating as EOF`), null;
      const r2 = new Uint8Array(i2.size);
      return r2.set(this.module.HEAPU8.subarray(this.packetBuffer, this.packetBuffer + i2.size)), { info: i2, data: r2 };
    } finally {
      this.module._free(e2);
    }
  }
  setLogLevel(e2) {
    this.module._movi_set_log_level(e2);
  }
  setLogLevelFromMovi(e2) {
    const t2 = H(e2);
    this.setLogLevel(t2);
  }
  enableDecoder(e2, t2) {
    if (!this.contextPtr) return -1;
    if (!t2 || 0 === t2.length) return this.module._movi_enable_decoder(this.contextPtr, e2, 0, 0);
    const i2 = this.module._malloc(t2.length);
    if (!i2) return -1;
    try {
      return this.module.HEAPU8.set(t2, i2), this.module._movi_enable_decoder(this.contextPtr, e2, i2, t2.length);
    } finally {
      this.module._free(i2);
    }
  }
  setStreamDiscard(e2, t2) {
    if (!this.contextPtr) return;
    const i2 = this.module._movi_set_stream_discard;
    "function" == typeof i2 && i2(this.contextPtr, e2, t2 ? 1 : 0);
  }
  sendPacket(e2, t2, i2, r2, s2) {
    if (!this.contextPtr) return -1;
    const a2 = this.module._malloc(t2.byteLength);
    if (!a2) return -6;
    this.module.HEAPU8.set(t2, a2);
    try {
      return this.module._movi_send_packet(this.contextPtr, e2, a2, t2.byteLength, i2, r2, s2 ? 1 : 0);
    } finally {
      this.module._free(a2);
    }
  }
  receiveFrame(e2) {
    return this.contextPtr ? this.module._movi_receive_frame(this.contextPtr, e2) : -1;
  }
  supportsAudioBatch() {
    return "function" == typeof this.module._movi_decode_audio_batch;
  }
  decodeAudioBatch(e2, t2) {
    if (!this.contextPtr || 0 === t2.length) return -1;
    const i2 = this.module._movi_decode_audio_batch;
    if (!i2) return -1;
    let r2 = 0;
    for (const e3 of t2) r2 += e3.data.byteLength;
    const s2 = this.module._malloc(r2), a2 = this.module._malloc(4 * t2.length), n2 = this.module._malloc(8 * t2.length);
    if (!s2 || !a2 || !n2) return s2 && this.module._free(s2), a2 && this.module._free(a2), n2 && this.module._free(n2), -6;
    try {
      let r3 = 0;
      const o2 = new Int32Array(this.module.HEAPU8.buffer, a2, t2.length), h2 = new Float64Array(this.module.HEAPU8.buffer, n2, t2.length);
      for (let e3 = 0; e3 < t2.length; e3++) {
        const i3 = t2[e3];
        this.module.HEAPU8.set(i3.data, s2 + r3), r3 += i3.data.byteLength, o2[e3] = i3.data.byteLength, h2[e3] = i3.pts;
      }
      return i2(this.contextPtr, e2, s2, a2, n2, t2.length);
    } finally {
      this.module._free(s2), this.module._free(a2), this.module._free(n2);
    }
  }
  audioBatchSamples() {
    return this.contextPtr ? this.module._movi_audio_batch_samples?.(this.contextPtr) ?? 0 : 0;
  }
  audioBatchChannels() {
    return this.contextPtr ? this.module._movi_audio_batch_channels?.(this.contextPtr) ?? 0 : 0;
  }
  audioBatchSampleRate() {
    return this.contextPtr ? this.module._movi_audio_batch_sample_rate?.(this.contextPtr) ?? 0 : 0;
  }
  audioBatchPts() {
    return this.contextPtr ? this.module._movi_audio_batch_pts?.(this.contextPtr) ?? 0 : 0;
  }
  audioBatchPlanePointer(e2) {
    return this.contextPtr ? this.module._movi_audio_batch_plane?.(this.contextPtr, e2) ?? 0 : 0;
  }
  async decodeSubtitle(e2, t2, i2, r2) {
    if (!this.contextPtr) throw new Error("Context not created");
    const s2 = this.module._malloc(t2.length);
    if (!s2) return d.error(N, "Failed to allocate memory for subtitle packet"), -1;
    try {
      this.module.HEAPU8.set(t2, s2);
      const a2 = r2 ?? 0;
      return await this.module.ccall("movi_decode_subtitle", "number", ["number", "number", "number", "number", "number", "number"], [this.contextPtr, e2, s2, t2.length, i2, a2], { async: true });
    } finally {
      this.module._free(s2);
    }
  }
  async getSubtitleText() {
    if (!this.contextPtr) return d.debug(N, "getSubtitleText: context not created"), null;
    const e2 = this.module._malloc(4096);
    if (!e2) return d.error(N, "getSubtitleText: failed to allocate buffer"), null;
    try {
      d.debug(N, "getSubtitleText: calling movi_get_subtitle_text");
      const t2 = this.module.ccall("movi_get_subtitle_text", "number", ["number", "number", "number"], [this.contextPtr, e2, 4096], { async: false });
      if (d.debug(N, `getSubtitleText: C function returned ${t2}`), t2 < 0) return d.warn(N, `getSubtitleText: C function returned error ${t2}`), null;
      if (0 === t2) return d.debug(N, "getSubtitleText: No text extracted (result=0) - might be empty subtitle or no rectangles"), null;
      const i2 = this.module.HEAPU8.subarray(e2, e2 + t2), r2 = new TextDecoder().decode(i2.slice()), s2 = r2?.trim();
      return s2 && 0 !== s2.length ? (d.debug(N, `getSubtitleText: Extracted text length=${t2}, trimmed length=${s2.length}, text="${s2.substring(0, 50)}..."`), s2) : (d.debug(N, `getSubtitleText: Extracted text is empty after trimming (raw length=${t2})`), null);
    } finally {
      this.module._free(e2);
    }
  }
  async getSubtitleTimes() {
    if (!this.contextPtr) return null;
    const e2 = this.module._malloc(16);
    if (!e2) return null;
    try {
      if (this.module.ccall("movi_get_subtitle_times", "number", ["number", "number", "number"], [this.contextPtr, e2, e2 + 8], { async: false }) < 0) return null;
      const t2 = new DataView(this.module.HEAPU8.buffer, e2, 16);
      return { start: t2.getFloat64(0, true), end: t2.getFloat64(8, true) };
    } finally {
      this.module._free(e2);
    }
  }
  async prefetchSubtitleCues(e2) {
    if (!this.contextPtr) return null;
    const t2 = await this.module.ccall("movi_prefetch_subtitle_cues", "number", ["number", "number"], [this.contextPtr, e2], { async: true });
    if (t2 < 0) return d.warn(N, `prefetchSubtitleCues: failed (${t2})`), null;
    const i2 = [];
    if (0 === t2) return i2;
    const r2 = this.module._malloc(8), s2 = this.module._malloc(8), a2 = this.module._malloc(8192);
    if (!r2 || !s2 || !a2) return r2 && this.module._free(r2), s2 && this.module._free(s2), a2 && this.module._free(a2), null;
    try {
      for (let e3 = 0; e3 < t2; e3++) {
        const t3 = this.module.ccall("movi_get_prefetched_cue", "number", ["number", "number", "number", "number", "number", "number"], [this.contextPtr, e3, r2, s2, a2, 8192], { async: false });
        if (t3 < 0) continue;
        const n2 = new DataView(this.module.HEAPU8.buffer, r2, 8).getFloat64(0, true), o2 = new DataView(this.module.HEAPU8.buffer, s2, 8).getFloat64(0, true), h2 = this.module.HEAPU8.subarray(a2, a2 + t3), d2 = new TextDecoder().decode(h2.slice()).trim();
        d2 && i2.push({ start: n2, end: o2, text: d2 });
      }
    } finally {
      this.module._free(r2), this.module._free(s2), this.module._free(a2), this.module.ccall("movi_clear_prefetched_cues", "void", ["number"], [this.contextPtr], { async: false });
    }
    return i2;
  }
  async getSubtitleImageInfo() {
    if (!this.contextPtr) return null;
    const e2 = this.module._malloc(16);
    if (!e2) return null;
    try {
      if (this.module.ccall("movi_get_subtitle_image_info", "number", ["number", "number", "number", "number", "number"], [this.contextPtr, e2, e2 + 4, e2 + 8, e2 + 12], { async: false }) < 0) return null;
      const t2 = new DataView(this.module.HEAPU8.buffer, e2, 16);
      return { width: t2.getInt32(0, true), height: t2.getInt32(4, true), x: t2.getInt32(8, true), y: t2.getInt32(12, true) };
    } finally {
      this.module._free(e2);
    }
  }
  async getSubtitleImageData() {
    if (!this.contextPtr) return null;
    const e2 = await this.getSubtitleImageInfo();
    if (!e2) return null;
    const t2 = e2.width * e2.height * 4, i2 = this.module._malloc(t2);
    if (!i2) return null;
    try {
      if (this.module.ccall("movi_get_subtitle_image_data", "number", ["number", "number", "number"], [this.contextPtr, i2, t2], { async: false }) < 0) return null;
      const e3 = new Uint8Array(t2);
      return e3.set(this.module.HEAPU8.subarray(i2, i2 + t2)), e3;
    } finally {
      this.module._free(i2);
    }
  }
  async freeSubtitle() {
    this.contextPtr && this.module.ccall("movi_free_subtitle", "void", ["number"], [this.contextPtr], { async: false });
  }
  getFrameWidth() {
    return this.module._movi_get_frame_width(this.contextPtr);
  }
  getFrameHeight() {
    return this.module._movi_get_frame_height(this.contextPtr);
  }
  getFrameFormat() {
    return this.module._movi_get_frame_format(this.contextPtr);
  }
  getFrameLinesize(e2) {
    return this.module._movi_get_frame_linesize(this.contextPtr, e2);
  }
  getFrameSamples() {
    return this.module._movi_get_frame_samples(this.contextPtr);
  }
  getFrameChannels() {
    return this.module._movi_get_frame_channels(this.contextPtr);
  }
  getFrameSampleRate() {
    return this.module._movi_get_frame_sample_rate(this.contextPtr);
  }
  getFrameDataPointer(e2) {
    return this.module._movi_get_frame_data(this.contextPtr, e2);
  }
  enableAudioDownmix(e2) {
    this.contextPtr && this.module._movi_enable_audio_downmix(this.contextPtr, e2 ? 1 : 0);
  }
  getContextPtr() {
    return this.contextPtr;
  }
  getFramePts(e2) {
    return this.contextPtr ? this.module._movi_get_frame_pts(this.contextPtr, e2) : -1;
  }
  flushDecoder(e2) {
    this.contextPtr && this.module._movi_flush_decoder(this.contextPtr, e2);
  }
  getFrameRGBA(e2 = 0, t2 = 0) {
    if (!this.contextPtr) return null;
    const i2 = this.module._movi_get_frame_rgba(this.contextPtr, e2, t2);
    if (!i2) return null;
    const r2 = this.module._movi_get_frame_rgba_size(this.contextPtr);
    return r2 <= 0 ? null : this.module.HEAPU8.subarray(i2, i2 + r2);
  }
  setSkipFrame(e2, t2) {
    this.contextPtr && this.module._movi_set_skip_frame(this.contextPtr, e2, t2);
  }
}
let X = a.SILENT;
function j(e2) {
  X = e2;
  const t2 = H(e2);
  for (const e3 of W) e3.setLogLevel(t2);
}
class ThumbnailBindings {
  module;
  contextPtr = 0;
  dataSource = null;
  isOpened = false;
  lastPacketPts = 0;
  constructor(e2) {
    this.module = e2, this.module._movi_set_log_level(-8), this.setupAsyncHandlers();
  }
  setLogLevel(e2) {
    this.module._movi_set_log_level(e2);
  }
  setLogLevelFromMovi(e2) {
    const t2 = H(e2);
    this.setLogLevel(t2);
  }
  setupAsyncHandlers() {
    const e2 = this;
    this.module.onReadRequest = function(t2, i2) {
      if (e2.dataSource) {
        const r2 = "bigint" == typeof t2 ? Number(t2) : t2;
        e2.dataSource.read(r2, i2).then((t3) => {
          const i3 = t3 instanceof Uint8Array ? t3 : new Uint8Array(t3);
          e2.fulfillRead(i3, i3.byteLength);
        }).catch((t3) => {
          globalThis.__movilog?.warn(`[ThumbnailBindings] read(${r2}, ${i2}) failed:`, t3), e2.fulfillRead(new Uint8Array(0), -1);
        });
      }
    }, this.module.onSeekRequest = function(t2) {
      const i2 = "bigint" == typeof t2 ? Number(t2) : t2, r2 = "bigint" == typeof t2 ? t2 : BigInt(Math.floor(i2));
      e2.fulfillSeek(r2);
    };
  }
  fulfillRead(e2, t2) {
    const i2 = this.module._pendingRead;
    i2 && (t2 > 0 && e2.byteLength > 0 && this.module.HEAPU8.set(e2.subarray(0, t2), i2.buffer), i2.resolve(t2), this.module._pendingRead = null);
  }
  fulfillSeek(e2) {
    const t2 = this.module._pendingSeek;
    t2 && (t2.resolve(e2), this.module._pendingSeek = null);
  }
  setDataSource(e2) {
    this.dataSource = e2;
  }
  async create(e2) {
    const t2 = 4294967295 & e2, i2 = e2 / 4294967296 >>> 0;
    return this.contextPtr = this.module._movi_thumbnail_create(t2, i2), 0 !== this.contextPtr;
  }
  async open() {
    if (!this.contextPtr) return false;
    const e2 = await this.module.ccall("movi_thumbnail_open", "number", ["number"], [this.contextPtr], { async: true });
    return this.isOpened = 0 === e2, this.isOpened;
  }
  async readKeyframe(e2) {
    if (!this.contextPtr || !this.isOpened) return -1;
    d.debug(N, `JS calling _movi_thumbnail_read_keyframe(${this.contextPtr}, ${e2.toFixed(2)})`);
    let t2 = -1, i2 = -1;
    this.module._pendingThumbnail = { resolve: (e3) => {
      d.debug(N, `JS callback received: size=${e3.size}, pts=${e3.pts}`), t2 = e3.size, i2 = e3.pts;
    } };
    try {
      return await this.module.ccall("movi_thumbnail_read_keyframe", "void", ["number", "number"], [this.contextPtr, e2], { async: true }), t2 > 0 && (this.lastPacketPts = i2), t2;
    } catch (e3) {
      return d.error(N, "readKeyframe error", e3), -1;
    } finally {
      this.module._pendingThumbnail = null;
    }
  }
  getPacketData() {
    return this.module._movi_thumbnail_get_packet_data(this.contextPtr);
  }
  getPacketDataCopy(e2) {
    const t2 = this.getPacketData();
    return !t2 || e2 <= 0 ? null : new Uint8Array(this.module.HEAPU8.subarray(t2, t2 + e2).slice());
  }
  getPacketPts() {
    return this.lastPacketPts;
  }
  getStreamInfo() {
    if (!this.contextPtr) return null;
    const e2 = this.module._malloc(z);
    this.module.HEAPU8.fill(0, e2, e2 + z);
    try {
      return 0 !== this.module._movi_thumbnail_get_stream_info(this.contextPtr, e2) ? null : K(this.module, e2);
    } finally {
      this.module._free(e2);
    }
  }
  getExtradata() {
    if (!this.contextPtr) return null;
    const e2 = this.getStreamInfo();
    if (!e2 || 0 === e2.extradataSize) return null;
    const t2 = this.module._malloc(e2.extradataSize);
    try {
      const i2 = this.module._movi_thumbnail_get_extradata(this.contextPtr, t2, e2.extradataSize);
      if (i2 <= 0) return null;
      const r2 = new Uint8Array(i2);
      return r2.set(this.module.HEAPU8.subarray(t2, t2 + i2)), r2;
    } finally {
      this.module._free(t2);
    }
  }
  decodeCurrentPacketYUV() {
    if (!this.contextPtr) return null;
    if (this.module._movi_thumbnail_decode_frame_yuv(this.contextPtr) < 0) return null;
    const e2 = this.module._movi_thumbnail_get_frame_width(this.contextPtr), t2 = this.module._movi_thumbnail_get_frame_height(this.contextPtr), i2 = this.module._movi_thumbnail_get_plane_data(this.contextPtr, 0), r2 = this.module._movi_thumbnail_get_plane_data(this.contextPtr, 1), s2 = this.module._movi_thumbnail_get_plane_data(this.contextPtr, 2), a2 = this.module._movi_thumbnail_get_plane_linesize(this.contextPtr, 0), n2 = this.module._movi_thumbnail_get_plane_linesize(this.contextPtr, 1), o2 = this.module._movi_thumbnail_get_plane_linesize(this.contextPtr, 2);
    if (!i2 || !r2 || !s2) return null;
    const h2 = a2 * t2, d2 = Math.ceil(t2 / 2), c2 = n2 * d2, u2 = o2 * d2;
    return { width: e2, height: t2, yPlane: new Uint8Array(this.module.HEAPU8.subarray(i2, i2 + h2).slice()), uPlane: new Uint8Array(this.module.HEAPU8.subarray(r2, r2 + c2).slice()), vPlane: new Uint8Array(this.module.HEAPU8.subarray(s2, s2 + u2).slice()), yStride: a2, uStride: n2, vStride: o2 };
  }
  decodeCurrentPacket(e2, t2) {
    if (!this.contextPtr) return null;
    const i2 = this.module._movi_thumbnail_decode_frame(this.contextPtr, e2, t2);
    if (!i2) return null;
    const r2 = e2 * t2 * 4;
    return new Uint8Array(this.module.HEAPU8.subarray(i2, i2 + r2).slice());
  }
  clearBuffer() {
    this.contextPtr && this.module._movi_thumbnail_clear_buffer(this.contextPtr);
  }
  destroy() {
    this.contextPtr && (this.module._movi_thumbnail_destroy(this.contextPtr), this.contextPtr = 0, this.isOpened = false, d.debug(N, "Thumbnail context destroyed"));
  }
}
const q = "CodecParser";
class BitReader {
  data;
  byteOffset = 0;
  bitOffset = 0;
  constructor(e2) {
    this.data = e2;
  }
  readBits(e2) {
    let t2 = 0;
    for (let i2 = 0; i2 < e2; i2++) t2 = 2 * t2 + this.readBit();
    return t2;
  }
  readBit() {
    if (this.byteOffset >= this.data.length) return 0;
    const e2 = this.data[this.byteOffset] >> 7 - this.bitOffset & 1;
    return this.bitOffset++, 8 === this.bitOffset && (this.bitOffset = 0, this.byteOffset++), e2;
  }
  skipBits(e2) {
    const t2 = 8 * this.byteOffset + this.bitOffset + e2;
    this.byteOffset = Math.floor(t2 / 8), this.bitOffset = t2 % 8;
  }
}
class CodecParser {
  static getCodecString(e2, t2, i2, r2) {
    if (d.debug(q, `Extradata: ${t2?.length}`), !t2 || 0 === t2.length) return null;
    const s2 = e2.toLowerCase();
    return "hevc" === s2 || "h265" === s2 || "hvc1" === s2 || "hev1" === s2 ? this.getHevcCodecString(t2, i2, r2) : "av1" === s2 || "av01" === s2 ? this.getAv1CodecString(t2) : "vp9" === s2 || "vp09" === s2 ? this.getVp9CodecString(t2) : "h264" === s2 || "avc1" === s2 ? this.getAvcCodecString(t2) : "vp8" === s2 ? this.getVp8CodecString(t2) : "vvc" === s2 || "vvc1" === s2 || "vvi1" === s2 ? this.getVvcCodecString(t2) : null;
  }
  static getColorSpaceInfo(e2, t2, i2, r2) {
    if (!t2 || 0 === t2.length) return i2 && r2 && i2 >= 3840 && r2 >= 2160 ? (d.info(q, `4K UHD content detected (${i2}x${r2}), assuming HDR with BT.2020/PQ`), { colorPrimaries: "bt2020", colorTransfer: "smpte2084", colorSpace: "bt2020-ncl" }) : null;
    const s2 = e2.toLowerCase();
    return "hevc" === s2 || "h265" === s2 || "hvc1" === s2 || "hev1" === s2 ? this.getHevcColorSpaceInfo(t2, i2, r2) : "vp9" === s2 || "vp09" === s2 ? this.getVp9ColorSpaceInfo(t2) : null;
  }
  static getHevcCodecString(e2, t2, i2) {
    if (e2.length < 23) return d.warn(q, `HEVC extradata too small: ${e2.length} (needed 23)`), null;
    if (d.debug(q, `HEVC Extradata: ${Array.from(e2.slice(0, 24)).map((e3) => e3.toString(16).padStart(2, "0")).join(" ")}`), 0 === e2[0] && 0 === e2[1] && 1 === e2[2] || 0 === e2[0] && 0 === e2[1] && 0 === e2[2] && 1 === e2[3]) return t2 && i2 && t2 >= 3840 && i2 >= 2160 ? (d.info(q, "HEVC Annex B detected for 4K content. Using heuristic HDR codec string."), "hvc1.2.4.L153.B0") : (d.warn(q, "HEVC extradata appears to be Annex B (NAL units), not hvcC. Skipping parser."), null);
    const r2 = new BitReader(e2);
    r2.skipBits(8);
    const s2 = r2.readBits(2), a2 = r2.readBits(1), n2 = r2.readBits(5), o2 = r2.readBits(32), h2 = [];
    for (let e3 = 0; e3 < 6; e3++) h2.push(r2.readBits(8));
    const c2 = r2.readBits(8);
    let u2 = "";
    switch (s2) {
      case 1:
        u2 = "A";
        break;
      case 2:
        u2 = "B";
        break;
      case 3:
        u2 = "C";
    }
    let l2 = 0, f2 = o2;
    for (let e3 = 0; e3 < 32; e3++) l2 = 2 * l2 + (1 & f2), f2 = Math.floor(f2 / 2);
    let m2 = `hvc1.${u2}${n2}.${(l2 >>> 0).toString(16)}.${0 === a2 ? "L" : "H"}${c2}`, g2 = false;
    for (let e3 = 5; e3 >= 0; e3--) {
      const t3 = h2[e3];
      (0 !== t3 || g2) && (m2 += "." + t3.toString(16), g2 = true);
    }
    return d.debug(q, `HEVC codec string: ${m2}`), m2;
  }
  static getAvcCodecString(e2) {
    if (e2.length < 4) return "avc1.420028";
    const t2 = e2[1], i2 = e2[2], r2 = e2[3], s2 = (e3) => e3.toString(16).padStart(2, "0");
    return `avc1.${s2(t2)}${s2(i2)}${s2(r2)}`;
  }
  static getAv1CodecString(e2) {
    if (e2.length < 4) return null;
    const t2 = new BitReader(e2);
    t2.skipBits(8);
    const i2 = t2.readBits(3), r2 = t2.readBits(5), s2 = t2.readBits(1), a2 = 2 * t2.readBits(1) + 8 + 2 * t2.readBits(1), n2 = s2 ? "H" : "M";
    return `av01.${i2}.${r2.toString().padStart(2, "0")}${n2}.${a2.toString().padStart(2, "0")}`;
  }
  static getVp8CodecString(e2) {
    return "vp8";
  }
  static getVp9CodecString(e2) {
    if (e2.length < 12) return d.warn(q, "VP9 extradata too small"), null;
    const t2 = new BitReader(e2);
    t2.skipBits(8), t2.skipBits(24);
    const i2 = t2.readBits(8), r2 = t2.readBits(8), s2 = t2.readBits(4), a2 = t2.readBits(3), n2 = t2.readBits(1), o2 = t2.readBits(8), h2 = t2.readBits(8), c2 = t2.readBits(8), u2 = (e3) => e3.toString().padStart(2, "0");
    return `vp09.${u2(i2)}.${u2(r2)}.${u2(s2)}.${u2(a2)}.${u2(o2)}.${u2(h2)}.${u2(c2)}.${u2(n2)}`;
  }
  static getVvcCodecString(e2) {
    if (e2.length < 10) return d.warn(q, `VVC extradata too small: ${e2.length}`), null;
    const t2 = new BitReader(e2);
    t2.skipBits(8), t2.skipBits(16);
    const i2 = t2.readBits(1);
    return t2.skipBits(7), i2 ? (t2.skipBits(9), t2.skipBits(3), t2.skipBits(2), t2.skipBits(2), t2.skipBits(3), t2.skipBits(5), t2.skipBits(2), t2.skipBits(6), `vvc1.${t2.readBits(7)}.${t2.readBits(1) ? "H" : "L"}${t2.readBits(8)}`) : "vvc1.1.L51";
  }
  static getColorPrimariesName(e2) {
    return { 1: "bt709", 5: "bt470m", 6: "bt470bg", 7: "smpte170m", 8: "smpte240m", 9: "film", 10: "bt2020", 11: "smpte428", 12: "smpte431", 22: "p3" }[e2] || `unknown(${e2})`;
  }
  static getTransferCharacteristicsName(e2) {
    return { 1: "bt709", 4: "gamma22", 5: "gamma28", 6: "smpte170m", 7: "smpte240m", 8: "linear", 10: "log100", 11: "log316", 13: "iec61966-2-4", 14: "bt1361", 15: "iec61966-2-1", 16: "bt2020-10", 17: "bt2020-12", 18: "pq", 19: "smpte428", 20: "hlg" }[e2] || `unknown(${e2})`;
  }
  static getHevcColorSpaceInfo(e2, t2, i2) {
    const r2 = e2.length > 3 && 0 === e2[0] && 0 === e2[1] && 1 === e2[2] || e2.length > 4 && 0 === e2[0] && 0 === e2[1] && 0 === e2[2] && 1 === e2[3];
    if (t2 && i2 && t2 >= 3840 && i2 >= 2160 && r2) return d.info(q, "4K HEVC (Annex B) detected, assuming HDR with BT.2020/PQ"), { colorPrimaries: "bt2020", colorTransfer: "smpte2084", colorSpace: "bt2020-ncl" };
    if (e2.length < 23) return t2 && i2 && t2 >= 3840 && i2 >= 2160 ? (d.info(q, "4K HEVC detected, assuming HDR with BT.2020/PQ"), { colorPrimaries: "bt2020", colorTransfer: "smpte2084", colorSpace: "bt2020-ncl" }) : null;
    if (t2 && i2 && t2 >= 3840 && i2 >= 2160) {
      const t3 = new BitReader(e2);
      t3.skipBits(8), t3.skipBits(2), t3.skipBits(1);
      const i3 = t3.readBits(5);
      if (2 === i3 || 4 === i3) return d.info(q, "HEVC Main10/Rext profile detected for 4K, assuming HDR10 (BT.2020/PQ)"), { colorPrimaries: "bt2020", colorTransfer: "smpte2084", colorSpace: "bt2020-ncl" };
    }
    return null;
  }
  static getVp9ColorSpaceInfo(e2) {
    if (e2.length < 12) return null;
    const t2 = new BitReader(e2);
    t2.skipBits(8), t2.skipBits(24), t2.skipBits(8), t2.skipBits(8), t2.skipBits(4), t2.skipBits(3), t2.skipBits(1);
    const i2 = t2.readBits(8), r2 = t2.readBits(8), s2 = t2.readBits(8);
    return { colorPrimaries: this.getColorPrimariesName(i2), colorTransfer: this.getTransferCharacteristicsName(r2), colorSpace: 10 === s2 ? "bt2020-ncl" : "bt709" };
  }
}
const Q = "Demuxer";
class SourceDataAdapter {
  source;
  fileSize = 0;
  constructor(e2) {
    this.source = e2;
  }
  async getSize() {
    return 0 === this.fileSize && (this.fileSize = await this.source.getSize()), this.fileSize;
  }
  async read(e2, t2) {
    const i2 = await this.source.read(e2, t2);
    return new Uint8Array(i2);
  }
}
class Demuxer {
  source;
  module = null;
  bindings = null;
  tracks = [];
  duration = 0;
  isOpened = false;
  wasmBinary;
  useNewWasmInstance = false;
  assetBaseUrl;
  constructor(e2, wasmBinary, t2 = false, i2) {
    this.source = e2, this.wasmBinary = wasmBinary, this.useNewWasmInstance = t2, this.assetBaseUrl = i2;
  }
  async open() {
    if (d.info(Q, "Opening media..."), this.useNewWasmInstance ? (d.debug(Q, "Using isolated WASM instance"), this.module = await V({ wasmBinary: this.wasmBinary, assetBaseUrl: this.assetBaseUrl })) : this.module = await U({ wasmBinary: this.wasmBinary, assetBaseUrl: this.assetBaseUrl }), this.bindings = new WasmBindings(this.module), !this.bindings.create()) throw new Error("Failed to create demuxer context");
    const e2 = new SourceDataAdapter(this.source);
    this.bindings.setDataSource(e2);
    const t2 = await this.bindings.open();
    d.info(Q, `Opened with ${t2} streams`), this.isOpened = true, this.duration = this.bindings.getDuration();
    const i2 = this.bindings.getStartTime();
    this.tracks = this.enumerateTracks(), d.info(Q, `Media info: duration=${this.duration}s, start=${i2}s, tracks=${this.tracks.length}`);
    const r2 = this.bindings.getMetadataTitle(), s2 = {};
    r2 && (s2.title = r2);
    const a2 = this.bindings.getChapters();
    return a2.length > 0 && d.info(Q, `Found ${a2.length} chapters`), { formatName: this.bindings.getFormatName(), duration: this.duration, bitRate: 0, startTime: i2, tracks: this.tracks, chapters: a2, metadata: s2 };
  }
  enumerateTracks() {
    if (!this.bindings) return [];
    const e2 = [], t2 = this.bindings.getStreamCount();
    for (let i2 = 0; i2 < t2; i2++) {
      const t3 = this.bindings.getStreamInfo(i2);
      if (!t3) continue;
      const r2 = this.convertStreamInfo(t3);
      r2 && e2.push(r2);
    }
    return e2;
  }
  convertStreamInfo(e2) {
    let t2 = null, i2 = null;
    switch (this.bindings && e2.extradataSize > 0 && (i2 = this.bindings.getExtradata(e2.index)), e2.type) {
      case 0:
        t2 = { id: e2.index, type: "video", codec: e2.codecName, width: e2.width, height: e2.height, frameRate: e2.frameRate, bitRate: e2.bitRate, profile: e2.profile, level: e2.level, language: e2.language ? e2.language : void 0, label: e2.label ? e2.label : void 0, rotation: e2.rotation, pixelFormat: e2.pixelFormat, colorRange: e2.colorRange, projection: e2.projection || void 0, isAttachedPic: e2.isAttachedPic || void 0 }, i2 && (t2.extradata = i2);
        const r2 = t2;
        e2.colorPrimaries && "unknown" !== e2.colorPrimaries && "reserved" !== e2.colorPrimaries && (r2.colorPrimaries = this.normalizeColorPrimaries(e2.colorPrimaries)), e2.colorTransfer && "unknown" !== e2.colorTransfer && "reserved" !== e2.colorTransfer && (r2.colorTransfer = this.normalizeColorTransfer(e2.colorTransfer)), e2.colorMatrix && "unknown" !== e2.colorMatrix && "reserved" !== e2.colorMatrix && (r2.colorSpace = this.normalizeColorMatrix(e2.colorMatrix));
        const s2 = (r2.colorPrimaries || "").toLowerCase(), a2 = (r2.colorTransfer || "").toLowerCase(), n2 = a2.includes("pq") || a2.includes("hlg") || a2.includes("smpte2084") || a2.includes("arib-std-b67"), o2 = s2.includes("bt2020") || s2.includes("rec2020");
        r2.isHDR = n2 || o2;
        const h2 = r2.width >= 3840 && r2.height >= 2160, c2 = r2.colorPrimaries || "", u2 = r2.colorTransfer || "";
        if (!r2.colorPrimaries || !r2.colorTransfer || h2 && ("bt709" === c2 || "bt709" === u2)) {
          const t3 = CodecParser.getColorSpaceInfo(e2.codecName, i2 ?? void 0, e2.width, e2.height);
          t3 && (t3.colorPrimaries && (r2.colorPrimaries = t3.colorPrimaries), t3.colorTransfer && (r2.colorTransfer = t3.colorTransfer), t3.colorSpace && (r2.colorSpace = t3.colorSpace), d.info(Q, `Overriding/Filling Color Metadata via Heuristic: ${r2.colorPrimaries}/${r2.colorTransfer}`));
        }
        r2.colorPrimaries && r2.colorTransfer || !r2.codec.toLowerCase().startsWith("hvc1") || 2 & e2.profile && (r2.colorPrimaries = "bt2020", r2.colorTransfer = "smpte2084", r2.colorSpace = "bt2020-ncl", d.info(Q, "Fallback: Assuming HDR10 for HEVC Main 10 profile without metadata")), d.info(Q, `Video Track Metadata: codec=${r2.codec}, primaries=${r2.colorPrimaries}, transfer=${r2.colorTransfer}, matrix=${r2.colorSpace}`);
        break;
      case 1:
        t2 = { id: e2.index, type: "audio", codec: e2.codecName, channels: e2.channels, sampleRate: e2.sampleRate, bitRate: e2.bitRate, language: e2.language ? e2.language : void 0, label: e2.label ? e2.label : void 0 };
        break;
      case 2:
        t2 = { id: e2.index, type: "subtitle", codec: e2.codecName, subtitleType: this.isImageSubtitle(e2.codecName) ? "image" : "text", language: e2.language ? e2.language : void 0, label: e2.label ? e2.label : void 0 };
    }
    return t2 && "video" !== t2.type && i2 && (t2.extradata = i2), t2;
  }
  isImageSubtitle(e2) {
    return ["hdmv_pgs_subtitle", "dvd_subtitle", "dvb_subtitle"].includes(e2.toLowerCase());
  }
  normalizeColorPrimaries(e2) {
    switch (e2.toLowerCase()) {
      case "bt2020":
        return "bt2020";
      case "bt709":
        return "bt709";
      case "bt470bg":
        return "bt470bg";
      case "smpte170m":
        return "smpte170m";
      default:
        return e2;
    }
  }
  normalizeColorTransfer(e2) {
    switch (e2.toLowerCase()) {
      case "smpte2084":
        return "smpte2084";
      case "arib-std-b67":
        return "arib-std-b67";
      case "bt709":
        return "bt709";
      case "smpte170m":
        return "smpte170m";
      case "linear":
        return "linear";
      case "iec61966-2-1":
        return "iec61966-2-1";
      default:
        return e2;
    }
  }
  normalizeColorMatrix(e2) {
    switch (e2.toLowerCase()) {
      case "bt2020nc":
        return "bt2020-ncl";
      case "bt2020c":
        return "bt2020-cl";
      case "smpte170m":
        return "smpte170m";
      case "bt709":
        return "bt709";
      case "bt470bg":
        return "bt470bg";
      default:
        return e2;
    }
  }
  getTracks() {
    return [...this.tracks];
  }
  getVideoTracks() {
    return this.tracks.filter((e2) => "video" === e2.type);
  }
  getAudioTracks() {
    return this.tracks.filter((e2) => "audio" === e2.type);
  }
  getSubtitleTracks() {
    return this.tracks.filter((e2) => "subtitle" === e2.type);
  }
  getExtradata(e2) {
    return this.bindings?.getExtradata(e2) ?? null;
  }
  async seek(e2, t2 = 1) {
    if (!this.bindings || !this.isOpened) throw new Error("Demuxer not opened");
    await this.bindings.seek(e2, -1, t2);
  }
  async readPacket() {
    if (!this.bindings || !this.isOpened) throw new Error("Demuxer not opened");
    const e2 = await this.bindings.readFrame();
    return e2 ? { streamIndex: e2.info.streamIndex, keyframe: e2.info.keyframe, timestamp: e2.info.pts, dts: e2.info.dts, duration: e2.info.duration, data: e2.data, isIdr: e2.info.isIdr, isRasl: e2.info.isRasl, disposable: e2.info.disposable } : null;
  }
  getDuration() {
    return this.duration;
  }
  getAttachments(e2) {
    return this.bindings?.getAttachments(e2) ?? [];
  }
  close() {
    this.bindings && (this.bindings.destroy(), this.bindings = null), this.isOpened = false, this.tracks = [], d.info(Q, "Demuxer closed");
  }
  static async extractAttachedPicture(e2, t2, wasmBinary, i2) {
    if (t2 <= 0) return null;
    let r2 = null;
    try {
      const s2 = await V({ wasmBinary, assetBaseUrl: i2 });
      if (r2 = new ThumbnailBindings(s2), r2.setDataSource({ read: async (t3, i3) => new Uint8Array(await e2.read(t3, i3)), getSize: async () => t2 }), !await r2.create(t2)) return null;
      if (!await r2.open()) return null;
      const a2 = await r2.readKeyframe(0);
      return a2 <= 0 ? null : r2.getPacketDataCopy(a2);
    } catch (e3) {
      return d.warn(Q, "Attached-picture extraction failed", e3), null;
    } finally {
      r2?.destroy();
    }
  }
  getBindings() {
    return this.bindings;
  }
  getModule() {
    return this.module;
  }
}
const Y = "TrackManager";
class TrackManager extends EventEmitter {
  tracks = [];
  activeVideoTrack = null;
  activeAudioTrack = null;
  activeSubtitleTrack = null;
  setTracks(e2) {
    this.tracks = [...e2];
    const t2 = this.getVideoTracks(), i2 = this.getAudioTracks();
    t2.length > 0 && !this.activeVideoTrack && (this.activeVideoTrack = t2[0]), i2.length > 0 && !this.activeAudioTrack && (this.activeAudioTrack = i2[0]), this.emit("tracksChange", this.tracks), d.info(Y, `Tracks set: ${e2.length} total`);
  }
  getTracks() {
    return [...this.tracks];
  }
  isLikelyCoverArt(e2) {
    const t2 = (e2.codec || "").toLowerCase();
    return !("mjpeg" !== t2 && "png" !== t2 && "jpeg" !== t2 || e2.frameRate && 0 !== e2.frameRate);
  }
  getVideoTracks() {
    return this.tracks.filter((e2) => "video" === e2.type && !this.isLikelyCoverArt(e2));
  }
  getAttachedPicTracks() {
    return this.tracks.filter((e2) => "video" === e2.type && this.isLikelyCoverArt(e2));
  }
  getAudioTracks() {
    return this.tracks.filter((e2) => "audio" === e2.type);
  }
  getSubtitleTracks() {
    return this.tracks.filter((e2) => "subtitle" === e2.type);
  }
  getActiveVideoTrack() {
    return this.activeVideoTrack;
  }
  getActiveAudioTrack() {
    return this.activeAudioTrack;
  }
  getActiveSubtitleTrack() {
    return this.activeSubtitleTrack;
  }
  selectVideoTrack(e2) {
    const t2 = this.getVideoTracks().find((t3) => t3.id === e2);
    return t2 ? (this.activeVideoTrack?.id === e2 || (this.activeVideoTrack = t2, this.emit("videoTrackChange", t2), d.info(Y, `Selected video track: ${e2}`)), true) : (d.warn(Y, `Video track ${e2} not found`), false);
  }
  selectAudioTrack(e2) {
    const t2 = this.getAudioTracks().find((t3) => t3.id === e2);
    return t2 ? (this.activeAudioTrack?.id === e2 || (this.activeAudioTrack = t2, this.emit("audioTrackChange", t2), d.info(Y, `Selected audio track: ${e2}`)), true) : (d.warn(Y, `Audio track ${e2} not found`), false);
  }
  selectSubtitleTrack(e2) {
    if (null === e2) return this.activeSubtitleTrack = null, this.emit("subtitleTrackChange", null), d.info(Y, "Subtitles disabled"), true;
    const t2 = this.getSubtitleTracks().find((t3) => t3.id === e2);
    return t2 ? (this.activeSubtitleTrack?.id === e2 || (this.activeSubtitleTrack = t2, this.emit("subtitleTrackChange", t2), d.info(Y, `Selected subtitle track: ${e2}`)), true) : (d.warn(Y, `Subtitle track ${e2} not found`), false);
  }
  isActiveStream(e2) {
    return this.activeVideoTrack?.id === e2 || this.activeAudioTrack?.id === e2 || this.activeSubtitleTrack?.id === e2;
  }
  getTrackById(e2) {
    return this.tracks.find((t2) => t2.id === e2);
  }
  clear() {
    this.tracks = [], this.activeVideoTrack = null, this.activeAudioTrack = null, this.activeSubtitleTrack = null;
  }
}
const J = 1e6, Z = { secondsToUs: (e2) => Math.floor(e2 * J), usToSeconds: (e2) => e2 / J, secondsToMs: (e2) => Math.floor(1e3 * e2), msToSeconds: (e2) => e2 / 1e3, formatTime(e2) {
  const t2 = Math.floor(e2 / 3600), i2 = Math.floor(e2 % 3600 / 60), r2 = Math.floor(e2 % 60), s2 = Math.floor(e2 % 1 * 1e3);
  return t2 > 0 ? `${t2}:${i2.toString().padStart(2, "0")}:${r2.toString().padStart(2, "0")}.${s2.toString().padStart(3, "0")}` : `${i2}:${r2.toString().padStart(2, "0")}.${s2.toString().padStart(3, "0")}`;
}, parseTime(e2) {
  const t2 = e2.split(":").reverse();
  let i2 = 0;
  if (t2[0]) {
    const [e3, r2] = t2[0].split(".");
    i2 += parseFloat(e3) + (r2 ? parseFloat(`0.${r2}`) : 0);
  }
  return t2[1] && (i2 += 60 * parseFloat(t2[1])), t2[2] && (i2 += 3600 * parseFloat(t2[2])), i2;
}, now: () => performance.now() / 1e3 }, ee = "Clock";
class Clock {
  baseTime = 0;
  pausedTime = 0;
  isRunning = false;
  playbackRate = 1;
  audioProvider = null;
  syncedToAudio = false;
  lastAudioTime = 0;
  duration = 0;
  setAudioProvider(e2) {
    this.audioProvider = e2, e2 ? d.debug(ee, "Audio provider set") : (d.debug(ee, "Audio provider disabled - using wall clock only"), this.syncedToAudio = false);
  }
  setDuration(e2) {
    this.duration = e2, d.debug(ee, `Duration set to ${e2}s`);
  }
  start() {
    this.isRunning || (this.baseTime = Z.now() - this.pausedTime / this.playbackRate, this.isRunning = true, this.syncedToAudio = false, d.debug(ee, `Started at ${this.pausedTime}s`));
  }
  pause() {
    this.isRunning && (this.pausedTime = this.getTime(), this.isRunning = false, d.debug(ee, `Paused at ${this.pausedTime}s`));
  }
  seek(e2) {
    this.isRunning ? this.baseTime = Z.now() - e2 / this.playbackRate : this.pausedTime = e2, this.syncedToAudio = false, d.debug(ee, `Seeked to ${e2}s`);
  }
  getTime() {
    if (!this.isRunning) return this.pausedTime;
    let e2 = (Z.now() - this.baseTime) * this.playbackRate;
    if (this.duration > 0 && (e2 = Math.min(e2, this.duration)), this.audioProvider) {
      const t2 = this.audioProvider.getAudioClock();
      if (t2 >= 0) {
        if (this.lastAudioTime = t2, this.audioProvider.hasHealthyBuffer()) {
          if (!this.syncedToAudio) return this.baseTime = Z.now() - t2 / this.playbackRate, this.syncedToAudio = true, d.debug(ee, `Synced to audio at ${t2}s`), t2;
          const i2 = e2 - t2;
          if (Math.abs(i2) > 0.1) {
            const e3 = 0.5 * i2;
            this.baseTime += e3 / this.playbackRate;
          }
          e2 = (Z.now() - this.baseTime) * this.playbackRate, this.duration > 0 && (e2 = Math.min(e2, this.duration));
        }
      } else this.lastAudioTime;
    }
    return e2;
  }
  getVideoSyncTime() {
    if (!this.isRunning) return this.pausedTime;
    if (this.audioProvider) {
      const e3 = this.audioProvider.getAudioClock();
      if (e3 >= 0 && this.audioProvider.hasHealthyBuffer()) return e3;
      if (e3 >= 0) return e3;
    }
    let e2 = (Z.now() - this.baseTime) * this.playbackRate;
    return this.duration > 0 && (e2 = Math.min(e2, this.duration)), e2;
  }
  setPlaybackRate(e2) {
    const t2 = this.getTime();
    this.playbackRate = e2, this.seek(t2), d.debug(ee, `Playback rate set to ${e2}`);
  }
  getPlaybackRate() {
    return this.playbackRate;
  }
  isPlaying() {
    return this.isRunning;
  }
  isSyncedToAudio() {
    return this.syncedToAudio && null !== this.audioProvider;
  }
  reset() {
    this.baseTime = 0, this.pausedTime = 0, this.isRunning = false, this.playbackRate = 1, this.syncedToAudio = false, this.lastAudioTime = 0, this.duration = 0, d.debug(ee, "Reset");
  }
}
const te = "PlayerState", ie = { idle: ["loading"], loading: ["ready", "error"], ready: ["playing", "paused", "seeking", "error"], playing: ["paused", "seeking", "buffering", "ended", "error"], paused: ["playing", "seeking", "error"], seeking: ["ready", "playing", "paused", "buffering", "error", "seeking"], buffering: ["playing", "paused", "ended", "error", "seeking"], ended: ["seeking", "idle"], error: ["idle"] };
class PlayerStateManager extends EventEmitter {
  state = "idle";
  getState() {
    return this.state;
  }
  setState(e2) {
    return e2 === this.state || (ie[this.state].includes(e2) ? (d.debug(te, `State: ${this.state} -> ${e2}`), this.state = e2, this.emit("change", e2), true) : (d.warn(te, `Invalid transition: ${this.state} -> ${e2}`), false));
  }
  is(e2) {
    return this.state === e2;
  }
  canPlay() {
    return ["ready", "paused", "ended", "buffering", "seeking"].includes(this.state);
  }
  canPause() {
    return "playing" === this.state || "buffering" === this.state;
  }
  canSeek() {
    return ["ready", "playing", "paused", "ended", "buffering", "seeking"].includes(this.state);
  }
  reset() {
    this.state = "idle", d.debug(te, "Reset to idle");
  }
}
const re = "SoftwareVideoDecoder";
class SoftwareVideoDecoder {
  bindings;
  onFrame = null;
  onError = null;
  isConfigured = false;
  trackIndex = -1;
  targetFps = 0;
  lastProcessedTimestamp = -1;
  constructor(e2) {
    this.bindings = e2;
  }
  setOnFrame(e2) {
    this.onFrame = e2;
  }
  setOnError(e2) {
    this.onError = e2;
  }
  async configure(e2, t2 = 0) {
    this.trackIndex = e2.id, this.targetFps = t2, this.lastProcessedTimestamp = -1;
    const i2 = this.bindings.enableDecoder(this.trackIndex);
    return i2 < 0 ? (d.error(re, `Failed to enable software decoder for stream ${this.trackIndex}: ${i2}`), false) : (this.isConfigured = true, this.targetFps > 0 && this.targetFps < 10 ? (this.bindings.setSkipFrame(this.trackIndex, 1), d.info(re, "Enabled AVDISCARD_NONREF skipping for low FPS playback")) : this.bindings.setSkipFrame(this.trackIndex, 0), d.info(re, `Configured software decoder for stream ${this.trackIndex} (TargetFPS: ${t2})`), true);
  }
  setNonRefSkip(e2) {
    !this.isConfigured || this.trackIndex < 0 || (this.bindings.setSkipFrame(this.trackIndex, e2 ? 1 : 0), d.info(re, `Non-reference frame skipping ${e2 ? "enabled" : "disabled"} for stream ${this.trackIndex}`));
  }
  async flush() {
    this.packetQueue = [], this.isConfigured && this.trackIndex >= 0 && this.bindings.flushDecoder(this.trackIndex);
  }
  reset() {
    this.packetQueue = [], this.isConfigured && this.trackIndex >= 0 && this.bindings.flushDecoder(this.trackIndex), this.lastProcessedTimestamp = -1;
  }
  close() {
    this.isConfigured = false;
  }
  packetQueue = [];
  isProcessingQueue = false;
  decode(e2, t2, i2, r2) {
    this.isConfigured && (this.packetQueue.push({ data: e2, pts: t2, dts: i2, keyframe: r2 }), this.processQueue());
  }
  async processQueue() {
    if (!this.isProcessingQueue) {
      this.isProcessingQueue = true;
      try {
        let e2 = performance.now();
        const t2 = new MessageChannel(), i2 = () => new Promise((e3) => {
          t2.port1.onmessage = () => e3(null), t2.port2.postMessage(null);
        });
        for (; this.packetQueue.length > 0; ) {
          performance.now() - e2 > 8 && (await i2(), e2 = performance.now());
          const t3 = this.packetQueue.shift();
          t3 && this.decodeInternal(t3);
        }
      } catch (e2) {
        d.error(re, "Queue processing error", e2);
      } finally {
        this.isProcessingQueue = false;
      }
    }
  }
  decodeInternal(e2) {
    if (!this.isConfigured) return;
    const t2 = this.bindings.sendPacket(this.trackIndex, e2.data, e2.pts, e2.dts, e2.keyframe);
    if (t2 < 0) d.warn(re, `sendPacket failed: ${t2}`);
    else for (; 0 === this.bindings.receiveFrame(this.trackIndex); ) {
      const t3 = this.bindings.getFramePts(this.trackIndex), i2 = t3 >= 0 ? 1e6 * t3 : 1e6 * e2.pts;
      this.processDecodedFrame(i2);
    }
  }
  processDecodedFrame(e2) {
    if (!this.onFrame) return;
    if (this.targetFps > 0 && this.lastProcessedTimestamp >= 0) {
      const t3 = 1e6 / this.targetFps;
      if (e2 < this.lastProcessedTimestamp + 0.9 * t3) return;
    }
    let t2 = this.bindings.getFrameWidth(), i2 = this.bindings.getFrameHeight();
    if (t2 > 1920) {
      const e3 = 1920 / t2;
      t2 = 1920, i2 = Math.floor(i2 * e3);
    }
    try {
      const r2 = this.bindings.getFrameRGBA(t2, i2);
      if (!r2) return void d.error(re, "Failed to get RGBA frame data");
      const s2 = new VideoFrame(r2, { format: "RGBA", codedWidth: t2, codedHeight: i2, timestamp: e2 });
      this.onFrame(s2), this.lastProcessedTimestamp = e2;
    } catch (e3) {
      d.error(re, "Frame creation failed", e3), this.onError && this.onError(e3);
    }
  }
  get configured() {
    return this.isConfigured;
  }
  get queueSize() {
    return this.packetQueue.length;
  }
}
const se = "VideoDecoder";
class MoviVideoDecoder {
  decoder = null;
  swDecoder = null;
  bindings = null;
  useSoftware = false;
  pendingFrames = [];
  pendingChunks = [];
  isConfigured = false;
  onFrame = null;
  onError = null;
  waitingForKeyframe = false;
  onKeyframeWaitChange = null;
  errorCount = 0;
  static MAX_ERRORS = 5;
  lastConfig = null;
  currentProfile;
  currentTrack = null;
  lastErrorTime = 0;
  openGopErrorCount = 0;
  hardwareRetryCount = 0;
  lastHardwareRetryTime = 0;
  isResurrecting = false;
  forceSoftware = false;
  requiresSoftware = false;
  targetFps = 0;
  isRecovering = false;
  lastRecreateTime = 0;
  isAnnexBSource = false;
  _loggedConversion = 0;
  skippedWhileWaiting = 0;
  justFlushed = false;
  skipRaslAfterResume = false;
  _perfSkipNonRef = false;
  postFlushKeyframeRejects = 0;
  static POST_FLUSH_REJECT_LIMIT = 2;
  static MID_STREAM_OPENGOP_REJECT_LIMIT = 3;
  static DISABLE_OPENGOP_SW_FALLBACK = true;
  constructor(e2 = false) {
    this.forceSoftware = e2, d.debug(se, `Created (forceSoftware: ${e2})`);
  }
  setBindings(e2) {
    this.bindings = e2;
  }
  setWaitingForKeyframe(e2) {
    if (e2 && (this.chunksSinceKeyframeWait = 0), this.waitingForKeyframe !== e2 && (this.waitingForKeyframe = e2, this.onKeyframeWaitChange)) try {
      this.onKeyframeWaitChange(e2);
    } catch {
    }
  }
  async configure(e2, t2, i2 = 0) {
    if (this.currentTrack = e2, this.targetFps = i2, this.currentProfile = e2.profile, this.useSoftware = false, this.requiresSoftware = false, this.isAnnexBSource = false, this.openGopErrorCount = 0, this.hardwareRetryCount = 0, this.lastHardwareRetryTime = 0, this.swDecoder && (this.swDecoder.close(), this.swDecoder = null), this.forceSoftware) return d.info(se, "Force software decoding enabled, using WASM decoder"), this.useSoftware = true, this.initSoftwareDecoder();
    if (!("VideoDecoder" in window)) return d.warn(se, "WebCodecs VideoDecoder not supported — falling back to software decoder"), this.useSoftware = true, this.initSoftwareDecoder();
    let r2 = CodecParser.getCodecString(e2.codec, e2.extradata);
    if (r2 || (d.debug(se, "CodecParser returned null, falling back to manual mapping"), r2 = this.mapCodecToWebCodecs(e2.codec, e2.width, e2.height, e2.profile, e2.level)), !r2) return d.error(se, `Unsupported codec: ${e2.codec}`), false;
    const s2 = { codec: r2, codedWidth: e2.width, codedHeight: e2.height, hardwareAcceleration: "prefer-hardware" };
    (e2.colorPrimaries || e2.colorTransfer || e2.colorSpace) && (s2.colorSpace = { primaries: e2.colorPrimaries, transfer: e2.colorTransfer, matrix: e2.colorSpace }, d.info(se, `Decoder color space: primaries=${e2.colorPrimaries}, transfer=${e2.colorTransfer}, matrix=${e2.colorSpace}`));
    let a2 = t2 || e2.extradata;
    a2 && a2.length > 4 && (0 === a2[0] && 0 === a2[1] && 1 === a2[2] || 0 === a2[0] && 0 === a2[1] && 0 === a2[2] && 1 === a2[3]) && (d.warn(se, "Extradata is Annex B — stripping description (decoder will use inline parameter sets from keyframes)."), a2 = void 0), a2 && a2.length > 0 && (s2.description = a2);
    try {
      let t3;
      try {
        t3 = await VideoDecoder.isConfigSupported(s2);
      } catch (e3) {
        t3 = { supported: false, config: s2 };
      }
      if (!t3.supported && "prefer-hardware" === s2.hardwareAcceleration) {
        const e3 = { ...s2 };
        delete e3.hardwareAcceleration;
        const i3 = await VideoDecoder.isConfigSupported(e3).catch(() => ({ supported: false, config: e3 }));
        i3.supported && (d.info(se, `Hardware decode unavailable for ${s2.codec}; using no-preference.`), delete s2.hardwareAcceleration, t3 = i3);
      }
      if (!t3.supported && s2.colorSpace) {
        d.info(se, "Codec config failed with color space. Retrying without explicit color metadata.");
        const e3 = { ...s2 };
        delete e3.colorSpace;
        const i3 = await VideoDecoder.isConfigSupported(e3);
        i3.supported && (d.info(se, "Codec supported WITHOUT explicit color metadata. Using stripped config."), delete s2.colorSpace, t3 = i3);
      }
      if (!t3.supported) {
        if (d.warn(se, `Codec config not supported: ${s2.codec}`), r2 && r2.startsWith("hvc1.4")) {
          const i4 = e2.level ? `L${e2.level}` : "L120", a3 = [`hvc1.4.10.${i4}.B0`, "hvc1.4.10.L93.B0", `hvc1.2.4.${i4}.B0`];
          for (const e3 of a3) {
            if (e3 === r2) continue;
            d.info(se, `HEVC Rext: trying fallback ${e3}`);
            const i5 = { ...s2, codec: e3 };
            if (i5.colorSpace && delete i5.colorSpace, e3.startsWith("hvc1.2") && i5.description) {
              const e4 = i5.description instanceof Uint8Array ? i5.description : new Uint8Array(i5.description);
              if (e4.length > 5 && 4 == (31 & e4[1])) {
                const t4 = new Uint8Array(e4);
                t4[1] = 224 & t4[1] | 2, i5.description = t4, d.info(se, "Patched extradata: Profile IDC 4 → 2 (Main10)");
              }
            }
            const a4 = await VideoDecoder.isConfigSupported(i5);
            if (a4.supported) {
              d.info(se, `HEVC Rext fallback ${e3} IS supported. Switching.`), s2.codec = e3, s2.description = i5.description, s2.colorSpace && delete s2.colorSpace, r2 = e3, t3 = a4;
              break;
            }
          }
        }
        const i3 = this.mapCodecToWebCodecs(e2.codec, e2.width, e2.height, e2.profile, e2.level);
        if (i3 && i3 !== r2) {
          d.info(se, `Retrying with manual codec string: ${i3}`);
          const e3 = { ...s2, codec: i3 };
          e3.colorSpace && delete e3.colorSpace;
          const a3 = await VideoDecoder.isConfigSupported(e3);
          a3.supported && (d.info(se, `Manual codec string IS supported. Using ${i3} instead of ${r2}`), s2.codec = i3, s2.colorSpace && delete s2.colorSpace, r2 = i3, t3 = a3);
        }
        if (!t3.supported) return d.warn(se, `Codec not supported by hardware: ${r2}. Trying software.`), this.initSoftwareDecoder();
      }
    } catch (e3) {
      if (d.warn(se, `Codec config check failed: ${r2}`, e3), !s2.colorSpace) return this.initSoftwareDecoder();
      try {
        if (d.info(se, "Retrying config check without color space after error"), delete s2.colorSpace, !(await VideoDecoder.isConfigSupported(s2)).supported) return this.initSoftwareDecoder();
        d.info(se, "Codec check passed after removing color space. Proceeding.");
      } catch (e4) {
        return this.initSoftwareDecoder();
      }
    }
    this.decoder = new VideoDecoder({ output: (e3) => {
      this.openGopErrorCount = 0, this.errorCount = 0, this.isResurrecting = false, this.justFlushed = false, this.postFlushKeyframeRejects = 0, this.onFrame ? this.onFrame(e3) : this.pendingFrames.push(e3);
    }, error: (e3) => {
      d.error(se, "Decoder error", e3), this.recoverFromError(e3);
    } }), this.lastConfig = s2;
    try {
      return this.decoder.configure(s2), this.isConfigured = true, d.info(se, `Configured: ${r2} ${e2.width}x${e2.height} hwAccel=${s2.hardwareAcceleration ?? "no-preference"}`), true;
    } catch (e3) {
      return d.error(se, "Failed to configure decoder", e3), this.initSoftwareDecoder();
    }
  }
  async initSoftwareDecoder() {
    if (!this.currentTrack) return false;
    if (!this.bindings) return d.error(se, "Cannot switch to software decoder: bindings not available"), false;
    if (d.info(se, "Initializing software decoder fallback"), this.useSoftware = true, this.decoder) {
      try {
        this.decoder.close();
      } catch (e3) {
      }
      this.decoder = null;
    }
    this.swDecoder = new SoftwareVideoDecoder(this.bindings), this.swDecoder.setOnFrame((e3) => {
      this.onFrame ? this.onFrame(e3) : this.pendingFrames.push(e3);
    }), this.swDecoder.setOnError((e3) => {
      d.error(se, "Software decoder error", e3), this.onError && this.onError(e3);
    });
    const e2 = this.targetFps > 0 ? this.targetFps : this.currentTrack.frameRate > 60 ? 60 : 0, t2 = await this.swDecoder.configure(this.currentTrack, e2);
    if (e2 > 0 && this.currentTrack.frameRate > e2 && d.info(se, `Software decoder FPS capped: ${this.currentTrack.frameRate}fps → ${e2}fps`), t2) {
      if (this.isConfigured = true, this.setWaitingForKeyframe(true), this.pendingChunks.length > 0) {
        d.info(se, `Processing ${this.pendingChunks.length} pending chunks for software decoder`);
        const e3 = [...this.pendingChunks];
        this.pendingChunks = [];
        for (const t3 of e3) this.decode(t3.data, t3.timestamp, t3.keyframe);
      }
      return true;
    }
    return false;
  }
  isUsingSoftware() {
    return this.useSoftware;
  }
  setPerformanceSkip(e2) {
    this._perfSkipNonRef = e2, this.useSoftware && this.swDecoder && this.swDecoder.setNonRefSkip(e2);
  }
  recreateDecoder() {
    if (this.useSoftware) return false;
    if (!this.lastConfig) return false;
    this.lastRecreateTime = performance.now(), d.warn(se, "Recreating decoder to recover from error");
    try {
      this.decoder?.close();
    } catch (e2) {
    }
    this.decoder = new VideoDecoder({ output: (e2) => {
      this.openGopErrorCount = 0, this.errorCount = 0, this.isResurrecting = false, this.justFlushed = false, this.postFlushKeyframeRejects = 0, this.onFrame ? this.onFrame(e2) : this.pendingFrames.push(e2);
    }, error: (e2) => {
      d.error(se, "Decoder error", e2), this.recoverFromError(e2);
    } });
    try {
      return this.decoder.configure(this.lastConfig), this.isConfigured = true, this.justFlushed = true, this.setWaitingForKeyframe(true), true;
    } catch (e2) {
      return d.error(se, "Failed to recreate decoder", e2), false;
    }
  }
  lastChunkInfo = null;
  static MIN_DELTA_PACKET_BYTES = 4;
  static TINY_PACKET_DROP_WINDOW = 120;
  chunksSinceKeyframeWait = 0;
  playbackRate = 1;
  setPlaybackRate(e2) {
    this.playbackRate = e2;
  }
  decode(e2, t2, i2, r2, s2 = true, a2 = false, n2 = false) {
    const o2 = i2 && !s2;
    if (this.lastChunkInfo = { timestamp: t2, keyframe: i2, size: e2.byteLength, wasIdrWhileWaiting: i2 && !o2 && this.waitingForKeyframe }, !this.isConfigured) return;
    if (this.chunksSinceKeyframeWait++, 1 !== this.playbackRate && !i2 && e2.byteLength < MoviVideoDecoder.MIN_DELTA_PACKET_BYTES && this.chunksSinceKeyframeWait <= MoviVideoDecoder.TINY_PACKET_DROP_WINDOW) return void d.debug(se, `Dropping ${e2.byteLength}-byte non-keyframe packet at ${t2.toFixed(3)}s (corrupt/too small, startup window at ${this.playbackRate}x)`);
    if (this.useSoftware && this.swDecoder && (i2 && !this.forceSoftware && !this.requiresSoftware && this.shouldRetryHardware(e2) && (d.info(se, `Found a sync frame! Attempting hardware resurrection (Attempt ${this.hardwareRetryCount + 1})...`), this.lastHardwareRetryTime = performance.now(), this.hardwareRetryCount++, this.useSoftware = false, this.openGopErrorCount = 0, this.isResurrecting = true, this.recreateDecoder() || (this.useSoftware = true, this.isResurrecting = false)), this.useSoftware)) {
      if (!this.swDecoder.configured) return void this.pendingChunks.push({ data: e2, timestamp: t2, keyframe: i2 });
      if (this.waitingForKeyframe && !i2) return;
      return i2 && this.setWaitingForKeyframe(false), void this.swDecoder.decode(e2, t2, r2 ?? t2, i2);
    }
    if (!this.decoder) return;
    if ("closed" === this.decoder.state) return void (this.isRecovering || this.recoverFromError(new Error("Decoder closed unexpectedly")));
    if (this.waitingForKeyframe && !i2) return void this.skippedWhileWaiting++;
    if (i2 && this.waitingForKeyframe && this.skippedWhileWaiting > 0 && (d.debug(se, `Skipped ${this.skippedWhileWaiting} non-keyframes while waiting for keyframe`), this.skippedWhileWaiting = 0), this.skipRaslAfterResume && !i2) {
      if (a2) return;
      this.skipRaslAfterResume = false;
    }
    if (this._perfSkipNonRef && n2 && !i2) return;
    let h2 = e2;
    if (i2 && !o2 && this.waitingForKeyframe) {
      const t3 = MoviVideoDecoder.stripAudLengthPrefixed(e2);
      t3 !== e2 && (h2 = t3);
    }
    if (this.isAnnexBSource && this._loggedConversion < 2 && (i2 && 0 === this._loggedConversion || !i2 && 1 === this._loggedConversion)) {
      this._loggedConversion++;
      const t3 = MoviVideoDecoder.splitAnnexBNalUnits(e2).map((e3) => e3[0] >> 1 & 63), r3 = t3.filter((e3) => e3 < 62), s3 = Array.from(e2.subarray(0, 8)).map((e3) => e3.toString(16).padStart(2, "0")).join(" ");
      d.info(se, `Annex B ${i2 ? "KEY" : "DELTA"}: ${e2.length}B → ${h2.length}B, NALs: [${t3}], kept: [${r3}], head: ${s3}`);
    }
    if (i2 && (this.skipRaslAfterResume = this.waitingForKeyframe, this.setWaitingForKeyframe(false)), this.errorCount >= MoviVideoDecoder.MAX_ERRORS) return;
    const c2 = o2 && !this.justFlushed, u2 = new EncodedVideoChunk({ type: c2 ? "delta" : i2 ? "key" : "delta", timestamp: 1e6 * t2, data: h2 });
    try {
      this.decoder.decode(u2);
    } catch (r3) {
      this.recoverFromError(r3), this.useSoftware && (d.warn(se, "Hardware decode failed, queuing chunk for software decoder"), this.pendingChunks.push({ data: e2, timestamp: t2, keyframe: i2 }));
    }
  }
  recoverFromError(e2) {
    if (!this.isRecovering) {
      this.isRecovering = true;
      try {
        this._doRecover(e2);
      } finally {
        this.isRecovering = false;
      }
    }
  }
  _doRecover(e2) {
    const t2 = e2.message && (e2.message.includes("wasn't a key frame") || e2.message.includes("key frame is required")), i2 = performance.now();
    t2 || (i2 - this.lastErrorTime > 3e4 ? this.errorCount = 1 : this.errorCount++, this.lastErrorTime = i2);
    const r2 = { message: e2.message, name: e2.name, lastChunk: this.lastChunkInfo, queueSize: this.decoder?.decodeQueueSize, state: this.decoder?.state, codec: this.lastConfig?.codec, errorCount: this.errorCount, isUnsupportedProfile: false };
    if (t2) {
      if (this.isResurrecting) return d.warn(se, "Hardware resurrection failed on sync frame. Returning to software decoder."), this.isResurrecting = false, void this.initSoftwareDecoder();
      this.openGopErrorCount++, d.warn(se, `Decoding warning: Frame was marked as keyframe but decoder rejected it (Open GOP?). Timestamp: ${this.lastChunkInfo?.timestamp}. Count (OpenGOP): ${this.openGopErrorCount}`);
      const e3 = this.lastConfig?.codec ?? "", t3 = e3.startsWith("hvc1.") || e3.startsWith("hev1."), i3 = true === this.lastChunkInfo?.wasIdrWhileWaiting;
      if (!MoviVideoDecoder.DISABLE_OPENGOP_SW_FALLBACK && (this.justFlushed || i3) && t3 && !this.forceSoftware && !this.useSoftware && (this.postFlushKeyframeRejects++, this.postFlushKeyframeRejects >= MoviVideoDecoder.POST_FLUSH_REJECT_LIMIT)) return d.error(se, `Hardware rejected ${this.postFlushKeyframeRejects} ${i3 ? "genuine IDR" : "post-flush"} keyframes — falling back to software decoder for this stream.`), void this.initSoftwareDecoder();
      const r3 = this.lastConfig?.codec ?? "", s2 = !r3.startsWith("hvc1.") && !r3.startsWith("hev1.") || this.justFlushed ? 15 : MoviVideoDecoder.MID_STREAM_OPENGOP_REJECT_LIMIT;
      if (!MoviVideoDecoder.DISABLE_OPENGOP_SW_FALLBACK && this.openGopErrorCount > s2) return d.error(se, `Persistent Open GOP errors detected (${this.openGopErrorCount} > ${s2}). Switching to software decoder.`), void this.initSoftwareDecoder();
      if (this.decoder && "closed" !== this.decoder.state) try {
        return this.decoder.reset(), this.decoder.configure(this.lastConfig), void this.setWaitingForKeyframe(true);
      } catch (e4) {
        d.warn(se, "Fast reset failed during Open GOP recovery, proceeding to full recreation");
      }
    } else d.error(se, `Decoding error details: ${JSON.stringify(r2)}. Count: ${this.errorCount}`);
    if (this.errorCount >= MoviVideoDecoder.MAX_ERRORS) return d.error(se, `Max errors (${MoviVideoDecoder.MAX_ERRORS}) exceeded within short duration. Emitting fatal error.`), void (this.onError && this.onError(e2));
    if (4 === this.currentProfile && this.lastConfig?.codec.startsWith("hvc1.")) {
      d.warn(se, "HEVC Rext profile error.");
      const e3 = `hvc1.4.10.${this.currentTrack?.level ? `L${this.currentTrack.level}` : "L120"}.B0`;
      if (this.lastConfig.codec !== e3) {
        d.info(se, `Attempting recovery by switching to Rext fallback: ${e3}`), this.lastConfig.codec = e3, this.openGopErrorCount = 0;
        try {
          if (this.decoder && "closed" !== this.decoder.state) return this.decoder.configure(this.lastConfig), this.setWaitingForKeyframe(true), void (this.errorCount = 0);
          if (this.recreateDecoder()) return void (this.errorCount = 0);
        } catch (e4) {
          d.error(se, "Fallback configuration failed", e4);
        }
      } else d.warn(se, "HEVC Rext fallback string also failed. Attempting reset/recreation.");
    }
    if (this.decoder && "closed" !== this.decoder.state) try {
      return d.warn(se, "Attempting fast reset recovery"), this.decoder.reset(), this.decoder.configure(this.lastConfig), void this.setWaitingForKeyframe(true);
    } catch (e3) {
      d.warn(se, "Fast reset failed, trying full recreation");
    }
    this.recreateDecoder();
  }
  mapCodecToWebCodecs(e2, t2, i2, r2, s2) {
    const a2 = e2.toLowerCase();
    if ("h264" === a2 || "avc1" === a2) return "avc1.640028";
    if ("hevc" === a2 || "h265" === a2 || "hvc1" === a2) {
      if (4 === r2) {
        const e3 = s2 ? `L${s2}` : "L120";
        return d.info(se, `Detected HEVC Rext profile. Using hvc1.4.10.${e3}.B0`), `hvc1.4.10.${e3}.B0`;
      }
      if (2 === r2) {
        const e3 = s2 ? `L${s2}` : "L153";
        return d.info(se, `Mapping HEVC Main 10 profile (2) to hvc1.2.4.${e3}.B0`), `hvc1.2.4.${e3}.B0`;
      }
      return 1 === r2 ? `hvc1.1.6.${s2 ? `L${s2}` : "L120"}.B0` : "hvc1.1.6.L93.B0";
    }
    if ("vp8" === a2) return "vp8";
    if ("vp9" === a2) {
      const e3 = (t2 && t2 > 1920 ? 51 : t2 && t2 > 1280 ? 41 : 31).toString().padStart(2, "0");
      return 1 === r2 ? (d.info(se, `Mapping VP9 Profile 1 to vp09.01.${e3}.08.02 (4:2:2 8-bit)`), `vp09.01.${e3}.08.02.01.01.01.00`) : 2 === r2 ? (d.info(se, `Mapping VP9 Profile 2 to vp09.02.${e3}.10 (HDR)`), `vp09.02.${e3}.10.01.09.16.09.00`) : 3 === r2 ? `vp09.03.${e3}.10.02.09.16.09.00` : `vp09.00.${e3}.08.01.01.01.01.00`;
    }
    return "av1" === a2 ? "av01.0.01M.08" : "vvc" === a2 || "vvc1" === a2 || "vvi1" === a2 ? "vvc1.1.L51" : "h263" === a2 || "h263p" === a2 ? "h263" : "mpeg4" === a2 || "mp4v" === a2 ? "mp4v.20.9" : null;
  }
  setOnFrame(e2) {
    for (this.onFrame = e2, this.swDecoder && this.swDecoder.setOnFrame(e2); this.pendingFrames.length > 0; ) e2(this.pendingFrames.shift());
  }
  setOnError(e2) {
    this.onError = e2, this.swDecoder && this.swDecoder.setOnError(e2);
  }
  async flush() {
    if (this.openGopErrorCount = 0, this.justFlushed = true, this.postFlushKeyframeRejects = 0, this.skipRaslAfterResume = false, this.pendingChunks = [], this.setWaitingForKeyframe(true), this.swDecoder) return this.swDecoder.flush();
    if (!this.decoder) return;
    const e2 = this.lastConfig?.codec ?? "";
    if (!e2.startsWith("hvc1.") && !e2.startsWith("hev1.") || this.forceSoftware || this.useSoftware || !this.recreateDecoder()) try {
      await Promise.race([this.decoder.flush(), new Promise((e3, t2) => setTimeout(() => t2(new Error("flush timeout")), 1e3))]);
    } catch (e3) {
      d.warn(se, "Flush timeout or error, resetting decoder", e3);
      try {
        this.decoder.reset(), this.lastConfig && this.decoder.configure(this.lastConfig);
      } catch (e4) {
        d.error(se, "Reset after flush timeout failed", e4);
      }
    }
  }
  reset() {
    if (this.openGopErrorCount = 0, this.swDecoder && this.swDecoder.reset(), this.decoder) try {
      this.decoder.reset();
    } catch (e2) {
      d.error(se, "Reset error", e2);
    }
    for (const e2 of this.pendingFrames) e2.close();
    this.pendingFrames = [], this.pendingChunks = [];
  }
  close() {
    if (this.reset(), this.swDecoder && (this.swDecoder.close(), this.swDecoder = null), this.decoder) {
      try {
        this.decoder.close();
      } catch (e2) {
      }
      this.decoder = null;
    }
    this.isConfigured = false, this.onFrame = null, this.onError = null, this.useSoftware = false, d.debug(se, "Closed");
  }
  get configured() {
    return this.isConfigured;
  }
  shouldRetryHardware(e2) {
    if (!this.useSoftware || !this.currentTrack) return false;
    if (this.hardwareRetryCount >= 10) return false;
    if (!this.isLikelySyncFrame(e2)) return false;
    const t2 = performance.now(), i2 = 0 === this.hardwareRetryCount ? 1e4 : 3e4;
    return t2 - this.lastHardwareRetryTime > i2;
  }
  isLikelySyncFrame(e2) {
    if (!this.lastConfig) return true;
    const t2 = this.lastConfig.codec.toLowerCase();
    try {
      let i2 = -1;
      if (0 === e2[0] && 0 === e2[1] && 1 === e2[2] ? i2 = 3 : (0 === e2[0] && 0 === e2[1] && 0 === e2[2] && 1 === e2[3] || e2.length > 4) && (i2 = 4), -1 === i2 || i2 >= e2.length) return false;
      const r2 = e2[i2];
      if (t2.includes("avc1") || t2.includes("h264")) return 5 == (31 & r2);
      if (t2.includes("hvc1") || t2.includes("hev1") || t2.includes("h265")) {
        const e3 = r2 >> 1 & 63;
        return e3 >= 16 && e3 <= 21;
      }
      if ((t2.includes("vvc1") || t2.includes("vvi1")) && i2 + 1 < e2.length) {
        const t3 = e2[i2 + 1] >> 3 & 31;
        return t3 >= 7 && t3 <= 9;
      }
    } catch (e3) {
    }
    return true;
  }
  get queueSize() {
    return (this.swDecoder?.queueSize ?? 0) + (this.decoder?.decodeQueueSize ?? 0);
  }
  get isSoftware() {
    return this.useSoftware;
  }
  get isWaitingForKeyframe() {
    return this.waitingForKeyframe;
  }
  isRecentlyRecovering(e2 = 1200) {
    return !!this.waitingForKeyframe || 0 !== this.lastRecreateTime && performance.now() - this.lastRecreateTime < e2;
  }
  getStats() {
    return { decoderType: this.useSoftware ? "Software (FFmpeg)" : "Hardware (WebCodecs)", queueSize: this.queueSize, errorCount: this.errorCount };
  }
  static splitAnnexBNalUnits(e2) {
    const t2 = [];
    let i2 = 0;
    const r2 = e2.length;
    for (; i2 < r2; ) {
      let s2 = 0;
      if (i2 + 3 <= r2 && 0 === e2[i2] && 0 === e2[i2 + 1] && 1 === e2[i2 + 2]) s2 = 3;
      else {
        if (!(i2 + 4 <= r2 && 0 === e2[i2] && 0 === e2[i2 + 1] && 0 === e2[i2 + 2] && 1 === e2[i2 + 3])) {
          i2++;
          continue;
        }
        s2 = 4;
      }
      const a2 = i2 + s2;
      let n2 = r2;
      for (let t3 = a2 + 1; t3 < r2 - 2; t3++) if (0 === e2[t3] && 0 === e2[t3 + 1] && (1 === e2[t3 + 2] || t3 + 3 < r2 && 0 === e2[t3 + 2] && 1 === e2[t3 + 3])) {
        n2 = t3;
        break;
      }
      n2 > a2 && t2.push(e2.subarray(a2, n2)), i2 = n2;
    }
    return t2;
  }
  static removeEpb(e2) {
    const t2 = [];
    let i2 = 0;
    for (; i2 < e2.length; ) i2 + 2 < e2.length && 0 === e2[i2] && 0 === e2[i2 + 1] && 3 === e2[i2 + 2] ? (t2.push(0, 0), i2 += 3) : (t2.push(e2[i2]), i2++);
    return new Uint8Array(t2);
  }
  static annexBToHvcC(e2, t2) {
    const i2 = this.splitAnnexBNalUnits(e2);
    if (0 === i2.length) return null;
    const r2 = [], s2 = [], a2 = [];
    for (const e3 of i2) {
      if (e3.length < 2) continue;
      const t3 = e3[0] >> 1 & 63;
      32 === t3 ? r2.push(e3) : 33 === t3 ? s2.push(e3) : 34 === t3 && a2.push(e3);
    }
    if (0 === s2.length) return d.warn(se, "No SPS found in Annex B extradata"), null;
    const n2 = r2[0] || s2[0], o2 = this.removeEpb(n2), h2 = 32 == (o2[0] >> 1 & 63) ? 6 : 3;
    let c2 = t2?.profile ?? 2, u2 = 0, l2 = new Uint8Array([32, 0, 0, 0]), f2 = new Uint8Array(6), m2 = t2?.level ?? 153;
    if (o2.length >= h2 + 12) {
      const e3 = o2[h2];
      c2 = 31 & e3, u2 = e3 >> 5 & 1, l2 = o2.slice(h2 + 1, h2 + 5), f2 = o2.slice(h2 + 5, h2 + 11), m2 = o2[h2 + 11], d.debug(se, `hvcC from NAL: profile=${c2}, tier=${u2}, level=${m2}`);
    } else null == t2?.profile && null == t2?.level || d.debug(se, `hvcC from track metadata: profile=${c2}, level=${m2}`);
    const g2 = [];
    r2.length > 0 && g2.push({ type: 32, nalus: r2 }), s2.length > 0 && g2.push({ type: 33, nalus: s2 }), a2.length > 0 && g2.push({ type: 34, nalus: a2 });
    let p2 = 23;
    for (const e3 of g2) {
      p2 += 3;
      for (const t3 of e3.nalus) p2 += 2 + t3.length;
    }
    const b2 = new Uint8Array(p2), v2 = new DataView(b2.buffer);
    let y2 = 0;
    b2[y2++] = 1, b2[y2++] = u2 << 5 | 31 & c2, b2[y2++] = l2[0], b2[y2++] = l2[1], b2[y2++] = l2[2], b2[y2++] = l2[3];
    for (let e3 = 0; e3 < 6; e3++) b2[y2++] = f2[e3];
    b2[y2++] = m2, v2.setUint16(y2, 61440), y2 += 2, b2[y2++] = 252, b2[y2++] = 253, b2[y2++] = 250, b2[y2++] = 250, v2.setUint16(y2, 0), y2 += 2, b2[y2++] = 15, b2[y2++] = g2.length;
    for (const e3 of g2) {
      b2[y2++] = 128 | 63 & e3.type, v2.setUint16(y2, e3.nalus.length), y2 += 2;
      for (const t3 of e3.nalus) v2.setUint16(y2, t3.length), y2 += 2, b2.set(t3, y2), y2 += t3.length;
    }
    return b2;
  }
  static annexBToAvcC(e2) {
    const t2 = this.splitAnnexBNalUnits(e2);
    if (0 === t2.length) return null;
    const i2 = [], r2 = [];
    for (const e3 of t2) {
      if (e3.length < 1) continue;
      const t3 = 31 & e3[0];
      7 === t3 ? i2.push(e3) : 8 === t3 && r2.push(e3);
    }
    if (0 === i2.length) return d.warn(se, "No SPS found in Annex B extradata for AVC"), null;
    const s2 = i2[0];
    let a2 = 6;
    a2 += 1;
    for (const e3 of i2) a2 += 2 + e3.length;
    a2 += 1;
    for (const e3 of r2) a2 += 2 + e3.length;
    const n2 = new Uint8Array(a2), o2 = new DataView(n2.buffer);
    let h2 = 0;
    n2[h2++] = 1, n2[h2++] = s2[1], n2[h2++] = s2[2], n2[h2++] = s2[3], n2[h2++] = 255, n2[h2++] = 224 | i2.length;
    for (const e3 of i2) o2.setUint16(h2, e3.length), h2 += 2, n2.set(e3, h2), h2 += e3.length;
    n2[h2++] = r2.length;
    for (const e3 of r2) o2.setUint16(h2, e3.length), h2 += 2, n2.set(e3, h2), h2 += e3.length;
    return n2;
  }
  static isUnsupportedHevcNalType(e2) {
    return !(e2.length < 2) && (e2[0] >> 1 & 63) >= 62;
  }
  static annexBToLengthPrefixed(e2) {
    const t2 = this.splitAnnexBNalUnits(e2);
    if (0 === t2.length) return e2;
    const i2 = [];
    let r2 = 0;
    for (const e3 of t2) this.isUnsupportedHevcNalType(e3) || (i2.push(e3), r2 += 4 + e3.length);
    if (0 === i2.length) return e2;
    const s2 = new Uint8Array(r2), a2 = new DataView(s2.buffer);
    let n2 = 0;
    for (const e3 of i2) a2.setUint32(n2, e3.length), n2 += 4, s2.set(e3, n2), n2 += e3.length;
    return s2;
  }
  static stripAudLengthPrefixed(e2) {
    if (e2.length < 5) return e2;
    if (0 === e2[0] && 0 === e2[1] && (1 === e2[2] || 0 === e2[2] && 1 === e2[3])) return e2;
    const t2 = new DataView(e2.buffer, e2.byteOffset, e2.byteLength), i2 = [];
    let r2 = 0, s2 = 0;
    for (; r2 + 4 <= e2.length; ) {
      const a3 = t2.getUint32(r2), n3 = r2 + 4;
      if (a3 <= 0 || n3 + a3 > e2.length) return e2;
      35 == (e2[n3] >> 1 & 63) ? s2++ : i2.push({ off: n3, len: a3 }), r2 = n3 + a3;
    }
    if (0 === s2 || 0 === i2.length) return e2;
    let a2 = 0;
    for (const e3 of i2) a2 += 4 + e3.len;
    const n2 = new Uint8Array(a2), o2 = new DataView(n2.buffer);
    let h2 = 0;
    for (const t3 of i2) o2.setUint32(h2, t3.len), h2 += 4, n2.set(e2.subarray(t3.off, t3.off + t3.len), h2), h2 += t3.len;
    return n2;
  }
}
const ae = "SoftwareAudioDecoder";
class SoftwareAudioDecoder {
  bindings;
  onData = null;
  onError = null;
  isConfigured = false;
  trackIndex = -1;
  _downmix = true;
  consecutiveFailures = 0;
  isBroken = false;
  static MAX_CONSECUTIVE_FAILURES = 50;
  coalesceTarget = 0;
  pending = [];
  pendingSamples = 0;
  constructor(e2) {
    this.bindings = e2;
  }
  setDownmix(e2) {
    this._downmix = e2, this.isConfigured && this.bindings.enableAudioDownmix(e2);
  }
  setOnData(e2) {
    this.onData = e2;
  }
  setOnError(e2) {
    this.onError = e2;
  }
  async configure(e2) {
    this.trackIndex = e2.id;
    const t2 = this.bindings.enableDecoder(this.trackIndex);
    return t2 < 0 ? (d.error(ae, `Failed to enable software decoder for stream ${this.trackIndex}: ${t2}`), false) : (this.bindings.enableAudioDownmix(this._downmix), this.isConfigured = true, d.info(ae, `Configured software decoder for stream ${this.trackIndex}`), true);
  }
  async flush() {
    this.isConfigured && this.bindings.flushDecoder(this.trackIndex), this.consecutiveFailures = 0, this.isBroken = false, this.pending = [], this.pendingSamples = 0;
  }
  reset() {
    this.consecutiveFailures = 0, this.pending = [], this.pendingSamples = 0;
  }
  close() {
    this.isConfigured = false, this.pending = [], this.pendingSamples = 0;
  }
  decode(e2, t2, i2) {
    if (!this.isConfigured || this.isBroken) return;
    const r2 = this.bindings.sendPacket(this.trackIndex, e2, t2, t2, i2);
    if (r2 < 0) return this.consecutiveFailures++, 1 === this.consecutiveFailures && d.warn(ae, `sendPacket failed: ${r2}`), void (this.consecutiveFailures >= SoftwareAudioDecoder.MAX_CONSECUTIVE_FAILURES && (this.isBroken = true, d.error(ae, `Audio decoder disabled after ${this.consecutiveFailures} consecutive sendPacket failures (last: ${r2}). Playback continues without audio.`)));
    for (this.consecutiveFailures = 0; 0 === this.bindings.receiveFrame(this.trackIndex); ) this.processDecodedFrame(t2);
  }
  decodeBatch(e2) {
    if (!this.isConfigured || this.isBroken || 0 === e2.length) return 0;
    const t2 = this.bindings.decodeAudioBatch(this.trackIndex, e2);
    if (t2 < 0) return this.consecutiveFailures++, 1 === this.consecutiveFailures && d.warn(ae, `decodeAudioBatch failed: ${t2}`), this.consecutiveFailures >= SoftwareAudioDecoder.MAX_CONSECUTIVE_FAILURES && (this.isBroken = true, d.error(ae, `Audio decoder disabled after ${this.consecutiveFailures} consecutive batch failures (last: ${t2}). Playback continues without audio.`)), 0;
    this.consecutiveFailures = 0;
    const i2 = this.bindings.audioBatchSamples();
    if (i2 <= 0 || !this.onData) return t2;
    const r2 = this.bindings.audioBatchChannels(), s2 = this.bindings.audioBatchSampleRate(), a2 = this.bindings.audioBatchPts();
    try {
      const e3 = this.bindings.module.HEAPU8, n2 = new Array(r2);
      for (let s3 = 0; s3 < r2; s3++) {
        const r3 = this.bindings.audioBatchPlanePointer(s3);
        if (!r3) return t2;
        const a3 = new Float32Array(e3.buffer, r3, i2);
        n2[s3] = new Float32Array(a3);
      }
      this.enqueueFrame({ planes: n2, numberOfFrames: i2, numberOfChannels: r2, sampleRate: s2, timestamp: 1e6 * a2 });
    } catch (e3) {
      d.error(ae, "Batched PCM extraction failed", e3), this.onError && this.onError(e3);
    }
    return t2;
  }
  processDecodedFrame(e2) {
    if (!this.onData) return;
    const t2 = this.bindings.getFrameSamples(), i2 = this.bindings.getFrameChannels(), r2 = this.bindings.getFrameSampleRate();
    try {
      const s2 = this.bindings.module.HEAPU8, a2 = new Array(i2);
      for (let e3 = 0; e3 < i2; e3++) {
        const i3 = this.bindings.getFrameDataPointer(e3), r3 = new Float32Array(s2.buffer, i3, t2);
        a2[e3] = new Float32Array(r3);
      }
      const n2 = { planes: a2, numberOfFrames: t2, numberOfChannels: i2, sampleRate: r2, timestamp: 1e6 * e2 };
      Math.random() < 0.01 && d.debug(ae, `Audio data: ${i2}ch, ${t2} frames`), this.enqueueFrame(n2);
    } catch (e3) {
      d.error(ae, "PCM frame extraction failed", e3), this.onError && this.onError(e3);
    }
  }
  enqueueFrame(e2) {
    if (0 === this.coalesceTarget && (this.coalesceTarget = Math.max(1024, Math.round(0.03 * e2.sampleRate))), e2.numberOfFrames >= this.coalesceTarget && 0 === this.pendingSamples) return void (this.onData && this.onData(e2));
    const t2 = this.pending[0];
    !t2 || t2.numberOfChannels === e2.numberOfChannels && t2.sampleRate === e2.sampleRate || this.flushPending(), this.pending.push(e2), this.pendingSamples += e2.numberOfFrames, this.pendingSamples >= this.coalesceTarget && this.flushPending();
  }
  flushPending() {
    if (0 === this.pending.length) return;
    const e2 = 1 === this.pending.length ? this.pending[0] : this.mergePending();
    this.pending = [], this.pendingSamples = 0, this.onData && this.onData(e2);
  }
  mergePending() {
    const e2 = this.pending[0], t2 = e2.numberOfChannels, i2 = this.pendingSamples, r2 = new Array(t2);
    for (let e3 = 0; e3 < t2; e3++) {
      const t3 = new Float32Array(i2);
      let s2 = 0;
      for (const i3 of this.pending) t3.set(i3.planes[e3], s2), s2 += i3.numberOfFrames;
      r2[e3] = t3;
    }
    return { planes: r2, numberOfFrames: i2, numberOfChannels: t2, sampleRate: e2.sampleRate, timestamp: e2.timestamp };
  }
  get configured() {
    return this.isConfigured;
  }
}
const ne = "AudioDecoder";
class MoviAudioDecoder {
  decoder = null;
  swDecoder = null;
  bindings = null;
  useSoftware = false;
  pendingData = [];
  pendingPCM = [];
  pendingChunks = [];
  isConfigured = false;
  onData = null;
  onPCM = null;
  onError = null;
  currentTrack = null;
  hasTriedSoftwareFallback = false;
  hasDescription = false;
  _downmix = true;
  constructor() {
    d.debug(ne, "Created");
  }
  setDownmix(e2) {
    this._downmix = e2, this.swDecoder && this.swDecoder.setDownmix(e2);
  }
  setBindings(e2) {
    this.bindings = e2;
  }
  get usesSoftware() {
    return this.useSoftware;
  }
  async configure(e2, t2) {
    if (this.currentTrack = e2, this.useSoftware = false, this.hasTriedSoftwareFallback = false, this.swDecoder && (this.swDecoder.close(), this.swDecoder = null), this.needsSoftwareDecoding(e2.codec)) return d.info(ne, `Forcing software decoding for codec: ${e2.codec}`), this.initSoftwareDecoder();
    if (e2.channels > 2) return d.info(ne, `Forcing software decoding for multi-channel audio: ${e2.channels} channels`), this.initSoftwareDecoder();
    if (!("AudioDecoder" in window)) return d.error(ne, "WebCodecs AudioDecoder not supported"), this.initSoftwareDecoder();
    const i2 = this.mapCodecToWebCodecs(e2.codec);
    if (!i2) return d.warn(ne, `Codec ${e2.codec} not natively supported, trying software.`), this.initSoftwareDecoder();
    const r2 = { codec: i2, sampleRate: e2.sampleRate, numberOfChannels: e2.channels };
    this.hasDescription = false, t2 && t2.length > 0 && (r2.description = t2, this.hasDescription = true);
    try {
      if (!(await AudioDecoder.isConfigSupported(r2)).supported) return d.warn(ne, `Codec not supported by hardware: ${i2}. Trying software.`), this.initSoftwareDecoder();
    } catch (e3) {
      return d.warn(ne, `Codec config check failed: ${i2}`, e3), this.initSoftwareDecoder();
    }
    this.decoder = new AudioDecoder({ output: (e3) => {
      this.onData ? this.onData(e3) : this.pendingData.push(e3);
    }, error: async (e3) => {
      if (d.error(ne, "Decoder error", e3), !this.useSoftware && !this.hasTriedSoftwareFallback && this.currentTrack) {
        if (d.warn(ne, "Hardware decoder error detected, automatically switching to software decoder"), this.hasTriedSoftwareFallback = true, await this.initSoftwareDecoder()) return void d.info(ne, "Successfully switched to software decoder after hardware error");
        d.error(ne, "Failed to switch to software decoder, error will be propagated");
      }
      this.onError && this.onError(e3);
    } });
    try {
      return this.decoder.configure(r2), this.isConfigured = true, d.info(ne, `Configured: ${i2} ${e2.sampleRate}Hz ${e2.channels}ch`), true;
    } catch (e3) {
      return d.error(ne, "Failed to configure decoder", e3), this.initSoftwareDecoder();
    }
  }
  needsSoftwareDecoding(e2) {
    return ["eac3", "ac3", "dts", "dca", "truehd", "mlp", "opus", "flac"].includes(e2.toLowerCase());
  }
  async initSoftwareDecoder() {
    if (!this.currentTrack) return false;
    if (!this.bindings) return d.error(ne, "Cannot switch to software decoder: bindings not available"), false;
    if (d.info(ne, "Initializing software decoder fallback"), this.useSoftware = true, this.decoder) {
      try {
        this.decoder.close();
      } catch (e2) {
      }
      this.decoder = null;
    }
    if (this.swDecoder = new SoftwareAudioDecoder(this.bindings), this.swDecoder.setDownmix(this._downmix), this.swDecoder.setOnData((e2) => {
      this.onPCM ? this.onPCM(e2) : this.pendingPCM.push(e2);
    }), this.swDecoder.setOnError((e2) => {
      d.error(ne, "Software decoder error", e2), this.onError && this.onError(e2);
    }), await this.swDecoder.configure(this.currentTrack)) {
      if (this.isConfigured = true, this.pendingChunks.length > 0) {
        const e2 = [...this.pendingChunks];
        this.pendingChunks = [];
        for (const t2 of e2) this.decode(t2.data, t2.timestamp, t2.keyframe);
      }
      return true;
    }
    return false;
  }
  mapCodecToWebCodecs(e2) {
    const t2 = e2.toLowerCase();
    return "aac" === t2 || "aac_latm" === t2 ? "mp4a.40.2" : "mp3" === t2 ? "mp3" : "opus" === t2 ? "opus" : "vorbis" === t2 ? "vorbis" : "flac" === t2 ? "flac" : "amr_nb" === t2 || "amrnb" === t2 ? "samr" : "amr_wb" === t2 || "amrwb" === t2 ? "sawb" : "ac3" === t2 ? "ac-3" : "eac3" === t2 || "ec3" === t2 ? "ec-3" : null;
  }
  canBatch() {
    return this.isConfigured && this.useSoftware && !!this.swDecoder && !!this.bindings?.supportsAudioBatch();
  }
  decodeBatch(e2) {
    if (0 === e2.length) return 0;
    if (!this.canBatch()) {
      for (const t2 of e2) this.decode(t2.data, t2.pts, true);
      return e2.length;
    }
    return this.swDecoder.decodeBatch(e2);
  }
  decode(e2, t2, i2) {
    if (!this.isConfigured) return void this.pendingChunks.push({ data: e2, timestamp: t2, keyframe: i2 });
    if (this.useSoftware && this.swDecoder) return void this.swDecoder.decode(e2, t2, i2);
    if (!this.decoder) return void d.warn(ne, "Decoder not configured");
    if ("closed" === this.decoder.state) return void d.warn(ne, "Decoder is closed, cannot decode");
    const r2 = this.hasDescription ? MoviAudioDecoder.stripAdtsHeader(e2) : e2, s2 = new EncodedAudioChunk({ type: i2 ? "key" : "delta", timestamp: 1e6 * t2, data: r2 });
    try {
      this.decoder.decode(s2);
    } catch (r3) {
      if (d.error(ne, "Decode error", r3), !this.useSoftware && !this.hasTriedSoftwareFallback && this.currentTrack) return d.warn(ne, "Decode exception detected, automatically switching to software decoder"), this.hasTriedSoftwareFallback = true, this.pendingChunks.push({ data: e2, timestamp: t2, keyframe: i2 }), void this.initSoftwareDecoder().then((e3) => {
        e3 ? d.info(ne, "Successfully switched to software decoder after decode exception") : (d.error(ne, "Failed to switch to software decoder"), this.isConfigured = false);
      }).catch((e3) => {
        d.error(ne, "Error during software decoder fallback", e3), this.isConfigured = false;
      });
      this.isConfigured = false;
    }
  }
  setOnData(e2) {
    for (this.onData = e2; this.pendingData.length > 0; ) e2(this.pendingData.shift());
  }
  setOnPCM(e2) {
    for (this.onPCM = e2; this.pendingPCM.length > 0; ) e2(this.pendingPCM.shift());
  }
  setOnError(e2) {
    this.onError = e2;
  }
  async flush() {
    if (this.useSoftware && this.swDecoder) await this.swDecoder.flush();
    else if (this.decoder) try {
      await this.decoder.flush();
    } catch (e2) {
      d.error(ne, "Flush error", e2);
    }
  }
  reset() {
    if (this.decoder) try {
      this.decoder.reset();
    } catch (e2) {
      d.error(ne, "Reset error", e2);
    }
    for (const e2 of this.pendingData) e2.close();
    this.pendingData = [], this.pendingPCM = [];
  }
  close() {
    if (this.reset(), this.decoder) {
      try {
        this.decoder.close();
      } catch (e2) {
      }
      this.decoder = null;
    }
    this.isConfigured = false, this.onData = null, this.onError = null, d.debug(ne, "Closed");
  }
  get configured() {
    return this.isConfigured;
  }
  get queueSize() {
    return this.decoder?.decodeQueueSize ?? 0;
  }
  getStats() {
    return { decoderType: this.useSoftware ? "Software (FFmpeg)" : "Hardware (WebCodecs)", queueSize: this.queueSize };
  }
  static stripAdtsHeader(e2) {
    if (e2.length < 7) return e2;
    if (255 !== e2[0] || 240 & ~e2[1]) return e2;
    const t2 = 1 & e2[1] ? 7 : 9, i2 = (3 & e2[3]) << 11 | e2[4] << 3 | (224 & e2[5]) >> 5;
    return i2 > 0 && i2 <= e2.length && t2 < e2.length ? e2.subarray(t2, i2) : t2 < e2.length ? e2.subarray(t2) : e2;
  }
}
const oe = "SubtitleDecoder";
class SubtitleDecoder {
  bindings = null;
  isConfigured = false;
  currentTrack = null;
  onCue = null;
  onError = null;
  constructor() {
    d.debug(oe, "Created");
  }
  setBindings(e2, t2 = true) {
    this.bindings = e2, t2 && this.currentTrack && !this.isConfigured && this.bindings && this.configure(this.currentTrack).catch((e3) => {
      d.error(oe, "Failed to configure decoder after bindings set", e3);
    });
  }
  async configure(e2, t2) {
    if (d.debug(oe, `configure called: track=${e2.id}, codec=${e2.codec}, type=${e2.subtitleType}`), this.currentTrack = e2, this.isConfigured = false, !this.bindings) return d.warn(oe, "WASM bindings not set, will be set later"), true;
    d.debug(oe, `Attempting to enable subtitle decoder for track ${e2.id}, codec: ${e2.codec}, type: ${e2.subtitleType}, extradata=${t2?.length ?? 0} bytes`);
    const i2 = await this.bindings.enableDecoder(e2.id, t2);
    if (d.debug(oe, `enableDecoder result: ${i2}`), 0 !== i2) {
      const t3 = -2 === i2 ? `Subtitle codec '${e2.codec}' not found/not compiled in WASM build` : `Failed to enable subtitle decoder (error ${i2})`;
      return d.error(oe, t3), d.warn(oe, `Subtitle track ${e2.id} (${e2.codec}) cannot be decoded - codec may not be available in WASM build`), false;
    }
    return this.isConfigured = true, d.info(oe, `Subtitle decoder configured for track ${e2.id}: ${e2.codec}`), true;
  }
  async decode(e2, t2, i2, r2) {
    if (this.isConfigured && this.bindings && this.currentTrack) {
      d.debug(oe, `Decoding subtitle packet: track=${this.currentTrack.id}, size=${e2.length}, timestamp=${t2.toFixed(3)}s, duration=${r2?.toFixed(3) ?? "undefined"}s`);
      try {
        const i3 = await this.bindings.decodeSubtitle(this.currentTrack.id, e2, t2, r2);
        if (d.debug(oe, `Subtitle decode result: ${i3} (0=success, -6=EAGAIN, other=error)`), 0 === i3) {
          const e3 = await this.bindings.getSubtitleTimes();
          if (!e3) return d.warn(oe, "Missing subtitle times"), void await this.bindings.freeSubtitle();
          const t3 = await this.bindings.getSubtitleImageInfo();
          if (t3) {
            d.debug(oe, `Decoded image subtitle: ${t3.width}x${t3.height} at (${t3.x}, ${t3.y}), times=${e3.start.toFixed(3)}s-${e3.end.toFixed(3)}s`);
            const i4 = await this.bindings.getSubtitleImageData();
            if (i4) try {
              const r3 = await createImageBitmap(new ImageData(new Uint8ClampedArray(i4), t3.width, t3.height)), s2 = { start: e3.start, end: e3.end, image: r3, position: { x: t3.x, y: t3.y } };
              d.info(oe, `Created image subtitle cue: ${t3.width}x${t3.height} (${e3.start.toFixed(2)}s - ${e3.end.toFixed(2)}s)`), this.onCue ? (d.debug(oe, "Calling onCue callback with image"), this.onCue(s2)) : (d.warn(oe, "No onCue callback set!"), r3.close());
            } catch (e4) {
              d.error(oe, "Failed to create ImageBitmap from subtitle", e4);
            }
            else d.warn(oe, "Failed to extract image data from subtitle");
          } else {
            const t4 = await this.bindings.getSubtitleText();
            if (d.debug(oe, `Decoded subtitle: text=${t4 ? `"${t4.substring(0, 50)}..."` : "null"}, times=${e3.start.toFixed(3)}s-${e3.end.toFixed(3)}s`), t4) {
              const i4 = { start: e3.start, end: e3.end, text: t4 };
              d.info(oe, `Created subtitle cue: "${t4.substring(0, 30)}..." (${e3.start.toFixed(2)}s - ${e3.end.toFixed(2)}s)`), this.onCue ? (d.debug(oe, "Calling onCue callback"), this.onCue(i4)) : d.warn(oe, "No onCue callback set!");
            } else d.warn(oe, "No text extracted from subtitle");
          }
          await this.bindings.freeSubtitle();
        } else -6 !== i3 && d.warn(oe, `Subtitle decode returned: ${i3}`);
      } catch (e3) {
        d.error(oe, "Subtitle decode error", e3), this.onError && this.onError(e3);
      }
    } else d.debug(oe, `Skipping decode: configured=${this.isConfigured}, bindings=${!!this.bindings}, track=${!!this.currentTrack}`);
  }
  setOnCue(e2) {
    this.onCue = e2;
  }
  setOnError(e2) {
    this.onError = e2;
  }
  close() {
    this.isConfigured = false, this.currentTrack = null, this.onCue = null, this.onError = null, d.debug(oe, "Closed");
  }
}
const he = "CanvasRenderer";
class CanvasRenderer {
  canvas;
  gl = null;
  program = null;
  texture = null;
  vao = null;
  width = 0;
  height = 0;
  colorSpace = "srgb";
  hasNativeHDRSupport = false;
  frameQueue = [];
  static MAX_FRAME_QUEUE = 120;
  hdrEnabled = true;
  isHDRSource = false;
  isHighBitDepth = false;
  _loggedFrameFormat = false;
  static AMBIENT_SIZE = 16;
  ambientFbo = null;
  ambientTex = null;
  ambientEnabled = false;
  ambientPixels = null;
  rafId = null;
  isPlaying = false;
  isVideoConfigured = false;
  _maxDpr = 2;
  _paintSamples = [];
  _adaptDprChecked = false;
  static PAINT_SAMPLE_COUNT = 60;
  static PAINT_THRESHOLD_MS = 8;
  _presentFpsCap = 0;
  _perfDegradeChecked = false;
  _perfWindowStart = 0;
  _perfWindowBaseCount = 0;
  _perfDeficitWindows = 0;
  _onPerformanceDegrade = null;
  static PERF_WINDOW_MS = 1e3;
  static PERF_DEFICIT_RATIO = 0.7;
  static PERF_DEFICIT_WINDOWS = 2;
  static PERF_WARMUP_FRAMES = 60;
  static PERF_MIN_CAP_FPS = 24;
  static PERF_MIN_ACHIEVED_FPS = 5;
  getAudioTime = null;
  _isAudioHealthy = null;
  presentationStartTime = 0;
  presentationStartPts = 0;
  lastPresentedPts = -1;
  syncedToAudio = false;
  lastKnownAudioTime = -1;
  playbackRate = 1;
  justSeeked = false;
  framesPresented = 0;
  currentTime = 0;
  videoFrameRate = 60;
  rotation = 0;
  metadataRotation = 0;
  manualRotation = 0;
  containerWidth = 0;
  containerHeight = 0;
  fitMode = "contain";
  letterboxColor = [0, 0, 0];
  letterboxTarget = [0, 0, 0];
  vr360Enabled = false;
  vrProgram = null;
  vrLocs = null;
  vrHalf = false;
  vrFisheye = false;
  vrStereoSbs = false;
  vrStereographic = false;
  static VR_FISHEYE_FOV = Math.PI;
  static VR_PLANET_SCALE = 0.5;
  vrTexAspect = 2;
  vrYaw = 0;
  vrPitch = 0;
  vrFov = 1.2217;
  vrYawTarget = 0;
  vrPitchTarget = 0;
  vrFovTarget = 1.2217;
  vrYawVel = 0;
  vrPitchVel = 0;
  vrAnimRaf = null;
  static VR_STIFFNESS = 210;
  static VR_DAMPING = 17;
  static VR_FOV_LERP = 0.22;
  static VR_DEFAULT_FOV = 1.2217;
  static VR_MIN_FOV = 0.5236;
  static VR_MAX_FOV = 2.0944;
  activeSubtitleCue = null;
  _lastRenderedSubtitleKey = "";
  _lastRenderedSubtitlePlain = "";
  _subtitleMeasureCanvas = null;
  _subtitleFontCache = null;
  _subtitleRerenderRafId = null;
  subtitleCues = [];
  subtitleOverlay = null;
  subtitleControlsPadding = 0;
  subtitleDelay = 0;
  currentScaleX = 0;
  currentScaleY = 0;
  lastTargetScaleX = 0;
  lastTargetScaleY = 0;
  fitAnimRafId = null;
  lastRenderedFrame = null;
  constructor(e2, t2) {
    this.canvas = e2, t2 && (this.subtitleOverlay = t2), d.debug(he, "Created");
  }
  detectHDRColorSpace(e2, t2) {
    const i2 = (e2 || "").toLowerCase(), r2 = (t2 || "").toLowerCase(), s2 = r2.includes("pq") || r2.includes("hlg") || r2.includes("smpte2084") || r2.includes("arib-std-b67"), a2 = i2.includes("bt2020") || i2.includes("rec2020");
    return this.hdrEnabled ? s2 || a2 ? (d.info(he, `HDR/BT.2020 content detected (primaries: ${e2}, transfer: ${t2}). Using display-p3 color space (if supported) for HDR.`), "display-p3") : i2.includes("p3") || i2.includes("display-p3") ? (d.info(he, "Wide Gamut (P3) content detected. Using display-p3 color space."), "display-p3") : "srgb" : "srgb";
  }
  configure(e2, t2, i2, r2, s2, a2, n2, o2) {
    this.isVideoConfigured = true;
    const h2 = (o2 || "").toLowerCase();
    if (this.isHighBitDepth = h2.includes("12") || h2.includes("14") || h2.includes("16"), this.isHighBitDepth && d.info(he, `High bit-depth content detected (${o2}), using RGBA16F texture`), 0 !== this.width && 0 !== this.height || (this.width = e2, this.height = t2, this.canvas.width = e2, this.canvas.height = t2), s2 && s2 > 0 ? (this.videoFrameRate = s2, d.debug(he, `Video frame rate: ${s2}fps (target: 60fps)`)) : this.videoFrameRate = 60, this._presentFpsCap = 0, this._perfDegradeChecked = false, this._perfWindowStart = 0, this._perfDeficitWindows = 0, void 0 !== a2 && (this.metadataRotation = a2, this.rotation = (this.metadataRotation + this.manualRotation) % 360, this.canvas instanceof HTMLCanvasElement && (this.canvas.style.transform = `rotate(${this.rotation}deg)`, this.canvas.style.transformOrigin = "center center"), d.debug(he, `Rotation set to: ${this.rotation}° (metadata: ${this.metadataRotation}°, manual: ${this.manualRotation}°)`)), this.lastPrimaries = i2, this.lastTransfer = r2, void 0 !== n2) this.isHDRSource = n2;
    else {
      const e3 = (i2 || "").toLowerCase(), t3 = (r2 || "").toLowerCase();
      d.debug(he, `Checking HDR support - Primaries: '${e3}', Transfer: '${t3}'`);
      const s3 = t3.includes("pq") || t3.includes("hlg") || t3.includes("smpte2084") || t3.includes("arib-std-b67"), a3 = e3.includes("bt2020") || e3.includes("rec2020");
      this.isHDRSource = s3 || a3;
    }
    const c2 = this.detectHDRColorSpace(i2, r2);
    try {
      const i3 = { alpha: false, desynchronized: false, antialias: false, depth: false, preserveDrawingBuffer: true };
      if (this.gl = this.canvas.getContext("webgl2", i3), !this.gl) return void d.error(he, "WebGL2 not supported");
      try {
        const e3 = !!window.chrome, t3 = (r2 || "").toLowerCase(), i4 = t3.includes("hlg") || t3.includes("arib-std-b67"), s3 = this.isHDRSource && this.hdrEnabled && e3, a3 = i4 ? "rec2100-hlg" : "rec2100-pq";
        if (void 0 !== this.gl.drawingBufferColorSpace) {
          let e4;
          if (e4 = s3 ? a3 : "srgb" !== c2 && ["srgb", "display-p3"].includes(c2) ? c2 : "srgb", "srgb" !== e4) {
            let t4 = null;
            try {
              this.gl.drawingBufferColorSpace = e4, this.gl.drawingBufferColorSpace === e4 && (t4 = e4);
            } catch (e5) {
            }
            if (!t4 && s3) {
              d.warn(he, `Browser rejected ${e4}. HDR canvas flag likely disabled — falling back to display-p3.`);
              try {
                this.gl.drawingBufferColorSpace = "display-p3", t4 = "display-p3";
              } catch (e5) {
                t4 = null;
              }
            }
            t4 && (this.gl.unpackColorSpace = t4, d.info(he, `WebGL drawing buffer color space set to: ${t4} (requested: ${c2}, HDR path: ${s3})`));
          }
        }
      } catch (e3) {
        d.warn(he, "Failed to set drawingBufferColorSpace on GL context", e3);
      }
      this.initWebGL(), this.vr360Enabled && !this.vrProgram && this.initVRProgram(), this.colorSpace = c2, d.info(he, `Configured WebGL2: ${e2}x${t2} (colorSpace: ${this.colorSpace})`);
    } catch (e3) {
      d.error(he, "Error configuring WebGL", e3);
    }
  }
  initWebGL() {
    if (!this.gl) return;
    const e2 = !!window.chrome;
    this.hasNativeHDRSupport = e2, d.info(he, `Browser detection: isChromium=${e2}, drawingBufferColorSpace=${void 0 !== this.gl.drawingBufferColorSpace}, hasNativeHDRSupport=${this.hasNativeHDRSupport}, isHDRSource=${this.isHDRSource}`), !this.hasNativeHDRSupport && this.isHDRSource ? (d.info(he, "Initializing WebGL with shader-based HDR tone mapping (non-Chromium)"), this.initWebGLWithHDR()) : (d.info(he, "Initializing WebGL with simple passthrough (Chromium native HDR)"), this.initWebGLSimple());
  }
  initWebGLSimple() {
    if (!this.gl) return;
    const e2 = this.gl, t2 = (t3, i3) => {
      const r3 = e2.createShader(t3);
      return r3 ? (e2.shaderSource(r3, i3), e2.compileShader(r3), e2.getShaderParameter(r3, e2.COMPILE_STATUS) ? r3 : (d.error(he, "Shader compile error:", e2.getShaderInfoLog(r3)), e2.deleteShader(r3), null)) : null;
    }, i2 = t2(e2.VERTEX_SHADER, "#version 300 es\n    layout(location = 0) in vec2 a_position;\n    layout(location = 1) in vec2 a_texCoord;\n    out vec2 v_texCoord;\n    void main() {\n      gl_Position = vec4(a_position, 0.0, 1.0);\n      v_texCoord = a_texCoord;\n    }"), r2 = t2(e2.FRAGMENT_SHADER, "#version 300 es\n    precision highp float;\n    uniform sampler2D u_image;\n    in vec2 v_texCoord;\n    out vec4 outColor;\n    void main() {\n      outColor = texture(u_image, v_texCoord);\n    }");
    if (!i2 || !r2) return;
    if (this.program = e2.createProgram(), !this.program) return;
    if (e2.attachShader(this.program, i2), e2.attachShader(this.program, r2), e2.linkProgram(this.program), !e2.getProgramParameter(this.program, e2.LINK_STATUS)) return void d.error(he, "Program link error:", e2.getProgramInfoLog(this.program));
    const s2 = new Float32Array([-1, 1, 0, 0, -1, -1, 0, 1, 1, 1, 1, 0, 1, -1, 1, 1]);
    this.vao = e2.createVertexArray(), e2.bindVertexArray(this.vao);
    const a2 = e2.createBuffer();
    if (e2.bindBuffer(e2.ARRAY_BUFFER, a2), e2.bufferData(e2.ARRAY_BUFFER, s2, e2.STATIC_DRAW), e2.enableVertexAttribArray(0), e2.vertexAttribPointer(0, 2, e2.FLOAT, false, 16, 0), e2.enableVertexAttribArray(1), e2.vertexAttribPointer(1, 2, e2.FLOAT, false, 16, 8), this.texture = e2.createTexture(), e2.bindTexture(e2.TEXTURE_2D, this.texture), e2.texParameteri(e2.TEXTURE_2D, e2.TEXTURE_WRAP_S, e2.CLAMP_TO_EDGE), e2.texParameteri(e2.TEXTURE_2D, e2.TEXTURE_WRAP_T, e2.CLAMP_TO_EDGE), e2.texParameteri(e2.TEXTURE_2D, e2.TEXTURE_MIN_FILTER, e2.LINEAR), e2.texParameteri(e2.TEXTURE_2D, e2.TEXTURE_MAG_FILTER, e2.LINEAR), !this.program) return;
    const n2 = e2.getUniformLocation(this.program, "u_image");
    n2 && this.program && (e2.useProgram(this.program), e2.uniform1i(n2, 0));
  }
  initWebGLWithHDR() {
    if (!this.gl) return;
    const e2 = this.gl, t2 = (t3, i3) => {
      const r3 = e2.createShader(t3);
      return r3 ? (e2.shaderSource(r3, i3), e2.compileShader(r3), e2.getShaderParameter(r3, e2.COMPILE_STATUS) ? r3 : (d.error(he, "Shader compile error:", e2.getShaderInfoLog(r3)), e2.deleteShader(r3), null)) : null;
    }, i2 = t2(e2.VERTEX_SHADER, "#version 300 es\n    layout(location = 0) in vec2 a_position;\n    layout(location = 1) in vec2 a_texCoord;\n    out vec2 v_texCoord;\n    void main() {\n      gl_Position = vec4(a_position, 0.0, 1.0);\n      v_texCoord = a_texCoord;\n    }"), r2 = t2(e2.FRAGMENT_SHADER, `#version 300 es
    precision highp float;
    uniform sampler2D u_image;
    uniform float u_hdrEnabled; // 0.0 = disabled, 1.0 = enabled
    in vec2 v_texCoord;
    out vec4 outColor;

    // PQ (SMPTE 2084) EOTF constants
    const float m1 = 2610.0 / 16384.0;
    const float m2 = 2523.0 / 4096.0 * 128.0;
    const float c1 = 3424.0 / 4096.0;
    const float c2 = 2413.0 / 4096.0 * 32.0;
    const float c3 = 2392.0 / 4096.0 * 32.0;

    vec3 PQtoLinear(vec3 pq) {
      vec3 colToPow = pow(pq, vec3(1.0 / m2));
      vec3 num = max(colToPow - c1, vec3(0.0));
      vec3 den = c2 - c3 * colToPow;
      return pow(num / den, vec3(1.0 / m1));
    }

    vec3 toneMapReinhard(vec3 hdr, float exposure) {
      vec3 mapped = hdr * exposure;
      return mapped / (1.0 + mapped);
    }

    vec3 adjustSaturation(vec3 color, float saturation) {
      float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
      vec3 gray = vec3(luminance);
      return mix(gray, color, saturation);
    }

    void main() {
      vec4 color = texture(u_image, v_texCoord);

      // Apply PQ EOTF to get linear light
      vec3 linear = PQtoLinear(color.rgb);

      // Tone map to SDR range.
      // Reinhard's x/(1+x) curve gets steep fast — every extra unit of
      // exposure pushes mid-tones harder toward white, which reads as
      // crushed highlights + boosted contrast on most SDR displays.
      // The HDR-on path used to push exposure to 35.0 to "match Chrome
      // native HDR vibrance"; in practice that overshot native, with
      // visible extra contrast vs the <video> tag on the compare page.
      // 26.0 keeps the HDR path noticeably punchier than HDR-off (22.0)
      // without crushing highlights past where Chrome's compositor
      // lands.
      float exposure = mix(22.0, 26.0, u_hdrEnabled);
      vec3 sdr = toneMapReinhard(linear, exposure);

      // Saturation boost. 1.5 read as oversaturated next to native;
      // 1.25 keeps the wide-gamut feel without the cartoonish punch.
      float saturation = mix(1.1, 1.25, u_hdrEnabled);
      sdr = adjustSaturation(sdr, saturation);

      // Apply gamma (2.2 for accurate color reproduction)
      vec3 display = pow(sdr, vec3(1.0/2.2));

      outColor = vec4(display, color.a);
    }`);
    if (!i2 || !r2) return;
    if (this.program = e2.createProgram(), !this.program) return;
    if (e2.attachShader(this.program, i2), e2.attachShader(this.program, r2), e2.linkProgram(this.program), !e2.getProgramParameter(this.program, e2.LINK_STATUS)) return void d.error(he, "Program link error:", e2.getProgramInfoLog(this.program));
    const s2 = new Float32Array([-1, 1, 0, 0, -1, -1, 0, 1, 1, 1, 1, 0, 1, -1, 1, 1]);
    this.vao = e2.createVertexArray(), e2.bindVertexArray(this.vao);
    const a2 = e2.createBuffer();
    if (e2.bindBuffer(e2.ARRAY_BUFFER, a2), e2.bufferData(e2.ARRAY_BUFFER, s2, e2.STATIC_DRAW), e2.enableVertexAttribArray(0), e2.vertexAttribPointer(0, 2, e2.FLOAT, false, 16, 0), e2.enableVertexAttribArray(1), e2.vertexAttribPointer(1, 2, e2.FLOAT, false, 16, 8), this.texture = e2.createTexture(), e2.bindTexture(e2.TEXTURE_2D, this.texture), e2.texParameteri(e2.TEXTURE_2D, e2.TEXTURE_WRAP_S, e2.CLAMP_TO_EDGE), e2.texParameteri(e2.TEXTURE_2D, e2.TEXTURE_WRAP_T, e2.CLAMP_TO_EDGE), e2.texParameteri(e2.TEXTURE_2D, e2.TEXTURE_MIN_FILTER, e2.LINEAR), e2.texParameteri(e2.TEXTURE_2D, e2.TEXTURE_MAG_FILTER, e2.LINEAR), !this.program) return;
    e2.useProgram(this.program);
    const n2 = e2.getUniformLocation(this.program, "u_image");
    n2 && e2.uniform1i(n2, 0);
    const o2 = e2.getUniformLocation(this.program, "u_hdrEnabled");
    o2 && (e2.uniform1f(o2, this.hdrEnabled ? 1 : 0), d.debug(he, "Set u_hdrEnabled uniform to: " + (this.hdrEnabled ? 1 : 0)));
  }
  initVRProgram() {
    if (this.vrProgram) return true;
    if (!this.gl) return false;
    const e2 = this.gl, t2 = (t3, i3) => {
      const r3 = e2.createShader(t3);
      return r3 ? (e2.shaderSource(r3, i3), e2.compileShader(r3), e2.getShaderParameter(r3, e2.COMPILE_STATUS) ? r3 : (d.error(he, "VR shader compile error:", e2.getShaderInfoLog(r3)), e2.deleteShader(r3), null)) : null;
    }, i2 = t2(e2.VERTEX_SHADER, "#version 300 es\n    layout(location = 0) in vec2 a_position;\n    out vec2 v_ndc;\n    void main() {\n      v_ndc = a_position;\n      gl_Position = vec4(a_position, 0.0, 1.0);\n    }"), r2 = t2(e2.FRAGMENT_SHADER, `#version 300 es
    precision highp float;
    uniform sampler2D u_image;
    uniform float u_yaw;     // radians, look left/right
    uniform float u_pitch;   // radians, look up/down
    uniform float u_fov;     // vertical field of view (radians)
    uniform float u_aspect;  // viewport width / height
    uniform float u_lonDiv;  // longitude span (radians): 2π for 360, π for VR180
    uniform float u_latDiv;  // latitude span (radians), derived from source aspect
    uniform float u_proj;    // 0 = equirectangular, 1 = fisheye, 2 = stereographic
    uniform float u_fishFov; // fisheye coverage (radians), e.g. π for a 180° lens
    uniform float u_uScale;  // eye selection: 1 = full width, 0.5 = one SBS eye
    uniform float u_uOffset; // 0 = left eye, 0.5 = right eye
    uniform float u_planetScale; // stereographic: image radius of the horizon
    uniform float u_srcAspect;   // source frame width/height (keeps the disc round)
    in vec2 v_ndc;
    out vec4 outColor;

    const float PI = 3.14159265358979323846;

    void main() {
      // Camera-space ray: -z forward, scaled by the half-FOV tangent so the
      // vertical FOV matches u_fov and the horizontal FOV follows the aspect.
      float t = tan(u_fov * 0.5);
      vec3 dir = normalize(vec3(v_ndc.x * t * u_aspect, v_ndc.y * t, -1.0));

      // Rotate the ray by pitch (about X), then yaw (about Y).
      float cp = cos(u_pitch), sp = sin(u_pitch);
      dir = vec3(dir.x, cp * dir.y - sp * dir.z, sp * dir.y + cp * dir.z);
      float cy = cos(u_yaw), sy = sin(u_yaw);
      dir = vec3(cy * dir.x + sy * dir.z, dir.y, -sy * dir.x + cy * dir.z);

      // Map the ray to a position inside ONE eye's 0..1 square.
      vec2 eye;
      if (u_proj < 0.5) {
        // Equirectangular: longitude across X, latitude up Y. Spans come from
        // the source so pixels stay square (a 2:1 frame → 180° vertical, etc.).
        float lon = atan(dir.x, -dir.z);
        float lat = asin(clamp(dir.y, -1.0, 1.0));
        eye = vec2(lon / u_lonDiv + 0.5, 0.5 - lat / u_latDiv);
      } else if (u_proj < 1.5) {
        // Equidistant fisheye: angle θ from the forward axis maps to a radius,
        // azimuth φ to the angle around the circle inscribed in the square.
        float theta = acos(clamp(-dir.z, -1.0, 1.0));
        float phi = atan(dir.y, dir.x);
        float r = theta / (u_fishFov * 0.5); // 0 at centre, 1 at the lens edge
        eye = vec2(0.5 + 0.5 * r * cos(phi), 0.5 - 0.5 * r * sin(phi));
      } else {
        // Stereographic "little planet": nadir (straight down) sits at the disc
        // centre, the horizon on a circle and the zenith out toward the rim.
        // Inverse-project: angle a from nadir → image radius r = tan(a/2),
        // azimuth around the vertical axis. Divide x by the source aspect so a
        // disc that's circular in pixels stays circular here.
        float a = acos(clamp(-dir.y, -1.0, 1.0)); // 0 down → π up
        float az = atan(dir.z, dir.x);
        float r = tan(a * 0.5) * u_planetScale;
        // +sin so tilting up samples toward the image top (where the zenith/sky
        // sits in a tiny-planet), keeping the scene right-side up.
        eye = vec2(0.5 + r * cos(az) / u_srcAspect, 0.5 + r * sin(az));
      }

      // Pick the eye half for side-by-side stereo (full width when mono). The
      // camera is clamped to the content and S/T wrap is CLAMP_TO_EDGE, so the
      // edge never shows a black void.
      vec2 uv = vec2(eye.x * u_uScale + u_uOffset, eye.y);
      outColor = texture(u_image, uv);
    }`);
    if (!i2 || !r2) return false;
    const s2 = e2.createProgram();
    return !!s2 && (e2.attachShader(s2, i2), e2.attachShader(s2, r2), e2.linkProgram(s2), e2.getProgramParameter(s2, e2.LINK_STATUS) ? (this.vrProgram = s2, this.vrLocs = { image: e2.getUniformLocation(s2, "u_image"), yaw: e2.getUniformLocation(s2, "u_yaw"), pitch: e2.getUniformLocation(s2, "u_pitch"), fov: e2.getUniformLocation(s2, "u_fov"), aspect: e2.getUniformLocation(s2, "u_aspect"), lonDiv: e2.getUniformLocation(s2, "u_lonDiv"), latDiv: e2.getUniformLocation(s2, "u_latDiv"), proj: e2.getUniformLocation(s2, "u_proj"), fishFov: e2.getUniformLocation(s2, "u_fishFov"), uScale: e2.getUniformLocation(s2, "u_uScale"), uOffset: e2.getUniformLocation(s2, "u_uOffset"), planetScale: e2.getUniformLocation(s2, "u_planetScale"), srcAspect: e2.getUniformLocation(s2, "u_srcAspect") }, e2.useProgram(s2), this.vrLocs.image && e2.uniform1i(this.vrLocs.image, 0), d.info(he, "VR 360° equirectangular program compiled"), true) : (d.error(he, "VR program link error:", e2.getProgramInfoLog(s2)), e2.deleteProgram(s2), false));
  }
  drawVRFrame(e2, t2) {
    e2.viewport(0, 0, this.width, this.height), e2.clearColor(0, 0, 0, 1), e2.clear(e2.COLOR_BUFFER_BIT), e2.texParameteri(e2.TEXTURE_2D, e2.TEXTURE_WRAP_S, this.vrHalf || this.vrStereographic ? e2.CLAMP_TO_EDGE : e2.REPEAT), t2.displayHeight > 0 && (this.vrTexAspect = t2.displayWidth / t2.displayHeight);
    const i2 = this.vrStereoSbs ? this.vrTexAspect / 2 : this.vrTexAspect, r2 = this.vrHalf ? Math.PI : 2 * Math.PI, s2 = Math.min(Math.PI, r2 / i2);
    e2.useProgram(this.vrProgram), e2.bindVertexArray(this.vao);
    const a2 = this.vrLocs;
    a2.yaw && e2.uniform1f(a2.yaw, this.vrYaw), a2.pitch && e2.uniform1f(a2.pitch, this.vrPitch), a2.fov && e2.uniform1f(a2.fov, this.vrFov), a2.aspect && e2.uniform1f(a2.aspect, this.height > 0 ? this.width / this.height : 1), a2.lonDiv && e2.uniform1f(a2.lonDiv, r2), a2.latDiv && e2.uniform1f(a2.latDiv, s2);
    const n2 = this.vrStereographic ? 2 : this.vrFisheye ? 1 : 0;
    a2.proj && e2.uniform1f(a2.proj, n2), a2.fishFov && e2.uniform1f(a2.fishFov, CanvasRenderer.VR_FISHEYE_FOV), a2.uScale && e2.uniform1f(a2.uScale, this.vrStereoSbs ? 0.5 : 1), a2.uOffset && e2.uniform1f(a2.uOffset, 0), a2.planetScale && e2.uniform1f(a2.planetScale, CanvasRenderer.VR_PLANET_SCALE), a2.srcAspect && e2.uniform1f(a2.srcAspect, this.vrTexAspect || 1), e2.drawArrays(e2.TRIANGLE_STRIP, 0, 4);
  }
  sampleAdaptiveDpr(e2) {
    if (this._adaptDprChecked || e2 <= 0) return;
    const t2 = performance.now() - e2;
    if (this._paintSamples.push(t2), this._paintSamples.length >= CanvasRenderer.PAINT_SAMPLE_COUNT) {
      const e3 = this._paintSamples.reduce((e4, t3) => e4 + t3, 0) / this._paintSamples.length;
      e3 > CanvasRenderer.PAINT_THRESHOLD_MS && this._maxDpr > 1 && this.containerWidth > 0 && this.containerHeight > 0 && (d.info(he, `Adaptive DPR: avg paint ${e3.toFixed(1)}ms over ${this._paintSamples.length} frames > ${CanvasRenderer.PAINT_THRESHOLD_MS}ms threshold — capping DPR to 1x`), this._maxDpr = 1, this.resize(this.containerWidth, this.containerHeight)), this._adaptDprChecked = true, this._paintSamples = [];
    }
  }
  setOnPerformanceDegrade(e2) {
    this._onPerformanceDegrade = e2;
  }
  samplePerformance() {
    if (this._perfDegradeChecked || !this.isPlaying) return;
    if (Math.abs(this.playbackRate - 1) > 0.05) return void (this._perfWindowStart = 0);
    if (this.framesPresented <= CanvasRenderer.PERF_WARMUP_FRAMES) return this._perfWindowStart = 0, void (this._perfDeficitWindows = 0);
    const e2 = performance.now();
    if (0 === this._perfWindowStart) return this._perfWindowStart = e2, void (this._perfWindowBaseCount = this.framesPresented);
    const t2 = e2 - this._perfWindowStart;
    if (t2 < CanvasRenderer.PERF_WINDOW_MS) return;
    const i2 = this.framesPresented - this._perfWindowBaseCount, r2 = i2 / (t2 / 1e3), s2 = this.videoFrameRate * (t2 / 1e3), a2 = !this._isAudioHealthy || this._isAudioHealthy(), n2 = r2 >= CanvasRenderer.PERF_MIN_ACHIEVED_FPS;
    a2 && n2 && s2 > 0 && i2 < s2 * CanvasRenderer.PERF_DEFICIT_RATIO ? (this._perfDeficitWindows++, this._perfDeficitWindows >= CanvasRenderer.PERF_DEFICIT_WINDOWS && this.engagePresentCap(i2 / (t2 / 1e3))) : this._perfDeficitWindows = 0, this._perfWindowStart = e2, this._perfWindowBaseCount = this.framesPresented;
  }
  engagePresentCap(e2) {
    this._perfDegradeChecked = true;
    const t2 = Math.max(CanvasRenderer.PERF_MIN_CAP_FPS, Math.round(this.videoFrameRate / 2));
    if (!(t2 >= this.videoFrameRate)) {
      this._presentFpsCap = t2, d.info(he, `Adaptive FPS: sustained ~${e2.toFixed(0)}/${this.videoFrameRate}fps — capping presentation to ${t2}fps`);
      try {
        this._onPerformanceDegrade?.(t2);
      } catch {
      }
    }
  }
  setVR360(e2) {
    this.vr360Enabled !== e2 && (this.vr360Enabled = e2, e2 ? (this.gl && this.initVRProgram(), this.vrYawTarget = this.vrYaw, this.vrPitchTarget = this.vrPitch, this.vrFovTarget = this.vrFov, this.vrYawVel = 0, this.vrPitchVel = 0) : this.gl && this.texture && (this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture), this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE)), this.redrawForVR(), d.info(he, "360° VR " + (e2 ? "enabled" : "disabled")));
  }
  isVR360Enabled() {
    return this.vr360Enabled;
  }
  getCurrentFrame() {
    return this.lastRenderedFrame;
  }
  getVRView() {
    return this.vr360Enabled ? { yaw: this.vrYaw, pitch: this.vrPitch, fov: this.vrFov, aspect: this.height > 0 ? this.width / this.height : 16 / 9, half: this.vrHalf, fisheye: this.vrFisheye, sbs: this.vrStereoSbs, stereographic: this.vrStereographic, texAspect: this.vrTexAspect } : null;
  }
  setVRProjection(e2, t2 = false, i2 = false, r2 = false) {
    if (this.vrHalf === e2 && this.vrFisheye === t2 && this.vrStereoSbs === i2 && this.vrStereographic === r2) return;
    const s2 = r2 && !this.vrStereographic;
    this.vrHalf = e2, this.vrFisheye = t2, this.vrStereoSbs = i2, this.vrStereographic = r2, s2 && (this.vrPitch = this.vrPitchTarget = -1.35, this.vrYaw = this.vrYawTarget = 0, this.vrPitchVel = this.vrYawVel = 0), this.clampVRCamera(), this.redrawForVR();
  }
  clampVRCamera() {
    if (!this.vrHalf) return;
    const e2 = this.vrStereoSbs ? this.vrTexAspect / 2 : this.vrTexAspect, t2 = Math.PI, i2 = this.vrFisheye ? Math.PI : Math.min(Math.PI, t2 / e2), r2 = Math.min(CanvasRenderer.VR_MAX_FOV, i2);
    this.vrFovTarget > r2 && (this.vrFovTarget = r2), this.vrFov > r2 && (this.vrFov = r2);
    const s2 = this.height > 0 ? this.width / this.height : 16 / 9, a2 = 0.5 * this.vrFov, n2 = Math.atan(Math.tan(a2) * s2), o2 = Math.max(0, 0.5 * t2 - n2), h2 = Math.max(0, 0.5 * i2 - a2), d2 = (e3, t3, i3) => {
      let r3 = e3, s3 = false;
      return r3 > i3 ? (r3 = i3, s3 = true) : r3 < -i3 && (r3 = -i3, s3 = true), [r3, Math.max(-i3, Math.min(i3, t3)), s3];
    };
    let c2, u2;
    [this.vrYaw, this.vrYawTarget, c2] = d2(this.vrYaw, this.vrYawTarget, o2), [this.vrPitch, this.vrPitchTarget, u2] = d2(this.vrPitch, this.vrPitchTarget, h2), c2 && (this.vrYawVel = 0), u2 && (this.vrPitchVel = 0);
  }
  nudgeVR360(e2, t2, i2) {
    if (!this.vr360Enabled) return;
    const r2 = this.vrFov / Math.max(1, i2);
    this.vrYawTarget += e2 * r2, this.vrPitchTarget += t2 * r2;
    const s2 = Math.PI / 2 - 0.01;
    this.vrPitchTarget = Math.max(-s2, Math.min(s2, this.vrPitchTarget)), this.clampVRCamera(), this.ensureVRAnimating();
  }
  zoomVR360(e2) {
    this.vr360Enabled && (this.vrFovTarget = Math.max(CanvasRenderer.VR_MIN_FOV, Math.min(CanvasRenderer.VR_MAX_FOV, this.vrFovTarget + 15e-4 * e2)), this.clampVRCamera(), this.ensureVRAnimating());
  }
  resetVRView() {
    this.vrYawTarget = 0, this.vrPitchTarget = 0, this.vrFovTarget = CanvasRenderer.VR_DEFAULT_FOV, this.clampVRCamera(), this.ensureVRAnimating();
  }
  stepVRCamera(e2) {
    const t2 = CanvasRenderer.VR_STIFFNESS, i2 = CanvasRenderer.VR_DAMPING, r2 = t2 * (this.vrYawTarget - this.vrYaw) - i2 * this.vrYawVel;
    this.vrYawVel += r2 * e2, this.vrYaw += this.vrYawVel * e2;
    const s2 = t2 * (this.vrPitchTarget - this.vrPitch) - i2 * this.vrPitchVel;
    this.vrPitchVel += s2 * e2, this.vrPitch += this.vrPitchVel * e2, this.vrFov += (this.vrFovTarget - this.vrFov) * CanvasRenderer.VR_FOV_LERP, this.clampVRCamera();
    const a2 = Math.abs(this.vrYawTarget - this.vrYaw) < 1e-4 && Math.abs(this.vrPitchTarget - this.vrPitch) < 1e-4 && Math.abs(this.vrYawVel) < 1e-3 && Math.abs(this.vrPitchVel) < 1e-3 && Math.abs(this.vrFovTarget - this.vrFov) < 1e-4;
    return a2 && (this.vrYaw = this.vrYawTarget, this.vrPitch = this.vrPitchTarget, this.vrFov = this.vrFovTarget, this.vrYawVel = 0, this.vrPitchVel = 0), a2;
  }
  ensureVRAnimating() {
    if (null !== this.vrAnimRaf) return;
    const e2 = () => {
      if (this.vrAnimRaf = null, !this.vr360Enabled) return;
      const t2 = this.stepVRCamera(1 / 60);
      if (!this.isPlaying && this.lastRenderedFrame) try {
        this.drawFrame(this.lastRenderedFrame, true);
      } catch (e3) {
        d.debug(he, "VR spring redraw skipped", e3);
      }
      t2 || (this.vrAnimRaf = requestAnimationFrame(e2));
    };
    this.vrAnimRaf = requestAnimationFrame(e2);
  }
  redrawForVR() {
    if (this.lastRenderedFrame) try {
      this.drawFrame(this.lastRenderedFrame, true);
    } catch (e2) {
      d.debug(he, "VR redraw skipped", e2);
    }
  }
  renderPosterImage(e2) {
    if (!this.gl || !this.program || !this.texture) return;
    let t2;
    try {
      t2 = new VideoFrame(e2, { timestamp: 0 });
    } catch (e3) {
      return void d.warn(he, "Failed to wrap poster image as VideoFrame", e3);
    }
    try {
      this.render(t2);
    } finally {
      t2.close();
    }
  }
  lastPrimaries;
  lastTransfer;
  setHDREnabled(e2) {
    if (this.hdrEnabled === e2) return;
    this.hdrEnabled = e2, d.info(he, `HDR manual override set to: ${e2}`);
    const t2 = this.detectHDRColorSpace(this.lastPrimaries, this.lastTransfer);
    if (this.gl && void 0 !== this.gl.drawingBufferColorSpace) try {
      const e3 = !!window.chrome, i2 = (this.lastTransfer || "").toLowerCase(), r2 = i2.includes("hlg") || i2.includes("arib-std-b67"), s2 = this.isHDRSource && this.hdrEnabled && e3;
      let a2;
      a2 = s2 ? r2 ? "rec2100-hlg" : "rec2100-pq" : "srgb" !== t2 && ["srgb", "display-p3"].includes(t2) ? t2 : "srgb";
      let n2 = null;
      try {
        this.gl.drawingBufferColorSpace = a2, this.gl.drawingBufferColorSpace === a2 && (n2 = a2);
      } catch (e4) {
      }
      if (!n2 && s2) {
        d.warn(he, `Browser rejected ${a2} on toggle. HDR canvas flag likely disabled — falling back to display-p3.`);
        try {
          this.gl.drawingBufferColorSpace = "display-p3", n2 = "display-p3";
        } catch (e4) {
          n2 = null;
        }
      }
      n2 && (this.gl.unpackColorSpace = n2, this.colorSpace = n2 === a2 ? t2 : n2, d.info(he, `Updated WebGL color space to ${n2} (detected: ${t2}, HDR path: ${s2}) following HDR toggle`));
    } catch (e3) {
      d.warn(he, "Failed to update drawingBufferColorSpace on the fly");
    }
    if (this.gl && this.program && !this.hasNativeHDRSupport && this.isHDRSource) {
      const t3 = this.gl.getUniformLocation(this.program, "u_hdrEnabled");
      t3 && (this.gl.useProgram(this.program), this.gl.uniform1f(t3, e2 ? 1 : 0), d.debug(he, "Updated u_hdrEnabled uniform to: " + (e2 ? 1 : 0)));
    }
    !this.isPlaying && this.lastRenderedFrame && this.drawFrame(this.lastRenderedFrame, true);
  }
  isHDRSupported() {
    return this.isHDRSource;
  }
  resize(e2, t2, i2 = false) {
    if (e2 > 0 && t2 > 0) {
      i2 || (this.containerWidth = e2, this.containerHeight = t2), d.debug(he, `Resizing to: ${e2}x${t2} (Rotation: ${this.rotation}°)`);
      const r2 = this.rotation % 180 != 0, s2 = r2 ? t2 : e2, a2 = r2 ? e2 : t2, n2 = Math.min("undefined" != typeof window && window.devicePixelRatio || 1, this._maxDpr), o2 = Math.round(s2 * n2), h2 = Math.round(a2 * n2), c2 = this.width !== o2 || this.height !== h2;
      if (this.width = o2, this.height = h2, this.canvas.width = o2, this.canvas.height = h2, this.canvas instanceof HTMLCanvasElement && (r2 ? (this.canvas.style.setProperty("width", `${s2}px`, "important"), this.canvas.style.setProperty("height", `${a2}px`, "important"), this.canvas.style.position = "absolute", this.canvas.style.top = "50%", this.canvas.style.left = "50%", this.canvas.style.margin = "0", "contain" === this.fitMode && (this.canvas.style.setProperty("max-width", "none", "important"), this.canvas.style.setProperty("max-height", "none", "important")), this.canvas.style.transform = `translate(-50%, -50%) rotate(${this.rotation}deg)`, this.canvas.style.transformOrigin = "center center") : (this.canvas.style.position = "relative", this.canvas.style.top = "", this.canvas.style.left = "", this.canvas.style.margin = "", this.canvas.style.setProperty("width", "100%", "important"), this.canvas.style.setProperty("height", "100%", "important"), this.canvas.style.setProperty("max-width", "none", "important"), this.canvas.style.setProperty("max-height", "none", "important"), this.canvas.style.transformOrigin = "center center", this.canvas.style.transform = 180 === this.rotation ? "rotate(180deg)" : "none")), !this.gl) {
        const e3 = { alpha: false, desynchronized: false };
        this.gl = this.canvas.getContext("webgl2", e3), this.initWebGL();
      }
      try {
        c2 && (this.currentScaleX = 0, this.currentScaleY = 0, this.frameQueue.length > 0 ? this.drawFrame(this.frameQueue[0], true) : this.lastRenderedFrame && this.drawFrame(this.lastRenderedFrame, true));
      } catch (e3) {
        d.error(he, "Error redrawing frame after resize", e3);
      }
      if (this.subtitleOverlay) {
        const i3 = ((this.rotation ?? 0) % 360 + 360) % 360, r3 = 90 === i3 || 270 === i3, s3 = r3 ? t2 : e2, a3 = r3 ? e2 : t2, n3 = CanvasRenderer.computeSubtitleBottomPadding(a3);
        this.subtitleOverlay.style.position = "absolute", this.subtitleOverlay.style.right = "auto", this.subtitleOverlay.style.bottom = "auto", this.subtitleOverlay.style.width = `${s3}px`, this.subtitleOverlay.style.height = `${a3}px`, this.subtitleOverlay.style.left = (e2 - s3) / 2 + "px", this.subtitleOverlay.style.top = (t2 - a3) / 2 + "px", this.subtitleOverlay.style.margin = "0", this.subtitleOverlay.style.padding = "0";
        const o3 = this.subtitleControlsPadding > 0 ? this.subtitleControlsPadding : n3;
        this.subtitleOverlay.style.paddingBottom = `${o3}px`, this.subtitleOverlay.style.display = "flex", this.subtitleOverlay.style.flexDirection = "column", this.subtitleOverlay.style.justifyContent = "flex-end", this.subtitleOverlay.style.alignItems = "center", this.subtitleOverlay.style.transformOrigin = "center center", this.subtitleOverlay.style.transform = i3 ? `rotate(${i3}deg)` : "none", this.subtitleOverlay.style.boxSizing = "border-box", this.activeSubtitleCue && c2 && this.scheduleSubtitleRerender();
      }
    }
  }
  setLetterboxColor(e2, t2, i2) {
    this.letterboxTarget = [e2, t2, i2];
  }
  setFitMode(e2) {
    this.fitMode = e2, d.debug(he, `Fit mode set to: ${e2}`), this.rotation % 180 != 0 && this.canvas instanceof HTMLCanvasElement && "contain" === e2 && (this.canvas.style.setProperty("max-width", "none", "important"), this.canvas.style.setProperty("max-height", "none", "important")), this.lastRenderedFrame && this.startFitAnimation();
  }
  startFitAnimation() {
    if (null !== this.fitAnimRafId) return;
    const e2 = () => {
      this.fitAnimRafId = null, this.lastRenderedFrame && (this.drawFrame(this.lastRenderedFrame, false), Math.abs(this.currentScaleX - this.lastTargetScaleX) < 1e-4 && Math.abs(this.currentScaleY - this.lastTargetScaleY) < 1e-4 || (this.fitAnimRafId = requestAnimationFrame(e2)));
    };
    this.fitAnimRafId = requestAnimationFrame(e2);
  }
  setAudioTimeProvider(e2, t2) {
    this.getAudioTime = e2, this._isAudioHealthy = t2 || null, e2 ? d.debug(he, "Audio time provider set") : (d.debug(he, "Audio time provider disabled - video running independently"), this.syncedToAudio = false);
  }
  queueFrame(e2) {
    if (this.frameQueue.length >= 10 * CanvasRenderer.MAX_FRAME_QUEUE) return e2.close(), void d.warn(he, `Frame queue overflow, dropping frame. Queue size: ${this.frameQueue.length}`);
    const t2 = e2.timestamp;
    if (this.frameQueue.length > 0) if (t2 >= this.frameQueue[this.frameQueue.length - 1].timestamp) this.frameQueue.push(e2);
    else {
      let i2 = 0, r2 = this.frameQueue.length;
      for (; i2 < r2; ) {
        const e3 = Math.floor((i2 + r2) / 2);
        this.frameQueue[e3].timestamp <= t2 ? i2 = e3 + 1 : r2 = e3;
      }
      this.frameQueue.splice(i2, 0, e2);
    }
    else this.frameQueue.push(e2);
  }
  render(e2) {
    this.drawFrame(e2), this.lastRenderedFrame && this.lastRenderedFrame.close();
    try {
      this.lastRenderedFrame = e2.clone();
    } catch {
      this.lastRenderedFrame = null;
    }
  }
  startPresentationLoop() {
    this.isVideoConfigured && null === this.rafId && (this.isPlaying = true, this.presentationStartTime = performance.now(), 0 === this.frameQueue.length ? (this.lastPresentedPts = -1, this.framesPresented = 0, this.syncedToAudio = false) : (this.lastPresentedPts >= 0 ? this.presentationStartPts = this.lastPresentedPts : this.presentationStartPts = this.frameQueue[0].timestamp / 1e6, this.syncedToAudio = false), this.presentationLoop(), d.debug(he, "Presentation loop started"));
  }
  stopPresentationLoop() {
    this.isPlaying = false, null !== this.rafId && (cancelAnimationFrame(this.rafId), this.rafId = null), d.debug(he, "Presentation loop stopped");
  }
  presentationLoop = () => {
    if (!this.isPlaying) return void (this.rafId = null);
    this.rafId = requestAnimationFrame(this.presentationLoop), this.samplePerformance();
    let e2 = this.getCurrentPlaybackTime();
    if (e2 < 0 && this.lastPresentedPts < 0 && this.frameQueue.length > 0 && (e2 = 0), 0 === this.frameQueue.length) return this.updateActiveSubtitle(), void this.renderSubtitles();
    const t2 = this.selectFrameForPresentation(e2);
    if (!t2 && 0 === this._presentFpsCap && this.videoFrameRate >= 60 && this.frameQueue.length > 0) {
      const t3 = this.frameQueue[0], i2 = t3.timestamp / 1e6, r2 = 1 / this.videoFrameRate;
      if (i2 - e2 <= r2 && e2 - i2 <= 2 * r2) {
        this.drawFrame(t3), this.lastRenderedFrame && this.lastRenderedFrame.close();
        try {
          this.lastRenderedFrame = t3.clone();
        } catch (e3) {
          this.lastRenderedFrame = null;
        }
        return t3.close(), this.frameQueue.shift(), this.lastPresentedPts = i2, this.currentTime = i2, void this.framesPresented++;
      }
    }
    if (t2) {
      this.drawFrame(t2), this.lastRenderedFrame && this.lastRenderedFrame.close();
      try {
        this.lastRenderedFrame = t2.clone();
      } catch (e4) {
        this.lastRenderedFrame = null;
      }
      t2.close();
      const e3 = this.frameQueue.findIndex((e4) => e4 === t2);
      e3 >= 0 && this.frameQueue.splice(e3, 1);
    }
    this.updateActiveSubtitle(), this.renderSubtitles();
  };
  getCurrentPlaybackTime() {
    if (!this.isPlaying) return this.lastPresentedPts >= 0 ? this.lastPresentedPts : this.presentationStartPts > 0 ? this.presentationStartPts : -1;
    let e2 = -1;
    if (this.presentationStartTime > 0) {
      const t2 = (performance.now() - this.presentationStartTime) / 1e3;
      e2 = this.presentationStartPts + t2 * this.playbackRate;
    }
    if (this.getAudioTime) {
      const t2 = this.getAudioTime(), i2 = !this._isAudioHealthy || this._isAudioHealthy();
      if (t2 >= 0 && (this.lastKnownAudioTime = t2), t2 >= 0 && i2) {
        if (!this.syncedToAudio) {
          const i4 = e2 >= 0 ? Math.abs(e2 - t2) : 0, r3 = this.framesPresented <= 3;
          if (e2 < 0 || r3 && i4 > 0.03 || i4 > 0.4) return this.presentationStartTime = performance.now(), this.presentationStartPts = t2, this.syncedToAudio = true, d.debug(he, `Initial A/V sync: audioTime=${t2.toFixed(3)}s, framesPresented=${this.framesPresented}, drift=${(1e3 * i4).toFixed(0)}ms, early=${r3}`), t2;
          this.syncedToAudio = true, d.debug(he, `Soft A/V sync (no reset): videoTime=${e2.toFixed(3)}s, audioTime=${t2.toFixed(3)}s, framesPresented=${this.framesPresented}, drift=${(1e3 * i4).toFixed(0)}ms`);
        }
        const i3 = this.playbackRate < 0.99 && this.videoFrameRate >= 50;
        if (e2 >= 0 && this.framesPresented > 30) {
          const r3 = e2 - t2, s2 = i3 ? 0.05 : 0.15, a2 = i3 ? 0.5 : 0.25;
          Math.abs(r3) > s2 && (this.presentationStartPts -= r3 * a2);
        }
        const r2 = (performance.now() - this.presentationStartTime) / 1e3;
        return this.presentationStartPts + r2 * this.playbackRate;
      }
    }
    return this.playbackRate < 0.99 && this.videoFrameRate >= 50 && e2 >= 0 && this.lastKnownAudioTime >= 0 && this.syncedToAudio ? Math.min(e2, this.lastKnownAudioTime + 0.15) : e2 >= 0 ? e2 : -1;
  }
  selectFrameForPresentation(e2) {
    if (0 === this.frameQueue.length) return null;
    const t2 = 1 / this.videoFrameRate;
    if (this.lastPresentedPts < 0 && this.frameQueue.length > 0) {
      if (this.getAudioTime) {
        const e4 = this.getAudioTime();
        if (e4 >= 0) {
          const t3 = 0.2;
          for (; this.frameQueue.length > 1; ) {
            const i3 = this.frameQueue[0];
            if (!(i3.timestamp / 1e6 < e4 - t3)) break;
            i3.close(), this.frameQueue.shift();
          }
        }
      }
      const e3 = this.frameQueue.shift();
      return this.lastPresentedPts = e3.timestamp / 1e6, this.currentTime = this.lastPresentedPts, this.framesPresented = 1, this.presentationStartTime = performance.now(), this.presentationStartPts = this.lastPresentedPts, this.syncedToAudio = false, d.debug(he, `First frame: pts=${this.lastPresentedPts.toFixed(3)}s`), e3;
    }
    const i2 = this._presentFpsCap > 0;
    if ((i2 || this.videoFrameRate < 20) && this.lastPresentedPts >= 0) {
      const t3 = 1 / (i2 ? this._presentFpsCap : this.videoFrameRate), r3 = this.lastPresentedPts + t3;
      if (e2 < r3 - (i2 ? Math.min(0.05, 0.5 * t3) : 0.05)) {
        if (!i2) {
          const e3 = r3 - 0.2;
          for (; this.frameQueue.length > 0 && !(this.frameQueue[0].timestamp / 1e6 >= e3); ) this.frameQueue.shift()?.close();
        }
        return null;
      }
    }
    let r2 = null, s2 = -1;
    const a2 = this.justSeeked ? 3 * t2 : 1.5 * t2;
    for (let t3 = 0; t3 < this.frameQueue.length; t3++) {
      const i3 = this.frameQueue[t3], n3 = i3.timestamp / 1e6;
      if (n3 <= e2 + 5e-3) r2 = i3, s2 = t3;
      else if (n3 > e2 + a2) break;
    }
    if (!r2 && this.frameQueue.length > 0) {
      const i3 = this.frameQueue[0];
      i3.timestamp / 1e6 <= e2 + t2 && (r2 = i3, s2 = 0);
    }
    r2 && (this.justSeeked = false);
    const n2 = Math.max(2, 2 * t2);
    for (; this.frameQueue.length > 0; ) {
      const t3 = this.frameQueue[0], i3 = t3.timestamp / 1e6;
      if (t3 === r2) break;
      if (!(e2 - i3 > n2)) break;
      this.frameQueue.shift()?.close();
    }
    if (r2 && s2 >= 0) {
      if (s2 > 0) {
        const e3 = this.frameQueue.splice(0, s2);
        for (const t3 of e3) t3.close();
      }
      return this.lastPresentedPts = r2.timestamp / 1e6, this.currentTime = this.lastPresentedPts, this.framesPresented++, r2;
    }
    return null;
  }
  uploadFrameTexture(e2, t2) {
    try {
      if (this.isHighBitDepth) {
        e2.texImage2D(e2.TEXTURE_2D, 0, e2.RGBA16F, e2.RGBA, e2.HALF_FLOAT, t2);
        const i2 = e2.getError();
        i2 !== e2.NO_ERROR && (d.warn(he, `RGBA16F texImage2D failed (GL error ${i2}), falling back to RGBA8`), this.isHighBitDepth = false, e2.texImage2D(e2.TEXTURE_2D, 0, e2.RGBA, e2.RGBA, e2.UNSIGNED_BYTE, t2));
      } else e2.texImage2D(e2.TEXTURE_2D, 0, e2.RGBA, e2.RGBA, e2.UNSIGNED_BYTE, t2);
    } catch (i2) {
      d.warn(he, "texImage2D failed, retrying with RGBA8:", i2), this.isHighBitDepth = false, e2.texImage2D(e2.TEXTURE_2D, 0, e2.RGBA, e2.RGBA, e2.UNSIGNED_BYTE, t2);
    }
  }
  drawFrame(e2, t2 = false) {
    if (!this.gl || !this.program || !this.texture) return;
    const i2 = this.gl, r2 = this._adaptDprChecked ? 0 : performance.now();
    try {
      if (this.currentTime = e2.timestamp / 1e6, 0 === e2.displayWidth || 0 === e2.displayHeight) return;
      const s2 = e2.displayWidth, a2 = e2.displayHeight;
      if (this.vr360Enabled && (this.vrProgram || this.initVRProgram(), this.vrProgram && this.vrLocs)) return i2.activeTexture(i2.TEXTURE0), i2.bindTexture(i2.TEXTURE_2D, this.texture), this.uploadFrameTexture(i2, e2), this.drawVRFrame(i2, e2), void this.sampleAdaptiveDpr(r2);
      let n2, o2;
      if ("fill" === this.fitMode) n2 = this.width / s2, o2 = this.height / a2;
      else {
        let e3;
        const t3 = this.width, i3 = "control" === this.fitMode ? Math.max(0, this.height - 72) : this.height;
        e3 = "contain" === this.fitMode || "control" === this.fitMode ? Math.min(t3 / s2, i3 / a2) : "cover" === this.fitMode ? Math.max(t3 / s2, i3 / a2) : "zoom" === this.fitMode ? 1.25 * Math.max(t3 / s2, i3 / a2) : Math.min(t3 / s2, i3 / a2), n2 = e3, o2 = e3;
      }
      if (this.lastTargetScaleX = n2, this.lastTargetScaleY = o2, 0 === this.currentScaleX || 0 === this.currentScaleY || t2) this.currentScaleX = n2, this.currentScaleY = o2;
      else {
        const e3 = 0.15;
        Math.abs(n2 - this.currentScaleX) < 1e-4 ? this.currentScaleX = n2 : this.currentScaleX += (n2 - this.currentScaleX) * e3, Math.abs(o2 - this.currentScaleY) < 1e-4 ? this.currentScaleY = o2 : this.currentScaleY += (o2 - this.currentScaleY) * e3;
      }
      const h2 = s2 * this.currentScaleX, c2 = a2 * this.currentScaleY, u2 = (this.width - h2) / 2, l2 = (this.height - c2) / 2;
      i2.viewport(0, 0, this.width, this.height);
      const f2 = 0.08;
      this.letterboxColor[0] += (this.letterboxTarget[0] - this.letterboxColor[0]) * f2, this.letterboxColor[1] += (this.letterboxTarget[1] - this.letterboxColor[1]) * f2, this.letterboxColor[2] += (this.letterboxTarget[2] - this.letterboxColor[2]) * f2, i2.clearColor(this.letterboxColor[0] / 255, this.letterboxColor[1] / 255, this.letterboxColor[2] / 255, 1), i2.clear(i2.COLOR_BUFFER_BIT);
      const m2 = this.height - (l2 + c2);
      if (i2.viewport(u2, m2, h2, c2), i2.activeTexture(i2.TEXTURE0), i2.bindTexture(i2.TEXTURE_2D, this.texture), this.isHighBitDepth && !this._loggedFrameFormat) {
        this._loggedFrameFormat = true, d.info(he, `VideoFrame format: ${e2.format}, ${e2.codedWidth}x${e2.codedHeight}, colorSpace: ${JSON.stringify(e2.colorSpace)}`);
        try {
          const t3 = new OffscreenCanvas(16, 16).getContext("2d");
          t3.drawImage(e2, 0, 0, 16, 16);
          const i3 = t3.getImageData(0, 0, 4, 4).data, r3 = i3.some((e3) => e3 > 0);
          d.info(he, `VideoFrame pixel test: ${r3 ? "HAS DATA" : "ALL BLACK"} (sample: R=${i3[0]} G=${i3[1]} B=${i3[2]} A=${i3[3]})`);
        } catch (e3) {
          d.warn(he, "VideoFrame pixel test failed:", e3);
        }
      }
      this.uploadFrameTexture(i2, e2), i2.useProgram(this.program), i2.bindVertexArray(this.vao), i2.drawArrays(i2.TRIANGLE_STRIP, 0, 4), this.ambientEnabled && this._renderAmbientThumbnail();
    } catch (e3) {
      if (e3 instanceof DOMException && "InvalidStateError" === e3.name) return;
      d.error(he, "WebGL Draw error", e3);
    }
    this.sampleAdaptiveDpr(r2);
  }
  enableAmbientMirror() {
    if (this.ambientEnabled) return;
    if (!this.gl) return;
    const e2 = this.gl, t2 = CanvasRenderer.AMBIENT_SIZE;
    this.ambientTex = e2.createTexture(), e2.bindTexture(e2.TEXTURE_2D, this.ambientTex), e2.texParameteri(e2.TEXTURE_2D, e2.TEXTURE_WRAP_S, e2.CLAMP_TO_EDGE), e2.texParameteri(e2.TEXTURE_2D, e2.TEXTURE_WRAP_T, e2.CLAMP_TO_EDGE), e2.texParameteri(e2.TEXTURE_2D, e2.TEXTURE_MIN_FILTER, e2.LINEAR), e2.texParameteri(e2.TEXTURE_2D, e2.TEXTURE_MAG_FILTER, e2.LINEAR), e2.texImage2D(e2.TEXTURE_2D, 0, e2.RGBA, t2, t2, 0, e2.RGBA, e2.UNSIGNED_BYTE, null), this.ambientFbo = e2.createFramebuffer(), e2.bindFramebuffer(e2.FRAMEBUFFER, this.ambientFbo), e2.framebufferTexture2D(e2.FRAMEBUFFER, e2.COLOR_ATTACHMENT0, e2.TEXTURE_2D, this.ambientTex, 0);
    const i2 = e2.checkFramebufferStatus(e2.FRAMEBUFFER);
    if (e2.bindFramebuffer(e2.FRAMEBUFFER, null), i2 !== e2.FRAMEBUFFER_COMPLETE) return d.warn(he, `Ambient FBO incomplete (0x${i2.toString(16)}); ambient mode will see no updates`), this.ambientTex && e2.deleteTexture(this.ambientTex), this.ambientFbo && e2.deleteFramebuffer(this.ambientFbo), this.ambientTex = null, void (this.ambientFbo = null);
    this.ambientPixels = new Uint8Array(t2 * t2 * 4), this.ambientEnabled = true;
  }
  disableAmbientMirror() {
    if (!this.ambientEnabled) return;
    const e2 = this.gl;
    e2 && (this.ambientTex && e2.deleteTexture(this.ambientTex), this.ambientFbo && e2.deleteFramebuffer(this.ambientFbo)), this.ambientTex = null, this.ambientFbo = null, this.ambientPixels = null, this.ambientEnabled = false;
  }
  readAmbientPixels() {
    if (!(this.ambientEnabled && this.gl && this.ambientFbo && this.ambientPixels)) return null;
    const e2 = this.gl, t2 = CanvasRenderer.AMBIENT_SIZE;
    return e2.bindFramebuffer(e2.FRAMEBUFFER, this.ambientFbo), e2.readPixels(0, 0, t2, t2, e2.RGBA, e2.UNSIGNED_BYTE, this.ambientPixels), e2.bindFramebuffer(e2.FRAMEBUFFER, null), this.ambientPixels;
  }
  _renderAmbientThumbnail() {
    if (!(this.gl && this.program && this.texture && this.ambientFbo)) return;
    const e2 = this.gl, t2 = CanvasRenderer.AMBIENT_SIZE;
    e2.bindFramebuffer(e2.FRAMEBUFFER, this.ambientFbo), e2.viewport(0, 0, t2, t2), e2.clearColor(0, 0, 0, 1), e2.clear(e2.COLOR_BUFFER_BIT), e2.drawArrays(e2.TRIANGLE_STRIP, 0, 4), e2.bindFramebuffer(e2.FRAMEBUFFER, null), e2.viewport(0, 0, this.width, this.height);
  }
  setSubtitleOverlay(e2) {
    this.subtitleOverlay = e2, d.debug(he, "Subtitle overlay " + (e2 ? "set" : "cleared"));
  }
  setSubtitleFormat(e2) {
    this.subtitleOverlay && this.subtitleOverlay.classList.toggle("movi-subtitle-format-vtt", "vtt" === e2);
  }
  rotate90() {
    return this.manualRotation = (this.manualRotation + 90) % 360, this.rotation = (this.metadataRotation + this.manualRotation) % 360, d.debug(he, `Rotation: ${this.rotation}° (metadata: ${this.metadataRotation}°, manual: ${this.manualRotation}°)`), this.containerWidth > 0 && this.containerHeight > 0 && this.resize(this.containerWidth, this.containerHeight, true), this.manualRotation;
  }
  getRotation() {
    return this.manualRotation;
  }
  setManualRotation(e2) {
    this.manualRotation = e2 % 360, this.rotation = (this.metadataRotation + this.manualRotation) % 360, this.containerWidth > 0 && this.containerHeight > 0 && this.resize(this.containerWidth, this.containerHeight, true);
  }
  setSubtitleControlsPadding(e2) {
    if (this.subtitleControlsPadding = e2, this.subtitleOverlay) if (e2 > 0) this.subtitleOverlay.style.paddingBottom = `${e2}px`;
    else {
      const e3 = this.containerHeight || 672;
      this.subtitleOverlay.style.paddingBottom = `${CanvasRenderer.computeSubtitleBottomPadding(e3)}px`;
    }
  }
  setSubtitleCues(e2) {
    if (d.debug(he, `Setting subtitle cues: ${e2.length} cue(s)`), e2.forEach((e3, t2) => {
      e3.image ? d.debug(he, `  Cue ${t2}: [IMAGE] ${e3.image.width}x${e3.image.height} at (${e3.position?.x ?? "?"}, ${e3.position?.y ?? "?"}) (${e3.start.toFixed(2)}s - ${e3.end.toFixed(2)}s)`) : d.debug(he, `  Cue ${t2}: "${e3.text?.substring(0, 50)}..." (${e3.start.toFixed(2)}s - ${e3.end.toFixed(2)}s)`);
    }), e2.length > 1) this.subtitleCues = [...e2];
    else if (1 === e2.length) {
      const t2 = e2[0], i2 = this.getCurrentPlaybackTime() - this.subtitleDelay;
      this.subtitleCues = this.subtitleCues.filter((e3) => i2 <= e3.end + 0.5);
      const r2 = this.subtitleCues.findIndex((e3) => Math.abs(e3.start - t2.start) < 0.01);
      r2 >= 0 ? this.subtitleCues[r2] = t2 : this.subtitleCues.push(t2), this.subtitleCues.sort((e3, t3) => e3.start - t3.start);
    } else this.subtitleCues = [];
    this.updateActiveSubtitle(), this.renderSubtitles();
  }
  setSubtitleDelay(e2) {
    Number.isFinite(e2) && e2 !== this.subtitleDelay && (this.subtitleDelay = e2, d.debug(he, `Subtitle delay set to ${e2.toFixed(3)}s`), this.updateActiveSubtitle(), this.renderSubtitles());
  }
  getSubtitleDelay() {
    return this.subtitleDelay;
  }
  getAllCues() {
    const e2 = [];
    for (const t2 of this.subtitleCues) {
      const i2 = t2.text;
      "string" == typeof i2 && i2.length > 0 && e2.push({ start: t2.start, end: t2.end, text: i2 });
    }
    return e2;
  }
  renderImageSubtitleInOverlay(e2) {
    if (this.subtitleOverlay && e2.image) try {
      const t2 = document.createElement("canvas");
      t2.width = e2.image.width, t2.height = e2.image.height;
      const i2 = t2.getContext("2d");
      if (!i2) return void d.warn(he, "Failed to create temporary canvas context for image subtitle");
      i2.drawImage(e2.image, 0, 0);
      const r2 = t2.toDataURL("image/png"), s2 = this.canvas instanceof HTMLCanvasElement ? this.canvas : null, a2 = s2?.getBoundingClientRect(), n2 = a2?.width || this.containerWidth || this.width, o2 = a2?.height || this.containerHeight || this.height, h2 = 1920, c2 = 1080, u2 = n2 / h2, l2 = o2 / c2;
      let f2 = 1;
      if ("undefined" != typeof window && this.subtitleOverlay) {
        const e3 = window.getComputedStyle(this.subtitleOverlay).getPropertyValue("--movi-sub-size-mult").trim(), t3 = parseFloat(e3);
        Number.isFinite(t3) && t3 > 0 && (f2 = t3);
      }
      const m2 = 0.85, g2 = Math.min(u2, l2), p2 = g2 * f2 * m2, b2 = e2.image.width * p2, v2 = e2.image.height * p2, y2 = (n2 - h2 * g2) / 2, S2 = (o2 - c2 * g2) / 2, w2 = CanvasRenderer.computeSubtitleBottomPadding(o2);
      let k2, _2;
      if (k2 = void 0 !== e2.position?.x ? y2 + (e2.position.x + e2.image.width / 2) * g2 - b2 / 2 : (n2 - b2) / 2, e2.position?.y) _2 = S2 + (e2.position.y + e2.image.height / 2) * g2 - v2 / 2, _2 = Math.max(0, Math.min(_2, o2 - v2));
      else {
        const e3 = o2 - v2 - w2;
        _2 = e3 < 0 ? Math.max(0, o2 - v2 - 10) : e3, _2 = Math.max(0, Math.min(_2, o2 - v2));
      }
      k2 = Math.max(0, Math.min(k2, n2 - b2));
      const T2 = ((this.rotation ?? 0) % 360 + 360) % 360, A2 = 90 === T2 || 270 === T2, R2 = A2 ? o2 : n2, x2 = A2 ? n2 : o2;
      this.subtitleOverlay.style.position = "absolute", this.subtitleOverlay.style.right = "auto", this.subtitleOverlay.style.bottom = "auto", this.subtitleOverlay.style.width = `${R2}px`, this.subtitleOverlay.style.height = `${x2}px`, this.subtitleOverlay.style.left = (n2 - R2) / 2 + "px", this.subtitleOverlay.style.top = (o2 - x2) / 2 + "px", this.subtitleOverlay.style.pointerEvents = "none", this.subtitleOverlay.style.transformOrigin = "center center", this.subtitleOverlay.style.transform = T2 ? `rotate(${T2}deg)` : "none", this.subtitleOverlay.style.display = "flex", this.subtitleOverlay.style.flexDirection = "column", this.subtitleOverlay.style.justifyContent = "flex-end", this.subtitleOverlay.style.alignItems = "center", this.subtitleOverlay.style.overflow = "hidden", this.subtitleOverlay.style.padding = "0";
      const P2 = CanvasRenderer.computeSubtitleBottomPadding(x2), E2 = this.subtitleControlsPadding > 0 ? this.subtitleControlsPadding : P2;
      this.subtitleOverlay.style.paddingBottom = `${E2}px`, this.subtitleOverlay.style.textAlign = "center", this.subtitleOverlay.style.boxSizing = "border-box", this.subtitleOverlay.style.margin = "0";
      let C2 = this.subtitleOverlay.querySelector("img.movi-subtitle-image");
      if (d.debug(he, `Rendering image subtitle in overlay: ${C2 ? "img exists" : "creating img"}, x=${k2.toFixed(0)}, y=${_2.toFixed(0)}, width=${(e2.image.width * u2).toFixed(0)}, height=${(e2.image.height * l2).toFixed(0)}`), C2 || (C2 = document.createElement("img"), C2.className = "movi-subtitle-image", C2.style.display = "block", C2.style.position = "relative", C2.style.margin = "0", C2.style.padding = "0", C2.style.border = "none", C2.style.outline = "none", this.subtitleOverlay.innerHTML = "", this.subtitleOverlay.appendChild(C2)), e2.position?.x) {
        const e3 = k2 - (n2 - b2) / 2;
        C2.style.marginLeft = `${e3}px`, C2.style.marginRight = "0";
      } else C2.style.marginLeft = "auto", C2.style.marginRight = "auto";
      C2.src = r2, C2.style.width = `${b2}px`, C2.style.height = `${v2}px`, C2.style.maxWidth = `${R2}px`, C2.style.maxHeight = `${x2}px`, C2.style.objectFit = "contain", C2.style.display = "block", C2.style.visibility = "visible", C2.style.opacity = "1", d.debug(he, `Image subtitle rendered: src set, dimensions=${(e2.image.width * u2).toFixed(0)}x${(e2.image.height * l2).toFixed(0)}, position=(${k2.toFixed(0)}, ${_2.toFixed(0)})`);
    } catch (e3) {
      d.error(he, "Failed to render image subtitle in overlay", e3);
    }
  }
  clearSubtitles() {
    this.subtitleCues = [], this.activeSubtitleCue = null, this._lastRenderedSubtitleKey = "", this._lastRenderedSubtitlePlain = "", this.subtitleOverlay && (this.subtitleOverlay.innerHTML = "");
  }
  static computeSubtitleBottomPadding(e2) {
    return !Number.isFinite(e2) || e2 <= 0 ? 24 : Math.max(Math.min(80, 0.08 * e2), 24);
  }
  scheduleSubtitleRerender() {
    null === this._subtitleRerenderRafId && (this._subtitleRerenderRafId = requestAnimationFrame(() => {
      this._subtitleRerenderRafId = null, this.activeSubtitleCue && (this._lastRenderedSubtitleKey = "", this._subtitleFontCache = null, this.renderSubtitles());
    }));
  }
  updateActiveSubtitle() {
    const e2 = this.getCurrentPlaybackTime(), t2 = e2 - this.subtitleDelay, i2 = this.activeSubtitleCue;
    this.activeSubtitleCue = null;
    let r2 = null, s2 = 1 / 0;
    for (const e3 of this.subtitleCues) if (t2 >= e3.start - 0.1 && t2 <= e3.end + 0.2) {
      const i3 = (e3.start + e3.end) / 2, a2 = Math.abs(t2 - i3);
      a2 < s2 && (s2 = a2, r2 = e3);
    }
    if (r2) this.activeSubtitleCue = r2, i2 !== r2 && (r2.image ? d.debug(he, `Active subtitle changed at ${e2.toFixed(2)}s: [IMAGE] ${r2.image.width}x${r2.image.height} (${r2.start.toFixed(2)}s - ${r2.end.toFixed(2)}s)`) : d.debug(he, `Active subtitle changed at ${e2.toFixed(2)}s: "${r2.text?.substring(0, 30)}..." (${r2.start.toFixed(2)}s - ${r2.end.toFixed(2)}s)`));
    else if (i2) {
      const r3 = 0.3;
      t2 >= i2.start - 0.1 && t2 <= i2.end + r3 ? this.activeSubtitleCue = i2 : i2.image ? d.debug(he, `Subtitle cleared at ${e2.toFixed(2)}s (was: [IMAGE] ${i2.image.width}x${i2.image.height} at ${i2.start.toFixed(2)}s - ${i2.end.toFixed(2)}s)`) : d.debug(he, `Subtitle cleared at ${e2.toFixed(2)}s (was: "${i2.text?.substring(0, 30)}..." at ${i2.start.toFixed(2)}s - ${i2.end.toFixed(2)}s)`);
    }
  }
  renderSubtitles() {
    const e2 = this.rotation % 180 != 0, t2 = e2 ? this.height : this.width, i2 = e2 ? this.width : this.height;
    if (!this.activeSubtitleCue) return void (this.subtitleOverlay && ("" !== this._lastRenderedSubtitleKey && (this.subtitleOverlay.textContent = "", this.subtitleOverlay.innerHTML = "", this._lastRenderedSubtitleKey = "", this._lastRenderedSubtitlePlain = ""), this.subtitleOverlay.style.display = "none"));
    const r2 = this.activeSubtitleCue;
    if (r2.image) return this.subtitleOverlay ? void this.renderImageSubtitleInOverlay(r2) : void 0;
    if (this.subtitleOverlay) {
      if (!r2.text) return this.subtitleOverlay.textContent = "", void (this.subtitleOverlay.style.display = "none");
      const e3 = this.canvas instanceof HTMLCanvasElement ? this.canvas : null, s2 = e3?.getBoundingClientRect(), a2 = s2?.width || t2, n2 = s2?.height || i2, o2 = ((this.rotation ?? 0) % 360 + 360) % 360, h2 = 90 === o2 || 270 === o2, d2 = h2 ? n2 : a2, c2 = h2 ? a2 : n2, u2 = CanvasRenderer.computeSubtitleBottomPadding(c2);
      this.subtitleOverlay.style.position = "absolute", this.subtitleOverlay.style.right = "auto", this.subtitleOverlay.style.bottom = "auto", this.subtitleOverlay.style.width = `${d2}px`, this.subtitleOverlay.style.height = `${c2}px`, this.subtitleOverlay.style.left = (a2 - d2) / 2 + "px", this.subtitleOverlay.style.top = (n2 - c2) / 2 + "px", this.subtitleOverlay.style.margin = "0", this.subtitleOverlay.style.padding = "0";
      const l2 = this.subtitleControlsPadding > 0 ? this.subtitleControlsPadding : u2;
      this.subtitleOverlay.style.paddingBottom = `${l2}px`, this.subtitleOverlay.style.transformOrigin = "center center", this.subtitleOverlay.style.transform = o2 ? `rotate(${o2}deg)` : "none", this.subtitleOverlay.style.boxSizing = "border-box", this.subtitleOverlay.style.display = "flex", this.subtitleOverlay.style.flexDirection = "column", this.subtitleOverlay.style.justifyContent = "flex-end", this.subtitleOverlay.style.alignItems = "center", this.subtitleOverlay.style.textAlign = "left", this.subtitleOverlay.style.pointerEvents = "none";
      const f2 = `${r2.start.toFixed(3)}|${r2.text}`;
      if (f2 === this._lastRenderedSubtitleKey) return;
      this._lastRenderedSubtitleKey = f2;
      const m2 = "⟨⟨GHOST⟩⟩", g2 = r2.text.indexOf(m2), p2 = g2 >= 0 ? r2.text.slice(0, g2) : r2.text, b2 = g2 >= 0 ? r2.text.slice(g2 + m2.length) : r2.text, v2 = (() => {
        const e4 = this._subtitleFontCache;
        if (e4 && e4.viewport === window.innerWidth) return e4.font;
        const t3 = document.createElement("div");
        t3.className = "movi-subtitle-line", t3.style.position = "absolute", t3.style.left = "-99999px", t3.style.top = "-99999px", t3.style.visibility = "hidden", t3.textContent = "M", this.subtitleOverlay.parentNode?.appendChild(t3);
        const i3 = window.getComputedStyle(t3), r3 = `${i3.fontStyle} ${i3.fontWeight} ${i3.fontSize} ${i3.fontFamily}`;
        return t3.remove(), this._subtitleFontCache = { viewport: window.innerWidth, font: r3 }, r3;
      })(), y2 = (e4) => {
        const t3 = e4.indexOf(m2);
        return t3 >= 0 ? e4.slice(0, t3) : e4;
      };
      let S2 = b2;
      const w2 = this.subtitleCues.indexOf(this.activeSubtitleCue);
      if (w2 >= 0) {
        let e4 = p2;
        for (let t3 = w2 + 1; t3 < this.subtitleCues.length; t3++) {
          const i3 = this.subtitleCues[t3];
          if (!i3?.text) break;
          const r3 = y2(i3.text);
          if (r3.length > e4.length && r3.startsWith(e4)) e4 = r3, S2 = i3.text.length > r3.length ? i3.text : r3;
          else if (!r3.startsWith(e4)) break;
        }
      }
      const k2 = y2(S2).replace(/<[^>]*>/g, ""), _2 = (this._subtitleMeasureCanvas ||= document.createElement("canvas")).getContext("2d");
      let T2 = 0;
      if (_2) {
        _2.font = v2;
        for (const e4 of k2.split("\n")) {
          const t3 = Math.ceil(_2.measureText(e4).width);
          t3 > T2 && (T2 = t3);
        }
      }
      const A2 = p2.split("\n"), R2 = this._lastRenderedSubtitlePlain, x2 = R2 && p2.startsWith(R2) && p2.length > R2.length ? R2.split(/\s+/).filter(Boolean).length : 0;
      this._lastRenderedSubtitlePlain = p2;
      let P2 = 0;
      const E2 = A2.map((e4) => {
        const t3 = [];
        let i3 = e4.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&#x27;/g, "'").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
        i3 = i3.replace(/<(\/?)i>/gi, (e5) => {
          const i4 = t3.length;
          return t3.push(e5), `__PLACEHOLDER_${i4}__`;
        }), i3 = i3.replace(/<(\/?)b>/gi, (e5) => {
          const i4 = t3.length;
          return t3.push(e5), `__PLACEHOLDER_${i4}__`;
        }), i3 = i3.replace(/<(\/?)u>/gi, (e5) => {
          const i4 = t3.length;
          return t3.push(e5), `__PLACEHOLDER_${i4}__`;
        }), i3 = i3.replace(/<font\s+color=["']?([^"']+)["']?>/gi, (e5, i4) => {
          const r4 = t3.length;
          return t3.push(`<font color="${i4}">`), `__PLACEHOLDER_${r4}__`;
        }), i3 = i3.replace(/<\/font>/gi, () => {
          const e5 = t3.length;
          return t3.push("</font>"), `__PLACEHOLDER_${e5}__`;
        });
        let r3 = i3.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
        t3.forEach((e5, t4) => {
          r3 = r3.replace(`__PLACEHOLDER_${t4}__`, e5);
        });
        const s3 = r3.split(/(\s+)/).filter(Boolean), a3 = (e5) => /^\s+$/.test(e5), n3 = (e5) => !!e5 && !e5.replace(/<[^>]*>/g, "").trim(), o3 = [];
        let h3 = "";
        for (const e5 of s3) if (a3(e5)) {
          if (h3) continue;
          o3.push({ kind: "ws", text: e5 });
        } else n3(e5) ? h3 += e5 : (o3.push({ kind: "word", text: h3 + e5 }), h3 = "");
        if (h3 && o3.length) {
          const e5 = o3[o3.length - 1];
          "word" === e5.kind && (e5.text = e5.text + h3);
        }
        const d3 = [], c3 = [];
        for (const e5 of o3) {
          const t4 = (e6) => e6 < x2 ? d3 : c3;
          if ("ws" === e5.kind) {
            const i5 = t4(P2);
            if (i5 === d3 && 0 === d3.length && 0 === P2) continue;
            i5.push(e5.text);
            continue;
          }
          const i4 = t4(P2);
          if (i4 === c3 && 0 === c3.length && d3.length > 0) {
            const e6 = d3[d3.length - 1];
            /\s$/.test(e6) || d3.push(" ");
          }
          i4.push(e5.text), P2 += 1;
        }
        const u3 = d3.join("").replace(/\s+$/, " "), l3 = c3.join(""), f3 = ['<div class="movi-subtitle-line">'];
        return u3 && f3.push(`<span class="movi-subtitle-static">${u3}</span>`), l3 && f3.push(`<span class="movi-subtitle-new">${l3}</span>`), f3.push("</div>"), f3.join("");
      }).join(""), C2 = parseFloat(this.subtitleOverlay.style.width) || 0, F2 = C2 > 0 && T2 > 0 && T2 <= 0.92 * C2, B2 = F2 ? Math.max(0, Math.floor((C2 - T2) / 2)) : 0, D2 = F2 ? B2 > 0 ? ` style="padding-left:${B2}px"` : "" : ' style="text-align:center"';
      return void (this.subtitleOverlay.innerHTML = `<div class="movi-subtitle-anchor"${D2}><div class="movi-subtitle-block">${E2}</div></div>`);
    }
  }
  setPlaybackRate(e2) {
    const t2 = this.getCurrentPlaybackTime();
    this.playbackRate = Math.max(0.25, Math.min(4, e2)), this.presentationStartTime > 0 && (this.presentationStartTime = performance.now(), this.presentationStartPts = t2), this.syncedToAudio = false;
  }
  getCurrentTime() {
    return this.currentTime;
  }
  hasQueuedFrames() {
    return this.frameQueue.length > 0;
  }
  getQueueSize() {
    return this.frameQueue.length;
  }
  getHeadFrameTime() {
    return 0 === this.frameQueue.length ? -1 : this.frameQueue[0].timestamp / 1e6;
  }
  getStats() {
    return { framesPresented: this.framesPresented, frameQueueSize: this.frameQueue.length, colorSpace: this.colorSpace, resolution: this.width > 0 ? `${this.width}x${this.height}` : "N/A", syncedToAudio: this.syncedToAudio };
  }
  dropStaleFrames(e2, t2 = 0.2) {
    let i2 = 0;
    for (; this.frameQueue.length > 0; ) {
      const r2 = this.frameQueue[0];
      if (!(r2.timestamp / 1e6 < e2 - t2)) break;
      r2.close(), this.frameQueue.shift(), i2++;
    }
    return i2 > 0 && (this.presentationStartTime = 0, this.presentationStartPts = 0, this.lastPresentedPts = -1, this.syncedToAudio = false, d.debug(he, `Dropped ${i2} stale frames before ${e2.toFixed(3)}s (tolerance ${t2.toFixed(2)}s)`)), i2;
  }
  clearQueue() {
    for (const e2 of this.frameQueue) e2.close();
    this.frameQueue = [], this.lastPresentedPts = -1, this.syncedToAudio = false, this.lastKnownAudioTime = -1, this.framesPresented = 0, this.presentationStartTime = 0, this.presentationStartPts = 0, this.justSeeked = true, d.debug(he, "Frame queue cleared and presentation timing reset");
  }
  renderBitmap(e2) {
  }
  clear() {
    this.gl && (this.gl.clearColor(0, 0, 0, 1), this.gl.clear(this.gl.COLOR_BUFFER_BIT));
  }
  fillBlack() {
    this.clear();
  }
  getCanvas() {
    return this.canvas;
  }
  destroy() {
    this.stopPresentationLoop(), null !== this.vrAnimRaf && (cancelAnimationFrame(this.vrAnimRaf), this.vrAnimRaf = null), this.lastRenderedFrame && (this.lastRenderedFrame.close(), this.lastRenderedFrame = null), this.clear(), this.gl && (this.texture && this.gl.deleteTexture(this.texture), this.program && this.gl.deleteProgram(this.program), this.vrProgram && this.gl.deleteProgram(this.vrProgram)), this.gl = null, d.debug(he, "Destroyed");
  }
}
const de = "Signalsmith";
let ce = null;
function ue() {
  return ce || (ce = U().then((e2) => (d.info(de, "Signalsmith Stretch ready (shared movi WASM)"), e2)).catch((e2) => (d.warn(de, "movi WASM not available — falling back", e2), ce = null, null))), ce;
}
class SignalsmithStretcher {
  mod;
  handle;
  channels;
  inPtr = 0;
  outPtr = 0;
  inCapacityFrames = 0;
  outCapacityFrames = 0;
  pendingInput = null;
  pendingInputFrames = 0;
  lastOutputFrames = 0;
  _tempo = 1;
  _pitch = 1;
  inputBuffer;
  outputBuffer;
  constructor(e2, t2, i2 = 2) {
    if (this.mod = e2, this.channels = i2, this.handle = e2._movi_stretch_new(i2, t2), !this.handle) throw new Error("movi_stretch_new returned 0");
    const r2 = this;
    this.inputBuffer = { putSamples: (e3, t3 = 0, i3 = 0) => {
      r2.stashInput(e3, t3, i3);
    } }, this.outputBuffer = { get frameCount() {
      return r2.lastOutputFrames;
    }, receiveSamples: (e3, t3) => r2.runProcessIfNeeded(e3, t3) };
  }
  set tempo(e2) {
    this._tempo = e2;
  }
  get tempo() {
    return this._tempo;
  }
  set pitch(e2) {
    if (e2 === this._pitch) return;
    this._pitch = e2;
    const t2 = 1 === e2 ? 0 : 12 * Math.log2(e2);
    this.mod._movi_stretch_set_transpose_semitones(this.handle, t2);
  }
  get pitch() {
    return this._pitch;
  }
  process() {
    this.pendingInput && 0 !== this.pendingInputFrames ? this.lastOutputFrames = Math.max(1, Math.ceil(this.pendingInputFrames / this._tempo)) : this.lastOutputFrames = 0;
  }
  clear() {
    this.pendingInput = null, this.pendingInputFrames = 0, this.lastOutputFrames = 0, this.mod._movi_stretch_reset(this.handle);
  }
  destroy() {
    this.handle && (this.inPtr && this.mod._free(this.inPtr), this.outPtr && this.mod._free(this.outPtr), this.mod._movi_stretch_delete(this.handle), this.handle = 0, this.inPtr = 0, this.outPtr = 0);
  }
  stashInput(e2, t2, i2) {
    (!i2 || i2 <= 0) && (i2 = (e2.length - t2 * this.channels) / this.channels);
    const r2 = i2 * this.channels;
    if (0 === t2 && e2.length === r2) this.pendingInput = e2;
    else {
      const i3 = t2 * this.channels;
      this.pendingInput = e2.subarray(i3, i3 + r2);
    }
    this.pendingInputFrames = i2;
  }
  ensureBuffer(e2, t2) {
    const i2 = "in" === e2 ? "inPtr" : "outPtr", r2 = "in" === e2 ? "inCapacityFrames" : "outCapacityFrames";
    if (this[r2] >= t2 && this[i2]) return this[i2];
    this[i2] && this.mod._free(this[i2]);
    const s2 = t2 * this.channels * 4;
    return this[i2] = this.mod._malloc(s2), this[r2] = t2, this[i2];
  }
  runProcessIfNeeded(e2, t2) {
    if (!this.pendingInput || 0 === this.pendingInputFrames || t2 <= 0) return;
    const i2 = this.pendingInputFrames, r2 = t2, s2 = this.ensureBuffer("in", i2), a2 = this.ensureBuffer("out", r2), n2 = new Float32Array(this.mod.HEAPU8.buffer), o2 = s2 >> 2, h2 = i2 * this.channels;
    n2.set(this.pendingInput.subarray(0, h2), o2), this.mod._movi_stretch_process(this.handle, s2, i2, a2, r2);
    const d2 = a2 >> 2, c2 = r2 * this.channels;
    e2.set(n2.subarray(d2, d2 + c2)), this.pendingInput = null, this.pendingInputFrames = 0;
  }
}
const le = "AudioRenderer";
let fe = null, me = false;
class AudioRenderer {
  audioContext = null;
  inputNode = null;
  gainNode = null;
  compressorNode = null;
  scheduledTime = 0;
  isPlaying = false;
  volume = 1;
  _playbackRate = 1;
  activeSources = [];
  _muted = false;
  firstBufferScheduledAt = 0;
  firstBufferMediaTime = 0;
  hasFirstBuffer = false;
  _lastUnderrunAt = 0;
  _ducked = false;
  static DUCK_FADE_OUT = 0.01;
  static DUCK_FADE_IN = 0.04;
  static DUCK_CLEAR_MS = 300;
  _suppressDuckUntil = 0;
  currentMediaTime = 0;
  maxScheduledMediaTime = 0;
  lastDecodeTime = 0;
  scheduledCount = 0;
  isRebufferingForRateChange = false;
  preservePitch = true;
  signalsmith = null;
  signalsmithLoading = false;
  signalsmithSampleRate = 0;
  _decodedSampleRate = 0;
  _stableAudio = false;
  _sinkId = "";
  static GAIN_RAMP_TIME = 0.015;
  static FADE_OUT_TIME = 0.03;
  contextStateHandler = null;
  recoveryAttempts = 0;
  static MAX_RECOVERY_ATTEMPTS = 3;
  starvationStartTime = 0;
  isStarved = false;
  static STARVATION_THRESHOLD = 2e3;
  keepaliveEl = null;
  keepaliveUrl = null;
  constructor() {
    d.debug(le, "Created");
  }
  ensureKeepalive() {
    if (this.keepaliveEl) return this.keepaliveEl;
    try {
      const e2 = 8e3, t2 = 5 * e2, i2 = new ArrayBuffer(44 + t2), r2 = new DataView(i2), s2 = (e3, t3) => {
        for (let i3 = 0; i3 < t3.length; i3++) r2.setUint8(e3 + i3, t3.charCodeAt(i3));
      };
      s2(0, "RIFF"), r2.setUint32(4, 36 + t2, true), s2(8, "WAVE"), s2(12, "fmt "), r2.setUint32(16, 16, true), r2.setUint16(20, 1, true), r2.setUint16(22, 1, true), r2.setUint32(24, e2, true), r2.setUint32(28, e2, true), r2.setUint16(32, 1, true), r2.setUint16(34, 8, true), s2(36, "data"), r2.setUint32(40, t2, true), new Uint8Array(i2, 44, t2).fill(128);
      const a2 = new Blob([i2], { type: "audio/wav" });
      this.keepaliveUrl = URL.createObjectURL(a2);
      const n2 = new Audio();
      n2.src = this.keepaliveUrl, n2.loop = true, n2.preload = "auto", n2.volume = 1e-4, this.keepaliveEl = n2;
    } catch (e2) {
      return d.warn(le, "Failed to create BT keepalive element", e2), null;
    }
    return this.keepaliveEl;
  }
  startKeepalive() {
    const e2 = this.ensureKeepalive();
    e2 && e2.play().catch(() => {
    });
  }
  stopKeepalive() {
    if (this.keepaliveEl) try {
      this.keepaliveEl.pause(), this.keepaliveEl.currentTime = 0;
    } catch {
    }
  }
  async init() {
    try {
      return fe && "closed" !== fe.state || (fe = new AudioContext({ latencyHint: "interactive" })), this.audioContext = fe, "running" === this.audioContext.state && (me = true), me && "suspended" === this.audioContext.state && this.audioContext.resume().catch(() => {
      }), this.inputNode = this.audioContext.createGain(), this.gainNode = this.audioContext.createGain(), this.compressorNode = this.audioContext.createDynamicsCompressor(), this.compressorNode.threshold.value = -18, this.compressorNode.knee.value = 6, this.compressorNode.ratio.value = 20, this.compressorNode.attack.value = 1e-3, this.compressorNode.release.value = 0.15, this.wireGraph(), this.gainNode.gain.value = this._muted ? 0 : this.perceptualGain(this.volume), this._sinkId && this.applySinkId(this._sinkId).catch(() => {
      }), this._stableAudio && this.setupContextStateMonitoring(), d.info(le, `Initialized: sampleRate=${this.audioContext.sampleRate}, muted=${this._muted}, state=${this.audioContext.state}`), ue(), true;
    } catch (e2) {
      return d.error(le, "Failed to initialize", e2), false;
    }
  }
  async setSinkId(e2) {
    return this._sinkId = e2 || "", this.applySinkId(this._sinkId);
  }
  getSinkId() {
    const e2 = this.audioContext?.sinkId;
    return "string" == typeof e2 ? e2 : this._sinkId;
  }
  static isSinkSelectionSupported() {
    return "undefined" != typeof AudioContext && "function" == typeof AudioContext.prototype.setSinkId;
  }
  async applySinkId(e2) {
    const t2 = this.audioContext;
    if (!t2 || "function" != typeof t2.setSinkId) return false;
    try {
      return await t2.setSinkId(e2 || ""), d.info(le, `Output device set: ${e2 || "(default)"}`), true;
    } catch (t3) {
      return d.warn(le, `setSinkId failed for "${e2}"`, t3), false;
    }
  }
  configure(e2, t2) {
    d.info(le, `Configured: ${e2}Hz, ${t2}ch`);
  }
  getMaxChannelCount() {
    return this.audioContext?.destination.maxChannelCount ?? 2;
  }
  setOutputChannelCount(e2) {
    if (!this.audioContext) return;
    const t2 = this.audioContext.destination, i2 = Math.min(Math.max(1, Math.floor(e2)), t2.maxChannelCount);
    try {
      t2.channelCount = i2, t2.channelCountMode = "explicit", t2.channelInterpretation = "discrete", this.inputNode && (this.inputNode.channelCount = i2), this.gainNode && (this.gainNode.channelCount = i2), this.compressorNode && (this.compressorNode.channelCount = i2), d.info(le, `Destination channelCount → ${i2} (max ${t2.maxChannelCount})`);
    } catch (e3) {
      d.warn(le, "Failed to set destination channelCount", e3);
    }
  }
  render(e2) {
    if (this.audioContext && this.gainNode) if (this.isPlaying) if (this._muted && "suspended" === this.audioContext.state) e2.close();
    else try {
      const t2 = e2.numberOfFrames, i2 = e2.numberOfChannels, r2 = e2.sampleRate, s2 = e2.timestamp / 1e6, a2 = this.audioContext.createBuffer(i2, t2, r2);
      for (let r3 = 0; r3 < i2; r3++) {
        const i3 = new Float32Array(t2);
        e2.copyTo(i3, { planeIndex: r3, format: "f32-planar" }), a2.copyToChannel(i3, r3);
      }
      this.scheduleAudioBuffer(a2, s2);
    } catch (e3) {
      d.error(le, "Render error", e3);
    } finally {
      e2.close();
    }
    else e2.close();
    else e2.close();
  }
  renderPCM(e2) {
    if (this.audioContext && this.gainNode && this.isPlaying && (!this._muted || "suspended" !== this.audioContext.state)) try {
      const t2 = e2.timestamp / 1e6, i2 = this.audioContext.createBuffer(e2.numberOfChannels, e2.numberOfFrames, e2.sampleRate);
      for (let t3 = 0; t3 < e2.numberOfChannels; t3++) i2.copyToChannel(e2.planes[t3], t3);
      this.scheduleAudioBuffer(i2, t2);
    } catch (e3) {
      d.error(le, "RenderPCM error", e3);
    }
  }
  scheduleAudioBuffer(e2, t2) {
    if (!this.audioContext || !this.gainNode) return;
    this.lastDecodeTime = performance.now(), this._stableAudio && this.isStarved && (this.isStarved = false, this.starvationStartTime = 0, d.debug(le, "Recovered from audio starvation"));
    const i2 = e2.numberOfChannels, r2 = e2.sampleRate;
    this._decodedSampleRate = r2, this.isRebufferingForRateChange && (this.isRebufferingForRateChange = false, d.debug(le, "Rebuffering complete after playback rate change"));
    let s2 = e2, a2 = false;
    if (this.preservePitch && Math.abs(this._playbackRate - 1) > 0.01) {
      const t3 = this.processStretch(e2, this._playbackRate);
      if (t3 && t3.length > 1) s2 = t3, a2 = true;
      else {
        const t4 = e2.duration / this._playbackRate, n3 = Math.max(1, Math.ceil(t4 * r2));
        s2 = this.audioContext.createBuffer(i2, n3, r2), a2 = true;
      }
    }
    const n2 = this.audioContext.createBufferSource();
    n2.buffer = s2, n2.connect(this.inputNode ?? this.gainNode), n2.playbackRate.value = a2 ? 1 : this._playbackRate;
    const o2 = this.audioContext.currentTime, h2 = o2 + 5e-3;
    if (this.scheduledTime < o2) {
      if (this.hasFirstBuffer && (this._lastUnderrunAt = performance.now(), this.duckForUnderrun()), this._stableAudio && this.hasFirstBuffer && this.audioContext) {
        const e3 = o2 - this.scheduledTime;
        if (e3 > 5e-3 && e3 < 1) try {
          const t3 = Math.ceil(e3 * r2), s3 = this.audioContext.createBuffer(i2, t3, r2), a3 = this.audioContext.createBufferSource();
          a3.buffer = s3, a3.connect(this.inputNode ?? this.gainNode), a3.start(this.scheduledTime), a3.onended = () => {
            try {
              a3.disconnect();
            } catch {
            }
          }, d.debug(le, `Gap filled: ${(1e3 * e3).toFixed(1)}ms silence`);
        } catch {
        }
      }
      this.scheduledTime = h2, this.hasFirstBuffer && (this.firstBufferScheduledAt = h2, this.firstBufferMediaTime = t2);
    }
    this.unduckIfClean();
    let c2 = this.scheduledTime;
    if (this.hasFirstBuffer) {
      const e3 = this.firstBufferScheduledAt + (t2 - this.firstBufferMediaTime) / this._playbackRate, i3 = e3 - this.scheduledTime;
      Math.abs(i3) > 0.02 && (c2 = e3);
    }
    const u2 = Math.max(c2, h2);
    n2.start(u2), this.hasFirstBuffer || (this.firstBufferScheduledAt = u2, this.firstBufferMediaTime = t2, this.hasFirstBuffer = true, d.debug(le, `First buffer scheduled at ${u2.toFixed(3)}s, mediaTime=${t2.toFixed(3)}s`)), this.activeSources.push(n2), this.scheduledTime = u2 + (a2 ? s2.duration : e2.duration / this._playbackRate), this.currentMediaTime = t2, this.scheduledCount++;
    const l2 = t2 + e2.duration;
    l2 > this.maxScheduledMediaTime && (this.maxScheduledMediaTime = l2), n2.onended = () => {
      const e3 = this.activeSources.indexOf(n2);
      -1 !== e3 && this.activeSources.splice(e3, 1);
      try {
        n2.disconnect();
      } catch {
      }
    };
  }
  renderSamples(e2, t2) {
    if (this.audioContext && this.gainNode && this.isPlaying) {
      this._decodedSampleRate = t2;
      try {
        const i2 = e2.length, r2 = e2[0].length, s2 = this.audioContext.createBuffer(i2, r2, t2);
        for (let t3 = 0; t3 < i2; t3++) s2.copyToChannel(e2[t3], t3);
        const a2 = this.audioContext.createBufferSource();
        a2.buffer = s2, a2.connect(this.inputNode ?? this.gainNode), a2.playbackRate.value = this._playbackRate;
        const n2 = this.audioContext.currentTime, o2 = Math.max(n2, this.scheduledTime);
        a2.start(o2), this.scheduledTime = o2 + s2.duration / this._playbackRate;
      } catch (e3) {
        d.error(le, "Render samples error", e3);
      }
    }
  }
  async play() {
    if (this.isPlaying = true, this.intentionalSuspend = false, this.audioContext || this._muted || await this.init(), this.preservePitch && this.audioContext && !this.signalsmith && Math.abs(this._playbackRate - 1) > 0.01 && this.maybeInitSignalsmith(this._decodedSampleRate || this.audioContext.sampleRate), "suspended" === this.audioContext?.state && (!this._muted || this.intentionalSuspend)) try {
      await this.audioContext.resume(), "running" === this.audioContext.state && (me = true);
    } catch (e2) {
      d.warn(le, "Failed to resume AudioContext (user gesture may be required)", e2);
    }
    this.startKeepalive(), !this._muted && this.audioContext && this.warmupContext(), this.lastDecodeTime = performance.now(), d.debug(le, `Playing (muted: ${this._muted}, audioContext: ${this.audioContext ? "initialized" : "deferred"}, state: ${this.audioContext?.state || "N/A"})`);
  }
  maybeInitSignalsmith(e2) {
    this.signalsmith || this.signalsmithLoading || (this.signalsmithLoading = true, this.signalsmithSampleRate = e2, async function(e3, t2 = 2) {
      const i2 = await ue();
      return i2 ? new SignalsmithStretcher(i2, e3, t2) : null;
    }(e2, 2).then((t2) => {
      this.signalsmithLoading = false, t2 && (t2.tempo = this._playbackRate, t2.pitch = 1, this.signalsmith = t2, d.info(le, `Signalsmith ready @ ${e2}Hz`));
    }).catch((e3) => {
      this.signalsmithLoading = false, d.warn(le, "Signalsmith init failed", e3);
    }));
  }
  processStretch(e2, t2) {
    if (!this.audioContext) return null;
    const i2 = e2.numberOfChannels, r2 = e2.sampleRate, s2 = e2.length;
    if (this.signalsmith && this.signalsmithSampleRate !== r2 && (this.signalsmith.destroy(), this.signalsmith = null), this.maybeInitSignalsmith(r2), !this.signalsmith) return null;
    const a2 = this.signalsmith;
    a2.tempo = this._playbackRate, a2.pitch = 1;
    const n2 = new Float32Array(2 * s2), o2 = e2.getChannelData(0), h2 = i2 > 1 ? e2.getChannelData(1) : o2;
    for (let e3 = 0; e3 < s2; e3++) n2[2 * e3] = o2[e3], n2[2 * e3 + 1] = h2[e3];
    a2.inputBuffer.putSamples(n2, 0, s2), a2.process();
    const d2 = Math.ceil(s2 / t2), c2 = a2.outputBuffer.frameCount, u2 = Math.min(d2, c2);
    if (0 === u2) return null;
    const l2 = new Float32Array(2 * u2);
    a2.outputBuffer.receiveSamples(l2, u2);
    const f2 = this.audioContext.createBuffer(i2, u2, r2), m2 = f2.getChannelData(0), g2 = i2 > 1 ? f2.getChannelData(1) : null;
    for (let e3 = 0; e3 < u2; e3++) m2[e3] = l2[2 * e3], g2 && (g2[e3] = l2[2 * e3 + 1]);
    return f2;
  }
  warmupContext() {
    if (this.audioContext) try {
      const e2 = this.audioContext.createBuffer(1, 1, 22050), t2 = this.audioContext.createBufferSource();
      t2.buffer = e2, t2.connect(this.audioContext.destination), t2.start();
    } catch {
    }
  }
  intentionalSuspend = false;
  pause() {
    this.isPlaying = false, this.stopKeepalive(), this.audioContext && "running" === this.audioContext.state && (this.intentionalSuspend = true, this.audioContext.suspend().catch((e2) => {
      d.error(le, "Failed to suspend audio context", e2);
    })), d.debug(le, "Paused");
  }
  suspendForBuffering() {
    this.intentionalSuspend = true, this.audioContext && "running" === this.audioContext.state && this.audioContext.suspend().catch((e2) => {
      d.error(le, "Failed to suspend audio context for buffering", e2);
    }), d.debug(le, "Suspended for buffering (isPlaying still true)");
  }
  primeForBuffering() {
    this.isPlaying = true, this.intentionalSuspend = true, this.audioContext || this._muted ? this.audioContext && "running" === this.audioContext.state && this.audioContext.suspend().catch((e2) => {
      d.error(le, "Failed to suspend audio context for prime", e2);
    }) : this.init().then(() => {
      this.intentionalSuspend && "running" === this.audioContext?.state && this.audioContext.suspend().catch(() => {
      });
    }).catch(() => {
    }), this.lastDecodeTime = performance.now(), d.debug(le, "Primed for buffering (context held suspended)");
  }
  resumeFromBuffering() {
    this.intentionalSuspend = false, this.audioContext && "suspended" === this.audioContext.state && this.audioContext.resume().catch((e2) => {
      d.error(le, "Failed to resume audio context from buffering", e2);
    }), d.debug(le, "Resumed from buffering");
  }
  setVolume(e2) {
    if (this.volume = Math.max(0, Math.min(2, e2)), this.gainNode && !this._muted) {
      const e3 = this.perceptualGain(this.volume);
      this._stableAudio ? this.rampGain(e3) : this.gainNode.gain.value = e3;
    }
    d.debug(le, `Volume: ${this.volume} (muted: ${this._muted})`);
  }
  getVolume() {
    return this.volume;
  }
  setPlaybackRate(e2) {
    const t2 = Math.max(0.25, Math.min(4, e2));
    if (this._playbackRate === t2) return;
    const i2 = this._playbackRate;
    if (this.preservePitch && this.signalsmith ? (this.signalsmith.tempo = t2, this.signalsmith.clear()) : this.preservePitch && Math.abs(t2 - 1) > 0.01 && this.audioContext && this.maybeInitSignalsmith(this._decodedSampleRate || this.audioContext.sampleRate), this.audioContext && "running" === this.audioContext.state && this.hasFirstBuffer) {
      const e3 = this.audioContext.currentTime, t3 = this.firstBufferMediaTime + (e3 - this.firstBufferScheduledAt) * i2;
      if (this.firstBufferScheduledAt = e3, this.firstBufferMediaTime = t3, this._stableAudio && this.gainNode && this.activeSources.length > 0) try {
        this.gainNode.gain.cancelScheduledValues(e3), this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, e3), this.gainNode.gain.linearRampToValueAtTime(0, e3 + AudioRenderer.FADE_OUT_TIME);
      } catch {
      }
      for (const e4 of this.activeSources) try {
        e4.stop(), e4.disconnect();
      } catch {
      }
      if (this.activeSources = [], this.scheduledTime = e3, this._stableAudio && this.gainNode) try {
        const t4 = e3 + AudioRenderer.FADE_OUT_TIME + 5e-3;
        this.gainNode.gain.linearRampToValueAtTime(this._muted ? 0 : this.perceptualGain(this.volume), t4);
      } catch {
        this.gainNode.gain.value = this._muted ? 0 : this.perceptualGain(this.volume);
      }
    }
    this._playbackRate = t2;
  }
  getPlaybackRate() {
    return this._playbackRate;
  }
  setPreservePitch(e2) {
    this.preservePitch = e2, d.debug(le, `Pitch preservation: ${e2}`);
  }
  getPreservePitch() {
    return this.preservePitch;
  }
  isRebuffering() {
    return this.isRebufferingForRateChange;
  }
  mute() {
    this._muted = true, this.gainNode && (this._stableAudio ? this.rampGain(0) : this.gainNode.gain.value = 0), d.debug(le, "Muted");
  }
  async unmute() {
    if (this._muted = false, !this.audioContext && this.isPlaying && await this.init(), this.gainNode) {
      const e2 = this.perceptualGain(this.volume);
      this._stableAudio ? this.rampGain(e2) : this.gainNode.gain.value = e2;
    }
    this.audioContext && "suspended" === this.audioContext.state && this.audioContext.resume().then(() => {
      d.debug(le, "AudioContext resumed on unmute");
    }).catch((e2) => {
      d.warn(le, "Failed to resume AudioContext on unmute", e2);
    }), d.debug(le, "Unmuted");
  }
  reset() {
    if (this._stableAudio && this.audioContext && this.gainNode && this.activeSources.length > 0) try {
      const e2 = this.audioContext.currentTime;
      this.gainNode.gain.cancelScheduledValues(e2), this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, e2), this.gainNode.gain.linearRampToValueAtTime(0, e2 + AudioRenderer.FADE_OUT_TIME);
    } catch {
    }
    for (const e2 of this.activeSources) try {
      e2.stop(), e2.disconnect();
    } catch {
    }
    if (this.activeSources = [], this.scheduledTime = this.audioContext?.currentTime ?? 0, this._ducked = false, this._lastUnderrunAt = 0, this.inputNode && this.audioContext) try {
      const e2 = this.inputNode.gain, t2 = this.audioContext.currentTime;
      e2.cancelScheduledValues(t2), e2.setValueAtTime(1, t2);
    } catch {
    }
    if (this.hasFirstBuffer = false, this.firstBufferScheduledAt = 0, this.firstBufferMediaTime = 0, this.scheduledCount = 0, this.maxScheduledMediaTime = 0, this.isStarved = false, this.starvationStartTime = 0, this.signalsmith && this.signalsmith.clear(), this._stableAudio && this.gainNode && this.audioContext) try {
      const e2 = this.audioContext.currentTime + AudioRenderer.FADE_OUT_TIME + 5e-3;
      this.gainNode.gain.linearRampToValueAtTime(this._muted ? 0 : this.perceptualGain(this.volume), e2);
    } catch {
      this.gainNode.gain.value = this._muted ? 0 : this.perceptualGain(this.volume);
    }
  }
  getCurrentTime() {
    if (this.isPlaying && this.audioContext && "running" === this.audioContext.state && this.hasFirstBuffer) {
      const e2 = this.audioContext.currentTime - this.firstBufferScheduledAt;
      let t2 = this.firstBufferMediaTime + Math.max(0, e2 * this._playbackRate);
      const i2 = this.audioContext.outputLatency || this.audioContext.baseLatency || 0;
      return i2 > 0 && (t2 -= i2 * this._playbackRate, t2 = Math.max(t2, this.firstBufferMediaTime)), t2;
    }
    return this.currentMediaTime;
  }
  getAudioClock() {
    if (this.audioContext && "running" === this.audioContext.state && this.hasFirstBuffer) {
      const e2 = this.audioContext.currentTime - this.firstBufferScheduledAt;
      let t2 = this.firstBufferMediaTime + Math.max(0, e2 * this._playbackRate);
      const i2 = this.audioContext.outputLatency || this.audioContext.baseLatency || 0;
      return i2 > 0 && (t2 -= i2 * this._playbackRate, t2 = Math.max(t2, this.firstBufferMediaTime)), this.maxScheduledMediaTime > 0 ? Math.min(t2, this.maxScheduledMediaTime) : t2;
    }
    return -1;
  }
  isBlockedSuspended() {
    return !!this.audioContext && "suspended" === this.audioContext.state && !this._muted && !this.intentionalSuspend;
  }
  wasEverActivated() {
    return me;
  }
  hasHealthyBuffer() {
    if (!this.audioContext || !this.hasFirstBuffer) return false;
    if ("running" !== this.audioContext.state) return false;
    if (this._stableAudio && this.isStarved) return false;
    const e2 = performance.now() - this.lastDecodeTime;
    if (this.lastDecodeTime > 0 && e2 > 500) return false;
    const t2 = this.scheduledTime - this.audioContext.currentTime, i2 = this.activeSources.length > 0 || t2 > 0, r2 = this.scheduledCount < 5 ? 0.1 : 0.02;
    return i2 && t2 > r2;
  }
  isAudioPlaying() {
    return this.isPlaying && "running" === this.audioContext?.state && this.hasFirstBuffer;
  }
  getBufferedDuration() {
    return this.audioContext ? Math.max(0, this.scheduledTime - this.audioContext.currentTime) : 0;
  }
  isUnderrunning(e2 = 500) {
    return this._lastUnderrunAt > 0 && performance.now() - this._lastUnderrunAt < e2;
  }
  suppressDuckFor(e2) {
    this._suppressDuckUntil = performance.now() + e2, this.forceUnduck();
  }
  forceUnduck() {
    if (this._ducked && this.inputNode && this.audioContext) {
      this._ducked = false;
      try {
        const e2 = this.inputNode.gain, t2 = this.audioContext.currentTime;
        e2.cancelScheduledValues(t2), e2.setValueAtTime(1, t2);
      } catch {
      }
    }
  }
  duckForUnderrun() {
    if (performance.now() < this._suppressDuckUntil) this.forceUnduck();
    else if ("undefined" != typeof document && document.hidden) this.forceUnduck();
    else if (!this._ducked && this.inputNode && this.audioContext) {
      this._ducked = true;
      try {
        const e2 = this.inputNode.gain, t2 = this.audioContext.currentTime;
        e2.cancelScheduledValues(t2), e2.setValueAtTime(e2.value, t2), e2.linearRampToValueAtTime(0, t2 + AudioRenderer.DUCK_FADE_OUT), d.debug(le, "Duck: engaged (underrun)");
      } catch {
      }
    }
  }
  unduckIfClean() {
    if (this._ducked && this.inputNode && this.audioContext && !this.isUnderrunning(AudioRenderer.DUCK_CLEAR_MS)) {
      this._ducked = false;
      try {
        const e2 = this.inputNode.gain, t2 = this.audioContext.currentTime;
        e2.cancelScheduledValues(t2), e2.setValueAtTime(e2.value, t2), e2.linearRampToValueAtTime(1, t2 + AudioRenderer.DUCK_FADE_IN), d.debug(le, "Duck: released (clean)");
      } catch {
      }
    }
  }
  getMaxScheduledMediaTime() {
    return this.maxScheduledMediaTime;
  }
  wireGraph() {
    if (this.audioContext && this.inputNode && this.gainNode && this.compressorNode) try {
      this.inputNode.disconnect(), this.compressorNode.disconnect(), this.gainNode.disconnect(), this._stableAudio ? (this.inputNode.connect(this.compressorNode), this.compressorNode.connect(this.gainNode), this.gainNode.connect(this.audioContext.destination)) : (this.inputNode.connect(this.gainNode), this.gainNode.connect(this.audioContext.destination));
    } catch {
      d.warn(le, "Failed to (re)wire audio chain");
    }
  }
  setStableAudio(e2) {
    this._stableAudio = e2, d.info(le, "Stable audio: " + (e2 ? "enabled" : "disabled")), this.wireGraph(), d.debug(le, "Audio chain rewired: compressor " + (e2 ? "active" : "bypassed")), e2 && this.audioContext ? this.setupContextStateMonitoring() : !e2 && this.audioContext && this.contextStateHandler && (this.audioContext.removeEventListener("statechange", this.contextStateHandler), this.contextStateHandler = null);
  }
  getStableAudio() {
    return this._stableAudio;
  }
  perceptualGain(e2) {
    return e2 <= 0 ? 0 : e2 >= 1 ? e2 : (Math.exp(6.908 * e2) - 1) / (Math.exp(6.908) - 1);
  }
  rampGain(e2) {
    if (this.gainNode && this.audioContext) try {
      const t2 = this.audioContext.currentTime;
      this.gainNode.gain.cancelScheduledValues(t2), this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, t2), this.gainNode.gain.linearRampToValueAtTime(e2, t2 + AudioRenderer.GAIN_RAMP_TIME);
    } catch {
      this.gainNode.gain.value = e2;
    }
  }
  setupContextStateMonitoring() {
    this.audioContext && (this.contextStateHandler && this.audioContext.removeEventListener("statechange", this.contextStateHandler), this.contextStateHandler = () => {
      if (!this.audioContext) return;
      const e2 = this.audioContext.state;
      "interrupted" === e2 || "suspended" === e2 && this.isPlaying && !this._muted && !this.intentionalSuspend ? (d.warn(le, `AudioContext ${e2} unexpectedly during playback, attempting recovery`), this.attemptContextRecovery()) : "running" === e2 && (this.recoveryAttempts = 0, me = true, d.debug(le, "AudioContext recovered to running state"));
    }, this.audioContext.addEventListener("statechange", this.contextStateHandler));
  }
  attemptContextRecovery() {
    if (this.audioContext && this.isPlaying) {
      if (this.recoveryAttempts >= AudioRenderer.MAX_RECOVERY_ATTEMPTS) return d.error(le, `AudioContext recovery failed after ${AudioRenderer.MAX_RECOVERY_ATTEMPTS} attempts`), void (this.recoveryAttempts = 0);
      this.recoveryAttempts++, d.debug(le, `AudioContext recovery attempt ${this.recoveryAttempts}/${AudioRenderer.MAX_RECOVERY_ATTEMPTS}`), this.audioContext.resume().then(() => {
        "running" === this.audioContext?.state && (d.info(le, "AudioContext recovered successfully"), this.recoveryAttempts = 0);
      }).catch((e2) => {
        d.warn(le, "AudioContext recovery failed", e2);
        const t2 = Math.min(1e3 * Math.pow(2, this.recoveryAttempts - 1), 5e3);
        setTimeout(() => this.attemptContextRecovery(), t2);
      });
    }
  }
  isAudioStarved() {
    if (!this.isPlaying || !this.hasFirstBuffer) return false;
    if (this.getBufferedDuration() > 0.1) return false;
    const e2 = performance.now() - this.lastDecodeTime;
    return this.lastDecodeTime > 0 && e2 > AudioRenderer.STARVATION_THRESHOLD && (this.isStarved || (this.isStarved = true, this.starvationStartTime = performance.now(), d.warn(le, `Audio starvation detected: ${e2.toFixed(0)}ms since last decode`)), true);
  }
  getStarvationDuration() {
    return this.isStarved && 0 !== this.starvationStartTime ? performance.now() - this.starvationStartTime : 0;
  }
  async destroy() {
    if (this.isPlaying = false, this.reset(), this.stopKeepalive(), this.keepaliveEl) {
      try {
        this.keepaliveEl.src = "";
      } catch {
      }
      this.keepaliveEl = null;
    }
    this.keepaliveUrl && (URL.revokeObjectURL(this.keepaliveUrl), this.keepaliveUrl = null), this.audioContext && this.contextStateHandler && (this.audioContext.removeEventListener("statechange", this.contextStateHandler), this.contextStateHandler = null);
    for (const e2 of [this.inputNode, this.compressorNode, this.gainNode]) try {
      e2?.disconnect();
    } catch {
    }
    this.audioContext = null, this.inputNode = null, this.gainNode = null, this.compressorNode = null, this.signalsmith && (this.signalsmith.destroy(), this.signalsmith = null), this.recoveryAttempts = 0, d.debug(le, "Destroyed");
  }
}
const ge = "ThumbnailRenderer";
class ThumbnailRenderer {
  canvas;
  gl = null;
  program = null;
  texture = null;
  vao = null;
  rotation = 0;
  vrProgram = null;
  vrVao = null;
  vrLocs = null;
  vrView = null;
  flatWidth = 0;
  flatHeight = 0;
  static VR_PREVIEW_HEIGHT = 256;
  static VR_FISHEYE_FOV = Math.PI;
  static VR_PLANET_SCALE = 0.5;
  decoder = null;
  pendingDecodeResolve = null;
  lastDecoderConfig = null;
  decoderRevivedUnproven = false;
  hasNativeHDRSupport = false;
  isHDRSource = false;
  isAnnexBSource = false;
  hdrEnabled = true;
  lastColorPrimaries;
  lastColorTransfer;
  constructor() {
    this.canvas = document.createElement("canvas");
  }
  detectChromium() {
    return !!window.chrome;
  }
  detectHDRColorSpace(e2, t2) {
    const i2 = (e2 || "").toLowerCase(), r2 = (t2 || "").toLowerCase();
    if (!this.hdrEnabled) return "srgb";
    const s2 = r2.includes("pq") || r2.includes("hlg") || r2.includes("smpte2084") || r2.includes("arib-std-b67"), a2 = i2.includes("bt2020") || i2.includes("rec2020");
    return s2 || a2 ? (d.debug(ge, `HDR content detected (primaries: ${e2}, transfer: ${t2}). Using display-p3.`), "display-p3") : i2.includes("p3") || i2.includes("display-p3") ? (d.debug(ge, "P3 content detected. Using display-p3."), "display-p3") : "srgb";
  }
  initialize(e2) {
    const { width: t2, height: i2, rotation: r2 = 0, colorPrimaries: s2, colorTransfer: a2, hdrEnabled: n2 = true } = e2;
    this.hdrEnabled = n2, this.lastColorPrimaries = s2, this.lastColorTransfer = a2, this.rotation = r2;
    const o2 = r2 % 180 != 0;
    this.canvas.width = o2 ? i2 : t2, this.canvas.height = o2 ? t2 : i2, this.flatWidth = this.canvas.width, this.flatHeight = this.canvas.height;
    const h2 = (s2 || "").toLowerCase(), c2 = (a2 || "").toLowerCase(), u2 = c2.includes("pq") || c2.includes("hlg") || c2.includes("smpte2084") || c2.includes("arib-std-b67"), l2 = h2.includes("bt2020") || h2.includes("rec2020");
    this.isHDRSource = u2 || l2;
    const f2 = this.detectHDRColorSpace(s2, a2);
    if (this.gl = this.canvas.getContext("webgl2", { alpha: false, antialias: false, depth: false, preserveDrawingBuffer: true }), !this.gl) throw new Error("WebGL2 not supported");
    try {
      "srgb" !== f2 && void 0 !== this.gl.drawingBufferColorSpace && (this.gl.drawingBufferColorSpace = f2, this.gl.unpackColorSpace = f2, d.debug(ge, `WebGL color space set to: ${f2}`));
    } catch (e3) {
      d.warn(ge, "Failed to set drawingBufferColorSpace", e3);
    }
    const m2 = this.detectChromium();
    this.hasNativeHDRSupport = m2, !this.hasNativeHDRSupport && this.isHDRSource ? (d.debug(ge, "Using shader-based HDR tone mapping (non-Chromium)"), this.initWebGLWithHDR()) : (d.debug(ge, "Using simple passthrough (Chromium native HDR)"), this.initWebGLSimple()), d.info(ge, `Initialized: ${t2}x${i2}, isChromium=${m2}, isHDR=${this.isHDRSource}, colorSpace=${f2}`);
  }
  initWebGLSimple() {
    if (!this.gl) return;
    const e2 = this.createProgram("#version 300 es\n    layout(location = 0) in vec2 a_position;\n    layout(location = 1) in vec2 a_texCoord;\n    out vec2 v_texCoord;\n    void main() {\n      gl_Position = vec4(a_position, 0.0, 1.0);\n      v_texCoord = a_texCoord;\n    }", "#version 300 es\n    precision highp float;\n    uniform sampler2D u_image;\n    in vec2 v_texCoord;\n    out vec4 outColor;\n    void main() {\n      outColor = texture(u_image, v_texCoord);\n    }");
    if (!e2) throw new Error("Failed to create shader program");
    this.program = e2, this.setupGeometry(), this.setupTexture();
  }
  initWebGLWithHDR() {
    if (!this.gl) return;
    const e2 = this.createProgram("#version 300 es\n    layout(location = 0) in vec2 a_position;\n    layout(location = 1) in vec2 a_texCoord;\n    out vec2 v_texCoord;\n    void main() {\n      gl_Position = vec4(a_position, 0.0, 1.0);\n      v_texCoord = a_texCoord;\n    }", "#version 300 es\n    precision highp float;\n    uniform sampler2D u_image;\n    uniform float u_hdrEnabled;\n    in vec2 v_texCoord;\n    out vec4 outColor;\n\n    // PQ (SMPTE 2084) EOTF constants\n    const float m1 = 2610.0 / 16384.0;\n    const float m2 = 2523.0 / 4096.0 * 128.0;\n    const float c1 = 3424.0 / 4096.0;\n    const float c2 = 2413.0 / 4096.0 * 32.0;\n    const float c3 = 2392.0 / 4096.0 * 32.0;\n\n    vec3 PQtoLinear(vec3 pq) {\n      vec3 colToPow = pow(pq, vec3(1.0 / m2));\n      vec3 num = max(colToPow - c1, vec3(0.0));\n      vec3 den = c2 - c3 * colToPow;\n      return pow(num / den, vec3(1.0 / m1));\n    }\n\n    vec3 toneMapReinhard(vec3 hdr, float exposure) {\n      vec3 mapped = hdr * exposure;\n      return mapped / (1.0 + mapped);\n    }\n\n    vec3 adjustSaturation(vec3 color, float saturation) {\n      float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));\n      vec3 gray = vec3(luminance);\n      return mix(gray, color, saturation);\n    }\n\n    void main() {\n      vec4 color = texture(u_image, v_texCoord);\n\n      // Apply PQ EOTF to get linear light\n      vec3 linear = PQtoLinear(color.rgb);\n\n      // Tone map to SDR range\n      float exposure = mix(22.0, 35.0, u_hdrEnabled);\n      vec3 sdr = toneMapReinhard(linear, exposure);\n\n      // Saturation boost\n      float saturation = mix(1.1, 1.5, u_hdrEnabled);\n      sdr = adjustSaturation(sdr, saturation);\n\n      // Apply gamma\n      vec3 display = pow(sdr, vec3(1.0/2.2));\n\n      outColor = vec4(display, color.a);\n    }");
    if (!e2) throw new Error("Failed to create shader program");
    if (this.program = e2, this.setupGeometry(), this.setupTexture(), !this.gl || !this.program) return;
    this.gl.useProgram(this.program);
    const t2 = this.gl.getUniformLocation(this.program, "u_hdrEnabled");
    t2 && this.gl.uniform1f(t2, this.hdrEnabled ? 1 : 0);
  }
  createProgram(e2, t2) {
    if (!this.gl) return null;
    const i2 = (e3, t3) => {
      if (!this.gl) return null;
      const i3 = this.gl.createShader(e3);
      return i3 ? (this.gl.shaderSource(i3, t3), this.gl.compileShader(i3), this.gl.getShaderParameter(i3, this.gl.COMPILE_STATUS) ? i3 : (d.error(ge, "Shader compile error:", this.gl.getShaderInfoLog(i3)), this.gl.deleteShader(i3), null)) : null;
    }, r2 = i2(this.gl.VERTEX_SHADER, e2), s2 = i2(this.gl.FRAGMENT_SHADER, t2);
    if (!r2 || !s2) return null;
    const a2 = this.gl.createProgram();
    return a2 ? (this.gl.attachShader(a2, r2), this.gl.attachShader(a2, s2), this.gl.linkProgram(a2), this.gl.getProgramParameter(a2, this.gl.LINK_STATUS) ? a2 : (d.error(ge, "Program link error:", this.gl.getProgramInfoLog(a2)), null)) : null;
  }
  setupGeometry() {
    if (!this.gl || !this.program) return;
    const e2 = this.gl;
    let t2 = [-1, 1, 0, 0, -1, -1, 0, 1, 1, 1, 1, 0, 1, -1, 1, 1];
    if (0 !== this.rotation) {
      const e3 = -this.rotation * Math.PI / 180, i3 = Math.cos(e3), r3 = Math.sin(e3);
      for (let e4 = 0; e4 < t2.length; e4 += 4) {
        const s2 = t2[e4], a2 = t2[e4 + 1];
        t2[e4] = s2 * i3 - a2 * r3, t2[e4 + 1] = s2 * r3 + a2 * i3;
      }
    }
    const i2 = new Float32Array(t2);
    this.vao = e2.createVertexArray(), e2.bindVertexArray(this.vao);
    const r2 = e2.createBuffer();
    e2.bindBuffer(e2.ARRAY_BUFFER, r2), e2.bufferData(e2.ARRAY_BUFFER, i2, e2.STATIC_DRAW), e2.enableVertexAttribArray(0), e2.vertexAttribPointer(0, 2, e2.FLOAT, false, 16, 0), e2.enableVertexAttribArray(1), e2.vertexAttribPointer(1, 2, e2.FLOAT, false, 16, 8);
  }
  async configureDecoder(e2, t2, i2, r2, s2, a2) {
    if (!("VideoDecoder" in window)) return d.warn(ge, "WebCodecs not supported in this browser"), false;
    this.lastDecoderConfig = { codec: e2, extradata: t2, width: i2, height: r2, profile: s2, level: a2 }, this.decoder && ("closed" !== this.decoder.state && this.decoder.close(), this.decoder = null);
    let n2 = null;
    void 0 !== s2 && (n2 = this.mapCodecToWebCodecs(e2, i2, r2, s2, a2)), n2 || (n2 = CodecParser.getCodecString(e2, t2 ?? void 0, i2, r2)), n2 ? d.debug(ge, "Resolved codec string:", n2) : (n2 = e2, d.warn(ge, "Failed to resolve codec string, using generic:", n2));
    try {
      const e3 = { codec: n2, codedWidth: i2, codedHeight: r2, hardwareAcceleration: "prefer-hardware" };
      if (!(await VideoDecoder.isConfigSupported(e3)).supported) return d.warn(ge, `Codec not supported by WebCodecs: ${n2}`), false;
    } catch (e3) {
      return d.warn(ge, `Failed to check codec support: ${n2}`, e3), false;
    }
    const o2 = n2;
    return new Promise((e3) => {
      try {
        this.decoder = new VideoDecoder({ output: (e4) => {
          this.renderVideoFrame(e4), e4.close(), this.pendingDecodeResolve && (this.pendingDecodeResolve(true), this.pendingDecodeResolve = null);
        }, error: (e4) => {
          d.error(ge, "VideoDecoder error:", e4), this.pendingDecodeResolve && (this.pendingDecodeResolve(false), this.pendingDecodeResolve = null);
        } });
        const s3 = { codec: o2, codedWidth: i2, codedHeight: r2, hardwareAcceleration: "prefer-hardware", optimizeForLatency: true }, a3 = t2 && (t2.length > 3 && 0 === t2[0] && 0 === t2[1] && 1 === t2[2] || t2.length > 4 && 0 === t2[0] && 0 === t2[1] && 0 === t2[2] && 1 === t2[3]);
        let h2 = t2 ?? void 0;
        if (a3 && t2) {
          const e4 = n2.startsWith("hvc1") || n2.startsWith("hev1"), i3 = n2.startsWith("avc1") || n2.startsWith("avc3");
          e4 ? (h2 = MoviVideoDecoder.annexBToHvcC(t2) ?? void 0, h2 && (this.isAnnexBSource = true, d.debug(ge, `Converted Annex B to hvcC for thumbnails (${h2.length}B)`))) : i3 ? (h2 = MoviVideoDecoder.annexBToAvcC(t2) ?? void 0, h2 && (this.isAnnexBSource = true, d.debug(ge, `Converted Annex B to avcC for thumbnails (${h2.length}B)`))) : h2 = void 0;
        }
        !h2 || n2.startsWith("vp09") || n2.startsWith("vp8") ? h2 || a3 || d.debug(ge, "Skipping description (extradata) for VPx codec or missing data") : s3.description = h2, this.decoder.configure(s3), e3(true);
      } catch (t3) {
        d.error(ge, "Failed to configure VideoDecoder:", t3), this.decoder = null, e3(false);
      }
    });
  }
  mapCodecToWebCodecs(e2, t2, i2, r2, s2) {
    const a2 = e2.toLowerCase();
    return "h264" === a2 || "avc1" === a2 ? "avc1.640028" : "hevc" === a2 || "h265" === a2 || "hvc1" === a2 ? 2 === r2 ? `hvc1.2.4.${s2 ? `L${s2}` : "L153"}.B0` : 1 === r2 ? `hvc1.1.6.${s2 ? `L${s2}` : "L120"}.B0` : 4 === r2 ? "hvc1.4.10.L93.B0" : "hvc1.1.6.L93.B0" : "vp9" === a2 ? 2 === r2 ? (d.info(ge, "Mapping VP9 Profile 2 to vp09.02.51.10.01.09.16.09.00 (HDR)"), "vp09.02.51.10.01.09.16.09.00") : 3 === r2 ? "vp09.03.51.10.01.09.16.09.00" : "vp09.00.41.08.01.01.01.01.00" : "av1" === a2 ? "av01.0.01M.08" : "vp8" === a2 ? "vp8" : null;
  }
  async decodeAndRender(e2, t2, i2) {
    let r2 = this.decoder;
    if (!r2 || "closed" === r2.state) {
      if (this.decoderRevivedUnproven) return d.debug(ge, "Decoder dead again before any successful decode — skipping recreate to avoid a loop"), false;
      if (!await this.recreateDecoder()) return false;
      if (this.decoderRevivedUnproven = true, r2 = this.decoder, !r2 || "closed" === r2.state) return false;
    }
    return new Promise((s2) => {
      this.pendingDecodeResolve = (e3) => {
        e3 && (this.decoderRevivedUnproven = false), s2(e3);
      };
      try {
        let s3 = e2;
        s3 = this.isAnnexBSource ? MoviVideoDecoder.annexBToLengthPrefixed(e2) : MoviVideoDecoder.stripAudLengthPrefixed(s3);
        const a2 = new EncodedVideoChunk({ type: "key", timestamp: 1e6 * t2, duration: i2, data: s3 });
        r2.decode(a2), r2.flush().catch((e3) => {
          d.error(ge, "Decoder flush error:", e3), this.pendingDecodeResolve && (this.pendingDecodeResolve(false), this.pendingDecodeResolve = null);
        });
      } catch (e3) {
        d.error(ge, "Decode error:", e3), this.pendingDecodeResolve && (this.pendingDecodeResolve(false), this.pendingDecodeResolve = null);
      }
    });
  }
  async recreateDecoder() {
    const e2 = this.lastDecoderConfig;
    if (!e2) return false;
    if (this.decoder) {
      try {
        "closed" !== this.decoder.state && this.decoder.close();
      } catch {
      }
      this.decoder = null;
    }
    return this.isAnnexBSource = false, d.debug(ge, "Recreating dead thumbnail decoder"), this.configureDecoder(e2.codec, e2.extradata, e2.width, e2.height, e2.profile, e2.level);
  }
  render(e2, t2, i2) {
    if (!(this.gl && this.program && this.texture && this.vao)) throw new Error("ThumbnailRenderer not initialized");
    const r2 = this.gl;
    r2.bindTexture(r2.TEXTURE_2D, this.texture), r2.texImage2D(r2.TEXTURE_2D, 0, r2.RGBA, t2, i2, 0, r2.RGBA, r2.UNSIGNED_BYTE, e2), this.draw();
  }
  renderVideoFrame(e2) {
    if (!(this.gl && this.program && this.texture && this.vao)) return;
    const t2 = this.gl;
    t2.bindTexture(t2.TEXTURE_2D, this.texture), t2.texImage2D(t2.TEXTURE_2D, 0, t2.RGBA, t2.RGBA, t2.UNSIGNED_BYTE, e2), this.draw();
  }
  setProjection(e2) {
    this.vrView = e2;
  }
  initVRProgram() {
    if (this.vrProgram && this.vrVao) return true;
    if (!this.gl) return false;
    const e2 = this.gl, t2 = this.createProgram("#version 300 es\n    layout(location = 0) in vec2 a_position;\n    out vec2 v_ndc;\n    void main() {\n      v_ndc = a_position;\n      gl_Position = vec4(a_position, 0.0, 1.0);\n    }", "#version 300 es\n    precision highp float;\n    uniform sampler2D u_image;\n    uniform float u_yaw;\n    uniform float u_pitch;\n    uniform float u_fov;\n    uniform float u_aspect;\n    uniform float u_lonDiv;\n    uniform float u_latDiv;\n    uniform float u_proj;\n    uniform float u_fishFov;\n    uniform float u_uScale;\n    uniform float u_uOffset;\n    uniform float u_planetScale;\n    uniform float u_srcAspect;\n    in vec2 v_ndc;\n    out vec4 outColor;\n    const float PI = 3.14159265358979323846;\n    void main() {\n      float t = tan(u_fov * 0.5);\n      vec3 dir = normalize(vec3(v_ndc.x * t * u_aspect, v_ndc.y * t, -1.0));\n      float cp = cos(u_pitch), sp = sin(u_pitch);\n      dir = vec3(dir.x, cp * dir.y - sp * dir.z, sp * dir.y + cp * dir.z);\n      float cy = cos(u_yaw), sy = sin(u_yaw);\n      dir = vec3(cy * dir.x + sy * dir.z, dir.y, -sy * dir.x + cy * dir.z);\n      vec2 eye;\n      if (u_proj < 0.5) {\n        float lon = atan(dir.x, -dir.z);\n        float lat = asin(clamp(dir.y, -1.0, 1.0));\n        eye = vec2(lon / u_lonDiv + 0.5, 0.5 - lat / u_latDiv);\n      } else if (u_proj < 1.5) {\n        float theta = acos(clamp(-dir.z, -1.0, 1.0));\n        float phi = atan(dir.y, dir.x);\n        float r = theta / (u_fishFov * 0.5);\n        eye = vec2(0.5 + 0.5 * r * cos(phi), 0.5 - 0.5 * r * sin(phi));\n      } else {\n        float a = acos(clamp(-dir.y, -1.0, 1.0));\n        float az = atan(dir.z, dir.x);\n        float r = tan(a * 0.5) * u_planetScale;\n        eye = vec2(0.5 + r * cos(az) / u_srcAspect, 0.5 + r * sin(az));\n      }\n      vec2 uv = vec2(eye.x * u_uScale + u_uOffset, eye.y);\n      outColor = texture(u_image, uv);\n    }");
    if (!t2) return d.warn(ge, "Failed to compile VR preview program"), false;
    this.vrProgram = t2, this.vrLocs = { image: e2.getUniformLocation(t2, "u_image"), yaw: e2.getUniformLocation(t2, "u_yaw"), pitch: e2.getUniformLocation(t2, "u_pitch"), fov: e2.getUniformLocation(t2, "u_fov"), aspect: e2.getUniformLocation(t2, "u_aspect"), lonDiv: e2.getUniformLocation(t2, "u_lonDiv"), latDiv: e2.getUniformLocation(t2, "u_latDiv"), proj: e2.getUniformLocation(t2, "u_proj"), fishFov: e2.getUniformLocation(t2, "u_fishFov"), uScale: e2.getUniformLocation(t2, "u_uScale"), uOffset: e2.getUniformLocation(t2, "u_uOffset"), planetScale: e2.getUniformLocation(t2, "u_planetScale"), srcAspect: e2.getUniformLocation(t2, "u_srcAspect") }, e2.useProgram(t2), this.vrLocs.image && e2.uniform1i(this.vrLocs.image, 0), this.vrVao = e2.createVertexArray(), e2.bindVertexArray(this.vrVao);
    const i2 = e2.createBuffer();
    return e2.bindBuffer(e2.ARRAY_BUFFER, i2), e2.bufferData(e2.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), e2.STATIC_DRAW), e2.enableVertexAttribArray(0), e2.vertexAttribPointer(0, 2, e2.FLOAT, false, 0, 0), e2.bindVertexArray(null), true;
  }
  drawVR(e2, t2) {
    const i2 = t2.aspect > 0 ? t2.aspect : 16 / 9, r2 = ThumbnailRenderer.VR_PREVIEW_HEIGHT, s2 = Math.max(64, Math.min(768, Math.round(r2 * i2)));
    this.canvas.width === s2 && this.canvas.height === r2 || (this.canvas.width = s2, this.canvas.height = r2), e2.bindTexture(e2.TEXTURE_2D, this.texture), e2.texParameteri(e2.TEXTURE_2D, e2.TEXTURE_WRAP_S, t2.half || t2.stereographic ? e2.CLAMP_TO_EDGE : e2.REPEAT), e2.viewport(0, 0, s2, r2), e2.clearColor(0, 0, 0, 1), e2.clear(e2.COLOR_BUFFER_BIT), e2.useProgram(this.vrProgram), e2.bindVertexArray(this.vrVao);
    const a2 = this.vrLocs, n2 = t2.sbs ? t2.texAspect / 2 : t2.texAspect, o2 = t2.half ? Math.PI : 2 * Math.PI, h2 = Math.min(Math.PI, o2 / (n2 || 2)), d2 = t2.stereographic ? 2 : t2.fisheye ? 1 : 0;
    a2.yaw && e2.uniform1f(a2.yaw, t2.yaw), a2.pitch && e2.uniform1f(a2.pitch, t2.pitch), a2.fov && e2.uniform1f(a2.fov, t2.fov), a2.aspect && e2.uniform1f(a2.aspect, s2 / r2), a2.lonDiv && e2.uniform1f(a2.lonDiv, o2), a2.latDiv && e2.uniform1f(a2.latDiv, h2), a2.proj && e2.uniform1f(a2.proj, d2), a2.fishFov && e2.uniform1f(a2.fishFov, ThumbnailRenderer.VR_FISHEYE_FOV), a2.uScale && e2.uniform1f(a2.uScale, t2.sbs ? 0.5 : 1), a2.uOffset && e2.uniform1f(a2.uOffset, 0), a2.planetScale && e2.uniform1f(a2.planetScale, ThumbnailRenderer.VR_PLANET_SCALE), a2.srcAspect && e2.uniform1f(a2.srcAspect, t2.texAspect || 1), e2.drawArrays(e2.TRIANGLE_STRIP, 0, 4);
  }
  draw() {
    if (!this.gl || !this.vao) return;
    const e2 = this.gl;
    this.vrView && this.initVRProgram() ? this.drawVR(e2, this.vrView) : this.program && (this.flatWidth && this.canvas.width !== this.flatWidth && (this.canvas.width = this.flatWidth, this.canvas.height = this.flatHeight), e2.viewport(0, 0, this.canvas.width, this.canvas.height), e2.clearColor(0, 0, 0, 1), e2.clear(e2.COLOR_BUFFER_BIT), e2.useProgram(this.program), e2.bindVertexArray(this.vao), e2.drawArrays(e2.TRIANGLE_STRIP, 0, 4));
  }
  setupTexture() {
    if (!this.gl || !this.program) return;
    const e2 = this.gl;
    this.texture = e2.createTexture(), e2.bindTexture(e2.TEXTURE_2D, this.texture), e2.texParameteri(e2.TEXTURE_2D, e2.TEXTURE_WRAP_S, e2.CLAMP_TO_EDGE), e2.texParameteri(e2.TEXTURE_2D, e2.TEXTURE_WRAP_T, e2.CLAMP_TO_EDGE), e2.texParameteri(e2.TEXTURE_2D, e2.TEXTURE_MIN_FILTER, e2.LINEAR), e2.texParameteri(e2.TEXTURE_2D, e2.TEXTURE_MAG_FILTER, e2.LINEAR), e2.useProgram(this.program);
    const t2 = e2.getUniformLocation(this.program, "u_image");
    t2 && e2.uniform1i(t2, 0);
  }
  setHDREnabled(e2) {
    if (this.hdrEnabled === e2) return;
    this.hdrEnabled = e2;
    const t2 = this.detectHDRColorSpace(this.lastColorPrimaries, this.lastColorTransfer);
    if (this.gl && void 0 !== this.gl.drawingBufferColorSpace) try {
      this.gl.drawingBufferColorSpace = t2, this.gl.unpackColorSpace = t2, d.info(ge, `Updated WebGL color space to ${t2} following HDR toggle`);
    } catch (e3) {
      d.warn(ge, "Failed to update drawingBufferColorSpace on the fly");
    }
    if (this.gl && this.program && !this.hasNativeHDRSupport && this.isHDRSource) {
      const e3 = this.gl.getUniformLocation(this.program, "u_hdrEnabled");
      e3 && (this.gl.useProgram(this.program), this.gl.uniform1f(e3, this.hdrEnabled ? 1 : 0));
    }
  }
  getCanvas() {
    return this.canvas;
  }
  destroy() {
    this.gl && (this.texture && (this.gl.deleteTexture(this.texture), this.texture = null), this.vao && (this.gl.deleteVertexArray(this.vao), this.vao = null), this.program && (this.gl.deleteProgram(this.program), this.program = null), this.vrVao && (this.gl.deleteVertexArray(this.vrVao), this.vrVao = null), this.vrProgram && (this.gl.deleteProgram(this.vrProgram), this.vrProgram = null)), this.gl = null, this.decoder && ("closed" !== this.decoder.state && this.decoder.close(), this.decoder = null);
  }
}
const pe = 67108864, be = 33554432, ve = /* @__PURE__ */ new Set(["ttf", "otf", "ttc", "woff", "woff2"]);
function ye(e2) {
  if (e2?.aborted) throw new MoviError({ code: "ABORTED", category: "lifecycle", message: "Embedded subtitle export was aborted.", recoverable: true });
}
function Se(e2) {
  return e2 && 0 !== e2.length ? new TextDecoder("utf-8").decode(e2).replace(/\0+$/gu, "") : "";
}
function we(e2) {
  const t2 = Math.max(0, Math.round(100 * e2)), i2 = t2 % 100, r2 = Math.floor(t2 / 100), s2 = r2 % 60, a2 = Math.floor(r2 / 60), n2 = a2 % 60;
  return `${Math.floor(a2 / 60)}:${n2.toString().padStart(2, "0")}:${s2.toString().padStart(2, "0")}.${i2.toString().padStart(2, "0")}`;
}
function ke(e2, t2) {
  const i2 = Math.max(0, Math.round(1e3 * e2)), r2 = i2 % 1e3, s2 = Math.floor(i2 / 1e3), a2 = s2 % 60, n2 = Math.floor(s2 / 60), o2 = n2 % 60;
  return `${Math.floor(n2 / 60).toString().padStart(2, "0")}:${o2.toString().padStart(2, "0")}:${a2.toString().padStart(2, "0")}${t2}${r2.toString().padStart(3, "0")}`;
}
function _e(e2, t2) {
  const i2 = Math.max(0, e2.timestamp - t2);
  return { start: i2, end: i2 + (Number.isFinite(e2.duration) && e2.duration > 0 ? e2.duration : 5) };
}
function Te(e2) {
  const t2 = e2.mimeType.toLowerCase();
  if (t2.startsWith("font/") || t2.includes("font")) return true;
  const i2 = e2.name.split(".").pop()?.toLowerCase() ?? "";
  return ve.has(i2);
}
const Ae = 272869232, Re = new Uint8Array([16, 67, 167, 112]), xe = new Uint8Array([24, 83, 128, 103]), Pe = new Uint8Array([17, 77, 155, 116]);
function Ee(e2, t2) {
  let i2 = 128;
  for (let r2 = 1; r2 <= t2; r2++) {
    if (0 !== (e2 & i2)) return r2;
    i2 >>= 1;
  }
  return 0;
}
function Ce(e2, t2, i2 = e2.byteLength) {
  if (t2 < 0 || t2 >= i2) return null;
  const r2 = Ee(e2[t2], 4);
  if (0 === r2 || t2 + r2 >= i2) return null;
  let s2 = 0;
  for (let i3 = 0; i3 < r2; i3++) s2 = 256 * s2 + e2[t2 + i3];
  const a2 = t2 + r2, n2 = Ee(e2[a2], 8);
  if (0 === n2 || a2 + n2 > i2) return null;
  const o2 = 1 << 8 - n2;
  let h2 = BigInt(e2[a2] & o2 - 1);
  for (let t3 = 1; t3 < n2; t3++) h2 = 256n * h2 + BigInt(e2[a2 + t3]);
  const d2 = h2 === (1n << BigInt(7 * n2)) - 1n, c2 = a2 + n2, u2 = d2 ? i2 : c2 + Number(h2 > BigInt(Number.MAX_SAFE_INTEGER) ? BigInt(Number.MAX_SAFE_INTEGER) : h2), l2 = Math.min(i2, u2);
  return { id: s2, start: t2, dataStart: c2, dataEnd: l2, end: l2, complete: d2 || u2 <= i2 };
}
function Fe(e2, t2) {
  const i2 = [];
  let r2 = t2.dataStart;
  for (; r2 < t2.dataEnd; ) {
    const s2 = Ce(e2, r2, t2.dataEnd);
    if (!s2 || s2.end <= r2) break;
    if (i2.push(s2), !s2.complete) break;
    r2 = s2.end;
  }
  return i2;
}
function Be(e2, t2, i2 = 0) {
  const r2 = e2.byteLength - t2.byteLength;
  e: for (let s2 = Math.max(0, i2); s2 <= r2; s2++) {
    for (let i3 = 0; i3 < t2.byteLength; i3++) if (e2[s2 + i3] !== t2[i3]) continue e;
    return s2;
  }
  return -1;
}
function De(e2, t2) {
  return e2.subarray(t2.dataStart, t2.dataEnd);
}
function Me(e2, t2) {
  let i2 = 0n;
  for (let r2 = t2.dataStart; r2 < t2.dataEnd; r2++) i2 = 256n * i2 + BigInt(e2[r2]);
  return i2;
}
function $e(e2, t2, i2) {
  return t2 ? 0n !== Me(e2, t2) : i2;
}
function Ie(e2, t2) {
  return t2 ? new TextDecoder("utf-8").decode(De(e2, t2)).replace(/\0+$/gu, "").trim() : "";
}
function Le(e2, t2) {
  return e2.find((e3) => e3.id === t2);
}
function Oe(e2, t2) {
  const i2 = Fe(e2, t2), r2 = Le(i2, 145);
  if (!r2) return null;
  const s2 = Ie(e2, Le(i2, 22100)), a2 = Le(i2, 29636), n2 = i2.filter((e3) => 128 === e3.id).map((t3) => function(e3, t4) {
    const i3 = Fe(e3, t4), r3 = Ie(e3, Le(i3, 133));
    return r3 ? { text: r3, language: Ie(e3, Le(i3, 17277)) || Ie(e3, Le(i3, 17276)) || void 0, country: Ie(e3, Le(i3, 17278)) || void 0 } : null;
  }(e2, t3)).filter((e3) => null !== e3), o2 = Le(i2, 146);
  return { id: s2 || (a2 ? Me(e2, a2).toString() : void 0), start: Number(Me(e2, r2)) / 1e9, end: o2 ? Number(Me(e2, o2)) / 1e9 : void 0, enabled: $e(e2, Le(i2, 17816), true), isHidden: $e(e2, Le(i2, 152), false), labels: n2, children: i2.filter((e3) => 182 === e3.id).map((t3) => Oe(e2, t3)).filter((e3) => null !== e3) };
}
function Ue(e2, t2, i2 = []) {
  const r2 = [];
  return e2.forEach((e3, s2) => {
    if (!e3.enabled) return;
    const a2 = [...i2, s2], n2 = e3.labels[0]?.text || `Chapter ${a2.map((e4) => e4 + 1).join(".")}`, o2 = e3.labels[0]?.language;
    r2.push({ id: e3.id || `${t2}:${a2.join(".")}`, title: n2, start: e3.start, end: e3.end, labels: e3.labels.length > 0 ? e3.labels.map((e4) => ({ ...e4 })) : [{ text: n2 }], language: o2, isHidden: e3.isHidden }), r2.push(...Ue(e3.children, t2, a2));
  }), r2;
}
function Ve(e2, t2) {
  const i2 = Ce(e2, 0), r2 = i2?.id === Ae ? i2 : (() => {
    const t3 = Be(e2, Re);
    return t3 >= 0 ? Ce(e2, t3) : null;
  })();
  if (!r2 || r2.id !== Ae || !r2.complete) return [];
  const s2 = Fe(e2, r2).filter((e3) => 17849 === e3.id).map((t3) => function(e3, t4) {
    const i3 = Fe(e3, t4), r3 = Le(i3, 17852);
    return { id: r3 ? Me(e3, r3).toString() : void 0, isDefault: $e(e3, Le(i3, 17883), false), isHidden: $e(e3, Le(i3, 17853), false), atoms: i3.filter((e4) => 182 === e4.id).map((t5) => Oe(e3, t5)).filter((e4) => null !== e4) };
  }(e2, t3)), a2 = s2.filter((e3) => !e3.isHidden), n2 = a2.length > 0 ? a2 : s2, o2 = n2.find((e3) => e3.isDefault) ?? n2[0];
  if (!o2) return [];
  const h2 = Ue(o2.atoms, o2.id || "edition-0").map((e3, t3) => ({ ...e3, sourceOrder: t3 })).sort((e3, t3) => e3.start - t3.start || e3.sourceOrder - t3.sourceOrder);
  return h2.map((e3, i3) => {
    const r3 = h2.slice(i3 + 1).find((t3) => t3.start > e3.start)?.start, s3 = r3 ?? (Number.isFinite(t2) && t2 > e3.start ? t2 : e3.start), { sourceOrder: a3, ...n3 } = e3;
    return { ...n3, end: void 0 !== e3.end && e3.end >= e3.start ? e3.end : s3 };
  });
}
async function ze(e2, t2, i2, r2, s2) {
  if (t2 < 0 || t2 >= i2) return [];
  const a2 = new Uint8Array(await e2.read(t2, Math.min(16, i2 - t2))), n2 = Ee(a2[0], 4);
  if (0 === n2 || n2 >= a2.byteLength) return [];
  let o2 = 0;
  for (let e3 = 0; e3 < n2; e3++) o2 = 256 * o2 + a2[e3];
  if (o2 !== Ae) return [];
  const h2 = Ee(a2[n2], 8);
  if (0 === h2 || n2 + h2 > a2.byteLength) return [];
  const d2 = 1 << 8 - h2;
  let c2 = BigInt(a2[n2] & d2 - 1);
  for (let e3 = 1; e3 < h2; e3++) c2 = 256n * c2 + BigInt(a2[n2 + e3]);
  if (c2 === (1n << BigInt(7 * h2)) - 1n || c2 > BigInt(r2) || c2 > BigInt(Number.MAX_SAFE_INTEGER)) return [];
  const u2 = n2 + h2, l2 = Number(c2);
  return l2 < 0 || l2 > r2 || t2 + u2 + l2 > i2 ? [] : Ve(new Uint8Array(await e2.read(t2, u2 + l2)), s2);
}
const Ne = "MoviPlayer";
class MoviPlayer extends EventEmitter {
  static _isMobileDevice = (() => {
    if ("undefined" == typeof navigator) return false;
    const e2 = navigator?.userAgentData;
    if (true === e2?.mobile) return true;
    const t2 = navigator.userAgent || "";
    return !!/Android|iPhone|iPod|Mobile|Opera Mini|IEMobile|BlackBerry/i.test(t2) || !!(/Macintosh/.test(t2) && (navigator.maxTouchPoints ?? 0) > 1);
  })();
  config;
  logger;
  source = null;
  cache;
  demuxer = null;
  trackSelectionGeneration = 0;
  audioSelectionTail = Promise.resolve();
  audioSelectionCommit = false;
  audioTrackSwitchInProgress = false;
  surface = null;
  renderingDiagnostics = { backend: "unknown", decoder: "unknown", renderer: "none", sourceDynamicRange: "unknown", outputDynamicRange: "unknown", outputVerification: "unknown", toneMapping: "unknown" };
  embeddedTextExportCache = /* @__PURE__ */ new Map();
  nativeAudioEl = null;
  _nativeAudioObjectUrl = null;
  _nativeAudioLogicalUrl = null;
  _nativeAudioAutoplayBlocked = false;
  _prefetchThrottleTimer = null;
  _audioOnlyPrefetchPaused = false;
  _nativeAudioGateActive = false;
  _audioTracks = [];
  _activeAudioLang = "";
  audioDemuxer = null;
  audioSource = null;
  audioAnimationFrameId = null;
  audioDemuxInFlight = false;
  _splitAudioTrackId = -1;
  _splitAudioEof = false;
  _destroyed = false;
  _lastSplitAudioPts = 0;
  _subtitleTracks = [];
  _activeSubtitleLang = "";
  _externalSubCues = [];
  _externalSubTimer = null;
  trackManager;
  clock;
  stateManager;
  mediaInfo = null;
  fileSize = -1;
  lastBufferedTime = 0;
  bufferedRangeStart = 0;
  setPreviewsEnabled(e2) {
    this.config.enablePreviews = e2, e2 && (this.previewInitGaveUp = false);
  }
  previewsAllowed() {
    return !!this.config.enablePreviews && 0 !== this.trackManager.getVideoTracks().length;
  }
  wireStreamWrapper(e2) {
    ["loadStart", "loadEnd", "play", "pause", "ended", "timeUpdate", "durationChange", "stateChange", "error", "buffering", "seeking", "seeked"].forEach((t2) => {
      "error" !== t2 ? e2.on(t2, (e3) => this.emit(t2, e3)) : e2.on("error", (e3) => {
        this.emitPlayerError(e3, { code: "NETWORK", category: "network" });
      });
    }), e2.trackManager.on("tracksChange", (e3) => {
      this.trackManager.setTracks(e3);
    });
  }
  publishStreamSurface(e2) {
    const t2 = this.streamWrapper?.getVideoElement() ?? null;
    this.surface = t2 ? { kind: "video", element: t2, reason: this.config.drm ? "drm" : "adaptive" } : this.config.canvas ? { kind: "canvas", element: this.config.canvas, reason: "adaptive" } : null, this.renderingDiagnostics = { ...this.renderingDiagnostics, backend: e2, decoder: "native", renderer: t2 ? "native-video" : "canvas", outputDynamicRange: "unknown", outputVerification: "unknown", toneMapping: "unknown" }, this.emit("surfaceChange", this.surface), this.emit("diagnosticsChange", this.getRenderingDiagnostics());
  }
  publishProgressiveDiagnostics() {
    const e2 = this.getActiveVideoTrack(), t2 = e2?.colorTransfer?.toLowerCase() ?? "", i2 = t2.includes("2084") || t2.includes("pq") ? "hdr10" : t2.includes("hlg") || t2.includes("arib") ? "hlg" : e2?.isHDR ? "hdr10" : e2 ? "sdr" : "unknown", r2 = this.videoRenderer?.getStats();
    this.renderingDiagnostics = { ...this.renderingDiagnostics, backend: "progressive-wasm", container: this.mediaInfo?.formatName, decoder: this.videoDecoder.isSoftware ? "wasm" : "webcodecs", renderer: this.videoRenderer ? "canvas" : "none", sourceDynamicRange: i2, outputDynamicRange: "unknown", outputVerification: "unknown", requestedColorSpace: e2?.colorSpace, appliedColorSpace: r2?.colorSpace, toneMapping: "unknown" }, this.emit("surfaceChange", this.surface), this.emit("diagnosticsChange", this.getRenderingDiagnostics());
  }
  isHostRenderedTextSubtitle(e2) {
    return !this.streamWrapper && "host" === this.config.embeddedTextSubtitleRenderer && "text" === e2?.subtitleType;
  }
  videoDecoder;
  audioDecoder;
  subtitleDecoder = null;
  videoRenderer = null;
  prefetchedSubtitleStream = null;
  prefetchInFlight = false;
  coverArt = null;
  streamWrapper = null;
  thumbnailBindings = null;
  thumbnailSource = null;
  thumbnailRenderer = null;
  thumbnailHDREnabled = true;
  isPreviewGenerating = false;
  audioRenderer;
  previewInitPromise = null;
  previewInitAttempts = 0;
  previewInitGaveUp = false;
  disableAudio = false;
  _audioOnly = false;
  muted = false;
  wasPlayingBeforeRebuffer = false;
  _stallStartTime = 0;
  _bufferingEntryTime = 0;
  _playStartTime = 0;
  _primingAudio = false;
  _decoderStuckSince = 0;
  _lastDesyncSeekTime = 0;
  animationFrameId = null;
  backgroundIntervalId = null;
  backgroundWorker = null;
  isBackgrounded = false;
  _foregroundRecoveryAt = 0;
  wakeLock = null;
  seekingToKeyframe = false;
  seekingToKeyframeStartTime = 0;
  static KEYFRAME_SEEK_TIMEOUT = 5e3;
  seekCraSeen = 0;
  static SEEK_IDR_WAIT_MS = 400;
  videoChainBrokenUntilKeyframe = false;
  static PREBUFFER_AUDIO_SECONDS = 0.5;
  static PREBUFFER_VIDEO_FRAMES = 2;
  static PREBUFFER_MAX_WALL_MS = 5e3;
  static PREBUFFER_MAX_PACKETS = 400;
  seekTargetTime = -1;
  waitingForVideoSync = false;
  pendingAudioPackets = [];
  pendingPrebufferPackets = [];
  _audioBatchPending = [];
  justSeeked = false;
  seekTime = 0;
  startTime = 0;
  seekKeyframeOffset = 0;
  static POST_SEEK_THROTTLE_MS = 1e3;
  pauseBufferTimerId = null;
  static PAUSE_BUFFER_INTERVAL_MS = 100;
  static PAUSE_BUFFER_MAX_PACKETS = 3e3;
  static PAUSE_BUFFER_AUDIO_SECONDS = 180;
  static PAUSE_BUFFER_VIDEO_FRAMES = 5400;
  constructor(e2) {
    super();
    const t2 = e2.drmConfig;
    this.config = t2 ? { ...e2, drm: true, licenseUrl: t2.licenseUrl, licenseHeaders: t2.licenseHeaders } : e2, this.logger = function(e3 = {}) {
      const t3 = e3.level ?? 0, i3 = (i4, r2, s2, a2) => {
        if (t3 < i4) return;
        const n2 = { level: i4, tag: r2, message: h(s2), details: a2.map(o) };
        if (e3.sink) return void e3.sink(n2);
        const d2 = `[movi:${r2}]`;
        1 === i4 ? globalThis.__movilog?.error(d2, n2.message, ...n2.details) : 2 === i4 ? globalThis.__movilog?.warn(d2, n2.message, ...n2.details) : 3 === i4 ? globalThis.__movilog?.info(d2, n2.message, ...n2.details) : 4 === i4 && globalThis.__movilog?.debug(d2, n2.message, ...n2.details);
      };
      return { error: (e4, t4, ...r2) => i3(1, e4, t4, r2), warn: (e4, t4, ...r2) => i3(2, e4, t4, r2), info: (e4, t4, ...r2) => i3(3, e4, t4, r2), debug: (e4, t4, ...r2) => i3(4, e4, t4, r2), trace: (e4, t4, ...r2) => i3(5, e4, t4, r2) };
    }(e2.logger), this._audioOnly = !!this.config.audioOnly, this.cache = new LRUCache(this.config.cache?.maxSizeMB ?? 100), this.trackManager = new TrackManager(), this.clock = new Clock(), this.stateManager = new PlayerStateManager(), j(a.SILENT), this.audioDecoder = new MoviAudioDecoder(), this.audioRenderer = new AudioRenderer(), this.subtitleDecoder = new SubtitleDecoder();
    const i2 = "software" === this.config.decoder;
    this.config.canvas || "canvas" === this.config.renderer ? this.config.canvas ? (this.videoDecoder = new MoviVideoDecoder(i2), this.videoRenderer = new CanvasRenderer(this.config.canvas), this.surface = { kind: "canvas", element: this.config.canvas, reason: "progressive" }, this.renderingDiagnostics = { ...this.renderingDiagnostics, backend: "progressive-wasm", decoder: i2 ? "wasm" : "webcodecs", renderer: "canvas" }, this.disableAudio ? (this.videoRenderer.setAudioTimeProvider(null, null), d.info(Ne, "Video renderer running independently (audio disabled)")) : this.videoRenderer.setAudioTimeProvider(() => this.audioRenderer.getAudioClock(), () => this.audioRenderer.hasHealthyBuffer()), this.videoRenderer.setOnPerformanceDegrade(() => {
      this.videoDecoder?.setPerformanceSkip(true);
    }), d.info(Ne, `Video renderer initialized with canvas (forceSoftware: ${i2})`)) : (d.warn(Ne, "Canvas renderer requested but no canvas element provided"), this.videoDecoder = new MoviVideoDecoder(i2)) : (this.videoDecoder = new MoviVideoDecoder(i2), d.info(Ne, "Video renderer initialized with default (WebCodecs decoder only)")), this.disableAudio ? (this.clock.setAudioProvider(null), d.info(Ne, "Clock running independently (audio disabled)")) : this.clock.setAudioProvider(this.audioRenderer), this.videoDecoder && (this.videoDecoder.setOnFrame((e3) => {
      if (!document.hidden || this.isPiPActive) if (this.videoRenderer && ("playing" === this.stateManager.getState() || this.waitingForVideoSync)) {
        const t3 = e3.timestamp / 1e6;
        if (-1 !== this.seekTargetTime && t3 < this.seekTargetTime) return void e3.close();
        -1 !== this.seekTargetTime && (this.waitingForVideoSync ? (d.debug(Ne, `onFrame: frameTime=${t3.toFixed(3)}s >= seekTargetTime=${this.seekTargetTime.toFixed(3)}s, calling notifySeekCompletion`), this.notifySeekCompletion(t3)) : this.seekTargetTime = -1), this.videoRenderer.queueFrame(e3);
      } else e3.close();
      else e3.close();
    }), this.videoDecoder.setOnError((e3) => {
      d.error(Ne, "Video decoder error", e3), this.emitPlayerError(e3, { code: "DECODE", category: "codec", recoverable: true });
    }), this.videoDecoder.onKeyframeWaitChange = (e3) => {
      const t3 = this.stateManager.getState();
      "seeking" === t3 || this.waitingForVideoSync || e3 && "playing" === t3 && d.debug(Ne, "Decoder waiting for keyframe mid-playback — staying in playing (audio/clock continue, video holds until next keyframe)");
    }), this.audioDecoder.setOnData((e3) => this.renderDecodedAudio(e3)), this.audioDecoder.setOnPCM((e3) => {
      this.audioRenderer.renderPCM(e3);
    }), this.audioDecoder.setOnError((e3) => {
      d.error(Ne, "Audio decoder error", e3), this.emitPlayerError(e3, { code: "DECODE", category: "codec", recoverable: true });
    }), this.stateManager.on("change", (e3) => {
      this.emit("stateChange", e3);
    }), this.trackManager.on("audioTrackChange", async (e3) => {
      this.audioSelectionCommit || (e3 ? await this.configureAudioTrack(e3) : d.warn(Ne, "Audio track change event received but track is null"));
    }), this.trackManager.on("tracksChange", (e3) => {
      this.emit("tracksChange", e3);
    }), d.info(Ne, "Player created"), document.addEventListener("visibilitychange", this.handleVisibilityChange), window.addEventListener("online", this.handleNetworkOnline);
  }
  emitPlayerError(e2, t2) {
    const i2 = s(e2, t2);
    return this.logger.error(Ne, i2.message, i2), this.emit("error", i2), i2;
  }
  async load(e2) {
    if (!this.stateManager.is("idle") && !e2) throw new Error("Player must be idle to load");
    e2 && (this.config.source = e2, this.stateManager.getState()), this.stateManager.setState("loading"), this.embeddedTextExportCache.clear(), this.emit("loadStart", void 0), this.lastBufferedTime = 0, this.bufferedRangeStart = 0, this.coverArt?.close?.(), this.coverArt = null, this.destroyPreviewPipeline();
    const t2 = this.config.source, i2 = !this.config.sourceAdapter && t2 && "url" === t2.type && t2.url ? t2.url : null, r2 = i2?.toLowerCase() ?? "", s2 = "url" === t2?.type ? t2.headers : void 0;
    if (i2 && (r2.includes(".m3u8") || r2.includes(".mpd") || r2.includes(".ism"))) {
      const e3 = r2.includes(".m3u8"), t3 = r2.includes(".mpd"), a2 = e3 ? "HLS" : r2.includes(".ism") ? "Smooth Streaming" : "DASH";
      this.trackManager.on("videoTrackChange", (e4) => {
        this.streamWrapper?.selectVideoTrack(e4 ? e4.id : -1);
      }), this.trackManager.on("audioTrackChange", (e4) => {
        e4 && this.streamWrapper?.selectAudioTrack(e4.id);
      }), this.trackManager.on("subtitleTrackChange", (e4) => {
        this.streamWrapper?.selectSubtitleTrack(e4 ? e4.id : null);
      });
      try {
        const { ShakaPlayerWrapper: e4 } = await import("./ShakaPlayerWrapper-9JRkCpIm.js"), t4 = new e4(this.config);
        return this.streamWrapper = t4, this.wireStreamWrapper(t4), d.info(Ne, `Detected ${a2} stream, using ShakaPlayerWrapper`), await t4.load(), this.publishStreamSurface("shaka"), void this.stateManager.setState("ready");
      } catch (r3) {
        d.warn(Ne, `Shaka failed on ${a2} stream`, r3);
        try {
          this.streamWrapper?.destroy();
        } catch {
        }
        if (this.streamWrapper = null, e3 || t3) try {
          const t4 = e3 ? new (await import("./HLSPlayerWrapper-BbUQJt9Y.js")).HLSPlayerWrapper(this.config) : new (await import("./DASHPlayerWrapper-Yx1JanrI.js")).DASHPlayerWrapper(this.config);
          return this.streamWrapper = t4, this.wireStreamWrapper(t4), d.info(Ne, "Shaka failed; retrying with " + (e3 ? "hls.js" : "dash.js")), await t4.load(), this.publishStreamSurface(e3 ? "hls.js" : "dash.js"), this.stateManager.setState("ready"), void d.info(Ne, "Recovered via " + (e3 ? "hls.js" : "dash.js"));
        } catch (t4) {
          d.warn(Ne, (e3 ? "hls.js" : "dash.js") + " fallback also failed", t4);
          try {
            this.streamWrapper?.destroy();
          } catch {
          }
          this.streamWrapper = null;
        }
        let n2 = false;
        if (t3) try {
          const e4 = await async function(e5, t4) {
            let i3, r4;
            try {
              const r5 = await fetch(e5, { headers: t4 });
              if (!r5.ok) return null;
              i3 = await r5.text();
            } catch (e6) {
              return d.warn(T, "Failed to fetch DASH manifest for fallback", e6), null;
            }
            try {
              r4 = new DOMParser().parseFromString(i3, "application/xml");
            } catch {
              return null;
            }
            if (r4.getElementsByTagName("parsererror").length > 0) return null;
            const s3 = r4.getElementsByTagName("MPD")[0];
            if (!s3) return null;
            const a3 = x(e5, P(s3));
            let n3 = null, o2 = null;
            const h2 = s3.getElementsByTagName("Period")[0];
            if (!h2) return null;
            const c2 = x(a3, P(h2));
            for (const e6 of Array.from(h2.getElementsByTagName("AdaptationSet"))) {
              const t5 = x(c2, P(e6));
              for (const i4 of Array.from(e6.getElementsByTagName("Representation"))) {
                if (!E(i4, e6)) continue;
                const r5 = x(t5, P(i4)), s4 = parseInt(i4.getAttribute("bandwidth") || "0", 10), a4 = C(i4, e6), h3 = i4.getAttribute("codecs") || e6.getAttribute("codecs") || "", d2 = A.test(h3) && R.test(h3);
                "video" === a4 ? (!n3 || s4 > n3.bw) && (n3 = { url: r5, bw: s4, muxed: d2 }) : "audio" === a4 && (!o2 || s4 > o2.bw) && (o2 = { url: r5, bw: s4 });
              }
            }
            if (!n3 && !o2) return null;
            if (!n3 && o2) return d.info(T, `DASH fallback (audio-only) → ${o2.url}`), { videoUrl: o2.url };
            const u2 = { videoUrl: n3.url };
            return !n3.muxed && o2 && (u2.audioUrl = o2.url), d.info(T, `DASH fallback → video=${u2.videoUrl}${u2.audioUrl ? `, audio=${u2.audioUrl}` : " (muxed)"}`), u2;
          }(i2, s2);
          e4 && (d.info(Ne, "Falling back to the FFmpeg demuxer"), this.source = await this.createSource({ type: "url", url: e4.videoUrl, headers: s2 }), e4.audioUrl && (this.config.audioSource = { type: "url", url: e4.audioUrl, headers: s2 }), n2 = true);
        } catch (e4) {
          d.warn(Ne, "FFmpeg DASH fallback failed", e4);
        }
        if (!n2) throw this.stateManager.setState("error"), r3;
      }
    }
    try {
      if (this.source) ;
      else if (this.config.sourceAdapter) this.source = this.config.sourceAdapter;
      else {
        if (!this.config.source) throw new Error("Either config.source or config.sourceAdapter is required");
        this.source = await this.createSource(this.config.source);
      }
      if (this.demuxer = new Demuxer(this.source, this.config.wasmBinary, false, this.config.assetBaseUrl), this.mediaInfo = await this.demuxer.open(), this._destroyed) return;
      if (this.fileSize = await this.source.getSize(), await this.enrichProgressiveChapters(), this._destroyed) return;
      const e3 = this.demuxer.getBindings();
      e3 && (this.videoDecoder.setBindings(e3), this.audioDecoder.setBindings(e3), this.subtitleDecoder && this.subtitleDecoder.setBindings(e3));
      let t3 = null;
      if (this.config.audioTracks && this.config.audioTracks.length > 0 ? (this._audioTracks = [...this.config.audioTracks], this._activeAudioLang = this._audioTracks[0].lang, t3 = this._audioTracks[0].url, d.info(Ne, `Multi-language audio: ${this._audioTracks.length} tracks, default=${this._activeAudioLang}`)) : "url" === this.config.audioSource?.type && this.config.audioSource.url && (t3 = this.config.audioSource.url), t3 && await this.setupSplitAudio(t3), this._destroyed) return;
      this.config.subtitleTracks && this.config.subtitleTracks.length > 0 && (this._subtitleTracks = [...this.config.subtitleTracks], d.info(Ne, `External subtitles: ${this._subtitleTracks.length} tracks`)), this.trackManager.setTracks(this.mediaInfo.tracks), this.extractCoverArt(), await this.configureDecoders(), this.startTime = this.mediaInfo.startTime || 0, this.seekKeyframeOffset = 0, this.clock.setDuration(this.mediaInfo.duration + this.startTime), this.clock.seek(this.startTime), this.emit("durationChange", this.mediaInfo.duration), await this.prebuffer(), this.stateManager.setState("ready"), this.emit("loadEnd", void 0), this.previewsAllowed() && (this.previewInitPromise = this.initPreviewPipeline().catch((e4) => {
        d.warn(Ne, "Preview pipeline init failed (non-critical)", e4), this.previewInitPromise = null;
      })), this.publishProgressiveDiagnostics(), d.info(Ne, `Loaded: duration=${this.mediaInfo.duration}s, tracks=${this.mediaInfo.tracks.length}`);
    } catch (e3) {
      throw this.stateManager.setState("error"), this.emitPlayerError(e3, { code: "SOURCE_UNAVAILABLE", category: "source" });
    }
  }
  async createSource(e2) {
    if ("file" === e2.type && e2.file) {
      const t2 = new FileSource(e2.file, this.cache, e2.name);
      return MoviPlayer._isMobileDevice && t2.setFullFilePreload(false), t2.setOnRevoked((e3) => {
        d.error(Ne, `File handle revoked: ${e3.reason}`), this.emit("filerevoked", e3);
      }), t2.setOnPreloadComplete(() => {
        this.emit("preloadcomplete", void 0);
      }), t2;
    }
    if ("encrypted" === e2.type && e2.encrypted) return new EncryptedHttpSource({ ...e2.encrypted, headers: e2.headers });
    if ("url" === e2.type && e2.url) {
      const t2 = this.config.cache?.maxSizeMB, i2 = new HttpSource(e2.url, e2.headers, t2);
      return i2.setOnLinearMode(() => this.emit("linearmode", void 0)), i2;
    }
    throw new Error("Invalid source configuration");
  }
  async enrichProgressiveChapters() {
    if (!this.mediaInfo || !this.source) return;
    const e2 = this.mediaInfo.formatName.toLowerCase();
    if (e2.includes("matroska") || e2.includes("webm")) try {
      const e3 = await async function(e4, t2, i2 = {}) {
        const r2 = await e4.fork?.();
        if (!r2) return [];
        const s2 = Math.max(65536, i2.scanBytes ?? 4194304), a2 = Math.max(65536, i2.maxChapterBytes ?? 8388608);
        try {
          const e5 = await r2.getSize();
          if (e5 <= 0) return [];
          const i3 = new Uint8Array(await r2.read(0, Math.min(e5, s2))), n2 = Be(i3, xe), o2 = n2 >= 0 ? Ce(i3, n2) : null;
          if (!o2 || 408125543 !== o2.id) return [];
          const h2 = o2.dataStart, d2 = Be(i3, Pe, h2);
          if (d2 >= 0) {
            const s3 = Ce(i3, d2);
            if (290298740 === s3?.id && s3.complete) {
              const n3 = function(e6, t3) {
                for (const i4 of Fe(e6, t3)) {
                  if (19899 !== i4.id) continue;
                  const t4 = Fe(e6, i4), r3 = Le(t4, 21419), s4 = Le(t4, 21420);
                  if (!r3 || !s4) continue;
                  const a3 = De(e6, r3);
                  if (a3.byteLength === Re.byteLength && a3.every((e7, t5) => e7 === Re[t5])) {
                    const t5 = Me(e6, s4);
                    return t5 <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(t5) : null;
                  }
                }
                return null;
              }(i3, s3);
              if (null !== n3) {
                const i4 = await ze(r2, h2 + n3, e5, a2, t2);
                if (i4.length > 0) return i4;
              }
            }
          }
          let c2 = Be(i3, Re, h2);
          for (; c2 >= 0; ) {
            const s3 = await ze(r2, c2, e5, a2, t2);
            if (s3.length > 0) return s3;
            c2 = Be(i3, Re, c2 + 1);
          }
          if (e5 > i3.byteLength) {
            const i4 = Math.max(0, e5 - s2), n3 = new Uint8Array(await r2.read(i4, e5 - i4));
            let o3 = Be(n3, Re);
            for (; o3 >= 0; ) {
              const s3 = await ze(r2, i4 + o3, e5, a2, t2);
              if (s3.length > 0) return s3;
              o3 = Be(n3, Re, o3 + 1);
            }
          }
          return [];
        } finally {
          r2.close();
        }
      }(this.source, this.mediaInfo.duration);
      !this._destroyed && e3.length > 0 && (this.mediaInfo.chapters = e3);
    } catch (e3) {
      this.logger.warn(Ne, "Matroska chapter enrichment failed", e3);
    }
    this._destroyed || this.emit("chaptersChange", this.mediaInfo.chapters.map((e3) => ({ ...e3, labels: e3.labels?.map((e4) => ({ ...e4 })) })));
  }
  async configureDecoders() {
    if (!this.demuxer) return;
    const e2 = this.trackManager.getActiveVideoTrack();
    if (e2 && this.videoDecoder) {
      const t3 = this.demuxer.getExtradata(e2.id) ?? void 0, i3 = this.config.frameRate ?? 0;
      if (await this.videoDecoder.configure(e2, t3, i3)) {
        if (d.info(Ne, `Video decoder configured: ${e2.codec} ${e2.width}x${e2.height}`), this.videoRenderer) {
          const t4 = this.config.frameRate || e2.frameRate;
          this.videoRenderer.configure(e2.width, e2.height, e2.colorPrimaries, e2.colorTransfer, t4, e2.rotation ?? 0, e2.isHDR, e2.pixelFormat);
        }
      } else d.warn(Ne, "Failed to configure video decoder");
    }
    const t2 = this.trackManager.getActiveAudioTrack();
    if (!t2 || this.disableAudio || this.audioDemuxer) t2 && this.disableAudio && d.info(Ne, "Audio processing disabled for debugging");
    else {
      const e3 = this.demuxer.getExtradata(t2.id) ?? void 0;
      if (await this.audioDecoder.configure(t2, e3)) {
        if (d.info(Ne, `Audio decoder configured: ${t2.codec} ${t2.sampleRate}Hz ${t2.channels}ch`), !this.disableAudio) {
          await this.audioRenderer.init();
          const e4 = t2.channels ?? 2, i3 = this.audioRenderer.getMaxChannelCount();
          e4 > 2 && i3 >= e4 ? (d.info(Ne, `Multichannel passthrough: source ${e4}ch, destination supports ${i3}ch`), this.audioDecoder.setDownmix(false), this.audioRenderer.setOutputChannelCount(e4)) : e4 > 2 && d.info(Ne, `Downmixing to stereo: source ${e4}ch, destination caps at ${i3}ch`);
        }
      } else d.warn(Ne, "Failed to configure audio decoder");
    }
    this.applyStreamDiscard();
    const i2 = this.trackManager.getActiveSubtitleTrack();
    if (i2 && this.subtitleDecoder && !this.isHostRenderedTextSubtitle(i2)) {
      const e3 = this.demuxer.getExtradata(i2.id) ?? void 0;
      if (await this.subtitleDecoder.configure(i2, e3)) {
        d.info(Ne, `Subtitle decoder configured: ${i2.codec} (${i2.subtitleType || "unknown"} type)`), this.subtitleDecoder.setOnCue((e5) => {
          d.debug(Ne, `Subtitle cue received: "${e5.text?.substring(0, 30)}..." (${e5.start.toFixed(2)}s - ${e5.end.toFixed(2)}s)`), this.videoRenderer ? (d.debug(Ne, "Setting subtitle cue on video renderer"), this.videoRenderer.setSubtitleCues([e5])) : d.warn(Ne, "Subtitle cue received but videoRenderer is null!");
        });
        const e4 = this.demuxer.getBindings();
        e4 && this.subtitleDecoder.setBindings(e4, false);
      } else d.warn(Ne, `Failed to configure subtitle decoder for track ${i2.id} (${i2.codec}) - subtitles will not be displayed`);
    }
  }
  nativeAudioOnlyPlayback() {
    return this._audioOnly && !!this.nativeAudioEl;
  }
  async prebuffer() {
    if (!this.demuxer) return;
    if (this.nativeAudioOnlyPlayback()) return;
    const e2 = !!this.trackManager.getActiveVideoTrack(), t2 = !!this.trackManager.getActiveAudioTrack() && !this.disableAudio && !this.nativeAudioEl;
    if (!e2 && !t2) return;
    const i2 = performance.now();
    let r2 = 0, s2 = 0, a2 = false;
    const n2 = () => !e2 || r2 >= MoviPlayer.PREBUFFER_VIDEO_FRAMES, o2 = () => !t2 || s2 >= MoviPlayer.PREBUFFER_AUDIO_SECONDS;
    for (; (!n2() || !o2()) && !a2 && this.pendingPrebufferPackets.length < MoviPlayer.PREBUFFER_MAX_PACKETS; ) {
      if (performance.now() - i2 > MoviPlayer.PREBUFFER_MAX_WALL_MS) {
        d.warn(Ne, `Prebuffer wall-clock timeout after ${MoviPlayer.PREBUFFER_MAX_WALL_MS}ms`);
        break;
      }
      let n3;
      try {
        n3 = await this.demuxer.readPacket();
      } catch (e3) {
        d.warn(Ne, "Prebuffer demux error, aborting prebuffer", e3);
        break;
      }
      if (!n3) {
        a2 = true;
        break;
      }
      if (this.pendingPrebufferPackets.push(n3), !this.trackManager.isActiveStream(n3.streamIndex)) continue;
      const o3 = this.trackManager.getActiveVideoTrack(), h2 = this.trackManager.getActiveAudioTrack();
      e2 && o3 && o3.id === n3.streamIndex ? r2++ : t2 && h2 && h2.id === n3.streamIndex && (s2 += n3.duration > 0 ? n3.duration : 0.02);
    }
    d.info(Ne, `Prebuffer complete: stashed=${this.pendingPrebufferPackets.length}, video=${r2}, audio=${s2.toFixed(2)}s, eof=${a2}`);
  }
  async play() {
    if (this.streamWrapper) return this.streamWrapper.play();
    if (this.stopPauseBuffering(), !this.stateManager.canPlay()) return void d.warn(Ne, "Cannot play in current state");
    if (this.nativeAudioOnlyPlayback()) return this.playNativeAudioOnly();
    const e2 = this.stateManager.getState();
    if ("buffering" === e2 || "seeking" === e2) return this.wasPlayingBeforeRebuffer = true, void d.info(Ne, `Play requested during ${e2} — will resume when ready`);
    if ("ended" === e2 && this.demuxer) {
      d.debug(Ne, "Replaying from beginning after ended state"), this.requestWakeLock(), this.wasPlayingBeforeSeek = true, this._playStartTime = performance.now();
      try {
        if (await this.seek(0, { suppressSpinner: true }), this.nativeAudioEl && this.nativeAudioEl.paused) {
          this.nativeAudioEl.playbackRate = this.clock.getPlaybackRate();
          try {
            await this.nativeAudioEl.play(), this._nativeAudioAutoplayBlocked = false;
          } catch (e3) {
            this._nativeAudioAutoplayBlocked = true, d.warn(Ne, "Native audio replay blocked — rolling video muted", e3);
          }
        }
      } catch (e3) {
        this.suppressSeekSpinner = false, this.wasPlayingBeforeSeek = false, d.warn(Ne, "Failed to seek to start on replay", e3);
      }
      return;
    }
    this.requestWakeLock();
    const t2 = this.clock.getTime() <= this.startTime + 1;
    if (0 === this._playStartTime && t2 && this.demuxer && !this.nativeAudioEl) {
      const e3 = 0;
      this.wasPlayingBeforeSeek = true;
      try {
        await this.seek(e3, { suppressSpinner: true }), this._playStartTime = performance.now();
      } catch (e4) {
        this.suppressSeekSpinner = false, this.wasPlayingBeforeSeek = false, d.warn(Ne, "First-play seek failed", e4);
      }
      return;
    }
    if (0 === this._playStartTime && this.demuxer) {
      const e3 = this.clock.getTime();
      await this.videoDecoder.flush(), await this.audioDecoder.flush(), this.videoRenderer && this.videoRenderer.clearQueue(), this.audioRenderer.reset();
      try {
        await this.demuxer.seek(e3);
      } catch (e4) {
        return d.error(Ne, "Demuxer seek on first play failed", e4), this.wasPlayingBeforeSeek = false, this.suppressSeekSpinner = false, this.stateManager.setState("error"), void this.emitPlayerError(e4, { code: "DEMUX", category: "demux" });
      }
      this.seekTargetTime = e3, this.disableAudio || await this.audioRenderer.play(), this.clock.seek(e3), this.pendingAudioPackets = [], this.pendingPrebufferPackets = [], this.eofReached = false, this.eofSince = 0;
    } else this.disableAudio ? d.debug(Ne, "Audio playback skipped (disabled for debugging)") : await this.audioRenderer.play(), this.videoRenderer && this.videoRenderer.dropStaleFrames(this.clock.getTime(), 0.2);
    if (this.videoRenderer && this.videoRenderer.startPresentationLoop(), this.nativeAudioEl) {
      const e3 = this.nativeAudioEl;
      e3.playbackRate = this.clock.getPlaybackRate();
      const t3 = Math.max(0, this.clock.getTime() - this.startTime);
      if (Math.abs(e3.currentTime - t3) > 0.3) try {
        e3.currentTime = t3;
      } catch {
      }
      e3.play().then(() => {
        this._nativeAudioAutoplayBlocked = false;
      }, () => {
        d.warn(Ne, "Native audio autoplay blocked — rolling video muted (tap to unmute)"), this._nativeAudioAutoplayBlocked = true;
      });
    }
    this.clock.start(), this._playStartTime = performance.now();
    const i2 = this.stateManager.getState();
    return "ready" !== i2 && "paused" !== i2 && "seeking" !== i2 ? (d.error(Ne, `Cannot transition to playing from state: ${i2}`), void this.clock.pause()) : this.stateManager.setState("playing") ? (null !== this.animationFrameId && (cancelAnimationFrame(this.animationFrameId), this.animationFrameId = null), "undefined" == typeof document || "hidden" !== document.visibilityState || this.isPiPActive || (this.isBackgrounded = true, this.videoRenderer && (this.videoRenderer.stopPresentationLoop(), this.videoRenderer.clearQueue()), (this.trackManager.getActiveAudioTrack() || this.audioDemuxer) && !this.disableAudio && this.startBackgroundTimer()), this._audioOnly && this.audioDemuxer || this.processLoop(), this.startAudioLoop(), void d.info(Ne, "Playing")) : (d.error(Ne, `Failed to transition to playing from state: ${i2}`), void this.clock.pause());
  }
  async playNativeAudioOnly() {
    const e2 = this.nativeAudioEl;
    if (!e2) return;
    if (this.requestWakeLock(), "ended" === this.stateManager.getState()) {
      try {
        e2.currentTime = 0, this.clock.seek(this.startTime);
      } catch {
      }
      this.stateManager.setState("seeking");
    }
    e2.playbackRate = this.clock.getPlaybackRate();
    try {
      await e2.play(), this._nativeAudioAutoplayBlocked = false;
    } catch {
      return d.warn(Ne, "Native audio autoplay blocked — staying paused for user gesture"), void ("paused" !== this.stateManager.getState() && this.stateManager.setState("paused"));
    }
    this.clock.start(), this._playStartTime = performance.now();
    const t2 = this.stateManager.getState();
    "ready" !== t2 && "paused" !== t2 && "seeking" !== t2 || this.stateManager.setState("playing"), d.info(Ne, "Playing (native-audio-only)");
  }
  pause() {
    if (this.streamWrapper) this.streamWrapper.pause();
    else if (this.stateManager.canPause()) {
      if ("buffering" === this.stateManager.getState()) return this.wasPlayingBeforeRebuffer = false, this.disableAudio || this.audioRenderer.pause(), this.nativeAudioEl && this.nativeAudioEl.pause(), this.videoRenderer && this.videoRenderer.stopPresentationLoop(), this.stateManager.setState("paused"), null !== this.animationFrameId && (cancelAnimationFrame(this.animationFrameId), this.animationFrameId = null), this.stopBackgroundTimer(), this.startPauseBuffering(), void d.info(Ne, "Paused during buffering");
      this.releaseWakeLock(), this.clock.pause(), this.disableAudio || this.audioRenderer.pause(), this.nativeAudioEl && this.nativeAudioEl.pause(), this.videoRenderer && this.videoRenderer.stopPresentationLoop(), this.stateManager.setState("paused"), null !== this.animationFrameId && (cancelAnimationFrame(this.animationFrameId), this.animationFrameId = null), this.stopBackgroundTimer(), this.startPauseBuffering(), d.info(Ne, "Paused");
    } else d.warn(Ne, "Cannot pause in current state");
  }
  demuxInFlight = false;
  demuxInFlightStartTime = 0;
  static DEMUX_TIMEOUT = 35e3;
  eofReached = false;
  eofSince = 0;
  renderDecodedAudio(e2) {
    if (-1 !== this.seekTargetTime && e2.timestamp / 1e6 < this.seekTargetTime) try {
      e2.close();
    } catch {
    }
    else this.audioRenderer.render(e2);
  }
  notifySeekCompletion(e2, t2 = false) {
    if (d.debug(Ne, `notifySeekCompletion called: time=${e2.toFixed(3)}s, waitingForVideoSync=${this.waitingForVideoSync}, seekTargetTime=${this.seekTargetTime.toFixed(3)}s, forced=${t2}`), !this.waitingForVideoSync) return void d.warn(Ne, "notifySeekCompletion: early return (waitingForVideoSync=false)");
    if (this.seekArmedSessionId !== this.seekSessionId) return void d.warn(Ne, `notifySeekCompletion: stale session ${this.seekArmedSessionId} != ${this.seekSessionId} — ignoring`);
    const i2 = !!this.videoRenderer && 0 === this.videoRenderer.getQueueSize(), r2 = t2 && i2 && !!this.trackManager.getActiveVideoTrack(), s2 = this.seekTargetTime;
    if (this.seekTargetTime = -1, this.waitingForVideoSync = false, this.seekingToKeyframe = false, this.suppressSeekSpinner = false, s2 >= 0 && (this.seekKeyframeOffset = Math.max(0, e2 - s2)), d.debug(Ne, `Seek completion at ${e2.toFixed(3)}s (target: ${s2.toFixed(3)}s)`), e2 > s2 + 0.01) {
      const t3 = 0.2;
      let i3 = e2, r3 = false;
      if (this.pendingAudioPackets.length > 0) {
        const s3 = Math.min(...this.pendingAudioPackets.map((e3) => e3.timestamp));
        if (s3 < e2) {
          const a3 = e2 - s3;
          a3 <= t3 ? (i3 = s3, r3 = true, d.debug(Ne, `Video arrived late (${e2.toFixed(3)}s), syncing clock to earliest audio (${i3.toFixed(3)}s) — gap ${(1e3 * a3).toFixed(0)}ms`)) : d.info(Ne, `Video-audio gap ${(1e3 * a3).toFixed(0)}ms exceeds ${1e3 * t3}ms; syncing clock to video (${e2.toFixed(3)}s) and dropping stale audio before that`);
        } else d.debug(Ne, `Stream jumped ahead. Syncing clock to video at ${i3.toFixed(3)}s.`);
      } else d.debug(Ne, `Stream jumped ahead. Syncing clock to ${i3.toFixed(3)}s.`);
      this.clock.seek(i3);
      const a2 = r3 ? s2 - 0.01 : i3 - 0.01;
      this.pendingAudioPackets = this.pendingAudioPackets.filter((e3) => e3.timestamp >= a2);
    }
    if ((this.wasPlayingBeforeSeek || this.wasPlayingBeforeRebuffer) && r2) d.info(Ne, "Seek forced-complete with no video frame yet — buffering until first frame"), this.wasPlayingBeforeSeek = false, this.wasPlayingBeforeRebuffer = true, this._bufferingEntryTime = performance.now(), this.stateManager.setState("buffering"), this.activeAudioNeedsColdPrime() && this.beginAudioPrime(), 0 === this._playStartTime && (this._playStartTime = performance.now());
    else if (this.wasPlayingBeforeSeek || this.wasPlayingBeforeRebuffer) {
      if (this.wasPlayingBeforeSeek = false, this.wasPlayingBeforeRebuffer = false, 0 === this._playStartTime && (this._playStartTime = performance.now()), this.activeAudioNeedsColdPrime()) return this.beginAudioPrime(), this.wasPlayingBeforeRebuffer = true, this._bufferingEntryTime = performance.now(), this.stateManager.setState("buffering"), this.clock.pause(), this.videoRenderer && this.videoRenderer.stopPresentationLoop(), void d.info(Ne, "Audio cold-prime: buffering until cushion");
      d.info(Ne, "Resuming playback after seek"), this.stateManager.setState("playing"), 0 === this._playStartTime && (this._playStartTime = performance.now()), this.clock.start(), this.disableAudio || this.audioRenderer.isAudioPlaying() || this.audioRenderer.play(), this.pendingAudioPackets.length > 0 && (d.debug(Ne, `Flushing ${this.pendingAudioPackets.length} buffered audio packets after seek sync`), this.submitAudioPackets(this.pendingAudioPackets), this.pendingAudioPackets = []);
    } else d.info(Ne, "Seek completed in paused state"), this.wasPlayingBeforeSeek = false, this.stateManager.setState("paused"), this.pendingAudioPackets = [], this.pendingPrebufferPackets = [], this.startPauseBuffering();
    this.emit("seeked", Math.max(0, e2 - this.startTime));
  }
  activeAudioNeedsColdPrime() {
    const e2 = (this.trackManager.getActiveAudioTrack()?.codec ?? "").toLowerCase();
    return !this.disableAudio && this.audioDecoder.usesSoftware && /truehd|mlp|dts|dca/.test(e2);
  }
  bindAudioDecoder(e2) {
    e2.setOnData((e3) => this.renderDecodedAudio(e3)), e2.setOnPCM((e3) => {
      this.audioRenderer.renderPCM(e3);
    }), e2.setOnError((e3) => {
      d.error(Ne, "Audio decoder error", e3), this.emitPlayerError(e3, { code: "DECODE", category: "codec", recoverable: true });
    });
  }
  async configureAudioTrack(e2) {
    if (!this.demuxer || this.disableAudio) return !this.disableAudio;
    this.audioTrackSwitchInProgress = true, this.pendingAudioPackets = [], this._audioBatchPending = [];
    try {
      this.audioDecoder.close();
      const t2 = new MoviAudioDecoder(), i2 = this.demuxer.getBindings();
      i2 && t2.setBindings(i2), this.bindAudioDecoder(t2);
      const r2 = this.demuxer.getExtradata(e2.id) ?? void 0;
      if (!await t2.configure(e2, r2)) return t2.close(), false;
      this.audioDecoder = t2;
      const s2 = e2.channels ?? 2, a2 = this.audioRenderer.getMaxChannelCount();
      return s2 > 2 && a2 >= s2 ? (this.audioDecoder.setDownmix(false), this.audioRenderer.setOutputChannelCount(s2)) : (this.audioDecoder.setDownmix(true), this.audioRenderer.setOutputChannelCount(2)), true;
    } catch (e3) {
      return d.warn(Ne, "Audio track decoder configuration failed", e3), false;
    } finally {
      this.audioTrackSwitchInProgress = false;
    }
  }
  applyStreamDiscard() {
    const e2 = this.demuxer?.getBindings();
    if (!e2) return;
    const t2 = this.trackManager.getActiveAudioTrack()?.id;
    for (const i2 of this.trackManager.getTracks()) "audio" === i2.type && e2.setStreamDiscard(i2.id, i2.id !== t2);
  }
  beginAudioPrime() {
    this.audioRenderer.primeForBuffering(), this.pendingAudioPackets.length > 0 && (this.submitAudioPackets(this.pendingAudioPackets), this.pendingAudioPackets = []), this._primingAudio = true;
  }
  submitAudioPackets(e2) {
    if (0 === e2.length) return;
    if (!this.audioDecoder.canBatch()) {
      for (const t3 of e2) this.audioDecoder.decode(t3.data, t3.timestamp, t3.keyframe);
      return;
    }
    let t2 = e2.map((e3) => ({ data: e3.data, pts: e3.timestamp }));
    for (; t2.length > 0; ) {
      const e3 = this.audioDecoder.decodeBatch(t2);
      if (e3 <= 0) break;
      if (e3 >= t2.length) break;
      t2 = t2.slice(e3);
    }
  }
  processLoop = async () => {
    const e2 = this.stateManager.getState();
    if ("playing" !== e2 && "buffering" !== e2 && !this.waitingForVideoSync) return;
    const t2 = this.seekSessionId;
    if (this.animationFrameId = requestAnimationFrame(this.processLoop), !this.demuxer) return;
    if (this.seekSessionId !== t2) return void d.debug(Ne, "ProcessLoop aborted: new seek started");
    if (!this.disableAudio && this.audioRenderer.isRebuffering()) "playing" === this.stateManager.getState() && (this.wasPlayingBeforeRebuffer = true, this._bufferingEntryTime = performance.now(), this.stateManager.setState("buffering"), this.clock.pause(), this.videoRenderer && this.videoRenderer.stopPresentationLoop(), d.debug(Ne, "Entered buffering state for playback rate change"));
    else if ("buffering" === this.stateManager.getState() && this.wasPlayingBeforeRebuffer) {
      const e3 = !!this.trackManager.getActiveAudioTrack(), t3 = !this.disableAudio && this.audioDecoder.usesSoftware, i3 = this._primingAudio || t3 ? 2 : 0.1, r3 = this.disableAudio || !e3 || this.audioRenderer.getBufferedDuration() > i3, s3 = !this.videoRenderer || this.videoRenderer.getQueueSize() > 0, a3 = performance.now() - this._bufferingEntryTime, n3 = 1500, o3 = this._primingAudio ? 4e3 : 3e3;
      a3 >= n3 && (r3 && s3 || r3 && a3 >= 3e3 || a3 >= o3) && (this._primingAudio = false, this.stateManager.setState("paused"), this.wasPlayingBeforeRebuffer = false, this.audioRenderer && this.audioRenderer.resumeFromBuffering(), d.info(Ne, "Buffers refilled, resuming playback"), this.play().catch((e4) => {
        d.error(Ne, "Failed to resume playback after rebuffering:", e4);
      }));
    }
    if (this.source instanceof FileSource && this.mediaInfo) {
      const e3 = this.clock.getTime(), t3 = this.mediaInfo.duration + this.startTime;
      t3 > 0 && this.source.updatePreloadPosition(e3, t3);
    }
    this.emit("timeUpdate", this.getCurrentTime());
    const i2 = this.mediaInfo && this.clock.getTime() >= this.mediaInfo.duration + this.startTime - 3, r2 = this.clock.getPlaybackRate(), s2 = this.mediaInfo?.videoFrameRate ?? 30, a2 = r2 < 0.99 && s2 >= 50 ? 2e3 : 500, n2 = this._playStartTime > 0 && performance.now() - this._playStartTime < 3e3, o2 = !!this.videoDecoder && this.videoDecoder.isRecentlyRecovering();
    if ("playing" !== this.stateManager.getState() || this.eofReached || this.waitingForVideoSync || i2 || this.isBackgrounded || n2) this._stallStartTime = 0;
    else {
      const e3 = !!this.videoRenderer && 0 === this.videoRenderer.getQueueSize(), t3 = !(!this.trackManager.getActiveAudioTrack() && !this.audioDemuxer || this.disableAudio), i3 = !t3 || this.audioRenderer.getBufferedDuration() < 0.05, r3 = this._foregroundRecoveryAt > 0 && performance.now() - this._foregroundRecoveryAt < 3e3, s3 = t3 && !r3 && this.audioRenderer.isUnderrunning();
      if (e3 && i3 && !o2 || s3) {
        const t4 = s3 && !e3 ? 200 : a2;
        this._stallStartTime ? performance.now() - this._stallStartTime > t4 && (d.warn(Ne, s3 ? "Stall detected: audio underrunning for 500ms (decode behind realtime), entering buffering state" : "Stall detected: buffers empty for 500ms, entering buffering state"), this.wasPlayingBeforeRebuffer = true, this._bufferingEntryTime = performance.now(), this.stateManager.setState("buffering"), this.clock.pause(), this.audioRenderer && this.audioRenderer.suspendForBuffering(), this.videoRenderer && this.videoRenderer.stopPresentationLoop(), this._stallStartTime = 0) : this._stallStartTime = performance.now();
      } else this._stallStartTime = 0;
    }
    if ("playing" === this.stateManager.getState() && !this.disableAudio && !this.muted && !n2 && Math.abs(this.clock.getPlaybackRate() - 1) < 0.01) {
      const e3 = this.audioRenderer.getAudioClock(), t3 = this.videoRenderer ? this.videoRenderer.currentTime ?? -1 : -1;
      if (e3 >= 0 && t3 > 0) {
        const i3 = t3 - e3, r3 = performance.now() - this._lastDesyncSeekTime;
        i3 > 0.5 && r3 > 5e3 && this.audioRenderer.getMaxScheduledMediaTime() < t3 - 0.1 && (d.warn(Ne, `Audio desync detected: video=${t3.toFixed(2)}s, audio=${e3.toFixed(2)}s, behind=${(1e3 * i3).toFixed(0)}ms — resyncing`), this._lastDesyncSeekTime = performance.now(), this.seek(this.getCurrentTime()).catch(() => {
        }));
      }
    }
    if (this.demuxInFlight) {
      const e3 = performance.now() - this.demuxInFlightStartTime;
      if (!(e3 > MoviPlayer.DEMUX_TIMEOUT)) return;
      d.warn(Ne, `Demux operation timeout after ${e3}ms, resetting flag`), this.demuxInFlight = false;
    }
    if (this.eofReached) {
      const e3 = this.clock.getTime(), t3 = this.mediaInfo?.duration ?? 0, i3 = e3 >= t3 + this.startTime - 0.5 || 0 === t3;
      if (this.trackManager?.getActiveAudioTrack() && !this.disableAudio) {
        const i4 = 0 === this.videoDecoder.queueSize && 0 === this.audioDecoder.queueSize, r3 = this.audioRenderer.getMaxScheduledMediaTime(), s3 = t3 > 0 && e3 >= t3 + this.startTime - 0.25, a3 = r3 > 0 && e3 >= r3 - 0.1 || s3, n3 = this.videoRenderer?.getHeadFrameTime() ?? -1, o3 = !this.videoRenderer || 0 === this.videoRenderer.getQueueSize() || i4 && r3 > 0 && n3 >= r3 - 0.05;
        if (i4 && o3 && a3 || 0 === t3) return void this.handleEnded();
        if (a3 && this.eofSince > 0 && performance.now() - this.eofSince > 750) return d.warn(Ne, "EOF watchdog: audio played out but pipeline never fully drained; forcing ended"), void this.handleEnded();
      } else if (i3) return void this.handleEnded();
      return;
    }
    const h2 = this.isSoftwareDecoding(), c2 = performance.now() - this.seekTime, u2 = this.justSeeked && c2 < MoviPlayer.POST_SEEK_THROTTLE_MS, l2 = this.disableAudio ? 0 : this.audioRenderer.getBufferedDuration(), f2 = this.videoRenderer?.getQueueSize() ?? 0, m2 = h2 ? 1e3 : u2 || this.waitingForVideoSync ? 60 : 30, g2 = h2 ? 500 : u2 || this.waitingForVideoSync ? 40 : 20, p2 = Math.max(0.25, this.clock.getPlaybackRate()), b2 = p2 < 1 ? 1 / p2 : Math.min(2, p2), v2 = (h2 ? 5 : u2 ? 1.5 : 2) * b2, y2 = this.trackManager.getActiveVideoTrack(), S2 = (y2?.width ?? 0) * (y2?.height ?? 0), w2 = Math.max(15, Math.min(120, y2?.frameRate ?? 30)), k2 = MoviPlayer._isMobileDevice;
    let _2;
    if (S2 >= 33177600) _2 = k2 ? u2 ? 8 : 12 : u2 ? 12 : 16;
    else if (S2 >= 8294400) _2 = k2 ? u2 ? 8 : 16 : u2 ? 24 : 48;
    else if (k2) {
      const e3 = u2 ? 400 : 800;
      _2 = Math.max(12, Math.round(w2 * e3 / 1e3));
    } else _2 = u2 ? 20 : 100;
    const T2 = Math.round((h2 ? 60 : _2) * b2), A2 = this.isBackgrounded && !this.isPiPActive || "buffering" === e2;
    this.videoDecoder.queueSize > m2 && 0 === f2 ? this._decoderStuckSince ? performance.now() - this._decoderStuckSince > 5e3 && (d.warn(Ne, `Video decoder stuck for 5s (queue=${this.videoDecoder.queueSize}, output=0), flushing`), this.videoDecoder.flush().catch(() => {
    }), this._decoderStuckSince = 0) : this._decoderStuckSince = performance.now() : this._decoderStuckSince = 0;
    const R2 = Math.abs(p2 - 1) > 0.01, x2 = !this.disableAudio && l2 < 0.1, P2 = this.videoDecoder.queueSize > m2, E2 = !A2 && f2 > T2, C2 = R2 && !this.muted && (E2 || P2) && x2, F2 = !this.disableAudio && !this.audioDemuxer;
    if (!A2 && !C2 && this.videoDecoder.queueSize > m2 || F2 && this.audioDecoder.queueSize > g2 || F2 && l2 > v2 || !A2 && !C2 && f2 > T2) this.waitingForVideoSync && (this.videoDecoder.queueSize > m2 || f2 > T2) && d.debug(Ne, `Backpressure during sync: videoDecoder=${this.videoDecoder.queueSize}, videoBuffered=${f2}`);
    else try {
      if (this.seekSessionId !== t2) return void d.debug(Ne, "ProcessLoop aborted before demux: new seek started");
      this.demuxInFlight = true, this.demuxInFlightStartTime = performance.now();
      const e3 = this.trackManager?.getActiveVideoTrack()?.frameRate ?? 30, i3 = Math.max(1, Math.ceil(e3 / 30));
      let r3 = 20 * i3;
      if (u2) r3 = 5 * i3, !this.disableAudio && !!this.trackManager?.getActiveAudioTrack() && l2 < 1 && (r3 = 160 * i3), d.debug(Ne, `Post-seek throttling: using burst size ${r3}`);
      else {
        this.justSeeked && c2 >= MoviPlayer.POST_SEEK_THROTTLE_MS && (this.justSeeked = false, d.debug(Ne, "Post-seek throttle period ended"));
        const t3 = this.videoRenderer?.getQueueSize() ?? 0, s4 = this.audioRenderer.getBufferedDuration(), a4 = !this.disableAudio && this.audioDecoder.usesSoftware;
        (t3 < 30 || s4 < (h2 || a4 ? 2 : e3 >= 60 ? 1 : 0.5)) && (r3 = !n2 || this.muted || this.disableAudio || h2 || a4 ? 160 * i3 : 20 * i3);
      }
      const s3 = !!this.trackManager?.getActiveAudioTrack() && !this.disableAudio, a3 = 60;
      this.videoDecoder.isWaitingForKeyframe && (r3 = Math.min(r3, 5));
      for (let e4 = 0; e4 < r3 && !(!s3 && this.videoRenderer && this.videoRenderer.getQueueSize() > a3); e4++) {
        if (!C2 && this.videoDecoder.queueSize > m2 || !this.disableAudio && this.audioDecoder.queueSize > g2) {
          u2 && d.debug(Ne, `Post-seek: queue full (video: ${this.videoDecoder.queueSize}, audio: ${this.audioDecoder.queueSize}), pausing burst`);
          break;
        }
        if (e4 > 0 && e4 % (u2 ? 2 * i3 : h2 ? 3 : 20 * i3) == 0) {
          const e5 = new MessageChannel();
          if (await new Promise((t3) => {
            e5.port1.onmessage = t3, e5.port2.postMessage(null);
          }), this.seekSessionId !== t2) return d.debug(Ne, "ProcessLoop aborted during packet read: new seek started"), void (this.demuxInFlight = false);
        }
        let r4;
        if (this.pendingPrebufferPackets.length > 0) r4 = this.pendingPrebufferPackets.shift();
        else if (r4 = await this.demuxer.readPacket(), this.seekSessionId !== t2) return d.debug(Ne, "ProcessLoop aborted after readPacket: new seek started"), void (this.demuxInFlight = false);
        if (!r4) {
          this.eofReached || (this.eofSince = performance.now()), this.eofReached = true, this.seekingToKeyframe && (this.seekingToKeyframe = false, d.warn(Ne, "EOF reached before finding keyframe after seek")), this.waitingForVideoSync && (d.warn(Ne, "EOF reached while waiting for seek sync, forcing completion"), this.notifySeekCompletion(this.seekTargetTime)), d.debug(Ne, "EOF reached");
          break;
        }
        if (this.trackManager.isActiveStream(r4.streamIndex)) {
          const e5 = this.trackManager.getActiveVideoTrack(), t3 = this.trackManager.getActiveAudioTrack();
          if (e5 && e5.id === r4.streamIndex) {
            if (this._audioOnly) continue;
            if (this.isBackgrounded && !this.isPiPActive) continue;
            if (C2 && !r4.keyframe) {
              this.videoChainBrokenUntilKeyframe = true;
              continue;
            }
            if (this.videoChainBrokenUntilKeyframe) {
              if (!r4.keyframe) continue;
              this.videoChainBrokenUntilKeyframe = false;
            }
            if (this.seekingToKeyframe) {
              const e6 = performance.now() - this.seekingToKeyframeStartTime, t4 = e6 > MoviPlayer.SEEK_IDR_WAIT_MS, i4 = r4.keyframe && -1 !== this.seekTargetTime && r4.timestamp <= this.seekTargetTime + 0.05, s4 = r4.keyframe && (r4.isIdr || t4 || i4);
              if (e6 > MoviPlayer.KEYFRAME_SEEK_TIMEOUT) d.warn(Ne, `Keyframe seek timeout after ${e6}ms, accepting any frame`), this.seekingToKeyframe = false;
              else {
                if (!s4) {
                  r4.keyframe && this.seekCraSeen++;
                  continue;
                }
                this.seekingToKeyframe = false, d.debug(Ne, `Found ${r4.isIdr ? "IDR" : "CRA"} keyframe after seek (craSkipped=${this.seekCraSeen}), resuming normal playback`), this.seekCraSeen = 0;
              }
            }
            this.videoDecoder && this.videoDecoder.decode(r4.data, r4.timestamp, r4.keyframe, r4.dts, r4.isIdr, r4.isRasl, r4.disposable);
          } else if (t3 && t3.id === r4.streamIndex) {
            if (!this.disableAudio && !this.audioTrackSwitchInProgress) {
              if (-1 !== this.seekTargetTime && r4.timestamp < this.seekTargetTime) continue;
              if (this.waitingForVideoSync && this.trackManager.getActiveVideoTrack()) {
                this.pendingAudioPackets.push(r4);
                continue;
              }
              -1 !== this.seekTargetTime && r4.timestamp >= this.seekTargetTime && (d.debug(Ne, `Audio reached seek target: ${r4.timestamp.toFixed(3)}s (target: ${this.seekTargetTime.toFixed(3)}s)`), this.trackManager.getActiveVideoTrack() || this.notifySeekCompletion(r4.timestamp)), this.audioDecoder.canBatch() ? this._audioBatchPending.push(r4) : this.audioDecoder.decode(r4.data, r4.timestamp, r4.keyframe);
            }
          } else {
            const e6 = this.trackManager.getActiveSubtitleTrack();
            if (e6 && e6.id === r4.streamIndex && this.subtitleDecoder && !this.isHostRenderedTextSubtitle(e6)) {
              let e7 = r4.duration;
              (!e7 || e7 <= 0) && (e7 = 0, d.debug(Ne, `Subtitle packet has no duration, will use fallback: timestamp=${r4.timestamp.toFixed(3)}s`)), d.debug(Ne, `Processing subtitle packet: stream=${r4.streamIndex}, size=${r4.data.length}, timestamp=${r4.timestamp.toFixed(3)}s, duration=${e7 > 0 ? e7.toFixed(3) : "fallback"}s`), this.subtitleDecoder.decode(r4.data, r4.timestamp, r4.keyframe, e7).catch((e8) => {
                d.error(Ne, "Subtitle decode error", e8);
              });
            }
          }
        }
      }
    } catch (e3) {
      d.error(Ne, "Demux error", e3);
      const t3 = e3.message || "", i3 = /out of bounds memory access|memory access out of bounds|RuntimeError|Aborted\(\)/i.test(t3) || t3.includes("Invalid packet size") || t3.includes("Invalid typed array length") || t3.includes("State may be corrupted"), r3 = /^HTTP \d{3}/.test(t3) || t3.includes("Access denied") || t3.includes("Authentication required") || t3.includes("Video not found") || t3.includes("Failed to fetch video resource") || t3.includes("Stream failed after") || t3.includes("Server does not support range requests");
      if (i3 || r3) return d.error(Ne, r3 ? `Fatal source error, pausing playback: ${t3}` : "Fatal demux error detected, pausing playback"), this.pause(), this.stateManager.setState("error"), void this.emitPlayerError(r3 ? e3 instanceof Error ? e3 : new Error(t3) : new Error("Playback error: corrupt data stream"), { code: r3 ? "SOURCE_UNAVAILABLE" : "DEMUX", category: r3 ? "source" : "demux" });
    } finally {
      if (this.demuxInFlight = false, this._audioBatchPending.length > 0) {
        const e3 = this._audioBatchPending;
        this._audioBatchPending = [], this.submitAudioPackets(e3);
      }
    }
  };
  handleEnded() {
    if (d.info(Ne, "Playback ended"), this.releaseWakeLock(), this.clock.pause(), this.disableAudio || this.audioRenderer.pause(), this.videoRenderer && this.videoRenderer.stopPresentationLoop(), null !== this.animationFrameId && (cancelAnimationFrame(this.animationFrameId), this.animationFrameId = null), this.mediaInfo) {
      this.seekKeyframeOffset = 0;
      const e2 = !!this.trackManager?.getActiveVideoTrack?.(), t2 = this.audioRenderer.getMaxScheduledMediaTime?.() ?? 0, i2 = !e2 && t2 > 0, r2 = i2 ? t2 : this.mediaInfo.duration;
      i2 && Math.abs(t2 - this.mediaInfo.duration) > 0.1 && (this.mediaInfo.duration = t2, this.clock.setDuration(t2 + this.startTime), this.emit("durationChange", t2)), this.clock.seek(r2 + this.startTime), this.emit("timeUpdate", r2);
    }
    this.stateManager.setState("ended"), this.emit("ended", void 0);
  }
  seekSessionId = 0;
  seekArmedSessionId = 0;
  wasPlayingBeforeSeek = false;
  suppressSeekSpinner = false;
  async seek(e2, t2) {
    if (this.streamWrapper) return this.streamWrapper.seek(e2);
    if (this.nativeAudioOnlyPlayback() && this.nativeAudioEl) {
      const t3 = Math.max(0, Math.min(e2, this.getDuration() || e2));
      try {
        this.nativeAudioEl.currentTime = t3;
      } catch {
      }
      return this.clock.seek(t3 + this.startTime), this.seekKeyframeOffset = 0, this.eofReached = false, this.eofSince = 0, this.emit("seeking", t3), this.emit("timeUpdate", t3), void this.emit("seeked", t3);
    }
    if (this._audioOnly && this.audioDemuxer && !this.nativeAudioEl) {
      const t3 = Math.max(0, Math.min(e2, this.getDuration() || e2));
      this.stopAudioLoop();
      let i3 = 0;
      for (; this.audioDemuxInFlight && i3++ < 200; ) await new Promise((e3) => setTimeout(e3, 5));
      this.audioDecoder.flush(), this.audioRenderer.reset();
      try {
        await this.audioDemuxer.seek(t3 + this.startTime);
      } catch (e3) {
        d.warn(Ne, `Split audio-only seek failed: ${e3?.message ?? e3}`);
      }
      return this._splitAudioEof = false, this._lastSplitAudioPts = t3, this.seekTargetTime = -1, this.clock.seek(t3 + this.startTime), this.seekKeyframeOffset = 0, this.eofReached = false, this.eofSince = 0, (this.wasPlayingBeforeSeek || this.wasPlayingBeforeRebuffer || this.stateManager.is("playing") || this.stateManager.is("buffering")) && (this.wasPlayingBeforeSeek = false, this.wasPlayingBeforeRebuffer = false, 0 === this._playStartTime && (this._playStartTime = performance.now()), this.stateManager.is("playing") || this.stateManager.setState("playing"), this.clock.start(), this.disableAudio || this.audioRenderer.isAudioPlaying() || this.audioRenderer.play(), this.startAudioLoop()), this.emit("seeking", t3), this.emit("timeUpdate", t3), void this.emit("seeked", t3);
    }
    if (this.suppressSeekSpinner = t2?.suppressSpinner ?? false, t2?.preservePlaying) {
      const e3 = this.stateManager.getState();
      "paused" !== e3 && "ended" !== e3 && (this.wasPlayingBeforeSeek = true);
    }
    const i2 = this.stateManager.getState();
    if (d.info(Ne, `seek(${e2.toFixed(2)}): state=${i2}, waitingForVideoSync=${this.waitingForVideoSync}, demuxInFlight=${this.demuxInFlight}, seekSessionId=${this.seekSessionId}`), !this.stateManager.canSeek()) return void d.warn(Ne, `seek blocked: canSeek=false, state=${i2}`);
    if (!this.demuxer) throw new Error("Demuxer not initialized");
    this.stopPauseBuffering(), "seeking" === i2 || this.wasPlayingBeforeSeek || (this.wasPlayingBeforeSeek = "playing" === i2 || "buffering" === i2 && this.wasPlayingBeforeRebuffer), this.clock.pause(), this.seekKeyframeOffset = 0;
    const r2 = ++this.seekSessionId;
    this.stateManager.setState("seeking"), this.emit("seeking", e2), null !== this.animationFrameId && (cancelAnimationFrame(this.animationFrameId), this.animationFrameId = null);
    try {
      if (this.demuxInFlight) {
        let e3 = 0;
        for (; this.demuxInFlight && e3 < 100; ) {
          if (this.seekSessionId !== r2) return void (this.demuxInFlight = false);
          await new Promise((e4) => setTimeout(e4, 10)), e3++;
        }
      }
      if (this.seekSessionId !== r2) return;
      if (d.info(Ne, "seek: flushing video decoder..."), await this.videoDecoder.flush(), d.info(Ne, "seek: flushing audio decoder..."), await this.audioDecoder.flush(), this._audioBatchPending = [], d.info(Ne, "seek: decoders flushed"), this.videoRenderer && this.videoRenderer.clearQueue(), this.audioRenderer.reset(), this.seekSessionId !== r2) return;
      if (this.source?.hintSeek?.(), d.info(Ne, `seek: demuxer.seek(${(e2 + this.startTime).toFixed(2)}) starting...`), await this.demuxer.seek(e2 + this.startTime), this.audioDemuxer) {
        this.stopAudioLoop();
        let t4 = 0;
        for (; this.audioDemuxInFlight && t4++ < 200; ) await new Promise((e3) => setTimeout(e3, 5));
        try {
          await this.audioDemuxer.seek(e2 + this.startTime);
        } catch (e3) {
          d.warn(Ne, `Split audio seek failed: ${e3?.message ?? e3}`);
        }
        this._splitAudioEof = false, this._lastSplitAudioPts = e2;
      }
      d.info(Ne, "seek: demuxer.seek done"), this.clock.seek(e2 + this.startTime), this.eofReached = false, this.eofSince = 0, this.lastBufferedTime = 0, this.bufferedRangeStart = e2, this.seekingToKeyframe = true, this.seekingToKeyframeStartTime = performance.now(), this.seekCraSeen = 0, this.videoChainBrokenUntilKeyframe = false, this.seekTargetTime = e2 + this.startTime, this.waitingForVideoSync = true, this.seekArmedSessionId = r2, this.pendingAudioPackets = [], this.pendingPrebufferPackets = [];
      const t3 = this.isSeekTargetBuffered(e2);
      if (t3 ? (this.justSeeked = false, d.info(Ne, "Seek within buffered range — skipping post-seek throttle")) : this.justSeeked = true, this.seekTime = performance.now(), this.seekSessionId !== r2) return;
      d.info(Ne, `seek: starting processLoop, waitingForVideoSync=${this.waitingForVideoSync}, state=${this.stateManager.getState()}`), this.processLoop(), this.startAudioLoop(), this.videoRenderer && this.videoRenderer.startPresentationLoop();
      const i3 = t3 ? 1500 : 3e3, s2 = setTimeout(() => {
        this.seekSessionId === r2 && this.waitingForVideoSync && (d.warn(Ne, `Seek timeout after ${i3}ms, forcing completion at ${e2}s`), this.notifySeekCompletion(e2 + this.startTime, true));
      }, i3), a2 = () => {
        clearTimeout(s2), this.off("seeked", a2);
      };
      this.on("seeked", a2), d.info(Ne, `Seek initiated to ${e2}s, waiting for sync...`);
    } catch (e3) {
      throw this.seekingToKeyframe = false, this.seekSessionId === r2 && (this.stateManager.setState("error"), this.emitPlayerError(e3, { code: "DEMUX", category: "demux" })), e3;
    }
  }
  isSeekTargetBuffered(e2) {
    if (!this.mediaInfo || !this.source || this.fileSize <= 0) return false;
    const t2 = this.mediaInfo.duration;
    if (t2 <= 0) return false;
    if (this.source instanceof FileSource) return true;
    if (this.source instanceof HttpSource) {
      if (this.source.isFullyCached()) return true;
      const i2 = this.source.getBufferStart(), r2 = this.source.getBufferedEnd(), s2 = Math.min(1, (e2 + this.startTime) / (t2 + this.startTime)) * this.fileSize;
      return s2 >= i2 - 0.02 * this.fileSize && s2 <= r2;
    }
    if ("getBufferedEnd" in this.source) {
      const i2 = this.source.getBufferedEnd();
      if (i2 > 0) return Math.min(1, (e2 + this.startTime) / (t2 + this.startTime)) * this.fileSize <= i2;
    }
    return false;
  }
  async getPreviewFrame(e2, t2) {
    if (this._audioOnly) return null;
    if (!this.previewsAllowed()) return null;
    if (this.streamWrapper) return this.streamWrapper.getThumbnailBlob?.(e2) ?? null;
    if (this.previewInitGaveUp) return null;
    if (this.isPreviewGenerating) return null;
    if (!this.trackManager.getActiveVideoTrack()) return null;
    this.isPreviewGenerating = true;
    try {
      if (!this.thumbnailBindings) {
        if (this.previewInitPromise) {
          d.debug(Ne, "Waiting for existing preview initialization...");
          try {
            await this.previewInitPromise;
          } catch {
            this.previewInitPromise = null;
          }
        }
        if (!this.thumbnailBindings) {
          if (++this.previewInitAttempts > 3) return this.previewInitGaveUp = true, d.warn(Ne, "Thumbnail pipeline init failed repeatedly — disabling previews."), null;
          d.debug(Ne, "Initializing thumbnail pipeline (retry)..."), this.previewInitPromise = this.initPreviewPipeline();
          try {
            await this.previewInitPromise;
          } catch {
            this.previewInitPromise = null;
          }
        }
      }
      if (!this.thumbnailBindings || !this.thumbnailRenderer) return d.warn(Ne, "Thumbnail bindings or renderer not available"), null;
      this.thumbnailRenderer.setProjection(t2 ?? null);
      const i2 = await this.thumbnailBindings.readKeyframe(e2);
      if (d.debug(Ne, `Thumbnail readKeyframe(${e2.toFixed(2)}s): size=${i2}`), i2 <= 0) return -6 !== i2 && d.warn(Ne, `Thumbnail read failed or empty: ${i2}`), null;
      const r2 = this.thumbnailBindings.getPacketPts(), s2 = this.thumbnailBindings.getPacketData();
      if (d.debug(Ne, `Thumbnail packet: pts=${r2.toFixed(2)}s, ptr=${s2}, size=${i2}`), !s2) return d.warn(Ne, "Thumbnail packet data pointer is null"), null;
      const a2 = this.thumbnailBindings.getPacketDataCopy(i2);
      if (!a2) return d.warn(Ne, "Failed to copy thumbnail packet data"), null;
      let n2 = false;
      try {
        n2 = await this.thumbnailRenderer.decodeAndRender(a2, r2);
      } catch (e3) {
        d.warn(Ne, "Thumbnail WebCodecs decode failed", e3);
      }
      if (!n2) try {
        const e3 = this.trackManager.getActiveVideoTrack();
        let t3 = 320, i3 = 180;
        e3 && (t3 = e3.width, i3 = e3.height);
        const r3 = this.thumbnailBindings.decodeCurrentPacket(t3, i3);
        r3 && r3.length > 0 ? (this.thumbnailRenderer.render(r3, t3, i3), this.thumbnailBindings.clearBuffer(), n2 = true) : d.warn(Ne, "Software thumbnail decoder returned no data");
      } catch (e3) {
        d.error(Ne, "Software thumbnail fallback exception", e3);
      }
      if (n2) {
        const e3 = this.thumbnailRenderer.getCanvas();
        if ("toBlob" in e3) return new Promise((t3) => {
          e3.toBlob((e4) => t3(e4), "image/jpeg", 0.7);
        });
        if ("convertToBlob" in e3) return await e3.convertToBlob({ type: "image/jpeg", quality: 0.7 });
      }
      return null;
    } catch (e3) {
      return d.warn(Ne, "Preview generation failed", e3), null;
    } finally {
      this.isPreviewGenerating = false, this.thumbnailSource && "clearBuffer" in this.thumbnailSource && this.thumbnailSource.clearBuffer();
    }
  }
  async generateTimeline(e2 = 8, t2) {
    const i2 = this.mediaInfo?.duration ?? 0;
    if (i2 <= 0) return [];
    const r2 = [], s2 = i2 / (e2 + 1);
    for (let i3 = 1; i3 <= e2; i3++) {
      const a2 = s2 * i3, n2 = await this.getPreviewFrame(a2);
      n2 && (r2.push({ time: a2, blob: n2 }), t2?.(i3, e2, n2, a2));
    }
    return r2;
  }
  async initPreviewPipeline() {
    if (this.thumbnailBindings) return;
    d.debug(Ne, "Initializing thumbnail pipeline...");
    const e2 = await V({ wasmBinary: this.config.wasmBinary, assetBaseUrl: this.config.assetBaseUrl });
    d.debug(Ne, "Isolated WASM module loaded for thumbnails");
    const t2 = this.config.source, i2 = t2 && "string" != typeof t2 && "encrypted" === t2.type;
    if (this.config.sourceAdapter && this.source) this.thumbnailSource = this.source;
    else if (i2 && this.source) this.thumbnailSource = this.source;
    else {
      const e3 = this.source && "function" == typeof this.source.peekMetadata && "function" == typeof this.source.peekRange ? this.source : null;
      if ("string" == typeof t2) this.thumbnailSource = new ThumbnailHttpSource(t2, {}, e3);
      else if (t2 && "url" in t2 && t2.url) this.thumbnailSource = new ThumbnailHttpSource(t2.url, t2.headers || {}, e3);
      else if (t2) this.thumbnailSource = await this.createSource(t2);
      else {
        if (!this.source) throw new Error("No source available for thumbnail pipeline");
        this.thumbnailSource = this.source;
      }
      this.fileSize > 0 && this.thumbnailSource && "seedSize" in this.thumbnailSource && "function" == typeof this.thumbnailSource.seedSize && this.thumbnailSource.seedSize(this.fileSize);
    }
    const r2 = await this.thumbnailSource.getSize();
    d.debug(Ne, `Thumbnail source created, file size: ${r2}`), this.thumbnailBindings = new ThumbnailBindings(e2);
    const s2 = { read: async (e3, t3) => {
      if (!this.thumbnailSource) throw new Error("No thumbnail source");
      const i3 = await this.thumbnailSource.read(e3, t3);
      return new Uint8Array(i3);
    }, getSize: async () => {
      if (!this.thumbnailSource) throw new Error("No thumbnail source");
      return this.thumbnailSource.getSize();
    } };
    this.thumbnailBindings.setDataSource(s2);
    const a2 = await this.thumbnailBindings.create(r2);
    if (d.debug(Ne, `Thumbnail context create result: ${a2}`), !a2) throw new Error("Failed to create thumbnail context");
    const n2 = await this.thumbnailBindings.open();
    if (d.debug(Ne, `Thumbnail context open result: ${n2}`), !n2) throw new Error("Failed to open thumbnail media");
    this.thumbnailRenderer = new ThumbnailRenderer();
    let o2 = this.trackManager.getActiveVideoTrack();
    if (!o2) {
      const e3 = this.trackManager.getVideoTracks();
      e3.length > 0 && (o2 = e3[0]);
    }
    if (o2) {
      this.thumbnailRenderer.initialize({ width: o2.width, height: o2.height, rotation: o2.rotation || 0, colorPrimaries: o2.colorPrimaries, colorTransfer: o2.colorTransfer, hdrEnabled: this.thumbnailHDREnabled });
      const e3 = this.demuxer?.getExtradata(o2.id) ?? null;
      d.debug(Ne, `Configuring thumbnail decoder with track: ${o2.codec}, extradata: ${e3 ? e3.length : 0} bytes`), await this.thumbnailRenderer.configureDecoder(o2.codec, e3, o2.width, o2.height, o2.profile, o2.level) || d.warn(Ne, "Failed to configure thumbnail VideoDecoder, will use software fallback");
    } else d.warn(Ne, "No video track found for thumbnail renderer");
    d.debug(Ne, "Thumbnail pipeline initialized successfully");
  }
  destroyPreviewPipeline() {
    this.thumbnailBindings && (this.thumbnailBindings.destroy(), this.thumbnailBindings = null), this.thumbnailRenderer && (this.thumbnailRenderer.destroy(), this.thumbnailRenderer = null), this.thumbnailSource = null;
  }
  getTracks() {
    return this.trackManager.getTracks();
  }
  getVideoTracks() {
    return this.trackManager.getVideoTracks();
  }
  getAudioTracks() {
    return this.trackManager.getAudioTracks();
  }
  getSubtitleTracks() {
    return this.trackManager.getSubtitleTracks();
  }
  getActiveVideoTrack() {
    return this.trackManager.getActiveVideoTrack();
  }
  getActiveAudioTrack() {
    return this.trackManager.getActiveAudioTrack();
  }
  getActiveSubtitleTrack() {
    return this.trackManager.getActiveSubtitleTrack();
  }
  getSurface() {
    const e2 = this.streamWrapper?.getVideoElement() ?? null;
    return e2 ? { kind: "video", element: e2, reason: this.config.drm ? "drm" : "adaptive" } : this.surface;
  }
  getRenderingDiagnostics() {
    return { ...this.renderingDiagnostics };
  }
  async exportEmbeddedTextTrack(e2, t2 = {}) {
    if (this._destroyed) throw new MoviError({ code: "DESTROYED", category: "lifecycle", message: "The player has been destroyed." });
    if (!this.source) throw new MoviError({ code: "SUBTITLE_EXPORT_UNSUPPORTED", category: "subtitle", message: "No progressive source is available for subtitle export.", recoverable: true });
    const i2 = void 0 === t2.maxTextBytes && void 0 === t2.maxFontCount && void 0 === t2.maxFontBytes && void 0 === t2.maxTotalFontBytes && void 0 === t2.signal, r2 = i2 ? this.embeddedTextExportCache.get(e2) : void 0;
    if (r2) return r2;
    const a2 = async function({ source: e3, trackId: t3, wasmBinary, assetBaseUrl: i3, options: r3 = {} }) {
      ye(r3.signal);
      const s2 = await e3.fork?.();
      if (!s2) throw new MoviError({ code: "SUBTITLE_EXPORT_UNSUPPORTED", category: "subtitle", message: "The source cannot create an independent subtitle reader.", recoverable: true });
      const a3 = new Demuxer(s2, wasmBinary, true, i3);
      try {
        const e4 = await a3.open();
        ye(r3.signal);
        const i4 = a3.getSubtitleTracks().find((e5) => e5.id === t3) ?? null;
        if (!i4 || "text" !== i4.subtitleType) throw new MoviError({ code: "SUBTITLE_EXPORT_UNSUPPORTED", category: "subtitle", message: "The requested track is not an embedded text subtitle.", recoverable: true });
        const s3 = r3.maxTextBytes ?? pe, n2 = [];
        let o2 = 0;
        for (; ; ) {
          ye(r3.signal);
          const e5 = await a3.readPacket();
          if (!e5) break;
          if (e5.streamIndex === t3) {
            if (o2 += e5.data.byteLength, o2 > s3) throw new MoviError({ code: "SUBTITLE_EXPORT_LIMIT", category: "subtitle", message: "The embedded subtitle track exceeds the configured export limit.", recoverable: true });
            n2.push(e5);
          }
        }
        const h2 = a3.getAttachments(r3.maxTotalFontBytes ?? be);
        return function(e5, t4, i5, r4, s4, a4 = {}) {
          const n3 = function(e6) {
            const t5 = e6.codec.toLowerCase();
            return "ass" === t5 || t5.includes("ass") ? "ass" : "ssa" === t5 || t5.includes("ssa") ? "ssa" : "subrip" === t5 || "srt" === t5 ? "srt" : t5.includes("webvtt") || "vtt" === t5 ? "webvtt" : "text";
          }(e5);
          let o3;
          if ("ass" === n3 || "ssa" === n3) {
            const e6 = t4.sort((e7, t5) => e7.timestamp - t5.timestamp).map((e7) => function(e8, t5) {
              const i6 = Se(e8.data).replace(/\r?\n$/u, "");
              if (!i6) return null;
              const r5 = i6.split(","), s5 = _e(e8, t5);
              if (r5.length >= 9) {
                const e9 = r5[1] || "0", t6 = r5[2] || "Default", i7 = r5[3] || "", a5 = r5[4] || "0", n4 = r5[5] || "0", o4 = r5[6] || "0", h4 = r5[7] || "", d3 = r5.slice(8).join(",");
                return `Dialogue: ${e9},${we(s5.start)},${we(s5.end)},${t6},${i7},${a5},${n4},${o4},${h4},${d3}`;
              }
              return `Dialogue: 0,${we(s5.start)},${we(s5.end)},Default,,0,0,0,,${i6}`;
            }(e7, s4)).filter((e7) => null !== e7);
            o3 = `${function(e7, t5) {
              const i6 = e7.trimEnd();
              return i6 ? /\[Events\]/iu.test(i6) ? i6 : `${i6}

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text` : function(e8) {
                return ["[Script Info]", "ssa" === e8 ? "ScriptType: v4.00" : "ScriptType: v4.00+", "", "ssa" === e8 ? "[V4 Styles]" : "[V4+ Styles]", "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding", "Style: Default,Arial,24,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,1,2,10,10,18,1", "", "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"].join("\n");
              }(t5);
            }(Se(i5), n3)}
${e6.join("\n")}
`;
          } else o3 = "webvtt" === n3 ? `WEBVTT

${t4.map((e6) => {
            const t5 = _e(e6, s4);
            return `${ke(t5.start, ".")} --> ${ke(t5.end, ".")}
${Se(e6.data)}`;
          }).join("\n\n")}
` : `${t4.map((e6, t5) => {
            const i6 = _e(e6, s4);
            return `${t5 + 1}
${ke(i6.start, ",")} --> ${ke(i6.end, ",")}
${Se(e6.data)}`;
          }).join("\n\n")}
`;
          const h3 = a4.maxTextBytes ?? pe;
          if (new TextEncoder().encode(o3).byteLength > h3) throw new MoviError({ code: "SUBTITLE_EXPORT_LIMIT", category: "subtitle", message: "The embedded subtitle track exceeds the configured export limit.", recoverable: true });
          const d2 = function(e6, t5) {
            const i6 = t5.maxFontCount ?? 64, r5 = t5.maxFontBytes ?? 16777216, s5 = t5.maxTotalFontBytes ?? be, a5 = [], n4 = [];
            let o4 = 0;
            for (const t6 of e6) {
              if (!Te(t6)) continue;
              if (a5.length >= i6 || t6.data.byteLength > r5 || o4 + t6.data.byteLength > s5) {
                n4.push({ code: "ATTACHMENT_LIMIT", message: "An embedded font was skipped because an export limit was reached." });
                continue;
              }
              const e7 = t6.name.trim() || `font-${t6.streamIndex}`;
              a5.push({ id: `${t6.streamIndex}:${e7}:${t6.data.byteLength}`, name: e7, mimeType: t6.mimeType || "application/octet-stream", kind: "font", data: t6.data }), o4 += t6.data.byteLength;
            }
            return { attachments: a5, warnings: n4 };
          }(r4, a4);
          return { trackId: e5.id, format: n3, content: o3, attachments: d2.attachments, warnings: d2.warnings };
        }(i4, n2, a3.getExtradata(t3), h2, e4.startTime, r3);
      } finally {
        a3.close(), s2.close();
      }
    }({ source: this.source, trackId: e2, wasmBinary: this.config.wasmBinary, assetBaseUrl: this.config.assetBaseUrl, options: t2 }).catch((t3) => {
      throw i2 && this.embeddedTextExportCache.delete(e2), s(t3, { code: "SUBTITLE_EXPORT_UNSUPPORTED", category: "subtitle", recoverable: true });
    });
    return i2 && this.embeddedTextExportCache.set(e2, a2), a2;
  }
  async selectTrack(e2, t2 = {}) {
    const i2 = ++this.trackSelectionGeneration, r2 = "audio" === e2.kind ? this.getActiveAudioTrack() : "video" === e2.kind ? this.getActiveVideoTrack() : this.getActiveSubtitleTrack(), s2 = () => i2 !== this.trackSelectionGeneration ? { kind: e2.kind, status: "superseded", requestedTrackId: e2.trackId, activeTrack: r2 } : t2.signal?.aborted ? this.trackSelectionFailure(e2, r2, "ABORTED", "lifecycle", "Track selection was aborted.") : this._destroyed ? this.trackSelectionFailure(e2, r2, "DESTROYED", "lifecycle", "The player has been destroyed.") : null, a2 = s2();
    if (a2) return a2;
    if ("audio" === e2.kind) return this.serializeAudioSelection(async () => {
      const t3 = s2();
      if (t3) return t3;
      const i3 = "audio" === r2?.type ? r2 : null, a3 = this.getAudioTracks(), n3 = null === e2.trackId ? a3.find((e3) => e3.isDefault) ?? a3[0] ?? null : a3.find((t4) => t4.id === e2.trackId) ?? null;
      if (!n3) return this.trackSelectionFailure(e2, r2, "TRACK_NOT_FOUND", "track", "The requested audio track is unavailable.", "not-found");
      if (r2?.id === n3.id) return { kind: "audio", status: null === e2.trackId ? "auto" : "unchanged", requestedTrackId: e2.trackId, activeTrack: r2 };
      let o3 = false;
      o3 = this.streamWrapper ? this.streamWrapper.selectAudioTrack(n3.id) : await this.configureAudioTrack(n3);
      const h3 = s2();
      if (h3) return i3 && (this.streamWrapper ? this.streamWrapper.selectAudioTrack(i3.id) : await this.configureAudioTrack(i3)), h3;
      if (!o3) return !this.streamWrapper && i3 && await this.configureAudioTrack(i3), this.trackSelectionFailure(e2, r2, "TRACK_SWITCH_FAILED", "track", "The audio decoder rejected the requested track.");
      this.audioSelectionCommit = true;
      try {
        if (!this.trackManager.selectAudioTrack(n3.id)) return !this.streamWrapper && i3 && await this.configureAudioTrack(i3), this.trackSelectionFailure(e2, r2, "TRACK_SWITCH_FAILED", "track", "The requested audio track could not be committed.");
      } finally {
        this.audioSelectionCommit = false;
      }
      this.applyStreamDiscard();
      const d3 = { kind: "audio", status: null === e2.trackId ? "auto" : "selected", requestedTrackId: e2.trackId, activeTrack: n3 };
      return this.emit("trackChange", d3), d3;
    });
    if ("video" === e2.kind) {
      const t3 = this.getVideoTracks(), i3 = t3.find((e3) => -1 === e3.id), s3 = null === e2.trackId ? i3 ?? t3[0] ?? null : t3.find((t4) => t4.id === e2.trackId) ?? null;
      if (!s3) return this.trackSelectionFailure(e2, r2, "TRACK_NOT_FOUND", "track", "The requested video track is unavailable.", "not-found");
      if (!this.streamWrapper && r2?.id !== s3.id) return this.trackSelectionFailure(e2, r2, "TRACK_NOT_SUPPORTED", "track", "Progressive video-track switching is not supported.", "not-supported");
      r2?.id !== s3.id && this.trackManager.selectVideoTrack(s3.id);
      const a3 = { kind: "video", status: null === e2.trackId ? "auto" : r2?.id === s3.id ? "unchanged" : "selected", requestedTrackId: e2.trackId, activeTrack: s3 };
      return this.emit("trackChange", a3), a3;
    }
    const n2 = this.getSubtitleTracks(), o2 = null === e2.trackId ? null : n2.find((t3) => t3.id === e2.trackId) ?? null;
    if (null !== e2.trackId && !o2) return this.trackSelectionFailure(e2, r2, "TRACK_NOT_FOUND", "track", "The requested subtitle track is unavailable.", "not-found");
    const h2 = await this.selectSubtitleTrack(o2?.id ?? null), d2 = s2();
    if (d2) return d2;
    if (!h2) return this.trackSelectionFailure(e2, r2, "TRACK_SWITCH_FAILED", "track", "The subtitle decoder rejected the requested track.");
    const c2 = { kind: "subtitle", status: null === o2 ? "disabled" : r2?.id === o2.id ? "unchanged" : "selected", requestedTrackId: e2.trackId, activeTrack: o2 };
    return this.emit("trackChange", c2), c2;
  }
  trackSelectionFailure(e2, t2, i2, r2, s2, a2 = "failed") {
    return { kind: e2.kind, status: a2, requestedTrackId: e2.trackId, activeTrack: t2, error: new MoviError({ code: i2, category: r2, message: s2, recoverable: true }) };
  }
  async serializeAudioSelection(e2) {
    const t2 = this.audioSelectionTail;
    let i2 = () => {
    };
    this.audioSelectionTail = new Promise((e3) => {
      i2 = e3;
    }), await t2;
    try {
      return await e2();
    } finally {
      i2();
    }
  }
  selectAudioTrack(e2) {
    return this.trackManager.selectAudioTrack(e2);
  }
  setAudioOutputDevice(e2) {
    return this.audioRenderer.setSinkId(e2);
  }
  getAudioOutputDevice() {
    return this.audioRenderer.getSinkId();
  }
  async selectSubtitleTrack(e2) {
    d.info(Ne, `selectSubtitleTrack called: trackId=${e2}`);
    const t2 = this.trackManager.selectSubtitleTrack(e2);
    if (d.debug(Ne, `TrackManager.selectSubtitleTrack returned: ${t2}`), this.prefetchedSubtitleStream !== e2 && (this.prefetchedSubtitleStream = null), null === e2) return d.info(Ne, "Disabling subtitles"), this.videoRenderer && (this.videoRenderer.clearSubtitles(), d.debug(Ne, "Cleared subtitles from video renderer")), this.subtitleDecoder && (this.subtitleDecoder.close(), d.debug(Ne, "Closed subtitle decoder")), t2;
    if (this.streamWrapper) return t2;
    const i2 = this.trackManager.getActiveSubtitleTrack();
    if (this.isHostRenderedTextSubtitle(i2)) return d.info(Ne, `Host rendering enabled for embedded text subtitle track ${i2?.id}`), this.videoRenderer?.clearSubtitles(), this.subtitleDecoder?.close(), t2;
    if (this.demuxer && this.subtitleDecoder) {
      const t3 = i2;
      if (d.info(Ne, `Configuring subtitle decoder for track: id=${t3?.id}, codec=${t3?.codec}, type=${t3?.subtitleType}`), t3) {
        d.debug(Ne, "Closing previous subtitle decoder before switching tracks"), this.subtitleDecoder.close();
        const e3 = this.demuxer.getBindings();
        e3 ? (d.debug(Ne, "Setting bindings on subtitle decoder"), this.subtitleDecoder.setBindings(e3, false)) : d.warn(Ne, "No bindings available from demuxer!");
        const i3 = this.demuxer.getExtradata(t3.id) ?? void 0;
        d.debug(Ne, `Configuring subtitle decoder: extradata=${i3?.length || 0} bytes`);
        const r2 = await this.subtitleDecoder.configure(t3, i3);
        if (d.info(Ne, `Subtitle decoder configuration result: ${r2}`), !r2) return d.warn(Ne, `Could not configure subtitle decoder for track ${t3.id} (${t3.codec}) - codec may not be available in WASM build`), this.trackManager.selectSubtitleTrack(-1), false;
        d.debug(Ne, "Setting up subtitle cue callback"), this.subtitleDecoder.setOnCue((e4) => {
          d.debug(Ne, `Subtitle cue callback triggered: "${e4.text?.substring(0, 30)}..." (${e4.start.toFixed(2)}s - ${e4.end.toFixed(2)}s)`), this.videoRenderer ? (d.debug(Ne, "Setting subtitle cue on video renderer"), this.videoRenderer.setSubtitleCues([e4])) : d.warn(Ne, "Subtitle cue callback: videoRenderer is null!");
        }), this.videoRenderer && 0 !== this.videoRenderer.getSubtitleDelay() && this.prefetchActiveSubtitleStream();
      } else d.warn(Ne, `No active subtitle track found after selecting trackId ${e2}`);
    } else d.warn(Ne, `Cannot configure subtitle decoder: demuxer=${!!this.demuxer}, subtitleDecoder=${!!this.subtitleDecoder}`);
    return t2;
  }
  getCurrentTime() {
    return this.streamWrapper ? this.streamWrapper.getCurrentTime() : Math.max(0, this.clock.getTime() - this.startTime - this.seekKeyframeOffset);
  }
  resetClockToStartForPoster() {
    this.streamWrapper || (this.clock.seek(this.startTime), this.seekKeyframeOffset = 0, this.seekTargetTime = -1, this.waitingForVideoSync = false, this._playStartTime = 0, this._primingAudio = false, this.pendingAudioPackets = [], this.pendingPrebufferPackets = [], this.lastBufferedTime = 0, this.bufferedRangeStart = 0, this.emit("timeUpdate", this.getCurrentTime()));
  }
  getDuration() {
    return this.streamWrapper ? this.streamWrapper.getDuration() : this.mediaInfo?.duration ?? 0;
  }
  getCacheStats() {
    return { utilization: this.cache.getUtilization(), sizeBytes: this.cache.getSize(), maxSizeBytes: this.cache.getMaxSize(), entryCount: this.cache.getEntryCount() };
  }
  getCachedTimeRanges() {
    if (!this.source || !this.mediaInfo || this.fileSize <= 0) return [];
    const e2 = this.source.getKey(), t2 = this.cache.getCachedRanges(e2), i2 = this.mediaInfo.duration;
    if (i2 <= 0) return [];
    const r2 = [];
    for (const e3 of t2) {
      const t3 = e3.offset / this.fileSize, s2 = (e3.offset + e3.length) / this.fileSize, a2 = Math.max(0, Math.min(i2, t3 * i2)), n2 = Math.max(0, Math.min(i2, s2 * i2));
      n2 > a2 && r2.push({ start: a2, end: n2 });
    }
    return r2;
  }
  getState() {
    return this.streamWrapper ? this.streamWrapper.getState() : this.stateManager.getState();
  }
  isPlaybackIntended() {
    const e2 = this.getState();
    return "playing" === e2 || !("buffering" !== e2 && "seeking" !== e2 || !this.wasPlayingBeforeRebuffer && !this.wasPlayingBeforeSeek);
  }
  async loadEncrypted(e2) {
    this.config.source = { type: "encrypted", encrypted: e2 }, await this.load();
  }
  getMediaInfo() {
    return this.mediaInfo;
  }
  getContentDispositionFilename() {
    return this.source instanceof HttpSource ? this.source.getContentDispositionFilename() : null;
  }
  getMetadataTitle() {
    return this.mediaInfo?.metadata?.title ?? null;
  }
  getHLSVideoElement() {
    return this.streamWrapper?.getVideoElement() ?? null;
  }
  getChapters() {
    return (this.mediaInfo?.chapters ?? []).map((e2) => ({ ...e2, labels: e2.labels?.map((e3) => ({ ...e3 })) }));
  }
  resizeCanvas(e2, t2) {
    this.streamWrapper && this.streamWrapper.resizeCanvas(e2, t2), this.videoRenderer && this.videoRenderer.resize(e2, t2), this.ensureWakeLock();
  }
  setHDREnabled(e2) {
    this.thumbnailHDREnabled = e2, this.videoRenderer && this.videoRenderer.setHDREnabled && this.videoRenderer.setHDREnabled(e2), this.thumbnailRenderer && this.thumbnailRenderer.setHDREnabled(e2);
  }
  isHDRSupported() {
    return !(!this.videoRenderer || !this.videoRenderer.isHDRSupported) && this.videoRenderer.isHDRSupported();
  }
  setSubtitleOverlay(e2) {
    this.videoRenderer && this.videoRenderer.setSubtitleOverlay(e2);
  }
  setSubtitleControlsPadding(e2) {
    this.videoRenderer && this.videoRenderer.setSubtitleControlsPadding(e2);
  }
  rotateVideo() {
    return this.videoRenderer ? this.videoRenderer.rotate90() : 0;
  }
  getCurrentVideoFrame() {
    return this.videoRenderer?.getCurrentFrame() ?? null;
  }
  getVideoRotation() {
    return this.videoRenderer?.getRotation() ?? 0;
  }
  setVideoRotation(e2) {
    this.videoRenderer?.setManualRotation(e2);
  }
  setFitMode(e2) {
    this.streamWrapper && this.streamWrapper.setFitMode(e2), this.videoRenderer && this.videoRenderer.setFitMode(e2);
  }
  setLetterboxColor(e2, t2, i2) {
    this.videoRenderer && this.videoRenderer.setLetterboxColor(e2, t2, i2);
  }
  setVR360(e2) {
    this.videoRenderer?.setVR360(e2);
  }
  isVR360Enabled() {
    return this.videoRenderer?.isVR360Enabled() ?? false;
  }
  getVR360View() {
    return this.videoRenderer?.getVRView() ?? null;
  }
  setVRProjection(e2, t2 = false, i2 = false, r2 = false) {
    this.videoRenderer?.setVRProjection(e2, t2, i2, r2);
  }
  nudgeVR360(e2, t2, i2) {
    this.videoRenderer?.nudgeVR360(e2, t2, i2);
  }
  zoomVR360(e2) {
    this.videoRenderer?.zoomVR360(e2);
  }
  resetVRView() {
    this.videoRenderer?.resetVRView();
  }
  renderPosterImage(e2) {
    this.videoRenderer?.renderPosterImage(e2);
  }
  setPlaybackRate(e2) {
    this.streamWrapper && this.streamWrapper.setPlaybackRate(e2);
    const t2 = this.getCurrentTime(), i2 = "playing" === this.stateManager.getState() || "buffering" === this.stateManager.getState();
    this.clock.setPlaybackRate(e2), this.audioRenderer && this.audioRenderer.setPlaybackRate(e2), this.videoRenderer && this.videoRenderer.setPlaybackRate(e2), this.videoDecoder && this.videoDecoder.setPlaybackRate(e2), this.nativeAudioEl && (this.nativeAudioEl.playbackRate = e2), i2 && !this.isLinearPlayback() && this.seek(t2, { suppressSpinner: true, preservePlaying: true }).catch(() => {
    });
  }
  wireNativeAudioEvents(e2) {
    e2.addEventListener("timeupdate", () => {
      this.nativeAudioOnlyPlayback() && this.emit("timeUpdate", this.getCurrentTime());
    }), e2.addEventListener("durationchange", () => {
      if (!this.nativeAudioOnlyPlayback()) return;
      const t2 = e2.duration;
      isFinite(t2) && t2 > 0 && (this.mediaInfo && (this.mediaInfo.duration = t2), this.clock.setDuration(t2 + this.startTime), this.emit("durationChange", t2));
    }), e2.addEventListener("ended", () => {
      if (!this.nativeAudioOnlyPlayback()) return;
      if ("ended" === this.stateManager.getState()) return;
      const e3 = this.getDuration() || 0;
      this.clock.seek(e3 + this.startTime), this.emit("timeUpdate", e3), this.stateManager.setState("ended"), this.emit("ended", void 0), this.releaseWakeLock();
    }), e2.addEventListener("error", () => {
      const t2 = e2.error;
      d.error(Ne, `Native audio element error: code=${t2?.code ?? "?"} message="${t2?.message ?? ""}" networkState=${e2.networkState} readyState=${e2.readyState} src=${this._nativeAudioLogicalUrl ?? e2.currentSrc}`), this.setSourcePrefetchThrottle(false);
    }), e2.addEventListener("stalled", () => {
      d.warn(Ne, `Native audio stalled: networkState=${e2.networkState} readyState=${e2.readyState} currentTime=${e2.currentTime.toFixed(2)}`), e2.readyState < 3 && !e2.paused && this.setSourcePrefetchThrottle(true);
    }), e2.addEventListener("waiting", () => {
      d.debug(Ne, `Native audio waiting (buffering): readyState=${e2.readyState} currentTime=${e2.currentTime.toFixed(2)}`), e2.readyState < 3 && !e2.paused && this.setSourcePrefetchThrottle(true);
    }), e2.addEventListener("canplay", () => {
      this.setSourcePrefetchThrottle(false);
    }), e2.addEventListener("pause", () => {
      this.setSourcePrefetchThrottle(false);
    }), e2.addEventListener("playing", () => {
      d.info(Ne, `Native audio playing: currentTime=${e2.currentTime.toFixed(2)} readyState=${e2.readyState}`), e2.readyState >= 3 && this.setSourcePrefetchThrottle(false);
    });
  }
  setSourcePrefetchThrottle(e2) {
    if (!e2 && this._audioOnlyPrefetchPaused) return;
    const t2 = this.source;
    t2 && "function" == typeof t2.setPrefetchThrottle && (this._prefetchThrottleTimer && (clearTimeout(this._prefetchThrottleTimer), this._prefetchThrottleTimer = null), t2.setPrefetchThrottle(e2), e2 && (this._prefetchThrottleTimer = setTimeout(() => {
      this._prefetchThrottleTimer = null, t2.setPrefetchThrottle(false);
    }, 6e3)));
  }
  setVideoSourcePrefetchPaused(e2) {
    this._audioOnlyPrefetchPaused = e2;
    const t2 = this.source;
    t2?.setPrefetchThrottle?.(e2);
  }
  gateOnNativeAudioReady() {
    const e2 = this.nativeAudioEl;
    if (!e2 || this._nativeAudioGateActive) return;
    const t2 = Math.max(0, this.clock.getTime() - this.startTime);
    try {
      Math.abs(e2.currentTime - t2) > 0.3 && (e2.currentTime = t2);
    } catch {
    }
    if (e2.play().catch(() => {
    }), e2.readyState >= 3) return;
    let i2;
    this._nativeAudioGateActive = true, this.clock.pause(), this.videoRenderer && this.videoRenderer.stopPresentationLoop(), this.stateManager.setState("buffering"), this.setSourcePrefetchThrottle(true);
    const r2 = (t3 = false) => {
      if (this._nativeAudioGateActive && (t3 || !(e2.readyState < 3)) && (this._nativeAudioGateActive = false, e2.removeEventListener("canplay", s2), e2.removeEventListener("canplaythrough", s2), e2.removeEventListener("playing", s2), clearTimeout(i2), this.setSourcePrefetchThrottle(false), "buffering" === this.stateManager.getState())) {
        const t4 = Math.max(0, this.clock.getTime() - this.startTime);
        try {
          Math.abs(e2.currentTime - t4) > 0.3 && (e2.currentTime = t4);
        } catch {
        }
        e2.play().catch(() => {
        }), this.videoRenderer && this.videoRenderer.startPresentationLoop(), this.clock.start(), this.stateManager.setState("playing");
      }
    }, s2 = () => r2(false);
    i2 = setTimeout(() => r2(true), 8e3), e2.addEventListener("canplay", s2), e2.addEventListener("canplaythrough", s2), e2.addEventListener("playing", s2);
  }
  async setupSplitAudio(e2) {
    try {
      d.info(Ne, `Split audio (WASM) setup: ${e2}`), this.audioSource = await this.createSource({ type: "url", url: e2, headers: this.config.headers }), this.audioDemuxer = new Demuxer(this.audioSource, this.config.wasmBinary, true, this.config.assetBaseUrl), await this.audioDemuxer.open();
      const t2 = this.audioDemuxer.getAudioTracks()[0];
      if (!t2) return d.warn(Ne, "Split audio: no audio track in separate source"), this.audioDemuxer = null, void (this.audioSource = null);
      this._splitAudioTrackId = t2.id;
      const i2 = this.audioDemuxer.getExtradata(t2.id) ?? void 0, r2 = this.audioDemuxer.getBindings();
      if (r2 && this.audioDecoder.setBindings(r2), !await this.audioDecoder.configure(t2, i2)) return d.warn(Ne, "Split audio: decoder configure failed"), this.audioDemuxer = null, void (this.audioSource = null);
      await this.audioRenderer.init();
      const s2 = t2.channels ?? 2, a2 = this.audioRenderer.getMaxChannelCount();
      s2 > 2 && a2 >= s2 ? (this.audioDecoder.setDownmix(false), this.audioRenderer.setOutputChannelCount(s2)) : (this.audioDecoder.setDownmix(true), this.audioRenderer.setOutputChannelCount(2)), this._splitAudioEof = false, this._lastSplitAudioPts = 0, d.info(Ne, `Split audio (WASM) ready: ${t2.codec} ${t2.sampleRate}Hz ${t2.channels}ch`);
    } catch (e3) {
      d.error(Ne, `Split audio setup failed: ${e3?.message ?? e3}`), this.audioDemuxer = null, this.audioSource = null;
    }
  }
  async pumpSplitAudio() {
    if (!this.audioDemuxer || this._splitAudioEof) return false;
    const e2 = this.stateManager.getState();
    if ("playing" !== e2 && "buffering" !== e2 && !this.waitingForVideoSync) return false;
    if (this.audioDemuxInFlight) return true;
    if (!this._audioOnly && this.waitingForVideoSync && this.trackManager.getActiveVideoTrack()) return true;
    const t2 = Math.max(0.25, this.clock.getPlaybackRate()), i2 = 5 * (t2 < 1 ? 1 / t2 : Math.min(2, t2)), r2 = this.muted ? 0.25 : i2, s2 = Math.max(0, this.clock.getTime() - this.startTime);
    if (this._lastSplitAudioPts - s2 > r2) return true;
    this.audioDemuxInFlight = true;
    try {
      let e3 = 0;
      for (; e3 < 24 && !this._splitAudioEof && this.audioDecoder.queueSize <= 40 && this.audioRenderer.getBufferedDuration() < i2 && this._lastSplitAudioPts - s2 <= r2; ) {
        const t3 = await this.audioDemuxer.readPacket();
        if (e3++, !t3) {
          this._splitAudioEof = true;
          break;
        }
        -1 !== this._splitAudioTrackId && t3.streamIndex !== this._splitAudioTrackId || -1 !== this.seekTargetTime && t3.timestamp < this.seekTargetTime || (this.audioDecoder.decode(t3.data, t3.timestamp, t3.keyframe), this._lastSplitAudioPts = t3.timestamp);
      }
    } catch (e3) {
      d.warn(Ne, `Split audio demux error: ${e3?.message ?? e3}`);
    } finally {
      this.audioDemuxInFlight = false;
    }
    return !this._splitAudioEof;
  }
  isSplitAudioPlayedOut() {
    const e2 = this.clock.getTime(), t2 = this.mediaInfo?.duration ?? 0, i2 = this.audioRenderer.getMaxScheduledMediaTime(), r2 = t2 > 0 && e2 >= t2 + this.startTime - 0.25;
    return i2 > 0 && e2 >= i2 - 0.1 || r2 || 0 === t2;
  }
  maybeEndSplitAudio() {
    return !!(this._audioOnly && this._splitAudioEof && (this.stateManager.is("playing") || this.stateManager.is("buffering")) && this.isSplitAudioPlayedOut()) && (this.handleEnded(), true);
  }
  audioProcessLoop = async () => {
    await this.pumpSplitAudio() ? this.audioAnimationFrameId = requestAnimationFrame(this.audioProcessLoop) : this._audioOnly && this._splitAudioEof && (this.stateManager.is("playing") || this.stateManager.is("buffering")) ? this.audioAnimationFrameId = this.maybeEndSplitAudio() ? null : requestAnimationFrame(this.audioProcessLoop) : this.audioAnimationFrameId = null;
  };
  startAudioLoop() {
    this.audioDemuxer && null === this.audioAnimationFrameId && (this.audioAnimationFrameId = requestAnimationFrame(this.audioProcessLoop));
  }
  stopAudioLoop() {
    null !== this.audioAnimationFrameId && (cancelAnimationFrame(this.audioAnimationFrameId), this.audioAnimationFrameId = null);
  }
  probeNativeAudioUrl(e2) {
    d.info(Ne, `External audio URL: ${e2}`);
    try {
      fetch(e2, { method: "GET", headers: { Range: "bytes=0-1", ...this.config.headers || {} } }).then((e3) => {
        d.info(Ne, `External audio probe: status=${e3.status} type="${e3.headers.get("content-type") ?? "?"}" accept-ranges="${e3.headers.get("accept-ranges") ?? "?"}" content-range="${e3.headers.get("content-range") ?? "?"}" content-length="${e3.headers.get("content-length") ?? "?"}"`);
      }).catch((e3) => {
        d.warn(Ne, `External audio probe failed (CORS/network?): ${e3?.message ?? e3}`);
      });
    } catch (e3) {
      d.warn(Ne, `External audio probe threw: ${e3?.message ?? e3}`);
    }
  }
  setupNativeAudio(e2) {
    this.probeNativeAudioUrl(e2);
    const t2 = this.nativeAudioEl && !this.nativeAudioEl.paused, i2 = this.nativeAudioEl?.currentTime ?? 0, r2 = !!this.nativeAudioEl && (this._nativeAudioLogicalUrl === e2 || this.nativeAudioEl.src === e2);
    this.nativeAudioEl || (this.nativeAudioEl = new Audio(), this.wireNativeAudioEvents(this.nativeAudioEl)), this.nativeAudioEl.preload = "auto", this.nativeAudioEl.volume = this.muted ? 0 : Math.min(1, this.audioRenderer.getVolume()), this.nativeAudioEl.muted = this.muted, this.disableAudio = true;
    const s2 = this.nativeAudioEl, a2 = this, n2 = () => !s2.paused && s2.readyState >= 3;
    this.clock.setAudioProvider({ getAudioClock: () => n2() ? s2.currentTime + a2.startTime : -1, hasHealthyBuffer: n2, isAudioPlaying: () => !s2.paused }), this.videoRenderer && this.videoRenderer.setAudioTimeProvider(() => n2() ? s2.currentTime + a2.startTime : -1, n2);
    const o2 = () => {
      i2 > 0 && (s2.currentTime = i2), (t2 || this.stateManager.is("playing")) && s2.play().catch(() => {
      });
    };
    if (r2) return void o2();
    this._nativeAudioLogicalUrl = e2;
    const h2 = this.config.headers;
    h2 && Object.keys(h2).length > 0 ? (this.revokeNativeAudioObjectUrl(), fetch(e2, { headers: h2 }).then((e3) => {
      if (!e3.ok) throw new Error(`HTTP ${e3.status}`);
      return e3.blob();
    }).then((t3) => {
      this.nativeAudioEl === s2 && this._nativeAudioLogicalUrl === e2 && (this._nativeAudioObjectUrl = URL.createObjectURL(t3), s2.src = this._nativeAudioObjectUrl, o2());
    }).catch((t3) => {
      d.error(Ne, `Separate audio with custom headers failed to load: ${e2}`, t3);
    })) : (this.revokeNativeAudioObjectUrl(), s2.src = e2, o2());
  }
  revokeNativeAudioObjectUrl() {
    if (this._nativeAudioObjectUrl) {
      try {
        URL.revokeObjectURL(this._nativeAudioObjectUrl);
      } catch {
      }
      this._nativeAudioObjectUrl = null;
    }
  }
  releaseNativeAudio() {
    const e2 = this.nativeAudioEl;
    return e2 && (e2.__moviLogicalUrl = this._nativeAudioLogicalUrl, e2.__moviObjectUrl = this._nativeAudioObjectUrl, this._nativeAudioObjectUrl = null, this._nativeAudioLogicalUrl = null, this.nativeAudioEl = null), e2;
  }
  adoptNativeAudio(e2) {
    if (this.nativeAudioEl && this.nativeAudioEl !== e2) try {
      this.nativeAudioEl.pause();
    } catch {
    }
    this.nativeAudioEl = e2, void 0 !== e2.__moviObjectUrl && (this._nativeAudioObjectUrl = e2.__moviObjectUrl ?? null, this._nativeAudioLogicalUrl = e2.__moviLogicalUrl ?? null, delete e2.__moviObjectUrl, delete e2.__moviLogicalUrl);
  }
  getAudioLangs() {
    return this._audioTracks.map((e2) => ({ lang: e2.lang, label: e2.label, active: e2.lang === this._activeAudioLang }));
  }
  selectAudioLang(e2) {
    const t2 = this._audioTracks.find((t3) => t3.lang === e2);
    return t2 ? (e2 === this._activeAudioLang && this.nativeAudioEl || (this.disableAudio || (this.audioRenderer.mute(), this.disableAudio = true), this._activeAudioLang = e2, this.setupNativeAudio(t2.url), d.info(Ne, `Audio switched to external: ${t2.label} (${t2.lang})`), this.emit("audioTrackChange", { lang: e2, label: t2.label })), true) : (d.warn(Ne, `Audio track not found for lang: ${e2}`), false);
  }
  useMuxedAudio() {
    this.nativeAudioEl && (this.nativeAudioEl.pause(), this.nativeAudioEl.src = "", this.nativeAudioEl = null, this.revokeNativeAudioObjectUrl(), this._nativeAudioLogicalUrl = null, this._activeAudioLang = "", this.disableAudio = false, this.muted = false, this.audioRenderer.unmute().catch(() => {
    }), this.clock.setAudioProvider(this.audioRenderer), this.videoRenderer && this.videoRenderer.setAudioTimeProvider(() => this.audioRenderer.getAudioClock(), () => this.audioRenderer.hasHealthyBuffer()), d.info(Ne, "Switched back to muxed (WASM) audio"));
  }
  isNativeAudioActive() {
    return null !== this.nativeAudioEl && "" !== this._activeAudioLang;
  }
  hasNativeAudio() {
    return null !== this.nativeAudioEl;
  }
  hasAudibleSource() {
    return this.trackManager.getAudioTracks().length > 0 || this.hasNativeAudio() || null !== this.audioDemuxer || null !== this.streamWrapper;
  }
  usesNativeAudio() {
    return null !== this.streamWrapper || null !== this.nativeAudioEl;
  }
  isLiveStream() {
    return this.streamWrapper?.isLive?.() ?? false;
  }
  isStreamAudioOnly() {
    return this.streamWrapper?.isAudioOnly?.() ?? false;
  }
  getLiveEdge() {
    return this.streamWrapper?.getLiveEdge?.() ?? this.getDuration();
  }
  getSeekRangeStart() {
    return this.streamWrapper?.getSeekRangeStart?.() ?? 0;
  }
  seekToLive() {
    const e2 = this.getLiveEdge();
    isFinite(e2) && e2 > 0 && this.streamWrapper?.seek(e2);
  }
  getSubtitleLangs() {
    return this._subtitleTracks.map((e2) => ({ lang: e2.lang, label: e2.label, active: e2.lang === this._activeSubtitleLang }));
  }
  async selectSubtitleLang(e2) {
    if (this.stopExternalSubtitles(), !e2) return this._activeSubtitleLang = "", this.videoRenderer && this.videoRenderer.clearSubtitles(), this.emit("subtitleTrackChange", { lang: null, label: null }), true;
    const t2 = this._subtitleTracks.find((t3) => t3.lang === e2);
    if (!t2) return d.warn(Ne, `Subtitle track not found for lang: ${e2}`), false;
    try {
      const i2 = await fetch(t2.url);
      if (!i2.ok) throw new Error(`HTTP ${i2.status}`);
      const r2 = await i2.text(), s2 = t2.format || (t2.url.includes(".srt") ? "srt" : "vtt");
      return this.videoRenderer?.setSubtitleFormat(s2), this._externalSubCues = "srt" === s2 ? this.parseSRT(r2) : this.parseVTT(r2), this._activeSubtitleLang = e2, this.selectSubtitleTrack(null), this.startExternalSubtitles(), d.info(Ne, `Subtitle loaded: ${t2.label} (${this._externalSubCues.length} cues)`), this.emit("subtitleTrackChange", { lang: e2, label: t2.label }), true;
    } catch (e3) {
      return d.error(Ne, `Failed to load subtitle: ${t2.url}`, e3), false;
    }
  }
  parseVTT(e2) {
    const t2 = [], i2 = e2.split(/\n\n+/);
    for (const e3 of i2) {
      const i3 = e3.trim().split("\n");
      for (let e4 = 0; e4 < i3.length; e4++) {
        const r2 = i3[e4].match(/(\d{2}):(\d{2}):(\d{2})[.,](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[.,](\d{3})/);
        if (r2) {
          const s2 = 3600 * +r2[1] + 60 * +r2[2] + +r2[3] + +r2[4] / 1e3, a2 = 3600 * +r2[5] + 60 * +r2[6] + +r2[7] + +r2[8] / 1e3, n2 = i3.slice(e4 + 1).join("\n").trim();
          n2 && t2.push({ start: s2, end: a2, text: n2 });
          break;
        }
      }
    }
    return t2;
  }
  parseSRT(e2) {
    return this.parseVTT(e2);
  }
  startExternalSubtitles() {
    this.stopExternalSubtitles();
    let e2 = -1;
    this._externalSubTimer = window.setInterval(() => {
      if (!this.videoRenderer) return;
      const t2 = this.clock.getTime(), i2 = this._externalSubCues.findIndex((e3) => t2 >= e3.start && t2 <= e3.end);
      i2 !== e2 && (e2 = i2, i2 >= 0 ? this.videoRenderer.setSubtitleCues([this._externalSubCues[i2]]) : this.videoRenderer.setSubtitleCues([]));
    }, 100);
  }
  stopExternalSubtitles() {
    null !== this._externalSubTimer && (clearInterval(this._externalSubTimer), this._externalSubTimer = null);
  }
  getPlaybackRate() {
    return this.streamWrapper ? this.streamWrapper.getPlaybackRate() : this.clock.getPlaybackRate();
  }
  setSubtitleDelay(e2) {
    this.videoRenderer && this.videoRenderer.setSubtitleDelay(e2), 0 !== e2 && this.prefetchActiveSubtitleStream();
  }
  getSubtitleDelay() {
    return this.videoRenderer ? this.videoRenderer.getSubtitleDelay() : 0;
  }
  async getAllSubtitleCues() {
    const e2 = this.trackManager.getActiveSubtitleTrack();
    return e2 ? e2.subtitleType && "text" !== e2.subtitleType ? [] : (this.prefetchedSubtitleStream !== e2.id && await this.prefetchActiveSubtitleStream(), this.videoRenderer ? this.videoRenderer.getAllCues() : []) : [];
  }
  async prefetchActiveSubtitleStream() {
    if (this.prefetchInFlight) return;
    if (!this.demuxer || !this.videoRenderer) return;
    const e2 = this.trackManager.getActiveSubtitleTrack();
    if (!e2) return;
    if (this.prefetchedSubtitleStream === e2.id) return;
    const t2 = this.demuxer.getBindings();
    if (!t2) return;
    if (e2.subtitleType && "text" !== e2.subtitleType) return;
    this.prefetchInFlight = true;
    const i2 = this.clock.getTime(), r2 = "playing" === this.stateManager.getState();
    this.stopPauseBuffering(), null !== this.animationFrameId && (cancelAnimationFrame(this.animationFrameId), this.animationFrameId = null), this.seekSessionId++, r2 && (this.clock.pause(), this.disableAudio || this.audioRenderer.pause(), this.nativeAudioEl && this.nativeAudioEl.pause(), this.videoRenderer && this.videoRenderer.stopPresentationLoop());
    const s2 = performance.now();
    for (; this.demuxInFlight && performance.now() - s2 < 2e3; ) await new Promise((e3) => setTimeout(e3, 10));
    try {
      d.info(Ne, `Prefetching subtitle cues for stream ${e2.id}...`);
      const r3 = await t2.prefetchSubtitleCues(e2.id);
      r3 && r3.length > 0 ? (this.videoRenderer.setSubtitleCues(r3), this.prefetchedSubtitleStream = e2.id, d.info(Ne, `Prefetched ${r3.length} subtitle cues for stream ${e2.id}`)) : d.warn(Ne, `Subtitle prefetch returned no cues for stream ${e2.id}`), await this.videoDecoder.flush(), await this.audioDecoder.flush(), this.videoRenderer && this.videoRenderer.clearQueue(), this.audioRenderer.reset(), await this.demuxer.seek(i2), this.clock.seek(i2), this.pendingAudioPackets = [], this.pendingPrebufferPackets = [], this.eofReached = false, this.eofSince = 0;
    } catch (e3) {
      d.error(Ne, "Subtitle prefetch failed", e3);
    } finally {
      this.prefetchInFlight = false;
    }
    if (r2) try {
      this.disableAudio || await this.audioRenderer.play(), this.nativeAudioEl && await this.nativeAudioEl.play().catch(() => {
      }), this.videoRenderer && this.videoRenderer.startPresentationLoop(), this.clock.start(), this.seekTargetTime = i2, this.animationFrameId = requestAnimationFrame(this.processLoop), this.requestWakeLock();
    } catch (e3) {
      d.error(Ne, "Failed to resume after subtitle prefetch", e3);
    }
    else this.startPauseBuffering();
  }
  setVolume(e2) {
    this.streamWrapper && this.streamWrapper.setVolume(e2), this.audioRenderer.setVolume(e2), this.nativeAudioEl && (this.nativeAudioEl.volume = Math.min(1, Math.max(0, e2)));
  }
  getVolume() {
    return this.streamWrapper ? this.streamWrapper.getVolume() : this.audioRenderer.getVolume();
  }
  setMuted(e2) {
    if (this.muted !== e2) {
      if (this.muted = e2, this.streamWrapper) this.streamWrapper.setMuted(e2);
      else if (e2 ? this.audioRenderer.mute() : (this.audioRenderer.unmute().catch((e3) => {
        d.error("MoviPlayer", "Failed to unmute", e3);
      }), this.ensureWakeLock()), this.nativeAudioEl && (this.nativeAudioEl.muted = e2, !e2 && "playing" === this.stateManager.getState())) if (this._nativeAudioAutoplayBlocked = false, this.nativeAudioEl.readyState < 3) this.gateOnNativeAudioReady();
      else {
        const e3 = Math.max(0, this.clock.getTime() - this.startTime);
        if (this.nativeAudioEl.paused || Math.abs(this.nativeAudioEl.currentTime - e3) > 0.3) {
          try {
            this.nativeAudioEl.currentTime = e3;
          } catch {
          }
          this.nativeAudioEl.paused && this.nativeAudioEl.play().catch(() => {
          });
        }
      }
    }
  }
  getMuted() {
    return this.muted;
  }
  setStableAudio(e2) {
    this.audioRenderer.setStableAudio(e2);
  }
  getStableAudio() {
    return this.audioRenderer.getStableAudio();
  }
  getRenderHealth() {
    if (!this.videoRenderer || this.streamWrapper) return null;
    const e2 = this.trackManager.getActiveVideoTrack();
    return { framesPresented: this.videoRenderer.getStats().framesPresented, sourceFps: e2?.frameRate && e2.frameRate > 0 ? e2.frameRate : 30 };
  }
  getStats() {
    if (this.streamWrapper) return this.streamWrapper.getStats();
    const e2 = this.mediaInfo, t2 = this.trackManager.getActiveVideoTrack(), i2 = this.trackManager.getActiveAudioTrack(), r2 = this.videoDecoder.getStats(), s2 = this.audioDecoder.getStats(), a2 = this.videoRenderer?.getStats(), n2 = this.audioRenderer.getBufferedDuration(), o2 = {};
    if (t2) {
      o2["Video Codec"] = t2.codec ?? "N/A", o2.Resolution = `${t2.width}x${t2.height}`;
      const e3 = t2.height, i3 = Math.max(e3, Math.round(9 * t2.width / 16));
      o2.Quality = i3 >= 8640 ? "16K" : i3 >= 4320 ? "8K" : i3 >= 2160 ? "4K" : i3 >= 1440 ? "2K" : i3 >= 1080 ? "1080p" : i3 >= 720 ? "720p" : i3 >= 480 ? "480p" : "SD", o2["Frame Rate"] = `${t2.frameRate} fps`, o2["Video Bitrate"] = t2.bitRate ? `${(t2.bitRate / 1e3).toFixed(0)} kbps` : "N/A", t2.pixelFormat && (o2["Pixel Format"] = t2.pixelFormat), o2["Color Space"] = t2.colorSpace ?? "N/A", t2.colorRange && (o2["Color Range"] = t2.colorRange), t2.colorPrimaries && "unknown" !== t2.colorPrimaries && (o2["Color Primaries"] = t2.colorPrimaries), t2.colorTransfer && "unknown" !== t2.colorTransfer && (o2["Color Transfer"] = t2.colorTransfer), o2.HDR = t2.isHDR ? "Yes" : "No", t2.rotation && (o2.Rotation = `${t2.rotation}°`), o2["Video Decoder"] = r2.decoderType;
    }
    i2 && (o2["Audio Codec"] = i2.codec ?? "N/A", i2.language && "und" !== i2.language && (o2.Language = i2.language.toUpperCase()), o2["Sample Rate"] = `${i2.sampleRate} Hz`, o2.Channels = 1 === i2.channels ? "Mono" : 2 === i2.channels ? "Stereo" : 6 === i2.channels ? "5.1 Surround" : 8 === i2.channels ? "7.1 Surround" : `${i2.channels}ch`, o2["Audio Bitrate"] = i2.bitRate ? `${(i2.bitRate / 1e3).toFixed(0)} kbps` : "N/A", o2["Audio Decoder"] = s2.decoderType);
    const h2 = this.trackManager.getActiveSubtitleTrack();
    h2 && (o2.Subtitle = `${h2.codec ?? "text"}${h2.language ? ` (${h2.language.toUpperCase()})` : ""}`), e2 && (o2.Container = e2.formatName ?? "N/A", o2["Total Bitrate"] = e2.bitRate ? `${(e2.bitRate / 1e3).toFixed(0)} kbps` : "N/A"), o2["Playback State"] = this.stateManager.getState(), o2["Playback Rate"] = `${this.clock.getPlaybackRate()}x`, o2["A/V Sync"] = this.clock.isSyncedToAudio() ? "Audio Master" : "Wall Clock", o2["Stable Volume"] = this.audioRenderer.getStableAudio() ? "On" : "Off", o2["Audio Buffer"] = `${n2.toFixed(2)}s`, o2["Video Queue"] = `${a2?.frameQueueSize ?? 0} frames`, o2["Frames Rendered"] = a2?.framesPresented ?? 0, o2["Video Decoder Queue"] = r2.queueSize, o2["Audio Decoder Queue"] = s2.queueSize;
    const d2 = performance.memory;
    if (d2 && (o2["Memory Used"] = `${(d2.usedJSHeapSize / 1048576).toFixed(0)} MB`, o2["Memory Limit"] = `${(d2.jsHeapSizeLimit / 1048576).toFixed(0)} MB`), this.fileSize > 0 && (o2["File Size"] = this.fileSize > 1048576 ? `${(this.fileSize / 1048576).toFixed(1)} MB` : `${(this.fileSize / 1024).toFixed(1)} KB`), this.source instanceof HttpSource) {
      const e3 = this.source.getNetworkStats();
      o2.Downloaded = e3.totalBytes > 1048576 ? `${(e3.totalBytes / 1048576).toFixed(1)} MB` : `${(e3.totalBytes / 1024).toFixed(1)} KB`, o2["Network Speed"] = e3.currentSpeed > 0 ? e3.currentSpeed > 1048576 ? `${(e3.currentSpeed / 1048576).toFixed(1)} MB/s` : `${(e3.currentSpeed / 1024).toFixed(0)} KB/s` : "—", o2["Connection Time"] = `${e3.elapsed.toFixed(1)}s`;
    } else if (this.source instanceof FileSource) {
      const e3 = this.source.getDiskStats();
      o2["Disk Read"] = e3.totalBytes > 1048576 ? `${(e3.totalBytes / 1048576).toFixed(1)} MB` : `${(e3.totalBytes / 1024).toFixed(1)} KB`, o2["Read Speed"] = e3.currentSpeed > 0 ? e3.currentSpeed > 1048576 ? `${(e3.currentSpeed / 1048576).toFixed(1)} MB/s` : `${(e3.currentSpeed / 1024).toFixed(0)} KB/s` : "—";
    }
    return o2;
  }
  getNetworkSpeed() {
    return this.streamWrapper ? this.streamWrapper.getNetworkSpeed() : this.source instanceof HttpSource ? this.source.getNetworkStats().currentSpeed : this.source instanceof FileSource ? this.source.getDiskStats().currentSpeed : 0;
  }
  isFileSource() {
    return !this.streamWrapper && this.source instanceof FileSource;
  }
  isLinearPlayback() {
    const e2 = this.source;
    return "function" == typeof e2?.isLinearMode && e2.isLinearMode();
  }
  isAudioBlockedSuspended() {
    return !this.streamWrapper && (!!this._nativeAudioAutoplayBlocked || !this.disableAudio && this.audioRenderer.isBlockedSuspended());
  }
  wasAudioContextActivated() {
    return !this.disableAudio && this.audioRenderer.wasEverActivated();
  }
  isAudioOnly() {
    return this._audioOnly;
  }
  setAudioOnly(e2) {
    if (this._audioOnly === e2) return;
    if (this._audioOnly = e2, this.streamWrapper) return void this.streamWrapper.setAudioOnly?.(e2);
    const t2 = !!this.nativeAudioEl || !!this.audioDemuxer;
    if (e2) this.videoRenderer && this.videoRenderer.clearQueue(), t2 && (null !== this.animationFrameId && (cancelAnimationFrame(this.animationFrameId), this.animationFrameId = null), this.stopPauseBuffering(), this.setVideoSourcePrefetchPaused(true));
    else {
      this.setVideoSourcePrefetchPaused(false);
      const e3 = this.getCurrentTime();
      this.seek(e3).then(() => {
        t2 && null === this.animationFrameId && "playing" === this.stateManager.getState() && this.processLoop();
      }).catch((e4) => d.warn(Ne, "Audio-only → video resync seek failed", e4));
    }
  }
  isFileSourcePreloadComplete() {
    return !(this.source instanceof FileSource) || this.source.isPreloadComplete();
  }
  static isMobileDevice() {
    return MoviPlayer._isMobileDevice;
  }
  async requestWakeLock(e2 = 1) {
    if ("wakeLock" in navigator) if ("undefined" == typeof document || "visible" === document.visibilityState) try {
      this.wakeLock && await this.releaseWakeLock();
      const e3 = await navigator.wakeLock.request("screen");
      this.wakeLock = e3, d.debug(Ne, "WakeLock acquired"), e3.addEventListener("release", () => {
        d.debug(Ne, "WakeLock released by system"), this.wakeLock = null;
      });
    } catch (t2) {
      this.wakeLock = null, d.warn(Ne, "Failed to acquire WakeLock", t2), e2 > 0 && setTimeout(() => {
        const t3 = this.stateManager.getState();
        this.wakeLock || "playing" !== t3 && "buffering" !== t3 || "undefined" == typeof document || "visible" !== document.visibilityState || this.requestWakeLock(e2 - 1);
      }, 600);
    }
    else d.debug(Ne, "WakeLock skipped — page not visible");
    else d.debug(Ne, "WakeLock API not available");
  }
  ensureWakeLock() {
    if (this.wakeLock) return;
    const e2 = this.stateManager.getState();
    "playing" !== e2 && "buffering" !== e2 || "undefined" != typeof document && "visible" !== document.visibilityState || this.requestWakeLock();
  }
  handleNetworkOnline = () => {
    const e2 = this.stateManager.getState();
    if ("buffering" === e2 || "playing" === e2) {
      const e3 = this.getCurrentTime();
      d.info(Ne, `Network online — re-seeking to ${e3.toFixed(2)}s for clean recovery`), this.seek(e3).catch((e4) => {
        d.error(Ne, "Network recovery seek failed", e4);
      });
    }
  };
  isPiPActive = false;
  handleVisibilityChange = async () => {
    const e2 = "playing" === this.stateManager.getState() || "buffering" === this.stateManager.getState();
    if ("hidden" === document.visibilityState && e2) {
      const e3 = "undefined" != typeof navigator ? navigator.userAgent : "", t2 = navigator?.userAgentData;
      if ((true === t2?.mobile || /Android|iPhone|iPod|Mobile|Opera Mini|IEMobile|BlackBerry/i.test(e3) || /Macintosh/.test(e3) && (navigator.maxTouchPoints ?? 0) > 1) && !this.isPiPActive) return void this.pause();
      this.isBackgrounded = true, (!(!this.trackManager.getActiveAudioTrack() && !this.audioDemuxer || this.disableAudio) || this.isPiPActive) && this.startBackgroundTimer(), !this.isPiPActive && this.videoRenderer && (this.videoRenderer.stopPresentationLoop(), this.videoRenderer.clearQueue()), this.audioRenderer && this.audioRenderer.audioContext?.resume?.().catch(() => {
      });
    } else if ("visible" === document.visibilityState && (this.isBackgrounded = false, this.stopBackgroundTimer(), this.ensureWakeLock(), e2)) {
      this._foregroundRecoveryAt = performance.now(), this.audioRenderer?.suppressDuckFor(3e3);
      const e3 = this.audioRenderer?.audioContext;
      if (e3) {
        try {
          await e3.resume();
        } catch {
        }
        if ("suspended" === e3.state && !this.muted && !this.disableAudio) return d.warn(Ne, "AudioContext stuck suspended after foreground — pausing for user tap"), void this.pause();
      }
      if (this.isPiPActive) this.processLoop();
      else {
        const e4 = this.nativeAudioEl ? this.nativeAudioEl.currentTime : -1, t2 = this.audioRenderer.getAudioClock(), i2 = this.audioRenderer.getMaxScheduledMediaTime(), r2 = e4 >= 0 ? e4 : t2 >= 0 ? t2 : i2 > 0 ? i2 : this.clock.getTime();
        d.debug(Ne, `Foreground recovery: video-only seek to ${r2.toFixed(2)}s`), null !== this.animationFrameId && (cancelAnimationFrame(this.animationFrameId), this.animationFrameId = null);
        const s2 = ++this.seekSessionId;
        try {
          if (this.videoDecoder && await this.videoDecoder.flush(), this.videoRenderer && this.videoRenderer.clearQueue(), this.seekSessionId !== s2) return;
          if (this.eofReached = false, this.eofSince = 0, this.demuxer && await this.demuxer.seek(r2 + this.startTime), this.seekSessionId !== s2) return;
          this.clock.seek(r2 + this.startTime), this.seekTargetTime = Math.max(r2 + this.startTime, i2), this.seekingToKeyframe = true, this.seekingToKeyframeStartTime = performance.now(), this.seekCraSeen = 0, this.videoChainBrokenUntilKeyframe = false, this.videoRenderer && this.videoRenderer.startPresentationLoop(), this.processLoop();
        } catch (e5) {
          d.error(Ne, "Foreground recovery failed", e5), this.processLoop();
        }
      }
      setTimeout(() => this.ensureWakeLock(), 500);
    }
  };
  startBackgroundTimer() {
    if (!this.backgroundWorker && !this.backgroundIntervalId) {
      d.debug(Ne, "Starting background playback timer");
      try {
        const e2 = new Blob(["\n        let id = null;\n        self.onmessage = (e) => {\n          if (e.data === 'start') {\n            id = setInterval(() => self.postMessage('tick'), 16);\n          } else if (e.data === 'stop') {\n            clearInterval(id);\n            id = null;\n          }\n        };\n      "], { type: "application/javascript" });
        this.backgroundWorker = new Worker(URL.createObjectURL(e2)), this.backgroundWorker.onmessage = () => this.backgroundTick(), this.backgroundWorker.postMessage("start");
      } catch {
        d.debug(Ne, "Worker unavailable, using setInterval fallback"), this.backgroundIntervalId = window.setInterval(() => this.backgroundTick(), 16);
      }
    }
  }
  backgroundTick() {
    const e2 = this.stateManager.getState();
    "playing" !== e2 && "buffering" !== e2 || (this.audioDemuxer ? (this.pumpSplitAudio(), this.maybeEndSplitAudio(), this.isPiPActive && this.processLoop()) : this.processLoop(), this.isPiPActive && this.videoRenderer && this.videoRenderer.presentationLoop?.());
  }
  stopBackgroundTimer() {
    this.backgroundWorker && (this.backgroundWorker.postMessage("stop"), this.backgroundWorker.terminate(), this.backgroundWorker = null, d.debug(Ne, "Background worker stopped")), null !== this.backgroundIntervalId && (clearInterval(this.backgroundIntervalId), this.backgroundIntervalId = null);
  }
  startPauseBuffering() {
    null === this.pauseBufferTimerId && this.demuxer && !this.eofReached && (this.nativeAudioOnlyPlayback() || this.source instanceof FileSource || (d.debug(Ne, "Starting pause-time buffering"), this.pauseBufferTimerId = window.setInterval(() => {
      this.pauseBufferTick();
    }, MoviPlayer.PAUSE_BUFFER_INTERVAL_MS)));
  }
  stopPauseBuffering() {
    null !== this.pauseBufferTimerId && (clearInterval(this.pauseBufferTimerId), this.pauseBufferTimerId = null, d.debug(Ne, "Stopped pause-time buffering"));
  }
  pauseBufferTick = async () => {
    if ("paused" !== this.stateManager.getState()) return void this.stopPauseBuffering();
    if (this.demuxInFlight || !this.demuxer) return;
    if (this.eofReached) return void this.stopPauseBuffering();
    const e2 = this.pendingPrebufferPackets.length;
    if (e2 >= MoviPlayer.PAUSE_BUFFER_MAX_PACKETS) return d.debug(Ne, `Pause buffer full: ${e2} packets stashed`), void this.stopPauseBuffering();
    let t2 = 0, i2 = 0;
    const r2 = this.trackManager.getActiveVideoTrack(), s2 = this.trackManager.getActiveAudioTrack();
    for (const e3 of this.pendingPrebufferPackets) r2 && e3.streamIndex === r2.id ? i2++ : s2 && e3.streamIndex === s2.id && (t2 += e3.duration ?? 0);
    if ((!r2 || i2 >= MoviPlayer.PAUSE_BUFFER_VIDEO_FRAMES) && (!s2 || t2 >= MoviPlayer.PAUSE_BUFFER_AUDIO_SECONDS)) return d.debug(Ne, `Pause buffer targets met: audio=${t2.toFixed(1)}s, video=${i2} frames`), void this.stopPauseBuffering();
    try {
      this.demuxInFlight = true, this.demuxInFlightStartTime = performance.now();
      const e3 = 10;
      for (let t3 = 0; t3 < e3 && "paused" === this.stateManager.getState() && !(this.pendingPrebufferPackets.length >= MoviPlayer.PAUSE_BUFFER_MAX_PACKETS); t3++) {
        if (this.source instanceof HttpSource && !this.source.isFullyCached() && this.source.getPosition() >= this.source.getBufferedEnd() - 1048576) {
          this.stopPauseBuffering();
          break;
        }
        const e4 = await this.demuxer.readPacket();
        if (!e4) {
          this.eofReached = true;
          break;
        }
        this.trackManager.isActiveStream(e4.streamIndex) && this.pendingPrebufferPackets.push(e4);
      }
    } catch (e3) {
      d.error(Ne, "Pause buffer demux error", e3);
    } finally {
      this.demuxInFlight = false;
    }
  };
  async releaseWakeLock() {
    if (this.wakeLock) try {
      await this.wakeLock.release(), this.wakeLock = null, d.debug(Ne, "WakeLock released");
    } catch (e2) {
      d.warn(Ne, "Failed to release WakeLock", e2), this.wakeLock = null;
    }
  }
  getBufferedTime() {
    if (this.streamWrapper) return this.streamWrapper.getBufferEndTime();
    if (!this.mediaInfo || !this.source) return 0;
    const e2 = this.mediaInfo.duration;
    if (e2 <= 0) return 0;
    if (this.source instanceof HttpSource && this.fileSize > 0) {
      if (this.source.isFullyCached()) return this.lastBufferedTime = e2, e2;
      const t2 = this.source.getBufferedEnd();
      if (t2 > 0) {
        const i2 = this.source.getPosition(), r2 = Math.max(0, t2 - i2) / this.fileSize * e2, s2 = this.getCurrentTime() + r2;
        return this.lastBufferedTime = Math.max(this.lastBufferedTime, s2), this.lastBufferedTime;
      }
    }
    return this.source instanceof FileSource ? e2 : 0;
  }
  isHttpSource() {
    return this.source instanceof HttpSource;
  }
  setMaxBufferSize(e2) {
    if (!(e2 > 0 && this.source)) return;
    const t2 = this.source;
    "function" == typeof t2.setMaxBufferSize && t2.setMaxBufferSize(e2);
  }
  getBufferStartBytes() {
    return this.source instanceof HttpSource ? this.source.getBufferStart() : -1;
  }
  getBufferEndBytes() {
    return this.source instanceof HttpSource ? this.source.getBufferedEnd() : -1;
  }
  getBufferedRangeStart() {
    return this.bufferedRangeStart;
  }
  getBufferStartTime() {
    if (!this.mediaInfo || !this.source || !(this.source instanceof HttpSource) || this.fileSize <= 0) return 0;
    const e2 = this.mediaInfo.duration;
    if (this.source instanceof HttpSource && this.fileSize > 0) {
      const t2 = this.source.getBufferStart();
      return Math.min(1, t2 / this.fileSize) * e2;
    }
    return 0;
  }
  getSeekableStartTime() {
    if (!this.mediaInfo || !(this.source instanceof HttpSource) || this.fileSize <= 0 || !this.source.isLinearMode()) return 0;
    const e2 = Math.min(this.fileSize, this.source.getBufferStart() + 100663296);
    return Math.min(this.mediaInfo.duration, e2 / this.fileSize * this.mediaInfo.duration);
  }
  getBufferEndTime() {
    return this.getBufferedTime();
  }
  getSource() {
    return this.source;
  }
  static setLogLevel(e2) {
    d.setLevel(e2), j(e2);
  }
  isSoftwareDecoding() {
    return !!this.videoDecoder && this.videoDecoder.isSoftware;
  }
  getCoverArt() {
    return this.coverArt;
  }
  async extractCoverArt() {
    if (!this.config.enablePreviews) return;
    if (0 === this.trackManager.getAudioTracks().length) return;
    if (this.trackManager.getVideoTracks().length > 0) return;
    const e2 = this.trackManager.getAttachedPicTracks();
    if (0 !== e2.length) if (!this.source || this.fileSize <= 0) this.emit("coverart", null);
    else try {
      const t2 = await Demuxer.extractAttachedPicture(this.source, this.fileSize, this.config.wasmBinary, this.config.assetBaseUrl);
      if (!t2 || 0 === t2.length) return void this.emit("coverart", null);
      const i2 = (e2[0].codec || "").toLowerCase(), r2 = "png" === i2 ? "image/png" : "mjpeg" === i2 || "jpeg" === i2 || "jpg" === i2 ? "image/jpeg" : "webp" === i2 ? "image/webp" : "image/*", s2 = new Blob([t2.buffer], { type: r2 }), a2 = await createImageBitmap(s2);
      this.coverArt?.close?.(), this.coverArt = a2, this.emit("coverart", a2), d.info(Ne, `Cover art extracted: ${a2.width}x${a2.height} (${i2 || "image"})`);
    } catch (e3) {
      d.warn(Ne, "Cover art extraction failed", e3), this.emit("coverart", null);
    }
  }
  destroy() {
    if (!this._destroyed) {
      if (d.info(Ne, "Destroying player"), this._destroyed = true, this.trackSelectionGeneration++, this.releaseWakeLock(), this.clock.pause(), null !== this.animationFrameId && cancelAnimationFrame(this.animationFrameId), this.stopBackgroundTimer(), this.stopPauseBuffering(), this._prefetchThrottleTimer && (clearTimeout(this._prefetchThrottleTimer), this._prefetchThrottleTimer = null), this.stopAudioLoop(), this.audioDemuxer && (this.audioDemuxer.close(), this.audioDemuxer = null), this.audioSource) {
        try {
          this.audioSource.close();
        } catch {
        }
        this.audioSource = null;
      }
      this.streamWrapper && (this.streamWrapper.destroy(), this.streamWrapper = null), this.pendingPrebufferPackets = [], this.videoDecoder.close(), this.audioDecoder.close(), this.videoRenderer && this.videoRenderer.destroy(), this.audioRenderer.destroy(), this.demuxer && (this.demuxer.close(), this.demuxer = null), this.nativeAudioEl && (this.nativeAudioEl.pause(), this.nativeAudioEl.src = "", this.nativeAudioEl = null), this.revokeNativeAudioObjectUrl(), this._nativeAudioLogicalUrl = null, this.stopExternalSubtitles(), this._externalSubCues = [], this._subtitleTracks = [], this.source && (this.source.close(), this.source = null), this.cache.clear(), this.embeddedTextExportCache.clear(), this.trackManager.clear(), this.coverArt?.close?.(), this.coverArt = null, this.stateManager.reset(), this.mediaInfo = null, this.surface = null, this.renderingDiagnostics = { backend: "unknown", decoder: "none", renderer: "none", sourceDynamicRange: "unknown", outputDynamicRange: "unknown", outputVerification: "unknown", toneMapping: "unknown" }, this.emit("surfaceChange", null), this.emit("diagnosticsChange", this.getRenderingDiagnostics()), document.removeEventListener("visibilitychange", this.handleVisibilityChange), window.removeEventListener("online", this.handleNetworkOnline), this.removeAllListeners(), d.info(Ne, "Player destroyed");
    }
  }
}
const He = 1, We = "0.3.5-kmp.1";
export {
  CanvasRenderer as C,
  EventEmitter as E,
  d as L,
  He as M,
  TrackManager as T,
  a,
  We as b,
  MoviError as c,
  MoviPlayer as d,
  r as e,
  s as n,
  i as r
};
