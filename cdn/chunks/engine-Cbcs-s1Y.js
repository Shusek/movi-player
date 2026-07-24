var e = ((e2) => (e2[e2.SILENT = 0] = "SILENT", e2[e2.ERROR = 1] = "ERROR", e2[e2.WARN = 2] = "WARN", e2[e2.INFO = 3] = "INFO", e2[e2.DEBUG = 4] = "DEBUG", e2[e2.TRACE = 5] = "TRACE", e2))(e || {});
let t = 0;
const i = { setLevel(e2) {
  t = e2;
}, getLevel: () => t, error(e2, i2, ...r2) {
  t >= 1 && globalThis.__movilog?.error(`[movi:${e2}]`, i2, ...r2);
}, warn(e2, i2, ...r2) {
  t >= 2 && globalThis.__movilog?.warn(`[movi:${e2}]`, i2, ...r2);
}, info(e2, i2, ...r2) {
  t >= 3 && globalThis.__movilog?.info(`[movi:${e2}]`, i2, ...r2);
}, debug(e2, i2, ...r2) {
  t >= 4 && globalThis.__movilog?.debug(`[movi:${e2}]`, i2, ...r2);
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
    const r2 = this.listeners.get(e2);
    if (r2) for (const s2 of r2) try {
      s2(t2);
    } catch (t3) {
      i.error("EventEmitter", `Error in event listener for ${String(e2)}:`, t3);
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
const r = "HttpSource", s = 2097152, a = 262144e3, n = 131072;
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
  bufferSize = s;
  totalBytesDownloaded = 0;
  streamStartTime = 0;
  lastSpeedBytes = 0;
  lastSpeedTime = 0;
  currentSpeed = 0;
  lastSpeed = 0;
  maxBufferSizeMB;
  constructor(e2, t2 = {}, i2) {
    this.url = e2, this.headers = t2, this.maxBufferSizeMB = i2 ?? 250, this.initBuffer();
  }
  initBuffer() {
    this.bufferSize = s, this.resizeBuffer(this.bufferSize);
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
    const t2 = 1024 * this.maxBufferSizeMB * 1024, a2 = Math.max(s, Math.min(t2, e2));
    if (this.bufferSize !== a2 || !this.sharedBuffer && !this.fallbackBuffer) {
      this.bufferSize = a2;
      try {
        "undefined" != typeof SharedArrayBuffer && crossOriginIsolated ? (this.sharedBuffer = new SharedArrayBuffer(24 + this.bufferSize), this.headerView = new Int32Array(this.sharedBuffer, 0, 6), this.dataView = new Uint8Array(this.sharedBuffer, 24, this.bufferSize), this.useSharedBuffer = true, i.info(r, `Using SharedArrayBuffer for zero-copy streaming (${(this.bufferSize / 1024 / 1024).toFixed(2)} MB)`)) : (this.fallbackBuffer = new Uint8Array(this.bufferSize), i.info(r, `Using standard ArrayBuffer (${(this.bufferSize / 1024 / 1024).toFixed(2)} MB)`));
      } catch {
        this.fallbackBuffer = new Uint8Array(this.bufferSize), i.warn(r, `SharedArrayBuffer init failed, using fallback (${(this.bufferSize / 1024 / 1024).toFixed(2)} MB)`);
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
    this._contentDispositionFilename && i.debug(r, `Content-Disposition filename: ${this._contentDispositionFilename}`);
  }
  async buildRequestHeaders(e2) {
    return e2 ? { ...this.headers, Range: e2.openEnded ? `bytes=${e2.offset}-` : `bytes=${e2.offset}-${e2.offset + e2.length - 1}` } : { ...this.headers };
  }
  async getSize() {
    if (this.size >= 0) return this.size;
    try {
      this.size = await this.resolveSize(), i.debug(r, `File size: ${this.size} bytes`);
      const e2 = 1024 * this.maxBufferSizeMB * 1024, t2 = this.size <= e2, s2 = t2 ? this.size : Math.floor(0.08 * this.size);
      return this.resizeBuffer(s2), i.info(r, `Buffer: ${(this.bufferSize / 1024 / 1024).toFixed(1)}MB ${t2 ? "(full file cache)" : "(8% sliding window)"} for ${(this.size / 1024 / 1024).toFixed(1)}MB file`), this.size;
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
    if (0 === t2.length || t2.length > n) return;
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
    if (this.fullyBuffered) i.debug(r, `startStream(${e2}): skipped — file fully cached`);
    else {
      if (await this.stopStream(), i.info(r, `Starting stream from ${e2}`), this.streamError = null, this.size > 0 && e2 >= this.size) return i.debug(r, "Requested stream at or past EOF. Ignoring."), this.atomicSetBufferStart(e2), this.atomicSetWritePos(0), void this.atomicSetStreaming(false);
      this.atomicSetBufferStart(e2), this.atomicSetWritePos(0), this.atomicSetStreaming(true), this.atomicIncrementVersion(), this.fullyBuffered = false, this.maxBufferedEnd = e2, this.abortController = new AbortController(), this.readStreamBackground(e2).catch((e3) => {
        i.error(r, "Background stream failed fatally", e3), this.atomicSetStreaming(false);
      });
    }
  }
  async readStreamBackground(e2) {
    let t2 = 0, s2 = false, n2 = 0, o2 = 0, h2 = e2, d2 = false;
    for (; this.atomicIsStreaming(); ) try {
      const c2 = this.getBuffer();
      let u2;
      if (u2 = s2 ? this.atomicGetBufferStart() + this.atomicGetWritePos() : e2, this.size > 0 && u2 >= this.size) {
        i.debug(r, "Stream reached end of requested range (EOF)"), this.atomicSetStreaming(false);
        break;
      }
      const l2 = this.size > 0 && this.bufferSize >= this.size ? this.size : Math.floor(Math.min(a, 0.9 * this.bufferSize)), f2 = this.size > 0 ? Math.min(u2 + l2 - 1, this.size - 1) : u2 + l2 - 1;
      i.debug(r, `Fetching range: ${u2}-${f2} (max ${(l2 / 1024 / 1024).toFixed(1)}MB)`);
      const m2 = await fetch(this.url, { headers: await this.buildRequestHeaders({ offset: u2, length: f2 - u2 + 1, openEnded: d2 }), cache: "no-store", signal: this.abortController.signal });
      if (403 === m2.status && !d2) {
        d2 = true;
        try {
          m2.body?.cancel();
        } catch {
        }
        i.warn(r, `403 for bounded range ${u2}-${f2}; retrying open-ended (bytes=${u2}-)`);
        continue;
      }
      if (200 === m2.status) {
        if (n2++, n2 <= 3) {
          try {
            m2.body?.cancel();
          } catch {
          }
          i.warn(r, `Server returned 200 instead of 206 (attempt ${n2}/3). CDN may be caching — retrying in 1500ms...`), await new Promise((e3) => setTimeout(e3, 1500));
          continue;
        }
        if (0 === e2) return i.warn(r, "No Range support after 3 retries — falling back to sequential playback."), void await this.consumeNonRangeStream(m2);
        try {
          m2.body?.cancel();
        } catch {
        }
        const t3 = new Error("Server does not support range requests.");
        throw i.error(r, `Server returned 200 for offset ${e2}; range requests not supported.`), this.abortController?.abort(), this.atomicSetStreaming(false), this.streamError = t3, t3;
      }
      if (n2 = 0, !m2.ok && 206 !== m2.status) {
        if (m2.status >= 400 && m2.status < 500) {
          if (416 === m2.status) {
            i.warn(r, "Range not satisfiable, assuming EOF"), this.atomicSetStreaming(false);
            break;
          }
          throw new Error(`HTTP ${m2.status} (Fatal)`);
        }
        throw new Error(`HTTP ${m2.status}`);
      }
      this.reader = m2.body.getReader();
      const g2 = this.reader;
      t2 = 0, o2 = 0, s2 || (this.atomicSetBufferStart(e2), this.atomicSetWritePos(0), s2 = true);
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
          const e4 = Date.now(), s3 = (e4 - this.lastSpeedTime) / 1e3;
          if (s3 >= 0.5) {
            const t4 = this.totalBytesDownloaded - this.lastSpeedBytes;
            this.currentSpeed = t4 / s3, this.lastSpeed = this.currentSpeed, this.lastSpeedBytes = this.totalBytesDownloaded, this.lastSpeedTime = e4;
          }
          if (p2 - b2 > 1048576) {
            const e5 = (Date.now() - v2) / 1e3;
            e5 > 0 && (this.lastSpeed = p2 / e5);
            const t4 = e5 > 0 ? p2 / 1024 / 1024 / e5 : 0;
            i.debug(r, `Stream progress: ${(p2 / 1024 / 1024).toFixed(2)} MB read @ ${t4.toFixed(2)} MB/s`), b2 = p2;
          }
          let n3 = this.atomicGetWritePos();
          if (!(n3 + t3.length <= c2.length)) {
            i.debug(r, "Buffer full, stopping stream"), this.atomicSetStreaming(false);
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
              i.error(r, "Failed to acquire lock for writing"), this.atomicSetStreaming(false);
              break;
            }
            {
              c2.set(t3, n3);
              const e6 = n3 + t3.length;
              this.atomicSetWritePos(e6);
              const s4 = this.atomicGetBufferStart() + e6;
              s4 > this.maxBufferedEnd && (this.maxBufferedEnd = s4);
              const o3 = this.size > 0 && this.bufferSize >= this.size, d3 = s4 - h2, u3 = Math.floor(Math.min(a, 0.9 * this.bufferSize)), l3 = !o3 && d3 >= u3, f3 = !o3 && e6 >= 0.9 * c2.length;
              if (l3 || f3) {
                const t4 = this.atomicGetBufferStart(), a2 = this.position - t4;
                if (a2 > 0.25 * this.bufferSize && this.size > 0 && s4 < this.size) {
                  const s5 = Math.floor(a2);
                  if (s5 > 0 && e6 > s5) {
                    c2.copyWithin(0, s5, e6), this.atomicSetBufferStart(t4 + s5), this.atomicSetWritePos(e6 - s5), h2 = t4 + s5, this.unlock(), i.debug(r, `Buffer compacted: reclaimed ${(s5 / 1024 / 1024).toFixed(1)}MB`);
                    break;
                  }
                }
                this.unlock(), i.debug(r, `Downloaded ${(d3 / 1024 / 1024).toFixed(1)}MB (${l3 ? "limit reached" : "buffer full"}), stopping stream`), this.atomicSetStreaming(false);
                break;
              }
              if (this.unlock(), this.size > 0 && s4 >= this.size) {
                const e7 = this.atomicGetBufferStart();
                0 === e7 && this.bufferSize >= this.size && (this.fullyBuffered = true, i.info(r, `Entire file cached in memory (${(this.size / 1024 / 1024).toFixed(1)}MB)`)), i.debug(r, `Reached EOF (bufferStart=${e7}, bufferEnd=${s4}), stopping stream`), this.atomicSetStreaming(false);
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
      const s3 = e3.message || "", a2 = "TypeError" === e3.name && s3.includes("Failed to fetch"), n3 = "undefined" != typeof self && self.navigator && !self.navigator.onLine;
      if (a2) if (n3) o2 = 0;
      else {
        if (o2++, o2 >= 3) {
          const e4 = new Error("Failed to fetch video resource. Check your connection or CORS settings.");
          throw i.error(r, `CORS error accessing ${this.url} (${o2} consecutive failures while online)`), this.atomicSetStreaming(false), this.streamError = e4, e4;
        }
        i.warn(r, `Fetch failed while online (${o2}/3), may be transient network issue`);
      }
      if (e3.message && e3.message.includes("does not support range requests")) throw i.error(r, "Range requests not supported, cannot stream this URL"), this.atomicSetStreaming(false), e3;
      const h3 = e3?.message || "";
      if (h3.includes("(Fatal)")) {
        i.error(r, `Fatal HTTP error, not retrying: ${h3}`), this.atomicSetStreaming(false), this.streamError = e3 instanceof Error ? e3 : new Error(h3);
        break;
      }
      i.warn(r, "Stream error, retrying...", e3);
      try {
        this.reader && await this.reader.cancel();
      } catch {
      }
      if (this.reader = null, "undefined" != typeof self && self.navigator && !self.navigator.onLine) {
        i.warn(r, "Network offline, waiting for connection...");
        const e4 = this.abortController?.signal;
        if (await new Promise((t3) => {
          let s4 = false;
          const a3 = () => {
            s4 || (s4 = true, clearTimeout(n4), "undefined" != typeof self && self.removeEventListener("online", o3), e4?.removeEventListener("abort", h4), t3());
          }, n4 = setTimeout(() => {
            i.warn(r, "Offline wait timeout, retrying anyway..."), a3();
          }, 3e4), o3 = () => {
            i.info(r, "Network online, resuming..."), a3();
          }, h4 = () => a3();
          "undefined" != typeof self && self.addEventListener("online", o3), e4?.addEventListener("abort", h4);
        }), !this.atomicIsStreaming()) break;
        t2 = 0;
        continue;
      }
      if (t2++, t2 > 10) {
        i.error(r, "Max retries (10) reached, giving up."), this.atomicSetStreaming(false), this.streamError = e3 instanceof Error ? e3 : new Error("string" == typeof e3 ? e3 : "Stream failed after maximum retries");
        break;
      }
      const d3 = Math.min(1e3 * Math.pow(1.5, t2), 1e4), c2 = this.abortController?.signal;
      await new Promise((e4) => {
        let s4 = false;
        const a3 = () => {
          s4 || (s4 = true, clearTimeout(n4), "undefined" != typeof self && self.removeEventListener("online", h4), c2?.removeEventListener("abort", u2), e4());
        }, n4 = setTimeout(a3, d3), h4 = () => {
          i.info(r, "Online event during backoff — retrying immediately"), t2 = 0, o2 = 0, a3();
        }, u2 = () => a3();
        "undefined" != typeof self && self.addEventListener && self.addEventListener("online", h4), c2?.addEventListener("abort", u2);
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
    const t2 = this.getBuffer(), s2 = this.size > 0 && this.bufferSize >= this.size;
    if (s2) i.info(r, `Caching entire ${(this.size / 1048576).toFixed(1)}MB file in memory (no Range support).`);
    else {
      this.linearMode = true, i.warn(r, `Linear (non-seekable) playback: ${this.size > 0 ? (this.size / 1048576).toFixed(0) + "MB" : "unknown size"} exceeds the ${this.maxBufferSizeMB}MB cache cap or size is unknown.`);
      try {
        this.onLinearMode?.();
      } catch {
      }
    }
    if (this.atomicSetBufferStart(0), this.atomicSetWritePos(0), this.maxBufferedEnd = 0, this.fullyBuffered = false, this.atomicSetStreaming(true), !e2.body) return this.streamError = new Error("Empty response body"), void this.atomicSetStreaming(false);
    const a2 = e2.body.getReader();
    this.reader = a2;
    try {
      for (; this.atomicIsStreaming() && (await this.awaitPrefetchGate(), this.atomicIsStreaming()); ) {
        const { done: e3, value: i2 } = await a2.read();
        if (e3) break;
        i2 && 0 !== i2.length && (this.totalBytesDownloaded += i2.length, await this.writeSequential(i2, t2, s2));
      }
    } catch (e3) {
      "AbortError" !== e3?.name && (this.streamError = e3 instanceof Error ? e3 : new Error(String(e3)), i.error(r, "Non-range stream failed", e3));
    } finally {
      try {
        await a2.cancel();
      } catch {
      }
      this.reader = null;
    }
    const n2 = this.atomicGetBufferStart() + this.atomicGetWritePos();
    this.size <= 0 && (this.size = n2), s2 && 0 === this.atomicGetBufferStart() && this.size > 0 && n2 >= this.size && (this.fullyBuffered = true, i.info(r, `Entire file cached (${(this.size / 1048576).toFixed(1)}MB) — full random access.`)), this.atomicSetStreaming(false);
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
  async waitForData(e2, t2, s2 = 3e4) {
    const a2 = Date.now();
    let n2 = a2 + s2, o2 = e2 + t2;
    if (this.size > 0 && o2 > this.size && (o2 = this.size), e2 >= o2 && this.size > 0 && e2 >= this.size) return true;
    const h2 = this.useSharedBuffer && this.headerView ? Atomics.load(this.headerView, 5) : 0;
    let d2 = this.bufferEnd, c2 = Date.now();
    for (; this.bufferEnd < o2 && this.atomicIsStreaming(); ) {
      if (this.streamError) throw this.streamError;
      const t3 = Date.now();
      this.bufferEnd > d2 && (d2 = this.bufferEnd, c2 = t3, t3 - a2 > 0.8 * s2 && (n2 = t3 + 15e3));
      const u3 = t3 - c2;
      if (u3 > 15e3) return i.error(r, `Stream stalled: no progress for ${(u3 / 1e3).toFixed(1)}s at ${e2}, needed ${o2}, currently ${this.bufferEnd}`), false;
      if (t3 > n2) return i.error(r, `Timeout waiting for data at ${e2}, needed ${o2}, currently ${this.bufferEnd}`), false;
      if (this.useSharedBuffer && this.headerView && Atomics.load(this.headerView, 5) !== h2) return i.warn(r, `Stream superseded while waiting for ${e2}`), false;
      this.useSharedBuffer && this.headerView ? await new Promise((e3) => setTimeout(e3, 2)) : await this.waitForBufferAdvance(o2, 250);
    }
    const u2 = this.bufferEnd >= o2;
    if (this.streamError) throw this.streamError;
    if (!u2 && !this.atomicIsStreaming()) {
      if (this.size > 0 && this.bufferEnd >= this.size) return true;
      if (this.bufferEnd >= o2) return true;
      i.warn(r, `Stream ended before reaching needed offset ${o2} (current end: ${this.bufferEnd})`);
    }
    return u2;
  }
  async read(e2, t2) {
    const s2 = this.peekMetadata(e2, t2);
    if (s2) return this.position = e2 + t2, i.debug(r, "Read: served from metadata LRU"), s2.buffer;
    const a2 = await this._readInternal(e2, t2);
    return a2.byteLength > 0 && a2.byteLength <= n && this.cacheMetadataRead(e2, new Uint8Array(a2)), a2;
  }
  async _readInternal(e2, t2) {
    if (i.debug(r, `Read: offset=${e2}, length=${t2}, bufferStart=${this.atomicGetBufferStart()}, bufferEnd=${this.bufferEnd}, streaming=${this.atomicIsStreaming()}`), this.size > 0 && e2 >= this.size) return i.debug(r, "Read: returning empty (EOF)"), new ArrayBuffer(0);
    if (this.fullyBuffered && e2 >= this.atomicGetBufferStart() && e2 < this.bufferEnd) return this.consecutiveForceRestarts = 0, i.debug(r, "Read: served from full-file cache"), this.readFromBuffer(e2, t2);
    if (this.headBuffer && e2 + t2 <= this.headBuffer.length) {
      const s3 = new Uint8Array(t2);
      return s3.set(this.headBuffer.subarray(e2, e2 + t2)), this.position = e2 + t2, i.debug(r, "Read: served from head cache"), s3.buffer;
    }
    if (this.isInBuffer(e2, t2)) return this.consecutiveForceRestarts = 0, this.consecutiveOneOffFetches = 0, this.seekHinted = false, i.debug(r, "Read: serving from buffer"), this.readFromBuffer(e2, t2);
    if (this.rangeUnsupported) {
      if (e2 < this.atomicGetBufferStart()) throw new Error("Server does not support range requests.");
      if (this.linearMode && e2 + t2 > this.atomicGetBufferStart() + this.bufferSize) throw new Error("Server does not support range requests.");
      if (this.atomicIsStreaming() && await this.waitForData(e2, t2)) return this.readFromBuffer(e2, t2);
      if (this.isInBuffer(e2, t2)) return this.readFromBuffer(e2, t2);
      if (this.streamError) throw this.streamError;
      throw new Error("Server does not support range requests.");
    }
    const s2 = this.atomicGetBufferStart(), a2 = e2 - this.bufferEnd, n2 = this.atomicIsStreaming() && e2 >= s2 && e2 < s2 + this.bufferSize && a2 <= 2097152;
    if (i.debug(r, `Read: isCoveredByStream=${n2}, gap=${(a2 / 1024).toFixed(0)}KB`), n2) {
      i.debug(r, "Read: waiting for data from active stream...");
      const s3 = await this.waitForData(e2, t2);
      if (i.debug(r, `Read: waitForData returned ${s3}`), s3) return this.consecutiveForceRestarts = 0, this.consecutiveOneOffFetches = 0, this.seekHinted = false, this.readFromBuffer(e2, t2);
      if (this.atomicIsStreaming()) {
        if (this.isInBuffer(e2, t2)) return this.readFromBuffer(e2, t2);
        const s4 = Date.now();
        if (s4 - this.lastForceRestartTime > 5e3 && (this.consecutiveForceRestarts = 0), this.consecutiveForceRestarts >= this.MAX_FORCE_RESTARTS) throw i.error(r, `Too many consecutive force restarts (${this.consecutiveForceRestarts}), giving up.`), new Error(`Stream failed after ${this.consecutiveForceRestarts} restart attempts`);
        const a3 = Math.min(100 * Math.pow(2, this.consecutiveForceRestarts), 500);
        i.warn(r, `Read timeout for ${e2} but stream is active. Force restarting after ${a3}ms (attempt ${this.consecutiveForceRestarts + 1}/${this.MAX_FORCE_RESTARTS}).`), await new Promise((e3) => setTimeout(e3, a3)), this.consecutiveForceRestarts++, this.lastForceRestartTime = s4;
      }
    }
    if (!n2 && this.atomicIsStreaming() && !this.seekHinted && t2 <= 15728640 && this.consecutiveOneOffFetches < this.MAX_ONEOFF_BEFORE_RESTART) {
      i.info(r, `Read: one-off range fetch for offset=${e2}, length=${t2} (outside stream window, main stream continues)`);
      try {
        const i2 = (this.size > 0 ? Math.min(e2 + t2 - 1, this.size - 1) : e2 + t2 - 1) - e2 + 1, r2 = await fetch(this.url, { headers: await this.buildRequestHeaders({ offset: e2, length: i2 }) });
        if (206 === r2.status || r2.ok) {
          const t3 = r2.headers.get("content-length");
          if (t3 && parseInt(t3, 10) > 1.5 * i2) throw new Error(`Server ignored Range (Content-Length ${t3} for a ${i2}-byte request)`);
          const s3 = await r2.arrayBuffer();
          if (206 !== r2.status && s3.byteLength > 1.5 * i2) throw new Error(`Server ignored Range (returned ${s3.byteLength} bytes for a ${i2}-byte request)`);
          const a3 = new Uint8Array(s3), n3 = this.getBuffer(), o3 = e2 - this.atomicGetBufferStart();
          o3 >= 0 && o3 + a3.length <= n3.length && n3.set(a3, o3);
          const h2 = new Uint8Array(a3.length);
          return h2.set(a3), this.position = e2 + a3.length, this.consecutiveForceRestarts = 0, this.consecutiveOneOffFetches++, h2.buffer;
        }
      } catch (e3) {
        i.warn(r, "One-off range fetch failed, falling back to stream restart", e3);
      }
    }
    i.debug(r, `Read: starting new stream from ${e2}`), await this.startStream(e2), i.debug(r, "Read: waiting for data...");
    const o2 = await this.waitForData(e2, t2);
    if (i.debug(r, `Read: waitForData returned ${o2}`), !o2) throw new Error(`Timeout at ${e2}`);
    return this.consecutiveForceRestarts = 0, this.consecutiveOneOffFetches = 0, this.seekHinted = false, this.readFromBuffer(e2, t2);
  }
  readFromBuffer(e2, t2) {
    const i2 = this.getBuffer(), r2 = e2 - this.atomicGetBufferStart(), s2 = Math.min(t2, this.bufferEnd - e2), a2 = this.size > 0 && e2 < this.size && e2 + t2 > this.size;
    if ((s2 < t2 || r2 < 0) && !a2) throw new Error(`Incomplete read at ${e2}: ${Math.max(0, s2)}/${t2} bytes buffered`);
    const n2 = new Uint8Array(s2);
    return n2.set(i2.subarray(r2, r2 + s2)), this.position = e2 + s2, this.position > this.readMax && (this.readMax = this.position), this.recentReads.push(e2), this.recentReads.length > 64 && this.recentReads.shift(), n2.buffer;
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
    this.stopStream(), i.debug(r, "Source closed");
  }
  getKey() {
    return this.url;
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
    return { totalBytes: this.totalBytesDownloaded, currentSpeed: e2, lastSpeed: this.lastSpeed, elapsed: this.streamStartTime > 0 ? (Date.now() - this.streamStartTime) / 1e3 : 0 };
  }
}
const o = "LRUCache";
class LRUCache {
  cache = /* @__PURE__ */ new Map();
  maxSizeBytes;
  currentSizeBytes = 0;
  constructor(e2 = 100) {
    this.maxSizeBytes = 1024 * e2 * 1024, i.debug(o, `Created with max size: ${e2}MB`);
  }
  makeKey(e2, t2, i2) {
    return `${e2}:${t2}:${i2}`;
  }
  get(e2, t2, r2) {
    const s2 = this.makeKey(e2, t2, r2), a2 = this.cache.get(s2);
    return a2 ? (a2.accessTime = performance.now(), i.debug(o, `Cache hit: ${s2}`), a2.data) : null;
  }
  set(e2, t2, r2, s2) {
    const a2 = this.makeKey(e2, t2, r2);
    if (this.cache.has(a2)) {
      const e3 = this.cache.get(a2);
      this.currentSizeBytes -= e3.data.byteLength, this.cache.delete(a2);
    }
    for (; this.currentSizeBytes + s2.byteLength > this.maxSizeBytes && this.cache.size > 0; ) this.evictLRU();
    const n2 = { key: a2, data: s2, accessTime: performance.now() };
    this.cache.set(a2, n2), this.currentSizeBytes += s2.byteLength, i.debug(o, `Cache set: ${a2}, size: ${s2.byteLength}, total: ${this.currentSizeBytes}`);
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
      this.currentSizeBytes -= t3.data.byteLength, this.cache.delete(e2), i.debug(o, `Evicted: ${e2}`);
    }
  }
  clear() {
    this.cache.clear(), this.currentSizeBytes = 0, i.debug(o, "Cache cleared");
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
const h = "FileSource", d = 2097152;
class FileSource {
  file;
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
  constructor(e2, t2 = null) {
    this.file = e2, this.size = e2.size, this.cache = t2 || new LRUCache(100), this.sourceKey = this.getKey();
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
    return `file:${this.file.name}:${this.file.size}:${this.file.lastModified}`;
  }
  startPreload() {
    this.preloadPromise || (this.preloadPromise = this.preloadChunks());
  }
  async preloadChunks() {
    this.preloadAbort = false;
    try {
      const e2 = this.preloadOffset > 0 ? this.preloadOffset : 0, t2 = this.duration > 0 && this.currentTime > 0 ? ` (time: ${this.currentTime.toFixed(2)}s / ${this.duration.toFixed(2)}s)` : "";
      i.debug(h, `Starting preload for file: ${this.file.name} around offset ${e2}${t2} (${this.size} bytes)`);
      const r2 = Math.ceil(this.size / d), s2 = this.cache.getMaxSize(), a2 = this.fullFilePreload && s2 > 0 && this.size < 0.8 * s2, n2 = a2 ? r2 : 20, o2 = a2 ? 0 : 5, c2 = Math.floor(e2 / d), u2 = a2 ? 0 : c2, l2 = Math.min((a2 ? 0 : c2) + n2, r2), f2 = Math.max(0, c2 - o2), m2 = c2;
      for (let e3 = u2; e3 < l2 && !this.preloadAbort && !await this.shouldStopPreload(); e3++) {
        const t3 = e3 * d, i2 = Math.min(d, this.size - t3);
        if (i2 <= 0) break;
        if (this.cache.get(this.sourceKey, t3, i2)) continue;
        const r3 = await this.readChunkFromFile(t3, i2);
        this.cache.set(this.sourceKey, t3, i2, r3);
      }
      for (let e3 = m2 - 1; e3 >= f2 && !this.preloadAbort && !await this.shouldStopPreload(); e3--) {
        const t3 = e3 * d, i2 = Math.min(d, this.size - t3);
        if (i2 <= 0) continue;
        if (this.cache.get(this.sourceKey, t3, i2)) continue;
        const r3 = await this.readChunkFromFile(t3, i2);
        this.cache.set(this.sourceKey, t3, i2, r3);
      }
      this.preloadAbort || i.debug(h, `Preload completed for file: ${this.file.name} around offset ${e2}`);
    } catch (e2) {
      i.error(h, `Failed to preload file: ${this.file.name}`, e2);
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
    return e2 >= 95 && (i.debug(h, `Cache nearly full (${e2.toFixed(1)}%), stopping preload`), true);
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
    const i2 = new ArrayBuffer(t2), r2 = new Uint8Array(i2), s2 = Math.floor(e2 / d), a2 = Math.floor((e2 + t2 - 1) / d);
    for (let i3 = s2; i3 <= a2; i3++) {
      const s3 = i3 * d, a3 = Math.min(d, this.size - s3);
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
const c = "ThumbnailHttpSource";
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
    return i.debug(c, `File size: ${this.size} bytes`), this.size;
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
      const r3 = e2 - this.bufferStart, s3 = new Uint8Array(t2);
      return s3.set(this.buffer.subarray(r3, r3 + t2)), this.position = e2 + t2, i.debug(c, `Read from buffer: offset=${e2}, length=${t2}`), s3.buffer;
    }
    if (this.borrowSource) {
      const r3 = this.borrowSource.peekMetadata(e2, t2);
      if (r3) return this.position = e2 + t2, i.debug(c, `Read borrowed from metadata LRU: offset=${e2}, length=${t2}`), r3.buffer;
      const s3 = this.borrowSource.peekRange(e2, t2);
      if (s3) return this.position = e2 + t2, i.debug(c, `Read borrowed from main window: offset=${e2}, length=${t2}`), s3.buffer;
    }
    if (this.rangeUnsupported) return new ArrayBuffer(0);
    const r2 = e2, s2 = Math.min(Math.max(2097152, t2), 5242880), a2 = this.size > 0 ? Math.min(r2 + s2 - 1, this.size - 1) : r2 + s2 - 1;
    i.debug(c, `Fetching: range=${r2}-${a2} (${((a2 - r2 + 1) / 1024).toFixed(1)} KB)`);
    for (let s3 = 0; s3 <= 5; s3++) {
      "undefined" != typeof self && self.navigator && !self.navigator.onLine && (i.warn(c, "Network offline, waiting for connection..."), await new Promise((e3) => {
        const t3 = () => {
          self.removeEventListener("online", t3), e3();
        };
        self.addEventListener("online", t3);
      }), i.info(c, "Network online, resuming..."), s3 = 0);
      const n2 = new AbortController(), o2 = setTimeout(() => n2.abort(), 1e4);
      try {
        const s4 = await fetch(this.url, { headers: { ...this.headers, Range: `bytes=${r2}-${a2}` }, cache: "no-store", signal: n2.signal });
        if (clearTimeout(o2), 200 === s4.status) return i.info(c, "Server returned 200 (no Range support) — thumbnails switch to borrow-only."), n2.abort(), this.rangeUnsupported = true, new ArrayBuffer(0);
        if (!s4.ok && 206 !== s4.status) {
          if (416 === s4.status) return i.warn(c, `HTTP 416 (Range Not Satisfiable) at ${r2}-${a2}. Treating as EOF.`), new ArrayBuffer(0);
          throw s4.status >= 500 || 429 === s4.status ? new Error(`HTTP ${s4.status}`) : new Error(`HTTP ${s4.status} (Fatal)`);
        }
        const h2 = await s4.arrayBuffer();
        this.buffer = new Uint8Array(h2), this.bufferStart = r2, this.bufferEnd = r2 + h2.byteLength, i.debug(c, `Buffered: ${this.bufferStart}-${this.bufferEnd} (${(h2.byteLength / 1024).toFixed(1)} KB)`);
        const d2 = Math.min(t2, h2.byteLength), u2 = new Uint8Array(d2);
        return u2.set(this.buffer.subarray(0, d2)), this.position = e2 + d2, u2.buffer;
      } catch (t3) {
        if (clearTimeout(o2), "AbortError" === t3.name) return i.debug(c, `Read aborted at offset ${e2}`), new ArrayBuffer(0);
        const r3 = t3.message || "";
        if ("TypeError" === t3.name && r3.includes("Failed to fetch")) throw i.error(c, `CORS error accessing ${this.url}`), new Error("Failed to fetch video resource. Check your connection or CORS settings.");
        if (t3.message && t3.message.includes("(Fatal)")) throw t3;
        if (5 === s3) throw i.error(c, "Max retries (5) reached for thumbnail fetch, giving up."), t3;
        i.warn(c, `Fetch error (attempt ${s3 + 1}/5), retrying...`, t3);
        const a3 = Math.min(1e3 * Math.pow(1.5, s3), 5e3);
        await new Promise((e3) => setTimeout(e3, a3));
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
    this.buffer = null, this.bufferStart = 0, this.bufferEnd = 0, i.debug(c, "Buffer cleared");
  }
  close() {
    this.abortController && (this.abortController.abort(), this.abortController = null), this.buffer = null, i.debug(c, "Source closed");
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
const u = "EncryptedSource";
function l(e2) {
  const t2 = atob(e2), i2 = new ArrayBuffer(t2.length), r2 = new Uint8Array(i2);
  for (let e3 = 0; e3 < t2.length; e3++) r2[e3] = t2.charCodeAt(e3);
  return r2;
}
function f(e2) {
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
    super(e2.videoUrl, e2.headers ?? {}), this._encConfig = e2, this._cryptoReady = this.initCrypto(), i.info(u, "Created (ECDH protected)");
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
    const d2 = this._masterKey, c2 = this._token, u2 = this._hmacKey, l2 = EncryptedHttpSource.BLOCK_SIZE, m2 = e2 * l2;
    let g2 = (t2 + 1) * l2 - 1;
    this._knownFileSize > 0 && (g2 = Math.min(g2, this._knownFileSize - 1));
    const p2 = g2 - m2 + 1;
    globalThis.__movilog?.log(`[EncSrc] stream#${r2} token ready (${(performance.now() - s2).toFixed(0)}ms), range=${m2}-${g2} (${(p2 / 1024 / 1024).toFixed(1)} MB)`);
    const b2 = this.generateNonce(), v2 = Date.now(), S2 = `GET:${c2}:${b2}:${v2}:${m2}:${p2}`, y2 = new Uint8Array(await crypto.subtle.sign("HMAC", u2, new TextEncoder().encode(S2))), w2 = performance.now(), k2 = await fetch(this._encConfig.videoUrl, { method: "GET", headers: { Range: `bytes=${m2}-${g2}`, "X-Token": c2, "X-Fingerprint": this._encConfig.fingerprint, "X-Nonce": b2, "X-Timestamp": String(v2), "X-Signature": f(y2), ...this._encConfig.headers }, credentials: "include", signal: a2.signal });
    if (globalThis.__movilog?.log(`[EncSrc] stream#${r2} fetch() returned ${k2.status} in ${(performance.now() - w2).toFixed(0)}ms`), 401 === k2.status || 403 === k2.status) throw this._token = "", this._expiresAt = 0, this._authFailed = true, this._encConfig.onAuthFailed?.(`Auth failed: ${k2.status}`), new Error(`Auth failed: ${k2.status}`);
    if (!k2.ok && 206 !== k2.status || !k2.body) throw new Error(`HTTP ${k2.status}: ${k2.statusText}`);
    const _2 = k2.body.getReader();
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
    const C2 = (e3, t3) => {
      const i3 = crypto.subtle.decrypt({ name: "AES-GCM", iv: e3 }, d2, t3).then((e4) => new Uint8Array(e4));
      x2++, P2 = P2.then(async () => {
        const e4 = await i3;
        R2(e4), x2--;
      });
    };
    let E2 = false;
    try {
      for (; ; ) {
        const { done: e3, value: t3 } = await _2.read();
        if (t3 && t3.length > 0) {
          E2 || (globalThis.__movilog?.log(`[EncSrc] stream#${r2} first bytes (${t3.length}B) @ ${(performance.now() - s2).toFixed(0)}ms since start`), E2 = true);
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
          C2(t4, i3);
        }
        if (e3) break;
      }
      await P2, globalThis.__movilog?.log(`[EncSrc] stream#${r2} END total=${(performance.now() - s2).toFixed(0)}ms, delivered [${e2}..${A2 - 1}]`);
    } finally {
      try {
        _2.releaseLock();
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
    this._token = "", this._expiresAt = 0, this._masterKey = null, this._hmacKey = null, this._clientPrivKey = null, this._usedNonces.clear(), this._blockCache.clear(), this._blockInflight.clear(), super.close(), i.info(u, "Closed");
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
      throw i.error(u, t3), this._encConfig.onAuthFailed?.(t3), new Error(t3);
    }
    const t2 = await e2.json();
    this._token = t2.token, this._expiresAt = t2.expiresAt, this._knownFileSize < 0 && "number" == typeof t2.fileSize && (this._knownFileSize = t2.fileSize), !this._encContentDispositionFilename && "string" == typeof t2.contentDispositionFilename && t2.contentDispositionFilename && (this._encContentDispositionFilename = t2.contentDispositionFilename);
    const r2 = await crypto.subtle.importKey("raw", l(t2.serverPubKey), { name: "ECDH", namedCurve: "P-256" }, false, []), s2 = await crypto.subtle.deriveBits({ name: "ECDH", public: r2 }, this._clientPrivKey, 256), a2 = await crypto.subtle.importKey("raw", s2, { name: "HKDF" }, false, ["deriveBits"]), n2 = t2.hkdfSalt ? l(t2.hkdfSalt) : new Uint8Array(32), o2 = await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt: n2, info: new TextEncoder().encode("enc:master-aes") }, a2, 256);
    this._masterKey = await crypto.subtle.importKey("raw", o2, { name: "AES-GCM" }, false, ["decrypt"]);
    const h2 = await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt: n2, info: new TextEncoder().encode("enc:req-hmac") }, a2, 256);
    this._hmacKey = await crypto.subtle.importKey("raw", h2, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]), this._usedNonces.clear(), i.debug(u, `Token refreshed, expires in ${t2.expiresAt - Date.now()}ms`);
  }
  generateNonce() {
    const e2 = new Uint8Array(16);
    crypto.getRandomValues(e2);
    const t2 = f(e2);
    if (this._usedNonces.has(t2)) return this.generateNonce();
    if (this._usedNonces.add(t2), this._usedNonces.size > 1e3) {
      const e3 = Array.from(this._usedNonces);
      this._usedNonces.clear();
      for (const t3 of e3.slice(-500)) this._usedNonces.add(t3);
    }
    return t2;
  }
}
const m = "DashFallback", g = /\b(mp4a|ac-3|ec-3|ac-4|opus|vorbis|flac|dtsc|dtse)\b/i, p = /\b(avc[13]|hvc1|hev1|vp0[89]|vp8|vp9|av01|dvh)/i;
function b(e2) {
  const t2 = (e2 || "").split("-")[0];
  if (!t2 || "und" === t2) return "Audio";
  try {
    const e3 = "undefined" != typeof navigator && navigator.language || "en";
    return new Intl.DisplayNames([e3], { type: "language" }).of(t2) || t2.toUpperCase();
  } catch {
    return t2.toUpperCase();
  }
}
function v(e2, t2) {
  if (!t2) return e2;
  try {
    return new URL(t2, e2).href;
  } catch {
    return e2;
  }
}
function S(e2) {
  if (!e2) return null;
  for (const t2 of Array.from(e2.children)) if ("BaseURL" === t2.localName) return t2.textContent?.trim() || null;
  return null;
}
function y(e2, t2) {
  if (!S(e2)) return false;
  const i2 = (e3) => e3.getElementsByTagName("SegmentTemplate").length > 0 || e3.getElementsByTagName("SegmentList").length > 0;
  return !i2(e2) && !i2(t2);
}
function w(e2, t2) {
  const i2 = (t2.getAttribute("contentType") || e2.getAttribute("mimeType") || t2.getAttribute("mimeType") || "").toLowerCase();
  if (i2.includes("audio")) return "audio";
  if (i2.includes("video")) return "video";
  if (i2.includes("text") || i2.includes("vtt") || i2.includes("ttml")) return "text";
  const r2 = e2.getAttribute("codecs") || t2.getAttribute("codecs") || "";
  return p.test(r2) ? "video" : g.test(r2) ? "audio" : "other";
}
async function k(e2, t2) {
  let r2, s2;
  try {
    const i2 = await fetch(e2, { headers: t2 });
    if (!i2.ok) return null;
    r2 = await i2.text();
  } catch (e3) {
    return i.warn(m, "Failed to fetch DASH manifest for fallback", e3), null;
  }
  try {
    s2 = new DOMParser().parseFromString(r2, "application/xml");
  } catch {
    return null;
  }
  if (s2.getElementsByTagName("parsererror").length > 0) return null;
  const a2 = s2.getElementsByTagName("MPD")[0];
  if (!a2) return null;
  const n2 = v(e2, S(a2));
  let o2 = null, h2 = null;
  const d2 = [], c2 = [], u2 = [], l2 = a2.getElementsByTagName("Period")[0];
  if (!l2) return null;
  const f2 = v(n2, S(l2));
  for (const e3 of Array.from(l2.getElementsByTagName("AdaptationSet"))) {
    const t3 = v(f2, S(e3));
    for (const i2 of Array.from(e3.getElementsByTagName("Representation"))) {
      if (!y(i2, e3)) continue;
      const r3 = v(t3, S(i2)), s3 = parseInt(i2.getAttribute("bandwidth") || "0", 10), a3 = w(i2, e3), n3 = i2.getAttribute("codecs") || e3.getAttribute("codecs") || "", l3 = g.test(n3) && p.test(n3);
      if ("video" === a3) {
        (!o2 || s3 > o2.bw) && (o2 = { url: r3, bw: s3, muxed: l3 });
        const t4 = parseInt(i2.getAttribute("height") || e3.getAttribute("height") || "0", 10), a4 = i2.getAttribute("id") || String(s3);
        u2.some((e4) => e4.url === r3) || u2.push({ url: r3, bw: s3, height: t4, id: a4, muxed: l3 });
      } else if ("audio" === a3) {
        (!h2 || s3 > h2.bw) && (h2 = { url: r3, bw: s3 });
        const t4 = e3.getAttribute("lang") || i2.getAttribute("lang") || "und", a4 = i2.getAttribute("id") || String(s3);
        c2.some((e4) => e4.url === r3) || c2.push({ url: r3, lang: t4, bw: s3, id: a4 });
      } else if ("text" === a3) {
        const t4 = (e3.getAttribute("mimeType") || i2.getAttribute("mimeType") || "").toLowerCase();
        let s4;
        if (/\.vtt(\?|#|$)/i.test(r3) || /vtt/.test(t4) ? s4 = "vtt" : /\.srt(\?|#|$)/i.test(r3) ? s4 = "srt" : (/\.(ttml|dfxp)(\?|#|$)/i.test(r3) || /ttml|dfxp/.test(t4)) && (s4 = "ttml"), s4) {
          const t5 = e3.getAttribute("lang") || i2.getAttribute("lang") || "und", a4 = e3.getAttribute("label") || i2.getAttribute("id") || t5.toUpperCase();
          d2.some((e4) => e4.url === r3) || d2.push({ url: r3, lang: t5, label: a4, format: s4 });
        }
      }
    }
  }
  if (!o2 && !h2) return null;
  if (!o2 && h2) return i.info(m, `DASH fallback (audio-only) → ${h2.url}`), { videoUrl: h2.url };
  const k2 = { videoUrl: o2.url };
  if (!o2.muxed && h2 && (k2.audioUrl = h2.url), d2.length > 0 && (k2.subtitles = d2), !o2.muxed && c2.length > 1) {
    const e3 = /* @__PURE__ */ new Map();
    for (const t3 of c2) {
      const i2 = e3.get(t3.lang);
      (!i2 || t3.bw > i2.bw) && e3.set(t3.lang, t3);
    }
    e3.size > 1 && (k2.audioTracks = Array.from(e3.values()).sort((e4, t3) => t3.bw - e4.bw).map((e4) => ({ url: e4.url, lang: e4.lang, label: b(e4.lang) })));
  }
  if (u2.length > 1) {
    const e3 = {};
    for (const t3 of u2) e3[t3.height] = (e3[t3.height] || 0) + 1;
    k2.videoTracks = u2.slice().sort((e4, t3) => t3.bw - e4.bw).map((t3) => ({ url: t3.url, id: t3.id, bandwidth: t3.bw, label: t3.height > 0 ? e3[t3.height] > 1 ? `${t3.height}p · ${Math.round(t3.bw / 1e3)} kbps` : `${t3.height}p` : `${Math.round(t3.bw / 1e3)} kbps` }));
  }
  return i.info(m, `DASH fallback → video=${k2.videoUrl}${k2.videoTracks ? ` (${k2.videoTracks.length} qualities)` : ""}${k2.audioUrl ? `, audio=${k2.audioUrl}` : " (muxed)"}${k2.audioTracks ? `, audioTracks=${k2.audioTracks.length}` : ""}${k2.subtitles ? `, subs=${k2.subtitles.length}` : ""}`), k2;
}
const _ = "HlsFallback";
function T(e2) {
  if (!e2 || "und" === e2) return "";
  try {
    const t2 = e2.split("-")[0], i2 = "undefined" != typeof navigator && navigator.language || "en";
    return new Intl.DisplayNames([i2], { type: "language" }).of(t2) || e2;
  } catch {
    return e2;
  }
}
function A(e2, t2) {
  try {
    return new URL(e2, t2).href;
  } catch {
    return e2;
  }
}
async function R(e2, t2) {
  const i2 = await fetch(e2, t2 ? { headers: t2 } : void 0);
  if (!i2.ok) throw new Error(`HLS playlist HTTP ${i2.status}`);
  return i2.text();
}
function x(e2) {
  const t2 = {}, i2 = e2.slice(e2.indexOf(":") + 1), r2 = /([A-Z0-9-]+)=("([^"]*)"|[^,]*)/g;
  let s2;
  for (; null !== (s2 = r2.exec(i2)); ) t2[s2[1]] = void 0 !== s2[3] ? s2[3] : s2[2];
  return t2;
}
function P(e2, t2) {
  const i2 = e2.split(/\r?\n/), r2 = [];
  let s2, a2, n2 = "ts", o2 = true, h2 = 0, d2 = 0;
  for (const e3 of i2) {
    const i3 = e3.trim();
    if ("" !== i3) {
      if (i3.startsWith("#EXTINF:")) {
        const e4 = /#EXTINF:([\d.]+)/.exec(i3);
        h2 = e4 ? parseFloat(e4[1]) : 0;
      } else if (i3.startsWith("#EXT-X-MAP:")) {
        const e4 = /URI="([^"]+)"/.exec(i3);
        e4 && (s2 = A(e4[1], t2), n2 = "mp4");
      } else if (i3.startsWith("#EXT-X-BYTERANGE:")) {
        const e4 = /#EXT-X-BYTERANGE:(\d+)(?:@(\d+))?/.exec(i3);
        if (e4) {
          const t3 = parseInt(e4[1], 10), i4 = void 0 !== e4[2] ? parseInt(e4[2], 10) : d2;
          a2 = { length: t3, offset: i4 }, d2 = i4 + t3;
        }
      } else if (i3.startsWith("#EXT-X-ENDLIST")) o2 = false;
      else if (!i3.startsWith("#")) {
        const e4 = A(i3, t2);
        !s2 && /\.(mp4|m4s|cmf[va]?|fmp4)(\?|$)/i.test(i3) && (n2 = "mp4"), /\.(vtt|webvtt)(\?|$)/i.test(i3) && (n2 = "ts"), r2.push({ url: e4, duration: h2, byteRange: a2 }), h2 = 0, a2 = void 0;
      }
    }
  }
  const c2 = r2.reduce((e3, t3) => e3 + t3.duration, 0);
  return { segments: r2, initSegment: s2, container: n2, isLive: o2, totalDuration: c2 };
}
function C(e2) {
  const t2 = /X-TIMESTAMP-MAP=[^\n]*MPEGTS:(\d+)[^\n]*LOCAL:(\d\d):(\d\d):(\d\d)\.(\d\d\d)/.exec(e2);
  return t2 ? parseInt(t2[1], 10) / 9e4 - (3600 * +t2[2] + 60 * +t2[3] + +t2[4] + +t2[5] / 1e3) : 0;
}
function E(e2) {
  const t2 = /(?:(\d+):)?(\d{1,2}):(\d{2})\.(\d{3})/.exec(e2);
  return t2 ? (t2[1] ? 3600 * +t2[1] : 0) + 60 * +t2[2] + +t2[3] + +t2[4] / 1e3 : NaN;
}
function F(e2) {
  e2 < 0 && (e2 = 0);
  const t2 = Math.floor(e2 / 3600), i2 = Math.floor(e2 % 3600 / 60), r2 = Math.floor(e2 % 60), s2 = Math.round(1e3 * (e2 - Math.floor(e2))), a2 = (e3) => String(e3).padStart(2, "0");
  return `${a2(t2)}:${a2(i2)}:${a2(r2)}.${String(s2).padStart(3, "0")}`;
}
function D(e2) {
  const t2 = [], i2 = /* @__PURE__ */ new Set();
  let r2 = null;
  for (const s2 of e2) {
    if (!s2 || !s2.includes("-->")) continue;
    const e3 = C(s2);
    null === r2 && (r2 = e3);
    const a2 = e3 - r2, n2 = s2.replace(/^﻿/, "").split(/\r?\n\r?\n/);
    for (const e4 of n2) {
      if (!e4.includes("-->")) continue;
      const r3 = e4.replace(/([\d:.]+)\s*-->\s*([\d:.]+)([^\n]*)/, (e5, t3, i3, r4) => `${F(E(t3) + a2)} --> ${F(E(i3) + a2)}${r4}`);
      i2.has(r3) || (i2.add(r3), t2.push(r3.trim()));
    }
  }
  return "WEBVTT\n\n" + t2.join("\n\n") + "\n";
}
async function B(e2, t2) {
  try {
    const i2 = P(await R(e2, t2), e2);
    return i2.segments.length > 0 ? i2 : null;
  } catch (t3) {
    return i.warn(_, `media playlist load failed: ${e2}`, t3), null;
  }
}
const M = "SegmentStreamSource";
class SegmentStreamSource {
  constructor(e2, t2, i2, r2) {
    this.segments = e2, this.initSegment = t2, this.headers = r2, this.key = `hls-segments:${i2}`;
  }
  entries = [];
  totalSize = 0;
  position = 0;
  built = false;
  buildPromise = null;
  cache = /* @__PURE__ */ new Map();
  cacheOrder = [];
  maxCached = 24;
  _throughputBps = 0;
  abortController = new AbortController();
  key;
  async measure(e2, t2) {
    if (t2) return { length: t2.length, srcOffset: t2.offset, isRange: true };
    try {
      const t3 = await fetch(e2, { method: "HEAD", headers: this.headers, signal: this.abortController.signal }), i3 = t3.headers.get("Content-Length");
      if (t3.ok && i3) return { length: parseInt(i3, 10), srcOffset: 0, isRange: false };
    } catch {
    }
    try {
      const t3 = (await fetch(e2, { headers: { ...this.headers || {}, Range: "bytes=0-0" }, signal: this.abortController.signal })).headers.get("Content-Range");
      if (t3) {
        const e3 = /\/\s*(\d+)\s*$/.exec(t3);
        if (e3) return { length: parseInt(e3[1], 10), srcOffset: 0, isRange: false };
      }
    } catch {
    }
    const i2 = await fetch(e2, { headers: this.headers, signal: this.abortController.signal });
    return { length: (await i2.arrayBuffer()).byteLength, srcOffset: 0, isRange: false };
  }
  buildOnce() {
    return this.buildPromise || (this.buildPromise = (async () => {
      let e2 = 0;
      const t2 = (t3, i2) => {
        this.entries.push({ url: t3, start: e2, length: i2.length, srcOffset: i2.srcOffset, isRange: i2.isRange }), e2 += i2.length;
      };
      if (this.initSegment) try {
        t2(this.initSegment, await this.measure(this.initSegment));
      } catch (e3) {
        "AbortError" !== e3?.name && i.warn(M, "init segment measure failed", e3);
      }
      const r2 = new Array(this.segments.length).fill(null);
      let s2 = 0;
      await Promise.all(Array.from({ length: Math.min(12, this.segments.length) }, async () => {
        for (; s2 < this.segments.length; ) {
          const e3 = s2++, t3 = this.segments[e3];
          try {
            r2[e3] = await this.measure(t3.url, t3.byteRange);
          } catch (t4) {
            "AbortError" !== t4?.name && i.warn(M, `segment ${e3} measure failed`, t4), r2[e3] = { length: 0, srcOffset: 0, isRange: false };
          }
        }
      }));
      for (let e3 = 0; e3 < this.segments.length; e3++) t2(this.segments[e3].url, r2[e3]);
      this.totalSize = e2, this.built = true, i.info(M, `built segment map: ${this.entries.length} entries, ${(this.totalSize / 1e6).toFixed(1)} MB`);
    })()), this.buildPromise;
  }
  async getSize() {
    return this.built || await this.buildOnce(), this.totalSize;
  }
  async fetchEntry(e2) {
    const t2 = this.cache.get(e2);
    if (t2) return t2;
    const i2 = this.entries[e2], r2 = { ...this.headers || {} };
    i2.isRange && (r2.Range = `bytes=${i2.srcOffset}-${i2.srcOffset + i2.length - 1}`);
    const s2 = performance.now();
    let a2, n2;
    try {
      if (a2 = await fetch(i2.url, { headers: r2, signal: this.abortController.signal }), !a2.ok && 206 !== a2.status) throw new Error(`segment ${e2} HTTP ${a2.status}`);
      n2 = await a2.arrayBuffer();
    } catch (e3) {
      if ("AbortError" === e3?.name) return new ArrayBuffer(0);
      throw e3;
    }
    if (n2.byteLength > 0) {
      const e3 = Math.max((performance.now() - s2) / 1e3, 4e-3), t3 = n2.byteLength / e3;
      this._throughputBps = this._throughputBps > 0 ? 0.6 * this._throughputBps + 0.4 * t3 : t3;
    }
    if (i2.isRange && 200 === a2.status && n2.byteLength > i2.length && (n2 = n2.slice(i2.srcOffset, i2.srcOffset + i2.length)), this.cache.set(e2, n2), this.cacheOrder.push(e2), this.cacheOrder.length > this.maxCached) {
      const t3 = this.cacheOrder.shift();
      void 0 !== t3 && t3 !== e2 && this.cache.delete(t3);
    }
    return n2;
  }
  async read(e2, t2) {
    if (this.built || await this.buildOnce(), e2 >= this.totalSize || t2 <= 0) return new ArrayBuffer(0);
    const i2 = Math.min(e2 + t2, this.totalSize), r2 = new Uint8Array(i2 - e2);
    let s2 = 0, a2 = 0, n2 = this.entries.length - 1, o2 = 0;
    for (; a2 <= n2; ) {
      const t3 = a2 + n2 >> 1, i3 = this.entries[t3];
      if (e2 < i3.start) n2 = t3 - 1;
      else {
        if (!(e2 >= i3.start + i3.length)) {
          o2 = t3;
          break;
        }
        a2 = t3 + 1;
      }
    }
    let h2 = e2;
    for (let e3 = o2; e3 < this.entries.length && h2 < i2; e3++) {
      const t3 = this.entries[e3];
      if (0 === t3.length) continue;
      const a3 = new Uint8Array(await this.fetchEntry(e3)), n3 = h2 - t3.start, o3 = Math.min(t3.length - n3, i2 - h2);
      r2.set(a3.subarray(n3, n3 + o3), s2), s2 += o3, h2 += o3;
    }
    return this.position = i2, s2 === r2.length ? r2.buffer : r2.buffer.slice(0, s2);
  }
  seek(e2) {
    return this.position = e2, e2;
  }
  getPosition() {
    return this.position;
  }
  close() {
    try {
      this.abortController.abort();
    } catch {
    }
    this.cache.clear(), this.cacheOrder = [];
  }
  getKey() {
    return this.key;
  }
  getNetworkStats() {
    return { currentSpeed: this._throughputBps, lastSpeed: this._throughputBps };
  }
}
const $ = /* @__PURE__ */ new Map();
function I(e2, t2) {
  const i2 = function(e3, t3) {
    try {
      return new URL(e3, t3).protocol.replace(/:$/, "");
    } catch {
      return "";
    }
  }(e2, t2);
  return i2 ? $.get(i2) ?? null : null;
}
const L = "FFmpegLoader";
let O = null, U = null, V = null;
const N = /* @__PURE__ */ new Map();
function z(e2) {
  const t2 = "undefined" != typeof document ? document.baseURI : "undefined" != typeof location ? location.href : import.meta.url, i2 = new URL(e2, t2);
  return i2.pathname.endsWith("/") || (i2.pathname = `${i2.pathname}/`), i2.href;
}
async function W(e2) {
  if (e2) {
    const t2 = z(e2);
    let i2 = N.get(t2);
    if (!i2) {
      const e3 = new URL("wasm/movi.js", t2).href;
      i2 = import(e3).then((e4) => e4.default), N.set(t2, i2);
    }
    return i2;
  }
  if (!V) {
    const e3 = new URL([".", "movi.js"].join("/"), import.meta.url).href;
    V = import(e3).then((e4) => e4.default);
  }
  return V;
}
function H(e2, wasmBinary, t2) {
  const r2 = { print: (e3) => {
    e3 && e3.trim() && i.debug("WASM", e3);
  }, printErr: (e3) => {
    e3 && e3.trim() && i.debug("WASM", e3);
  } };
  if (wasmBinary && (r2.wasmBinary = wasmBinary), t2 && (r2.onAbort = t2), e2.assetBaseUrl) {
    const t3 = new URL("wasm/", z(e2.assetBaseUrl));
    r2.locateFile = (i2) => e2.workerPath && i2.endsWith(".worker.js") ? e2.workerPath : new URL(i2.split("/").pop() || i2, t3).href;
  } else e2.workerPath && (r2.locateFile = (t3) => t3.endsWith(".worker.js") ? e2.workerPath : t3);
  return r2;
}
function K() {
  U = null, O = null;
}
async function G(e2 = {}) {
  return U || O || (O = (async () => {
    i.info(L, "Loading WASM module...");
    const wasmBinary = e2.wasmBinary || null;
    try {
      const t2 = await W(e2.assetBaseUrl), r2 = await t2(H(e2, wasmBinary, (e3) => {
        i.error(L, `WASM aborted — discarding dead cached module: ${e3}`), K();
      }));
      return i.info(L, "WASM module loaded successfully"), r2.FS ? i.debug(L, "FS is present on module") : i.error(L, "FS is MISSING from module!"), U = r2, r2;
    } catch (e3) {
      throw i.error(L, "Failed to load WASM module", e3), O = null, e3;
    }
  })(), O);
}
async function X(e2 = {}) {
  i.info(L, "Loading NEW WASM module instance (isolated)...");
  const wasmBinary = e2.wasmBinary || null;
  try {
    const t2 = await W(e2.assetBaseUrl), r2 = await t2(H(e2, wasmBinary));
    return i.info(L, "NEW WASM module instance loaded"), r2;
  } catch (e3) {
    throw i.error(L, "Failed to load new WASM module", e3), e3;
  }
}
const q = 344, j = "Bindings";
function Q(t2) {
  switch (t2) {
    case e.SILENT:
      return -8;
    case e.ERROR:
      return 16;
    case e.WARN:
      return 24;
    case e.INFO:
      return 32;
    case e.DEBUG:
      return 48;
    case e.TRACE:
      return 56;
    default:
      return 24;
  }
}
const Y = /* @__PURE__ */ new Set();
function Z(e2, t2) {
  const i2 = new DataView(e2.HEAPU8.buffer, t2, q), r2 = e2.HEAPU8.subarray(t2 + 12, t2 + 12 + 32), s2 = new TextDecoder().decode(r2.slice(0, r2.indexOf(0))), a2 = e2.HEAPU8.subarray(t2 + 100, t2 + 100 + 8), n2 = new TextDecoder().decode(a2.slice(0, a2.indexOf(0))), o2 = e2.HEAPU8.subarray(t2 + 108, t2 + 108 + 64), h2 = new TextDecoder().decode(o2.slice(0, o2.indexOf(0)));
  return { index: i2.getInt32(0, true), type: i2.getInt32(4, true), codecId: i2.getInt32(8, true), codecName: s2, width: i2.getInt32(44, true), height: i2.getInt32(48, true), frameRate: i2.getFloat64(56, true), channels: i2.getInt32(64, true), sampleRate: i2.getInt32(68, true), duration: i2.getFloat64(72, true), bitRate: Number(i2.getBigInt64(80, true)), extradataSize: i2.getInt32(88, true), profile: i2.getInt32(92, true), level: i2.getInt32(96, true), language: n2 || "", label: h2 || "", rotation: i2.getInt32(172, true), colorPrimaries: J(e2, t2 + 176, 32), colorTransfer: J(e2, t2 + 208, 32), colorMatrix: J(e2, t2 + 240, 32), pixelFormat: J(e2, t2 + 272, 32), colorRange: J(e2, t2 + 304, 32), projection: i2.getInt32(336, true), isAttachedPic: 0 !== i2.getInt32(340, true) };
}
function J(e2, t2, i2) {
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
    this.module = e2, this.setupAsyncHandlers(), Y.add(this);
    const t2 = null !== ee ? ee : i.getLevel();
    this.setLogLevel(Q(t2));
  }
  getHumanReadableError(e2) {
    const t2 = -e2 >>> 0, r2 = `${String.fromCharCode(255 & t2)}${String.fromCharCode(t2 >> 8 & 255)}${String.fromCharCode(t2 >> 16 & 255)}${String.fromCharCode(t2 >> 24 & 255)}`, s2 = { INDA: ": File is corrupted or in an unsupported format", FEND: ": Unexpected end of file", NDPA: ": Cannot detect file format — file may be corrupted or incomplete", NFED: ": Could not find a suitable decoder for this file", NFMX: ": Could not find a suitable demuxer for this file", EXIT: ": Operation was interrupted" };
    if (s2[r2]) return s2[r2];
    if (e2 > -100) {
      const t3 = { [-2]: ": File not found", [-13]: ": Permission denied", [-12]: ": Not enough memory to process this file", [-5]: ": Read error — file may be incomplete or inaccessible" };
      if (t3[e2]) return t3[e2];
    }
    return i.debug(j, `Unknown FFmpeg error: code=${e2}, tag=${r2}`), ": Unable to open this file";
  }
  setupAsyncHandlers() {
    const e2 = this;
    this.module.onReadRequest = async (t2, r2) => {
      try {
        if (!e2.dataSource) return i.error(j, "No data source set for read request"), void e2.fulfillRead(new Uint8Array(0), -1);
        const s2 = "bigint" == typeof t2 ? Number(t2) : t2;
        s2 > Number.MAX_SAFE_INTEGER && i.warn(j, `Read offset ${t2} exceeds MAX_SAFE_INTEGER, precision may be lost`);
        const a2 = await e2.dataSource.read(s2, r2);
        e2.fulfillRead(new Uint8Array(a2), a2.byteLength);
      } catch (t3) {
        e2.lastError = t3.message || String(t3), i.error(j, "Read request failed", t3), e2.fulfillRead(new Uint8Array(0), -1);
      }
    }, this.module.onSeekRequest = async (t2, r2) => {
      const s2 = "bigint" == typeof t2 ? Number(t2) : t2;
      if (s2 > Number.MAX_SAFE_INTEGER && i.warn(j, `Seek offset ${t2} exceeds MAX_SAFE_INTEGER, precision may be lost`), e2.dataSource && "function" == typeof e2.dataSource.seek) try {
        e2.dataSource.seek(s2);
      } catch (e3) {
        i.warn(j, "Source seek failed, continuing anyway", e3);
      }
      const a2 = "bigint" == typeof t2 ? t2 : BigInt(Math.floor(s2));
      e2.fulfillSeek(a2);
    };
  }
  fulfillRead(e2, t2) {
    const r2 = this.module._pendingRead;
    r2 ? (t2 > 0 && e2.byteLength > 0 && this.module.HEAPU8.set(e2.subarray(0, t2), r2.buffer), r2.resolve(t2), this.module._pendingRead = null) : i.warn(j, "No pending read to fulfill");
  }
  fulfillSeek(e2) {
    const t2 = this.module._pendingSeek;
    if (!t2) return void i.warn(j, "No pending seek to fulfill");
    const r2 = "bigint" == typeof e2 ? e2 : BigInt(Math.floor(e2));
    t2.resolve(r2), this.module._pendingSeek = null;
  }
  setDataSource(e2) {
    this.dataSource = e2;
  }
  setFileSize(e2) {
    if (!this.contextPtr) return void i.warn(j, "Cannot set file size: context not created");
    const t2 = 4294967295 & e2, r2 = Math.floor(e2 / 4294967296);
    this.module._movi_set_file_size(this.contextPtr, t2, r2), i.debug(j, `File size set: ${e2} bytes`);
  }
  create() {
    return this.contextPtr && (i.warn(j, "Context already exists, destroying old context"), this.destroy()), this.contextPtr = this.module._movi_create(), this.contextPtr ? (this.packetBufferSize = 10485760, this.packetBuffer = this.module._malloc(this.packetBufferSize), i.debug(j, "Context created"), true) : (i.error(j, "Failed to create movi context"), false);
  }
  destroy() {
    Y.delete(this), this.packetBuffer && (this.module._free(this.packetBuffer), this.packetBuffer = 0), this.contextPtr && (this.module._movi_destroy(this.contextPtr), this.contextPtr = 0), this.dataSource = null, this.fileSize = 0, i.debug(j, "Context destroyed");
  }
  async open() {
    if (!this.contextPtr) throw new Error("Context not created");
    if (!this.dataSource) throw new Error("Data source not set");
    this.fileSize = await this.dataSource.getSize(), this.module._fileSize = BigInt(Math.floor(this.fileSize));
    const e2 = BigInt(Math.floor(this.fileSize)), t2 = Number(0xffffffffn & e2), r2 = Number(e2 >> 32n);
    this.module._movi_set_file_size(this.contextPtr, t2, r2), this.lastError = null;
    const s2 = await this.module.ccall("movi_open", "number", ["number"], [this.contextPtr], { async: true });
    if (s2 < 0) {
      let e3;
      throw e3 = this.lastError ? `: ${this.lastError}` : this.getHumanReadableError(s2), new Error(`Failed to open media${e3}`);
    }
    return i.debug(j, `Media opened with ${s2} streams`), s2;
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
    const t2 = this.module._malloc(q);
    this.module.HEAPU8.fill(0, t2, t2 + q);
    try {
      return 0 !== this.module._movi_get_stream_info(this.contextPtr, e2, t2) ? null : Z(this.module, t2);
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
  getAttachments(e2 = 33554432, t2 = 64, i2 = 16777216) {
    if (!this.contextPtr) return [];
    const r2 = this.module._movi_get_attachment_count, s2 = this.module._movi_get_attachment_stream_index, a2 = this.module._movi_get_attachment_size, n2 = this.module._movi_get_attachment_name, o2 = this.module._movi_get_attachment_mime_type, h2 = this.module._movi_get_attachment_data;
    if (!(r2 && s2 && a2 && n2 && o2 && h2)) return [];
    const d2 = Math.min(Math.max(0, r2(this.contextPtr)), t2), c2 = [], u2 = this.module._malloc(512), l2 = this.module._malloc(128);
    let f2 = 0;
    try {
      for (let t3 = 0; t3 < d2; t3++) {
        const r3 = a2(this.contextPtr, t3);
        if (r3 <= 0 || r3 > i2 || f2 + r3 > e2) continue;
        const d3 = this.module._malloc(r3);
        if (d3) try {
          this.module.HEAPU8.fill(0, u2, u2 + 512), this.module.HEAPU8.fill(0, l2, l2 + 128), n2(this.contextPtr, t3, u2, 512), o2(this.contextPtr, t3, l2, 128);
          const i3 = h2(this.contextPtr, t3, d3, r3);
          if (i3 <= 0 || f2 + i3 > e2) continue;
          const a3 = new Uint8Array(i3);
          a3.set(this.module.HEAPU8.subarray(d3, d3 + i3)), c2.push({ streamIndex: s2(this.contextPtr, t3), name: J(this.module, u2, 512), mimeType: J(this.module, l2, 128), data: a3 }), f2 += i3;
        } finally {
          this.module._free(d3);
        }
      }
    } finally {
      this.module._free(u2), this.module._free(l2);
    }
    return c2;
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
        const o2 = J(this.module, i2, 256);
        this.module.HEAPU8.fill(0, r2, r2 + 64), this.module._movi_get_chapter_id?.(this.contextPtr, a2, r2, 64), this.module.HEAPU8.fill(0, s2, s2 + 32), this.module._movi_get_chapter_language?.(this.contextPtr, a2, s2, 32);
        const h2 = J(this.module, s2, 32) || void 0, d2 = o2 || `Chapter ${a2 + 1}`;
        t2.push({ id: J(this.module, r2, 64) || `chapter-${a2}`, title: d2, start: e3 >= 0 ? e3 : 0, end: n2 >= 0 ? n2 : 0, language: h2, labels: [{ text: d2, language: h2 }], isHidden: 1 === this.module._movi_get_chapter_hidden?.(this.contextPtr, a2) });
      }
    } finally {
      this.module._free(i2), this.module._free(r2), this.module._free(s2);
    }
    return t2;
  }
  async seek(e2, t2 = -1, r2 = 1) {
    if (!this.contextPtr) throw new Error("Context not created");
    const s2 = await this.module.ccall("movi_seek_to", "number", ["number", "number", "number", "number"], [this.contextPtr, e2, t2, r2], { async: true });
    if (s2 < 0) throw new Error(`Seek failed: error ${s2}`);
    i.debug(j, `Seeked to ${e2}s`);
  }
  async readFrame() {
    if (!this.contextPtr) return null;
    const e2 = this.module._malloc(48);
    try {
      let t2 = await this.module.ccall("movi_read_frame", "number", ["number", "number", "number", "number"], [this.contextPtr, e2, this.packetBuffer, this.packetBufferSize], { async: true });
      if (t2 < 0 && -1 !== t2) throw i.error(j, `Read frame failed: error ${t2}. This might be due to a packet larger than ${this.packetBufferSize} bytes.`), new Error(`Read frame failed: error ${t2}`);
      if (0 === t2) return null;
      const r2 = function(e3, t3) {
        const i2 = new DataView(e3.HEAPU8.buffer, t3, 48);
        return { streamIndex: i2.getInt32(0, true), keyframe: 0 !== i2.getInt32(4, true), pts: i2.getFloat64(8, true), dts: i2.getFloat64(16, true), duration: i2.getFloat64(24, true), size: i2.getInt32(32, true), isIdr: 0 !== i2.getInt32(36, true), isRasl: 0 !== i2.getInt32(40, true), disposable: 0 !== i2.getInt32(44, true) };
      }(this.module, e2);
      if (r2.size < 0 || r2.size > this.packetBufferSize) return i.warn(j, `Invalid packet size: ${r2.size} (buffer size: ${this.packetBufferSize}), treating as EOF`), null;
      const s2 = new Uint8Array(r2.size);
      return s2.set(this.module.HEAPU8.subarray(this.packetBuffer, this.packetBuffer + r2.size)), { info: r2, data: s2 };
    } finally {
      this.module._free(e2);
    }
  }
  setLogLevel(e2) {
    this.module._movi_set_log_level(e2);
  }
  setLogLevelFromMovi(e2) {
    const t2 = Q(e2);
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
  async decodeSubtitle(e2, t2, r2, s2) {
    if (!this.contextPtr) throw new Error("Context not created");
    const a2 = this.module._malloc(t2.length);
    if (!a2) return i.error(j, "Failed to allocate memory for subtitle packet"), -1;
    try {
      this.module.HEAPU8.set(t2, a2);
      const i2 = s2 ?? 0;
      return await this.module.ccall("movi_decode_subtitle", "number", ["number", "number", "number", "number", "number", "number"], [this.contextPtr, e2, a2, t2.length, r2, i2], { async: true });
    } finally {
      this.module._free(a2);
    }
  }
  async getSubtitleText() {
    if (!this.contextPtr) return i.debug(j, "getSubtitleText: context not created"), null;
    const e2 = this.module._malloc(4096);
    if (!e2) return i.error(j, "getSubtitleText: failed to allocate buffer"), null;
    try {
      i.debug(j, "getSubtitleText: calling movi_get_subtitle_text");
      const t2 = this.module.ccall("movi_get_subtitle_text", "number", ["number", "number", "number"], [this.contextPtr, e2, 4096], { async: false });
      if (i.debug(j, `getSubtitleText: C function returned ${t2}`), t2 < 0) return i.warn(j, `getSubtitleText: C function returned error ${t2}`), null;
      if (0 === t2) return i.debug(j, "getSubtitleText: No text extracted (result=0) - might be empty subtitle or no rectangles"), null;
      const r2 = this.module.HEAPU8.subarray(e2, e2 + t2), s2 = new TextDecoder().decode(r2.slice()), a2 = s2?.trim();
      return a2 && 0 !== a2.length ? (i.debug(j, `getSubtitleText: Extracted text length=${t2}, trimmed length=${a2.length}, text="${a2.substring(0, 50)}..."`), a2) : (i.debug(j, `getSubtitleText: Extracted text is empty after trimming (raw length=${t2})`), null);
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
    if (t2 < 0) return i.warn(j, `prefetchSubtitleCues: failed (${t2})`), null;
    const r2 = [];
    if (0 === t2) return r2;
    const s2 = this.module._malloc(8), a2 = this.module._malloc(8), n2 = this.module._malloc(8192);
    if (!s2 || !a2 || !n2) return s2 && this.module._free(s2), a2 && this.module._free(a2), n2 && this.module._free(n2), null;
    try {
      for (let e3 = 0; e3 < t2; e3++) {
        const t3 = this.module.ccall("movi_get_prefetched_cue", "number", ["number", "number", "number", "number", "number", "number"], [this.contextPtr, e3, s2, a2, n2, 8192], { async: false });
        if (t3 < 0) continue;
        const i2 = new DataView(this.module.HEAPU8.buffer, s2, 8).getFloat64(0, true), o2 = new DataView(this.module.HEAPU8.buffer, a2, 8).getFloat64(0, true), h2 = this.module.HEAPU8.subarray(n2, n2 + t3), d2 = new TextDecoder().decode(h2.slice()).trim();
        d2 && r2.push({ start: i2, end: o2, text: d2 });
      }
    } finally {
      this.module._free(s2), this.module._free(a2), this.module._free(n2), this.module.ccall("movi_clear_prefetched_cues", "void", ["number"], [this.contextPtr], { async: false });
    }
    return r2;
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
let ee = e.SILENT;
function te(e2) {
  ee = e2;
  const t2 = Q(e2);
  for (const e3 of Y) e3.setLogLevel(t2);
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
    const t2 = Q(e2);
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
    i.debug(j, `JS calling _movi_thumbnail_read_keyframe(${this.contextPtr}, ${e2.toFixed(2)})`);
    let t2 = -1, r2 = -1;
    this.module._pendingThumbnail = { resolve: (e3) => {
      i.debug(j, `JS callback received: size=${e3.size}, pts=${e3.pts}`), t2 = e3.size, r2 = e3.pts;
    } };
    try {
      return await this.module.ccall("movi_thumbnail_read_keyframe", "void", ["number", "number"], [this.contextPtr, e2], { async: true }), t2 > 0 && (this.lastPacketPts = r2), t2;
    } catch (e3) {
      return i.error(j, "readKeyframe error", e3), -1;
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
    const e2 = this.module._malloc(q);
    this.module.HEAPU8.fill(0, e2, e2 + q);
    try {
      return 0 !== this.module._movi_thumbnail_get_stream_info(this.contextPtr, e2) ? null : Z(this.module, e2);
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
    this.contextPtr && (this.module._movi_thumbnail_destroy(this.contextPtr), this.contextPtr = 0, this.isOpened = false, i.debug(j, "Thumbnail context destroyed"));
  }
}
const ie = "CodecParser";
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
  static getCodecString(e2, t2, r2, s2) {
    if (i.debug(ie, `Extradata: ${t2?.length}`), !t2 || 0 === t2.length) return null;
    const a2 = e2.toLowerCase();
    return "hevc" === a2 || "h265" === a2 || "hvc1" === a2 || "hev1" === a2 ? this.getHevcCodecString(t2, r2, s2) : "av1" === a2 || "av01" === a2 ? this.getAv1CodecString(t2) : "vp9" === a2 || "vp09" === a2 ? this.getVp9CodecString(t2) : "h264" === a2 || "avc1" === a2 ? this.getAvcCodecString(t2) : "vp8" === a2 ? this.getVp8CodecString(t2) : "vvc" === a2 || "vvc1" === a2 || "vvi1" === a2 ? this.getVvcCodecString(t2) : null;
  }
  static getColorSpaceInfo(e2, t2, r2, s2) {
    if (!t2 || 0 === t2.length) return r2 && s2 && r2 >= 3840 && s2 >= 2160 ? (i.info(ie, `4K UHD content detected (${r2}x${s2}), assuming HDR with BT.2020/PQ`), { colorPrimaries: "bt2020", colorTransfer: "smpte2084", colorSpace: "bt2020-ncl" }) : null;
    const a2 = e2.toLowerCase();
    return "hevc" === a2 || "h265" === a2 || "hvc1" === a2 || "hev1" === a2 ? this.getHevcColorSpaceInfo(t2, r2, s2) : "vp9" === a2 || "vp09" === a2 ? this.getVp9ColorSpaceInfo(t2) : null;
  }
  static getHevcCodecString(e2, t2, r2) {
    if (e2.length < 23) return i.warn(ie, `HEVC extradata too small: ${e2.length} (needed 23)`), null;
    if (i.debug(ie, `HEVC Extradata: ${Array.from(e2.slice(0, 24)).map((e3) => e3.toString(16).padStart(2, "0")).join(" ")}`), 0 === e2[0] && 0 === e2[1] && 1 === e2[2] || 0 === e2[0] && 0 === e2[1] && 0 === e2[2] && 1 === e2[3]) return t2 && r2 && t2 >= 3840 && r2 >= 2160 ? (i.info(ie, "HEVC Annex B detected for 4K content. Using heuristic HDR codec string."), "hvc1.2.4.L153.B0") : (i.warn(ie, "HEVC extradata appears to be Annex B (NAL units), not hvcC. Skipping parser."), null);
    const s2 = new BitReader(e2);
    s2.skipBits(8);
    const a2 = s2.readBits(2), n2 = s2.readBits(1), o2 = s2.readBits(5), h2 = s2.readBits(32), d2 = [];
    for (let e3 = 0; e3 < 6; e3++) d2.push(s2.readBits(8));
    const c2 = s2.readBits(8);
    let u2 = "";
    switch (a2) {
      case 1:
        u2 = "A";
        break;
      case 2:
        u2 = "B";
        break;
      case 3:
        u2 = "C";
    }
    let l2 = 0, f2 = h2;
    for (let e3 = 0; e3 < 32; e3++) l2 = 2 * l2 + (1 & f2), f2 = Math.floor(f2 / 2);
    let m2 = `hvc1.${u2}${o2}.${(l2 >>> 0).toString(16)}.${0 === n2 ? "L" : "H"}${c2}`, g2 = false;
    for (let e3 = 5; e3 >= 0; e3--) {
      const t3 = d2[e3];
      (0 !== t3 || g2) && (m2 += "." + t3.toString(16), g2 = true);
    }
    return i.debug(ie, `HEVC codec string: ${m2}`), m2;
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
    if (e2.length < 12) return i.warn(ie, "VP9 extradata too small"), null;
    const t2 = new BitReader(e2);
    t2.skipBits(8), t2.skipBits(24);
    const r2 = t2.readBits(8), s2 = t2.readBits(8), a2 = t2.readBits(4), n2 = t2.readBits(3), o2 = t2.readBits(1), h2 = t2.readBits(8), d2 = t2.readBits(8), c2 = t2.readBits(8), u2 = (e3) => e3.toString().padStart(2, "0");
    return `vp09.${u2(r2)}.${u2(s2)}.${u2(a2)}.${u2(n2)}.${u2(h2)}.${u2(d2)}.${u2(c2)}.${u2(o2)}`;
  }
  static getVvcCodecString(e2) {
    if (e2.length < 10) return i.warn(ie, `VVC extradata too small: ${e2.length}`), null;
    const t2 = new BitReader(e2);
    t2.skipBits(8), t2.skipBits(16);
    const r2 = t2.readBits(1);
    return t2.skipBits(7), r2 ? (t2.skipBits(9), t2.skipBits(3), t2.skipBits(2), t2.skipBits(2), t2.skipBits(3), t2.skipBits(5), t2.skipBits(2), t2.skipBits(6), `vvc1.${t2.readBits(7)}.${t2.readBits(1) ? "H" : "L"}${t2.readBits(8)}`) : "vvc1.1.L51";
  }
  static getColorPrimariesName(e2) {
    return { 1: "bt709", 5: "bt470m", 6: "bt470bg", 7: "smpte170m", 8: "smpte240m", 9: "film", 10: "bt2020", 11: "smpte428", 12: "smpte431", 22: "p3" }[e2] || `unknown(${e2})`;
  }
  static getTransferCharacteristicsName(e2) {
    return { 1: "bt709", 4: "gamma22", 5: "gamma28", 6: "smpte170m", 7: "smpte240m", 8: "linear", 10: "log100", 11: "log316", 13: "iec61966-2-4", 14: "bt1361", 15: "iec61966-2-1", 16: "bt2020-10", 17: "bt2020-12", 18: "pq", 19: "smpte428", 20: "hlg" }[e2] || `unknown(${e2})`;
  }
  static getHevcColorSpaceInfo(e2, t2, r2) {
    const s2 = e2.length > 3 && 0 === e2[0] && 0 === e2[1] && 1 === e2[2] || e2.length > 4 && 0 === e2[0] && 0 === e2[1] && 0 === e2[2] && 1 === e2[3];
    if (t2 && r2 && t2 >= 3840 && r2 >= 2160 && s2) return i.info(ie, "4K HEVC (Annex B) detected, assuming HDR with BT.2020/PQ"), { colorPrimaries: "bt2020", colorTransfer: "smpte2084", colorSpace: "bt2020-ncl" };
    if (e2.length < 23) return t2 && r2 && t2 >= 3840 && r2 >= 2160 ? (i.info(ie, "4K HEVC detected, assuming HDR with BT.2020/PQ"), { colorPrimaries: "bt2020", colorTransfer: "smpte2084", colorSpace: "bt2020-ncl" }) : null;
    if (t2 && r2 && t2 >= 3840 && r2 >= 2160) {
      const t3 = new BitReader(e2);
      t3.skipBits(8), t3.skipBits(2), t3.skipBits(1);
      const r3 = t3.readBits(5);
      if (2 === r3 || 4 === r3) return i.info(ie, "HEVC Main10/Rext profile detected for 4K, assuming HDR10 (BT.2020/PQ)"), { colorPrimaries: "bt2020", colorTransfer: "smpte2084", colorSpace: "bt2020-ncl" };
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
const re = "Demuxer";
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
    if (i.info(re, "Opening media..."), this.useNewWasmInstance ? (i.debug(re, "Using isolated WASM instance"), this.module = await X({ wasmBinary: this.wasmBinary, assetBaseUrl: this.assetBaseUrl })) : this.module = await G({ wasmBinary: this.wasmBinary, assetBaseUrl: this.assetBaseUrl }), this.bindings = new WasmBindings(this.module), !this.bindings.create()) throw new Error("Failed to create demuxer context");
    const e2 = new SourceDataAdapter(this.source);
    this.bindings.setDataSource(e2);
    const t2 = await this.bindings.open();
    i.info(re, `Opened with ${t2} streams`), this.isOpened = true, this.duration = this.bindings.getDuration();
    const r2 = this.bindings.getStartTime();
    this.tracks = this.enumerateTracks(), i.info(re, `Media info: duration=${this.duration}s, start=${r2}s, tracks=${this.tracks.length}`);
    const s2 = this.bindings.getMetadataTitle(), a2 = {};
    s2 && (a2.title = s2);
    const n2 = this.bindings.getChapters();
    return n2.length > 0 && i.info(re, `Found ${n2.length} chapters`), { formatName: this.bindings.getFormatName(), duration: this.duration, bitRate: 0, startTime: r2, tracks: this.tracks, chapters: n2, metadata: a2 };
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
    let t2 = null, r2 = null;
    switch (this.bindings && e2.extradataSize > 0 && (r2 = this.bindings.getExtradata(e2.index)), e2.type) {
      case 0:
        t2 = { id: e2.index, type: "video", codec: e2.codecName, width: e2.width, height: e2.height, frameRate: e2.frameRate, bitRate: e2.bitRate, profile: e2.profile, level: e2.level, language: e2.language ? e2.language : void 0, label: e2.label ? e2.label : void 0, rotation: e2.rotation, pixelFormat: e2.pixelFormat, colorRange: e2.colorRange, projection: e2.projection || void 0, isAttachedPic: e2.isAttachedPic || void 0 }, r2 && (t2.extradata = r2);
        const s2 = t2;
        e2.colorPrimaries && "unknown" !== e2.colorPrimaries && "reserved" !== e2.colorPrimaries && (s2.colorPrimaries = this.normalizeColorPrimaries(e2.colorPrimaries)), e2.colorTransfer && "unknown" !== e2.colorTransfer && "reserved" !== e2.colorTransfer && (s2.colorTransfer = this.normalizeColorTransfer(e2.colorTransfer)), e2.colorMatrix && "unknown" !== e2.colorMatrix && "reserved" !== e2.colorMatrix && (s2.colorSpace = this.normalizeColorMatrix(e2.colorMatrix));
        const a2 = (s2.colorPrimaries || "").toLowerCase(), n2 = (s2.colorTransfer || "").toLowerCase(), o2 = n2.includes("pq") || n2.includes("hlg") || n2.includes("smpte2084") || n2.includes("arib-std-b67"), h2 = a2.includes("bt2020") || a2.includes("rec2020");
        s2.isHDR = o2 || h2;
        const d2 = s2.width >= 3840 && s2.height >= 2160, c2 = s2.colorPrimaries || "", u2 = s2.colorTransfer || "";
        if (!s2.colorPrimaries || !s2.colorTransfer || d2 && ("bt709" === c2 || "bt709" === u2)) {
          const t3 = CodecParser.getColorSpaceInfo(e2.codecName, r2 ?? void 0, e2.width, e2.height);
          t3 && (t3.colorPrimaries && (s2.colorPrimaries = t3.colorPrimaries), t3.colorTransfer && (s2.colorTransfer = t3.colorTransfer), t3.colorSpace && (s2.colorSpace = t3.colorSpace), i.info(re, `Overriding/Filling Color Metadata via Heuristic: ${s2.colorPrimaries}/${s2.colorTransfer}`));
        }
        s2.colorPrimaries && s2.colorTransfer || !s2.codec.toLowerCase().startsWith("hvc1") || 2 & e2.profile && (s2.colorPrimaries = "bt2020", s2.colorTransfer = "smpte2084", s2.colorSpace = "bt2020-ncl", i.info(re, "Fallback: Assuming HDR10 for HEVC Main 10 profile without metadata")), i.info(re, `Video Track Metadata: codec=${s2.codec}, primaries=${s2.colorPrimaries}, transfer=${s2.colorTransfer}, matrix=${s2.colorSpace}`);
        break;
      case 1:
        t2 = { id: e2.index, type: "audio", codec: e2.codecName, channels: e2.channels, sampleRate: e2.sampleRate, bitRate: e2.bitRate, language: e2.language ? e2.language : void 0, label: e2.label ? e2.label : void 0 };
        break;
      case 2:
        t2 = { id: e2.index, type: "subtitle", codec: e2.codecName, subtitleType: this.isImageSubtitle(e2.codecName) ? "image" : "text", language: e2.language ? e2.language : void 0, label: e2.label ? e2.label : void 0 };
    }
    return t2 && "video" !== t2.type && r2 && (t2.extradata = r2), t2;
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
  getAttachments(e2, t2, i2) {
    return this.bindings?.getAttachments(e2, t2, i2) ?? [];
  }
  close() {
    this.bindings && (this.bindings.destroy(), this.bindings = null), this.isOpened = false, this.tracks = [], i.info(re, "Demuxer closed");
  }
  static async extractAttachedPicture(e2, t2, wasmBinary, r2) {
    if (t2 <= 0) return null;
    let s2 = null;
    try {
      const i2 = await X({ wasmBinary, assetBaseUrl: r2 });
      if (s2 = new ThumbnailBindings(i2), s2.setDataSource({ read: async (t3, i3) => new Uint8Array(await e2.read(t3, i3)), getSize: async () => t2 }), !await s2.create(t2)) return null;
      if (!await s2.open()) return null;
      const a2 = await s2.readKeyframe(0);
      return a2 <= 0 ? null : s2.getPacketDataCopy(a2);
    } catch (e3) {
      return i.warn(re, "Attached-picture extraction failed", e3), null;
    } finally {
      s2?.destroy();
    }
  }
  getBindings() {
    return this.bindings;
  }
  getModule() {
    return this.module;
  }
}
const se = "TrackManager";
class TrackManager extends EventEmitter {
  tracks = [];
  activeVideoTrack = null;
  activeAudioTrack = null;
  activeSubtitleTrack = null;
  setTracks(e2) {
    this.tracks = [...e2];
    const t2 = this.getVideoTracks(), r2 = this.getAudioTracks();
    if (t2.length > 0) {
      const e3 = this.activeVideoTrack ? t2.find((e4) => e4.id === this.activeVideoTrack.id) : void 0;
      this.activeVideoTrack = e3 || t2[0];
    }
    r2.length > 0 && !this.activeAudioTrack && (this.activeAudioTrack = r2[0]), this.emit("tracksChange", this.tracks), i.info(se, `Tracks set: ${e2.length} total`);
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
    return t2 ? (this.activeVideoTrack?.id === e2 || (this.activeVideoTrack = t2, this.emit("videoTrackChange", t2), i.info(se, `Selected video track: ${e2}`)), true) : (i.warn(se, `Video track ${e2} not found`), false);
  }
  selectAudioTrack(e2) {
    const t2 = this.getAudioTracks().find((t3) => t3.id === e2);
    return t2 ? (this.activeAudioTrack?.id === e2 || (this.activeAudioTrack = t2, this.emit("audioTrackChange", t2), i.info(se, `Selected audio track: ${e2}`)), true) : (i.warn(se, `Audio track ${e2} not found`), false);
  }
  selectSubtitleTrack(e2) {
    if (null === e2) return this.activeSubtitleTrack = null, this.emit("subtitleTrackChange", null), i.info(se, "Subtitles disabled"), true;
    const t2 = this.getSubtitleTracks().find((t3) => t3.id === e2);
    return t2 ? (this.activeSubtitleTrack?.id === e2 || (this.activeSubtitleTrack = t2, this.emit("subtitleTrackChange", t2), i.info(se, `Selected subtitle track: ${e2}`)), true) : (i.warn(se, `Subtitle track ${e2} not found`), false);
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
const ae = 1e6, ne = { secondsToUs: (e2) => Math.floor(e2 * ae), usToSeconds: (e2) => e2 / ae, secondsToMs: (e2) => Math.floor(1e3 * e2), msToSeconds: (e2) => e2 / 1e3, formatTime(e2) {
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
}, now: () => performance.now() / 1e3 }, oe = "Clock";
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
    this.audioProvider = e2, e2 ? i.debug(oe, "Audio provider set") : (i.debug(oe, "Audio provider disabled - using wall clock only"), this.syncedToAudio = false);
  }
  setDuration(e2) {
    this.duration = e2, i.debug(oe, `Duration set to ${e2}s`);
  }
  start() {
    this.isRunning || (this.baseTime = ne.now() - this.pausedTime / this.playbackRate, this.isRunning = true, this.syncedToAudio = false, i.debug(oe, `Started at ${this.pausedTime}s`));
  }
  pause() {
    this.isRunning && (this.pausedTime = this.getTime(), this.isRunning = false, i.debug(oe, `Paused at ${this.pausedTime}s`));
  }
  seek(e2) {
    this.isRunning ? this.baseTime = ne.now() - e2 / this.playbackRate : this.pausedTime = e2, this.syncedToAudio = false, i.debug(oe, `Seeked to ${e2}s`);
  }
  getTime() {
    if (!this.isRunning) return this.pausedTime;
    let e2 = (ne.now() - this.baseTime) * this.playbackRate;
    if (this.duration > 0 && (e2 = Math.min(e2, this.duration)), this.audioProvider) {
      const t2 = this.audioProvider.getAudioClock();
      if (t2 >= 0) {
        if (this.lastAudioTime = t2, this.audioProvider.hasHealthyBuffer()) {
          if (!this.syncedToAudio) return this.baseTime = ne.now() - t2 / this.playbackRate, this.syncedToAudio = true, i.debug(oe, `Synced to audio at ${t2}s`), t2;
          const r2 = e2 - t2;
          if (Math.abs(r2) > 0.1) {
            const e3 = 0.5 * r2;
            this.baseTime += e3 / this.playbackRate;
          }
          e2 = (ne.now() - this.baseTime) * this.playbackRate, this.duration > 0 && (e2 = Math.min(e2, this.duration));
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
    let e2 = (ne.now() - this.baseTime) * this.playbackRate;
    return this.duration > 0 && (e2 = Math.min(e2, this.duration)), e2;
  }
  setPlaybackRate(e2) {
    const t2 = this.getTime();
    this.playbackRate = e2, this.seek(t2), i.debug(oe, `Playback rate set to ${e2}`);
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
    this.baseTime = 0, this.pausedTime = 0, this.isRunning = false, this.playbackRate = 1, this.syncedToAudio = false, this.lastAudioTime = 0, this.duration = 0, i.debug(oe, "Reset");
  }
}
const he = "PlayerState", de = { idle: ["loading"], loading: ["ready", "error"], ready: ["playing", "paused", "seeking", "error"], playing: ["paused", "seeking", "buffering", "ended", "error"], paused: ["playing", "seeking", "error"], seeking: ["ready", "playing", "paused", "buffering", "error", "seeking"], buffering: ["playing", "paused", "ended", "error", "seeking"], ended: ["seeking", "idle"], error: ["idle"] };
class PlayerStateManager extends EventEmitter {
  state = "idle";
  getState() {
    return this.state;
  }
  setState(e2) {
    return e2 === this.state || (de[this.state].includes(e2) ? (i.debug(he, `State: ${this.state} -> ${e2}`), this.state = e2, this.emit("change", e2), true) : (i.warn(he, `Invalid transition: ${this.state} -> ${e2}`), false));
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
    this.state = "idle", i.debug(he, "Reset to idle");
  }
}
const ce = "SoftwareVideoDecoder";
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
    const r2 = this.bindings.enableDecoder(this.trackIndex);
    return r2 < 0 ? (i.error(ce, `Failed to enable software decoder for stream ${this.trackIndex}: ${r2}`), false) : (this.isConfigured = true, this.targetFps > 0 && this.targetFps < 10 ? (this.bindings.setSkipFrame(this.trackIndex, 1), i.info(ce, "Enabled AVDISCARD_NONREF skipping for low FPS playback")) : this.bindings.setSkipFrame(this.trackIndex, 0), i.info(ce, `Configured software decoder for stream ${this.trackIndex} (TargetFPS: ${t2})`), true);
  }
  setNonRefSkip(e2) {
    !this.isConfigured || this.trackIndex < 0 || (this.bindings.setSkipFrame(this.trackIndex, e2 ? 1 : 0), i.info(ce, `Non-reference frame skipping ${e2 ? "enabled" : "disabled"} for stream ${this.trackIndex}`));
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
        i.error(ce, "Queue processing error", e2);
      } finally {
        this.isProcessingQueue = false;
      }
    }
  }
  decodeInternal(e2) {
    if (!this.isConfigured) return;
    const t2 = this.bindings.sendPacket(this.trackIndex, e2.data, e2.pts, e2.dts, e2.keyframe);
    if (t2 < 0) i.warn(ce, `sendPacket failed: ${t2}`);
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
    let t2 = this.bindings.getFrameWidth(), r2 = this.bindings.getFrameHeight();
    if (t2 > 1920) {
      const e3 = 1920 / t2;
      t2 = 1920, r2 = Math.floor(r2 * e3);
    }
    try {
      const s2 = this.bindings.getFrameRGBA(t2, r2);
      if (!s2) return void i.error(ce, "Failed to get RGBA frame data");
      const a2 = new VideoFrame(s2, { format: "RGBA", codedWidth: t2, codedHeight: r2, timestamp: e2 });
      this.onFrame(a2), this.lastProcessedTimestamp = e2;
    } catch (e3) {
      i.error(ce, "Frame creation failed", e3), this.onError && this.onError(e3);
    }
  }
  get configured() {
    return this.isConfigured;
  }
  get queueSize() {
    return this.packetQueue.length;
  }
}
const ue = "VideoDecoder";
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
    this.forceSoftware = e2, i.debug(ue, `Created (forceSoftware: ${e2})`);
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
  async configure(e2, t2, r2 = 0) {
    if (this.currentTrack = e2, this.targetFps = r2, this.currentProfile = e2.profile, this.useSoftware = false, this.requiresSoftware = false, this.isAnnexBSource = false, this.openGopErrorCount = 0, this.hardwareRetryCount = 0, this.lastHardwareRetryTime = 0, this.swDecoder && (this.swDecoder.close(), this.swDecoder = null), this.forceSoftware) return i.info(ue, "Force software decoding enabled, using WASM decoder"), this.useSoftware = true, this.initSoftwareDecoder();
    if (!("VideoDecoder" in window)) return i.warn(ue, "WebCodecs VideoDecoder not supported — falling back to software decoder"), this.useSoftware = true, this.initSoftwareDecoder();
    let s2 = CodecParser.getCodecString(e2.codec, e2.extradata);
    if (s2 || (i.debug(ue, "CodecParser returned null, falling back to manual mapping"), s2 = this.mapCodecToWebCodecs(e2.codec, e2.width, e2.height, e2.profile, e2.level)), !s2) return i.error(ue, `Unsupported codec: ${e2.codec}`), false;
    const a2 = { codec: s2, codedWidth: e2.width, codedHeight: e2.height, hardwareAcceleration: "prefer-hardware" };
    (e2.colorPrimaries || e2.colorTransfer || e2.colorSpace) && (a2.colorSpace = { primaries: e2.colorPrimaries, transfer: e2.colorTransfer, matrix: e2.colorSpace }, i.info(ue, `Decoder color space: primaries=${e2.colorPrimaries}, transfer=${e2.colorTransfer}, matrix=${e2.colorSpace}`));
    let n2 = t2 || e2.extradata;
    n2 && n2.length > 4 && (0 === n2[0] && 0 === n2[1] && 1 === n2[2] || 0 === n2[0] && 0 === n2[1] && 0 === n2[2] && 1 === n2[3]) && (i.warn(ue, "Extradata is Annex B — stripping description (decoder will use inline parameter sets from keyframes)."), n2 = void 0), n2 && n2.length > 0 && (a2.description = n2);
    try {
      let t3;
      try {
        t3 = await VideoDecoder.isConfigSupported(a2);
      } catch (e3) {
        t3 = { supported: false, config: a2 };
      }
      if (!t3.supported && "prefer-hardware" === a2.hardwareAcceleration) {
        const e3 = { ...a2 };
        delete e3.hardwareAcceleration;
        const r3 = await VideoDecoder.isConfigSupported(e3).catch(() => ({ supported: false, config: e3 }));
        r3.supported && (i.info(ue, `Hardware decode unavailable for ${a2.codec}; using no-preference.`), delete a2.hardwareAcceleration, t3 = r3);
      }
      if (!t3.supported && a2.colorSpace) {
        i.info(ue, "Codec config failed with color space. Retrying without explicit color metadata.");
        const e3 = { ...a2 };
        delete e3.colorSpace;
        const r3 = await VideoDecoder.isConfigSupported(e3);
        r3.supported && (i.info(ue, "Codec supported WITHOUT explicit color metadata. Using stripped config."), delete a2.colorSpace, t3 = r3);
      }
      if (!t3.supported) {
        if (i.warn(ue, `Codec config not supported: ${a2.codec}`), s2 && s2.startsWith("hvc1.4")) {
          const r4 = e2.level ? `L${e2.level}` : "L120", n3 = [`hvc1.4.10.${r4}.B0`, "hvc1.4.10.L93.B0", `hvc1.2.4.${r4}.B0`];
          for (const e3 of n3) {
            if (e3 === s2) continue;
            i.info(ue, `HEVC Rext: trying fallback ${e3}`);
            const r5 = { ...a2, codec: e3 };
            if (r5.colorSpace && delete r5.colorSpace, e3.startsWith("hvc1.2") && r5.description) {
              const e4 = r5.description instanceof Uint8Array ? r5.description : new Uint8Array(r5.description);
              if (e4.length > 5 && 4 == (31 & e4[1])) {
                const t4 = new Uint8Array(e4);
                t4[1] = 224 & t4[1] | 2, r5.description = t4, i.info(ue, "Patched extradata: Profile IDC 4 → 2 (Main10)");
              }
            }
            const n4 = await VideoDecoder.isConfigSupported(r5);
            if (n4.supported) {
              i.info(ue, `HEVC Rext fallback ${e3} IS supported. Switching.`), a2.codec = e3, a2.description = r5.description, a2.colorSpace && delete a2.colorSpace, s2 = e3, t3 = n4;
              break;
            }
          }
        }
        const r3 = this.mapCodecToWebCodecs(e2.codec, e2.width, e2.height, e2.profile, e2.level);
        if (r3 && r3 !== s2) {
          i.info(ue, `Retrying with manual codec string: ${r3}`);
          const e3 = { ...a2, codec: r3 };
          e3.colorSpace && delete e3.colorSpace;
          const n3 = await VideoDecoder.isConfigSupported(e3);
          n3.supported && (i.info(ue, `Manual codec string IS supported. Using ${r3} instead of ${s2}`), a2.codec = r3, a2.colorSpace && delete a2.colorSpace, s2 = r3, t3 = n3);
        }
        if (!t3.supported) return i.warn(ue, `Codec not supported by hardware: ${s2}. Trying software.`), this.initSoftwareDecoder();
      }
    } catch (e3) {
      if (i.warn(ue, `Codec config check failed: ${s2}`, e3), !a2.colorSpace) return this.initSoftwareDecoder();
      try {
        if (i.info(ue, "Retrying config check without color space after error"), delete a2.colorSpace, !(await VideoDecoder.isConfigSupported(a2)).supported) return this.initSoftwareDecoder();
        i.info(ue, "Codec check passed after removing color space. Proceeding.");
      } catch (e4) {
        return this.initSoftwareDecoder();
      }
    }
    this.decoder = new VideoDecoder({ output: (e3) => {
      this.openGopErrorCount = 0, this.errorCount = 0, this.isResurrecting = false, this.justFlushed = false, this.postFlushKeyframeRejects = 0, this.onFrame ? this.onFrame(e3) : this.pendingFrames.push(e3);
    }, error: (e3) => {
      i.error(ue, "Decoder error", e3), this.recoverFromError(e3);
    } }), this.lastConfig = a2;
    try {
      return this.decoder.configure(a2), this.isConfigured = true, i.info(ue, `Configured: ${s2} ${e2.width}x${e2.height} hwAccel=${a2.hardwareAcceleration ?? "no-preference"}`), true;
    } catch (e3) {
      return i.error(ue, "Failed to configure decoder", e3), this.initSoftwareDecoder();
    }
  }
  async initSoftwareDecoder() {
    if (!this.currentTrack) return false;
    if (!this.bindings) return i.error(ue, "Cannot switch to software decoder: bindings not available"), false;
    if (i.info(ue, "Initializing software decoder fallback"), this.useSoftware = true, this.decoder) {
      try {
        this.decoder.close();
      } catch (e3) {
      }
      this.decoder = null;
    }
    this.swDecoder = new SoftwareVideoDecoder(this.bindings), this.swDecoder.setOnFrame((e3) => {
      this.onFrame ? this.onFrame(e3) : this.pendingFrames.push(e3);
    }), this.swDecoder.setOnError((e3) => {
      i.error(ue, "Software decoder error", e3), this.onError && this.onError(e3);
    });
    const e2 = this.targetFps > 0 ? this.targetFps : this.currentTrack.frameRate > 60 ? 60 : 0, t2 = await this.swDecoder.configure(this.currentTrack, e2);
    if (e2 > 0 && this.currentTrack.frameRate > e2 && i.info(ue, `Software decoder FPS capped: ${this.currentTrack.frameRate}fps → ${e2}fps`), t2) {
      if (this.isConfigured = true, this.setWaitingForKeyframe(true), this.pendingChunks.length > 0) {
        i.info(ue, `Processing ${this.pendingChunks.length} pending chunks for software decoder`);
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
    this.lastRecreateTime = performance.now(), i.warn(ue, "Recreating decoder to recover from error");
    try {
      this.decoder?.close();
    } catch (e2) {
    }
    this.decoder = new VideoDecoder({ output: (e2) => {
      this.openGopErrorCount = 0, this.errorCount = 0, this.isResurrecting = false, this.justFlushed = false, this.postFlushKeyframeRejects = 0, this.onFrame ? this.onFrame(e2) : this.pendingFrames.push(e2);
    }, error: (e2) => {
      i.error(ue, "Decoder error", e2), this.recoverFromError(e2);
    } });
    try {
      return this.decoder.configure(this.lastConfig), this.isConfigured = true, this.justFlushed = true, this.setWaitingForKeyframe(true), true;
    } catch (e2) {
      return i.error(ue, "Failed to recreate decoder", e2), false;
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
  decode(e2, t2, r2, s2, a2 = true, n2 = false, o2 = false) {
    const h2 = r2 && !a2;
    if (this.lastChunkInfo = { timestamp: t2, keyframe: r2, size: e2.byteLength, wasIdrWhileWaiting: r2 && !h2 && this.waitingForKeyframe }, !this.isConfigured) return;
    if (this.chunksSinceKeyframeWait++, 1 !== this.playbackRate && !r2 && e2.byteLength < MoviVideoDecoder.MIN_DELTA_PACKET_BYTES && this.chunksSinceKeyframeWait <= MoviVideoDecoder.TINY_PACKET_DROP_WINDOW) return void i.debug(ue, `Dropping ${e2.byteLength}-byte non-keyframe packet at ${t2.toFixed(3)}s (corrupt/too small, startup window at ${this.playbackRate}x)`);
    if (this.useSoftware && this.swDecoder && (r2 && !this.forceSoftware && !this.requiresSoftware && this.shouldRetryHardware(e2) && (i.info(ue, `Found a sync frame! Attempting hardware resurrection (Attempt ${this.hardwareRetryCount + 1})...`), this.lastHardwareRetryTime = performance.now(), this.hardwareRetryCount++, this.useSoftware = false, this.openGopErrorCount = 0, this.isResurrecting = true, this.recreateDecoder() || (this.useSoftware = true, this.isResurrecting = false)), this.useSoftware)) {
      if (!this.swDecoder.configured) return void this.pendingChunks.push({ data: e2, timestamp: t2, keyframe: r2 });
      if (this.waitingForKeyframe && !r2) return;
      return r2 && this.setWaitingForKeyframe(false), void this.swDecoder.decode(e2, t2, s2 ?? t2, r2);
    }
    if (!this.decoder) return;
    if ("closed" === this.decoder.state) return void (this.isRecovering || this.recoverFromError(new Error("Decoder closed unexpectedly")));
    if (this.waitingForKeyframe && !r2) return void this.skippedWhileWaiting++;
    if (r2 && this.waitingForKeyframe && this.skippedWhileWaiting > 0 && (i.debug(ue, `Skipped ${this.skippedWhileWaiting} non-keyframes while waiting for keyframe`), this.skippedWhileWaiting = 0), this.skipRaslAfterResume && !r2) {
      if (n2) return;
      this.skipRaslAfterResume = false;
    }
    if (this._perfSkipNonRef && o2 && !r2) return;
    let d2 = e2;
    if (r2 && !h2 && this.waitingForKeyframe) {
      const t3 = MoviVideoDecoder.stripAudLengthPrefixed(e2);
      t3 !== e2 && (d2 = t3);
    }
    if (this.isAnnexBSource && this._loggedConversion < 2 && (r2 && 0 === this._loggedConversion || !r2 && 1 === this._loggedConversion)) {
      this._loggedConversion++;
      const t3 = MoviVideoDecoder.splitAnnexBNalUnits(e2).map((e3) => e3[0] >> 1 & 63), s3 = t3.filter((e3) => e3 < 62), a3 = Array.from(e2.subarray(0, 8)).map((e3) => e3.toString(16).padStart(2, "0")).join(" ");
      i.info(ue, `Annex B ${r2 ? "KEY" : "DELTA"}: ${e2.length}B → ${d2.length}B, NALs: [${t3}], kept: [${s3}], head: ${a3}`);
    }
    if (r2 && (this.skipRaslAfterResume = this.waitingForKeyframe, this.setWaitingForKeyframe(false)), this.errorCount >= MoviVideoDecoder.MAX_ERRORS) return;
    const c2 = h2 && !this.justFlushed, u2 = new EncodedVideoChunk({ type: c2 ? "delta" : r2 ? "key" : "delta", timestamp: 1e6 * t2, data: d2 });
    try {
      this.decoder.decode(u2);
    } catch (s3) {
      this.recoverFromError(s3), this.useSoftware && (i.warn(ue, "Hardware decode failed, queuing chunk for software decoder"), this.pendingChunks.push({ data: e2, timestamp: t2, keyframe: r2 }));
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
    const t2 = e2.message && (e2.message.includes("wasn't a key frame") || e2.message.includes("key frame is required")), r2 = performance.now();
    t2 || (r2 - this.lastErrorTime > 3e4 ? this.errorCount = 1 : this.errorCount++, this.lastErrorTime = r2);
    const s2 = { message: e2.message, name: e2.name, lastChunk: this.lastChunkInfo, queueSize: this.decoder?.decodeQueueSize, state: this.decoder?.state, codec: this.lastConfig?.codec, errorCount: this.errorCount, isUnsupportedProfile: false };
    if (t2) {
      if (this.isResurrecting) return i.warn(ue, "Hardware resurrection failed on sync frame. Returning to software decoder."), this.isResurrecting = false, void this.initSoftwareDecoder();
      this.openGopErrorCount++, i.warn(ue, `Decoding warning: Frame was marked as keyframe but decoder rejected it (Open GOP?). Timestamp: ${this.lastChunkInfo?.timestamp}. Count (OpenGOP): ${this.openGopErrorCount}`);
      const e3 = this.lastConfig?.codec ?? "", t3 = e3.startsWith("hvc1.") || e3.startsWith("hev1."), r3 = true === this.lastChunkInfo?.wasIdrWhileWaiting;
      if (!MoviVideoDecoder.DISABLE_OPENGOP_SW_FALLBACK && (this.justFlushed || r3) && t3 && !this.forceSoftware && !this.useSoftware && (this.postFlushKeyframeRejects++, this.postFlushKeyframeRejects >= MoviVideoDecoder.POST_FLUSH_REJECT_LIMIT)) return i.error(ue, `Hardware rejected ${this.postFlushKeyframeRejects} ${r3 ? "genuine IDR" : "post-flush"} keyframes — falling back to software decoder for this stream.`), void this.initSoftwareDecoder();
      const s3 = this.lastConfig?.codec ?? "", a2 = !s3.startsWith("hvc1.") && !s3.startsWith("hev1.") || this.justFlushed ? 15 : MoviVideoDecoder.MID_STREAM_OPENGOP_REJECT_LIMIT;
      if (!MoviVideoDecoder.DISABLE_OPENGOP_SW_FALLBACK && this.openGopErrorCount > a2) return i.error(ue, `Persistent Open GOP errors detected (${this.openGopErrorCount} > ${a2}). Switching to software decoder.`), void this.initSoftwareDecoder();
      if (this.decoder && "closed" !== this.decoder.state) try {
        return this.decoder.reset(), this.decoder.configure(this.lastConfig), void this.setWaitingForKeyframe(true);
      } catch (e4) {
        i.warn(ue, "Fast reset failed during Open GOP recovery, proceeding to full recreation");
      }
    } else i.error(ue, `Decoding error details: ${JSON.stringify(s2)}. Count: ${this.errorCount}`);
    if (this.errorCount >= MoviVideoDecoder.MAX_ERRORS) return i.error(ue, `Max errors (${MoviVideoDecoder.MAX_ERRORS}) exceeded within short duration. Emitting fatal error.`), void (this.onError && this.onError(e2));
    if (4 === this.currentProfile && this.lastConfig?.codec.startsWith("hvc1.")) {
      i.warn(ue, "HEVC Rext profile error.");
      const e3 = `hvc1.4.10.${this.currentTrack?.level ? `L${this.currentTrack.level}` : "L120"}.B0`;
      if (this.lastConfig.codec !== e3) {
        i.info(ue, `Attempting recovery by switching to Rext fallback: ${e3}`), this.lastConfig.codec = e3, this.openGopErrorCount = 0;
        try {
          if (this.decoder && "closed" !== this.decoder.state) return this.decoder.configure(this.lastConfig), this.setWaitingForKeyframe(true), void (this.errorCount = 0);
          if (this.recreateDecoder()) return void (this.errorCount = 0);
        } catch (e4) {
          i.error(ue, "Fallback configuration failed", e4);
        }
      } else i.warn(ue, "HEVC Rext fallback string also failed. Attempting reset/recreation.");
    }
    if (this.decoder && "closed" !== this.decoder.state) try {
      return i.warn(ue, "Attempting fast reset recovery"), this.decoder.reset(), this.decoder.configure(this.lastConfig), void this.setWaitingForKeyframe(true);
    } catch (e3) {
      i.warn(ue, "Fast reset failed, trying full recreation");
    }
    this.recreateDecoder();
  }
  mapCodecToWebCodecs(e2, t2, r2, s2, a2) {
    const n2 = e2.toLowerCase();
    if ("h264" === n2 || "avc1" === n2) return "avc1.640028";
    if ("hevc" === n2 || "h265" === n2 || "hvc1" === n2) {
      if (4 === s2) {
        const e3 = a2 ? `L${a2}` : "L120";
        return i.info(ue, `Detected HEVC Rext profile. Using hvc1.4.10.${e3}.B0`), `hvc1.4.10.${e3}.B0`;
      }
      if (2 === s2) {
        const e3 = a2 ? `L${a2}` : "L153";
        return i.info(ue, `Mapping HEVC Main 10 profile (2) to hvc1.2.4.${e3}.B0`), `hvc1.2.4.${e3}.B0`;
      }
      return 1 === s2 ? `hvc1.1.6.${a2 ? `L${a2}` : "L120"}.B0` : "hvc1.1.6.L93.B0";
    }
    if ("vp8" === n2) return "vp8";
    if ("vp9" === n2) {
      const e3 = (t2 && t2 > 1920 ? 51 : t2 && t2 > 1280 ? 41 : 31).toString().padStart(2, "0");
      return 1 === s2 ? (i.info(ue, `Mapping VP9 Profile 1 to vp09.01.${e3}.08.02 (4:2:2 8-bit)`), `vp09.01.${e3}.08.02.01.01.01.00`) : 2 === s2 ? (i.info(ue, `Mapping VP9 Profile 2 to vp09.02.${e3}.10 (HDR)`), `vp09.02.${e3}.10.01.09.16.09.00`) : 3 === s2 ? `vp09.03.${e3}.10.02.09.16.09.00` : `vp09.00.${e3}.08.01.01.01.01.00`;
    }
    return "av1" === n2 ? "av01.0.01M.08" : "vvc" === n2 || "vvc1" === n2 || "vvi1" === n2 ? "vvc1.1.L51" : "h263" === n2 || "h263p" === n2 ? "h263" : "mpeg4" === n2 || "mp4v" === n2 ? "mp4v.20.9" : null;
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
      i.warn(ue, "Flush timeout or error, resetting decoder", e3);
      try {
        this.decoder.reset(), this.lastConfig && this.decoder.configure(this.lastConfig);
      } catch (e4) {
        i.error(ue, "Reset after flush timeout failed", e4);
      }
    }
  }
  reset() {
    if (this.openGopErrorCount = 0, this.swDecoder && this.swDecoder.reset(), this.decoder) try {
      this.decoder.reset();
    } catch (e2) {
      i.error(ue, "Reset error", e2);
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
    this.isConfigured = false, this.onFrame = null, this.onError = null, this.useSoftware = false, i.debug(ue, "Closed");
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
    const r2 = this.splitAnnexBNalUnits(e2);
    if (0 === r2.length) return null;
    const s2 = [], a2 = [], n2 = [];
    for (const e3 of r2) {
      if (e3.length < 2) continue;
      const t3 = e3[0] >> 1 & 63;
      32 === t3 ? s2.push(e3) : 33 === t3 ? a2.push(e3) : 34 === t3 && n2.push(e3);
    }
    if (0 === a2.length) return i.warn(ue, "No SPS found in Annex B extradata"), null;
    const o2 = s2[0] || a2[0], h2 = this.removeEpb(o2), d2 = 32 == (h2[0] >> 1 & 63) ? 6 : 3;
    let c2 = t2?.profile ?? 2, u2 = 0, l2 = new Uint8Array([32, 0, 0, 0]), f2 = new Uint8Array(6), m2 = t2?.level ?? 153;
    if (h2.length >= d2 + 12) {
      const e3 = h2[d2];
      c2 = 31 & e3, u2 = e3 >> 5 & 1, l2 = h2.slice(d2 + 1, d2 + 5), f2 = h2.slice(d2 + 5, d2 + 11), m2 = h2[d2 + 11], i.debug(ue, `hvcC from NAL: profile=${c2}, tier=${u2}, level=${m2}`);
    } else null == t2?.profile && null == t2?.level || i.debug(ue, `hvcC from track metadata: profile=${c2}, level=${m2}`);
    const g2 = [];
    s2.length > 0 && g2.push({ type: 32, nalus: s2 }), a2.length > 0 && g2.push({ type: 33, nalus: a2 }), n2.length > 0 && g2.push({ type: 34, nalus: n2 });
    let p2 = 23;
    for (const e3 of g2) {
      p2 += 3;
      for (const t3 of e3.nalus) p2 += 2 + t3.length;
    }
    const b2 = new Uint8Array(p2), v2 = new DataView(b2.buffer);
    let S2 = 0;
    b2[S2++] = 1, b2[S2++] = u2 << 5 | 31 & c2, b2[S2++] = l2[0], b2[S2++] = l2[1], b2[S2++] = l2[2], b2[S2++] = l2[3];
    for (let e3 = 0; e3 < 6; e3++) b2[S2++] = f2[e3];
    b2[S2++] = m2, v2.setUint16(S2, 61440), S2 += 2, b2[S2++] = 252, b2[S2++] = 253, b2[S2++] = 250, b2[S2++] = 250, v2.setUint16(S2, 0), S2 += 2, b2[S2++] = 15, b2[S2++] = g2.length;
    for (const e3 of g2) {
      b2[S2++] = 128 | 63 & e3.type, v2.setUint16(S2, e3.nalus.length), S2 += 2;
      for (const t3 of e3.nalus) v2.setUint16(S2, t3.length), S2 += 2, b2.set(t3, S2), S2 += t3.length;
    }
    return b2;
  }
  static annexBToAvcC(e2) {
    const t2 = this.splitAnnexBNalUnits(e2);
    if (0 === t2.length) return null;
    const r2 = [], s2 = [];
    for (const e3 of t2) {
      if (e3.length < 1) continue;
      const t3 = 31 & e3[0];
      7 === t3 ? r2.push(e3) : 8 === t3 && s2.push(e3);
    }
    if (0 === r2.length) return i.warn(ue, "No SPS found in Annex B extradata for AVC"), null;
    const a2 = r2[0];
    let n2 = 6;
    n2 += 1;
    for (const e3 of r2) n2 += 2 + e3.length;
    n2 += 1;
    for (const e3 of s2) n2 += 2 + e3.length;
    const o2 = new Uint8Array(n2), h2 = new DataView(o2.buffer);
    let d2 = 0;
    o2[d2++] = 1, o2[d2++] = a2[1], o2[d2++] = a2[2], o2[d2++] = a2[3], o2[d2++] = 255, o2[d2++] = 224 | r2.length;
    for (const e3 of r2) h2.setUint16(d2, e3.length), d2 += 2, o2.set(e3, d2), d2 += e3.length;
    o2[d2++] = s2.length;
    for (const e3 of s2) h2.setUint16(d2, e3.length), d2 += 2, o2.set(e3, d2), d2 += e3.length;
    return o2;
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
const le = "SoftwareAudioDecoder";
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
    return t2 < 0 ? (i.error(le, `Failed to enable software decoder for stream ${this.trackIndex}: ${t2}`), false) : (this.bindings.enableAudioDownmix(this._downmix), this.isConfigured = true, i.info(le, `Configured software decoder for stream ${this.trackIndex}`), true);
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
  decode(e2, t2, r2) {
    if (!this.isConfigured || this.isBroken) return;
    const s2 = this.bindings.sendPacket(this.trackIndex, e2, t2, t2, r2);
    if (s2 < 0) return this.consecutiveFailures++, 1 === this.consecutiveFailures && i.warn(le, `sendPacket failed: ${s2}`), void (this.consecutiveFailures >= SoftwareAudioDecoder.MAX_CONSECUTIVE_FAILURES && (this.isBroken = true, i.error(le, `Audio decoder disabled after ${this.consecutiveFailures} consecutive sendPacket failures (last: ${s2}). Playback continues without audio.`)));
    for (this.consecutiveFailures = 0; 0 === this.bindings.receiveFrame(this.trackIndex); ) this.processDecodedFrame(t2);
  }
  decodeBatch(e2) {
    if (!this.isConfigured || this.isBroken || 0 === e2.length) return 0;
    const t2 = this.bindings.decodeAudioBatch(this.trackIndex, e2);
    if (t2 < 0) return this.consecutiveFailures++, 1 === this.consecutiveFailures && i.warn(le, `decodeAudioBatch failed: ${t2}`), this.consecutiveFailures >= SoftwareAudioDecoder.MAX_CONSECUTIVE_FAILURES && (this.isBroken = true, i.error(le, `Audio decoder disabled after ${this.consecutiveFailures} consecutive batch failures (last: ${t2}). Playback continues without audio.`)), 0;
    this.consecutiveFailures = 0;
    const r2 = this.bindings.audioBatchSamples();
    if (r2 <= 0 || !this.onData) return t2;
    const s2 = this.bindings.audioBatchChannels(), a2 = this.bindings.audioBatchSampleRate(), n2 = this.bindings.audioBatchPts();
    try {
      const e3 = this.bindings.module.HEAPU8, i2 = new Array(s2);
      for (let a3 = 0; a3 < s2; a3++) {
        const s3 = this.bindings.audioBatchPlanePointer(a3);
        if (!s3) return t2;
        const n3 = new Float32Array(e3.buffer, s3, r2);
        i2[a3] = new Float32Array(n3);
      }
      this.enqueueFrame({ planes: i2, numberOfFrames: r2, numberOfChannels: s2, sampleRate: a2, timestamp: 1e6 * n2 });
    } catch (e3) {
      i.error(le, "Batched PCM extraction failed", e3), this.onError && this.onError(e3);
    }
    return t2;
  }
  processDecodedFrame(e2) {
    if (!this.onData) return;
    const t2 = this.bindings.getFrameSamples(), r2 = this.bindings.getFrameChannels(), s2 = this.bindings.getFrameSampleRate();
    try {
      const a2 = this.bindings.module.HEAPU8, n2 = new Array(r2);
      for (let e3 = 0; e3 < r2; e3++) {
        const i2 = this.bindings.getFrameDataPointer(e3), r3 = new Float32Array(a2.buffer, i2, t2);
        n2[e3] = new Float32Array(r3);
      }
      const o2 = { planes: n2, numberOfFrames: t2, numberOfChannels: r2, sampleRate: s2, timestamp: 1e6 * e2 };
      Math.random() < 0.01 && i.debug(le, `Audio data: ${r2}ch, ${t2} frames`), this.enqueueFrame(o2);
    } catch (e3) {
      i.error(le, "PCM frame extraction failed", e3), this.onError && this.onError(e3);
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
const fe = "AudioDecoder";
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
    i.debug(fe, "Created");
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
    if (this.currentTrack = e2, this.useSoftware = false, this.hasTriedSoftwareFallback = false, this.swDecoder && (this.swDecoder.close(), this.swDecoder = null), this.needsSoftwareDecoding(e2.codec)) return i.info(fe, `Forcing software decoding for codec: ${e2.codec}`), this.initSoftwareDecoder();
    if (e2.channels > 2) return i.info(fe, `Forcing software decoding for multi-channel audio: ${e2.channels} channels`), this.initSoftwareDecoder();
    if (!("AudioDecoder" in window)) return i.error(fe, "WebCodecs AudioDecoder not supported"), this.initSoftwareDecoder();
    const r2 = this.mapCodecToWebCodecs(e2.codec);
    if (!r2) return i.warn(fe, `Codec ${e2.codec} not natively supported, trying software.`), this.initSoftwareDecoder();
    const s2 = { codec: r2, sampleRate: e2.sampleRate, numberOfChannels: e2.channels };
    this.hasDescription = false, t2 && t2.length > 0 && (s2.description = t2, this.hasDescription = true);
    try {
      if (!(await AudioDecoder.isConfigSupported(s2)).supported) return i.warn(fe, `Codec not supported by hardware: ${r2}. Trying software.`), this.initSoftwareDecoder();
    } catch (e3) {
      return i.warn(fe, `Codec config check failed: ${r2}`, e3), this.initSoftwareDecoder();
    }
    this.decoder = new AudioDecoder({ output: (e3) => {
      this.onData ? this.onData(e3) : this.pendingData.push(e3);
    }, error: async (e3) => {
      if (i.error(fe, "Decoder error", e3), !this.useSoftware && !this.hasTriedSoftwareFallback && this.currentTrack) {
        if (i.warn(fe, "Hardware decoder error detected, automatically switching to software decoder"), this.hasTriedSoftwareFallback = true, await this.initSoftwareDecoder()) return void i.info(fe, "Successfully switched to software decoder after hardware error");
        i.error(fe, "Failed to switch to software decoder, error will be propagated");
      }
      this.onError && this.onError(e3);
    } });
    try {
      return this.decoder.configure(s2), this.isConfigured = true, i.info(fe, `Configured: ${r2} ${e2.sampleRate}Hz ${e2.channels}ch`), true;
    } catch (e3) {
      return i.error(fe, "Failed to configure decoder", e3), this.initSoftwareDecoder();
    }
  }
  needsSoftwareDecoding(e2) {
    return ["eac3", "ac3", "dts", "dca", "truehd", "mlp", "opus", "flac"].includes(e2.toLowerCase());
  }
  async initSoftwareDecoder() {
    if (!this.currentTrack) return false;
    if (!this.bindings) return i.error(fe, "Cannot switch to software decoder: bindings not available"), false;
    if (i.info(fe, "Initializing software decoder fallback"), this.useSoftware = true, this.decoder) {
      try {
        this.decoder.close();
      } catch (e2) {
      }
      this.decoder = null;
    }
    if (this.swDecoder = new SoftwareAudioDecoder(this.bindings), this.swDecoder.setDownmix(this._downmix), this.swDecoder.setOnData((e2) => {
      this.onPCM ? this.onPCM(e2) : this.pendingPCM.push(e2);
    }), this.swDecoder.setOnError((e2) => {
      i.error(fe, "Software decoder error", e2), this.onError && this.onError(e2);
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
  decode(e2, t2, r2) {
    if (!this.isConfigured) return void this.pendingChunks.push({ data: e2, timestamp: t2, keyframe: r2 });
    if (this.useSoftware && this.swDecoder) return void this.swDecoder.decode(e2, t2, r2);
    if (!this.decoder) return void i.warn(fe, "Decoder not configured");
    if ("closed" === this.decoder.state) return void i.warn(fe, "Decoder is closed, cannot decode");
    const s2 = this.hasDescription ? MoviAudioDecoder.stripAdtsHeader(e2) : e2, a2 = new EncodedAudioChunk({ type: r2 ? "key" : "delta", timestamp: 1e6 * t2, data: s2 });
    try {
      this.decoder.decode(a2);
    } catch (s3) {
      if (i.error(fe, "Decode error", s3), !this.useSoftware && !this.hasTriedSoftwareFallback && this.currentTrack) return i.warn(fe, "Decode exception detected, automatically switching to software decoder"), this.hasTriedSoftwareFallback = true, this.pendingChunks.push({ data: e2, timestamp: t2, keyframe: r2 }), void this.initSoftwareDecoder().then((e3) => {
        e3 ? i.info(fe, "Successfully switched to software decoder after decode exception") : (i.error(fe, "Failed to switch to software decoder"), this.isConfigured = false);
      }).catch((e3) => {
        i.error(fe, "Error during software decoder fallback", e3), this.isConfigured = false;
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
      i.error(fe, "Flush error", e2);
    }
  }
  reset() {
    if (this.decoder) try {
      this.decoder.reset();
    } catch (e2) {
      i.error(fe, "Reset error", e2);
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
    this.isConfigured = false, this.onData = null, this.onError = null, i.debug(fe, "Closed");
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
const me = "SubtitleDecoder";
class SubtitleDecoder {
  bindings = null;
  isConfigured = false;
  currentTrack = null;
  onCue = null;
  onError = null;
  constructor() {
    i.debug(me, "Created");
  }
  setBindings(e2, t2 = true) {
    this.bindings = e2, t2 && this.currentTrack && !this.isConfigured && this.bindings && this.configure(this.currentTrack).catch((e3) => {
      i.error(me, "Failed to configure decoder after bindings set", e3);
    });
  }
  async configure(e2, t2) {
    if (i.debug(me, `configure called: track=${e2.id}, codec=${e2.codec}, type=${e2.subtitleType}`), this.currentTrack = e2, this.isConfigured = false, !this.bindings) return i.warn(me, "WASM bindings not set, will be set later"), true;
    i.debug(me, `Attempting to enable subtitle decoder for track ${e2.id}, codec: ${e2.codec}, type: ${e2.subtitleType}, extradata=${t2?.length ?? 0} bytes`);
    const r2 = await this.bindings.enableDecoder(e2.id, t2);
    if (i.debug(me, `enableDecoder result: ${r2}`), 0 !== r2) {
      const t3 = -2 === r2 ? `Subtitle codec '${e2.codec}' not found/not compiled in WASM build` : `Failed to enable subtitle decoder (error ${r2})`;
      return i.error(me, t3), i.warn(me, `Subtitle track ${e2.id} (${e2.codec}) cannot be decoded - codec may not be available in WASM build`), false;
    }
    return this.isConfigured = true, i.info(me, `Subtitle decoder configured for track ${e2.id}: ${e2.codec}`), true;
  }
  async decode(e2, t2, r2, s2) {
    if (this.isConfigured && this.bindings && this.currentTrack) {
      i.debug(me, `Decoding subtitle packet: track=${this.currentTrack.id}, size=${e2.length}, timestamp=${t2.toFixed(3)}s, duration=${s2?.toFixed(3) ?? "undefined"}s`);
      try {
        const r3 = await this.bindings.decodeSubtitle(this.currentTrack.id, e2, t2, s2);
        if (i.debug(me, `Subtitle decode result: ${r3} (0=success, -6=EAGAIN, other=error)`), 0 === r3) {
          const e3 = await this.bindings.getSubtitleTimes();
          if (!e3) return i.warn(me, "Missing subtitle times"), void await this.bindings.freeSubtitle();
          const t3 = await this.bindings.getSubtitleImageInfo();
          if (t3) {
            i.debug(me, `Decoded image subtitle: ${t3.width}x${t3.height} at (${t3.x}, ${t3.y}), times=${e3.start.toFixed(3)}s-${e3.end.toFixed(3)}s`);
            const r4 = await this.bindings.getSubtitleImageData();
            if (r4) try {
              const s3 = await createImageBitmap(new ImageData(new Uint8ClampedArray(r4), t3.width, t3.height)), a2 = { start: e3.start, end: e3.end, image: s3, position: { x: t3.x, y: t3.y } };
              i.info(me, `Created image subtitle cue: ${t3.width}x${t3.height} (${e3.start.toFixed(2)}s - ${e3.end.toFixed(2)}s)`), this.onCue ? (i.debug(me, "Calling onCue callback with image"), this.onCue(a2)) : (i.warn(me, "No onCue callback set!"), s3.close());
            } catch (e4) {
              i.error(me, "Failed to create ImageBitmap from subtitle", e4);
            }
            else i.warn(me, "Failed to extract image data from subtitle");
          } else {
            const t4 = await this.bindings.getSubtitleText();
            if (i.debug(me, `Decoded subtitle: text=${t4 ? `"${t4.substring(0, 50)}..."` : "null"}, times=${e3.start.toFixed(3)}s-${e3.end.toFixed(3)}s`), t4) {
              const r4 = { start: e3.start, end: e3.end, text: t4 };
              i.info(me, `Created subtitle cue: "${t4.substring(0, 30)}..." (${e3.start.toFixed(2)}s - ${e3.end.toFixed(2)}s)`), this.onCue ? (i.debug(me, "Calling onCue callback"), this.onCue(r4)) : i.warn(me, "No onCue callback set!");
            } else i.warn(me, "No text extracted from subtitle");
          }
          await this.bindings.freeSubtitle();
        } else -6 !== r3 && i.warn(me, `Subtitle decode returned: ${r3}`);
      } catch (e3) {
        i.error(me, "Subtitle decode error", e3), this.onError && this.onError(e3);
      }
    } else i.debug(me, `Skipping decode: configured=${this.isConfigured}, bindings=${!!this.bindings}, track=${!!this.currentTrack}`);
  }
  setOnCue(e2) {
    this.onCue = e2;
  }
  setOnError(e2) {
    this.onError = e2;
  }
  close() {
    this.isConfigured = false, this.currentTrack = null, this.onCue = null, this.onError = null, i.debug(me, "Closed");
  }
}
const ge = "CanvasRenderer";
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
  _perfStuckWindows = 0;
  _stuckWindowStart = 0;
  _stuckBaseCount = 0;
  _onPerformanceDegrade = null;
  static PERF_WINDOW_MS = 1e3;
  static PERF_DEFICIT_RATIO = 0.7;
  static PERF_DEFICIT_WINDOWS = 2;
  static PERF_STUCK_WINDOWS = 4;
  static PERF_WARMUP_FRAMES = 60;
  static PERF_MIN_CAP_FPS = 24;
  static PERF_MIN_ACHIEVED_FPS = 5;
  getAudioTime = null;
  _isAudioHealthy = null;
  _shouldMeasurePerf = null;
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
  externalSubtitleRendererActive = false;
  getSubtitleOverlay() {
    return this.subtitleOverlay;
  }
  subtitleControlsPadding = 0;
  subtitleDelay = 0;
  currentScaleX = 0;
  currentScaleY = 0;
  lastTargetScaleX = 0;
  lastTargetScaleY = 0;
  fitAnimRafId = null;
  lastRenderedFrame = null;
  constructor(e2, t2) {
    this.canvas = e2, t2 && (this.subtitleOverlay = t2), i.debug(ge, "Created");
  }
  detectHDRColorSpace(e2, t2) {
    const r2 = (e2 || "").toLowerCase(), s2 = (t2 || "").toLowerCase(), a2 = s2.includes("pq") || s2.includes("hlg") || s2.includes("smpte2084") || s2.includes("arib-std-b67"), n2 = r2.includes("bt2020") || r2.includes("rec2020");
    return this.hdrEnabled ? a2 || n2 ? (i.info(ge, `HDR/BT.2020 content detected (primaries: ${e2}, transfer: ${t2}). Using display-p3 color space (if supported) for HDR.`), "display-p3") : r2.includes("p3") || r2.includes("display-p3") ? (i.info(ge, "Wide Gamut (P3) content detected. Using display-p3 color space."), "display-p3") : "srgb" : "srgb";
  }
  configure(e2, t2, r2, s2, a2, n2, o2, h2) {
    this.isVideoConfigured = true;
    const d2 = (h2 || "").toLowerCase();
    if (this.isHighBitDepth = d2.includes("12") || d2.includes("14") || d2.includes("16"), this.isHighBitDepth && i.info(ge, `High bit-depth content detected (${h2}), using RGBA16F texture`), 0 !== this.width && 0 !== this.height || (this.width = e2, this.height = t2, this.canvas.width = e2, this.canvas.height = t2), a2 && a2 > 0 ? (this.videoFrameRate = a2, i.debug(ge, `Video frame rate: ${a2}fps (target: 60fps)`)) : this.videoFrameRate = 60, this._presentFpsCap = 0, this._perfDegradeChecked = false, this._perfWindowStart = 0, this._perfDeficitWindows = 0, this._perfStuckWindows = 0, this._stuckWindowStart = 0, void 0 !== n2 && (this.metadataRotation = n2, this.rotation = (this.metadataRotation + this.manualRotation) % 360, this.canvas instanceof HTMLCanvasElement && (this.canvas.style.transform = `rotate(${this.rotation}deg)`, this.canvas.style.transformOrigin = "center center"), i.debug(ge, `Rotation set to: ${this.rotation}° (metadata: ${this.metadataRotation}°, manual: ${this.manualRotation}°)`)), this.lastPrimaries = r2, this.lastTransfer = s2, void 0 !== o2) this.isHDRSource = o2;
    else {
      const e3 = (r2 || "").toLowerCase(), t3 = (s2 || "").toLowerCase();
      i.debug(ge, `Checking HDR support - Primaries: '${e3}', Transfer: '${t3}'`);
      const a3 = t3.includes("pq") || t3.includes("hlg") || t3.includes("smpte2084") || t3.includes("arib-std-b67"), n3 = e3.includes("bt2020") || e3.includes("rec2020");
      this.isHDRSource = a3 || n3;
    }
    const c2 = this.detectHDRColorSpace(r2, s2);
    try {
      const r3 = { alpha: false, desynchronized: false, antialias: false, depth: false, preserveDrawingBuffer: true };
      if (this.gl = this.canvas.getContext("webgl2", r3), !this.gl) return void i.error(ge, "WebGL2 not supported");
      try {
        const e3 = !!window.chrome, t3 = (s2 || "").toLowerCase(), r4 = t3.includes("hlg") || t3.includes("arib-std-b67"), a3 = this.isHDRSource && this.hdrEnabled && e3, n3 = r4 ? "rec2100-hlg" : "rec2100-pq";
        if (void 0 !== this.gl.drawingBufferColorSpace) {
          let e4;
          if (e4 = a3 ? n3 : "srgb" !== c2 && ["srgb", "display-p3"].includes(c2) ? c2 : "srgb", "srgb" !== e4) {
            let t4 = null;
            try {
              this.gl.drawingBufferColorSpace = e4, this.gl.drawingBufferColorSpace === e4 && (t4 = e4);
            } catch (e5) {
            }
            if (!t4 && a3) {
              i.warn(ge, `Browser rejected ${e4}. HDR canvas flag likely disabled — falling back to display-p3.`);
              try {
                this.gl.drawingBufferColorSpace = "display-p3", t4 = "display-p3";
              } catch (e5) {
                t4 = null;
              }
            }
            t4 && (this.gl.unpackColorSpace = t4, i.info(ge, `WebGL drawing buffer color space set to: ${t4} (requested: ${c2}, HDR path: ${a3})`));
          }
        }
      } catch (e3) {
        i.warn(ge, "Failed to set drawingBufferColorSpace on GL context", e3);
      }
      this.initWebGL(), this.vr360Enabled && !this.vrProgram && this.initVRProgram(), this.colorSpace = c2, i.info(ge, `Configured WebGL2: ${e2}x${t2} (colorSpace: ${this.colorSpace})`);
    } catch (e3) {
      i.error(ge, "Error configuring WebGL", e3);
    }
  }
  initWebGL() {
    if (!this.gl) return;
    const e2 = !!window.chrome;
    this.hasNativeHDRSupport = e2, i.info(ge, `Browser detection: isChromium=${e2}, drawingBufferColorSpace=${void 0 !== this.gl.drawingBufferColorSpace}, hasNativeHDRSupport=${this.hasNativeHDRSupport}, isHDRSource=${this.isHDRSource}`), !this.hasNativeHDRSupport && this.isHDRSource ? (i.info(ge, "Initializing WebGL with shader-based HDR tone mapping (non-Chromium)"), this.initWebGLWithHDR()) : (i.info(ge, "Initializing WebGL with simple passthrough (Chromium native HDR)"), this.initWebGLSimple());
  }
  initWebGLSimple() {
    if (!this.gl) return;
    const e2 = this.gl, t2 = (t3, r3) => {
      const s3 = e2.createShader(t3);
      return s3 ? (e2.shaderSource(s3, r3), e2.compileShader(s3), e2.getShaderParameter(s3, e2.COMPILE_STATUS) ? s3 : (i.error(ge, "Shader compile error:", e2.getShaderInfoLog(s3)), e2.deleteShader(s3), null)) : null;
    }, r2 = t2(e2.VERTEX_SHADER, "#version 300 es\n    layout(location = 0) in vec2 a_position;\n    layout(location = 1) in vec2 a_texCoord;\n    out vec2 v_texCoord;\n    void main() {\n      gl_Position = vec4(a_position, 0.0, 1.0);\n      v_texCoord = a_texCoord;\n    }"), s2 = t2(e2.FRAGMENT_SHADER, "#version 300 es\n    precision highp float;\n    uniform sampler2D u_image;\n    in vec2 v_texCoord;\n    out vec4 outColor;\n    void main() {\n      outColor = texture(u_image, v_texCoord);\n    }");
    if (!r2 || !s2) return;
    if (this.program = e2.createProgram(), !this.program) return;
    if (e2.attachShader(this.program, r2), e2.attachShader(this.program, s2), e2.linkProgram(this.program), !e2.getProgramParameter(this.program, e2.LINK_STATUS)) return void i.error(ge, "Program link error:", e2.getProgramInfoLog(this.program));
    const a2 = new Float32Array([-1, 1, 0, 0, -1, -1, 0, 1, 1, 1, 1, 0, 1, -1, 1, 1]);
    this.vao = e2.createVertexArray(), e2.bindVertexArray(this.vao);
    const n2 = e2.createBuffer();
    if (e2.bindBuffer(e2.ARRAY_BUFFER, n2), e2.bufferData(e2.ARRAY_BUFFER, a2, e2.STATIC_DRAW), e2.enableVertexAttribArray(0), e2.vertexAttribPointer(0, 2, e2.FLOAT, false, 16, 0), e2.enableVertexAttribArray(1), e2.vertexAttribPointer(1, 2, e2.FLOAT, false, 16, 8), this.texture = e2.createTexture(), e2.bindTexture(e2.TEXTURE_2D, this.texture), e2.texParameteri(e2.TEXTURE_2D, e2.TEXTURE_WRAP_S, e2.CLAMP_TO_EDGE), e2.texParameteri(e2.TEXTURE_2D, e2.TEXTURE_WRAP_T, e2.CLAMP_TO_EDGE), e2.texParameteri(e2.TEXTURE_2D, e2.TEXTURE_MIN_FILTER, e2.LINEAR), e2.texParameteri(e2.TEXTURE_2D, e2.TEXTURE_MAG_FILTER, e2.LINEAR), !this.program) return;
    const o2 = e2.getUniformLocation(this.program, "u_image");
    o2 && this.program && (e2.useProgram(this.program), e2.uniform1i(o2, 0));
  }
  initWebGLWithHDR() {
    if (!this.gl) return;
    const e2 = this.gl, t2 = (t3, r3) => {
      const s3 = e2.createShader(t3);
      return s3 ? (e2.shaderSource(s3, r3), e2.compileShader(s3), e2.getShaderParameter(s3, e2.COMPILE_STATUS) ? s3 : (i.error(ge, "Shader compile error:", e2.getShaderInfoLog(s3)), e2.deleteShader(s3), null)) : null;
    }, r2 = t2(e2.VERTEX_SHADER, "#version 300 es\n    layout(location = 0) in vec2 a_position;\n    layout(location = 1) in vec2 a_texCoord;\n    out vec2 v_texCoord;\n    void main() {\n      gl_Position = vec4(a_position, 0.0, 1.0);\n      v_texCoord = a_texCoord;\n    }"), s2 = t2(e2.FRAGMENT_SHADER, `#version 300 es
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
    if (!r2 || !s2) return;
    if (this.program = e2.createProgram(), !this.program) return;
    if (e2.attachShader(this.program, r2), e2.attachShader(this.program, s2), e2.linkProgram(this.program), !e2.getProgramParameter(this.program, e2.LINK_STATUS)) return void i.error(ge, "Program link error:", e2.getProgramInfoLog(this.program));
    const a2 = new Float32Array([-1, 1, 0, 0, -1, -1, 0, 1, 1, 1, 1, 0, 1, -1, 1, 1]);
    this.vao = e2.createVertexArray(), e2.bindVertexArray(this.vao);
    const n2 = e2.createBuffer();
    if (e2.bindBuffer(e2.ARRAY_BUFFER, n2), e2.bufferData(e2.ARRAY_BUFFER, a2, e2.STATIC_DRAW), e2.enableVertexAttribArray(0), e2.vertexAttribPointer(0, 2, e2.FLOAT, false, 16, 0), e2.enableVertexAttribArray(1), e2.vertexAttribPointer(1, 2, e2.FLOAT, false, 16, 8), this.texture = e2.createTexture(), e2.bindTexture(e2.TEXTURE_2D, this.texture), e2.texParameteri(e2.TEXTURE_2D, e2.TEXTURE_WRAP_S, e2.CLAMP_TO_EDGE), e2.texParameteri(e2.TEXTURE_2D, e2.TEXTURE_WRAP_T, e2.CLAMP_TO_EDGE), e2.texParameteri(e2.TEXTURE_2D, e2.TEXTURE_MIN_FILTER, e2.LINEAR), e2.texParameteri(e2.TEXTURE_2D, e2.TEXTURE_MAG_FILTER, e2.LINEAR), !this.program) return;
    e2.useProgram(this.program);
    const o2 = e2.getUniformLocation(this.program, "u_image");
    o2 && e2.uniform1i(o2, 0);
    const h2 = e2.getUniformLocation(this.program, "u_hdrEnabled");
    h2 && (e2.uniform1f(h2, this.hdrEnabled ? 1 : 0), i.debug(ge, "Set u_hdrEnabled uniform to: " + (this.hdrEnabled ? 1 : 0)));
  }
  initVRProgram() {
    if (this.vrProgram) return true;
    if (!this.gl) return false;
    const e2 = this.gl, t2 = (t3, r3) => {
      const s3 = e2.createShader(t3);
      return s3 ? (e2.shaderSource(s3, r3), e2.compileShader(s3), e2.getShaderParameter(s3, e2.COMPILE_STATUS) ? s3 : (i.error(ge, "VR shader compile error:", e2.getShaderInfoLog(s3)), e2.deleteShader(s3), null)) : null;
    }, r2 = t2(e2.VERTEX_SHADER, "#version 300 es\n    layout(location = 0) in vec2 a_position;\n    out vec2 v_ndc;\n    void main() {\n      v_ndc = a_position;\n      gl_Position = vec4(a_position, 0.0, 1.0);\n    }"), s2 = t2(e2.FRAGMENT_SHADER, `#version 300 es
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
    if (!r2 || !s2) return false;
    const a2 = e2.createProgram();
    return !!a2 && (e2.attachShader(a2, r2), e2.attachShader(a2, s2), e2.linkProgram(a2), e2.getProgramParameter(a2, e2.LINK_STATUS) ? (this.vrProgram = a2, this.vrLocs = { image: e2.getUniformLocation(a2, "u_image"), yaw: e2.getUniformLocation(a2, "u_yaw"), pitch: e2.getUniformLocation(a2, "u_pitch"), fov: e2.getUniformLocation(a2, "u_fov"), aspect: e2.getUniformLocation(a2, "u_aspect"), lonDiv: e2.getUniformLocation(a2, "u_lonDiv"), latDiv: e2.getUniformLocation(a2, "u_latDiv"), proj: e2.getUniformLocation(a2, "u_proj"), fishFov: e2.getUniformLocation(a2, "u_fishFov"), uScale: e2.getUniformLocation(a2, "u_uScale"), uOffset: e2.getUniformLocation(a2, "u_uOffset"), planetScale: e2.getUniformLocation(a2, "u_planetScale"), srcAspect: e2.getUniformLocation(a2, "u_srcAspect") }, e2.useProgram(a2), this.vrLocs.image && e2.uniform1i(this.vrLocs.image, 0), i.info(ge, "VR 360° equirectangular program compiled"), true) : (i.error(ge, "VR program link error:", e2.getProgramInfoLog(a2)), e2.deleteProgram(a2), false));
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
      e3 > CanvasRenderer.PAINT_THRESHOLD_MS && this._maxDpr > 1 && this.containerWidth > 0 && this.containerHeight > 0 && (i.info(ge, `Adaptive DPR: avg paint ${e3.toFixed(1)}ms over ${this._paintSamples.length} frames > ${CanvasRenderer.PAINT_THRESHOLD_MS}ms threshold — capping DPR to 1x`), this._maxDpr = 1, this.resize(this.containerWidth, this.containerHeight)), this._adaptDprChecked = true, this._paintSamples = [];
    }
  }
  setOnPerformanceDegrade(e2) {
    this._onPerformanceDegrade = e2;
  }
  setShouldMeasurePerf(e2) {
    this._shouldMeasurePerf = e2;
  }
  samplePerformance() {
    if (this._perfDegradeChecked) return;
    if (!this.isPlaying) return this._perfWindowStart = 0, this._stuckWindowStart = 0, void (this._perfStuckWindows = 0);
    if (this._shouldMeasurePerf && !this._shouldMeasurePerf()) return this._perfWindowStart = 0, this._perfDeficitWindows = 0, this._stuckWindowStart = 0, void (this._perfStuckWindows = 0);
    if (Math.abs(this.playbackRate - 1) > 0.05) return this._perfWindowStart = 0, void (this._stuckWindowStart = 0);
    const e2 = performance.now();
    if (0 === this._stuckWindowStart) this._stuckWindowStart = e2, this._stuckBaseCount = this.framesPresented;
    else if (e2 - this._stuckWindowStart >= CanvasRenderer.PERF_WINDOW_MS) {
      const t3 = (this.framesPresented - this._stuckBaseCount) / ((e2 - this._stuckWindowStart) / 1e3);
      if ((!this._isAudioHealthy || this._isAudioHealthy()) && t3 < CanvasRenderer.PERF_MIN_ACHIEVED_FPS) {
        if (this._perfStuckWindows++, this._perfStuckWindows >= CanvasRenderer.PERF_STUCK_WINDOWS) return void this.engageDecodeBound(t3);
      } else this._perfStuckWindows = 0;
      this._stuckWindowStart = e2, this._stuckBaseCount = this.framesPresented;
    }
    if (this.framesPresented <= CanvasRenderer.PERF_WARMUP_FRAMES) return this._perfWindowStart = 0, void (this._perfDeficitWindows = 0);
    const t2 = performance.now();
    if (0 === this._perfWindowStart) return this._perfWindowStart = t2, void (this._perfWindowBaseCount = this.framesPresented);
    const i2 = t2 - this._perfWindowStart;
    if (i2 < CanvasRenderer.PERF_WINDOW_MS) return;
    const r2 = this.framesPresented - this._perfWindowBaseCount, s2 = r2 / (i2 / 1e3), a2 = (this._presentFpsCap > 0 ? Math.min(this.videoFrameRate, this._presentFpsCap) : this.videoFrameRate) * (i2 / 1e3), n2 = !this._isAudioHealthy || this._isAudioHealthy(), o2 = s2 >= CanvasRenderer.PERF_MIN_ACHIEVED_FPS;
    n2 && o2 && a2 > 0 && r2 < a2 * CanvasRenderer.PERF_DEFICIT_RATIO ? (this._perfDeficitWindows++, this._perfDeficitWindows >= CanvasRenderer.PERF_DEFICIT_WINDOWS && this.engagePresentCap(r2 / (i2 / 1e3))) : this._perfDeficitWindows = 0, this._perfWindowStart = t2, this._perfWindowBaseCount = this.framesPresented;
  }
  engagePresentCap(e2) {
    const t2 = Math.max(CanvasRenderer.PERF_MIN_CAP_FPS, Math.round(this.videoFrameRate / 2));
    if (t2 >= this.videoFrameRate) this.engageDecodeBound(e2);
    else {
      if (0 === this._presentFpsCap) return this._presentFpsCap = t2, this._perfDeficitWindows = 0, this._perfWindowStart = 0, void i.info(ge, `Adaptive FPS: sustained ~${e2.toFixed(0)}/${this.videoFrameRate}fps — capping presentation to ${t2}fps before any resolution drop`);
      i.info(ge, `Adaptive FPS: still ~${e2.toFixed(0)}/${this._presentFpsCap}fps after the cap — dropping resolution`), this.engageDecodeBound(e2);
    }
  }
  engageDecodeBound(e2) {
    this._perfDegradeChecked = true, i.warn(ge, `Decode-bound: only ~${e2.toFixed(1)}/${this.videoFrameRate}fps presented with healthy audio — signalling ABR to drop a rung`);
    try {
      this._onPerformanceDegrade?.(0);
    } catch {
    }
  }
  setVR360(e2) {
    this.vr360Enabled !== e2 && (this.vr360Enabled = e2, e2 ? (this.gl && this.initVRProgram(), this.vrYawTarget = this.vrYaw, this.vrPitchTarget = this.vrPitch, this.vrFovTarget = this.vrFov, this.vrYawVel = 0, this.vrPitchVel = 0) : this.gl && this.texture && (this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture), this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE)), this.redrawForVR(), i.info(ge, "360° VR " + (e2 ? "enabled" : "disabled")));
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
        i.debug(ge, "VR spring redraw skipped", e3);
      }
      t2 || (this.vrAnimRaf = requestAnimationFrame(e2));
    };
    this.vrAnimRaf = requestAnimationFrame(e2);
  }
  redrawForVR() {
    if (this.lastRenderedFrame) try {
      this.drawFrame(this.lastRenderedFrame, true);
    } catch (e2) {
      i.debug(ge, "VR redraw skipped", e2);
    }
  }
  renderPosterImage(e2) {
    if (!this.gl || !this.program || !this.texture) return;
    let t2;
    try {
      t2 = new VideoFrame(e2, { timestamp: 0 });
    } catch (e3) {
      return void i.warn(ge, "Failed to wrap poster image as VideoFrame", e3);
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
    this.hdrEnabled = e2, i.info(ge, `HDR manual override set to: ${e2}`);
    const t2 = this.detectHDRColorSpace(this.lastPrimaries, this.lastTransfer);
    if (this.gl && void 0 !== this.gl.drawingBufferColorSpace) try {
      const e3 = !!window.chrome, r2 = (this.lastTransfer || "").toLowerCase(), s2 = r2.includes("hlg") || r2.includes("arib-std-b67"), a2 = this.isHDRSource && this.hdrEnabled && e3;
      let n2;
      n2 = a2 ? s2 ? "rec2100-hlg" : "rec2100-pq" : "srgb" !== t2 && ["srgb", "display-p3"].includes(t2) ? t2 : "srgb";
      let o2 = null;
      try {
        this.gl.drawingBufferColorSpace = n2, this.gl.drawingBufferColorSpace === n2 && (o2 = n2);
      } catch (e4) {
      }
      if (!o2 && a2) {
        i.warn(ge, `Browser rejected ${n2} on toggle. HDR canvas flag likely disabled — falling back to display-p3.`);
        try {
          this.gl.drawingBufferColorSpace = "display-p3", o2 = "display-p3";
        } catch (e4) {
          o2 = null;
        }
      }
      o2 && (this.gl.unpackColorSpace = o2, this.colorSpace = o2 === n2 ? t2 : o2, i.info(ge, `Updated WebGL color space to ${o2} (detected: ${t2}, HDR path: ${a2}) following HDR toggle`));
    } catch (e3) {
      i.warn(ge, "Failed to update drawingBufferColorSpace on the fly");
    }
    if (this.gl && this.program && !this.hasNativeHDRSupport && this.isHDRSource) {
      const t3 = this.gl.getUniformLocation(this.program, "u_hdrEnabled");
      t3 && (this.gl.useProgram(this.program), this.gl.uniform1f(t3, e2 ? 1 : 0), i.debug(ge, "Updated u_hdrEnabled uniform to: " + (e2 ? 1 : 0)));
    }
    !this.isPlaying && this.lastRenderedFrame && this.drawFrame(this.lastRenderedFrame, true);
  }
  isHDRSupported() {
    return this.isHDRSource;
  }
  resize(e2, t2, r2 = false) {
    if (e2 > 0 && t2 > 0) {
      r2 || (this.containerWidth = e2, this.containerHeight = t2), i.debug(ge, `Resizing to: ${e2}x${t2} (Rotation: ${this.rotation}°)`);
      const s2 = this.rotation % 180 != 0, a2 = s2 ? t2 : e2, n2 = s2 ? e2 : t2, o2 = Math.min("undefined" != typeof window && window.devicePixelRatio || 1, this._maxDpr), h2 = Math.round(a2 * o2), d2 = Math.round(n2 * o2), c2 = this.width !== h2 || this.height !== d2;
      if (this.width = h2, this.height = d2, this.canvas.width = h2, this.canvas.height = d2, this.canvas instanceof HTMLCanvasElement && (s2 ? (this.canvas.style.setProperty("width", `${a2}px`, "important"), this.canvas.style.setProperty("height", `${n2}px`, "important"), this.canvas.style.position = "absolute", this.canvas.style.top = "50%", this.canvas.style.left = "50%", this.canvas.style.margin = "0", "contain" === this.fitMode && (this.canvas.style.setProperty("max-width", "none", "important"), this.canvas.style.setProperty("max-height", "none", "important")), this.canvas.style.transform = `translate(-50%, -50%) rotate(${this.rotation}deg)`, this.canvas.style.transformOrigin = "center center") : (this.canvas.style.position = "relative", this.canvas.style.top = "", this.canvas.style.left = "", this.canvas.style.margin = "", this.canvas.style.setProperty("width", "100%", "important"), this.canvas.style.setProperty("height", "100%", "important"), this.canvas.style.setProperty("max-width", "none", "important"), this.canvas.style.setProperty("max-height", "none", "important"), this.canvas.style.transformOrigin = "center center", this.canvas.style.transform = 180 === this.rotation ? "rotate(180deg)" : "none")), !this.gl) {
        const e3 = { alpha: false, desynchronized: false };
        this.gl = this.canvas.getContext("webgl2", e3), this.initWebGL();
      }
      try {
        c2 && (this.currentScaleX = 0, this.currentScaleY = 0, this.frameQueue.length > 0 ? this.drawFrame(this.frameQueue[0], true) : this.lastRenderedFrame && this.drawFrame(this.lastRenderedFrame, true));
      } catch (e3) {
        i.error(ge, "Error redrawing frame after resize", e3);
      }
      if (this.subtitleOverlay) {
        const i2 = ((this.rotation ?? 0) % 360 + 360) % 360, r3 = 90 === i2 || 270 === i2, s3 = r3 ? t2 : e2, a3 = r3 ? e2 : t2, n3 = CanvasRenderer.computeSubtitleBottomPadding(a3);
        this.subtitleOverlay.style.position = "absolute", this.subtitleOverlay.style.right = "auto", this.subtitleOverlay.style.bottom = "auto", this.subtitleOverlay.style.width = `${s3}px`, this.subtitleOverlay.style.height = `${a3}px`, this.subtitleOverlay.style.left = (e2 - s3) / 2 + "px", this.subtitleOverlay.style.top = (t2 - a3) / 2 + "px", this.subtitleOverlay.style.margin = "0", this.subtitleOverlay.style.padding = "0";
        const o3 = this.subtitleControlsPadding > 0 ? this.subtitleControlsPadding : n3;
        this.subtitleOverlay.style.paddingBottom = `${o3}px`, this.subtitleOverlay.style.display = "flex", this.subtitleOverlay.style.flexDirection = "column", this.subtitleOverlay.style.justifyContent = "flex-end", this.subtitleOverlay.style.alignItems = "center", this.subtitleOverlay.style.transformOrigin = "center center", this.subtitleOverlay.style.transform = i2 ? `rotate(${i2}deg)` : "none", this.subtitleOverlay.style.boxSizing = "border-box", this.activeSubtitleCue && c2 && this.scheduleSubtitleRerender();
      }
    }
  }
  setLetterboxColor(e2, t2, i2) {
    this.letterboxTarget = [e2, t2, i2];
  }
  setFitMode(e2) {
    this.fitMode = e2, i.debug(ge, `Fit mode set to: ${e2}`), this.rotation % 180 != 0 && this.canvas instanceof HTMLCanvasElement && "contain" === e2 && (this.canvas.style.setProperty("max-width", "none", "important"), this.canvas.style.setProperty("max-height", "none", "important")), this.lastRenderedFrame && this.startFitAnimation();
  }
  startFitAnimation() {
    if (null !== this.fitAnimRafId) return;
    const e2 = () => {
      this.fitAnimRafId = null, this.lastRenderedFrame && (this.drawFrame(this.lastRenderedFrame, false), Math.abs(this.currentScaleX - this.lastTargetScaleX) < 1e-4 && Math.abs(this.currentScaleY - this.lastTargetScaleY) < 1e-4 || (this.fitAnimRafId = requestAnimationFrame(e2)));
    };
    this.fitAnimRafId = requestAnimationFrame(e2);
  }
  setAudioTimeProvider(e2, t2) {
    this.getAudioTime = e2, this._isAudioHealthy = t2 || null, e2 ? i.debug(ge, "Audio time provider set") : (i.debug(ge, "Audio time provider disabled - video running independently"), this.syncedToAudio = false);
  }
  queueFrame(e2) {
    if (this.frameQueue.length >= 10 * CanvasRenderer.MAX_FRAME_QUEUE) return e2.close(), void i.warn(ge, `Frame queue overflow, dropping frame. Queue size: ${this.frameQueue.length}`);
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
    this.isVideoConfigured && null === this.rafId && (this.isPlaying = true, this.presentationStartTime = performance.now(), 0 === this.frameQueue.length ? (this.lastPresentedPts = -1, this.framesPresented = 0, this.syncedToAudio = false) : (this.lastPresentedPts >= 0 ? this.presentationStartPts = this.lastPresentedPts : this.presentationStartPts = this.frameQueue[0].timestamp / 1e6, this.syncedToAudio = false), this.presentationLoop(), i.debug(ge, "Presentation loop started"));
  }
  stopPresentationLoop() {
    this.isPlaying = false, null !== this.rafId && (cancelAnimationFrame(this.rafId), this.rafId = null), i.debug(ge, "Presentation loop stopped");
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
      const t2 = this.getAudioTime(), r2 = !this._isAudioHealthy || this._isAudioHealthy();
      if (t2 >= 0 && (this.lastKnownAudioTime = t2), t2 >= 0 && r2) {
        if (!this.syncedToAudio) {
          const r4 = e2 >= 0 ? Math.abs(e2 - t2) : 0, s3 = this.framesPresented <= 3;
          if (e2 < 0 || s3 && r4 > 0.03 || r4 > 0.4) return this.presentationStartTime = performance.now(), this.presentationStartPts = t2, this.syncedToAudio = true, i.debug(ge, `Initial A/V sync: audioTime=${t2.toFixed(3)}s, framesPresented=${this.framesPresented}, drift=${(1e3 * r4).toFixed(0)}ms, early=${s3}`), t2;
          this.syncedToAudio = true, i.debug(ge, `Soft A/V sync (no reset): videoTime=${e2.toFixed(3)}s, audioTime=${t2.toFixed(3)}s, framesPresented=${this.framesPresented}, drift=${(1e3 * r4).toFixed(0)}ms`);
        }
        const r3 = this.playbackRate < 0.99 && this.videoFrameRate >= 50;
        if (e2 >= 0 && this.framesPresented > 30) {
          const i2 = e2 - t2, s3 = r3 ? 0.05 : 0.15, a2 = r3 ? 0.5 : 0.25;
          Math.abs(i2) > s3 && (this.presentationStartPts -= i2 * a2);
        }
        const s2 = (performance.now() - this.presentationStartTime) / 1e3;
        return this.presentationStartPts + s2 * this.playbackRate;
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
            const i2 = this.frameQueue[0];
            if (!(i2.timestamp / 1e6 < e4 - t3)) break;
            i2.close(), this.frameQueue.shift();
          }
        }
      }
      const e3 = this.frameQueue.shift();
      return this.lastPresentedPts = e3.timestamp / 1e6, this.currentTime = this.lastPresentedPts, this.framesPresented = 1, this.presentationStartTime = performance.now(), this.presentationStartPts = this.lastPresentedPts, this.syncedToAudio = false, i.debug(ge, `First frame: pts=${this.lastPresentedPts.toFixed(3)}s`), e3;
    }
    const r2 = this._presentFpsCap > 0;
    if ((r2 || this.videoFrameRate < 20) && this.lastPresentedPts >= 0) {
      const t3 = 1 / (r2 ? this._presentFpsCap : this.videoFrameRate), i2 = this.lastPresentedPts + t3;
      if (e2 < i2 - (r2 ? Math.min(0.05, 0.5 * t3) : 0.05)) {
        if (!r2) {
          const e3 = i2 - 0.2;
          for (; this.frameQueue.length > 0 && !(this.frameQueue[0].timestamp / 1e6 >= e3); ) this.frameQueue.shift()?.close();
        }
        return null;
      }
    }
    let s2 = null, a2 = -1;
    const n2 = this.justSeeked ? 3 * t2 : 1.5 * t2;
    for (let t3 = 0; t3 < this.frameQueue.length; t3++) {
      const i2 = this.frameQueue[t3], r3 = i2.timestamp / 1e6;
      if (r3 <= e2 + 5e-3) s2 = i2, a2 = t3;
      else if (r3 > e2 + n2) break;
    }
    if (!s2 && this.frameQueue.length > 0) {
      const i2 = this.frameQueue[0];
      i2.timestamp / 1e6 <= e2 + t2 && (s2 = i2, a2 = 0);
    }
    s2 && (this.justSeeked = false);
    const o2 = Math.max(2, 2 * t2);
    for (; this.frameQueue.length > 0; ) {
      const t3 = this.frameQueue[0], i2 = t3.timestamp / 1e6;
      if (t3 === s2) break;
      if (!(e2 - i2 > o2)) break;
      this.frameQueue.shift()?.close();
    }
    if (s2 && a2 >= 0) {
      if (a2 > 0) {
        const e3 = this.frameQueue.splice(0, a2);
        for (const t3 of e3) t3.close();
      }
      return this.lastPresentedPts = s2.timestamp / 1e6, this.currentTime = this.lastPresentedPts, this.framesPresented++, s2;
    }
    return null;
  }
  uploadFrameTexture(e2, t2) {
    try {
      if (this.isHighBitDepth) {
        e2.texImage2D(e2.TEXTURE_2D, 0, e2.RGBA16F, e2.RGBA, e2.HALF_FLOAT, t2);
        const r2 = e2.getError();
        r2 !== e2.NO_ERROR && (i.warn(ge, `RGBA16F texImage2D failed (GL error ${r2}), falling back to RGBA8`), this.isHighBitDepth = false, e2.texImage2D(e2.TEXTURE_2D, 0, e2.RGBA, e2.RGBA, e2.UNSIGNED_BYTE, t2));
      } else e2.texImage2D(e2.TEXTURE_2D, 0, e2.RGBA, e2.RGBA, e2.UNSIGNED_BYTE, t2);
    } catch (r2) {
      i.warn(ge, "texImage2D failed, retrying with RGBA8:", r2), this.isHighBitDepth = false, e2.texImage2D(e2.TEXTURE_2D, 0, e2.RGBA, e2.RGBA, e2.UNSIGNED_BYTE, t2);
    }
  }
  drawFrame(e2, t2 = false) {
    if (!this.gl || !this.program || !this.texture) return;
    const r2 = this.gl, s2 = this._adaptDprChecked ? 0 : performance.now();
    try {
      if (this.currentTime = e2.timestamp / 1e6, 0 === e2.displayWidth || 0 === e2.displayHeight) return;
      const a2 = e2.displayWidth, n2 = e2.displayHeight;
      if (this.vr360Enabled && (this.vrProgram || this.initVRProgram(), this.vrProgram && this.vrLocs)) return r2.activeTexture(r2.TEXTURE0), r2.bindTexture(r2.TEXTURE_2D, this.texture), this.uploadFrameTexture(r2, e2), this.drawVRFrame(r2, e2), void this.sampleAdaptiveDpr(s2);
      let o2, h2;
      if ("fill" === this.fitMode) o2 = this.width / a2, h2 = this.height / n2;
      else {
        let e3;
        const t3 = this.width, i2 = "control" === this.fitMode ? Math.max(0, this.height - 72) : this.height;
        e3 = "contain" === this.fitMode || "control" === this.fitMode ? Math.min(t3 / a2, i2 / n2) : "cover" === this.fitMode ? Math.max(t3 / a2, i2 / n2) : "zoom" === this.fitMode ? 1.25 * Math.max(t3 / a2, i2 / n2) : Math.min(t3 / a2, i2 / n2), o2 = e3, h2 = e3;
      }
      if (this.lastTargetScaleX = o2, this.lastTargetScaleY = h2, 0 === this.currentScaleX || 0 === this.currentScaleY || t2) this.currentScaleX = o2, this.currentScaleY = h2;
      else {
        const e3 = 0.15;
        Math.abs(o2 - this.currentScaleX) < 1e-4 ? this.currentScaleX = o2 : this.currentScaleX += (o2 - this.currentScaleX) * e3, Math.abs(h2 - this.currentScaleY) < 1e-4 ? this.currentScaleY = h2 : this.currentScaleY += (h2 - this.currentScaleY) * e3;
      }
      const d2 = a2 * this.currentScaleX, c2 = n2 * this.currentScaleY, u2 = (this.width - d2) / 2, l2 = (this.height - c2) / 2;
      r2.viewport(0, 0, this.width, this.height);
      const f2 = 0.08;
      this.letterboxColor[0] += (this.letterboxTarget[0] - this.letterboxColor[0]) * f2, this.letterboxColor[1] += (this.letterboxTarget[1] - this.letterboxColor[1]) * f2, this.letterboxColor[2] += (this.letterboxTarget[2] - this.letterboxColor[2]) * f2, r2.clearColor(this.letterboxColor[0] / 255, this.letterboxColor[1] / 255, this.letterboxColor[2] / 255, 1), r2.clear(r2.COLOR_BUFFER_BIT);
      const m2 = this.height - (l2 + c2);
      if (r2.viewport(u2, m2, d2, c2), r2.activeTexture(r2.TEXTURE0), r2.bindTexture(r2.TEXTURE_2D, this.texture), this.isHighBitDepth && !this._loggedFrameFormat) {
        this._loggedFrameFormat = true, i.info(ge, `VideoFrame format: ${e2.format}, ${e2.codedWidth}x${e2.codedHeight}, colorSpace: ${JSON.stringify(e2.colorSpace)}`);
        try {
          const t3 = new OffscreenCanvas(16, 16).getContext("2d");
          t3.drawImage(e2, 0, 0, 16, 16);
          const r3 = t3.getImageData(0, 0, 4, 4).data, s3 = r3.some((e3) => e3 > 0);
          i.info(ge, `VideoFrame pixel test: ${s3 ? "HAS DATA" : "ALL BLACK"} (sample: R=${r3[0]} G=${r3[1]} B=${r3[2]} A=${r3[3]})`);
        } catch (e3) {
          i.warn(ge, "VideoFrame pixel test failed:", e3);
        }
      }
      this.uploadFrameTexture(r2, e2), r2.useProgram(this.program), r2.bindVertexArray(this.vao), r2.drawArrays(r2.TRIANGLE_STRIP, 0, 4), this.ambientEnabled && this._renderAmbientThumbnail();
    } catch (e3) {
      if (e3 instanceof DOMException && "InvalidStateError" === e3.name) return;
      i.error(ge, "WebGL Draw error", e3);
    }
    this.sampleAdaptiveDpr(s2);
  }
  enableAmbientMirror() {
    if (this.ambientEnabled) return;
    if (!this.gl) return;
    const e2 = this.gl, t2 = CanvasRenderer.AMBIENT_SIZE;
    this.ambientTex = e2.createTexture(), e2.bindTexture(e2.TEXTURE_2D, this.ambientTex), e2.texParameteri(e2.TEXTURE_2D, e2.TEXTURE_WRAP_S, e2.CLAMP_TO_EDGE), e2.texParameteri(e2.TEXTURE_2D, e2.TEXTURE_WRAP_T, e2.CLAMP_TO_EDGE), e2.texParameteri(e2.TEXTURE_2D, e2.TEXTURE_MIN_FILTER, e2.LINEAR), e2.texParameteri(e2.TEXTURE_2D, e2.TEXTURE_MAG_FILTER, e2.LINEAR), e2.texImage2D(e2.TEXTURE_2D, 0, e2.RGBA, t2, t2, 0, e2.RGBA, e2.UNSIGNED_BYTE, null), this.ambientFbo = e2.createFramebuffer(), e2.bindFramebuffer(e2.FRAMEBUFFER, this.ambientFbo), e2.framebufferTexture2D(e2.FRAMEBUFFER, e2.COLOR_ATTACHMENT0, e2.TEXTURE_2D, this.ambientTex, 0);
    const r2 = e2.checkFramebufferStatus(e2.FRAMEBUFFER);
    if (e2.bindFramebuffer(e2.FRAMEBUFFER, null), r2 !== e2.FRAMEBUFFER_COMPLETE) return i.warn(ge, `Ambient FBO incomplete (0x${r2.toString(16)}); ambient mode will see no updates`), this.ambientTex && e2.deleteTexture(this.ambientTex), this.ambientFbo && e2.deleteFramebuffer(this.ambientFbo), this.ambientTex = null, void (this.ambientFbo = null);
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
    this.subtitleOverlay = e2, i.debug(ge, "Subtitle overlay " + (e2 ? "set" : "cleared"));
  }
  setExternalSubtitleRendererActive(e2) {
    this.externalSubtitleRendererActive !== e2 && (this.externalSubtitleRendererActive = e2, this.subtitleCues = [], this.activeSubtitleCue = null, this._lastRenderedSubtitleKey = "", this._lastRenderedSubtitlePlain = "", this.subtitleOverlay && (this.subtitleOverlay.innerHTML = "", this.subtitleOverlay.style.display = e2 ? "block" : "none"));
  }
  setSubtitleFormat(e2) {
    this.subtitleOverlay && this.subtitleOverlay.classList.toggle("movi-subtitle-format-vtt", "vtt" === e2);
  }
  rotate90() {
    return this.manualRotation = (this.manualRotation + 90) % 360, this.rotation = (this.metadataRotation + this.manualRotation) % 360, i.debug(ge, `Rotation: ${this.rotation}° (metadata: ${this.metadataRotation}°, manual: ${this.manualRotation}°)`), this.containerWidth > 0 && this.containerHeight > 0 && this.resize(this.containerWidth, this.containerHeight, true), this.manualRotation;
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
    if (i.debug(ge, `Setting subtitle cues: ${e2.length} cue(s)`), e2.forEach((e3, t2) => {
      e3.image ? i.debug(ge, `  Cue ${t2}: [IMAGE] ${e3.image.width}x${e3.image.height} at (${e3.position?.x ?? "?"}, ${e3.position?.y ?? "?"}) (${e3.start.toFixed(2)}s - ${e3.end.toFixed(2)}s)`) : i.debug(ge, `  Cue ${t2}: "${e3.text?.substring(0, 50)}..." (${e3.start.toFixed(2)}s - ${e3.end.toFixed(2)}s)`);
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
    Number.isFinite(e2) && e2 !== this.subtitleDelay && (this.subtitleDelay = e2, i.debug(ge, `Subtitle delay set to ${e2.toFixed(3)}s`), this.updateActiveSubtitle(), this.renderSubtitles());
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
      const r2 = t2.getContext("2d");
      if (!r2) return void i.warn(ge, "Failed to create temporary canvas context for image subtitle");
      r2.drawImage(e2.image, 0, 0);
      const s2 = t2.toDataURL("image/png"), a2 = this.canvas instanceof HTMLCanvasElement ? this.canvas : null, n2 = a2?.getBoundingClientRect(), o2 = n2?.width || this.containerWidth || this.width, h2 = n2?.height || this.containerHeight || this.height, d2 = 1920, c2 = 1080, u2 = o2 / d2, l2 = h2 / c2;
      let f2 = 1;
      if ("undefined" != typeof window && this.subtitleOverlay) {
        const e3 = window.getComputedStyle(this.subtitleOverlay).getPropertyValue("--movi-sub-size-mult").trim(), t3 = parseFloat(e3);
        Number.isFinite(t3) && t3 > 0 && (f2 = t3);
      }
      const m2 = 0.85, g2 = Math.min(u2, l2), p2 = g2 * f2 * m2, b2 = e2.image.width * p2, v2 = e2.image.height * p2, S2 = (o2 - d2 * g2) / 2, y2 = (h2 - c2 * g2) / 2, w2 = CanvasRenderer.computeSubtitleBottomPadding(h2);
      let k2, _2;
      if (k2 = void 0 !== e2.position?.x ? S2 + (e2.position.x + e2.image.width / 2) * g2 - b2 / 2 : (o2 - b2) / 2, e2.position?.y) _2 = y2 + (e2.position.y + e2.image.height / 2) * g2 - v2 / 2, _2 = Math.max(0, Math.min(_2, h2 - v2));
      else {
        const e3 = h2 - v2 - w2;
        _2 = e3 < 0 ? Math.max(0, h2 - v2 - 10) : e3, _2 = Math.max(0, Math.min(_2, h2 - v2));
      }
      k2 = Math.max(0, Math.min(k2, o2 - b2));
      const T2 = ((this.rotation ?? 0) % 360 + 360) % 360, A2 = 90 === T2 || 270 === T2, R2 = A2 ? h2 : o2, x2 = A2 ? o2 : h2;
      this.subtitleOverlay.style.position = "absolute", this.subtitleOverlay.style.right = "auto", this.subtitleOverlay.style.bottom = "auto", this.subtitleOverlay.style.width = `${R2}px`, this.subtitleOverlay.style.height = `${x2}px`, this.subtitleOverlay.style.left = (o2 - R2) / 2 + "px", this.subtitleOverlay.style.top = (h2 - x2) / 2 + "px", this.subtitleOverlay.style.pointerEvents = "none", this.subtitleOverlay.style.transformOrigin = "center center", this.subtitleOverlay.style.transform = T2 ? `rotate(${T2}deg)` : "none", this.subtitleOverlay.style.display = "flex", this.subtitleOverlay.style.flexDirection = "column", this.subtitleOverlay.style.justifyContent = "flex-end", this.subtitleOverlay.style.alignItems = "center", this.subtitleOverlay.style.overflow = "hidden", this.subtitleOverlay.style.padding = "0";
      const P2 = CanvasRenderer.computeSubtitleBottomPadding(x2), C2 = this.subtitleControlsPadding > 0 ? this.subtitleControlsPadding : P2;
      this.subtitleOverlay.style.paddingBottom = `${C2}px`, this.subtitleOverlay.style.textAlign = "center", this.subtitleOverlay.style.boxSizing = "border-box", this.subtitleOverlay.style.margin = "0";
      let E2 = this.subtitleOverlay.querySelector("img.movi-subtitle-image");
      if (i.debug(ge, `Rendering image subtitle in overlay: ${E2 ? "img exists" : "creating img"}, x=${k2.toFixed(0)}, y=${_2.toFixed(0)}, width=${(e2.image.width * u2).toFixed(0)}, height=${(e2.image.height * l2).toFixed(0)}`), E2 || (E2 = document.createElement("img"), E2.className = "movi-subtitle-image", E2.style.display = "block", E2.style.position = "relative", E2.style.margin = "0", E2.style.padding = "0", E2.style.border = "none", E2.style.outline = "none", this.subtitleOverlay.innerHTML = "", this.subtitleOverlay.appendChild(E2)), e2.position?.x) {
        const e3 = k2 - (o2 - b2) / 2;
        E2.style.marginLeft = `${e3}px`, E2.style.marginRight = "0";
      } else E2.style.marginLeft = "auto", E2.style.marginRight = "auto";
      E2.src = s2, E2.style.width = `${b2}px`, E2.style.height = `${v2}px`, E2.style.maxWidth = `${R2}px`, E2.style.maxHeight = `${x2}px`, E2.style.objectFit = "contain", E2.style.display = "block", E2.style.visibility = "visible", E2.style.opacity = "1", i.debug(ge, `Image subtitle rendered: src set, dimensions=${(e2.image.width * u2).toFixed(0)}x${(e2.image.height * l2).toFixed(0)}, position=(${k2.toFixed(0)}, ${_2.toFixed(0)})`);
    } catch (e3) {
      i.error(ge, "Failed to render image subtitle in overlay", e3);
    }
  }
  clearSubtitles() {
    this.subtitleCues = [], this.activeSubtitleCue = null, this._lastRenderedSubtitleKey = "", this._lastRenderedSubtitlePlain = "", this.subtitleOverlay && !this.externalSubtitleRendererActive && (this.subtitleOverlay.innerHTML = "");
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
    const e2 = this.getCurrentPlaybackTime(), t2 = e2 - this.subtitleDelay, r2 = this.activeSubtitleCue;
    this.activeSubtitleCue = null;
    let s2 = null, a2 = 1 / 0;
    for (const e3 of this.subtitleCues) if (t2 >= e3.start - 0.1 && t2 <= e3.end + 0.2) {
      const i2 = (e3.start + e3.end) / 2, r3 = Math.abs(t2 - i2);
      r3 < a2 && (a2 = r3, s2 = e3);
    }
    if (s2) this.activeSubtitleCue = s2, r2 !== s2 && (s2.image ? i.debug(ge, `Active subtitle changed at ${e2.toFixed(2)}s: [IMAGE] ${s2.image.width}x${s2.image.height} (${s2.start.toFixed(2)}s - ${s2.end.toFixed(2)}s)`) : i.debug(ge, `Active subtitle changed at ${e2.toFixed(2)}s: "${s2.text?.substring(0, 30)}..." (${s2.start.toFixed(2)}s - ${s2.end.toFixed(2)}s)`));
    else if (r2) {
      const s3 = 0.3;
      t2 >= r2.start - 0.1 && t2 <= r2.end + s3 ? this.activeSubtitleCue = r2 : r2.image ? i.debug(ge, `Subtitle cleared at ${e2.toFixed(2)}s (was: [IMAGE] ${r2.image.width}x${r2.image.height} at ${r2.start.toFixed(2)}s - ${r2.end.toFixed(2)}s)`) : i.debug(ge, `Subtitle cleared at ${e2.toFixed(2)}s (was: "${r2.text?.substring(0, 30)}..." at ${r2.start.toFixed(2)}s - ${r2.end.toFixed(2)}s)`);
    }
  }
  renderSubtitles() {
    if (this.externalSubtitleRendererActive) return;
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
      })(), S2 = (e4) => {
        const t3 = e4.indexOf(m2);
        return t3 >= 0 ? e4.slice(0, t3) : e4;
      };
      let y2 = b2;
      const w2 = this.subtitleCues.indexOf(this.activeSubtitleCue);
      if (w2 >= 0) {
        let e4 = p2;
        for (let t3 = w2 + 1; t3 < this.subtitleCues.length; t3++) {
          const i3 = this.subtitleCues[t3];
          if (!i3?.text) break;
          const r3 = S2(i3.text);
          if (r3.length > e4.length && r3.startsWith(e4)) e4 = r3, y2 = i3.text.length > r3.length ? i3.text : r3;
          else if (!r3.startsWith(e4)) break;
        }
      }
      const k2 = S2(y2).replace(/<[^>]*>/g, ""), _2 = (this._subtitleMeasureCanvas ||= document.createElement("canvas")).getContext("2d");
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
      const C2 = A2.map((e4) => {
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
      }).join(""), E2 = parseFloat(this.subtitleOverlay.style.width) || 0, F2 = E2 > 0 && T2 > 0 && T2 <= 0.92 * E2, D2 = F2 ? Math.max(0, Math.floor((E2 - T2) / 2)) : 0, B2 = F2 ? D2 > 0 ? ` style="padding-left:${D2}px"` : "" : ' style="text-align:center"';
      return void (this.subtitleOverlay.innerHTML = `<div class="movi-subtitle-anchor"${B2}><div class="movi-subtitle-block">${C2}</div></div>`);
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
    let r2 = 0;
    for (; this.frameQueue.length > 0; ) {
      const i2 = this.frameQueue[0];
      if (!(i2.timestamp / 1e6 < e2 - t2)) break;
      i2.close(), this.frameQueue.shift(), r2++;
    }
    return r2 > 0 && (this.presentationStartTime = 0, this.presentationStartPts = 0, this.lastPresentedPts = -1, this.syncedToAudio = false, i.debug(ge, `Dropped ${r2} stale frames before ${e2.toFixed(3)}s (tolerance ${t2.toFixed(2)}s)`)), r2;
  }
  clearQueue() {
    for (const e2 of this.frameQueue) e2.close();
    this.frameQueue = [], this.lastPresentedPts = -1, this.syncedToAudio = false, this.lastKnownAudioTime = -1, this.framesPresented = 0, this.presentationStartTime = 0, this.presentationStartPts = 0, this.justSeeked = true, i.debug(ge, "Frame queue cleared and presentation timing reset");
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
    this.stopPresentationLoop(), null !== this.vrAnimRaf && (cancelAnimationFrame(this.vrAnimRaf), this.vrAnimRaf = null), this.lastRenderedFrame && (this.lastRenderedFrame.close(), this.lastRenderedFrame = null), this.clear(), this.gl && (this.texture && this.gl.deleteTexture(this.texture), this.program && this.gl.deleteProgram(this.program), this.vrProgram && this.gl.deleteProgram(this.vrProgram)), this.gl = null, i.debug(ge, "Destroyed");
  }
}
const pe = "Signalsmith";
let be = null;
function ve() {
  return be || (be = G().then((e2) => (i.info(pe, "Signalsmith Stretch ready (shared movi WASM)"), e2)).catch((e2) => (i.warn(pe, "movi WASM not available — falling back", e2), be = null, null))), be;
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
const Se = "AudioRenderer";
let ye = null, we = false;
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
    i.debug(Se, "Created");
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
      return i.warn(Se, "Failed to create BT keepalive element", e2), null;
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
      return ye && "closed" !== ye.state || (ye = new AudioContext({ latencyHint: "interactive" })), this.audioContext = ye, "running" === this.audioContext.state && (we = true), we && "suspended" === this.audioContext.state && this.audioContext.resume().catch(() => {
      }), this.inputNode = this.audioContext.createGain(), this.gainNode = this.audioContext.createGain(), this.compressorNode = this.audioContext.createDynamicsCompressor(), this.compressorNode.threshold.value = -18, this.compressorNode.knee.value = 6, this.compressorNode.ratio.value = 20, this.compressorNode.attack.value = 1e-3, this.compressorNode.release.value = 0.15, this.wireGraph(), this.gainNode.gain.value = this._muted ? 0 : this.perceptualGain(this.volume), this._sinkId && this.applySinkId(this._sinkId).catch(() => {
      }), this._stableAudio && this.setupContextStateMonitoring(), i.info(Se, `Initialized: sampleRate=${this.audioContext.sampleRate}, muted=${this._muted}, state=${this.audioContext.state}`), ve(), true;
    } catch (e2) {
      return i.error(Se, "Failed to initialize", e2), false;
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
      return await t2.setSinkId(e2 || ""), i.info(Se, `Output device set: ${e2 || "(default)"}`), true;
    } catch (t3) {
      return i.warn(Se, `setSinkId failed for "${e2}"`, t3), false;
    }
  }
  configure(e2, t2) {
    i.info(Se, `Configured: ${e2}Hz, ${t2}ch`);
  }
  getMaxChannelCount() {
    return this.audioContext?.destination.maxChannelCount ?? 2;
  }
  setOutputChannelCount(e2) {
    if (!this.audioContext) return;
    const t2 = this.audioContext.destination, r2 = Math.min(Math.max(1, Math.floor(e2)), t2.maxChannelCount);
    try {
      t2.channelCount = r2, t2.channelCountMode = "explicit", t2.channelInterpretation = "discrete", this.inputNode && (this.inputNode.channelCount = r2), this.gainNode && (this.gainNode.channelCount = r2), this.compressorNode && (this.compressorNode.channelCount = r2), i.info(Se, `Destination channelCount → ${r2} (max ${t2.maxChannelCount})`);
    } catch (e3) {
      i.warn(Se, "Failed to set destination channelCount", e3);
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
      i.error(Se, "Render error", e3);
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
      i.error(Se, "RenderPCM error", e3);
    }
  }
  scheduleAudioBuffer(e2, t2) {
    if (!this.audioContext || !this.gainNode) return;
    this.lastDecodeTime = performance.now(), this._stableAudio && this.isStarved && (this.isStarved = false, this.starvationStartTime = 0, i.debug(Se, "Recovered from audio starvation"));
    const r2 = e2.numberOfChannels, s2 = e2.sampleRate;
    this._decodedSampleRate = s2, this.isRebufferingForRateChange && (this.isRebufferingForRateChange = false, i.debug(Se, "Rebuffering complete after playback rate change"));
    let a2 = e2, n2 = false;
    if (this.preservePitch && Math.abs(this._playbackRate - 1) > 0.01) {
      const t3 = this.processStretch(e2, this._playbackRate);
      if (t3 && t3.length > 1) a2 = t3, n2 = true;
      else {
        const t4 = e2.duration / this._playbackRate, i2 = Math.max(1, Math.ceil(t4 * s2));
        a2 = this.audioContext.createBuffer(r2, i2, s2), n2 = true;
      }
    }
    const o2 = this.audioContext.createBufferSource();
    o2.buffer = a2, o2.connect(this.inputNode ?? this.gainNode), o2.playbackRate.value = n2 ? 1 : this._playbackRate;
    const h2 = this.audioContext.currentTime, d2 = h2 + 5e-3;
    if (this.scheduledTime < h2) {
      if (this.hasFirstBuffer && (this._lastUnderrunAt = performance.now(), this.duckForUnderrun()), this._stableAudio && this.hasFirstBuffer && this.audioContext) {
        const e3 = h2 - this.scheduledTime;
        if (e3 > 5e-3 && e3 < 1) try {
          const t3 = Math.ceil(e3 * s2), a3 = this.audioContext.createBuffer(r2, t3, s2), n3 = this.audioContext.createBufferSource();
          n3.buffer = a3, n3.connect(this.inputNode ?? this.gainNode), n3.start(this.scheduledTime), n3.onended = () => {
            try {
              n3.disconnect();
            } catch {
            }
          }, i.debug(Se, `Gap filled: ${(1e3 * e3).toFixed(1)}ms silence`);
        } catch {
        }
      }
      this.scheduledTime = d2, this.hasFirstBuffer && (this.firstBufferScheduledAt = d2, this.firstBufferMediaTime = t2);
    }
    this.unduckIfClean();
    let c2 = this.scheduledTime;
    if (this.hasFirstBuffer) {
      const e3 = this.firstBufferScheduledAt + (t2 - this.firstBufferMediaTime) / this._playbackRate, i2 = e3 - this.scheduledTime;
      Math.abs(i2) > 0.02 && (c2 = e3);
    }
    const u2 = Math.max(c2, d2);
    o2.start(u2), this.hasFirstBuffer || (this.firstBufferScheduledAt = u2, this.firstBufferMediaTime = t2, this.hasFirstBuffer = true, i.debug(Se, `First buffer scheduled at ${u2.toFixed(3)}s, mediaTime=${t2.toFixed(3)}s`)), this.activeSources.push(o2), this.scheduledTime = u2 + (n2 ? a2.duration : e2.duration / this._playbackRate), this.currentMediaTime = t2, this.scheduledCount++;
    const l2 = t2 + e2.duration;
    l2 > this.maxScheduledMediaTime && (this.maxScheduledMediaTime = l2), o2.onended = () => {
      const e3 = this.activeSources.indexOf(o2);
      -1 !== e3 && this.activeSources.splice(e3, 1);
      try {
        o2.disconnect();
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
        i.error(Se, "Render samples error", e3);
      }
    }
  }
  async play() {
    if (this.isPlaying = true, this.intentionalSuspend = false, this.audioContext || this._muted || await this.init(), this.preservePitch && this.audioContext && !this.signalsmith && Math.abs(this._playbackRate - 1) > 0.01 && this.maybeInitSignalsmith(this._decodedSampleRate || this.audioContext.sampleRate), "suspended" === this.audioContext?.state && (!this._muted || this.intentionalSuspend)) try {
      await this.audioContext.resume(), "running" === this.audioContext.state && (we = true);
    } catch (e2) {
      i.warn(Se, "Failed to resume AudioContext (user gesture may be required)", e2);
    }
    this.startKeepalive(), !this._muted && this.audioContext && this.warmupContext(), this.lastDecodeTime = performance.now(), i.debug(Se, `Playing (muted: ${this._muted}, audioContext: ${this.audioContext ? "initialized" : "deferred"}, state: ${this.audioContext?.state || "N/A"})`);
  }
  maybeInitSignalsmith(e2) {
    this.signalsmith || this.signalsmithLoading || (this.signalsmithLoading = true, this.signalsmithSampleRate = e2, async function(e3, t2 = 2) {
      const i2 = await ve();
      return i2 ? new SignalsmithStretcher(i2, e3, t2) : null;
    }(e2, 2).then((t2) => {
      this.signalsmithLoading = false, t2 && (t2.tempo = this._playbackRate, t2.pitch = 1, this.signalsmith = t2, i.info(Se, `Signalsmith ready @ ${e2}Hz`));
    }).catch((e3) => {
      this.signalsmithLoading = false, i.warn(Se, "Signalsmith init failed", e3);
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
      i.error(Se, "Failed to suspend audio context", e2);
    })), i.debug(Se, "Paused");
  }
  suspendForBuffering() {
    this.intentionalSuspend = true, this.audioContext && "running" === this.audioContext.state && this.audioContext.suspend().catch((e2) => {
      i.error(Se, "Failed to suspend audio context for buffering", e2);
    }), i.debug(Se, "Suspended for buffering (isPlaying still true)");
  }
  primeForBuffering() {
    this.isPlaying = true, this.intentionalSuspend = true, this.audioContext || this._muted ? this.audioContext && "running" === this.audioContext.state && this.audioContext.suspend().catch((e2) => {
      i.error(Se, "Failed to suspend audio context for prime", e2);
    }) : this.init().then(() => {
      this.intentionalSuspend && "running" === this.audioContext?.state && this.audioContext.suspend().catch(() => {
      });
    }).catch(() => {
    }), this.lastDecodeTime = performance.now(), i.debug(Se, "Primed for buffering (context held suspended)");
  }
  resumeFromBuffering() {
    this.intentionalSuspend = false, this.audioContext && "suspended" === this.audioContext.state && this.audioContext.resume().catch((e2) => {
      i.error(Se, "Failed to resume audio context from buffering", e2);
    }), i.debug(Se, "Resumed from buffering");
  }
  setVolume(e2) {
    if (this.volume = Math.max(0, Math.min(2, e2)), this.gainNode && !this._muted) {
      const e3 = this.perceptualGain(this.volume);
      this._stableAudio ? this.rampGain(e3) : this.gainNode.gain.value = e3;
    }
    i.debug(Se, `Volume: ${this.volume} (muted: ${this._muted})`);
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
    this.preservePitch = e2, i.debug(Se, `Pitch preservation: ${e2}`);
  }
  getPreservePitch() {
    return this.preservePitch;
  }
  isRebuffering() {
    return this.isRebufferingForRateChange;
  }
  mute() {
    this._muted = true, this.gainNode && (this._stableAudio ? this.rampGain(0) : this.gainNode.gain.value = 0), i.debug(Se, "Muted");
  }
  async unmute() {
    if (this._muted = false, !this.audioContext && this.isPlaying && await this.init(), this.gainNode) {
      const e2 = this.perceptualGain(this.volume);
      this._stableAudio ? this.rampGain(e2) : this.gainNode.gain.value = e2;
    }
    this.audioContext && "suspended" === this.audioContext.state && this.audioContext.resume().then(() => {
      i.debug(Se, "AudioContext resumed on unmute");
    }).catch((e2) => {
      i.warn(Se, "Failed to resume AudioContext on unmute", e2);
    }), i.debug(Se, "Unmuted");
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
    return we;
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
        e2.cancelScheduledValues(t2), e2.setValueAtTime(e2.value, t2), e2.linearRampToValueAtTime(0, t2 + AudioRenderer.DUCK_FADE_OUT), i.debug(Se, "Duck: engaged (underrun)");
      } catch {
      }
    }
  }
  unduckIfClean() {
    if (this._ducked && this.inputNode && this.audioContext && !this.isUnderrunning(AudioRenderer.DUCK_CLEAR_MS)) {
      this._ducked = false;
      try {
        const e2 = this.inputNode.gain, t2 = this.audioContext.currentTime;
        e2.cancelScheduledValues(t2), e2.setValueAtTime(e2.value, t2), e2.linearRampToValueAtTime(1, t2 + AudioRenderer.DUCK_FADE_IN), i.debug(Se, "Duck: released (clean)");
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
      i.warn(Se, "Failed to (re)wire audio chain");
    }
  }
  setStableAudio(e2) {
    this._stableAudio = e2, i.info(Se, "Stable audio: " + (e2 ? "enabled" : "disabled")), this.wireGraph(), i.debug(Se, "Audio chain rewired: compressor " + (e2 ? "active" : "bypassed")), e2 && this.audioContext ? this.setupContextStateMonitoring() : !e2 && this.audioContext && this.contextStateHandler && (this.audioContext.removeEventListener("statechange", this.contextStateHandler), this.contextStateHandler = null);
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
      "interrupted" === e2 || "suspended" === e2 && this.isPlaying && !this._muted && !this.intentionalSuspend ? (i.warn(Se, `AudioContext ${e2} unexpectedly during playback, attempting recovery`), this.attemptContextRecovery()) : "running" === e2 && (this.recoveryAttempts = 0, we = true, i.debug(Se, "AudioContext recovered to running state"));
    }, this.audioContext.addEventListener("statechange", this.contextStateHandler));
  }
  attemptContextRecovery() {
    if (this.audioContext && this.isPlaying) {
      if (this.recoveryAttempts >= AudioRenderer.MAX_RECOVERY_ATTEMPTS) return i.error(Se, `AudioContext recovery failed after ${AudioRenderer.MAX_RECOVERY_ATTEMPTS} attempts`), void (this.recoveryAttempts = 0);
      this.recoveryAttempts++, i.debug(Se, `AudioContext recovery attempt ${this.recoveryAttempts}/${AudioRenderer.MAX_RECOVERY_ATTEMPTS}`), this.audioContext.resume().then(() => {
        "running" === this.audioContext?.state && (i.info(Se, "AudioContext recovered successfully"), this.recoveryAttempts = 0);
      }).catch((e2) => {
        i.warn(Se, "AudioContext recovery failed", e2);
        const t2 = Math.min(1e3 * Math.pow(2, this.recoveryAttempts - 1), 5e3);
        setTimeout(() => this.attemptContextRecovery(), t2);
      });
    }
  }
  isAudioStarved() {
    if (!this.isPlaying || !this.hasFirstBuffer) return false;
    if (this.getBufferedDuration() > 0.1) return false;
    const e2 = performance.now() - this.lastDecodeTime;
    return this.lastDecodeTime > 0 && e2 > AudioRenderer.STARVATION_THRESHOLD && (this.isStarved || (this.isStarved = true, this.starvationStartTime = performance.now(), i.warn(Se, `Audio starvation detected: ${e2.toFixed(0)}ms since last decode`)), true);
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
    this.audioContext = null, this.inputNode = null, this.gainNode = null, this.compressorNode = null, this.signalsmith && (this.signalsmith.destroy(), this.signalsmith = null), this.recoveryAttempts = 0, i.debug(Se, "Destroyed");
  }
}
const ke = "ThumbnailRenderer";
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
    const r2 = (e2 || "").toLowerCase(), s2 = (t2 || "").toLowerCase();
    if (!this.hdrEnabled) return "srgb";
    const a2 = s2.includes("pq") || s2.includes("hlg") || s2.includes("smpte2084") || s2.includes("arib-std-b67"), n2 = r2.includes("bt2020") || r2.includes("rec2020");
    return a2 || n2 ? (i.debug(ke, `HDR content detected (primaries: ${e2}, transfer: ${t2}). Using display-p3.`), "display-p3") : r2.includes("p3") || r2.includes("display-p3") ? (i.debug(ke, "P3 content detected. Using display-p3."), "display-p3") : "srgb";
  }
  initialize(e2) {
    const { width: t2, height: r2, rotation: s2 = 0, colorPrimaries: a2, colorTransfer: n2, hdrEnabled: o2 = true } = e2;
    this.hdrEnabled = o2, this.lastColorPrimaries = a2, this.lastColorTransfer = n2, this.rotation = s2;
    const h2 = s2 % 180 != 0;
    this.canvas.width = h2 ? r2 : t2, this.canvas.height = h2 ? t2 : r2, this.flatWidth = this.canvas.width, this.flatHeight = this.canvas.height;
    const d2 = (a2 || "").toLowerCase(), c2 = (n2 || "").toLowerCase(), u2 = c2.includes("pq") || c2.includes("hlg") || c2.includes("smpte2084") || c2.includes("arib-std-b67"), l2 = d2.includes("bt2020") || d2.includes("rec2020");
    this.isHDRSource = u2 || l2;
    const f2 = this.detectHDRColorSpace(a2, n2);
    if (this.gl = this.canvas.getContext("webgl2", { alpha: false, antialias: false, depth: false, preserveDrawingBuffer: true }), !this.gl) throw new Error("WebGL2 not supported");
    try {
      "srgb" !== f2 && void 0 !== this.gl.drawingBufferColorSpace && (this.gl.drawingBufferColorSpace = f2, this.gl.unpackColorSpace = f2, i.debug(ke, `WebGL color space set to: ${f2}`));
    } catch (e3) {
      i.warn(ke, "Failed to set drawingBufferColorSpace", e3);
    }
    const m2 = this.detectChromium();
    this.hasNativeHDRSupport = m2, !this.hasNativeHDRSupport && this.isHDRSource ? (i.debug(ke, "Using shader-based HDR tone mapping (non-Chromium)"), this.initWebGLWithHDR()) : (i.debug(ke, "Using simple passthrough (Chromium native HDR)"), this.initWebGLSimple()), i.info(ke, `Initialized: ${t2}x${r2}, isChromium=${m2}, isHDR=${this.isHDRSource}, colorSpace=${f2}`);
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
    const r2 = (e3, t3) => {
      if (!this.gl) return null;
      const r3 = this.gl.createShader(e3);
      return r3 ? (this.gl.shaderSource(r3, t3), this.gl.compileShader(r3), this.gl.getShaderParameter(r3, this.gl.COMPILE_STATUS) ? r3 : (i.error(ke, "Shader compile error:", this.gl.getShaderInfoLog(r3)), this.gl.deleteShader(r3), null)) : null;
    }, s2 = r2(this.gl.VERTEX_SHADER, e2), a2 = r2(this.gl.FRAGMENT_SHADER, t2);
    if (!s2 || !a2) return null;
    const n2 = this.gl.createProgram();
    return n2 ? (this.gl.attachShader(n2, s2), this.gl.attachShader(n2, a2), this.gl.linkProgram(n2), this.gl.getProgramParameter(n2, this.gl.LINK_STATUS) ? n2 : (i.error(ke, "Program link error:", this.gl.getProgramInfoLog(n2)), null)) : null;
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
  async configureDecoder(e2, t2, r2, s2, a2, n2) {
    if (!("VideoDecoder" in window)) return i.warn(ke, "WebCodecs not supported in this browser"), false;
    this.lastDecoderConfig = { codec: e2, extradata: t2, width: r2, height: s2, profile: a2, level: n2 }, this.decoder && ("closed" !== this.decoder.state && this.decoder.close(), this.decoder = null);
    let o2 = null;
    void 0 !== a2 && (o2 = this.mapCodecToWebCodecs(e2, r2, s2, a2, n2)), o2 || (o2 = CodecParser.getCodecString(e2, t2 ?? void 0, r2, s2)), o2 ? i.debug(ke, "Resolved codec string:", o2) : (o2 = e2, i.warn(ke, "Failed to resolve codec string, using generic:", o2));
    try {
      const e3 = { codec: o2, codedWidth: r2, codedHeight: s2, hardwareAcceleration: "prefer-hardware" };
      if (!(await VideoDecoder.isConfigSupported(e3)).supported) return i.warn(ke, `Codec not supported by WebCodecs: ${o2}`), false;
    } catch (e3) {
      return i.warn(ke, `Failed to check codec support: ${o2}`, e3), false;
    }
    const h2 = o2;
    return new Promise((e3) => {
      try {
        this.decoder = new VideoDecoder({ output: (e4) => {
          this.renderVideoFrame(e4), e4.close(), this.pendingDecodeResolve && (this.pendingDecodeResolve(true), this.pendingDecodeResolve = null);
        }, error: (e4) => {
          i.error(ke, "VideoDecoder error:", e4), this.pendingDecodeResolve && (this.pendingDecodeResolve(false), this.pendingDecodeResolve = null);
        } });
        const a3 = { codec: h2, codedWidth: r2, codedHeight: s2, hardwareAcceleration: "prefer-hardware", optimizeForLatency: true }, n3 = t2 && (t2.length > 3 && 0 === t2[0] && 0 === t2[1] && 1 === t2[2] || t2.length > 4 && 0 === t2[0] && 0 === t2[1] && 0 === t2[2] && 1 === t2[3]);
        let d2 = t2 ?? void 0;
        if (n3 && t2) {
          const e4 = o2.startsWith("hvc1") || o2.startsWith("hev1"), r3 = o2.startsWith("avc1") || o2.startsWith("avc3");
          e4 ? (d2 = MoviVideoDecoder.annexBToHvcC(t2) ?? void 0, d2 && (this.isAnnexBSource = true, i.debug(ke, `Converted Annex B to hvcC for thumbnails (${d2.length}B)`))) : r3 ? (d2 = MoviVideoDecoder.annexBToAvcC(t2) ?? void 0, d2 && (this.isAnnexBSource = true, i.debug(ke, `Converted Annex B to avcC for thumbnails (${d2.length}B)`))) : d2 = void 0;
        }
        !d2 || o2.startsWith("vp09") || o2.startsWith("vp8") ? d2 || n3 || i.debug(ke, "Skipping description (extradata) for VPx codec or missing data") : a3.description = d2, this.decoder.configure(a3), e3(true);
      } catch (t3) {
        i.error(ke, "Failed to configure VideoDecoder:", t3), this.decoder = null, e3(false);
      }
    });
  }
  mapCodecToWebCodecs(e2, t2, r2, s2, a2) {
    const n2 = e2.toLowerCase();
    return "h264" === n2 || "avc1" === n2 ? "avc1.640028" : "hevc" === n2 || "h265" === n2 || "hvc1" === n2 ? 2 === s2 ? `hvc1.2.4.${a2 ? `L${a2}` : "L153"}.B0` : 1 === s2 ? `hvc1.1.6.${a2 ? `L${a2}` : "L120"}.B0` : 4 === s2 ? "hvc1.4.10.L93.B0" : "hvc1.1.6.L93.B0" : "vp9" === n2 ? 2 === s2 ? (i.info(ke, "Mapping VP9 Profile 2 to vp09.02.51.10.01.09.16.09.00 (HDR)"), "vp09.02.51.10.01.09.16.09.00") : 3 === s2 ? "vp09.03.51.10.01.09.16.09.00" : "vp09.00.41.08.01.01.01.01.00" : "av1" === n2 ? "av01.0.01M.08" : "vp8" === n2 ? "vp8" : null;
  }
  async decodeAndRender(e2, t2, r2) {
    let s2 = this.decoder;
    if (!s2 || "closed" === s2.state) {
      if (this.decoderRevivedUnproven) return i.debug(ke, "Decoder dead again before any successful decode — skipping recreate to avoid a loop"), false;
      if (!await this.recreateDecoder()) return false;
      if (this.decoderRevivedUnproven = true, s2 = this.decoder, !s2 || "closed" === s2.state) return false;
    }
    return new Promise((a2) => {
      this.pendingDecodeResolve = (e3) => {
        e3 && (this.decoderRevivedUnproven = false), a2(e3);
      };
      try {
        let a3 = e2;
        a3 = this.isAnnexBSource ? MoviVideoDecoder.annexBToLengthPrefixed(e2) : MoviVideoDecoder.stripAudLengthPrefixed(a3);
        const n2 = new EncodedVideoChunk({ type: "key", timestamp: 1e6 * t2, duration: r2, data: a3 });
        s2.decode(n2), s2.flush().catch((e3) => {
          i.error(ke, "Decoder flush error:", e3), this.pendingDecodeResolve && (this.pendingDecodeResolve(false), this.pendingDecodeResolve = null);
        });
      } catch (e3) {
        i.error(ke, "Decode error:", e3), this.pendingDecodeResolve && (this.pendingDecodeResolve(false), this.pendingDecodeResolve = null);
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
    return this.isAnnexBSource = false, i.debug(ke, "Recreating dead thumbnail decoder"), this.configureDecoder(e2.codec, e2.extradata, e2.width, e2.height, e2.profile, e2.level);
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
    if (!t2) return i.warn(ke, "Failed to compile VR preview program"), false;
    this.vrProgram = t2, this.vrLocs = { image: e2.getUniformLocation(t2, "u_image"), yaw: e2.getUniformLocation(t2, "u_yaw"), pitch: e2.getUniformLocation(t2, "u_pitch"), fov: e2.getUniformLocation(t2, "u_fov"), aspect: e2.getUniformLocation(t2, "u_aspect"), lonDiv: e2.getUniformLocation(t2, "u_lonDiv"), latDiv: e2.getUniformLocation(t2, "u_latDiv"), proj: e2.getUniformLocation(t2, "u_proj"), fishFov: e2.getUniformLocation(t2, "u_fishFov"), uScale: e2.getUniformLocation(t2, "u_uScale"), uOffset: e2.getUniformLocation(t2, "u_uOffset"), planetScale: e2.getUniformLocation(t2, "u_planetScale"), srcAspect: e2.getUniformLocation(t2, "u_srcAspect") }, e2.useProgram(t2), this.vrLocs.image && e2.uniform1i(this.vrLocs.image, 0), this.vrVao = e2.createVertexArray(), e2.bindVertexArray(this.vrVao);
    const r2 = e2.createBuffer();
    return e2.bindBuffer(e2.ARRAY_BUFFER, r2), e2.bufferData(e2.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), e2.STATIC_DRAW), e2.enableVertexAttribArray(0), e2.vertexAttribPointer(0, 2, e2.FLOAT, false, 0, 0), e2.bindVertexArray(null), true;
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
      this.gl.drawingBufferColorSpace = t2, this.gl.unpackColorSpace = t2, i.info(ke, `Updated WebGL color space to ${t2} following HDR toggle`);
    } catch (e3) {
      i.warn(ke, "Failed to update drawingBufferColorSpace on the fly");
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
class MoviError extends Error {
  code;
  category;
  recoverable;
  constructor(e2) {
    super(Ae(e2.message), { cause: e2.cause }), this.name = "MoviError", this.code = e2.code, this.category = e2.category, this.recoverable = e2.recoverable ?? false, void 0 !== e2.cause && Object.defineProperty(this, "cause", { value: e2.cause, enumerable: false, configurable: true });
  }
  toJSON() {
    return { name: this.name, code: this.code, category: this.category, message: this.message, recoverable: this.recoverable };
  }
}
const _e = /\bhttps?:\/\/[^\s"'<>]+/giu, Te = /\b(authorization|cookie|set-cookie|token|session|signature|license(?:url|header)?|api[-_]?key)\b\s*[:=]\s*[^\s,;]+/giu;
function Ae(e2) {
  return e2.replace(Te, "$1=[redacted]").replace(_e, (e3) => Re(e3));
}
function Re(e2) {
  try {
    const t2 = new URL(e2);
    return t2.username = "", t2.password = "", t2.search = "", t2.hash = "", t2.toString();
  } catch {
    return "[redacted-url]";
  }
}
const xe = "MoviPlayer", Pe = /* @__PURE__ */ new Set(["ttf", "otf", "ttc", "woff", "woff2"]), Ce = /* @__PURE__ */ new Set();
class MoviPlayer extends EventEmitter {
  static _isMobileDevice = (() => {
    if ("undefined" == typeof navigator) return false;
    const e2 = navigator?.userAgentData;
    if (true === e2?.mobile) return true;
    const t2 = navigator.userAgent || "";
    return !!/Android|iPhone|iPod|Mobile|Opera Mini|IEMobile|BlackBerry/i.test(t2) || !!(/Macintosh/.test(t2) && (navigator.maxTouchPoints ?? 0) > 1);
  })();
  config;
  source = null;
  cache;
  demuxer = null;
  trackSelectionGeneration = 0;
  audioSelectionTail = Promise.resolve();
  audioSelectionCommit = false;
  audioTrackSwitchInProgress = false;
  streamBackend = "unknown";
  embeddedSubtitleFonts = null;
  nativeAudioEl = null;
  _nativeAudioObjectUrl = null;
  _nativeAudioLogicalUrl = null;
  _nativeAudioAutoplayBlocked = false;
  _prefetchThrottleTimer = null;
  _audioOnlyPrefetchPaused = false;
  _nativeAudioGateActive = false;
  _audioTracks = [];
  _activeAudioLang = "";
  static _hlsSubtitleCache = /* @__PURE__ */ new Map();
  audioDemuxer = null;
  audioSource = null;
  audioAnimationFrameId = null;
  audioDemuxInFlight = false;
  _splitAudioTrackId = -1;
  _splitAudioEof = false;
  _splitAudioStartTime = 0;
  _splitAudioPtsDelta = 0;
  _audioSwitchInProgress = false;
  _destroyed = false;
  _lastSplitAudioPts = 0;
  _subtitleTracks = [];
  _dashRenditions = [];
  _activeDashRendition = "";
  _autoQuality = false;
  _abrTimer = null;
  _abrSwitchInProgress = false;
  _lastThroughputBps = 0;
  _lastAbrSwitchAt = Number.NEGATIVE_INFINITY;
  _abrUpCandidate = "";
  _abrUpConfirms = 0;
  _abrPrimed = false;
  _lastBufferAhead = 0;
  _abrPenalizedBandwidth = 0;
  _abrPenaltyUntil = 0;
  static ABR_PENALTY_MS = 3e4;
  static ABR_DECODE_PENALTY_MS = 12e4;
  static ABR_PENALTY_MAX_MS = 3e5;
  static ABR_STRIKE_DECAY_MS = 18e4;
  _abrDrainStrikes = /* @__PURE__ */ new Map();
  _videoHoldingForKeyframe = false;
  _lastSeekAt = Number.NEGATIVE_INFINITY;
  _blackFrameWatchdog = null;
  _blackRecoverySeeks = 0;
  static MAX_BLACK_RECOVERY_SEEKS = 3;
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
      e2.on(t2, (e3) => this.emit(t2, e3));
    }), e2.trackManager.on("tracksChange", (e3) => {
      this.trackManager.setTracks(e3);
    });
  }
  publishProgrammaticState() {
    this.emit("surfaceChange", this.getSurface()), this.emit("diagnosticsChange", this.getRenderingDiagnostics()), this.emit("chaptersChange", this.getChapters());
  }
  videoDecoder;
  audioDecoder;
  subtitleDecoder = null;
  _customSubtitleRenderer = null;
  _subtitleRenderRAF = null;
  _subtitleDelaySec = 0;
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
  static SEEK_KEYFRAME_MIN_SCAN = 120;
  static KEYFRAME_SEEK_HARD_TIMEOUT = 2e4;
  seekKeyframeScanned = 0;
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
  constructor(t2) {
    super(), this.config = t2.drmConfig ? { ...t2, drm: true, licenseUrl: t2.drmConfig.licenseUrl, licenseHeaders: t2.drmConfig.licenseHeaders } : t2, this._audioOnly = !!t2.audioOnly, this.cache = new LRUCache(t2.cache?.maxSizeMB ?? 100), this.trackManager = new TrackManager(), this.clock = new Clock(), this.stateManager = new PlayerStateManager(), te(e.SILENT), this.audioDecoder = new MoviAudioDecoder(), this.audioRenderer = new AudioRenderer(), this.subtitleDecoder = new SubtitleDecoder();
    const r2 = "software" === t2.decoder;
    t2.canvas || "canvas" === t2.renderer ? t2.canvas ? (this.videoDecoder = new MoviVideoDecoder(r2), this.videoRenderer = new CanvasRenderer(t2.canvas), this.disableAudio ? (this.videoRenderer.setAudioTimeProvider(null, null), i.info(xe, "Video renderer running independently (audio disabled)")) : this.videoRenderer.setAudioTimeProvider(() => this.audioRenderer.getAudioClock(), () => this.audioRenderer.hasHealthyBuffer()), this.videoRenderer.setOnPerformanceDegrade(() => {
      this.videoDecoder?.setPerformanceSkip(true), this.abrDeviceDownshift();
    }), this.videoRenderer.setShouldMeasurePerf(() => !(this.isBackgrounded && !this.isPiPActive)), i.info(xe, `Video renderer initialized with canvas (forceSoftware: ${r2})`)) : (i.warn(xe, "Canvas renderer requested but no canvas element provided"), this.videoDecoder = new MoviVideoDecoder(r2)) : (this.videoDecoder = new MoviVideoDecoder(r2), i.info(xe, "Video renderer initialized with default (WebCodecs decoder only)")), this.disableAudio ? (this.clock.setAudioProvider(null), i.info(xe, "Clock running independently (audio disabled)")) : this.clock.setAudioProvider(this.audioRenderer), this.videoDecoder && (this.videoDecoder.setOnFrame((e2) => {
      if (!document.hidden || this.isPiPActive) if (this.videoRenderer && ("playing" === this.stateManager.getState() || this.waitingForVideoSync)) {
        const t3 = e2.timestamp / 1e6;
        if (-1 !== this.seekTargetTime && t3 < this.seekTargetTime) return void e2.close();
        -1 !== this.seekTargetTime && (this.waitingForVideoSync ? (i.debug(xe, `onFrame: frameTime=${t3.toFixed(3)}s >= seekTargetTime=${this.seekTargetTime.toFixed(3)}s, calling notifySeekCompletion`), this.notifySeekCompletion(t3)) : this.seekTargetTime = -1), this.videoRenderer.queueFrame(e2);
      } else e2.close();
      else e2.close();
    }), this.videoDecoder.setOnError((e2) => {
      i.error(xe, "Video decoder error", e2), this.emit("error", e2);
    }), this.videoDecoder.onKeyframeWaitChange = (e2) => {
      const t3 = this.stateManager.getState();
      this._videoHoldingForKeyframe = e2 && "playing" === t3, "seeking" === t3 || this.waitingForVideoSync || this._videoHoldingForKeyframe && i.debug(xe, "Decoder waiting for keyframe mid-playback — staying in playing (audio/clock continue, video holds until next keyframe)");
    }), this.audioDecoder.setOnData((e2) => this.renderDecodedAudio(e2)), this.audioDecoder.setOnPCM((e2) => {
      this.audioRenderer.renderPCM(e2);
    }), this.audioDecoder.setOnError((e2) => {
      i.error(xe, "Audio decoder error", e2), this.emit("error", e2);
    }), this.stateManager.on("change", (e2) => {
      this.emit("stateChange", e2);
    }), this.trackManager.on("audioTrackChange", async (e2) => {
      this.audioSelectionCommit || (e2 ? (await this.configureAudioTrack(e2), this.applyStreamDiscard()) : i.warn(xe, "Audio track change event received but track is null"));
    }), this.trackManager.on("tracksChange", (e2) => {
      this.emit("tracksChange", e2);
    }), i.info(xe, "Player created"), document.addEventListener("visibilitychange", this.handleVisibilityChange), window.addEventListener("online", this.handleNetworkOnline);
  }
  async load(e2) {
    if (!this.stateManager.is("idle") && !e2) throw new Error("Player must be idle to load");
    e2 && (this.config.source = e2, this.stateManager.getState()), this.stateManager.setState("loading"), this.emit("loadStart", void 0), this.lastBufferedTime = 0, this.bufferedRangeStart = 0, this.streamBackend = "unknown", this.embeddedSubtitleFonts = null, this.coverArt?.close?.(), this.coverArt = null, this.destroyPreviewPipeline();
    const t2 = this.config.source, r2 = !this.config.sourceAdapter && t2 && "url" === t2.type && t2.url && !I(t2.url) ? t2.url : null, s2 = r2?.toLowerCase() ?? "";
    if (r2 && (s2.includes(".m3u8") || s2.includes(".mpd") || s2.includes(".ism"))) {
      const e3 = s2.includes(".m3u8"), a2 = s2.includes(".mpd"), n2 = e3 ? "HLS" : s2.includes(".ism") ? "Smooth Streaming" : "DASH";
      if (this.trackManager.on("videoTrackChange", (e4) => {
        this.streamWrapper?.selectVideoTrack(e4 ? e4.id : -1);
      }), this.trackManager.on("audioTrackChange", (e4) => {
        e4 && this.streamWrapper?.selectAudioTrack(e4.id);
      }), this.trackManager.on("subtitleTrackChange", (e4) => {
        this.streamWrapper?.selectSubtitleTrack(e4 ? e4.id : null);
      }), this.config.forceStreamDemux && a2) try {
        const e4 = await k(r2, t2?.headers);
        if (e4) {
          i.info(xe, "forceStreamDemux: MSE failed at runtime — routing this DASH source through the FFmpeg demuxer"), this._dashRenditions = e4.videoTracks ?? [];
          const r3 = this.config.forceVideoRendition && this._dashRenditions.some((e5) => e5.url === this.config.forceVideoRendition) && this.config.forceVideoRendition || e4.videoUrl;
          this._activeDashRendition = r3, this.source = await this.createSource({ type: "url", url: r3, headers: t2?.headers }), e4.audioTracks?.length ? this.config.audioTracks = e4.audioTracks.map((e5) => ({ url: e5.url, lang: e5.lang, label: e5.label })) : e4.audioUrl && (this.config.audioSource = { type: "url", url: e4.audioUrl, headers: t2?.headers }), e4.subtitles?.length && (this.config.subtitleTracks = e4.subtitles.map((e5) => ({ url: e5.url, lang: e5.lang, label: e5.label, format: e5.format })));
        } else i.warn(xe, "forceStreamDemux: manifest is multi-segment — demuxer can't play it, retrying the stream path");
      } catch (e4) {
        i.warn(xe, "forceStreamDemux: DASH fallback probe failed", e4);
      }
      if (this.config.forceStreamDemux && e3 && !this.source) try {
        const e4 = await async function(e5, t3, r3) {
          try {
            const s3 = await R(e5, t3);
            if (!function(e6) {
              return e6.includes("#EXT-X-STREAM-INF");
            }(s3)) {
              const t4 = P(s3, e5);
              return 0 === t4.segments.length ? (i.warn(_, "media playlist has no segments"), null) : (i.info(_, `HLS fallback → ${t4.segments.length} ${t4.container} segments, ${t4.totalDuration.toFixed(1)}s (muxed)`), { ...t4 });
            }
            const { media: a3, variants: n3 } = function(e6, t4) {
              const i2 = e6.split(/\r?\n/), r4 = [], s4 = [];
              for (let e7 = 0; e7 < i2.length; e7++) {
                const a4 = i2[e7].trim();
                if (a4.startsWith("#EXT-X-MEDIA:")) {
                  const e8 = x(a4);
                  r4.push({ type: e8.TYPE || "", groupId: e8["GROUP-ID"] || "", name: e8.NAME || "", language: e8.LANGUAGE || "", uri: e8.URI ? A(e8.URI, t4) : void 0, isDefault: "YES" === e8.DEFAULT });
                } else if (a4.startsWith("#EXT-X-STREAM-INF:")) {
                  const r5 = x(a4), n4 = r5.CODECS || "", o3 = !!r5.RESOLUTION || /avc|hvc|hev|vp0?9|av01|mp4v|dvh/i.test(n4), h3 = /(\d+)x(\d+)/.exec(r5.RESOLUTION || ""), d3 = h3 ? parseInt(h3[2], 10) : 0;
                  let c3 = e7 + 1;
                  for (; c3 < i2.length && ("" === i2[c3].trim() || i2[c3].trim().startsWith("#")); ) c3++;
                  c3 < i2.length && s4.push({ bandwidth: parseInt(r5.BANDWIDTH || "0", 10), hasVideo: o3, height: d3, audioGroup: r5.AUDIO || void 0, subtitlesGroup: r5.SUBTITLES || void 0, url: A(i2[c3].trim(), t4) });
                }
              }
              return { media: r4, variants: s4 };
            }(s3, e5), o2 = n3.filter((e6) => e6.hasVideo), h2 = o2.length > 0 ? o2 : n3, d2 = h2.reduce((e6, t4) => t4.bandwidth > e6.bandwidth ? t4 : e6, h2[0]), c2 = r3 && h2.find((e6) => e6.url === r3) || d2;
            if (!c2) return i.warn(_, "master playlist has no usable variant"), null;
            const u2 = await B(c2.url, t3);
            if (!u2) return i.warn(_, "best variant media playlist unusable"), null;
            const l2 = { ...u2 };
            l2.selectedVariant = c2.url;
            const f2 = h2.filter((e6) => e6.audioGroup === c2.audioGroup), m2 = /* @__PURE__ */ new Map();
            for (const e6 of f2) m2.set(e6.height, (m2.get(e6.height) || 0) + 1);
            const g2 = /* @__PURE__ */ new Map();
            for (const e6 of f2) {
              const t4 = g2.get(e6.height);
              (!t4 || e6.bandwidth > t4.bandwidth) && g2.set(e6.height, e6);
            }
            const p2 = [...g2.values()].sort((e6, t4) => t4.height - e6.height || t4.bandwidth - e6.bandwidth);
            if (p2.length > 1 && (l2.videoTracks = p2.map((e6) => ({ url: e6.url, id: e6.url, bandwidth: e6.bandwidth, label: e6.height ? `${e6.height}p` : `${Math.round(e6.bandwidth / 1e3)} kbps` }))), c2.audioGroup) {
              const e6 = a3.filter((e7) => "AUDIO" === e7.type && e7.groupId === c2.audioGroup && e7.uri), i2 = /* @__PURE__ */ new Map();
              for (const t4 of e6) {
                const e7 = t4.language || "und", r5 = i2.get(e7);
                (!r5 || t4.isDefault && !r5.isDefault) && i2.set(e7, t4);
              }
              const r4 = (await Promise.all([...i2.values()].map(async (e7) => {
                const i3 = await B(e7.uri, t3);
                if (!i3) return null;
                const r5 = e7.language || "und";
                return { ...i3, lang: r5, label: T(r5) || e7.name || "Audio", isDefault: e7.isDefault };
              }))).filter((e7) => !!e7);
              r4.length > 0 && (l2.audioRenditions = r4);
            }
            if (c2.subtitlesGroup) {
              const e6 = a3.filter((e7) => "SUBTITLES" === e7.type && e7.groupId === c2.subtitlesGroup && e7.uri), i2 = /* @__PURE__ */ new Map();
              for (const t4 of e6) {
                const e7 = t4.language || "und", r5 = i2.get(e7);
                (!r5 || t4.isDefault && !r5.isDefault) && i2.set(e7, t4);
              }
              const r4 = (await Promise.all([...i2.values()].map(async (e7) => {
                const i3 = await B(e7.uri, t3);
                if (!i3) return null;
                const r5 = e7.language || "und";
                return { lang: r5, label: T(r5) || e7.name || "Subtitle", segments: i3.segments, isDefault: e7.isDefault };
              }))).filter((e7) => !!e7);
              r4.length > 0 && (l2.subtitleRenditions = r4);
            }
            return i.info(_, `HLS fallback → ${l2.segments.length} ${l2.container} video segments, ${l2.totalDuration.toFixed(1)}s${l2.audioRenditions ? `, ${l2.audioRenditions.length} audio lang(s)` : " (muxed audio)"}${l2.subtitleRenditions ? `, ${l2.subtitleRenditions.length} subtitle(s)` : ""}${l2.isLive ? " (live snapshot)" : ""}`), l2;
          } catch (e6) {
            return i.warn(_, "HLS fallback probe failed", e6), null;
          }
        }(r2, t2?.headers, this.config.forceVideoRendition);
        if (e4) {
          if (i.info(xe, `forceStreamDemux: routing HLS through the FFmpeg demuxer (${e4.segments.length} video segments)`), this._dashRenditions = e4.videoTracks ?? [], this._activeDashRendition = e4.selectedVariant ?? "", this.source = new SegmentStreamSource(e4.segments, e4.initSegment, r2, t2?.headers), e4.audioRenditions?.length) {
            const i2 = [...e4.audioRenditions].sort((e5, t3) => (t3.isDefault ? 1 : 0) - (e5.isDefault ? 1 : 0));
            this.config.audioTracks = i2.map((e5, i3) => {
              const s3 = `${r2}#audio-${e5.lang}-${i3}`;
              return { url: s3, lang: e5.lang, label: e5.label, adapter: new SegmentStreamSource(e5.segments, e5.initSegment, s3, t2?.headers) };
            });
          }
          if (e4.subtitleRenditions?.length) {
            let i2 = MoviPlayer._hlsSubtitleCache.get(r2);
            i2 || (i2 = await this.buildHlsSubtitleTracks(e4.subtitleRenditions, t2?.headers), i2.length && MoviPlayer._hlsSubtitleCache.set(r2, i2)), i2.length && (this.config.subtitleTracks = i2);
          }
        } else i.warn(xe, "forceStreamDemux: HLS playlist not demuxable, retrying the stream path");
      } catch (e4) {
        i.warn(xe, "forceStreamDemux: HLS fallback probe failed", e4);
      }
      if (!this.source && this.config.forceStreamEngine && (e3 || a2)) try {
        const e4 = this.config.forceStreamEngine, t3 = "hlsjs" === e4 ? new (await import("./HLSPlayerWrapper-MTqQQ6UU.js")).HLSPlayerWrapper(this.config) : new (await import("./DASHPlayerWrapper-DXdrsn-6.js")).DASHPlayerWrapper(this.config);
        return this.streamWrapper = t3, this.wireStreamWrapper(t3), i.info(xe, `forceStreamEngine: playing ${n2} via ${e4}`), await t3.load(), this.streamBackend = "hlsjs" === e4 ? "hls.js" : "dash.js", this.stateManager.setState("ready"), void this.publishProgrammaticState();
      } catch (e4) {
        i.warn(xe, `forceStreamEngine (${this.config.forceStreamEngine}) failed to load; falling through`, e4);
        try {
          this.streamWrapper?.destroy();
        } catch {
        }
        this.streamWrapper = null;
      }
      if (!this.source) try {
        const { ShakaPlayerWrapper: e4 } = await import("./ShakaPlayerWrapper-BVrG6zff.js"), t3 = new e4(this.config);
        return this.streamWrapper = t3, this.wireStreamWrapper(t3), i.info(xe, `Detected ${n2} stream, using ShakaPlayerWrapper`), await t3.load(), this.streamBackend = "shaka", this.stateManager.setState("ready"), void this.publishProgrammaticState();
      } catch (s3) {
        i.warn(xe, `Shaka failed on ${n2} stream`, s3);
        try {
          this.streamWrapper?.destroy();
        } catch {
        }
        if (this.streamWrapper = null, e3 || a2) try {
          const t3 = e3 ? new (await import("./HLSPlayerWrapper-MTqQQ6UU.js")).HLSPlayerWrapper(this.config) : new (await import("./DASHPlayerWrapper-DXdrsn-6.js")).DASHPlayerWrapper(this.config);
          return this.streamWrapper = t3, this.wireStreamWrapper(t3), i.info(xe, "Shaka failed; retrying with " + (e3 ? "hls.js" : "dash.js")), await t3.load(), this.streamBackend = e3 ? "hls.js" : "dash.js", this.stateManager.setState("ready"), i.info(xe, "Recovered via " + (e3 ? "hls.js" : "dash.js")), void this.publishProgrammaticState();
        } catch (t3) {
          i.warn(xe, (e3 ? "hls.js" : "dash.js") + " fallback also failed", t3);
          try {
            this.streamWrapper?.destroy();
          } catch {
          }
          this.streamWrapper = null;
        }
        let o2 = false;
        if (a2) try {
          const e4 = await k(r2, t2?.headers);
          e4 && (i.info(xe, "Falling back to the FFmpeg demuxer"), this.source = await this.createSource({ type: "url", url: e4.videoUrl, headers: t2?.headers }), e4.audioTracks?.length ? this.config.audioTracks = e4.audioTracks.map((e5) => ({ url: e5.url, lang: e5.lang, label: e5.label })) : e4.audioUrl && (this.config.audioSource = { type: "url", url: e4.audioUrl, headers: t2?.headers }), e4.subtitles?.length && (this.config.subtitleTracks = e4.subtitles.map((e5) => ({ url: e5.url, lang: e5.lang, label: e5.label, format: e5.format }))), o2 = true);
        } catch (e4) {
          i.warn(xe, "FFmpeg DASH fallback failed", e4);
        }
        if (!o2) throw this.stateManager.setState("error"), s3;
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
      this.fileSize = await this.source.getSize();
      const e3 = this.demuxer.getBindings();
      e3 && (this.videoDecoder.setBindings(e3), this.audioDecoder.setBindings(e3), this.subtitleDecoder && this.subtitleDecoder.setBindings(e3));
      let t3, r3 = null;
      if (this.config.audioTracks && this.config.audioTracks.length > 0 ? (this._audioTracks = [...this.config.audioTracks], this._activeAudioLang = this._audioTracks[0].lang, r3 = this._audioTracks[0].url, t3 = this._audioTracks[0].adapter, i.info(xe, `Multi-language audio: ${this._audioTracks.length} tracks, default=${this._activeAudioLang}`)) : "url" === this.config.audioSource?.type && this.config.audioSource.url && (r3 = this.config.audioSource.url), t3 ? await this.setupSplitAudio(t3) : r3 && await this.setupSplitAudio(r3), this._destroyed) return;
      this.config.subtitleTracks && this.config.subtitleTracks.length > 0 && (this._subtitleTracks = [...this.config.subtitleTracks], i.info(xe, `External subtitles: ${this._subtitleTracks.length} tracks`)), this.trackManager.setTracks(this.mediaInfo.tracks), this.extractCoverArt(), await this.configureDecoders(), this.startTime = this.mediaInfo.startTime || 0, this.seekKeyframeOffset = 0, this.clock.setDuration(this.mediaInfo.duration + this.startTime), this.clock.seek(this.startTime), this.emit("durationChange", this.mediaInfo.duration), await this.prebuffer(), this.stateManager.setState("ready"), this.emit("loadEnd", void 0), this.publishProgrammaticState(), this.previewsAllowed() && (this.previewInitPromise = this.initPreviewPipeline().catch((e4) => {
        i.warn(xe, "Preview pipeline init failed (non-critical)", e4), this.previewInitPromise = null;
      })), i.info(xe, `Loaded: duration=${this.mediaInfo.duration}s, tracks=${this.mediaInfo.tracks.length}`);
    } catch (e3) {
      throw this.stateManager.setState("error"), this.emit("error", e3), e3;
    }
  }
  async createSource(e2) {
    if ("file" === e2.type && e2.file) {
      const t2 = new FileSource(e2.file, this.cache);
      return MoviPlayer._isMobileDevice && t2.setFullFilePreload(false), t2.setOnRevoked((e3) => {
        i.error(xe, `File handle revoked: ${e3.reason}`), this.emit("filerevoked", e3);
      }), t2.setOnPreloadComplete(() => {
        this.emit("preloadcomplete", void 0);
      }), t2;
    }
    if ("encrypted" === e2.type && e2.encrypted) return new EncryptedHttpSource({ ...e2.encrypted, headers: e2.headers });
    if ("url" === e2.type && e2.url) {
      const t2 = I(e2.url);
      if (t2) return await t2({ url: e2.url, headers: e2.headers });
      const i2 = this.config.cache?.maxSizeMB, r2 = new HttpSource(e2.url, e2.headers, i2);
      return r2.setOnLinearMode(() => this.emit("linearmode", void 0)), r2;
    }
    throw new Error("Invalid source configuration");
  }
  async switchVideoRenditionInPlace(e2) {
    if (!this.demuxer || !this.videoDecoder) return false;
    if (e2 === this._activeDashRendition) return true;
    if (!this.audioDemuxer) return false;
    const t2 = this.config.source, r2 = (t2 && "url" in t2 && t2.url ? t2.url : "").toLowerCase().includes(".m3u8"), s2 = this.config.headers, a2 = this.getCurrentTime();
    let n2;
    try {
      if (r2) {
        const t3 = await async function(e3, t4) {
          try {
            const i2 = P(await R(e3, t4), e3);
            return i2.segments.length ? { segments: i2.segments, initSegment: i2.initSegment } : null;
          } catch (t5) {
            return i.warn(_, `variant load failed: ${e3}`, t5), null;
          }
        }(e2, s2);
        if (!t3) return false;
        n2 = new SegmentStreamSource(t3.segments, t3.initSegment, e2, s2);
      } else n2 = await this.createSource({ type: "url", url: e2, headers: s2 });
    } catch (e3) {
      return i.warn(xe, "in-place switch: new source build failed", e3), false;
    }
    const o2 = new Demuxer(n2, this.config.wasmBinary, true, this.config.assetBaseUrl);
    let h2;
    try {
      h2 = await o2.open();
    } catch (e3) {
      i.warn(xe, "in-place switch: new demuxer open failed", e3);
      try {
        o2.close();
      } catch {
      }
      try {
        n2.close();
      } catch {
      }
      return false;
    }
    const d2 = h2.tracks.find((e3) => "video" === e3.type);
    if (!d2) {
      try {
        o2.close();
      } catch {
      }
      try {
        n2.close();
      } catch {
      }
      return false;
    }
    const c2 = h2.startTime || 0;
    try {
      await o2.seek(a2 + c2);
    } catch (e3) {
      i.warn(xe, "in-place switch: new demuxer seek failed", e3);
      try {
        o2.close();
      } catch {
      }
      try {
        n2.close();
      } catch {
      }
      return false;
    }
    null !== this.animationFrameId && (cancelAnimationFrame(this.animationFrameId), this.animationFrameId = null), ++this.seekSessionId;
    let u2 = 0;
    for (; this.demuxInFlight && u2++ < 100; ) await new Promise((e3) => setTimeout(e3, 10));
    const l2 = this.demuxer, f2 = this.source;
    this.demuxer = o2, this.source = n2, this.startTime = c2;
    try {
      this.fileSize = await n2.getSize();
    } catch {
    }
    this.lastBufferedTime = 0, this.bufferedRangeStart = a2;
    const m2 = o2.getBindings();
    m2 && this.videoDecoder.setBindings(m2), this._activeDashRendition = e2, this.trackManager.setTracks([d2]), this.trackManager.selectVideoTrack(d2.id);
    try {
      await this.videoDecoder.flush();
    } catch {
    }
    this.videoRenderer?.clearQueue();
    const g2 = o2.getExtradata(d2.id) ?? void 0;
    await this.videoDecoder.configure(d2, g2, this.config.frameRate ?? 0), this.videoRenderer?.configure(d2.width, d2.height, d2.colorPrimaries, d2.colorTransfer, this.config.frameRate || d2.frameRate, d2.rotation ?? 0, d2.isHDR, d2.pixelFormat), this.seekKeyframeOffset = 0, this.processLoop();
    try {
      l2.close();
    } catch {
    }
    try {
      f2?.close();
    } catch {
    }
    return i.info(xe, `in-place quality switch → ${d2.width}x${d2.height}`), true;
  }
  setAutoQuality(e2) {
    this._autoQuality !== e2 && (this._autoQuality = e2, e2 ? (this._abrPrimed = false, this._abrPenalizedBandwidth = 0, this._abrPenaltyUntil = 0, this.abrTick(), this._abrTimer || (this._abrTimer = setInterval(() => this.abrTick(), 4e3))) : this._abrTimer && (clearInterval(this._abrTimer), this._abrTimer = null));
  }
  isAutoQuality() {
    return this._autoQuality;
  }
  async abrTick() {
    if (!this._autoQuality || this._abrSwitchInProgress || this._dashRenditions.length < 2 || !this.source || this.stateManager.is("seeking") || this.waitingForVideoSync) return;
    const e2 = this._dashRenditions.filter((e3) => (e3.bandwidth || 0) > 0).sort((e3, t3) => (t3.bandwidth || 0) - (e3.bandwidth || 0));
    if (e2.length < 2) return;
    const t2 = e2.findIndex((e3) => e3.url === this._activeDashRendition), r2 = performance.now(), s2 = r2 - this._lastAbrSwitchAt;
    if (t2 >= 0 && Ce.size > 0 && r2 - this._lastAbrSwitchAt > 3e3) {
      const s3 = e2[t2];
      if (null != s3.height && Ce.has(s3.height)) {
        const t3 = e2.find((e3) => null == e3.height || !Ce.has(e3.height));
        if (t3 && t3.url !== this._activeDashRendition) return i.info(xe, `ABR: started on decode-capped ${s3.height}p — correcting to ${t3.label || t3.bandwidth}`), void await this.abrCommit(t3.url, r2);
      }
    }
    const a2 = Math.max(0, this.getBufferedTime() - this.getCurrentTime()), n2 = this._lastBufferAhead > 0 && a2 < this._lastBufferAhead - 1.5;
    this._lastBufferAhead = a2;
    const o2 = r2 - this._lastSeekAt < 4e3, h2 = this.stateManager.is("buffering"), d2 = s2 > 12e3 && r2 - this._lastSeekAt > 12e3, c2 = this._videoHoldingForKeyframe || !!this.videoDecoder?.isRecentlyRecovering?.();
    if ((h2 || !c2 && (n2 && a2 < 6 || a2 < 4 && d2)) && !o2 && s2 > 5e3 && t2 >= 0 && t2 < e2.length - 1) {
      const o3 = this.source.getNetworkStats?.(), d3 = 8 * ((o3?.lastSpeed ?? o3?.currentSpeed ?? 0) || 0), c3 = 8 * (o3?.currentSpeed || 0), u3 = e2[t2].bandwidth || 0;
      if (!h2) {
        if (c3 <= 0) return;
        if (u3 > 0 && c3 >= 1.15 * u3) return;
      }
      let l3 = e2[e2.length - 1];
      for (let i2 = t2 + 1; i2 < e2.length; i2++) if ((e2[i2].bandwidth || 0) <= d3) {
        l3 = e2[i2];
        break;
      }
      const f3 = e2[t2].bandwidth || 0, m3 = this._abrDrainStrikes.get(f3), g3 = (m3 && r2 - m3.at < MoviPlayer.ABR_STRIKE_DECAY_MS ? m3.count : 0) + 1;
      return this._abrDrainStrikes.set(f3, { count: g3, at: r2 }), this._abrPenalizedBandwidth = f3, this._abrPenaltyUntil = Math.max(this._abrPenaltyUntil, r2 + Math.min(MoviPlayer.ABR_PENALTY_MS * 2 ** (g3 - 1), MoviPlayer.ABR_PENALTY_MAX_MS)), i.info(xe, `ABR downshift ${e2[t2].label || e2[t2].bandwidth} → ${l3.label || l3.bandwidth}: reason=${h2 ? "stall" : "bufferLow"}, bufferAhead=${a2.toFixed(1)}s, draining=${n2}, sinceSwitch=${(s2 / 1e3).toFixed(0)}s`), void await this.abrCommit(l3.url, r2);
    }
    if (s2 < 12e3) return;
    if (this.isBackgrounded && !this.isPiPActive) return;
    const u2 = this.source.getNetworkStats?.(), l2 = u2?.lastSpeed ?? u2?.currentSpeed ?? 0;
    l2 > 0 && (this._lastThroughputBps = this._lastThroughputBps > 0 ? 0.7 * this._lastThroughputBps + 0.3 * l2 : l2);
    const f2 = this._lastThroughputBps;
    if (f2 <= 0) return void (t2 > 0 && await this.abrCommit(e2[t2 - 1].url, r2));
    const m2 = 8 * f2;
    let g2 = 0.85 * m2;
    if (Ce.size > 0) {
      let t3 = Number.POSITIVE_INFINITY;
      for (const i2 of e2) null != i2.height && Ce.has(i2.height) && (t3 = Math.min(t3, i2.bandwidth || Number.POSITIVE_INFINITY));
      t3 < Number.POSITIVE_INFINITY && (g2 = Math.min(g2, t3 - 1));
    }
    r2 < this._abrPenaltyUntil && this._abrPenalizedBandwidth > 0 ? g2 = Math.min(g2, this._abrPenalizedBandwidth - 1) : 0 !== this._abrPenaltyUntil && r2 >= this._abrPenaltyUntil && (this._abrPenaltyUntil = 0, this._abrPenalizedBandwidth = 0);
    let p2 = e2[e2.length - 1];
    for (const t3 of e2) if ((t3.bandwidth || 0) <= g2) {
      p2 = t3;
      break;
    }
    const b2 = e2.indexOf(p2);
    if (t2 < 0) await this.abrCommit(p2.url, r2);
    else {
      if (b2 < t2) {
        this._abrUpCandidate === p2.url ? this._abrUpConfirms++ : (this._abrUpCandidate = p2.url, this._abrUpConfirms = 1);
        const s3 = this._abrPrimed ? 2 : 1;
        return void (this._abrUpConfirms >= s3 && (i.info(xe, `ABR upshift ${e2[t2].label || e2[t2].bandwidth} → ${p2.label || p2.bandwidth}: throughput=${(m2 / 1e6).toFixed(1)}Mbps affordable, bufferAhead=${a2.toFixed(1)}s`), await this.abrCommit(p2.url, r2)));
      }
      this._abrUpCandidate = "", this._abrUpConfirms = 0;
    }
  }
  async abrCommit(e2, t2) {
    this._lastAbrSwitchAt = t2, this._abrUpCandidate = "", this._abrUpConfirms = 0, this._abrPrimed = true, this._lastBufferAhead = 0, await this.abrSwitchTo(e2);
  }
  async abrSwitchTo(e2) {
    this._abrSwitchInProgress = true;
    try {
      await this.switchVideoRenditionInPlace(e2);
    } catch {
    } finally {
      this._abrSwitchInProgress = false;
    }
  }
  abrDeviceDownshift() {
    if (!this._autoQuality || this._abrSwitchInProgress) return;
    const e2 = this._dashRenditions.filter((e3) => (e3.bandwidth || 0) > 0).sort((e3, t3) => (t3.bandwidth || 0) - (e3.bandwidth || 0));
    if (e2.length < 2) return;
    const t2 = e2.findIndex((e3) => e3.url === this._activeDashRendition);
    if (t2 < 0 || t2 >= e2.length - 1) return;
    const r2 = performance.now();
    if (r2 - this._lastAbrSwitchAt < 3e3) return;
    const s2 = e2[t2 + 1], a2 = e2[t2], n2 = a2.bandwidth || 0;
    this._abrPenalizedBandwidth = n2;
    const o2 = a2.height ?? 0, h2 = o2 > 0;
    h2 && Ce.add(o2), this._abrPenaltyUntil = Math.max(this._abrPenaltyUntil, r2 + MoviPlayer.ABR_DECODE_PENALTY_MS), i.info(xe, `ABR: device decode-bound at ${a2.label || n2 + "bps"}${o2 ? " (" + o2 + "p)" : ""} — dropping to ${s2.label || s2.bandwidth + "bps"}${h2 ? ` and capping ${o2}p+ for this session` : " to relieve stutter"}`), this.abrCommit(s2.url, r2);
  }
  customSubtitleRendererFor(e2) {
    const t2 = this._customSubtitleRenderer;
    if (!t2 || !e2) return null;
    try {
      return false === t2.supports?.(e2) ? null : t2;
    } catch {
      return null;
    }
  }
  _syncCustomSubtitleRendererOwnership(e2) {
    const t2 = this.customSubtitleRendererFor(e2);
    return this.videoRenderer?.setExternalSubtitleRendererActive(null !== t2), t2;
  }
  async configureDecoders() {
    if (!this.demuxer) return;
    const e2 = this.trackManager.getActiveVideoTrack();
    if (e2 && this.videoDecoder) {
      const t3 = this.demuxer.getExtradata(e2.id) ?? void 0, r3 = this.config.frameRate ?? 0;
      if (await this.videoDecoder.configure(e2, t3, r3)) {
        if (i.info(xe, `Video decoder configured: ${e2.codec} ${e2.width}x${e2.height}`), this.videoRenderer) {
          const t4 = this.config.frameRate || e2.frameRate;
          this.videoRenderer.configure(e2.width, e2.height, e2.colorPrimaries, e2.colorTransfer, t4, e2.rotation ?? 0, e2.isHDR, e2.pixelFormat);
        }
      } else i.warn(xe, "Failed to configure video decoder");
    }
    const t2 = this.trackManager.getActiveAudioTrack();
    if (!t2 || this.disableAudio || this.audioDemuxer) t2 && this.disableAudio && i.info(xe, "Audio processing disabled for debugging");
    else {
      const e3 = this.demuxer.getExtradata(t2.id) ?? void 0;
      if (await this.audioDecoder.configure(t2, e3)) {
        if (i.info(xe, `Audio decoder configured: ${t2.codec} ${t2.sampleRate}Hz ${t2.channels}ch`), !this.disableAudio) {
          await this.audioRenderer.init();
          const e4 = t2.channels ?? 2, r3 = this.audioRenderer.getMaxChannelCount();
          e4 > 2 && r3 >= e4 ? (i.info(xe, `Multichannel passthrough: source ${e4}ch, destination supports ${r3}ch`), this.audioDecoder.setDownmix(false), this.audioRenderer.setOutputChannelCount(e4)) : e4 > 2 && i.info(xe, `Downmixing to stereo: source ${e4}ch, destination caps at ${r3}ch`);
        }
      } else i.warn(xe, "Failed to configure audio decoder");
    }
    this.applyStreamDiscard();
    const r2 = this.trackManager.getActiveSubtitleTrack(), s2 = this._syncCustomSubtitleRendererOwnership(r2);
    if (r2 && s2) await this._configureCustomSubtitleRenderer();
    else if (r2 && this.subtitleDecoder) {
      const e3 = this.demuxer.getExtradata(r2.id) ?? void 0;
      if (await this.subtitleDecoder.configure(r2, e3)) {
        i.info(xe, `Subtitle decoder configured: ${r2.codec} (${r2.subtitleType || "unknown"} type)`), this.subtitleDecoder.setOnCue((e5) => {
          i.debug(xe, `Subtitle cue received: "${e5.text?.substring(0, 30)}..." (${e5.start.toFixed(2)}s - ${e5.end.toFixed(2)}s)`), this.videoRenderer ? (i.debug(xe, "Setting subtitle cue on video renderer"), this.videoRenderer.setSubtitleCues([e5])) : i.warn(xe, "Subtitle cue received but videoRenderer is null!");
        });
        const e4 = this.demuxer.getBindings();
        e4 && this.subtitleDecoder.setBindings(e4, false);
      } else i.warn(xe, `Failed to configure subtitle decoder for track ${r2.id} (${r2.codec}) - subtitles will not be displayed`);
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
    const r2 = performance.now();
    let s2 = 0, a2 = 0, n2 = false;
    const o2 = () => !e2 || s2 >= MoviPlayer.PREBUFFER_VIDEO_FRAMES, h2 = () => !t2 || a2 >= MoviPlayer.PREBUFFER_AUDIO_SECONDS;
    for (; (!o2() || !h2()) && !n2 && this.pendingPrebufferPackets.length < MoviPlayer.PREBUFFER_MAX_PACKETS; ) {
      if (performance.now() - r2 > MoviPlayer.PREBUFFER_MAX_WALL_MS) {
        i.warn(xe, `Prebuffer wall-clock timeout after ${MoviPlayer.PREBUFFER_MAX_WALL_MS}ms`);
        break;
      }
      let o3;
      try {
        o3 = await this.demuxer.readPacket();
      } catch (e3) {
        i.warn(xe, "Prebuffer demux error, aborting prebuffer", e3);
        break;
      }
      if (!o3) {
        n2 = true;
        break;
      }
      if (this.pendingPrebufferPackets.push(o3), !this.trackManager.isActiveStream(o3.streamIndex)) continue;
      const h3 = this.trackManager.getActiveVideoTrack(), d2 = this.trackManager.getActiveAudioTrack();
      e2 && h3 && h3.id === o3.streamIndex ? s2++ : t2 && d2 && d2.id === o3.streamIndex && (a2 += o3.duration > 0 ? o3.duration : 0.02);
    }
    i.info(xe, `Prebuffer complete: stashed=${this.pendingPrebufferPackets.length}, video=${s2}, audio=${a2.toFixed(2)}s, eof=${n2}`);
  }
  async play() {
    if (this.streamWrapper) return this.streamWrapper.play();
    if (this.stopPauseBuffering(), !this.stateManager.canPlay()) return void i.warn(xe, "Cannot play in current state");
    if (this.nativeAudioOnlyPlayback()) return this.playNativeAudioOnly();
    const e2 = this.stateManager.getState();
    if ("buffering" === e2 || "seeking" === e2) return this.wasPlayingBeforeRebuffer = true, void i.info(xe, `Play requested during ${e2} — will resume when ready`);
    if ("ended" === e2 && this.demuxer) {
      i.debug(xe, "Replaying from beginning after ended state"), this.requestWakeLock(), this.wasPlayingBeforeSeek = true, this._playStartTime = performance.now();
      try {
        if (await this.seek(0, { suppressSpinner: true }), this.nativeAudioEl && this.nativeAudioEl.paused) {
          this.nativeAudioEl.playbackRate = this.clock.getPlaybackRate();
          try {
            await this.nativeAudioEl.play(), this._nativeAudioAutoplayBlocked = false;
          } catch (e3) {
            this._nativeAudioAutoplayBlocked = true, i.warn(xe, "Native audio replay blocked — rolling video muted", e3);
          }
        }
      } catch (e3) {
        this.suppressSeekSpinner = false, this.wasPlayingBeforeSeek = false, i.warn(xe, "Failed to seek to start on replay", e3);
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
        this.suppressSeekSpinner = false, this.wasPlayingBeforeSeek = false, i.warn(xe, "First-play seek failed", e4);
      }
      return;
    }
    if (0 === this._playStartTime && this.demuxer) {
      const e3 = this.clock.getTime();
      await this.videoDecoder.flush(), await this.audioDecoder.flush(), this.videoRenderer && this.videoRenderer.clearQueue(), this.audioRenderer.reset();
      try {
        await this.demuxer.seek(e3);
      } catch (e4) {
        return i.error(xe, "Demuxer seek on first play failed", e4), this.wasPlayingBeforeSeek = false, this.suppressSeekSpinner = false, this.stateManager.setState("error"), void this.emit("error", e4 instanceof Error ? e4 : new Error(String(e4)));
      }
      this.seekTargetTime = e3, this.disableAudio || await this.audioRenderer.play(), this.clock.seek(e3), this.pendingAudioPackets = [], this.pendingPrebufferPackets = [], this.eofReached = false, this.eofSince = 0;
    } else this.disableAudio ? i.debug(xe, "Audio playback skipped (disabled for debugging)") : await this.audioRenderer.play(), this.videoRenderer && this.videoRenderer.dropStaleFrames(this.clock.getTime(), 0.2);
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
        i.warn(xe, "Native audio autoplay blocked — rolling video muted (tap to unmute)"), this._nativeAudioAutoplayBlocked = true;
      });
    }
    this.clock.start(), this._playStartTime = performance.now();
    const r2 = this.stateManager.getState();
    return "ready" !== r2 && "paused" !== r2 && "seeking" !== r2 ? (i.error(xe, `Cannot transition to playing from state: ${r2}`), void this.clock.pause()) : this.stateManager.setState("playing") ? (null !== this.animationFrameId && (cancelAnimationFrame(this.animationFrameId), this.animationFrameId = null), "undefined" == typeof document || "hidden" !== document.visibilityState || this.isPiPActive || (this.isBackgrounded = true, this.videoRenderer && (this.videoRenderer.stopPresentationLoop(), this.videoRenderer.clearQueue()), (this.trackManager.getActiveAudioTrack() || this.audioDemuxer) && !this.disableAudio && this.startBackgroundTimer()), this._audioOnly && this.audioDemuxer || this.processLoop(), this.startAudioLoop(), void i.info(xe, "Playing")) : (i.error(xe, `Failed to transition to playing from state: ${r2}`), void this.clock.pause());
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
      return i.warn(xe, "Native audio autoplay blocked — staying paused for user gesture"), void ("paused" !== this.stateManager.getState() && this.stateManager.setState("paused"));
    }
    this.clock.start(), this._playStartTime = performance.now();
    const t2 = this.stateManager.getState();
    "ready" !== t2 && "paused" !== t2 && "seeking" !== t2 || this.stateManager.setState("playing"), i.info(xe, "Playing (native-audio-only)");
  }
  pause() {
    if (this.streamWrapper) this.streamWrapper.pause();
    else if (this.stateManager.canPause()) {
      if ("buffering" === this.stateManager.getState()) return this.wasPlayingBeforeRebuffer = false, this.disableAudio || this.audioRenderer.pause(), this.nativeAudioEl && this.nativeAudioEl.pause(), this.videoRenderer && this.videoRenderer.stopPresentationLoop(), this.stateManager.setState("paused"), null !== this.animationFrameId && (cancelAnimationFrame(this.animationFrameId), this.animationFrameId = null), this.stopBackgroundTimer(), this.startPauseBuffering(), void i.info(xe, "Paused during buffering");
      this.releaseWakeLock(), this.clock.pause(), this.disableAudio || this.audioRenderer.pause(), this.nativeAudioEl && this.nativeAudioEl.pause(), this.videoRenderer && this.videoRenderer.stopPresentationLoop(), this.stateManager.setState("paused"), null !== this.animationFrameId && (cancelAnimationFrame(this.animationFrameId), this.animationFrameId = null), this.stopBackgroundTimer(), this.startPauseBuffering(), i.info(xe, "Paused");
    } else i.warn(xe, "Cannot pause in current state");
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
  cancelBlackFrameWatchdog() {
    null !== this._blackFrameWatchdog && (clearTimeout(this._blackFrameWatchdog), this._blackFrameWatchdog = null);
  }
  armBlackFrameWatchdog(e2) {
    this.cancelBlackFrameWatchdog();
    const t2 = this.seekSessionId, r2 = this.videoRenderer?.getStats?.().framesPresented ?? 0;
    this._blackFrameWatchdog = setTimeout(() => {
      if (this._blackFrameWatchdog = null, this.seekSessionId !== t2) return;
      if ((this.videoRenderer?.getStats?.().framesPresented ?? 0) > r2) return void (this._blackRecoverySeeks = 0);
      const s2 = this.stateManager.getState();
      if ("playing" !== s2 && "buffering" !== s2 && "seeking" !== s2) return;
      const a2 = Math.max(e2, this.clock.getTime());
      if (this.getBufferedTime() - a2 < 0.5) return void this.armBlackFrameWatchdog(e2);
      if (this._blackRecoverySeeks >= MoviPlayer.MAX_BLACK_RECOVERY_SEEKS) return void i.warn(xe, "Black-frame recovery exhausted — no decodable frame after nudges");
      this._blackRecoverySeeks++;
      const n2 = 2 + 4 * (this._blackRecoverySeeks - 1), o2 = this.getDuration() || 0, h2 = Math.max(e2, this.clock.getTime());
      let d2 = h2 + n2;
      o2 > 1 && d2 > o2 - 0.5 && (d2 = Math.max(0, o2 - 1)), i.info(xe, `Black-frame recovery #${this._blackRecoverySeeks}: no frame at ${h2.toFixed(1)}s — nudging to ${d2.toFixed(1)}s`), this.seek(d2);
    }, 2500);
  }
  notifySeekCompletion(e2, t2 = false) {
    if (i.debug(xe, `notifySeekCompletion called: time=${e2.toFixed(3)}s, waitingForVideoSync=${this.waitingForVideoSync}, seekTargetTime=${this.seekTargetTime.toFixed(3)}s, forced=${t2}`), !this.waitingForVideoSync) return void i.warn(xe, "notifySeekCompletion: early return (waitingForVideoSync=false)");
    if (this.seekArmedSessionId !== this.seekSessionId) return void i.warn(xe, `notifySeekCompletion: stale session ${this.seekArmedSessionId} != ${this.seekSessionId} — ignoring`);
    t2 || (this.cancelBlackFrameWatchdog(), this._blackRecoverySeeks = 0);
    const r2 = !!this.videoRenderer && 0 === this.videoRenderer.getQueueSize(), s2 = t2 && r2 && !!this.trackManager.getActiveVideoTrack(), a2 = this.seekTargetTime;
    if (this.seekTargetTime = -1, this.waitingForVideoSync = false, this.seekingToKeyframe = false, this.suppressSeekSpinner = false, a2 >= 0 && (this.seekKeyframeOffset = Math.max(0, e2 - a2)), i.debug(xe, `Seek completion at ${e2.toFixed(3)}s (target: ${a2.toFixed(3)}s)`), e2 > a2 + 0.01) {
      const t3 = 0.2;
      let r3 = e2, s3 = false;
      if (this.pendingAudioPackets.length > 0) {
        const a3 = Math.min(...this.pendingAudioPackets.map((e3) => e3.timestamp));
        if (a3 < e2) {
          const n3 = e2 - a3;
          n3 <= t3 ? (r3 = a3, s3 = true, i.debug(xe, `Video arrived late (${e2.toFixed(3)}s), syncing clock to earliest audio (${r3.toFixed(3)}s) — gap ${(1e3 * n3).toFixed(0)}ms`)) : i.info(xe, `Video-audio gap ${(1e3 * n3).toFixed(0)}ms exceeds ${1e3 * t3}ms; syncing clock to video (${e2.toFixed(3)}s) and dropping stale audio before that`);
        } else i.debug(xe, `Stream jumped ahead. Syncing clock to video at ${r3.toFixed(3)}s.`);
      } else i.debug(xe, `Stream jumped ahead. Syncing clock to ${r3.toFixed(3)}s.`);
      this.clock.seek(r3);
      const n2 = s3 ? a2 - 0.01 : r3 - 0.01;
      this.pendingAudioPackets = this.pendingAudioPackets.filter((e3) => e3.timestamp >= n2);
    }
    if ((this.wasPlayingBeforeSeek || this.wasPlayingBeforeRebuffer) && s2) i.info(xe, "Seek forced-complete with no video frame yet — buffering until first frame"), this.wasPlayingBeforeSeek = false, this.wasPlayingBeforeRebuffer = true, this._bufferingEntryTime = performance.now(), this.stateManager.setState("buffering"), this.activeAudioNeedsColdPrime() && this.beginAudioPrime(), 0 === this._playStartTime && (this._playStartTime = performance.now()), this.armBlackFrameWatchdog(a2);
    else if (this.wasPlayingBeforeSeek || this.wasPlayingBeforeRebuffer) {
      if (this.wasPlayingBeforeSeek = false, this.wasPlayingBeforeRebuffer = false, 0 === this._playStartTime && (this._playStartTime = performance.now()), this.activeAudioNeedsColdPrime()) return this.beginAudioPrime(), this.wasPlayingBeforeRebuffer = true, this._bufferingEntryTime = performance.now(), this.stateManager.setState("buffering"), this.clock.pause(), this.videoRenderer && this.videoRenderer.stopPresentationLoop(), void i.info(xe, "Audio cold-prime: buffering until cushion");
      i.info(xe, "Resuming playback after seek"), this.stateManager.setState("playing"), 0 === this._playStartTime && (this._playStartTime = performance.now()), this.clock.start(), this.disableAudio || this.audioRenderer.isAudioPlaying() || this.audioRenderer.play(), this.pendingAudioPackets.length > 0 && (i.debug(xe, `Flushing ${this.pendingAudioPackets.length} buffered audio packets after seek sync`), this.submitAudioPackets(this.pendingAudioPackets), this.pendingAudioPackets = []);
    } else i.info(xe, "Seek completed in paused state"), this.wasPlayingBeforeSeek = false, this.stateManager.setState("paused"), this.pendingAudioPackets = [], this.pendingPrebufferPackets = [], this.startPauseBuffering();
    this.emit("seeked", Math.max(0, e2 - this.startTime));
  }
  activeAudioNeedsColdPrime() {
    const e2 = (this.trackManager.getActiveAudioTrack()?.codec ?? "").toLowerCase();
    return !this.disableAudio && this.audioDecoder.usesSoftware && /truehd|mlp|dts|dca/.test(e2);
  }
  bindAudioDecoder(e2) {
    e2.setOnData((e3) => this.renderDecodedAudio(e3)), e2.setOnPCM((e3) => this.audioRenderer.renderPCM(e3)), e2.setOnError((e3) => {
      i.error(xe, "Audio decoder error", e3), this.emit("error", e3);
    });
  }
  async configureAudioTrack(e2) {
    if (!this.demuxer) return !!this.streamWrapper;
    if (this.disableAudio) return false;
    this.audioTrackSwitchInProgress = true, this.pendingAudioPackets = [], this._audioBatchPending = [];
    try {
      const t2 = this.audioDecoder, i2 = new MoviAudioDecoder(), r2 = this.demuxer.getBindings();
      r2 && i2.setBindings(r2), this.bindAudioDecoder(i2);
      const s2 = this.demuxer.getExtradata(e2.id) ?? void 0;
      if (!await i2.configure(e2, s2)) return i2.close(), false;
      this.audioDecoder = i2, t2.close();
      const a2 = e2.channels ?? 2, n2 = this.audioRenderer.getMaxChannelCount();
      return a2 > 2 && n2 >= a2 ? (this.audioDecoder.setDownmix(false), this.audioRenderer.setOutputChannelCount(a2)) : (this.audioDecoder.setDownmix(true), this.audioRenderer.setOutputChannelCount(2)), true;
    } catch (e3) {
      return i.warn(xe, "Audio track decoder configuration failed", e3), false;
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
    if (this.seekSessionId !== t2) return void i.debug(xe, "ProcessLoop aborted: new seek started");
    if (!this.disableAudio && this.audioRenderer.isRebuffering()) "playing" === this.stateManager.getState() && (this.wasPlayingBeforeRebuffer = true, this._bufferingEntryTime = performance.now(), this.stateManager.setState("buffering"), this.clock.pause(), this.videoRenderer && this.videoRenderer.stopPresentationLoop(), i.debug(xe, "Entered buffering state for playback rate change"));
    else if ("buffering" === this.stateManager.getState() && this.wasPlayingBeforeRebuffer) {
      const e3 = !!this.trackManager.getActiveAudioTrack(), t3 = !this.disableAudio && this.audioDecoder.usesSoftware, r3 = this._primingAudio || t3 ? 2 : 0.1, s3 = this.disableAudio || !e3 || this.audioRenderer.getBufferedDuration() > r3, a3 = !this.videoRenderer || this.videoRenderer.getQueueSize() > 0, n3 = performance.now() - this._bufferingEntryTime, o3 = 1500, h3 = this._primingAudio ? 4e3 : 3e3;
      n3 >= o3 && (s3 && a3 || s3 && n3 >= 3e3 || n3 >= h3) && (this._primingAudio = false, this.stateManager.setState("paused"), this.wasPlayingBeforeRebuffer = false, this.audioRenderer && this.audioRenderer.resumeFromBuffering(), i.info(xe, "Buffers refilled, resuming playback"), this.play().catch((e4) => {
        i.error(xe, "Failed to resume playback after rebuffering:", e4);
      }));
    }
    if (this.source instanceof FileSource && this.mediaInfo) {
      const e3 = this.clock.getTime(), t3 = this.mediaInfo.duration + this.startTime;
      t3 > 0 && this.source.updatePreloadPosition(e3, t3);
    }
    this.emit("timeUpdate", this.getCurrentTime());
    const r2 = this.mediaInfo && this.clock.getTime() >= this.mediaInfo.duration + this.startTime - 3, s2 = this.clock.getPlaybackRate(), a2 = this.mediaInfo?.videoFrameRate ?? 30, n2 = s2 < 0.99 && a2 >= 50 ? 2e3 : 500, o2 = this._playStartTime > 0 && performance.now() - this._playStartTime < 3e3, h2 = !!this.videoDecoder && this.videoDecoder.isRecentlyRecovering();
    if ("playing" !== this.stateManager.getState() || this.eofReached || this.waitingForVideoSync || r2 || this.isBackgrounded || o2) this._stallStartTime = 0;
    else {
      const e3 = !!this.videoRenderer && 0 === this.videoRenderer.getQueueSize(), t3 = !(!this.trackManager.getActiveAudioTrack() && !this.audioDemuxer || this.disableAudio), r3 = !t3 || this.audioRenderer.getBufferedDuration() < 0.05, s3 = this._foregroundRecoveryAt > 0 && performance.now() - this._foregroundRecoveryAt < 3e3, a3 = t3 && !s3 && this.audioRenderer.isUnderrunning();
      if (e3 && r3 && !h2 || a3) {
        const t4 = a3 && !e3 ? 200 : n2;
        this._stallStartTime ? performance.now() - this._stallStartTime > t4 && (i.warn(xe, a3 ? "Stall detected: audio underrunning for 500ms (decode behind realtime), entering buffering state" : "Stall detected: buffers empty for 500ms, entering buffering state"), this.wasPlayingBeforeRebuffer = true, this._bufferingEntryTime = performance.now(), this.stateManager.setState("buffering"), this.clock.pause(), this.audioRenderer && this.audioRenderer.suspendForBuffering(), this.videoRenderer && this.videoRenderer.stopPresentationLoop(), this._stallStartTime = 0) : this._stallStartTime = performance.now();
      } else this._stallStartTime = 0;
    }
    if ("playing" === this.stateManager.getState() && !this.disableAudio && !this.muted && !o2 && Math.abs(this.clock.getPlaybackRate() - 1) < 0.01) {
      const e3 = this.audioRenderer.getAudioClock(), t3 = this.videoRenderer ? this.videoRenderer.currentTime ?? -1 : -1;
      if (e3 >= 0 && t3 > 0) {
        const r3 = t3 - e3, s3 = performance.now() - this._lastDesyncSeekTime;
        if (r3 > 0.5 && s3 > 5e3 && this.audioRenderer.getMaxScheduledMediaTime() < t3 - 0.1) {
          const s4 = Math.max(t3, this.getCurrentTime());
          i.warn(xe, `Audio desync detected: video=${t3.toFixed(2)}s, audio=${e3.toFixed(2)}s, behind=${(1e3 * r3).toFixed(0)}ms — pulling audio forward to ${s4.toFixed(2)}s`), this._lastDesyncSeekTime = performance.now(), this.seek(s4).catch(() => {
          });
        }
      }
    }
    if (this.demuxInFlight) {
      const e3 = performance.now() - this.demuxInFlightStartTime;
      if (!(e3 > MoviPlayer.DEMUX_TIMEOUT)) return;
      i.warn(xe, `Demux operation timeout after ${e3}ms, resetting flag`), this.demuxInFlight = false;
    }
    if (this.eofReached) {
      const e3 = this.clock.getTime(), t3 = this.mediaInfo?.duration ?? 0, r3 = e3 >= t3 + this.startTime - 0.5 || 0 === t3;
      if (this.trackManager?.getActiveAudioTrack() && !this.disableAudio) {
        const r4 = 0 === this.videoDecoder.queueSize && 0 === this.audioDecoder.queueSize, s3 = this.audioRenderer.getMaxScheduledMediaTime(), a3 = t3 > 0 && e3 >= t3 + this.startTime - 0.25, n3 = s3 > 0 && e3 >= s3 - 0.1 || a3, o3 = this.videoRenderer?.getHeadFrameTime() ?? -1, h3 = !this.videoRenderer || 0 === this.videoRenderer.getQueueSize() || r4 && s3 > 0 && o3 >= s3 - 0.05;
        if (r4 && h3 && n3 || 0 === t3) return void this.handleEnded();
        if (n3 && this.eofSince > 0 && performance.now() - this.eofSince > 750) return i.warn(xe, "EOF watchdog: audio played out but pipeline never fully drained; forcing ended"), void this.handleEnded();
      } else if (r3) return void this.handleEnded();
      return;
    }
    const d2 = this.isSoftwareDecoding(), c2 = performance.now() - this.seekTime, u2 = this.justSeeked && c2 < MoviPlayer.POST_SEEK_THROTTLE_MS, l2 = this.disableAudio ? 0 : this.audioRenderer.getBufferedDuration(), f2 = this.videoRenderer?.getQueueSize() ?? 0, m2 = d2 ? 1e3 : u2 || this.waitingForVideoSync ? 60 : 30, g2 = d2 ? 500 : u2 || this.waitingForVideoSync ? 40 : 20, p2 = Math.max(0.25, this.clock.getPlaybackRate()), b2 = p2 < 1 ? 1 / p2 : Math.min(2, p2), v2 = (d2 ? 5 : u2 ? 1.5 : 2) * b2, S2 = this.trackManager.getActiveVideoTrack(), y2 = (S2?.width ?? 0) * (S2?.height ?? 0), w2 = Math.max(15, Math.min(120, S2?.frameRate ?? 30)), k2 = y2 >= 33177600, _2 = y2 >= 8294400, T2 = MoviPlayer._isMobileDevice;
    let A2;
    if (k2) A2 = T2 ? u2 ? 8 : 12 : u2 ? 12 : 16;
    else if (_2) A2 = T2 ? u2 ? 8 : 16 : u2 ? 24 : 48;
    else if (T2) {
      const e3 = u2 ? 400 : 800;
      A2 = Math.max(12, Math.round(w2 * e3 / 1e3));
    } else A2 = u2 ? 20 : 100;
    const R2 = Math.round((d2 ? 60 : A2) * b2), x2 = this.isBackgrounded && !this.isPiPActive || "buffering" === e2;
    this.videoDecoder.queueSize > m2 && 0 === f2 ? this._decoderStuckSince ? performance.now() - this._decoderStuckSince > 5e3 && (i.warn(xe, `Video decoder stuck for 5s (queue=${this.videoDecoder.queueSize}, output=0), flushing`), this.videoDecoder.flush().catch(() => {
    }), this._decoderStuckSince = 0) : this._decoderStuckSince = performance.now() : this._decoderStuckSince = 0;
    const P2 = Math.abs(p2 - 1) > 0.01, C2 = !this.disableAudio && l2 < 0.1, E2 = this.videoDecoder.queueSize > m2, F2 = !x2 && f2 > R2, D2 = P2 && !this.muted && (F2 || E2) && C2, B2 = !this.disableAudio && !this.audioDemuxer;
    if (!x2 && !D2 && this.videoDecoder.queueSize > m2 || B2 && this.audioDecoder.queueSize > g2 || B2 && l2 > v2 || !x2 && !D2 && f2 > R2) this.waitingForVideoSync && (this.videoDecoder.queueSize > m2 || f2 > R2) && i.debug(xe, `Backpressure during sync: videoDecoder=${this.videoDecoder.queueSize}, videoBuffered=${f2}`);
    else try {
      if (this.seekSessionId !== t2) return void i.debug(xe, "ProcessLoop aborted before demux: new seek started");
      this.demuxInFlight = true, this.demuxInFlightStartTime = performance.now();
      const e3 = this.trackManager?.getActiveVideoTrack()?.frameRate ?? 30, r3 = Math.max(1, Math.ceil(e3 / 30));
      let s3 = 20 * r3;
      if (u2) s3 = 5 * r3, !this.disableAudio && !!this.trackManager?.getActiveAudioTrack() && l2 < 1 && (s3 = 160 * r3), i.debug(xe, `Post-seek throttling: using burst size ${s3}`);
      else {
        this.justSeeked && c2 >= MoviPlayer.POST_SEEK_THROTTLE_MS && (this.justSeeked = false, i.debug(xe, "Post-seek throttle period ended"));
        const t3 = this.videoRenderer?.getQueueSize() ?? 0, a4 = this.audioRenderer.getBufferedDuration(), n4 = !this.disableAudio && this.audioDecoder.usesSoftware;
        (t3 < 30 || a4 < (d2 || n4 ? 2 : e3 >= 60 ? 1 : 0.5)) && (s3 = !o2 || this.muted || this.disableAudio || d2 || n4 ? 160 * r3 : 20 * r3);
      }
      const a3 = !!this.trackManager?.getActiveAudioTrack() && !this.disableAudio, n3 = 60;
      this.videoDecoder.isWaitingForKeyframe && (s3 = Math.min(s3, 5));
      for (let e4 = 0; e4 < s3 && !(!a3 && this.videoRenderer && this.videoRenderer.getQueueSize() > n3); e4++) {
        if (!D2 && this.videoDecoder.queueSize > m2 || !this.disableAudio && this.audioDecoder.queueSize > g2) {
          u2 && i.debug(xe, `Post-seek: queue full (video: ${this.videoDecoder.queueSize}, audio: ${this.audioDecoder.queueSize}), pausing burst`);
          break;
        }
        if (e4 > 0 && e4 % (u2 ? 2 * r3 : d2 ? 3 : 20 * r3) == 0) {
          const e5 = new MessageChannel();
          if (await new Promise((t3) => {
            e5.port1.onmessage = t3, e5.port2.postMessage(null);
          }), this.seekSessionId !== t2) return i.debug(xe, "ProcessLoop aborted during packet read: new seek started"), void (this.demuxInFlight = false);
        }
        let s4;
        if (this.pendingPrebufferPackets.length > 0) s4 = this.pendingPrebufferPackets.shift();
        else if (s4 = await this.demuxer.readPacket(), this.seekSessionId !== t2) return i.debug(xe, "ProcessLoop aborted after readPacket: new seek started"), void (this.demuxInFlight = false);
        if (!s4) {
          this.eofReached || (this.eofSince = performance.now()), this.eofReached = true, this.seekingToKeyframe && (this.seekingToKeyframe = false, i.warn(xe, "EOF reached before finding keyframe after seek")), this.waitingForVideoSync && (i.warn(xe, "EOF reached while waiting for seek sync, forcing completion"), this.notifySeekCompletion(this.seekTargetTime, true)), i.debug(xe, "EOF reached");
          break;
        }
        if (this.trackManager.isActiveStream(s4.streamIndex)) {
          const e5 = this.trackManager.getActiveVideoTrack(), t3 = this.trackManager.getActiveAudioTrack();
          if (e5 && e5.id === s4.streamIndex) {
            if (this._audioOnly) continue;
            if (this.isBackgrounded && !this.isPiPActive) continue;
            if (D2 && !s4.keyframe) {
              this.videoChainBrokenUntilKeyframe = true;
              continue;
            }
            if (this.videoChainBrokenUntilKeyframe) {
              if (!s4.keyframe) continue;
              this.videoChainBrokenUntilKeyframe = false;
            }
            if (this.seekingToKeyframe) {
              const e6 = performance.now() - this.seekingToKeyframeStartTime;
              this.seekKeyframeScanned++;
              const t4 = e6 > MoviPlayer.SEEK_IDR_WAIT_MS, r4 = s4.keyframe && -1 !== this.seekTargetTime && s4.timestamp <= this.seekTargetTime + 0.05, a4 = s4.keyframe && (s4.isIdr || t4 || r4), n4 = this.seekKeyframeScanned < MoviPlayer.SEEK_KEYFRAME_MIN_SCAN;
              if (e6 > (n4 ? MoviPlayer.KEYFRAME_SEEK_HARD_TIMEOUT : MoviPlayer.KEYFRAME_SEEK_TIMEOUT)) i.warn(xe, `Keyframe seek timeout after ${e6.toFixed(0)}ms (scanned=${this.seekKeyframeScanned}, starved=${n4}), accepting any frame`), this.seekingToKeyframe = false;
              else {
                if (!a4) {
                  s4.keyframe && this.seekCraSeen++;
                  continue;
                }
                this.seekingToKeyframe = false, i.debug(xe, `Found ${s4.isIdr ? "IDR" : "CRA"} keyframe after seek (craSkipped=${this.seekCraSeen}), resuming normal playback`), this.seekCraSeen = 0;
              }
            }
            this.videoDecoder && this.videoDecoder.decode(s4.data, s4.timestamp, s4.keyframe, s4.dts, s4.isIdr, s4.isRasl, s4.disposable);
          } else if (t3 && t3.id === s4.streamIndex) {
            if (!this.disableAudio && !this.audioTrackSwitchInProgress) {
              if (-1 !== this.seekTargetTime && s4.timestamp < this.seekTargetTime) continue;
              if (this.waitingForVideoSync && this.trackManager.getActiveVideoTrack()) {
                this.pendingAudioPackets.push(s4);
                continue;
              }
              -1 !== this.seekTargetTime && s4.timestamp >= this.seekTargetTime && (i.debug(xe, `Audio reached seek target: ${s4.timestamp.toFixed(3)}s (target: ${this.seekTargetTime.toFixed(3)}s)`), this.trackManager.getActiveVideoTrack() || this.notifySeekCompletion(s4.timestamp)), this.audioDecoder.canBatch() ? this._audioBatchPending.push(s4) : this.audioDecoder.decode(s4.data, s4.timestamp, s4.keyframe);
            }
          } else {
            const e6 = this.trackManager.getActiveSubtitleTrack();
            if (e6 && e6.id === s4.streamIndex && this.customSubtitleRendererFor(e6)) try {
              this.customSubtitleRendererFor(e6)?.pushPacket(s4);
            } catch (e7) {
              i.error(xe, "Custom subtitle renderer pushPacket failed", e7);
            }
            else if (e6 && e6.id === s4.streamIndex && this.subtitleDecoder) {
              let e7 = s4.duration;
              (!e7 || e7 <= 0) && (e7 = 0, i.debug(xe, `Subtitle packet has no duration, will use fallback: timestamp=${s4.timestamp.toFixed(3)}s`)), i.debug(xe, `Processing subtitle packet: stream=${s4.streamIndex}, size=${s4.data.length}, timestamp=${s4.timestamp.toFixed(3)}s, duration=${e7 > 0 ? e7.toFixed(3) : "fallback"}s`), this.subtitleDecoder.decode(s4.data, s4.timestamp, s4.keyframe, e7).catch((e8) => {
                i.error(xe, "Subtitle decode error", e8);
              });
            }
          }
        }
      }
    } catch (e3) {
      i.error(xe, "Demux error", e3);
      const t3 = e3.message || "", r3 = /out of bounds memory access|memory access out of bounds|RuntimeError|Aborted\(\)/i.test(t3), s3 = r3 || t3.includes("Invalid packet size") || t3.includes("Invalid typed array length") || t3.includes("State may be corrupted"), a3 = /^HTTP \d{3}/.test(t3) || t3.includes("Access denied") || t3.includes("Authentication required") || t3.includes("Video not found") || t3.includes("Failed to fetch video resource") || t3.includes("Stream failed after") || t3.includes("Server does not support range requests");
      if (r3 && K(), s3 || a3) return i.error(xe, a3 ? `Fatal source error, pausing playback: ${t3}` : "Fatal demux error detected, pausing playback"), this.pause(), this.stateManager.setState("error"), void this.emit("error", a3 ? e3 instanceof Error ? e3 : new Error(t3) : new Error("Playback error: corrupt data stream"));
    } finally {
      if (this.demuxInFlight = false, this._audioBatchPending.length > 0) {
        const e3 = this._audioBatchPending;
        this._audioBatchPending = [], this.submitAudioPackets(e3);
      }
    }
  };
  handleEnded() {
    if (i.info(xe, "Playback ended"), this.releaseWakeLock(), this.clock.pause(), this.disableAudio || this.audioRenderer.pause(), this.videoRenderer && this.videoRenderer.stopPresentationLoop(), null !== this.animationFrameId && (cancelAnimationFrame(this.animationFrameId), this.animationFrameId = null), this.mediaInfo) {
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
      let r3 = 0;
      for (; this.audioDemuxInFlight && r3++ < 200; ) await new Promise((e3) => setTimeout(e3, 5));
      this.audioDecoder.flush(), this.audioRenderer.reset();
      try {
        await this.audioDemuxer.seek(t3 + this._splitAudioStartTime);
      } catch (e3) {
        i.warn(xe, `Split audio-only seek failed: ${e3?.message ?? e3}`);
      }
      return this._splitAudioEof = false, this._lastSplitAudioPts = t3, this.seekTargetTime = -1, this.clock.seek(t3 + this.startTime), this.seekKeyframeOffset = 0, this.eofReached = false, this.eofSince = 0, (this.wasPlayingBeforeSeek || this.wasPlayingBeforeRebuffer || this.stateManager.is("playing") || this.stateManager.is("buffering")) && (this.wasPlayingBeforeSeek = false, this.wasPlayingBeforeRebuffer = false, 0 === this._playStartTime && (this._playStartTime = performance.now()), this.stateManager.is("playing") || this.stateManager.setState("playing"), this.clock.start(), this.disableAudio || this.audioRenderer.isAudioPlaying() || this.audioRenderer.play(), this.startAudioLoop()), this.emit("seeking", t3), this.emit("timeUpdate", t3), void this.emit("seeked", t3);
    }
    if (this.suppressSeekSpinner = t2?.suppressSpinner ?? false, t2?.preservePlaying) {
      const e3 = this.stateManager.getState();
      "paused" !== e3 && "ended" !== e3 && (this.wasPlayingBeforeSeek = true);
    }
    const r2 = this.stateManager.getState();
    if (i.info(xe, `seek(${e2.toFixed(2)}): state=${r2}, waitingForVideoSync=${this.waitingForVideoSync}, demuxInFlight=${this.demuxInFlight}, seekSessionId=${this.seekSessionId}`), !this.stateManager.canSeek()) return void i.warn(xe, `seek blocked: canSeek=false, state=${r2}`);
    if (!this.demuxer) throw new Error("Demuxer not initialized");
    this.stopPauseBuffering(), "seeking" === r2 || this.wasPlayingBeforeSeek || (this.wasPlayingBeforeSeek = "playing" === r2 || "buffering" === r2 && this.wasPlayingBeforeRebuffer), this.clock.pause(), this.seekKeyframeOffset = 0;
    const s2 = ++this.seekSessionId;
    this._lastSeekAt = performance.now(), this.stateManager.setState("seeking"), this.emit("seeking", e2), this.bufferedRangeStart = e2, null !== this.animationFrameId && (cancelAnimationFrame(this.animationFrameId), this.animationFrameId = null);
    try {
      if (this.demuxInFlight) {
        let e3 = 0;
        for (; this.demuxInFlight && e3 < 100; ) {
          if (this.seekSessionId !== s2) return void (this.demuxInFlight = false);
          await new Promise((e4) => setTimeout(e4, 10)), e3++;
        }
      }
      if (this.seekSessionId !== s2) return;
      if (i.info(xe, "seek: flushing video decoder..."), await this.videoDecoder.flush(), i.info(xe, "seek: flushing audio decoder..."), await this.audioDecoder.flush(), this._customSubtitleRenderer) try {
        this._customSubtitleRenderer.clear();
      } catch {
      }
      if (this._audioBatchPending = [], i.info(xe, "seek: decoders flushed"), this.videoRenderer && this.videoRenderer.clearQueue(), this.audioRenderer.reset(), this.seekSessionId !== s2) return;
      if (this.source?.hintSeek?.(), i.info(xe, `seek: demuxer.seek(${(e2 + this.startTime).toFixed(2)}) starting...`), await this.demuxer.seek(e2 + this.startTime), this.audioDemuxer) {
        this.stopAudioLoop();
        let t4 = 0;
        for (; this.audioDemuxInFlight && t4++ < 200; ) await new Promise((e3) => setTimeout(e3, 5));
        try {
          await this.audioDemuxer.seek(e2 + this._splitAudioStartTime);
        } catch (e3) {
          i.warn(xe, `Split audio seek failed: ${e3?.message ?? e3}`);
        }
        this._splitAudioEof = false, this._lastSplitAudioPts = e2;
      }
      i.info(xe, "seek: demuxer.seek done"), this.clock.seek(e2 + this.startTime), this.eofReached = false, this.eofSince = 0, this.lastBufferedTime = 0, this.bufferedRangeStart = e2, this.seekingToKeyframe = true, this.seekingToKeyframeStartTime = performance.now(), this.seekKeyframeScanned = 0, this.seekCraSeen = 0, this.videoChainBrokenUntilKeyframe = false, this.seekTargetTime = e2 + this.startTime, this.waitingForVideoSync = true, this.seekArmedSessionId = s2, this.pendingAudioPackets = [], this.pendingPrebufferPackets = [];
      const t3 = this.isSeekTargetBuffered(e2);
      if (t3 ? (this.justSeeked = false, i.info(xe, "Seek within buffered range — skipping post-seek throttle")) : this.justSeeked = true, this.seekTime = performance.now(), this.seekSessionId !== s2) return;
      i.info(xe, `seek: starting processLoop, waitingForVideoSync=${this.waitingForVideoSync}, state=${this.stateManager.getState()}`), this.processLoop(), this.startAudioLoop(), this.videoRenderer && this.videoRenderer.startPresentationLoop();
      const r3 = t3 ? 1500 : 3e3, a2 = setTimeout(() => {
        this.seekSessionId === s2 && this.waitingForVideoSync && (i.warn(xe, `Seek timeout after ${r3}ms, forcing completion at ${e2}s`), this.notifySeekCompletion(e2 + this.startTime, true));
      }, r3), n2 = () => {
        clearTimeout(a2), this.off("seeked", n2);
      };
      this.on("seeked", n2), i.info(xe, `Seek initiated to ${e2}s, waiting for sync...`);
    } catch (e3) {
      throw this.seekingToKeyframe = false, this.seekSessionId === s2 && (this.stateManager.setState("error"), this.emit("error", e3)), e3;
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
          i.debug(xe, "Waiting for existing preview initialization...");
          try {
            await this.previewInitPromise;
          } catch {
            this.previewInitPromise = null;
          }
        }
        if (!this.thumbnailBindings) {
          if (++this.previewInitAttempts > 3) return this.previewInitGaveUp = true, i.warn(xe, "Thumbnail pipeline init failed repeatedly — disabling previews."), null;
          i.debug(xe, "Initializing thumbnail pipeline (retry)..."), this.previewInitPromise = this.initPreviewPipeline();
          try {
            await this.previewInitPromise;
          } catch {
            this.previewInitPromise = null;
          }
        }
      }
      if (!this.thumbnailBindings || !this.thumbnailRenderer) return i.warn(xe, "Thumbnail bindings or renderer not available"), null;
      this.thumbnailRenderer.setProjection(t2 ?? null);
      const r2 = await this.thumbnailBindings.readKeyframe(e2);
      if (i.debug(xe, `Thumbnail readKeyframe(${e2.toFixed(2)}s): size=${r2}`), r2 <= 0) return -6 !== r2 && i.warn(xe, `Thumbnail read failed or empty: ${r2}`), null;
      const s2 = this.thumbnailBindings.getPacketPts(), a2 = this.thumbnailBindings.getPacketData();
      if (i.debug(xe, `Thumbnail packet: pts=${s2.toFixed(2)}s, ptr=${a2}, size=${r2}`), !a2) return i.warn(xe, "Thumbnail packet data pointer is null"), null;
      const n2 = this.thumbnailBindings.getPacketDataCopy(r2);
      if (!n2) return i.warn(xe, "Failed to copy thumbnail packet data"), null;
      let o2 = false;
      try {
        o2 = await this.thumbnailRenderer.decodeAndRender(n2, s2);
      } catch (e3) {
        i.warn(xe, "Thumbnail WebCodecs decode failed", e3);
      }
      if (!o2) try {
        const e3 = this.trackManager.getActiveVideoTrack();
        let t3 = 320, r3 = 180;
        e3 && (t3 = e3.width, r3 = e3.height);
        const s3 = this.thumbnailBindings.decodeCurrentPacket(t3, r3);
        s3 && s3.length > 0 ? (this.thumbnailRenderer.render(s3, t3, r3), this.thumbnailBindings.clearBuffer(), o2 = true) : i.warn(xe, "Software thumbnail decoder returned no data");
      } catch (e3) {
        i.error(xe, "Software thumbnail fallback exception", e3);
      }
      if (o2) {
        const e3 = this.thumbnailRenderer.getCanvas();
        if ("toBlob" in e3) return new Promise((t3) => {
          e3.toBlob((e4) => t3(e4), "image/jpeg", 0.7);
        });
        if ("convertToBlob" in e3) return await e3.convertToBlob({ type: "image/jpeg", quality: 0.7 });
      }
      return null;
    } catch (e3) {
      return i.warn(xe, "Preview generation failed", e3), null;
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
    i.debug(xe, "Initializing thumbnail pipeline...");
    const e2 = await X({ wasmBinary: this.config.wasmBinary });
    i.debug(xe, "Isolated WASM module loaded for thumbnails");
    const t2 = this.config.source, r2 = t2 && "string" != typeof t2 && "encrypted" === t2.type;
    if (this.source instanceof SegmentStreamSource) this.thumbnailSource = this.source;
    else if (this.config.sourceAdapter && this.source) this.thumbnailSource = this.source;
    else if (r2 && this.source) this.thumbnailSource = this.source;
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
    const s2 = await this.thumbnailSource.getSize();
    i.debug(xe, `Thumbnail source created, file size: ${s2}`), this.thumbnailBindings = new ThumbnailBindings(e2);
    const a2 = { read: async (e3, t3) => {
      if (!this.thumbnailSource) throw new Error("No thumbnail source");
      const i2 = await this.thumbnailSource.read(e3, t3);
      return new Uint8Array(i2);
    }, getSize: async () => {
      if (!this.thumbnailSource) throw new Error("No thumbnail source");
      return this.thumbnailSource.getSize();
    } };
    this.thumbnailBindings.setDataSource(a2);
    const n2 = await this.thumbnailBindings.create(s2);
    if (i.debug(xe, `Thumbnail context create result: ${n2}`), !n2) throw new Error("Failed to create thumbnail context");
    const o2 = await this.thumbnailBindings.open();
    if (i.debug(xe, `Thumbnail context open result: ${o2}`), !o2) throw new Error("Failed to open thumbnail media");
    this.thumbnailRenderer = new ThumbnailRenderer();
    let h2 = this.trackManager.getActiveVideoTrack();
    if (!h2) {
      const e3 = this.trackManager.getVideoTracks();
      e3.length > 0 && (h2 = e3[0]);
    }
    if (h2) {
      this.thumbnailRenderer.initialize({ width: h2.width, height: h2.height, rotation: h2.rotation || 0, colorPrimaries: h2.colorPrimaries, colorTransfer: h2.colorTransfer, hdrEnabled: this.thumbnailHDREnabled });
      const e3 = this.demuxer?.getExtradata(h2.id) ?? null;
      i.debug(xe, `Configuring thumbnail decoder with track: ${h2.codec}, extradata: ${e3 ? e3.length : 0} bytes`), await this.thumbnailRenderer.configureDecoder(h2.codec, e3, h2.width, h2.height, h2.profile, h2.level) || i.warn(xe, "Failed to configure thumbnail VideoDecoder, will use software fallback");
    } else i.warn(xe, "No video track found for thumbnail renderer");
    i.debug(xe, "Thumbnail pipeline initialized successfully");
  }
  destroyPreviewPipeline() {
    this.thumbnailBindings && (this.thumbnailBindings.destroy(), this.thumbnailBindings = null), this.thumbnailRenderer && (this.thumbnailRenderer.destroy(), this.thumbnailRenderer = null), this.thumbnailSource = null;
  }
  getTracks() {
    return this.trackManager.getTracks();
  }
  getDashRenditions() {
    return this._dashRenditions;
  }
  getActiveDashRendition() {
    return this._activeDashRendition;
  }
  setDashRenditions(e2, t2) {
    this._dashRenditions = e2, t2 && !this._activeDashRendition && (this._activeDashRendition = t2);
  }
  getNetworkThroughputBps() {
    return this._lastThroughputBps;
  }
  seedNetworkThroughputBps(e2) {
    e2 > 0 && this._lastThroughputBps <= 0 && (this._lastThroughputBps = e2);
  }
  sampleThroughput() {
    const e2 = this.source.getNetworkStats?.(), t2 = e2?.lastSpeed ?? e2?.currentSpeed ?? 0;
    t2 > 0 && (this._lastThroughputBps = this._lastThroughputBps > 0 ? 0.7 * this._lastThroughputBps + 0.3 * t2 : t2);
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
    if (this._destroyed) return null;
    const e2 = this.streamWrapper?.getVideoElement() ?? null;
    return e2 ? { kind: "video", element: e2, reason: this.config.drm ? "drm" : "adaptive" } : this.config.canvas ? { kind: "canvas", element: this.config.canvas, reason: this.streamWrapper ? "adaptive" : "progressive" } : null;
  }
  getRenderingDiagnostics() {
    const e2 = this.getActiveVideoTrack(), t2 = e2?.colorTransfer?.toLowerCase() ?? "", i2 = t2.includes("2084") || t2.includes("pq") ? "hdr10" : t2.includes("hlg") || t2.includes("arib") ? "hlg" : e2?.isHDR ? "hdr10" : e2 ? "sdr" : "unknown", r2 = this.getSurface(), s2 = "unknown" !== this.streamBackend, a2 = this.videoRenderer?.getStats();
    return { backend: "unknown" !== this.streamBackend ? this.streamBackend : this.mediaInfo ? "progressive-wasm" : "unknown", container: this.mediaInfo?.formatName, decoder: s2 ? "native" : this.mediaInfo ? this.videoDecoder.isSoftware ? "wasm" : "webcodecs" : "none", renderer: "video" === r2?.kind ? "native-video" : "canvas" === r2?.kind ? "canvas" : "none", sourceDynamicRange: i2, outputDynamicRange: "unknown", outputVerification: "unknown", requestedColorSpace: e2?.colorSpace, appliedColorSpace: a2?.colorSpace, toneMapping: "unknown" };
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
      const o3 = this.streamWrapper ? this.streamWrapper.selectAudioTrack(n3.id) : await this.configureAudioTrack(n3), h3 = s2();
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
    const n2 = null === e2.trackId ? null : this.getSubtitleTracks().find((t3) => t3.id === e2.trackId) ?? null;
    if (null !== e2.trackId && !n2) return this.trackSelectionFailure(e2, r2, "TRACK_NOT_FOUND", "track", "The requested subtitle track is unavailable.", "not-found");
    const o2 = await this.selectSubtitleTrack(n2?.id ?? null), h2 = s2();
    if (h2) return h2;
    if (!o2) return this.trackManager.selectSubtitleTrack(r2?.id ?? null), this.trackSelectionFailure(e2, r2, "TRACK_SWITCH_FAILED", "track", "The subtitle decoder rejected the requested track.");
    const d2 = { kind: "subtitle", status: null === n2 ? "disabled" : r2?.id === n2.id ? "unchanged" : "selected", requestedTrackId: e2.trackId, activeTrack: n2 };
    return this.emit("trackChange", d2), d2;
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
    i.info(xe, `selectSubtitleTrack called: trackId=${e2}`);
    const t2 = this.trackManager.selectSubtitleTrack(e2);
    i.debug(xe, `TrackManager.selectSubtitleTrack returned: ${t2}`);
    const r2 = this._syncCustomSubtitleRendererOwnership(this.trackManager.getActiveSubtitleTrack());
    if (this.prefetchedSubtitleStream !== e2 && (this.prefetchedSubtitleStream = null), null === e2) {
      if (i.info(xe, "Disabling subtitles"), this.videoRenderer && (this.videoRenderer.clearSubtitles(), i.debug(xe, "Cleared subtitles from video renderer")), this.subtitleDecoder && (this.subtitleDecoder.close(), i.debug(xe, "Closed subtitle decoder")), this._customSubtitleRenderer) try {
        this._customSubtitleRenderer.clear();
      } catch {
      }
      return t2;
    }
    if (r2 && !this.streamWrapper) {
      try {
        r2.clear();
      } catch {
      }
      return await this._configureCustomSubtitleRenderer(), t2;
    }
    if (this.streamWrapper) return t2;
    if (this.demuxer && this.subtitleDecoder) {
      const t3 = this.trackManager.getActiveSubtitleTrack();
      if (i.info(xe, `Configuring subtitle decoder for track: id=${t3?.id}, codec=${t3?.codec}, type=${t3?.subtitleType}`), t3) {
        i.debug(xe, "Closing previous subtitle decoder before switching tracks"), this.subtitleDecoder.close();
        const e3 = this.demuxer.getBindings();
        e3 ? (i.debug(xe, "Setting bindings on subtitle decoder"), this.subtitleDecoder.setBindings(e3, false)) : i.warn(xe, "No bindings available from demuxer!");
        const r3 = this.demuxer.getExtradata(t3.id) ?? void 0;
        i.debug(xe, `Configuring subtitle decoder: extradata=${r3?.length || 0} bytes`);
        const s2 = await this.subtitleDecoder.configure(t3, r3);
        if (i.info(xe, `Subtitle decoder configuration result: ${s2}`), !s2) return i.warn(xe, `Could not configure subtitle decoder for track ${t3.id} (${t3.codec}) - codec may not be available in WASM build`), this.trackManager.selectSubtitleTrack(-1), false;
        i.debug(xe, "Setting up subtitle cue callback"), this.subtitleDecoder.setOnCue((e4) => {
          i.debug(xe, `Subtitle cue callback triggered: "${e4.text?.substring(0, 30)}..." (${e4.start.toFixed(2)}s - ${e4.end.toFixed(2)}s)`), this.videoRenderer ? (i.debug(xe, "Setting subtitle cue on video renderer"), this.videoRenderer.setSubtitleCues([e4])) : i.warn(xe, "Subtitle cue callback: videoRenderer is null!");
        }), this.videoRenderer && 0 !== this.videoRenderer.getSubtitleDelay() && this.prefetchActiveSubtitleStream();
      } else i.warn(xe, `No active subtitle track found after selecting trackId ${e2}`);
    } else i.warn(xe, `Cannot configure subtitle decoder: demuxer=${!!this.demuxer}, subtitleDecoder=${!!this.subtitleDecoder}`);
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
    this.streamWrapper ? this.streamWrapper.resizeCanvas(e2, t2) : this.videoRenderer && this.videoRenderer.resize(e2, t2), this.ensureWakeLock();
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
    return this.streamWrapper ? this.streamWrapper.rotateVideo?.() ?? 0 : this.videoRenderer ? this.videoRenderer.rotate90() : 0;
  }
  getCurrentVideoFrame() {
    return this.videoRenderer?.getCurrentFrame() ?? null;
  }
  getVideoRotation() {
    return this.streamWrapper ? this.streamWrapper.getVideoRotation?.() ?? 0 : this.videoRenderer?.getRotation() ?? 0;
  }
  setVideoRotation(e2) {
    this.videoRenderer?.setManualRotation(e2), this.streamWrapper?.setVideoRotation?.(e2);
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
    this.clock.setPlaybackRate(e2), this.audioRenderer && this.audioRenderer.setPlaybackRate(e2), this.videoRenderer && this.videoRenderer.setPlaybackRate(e2), this.videoDecoder && this.videoDecoder.setPlaybackRate(e2), this.nativeAudioEl && (this.nativeAudioEl.playbackRate = e2), !i2 || this.isLinearPlayback() || this.hasHealthyAudioAnchor() || this.seek(t2, { suppressSpinner: true, preservePlaying: true }).catch(() => {
    });
  }
  hasHealthyAudioAnchor() {
    return !!this.nativeAudioEl || this.clock.isSyncedToAudio() && !!this.audioRenderer && this.audioRenderer.getAudioClock() >= 0 && this.audioRenderer.hasHealthyBuffer();
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
      i.error(xe, `Native audio element error: code=${t2?.code ?? "?"} message="${t2?.message ?? ""}" networkState=${e2.networkState} readyState=${e2.readyState} src=${this._nativeAudioLogicalUrl ?? e2.currentSrc}`), this.setSourcePrefetchThrottle(false);
    }), e2.addEventListener("stalled", () => {
      i.warn(xe, `Native audio stalled: networkState=${e2.networkState} readyState=${e2.readyState} currentTime=${e2.currentTime.toFixed(2)}`), e2.readyState < 3 && !e2.paused && this.setSourcePrefetchThrottle(true);
    }), e2.addEventListener("waiting", () => {
      i.debug(xe, `Native audio waiting (buffering): readyState=${e2.readyState} currentTime=${e2.currentTime.toFixed(2)}`), e2.readyState < 3 && !e2.paused && this.setSourcePrefetchThrottle(true);
    }), e2.addEventListener("canplay", () => {
      this.setSourcePrefetchThrottle(false);
    }), e2.addEventListener("pause", () => {
      this.setSourcePrefetchThrottle(false);
    }), e2.addEventListener("playing", () => {
      i.info(xe, `Native audio playing: currentTime=${e2.currentTime.toFixed(2)} readyState=${e2.readyState}`), e2.readyState >= 3 && this.setSourcePrefetchThrottle(false);
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
  async buildHlsSubtitleTracks(e2, t2) {
    const r2 = [];
    for (const s2 of e2) try {
      const e3 = D(await Promise.all(s2.segments.map((e4) => fetch(e4.url, t2 ? { headers: t2 } : void 0).then((e5) => e5.ok ? e5.text() : "").catch(() => ""))));
      if (!e3.includes("-->")) continue;
      const i2 = URL.createObjectURL(new Blob([e3], { type: "text/vtt" }));
      r2.push({ url: i2, lang: s2.lang, label: s2.label, format: "vtt" });
    } catch (e3) {
      i.warn(xe, `HLS subtitle build failed for ${s2.lang}`, e3);
    }
    return r2;
  }
  async setupSplitAudio(e2) {
    try {
      "string" == typeof e2 ? (i.info(xe, `Split audio (WASM) setup: ${e2}`), this.audioSource = await this.createSource({ type: "url", url: e2, headers: this.config.headers })) : (i.info(xe, `Split audio (WASM) setup: ${e2.getKey()}`), this.audioSource = e2), this.audioDemuxer = new Demuxer(this.audioSource, this.config.wasmBinary, true, this.config.assetBaseUrl);
      const t2 = await this.audioDemuxer.open(), r2 = this.audioDemuxer.getAudioTracks()[0];
      if (!r2) return i.warn(xe, "Split audio: no audio track in separate source"), this.audioDemuxer = null, void (this.audioSource = null);
      this._splitAudioTrackId = r2.id, this._splitAudioStartTime = t2?.startTime || 0, this._splitAudioPtsDelta = (this.mediaInfo?.startTime || 0) - this._splitAudioStartTime, 0 !== this._splitAudioPtsDelta && i.info(xe, `Split audio PTS baseline ${this._splitAudioStartTime.toFixed(3)}s vs video ${(this.mediaInfo?.startTime || 0).toFixed(3)}s — shifting audio by ${this._splitAudioPtsDelta.toFixed(3)}s`);
      const s2 = this.audioDemuxer.getExtradata(r2.id) ?? void 0, a2 = this.audioDemuxer.getBindings();
      if (a2 && this.audioDecoder.setBindings(a2), !await this.audioDecoder.configure(r2, s2)) return i.warn(xe, "Split audio: decoder configure failed"), this.audioDemuxer = null, void (this.audioSource = null);
      await this.audioRenderer.init();
      const n2 = r2.channels ?? 2, o2 = this.audioRenderer.getMaxChannelCount();
      n2 > 2 && o2 >= n2 ? (this.audioDecoder.setDownmix(false), this.audioRenderer.setOutputChannelCount(n2)) : (this.audioDecoder.setDownmix(true), this.audioRenderer.setOutputChannelCount(2)), this._splitAudioEof = false, this._lastSplitAudioPts = 0;
      const h2 = this.getCurrentTime();
      if (h2 > 0.5) try {
        await this.audioDemuxer.seek(h2 + this._splitAudioStartTime), i.info(xe, `Split audio synced to playhead ${h2.toFixed(1)}s after setup`);
      } catch {
      }
      i.info(xe, `Split audio (WASM) ready: ${r2.codec} ${r2.sampleRate}Hz ${r2.channels}ch`);
    } catch (e3) {
      i.error(xe, `Split audio setup failed: ${e3?.message ?? e3}`), this.audioDemuxer = null, this.audioSource = null;
    }
  }
  async pumpSplitAudio() {
    if (!this.audioDemuxer || this._splitAudioEof) return false;
    const e2 = this.stateManager.getState();
    if ("playing" !== e2 && "buffering" !== e2 && !this.waitingForVideoSync) return false;
    if (this.audioDemuxInFlight) return true;
    if (!this._audioOnly && this.waitingForVideoSync && this.trackManager.getActiveVideoTrack()) return true;
    const t2 = Math.max(0.25, this.clock.getPlaybackRate()), r2 = 5 * (t2 < 1 ? 1 / t2 : Math.min(2, t2)), s2 = this.muted ? 0.25 : r2, a2 = Math.max(0, this.clock.getTime() - this.startTime);
    if (this._lastSplitAudioPts - a2 > s2) return true;
    this.audioDemuxInFlight = true;
    try {
      let e3 = 0;
      for (; e3 < 24 && !this._splitAudioEof && this.audioDecoder.queueSize <= 40 && this.audioRenderer.getBufferedDuration() < r2 && this._lastSplitAudioPts - a2 <= s2; ) {
        const t3 = await this.audioDemuxer.readPacket();
        if (e3++, !t3) {
          this._splitAudioEof = true;
          break;
        }
        if (-1 !== this._splitAudioTrackId && t3.streamIndex !== this._splitAudioTrackId) continue;
        const i2 = t3.timestamp + this._splitAudioPtsDelta;
        -1 !== this.seekTargetTime && i2 < this.seekTargetTime || (this.audioDecoder.decode(t3.data, i2, t3.keyframe), this._lastSplitAudioPts = i2 - this.startTime);
      }
    } catch (e3) {
      i.warn(xe, `Split audio demux error: ${e3?.message ?? e3}`);
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
    i.info(xe, `External audio URL: ${e2}`);
    try {
      fetch(e2, { method: "GET", headers: { Range: "bytes=0-1", ...this.config.headers || {} } }).then((e3) => {
        i.info(xe, `External audio probe: status=${e3.status} type="${e3.headers.get("content-type") ?? "?"}" accept-ranges="${e3.headers.get("accept-ranges") ?? "?"}" content-range="${e3.headers.get("content-range") ?? "?"}" content-length="${e3.headers.get("content-length") ?? "?"}"`);
      }).catch((e3) => {
        i.warn(xe, `External audio probe failed (CORS/network?): ${e3?.message ?? e3}`);
      });
    } catch (e3) {
      i.warn(xe, `External audio probe threw: ${e3?.message ?? e3}`);
    }
  }
  setupNativeAudio(e2) {
    this.probeNativeAudioUrl(e2);
    const t2 = this.nativeAudioEl && !this.nativeAudioEl.paused, r2 = this.nativeAudioEl?.currentTime ?? 0, s2 = !!this.nativeAudioEl && (this._nativeAudioLogicalUrl === e2 || this.nativeAudioEl.src === e2);
    this.nativeAudioEl || (this.nativeAudioEl = new Audio(), this.wireNativeAudioEvents(this.nativeAudioEl)), this.nativeAudioEl.preload = "auto", this.nativeAudioEl.volume = this.muted ? 0 : Math.min(1, this.audioRenderer.getVolume()), this.nativeAudioEl.muted = this.muted, this.disableAudio = true;
    const a2 = this.nativeAudioEl, n2 = this, o2 = () => !a2.paused && a2.readyState >= 3;
    this.clock.setAudioProvider({ getAudioClock: () => o2() ? a2.currentTime + n2.startTime : -1, hasHealthyBuffer: o2, isAudioPlaying: () => !a2.paused }), this.videoRenderer && this.videoRenderer.setAudioTimeProvider(() => o2() ? a2.currentTime + n2.startTime : -1, o2);
    const h2 = () => {
      r2 > 0 && (a2.currentTime = r2), (t2 || this.stateManager.is("playing")) && a2.play().catch(() => {
      });
    };
    if (s2) return void h2();
    this._nativeAudioLogicalUrl = e2;
    const d2 = this.config.headers;
    d2 && Object.keys(d2).length > 0 ? (this.revokeNativeAudioObjectUrl(), fetch(e2, { headers: d2 }).then((e3) => {
      if (!e3.ok) throw new Error(`HTTP ${e3.status}`);
      return e3.blob();
    }).then((t3) => {
      this.nativeAudioEl === a2 && this._nativeAudioLogicalUrl === e2 && (this._nativeAudioObjectUrl = URL.createObjectURL(t3), a2.src = this._nativeAudioObjectUrl, h2());
    }).catch((t3) => {
      i.error(xe, `Separate audio with custom headers failed to load: ${e2}`, t3);
    })) : (this.revokeNativeAudioObjectUrl(), a2.src = e2, h2());
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
  async selectAudioLang(e2) {
    const t2 = this._audioTracks.find((t3) => t3.lang === e2);
    if (!t2) return i.warn(xe, `Audio track not found for lang: ${e2}`), false;
    if (e2 === this._activeAudioLang && this.audioDemuxer) return true;
    const r2 = this.getCurrentTime(), s2 = this.stateManager.is("playing") || this.stateManager.is("buffering");
    let a2, n2 = null, o2 = null, h2 = 0;
    try {
      if (n2 = t2.adapter ?? await this.createSource({ type: "url", url: t2.url, headers: this.config.headers }), o2 = new Demuxer(n2, this.config.wasmBinary, true, this.config.assetBaseUrl), h2 = (await o2.open()).startTime || 0, a2 = o2.getAudioTracks()[0], !a2) throw new Error("no audio track in the selected language");
      await o2.seek(r2 + h2);
    } catch (r3) {
      i.warn(xe, `Audio switch prep failed for ${t2.label}: ${r3?.message ?? r3}`);
      try {
        o2?.close();
      } catch {
      }
      if (n2 && n2 !== t2.adapter) try {
        n2.close();
      } catch {
      }
      if (t2.adapter) return false;
      this._audioSwitchInProgress = true, this.stopAudioLoop();
      let s3 = 0;
      for (; this.audioDemuxInFlight && s3++ < 200; ) await new Promise((e3) => setTimeout(e3, 5));
      if (this.audioDemuxer) {
        try {
          this.audioDemuxer.close();
        } catch {
        }
        this.audioDemuxer = null;
      }
      if (this.audioSource) {
        try {
          this.audioSource.close();
        } catch {
        }
        this.audioSource = null;
      }
      return this._splitAudioTrackId = -1, await this.audioDecoder.flush(), this.audioRenderer.reset(), this.disableAudio || (this.audioRenderer.mute(), this.disableAudio = true), this.setupNativeAudio(t2.url), this._activeAudioLang = e2, this._audioSwitchInProgress = false, this.emit("audioTrackChange", { lang: e2, label: t2.label }), true;
    }
    this._audioSwitchInProgress = true, this.stopAudioLoop();
    let d2 = 0;
    for (; this.audioDemuxInFlight && d2++ < 200; ) await new Promise((e3) => setTimeout(e3, 5));
    if (this.nativeAudioEl) {
      try {
        this.nativeAudioEl.pause(), this.nativeAudioEl.src = "";
      } catch {
      }
      this.nativeAudioEl = null, this.revokeNativeAudioObjectUrl(), this._nativeAudioLogicalUrl = null;
    }
    const c2 = this.audioDemuxer, u2 = this.audioSource;
    this.audioDemuxer = o2, this.audioSource = n2, this._splitAudioTrackId = a2.id, this._splitAudioStartTime = h2, this._splitAudioPtsDelta = (this.mediaInfo?.startTime || 0) - h2;
    const l2 = o2.getBindings();
    l2 && this.audioDecoder.setBindings(l2);
    const f2 = o2.getExtradata(a2.id) ?? void 0;
    if (await this.audioDecoder.flush(), await this.audioDecoder.configure(a2, f2)) {
      const e3 = a2.channels ?? 2, t3 = this.audioRenderer.getMaxChannelCount();
      e3 > 2 && t3 >= e3 ? (this.audioDecoder.setDownmix(false), this.audioRenderer.setOutputChannelCount(e3)) : (this.audioDecoder.setDownmix(true), this.audioRenderer.setOutputChannelCount(2));
    }
    this.audioRenderer.reset(), this.disableAudio = false, this._activeAudioLang = e2, this._splitAudioEof = false, this._lastSplitAudioPts = r2, s2 && (this.audioRenderer.isAudioPlaying() || this.audioRenderer.play(), this.startAudioLoop()), this._audioSwitchInProgress = false;
    try {
      c2?.close();
    } catch {
    }
    if (u2 && u2 !== n2) try {
      u2.close();
    } catch {
    }
    return i.info(xe, `Audio switched in-place (WASM) to: ${t2.label} (${t2.lang})`), this.emit("audioTrackChange", { lang: e2, label: t2.label }), true;
  }
  useMuxedAudio() {
    this.nativeAudioEl && (this.nativeAudioEl.pause(), this.nativeAudioEl.src = "", this.nativeAudioEl = null, this.revokeNativeAudioObjectUrl(), this._nativeAudioLogicalUrl = null, this._activeAudioLang = "", this.disableAudio = false, this.muted = false, this.audioRenderer.unmute().catch(() => {
    }), this.clock.setAudioProvider(this.audioRenderer), this.videoRenderer && this.videoRenderer.setAudioTimeProvider(() => this.audioRenderer.getAudioClock(), () => this.audioRenderer.hasHealthyBuffer()), i.info(xe, "Switched back to muxed (WASM) audio"));
  }
  isNativeAudioActive() {
    return null !== this.nativeAudioEl && "" !== this._activeAudioLang;
  }
  hasNativeAudio() {
    return null !== this.nativeAudioEl;
  }
  hasAudibleSource() {
    return this._audioSwitchInProgress || this._audioTracks.length > 0 || this.trackManager.getAudioTracks().length > 0 || this.hasNativeAudio() || null !== this.audioDemuxer || null !== this.streamWrapper;
  }
  usesNativeAudio() {
    return null !== this.streamWrapper || null !== this.nativeAudioEl;
  }
  isStreamPlayback() {
    return null !== this.streamWrapper;
  }
  streamHasThumbnails() {
    return !!this.streamWrapper?.hasThumbnails?.();
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
    if (!t2) return i.warn(xe, `Subtitle track not found for lang: ${e2}`), false;
    try {
      const r2 = await fetch(t2.url);
      if (!r2.ok) throw new Error(`HTTP ${r2.status}`);
      const s2 = await r2.text(), a2 = t2.format || (/\.(ttml|dfxp)(\?|#|$)/i.test(t2.url) ? "ttml" : t2.url.includes(".srt") ? "srt" : "vtt");
      return this.videoRenderer?.setSubtitleFormat("ttml" === a2 ? "vtt" : a2), this._externalSubCues = "srt" === a2 ? this.parseSRT(s2) : "ttml" === a2 ? this.parseTTML(s2) : this.parseVTT(s2), this._activeSubtitleLang = e2, this.selectSubtitleTrack(null), this.startExternalSubtitles(), i.info(xe, `Subtitle loaded: ${t2.label} (${this._externalSubCues.length} cues)`), this.emit("subtitleTrackChange", { lang: e2, label: t2.label }), true;
    } catch (e3) {
      return i.error(xe, `Failed to load subtitle: ${t2.url}`, e3), false;
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
  parseTTML(e2) {
    const t2 = [];
    let i2;
    try {
      i2 = new DOMParser().parseFromString(e2, "application/xml");
    } catch {
      return t2;
    }
    if (i2.getElementsByTagName("parsererror").length > 0) return t2;
    const r2 = (e3) => {
      if (!e3) return NaN;
      const t3 = e3.trim(), i3 = t3.match(/^([\d.]+)(ms|h|m|s|f)$/);
      if (i3) {
        const e4 = parseFloat(i3[1]);
        return "h" === i3[2] ? 3600 * e4 : "m" === i3[2] ? 60 * e4 : "ms" === i3[2] ? e4 / 1e3 : "f" === i3[2] ? e4 / 30 : e4;
      }
      const r3 = t3.split(":");
      if (r3.length >= 3) {
        let e4 = 3600 * (+r3[0] || 0) + 60 * (+r3[1] || 0) + (parseFloat(r3[2]) || 0);
        return 4 === r3.length && (e4 += (+r3[3] || 0) / 30), e4;
      }
      return NaN;
    }, s2 = (e3) => {
      let t3 = "";
      return e3.childNodes.forEach((e4) => {
        e4.nodeType === Node.TEXT_NODE ? t3 += e4.textContent || "" : e4.nodeType === Node.ELEMENT_NODE && ("br" === e4.localName.toLowerCase() ? t3 += "\n" : t3 += s2(e4));
      }), t3;
    }, a2 = Array.from(i2.getElementsByTagName("*")).filter((e3) => "p" === e3.localName.toLowerCase());
    for (const e3 of a2) {
      const i3 = r2(e3.getAttribute("begin"));
      let a3 = r2(e3.getAttribute("end"));
      if (isNaN(a3)) {
        const t3 = r2(e3.getAttribute("dur"));
        isNaN(t3) || isNaN(i3) || (a3 = i3 + t3);
      }
      const n2 = s2(e3).replace(/[ \t]+/g, " ").replace(/ *\n */g, "\n").trim();
      n2 && !isNaN(i3) && !isNaN(a3) && a3 > i3 && t2.push({ start: i3, end: a3, text: n2 });
    }
    return t2;
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
    if (this._subtitleDelaySec = e2, this._customSubtitleRenderer) try {
      this._customSubtitleRenderer.setDelay(e2);
    } catch {
    }
    this.videoRenderer && this.videoRenderer.setSubtitleDelay(e2), 0 !== e2 && this.prefetchActiveSubtitleStream();
  }
  getSubtitleDelay() {
    return this.videoRenderer ? this.videoRenderer.getSubtitleDelay() : 0;
  }
  setSubtitleRenderer(e2) {
    if (this._customSubtitleRenderer !== e2 && (this._customSubtitleRenderer = e2, this._stopSubtitleRenderLoop(), this.videoRenderer?.setSubtitleCues([]), this._syncCustomSubtitleRendererOwnership(this.trackManager.getActiveSubtitleTrack()), e2)) {
      const t2 = this.videoRenderer?.getSubtitleOverlay?.() ?? null;
      if (t2 && e2.mount) try {
        e2.mount(t2);
      } catch {
      }
      try {
        e2.setDelay(this._subtitleDelaySec);
      } catch {
      }
      this._configureCustomSubtitleRenderer(), this._startSubtitleRenderLoop();
    }
  }
  async _configureCustomSubtitleRenderer() {
    const e2 = this.trackManager.getActiveSubtitleTrack(), t2 = this.customSubtitleRendererFor(e2);
    if (this._syncCustomSubtitleRendererOwnership(e2), !t2 || !e2 || !this.demuxer) return;
    const r2 = this.demuxer.getExtradata(e2.id) ?? void 0;
    null === this.embeddedSubtitleFonts && (this.embeddedSubtitleFonts = this.demuxer.getAttachments().filter((e3) => {
      const t3 = e3.mimeType.toLowerCase(), i2 = e3.name.split(".").pop()?.toLowerCase() ?? "";
      return t3.startsWith("font/") || t3.includes("font") || Pe.has(i2);
    }).map((e3) => e3.data));
    try {
      await t2.configure(e2, r2, this.embeddedSubtitleFonts.length > 0 ? this.embeddedSubtitleFonts : void 0);
    } catch (e3) {
      i.error(xe, "Custom subtitle renderer configure failed", e3);
    }
  }
  _startSubtitleRenderLoop() {
    if (null !== this._subtitleRenderRAF || "undefined" == typeof requestAnimationFrame) return;
    const e2 = () => {
      if (this._subtitleRenderRAF = null, !this._customSubtitleRenderer) return;
      const t2 = this.customSubtitleRendererFor(this.trackManager.getActiveSubtitleTrack());
      if (t2) {
        const e3 = this.trackManager.getActiveVideoTrack();
        try {
          t2.render(this.clock.getTime(), e3?.width || 0, e3?.height || 0);
        } catch {
        }
      }
      this._subtitleRenderRAF = requestAnimationFrame(e2);
    };
    this._subtitleRenderRAF = requestAnimationFrame(e2);
  }
  _stopSubtitleRenderLoop() {
    null !== this._subtitleRenderRAF && (cancelAnimationFrame(this._subtitleRenderRAF), this._subtitleRenderRAF = null);
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
    const r2 = this.clock.getTime(), s2 = "playing" === this.stateManager.getState();
    this.stopPauseBuffering(), null !== this.animationFrameId && (cancelAnimationFrame(this.animationFrameId), this.animationFrameId = null), this.seekSessionId++, s2 && (this.clock.pause(), this.disableAudio || this.audioRenderer.pause(), this.nativeAudioEl && this.nativeAudioEl.pause(), this.videoRenderer && this.videoRenderer.stopPresentationLoop());
    const a2 = performance.now();
    for (; this.demuxInFlight && performance.now() - a2 < 2e3; ) await new Promise((e3) => setTimeout(e3, 10));
    try {
      i.info(xe, `Prefetching subtitle cues for stream ${e2.id}...`);
      const s3 = await t2.prefetchSubtitleCues(e2.id);
      s3 && s3.length > 0 ? (this.videoRenderer.setSubtitleCues(s3), this.prefetchedSubtitleStream = e2.id, i.info(xe, `Prefetched ${s3.length} subtitle cues for stream ${e2.id}`)) : i.warn(xe, `Subtitle prefetch returned no cues for stream ${e2.id}`), await this.videoDecoder.flush(), await this.audioDecoder.flush(), this.videoRenderer && this.videoRenderer.clearQueue(), this.audioRenderer.reset(), await this.demuxer.seek(r2), this.clock.seek(r2), this.pendingAudioPackets = [], this.pendingPrebufferPackets = [], this.eofReached = false, this.eofSince = 0;
    } catch (e3) {
      i.error(xe, "Subtitle prefetch failed", e3);
    } finally {
      this.prefetchInFlight = false;
    }
    if (s2) try {
      this.disableAudio || await this.audioRenderer.play(), this.nativeAudioEl && await this.nativeAudioEl.play().catch(() => {
      }), this.videoRenderer && this.videoRenderer.startPresentationLoop(), this.clock.start(), this.seekTargetTime = r2, this.animationFrameId = requestAnimationFrame(this.processLoop), this.requestWakeLock();
    } catch (e3) {
      i.error(xe, "Failed to resume after subtitle prefetch", e3);
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
        i.error("MoviPlayer", "Failed to unmute", e3);
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
      }).catch((e4) => i.warn(xe, "Audio-only → video resync seek failed", e4));
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
      this.wakeLock = e3, i.debug(xe, "WakeLock acquired"), e3.addEventListener("release", () => {
        i.debug(xe, "WakeLock released by system"), this.wakeLock = null;
      });
    } catch (t2) {
      this.wakeLock = null, i.warn(xe, "Failed to acquire WakeLock", t2), e2 > 0 && setTimeout(() => {
        const t3 = this.stateManager.getState();
        this.wakeLock || "playing" !== t3 && "buffering" !== t3 || "undefined" == typeof document || "visible" !== document.visibilityState || this.requestWakeLock(e2 - 1);
      }, 600);
    }
    else i.debug(xe, "WakeLock skipped — page not visible");
    else i.debug(xe, "WakeLock API not available");
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
      i.info(xe, `Network online — re-seeking to ${e3.toFixed(2)}s for clean recovery`), this.seek(e3).catch((e4) => {
        i.error(xe, "Network recovery seek failed", e4);
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
        if ("suspended" === e3.state && !this.muted && !this.disableAudio) return i.warn(xe, "AudioContext stuck suspended after foreground — pausing for user tap"), void this.pause();
      }
      if (this.isPiPActive) this.processLoop();
      else {
        const e4 = this.nativeAudioEl ? this.nativeAudioEl.currentTime : -1, t2 = this.audioRenderer.getAudioClock(), r2 = this.audioRenderer.getMaxScheduledMediaTime(), s2 = e4 >= 0 ? e4 : t2 >= 0 ? t2 : r2 > 0 ? r2 : this.clock.getTime();
        i.debug(xe, `Foreground recovery: video-only seek to ${s2.toFixed(2)}s`), null !== this.animationFrameId && (cancelAnimationFrame(this.animationFrameId), this.animationFrameId = null);
        const a2 = ++this.seekSessionId;
        try {
          if (this.videoDecoder && await this.videoDecoder.flush(), this.videoRenderer && this.videoRenderer.clearQueue(), this.seekSessionId !== a2) return;
          if (this.eofReached = false, this.eofSince = 0, this.demuxer && await this.demuxer.seek(s2 + this.startTime), this.seekSessionId !== a2) return;
          this.clock.seek(s2 + this.startTime), this.seekTargetTime = Math.max(s2 + this.startTime, r2), this.seekingToKeyframe = true, this.seekingToKeyframeStartTime = performance.now(), this.seekKeyframeScanned = 0, this.seekCraSeen = 0, this.videoChainBrokenUntilKeyframe = false, this.videoRenderer && this.videoRenderer.startPresentationLoop(), this.processLoop();
        } catch (e5) {
          i.error(xe, "Foreground recovery failed", e5), this.processLoop();
        }
      }
      setTimeout(() => this.ensureWakeLock(), 500);
    }
  };
  startBackgroundTimer() {
    if (!this.backgroundWorker && !this.backgroundIntervalId) {
      i.debug(xe, "Starting background playback timer");
      try {
        const e2 = new Blob(["\n        let id = null;\n        self.onmessage = (e) => {\n          if (e.data === 'start') {\n            id = setInterval(() => self.postMessage('tick'), 16);\n          } else if (e.data === 'stop') {\n            clearInterval(id);\n            id = null;\n          }\n        };\n      "], { type: "application/javascript" });
        this.backgroundWorker = new Worker(URL.createObjectURL(e2)), this.backgroundWorker.onmessage = () => this.backgroundTick(), this.backgroundWorker.postMessage("start");
      } catch {
        i.debug(xe, "Worker unavailable, using setInterval fallback"), this.backgroundIntervalId = window.setInterval(() => this.backgroundTick(), 16);
      }
    }
  }
  backgroundTick() {
    const e2 = this.stateManager.getState();
    "playing" !== e2 && "buffering" !== e2 || (this.audioDemuxer ? (this.pumpSplitAudio(), this.maybeEndSplitAudio(), this.isPiPActive && this.processLoop()) : this.processLoop(), this.isPiPActive && this.videoRenderer && this.videoRenderer.presentationLoop?.());
  }
  stopBackgroundTimer() {
    this.backgroundWorker && (this.backgroundWorker.postMessage("stop"), this.backgroundWorker.terminate(), this.backgroundWorker = null, i.debug(xe, "Background worker stopped")), null !== this.backgroundIntervalId && (clearInterval(this.backgroundIntervalId), this.backgroundIntervalId = null);
  }
  startPauseBuffering() {
    null === this.pauseBufferTimerId && this.demuxer && !this.eofReached && (this.nativeAudioOnlyPlayback() || this.source instanceof FileSource || (i.debug(xe, "Starting pause-time buffering"), this.pauseBufferTimerId = window.setInterval(() => {
      this.pauseBufferTick();
    }, MoviPlayer.PAUSE_BUFFER_INTERVAL_MS)));
  }
  stopPauseBuffering() {
    null !== this.pauseBufferTimerId && (clearInterval(this.pauseBufferTimerId), this.pauseBufferTimerId = null, i.debug(xe, "Stopped pause-time buffering"));
  }
  pauseBufferTick = async () => {
    if ("paused" !== this.stateManager.getState()) return void this.stopPauseBuffering();
    if (this.demuxInFlight || !this.demuxer) return;
    if (this.eofReached) return void this.stopPauseBuffering();
    const e2 = this.pendingPrebufferPackets.length;
    if (e2 >= MoviPlayer.PAUSE_BUFFER_MAX_PACKETS) return i.debug(xe, `Pause buffer full: ${e2} packets stashed`), void this.stopPauseBuffering();
    let t2 = 0, r2 = 0;
    const s2 = this.trackManager.getActiveVideoTrack(), a2 = this.trackManager.getActiveAudioTrack();
    for (const e3 of this.pendingPrebufferPackets) s2 && e3.streamIndex === s2.id ? r2++ : a2 && e3.streamIndex === a2.id && (t2 += e3.duration ?? 0);
    const n2 = !s2 || r2 >= MoviPlayer.PAUSE_BUFFER_VIDEO_FRAMES, o2 = !a2 || t2 >= MoviPlayer.PAUSE_BUFFER_AUDIO_SECONDS;
    if (n2 && o2) return i.debug(xe, `Pause buffer targets met: audio=${t2.toFixed(1)}s, video=${r2} frames`), void this.stopPauseBuffering();
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
      i.error(xe, "Pause buffer demux error", e3);
    } finally {
      this.demuxInFlight = false;
    }
  };
  async releaseWakeLock() {
    if (this.wakeLock) try {
      await this.wakeLock.release(), this.wakeLock = null, i.debug(xe, "WakeLock released");
    } catch (e2) {
      i.warn(xe, "Failed to release WakeLock", e2), this.wakeLock = null;
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
    if (this.source instanceof FileSource) return e2;
    if (this.source instanceof SegmentStreamSource && this.fileSize > 0 && e2 > 0) {
      const t2 = this.source.getPosition(), i2 = this.getCurrentTime() / e2 * this.fileSize, r2 = Math.max(0, t2 - i2) / this.fileSize * e2;
      return Math.min(this.getCurrentTime() + r2, e2);
    }
    return 0;
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
    i.setLevel(e2), te(e2);
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
      const r2 = (e2[0].codec || "").toLowerCase(), s2 = "png" === r2 ? "image/png" : "mjpeg" === r2 || "jpeg" === r2 || "jpg" === r2 ? "image/jpeg" : "webp" === r2 ? "image/webp" : "image/*", a2 = new Blob([t2.buffer], { type: s2 }), n2 = await createImageBitmap(a2);
      this.coverArt?.close?.(), this.coverArt = n2, this.emit("coverart", n2), i.info(xe, `Cover art extracted: ${n2.width}x${n2.height} (${r2 || "image"})`);
    } catch (e3) {
      i.warn(xe, "Cover art extraction failed", e3), this.emit("coverart", null);
    }
  }
  destroy() {
    if (!this._destroyed) {
      if (i.info(xe, "Destroying player"), this._destroyed = true, this.trackSelectionGeneration++, this._stopSubtitleRenderLoop(), this._customSubtitleRenderer = null, this._abrTimer && (clearInterval(this._abrTimer), this._abrTimer = null), this.cancelBlackFrameWatchdog(), this.releaseWakeLock(), this.clock.pause(), null !== this.animationFrameId && cancelAnimationFrame(this.animationFrameId), this.stopBackgroundTimer(), this.stopPauseBuffering(), this._prefetchThrottleTimer && (clearTimeout(this._prefetchThrottleTimer), this._prefetchThrottleTimer = null), this.stopAudioLoop(), this.audioDemuxer && (this.audioDemuxer.close(), this.audioDemuxer = null), this.audioSource) {
        try {
          this.audioSource.close();
        } catch {
        }
        this.audioSource = null;
      }
      this.streamWrapper && (this.streamWrapper.destroy(), this.streamWrapper = null), this.pendingPrebufferPackets = [], this.videoDecoder.close(), this.audioDecoder.close(), this.videoRenderer && this.videoRenderer.destroy(), this.audioRenderer.destroy(), this.demuxer && (this.demuxer.close(), this.demuxer = null), this.nativeAudioEl && (this.nativeAudioEl.pause(), this.nativeAudioEl.src = "", this.nativeAudioEl = null), this.revokeNativeAudioObjectUrl(), this._nativeAudioLogicalUrl = null, this.stopExternalSubtitles(), this._externalSubCues = [], this._subtitleTracks = [], this.source && (this.source.close(), this.source = null), this.cache.clear(), this.embeddedSubtitleFonts = null, this.trackManager.clear(), this.coverArt?.close?.(), this.coverArt = null, this.stateManager.reset(), this.mediaInfo = null, this.streamBackend = "unknown", this.emit("surfaceChange", null), this.emit("diagnosticsChange", this.getRenderingDiagnostics()), document.removeEventListener("visibilitychange", this.handleVisibilityChange), window.removeEventListener("online", this.handleNetworkOnline), this.removeAllListeners(), i.info(xe, "Player destroyed");
    }
  }
}
const Ee = "0.3.5-kmp.3", Fe = "2.0.0";
export {
  CanvasRenderer as C,
  EventEmitter as E,
  i as L,
  Fe as M,
  TrackManager as T,
  e as a,
  Ee as b,
  MoviError as c,
  MoviPlayer as d,
  Re as e,
  Ae as r
};
