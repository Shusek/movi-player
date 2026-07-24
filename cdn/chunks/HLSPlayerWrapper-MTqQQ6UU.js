import { E as t, T as e, C as s, L as i } from "./engine-Cbcs-s1Y.js";
const r = Number.isFinite || function(t2) {
  return "number" == typeof t2 && isFinite(t2);
}, n = Number.isSafeInteger || function(t2) {
  return "number" == typeof t2 && Math.abs(t2) <= a;
}, a = Number.MAX_SAFE_INTEGER || 9007199254740991;
let o = function(t2) {
  return t2.NETWORK_ERROR = "networkError", t2.MEDIA_ERROR = "mediaError", t2.KEY_SYSTEM_ERROR = "keySystemError", t2.MUX_ERROR = "muxError", t2.OTHER_ERROR = "otherError", t2;
}({}), l = function(t2) {
  return t2.KEY_SYSTEM_NO_KEYS = "keySystemNoKeys", t2.KEY_SYSTEM_NO_ACCESS = "keySystemNoAccess", t2.KEY_SYSTEM_NO_SESSION = "keySystemNoSession", t2.KEY_SYSTEM_NO_CONFIGURED_LICENSE = "keySystemNoConfiguredLicense", t2.KEY_SYSTEM_LICENSE_REQUEST_FAILED = "keySystemLicenseRequestFailed", t2.KEY_SYSTEM_SERVER_CERTIFICATE_REQUEST_FAILED = "keySystemServerCertificateRequestFailed", t2.KEY_SYSTEM_SERVER_CERTIFICATE_UPDATE_FAILED = "keySystemServerCertificateUpdateFailed", t2.KEY_SYSTEM_SESSION_UPDATE_FAILED = "keySystemSessionUpdateFailed", t2.KEY_SYSTEM_STATUS_OUTPUT_RESTRICTED = "keySystemStatusOutputRestricted", t2.KEY_SYSTEM_STATUS_INTERNAL_ERROR = "keySystemStatusInternalError", t2.KEY_SYSTEM_DESTROY_MEDIA_KEYS_ERROR = "keySystemDestroyMediaKeysError", t2.KEY_SYSTEM_DESTROY_CLOSE_SESSION_ERROR = "keySystemDestroyCloseSessionError", t2.KEY_SYSTEM_DESTROY_REMOVE_SESSION_ERROR = "keySystemDestroyRemoveSessionError", t2.MANIFEST_LOAD_ERROR = "manifestLoadError", t2.MANIFEST_LOAD_TIMEOUT = "manifestLoadTimeOut", t2.MANIFEST_PARSING_ERROR = "manifestParsingError", t2.MANIFEST_INCOMPATIBLE_CODECS_ERROR = "manifestIncompatibleCodecsError", t2.LEVEL_EMPTY_ERROR = "levelEmptyError", t2.LEVEL_LOAD_ERROR = "levelLoadError", t2.LEVEL_LOAD_TIMEOUT = "levelLoadTimeOut", t2.LEVEL_PARSING_ERROR = "levelParsingError", t2.LEVEL_SWITCH_ERROR = "levelSwitchError", t2.AUDIO_TRACK_LOAD_ERROR = "audioTrackLoadError", t2.AUDIO_TRACK_LOAD_TIMEOUT = "audioTrackLoadTimeOut", t2.SUBTITLE_LOAD_ERROR = "subtitleTrackLoadError", t2.SUBTITLE_TRACK_LOAD_TIMEOUT = "subtitleTrackLoadTimeOut", t2.FRAG_LOAD_ERROR = "fragLoadError", t2.FRAG_LOAD_TIMEOUT = "fragLoadTimeOut", t2.FRAG_DECRYPT_ERROR = "fragDecryptError", t2.FRAG_PARSING_ERROR = "fragParsingError", t2.FRAG_GAP = "fragGap", t2.REMUX_ALLOC_ERROR = "remuxAllocError", t2.KEY_LOAD_ERROR = "keyLoadError", t2.KEY_LOAD_TIMEOUT = "keyLoadTimeOut", t2.BUFFER_ADD_CODEC_ERROR = "bufferAddCodecError", t2.BUFFER_INCOMPATIBLE_CODECS_ERROR = "bufferIncompatibleCodecsError", t2.BUFFER_APPEND_ERROR = "bufferAppendError", t2.BUFFER_APPENDING_ERROR = "bufferAppendingError", t2.BUFFER_STALLED_ERROR = "bufferStalledError", t2.BUFFER_FULL_ERROR = "bufferFullError", t2.BUFFER_SEEK_OVER_HOLE = "bufferSeekOverHole", t2.BUFFER_NUDGE_ON_STALL = "bufferNudgeOnStall", t2.ASSET_LIST_LOAD_ERROR = "assetListLoadError", t2.ASSET_LIST_LOAD_TIMEOUT = "assetListLoadTimeout", t2.ASSET_LIST_PARSING_ERROR = "assetListParsingError", t2.INTERSTITIAL_ASSET_ITEM_ERROR = "interstitialAssetItemError", t2.INTERNAL_EXCEPTION = "internalException", t2.INTERNAL_ABORTED = "aborted", t2.ATTACH_MEDIA_ERROR = "attachMediaError", t2.UNKNOWN = "unknown", t2;
}({}), h = function(t2) {
  return t2.MEDIA_ATTACHING = "hlsMediaAttaching", t2.MEDIA_ATTACHED = "hlsMediaAttached", t2.MEDIA_DETACHING = "hlsMediaDetaching", t2.MEDIA_DETACHED = "hlsMediaDetached", t2.MEDIA_ENDED = "hlsMediaEnded", t2.STALL_RESOLVED = "hlsStallResolved", t2.BUFFER_RESET = "hlsBufferReset", t2.BUFFER_CODECS = "hlsBufferCodecs", t2.BUFFER_CREATED = "hlsBufferCreated", t2.BUFFER_APPENDING = "hlsBufferAppending", t2.BUFFER_APPENDED = "hlsBufferAppended", t2.BUFFER_EOS = "hlsBufferEos", t2.BUFFERED_TO_END = "hlsBufferedToEnd", t2.BUFFER_FLUSHING = "hlsBufferFlushing", t2.BUFFER_FLUSHED = "hlsBufferFlushed", t2.MANIFEST_LOADING = "hlsManifestLoading", t2.MANIFEST_LOADED = "hlsManifestLoaded", t2.MANIFEST_PARSED = "hlsManifestParsed", t2.LEVEL_SWITCHING = "hlsLevelSwitching", t2.LEVEL_SWITCHED = "hlsLevelSwitched", t2.LEVEL_LOADING = "hlsLevelLoading", t2.LEVEL_LOADED = "hlsLevelLoaded", t2.LEVEL_UPDATED = "hlsLevelUpdated", t2.LEVEL_PTS_UPDATED = "hlsLevelPtsUpdated", t2.LEVELS_UPDATED = "hlsLevelsUpdated", t2.AUDIO_TRACKS_UPDATED = "hlsAudioTracksUpdated", t2.AUDIO_TRACK_SWITCHING = "hlsAudioTrackSwitching", t2.AUDIO_TRACK_SWITCHED = "hlsAudioTrackSwitched", t2.AUDIO_TRACK_LOADING = "hlsAudioTrackLoading", t2.AUDIO_TRACK_LOADED = "hlsAudioTrackLoaded", t2.AUDIO_TRACK_UPDATED = "hlsAudioTrackUpdated", t2.SUBTITLE_TRACKS_UPDATED = "hlsSubtitleTracksUpdated", t2.SUBTITLE_TRACKS_CLEARED = "hlsSubtitleTracksCleared", t2.SUBTITLE_TRACK_SWITCH = "hlsSubtitleTrackSwitch", t2.SUBTITLE_TRACK_LOADING = "hlsSubtitleTrackLoading", t2.SUBTITLE_TRACK_LOADED = "hlsSubtitleTrackLoaded", t2.SUBTITLE_TRACK_UPDATED = "hlsSubtitleTrackUpdated", t2.SUBTITLE_FRAG_PROCESSED = "hlsSubtitleFragProcessed", t2.CUES_PARSED = "hlsCuesParsed", t2.NON_NATIVE_TEXT_TRACKS_FOUND = "hlsNonNativeTextTracksFound", t2.INIT_PTS_FOUND = "hlsInitPtsFound", t2.FRAG_LOADING = "hlsFragLoading", t2.FRAG_LOAD_EMERGENCY_ABORTED = "hlsFragLoadEmergencyAborted", t2.FRAG_LOADED = "hlsFragLoaded", t2.FRAG_DECRYPTED = "hlsFragDecrypted", t2.FRAG_PARSING_INIT_SEGMENT = "hlsFragParsingInitSegment", t2.FRAG_PARSING_USERDATA = "hlsFragParsingUserdata", t2.FRAG_PARSING_METADATA = "hlsFragParsingMetadata", t2.FRAG_PARSED = "hlsFragParsed", t2.FRAG_BUFFERED = "hlsFragBuffered", t2.FRAG_CHANGED = "hlsFragChanged", t2.FPS_DROP = "hlsFpsDrop", t2.FPS_DROP_LEVEL_CAPPING = "hlsFpsDropLevelCapping", t2.MAX_AUTO_LEVEL_UPDATED = "hlsMaxAutoLevelUpdated", t2.ERROR = "hlsError", t2.DESTROYING = "hlsDestroying", t2.KEY_LOADING = "hlsKeyLoading", t2.KEY_LOADED = "hlsKeyLoaded", t2.LIVE_BACK_BUFFER_REACHED = "hlsLiveBackBufferReached", t2.BACK_BUFFER_REACHED = "hlsBackBufferReached", t2.STEERING_MANIFEST_LOADED = "hlsSteeringManifestLoaded", t2.ASSET_LIST_LOADING = "hlsAssetListLoading", t2.ASSET_LIST_LOADED = "hlsAssetListLoaded", t2.INTERSTITIALS_UPDATED = "hlsInterstitialsUpdated", t2.INTERSTITIALS_BUFFERED_TO_BOUNDARY = "hlsInterstitialsBufferedToBoundary", t2.INTERSTITIAL_ASSET_PLAYER_CREATED = "hlsInterstitialAssetPlayerCreated", t2.INTERSTITIAL_STARTED = "hlsInterstitialStarted", t2.INTERSTITIAL_ASSET_STARTED = "hlsInterstitialAssetStarted", t2.INTERSTITIAL_ASSET_ENDED = "hlsInterstitialAssetEnded", t2.INTERSTITIAL_ASSET_ERROR = "hlsInterstitialAssetError", t2.INTERSTITIAL_ENDED = "hlsInterstitialEnded", t2.INTERSTITIALS_PRIMARY_RESUMED = "hlsInterstitialsPrimaryResumed", t2.PLAYOUT_LIMIT_REACHED = "hlsPlayoutLimitReached", t2.EVENT_CUE_ENTER = "hlsEventCueEnter", t2;
}({});
var d = "manifest", c = "level", u = "audioTrack", f = "subtitleTrack", g = "main", m = "audio", p = "subtitle";
class EWMA {
  constructor(t2, e2 = 0, s2 = 0) {
    this.halfLife = void 0, this.alpha_ = void 0, this.estimate_ = void 0, this.totalWeight_ = void 0, this.halfLife = t2, this.alpha_ = t2 ? Math.exp(Math.log(0.5) / t2) : 0, this.estimate_ = e2, this.totalWeight_ = s2;
  }
  sample(t2, e2) {
    const s2 = Math.pow(this.alpha_, t2);
    this.estimate_ = e2 * (1 - s2) + s2 * this.estimate_, this.totalWeight_ += t2;
  }
  getTotalWeight() {
    return this.totalWeight_;
  }
  getEstimate() {
    if (this.alpha_) {
      const t2 = 1 - Math.pow(this.alpha_, this.totalWeight_);
      if (t2) return this.estimate_ / t2;
    }
    return this.estimate_;
  }
}
class EwmaBandWidthEstimator {
  constructor(t2, e2, s2, i2 = 100) {
    this.defaultEstimate_ = void 0, this.minWeight_ = void 0, this.minDelayMs_ = void 0, this.slow_ = void 0, this.fast_ = void 0, this.defaultTTFB_ = void 0, this.ttfb_ = void 0, this.defaultEstimate_ = s2, this.minWeight_ = 1e-3, this.minDelayMs_ = 50, this.slow_ = new EWMA(t2), this.fast_ = new EWMA(e2), this.defaultTTFB_ = i2, this.ttfb_ = new EWMA(t2);
  }
  update(t2, e2) {
    const { slow_: s2, fast_: i2, ttfb_: r2 } = this;
    s2.halfLife !== t2 && (this.slow_ = new EWMA(t2, s2.getEstimate(), s2.getTotalWeight())), i2.halfLife !== e2 && (this.fast_ = new EWMA(e2, i2.getEstimate(), i2.getTotalWeight())), r2.halfLife !== t2 && (this.ttfb_ = new EWMA(t2, r2.getEstimate(), r2.getTotalWeight()));
  }
  sample(t2, e2) {
    const s2 = (t2 = Math.max(t2, this.minDelayMs_)) / 1e3, i2 = 8 * e2 / s2;
    this.fast_.sample(s2, i2), this.slow_.sample(s2, i2);
  }
  sampleTTFB(t2) {
    const e2 = t2 / 1e3, s2 = Math.sqrt(2) * Math.exp(-Math.pow(e2, 2) / 2);
    this.ttfb_.sample(s2, Math.max(t2, 5));
  }
  canEstimate() {
    return this.fast_.getTotalWeight() >= this.minWeight_;
  }
  getEstimate() {
    return this.canEstimate() ? Math.min(this.fast_.getEstimate(), this.slow_.getEstimate()) : this.defaultEstimate_;
  }
  getEstimateTTFB() {
    return this.ttfb_.getTotalWeight() >= this.minWeight_ ? this.ttfb_.getEstimate() : this.defaultTTFB_;
  }
  get defaultEstimate() {
    return this.defaultEstimate_;
  }
  destroy() {
  }
}
function v(t2, e2, s2) {
  return (e2 = function(t3) {
    var e3 = function(t4) {
      if ("object" != typeof t4 || !t4) return t4;
      var e4 = t4[Symbol.toPrimitive];
      if (void 0 !== e4) {
        var s3 = e4.call(t4, "string");
        if ("object" != typeof s3) return s3;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return String(t4);
    }(t3);
    return "symbol" == typeof e3 ? e3 : e3 + "";
  }(e2)) in t2 ? Object.defineProperty(t2, e2, { value: s2, enumerable: true, configurable: true, writable: true }) : t2[e2] = s2, t2;
}
function y() {
  return y = Object.assign ? Object.assign.bind() : function(t2) {
    for (var e2 = 1; e2 < arguments.length; e2++) {
      var s2 = arguments[e2];
      for (var i2 in s2) ({}).hasOwnProperty.call(s2, i2) && (t2[i2] = s2[i2]);
    }
    return t2;
  }, y.apply(null, arguments);
}
function E(t2, e2) {
  var s2 = Object.keys(t2);
  if (Object.getOwnPropertySymbols) {
    var i2 = Object.getOwnPropertySymbols(t2);
    e2 && (i2 = i2.filter(function(e3) {
      return Object.getOwnPropertyDescriptor(t2, e3).enumerable;
    })), s2.push.apply(s2, i2);
  }
  return s2;
}
function T(t2) {
  for (var e2 = 1; e2 < arguments.length; e2++) {
    var s2 = null != arguments[e2] ? arguments[e2] : {};
    e2 % 2 ? E(Object(s2), true).forEach(function(e3) {
      v(t2, e3, s2[e3]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t2, Object.getOwnPropertyDescriptors(s2)) : E(Object(s2)).forEach(function(e3) {
      Object.defineProperty(t2, e3, Object.getOwnPropertyDescriptor(s2, e3));
    });
  }
  return t2;
}
class Logger {
  constructor(t2, e2) {
    this.trace = void 0, this.debug = void 0, this.log = void 0, this.warn = void 0, this.info = void 0, this.error = void 0;
    const s2 = `[${t2}]:`;
    this.trace = S, this.debug = e2.debug.bind(null, s2), this.log = e2.log.bind(null, s2), this.warn = e2.warn.bind(null, s2), this.info = e2.info.bind(null, s2), this.error = e2.error.bind(null, s2);
  }
}
const S = function() {
}, L = { trace: S, debug: S, log: S, warn: S, info: S, error: S };
function A() {
  return y({}, L);
}
function R(t2, e2, s2) {
  return e2[t2] ? e2[t2].bind(e2) : function(t3, e3) {
    const s3 = self.console[t3];
    return s3 ? s3.bind(self.console, `${e3 ? "[" + e3 + "] " : ""}[${t3}] >`) : S;
  }(t2, s2);
}
const b = A(), I = b;
function k(t2 = true) {
  if ("undefined" != typeof self) return (t2 || !self.MediaSource) && self.ManagedMediaSource || self.MediaSource || self.WebKitMediaSource;
}
function P(t2, e2) {
  const s2 = Object.keys(t2), i2 = Object.keys(e2), r2 = s2.length, n2 = i2.length;
  return !r2 || !n2 || r2 === n2 && !s2.some((t3) => -1 === i2.indexOf(t3));
}
function D(t2, e2 = false) {
  if ("undefined" != typeof TextDecoder) {
    const s3 = new TextDecoder("utf-8").decode(t2);
    if (e2) {
      const t3 = s3.indexOf("\0");
      return -1 !== t3 ? s3.substring(0, t3) : s3;
    }
    return s3.replace(/\0/g, "");
  }
  const s2 = t2.length;
  let i2, r2, n2, a2 = "", o2 = 0;
  for (; o2 < s2; ) {
    if (i2 = t2[o2++], 0 === i2 && e2) return a2;
    if (0 !== i2 && 3 !== i2) switch (i2 >> 4) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        a2 += String.fromCharCode(i2);
        break;
      case 12:
      case 13:
        r2 = t2[o2++], a2 += String.fromCharCode((31 & i2) << 6 | 63 & r2);
        break;
      case 14:
        r2 = t2[o2++], n2 = t2[o2++], a2 += String.fromCharCode((15 & i2) << 12 | (63 & r2) << 6 | 63 & n2);
    }
  }
  return a2;
}
function _(t2) {
  let e2 = "";
  for (let s2 = 0; s2 < t2.length; s2++) {
    let i2 = t2[s2].toString(16);
    i2.length < 2 && (i2 = "0" + i2), e2 += i2;
  }
  return e2;
}
function C(t2) {
  return Uint8Array.from(t2.replace(/^0x/, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")).buffer;
}
function w(t2) {
  return t2 && t2.__esModule && Object.prototype.hasOwnProperty.call(t2, "default") ? t2.default : t2;
}
var M, x = { exports: {} }, O = function() {
  return M || (M = 1, t2 = x, function() {
    var e2 = /^(?=((?:[a-zA-Z0-9+\-.]+:)?))\1(?=((?:\/\/[^\/?#]*)?))\2(?=((?:(?:[^?#\/]*\/)*[^;?#\/]*)?))\3((?:;[^?#]*)?)(\?[^#]*)?(#[^]*)?$/, s2 = /^(?=([^\/?#]*))\1([^]*)$/, i2 = /(?:\/|^)\.(?=\/)/g, r2 = /(?:\/|^)\.\.\/(?!\.\.\/)[^\/]*(?=\/)/g, n2 = { buildAbsoluteURL: function(t3, e3, i3) {
      if (i3 = i3 || {}, t3 = t3.trim(), !(e3 = e3.trim())) {
        if (!i3.alwaysNormalize) return t3;
        var r3 = n2.parseURL(t3);
        if (!r3) throw new Error("Error trying to parse base URL.");
        return r3.path = n2.normalizePath(r3.path), n2.buildURLFromParts(r3);
      }
      var a2 = n2.parseURL(e3);
      if (!a2) throw new Error("Error trying to parse relative URL.");
      if (a2.scheme) return i3.alwaysNormalize ? (a2.path = n2.normalizePath(a2.path), n2.buildURLFromParts(a2)) : e3;
      var o2 = n2.parseURL(t3);
      if (!o2) throw new Error("Error trying to parse base URL.");
      if (!o2.netLoc && o2.path && "/" !== o2.path[0]) {
        var l2 = s2.exec(o2.path);
        o2.netLoc = l2[1], o2.path = l2[2];
      }
      o2.netLoc && !o2.path && (o2.path = "/");
      var h2 = { scheme: o2.scheme, netLoc: a2.netLoc, path: null, params: a2.params, query: a2.query, fragment: a2.fragment };
      if (!a2.netLoc && (h2.netLoc = o2.netLoc, "/" !== a2.path[0])) if (a2.path) {
        var d2 = o2.path, c2 = d2.substring(0, d2.lastIndexOf("/") + 1) + a2.path;
        h2.path = n2.normalizePath(c2);
      } else h2.path = o2.path, a2.params || (h2.params = o2.params, a2.query || (h2.query = o2.query));
      return null === h2.path && (h2.path = i3.alwaysNormalize ? n2.normalizePath(a2.path) : a2.path), n2.buildURLFromParts(h2);
    }, parseURL: function(t3) {
      var s3 = e2.exec(t3);
      return s3 ? { scheme: s3[1] || "", netLoc: s3[2] || "", path: s3[3] || "", params: s3[4] || "", query: s3[5] || "", fragment: s3[6] || "" } : null;
    }, normalizePath: function(t3) {
      for (t3 = t3.split("").reverse().join("").replace(i2, ""); t3.length !== (t3 = t3.replace(r2, "")).length; ) ;
      return t3.split("").reverse().join("");
    }, buildURLFromParts: function(t3) {
      return t3.scheme + t3.netLoc + t3.path + t3.params + t3.query + t3.fragment;
    } };
    t2.exports = n2;
  }()), x.exports;
  var t2;
}();
class LoadStats {
  constructor() {
    this.aborted = false, this.loaded = 0, this.retry = 0, this.total = 0, this.chunkCount = 0, this.bwEstimate = 0, this.loading = { start: 0, first: 0, end: 0 }, this.parsing = { start: 0, end: 0 }, this.buffering = { start: 0, first: 0, end: 0 };
  }
}
var F = "audio", N = "video", B = "audiovideo";
class BaseSegment {
  constructor(t2) {
    this._byteRange = null, this._url = null, this._stats = null, this._streams = null, this.base = void 0, this.relurl = void 0, "string" == typeof t2 && (t2 = { url: t2 }), this.base = t2, function(t3, e2) {
      const s2 = U(t3, e2);
      s2 && (s2.enumerable = true, Object.defineProperty(t3, e2, s2));
    }(this, "stats");
  }
  setByteRange(t2, e2) {
    const s2 = t2.split("@", 2);
    let i2;
    i2 = 1 === s2.length ? (null == e2 ? void 0 : e2.byteRangeEndOffset) || 0 : parseInt(s2[1]), this._byteRange = [i2, parseInt(s2[0]) + i2];
  }
  get baseurl() {
    return this.base.url;
  }
  get byteRange() {
    return null === this._byteRange ? [] : this._byteRange;
  }
  get byteRangeStartOffset() {
    return this.byteRange[0];
  }
  get byteRangeEndOffset() {
    return this.byteRange[1];
  }
  get elementaryStreams() {
    return null === this._streams && (this._streams = { [F]: null, [N]: null, [B]: null }), this._streams;
  }
  set elementaryStreams(t2) {
    this._streams = t2;
  }
  get hasStats() {
    return null !== this._stats;
  }
  get hasStreams() {
    return null !== this._streams;
  }
  get stats() {
    return null === this._stats && (this._stats = new LoadStats()), this._stats;
  }
  set stats(t2) {
    this._stats = t2;
  }
  get url() {
    return !this._url && this.baseurl && this.relurl && (this._url = O.buildAbsoluteURL(this.baseurl, this.relurl, { alwaysNormalize: true })), this._url || "";
  }
  set url(t2) {
    this._url = t2;
  }
  clearElementaryStreamInfo() {
    const { elementaryStreams: t2 } = this;
    t2[F] = null, t2[N] = null, t2[B] = null;
  }
}
function $(t2) {
  return "initSegment" !== t2.sn;
}
class Fragment extends BaseSegment {
  constructor(t2, e2) {
    super(e2), this._decryptdata = null, this._programDateTime = null, this._ref = null, this._bitrate = void 0, this.rawProgramDateTime = null, this.tagList = [], this.duration = 0, this.sn = 0, this.levelkeys = void 0, this.type = void 0, this.loader = null, this.keyLoader = null, this.level = -1, this.cc = 0, this.startPTS = void 0, this.endPTS = void 0, this.startDTS = void 0, this.endDTS = void 0, this.start = 0, this.playlistOffset = 0, this.deltaPTS = void 0, this.maxStartPTS = void 0, this.minEndPTS = void 0, this.data = void 0, this.bitrateTest = false, this.title = null, this.initSegment = null, this.endList = void 0, this.gap = void 0, this.urlId = 0, this.type = t2;
  }
  get byteLength() {
    if (this.hasStats) {
      const t2 = this.stats.total;
      if (t2) return t2;
    }
    if (this.byteRange.length) {
      const t2 = this.byteRange[0], e2 = this.byteRange[1];
      if (r(t2) && r(e2)) return e2 - t2;
    }
    return null;
  }
  get bitrate() {
    return this.byteLength ? 8 * this.byteLength / this.duration : this._bitrate ? this._bitrate : null;
  }
  set bitrate(t2) {
    this._bitrate = t2;
  }
  get decryptdata() {
    var t2;
    const { levelkeys: e2 } = this;
    if (!e2 || e2.NONE) return null;
    if (e2.identity) this._decryptdata || (this._decryptdata = e2.identity.getDecryptData(this.sn));
    else if (null == (t2 = this._decryptdata) || !t2.keyId) {
      const t3 = Object.keys(e2);
      if (1 === t3.length) {
        const s2 = this._decryptdata = e2[t3[0]] || null;
        s2 && (this._decryptdata = s2.getDecryptData(this.sn, e2));
      }
    }
    return this._decryptdata;
  }
  get end() {
    return this.start + this.duration;
  }
  get endProgramDateTime() {
    if (null === this.programDateTime) return null;
    const t2 = r(this.duration) ? this.duration : 0;
    return this.programDateTime + 1e3 * t2;
  }
  get encrypted() {
    var t2;
    if (null != (t2 = this._decryptdata) && t2.encrypted) return true;
    if (this.levelkeys) {
      var e2;
      const t3 = Object.keys(this.levelkeys), s2 = t3.length;
      if (s2 > 1 || 1 === s2 && null != (e2 = this.levelkeys[t3[0]]) && e2.encrypted) return true;
    }
    return false;
  }
  get programDateTime() {
    return null === this._programDateTime && this.rawProgramDateTime && (this.programDateTime = Date.parse(this.rawProgramDateTime)), this._programDateTime;
  }
  set programDateTime(t2) {
    r(t2) ? this._programDateTime = t2 : this._programDateTime = this.rawProgramDateTime = null;
  }
  get ref() {
    return $(this) ? (this._ref || (this._ref = { base: this.base, start: this.start, duration: this.duration, sn: this.sn, programDateTime: this.programDateTime }), this._ref) : null;
  }
  addStart(t2) {
    this.setStart(this.start + t2);
  }
  setStart(t2) {
    this.start = t2, this._ref && (this._ref.start = t2);
  }
  setDuration(t2) {
    this.duration = t2, this._ref && (this._ref.duration = t2);
  }
  setKeyFormat(t2) {
    const e2 = this.levelkeys;
    if (e2) {
      var s2;
      const i2 = e2[t2];
      !i2 || null != (s2 = this._decryptdata) && s2.keyId || (this._decryptdata = i2.getDecryptData(this.sn, e2));
    }
  }
  abortRequests() {
    var t2, e2;
    null == (t2 = this.loader) || t2.abort(), null == (e2 = this.keyLoader) || e2.abort();
  }
  setElementaryStreamInfo(t2, e2, s2, i2, r2, n2 = false) {
    const { elementaryStreams: a2 } = this, o2 = a2[t2];
    o2 ? (o2.startPTS = Math.min(o2.startPTS, e2), o2.endPTS = Math.max(o2.endPTS, s2), o2.startDTS = Math.min(o2.startDTS, i2), o2.endDTS = Math.max(o2.endDTS, r2)) : a2[t2] = { startPTS: e2, endPTS: s2, startDTS: i2, endDTS: r2, partial: n2 };
  }
}
class Part extends BaseSegment {
  constructor(t2, e2, s2, i2, r2) {
    super(s2), this.fragOffset = 0, this.duration = 0, this.gap = false, this.independent = false, this.relurl = void 0, this.fragment = void 0, this.index = void 0, this.duration = t2.decimalFloatingPoint("DURATION"), this.gap = t2.bool("GAP"), this.independent = t2.bool("INDEPENDENT"), this.relurl = t2.enumeratedString("URI"), this.fragment = e2, this.index = i2;
    const n2 = t2.enumeratedString("BYTERANGE");
    n2 && this.setByteRange(n2, r2), r2 && (this.fragOffset = r2.fragOffset + r2.duration);
  }
  get start() {
    return this.fragment.start + this.fragOffset;
  }
  get end() {
    return this.start + this.duration;
  }
  get loaded() {
    const { elementaryStreams: t2 } = this;
    return !!(t2.audio || t2.video || t2.audiovideo);
  }
}
function U(t2, e2) {
  const s2 = Object.getPrototypeOf(t2);
  if (s2) return Object.getOwnPropertyDescriptor(s2, e2) || U(s2, e2);
}
const G = Math.pow(2, 32) - 1, K = [].push, H = { video: 1, audio: 2, id3: 3, text: 4 };
function V(t2) {
  return String.fromCharCode.apply(null, t2);
}
function Y(t2, e2) {
  const s2 = t2[e2] << 8 | t2[e2 + 1];
  return s2 < 0 ? 65536 + s2 : s2;
}
function W(t2, e2) {
  const s2 = q(t2, e2);
  return s2 < 0 ? 4294967296 + s2 : s2;
}
function j(t2, e2) {
  let s2 = W(t2, e2);
  return s2 *= Math.pow(2, 32), s2 += W(t2, e2 + 4), s2;
}
function q(t2, e2) {
  return t2[e2] << 24 | t2[e2 + 1] << 16 | t2[e2 + 2] << 8 | t2[e2 + 3];
}
function X(t2, e2) {
  const s2 = [];
  if (!e2.length) return s2;
  const i2 = t2.byteLength;
  for (let r2 = 0; r2 < i2; ) {
    const n2 = W(t2, r2), a2 = n2 > 1 ? r2 + n2 : i2;
    if (V(t2.subarray(r2 + 4, r2 + 8)) === e2[0]) if (1 === e2.length) s2.push(t2.subarray(r2 + 8, a2));
    else {
      const i3 = X(t2.subarray(r2 + 8, a2), e2.slice(1));
      i3.length && K.apply(s2, i3);
    }
    r2 = a2;
  }
  return s2;
}
function z(t2) {
  const e2 = [], s2 = t2[0];
  let i2 = 8;
  const r2 = W(t2, i2);
  i2 += 4;
  let n2 = 0, a2 = 0;
  0 === s2 ? (n2 = W(t2, i2), a2 = W(t2, i2 + 4), i2 += 8) : (n2 = j(t2, i2), a2 = j(t2, i2 + 8), i2 += 16), i2 += 2;
  let o2 = t2.length + a2;
  const l2 = Y(t2, i2);
  i2 += 2;
  for (let s3 = 0; s3 < l2; s3++) {
    let s4 = i2;
    const n3 = W(t2, s4);
    s4 += 4;
    const a3 = 2147483647 & n3;
    if (1 == (2147483648 & n3) >>> 31) return I.warn("SIDX has hierarchical references (not supported)"), null;
    const l3 = W(t2, s4);
    s4 += 4, e2.push({ referenceSize: a3, subsegmentDuration: l3, info: { duration: l3 / r2, start: o2, end: o2 + a3 - 1 } }), o2 += a3, s4 += 4, i2 = s4;
  }
  return { earliestPresentationTime: n2, timescale: r2, version: s2, referencesCount: l2, references: e2 };
}
function Q(t2) {
  const e2 = [], s2 = X(t2, ["moov", "trak"]);
  for (let t3 = 0; t3 < s2.length; t3++) {
    const i2 = s2[t3], r2 = X(i2, ["tkhd"])[0];
    if (r2) {
      let t4 = r2[0];
      const s3 = W(r2, 0 === t4 ? 12 : 20), n2 = X(i2, ["mdia", "mdhd"])[0];
      if (n2) {
        t4 = n2[0];
        const r3 = W(n2, 0 === t4 ? 12 : 20), a2 = X(i2, ["mdia", "hdlr"])[0];
        if (a2) {
          const t5 = V(a2.subarray(8, 12)), n3 = { soun: F, vide: N }[t5], o2 = Z(X(i2, ["mdia", "minf", "stbl", "stsd"])[0]);
          n3 ? (e2[s3] = { timescale: r3, type: n3, stsd: o2 }, e2[n3] = T({ timescale: r3, id: s3 }, o2)) : e2[s3] = { timescale: r3, type: t5, stsd: o2 };
        }
      }
    }
  }
  return X(t2, ["moov", "mvex", "trex"]).forEach((t3) => {
    const s3 = W(t3, 4), i2 = e2[s3];
    i2 && (i2.default = { duration: W(t3, 12), flags: W(t3, 20) });
  }), e2;
}
function Z(t2) {
  const e2 = t2.subarray(8), s2 = e2.subarray(86), i2 = V(e2.subarray(4, 8));
  let r2, n2 = i2;
  const a2 = "enca" === i2 || "encv" === i2;
  if (a2) {
    const t3 = X(e2, [i2])[0];
    X(t3.subarray("enca" === i2 ? 28 : 78), ["sinf"]).forEach((t4) => {
      const e3 = X(t4, ["schm"])[0];
      if (e3) {
        const s3 = V(e3.subarray(4, 8));
        if ("cbcs" === s3 || "cenc" === s3) {
          const e4 = X(t4, ["frma"])[0];
          e4 && (n2 = V(e4));
        }
      }
    });
  }
  const o2 = n2;
  switch (n2) {
    case "avc1":
    case "avc2":
    case "avc3":
    case "avc4": {
      const t3 = X(s2, ["avcC"])[0];
      t3 && t3.length > 3 && (n2 += "." + et(t3[1]) + et(t3[2]) + et(t3[3]), r2 = J("avc1" === o2 ? "dva1" : "dvav", s2));
      break;
    }
    case "mp4a": {
      const t3 = X(e2, [i2])[0], s3 = X(t3.subarray(28), ["esds"])[0];
      if (s3 && s3.length > 7) {
        let t4 = 4;
        if (3 !== s3[t4++]) break;
        t4 = tt(s3, t4), t4 += 2;
        const e3 = s3[t4++];
        if (128 & e3 && (t4 += 2), 64 & e3 && (t4 += s3[t4++]), 4 !== s3[t4++]) break;
        t4 = tt(s3, t4);
        const i3 = s3[t4++];
        if (64 !== i3) break;
        if (n2 += "." + et(i3), t4 += 12, 5 !== s3[t4++]) break;
        t4 = tt(s3, t4);
        const r3 = s3[t4++];
        let a3 = (248 & r3) >> 3;
        31 === a3 && (a3 += 1 + ((7 & r3) << 3) + ((224 & s3[t4]) >> 5)), n2 += "." + a3;
      }
      break;
    }
    case "hvc1":
    case "hev1": {
      const t3 = X(s2, ["hvcC"])[0];
      if (t3 && t3.length > 12) {
        const e3 = t3[1], s3 = ["", "A", "B", "C"][e3 >> 6], i3 = 31 & e3, r3 = W(t3, 2), a3 = (32 & e3) >> 5 ? "H" : "L", o3 = t3[12], l2 = t3.subarray(6, 12);
        n2 += "." + s3 + i3, n2 += "." + function(t4) {
          let e4 = 0;
          for (let s4 = 0; s4 < 32; s4++) e4 |= (t4 >> s4 & 1) << 31 - s4;
          return e4 >>> 0;
        }(r3).toString(16).toUpperCase(), n2 += "." + a3 + o3;
        let h2 = "";
        for (let t4 = l2.length; t4--; ) {
          const e4 = l2[t4];
          (e4 || h2) && (h2 = "." + e4.toString(16).toUpperCase() + h2);
        }
        n2 += h2;
      }
      r2 = J("hev1" == o2 ? "dvhe" : "dvh1", s2);
      break;
    }
    case "dvh1":
    case "dvhe":
    case "dvav":
    case "dva1":
    case "dav1":
      n2 = J(n2, s2) || n2;
      break;
    case "vp09": {
      const t3 = X(s2, ["vpcC"])[0];
      if (t3 && t3.length > 6) {
        const e3 = t3[4], s3 = t3[5], i3 = t3[6] >> 4 & 15;
        n2 += "." + st(e3) + "." + st(s3) + "." + st(i3);
      }
      break;
    }
    case "av01": {
      const t3 = X(s2, ["av1C"])[0];
      if (t3 && t3.length > 2) {
        const e3 = t3[1] >>> 5, i3 = 31 & t3[1], a3 = t3[2] >>> 7 ? "H" : "M", o3 = (64 & t3[2]) >> 6, l2 = (32 & t3[2]) >> 5, h2 = 2 === e3 && o3 ? l2 ? 12 : 10 : o3 ? 10 : 8, d2 = (16 & t3[2]) >> 4, c2 = (8 & t3[2]) >> 3, u2 = (4 & t3[2]) >> 2, f2 = 3 & t3[2], g2 = 1, m2 = 1, p2 = 1, v2 = 0;
        n2 += "." + e3 + "." + st(i3) + a3 + "." + st(h2) + "." + d2 + "." + c2 + u2 + f2 + "." + st(g2) + "." + st(m2) + "." + st(p2) + "." + v2, r2 = J("dav1", s2);
      }
      break;
    }
  }
  return { codec: n2, encrypted: a2, supplemental: r2 };
}
function J(t2, e2) {
  const s2 = X(e2, ["dvvC"]), i2 = s2.length ? s2[0] : X(e2, ["dvcC"])[0];
  if (i2) {
    const e3 = i2[2] >> 1 & 127, s3 = i2[2] << 5 & 32 | i2[3] >> 3 & 31;
    return t2 + "." + st(e3) + "." + st(s3);
  }
}
function tt(t2, e2) {
  const s2 = e2 + 5;
  for (; 128 & t2[e2++] && e2 < s2; ) ;
  return e2;
}
function et(t2) {
  return ("0" + t2.toString(16).toUpperCase()).slice(-2);
}
function st(t2) {
  return (t2 < 10 ? "0" : "") + t2;
}
function it(t2, e2) {
  X(t2, ["moov", "trak"]).forEach((t3) => {
    const s2 = X(t3, ["mdia", "minf", "stbl", "stsd"])[0];
    if (!s2) return;
    const i2 = s2.subarray(8);
    let r2 = X(i2, ["enca"]);
    const n2 = r2.length > 0;
    n2 || (r2 = X(i2, ["encv"])), r2.forEach((t4) => {
      X(n2 ? t4.subarray(28) : t4.subarray(78), ["sinf"]).forEach((t5) => {
        const s3 = rt(t5);
        s3 && e2(s3, n2);
      });
    });
  });
}
function rt(t2) {
  const e2 = X(t2, ["schm"])[0];
  if (e2) {
    const s2 = V(e2.subarray(4, 8));
    if ("cbcs" === s2 || "cenc" === s2) {
      const e3 = X(t2, ["schi", "tenc"])[0];
      if (e3) return e3;
    }
  }
}
function nt(t2, e2) {
  const s2 = new Uint8Array(t2.length + e2.length);
  return s2.set(t2), s2.set(e2, t2.length), s2;
}
function at(t2, e2) {
  const s2 = [], i2 = e2.samples, r2 = e2.timescale, n2 = e2.id;
  let a2 = false;
  return X(i2, ["moof"]).map((o2) => {
    const l2 = o2.byteOffset - 8;
    X(o2, ["traf"]).map((o3) => {
      const h2 = X(o3, ["tfdt"]).map((t3) => {
        const e3 = t3[0];
        let s3 = W(t3, 4);
        return 1 === e3 && (s3 *= Math.pow(2, 32), s3 += W(t3, 8)), s3 / r2;
      })[0];
      return void 0 !== h2 && (t2 = h2), X(o3, ["tfhd"]).map((h3) => {
        const d2 = W(h3, 4), c2 = 16777215 & W(h3, 0);
        let u2 = 0;
        const f2 = !!(16 & c2);
        let g2 = 0;
        const m2 = !!(32 & c2);
        let p2 = 8;
        d2 === n2 && (!!(1 & c2) && (p2 += 8), !!(2 & c2) && (p2 += 4), !!(8 & c2) && (u2 = W(h3, p2), p2 += 4), f2 && (g2 = W(h3, p2), p2 += 4), m2 && (p2 += 4), "video" === e2.type && (a2 = ot(e2.codec)), X(o3, ["trun"]).map((n3) => {
          const o4 = n3[0], h4 = 16777215 & W(n3, 0), d3 = !!(1 & h4);
          let c3 = 0;
          const f3 = !!(4 & h4), m3 = !!(256 & h4);
          let p3 = 0;
          const v2 = !!(512 & h4);
          let y2 = 0;
          const E2 = !!(1024 & h4), T2 = !!(2048 & h4);
          let S2 = 0;
          const L2 = W(n3, 4);
          let A2 = 8;
          d3 && (c3 = W(n3, A2), A2 += 4), f3 && (A2 += 4);
          let R2 = c3 + l2;
          for (let l3 = 0; l3 < L2; l3++) {
            if (m3 ? (p3 = W(n3, A2), A2 += 4) : p3 = u2, v2 ? (y2 = W(n3, A2), A2 += 4) : y2 = g2, E2 && (A2 += 4), T2 && (S2 = 0 === o4 ? W(n3, A2) : q(n3, A2), A2 += 4), e2.type === N) {
              let e3 = 0;
              for (; e3 < y2; ) {
                const n4 = W(i2, R2);
                R2 += 4, lt(a2, i2[R2]) && ht(i2.subarray(R2, R2 + n4), a2 ? 2 : 1, t2 + S2 / r2, s2), R2 += n4, e3 += n4 + 4;
              }
            }
            t2 += p3 / r2;
          }
        }));
      });
    });
  }), s2;
}
function ot(t2) {
  if (!t2) return false;
  const e2 = t2.substring(0, 4);
  return "hvc1" === e2 || "hev1" === e2 || "dvh1" === e2 || "dvhe" === e2;
}
function lt(t2, e2) {
  if (t2) {
    const t3 = e2 >> 1 & 63;
    return 39 === t3 || 40 === t3;
  }
  return 6 == (31 & e2);
}
function ht(t2, e2, s2, i2) {
  const r2 = dt(t2);
  let n2 = 0;
  n2 += e2;
  let a2 = 0, o2 = 0, l2 = 0;
  for (; n2 < r2.length; ) {
    a2 = 0;
    do {
      if (n2 >= r2.length) break;
      l2 = r2[n2++], a2 += l2;
    } while (255 === l2);
    o2 = 0;
    do {
      if (n2 >= r2.length) break;
      l2 = r2[n2++], o2 += l2;
    } while (255 === l2);
    const t3 = r2.length - n2;
    let e3 = n2;
    if (o2 < t3) n2 += o2;
    else if (o2 > t3) {
      I.error(`Malformed SEI payload. ${o2} is too small, only ${t3} bytes left to parse.`);
      break;
    }
    if (4 === a2) {
      if (181 === r2[e3++]) {
        const t4 = Y(r2, e3);
        if (e3 += 2, 49 === t4) {
          const t5 = W(r2, e3);
          if (e3 += 4, 1195456820 === t5) {
            const t6 = r2[e3++];
            if (3 === t6) {
              const n3 = r2[e3++], o3 = 64 & n3, l3 = o3 ? 2 + 3 * (31 & n3) : 0, h2 = new Uint8Array(l3);
              if (o3) {
                h2[0] = n3;
                for (let t7 = 1; t7 < l3; t7++) h2[t7] = r2[e3++];
              }
              i2.push({ type: t6, payloadType: a2, pts: s2, bytes: h2 });
            }
          }
        }
      }
    } else if (5 === a2 && o2 > 16) {
      const t4 = [];
      for (let s3 = 0; s3 < 16; s3++) {
        const i3 = r2[e3++].toString(16);
        t4.push(1 == i3.length ? "0" + i3 : i3), 3 !== s3 && 5 !== s3 && 7 !== s3 && 9 !== s3 || t4.push("-");
      }
      const n3 = o2 - 16, l3 = new Uint8Array(n3);
      for (let t5 = 0; t5 < n3; t5++) l3[t5] = r2[e3++];
      i2.push({ payloadType: a2, pts: s2, uuid: t4.join(""), userData: D(l3), userDataBytes: l3 });
    }
  }
}
function dt(t2) {
  const e2 = t2.byteLength, s2 = [];
  let i2 = 1;
  for (; i2 < e2 - 2; ) 0 === t2[i2] && 0 === t2[i2 + 1] && 3 === t2[i2 + 2] ? (s2.push(i2 + 2), i2 += 2) : i2++;
  if (0 === s2.length) return t2;
  const r2 = e2 - s2.length, n2 = new Uint8Array(r2);
  let a2 = 0;
  for (i2 = 0; i2 < r2; a2++, i2++) a2 === s2[0] && (a2++, s2.shift()), n2[i2] = t2[a2];
  return n2;
}
function ct(t2) {
  const e2 = t2.getUint32(0), s2 = t2.byteOffset, i2 = t2.byteLength;
  if (i2 < e2) return { offset: s2, size: i2 };
  if (1886614376 !== t2.getUint32(4)) return { offset: s2, size: e2 };
  const r2 = t2.getUint32(8) >>> 24;
  if (0 !== r2 && 1 !== r2) return { offset: s2, size: e2 };
  const n2 = t2.buffer, a2 = _(new Uint8Array(n2, s2 + 12, 16));
  let o2 = null, l2 = null, h2 = 0;
  if (0 === r2) h2 = 28;
  else {
    const r3 = t2.getUint32(28);
    if (!r3 || i2 < 32 + 16 * r3) return { offset: s2, size: e2 };
    o2 = [];
    for (let t3 = 0; t3 < r3; t3++) o2.push(new Uint8Array(n2, s2 + 32 + 16 * t3, 16));
    h2 = 32 + 16 * r3;
  }
  if (!h2) return { offset: s2, size: e2 };
  const d2 = t2.getUint32(h2);
  return e2 - 32 < d2 ? { offset: s2, size: e2 } : (l2 = new Uint8Array(n2, s2 + h2 + 4, d2), { version: r2, systemId: a2, kids: o2, data: l2, offset: s2, size: e2 });
}
const ut = () => /\(Windows.+Firefox\//i.test(navigator.userAgent), ft = { audio: { a3ds: 1, "ac-3": 0.95, "ac-4": 1, alac: 0.9, alaw: 1, dra1: 1, "dts+": 1, "dts-": 1, dtsc: 1, dtse: 1, dtsh: 1, "ec-3": 0.9, enca: 1, fLaC: 0.9, flac: 0.9, FLAC: 0.9, g719: 1, g726: 1, m4ae: 1, mha1: 1, mha2: 1, mhm1: 1, mhm2: 1, mlpa: 1, mp4a: 1, "raw ": 1, Opus: 1, opus: 1, samr: 1, sawb: 1, sawp: 1, sevc: 1, sqcp: 1, ssmv: 1, twos: 1, ulaw: 1 }, video: { avc1: 1, avc2: 1, avc3: 1, avc4: 1, avcp: 1, av01: 0.8, dav1: 0.8, drac: 1, dva1: 1, dvav: 1, dvh1: 0.7, dvhe: 0.7, encv: 1, hev1: 0.75, hvc1: 0.75, mjp2: 1, mp4v: 1, mvc1: 1, mvc2: 1, mvc3: 1, mvc4: 1, resv: 1, rv60: 1, s263: 1, svc1: 1, svc2: 1, "vc-1": 1, vp08: 1, vp09: 0.9 }, text: { stpp: 1, wvtt: 1 } };
function gt(t2, e2) {
  const s2 = ft[e2];
  return !!s2 && !!s2[t2.slice(0, 4)];
}
function mt(t2, e2, s2 = true) {
  return !t2.split(",").some((t3) => !pt(t3, e2, s2));
}
function pt(t2, e2, s2 = true) {
  var i2;
  const r2 = k(s2);
  return null != (i2 = null == r2 ? void 0 : r2.isTypeSupported(vt(t2, e2))) && i2;
}
function vt(t2, e2) {
  return `${e2}/mp4;codecs=${t2}`;
}
function yt(t2) {
  if (t2) {
    const e2 = t2.substring(0, 4);
    return ft.video[e2];
  }
  return 2;
}
function Et(t2) {
  const e2 = ut();
  return t2.split(",").reduce((t3, s2) => {
    const i2 = e2 && ot(s2) ? 9 : ft.video[s2];
    return i2 ? (2 * i2 + t3) / (t3 ? 3 : 2) : (ft.audio[s2] + t3) / (t3 ? 2 : 1);
  }, 0);
}
const Tt = {}, St = /flac|opus|mp4a\.40\.34/i;
function Lt(t2, e2 = true) {
  return t2.replace(St, (t3) => function(t4, e3 = true) {
    if (Tt[t4]) return Tt[t4];
    const s2 = { flac: ["flac", "fLaC", "FLAC"], opus: ["opus", "Opus"], "mp4a.40.34": ["mp3"] }[t4];
    for (let r2 = 0; r2 < s2.length; r2++) {
      var i2;
      if (pt(s2[r2], "audio", e3)) return Tt[t4] = s2[r2], s2[r2];
      if ("mp3" === s2[r2] && null != (i2 = k(e3)) && i2.isTypeSupported("audio/mpeg")) return "";
    }
    return t4;
  }(t3.toLowerCase(), e2));
}
function At(t2, e2) {
  if (t2 && (t2.length > 4 || -1 !== ["ac-3", "ec-3", "alac", "fLaC", "Opus"].indexOf(t2)) && (Rt(t2, "audio") || Rt(t2, "video"))) return t2;
  if (e2) {
    const s2 = e2.split(",");
    if (s2.length > 1) {
      if (t2) {
        for (let e3 = s2.length; e3--; ) if (s2[e3].substring(0, 4) === t2.substring(0, 4)) return s2[e3];
      }
      return s2[0];
    }
  }
  return e2 || t2;
}
function Rt(t2, e2) {
  return gt(t2, e2) && pt(t2, e2);
}
function bt(t2) {
  if (t2.startsWith("av01.")) {
    const e2 = t2.split("."), s2 = ["0", "111", "01", "01", "01", "0"];
    for (let t3 = e2.length; t3 > 4 && t3 < 10; t3++) e2[t3] = s2[t3 - 4];
    return e2.join(".");
  }
  return t2;
}
function It(t2) {
  const e2 = k(t2) || { isTypeSupported: () => false };
  return { mpeg: e2.isTypeSupported("audio/mpeg"), mp3: e2.isTypeSupported('audio/mp4; codecs="mp3"'), ac3: e2.isTypeSupported('audio/mp4; codecs="ac-3"') };
}
function kt(t2) {
  return t2.replace(/^.+codecs=["']?([^"']+).*$/, "$1");
}
const Pt = { supported: false, smooth: false, powerEfficient: false }, Dt = { supported: true, configurations: [], decodingInfoResults: [{ supported: true, powerEfficient: true, smooth: true }] };
function _t(t2, e2) {
  return { supported: false, configurations: e2, decodingInfoResults: [Pt], error: t2 };
}
function Ct(t2, e2, s2, i2, n2, a2) {
  const o2 = t2.videoCodec, l2 = t2.audioCodec ? t2.audioGroups : null, h2 = null == a2 ? void 0 : a2.audioCodec, d2 = null == a2 ? void 0 : a2.channels, c2 = d2 ? parseInt(d2) : h2 ? 1 / 0 : 2;
  let u2 = null;
  if (null != l2 && l2.length) try {
    u2 = 1 === l2.length && l2[0] ? e2.groups[l2[0]].channels : l2.reduce((t3, s3) => {
      if (s3) {
        const i3 = e2.groups[s3];
        if (!i3) throw new Error(`Audio track group ${s3} not found`);
        Object.keys(i3.channels).forEach((e3) => {
          t3[e3] = (t3[e3] || 0) + i3.channels[e3];
        });
      }
      return t3;
    }, { 2: 0 });
  } catch (t3) {
    return true;
  }
  return void 0 !== o2 && (o2.split(",").some((t3) => ot(t3)) || t2.width > 1920 && t2.height > 1088 || t2.height > 1920 && t2.width > 1088 || t2.frameRate > Math.max(i2, 30) || "SDR" !== t2.videoRange && t2.videoRange !== s2 || t2.bitrate > Math.max(n2, 8e6)) || !!u2 && r(c2) && Object.keys(u2).some((t3) => parseInt(t3) > c2);
}
function wt(t2, e2, s2, i2 = {}) {
  const r2 = t2.videoCodec;
  if (!r2 && !t2.audioCodec || !s2) return Promise.resolve(Dt);
  const n2 = [], a2 = function(t3) {
    var e3;
    const s3 = null == (e3 = t3.videoCodec) ? void 0 : e3.split(","), i3 = xt(t3), r3 = t3.width || 640, n3 = t3.height || 480, a3 = t3.frameRate || 30, o3 = t3.videoRange.toLowerCase();
    return s3 ? s3.map((t4) => {
      const e4 = { contentType: vt(bt(t4), "video"), width: r3, height: n3, bitrate: i3, framerate: a3 };
      return "sdr" !== o3 && (e4.transferFunction = o3), e4;
    }) : [];
  }(t2), o2 = a2.length, l2 = function(t3, e3, s3) {
    var i3;
    const r3 = null == (i3 = t3.audioCodec) ? void 0 : i3.split(","), n3 = xt(t3);
    return r3 && t3.audioGroups ? t3.audioGroups.reduce((t4, i4) => {
      var a3;
      const o3 = i4 ? null == (a3 = e3.groups[i4]) ? void 0 : a3.tracks : null;
      return o3 ? o3.reduce((t5, e4) => {
        if (e4.groupId === i4) {
          const i5 = parseFloat(e4.channels || "");
          r3.forEach((e5) => {
            const r4 = { contentType: vt(e5, "audio"), bitrate: s3 ? Mt(e5, n3) : n3 };
            i5 && (r4.channels = "" + i5), t5.push(r4);
          });
        }
        return t5;
      }, t4) : t4;
    }, []) : [];
  }(t2, e2, o2 > 0), h2 = l2.length;
  for (let t3 = o2 || 1 * h2 || 1; t3--; ) {
    const e3 = { type: "media-source" };
    if (o2 && (e3.video = a2[t3 % o2]), h2) {
      e3.audio = l2[t3 % h2];
      const s3 = e3.audio.bitrate;
      e3.video && s3 && (e3.video.bitrate -= s3);
    }
    n2.push(e3);
  }
  if (r2) {
    const t3 = navigator.userAgent;
    if (r2.split(",").some((t4) => ot(t4)) && ut()) return Promise.resolve(_t(new Error(`Overriding Windows Firefox HEVC MediaCapabilities result based on user-agent string: (${t3})`), n2));
  }
  return Promise.all(n2.map((t3) => {
    const e3 = function(t4) {
      let e4 = "";
      const { audio: s3, video: i3 } = t4;
      return i3 && (e4 += `${kt(i3.contentType)}_r${i3.height}x${i3.width}f${Math.ceil(i3.framerate)}${i3.transferFunction || "sd"}_${Math.ceil(i3.bitrate / 1e5)}`), s3 && (e4 += `${i3 ? "_" : ""}${kt(s3.contentType)}_c${s3.channels}`), e4;
    }(t3);
    return i2[e3] || (i2[e3] = s2.decodingInfo(t3));
  })).then((t3) => ({ supported: !t3.some((t4) => !t4.supported), configurations: n2, decodingInfoResults: t3 })).catch((t3) => ({ supported: false, configurations: n2, decodingInfoResults: [], error: t3 }));
}
function Mt(t2, e2) {
  if (e2 <= 1) return 1;
  let s2 = 128e3;
  return "ec-3" === t2 ? s2 = 768e3 : "ac-3" === t2 && (s2 = 64e4), Math.min(e2 / 2, s2);
}
function xt(t2) {
  return 1e3 * Math.ceil(Math.max(0.9 * t2.bitrate, t2.averageBitrate) / 1e3) || 1;
}
const Ot = ["NONE", "TYPE-0", "TYPE-1", null], Ft = ["SDR", "PQ", "HLG"];
function Nt(t2) {
  const { canSkipUntil: e2, canSkipDateRanges: s2, age: i2 } = t2;
  return e2 && i2 < e2 / 2 ? s2 ? "v2" : "YES" : "";
}
class HlsUrlParameters {
  constructor(t2, e2, s2) {
    this.msn = void 0, this.part = void 0, this.skip = void 0, this.msn = t2, this.part = e2, this.skip = s2;
  }
  addDirectives(t2) {
    const e2 = new self.URL(t2);
    return void 0 !== this.msn && e2.searchParams.set("_HLS_msn", this.msn.toString()), void 0 !== this.part && e2.searchParams.set("_HLS_part", this.part.toString()), this.skip && e2.searchParams.set("_HLS_skip", this.skip), e2.href;
  }
}
class Level {
  constructor(t2) {
    if (this._attrs = void 0, this.audioCodec = void 0, this.bitrate = void 0, this.codecSet = void 0, this.url = void 0, this.frameRate = void 0, this.height = void 0, this.id = void 0, this.name = void 0, this.supplemental = void 0, this.videoCodec = void 0, this.width = void 0, this.details = void 0, this.fragmentError = 0, this.loadError = 0, this.loaded = void 0, this.realBitrate = 0, this.supportedPromise = void 0, this.supportedResult = void 0, this._avgBitrate = 0, this._audioGroups = void 0, this._subtitleGroups = void 0, this._urlId = 0, this.url = [t2.url], this._attrs = [t2.attrs], this.bitrate = t2.bitrate, t2.details && (this.details = t2.details), this.id = t2.id || 0, this.name = t2.name, this.width = t2.width || 0, this.height = t2.height || 0, this.frameRate = t2.attrs.optionalFloat("FRAME-RATE", 0), this._avgBitrate = t2.attrs.decimalInteger("AVERAGE-BANDWIDTH"), this.audioCodec = t2.audioCodec, this.videoCodec = t2.videoCodec, this.codecSet = [t2.videoCodec, t2.audioCodec].filter((t3) => !!t3).map((t3) => t3.substring(0, 4)).join(","), "supplemental" in t2) {
      var e2;
      this.supplemental = t2.supplemental;
      const s2 = null == (e2 = t2.supplemental) ? void 0 : e2.videoCodec;
      s2 && s2 !== t2.videoCodec && (this.codecSet += `,${s2.substring(0, 4)}`);
    }
    this.addGroupId("audio", t2.attrs.AUDIO), this.addGroupId("text", t2.attrs.SUBTITLES);
  }
  get maxBitrate() {
    return Math.max(this.realBitrate, this.bitrate);
  }
  get averageBitrate() {
    return this._avgBitrate || this.realBitrate || this.bitrate;
  }
  get attrs() {
    return this._attrs[0];
  }
  get codecs() {
    return this.attrs.CODECS || "";
  }
  get pathwayId() {
    return this.attrs["PATHWAY-ID"] || ".";
  }
  get videoRange() {
    return this.attrs["VIDEO-RANGE"] || "SDR";
  }
  get score() {
    return this.attrs.optionalFloat("SCORE", 0);
  }
  get uri() {
    return this.url[0] || "";
  }
  hasAudioGroup(t2) {
    return Bt(this._audioGroups, t2);
  }
  hasSubtitleGroup(t2) {
    return Bt(this._subtitleGroups, t2);
  }
  get audioGroups() {
    return this._audioGroups;
  }
  get subtitleGroups() {
    return this._subtitleGroups;
  }
  addGroupId(t2, e2) {
    if (e2) {
      if ("audio" === t2) {
        let t3 = this._audioGroups;
        t3 || (t3 = this._audioGroups = []), -1 === t3.indexOf(e2) && t3.push(e2);
      } else if ("text" === t2) {
        let t3 = this._subtitleGroups;
        t3 || (t3 = this._subtitleGroups = []), -1 === t3.indexOf(e2) && t3.push(e2);
      }
    }
  }
  get urlId() {
    return 0;
  }
  set urlId(t2) {
  }
  get audioGroupIds() {
    return this.audioGroups ? [this.audioGroupId] : void 0;
  }
  get textGroupIds() {
    return this.subtitleGroups ? [this.textGroupId] : void 0;
  }
  get audioGroupId() {
    var t2;
    return null == (t2 = this.audioGroups) ? void 0 : t2[0];
  }
  get textGroupId() {
    var t2;
    return null == (t2 = this.subtitleGroups) ? void 0 : t2[0];
  }
  addFallback() {
  }
}
function Bt(t2, e2) {
  return !(!e2 || !t2) && -1 !== t2.indexOf(e2);
}
const $t = (t2, e2) => JSON.stringify(t2, /* @__PURE__ */ ((t3) => {
  const e3 = /* @__PURE__ */ new WeakSet();
  return (s2, i2) => {
    if (t3 && (i2 = t3(s2, i2)), "object" == typeof i2 && null !== i2) {
      if (e3.has(i2)) return;
      e3.add(i2);
    }
    return i2;
  };
})(e2));
function Ut(t2, e2) {
  I.log(`[abr] start candidates with "${t2}" ignored because ${e2}`);
}
function Gt(t2) {
  return t2.reduce((t3, e2) => {
    let s2 = t3.groups[e2.groupId];
    s2 || (s2 = t3.groups[e2.groupId] = { tracks: [], channels: { 2: 0 }, hasDefault: false, hasAutoSelect: false }), s2.tracks.push(e2);
    const i2 = e2.channels || "2";
    return s2.channels[i2] = (s2.channels[i2] || 0) + 1, s2.hasDefault = s2.hasDefault || e2.default, s2.hasAutoSelect = s2.hasAutoSelect || e2.autoselect, s2.hasDefault && (t3.hasDefaultAudio = true), s2.hasAutoSelect && (t3.hasAutoSelectAudio = true), t3;
  }, { hasDefaultAudio: false, hasAutoSelectAudio: false, groups: {} });
}
function Kt(t2) {
  if (!t2) return t2;
  const { lang: e2, assocLang: s2, characteristics: i2, channels: r2, audioCodec: n2 } = t2;
  return { lang: e2, assocLang: s2, characteristics: i2, channels: r2, audioCodec: n2 };
}
function Ht(t2, e2, s2) {
  if ("attrs" in t2) {
    const s3 = e2.indexOf(t2);
    if (-1 !== s3) return s3;
  }
  for (let i2 = 0; i2 < e2.length; i2++) if (Vt(t2, e2[i2], s2)) return i2;
  return -1;
}
function Vt(t2, e2, s2) {
  const { groupId: i2, name: r2, lang: n2, assocLang: a2, default: o2 } = t2, l2 = t2.forced;
  return (void 0 === i2 || e2.groupId === i2) && (void 0 === r2 || e2.name === r2) && (void 0 === n2 || function(t3, e3 = "--") {
    return t3.length === e3.length ? t3 === e3 : t3.startsWith(e3) || e3.startsWith(t3);
  }(n2, e2.lang)) && (void 0 === n2 || e2.assocLang === a2) && (void 0 === o2 || e2.default === o2) && (void 0 === l2 || e2.forced === l2) && (!("characteristics" in t2) || function(t3, e3 = "") {
    const s3 = t3.split(","), i3 = e3.split(",");
    return s3.length === i3.length && !s3.some((t4) => -1 === i3.indexOf(t4));
  }(t2.characteristics || "", e2.characteristics)) && (void 0 === s2 || s2(t2, e2));
}
function Yt(t2, e2) {
  const { audioCodec: s2, channels: i2 } = t2;
  return !(void 0 !== s2 && (e2.audioCodec || "").substring(0, 4) !== s2.substring(0, 4) || void 0 !== i2 && i2 !== (e2.channels || "2"));
}
function Wt(t2, e2, s2) {
  for (let i2 = e2; i2 > -1; i2--) if (s2(t2[i2])) return i2;
  for (let i2 = e2 + 1; i2 < t2.length; i2++) if (s2(t2[i2])) return i2;
  return -1;
}
function jt(t2, e2) {
  var s2;
  return !!t2 && t2 !== (null == (s2 = e2.loadLevelObj) ? void 0 : s2.uri);
}
const qt = function(t2, e2) {
  let s2 = 0, i2 = t2.length - 1, r2 = null, n2 = null;
  for (; s2 <= i2; ) {
    r2 = (s2 + i2) / 2 | 0, n2 = t2[r2];
    const a2 = e2(n2);
    if (a2 > 0) s2 = r2 + 1;
    else {
      if (!(a2 < 0)) return n2;
      i2 = r2 - 1;
    }
  }
  return null;
};
function Xt(t2, e2, s2 = 0, i2 = 0, r2 = 5e-3) {
  let n2 = null;
  if (t2) {
    n2 = e2[1 + t2.sn - e2[0].sn] || null;
    const i3 = t2.endDTS - s2;
    i3 > 0 && i3 < 15e-7 && (s2 += 15e-7), n2 && t2.level !== n2.level && n2.end <= t2.end && (n2 = e2[2 + t2.sn - e2[0].sn] || null);
  } else 0 === s2 && 0 === e2[0].start && (n2 = e2[0]);
  if (n2 && ((!t2 || t2.level === n2.level) && 0 === zt(s2, i2, n2) || function(t3, e3, s3) {
    if (e3 && 0 === e3.start && e3.level < t3.level && (e3.endPTS || 0) > 0) {
      const i3 = e3.tagList.reduce((t4, e4) => ("INF" === e4[0] && (t4 += parseFloat(e4[1])), t4), s3);
      return t3.start <= i3;
    }
    return false;
  }(n2, t2, Math.min(r2, i2)))) return n2;
  const a2 = qt(e2, zt.bind(null, s2, i2));
  return !a2 || a2 === t2 && n2 ? n2 : a2;
}
function zt(t2 = 0, e2 = 0, s2) {
  if (s2.start <= t2 && s2.start + s2.duration > t2) return 0;
  const i2 = Math.min(e2, s2.duration + (s2.deltaPTS ? s2.deltaPTS : 0));
  return s2.start + s2.duration - i2 <= t2 ? 1 : s2.start - i2 > t2 && s2.start ? -1 : 0;
}
function Qt(t2, e2, s2) {
  const i2 = 1e3 * Math.min(e2, s2.duration + (s2.deltaPTS ? s2.deltaPTS : 0));
  return (s2.endProgramDateTime || 0) - i2 > t2;
}
function Zt(t2, e2, s2) {
  if (t2 && t2.startCC <= e2 && t2.endCC >= e2) {
    let i2 = t2.fragments;
    const { fragmentHint: r2 } = t2;
    let n2;
    return r2 && (i2 = i2.concat(r2)), qt(i2, (t3) => t3.cc < e2 ? 1 : t3.cc > e2 ? -1 : (n2 = t3, t3.end <= s2 ? 1 : t3.start > s2 ? -1 : 0)), n2 || null;
  }
  return null;
}
function Jt(t2) {
  switch (t2.details) {
    case l.FRAG_LOAD_TIMEOUT:
    case l.KEY_LOAD_TIMEOUT:
    case l.LEVEL_LOAD_TIMEOUT:
    case l.MANIFEST_LOAD_TIMEOUT:
      return true;
  }
  return false;
}
function te(t2) {
  return t2.details.startsWith("key");
}
function ee(t2) {
  return te(t2) && !!t2.frag && !t2.frag.decryptdata;
}
function se(t2, e2) {
  const s2 = Jt(e2);
  return t2.default[(s2 ? "timeout" : "error") + "Retry"];
}
function ie(t2, e2) {
  const s2 = "linear" === t2.backoff ? 1 : Math.pow(2, e2);
  return Math.min(s2 * t2.retryDelayMs, t2.maxRetryDelayMs);
}
function re(t2) {
  return T(T({}, t2), { errorRetry: null, timeoutRetry: null });
}
function ne(t2, e2, s2, i2) {
  if (!t2) return false;
  const r2 = null == i2 ? void 0 : i2.code, n2 = e2 < t2.maxNumRetry && (function(t3) {
    return ae(t3) || !!t3 && (t3 < 400 || t3 > 499);
  }(r2) || !!s2);
  return t2.shouldRetry ? t2.shouldRetry(t2, e2, s2, i2, n2) : n2;
}
function ae(t2) {
  return 0 === t2 && false === navigator.onLine;
}
function oe(t2) {
  const e2 = { action: 0, flags: 0 };
  return t2 && (e2.resolved = true), e2;
}
var le = "NOT_LOADED", he = "APPENDING", de = "PARTIAL", ce = "OK";
class FragmentTracker {
  constructor(t2) {
    this.activePartLists = /* @__PURE__ */ Object.create(null), this.endListFragments = /* @__PURE__ */ Object.create(null), this.fragments = /* @__PURE__ */ Object.create(null), this.timeRanges = /* @__PURE__ */ Object.create(null), this.bufferPadding = 0.2, this.hls = void 0, this.hasGaps = false, this.hls = t2, this._registerListeners();
  }
  _registerListeners() {
    const { hls: t2 } = this;
    t2 && (t2.on(h.MANIFEST_LOADING, this.onManifestLoading, this), t2.on(h.BUFFER_APPENDED, this.onBufferAppended, this), t2.on(h.FRAG_BUFFERED, this.onFragBuffered, this), t2.on(h.FRAG_LOADED, this.onFragLoaded, this));
  }
  _unregisterListeners() {
    const { hls: t2 } = this;
    t2 && (t2.off(h.MANIFEST_LOADING, this.onManifestLoading, this), t2.off(h.BUFFER_APPENDED, this.onBufferAppended, this), t2.off(h.FRAG_BUFFERED, this.onFragBuffered, this), t2.off(h.FRAG_LOADED, this.onFragLoaded, this));
  }
  destroy() {
    this._unregisterListeners(), this.hls = this.fragments = this.activePartLists = this.endListFragments = this.timeRanges = null;
  }
  getAppendedFrag(t2, e2) {
    const s2 = this.activePartLists[e2];
    if (s2) for (let e3 = s2.length; e3--; ) {
      const i2 = s2[e3];
      if (!i2) break;
      if (i2.start <= t2 && t2 <= i2.end && i2.loaded) return i2;
    }
    return this.getBufferedFrag(t2, e2);
  }
  getBufferedFrag(t2, e2) {
    return this.getFragAtPos(t2, e2, true);
  }
  getFragAtPos(t2, e2, s2) {
    const { fragments: i2 } = this, r2 = Object.keys(i2);
    for (let n2 = r2.length; n2--; ) {
      const a2 = i2[r2[n2]];
      if ((null == a2 ? void 0 : a2.body.type) === e2 && (!s2 || a2.buffered)) {
        const e3 = a2.body;
        if (e3.start <= t2 && t2 <= e3.end) return e3;
      }
    }
    return null;
  }
  detectEvictedFragments(t2, e2, s2, i2, r2) {
    this.timeRanges && (this.timeRanges[t2] = e2);
    const n2 = (null == i2 ? void 0 : i2.fragment.sn) || -1;
    Object.keys(this.fragments).forEach((i3) => {
      const a2 = this.fragments[i3];
      if (!a2) return;
      if (n2 >= a2.body.sn) return;
      if (!a2.buffered && (!a2.loaded || r2)) return void (a2.body.type === s2 && this.removeFragment(a2.body));
      const o2 = a2.range[t2];
      o2 && (0 !== o2.time.length ? o2.time.some((t3) => {
        const s3 = !this.isTimeBuffered(t3.startPTS, t3.endPTS, e2);
        return s3 && this.removeFragment(a2.body), s3;
      }) : this.removeFragment(a2.body));
    });
  }
  detectPartialFragments(t2) {
    const e2 = this.timeRanges;
    if (!e2 || "initSegment" === t2.frag.sn) return;
    const s2 = t2.frag, i2 = fe(s2), r2 = this.fragments[i2];
    if (!r2 || r2.buffered && s2.gap) return;
    const n2 = !s2.relurl;
    Object.keys(e2).forEach((i3) => {
      const a2 = s2.elementaryStreams[i3];
      if (!a2) return;
      const o2 = e2[i3], l2 = n2 || true === a2.partial;
      r2.range[i3] = this.getBufferedTimes(s2, t2.part, l2, o2);
    }), r2.loaded = null, Object.keys(r2.range).length ? (this.bufferedEnd(r2, s2), ue(r2) || this.removeParts(s2.sn - 1, s2.type)) : this.removeFragment(r2.body);
  }
  bufferedEnd(t2, e2) {
    t2.buffered = true, (t2.body.endList = e2.endList || t2.body.endList) && (this.endListFragments[t2.body.type] = t2);
  }
  removeParts(t2, e2) {
    const s2 = this.activePartLists[e2];
    s2 && (this.activePartLists[e2] = ge(s2, (e3) => e3.fragment.sn >= t2));
  }
  fragBuffered(t2, e2) {
    const s2 = fe(t2);
    let i2 = this.fragments[s2];
    !i2 && e2 && (i2 = this.fragments[s2] = { body: t2, appendedPTS: null, loaded: null, buffered: false, range: /* @__PURE__ */ Object.create(null) }, t2.gap && (this.hasGaps = true)), i2 && (i2.loaded = null, this.bufferedEnd(i2, t2));
  }
  getBufferedTimes(t2, e2, s2, i2) {
    const r2 = { time: [], partial: s2 }, n2 = t2.start, a2 = t2.end, o2 = t2.minEndPTS || a2, l2 = t2.maxStartPTS || n2;
    for (let t3 = 0; t3 < i2.length; t3++) {
      const e3 = i2.start(t3) - this.bufferPadding, s3 = i2.end(t3) + this.bufferPadding;
      if (l2 >= e3 && o2 <= s3) {
        r2.time.push({ startPTS: Math.max(n2, i2.start(t3)), endPTS: Math.min(a2, i2.end(t3)) });
        break;
      }
      if (n2 < s3 && a2 > e3) {
        const e4 = Math.max(n2, i2.start(t3)), s4 = Math.min(a2, i2.end(t3));
        s4 > e4 && (r2.partial = true, r2.time.push({ startPTS: e4, endPTS: s4 }));
      } else if (a2 <= e3) break;
    }
    return r2;
  }
  getPartialFragment(t2) {
    let e2, s2, i2, r2 = null, n2 = 0;
    const { bufferPadding: a2, fragments: o2 } = this;
    return Object.keys(o2).forEach((l2) => {
      const h2 = o2[l2];
      h2 && ue(h2) && (s2 = h2.body.start - a2, i2 = h2.body.end + a2, t2 >= s2 && t2 <= i2 && (e2 = Math.min(t2 - s2, i2 - t2), n2 <= e2 && (r2 = h2.body, n2 = e2)));
    }), r2;
  }
  isEndListAppended(t2) {
    const e2 = this.endListFragments[t2];
    return void 0 !== e2 && (e2.buffered || ue(e2));
  }
  getState(t2) {
    const e2 = fe(t2), s2 = this.fragments[e2];
    return s2 ? s2.buffered ? ue(s2) ? de : ce : he : le;
  }
  isTimeBuffered(t2, e2, s2) {
    let i2, r2;
    for (let n2 = 0; n2 < s2.length; n2++) {
      if (i2 = s2.start(n2) - this.bufferPadding, r2 = s2.end(n2) + this.bufferPadding, t2 >= i2 && e2 <= r2) return true;
      if (e2 <= i2) return false;
    }
    return false;
  }
  onManifestLoading() {
    this.removeAllFragments();
  }
  onFragLoaded(t2, e2) {
    if ("initSegment" === e2.frag.sn || e2.frag.bitrateTest) return;
    const s2 = e2.frag, i2 = e2.part ? null : e2, r2 = fe(s2);
    this.fragments[r2] = { body: s2, appendedPTS: null, loaded: i2, buffered: false, range: /* @__PURE__ */ Object.create(null) };
  }
  onBufferAppended(t2, e2) {
    const { frag: s2, part: i2, timeRanges: r2, type: n2 } = e2;
    if ("initSegment" === s2.sn) return;
    const a2 = s2.type;
    if (i2) {
      let t3 = this.activePartLists[a2];
      t3 || (this.activePartLists[a2] = t3 = []), t3.push(i2);
    }
    this.timeRanges = r2;
    const o2 = r2[n2];
    this.detectEvictedFragments(n2, o2, a2, i2);
  }
  onFragBuffered(t2, e2) {
    this.detectPartialFragments(e2);
  }
  hasFragment(t2) {
    const e2 = fe(t2);
    return !!this.fragments[e2];
  }
  hasFragments(t2) {
    const { fragments: e2 } = this, s2 = Object.keys(e2);
    if (!t2) return s2.length > 0;
    for (let i2 = s2.length; i2--; ) {
      const r2 = e2[s2[i2]];
      if ((null == r2 ? void 0 : r2.body.type) === t2) return true;
    }
    return false;
  }
  hasParts(t2) {
    var e2;
    return !(null == (e2 = this.activePartLists[t2]) || !e2.length);
  }
  removeFragmentsInRange(t2, e2, s2, i2, r2) {
    i2 && !this.hasGaps || Object.keys(this.fragments).forEach((n2) => {
      const a2 = this.fragments[n2];
      if (!a2) return;
      const o2 = a2.body;
      o2.type !== s2 || i2 && !o2.gap || o2.start < e2 && o2.end > t2 && (a2.buffered || r2) && this.removeFragment(o2);
    });
  }
  removeFragment(t2) {
    const e2 = fe(t2);
    t2.clearElementaryStreamInfo();
    const s2 = this.activePartLists[t2.type];
    if (s2) {
      const e3 = t2.sn;
      this.activePartLists[t2.type] = ge(s2, (t3) => t3.fragment.sn !== e3);
    }
    delete this.fragments[e2], t2.endList && delete this.endListFragments[t2.type];
  }
  removeAllFragments() {
    var t2;
    this.fragments = /* @__PURE__ */ Object.create(null), this.endListFragments = /* @__PURE__ */ Object.create(null), this.activePartLists = /* @__PURE__ */ Object.create(null), this.hasGaps = false;
    const e2 = null == (t2 = this.hls) || null == (t2 = t2.latestLevelDetails) ? void 0 : t2.partList;
    e2 && e2.forEach((t3) => t3.clearElementaryStreamInfo());
  }
}
function ue(t2) {
  var e2, s2, i2;
  return t2.buffered && !!(t2.body.gap || null != (e2 = t2.range.video) && e2.partial || null != (s2 = t2.range.audio) && s2.partial || null != (i2 = t2.range.audiovideo) && i2.partial);
}
function fe(t2) {
  return `${t2.type}_${t2.level}_${t2.sn}`;
}
function ge(t2, e2) {
  return t2.filter((t3) => {
    const s2 = e2(t3);
    return s2 || t3.clearElementaryStreamInfo(), s2;
  });
}
class AESCrypto {
  constructor(t2, e2, s2) {
    this.subtle = void 0, this.aesIV = void 0, this.aesMode = void 0, this.subtle = t2, this.aesIV = e2, this.aesMode = s2;
  }
  decrypt(t2, e2) {
    switch (this.aesMode) {
      case 0:
        return this.subtle.decrypt({ name: "AES-CBC", iv: this.aesIV }, e2, t2);
      case 1:
        return this.subtle.decrypt({ name: "AES-CTR", counter: this.aesIV, length: 64 }, e2, t2);
      default:
        throw new Error(`[AESCrypto] invalid aes mode ${this.aesMode}`);
    }
  }
}
class AESDecryptor {
  constructor() {
    this.rcon = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54], this.subMix = [new Uint32Array(256), new Uint32Array(256), new Uint32Array(256), new Uint32Array(256)], this.invSubMix = [new Uint32Array(256), new Uint32Array(256), new Uint32Array(256), new Uint32Array(256)], this.sBox = new Uint32Array(256), this.invSBox = new Uint32Array(256), this.key = new Uint32Array(0), this.ksRows = 0, this.keySize = 0, this.keySchedule = void 0, this.invKeySchedule = void 0, this.initTable();
  }
  uint8ArrayToUint32Array_(t2) {
    const e2 = new DataView(t2), s2 = new Uint32Array(4);
    for (let t3 = 0; t3 < 4; t3++) s2[t3] = e2.getUint32(4 * t3);
    return s2;
  }
  initTable() {
    const t2 = this.sBox, e2 = this.invSBox, s2 = this.subMix, i2 = s2[0], r2 = s2[1], n2 = s2[2], a2 = s2[3], o2 = this.invSubMix, l2 = o2[0], h2 = o2[1], d2 = o2[2], c2 = o2[3], u2 = new Uint32Array(256);
    let f2 = 0, g2 = 0, m2 = 0;
    for (m2 = 0; m2 < 256; m2++) u2[m2] = m2 < 128 ? m2 << 1 : m2 << 1 ^ 283;
    for (m2 = 0; m2 < 256; m2++) {
      let s3 = g2 ^ g2 << 1 ^ g2 << 2 ^ g2 << 3 ^ g2 << 4;
      s3 = s3 >>> 8 ^ 255 & s3 ^ 99, t2[f2] = s3, e2[s3] = f2;
      const o3 = u2[f2], m3 = u2[o3], p2 = u2[m3];
      let v2 = 257 * u2[s3] ^ 16843008 * s3;
      i2[f2] = v2 << 24 | v2 >>> 8, r2[f2] = v2 << 16 | v2 >>> 16, n2[f2] = v2 << 8 | v2 >>> 24, a2[f2] = v2, v2 = 16843009 * p2 ^ 65537 * m3 ^ 257 * o3 ^ 16843008 * f2, l2[s3] = v2 << 24 | v2 >>> 8, h2[s3] = v2 << 16 | v2 >>> 16, d2[s3] = v2 << 8 | v2 >>> 24, c2[s3] = v2, f2 ? (f2 = o3 ^ u2[u2[u2[p2 ^ o3]]], g2 ^= u2[u2[g2]]) : f2 = g2 = 1;
    }
  }
  expandKey(t2) {
    const e2 = this.uint8ArrayToUint32Array_(t2);
    let s2 = true, i2 = 0;
    for (; i2 < e2.length && s2; ) s2 = e2[i2] === this.key[i2], i2++;
    if (s2) return;
    this.key = e2;
    const r2 = this.keySize = e2.length;
    if (4 !== r2 && 6 !== r2 && 8 !== r2) throw new Error("Invalid aes key size=" + r2);
    const n2 = this.ksRows = 4 * (r2 + 6 + 1);
    let a2, o2;
    const l2 = this.keySchedule = new Uint32Array(n2), h2 = this.invKeySchedule = new Uint32Array(n2), d2 = this.sBox, c2 = this.rcon, u2 = this.invSubMix, f2 = u2[0], g2 = u2[1], m2 = u2[2], p2 = u2[3];
    let v2, y2;
    for (a2 = 0; a2 < n2; a2++) a2 < r2 ? v2 = l2[a2] = e2[a2] : (y2 = v2, a2 % r2 === 0 ? (y2 = y2 << 8 | y2 >>> 24, y2 = d2[y2 >>> 24] << 24 | d2[y2 >>> 16 & 255] << 16 | d2[y2 >>> 8 & 255] << 8 | d2[255 & y2], y2 ^= c2[a2 / r2 | 0] << 24) : r2 > 6 && a2 % r2 === 4 && (y2 = d2[y2 >>> 24] << 24 | d2[y2 >>> 16 & 255] << 16 | d2[y2 >>> 8 & 255] << 8 | d2[255 & y2]), l2[a2] = v2 = (l2[a2 - r2] ^ y2) >>> 0);
    for (o2 = 0; o2 < n2; o2++) a2 = n2 - o2, y2 = 3 & o2 ? l2[a2] : l2[a2 - 4], h2[o2] = o2 < 4 || a2 <= 4 ? y2 : f2[d2[y2 >>> 24]] ^ g2[d2[y2 >>> 16 & 255]] ^ m2[d2[y2 >>> 8 & 255]] ^ p2[d2[255 & y2]], h2[o2] = h2[o2] >>> 0;
  }
  networkToHostOrderSwap(t2) {
    return t2 << 24 | (65280 & t2) << 8 | (16711680 & t2) >> 8 | t2 >>> 24;
  }
  decrypt(t2, e2, s2) {
    const i2 = this.keySize + 6, r2 = this.invKeySchedule, n2 = this.invSBox, a2 = this.invSubMix, o2 = a2[0], l2 = a2[1], h2 = a2[2], d2 = a2[3], c2 = this.uint8ArrayToUint32Array_(s2);
    let u2 = c2[0], f2 = c2[1], g2 = c2[2], m2 = c2[3];
    const p2 = new Int32Array(t2), v2 = new Int32Array(p2.length);
    let y2, E2, T2, S2, L2, A2, R2, b2, I2, k2, P2, D2, _2, C2;
    const w2 = this.networkToHostOrderSwap;
    for (; e2 < p2.length; ) {
      for (I2 = w2(p2[e2]), k2 = w2(p2[e2 + 1]), P2 = w2(p2[e2 + 2]), D2 = w2(p2[e2 + 3]), L2 = I2 ^ r2[0], A2 = D2 ^ r2[1], R2 = P2 ^ r2[2], b2 = k2 ^ r2[3], _2 = 4, C2 = 1; C2 < i2; C2++) y2 = o2[L2 >>> 24] ^ l2[A2 >> 16 & 255] ^ h2[R2 >> 8 & 255] ^ d2[255 & b2] ^ r2[_2], E2 = o2[A2 >>> 24] ^ l2[R2 >> 16 & 255] ^ h2[b2 >> 8 & 255] ^ d2[255 & L2] ^ r2[_2 + 1], T2 = o2[R2 >>> 24] ^ l2[b2 >> 16 & 255] ^ h2[L2 >> 8 & 255] ^ d2[255 & A2] ^ r2[_2 + 2], S2 = o2[b2 >>> 24] ^ l2[L2 >> 16 & 255] ^ h2[A2 >> 8 & 255] ^ d2[255 & R2] ^ r2[_2 + 3], L2 = y2, A2 = E2, R2 = T2, b2 = S2, _2 += 4;
      y2 = n2[L2 >>> 24] << 24 ^ n2[A2 >> 16 & 255] << 16 ^ n2[R2 >> 8 & 255] << 8 ^ n2[255 & b2] ^ r2[_2], E2 = n2[A2 >>> 24] << 24 ^ n2[R2 >> 16 & 255] << 16 ^ n2[b2 >> 8 & 255] << 8 ^ n2[255 & L2] ^ r2[_2 + 1], T2 = n2[R2 >>> 24] << 24 ^ n2[b2 >> 16 & 255] << 16 ^ n2[L2 >> 8 & 255] << 8 ^ n2[255 & A2] ^ r2[_2 + 2], S2 = n2[b2 >>> 24] << 24 ^ n2[L2 >> 16 & 255] << 16 ^ n2[A2 >> 8 & 255] << 8 ^ n2[255 & R2] ^ r2[_2 + 3], v2[e2] = w2(y2 ^ u2), v2[e2 + 1] = w2(S2 ^ f2), v2[e2 + 2] = w2(T2 ^ g2), v2[e2 + 3] = w2(E2 ^ m2), u2 = I2, f2 = k2, g2 = P2, m2 = D2, e2 += 4;
    }
    return v2.buffer;
  }
}
class FastAESKey {
  constructor(t2, e2, s2) {
    this.subtle = void 0, this.key = void 0, this.aesMode = void 0, this.subtle = t2, this.key = e2, this.aesMode = s2;
  }
  expandKey() {
    const t2 = function(t3) {
      switch (t3) {
        case 0:
          return "AES-CBC";
        case 1:
          return "AES-CTR";
        default:
          throw new Error(`[FastAESKey] invalid aes mode ${t3}`);
      }
    }(this.aesMode);
    return this.subtle.importKey("raw", this.key, { name: t2 }, false, ["encrypt", "decrypt"]);
  }
}
class Decrypter {
  constructor(t2, { removePKCS7Padding: e2 = true } = {}) {
    if (this.logEnabled = true, this.removePKCS7Padding = void 0, this.subtle = null, this.softwareDecrypter = null, this.key = null, this.fastAesKey = null, this.remainderData = null, this.currentIV = null, this.currentResult = null, this.useSoftware = void 0, this.enableSoftwareAES = void 0, this.enableSoftwareAES = t2.enableSoftwareAES, this.removePKCS7Padding = e2, e2) try {
      const t3 = self.crypto;
      t3 && (this.subtle = t3.subtle || t3.webkitSubtle);
    } catch (t3) {
    }
    this.useSoftware = !this.subtle;
  }
  destroy() {
    this.subtle = null, this.softwareDecrypter = null, this.key = null, this.fastAesKey = null, this.remainderData = null, this.currentIV = null, this.currentResult = null;
  }
  isSync() {
    return this.useSoftware;
  }
  flush() {
    const { currentResult: t2, remainderData: e2 } = this;
    if (!t2 || e2) return this.reset(), null;
    const s2 = new Uint8Array(t2);
    return this.reset(), this.removePKCS7Padding ? function(t3) {
      const e3 = t3.byteLength, s3 = e3 && new DataView(t3.buffer).getUint8(e3 - 1);
      return s3 ? t3.slice(0, e3 - s3) : t3;
    }(s2) : s2;
  }
  reset() {
    this.currentResult = null, this.currentIV = null, this.remainderData = null, this.softwareDecrypter && (this.softwareDecrypter = null);
  }
  decrypt(t2, e2, s2, i2) {
    return this.useSoftware ? new Promise((r2, n2) => {
      const a2 = ArrayBuffer.isView(t2) ? t2 : new Uint8Array(t2);
      this.softwareDecrypt(a2, e2, s2, i2);
      const o2 = this.flush();
      o2 ? r2(o2.buffer) : n2(new Error("[softwareDecrypt] Failed to decrypt data"));
    }) : this.webCryptoDecrypt(new Uint8Array(t2), e2, s2, i2);
  }
  softwareDecrypt(t2, e2, s2, i2) {
    const { currentIV: r2, currentResult: n2, remainderData: a2 } = this;
    if (0 !== i2 || 16 !== e2.byteLength) return I.warn("SoftwareDecrypt: can only handle AES-128-CBC"), null;
    this.logOnce("JS AES decrypt"), a2 && (t2 = nt(a2, t2), this.remainderData = null);
    const o2 = this.getValidChunk(t2);
    if (!o2.length) return null;
    r2 && (s2 = r2);
    let l2 = this.softwareDecrypter;
    l2 || (l2 = this.softwareDecrypter = new AESDecryptor()), l2.expandKey(e2);
    const h2 = n2;
    return this.currentResult = l2.decrypt(o2.buffer, 0, s2), this.currentIV = o2.slice(-16).buffer, h2 || null;
  }
  webCryptoDecrypt(t2, e2, s2, i2) {
    if (this.key !== e2 || !this.fastAesKey) {
      if (!this.subtle) return Promise.resolve(this.onWebCryptoError(t2, e2, s2, i2));
      this.key = e2, this.fastAesKey = new FastAESKey(this.subtle, e2, i2);
    }
    return this.fastAesKey.expandKey().then((e3) => this.subtle ? (this.logOnce("WebCrypto AES decrypt"), new AESCrypto(this.subtle, new Uint8Array(s2), i2).decrypt(t2.buffer, e3)) : Promise.reject(new Error("web crypto not initialized"))).catch((r2) => (I.warn(`[decrypter]: WebCrypto Error, disable WebCrypto API, ${r2.name}: ${r2.message}`), this.onWebCryptoError(t2, e2, s2, i2)));
  }
  onWebCryptoError(t2, e2, s2, i2) {
    const r2 = this.enableSoftwareAES;
    if (r2) {
      this.useSoftware = true, this.logEnabled = true, this.softwareDecrypt(t2, e2, s2, i2);
      const r3 = this.flush();
      if (r3) return r3.buffer;
    }
    throw new Error("WebCrypto" + (r2 ? " and softwareDecrypt" : "") + ": failed to decrypt data");
  }
  getValidChunk(t2) {
    let e2 = t2;
    const s2 = t2.length - t2.length % 16;
    return s2 !== t2.length && (e2 = t2.slice(0, s2), this.remainderData = t2.slice(s2)), e2;
  }
  logOnce(t2) {
    this.logEnabled && (I.log(`[decrypter]: ${t2}`), this.logEnabled = false);
  }
}
const me = Math.pow(2, 17);
class FragmentLoader {
  constructor(t2) {
    this.config = void 0, this.loader = null, this.partLoadTimeout = -1, this.config = t2;
  }
  destroy() {
    this.loader && (this.loader.destroy(), this.loader = null);
  }
  abort() {
    this.loader && this.loader.abort();
  }
  load(t2, e2) {
    const s2 = t2.url;
    if (!s2) return Promise.reject(new LoadError({ type: o.NETWORK_ERROR, details: l.FRAG_LOAD_ERROR, fatal: false, frag: t2, error: new Error("Fragment does not have a " + (s2 ? "part list" : "url")), networkDetails: null }));
    this.abort();
    const i2 = this.config, r2 = i2.fLoader, n2 = i2.loader;
    return new Promise((a2, h2) => {
      if (this.loader && this.loader.destroy(), t2.gap) {
        if (t2.tagList.some((t3) => "GAP" === t3[0])) return void h2(ve(t2));
        t2.gap = false;
      }
      const d2 = this.loader = r2 ? new r2(i2) : new n2(i2), c2 = pe(t2);
      t2.loader = d2;
      const u2 = re(i2.fragLoadPolicy.default), f2 = { loadPolicy: u2, timeout: u2.maxLoadTimeMs, maxRetry: 0, retryDelay: 0, maxRetryDelay: 0, highWaterMark: "initSegment" === t2.sn ? 1 / 0 : me };
      t2.stats = d2.stats;
      const g2 = { onSuccess: (e3, s3, i3, r3) => {
        this.resetLoader(t2, d2);
        let n3 = e3.data;
        i3.resetIV && t2.decryptdata && (t2.decryptdata.iv = new Uint8Array(n3.slice(0, 16)), n3 = n3.slice(16)), a2({ frag: t2, part: null, payload: n3, networkDetails: r3 });
      }, onError: (e3, i3, r3, n3) => {
        this.resetLoader(t2, d2), h2(new LoadError({ type: o.NETWORK_ERROR, details: l.FRAG_LOAD_ERROR, fatal: false, frag: t2, response: T({ url: s2, data: void 0 }, e3), error: new Error(`HTTP Error ${e3.code} ${e3.text}`), networkDetails: r3, stats: n3 }));
      }, onAbort: (e3, s3, i3) => {
        this.resetLoader(t2, d2), h2(new LoadError({ type: o.NETWORK_ERROR, details: l.INTERNAL_ABORTED, fatal: false, frag: t2, error: new Error("Aborted"), networkDetails: i3, stats: e3 }));
      }, onTimeout: (e3, s3, i3) => {
        this.resetLoader(t2, d2), h2(new LoadError({ type: o.NETWORK_ERROR, details: l.FRAG_LOAD_TIMEOUT, fatal: false, frag: t2, error: new Error(`Timeout after ${f2.timeout}ms`), networkDetails: i3, stats: e3 }));
      } };
      e2 && (g2.onProgress = (s3, i3, r3, n3) => e2({ frag: t2, part: null, payload: r3, networkDetails: n3 })), d2.load(c2, f2, g2);
    });
  }
  loadPart(t2, e2, s2) {
    this.abort();
    const i2 = this.config, r2 = i2.fLoader, n2 = i2.loader;
    return new Promise((a2, h2) => {
      if (this.loader && this.loader.destroy(), t2.gap || e2.gap) return void h2(ve(t2, e2));
      const d2 = this.loader = r2 ? new r2(i2) : new n2(i2), c2 = pe(t2, e2);
      t2.loader = d2;
      const u2 = re(i2.fragLoadPolicy.default), f2 = { loadPolicy: u2, timeout: u2.maxLoadTimeMs, maxRetry: 0, retryDelay: 0, maxRetryDelay: 0, highWaterMark: me };
      e2.stats = d2.stats, d2.load(c2, f2, { onSuccess: (i3, r3, n3, o2) => {
        this.resetLoader(t2, d2), this.updateStatsFromPart(t2, e2);
        const l2 = { frag: t2, part: e2, payload: i3.data, networkDetails: o2 };
        s2(l2), a2(l2);
      }, onError: (s3, i3, r3, n3) => {
        this.resetLoader(t2, d2), h2(new LoadError({ type: o.NETWORK_ERROR, details: l.FRAG_LOAD_ERROR, fatal: false, frag: t2, part: e2, response: T({ url: c2.url, data: void 0 }, s3), error: new Error(`HTTP Error ${s3.code} ${s3.text}`), networkDetails: r3, stats: n3 }));
      }, onAbort: (s3, i3, r3) => {
        t2.stats.aborted = e2.stats.aborted, this.resetLoader(t2, d2), h2(new LoadError({ type: o.NETWORK_ERROR, details: l.INTERNAL_ABORTED, fatal: false, frag: t2, part: e2, error: new Error("Aborted"), networkDetails: r3, stats: s3 }));
      }, onTimeout: (s3, i3, r3) => {
        this.resetLoader(t2, d2), h2(new LoadError({ type: o.NETWORK_ERROR, details: l.FRAG_LOAD_TIMEOUT, fatal: false, frag: t2, part: e2, error: new Error(`Timeout after ${f2.timeout}ms`), networkDetails: r3, stats: s3 }));
      } });
    });
  }
  updateStatsFromPart(t2, e2) {
    const s2 = t2.stats, i2 = e2.stats, r2 = i2.total;
    if (s2.loaded += i2.loaded, r2) {
      const i3 = Math.round(t2.duration / e2.duration), n3 = Math.min(Math.round(s2.loaded / r2), i3), a3 = (i3 - n3) * Math.round(s2.loaded / n3);
      s2.total = s2.loaded + a3;
    } else s2.total = Math.max(s2.loaded, s2.total);
    const n2 = s2.loading, a2 = i2.loading;
    n2.start ? n2.first += a2.first - a2.start : (n2.start = a2.start, n2.first = a2.first), n2.end = a2.end;
  }
  resetLoader(t2, e2) {
    t2.loader = null, this.loader === e2 && (self.clearTimeout(this.partLoadTimeout), this.loader = null), e2.destroy();
  }
}
function pe(t2, e2 = null) {
  const s2 = e2 || t2, i2 = { frag: t2, part: e2, responseType: "arraybuffer", url: s2.url, headers: {}, rangeStart: 0, rangeEnd: 0 }, n2 = s2.byteRangeStartOffset, a2 = s2.byteRangeEndOffset;
  if (r(n2) && r(a2)) {
    var o2;
    let e3 = n2, s3 = a2;
    if ("initSegment" === t2.sn && ("AES-128" === (l2 = null == (o2 = t2.decryptdata) ? void 0 : o2.method) || "AES-256" === l2)) {
      const t3 = a2 - n2;
      t3 % 16 && (s3 = a2 + (16 - t3 % 16)), 0 !== n2 && (i2.resetIV = true, e3 = n2 - 16);
    }
    i2.rangeStart = e3, i2.rangeEnd = s3;
  }
  var l2;
  return i2;
}
function ve(t2, e2) {
  const s2 = new Error(`GAP ${t2.gap ? "tag" : "attribute"} found`), i2 = { type: o.MEDIA_ERROR, details: l.FRAG_GAP, fatal: false, frag: t2, error: s2, networkDetails: null };
  return e2 && (i2.part = e2), (e2 || t2).stats.aborted = true, new LoadError(i2);
}
class LoadError extends Error {
  constructor(t2) {
    super(t2.error.message), this.data = void 0, this.data = t2;
  }
}
class TaskLoop extends Logger {
  constructor(t2, e2) {
    super(t2, e2), this._boundTick = void 0, this._tickTimer = null, this._tickInterval = null, this._tickCallCount = 0, this._boundTick = this.tick.bind(this);
  }
  destroy() {
    this.onHandlerDestroying(), this.onHandlerDestroyed();
  }
  onHandlerDestroying() {
    this.clearNextTick(), this.clearInterval();
  }
  onHandlerDestroyed() {
  }
  hasInterval() {
    return !!this._tickInterval;
  }
  hasNextTick() {
    return !!this._tickTimer;
  }
  setInterval(t2) {
    return !this._tickInterval && (this._tickCallCount = 0, this._tickInterval = self.setInterval(this._boundTick, t2), true);
  }
  clearInterval() {
    return !!this._tickInterval && (self.clearInterval(this._tickInterval), this._tickInterval = null, true);
  }
  clearNextTick() {
    return !!this._tickTimer && (self.clearTimeout(this._tickTimer), this._tickTimer = null, true);
  }
  tick() {
    this._tickCallCount++, 1 === this._tickCallCount && (this.doTick(), this._tickCallCount > 1 && this.tickImmediate(), this._tickCallCount = 0);
  }
  tickImmediate() {
    this.clearNextTick(), this._tickTimer = self.setTimeout(this._boundTick, 0);
  }
  doTick() {
  }
}
class ChunkMetadata {
  constructor(t2, e2, s2, i2 = 0, r2 = -1, n2 = false) {
    this.level = void 0, this.sn = void 0, this.part = void 0, this.id = void 0, this.size = void 0, this.partial = void 0, this.transmuxing = { start: 0, executeStart: 0, executeEnd: 0, end: 0 }, this.buffering = { audio: { start: 0, executeStart: 0, executeEnd: 0, end: 0 }, video: { start: 0, executeStart: 0, executeEnd: 0, end: 0 }, audiovideo: { start: 0, executeStart: 0, executeEnd: 0, end: 0 } }, this.level = t2, this.sn = e2, this.id = s2, this.size = i2, this.part = r2, this.partial = n2;
  }
}
const ye = { length: 0, start: () => 0, end: () => 0 };
class BufferHelper {
  static isBuffered(t2, e2) {
    if (t2) {
      const s2 = BufferHelper.getBuffered(t2);
      for (let t3 = s2.length; t3--; ) if (e2 >= s2.start(t3) && e2 <= s2.end(t3)) return true;
    }
    return false;
  }
  static bufferedRanges(t2) {
    if (t2) {
      const e2 = BufferHelper.getBuffered(t2);
      return BufferHelper.timeRangesToArray(e2);
    }
    return [];
  }
  static timeRangesToArray(t2) {
    const e2 = [];
    for (let s2 = 0; s2 < t2.length; s2++) e2.push({ start: t2.start(s2), end: t2.end(s2) });
    return e2;
  }
  static bufferInfo(t2, e2, s2) {
    if (t2) {
      const i2 = BufferHelper.bufferedRanges(t2);
      if (i2.length) return BufferHelper.bufferedInfo(i2, e2, s2);
    }
    return { len: 0, start: e2, end: e2, bufferedIndex: -1 };
  }
  static bufferedInfo(t2, e2, s2) {
    e2 = Math.max(0, e2), t2.length > 1 && t2.sort((t3, e3) => t3.start - e3.start || e3.end - t3.end);
    let i2 = -1, r2 = [];
    if (s2) for (let n3 = 0; n3 < t2.length; n3++) {
      e2 >= t2[n3].start && e2 <= t2[n3].end && (i2 = n3);
      const a3 = r2.length;
      if (a3) {
        const e3 = r2[a3 - 1].end;
        t2[n3].start - e3 < s2 ? t2[n3].end > e3 && (r2[a3 - 1].end = t2[n3].end) : r2.push(t2[n3]);
      } else r2.push(t2[n3]);
    }
    else r2 = t2;
    let n2, a2 = 0, o2 = e2, l2 = e2;
    for (let t3 = 0; t3 < r2.length; t3++) {
      const h2 = r2[t3].start, d2 = r2[t3].end;
      if (-1 === i2 && e2 >= h2 && e2 <= d2 && (i2 = t3), e2 + s2 >= h2 && e2 < d2) o2 = h2, l2 = d2, a2 = l2 - e2;
      else if (e2 + s2 < h2) {
        n2 = h2;
        break;
      }
    }
    return { len: a2, start: o2 || 0, end: l2 || 0, nextStart: n2, buffered: t2, bufferedIndex: i2 };
  }
  static getBuffered(t2) {
    try {
      return t2.buffered || ye;
    } catch (t3) {
      return I.log("failed to get media.buffered", t3), ye;
    }
  }
}
const Ee = /\{\$([a-zA-Z0-9-_]+)\}/g;
function Te(t2) {
  return Ee.test(t2);
}
function Se(t2, e2) {
  if (null !== t2.variableList || t2.hasVariableRefs) {
    const s2 = t2.variableList;
    return e2.replace(Ee, (e3) => {
      const i2 = e3.substring(2, e3.length - 1), r2 = null == s2 ? void 0 : s2[i2];
      return void 0 === r2 ? (t2.playlistParsingError || (t2.playlistParsingError = new Error(`Missing preceding EXT-X-DEFINE tag for Variable Reference: "${i2}"`)), e3) : r2;
    });
  }
  return e2;
}
function Le(t2, e2, s2) {
  let i2, r2, n2 = t2.variableList;
  if (n2 || (t2.variableList = n2 = {}), "QUERYPARAM" in e2) {
    i2 = e2.QUERYPARAM;
    try {
      const t3 = new self.URL(s2).searchParams;
      if (!t3.has(i2)) throw new Error(`"${i2}" does not match any query parameter in URI: "${s2}"`);
      r2 = t3.get(i2);
    } catch (e3) {
      t2.playlistParsingError || (t2.playlistParsingError = new Error(`EXT-X-DEFINE QUERYPARAM: ${e3.message}`));
    }
  } else i2 = e2.NAME, r2 = e2.VALUE;
  i2 in n2 ? t2.playlistParsingError || (t2.playlistParsingError = new Error(`EXT-X-DEFINE duplicate Variable Name declarations: "${i2}"`)) : n2[i2] = r2 || "";
}
function Ae(t2, e2, s2) {
  const i2 = e2.IMPORT;
  if (s2 && i2 in s2) {
    let e3 = t2.variableList;
    e3 || (t2.variableList = e3 = {}), e3[i2] = s2[i2];
  } else t2.playlistParsingError || (t2.playlistParsingError = new Error(`EXT-X-DEFINE IMPORT attribute not found in Multivariant Playlist: "${i2}"`));
}
const Re = /^(\d+)x(\d+)$/, be = /(.+?)=(".*?"|.*?)(?:,|$)/g;
class AttrList {
  constructor(t2, e2) {
    "string" == typeof t2 && (t2 = AttrList.parseAttrList(t2, e2)), y(this, t2);
  }
  get clientAttrs() {
    return Object.keys(this).filter((t2) => "X-" === t2.substring(0, 2));
  }
  decimalInteger(t2) {
    const e2 = parseInt(this[t2], 10);
    return e2 > Number.MAX_SAFE_INTEGER ? 1 / 0 : e2;
  }
  hexadecimalInteger(t2) {
    if (this[t2]) {
      let e2 = (this[t2] || "0x").slice(2);
      e2 = (1 & e2.length ? "0" : "") + e2;
      const s2 = new Uint8Array(e2.length / 2);
      for (let t3 = 0; t3 < e2.length / 2; t3++) s2[t3] = parseInt(e2.slice(2 * t3, 2 * t3 + 2), 16);
      return s2;
    }
    return null;
  }
  hexadecimalIntegerAsNumber(t2) {
    const e2 = parseInt(this[t2], 16);
    return e2 > Number.MAX_SAFE_INTEGER ? 1 / 0 : e2;
  }
  decimalFloatingPoint(t2) {
    return parseFloat(this[t2]);
  }
  optionalFloat(t2, e2) {
    const s2 = this[t2];
    return s2 ? parseFloat(s2) : e2;
  }
  enumeratedString(t2) {
    return this[t2];
  }
  enumeratedStringList(t2, e2) {
    const s2 = this[t2];
    return (s2 ? s2.split(/[ ,]+/) : []).reduce((t3, e3) => (t3[e3.toLowerCase()] = true, t3), e2);
  }
  bool(t2) {
    return "YES" === this[t2];
  }
  decimalResolution(t2) {
    const e2 = Re.exec(this[t2]);
    if (null !== e2) return { width: parseInt(e2[1], 10), height: parseInt(e2[2], 10) };
  }
  static parseAttrList(t2, e2) {
    let s2;
    const i2 = {};
    for (be.lastIndex = 0; null !== (s2 = be.exec(t2)); ) {
      const r2 = s2[1].trim();
      let n2 = s2[2];
      const a2 = 0 === n2.indexOf('"') && n2.lastIndexOf('"') === n2.length - 1;
      let o2 = false;
      if (a2) n2 = n2.slice(1, -1);
      else switch (r2) {
        case "IV":
        case "SCTE35-CMD":
        case "SCTE35-IN":
        case "SCTE35-OUT":
          o2 = true;
      }
      if (e2 && (a2 || o2)) n2 = Se(e2, n2);
      else if (!o2 && !a2) switch (r2) {
        case "CLOSED-CAPTIONS":
          if ("NONE" === n2) break;
        case "ALLOWED-CPC":
        case "CLASS":
        case "ASSOC-LANGUAGE":
        case "AUDIO":
        case "BYTERANGE":
        case "CHANNELS":
        case "CHARACTERISTICS":
        case "CODECS":
        case "DATA-ID":
        case "END-DATE":
        case "GROUP-ID":
        case "ID":
        case "IMPORT":
        case "INSTREAM-ID":
        case "KEYFORMAT":
        case "KEYFORMATVERSIONS":
        case "LANGUAGE":
        case "NAME":
        case "PATHWAY-ID":
        case "QUERYPARAM":
        case "RECENTLY-REMOVED-DATERANGES":
        case "SERVER-URI":
        case "STABLE-RENDITION-ID":
        case "STABLE-VARIANT-ID":
        case "START-DATE":
        case "SUBTITLES":
        case "SUPPLEMENTAL-CODECS":
        case "URI":
        case "VALUE":
        case "VIDEO":
        case "X-ASSET-LIST":
        case "X-ASSET-URI":
          I.warn(`${t2}: attribute ${r2} is missing quotes`);
      }
      i2[r2] = n2;
    }
    return i2;
  }
}
function Ie(t2) {
  return "ID" !== t2 && "CLASS" !== t2 && "CUE" !== t2 && "START-DATE" !== t2 && "DURATION" !== t2 && "END-DATE" !== t2 && "END-ON-NEXT" !== t2;
}
function ke(t2) {
  return "SCTE35-OUT" === t2 || "SCTE35-IN" === t2 || "SCTE35-CMD" === t2;
}
class DateRange {
  constructor(t2, e2, s2 = 0) {
    var i2;
    if (this.attr = void 0, this.tagAnchor = void 0, this.tagOrder = void 0, this._startDate = void 0, this._endDate = void 0, this._dateAtEnd = void 0, this._cue = void 0, this._badValueForSameId = void 0, this.tagAnchor = (null == e2 ? void 0 : e2.tagAnchor) || null, this.tagOrder = null != (i2 = null == e2 ? void 0 : e2.tagOrder) ? i2 : s2, e2) {
      const s3 = e2.attr;
      for (const e3 in s3) if (Object.prototype.hasOwnProperty.call(t2, e3) && t2[e3] !== s3[e3]) {
        I.warn(`DATERANGE tag attribute: "${e3}" does not match for tags with ID: "${t2.ID}"`), this._badValueForSameId = e3;
        break;
      }
      t2 = y(new AttrList({}), s3, t2);
    }
    if (this.attr = t2, e2 ? (this._startDate = e2._startDate, this._cue = e2._cue, this._endDate = e2._endDate, this._dateAtEnd = e2._dateAtEnd) : this._startDate = new Date(t2["START-DATE"]), "END-DATE" in this.attr) {
      const t3 = (null == e2 ? void 0 : e2.endDate) || new Date(this.attr["END-DATE"]);
      r(t3.getTime()) && (this._endDate = t3);
    }
  }
  get id() {
    return this.attr.ID;
  }
  get class() {
    return this.attr.CLASS;
  }
  get cue() {
    const t2 = this._cue;
    return void 0 === t2 ? this._cue = this.attr.enumeratedStringList(this.attr.CUE ? "CUE" : "X-CUE", { pre: false, post: false, once: false }) : t2;
  }
  get startTime() {
    const { tagAnchor: t2 } = this;
    return null === t2 || null === t2.programDateTime ? (I.warn(`Expected tagAnchor Fragment with PDT set for DateRange "${this.id}": ${t2}`), NaN) : t2.start + (this.startDate.getTime() - t2.programDateTime) / 1e3;
  }
  get startDate() {
    return this._startDate;
  }
  get endDate() {
    const t2 = this._endDate || this._dateAtEnd;
    if (t2) return t2;
    const e2 = this.duration;
    return null !== e2 ? this._dateAtEnd = new Date(this._startDate.getTime() + 1e3 * e2) : null;
  }
  get duration() {
    if ("DURATION" in this.attr) {
      const t2 = this.attr.decimalFloatingPoint("DURATION");
      if (r(t2)) return t2;
    } else if (this._endDate) return (this._endDate.getTime() - this._startDate.getTime()) / 1e3;
    return null;
  }
  get plannedDuration() {
    return "PLANNED-DURATION" in this.attr ? this.attr.decimalFloatingPoint("PLANNED-DURATION") : null;
  }
  get endOnNext() {
    return this.attr.bool("END-ON-NEXT");
  }
  get isInterstitial() {
    return "com.apple.hls.interstitial" === this.class;
  }
  get isValid() {
    return !!this.id && !this._badValueForSameId && r(this.startDate.getTime()) && (null === this.duration || this.duration >= 0) && (!this.endOnNext || !!this.class) && (!this.attr.CUE || !this.cue.pre && !this.cue.post || this.cue.pre !== this.cue.post) && (!this.isInterstitial || "X-ASSET-URI" in this.attr || "X-ASSET-LIST" in this.attr);
  }
}
class LevelDetails {
  constructor(t2) {
    this.PTSKnown = false, this.alignedSliding = false, this.averagetargetduration = void 0, this.endCC = 0, this.endSN = 0, this.fragments = void 0, this.fragmentHint = void 0, this.partList = null, this.dateRanges = void 0, this.dateRangeTagCount = 0, this.live = true, this.requestScheduled = -1, this.ageHeader = 0, this.advancedDateTime = void 0, this.updated = true, this.advanced = true, this.misses = 0, this.startCC = 0, this.startSN = 0, this.startTimeOffset = null, this.targetduration = 0, this.totalduration = 0, this.type = null, this.url = void 0, this.m3u8 = "", this.version = null, this.canBlockReload = false, this.canSkipUntil = 0, this.canSkipDateRanges = false, this.skippedSegments = 0, this.recentlyRemovedDateranges = void 0, this.partHoldBack = 0, this.holdBack = 0, this.partTarget = 0, this.preloadHint = void 0, this.renditionReports = void 0, this.tuneInGoal = 0, this.deltaUpdateFailed = void 0, this.driftStartTime = 0, this.driftEndTime = 0, this.driftStart = 0, this.driftEnd = 0, this.encryptedFragments = void 0, this.playlistParsingError = null, this.variableList = null, this.hasVariableRefs = false, this.appliedTimelineOffset = void 0, this.fragments = [], this.encryptedFragments = [], this.dateRanges = {}, this.url = t2;
  }
  reloaded(t2) {
    if (!t2) return this.advanced = true, void (this.updated = true);
    const e2 = this.lastPartSn - t2.lastPartSn, s2 = this.lastPartIndex - t2.lastPartIndex;
    this.updated = this.endSN !== t2.endSN || !!s2 || !!e2 || !this.live, this.advanced = this.endSN > t2.endSN || e2 > 0 || 0 === e2 && s2 > 0, this.updated || this.advanced ? this.misses = Math.floor(0.6 * t2.misses) : this.misses = t2.misses + 1;
  }
  hasKey(t2) {
    return this.encryptedFragments.some((e2) => {
      let s2 = e2.decryptdata;
      return s2 || (e2.setKeyFormat(t2.keyFormat), s2 = e2.decryptdata), !!s2 && t2.matches(s2);
    });
  }
  get hasProgramDateTime() {
    return !!this.fragments.length && r(this.fragments[this.fragments.length - 1].programDateTime);
  }
  get levelTargetDuration() {
    return this.averagetargetduration || this.targetduration || 10;
  }
  get drift() {
    const t2 = this.driftEndTime - this.driftStartTime;
    return t2 > 0 ? 1e3 * (this.driftEnd - this.driftStart) / t2 : 1;
  }
  get edge() {
    return this.partEnd || this.fragmentEnd;
  }
  get partEnd() {
    var t2;
    return null != (t2 = this.partList) && t2.length ? this.partList[this.partList.length - 1].end : this.fragmentEnd;
  }
  get fragmentEnd() {
    return this.fragments.length ? this.fragments[this.fragments.length - 1].end : 0;
  }
  get fragmentStart() {
    return this.fragments.length ? this.fragments[0].start : 0;
  }
  get age() {
    return this.advancedDateTime ? Math.max(Date.now() - this.advancedDateTime, 0) / 1e3 : 0;
  }
  get lastPartIndex() {
    var t2;
    return null != (t2 = this.partList) && t2.length ? this.partList[this.partList.length - 1].index : -1;
  }
  get maxPartIndex() {
    const t2 = this.partList;
    if (t2) {
      const e2 = this.lastPartIndex;
      if (-1 !== e2) {
        for (let s2 = t2.length; s2--; ) if (t2[s2].index > e2) return t2[s2].index;
        return e2;
      }
    }
    return 0;
  }
  get lastPartSn() {
    var t2;
    return null != (t2 = this.partList) && t2.length ? this.partList[this.partList.length - 1].fragment.sn : this.endSN;
  }
  get expired() {
    if (this.live && this.age && this.misses < 3) {
      const t2 = this.partEnd - this.fragmentStart;
      return this.age > Math.max(t2, this.totalduration) + this.levelTargetDuration;
    }
    return false;
  }
}
function Pe(t2, e2) {
  return t2.length === e2.length && !t2.some((t3, s2) => t3 !== e2[s2]);
}
function De(t2, e2) {
  return !t2 && !e2 || !(!t2 || !e2) && Pe(t2, e2);
}
function _e(t2) {
  return "AES-128" === t2 || "AES-256" === t2 || "AES-256-CTR" === t2;
}
function Ce(t2) {
  switch (t2) {
    case "AES-128":
    case "AES-256":
      return 0;
    case "AES-256-CTR":
      return 1;
    default:
      throw new Error(`invalid full segment method ${t2}`);
  }
}
function we(t2) {
  return Uint8Array.from(atob(t2), (t3) => t3.charCodeAt(0));
}
function Me(t2) {
  return Uint8Array.from(unescape(encodeURIComponent(t2)), (t3) => t3.charCodeAt(0));
}
function xe(t2) {
  const e2 = function(t3, e3, s2) {
    const i2 = t3[e3];
    t3[e3] = t3[s2], t3[s2] = i2;
  };
  e2(t2, 0, 3), e2(t2, 1, 2), e2(t2, 4, 5), e2(t2, 6, 7);
}
function Oe(t2) {
  const e2 = t2.split(":");
  let s2 = null;
  if ("data" === e2[0] && 2 === e2.length) {
    const t3 = e2[1].split(";"), i2 = t3[t3.length - 1].split(",");
    if (2 === i2.length) {
      const e3 = "base64" === i2[0], r2 = i2[1];
      e3 ? (t3.splice(-1, 1), s2 = we(r2)) : s2 = function(t4) {
        const e4 = Me(t4).subarray(0, 16), s3 = new Uint8Array(16);
        return s3.set(e4, 16 - e4.length), s3;
      }(r2);
    }
  }
  return s2;
}
const Fe = "undefined" != typeof self ? self : void 0;
var Ne = { CLEARKEY: "org.w3.clearkey", FAIRPLAY: "com.apple.fps", PLAYREADY: "com.microsoft.playready", WIDEVINE: "com.widevine.alpha" }, Be = "org.w3.clearkey", $e = "com.apple.streamingkeydelivery", Ue = "com.microsoft.playready", Ge = "urn:uuid:edef8ba9-79d6-4ace-a3c8-27dcd51d21ed";
function Ke(t2) {
  switch (t2) {
    case $e:
      return Ne.FAIRPLAY;
    case Ue:
      return Ne.PLAYREADY;
    case Ge:
      return Ne.WIDEVINE;
    case Be:
      return Ne.CLEARKEY;
  }
}
function He(t2) {
  switch (t2) {
    case Ne.FAIRPLAY:
      return $e;
    case Ne.PLAYREADY:
      return Ue;
    case Ne.WIDEVINE:
      return Ge;
    case Ne.CLEARKEY:
      return Be;
  }
}
function Ve(t2) {
  const { drmSystems: e2, widevineLicenseUrl: s2 } = t2, i2 = e2 ? [Ne.FAIRPLAY, Ne.WIDEVINE, Ne.PLAYREADY, Ne.CLEARKEY].filter((t3) => !!e2[t3]) : [];
  return !i2[Ne.WIDEVINE] && s2 && i2.push(Ne.WIDEVINE), i2;
}
const Ye = null != Fe && null != (We = Fe.navigator) && We.requestMediaKeySystemAccess ? self.navigator.requestMediaKeySystemAccess.bind(self.navigator) : null;
var We;
function je(t2) {
  const e2 = new Uint16Array(t2.buffer, t2.byteOffset, t2.byteLength / 2), s2 = String.fromCharCode.apply(null, Array.from(e2)), i2 = s2.substring(s2.indexOf("<"), s2.length), r2 = new DOMParser().parseFromString(i2, "text/xml").getElementsByTagName("KID")[0];
  if (r2) {
    const t3 = r2.childNodes[0] ? r2.childNodes[0].nodeValue : r2.getAttribute("VALUE");
    if (t3) {
      const e3 = we(t3).subarray(0, 16);
      return xe(e3), e3;
    }
  }
  return null;
}
let qe = {};
class LevelKey {
  static clearKeyUriToKeyIdMap() {
    qe = {};
  }
  static setKeyIdForUri(t2, e2) {
    qe[t2] = e2;
  }
  static addKeyIdForUri(t2) {
    const e2 = Object.keys(qe).length % Number.MAX_SAFE_INTEGER, s2 = new Uint8Array(16);
    return new DataView(s2.buffer, 12, 4).setUint32(0, e2), qe[t2] = s2, s2;
  }
  constructor(t2, e2, s2, i2 = [1], r2 = null, n2) {
    this.uri = void 0, this.method = void 0, this.keyFormat = void 0, this.keyFormatVersions = void 0, this.encrypted = void 0, this.isCommonEncryption = void 0, this.iv = null, this.key = null, this.keyId = null, this.pssh = null, this.method = t2, this.uri = e2, this.keyFormat = s2, this.keyFormatVersions = i2, this.iv = r2, this.encrypted = !!t2 && "NONE" !== t2, this.isCommonEncryption = this.encrypted && !_e(t2), null != n2 && n2.startsWith("0x") && (this.keyId = new Uint8Array(C(n2)));
  }
  matches(t2) {
    return t2.uri === this.uri && t2.method === this.method && t2.encrypted === this.encrypted && t2.keyFormat === this.keyFormat && Pe(t2.keyFormatVersions, this.keyFormatVersions) && De(t2.iv, this.iv) && De(t2.keyId, this.keyId);
  }
  isSupported() {
    if (this.method) {
      if (_e(this.method) || "NONE" === this.method) return true;
      if ("identity" === this.keyFormat) return "SAMPLE-AES" === this.method;
      switch (this.keyFormat) {
        case $e:
        case Ge:
        case Ue:
        case Be:
          return -1 !== ["SAMPLE-AES", "SAMPLE-AES-CENC", "SAMPLE-AES-CTR"].indexOf(this.method);
      }
    }
    return false;
  }
  getDecryptData(t2, e2) {
    if (!this.encrypted || !this.uri) return null;
    if (_e(this.method)) {
      let e3 = this.iv;
      return e3 || ("number" != typeof t2 && (I.warn(`missing IV for initialization segment with method="${this.method}" - compliance issue`), t2 = 0), e3 = function(t3) {
        const e4 = new Uint8Array(16);
        for (let s3 = 12; s3 < 16; s3++) e4[s3] = t3 >> 8 * (15 - s3) & 255;
        return e4;
      }(t2)), new LevelKey(this.method, this.uri, "identity", this.keyFormatVersions, e3);
    }
    if (this.keyId) {
      const t3 = qe[this.uri];
      if (t3 && !Pe(this.keyId, t3) && LevelKey.setKeyIdForUri(this.uri, this.keyId), this.pssh) return this;
    }
    const s2 = Oe(this.uri);
    if (s2) switch (this.keyFormat) {
      case Ge:
        if (this.pssh = s2, !this.keyId) {
          const t3 = function(t4) {
            const e3 = [];
            if (t4 instanceof ArrayBuffer) {
              const s3 = t4.byteLength;
              let i3 = 0;
              for (; i3 + 32 < s3; ) {
                const s4 = ct(new DataView(t4, i3));
                e3.push(s4), i3 += s4.size;
              }
            }
            return e3;
          }(s2.buffer);
          if (t3.length) {
            var i2;
            const e3 = t3[0];
            this.keyId = null != (i2 = e3.kids) && i2.length ? e3.kids[0] : null;
          }
        }
        this.keyId || (this.keyId = Xe(e2));
        break;
      case Ue: {
        const t3 = new Uint8Array([154, 4, 240, 121, 152, 64, 66, 134, 171, 146, 230, 91, 224, 136, 95, 149]);
        this.pssh = function(t4, e3, s3) {
          if (16 !== t4.byteLength) throw new RangeError("Invalid system id");
          let i3, r2, n2;
          i3 = 0, r2 = new Uint8Array(), n2 = new Uint8Array();
          const a2 = new Uint8Array(4);
          return s3.byteLength > 0 && new DataView(a2.buffer).setUint32(0, s3.byteLength, false), function(t5, ...e4) {
            const s4 = e4.length;
            let i4 = 8, r3 = s4;
            for (; r3--; ) i4 += e4[r3].byteLength;
            const n3 = new Uint8Array(i4);
            for (n3[0] = i4 >> 24 & 255, n3[1] = i4 >> 16 & 255, n3[2] = i4 >> 8 & 255, n3[3] = 255 & i4, n3.set(t5, 4), r3 = 0, i4 = 8; r3 < s4; r3++) n3.set(e4[r3], i4), i4 += e4[r3].byteLength;
            return n3;
          }([112, 115, 115, 104], new Uint8Array([0, 0, 0, 0]), t4, n2, r2, a2, s3);
        }(t3, 0, s2), this.keyId = je(s2);
        break;
      }
      default: {
        let t3 = s2.subarray(0, 16);
        if (16 !== t3.length) {
          const e3 = new Uint8Array(16);
          e3.set(t3, 16 - t3.length), t3 = e3;
        }
        this.keyId = t3;
        break;
      }
    }
    if (!this.keyId || 16 !== this.keyId.byteLength) {
      let t3;
      t3 = function(t4) {
        const e3 = null == t4 ? void 0 : t4[Ge];
        return e3 ? e3.keyId : null;
      }(e2), t3 || (t3 = Xe(e2), t3 || (t3 = qe[this.uri])), t3 && (this.keyId = t3, LevelKey.setKeyIdForUri(this.uri, t3));
    }
    return this;
  }
}
function Xe(t2) {
  const e2 = null == t2 ? void 0 : t2[Ue];
  if (e2) {
    const t3 = Oe(e2.uri);
    if (t3) return je(t3);
  }
  return null;
}
const ze = /#EXT-X-STREAM-INF:([^\r\n]*)(?:[\r\n](?:#[^\r\n]*)?)*([^\r\n]+)|#EXT-X-(SESSION-DATA|SESSION-KEY|DEFINE|CONTENT-STEERING|START):([^\r\n]*)[\r\n]+/g, Qe = /#EXT-X-MEDIA:(.*)/g, Ze = /^#EXT(?:INF|-X-TARGETDURATION):/m, Je = new RegExp([/#EXTINF:\s*(\d*(?:\.\d+)?)(?:,(.*)\s+)?/.source, /(?!#) *(\S[^\r\n]*)/.source, /#.*/.source].join("|"), "g"), ts = new RegExp([/#EXT-X-(PROGRAM-DATE-TIME|BYTERANGE|DATERANGE|DEFINE|KEY|MAP|PART|PART-INF|PLAYLIST-TYPE|PRELOAD-HINT|RENDITION-REPORT|SERVER-CONTROL|SKIP|START):(.+)/.source, /#EXT-X-(BITRATE|DISCONTINUITY-SEQUENCE|MEDIA-SEQUENCE|TARGETDURATION|VERSION): *(\d+)/.source, /#EXT-X-(DISCONTINUITY|ENDLIST|GAP|INDEPENDENT-SEGMENTS)/.source, /(#)([^:]*):(.*)/.source, /(#)(.*)(?:.*)\r?\n?/.source].join("|"));
class M3U8Parser {
  static findGroup(t2, e2) {
    for (let s2 = 0; s2 < t2.length; s2++) {
      const i2 = t2[s2];
      if (i2.id === e2) return i2;
    }
  }
  static resolve(t2, e2) {
    return O.buildAbsoluteURL(e2, t2, { alwaysNormalize: true });
  }
  static isMediaPlaylist(t2) {
    return Ze.test(t2);
  }
  static parseMasterPlaylist(t2, e2) {
    const s2 = { contentSteering: null, levels: [], playlistParsingError: null, sessionData: null, sessionKeys: null, startTimeOffset: null, variableList: null, hasVariableRefs: Te(t2) }, i2 = [];
    if (ze.lastIndex = 0, !t2.startsWith("#EXTM3U")) return s2.playlistParsingError = new Error("no EXTM3U delimiter"), s2;
    let r2;
    for (; null != (r2 = ze.exec(t2)); ) if (r2[1]) {
      var n2;
      const t3 = new AttrList(r2[1], s2), a3 = Se(s2, r2[2]), o2 = { attrs: t3, bitrate: t3.decimalInteger("BANDWIDTH") || t3.decimalInteger("AVERAGE-BANDWIDTH"), name: t3.NAME, url: M3U8Parser.resolve(a3, e2) }, l2 = t3.decimalResolution("RESOLUTION");
      l2 && (o2.width = l2.width, o2.height = l2.height), ns(t3.CODECS, o2);
      const h2 = t3["SUPPLEMENTAL-CODECS"];
      h2 && (o2.supplemental = {}, ns(h2, o2.supplemental)), null != (n2 = o2.unknownCodecs) && n2.length || i2.push(o2), s2.levels.push(o2);
    } else if (r2[3]) {
      const t3 = r2[3], i3 = r2[4];
      switch (t3) {
        case "SESSION-DATA": {
          const t4 = new AttrList(i3, s2), e3 = t4["DATA-ID"];
          e3 && (null === s2.sessionData && (s2.sessionData = {}), s2.sessionData[e3] = t4);
          break;
        }
        case "SESSION-KEY": {
          const t4 = is(i3, e2, s2);
          t4.encrypted && t4.isSupported() ? (null === s2.sessionKeys && (s2.sessionKeys = []), s2.sessionKeys.push(t4)) : I.warn(`[Keys] Ignoring invalid EXT-X-SESSION-KEY tag: "${i3}"`);
          break;
        }
        case "DEFINE":
          Le(s2, new AttrList(i3, s2), e2);
          break;
        case "CONTENT-STEERING": {
          const t4 = new AttrList(i3, s2);
          s2.contentSteering = { uri: M3U8Parser.resolve(t4["SERVER-URI"], e2), pathwayId: t4["PATHWAY-ID"] || "." };
          break;
        }
        case "START":
          s2.startTimeOffset = rs(i3);
      }
    }
    const a2 = i2.length > 0 && i2.length < s2.levels.length;
    return s2.levels = a2 ? i2 : s2.levels, 0 === s2.levels.length && (s2.playlistParsingError = new Error("no levels found in manifest")), s2;
  }
  static parseMasterPlaylistMedia(t2, e2, s2) {
    let i2;
    const r2 = {}, n2 = s2.levels, a2 = { AUDIO: n2.map((t3) => ({ id: t3.attrs.AUDIO, audioCodec: t3.audioCodec })), SUBTITLES: n2.map((t3) => ({ id: t3.attrs.SUBTITLES, textCodec: t3.textCodec })), "CLOSED-CAPTIONS": [] };
    let o2 = 0;
    for (Qe.lastIndex = 0; null !== (i2 = Qe.exec(t2)); ) {
      const t3 = new AttrList(i2[1], s2), n3 = t3.TYPE;
      if (n3) {
        const s3 = a2[n3], i3 = r2[n3] || [];
        r2[n3] = i3;
        const l2 = t3.LANGUAGE, h2 = t3["ASSOC-LANGUAGE"], d2 = t3.CHANNELS, c2 = t3.CHARACTERISTICS, u2 = t3["INSTREAM-ID"], f2 = { attrs: t3, bitrate: 0, id: o2++, groupId: t3["GROUP-ID"] || "", name: t3.NAME || l2 || "", type: n3, default: t3.bool("DEFAULT"), autoselect: t3.bool("AUTOSELECT"), forced: t3.bool("FORCED"), lang: l2, url: t3.URI ? M3U8Parser.resolve(t3.URI, e2) : "" };
        if (h2 && (f2.assocLang = h2), d2 && (f2.channels = d2), c2 && (f2.characteristics = c2), u2 && (f2.instreamId = u2), null != s3 && s3.length) {
          const t4 = M3U8Parser.findGroup(s3, f2.groupId) || s3[0];
          as(f2, t4, "audioCodec"), as(f2, t4, "textCodec");
        }
        i3.push(f2);
      }
    }
    return r2;
  }
  static parseLevelPlaylist(t2, e2, s2, i2, n2, a2) {
    var o2;
    const l2 = { url: e2 }, h2 = new LevelDetails(e2), d2 = h2.fragments, c2 = [];
    let u2, f2, g2, m2, p2 = null, v2 = 0, E2 = 0, T2 = 0, S2 = 0, L2 = 0, A2 = null, R2 = new Fragment(i2, l2), b2 = -1, k2 = false, P2 = null;
    if (Je.lastIndex = 0, h2.m3u8 = t2, h2.hasVariableRefs = Te(t2), "#EXTM3U" !== (null == (o2 = Je.exec(t2)) ? void 0 : o2[0])) return h2.playlistParsingError = new Error("Missing format identifier #EXTM3U"), h2;
    for (; null !== (u2 = Je.exec(t2)); ) {
      k2 && (k2 = false, R2 = new Fragment(i2, l2), R2.playlistOffset = T2, R2.setStart(T2), R2.sn = v2, R2.cc = S2, L2 && (R2.bitrate = L2), R2.level = s2, p2 && (R2.initSegment = p2, p2.rawProgramDateTime && (R2.rawProgramDateTime = p2.rawProgramDateTime, p2.rawProgramDateTime = null), P2 && (R2.setByteRange(P2), P2 = null)));
      const t3 = u2[1];
      if (t3) {
        R2.duration = parseFloat(t3);
        const e3 = (" " + u2[2]).slice(1);
        R2.title = e3 || null, R2.tagList.push(e3 ? ["INF", t3, e3] : ["INF", t3]);
      } else if (u2[3]) {
        if (r(R2.duration)) {
          R2.playlistOffset = T2, R2.setStart(T2), g2 && hs(R2, g2, h2), R2.sn = v2, R2.level = s2, R2.cc = S2, d2.push(R2);
          const t4 = (" " + u2[3]).slice(1);
          R2.relurl = Se(h2, t4), os(R2, A2, c2), A2 = R2, T2 += R2.duration, v2++, E2 = 0, k2 = true;
        }
      } else {
        if (u2 = u2[0].match(ts), !u2) {
          I.warn("No matches on slow regex match for level playlist!");
          continue;
        }
        for (f2 = 1; f2 < u2.length && void 0 === u2[f2]; f2++) ;
        const t4 = (" " + u2[f2]).slice(1), n3 = (" " + u2[f2 + 1]).slice(1), o3 = u2[f2 + 2] ? (" " + u2[f2 + 2]).slice(1) : null;
        switch (t4) {
          case "BYTERANGE":
            A2 ? R2.setByteRange(n3, A2) : R2.setByteRange(n3);
            break;
          case "PROGRAM-DATE-TIME":
            R2.rawProgramDateTime = n3, R2.tagList.push(["PROGRAM-DATE-TIME", n3]), -1 === b2 && (b2 = d2.length);
            break;
          case "PLAYLIST-TYPE":
            h2.type && ds(h2, t4, u2), h2.type = n3.toUpperCase();
            break;
          case "MEDIA-SEQUENCE":
            0 !== h2.startSN ? ds(h2, t4, u2) : d2.length > 0 && cs(h2, t4, u2), v2 = h2.startSN = parseInt(n3);
            break;
          case "SKIP": {
            h2.skippedSegments && ds(h2, t4, u2);
            const e3 = new AttrList(n3, h2), s3 = e3.decimalInteger("SKIPPED-SEGMENTS");
            if (r(s3)) {
              h2.skippedSegments += s3;
              for (let t5 = s3; t5--; ) d2.push(null);
              v2 += s3;
            }
            const i3 = e3.enumeratedString("RECENTLY-REMOVED-DATERANGES");
            i3 && (h2.recentlyRemovedDateranges = (h2.recentlyRemovedDateranges || []).concat(i3.split("	")));
            break;
          }
          case "TARGETDURATION":
            0 !== h2.targetduration && ds(h2, t4, u2), h2.targetduration = Math.max(parseInt(n3), 1);
            break;
          case "VERSION":
            null !== h2.version && ds(h2, t4, u2), h2.version = parseInt(n3);
            break;
          case "INDEPENDENT-SEGMENTS":
            break;
          case "ENDLIST":
            h2.live || ds(h2, t4, u2), h2.live = false;
            break;
          case "#":
            (n3 || o3) && R2.tagList.push(o3 ? [n3, o3] : [n3]);
            break;
          case "DISCONTINUITY":
            S2++, R2.tagList.push(["DIS"]);
            break;
          case "GAP":
            R2.gap = true, R2.tagList.push([t4]);
            break;
          case "BITRATE":
            R2.tagList.push([t4, n3]), L2 = 1e3 * parseInt(n3), r(L2) ? R2.bitrate = L2 : L2 = 0;
            break;
          case "DATERANGE": {
            const t5 = new AttrList(n3, h2), e3 = new DateRange(t5, h2.dateRanges[t5.ID], h2.dateRangeTagCount);
            h2.dateRangeTagCount++, e3.isValid || h2.skippedSegments ? h2.dateRanges[e3.id] = e3 : I.warn(`Ignoring invalid DATERANGE tag: "${n3}"`), R2.tagList.push(["EXT-X-DATERANGE", n3]);
            break;
          }
          case "DEFINE":
            {
              const t5 = new AttrList(n3, h2);
              "IMPORT" in t5 ? Ae(h2, t5, a2) : Le(h2, t5, e2);
            }
            break;
          case "DISCONTINUITY-SEQUENCE":
            0 !== h2.startCC ? ds(h2, t4, u2) : d2.length > 0 && cs(h2, t4, u2), h2.startCC = S2 = parseInt(n3);
            break;
          case "KEY": {
            const t5 = is(n3, e2, h2);
            if (t5.isSupported()) {
              if ("NONE" === t5.method) {
                g2 = void 0;
                break;
              }
              g2 || (g2 = {});
              const e3 = g2[t5.keyFormat];
              null != e3 && e3.matches(t5) || (e3 && (g2 = y({}, g2)), g2[t5.keyFormat] = t5);
            } else I.warn(`[Keys] Ignoring unsupported EXT-X-KEY tag: "${n3}"`);
            break;
          }
          case "START":
            h2.startTimeOffset = rs(n3);
            break;
          case "MAP": {
            const t5 = new AttrList(n3, h2);
            if (R2.duration) {
              const e3 = new Fragment(i2, l2);
              ls(e3, t5, s2, g2), p2 = e3, R2.initSegment = p2, p2.rawProgramDateTime && !R2.rawProgramDateTime && (R2.rawProgramDateTime = p2.rawProgramDateTime);
            } else {
              const e3 = R2.byteRangeEndOffset;
              if (e3) {
                const t6 = R2.byteRangeStartOffset;
                P2 = `${e3 - t6}@${t6}`;
              } else P2 = null;
              ls(R2, t5, s2, g2), p2 = R2, k2 = true;
            }
            p2.cc = S2;
            break;
          }
          case "SERVER-CONTROL":
            m2 && ds(h2, t4, u2), m2 = new AttrList(n3), h2.canBlockReload = m2.bool("CAN-BLOCK-RELOAD"), h2.canSkipUntil = m2.optionalFloat("CAN-SKIP-UNTIL", 0), h2.canSkipDateRanges = h2.canSkipUntil > 0 && m2.bool("CAN-SKIP-DATERANGES"), h2.partHoldBack = m2.optionalFloat("PART-HOLD-BACK", 0), h2.holdBack = m2.optionalFloat("HOLD-BACK", 0);
            break;
          case "PART-INF": {
            h2.partTarget && ds(h2, t4, u2);
            const e3 = new AttrList(n3);
            h2.partTarget = e3.decimalFloatingPoint("PART-TARGET");
            break;
          }
          case "PART": {
            let t5 = h2.partList;
            t5 || (t5 = h2.partList = []);
            const e3 = E2 > 0 ? t5[t5.length - 1] : void 0, s3 = E2++, i3 = new AttrList(n3, h2), r2 = new Part(i3, R2, l2, s3, e3);
            t5.push(r2), R2.duration += r2.duration;
            break;
          }
          case "PRELOAD-HINT": {
            const t5 = new AttrList(n3, h2);
            h2.preloadHint = t5;
            break;
          }
          case "RENDITION-REPORT": {
            const t5 = new AttrList(n3, h2);
            h2.renditionReports = h2.renditionReports || [], h2.renditionReports.push(t5);
            break;
          }
          default:
            I.warn(`line parsed but not handled: ${u2}`);
        }
      }
    }
    A2 && !A2.relurl ? (d2.pop(), T2 -= A2.duration, h2.partList && (h2.fragmentHint = A2)) : h2.partList && (os(R2, A2, c2), R2.cc = S2, h2.fragmentHint = R2, g2 && hs(R2, g2, h2)), h2.targetduration || (h2.playlistParsingError = new Error("Missing Target Duration"));
    const D2 = d2.length, _2 = d2[0], C2 = d2[D2 - 1];
    if (T2 += h2.skippedSegments * h2.targetduration, T2 > 0 && D2 && C2) {
      h2.averagetargetduration = T2 / D2;
      const t3 = C2.sn;
      h2.endSN = "initSegment" !== t3 ? t3 : 0, h2.live || (C2.endList = true), b2 > 0 && (function(t4, e3) {
        let s3 = t4[e3];
        for (let i3 = e3; i3--; ) {
          const e4 = t4[i3];
          if (!e4) return;
          e4.programDateTime = s3.programDateTime - 1e3 * e4.duration, s3 = e4;
        }
      }(d2, b2), _2 && c2.unshift(_2));
    }
    return h2.fragmentHint && (T2 += h2.fragmentHint.duration), h2.totalduration = T2, c2.length && h2.dateRangeTagCount && _2 && es(c2, h2), h2.endCC = S2, h2;
  }
}
function es(t2, e2) {
  let s2 = t2.length;
  if (!s2) {
    if (!e2.hasProgramDateTime) return;
    {
      const i3 = e2.fragments[e2.fragments.length - 1];
      t2.push(i3), s2++;
    }
  }
  const i2 = t2[s2 - 1], r2 = e2.live ? 1 / 0 : e2.totalduration, n2 = Object.keys(e2.dateRanges);
  for (let o2 = n2.length; o2--; ) {
    const l2 = e2.dateRanges[n2[o2]], h2 = l2.startDate.getTime();
    l2.tagAnchor = i2.ref;
    for (let i3 = s2; i3--; ) {
      var a2;
      if ((null == (a2 = t2[i3]) ? void 0 : a2.sn) < e2.startSN) break;
      const s3 = ss(e2, h2, t2, i3, r2);
      if (-1 !== s3) {
        l2.tagAnchor = e2.fragments[s3].ref;
        break;
      }
    }
  }
}
function ss(t2, e2, s2, i2, r2) {
  const n2 = s2[i2];
  if (n2) {
    const o2 = n2.programDateTime;
    var a2;
    if ((e2 >= o2 || 0 === i2) && e2 <= o2 + 1e3 * (((null == (a2 = s2[i2 + 1]) ? void 0 : a2.start) || r2) - n2.start)) {
      const r3 = s2[i2].sn - t2.startSN;
      if (r3 < 0) return -1;
      const n3 = t2.fragments;
      if (n3.length > s2.length) for (let a3 = (s2[i2 + 1] || n3[n3.length - 1]).sn - t2.startSN; a3 > r3; a3--) {
        const t3 = n3[a3].programDateTime;
        if (e2 >= t3 && e2 < t3 + 1e3 * n3[a3].duration) return a3;
      }
      return r3;
    }
  }
  return -1;
}
function is(t2, e2, s2) {
  var i2, r2;
  const n2 = new AttrList(t2, s2), a2 = null != (i2 = n2.METHOD) ? i2 : "", o2 = n2.URI, l2 = n2.hexadecimalInteger("IV"), h2 = n2.KEYFORMATVERSIONS, d2 = null != (r2 = n2.KEYFORMAT) ? r2 : "identity";
  o2 && n2.IV && !l2 && I.error(`Invalid IV: ${n2.IV}`);
  const c2 = o2 ? M3U8Parser.resolve(o2, e2) : "", u2 = (h2 || "1").split("/").map(Number).filter(Number.isFinite);
  return new LevelKey(a2, c2, d2, u2, l2, n2.KEYID);
}
function rs(t2) {
  const e2 = new AttrList(t2).decimalFloatingPoint("TIME-OFFSET");
  return r(e2) ? e2 : null;
}
function ns(t2, e2) {
  let s2 = (t2 || "").split(/[ ,]+/).filter((t3) => t3);
  ["video", "audio", "text"].forEach((t3) => {
    const i2 = s2.filter((e3) => gt(e3, t3));
    i2.length && (e2[`${t3}Codec`] = i2.map((t4) => t4.split("/")[0]).join(","), s2 = s2.filter((t4) => -1 === i2.indexOf(t4)));
  }), e2.unknownCodecs = s2;
}
function as(t2, e2, s2) {
  const i2 = e2[s2];
  i2 && (t2[s2] = i2);
}
function os(t2, e2, s2) {
  t2.rawProgramDateTime ? s2.push(t2) : null != e2 && e2.programDateTime && (t2.programDateTime = e2.endProgramDateTime);
}
function ls(t2, e2, s2, i2) {
  t2.relurl = e2.URI, e2.BYTERANGE && t2.setByteRange(e2.BYTERANGE), t2.level = s2, t2.sn = "initSegment", i2 && (t2.levelkeys = i2), t2.initSegment = null;
}
function hs(t2, e2, s2) {
  t2.levelkeys = e2;
  const { encryptedFragments: i2 } = s2;
  i2.length && i2[i2.length - 1].levelkeys === e2 || !Object.keys(e2).some((t3) => e2[t3].isCommonEncryption) || i2.push(t2);
}
function ds(t2, e2, s2) {
  t2.playlistParsingError = new Error(`#EXT-X-${e2} must not appear more than once (${s2[0]})`);
}
function cs(t2, e2, s2) {
  t2.playlistParsingError = new Error(`#EXT-X-${e2} must appear before the first Media Segment (${s2[0]})`);
}
function us(t2, e2) {
  const s2 = e2.startPTS;
  if (r(s2)) {
    let i2, r2 = 0;
    e2.sn > t2.sn ? (r2 = s2 - t2.start, i2 = t2) : (r2 = t2.start - s2, i2 = e2), i2.duration !== r2 && i2.setDuration(r2);
  } else e2.sn > t2.sn ? t2.cc === e2.cc && t2.minEndPTS ? e2.setStart(t2.start + (t2.minEndPTS - t2.start)) : e2.setStart(t2.start + t2.duration) : e2.setStart(Math.max(t2.start - e2.duration, 0));
}
function fs(t2, e2, s2, i2, n2, a2, o2) {
  i2 - s2 <= 0 && (o2.warn("Fragment should have a positive duration", e2), i2 = s2 + e2.duration, a2 = n2 + e2.duration);
  let l2 = s2, h2 = i2;
  const d2 = e2.startPTS, c2 = e2.endPTS;
  if (r(d2)) {
    const u3 = Math.abs(d2 - s2);
    t2 && u3 > t2.totalduration ? o2.warn(`media timestamps and playlist times differ by ${u3}s for level ${e2.level} ${t2.url}`) : r(e2.deltaPTS) ? e2.deltaPTS = Math.max(u3, e2.deltaPTS) : e2.deltaPTS = u3, l2 = Math.max(s2, d2), s2 = Math.min(s2, d2), n2 = void 0 !== e2.startDTS ? Math.min(n2, e2.startDTS) : n2, h2 = Math.min(i2, c2), i2 = Math.max(i2, c2), a2 = void 0 !== e2.endDTS ? Math.max(a2, e2.endDTS) : a2;
  }
  const u2 = s2 - e2.start;
  0 !== e2.start && e2.setStart(s2), e2.setDuration(i2 - e2.start), e2.startPTS = s2, e2.maxStartPTS = l2, e2.startDTS = n2, e2.endPTS = i2, e2.minEndPTS = h2, e2.endDTS = a2;
  const f2 = e2.sn;
  if (!t2 || f2 < t2.startSN || f2 > t2.endSN) return 0;
  let g2;
  const m2 = f2 - t2.startSN, p2 = t2.fragments;
  for (p2[m2] = e2, g2 = m2; g2 > 0; g2--) us(p2[g2], p2[g2 - 1]);
  for (g2 = m2; g2 < p2.length - 1; g2++) us(p2[g2], p2[g2 + 1]);
  return t2.fragmentHint && us(p2[p2.length - 1], t2.fragmentHint), t2.PTSKnown = t2.alignedSliding = true, u2;
}
function gs(t2, e2, s2, i2, r2) {
  return new Error(`${t2} ${r2.url}
Playlist starting @${e2.startSN}
${e2.m3u8}

Playlist starting @${s2.startSN}
${s2.m3u8}`);
}
function ms(t2, e2, s2 = true) {
  const i2 = e2.startSN + e2.skippedSegments - t2.startSN, r2 = t2.fragments, n2 = i2 >= 0;
  let a2 = 0;
  if (n2 && i2 < r2.length) a2 = r2[i2].start;
  else if (n2 && e2.startSN === t2.endSN + 1) a2 = t2.fragmentEnd;
  else if (n2 && s2) a2 = t2.fragmentStart + i2 * e2.levelTargetDuration;
  else {
    if (e2.skippedSegments || 0 !== e2.fragmentStart) return;
    a2 = t2.fragmentStart;
  }
  ps(e2, a2);
}
function ps(t2, e2) {
  if (e2) {
    const s2 = t2.fragments;
    for (let i2 = t2.skippedSegments; i2 < s2.length; i2++) s2[i2].addStart(e2);
    t2.fragmentHint && t2.fragmentHint.addStart(e2);
  }
}
function vs(t2, e2 = 1 / 0) {
  let s2 = 1e3 * t2.targetduration;
  if (t2.updated) {
    const i2 = t2.fragments, r2 = 4;
    if (i2.length && s2 * r2 > e2) {
      const t3 = 1e3 * i2[i2.length - 1].duration;
      t3 < s2 && (s2 = t3);
    }
  } else s2 /= 2;
  return Math.round(s2);
}
function ys(t2, e2, s2) {
  if (!t2) return null;
  let i2 = t2.fragments[e2 - t2.startSN];
  return i2 || (i2 = t2.fragmentHint, i2 && i2.sn === e2 ? i2 : e2 < t2.startSN && s2 && s2.sn === e2 ? s2 : null);
}
function Es(t2, e2, s2) {
  return t2 ? Ts(t2.partList, e2, s2) : null;
}
function Ts(t2, e2, s2) {
  if (t2) for (let i2 = t2.length; i2--; ) {
    const r2 = t2[i2];
    if (r2.index === s2 && r2.fragment.sn === e2) return r2;
  }
  return null;
}
function Ss(t2) {
  t2.forEach((t3, e2) => {
    var s2;
    null == (s2 = t3.details) || s2.fragments.forEach((t4) => {
      t4.level = e2, t4.initSegment && (t4.initSegment.level = e2);
    });
  });
}
function Ls(t2, e2) {
  return !(t2 === e2 || !e2) && As(t2) !== As(e2);
}
function As(t2) {
  return t2.replace(/\?[^?]*$/, "");
}
function Rs(t2, e2) {
  for (let i2 = 0, r2 = t2.length; i2 < r2; i2++) {
    var s2;
    if ((null == (s2 = t2[i2]) ? void 0 : s2.cc) === e2) return t2[i2];
  }
  return null;
}
function bs(t2, e2) {
  const s2 = t2.start + e2;
  t2.startPTS = s2, t2.setStart(s2), t2.endPTS = s2 + t2.duration;
}
function Is(t2, e2) {
  const s2 = e2.fragments;
  for (let e3 = 0, i2 = s2.length; e3 < i2; e3++) bs(s2[e3], t2);
  e2.fragmentHint && bs(e2.fragmentHint, t2), e2.alignedSliding = true;
}
function ks(t2, e2) {
  if (!function(t3, e3) {
    return !!(t3 && e3.startCC < t3.endCC && e3.endCC > t3.startCC);
  }(e2, t2)) return;
  const s2 = Math.min(e2.endCC, t2.endCC), i2 = Rs(e2.fragments, s2), r2 = Rs(t2.fragments, s2);
  i2 && r2 && (I.log(`Aligning playlist at start of dicontinuity sequence ${s2}`), Is(i2.start - r2.start, t2));
}
function Ps(t2, e2) {
  if (!t2.hasProgramDateTime || !e2.hasProgramDateTime) return;
  const s2 = t2.fragments, i2 = e2.fragments;
  if (!s2.length || !i2.length) return;
  let r2, n2;
  const a2 = Math.min(e2.endCC, t2.endCC);
  e2.startCC < a2 && t2.startCC < a2 && (r2 = Rs(i2, a2), n2 = Rs(s2, a2)), r2 && n2 || (r2 = i2[Math.floor(i2.length / 2)], n2 = Rs(s2, r2.cc) || s2[Math.floor(s2.length / 2)]);
  const o2 = r2.programDateTime, l2 = n2.programDateTime;
  o2 && l2 && Is((l2 - o2) / 1e3 - (n2.start - r2.start), t2);
}
function Ds(t2, e2, s2) {
  _s(t2, e2, s2), t2.addEventListener(e2, s2);
}
function _s(t2, e2, s2) {
  t2.removeEventListener(e2, s2);
}
const Cs = "STOPPED", ws = "IDLE", Ms = "KEY_LOADING", xs = "FRAG_LOADING", Os = "FRAG_LOADING_WAITING_RETRY", Fs = "WAITING_TRACK", Ns = "PARSING", Bs = "PARSED", $s = "ENDED", Us = "ERROR", Gs = "WAITING_INIT_PTS", Ks = "WAITING_LEVEL";
class BaseStreamController extends TaskLoop {
  constructor(t2, e2, s2, i2, n2) {
    super(i2, t2.logger), this.hls = void 0, this.fragPrevious = null, this.fragCurrent = null, this.fragmentTracker = void 0, this.transmuxer = null, this._state = Cs, this.playlistType = void 0, this.media = null, this.mediaBuffer = null, this.config = void 0, this.bitrateTest = false, this.lastCurrentTime = 0, this.nextLoadPosition = 0, this.startPosition = 0, this.startTimeOffset = null, this.retryDate = 0, this.levels = null, this.fragmentLoader = void 0, this.keyLoader = void 0, this.levelLastLoaded = null, this.startFragRequested = false, this.decrypter = void 0, this.initPTS = [], this.buffering = true, this.loadingParts = false, this.loopSn = void 0, this.onMediaSeeking = () => {
      const { config: t3, fragCurrent: e3, media: s3, mediaBuffer: i3, state: n3 } = this, a2 = s3 ? s3.currentTime : 0, o2 = BufferHelper.bufferInfo(i3 || s3, a2, t3.maxBufferHole), l2 = !o2.len;
      if (this.log(`Media seeking to ${r(a2) ? a2.toFixed(3) : a2}, state: ${n3}, ${l2 ? "out of" : "in"} buffer`), this.state === $s) this.resetLoadingState();
      else if (e3) {
        const s4 = t3.maxFragLookUpTolerance, i4 = e3.start - s4, r2 = e3.start + e3.duration + s4;
        if (l2 || r2 < o2.start || i4 > o2.end) {
          const t4 = a2 > r2;
          (a2 < i4 || t4) && (t4 && e3.loader && (this.log(`Cancelling fragment load for seek (sn: ${e3.sn})`), e3.abortRequests(), this.resetLoadingState()), this.fragPrevious = null);
        }
      }
      if (s3 && (this.fragmentTracker.removeFragmentsInRange(a2, 1 / 0, this.playlistType, true), a2 > this.lastCurrentTime && (this.lastCurrentTime = a2), !this.loadingParts)) {
        const t4 = Math.max(o2.end, a2), e4 = this.shouldLoadParts(this.getLevelDetails(), t4);
        e4 && (this.log(`LL-Part loading ON after seeking to ${a2.toFixed(2)} with buffer @${t4.toFixed(2)}`), this.loadingParts = e4);
      }
      this.hls.hasEnoughToStart || (this.log(`Setting ${l2 ? "startPosition" : "nextLoadPosition"} to ${a2} for seek without enough to start`), this.nextLoadPosition = a2, l2 && (this.startPosition = a2)), l2 && this.state === ws && this.tickImmediate();
    }, this.onMediaEnded = () => {
      this.log("setting startPosition to 0 because media ended"), this.startPosition = this.lastCurrentTime = 0;
    }, this.playlistType = n2, this.hls = t2, this.fragmentLoader = new FragmentLoader(t2.config), this.keyLoader = s2, this.fragmentTracker = e2, this.config = t2.config, this.decrypter = new Decrypter(t2.config);
  }
  registerListeners() {
    const { hls: t2 } = this;
    t2.on(h.MEDIA_ATTACHED, this.onMediaAttached, this), t2.on(h.MEDIA_DETACHING, this.onMediaDetaching, this), t2.on(h.MANIFEST_LOADING, this.onManifestLoading, this), t2.on(h.MANIFEST_LOADED, this.onManifestLoaded, this), t2.on(h.ERROR, this.onError, this);
  }
  unregisterListeners() {
    const { hls: t2 } = this;
    t2.off(h.MEDIA_ATTACHED, this.onMediaAttached, this), t2.off(h.MEDIA_DETACHING, this.onMediaDetaching, this), t2.off(h.MANIFEST_LOADING, this.onManifestLoading, this), t2.off(h.MANIFEST_LOADED, this.onManifestLoaded, this), t2.off(h.ERROR, this.onError, this);
  }
  doTick() {
    this.onTickEnd();
  }
  onTickEnd() {
  }
  startLoad(t2) {
  }
  stopLoad() {
    if (this.state === Cs) return;
    this.fragmentLoader.abort(), this.keyLoader.abort(this.playlistType);
    const t2 = this.fragCurrent;
    null != t2 && t2.loader && (t2.abortRequests(), this.fragmentTracker.removeFragment(t2)), this.resetTransmuxer(), this.fragCurrent = null, this.fragPrevious = null, this.clearInterval(), this.clearNextTick(), this.state = Cs;
  }
  get startPositionValue() {
    const { nextLoadPosition: t2, startPosition: e2 } = this;
    return -1 === e2 && t2 ? t2 : e2;
  }
  get bufferingEnabled() {
    return this.buffering;
  }
  pauseBuffering() {
    this.buffering = false;
  }
  resumeBuffering() {
    this.buffering = true;
  }
  get inFlightFrag() {
    return { frag: this.fragCurrent, state: this.state };
  }
  _streamEnded(t2, e2) {
    if (e2.live || !this.media) return false;
    const s2 = t2.end || 0, i2 = this.config.timelineOffset || 0;
    if (s2 <= i2) return false;
    const r2 = t2.buffered;
    this.config.maxBufferHole && r2 && r2.length > 1 && (t2 = BufferHelper.bufferedInfo(r2, t2.start, 0));
    const n2 = t2.nextStart;
    if (n2 && n2 > i2 && n2 < e2.edge) return false;
    if (this.media.currentTime < t2.start) return false;
    const a2 = e2.partList;
    if (null != a2 && a2.length) {
      const t3 = a2[a2.length - 1];
      return BufferHelper.isBuffered(this.media, t3.start + t3.duration / 2);
    }
    const o2 = e2.fragments[e2.fragments.length - 1].type;
    return this.fragmentTracker.isEndListAppended(o2);
  }
  getLevelDetails() {
    if (this.levels && null !== this.levelLastLoaded) return this.levelLastLoaded.details;
  }
  get timelineOffset() {
    const t2 = this.config.timelineOffset;
    var e2;
    return t2 ? (null == (e2 = this.getLevelDetails()) ? void 0 : e2.appliedTimelineOffset) || t2 : 0;
  }
  onMediaAttached(t2, e2) {
    const s2 = this.media = this.mediaBuffer = e2.media;
    Ds(s2, "seeking", this.onMediaSeeking), Ds(s2, "ended", this.onMediaEnded);
    const i2 = this.config;
    this.levels && i2.autoStartLoad && this.state === Cs && this.startLoad(i2.startPosition);
  }
  onMediaDetaching(t2, e2) {
    const s2 = !!e2.transferMedia, i2 = this.media;
    if (null !== i2) {
      if (i2.ended && (this.log("MSE detaching and video ended, reset startPosition"), this.startPosition = this.lastCurrentTime = 0), _s(i2, "seeking", this.onMediaSeeking), _s(i2, "ended", this.onMediaEnded), this.keyLoader && !s2 && this.keyLoader.detach(), this.media = this.mediaBuffer = null, this.loopSn = void 0, s2) return this.resetLoadingState(), void this.resetTransmuxer();
      this.loadingParts = false, this.fragmentTracker.removeAllFragments(), this.stopLoad();
    }
  }
  onManifestLoading() {
    this.initPTS = [], this.levels = this.levelLastLoaded = this.fragCurrent = null, this.lastCurrentTime = this.startPosition = 0, this.startFragRequested = false;
  }
  onError(t2, e2) {
  }
  onManifestLoaded(t2, e2) {
    this.startTimeOffset = e2.startTimeOffset;
  }
  onHandlerDestroying() {
    this.stopLoad(), this.transmuxer && (this.transmuxer.destroy(), this.transmuxer = null), super.onHandlerDestroying(), this.hls = this.onMediaSeeking = this.onMediaEnded = null;
  }
  onHandlerDestroyed() {
    this.state = Cs, this.fragmentLoader && this.fragmentLoader.destroy(), this.keyLoader && this.keyLoader.destroy(), this.decrypter && this.decrypter.destroy(), this.hls = this.log = this.warn = this.decrypter = this.keyLoader = this.fragmentLoader = this.fragmentTracker = null, super.onHandlerDestroyed();
  }
  loadFragment(t2, e2, s2) {
    this.startFragRequested = true, this._loadFragForPlayback(t2, e2, s2);
  }
  _loadFragForPlayback(t2, e2, s2) {
    this._doFragLoad(t2, e2, s2, (t3) => {
      const e3 = t3.frag;
      if (this.fragContextChanged(e3)) return this.warn(`${e3.type} sn: ${e3.sn}${t3.part ? " part: " + t3.part.index : ""} of ${this.fragInfo(e3, false, t3.part)}) was dropped during download.`), void this.fragmentTracker.removeFragment(e3);
      e3.stats.chunkCount++, this._handleFragmentLoadProgress(t3);
    }).then((t3) => {
      if (!t3) return;
      const e3 = this.state, s3 = t3.frag;
      this.fragContextChanged(s3) ? (e3 === xs || !this.fragCurrent && e3 === Ns) && (this.fragmentTracker.removeFragment(s3), this.state = ws) : ("payload" in t3 && (this.log(`Loaded ${s3.type} sn: ${s3.sn} of ${this.playlistLabel()} ${s3.level}`), this.hls.trigger(h.FRAG_LOADED, t3)), this._handleFragmentLoadComplete(t3));
    }).catch((e3) => {
      this.state !== Cs && this.state !== Us && (this.warn(`Frag error: ${(null == e3 ? void 0 : e3.message) || e3}`), this.resetFragmentLoading(t2));
    });
  }
  clearTrackerIfNeeded(t2) {
    var e2;
    const { fragmentTracker: s2 } = this;
    if (s2.getState(t2) === he) {
      const e3 = t2.type, i2 = this.getFwdBufferInfo(this.mediaBuffer, e3), r2 = Math.max(t2.duration, i2 ? i2.len : this.config.maxBufferLength), n2 = this.backtrackFragment;
      (1 === (n2 ? t2.sn - n2.sn : 0) || this.reduceMaxBufferLength(r2, t2.duration)) && s2.removeFragment(t2);
    } else 0 === (null == (e2 = this.mediaBuffer) ? void 0 : e2.buffered.length) ? s2.removeAllFragments() : s2.hasParts(t2.type) && (s2.detectPartialFragments({ frag: t2, part: null, stats: t2.stats, id: t2.type }), s2.getState(t2) === de && s2.removeFragment(t2));
  }
  checkLiveUpdate(t2) {
    if (t2.updated && !t2.live) {
      const e2 = t2.fragments[t2.fragments.length - 1];
      this.fragmentTracker.detectPartialFragments({ frag: e2, part: null, stats: e2.stats, id: e2.type });
    }
    t2.fragments[0] || (t2.deltaUpdateFailed = true);
  }
  waitForLive(t2) {
    const e2 = t2.details;
    return (null == e2 ? void 0 : e2.live) && "EVENT" !== e2.type && (this.levelLastLoaded !== t2 || e2.expired);
  }
  flushMainBuffer(t2, e2, s2 = null) {
    if (!(t2 - e2)) return;
    const i2 = { startOffset: t2, endOffset: e2, type: s2 };
    this.hls.trigger(h.BUFFER_FLUSHING, i2);
  }
  _loadInitSegment(t2, e2) {
    this._doFragLoad(t2, e2).then((t3) => {
      const e3 = null == t3 ? void 0 : t3.frag;
      if (!e3 || this.fragContextChanged(e3) || !this.levels) throw new Error("init load aborted");
      return t3;
    }).then((t3) => {
      const { hls: e3 } = this, { frag: s2, payload: i2 } = t3, r2 = s2.decryptdata;
      if (i2 && i2.byteLength > 0 && null != r2 && r2.key && r2.iv && _e(r2.method)) {
        const n2 = self.performance.now();
        return this.decrypter.decrypt(new Uint8Array(i2), r2.key.buffer, r2.iv.buffer, Ce(r2.method)).catch((t4) => {
          throw e3.trigger(h.ERROR, { type: o.MEDIA_ERROR, details: l.FRAG_DECRYPT_ERROR, fatal: false, error: t4, reason: t4.message, frag: s2 }), t4;
        }).then((i3) => {
          const r3 = self.performance.now();
          return e3.trigger(h.FRAG_DECRYPTED, { frag: s2, payload: i3, stats: { tstart: n2, tdecrypt: r3 } }), t3.payload = i3, this.completeInitSegmentLoad(t3);
        });
      }
      return this.completeInitSegmentLoad(t3);
    }).catch((e3) => {
      this.state !== Cs && this.state !== Us && (this.warn(e3), this.resetFragmentLoading(t2));
    });
  }
  completeInitSegmentLoad(t2) {
    const { levels: e2 } = this;
    if (!e2) throw new Error("init load aborted, missing levels");
    const s2 = t2.frag.stats;
    this.state !== Cs && (this.state = ws), t2.frag.data = new Uint8Array(t2.payload), s2.parsing.start = s2.buffering.start = self.performance.now(), s2.parsing.end = s2.buffering.end = self.performance.now(), this.tick();
  }
  unhandledEncryptionError(t2, e2) {
    var s2, i2;
    const r2 = t2.tracks;
    if (r2 && !e2.encrypted && (null != (s2 = r2.audio) && s2.encrypted || null != (i2 = r2.video) && i2.encrypted) && (!this.config.emeEnabled || !this.keyLoader.emeController)) {
      const t3 = this.media, s3 = new Error(`Encrypted track with no key in ${this.fragInfo(e2)} (media ${t3 ? "attached mediaKeys: " + t3.mediaKeys : "detached"})`);
      return this.warn(s3.message), !(!t3 || t3.mediaKeys || (this.hls.trigger(h.ERROR, { type: o.KEY_SYSTEM_ERROR, details: l.KEY_SYSTEM_NO_KEYS, fatal: false, error: s3, frag: e2 }), this.resetTransmuxer(), 0));
    }
    return false;
  }
  fragContextChanged(t2) {
    const { fragCurrent: e2 } = this;
    return !t2 || !e2 || t2.sn !== e2.sn || t2.level !== e2.level;
  }
  fragBufferedComplete(t2, e2) {
    const s2 = this.mediaBuffer ? this.mediaBuffer : this.media;
    if (this.log(`Buffered ${t2.type} sn: ${t2.sn}${e2 ? " part: " + e2.index : ""} of ${this.fragInfo(t2, false, e2)} > buffer:${s2 ? function(t3) {
      let e3 = "";
      const s3 = t3.length;
      for (let i3 = 0; i3 < s3; i3++) e3 += `[${t3.start(i3).toFixed(3)}-${t3.end(i3).toFixed(3)}]`;
      return e3;
    }(BufferHelper.getBuffered(s2)) : "(detached)"})`), $(t2)) {
      var i2;
      if (t2.type !== p) {
        const e4 = t2.elementaryStreams;
        if (!Object.keys(e4).some((t3) => !!e4[t3])) return void (this.state = ws);
      }
      const e3 = null == (i2 = this.levels) ? void 0 : i2[t2.level];
      null != e3 && e3.fragmentError && (this.log(`Resetting level fragment error count of ${e3.fragmentError} on frag buffered`), e3.fragmentError = 0);
    }
    this.state = ws;
  }
  _handleFragmentLoadComplete(t2) {
    const { transmuxer: e2 } = this;
    if (!e2) return;
    const { frag: s2, part: i2, partsLoaded: r2 } = t2, n2 = !r2 || 0 === r2.length || r2.some((t3) => !t3), a2 = new ChunkMetadata(s2.level, s2.sn, s2.stats.chunkCount + 1, 0, i2 ? i2.index : -1, !n2);
    e2.flush(a2);
  }
  _handleFragmentLoadProgress(t2) {
  }
  _doFragLoad(t2, e2, s2 = null, i2) {
    var n2;
    this.fragCurrent = t2;
    const a2 = e2.details;
    if (!this.levels || !a2) throw new Error(`frag load aborted, missing level${a2 ? "" : " detail"}s`);
    let o2 = null;
    if (!t2.encrypted || null != (n2 = t2.decryptdata) && n2.key) t2.encrypted || (o2 = this.keyLoader.loadClear(t2, a2.encryptedFragments, this.startFragRequested), o2 && this.log("[eme] blocking frag load until media-keys acquired"));
    else if (this.log(`Loading key for ${t2.sn} of [${a2.startSN}-${a2.endSN}], ${this.playlistLabel()} ${t2.level}`), this.state = Ms, this.fragCurrent = t2, o2 = this.keyLoader.load(t2).then((t3) => {
      if (!this.fragContextChanged(t3.frag)) return this.hls.trigger(h.KEY_LOADED, t3), this.state === Ms && (this.state = ws), t3;
    }), this.hls.trigger(h.KEY_LOADING, { frag: t2 }), null === this.fragCurrent) return this.log("context changed in KEY_LOADING"), Promise.resolve(null);
    const l2 = this.fragPrevious;
    if ($(t2) && (!l2 || t2.sn !== l2.sn)) {
      const s3 = this.shouldLoadParts(e2.details, t2.end);
      s3 !== this.loadingParts && (this.log(`LL-Part loading ${s3 ? "ON" : "OFF"} loading sn ${null == l2 ? void 0 : l2.sn}->${t2.sn}`), this.loadingParts = s3);
    }
    if (s2 = Math.max(t2.start, s2 || 0), this.loadingParts && $(t2)) {
      const r2 = a2.partList;
      if (r2 && i2) {
        s2 > a2.fragmentEnd && a2.fragmentHint && (t2 = a2.fragmentHint);
        const n3 = this.getNextPart(r2, t2, s2);
        if (n3 > -1) {
          const l3 = r2[n3];
          let d3;
          return t2 = this.fragCurrent = l3.fragment, this.log(`Loading ${t2.type} sn: ${t2.sn} part: ${l3.index} (${n3}/${r2.length - 1}) of ${this.fragInfo(t2, false, l3)}) cc: ${t2.cc} [${a2.startSN}-${a2.endSN}], target: ${parseFloat(s2.toFixed(3))}`), this.nextLoadPosition = l3.start + l3.duration, this.state = xs, d3 = o2 ? o2.then((s3) => !s3 || this.fragContextChanged(s3.frag) ? null : this.doFragPartsLoad(t2, l3, e2, i2)).catch((t3) => this.handleFragLoadError(t3)) : this.doFragPartsLoad(t2, l3, e2, i2).catch((t3) => this.handleFragLoadError(t3)), this.hls.trigger(h.FRAG_LOADING, { frag: t2, part: l3, targetBufferTime: s2 }), null === this.fragCurrent ? Promise.reject(new Error("frag load aborted, context changed in FRAG_LOADING parts")) : d3;
        }
        if (!t2.url || this.loadedEndOfParts(r2, s2)) return Promise.resolve(null);
      }
    }
    var d2;
    if ($(t2) && this.loadingParts) this.log(`LL-Part loading OFF after next part miss @${s2.toFixed(2)} Check buffer at sn: ${t2.sn} loaded parts: ${null == (d2 = a2.partList) ? void 0 : d2.filter((t3) => t3.loaded).map((t3) => `[${t3.start}-${t3.end}]`)}`), this.loadingParts = false;
    else if (!t2.url) return Promise.resolve(null);
    this.log(`Loading ${t2.type} sn: ${t2.sn} of ${this.fragInfo(t2, false)}) cc: ${t2.cc} ${"[" + a2.startSN + "-" + a2.endSN + "]"}, target: ${parseFloat(s2.toFixed(3))}`), r(t2.sn) && !this.bitrateTest && (this.nextLoadPosition = t2.start + t2.duration), this.state = xs;
    const c2 = this.config.progressive && t2.type !== p;
    let u2;
    return u2 = c2 && o2 ? o2.then((e3) => !e3 || this.fragContextChanged(e3.frag) ? null : this.fragmentLoader.load(t2, i2)).catch((t3) => this.handleFragLoadError(t3)) : Promise.all([this.fragmentLoader.load(t2, c2 ? i2 : void 0), o2]).then(([t3]) => (!c2 && i2 && i2(t3), t3)).catch((t3) => this.handleFragLoadError(t3)), this.hls.trigger(h.FRAG_LOADING, { frag: t2, targetBufferTime: s2 }), null === this.fragCurrent ? Promise.reject(new Error("frag load aborted, context changed in FRAG_LOADING")) : u2;
  }
  doFragPartsLoad(t2, e2, s2, i2) {
    return new Promise((r2, n2) => {
      var a2;
      const o2 = [], l2 = null == (a2 = s2.details) ? void 0 : a2.partList, d2 = (e3) => {
        this.fragmentLoader.loadPart(t2, e3, i2).then((i3) => {
          o2[e3.index] = i3;
          const n3 = i3.part;
          this.hls.trigger(h.FRAG_LOADED, i3);
          const a3 = Es(s2.details, t2.sn, e3.index + 1) || Ts(l2, t2.sn, e3.index + 1);
          if (!a3) return r2({ frag: t2, part: n3, partsLoaded: o2 });
          d2(a3);
        }).catch(n2);
      };
      d2(e2);
    });
  }
  handleFragLoadError(t2) {
    if ("data" in t2) {
      const e2 = t2.data;
      e2.frag && e2.details === l.INTERNAL_ABORTED ? this.handleFragLoadAborted(e2.frag, e2.part) : e2.frag && e2.type === o.KEY_SYSTEM_ERROR ? (e2.frag.abortRequests(), this.resetStartWhenNotLoaded(), this.resetFragmentLoading(e2.frag)) : this.hls.trigger(h.ERROR, e2);
    } else this.hls.trigger(h.ERROR, { type: o.OTHER_ERROR, details: l.INTERNAL_EXCEPTION, err: t2, error: t2, fatal: true });
    return null;
  }
  _handleTransmuxerFlush(t2) {
    const e2 = this.getCurrentContext(t2);
    if (!e2 || this.state !== Ns) return void (this.fragCurrent || this.state === Cs || this.state === Us || (this.state = ws));
    const { frag: s2, part: i2, level: r2 } = e2, n2 = self.performance.now();
    s2.stats.parsing.end = n2, i2 && (i2.stats.parsing.end = n2);
    const a2 = this.getLevelDetails(), o2 = a2 && s2.sn > a2.endSN || this.shouldLoadParts(a2, s2.end);
    o2 !== this.loadingParts && (this.log(`LL-Part loading ${o2 ? "ON" : "OFF"} after parsing segment ending @${s2.end.toFixed(2)}`), this.loadingParts = o2), this.updateLevelTiming(s2, i2, r2, t2.partial);
  }
  shouldLoadParts(t2, e2) {
    if (this.config.lowLatencyMode) {
      if (!t2) return this.loadingParts;
      if (t2.partList) {
        var s2;
        const r2 = t2.partList[0];
        if (r2.fragment.type === p) return false;
        var i2;
        if (e2 >= r2.end + ((null == (s2 = t2.fragmentHint) ? void 0 : s2.duration) || 0) && (this.hls.hasEnoughToStart ? (null == (i2 = this.media) ? void 0 : i2.currentTime) || this.lastCurrentTime : this.getLoadPosition()) > r2.start - r2.fragment.duration) return true;
      }
    }
    return false;
  }
  getCurrentContext(t2) {
    const { levels: e2, fragCurrent: s2 } = this, { level: i2, sn: r2, part: n2 } = t2;
    if (null == e2 || !e2[i2]) return this.warn(`Levels object was unset while buffering fragment ${r2} of ${this.playlistLabel()} ${i2}. The current chunk will not be buffered.`), null;
    const a2 = e2[i2], o2 = a2.details, l2 = n2 > -1 ? Es(o2, r2, n2) : null, h2 = l2 ? l2.fragment : ys(o2, r2, s2);
    return h2 ? (s2 && s2 !== h2 && (h2.stats = s2.stats), { frag: h2, part: l2, level: a2 }) : null;
  }
  bufferFragmentData(t2, e2, s2, i2, r2) {
    if (this.state !== Ns) return;
    const { data1: n2, data2: a2 } = t2;
    let o2 = n2;
    if (a2 && (o2 = nt(n2, a2)), !o2.length) return;
    const l2 = this.initPTS[e2.cc], d2 = l2 ? -l2.baseTime / l2.timescale : void 0, c2 = { type: t2.type, frag: e2, part: s2, chunkMeta: i2, offset: d2, parent: e2.type, data: o2 };
    if (this.hls.trigger(h.BUFFER_APPENDING, c2), t2.dropped && t2.independent && !s2) {
      if (r2) return;
      this.flushBufferGap(e2);
    }
  }
  flushBufferGap(t2) {
    const e2 = this.media;
    if (!e2) return;
    if (!BufferHelper.isBuffered(e2, e2.currentTime)) return void this.flushMainBuffer(0, t2.start);
    const s2 = e2.currentTime, i2 = BufferHelper.bufferInfo(e2, s2, 0), r2 = t2.duration, n2 = Math.min(2 * this.config.maxFragLookUpTolerance, 0.25 * r2), a2 = Math.max(Math.min(t2.start - n2, i2.end - n2), s2 + n2);
    t2.start - a2 > n2 && this.flushMainBuffer(a2, t2.start);
  }
  getFwdBufferInfo(t2, e2) {
    var s2;
    const i2 = this.getLoadPosition();
    if (!r(i2)) return null;
    const n2 = this.lastCurrentTime > i2 || null != (s2 = this.media) && s2.paused ? 0 : this.config.maxBufferHole;
    return this.getFwdBufferInfoAtPos(t2, i2, e2, n2);
  }
  getFwdBufferInfoAtPos(t2, e2, s2, i2) {
    const r2 = BufferHelper.bufferInfo(t2, e2, i2);
    if (0 === r2.len && void 0 !== r2.nextStart) {
      const n2 = this.fragmentTracker.getBufferedFrag(e2, s2);
      if (n2 && (r2.nextStart <= n2.end || n2.gap)) {
        const s3 = Math.max(Math.min(r2.nextStart, n2.end) - e2, i2);
        return BufferHelper.bufferInfo(t2, e2, s3);
      }
    }
    return r2;
  }
  getMaxBufferLength(t2) {
    const { config: e2 } = this;
    let s2;
    return s2 = t2 ? Math.max(8 * e2.maxBufferSize / t2, e2.maxBufferLength) : e2.maxBufferLength, Math.min(s2, e2.maxMaxBufferLength);
  }
  exceedsMaxBuffer(t2, e2, s2) {
    const i2 = t2.nextStart;
    if (i2 && s2.start > i2) {
      const i3 = t2.buffered;
      if (i3) {
        let r2 = t2.len;
        const n2 = t2.bufferedIndex;
        for (let t3 = i3.length - 1; t3 > n2; t3--) i3[t3].start < s2.start && (r2 += i3[t3].end - i3[t3].start);
        return r2 >= e2;
      }
    }
    return false;
  }
  reduceMaxBufferLength(t2, e2) {
    const s2 = this.config, i2 = Math.max(Math.min(t2 - e2, s2.maxBufferLength), e2), r2 = Math.max(t2 - 3 * e2, s2.maxMaxBufferLength / 2, i2);
    return r2 >= i2 && (s2.maxMaxBufferLength = r2, this.warn(`Reduce max buffer length to ${r2}s`), true);
  }
  getAppendedFrag(t2, e2 = g) {
    const s2 = this.fragmentTracker ? this.fragmentTracker.getAppendedFrag(t2, e2) : null;
    return s2 && "fragment" in s2 ? s2.fragment : s2;
  }
  getNextFragment(t2, e2) {
    const s2 = e2.fragments, i2 = s2.length;
    if (!i2) return null;
    const { config: r2 } = this, n2 = e2.fragmentStart, a2 = r2.lowLatencyMode && !!e2.partList;
    let o2 = null;
    if (e2.live) {
      const s3 = r2.initialLiveManifestSize;
      if (i2 < s3) return this.warn(`Not enough fragments to start playback (have: ${i2}, need: ${s3})`), null;
      if (!e2.PTSKnown && !this.startFragRequested && -1 === this.startPosition || t2 < n2) {
        var l2;
        a2 && !this.loadingParts && (this.log("LL-Part loading ON for initial live fragment"), this.loadingParts = true), o2 = this.getInitialLiveFragment(e2);
        const s4 = this.config.startPosition, i3 = this.hls.startPosition, r3 = this.hls.liveSyncPosition, h3 = (null == (l2 = o2) ? void 0 : l2.start) || 0;
        let d2, c2;
        -1 !== i3 && i3 >= n2 ? (d2 = i3, c2 = i3 === s4 ? "config" : "next load start") : null !== r3 ? (d2 = r3, c2 = "live edge") : (d2 = t2, c2 = "buffer pos"), d2 < h3 && (d2 = h3, c2 = "live frag start"), d2 < n2 && (d2 = n2, c2 = "playlist start"), this.startPosition == d2 && this.nextLoadPosition == d2 || (this.log(`Setting startPosition to ${d2.toFixed(3)} ${-1 === i3 ? "" : `(from ${s4}) `}based on ${c2}. live edge: ${r3} live frag start: ${h3.toFixed(3)} playlist start: ${n2.toFixed(3)} buffer pos: ${t2}`), this.startPosition = this.nextLoadPosition = d2);
      }
    } else t2 <= n2 && (o2 = s2[0]);
    if (!o2) {
      const s3 = this.loadingParts ? e2.partEnd : e2.fragmentEnd;
      o2 = this.getFragmentAtPosition(t2, s3, e2);
    }
    let h2 = this.filterReplacedPrimary(o2, e2);
    if (!h2 && o2) {
      const t3 = o2.sn - e2.startSN;
      h2 = this.filterReplacedPrimary(s2[t3 + 1] || null, e2);
    }
    return this.mapToInitFragWhenRequired(h2);
  }
  isLoopLoading(t2, e2) {
    if (this.nextLoadPosition <= e2) return false;
    const s2 = this.fragmentTracker.getState(t2);
    return s2 === ce || s2 === de && !!t2.gap;
  }
  getNextFragmentLoopLoading(t2, e2, s2, i2, r2) {
    let n2 = null;
    if (t2.gap && (n2 = this.getNextFragment(this.nextLoadPosition, e2), n2 && !n2.gap && s2.nextStart)) {
      const t3 = this.getFwdBufferInfoAtPos(this.mediaBuffer ? this.mediaBuffer : this.media, s2.nextStart, i2, 0);
      if (null !== t3 && s2.len + t3.len >= r2) {
        const t4 = n2.sn;
        return this.loopSn !== t4 && (this.log(`buffer full after gaps in "${i2}" playlist starting at sn: ${t4}`), this.loopSn = t4), null;
      }
    }
    return this.loopSn = void 0, n2;
  }
  get primaryPrefetch() {
    var t2;
    return !(!Hs(this.config) || !(null == (t2 = this.hls.interstitialsManager) || null == (t2 = t2.playingItem) ? void 0 : t2.event));
  }
  filterReplacedPrimary(t2, e2) {
    if (!t2) return t2;
    if (Hs(this.config) && t2.type !== p) {
      const s2 = this.hls.interstitialsManager, i2 = null == s2 ? void 0 : s2.bufferingItem;
      if (i2) {
        const s3 = i2.event;
        if (s3) {
          if (s3.appendInPlace || Math.abs(t2.start - i2.start) > 1 || 0 === i2.start) return null;
        } else {
          if (t2.end <= i2.start && false === (null == e2 ? void 0 : e2.live)) return null;
          if (t2.start > i2.end && i2.nextEvent && (i2.nextEvent.appendInPlace || t2.start - i2.end > 1)) return null;
        }
      }
      const r2 = null == s2 ? void 0 : s2.playerQueue;
      if (r2) for (let e3 = r2.length; e3--; ) {
        const s3 = r2[e3].interstitial;
        if (s3.appendInPlace && t2.start >= s3.startTime && t2.end <= s3.resumeTime) return null;
      }
    }
    return t2;
  }
  mapToInitFragWhenRequired(t2) {
    return null == t2 || !t2.initSegment || t2.initSegment.data || this.bitrateTest ? t2 : t2.initSegment;
  }
  getNextPart(t2, e2, s2) {
    let i2 = -1, r2 = false, n2 = true;
    for (let a2 = 0, o2 = t2.length; a2 < o2; a2++) {
      const o3 = t2[a2];
      if (n2 = n2 && !o3.independent, i2 > -1 && s2 < o3.start) break;
      const l2 = o3.loaded;
      l2 ? i2 = -1 : (r2 || (o3.independent || n2) && o3.fragment === e2) && (o3.fragment !== e2 && this.warn(`Need buffer at ${s2} but next unloaded part starts at ${o3.start}`), i2 = a2), r2 = l2;
    }
    return i2;
  }
  loadedEndOfParts(t2, e2) {
    let s2;
    for (let i2 = t2.length; i2--; ) {
      if (s2 = t2[i2], !s2.loaded) return false;
      if (e2 > s2.start) return true;
    }
    return false;
  }
  getInitialLiveFragment(t2) {
    const e2 = t2.fragments, s2 = this.fragPrevious;
    let i2 = null;
    if (s2) {
      if (t2.hasProgramDateTime && (i2 = function(t3, e3, s3) {
        if (null === e3 || !Array.isArray(t3) || !t3.length || !r(e3)) return null;
        if (e3 < (t3[0].programDateTime || 0)) return null;
        if (e3 >= (t3[t3.length - 1].endProgramDateTime || 0)) return null;
        for (let i3 = 0; i3 < t3.length; ++i3) {
          const r2 = t3[i3];
          if (Qt(e3, s3, r2)) return r2;
        }
        return null;
      }(e2, s2.endProgramDateTime, this.config.maxFragLookUpTolerance), i2 && this.log(`Live playlist, switching playlist, load frag with same PDT: ${s2.programDateTime}`)), !i2) {
        const r2 = s2.sn + 1;
        if (r2 >= t2.startSN && r2 <= t2.endSN) {
          const n2 = e2[r2 - t2.startSN];
          s2.cc === n2.cc && (i2 = n2, this.log(`Live playlist, switching playlist, load frag with next SN: ${i2.sn}`));
        }
        i2 || (i2 = Zt(t2, s2.cc, s2.end), i2 && this.log(`Live playlist, switching playlist, load frag with same CC: ${i2.sn}`));
      }
    } else {
      const e3 = this.hls.liveSyncPosition;
      null !== e3 && (i2 = this.getFragmentAtPosition(e3, this.bitrateTest ? t2.fragmentEnd : t2.edge, t2));
    }
    return i2;
  }
  getFragmentAtPosition(t2, e2, s2) {
    const { config: i2 } = this;
    let { fragPrevious: r2 } = this, { fragments: n2, endSN: a2 } = s2;
    const { fragmentHint: o2 } = s2, { maxFragLookUpTolerance: l2 } = i2, h2 = s2.partList, d2 = !!(this.loadingParts && null != h2 && h2.length && o2);
    let c2;
    var u2;
    if (d2 && !this.bitrateTest && h2[h2.length - 1].fragment.sn === o2.sn && (n2 = n2.concat(o2), a2 = o2.sn), c2 = t2 < e2 ? Xt(r2, n2, t2, t2 < this.lastCurrentTime || t2 > e2 - l2 || null != (u2 = this.media) && u2.paused || !this.startFragRequested ? 0 : l2) : n2[n2.length - 1], c2) {
      const t3 = c2.sn - s2.startSN, e3 = this.fragmentTracker.getState(c2);
      if ((e3 === ce || e3 === de && c2.gap) && (r2 = c2), r2 && c2.sn === r2.sn && (!d2 || h2[0].fragment.sn > c2.sn || !s2.live) && c2.level === r2.level) {
        const e4 = n2[t3 + 1];
        c2 = c2.sn < a2 && this.fragmentTracker.getState(e4) !== ce ? e4 : null;
      }
    }
    return c2;
  }
  alignPlaylists(t2, e2, s2) {
    const i2 = t2.fragments.length;
    if (!i2) return this.warn("No fragments in live playlist"), 0;
    const n2 = t2.fragmentStart, a2 = !e2, o2 = t2.alignedSliding && r(n2);
    if (a2 || !o2 && !n2) {
      !function(t3, e3) {
        t3 && (ks(e3, t3), e3.alignedSliding || Ps(e3, t3), e3.alignedSliding || e3.skippedSegments || ms(t3, e3, false));
      }(s2, t2);
      const r2 = t2.fragmentStart;
      return this.log(`Live playlist sliding: ${r2.toFixed(2)} start-sn: ${e2 ? e2.startSN : "na"}->${t2.startSN} fragments: ${i2}`), r2;
    }
    return n2;
  }
  waitForCdnTuneIn(t2) {
    return t2.live && t2.canBlockReload && t2.partTarget && t2.tuneInGoal > Math.max(t2.partHoldBack, 3 * t2.partTarget);
  }
  setStartPosition(t2, e2) {
    let s2 = this.startPosition;
    s2 < e2 && (s2 = -1);
    const i2 = this.timelineOffset;
    if (-1 === s2) {
      const n2 = null !== this.startTimeOffset, a2 = n2 ? this.startTimeOffset : t2.startTimeOffset;
      null !== a2 && r(a2) ? (s2 = e2 + a2, a2 < 0 && (s2 += t2.edge), s2 = Math.min(Math.max(e2, s2), e2 + t2.totalduration), this.log(`Setting startPosition to ${s2} for start time offset ${a2} found in ${n2 ? "multivariant" : "media"} playlist`), this.startPosition = s2) : t2.live ? (s2 = this.hls.liveSyncPosition || e2, this.log(`Setting startPosition to -1 to start at live edge ${s2}`), this.startPosition = -1) : (this.log("setting startPosition to 0 by default"), this.startPosition = s2 = 0), this.lastCurrentTime = s2 + i2;
    }
    this.nextLoadPosition = s2 + i2;
  }
  getLoadPosition() {
    var t2;
    const { media: e2 } = this;
    let s2 = 0;
    return null != (t2 = this.hls) && t2.hasEnoughToStart && e2 ? s2 = e2.currentTime : this.nextLoadPosition >= 0 && (s2 = this.nextLoadPosition), s2;
  }
  handleFragLoadAborted(t2, e2) {
    this.transmuxer && t2.type === this.playlistType && $(t2) && t2.stats.aborted && (this.log(`Fragment ${t2.sn}${e2 ? " part " + e2.index : ""} of ${this.playlistLabel()} ${t2.level} was aborted`), this.resetFragmentLoading(t2));
  }
  resetFragmentLoading(t2) {
    this.fragCurrent && (this.fragContextChanged(t2) || this.state === Os) || (this.state = ws);
  }
  onFragmentOrKeyLoadError(t2, e2) {
    var s2;
    if (e2.chunkMeta && !e2.frag) {
      const t3 = this.getCurrentContext(e2.chunkMeta);
      t3 && (e2.frag = t3.frag);
    }
    const i2 = e2.frag;
    if (!i2 || i2.type !== t2 || !this.levels) return;
    var r2;
    if (this.fragContextChanged(i2)) return void this.warn(`Frag load error must match current frag to retry ${i2.url} > ${null == (r2 = this.fragCurrent) ? void 0 : r2.url}`);
    const n2 = e2.details === l.FRAG_GAP;
    n2 && this.fragmentTracker.fragBuffered(i2, true);
    const a2 = e2.errorAction;
    if (!a2) return void (this.state = Us);
    const { action: o2, flags: h2, retryCount: d2 = 0, retryConfig: c2 } = a2, u2 = !!c2, f2 = u2 && 5 === o2, g2 = u2 && !a2.resolved && 1 === h2, m2 = null == (s2 = this.hls.latestLevelDetails) ? void 0 : s2.live;
    if (!f2 && g2 && $(i2) && !i2.endList && m2 && !ee(e2)) this.resetFragmentErrors(t2), this.treatAsGap(i2), a2.resolved = true;
    else if ((f2 || g2) && d2 < c2.maxNumRetry) {
      var p2;
      const s3 = ae(null == (p2 = e2.response) ? void 0 : p2.code), r3 = ie(c2, d2);
      if (this.resetStartWhenNotLoaded(), this.retryDate = self.performance.now() + r3, this.state = Os, a2.resolved = true, s3) return this.log("Waiting for connection (offline)"), this.retryDate = 1 / 0, void (e2.reason = "offline");
      this.warn(`Fragment ${i2.sn} of ${t2} ${i2.level} errored with ${e2.details}, retrying loading ${d2 + 1}/${c2.maxNumRetry} in ${r3}ms`);
    } else if (c2) {
      if (this.resetFragmentErrors(t2), !(d2 < c2.maxNumRetry)) return void this.warn(`${e2.details} reached or exceeded max retry (${d2})`);
      n2 || 3 === o2 || (a2.resolved = true);
    } else this.state = 2 === o2 ? Ks : Us;
    this.tickImmediate();
  }
  checkRetryDate() {
    const t2 = self.performance.now(), e2 = this.retryDate, s2 = e2 === 1 / 0;
    (!e2 || t2 >= e2 || s2 && !ae(0)) && (s2 && this.log("Connection restored (online)"), this.resetStartWhenNotLoaded(), this.state = ws);
  }
  reduceLengthAndFlushBuffer(t2) {
    if (this.state === Ns || this.state === Bs) {
      const e2 = t2.frag, s2 = t2.parent, i2 = this.getFwdBufferInfo(this.mediaBuffer, s2), r2 = i2 && i2.len > 0.5;
      r2 && this.reduceMaxBufferLength(i2.len, (null == e2 ? void 0 : e2.duration) || 10);
      const n2 = !r2;
      return n2 && this.warn(`Buffer full error while media.currentTime (${this.getLoadPosition()}) is not buffered, flush ${s2} buffer`), e2 && (this.fragmentTracker.removeFragment(e2), this.nextLoadPosition = e2.start), this.resetLoadingState(), n2;
    }
    return false;
  }
  resetFragmentErrors(t2) {
    t2 === m && (this.fragCurrent = null), this.hls.hasEnoughToStart || (this.startFragRequested = false), this.state !== Cs && (this.state = ws);
  }
  afterBufferFlushed(t2, e2, s2) {
    if (!t2) return;
    const i2 = BufferHelper.getBuffered(t2);
    this.fragmentTracker.detectEvictedFragments(e2, i2, s2), this.state === $s && this.resetLoadingState();
  }
  resetLoadingState() {
    this.log("Reset loading state"), this.fragCurrent = null, this.fragPrevious = null, this.state !== Cs && (this.state = ws);
  }
  resetStartWhenNotLoaded() {
    if (!this.hls.hasEnoughToStart) {
      this.startFragRequested = false;
      const t2 = this.levelLastLoaded, e2 = t2 ? t2.details : null;
      null != e2 && e2.live ? (this.log("resetting startPosition for live start"), this.startPosition = -1, this.setStartPosition(e2, e2.fragmentStart), this.resetLoadingState()) : this.nextLoadPosition = this.startPosition;
    }
  }
  resetWhenMissingContext(t2) {
    this.log(`Loading context changed while buffering sn ${t2.sn} of ${this.playlistLabel()} ${-1 === t2.level ? "<removed>" : t2.level}. This chunk will not be buffered.`), this.removeUnbufferedFrags(), this.resetStartWhenNotLoaded(), this.resetLoadingState();
  }
  removeUnbufferedFrags(t2 = 0) {
    this.fragmentTracker.removeFragmentsInRange(t2, 1 / 0, this.playlistType, false, true);
  }
  updateLevelTiming(t2, e2, s2, i2) {
    const r2 = s2.details;
    if (r2) {
      if (!Object.keys(t2.elementaryStreams).reduce((e3, n3) => {
        const a2 = t2.elementaryStreams[n3];
        if (a2) {
          const o2 = a2.endPTS - a2.startPTS;
          if (o2 <= 0) return this.warn(`Could not parse fragment ${t2.sn} ${n3} duration reliably (${o2})`), e3 || false;
          const l2 = i2 ? 0 : fs(r2, t2, a2.startPTS, a2.endPTS, a2.startDTS, a2.endDTS, this);
          return this.hls.trigger(h.LEVEL_PTS_UPDATED, { details: r2, level: s2, drift: l2, type: n3, frag: t2, start: a2.startPTS, end: a2.endPTS }), true;
        }
        return e3;
      }, false)) {
        var n2;
        const e3 = null === (null == (n2 = this.transmuxer) ? void 0 : n2.error);
        if ((0 === s2.fragmentError || e3 && (s2.fragmentError < 2 || t2.endList)) && this.treatAsGap(t2, s2), e3) {
          const e4 = new Error(`Found no media in fragment ${t2.sn} of ${this.playlistLabel()} ${t2.level} resetting transmuxer to fallback to playlist timing`);
          if (this.warn(e4.message), this.hls.trigger(h.ERROR, { type: o.MEDIA_ERROR, details: l.FRAG_PARSING_ERROR, fatal: false, error: e4, frag: t2, reason: `Found no media in msn ${t2.sn} of ${this.playlistLabel()} "${s2.url}"` }), !this.hls) return;
          this.resetTransmuxer();
        }
      }
      this.state = Bs, this.log(`Parsed ${t2.type} sn: ${t2.sn}${e2 ? " part: " + e2.index : ""} of ${this.fragInfo(t2, false, e2)})`), this.hls.trigger(h.FRAG_PARSED, { frag: t2, part: e2 });
    } else this.warn("level.details undefined");
  }
  playlistLabel() {
    return this.playlistType === g ? "level" : "track";
  }
  fragInfo(t2, e2 = true, s2) {
    var i2, r2;
    return `${this.playlistLabel()} ${t2.level} (${s2 ? "part" : "frag"}:[${(null != (i2 = e2 && !s2 ? t2.startPTS : (s2 || t2).start) ? i2 : NaN).toFixed(3)}-${(null != (r2 = e2 && !s2 ? t2.endPTS : (s2 || t2).end) ? r2 : NaN).toFixed(3)}]${s2 && "main" === t2.type ? "INDEPENDENT=" + (s2.independent ? "YES" : "NO") : ""}`;
  }
  treatAsGap(t2, e2) {
    e2 && e2.fragmentError++, t2.gap = true, this.fragmentTracker.removeFragment(t2), this.fragmentTracker.fragBuffered(t2, true);
  }
  resetTransmuxer() {
    var t2;
    null == (t2 = this.transmuxer) || t2.reset();
  }
  recoverWorkerError(t2) {
    "demuxerWorker" === t2.event && (this.fragmentTracker.removeAllFragments(), this.transmuxer && (this.transmuxer.destroy(), this.transmuxer = null), this.resetStartWhenNotLoaded(), this.resetLoadingState());
  }
  set state(t2) {
    const e2 = this._state;
    e2 !== t2 && (this._state = t2, this.log(`${e2}->${t2}`));
  }
  get state() {
    return this._state;
  }
}
function Hs(t2) {
  return !!t2.interstitialsController && false !== t2.enableInterstitialPlayback;
}
class ChunkCache {
  constructor() {
    this.chunks = [], this.dataLength = 0;
  }
  push(t2) {
    this.chunks.push(t2), this.dataLength += t2.length;
  }
  flush() {
    const { chunks: t2, dataLength: e2 } = this;
    let s2;
    return t2.length ? (s2 = 1 === t2.length ? t2[0] : function(t3, e3) {
      const s3 = new Uint8Array(e3);
      let i2 = 0;
      for (let e4 = 0; e4 < t3.length; e4++) {
        const r2 = t3[e4];
        s3.set(r2, i2), i2 += r2.length;
      }
      return s3;
    }(t2, e2), this.reset(), s2) : new Uint8Array(0);
  }
  reset() {
    this.chunks.length = 0, this.dataLength = 0;
  }
}
var Vs, Ys = { exports: {} }, Ws = (Vs || (Vs = 1, function(t2) {
  var e2 = Object.prototype.hasOwnProperty, s2 = "~";
  function i2() {
  }
  function r2(t3, e3, s3) {
    this.fn = t3, this.context = e3, this.once = s3 || false;
  }
  function n2(t3, e3, i3, n3, a3) {
    if ("function" != typeof i3) throw new TypeError("The listener must be a function");
    var o3 = new r2(i3, n3 || t3, a3), l2 = s2 ? s2 + e3 : e3;
    return t3._events[l2] ? t3._events[l2].fn ? t3._events[l2] = [t3._events[l2], o3] : t3._events[l2].push(o3) : (t3._events[l2] = o3, t3._eventsCount++), t3;
  }
  function a2(t3, e3) {
    0 === --t3._eventsCount ? t3._events = new i2() : delete t3._events[e3];
  }
  function o2() {
    this._events = new i2(), this._eventsCount = 0;
  }
  Object.create && (i2.prototype = /* @__PURE__ */ Object.create(null), new i2().__proto__ || (s2 = false)), o2.prototype.eventNames = function() {
    var t3, i3, r3 = [];
    if (0 === this._eventsCount) return r3;
    for (i3 in t3 = this._events) e2.call(t3, i3) && r3.push(s2 ? i3.slice(1) : i3);
    return Object.getOwnPropertySymbols ? r3.concat(Object.getOwnPropertySymbols(t3)) : r3;
  }, o2.prototype.listeners = function(t3) {
    var e3 = s2 ? s2 + t3 : t3, i3 = this._events[e3];
    if (!i3) return [];
    if (i3.fn) return [i3.fn];
    for (var r3 = 0, n3 = i3.length, a3 = new Array(n3); r3 < n3; r3++) a3[r3] = i3[r3].fn;
    return a3;
  }, o2.prototype.listenerCount = function(t3) {
    var e3 = s2 ? s2 + t3 : t3, i3 = this._events[e3];
    return i3 ? i3.fn ? 1 : i3.length : 0;
  }, o2.prototype.emit = function(t3, e3, i3, r3, n3, a3) {
    var o3 = s2 ? s2 + t3 : t3;
    if (!this._events[o3]) return false;
    var l2, h2, d2 = this._events[o3], c2 = arguments.length;
    if (d2.fn) {
      switch (d2.once && this.removeListener(t3, d2.fn, void 0, true), c2) {
        case 1:
          return d2.fn.call(d2.context), true;
        case 2:
          return d2.fn.call(d2.context, e3), true;
        case 3:
          return d2.fn.call(d2.context, e3, i3), true;
        case 4:
          return d2.fn.call(d2.context, e3, i3, r3), true;
        case 5:
          return d2.fn.call(d2.context, e3, i3, r3, n3), true;
        case 6:
          return d2.fn.call(d2.context, e3, i3, r3, n3, a3), true;
      }
      for (h2 = 1, l2 = new Array(c2 - 1); h2 < c2; h2++) l2[h2 - 1] = arguments[h2];
      d2.fn.apply(d2.context, l2);
    } else {
      var u2, f2 = d2.length;
      for (h2 = 0; h2 < f2; h2++) switch (d2[h2].once && this.removeListener(t3, d2[h2].fn, void 0, true), c2) {
        case 1:
          d2[h2].fn.call(d2[h2].context);
          break;
        case 2:
          d2[h2].fn.call(d2[h2].context, e3);
          break;
        case 3:
          d2[h2].fn.call(d2[h2].context, e3, i3);
          break;
        case 4:
          d2[h2].fn.call(d2[h2].context, e3, i3, r3);
          break;
        default:
          if (!l2) for (u2 = 1, l2 = new Array(c2 - 1); u2 < c2; u2++) l2[u2 - 1] = arguments[u2];
          d2[h2].fn.apply(d2[h2].context, l2);
      }
    }
    return true;
  }, o2.prototype.on = function(t3, e3, s3) {
    return n2(this, t3, e3, s3, false);
  }, o2.prototype.once = function(t3, e3, s3) {
    return n2(this, t3, e3, s3, true);
  }, o2.prototype.removeListener = function(t3, e3, i3, r3) {
    var n3 = s2 ? s2 + t3 : t3;
    if (!this._events[n3]) return this;
    if (!e3) return a2(this, n3), this;
    var o3 = this._events[n3];
    if (o3.fn) o3.fn !== e3 || r3 && !o3.once || i3 && o3.context !== i3 || a2(this, n3);
    else {
      for (var l2 = 0, h2 = [], d2 = o3.length; l2 < d2; l2++) (o3[l2].fn !== e3 || r3 && !o3[l2].once || i3 && o3[l2].context !== i3) && h2.push(o3[l2]);
      h2.length ? this._events[n3] = 1 === h2.length ? h2[0] : h2 : a2(this, n3);
    }
    return this;
  }, o2.prototype.removeAllListeners = function(t3) {
    var e3;
    return t3 ? (e3 = s2 ? s2 + t3 : t3, this._events[e3] && a2(this, e3)) : (this._events = new i2(), this._eventsCount = 0), this;
  }, o2.prototype.off = o2.prototype.removeListener, o2.prototype.addListener = o2.prototype.on, o2.prefixed = s2, o2.EventEmitter = o2, t2.exports = o2;
}(Ys)), Ys.exports), js = w(Ws);
const qs = "1.6.16", Xs = {};
function zs(t2, e2) {
  return e2 + 10 <= t2.length && 51 === t2[e2] && 68 === t2[e2 + 1] && 73 === t2[e2 + 2] && t2[e2 + 3] < 255 && t2[e2 + 4] < 255 && t2[e2 + 6] < 128 && t2[e2 + 7] < 128 && t2[e2 + 8] < 128 && t2[e2 + 9] < 128;
}
function Qs(t2, e2) {
  return e2 + 10 <= t2.length && 73 === t2[e2] && 68 === t2[e2 + 1] && 51 === t2[e2 + 2] && t2[e2 + 3] < 255 && t2[e2 + 4] < 255 && t2[e2 + 6] < 128 && t2[e2 + 7] < 128 && t2[e2 + 8] < 128 && t2[e2 + 9] < 128;
}
function Zs(t2, e2) {
  let s2 = 0;
  return s2 = (127 & t2[e2]) << 21, s2 |= (127 & t2[e2 + 1]) << 14, s2 |= (127 & t2[e2 + 2]) << 7, s2 |= 127 & t2[e2 + 3], s2;
}
function Js(t2, e2) {
  const s2 = e2;
  let i2 = 0;
  for (; Qs(t2, e2); ) i2 += 10, i2 += Zs(t2, e2 + 6), zs(t2, e2 + 10) && (i2 += 10), e2 += i2;
  if (i2 > 0) return t2.subarray(s2, s2 + i2);
}
function ti(t2, e2) {
  return 255 === t2[e2] && 240 == (246 & t2[e2 + 1]);
}
function ei(t2, e2) {
  return 1 & t2[e2 + 1] ? 7 : 9;
}
function si(t2, e2) {
  return (3 & t2[e2 + 3]) << 11 | t2[e2 + 4] << 3 | (224 & t2[e2 + 5]) >>> 5;
}
function ii(t2, e2) {
  return e2 + 1 < t2.length && ti(t2, e2);
}
function ri(t2, e2) {
  if (ii(t2, e2)) {
    const s2 = ei(t2, e2);
    if (e2 + s2 >= t2.length) return false;
    const i2 = si(t2, e2);
    if (i2 <= s2) return false;
    const r2 = e2 + i2;
    return r2 === t2.length || ii(t2, r2);
  }
  return false;
}
function ni(t2, e2, s2, i2, r2) {
  if (!t2.samplerate) {
    const n2 = function(t3, e3, s3, i3) {
      const r3 = e3[s3 + 2], n3 = r3 >> 2 & 15;
      if (n3 > 12) {
        const e4 = new Error(`invalid ADTS sampling index:${n3}`);
        return void t3.emit(h.ERROR, h.ERROR, { type: o.MEDIA_ERROR, details: l.FRAG_PARSING_ERROR, fatal: true, error: e4, reason: e4.message });
      }
      const a2 = 1 + (r3 >> 6 & 3), d2 = e3[s3 + 3] >> 6 & 3 | (1 & r3) << 2, c2 = "mp4a.40." + a2, u2 = [96e3, 88200, 64e3, 48e3, 44100, 32e3, 24e3, 22050, 16e3, 12e3, 11025, 8e3, 7350][n3];
      let f2 = n3;
      5 !== a2 && 29 !== a2 || (f2 -= 3);
      const g2 = [a2 << 3 | (14 & f2) >> 1, (1 & f2) << 7 | d2 << 3];
      return I.log(`manifest codec:${i3}, parsed codec:${c2}, channels:${d2}, rate:${u2} (ADTS object type:${a2} sampling index:${n3})`), { config: g2, samplerate: u2, channelCount: d2, codec: c2, parsedCodec: c2, manifestCodec: i3 };
    }(e2, s2, i2, r2);
    if (!n2) return;
    y(t2, n2);
  }
}
function ai(t2) {
  return 9216e4 / t2;
}
function oi(t2, e2, s2, i2, r2) {
  const n2 = i2 + r2 * ai(t2.samplerate), a2 = function(t3, e3) {
    const s3 = ei(t3, e3);
    if (e3 + s3 <= t3.length) {
      const i3 = si(t3, e3) - s3;
      if (i3 > 0) return { headerLength: s3, frameLength: i3 };
    }
  }(e2, s2);
  let o2;
  if (a2) {
    const { frameLength: i3, headerLength: r3 } = a2, l3 = r3 + i3, h2 = Math.max(0, s2 + l3 - e2.length);
    h2 ? (o2 = new Uint8Array(l3 - r3), o2.set(e2.subarray(s2 + r3, e2.length), 0)) : o2 = e2.subarray(s2 + r3, s2 + l3);
    const d2 = { unit: o2, pts: n2 };
    return h2 || t2.samples.push(d2), { sample: d2, length: l3, missing: h2 };
  }
  const l2 = e2.length - s2;
  return o2 = new Uint8Array(l2), o2.set(e2.subarray(s2, e2.length), 0), { sample: { unit: o2, pts: n2 }, length: l2, missing: -1 };
}
function li(t2, e2) {
  return Qs(t2, e2) && Zs(t2, e2 + 6) + 10 <= t2.length - e2;
}
function hi(t2, e2 = 0, s2 = 1 / 0) {
  return function(t3, e3, s3, i2) {
    const r2 = (n2 = t3) instanceof ArrayBuffer ? n2 : n2.buffer;
    var n2;
    let a2 = 1;
    "BYTES_PER_ELEMENT" in i2 && (a2 = i2.BYTES_PER_ELEMENT);
    const o2 = (c2 = t3) && c2.buffer instanceof ArrayBuffer && void 0 !== c2.byteLength && void 0 !== c2.byteOffset ? t3.byteOffset : 0, l2 = (o2 + t3.byteLength) / a2, h2 = (o2 + e3) / a2, d2 = Math.floor(Math.max(0, Math.min(h2, l2)));
    var c2;
    return new i2(r2, d2, Math.floor(Math.min(d2 + Math.max(s3, 0), l2)) - d2);
  }(t2, e2, s2, Uint8Array);
}
function di(t2) {
  return "PRIV" === t2.type ? function(t3) {
    if (t3.size < 2) return;
    const e2 = D(t3.data, true), s2 = new Uint8Array(t3.data.subarray(e2.length + 1));
    return { key: t3.type, info: e2, data: s2.buffer };
  }(t2) : "W" === t2.type[0] ? function(t3) {
    if ("WXXX" === t3.type) {
      if (t3.size < 2) return;
      let e3 = 1;
      const s2 = D(t3.data.subarray(e3), true);
      e3 += s2.length + 1;
      const i2 = D(t3.data.subarray(e3));
      return { key: t3.type, info: s2, data: i2 };
    }
    const e2 = D(t3.data);
    return { key: t3.type, info: "", data: e2 };
  }(t2) : "APIC" === t2.type ? function(t3) {
    const e2 = { key: t3.type, description: "", data: "", mimeType: null, pictureType: null };
    if (t3.size < 2) return;
    if (3 !== t3.data[0]) return void globalThis.__movilog?.log("Ignore frame with unrecognized character encoding");
    const s2 = t3.data.subarray(1).indexOf(0);
    if (-1 === s2) return;
    const i2 = D(hi(t3.data, 1, s2)), r2 = t3.data[2 + s2], n2 = t3.data.subarray(3 + s2).indexOf(0);
    if (-1 === n2) return;
    const a2 = D(hi(t3.data, 3 + s2, n2));
    let o2;
    return o2 = "-->" === i2 ? D(hi(t3.data, 4 + s2 + n2)) : (l2 = t3.data.subarray(4 + s2 + n2)) instanceof ArrayBuffer ? l2 : 0 == l2.byteOffset && l2.byteLength == l2.buffer.byteLength ? l2.buffer : new Uint8Array(l2).buffer, e2.mimeType = i2, e2.pictureType = r2, e2.description = a2, e2.data = o2, e2;
    var l2;
  }(t2) : function(t3) {
    if (t3.size < 2) return;
    if ("TXXX" === t3.type) {
      let e3 = 1;
      const s2 = D(t3.data.subarray(e3), true);
      e3 += s2.length + 1;
      const i2 = D(t3.data.subarray(e3));
      return { key: t3.type, info: s2, data: i2 };
    }
    const e2 = D(t3.data.subarray(1));
    return { key: t3.type, info: "", data: e2 };
  }(t2);
}
function ci(t2) {
  const e2 = String.fromCharCode(t2[0], t2[1], t2[2], t2[3]), s2 = Zs(t2, 4);
  return { type: e2, size: s2, data: t2.subarray(10, 10 + s2) };
}
function ui(t2) {
  let e2 = 0;
  const s2 = [];
  for (; Qs(t2, e2); ) {
    const i2 = Zs(t2, e2 + 6);
    t2[e2 + 5] >> 6 & 1 && (e2 += 10), e2 += 10;
    const r2 = e2 + i2;
    for (; e2 + 10 < r2; ) {
      const i3 = ci(t2.subarray(e2)), r3 = di(i3);
      r3 && s2.push(r3), e2 += i3.size + 10;
    }
    zs(t2, e2) && (e2 += 10);
  }
  return s2;
}
function fi(t2) {
  return t2 && "PRIV" === t2.key && "com.apple.streaming.transportStreamTimestamp" === t2.info;
}
function gi(t2) {
  if (8 === t2.data.byteLength) {
    const e2 = new Uint8Array(t2.data), s2 = 1 & e2[3];
    let i2 = (e2[4] << 23) + (e2[5] << 15) + (e2[6] << 7) + e2[7];
    return i2 /= 45, s2 && (i2 += 4772185884e-2), Math.round(i2);
  }
}
function mi(t2) {
  const e2 = ui(t2);
  for (let t3 = 0; t3 < e2.length; t3++) {
    const s2 = e2[t3];
    if (fi(s2)) return gi(s2);
  }
}
let pi = function(t2) {
  return t2.audioId3 = "org.id3", t2.dateRange = "com.apple.quicktime.HLS", t2.emsg = "https://aomedia.org/emsg/ID3", t2.misbklv = "urn:misb:KLV:bin:1910.1", t2;
}({});
function vi(t2 = "", e2 = 9e4) {
  return { type: t2, id: -1, pid: -1, inputTimeScale: e2, sequenceNumber: -1, samples: [], dropped: 0 };
}
class BaseAudioDemuxer {
  constructor() {
    this._audioTrack = void 0, this._id3Track = void 0, this.frameIndex = 0, this.cachedData = null, this.basePTS = null, this.initPTS = null, this.lastPTS = null;
  }
  resetInitSegment(t2, e2, s2, i2) {
    this._id3Track = { type: "id3", id: 3, pid: -1, inputTimeScale: 9e4, sequenceNumber: 0, samples: [], dropped: 0 };
  }
  resetTimeStamp(t2) {
    this.initPTS = t2, this.resetContiguity();
  }
  resetContiguity() {
    this.basePTS = null, this.lastPTS = null, this.frameIndex = 0;
  }
  canParse(t2, e2) {
    return false;
  }
  appendFrame(t2, e2, s2) {
  }
  demux(t2, e2) {
    this.cachedData && (t2 = nt(this.cachedData, t2), this.cachedData = null);
    let s2, i2 = Js(t2, 0), n2 = i2 ? i2.length : 0;
    const a2 = this._audioTrack, o2 = this._id3Track, l2 = i2 ? mi(i2) : void 0, h2 = t2.length;
    for ((null === this.basePTS || 0 === this.frameIndex && r(l2)) && (this.basePTS = yi(l2, e2, this.initPTS), this.lastPTS = this.basePTS), null === this.lastPTS && (this.lastPTS = this.basePTS), i2 && i2.length > 0 && o2.samples.push({ pts: this.lastPTS, dts: this.lastPTS, data: i2, type: pi.audioId3, duration: Number.POSITIVE_INFINITY }); n2 < h2; ) {
      if (this.canParse(t2, n2)) {
        const e3 = this.appendFrame(a2, t2, n2);
        e3 ? (this.frameIndex++, this.lastPTS = e3.sample.pts, n2 += e3.length, s2 = n2) : n2 = h2;
      } else li(t2, n2) ? (i2 = Js(t2, n2), o2.samples.push({ pts: this.lastPTS, dts: this.lastPTS, data: i2, type: pi.audioId3, duration: Number.POSITIVE_INFINITY }), n2 += i2.length, s2 = n2) : n2++;
      if (n2 === h2 && s2 !== h2) {
        const e3 = t2.slice(s2);
        this.cachedData ? this.cachedData = nt(this.cachedData, e3) : this.cachedData = e3;
      }
    }
    return { audioTrack: a2, videoTrack: vi(), id3Track: o2, textTrack: vi() };
  }
  demuxSampleAes(t2, e2, s2) {
    return Promise.reject(new Error(`[${this}] This demuxer does not support Sample-AES decryption`));
  }
  flush(t2) {
    const e2 = this.cachedData;
    return e2 && (this.cachedData = null, this.demux(e2, 0)), { audioTrack: this._audioTrack, videoTrack: vi(), id3Track: this._id3Track, textTrack: vi() };
  }
  destroy() {
    this.cachedData = null, this._audioTrack = this._id3Track = void 0;
  }
}
const yi = (t2, e2, s2) => r(t2) ? 90 * t2 : 9e4 * e2 + (s2 ? 9e4 * s2.baseTime / s2.timescale : 0);
let Ei = null;
const Ti = [32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160], Si = [44100, 48e3, 32e3, 22050, 24e3, 16e3, 11025, 12e3, 8e3], Li = [[0, 72, 144, 12], [0, 0, 0, 0], [0, 72, 144, 12], [0, 144, 144, 12]], Ai = [0, 1, 1, 4];
function Ri(t2, e2, s2, i2, r2) {
  if (s2 + 24 > e2.length) return;
  const n2 = bi(e2, s2);
  if (n2 && s2 + n2.frameLength <= e2.length) {
    const a2 = i2 + r2 * (9e4 * n2.samplesPerFrame / n2.sampleRate), o2 = { unit: e2.subarray(s2, s2 + n2.frameLength), pts: a2, dts: a2 };
    return t2.config = [], t2.channelCount = n2.channelCount, t2.samplerate = n2.sampleRate, t2.samples.push(o2), { sample: o2, length: n2.frameLength, missing: 0 };
  }
}
function bi(t2, e2) {
  const s2 = t2[e2 + 1] >> 3 & 3, i2 = t2[e2 + 1] >> 1 & 3, r2 = t2[e2 + 2] >> 4 & 15, n2 = t2[e2 + 2] >> 2 & 3;
  if (1 !== s2 && 0 !== r2 && 15 !== r2 && 3 !== n2) {
    const a2 = t2[e2 + 2] >> 1 & 1, o2 = t2[e2 + 3] >> 6, l2 = 1e3 * Ti[14 * (3 === s2 ? 3 - i2 : 3 === i2 ? 3 : 4) + r2 - 1], h2 = Si[3 * (3 === s2 ? 0 : 2 === s2 ? 1 : 2) + n2], d2 = 3 === o2 ? 1 : 2, c2 = Li[s2][i2], u2 = Ai[i2], f2 = 8 * c2 * u2, g2 = Math.floor(c2 * l2 / h2 + a2) * u2;
    if (null === Ei) {
      const t3 = (navigator.userAgent || "").match(/Chrome\/(\d+)/i);
      Ei = t3 ? parseInt(t3[1]) : 0;
    }
    return !!Ei && Ei <= 87 && 2 === i2 && l2 >= 224e3 && 0 === o2 && (t2[e2 + 3] = 128 | t2[e2 + 3]), { sampleRate: h2, channelCount: d2, frameLength: g2, samplesPerFrame: f2 };
  }
}
function Ii(t2, e2) {
  return !(255 !== t2[e2] || 224 & ~t2[e2 + 1] || !(6 & t2[e2 + 1]));
}
function ki(t2, e2) {
  return e2 + 1 < t2.length && Ii(t2, e2);
}
function Pi(t2, e2) {
  if (e2 + 1 < t2.length && Ii(t2, e2)) {
    const s2 = 4, i2 = bi(t2, e2);
    let r2 = s2;
    null != i2 && i2.frameLength && (r2 = i2.frameLength);
    const n2 = e2 + r2;
    return n2 === t2.length || ki(t2, n2);
  }
  return false;
}
const Di = (t2, e2) => {
  let s2 = 0, i2 = 5;
  e2 += i2;
  const r2 = new Uint32Array(1), n2 = new Uint32Array(1), a2 = new Uint8Array(1);
  for (; i2 > 0; ) {
    a2[0] = t2[e2];
    const o2 = Math.min(i2, 8), l2 = 8 - o2;
    n2[0] = 4278190080 >>> 24 + l2 << l2, r2[0] = (a2[0] & n2[0]) >> l2, s2 = s2 ? s2 << o2 | r2[0] : r2[0], e2 += 1, i2 -= o2;
  }
  return s2;
};
function _i(t2, e2, s2, i2, r2) {
  if (s2 + 8 > e2.length) return -1;
  if (11 !== e2[s2] || 119 !== e2[s2 + 1]) return -1;
  const n2 = e2[s2 + 4] >> 6;
  if (n2 >= 3) return -1;
  const a2 = [48e3, 44100, 32e3][n2], o2 = 63 & e2[s2 + 4], l2 = 2 * [64, 69, 96, 64, 70, 96, 80, 87, 120, 80, 88, 120, 96, 104, 144, 96, 105, 144, 112, 121, 168, 112, 122, 168, 128, 139, 192, 128, 140, 192, 160, 174, 240, 160, 175, 240, 192, 208, 288, 192, 209, 288, 224, 243, 336, 224, 244, 336, 256, 278, 384, 256, 279, 384, 320, 348, 480, 320, 349, 480, 384, 417, 576, 384, 418, 576, 448, 487, 672, 448, 488, 672, 512, 557, 768, 512, 558, 768, 640, 696, 960, 640, 697, 960, 768, 835, 1152, 768, 836, 1152, 896, 975, 1344, 896, 976, 1344, 1024, 1114, 1536, 1024, 1115, 1536, 1152, 1253, 1728, 1152, 1254, 1728, 1280, 1393, 1920, 1280, 1394, 1920][3 * o2 + n2];
  if (s2 + l2 > e2.length) return -1;
  const h2 = e2[s2 + 6] >> 5;
  let d2 = 0;
  2 === h2 ? d2 += 2 : (1 & h2 && 1 !== h2 && (d2 += 2), 4 & h2 && (d2 += 2));
  const c2 = (e2[s2 + 6] << 8 | e2[s2 + 7]) >> 12 - d2 & 1, u2 = [2, 1, 2, 3, 3, 4, 4, 5][h2] + c2, f2 = e2[s2 + 5] >> 3, g2 = 7 & e2[s2 + 5], m2 = new Uint8Array([n2 << 6 | f2 << 1 | g2 >> 2, (3 & g2) << 6 | h2 << 3 | c2 << 2 | o2 >> 4, o2 << 4 & 224]), p2 = i2 + r2 * (1536 / a2 * 9e4), v2 = e2.subarray(s2, s2 + l2);
  return t2.config = m2, t2.channelCount = u2, t2.samplerate = a2, t2.samples.push({ unit: v2, pts: p2 }), l2;
}
const Ci = /\/emsg[-/]ID3/i;
function wi(t2, e2) {
  return r(t2.presentationTime) ? t2.presentationTime / t2.timeScale : e2 + t2.presentationTimeDelta / t2.timeScale;
}
class SampleAesDecrypter {
  constructor(t2, e2, s2) {
    this.keyData = void 0, this.decrypter = void 0, this.keyData = s2, this.decrypter = new Decrypter(e2, { removePKCS7Padding: false });
  }
  decryptBuffer(t2) {
    return this.decrypter.decrypt(t2, this.keyData.key.buffer, this.keyData.iv.buffer, 0);
  }
  decryptAacSample(t2, e2, s2) {
    const i2 = t2[e2].unit;
    if (i2.length <= 16) return;
    const r2 = i2.subarray(16, i2.length - i2.length % 16), n2 = r2.buffer.slice(r2.byteOffset, r2.byteOffset + r2.length);
    this.decryptBuffer(n2).then((r3) => {
      const n3 = new Uint8Array(r3);
      i2.set(n3, 16), this.decrypter.isSync() || this.decryptAacSamples(t2, e2 + 1, s2);
    }).catch(s2);
  }
  decryptAacSamples(t2, e2, s2) {
    for (; ; e2++) {
      if (e2 >= t2.length) return void s2();
      if (!(t2[e2].unit.length < 32 || (this.decryptAacSample(t2, e2, s2), this.decrypter.isSync()))) return;
    }
  }
  getAvcEncryptedData(t2) {
    const e2 = 16 * Math.floor((t2.length - 48) / 160) + 16, s2 = new Int8Array(e2);
    let i2 = 0;
    for (let e3 = 32; e3 < t2.length - 16; e3 += 160, i2 += 16) s2.set(t2.subarray(e3, e3 + 16), i2);
    return s2;
  }
  getAvcDecryptedUnit(t2, e2) {
    const s2 = new Uint8Array(e2);
    let i2 = 0;
    for (let e3 = 32; e3 < t2.length - 16; e3 += 160, i2 += 16) t2.set(s2.subarray(i2, i2 + 16), e3);
    return t2;
  }
  decryptAvcSample(t2, e2, s2, i2, r2) {
    const n2 = dt(r2.data), a2 = this.getAvcEncryptedData(n2);
    this.decryptBuffer(a2.buffer).then((a3) => {
      r2.data = this.getAvcDecryptedUnit(n2, a3), this.decrypter.isSync() || this.decryptAvcSamples(t2, e2, s2 + 1, i2);
    }).catch(i2);
  }
  decryptAvcSamples(t2, e2, s2, i2) {
    if (t2 instanceof Uint8Array) throw new Error("Cannot decrypt samples of type Uint8Array");
    for (; ; e2++, s2 = 0) {
      if (e2 >= t2.length) return void i2();
      const r2 = t2[e2].units;
      for (; !(s2 >= r2.length); s2++) {
        const n2 = r2[s2];
        if (!(n2.data.length <= 48 || 1 !== n2.type && 5 !== n2.type || (this.decryptAvcSample(t2, e2, s2, i2, n2), this.decrypter.isSync()))) return;
      }
    }
  }
}
class BaseVideoParser {
  constructor() {
    this.VideoSample = null;
  }
  createVideoSample(t2, e2, s2) {
    return { key: t2, frame: false, pts: e2, dts: s2, units: [], length: 0 };
  }
  getLastNalUnit(t2) {
    var e2;
    let s2, i2 = this.VideoSample;
    if (i2 && 0 !== i2.units.length || (i2 = t2[t2.length - 1]), null != (e2 = i2) && e2.units) {
      const t3 = i2.units;
      s2 = t3[t3.length - 1];
    }
    return s2;
  }
  pushAccessUnit(t2, e2) {
    if (t2.units.length && t2.frame) {
      if (void 0 === t2.pts) {
        const s2 = e2.samples, i2 = s2.length;
        if (!i2) return void e2.dropped++;
        {
          const e3 = s2[i2 - 1];
          t2.pts = e3.pts, t2.dts = e3.dts;
        }
      }
      e2.samples.push(t2);
    }
  }
  parseNALu(t2, e2, s2) {
    const i2 = e2.byteLength;
    let r2 = t2.naluState || 0;
    const n2 = r2, a2 = [];
    let o2, l2, h2, d2 = 0, c2 = -1, u2 = 0;
    for (-1 === r2 && (c2 = 0, u2 = this.getNALuType(e2, 0), r2 = 0, d2 = 1); d2 < i2; ) if (o2 = e2[d2++], r2) if (1 !== r2) if (o2) if (1 === o2) {
      if (l2 = d2 - r2 - 1, c2 >= 0) {
        const t3 = { data: e2.subarray(c2, l2), type: u2 };
        a2.push(t3);
      } else {
        const s3 = this.getLastNalUnit(t2.samples);
        s3 && (n2 && d2 <= 4 - n2 && s3.state && (s3.data = s3.data.subarray(0, s3.data.byteLength - n2)), l2 > 0 && (s3.data = nt(s3.data, e2.subarray(0, l2)), s3.state = 0));
      }
      d2 < i2 ? (h2 = this.getNALuType(e2, d2), c2 = d2, u2 = h2, r2 = 0) : r2 = -1;
    } else r2 = 0;
    else r2 = 3;
    else r2 = o2 ? 0 : 2;
    else r2 = o2 ? 0 : 1;
    if (c2 >= 0 && r2 >= 0) {
      const t3 = { data: e2.subarray(c2, i2), type: u2, state: r2 };
      a2.push(t3);
    }
    if (0 === a2.length) {
      const s3 = this.getLastNalUnit(t2.samples);
      s3 && (s3.data = nt(s3.data, e2));
    }
    return t2.naluState = r2, a2;
  }
}
class ExpGolomb {
  constructor(t2) {
    this.data = void 0, this.bytesAvailable = void 0, this.word = void 0, this.bitsAvailable = void 0, this.data = t2, this.bytesAvailable = t2.byteLength, this.word = 0, this.bitsAvailable = 0;
  }
  loadWord() {
    const t2 = this.data, e2 = this.bytesAvailable, s2 = t2.byteLength - e2, i2 = new Uint8Array(4), r2 = Math.min(4, e2);
    if (0 === r2) throw new Error("no bytes available");
    i2.set(t2.subarray(s2, s2 + r2)), this.word = new DataView(i2.buffer).getUint32(0), this.bitsAvailable = 8 * r2, this.bytesAvailable -= r2;
  }
  skipBits(t2) {
    let e2;
    t2 = Math.min(t2, 8 * this.bytesAvailable + this.bitsAvailable), this.bitsAvailable > t2 ? (this.word <<= t2, this.bitsAvailable -= t2) : (e2 = (t2 -= this.bitsAvailable) >> 3, t2 -= e2 << 3, this.bytesAvailable -= e2, this.loadWord(), this.word <<= t2, this.bitsAvailable -= t2);
  }
  readBits(t2) {
    let e2 = Math.min(this.bitsAvailable, t2);
    const s2 = this.word >>> 32 - e2;
    if (t2 > 32 && I.error("Cannot read more than 32 bits at a time"), this.bitsAvailable -= e2, this.bitsAvailable > 0) this.word <<= e2;
    else {
      if (!(this.bytesAvailable > 0)) throw new Error("no bits available");
      this.loadWord();
    }
    return e2 = t2 - e2, e2 > 0 && this.bitsAvailable ? s2 << e2 | this.readBits(e2) : s2;
  }
  skipLZ() {
    let t2;
    for (t2 = 0; t2 < this.bitsAvailable; ++t2) if (this.word & 2147483648 >>> t2) return this.word <<= t2, this.bitsAvailable -= t2, t2;
    return this.loadWord(), t2 + this.skipLZ();
  }
  skipUEG() {
    this.skipBits(1 + this.skipLZ());
  }
  skipEG() {
    this.skipBits(1 + this.skipLZ());
  }
  readUEG() {
    const t2 = this.skipLZ();
    return this.readBits(t2 + 1) - 1;
  }
  readEG() {
    const t2 = this.readUEG();
    return 1 & t2 ? 1 + t2 >>> 1 : -1 * (t2 >>> 1);
  }
  readBoolean() {
    return 1 === this.readBits(1);
  }
  readUByte() {
    return this.readBits(8);
  }
  readUShort() {
    return this.readBits(16);
  }
  readUInt() {
    return this.readBits(32);
  }
}
class AvcVideoParser extends BaseVideoParser {
  parsePES(t2, e2, s2, i2) {
    const r2 = this.parseNALu(t2, s2.data, i2);
    let n2, a2 = this.VideoSample, o2 = false;
    s2.data = null, a2 && r2.length && !t2.audFound && (this.pushAccessUnit(a2, t2), a2 = this.VideoSample = this.createVideoSample(false, s2.pts, s2.dts)), r2.forEach((i3) => {
      var r3, l2;
      switch (i3.type) {
        case 1: {
          let e3 = false;
          n2 = true;
          const r4 = i3.data;
          if (o2 && r4.length > 4) {
            const t3 = this.readSliceType(r4);
            2 !== t3 && 4 !== t3 && 7 !== t3 && 9 !== t3 || (e3 = true);
          }
          var h2;
          e3 && null != (h2 = a2) && h2.frame && !a2.key && (this.pushAccessUnit(a2, t2), a2 = this.VideoSample = null), a2 || (a2 = this.VideoSample = this.createVideoSample(true, s2.pts, s2.dts)), a2.frame = true, a2.key = e3;
          break;
        }
        case 5:
          n2 = true, null != (r3 = a2) && r3.frame && !a2.key && (this.pushAccessUnit(a2, t2), a2 = this.VideoSample = null), a2 || (a2 = this.VideoSample = this.createVideoSample(true, s2.pts, s2.dts)), a2.key = true, a2.frame = true;
          break;
        case 6:
          n2 = true, ht(i3.data, 1, s2.pts, e2.samples);
          break;
        case 7: {
          var d2, c2;
          n2 = true, o2 = true;
          const e3 = i3.data, s3 = this.readSPS(e3);
          if (!t2.sps || t2.width !== s3.width || t2.height !== s3.height || (null == (d2 = t2.pixelRatio) ? void 0 : d2[0]) !== s3.pixelRatio[0] || (null == (c2 = t2.pixelRatio) ? void 0 : c2[1]) !== s3.pixelRatio[1]) {
            t2.width = s3.width, t2.height = s3.height, t2.pixelRatio = s3.pixelRatio, t2.sps = [e3];
            const i4 = e3.subarray(1, 4);
            let r4 = "avc1.";
            for (let t3 = 0; t3 < 3; t3++) {
              let e4 = i4[t3].toString(16);
              e4.length < 2 && (e4 = "0" + e4), r4 += e4;
            }
            t2.codec = r4;
          }
          break;
        }
        case 8:
          n2 = true, t2.pps = [i3.data];
          break;
        case 9:
          n2 = true, t2.audFound = true, null != (l2 = a2) && l2.frame && (this.pushAccessUnit(a2, t2), a2 = null), a2 || (a2 = this.VideoSample = this.createVideoSample(false, s2.pts, s2.dts));
          break;
        case 12:
          n2 = true;
          break;
        default:
          n2 = false;
      }
      a2 && n2 && a2.units.push(i3);
    }), i2 && a2 && (this.pushAccessUnit(a2, t2), this.VideoSample = null);
  }
  getNALuType(t2, e2) {
    return 31 & t2[e2];
  }
  readSliceType(t2) {
    const e2 = new ExpGolomb(t2);
    return e2.readUByte(), e2.readUEG(), e2.readUEG();
  }
  skipScalingList(t2, e2) {
    let s2, i2 = 8, r2 = 8;
    for (let n2 = 0; n2 < t2; n2++) 0 !== r2 && (s2 = e2.readEG(), r2 = (i2 + s2 + 256) % 256), i2 = 0 === r2 ? i2 : r2;
  }
  readSPS(t2) {
    const e2 = new ExpGolomb(t2);
    let s2, i2, r2, n2 = 0, a2 = 0, o2 = 0, l2 = 0;
    const h2 = e2.readUByte.bind(e2), d2 = e2.readBits.bind(e2), c2 = e2.readUEG.bind(e2), u2 = e2.readBoolean.bind(e2), f2 = e2.skipBits.bind(e2), g2 = e2.skipEG.bind(e2), m2 = e2.skipUEG.bind(e2), p2 = this.skipScalingList.bind(this);
    h2();
    const v2 = h2();
    if (d2(5), f2(3), h2(), m2(), 100 === v2 || 110 === v2 || 122 === v2 || 244 === v2 || 44 === v2 || 83 === v2 || 86 === v2 || 118 === v2 || 128 === v2) {
      const t3 = c2();
      if (3 === t3 && f2(1), m2(), m2(), f2(1), u2()) for (i2 = 3 !== t3 ? 8 : 12, r2 = 0; r2 < i2; r2++) u2() && p2(r2 < 6 ? 16 : 64, e2);
    }
    m2();
    const y2 = c2();
    if (0 === y2) c2();
    else if (1 === y2) for (f2(1), g2(), g2(), s2 = c2(), r2 = 0; r2 < s2; r2++) g2();
    m2(), f2(1);
    const E2 = c2(), T2 = c2(), S2 = d2(1);
    0 === S2 && f2(1), f2(1), u2() && (n2 = c2(), a2 = c2(), o2 = c2(), l2 = c2());
    let L2 = [1, 1];
    if (u2() && u2()) switch (h2()) {
      case 1:
        L2 = [1, 1];
        break;
      case 2:
        L2 = [12, 11];
        break;
      case 3:
        L2 = [10, 11];
        break;
      case 4:
        L2 = [16, 11];
        break;
      case 5:
        L2 = [40, 33];
        break;
      case 6:
        L2 = [24, 11];
        break;
      case 7:
        L2 = [20, 11];
        break;
      case 8:
        L2 = [32, 11];
        break;
      case 9:
        L2 = [80, 33];
        break;
      case 10:
        L2 = [18, 11];
        break;
      case 11:
        L2 = [15, 11];
        break;
      case 12:
        L2 = [64, 33];
        break;
      case 13:
        L2 = [160, 99];
        break;
      case 14:
        L2 = [4, 3];
        break;
      case 15:
        L2 = [3, 2];
        break;
      case 16:
        L2 = [2, 1];
        break;
      case 255:
        L2 = [h2() << 8 | h2(), h2() << 8 | h2()];
    }
    return { width: Math.ceil(16 * (E2 + 1) - 2 * n2 - 2 * a2), height: (2 - S2) * (T2 + 1) * 16 - (S2 ? 2 : 4) * (o2 + l2), pixelRatio: L2 };
  }
}
class HevcVideoParser extends BaseVideoParser {
  constructor(...t2) {
    super(...t2), this.initVPS = null;
  }
  parsePES(t2, e2, s2, i2) {
    const r2 = this.parseNALu(t2, s2.data, i2);
    let n2, a2 = this.VideoSample, o2 = false;
    s2.data = null, a2 && r2.length && !t2.audFound && (this.pushAccessUnit(a2, t2), a2 = this.VideoSample = this.createVideoSample(false, s2.pts, s2.dts)), r2.forEach((i3) => {
      var r3, l2;
      switch (i3.type) {
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
          a2 || (a2 = this.VideoSample = this.createVideoSample(false, s2.pts, s2.dts)), a2.frame = true, n2 = true;
          break;
        case 16:
        case 17:
        case 18:
        case 21:
          var h2;
          n2 = true, o2 && null != (h2 = a2) && h2.frame && !a2.key && (this.pushAccessUnit(a2, t2), a2 = this.VideoSample = null), a2 || (a2 = this.VideoSample = this.createVideoSample(true, s2.pts, s2.dts)), a2.key = true, a2.frame = true;
          break;
        case 19:
        case 20:
          n2 = true, null != (r3 = a2) && r3.frame && !a2.key && (this.pushAccessUnit(a2, t2), a2 = this.VideoSample = null), a2 || (a2 = this.VideoSample = this.createVideoSample(true, s2.pts, s2.dts)), a2.key = true, a2.frame = true;
          break;
        case 39:
          n2 = true, ht(i3.data, 2, s2.pts, e2.samples);
          break;
        case 32:
          n2 = true, t2.vps || ("object" != typeof t2.params && (t2.params = {}), t2.params = y(t2.params, this.readVPS(i3.data)), this.initVPS = i3.data), t2.vps = [i3.data];
          break;
        case 33:
          if (n2 = true, o2 = true, void 0 === t2.vps || t2.vps[0] === this.initVPS || void 0 === t2.sps || this.matchSPS(t2.sps[0], i3.data) || (this.initVPS = t2.vps[0], t2.sps = t2.pps = void 0), !t2.sps) {
            const e3 = this.readSPS(i3.data);
            t2.width = e3.width, t2.height = e3.height, t2.pixelRatio = e3.pixelRatio, t2.codec = e3.codecString, t2.sps = [], "object" != typeof t2.params && (t2.params = {});
            for (const s3 in e3.params) t2.params[s3] = e3.params[s3];
          }
          this.pushParameterSet(t2.sps, i3.data, t2.vps), a2 || (a2 = this.VideoSample = this.createVideoSample(true, s2.pts, s2.dts)), a2.key = true;
          break;
        case 34:
          if (n2 = true, "object" == typeof t2.params) {
            if (!t2.pps) {
              t2.pps = [];
              const e3 = this.readPPS(i3.data);
              for (const s3 in e3) t2.params[s3] = e3[s3];
            }
            this.pushParameterSet(t2.pps, i3.data, t2.vps);
          }
          break;
        case 35:
          n2 = true, t2.audFound = true, null != (l2 = a2) && l2.frame && (this.pushAccessUnit(a2, t2), a2 = null), a2 || (a2 = this.VideoSample = this.createVideoSample(false, s2.pts, s2.dts));
          break;
        default:
          n2 = false;
      }
      a2 && n2 && a2.units.push(i3);
    }), i2 && a2 && (this.pushAccessUnit(a2, t2), this.VideoSample = null);
  }
  pushParameterSet(t2, e2, s2) {
    (s2 && s2[0] === this.initVPS || !s2 && !t2.length) && t2.push(e2);
  }
  getNALuType(t2, e2) {
    return (126 & t2[e2]) >>> 1;
  }
  ebsp2rbsp(t2) {
    const e2 = new Uint8Array(t2.byteLength);
    let s2 = 0;
    for (let i2 = 0; i2 < t2.byteLength; i2++) i2 >= 2 && 3 === t2[i2] && 0 === t2[i2 - 1] && 0 === t2[i2 - 2] || (e2[s2] = t2[i2], s2++);
    return new Uint8Array(e2.buffer, 0, s2);
  }
  pushAccessUnit(t2, e2) {
    super.pushAccessUnit(t2, e2), this.initVPS && (this.initVPS = null);
  }
  readVPS(t2) {
    const e2 = new ExpGolomb(t2);
    return e2.readUByte(), e2.readUByte(), e2.readBits(4), e2.skipBits(2), e2.readBits(6), { numTemporalLayers: e2.readBits(3) + 1, temporalIdNested: e2.readBoolean() };
  }
  readSPS(t2) {
    const e2 = new ExpGolomb(this.ebsp2rbsp(t2));
    e2.readUByte(), e2.readUByte(), e2.readBits(4);
    const s2 = e2.readBits(3);
    e2.readBoolean();
    const i2 = e2.readBits(2), r2 = e2.readBoolean(), n2 = e2.readBits(5), a2 = e2.readUByte(), o2 = e2.readUByte(), l2 = e2.readUByte(), h2 = e2.readUByte(), d2 = e2.readUByte(), c2 = e2.readUByte(), u2 = e2.readUByte(), f2 = e2.readUByte(), g2 = e2.readUByte(), m2 = e2.readUByte(), p2 = e2.readUByte(), v2 = [], y2 = [];
    for (let t3 = 0; t3 < s2; t3++) v2.push(e2.readBoolean()), y2.push(e2.readBoolean());
    if (s2 > 0) for (let t3 = s2; t3 < 8; t3++) e2.readBits(2);
    for (let t3 = 0; t3 < s2; t3++) v2[t3] && (e2.readUByte(), e2.readUByte(), e2.readUByte(), e2.readUByte(), e2.readUByte(), e2.readUByte(), e2.readUByte(), e2.readUByte(), e2.readUByte(), e2.readUByte(), e2.readUByte()), y2[t3] && e2.readUByte();
    e2.readUEG();
    const E2 = e2.readUEG();
    3 == E2 && e2.skipBits(1);
    const T2 = e2.readUEG(), S2 = e2.readUEG(), L2 = e2.readBoolean();
    let A2 = 0, R2 = 0, b2 = 0, I2 = 0;
    L2 && (A2 += e2.readUEG(), R2 += e2.readUEG(), b2 += e2.readUEG(), I2 += e2.readUEG());
    const k2 = e2.readUEG(), P2 = e2.readUEG(), D2 = e2.readUEG();
    for (let t3 = e2.readBoolean() ? 0 : s2; t3 <= s2; t3++) e2.skipUEG(), e2.skipUEG(), e2.skipUEG();
    if (e2.skipUEG(), e2.skipUEG(), e2.skipUEG(), e2.skipUEG(), e2.skipUEG(), e2.skipUEG(), e2.readBoolean() && e2.readBoolean()) for (let t3 = 0; t3 < 4; t3++) for (let s3 = 0; s3 < (3 === t3 ? 2 : 6); s3++) if (e2.readBoolean()) {
      const s4 = Math.min(64, 1 << 4 + (t3 << 1));
      t3 > 1 && e2.readEG();
      for (let t4 = 0; t4 < s4; t4++) e2.readEG();
    } else e2.readUEG();
    e2.readBoolean(), e2.readBoolean(), e2.readBoolean() && (e2.readUByte(), e2.skipUEG(), e2.skipUEG(), e2.readBoolean());
    const _2 = e2.readUEG();
    let C2 = 0;
    for (let t3 = 0; t3 < _2; t3++) {
      let s3 = false;
      if (0 !== t3 && (s3 = e2.readBoolean()), s3) {
        t3 === _2 && e2.readUEG(), e2.readBoolean(), e2.readUEG();
        let s4 = 0;
        for (let t4 = 0; t4 <= C2; t4++) {
          const t5 = e2.readBoolean();
          let i3 = false;
          t5 || (i3 = e2.readBoolean()), (t5 || i3) && s4++;
        }
        C2 = s4;
      } else {
        const t4 = e2.readUEG(), s4 = e2.readUEG();
        C2 = t4 + s4;
        for (let s5 = 0; s5 < t4; s5++) e2.readUEG(), e2.readBoolean();
        for (let t5 = 0; t5 < s4; t5++) e2.readUEG(), e2.readBoolean();
      }
    }
    if (e2.readBoolean()) {
      const t3 = e2.readUEG();
      for (let s3 = 0; s3 < t3; s3++) {
        for (let t4 = 0; t4 < D2 + 4; t4++) e2.readBits(1);
        e2.readBits(1);
      }
    }
    let w2 = 0, M2 = 1, x2 = 1, O2 = true, F2 = 1, N2 = 0;
    e2.readBoolean(), e2.readBoolean();
    let B2 = false;
    if (e2.readBoolean()) {
      if (e2.readBoolean()) {
        const t3 = e2.readUByte();
        t3 > 0 && t3 < 16 ? (M2 = [1, 12, 10, 16, 40, 24, 20, 32, 80, 18, 15, 64, 160, 4, 3, 2][t3 - 1], x2 = [1, 11, 11, 11, 33, 11, 11, 11, 33, 11, 11, 33, 99, 3, 2, 1][t3 - 1]) : 255 === t3 && (M2 = e2.readBits(16), x2 = e2.readBits(16));
      }
      if (e2.readBoolean() && e2.readBoolean(), e2.readBoolean() && (e2.readBits(3), e2.readBoolean(), e2.readBoolean() && (e2.readUByte(), e2.readUByte(), e2.readUByte())), e2.readBoolean() && (e2.readUEG(), e2.readUEG()), e2.readBoolean(), e2.readBoolean(), e2.readBoolean(), B2 = e2.readBoolean(), B2 && (e2.skipUEG(), e2.skipUEG(), e2.skipUEG(), e2.skipUEG()), e2.readBoolean() && (F2 = e2.readBits(32), N2 = e2.readBits(32), e2.readBoolean() && e2.readUEG(), e2.readBoolean())) {
        const t3 = e2.readBoolean(), i3 = e2.readBoolean();
        let r3 = false;
        (t3 || i3) && (r3 = e2.readBoolean(), r3 && (e2.readUByte(), e2.readBits(5), e2.readBoolean(), e2.readBits(5)), e2.readBits(4), e2.readBits(4), r3 && e2.readBits(4), e2.readBits(5), e2.readBits(5), e2.readBits(5));
        for (let n3 = 0; n3 <= s2; n3++) {
          O2 = e2.readBoolean();
          let s3 = false;
          O2 || e2.readBoolean() ? e2.readEG() : s3 = e2.readBoolean();
          const n4 = s3 ? 1 : e2.readUEG() + 1;
          if (t3) for (let t4 = 0; t4 < n4; t4++) e2.readUEG(), e2.readUEG(), r3 && (e2.readUEG(), e2.readUEG()), e2.skipBits(1);
          if (i3) for (let t4 = 0; t4 < n4; t4++) e2.readUEG(), e2.readUEG(), r3 && (e2.readUEG(), e2.readUEG()), e2.skipBits(1);
        }
      }
      e2.readBoolean() && (e2.readBoolean(), e2.readBoolean(), e2.readBoolean(), w2 = e2.readUEG());
    }
    let $2 = T2, U2 = S2;
    if (L2) {
      let t3 = 1, e3 = 1;
      1 === E2 ? t3 = e3 = 2 : 2 == E2 && (t3 = 2), $2 = T2 - t3 * R2 - t3 * A2, U2 = S2 - e3 * I2 - e3 * b2;
    }
    const G2 = i2 ? ["A", "B", "C"][i2] : "", K2 = a2 << 24 | o2 << 16 | l2 << 8 | h2;
    let H2 = 0;
    for (let t3 = 0; t3 < 32; t3++) H2 = (H2 | (K2 >> t3 & 1) << 31 - t3) >>> 0;
    let V2 = H2.toString(16);
    return 1 === n2 && "2" === V2 && (V2 = "6"), { codecString: `hvc1.${G2}${n2}.${V2}.${r2 ? "H" : "L"}${p2}.B0`, params: { general_tier_flag: r2, general_profile_idc: n2, general_profile_space: i2, general_profile_compatibility_flags: [a2, o2, l2, h2], general_constraint_indicator_flags: [d2, c2, u2, f2, g2, m2], general_level_idc: p2, bit_depth: k2 + 8, bit_depth_luma_minus8: k2, bit_depth_chroma_minus8: P2, min_spatial_segmentation_idc: w2, chroma_format_idc: E2, frame_rate: { fixed: O2, fps: N2 / F2 } }, width: $2, height: U2, pixelRatio: [M2, x2] };
  }
  readPPS(t2) {
    const e2 = new ExpGolomb(this.ebsp2rbsp(t2));
    e2.readUByte(), e2.readUByte(), e2.skipUEG(), e2.skipUEG(), e2.skipBits(2), e2.skipBits(3), e2.skipBits(2), e2.skipUEG(), e2.skipUEG(), e2.skipEG(), e2.skipBits(2), e2.readBoolean() && e2.skipUEG(), e2.skipEG(), e2.skipEG(), e2.skipBits(4);
    const s2 = e2.readBoolean(), i2 = e2.readBoolean();
    let r2 = 1;
    return i2 && s2 ? r2 = 0 : i2 ? r2 = 3 : s2 && (r2 = 2), { parallelismType: r2 };
  }
  matchSPS(t2, e2) {
    return String.fromCharCode.apply(null, t2).substr(3) === String.fromCharCode.apply(null, e2).substr(3);
  }
}
const Mi = 188;
class TSDemuxer {
  constructor(t2, e2, s2, i2) {
    this.logger = void 0, this.observer = void 0, this.config = void 0, this.typeSupported = void 0, this.sampleAes = null, this.pmtParsed = false, this.audioCodec = void 0, this.videoCodec = void 0, this._pmtId = -1, this._videoTrack = void 0, this._audioTrack = void 0, this._id3Track = void 0, this._txtTrack = void 0, this.aacOverFlow = null, this.remainderData = null, this.videoParser = void 0, this.observer = t2, this.config = e2, this.typeSupported = s2, this.logger = i2, this.videoParser = null;
  }
  static probe(t2, e2) {
    const s2 = TSDemuxer.syncOffset(t2);
    return s2 > 0 && e2.warn(`MPEG2-TS detected but first sync word found @ offset ${s2}`), -1 !== s2;
  }
  static syncOffset(t2) {
    const e2 = t2.length;
    let s2 = Math.min(940, e2 - Mi) + 1, i2 = 0;
    for (; i2 < s2; ) {
      let r2 = false, n2 = -1, a2 = 0;
      for (let o2 = i2; o2 < e2; o2 += Mi) {
        if (71 !== t2[o2] || e2 - o2 !== Mi && 71 !== t2[o2 + Mi]) {
          if (a2) return -1;
          break;
        }
        if (a2++, -1 === n2 && (n2 = o2, 0 !== n2 && (s2 = Math.min(n2 + 18612, t2.length - Mi) + 1)), r2 || (r2 = 0 === xi(t2, o2)), r2 && a2 > 1 && (0 === n2 && a2 > 2 || o2 + Mi > s2)) return n2;
      }
      i2++;
    }
    return -1;
  }
  static createTrack(t2, e2) {
    return { container: "video" === t2 || "audio" === t2 ? "video/mp2t" : void 0, type: t2, id: H[t2], pid: -1, inputTimeScale: 9e4, sequenceNumber: 0, samples: [], dropped: 0, duration: "audio" === t2 ? e2 : void 0 };
  }
  resetInitSegment(t2, e2, s2, i2) {
    this.pmtParsed = false, this._pmtId = -1, this._videoTrack = TSDemuxer.createTrack("video"), this._videoTrack.duration = i2, this._audioTrack = TSDemuxer.createTrack("audio", i2), this._id3Track = TSDemuxer.createTrack("id3"), this._txtTrack = TSDemuxer.createTrack("text"), this._audioTrack.segmentCodec = "aac", this.videoParser = null, this.aacOverFlow = null, this.remainderData = null, this.audioCodec = e2, this.videoCodec = s2;
  }
  resetTimeStamp() {
  }
  resetContiguity() {
    const { _audioTrack: t2, _videoTrack: e2, _id3Track: s2 } = this;
    t2 && (t2.pesData = null), e2 && (e2.pesData = null), s2 && (s2.pesData = null), this.aacOverFlow = null, this.remainderData = null;
  }
  demux(t2, e2, s2 = false, i2 = false) {
    let r2;
    s2 || (this.sampleAes = null);
    const n2 = this._videoTrack, a2 = this._audioTrack, o2 = this._id3Track, l2 = this._txtTrack;
    let h2 = n2.pid, d2 = n2.pesData, c2 = a2.pid, u2 = o2.pid, f2 = a2.pesData, g2 = o2.pesData, m2 = null, p2 = this.pmtParsed, v2 = this._pmtId, y2 = t2.length;
    if (this.remainderData && (y2 = (t2 = nt(this.remainderData, t2)).length, this.remainderData = null), y2 < Mi && !i2) return this.remainderData = t2, { audioTrack: a2, videoTrack: n2, id3Track: o2, textTrack: l2 };
    const E2 = Math.max(0, TSDemuxer.syncOffset(t2));
    y2 -= (y2 - E2) % Mi, y2 < t2.byteLength && !i2 && (this.remainderData = new Uint8Array(t2.buffer, y2, t2.buffer.byteLength - y2));
    let T2 = 0;
    for (let e3 = E2; e3 < y2; e3 += Mi) if (71 === t2[e3]) {
      const i3 = !!(64 & t2[e3 + 1]), y3 = xi(t2, e3);
      let T3;
      if ((48 & t2[e3 + 3]) >> 4 > 1) {
        if (T3 = e3 + 5 + t2[e3 + 4], T3 === e3 + Mi) continue;
      } else T3 = e3 + 4;
      switch (y3) {
        case h2:
          i3 && (d2 && (r2 = $i(d2, this.logger)) && (this.readyVideoParser(n2.segmentCodec), null !== this.videoParser && this.videoParser.parsePES(n2, l2, r2, false)), d2 = { data: [], size: 0 }), d2 && (d2.data.push(t2.subarray(T3, e3 + Mi)), d2.size += e3 + Mi - T3);
          break;
        case c2:
          if (i3) {
            if (f2 && (r2 = $i(f2, this.logger))) switch (a2.segmentCodec) {
              case "aac":
                this.parseAACPES(a2, r2);
                break;
              case "mp3":
                this.parseMPEGPES(a2, r2);
                break;
              case "ac3":
                this.parseAC3PES(a2, r2);
            }
            f2 = { data: [], size: 0 };
          }
          f2 && (f2.data.push(t2.subarray(T3, e3 + Mi)), f2.size += e3 + Mi - T3);
          break;
        case u2:
          i3 && (g2 && (r2 = $i(g2, this.logger)) && this.parseID3PES(o2, r2), g2 = { data: [], size: 0 }), g2 && (g2.data.push(t2.subarray(T3, e3 + Mi)), g2.size += e3 + Mi - T3);
          break;
        case 0:
          i3 && (T3 += t2[T3] + 1), v2 = this._pmtId = Oi(t2, T3);
          break;
        case v2: {
          i3 && (T3 += t2[T3] + 1);
          const r3 = Fi(t2, T3, this.typeSupported, s2, this.observer, this.logger);
          h2 = r3.videoPid, h2 > 0 && (n2.pid = h2, n2.segmentCodec = r3.segmentVideoCodec), c2 = r3.audioPid, c2 > 0 && (a2.pid = c2, a2.segmentCodec = r3.segmentAudioCodec), u2 = r3.id3Pid, u2 > 0 && (o2.pid = u2), null === m2 || p2 || (this.logger.warn(`MPEG-TS PMT found at ${e3} after unknown PID '${m2}'. Backtracking to sync byte @${E2} to parse all TS packets.`), m2 = null, e3 = E2 - 188), p2 = this.pmtParsed = true;
          break;
        }
        case 17:
        case 8191:
          break;
        default:
          m2 = y3;
      }
    } else T2++;
    T2 > 0 && Ni(this.observer, new Error(`Found ${T2} TS packet/s that do not start with 0x47`), void 0, this.logger), n2.pesData = d2, a2.pesData = f2, o2.pesData = g2;
    const S2 = { audioTrack: a2, videoTrack: n2, id3Track: o2, textTrack: l2 };
    return i2 && this.extractRemainingSamples(S2), S2;
  }
  flush() {
    const { remainderData: t2 } = this;
    let e2;
    return this.remainderData = null, e2 = t2 ? this.demux(t2, -1, false, true) : { videoTrack: this._videoTrack, audioTrack: this._audioTrack, id3Track: this._id3Track, textTrack: this._txtTrack }, this.extractRemainingSamples(e2), this.sampleAes ? this.decrypt(e2, this.sampleAes) : e2;
  }
  extractRemainingSamples(t2) {
    const { audioTrack: e2, videoTrack: s2, id3Track: i2, textTrack: r2 } = t2, n2 = s2.pesData, a2 = e2.pesData, o2 = i2.pesData;
    let l2;
    if (n2 && (l2 = $i(n2, this.logger)) ? (this.readyVideoParser(s2.segmentCodec), null !== this.videoParser && (this.videoParser.parsePES(s2, r2, l2, true), s2.pesData = null)) : s2.pesData = n2, a2 && (l2 = $i(a2, this.logger))) {
      switch (e2.segmentCodec) {
        case "aac":
          this.parseAACPES(e2, l2);
          break;
        case "mp3":
          this.parseMPEGPES(e2, l2);
          break;
        case "ac3":
          this.parseAC3PES(e2, l2);
      }
      e2.pesData = null;
    } else null != a2 && a2.size && this.logger.log("last AAC PES packet truncated,might overlap between fragments"), e2.pesData = a2;
    o2 && (l2 = $i(o2, this.logger)) ? (this.parseID3PES(i2, l2), i2.pesData = null) : i2.pesData = o2;
  }
  demuxSampleAes(t2, e2, s2) {
    const i2 = this.demux(t2, s2, true, !this.config.progressive), r2 = this.sampleAes = new SampleAesDecrypter(this.observer, this.config, e2);
    return this.decrypt(i2, r2);
  }
  readyVideoParser(t2) {
    null === this.videoParser && ("avc" === t2 ? this.videoParser = new AvcVideoParser() : "hevc" === t2 && (this.videoParser = new HevcVideoParser()));
  }
  decrypt(t2, e2) {
    return new Promise((s2) => {
      const { audioTrack: i2, videoTrack: r2 } = t2;
      i2.samples && "aac" === i2.segmentCodec ? e2.decryptAacSamples(i2.samples, 0, () => {
        r2.samples ? e2.decryptAvcSamples(r2.samples, 0, 0, () => {
          s2(t2);
        }) : s2(t2);
      }) : r2.samples && e2.decryptAvcSamples(r2.samples, 0, 0, () => {
        s2(t2);
      });
    });
  }
  destroy() {
    this.observer && this.observer.removeAllListeners(), this.config = this.logger = this.observer = null, this.aacOverFlow = this.videoParser = this.remainderData = this.sampleAes = null, this._videoTrack = this._audioTrack = this._id3Track = this._txtTrack = void 0;
  }
  parseAACPES(t2, e2) {
    let s2 = 0;
    const i2 = this.aacOverFlow;
    let r2, n2, a2, o2 = e2.data;
    if (i2) {
      this.aacOverFlow = null;
      const e3 = i2.missing, r3 = i2.sample.unit.byteLength;
      if (-1 === e3) o2 = nt(i2.sample.unit, o2);
      else {
        const n3 = r3 - e3;
        i2.sample.unit.set(o2.subarray(0, e3), n3), t2.samples.push(i2.sample), s2 = i2.missing;
      }
    }
    for (r2 = s2, n2 = o2.length; r2 < n2 - 1 && !ii(o2, r2); r2++) ;
    if (r2 !== s2) {
      let t3;
      const e3 = r2 < n2 - 1;
      if (t3 = e3 ? `AAC PES did not start with ADTS header,offset:${r2}` : "No ADTS header found in AAC PES", Ni(this.observer, new Error(t3), e3, this.logger), !e3) return;
    }
    if (ni(t2, this.observer, o2, r2, this.audioCodec), void 0 !== e2.pts) a2 = e2.pts;
    else {
      if (!i2) return void this.logger.warn("[tsdemuxer]: AAC PES unknown PTS");
      {
        const e3 = ai(t2.samplerate);
        a2 = i2.sample.pts + e3;
      }
    }
    let l2, h2 = 0;
    for (; r2 < n2; ) {
      if (l2 = oi(t2, o2, r2, a2, h2), r2 += l2.length, l2.missing) {
        this.aacOverFlow = l2;
        break;
      }
      for (h2++; r2 < n2 - 1 && !ii(o2, r2); r2++) ;
    }
  }
  parseMPEGPES(t2, e2) {
    const s2 = e2.data, i2 = s2.length;
    let r2 = 0, n2 = 0;
    const a2 = e2.pts;
    if (void 0 !== a2) for (; n2 < i2; ) if (ki(s2, n2)) {
      const e3 = Ri(t2, s2, n2, a2, r2);
      if (!e3) break;
      n2 += e3.length, r2++;
    } else n2++;
    else this.logger.warn("[tsdemuxer]: MPEG PES unknown PTS");
  }
  parseAC3PES(t2, e2) {
    {
      const s2 = e2.data, i2 = e2.pts;
      if (void 0 === i2) return void this.logger.warn("[tsdemuxer]: AC3 PES unknown PTS");
      const r2 = s2.length;
      let n2, a2 = 0, o2 = 0;
      for (; o2 < r2 && (n2 = _i(t2, s2, o2, i2, a2++)) > 0; ) o2 += n2;
    }
  }
  parseID3PES(t2, e2) {
    if (void 0 === e2.pts) return void this.logger.warn("[tsdemuxer]: ID3 PES unknown PTS");
    const s2 = y({}, e2, { type: this._videoTrack ? pi.emsg : pi.audioId3, duration: Number.POSITIVE_INFINITY });
    t2.samples.push(s2);
  }
}
function xi(t2, e2) {
  return ((31 & t2[e2 + 1]) << 8) + t2[e2 + 2];
}
function Oi(t2, e2) {
  return (31 & t2[e2 + 10]) << 8 | t2[e2 + 11];
}
function Fi(t2, e2, s2, i2, r2, n2) {
  const a2 = { audioPid: -1, videoPid: -1, id3Pid: -1, segmentVideoCodec: "avc", segmentAudioCodec: "aac" }, o2 = e2 + 3 + ((15 & t2[e2 + 1]) << 8 | t2[e2 + 2]) - 4;
  for (e2 += 12 + ((15 & t2[e2 + 10]) << 8 | t2[e2 + 11]); e2 < o2; ) {
    const o3 = xi(t2, e2), l2 = (15 & t2[e2 + 3]) << 8 | t2[e2 + 4];
    switch (t2[e2]) {
      case 207:
        if (!i2) {
          Bi("ADTS AAC", n2);
          break;
        }
      case 15:
        -1 === a2.audioPid && (a2.audioPid = o3);
        break;
      case 21:
        -1 === a2.id3Pid && (a2.id3Pid = o3);
        break;
      case 219:
        if (!i2) {
          Bi("H.264", n2);
          break;
        }
      case 27:
        -1 === a2.videoPid && (a2.videoPid = o3);
        break;
      case 3:
      case 4:
        s2.mpeg || s2.mp3 ? -1 === a2.audioPid && (a2.audioPid = o3, a2.segmentAudioCodec = "mp3") : n2.log("MPEG audio found, not supported in this browser");
        break;
      case 193:
        if (!i2) {
          Bi("AC-3", n2);
          break;
        }
      case 129:
        s2.ac3 ? -1 === a2.audioPid && (a2.audioPid = o3, a2.segmentAudioCodec = "ac3") : n2.log("AC-3 audio found, not supported in this browser");
        break;
      case 6:
        if (-1 === a2.audioPid && l2 > 0) {
          let i3 = e2 + 5, r3 = l2;
          for (; r3 > 2; ) {
            106 === t2[i3] && (true !== s2.ac3 ? n2.log("AC-3 audio found, not supported in this browser for now") : (a2.audioPid = o3, a2.segmentAudioCodec = "ac3"));
            const e3 = t2[i3 + 1] + 2;
            i3 += e3, r3 -= e3;
          }
        }
        break;
      case 194:
      case 135:
        return Ni(r2, new Error("Unsupported EC-3 in M2TS found"), void 0, n2), a2;
      case 36:
        -1 === a2.videoPid && (a2.videoPid = o3, a2.segmentVideoCodec = "hevc", n2.log("HEVC in M2TS found"));
    }
    e2 += l2 + 5;
  }
  return a2;
}
function Ni(t2, e2, s2, i2) {
  i2.warn(`parsing error: ${e2.message}`), t2.emit(h.ERROR, h.ERROR, { type: o.MEDIA_ERROR, details: l.FRAG_PARSING_ERROR, fatal: false, levelRetry: s2, error: e2, reason: e2.message });
}
function Bi(t2, e2) {
  e2.log(`${t2} with AES-128-CBC encryption found in unencrypted stream`);
}
function $i(t2, e2) {
  let s2, i2, r2, n2, a2, o2 = 0;
  const l2 = t2.data;
  if (!t2 || 0 === t2.size) return null;
  for (; l2[0].length < 19 && l2.length > 1; ) l2[0] = nt(l2[0], l2[1]), l2.splice(1, 1);
  if (s2 = l2[0], 1 === (s2[0] << 16) + (s2[1] << 8) + s2[2]) {
    if (i2 = (s2[4] << 8) + s2[5], i2 && i2 > t2.size - 6) return null;
    const h2 = s2[7];
    192 & h2 && (n2 = 536870912 * (14 & s2[9]) + 4194304 * (255 & s2[10]) + 16384 * (254 & s2[11]) + 128 * (255 & s2[12]) + (254 & s2[13]) / 2, 64 & h2 ? (a2 = 536870912 * (14 & s2[14]) + 4194304 * (255 & s2[15]) + 16384 * (254 & s2[16]) + 128 * (255 & s2[17]) + (254 & s2[18]) / 2, n2 - a2 > 54e5 && (e2.warn(`${Math.round((n2 - a2) / 9e4)}s delta between PTS and DTS, align them`), n2 = a2)) : a2 = n2), r2 = s2[8];
    let d2 = r2 + 9;
    if (t2.size <= d2) return null;
    t2.size -= d2;
    const c2 = new Uint8Array(t2.size);
    for (let t3 = 0, e3 = l2.length; t3 < e3; t3++) {
      s2 = l2[t3];
      let e4 = s2.byteLength;
      if (d2) {
        if (d2 > e4) {
          d2 -= e4;
          continue;
        }
        s2 = s2.subarray(d2), e4 -= d2, d2 = 0;
      }
      c2.set(s2, o2), o2 += e4;
    }
    return i2 && (i2 -= r2 + 3), { data: c2, pts: n2, dts: a2, len: i2 };
  }
  return null;
}
class AAC {
  static getSilentFrame(t2, e2) {
    if ("mp4a.40.2" === t2) {
      if (1 === e2) return new Uint8Array([0, 200, 0, 128, 35, 128]);
      if (2 === e2) return new Uint8Array([33, 0, 73, 144, 2, 25, 0, 35, 128]);
      if (3 === e2) return new Uint8Array([0, 200, 0, 128, 32, 132, 1, 38, 64, 8, 100, 0, 142]);
      if (4 === e2) return new Uint8Array([0, 200, 0, 128, 32, 132, 1, 38, 64, 8, 100, 0, 128, 44, 128, 8, 2, 56]);
      if (5 === e2) return new Uint8Array([0, 200, 0, 128, 32, 132, 1, 38, 64, 8, 100, 0, 130, 48, 4, 153, 0, 33, 144, 2, 56]);
      if (6 === e2) return new Uint8Array([0, 200, 0, 128, 32, 132, 1, 38, 64, 8, 100, 0, 130, 48, 4, 153, 0, 33, 144, 2, 0, 178, 0, 32, 8, 224]);
    } else {
      if (1 === e2) return new Uint8Array([1, 64, 34, 128, 163, 78, 230, 128, 186, 8, 0, 0, 0, 28, 6, 241, 193, 10, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 94]);
      if (2 === e2) return new Uint8Array([1, 64, 34, 128, 163, 94, 230, 128, 186, 8, 0, 0, 0, 0, 149, 0, 6, 241, 161, 10, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 94]);
      if (3 === e2) return new Uint8Array([1, 64, 34, 128, 163, 94, 230, 128, 186, 8, 0, 0, 0, 0, 149, 0, 6, 241, 161, 10, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 94]);
    }
  }
}
const Ui = Math.pow(2, 32) - 1;
class MP4 {
  static init() {
    let t2;
    for (t2 in MP4.types = { avc1: [], avcC: [], hvc1: [], hvcC: [], btrt: [], dinf: [], dref: [], esds: [], ftyp: [], hdlr: [], mdat: [], mdhd: [], mdia: [], mfhd: [], minf: [], moof: [], moov: [], mp4a: [], ".mp3": [], dac3: [], "ac-3": [], mvex: [], mvhd: [], pasp: [], sdtp: [], stbl: [], stco: [], stsc: [], stsd: [], stsz: [], stts: [], tfdt: [], tfhd: [], traf: [], trak: [], trun: [], trex: [], tkhd: [], vmhd: [], smhd: [] }, MP4.types) MP4.types.hasOwnProperty(t2) && (MP4.types[t2] = [t2.charCodeAt(0), t2.charCodeAt(1), t2.charCodeAt(2), t2.charCodeAt(3)]);
    const e2 = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 118, 105, 100, 101, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 86, 105, 100, 101, 111, 72, 97, 110, 100, 108, 101, 114, 0]), s2 = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 115, 111, 117, 110, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 83, 111, 117, 110, 100, 72, 97, 110, 100, 108, 101, 114, 0]);
    MP4.HDLR_TYPES = { video: e2, audio: s2 };
    const i2 = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 12, 117, 114, 108, 32, 0, 0, 0, 1]), r2 = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]);
    MP4.STTS = MP4.STSC = MP4.STCO = r2, MP4.STSZ = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), MP4.VMHD = new Uint8Array([0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0]), MP4.SMHD = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]), MP4.STSD = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1]);
    const n2 = new Uint8Array([105, 115, 111, 109]), a2 = new Uint8Array([97, 118, 99, 49]), o2 = new Uint8Array([0, 0, 0, 1]);
    MP4.FTYP = MP4.box(MP4.types.ftyp, n2, o2, n2, a2), MP4.DINF = MP4.box(MP4.types.dinf, MP4.box(MP4.types.dref, i2));
  }
  static box(t2, ...e2) {
    let s2 = 8, i2 = e2.length;
    const r2 = i2;
    for (; i2--; ) s2 += e2[i2].byteLength;
    const n2 = new Uint8Array(s2);
    for (n2[0] = s2 >> 24 & 255, n2[1] = s2 >> 16 & 255, n2[2] = s2 >> 8 & 255, n2[3] = 255 & s2, n2.set(t2, 4), i2 = 0, s2 = 8; i2 < r2; i2++) n2.set(e2[i2], s2), s2 += e2[i2].byteLength;
    return n2;
  }
  static hdlr(t2) {
    return MP4.box(MP4.types.hdlr, MP4.HDLR_TYPES[t2]);
  }
  static mdat(t2) {
    return MP4.box(MP4.types.mdat, t2);
  }
  static mdhd(t2, e2) {
    e2 *= t2;
    const s2 = Math.floor(e2 / (Ui + 1)), i2 = Math.floor(e2 % (Ui + 1));
    return MP4.box(MP4.types.mdhd, new Uint8Array([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 3, t2 >> 24 & 255, t2 >> 16 & 255, t2 >> 8 & 255, 255 & t2, s2 >> 24, s2 >> 16 & 255, s2 >> 8 & 255, 255 & s2, i2 >> 24, i2 >> 16 & 255, i2 >> 8 & 255, 255 & i2, 85, 196, 0, 0]));
  }
  static mdia(t2) {
    return MP4.box(MP4.types.mdia, MP4.mdhd(t2.timescale || 0, t2.duration || 0), MP4.hdlr(t2.type), MP4.minf(t2));
  }
  static mfhd(t2) {
    return MP4.box(MP4.types.mfhd, new Uint8Array([0, 0, 0, 0, t2 >> 24, t2 >> 16 & 255, t2 >> 8 & 255, 255 & t2]));
  }
  static minf(t2) {
    return "audio" === t2.type ? MP4.box(MP4.types.minf, MP4.box(MP4.types.smhd, MP4.SMHD), MP4.DINF, MP4.stbl(t2)) : MP4.box(MP4.types.minf, MP4.box(MP4.types.vmhd, MP4.VMHD), MP4.DINF, MP4.stbl(t2));
  }
  static moof(t2, e2, s2) {
    return MP4.box(MP4.types.moof, MP4.mfhd(t2), MP4.traf(s2, e2));
  }
  static moov(t2) {
    let e2 = t2.length;
    const s2 = [];
    for (; e2--; ) s2[e2] = MP4.trak(t2[e2]);
    return MP4.box.apply(null, [MP4.types.moov, MP4.mvhd(t2[0].timescale || 0, t2[0].duration || 0)].concat(s2).concat(MP4.mvex(t2)));
  }
  static mvex(t2) {
    let e2 = t2.length;
    const s2 = [];
    for (; e2--; ) s2[e2] = MP4.trex(t2[e2]);
    return MP4.box.apply(null, [MP4.types.mvex, ...s2]);
  }
  static mvhd(t2, e2) {
    e2 *= t2;
    const s2 = Math.floor(e2 / (Ui + 1)), i2 = Math.floor(e2 % (Ui + 1)), r2 = new Uint8Array([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 3, t2 >> 24 & 255, t2 >> 16 & 255, t2 >> 8 & 255, 255 & t2, s2 >> 24, s2 >> 16 & 255, s2 >> 8 & 255, 255 & s2, i2 >> 24, i2 >> 16 & 255, i2 >> 8 & 255, 255 & i2, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255]);
    return MP4.box(MP4.types.mvhd, r2);
  }
  static sdtp(t2) {
    const e2 = t2.samples || [], s2 = new Uint8Array(4 + e2.length);
    let i2, r2;
    for (i2 = 0; i2 < e2.length; i2++) r2 = e2[i2].flags, s2[i2 + 4] = r2.dependsOn << 4 | r2.isDependedOn << 2 | r2.hasRedundancy;
    return MP4.box(MP4.types.sdtp, s2);
  }
  static stbl(t2) {
    return MP4.box(MP4.types.stbl, MP4.stsd(t2), MP4.box(MP4.types.stts, MP4.STTS), MP4.box(MP4.types.stsc, MP4.STSC), MP4.box(MP4.types.stsz, MP4.STSZ), MP4.box(MP4.types.stco, MP4.STCO));
  }
  static avc1(t2) {
    let e2, s2, i2, r2 = [], n2 = [];
    for (e2 = 0; e2 < t2.sps.length; e2++) s2 = t2.sps[e2], i2 = s2.byteLength, r2.push(i2 >>> 8 & 255), r2.push(255 & i2), r2 = r2.concat(Array.prototype.slice.call(s2));
    for (e2 = 0; e2 < t2.pps.length; e2++) s2 = t2.pps[e2], i2 = s2.byteLength, n2.push(i2 >>> 8 & 255), n2.push(255 & i2), n2 = n2.concat(Array.prototype.slice.call(s2));
    const a2 = MP4.box(MP4.types.avcC, new Uint8Array([1, r2[3], r2[4], r2[5], 255, 224 | t2.sps.length].concat(r2).concat([t2.pps.length]).concat(n2))), o2 = t2.width, l2 = t2.height, h2 = t2.pixelRatio[0], d2 = t2.pixelRatio[1];
    return MP4.box(MP4.types.avc1, new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, o2 >> 8 & 255, 255 & o2, l2 >> 8 & 255, 255 & l2, 0, 72, 0, 0, 0, 72, 0, 0, 0, 0, 0, 0, 0, 1, 18, 100, 97, 105, 108, 121, 109, 111, 116, 105, 111, 110, 47, 104, 108, 115, 46, 106, 115, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 17, 17]), a2, MP4.box(MP4.types.btrt, new Uint8Array([0, 28, 156, 128, 0, 45, 198, 192, 0, 45, 198, 192])), MP4.box(MP4.types.pasp, new Uint8Array([h2 >> 24, h2 >> 16 & 255, h2 >> 8 & 255, 255 & h2, d2 >> 24, d2 >> 16 & 255, d2 >> 8 & 255, 255 & d2])));
  }
  static esds(t2) {
    const e2 = t2.config;
    return new Uint8Array([0, 0, 0, 0, 3, 25, 0, 1, 0, 4, 17, 64, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 2, ...e2, 6, 1, 2]);
  }
  static audioStsd(t2) {
    const e2 = t2.samplerate || 0;
    return new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, t2.channelCount || 0, 0, 16, 0, 0, 0, 0, e2 >> 8 & 255, 255 & e2, 0, 0]);
  }
  static mp4a(t2) {
    return MP4.box(MP4.types.mp4a, MP4.audioStsd(t2), MP4.box(MP4.types.esds, MP4.esds(t2)));
  }
  static mp3(t2) {
    return MP4.box(MP4.types[".mp3"], MP4.audioStsd(t2));
  }
  static ac3(t2) {
    return MP4.box(MP4.types["ac-3"], MP4.audioStsd(t2), MP4.box(MP4.types.dac3, t2.config));
  }
  static stsd(t2) {
    const { segmentCodec: e2 } = t2;
    if ("audio" === t2.type) {
      if ("aac" === e2) return MP4.box(MP4.types.stsd, MP4.STSD, MP4.mp4a(t2));
      if ("ac3" === e2 && t2.config) return MP4.box(MP4.types.stsd, MP4.STSD, MP4.ac3(t2));
      if ("mp3" === e2 && "mp3" === t2.codec) return MP4.box(MP4.types.stsd, MP4.STSD, MP4.mp3(t2));
    } else {
      if (!t2.pps || !t2.sps) throw new Error("video track missing pps or sps");
      if ("avc" === e2) return MP4.box(MP4.types.stsd, MP4.STSD, MP4.avc1(t2));
      if ("hevc" === e2 && t2.vps) return MP4.box(MP4.types.stsd, MP4.STSD, MP4.hvc1(t2));
    }
    throw new Error(`unsupported ${t2.type} segment codec (${e2}/${t2.codec})`);
  }
  static tkhd(t2) {
    const e2 = t2.id, s2 = (t2.duration || 0) * (t2.timescale || 0), i2 = t2.width || 0, r2 = t2.height || 0, n2 = Math.floor(s2 / (Ui + 1)), a2 = Math.floor(s2 % (Ui + 1));
    return MP4.box(MP4.types.tkhd, new Uint8Array([1, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 3, e2 >> 24 & 255, e2 >> 16 & 255, e2 >> 8 & 255, 255 & e2, 0, 0, 0, 0, n2 >> 24, n2 >> 16 & 255, n2 >> 8 & 255, 255 & n2, a2 >> 24, a2 >> 16 & 255, a2 >> 8 & 255, 255 & a2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, i2 >> 8 & 255, 255 & i2, 0, 0, r2 >> 8 & 255, 255 & r2, 0, 0]));
  }
  static traf(t2, e2) {
    const s2 = MP4.sdtp(t2), i2 = t2.id, r2 = Math.floor(e2 / (Ui + 1)), n2 = Math.floor(e2 % (Ui + 1));
    return MP4.box(MP4.types.traf, MP4.box(MP4.types.tfhd, new Uint8Array([0, 0, 0, 0, i2 >> 24, i2 >> 16 & 255, i2 >> 8 & 255, 255 & i2])), MP4.box(MP4.types.tfdt, new Uint8Array([1, 0, 0, 0, r2 >> 24, r2 >> 16 & 255, r2 >> 8 & 255, 255 & r2, n2 >> 24, n2 >> 16 & 255, n2 >> 8 & 255, 255 & n2])), MP4.trun(t2, s2.length + 16 + 20 + 8 + 16 + 8 + 8), s2);
  }
  static trak(t2) {
    return t2.duration = t2.duration || 4294967295, MP4.box(MP4.types.trak, MP4.tkhd(t2), MP4.mdia(t2));
  }
  static trex(t2) {
    const e2 = t2.id;
    return MP4.box(MP4.types.trex, new Uint8Array([0, 0, 0, 0, e2 >> 24, e2 >> 16 & 255, e2 >> 8 & 255, 255 & e2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1]));
  }
  static trun(t2, e2) {
    const s2 = t2.samples || [], i2 = s2.length, r2 = 12 + 16 * i2, n2 = new Uint8Array(r2);
    let a2, o2, l2, h2, d2, c2;
    for (e2 += 8 + r2, n2.set(["video" === t2.type ? 1 : 0, 0, 15, 1, i2 >>> 24 & 255, i2 >>> 16 & 255, i2 >>> 8 & 255, 255 & i2, e2 >>> 24 & 255, e2 >>> 16 & 255, e2 >>> 8 & 255, 255 & e2], 0), a2 = 0; a2 < i2; a2++) o2 = s2[a2], l2 = o2.duration, h2 = o2.size, d2 = o2.flags, c2 = o2.cts, n2.set([l2 >>> 24 & 255, l2 >>> 16 & 255, l2 >>> 8 & 255, 255 & l2, h2 >>> 24 & 255, h2 >>> 16 & 255, h2 >>> 8 & 255, 255 & h2, d2.isLeading << 2 | d2.dependsOn, d2.isDependedOn << 6 | d2.hasRedundancy << 4 | d2.paddingValue << 1 | d2.isNonSync, 61440 & d2.degradPrio, 15 & d2.degradPrio, c2 >>> 24 & 255, c2 >>> 16 & 255, c2 >>> 8 & 255, 255 & c2], 12 + 16 * a2);
    return MP4.box(MP4.types.trun, n2);
  }
  static initSegment(t2) {
    MP4.types || MP4.init();
    const e2 = MP4.moov(t2);
    return nt(MP4.FTYP, e2);
  }
  static hvc1(t2) {
    const e2 = t2.params, s2 = [t2.vps, t2.sps, t2.pps], i2 = new Uint8Array([1, e2.general_profile_space << 6 | (e2.general_tier_flag ? 32 : 0) | e2.general_profile_idc, e2.general_profile_compatibility_flags[0], e2.general_profile_compatibility_flags[1], e2.general_profile_compatibility_flags[2], e2.general_profile_compatibility_flags[3], e2.general_constraint_indicator_flags[0], e2.general_constraint_indicator_flags[1], e2.general_constraint_indicator_flags[2], e2.general_constraint_indicator_flags[3], e2.general_constraint_indicator_flags[4], e2.general_constraint_indicator_flags[5], e2.general_level_idc, 240 | e2.min_spatial_segmentation_idc >> 8, 255 & e2.min_spatial_segmentation_idc, 252 | e2.parallelismType, 252 | e2.chroma_format_idc, 248 | e2.bit_depth_luma_minus8, 248 | e2.bit_depth_chroma_minus8, 0, parseInt(e2.frame_rate.fps), 3 | e2.temporal_id_nested << 2 | e2.num_temporal_layers << 3 | (e2.frame_rate.fixed ? 64 : 0), s2.length]);
    let r2 = i2.length;
    for (let t3 = 0; t3 < s2.length; t3 += 1) {
      r2 += 3;
      for (let e3 = 0; e3 < s2[t3].length; e3 += 1) r2 += 2 + s2[t3][e3].length;
    }
    const n2 = new Uint8Array(r2);
    n2.set(i2, 0), r2 = i2.length;
    const a2 = s2.length - 1;
    for (let t3 = 0; t3 < s2.length; t3 += 1) {
      n2.set(new Uint8Array([32 + t3 | (t3 === a2 ? 128 : 0), 0, s2[t3].length]), r2), r2 += 3;
      for (let e3 = 0; e3 < s2[t3].length; e3 += 1) n2.set(new Uint8Array([s2[t3][e3].length >> 8, 255 & s2[t3][e3].length]), r2), r2 += 2, n2.set(s2[t3][e3], r2), r2 += s2[t3][e3].length;
    }
    const o2 = MP4.box(MP4.types.hvcC, n2), l2 = t2.width, h2 = t2.height, d2 = t2.pixelRatio[0], c2 = t2.pixelRatio[1];
    return MP4.box(MP4.types.hvc1, new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, l2 >> 8 & 255, 255 & l2, h2 >> 8 & 255, 255 & h2, 0, 72, 0, 0, 0, 72, 0, 0, 0, 0, 0, 0, 0, 1, 18, 100, 97, 105, 108, 121, 109, 111, 116, 105, 111, 110, 47, 104, 108, 115, 46, 106, 115, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 17, 17]), o2, MP4.box(MP4.types.btrt, new Uint8Array([0, 28, 156, 128, 0, 45, 198, 192, 0, 45, 198, 192])), MP4.box(MP4.types.pasp, new Uint8Array([d2 >> 24, d2 >> 16 & 255, d2 >> 8 & 255, 255 & d2, c2 >> 24, c2 >> 16 & 255, c2 >> 8 & 255, 255 & c2])));
  }
}
function Gi(t2, e2, s2 = 1, i2 = false) {
  const r2 = t2 * e2 * s2;
  return i2 ? Math.round(r2) : r2;
}
function Ki(t2, e2 = false) {
  return Gi(t2, 1e3, 1 / 9e4, e2);
}
function Hi(t2) {
  const { baseTime: e2, timescale: s2, trackId: i2 } = t2;
  return `${e2 / s2} (${e2}/${s2}) trackId: ${i2}`;
}
MP4.types = void 0, MP4.HDLR_TYPES = void 0, MP4.STTS = void 0, MP4.STSC = void 0, MP4.STCO = void 0, MP4.STSZ = void 0, MP4.VMHD = void 0, MP4.SMHD = void 0, MP4.STSD = void 0, MP4.FTYP = void 0, MP4.DINF = void 0;
let Vi, Yi = null, Wi = null;
function ji(t2, e2, s2, i2) {
  return { duration: e2, size: s2, cts: i2, flags: { isLeading: 0, isDependedOn: 0, hasRedundancy: 0, degradPrio: 0, dependsOn: t2 ? 2 : 1, isNonSync: t2 ? 0 : 1 } };
}
class MP4Remuxer extends Logger {
  constructor(t2, e2, s2, i2) {
    if (super("mp4-remuxer", i2), this.observer = void 0, this.config = void 0, this.typeSupported = void 0, this.ISGenerated = false, this._initPTS = null, this._initDTS = null, this.nextVideoTs = null, this.nextAudioTs = null, this.videoSampleDuration = null, this.isAudioContiguous = false, this.isVideoContiguous = false, this.videoTrackConfig = void 0, this.observer = t2, this.config = e2, this.typeSupported = s2, this.ISGenerated = false, null === Yi) {
      const t3 = (navigator.userAgent || "").match(/Chrome\/(\d+)/i);
      Yi = t3 ? parseInt(t3[1]) : 0;
    }
    if (null === Wi) {
      const t3 = navigator.userAgent.match(/Safari\/(\d+)/i);
      Wi = t3 ? parseInt(t3[1]) : 0;
    }
  }
  destroy() {
    this.config = this.videoTrackConfig = this._initPTS = this._initDTS = null;
  }
  resetTimeStamp(t2) {
    const e2 = this._initPTS;
    e2 && t2 && t2.trackId === e2.trackId && t2.baseTime === e2.baseTime && t2.timescale === e2.timescale || this.log(`Reset initPTS: ${e2 ? Hi(e2) : e2} > ${t2 ? Hi(t2) : t2}`), this._initPTS = this._initDTS = t2;
  }
  resetNextTimestamp() {
    this.log("reset next timestamp"), this.isVideoContiguous = false, this.isAudioContiguous = false;
  }
  resetInitSegment() {
    this.log("ISGenerated flag reset"), this.ISGenerated = false, this.videoTrackConfig = void 0;
  }
  getVideoStartPts(t2) {
    let e2 = false;
    const s2 = t2[0].pts, i2 = t2.reduce((t3, i3) => {
      let r2 = i3.pts, n2 = r2 - t3;
      return n2 < -4294967296 && (e2 = true, r2 = qi(r2, s2), n2 = r2 - t3), n2 > 0 ? t3 : r2;
    }, s2);
    return e2 && this.debug("PTS rollover detected"), i2;
  }
  remux(t2, e2, s2, i2, r2, n2, a2, o2) {
    let l2, h2, d2, c2, u2, f2, g2 = r2, p2 = r2;
    const v2 = t2.pid > -1, y2 = e2.pid > -1, E2 = e2.samples.length, T2 = t2.samples.length > 0, S2 = a2 && E2 > 0 || E2 > 1;
    if ((!v2 || T2) && (!y2 || S2) || this.ISGenerated || a2) {
      if (this.ISGenerated) {
        var L2, A2, R2, b2;
        const t3 = this.videoTrackConfig;
        (t3 && (e2.width !== t3.width || e2.height !== t3.height || (null == (L2 = e2.pixelRatio) ? void 0 : L2[0]) !== (null == (A2 = t3.pixelRatio) ? void 0 : A2[0]) || (null == (R2 = e2.pixelRatio) ? void 0 : R2[1]) !== (null == (b2 = t3.pixelRatio) ? void 0 : b2[1])) || !t3 && S2 || null === this.nextAudioTs && T2) && this.resetInitSegment();
      }
      this.ISGenerated || (d2 = this.generateIS(t2, e2, r2, n2));
      const s3 = this.isVideoContiguous;
      let i3, a3 = -1;
      if (S2 && (a3 = function(t3) {
        for (let e3 = 0; e3 < t3.length; e3++) if (t3[e3].key) return e3;
        return -1;
      }(e2.samples), !s3 && this.config.forceKeyFrameOnDiscontinuity)) if (f2 = true, a3 > 0) {
        this.warn(`Dropped ${a3} out of ${E2} video samples due to a missing keyframe`);
        const t3 = this.getVideoStartPts(e2.samples);
        e2.samples = e2.samples.slice(a3), e2.dropped += a3, p2 += (e2.samples[0].pts - t3) / e2.inputTimeScale, i3 = p2;
      } else -1 === a3 && (this.warn(`No keyframe found out of ${E2} video samples`), f2 = false);
      if (this.ISGenerated) {
        if (T2 && S2) {
          const s4 = this.getVideoStartPts(e2.samples), i4 = (qi(t2.samples[0].pts, s4) - s4) / e2.inputTimeScale;
          g2 += Math.max(0, i4), p2 += Math.max(0, -i4);
        }
        if (T2) {
          if (t2.samplerate || (this.warn("regenerate InitSegment as audio detected"), d2 = this.generateIS(t2, e2, r2, n2)), h2 = this.remuxAudio(t2, g2, this.isAudioContiguous, n2, y2 || S2 || o2 === m ? p2 : void 0), S2) {
            const i4 = h2 ? h2.endPTS - h2.startPTS : 0;
            e2.inputTimeScale || (this.warn("regenerate InitSegment as video detected"), d2 = this.generateIS(t2, e2, r2, n2)), l2 = this.remuxVideo(e2, p2, s3, i4);
          }
        } else S2 && (l2 = this.remuxVideo(e2, p2, s3, 0));
        l2 && (l2.firstKeyFrame = a3, l2.independent = -1 !== a3, l2.firstKeyFramePTS = i3);
      }
    }
    return this.ISGenerated && this._initPTS && this._initDTS && (s2.samples.length && (u2 = Xi(s2, r2, this._initPTS, this._initDTS)), i2.samples.length && (c2 = zi(i2, r2, this._initPTS))), { audio: h2, video: l2, initSegment: d2, independent: f2, text: c2, id3: u2 };
  }
  computeInitPts(t2, e2, s2, i2) {
    const r2 = Math.round(s2 * e2);
    let n2 = qi(t2, r2);
    if (n2 < r2 + e2) for (this.log(`Adjusting PTS for rollover in timeline near ${(r2 - n2) / e2} ${i2}`); n2 < r2 + e2; ) n2 += 8589934592;
    return n2 - r2;
  }
  generateIS(t2, e2, s2, i2) {
    const r2 = t2.samples, n2 = e2.samples, a2 = this.typeSupported, o2 = {}, l2 = this._initPTS;
    let h2, d2, c2, u2 = !l2 || i2, f2 = "audio/mp4", g2 = -1;
    if (u2 && (h2 = d2 = 1 / 0), t2.config && r2.length) {
      switch (t2.timescale = t2.samplerate, t2.segmentCodec) {
        case "mp3":
          a2.mpeg ? (f2 = "audio/mpeg", t2.codec = "") : a2.mp3 && (t2.codec = "mp3");
          break;
        case "ac3":
          t2.codec = "ac-3";
      }
      o2.audio = { id: "audio", container: f2, codec: t2.codec, initSegment: "mp3" === t2.segmentCodec && a2.mpeg ? new Uint8Array(0) : MP4.initSegment([t2]), metadata: { channelCount: t2.channelCount } }, u2 && (g2 = t2.id, c2 = t2.inputTimeScale, l2 && c2 === l2.timescale ? u2 = false : h2 = d2 = this.computeInitPts(r2[0].pts, c2, s2, "audio"));
    }
    if (e2.sps && e2.pps && n2.length) {
      if (e2.timescale = e2.inputTimeScale, o2.video = { id: "main", container: "video/mp4", codec: e2.codec, initSegment: MP4.initSegment([e2]), metadata: { width: e2.width, height: e2.height } }, u2) if (g2 = e2.id, c2 = e2.inputTimeScale, l2 && c2 === l2.timescale) u2 = false;
      else {
        const t3 = this.getVideoStartPts(n2), e3 = qi(n2[0].dts, t3), i3 = this.computeInitPts(e3, c2, s2, "video"), r3 = this.computeInitPts(t3, c2, s2, "video");
        d2 = Math.min(d2, i3), h2 = Math.min(h2, r3);
      }
      this.videoTrackConfig = { width: e2.width, height: e2.height, pixelRatio: e2.pixelRatio };
    }
    if (Object.keys(o2).length) return this.ISGenerated = true, u2 ? (l2 && this.warn(`Timestamps at playlist time: ${i2 ? "" : "~"}${s2} ${h2 / c2} != initPTS: ${l2.baseTime / l2.timescale} (${l2.baseTime}/${l2.timescale}) trackId: ${l2.trackId}`), this.log(`Found initPTS at playlist time: ${s2} offset: ${h2 / c2} (${h2}/${c2}) trackId: ${g2}`), this._initPTS = { baseTime: h2, timescale: c2, trackId: g2 }, this._initDTS = { baseTime: d2, timescale: c2, trackId: g2 }) : h2 = c2 = void 0, { tracks: o2, initPTS: h2, timescale: c2, trackId: g2 };
  }
  remuxVideo(t2, e2, s2, i2) {
    const r2 = t2.inputTimeScale, n2 = t2.samples, a2 = [], d2 = n2.length, c2 = this._initPTS, u2 = c2.baseTime * r2 / c2.timescale;
    let f2, g2, m2 = this.nextVideoTs, p2 = 8, v2 = this.videoSampleDuration, E2 = Number.POSITIVE_INFINITY, T2 = Number.NEGATIVE_INFINITY, S2 = false;
    if (!s2 || null === m2) {
      const t3 = u2 + e2 * r2, i3 = n2[0].pts - qi(n2[0].dts, n2[0].pts);
      Yi && null !== m2 && Math.abs(t3 - i3 - (m2 + u2)) < 15e3 ? s2 = true : m2 = t3 - i3 - u2;
    }
    const L2 = m2 + u2;
    for (let t3 = 0; t3 < d2; t3++) {
      const e3 = n2[t3];
      e3.pts = qi(e3.pts, L2), e3.dts = qi(e3.dts, L2), e3.dts < n2[t3 > 0 ? t3 - 1 : t3].dts && (S2 = true);
    }
    S2 && n2.sort(function(t3, e3) {
      const s3 = t3.dts - e3.dts, i3 = t3.pts - e3.pts;
      return s3 || i3;
    }), f2 = n2[0].dts, g2 = n2[n2.length - 1].dts;
    const A2 = g2 - f2, R2 = A2 ? Math.round(A2 / (d2 - 1)) : v2 || t2.inputTimeScale / 30;
    if (s2) {
      const s3 = f2 - L2, i3 = s3 > R2, r3 = s3 < -1;
      if ((i3 || r3) && (i3 ? this.warn(`${(t2.segmentCodec || "").toUpperCase()}: ${Ki(s3, true)} ms (${s3}dts) hole between fragments detected at ${e2.toFixed(3)}`) : this.warn(`${(t2.segmentCodec || "").toUpperCase()}: ${Ki(-s3, true)} ms (${s3}dts) overlapping between fragments detected at ${e2.toFixed(3)}`), !r3 || L2 >= n2[0].pts || Yi)) {
        f2 = L2;
        const t3 = n2[0].pts - s3;
        if (i3) n2[0].dts = f2, n2[0].pts = t3;
        else {
          let e3 = true;
          for (let i4 = 0; i4 < n2.length && !(n2[i4].dts > t3 && e3); i4++) {
            const t4 = n2[i4].pts;
            if (n2[i4].dts -= s3, n2[i4].pts -= s3, i4 < n2.length - 1) {
              const s4 = n2[i4 + 1].pts;
              e3 = s4 <= n2[i4].pts == s4 <= t4;
            }
          }
        }
        this.log(`Video: Initial PTS/DTS adjusted: ${Ki(t3, true)}/${Ki(f2, true)}, delta: ${Ki(s3, true)} ms`);
      }
    }
    f2 = Math.max(0, f2);
    let b2 = 0, I2 = 0, k2 = f2;
    for (let t3 = 0; t3 < d2; t3++) {
      const e3 = n2[t3], s3 = e3.units, i3 = s3.length;
      let r3 = 0;
      for (let t4 = 0; t4 < i3; t4++) r3 += s3[t4].data.length;
      I2 += r3, b2 += i3, e3.length = r3, e3.dts < k2 ? (e3.dts = k2, k2 += R2 / 4 | 0 || 1) : k2 = e3.dts, E2 = Math.min(e3.pts, E2), T2 = Math.max(e3.pts, T2);
    }
    g2 = n2[d2 - 1].dts;
    const P2 = I2 + 4 * b2 + 8;
    let D2;
    try {
      D2 = new Uint8Array(P2);
    } catch (t3) {
      return void this.observer.emit(h.ERROR, h.ERROR, { type: o.MUX_ERROR, details: l.REMUX_ALLOC_ERROR, fatal: false, error: t3, bytes: P2, reason: `fail allocating video mdat ${P2}` });
    }
    const _2 = new DataView(D2.buffer);
    _2.setUint32(0, P2), D2.set(MP4.types.mdat, 4);
    let C2 = false, w2 = Number.POSITIVE_INFINITY, M2 = Number.POSITIVE_INFINITY, x2 = Number.NEGATIVE_INFINITY, O2 = Number.NEGATIVE_INFINITY;
    for (let t3 = 0; t3 < d2; t3++) {
      const e3 = n2[t3], s3 = e3.units;
      let o2, l2 = 0;
      for (let t4 = 0, e4 = s3.length; t4 < e4; t4++) {
        const e5 = s3[t4], i3 = e5.data, r3 = e5.data.byteLength;
        _2.setUint32(p2, r3), p2 += 4, D2.set(i3, p2), p2 += r3, l2 += 4 + r3;
      }
      if (t3 < d2 - 1) v2 = n2[t3 + 1].dts - e3.dts, o2 = n2[t3 + 1].pts - e3.pts;
      else {
        const s4 = this.config, a3 = t3 > 0 ? e3.dts - n2[t3 - 1].dts : R2;
        if (o2 = t3 > 0 ? e3.pts - n2[t3 - 1].pts : R2, s4.stretchShortVideoTrack && null !== this.nextAudioTs) {
          const t4 = Math.floor(s4.maxBufferHole * r2), n3 = (i2 ? E2 + i2 * r2 : this.nextAudioTs + u2) - e3.pts;
          n3 > t4 ? (v2 = n3 - a3, v2 < 0 ? v2 = a3 : C2 = true, this.log(`It is approximately ${n3 / 90} ms to the next segment; using duration ${v2 / 90} ms for the last video frame.`)) : v2 = a3;
        } else v2 = a3;
      }
      const h2 = Math.round(e3.pts - e3.dts);
      w2 = Math.min(w2, v2), x2 = Math.max(x2, v2), M2 = Math.min(M2, o2), O2 = Math.max(O2, o2), a2.push(ji(e3.key, v2, l2, h2));
    }
    if (a2.length) {
      if (Yi) {
        if (Yi < 70) {
          const t3 = a2[0].flags;
          t3.dependsOn = 2, t3.isNonSync = 0;
        }
      } else if (Wi && O2 - M2 < x2 - w2 && R2 / x2 < 0.025 && 0 === a2[0].cts) {
        this.warn("Found irregular gaps in sample duration. Using PTS instead of DTS to determine MP4 sample duration.");
        let t3 = f2;
        for (let e3 = 0, s3 = a2.length; e3 < s3; e3++) {
          const i3 = t3 + a2[e3].duration, r3 = t3 + a2[e3].cts;
          if (e3 < s3 - 1) {
            const t4 = i3 + a2[e3 + 1].cts;
            a2[e3].duration = t4 - r3;
          } else a2[e3].duration = e3 ? a2[e3 - 1].duration : R2;
          a2[e3].cts = 0, t3 = i3;
        }
      }
    }
    v2 = C2 || !v2 ? R2 : v2;
    const F2 = g2 + v2;
    this.nextVideoTs = m2 = F2 - u2, this.videoSampleDuration = v2, this.isVideoContiguous = true;
    const N2 = { data1: MP4.moof(t2.sequenceNumber++, f2, y(t2, { samples: a2 })), data2: D2, startPTS: (E2 - u2) / r2, endPTS: (T2 + v2 - u2) / r2, startDTS: (f2 - u2) / r2, endDTS: m2 / r2, type: "video", hasAudio: false, hasVideo: true, nb: a2.length, dropped: t2.dropped };
    return t2.samples = [], t2.dropped = 0, N2;
  }
  getSamplesPerFrame(t2) {
    switch (t2.segmentCodec) {
      case "mp3":
        return 1152;
      case "ac3":
        return 1536;
      default:
        return 1024;
    }
  }
  remuxAudio(t2, e2, s2, i2, r2) {
    const n2 = t2.inputTimeScale, a2 = n2 / (t2.samplerate ? t2.samplerate : n2), d2 = this.getSamplesPerFrame(t2), c2 = d2 * a2, u2 = this._initPTS, f2 = "mp3" === t2.segmentCodec && this.typeSupported.mpeg, g2 = [], m2 = void 0 !== r2;
    let p2 = t2.samples, v2 = f2 ? 0 : 8, E2 = this.nextAudioTs || -1;
    const T2 = u2.baseTime * n2 / u2.timescale, S2 = T2 + e2 * n2;
    if (this.isAudioContiguous = s2 = s2 || p2.length && E2 > 0 && (i2 && Math.abs(S2 - (E2 + T2)) < 9e3 || Math.abs(qi(p2[0].pts, S2) - (E2 + T2)) < 20 * c2), p2.forEach(function(t3) {
      t3.pts = qi(t3.pts, S2);
    }), !s2 || E2 < 0) {
      const t3 = p2.length;
      if (p2 = p2.filter((t4) => t4.pts >= 0), t3 !== p2.length && this.warn(`Removed ${p2.length - t3} of ${t3} samples (initPTS ${T2} / ${n2})`), !p2.length) return;
      E2 = 0 === r2 ? 0 : i2 && !m2 ? Math.max(0, S2 - T2) : p2[0].pts - T2;
    }
    if ("aac" === t2.segmentCodec) {
      const e3 = this.config.maxAudioFramesDrift;
      for (let s3 = 0, i3 = E2 + T2; s3 < p2.length; s3++) {
        const r3 = p2[s3], a3 = r3.pts, o2 = a3 - i3, l2 = Math.abs(1e3 * o2 / n2);
        if (o2 <= -e3 * c2 && m2) 0 === s3 && (this.warn(`Audio frame @ ${(a3 / n2).toFixed(3)}s overlaps marker by ${Math.round(1e3 * o2 / n2)} ms.`), this.nextAudioTs = E2 = a3 - T2, i3 = a3);
        else if (o2 >= e3 * c2 && l2 < 1e4 && m2) {
          let e4 = Math.round(o2 / c2);
          for (i3 = a3 - e4 * c2; i3 < 0 && e4 && c2; ) e4--, i3 += c2;
          0 === s3 && (this.nextAudioTs = E2 = i3 - T2), this.warn(`Injecting ${e4} audio frames @ ${((i3 - T2) / n2).toFixed(3)}s due to ${Math.round(1e3 * o2 / n2)} ms gap.`);
          for (let n3 = 0; n3 < e4; n3++) {
            let e5 = AAC.getSilentFrame(t2.parsedCodec || t2.manifestCodec || t2.codec, t2.channelCount);
            e5 || (this.log("Unable to get silent frame for given audio codec; duplicating last frame instead."), e5 = r3.unit.subarray()), p2.splice(s3, 0, { unit: e5, pts: i3 }), i3 += c2, s3++;
          }
        }
        r3.pts = i3, i3 += c2;
      }
    }
    let L2, A2 = null, R2 = null, b2 = 0, I2 = p2.length;
    for (; I2--; ) b2 += p2[I2].unit.byteLength;
    for (let e3 = 0, i3 = p2.length; e3 < i3; e3++) {
      const i4 = p2[e3], r3 = i4.unit;
      let n3 = i4.pts;
      if (null !== R2) g2[e3 - 1].duration = Math.round((n3 - R2) / a2);
      else {
        if (s2 && "aac" === t2.segmentCodec && (n3 = E2 + T2), A2 = n3, !(b2 > 0)) return;
        b2 += v2;
        try {
          L2 = new Uint8Array(b2);
        } catch (t3) {
          return void this.observer.emit(h.ERROR, h.ERROR, { type: o.MUX_ERROR, details: l.REMUX_ALLOC_ERROR, fatal: false, error: t3, bytes: b2, reason: `fail allocating audio mdat ${b2}` });
        }
        f2 || (new DataView(L2.buffer).setUint32(0, b2), L2.set(MP4.types.mdat, 4));
      }
      L2.set(r3, v2);
      const c3 = r3.byteLength;
      v2 += c3, g2.push(ji(true, d2, c3, 0)), R2 = n3;
    }
    const k2 = g2.length;
    if (!k2) return;
    const P2 = g2[g2.length - 1];
    E2 = R2 - T2, this.nextAudioTs = E2 + a2 * P2.duration;
    const D2 = f2 ? new Uint8Array(0) : MP4.moof(t2.sequenceNumber++, A2 / a2, y({}, t2, { samples: g2 }));
    t2.samples = [];
    const _2 = (A2 - T2) / n2, C2 = this.nextAudioTs / n2, w2 = { data1: D2, data2: L2, startPTS: _2, endPTS: C2, startDTS: _2, endDTS: C2, type: "audio", hasAudio: true, hasVideo: false, nb: k2 };
    return this.isAudioContiguous = true, w2;
  }
}
function qi(t2, e2) {
  let s2;
  if (null === e2) return t2;
  for (s2 = e2 < t2 ? -8589934592 : 8589934592; Math.abs(t2 - e2) > 4294967296; ) t2 += s2;
  return t2;
}
function Xi(t2, e2, s2, i2) {
  const r2 = t2.samples.length;
  if (!r2) return;
  const n2 = t2.inputTimeScale;
  for (let a3 = 0; a3 < r2; a3++) {
    const r3 = t2.samples[a3];
    r3.pts = qi(r3.pts - s2.baseTime * n2 / s2.timescale, e2 * n2) / n2, r3.dts = qi(r3.dts - i2.baseTime * n2 / i2.timescale, e2 * n2) / n2;
  }
  const a2 = t2.samples;
  return t2.samples = [], { samples: a2 };
}
function zi(t2, e2, s2) {
  const i2 = t2.samples.length;
  if (!i2) return;
  const r2 = t2.inputTimeScale;
  for (let n3 = 0; n3 < i2; n3++) {
    const i3 = t2.samples[n3];
    i3.pts = qi(i3.pts - s2.baseTime * r2 / s2.timescale, e2 * r2) / r2;
  }
  t2.samples.sort((t3, e3) => t3.pts - e3.pts);
  const n2 = t2.samples;
  return t2.samples = [], { samples: n2 };
}
function Qi(t2, e2, s2 = false) {
  return void 0 !== (null == t2 ? void 0 : t2.start) ? (t2.start + (s2 ? t2.duration : 0)) / t2.timescale : e2;
}
function Zi(t2, e2, s2) {
  const i2 = t2.codec;
  return i2 && i2.length > 4 ? i2 : e2 === F ? "ec-3" === i2 || "ac-3" === i2 || "alac" === i2 ? i2 : "fLaC" === i2 || "Opus" === i2 ? Lt(i2, false) : (s2.warn(`Unhandled audio codec "${i2}" in mp4 MAP`), i2 || "mp4a") : (s2.warn(`Unhandled video codec "${i2}" in mp4 MAP`), i2 || "avc1");
}
try {
  Vi = self.performance.now.bind(self.performance);
} catch (t2) {
  Vi = Date.now;
}
const Ji = [{ demux: class {
  constructor(t2, e2) {
    this.remainderData = null, this.timeOffset = 0, this.config = void 0, this.videoTrack = void 0, this.audioTrack = void 0, this.id3Track = void 0, this.txtTrack = void 0, this.config = e2;
  }
  resetTimeStamp() {
  }
  resetInitSegment(t2, e2, s2, i2) {
    const r2 = this.videoTrack = vi("video", 1), n2 = this.audioTrack = vi("audio", 1), a2 = this.txtTrack = vi("text", 1);
    if (this.id3Track = vi("id3", 1), this.timeOffset = 0, null == t2 || !t2.byteLength) return;
    const o2 = Q(t2);
    if (o2.video) {
      const { id: t3, timescale: e3, codec: s3, supplemental: i3 } = o2.video;
      r2.id = t3, r2.timescale = a2.timescale = e3, r2.codec = s3, r2.supplemental = i3;
    }
    if (o2.audio) {
      const { id: t3, timescale: e3, codec: s3 } = o2.audio;
      n2.id = t3, n2.timescale = e3, n2.codec = s3;
    }
    a2.id = H.text, r2.sampleDuration = 0, r2.duration = n2.duration = i2;
  }
  resetContiguity() {
    this.remainderData = null;
  }
  static probe(t2) {
    return function(t3) {
      const e2 = t3.byteLength;
      for (let s2 = 0; s2 < e2; ) {
        const i2 = W(t3, s2);
        if (i2 > 8 && 109 === t3[s2 + 4] && 111 === t3[s2 + 5] && 111 === t3[s2 + 6] && 102 === t3[s2 + 7]) return true;
        s2 = i2 > 1 ? s2 + i2 : e2;
      }
      return false;
    }(t2);
  }
  demux(t2, e2) {
    this.timeOffset = e2;
    let s2 = t2;
    const i2 = this.videoTrack, r2 = this.txtTrack;
    if (this.config.progressive) {
      this.remainderData && (s2 = nt(this.remainderData, t2));
      const e3 = function(t3) {
        const e4 = { valid: null, remainder: null }, s3 = X(t3, ["moof"]);
        if (s3.length < 2) return e4.remainder = t3, e4;
        const i3 = s3[s3.length - 1];
        return e4.valid = t3.slice(0, i3.byteOffset - 8), e4.remainder = t3.slice(i3.byteOffset - 8), e4;
      }(s2);
      this.remainderData = e3.remainder, i2.samples = e3.valid || new Uint8Array();
    } else i2.samples = s2;
    const n2 = this.extractID3Track(i2, e2);
    return r2.samples = at(e2, i2), { videoTrack: i2, audioTrack: this.audioTrack, id3Track: n2, textTrack: this.txtTrack };
  }
  flush() {
    const t2 = this.timeOffset, e2 = this.videoTrack, s2 = this.txtTrack;
    e2.samples = this.remainderData || new Uint8Array(), this.remainderData = null;
    const i2 = this.extractID3Track(e2, this.timeOffset);
    return s2.samples = at(t2, e2), { videoTrack: e2, audioTrack: vi(), id3Track: i2, textTrack: vi() };
  }
  extractID3Track(t2, e2) {
    const s2 = this.id3Track;
    if (t2.samples.length) {
      const i2 = X(t2.samples, ["emsg"]);
      i2 && i2.forEach((t3) => {
        const i3 = function(t4) {
          const e3 = t4[0];
          let s3 = "", i4 = "", r2 = 0, a2 = 0, o2 = 0, l2 = 0, h2 = 0, d2 = 0;
          if (0 === e3) {
            for (; "\0" !== V(t4.subarray(d2, d2 + 1)); ) s3 += V(t4.subarray(d2, d2 + 1)), d2 += 1;
            for (s3 += V(t4.subarray(d2, d2 + 1)), d2 += 1; "\0" !== V(t4.subarray(d2, d2 + 1)); ) i4 += V(t4.subarray(d2, d2 + 1)), d2 += 1;
            i4 += V(t4.subarray(d2, d2 + 1)), d2 += 1, r2 = W(t4, 12), a2 = W(t4, 16), l2 = W(t4, 20), h2 = W(t4, 24), d2 = 28;
          } else if (1 === e3) {
            d2 += 4, r2 = W(t4, d2), d2 += 4;
            const e4 = W(t4, d2);
            d2 += 4;
            const a3 = W(t4, d2);
            for (d2 += 4, o2 = 2 ** 32 * e4 + a3, n(o2) || (o2 = Number.MAX_SAFE_INTEGER, I.warn("Presentation time exceeds safe integer limit and wrapped to max safe integer in parsing emsg box")), l2 = W(t4, d2), d2 += 4, h2 = W(t4, d2), d2 += 4; "\0" !== V(t4.subarray(d2, d2 + 1)); ) s3 += V(t4.subarray(d2, d2 + 1)), d2 += 1;
            for (s3 += V(t4.subarray(d2, d2 + 1)), d2 += 1; "\0" !== V(t4.subarray(d2, d2 + 1)); ) i4 += V(t4.subarray(d2, d2 + 1)), d2 += 1;
            i4 += V(t4.subarray(d2, d2 + 1)), d2 += 1;
          }
          return { schemeIdUri: s3, value: i4, timeScale: r2, presentationTime: o2, presentationTimeDelta: a2, eventDuration: l2, id: h2, payload: t4.subarray(d2, t4.byteLength) };
        }(t3);
        if (Ci.test(i3.schemeIdUri)) {
          const t4 = wi(i3, e2);
          let r2 = 4294967295 === i3.eventDuration ? Number.POSITIVE_INFINITY : i3.eventDuration / i3.timeScale;
          r2 <= 1e-3 && (r2 = Number.POSITIVE_INFINITY);
          const n2 = i3.payload;
          s2.samples.push({ data: n2, len: n2.byteLength, dts: t4, pts: t4, type: pi.emsg, duration: r2 });
        } else if (this.config.enableEmsgKLVMetadata && i3.schemeIdUri.startsWith("urn:misb:KLV:bin:1910.1")) {
          const t4 = wi(i3, e2);
          s2.samples.push({ data: i3.payload, len: i3.payload.byteLength, dts: t4, pts: t4, type: pi.misbklv, duration: Number.POSITIVE_INFINITY });
        }
      });
    }
    return s2;
  }
  demuxSampleAes(t2, e2, s2) {
    return Promise.reject(new Error("The MP4 demuxer does not support SAMPLE-AES decryption"));
  }
  destroy() {
    this.config = null, this.remainderData = null, this.videoTrack = this.audioTrack = this.id3Track = this.txtTrack = void 0;
  }
}, remux: class extends Logger {
  constructor(t2, e2, s2, i2) {
    super("passthrough-remuxer", i2), this.emitInitSegment = false, this.audioCodec = void 0, this.videoCodec = void 0, this.initData = void 0, this.initPTS = null, this.initTracks = void 0, this.lastEndTime = null, this.isVideoContiguous = false;
  }
  destroy() {
  }
  resetTimeStamp(t2) {
    this.lastEndTime = null;
    const e2 = this.initPTS;
    e2 && t2 && e2.baseTime === t2.baseTime && e2.timescale === t2.timescale || (this.initPTS = t2);
  }
  resetNextTimestamp() {
    this.isVideoContiguous = false, this.lastEndTime = null;
  }
  resetInitSegment(t2, e2, s2, i2) {
    this.audioCodec = e2, this.videoCodec = s2, this.generateInitSegment(t2, i2), this.emitInitSegment = true;
  }
  generateInitSegment(t2, e2) {
    let { audioCodec: s2, videoCodec: i2 } = this;
    if (null == t2 || !t2.byteLength) return this.initTracks = void 0, void (this.initData = void 0);
    const { audio: r2, video: n2 } = this.initData = Q(t2);
    if (e2) !function(t3, e3) {
      if (!t3 || !e3) return;
      const s3 = e3.keyId;
      s3 && e3.isCommonEncryption && it(t3, (t4, e4) => {
        const i3 = t4.subarray(8, 24);
        i3.some((t5) => 0 !== t5) || (I.log(`[eme] Patching keyId in 'enc${e4 ? "a" : "v"}>sinf>>tenc' box: ${_(i3)} -> ${_(s3)}`), t4.set(s3, 8));
      });
    }(t2, e2);
    else {
      const t3 = r2 || n2;
      null != t3 && t3.encrypted && this.warn(`Init segment with encrypted track with has no key ("${t3.codec}")!`);
    }
    r2 && (s2 = Zi(r2, F, this)), n2 && (i2 = Zi(n2, N, this));
    const a2 = {};
    r2 && n2 ? a2.audiovideo = { container: "video/mp4", codec: s2 + "," + i2, supplemental: n2.supplemental, encrypted: n2.encrypted, initSegment: t2, id: "main" } : r2 ? a2.audio = { container: "audio/mp4", codec: s2, encrypted: r2.encrypted, initSegment: t2, id: "audio" } : n2 ? a2.video = { container: "video/mp4", codec: i2, supplemental: n2.supplemental, encrypted: n2.encrypted, initSegment: t2, id: "main" } : this.warn("initSegment does not contain moov or trak boxes."), this.initTracks = a2;
  }
  remux(t2, e2, s2, i2, n2, a2) {
    var o2, l2;
    let { initPTS: h2, lastEndTime: d2 } = this;
    const c2 = { audio: void 0, video: void 0, text: i2, id3: s2, initSegment: void 0 };
    r(d2) || (d2 = this.lastEndTime = n2 || 0);
    const u2 = e2.samples;
    if (!u2.length) return c2;
    const f2 = { initPTS: void 0, timescale: void 0, trackId: void 0 };
    let g2 = this.initData;
    if (null != (o2 = g2) && o2.length || (this.generateInitSegment(u2), g2 = this.initData), null == (l2 = g2) || !l2.length) return this.warn("Failed to generate initSegment."), c2;
    this.emitInitSegment && (f2.tracks = this.initTracks, this.emitInitSegment = false);
    const m2 = function(t3, e3, s3) {
      const i3 = {}, n3 = X(t3, ["moof", "traf"]);
      for (let t4 = 0; t4 < n3.length; t4++) {
        const a3 = n3[t4], o3 = X(a3, ["tfhd"])[0], l3 = W(o3, 4), h3 = e3[l3];
        if (!h3) continue;
        i3[l3] || (i3[l3] = { start: NaN, duration: 0, sampleCount: 0, timescale: h3.timescale, type: h3.type });
        const d3 = i3[l3], c3 = X(a3, ["tfdt"])[0];
        if (c3) {
          const t5 = c3[0];
          let e4 = W(c3, 4);
          1 === t5 && (e4 === G ? s3.warn("[mp4-demuxer]: Ignoring assumed invalid signed 64-bit track fragment decode time") : (e4 *= G + 1, e4 += W(c3, 8))), r(e4) && (!r(d3.start) || e4 < d3.start) && (d3.start = e4);
        }
        const u3 = h3.default, f3 = W(o3, 0) | (null == u3 ? void 0 : u3.flags);
        let g3 = (null == u3 ? void 0 : u3.duration) || 0;
        8 & f3 && (g3 = W(o3, 2 & f3 ? 12 : 8));
        const m3 = X(a3, ["trun"]);
        let p3 = d3.start || 0, v3 = 0, y3 = g3;
        for (let t5 = 0; t5 < m3.length; t5++) {
          const e4 = m3[t5], s4 = W(e4, 4), i4 = d3.sampleCount;
          d3.sampleCount += s4;
          const r2 = 1 & e4[3], n4 = 4 & e4[3], a4 = 1 & e4[2], o4 = 2 & e4[2], l4 = 4 & e4[2], h4 = 8 & e4[2];
          let c4 = 8, u4 = s4;
          for (r2 && (c4 += 4), n4 && s4 && (1 & e4[c4 + 1] || void 0 !== d3.keyFrameIndex || (d3.keyFrameIndex = i4), c4 += 4, a4 ? (y3 = W(e4, c4), c4 += 4) : y3 = g3, o4 && (c4 += 4), h4 && (c4 += 4), p3 += y3, v3 += y3, u4--); u4--; ) a4 ? (y3 = W(e4, c4), c4 += 4) : y3 = g3, o4 && (c4 += 4), l4 && (1 & e4[c4 + 1] || void 0 === d3.keyFrameIndex && (d3.keyFrameIndex = d3.sampleCount - (u4 + 1), d3.keyFrameStart = p3), c4 += 4), h4 && (c4 += 4), p3 += y3, v3 += y3;
          !v3 && g3 && (v3 += g3 * s4);
        }
        d3.duration += v3;
      }
      if (!Object.keys(i3).some((t4) => i3[t4].duration)) {
        let e4 = 1 / 0, s4 = 0;
        const n4 = X(t3, ["sidx"]);
        for (let t4 = 0; t4 < n4.length; t4++) {
          const i4 = z(n4[t4]);
          if (null != i4 && i4.references) {
            e4 = Math.min(e4, i4.earliestPresentationTime / i4.timescale);
            const t5 = i4.references.reduce((t6, e5) => t6 + e5.info.duration || 0, 0);
            s4 = Math.max(s4, t5 + i4.earliestPresentationTime / i4.timescale);
          }
        }
        s4 && r(s4) && Object.keys(i3).forEach((t4) => {
          i3[t4].duration || (i3[t4].duration = s4 * i3[t4].timescale - i3[t4].start);
        });
      }
      return i3;
    }(u2, g2, this), p2 = g2.audio ? m2[g2.audio.id] : null, v2 = g2.video ? m2[g2.video.id] : null, y2 = Qi(v2, 1 / 0), E2 = Qi(p2, 1 / 0), T2 = Qi(v2, 0, true), S2 = Qi(p2, 0, true);
    let L2 = n2, A2 = 0;
    const R2 = p2 && (!v2 || !h2 && E2 < y2 || h2 && h2.trackId === g2.audio.id), b2 = R2 ? p2 : v2;
    if (b2) {
      const t3 = b2.timescale, e3 = b2.start - n2 * t3, s3 = R2 ? g2.audio.id : g2.video.id;
      L2 = b2.start / t3, A2 = R2 ? S2 - E2 : T2 - y2, !a2 && h2 || !function(t4, e4, s4, i3) {
        if (null === t4) return true;
        const r2 = Math.max(i3, 1), n3 = e4 - t4.baseTime / t4.timescale;
        return Math.abs(n3 - s4) > r2;
      }(h2, L2, n2, A2) && t3 === h2.timescale || (h2 && this.warn(`Timestamps at playlist time: ${a2 ? "" : "~"}${n2} ${e3 / t3} != initPTS: ${h2.baseTime / h2.timescale} (${h2.baseTime}/${h2.timescale}) trackId: ${h2.trackId}`), this.log(`Found initPTS at playlist time: ${n2} offset: ${L2 - n2} (${e3}/${t3}) trackId: ${s3}`), h2 = null, f2.initPTS = e3, f2.timescale = t3, f2.trackId = s3);
    } else this.warn(`No audio or video samples found for initPTS at playlist time: ${n2}`);
    h2 ? (f2.initPTS = h2.baseTime, f2.timescale = h2.timescale, f2.trackId = h2.trackId) : (f2.timescale && void 0 !== f2.trackId && void 0 !== f2.initPTS || (this.warn("Could not set initPTS"), f2.initPTS = L2, f2.timescale = 1, f2.trackId = -1), this.initPTS = h2 = { baseTime: f2.initPTS, timescale: f2.timescale, trackId: f2.trackId });
    const I2 = L2 - h2.baseTime / h2.timescale, k2 = I2 + A2;
    A2 > 0 ? this.lastEndTime = k2 : (this.warn("Duration parsed from mp4 should be greater than zero"), this.resetNextTimestamp());
    const P2 = !!g2.audio, D2 = !!g2.video;
    let _2 = "";
    P2 && (_2 += "audio"), D2 && (_2 += "video");
    const C2 = { data1: u2, startPTS: I2, startDTS: I2, endPTS: k2, endDTS: k2, type: _2, hasAudio: P2, hasVideo: D2, nb: 1, dropped: 0, encrypted: !!g2.audio && g2.audio.encrypted || !!g2.video && g2.video.encrypted };
    c2.audio = P2 && !D2 ? C2 : void 0, c2.video = D2 ? C2 : void 0;
    const w2 = null == v2 ? void 0 : v2.sampleCount;
    if (w2) {
      const t3 = v2.keyFrameIndex, e3 = -1 !== t3;
      C2.nb = w2, C2.dropped = 0 === t3 || this.isVideoContiguous ? 0 : e3 ? t3 : w2, C2.independent = e3, C2.firstKeyFrame = t3, e3 && v2.keyFrameStart && (C2.firstKeyFramePTS = (v2.keyFrameStart - h2.baseTime) / h2.timescale), this.isVideoContiguous || (c2.independent = e3), this.isVideoContiguous || (this.isVideoContiguous = e3), C2.dropped && this.warn(`fmp4 does not start with IDR: firstIDR ${t3}/${w2} dropped: ${C2.dropped} start: ${C2.firstKeyFramePTS || "NA"}`);
    }
    return c2.initSegment = f2, c2.id3 = Xi(s2, n2, h2, h2), i2.samples.length && (c2.text = zi(i2, n2, h2)), c2;
  }
} }, { demux: TSDemuxer, remux: MP4Remuxer }, { demux: class extends BaseAudioDemuxer {
  constructor(t2, e2) {
    super(), this.observer = void 0, this.config = void 0, this.observer = t2, this.config = e2;
  }
  resetInitSegment(t2, e2, s2, i2) {
    super.resetInitSegment(t2, e2, s2, i2), this._audioTrack = { container: "audio/adts", type: "audio", id: 2, pid: -1, sequenceNumber: 0, segmentCodec: "aac", samples: [], manifestCodec: e2, duration: i2, inputTimeScale: 9e4, dropped: 0 };
  }
  static probe(t2, e2) {
    if (!t2) return false;
    const s2 = Js(t2, 0);
    let i2 = (null == s2 ? void 0 : s2.length) || 0;
    if (Pi(t2, i2)) return false;
    for (let s3 = t2.length; i2 < s3; i2++) if (ri(t2, i2)) return e2.log("ADTS sync word found !"), true;
    return false;
  }
  canParse(t2, e2) {
    return function(t3, e3) {
      return function(t4, e4) {
        return e4 + 5 < t4.length;
      }(t3, e3) && ti(t3, e3) && si(t3, e3) <= t3.length - e3;
    }(t2, e2);
  }
  appendFrame(t2, e2, s2) {
    ni(t2, this.observer, e2, s2, t2.manifestCodec);
    const i2 = oi(t2, e2, s2, this.basePTS, this.frameIndex);
    if (i2 && 0 === i2.missing) return i2;
  }
}, remux: MP4Remuxer }, { demux: class extends BaseAudioDemuxer {
  resetInitSegment(t2, e2, s2, i2) {
    super.resetInitSegment(t2, e2, s2, i2), this._audioTrack = { container: "audio/mpeg", type: "audio", id: 2, pid: -1, sequenceNumber: 0, segmentCodec: "mp3", samples: [], manifestCodec: e2, duration: i2, inputTimeScale: 9e4, dropped: 0 };
  }
  static probe(t2) {
    if (!t2) return false;
    const e2 = Js(t2, 0);
    let s2 = (null == e2 ? void 0 : e2.length) || 0;
    if (e2 && 11 === t2[s2] && 119 === t2[s2 + 1] && void 0 !== mi(e2) && Di(t2, s2) <= 16) return false;
    for (let e3 = t2.length; s2 < e3; s2++) if (Pi(t2, s2)) return I.log("MPEG Audio sync word found !"), true;
    return false;
  }
  canParse(t2, e2) {
    return function(t3, e3) {
      return Ii(t3, e3) && 4 <= t3.length - e3;
    }(t2, e2);
  }
  appendFrame(t2, e2, s2) {
    if (null !== this.basePTS) return Ri(t2, e2, s2, this.basePTS, this.frameIndex);
  }
}, remux: MP4Remuxer }];
Ji.splice(2, 0, { demux: class extends BaseAudioDemuxer {
  constructor(t2) {
    super(), this.observer = void 0, this.observer = t2;
  }
  resetInitSegment(t2, e2, s2, i2) {
    super.resetInitSegment(t2, e2, s2, i2), this._audioTrack = { container: "audio/ac-3", type: "audio", id: 2, pid: -1, sequenceNumber: 0, segmentCodec: "ac3", samples: [], manifestCodec: e2, duration: i2, inputTimeScale: 9e4, dropped: 0 };
  }
  canParse(t2, e2) {
    return e2 + 64 < t2.length;
  }
  appendFrame(t2, e2, s2) {
    const i2 = _i(t2, e2, s2, this.basePTS, this.frameIndex);
    if (-1 !== i2) return { sample: t2.samples[t2.samples.length - 1], length: i2, missing: 0 };
  }
  static probe(t2) {
    if (!t2) return false;
    const e2 = Js(t2, 0);
    if (!e2) return false;
    const s2 = e2.length;
    return 11 === t2[s2] && 119 === t2[s2 + 1] && void 0 !== mi(e2) && Di(t2, s2) < 16;
  }
}, remux: MP4Remuxer });
class Transmuxer {
  constructor(t2, e2, s2, i2, r2, n2) {
    this.asyncResult = false, this.logger = void 0, this.observer = void 0, this.typeSupported = void 0, this.config = void 0, this.id = void 0, this.demuxer = void 0, this.remuxer = void 0, this.decrypter = void 0, this.probe = void 0, this.decryptionPromise = null, this.transmuxConfig = void 0, this.currentTransmuxState = void 0, this.observer = t2, this.typeSupported = e2, this.config = s2, this.id = r2, this.logger = n2;
  }
  configure(t2) {
    this.transmuxConfig = t2, this.decrypter && this.decrypter.reset();
  }
  push(t2, e2, s2, i2) {
    const r2 = s2.transmuxing;
    r2.executeStart = Vi();
    let n2 = new Uint8Array(t2);
    const { currentTransmuxState: a2, transmuxConfig: d2 } = this;
    i2 && (this.currentTransmuxState = i2);
    const { contiguous: c2, discontinuity: u2, trackSwitch: f2, accurateTimeOffset: g2, timeOffset: m2, initSegmentChange: p2 } = i2 || a2, { audioCodec: v2, videoCodec: y2, defaultInitPts: E2, duration: T2, initSegmentData: S2 } = d2, L2 = function(t3, e3) {
      let s3 = null;
      return t3.byteLength > 0 && null != (null == e3 ? void 0 : e3.key) && null !== e3.iv && null != e3.method && (s3 = e3), s3;
    }(n2, e2);
    if (L2 && _e(L2.method)) {
      const t3 = this.getDecrypter(), e3 = Ce(L2.method);
      if (!t3.isSync()) return this.asyncResult = true, this.decryptionPromise = t3.webCryptoDecrypt(n2, L2.key.buffer, L2.iv.buffer, e3).then((t4) => {
        const e4 = this.push(t4, null, s2);
        return this.decryptionPromise = null, e4;
      }), this.decryptionPromise;
      {
        let i3 = t3.softwareDecrypt(n2, L2.key.buffer, L2.iv.buffer, e3);
        if (s2.part > -1) {
          const e4 = t3.flush();
          i3 = e4 ? e4.buffer : e4;
        }
        if (!i3) return r2.executeEnd = Vi(), tr(s2);
        n2 = new Uint8Array(i3);
      }
    }
    const A2 = this.needsProbing(u2, f2);
    if (A2) {
      const t3 = this.configureTransmuxer(n2);
      if (t3) return this.logger.warn(`[transmuxer] ${t3.message}`), this.observer.emit(h.ERROR, h.ERROR, { type: o.MEDIA_ERROR, details: l.FRAG_PARSING_ERROR, fatal: false, error: t3, reason: t3.message }), r2.executeEnd = Vi(), tr(s2);
    }
    (u2 || f2 || p2 || A2) && this.resetInitSegment(S2, v2, y2, T2, e2), (u2 || p2 || A2) && this.resetInitialTimestamp(E2), c2 || this.resetContiguity();
    const R2 = this.transmux(n2, L2, m2, g2, s2);
    this.asyncResult = er(R2);
    const b2 = this.currentTransmuxState;
    return b2.contiguous = true, b2.discontinuity = false, b2.trackSwitch = false, r2.executeEnd = Vi(), R2;
  }
  flush(t2) {
    const e2 = t2.transmuxing;
    e2.executeStart = Vi();
    const { decrypter: s2, currentTransmuxState: i2, decryptionPromise: r2 } = this;
    if (r2) return this.asyncResult = true, r2.then(() => this.flush(t2));
    const n2 = [], { timeOffset: a2 } = i2;
    if (s2) {
      const e3 = s2.flush();
      e3 && n2.push(this.push(e3.buffer, null, t2));
    }
    const { demuxer: o2, remuxer: l2 } = this;
    if (!o2 || !l2) {
      e2.executeEnd = Vi();
      const s3 = [tr(t2)];
      return this.asyncResult ? Promise.resolve(s3) : s3;
    }
    const h2 = o2.flush(a2);
    return er(h2) ? (this.asyncResult = true, h2.then((e3) => (this.flushRemux(n2, e3, t2), n2))) : (this.flushRemux(n2, h2, t2), this.asyncResult ? Promise.resolve(n2) : n2);
  }
  flushRemux(t2, e2, s2) {
    const { audioTrack: i2, videoTrack: r2, id3Track: n2, textTrack: a2 } = e2, { accurateTimeOffset: o2, timeOffset: l2 } = this.currentTransmuxState;
    this.logger.log(`[transmuxer.ts]: Flushed ${this.id} sn: ${s2.sn}${s2.part > -1 ? " part: " + s2.part : ""} of ${this.id === g ? "level" : "track"} ${s2.level}`);
    const h2 = this.remuxer.remux(i2, r2, n2, a2, l2, o2, true, this.id);
    t2.push({ remuxResult: h2, chunkMeta: s2 }), s2.transmuxing.executeEnd = Vi();
  }
  resetInitialTimestamp(t2) {
    const { demuxer: e2, remuxer: s2 } = this;
    e2 && s2 && (e2.resetTimeStamp(t2), s2.resetTimeStamp(t2));
  }
  resetContiguity() {
    const { demuxer: t2, remuxer: e2 } = this;
    t2 && e2 && (t2.resetContiguity(), e2.resetNextTimestamp());
  }
  resetInitSegment(t2, e2, s2, i2, r2) {
    const { demuxer: n2, remuxer: a2 } = this;
    n2 && a2 && (n2.resetInitSegment(t2, e2, s2, i2), a2.resetInitSegment(t2, e2, s2, r2));
  }
  destroy() {
    this.demuxer && (this.demuxer.destroy(), this.demuxer = void 0), this.remuxer && (this.remuxer.destroy(), this.remuxer = void 0);
  }
  transmux(t2, e2, s2, i2, r2) {
    let n2;
    return n2 = e2 && "SAMPLE-AES" === e2.method ? this.transmuxSampleAes(t2, e2, s2, i2, r2) : this.transmuxUnencrypted(t2, s2, i2, r2), n2;
  }
  transmuxUnencrypted(t2, e2, s2, i2) {
    const { audioTrack: r2, videoTrack: n2, id3Track: a2, textTrack: o2 } = this.demuxer.demux(t2, e2, false, !this.config.progressive);
    return { remuxResult: this.remuxer.remux(r2, n2, a2, o2, e2, s2, false, this.id), chunkMeta: i2 };
  }
  transmuxSampleAes(t2, e2, s2, i2, r2) {
    return this.demuxer.demuxSampleAes(t2, e2, s2).then((t3) => ({ remuxResult: this.remuxer.remux(t3.audioTrack, t3.videoTrack, t3.id3Track, t3.textTrack, s2, i2, false, this.id), chunkMeta: r2 }));
  }
  configureTransmuxer(t2) {
    const { config: e2, observer: s2, typeSupported: i2 } = this;
    let r2;
    for (let e3 = 0, s3 = Ji.length; e3 < s3; e3++) {
      var n2;
      if (null != (n2 = Ji[e3].demux) && n2.probe(t2, this.logger)) {
        r2 = Ji[e3];
        break;
      }
    }
    if (!r2) return new Error("Failed to find demuxer by probing fragment data");
    const a2 = this.demuxer, o2 = this.remuxer, l2 = r2.remux, h2 = r2.demux;
    o2 && o2 instanceof l2 || (this.remuxer = new l2(s2, e2, i2, this.logger)), a2 && a2 instanceof h2 || (this.demuxer = new h2(s2, e2, i2, this.logger), this.probe = h2.probe);
  }
  needsProbing(t2, e2) {
    return !this.demuxer || !this.remuxer || t2 || e2;
  }
  getDecrypter() {
    let t2 = this.decrypter;
    return t2 || (t2 = this.decrypter = new Decrypter(this.config)), t2;
  }
}
const tr = (t2) => ({ remuxResult: {}, chunkMeta: t2 });
function er(t2) {
  return "then" in t2 && t2.then instanceof Function;
}
class TransmuxConfig {
  constructor(t2, e2, s2, i2, r2) {
    this.audioCodec = void 0, this.videoCodec = void 0, this.initSegmentData = void 0, this.duration = void 0, this.defaultInitPts = void 0, this.audioCodec = t2, this.videoCodec = e2, this.initSegmentData = s2, this.duration = i2, this.defaultInitPts = r2 || null;
  }
}
class TransmuxState {
  constructor(t2, e2, s2, i2, r2, n2) {
    this.discontinuity = void 0, this.contiguous = void 0, this.accurateTimeOffset = void 0, this.trackSwitch = void 0, this.timeOffset = void 0, this.initSegmentChange = void 0, this.discontinuity = t2, this.contiguous = e2, this.accurateTimeOffset = s2, this.trackSwitch = i2, this.timeOffset = r2, this.initSegmentChange = n2;
  }
}
let sr = 0;
class TransmuxerInterface {
  constructor(t2, e2, s2, i2) {
    this.error = null, this.hls = void 0, this.id = void 0, this.instanceNo = sr++, this.observer = void 0, this.frag = null, this.part = null, this.useWorker = void 0, this.workerContext = null, this.transmuxer = null, this.onTransmuxComplete = void 0, this.onFlush = void 0, this.onWorkerMessage = (t3) => {
      const e3 = t3.data, s3 = this.hls;
      if (s3 && null != e3 && e3.event && e3.instanceNo === this.instanceNo) switch (e3.event) {
        case "init": {
          var i3;
          const t4 = null == (i3 = this.workerContext) ? void 0 : i3.objectURL;
          t4 && self.URL.revokeObjectURL(t4);
          break;
        }
        case "transmuxComplete":
          this.handleTransmuxComplete(e3.data);
          break;
        case "flush":
          this.onFlush(e3.data);
          break;
        case "workerLog":
          s3.logger[e3.data.logType] && s3.logger[e3.data.logType](e3.data.message);
          break;
        default:
          e3.data = e3.data || {}, e3.data.frag = this.frag, e3.data.part = this.part, e3.data.id = this.id, s3.trigger(e3.event, e3.data);
      }
    }, this.onWorkerError = (t3) => {
      if (!this.hls) return;
      const e3 = new Error(`${t3.message}  (${t3.filename}:${t3.lineno})`);
      this.hls.config.enableWorker = false, this.hls.logger.warn(`Error in "${this.id}" Web Worker, fallback to inline`), this.hls.trigger(h.ERROR, { type: o.OTHER_ERROR, details: l.INTERNAL_EXCEPTION, fatal: false, event: "demuxerWorker", error: e3 });
    };
    const r2 = t2.config;
    this.hls = t2, this.id = e2, this.useWorker = !!r2.enableWorker, this.onTransmuxComplete = s2, this.onFlush = i2;
    const n2 = (t3, e3) => {
      (e3 = e3 || {}).frag = this.frag || void 0, t3 === h.ERROR && (e3.parent = this.id, e3.part = this.part, this.error = e3.error), this.hls.trigger(t3, e3);
    };
    this.observer = new js(), this.observer.on(h.FRAG_DECRYPTED, n2), this.observer.on(h.ERROR, n2);
    const a2 = It(r2.preferManagedMediaSource);
    if (this.useWorker && "undefined" != typeof Worker) {
      const s3 = this.hls.logger;
      if (r2.workerPath || "function" == typeof __HLS_WORKER_BUNDLE__) {
        try {
          r2.workerPath ? (s3.log(`loading Web Worker ${r2.workerPath} for "${e2}"`), this.workerContext = function(t4) {
            const e3 = Xs[t4];
            if (e3) return e3.clientCount++, e3;
            const s4 = new self.URL(t4, self.location.href).href, i3 = { worker: new self.Worker(s4), scriptURL: s4, clientCount: 1 };
            return Xs[t4] = i3, i3;
          }(r2.workerPath)) : (s3.log(`injecting Web Worker for "${e2}"`), this.workerContext = function() {
            const t4 = Xs[qs];
            if (t4) return t4.clientCount++, t4;
            const e3 = new self.Blob([`var exports={};var module={exports:exports};function define(f){f()};define.amd=true;(${__HLS_WORKER_BUNDLE__.toString()})(true);`], { type: "text/javascript" }), s4 = self.URL.createObjectURL(e3), i3 = { worker: new self.Worker(s4), objectURL: s4, clientCount: 1 };
            return Xs[qs] = i3, i3;
          }());
          const { worker: t3 } = this.workerContext;
          t3.addEventListener("message", this.onWorkerMessage), t3.addEventListener("error", this.onWorkerError), t3.postMessage({ instanceNo: this.instanceNo, cmd: "init", typeSupported: a2, id: e2, config: $t(r2) });
        } catch (i3) {
          s3.warn(`Error setting up "${e2}" Web Worker, fallback to inline`, i3), this.terminateWorker(), this.error = null, this.transmuxer = new Transmuxer(this.observer, a2, r2, "", e2, t2.logger);
        }
        return;
      }
    }
    this.transmuxer = new Transmuxer(this.observer, a2, r2, "", e2, t2.logger);
  }
  reset() {
    if (this.frag = null, this.part = null, this.workerContext) {
      const t2 = this.instanceNo;
      this.instanceNo = sr++;
      const e2 = this.hls.config, s2 = It(e2.preferManagedMediaSource);
      this.workerContext.worker.postMessage({ instanceNo: this.instanceNo, cmd: "reset", resetNo: t2, typeSupported: s2, id: this.id, config: $t(e2) });
    }
  }
  terminateWorker() {
    if (this.workerContext) {
      const { worker: t2 } = this.workerContext;
      this.workerContext = null, t2.removeEventListener("message", this.onWorkerMessage), t2.removeEventListener("error", this.onWorkerError), function(t3) {
        const e2 = Xs[t3 || qs];
        if (e2 && 1 === e2.clientCount--) {
          const { worker: s2, objectURL: i2 } = e2;
          delete Xs[t3 || qs], i2 && self.URL.revokeObjectURL(i2), s2.terminate();
        }
      }(this.hls.config.workerPath);
    }
  }
  destroy() {
    if (this.workerContext) this.terminateWorker(), this.onWorkerMessage = this.onWorkerError = null;
    else {
      const t3 = this.transmuxer;
      t3 && (t3.destroy(), this.transmuxer = null);
    }
    const t2 = this.observer;
    t2 && t2.removeAllListeners(), this.frag = null, this.part = null, this.observer = null, this.hls = null;
  }
  push(t2, e2, s2, i2, r2, n2, a2, o2, l2, h2) {
    var d2, c2;
    l2.transmuxing.start = self.performance.now();
    const { instanceNo: u2, transmuxer: f2 } = this, m2 = n2 ? n2.start : r2.start, p2 = r2.decryptdata, v2 = this.frag, y2 = !(v2 && r2.cc === v2.cc), E2 = !(v2 && l2.level === v2.level), T2 = v2 ? l2.sn - v2.sn : -1, S2 = this.part ? l2.part - this.part.index : -1, L2 = 0 === T2 && l2.id > 1 && l2.id === (null == v2 ? void 0 : v2.stats.chunkCount), A2 = !E2 && (1 === T2 || 0 === T2 && (1 === S2 || L2 && S2 <= 0)), R2 = self.performance.now();
    (E2 || T2 || 0 === r2.stats.parsing.start) && (r2.stats.parsing.start = R2), !n2 || !S2 && A2 || (n2.stats.parsing.start = R2);
    const b2 = !(v2 && (null == (d2 = r2.initSegment) ? void 0 : d2.url) === (null == (c2 = v2.initSegment) ? void 0 : c2.url)), I2 = new TransmuxState(y2, A2, o2, E2, m2, b2);
    if (!A2 || y2 || b2) {
      this.hls.logger.log(`[transmuxer-interface]: Starting new transmux session for ${r2.type} sn: ${l2.sn}${l2.part > -1 ? " part: " + l2.part : ""} ${this.id === g ? "level" : "track"}: ${l2.level} id: ${l2.id}
        discontinuity: ${y2}
        trackSwitch: ${E2}
        contiguous: ${A2}
        accurateTimeOffset: ${o2}
        timeOffset: ${m2}
        initSegmentChange: ${b2}`);
      const t3 = new TransmuxConfig(s2, i2, e2, a2, h2);
      this.configureTransmuxer(t3);
    }
    if (this.frag = r2, this.part = n2, this.workerContext) this.workerContext.worker.postMessage({ instanceNo: u2, cmd: "demux", data: t2, decryptdata: p2, chunkMeta: l2, state: I2 }, t2 instanceof ArrayBuffer ? [t2] : []);
    else if (f2) {
      const e3 = f2.push(t2, p2, l2, I2);
      er(e3) ? e3.then((t3) => {
        this.handleTransmuxComplete(t3);
      }).catch((t3) => {
        this.transmuxerError(t3, l2, "transmuxer-interface push error");
      }) : this.handleTransmuxComplete(e3);
    }
  }
  flush(t2) {
    t2.transmuxing.start = self.performance.now();
    const { instanceNo: e2, transmuxer: s2 } = this;
    if (this.workerContext) this.workerContext.worker.postMessage({ instanceNo: e2, cmd: "flush", chunkMeta: t2 });
    else if (s2) {
      const e3 = s2.flush(t2);
      er(e3) ? e3.then((e4) => {
        this.handleFlushResult(e4, t2);
      }).catch((e4) => {
        this.transmuxerError(e4, t2, "transmuxer-interface flush error");
      }) : this.handleFlushResult(e3, t2);
    }
  }
  transmuxerError(t2, e2, s2) {
    this.hls && (this.error = t2, this.hls.trigger(h.ERROR, { type: o.MEDIA_ERROR, details: l.FRAG_PARSING_ERROR, chunkMeta: e2, frag: this.frag || void 0, part: this.part || void 0, fatal: false, error: t2, err: t2, reason: s2 }));
  }
  handleFlushResult(t2, e2) {
    t2.forEach((t3) => {
      this.handleTransmuxComplete(t3);
    }), this.onFlush(e2);
  }
  configureTransmuxer(t2) {
    const { instanceNo: e2, transmuxer: s2 } = this;
    this.workerContext ? this.workerContext.worker.postMessage({ instanceNo: e2, cmd: "configure", config: t2 }) : s2 && s2.configure(t2);
  }
  handleTransmuxComplete(t2) {
    t2.chunkMeta.transmuxing.end = self.performance.now(), this.onTransmuxComplete(t2);
  }
}
class BasePlaylistController extends Logger {
  constructor(t2, e2) {
    super(e2, t2.logger), this.hls = void 0, this.canLoad = false, this.timer = -1, this.hls = t2;
  }
  destroy() {
    this.clearTimer(), this.hls = this.log = this.warn = null;
  }
  clearTimer() {
    -1 !== this.timer && (self.clearTimeout(this.timer), this.timer = -1);
  }
  startLoad() {
    this.canLoad = true, this.loadPlaylist();
  }
  stopLoad() {
    this.canLoad = false, this.clearTimer();
  }
  switchParams(t2, e2, s2) {
    const i2 = null == e2 ? void 0 : e2.renditionReports;
    if (i2) {
      let r2 = -1;
      for (let s3 = 0; s3 < i2.length; s3++) {
        const n2 = i2[s3];
        let a2;
        try {
          a2 = new self.URL(n2.URI, e2.url).href;
        } catch (t3) {
          this.warn(`Could not construct new URL for Rendition Report: ${t3}`), a2 = n2.URI || "";
        }
        if (a2 === t2) {
          r2 = s3;
          break;
        }
        a2 === t2.substring(0, a2.length) && (r2 = s3);
      }
      if (-1 !== r2) {
        const t3 = i2[r2], n2 = parseInt(t3["LAST-MSN"]) || e2.lastPartSn;
        let a2 = parseInt(t3["LAST-PART"]) || e2.lastPartIndex;
        if (this.hls.config.lowLatencyMode) {
          const t4 = Math.min(e2.age - e2.partTarget, e2.targetduration);
          a2 >= 0 && t4 > e2.partTarget && (a2 += 1);
        }
        const o2 = s2 && Nt(s2);
        return new HlsUrlParameters(n2, a2 >= 0 ? a2 : void 0, o2);
      }
    }
  }
  loadPlaylist(t2) {
    this.clearTimer();
  }
  loadingPlaylist(t2, e2) {
    this.clearTimer();
  }
  shouldLoadPlaylist(t2) {
    return this.canLoad && !!t2 && !!t2.url && (!t2.details || t2.details.live);
  }
  getUrlWithDirectives(t2, e2) {
    if (e2) try {
      return e2.addDirectives(t2);
    } catch (t3) {
      this.warn(`Could not construct new URL with HLS Delivery Directives: ${t3}`);
    }
    return t2;
  }
  playlistLoaded(t2, e2, s2) {
    const { details: i2, stats: n2 } = e2, a2 = self.performance.now(), d2 = n2.loading.first ? Math.max(0, a2 - n2.loading.first) : 0;
    i2.advancedDateTime = Date.now() - d2;
    const c2 = this.hls.config.timelineOffset;
    if (c2 !== i2.appliedTimelineOffset) {
      const t3 = Math.max(c2 || 0, 0);
      i2.appliedTimelineOffset = t3, i2.fragments.forEach((e3) => {
        e3.setStart(e3.playlistOffset + t3);
      });
    }
    if (i2.live || null != s2 && s2.live) {
      const c3 = "levelInfo" in e2 ? e2.levelInfo : e2.track;
      if (i2.reloaded(s2), s2 && i2.fragments.length > 0) {
        !function(t4, e3, s3) {
          if (t4 === e3) return;
          let i3 = null;
          const n3 = t4.fragments;
          for (let t5 = n3.length - 1; t5 >= 0; t5--) {
            const e4 = n3[t5].initSegment;
            if (e4) {
              i3 = e4;
              break;
            }
          }
          let a3;
          t4.fragmentHint && delete t4.fragmentHint.endPTS, function(t5, e4, s4) {
            const i4 = e4.skippedSegments, r2 = Math.max(t5.startSN, e4.startSN) - e4.startSN, n4 = (t5.fragmentHint ? 1 : 0) + (i4 ? e4.endSN : Math.min(t5.endSN, e4.endSN)) - e4.startSN, a4 = e4.startSN - t5.startSN, o3 = e4.fragmentHint ? e4.fragments.concat(e4.fragmentHint) : e4.fragments, l3 = t5.fragmentHint ? t5.fragments.concat(t5.fragmentHint) : t5.fragments;
            for (let h3 = r2; h3 <= n4; h3++) {
              const r3 = l3[a4 + h3];
              let n5 = o3[h3];
              if (i4 && !n5 && r3 && (n5 = e4.fragments[h3] = r3), r3 && n5) {
                s4(r3, n5, h3, o3);
                const i5 = r3.relurl, a5 = n5.relurl;
                if (i5 && Ls(i5, a5)) return void (e4.playlistParsingError = gs(`media sequence mismatch ${n5.sn}:`, t5, e4, 0, n5));
                if (r3.cc !== n5.cc) return void (e4.playlistParsingError = gs(`discontinuity sequence mismatch (${r3.cc}!=${n5.cc})`, t5, e4, 0, n5));
              }
            }
          }(t4, e3, (t5, s4, n4, o3) => {
            if ((!e3.startCC || e3.skippedSegments) && s4.cc !== t5.cc) {
              const i4 = t5.cc - s4.cc;
              for (let t6 = n4; t6 < o3.length; t6++) o3[t6].cc += i4;
              e3.endCC = o3[o3.length - 1].cc;
            }
            r(t5.startPTS) && r(t5.endPTS) && (s4.setStart(s4.startPTS = t5.startPTS), s4.startDTS = t5.startDTS, s4.maxStartPTS = t5.maxStartPTS, s4.endPTS = t5.endPTS, s4.endDTS = t5.endDTS, s4.minEndPTS = t5.minEndPTS, s4.setDuration(t5.endPTS - t5.startPTS), s4.duration && (a3 = s4), e3.PTSKnown = e3.alignedSliding = true), t5.hasStreams && (s4.elementaryStreams = t5.elementaryStreams), s4.loader = t5.loader, t5.hasStats && (s4.stats = t5.stats), t5.initSegment && (s4.initSegment = t5.initSegment, i3 = t5.initSegment);
          });
          const o2 = e3.fragments, l2 = e3.fragmentHint ? o2.concat(e3.fragmentHint) : o2;
          if (i3 && l2.forEach((t5) => {
            var e4;
            !t5 || t5.initSegment && t5.initSegment.relurl !== (null == (e4 = i3) ? void 0 : e4.relurl) || (t5.initSegment = i3);
          }), e3.skippedSegments) {
            if (e3.deltaUpdateFailed = o2.some((t5) => !t5), e3.deltaUpdateFailed) {
              s3.warn("[level-helper] Previous playlist missing segments skipped in delta playlist");
              for (let t5 = e3.skippedSegments; t5--; ) o2.shift();
              e3.startSN = o2[0].sn;
            } else {
              e3.canSkipDateRanges && (e3.dateRanges = function(t5, e4, s4) {
                const { dateRanges: i5, recentlyRemovedDateranges: r2 } = e4, n4 = y({}, t5);
                r2 && r2.forEach((t6) => {
                  delete n4[t6];
                });
                const a4 = Object.keys(n4).length;
                return a4 ? (Object.keys(i5).forEach((t6) => {
                  const e5 = n4[t6], r3 = new DateRange(i5[t6].attr, e5);
                  r3.isValid ? (n4[t6] = r3, e5 || (r3.tagOrder += a4)) : s4.warn(`Ignoring invalid Playlist Delta Update DATERANGE tag: "${$t(i5[t6].attr)}"`);
                }), n4) : i5;
              }(t4.dateRanges, e3, s3));
              const i4 = t4.fragments.filter((t5) => t5.rawProgramDateTime);
              if (t4.hasProgramDateTime && !e3.hasProgramDateTime) for (let t5 = 1; t5 < l2.length; t5++) null === l2[t5].programDateTime && os(l2[t5], l2[t5 - 1], i4);
              es(i4, e3);
            }
            e3.endCC = o2[o2.length - 1].cc;
          }
          if (!e3.startCC) {
            var h2;
            const s4 = ys(t4, e3.startSN - 1);
            e3.startCC = null != (h2 = null == s4 ? void 0 : s4.cc) ? h2 : o2[0].cc;
          }
          !function(t5, e4, s4) {
            if (t5 && e4) {
              let i4 = 0;
              for (let r2 = 0, n4 = t5.length; r2 <= n4; r2++) {
                const n5 = t5[r2], a4 = e4[r2 + i4];
                n5 && a4 && n5.index === a4.index && n5.fragment.sn === a4.fragment.sn ? s4(n5, a4) : i4--;
              }
            }
          }(t4.partList, e3.partList, (t5, e4) => {
            e4.elementaryStreams = t5.elementaryStreams, e4.stats = t5.stats;
          }), a3 ? fs(e3, a3, a3.startPTS, a3.endPTS, a3.startDTS, a3.endDTS, s3) : ms(t4, e3), o2.length && (e3.totalduration = e3.edge - o2[0].start), e3.driftStartTime = t4.driftStartTime, e3.driftStart = t4.driftStart;
          const d3 = e3.advancedDateTime;
          if (e3.advanced && d3) {
            const t5 = e3.edge;
            e3.driftStart || (e3.driftStartTime = d3, e3.driftStart = t5), e3.driftEndTime = d3, e3.driftEnd = t5;
          } else e3.driftEndTime = t4.driftEndTime, e3.driftEnd = t4.driftEnd, e3.advancedDateTime = t4.advancedDateTime;
          -1 === e3.requestScheduled && (e3.requestScheduled = t4.requestScheduled);
        }(s2, i2, this);
        const t3 = i2.playlistParsingError;
        if (t3) {
          this.warn(t3);
          const s3 = this.hls;
          if (!s3.config.ignorePlaylistParsingErrors) {
            var u2;
            const { networkDetails: r2 } = e2;
            return void s3.trigger(h.ERROR, { type: o.NETWORK_ERROR, details: l.LEVEL_PARSING_ERROR, fatal: false, url: i2.url, error: t3, reason: t3.message, level: e2.level || void 0, parent: null == (u2 = i2.fragments[0]) ? void 0 : u2.type, networkDetails: r2, stats: n2 });
          }
          i2.playlistParsingError = null;
        }
      }
      -1 === i2.requestScheduled && (i2.requestScheduled = n2.loading.start);
      const f2 = this.hls.mainForwardBufferInfo, g2 = f2 ? f2.end - f2.len : 0, m2 = vs(i2, 1e3 * (i2.edge - g2));
      if (i2.requestScheduled + m2 < a2 ? i2.requestScheduled = a2 : i2.requestScheduled += m2, this.log(`live playlist ${t2} ${i2.advanced ? "REFRESHED " + i2.lastPartSn + "-" + i2.lastPartIndex : i2.updated ? "UPDATED" : "MISSED"}`), !this.canLoad || !i2.live) return;
      let p2, v2, E2;
      if (i2.canBlockReload && i2.endSN && i2.advanced) {
        const t3 = this.hls.config.lowLatencyMode, r2 = i2.lastPartSn, n3 = i2.endSN, o2 = i2.lastPartIndex, l2 = r2 === n3;
        -1 !== o2 ? l2 ? (v2 = n3 + 1, E2 = t3 ? 0 : o2) : (v2 = r2, E2 = t3 ? o2 + 1 : i2.maxPartIndex) : v2 = n3 + 1;
        const h2 = i2.age, d3 = h2 + i2.ageHeader;
        let u3 = Math.min(d3 - i2.partTarget, 1.5 * i2.targetduration);
        if (u3 > 0) {
          if (d3 > 3 * i2.targetduration) this.log(`Playlist last advanced ${h2.toFixed(2)}s ago. Omitting segment and part directives.`), v2 = void 0, E2 = void 0;
          else if (null != s2 && s2.tuneInGoal && d3 - i2.partTarget > s2.tuneInGoal) this.warn(`CDN Tune-in goal increased from: ${s2.tuneInGoal} to: ${u3} with playlist age: ${i2.age}`), u3 = 0;
          else {
            const t4 = Math.floor(u3 / i2.targetduration);
            v2 += t4, void 0 !== E2 && (E2 += Math.round(u3 % i2.targetduration / i2.partTarget)), this.log(`CDN Tune-in age: ${i2.ageHeader}s last advanced ${h2.toFixed(2)}s goal: ${u3} skip sn ${t4} to part ${E2}`);
          }
          i2.tuneInGoal = u3;
        }
        if (p2 = this.getDeliveryDirectives(i2, e2.deliveryDirectives, v2, E2), t3 || !l2) return i2.requestScheduled = a2, void this.loadingPlaylist(c3, p2);
      } else (i2.canBlockReload || i2.canSkipUntil) && (p2 = this.getDeliveryDirectives(i2, e2.deliveryDirectives, v2, E2));
      p2 && void 0 !== v2 && i2.canBlockReload && (i2.requestScheduled = n2.loading.first + Math.max(m2 - 2 * d2, m2 / 2)), this.scheduleLoading(c3, p2, i2);
    } else this.clearTimer();
  }
  scheduleLoading(t2, e2, s2) {
    const i2 = s2 || t2.details;
    if (!i2) return void this.loadingPlaylist(t2, e2);
    const r2 = self.performance.now(), n2 = i2.requestScheduled;
    if (r2 >= n2) return void this.loadingPlaylist(t2, e2);
    const a2 = n2 - r2;
    this.log(`reload live playlist ${t2.name || t2.bitrate + "bps"} in ${Math.round(a2)} ms`), this.clearTimer(), this.timer = self.setTimeout(() => this.loadingPlaylist(t2, e2), a2);
  }
  getDeliveryDirectives(t2, e2, s2, i2) {
    let r2 = Nt(t2);
    return null != e2 && e2.skip && t2.deltaUpdateFailed && (s2 = e2.msn, i2 = e2.part, r2 = ""), new HlsUrlParameters(s2, i2, r2);
  }
  checkRetry(t2) {
    const e2 = t2.details, s2 = Jt(t2), i2 = t2.errorAction, { action: r2, retryCount: n2 = 0, retryConfig: a2 } = i2 || {}, o2 = !!i2 && !!a2 && (5 === r2 || !i2.resolved && 2 === r2);
    if (o2) {
      var l2;
      if (n2 >= a2.maxNumRetry) return false;
      if (s2 && null != (l2 = t2.context) && l2.deliveryDirectives) this.warn(`Retrying playlist loading ${n2 + 1}/${a2.maxNumRetry} after "${e2}" without delivery-directives`), this.loadPlaylist();
      else {
        const t3 = ie(a2, n2);
        this.clearTimer(), this.timer = self.setTimeout(() => this.loadPlaylist(), t3), this.warn(`Retrying playlist loading ${n2 + 1}/${a2.maxNumRetry} after "${e2}" in ${t3}ms`);
      }
      t2.levelRetry = true, i2.resolved = true;
    }
    return o2;
  }
}
function ir(t2, e2) {
  if (t2.length !== e2.length) return false;
  for (let s2 = 0; s2 < t2.length; s2++) if (!rr(t2[s2].attrs, e2[s2].attrs)) return false;
  return true;
}
function rr(t2, e2, s2) {
  const i2 = t2["STABLE-RENDITION-ID"];
  return i2 && !s2 ? i2 === e2["STABLE-RENDITION-ID"] : !(s2 || ["LANGUAGE", "NAME", "CHARACTERISTICS", "AUTOSELECT", "DEFAULT", "FORCED", "ASSOC-LANGUAGE"]).some((s3) => t2[s3] !== e2[s3]);
}
function nr(t2, e2) {
  return e2.label.toLowerCase() === t2.name.toLowerCase() && (!e2.language || e2.language.toLowerCase() === (t2.lang || "").toLowerCase());
}
class BufferOperationQueue {
  constructor(t2) {
    this.tracks = void 0, this.queues = { video: [], audio: [], audiovideo: [] }, this.tracks = t2;
  }
  destroy() {
    this.tracks = this.queues = null;
  }
  append(t2, e2, s2) {
    if (null === this.queues || null === this.tracks) return;
    const i2 = this.queues[e2];
    i2.push(t2), 1 !== i2.length || s2 || this.executeNext(e2);
  }
  appendBlocker(t2) {
    return new Promise((e2) => {
      const s2 = { label: "async-blocker", execute: e2, onStart: () => {
      }, onComplete: () => {
      }, onError: () => {
      } };
      this.append(s2, t2);
    });
  }
  prependBlocker(t2) {
    return new Promise((e2) => {
      if (this.queues) {
        const s2 = { label: "async-blocker-prepend", execute: e2, onStart: () => {
        }, onComplete: () => {
        }, onError: () => {
        } };
        this.queues[t2].unshift(s2);
      }
    });
  }
  removeBlockers() {
    null !== this.queues && [this.queues.video, this.queues.audio, this.queues.audiovideo].forEach((t2) => {
      var e2;
      const s2 = null == (e2 = t2[0]) ? void 0 : e2.label;
      "async-blocker" !== s2 && "async-blocker-prepend" !== s2 || (t2[0].execute(), t2.splice(0, 1));
    });
  }
  unblockAudio(t2) {
    null !== this.queues && this.queues.audio[0] === t2 && this.shiftAndExecuteNext("audio");
  }
  executeNext(t2) {
    if (null === this.queues || null === this.tracks) return;
    const e2 = this.queues[t2];
    if (e2.length) {
      const i2 = e2[0];
      try {
        i2.execute();
      } catch (e3) {
        var s2;
        if (i2.onError(e3), null === this.queues || null === this.tracks) return;
        const r2 = null == (s2 = this.tracks[t2]) ? void 0 : s2.buffer;
        null != r2 && r2.updating || this.shiftAndExecuteNext(t2);
      }
    }
  }
  shiftAndExecuteNext(t2) {
    null !== this.queues && (this.queues[t2].shift(), this.executeNext(t2));
  }
  current(t2) {
    var e2;
    return (null == (e2 = this.queues) ? void 0 : e2[t2][0]) || null;
  }
  toString() {
    const { queues: t2, tracks: e2 } = this;
    return null === t2 || null === e2 ? "<destroyed>" : `
${this.list("video")}
${this.list("audio")}
${this.list("audiovideo")}}`;
  }
  list(t2) {
    var e2, s2;
    return null != (e2 = this.queues) && e2[t2] || null != (s2 = this.tracks) && s2[t2] ? `${t2}: (${this.listSbInfo(t2)}) ${this.listOps(t2)}` : "";
  }
  listSbInfo(t2) {
    var e2;
    const s2 = null == (e2 = this.tracks) ? void 0 : e2[t2], i2 = null == s2 ? void 0 : s2.buffer;
    return i2 ? `SourceBuffer${i2.updating ? " updating" : ""}${s2.ended ? " ended" : ""}${s2.ending ? " ending" : ""}` : "none";
  }
  listOps(t2) {
    var e2;
    return (null == (e2 = this.queues) ? void 0 : e2[t2].map((t3) => t3.label).join(", ")) || "";
  }
}
const ar = /(avc[1234]|hvc1|hev1|dvh[1e]|vp09|av01)(?:\.[^.,]+)+/, or = "HlsJsTrackRemovedError";
class HlsJsTrackRemovedError extends Error {
  constructor(t2) {
    super(t2), this.name = or;
  }
}
function lr(t2) {
  const e2 = t2.querySelectorAll("source");
  [].slice.call(e2).forEach((e3) => {
    t2.removeChild(e3);
  });
}
function hr(t2) {
  return "audio" === t2 ? 1 : 0;
}
class CapLevelController {
  constructor(t2) {
    this.hls = void 0, this.autoLevelCapping = void 0, this.firstLevel = void 0, this.media = void 0, this.restrictedLevels = void 0, this.timer = void 0, this.clientRect = void 0, this.streamController = void 0, this.hls = t2, this.autoLevelCapping = Number.POSITIVE_INFINITY, this.firstLevel = -1, this.media = null, this.restrictedLevels = [], this.timer = void 0, this.clientRect = null, this.registerListeners();
  }
  setStreamController(t2) {
    this.streamController = t2;
  }
  destroy() {
    this.hls && this.unregisterListener(), this.timer && this.stopCapping(), this.media = null, this.clientRect = null, this.hls = this.streamController = null;
  }
  registerListeners() {
    const { hls: t2 } = this;
    t2.on(h.FPS_DROP_LEVEL_CAPPING, this.onFpsDropLevelCapping, this), t2.on(h.MEDIA_ATTACHING, this.onMediaAttaching, this), t2.on(h.MANIFEST_PARSED, this.onManifestParsed, this), t2.on(h.LEVELS_UPDATED, this.onLevelsUpdated, this), t2.on(h.BUFFER_CODECS, this.onBufferCodecs, this), t2.on(h.MEDIA_DETACHING, this.onMediaDetaching, this);
  }
  unregisterListener() {
    const { hls: t2 } = this;
    t2.off(h.FPS_DROP_LEVEL_CAPPING, this.onFpsDropLevelCapping, this), t2.off(h.MEDIA_ATTACHING, this.onMediaAttaching, this), t2.off(h.MANIFEST_PARSED, this.onManifestParsed, this), t2.off(h.LEVELS_UPDATED, this.onLevelsUpdated, this), t2.off(h.BUFFER_CODECS, this.onBufferCodecs, this), t2.off(h.MEDIA_DETACHING, this.onMediaDetaching, this);
  }
  onFpsDropLevelCapping(t2, e2) {
    const s2 = this.hls.levels[e2.droppedLevel];
    this.isLevelAllowed(s2) && this.restrictedLevels.push({ bitrate: s2.bitrate, height: s2.height, width: s2.width });
  }
  onMediaAttaching(t2, e2) {
    this.media = e2.media instanceof HTMLVideoElement ? e2.media : null, this.clientRect = null, this.timer && this.hls.levels.length && this.detectPlayerSize();
  }
  onManifestParsed(t2, e2) {
    const s2 = this.hls;
    this.restrictedLevels = [], this.firstLevel = e2.firstLevel, s2.config.capLevelToPlayerSize && e2.video && this.startCapping();
  }
  onLevelsUpdated(t2, e2) {
    this.timer && r(this.autoLevelCapping) && this.detectPlayerSize();
  }
  onBufferCodecs(t2, e2) {
    this.hls.config.capLevelToPlayerSize && e2.video && this.startCapping();
  }
  onMediaDetaching() {
    this.stopCapping(), this.media = null;
  }
  detectPlayerSize() {
    if (this.media) {
      if (this.mediaHeight <= 0 || this.mediaWidth <= 0) return void (this.clientRect = null);
      const t2 = this.hls.levels;
      if (t2.length) {
        const e2 = this.hls, s2 = this.getMaxLevel(t2.length - 1);
        s2 !== this.autoLevelCapping && e2.logger.log(`Setting autoLevelCapping to ${s2}: ${t2[s2].height}p@${t2[s2].bitrate} for media ${this.mediaWidth}x${this.mediaHeight}`), e2.autoLevelCapping = s2, e2.autoLevelEnabled && e2.autoLevelCapping > this.autoLevelCapping && this.streamController && this.streamController.nextLevelSwitch(), this.autoLevelCapping = e2.autoLevelCapping;
      }
    }
  }
  getMaxLevel(t2) {
    const e2 = this.hls.levels;
    if (!e2.length) return -1;
    const s2 = e2.filter((e3, s3) => this.isLevelAllowed(e3) && s3 <= t2);
    return this.clientRect = null, CapLevelController.getMaxLevelByMediaSize(s2, this.mediaWidth, this.mediaHeight);
  }
  startCapping() {
    this.timer || (this.autoLevelCapping = Number.POSITIVE_INFINITY, self.clearInterval(this.timer), this.timer = self.setInterval(this.detectPlayerSize.bind(this), 1e3), this.detectPlayerSize());
  }
  stopCapping() {
    this.restrictedLevels = [], this.firstLevel = -1, this.autoLevelCapping = Number.POSITIVE_INFINITY, this.timer && (self.clearInterval(this.timer), this.timer = void 0);
  }
  getDimensions() {
    if (this.clientRect) return this.clientRect;
    const t2 = this.media, e2 = { width: 0, height: 0 };
    if (t2) {
      const s2 = t2.getBoundingClientRect();
      e2.width = s2.width, e2.height = s2.height, e2.width || e2.height || (e2.width = s2.right - s2.left || t2.width || 0, e2.height = s2.bottom - s2.top || t2.height || 0);
    }
    return this.clientRect = e2, e2;
  }
  get mediaWidth() {
    return this.getDimensions().width * this.contentScaleFactor;
  }
  get mediaHeight() {
    return this.getDimensions().height * this.contentScaleFactor;
  }
  get contentScaleFactor() {
    let t2 = 1;
    if (!this.hls.config.ignoreDevicePixelRatio) try {
      t2 = self.devicePixelRatio;
    } catch (t3) {
    }
    return Math.min(t2, this.hls.config.maxDevicePixelRatio);
  }
  isLevelAllowed(t2) {
    return !this.restrictedLevels.some((e2) => t2.bitrate === e2.bitrate && t2.width === e2.width && t2.height === e2.height);
  }
  static getMaxLevelByMediaSize(t2, e2, s2) {
    if (null == t2 || !t2.length) return -1;
    const i2 = (t3, e3) => !e3 || t3.width !== e3.width || t3.height !== e3.height;
    let r2 = t2.length - 1;
    const n2 = Math.max(e2, s2);
    for (let e3 = 0; e3 < t2.length; e3 += 1) {
      const s3 = t2[e3];
      if ((s3.width >= n2 || s3.height >= n2) && i2(s3, t2[e3 + 1])) {
        r2 = e3;
        break;
      }
    }
    return r2;
  }
}
const dr = "a", cr = "av";
class SfItem {
  constructor(t2, e2) {
    Array.isArray(t2) && (t2 = t2.map((t3) => t3 instanceof SfItem ? t3 : new SfItem(t3))), this.value = t2, this.params = e2;
  }
}
function ur(t2, e2, s2) {
  return function(t3, e3, s3, i2) {
    return new Error(`failed to serialize "${r2 = e3, Array.isArray(r2) ? JSON.stringify(r2) : r2 instanceof Map ? "Map{}" : r2 instanceof Set ? "Set{}" : "object" == typeof r2 ? JSON.stringify(r2) : String(r2)}" as ${s3}`, { cause: i2 });
    var r2;
  }(0, t2, e2, s2);
}
class SfToken {
  constructor(t2) {
    this.description = t2;
  }
}
const fr = "Bare Item";
function gr(t2) {
  if (function(t3) {
    return t3 < -999999999999999 || 999999999999999 < t3;
  }(t2)) throw ur(t2, "Integer");
  return t2.toString();
}
function mr(t2, e2) {
  if (t2 < 0) return -mr(-t2, e2);
  const s2 = Math.pow(10, e2);
  if (Math.abs(t2 * s2 % 1 - 0.5) < Number.EPSILON) {
    const e3 = Math.floor(t2 * s2);
    return (e3 % 2 == 0 ? e3 : e3 + 1) / s2;
  }
  return Math.round(t2 * s2) / s2;
}
function pr(t2) {
  const e2 = mr(t2, 3);
  if (Math.floor(Math.abs(e2)).toString().length > 12) throw ur(t2, "Decimal");
  const s2 = e2.toString();
  return s2.includes(".") ? s2 : `${s2}.0`;
}
const vr = /[\x00-\x1f\x7f]+/;
function yr(t2) {
  const e2 = (s2 = t2).description || s2.toString().slice(7, -1);
  var s2;
  if (false === /^([a-zA-Z*])([!#$%&'*+\-.^_`|~\w:/]*)$/.test(e2)) throw ur(e2, "Token");
  return e2;
}
function Er(t2) {
  switch (typeof t2) {
    case "number":
      if (!r(t2)) throw ur(t2, fr);
      return Number.isInteger(t2) ? gr(t2) : pr(t2);
    case "string":
      return function(t3) {
        if (vr.test(t3)) throw ur(t3, "String");
        return `"${t3.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
      }(t2);
    case "symbol":
      return yr(t2);
    case "boolean":
      return function(t3) {
        if ("boolean" != typeof t3) throw ur(t3, "Boolean");
        return t3 ? "?1" : "?0";
      }(t2);
    case "object":
      if (t2 instanceof Date) return function(t3) {
        return `@${gr(t3.getTime() / 1e3)}`;
      }(t2);
      if (t2 instanceof Uint8Array) return function(t3) {
        if (false === ArrayBuffer.isView(t3)) throw ur(t3, "Byte Sequence");
        return `:${e2 = t3, btoa(String.fromCharCode(...e2))}:`;
        var e2;
      }(t2);
      if (t2 instanceof SfToken) return yr(t2);
    default:
      throw ur(t2, fr);
  }
}
function Tr(t2) {
  if (false === /^[a-z*][a-z0-9\-_.*]*$/.test(t2)) throw ur(t2, "Key");
  return t2;
}
function Sr(t2) {
  return null == t2 ? "" : Object.entries(t2).map(([t3, e2]) => true === e2 ? `;${Tr(t3)}` : `;${Tr(t3)}=${Er(e2)}`).join("");
}
function Lr(t2) {
  return t2 instanceof SfItem ? `${Er(t2.value)}${Sr(t2.params)}` : Er(t2);
}
function Ar(t2, e2) {
  return function(t3, e3 = { whitespace: true }) {
    if ("object" != typeof t3 || null == t3) throw ur(t3, "Dict");
    const s2 = t3 instanceof Map ? t3.entries() : Object.entries(t3), i2 = (null == e3 ? void 0 : e3.whitespace) ? " " : "";
    return Array.from(s2).map(([t4, e4]) => {
      e4 instanceof SfItem == 0 && (e4 = new SfItem(e4));
      let s3 = Tr(t4);
      var i3;
      return true === e4.value ? s3 += Sr(e4.params) : (s3 += "=", Array.isArray(e4.value) ? s3 += `(${(i3 = e4).value.map(Lr).join(" ")})${Sr(i3.params)}` : s3 += Lr(e4)), s3;
    }).join(`,${i2}`);
  }(t2, e2);
}
const Rr = "CMCD-Object", br = "CMCD-Request", Ir = "CMCD-Session", kr = "CMCD-Status", Pr = { br: Rr, ab: Rr, d: Rr, ot: Rr, tb: Rr, tpb: Rr, lb: Rr, tab: Rr, lab: Rr, url: Rr, pb: br, bl: br, tbl: br, dl: br, ltc: br, mtp: br, nor: br, nrr: br, rc: br, sn: br, sta: br, su: br, ttfb: br, ttfbb: br, ttlb: br, cmsdd: br, cmsds: br, smrt: br, df: br, cs: br, ts: br, cid: Ir, pr: Ir, sf: Ir, sid: Ir, st: Ir, v: Ir, msd: Ir, bs: kr, bsd: kr, cdn: kr, rtp: kr, bg: kr, pt: kr, ec: kr, e: kr }, Dr = br, _r = "event", Cr = (t2) => Math.round(t2), wr = (t2, e2) => Array.isArray(t2) ? t2.map((t3) => wr(t3, e2)) : t2 instanceof SfItem && "string" == typeof t2.value ? new SfItem(wr(t2.value, e2), t2.params) : (e2.baseUrl && (t2 = function(t3, e3) {
  const s2 = new URL(t3), i2 = new URL(e3);
  if (s2.origin !== i2.origin) return t3;
  const r2 = s2.pathname.split("/").slice(1), n2 = i2.pathname.split("/").slice(1, -1);
  for (; r2[0] === n2[0]; ) r2.shift(), n2.shift();
  for (; n2.length; ) n2.shift(), r2.unshift("..");
  return r2.join("/") + s2.search + s2.hash;
}(t2, e2.baseUrl)), 1 === e2.version ? encodeURIComponent(t2) : t2), Mr = (t2) => 100 * Cr(t2 / 100), xr = { br: Cr, d: Cr, bl: Mr, dl: Mr, mtp: Mr, nor: (t2, e2) => {
  let s2 = t2;
  return e2.version >= 2 && (t2 instanceof SfItem && "string" == typeof t2.value ? s2 = new SfItem([t2]) : "string" == typeof t2 && (s2 = [t2])), wr(s2, e2);
}, rtp: Mr, tb: Cr }, Or = "request", Fr = "response", Nr = ["ab", "bg", "bl", "br", "bs", "bsd", "cdn", "cid", "cs", "df", "ec", "lab", "lb", "ltc", "msd", "mtp", "pb", "pr", "pt", "sf", "sid", "sn", "st", "sta", "tab", "tb", "tbl", "tpb", "ts", "v"], Br = ["e"], $r = /^[a-zA-Z0-9-.]+-[a-zA-Z0-9-.]+$/;
function Ur(t2) {
  return $r.test(t2);
}
const Gr = ["d", "dl", "nor", "ot", "rtp", "su"], Kr = ["cmsdd", "cmsds", "rc", "smrt", "ttfb", "ttfbb", "ttlb", "url"], Hr = ["bl", "br", "bs", "cid", "d", "dl", "mtp", "nor", "nrr", "ot", "pr", "rtp", "sf", "sid", "st", "su", "tb", "v"];
function Vr(t2) {
  return Hr.includes(t2) || Ur(t2);
}
const Yr = { [Fr]: function(t2) {
  return Nr.includes(t2) || Gr.includes(t2) || Kr.includes(t2) || Ur(t2);
}, [_r]: function(t2) {
  return Nr.includes(t2) || Br.includes(t2) || Ur(t2);
}, [Or]: function(t2) {
  return Nr.includes(t2) || Gr.includes(t2) || Ur(t2);
} };
function Wr(t2, e2 = {}) {
  const s2 = {};
  if (null == t2 || "object" != typeof t2) return s2;
  const i2 = e2.version || t2.v || 1, n2 = e2.reportingMode || Or, a2 = 1 === i2 ? Vr : Yr[n2];
  let o2 = Object.keys(t2).filter(a2);
  const l2 = e2.filter;
  "function" == typeof l2 && (o2 = o2.filter(l2));
  const h2 = n2 === Fr || n2 === _r;
  h2 && !o2.includes("ts") && o2.push("ts"), i2 > 1 && !o2.includes("v") && o2.push("v");
  const d2 = y({}, xr, e2.formatters), c2 = { version: i2, reportingMode: n2, baseUrl: e2.baseUrl };
  return o2.sort().forEach((e3) => {
    let n3 = t2[e3];
    const a3 = d2[e3];
    if ("function" == typeof a3 && (n3 = a3(n3, c2)), "v" === e3) {
      if (1 === i2) return;
      n3 = i2;
    }
    "pr" == e3 && 1 === n3 || (h2 && "ts" === e3 && !r(n3) && (n3 = Date.now()), function(t3) {
      return "number" == typeof t3 ? r(t3) : null != t3 && "" !== t3 && false !== t3;
    }(n3) && (function(t3) {
      return ["ot", "sf", "st", "e", "sta"].includes(t3);
    }(e3) && "string" == typeof n3 && (n3 = new SfToken(n3)), s2[e3] = n3));
  }), s2;
}
const jr = /CMCD=[^&#]+/;
function qr(t2, e2, s2, i2) {
  t2 && Object.keys(e2).forEach((r2) => {
    const n2 = t2.filter((t3) => t3.groupId === r2).map((t3) => {
      const n3 = y({}, t3);
      return n3.details = void 0, n3.attrs = new AttrList(n3.attrs), n3.url = n3.attrs.URI = Xr(t3.url, t3.attrs["STABLE-RENDITION-ID"], "PER-RENDITION-URIS", s2), n3.groupId = n3.attrs["GROUP-ID"] = e2[r2], n3.attrs["PATHWAY-ID"] = i2, n3;
    });
    t2.push(...n2);
  });
}
function Xr(t2, e2, s2, i2) {
  const { HOST: r2, PARAMS: n2, [s2]: a2 } = i2;
  let o2;
  e2 && (o2 = null == a2 ? void 0 : a2[e2], o2 && (t2 = o2));
  const l2 = new self.URL(t2);
  return r2 && !o2 && (l2.host = r2), n2 && Object.keys(n2).sort().forEach((t3) => {
    t3 && l2.searchParams.set(t3, n2[t3]);
  }), l2.href;
}
class EMEController extends Logger {
  constructor(t2) {
    super("eme", t2.logger), this.hls = void 0, this.config = void 0, this.media = null, this.mediaResolved = void 0, this.keyFormatPromise = null, this.keySystemAccessPromises = {}, this._requestLicenseFailureCount = 0, this.mediaKeySessions = [], this.keyIdToKeySessionPromise = {}, this.mediaKeys = null, this.setMediaKeysQueue = EMEController.CDMCleanupPromise ? [EMEController.CDMCleanupPromise] : [], this.bannedKeyIds = {}, this.onMediaEncrypted = (t3) => {
      const { initDataType: e2, initData: s2 } = t3, i2 = `"${t3.type}" event: init data type: "${e2}"`;
      if (this.debug(i2), null !== s2) {
        if (!this.keyFormatPromise) {
          let t4 = Object.keys(this.keySystemAccessPromises);
          t4.length || (t4 = Ve(this.config));
          const e3 = t4.map(He).filter((t5) => !!t5);
          this.keyFormatPromise = this.getKeyFormatPromise(e3);
        }
        this.keyFormatPromise.then((r2) => {
          const n2 = Ke(r2);
          if ("sinf" !== e2 || n2 !== Ne.FAIRPLAY) return void this.log(`Ignoring "${t3.type}" event with init data type: "${e2}" for selected key-system ${n2}`);
          let a2;
          try {
            const t4 = V(new Uint8Array(s2)), e3 = rt(we(JSON.parse(t4).sinf));
            if (!e3) throw new Error("'schm' box missing or not cbcs/cenc with schi > tenc");
            a2 = new Uint8Array(e3.subarray(8, 24));
          } catch (t4) {
            return void this.warn(`${i2} Failed to parse sinf: ${t4}`);
          }
          const o2 = _(a2), { keyIdToKeySessionPromise: l2, mediaKeySessions: h2 } = this;
          let d2 = l2[o2];
          for (let t4 = 0; t4 < h2.length; t4++) {
            const i3 = h2[t4], r3 = i3.decryptdata;
            if (!r3.keyId) continue;
            const n3 = _(r3.keyId);
            if (Pe(a2, r3.keyId) || -1 !== r3.uri.replace(/-/g, "").indexOf(o2)) {
              if (d2 = l2[n3], !d2) continue;
              if (r3.pssh) break;
              delete l2[n3], r3.pssh = new Uint8Array(s2), r3.keyId = a2, d2 = l2[o2] = d2.then(() => this.generateRequestWithPreferredKeySession(i3, e2, s2, "encrypted-event-key-match")), d2.catch((t5) => this.handleError(t5));
              break;
            }
          }
          d2 || this.handleError(new Error(`Key ID ${o2} not encountered in playlist. Key-system sessions ${h2.length}.`));
        }).catch((t4) => this.handleError(t4));
      }
    }, this.onWaitingForKey = (t3) => {
      this.log(`"${t3.type}" event`);
    }, this.hls = t2, this.config = t2.config, this.registerListeners();
  }
  destroy() {
    this.onDestroying(), this.onMediaDetached();
    const t2 = this.config;
    t2.requestMediaKeySystemAccessFunc = null, t2.licenseXhrSetup = t2.licenseResponseCallback = void 0, t2.drmSystems = t2.drmSystemOptions = {}, this.hls = this.config = this.keyIdToKeySessionPromise = null, this.onMediaEncrypted = this.onWaitingForKey = null;
  }
  registerListeners() {
    this.hls.on(h.MEDIA_ATTACHED, this.onMediaAttached, this), this.hls.on(h.MEDIA_DETACHED, this.onMediaDetached, this), this.hls.on(h.MANIFEST_LOADING, this.onManifestLoading, this), this.hls.on(h.MANIFEST_LOADED, this.onManifestLoaded, this), this.hls.on(h.DESTROYING, this.onDestroying, this);
  }
  unregisterListeners() {
    this.hls.off(h.MEDIA_ATTACHED, this.onMediaAttached, this), this.hls.off(h.MEDIA_DETACHED, this.onMediaDetached, this), this.hls.off(h.MANIFEST_LOADING, this.onManifestLoading, this), this.hls.off(h.MANIFEST_LOADED, this.onManifestLoaded, this), this.hls.off(h.DESTROYING, this.onDestroying, this);
  }
  getLicenseServerUrl(t2) {
    const { drmSystems: e2, widevineLicenseUrl: s2 } = this.config, i2 = null == e2 ? void 0 : e2[t2];
    return i2 ? i2.licenseUrl : t2 === Ne.WIDEVINE && s2 ? s2 : void 0;
  }
  getLicenseServerUrlOrThrow(t2) {
    const e2 = this.getLicenseServerUrl(t2);
    if (void 0 === e2) throw new Error(`no license server URL configured for key-system "${t2}"`);
    return e2;
  }
  getServerCertificateUrl(t2) {
    const { drmSystems: e2 } = this.config, s2 = null == e2 ? void 0 : e2[t2];
    if (s2) return s2.serverCertificateUrl;
    this.log(`No Server Certificate in config.drmSystems["${t2}"]`);
  }
  attemptKeySystemAccess(t2) {
    const e2 = this.hls.levels, s2 = (t3, e3, s3) => !!t3 && s3.indexOf(t3) === e3, i2 = e2.map((t3) => t3.audioCodec).filter(s2), r2 = e2.map((t3) => t3.videoCodec).filter(s2);
    return i2.length + r2.length === 0 && r2.push("avc1.42e01e"), new Promise((e3, s3) => {
      const n2 = (t3) => {
        const a2 = t3.shift();
        this.getMediaKeysPromise(a2, i2, r2).then((t4) => e3({ keySystem: a2, mediaKeys: t4 })).catch((e4) => {
          t3.length ? n2(t3) : s3(e4 instanceof EMEKeyError ? e4 : new EMEKeyError({ type: o.KEY_SYSTEM_ERROR, details: l.KEY_SYSTEM_NO_ACCESS, error: e4, fatal: true }, e4.message));
        });
      };
      n2(t2);
    });
  }
  requestMediaKeySystemAccess(t2, e2) {
    const { requestMediaKeySystemAccessFunc: s2 } = this.config;
    if ("function" != typeof s2) {
      let t3 = `Configured requestMediaKeySystemAccess is not a function ${s2}`;
      return null === Ye && "http:" === self.location.protocol && (t3 = `navigator.requestMediaKeySystemAccess is not available over insecure protocol ${location.protocol}`), Promise.reject(new Error(t3));
    }
    return s2(t2, e2);
  }
  getMediaKeysPromise(t2, e2, s2) {
    var i2;
    const r2 = function(t3, e3, s3, i3) {
      let r3;
      switch (t3) {
        case Ne.FAIRPLAY:
          r3 = ["cenc", "sinf"];
          break;
        case Ne.WIDEVINE:
        case Ne.PLAYREADY:
          r3 = ["cenc"];
          break;
        case Ne.CLEARKEY:
          r3 = ["cenc", "keyids"];
          break;
        default:
          throw new Error(`Unknown key-system: ${t3}`);
      }
      return function(t4, e4, s4, i4) {
        return [{ initDataTypes: t4, persistentState: i4.persistentState || "optional", distinctiveIdentifier: i4.distinctiveIdentifier || "optional", sessionTypes: i4.sessionTypes || [i4.sessionType || "temporary"], audioCapabilities: e4.map((t5) => ({ contentType: `audio/mp4; codecs=${t5}`, robustness: i4.audioRobustness || "", encryptionScheme: i4.audioEncryptionScheme || null })), videoCapabilities: s4.map((t5) => ({ contentType: `video/mp4; codecs=${t5}`, robustness: i4.videoRobustness || "", encryptionScheme: i4.videoEncryptionScheme || null })) }];
      }(r3, e3, s3, i3);
    }(t2, e2, s2, this.config.drmSystemOptions || {});
    let n2 = this.keySystemAccessPromises[t2], a2 = null == (i2 = n2) ? void 0 : i2.keySystemAccess;
    if (!a2) {
      this.log(`Requesting encrypted media "${t2}" key-system access with config: ${$t(r2)}`), a2 = this.requestMediaKeySystemAccess(t2, r2);
      const e3 = n2 = this.keySystemAccessPromises[t2] = { keySystemAccess: a2 };
      return a2.catch((e4) => {
        this.log(`Failed to obtain access to key-system "${t2}": ${e4}`);
      }), a2.then((s3) => {
        this.log(`Access for key-system "${s3.keySystem}" obtained`);
        const i3 = this.fetchServerCertificate(t2);
        this.log(`Create media-keys for "${t2}"`);
        const r3 = e3.mediaKeys = s3.createMediaKeys().then((s4) => (this.log(`Media-keys created for "${t2}"`), e3.hasMediaKeys = true, i3.then((e4) => e4 ? this.setMediaKeysServerCertificate(s4, t2, e4) : s4)));
        return r3.catch((e4) => {
          this.error(`Failed to create media-keys for "${t2}"}: ${e4}`);
        }), r3;
      });
    }
    return a2.then(() => n2.mediaKeys);
  }
  createMediaKeySessionContext({ decryptdata: t2, keySystem: e2, mediaKeys: s2 }) {
    this.log(`Creating key-system session "${e2}" keyId: ${_(t2.keyId || [])} keyUri: ${t2.uri}`);
    const i2 = s2.createSession(), r2 = { decryptdata: t2, keySystem: e2, mediaKeys: s2, mediaKeysSession: i2, keyStatus: "status-pending" };
    return this.mediaKeySessions.push(r2), r2;
  }
  renewKeySession(t2) {
    const e2 = t2.decryptdata;
    if (e2.pssh) {
      const s2 = this.createMediaKeySessionContext(t2), i2 = zr(e2), r2 = "cenc";
      this.keyIdToKeySessionPromise[i2] = this.generateRequestWithPreferredKeySession(s2, r2, e2.pssh.buffer, "expired");
    } else this.warn("Could not renew expired session. Missing pssh initData.");
    this.removeSession(t2);
  }
  updateKeySession(t2, e2) {
    const s2 = t2.mediaKeysSession;
    return this.log(`Updating key-session "${s2.sessionId}" for keyId ${_(t2.decryptdata.keyId || [])}
      } (data length: ${e2.byteLength})`), s2.update(e2);
  }
  getSelectedKeySystemFormats() {
    return Object.keys(this.keySystemAccessPromises).map((t2) => ({ keySystem: t2, hasMediaKeys: this.keySystemAccessPromises[t2].hasMediaKeys })).filter(({ hasMediaKeys: t2 }) => !!t2).map(({ keySystem: t2 }) => He(t2)).filter((t2) => !!t2);
  }
  getKeySystemAccess(t2) {
    return this.getKeySystemSelectionPromise(t2).then(({ keySystem: t3, mediaKeys: e2 }) => this.attemptSetMediaKeys(t3, e2));
  }
  selectKeySystem(t2) {
    return new Promise((e2, s2) => {
      this.getKeySystemSelectionPromise(t2).then(({ keySystem: t3 }) => {
        const i2 = He(t3);
        i2 ? e2(i2) : s2(new Error(`Unable to find format for key-system "${t3}"`));
      }).catch(s2);
    });
  }
  selectKeySystemFormat(t2) {
    const e2 = Object.keys(t2.levelkeys || {});
    return this.keyFormatPromise || (this.log(`Selecting key-system from fragment (sn: ${t2.sn} ${t2.type}: ${t2.level}) key formats ${e2.join(", ")}`), this.keyFormatPromise = this.getKeyFormatPromise(e2)), this.keyFormatPromise;
  }
  getKeyFormatPromise(t2) {
    const e2 = Ve(this.config), s2 = t2.map(Ke).filter((t3) => !!t3 && -1 !== e2.indexOf(t3));
    return this.selectKeySystem(s2);
  }
  getKeyStatus(t2) {
    const { mediaKeySessions: e2 } = this;
    for (let s2 = 0; s2 < e2.length; s2++) {
      const i2 = Qr(t2, e2[s2]);
      if (i2) return i2;
    }
  }
  loadKey(t2) {
    const e2 = t2.keyInfo.decryptdata, s2 = zr(e2), i2 = this.bannedKeyIds[s2];
    if (i2 || "internal-error" === this.getKeyStatus(e2)) {
      const s3 = Zr(i2 || "internal-error", e2);
      return this.handleError(s3, t2.frag), Promise.reject(s3);
    }
    const r2 = `(keyId: ${s2} format: "${e2.keyFormat}" method: ${e2.method} uri: ${e2.uri})`;
    this.log(`Starting session for key ${r2}`);
    const n2 = this.keyIdToKeySessionPromise[s2];
    if (!n2) {
      const i3 = this.getKeySystemForKeyPromise(e2).then(({ keySystem: s3, mediaKeys: i4 }) => (this.throwIfDestroyed(), this.log(`Handle encrypted media sn: ${t2.frag.sn} ${t2.frag.type}: ${t2.frag.level} using key ${r2}`), this.attemptSetMediaKeys(s3, i4).then(() => (this.throwIfDestroyed(), this.createMediaKeySessionContext({ keySystem: s3, mediaKeys: i4, decryptdata: e2 }))))).then((t3) => {
        const s3 = e2.pssh ? e2.pssh.buffer : null;
        return this.generateRequestWithPreferredKeySession(t3, "cenc", s3, "playlist-key");
      });
      return i3.catch((e3) => this.handleError(e3, t2.frag)), this.keyIdToKeySessionPromise[s2] = i3, i3;
    }
    return n2.catch((s3) => {
      if (s3 instanceof EMEKeyError) {
        const i3 = T({}, s3.data);
        "internal-error" === this.getKeyStatus(e2) && (i3.decryptdata = e2);
        const r3 = new EMEKeyError(i3, s3.message);
        this.handleError(r3, t2.frag);
      }
    }), n2;
  }
  throwIfDestroyed(t2 = "Invalid state") {
    if (!this.hls) throw new Error("invalid state");
  }
  handleError(t2, e2) {
    if (this.hls) if (t2 instanceof EMEKeyError) {
      e2 && (t2.data.frag = e2);
      const s2 = t2.data.decryptdata;
      this.error(`${t2.message}${s2 ? ` (${_(s2.keyId || [])})` : ""}`), this.hls.trigger(h.ERROR, t2.data);
    } else this.error(t2.message), this.hls.trigger(h.ERROR, { type: o.KEY_SYSTEM_ERROR, details: l.KEY_SYSTEM_NO_KEYS, error: t2, fatal: true });
  }
  getKeySystemForKeyPromise(t2) {
    const e2 = zr(t2), s2 = this.keyIdToKeySessionPromise[e2];
    if (!s2) {
      const e3 = Ke(t2.keyFormat), s3 = e3 ? [e3] : Ve(this.config);
      return this.attemptKeySystemAccess(s3);
    }
    return s2;
  }
  getKeySystemSelectionPromise(t2) {
    if (t2.length || (t2 = Ve(this.config)), 0 === t2.length) throw new EMEKeyError({ type: o.KEY_SYSTEM_ERROR, details: l.KEY_SYSTEM_NO_CONFIGURED_LICENSE, fatal: true }, `Missing key-system license configuration options ${$t({ drmSystems: this.config.drmSystems })}`);
    return this.attemptKeySystemAccess(t2);
  }
  attemptSetMediaKeys(t2, e2) {
    if (this.mediaResolved = void 0, this.mediaKeys === e2) return Promise.resolve();
    const s2 = this.setMediaKeysQueue.slice();
    this.log(`Setting media-keys for "${t2}"`);
    const i2 = Promise.all(s2).then(() => this.media ? this.media.setMediaKeys(e2) : new Promise((t3, s3) => {
      this.mediaResolved = () => {
        if (this.mediaResolved = void 0, !this.media) return s3(new Error("Attempted to set mediaKeys without media element attached"));
        this.mediaKeys = e2, this.media.setMediaKeys(e2).then(t3).catch(s3);
      };
    }));
    return this.mediaKeys = e2, this.setMediaKeysQueue.push(i2), i2.then(() => {
      this.log(`Media-keys set for "${t2}"`), s2.push(i2), this.setMediaKeysQueue = this.setMediaKeysQueue.filter((t3) => -1 === s2.indexOf(t3));
    });
  }
  generateRequestWithPreferredKeySession(t2, e2, s2, i2) {
    var r2;
    const n2 = null == (r2 = this.config.drmSystems) || null == (r2 = r2[t2.keySystem]) ? void 0 : r2.generateRequest;
    if (n2) try {
      const i3 = n2.call(this.hls, e2, s2, t2);
      if (!i3) throw new Error("Invalid response from configured generateRequest filter");
      e2 = i3.initDataType, s2 = i3.initData ? i3.initData : null, t2.decryptdata.pssh = s2 ? new Uint8Array(s2) : null;
    } catch (t3) {
      if (this.warn(t3.message), this.hls && this.hls.config.debug) throw t3;
    }
    if (null === s2) return this.log(`Skipping key-session request for "${i2}" (no initData)`), Promise.resolve(t2);
    const a2 = zr(t2.decryptdata), h2 = t2.decryptdata.uri;
    this.log(`Generating key-session request for "${i2}" keyId: ${a2} URI: ${h2} (init data type: ${e2} length: ${s2.byteLength})`);
    const d2 = new js(), c2 = t2._onmessage = (e3) => {
      const s3 = t2.mediaKeysSession;
      if (!s3) return void d2.emit("error", new Error("invalid state"));
      const { messageType: i3, message: r3 } = e3;
      this.log(`"${i3}" message event for session "${s3.sessionId}" message size: ${r3.byteLength}`), "license-request" === i3 || "license-renewal" === i3 ? this.renewLicense(t2, r3).catch((t3) => {
        d2.eventNames().length ? d2.emit("error", t3) : this.handleError(t3);
      }) : "license-release" === i3 ? t2.keySystem === Ne.FAIRPLAY && this.updateKeySession(t2, Me("acknowledged")).then(() => this.removeSession(t2)).catch((t3) => this.handleError(t3)) : this.warn(`unhandled media key message type "${i3}"`);
    }, u2 = (t3, e3) => {
      let s3;
      e3.keyStatus = t3, t3.startsWith("usable") ? d2.emit("resolved") : "internal-error" === t3 || "output-restricted" === t3 || "output-downscaled" === t3 ? s3 = Zr(t3, e3.decryptdata) : "expired" === t3 ? s3 = new Error(`key expired (keyId: ${a2})`) : "released" === t3 ? s3 = new Error("key released") : "status-pending" === t3 || this.warn(`unhandled key status change "${t3}" (keyId: ${a2})`), s3 && (d2.eventNames().length ? d2.emit("error", s3) : this.handleError(s3));
    }, f2 = t2._onkeystatuseschange = (e3) => {
      if (!t2.mediaKeysSession) return void d2.emit("error", new Error("invalid state"));
      const s3 = this.getKeyStatuses(t2);
      if (!Object.keys(s3).some((t3) => "status-pending" !== s3[t3])) return;
      if ("expired" === s3[a2]) return this.log(`Expired key ${$t(s3)} in key-session "${t2.mediaKeysSession.sessionId}"`), void this.renewKeySession(t2);
      let i3 = s3[a2];
      if (i3) u2(i3, t2);
      else {
        var r3;
        const e4 = 1e3;
        t2.keyStatusTimeouts || (t2.keyStatusTimeouts = {}), (r3 = t2.keyStatusTimeouts)[a2] || (r3[a2] = self.setTimeout(() => {
          if (!t2.mediaKeysSession || !this.mediaKeys) return;
          const s4 = this.getKeyStatus(t2.decryptdata);
          if (s4 && "status-pending" !== s4) return this.log(`No status for keyId ${a2} in key-session "${t2.mediaKeysSession.sessionId}". Using session key-status ${s4} from other session.`), u2(s4, t2);
          this.log(`key status for ${a2} in key-session "${t2.mediaKeysSession.sessionId}" timed out after ${e4}ms`), i3 = "internal-error", u2(i3, t2);
        }, e4)), this.log(`No status for keyId ${a2} (${$t(s3)}).`);
      }
    };
    Ds(t2.mediaKeysSession, "message", c2), Ds(t2.mediaKeysSession, "keystatuseschange", f2);
    const g2 = new Promise((t3, e3) => {
      d2.on("error", e3), d2.on("resolved", t3);
    });
    return t2.mediaKeysSession.generateRequest(e2, s2).then(() => {
      this.log(`Request generated for key-session "${t2.mediaKeysSession.sessionId}" keyId: ${a2} URI: ${h2}`);
    }).catch((e3) => {
      throw new EMEKeyError({ type: o.KEY_SYSTEM_ERROR, details: l.KEY_SYSTEM_NO_SESSION, error: e3, decryptdata: t2.decryptdata, fatal: false }, `Error generating key-session request: ${e3}`);
    }).then(() => g2).catch((e3) => (d2.removeAllListeners(), this.removeSession(t2).then(() => {
      throw e3;
    }))).then(() => (d2.removeAllListeners(), t2));
  }
  getKeyStatuses(t2) {
    const e2 = {};
    return t2.mediaKeysSession.keyStatuses.forEach((s2, i2) => {
      if ("string" == typeof i2 && "object" == typeof s2) {
        const t3 = i2;
        i2 = s2, s2 = t3;
      }
      const r2 = "buffer" in i2 ? new Uint8Array(i2.buffer, i2.byteOffset, i2.byteLength) : new Uint8Array(i2);
      if (t2.keySystem === Ne.PLAYREADY && 16 === r2.length) {
        const t3 = _(r2);
        e2[t3] = s2, xe(r2);
      }
      const n2 = _(r2);
      "internal-error" === s2 && (this.bannedKeyIds[n2] = s2), this.log(`key status change "${s2}" for keyStatuses keyId: ${n2} key-session "${t2.mediaKeysSession.sessionId}"`), e2[n2] = s2;
    }), e2;
  }
  fetchServerCertificate(t2) {
    const e2 = this.config, s2 = new (0, e2.loader)(e2), i2 = this.getServerCertificateUrl(t2);
    return i2 ? (this.log(`Fetching server certificate for "${t2}"`), new Promise((r2, n2) => {
      const a2 = { responseType: "arraybuffer", url: i2 }, h2 = e2.certLoadPolicy.default, d2 = { loadPolicy: h2, timeout: h2.maxLoadTimeMs, maxRetry: 0, retryDelay: 0, maxRetryDelay: 0 }, c2 = { onSuccess: (t3, e3, s3, i3) => {
        r2(t3.data);
      }, onError: (e3, s3, r3, h3) => {
        n2(new EMEKeyError({ type: o.KEY_SYSTEM_ERROR, details: l.KEY_SYSTEM_SERVER_CERTIFICATE_REQUEST_FAILED, fatal: true, networkDetails: r3, response: T({ url: a2.url, data: void 0 }, e3) }, `"${t2}" certificate request failed (${i2}). Status: ${e3.code} (${e3.text})`));
      }, onTimeout: (e3, s3, r3) => {
        n2(new EMEKeyError({ type: o.KEY_SYSTEM_ERROR, details: l.KEY_SYSTEM_SERVER_CERTIFICATE_REQUEST_FAILED, fatal: true, networkDetails: r3, response: { url: a2.url, data: void 0 } }, `"${t2}" certificate request timed out (${i2})`));
      }, onAbort: (t3, e3, s3) => {
        n2(new Error("aborted"));
      } };
      s2.load(a2, d2, c2);
    })) : Promise.resolve();
  }
  setMediaKeysServerCertificate(t2, e2, s2) {
    return new Promise((i2, r2) => {
      t2.setServerCertificate(s2).then((r3) => {
        this.log(`setServerCertificate ${r3 ? "success" : "not supported by CDM"} (${s2.byteLength}) on "${e2}"`), i2(t2);
      }).catch((t3) => {
        r2(new EMEKeyError({ type: o.KEY_SYSTEM_ERROR, details: l.KEY_SYSTEM_SERVER_CERTIFICATE_UPDATE_FAILED, error: t3, fatal: true }, t3.message));
      });
    });
  }
  renewLicense(t2, e2) {
    return this.requestLicense(t2, new Uint8Array(e2)).then((e3) => this.updateKeySession(t2, new Uint8Array(e3)).catch((e4) => {
      throw new EMEKeyError({ type: o.KEY_SYSTEM_ERROR, details: l.KEY_SYSTEM_SESSION_UPDATE_FAILED, decryptdata: t2.decryptdata, error: e4, fatal: false }, e4.message);
    }));
  }
  unpackPlayReadyKeyMessage(t2, e2) {
    const s2 = String.fromCharCode.apply(null, new Uint16Array(e2.buffer));
    if (!s2.includes("PlayReadyKeyMessage")) return t2.setRequestHeader("Content-Type", "text/xml; charset=utf-8"), e2;
    const i2 = new DOMParser().parseFromString(s2, "application/xml"), r2 = i2.querySelectorAll("HttpHeader");
    if (r2.length > 0) {
      let e3;
      for (let s3 = 0, i3 = r2.length; s3 < i3; s3++) {
        var n2, a2;
        e3 = r2[s3];
        const i4 = null == (n2 = e3.querySelector("name")) ? void 0 : n2.textContent, o3 = null == (a2 = e3.querySelector("value")) ? void 0 : a2.textContent;
        i4 && o3 && t2.setRequestHeader(i4, o3);
      }
    }
    const o2 = i2.querySelector("Challenge"), l2 = null == o2 ? void 0 : o2.textContent;
    if (!l2) throw new Error("Cannot find <Challenge> in key message");
    return Me(atob(l2));
  }
  setupLicenseXHR(t2, e2, s2, i2) {
    const r2 = this.config.licenseXhrSetup;
    return r2 ? Promise.resolve().then(() => {
      if (!s2.decryptdata) throw new Error("Key removed");
      return r2.call(this.hls, t2, e2, s2, i2);
    }).catch((n2) => {
      if (!s2.decryptdata) throw n2;
      return t2.open("POST", e2, true), r2.call(this.hls, t2, e2, s2, i2);
    }).then((s3) => (t2.readyState || t2.open("POST", e2, true), { xhr: t2, licenseChallenge: s3 || i2 })) : (t2.open("POST", e2, true), Promise.resolve({ xhr: t2, licenseChallenge: i2 }));
  }
  requestLicense(t2, e2) {
    const s2 = this.config.keyLoadPolicy.default;
    return new Promise((i2, r2) => {
      const n2 = this.getLicenseServerUrlOrThrow(t2.keySystem);
      this.log(`Sending license request to URL: ${n2}`);
      const a2 = new XMLHttpRequest();
      a2.responseType = "arraybuffer", a2.onreadystatechange = () => {
        if (!this.hls || !t2.mediaKeysSession) return r2(new Error("invalid state"));
        if (4 === a2.readyState) if (200 === a2.status) {
          this._requestLicenseFailureCount = 0;
          let e3 = a2.response;
          this.log(`License received ${e3 instanceof ArrayBuffer ? e3.byteLength : e3}`);
          const s3 = this.config.licenseResponseCallback;
          if (s3) try {
            e3 = s3.call(this.hls, a2, n2, t2);
          } catch (t3) {
            this.error(t3);
          }
          i2(e3);
        } else {
          const h2 = s2.errorRetry, d2 = h2 ? h2.maxNumRetry : 0;
          if (this._requestLicenseFailureCount++, this._requestLicenseFailureCount > d2 || a2.status >= 400 && a2.status < 500) r2(new EMEKeyError({ type: o.KEY_SYSTEM_ERROR, details: l.KEY_SYSTEM_LICENSE_REQUEST_FAILED, decryptdata: t2.decryptdata, fatal: true, networkDetails: a2, response: { url: n2, data: void 0, code: a2.status, text: a2.statusText } }, `License Request XHR failed (${n2}). Status: ${a2.status} (${a2.statusText})`));
          else {
            const s3 = d2 - this._requestLicenseFailureCount + 1;
            this.warn(`Retrying license request, ${s3} attempts left`), this.requestLicense(t2, e2).then(i2, r2);
          }
        }
      }, t2.licenseXhr && t2.licenseXhr.readyState !== XMLHttpRequest.DONE && t2.licenseXhr.abort(), t2.licenseXhr = a2, this.setupLicenseXHR(a2, n2, t2, e2).then(({ xhr: e3, licenseChallenge: s3 }) => {
        t2.keySystem == Ne.PLAYREADY && (s3 = this.unpackPlayReadyKeyMessage(e3, s3)), e3.send(s3);
      }).catch(r2);
    });
  }
  onDestroying() {
    this.unregisterListeners(), this._clear();
  }
  onMediaAttached(t2, e2) {
    if (!this.config.emeEnabled) return;
    const s2 = e2.media;
    this.media = s2, Ds(s2, "encrypted", this.onMediaEncrypted), Ds(s2, "waitingforkey", this.onWaitingForKey);
    const i2 = this.mediaResolved;
    i2 ? i2() : this.mediaKeys = s2.mediaKeys;
  }
  onMediaDetached() {
    const t2 = this.media;
    t2 && (_s(t2, "encrypted", this.onMediaEncrypted), _s(t2, "waitingforkey", this.onWaitingForKey), this.media = null, this.mediaKeys = null);
  }
  _clear() {
    var t2;
    this._requestLicenseFailureCount = 0, this.keyIdToKeySessionPromise = {}, this.bannedKeyIds = {};
    const e2 = this.mediaResolved;
    if (e2 && e2(), !this.mediaKeys && !this.mediaKeySessions.length) return;
    const s2 = this.media, i2 = this.mediaKeySessions.slice();
    this.mediaKeySessions = [], this.mediaKeys = null, LevelKey.clearKeyUriToKeyIdMap();
    const r2 = i2.length;
    EMEController.CDMCleanupPromise = Promise.all(i2.map((t3) => this.removeSession(t3)).concat((null == s2 || null == (t2 = s2.setMediaKeys(null)) ? void 0 : t2.catch((t3) => {
      this.log(`Could not clear media keys: ${t3}`), this.hls && this.hls.trigger(h.ERROR, { type: o.OTHER_ERROR, details: l.KEY_SYSTEM_DESTROY_MEDIA_KEYS_ERROR, fatal: false, error: new Error(`Could not clear media keys: ${t3}`) });
    })) || Promise.resolve())).catch((t3) => {
      this.log(`Could not close sessions and clear media keys: ${t3}`), this.hls && this.hls.trigger(h.ERROR, { type: o.OTHER_ERROR, details: l.KEY_SYSTEM_DESTROY_CLOSE_SESSION_ERROR, fatal: false, error: new Error(`Could not close sessions and clear media keys: ${t3}`) });
    }).then(() => {
      r2 && this.log("finished closing key sessions and clearing media keys");
    });
  }
  onManifestLoading() {
    this._clear();
  }
  onManifestLoaded(t2, { sessionKeys: e2 }) {
    if (e2 && this.config.emeEnabled && !this.keyFormatPromise) {
      const t3 = e2.reduce((t4, e3) => (-1 === t4.indexOf(e3.keyFormat) && t4.push(e3.keyFormat), t4), []);
      this.log(`Selecting key-system from session-keys ${t3.join(", ")}`), this.keyFormatPromise = this.getKeyFormatPromise(t3);
    }
  }
  removeSession(t2) {
    const { mediaKeysSession: e2, licenseXhr: s2, decryptdata: i2 } = t2;
    if (e2) {
      this.log(`Remove licenses and keys and close session "${e2.sessionId}" keyId: ${_((null == i2 ? void 0 : i2.keyId) || [])}`), t2._onmessage && (e2.removeEventListener("message", t2._onmessage), t2._onmessage = void 0), t2._onkeystatuseschange && (e2.removeEventListener("keystatuseschange", t2._onkeystatuseschange), t2._onkeystatuseschange = void 0), s2 && s2.readyState !== XMLHttpRequest.DONE && s2.abort(), t2.mediaKeysSession = t2.decryptdata = t2.licenseXhr = void 0;
      const r2 = this.mediaKeySessions.indexOf(t2);
      r2 > -1 && this.mediaKeySessions.splice(r2, 1);
      const { keyStatusTimeouts: n2 } = t2;
      n2 && Object.keys(n2).forEach((t3) => self.clearTimeout(n2[t3]));
      const { drmSystemOptions: a2 } = this.config, d2 = function(t3) {
        var e3;
        return !(!t3 || "persistent-license" !== t3.sessionType && (null == (e3 = t3.sessionTypes) || !e3.some((t4) => "persistent-license" === t4)));
      }(a2) ? new Promise((t3, s3) => {
        self.setTimeout(() => s3(new Error("MediaKeySession.remove() timeout")), 8e3), e2.remove().then(t3).catch(s3);
      }) : Promise.resolve();
      return d2.catch((t3) => {
        this.log(`Could not remove session: ${t3}`), this.hls && this.hls.trigger(h.ERROR, { type: o.OTHER_ERROR, details: l.KEY_SYSTEM_DESTROY_REMOVE_SESSION_ERROR, fatal: false, error: new Error(`Could not remove session: ${t3}`) });
      }).then(() => e2.close()).catch((t3) => {
        this.log(`Could not close session: ${t3}`), this.hls && this.hls.trigger(h.ERROR, { type: o.OTHER_ERROR, details: l.KEY_SYSTEM_DESTROY_CLOSE_SESSION_ERROR, fatal: false, error: new Error(`Could not close session: ${t3}`) });
      });
    }
    return Promise.resolve();
  }
}
function zr(t2) {
  if (!t2) throw new Error("Could not read keyId of undefined decryptdata");
  if (null === t2.keyId) throw new Error("keyId is null");
  return _(t2.keyId);
}
function Qr(t2, e2) {
  return t2.keyId && e2.mediaKeysSession.keyStatuses.has(t2.keyId) ? e2.mediaKeysSession.keyStatuses.get(t2.keyId) : t2.matches(e2.decryptdata) ? e2.keyStatus : void 0;
}
EMEController.CDMCleanupPromise = void 0;
class EMEKeyError extends Error {
  constructor(t2, e2) {
    super(e2), this.data = void 0, t2.error || (t2.error = new Error(e2)), this.data = t2, t2.err = t2.error;
  }
}
function Zr(t2, e2) {
  const s2 = "output-restricted" === t2, i2 = s2 ? l.KEY_SYSTEM_STATUS_OUTPUT_RESTRICTED : l.KEY_SYSTEM_STATUS_INTERNAL_ERROR;
  return new EMEKeyError({ type: o.KEY_SYSTEM_ERROR, details: i2, fatal: false, decryptdata: e2 }, s2 ? "HDCP level output restricted" : `key status changed to "${t2}"`);
}
function Jr(t2, e2) {
  let s2;
  try {
    s2 = new Event("addtrack");
  } catch (t3) {
    s2 = document.createEvent("Event"), s2.initEvent("addtrack", false, false);
  }
  s2.track = t2, e2.dispatchEvent(s2);
}
function tn(t2, e2) {
  const s2 = t2.mode;
  if ("disabled" === s2 && (t2.mode = "hidden"), t2.cues && !t2.cues.getCueById(e2.id)) try {
    if (t2.addCue(e2), !t2.cues.getCueById(e2.id)) throw new Error(`addCue is failed for: ${e2}`);
  } catch (s3) {
    I.debug(`[texttrack-utils]: ${s3}`);
    try {
      const s4 = new self.TextTrackCue(e2.startTime, e2.endTime, e2.text);
      s4.id = e2.id, t2.addCue(s4);
    } catch (t3) {
      I.debug(`[texttrack-utils]: Legacy TextTrackCue fallback failed: ${t3}`);
    }
  }
  "disabled" === s2 && (t2.mode = s2);
}
function en(t2, e2) {
  const s2 = t2.mode;
  if ("disabled" === s2 && (t2.mode = "hidden"), t2.cues) for (let s3 = t2.cues.length; s3--; ) e2 && t2.cues[s3].removeEventListener("enter", e2), t2.removeCue(t2.cues[s3]);
  "disabled" === s2 && (t2.mode = s2);
}
function sn(t2, e2, s2, i2) {
  const r2 = t2.mode;
  if ("disabled" === r2 && (t2.mode = "hidden"), t2.cues && t2.cues.length > 0) {
    const r3 = function(t3, e3, s3) {
      const i3 = [], r4 = function(t4, e4) {
        if (e4 <= t4[0].startTime) return 0;
        const s4 = t4.length - 1;
        if (e4 > t4[s4].endTime) return -1;
        let i4, r5 = 0, n2 = s4;
        for (; r5 <= n2; ) if (i4 = Math.floor((n2 + r5) / 2), e4 < t4[i4].startTime) n2 = i4 - 1;
        else {
          if (!(e4 > t4[i4].startTime && r5 < s4)) return i4;
          r5 = i4 + 1;
        }
        return t4[r5].startTime - e4 < e4 - t4[n2].startTime ? r5 : n2;
      }(t3, e3);
      if (r4 > -1) for (let n2 = r4, a2 = t3.length; n2 < a2; n2++) {
        const r5 = t3[n2];
        if (r5.startTime >= e3 && r5.endTime <= s3) i3.push(r5);
        else if (r5.startTime > s3) return i3;
      }
      return i3;
    }(t2.cues, e2, s2);
    for (let e3 = 0; e3 < r3.length; e3++) i2 && !i2(r3[e3]) || t2.removeCue(r3[e3]);
  }
  "disabled" === r2 && (t2.mode = r2);
}
function rn(t2) {
  const e2 = [];
  for (let s2 = 0; s2 < t2.length; s2++) {
    const i2 = t2[s2];
    "subtitles" !== i2.kind && "captions" !== i2.kind || !i2.label || e2.push(t2[s2]);
  }
  return e2;
}
function nn(t2) {
  let e2 = 5381, s2 = t2.length;
  for (; s2; ) e2 = 33 * e2 ^ t2.charCodeAt(--s2);
  return (e2 >>> 0).toString();
}
const an = 0.025;
let on = function(t2) {
  return t2[t2.Point = 0] = "Point", t2[t2.Range = 1] = "Range", t2;
}({});
function ln(t2, e2, s2) {
  return `${t2.identifier}-${s2 + 1}-${nn(e2)}`;
}
class InterstitialEvent {
  constructor(t2, e2) {
    this.base = void 0, this._duration = null, this._timelineStart = null, this.appendInPlaceDisabled = void 0, this.appendInPlaceStarted = void 0, this.dateRange = void 0, this.hasPlayed = false, this.cumulativeDuration = 0, this.resumeOffset = NaN, this.playoutLimit = NaN, this.restrictions = { skip: false, jump: false }, this.snapOptions = { out: false, in: false }, this.assetList = [], this.assetListLoader = void 0, this.assetListResponse = null, this.resumeAnchor = void 0, this.error = void 0, this.resetOnResume = void 0, this.base = e2, this.dateRange = t2, this.setDateRange(t2);
  }
  setDateRange(t2) {
    this.dateRange = t2, this.resumeOffset = t2.attr.optionalFloat("X-RESUME-OFFSET", this.resumeOffset), this.playoutLimit = t2.attr.optionalFloat("X-PLAYOUT-LIMIT", this.playoutLimit), this.restrictions = t2.attr.enumeratedStringList("X-RESTRICT", this.restrictions), this.snapOptions = t2.attr.enumeratedStringList("X-SNAP", this.snapOptions);
  }
  reset() {
    var t2;
    this.appendInPlaceStarted = false, null == (t2 = this.assetListLoader) || t2.destroy(), this.assetListLoader = void 0, this.supplementsPrimary || (this.assetListResponse = null, this.assetList = [], this._duration = null);
  }
  isAssetPastPlayoutLimit(t2) {
    var e2;
    if (t2 > 0 && t2 >= this.assetList.length) return true;
    const s2 = this.playoutLimit;
    return !(t2 <= 0 || isNaN(s2)) && (0 === s2 || ((null == (e2 = this.assetList[t2]) ? void 0 : e2.startOffset) || 0) > s2);
  }
  findAssetIndex(t2) {
    return this.assetList.indexOf(t2);
  }
  get identifier() {
    return this.dateRange.id;
  }
  get startDate() {
    return this.dateRange.startDate;
  }
  get startTime() {
    const t2 = this.dateRange.startTime;
    if (this.snapOptions.out) {
      const e2 = this.dateRange.tagAnchor;
      if (e2) return hn(t2, e2);
    }
    return t2;
  }
  get startOffset() {
    return this.cue.pre ? 0 : this.startTime;
  }
  get startIsAligned() {
    if (0 === this.startTime || this.snapOptions.out) return true;
    const t2 = this.dateRange.tagAnchor;
    if (t2) {
      const e2 = this.dateRange.startTime;
      return e2 - hn(e2, t2) < 0.1;
    }
    return false;
  }
  get resumptionOffset() {
    const t2 = this.resumeOffset, e2 = r(t2) ? t2 : this.duration;
    return this.cumulativeDuration + e2;
  }
  get resumeTime() {
    const t2 = this.startOffset + this.resumptionOffset;
    if (this.snapOptions.in) {
      const e2 = this.resumeAnchor;
      if (e2) return hn(t2, e2);
    }
    return t2;
  }
  get appendInPlace() {
    return !!this.appendInPlaceStarted || !this.appendInPlaceDisabled && !(this.cue.once || this.cue.pre || !this.startIsAligned || !(isNaN(this.playoutLimit) && isNaN(this.resumeOffset) || this.resumeOffset && this.duration && Math.abs(this.resumeOffset - this.duration) < an));
  }
  set appendInPlace(t2) {
    this.appendInPlaceStarted ? this.resetOnResume = !t2 : this.appendInPlaceDisabled = !t2;
  }
  get timelineStart() {
    return null !== this._timelineStart ? this._timelineStart : this.startTime;
  }
  set timelineStart(t2) {
    this._timelineStart = t2;
  }
  get duration() {
    const t2 = this.playoutLimit;
    let e2;
    return e2 = null !== this._duration ? this._duration : this.dateRange.duration ? this.dateRange.duration : this.dateRange.plannedDuration || 0, !isNaN(t2) && t2 < e2 && (e2 = t2), e2;
  }
  set duration(t2) {
    this._duration = t2;
  }
  get cue() {
    return this.dateRange.cue;
  }
  get timelineOccupancy() {
    return "RANGE" === this.dateRange.attr["X-TIMELINE-OCCUPIES"] ? on.Range : on.Point;
  }
  get supplementsPrimary() {
    return "PRIMARY" === this.dateRange.attr["X-TIMELINE-STYLE"];
  }
  get contentMayVary() {
    return "NO" !== this.dateRange.attr["X-CONTENT-MAY-VARY"];
  }
  get assetUrl() {
    return this.dateRange.attr["X-ASSET-URI"];
  }
  get assetListUrl() {
    return this.dateRange.attr["X-ASSET-LIST"];
  }
  get baseUrl() {
    return this.base.url;
  }
  get assetListLoaded() {
    return this.assetList.length > 0 || null !== this.assetListResponse;
  }
  toString() {
    return `["${(t2 = this).identifier}" ${t2.cue.pre ? "<pre>" : t2.cue.post ? "<post>" : ""}${t2.timelineStart.toFixed(2)}-${t2.resumeTime.toFixed(2)}]`;
    var t2;
  }
}
function hn(t2, e2) {
  return t2 - e2.start < e2.duration / 2 && !(Math.abs(t2 - (e2.start + e2.duration)) < an) ? e2.start : e2.start + e2.duration;
}
function dn(t2, e2, s2) {
  const i2 = new self.URL(t2, s2);
  return "data:" !== i2.protocol && i2.searchParams.set("_HLS_primary_id", e2), i2;
}
function cn(t2, e2) {
  for (; null != (s2 = t2.assetList[++e2]) && s2.error; ) var s2;
  return e2;
}
function un(t2) {
  const e2 = t2.timelineStart, s2 = t2.duration || 0;
  return `["${t2.identifier}" ${e2.toFixed(2)}-${(e2 + s2).toFixed(2)}]`;
}
class HlsAssetPlayer {
  constructor(t2, e2, s2, i2) {
    this.hls = void 0, this.interstitial = void 0, this.assetItem = void 0, this.tracks = null, this.hasDetails = false, this.mediaAttached = null, this._currentTime = void 0, this._bufferedEosTime = void 0, this.checkPlayout = () => {
      this.reachedPlayout(this.currentTime) && this.hls && this.hls.trigger(h.PLAYOUT_LIMIT_REACHED, {});
    };
    const r2 = this.hls = new t2(e2);
    this.interstitial = s2, this.assetItem = i2;
    const n2 = () => {
      this.hasDetails = true;
    };
    r2.once(h.LEVEL_LOADED, n2), r2.once(h.AUDIO_TRACK_LOADED, n2), r2.once(h.SUBTITLE_TRACK_LOADED, n2), r2.on(h.MEDIA_ATTACHING, (t3, { media: e3 }) => {
      this.removeMediaListeners(), this.mediaAttached = e3, this.interstitial.playoutLimit && (e3.addEventListener("timeupdate", this.checkPlayout), this.appendInPlace && r2.on(h.BUFFER_APPENDED, () => {
        const t4 = this.bufferedEnd;
        this.reachedPlayout(t4) && (this._bufferedEosTime = t4, r2.trigger(h.BUFFERED_TO_END, void 0));
      }));
    });
  }
  get appendInPlace() {
    return this.interstitial.appendInPlace;
  }
  loadSource() {
    const t2 = this.hls;
    if (t2) if (t2.url) t2.levels.length && !t2.started && t2.startLoad(-1, true);
    else {
      let e2 = this.assetItem.uri;
      try {
        e2 = dn(e2, t2.config.primarySessionId || "").href;
      } catch (t3) {
      }
      t2.loadSource(e2);
    }
  }
  bufferedInPlaceToEnd(t2) {
    var e2;
    if (!this.appendInPlace) return false;
    if (null != (e2 = this.hls) && e2.bufferedToEnd) return true;
    if (!t2) return false;
    const s2 = Math.min(this._bufferedEosTime || 1 / 0, this.duration), i2 = this.timelineOffset, r2 = BufferHelper.bufferInfo(t2, i2, 0);
    return this.getAssetTime(r2.end) >= s2 - 0.02;
  }
  reachedPlayout(t2) {
    const e2 = this.interstitial.playoutLimit;
    return this.startOffset + t2 >= e2;
  }
  get destroyed() {
    var t2;
    return !(null != (t2 = this.hls) && t2.userConfig);
  }
  get assetId() {
    return this.assetItem.identifier;
  }
  get interstitialId() {
    return this.assetItem.parentIdentifier;
  }
  get media() {
    var t2;
    return (null == (t2 = this.hls) ? void 0 : t2.media) || null;
  }
  get bufferedEnd() {
    const t2 = this.media || this.mediaAttached;
    if (!t2) return this._bufferedEosTime ? this._bufferedEosTime : this.currentTime;
    const e2 = BufferHelper.bufferInfo(t2, t2.currentTime, 1e-3);
    return this.getAssetTime(e2.end);
  }
  get currentTime() {
    const t2 = this.media || this.mediaAttached;
    return t2 ? this.getAssetTime(t2.currentTime) : this._currentTime || 0;
  }
  get duration() {
    const t2 = this.assetItem.duration;
    if (!t2) return 0;
    const e2 = this.interstitial.playoutLimit;
    if (e2) {
      const s2 = e2 - this.startOffset;
      if (s2 > 0 && s2 < t2) return s2;
    }
    return t2;
  }
  get remaining() {
    const t2 = this.duration;
    return t2 ? Math.max(0, t2 - this.currentTime) : 0;
  }
  get startOffset() {
    return this.assetItem.startOffset;
  }
  get timelineOffset() {
    var t2;
    return (null == (t2 = this.hls) ? void 0 : t2.config.timelineOffset) || 0;
  }
  set timelineOffset(t2) {
    const e2 = this.timelineOffset;
    if (t2 !== e2) {
      const s2 = t2 - e2;
      if (Math.abs(s2) > 1 / 9e4 && this.hls) {
        if (this.hasDetails) throw new Error("Cannot set timelineOffset after playlists are loaded");
        this.hls.config.timelineOffset = t2;
      }
    }
  }
  getAssetTime(t2) {
    const e2 = this.timelineOffset, s2 = this.duration;
    return Math.min(Math.max(0, t2 - e2), s2);
  }
  removeMediaListeners() {
    const t2 = this.mediaAttached;
    t2 && (this._currentTime = t2.currentTime, this.bufferSnapShot(), t2.removeEventListener("timeupdate", this.checkPlayout));
  }
  bufferSnapShot() {
    var t2;
    this.mediaAttached && null != (t2 = this.hls) && t2.bufferedToEnd && (this._bufferedEosTime = this.bufferedEnd);
  }
  destroy() {
    this.removeMediaListeners(), this.hls && this.hls.destroy(), this.hls = null, this.tracks = this.mediaAttached = this.checkPlayout = null;
  }
  attachMedia(t2) {
    var e2;
    this.loadSource(), null == (e2 = this.hls) || e2.attachMedia(t2);
  }
  detachMedia() {
    var t2;
    this.removeMediaListeners(), this.mediaAttached = null, null == (t2 = this.hls) || t2.detachMedia();
  }
  resumeBuffering() {
    var t2;
    null == (t2 = this.hls) || t2.resumeBuffering();
  }
  pauseBuffering() {
    var t2;
    null == (t2 = this.hls) || t2.pauseBuffering();
  }
  transferMedia() {
    var t2;
    return this.bufferSnapShot(), (null == (t2 = this.hls) ? void 0 : t2.transferMedia()) || null;
  }
  resetDetails() {
    const t2 = this.hls;
    if (t2 && this.hasDetails) {
      t2.stopLoad();
      const e2 = (t3) => delete t3.details;
      t2.levels.forEach(e2), t2.allAudioTracks.forEach(e2), t2.allSubtitleTracks.forEach(e2), this.hasDetails = false;
    }
  }
  on(t2, e2, s2) {
    var i2;
    null == (i2 = this.hls) || i2.on(t2, e2);
  }
  once(t2, e2, s2) {
    var i2;
    null == (i2 = this.hls) || i2.once(t2, e2);
  }
  off(t2, e2, s2) {
    var i2;
    null == (i2 = this.hls) || i2.off(t2, e2);
  }
  toString() {
    var t2;
    return `HlsAssetPlayer: ${un(this.assetItem)} ${null == (t2 = this.hls) ? void 0 : t2.sessionId} ${this.appendInPlace ? "append-in-place" : ""}`;
  }
}
class InterstitialsSchedule extends Logger {
  constructor(t2, e2) {
    super("interstitials-sched", e2), this.onScheduleUpdate = void 0, this.eventMap = {}, this.events = null, this.items = null, this.durations = { primary: 0, playout: 0, integrated: 0 }, this.onScheduleUpdate = t2;
  }
  destroy() {
    this.reset(), this.onScheduleUpdate = null;
  }
  reset() {
    this.eventMap = {}, this.setDurations(0, 0, 0), this.events && this.events.forEach((t2) => t2.reset()), this.events = this.items = null;
  }
  resetErrorsInRange(t2, e2) {
    return this.events ? this.events.reduce((s2, i2) => t2 <= i2.startOffset && e2 > i2.startOffset ? (delete i2.error, s2 + 1) : s2, 0) : 0;
  }
  get duration() {
    const t2 = this.items;
    return t2 ? t2[t2.length - 1].end : 0;
  }
  get length() {
    return this.items ? this.items.length : 0;
  }
  getEvent(t2) {
    return t2 && this.eventMap[t2] || null;
  }
  hasEvent(t2) {
    return t2 in this.eventMap;
  }
  findItemIndex(t2, e2) {
    if (t2.event) return this.findEventIndex(t2.event.identifier);
    let s2 = -1;
    t2.nextEvent ? s2 = this.findEventIndex(t2.nextEvent.identifier) - 1 : t2.previousEvent && (s2 = this.findEventIndex(t2.previousEvent.identifier) + 1);
    const i2 = this.items;
    if (i2) for (i2[s2] || (void 0 === e2 && (e2 = t2.start), s2 = this.findItemIndexAtTime(e2)); s2 >= 0 && null != (r2 = i2[s2]) && r2.event; ) {
      var r2;
      s2--;
    }
    return s2;
  }
  findItemIndexAtTime(t2, e2) {
    const s2 = this.items;
    if (s2) for (let i2 = 0; i2 < s2.length; i2++) {
      let r2 = s2[i2];
      if (e2 && "primary" !== e2 && (r2 = r2[e2]), t2 === r2.start || t2 > r2.start && t2 < r2.end) return i2;
    }
    return -1;
  }
  findJumpRestrictedIndex(t2, e2) {
    const s2 = this.items;
    if (s2) for (let i2 = t2; i2 <= e2 && s2[i2]; i2++) {
      const t3 = s2[i2].event;
      if (null != t3 && t3.restrictions.jump && !t3.appendInPlace) return i2;
    }
    return -1;
  }
  findEventIndex(t2) {
    const e2 = this.items;
    if (e2) for (let i2 = e2.length; i2--; ) {
      var s2;
      if ((null == (s2 = e2[i2].event) ? void 0 : s2.identifier) === t2) return i2;
    }
    return -1;
  }
  findAssetIndex(t2, e2) {
    const s2 = t2.assetList, i2 = s2.length;
    if (i2 > 1) for (let t3 = 0; t3 < i2; t3++) {
      const r2 = s2[t3];
      if (!r2.error) {
        const s3 = r2.timelineStart;
        if (e2 === s3 || e2 > s3 && (e2 < s3 + (r2.duration || 0) || t3 === i2 - 1)) return t3;
      }
    }
    return 0;
  }
  get assetIdAtEnd() {
    var t2;
    const e2 = null == (t2 = this.items) || null == (t2 = t2[this.length - 1]) ? void 0 : t2.event;
    if (e2) {
      const t3 = e2.assetList, s2 = t3[t3.length - 1];
      if (s2) return s2.identifier;
    }
    return null;
  }
  parseInterstitialDateRanges(t2, e2) {
    const s2 = t2.main.details, { dateRanges: i2 } = s2, r2 = this.events, n2 = this.parseDateRanges(i2, { url: s2.url }, e2), a2 = Object.keys(i2), o2 = r2 ? r2.filter((t3) => !a2.includes(t3.identifier)) : [];
    n2.length && n2.sort((t3, e3) => {
      const s3 = t3.cue.pre, i3 = t3.cue.post, r3 = e3.cue.pre, n3 = e3.cue.post;
      if (s3 && !r3) return -1;
      if (r3 && !s3) return 1;
      if (i3 && !n3) return 1;
      if (n3 && !i3) return -1;
      if (!(s3 || r3 || i3 || n3)) {
        const s4 = t3.startTime, i4 = e3.startTime;
        if (s4 !== i4) return s4 - i4;
      }
      return t3.dateRange.tagOrder - e3.dateRange.tagOrder;
    }), this.events = n2, o2.forEach((t3) => {
      this.removeEvent(t3);
    }), this.updateSchedule(t2, o2);
  }
  updateSchedule(t2, e2 = [], s2 = false) {
    const i2 = this.events || [];
    if (i2.length || e2.length || this.length < 2) {
      const r2 = this.items, n2 = this.parseSchedule(i2, t2);
      (s2 || e2.length || (null == r2 ? void 0 : r2.length) !== n2.length || n2.some((t3, e3) => Math.abs(t3.playout.start - r2[e3].playout.start) > 5e-3 || Math.abs(t3.playout.end - r2[e3].playout.end) > 5e-3)) && (this.items = n2, this.onScheduleUpdate(e2, r2));
    }
  }
  parseDateRanges(t2, e2, s2) {
    const i2 = [], r2 = Object.keys(t2);
    for (let n2 = 0; n2 < r2.length; n2++) {
      const a2 = r2[n2], o2 = t2[a2];
      if (o2.isInterstitial) {
        let t3 = this.eventMap[a2];
        t3 ? t3.setDateRange(o2) : (t3 = new InterstitialEvent(o2, e2), this.eventMap[a2] = t3, false === s2 && (t3.appendInPlace = s2)), i2.push(t3);
      }
    }
    return i2;
  }
  parseSchedule(t2, e2) {
    const s2 = [], i2 = e2.main.details, r2 = i2.live ? 1 / 0 : i2.edge;
    let n2 = 0;
    if ((t2 = t2.filter((t3) => !(t3.error || t3.cue.once && t3.hasPlayed))).length) {
      this.resolveOffsets(t2, e2);
      let i3 = 0, o2 = 0;
      if (t2.forEach((e3, a3) => {
        const l2 = e3.cue.pre, h2 = e3.cue.post, d2 = t2[a3 - 1] || null, c2 = e3.appendInPlace, u2 = h2 ? r2 : e3.startOffset, f2 = e3.duration, g2 = e3.timelineOccupancy === on.Range ? f2 : 0, m2 = e3.resumptionOffset, p2 = (null == d2 ? void 0 : d2.startTime) === u2, v2 = u2 + e3.cumulativeDuration;
        let y2 = c2 ? v2 + f2 : u2 + m2;
        if (l2 || !h2 && u2 <= 0) {
          const t3 = o2;
          o2 += g2, e3.timelineStart = v2;
          const i4 = n2;
          n2 += f2, s2.push({ event: e3, start: v2, end: y2, playout: { start: i4, end: n2 }, integrated: { start: t3, end: o2 } });
        } else {
          if (!(u2 <= r2)) return;
          {
            if (!p2) {
              const r4 = u2 - i3;
              if (r4 > 0.033) {
                const l4 = i3, h3 = o2;
                o2 += r4;
                const d3 = n2;
                n2 += r4;
                const c3 = { previousEvent: t2[a3 - 1] || null, nextEvent: e3, start: l4, end: l4 + r4, playout: { start: d3, end: n2 }, integrated: { start: h3, end: o2 } };
                s2.push(c3);
              } else r4 > 0 && d2 && (d2.cumulativeDuration += r4, s2[s2.length - 1].end = u2);
            }
            h2 && (y2 = v2), e3.timelineStart = v2;
            const r3 = o2;
            o2 += g2;
            const l3 = n2;
            n2 += f2, s2.push({ event: e3, start: v2, end: y2, playout: { start: l3, end: n2 }, integrated: { start: r3, end: o2 } });
          }
        }
        const E2 = e3.resumeTime;
        i3 = h2 || E2 > r2 ? r2 : E2;
      }), i3 < r2) {
        var a2;
        const t3 = i3, e3 = o2, l2 = r2 - i3;
        o2 += l2;
        const h2 = n2;
        n2 += l2, s2.push({ previousEvent: (null == (a2 = s2[s2.length - 1]) ? void 0 : a2.event) || null, nextEvent: null, start: i3, end: t3 + l2, playout: { start: h2, end: n2 }, integrated: { start: e3, end: o2 } });
      }
      this.setDurations(r2, n2, o2);
    } else {
      const t3 = 0;
      s2.push({ previousEvent: null, nextEvent: null, start: t3, end: r2, playout: { start: t3, end: r2 }, integrated: { start: t3, end: r2 } }), this.setDurations(r2, r2, r2);
    }
    return s2;
  }
  setDurations(t2, e2, s2) {
    this.durations = { primary: t2, playout: e2, integrated: s2 };
  }
  resolveOffsets(t2, e2) {
    const s2 = e2.main.details, i2 = s2.live ? 1 / 0 : s2.edge;
    let n2 = 0, a2 = -1;
    t2.forEach((o2, l2) => {
      const h2 = o2.cue.pre, d2 = o2.cue.post, c2 = h2 ? 0 : d2 ? i2 : o2.startTime;
      this.updateAssetDurations(o2), a2 === c2 ? o2.cumulativeDuration = n2 : (n2 = 0, a2 = c2), !d2 && o2.snapOptions.in && (o2.resumeAnchor = Xt(null, s2.fragments, o2.startOffset + o2.resumptionOffset, 0, 0) || void 0), o2.appendInPlace && !o2.appendInPlaceStarted && (this.primaryCanResumeInPlaceAt(o2, e2) || (o2.appendInPlace = false)), !o2.appendInPlace && l2 + 1 < t2.length && t2[l2 + 1].startTime - t2[l2].resumeTime < 0.033 && (t2[l2 + 1].appendInPlace = false, t2[l2 + 1].appendInPlace && this.warn(`Could not change append strategy for abutting event ${o2}`));
      const u2 = r(o2.resumeOffset) ? o2.resumeOffset : o2.duration;
      n2 += u2;
    });
  }
  primaryCanResumeInPlaceAt(t2, e2) {
    const s2 = t2.resumeTime, i2 = t2.startTime + t2.resumptionOffset;
    return Math.abs(s2 - i2) > an ? (this.log(`"${t2.identifier}" resumption ${s2} not aligned with estimated timeline end ${i2}`), false) : !Object.keys(e2).some((i3) => {
      const r2 = e2[i3].details, n2 = r2.edge;
      if (s2 >= n2) return this.log(`"${t2.identifier}" resumption ${s2} past ${i3} playlist end ${n2}`), false;
      const a2 = Xt(null, r2.fragments, s2);
      if (!a2) return this.log(`"${t2.identifier}" resumption ${s2} does not align with any fragments in ${i3} playlist (${r2.fragStart}-${r2.fragmentEnd})`), true;
      const o2 = "audio" === i3 ? 0.175 : 0;
      return !(Math.abs(a2.start - s2) < an + o2 || Math.abs(a2.end - s2) < an + o2 || (this.log(`"${t2.identifier}" resumption ${s2} not aligned with ${i3} fragment bounds (${a2.start}-${a2.end} sn: ${a2.sn} cc: ${a2.cc})`), 0));
    });
  }
  updateAssetDurations(t2) {
    if (!t2.assetListLoaded) return;
    const e2 = t2.timelineStart;
    let s2 = 0, i2 = false, r2 = false;
    for (let n2 = 0; n2 < t2.assetList.length; n2++) {
      const a2 = t2.assetList[n2], o2 = e2 + s2;
      a2.startOffset = s2, a2.timelineStart = o2, i2 || (i2 = null === a2.duration), r2 || (r2 = !!a2.error), s2 += a2.error ? 0 : a2.duration || 0;
    }
    t2.duration = i2 && !r2 ? Math.max(s2, t2.duration) : s2;
  }
  removeEvent(t2) {
    t2.reset(), delete this.eventMap[t2.identifier];
  }
}
function fn(t2) {
  return `[${t2.event ? '"' + t2.event.identifier + '"' : "primary"}: ${t2.start.toFixed(2)}-${t2.end.toFixed(2)}]`;
}
class AssetListLoader {
  constructor(t2) {
    this.hls = void 0, this.hls = t2;
  }
  destroy() {
    this.hls = null;
  }
  loadAssetList(t2, e2) {
    const s2 = t2.assetListUrl;
    let i2;
    try {
      i2 = dn(s2, this.hls.sessionId, t2.baseUrl);
    } catch (e3) {
      const i3 = this.assignAssetListError(t2, l.ASSET_LIST_LOAD_ERROR, e3, s2);
      return void this.hls.trigger(h.ERROR, i3);
    }
    e2 && "data:" !== i2.protocol && i2.searchParams.set("_HLS_start_offset", "" + e2);
    const r2 = this.hls.config, n2 = new (0, r2.loader)(r2), a2 = { responseType: "json", url: i2.href }, o2 = r2.interstitialAssetListLoadPolicy.default, d2 = { loadPolicy: o2, timeout: o2.maxLoadTimeMs, maxRetry: 0, retryDelay: 0, maxRetryDelay: 0 }, c2 = { onSuccess: (e3, s3, i3, r3) => {
      const n3 = e3.data, a3 = null == n3 ? void 0 : n3.ASSETS;
      if (!Array.isArray(a3)) {
        const e4 = this.assignAssetListError(t2, l.ASSET_LIST_PARSING_ERROR, new Error("Invalid interstitial asset list"), i3.url, s3, r3);
        return void this.hls.trigger(h.ERROR, e4);
      }
      t2.assetListResponse = n3, this.hls.trigger(h.ASSET_LIST_LOADED, { event: t2, assetListResponse: n3, networkDetails: r3 });
    }, onError: (e3, s3, i3, r3) => {
      const n3 = this.assignAssetListError(t2, l.ASSET_LIST_LOAD_ERROR, new Error(`Error loading X-ASSET-LIST: HTTP status ${e3.code} ${e3.text} (${s3.url})`), s3.url, r3, i3);
      this.hls.trigger(h.ERROR, n3);
    }, onTimeout: (e3, s3, i3) => {
      const r3 = this.assignAssetListError(t2, l.ASSET_LIST_LOAD_TIMEOUT, new Error(`Timeout loading X-ASSET-LIST (${s3.url})`), s3.url, e3, i3);
      this.hls.trigger(h.ERROR, r3);
    } };
    return n2.load(a2, d2, c2), this.hls.trigger(h.ASSET_LIST_LOADING, { event: t2 }), n2;
  }
  assignAssetListError(t2, e2, s2, i2, r2, n2) {
    return t2.error = s2, { type: o.NETWORK_ERROR, details: e2, fatal: false, interstitial: t2, url: i2, error: s2, networkDetails: n2, stats: r2 };
  }
}
function gn(t2) {
  var e2;
  null == t2 || null == (e2 = t2.play()) || e2.catch(() => {
  });
}
function mn(t2, e2) {
  return `[${t2}] Advancing timeline position to ${e2}`;
}
class BufferableInstance {
  constructor(t2) {
    this.buffered = void 0;
    const e2 = (e3, s2, i2) => {
      if ((s2 >>>= 0) > i2 - 1) throw new DOMException(`Failed to execute '${e3}' on 'TimeRanges': The index provided (${s2}) is greater than the maximum bound (${i2})`);
      return t2[s2][e3];
    };
    this.buffered = { get length() {
      return t2.length;
    }, end: (s2) => e2("end", s2, t2.length), start: (s2) => e2("start", s2, t2.length) };
  }
}
const pn = { 42: 225, 92: 233, 94: 237, 95: 243, 96: 250, 123: 231, 124: 247, 125: 209, 126: 241, 127: 9608, 128: 174, 129: 176, 130: 189, 131: 191, 132: 8482, 133: 162, 134: 163, 135: 9834, 136: 224, 137: 32, 138: 232, 139: 226, 140: 234, 141: 238, 142: 244, 143: 251, 144: 193, 145: 201, 146: 211, 147: 218, 148: 220, 149: 252, 150: 8216, 151: 161, 152: 42, 153: 8217, 154: 9473, 155: 169, 156: 8480, 157: 8226, 158: 8220, 159: 8221, 160: 192, 161: 194, 162: 199, 163: 200, 164: 202, 165: 203, 166: 235, 167: 206, 168: 207, 169: 239, 170: 212, 171: 217, 172: 249, 173: 219, 174: 171, 175: 187, 176: 195, 177: 227, 178: 205, 179: 204, 180: 236, 181: 210, 182: 242, 183: 213, 184: 245, 185: 123, 186: 125, 187: 92, 188: 94, 189: 95, 190: 124, 191: 8764, 192: 196, 193: 228, 194: 214, 195: 246, 196: 223, 197: 165, 198: 164, 199: 9475, 200: 197, 201: 229, 202: 216, 203: 248, 204: 9487, 205: 9491, 206: 9495, 207: 9499 }, vn = (t2) => String.fromCharCode(pn[t2] || t2), yn = 15, En = 100, Tn = { 17: 1, 18: 3, 21: 5, 22: 7, 23: 9, 16: 11, 19: 12, 20: 14 }, Sn = { 17: 2, 18: 4, 21: 6, 22: 8, 23: 10, 19: 13, 20: 15 }, Ln = { 25: 1, 26: 3, 29: 5, 30: 7, 31: 9, 24: 11, 27: 12, 28: 14 }, An = { 25: 2, 26: 4, 29: 6, 30: 8, 31: 10, 27: 13, 28: 15 }, Rn = ["white", "green", "blue", "cyan", "red", "yellow", "magenta", "black", "transparent"];
class CaptionsLogger {
  constructor() {
    this.time = null, this.verboseLevel = 0;
  }
  log(t2, e2) {
    if (this.verboseLevel >= t2) {
      const s2 = "function" == typeof e2 ? e2() : e2;
      I.log(`${this.time} [${t2}] ${s2}`);
    }
  }
}
const bn = function(t2) {
  const e2 = [];
  for (let s2 = 0; s2 < t2.length; s2++) e2.push(t2[s2].toString(16));
  return e2;
};
class PenState {
  constructor() {
    this.foreground = "white", this.underline = false, this.italics = false, this.background = "black", this.flash = false;
  }
  reset() {
    this.foreground = "white", this.underline = false, this.italics = false, this.background = "black", this.flash = false;
  }
  setStyles(t2) {
    const e2 = ["foreground", "underline", "italics", "background", "flash"];
    for (let s2 = 0; s2 < e2.length; s2++) {
      const i2 = e2[s2];
      t2.hasOwnProperty(i2) && (this[i2] = t2[i2]);
    }
  }
  isDefault() {
    return "white" === this.foreground && !this.underline && !this.italics && "black" === this.background && !this.flash;
  }
  equals(t2) {
    return this.foreground === t2.foreground && this.underline === t2.underline && this.italics === t2.italics && this.background === t2.background && this.flash === t2.flash;
  }
  copy(t2) {
    this.foreground = t2.foreground, this.underline = t2.underline, this.italics = t2.italics, this.background = t2.background, this.flash = t2.flash;
  }
  toString() {
    return "color=" + this.foreground + ", underline=" + this.underline + ", italics=" + this.italics + ", background=" + this.background + ", flash=" + this.flash;
  }
}
class StyledUnicodeChar {
  constructor() {
    this.uchar = " ", this.penState = new PenState();
  }
  reset() {
    this.uchar = " ", this.penState.reset();
  }
  setChar(t2, e2) {
    this.uchar = t2, this.penState.copy(e2);
  }
  setPenState(t2) {
    this.penState.copy(t2);
  }
  equals(t2) {
    return this.uchar === t2.uchar && this.penState.equals(t2.penState);
  }
  copy(t2) {
    this.uchar = t2.uchar, this.penState.copy(t2.penState);
  }
  isEmpty() {
    return " " === this.uchar && this.penState.isDefault();
  }
}
class Row {
  constructor(t2) {
    this.chars = [], this.pos = 0, this.currPenState = new PenState(), this.cueStartTime = null, this.logger = void 0;
    for (let t3 = 0; t3 < En; t3++) this.chars.push(new StyledUnicodeChar());
    this.logger = t2;
  }
  equals(t2) {
    for (let e2 = 0; e2 < En; e2++) if (!this.chars[e2].equals(t2.chars[e2])) return false;
    return true;
  }
  copy(t2) {
    for (let e2 = 0; e2 < En; e2++) this.chars[e2].copy(t2.chars[e2]);
  }
  isEmpty() {
    let t2 = true;
    for (let e2 = 0; e2 < En; e2++) if (!this.chars[e2].isEmpty()) {
      t2 = false;
      break;
    }
    return t2;
  }
  setCursor(t2) {
    this.pos !== t2 && (this.pos = t2), this.pos < 0 ? (this.logger.log(3, "Negative cursor position " + this.pos), this.pos = 0) : this.pos > En && (this.logger.log(3, "Too large cursor position " + this.pos), this.pos = En);
  }
  moveCursor(t2) {
    const e2 = this.pos + t2;
    if (t2 > 1) for (let t3 = this.pos + 1; t3 < e2 + 1; t3++) this.chars[t3].setPenState(this.currPenState);
    this.setCursor(e2);
  }
  backSpace() {
    this.moveCursor(-1), this.chars[this.pos].setChar(" ", this.currPenState);
  }
  insertChar(t2) {
    t2 >= 144 && this.backSpace();
    const e2 = vn(t2);
    this.pos >= En ? this.logger.log(0, () => "Cannot insert " + t2.toString(16) + " (" + e2 + ") at position " + this.pos + ". Skipping it!") : (this.chars[this.pos].setChar(e2, this.currPenState), this.moveCursor(1));
  }
  clearFromPos(t2) {
    let e2;
    for (e2 = t2; e2 < En; e2++) this.chars[e2].reset();
  }
  clear() {
    this.clearFromPos(0), this.pos = 0, this.currPenState.reset();
  }
  clearToEndOfRow() {
    this.clearFromPos(this.pos);
  }
  getTextString() {
    const t2 = [];
    let e2 = true;
    for (let s2 = 0; s2 < En; s2++) {
      const i2 = this.chars[s2].uchar;
      " " !== i2 && (e2 = false), t2.push(i2);
    }
    return e2 ? "" : t2.join("");
  }
  setPenStyles(t2) {
    this.currPenState.setStyles(t2), this.chars[this.pos].setPenState(this.currPenState);
  }
}
class CaptionScreen {
  constructor(t2) {
    this.rows = [], this.currRow = 14, this.nrRollUpRows = null, this.lastOutputScreen = null, this.logger = void 0;
    for (let e2 = 0; e2 < yn; e2++) this.rows.push(new Row(t2));
    this.logger = t2;
  }
  reset() {
    for (let t2 = 0; t2 < yn; t2++) this.rows[t2].clear();
    this.currRow = 14;
  }
  equals(t2) {
    let e2 = true;
    for (let s2 = 0; s2 < yn; s2++) if (!this.rows[s2].equals(t2.rows[s2])) {
      e2 = false;
      break;
    }
    return e2;
  }
  copy(t2) {
    for (let e2 = 0; e2 < yn; e2++) this.rows[e2].copy(t2.rows[e2]);
  }
  isEmpty() {
    let t2 = true;
    for (let e2 = 0; e2 < yn; e2++) if (!this.rows[e2].isEmpty()) {
      t2 = false;
      break;
    }
    return t2;
  }
  backSpace() {
    this.rows[this.currRow].backSpace();
  }
  clearToEndOfRow() {
    this.rows[this.currRow].clearToEndOfRow();
  }
  insertChar(t2) {
    this.rows[this.currRow].insertChar(t2);
  }
  setPen(t2) {
    this.rows[this.currRow].setPenStyles(t2);
  }
  moveCursor(t2) {
    this.rows[this.currRow].moveCursor(t2);
  }
  setCursor(t2) {
    this.logger.log(2, "setCursor: " + t2), this.rows[this.currRow].setCursor(t2);
  }
  setPAC(t2) {
    this.logger.log(2, () => "pacData = " + $t(t2));
    let e2 = t2.row - 1;
    if (this.nrRollUpRows && e2 < this.nrRollUpRows - 1 && (e2 = this.nrRollUpRows - 1), this.nrRollUpRows && this.currRow !== e2) {
      for (let t4 = 0; t4 < yn; t4++) this.rows[t4].clear();
      const t3 = this.currRow + 1 - this.nrRollUpRows, s3 = this.lastOutputScreen;
      if (s3) {
        const i3 = s3.rows[t3].cueStartTime, r2 = this.logger.time;
        if (null !== i3 && null !== r2 && i3 < r2) for (let i4 = 0; i4 < this.nrRollUpRows; i4++) this.rows[e2 - this.nrRollUpRows + i4 + 1].copy(s3.rows[t3 + i4]);
      }
    }
    this.currRow = e2;
    const s2 = this.rows[this.currRow];
    if (null !== t2.indent) {
      const e3 = t2.indent, i3 = Math.max(e3 - 1, 0);
      s2.setCursor(t2.indent), t2.color = s2.chars[i3].penState.foreground;
    }
    const i2 = { foreground: t2.color, underline: t2.underline, italics: t2.italics, background: "black", flash: false };
    this.setPen(i2);
  }
  setBkgData(t2) {
    this.logger.log(2, () => "bkgData = " + $t(t2)), this.backSpace(), this.setPen(t2), this.insertChar(32);
  }
  setRollUpRows(t2) {
    this.nrRollUpRows = t2;
  }
  rollUp() {
    if (null === this.nrRollUpRows) return void this.logger.log(3, "roll_up but nrRollUpRows not set yet");
    this.logger.log(1, () => this.getDisplayText());
    const t2 = this.currRow + 1 - this.nrRollUpRows, e2 = this.rows.splice(t2, 1)[0];
    e2.clear(), this.rows.splice(this.currRow, 0, e2), this.logger.log(2, "Rolling up");
  }
  getDisplayText(t2) {
    t2 = t2 || false;
    const e2 = [];
    let s2 = "", i2 = -1;
    for (let s3 = 0; s3 < yn; s3++) {
      const r2 = this.rows[s3].getTextString();
      r2 && (i2 = s3 + 1, t2 ? e2.push("Row " + i2 + ": '" + r2 + "'") : e2.push(r2.trim()));
    }
    return e2.length > 0 && (s2 = t2 ? "[" + e2.join(" | ") + "]" : e2.join("\n")), s2;
  }
  getTextAndFormat() {
    return this.rows;
  }
}
class Cea608Channel {
  constructor(t2, e2, s2) {
    this.chNr = void 0, this.outputFilter = void 0, this.mode = void 0, this.verbose = void 0, this.displayedMemory = void 0, this.nonDisplayedMemory = void 0, this.lastOutputScreen = void 0, this.currRollUpRow = void 0, this.writeScreen = void 0, this.cueStartTime = void 0, this.logger = void 0, this.chNr = t2, this.outputFilter = e2, this.mode = null, this.verbose = 0, this.displayedMemory = new CaptionScreen(s2), this.nonDisplayedMemory = new CaptionScreen(s2), this.lastOutputScreen = new CaptionScreen(s2), this.currRollUpRow = this.displayedMemory.rows[14], this.writeScreen = this.displayedMemory, this.mode = null, this.cueStartTime = null, this.logger = s2;
  }
  reset() {
    this.mode = null, this.displayedMemory.reset(), this.nonDisplayedMemory.reset(), this.lastOutputScreen.reset(), this.outputFilter.reset(), this.currRollUpRow = this.displayedMemory.rows[14], this.writeScreen = this.displayedMemory, this.mode = null, this.cueStartTime = null;
  }
  getHandler() {
    return this.outputFilter;
  }
  setHandler(t2) {
    this.outputFilter = t2;
  }
  setPAC(t2) {
    this.writeScreen.setPAC(t2);
  }
  setBkgData(t2) {
    this.writeScreen.setBkgData(t2);
  }
  setMode(t2) {
    t2 !== this.mode && (this.mode = t2, this.logger.log(2, () => "MODE=" + t2), "MODE_POP-ON" === this.mode ? this.writeScreen = this.nonDisplayedMemory : (this.writeScreen = this.displayedMemory, this.writeScreen.reset()), "MODE_ROLL-UP" !== this.mode && (this.displayedMemory.nrRollUpRows = null, this.nonDisplayedMemory.nrRollUpRows = null), this.mode = t2);
  }
  insertChars(t2) {
    for (let e3 = 0; e3 < t2.length; e3++) this.writeScreen.insertChar(t2[e3]);
    const e2 = this.writeScreen === this.displayedMemory ? "DISP" : "NON_DISP";
    this.logger.log(2, () => e2 + ": " + this.writeScreen.getDisplayText(true)), "MODE_PAINT-ON" !== this.mode && "MODE_ROLL-UP" !== this.mode || (this.logger.log(1, () => "DISPLAYED: " + this.displayedMemory.getDisplayText(true)), this.outputDataUpdate());
  }
  ccRCL() {
    this.logger.log(2, "RCL - Resume Caption Loading"), this.setMode("MODE_POP-ON");
  }
  ccBS() {
    this.logger.log(2, "BS - BackSpace"), "MODE_TEXT" !== this.mode && (this.writeScreen.backSpace(), this.writeScreen === this.displayedMemory && this.outputDataUpdate());
  }
  ccAOF() {
  }
  ccAON() {
  }
  ccDER() {
    this.logger.log(2, "DER- Delete to End of Row"), this.writeScreen.clearToEndOfRow(), this.outputDataUpdate();
  }
  ccRU(t2) {
    this.logger.log(2, "RU(" + t2 + ") - Roll Up"), this.writeScreen = this.displayedMemory, this.setMode("MODE_ROLL-UP"), this.writeScreen.setRollUpRows(t2);
  }
  ccFON() {
    this.logger.log(2, "FON - Flash On"), this.writeScreen.setPen({ flash: true });
  }
  ccRDC() {
    this.logger.log(2, "RDC - Resume Direct Captioning"), this.setMode("MODE_PAINT-ON");
  }
  ccTR() {
    this.logger.log(2, "TR"), this.setMode("MODE_TEXT");
  }
  ccRTD() {
    this.logger.log(2, "RTD"), this.setMode("MODE_TEXT");
  }
  ccEDM() {
    this.logger.log(2, "EDM - Erase Displayed Memory"), this.displayedMemory.reset(), this.outputDataUpdate(true);
  }
  ccCR() {
    this.logger.log(2, "CR - Carriage Return"), this.writeScreen.rollUp(), this.outputDataUpdate(true);
  }
  ccENM() {
    this.logger.log(2, "ENM - Erase Non-displayed Memory"), this.nonDisplayedMemory.reset();
  }
  ccEOC() {
    if (this.logger.log(2, "EOC - End Of Caption"), "MODE_POP-ON" === this.mode) {
      const t2 = this.displayedMemory;
      this.displayedMemory = this.nonDisplayedMemory, this.nonDisplayedMemory = t2, this.writeScreen = this.nonDisplayedMemory, this.logger.log(1, () => "DISP: " + this.displayedMemory.getDisplayText());
    }
    this.outputDataUpdate(true);
  }
  ccTO(t2) {
    this.logger.log(2, "TO(" + t2 + ") - Tab Offset"), this.writeScreen.moveCursor(t2);
  }
  ccMIDROW(t2) {
    const e2 = { flash: false };
    if (e2.underline = t2 % 2 == 1, e2.italics = t2 >= 46, e2.italics) e2.foreground = "white";
    else {
      const s2 = Math.floor(t2 / 2) - 16, i2 = ["white", "green", "blue", "cyan", "red", "yellow", "magenta"];
      e2.foreground = i2[s2];
    }
    this.logger.log(2, "MIDROW: " + $t(e2)), this.writeScreen.setPen(e2);
  }
  outputDataUpdate(t2 = false) {
    const e2 = this.logger.time;
    null !== e2 && this.outputFilter && (null !== this.cueStartTime || this.displayedMemory.isEmpty() ? this.displayedMemory.equals(this.lastOutputScreen) || (this.outputFilter.newCue(this.cueStartTime, e2, this.lastOutputScreen), t2 && this.outputFilter.dispatchCue && this.outputFilter.dispatchCue(), this.cueStartTime = this.displayedMemory.isEmpty() ? null : e2) : this.cueStartTime = e2, this.lastOutputScreen.copy(this.displayedMemory));
  }
  cueSplitAtTime(t2) {
    this.outputFilter && (this.displayedMemory.isEmpty() || (this.outputFilter.newCue && this.outputFilter.newCue(this.cueStartTime, t2, this.displayedMemory), this.cueStartTime = t2));
  }
}
class Cea608Parser {
  constructor(t2, e2, s2) {
    this.channels = void 0, this.currentChannel = 0, this.cmdHistory = { a: null, b: null }, this.logger = void 0;
    const i2 = this.logger = new CaptionsLogger();
    this.channels = [null, new Cea608Channel(t2, e2, i2), new Cea608Channel(t2 + 1, s2, i2)];
  }
  getHandler(t2) {
    return this.channels[t2].getHandler();
  }
  setHandler(t2, e2) {
    this.channels[t2].setHandler(e2);
  }
  addData(t2, e2) {
    this.logger.time = t2;
    for (let t3 = 0; t3 < e2.length; t3 += 2) {
      const s2 = 127 & e2[t3], i2 = 127 & e2[t3 + 1];
      let r2 = false, n2 = null;
      if (0 === s2 && 0 === i2) continue;
      this.logger.log(3, () => "[" + bn([e2[t3], e2[t3 + 1]]) + "] -> (" + bn([s2, i2]) + ")");
      const a2 = this.cmdHistory;
      if (s2 >= 16 && s2 <= 31) {
        if (kn(s2, i2, a2)) {
          In(null, null, a2), this.logger.log(3, () => "Repeated command (" + bn([s2, i2]) + ") is dropped");
          continue;
        }
        In(s2, i2, this.cmdHistory), r2 = this.parseCmd(s2, i2), r2 || (r2 = this.parseMidrow(s2, i2)), r2 || (r2 = this.parsePAC(s2, i2)), r2 || (r2 = this.parseBackgroundAttributes(s2, i2));
      } else In(null, null, a2);
      if (!r2 && (n2 = this.parseChars(s2, i2), n2)) {
        const t4 = this.currentChannel;
        t4 && t4 > 0 ? this.channels[t4].insertChars(n2) : this.logger.log(2, "No channel found yet. TEXT-MODE?");
      }
      r2 || n2 || this.logger.log(2, () => "Couldn't parse cleaned data " + bn([s2, i2]) + " orig: " + bn([e2[t3], e2[t3 + 1]]));
    }
  }
  parseCmd(t2, e2) {
    if (!((20 === t2 || 28 === t2 || 21 === t2 || 29 === t2) && e2 >= 32 && e2 <= 47 || (23 === t2 || 31 === t2) && e2 >= 33 && e2 <= 35)) return false;
    const s2 = 20 === t2 || 21 === t2 || 23 === t2 ? 1 : 2, i2 = this.channels[s2];
    return 20 === t2 || 21 === t2 || 28 === t2 || 29 === t2 ? 32 === e2 ? i2.ccRCL() : 33 === e2 ? i2.ccBS() : 34 === e2 ? i2.ccAOF() : 35 === e2 ? i2.ccAON() : 36 === e2 ? i2.ccDER() : 37 === e2 ? i2.ccRU(2) : 38 === e2 ? i2.ccRU(3) : 39 === e2 ? i2.ccRU(4) : 40 === e2 ? i2.ccFON() : 41 === e2 ? i2.ccRDC() : 42 === e2 ? i2.ccTR() : 43 === e2 ? i2.ccRTD() : 44 === e2 ? i2.ccEDM() : 45 === e2 ? i2.ccCR() : 46 === e2 ? i2.ccENM() : 47 === e2 && i2.ccEOC() : i2.ccTO(e2 - 32), this.currentChannel = s2, true;
  }
  parseMidrow(t2, e2) {
    let s2 = 0;
    if ((17 === t2 || 25 === t2) && e2 >= 32 && e2 <= 47) {
      if (s2 = 17 === t2 ? 1 : 2, s2 !== this.currentChannel) return this.logger.log(0, "Mismatch channel in midrow parsing"), false;
      const i2 = this.channels[s2];
      return !!i2 && (i2.ccMIDROW(e2), this.logger.log(3, () => "MIDROW (" + bn([t2, e2]) + ")"), true);
    }
    return false;
  }
  parsePAC(t2, e2) {
    let s2;
    if (!((t2 >= 17 && t2 <= 23 || t2 >= 25 && t2 <= 31) && e2 >= 64 && e2 <= 127 || (16 === t2 || 24 === t2) && e2 >= 64 && e2 <= 95)) return false;
    const i2 = t2 <= 23 ? 1 : 2;
    s2 = e2 >= 64 && e2 <= 95 ? 1 === i2 ? Tn[t2] : Ln[t2] : 1 === i2 ? Sn[t2] : An[t2];
    const r2 = this.channels[i2];
    return !!r2 && (r2.setPAC(this.interpretPAC(s2, e2)), this.currentChannel = i2, true);
  }
  interpretPAC(t2, e2) {
    let s2;
    const i2 = { color: null, italics: false, indent: null, underline: false, row: t2 };
    return s2 = e2 > 95 ? e2 - 96 : e2 - 64, i2.underline = !(1 & ~s2), s2 <= 13 ? i2.color = ["white", "green", "blue", "cyan", "red", "yellow", "magenta", "white"][Math.floor(s2 / 2)] : s2 <= 15 ? (i2.italics = true, i2.color = "white") : i2.indent = 4 * Math.floor((s2 - 16) / 2), i2;
  }
  parseChars(t2, e2) {
    let s2, i2 = null, r2 = null;
    if (t2 >= 25 ? (s2 = 2, r2 = t2 - 8) : (s2 = 1, r2 = t2), r2 >= 17 && r2 <= 19) {
      let t3;
      t3 = 17 === r2 ? e2 + 80 : 18 === r2 ? e2 + 112 : e2 + 144, this.logger.log(2, () => "Special char '" + vn(t3) + "' in channel " + s2), i2 = [t3];
    } else t2 >= 32 && t2 <= 127 && (i2 = 0 === e2 ? [t2] : [t2, e2]);
    return i2 && this.logger.log(3, () => "Char codes =  " + bn(i2).join(",")), i2;
  }
  parseBackgroundAttributes(t2, e2) {
    if (!((16 === t2 || 24 === t2) && e2 >= 32 && e2 <= 47 || (23 === t2 || 31 === t2) && e2 >= 45 && e2 <= 47)) return false;
    let s2;
    const i2 = {};
    16 === t2 || 24 === t2 ? (s2 = Math.floor((e2 - 32) / 2), i2.background = Rn[s2], e2 % 2 == 1 && (i2.background = i2.background + "_semi")) : 45 === e2 ? i2.background = "transparent" : (i2.foreground = "black", 47 === e2 && (i2.underline = true));
    const r2 = t2 <= 23 ? 1 : 2;
    return this.channels[r2].setBkgData(i2), true;
  }
  reset() {
    for (let t2 = 0; t2 < Object.keys(this.channels).length; t2++) {
      const e2 = this.channels[t2];
      e2 && e2.reset();
    }
    In(null, null, this.cmdHistory);
  }
  cueSplitAtTime(t2) {
    for (let e2 = 0; e2 < this.channels.length; e2++) {
      const s2 = this.channels[e2];
      s2 && s2.cueSplitAtTime(t2);
    }
  }
}
function In(t2, e2, s2) {
  s2.a = t2, s2.b = e2;
}
function kn(t2, e2, s2) {
  return s2.a === t2 && s2.b === e2;
}
var Pn = function() {
  if (null != Fe && Fe.VTTCue) return self.VTTCue;
  const t2 = ["", "lr", "rl"], e2 = ["start", "middle", "end", "left", "right"];
  function s2(t3, e3) {
    if ("string" != typeof e3) return false;
    if (!Array.isArray(t3)) return false;
    const s3 = e3.toLowerCase();
    return !!~t3.indexOf(s3) && s3;
  }
  function i2(t3) {
    return s2(e2, t3);
  }
  function r2(t3, ...e3) {
    let s3 = 1;
    for (; s3 < arguments.length; s3++) {
      const e4 = arguments[s3];
      for (const s4 in e4) t3[s4] = e4[s4];
    }
    return t3;
  }
  function n2(e3, n3, a2) {
    const o2 = this, l2 = { enumerable: true };
    o2.hasBeenReset = false;
    let h2 = "", d2 = false, c2 = e3, u2 = n3, f2 = a2, g2 = null, m2 = "", p2 = true, v2 = "auto", y2 = "start", E2 = 50, T2 = "middle", S2 = 50, L2 = "middle";
    Object.defineProperty(o2, "id", r2({}, l2, { get: function() {
      return h2;
    }, set: function(t3) {
      h2 = "" + t3;
    } })), Object.defineProperty(o2, "pauseOnExit", r2({}, l2, { get: function() {
      return d2;
    }, set: function(t3) {
      d2 = !!t3;
    } })), Object.defineProperty(o2, "startTime", r2({}, l2, { get: function() {
      return c2;
    }, set: function(t3) {
      if ("number" != typeof t3) throw new TypeError("Start time must be set to a number.");
      c2 = t3, this.hasBeenReset = true;
    } })), Object.defineProperty(o2, "endTime", r2({}, l2, { get: function() {
      return u2;
    }, set: function(t3) {
      if ("number" != typeof t3) throw new TypeError("End time must be set to a number.");
      u2 = t3, this.hasBeenReset = true;
    } })), Object.defineProperty(o2, "text", r2({}, l2, { get: function() {
      return f2;
    }, set: function(t3) {
      f2 = "" + t3, this.hasBeenReset = true;
    } })), Object.defineProperty(o2, "region", r2({}, l2, { get: function() {
      return g2;
    }, set: function(t3) {
      g2 = t3, this.hasBeenReset = true;
    } })), Object.defineProperty(o2, "vertical", r2({}, l2, { get: function() {
      return m2;
    }, set: function(e4) {
      const i3 = function(e5) {
        return s2(t2, e5);
      }(e4);
      if (false === i3) throw new SyntaxError("An invalid or illegal string was specified.");
      m2 = i3, this.hasBeenReset = true;
    } })), Object.defineProperty(o2, "snapToLines", r2({}, l2, { get: function() {
      return p2;
    }, set: function(t3) {
      p2 = !!t3, this.hasBeenReset = true;
    } })), Object.defineProperty(o2, "line", r2({}, l2, { get: function() {
      return v2;
    }, set: function(t3) {
      if ("number" != typeof t3 && "auto" !== t3) throw new SyntaxError("An invalid number or illegal string was specified.");
      v2 = t3, this.hasBeenReset = true;
    } })), Object.defineProperty(o2, "lineAlign", r2({}, l2, { get: function() {
      return y2;
    }, set: function(t3) {
      const e4 = i2(t3);
      if (!e4) throw new SyntaxError("An invalid or illegal string was specified.");
      y2 = e4, this.hasBeenReset = true;
    } })), Object.defineProperty(o2, "position", r2({}, l2, { get: function() {
      return E2;
    }, set: function(t3) {
      if (t3 < 0 || t3 > 100) throw new Error("Position must be between 0 and 100.");
      E2 = t3, this.hasBeenReset = true;
    } })), Object.defineProperty(o2, "positionAlign", r2({}, l2, { get: function() {
      return T2;
    }, set: function(t3) {
      const e4 = i2(t3);
      if (!e4) throw new SyntaxError("An invalid or illegal string was specified.");
      T2 = e4, this.hasBeenReset = true;
    } })), Object.defineProperty(o2, "size", r2({}, l2, { get: function() {
      return S2;
    }, set: function(t3) {
      if (t3 < 0 || t3 > 100) throw new Error("Size must be between 0 and 100.");
      S2 = t3, this.hasBeenReset = true;
    } })), Object.defineProperty(o2, "align", r2({}, l2, { get: function() {
      return L2;
    }, set: function(t3) {
      const e4 = i2(t3);
      if (!e4) throw new SyntaxError("An invalid or illegal string was specified.");
      L2 = e4, this.hasBeenReset = true;
    } })), o2.displayState = void 0;
  }
  return n2.prototype.getCueAsHTML = function() {
    return self.WebVTT.convertCueToDOMTree(self, this.text);
  }, n2;
}();
class StringDecoder {
  decode(t2, e2) {
    if (!t2) return "";
    if ("string" != typeof t2) throw new Error("Error - expected string data.");
    return decodeURIComponent(encodeURIComponent(t2));
  }
}
function Dn(t2) {
  function e2(t3, e3, s3, i2) {
    return 3600 * (0 | t3) + 60 * (0 | e3) + (0 | s3) + parseFloat(i2 || 0);
  }
  const s2 = t2.match(/^(?:(\d+):)?(\d{2}):(\d{2})(\.\d+)?/);
  return s2 ? parseFloat(s2[2]) > 59 ? e2(s2[2], s2[3], 0, s2[4]) : e2(s2[1], s2[2], s2[3], s2[4]) : null;
}
class Settings {
  constructor() {
    this.values = /* @__PURE__ */ Object.create(null);
  }
  set(t2, e2) {
    this.get(t2) || "" === e2 || (this.values[t2] = e2);
  }
  get(t2, e2, s2) {
    return s2 ? this.has(t2) ? this.values[t2] : e2[s2] : this.has(t2) ? this.values[t2] : e2;
  }
  has(t2) {
    return t2 in this.values;
  }
  alt(t2, e2, s2) {
    for (let i2 = 0; i2 < s2.length; ++i2) if (e2 === s2[i2]) {
      this.set(t2, e2);
      break;
    }
  }
  integer(t2, e2) {
    /^-?\d+$/.test(e2) && this.set(t2, parseInt(e2, 10));
  }
  percent(t2, e2) {
    if (/^([\d]{1,3})(\.[\d]*)?%$/.test(e2)) {
      const s2 = parseFloat(e2);
      if (s2 >= 0 && s2 <= 100) return this.set(t2, s2), true;
    }
    return false;
  }
}
function _n(t2, e2, s2, i2) {
  const r2 = i2 ? t2.split(i2) : [t2];
  for (const t3 in r2) {
    if ("string" != typeof r2[t3]) continue;
    const i3 = r2[t3].split(s2);
    2 === i3.length && e2(i3[0], i3[1]);
  }
}
const Cn = new Pn(0, 0, ""), wn = "middle" === Cn.align ? "middle" : "center";
function Mn(t2, e2, s2) {
  const i2 = t2;
  function r2() {
    const e3 = Dn(t2);
    if (null === e3) throw new Error("Malformed timestamp: " + i2);
    return t2 = t2.replace(/^[^\sa-zA-Z-]+/, ""), e3;
  }
  function n2() {
    t2 = t2.replace(/^\s+/, "");
  }
  if (n2(), e2.startTime = r2(), n2(), "-->" !== t2.slice(0, 3)) throw new Error("Malformed time stamp (time stamps must be separated by '-->'): " + i2);
  t2 = t2.slice(3), n2(), e2.endTime = r2(), n2(), function(t3, e3) {
    const i3 = new Settings();
    _n(t3, function(t4, e4) {
      let r4;
      switch (t4) {
        case "region":
          for (let r5 = s2.length - 1; r5 >= 0; r5--) if (s2[r5].id === e4) {
            i3.set(t4, s2[r5].region);
            break;
          }
          break;
        case "vertical":
          i3.alt(t4, e4, ["rl", "lr"]);
          break;
        case "line":
          r4 = e4.split(","), i3.integer(t4, r4[0]), i3.percent(t4, r4[0]) && i3.set("snapToLines", false), i3.alt(t4, r4[0], ["auto"]), 2 === r4.length && i3.alt("lineAlign", r4[1], ["start", wn, "end"]);
          break;
        case "position":
          r4 = e4.split(","), i3.percent(t4, r4[0]), 2 === r4.length && i3.alt("positionAlign", r4[1], ["start", wn, "end", "line-left", "line-right", "auto"]);
          break;
        case "size":
          i3.percent(t4, e4);
          break;
        case "align":
          i3.alt(t4, e4, ["start", wn, "end", "left", "right"]);
      }
    }, /:/, /\s/), e3.region = i3.get("region", null), e3.vertical = i3.get("vertical", "");
    let r3 = i3.get("line", "auto");
    "auto" === r3 && -1 === Cn.line && (r3 = -1), e3.line = r3, e3.lineAlign = i3.get("lineAlign", "start"), e3.snapToLines = i3.get("snapToLines", true), e3.size = i3.get("size", 100), e3.align = i3.get("align", wn);
    let n3 = i3.get("position", "auto");
    "auto" === n3 && 50 === Cn.position && (n3 = "start" === e3.align || "left" === e3.align ? 0 : "end" === e3.align || "right" === e3.align ? 100 : 50), e3.position = n3;
  }(t2, e2);
}
function xn(t2) {
  return t2.replace(/<br(?: \/)?>/gi, "\n");
}
class VTTParser {
  constructor() {
    this.state = "INITIAL", this.buffer = "", this.decoder = new StringDecoder(), this.regionList = [], this.cue = null, this.oncue = void 0, this.onparsingerror = void 0, this.onflush = void 0;
  }
  parse(t2) {
    const e2 = this;
    function s2() {
      let t3 = e2.buffer, s3 = 0;
      for (t3 = xn(t3); s3 < t3.length && "\r" !== t3[s3] && "\n" !== t3[s3]; ) ++s3;
      const i3 = t3.slice(0, s3);
      return "\r" === t3[s3] && ++s3, "\n" === t3[s3] && ++s3, e2.buffer = t3.slice(s3), i3;
    }
    function i2(t3) {
      _n(t3, function(t4, e3) {
      }, /:/);
    }
    t2 && (e2.buffer += e2.decoder.decode(t2, { stream: true }));
    try {
      let t3 = "";
      if ("INITIAL" === e2.state) {
        if (!/\r\n|\n/.test(e2.buffer)) return this;
        t3 = s2();
        const i3 = t3.match(/^(ï»¿)?WEBVTT([ \t].*)?$/);
        if (null == i3 || !i3[0]) throw new Error("Malformed WebVTT signature.");
        e2.state = "HEADER";
      }
      let r2 = false;
      for (; e2.buffer; ) {
        if (!/\r\n|\n/.test(e2.buffer)) return this;
        switch (r2 ? r2 = false : t3 = s2(), e2.state) {
          case "HEADER":
            /:/.test(t3) ? i2(t3) : t3 || (e2.state = "ID");
            continue;
          case "NOTE":
            t3 || (e2.state = "ID");
            continue;
          case "ID":
            if (/^NOTE($|[ \t])/.test(t3)) {
              e2.state = "NOTE";
              break;
            }
            if (!t3) continue;
            if (e2.cue = new Pn(0, 0, ""), e2.state = "CUE", -1 === t3.indexOf("-->")) {
              e2.cue.id = t3;
              continue;
            }
          case "CUE":
            if (!e2.cue) {
              e2.state = "BADCUE";
              continue;
            }
            try {
              Mn(t3, e2.cue, e2.regionList);
            } catch (t4) {
              e2.cue = null, e2.state = "BADCUE";
              continue;
            }
            e2.state = "CUETEXT";
            continue;
          case "CUETEXT":
            {
              const s3 = -1 !== t3.indexOf("-->");
              if (!t3 || s3 && (r2 = true)) {
                e2.oncue && e2.cue && e2.oncue(e2.cue), e2.cue = null, e2.state = "ID";
                continue;
              }
              if (null === e2.cue) continue;
              e2.cue.text && (e2.cue.text += "\n"), e2.cue.text += t3;
            }
            continue;
          case "BADCUE":
            t3 || (e2.state = "ID");
        }
      }
    } catch (t3) {
      "CUETEXT" === e2.state && e2.cue && e2.oncue && e2.oncue(e2.cue), e2.cue = null, e2.state = "INITIAL" === e2.state ? "BADWEBVTT" : "BADCUE";
    }
    return this;
  }
  flush() {
    const t2 = this;
    try {
      if ((t2.cue || "HEADER" === t2.state) && (t2.buffer += "\n\n", t2.parse()), "INITIAL" === t2.state || "BADWEBVTT" === t2.state) throw new Error("Malformed WebVTT signature.");
    } catch (e2) {
      t2.onparsingerror && t2.onparsingerror(e2);
    }
    return t2.onflush && t2.onflush(), this;
  }
}
const On = /\r\n|\n\r|\n|\r/g, startsWith = function(t2, e2, s2 = 0) {
  return t2.slice(s2, s2 + e2.length) === e2;
};
function Fn(t2, e2, s2) {
  return nn(t2.toString()) + nn(e2.toString()) + nn(s2);
}
const Nn = "stpp.ttml.im1t", Bn = /^(\d{2,}):(\d{2}):(\d{2}):(\d{2})\.?(\d+)?$/, $n = /^(\d*(?:\.\d*)?)(h|m|s|ms|f|t)$/, Un = { left: "start", center: "center", right: "end", start: "start", end: "end" };
function Gn(t2, e2, s2, i2) {
  const r2 = X(new Uint8Array(t2), ["mdat"]);
  if (0 === r2.length) return void i2(new Error("Could not parse IMSC1 mdat"));
  const n2 = r2.map((t3) => D(t3)), a2 = function(t3, e3, s3 = 1, i3 = false) {
    return Gi(t3, e3, 1 / s3, i3);
  }(e2.baseTime, 1, e2.timescale);
  try {
    n2.forEach((t3) => s2(function(t4, e3) {
      const s3 = new DOMParser().parseFromString(t4, "text/xml").getElementsByTagName("tt")[0];
      if (!s3) throw new Error("Invalid ttml");
      const i3 = { frameRate: 30, subFrameRate: 1, frameRateMultiplier: 0, tickRate: 0 }, r3 = Object.keys(i3).reduce((t5, e4) => (t5[e4] = s3.getAttribute(`ttp:${e4}`) || i3[e4], t5), {}), n3 = "preserve" !== s3.getAttribute("xml:space"), a3 = Hn(Kn(s3, "styling", "style")), o2 = Hn(Kn(s3, "layout", "region")), l2 = Kn(s3, "body", "[begin]");
      return [].map.call(l2, (t5) => {
        const s4 = Vn(t5, n3);
        if (!s4 || !t5.hasAttribute("begin")) return null;
        const i4 = jn(t5.getAttribute("begin"), r3), l3 = jn(t5.getAttribute("dur"), r3);
        let h2 = jn(t5.getAttribute("end"), r3);
        if (null === i4) throw Wn(t5);
        if (null === h2) {
          if (null === l3) throw Wn(t5);
          h2 = i4 + l3;
        }
        const d2 = new Pn(i4 - e3, h2 - e3, s4);
        d2.id = Fn(d2.startTime, d2.endTime, d2.text);
        const c2 = function(t6, e4, s5) {
          const i5 = "http://www.w3.org/ns/ttml#styling";
          let r4 = null;
          const n4 = null != t6 && t6.hasAttribute("style") ? t6.getAttribute("style") : null;
          return n4 && s5.hasOwnProperty(n4) && (r4 = s5[n4]), ["displayAlign", "textAlign", "color", "backgroundColor", "fontSize", "fontFamily"].reduce((s6, n5) => {
            const a4 = Yn(e4, i5, n5) || Yn(t6, i5, n5) || Yn(r4, i5, n5);
            return a4 && (s6[n5] = a4), s6;
          }, {});
        }(o2[t5.getAttribute("region")], a3[t5.getAttribute("style")], a3), { textAlign: u2 } = c2;
        if (u2) {
          const t6 = Un[u2];
          t6 && (d2.lineAlign = t6), d2.align = u2;
        }
        return y(d2, c2), d2;
      }).filter((t5) => null !== t5);
    }(t3, a2)));
  } catch (t3) {
    i2(t3);
  }
}
function Kn(t2, e2, s2) {
  const i2 = t2.getElementsByTagName(e2)[0];
  return i2 ? [].slice.call(i2.querySelectorAll(s2)) : [];
}
function Hn(t2) {
  return t2.reduce((t3, e2) => {
    const s2 = e2.getAttribute("xml:id");
    return s2 && (t3[s2] = e2), t3;
  }, {});
}
function Vn(t2, e2) {
  return [].slice.call(t2.childNodes).reduce((t3, s2, i2) => {
    var r2;
    return "br" === s2.nodeName && i2 ? t3 + "\n" : null != (r2 = s2.childNodes) && r2.length ? Vn(s2, e2) : e2 ? t3 + s2.textContent.trim().replace(/\s+/g, " ") : t3 + s2.textContent;
  }, "");
}
function Yn(t2, e2, s2) {
  return t2 && t2.hasAttributeNS(e2, s2) ? t2.getAttributeNS(e2, s2) : null;
}
function Wn(t2) {
  return new Error(`Could not parse ttml timestamp ${t2}`);
}
function jn(t2, e2) {
  if (!t2) return null;
  let s2 = Dn(t2);
  return null === s2 && (Bn.test(t2) ? s2 = function(t3, e3) {
    const s3 = Bn.exec(t3), i2 = (0 | s3[4]) + (0 | s3[5]) / e3.subFrameRate;
    return 3600 * (0 | s3[1]) + 60 * (0 | s3[2]) + (0 | s3[3]) + i2 / e3.frameRate;
  }(t2, e2) : $n.test(t2) && (s2 = function(t3, e3) {
    const s3 = $n.exec(t3), i2 = Number(s3[1]);
    switch (s3[2]) {
      case "h":
        return 3600 * i2;
      case "m":
        return 60 * i2;
      case "ms":
        return 1e3 * i2;
      case "f":
        return i2 / e3.frameRate;
      case "t":
        return i2 / e3.tickRate;
    }
    return i2;
  }(t2, e2))), s2;
}
class OutputFilter {
  constructor(t2, e2) {
    this.timelineController = void 0, this.cueRanges = [], this.trackName = void 0, this.startTime = null, this.endTime = null, this.screen = null, this.timelineController = t2, this.trackName = e2;
  }
  dispatchCue() {
    null !== this.startTime && (this.timelineController.addCues(this.trackName, this.startTime, this.endTime, this.screen, this.cueRanges), this.startTime = null);
  }
  newCue(t2, e2, s2) {
    (null === this.startTime || this.startTime > t2) && (this.startTime = t2), this.endTime = e2, this.screen = s2, this.timelineController.createCaptionsTrack(this.trackName);
  }
  reset() {
    this.cueRanges = [], this.startTime = null;
  }
}
function qn(t2) {
  return t2.characteristics && /transcribes-spoken-dialog/gi.test(t2.characteristics) && /describes-music-and-sound/gi.test(t2.characteristics) ? "captions" : "subtitles";
}
function Xn(t2, e2) {
  return !!t2 && t2.kind === qn(e2) && nr(e2, t2);
}
function zn(t2, e2, s2, i2) {
  return Math.min(e2, i2) - Math.max(t2, s2);
}
const Qn = /\s/, Zn = { newCue(t2, e2, s2, i2) {
  const r2 = [];
  let n2, a2, o2, l2, h2;
  const d2 = self.VTTCue || self.TextTrackCue;
  for (let u2 = 0; u2 < i2.rows.length; u2++) if (n2 = i2.rows[u2], o2 = true, l2 = 0, h2 = "", !n2.isEmpty()) {
    var c2;
    for (let t3 = 0; t3 < n2.chars.length; t3++) Qn.test(n2.chars[t3].uchar) && o2 ? l2++ : (h2 += n2.chars[t3].uchar, o2 = false);
    n2.cueStartTime = e2, e2 === s2 && (s2 += 1e-4), l2 >= 16 ? l2-- : l2++;
    const i3 = xn(h2.trim()), f2 = Fn(e2, s2, i3);
    null != t2 && null != (c2 = t2.cues) && c2.getCueById(f2) || (a2 = new d2(e2, s2, i3), a2.id = f2, a2.line = u2 + 1, a2.align = "left", a2.position = 10 + Math.min(80, 10 * Math.floor(8 * l2 / 32)), r2.push(a2));
  }
  return t2 && r2.length && (r2.sort((t3, e3) => "auto" === t3.line || "auto" === e3.line ? 0 : t3.line > 8 && e3.line > 8 ? e3.line - t3.line : t3.line - e3.line), r2.forEach((e3) => tn(t2, e3))), r2;
} }, Jn = /(\d+)-(\d+)\/(\d+)/;
class FetchLoader {
  constructor(t2) {
    this.fetchSetup = void 0, this.requestTimeout = void 0, this.request = null, this.response = null, this.controller = void 0, this.context = null, this.config = null, this.callbacks = null, this.stats = void 0, this.loader = null, this.fetchSetup = t2.fetchSetup || ta, this.controller = new self.AbortController(), this.stats = new LoadStats();
  }
  destroy() {
    this.loader = this.callbacks = this.context = this.config = this.request = null, this.abortInternal(), this.response = null, this.fetchSetup = this.controller = this.stats = null;
  }
  abortInternal() {
    this.controller && !this.stats.loading.end && (this.stats.aborted = true, this.controller.abort());
  }
  abort() {
    var t2;
    this.abortInternal(), null != (t2 = this.callbacks) && t2.onAbort && this.callbacks.onAbort(this.stats, this.context, this.response);
  }
  load(t2, e2, s2) {
    const i2 = this.stats;
    if (i2.loading.start) throw new Error("Loader can only be used once.");
    i2.loading.start = self.performance.now();
    const n2 = function(t3, e3) {
      const s3 = { method: "GET", mode: "cors", credentials: "same-origin", signal: e3, headers: new self.Headers(y({}, t3.headers)) };
      return t3.rangeEnd && s3.headers.set("Range", "bytes=" + t3.rangeStart + "-" + String(t3.rangeEnd - 1)), s3;
    }(t2, this.controller.signal), a2 = "arraybuffer" === t2.responseType, o2 = a2 ? "byteLength" : "length", { maxTimeToFirstByteMs: l2, maxLoadTimeMs: h2 } = e2.loadPolicy;
    this.context = t2, this.config = e2, this.callbacks = s2, this.request = this.fetchSetup(t2, n2), self.clearTimeout(this.requestTimeout), e2.timeout = l2 && r(l2) ? l2 : h2, this.requestTimeout = self.setTimeout(() => {
      this.callbacks && (this.abortInternal(), this.callbacks.onTimeout(i2, t2, this.response));
    }, e2.timeout), (er(this.request) ? this.request.then(self.fetch) : self.fetch(this.request)).then((s3) => {
      var n3;
      this.response = this.loader = s3;
      const o3 = Math.max(self.performance.now(), i2.loading.start);
      if (self.clearTimeout(this.requestTimeout), e2.timeout = h2, this.requestTimeout = self.setTimeout(() => {
        this.callbacks && (this.abortInternal(), this.callbacks.onTimeout(i2, t2, this.response));
      }, h2 - (o3 - i2.loading.start)), !s3.ok) {
        const { status: t3, statusText: e3 } = s3;
        throw new FetchError(e3 || "fetch, bad network response", t3, s3);
      }
      i2.loading.first = o3, i2.total = function(t3) {
        const e3 = t3.get("Content-Range");
        if (e3) {
          const t4 = function(t5) {
            const e4 = Jn.exec(t5);
            if (e4) return parseInt(e4[2]) - parseInt(e4[1]) + 1;
          }(e3);
          if (r(t4)) return t4;
        }
        const s4 = t3.get("Content-Length");
        if (s4) return parseInt(s4);
      }(s3.headers) || i2.total;
      const l3 = null == (n3 = this.callbacks) ? void 0 : n3.onProgress;
      return l3 && r(e2.highWaterMark) ? this.loadProgressively(s3, i2, t2, e2.highWaterMark, l3) : a2 ? s3.arrayBuffer() : "json" === t2.responseType ? s3.json() : s3.text();
    }).then((s3) => {
      var n3, a3;
      const l3 = this.response;
      if (!l3) throw new Error("loader destroyed");
      self.clearTimeout(this.requestTimeout), i2.loading.end = Math.max(self.performance.now(), i2.loading.first);
      const h3 = s3[o2];
      h3 && (i2.loaded = i2.total = h3);
      const d2 = { url: l3.url, data: s3, code: l3.status }, c2 = null == (n3 = this.callbacks) ? void 0 : n3.onProgress;
      c2 && !r(e2.highWaterMark) && c2(i2, t2, s3, l3), null == (a3 = this.callbacks) || a3.onSuccess(d2, i2, t2, l3);
    }).catch((e3) => {
      var s3;
      if (self.clearTimeout(this.requestTimeout), i2.aborted) return;
      const r2 = e3 && e3.code || 0, n3 = e3 ? e3.message : null;
      null == (s3 = this.callbacks) || s3.onError({ code: r2, text: n3 }, t2, e3 ? e3.details : null, i2);
    });
  }
  getCacheAge() {
    let t2 = null;
    if (this.response) {
      const e2 = this.response.headers.get("age");
      t2 = e2 ? parseFloat(e2) : null;
    }
    return t2;
  }
  getResponseHeader(t2) {
    return this.response ? this.response.headers.get(t2) : null;
  }
  loadProgressively(t2, e2, s2, i2 = 0, r2) {
    const n2 = new ChunkCache(), a2 = t2.body.getReader(), o2 = () => a2.read().then((a3) => {
      if (a3.done) return n2.dataLength && r2(e2, s2, n2.flush().buffer, t2), Promise.resolve(new ArrayBuffer(0));
      const l2 = a3.value, h2 = l2.length;
      return e2.loaded += h2, h2 < i2 || n2.dataLength ? (n2.push(l2), n2.dataLength >= i2 && r2(e2, s2, n2.flush().buffer, t2)) : r2(e2, s2, l2.buffer, t2), o2();
    }).catch(() => Promise.reject());
    return o2();
  }
}
function ta(t2, e2) {
  return new self.Request(t2.url, e2);
}
class FetchError extends Error {
  constructor(t2, e2, s2) {
    super(t2), this.code = void 0, this.details = void 0, this.code = e2, this.details = s2;
  }
}
const ea = /^age:\s*[\d.]+\s*$/im;
class XhrLoader {
  constructor(t2) {
    this.xhrSetup = void 0, this.requestTimeout = void 0, this.retryTimeout = void 0, this.retryDelay = void 0, this.config = null, this.callbacks = null, this.context = null, this.loader = null, this.stats = void 0, this.xhrSetup = t2 && t2.xhrSetup || null, this.stats = new LoadStats(), this.retryDelay = 0;
  }
  destroy() {
    this.callbacks = null, this.abortInternal(), this.loader = null, this.config = null, this.context = null, this.xhrSetup = null;
  }
  abortInternal() {
    const t2 = this.loader;
    self.clearTimeout(this.requestTimeout), self.clearTimeout(this.retryTimeout), t2 && (t2.onreadystatechange = null, t2.onprogress = null, 4 !== t2.readyState && (this.stats.aborted = true, t2.abort()));
  }
  abort() {
    var t2;
    this.abortInternal(), null != (t2 = this.callbacks) && t2.onAbort && this.callbacks.onAbort(this.stats, this.context, this.loader);
  }
  load(t2, e2, s2) {
    if (this.stats.loading.start) throw new Error("Loader can only be used once.");
    this.stats.loading.start = self.performance.now(), this.context = t2, this.config = e2, this.callbacks = s2, this.loadInternal();
  }
  loadInternal() {
    const { config: t2, context: e2 } = this;
    if (!t2 || !e2) return;
    const s2 = this.loader = new self.XMLHttpRequest(), i2 = this.stats;
    i2.loading.first = 0, i2.loaded = 0, i2.aborted = false;
    const r2 = this.xhrSetup;
    r2 ? Promise.resolve().then(() => {
      if (this.loader === s2 && !this.stats.aborted) return r2(s2, e2.url);
    }).catch((t3) => {
      if (this.loader === s2 && !this.stats.aborted) return s2.open("GET", e2.url, true), r2(s2, e2.url);
    }).then(() => {
      this.loader !== s2 || this.stats.aborted || this.openAndSendXhr(s2, e2, t2);
    }).catch((t3) => {
      var r3;
      null == (r3 = this.callbacks) || r3.onError({ code: s2.status, text: t3.message }, e2, s2, i2);
    }) : this.openAndSendXhr(s2, e2, t2);
  }
  openAndSendXhr(t2, e2, s2) {
    t2.readyState || t2.open("GET", e2.url, true);
    const i2 = e2.headers, { maxTimeToFirstByteMs: n2, maxLoadTimeMs: a2 } = s2.loadPolicy;
    if (i2) for (const e3 in i2) t2.setRequestHeader(e3, i2[e3]);
    e2.rangeEnd && t2.setRequestHeader("Range", "bytes=" + e2.rangeStart + "-" + (e2.rangeEnd - 1)), t2.onreadystatechange = this.readystatechange.bind(this), t2.onprogress = this.loadprogress.bind(this), t2.responseType = e2.responseType, self.clearTimeout(this.requestTimeout), s2.timeout = n2 && r(n2) ? n2 : a2, this.requestTimeout = self.setTimeout(this.loadtimeout.bind(this), s2.timeout), t2.send();
  }
  readystatechange() {
    const { context: t2, loader: e2, stats: s2 } = this;
    if (!t2 || !e2) return;
    const i2 = e2.readyState, r2 = this.config;
    if (!s2.aborted && i2 >= 2 && (0 === s2.loading.first && (s2.loading.first = Math.max(self.performance.now(), s2.loading.start), r2.timeout !== r2.loadPolicy.maxLoadTimeMs && (self.clearTimeout(this.requestTimeout), r2.timeout = r2.loadPolicy.maxLoadTimeMs, this.requestTimeout = self.setTimeout(this.loadtimeout.bind(this), r2.loadPolicy.maxLoadTimeMs - (s2.loading.first - s2.loading.start)))), 4 === i2)) {
      self.clearTimeout(this.requestTimeout), e2.onreadystatechange = null, e2.onprogress = null;
      const i3 = e2.status, l2 = "text" === e2.responseType ? e2.responseText : null;
      if (i3 >= 200 && i3 < 300) {
        const r3 = null != l2 ? l2 : e2.response;
        if (null != r3) {
          var n2, a2;
          s2.loading.end = Math.max(self.performance.now(), s2.loading.first);
          const o3 = "arraybuffer" === e2.responseType ? r3.byteLength : r3.length;
          s2.loaded = s2.total = o3, s2.bwEstimate = 8e3 * s2.total / (s2.loading.end - s2.loading.first);
          const l3 = null == (n2 = this.callbacks) ? void 0 : n2.onProgress;
          l3 && l3(s2, t2, r3, e2);
          const h3 = { url: e2.responseURL, data: r3, code: i3 };
          return void (null == (a2 = this.callbacks) || a2.onSuccess(h3, s2, t2, e2));
        }
      }
      const h2 = r2.loadPolicy.errorRetry;
      var o2;
      ne(h2, s2.retry, false, { url: t2.url, data: void 0, code: i3 }) ? this.retry(h2) : (I.error(`${i3} while loading ${t2.url}`), null == (o2 = this.callbacks) || o2.onError({ code: i3, text: e2.statusText }, t2, e2, s2));
    }
  }
  loadtimeout() {
    if (!this.config) return;
    const t2 = this.config.loadPolicy.timeoutRetry;
    if (ne(t2, this.stats.retry, true)) this.retry(t2);
    else {
      var e2;
      I.warn(`timeout while loading ${null == (e2 = this.context) ? void 0 : e2.url}`);
      const t3 = this.callbacks;
      t3 && (this.abortInternal(), t3.onTimeout(this.stats, this.context, this.loader));
    }
  }
  retry(t2) {
    const { context: e2, stats: s2 } = this;
    this.retryDelay = ie(t2, s2.retry), s2.retry++, I.warn(`${status ? "HTTP Status " + status : "Timeout"} while loading ${null == e2 ? void 0 : e2.url}, retrying ${s2.retry}/${t2.maxNumRetry} in ${this.retryDelay}ms`), this.abortInternal(), this.loader = null, self.clearTimeout(this.retryTimeout), this.retryTimeout = self.setTimeout(this.loadInternal.bind(this), this.retryDelay);
  }
  loadprogress(t2) {
    const e2 = this.stats;
    e2.loaded = t2.loaded, t2.lengthComputable && (e2.total = t2.total);
  }
  getCacheAge() {
    let t2 = null;
    if (this.loader && ea.test(this.loader.getAllResponseHeaders())) {
      const e2 = this.loader.getResponseHeader("age");
      t2 = e2 ? parseFloat(e2) : null;
    }
    return t2;
  }
  getResponseHeader(t2) {
    return this.loader && new RegExp(`^${t2}:\\s*[\\d.]+\\s*$`, "im").test(this.loader.getAllResponseHeaders()) ? this.loader.getResponseHeader(t2) : null;
  }
}
const sa = T(T({ autoStartLoad: true, startPosition: -1, defaultAudioCodec: void 0, debug: false, capLevelOnFPSDrop: false, capLevelToPlayerSize: false, ignoreDevicePixelRatio: false, maxDevicePixelRatio: Number.POSITIVE_INFINITY, preferManagedMediaSource: true, initialLiveManifestSize: 1, maxBufferLength: 30, backBufferLength: 1 / 0, frontBufferFlushThreshold: 1 / 0, startOnSegmentBoundary: false, maxBufferSize: 6e7, maxFragLookUpTolerance: 0.25, maxBufferHole: 0.1, detectStallWithCurrentTimeMs: 1250, highBufferWatchdogPeriod: 2, nudgeOffset: 0.1, nudgeMaxRetry: 3, nudgeOnVideoHole: true, liveSyncMode: "edge", liveSyncDurationCount: 3, liveSyncOnStallIncrease: 1, liveMaxLatencyDurationCount: 1 / 0, liveSyncDuration: void 0, liveMaxLatencyDuration: void 0, maxLiveSyncPlaybackRate: 1, liveDurationInfinity: false, liveBackBufferLength: null, maxMaxBufferLength: 600, enableWorker: true, workerPath: null, enableSoftwareAES: true, startLevel: void 0, startFragPrefetch: false, fpsDroppedMonitoringPeriod: 5e3, fpsDroppedMonitoringThreshold: 0.2, appendErrorMaxRetry: 3, ignorePlaylistParsingErrors: false, loader: XhrLoader, fLoader: void 0, pLoader: void 0, xhrSetup: void 0, licenseXhrSetup: void 0, licenseResponseCallback: void 0, abrController: class extends Logger {
  constructor(t2) {
    super("abr", t2.logger), this.hls = void 0, this.lastLevelLoadSec = 0, this.lastLoadedFragLevel = -1, this.firstSelection = -1, this._nextAutoLevel = -1, this.nextAutoLevelKey = "", this.audioTracksByGroup = null, this.codecTiers = null, this.timer = -1, this.fragCurrent = null, this.partCurrent = null, this.bitrateTestDelay = 0, this.rebufferNotice = -1, this.supportedCache = {}, this.bwEstimator = void 0, this._abandonRulesCheck = (t3) => {
      var e2;
      const { fragCurrent: s2, partCurrent: i2, hls: n2 } = this, { autoLevelEnabled: a2, media: o2 } = n2;
      if (!s2 || !o2) return;
      const l2 = performance.now(), d2 = i2 ? i2.stats : s2.stats, c2 = i2 ? i2.duration : s2.duration, u2 = l2 - d2.loading.start, f2 = n2.minAutoLevel, g2 = s2.level, m2 = this._nextAutoLevel;
      if (d2.aborted || d2.loaded && d2.loaded === d2.total || g2 <= f2) return this.clearTimer(), void (this._nextAutoLevel = -1);
      if (!a2) return;
      const p2 = m2 > -1 && m2 !== g2, v2 = !!t3 || p2;
      if (!v2 && (o2.paused || !o2.playbackRate || !o2.readyState)) return;
      const y2 = n2.mainForwardBufferInfo;
      if (!v2 && null === y2) return;
      const E2 = this.bwEstimator.getEstimateTTFB(), T2 = Math.abs(o2.playbackRate);
      if (u2 <= Math.max(E2, c2 / (2 * T2) * 1e3)) return;
      const S2 = y2 ? y2.len / T2 : 0, L2 = d2.loading.first ? d2.loading.first - d2.loading.start : -1, A2 = d2.loaded && L2 > -1, R2 = this.getBwEstimate(), b2 = n2.levels, I2 = b2[g2], k2 = Math.max(d2.loaded, Math.round(c2 * (s2.bitrate || I2.averageBitrate) / 8));
      let P2 = A2 ? u2 - L2 : u2;
      P2 < 1 && A2 && (P2 = Math.min(u2, 8 * d2.loaded / R2));
      const D2 = A2 ? 1e3 * d2.loaded / P2 : 0, _2 = E2 / 1e3, C2 = D2 ? (k2 - d2.loaded) / D2 : 8 * k2 / R2 + _2;
      if (C2 <= S2) return;
      const w2 = D2 ? 8 * D2 : R2, M2 = true === (null == (e2 = (null == t3 ? void 0 : t3.details) || this.hls.latestLevelDetails) ? void 0 : e2.live), x2 = this.hls.config.abrBandWidthUpFactor;
      let O2, F2 = Number.POSITIVE_INFINITY;
      for (O2 = g2 - 1; O2 > f2; O2--) {
        const t4 = b2[O2].maxBitrate, e3 = !b2[O2].details || M2;
        if (F2 = this.getTimeToLoadFrag(_2, w2, c2 * t4, e3), F2 < Math.min(S2, c2 + _2)) break;
      }
      if (F2 >= C2) return;
      if (F2 > 10 * c2) return;
      A2 ? this.bwEstimator.sample(u2 - Math.min(E2, L2), d2.loaded) : this.bwEstimator.sampleTTFB(u2);
      const N2 = b2[O2].maxBitrate;
      this.getBwEstimate() * x2 > N2 && this.resetEstimator(N2);
      const B2 = this.findBestLevel(N2, f2, O2, 0, S2, 1, 1);
      B2 > -1 && (O2 = B2), this.warn(`Fragment ${s2.sn}${i2 ? " part " + i2.index : ""} of level ${g2} is loading too slowly;
      Fragment duration: ${s2.duration.toFixed(3)}
      Time to underbuffer: ${S2.toFixed(3)} s
      Estimated load time for current fragment: ${C2.toFixed(3)} s
      Estimated load time for down switch fragment: ${F2.toFixed(3)} s
      TTFB estimate: ${0 | L2} ms
      Current BW estimate: ${r(R2) ? 0 | R2 : "Unknown"} bps
      New BW estimate: ${0 | this.getBwEstimate()} bps
      Switching to level ${O2} @ ${0 | N2} bps`), n2.nextLoadLevel = n2.nextAutoLevel = O2, this.clearTimer();
      const $2 = () => {
        if (this.clearTimer(), this.fragCurrent === s2 && this.hls.loadLevel === O2 && O2 > 0) {
          const t4 = this.getStarvationDelay();
          if (this.warn(`Aborting inflight request ${O2 > 0 ? "and switching down" : ""}
      Fragment duration: ${s2.duration.toFixed(3)} s
      Time to underbuffer: ${t4.toFixed(3)} s`), s2.abortRequests(), this.fragCurrent = this.partCurrent = null, O2 > f2) {
            let e3 = this.findBestLevel(this.hls.levels[f2].bitrate, f2, O2, 0, t4, 1, 1);
            -1 === e3 && (e3 = f2), this.hls.nextLoadLevel = this.hls.nextAutoLevel = e3, this.resetEstimator(this.hls.levels[e3].bitrate);
          }
        }
      };
      p2 || C2 > 2 * F2 ? $2() : this.timer = self.setInterval($2, 1e3 * F2), n2.trigger(h.FRAG_LOAD_EMERGENCY_ABORTED, { frag: s2, part: i2, stats: d2 });
    }, this.hls = t2, this.bwEstimator = this.initEstimator(), this.registerListeners();
  }
  resetEstimator(t2) {
    t2 && (this.log(`setting initial bwe to ${t2}`), this.hls.config.abrEwmaDefaultEstimate = t2), this.firstSelection = -1, this.bwEstimator = this.initEstimator();
  }
  initEstimator() {
    const t2 = this.hls.config;
    return new EwmaBandWidthEstimator(t2.abrEwmaSlowVoD, t2.abrEwmaFastVoD, t2.abrEwmaDefaultEstimate);
  }
  registerListeners() {
    const { hls: t2 } = this;
    t2.on(h.MANIFEST_LOADING, this.onManifestLoading, this), t2.on(h.FRAG_LOADING, this.onFragLoading, this), t2.on(h.FRAG_LOADED, this.onFragLoaded, this), t2.on(h.FRAG_BUFFERED, this.onFragBuffered, this), t2.on(h.LEVEL_SWITCHING, this.onLevelSwitching, this), t2.on(h.LEVEL_LOADED, this.onLevelLoaded, this), t2.on(h.LEVELS_UPDATED, this.onLevelsUpdated, this), t2.on(h.MAX_AUTO_LEVEL_UPDATED, this.onMaxAutoLevelUpdated, this), t2.on(h.ERROR, this.onError, this);
  }
  unregisterListeners() {
    const { hls: t2 } = this;
    t2 && (t2.off(h.MANIFEST_LOADING, this.onManifestLoading, this), t2.off(h.FRAG_LOADING, this.onFragLoading, this), t2.off(h.FRAG_LOADED, this.onFragLoaded, this), t2.off(h.FRAG_BUFFERED, this.onFragBuffered, this), t2.off(h.LEVEL_SWITCHING, this.onLevelSwitching, this), t2.off(h.LEVEL_LOADED, this.onLevelLoaded, this), t2.off(h.LEVELS_UPDATED, this.onLevelsUpdated, this), t2.off(h.MAX_AUTO_LEVEL_UPDATED, this.onMaxAutoLevelUpdated, this), t2.off(h.ERROR, this.onError, this));
  }
  destroy() {
    this.unregisterListeners(), this.clearTimer(), this.hls = this._abandonRulesCheck = this.supportedCache = null, this.fragCurrent = this.partCurrent = null;
  }
  onManifestLoading(t2, e2) {
    this.lastLoadedFragLevel = -1, this.firstSelection = -1, this.lastLevelLoadSec = 0, this.supportedCache = {}, this.fragCurrent = this.partCurrent = null, this.onLevelsUpdated(), this.clearTimer();
  }
  onLevelsUpdated() {
    this.lastLoadedFragLevel > -1 && this.fragCurrent && (this.lastLoadedFragLevel = this.fragCurrent.level), this._nextAutoLevel = -1, this.onMaxAutoLevelUpdated(), this.codecTiers = null, this.audioTracksByGroup = null;
  }
  onMaxAutoLevelUpdated() {
    this.firstSelection = -1, this.nextAutoLevelKey = "";
  }
  onFragLoading(t2, e2) {
    const s2 = e2.frag;
    var i2;
    this.ignoreFragment(s2) || (s2.bitrateTest || (this.fragCurrent = s2, this.partCurrent = null != (i2 = e2.part) ? i2 : null), this.clearTimer(), this.timer = self.setInterval(this._abandonRulesCheck, 100));
  }
  onLevelSwitching(t2, e2) {
    this.clearTimer();
  }
  onError(t2, e2) {
    if (!e2.fatal) switch (e2.details) {
      case l.BUFFER_ADD_CODEC_ERROR:
      case l.BUFFER_APPEND_ERROR:
        this.lastLoadedFragLevel = -1, this.firstSelection = -1;
        break;
      case l.FRAG_LOAD_TIMEOUT: {
        const t3 = e2.frag, { fragCurrent: s2, partCurrent: i2 } = this;
        if (t3 && s2 && t3.sn === s2.sn && t3.level === s2.level) {
          const e3 = performance.now(), s3 = i2 ? i2.stats : t3.stats, r2 = e3 - s3.loading.start, n2 = s3.loading.first ? s3.loading.first - s3.loading.start : -1;
          if (s3.loaded && n2 > -1) {
            const t4 = this.bwEstimator.getEstimateTTFB();
            this.bwEstimator.sample(r2 - Math.min(t4, n2), s3.loaded);
          } else this.bwEstimator.sampleTTFB(r2);
        }
        break;
      }
    }
  }
  getTimeToLoadFrag(t2, e2, s2, i2) {
    return t2 + s2 / e2 + (i2 ? t2 + this.lastLevelLoadSec : 0);
  }
  onLevelLoaded(t2, e2) {
    const s2 = this.hls.config, { loading: i2 } = e2.stats, n2 = i2.end - i2.first;
    r(n2) && (this.lastLevelLoadSec = n2 / 1e3), e2.details.live ? this.bwEstimator.update(s2.abrEwmaSlowLive, s2.abrEwmaFastLive) : this.bwEstimator.update(s2.abrEwmaSlowVoD, s2.abrEwmaFastVoD), this.timer > -1 && this._abandonRulesCheck(e2.levelInfo);
  }
  onFragLoaded(t2, { frag: e2, part: s2 }) {
    const i2 = s2 ? s2.stats : e2.stats;
    if (e2.type === g && this.bwEstimator.sampleTTFB(i2.loading.first - i2.loading.start), !this.ignoreFragment(e2)) {
      if (this.clearTimer(), e2.level === this._nextAutoLevel && (this._nextAutoLevel = -1), this.firstSelection = -1, this.hls.config.abrMaxWithRealBitrate) {
        const t3 = s2 ? s2.duration : e2.duration, r2 = this.hls.levels[e2.level], n2 = (r2.loaded ? r2.loaded.bytes : 0) + i2.loaded, a2 = (r2.loaded ? r2.loaded.duration : 0) + t3;
        r2.loaded = { bytes: n2, duration: a2 }, r2.realBitrate = Math.round(8 * n2 / a2);
      }
      if (e2.bitrateTest) {
        const t3 = { stats: i2, frag: e2, part: s2, id: e2.type };
        this.onFragBuffered(h.FRAG_BUFFERED, t3), e2.bitrateTest = false;
      } else this.lastLoadedFragLevel = e2.level;
    }
  }
  onFragBuffered(t2, e2) {
    const { frag: s2, part: i2 } = e2, r2 = null != i2 && i2.stats.loaded ? i2.stats : s2.stats;
    if (r2.aborted) return;
    if (this.ignoreFragment(s2)) return;
    const n2 = r2.parsing.end - r2.loading.start - Math.min(r2.loading.first - r2.loading.start, this.bwEstimator.getEstimateTTFB());
    this.bwEstimator.sample(n2, r2.loaded), r2.bwEstimate = this.getBwEstimate(), s2.bitrateTest ? this.bitrateTestDelay = n2 / 1e3 : this.bitrateTestDelay = 0;
  }
  ignoreFragment(t2) {
    return t2.type !== g || "initSegment" === t2.sn;
  }
  clearTimer() {
    this.timer > -1 && (self.clearInterval(this.timer), this.timer = -1);
  }
  get firstAutoLevel() {
    const { maxAutoLevel: t2, minAutoLevel: e2 } = this.hls, s2 = this.getBwEstimate(), i2 = this.hls.config.maxStarvationDelay, r2 = this.findBestLevel(s2, e2, t2, 0, i2, 1, 1);
    if (r2 > -1) return r2;
    const n2 = this.hls.firstLevel, a2 = Math.min(Math.max(n2, e2), t2);
    return this.warn(`Could not find best starting auto level. Defaulting to first in playlist ${n2} clamped to ${a2}`), a2;
  }
  get forcedAutoLevel() {
    return this.nextAutoLevelKey ? -1 : this._nextAutoLevel;
  }
  get nextAutoLevel() {
    const t2 = this.forcedAutoLevel, e2 = this.bwEstimator.canEstimate(), s2 = this.lastLoadedFragLevel > -1;
    if (!(-1 === t2 || e2 && s2 && this.nextAutoLevelKey !== this.getAutoLevelKey())) return t2;
    const i2 = e2 && s2 ? this.getNextABRAutoLevel() : this.firstAutoLevel;
    if (-1 !== t2) {
      const e3 = this.hls.levels;
      if (e3.length > Math.max(t2, i2) && e3[t2].loadError <= e3[i2].loadError) return t2;
    }
    return this._nextAutoLevel = i2, this.nextAutoLevelKey = this.getAutoLevelKey(), i2;
  }
  getAutoLevelKey() {
    return `${this.getBwEstimate()}_${this.getStarvationDelay().toFixed(2)}`;
  }
  getNextABRAutoLevel() {
    const { fragCurrent: t2, partCurrent: e2, hls: s2 } = this;
    if (s2.levels.length <= 1) return s2.loadLevel;
    const { maxAutoLevel: i2, config: r2, minAutoLevel: n2 } = s2, a2 = e2 ? e2.duration : t2 ? t2.duration : 0, o2 = this.getBwEstimate(), l2 = this.getStarvationDelay();
    let h2 = r2.abrBandWidthFactor, d2 = r2.abrBandWidthUpFactor;
    if (l2) {
      const t3 = this.findBestLevel(o2, n2, i2, l2, 0, h2, d2);
      if (t3 >= 0) return this.rebufferNotice = -1, t3;
    }
    let c2 = a2 ? Math.min(a2, r2.maxStarvationDelay) : r2.maxStarvationDelay;
    if (!l2) {
      const t3 = this.bitrateTestDelay;
      t3 && (c2 = (a2 ? Math.min(a2, r2.maxLoadingDelay) : r2.maxLoadingDelay) - t3, this.info(`bitrate test took ${Math.round(1e3 * t3)}ms, set first fragment max fetchDuration to ${Math.round(1e3 * c2)} ms`), h2 = d2 = 1);
    }
    const u2 = this.findBestLevel(o2, n2, i2, l2, c2, h2, d2);
    if (this.rebufferNotice !== u2 && (this.rebufferNotice = u2, this.info(`${l2 ? "rebuffering expected" : "buffer is empty"}, optimal quality level ${u2}`)), u2 > -1) return u2;
    const f2 = s2.levels[n2], g2 = s2.loadLevelObj;
    return g2 && (null == f2 ? void 0 : f2.bitrate) < g2.bitrate ? n2 : s2.loadLevel;
  }
  getStarvationDelay() {
    const t2 = this.hls, e2 = t2.media;
    if (!e2) return 1 / 0;
    const s2 = e2 && 0 !== e2.playbackRate ? Math.abs(e2.playbackRate) : 1, i2 = t2.mainForwardBufferInfo;
    return (i2 ? i2.len : 0) / s2;
  }
  getBwEstimate() {
    return this.bwEstimator.canEstimate() ? this.bwEstimator.getEstimate() : this.hls.config.abrEwmaDefaultEstimate;
  }
  findBestLevel(t2, e2, s2, i2, n2, a2, o2) {
    var l2;
    const h2 = i2 + n2, d2 = this.lastLoadedFragLevel, c2 = -1 === d2 ? this.hls.firstLevel : d2, { fragCurrent: u2, partCurrent: f2 } = this, { levels: g2, allAudioTracks: m2, loadLevel: p2, config: v2 } = this.hls;
    if (1 === g2.length) return 0;
    const y2 = g2[c2], E2 = !(null == (l2 = this.hls.latestLevelDetails) || !l2.live), T2 = -1 === p2 || -1 === d2;
    let S2, L2 = "SDR", A2 = (null == y2 ? void 0 : y2.frameRate) || 0;
    const { audioPreference: R2, videoPreference: b2 } = v2, I2 = this.audioTracksByGroup || (this.audioTracksByGroup = Gt(m2));
    let k2 = -1;
    if (T2) {
      if (-1 !== this.firstSelection) return this.firstSelection;
      const i3 = this.codecTiers || (this.codecTiers = function(t3, e3, s3, i4) {
        return t3.slice(s3, i4 + 1).reduce((t4, s4, i5) => {
          if (!s4.codecSet) return t4;
          const r2 = s4.audioGroups;
          let n4 = t4[s4.codecSet];
          n4 || (t4[s4.codecSet] = n4 = { minBitrate: 1 / 0, minHeight: 1 / 0, minFramerate: 1 / 0, minIndex: i5, maxScore: 0, videoRanges: { SDR: 0 }, channels: { 2: 0 }, hasDefaultAudio: !r2, fragmentError: 0 }), n4.minBitrate = Math.min(n4.minBitrate, s4.bitrate);
          const a4 = Math.min(s4.height, s4.width);
          return n4.minHeight = Math.min(n4.minHeight, a4), n4.minFramerate = Math.min(n4.minFramerate, s4.frameRate), n4.minIndex = Math.min(n4.minIndex, i5), n4.maxScore = Math.max(n4.maxScore, s4.score), n4.fragmentError += s4.fragmentError, n4.videoRanges[s4.videoRange] = (n4.videoRanges[s4.videoRange] || 0) + 1, r2 && r2.forEach((t5) => {
            if (!t5) return;
            const s5 = e3.groups[t5];
            s5 && (n4.hasDefaultAudio = n4.hasDefaultAudio || e3.hasDefaultAudio ? s5.hasDefault : s5.hasAutoSelect || !e3.hasDefaultAudio && !e3.hasAutoSelectAudio, Object.keys(s5.channels).forEach((t6) => {
              n4.channels[t6] = (n4.channels[t6] || 0) + s5.channels[t6];
            }));
          }), t4;
        }, {});
      }(g2, I2, e2, s2)), n3 = function(t3, e3, s3, i4, n4) {
        const a4 = Object.keys(t3), o4 = null == i4 ? void 0 : i4.channels, l4 = null == i4 ? void 0 : i4.audioCodec, h4 = null == n4 ? void 0 : n4.videoCodec, d4 = o4 && 2 === parseInt(o4);
        let c4 = false, u3 = false, f3 = 1 / 0, g3 = 1 / 0, m3 = 1 / 0, p3 = 1 / 0, v3 = 0, y3 = [];
        const { preferHDR: E3, allowedVideoRanges: T3 } = function(t4, e4) {
          let s4 = false, i5 = [];
          if (t4 && (s4 = "SDR" !== t4, i5 = [t4]), e4) {
            i5 = e4.allowedVideoRanges || Ft.slice(0);
            const t5 = "SDR" !== i5.join("") && !e4.videoCodec;
            s4 = void 0 !== e4.preferHDR ? e4.preferHDR : t5 && function() {
              if ("function" == typeof matchMedia) {
                const t6 = matchMedia("(dynamic-range: high)"), e5 = matchMedia("bad query");
                if (t6.media !== e5.media) return true === t6.matches;
              }
              return false;
            }(), s4 || (i5 = ["SDR"]);
          }
          return { preferHDR: s4, allowedVideoRanges: i5 };
        }(e3, n4);
        for (let e4 = a4.length; e4--; ) {
          const s4 = t3[a4[e4]];
          c4 || (c4 = s4.channels[2] > 0), f3 = Math.min(f3, s4.minHeight), g3 = Math.min(g3, s4.minFramerate), m3 = Math.min(m3, s4.minBitrate), T3.filter((t4) => s4.videoRanges[t4] > 0).length > 0 && (u3 = true);
        }
        f3 = r(f3) ? f3 : 0, g3 = r(g3) ? g3 : 0;
        const S3 = Math.max(1080, f3), L3 = Math.max(30, g3);
        m3 = r(m3) ? m3 : s3, s3 = Math.max(m3, s3), u3 || (e3 = void 0);
        const A3 = a4.length > 1;
        return { codecSet: a4.reduce((e4, i5) => {
          const r2 = t3[i5];
          if (i5 === e4) return e4;
          if (y3 = u3 ? T3.filter((t4) => r2.videoRanges[t4] > 0) : [], A3) {
            if (r2.minBitrate > s3) return Ut(i5, `min bitrate of ${r2.minBitrate} > current estimate of ${s3}`), e4;
            if (!r2.hasDefaultAudio) return Ut(i5, "no renditions with default or auto-select sound found"), e4;
            if (l4 && i5.indexOf(l4.substring(0, 4)) % 5 != 0) return Ut(i5, `audio codec preference "${l4}" not found`), e4;
            if (o4 && !d4) {
              if (!r2.channels[o4]) return Ut(i5, `no renditions with ${o4} channel sound found (channels options: ${Object.keys(r2.channels)})`), e4;
            } else if ((!l4 || d4) && c4 && 0 === r2.channels[2]) return Ut(i5, "no renditions with stereo sound found"), e4;
            if (r2.minHeight > S3) return Ut(i5, `min resolution of ${r2.minHeight} > maximum of ${S3}`), e4;
            if (r2.minFramerate > L3) return Ut(i5, `min framerate of ${r2.minFramerate} > maximum of ${L3}`), e4;
            if (!y3.some((t4) => r2.videoRanges[t4] > 0)) return Ut(i5, `no variants with VIDEO-RANGE of ${$t(y3)} found`), e4;
            if (h4 && i5.indexOf(h4.substring(0, 4)) % 5 != 0) return Ut(i5, `video codec preference "${h4}" not found`), e4;
            if (r2.maxScore < v3) return Ut(i5, `max score of ${r2.maxScore} < selected max of ${v3}`), e4;
          }
          return e4 && (Et(i5) >= Et(e4) || r2.fragmentError > t3[e4].fragmentError) ? e4 : (p3 = r2.minIndex, v3 = r2.maxScore, i5);
        }, void 0), videoRanges: y3, preferHDR: E3, minFramerate: g3, minBitrate: m3, minIndex: p3 };
      }(i3, L2, t2, R2, b2), { codecSet: a3, videoRanges: o3, minFramerate: l3, minBitrate: h3, minIndex: d3, preferHDR: c3 } = n3;
      k2 = d3, S2 = a3, L2 = c3 ? o3[o3.length - 1] : o3[0], A2 = l3, t2 = Math.max(t2, h3), this.log(`picked start tier ${$t(n3)}`);
    } else S2 = null == y2 ? void 0 : y2.codecSet, L2 = null == y2 ? void 0 : y2.videoRange;
    const P2 = f2 ? f2.duration : u2 ? u2.duration : 0, D2 = this.bwEstimator.getEstimateTTFB() / 1e3, _2 = [];
    for (let l3 = s2; l3 >= e2; l3--) {
      var C2;
      const e3 = g2[l3], u3 = l3 > c2;
      if (!e3) continue;
      if (v2.useMediaCapabilities && !e3.supportedResult && !e3.supportedPromise) {
        const s3 = navigator.mediaCapabilities;
        "function" == typeof (null == s3 ? void 0 : s3.decodingInfo) && Ct(e3, I2, L2, A2, t2, R2) ? (e3.supportedPromise = wt(e3, I2, s3, this.supportedCache), e3.supportedPromise.then((t3) => {
          if (!this.hls) return;
          e3.supportedResult = t3;
          const s4 = this.hls.levels, i3 = s4.indexOf(e3);
          t3.error ? this.warn(`MediaCapabilities decodingInfo error: "${t3.error}" for level ${i3} ${$t(t3)}`) : t3.supported ? t3.decodingInfoResults.some((t4) => false === t4.smooth || false === t4.powerEfficient) && this.log(`MediaCapabilities decodingInfo for level ${i3} not smooth or powerEfficient: ${$t(t3)}`) : (this.warn(`Unsupported MediaCapabilities decodingInfo result for level ${i3} ${$t(t3)}`), i3 > -1 && s4.length > 1 && (this.log(`Removing unsupported level ${i3}`), this.hls.removeLevel(i3), -1 === this.hls.loadLevel && (this.hls.nextLoadLevel = 0)));
        }).catch((t3) => {
          this.warn(`Error handling MediaCapabilities decodingInfo: ${t3}`);
        })) : e3.supportedResult = Dt;
      }
      if ((S2 && e3.codecSet !== S2 || L2 && e3.videoRange !== L2 || u3 && A2 > e3.frameRate || !u3 && A2 > 0 && A2 < e3.frameRate || null != (C2 = e3.supportedResult) && null != (C2 = C2.decodingInfoResults) && C2.some((t3) => false === t3.smooth)) && (!T2 || l3 !== k2)) {
        _2.push(l3);
        continue;
      }
      const m3 = e3.details, y3 = (f2 ? null == m3 ? void 0 : m3.partTarget : null == m3 ? void 0 : m3.averagetargetduration) || P2;
      let b3;
      b3 = u3 ? o2 * t2 : a2 * t2;
      const w2 = P2 && i2 >= 2 * P2 && 0 === n2 ? e3.averageBitrate : e3.maxBitrate, M2 = this.getTimeToLoadFrag(D2, b3, w2 * y3, void 0 === m3);
      if (b3 >= w2 && (l3 === d2 || 0 === e3.loadError && 0 === e3.fragmentError) && (M2 <= D2 || !r(M2) || E2 && !this.bitrateTestDelay || M2 < h2)) {
        const t3 = this.forcedAutoLevel;
        return l3 === p2 || -1 !== t3 && t3 === p2 || (_2.length && this.trace(`Skipped level(s) ${_2.join(",")} of ${s2} max with CODECS and VIDEO-RANGE:"${g2[_2[0]].codecs}" ${g2[_2[0]].videoRange}; not compatible with "${S2}" ${L2}`), this.info(`switch candidate:${c2}->${l3} adjustedbw(${Math.round(b3)})-bitrate=${Math.round(b3 - w2)} ttfb:${D2.toFixed(1)} avgDuration:${y3.toFixed(1)} maxFetchDuration:${h2.toFixed(1)} fetchDuration:${M2.toFixed(1)} firstSelection:${T2} codecSet:${e3.codecSet} videoRange:${e3.videoRange} hls.loadLevel:${p2}`)), T2 && (this.firstSelection = l3), l3;
      }
    }
    return -1;
  }
  set nextAutoLevel(t2) {
    const e2 = this.deriveNextAutoLevel(t2);
    this._nextAutoLevel !== e2 && (this.nextAutoLevelKey = "", this._nextAutoLevel = e2);
  }
  deriveNextAutoLevel(t2) {
    const { maxAutoLevel: e2, minAutoLevel: s2 } = this.hls;
    return Math.min(Math.max(t2, s2), e2);
  }
}, bufferController: class extends Logger {
  constructor(t2, e2) {
    var s2;
    super("buffer-controller", t2.logger), this.hls = void 0, this.fragmentTracker = void 0, this.details = null, this._objectUrl = null, this.operationQueue = null, this.bufferCodecEventsTotal = 0, this.media = null, this.mediaSource = null, this.lastMpegAudioChunk = null, this.blockedAudioAppend = null, this.lastVideoAppendEnd = 0, this.appendSource = void 0, this.transferData = void 0, this.overrides = void 0, this.appendErrors = { audio: 0, video: 0, audiovideo: 0 }, this.tracks = {}, this.sourceBuffers = [[null, null], [null, null]], this._onEndStreaming = (t3) => {
      var e3;
      this.hls && "open" === (null == (e3 = this.mediaSource) ? void 0 : e3.readyState) && this.hls.pauseBuffering();
    }, this._onStartStreaming = (t3) => {
      this.hls && this.hls.resumeBuffering();
    }, this._onMediaSourceOpen = (t3) => {
      const { media: e3, mediaSource: s3 } = this;
      t3 && this.log("Media source opened"), e3 && s3 && (s3.removeEventListener("sourceopen", this._onMediaSourceOpen), e3.removeEventListener("emptied", this._onMediaEmptied), this.updateDuration(), this.hls.trigger(h.MEDIA_ATTACHED, { media: e3, mediaSource: s3 }), null !== this.mediaSource && this.checkPendingTracks());
    }, this._onMediaSourceClose = () => {
      this.log("Media source closed");
    }, this._onMediaSourceEnded = () => {
      this.log("Media source ended");
    }, this._onMediaEmptied = () => {
      const { mediaSrc: t3, _objectUrl: e3 } = this;
      t3 !== e3 && this.error(`Media element src was set while attaching MediaSource (${e3} > ${t3})`);
    }, this.hls = t2, this.fragmentTracker = e2, this.appendSource = (s2 = k(t2.config.preferManagedMediaSource), "undefined" != typeof self && s2 === self.ManagedMediaSource), this.initTracks(), this.registerListeners();
  }
  hasSourceTypes() {
    return Object.keys(this.tracks).length > 0;
  }
  destroy() {
    this.unregisterListeners(), this.details = null, this.lastMpegAudioChunk = this.blockedAudioAppend = null, this.transferData = this.overrides = void 0, this.operationQueue && (this.operationQueue.destroy(), this.operationQueue = null), this.hls = this.fragmentTracker = null, this._onMediaSourceOpen = this._onMediaSourceClose = null, this._onMediaSourceEnded = null, this._onStartStreaming = this._onEndStreaming = null;
  }
  registerListeners() {
    const { hls: t2 } = this;
    t2.on(h.MEDIA_ATTACHING, this.onMediaAttaching, this), t2.on(h.MEDIA_DETACHING, this.onMediaDetaching, this), t2.on(h.MANIFEST_LOADING, this.onManifestLoading, this), t2.on(h.MANIFEST_PARSED, this.onManifestParsed, this), t2.on(h.BUFFER_RESET, this.onBufferReset, this), t2.on(h.BUFFER_APPENDING, this.onBufferAppending, this), t2.on(h.BUFFER_CODECS, this.onBufferCodecs, this), t2.on(h.BUFFER_EOS, this.onBufferEos, this), t2.on(h.BUFFER_FLUSHING, this.onBufferFlushing, this), t2.on(h.LEVEL_UPDATED, this.onLevelUpdated, this), t2.on(h.FRAG_PARSED, this.onFragParsed, this), t2.on(h.FRAG_CHANGED, this.onFragChanged, this), t2.on(h.ERROR, this.onError, this);
  }
  unregisterListeners() {
    const { hls: t2 } = this;
    t2.off(h.MEDIA_ATTACHING, this.onMediaAttaching, this), t2.off(h.MEDIA_DETACHING, this.onMediaDetaching, this), t2.off(h.MANIFEST_LOADING, this.onManifestLoading, this), t2.off(h.MANIFEST_PARSED, this.onManifestParsed, this), t2.off(h.BUFFER_RESET, this.onBufferReset, this), t2.off(h.BUFFER_APPENDING, this.onBufferAppending, this), t2.off(h.BUFFER_CODECS, this.onBufferCodecs, this), t2.off(h.BUFFER_EOS, this.onBufferEos, this), t2.off(h.BUFFER_FLUSHING, this.onBufferFlushing, this), t2.off(h.LEVEL_UPDATED, this.onLevelUpdated, this), t2.off(h.FRAG_PARSED, this.onFragParsed, this), t2.off(h.FRAG_CHANGED, this.onFragChanged, this), t2.off(h.ERROR, this.onError, this);
  }
  transferMedia() {
    const { media: t2, mediaSource: e2 } = this;
    if (!t2) return null;
    const s2 = {};
    if (this.operationQueue) {
      const t3 = this.isUpdating();
      t3 || this.operationQueue.removeBlockers();
      const e3 = this.isQueued();
      (t3 || e3) && this.warn(`Transfering MediaSource with${e3 ? " operations in queue" : ""}${t3 ? " updating SourceBuffer(s)" : ""} ${this.operationQueue}`), this.operationQueue.destroy();
    }
    const i2 = this.transferData;
    return !this.sourceBufferCount && i2 && i2.mediaSource === e2 ? y(s2, i2.tracks) : this.sourceBuffers.forEach((t3) => {
      const [e3] = t3;
      e3 && (s2[e3] = y({}, this.tracks[e3]), this.removeBuffer(e3)), t3[0] = t3[1] = null;
    }), { media: t2, mediaSource: e2, tracks: s2 };
  }
  initTracks() {
    this.sourceBuffers = [[null, null], [null, null]], this.tracks = {}, this.resetQueue(), this.resetAppendErrors(), this.lastMpegAudioChunk = this.blockedAudioAppend = null, this.lastVideoAppendEnd = 0;
  }
  onManifestLoading() {
    this.bufferCodecEventsTotal = 0, this.details = null;
  }
  onManifestParsed(t2, e2) {
    var s2;
    let i2 = 2;
    (e2.audio && !e2.video || !e2.altAudio) && (i2 = 1), this.bufferCodecEventsTotal = i2, this.log(`${i2} bufferCodec event(s) expected.`), null != (s2 = this.transferData) && s2.mediaSource && this.sourceBufferCount && i2 && this.bufferCreated();
  }
  onMediaAttaching(t2, e2) {
    const s2 = this.media = e2.media;
    this.transferData = this.overrides = void 0;
    const i2 = k(this.appendSource);
    if (i2) {
      const t3 = !!e2.mediaSource;
      (t3 || e2.overrides) && (this.transferData = e2, this.overrides = e2.overrides);
      const r2 = this.mediaSource = e2.mediaSource || new i2();
      if (this.assignMediaSource(r2), t3) this._objectUrl = s2.src, this.attachTransferred();
      else {
        const t4 = this._objectUrl = self.URL.createObjectURL(r2);
        if (this.appendSource) try {
          s2.removeAttribute("src");
          const e3 = self.ManagedMediaSource;
          s2.disableRemotePlayback = s2.disableRemotePlayback || e3 && r2 instanceof e3, lr(s2), function(t5, e4) {
            const s3 = self.document.createElement("source");
            s3.type = "video/mp4", s3.src = e4, t5.appendChild(s3);
          }(s2, t4), s2.load();
        } catch (e3) {
          s2.src = t4;
        }
        else s2.src = t4;
      }
      s2.addEventListener("emptied", this._onMediaEmptied);
    }
  }
  assignMediaSource(t2) {
    var e2, s2;
    this.log(`${(null == (e2 = this.transferData) ? void 0 : e2.mediaSource) === t2 ? "transferred" : "created"} media source: ${null == (s2 = t2.constructor) ? void 0 : s2.name}`), t2.addEventListener("sourceopen", this._onMediaSourceOpen), t2.addEventListener("sourceended", this._onMediaSourceEnded), t2.addEventListener("sourceclose", this._onMediaSourceClose), this.appendSource && (t2.addEventListener("startstreaming", this._onStartStreaming), t2.addEventListener("endstreaming", this._onEndStreaming));
  }
  attachTransferred() {
    const t2 = this.media, e2 = this.transferData;
    if (!e2 || !t2) return;
    const s2 = this.tracks, i2 = e2.tracks, r2 = i2 ? Object.keys(i2) : null, n2 = r2 ? r2.length : 0, a2 = () => {
      Promise.resolve().then(() => {
        this.media && this.mediaSourceOpenOrEnded && this._onMediaSourceOpen();
      });
    };
    if (i2 && r2 && n2) {
      if (!this.tracksReady) return this.hls.config.startFragPrefetch = true, void this.log("attachTransferred: waiting for SourceBuffer track info");
      if (this.log(`attachTransferred: (bufferCodecEventsTotal ${this.bufferCodecEventsTotal})
required tracks: ${$t(s2, (t3, e3) => "initSegment" === t3 ? void 0 : e3)};
transfer tracks: ${$t(i2, (t3, e3) => "initSegment" === t3 ? void 0 : e3)}}`), !P(i2, s2)) {
        e2.mediaSource = null, e2.tracks = void 0;
        const r3 = t2.currentTime, n3 = this.details, a3 = Math.max(r3, (null == n3 ? void 0 : n3.fragments[0].start) || 0);
        return a3 - r3 > 1 ? void this.log(`attachTransferred: waiting for playback to reach new tracks start time ${r3} -> ${a3}`) : (this.warn(`attachTransferred: resetting MediaSource for incompatible tracks ("${Object.keys(i2)}"->"${Object.keys(s2)}") start time: ${a3} currentTime: ${r3}`), this.onMediaDetaching(h.MEDIA_DETACHING, {}), this.onMediaAttaching(h.MEDIA_ATTACHING, e2), void (t2.currentTime = a3));
      }
      this.transferData = void 0, r2.forEach((t3) => {
        const e3 = t3, s3 = i2[e3];
        if (s3) {
          const t4 = s3.buffer;
          if (t4) {
            const i3 = this.fragmentTracker, r3 = s3.id;
            if (i3.hasFragments(r3) || i3.hasParts(r3)) {
              const s4 = BufferHelper.getBuffered(t4);
              i3.detectEvictedFragments(e3, s4, r3, null, true);
            }
            const n3 = hr(e3), a3 = [e3, t4];
            this.sourceBuffers[n3] = a3, t4.updating && this.operationQueue && this.operationQueue.prependBlocker(e3), this.trackSourceBuffer(e3, s3);
          }
        }
      }), a2(), this.bufferCreated();
    } else this.log("attachTransferred: MediaSource w/o SourceBuffers"), a2();
  }
  get mediaSourceOpenOrEnded() {
    var t2;
    const e2 = null == (t2 = this.mediaSource) ? void 0 : t2.readyState;
    return "open" === e2 || "ended" === e2;
  }
  onMediaDetaching(t2, e2) {
    const s2 = !!e2.transferMedia;
    this.transferData = this.overrides = void 0;
    const { media: i2, mediaSource: r2, _objectUrl: n2 } = this;
    if (r2) {
      if (this.log("media source " + (s2 ? "transferring" : "detaching")), s2) this.sourceBuffers.forEach(([t3]) => {
        t3 && this.removeBuffer(t3);
      }), this.resetQueue();
      else {
        if (this.mediaSourceOpenOrEnded) {
          const t3 = "open" === r2.readyState;
          try {
            const e3 = r2.sourceBuffers;
            for (let s3 = e3.length; s3--; ) t3 && e3[s3].abort(), r2.removeSourceBuffer(e3[s3]);
            t3 && r2.endOfStream();
          } catch (t4) {
            this.warn(`onMediaDetaching: ${t4.message} while calling endOfStream`);
          }
        }
        this.sourceBufferCount && this.onBufferReset();
      }
      r2.removeEventListener("sourceopen", this._onMediaSourceOpen), r2.removeEventListener("sourceended", this._onMediaSourceEnded), r2.removeEventListener("sourceclose", this._onMediaSourceClose), this.appendSource && (r2.removeEventListener("startstreaming", this._onStartStreaming), r2.removeEventListener("endstreaming", this._onEndStreaming)), this.mediaSource = null, this._objectUrl = null;
    }
    i2 && (i2.removeEventListener("emptied", this._onMediaEmptied), s2 || (n2 && self.URL.revokeObjectURL(n2), this.mediaSrc === n2 ? (i2.removeAttribute("src"), this.appendSource && lr(i2), i2.load()) : this.warn("media|source.src was changed by a third party - skip cleanup")), this.media = null), this.hls.trigger(h.MEDIA_DETACHED, e2);
  }
  onBufferReset() {
    this.sourceBuffers.forEach(([t2]) => {
      t2 && this.resetBuffer(t2);
    }), this.initTracks();
  }
  resetBuffer(t2) {
    var e2;
    const s2 = null == (e2 = this.tracks[t2]) ? void 0 : e2.buffer;
    if (this.removeBuffer(t2), s2) try {
      var i2;
      null != (i2 = this.mediaSource) && i2.sourceBuffers.length && this.mediaSource.removeSourceBuffer(s2);
    } catch (e3) {
      this.warn(`onBufferReset ${t2}`, e3);
    }
    delete this.tracks[t2];
  }
  removeBuffer(t2) {
    this.removeBufferListeners(t2), this.sourceBuffers[hr(t2)] = [null, null];
    const e2 = this.tracks[t2];
    e2 && (e2.buffer = void 0);
  }
  resetQueue() {
    this.operationQueue && this.operationQueue.destroy(), this.operationQueue = new BufferOperationQueue(this.tracks);
  }
  onBufferCodecs(t2, e2) {
    var s2;
    const i2 = this.tracks, r2 = Object.keys(e2);
    this.log(`BUFFER_CODECS: "${r2}" (current SB count ${this.sourceBufferCount})`);
    const n2 = "audiovideo" in e2 && (i2.audio || i2.video) || i2.audiovideo && ("audio" in e2 || "video" in e2), a2 = !n2 && this.sourceBufferCount && this.media && r2.some((t3) => !i2[t3]);
    n2 || a2 ? this.warn(`Unsupported transition between "${Object.keys(i2)}" and "${r2}" SourceBuffers`) : (r2.forEach((t3) => {
      var s3, r3;
      const n3 = e2[t3], { id: a3, codec: o2, levelCodec: l2, container: h2, metadata: d2, supplemental: c2 } = n3;
      let u2 = i2[t3];
      const f2 = null == (s3 = this.transferData) || null == (s3 = s3.tracks) ? void 0 : s3[t3], g2 = null != f2 && f2.buffer ? f2 : u2, m2 = (null == g2 ? void 0 : g2.pendingCodec) || (null == g2 ? void 0 : g2.codec), p2 = null == g2 ? void 0 : g2.levelCodec;
      u2 || (u2 = i2[t3] = { buffer: void 0, listeners: [], codec: o2, supplemental: c2, container: h2, levelCodec: l2, metadata: d2, id: a3 });
      const v2 = At(m2, p2), y2 = null == v2 ? void 0 : v2.replace(ar, "$1");
      let E2 = At(o2, l2);
      const T2 = null == (r3 = E2) ? void 0 : r3.replace(ar, "$1");
      E2 && v2 && y2 !== T2 && ("audio" === t3.slice(0, 5) && (E2 = Lt(E2, this.appendSource)), this.log(`switching codec ${m2} to ${E2}`), E2 !== (u2.pendingCodec || u2.codec) && (u2.pendingCodec = E2), u2.container = h2, this.appendChangeType(t3, h2, E2));
    }), (this.tracksReady || this.sourceBufferCount) && (e2.tracks = this.sourceBufferTracks), this.sourceBufferCount || (this.bufferCodecEventsTotal > 1 && !this.tracks.video && !e2.video && "main" === (null == (s2 = e2.audio) ? void 0 : s2.id) && (this.log("Main audio-only"), this.bufferCodecEventsTotal = 1), this.mediaSourceOpenOrEnded && this.checkPendingTracks()));
  }
  get sourceBufferTracks() {
    return Object.keys(this.tracks).reduce((t2, e2) => {
      const s2 = this.tracks[e2];
      return t2[e2] = { id: s2.id, container: s2.container, codec: s2.codec, levelCodec: s2.levelCodec }, t2;
    }, {});
  }
  appendChangeType(t2, e2, s2) {
    const i2 = `${e2};codecs=${s2}`, r2 = { label: `change-type=${i2}`, execute: () => {
      const r3 = this.tracks[t2];
      if (r3) {
        const n2 = r3.buffer;
        null != n2 && n2.changeType && (this.log(`changing ${t2} sourceBuffer type to ${i2}`), n2.changeType(i2), r3.codec = s2, r3.container = e2);
      }
      this.shiftAndExecuteNext(t2);
    }, onStart: () => {
    }, onComplete: () => {
    }, onError: (e3) => {
      this.warn(`Failed to change ${t2} SourceBuffer type`, e3);
    } };
    this.append(r2, t2, this.isPending(this.tracks[t2]));
  }
  blockAudio(t2) {
    var e2;
    const s2 = t2.start, i2 = s2 + 0.05 * t2.duration;
    if (true === (null == (e2 = this.fragmentTracker.getAppendedFrag(s2, g)) ? void 0 : e2.gap)) return;
    const r2 = { label: "block-audio", execute: () => {
      var t3;
      const e3 = this.tracks.video;
      (this.lastVideoAppendEnd > i2 || null != e3 && e3.buffer && BufferHelper.isBuffered(e3.buffer, i2) || true === (null == (t3 = this.fragmentTracker.getAppendedFrag(i2, g)) ? void 0 : t3.gap)) && (this.blockedAudioAppend = null, this.shiftAndExecuteNext("audio"));
    }, onStart: () => {
    }, onComplete: () => {
    }, onError: (t3) => {
      this.warn("Error executing block-audio operation", t3);
    } };
    this.blockedAudioAppend = { op: r2, frag: t2 }, this.append(r2, "audio", true);
  }
  unblockAudio() {
    const { blockedAudioAppend: t2, operationQueue: e2 } = this;
    t2 && e2 && (this.blockedAudioAppend = null, e2.unblockAudio(t2.op));
  }
  onBufferAppending(t2, e2) {
    const { tracks: s2 } = this, { data: i2, type: n2, parent: a2, frag: d2, part: c2, chunkMeta: u2, offset: f2 } = e2, m2 = u2.buffering[n2], { sn: p2, cc: v2 } = d2, y2 = self.performance.now();
    m2.start = y2;
    const E2 = d2.stats.buffering, T2 = c2 ? c2.stats.buffering : null;
    0 === E2.start && (E2.start = y2), T2 && 0 === T2.start && (T2.start = y2);
    const S2 = s2.audio;
    let L2 = false;
    "audio" === n2 && "audio/mpeg" === (null == S2 ? void 0 : S2.container) && (L2 = !this.lastMpegAudioChunk || 1 === u2.id || this.lastMpegAudioChunk.sn !== u2.sn, this.lastMpegAudioChunk = u2);
    const A2 = s2.video, R2 = null == A2 ? void 0 : A2.buffer;
    if (R2 && "initSegment" !== p2) {
      const t3 = c2 || d2, e3 = this.blockedAudioAppend;
      if ("audio" !== n2 || "main" === a2 || this.blockedAudioAppend || A2.ending || A2.ended) {
        if ("video" === n2) {
          const s3 = t3.end;
          if (e3) {
            const t4 = e3.frag.start;
            (s3 > t4 || s3 < this.lastVideoAppendEnd || BufferHelper.isBuffered(R2, t4)) && this.unblockAudio();
          }
          this.lastVideoAppendEnd = s3;
        }
      } else {
        const e4 = t3.start + 0.05 * t3.duration, s3 = R2.buffered, i3 = this.currentOp("video");
        s3.length || i3 ? !i3 && !BufferHelper.isBuffered(R2, e4) && this.lastVideoAppendEnd < e4 && this.blockAudio(t3) : this.blockAudio(t3);
      }
    }
    const b2 = (c2 || d2).start, I2 = { label: `append-${n2}`, execute: () => {
      var t3;
      m2.executeStart = self.performance.now();
      const e3 = null == (t3 = this.tracks[n2]) ? void 0 : t3.buffer;
      e3 && (L2 ? this.updateTimestampOffset(e3, b2, 0.1, n2, p2, v2) : void 0 !== f2 && r(f2) && this.updateTimestampOffset(e3, f2, 1e-6, n2, p2, v2)), this.appendExecutor(i2, n2);
    }, onStart: () => {
    }, onComplete: () => {
      const t3 = self.performance.now();
      m2.executeEnd = m2.end = t3, 0 === E2.first && (E2.first = t3), T2 && 0 === T2.first && (T2.first = t3);
      const e3 = {};
      this.sourceBuffers.forEach(([t4, s3]) => {
        t4 && (e3[t4] = BufferHelper.getBuffered(s3));
      }), this.appendErrors[n2] = 0, "audio" === n2 || "video" === n2 ? this.appendErrors.audiovideo = 0 : (this.appendErrors.audio = 0, this.appendErrors.video = 0), this.hls.trigger(h.BUFFER_APPENDED, { type: n2, frag: d2, part: c2, chunkMeta: u2, parent: d2.type, timeRanges: e3 });
    }, onError: (t3) => {
      var e3;
      const s3 = { type: o.MEDIA_ERROR, parent: d2.type, details: l.BUFFER_APPEND_ERROR, sourceBufferName: n2, frag: d2, part: c2, chunkMeta: u2, error: t3, err: t3, fatal: false }, i3 = null == (e3 = this.media) ? void 0 : e3.error;
      if (t3.code === DOMException.QUOTA_EXCEEDED_ERR || "QuotaExceededError" == t3.name || "quota" in t3) s3.details = l.BUFFER_FULL_ERROR;
      else if (t3.code === DOMException.INVALID_STATE_ERR && this.mediaSourceOpenOrEnded && !i3) s3.errorAction = oe(true);
      else if (t3.name === or && 0 === this.sourceBufferCount) s3.errorAction = oe(true);
      else {
        const t4 = ++this.appendErrors[n2];
        this.warn(`Failed ${t4}/${this.hls.config.appendErrorMaxRetry} times to append segment in "${n2}" sourceBuffer (${i3 || "no media error"})`), (t4 >= this.hls.config.appendErrorMaxRetry || i3) && (s3.fatal = true);
      }
      this.hls.trigger(h.ERROR, s3);
    } };
    this.log(`queuing "${n2}" append sn: ${p2}${c2 ? " p: " + c2.index : ""} of ${d2.type === g ? "level" : "track"} ${d2.level} cc: ${v2}`), this.append(I2, n2, this.isPending(this.tracks[n2]));
  }
  getFlushOp(t2, e2, s2) {
    return this.log(`queuing "${t2}" remove ${e2}-${s2}`), { label: "remove", execute: () => {
      this.removeExecutor(t2, e2, s2);
    }, onStart: () => {
    }, onComplete: () => {
      this.hls.trigger(h.BUFFER_FLUSHED, { type: t2 });
    }, onError: (i2) => {
      this.warn(`Failed to remove ${e2}-${s2} from "${t2}" SourceBuffer`, i2);
    } };
  }
  onBufferFlushing(t2, e2) {
    const { type: s2, startOffset: i2, endOffset: r2 } = e2;
    s2 ? this.append(this.getFlushOp(s2, i2, r2), s2) : this.sourceBuffers.forEach(([t3]) => {
      t3 && this.append(this.getFlushOp(t3, i2, r2), t3);
    });
  }
  onFragParsed(t2, e2) {
    const { frag: s2, part: i2 } = e2, r2 = [], n2 = i2 ? i2.elementaryStreams : s2.elementaryStreams;
    n2[B] ? r2.push("audiovideo") : (n2[F] && r2.push("audio"), n2[N] && r2.push("video")), 0 === r2.length && this.warn(`Fragments must have at least one ElementaryStreamType set. type: ${s2.type} level: ${s2.level} sn: ${s2.sn}`), this.blockBuffers(() => {
      const t3 = self.performance.now();
      s2.stats.buffering.end = t3, i2 && (i2.stats.buffering.end = t3);
      const e3 = i2 ? i2.stats : s2.stats;
      this.hls.trigger(h.FRAG_BUFFERED, { frag: s2, part: i2, stats: e3, id: s2.type });
    }, r2).catch((t3) => {
      this.warn(`Fragment buffered callback ${t3}`), this.stepOperationQueue(this.sourceBufferTypes);
    });
  }
  onFragChanged(t2, e2) {
    this.trimBuffers();
  }
  get bufferedToEnd() {
    return this.sourceBufferCount > 0 && !this.sourceBuffers.some(([t2]) => {
      if (t2) {
        const e2 = this.tracks[t2];
        if (e2) return !e2.ended || e2.ending;
      }
      return false;
    });
  }
  onBufferEos(t2, e2) {
    var s2;
    this.sourceBuffers.forEach(([t3]) => {
      if (t3) {
        const s3 = this.tracks[t3];
        e2.type && e2.type !== t3 || (s3.ending = true, s3.ended || (s3.ended = true, this.log(`${t3} buffer reached EOS`)));
      }
    });
    const i2 = false !== (null == (s2 = this.overrides) ? void 0 : s2.endOfStream);
    this.sourceBufferCount > 0 && !this.sourceBuffers.some(([t3]) => {
      var e3;
      return t3 && !(null != (e3 = this.tracks[t3]) && e3.ended);
    }) ? i2 ? (this.log("Queueing EOS"), this.blockUntilOpen(() => {
      this.tracksEnded();
      const { mediaSource: t3 } = this;
      t3 && "open" === t3.readyState ? (this.log("Calling mediaSource.endOfStream()"), t3.endOfStream(), this.hls.trigger(h.BUFFERED_TO_END, void 0)) : t3 && this.log(`Could not call mediaSource.endOfStream(). mediaSource.readyState: ${t3.readyState}`);
    })) : (this.tracksEnded(), this.hls.trigger(h.BUFFERED_TO_END, void 0)) : "video" === e2.type && this.unblockAudio();
  }
  tracksEnded() {
    this.sourceBuffers.forEach(([t2]) => {
      if (null !== t2) {
        const e2 = this.tracks[t2];
        e2 && (e2.ending = false);
      }
    });
  }
  onLevelUpdated(t2, { details: e2 }) {
    e2.fragments.length && (this.details = e2, this.updateDuration());
  }
  updateDuration() {
    this.blockUntilOpen(() => {
      const t2 = this.getDurationAndRange();
      t2 && this.updateMediaSource(t2);
    });
  }
  onError(t2, e2) {
    if (e2.details === l.BUFFER_APPEND_ERROR && e2.frag) {
      var s2;
      const t3 = null == (s2 = e2.errorAction) ? void 0 : s2.nextAutoLevel;
      r(t3) && t3 !== e2.frag.level && this.resetAppendErrors();
    }
  }
  resetAppendErrors() {
    this.appendErrors = { audio: 0, video: 0, audiovideo: 0 };
  }
  trimBuffers() {
    const { hls: t2, details: e2, media: s2 } = this;
    if (!s2 || null === e2) return;
    if (!this.sourceBufferCount) return;
    const i2 = t2.config, n2 = s2.currentTime, a2 = e2.levelTargetDuration, o2 = e2.live && null !== i2.liveBackBufferLength ? i2.liveBackBufferLength : i2.backBufferLength;
    if (r(o2) && o2 >= 0) {
      const t3 = Math.max(o2, a2), e3 = Math.floor(n2 / a2) * a2 - t3;
      this.flushBackBuffer(n2, a2, e3);
    }
    const l2 = i2.frontBufferFlushThreshold;
    if (r(l2) && l2 > 0) {
      const t3 = Math.max(i2.maxBufferLength, l2), e3 = Math.max(t3, a2), s3 = Math.floor(n2 / a2) * a2 + e3;
      this.flushFrontBuffer(n2, a2, s3);
    }
  }
  flushBackBuffer(t2, e2, s2) {
    this.sourceBuffers.forEach(([t3, e3]) => {
      if (e3) {
        const r2 = BufferHelper.getBuffered(e3);
        if (r2.length > 0 && s2 > r2.start(0)) {
          var i2;
          this.hls.trigger(h.BACK_BUFFER_REACHED, { bufferEnd: s2 });
          const e4 = this.tracks[t3];
          if (null != (i2 = this.details) && i2.live) this.hls.trigger(h.LIVE_BACK_BUFFER_REACHED, { bufferEnd: s2 });
          else if (null != e4 && e4.ended) return void this.log(`Cannot flush ${t3} back buffer while SourceBuffer is in ended state`);
          this.hls.trigger(h.BUFFER_FLUSHING, { startOffset: 0, endOffset: s2, type: t3 });
        }
      }
    });
  }
  flushFrontBuffer(t2, e2, s2) {
    this.sourceBuffers.forEach(([e3, i2]) => {
      if (i2) {
        const r2 = BufferHelper.getBuffered(i2), n2 = r2.length;
        if (n2 < 2) return;
        const a2 = r2.start(n2 - 1), o2 = r2.end(n2 - 1);
        if (s2 > a2 || t2 >= a2 && t2 <= o2) return;
        this.hls.trigger(h.BUFFER_FLUSHING, { startOffset: a2, endOffset: 1 / 0, type: e3 });
      }
    });
  }
  getDurationAndRange() {
    var t2;
    const { details: e2, mediaSource: s2 } = this;
    if (!e2 || !this.media || "open" !== (null == s2 ? void 0 : s2.readyState)) return null;
    const i2 = e2.edge;
    if (e2.live && this.hls.config.liveDurationInfinity) {
      if (e2.fragments.length && s2.setLiveSeekableRange) {
        const t3 = Math.max(0, e2.fragmentStart);
        return { duration: 1 / 0, start: t3, end: Math.max(t3, i2) };
      }
      return { duration: 1 / 0 };
    }
    const n2 = null == (t2 = this.overrides) ? void 0 : t2.duration;
    if (n2) return r(n2) ? { duration: n2 } : null;
    const a2 = this.media.duration;
    return i2 > (r(s2.duration) ? s2.duration : 0) && i2 > a2 || !r(a2) ? { duration: i2 } : null;
  }
  updateMediaSource({ duration: t2, start: e2, end: s2 }) {
    const i2 = this.mediaSource;
    this.media && i2 && "open" === i2.readyState && (i2.duration !== t2 && (r(t2) && this.log(`Updating MediaSource duration to ${t2.toFixed(3)}`), i2.duration = t2), void 0 !== e2 && void 0 !== s2 && (this.log(`MediaSource duration is set to ${i2.duration}. Setting seekable range to ${e2}-${s2}.`), i2.setLiveSeekableRange(e2, s2)));
  }
  get tracksReady() {
    const t2 = this.pendingTrackCount;
    return t2 > 0 && (t2 >= this.bufferCodecEventsTotal || this.isPending(this.tracks.audiovideo));
  }
  checkPendingTracks() {
    const { bufferCodecEventsTotal: t2, pendingTrackCount: e2, tracks: s2 } = this;
    if (this.log(`checkPendingTracks (pending: ${e2} codec events expected: ${t2}) ${$t(s2)}`), this.tracksReady) {
      var i2;
      const t3 = null == (i2 = this.transferData) ? void 0 : i2.tracks;
      t3 && Object.keys(t3).length ? this.attachTransferred() : this.createSourceBuffers();
    }
  }
  bufferCreated() {
    if (this.sourceBufferCount) {
      const t2 = {};
      this.sourceBuffers.forEach(([e2, s2]) => {
        if (e2) {
          const i2 = this.tracks[e2];
          t2[e2] = { buffer: s2, container: i2.container, codec: i2.codec, supplemental: i2.supplemental, levelCodec: i2.levelCodec, id: i2.id, metadata: i2.metadata };
        }
      }), this.hls.trigger(h.BUFFER_CREATED, { tracks: t2 }), this.log(`SourceBuffers created. Running queue: ${this.operationQueue}`), this.sourceBuffers.forEach(([t3]) => {
        this.executeNext(t3);
      });
    } else {
      const t2 = new Error("could not create source buffer for media codec(s)");
      this.hls.trigger(h.ERROR, { type: o.MEDIA_ERROR, details: l.BUFFER_INCOMPATIBLE_CODECS_ERROR, fatal: true, error: t2, reason: t2.message });
    }
  }
  createSourceBuffers() {
    const { tracks: t2, sourceBuffers: e2, mediaSource: s2 } = this;
    if (!s2) throw new Error("createSourceBuffers called when mediaSource was null");
    for (const r2 in t2) {
      const n2 = r2, a2 = t2[n2];
      if (this.isPending(a2)) {
        const t3 = this.getTrackCodec(a2, n2), r3 = `${a2.container};codecs=${t3}`;
        a2.codec = t3, this.log(`creating sourceBuffer(${r3})${this.currentOp(n2) ? " Queued" : ""} ${$t(a2)}`);
        try {
          const t4 = s2.addSourceBuffer(r3), i3 = hr(n2), o2 = [n2, t4];
          e2[i3] = o2, a2.buffer = t4;
        } catch (t4) {
          var i2;
          return this.error(`error while trying to add sourceBuffer: ${t4.message}`), this.shiftAndExecuteNext(n2), null == (i2 = this.operationQueue) || i2.removeBlockers(), delete this.tracks[n2], void this.hls.trigger(h.ERROR, { type: o.MEDIA_ERROR, details: l.BUFFER_ADD_CODEC_ERROR, fatal: false, error: t4, sourceBufferName: n2, mimeType: r3, parent: a2.id });
        }
        this.trackSourceBuffer(n2, a2);
      }
    }
    this.bufferCreated();
  }
  getTrackCodec(t2, e2) {
    const s2 = t2.supplemental;
    let i2 = t2.codec;
    s2 && ("video" === e2 || "audiovideo" === e2) && mt(s2, "video") && (i2 = function(t3, e3) {
      const s3 = [];
      if (t3) {
        const e4 = t3.split(",");
        for (let t4 = 0; t4 < e4.length; t4++) gt(e4[t4], "video") || s3.push(e4[t4]);
      }
      return e3 && s3.push(e3), s3.join(",");
    }(i2, s2));
    const r2 = At(i2, t2.levelCodec);
    return r2 ? "audio" === e2.slice(0, 5) ? Lt(r2, this.appendSource) : r2 : "";
  }
  trackSourceBuffer(t2, e2) {
    const s2 = e2.buffer;
    if (!s2) return;
    const i2 = this.getTrackCodec(e2, t2);
    this.tracks[t2] = { buffer: s2, codec: i2, container: e2.container, levelCodec: e2.levelCodec, supplemental: e2.supplemental, metadata: e2.metadata, id: e2.id, listeners: [] }, this.removeBufferListeners(t2), this.addBufferListener(t2, "updatestart", this.onSBUpdateStart), this.addBufferListener(t2, "updateend", this.onSBUpdateEnd), this.addBufferListener(t2, "error", this.onSBUpdateError), this.appendSource && this.addBufferListener(t2, "bufferedchange", (t3, e3) => {
      const s3 = e3.removedRanges;
      null != s3 && s3.length && this.hls.trigger(h.BUFFER_FLUSHED, { type: t3 });
    });
  }
  get mediaSrc() {
    var t2, e2;
    const s2 = (null == (t2 = this.media) || null == (e2 = t2.querySelector) ? void 0 : e2.call(t2, "source")) || this.media;
    return null == s2 ? void 0 : s2.src;
  }
  onSBUpdateStart(t2) {
    const e2 = this.currentOp(t2);
    e2 && e2.onStart();
  }
  onSBUpdateEnd(t2) {
    var e2;
    if ("closed" === (null == (e2 = this.mediaSource) ? void 0 : e2.readyState)) return void this.resetBuffer(t2);
    const s2 = this.currentOp(t2);
    s2 && (s2.onComplete(), this.shiftAndExecuteNext(t2));
  }
  onSBUpdateError(t2, e2) {
    var s2;
    const i2 = new Error(`${t2} SourceBuffer error. MediaSource readyState: ${null == (s2 = this.mediaSource) ? void 0 : s2.readyState}`);
    this.error(`${i2}`, e2), this.hls.trigger(h.ERROR, { type: o.MEDIA_ERROR, details: l.BUFFER_APPENDING_ERROR, sourceBufferName: t2, error: i2, fatal: false });
    const r2 = this.currentOp(t2);
    r2 && r2.onError(i2);
  }
  updateTimestampOffset(t2, e2, s2, i2, r2, n2) {
    const a2 = e2 - t2.timestampOffset;
    Math.abs(a2) >= s2 && (this.log(`Updating ${i2} SourceBuffer timestampOffset to ${e2} (sn: ${r2} cc: ${n2})`), t2.timestampOffset = e2);
  }
  removeExecutor(t2, e2, s2) {
    const { media: i2, mediaSource: n2 } = this, a2 = this.tracks[t2], o2 = null == a2 ? void 0 : a2.buffer;
    if (!i2 || !n2 || !o2) return this.warn(`Attempting to remove from the ${t2} SourceBuffer, but it does not exist`), void this.shiftAndExecuteNext(t2);
    const l2 = r(i2.duration) ? i2.duration : 1 / 0, h2 = r(n2.duration) ? n2.duration : 1 / 0, d2 = Math.max(0, e2), c2 = Math.min(s2, l2, h2);
    c2 > d2 && (!a2.ending || a2.ended) ? (a2.ended = false, this.log(`Removing [${d2},${c2}] from the ${t2} SourceBuffer`), o2.remove(d2, c2)) : this.shiftAndExecuteNext(t2);
  }
  appendExecutor(t2, e2) {
    const s2 = this.tracks[e2], i2 = null == s2 ? void 0 : s2.buffer;
    if (!i2) throw new HlsJsTrackRemovedError(`Attempting to append to the ${e2} SourceBuffer, but it does not exist`);
    s2.ending = false, s2.ended = false, i2.appendBuffer(t2);
  }
  blockUntilOpen(t2) {
    if (this.isUpdating() || this.isQueued()) this.blockBuffers(t2).catch((t3) => {
      this.warn(`SourceBuffer blocked callback ${t3}`), this.stepOperationQueue(this.sourceBufferTypes);
    });
    else try {
      t2();
    } catch (t3) {
      this.warn(`Callback run without blocking ${this.operationQueue} ${t3}`);
    }
  }
  isUpdating() {
    return this.sourceBuffers.some(([t2, e2]) => t2 && e2.updating);
  }
  isQueued() {
    return this.sourceBuffers.some(([t2]) => t2 && !!this.currentOp(t2));
  }
  isPending(t2) {
    return !!t2 && !t2.buffer;
  }
  blockBuffers(t2, e2 = this.sourceBufferTypes) {
    if (!e2.length) return this.log("Blocking operation requested, but no SourceBuffers exist"), Promise.resolve().then(t2);
    const { operationQueue: s2 } = this, i2 = e2.map((t3) => this.appendBlocker(t3));
    return e2.length > 1 && !!this.blockedAudioAppend && this.unblockAudio(), Promise.all(i2).then((e3) => {
      s2 === this.operationQueue && (t2(), this.stepOperationQueue(this.sourceBufferTypes));
    });
  }
  stepOperationQueue(t2) {
    t2.forEach((t3) => {
      var e2;
      const s2 = null == (e2 = this.tracks[t3]) ? void 0 : e2.buffer;
      s2 && !s2.updating && this.shiftAndExecuteNext(t3);
    });
  }
  append(t2, e2, s2) {
    this.operationQueue && this.operationQueue.append(t2, e2, s2);
  }
  appendBlocker(t2) {
    if (this.operationQueue) return this.operationQueue.appendBlocker(t2);
  }
  currentOp(t2) {
    return this.operationQueue ? this.operationQueue.current(t2) : null;
  }
  executeNext(t2) {
    t2 && this.operationQueue && this.operationQueue.executeNext(t2);
  }
  shiftAndExecuteNext(t2) {
    this.operationQueue && this.operationQueue.shiftAndExecuteNext(t2);
  }
  get pendingTrackCount() {
    return Object.keys(this.tracks).reduce((t2, e2) => t2 + (this.isPending(this.tracks[e2]) ? 1 : 0), 0);
  }
  get sourceBufferCount() {
    return this.sourceBuffers.reduce((t2, [e2]) => t2 + (e2 ? 1 : 0), 0);
  }
  get sourceBufferTypes() {
    return this.sourceBuffers.map(([t2]) => t2).filter((t2) => !!t2);
  }
  addBufferListener(t2, e2, s2) {
    const i2 = this.tracks[t2];
    if (!i2) return;
    const r2 = i2.buffer;
    if (!r2) return;
    const n2 = s2.bind(this, t2);
    i2.listeners.push({ event: e2, listener: n2 }), r2.addEventListener(e2, n2);
  }
  removeBufferListeners(t2) {
    const e2 = this.tracks[t2];
    if (!e2) return;
    const s2 = e2.buffer;
    s2 && (e2.listeners.forEach((t3) => {
      s2.removeEventListener(t3.event, t3.listener);
    }), e2.listeners.length = 0);
  }
}, capLevelController: CapLevelController, errorController: class extends Logger {
  constructor(t2) {
    super("error-controller", t2.logger), this.hls = void 0, this.playlistError = 0, this.hls = t2, this.registerListeners();
  }
  registerListeners() {
    const t2 = this.hls;
    t2.on(h.ERROR, this.onError, this), t2.on(h.MANIFEST_LOADING, this.onManifestLoading, this), t2.on(h.LEVEL_UPDATED, this.onLevelUpdated, this);
  }
  unregisterListeners() {
    const t2 = this.hls;
    t2 && (t2.off(h.ERROR, this.onError, this), t2.off(h.ERROR, this.onErrorOut, this), t2.off(h.MANIFEST_LOADING, this.onManifestLoading, this), t2.off(h.LEVEL_UPDATED, this.onLevelUpdated, this));
  }
  destroy() {
    this.unregisterListeners(), this.hls = null;
  }
  startLoad(t2) {
  }
  stopLoad() {
    this.playlistError = 0;
  }
  getVariantLevelIndex(t2) {
    return (null == t2 ? void 0 : t2.type) === g ? t2.level : this.getVariantIndex();
  }
  getVariantIndex() {
    var t2;
    const e2 = this.hls, s2 = e2.currentLevel;
    return null != (t2 = e2.loadLevelObj) && t2.details || -1 === s2 ? e2.loadLevel : s2;
  }
  variantHasKey(t2, e2) {
    if (t2) {
      var s2;
      if (null != (s2 = t2.details) && s2.hasKey(e2)) return true;
      const i2 = t2.audioGroups;
      if (i2) return this.hls.allAudioTracks.filter((t3) => i2.indexOf(t3.groupId) >= 0).some((t3) => {
        var s3;
        return null == (s3 = t3.details) ? void 0 : s3.hasKey(e2);
      });
    }
    return false;
  }
  onManifestLoading() {
    this.playlistError = 0;
  }
  onLevelUpdated() {
    this.playlistError = 0;
  }
  onError(t2, e2) {
    var s2;
    if (e2.fatal) return;
    const i2 = this.hls, r2 = e2.context;
    switch (e2.details) {
      case l.FRAG_LOAD_ERROR:
      case l.FRAG_LOAD_TIMEOUT:
      case l.KEY_LOAD_ERROR:
      case l.KEY_LOAD_TIMEOUT:
        return void (e2.errorAction = this.getFragRetryOrSwitchAction(e2));
      case l.FRAG_PARSING_ERROR:
        if (null != (s2 = e2.frag) && s2.gap) return void (e2.errorAction = oe());
      case l.FRAG_GAP:
      case l.FRAG_DECRYPT_ERROR:
        return e2.errorAction = this.getFragRetryOrSwitchAction(e2), void (e2.errorAction.action = 2);
      case l.LEVEL_EMPTY_ERROR:
      case l.LEVEL_PARSING_ERROR:
        {
          var n2;
          const t3 = e2.parent === g ? e2.level : i2.loadLevel;
          e2.details === l.LEVEL_EMPTY_ERROR && null != (n2 = e2.context) && null != (n2 = n2.levelDetails) && n2.live ? e2.errorAction = this.getPlaylistRetryOrSwitchAction(e2, t3) : (e2.levelRetry = false, e2.errorAction = this.getLevelSwitchAction(e2, t3));
        }
        return;
      case l.LEVEL_LOAD_ERROR:
      case l.LEVEL_LOAD_TIMEOUT:
        return void ("number" == typeof (null == r2 ? void 0 : r2.level) && (e2.errorAction = this.getPlaylistRetryOrSwitchAction(e2, r2.level)));
      case l.AUDIO_TRACK_LOAD_ERROR:
      case l.AUDIO_TRACK_LOAD_TIMEOUT:
      case l.SUBTITLE_LOAD_ERROR:
      case l.SUBTITLE_TRACK_LOAD_TIMEOUT:
        if (r2) {
          const t3 = i2.loadLevelObj;
          if (t3 && (r2.type === u && t3.hasAudioGroup(r2.groupId) || r2.type === f && t3.hasSubtitleGroup(r2.groupId))) return e2.errorAction = this.getPlaylistRetryOrSwitchAction(e2, i2.loadLevel), e2.errorAction.action = 2, void (e2.errorAction.flags = 1);
        }
        return;
      case l.KEY_SYSTEM_STATUS_OUTPUT_RESTRICTED:
        return void (e2.errorAction = { action: 2, flags: 2 });
      case l.KEY_SYSTEM_SESSION_UPDATE_FAILED:
      case l.KEY_SYSTEM_STATUS_INTERNAL_ERROR:
      case l.KEY_SYSTEM_NO_SESSION:
        return void (e2.errorAction = { action: 2, flags: 4 });
      case l.BUFFER_ADD_CODEC_ERROR:
      case l.REMUX_ALLOC_ERROR:
      case l.BUFFER_APPEND_ERROR:
        var a2;
        return void (e2.errorAction || (e2.errorAction = this.getLevelSwitchAction(e2, null != (a2 = e2.level) ? a2 : i2.loadLevel)));
      case l.INTERNAL_EXCEPTION:
      case l.BUFFER_APPENDING_ERROR:
      case l.BUFFER_FULL_ERROR:
      case l.LEVEL_SWITCH_ERROR:
      case l.BUFFER_STALLED_ERROR:
      case l.BUFFER_SEEK_OVER_HOLE:
      case l.BUFFER_NUDGE_ON_STALL:
        return void (e2.errorAction = oe());
    }
    e2.type === o.KEY_SYSTEM_ERROR && (e2.levelRetry = false, e2.errorAction = oe());
  }
  getPlaylistRetryOrSwitchAction(t2, e2) {
    const s2 = se(this.hls.config.playlistLoadPolicy, t2), i2 = this.playlistError++;
    if (ne(s2, i2, Jt(t2), t2.response)) return { action: 5, flags: 0, retryConfig: s2, retryCount: i2 };
    const r2 = this.getLevelSwitchAction(t2, e2);
    return s2 && (r2.retryConfig = s2, r2.retryCount = i2), r2;
  }
  getFragRetryOrSwitchAction(t2) {
    const e2 = this.hls, s2 = this.getVariantLevelIndex(t2.frag), i2 = e2.levels[s2], { fragLoadPolicy: r2, keyLoadPolicy: n2 } = e2.config, a2 = se(te(t2) ? n2 : r2, t2), o2 = e2.levels.reduce((t3, e3) => t3 + e3.fragmentError, 0);
    if (i2 && (t2.details !== l.FRAG_GAP && i2.fragmentError++, !ee(t2)) && ne(a2, o2, Jt(t2), t2.response)) return { action: 5, flags: 0, retryConfig: a2, retryCount: o2 };
    const h2 = this.getLevelSwitchAction(t2, s2);
    return a2 && (h2.retryConfig = a2, h2.retryCount = o2), h2;
  }
  getLevelSwitchAction(t2, e2) {
    const s2 = this.hls;
    null == e2 && (e2 = s2.loadLevel);
    const i2 = this.hls.levels[e2];
    if (i2) {
      var r2, n2;
      const e3 = t2.details;
      i2.loadError++, e3 === l.BUFFER_APPEND_ERROR && i2.fragmentError++;
      let h2 = -1;
      const { levels: d2, loadLevel: c2, minAutoLevel: v2, maxAutoLevel: y2 } = s2;
      s2.autoLevelEnabled || s2.config.preserveManualLevelOnError || (s2.loadLevel = -1);
      const E2 = null == (r2 = t2.frag) ? void 0 : r2.type, T2 = (E2 === m && e3 === l.FRAG_PARSING_ERROR || "audio" === t2.sourceBufferName && (e3 === l.BUFFER_ADD_CODEC_ERROR || e3 === l.BUFFER_APPEND_ERROR)) && d2.some(({ audioCodec: t3 }) => i2.audioCodec !== t3), S2 = "video" === t2.sourceBufferName && (e3 === l.BUFFER_ADD_CODEC_ERROR || e3 === l.BUFFER_APPEND_ERROR) && d2.some(({ codecSet: t3, audioCodec: e4 }) => i2.codecSet !== t3 && i2.audioCodec === e4), { type: L2, groupId: A2 } = null != (n2 = t2.context) ? n2 : {};
      for (let s3 = d2.length; s3--; ) {
        const r3 = (s3 + c2) % d2.length;
        if (r3 !== c2 && r3 >= v2 && r3 <= y2 && 0 === d2[r3].loadError) {
          var a2, o2;
          const s4 = d2[r3];
          if (e3 === l.FRAG_GAP && E2 === g && t2.frag) {
            const e4 = d2[r3].details;
            if (e4) {
              const s5 = Xt(t2.frag, e4.fragments, t2.frag.start);
              if (null != s5 && s5.gap) continue;
            }
          } else {
            if (L2 === u && s4.hasAudioGroup(A2) || L2 === f && s4.hasSubtitleGroup(A2)) continue;
            if (E2 === m && null != (a2 = i2.audioGroups) && a2.some((t3) => s4.hasAudioGroup(t3)) || E2 === p && null != (o2 = i2.subtitleGroups) && o2.some((t3) => s4.hasSubtitleGroup(t3)) || T2 && i2.audioCodec === s4.audioCodec || S2 && i2.codecSet === s4.codecSet || !T2 && i2.codecSet !== s4.codecSet) continue;
          }
          h2 = r3;
          break;
        }
      }
      if (h2 > -1 && s2.loadLevel !== h2) return t2.levelRetry = true, this.playlistError = 0, { action: 2, flags: 0, nextAutoLevel: h2 };
    }
    return { action: 2, flags: 1 };
  }
  onErrorOut(t2, e2) {
    var s2;
    switch (null == (s2 = e2.errorAction) ? void 0 : s2.action) {
      case 0:
        break;
      case 2:
        this.sendAlternateToPenaltyBox(e2), e2.errorAction.resolved || e2.details === l.FRAG_GAP ? /MediaSource readyState: ended/.test(e2.error.message) && (this.warn(`MediaSource ended after "${e2.sourceBufferName}" sourceBuffer append error. Attempting to recover from media error.`), this.hls.recoverMediaError()) : e2.fatal = true;
    }
    e2.fatal && this.hls.stopLoad();
  }
  sendAlternateToPenaltyBox(t2) {
    const e2 = this.hls, s2 = t2.errorAction;
    if (!s2) return;
    const { flags: i2 } = s2, r2 = s2.nextAutoLevel;
    switch (i2) {
      case 0:
        this.switchLevel(t2, r2);
        break;
      case 2: {
        const i3 = this.getVariantLevelIndex(t2.frag), r3 = e2.levels[i3], n3 = null == r3 ? void 0 : r3.attrs["HDCP-LEVEL"];
        if (s2.hdcpLevel = n3, "NONE" === n3) this.warn("HDCP policy resticted output with HDCP-LEVEL=NONE");
        else if (n3) {
          e2.maxHdcpLevel = Ot[Ot.indexOf(n3) - 1], s2.resolved = true, this.warn(`Restricting playback to HDCP-LEVEL of "${e2.maxHdcpLevel}" or lower`);
          break;
        }
      }
      case 4: {
        const e3 = t2.decryptdata;
        if (e3) {
          const i3 = this.hls.levels, r3 = i3.length;
          for (let s3 = r3; s3--; ) {
            var n2, a2;
            this.variantHasKey(i3[s3], e3) && (this.log(`Banned key found in level ${s3} (${i3[s3].bitrate}bps) or audio group "${null == (n2 = i3[s3].audioGroups) ? void 0 : n2.join(",")}" (${null == (a2 = t2.frag) ? void 0 : a2.type} fragment) ${_(e3.keyId || [])}`), i3[s3].fragmentError++, i3[s3].loadError++, this.log(`Removing level ${s3} with key error (${t2.error})`), this.hls.removeLevel(s3));
          }
          const o2 = t2.frag;
          if (this.hls.levels.length < r3) s2.resolved = true;
          else if (o2 && o2.type !== g) {
            const t3 = o2.decryptdata;
            t3 && !e3.matches(t3) && (s2.resolved = true);
          }
        }
        break;
      }
    }
    s2.resolved || this.switchLevel(t2, r2);
  }
  switchLevel(t2, e2) {
    if (void 0 !== e2 && t2.errorAction && (this.warn(`switching to level ${e2} after ${t2.details}`), this.hls.nextAutoLevel = e2, t2.errorAction.resolved = true, this.hls.nextLoadLevel = this.hls.nextAutoLevel, t2.details === l.BUFFER_ADD_CODEC_ERROR && t2.mimeType && "audiovideo" !== t2.sourceBufferName)) {
      const e3 = kt(t2.mimeType), s2 = this.hls.levels;
      for (let i2 = s2.length; i2--; ) s2[i2][`${t2.sourceBufferName}Codec`] === e3 && (this.log(`Removing level ${i2} for ${t2.details} ("${e3}" not supported)`), this.hls.removeLevel(i2));
    }
  }
}, fpsController: class {
  constructor(t2) {
    this.hls = void 0, this.isVideoPlaybackQualityAvailable = false, this.timer = void 0, this.media = null, this.lastTime = void 0, this.lastDroppedFrames = 0, this.lastDecodedFrames = 0, this.streamController = void 0, this.hls = t2, this.registerListeners();
  }
  setStreamController(t2) {
    this.streamController = t2;
  }
  registerListeners() {
    this.hls.on(h.MEDIA_ATTACHING, this.onMediaAttaching, this), this.hls.on(h.MEDIA_DETACHING, this.onMediaDetaching, this);
  }
  unregisterListeners() {
    this.hls.off(h.MEDIA_ATTACHING, this.onMediaAttaching, this), this.hls.off(h.MEDIA_DETACHING, this.onMediaDetaching, this);
  }
  destroy() {
    this.timer && clearInterval(this.timer), this.unregisterListeners(), this.isVideoPlaybackQualityAvailable = false, this.media = null;
  }
  onMediaAttaching(t2, e2) {
    const s2 = this.hls.config;
    if (s2.capLevelOnFPSDrop) {
      const t3 = e2.media instanceof self.HTMLVideoElement ? e2.media : null;
      this.media = t3, t3 && "function" == typeof t3.getVideoPlaybackQuality && (this.isVideoPlaybackQualityAvailable = true), self.clearInterval(this.timer), this.timer = self.setInterval(this.checkFPSInterval.bind(this), s2.fpsDroppedMonitoringPeriod);
    }
  }
  onMediaDetaching() {
    this.media = null;
  }
  checkFPS(t2, e2, s2) {
    const i2 = performance.now();
    if (e2) {
      if (this.lastTime) {
        const t3 = i2 - this.lastTime, r2 = s2 - this.lastDroppedFrames, n2 = e2 - this.lastDecodedFrames, a2 = 1e3 * r2 / t3, o2 = this.hls;
        if (o2.trigger(h.FPS_DROP, { currentDropped: r2, currentDecoded: n2, totalDroppedFrames: s2 }), a2 > 0 && r2 > o2.config.fpsDroppedMonitoringThreshold * n2) {
          let t4 = o2.currentLevel;
          o2.logger.warn("drop FPS ratio greater than max allowed value for currentLevel: " + t4), t4 > 0 && (-1 === o2.autoLevelCapping || o2.autoLevelCapping >= t4) && (t4 -= 1, o2.trigger(h.FPS_DROP_LEVEL_CAPPING, { level: t4, droppedLevel: o2.currentLevel }), o2.autoLevelCapping = t4, this.streamController.nextLevelSwitch());
        }
      }
      this.lastTime = i2, this.lastDroppedFrames = s2, this.lastDecodedFrames = e2;
    }
  }
  checkFPSInterval() {
    const t2 = this.media;
    if (t2) if (this.isVideoPlaybackQualityAvailable) {
      const e2 = t2.getVideoPlaybackQuality();
      this.checkFPS(t2, e2.totalVideoFrames, e2.droppedVideoFrames);
    } else this.checkFPS(t2, t2.webkitDecodedFrameCount, t2.webkitDroppedFrameCount);
  }
}, stretchShortVideoTrack: false, maxAudioFramesDrift: 1, forceKeyFrameOnDiscontinuity: true, abrEwmaFastLive: 3, abrEwmaSlowLive: 9, abrEwmaFastVoD: 3, abrEwmaSlowVoD: 9, abrEwmaDefaultEstimate: 5e5, abrEwmaDefaultEstimateMax: 5e6, abrBandWidthFactor: 0.95, abrBandWidthUpFactor: 0.7, abrMaxWithRealBitrate: false, maxStarvationDelay: 4, maxLoadingDelay: 4, minAutoBitrate: 0, emeEnabled: false, widevineLicenseUrl: void 0, drmSystems: {}, drmSystemOptions: {}, requestMediaKeySystemAccessFunc: Ye, requireKeySystemAccessOnStart: false, testBandwidth: true, progressive: false, lowLatencyMode: true, cmcd: void 0, enableDateRangeMetadataCues: true, enableEmsgMetadataCues: true, enableEmsgKLVMetadata: false, enableID3MetadataCues: true, enableInterstitialPlayback: true, interstitialAppendInPlace: true, interstitialLiveLookAhead: 10, useMediaCapabilities: true, preserveManualLevelOnError: false, certLoadPolicy: { default: { maxTimeToFirstByteMs: 8e3, maxLoadTimeMs: 2e4, timeoutRetry: null, errorRetry: null } }, keyLoadPolicy: { default: { maxTimeToFirstByteMs: 8e3, maxLoadTimeMs: 2e4, timeoutRetry: { maxNumRetry: 1, retryDelayMs: 1e3, maxRetryDelayMs: 2e4, backoff: "linear" }, errorRetry: { maxNumRetry: 8, retryDelayMs: 1e3, maxRetryDelayMs: 2e4, backoff: "linear" } } }, manifestLoadPolicy: { default: { maxTimeToFirstByteMs: 1 / 0, maxLoadTimeMs: 2e4, timeoutRetry: { maxNumRetry: 2, retryDelayMs: 0, maxRetryDelayMs: 0 }, errorRetry: { maxNumRetry: 1, retryDelayMs: 1e3, maxRetryDelayMs: 8e3 } } }, playlistLoadPolicy: { default: { maxTimeToFirstByteMs: 1e4, maxLoadTimeMs: 2e4, timeoutRetry: { maxNumRetry: 2, retryDelayMs: 0, maxRetryDelayMs: 0 }, errorRetry: { maxNumRetry: 2, retryDelayMs: 1e3, maxRetryDelayMs: 8e3 } } }, fragLoadPolicy: { default: { maxTimeToFirstByteMs: 1e4, maxLoadTimeMs: 12e4, timeoutRetry: { maxNumRetry: 4, retryDelayMs: 0, maxRetryDelayMs: 0 }, errorRetry: { maxNumRetry: 6, retryDelayMs: 1e3, maxRetryDelayMs: 8e3 } } }, steeringManifestLoadPolicy: { default: { maxTimeToFirstByteMs: 1e4, maxLoadTimeMs: 2e4, timeoutRetry: { maxNumRetry: 2, retryDelayMs: 0, maxRetryDelayMs: 0 }, errorRetry: { maxNumRetry: 1, retryDelayMs: 1e3, maxRetryDelayMs: 8e3 } } }, interstitialAssetListLoadPolicy: { default: { maxTimeToFirstByteMs: 1e4, maxLoadTimeMs: 3e4, timeoutRetry: { maxNumRetry: 0, retryDelayMs: 0, maxRetryDelayMs: 0 }, errorRetry: { maxNumRetry: 0, retryDelayMs: 1e3, maxRetryDelayMs: 8e3 } } }, manifestLoadingTimeOut: 1e4, manifestLoadingMaxRetry: 1, manifestLoadingRetryDelay: 1e3, manifestLoadingMaxRetryTimeout: 64e3, levelLoadingTimeOut: 1e4, levelLoadingMaxRetry: 4, levelLoadingRetryDelay: 1e3, levelLoadingMaxRetryTimeout: 64e3, fragLoadingTimeOut: 2e4, fragLoadingMaxRetry: 6, fragLoadingRetryDelay: 1e3, fragLoadingMaxRetryTimeout: 64e3 }, { cueHandler: Zn, enableWebVTT: true, enableIMSC1: true, enableCEA708Captions: true, captionsTextTrack1Label: "English", captionsTextTrack1LanguageCode: "en", captionsTextTrack2Label: "Spanish", captionsTextTrack2LanguageCode: "es", captionsTextTrack3Label: "Unknown CC", captionsTextTrack3LanguageCode: "", captionsTextTrack4Label: "Unknown CC", captionsTextTrack4LanguageCode: "", renderTextTracksNatively: true }), {}, { subtitleStreamController: class extends BaseStreamController {
  constructor(t2, e2, s2) {
    super(t2, e2, s2, "subtitle-stream-controller", p), this.currentTrackId = -1, this.tracksBuffered = [], this.mainDetails = null, this.registerListeners();
  }
  onHandlerDestroying() {
    this.unregisterListeners(), super.onHandlerDestroying(), this.mainDetails = null;
  }
  registerListeners() {
    super.registerListeners();
    const { hls: t2 } = this;
    t2.on(h.LEVEL_LOADED, this.onLevelLoaded, this), t2.on(h.SUBTITLE_TRACKS_UPDATED, this.onSubtitleTracksUpdated, this), t2.on(h.SUBTITLE_TRACK_SWITCH, this.onSubtitleTrackSwitch, this), t2.on(h.SUBTITLE_TRACK_LOADED, this.onSubtitleTrackLoaded, this), t2.on(h.SUBTITLE_FRAG_PROCESSED, this.onSubtitleFragProcessed, this), t2.on(h.BUFFER_FLUSHING, this.onBufferFlushing, this);
  }
  unregisterListeners() {
    super.unregisterListeners();
    const { hls: t2 } = this;
    t2.off(h.LEVEL_LOADED, this.onLevelLoaded, this), t2.off(h.SUBTITLE_TRACKS_UPDATED, this.onSubtitleTracksUpdated, this), t2.off(h.SUBTITLE_TRACK_SWITCH, this.onSubtitleTrackSwitch, this), t2.off(h.SUBTITLE_TRACK_LOADED, this.onSubtitleTrackLoaded, this), t2.off(h.SUBTITLE_FRAG_PROCESSED, this.onSubtitleFragProcessed, this), t2.off(h.BUFFER_FLUSHING, this.onBufferFlushing, this);
  }
  startLoad(t2, e2) {
    this.stopLoad(), this.state = ws, this.setInterval(500), this.nextLoadPosition = this.lastCurrentTime = t2 + this.timelineOffset, this.startPosition = e2 ? -1 : t2, this.tick();
  }
  onManifestLoading() {
    super.onManifestLoading(), this.mainDetails = null;
  }
  onMediaDetaching(t2, e2) {
    this.tracksBuffered = [], super.onMediaDetaching(t2, e2);
  }
  onLevelLoaded(t2, e2) {
    this.mainDetails = e2.details;
  }
  onSubtitleFragProcessed(t2, e2) {
    const { frag: s2, success: i2 } = e2;
    if (this.fragContextChanged(s2) || ($(s2) && (this.fragPrevious = s2), this.state = ws), !i2) return;
    const r2 = this.tracksBuffered[this.currentTrackId];
    if (!r2) return;
    let n2;
    const a2 = s2.start;
    for (let t3 = 0; t3 < r2.length; t3++) if (a2 >= r2[t3].start && a2 <= r2[t3].end) {
      n2 = r2[t3];
      break;
    }
    const o2 = s2.start + s2.duration;
    n2 ? n2.end = o2 : (n2 = { start: a2, end: o2 }, r2.push(n2)), this.fragmentTracker.fragBuffered(s2), this.fragBufferedComplete(s2, null), this.media && this.tick();
  }
  onBufferFlushing(t2, e2) {
    const { startOffset: s2, endOffset: i2 } = e2;
    if (0 === s2 && i2 !== Number.POSITIVE_INFINITY) {
      const t3 = i2 - 1;
      if (t3 <= 0) return;
      e2.endOffsetSubtitles = Math.max(0, t3), this.tracksBuffered.forEach((e3) => {
        for (let s3 = 0; s3 < e3.length; ) if (e3[s3].end <= t3) e3.shift();
        else {
          if (!(e3[s3].start < t3)) break;
          e3[s3].start = t3, s3++;
        }
      }), this.fragmentTracker.removeFragmentsInRange(s2, t3, p);
    }
  }
  onError(t2, e2) {
    const s2 = e2.frag;
    (null == s2 ? void 0 : s2.type) === p && (e2.details === l.FRAG_GAP && this.fragmentTracker.fragBuffered(s2, true), this.fragCurrent && this.fragCurrent.abortRequests(), this.state !== Cs && (this.state = ws));
  }
  onSubtitleTracksUpdated(t2, { subtitleTracks: e2 }) {
    this.levels && ir(this.levels, e2) ? this.levels = e2.map((t3) => new Level(t3)) : (this.tracksBuffered = [], this.levels = e2.map((t3) => {
      const e3 = new Level(t3);
      return this.tracksBuffered[e3.id] = [], e3;
    }), this.fragmentTracker.removeFragmentsInRange(0, Number.POSITIVE_INFINITY, p), this.fragPrevious = null, this.mediaBuffer = null);
  }
  onSubtitleTrackSwitch(t2, e2) {
    var s2;
    if (this.currentTrackId = e2.id, null == (s2 = this.levels) || !s2.length || -1 === this.currentTrackId) return void this.clearInterval();
    const i2 = this.levels[this.currentTrackId];
    null != i2 && i2.details ? this.mediaBuffer = this.mediaBufferTimeRanges : this.mediaBuffer = null, i2 && this.state !== Cs && this.setInterval(500);
  }
  onSubtitleTrackLoaded(t2, e2) {
    var s2;
    const { currentTrackId: i2, levels: r2 } = this, { details: n2, id: a2 } = e2;
    if (!r2) return void this.warn(`Subtitle tracks were reset while loading level ${a2}`);
    const o2 = r2[a2];
    if (a2 >= r2.length || !o2) return;
    this.log(`Subtitle track ${a2} loaded [${n2.startSN},${n2.endSN}]${n2.lastPartSn ? `[part-${n2.lastPartSn}-${n2.lastPartIndex}]` : ""},duration:${n2.totalduration}`), this.mediaBuffer = this.mediaBufferTimeRanges;
    let l2 = 0;
    if (n2.live || null != (s2 = o2.details) && s2.live) {
      if (n2.deltaUpdateFailed) return;
      const t3 = this.mainDetails;
      if (!t3) return void (this.startFragRequested = false);
      const e3 = t3.fragments[0];
      var d2;
      o2.details ? (l2 = this.alignPlaylists(n2, o2.details, null == (d2 = this.levelLastLoaded) ? void 0 : d2.details), 0 === l2 && e3 && (l2 = e3.start, ps(n2, l2))) : n2.hasProgramDateTime && t3.hasProgramDateTime ? (Ps(n2, t3), l2 = n2.fragmentStart) : e3 && (l2 = e3.start, ps(n2, l2)), t3 && !this.startFragRequested && this.setStartPosition(t3, l2);
    }
    o2.details = n2, this.levelLastLoaded = o2, a2 === i2 && (this.hls.trigger(h.SUBTITLE_TRACK_UPDATED, { details: n2, id: a2, groupId: e2.groupId }), this.tick(), n2.live && !this.fragCurrent && this.media && this.state === ws) && (Xt(null, n2.fragments, this.media.currentTime, 0) || (this.warn("Subtitle playlist not aligned with playback"), o2.details = void 0));
  }
  _handleFragmentLoadComplete(t2) {
    const { frag: e2, payload: s2 } = t2, i2 = e2.decryptdata, r2 = this.hls;
    if (!this.fragContextChanged(e2) && s2 && s2.byteLength > 0 && null != i2 && i2.key && i2.iv && _e(i2.method)) {
      const t3 = performance.now();
      this.decrypter.decrypt(new Uint8Array(s2), i2.key.buffer, i2.iv.buffer, Ce(i2.method)).catch((t4) => {
        throw r2.trigger(h.ERROR, { type: o.MEDIA_ERROR, details: l.FRAG_DECRYPT_ERROR, fatal: false, error: t4, reason: t4.message, frag: e2 }), t4;
      }).then((s3) => {
        const i3 = performance.now();
        r2.trigger(h.FRAG_DECRYPTED, { frag: e2, payload: s3, stats: { tstart: t3, tdecrypt: i3 } });
      }).catch((t4) => {
        this.warn(`${t4.name}: ${t4.message}`), this.state = ws;
      });
    }
  }
  doTick() {
    if (this.media) {
      if (this.state === ws) {
        const { currentTrackId: t2, levels: e2 } = this, s2 = null == e2 ? void 0 : e2[t2];
        if (!s2 || !e2.length || !s2.details) return;
        if (this.waitForLive(s2)) return;
        const { config: i2 } = this, r2 = this.getLoadPosition(), n2 = BufferHelper.bufferedInfo(this.tracksBuffered[this.currentTrackId] || [], r2, i2.maxBufferHole), { end: a2, len: o2 } = n2, l2 = s2.details;
        if (o2 > this.hls.maxBufferLength + l2.levelTargetDuration) return;
        const h2 = l2.fragments, d2 = h2.length, c2 = l2.edge;
        let u2 = null;
        const f2 = this.fragPrevious;
        if (a2 < c2) {
          const t3 = i2.maxFragLookUpTolerance, e3 = a2 > c2 - t3 ? 0 : t3;
          u2 = Xt(f2, h2, Math.max(h2[0].start, a2), e3), !u2 && f2 && f2.start < h2[0].start && (u2 = h2[0]);
        } else u2 = h2[d2 - 1];
        if (u2 = this.filterReplacedPrimary(u2, s2.details), !u2) return;
        const g2 = h2[u2.sn - l2.startSN - 1];
        if (g2 && g2.cc === u2.cc && this.fragmentTracker.getState(g2) === le && (u2 = g2), this.fragmentTracker.getState(u2) === le) {
          const t3 = this.mapToInitFragWhenRequired(u2);
          t3 && this.loadFragment(t3, s2, a2);
        }
      }
    } else this.state = ws;
  }
  loadFragment(t2, e2, s2) {
    $(t2) ? super.loadFragment(t2, e2, s2) : this._loadInitSegment(t2, e2);
  }
  get mediaBufferTimeRanges() {
    return new BufferableInstance(this.tracksBuffered[this.currentTrackId] || []);
  }
}, subtitleTrackController: class extends BasePlaylistController {
  constructor(t2) {
    super(t2, "subtitle-track-controller"), this.media = null, this.tracks = [], this.groupIds = null, this.tracksInGroup = [], this.trackId = -1, this.currentTrack = null, this.selectDefaultTrack = true, this.queuedDefaultTrack = -1, this.useTextTrackPolling = false, this.subtitlePollingInterval = -1, this._subtitleDisplay = true, this.asyncPollTrackChange = () => this.pollTrackChange(0), this.onTextTracksChanged = () => {
      if (this.useTextTrackPolling || self.clearInterval(this.subtitlePollingInterval), !this.media || !this.hls.config.renderTextTracksNatively) return;
      let t3 = null;
      const e2 = rn(this.media.textTracks);
      for (let s3 = 0; s3 < e2.length; s3++) if ("hidden" === e2[s3].mode) t3 = e2[s3];
      else if ("showing" === e2[s3].mode) {
        t3 = e2[s3];
        break;
      }
      const s2 = this.findTrackForTextTrack(t3);
      this.subtitleTrack !== s2 && this.setSubtitleTrack(s2);
    }, this.registerListeners();
  }
  destroy() {
    this.unregisterListeners(), this.tracks.length = 0, this.tracksInGroup.length = 0, this.currentTrack = null, this.onTextTracksChanged = this.asyncPollTrackChange = null, super.destroy();
  }
  get subtitleDisplay() {
    return this._subtitleDisplay;
  }
  set subtitleDisplay(t2) {
    this._subtitleDisplay = t2, this.trackId > -1 && this.toggleTrackModes();
  }
  registerListeners() {
    const { hls: t2 } = this;
    t2.on(h.MEDIA_ATTACHED, this.onMediaAttached, this), t2.on(h.MEDIA_DETACHING, this.onMediaDetaching, this), t2.on(h.MANIFEST_LOADING, this.onManifestLoading, this), t2.on(h.MANIFEST_PARSED, this.onManifestParsed, this), t2.on(h.LEVEL_LOADING, this.onLevelLoading, this), t2.on(h.LEVEL_SWITCHING, this.onLevelSwitching, this), t2.on(h.SUBTITLE_TRACK_LOADED, this.onSubtitleTrackLoaded, this), t2.on(h.ERROR, this.onError, this);
  }
  unregisterListeners() {
    const { hls: t2 } = this;
    t2.off(h.MEDIA_ATTACHED, this.onMediaAttached, this), t2.off(h.MEDIA_DETACHING, this.onMediaDetaching, this), t2.off(h.MANIFEST_LOADING, this.onManifestLoading, this), t2.off(h.MANIFEST_PARSED, this.onManifestParsed, this), t2.off(h.LEVEL_LOADING, this.onLevelLoading, this), t2.off(h.LEVEL_SWITCHING, this.onLevelSwitching, this), t2.off(h.SUBTITLE_TRACK_LOADED, this.onSubtitleTrackLoaded, this), t2.off(h.ERROR, this.onError, this);
  }
  onMediaAttached(t2, e2) {
    this.media = e2.media, this.media && (this.queuedDefaultTrack > -1 && (this.subtitleTrack = this.queuedDefaultTrack, this.queuedDefaultTrack = -1), this.useTextTrackPolling = !(this.media.textTracks && "onchange" in this.media.textTracks), this.useTextTrackPolling ? this.pollTrackChange(500) : this.media.textTracks.addEventListener("change", this.asyncPollTrackChange));
  }
  pollTrackChange(t2) {
    self.clearInterval(this.subtitlePollingInterval), this.subtitlePollingInterval = self.setInterval(this.onTextTracksChanged, t2);
  }
  onMediaDetaching(t2, e2) {
    const s2 = this.media;
    if (!s2) return;
    const i2 = !!e2.transferMedia;
    self.clearInterval(this.subtitlePollingInterval), this.useTextTrackPolling || s2.textTracks.removeEventListener("change", this.asyncPollTrackChange), this.trackId > -1 && (this.queuedDefaultTrack = this.trackId), this.subtitleTrack = -1, this.media = null, i2 || rn(s2.textTracks).forEach((t3) => {
      en(t3);
    });
  }
  onManifestLoading() {
    this.tracks = [], this.groupIds = null, this.tracksInGroup = [], this.trackId = -1, this.currentTrack = null, this.selectDefaultTrack = true;
  }
  onManifestParsed(t2, e2) {
    this.tracks = e2.subtitleTracks;
  }
  onSubtitleTrackLoaded(t2, e2) {
    const { id: s2, groupId: i2, details: r2 } = e2, n2 = this.tracksInGroup[s2];
    if (!n2 || n2.groupId !== i2) return void this.warn(`Subtitle track with id:${s2} and group:${i2} not found in active group ${null == n2 ? void 0 : n2.groupId}`);
    const a2 = n2.details;
    n2.details = e2.details, this.log(`Subtitle track ${s2} "${n2.name}" lang:${n2.lang} group:${i2} loaded [${r2.startSN}-${r2.endSN}]`), s2 === this.trackId && this.playlistLoaded(s2, e2, a2);
  }
  onLevelLoading(t2, e2) {
    this.switchLevel(e2.level);
  }
  onLevelSwitching(t2, e2) {
    this.switchLevel(e2.level);
  }
  switchLevel(t2) {
    const e2 = this.hls.levels[t2];
    if (!e2) return;
    const s2 = e2.subtitleGroups || null, i2 = this.groupIds;
    let r2 = this.currentTrack;
    if (!s2 || (null == i2 ? void 0 : i2.length) !== (null == s2 ? void 0 : s2.length) || null != s2 && s2.some((t3) => -1 === (null == i2 ? void 0 : i2.indexOf(t3)))) {
      this.groupIds = s2, this.trackId = -1, this.currentTrack = null;
      const t3 = this.tracks.filter((t4) => !s2 || -1 !== s2.indexOf(t4.groupId));
      if (t3.length) this.selectDefaultTrack && !t3.some((t4) => t4.default) && (this.selectDefaultTrack = false), t3.forEach((t4, e4) => {
        t4.id = e4;
      });
      else if (!r2 && !this.tracksInGroup.length) return;
      this.tracksInGroup = t3;
      const e3 = this.hls.config.subtitlePreference;
      if (!r2 && e3) {
        this.selectDefaultTrack = false;
        const s3 = Ht(e3, t3);
        if (s3 > -1) r2 = t3[s3];
        else {
          const t4 = Ht(e3, this.tracks);
          r2 = this.tracks[t4];
        }
      }
      let i3 = this.findTrackId(r2);
      -1 === i3 && r2 && (i3 = this.findTrackId(null));
      const n2 = { subtitleTracks: t3 };
      this.log(`Updating subtitle tracks, ${t3.length} track(s) found in "${null == s2 ? void 0 : s2.join(",")}" group-id`), this.hls.trigger(h.SUBTITLE_TRACKS_UPDATED, n2), -1 !== i3 && -1 === this.trackId && this.setSubtitleTrack(i3);
    }
  }
  findTrackId(t2) {
    const e2 = this.tracksInGroup, s2 = this.selectDefaultTrack;
    for (let i2 = 0; i2 < e2.length; i2++) {
      const r2 = e2[i2];
      if ((!s2 || r2.default) && (s2 || t2) && (!t2 || Vt(r2, t2))) return i2;
    }
    if (t2) {
      for (let s3 = 0; s3 < e2.length; s3++) {
        const i2 = e2[s3];
        if (rr(t2.attrs, i2.attrs, ["LANGUAGE", "ASSOC-LANGUAGE", "CHARACTERISTICS"])) return s3;
      }
      for (let s3 = 0; s3 < e2.length; s3++) {
        const i2 = e2[s3];
        if (rr(t2.attrs, i2.attrs, ["LANGUAGE"])) return s3;
      }
    }
    return -1;
  }
  findTrackForTextTrack(t2) {
    if (t2) {
      const e2 = this.tracksInGroup;
      for (let s2 = 0; s2 < e2.length; s2++) if (nr(e2[s2], t2)) return s2;
    }
    return -1;
  }
  onError(t2, e2) {
    !e2.fatal && e2.context && (e2.context.type !== f || e2.context.id !== this.trackId || this.groupIds && -1 === this.groupIds.indexOf(e2.context.groupId) || this.checkRetry(e2));
  }
  get allSubtitleTracks() {
    return this.tracks;
  }
  get subtitleTracks() {
    return this.tracksInGroup;
  }
  get subtitleTrack() {
    return this.trackId;
  }
  set subtitleTrack(t2) {
    this.selectDefaultTrack = false, this.setSubtitleTrack(t2);
  }
  setSubtitleOption(t2) {
    if (this.hls.config.subtitlePreference = t2, t2) {
      if (-1 === t2.id) return this.setSubtitleTrack(-1), null;
      const e2 = this.allSubtitleTracks;
      if (this.selectDefaultTrack = false, e2.length) {
        const s2 = this.currentTrack;
        if (s2 && Vt(t2, s2)) return s2;
        const i2 = Ht(t2, this.tracksInGroup);
        if (i2 > -1) {
          const t3 = this.tracksInGroup[i2];
          return this.setSubtitleTrack(i2), t3;
        }
        if (s2) return null;
        {
          const s3 = Ht(t2, e2);
          if (s3 > -1) return e2[s3];
        }
      }
    }
    return null;
  }
  loadPlaylist(t2) {
    super.loadPlaylist(), this.shouldLoadPlaylist(this.currentTrack) && this.scheduleLoading(this.currentTrack, t2);
  }
  loadingPlaylist(t2, e2) {
    super.loadingPlaylist(t2, e2);
    const s2 = t2.id, i2 = t2.groupId, r2 = this.getUrlWithDirectives(t2.url, e2), n2 = t2.details, a2 = null == n2 ? void 0 : n2.age;
    this.log(`Loading subtitle ${s2} "${t2.name}" lang:${t2.lang} group:${i2}${void 0 !== (null == e2 ? void 0 : e2.msn) ? " at sn " + e2.msn + " part " + e2.part : ""}${a2 && n2.live ? " age " + a2.toFixed(1) + (n2.type && " " + n2.type || "") : ""} ${r2}`), this.hls.trigger(h.SUBTITLE_TRACK_LOADING, { url: r2, id: s2, groupId: i2, deliveryDirectives: e2 || null, track: t2 });
  }
  toggleTrackModes() {
    const { media: t2 } = this;
    if (!t2) return;
    const e2 = rn(t2.textTracks), s2 = this.currentTrack;
    let i2;
    if (s2 && (i2 = e2.filter((t3) => nr(s2, t3))[0], i2 || this.warn(`Unable to find subtitle TextTrack with name "${s2.name}" and language "${s2.lang}"`)), [].slice.call(e2).forEach((t3) => {
      "disabled" !== t3.mode && t3 !== i2 && (t3.mode = "disabled");
    }), i2) {
      const t3 = this.subtitleDisplay ? "showing" : "hidden";
      i2.mode !== t3 && (i2.mode = t3);
    }
  }
  setSubtitleTrack(t2) {
    const e2 = this.tracksInGroup;
    if (!this.media) return void (this.queuedDefaultTrack = t2);
    if (t2 < -1 || t2 >= e2.length || !r(t2)) return void this.warn(`Invalid subtitle track id: ${t2}`);
    this.selectDefaultTrack = false;
    const s2 = this.currentTrack, i2 = e2[t2] || null;
    if (this.trackId = t2, this.currentTrack = i2, this.toggleTrackModes(), !i2) return void this.hls.trigger(h.SUBTITLE_TRACK_SWITCH, { id: t2 });
    const n2 = !!i2.details && !i2.details.live;
    if (t2 === this.trackId && i2 === s2 && n2) return;
    this.log(`Switching to subtitle-track ${t2}` + (i2 ? ` "${i2.name}" lang:${i2.lang} group:${i2.groupId}` : ""));
    const { id: a2, groupId: o2 = "", name: l2, type: d2, url: c2 } = i2;
    this.hls.trigger(h.SUBTITLE_TRACK_SWITCH, { id: a2, groupId: o2, name: l2, type: d2, url: c2 });
    const u2 = this.switchParams(i2.url, null == s2 ? void 0 : s2.details, i2.details);
    this.loadPlaylist(u2);
  }
}, timelineController: class {
  constructor(t2) {
    this.hls = void 0, this.media = null, this.config = void 0, this.enabled = true, this.Cues = void 0, this.textTracks = [], this.tracks = [], this.initPTS = [], this.unparsedVttFrags = [], this.captionsTracks = {}, this.nonNativeCaptionsTracks = {}, this.cea608Parser1 = void 0, this.cea608Parser2 = void 0, this.lastCc = -1, this.lastSn = -1, this.lastPartIndex = -1, this.prevCC = -1, this.vttCCs = { ccOffset: 0, presentationOffset: 0, 0: { start: 0, prevCC: -1, new: true } }, this.captionsProperties = void 0, this.hls = t2, this.config = t2.config, this.Cues = t2.config.cueHandler, this.captionsProperties = { textTrack1: { label: this.config.captionsTextTrack1Label, languageCode: this.config.captionsTextTrack1LanguageCode }, textTrack2: { label: this.config.captionsTextTrack2Label, languageCode: this.config.captionsTextTrack2LanguageCode }, textTrack3: { label: this.config.captionsTextTrack3Label, languageCode: this.config.captionsTextTrack3LanguageCode }, textTrack4: { label: this.config.captionsTextTrack4Label, languageCode: this.config.captionsTextTrack4LanguageCode } }, t2.on(h.MEDIA_ATTACHING, this.onMediaAttaching, this), t2.on(h.MEDIA_DETACHING, this.onMediaDetaching, this), t2.on(h.MANIFEST_LOADING, this.onManifestLoading, this), t2.on(h.MANIFEST_LOADED, this.onManifestLoaded, this), t2.on(h.SUBTITLE_TRACKS_UPDATED, this.onSubtitleTracksUpdated, this), t2.on(h.FRAG_LOADING, this.onFragLoading, this), t2.on(h.FRAG_LOADED, this.onFragLoaded, this), t2.on(h.FRAG_PARSING_USERDATA, this.onFragParsingUserdata, this), t2.on(h.FRAG_DECRYPTED, this.onFragDecrypted, this), t2.on(h.INIT_PTS_FOUND, this.onInitPtsFound, this), t2.on(h.SUBTITLE_TRACKS_CLEARED, this.onSubtitleTracksCleared, this), t2.on(h.BUFFER_FLUSHING, this.onBufferFlushing, this);
  }
  destroy() {
    const { hls: t2 } = this;
    t2.off(h.MEDIA_ATTACHING, this.onMediaAttaching, this), t2.off(h.MEDIA_DETACHING, this.onMediaDetaching, this), t2.off(h.MANIFEST_LOADING, this.onManifestLoading, this), t2.off(h.MANIFEST_LOADED, this.onManifestLoaded, this), t2.off(h.SUBTITLE_TRACKS_UPDATED, this.onSubtitleTracksUpdated, this), t2.off(h.FRAG_LOADING, this.onFragLoading, this), t2.off(h.FRAG_LOADED, this.onFragLoaded, this), t2.off(h.FRAG_PARSING_USERDATA, this.onFragParsingUserdata, this), t2.off(h.FRAG_DECRYPTED, this.onFragDecrypted, this), t2.off(h.INIT_PTS_FOUND, this.onInitPtsFound, this), t2.off(h.SUBTITLE_TRACKS_CLEARED, this.onSubtitleTracksCleared, this), t2.off(h.BUFFER_FLUSHING, this.onBufferFlushing, this), this.hls = this.config = this.media = null, this.cea608Parser1 = this.cea608Parser2 = void 0;
  }
  initCea608Parsers() {
    const t2 = new OutputFilter(this, "textTrack1"), e2 = new OutputFilter(this, "textTrack2"), s2 = new OutputFilter(this, "textTrack3"), i2 = new OutputFilter(this, "textTrack4");
    this.cea608Parser1 = new Cea608Parser(1, t2, e2), this.cea608Parser2 = new Cea608Parser(3, s2, i2);
  }
  addCues(t2, e2, s2, i2, r2) {
    let n2 = false;
    for (let t3 = r2.length; t3--; ) {
      const i3 = r2[t3], a2 = zn(i3[0], i3[1], e2, s2);
      if (a2 >= 0 && (i3[0] = Math.min(i3[0], e2), i3[1] = Math.max(i3[1], s2), n2 = true, a2 / (s2 - e2) > 0.5)) return;
    }
    if (n2 || r2.push([e2, s2]), this.config.renderTextTracksNatively) {
      const r3 = this.captionsTracks[t2];
      this.Cues.newCue(r3, e2, s2, i2);
    } else {
      const r3 = this.Cues.newCue(null, e2, s2, i2);
      this.hls.trigger(h.CUES_PARSED, { type: "captions", cues: r3, track: t2 });
    }
  }
  onInitPtsFound(t2, { frag: e2, id: s2, initPTS: i2, timescale: r2, trackId: n2 }) {
    const { unparsedVttFrags: a2 } = this;
    s2 === g && (this.initPTS[e2.cc] = { baseTime: i2, timescale: r2, trackId: n2 }), a2.length && (this.unparsedVttFrags = [], a2.forEach((t3) => {
      this.initPTS[t3.frag.cc] ? this.onFragLoaded(h.FRAG_LOADED, t3) : this.hls.trigger(h.SUBTITLE_FRAG_PROCESSED, { success: false, frag: t3.frag, error: new Error("Subtitle discontinuity domain does not match main") });
    }));
  }
  getExistingTrack(t2, e2) {
    const { media: s2 } = this;
    if (s2) for (let i2 = 0; i2 < s2.textTracks.length; i2++) {
      const r2 = s2.textTracks[i2];
      if (Xn(r2, { name: t2, lang: e2, characteristics: "transcribes-spoken-dialog,describes-music-and-sound" })) return r2;
    }
    return null;
  }
  createCaptionsTrack(t2) {
    this.config.renderTextTracksNatively ? this.createNativeTrack(t2) : this.createNonNativeTrack(t2);
  }
  createNativeTrack(t2) {
    if (this.captionsTracks[t2]) return;
    const { captionsProperties: e2, captionsTracks: s2, media: i2 } = this, { label: r2, languageCode: n2 } = e2[t2], a2 = this.getExistingTrack(r2, n2);
    if (a2) s2[t2] = a2, en(s2[t2]), Jr(s2[t2], i2);
    else {
      const e3 = this.createTextTrack("captions", r2, n2);
      e3 && (e3[t2] = true, s2[t2] = e3);
    }
  }
  createNonNativeTrack(t2) {
    if (this.nonNativeCaptionsTracks[t2]) return;
    const e2 = this.captionsProperties[t2];
    if (!e2) return;
    const s2 = { _id: t2, label: e2.label, kind: "captions", default: !!e2.media && !!e2.media.default, closedCaptions: e2.media };
    this.nonNativeCaptionsTracks[t2] = s2, this.hls.trigger(h.NON_NATIVE_TEXT_TRACKS_FOUND, { tracks: [s2] });
  }
  createTextTrack(t2, e2, s2) {
    const i2 = this.media;
    if (i2) return i2.addTextTrack(t2, e2, s2);
  }
  onMediaAttaching(t2, e2) {
    this.media = e2.media, e2.mediaSource || this._cleanTracks();
  }
  onMediaDetaching(t2, e2) {
    const s2 = !!e2.transferMedia;
    if (this.media = null, s2) return;
    const { captionsTracks: i2 } = this;
    Object.keys(i2).forEach((t3) => {
      en(i2[t3]), delete i2[t3];
    }), this.nonNativeCaptionsTracks = {};
  }
  onManifestLoading() {
    this.lastCc = -1, this.lastSn = -1, this.lastPartIndex = -1, this.prevCC = -1, this.vttCCs = { ccOffset: 0, presentationOffset: 0, 0: { start: 0, prevCC: -1, new: true } }, this._cleanTracks(), this.tracks = [], this.captionsTracks = {}, this.nonNativeCaptionsTracks = {}, this.textTracks = [], this.unparsedVttFrags = [], this.initPTS = [], this.cea608Parser1 && this.cea608Parser2 && (this.cea608Parser1.reset(), this.cea608Parser2.reset());
  }
  _cleanTracks() {
    const { media: t2 } = this;
    if (!t2) return;
    const e2 = t2.textTracks;
    if (e2) for (let t3 = 0; t3 < e2.length; t3++) en(e2[t3]);
  }
  onSubtitleTracksUpdated(t2, e2) {
    const s2 = e2.subtitleTracks || [], i2 = s2.some((t3) => t3.textCodec === Nn);
    if (this.config.enableWebVTT || i2 && this.config.enableIMSC1) {
      if (ir(this.tracks, s2)) return void (this.tracks = s2);
      if (this.textTracks = [], this.tracks = s2, this.config.renderTextTracksNatively) {
        const t3 = this.media, e3 = t3 ? rn(t3.textTracks) : null;
        if (this.tracks.forEach((t4, s3) => {
          let i3;
          if (e3) {
            let s4 = null;
            for (let i4 = 0; i4 < e3.length; i4++) if (e3[i4] && Xn(e3[i4], t4)) {
              s4 = e3[i4], e3[i4] = null;
              break;
            }
            s4 && (i3 = s4);
          }
          if (i3) en(i3);
          else {
            const e4 = qn(t4);
            i3 = this.createTextTrack(e4, t4.name, t4.lang), i3 && (i3.mode = "disabled");
          }
          i3 && this.textTracks.push(i3);
        }), null != e3 && e3.length) {
          const t4 = e3.filter((t5) => null !== t5).map((t5) => t5.label);
          t4.length && this.hls.logger.warn(`Media element contains unused subtitle tracks: ${t4.join(", ")}. Replace media element for each source to clear TextTracks and captions menu.`);
        }
      } else if (this.tracks.length) {
        const t3 = this.tracks.map((t4) => ({ label: t4.name, kind: t4.type.toLowerCase(), default: t4.default, subtitleTrack: t4 }));
        this.hls.trigger(h.NON_NATIVE_TEXT_TRACKS_FOUND, { tracks: t3 });
      }
    }
  }
  onManifestLoaded(t2, e2) {
    this.config.enableCEA708Captions && e2.captions && e2.captions.forEach((t3) => {
      const e3 = /(?:CC|SERVICE)([1-4])/.exec(t3.instreamId);
      if (!e3) return;
      const s2 = `textTrack${e3[1]}`, i2 = this.captionsProperties[s2];
      i2 && (i2.label = t3.name, t3.lang && (i2.languageCode = t3.lang), i2.media = t3);
    });
  }
  closedCaptionsForLevel(t2) {
    const e2 = this.hls.levels[t2.level];
    return null == e2 ? void 0 : e2.attrs["CLOSED-CAPTIONS"];
  }
  onFragLoading(t2, e2) {
    if (this.enabled && e2.frag.type === g) {
      var s2, i2;
      const { cea608Parser1: t3, cea608Parser2: r2, lastSn: n2 } = this, { cc: a2, sn: o2 } = e2.frag, l2 = null != (s2 = null == (i2 = e2.part) ? void 0 : i2.index) ? s2 : -1;
      t3 && r2 && (o2 !== n2 + 1 || o2 === n2 && l2 !== this.lastPartIndex + 1 || a2 !== this.lastCc) && (t3.reset(), r2.reset()), this.lastCc = a2, this.lastSn = o2, this.lastPartIndex = l2;
    }
  }
  onFragLoaded(t2, e2) {
    const { frag: s2, payload: i2 } = e2;
    if (s2.type === p) if (i2.byteLength) {
      const t3 = s2.decryptdata, r2 = "stats" in e2;
      if (null == t3 || !t3.encrypted || r2) {
        const t4 = this.tracks[s2.level], r3 = this.vttCCs;
        r3[s2.cc] || (r3[s2.cc] = { start: s2.start, prevCC: this.prevCC, new: true }, this.prevCC = s2.cc), t4 && t4.textCodec === Nn ? this._parseIMSC1(s2, i2) : this._parseVTTs(e2);
      }
    } else this.hls.trigger(h.SUBTITLE_FRAG_PROCESSED, { success: false, frag: s2, error: new Error("Empty subtitle payload") });
  }
  _parseIMSC1(t2, e2) {
    const s2 = this.hls;
    Gn(e2, this.initPTS[t2.cc], (e3) => {
      this._appendCues(e3, t2.level), s2.trigger(h.SUBTITLE_FRAG_PROCESSED, { success: true, frag: t2 });
    }, (e3) => {
      s2.logger.log(`Failed to parse IMSC1: ${e3}`), s2.trigger(h.SUBTITLE_FRAG_PROCESSED, { success: false, frag: t2, error: e3 });
    });
  }
  _parseVTTs(t2) {
    var e2;
    const { frag: s2, payload: i2 } = t2, { initPTS: n2, unparsedVttFrags: a2 } = this, o2 = n2.length - 1;
    if (!n2[s2.cc] && -1 === o2) return void a2.push(t2);
    const l2 = this.hls;
    !function(t3, e3, s3, i3, n3, a3, o3) {
      const l3 = new VTTParser(), h2 = D(new Uint8Array(t3)).trim().replace(On, "\n").split("\n"), d2 = [], c2 = e3 ? function(t4, e4 = 1) {
        return Gi(t4, 9e4, 1 / e4);
      }(e3.baseTime, e3.timescale) : 0;
      let u2, f2 = "00:00.000", g2 = 0, m2 = 0, p2 = true;
      l3.oncue = function(t4) {
        const r2 = s3[i3];
        let a4 = s3.ccOffset;
        const o4 = (g2 - c2) / 9e4;
        if (null != r2 && r2.new && (void 0 !== m2 ? a4 = s3.ccOffset = r2.start : function(t5, e4, s4) {
          let i4 = t5[e4], r3 = t5[i4.prevCC];
          if (!r3 || !r3.new && i4.new) return t5.ccOffset = t5.presentationOffset = i4.start, void (i4.new = false);
          for (; null != (n4 = r3) && n4.new; ) {
            var n4;
            t5.ccOffset += i4.start - r3.start, i4.new = false, i4 = r3, r3 = t5[i4.prevCC];
          }
          t5.presentationOffset = s4;
        }(s3, i3, o4)), o4) {
          if (!e3) return void (u2 = new Error("Missing initPTS for VTT MPEGTS"));
          a4 = o4 - s3.presentationOffset;
        }
        const l4 = t4.endTime - t4.startTime, h3 = qi(9e4 * (t4.startTime + a4 - m2), 9e4 * n3) / 9e4;
        t4.startTime = Math.max(h3, 0), t4.endTime = Math.max(h3 + l4, 0);
        const f3 = t4.text.trim();
        t4.text = decodeURIComponent(encodeURIComponent(f3)), t4.id || (t4.id = Fn(t4.startTime, t4.endTime, f3)), t4.endTime > 0 && d2.push(t4);
      }, l3.onparsingerror = function(t4) {
        u2 = t4;
      }, l3.onflush = function() {
        u2 ? o3(u2) : a3(d2);
      }, h2.forEach((t4) => {
        if (p2) {
          if (startsWith(t4, "X-TIMESTAMP-MAP=")) {
            p2 = false, t4.slice(16).split(",").forEach((t5) => {
              startsWith(t5, "LOCAL:") ? f2 = t5.slice(6) : startsWith(t5, "MPEGTS:") && (g2 = parseInt(t5.slice(7)));
            });
            try {
              m2 = function(t5) {
                let e4 = parseInt(t5.slice(-3));
                const s4 = parseInt(t5.slice(-6, -4)), i4 = parseInt(t5.slice(-9, -7)), n4 = t5.length > 9 ? parseInt(t5.substring(0, t5.indexOf(":"))) : 0;
                if (!(r(e4) && r(s4) && r(i4) && r(n4))) throw Error(`Malformed X-TIMESTAMP-MAP: Local:${t5}`);
                return e4 += 1e3 * s4, e4 += 6e4 * i4, e4 += 36e5 * n4, e4;
              }(f2) / 1e3;
            } catch (t5) {
              u2 = t5;
            }
            return;
          }
          "" === t4 && (p2 = false);
        }
        l3.parse(t4 + "\n");
      }), l3.flush();
    }(null != (e2 = s2.initSegment) && e2.data ? nt(s2.initSegment.data, new Uint8Array(i2)).buffer : i2, this.initPTS[s2.cc], this.vttCCs, s2.cc, s2.start, (t3) => {
      this._appendCues(t3, s2.level), l2.trigger(h.SUBTITLE_FRAG_PROCESSED, { success: true, frag: s2 });
    }, (e3) => {
      const r2 = "Missing initPTS for VTT MPEGTS" === e3.message;
      r2 ? a2.push(t2) : this._fallbackToIMSC1(s2, i2), l2.logger.log(`Failed to parse VTT cue: ${e3}`), r2 && o2 > s2.cc || l2.trigger(h.SUBTITLE_FRAG_PROCESSED, { success: false, frag: s2, error: e3 });
    });
  }
  _fallbackToIMSC1(t2, e2) {
    const s2 = this.tracks[t2.level];
    s2.textCodec || Gn(e2, this.initPTS[t2.cc], () => {
      s2.textCodec = Nn, this._parseIMSC1(t2, e2);
    }, () => {
      s2.textCodec = "wvtt";
    });
  }
  _appendCues(t2, e2) {
    const s2 = this.hls;
    if (this.config.renderTextTracksNatively) {
      const s3 = this.textTracks[e2];
      if (!s3 || "disabled" === s3.mode) return;
      t2.forEach((t3) => tn(s3, t3));
    } else {
      const i2 = this.tracks[e2];
      if (!i2) return;
      const r2 = i2.default ? "default" : "subtitles" + e2;
      s2.trigger(h.CUES_PARSED, { type: "subtitles", cues: t2, track: r2 });
    }
  }
  onFragDecrypted(t2, e2) {
    const { frag: s2 } = e2;
    s2.type === p && this.onFragLoaded(h.FRAG_LOADED, e2);
  }
  onSubtitleTracksCleared() {
    this.tracks = [], this.captionsTracks = {};
  }
  onFragParsingUserdata(t2, e2) {
    if (!this.enabled || !this.config.enableCEA708Captions) return;
    const { frag: s2, samples: i2 } = e2;
    if (s2.type !== g || "NONE" !== this.closedCaptionsForLevel(s2)) for (let t3 = 0; t3 < i2.length; t3++) {
      const e3 = i2[t3].bytes;
      if (e3) {
        this.cea608Parser1 || this.initCea608Parsers();
        const s3 = this.extractCea608Data(e3);
        this.cea608Parser1.addData(i2[t3].pts, s3[0]), this.cea608Parser2.addData(i2[t3].pts, s3[1]);
      }
    }
  }
  onBufferFlushing(t2, { startOffset: e2, endOffset: s2, endOffsetSubtitles: i2, type: r2 }) {
    const { media: n2 } = this;
    if (n2 && !(n2.currentTime < s2)) {
      if (!r2 || "video" === r2) {
        const { captionsTracks: t3 } = this;
        Object.keys(t3).forEach((i3) => sn(t3[i3], e2, s2));
      }
      if (this.config.renderTextTracksNatively && 0 === e2 && void 0 !== i2) {
        const { textTracks: t3 } = this;
        Object.keys(t3).forEach((s3) => sn(t3[s3], e2, i2));
      }
    }
  }
  extractCea608Data(t2) {
    const e2 = [[], []], s2 = 31 & t2[0];
    let i2 = 2;
    for (let r2 = 0; r2 < s2; r2++) {
      const s3 = t2[i2++], r3 = 127 & t2[i2++], n2 = 127 & t2[i2++];
      if ((0 !== r3 || 0 !== n2) && 4 & s3) {
        const t3 = 3 & s3;
        0 !== t3 && 1 !== t3 || (e2[t3].push(r3), e2[t3].push(n2));
      }
    }
    return e2;
  }
}, audioStreamController: class extends BaseStreamController {
  constructor(t2, e2, s2) {
    super(t2, e2, s2, "audio-stream-controller", m), this.mainAnchor = null, this.mainFragLoading = null, this.audioOnly = false, this.bufferedTrack = null, this.switchingTrack = null, this.trackId = -1, this.waitingData = null, this.mainDetails = null, this.flushing = false, this.bufferFlushed = false, this.cachedTrackLoadedData = null, this.registerListeners();
  }
  onHandlerDestroying() {
    this.unregisterListeners(), super.onHandlerDestroying(), this.resetItem();
  }
  resetItem() {
    this.mainDetails = this.mainAnchor = this.mainFragLoading = this.bufferedTrack = this.switchingTrack = this.waitingData = this.cachedTrackLoadedData = null;
  }
  registerListeners() {
    super.registerListeners();
    const { hls: t2 } = this;
    t2.on(h.LEVEL_LOADED, this.onLevelLoaded, this), t2.on(h.AUDIO_TRACKS_UPDATED, this.onAudioTracksUpdated, this), t2.on(h.AUDIO_TRACK_SWITCHING, this.onAudioTrackSwitching, this), t2.on(h.AUDIO_TRACK_LOADED, this.onAudioTrackLoaded, this), t2.on(h.BUFFER_RESET, this.onBufferReset, this), t2.on(h.BUFFER_CREATED, this.onBufferCreated, this), t2.on(h.BUFFER_FLUSHING, this.onBufferFlushing, this), t2.on(h.BUFFER_FLUSHED, this.onBufferFlushed, this), t2.on(h.INIT_PTS_FOUND, this.onInitPtsFound, this), t2.on(h.FRAG_LOADING, this.onFragLoading, this), t2.on(h.FRAG_BUFFERED, this.onFragBuffered, this);
  }
  unregisterListeners() {
    const { hls: t2 } = this;
    t2 && (super.unregisterListeners(), t2.off(h.LEVEL_LOADED, this.onLevelLoaded, this), t2.off(h.AUDIO_TRACKS_UPDATED, this.onAudioTracksUpdated, this), t2.off(h.AUDIO_TRACK_SWITCHING, this.onAudioTrackSwitching, this), t2.off(h.AUDIO_TRACK_LOADED, this.onAudioTrackLoaded, this), t2.off(h.BUFFER_RESET, this.onBufferReset, this), t2.off(h.BUFFER_CREATED, this.onBufferCreated, this), t2.off(h.BUFFER_FLUSHING, this.onBufferFlushing, this), t2.off(h.BUFFER_FLUSHED, this.onBufferFlushed, this), t2.off(h.INIT_PTS_FOUND, this.onInitPtsFound, this), t2.off(h.FRAG_LOADING, this.onFragLoading, this), t2.off(h.FRAG_BUFFERED, this.onFragBuffered, this));
  }
  onInitPtsFound(t2, { frag: e2, id: s2, initPTS: i2, timescale: r2, trackId: n2 }) {
    if (s2 === g) {
      const t3 = e2.cc, s3 = this.fragCurrent;
      if (this.initPTS[t3] = { baseTime: i2, timescale: r2, trackId: n2 }, this.log(`InitPTS for cc: ${t3} found from main: ${i2 / r2} (${i2}/${r2}) trackId: ${n2}`), this.mainAnchor = e2, this.state === Gs) {
        const s4 = this.waitingData;
        (!s4 && !this.loadingParts || s4 && s4.frag.cc !== t3) && this.syncWithAnchor(e2, null == s4 ? void 0 : s4.frag);
      } else !this.hls.hasEnoughToStart && s3 && s3.cc !== t3 ? (s3.abortRequests(), this.syncWithAnchor(e2, s3)) : this.state === ws && this.tick();
    }
  }
  getLoadPosition() {
    return !this.startFragRequested && this.nextLoadPosition >= 0 ? this.nextLoadPosition : super.getLoadPosition();
  }
  syncWithAnchor(t2, e2) {
    var s2;
    const i2 = (null == (s2 = this.mainFragLoading) ? void 0 : s2.frag) || null;
    if (e2 && (null == i2 ? void 0 : i2.cc) === e2.cc) return;
    const r2 = (i2 || t2).cc, n2 = Zt(this.getLevelDetails(), r2, this.getLoadPosition());
    n2 && (this.log(`Syncing with main frag at ${n2.start} cc ${n2.cc}`), this.startFragRequested = false, this.nextLoadPosition = n2.start, this.resetLoadingState(), this.state === ws && this.doTickIdle());
  }
  startLoad(t2, e2) {
    if (!this.levels) return this.startPosition = t2, void (this.state = Cs);
    const s2 = this.lastCurrentTime;
    this.stopLoad(), this.setInterval(100), s2 > 0 && -1 === t2 ? (this.log(`Override startPosition with lastCurrentTime @${s2.toFixed(3)}`), t2 = s2, this.state = ws) : this.state = Fs, this.nextLoadPosition = this.lastCurrentTime = t2 + this.timelineOffset, this.startPosition = e2 ? -1 : t2, this.tick();
  }
  doTick() {
    switch (this.state) {
      case ws:
        this.doTickIdle();
        break;
      case Fs: {
        const { levels: t2, trackId: e2 } = this, s2 = null == t2 ? void 0 : t2[e2], i2 = null == s2 ? void 0 : s2.details;
        if (i2 && !this.waitForLive(s2)) {
          if (this.waitForCdnTuneIn(i2)) break;
          this.state = Gs;
        }
        break;
      }
      case Os:
        this.checkRetryDate();
        break;
      case Gs: {
        const t2 = this.waitingData;
        if (t2) {
          const { frag: e2, part: s2, cache: i2, complete: r2 } = t2, n2 = this.mainAnchor;
          if (void 0 !== this.initPTS[e2.cc]) {
            this.waitingData = null, this.state = xs;
            const t3 = { frag: e2, part: s2, payload: i2.flush().buffer, networkDetails: null };
            this._handleFragmentLoadProgress(t3), r2 && super._handleFragmentLoadComplete(t3);
          } else n2 && n2.cc !== t2.frag.cc && this.syncWithAnchor(n2, t2.frag);
        } else this.state = ws;
      }
    }
    this.onTickEnd();
  }
  resetLoadingState() {
    const t2 = this.waitingData;
    t2 && (this.fragmentTracker.removeFragment(t2.frag), this.waitingData = null), super.resetLoadingState();
  }
  onTickEnd() {
    const { media: t2 } = this;
    null != t2 && t2.readyState && (this.lastCurrentTime = t2.currentTime);
  }
  doTickIdle() {
    var t2;
    const { hls: e2, levels: s2, media: i2, trackId: r2 } = this, n2 = e2.config;
    if (!this.buffering || !i2 && !this.primaryPrefetch && (this.startFragRequested || !n2.startFragPrefetch) || null == s2 || !s2[r2]) return;
    const a2 = s2[r2], o2 = a2.details;
    if (!o2 || this.waitForLive(a2) || this.waitForCdnTuneIn(o2)) return this.state = Fs, void (this.startFragRequested = false);
    const l2 = this.mediaBuffer ? this.mediaBuffer : this.media;
    this.bufferFlushed && l2 && (this.bufferFlushed = false, this.afterBufferFlushed(l2, F, m));
    const d2 = this.getFwdBufferInfo(l2, m);
    if (null === d2) return;
    if (!this.switchingTrack && this._streamEnded(d2, o2)) return e2.trigger(h.BUFFER_EOS, { type: "audio" }), void (this.state = $s);
    const c2 = d2.len, u2 = e2.maxBufferLength, f2 = o2.fragments, p2 = f2[0].start, v2 = this.getLoadPosition(), y2 = this.flushing ? v2 : d2.end;
    if (this.switchingTrack && i2) {
      const t3 = v2;
      o2.PTSKnown && t3 < p2 && (d2.end > p2 || d2.nextStart) && (this.log("Alt audio track ahead of main track, seek to start of alt audio track"), i2.currentTime = p2 + 0.05);
    }
    if (c2 >= u2 && !this.switchingTrack && y2 < f2[f2.length - 1].start) return;
    let E2 = this.getNextFragment(y2, o2);
    if (E2 && this.isLoopLoading(E2, y2) && (E2 = this.getNextFragmentLoopLoading(E2, o2, d2, g, u2)), !E2) return void (this.bufferFlushed = true);
    if (this.exceedsMaxBuffer(d2, u2, E2)) return;
    let T2 = (null == (t2 = this.mainFragLoading) ? void 0 : t2.frag) || null;
    if (!this.audioOnly && this.startFragRequested && T2 && $(E2) && !E2.endList && (!o2.live || !this.loadingParts && y2 < this.hls.liveSyncPosition) && (this.fragmentTracker.getState(T2) === ce && (this.mainFragLoading = T2 = null), T2 && $(T2))) {
      if (E2.start > T2.end) {
        const t3 = this.fragmentTracker.getFragAtPos(y2, g);
        t3 && t3.end > T2.end && (T2 = t3, this.mainFragLoading = { frag: t3, targetBufferTime: null });
      }
      if (E2.start > T2.end) return;
    }
    this.loadFragment(E2, a2, y2);
  }
  onMediaDetaching(t2, e2) {
    this.bufferFlushed = this.flushing = false, super.onMediaDetaching(t2, e2);
  }
  onAudioTracksUpdated(t2, { audioTracks: e2 }) {
    this.resetTransmuxer(), this.levels = e2.map((t3) => new Level(t3));
  }
  onAudioTrackSwitching(t2, e2) {
    const s2 = !!e2.url;
    this.trackId = e2.id;
    const { fragCurrent: i2 } = this;
    i2 && (i2.abortRequests(), this.removeUnbufferedFrags(i2.start)), this.resetLoadingState(), s2 ? (this.switchingTrack = e2, this.flushAudioIfNeeded(e2), this.state !== Cs && (this.setInterval(100), this.state = ws, this.tick())) : (this.resetTransmuxer(), this.switchingTrack = null, this.bufferedTrack = e2, this.clearInterval());
  }
  onManifestLoading() {
    super.onManifestLoading(), this.bufferFlushed = this.flushing = this.audioOnly = false, this.resetItem(), this.trackId = -1;
  }
  onLevelLoaded(t2, e2) {
    this.mainDetails = e2.details;
    const s2 = this.cachedTrackLoadedData;
    s2 && (this.cachedTrackLoadedData = null, this.onAudioTrackLoaded(h.AUDIO_TRACK_LOADED, s2));
  }
  onAudioTrackLoaded(t2, e2) {
    var s2;
    const { levels: i2 } = this, { details: r2, id: n2, groupId: a2, track: o2 } = e2;
    if (!i2) return void this.warn(`Audio tracks reset while loading track ${n2} "${o2.name}" of "${a2}"`);
    const l2 = this.mainDetails;
    if (!l2 || r2.endCC > l2.endCC || l2.expired) return this.cachedTrackLoadedData = e2, void (this.state !== Cs && (this.state = Fs));
    this.cachedTrackLoadedData = null, this.log(`Audio track ${n2} "${o2.name}" of "${a2}" loaded [${r2.startSN},${r2.endSN}]${r2.lastPartSn ? `[part-${r2.lastPartSn}-${r2.lastPartIndex}]` : ""},duration:${r2.totalduration}`);
    const d2 = i2[n2];
    let c2 = 0;
    if (r2.live || null != (s2 = d2.details) && s2.live) {
      if (this.checkLiveUpdate(r2), r2.deltaUpdateFailed) return;
      var u2;
      d2.details && (c2 = this.alignPlaylists(r2, d2.details, null == (u2 = this.levelLastLoaded) ? void 0 : u2.details)), r2.alignedSliding || (ks(r2, l2), r2.alignedSliding || Ps(r2, l2), c2 = r2.fragmentStart);
    }
    d2.details = r2, this.levelLastLoaded = d2, this.startFragRequested || this.setStartPosition(l2, c2), this.hls.trigger(h.AUDIO_TRACK_UPDATED, { details: r2, id: n2, groupId: e2.groupId }), this.state !== Fs || this.waitForCdnTuneIn(r2) || (this.state = ws), this.tick();
  }
  _handleFragmentLoadProgress(t2) {
    var e2;
    const s2 = t2.frag, { part: i2, payload: r2 } = t2, { config: n2, trackId: a2, levels: o2 } = this;
    if (!o2) return void this.warn(`Audio tracks were reset while fragment load was in progress. Fragment ${s2.sn} of level ${s2.level} will not be buffered`);
    const l2 = o2[a2];
    if (!l2) return void this.warn("Audio track is undefined on fragment load progress");
    const h2 = l2.details;
    if (!h2) return this.warn("Audio track details undefined on fragment load progress"), void this.removeUnbufferedFrags(s2.start);
    const d2 = n2.defaultAudioCodec || l2.audioCodec || "mp4a.40.2";
    let c2 = this.transmuxer;
    c2 || (c2 = this.transmuxer = new TransmuxerInterface(this.hls, m, this._handleTransmuxComplete.bind(this), this._handleTransmuxerFlush.bind(this)));
    const u2 = this.initPTS[s2.cc], f2 = null == (e2 = s2.initSegment) ? void 0 : e2.data;
    if (void 0 !== u2) {
      const t3 = false, e3 = i2 ? i2.index : -1, n3 = -1 !== e3, a3 = new ChunkMetadata(s2.level, s2.sn, s2.stats.chunkCount, r2.byteLength, e3, n3);
      c2.push(r2, f2, d2, "", s2, i2, h2.totalduration, t3, a3, u2);
    } else {
      this.log(`Unknown video PTS for cc ${s2.cc}, waiting for video PTS before demuxing audio frag ${s2.sn} of [${h2.startSN} ,${h2.endSN}],track ${a2}`);
      const { cache: t3 } = this.waitingData = this.waitingData || { frag: s2, part: i2, cache: new ChunkCache(), complete: false };
      t3.push(new Uint8Array(r2)), this.state !== Cs && (this.state = Gs);
    }
  }
  _handleFragmentLoadComplete(t2) {
    this.waitingData ? this.waitingData.complete = true : super._handleFragmentLoadComplete(t2);
  }
  onBufferReset() {
    this.mediaBuffer = null;
  }
  onBufferCreated(t2, e2) {
    this.bufferFlushed = this.flushing = false;
    const s2 = e2.tracks.audio;
    s2 && (this.mediaBuffer = s2.buffer || null);
  }
  onFragLoading(t2, e2) {
    !this.audioOnly && e2.frag.type === g && $(e2.frag) && (this.mainFragLoading = e2, this.state === ws && this.tick());
  }
  onFragBuffered(t2, e2) {
    const { frag: s2, part: i2 } = e2;
    if (s2.type === m) if (this.fragContextChanged(s2)) this.warn(`Fragment ${s2.sn}${i2 ? " p: " + i2.index : ""} of level ${s2.level} finished buffering, but was aborted. state: ${this.state}, audioSwitch: ${this.switchingTrack ? this.switchingTrack.name : "false"}`);
    else {
      if ($(s2)) {
        this.fragPrevious = s2;
        const t3 = this.switchingTrack;
        t3 && (this.bufferedTrack = t3, this.switchingTrack = null, this.hls.trigger(h.AUDIO_TRACK_SWITCHED, T({}, t3)));
      }
      this.fragBufferedComplete(s2, i2), this.media && this.tick();
    }
    else this.audioOnly || s2.type !== g || s2.elementaryStreams.video || s2.elementaryStreams.audiovideo || (this.audioOnly = true, this.mainFragLoading = null);
  }
  onError(t2, e2) {
    var s2;
    if (e2.fatal) this.state = Us;
    else switch (e2.details) {
      case l.FRAG_GAP:
      case l.FRAG_PARSING_ERROR:
      case l.FRAG_DECRYPT_ERROR:
      case l.FRAG_LOAD_ERROR:
      case l.FRAG_LOAD_TIMEOUT:
      case l.KEY_LOAD_ERROR:
      case l.KEY_LOAD_TIMEOUT:
        this.onFragmentOrKeyLoadError(m, e2);
        break;
      case l.AUDIO_TRACK_LOAD_ERROR:
      case l.AUDIO_TRACK_LOAD_TIMEOUT:
      case l.LEVEL_PARSING_ERROR:
        e2.levelRetry || this.state !== Fs || (null == (s2 = e2.context) ? void 0 : s2.type) !== u || (this.state = ws);
        break;
      case l.BUFFER_ADD_CODEC_ERROR:
      case l.BUFFER_APPEND_ERROR:
        if ("audio" !== e2.parent) return;
        this.reduceLengthAndFlushBuffer(e2) || this.resetLoadingState();
        break;
      case l.BUFFER_FULL_ERROR:
        if ("audio" !== e2.parent) return;
        this.reduceLengthAndFlushBuffer(e2) && (this.bufferedTrack = null, super.flushMainBuffer(0, Number.POSITIVE_INFINITY, "audio"));
        break;
      case l.INTERNAL_EXCEPTION:
        this.recoverWorkerError(e2);
    }
  }
  onBufferFlushing(t2, { type: e2 }) {
    e2 !== N && (this.flushing = true);
  }
  onBufferFlushed(t2, { type: e2 }) {
    if (e2 !== N) {
      this.flushing = false, this.bufferFlushed = true, this.state === $s && (this.state = ws);
      const t3 = this.mediaBuffer || this.media;
      t3 && (this.afterBufferFlushed(t3, e2, m), this.tick());
    }
  }
  _handleTransmuxComplete(t2) {
    var e2;
    const s2 = "audio", { hls: i2 } = this, { remuxResult: r2, chunkMeta: n2 } = t2, a2 = this.getCurrentContext(n2);
    if (!a2) return void this.resetWhenMissingContext(n2);
    const { frag: o2, part: l2, level: d2 } = a2, { details: c2 } = d2, { audio: u2, text: f2, id3: g2, initSegment: m2 } = r2;
    if (!this.fragContextChanged(o2) && c2) {
      if (this.state = Ns, this.switchingTrack && u2 && this.completeAudioSwitch(this.switchingTrack), null != m2 && m2.tracks) {
        const t3 = o2.initSegment || o2;
        if (this.unhandledEncryptionError(m2, o2)) return;
        this._bufferInitSegment(d2, m2.tracks, t3, n2), i2.trigger(h.FRAG_PARSING_INIT_SEGMENT, { frag: t3, id: s2, tracks: m2.tracks });
      }
      if (u2) {
        const { startPTS: t3, endPTS: e3, startDTS: s3, endDTS: i3 } = u2;
        l2 && (l2.elementaryStreams[F] = { startPTS: t3, endPTS: e3, startDTS: s3, endDTS: i3 }), o2.setElementaryStreamInfo(F, t3, e3, s3, i3), this.bufferFragmentData(u2, o2, l2, n2);
      }
      if (null != g2 && null != (e2 = g2.samples) && e2.length) {
        const t3 = y({ id: s2, frag: o2, details: c2 }, g2);
        i2.trigger(h.FRAG_PARSING_METADATA, t3);
      }
      if (f2) {
        const t3 = y({ id: s2, frag: o2, details: c2 }, f2);
        i2.trigger(h.FRAG_PARSING_USERDATA, t3);
      }
    } else this.fragmentTracker.removeFragment(o2);
  }
  _bufferInitSegment(t2, e2, s2, i2) {
    if (this.state !== Ns) return;
    if (e2.video && delete e2.video, e2.audiovideo && delete e2.audiovideo, !e2.audio) return;
    const r2 = e2.audio;
    r2.id = m;
    const n2 = t2.audioCodec;
    this.log(`Init audio buffer, container:${r2.container}, codecs[level/parsed]=[${n2}/${r2.codec}]`), n2 && 1 === n2.split(",").length && (r2.levelCodec = n2), this.hls.trigger(h.BUFFER_CODECS, e2);
    const a2 = r2.initSegment;
    if (null != a2 && a2.byteLength) {
      const t3 = { type: "audio", frag: s2, part: null, chunkMeta: i2, parent: s2.type, data: a2 };
      this.hls.trigger(h.BUFFER_APPENDING, t3);
    }
    this.tickImmediate();
  }
  loadFragment(t2, e2, s2) {
    const i2 = this.fragmentTracker.getState(t2);
    var r2;
    if (this.switchingTrack || i2 === le || i2 === de) if ($(t2)) if (null != (r2 = e2.details) && r2.live && !this.initPTS[t2.cc]) {
      this.log(`Waiting for video PTS in continuity counter ${t2.cc} of live stream before loading audio fragment ${t2.sn} of level ${this.trackId}`), this.state = Gs;
      const s3 = this.mainDetails;
      s3 && s3.fragmentStart !== e2.details.fragmentStart && Ps(e2.details, s3);
    } else super.loadFragment(t2, e2, s2);
    else this._loadInitSegment(t2, e2);
    else this.clearTrackerIfNeeded(t2);
  }
  flushAudioIfNeeded(t2) {
    if (this.media && this.bufferedTrack) {
      const { name: e2, lang: s2, assocLang: i2, characteristics: r2, audioCodec: n2, channels: a2 } = this.bufferedTrack;
      Vt({ name: e2, lang: s2, assocLang: i2, characteristics: r2, audioCodec: n2, channels: a2 }, t2, Yt) || (jt(t2.url, this.hls) ? (this.log("Switching audio track : flushing all audio"), super.flushMainBuffer(0, Number.POSITIVE_INFINITY, "audio"), this.bufferedTrack = null) : this.bufferedTrack = t2);
    }
  }
  completeAudioSwitch(t2) {
    const { hls: e2 } = this;
    this.flushAudioIfNeeded(t2), this.bufferedTrack = t2, this.switchingTrack = null, e2.trigger(h.AUDIO_TRACK_SWITCHED, T({}, t2));
  }
}, audioTrackController: class extends BasePlaylistController {
  constructor(t2) {
    super(t2, "audio-track-controller"), this.tracks = [], this.groupIds = null, this.tracksInGroup = [], this.trackId = -1, this.currentTrack = null, this.selectDefaultTrack = true, this.registerListeners();
  }
  registerListeners() {
    const { hls: t2 } = this;
    t2.on(h.MANIFEST_LOADING, this.onManifestLoading, this), t2.on(h.MANIFEST_PARSED, this.onManifestParsed, this), t2.on(h.LEVEL_LOADING, this.onLevelLoading, this), t2.on(h.LEVEL_SWITCHING, this.onLevelSwitching, this), t2.on(h.AUDIO_TRACK_LOADED, this.onAudioTrackLoaded, this), t2.on(h.ERROR, this.onError, this);
  }
  unregisterListeners() {
    const { hls: t2 } = this;
    t2.off(h.MANIFEST_LOADING, this.onManifestLoading, this), t2.off(h.MANIFEST_PARSED, this.onManifestParsed, this), t2.off(h.LEVEL_LOADING, this.onLevelLoading, this), t2.off(h.LEVEL_SWITCHING, this.onLevelSwitching, this), t2.off(h.AUDIO_TRACK_LOADED, this.onAudioTrackLoaded, this), t2.off(h.ERROR, this.onError, this);
  }
  destroy() {
    this.unregisterListeners(), this.tracks.length = 0, this.tracksInGroup.length = 0, this.currentTrack = null, super.destroy();
  }
  onManifestLoading() {
    this.tracks = [], this.tracksInGroup = [], this.groupIds = null, this.currentTrack = null, this.trackId = -1, this.selectDefaultTrack = true;
  }
  onManifestParsed(t2, e2) {
    this.tracks = e2.audioTracks || [];
  }
  onAudioTrackLoaded(t2, e2) {
    const { id: s2, groupId: i2, details: r2 } = e2, n2 = this.tracksInGroup[s2];
    if (!n2 || n2.groupId !== i2) return void this.warn(`Audio track with id:${s2} and group:${i2} not found in active group ${null == n2 ? void 0 : n2.groupId}`);
    const a2 = n2.details;
    n2.details = e2.details, this.log(`Audio track ${s2} "${n2.name}" lang:${n2.lang} group:${i2} loaded [${r2.startSN}-${r2.endSN}]`), s2 === this.trackId && this.playlistLoaded(s2, e2, a2);
  }
  onLevelLoading(t2, e2) {
    this.switchLevel(e2.level);
  }
  onLevelSwitching(t2, e2) {
    this.switchLevel(e2.level);
  }
  switchLevel(t2) {
    const e2 = this.hls.levels[t2];
    if (!e2) return;
    const s2 = e2.audioGroups || null, i2 = this.groupIds;
    let r2 = this.currentTrack;
    if (!s2 || (null == i2 ? void 0 : i2.length) !== (null == s2 ? void 0 : s2.length) || null != s2 && s2.some((t3) => -1 === (null == i2 ? void 0 : i2.indexOf(t3)))) {
      this.groupIds = s2, this.trackId = -1, this.currentTrack = null;
      const t3 = this.tracks.filter((t4) => !s2 || -1 !== s2.indexOf(t4.groupId));
      if (t3.length) this.selectDefaultTrack && !t3.some((t4) => t4.default) && (this.selectDefaultTrack = false), t3.forEach((t4, e4) => {
        t4.id = e4;
      });
      else if (!r2 && !this.tracksInGroup.length) return;
      this.tracksInGroup = t3;
      const e3 = this.hls.config.audioPreference;
      if (!r2 && e3) {
        const s3 = Ht(e3, t3, Yt);
        if (s3 > -1) r2 = t3[s3];
        else {
          const t4 = Ht(e3, this.tracks);
          r2 = this.tracks[t4];
        }
      }
      let i3 = this.findTrackId(r2);
      -1 === i3 && r2 && (i3 = this.findTrackId(null));
      const a2 = { audioTracks: t3 };
      this.log(`Updating audio tracks, ${t3.length} track(s) found in group(s): ${null == s2 ? void 0 : s2.join(",")}`), this.hls.trigger(h.AUDIO_TRACKS_UPDATED, a2);
      const d2 = this.trackId;
      if (-1 !== i3 && -1 === d2) this.setAudioTrack(i3);
      else if (t3.length && -1 === d2) {
        var n2;
        const e4 = new Error(`No audio track selected for current audio group-ID(s): ${null == (n2 = this.groupIds) ? void 0 : n2.join(",")} track count: ${t3.length}`);
        this.warn(e4.message), this.hls.trigger(h.ERROR, { type: o.MEDIA_ERROR, details: l.AUDIO_TRACK_LOAD_ERROR, fatal: true, error: e4 });
      }
    }
  }
  onError(t2, e2) {
    !e2.fatal && e2.context && (e2.context.type !== u || e2.context.id !== this.trackId || this.groupIds && -1 === this.groupIds.indexOf(e2.context.groupId) || this.checkRetry(e2));
  }
  get allAudioTracks() {
    return this.tracks;
  }
  get audioTracks() {
    return this.tracksInGroup;
  }
  get audioTrack() {
    return this.trackId;
  }
  set audioTrack(t2) {
    this.selectDefaultTrack = false, this.setAudioTrack(t2);
  }
  setAudioOption(t2) {
    const e2 = this.hls;
    if (e2.config.audioPreference = t2, t2) {
      const s2 = this.allAudioTracks;
      if (this.selectDefaultTrack = false, s2.length) {
        const i2 = this.currentTrack;
        if (i2 && Vt(t2, i2, Yt)) return i2;
        const r2 = Ht(t2, this.tracksInGroup, Yt);
        if (r2 > -1) {
          const t3 = this.tracksInGroup[r2];
          return this.setAudioTrack(r2), t3;
        }
        if (i2) {
          let i3 = e2.loadLevel;
          -1 === i3 && (i3 = e2.firstAutoLevel);
          const r3 = function(t3, e3, s3, i4, r4) {
            const n2 = e3[i4], a2 = e3.reduce((t4, e4, s4) => {
              const i5 = e4.uri;
              return (t4[i5] || (t4[i5] = [])).push(s4), t4;
            }, {})[n2.uri];
            a2.length > 1 && (i4 = Math.max.apply(Math, a2));
            const o2 = n2.videoRange, l2 = n2.frameRate, h2 = n2.codecSet.substring(0, 4), d2 = Wt(e3, i4, (e4) => {
              if (e4.videoRange !== o2 || e4.frameRate !== l2 || e4.codecSet.substring(0, 4) !== h2) return false;
              const i5 = e4.audioGroups, n3 = s3.filter((t4) => !i5 || -1 !== i5.indexOf(t4.groupId));
              return Ht(t3, n3, r4) > -1;
            });
            return d2 > -1 ? d2 : Wt(e3, i4, (e4) => {
              const i5 = e4.audioGroups, n3 = s3.filter((t4) => !i5 || -1 !== i5.indexOf(t4.groupId));
              return Ht(t3, n3, r4) > -1;
            });
          }(t2, e2.levels, s2, i3, Yt);
          if (-1 === r3) return null;
          e2.nextLoadLevel = r3;
        }
        if (t2.channels || t2.audioCodec) {
          const e3 = Ht(t2, s2);
          if (e3 > -1) return s2[e3];
        }
      }
    }
    return null;
  }
  setAudioTrack(t2) {
    const e2 = this.tracksInGroup;
    if (t2 < 0 || t2 >= e2.length) return void this.warn(`Invalid audio track id: ${t2}`);
    this.selectDefaultTrack = false;
    const s2 = this.currentTrack, i2 = e2[t2], r2 = i2.details && !i2.details.live;
    if (t2 === this.trackId && i2 === s2 && r2) return;
    if (this.log(`Switching to audio-track ${t2} "${i2.name}" lang:${i2.lang} group:${i2.groupId} channels:${i2.channels}`), this.trackId = t2, this.currentTrack = i2, this.hls.trigger(h.AUDIO_TRACK_SWITCHING, T({}, i2)), r2) return;
    const n2 = this.switchParams(i2.url, null == s2 ? void 0 : s2.details, i2.details);
    this.loadPlaylist(n2);
  }
  findTrackId(t2) {
    const e2 = this.tracksInGroup;
    for (let s2 = 0; s2 < e2.length; s2++) {
      const i2 = e2[s2];
      if ((!this.selectDefaultTrack || i2.default) && (!t2 || Vt(t2, i2, Yt))) return s2;
    }
    if (t2) {
      const { name: s2, lang: i2, assocLang: r2, characteristics: n2, audioCodec: a2, channels: o2 } = t2;
      for (let t3 = 0; t3 < e2.length; t3++) if (Vt({ name: s2, lang: i2, assocLang: r2, characteristics: n2, audioCodec: a2, channels: o2 }, e2[t3], Yt)) return t3;
      for (let s3 = 0; s3 < e2.length; s3++) {
        const i3 = e2[s3];
        if (rr(t2.attrs, i3.attrs, ["LANGUAGE", "ASSOC-LANGUAGE", "CHARACTERISTICS"])) return s3;
      }
      for (let s3 = 0; s3 < e2.length; s3++) {
        const i3 = e2[s3];
        if (rr(t2.attrs, i3.attrs, ["LANGUAGE"])) return s3;
      }
    }
    return -1;
  }
  loadPlaylist(t2) {
    super.loadPlaylist();
    const e2 = this.currentTrack;
    this.shouldLoadPlaylist(e2) && jt(e2.url, this.hls) && this.scheduleLoading(e2, t2);
  }
  loadingPlaylist(t2, e2) {
    super.loadingPlaylist(t2, e2);
    const s2 = t2.id, i2 = t2.groupId, r2 = this.getUrlWithDirectives(t2.url, e2), n2 = t2.details, a2 = null == n2 ? void 0 : n2.age;
    this.log(`Loading audio-track ${s2} "${t2.name}" lang:${t2.lang} group:${i2}${void 0 !== (null == e2 ? void 0 : e2.msn) ? " at sn " + e2.msn + " part " + e2.part : ""}${a2 && n2.live ? " age " + a2.toFixed(1) + (n2.type && " " + n2.type || "") : ""} ${r2}`), this.hls.trigger(h.AUDIO_TRACK_LOADING, { url: r2, id: s2, groupId: i2, deliveryDirectives: e2 || null, track: t2 });
  }
}, emeController: EMEController, cmcdController: class {
  constructor(t2) {
    this.hls = void 0, this.config = void 0, this.media = void 0, this.sid = void 0, this.cid = void 0, this.useHeaders = false, this.includeKeys = void 0, this.initialized = false, this.starved = false, this.buffering = true, this.audioBuffer = void 0, this.videoBuffer = void 0, this.onWaiting = () => {
      this.initialized && (this.starved = true), this.buffering = true;
    }, this.onPlaying = () => {
      this.initialized || (this.initialized = true), this.buffering = false;
    }, this.applyPlaylistData = (t3) => {
      try {
        this.apply(t3, { ot: "m", su: !this.initialized });
      } catch (t4) {
        this.hls.logger.warn("Could not generate manifest CMCD data.", t4);
      }
    }, this.applyFragmentData = (t3) => {
      try {
        const { frag: e3, part: s3 } = t3, i2 = this.hls.levels[e3.level], r2 = this.getObjectType(e3), n2 = { d: 1e3 * (s3 || e3).duration, ot: r2 };
        "v" !== r2 && r2 !== dr && r2 != cr || (n2.br = i2.bitrate / 1e3, n2.tb = this.getTopBandwidth(r2) / 1e3, n2.bl = this.getBufferLength(r2));
        const a2 = s3 ? this.getNextPart(s3) : this.getNextFrag(e3);
        null != a2 && a2.url && a2.url !== e3.url && (n2.nor = a2.url), this.apply(t3, n2);
      } catch (t4) {
        this.hls.logger.warn("Could not generate segment CMCD data.", t4);
      }
    }, this.hls = t2;
    const e2 = this.config = t2.config, { cmcd: s2 } = e2;
    null != s2 && (e2.pLoader = this.createPlaylistLoader(), e2.fLoader = this.createFragmentLoader(), this.sid = s2.sessionId || t2.sessionId, this.cid = s2.contentId, this.useHeaders = true === s2.useHeaders, this.includeKeys = s2.includeKeys, this.registerListeners());
  }
  registerListeners() {
    const t2 = this.hls;
    t2.on(h.MEDIA_ATTACHED, this.onMediaAttached, this), t2.on(h.MEDIA_DETACHED, this.onMediaDetached, this), t2.on(h.BUFFER_CREATED, this.onBufferCreated, this);
  }
  unregisterListeners() {
    const t2 = this.hls;
    t2.off(h.MEDIA_ATTACHED, this.onMediaAttached, this), t2.off(h.MEDIA_DETACHED, this.onMediaDetached, this), t2.off(h.BUFFER_CREATED, this.onBufferCreated, this);
  }
  destroy() {
    this.unregisterListeners(), this.onMediaDetached(), this.hls = this.config = this.audioBuffer = this.videoBuffer = null, this.onWaiting = this.onPlaying = this.media = null;
  }
  onMediaAttached(t2, e2) {
    this.media = e2.media, this.media.addEventListener("waiting", this.onWaiting), this.media.addEventListener("playing", this.onPlaying);
  }
  onMediaDetached() {
    this.media && (this.media.removeEventListener("waiting", this.onWaiting), this.media.removeEventListener("playing", this.onPlaying), this.media = null);
  }
  onBufferCreated(t2, e2) {
    var s2, i2;
    this.audioBuffer = null == (s2 = e2.tracks.audio) ? void 0 : s2.buffer, this.videoBuffer = null == (i2 = e2.tracks.video) ? void 0 : i2.buffer;
  }
  createData() {
    var t2;
    return { v: 1, sf: "h", sid: this.sid, cid: this.cid, pr: null == (t2 = this.media) ? void 0 : t2.playbackRate, mtp: this.hls.bandwidthEstimate / 1e3 };
  }
  apply(t2, e2 = {}) {
    y(e2, this.createData());
    const s2 = "i" === e2.ot || "v" === e2.ot || e2.ot === cr;
    this.starved && s2 && (e2.bs = true, e2.su = true, this.starved = false), null == e2.su && (e2.su = this.buffering);
    const { includeKeys: i2 } = this;
    i2 && (e2 = Object.keys(e2).reduce((t3, s3) => (i2.includes(s3) && (t3[s3] = e2[s3]), t3), {}));
    const r2 = { baseUrl: t2.url };
    this.useHeaders ? (t2.headers || (t2.headers = {}), function(t3, e3, s3) {
      y(t3, function(t4, e4 = {}) {
        const s4 = {};
        if (!t4) return s4;
        const i3 = function(t5, e5) {
          const s5 = {};
          if (!t5) return s5;
          const i4 = Object.keys(t5), r3 = e5 ? (n2 = e5, Object.keys(n2).reduce((t6, e6) => {
            var s6;
            return null === (s6 = n2[e6]) || void 0 === s6 || s6.forEach((s7) => t6[s7] = e6), t6;
          }, {})) : {};
          var n2;
          return i4.reduce((e6, s6) => {
            var i5;
            const n3 = Pr[s6] || r3[s6] || Dr;
            return (null !== (i5 = e6[n3]) && void 0 !== i5 ? i5 : e6[n3] = {})[s6] = t5[s6], e6;
          }, s5);
        }(Wr(t4, e4), null == e4 ? void 0 : e4.customHeaderMap);
        return Object.entries(i3).reduce((t5, [e5, s5]) => {
          const i4 = Ar(s5, { whitespace: false });
          return i4 && (t5[e5] = i4), t5;
        }, s4);
      }(e3, s3));
    }(t2.headers, e2, r2)) : t2.url = function(t3, e3, s3) {
      const i3 = function(t4, e4 = {}) {
        return t4 ? `CMCD=${function(t5, e5 = {}) {
          if (!t5) return "";
          const s4 = function(t6, e6 = {}) {
            return t6 ? Ar(Wr(t6, e6), { whitespace: false }) : "";
          }(t5, e5);
          return encodeURIComponent(s4);
        }(t4, e4)}` : "";
      }(e3, s3);
      if (!i3) return t3;
      if (jr.test(t3)) return t3.replace(jr, i3);
      const r3 = t3.includes("?") ? "&" : "?";
      return `${t3}${r3}${i3}`;
    }(t2.url, e2, r2);
  }
  getNextFrag(t2) {
    var e2;
    const s2 = null == (e2 = this.hls.levels[t2.level]) ? void 0 : e2.details;
    if (s2) {
      const e3 = t2.sn - s2.startSN;
      return s2.fragments[e3 + 1];
    }
  }
  getNextPart(t2) {
    var e2;
    const { index: s2, fragment: i2 } = t2, r2 = null == (e2 = this.hls.levels[i2.level]) || null == (e2 = e2.details) ? void 0 : e2.partList;
    if (r2) {
      const { sn: t3 } = i2;
      for (let e3 = r2.length - 1; e3 >= 0; e3--) {
        const i3 = r2[e3];
        if (i3.index === s2 && i3.fragment.sn === t3) return r2[e3 + 1];
      }
    }
  }
  getObjectType(t2) {
    const { type: e2 } = t2;
    return "subtitle" === e2 ? "tt" : "initSegment" === t2.sn ? "i" : "audio" === e2 ? dr : "main" === e2 ? this.hls.audioTracks.length ? "v" : cr : void 0;
  }
  getTopBandwidth(t2) {
    let e2, s2 = 0;
    const i2 = this.hls;
    if (t2 === dr) e2 = i2.audioTracks;
    else {
      const t3 = i2.maxAutoLevel, s3 = t3 > -1 ? t3 + 1 : i2.levels.length;
      e2 = i2.levels.slice(0, s3);
    }
    return e2.forEach((t3) => {
      t3.bitrate > s2 && (s2 = t3.bitrate);
    }), s2 > 0 ? s2 : NaN;
  }
  getBufferLength(t2) {
    const e2 = this.media, s2 = t2 === dr ? this.audioBuffer : this.videoBuffer;
    return s2 && e2 ? 1e3 * BufferHelper.bufferInfo(s2, e2.currentTime, this.config.maxBufferHole).len : NaN;
  }
  createPlaylistLoader() {
    const { pLoader: t2 } = this.config, e2 = this.applyPlaylistData, s2 = t2 || this.config.loader;
    return class {
      constructor(t3) {
        this.loader = void 0, this.loader = new s2(t3);
      }
      get stats() {
        return this.loader.stats;
      }
      get context() {
        return this.loader.context;
      }
      destroy() {
        this.loader.destroy();
      }
      abort() {
        this.loader.abort();
      }
      load(t3, s3, i2) {
        e2(t3), this.loader.load(t3, s3, i2);
      }
    };
  }
  createFragmentLoader() {
    const { fLoader: t2 } = this.config, e2 = this.applyFragmentData, s2 = t2 || this.config.loader;
    return class {
      constructor(t3) {
        this.loader = void 0, this.loader = new s2(t3);
      }
      get stats() {
        return this.loader.stats;
      }
      get context() {
        return this.loader.context;
      }
      destroy() {
        this.loader.destroy();
      }
      abort() {
        this.loader.abort();
      }
      load(t3, s3, i2) {
        e2(t3), this.loader.load(t3, s3, i2);
      }
    };
  }
}, contentSteeringController: class extends Logger {
  constructor(t2) {
    super("content-steering", t2.logger), this.hls = void 0, this.loader = null, this.uri = null, this.pathwayId = ".", this._pathwayPriority = null, this.timeToLoad = 300, this.reloadTimer = -1, this.updated = 0, this.started = false, this.enabled = true, this.levels = null, this.audioTracks = null, this.subtitleTracks = null, this.penalizedPathways = {}, this.hls = t2, this.registerListeners();
  }
  registerListeners() {
    const t2 = this.hls;
    t2.on(h.MANIFEST_LOADING, this.onManifestLoading, this), t2.on(h.MANIFEST_LOADED, this.onManifestLoaded, this), t2.on(h.MANIFEST_PARSED, this.onManifestParsed, this), t2.on(h.ERROR, this.onError, this);
  }
  unregisterListeners() {
    const t2 = this.hls;
    t2 && (t2.off(h.MANIFEST_LOADING, this.onManifestLoading, this), t2.off(h.MANIFEST_LOADED, this.onManifestLoaded, this), t2.off(h.MANIFEST_PARSED, this.onManifestParsed, this), t2.off(h.ERROR, this.onError, this));
  }
  pathways() {
    return (this.levels || []).reduce((t2, e2) => (-1 === t2.indexOf(e2.pathwayId) && t2.push(e2.pathwayId), t2), []);
  }
  get pathwayPriority() {
    return this._pathwayPriority;
  }
  set pathwayPriority(t2) {
    this.updatePathwayPriority(t2);
  }
  startLoad() {
    if (this.started = true, this.clearTimeout(), this.enabled && this.uri) {
      if (this.updated) {
        const t2 = 1e3 * this.timeToLoad - (performance.now() - this.updated);
        if (t2 > 0) return void this.scheduleRefresh(this.uri, t2);
      }
      this.loadSteeringManifest(this.uri);
    }
  }
  stopLoad() {
    this.started = false, this.loader && (this.loader.destroy(), this.loader = null), this.clearTimeout();
  }
  clearTimeout() {
    -1 !== this.reloadTimer && (self.clearTimeout(this.reloadTimer), this.reloadTimer = -1);
  }
  destroy() {
    this.unregisterListeners(), this.stopLoad(), this.hls = null, this.levels = this.audioTracks = this.subtitleTracks = null;
  }
  removeLevel(t2) {
    const e2 = this.levels;
    e2 && (this.levels = e2.filter((e3) => e3 !== t2));
  }
  onManifestLoading() {
    this.stopLoad(), this.enabled = true, this.timeToLoad = 300, this.updated = 0, this.uri = null, this.pathwayId = ".", this.levels = this.audioTracks = this.subtitleTracks = null;
  }
  onManifestLoaded(t2, e2) {
    const { contentSteering: s2 } = e2;
    null !== s2 && (this.pathwayId = s2.pathwayId, this.uri = s2.uri, this.started && this.startLoad());
  }
  onManifestParsed(t2, e2) {
    this.audioTracks = e2.audioTracks, this.subtitleTracks = e2.subtitleTracks;
  }
  onError(t2, e2) {
    const { errorAction: s2 } = e2;
    if (2 === (null == s2 ? void 0 : s2.action) && 1 === s2.flags) {
      const t3 = this.levels;
      let i2 = this._pathwayPriority, r2 = this.pathwayId;
      if (e2.context) {
        const { groupId: s3, pathwayId: i3, type: n2 } = e2.context;
        s3 && t3 ? r2 = this.getPathwayForGroupId(s3, n2, r2) : i3 && (r2 = i3);
      }
      r2 in this.penalizedPathways || (this.penalizedPathways[r2] = performance.now()), !i2 && t3 && (i2 = this.pathways()), i2 && i2.length > 1 && (this.updatePathwayPriority(i2), s2.resolved = this.pathwayId !== r2), e2.details !== l.BUFFER_APPEND_ERROR || e2.fatal ? s2.resolved || this.warn(`Could not resolve ${e2.details} ("${e2.error.message}") with content-steering for Pathway: ${r2} levels: ${t3 ? t3.length : t3} priorities: ${$t(i2)} penalized: ${$t(this.penalizedPathways)}`) : s2.resolved = true;
    }
  }
  filterParsedLevels(t2) {
    this.levels = t2;
    let e2 = this.getLevelsForPathway(this.pathwayId);
    if (0 === e2.length) {
      const s2 = t2[0].pathwayId;
      this.log(`No levels found in Pathway ${this.pathwayId}. Setting initial Pathway to "${s2}"`), e2 = this.getLevelsForPathway(s2), this.pathwayId = s2;
    }
    return e2.length !== t2.length && this.log(`Found ${e2.length}/${t2.length} levels in Pathway "${this.pathwayId}"`), e2;
  }
  getLevelsForPathway(t2) {
    return null === this.levels ? [] : this.levels.filter((e2) => t2 === e2.pathwayId);
  }
  updatePathwayPriority(t2) {
    let e2;
    this._pathwayPriority = t2;
    const s2 = this.penalizedPathways, i2 = performance.now();
    Object.keys(s2).forEach((t3) => {
      i2 - s2[t3] > 3e5 && delete s2[t3];
    });
    for (let i3 = 0; i3 < t2.length; i3++) {
      const r2 = t2[i3];
      if (r2 in s2) continue;
      if (r2 === this.pathwayId) return;
      const n2 = this.hls.nextLoadLevel, a2 = this.hls.levels[n2];
      if (e2 = this.getLevelsForPathway(r2), e2.length > 0) {
        this.log(`Setting Pathway to "${r2}"`), this.pathwayId = r2, Ss(e2), this.hls.trigger(h.LEVELS_UPDATED, { levels: e2 });
        const t3 = this.hls.levels[n2];
        a2 && t3 && this.levels && (t3.attrs["STABLE-VARIANT-ID"] !== a2.attrs["STABLE-VARIANT-ID"] && t3.bitrate !== a2.bitrate && this.log(`Unstable Pathways change from bitrate ${a2.bitrate} to ${t3.bitrate}`), this.hls.nextLoadLevel = n2);
        break;
      }
    }
  }
  getPathwayForGroupId(t2, e2, s2) {
    const i2 = this.getLevelsForPathway(s2).concat(this.levels || []);
    for (let s3 = 0; s3 < i2.length; s3++) if (e2 === u && i2[s3].hasAudioGroup(t2) || e2 === f && i2[s3].hasSubtitleGroup(t2)) return i2[s3].pathwayId;
    return s2;
  }
  clonePathways(t2) {
    const e2 = this.levels;
    if (!e2) return;
    const s2 = {}, i2 = {};
    t2.forEach((t3) => {
      const { ID: r2, "BASE-ID": n2, "URI-REPLACEMENT": a2 } = t3;
      if (e2.some((t4) => t4.pathwayId === r2)) return;
      const o2 = this.getLevelsForPathway(n2).map((t4) => {
        const e3 = new AttrList(t4.attrs);
        e3["PATHWAY-ID"] = r2;
        const n3 = e3.AUDIO && `${e3.AUDIO}_clone_${r2}`, o3 = e3.SUBTITLES && `${e3.SUBTITLES}_clone_${r2}`;
        n3 && (s2[e3.AUDIO] = n3, e3.AUDIO = n3), o3 && (i2[e3.SUBTITLES] = o3, e3.SUBTITLES = o3);
        const l2 = Xr(t4.uri, e3["STABLE-VARIANT-ID"], "PER-VARIANT-URIS", a2), h2 = new Level({ attrs: e3, audioCodec: t4.audioCodec, bitrate: t4.bitrate, height: t4.height, name: t4.name, url: l2, videoCodec: t4.videoCodec, width: t4.width });
        if (t4.audioGroups) for (let e4 = 1; e4 < t4.audioGroups.length; e4++) h2.addGroupId("audio", `${t4.audioGroups[e4]}_clone_${r2}`);
        if (t4.subtitleGroups) for (let e4 = 1; e4 < t4.subtitleGroups.length; e4++) h2.addGroupId("text", `${t4.subtitleGroups[e4]}_clone_${r2}`);
        return h2;
      });
      e2.push(...o2), qr(this.audioTracks, s2, a2, r2), qr(this.subtitleTracks, i2, a2, r2);
    });
  }
  loadSteeringManifest(t2) {
    const e2 = this.hls.config, s2 = e2.loader;
    let i2;
    this.loader && this.loader.destroy(), this.loader = new s2(e2);
    try {
      i2 = new self.URL(t2);
    } catch (e3) {
      return this.enabled = false, void this.log(`Failed to parse Steering Manifest URI: ${t2}`);
    }
    if ("data:" !== i2.protocol) {
      const t3 = 0 | (this.hls.bandwidthEstimate || e2.abrEwmaDefaultEstimate);
      i2.searchParams.set("_HLS_pathway", this.pathwayId), i2.searchParams.set("_HLS_throughput", "" + t3);
    }
    const r2 = { responseType: "json", url: i2.href }, n2 = e2.steeringManifestLoadPolicy.default, a2 = n2.errorRetry || n2.timeoutRetry || {}, o2 = { loadPolicy: n2, timeout: n2.maxLoadTimeMs, maxRetry: a2.maxNumRetry || 0, retryDelay: a2.retryDelayMs || 0, maxRetryDelay: a2.maxRetryDelayMs || 0 }, l2 = { onSuccess: (t3, e3, s3, r3) => {
      this.log(`Loaded steering manifest: "${i2}"`);
      const n3 = t3.data;
      if (1 !== (null == n3 ? void 0 : n3.VERSION)) return void this.log(`Steering VERSION ${n3.VERSION} not supported!`);
      this.updated = performance.now(), this.timeToLoad = n3.TTL;
      const { "RELOAD-URI": a3, "PATHWAY-CLONES": o3, "PATHWAY-PRIORITY": l3 } = n3;
      if (a3) try {
        this.uri = new self.URL(a3, i2).href;
      } catch (t4) {
        return this.enabled = false, void this.log(`Failed to parse Steering Manifest RELOAD-URI: ${a3}`);
      }
      this.scheduleRefresh(this.uri || s3.url), o3 && this.clonePathways(o3);
      const d2 = { steeringManifest: n3, url: i2.toString() };
      this.hls.trigger(h.STEERING_MANIFEST_LOADED, d2), l3 && this.updatePathwayPriority(l3);
    }, onError: (t3, e3, s3, i3) => {
      if (this.log(`Error loading steering manifest: ${t3.code} ${t3.text} (${e3.url})`), this.stopLoad(), 410 === t3.code) return this.enabled = false, void this.log(`Steering manifest ${e3.url} no longer available`);
      let r3 = 1e3 * this.timeToLoad;
      if (429 === t3.code) {
        const t4 = this.loader;
        if ("function" == typeof (null == t4 ? void 0 : t4.getResponseHeader)) {
          const e4 = t4.getResponseHeader("Retry-After");
          e4 && (r3 = 1e3 * parseFloat(e4));
        }
        return void this.log(`Steering manifest ${e3.url} rate limited`);
      }
      this.scheduleRefresh(this.uri || e3.url, r3);
    }, onTimeout: (t3, e3, s3) => {
      this.log(`Timeout loading steering manifest (${e3.url})`), this.scheduleRefresh(this.uri || e3.url);
    } };
    this.log(`Requesting steering manifest: ${i2}`), this.loader.load(r2, o2, l2);
  }
  scheduleRefresh(t2, e2 = 1e3 * this.timeToLoad) {
    this.clearTimeout(), this.reloadTimer = self.setTimeout(() => {
      var e3;
      const s2 = null == (e3 = this.hls) ? void 0 : e3.media;
      !s2 || s2.ended ? this.scheduleRefresh(t2, 1e3 * this.timeToLoad) : this.loadSteeringManifest(t2);
    }, e2);
  }
}, interstitialsController: class extends Logger {
  constructor(t2, e2) {
    super("interstitials", t2.logger), this.HlsPlayerClass = void 0, this.hls = void 0, this.assetListLoader = void 0, this.mediaSelection = null, this.altSelection = null, this.media = null, this.detachedData = null, this.requiredTracks = null, this.manager = null, this.playerQueue = [], this.bufferedPos = -1, this.timelinePos = -1, this.schedule = void 0, this.playingItem = null, this.bufferingItem = null, this.waitingItem = null, this.endedItem = null, this.playingAsset = null, this.endedAsset = null, this.bufferingAsset = null, this.shouldPlay = false, this.onPlay = () => {
      this.shouldPlay = true;
    }, this.onPause = () => {
      this.shouldPlay = false;
    }, this.onSeeking = () => {
      const t3 = this.currentTime;
      if (void 0 === t3 || this.playbackDisabled || !this.schedule) return;
      const e3 = t3 - this.timelinePos;
      if (Math.abs(e3) < 1 / 7056e5) return;
      const s2 = e3 <= -0.01;
      -1 !== this.timelinePos || this.effectivePlayingItem || this.checkStart(), this.timelinePos = t3, this.bufferedPos = t3;
      const i2 = this.playingItem;
      if (!i2) return void this.checkBuffer();
      if (s2 && this.schedule.resetErrorsInRange(t3, t3 - e3) && this.updateSchedule(true), this.checkBuffer(), s2 && t3 < i2.start || t3 >= i2.end) {
        var r2;
        const e4 = this.findItemIndex(i2);
        let n3 = this.schedule.findItemIndexAtTime(t3);
        if (-1 === n3 && (n3 = e4 + (s2 ? -1 : 1), this.log(`seeked ${s2 ? "back " : ""}to position not covered by schedule ${t3} (resolving from ${e4} to ${n3})`)), !this.isInterstitial(i2) && null != (r2 = this.media) && r2.paused && (this.shouldPlay = false), !s2 && n3 > e4) {
          const t4 = this.schedule.findJumpRestrictedIndex(e4 + 1, n3);
          if (t4 > e4) return void this.setSchedulePosition(t4);
        }
        return void this.setSchedulePosition(n3);
      }
      const n2 = this.playingAsset;
      if (!n2) {
        if (this.playingLastItem && this.isInterstitial(i2)) {
          const e4 = i2.event.assetList[0];
          e4 && (this.endedItem = this.playingItem, this.playingItem = null, this.setScheduleToAssetAtTime(t3, e4));
        }
        return;
      }
      const a2 = n2.timelineStart, o2 = n2.duration || 0;
      var l2;
      (s2 && t3 < a2 || t3 >= a2 + o2) && (null != (l2 = i2.event) && l2.appendInPlace && (this.clearAssetPlayers(i2.event, i2), this.flushFrontBuffer(t3)), this.setScheduleToAssetAtTime(t3, n2));
    }, this.onTimeupdate = () => {
      const t3 = this.currentTime;
      if (void 0 === t3 || this.playbackDisabled) return;
      if (-1 !== this.timelinePos || this.effectivePlayingItem || this.checkStart(), !(t3 > this.timelinePos)) return;
      this.timelinePos = t3, t3 > this.bufferedPos && this.checkBuffer();
      const e3 = this.playingItem;
      if (!e3 || this.playingLastItem) return;
      if (t3 >= e3.end) {
        this.timelinePos = e3.end;
        const t4 = this.findItemIndex(e3);
        this.setSchedulePosition(t4 + 1);
      }
      const s2 = this.playingAsset;
      s2 && t3 >= s2.timelineStart + (s2.duration || 0) && this.setScheduleToAssetAtTime(t3, s2);
    }, this.onScheduleUpdate = (t3, e3) => {
      const s2 = this.schedule;
      if (!s2) return;
      const i2 = this.playingItem, r2 = s2.events || [], n2 = s2.items || [], a2 = s2.durations, o2 = t3.map((t4) => t4.identifier), l2 = !(!r2.length && !o2.length);
      (l2 || e3) && this.log(`INTERSTITIALS_UPDATED (${r2.length}): ${r2}
Schedule: ${n2.map((t4) => fn(t4))} pos: ${this.timelinePos}`), o2.length && this.log(`Removed events ${o2}`);
      let d2 = null, c2 = null;
      i2 && (d2 = this.updateItem(i2, this.timelinePos), this.itemsMatch(i2, d2) ? this.playingItem = d2 : this.waitingItem = this.endedItem = null), this.waitingItem = this.updateItem(this.waitingItem), this.endedItem = this.updateItem(this.endedItem);
      const u2 = this.bufferingItem;
      if (u2 && (c2 = this.updateItem(u2, this.bufferedPos), this.itemsMatch(u2, c2) ? this.bufferingItem = c2 : u2.event && (this.bufferingItem = this.playingItem, this.clearInterstitial(u2.event, null))), t3.forEach((t4) => {
        t4.assetList.forEach((t5) => {
          this.clearAssetPlayer(t5.identifier, null);
        });
      }), this.playerQueue.forEach((t4) => {
        if (t4.interstitial.appendInPlace) {
          const e4 = t4.assetItem.timelineStart, s3 = t4.timelineOffset - e4;
          if (s3) try {
            t4.timelineOffset = e4;
          } catch (i3) {
            Math.abs(s3) > an && this.warn(`${i3} ("${t4.assetId}" ${t4.timelineOffset}->${e4})`);
          }
        }
      }), l2 || e3) {
        if (this.hls.trigger(h.INTERSTITIALS_UPDATED, { events: r2.slice(0), schedule: n2.slice(0), durations: a2, removedIds: o2 }), this.isInterstitial(i2) && o2.includes(i2.event.identifier)) return this.warn(`Interstitial "${i2.event.identifier}" removed while playing`), void this.primaryFallback(i2.event);
        i2 && this.trimInPlace(d2, i2), u2 && c2 !== d2 && this.trimInPlace(c2, u2), this.checkBuffer();
      }
    }, this.hls = t2, this.HlsPlayerClass = e2, this.assetListLoader = new AssetListLoader(t2), this.schedule = new InterstitialsSchedule(this.onScheduleUpdate, t2.logger), this.registerListeners();
  }
  registerListeners() {
    const t2 = this.hls;
    t2 && (t2.on(h.MEDIA_ATTACHING, this.onMediaAttaching, this), t2.on(h.MEDIA_ATTACHED, this.onMediaAttached, this), t2.on(h.MEDIA_DETACHING, this.onMediaDetaching, this), t2.on(h.MANIFEST_LOADING, this.onManifestLoading, this), t2.on(h.LEVEL_UPDATED, this.onLevelUpdated, this), t2.on(h.AUDIO_TRACK_SWITCHING, this.onAudioTrackSwitching, this), t2.on(h.AUDIO_TRACK_UPDATED, this.onAudioTrackUpdated, this), t2.on(h.SUBTITLE_TRACK_SWITCH, this.onSubtitleTrackSwitch, this), t2.on(h.SUBTITLE_TRACK_UPDATED, this.onSubtitleTrackUpdated, this), t2.on(h.EVENT_CUE_ENTER, this.onInterstitialCueEnter, this), t2.on(h.ASSET_LIST_LOADED, this.onAssetListLoaded, this), t2.on(h.BUFFER_APPENDED, this.onBufferAppended, this), t2.on(h.BUFFER_FLUSHED, this.onBufferFlushed, this), t2.on(h.BUFFERED_TO_END, this.onBufferedToEnd, this), t2.on(h.MEDIA_ENDED, this.onMediaEnded, this), t2.on(h.ERROR, this.onError, this), t2.on(h.DESTROYING, this.onDestroying, this));
  }
  unregisterListeners() {
    const t2 = this.hls;
    t2 && (t2.off(h.MEDIA_ATTACHING, this.onMediaAttaching, this), t2.off(h.MEDIA_ATTACHED, this.onMediaAttached, this), t2.off(h.MEDIA_DETACHING, this.onMediaDetaching, this), t2.off(h.MANIFEST_LOADING, this.onManifestLoading, this), t2.off(h.LEVEL_UPDATED, this.onLevelUpdated, this), t2.off(h.AUDIO_TRACK_SWITCHING, this.onAudioTrackSwitching, this), t2.off(h.AUDIO_TRACK_UPDATED, this.onAudioTrackUpdated, this), t2.off(h.SUBTITLE_TRACK_SWITCH, this.onSubtitleTrackSwitch, this), t2.off(h.SUBTITLE_TRACK_UPDATED, this.onSubtitleTrackUpdated, this), t2.off(h.EVENT_CUE_ENTER, this.onInterstitialCueEnter, this), t2.off(h.ASSET_LIST_LOADED, this.onAssetListLoaded, this), t2.off(h.BUFFER_CODECS, this.onBufferCodecs, this), t2.off(h.BUFFER_APPENDED, this.onBufferAppended, this), t2.off(h.BUFFER_FLUSHED, this.onBufferFlushed, this), t2.off(h.BUFFERED_TO_END, this.onBufferedToEnd, this), t2.off(h.MEDIA_ENDED, this.onMediaEnded, this), t2.off(h.ERROR, this.onError, this), t2.off(h.DESTROYING, this.onDestroying, this));
  }
  startLoad() {
    this.resumeBuffering();
  }
  stopLoad() {
    this.pauseBuffering();
  }
  resumeBuffering() {
    var t2;
    null == (t2 = this.getBufferingPlayer()) || t2.resumeBuffering();
  }
  pauseBuffering() {
    var t2;
    null == (t2 = this.getBufferingPlayer()) || t2.pauseBuffering();
  }
  destroy() {
    this.unregisterListeners(), this.stopLoad(), this.assetListLoader && this.assetListLoader.destroy(), this.emptyPlayerQueue(), this.clearScheduleState(), this.schedule && this.schedule.destroy(), this.media = this.detachedData = this.mediaSelection = this.requiredTracks = this.altSelection = this.schedule = this.manager = null, this.hls = this.HlsPlayerClass = this.log = null, this.assetListLoader = null, this.onPlay = this.onPause = this.onSeeking = this.onTimeupdate = null, this.onScheduleUpdate = null;
  }
  onDestroying() {
    const t2 = this.primaryMedia || this.media;
    t2 && this.removeMediaListeners(t2);
  }
  removeMediaListeners(t2) {
    _s(t2, "play", this.onPlay), _s(t2, "pause", this.onPause), _s(t2, "seeking", this.onSeeking), _s(t2, "timeupdate", this.onTimeupdate);
  }
  onMediaAttaching(t2, e2) {
    const s2 = this.media = e2.media;
    Ds(s2, "seeking", this.onSeeking), Ds(s2, "timeupdate", this.onTimeupdate), Ds(s2, "play", this.onPlay), Ds(s2, "pause", this.onPause);
  }
  onMediaAttached(t2, e2) {
    const s2 = this.effectivePlayingItem, i2 = this.detachedData;
    if (this.detachedData = null, null === s2) this.checkStart();
    else if (!i2) {
      this.clearScheduleState();
      const t3 = this.findItemIndex(s2);
      this.setSchedulePosition(t3);
    }
  }
  clearScheduleState() {
    this.log("clear schedule state"), this.playingItem = this.bufferingItem = this.waitingItem = this.endedItem = this.playingAsset = this.endedAsset = this.bufferingAsset = null;
  }
  onMediaDetaching(t2, e2) {
    const s2 = !!e2.transferMedia, i2 = this.media;
    if (this.media = null, !s2 && (i2 && this.removeMediaListeners(i2), this.detachedData)) {
      const t3 = this.getBufferingPlayer();
      t3 && (this.log(`Removing schedule state for detachedData and ${t3}`), this.playingAsset = this.endedAsset = this.bufferingAsset = this.bufferingItem = this.waitingItem = this.detachedData = null, t3.detachMedia()), this.shouldPlay = false;
    }
  }
  get interstitialsManager() {
    if (!this.hls) return null;
    if (this.manager) return this.manager;
    const t2 = this, e2 = () => t2.bufferingItem || t2.waitingItem, s2 = (e3) => e3 ? t2.getAssetPlayer(e3.identifier) : e3, i2 = (e3, i3, n3, a3, o3) => {
      if (e3) {
        let l3 = e3[i3].start;
        const h2 = e3.event;
        if (h2) {
          if ("playout" === i3 || h2.timelineOccupancy !== on.Point) {
            const t3 = s2(n3);
            (null == t3 ? void 0 : t3.interstitial) === h2 && (l3 += t3.assetItem.startOffset + t3[o3]);
          }
        } else l3 += ("bufferedPos" === a3 ? r2() : t2[a3]) - e3.start;
        return l3;
      }
      return 0;
    }, r2 = () => {
      const e3 = t2.bufferedPos;
      return e3 === Number.MAX_VALUE ? n2("primary") : Math.max(e3, 0);
    }, n2 = (e3) => {
      var s3, i3;
      return null != (s3 = t2.primaryDetails) && s3.live ? t2.primaryDetails.edge : (null == (i3 = t2.schedule) ? void 0 : i3.durations[e3]) || 0;
    }, a2 = (e3, r3) => {
      var n3, a3;
      const o3 = t2.effectivePlayingItem;
      if (null != o3 && null != (n3 = o3.event) && n3.restrictions.skip || !t2.schedule) return;
      t2.log(`seek to ${e3} "${r3}"`);
      const l3 = t2.effectivePlayingItem, h2 = t2.schedule.findItemIndexAtTime(e3, r3), d2 = null == (a3 = t2.schedule.items) ? void 0 : a3[h2], c2 = t2.getBufferingPlayer(), u2 = null == c2 ? void 0 : c2.interstitial, f2 = null == u2 ? void 0 : u2.appendInPlace, g2 = l3 && t2.itemsMatch(l3, d2);
      if (l3 && (f2 || g2)) {
        const n4 = s2(t2.playingAsset), a4 = (null == n4 ? void 0 : n4.media) || t2.primaryMedia;
        if (a4) {
          const s3 = "primary" === r3 ? a4.currentTime : i2(l3, r3, t2.playingAsset, "timelinePos", "currentTime"), o4 = e3 - s3, h3 = (f2 ? s3 : a4.currentTime) + o4;
          if (h3 >= 0 && (!n4 || f2 || h3 <= n4.duration)) return void (a4.currentTime = h3);
        }
      }
      if (d2) {
        let s3 = e3;
        if ("primary" !== r3) {
          const t3 = e3 - d2[r3].start;
          s3 = d2.start + t3;
        }
        const i3 = !t2.isInterstitial(d2);
        if (t2.isInterstitial(l3) && !l3.event.appendInPlace || !i3 && !d2.event.appendInPlace) {
          if (l3) {
            const n4 = t2.findItemIndex(l3);
            if (h2 > n4) {
              const e4 = t2.schedule.findJumpRestrictedIndex(n4 + 1, h2);
              if (e4 > n4) return void t2.setSchedulePosition(e4);
            }
            let a4 = 0;
            if (i3) t2.timelinePos = s3, t2.checkBuffer();
            else {
              const t3 = d2.event.assetList, s4 = e3 - (d2[r3] || d2).start;
              for (let e4 = t3.length; e4--; ) {
                const i4 = t3[e4];
                if (i4.duration && s4 >= i4.startOffset && s4 < i4.startOffset + i4.duration) {
                  a4 = e4;
                  break;
                }
              }
            }
            t2.setSchedulePosition(h2, a4);
          }
        } else {
          const e4 = t2.media || (f2 ? null == c2 ? void 0 : c2.media : null);
          e4 && (e4.currentTime = s3);
        }
      }
    }, o2 = () => {
      const s3 = t2.effectivePlayingItem;
      if (t2.isInterstitial(s3)) return s3;
      const i3 = e2();
      return t2.isInterstitial(i3) ? i3 : null;
    }, l2 = { get bufferedEnd() {
      const s3 = e2(), r3 = t2.bufferingItem;
      var n3;
      return r3 && r3 === s3 && (i2(r3, "playout", t2.bufferingAsset, "bufferedPos", "bufferedEnd") - r3.playout.start || (null == (n3 = t2.bufferingAsset) ? void 0 : n3.startOffset)) || 0;
    }, get currentTime() {
      const e3 = o2(), s3 = t2.effectivePlayingItem;
      return s3 && s3 === e3 ? i2(s3, "playout", t2.effectivePlayingAsset, "timelinePos", "currentTime") - s3.playout.start : 0;
    }, set currentTime(e3) {
      const s3 = o2(), i3 = t2.effectivePlayingItem;
      i3 && i3 === s3 && a2(e3 + i3.playout.start, "playout");
    }, get duration() {
      const t3 = o2();
      return t3 ? t3.playout.end - t3.playout.start : 0;
    }, get assetPlayers() {
      var e3;
      const s3 = null == (e3 = o2()) ? void 0 : e3.event.assetList;
      return s3 ? s3.map((e4) => t2.getAssetPlayer(e4.identifier)) : [];
    }, get playingIndex() {
      var e3;
      const s3 = null == (e3 = o2()) ? void 0 : e3.event;
      return s3 && t2.effectivePlayingAsset ? s3.findAssetIndex(t2.effectivePlayingAsset) : -1;
    }, get scheduleItem() {
      return o2();
    } };
    return this.manager = { get events() {
      var e3;
      return (null == (e3 = t2.schedule) || null == (e3 = e3.events) ? void 0 : e3.slice(0)) || [];
    }, get schedule() {
      var e3;
      return (null == (e3 = t2.schedule) || null == (e3 = e3.items) ? void 0 : e3.slice(0)) || [];
    }, get interstitialPlayer() {
      return o2() ? l2 : null;
    }, get playerQueue() {
      return t2.playerQueue.slice(0);
    }, get bufferingAsset() {
      return t2.bufferingAsset;
    }, get bufferingItem() {
      return e2();
    }, get bufferingIndex() {
      const s3 = e2();
      return t2.findItemIndex(s3);
    }, get playingAsset() {
      return t2.effectivePlayingAsset;
    }, get playingItem() {
      return t2.effectivePlayingItem;
    }, get playingIndex() {
      const e3 = t2.effectivePlayingItem;
      return t2.findItemIndex(e3);
    }, primary: { get bufferedEnd() {
      return r2();
    }, get currentTime() {
      const e3 = t2.timelinePos;
      return e3 > 0 ? e3 : 0;
    }, set currentTime(t3) {
      a2(t3, "primary");
    }, get duration() {
      return n2("primary");
    }, get seekableStart() {
      var e3;
      return (null == (e3 = t2.primaryDetails) ? void 0 : e3.fragmentStart) || 0;
    } }, integrated: { get bufferedEnd() {
      return i2(e2(), "integrated", t2.bufferingAsset, "bufferedPos", "bufferedEnd");
    }, get currentTime() {
      return i2(t2.effectivePlayingItem, "integrated", t2.effectivePlayingAsset, "timelinePos", "currentTime");
    }, set currentTime(t3) {
      a2(t3, "integrated");
    }, get duration() {
      return n2("integrated");
    }, get seekableStart() {
      var e3;
      return ((e4) => {
        var s3;
        if (0 !== e4 && null != (s3 = t2.schedule) && s3.length) {
          var i3;
          const s4 = t2.schedule.findItemIndexAtTime(e4), r3 = null == (i3 = t2.schedule.items) ? void 0 : i3[s4];
          if (r3) return e4 + (r3.integrated.start - r3.start);
        }
        return e4;
      })((null == (e3 = t2.primaryDetails) ? void 0 : e3.fragmentStart) || 0);
    } }, skip: () => {
      const e3 = t2.effectivePlayingItem, s3 = null == e3 ? void 0 : e3.event;
      if (s3 && !s3.restrictions.skip) {
        const i3 = t2.findItemIndex(e3);
        if (s3.appendInPlace) {
          const t3 = e3.playout.start + e3.event.duration;
          a2(t3 + 1e-3, "playout");
        } else t2.advanceAfterAssetEnded(s3, i3, 1 / 0);
      }
    } };
  }
  get effectivePlayingItem() {
    return this.waitingItem || this.playingItem || this.endedItem;
  }
  get effectivePlayingAsset() {
    return this.playingAsset || this.endedAsset;
  }
  get playingLastItem() {
    var t2;
    const e2 = this.playingItem, s2 = null == (t2 = this.schedule) ? void 0 : t2.items;
    return !!(this.playbackStarted && e2 && s2) && this.findItemIndex(e2) === s2.length - 1;
  }
  get playbackStarted() {
    return null !== this.effectivePlayingItem;
  }
  get currentTime() {
    var t2, e2;
    if (null === this.mediaSelection) return;
    const s2 = this.waitingItem || this.playingItem;
    if (this.isInterstitial(s2) && !s2.event.appendInPlace) return;
    let i2 = this.media;
    !i2 && null != (t2 = this.bufferingItem) && null != (t2 = t2.event) && t2.appendInPlace && (i2 = this.primaryMedia);
    const n2 = null == (e2 = i2) ? void 0 : e2.currentTime;
    return void 0 !== n2 && r(n2) ? n2 : void 0;
  }
  get primaryMedia() {
    var t2;
    return this.media || (null == (t2 = this.detachedData) ? void 0 : t2.media) || null;
  }
  isInterstitial(t2) {
    return !(null == t2 || !t2.event);
  }
  retreiveMediaSource(t2, e2) {
    const s2 = this.getAssetPlayer(t2);
    s2 && this.transferMediaFromPlayer(s2, e2);
  }
  transferMediaFromPlayer(t2, e2) {
    const s2 = t2.interstitial.appendInPlace, i2 = t2.media;
    if (s2 && i2 === this.primaryMedia) {
      if (this.bufferingAsset = null, (!e2 || this.isInterstitial(e2) && !e2.event.appendInPlace) && e2 && i2) return void (this.detachedData = { media: i2 });
      const s3 = t2.transferMedia();
      this.log(`transfer MediaSource from ${t2} ${$t(s3)}`), this.detachedData = s3;
    } else e2 && i2 && (this.shouldPlay || (this.shouldPlay = !i2.paused));
  }
  transferMediaTo(t2, e2) {
    var s2, i2;
    if (t2.media === e2) return;
    let r2 = null;
    const n2 = this.hls, a2 = t2 !== n2, o2 = a2 && t2.interstitial.appendInPlace, l2 = null == (s2 = this.detachedData) ? void 0 : s2.mediaSource;
    let h2;
    if (n2.media) o2 && (r2 = n2.transferMedia(), this.detachedData = r2), h2 = "Primary";
    else if (l2) {
      const t3 = this.getBufferingPlayer();
      t3 ? (r2 = t3.transferMedia(), h2 = `${t3}`) : h2 = "detached MediaSource";
    } else h2 = "detached media";
    if (!r2) {
      if (l2) r2 = this.detachedData, this.log(`using detachedData: MediaSource ${$t(r2)}`);
      else if (!this.detachedData || n2.media === e2) {
        const t3 = this.playerQueue;
        t3.length > 1 && t3.forEach((t4) => {
          if (a2 && t4.interstitial.appendInPlace !== o2) {
            const e3 = t4.interstitial;
            this.clearInterstitial(t4.interstitial, null), e3.appendInPlace = false, e3.appendInPlace && this.warn(`Could not change append strategy for queued assets ${e3}`);
          }
        }), this.hls.detachMedia(), this.detachedData = { media: e2 };
      }
    }
    const d2 = r2 && "mediaSource" in r2 && "closed" !== (null == (i2 = r2.mediaSource) ? void 0 : i2.readyState), c2 = d2 && r2 ? r2 : e2;
    this.log(`${d2 ? "transfering MediaSource" : "attaching media"} to ${a2 ? t2 : "Primary"} from ${h2} (media.currentTime: ${e2.currentTime})`);
    const u2 = this.schedule;
    if (c2 === r2 && u2) {
      const e3 = a2 && t2.assetId === u2.assetIdAtEnd;
      c2.overrides = { duration: u2.duration, endOfStream: !a2 || e3, cueRemoval: !a2 };
    }
    t2.attachMedia(c2);
  }
  onInterstitialCueEnter() {
    this.onTimeupdate();
  }
  checkStart() {
    const t2 = this.schedule, e2 = null == t2 ? void 0 : t2.events;
    if (!e2 || this.playbackDisabled || !this.media) return;
    -1 === this.bufferedPos && (this.bufferedPos = 0);
    const s2 = this.timelinePos, i2 = this.effectivePlayingItem;
    if (-1 === s2) {
      const s3 = this.hls.startPosition;
      if (this.timelinePos = s3, 0 === e2.length) this.setSchedulePosition(0);
      else if (e2[0].cue.pre) {
        this.log(mn("checkStart (preroll)", s3));
        const i3 = t2.findEventIndex(e2[0].identifier);
        this.setSchedulePosition(i3);
      } else if (s3 >= 0 || !this.primaryLive) {
        this.log(mn("checkStart", s3));
        const e3 = this.timelinePos = s3 > 0 ? s3 : 0, i3 = t2.findItemIndexAtTime(e3);
        this.setSchedulePosition(i3);
      } else 0 === this.hls.liveSyncPosition ? this.setSchedulePosition(0) : this.log("[checkStart] waiting for live start");
    } else if (i2 && !this.playingItem) {
      this.log(mn("checkStart (playing item)", i2.start));
      const e3 = t2.findItemIndex(i2);
      this.setSchedulePosition(e3);
    }
  }
  advanceAssetBuffering(t2, e2) {
    const s2 = t2.event, i2 = s2.findAssetIndex(e2), r2 = cn(s2, i2);
    if (s2.isAssetPastPlayoutLimit(r2)) {
      if (this.schedule) {
        var n2;
        const e3 = null == (n2 = this.schedule.items) ? void 0 : n2[this.findItemIndex(t2) + 1];
        e3 && this.bufferedToItem(e3);
      }
    } else this.bufferedToEvent(t2, r2);
  }
  advanceAfterAssetEnded(t2, e2, s2) {
    const i2 = cn(t2, s2);
    if (t2.isAssetPastPlayoutLimit(i2)) {
      if (this.schedule) {
        const s3 = this.schedule.items;
        if (s3) {
          const i3 = e2 + 1;
          if (i3 >= s3.length) return void this.setSchedulePosition(-1);
          const r2 = t2.resumeTime;
          this.timelinePos < r2 && (this.log(mn("advanceAfterAssetEnded", r2)), this.timelinePos = r2, t2.appendInPlace && this.advanceInPlace(r2), this.checkBuffer(this.bufferedPos < r2)), this.setSchedulePosition(i3);
        }
      }
    } else {
      if (t2.appendInPlace) {
        const e3 = t2.assetList[i2];
        e3 && this.advanceInPlace(e3.timelineStart);
      }
      this.setSchedulePosition(e2, i2);
    }
  }
  setScheduleToAssetAtTime(t2, e2) {
    const s2 = this.schedule;
    if (!s2) return;
    const i2 = e2.parentIdentifier, r2 = s2.getEvent(i2);
    if (r2) {
      const e3 = s2.findEventIndex(i2), n2 = s2.findAssetIndex(r2, t2);
      this.advanceAfterAssetEnded(r2, e3, n2 - 1);
    }
  }
  setSchedulePosition(t2, e2) {
    var s2;
    const i2 = null == (s2 = this.schedule) ? void 0 : s2.items;
    if (!i2 || this.playbackDisabled) return;
    const r2 = t2 >= 0 ? i2[t2] : null;
    this.log(`setSchedulePosition ${t2}, ${e2} (${r2 ? fn(r2) : r2}) pos: ${this.timelinePos}`);
    const n2 = this.waitingItem || this.playingItem, a2 = this.playingLastItem;
    if (this.isInterstitial(n2)) {
      const s3 = n2.event, d2 = this.playingAsset, c2 = null == d2 ? void 0 : d2.identifier, u2 = c2 ? this.getAssetPlayer(c2) : null;
      if (u2 && c2 && (!this.eventItemsMatch(n2, r2) || void 0 !== e2 && c2 !== s3.assetList[e2].identifier)) {
        var o2;
        const e3 = s3.findAssetIndex(d2);
        if (this.log(`INTERSTITIAL_ASSET_ENDED ${e3 + 1}/${s3.assetList.length} ${un(d2)}`), this.endedAsset = d2, this.playingAsset = null, this.hls.trigger(h.INTERSTITIAL_ASSET_ENDED, { asset: d2, assetListIndex: e3, event: s3, schedule: i2.slice(0), scheduleIndex: t2, player: u2 }), n2 !== this.playingItem) return void (this.itemsMatch(n2, this.playingItem) && !this.playingAsset && this.advanceAfterAssetEnded(s3, this.findItemIndex(this.playingItem), e3));
        this.retreiveMediaSource(c2, r2), !u2.media || null != (o2 = this.detachedData) && o2.mediaSource || u2.detachMedia();
      }
      if (!this.eventItemsMatch(n2, r2) && (this.endedItem = n2, this.playingItem = null, this.log(`INTERSTITIAL_ENDED ${s3} ${fn(n2)}`), s3.hasPlayed = true, this.hls.trigger(h.INTERSTITIAL_ENDED, { event: s3, schedule: i2.slice(0), scheduleIndex: t2 }), s3.cue.once)) {
        var l2;
        this.updateSchedule();
        const t3 = null == (l2 = this.schedule) ? void 0 : l2.items;
        if (r2 && t3) {
          const s4 = this.findItemIndex(r2);
          this.advanceSchedule(s4, t3, e2, n2, a2);
        }
        return;
      }
    }
    this.advanceSchedule(t2, i2, e2, n2, a2);
  }
  advanceSchedule(t2, e2, s2, i2, r2) {
    const n2 = this.schedule;
    if (!n2) return;
    const a2 = e2[t2] || null, o2 = this.primaryMedia, l2 = this.playerQueue;
    if (l2.length && l2.forEach((e3) => {
      const s3 = e3.interstitial, i3 = n2.findEventIndex(s3.identifier);
      (i3 < t2 || i3 > t2 + 1) && this.clearInterstitial(s3, a2);
    }), this.isInterstitial(a2)) {
      this.timelinePos = Math.min(Math.max(this.timelinePos, a2.start), a2.end);
      const r3 = a2.event;
      if (void 0 === s2) {
        const e3 = cn(r3, (s2 = n2.findAssetIndex(r3, this.timelinePos)) - 1);
        if (r3.isAssetPastPlayoutLimit(e3) || r3.appendInPlace && this.timelinePos === a2.end) return void this.advanceAfterAssetEnded(r3, t2, s2);
        s2 = e3;
      }
      const l3 = this.waitingItem;
      this.assetsBuffered(a2, o2) || this.setBufferingItem(a2);
      let d2 = this.preloadAssets(r3, s2);
      if (this.eventItemsMatch(a2, l3 || i2) || (this.waitingItem = a2, this.log(`INTERSTITIAL_STARTED ${fn(a2)} ${r3.appendInPlace ? "append in place" : ""}`), this.hls.trigger(h.INTERSTITIAL_STARTED, { event: r3, schedule: e2.slice(0), scheduleIndex: t2 })), !r3.assetListLoaded) return void this.log(`Waiting for ASSET-LIST to complete loading ${r3}`);
      if (r3.assetListLoader && (r3.assetListLoader.destroy(), r3.assetListLoader = void 0), !o2) return void this.log(`Waiting for attachMedia to start Interstitial ${r3}`);
      this.waitingItem = this.endedItem = null, this.playingItem = a2;
      const c2 = r3.assetList[s2];
      if (!c2) return void this.advanceAfterAssetEnded(r3, t2, s2 || 0);
      if (d2 || (d2 = this.getAssetPlayer(c2.identifier)), null === d2 || d2.destroyed) {
        const t3 = r3.assetList.length;
        this.warn(`asset ${s2 + 1}/${t3} player destroyed ${r3}`), d2 = this.createAssetPlayer(r3, c2, s2), d2.loadSource();
      }
      if (!this.eventItemsMatch(a2, this.bufferingItem) && r3.appendInPlace && this.isAssetBuffered(c2)) return;
      this.startAssetPlayer(d2, s2, e2, t2, o2), this.shouldPlay && gn(d2.media);
    } else a2 ? (this.resumePrimary(a2, t2, i2), this.shouldPlay && gn(this.hls.media)) : r2 && this.isInterstitial(i2) && (this.endedItem = null, this.playingItem = i2, i2.event.appendInPlace || this.attachPrimary(n2.durations.primary, null));
  }
  get playbackDisabled() {
    return false === this.hls.config.enableInterstitialPlayback;
  }
  get primaryDetails() {
    var t2;
    return null == (t2 = this.mediaSelection) ? void 0 : t2.main.details;
  }
  get primaryLive() {
    var t2;
    return !(null == (t2 = this.primaryDetails) || !t2.live);
  }
  resumePrimary(t2, e2, s2) {
    var i2, r2;
    if (this.playingItem = t2, this.playingAsset = this.endedAsset = null, this.waitingItem = this.endedItem = null, this.bufferedToItem(t2), this.log(`resuming ${fn(t2)}`), null == (i2 = this.detachedData) || !i2.mediaSource) {
      let s3 = this.timelinePos;
      (s3 < t2.start || s3 >= t2.end) && (s3 = this.getPrimaryResumption(t2, e2), this.log(mn("resumePrimary", s3)), this.timelinePos = s3), this.attachPrimary(s3, t2);
    }
    if (!s2) return;
    const n2 = null == (r2 = this.schedule) ? void 0 : r2.items;
    n2 && (this.log(`INTERSTITIALS_PRIMARY_RESUMED ${fn(t2)}`), this.hls.trigger(h.INTERSTITIALS_PRIMARY_RESUMED, { schedule: n2.slice(0), scheduleIndex: e2 }), this.checkBuffer());
  }
  getPrimaryResumption(t2, e2) {
    const s2 = t2.start;
    if (this.primaryLive) {
      const t3 = this.primaryDetails;
      if (0 === e2) return this.hls.startPosition;
      if (t3 && (s2 < t3.fragmentStart || s2 > t3.edge)) return this.hls.liveSyncPosition || -1;
    }
    return s2;
  }
  isAssetBuffered(t2) {
    const e2 = this.getAssetPlayer(t2.identifier);
    return null != e2 && e2.hls ? e2.hls.bufferedToEnd : BufferHelper.bufferInfo(this.primaryMedia, this.timelinePos, 0).end + 1 >= t2.timelineStart + (t2.duration || 0);
  }
  attachPrimary(t2, e2, s2) {
    e2 ? this.setBufferingItem(e2) : this.bufferingItem = this.playingItem, this.bufferingAsset = null;
    const i2 = this.primaryMedia;
    if (!i2) return;
    const r2 = this.hls;
    r2.media ? this.checkBuffer() : (this.transferMediaTo(r2, i2), s2 && this.startLoadingPrimaryAt(t2, s2)), s2 || (this.log(mn("attachPrimary", t2)), this.timelinePos = t2, this.startLoadingPrimaryAt(t2, s2));
  }
  startLoadingPrimaryAt(t2, e2) {
    var s2;
    const i2 = this.hls;
    !i2.loadingEnabled || !i2.media || Math.abs(((null == (s2 = i2.mainForwardBufferInfo) ? void 0 : s2.start) || i2.media.currentTime) - t2) > 0.5 ? i2.startLoad(t2, e2) : i2.bufferingEnabled || i2.resumeBuffering();
  }
  onManifestLoading() {
    var t2;
    this.stopLoad(), null == (t2 = this.schedule) || t2.reset(), this.emptyPlayerQueue(), this.clearScheduleState(), this.shouldPlay = false, this.bufferedPos = this.timelinePos = -1, this.mediaSelection = this.altSelection = this.manager = this.requiredTracks = null, this.hls.off(h.BUFFER_CODECS, this.onBufferCodecs, this), this.hls.on(h.BUFFER_CODECS, this.onBufferCodecs, this);
  }
  onLevelUpdated(t2, e2) {
    if (-1 === e2.level || !this.schedule) return;
    const s2 = this.hls.levels[e2.level];
    if (!s2.details) return;
    const i2 = T(T({}, this.mediaSelection || this.altSelection), {}, { main: s2 });
    this.mediaSelection = i2, this.schedule.parseInterstitialDateRanges(i2, this.hls.config.interstitialAppendInPlace), !this.effectivePlayingItem && this.schedule.items && this.checkStart();
  }
  onAudioTrackUpdated(t2, e2) {
    const s2 = this.hls.audioTracks[e2.id], i2 = this.mediaSelection;
    if (!i2) return void (this.altSelection = T(T({}, this.altSelection), {}, { audio: s2 }));
    const r2 = T(T({}, i2), {}, { audio: s2 });
    this.mediaSelection = r2;
  }
  onSubtitleTrackUpdated(t2, e2) {
    const s2 = this.hls.subtitleTracks[e2.id], i2 = this.mediaSelection;
    if (!i2) return void (this.altSelection = T(T({}, this.altSelection), {}, { subtitles: s2 }));
    const r2 = T(T({}, i2), {}, { subtitles: s2 });
    this.mediaSelection = r2;
  }
  onAudioTrackSwitching(t2, e2) {
    const s2 = Kt(e2);
    this.playerQueue.forEach(({ hls: t3 }) => t3 && (t3.setAudioOption(e2) || t3.setAudioOption(s2)));
  }
  onSubtitleTrackSwitch(t2, e2) {
    const s2 = Kt(e2);
    this.playerQueue.forEach(({ hls: t3 }) => t3 && (t3.setSubtitleOption(e2) || -1 !== e2.id && t3.setSubtitleOption(s2)));
  }
  onBufferCodecs(t2, e2) {
    const s2 = e2.tracks;
    s2 && (this.requiredTracks = s2);
  }
  onBufferAppended(t2, e2) {
    this.checkBuffer();
  }
  onBufferFlushed(t2, e2) {
    const s2 = this.playingItem;
    if (s2 && !this.itemsMatch(s2, this.bufferingItem) && !this.isInterstitial(s2)) {
      const t3 = this.timelinePos;
      this.bufferedPos = t3, this.checkBuffer();
    }
  }
  onBufferedToEnd(t2) {
    if (!this.schedule) return;
    const e2 = this.schedule.events;
    if (this.bufferedPos < Number.MAX_VALUE && e2) {
      for (let t3 = 0; t3 < e2.length; t3++) {
        const i2 = e2[t3];
        if (i2.cue.post) {
          var s2;
          const t4 = this.schedule.findEventIndex(i2.identifier), e3 = null == (s2 = this.schedule.items) ? void 0 : s2[t4];
          this.isInterstitial(e3) && this.eventItemsMatch(e3, this.bufferingItem) && this.bufferedToItem(e3, 0);
          break;
        }
      }
      this.bufferedPos = Number.MAX_VALUE;
    }
  }
  onMediaEnded(t2) {
    const e2 = this.playingItem;
    if (!this.playingLastItem && e2) {
      const t3 = this.findItemIndex(e2);
      this.setSchedulePosition(t3 + 1);
    } else this.shouldPlay = false;
  }
  updateItem(t2, e2) {
    var s2;
    const i2 = null == (s2 = this.schedule) ? void 0 : s2.items;
    return t2 && i2 && i2[this.findItemIndex(t2, e2)] || null;
  }
  trimInPlace(t2, e2) {
    if (this.isInterstitial(t2) && t2.event.appendInPlace && e2.end - t2.end > 0.25) {
      t2.event.assetList.forEach((e3, s3) => {
        t2.event.isAssetPastPlayoutLimit(s3) && this.clearAssetPlayer(e3.identifier, null);
      });
      const s2 = t2.end + 0.25, i2 = BufferHelper.bufferInfo(this.primaryMedia, s2, 0);
      if (i2.end > s2 || (i2.nextStart || 0) > s2) {
        this.log(`trim buffered interstitial ${fn(t2)} (was ${fn(e2)})`);
        const i3 = true;
        this.attachPrimary(s2, null, i3), this.flushFrontBuffer(s2);
      }
    }
  }
  itemsMatch(t2, e2) {
    return !!e2 && (t2 === e2 || t2.event && e2.event && this.eventItemsMatch(t2, e2) || !t2.event && !e2.event && this.findItemIndex(t2) === this.findItemIndex(e2));
  }
  eventItemsMatch(t2, e2) {
    var s2;
    return !!e2 && (t2 === e2 || t2.event.identifier === (null == (s2 = e2.event) ? void 0 : s2.identifier));
  }
  findItemIndex(t2, e2) {
    return t2 && this.schedule ? this.schedule.findItemIndex(t2, e2) : -1;
  }
  updateSchedule(t2 = false) {
    var e2;
    const s2 = this.mediaSelection;
    s2 && (null == (e2 = this.schedule) || e2.updateSchedule(s2, [], t2));
  }
  checkBuffer(t2) {
    var e2;
    const s2 = null == (e2 = this.schedule) ? void 0 : e2.items;
    if (!s2) return;
    const i2 = BufferHelper.bufferInfo(this.primaryMedia, this.timelinePos, 0);
    t2 && (this.bufferedPos = this.timelinePos), t2 || (t2 = i2.len < 1), this.updateBufferedPos(i2.end, s2, t2);
  }
  updateBufferedPos(t2, e2, s2) {
    const i2 = this.schedule, r2 = this.bufferingItem;
    if (this.bufferedPos > t2 || !i2) return;
    if (1 === e2.length && this.itemsMatch(e2[0], r2)) return void (this.bufferedPos = t2);
    const n2 = this.playingItem, a2 = this.findItemIndex(n2);
    let o2 = i2.findItemIndexAtTime(t2);
    if (this.bufferedPos < t2) {
      var l2;
      const s3 = this.findItemIndex(r2), i3 = Math.min(s3 + 1, e2.length - 1), n3 = e2[i3];
      if ((-1 === o2 && r2 && t2 >= r2.end || null != (l2 = n3.event) && l2.appendInPlace && t2 + 0.01 >= n3.start) && (o2 = i3), this.isInterstitial(r2)) {
        const t3 = r2.event;
        if (i3 - a2 > 1 && false === t3.appendInPlace) return;
        if (0 === t3.assetList.length && t3.assetListLoader) return;
      }
      if (this.bufferedPos = t2, o2 > s3 && o2 > a2) this.bufferedToItem(n3);
      else {
        const e3 = this.primaryDetails;
        this.primaryLive && e3 && t2 > e3.edge - e3.targetduration && n3.start < e3.edge + this.hls.config.interstitialLiveLookAhead && this.isInterstitial(n3) && this.preloadAssets(n3.event, 0);
      }
    } else s2 && n2 && !this.itemsMatch(n2, r2) && (o2 === a2 ? this.bufferedToItem(n2) : o2 === a2 + 1 && this.bufferedToItem(e2[o2]));
  }
  assetsBuffered(t2, e2) {
    return 0 !== t2.event.assetList.length && !t2.event.assetList.some((t3) => {
      const s2 = this.getAssetPlayer(t3.identifier);
      return !(null != s2 && s2.bufferedInPlaceToEnd(e2));
    });
  }
  setBufferingItem(t2) {
    const e2 = this.bufferingItem, s2 = this.schedule;
    if (!this.itemsMatch(t2, e2) && s2) {
      const { items: i2, events: r2 } = s2;
      if (!i2 || !r2) return e2;
      const n2 = this.isInterstitial(t2), a2 = this.getBufferingPlayer();
      this.bufferingItem = t2, this.bufferedPos = Math.max(t2.start, Math.min(t2.end, this.timelinePos));
      const o2 = a2 ? a2.remaining : e2 ? e2.end - this.timelinePos : 0;
      if (this.log(`INTERSTITIALS_BUFFERED_TO_BOUNDARY ${fn(t2)}` + (e2 ? ` (${o2.toFixed(2)} remaining)` : "")), !this.playbackDisabled) if (n2) {
        const e3 = s2.findAssetIndex(t2.event, this.bufferedPos);
        t2.event.assetList.forEach((t3, s3) => {
          const i3 = this.getAssetPlayer(t3.identifier);
          i3 && (s3 === e3 && i3.loadSource(), i3.resumeBuffering());
        });
      } else this.hls.resumeBuffering(), this.playerQueue.forEach((t3) => t3.pauseBuffering());
      this.hls.trigger(h.INTERSTITIALS_BUFFERED_TO_BOUNDARY, { events: r2.slice(0), schedule: i2.slice(0), bufferingIndex: this.findItemIndex(t2), playingIndex: this.findItemIndex(this.playingItem) });
    } else this.bufferingItem !== t2 && (this.bufferingItem = t2);
    return e2;
  }
  bufferedToItem(t2, e2 = 0) {
    const s2 = this.setBufferingItem(t2);
    if (!this.playbackDisabled) {
      if (this.isInterstitial(t2)) this.bufferedToEvent(t2, e2);
      else if (null !== s2) {
        this.bufferingAsset = null;
        const e3 = this.detachedData;
        if (e3) if (e3.mediaSource) {
          const e4 = true;
          this.attachPrimary(t2.start, t2, e4);
        } else this.preloadPrimary(t2);
        else this.preloadPrimary(t2);
      }
    }
  }
  preloadPrimary(t2) {
    const e2 = this.findItemIndex(t2), s2 = this.getPrimaryResumption(t2, e2);
    this.startLoadingPrimaryAt(s2);
  }
  bufferedToEvent(t2, e2) {
    const s2 = t2.event, i2 = 0 === s2.assetList.length && !s2.assetListLoader, r2 = s2.cue.once;
    if (i2 || !r2) {
      const t3 = this.preloadAssets(s2, e2);
      if (null != t3 && t3.interstitial.appendInPlace) {
        const e3 = this.primaryMedia;
        e3 && this.bufferAssetPlayer(t3, e3);
      }
    }
  }
  preloadAssets(t2, e2) {
    const s2 = t2.assetUrl, i2 = t2.assetList.length, r2 = 0 === i2 && !t2.assetListLoader, n2 = t2.cue.once;
    if (r2) {
      const r3 = t2.timelineStart;
      if (t2.appendInPlace) {
        var a2;
        const e3 = this.playingItem;
        this.isInterstitial(e3) || (null == e3 || null == (a2 = e3.nextEvent) ? void 0 : a2.identifier) !== t2.identifier || this.flushFrontBuffer(r3 + 0.25);
      }
      let n3, o2 = 0;
      if (!this.playingItem && this.primaryLive && (o2 = this.hls.startPosition, -1 === o2 && (o2 = this.hls.liveSyncPosition || 0)), o2 && !t2.cue.pre && !t2.cue.post) {
        const t3 = o2 - r3;
        t3 > 0 && (n3 = Math.round(1e3 * t3) / 1e3);
      }
      if (this.log(`Load interstitial asset ${e2 + 1}/${s2 ? 1 : i2} ${t2}${n3 ? ` live-start: ${o2} start-offset: ${n3}` : ""}`), s2) return this.createAsset(t2, 0, 0, r3, t2.duration, s2);
      const l2 = this.assetListLoader.loadAssetList(t2, n3);
      l2 && (t2.assetListLoader = l2);
    } else if (!n2 && i2) {
      for (let s4 = e2; s4 < i2; s4++) {
        const e3 = t2.assetList[s4], i3 = this.getAssetPlayerQueueIndex(e3.identifier);
        -1 !== i3 && !this.playerQueue[i3].destroyed || e3.error || this.createAssetPlayer(t2, e3, s4);
      }
      const s3 = t2.assetList[e2];
      if (s3) {
        const t3 = this.getAssetPlayer(s3.identifier);
        return t3 && t3.loadSource(), t3;
      }
    }
    return null;
  }
  flushFrontBuffer(t2) {
    const e2 = this.requiredTracks;
    e2 && (this.log(`Removing front buffer starting at ${t2}`), Object.keys(e2).forEach((e3) => {
      this.hls.trigger(h.BUFFER_FLUSHING, { startOffset: t2, endOffset: 1 / 0, type: e3 });
    }));
  }
  getAssetPlayerQueueIndex(t2) {
    const e2 = this.playerQueue;
    for (let s2 = 0; s2 < e2.length; s2++) if (t2 === e2[s2].assetId) return s2;
    return -1;
  }
  getAssetPlayer(t2) {
    const e2 = this.getAssetPlayerQueueIndex(t2);
    return this.playerQueue[e2] || null;
  }
  getBufferingPlayer() {
    const { playerQueue: t2, primaryMedia: e2 } = this;
    if (e2) {
      for (let s2 = 0; s2 < t2.length; s2++) if (t2[s2].media === e2) return t2[s2];
    }
    return null;
  }
  createAsset(t2, e2, s2, i2, r2, n2) {
    const a2 = { parentIdentifier: t2.identifier, identifier: ln(t2, n2, e2), duration: r2, startOffset: s2, timelineStart: i2, uri: n2 };
    return this.createAssetPlayer(t2, a2, e2);
  }
  createAssetPlayer(t2, e2, s2) {
    const i2 = this.hls, r2 = i2.userConfig;
    let n2 = r2.videoPreference;
    const a2 = i2.loadLevelObj || i2.levels[i2.currentLevel];
    (n2 || a2) && (n2 = y({}, n2), a2.videoCodec && (n2.videoCodec = a2.videoCodec), a2.videoRange && (n2.allowedVideoRanges = [a2.videoRange]));
    const d2 = i2.audioTracks[i2.audioTrack], c2 = i2.subtitleTracks[i2.subtitleTrack];
    let u2 = 0;
    if (this.primaryLive || t2.appendInPlace) {
      const t3 = this.timelinePos - e2.timelineStart;
      if (t3 > 1) {
        const s3 = e2.duration;
        s3 && t3 < s3 && (u2 = t3);
      }
    }
    const f2 = e2.identifier, g2 = T(T({}, r2), {}, { maxMaxBufferLength: Math.min(180, i2.config.maxMaxBufferLength), autoStartLoad: true, startFragPrefetch: true, primarySessionId: i2.sessionId, assetPlayerId: f2, abrEwmaDefaultEstimate: i2.bandwidthEstimate, interstitialsController: void 0, startPosition: u2, liveDurationInfinity: false, testBandwidth: false, videoPreference: n2, audioPreference: d2 || r2.audioPreference, subtitlePreference: c2 || r2.subtitlePreference });
    t2.appendInPlace && (t2.appendInPlaceStarted = true, e2.timelineStart && (g2.timelineOffset = e2.timelineStart));
    const m2 = g2.cmcd;
    null != m2 && m2.sessionId && m2.contentId && (g2.cmcd = y({}, m2, { contentId: nn(e2.uri) })), this.getAssetPlayer(f2) && this.warn(`Duplicate date range identifier ${t2} and asset ${f2}`);
    const p2 = new HlsAssetPlayer(this.HlsPlayerClass, g2, t2, e2);
    this.playerQueue.push(p2), t2.assetList[s2] = e2;
    let v2 = true;
    const E2 = (i3) => {
      if (i3.live) {
        var r3;
        const e3 = new Error(`Interstitials MUST be VOD assets ${t2}`), i4 = { fatal: true, type: o.OTHER_ERROR, details: l.INTERSTITIAL_ASSET_ITEM_ERROR, error: e3 }, n4 = (null == (r3 = this.schedule) ? void 0 : r3.findEventIndex(t2.identifier)) || -1;
        return void this.handleAssetItemError(i4, t2, n4, s2, e3.message);
      }
      const n3 = i3.edge - i3.fragmentStart, a3 = e2.duration;
      (v2 || null === a3 || n3 > a3) && (v2 = false, this.log(`Interstitial asset "${f2}" duration change ${a3} > ${n3}`), e2.duration = n3, this.updateSchedule());
    };
    p2.on(h.LEVEL_UPDATED, (t3, { details: e3 }) => E2(e3)), p2.on(h.LEVEL_PTS_UPDATED, (t3, { details: e3 }) => E2(e3)), p2.on(h.EVENT_CUE_ENTER, () => this.onInterstitialCueEnter());
    const S2 = (t3, e3) => {
      const s3 = this.getAssetPlayer(f2);
      if (s3 && e3.tracks) {
        s3.off(h.BUFFER_CODECS, S2), s3.tracks = e3.tracks;
        const t4 = this.primaryMedia;
        this.bufferingAsset === s3.assetItem && t4 && !s3.media && this.bufferAssetPlayer(s3, t4);
      }
    };
    p2.on(h.BUFFER_CODECS, S2), p2.on(h.BUFFERED_TO_END, () => {
      var s3;
      const i3 = this.getAssetPlayer(f2);
      if (this.log(`buffered to end of asset ${i3}`), !i3 || !this.schedule) return;
      const r3 = this.schedule.findEventIndex(t2.identifier), n3 = null == (s3 = this.schedule.items) ? void 0 : s3[r3];
      this.isInterstitial(n3) && this.advanceAssetBuffering(n3, e2);
    });
    const L2 = (e3) => () => {
      if (!this.getAssetPlayer(f2) || !this.schedule) return;
      this.shouldPlay = true;
      const s3 = this.schedule.findEventIndex(t2.identifier);
      this.advanceAfterAssetEnded(t2, s3, e3);
    };
    return p2.once(h.MEDIA_ENDED, L2(s2)), p2.once(h.PLAYOUT_LIMIT_REACHED, L2(1 / 0)), p2.on(h.ERROR, (e3, i3) => {
      if (!this.schedule) return;
      const r3 = this.getAssetPlayer(f2);
      if (i3.details === l.BUFFER_STALLED_ERROR) return null != r3 && r3.appendInPlace ? void this.handleInPlaceStall(t2) : (this.onTimeupdate(), void this.checkBuffer(true));
      this.handleAssetItemError(i3, t2, this.schedule.findEventIndex(t2.identifier), s2, `Asset player error ${i3.error} ${t2}`);
    }), p2.on(h.DESTROYING, () => {
      if (!this.getAssetPlayer(f2) || !this.schedule) return;
      const e3 = new Error(`Asset player destroyed unexpectedly ${f2}`), i3 = { fatal: true, type: o.OTHER_ERROR, details: l.INTERSTITIAL_ASSET_ITEM_ERROR, error: e3 };
      this.handleAssetItemError(i3, t2, this.schedule.findEventIndex(t2.identifier), s2, e3.message);
    }), this.log(`INTERSTITIAL_ASSET_PLAYER_CREATED ${un(e2)}`), this.hls.trigger(h.INTERSTITIAL_ASSET_PLAYER_CREATED, { asset: e2, assetListIndex: s2, event: t2, player: p2 }), p2;
  }
  clearInterstitial(t2, e2) {
    this.clearAssetPlayers(t2, e2), t2.reset();
  }
  clearAssetPlayers(t2, e2) {
    t2.assetList.forEach((t3) => {
      this.clearAssetPlayer(t3.identifier, e2);
    });
  }
  resetAssetPlayer(t2) {
    const e2 = this.getAssetPlayerQueueIndex(t2);
    if (-1 !== e2) {
      this.log(`reset asset player "${t2}" after error`);
      const s2 = this.playerQueue[e2];
      this.transferMediaFromPlayer(s2, null), s2.resetDetails();
    }
  }
  clearAssetPlayer(t2, e2) {
    const s2 = this.getAssetPlayerQueueIndex(t2);
    if (-1 !== s2) {
      const t3 = this.playerQueue[s2];
      this.log(`clear ${t3} toSegment: ${e2 ? fn(e2) : e2}`), this.transferMediaFromPlayer(t3, e2), this.playerQueue.splice(s2, 1), t3.destroy();
    }
  }
  emptyPlayerQueue() {
    let t2;
    for (; t2 = this.playerQueue.pop(); ) t2.destroy();
    this.playerQueue = [];
  }
  startAssetPlayer(t2, e2, s2, i2, r2) {
    const { interstitial: n2, assetItem: a2, assetId: o2 } = t2, l2 = n2.assetList.length, d2 = this.playingAsset;
    this.endedAsset = null, this.playingAsset = a2, d2 && d2.identifier === o2 || (d2 && (this.clearAssetPlayer(d2.identifier, s2[i2]), delete d2.error), this.log(`INTERSTITIAL_ASSET_STARTED ${e2 + 1}/${l2} ${un(a2)}`), this.hls.trigger(h.INTERSTITIAL_ASSET_STARTED, { asset: a2, assetListIndex: e2, event: n2, schedule: s2.slice(0), scheduleIndex: i2, player: t2 })), this.bufferAssetPlayer(t2, r2);
  }
  bufferAssetPlayer(t2, e2) {
    var s2, i2;
    if (!this.schedule) return;
    const { interstitial: r2, assetItem: n2 } = t2, a2 = this.schedule.findEventIndex(r2.identifier), h2 = null == (s2 = this.schedule.items) ? void 0 : s2[a2];
    if (!h2) return;
    t2.loadSource(), this.setBufferingItem(h2), this.bufferingAsset = n2;
    const d2 = this.getBufferingPlayer();
    if (d2 === t2) return;
    const c2 = r2.appendInPlace;
    if (c2 && false === (null == d2 ? void 0 : d2.interstitial.appendInPlace)) return;
    const u2 = (null == d2 ? void 0 : d2.tracks) || (null == (i2 = this.detachedData) ? void 0 : i2.tracks) || this.requiredTracks;
    if (c2 && n2 !== this.playingAsset) {
      if (!t2.tracks) return void this.log(`Waiting for track info before buffering ${t2}`);
      if (u2 && !P(u2, t2.tracks)) {
        const e3 = new Error(`Asset ${un(n2)} SourceBuffer tracks ('${Object.keys(t2.tracks)}') are not compatible with primary content tracks ('${Object.keys(u2)}')`), s3 = { fatal: true, type: o.OTHER_ERROR, details: l.INTERSTITIAL_ASSET_ITEM_ERROR, error: e3 }, i3 = r2.findAssetIndex(n2);
        return void this.handleAssetItemError(s3, r2, a2, i3, e3.message);
      }
    }
    this.transferMediaTo(t2, e2);
  }
  handleInPlaceStall(t2) {
    const e2 = this.schedule, s2 = this.primaryMedia;
    if (!e2 || !s2) return;
    const i2 = s2.currentTime, r2 = e2.findAssetIndex(t2, i2), n2 = t2.assetList[r2];
    if (n2) {
      const a2 = this.getAssetPlayer(n2.identifier);
      if (a2) {
        const o2 = a2.currentTime || i2 - n2.timelineStart, l2 = a2.duration - o2;
        if (this.warn(`Stalled at ${o2} of ${o2 + l2} in ${a2} ${t2} (media.currentTime: ${i2})`), o2 && (l2 / s2.playbackRate < 0.5 || a2.bufferedInPlaceToEnd(s2)) && a2.hls) {
          const s3 = e2.findEventIndex(t2.identifier);
          this.advanceAfterAssetEnded(t2, s3, r2);
        }
      }
    }
  }
  advanceInPlace(t2) {
    const e2 = this.primaryMedia;
    e2 && e2.currentTime < t2 && (e2.currentTime = t2);
  }
  handleAssetItemError(t2, e2, s2, i2, r2) {
    if (t2.details === l.BUFFER_STALLED_ERROR) return;
    const n2 = e2.assetList[i2] || null;
    if (this.warn(`INTERSTITIAL_ASSET_ERROR ${n2 ? un(n2) : n2} ${t2.error}`), !this.schedule) return;
    const a2 = (null == n2 ? void 0 : n2.identifier) || "", o2 = this.getAssetPlayerQueueIndex(a2), d2 = this.playerQueue[o2] || null, c2 = this.schedule.items, u2 = y({}, t2, { fatal: false, errorAction: oe(true), asset: n2, assetListIndex: i2, event: e2, schedule: c2, scheduleIndex: s2, player: d2 });
    if (this.hls.trigger(h.INTERSTITIAL_ASSET_ERROR, u2), !t2.fatal) return;
    const f2 = this.playingAsset, g2 = this.bufferingAsset, m2 = new Error(r2);
    if (n2 && (this.clearAssetPlayer(a2, null), n2.error = m2), e2.assetList.some((t3) => !t3.error)) for (let t3 = i2; t3 < e2.assetList.length; t3++) this.resetAssetPlayer(e2.assetList[t3].identifier);
    else e2.error = m2;
    this.updateSchedule(true), e2.error ? this.primaryFallback(e2) : f2 && f2.identifier === a2 ? this.advanceAfterAssetEnded(e2, s2, i2) : g2 && g2.identifier === a2 && this.isInterstitial(this.bufferingItem) && this.advanceAssetBuffering(this.bufferingItem, g2);
  }
  primaryFallback(t2) {
    const e2 = t2.timelineStart, s2 = this.effectivePlayingItem;
    let i2 = this.timelinePos;
    if (s2) {
      this.log(`Fallback to primary from event "${t2.identifier}" start: ${e2} pos: ${i2} playing: ${fn(s2)} error: ${t2.error}`), -1 === i2 && (i2 = this.hls.startPosition);
      const r3 = this.updateItem(s2, i2);
      this.itemsMatch(s2, r3) && this.clearInterstitial(t2, null), t2.appendInPlace && (this.attachPrimary(e2, null), this.flushFrontBuffer(e2));
    } else if (-1 === i2) return void this.checkStart();
    if (!this.schedule) return;
    const r2 = this.schedule.findItemIndexAtTime(i2);
    this.setSchedulePosition(r2);
  }
  onAssetListLoaded(t2, e2) {
    var s2, i2;
    const r2 = e2.event, n2 = r2.identifier, a2 = e2.assetListResponse.ASSETS;
    if (null == (s2 = this.schedule) || !s2.hasEvent(n2)) return;
    const o2 = r2.timelineStart, l2 = r2.duration;
    let h2 = 0;
    a2.forEach((t3, e3) => {
      const s3 = parseFloat(t3.DURATION);
      this.createAsset(r2, e3, h2, o2 + h2, s3, t3.URI), h2 += s3;
    }), r2.duration = h2, this.log(`Loaded asset-list with duration: ${h2} (was: ${l2}) ${r2}`);
    const d2 = this.waitingItem, c2 = (null == d2 ? void 0 : d2.event.identifier) === n2;
    this.updateSchedule();
    const u2 = null == (i2 = this.bufferingItem) ? void 0 : i2.event;
    if (c2) {
      var f2;
      const t3 = this.schedule.findEventIndex(n2), e3 = null == (f2 = this.schedule.items) ? void 0 : f2[t3];
      if (e3) {
        if (!this.playingItem && this.timelinePos > e3.end && this.schedule.findItemIndexAtTime(this.timelinePos) !== t3) return r2.error = new Error(`Interstitial ${a2.length ? "no longer within playback range" : "asset-list is empty"} ${this.timelinePos} ${r2}`), this.log(r2.error.message), this.updateSchedule(true), void this.primaryFallback(r2);
        this.setBufferingItem(e3);
      }
      this.setSchedulePosition(t3);
    } else if ((null == u2 ? void 0 : u2.identifier) === n2) {
      const t3 = r2.assetList[0];
      if (t3) {
        const e3 = this.getAssetPlayer(t3.identifier);
        if (u2.appendInPlace) {
          const t4 = this.primaryMedia;
          e3 && t4 && this.bufferAssetPlayer(e3, t4);
        } else e3 && e3.loadSource();
      }
    }
  }
  onError(t2, e2) {
    if (this.schedule) switch (e2.details) {
      case l.ASSET_LIST_PARSING_ERROR:
      case l.ASSET_LIST_LOAD_ERROR:
      case l.ASSET_LIST_LOAD_TIMEOUT: {
        const t3 = e2.interstitial;
        t3 && (this.updateSchedule(true), this.primaryFallback(t3));
        break;
      }
      case l.BUFFER_STALLED_ERROR: {
        const t3 = this.endedItem || this.waitingItem || this.playingItem;
        if (this.isInterstitial(t3) && t3.event.appendInPlace) return void this.handleInPlaceStall(t3.event);
        this.log(`Primary player stall @${this.timelinePos} bufferedPos: ${this.bufferedPos}`), this.onTimeupdate(), this.checkBuffer(true);
        break;
      }
    }
  }
} });
function ia(t2) {
  return t2 && "object" == typeof t2 ? Array.isArray(t2) ? t2.map(ia) : Object.keys(t2).reduce((e2, s2) => (e2[s2] = ia(t2[s2]), e2), {}) : t2;
}
class GapController extends TaskLoop {
  constructor(t2, e2) {
    super("gap-controller", t2.logger), this.hls = void 0, this.fragmentTracker = void 0, this.media = null, this.mediaSource = void 0, this.nudgeRetry = 0, this.stallReported = false, this.stalled = null, this.moved = false, this.seeking = false, this.buffered = {}, this.lastCurrentTime = 0, this.ended = 0, this.waiting = 0, this.onMediaPlaying = () => {
      this.ended = 0, this.waiting = 0;
    }, this.onMediaWaiting = () => {
      var t3;
      null != (t3 = this.media) && t3.seeking || (this.waiting = self.performance.now(), this.tick());
    }, this.onMediaEnded = () => {
      var t3;
      this.hls && (this.ended = (null == (t3 = this.media) ? void 0 : t3.currentTime) || 1, this.hls.trigger(h.MEDIA_ENDED, { stalled: false }));
    }, this.hls = t2, this.fragmentTracker = e2, this.registerListeners();
  }
  registerListeners() {
    const { hls: t2 } = this;
    t2 && (t2.on(h.MEDIA_ATTACHED, this.onMediaAttached, this), t2.on(h.MEDIA_DETACHING, this.onMediaDetaching, this), t2.on(h.BUFFER_APPENDED, this.onBufferAppended, this));
  }
  unregisterListeners() {
    const { hls: t2 } = this;
    t2 && (t2.off(h.MEDIA_ATTACHED, this.onMediaAttached, this), t2.off(h.MEDIA_DETACHING, this.onMediaDetaching, this), t2.off(h.BUFFER_APPENDED, this.onBufferAppended, this));
  }
  destroy() {
    super.destroy(), this.unregisterListeners(), this.media = this.hls = this.fragmentTracker = null, this.mediaSource = void 0;
  }
  onMediaAttached(t2, e2) {
    this.setInterval(100), this.mediaSource = e2.mediaSource;
    const s2 = this.media = e2.media;
    Ds(s2, "playing", this.onMediaPlaying), Ds(s2, "waiting", this.onMediaWaiting), Ds(s2, "ended", this.onMediaEnded);
  }
  onMediaDetaching(t2, e2) {
    this.clearInterval();
    const { media: s2 } = this;
    s2 && (_s(s2, "playing", this.onMediaPlaying), _s(s2, "waiting", this.onMediaWaiting), _s(s2, "ended", this.onMediaEnded), this.media = null), this.mediaSource = void 0;
  }
  onBufferAppended(t2, e2) {
    this.buffered = e2.timeRanges;
  }
  get hasBuffered() {
    return Object.keys(this.buffered).length > 0;
  }
  tick() {
    var t2;
    if (null == (t2 = this.media) || !t2.readyState || !this.hasBuffered) return;
    const e2 = this.media.currentTime;
    this.poll(e2, this.lastCurrentTime), this.lastCurrentTime = e2;
  }
  poll(t2, e2) {
    var s2, i2;
    const r2 = null == (s2 = this.hls) ? void 0 : s2.config;
    if (!r2) return;
    const n2 = this.media;
    if (!n2) return;
    const { seeking: a2 } = n2, o2 = this.seeking && !a2, l2 = !this.seeking && a2, d2 = n2.paused && !a2 || n2.ended || 0 === n2.playbackRate;
    if (this.seeking = a2, t2 !== e2) return e2 && (this.ended = 0), this.moved = true, a2 || (this.nudgeRetry = 0, r2.nudgeOnVideoHole && !d2 && t2 > e2 && this.nudgeOnVideoHole(t2, e2)), void (0 === this.waiting && this.stallResolved(t2));
    if (l2 || o2) return void (o2 && this.stallResolved(t2));
    if (d2) return this.nudgeRetry = 0, this.stallResolved(t2), void (!this.ended && n2.ended && this.hls && (this.ended = t2 || 1, this.hls.trigger(h.MEDIA_ENDED, { stalled: false })));
    if (!BufferHelper.getBuffered(n2).length) return void (this.nudgeRetry = 0);
    const c2 = BufferHelper.bufferInfo(n2, t2, 0), u2 = c2.nextStart || 0, f2 = this.fragmentTracker;
    if (a2 && f2 && this.hls) {
      const e3 = ra(this.hls.inFlightFragments, t2), s3 = c2.len > 2, i3 = !u2 || e3 || u2 - t2 > 2 && !f2.getPartialFragment(t2);
      if (s3 || i3) return;
      this.moved = false;
    }
    const g2 = null == (i2 = this.hls) ? void 0 : i2.latestLevelDetails;
    if (!this.moved && null !== this.stalled && f2) {
      if (!(c2.len > 0 || u2)) return;
      const e3 = Math.max(u2, c2.start || 0) - t2, s3 = null != g2 && g2.live ? 2 * g2.targetduration : 2, i3 = aa(t2, f2);
      if (e3 > 0 && (e3 <= s3 || i3)) return void (n2.paused || this._trySkipBufferHole(i3));
    }
    const m2 = r2.detectStallWithCurrentTimeMs, p2 = self.performance.now(), v2 = this.waiting;
    let y2 = this.stalled;
    if (null === y2) {
      if (!(v2 > 0 && p2 - v2 < m2)) return void (this.stalled = p2);
      y2 = this.stalled = v2;
    }
    const E2 = p2 - y2;
    if (!a2 && (E2 >= m2 || v2) && this.hls) {
      var T2;
      if ("ended" === (null == (T2 = this.mediaSource) ? void 0 : T2.readyState) && (null == g2 || !g2.live) && Math.abs(t2 - ((null == g2 ? void 0 : g2.edge) || 0)) < 1) {
        if (this.ended) return;
        return this.ended = t2 || 1, void this.hls.trigger(h.MEDIA_ENDED, { stalled: true });
      }
      if (this._reportStall(c2), !this.media || !this.hls) return;
    }
    const S2 = BufferHelper.bufferInfo(n2, t2, r2.maxBufferHole);
    this._tryFixBufferStall(S2, E2, t2);
  }
  stallResolved(t2) {
    const e2 = this.stalled;
    if (e2 && this.hls && (this.stalled = null, this.stallReported)) {
      const s2 = self.performance.now() - e2;
      this.log(`playback not stuck anymore @${t2}, after ${Math.round(s2)}ms`), this.stallReported = false, this.waiting = 0, this.hls.trigger(h.STALL_RESOLVED, {});
    }
  }
  nudgeOnVideoHole(t2, e2) {
    var s2;
    const i2 = this.buffered.video;
    if (this.hls && this.media && this.fragmentTracker && null != (s2 = this.buffered.audio) && s2.length && i2 && i2.length > 1 && t2 > i2.end(0)) {
      const s3 = BufferHelper.bufferedInfo(BufferHelper.timeRangesToArray(this.buffered.audio), t2, 0);
      if (s3.len > 1 && e2 >= s3.start) {
        const s4 = BufferHelper.timeRangesToArray(i2), r2 = BufferHelper.bufferedInfo(s4, e2, 0).bufferedIndex;
        if (r2 > -1 && r2 < s4.length - 1) {
          const e3 = BufferHelper.bufferedInfo(s4, t2, 0).bufferedIndex, i3 = s4[r2].end, n2 = s4[r2 + 1].start;
          if ((-1 === e3 || e3 > r2) && n2 - i3 < 1 && t2 - i3 < 2) {
            const s5 = new Error(`nudging playhead to flush pipeline after video hole. currentTime: ${t2} hole: ${i3} -> ${n2} buffered index: ${e3}`);
            this.warn(s5.message), this.media.currentTime += 1e-6;
            let r3 = aa(t2, this.fragmentTracker);
            r3 && "fragment" in r3 ? r3 = r3.fragment : r3 || (r3 = void 0);
            const a2 = BufferHelper.bufferInfo(this.media, t2, 0);
            this.hls.trigger(h.ERROR, { type: o.MEDIA_ERROR, details: l.BUFFER_SEEK_OVER_HOLE, fatal: false, error: s5, reason: s5.message, frag: r3, buffer: a2.len, bufferInfo: a2 });
          }
        }
      }
    }
  }
  _tryFixBufferStall(t2, e2, s2) {
    var i2, r2;
    const { fragmentTracker: n2, media: a2 } = this, o2 = null == (i2 = this.hls) ? void 0 : i2.config;
    if (!a2 || !n2 || !o2) return;
    const l2 = null == (r2 = this.hls) ? void 0 : r2.latestLevelDetails, h2 = aa(s2, n2);
    if ((h2 || null != l2 && l2.live && s2 < l2.fragmentStart) && (this._trySkipBufferHole(h2) || !this.media)) return;
    const d2 = t2.buffered, c2 = this.adjacentTraversal(t2, s2);
    (d2 && d2.length > 1 && t2.len > o2.maxBufferHole || t2.nextStart && (t2.nextStart - s2 < o2.maxBufferHole || c2)) && (e2 > 1e3 * o2.highBufferWatchdogPeriod || this.waiting) && (this.warn("Trying to nudge playhead over buffer-hole"), this._tryNudgeBuffer(t2));
  }
  adjacentTraversal(t2, e2) {
    const s2 = this.fragmentTracker, i2 = t2.nextStart;
    if (s2 && i2) {
      const t3 = s2.getFragAtPos(e2, g), r2 = s2.getFragAtPos(i2, g);
      if (t3 && r2) return r2.sn - t3.sn < 2;
    }
    return false;
  }
  _reportStall(t2) {
    const { hls: e2, media: s2, stallReported: i2, stalled: r2 } = this;
    if (!i2 && null !== r2 && s2 && e2) {
      this.stallReported = true;
      const i3 = new Error(`Playback stalling at @${s2.currentTime} due to low buffer (${$t(t2)})`);
      this.warn(i3.message), e2.trigger(h.ERROR, { type: o.MEDIA_ERROR, details: l.BUFFER_STALLED_ERROR, fatal: false, error: i3, buffer: t2.len, bufferInfo: t2, stalled: { start: r2 } });
    }
  }
  _trySkipBufferHole(t2) {
    var e2;
    const { fragmentTracker: s2, media: i2 } = this, r2 = null == (e2 = this.hls) ? void 0 : e2.config;
    if (!i2 || !s2 || !r2) return 0;
    const n2 = i2.currentTime, a2 = BufferHelper.bufferInfo(i2, n2, 0), d2 = n2 < a2.start ? a2.start : a2.nextStart;
    if (d2 && this.hls) {
      const e3 = a2.len <= r2.maxBufferHole, u2 = a2.len > 0 && a2.len < 1 && i2.readyState < 3, f2 = d2 - n2;
      if (f2 > 0 && (e3 || u2)) {
        if (f2 > r2.maxBufferHole) {
          let e5 = false;
          if (0 === n2) {
            const t3 = s2.getAppendedFrag(0, g);
            t3 && d2 < t3.end && (e5 = true);
          }
          if (!e5 && t2) {
            var c2;
            if (null == (c2 = this.hls.loadLevelObj) || !c2.details) return 0;
            if (ra(this.hls.inFlightFragments, d2)) return 0;
            let e6 = false, i3 = t2.end;
            for (; i3 < d2; ) {
              const t3 = aa(i3, s2);
              if (!t3) {
                e6 = true;
                break;
              }
              i3 += t3.duration;
            }
            if (e6) return 0;
          }
        }
        const e4 = Math.max(d2 + 0.05, n2 + 0.1);
        if (this.warn(`skipping hole, adjusting currentTime from ${n2} to ${e4}`), this.moved = true, i2.currentTime = e4, null == t2 || !t2.gap) {
          const s3 = new Error(`fragment loaded with buffer holes, seeking from ${n2} to ${e4}`), i3 = { type: o.MEDIA_ERROR, details: l.BUFFER_SEEK_OVER_HOLE, fatal: false, error: s3, reason: s3.message, buffer: a2.len, bufferInfo: a2 };
          t2 && ("fragment" in t2 ? i3.part = t2 : i3.frag = t2), this.hls.trigger(h.ERROR, i3);
        }
        return e4;
      }
    }
    return 0;
  }
  _tryNudgeBuffer(t2) {
    const { hls: e2, media: s2, nudgeRetry: i2 } = this, r2 = null == e2 ? void 0 : e2.config;
    if (!s2 || !r2) return 0;
    const n2 = s2.currentTime;
    if (this.nudgeRetry++, i2 < r2.nudgeMaxRetry) {
      const a2 = n2 + (i2 + 1) * r2.nudgeOffset, d2 = new Error(`Nudging 'currentTime' from ${n2} to ${a2}`);
      this.warn(d2.message), s2.currentTime = a2, e2.trigger(h.ERROR, { type: o.MEDIA_ERROR, details: l.BUFFER_NUDGE_ON_STALL, error: d2, fatal: false, buffer: t2.len, bufferInfo: t2 });
    } else {
      const s3 = new Error(`Playhead still not moving while enough data buffered @${n2} after ${r2.nudgeMaxRetry} nudges`);
      this.error(s3.message), e2.trigger(h.ERROR, { type: o.MEDIA_ERROR, details: l.BUFFER_STALLED_ERROR, error: s3, fatal: true, buffer: t2.len, bufferInfo: t2 });
    }
  }
}
function ra(t2, e2) {
  const s2 = na(t2.main);
  if (s2 && s2.start <= e2) return s2;
  const i2 = na(t2.audio);
  return i2 && i2.start <= e2 ? i2 : null;
}
function na(t2) {
  if (!t2) return null;
  switch (t2.state) {
    case ws:
    case Cs:
    case $s:
    case Us:
      return null;
  }
  return t2.frag;
}
function aa(t2, e2) {
  return e2.getAppendedFrag(t2, g) || e2.getPartialFragment(t2);
}
function oa() {
  if ("undefined" != typeof self) return self.VTTCue || self.TextTrackCue;
}
function la(t2, e2, s2, i2, r2) {
  let n2 = new t2(e2, s2, "");
  try {
    n2.value = i2, r2 && (n2.type = r2);
  } catch (a2) {
    n2 = new t2(e2, s2, $t(r2 ? T({ type: r2 }, i2) : i2));
  }
  return n2;
}
const ha = (() => {
  const t2 = oa();
  try {
    t2 && new t2(0, Number.POSITIVE_INFINITY, "");
  } catch (t3) {
    return Number.MAX_VALUE;
  }
  return Number.POSITIVE_INFINITY;
})();
class ID3TrackController {
  constructor(t2) {
    this.hls = void 0, this.id3Track = null, this.media = null, this.dateRangeCuesAppended = {}, this.removeCues = true, this.assetCue = void 0, this.onEventCueEnter = () => {
      this.hls && this.hls.trigger(h.EVENT_CUE_ENTER, {});
    }, this.hls = t2, this._registerListeners();
  }
  destroy() {
    this._unregisterListeners(), this.id3Track = null, this.media = null, this.dateRangeCuesAppended = {}, this.hls = this.onEventCueEnter = null;
  }
  _registerListeners() {
    const { hls: t2 } = this;
    t2 && (t2.on(h.MEDIA_ATTACHING, this.onMediaAttaching, this), t2.on(h.MEDIA_ATTACHED, this.onMediaAttached, this), t2.on(h.MEDIA_DETACHING, this.onMediaDetaching, this), t2.on(h.MANIFEST_LOADING, this.onManifestLoading, this), t2.on(h.FRAG_PARSING_METADATA, this.onFragParsingMetadata, this), t2.on(h.BUFFER_FLUSHING, this.onBufferFlushing, this), t2.on(h.LEVEL_UPDATED, this.onLevelUpdated, this), t2.on(h.LEVEL_PTS_UPDATED, this.onLevelPtsUpdated, this));
  }
  _unregisterListeners() {
    const { hls: t2 } = this;
    t2 && (t2.off(h.MEDIA_ATTACHING, this.onMediaAttaching, this), t2.off(h.MEDIA_ATTACHED, this.onMediaAttached, this), t2.off(h.MEDIA_DETACHING, this.onMediaDetaching, this), t2.off(h.MANIFEST_LOADING, this.onManifestLoading, this), t2.off(h.FRAG_PARSING_METADATA, this.onFragParsingMetadata, this), t2.off(h.BUFFER_FLUSHING, this.onBufferFlushing, this), t2.off(h.LEVEL_UPDATED, this.onLevelUpdated, this), t2.off(h.LEVEL_PTS_UPDATED, this.onLevelPtsUpdated, this));
  }
  onMediaAttaching(t2, e2) {
    var s2;
    this.media = e2.media, false === (null == (s2 = e2.overrides) ? void 0 : s2.cueRemoval) && (this.removeCues = false);
  }
  onMediaAttached() {
    var t2;
    const e2 = null == (t2 = this.hls) ? void 0 : t2.latestLevelDetails;
    e2 && this.updateDateRangeCues(e2);
  }
  onMediaDetaching(t2, e2) {
    this.media = null, e2.transferMedia || (this.id3Track && (this.removeCues && en(this.id3Track, this.onEventCueEnter), this.id3Track = null), this.dateRangeCuesAppended = {});
  }
  onManifestLoading() {
    this.dateRangeCuesAppended = {};
  }
  createTrack(t2) {
    const e2 = this.getID3Track(t2.textTracks);
    return e2.mode = "hidden", e2;
  }
  getID3Track(t2) {
    if (this.media) {
      for (let e2 = 0; e2 < t2.length; e2++) {
        const s2 = t2[e2];
        if ("metadata" === s2.kind && "id3" === s2.label) return Jr(s2, this.media), s2;
      }
      return this.media.addTextTrack("metadata", "id3");
    }
  }
  onFragParsingMetadata(t2, e2) {
    if (!this.media || !this.hls) return;
    const { enableEmsgMetadataCues: s2, enableID3MetadataCues: i2 } = this.hls.config;
    if (!s2 && !i2) return;
    const { samples: r2 } = e2;
    this.id3Track || (this.id3Track = this.createTrack(this.media));
    const n2 = oa();
    if (n2) for (let t3 = 0; t3 < r2.length; t3++) {
      const e3 = r2[t3].type;
      if (e3 === pi.emsg && !s2 || !i2) continue;
      const a2 = ui(r2[t3].data), o2 = r2[t3].pts;
      let l2 = o2 + r2[t3].duration;
      l2 > ha && (l2 = ha), l2 - o2 <= 0 && (l2 = o2 + 0.25);
      for (let t4 = 0; t4 < a2.length; t4++) {
        const s3 = a2[t4];
        if (!fi(s3)) {
          this.updateId3CueEnds(o2, e3);
          const t5 = la(n2, o2, l2, s3, e3);
          t5 && this.id3Track.addCue(t5);
        }
      }
    }
  }
  updateId3CueEnds(t2, e2) {
    var s2;
    const i2 = null == (s2 = this.id3Track) ? void 0 : s2.cues;
    if (i2) for (let s3 = i2.length; s3--; ) {
      const r2 = i2[s3];
      r2.type === e2 && r2.startTime < t2 && r2.endTime === ha && (r2.endTime = t2);
    }
  }
  onBufferFlushing(t2, { startOffset: e2, endOffset: s2, type: i2 }) {
    const { id3Track: r2, hls: n2 } = this;
    if (!n2) return;
    const { config: { enableEmsgMetadataCues: a2, enableID3MetadataCues: o2 } } = n2;
    if (r2 && (a2 || o2)) {
      let t3;
      t3 = "audio" === i2 ? (t4) => t4.type === pi.audioId3 && o2 : "video" === i2 ? (t4) => t4.type === pi.emsg && a2 : (t4) => t4.type === pi.audioId3 && o2 || t4.type === pi.emsg && a2, sn(r2, e2, s2, t3);
    }
  }
  onLevelUpdated(t2, { details: e2 }) {
    this.updateDateRangeCues(e2, true);
  }
  onLevelPtsUpdated(t2, e2) {
    Math.abs(e2.drift) > 0.01 && this.updateDateRangeCues(e2.details);
  }
  updateDateRangeCues(t2, e2) {
    if (!this.hls || !this.media) return;
    const { assetPlayerId: s2, timelineOffset: i2, enableDateRangeMetadataCues: n2, interstitialsController: a2 } = this.hls.config;
    if (!n2) return;
    const o2 = oa();
    if (s2 && i2 && !a2) {
      const { fragmentStart: e3, fragmentEnd: i3 } = t2;
      let r2 = this.assetCue;
      r2 ? (r2.startTime = e3, r2.endTime = i3) : o2 && (r2 = this.assetCue = la(o2, e3, i3, { assetPlayerId: this.hls.config.assetPlayerId }, "hlsjs.interstitial.asset"), r2 && (r2.id = s2, this.id3Track || (this.id3Track = this.createTrack(this.media)), this.id3Track.addCue(r2), r2.addEventListener("enter", this.onEventCueEnter)));
    }
    if (!t2.hasProgramDateTime) return;
    const { id3Track: l2 } = this, { dateRanges: h2 } = t2, d2 = Object.keys(h2);
    let c2 = this.dateRangeCuesAppended;
    var u2;
    if (l2 && e2) if (null != (u2 = l2.cues) && u2.length) {
      const t3 = Object.keys(c2).filter((t4) => !d2.includes(t4));
      for (let e3 = t3.length; e3--; ) {
        var f2;
        const s3 = t3[e3], i3 = null == (f2 = c2[s3]) ? void 0 : f2.cues;
        delete c2[s3], i3 && Object.keys(i3).forEach((t4) => {
          const e4 = i3[t4];
          if (e4) {
            e4.removeEventListener("enter", this.onEventCueEnter);
            try {
              l2.removeCue(e4);
            } catch (t5) {
            }
          }
        });
      }
    } else c2 = this.dateRangeCuesAppended = {};
    const g2 = t2.fragments[t2.fragments.length - 1];
    if (0 !== d2.length && r(null == g2 ? void 0 : g2.programDateTime)) {
      this.id3Track || (this.id3Track = this.createTrack(this.media));
      for (let t3 = 0; t3 < d2.length; t3++) {
        const e3 = d2[t3], s3 = h2[e3], i3 = s3.startTime, r2 = c2[e3], n3 = (null == r2 ? void 0 : r2.cues) || {};
        let l3 = (null == r2 ? void 0 : r2.durationKnown) || false, u3 = ha;
        const { duration: f3, endDate: g3 } = s3;
        if (g3 && null !== f3) u3 = i3 + f3, l3 = true;
        else if (s3.endOnNext && !l3) {
          const t4 = d2.reduce((t5, e4) => {
            if (e4 !== s3.id) {
              const i4 = h2[e4];
              if (i4.class === s3.class && i4.startDate > s3.startDate && (!t5 || s3.startDate < t5.startDate)) return i4;
            }
            return t5;
          }, null);
          t4 && (u3 = t4.startTime, l3 = true);
        }
        const m2 = Object.keys(s3.attr);
        for (let t4 = 0; t4 < m2.length; t4++) {
          const h3 = m2[t4];
          if (!Ie(h3)) continue;
          const d3 = n3[h3];
          if (d3) !l3 || null != r2 && r2.durationKnown ? Math.abs(d3.startTime - i3) > 0.01 && (d3.startTime = i3, d3.endTime = u3) : d3.endTime = u3;
          else if (o2) {
            let t5 = s3.attr[h3];
            ke(h3) && (t5 = C(t5));
            const r3 = la(o2, i3, u3, { key: h3, data: t5 }, pi.dateRange);
            r3 && (r3.id = e3, this.id3Track.addCue(r3), n3[h3] = r3, a2 && ("X-ASSET-LIST" !== h3 && "X-ASSET-URL" !== h3 || r3.addEventListener("enter", this.onEventCueEnter)));
          }
        }
        c2[e3] = { cues: n3, dateRange: s3, durationKnown: l3 };
      }
    }
  }
}
class LatencyController {
  constructor(t2) {
    this.hls = void 0, this.config = void 0, this.media = null, this.currentTime = 0, this.stallCount = 0, this._latency = null, this._targetLatencyUpdated = false, this.onTimeupdate = () => {
      const { media: t3 } = this, e2 = this.levelDetails;
      if (!t3 || !e2) return;
      this.currentTime = t3.currentTime;
      const s2 = this.computeLatency();
      if (null === s2) return;
      this._latency = s2;
      const { lowLatencyMode: i2, maxLiveSyncPlaybackRate: r2 } = this.config;
      if (!i2 || 1 === r2 || !e2.live) return;
      const n2 = this.targetLatency;
      if (null === n2) return;
      const a2 = s2 - n2;
      if (a2 < Math.min(this.maxLatency, n2 + e2.targetduration) && a2 > 0.05 && this.forwardBufferLength > 1) {
        const e3 = Math.min(2, Math.max(1, r2)), s3 = Math.round(2 / (1 + Math.exp(-0.75 * a2 - this.edgeStalled)) * 20) / 20, i3 = Math.min(e3, Math.max(1, s3));
        this.changeMediaPlaybackRate(t3, i3);
      } else 1 !== t3.playbackRate && 0 !== t3.playbackRate && this.changeMediaPlaybackRate(t3, 1);
    }, this.hls = t2, this.config = t2.config, this.registerListeners();
  }
  get levelDetails() {
    var t2;
    return (null == (t2 = this.hls) ? void 0 : t2.latestLevelDetails) || null;
  }
  get latency() {
    return this._latency || 0;
  }
  get maxLatency() {
    const { config: t2 } = this;
    if (void 0 !== t2.liveMaxLatencyDuration) return t2.liveMaxLatencyDuration;
    const e2 = this.levelDetails;
    return e2 ? t2.liveMaxLatencyDurationCount * e2.targetduration : 0;
  }
  get targetLatency() {
    const t2 = this.levelDetails;
    if (null === t2 || null === this.hls) return null;
    const { holdBack: e2, partHoldBack: s2, targetduration: i2 } = t2, { liveSyncDuration: r2, liveSyncDurationCount: n2, lowLatencyMode: a2 } = this.config, o2 = this.hls.userConfig;
    let l2 = a2 && s2 || e2;
    (this._targetLatencyUpdated || o2.liveSyncDuration || o2.liveSyncDurationCount || 0 === l2) && (l2 = void 0 !== r2 ? r2 : n2 * i2);
    const h2 = i2;
    return l2 + Math.min(this.stallCount * this.config.liveSyncOnStallIncrease, h2);
  }
  set targetLatency(t2) {
    this.stallCount = 0, this.config.liveSyncDuration = t2, this._targetLatencyUpdated = true;
  }
  get liveSyncPosition() {
    const t2 = this.estimateLiveEdge(), e2 = this.targetLatency;
    if (null === t2 || null === e2) return null;
    const s2 = this.levelDetails;
    if (null === s2) return null;
    const i2 = s2.edge, r2 = t2 - e2 - this.edgeStalled, n2 = i2 - s2.totalduration, a2 = i2 - (this.config.lowLatencyMode && s2.partTarget || s2.targetduration);
    return Math.min(Math.max(n2, r2), a2);
  }
  get drift() {
    const t2 = this.levelDetails;
    return null === t2 ? 1 : t2.drift;
  }
  get edgeStalled() {
    const t2 = this.levelDetails;
    if (null === t2) return 0;
    const e2 = 3 * (this.config.lowLatencyMode && t2.partTarget || t2.targetduration);
    return Math.max(t2.age - e2, 0);
  }
  get forwardBufferLength() {
    const { media: t2 } = this, e2 = this.levelDetails;
    if (!t2 || !e2) return 0;
    const s2 = t2.buffered.length;
    return (s2 ? t2.buffered.end(s2 - 1) : e2.edge) - this.currentTime;
  }
  destroy() {
    this.unregisterListeners(), this.onMediaDetaching(), this.hls = null;
  }
  registerListeners() {
    const { hls: t2 } = this;
    t2 && (t2.on(h.MEDIA_ATTACHED, this.onMediaAttached, this), t2.on(h.MEDIA_DETACHING, this.onMediaDetaching, this), t2.on(h.MANIFEST_LOADING, this.onManifestLoading, this), t2.on(h.LEVEL_UPDATED, this.onLevelUpdated, this), t2.on(h.ERROR, this.onError, this));
  }
  unregisterListeners() {
    const { hls: t2 } = this;
    t2 && (t2.off(h.MEDIA_ATTACHED, this.onMediaAttached, this), t2.off(h.MEDIA_DETACHING, this.onMediaDetaching, this), t2.off(h.MANIFEST_LOADING, this.onManifestLoading, this), t2.off(h.LEVEL_UPDATED, this.onLevelUpdated, this), t2.off(h.ERROR, this.onError, this));
  }
  onMediaAttached(t2, e2) {
    this.media = e2.media, this.media.addEventListener("timeupdate", this.onTimeupdate);
  }
  onMediaDetaching() {
    this.media && (this.media.removeEventListener("timeupdate", this.onTimeupdate), this.media = null);
  }
  onManifestLoading() {
    this._latency = null, this.stallCount = 0;
  }
  onLevelUpdated(t2, { details: e2 }) {
    e2.advanced && this.onTimeupdate(), !e2.live && this.media && this.media.removeEventListener("timeupdate", this.onTimeupdate);
  }
  onError(t2, e2) {
    var s2;
    e2.details === l.BUFFER_STALLED_ERROR && (this.stallCount++, this.hls && null != (s2 = this.levelDetails) && s2.live && this.hls.logger.warn("[latency-controller]: Stall detected, adjusting target latency"));
  }
  changeMediaPlaybackRate(t2, e2) {
    var s2, i2;
    t2.playbackRate !== e2 && (null == (s2 = this.hls) || s2.logger.debug(`[latency-controller]: latency=${this.latency.toFixed(3)}, targetLatency=${null == (i2 = this.targetLatency) ? void 0 : i2.toFixed(3)}, forwardBufferLength=${this.forwardBufferLength.toFixed(3)}: adjusting playback rate from ${t2.playbackRate} to ${e2}`), t2.playbackRate = e2);
  }
  estimateLiveEdge() {
    const t2 = this.levelDetails;
    return null === t2 ? null : t2.edge + t2.age;
  }
  computeLatency() {
    const t2 = this.estimateLiveEdge();
    return null === t2 ? null : t2 - this.currentTime;
  }
}
class LevelController extends BasePlaylistController {
  constructor(t2, e2) {
    super(t2, "level-controller"), this._levels = [], this._firstLevel = -1, this._maxAutoLevel = -1, this._startLevel = void 0, this.currentLevel = null, this.currentLevelIndex = -1, this.manualLevelIndex = -1, this.steering = void 0, this.onParsedComplete = void 0, this.steering = e2, this._registerListeners();
  }
  _registerListeners() {
    const { hls: t2 } = this;
    t2.on(h.MANIFEST_LOADING, this.onManifestLoading, this), t2.on(h.MANIFEST_LOADED, this.onManifestLoaded, this), t2.on(h.LEVEL_LOADED, this.onLevelLoaded, this), t2.on(h.LEVELS_UPDATED, this.onLevelsUpdated, this), t2.on(h.FRAG_BUFFERED, this.onFragBuffered, this), t2.on(h.ERROR, this.onError, this);
  }
  _unregisterListeners() {
    const { hls: t2 } = this;
    t2.off(h.MANIFEST_LOADING, this.onManifestLoading, this), t2.off(h.MANIFEST_LOADED, this.onManifestLoaded, this), t2.off(h.LEVEL_LOADED, this.onLevelLoaded, this), t2.off(h.LEVELS_UPDATED, this.onLevelsUpdated, this), t2.off(h.FRAG_BUFFERED, this.onFragBuffered, this), t2.off(h.ERROR, this.onError, this);
  }
  destroy() {
    this._unregisterListeners(), this.steering = null, this.resetLevels(), super.destroy();
  }
  stopLoad() {
    this._levels.forEach((t2) => {
      t2.loadError = 0, t2.fragmentError = 0;
    }), super.stopLoad();
  }
  resetLevels() {
    this._startLevel = void 0, this.manualLevelIndex = -1, this.currentLevelIndex = -1, this.currentLevel = null, this._levels = [], this._maxAutoLevel = -1;
  }
  onManifestLoading(t2, e2) {
    this.resetLevels();
  }
  onManifestLoaded(t2, e2) {
    const s2 = this.hls.config.preferManagedMediaSource, i2 = [], r2 = {}, n2 = {};
    let a2 = false, o2 = false, l2 = false;
    e2.levels.forEach((t3) => {
      const e3 = t3.attrs;
      let { audioCodec: h2, videoCodec: d2 } = t3;
      h2 && (t3.audioCodec = h2 = Lt(h2, s2) || void 0), d2 && (d2 = t3.videoCodec = function(t4) {
        const e4 = t4.split(",");
        for (let t5 = 0; t5 < e4.length; t5++) {
          const s3 = e4[t5].split(".");
          s3.length > 2 && "avc1" === s3[0] && (e4[t5] = `avc1.${parseInt(s3[1]).toString(16)}${("000" + parseInt(s3[2]).toString(16)).slice(-4)}`);
        }
        return e4.join(",");
      }(d2));
      const { width: c2, height: u2, unknownCodecs: f2 } = t3, g2 = (null == f2 ? void 0 : f2.length) || 0;
      if (a2 || (a2 = !(!c2 || !u2)), o2 || (o2 = !!d2), l2 || (l2 = !!h2), g2 || h2 && !this.isAudioSupported(h2) || d2 && !this.isVideoSupported(d2)) return void this.log(`Some or all CODECS not supported "${e3.CODECS}"`);
      const { CODECS: m2, "FRAME-RATE": p2, "HDCP-LEVEL": v2, "PATHWAY-ID": y2, RESOLUTION: E2, "VIDEO-RANGE": T2 } = e3, S2 = `${y2 || "."}-${t3.bitrate}-${E2}-${p2}-${m2}-${T2}-${v2}`;
      if (r2[S2]) if (r2[S2].uri === t3.url || t3.attrs["PATHWAY-ID"]) r2[S2].addGroupId("audio", e3.AUDIO), r2[S2].addGroupId("text", e3.SUBTITLES);
      else {
        const e4 = n2[S2] += 1;
        t3.attrs["PATHWAY-ID"] = new Array(e4 + 1).join(".");
        const s3 = this.createLevel(t3);
        r2[S2] = s3, i2.push(s3);
      }
      else {
        const e4 = this.createLevel(t3);
        r2[S2] = e4, n2[S2] = 1, i2.push(e4);
      }
    }), this.filterAndSortMediaOptions(i2, e2, a2, o2, l2);
  }
  createLevel(t2) {
    const e2 = new Level(t2), s2 = t2.supplemental;
    if (null != s2 && s2.videoCodec && !this.isVideoSupported(s2.videoCodec)) {
      const t3 = new Error(`SUPPLEMENTAL-CODECS not supported "${s2.videoCodec}"`);
      this.log(t3.message), e2.supportedResult = _t(t3, []);
    }
    return e2;
  }
  isAudioSupported(t2) {
    return mt(t2, "audio", this.hls.config.preferManagedMediaSource);
  }
  isVideoSupported(t2) {
    return mt(t2, "video", this.hls.config.preferManagedMediaSource);
  }
  filterAndSortMediaOptions(t2, e2, s2, i2, r2) {
    var n2;
    let a2 = [], d2 = [], c2 = t2;
    const u2 = (null == (n2 = e2.stats) ? void 0 : n2.parsing) || {};
    if ((s2 || i2) && r2 && (c2 = c2.filter(({ videoCodec: t3, videoRange: e3, width: s3, height: i3 }) => {
      return (!!t3 || !(!s3 || !i3)) && !!(r3 = e3) && Ft.indexOf(r3) > -1;
      var r3;
    })), 0 === c2.length) return Promise.resolve().then(() => {
      if (this.hls) {
        let t3 = "no level with compatible codecs found in manifest", s3 = t3;
        e2.levels.length && (s3 = `one or more CODECS in variant not supported: ${$t(e2.levels.map((t4) => t4.attrs.CODECS).filter((t4, e3, s4) => s4.indexOf(t4) === e3))}`, this.warn(s3), t3 += ` (${s3})`);
        const i3 = new Error(t3);
        this.hls.trigger(h.ERROR, { type: o.MEDIA_ERROR, details: l.MANIFEST_INCOMPATIBLE_CODECS_ERROR, fatal: true, url: e2.url, error: i3, reason: s3 });
      }
    }), void (u2.end = performance.now());
    e2.audioTracks && (a2 = e2.audioTracks.filter((t3) => !t3.audioCodec || this.isAudioSupported(t3.audioCodec)), da(a2)), e2.subtitles && (d2 = e2.subtitles, da(d2));
    const f2 = c2.slice(0);
    c2.sort((t3, e3) => {
      if (t3.attrs["HDCP-LEVEL"] !== e3.attrs["HDCP-LEVEL"]) return (t3.attrs["HDCP-LEVEL"] || "") > (e3.attrs["HDCP-LEVEL"] || "") ? 1 : -1;
      if (s2 && t3.height !== e3.height) return t3.height - e3.height;
      if (t3.frameRate !== e3.frameRate) return t3.frameRate - e3.frameRate;
      if (t3.videoRange !== e3.videoRange) return Ft.indexOf(t3.videoRange) - Ft.indexOf(e3.videoRange);
      if (t3.videoCodec !== e3.videoCodec) {
        const s3 = yt(t3.videoCodec), i3 = yt(e3.videoCodec);
        if (s3 !== i3) return i3 - s3;
      }
      if (t3.uri === e3.uri && t3.codecSet !== e3.codecSet) {
        const s3 = Et(t3.codecSet), i3 = Et(e3.codecSet);
        if (s3 !== i3) return i3 - s3;
      }
      return t3.averageBitrate !== e3.averageBitrate ? t3.averageBitrate - e3.averageBitrate : 0;
    });
    let g2 = f2[0];
    if (this.steering && (c2 = this.steering.filterParsedLevels(c2), c2.length !== f2.length)) {
      for (let t3 = 0; t3 < f2.length; t3++) if (f2[t3].pathwayId === c2[0].pathwayId) {
        g2 = f2[t3];
        break;
      }
    }
    this._levels = c2;
    for (let t3 = 0; t3 < c2.length; t3++) if (c2[t3] === g2) {
      var m2;
      this._firstLevel = t3;
      const e3 = g2.bitrate, s3 = this.hls.bandwidthEstimate;
      if (this.log(`manifest loaded, ${c2.length} level(s) found, first bitrate: ${e3}`), void 0 === (null == (m2 = this.hls.userConfig) ? void 0 : m2.abrEwmaDefaultEstimate)) {
        const t4 = Math.min(e3, this.hls.config.abrEwmaDefaultEstimateMax);
        t4 > s3 && s3 === this.hls.abrEwmaDefaultEstimate && (this.hls.bandwidthEstimate = t4);
      }
      break;
    }
    const p2 = r2 && !i2, v2 = this.hls.config, y2 = !(!v2.audioStreamController || !v2.audioTrackController), E2 = { levels: c2, audioTracks: a2, subtitleTracks: d2, sessionData: e2.sessionData, sessionKeys: e2.sessionKeys, firstLevel: this._firstLevel, stats: e2.stats, audio: r2, video: i2, altAudio: y2 && !p2 && a2.some((t3) => !!t3.url) };
    u2.end = performance.now(), this.hls.trigger(h.MANIFEST_PARSED, E2);
  }
  get levels() {
    return 0 === this._levels.length ? null : this._levels;
  }
  get loadLevelObj() {
    return this.currentLevel;
  }
  get level() {
    return this.currentLevelIndex;
  }
  set level(t2) {
    const e2 = this._levels;
    if (0 === e2.length) return;
    if (t2 < 0 || t2 >= e2.length) {
      const s3 = new Error("invalid level idx"), i3 = t2 < 0;
      if (this.hls.trigger(h.ERROR, { type: o.OTHER_ERROR, details: l.LEVEL_SWITCH_ERROR, level: t2, fatal: i3, error: s3, reason: s3.message }), i3) return;
      t2 = Math.min(t2, e2.length - 1);
    }
    const s2 = this.currentLevelIndex, i2 = this.currentLevel, r2 = i2 ? i2.attrs["PATHWAY-ID"] : void 0, n2 = e2[t2], a2 = n2.attrs["PATHWAY-ID"];
    if (this.currentLevelIndex = t2, this.currentLevel = n2, s2 === t2 && i2 && r2 === a2) return;
    this.log(`Switching to level ${t2} (${n2.height ? n2.height + "p " : ""}${n2.videoRange ? n2.videoRange + " " : ""}${n2.codecSet ? n2.codecSet + " " : ""}@${n2.bitrate})${a2 ? " with Pathway " + a2 : ""} from level ${s2}${r2 ? " with Pathway " + r2 : ""}`);
    const d2 = { level: t2, attrs: n2.attrs, details: n2.details, bitrate: n2.bitrate, averageBitrate: n2.averageBitrate, maxBitrate: n2.maxBitrate, realBitrate: n2.realBitrate, width: n2.width, height: n2.height, codecSet: n2.codecSet, audioCodec: n2.audioCodec, videoCodec: n2.videoCodec, audioGroups: n2.audioGroups, subtitleGroups: n2.subtitleGroups, loaded: n2.loaded, loadError: n2.loadError, fragmentError: n2.fragmentError, name: n2.name, id: n2.id, uri: n2.uri, url: n2.url, urlId: 0, audioGroupIds: n2.audioGroupIds, textGroupIds: n2.textGroupIds };
    this.hls.trigger(h.LEVEL_SWITCHING, d2);
    const c2 = n2.details;
    if (!c2 || c2.live) {
      const t3 = this.switchParams(n2.uri, null == i2 ? void 0 : i2.details, c2);
      this.loadPlaylist(t3);
    }
  }
  get manualLevel() {
    return this.manualLevelIndex;
  }
  set manualLevel(t2) {
    this.manualLevelIndex = t2, void 0 === this._startLevel && (this._startLevel = t2), -1 !== t2 && (this.level = t2);
  }
  get firstLevel() {
    return this._firstLevel;
  }
  set firstLevel(t2) {
    this._firstLevel = t2;
  }
  get startLevel() {
    if (void 0 === this._startLevel) {
      const t2 = this.hls.config.startLevel;
      return void 0 !== t2 ? t2 : this.hls.firstAutoLevel;
    }
    return this._startLevel;
  }
  set startLevel(t2) {
    this._startLevel = t2;
  }
  get pathways() {
    return this.steering ? this.steering.pathways() : [];
  }
  get pathwayPriority() {
    return this.steering ? this.steering.pathwayPriority : null;
  }
  set pathwayPriority(t2) {
    if (this.steering) {
      const e2 = this.steering.pathways(), s2 = t2.filter((t3) => -1 !== e2.indexOf(t3));
      if (t2.length < 1) return void this.warn(`pathwayPriority ${t2} should contain at least one pathway from list: ${e2}`);
      this.steering.pathwayPriority = s2;
    }
  }
  onError(t2, e2) {
    !e2.fatal && e2.context && e2.context.type === c && e2.context.level === this.level && this.checkRetry(e2);
  }
  onFragBuffered(t2, { frag: e2 }) {
    if (void 0 !== e2 && e2.type === g) {
      const t3 = e2.elementaryStreams;
      if (!Object.keys(t3).some((e3) => !!t3[e3])) return;
      const s2 = this._levels[e2.level];
      null != s2 && s2.loadError && (this.log(`Resetting level error count of ${s2.loadError} on frag buffered`), s2.loadError = 0);
    }
  }
  onLevelLoaded(t2, e2) {
    var s2;
    const { level: i2, details: r2 } = e2, n2 = e2.levelInfo;
    var a2;
    if (!n2) return this.warn(`Invalid level index ${i2}`), void (null != (a2 = e2.deliveryDirectives) && a2.skip && (r2.deltaUpdateFailed = true));
    if (n2 === this.currentLevel || e2.withoutMultiVariant) {
      0 === n2.fragmentError && (n2.loadError = 0);
      let t3 = n2.details;
      t3 === e2.details && t3.advanced && (t3 = void 0), this.playlistLoaded(i2, e2, t3);
    } else null != (s2 = e2.deliveryDirectives) && s2.skip && (r2.deltaUpdateFailed = true);
  }
  loadPlaylist(t2) {
    super.loadPlaylist(), this.shouldLoadPlaylist(this.currentLevel) && this.scheduleLoading(this.currentLevel, t2);
  }
  loadingPlaylist(t2, e2) {
    super.loadingPlaylist(t2, e2);
    const s2 = this.getUrlWithDirectives(t2.uri, e2), i2 = this.currentLevelIndex, r2 = t2.attrs["PATHWAY-ID"], n2 = t2.details, a2 = null == n2 ? void 0 : n2.age;
    this.log(`Loading level index ${i2}${void 0 !== (null == e2 ? void 0 : e2.msn) ? " at sn " + e2.msn + " part " + e2.part : ""}${r2 ? " Pathway " + r2 : ""}${a2 && n2.live ? " age " + a2.toFixed(1) + (n2.type && " " + n2.type || "") : ""} ${s2}`), this.hls.trigger(h.LEVEL_LOADING, { url: s2, level: i2, levelInfo: t2, pathwayId: t2.attrs["PATHWAY-ID"], id: 0, deliveryDirectives: e2 || null });
  }
  get nextLoadLevel() {
    return -1 !== this.manualLevelIndex ? this.manualLevelIndex : this.hls.nextAutoLevel;
  }
  set nextLoadLevel(t2) {
    this.level = t2, -1 === this.manualLevelIndex && (this.hls.nextAutoLevel = t2);
  }
  removeLevel(t2) {
    var e2;
    if (1 === this._levels.length) return;
    const s2 = this._levels.filter((e3, s3) => s3 !== t2 || (this.steering && this.steering.removeLevel(e3), e3 === this.currentLevel && (this.currentLevel = null, this.currentLevelIndex = -1, e3.details && e3.details.fragments.forEach((t3) => t3.level = -1)), false));
    Ss(s2), this._levels = s2, this.currentLevelIndex > -1 && null != (e2 = this.currentLevel) && e2.details && (this.currentLevelIndex = this.currentLevel.details.fragments[0].level), this.manualLevelIndex > -1 && (this.manualLevelIndex = this.currentLevelIndex);
    const i2 = s2.length - 1;
    this._firstLevel = Math.min(this._firstLevel, i2), this._startLevel && (this._startLevel = Math.min(this._startLevel, i2)), this.hls.trigger(h.LEVELS_UPDATED, { levels: s2 });
  }
  onLevelsUpdated(t2, { levels: e2 }) {
    this._levels = e2;
  }
  checkMaxAutoUpdated() {
    const { autoLevelCapping: t2, maxAutoLevel: e2, maxHdcpLevel: s2 } = this.hls;
    this._maxAutoLevel !== e2 && (this._maxAutoLevel = e2, this.hls.trigger(h.MAX_AUTO_LEVEL_UPDATED, { autoLevelCapping: t2, levels: this.levels, maxAutoLevel: e2, minAutoLevel: this.hls.minAutoLevel, maxHdcpLevel: s2 }));
  }
}
function da(t2) {
  const e2 = {};
  t2.forEach((t3) => {
    const s2 = t3.groupId || "";
    t3.id = e2[s2] = e2[s2] || 0, e2[s2]++;
  });
}
function ca() {
  return self.SourceBuffer || self.WebKitSourceBuffer;
}
function ua() {
  if (!k()) return false;
  const t2 = ca();
  return !t2 || t2.prototype && "function" == typeof t2.prototype.appendBuffer && "function" == typeof t2.prototype.remove;
}
class StreamController extends BaseStreamController {
  constructor(t2, e2, s2) {
    super(t2, e2, s2, "stream-controller", g), this.audioCodecSwap = false, this.level = -1, this._forceStartLoad = false, this._hasEnoughToStart = false, this.altAudio = 0, this.audioOnly = false, this.fragPlaying = null, this.fragLastKbps = 0, this.couldBacktrack = false, this.backtrackFragment = null, this.audioCodecSwitch = false, this.videoBuffer = null, this.onMediaPlaying = () => {
      this.tick();
    }, this.onMediaSeeked = () => {
      const t3 = this.media, e3 = t3 ? t3.currentTime : null;
      if (null === e3 || !r(e3)) return;
      if (this.log(`Media seeked to ${e3.toFixed(3)}`), !this.getBufferedFrag(e3)) return;
      const s3 = this.getFwdBufferInfoAtPos(t3, e3, g, 0);
      null !== s3 && 0 !== s3.len ? this.tick() : this.warn(`Main forward buffer length at ${e3} on "seeked" event ${s3 ? s3.len : "empty"})`);
    }, this.registerListeners();
  }
  registerListeners() {
    super.registerListeners();
    const { hls: t2 } = this;
    t2.on(h.MANIFEST_PARSED, this.onManifestParsed, this), t2.on(h.LEVEL_LOADING, this.onLevelLoading, this), t2.on(h.LEVEL_LOADED, this.onLevelLoaded, this), t2.on(h.FRAG_LOAD_EMERGENCY_ABORTED, this.onFragLoadEmergencyAborted, this), t2.on(h.AUDIO_TRACK_SWITCHING, this.onAudioTrackSwitching, this), t2.on(h.AUDIO_TRACK_SWITCHED, this.onAudioTrackSwitched, this), t2.on(h.BUFFER_CREATED, this.onBufferCreated, this), t2.on(h.BUFFER_FLUSHED, this.onBufferFlushed, this), t2.on(h.LEVELS_UPDATED, this.onLevelsUpdated, this), t2.on(h.FRAG_BUFFERED, this.onFragBuffered, this);
  }
  unregisterListeners() {
    super.unregisterListeners();
    const { hls: t2 } = this;
    t2.off(h.MANIFEST_PARSED, this.onManifestParsed, this), t2.off(h.LEVEL_LOADED, this.onLevelLoaded, this), t2.off(h.FRAG_LOAD_EMERGENCY_ABORTED, this.onFragLoadEmergencyAborted, this), t2.off(h.AUDIO_TRACK_SWITCHING, this.onAudioTrackSwitching, this), t2.off(h.AUDIO_TRACK_SWITCHED, this.onAudioTrackSwitched, this), t2.off(h.BUFFER_CREATED, this.onBufferCreated, this), t2.off(h.BUFFER_FLUSHED, this.onBufferFlushed, this), t2.off(h.LEVELS_UPDATED, this.onLevelsUpdated, this), t2.off(h.FRAG_BUFFERED, this.onFragBuffered, this);
  }
  onHandlerDestroying() {
    this.onMediaPlaying = this.onMediaSeeked = null, this.unregisterListeners(), super.onHandlerDestroying();
  }
  startLoad(t2, e2) {
    if (this.levels) {
      const { lastCurrentTime: s2, hls: i2 } = this;
      if (this.stopLoad(), this.setInterval(100), this.level = -1, !this.startFragRequested) {
        let t3 = i2.startLevel;
        -1 === t3 && (i2.config.testBandwidth && this.levels.length > 1 ? (t3 = 0, this.bitrateTest = true) : t3 = i2.firstAutoLevel), i2.nextLoadLevel = t3, this.level = i2.loadLevel, this._hasEnoughToStart = !!e2;
      }
      s2 > 0 && -1 === t2 && !e2 && (this.log(`Override startPosition with lastCurrentTime @${s2.toFixed(3)}`), t2 = s2), this.state = ws, this.nextLoadPosition = this.lastCurrentTime = t2 + this.timelineOffset, this.startPosition = e2 ? -1 : t2, this.tick();
    } else this._forceStartLoad = true, this.state = Cs;
  }
  stopLoad() {
    this._forceStartLoad = false, super.stopLoad();
  }
  doTick() {
    switch (this.state) {
      case Ks: {
        const { levels: t2, level: e2 } = this, s2 = null == t2 ? void 0 : t2[e2], i2 = null == s2 ? void 0 : s2.details;
        if (i2 && (!i2.live || this.levelLastLoaded === s2 && !this.waitForLive(s2))) {
          if (this.waitForCdnTuneIn(i2)) break;
          this.state = ws;
          break;
        }
        if (this.hls.nextLoadLevel !== this.level) {
          this.state = ws;
          break;
        }
        break;
      }
      case Os:
        this.checkRetryDate();
    }
    this.state === ws && this.doTickIdle(), this.onTickEnd();
  }
  onTickEnd() {
    var t2;
    super.onTickEnd(), null != (t2 = this.media) && t2.readyState && false === this.media.seeking && (this.lastCurrentTime = this.media.currentTime), this.checkFragmentChanged();
  }
  doTickIdle() {
    const { hls: t2, levelLastLoaded: e2, levels: s2, media: i2 } = this;
    if (null === e2 || !i2 && !this.primaryPrefetch && (this.startFragRequested || !t2.config.startFragPrefetch)) return;
    if (this.altAudio && this.audioOnly) return;
    const r2 = this.buffering ? t2.nextLoadLevel : t2.loadLevel;
    if (null == s2 || !s2[r2]) return;
    const n2 = s2[r2], a2 = this.getMainFwdBufferInfo();
    if (null === a2) return;
    const o2 = this.getLevelDetails();
    if (o2 && this._streamEnded(a2, o2)) {
      const t3 = {};
      return 2 === this.altAudio && (t3.type = "video"), this.hls.trigger(h.BUFFER_EOS, t3), void (this.state = $s);
    }
    if (!this.buffering) return;
    t2.loadLevel !== r2 && -1 === t2.manualLevel && this.log(`Adapting to level ${r2} from level ${this.level}`), this.level = t2.nextLoadLevel = r2;
    const l2 = n2.details;
    if (!l2 || this.state === Ks || this.waitForLive(n2)) return this.level = r2, this.state = Ks, void (this.startFragRequested = false);
    const d2 = a2.len, c2 = this.getMaxBufferLength(n2.maxBitrate);
    if (d2 >= c2) return;
    this.backtrackFragment && this.backtrackFragment.start > a2.end && (this.backtrackFragment = null);
    const u2 = this.backtrackFragment ? this.backtrackFragment.start : a2.end;
    let f2 = this.getNextFragment(u2, l2);
    if (this.couldBacktrack && !this.fragPrevious && f2 && $(f2) && this.fragmentTracker.getState(f2) !== ce) {
      var m2;
      const t3 = (null != (m2 = this.backtrackFragment) ? m2 : f2).sn - l2.startSN, e3 = l2.fragments[t3 - 1];
      e3 && f2.cc === e3.cc && (f2 = e3, this.fragmentTracker.removeFragment(e3));
    } else this.backtrackFragment && a2.len && (this.backtrackFragment = null);
    if (f2 && this.isLoopLoading(f2, u2)) {
      if (!f2.gap) {
        const t3 = this.audioOnly && !this.altAudio ? F : N, e3 = (t3 === N ? this.videoBuffer : this.mediaBuffer) || this.media;
        e3 && this.afterBufferFlushed(e3, t3, g);
      }
      f2 = this.getNextFragmentLoopLoading(f2, l2, a2, g, c2);
    }
    f2 && (this.exceedsMaxBuffer(a2, c2, f2) || (!f2.initSegment || f2.initSegment.data || this.bitrateTest || (f2 = f2.initSegment), this.loadFragment(f2, n2, u2)));
  }
  loadFragment(t2, e2, s2) {
    const i2 = this.fragmentTracker.getState(t2);
    i2 === le || i2 === de ? $(t2) ? this.bitrateTest ? (this.log(`Fragment ${t2.sn} of level ${t2.level} is being downloaded to test bitrate and will not be buffered`), this._loadBitrateTestFrag(t2, e2)) : super.loadFragment(t2, e2, s2) : this._loadInitSegment(t2, e2) : this.clearTrackerIfNeeded(t2);
  }
  getBufferedFrag(t2) {
    return this.fragmentTracker.getBufferedFrag(t2, g);
  }
  followingBufferedFrag(t2) {
    return t2 ? this.getBufferedFrag(t2.end + 0.5) : null;
  }
  immediateLevelSwitch() {
    var t2;
    this.abortCurrentFrag(), this.flushMainBuffer(0, Number.POSITIVE_INFINITY), 0 !== this.altAudio && ((null == (t2 = this.getLevelDetails()) ? void 0 : t2.fragmentStart) || 0) > this.lastCurrentTime && super.flushMainBuffer(0, Number.POSITIVE_INFINITY, "audio");
  }
  nextLevelSwitch() {
    const { levels: t2, media: e2 } = this;
    if (null != e2 && e2.readyState) {
      let s2;
      const i2 = this.getAppendedFrag(e2.currentTime);
      i2 && i2.start > 1 && this.flushMainBuffer(0, i2.start - 1);
      const r2 = this.getLevelDetails();
      if (null != r2 && r2.live) {
        const t3 = this.getMainFwdBufferInfo();
        if (!t3 || t3.len < 2 * r2.targetduration) return;
      }
      if (!e2.paused && t2) {
        const e3 = t2[this.hls.nextLoadLevel], i3 = this.fragLastKbps;
        s2 = i3 && this.fragCurrent ? this.fragCurrent.duration * e3.maxBitrate / (1e3 * i3) + 1 : 0;
      } else s2 = 0;
      const n2 = this.getBufferedFrag(e2.currentTime + s2);
      if (n2) {
        const t3 = this.followingBufferedFrag(n2);
        if (t3) {
          this.abortCurrentFrag();
          const e3 = t3.maxStartPTS ? t3.maxStartPTS : t3.start, s3 = t3.duration, i3 = Math.max(n2.end, e3 + Math.min(Math.max(s3 - this.config.maxFragLookUpTolerance, s3 * (this.couldBacktrack ? 0.5 : 0.125)), s3 * (this.couldBacktrack ? 0.75 : 0.25)));
          this.flushMainBuffer(i3, Number.POSITIVE_INFINITY);
        }
      }
    }
  }
  abortCurrentFrag() {
    const t2 = this.fragCurrent;
    switch (this.fragCurrent = null, this.backtrackFragment = null, t2 && (t2.abortRequests(), this.fragmentTracker.removeFragment(t2)), this.state) {
      case Ms:
      case xs:
      case Os:
      case Ns:
      case Bs:
        this.state = ws;
    }
    this.nextLoadPosition = this.getLoadPosition();
  }
  flushMainBuffer(t2, e2) {
    super.flushMainBuffer(t2, e2, 2 === this.altAudio ? "video" : null);
  }
  onMediaAttached(t2, e2) {
    super.onMediaAttached(t2, e2);
    const s2 = e2.media;
    Ds(s2, "playing", this.onMediaPlaying), Ds(s2, "seeked", this.onMediaSeeked);
  }
  onMediaDetaching(t2, e2) {
    const { media: s2 } = this;
    s2 && (_s(s2, "playing", this.onMediaPlaying), _s(s2, "seeked", this.onMediaSeeked)), this.videoBuffer = null, this.fragPlaying = null, super.onMediaDetaching(t2, e2), e2.transferMedia || (this._hasEnoughToStart = false);
  }
  onManifestLoading() {
    super.onManifestLoading(), this.log("Trigger BUFFER_RESET"), this.hls.trigger(h.BUFFER_RESET, void 0), this.couldBacktrack = false, this.fragLastKbps = 0, this.fragPlaying = this.backtrackFragment = null, this.altAudio = 0, this.audioOnly = false;
  }
  onManifestParsed(t2, e2) {
    let s2 = false, i2 = false;
    for (let t3 = 0; t3 < e2.levels.length; t3++) {
      const r2 = e2.levels[t3].audioCodec;
      r2 && (s2 = s2 || -1 !== r2.indexOf("mp4a.40.2"), i2 = i2 || -1 !== r2.indexOf("mp4a.40.5"));
    }
    this.audioCodecSwitch = s2 && i2 && !function() {
      var t3;
      const e3 = ca();
      return "function" == typeof (null == e3 || null == (t3 = e3.prototype) ? void 0 : t3.changeType);
    }(), this.audioCodecSwitch && this.log("Both AAC/HE-AAC audio found in levels; declaring level codec as HE-AAC"), this.levels = e2.levels, this.startFragRequested = false;
  }
  onLevelLoading(t2, e2) {
    const { levels: s2 } = this;
    if (!s2 || this.state !== ws) return;
    const i2 = e2.levelInfo;
    (!i2.details || i2.details.live && (this.levelLastLoaded !== i2 || i2.details.expired) || this.waitForCdnTuneIn(i2.details)) && (this.state = Ks);
  }
  onLevelLoaded(t2, e2) {
    var s2;
    const { levels: i2, startFragRequested: r2 } = this, n2 = e2.level, a2 = e2.details, o2 = a2.totalduration;
    if (!i2) return void this.warn(`Levels were reset while loading level ${n2}`);
    this.log(`Level ${n2} loaded [${a2.startSN},${a2.endSN}]${a2.lastPartSn ? `[part-${a2.lastPartSn}-${a2.lastPartIndex}]` : ""}, cc [${a2.startCC}, ${a2.endCC}] duration:${o2}`);
    const l2 = e2.levelInfo, d2 = this.fragCurrent;
    !d2 || this.state !== xs && this.state !== Os || d2.level !== e2.level && d2.loader && this.abortCurrentFrag();
    let c2 = 0;
    if (a2.live || null != (s2 = l2.details) && s2.live) {
      var u2;
      if (this.checkLiveUpdate(a2), a2.deltaUpdateFailed) return;
      c2 = this.alignPlaylists(a2, l2.details, null == (u2 = this.levelLastLoaded) ? void 0 : u2.details);
    }
    if (l2.details = a2, this.levelLastLoaded = l2, r2 || this.setStartPosition(a2, c2), this.hls.trigger(h.LEVEL_UPDATED, { details: a2, level: n2 }), this.state === Ks) {
      if (this.waitForCdnTuneIn(a2)) return;
      this.state = ws;
    }
    r2 && a2.live && this.synchronizeToLiveEdge(a2), this.tick();
  }
  synchronizeToLiveEdge(t2) {
    const { config: e2, media: s2 } = this;
    if (!s2) return;
    const i2 = this.hls.liveSyncPosition, r2 = this.getLoadPosition(), n2 = t2.fragmentStart, a2 = t2.edge, o2 = r2 >= n2 - e2.maxFragLookUpTolerance && r2 <= a2;
    if (null !== i2 && s2.duration > i2 && (r2 < i2 || !o2)) {
      const n3 = void 0 !== e2.liveMaxLatencyDuration ? e2.liveMaxLatencyDuration : e2.liveMaxLatencyDurationCount * t2.targetduration;
      if ((!o2 && s2.readyState < 4 || r2 < a2 - n3) && (this._hasEnoughToStart || (this.nextLoadPosition = i2), s2.readyState)) if (this.warn(`Playback: ${r2.toFixed(3)} is located too far from the end of live sliding playlist: ${a2}, reset currentTime to : ${i2.toFixed(3)}`), "buffered" === this.config.liveSyncMode) {
        var l2;
        const t3 = BufferHelper.bufferInfo(s2, i2, 0);
        if (null == (l2 = t3.buffered) || !l2.length) return void (s2.currentTime = i2);
        if (t3.start <= r2) return void (s2.currentTime = i2);
        const { nextStart: e3 } = BufferHelper.bufferedInfo(t3.buffered, r2, 0);
        e3 && (s2.currentTime = e3);
      } else s2.currentTime = i2;
    }
  }
  _handleFragmentLoadProgress(t2) {
    var e2;
    const s2 = t2.frag, { part: i2, payload: r2 } = t2, { levels: n2 } = this;
    if (!n2) return void this.warn(`Levels were reset while fragment load was in progress. Fragment ${s2.sn} of level ${s2.level} will not be buffered`);
    const a2 = n2[s2.level];
    if (!a2) return void this.warn(`Level ${s2.level} not found on progress`);
    const o2 = a2.details;
    if (!o2) return this.warn(`Dropping fragment ${s2.sn} of level ${s2.level} after level details were reset`), void this.fragmentTracker.removeFragment(s2);
    const l2 = a2.videoCodec, h2 = o2.PTSKnown || !o2.live, d2 = null == (e2 = s2.initSegment) ? void 0 : e2.data, c2 = this._getAudioCodec(a2), u2 = this.transmuxer = this.transmuxer || new TransmuxerInterface(this.hls, g, this._handleTransmuxComplete.bind(this), this._handleTransmuxerFlush.bind(this)), f2 = i2 ? i2.index : -1, m2 = -1 !== f2, p2 = new ChunkMetadata(s2.level, s2.sn, s2.stats.chunkCount, r2.byteLength, f2, m2), v2 = this.initPTS[s2.cc];
    u2.push(r2, d2, c2, l2, s2, i2, o2.totalduration, h2, p2, v2);
  }
  onAudioTrackSwitching(t2, e2) {
    const s2 = this.hls, i2 = 0 !== this.altAudio;
    if (jt(e2.url, s2)) this.altAudio = 1;
    else {
      if (this.mediaBuffer !== this.media) {
        this.log("Switching on main audio, use media.buffered to schedule main fragment loading"), this.mediaBuffer = this.media;
        const t3 = this.fragCurrent;
        t3 && (this.log("Switching to main audio track, cancel main fragment load"), t3.abortRequests(), this.fragmentTracker.removeFragment(t3)), this.resetTransmuxer(), this.resetLoadingState();
      } else this.audioOnly && this.resetTransmuxer();
      if (i2) return this.altAudio = 0, this.fragmentTracker.removeAllFragments(), s2.once(h.BUFFER_FLUSHED, () => {
        this.hls && this.hls.trigger(h.AUDIO_TRACK_SWITCHED, e2);
      }), void s2.trigger(h.BUFFER_FLUSHING, { startOffset: 0, endOffset: Number.POSITIVE_INFINITY, type: null });
      s2.trigger(h.AUDIO_TRACK_SWITCHED, e2);
    }
  }
  onAudioTrackSwitched(t2, e2) {
    const s2 = jt(e2.url, this.hls);
    if (s2) {
      const t3 = this.videoBuffer;
      t3 && this.mediaBuffer !== t3 && (this.log("Switching on alternate audio, use video.buffered to schedule main fragment loading"), this.mediaBuffer = t3);
    }
    this.altAudio = s2 ? 2 : 0, this.tick();
  }
  onBufferCreated(t2, e2) {
    const s2 = e2.tracks;
    let i2, r2, n2 = false;
    for (const t3 in s2) {
      const e3 = s2[t3];
      if ("main" === e3.id) {
        if (r2 = t3, i2 = e3, "video" === t3) {
          const e4 = s2[t3];
          e4 && (this.videoBuffer = e4.buffer);
        }
      } else n2 = true;
    }
    n2 && i2 ? (this.log(`Alternate track found, use ${r2}.buffered to schedule main fragment loading`), this.mediaBuffer = i2.buffer) : this.mediaBuffer = this.media;
  }
  onFragBuffered(t2, e2) {
    const { frag: s2, part: i2 } = e2, r2 = s2.type === g;
    if (r2) {
      if (this.fragContextChanged(s2)) return this.warn(`Fragment ${s2.sn}${i2 ? " p: " + i2.index : ""} of level ${s2.level} finished buffering, but was aborted. state: ${this.state}`), void (this.state === Bs && (this.state = ws));
      const t3 = i2 ? i2.stats : s2.stats;
      this.fragLastKbps = Math.round(8 * t3.total / (t3.buffering.end - t3.loading.first)), $(s2) && (this.fragPrevious = s2), this.fragBufferedComplete(s2, i2);
    }
    const n2 = this.media;
    n2 && (!this._hasEnoughToStart && BufferHelper.getBuffered(n2).length && (this._hasEnoughToStart = true, this.seekToStartPos()), r2 && this.tick());
  }
  get hasEnoughToStart() {
    return this._hasEnoughToStart;
  }
  onError(t2, e2) {
    var s2;
    if (e2.fatal) this.state = Us;
    else switch (e2.details) {
      case l.FRAG_GAP:
      case l.FRAG_PARSING_ERROR:
      case l.FRAG_DECRYPT_ERROR:
      case l.FRAG_LOAD_ERROR:
      case l.FRAG_LOAD_TIMEOUT:
      case l.KEY_LOAD_ERROR:
      case l.KEY_LOAD_TIMEOUT:
        this.onFragmentOrKeyLoadError(g, e2);
        break;
      case l.LEVEL_LOAD_ERROR:
      case l.LEVEL_LOAD_TIMEOUT:
      case l.LEVEL_PARSING_ERROR:
        e2.levelRetry || this.state !== Ks || (null == (s2 = e2.context) ? void 0 : s2.type) !== c || (this.state = ws);
        break;
      case l.BUFFER_ADD_CODEC_ERROR:
      case l.BUFFER_APPEND_ERROR:
        if ("main" !== e2.parent) return;
        this.reduceLengthAndFlushBuffer(e2) && this.resetLoadingState();
        break;
      case l.BUFFER_FULL_ERROR:
        if ("main" !== e2.parent) return;
        this.reduceLengthAndFlushBuffer(e2) && (!this.config.interstitialsController && this.config.assetPlayerId ? this._hasEnoughToStart = true : this.flushMainBuffer(0, Number.POSITIVE_INFINITY));
        break;
      case l.INTERNAL_EXCEPTION:
        this.recoverWorkerError(e2);
    }
  }
  onFragLoadEmergencyAborted() {
    this.state = ws, this._hasEnoughToStart || (this.startFragRequested = false, this.nextLoadPosition = this.lastCurrentTime), this.tickImmediate();
  }
  onBufferFlushed(t2, { type: e2 }) {
    if (e2 !== F || !this.altAudio) {
      const t3 = (e2 === N ? this.videoBuffer : this.mediaBuffer) || this.media;
      t3 && (this.afterBufferFlushed(t3, e2, g), this.tick());
    }
  }
  onLevelsUpdated(t2, e2) {
    this.level > -1 && this.fragCurrent && (this.level = this.fragCurrent.level, -1 === this.level && this.resetWhenMissingContext(this.fragCurrent)), this.levels = e2.levels;
  }
  swapAudioCodec() {
    this.audioCodecSwap = !this.audioCodecSwap;
  }
  seekToStartPos() {
    const { media: t2 } = this;
    if (!t2) return;
    const e2 = t2.currentTime;
    let s2 = this.startPosition;
    if (s2 >= 0 && e2 < s2) {
      if (t2.seeking) return void this.log(`could not seek to ${s2}, already seeking at ${e2}`);
      const i2 = this.timelineOffset;
      i2 && s2 && (s2 += i2);
      const r2 = this.getLevelDetails(), n2 = BufferHelper.getBuffered(t2), a2 = n2.length ? n2.start(0) : 0, o2 = a2 - s2, l2 = Math.max(this.config.maxBufferHole, this.config.maxFragLookUpTolerance);
      (this.config.startOnSegmentBoundary || o2 > 0 && (o2 < l2 || this.loadingParts && o2 < 2 * ((null == r2 ? void 0 : r2.partTarget) || 0))) && (this.log(`adjusting start position by ${o2} to match buffer start`), s2 += o2, this.startPosition = s2), e2 < s2 && (this.log(`seek to target start position ${s2} from current time ${e2} buffer start ${a2}`), t2.currentTime = s2);
    }
  }
  _getAudioCodec(t2) {
    let e2 = this.config.defaultAudioCodec || t2.audioCodec;
    return this.audioCodecSwap && e2 && (this.log("Swapping audio codec"), e2 = -1 !== e2.indexOf("mp4a.40.5") ? "mp4a.40.2" : "mp4a.40.5"), e2;
  }
  _loadBitrateTestFrag(t2, e2) {
    t2.bitrateTest = true, this._doFragLoad(t2, e2).then((t3) => {
      const { hls: s2 } = this, i2 = null == t3 ? void 0 : t3.frag;
      if (!i2 || this.fragContextChanged(i2)) return;
      e2.fragmentError = 0, this.state = ws, this.startFragRequested = false, this.bitrateTest = false;
      const r2 = i2.stats;
      r2.parsing.start = r2.parsing.end = r2.buffering.start = r2.buffering.end = self.performance.now(), s2.trigger(h.FRAG_LOADED, t3), i2.bitrateTest = false;
    }).catch((e3) => {
      this.state !== Cs && this.state !== Us && (this.warn(e3), this.resetFragmentLoading(t2));
    });
  }
  _handleTransmuxComplete(t2) {
    const e2 = this.playlistType, { hls: s2 } = this, { remuxResult: i2, chunkMeta: n2 } = t2, a2 = this.getCurrentContext(n2);
    if (!a2) return void this.resetWhenMissingContext(n2);
    const { frag: o2, part: l2, level: d2 } = a2, { video: c2, text: u2, id3: f2, initSegment: g2 } = i2, { details: m2 } = d2, p2 = this.altAudio ? void 0 : i2.audio;
    if (this.fragContextChanged(o2)) this.fragmentTracker.removeFragment(o2);
    else {
      if (this.state = Ns, g2) {
        const t3 = g2.tracks;
        if (t3) {
          const i4 = o2.initSegment || o2;
          if (this.unhandledEncryptionError(g2, o2)) return;
          this._bufferInitSegment(d2, t3, i4, n2), s2.trigger(h.FRAG_PARSING_INIT_SEGMENT, { frag: i4, id: e2, tracks: t3 });
        }
        const i3 = g2.initPTS, a3 = g2.timescale, l3 = this.initPTS[o2.cc];
        if (r(i3) && (!l3 || l3.baseTime !== i3 || l3.timescale !== a3)) {
          const t4 = g2.trackId;
          this.initPTS[o2.cc] = { baseTime: i3, timescale: a3, trackId: t4 }, s2.trigger(h.INIT_PTS_FOUND, { frag: o2, id: e2, initPTS: i3, timescale: a3, trackId: t4 });
        }
      }
      if (c2 && m2) {
        p2 && "audiovideo" === c2.type && this.logMuxedErr(o2);
        const t3 = m2.fragments[o2.sn - 1 - m2.startSN], e3 = o2.sn === m2.startSN, s3 = !t3 || o2.cc > t3.cc;
        if (false !== i2.independent) {
          const { startPTS: t4, endPTS: i3, startDTS: r2, endDTS: a3 } = c2;
          if (l2) l2.elementaryStreams[c2.type] = { startPTS: t4, endPTS: i3, startDTS: r2, endDTS: a3 };
          else if (c2.firstKeyFrame && c2.independent && 1 === n2.id && !s3 && (this.couldBacktrack = true), c2.dropped && c2.independent) {
            const r3 = this.getMainFwdBufferInfo(), n3 = (r3 ? r3.end : this.getLoadPosition()) + this.config.maxBufferHole, l3 = c2.firstKeyFramePTS ? c2.firstKeyFramePTS : t4;
            if (!e3 && n3 < l3 - this.config.maxBufferHole && !s3) return void this.backtrack(o2);
            s3 && (o2.gap = true), o2.setElementaryStreamInfo(c2.type, o2.start, i3, o2.start, a3, true);
          } else e3 && t4 - (m2.appliedTimelineOffset || 0) > 2 && (o2.gap = true);
          o2.setElementaryStreamInfo(c2.type, t4, i3, r2, a3), this.backtrackFragment && (this.backtrackFragment = o2), this.bufferFragmentData(c2, o2, l2, n2, e3 || s3);
        } else {
          if (!e3 && !s3) return void this.backtrack(o2);
          o2.gap = true;
        }
      }
      if (p2) {
        const { startPTS: t3, endPTS: e3, startDTS: s3, endDTS: i3 } = p2;
        l2 && (l2.elementaryStreams[F] = { startPTS: t3, endPTS: e3, startDTS: s3, endDTS: i3 }), o2.setElementaryStreamInfo(F, t3, e3, s3, i3), this.bufferFragmentData(p2, o2, l2, n2);
      }
      if (m2 && null != f2 && f2.samples.length) {
        const t3 = { id: e2, frag: o2, details: m2, samples: f2.samples };
        s2.trigger(h.FRAG_PARSING_METADATA, t3);
      }
      if (m2 && u2) {
        const t3 = { id: e2, frag: o2, details: m2, samples: u2.samples };
        s2.trigger(h.FRAG_PARSING_USERDATA, t3);
      }
    }
  }
  logMuxedErr(t2) {
    this.warn(`${$(t2) ? "Media" : "Init"} segment with muxed audiovideo where only video expected: ${t2.url}`);
  }
  _bufferInitSegment(t2, e2, s2, i2) {
    if (this.state !== Ns) return;
    this.audioOnly = !!e2.audio && !e2.video, this.altAudio && !this.audioOnly && (delete e2.audio, e2.audiovideo && this.logMuxedErr(s2));
    const { audio: r2, video: n2, audiovideo: a2 } = e2;
    if (r2) {
      const s3 = t2.audioCodec;
      let i3 = At(r2.codec, s3);
      "mp4a" === i3 && (i3 = "mp4a.40.5");
      const n3 = navigator.userAgent.toLowerCase();
      if (this.audioCodecSwitch) {
        i3 && (i3 = -1 !== i3.indexOf("mp4a.40.5") ? "mp4a.40.2" : "mp4a.40.5");
        const t3 = r2.metadata;
        t3 && "channelCount" in t3 && 1 !== (t3.channelCount || 1) && -1 === n3.indexOf("firefox") && (i3 = "mp4a.40.5");
      }
      i3 && -1 !== i3.indexOf("mp4a.40.5") && -1 !== n3.indexOf("android") && "audio/mpeg" !== r2.container && (i3 = "mp4a.40.2", this.log(`Android: force audio codec to ${i3}`)), s3 && s3 !== i3 && this.log(`Swapping manifest audio codec "${s3}" for "${i3}"`), r2.levelCodec = i3, r2.id = g, this.log(`Init audio buffer, container:${r2.container}, codecs[selected/level/parsed]=[${i3 || ""}/${s3 || ""}/${r2.codec}]`), delete e2.audiovideo;
    }
    if (n2) {
      n2.levelCodec = t2.videoCodec, n2.id = g;
      const s3 = n2.codec;
      if (4 === (null == s3 ? void 0 : s3.length)) switch (s3) {
        case "hvc1":
        case "hev1":
          n2.codec = "hvc1.1.6.L120.90";
          break;
        case "av01":
          n2.codec = "av01.0.04M.08";
          break;
        case "avc1":
          n2.codec = "avc1.42e01e";
      }
      this.log(`Init video buffer, container:${n2.container}, codecs[level/parsed]=[${t2.videoCodec || ""}/${s3}]${n2.codec !== s3 ? " parsed-corrected=" + n2.codec : ""}${n2.supplemental ? " supplemental=" + n2.supplemental : ""}`), delete e2.audiovideo;
    }
    a2 && (this.log(`Init audiovideo buffer, container:${a2.container}, codecs[level/parsed]=[${t2.codecs}/${a2.codec}]`), delete e2.video, delete e2.audio);
    const o2 = Object.keys(e2);
    if (o2.length) {
      if (this.hls.trigger(h.BUFFER_CODECS, e2), !this.hls) return;
      o2.forEach((t3) => {
        const r3 = e2[t3].initSegment;
        null != r3 && r3.byteLength && this.hls.trigger(h.BUFFER_APPENDING, { type: t3, data: r3, frag: s2, part: null, chunkMeta: i2, parent: s2.type });
      });
    }
    this.tickImmediate();
  }
  getMainFwdBufferInfo() {
    const t2 = this.mediaBuffer && 2 === this.altAudio ? this.mediaBuffer : this.media;
    return this.getFwdBufferInfo(t2, g);
  }
  get maxBufferLength() {
    const { levels: t2, level: e2 } = this, s2 = null == t2 ? void 0 : t2[e2];
    return s2 ? this.getMaxBufferLength(s2.maxBitrate) : this.config.maxBufferLength;
  }
  backtrack(t2) {
    this.couldBacktrack = true, this.backtrackFragment = t2, this.resetTransmuxer(), this.flushBufferGap(t2), this.fragmentTracker.removeFragment(t2), this.fragPrevious = null, this.nextLoadPosition = t2.start, this.state = ws;
  }
  checkFragmentChanged() {
    const t2 = this.media;
    let e2 = null;
    if (t2 && t2.readyState > 1 && false === t2.seeking) {
      const s2 = t2.currentTime;
      if (BufferHelper.isBuffered(t2, s2) ? e2 = this.getAppendedFrag(s2) : BufferHelper.isBuffered(t2, s2 + 0.1) && (e2 = this.getAppendedFrag(s2 + 0.1)), e2) {
        this.backtrackFragment = null;
        const t3 = this.fragPlaying, s3 = e2.level;
        t3 && e2.sn === t3.sn && t3.level === s3 || (this.fragPlaying = e2, this.hls.trigger(h.FRAG_CHANGED, { frag: e2 }), t3 && t3.level === s3 || this.hls.trigger(h.LEVEL_SWITCHED, { level: s3 }));
      }
    }
  }
  get nextLevel() {
    const t2 = this.nextBufferedFrag;
    return t2 ? t2.level : -1;
  }
  get currentFrag() {
    var t2;
    if (this.fragPlaying) return this.fragPlaying;
    const e2 = (null == (t2 = this.media) ? void 0 : t2.currentTime) || this.lastCurrentTime;
    return r(e2) ? this.getAppendedFrag(e2) : null;
  }
  get currentProgramDateTime() {
    var t2;
    const e2 = (null == (t2 = this.media) ? void 0 : t2.currentTime) || this.lastCurrentTime;
    if (r(e2)) {
      const t3 = this.getLevelDetails(), s2 = this.currentFrag || (t3 ? Xt(null, t3.fragments, e2) : null);
      if (s2) {
        const t4 = s2.programDateTime;
        if (null !== t4) {
          const i2 = t4 + 1e3 * (e2 - s2.start);
          return new Date(i2);
        }
      }
    }
    return null;
  }
  get currentLevel() {
    const t2 = this.currentFrag;
    return t2 ? t2.level : -1;
  }
  get nextBufferedFrag() {
    const t2 = this.currentFrag;
    return t2 ? this.followingBufferedFrag(t2) : null;
  }
  get forceStartLoad() {
    return this._forceStartLoad;
  }
}
class KeyLoader extends Logger {
  constructor(t2, e2) {
    super("key-loader", e2), this.config = void 0, this.keyIdToKeyInfo = {}, this.emeController = null, this.config = t2;
  }
  abort(t2) {
    for (const s2 in this.keyIdToKeyInfo) {
      const i2 = this.keyIdToKeyInfo[s2].loader;
      if (i2) {
        var e2;
        if (t2 && t2 !== (null == (e2 = i2.context) ? void 0 : e2.frag.type)) return;
        i2.abort();
      }
    }
  }
  detach() {
    for (const t2 in this.keyIdToKeyInfo) {
      const e2 = this.keyIdToKeyInfo[t2];
      (e2.mediaKeySessionContext || e2.decryptdata.isCommonEncryption) && delete this.keyIdToKeyInfo[t2];
    }
  }
  destroy() {
    this.detach();
    for (const t2 in this.keyIdToKeyInfo) {
      const e2 = this.keyIdToKeyInfo[t2].loader;
      e2 && e2.destroy();
    }
    this.keyIdToKeyInfo = {};
  }
  createKeyLoadError(t2, e2 = l.KEY_LOAD_ERROR, s2, i2, r2) {
    return new LoadError({ type: o.NETWORK_ERROR, details: e2, fatal: false, frag: t2, response: r2, error: s2, networkDetails: i2 });
  }
  loadClear(t2, e2, s2) {
    if (this.emeController && this.config.emeEnabled && !this.emeController.getSelectedKeySystemFormats().length) {
      if (e2.length) for (let i2 = 0, r2 = e2.length; i2 < r2; i2++) {
        const n2 = e2[i2];
        if (t2.cc <= n2.cc && (!$(t2) || !$(n2) || t2.sn < n2.sn) || !s2 && i2 == r2 - 1) return this.emeController.selectKeySystemFormat(n2).then((t3) => {
          if (!this.emeController) return;
          n2.setKeyFormat(t3);
          const e3 = Ke(t3);
          return e3 ? this.emeController.getKeySystemAccess([e3]) : void 0;
        });
      }
      if (this.config.requireKeySystemAccessOnStart) {
        const t3 = Ve(this.config);
        if (t3.length) return this.emeController.getKeySystemAccess(t3);
      }
    }
    return null;
  }
  load(t2) {
    return !t2.decryptdata && t2.encrypted && this.emeController && this.config.emeEnabled ? this.emeController.selectKeySystemFormat(t2).then((e2) => this.loadInternal(t2, e2)) : this.loadInternal(t2);
  }
  loadInternal(t2, e2) {
    var s2, i2;
    e2 && t2.setKeyFormat(e2);
    const r2 = t2.decryptdata;
    if (!r2) {
      const s3 = new Error(e2 ? `Expected frag.decryptdata to be defined after setting format ${e2}` : `Missing decryption data on fragment in onKeyLoading (emeEnabled with controller: ${this.emeController && this.config.emeEnabled})`);
      return Promise.reject(this.createKeyLoadError(t2, l.KEY_LOAD_ERROR, s3));
    }
    const n2 = r2.uri;
    if (!n2) return Promise.reject(this.createKeyLoadError(t2, l.KEY_LOAD_ERROR, new Error(`Invalid key URI: "${n2}"`)));
    const a2 = fa(r2);
    let o2 = this.keyIdToKeyInfo[a2];
    if (null != (s2 = o2) && s2.decryptdata.key) return r2.key = o2.decryptdata.key, Promise.resolve({ frag: t2, keyInfo: o2 });
    if (this.emeController && null != (i2 = o2) && i2.keyLoadPromise) switch (this.emeController.getKeyStatus(o2.decryptdata)) {
      case "usable":
      case "usable-in-future":
        return o2.keyLoadPromise.then((e3) => {
          const { keyInfo: s3 } = e3;
          return r2.key = s3.decryptdata.key, { frag: t2, keyInfo: s3 };
        });
    }
    switch (this.log(`${this.keyIdToKeyInfo[a2] ? "Rel" : "L"}oading${r2.keyId ? " keyId: " + _(r2.keyId) : ""} URI: ${r2.uri} from ${t2.type} ${t2.level}`), o2 = this.keyIdToKeyInfo[a2] = { decryptdata: r2, keyLoadPromise: null, loader: null, mediaKeySessionContext: null }, r2.method) {
      case "SAMPLE-AES":
      case "SAMPLE-AES-CENC":
      case "SAMPLE-AES-CTR":
        return "identity" === r2.keyFormat ? this.loadKeyHTTP(o2, t2) : this.loadKeyEME(o2, t2);
      case "AES-128":
      case "AES-256":
      case "AES-256-CTR":
        return this.loadKeyHTTP(o2, t2);
      default:
        return Promise.reject(this.createKeyLoadError(t2, l.KEY_LOAD_ERROR, new Error(`Key supplied with unsupported METHOD: "${r2.method}"`)));
    }
  }
  loadKeyEME(t2, e2) {
    const s2 = { frag: e2, keyInfo: t2 };
    if (this.emeController && this.config.emeEnabled) {
      var i2;
      if (!t2.decryptdata.keyId && null != (i2 = e2.initSegment) && i2.data) {
        const s3 = function(t3) {
          const e3 = [];
          return it(t3, (t4) => e3.push(t4.subarray(8, 24))), e3;
        }(e2.initSegment.data);
        if (s3.length) {
          let e3 = s3[0];
          e3.some((t3) => 0 !== t3) ? (this.log(`Using keyId found in init segment ${_(e3)}`), LevelKey.setKeyIdForUri(t2.decryptdata.uri, e3)) : (e3 = LevelKey.addKeyIdForUri(t2.decryptdata.uri), this.log(`Generating keyId to patch media ${_(e3)}`)), t2.decryptdata.keyId = e3;
        }
      }
      if (!t2.decryptdata.keyId && !$(e2)) return Promise.resolve(s2);
      const r2 = this.emeController.loadKey(s2);
      return (t2.keyLoadPromise = r2.then((e3) => (t2.mediaKeySessionContext = e3, s2))).catch((s3) => {
        throw t2.keyLoadPromise = null, "data" in s3 && (s3.data.frag = e2), s3;
      });
    }
    return Promise.resolve(s2);
  }
  loadKeyHTTP(t2, e2) {
    const s2 = this.config, i2 = new (0, s2.loader)(s2);
    return e2.keyLoader = t2.loader = i2, t2.keyLoadPromise = new Promise((r2, n2) => {
      const a2 = { keyInfo: t2, frag: e2, responseType: "arraybuffer", url: t2.decryptdata.uri }, o2 = s2.keyLoadPolicy.default, h2 = { loadPolicy: o2, timeout: o2.maxLoadTimeMs, maxRetry: 0, retryDelay: 0, maxRetryDelay: 0 }, d2 = { onSuccess: (t3, e3, s3, i3) => {
        const { frag: a3, keyInfo: o3 } = s3, h3 = fa(o3.decryptdata);
        if (!a3.decryptdata || o3 !== this.keyIdToKeyInfo[h3]) return n2(this.createKeyLoadError(a3, l.KEY_LOAD_ERROR, new Error("after key load, decryptdata unset or changed"), i3));
        o3.decryptdata.key = a3.decryptdata.key = new Uint8Array(t3.data), a3.keyLoader = null, o3.loader = null, r2({ frag: a3, keyInfo: o3 });
      }, onError: (t3, s3, i3, r3) => {
        this.resetLoader(s3), n2(this.createKeyLoadError(e2, l.KEY_LOAD_ERROR, new Error(`HTTP Error ${t3.code} loading key ${t3.text}`), i3, T({ url: a2.url, data: void 0 }, t3)));
      }, onTimeout: (t3, s3, i3) => {
        this.resetLoader(s3), n2(this.createKeyLoadError(e2, l.KEY_LOAD_TIMEOUT, new Error("key loading timed out"), i3));
      }, onAbort: (t3, s3, i3) => {
        this.resetLoader(s3), n2(this.createKeyLoadError(e2, l.INTERNAL_ABORTED, new Error("key loading aborted"), i3));
      } };
      i2.load(a2, h2, d2);
    });
  }
  resetLoader(t2) {
    const { frag: e2, keyInfo: s2, url: i2 } = t2, r2 = s2.loader;
    e2.keyLoader === r2 && (e2.keyLoader = null, s2.loader = null);
    const n2 = fa(s2.decryptdata) || i2;
    delete this.keyIdToKeyInfo[n2], r2 && r2.destroy();
  }
}
function fa(t2) {
  if (t2.keyFormat !== $e) {
    const e2 = t2.keyId;
    if (e2) return _(e2);
  }
  return t2.uri;
}
function ga(t2) {
  const { type: e2 } = t2;
  switch (e2) {
    case u:
      return m;
    case f:
      return p;
    default:
      return g;
  }
}
function ma(t2, e2) {
  let s2 = t2.url;
  return void 0 !== s2 && 0 !== s2.indexOf("data:") || (s2 = e2.url), s2;
}
class PlaylistLoader {
  constructor(t2) {
    this.hls = void 0, this.loaders = /* @__PURE__ */ Object.create(null), this.variableList = null, this.onManifestLoaded = this.checkAutostartLoad, this.hls = t2, this.registerListeners();
  }
  startLoad(t2) {
  }
  stopLoad() {
    this.destroyInternalLoaders();
  }
  registerListeners() {
    const { hls: t2 } = this;
    t2.on(h.MANIFEST_LOADING, this.onManifestLoading, this), t2.on(h.LEVEL_LOADING, this.onLevelLoading, this), t2.on(h.AUDIO_TRACK_LOADING, this.onAudioTrackLoading, this), t2.on(h.SUBTITLE_TRACK_LOADING, this.onSubtitleTrackLoading, this), t2.on(h.LEVELS_UPDATED, this.onLevelsUpdated, this);
  }
  unregisterListeners() {
    const { hls: t2 } = this;
    t2.off(h.MANIFEST_LOADING, this.onManifestLoading, this), t2.off(h.LEVEL_LOADING, this.onLevelLoading, this), t2.off(h.AUDIO_TRACK_LOADING, this.onAudioTrackLoading, this), t2.off(h.SUBTITLE_TRACK_LOADING, this.onSubtitleTrackLoading, this), t2.off(h.LEVELS_UPDATED, this.onLevelsUpdated, this);
  }
  createInternalLoader(t2) {
    const e2 = this.hls.config, s2 = e2.pLoader, i2 = e2.loader, r2 = new (s2 || i2)(e2);
    return this.loaders[t2.type] = r2, r2;
  }
  getInternalLoader(t2) {
    return this.loaders[t2.type];
  }
  resetInternalLoader(t2) {
    this.loaders[t2] && delete this.loaders[t2];
  }
  destroyInternalLoaders() {
    for (const t2 in this.loaders) {
      const e2 = this.loaders[t2];
      e2 && e2.destroy(), this.resetInternalLoader(t2);
    }
  }
  destroy() {
    this.variableList = null, this.unregisterListeners(), this.destroyInternalLoaders();
  }
  onManifestLoading(t2, e2) {
    const { url: s2 } = e2;
    this.variableList = null, this.load({ id: null, level: 0, responseType: "text", type: d, url: s2, deliveryDirectives: null, levelOrTrack: null });
  }
  onLevelLoading(t2, e2) {
    const { id: s2, level: i2, pathwayId: r2, url: n2, deliveryDirectives: a2, levelInfo: o2 } = e2;
    this.load({ id: s2, level: i2, pathwayId: r2, responseType: "text", type: c, url: n2, deliveryDirectives: a2, levelOrTrack: o2 });
  }
  onAudioTrackLoading(t2, e2) {
    const { id: s2, groupId: i2, url: r2, deliveryDirectives: n2, track: a2 } = e2;
    this.load({ id: s2, groupId: i2, level: null, responseType: "text", type: u, url: r2, deliveryDirectives: n2, levelOrTrack: a2 });
  }
  onSubtitleTrackLoading(t2, e2) {
    const { id: s2, groupId: i2, url: r2, deliveryDirectives: n2, track: a2 } = e2;
    this.load({ id: s2, groupId: i2, level: null, responseType: "text", type: f, url: r2, deliveryDirectives: n2, levelOrTrack: a2 });
  }
  onLevelsUpdated(t2, e2) {
    const s2 = this.loaders[c];
    if (s2) {
      const t3 = s2.context;
      t3 && !e2.levels.some((e3) => e3 === t3.levelOrTrack) && (s2.abort(), delete this.loaders[c]);
    }
  }
  load(t2) {
    var e2;
    const s2 = this.hls.config;
    let i2, n2 = this.getInternalLoader(t2);
    if (n2) {
      const e3 = this.hls.logger, s3 = n2.context;
      if (s3 && s3.levelOrTrack === t2.levelOrTrack && (s3.url === t2.url || s3.deliveryDirectives && !t2.deliveryDirectives)) return void (s3.url === t2.url ? e3.log(`[playlist-loader]: ignore ${t2.url} ongoing request`) : e3.log(`[playlist-loader]: ignore ${t2.url} in favor of ${s3.url}`));
      e3.log(`[playlist-loader]: aborting previous loader for type: ${t2.type}`), n2.abort();
    }
    if (i2 = t2.type === d ? s2.manifestLoadPolicy.default : y({}, s2.playlistLoadPolicy.default, { timeoutRetry: null, errorRetry: null }), n2 = this.createInternalLoader(t2), r(null == (e2 = t2.deliveryDirectives) ? void 0 : e2.part)) {
      let e3;
      if (t2.type === c && null !== t2.level ? e3 = this.hls.levels[t2.level].details : t2.type === u && null !== t2.id ? e3 = this.hls.audioTracks[t2.id].details : t2.type === f && null !== t2.id && (e3 = this.hls.subtitleTracks[t2.id].details), e3) {
        const t3 = e3.partTarget, s3 = e3.targetduration;
        if (t3 && s3) {
          const e4 = 1e3 * Math.max(3 * t3, 0.8 * s3);
          i2 = y({}, i2, { maxTimeToFirstByteMs: Math.min(e4, i2.maxTimeToFirstByteMs), maxLoadTimeMs: Math.min(e4, i2.maxTimeToFirstByteMs) });
        }
      }
    }
    const a2 = i2.errorRetry || i2.timeoutRetry || {}, o2 = { loadPolicy: i2, timeout: i2.maxLoadTimeMs, maxRetry: a2.maxNumRetry || 0, retryDelay: a2.retryDelayMs || 0, maxRetryDelay: a2.maxRetryDelayMs || 0 }, l2 = { onSuccess: (t3, e3, s3, i3) => {
      const r2 = this.getInternalLoader(s3);
      this.resetInternalLoader(s3.type);
      const n3 = t3.data;
      e3.parsing.start = performance.now(), M3U8Parser.isMediaPlaylist(n3) || s3.type !== d ? this.handleTrackOrLevelPlaylist(t3, e3, s3, i3 || null, r2) : this.handleMasterPlaylist(t3, e3, s3, i3);
    }, onError: (t3, e3, s3, i3) => {
      this.handleNetworkError(e3, s3, false, t3, i3);
    }, onTimeout: (t3, e3, s3) => {
      this.handleNetworkError(e3, s3, true, void 0, t3);
    } };
    n2.load(t2, o2, l2);
  }
  checkAutostartLoad() {
    if (!this.hls) return;
    const { config: { autoStartLoad: t2, startPosition: e2 }, forceStartLoad: s2 } = this.hls;
    (t2 || s2) && (this.hls.logger.log(`${t2 ? "auto" : "force"} startLoad with configured startPosition ${e2}`), this.hls.startLoad(e2));
  }
  handleMasterPlaylist(t2, e2, s2, i2) {
    const r2 = this.hls, n2 = t2.data, a2 = ma(t2, s2), o2 = M3U8Parser.parseMasterPlaylist(n2, a2);
    if (o2.playlistParsingError) return e2.parsing.end = performance.now(), void this.handleManifestParsingError(t2, s2, o2.playlistParsingError, i2, e2);
    const { contentSteering: l2, levels: d2, sessionData: c2, sessionKeys: u2, startTimeOffset: f2, variableList: g2 } = o2;
    this.variableList = g2, d2.forEach((t3) => {
      const { unknownCodecs: e3 } = t3;
      if (e3) {
        const { preferManagedMediaSource: s3 } = this.hls.config;
        let { audioCodec: i3, videoCodec: r3 } = t3;
        for (let n3 = e3.length; n3--; ) {
          const a3 = e3[n3];
          mt(a3, "audio", s3) ? (t3.audioCodec = i3 = i3 ? `${i3},${a3}` : a3, ft.audio[i3.substring(0, 4)] = 2, e3.splice(n3, 1)) : mt(a3, "video", s3) && (t3.videoCodec = r3 = r3 ? `${r3},${a3}` : a3, ft.video[r3.substring(0, 4)] = 2, e3.splice(n3, 1));
        }
      }
    });
    const { AUDIO: m2 = [], SUBTITLES: p2, "CLOSED-CAPTIONS": v2 } = M3U8Parser.parseMasterPlaylistMedia(n2, a2, o2);
    m2.length && (m2.some((t3) => !t3.url) || !d2[0].audioCodec || d2[0].attrs.AUDIO || (this.hls.logger.log("[playlist-loader]: audio codec signaled in quality level, but no embedded audio track signaled, create one"), m2.unshift({ type: "main", name: "main", groupId: "main", default: false, autoselect: false, forced: false, id: -1, attrs: new AttrList({}), bitrate: 0, url: "" }))), r2.trigger(h.MANIFEST_LOADED, { levels: d2, audioTracks: m2, subtitles: p2, captions: v2, contentSteering: l2, url: a2, stats: e2, networkDetails: i2, sessionData: c2, sessionKeys: u2, startTimeOffset: f2, variableList: g2 });
  }
  handleTrackOrLevelPlaylist(t2, e2, s2, i2, n2) {
    const a2 = this.hls, { id: o2, level: l2, type: c2 } = s2, u2 = ma(t2, s2), f2 = r(l2) ? l2 : r(o2) ? o2 : 0, g2 = ga(s2), m2 = M3U8Parser.parseLevelPlaylist(t2.data, u2, f2, g2, 0, this.variableList);
    if (c2 === d) {
      const t3 = { attrs: new AttrList({}), bitrate: 0, details: m2, name: "", url: u2 };
      m2.requestScheduled = e2.loading.start + vs(m2, 0), a2.trigger(h.MANIFEST_LOADED, { levels: [t3], audioTracks: [], url: u2, stats: e2, networkDetails: i2, sessionData: null, sessionKeys: null, contentSteering: null, startTimeOffset: null, variableList: null });
    }
    e2.parsing.end = performance.now(), s2.levelDetails = m2, this.handlePlaylistLoaded(m2, t2, e2, s2, i2, n2);
  }
  handleManifestParsingError(t2, e2, s2, i2, r2) {
    this.hls.trigger(h.ERROR, { type: o.NETWORK_ERROR, details: l.MANIFEST_PARSING_ERROR, fatal: e2.type === d, url: t2.url, err: s2, error: s2, reason: s2.message, response: t2, context: e2, networkDetails: i2, stats: r2 });
  }
  handleNetworkError(t2, e2, s2 = false, i2, r2) {
    let n2 = `A network ${s2 ? "timeout" : "error" + (i2 ? " (status " + i2.code + ")" : "")} occurred while loading ${t2.type}`;
    t2.type === c ? n2 += `: ${t2.level} id: ${t2.id}` : t2.type !== u && t2.type !== f || (n2 += ` id: ${t2.id} group-id: "${t2.groupId}"`);
    const a2 = new Error(n2);
    this.hls.logger.warn(`[playlist-loader]: ${n2}`);
    let g2 = l.UNKNOWN, m2 = false;
    const p2 = this.getInternalLoader(t2);
    switch (t2.type) {
      case d:
        g2 = s2 ? l.MANIFEST_LOAD_TIMEOUT : l.MANIFEST_LOAD_ERROR, m2 = true;
        break;
      case c:
        g2 = s2 ? l.LEVEL_LOAD_TIMEOUT : l.LEVEL_LOAD_ERROR, m2 = false;
        break;
      case u:
        g2 = s2 ? l.AUDIO_TRACK_LOAD_TIMEOUT : l.AUDIO_TRACK_LOAD_ERROR, m2 = false;
        break;
      case f:
        g2 = s2 ? l.SUBTITLE_TRACK_LOAD_TIMEOUT : l.SUBTITLE_LOAD_ERROR, m2 = false;
    }
    p2 && this.resetInternalLoader(t2.type);
    const v2 = { type: o.NETWORK_ERROR, details: g2, fatal: m2, url: t2.url, loader: p2, context: t2, error: a2, networkDetails: e2, stats: r2 };
    if (i2) {
      const s3 = (null == e2 ? void 0 : e2.url) || t2.url;
      v2.response = T({ url: s3, data: void 0 }, i2);
    }
    this.hls.trigger(h.ERROR, v2);
  }
  handlePlaylistLoaded(t2, e2, s2, i2, r2, n2) {
    const a2 = this.hls, { type: m2, level: p2, levelOrTrack: v2, id: y2, groupId: E2, deliveryDirectives: T2 } = i2, S2 = ma(e2, i2), L2 = ga(i2);
    let A2 = "number" == typeof i2.level && L2 === g ? p2 : void 0;
    const R2 = t2.playlistParsingError;
    if (R2) {
      if (this.hls.logger.warn(`${R2} ${t2.url}`), !a2.config.ignorePlaylistParsingErrors) return void a2.trigger(h.ERROR, { type: o.NETWORK_ERROR, details: l.LEVEL_PARSING_ERROR, fatal: false, url: S2, error: R2, reason: R2.message, response: e2, context: i2, level: A2, parent: L2, networkDetails: r2, stats: s2 });
      t2.playlistParsingError = null;
    }
    if (!t2.fragments.length) {
      const n3 = t2.playlistParsingError = new Error("No Segments found in Playlist");
      return void a2.trigger(h.ERROR, { type: o.NETWORK_ERROR, details: l.LEVEL_EMPTY_ERROR, fatal: false, url: S2, error: n3, reason: n3.message, response: e2, context: i2, level: A2, parent: L2, networkDetails: r2, stats: s2 });
    }
    switch (t2.live && n2 && (n2.getCacheAge && (t2.ageHeader = n2.getCacheAge() || 0), n2.getCacheAge && !isNaN(t2.ageHeader) || (t2.ageHeader = 0)), m2) {
      case d:
      case c:
        if (A2) if (v2) {
          if (v2 !== a2.levels[A2]) {
            const t3 = a2.levels.indexOf(v2);
            t3 > -1 && (A2 = t3);
          }
        } else A2 = 0;
        a2.trigger(h.LEVEL_LOADED, { details: t2, levelInfo: v2 || a2.levels[0], level: A2 || 0, id: y2 || 0, stats: s2, networkDetails: r2, deliveryDirectives: T2, withoutMultiVariant: m2 === d });
        break;
      case u:
        a2.trigger(h.AUDIO_TRACK_LOADED, { details: t2, track: v2, id: y2 || 0, groupId: E2 || "", stats: s2, networkDetails: r2, deliveryDirectives: T2 });
        break;
      case f:
        a2.trigger(h.SUBTITLE_TRACK_LOADED, { details: t2, track: v2, id: y2 || 0, groupId: E2 || "", stats: s2, networkDetails: r2, deliveryDirectives: T2 });
    }
  }
}
class Hls {
  static get version() {
    return qs;
  }
  static isMSESupported() {
    return ua();
  }
  static isSupported() {
    return function() {
      if (!ua()) return false;
      const t2 = k();
      return "function" == typeof (null == t2 ? void 0 : t2.isTypeSupported) && (["avc1.42E01E,mp4a.40.2", "av01.0.01M.08", "vp09.00.50.08"].some((e2) => t2.isTypeSupported(vt(e2, "video"))) || ["mp4a.40.2", "fLaC"].some((e2) => t2.isTypeSupported(vt(e2, "audio"))));
    }();
  }
  static getMediaSource() {
    return k();
  }
  static get Events() {
    return h;
  }
  static get MetadataSchema() {
    return pi;
  }
  static get ErrorTypes() {
    return o;
  }
  static get ErrorDetails() {
    return l;
  }
  static get DefaultConfig() {
    return Hls.defaultConfig ? Hls.defaultConfig : sa;
  }
  static set DefaultConfig(t2) {
    Hls.defaultConfig = t2;
  }
  constructor(t2 = {}) {
    this.config = void 0, this.userConfig = void 0, this.logger = void 0, this.coreComponents = void 0, this.networkControllers = void 0, this._emitter = new js(), this._autoLevelCapping = -1, this._maxHdcpLevel = null, this.abrController = void 0, this.bufferController = void 0, this.capLevelController = void 0, this.latencyController = void 0, this.levelController = void 0, this.streamController = void 0, this.audioStreamController = void 0, this.subtititleStreamController = void 0, this.audioTrackController = void 0, this.subtitleTrackController = void 0, this.interstitialsController = void 0, this.gapController = void 0, this.emeController = void 0, this.cmcdController = void 0, this._media = null, this._url = null, this._sessionId = void 0, this.triggeringException = void 0, this.started = false;
    const e2 = this.logger = function(t3, e3, s3) {
      const i3 = A();
      if ("object" == typeof console && true === t3 || "object" == typeof t3) {
        const e4 = ["debug", "log", "info", "warn", "error"];
        e4.forEach((e5) => {
          i3[e5] = R(e5, t3, s3);
        });
        try {
          i3.log('Debug logs enabled for "Hls instance" in hls.js version 1.6.16');
        } catch (t4) {
          return A();
        }
        e4.forEach((e5) => {
          b[e5] = R(e5, t3);
        });
      } else y(b, i3);
      return i3;
    }(t2.debug || false, 0, t2.assetPlayerId), s2 = this.config = function(t3, e3, s3) {
      if ((e3.liveSyncDurationCount || e3.liveMaxLatencyDurationCount) && (e3.liveSyncDuration || e3.liveMaxLatencyDuration)) throw new Error("Illegal hls.js config: don't mix up liveSyncDurationCount/liveMaxLatencyDurationCount and liveSyncDuration/liveMaxLatencyDuration");
      if (void 0 !== e3.liveMaxLatencyDurationCount && (void 0 === e3.liveSyncDurationCount || e3.liveMaxLatencyDurationCount <= e3.liveSyncDurationCount)) throw new Error('Illegal hls.js config: "liveMaxLatencyDurationCount" must be greater than "liveSyncDurationCount"');
      if (void 0 !== e3.liveMaxLatencyDuration && (void 0 === e3.liveSyncDuration || e3.liveMaxLatencyDuration <= e3.liveSyncDuration)) throw new Error('Illegal hls.js config: "liveMaxLatencyDuration" must be greater than "liveSyncDuration"');
      const i3 = ia(t3), r3 = ["TimeOut", "MaxRetry", "RetryDelay", "MaxRetryTimeout"];
      return ["manifest", "level", "frag"].forEach((t4) => {
        const n3 = `${"level" === t4 ? "playlist" : t4}LoadPolicy`, a3 = void 0 === e3[n3], o3 = [];
        r3.forEach((s4) => {
          const r4 = `${t4}Loading${s4}`, l3 = e3[r4];
          if (void 0 !== l3 && a3) {
            o3.push(r4);
            const t5 = i3[n3].default;
            switch (e3[n3] = { default: t5 }, s4) {
              case "TimeOut":
                t5.maxLoadTimeMs = l3, t5.maxTimeToFirstByteMs = l3;
                break;
              case "MaxRetry":
                t5.errorRetry.maxNumRetry = l3, t5.timeoutRetry.maxNumRetry = l3;
                break;
              case "RetryDelay":
                t5.errorRetry.retryDelayMs = l3, t5.timeoutRetry.retryDelayMs = l3;
                break;
              case "MaxRetryTimeout":
                t5.errorRetry.maxRetryDelayMs = l3, t5.timeoutRetry.maxRetryDelayMs = l3;
            }
          }
        }), o3.length && s3.warn(`hls.js config: "${o3.join('", "')}" setting(s) are deprecated, use "${n3}": ${$t(e3[n3])}`);
      }), T(T({}, i3), e3);
    }(Hls.DefaultConfig, t2, e2);
    this.userConfig = t2, s2.progressive && function(t3, e3) {
      const s3 = t3.loader;
      s3 !== FetchLoader && s3 !== XhrLoader ? (e3.log("[config]: Custom loader detected, cannot enable progressive streaming"), t3.progressive = false) : function() {
        if (self.fetch && self.AbortController && self.ReadableStream && self.Request) try {
          return new self.ReadableStream({}), true;
        } catch (t4) {
        }
        return false;
      }() && (t3.loader = FetchLoader, t3.progressive = true, t3.enableSoftwareAES = true, e3.log("[config]: Progressive streaming enabled, using FetchLoader"));
    }(s2, e2);
    const { abrController: i2, bufferController: r2, capLevelController: n2, errorController: a2, fpsController: o2 } = s2, l2 = new a2(this), d2 = this.abrController = new i2(this), c2 = new FragmentTracker(this), u2 = s2.interstitialsController, f2 = u2 ? this.interstitialsController = new u2(this, Hls) : null, g2 = this.bufferController = new r2(this, c2), m2 = this.capLevelController = new n2(this), p2 = new o2(this), v2 = new PlaylistLoader(this), E2 = s2.contentSteeringController, S2 = E2 ? new E2(this) : null, L2 = this.levelController = new LevelController(this, S2), I2 = new ID3TrackController(this), k2 = new KeyLoader(this.config, this.logger), P2 = this.streamController = new StreamController(this, c2, k2), D2 = this.gapController = new GapController(this, c2);
    m2.setStreamController(P2), p2.setStreamController(P2);
    const _2 = [v2, L2, P2];
    f2 && _2.splice(1, 0, f2), S2 && _2.splice(1, 0, S2), this.networkControllers = _2;
    const C2 = [d2, g2, D2, m2, p2, I2, c2];
    this.audioTrackController = this.createController(s2.audioTrackController, _2);
    const w2 = s2.audioStreamController;
    w2 && _2.push(this.audioStreamController = new w2(this, c2, k2)), this.subtitleTrackController = this.createController(s2.subtitleTrackController, _2);
    const M2 = s2.subtitleStreamController;
    M2 && _2.push(this.subtititleStreamController = new M2(this, c2, k2)), this.createController(s2.timelineController, C2), k2.emeController = this.emeController = this.createController(s2.emeController, C2), this.cmcdController = this.createController(s2.cmcdController, C2), this.latencyController = this.createController(LatencyController, C2), this.coreComponents = C2, _2.push(l2);
    const x2 = l2.onErrorOut;
    "function" == typeof x2 && this.on(h.ERROR, x2, l2), this.on(h.MANIFEST_LOADED, v2.onManifestLoaded, v2);
  }
  createController(t2, e2) {
    if (t2) {
      const s2 = new t2(this);
      return e2 && e2.push(s2), s2;
    }
    return null;
  }
  on(t2, e2, s2 = this) {
    this._emitter.on(t2, e2, s2);
  }
  once(t2, e2, s2 = this) {
    this._emitter.once(t2, e2, s2);
  }
  removeAllListeners(t2) {
    this._emitter.removeAllListeners(t2);
  }
  off(t2, e2, s2 = this, i2) {
    this._emitter.off(t2, e2, s2, i2);
  }
  listeners(t2) {
    return this._emitter.listeners(t2);
  }
  emit(t2, e2, s2) {
    return this._emitter.emit(t2, e2, s2);
  }
  trigger(t2, e2) {
    if (this.config.debug) return this.emit(t2, t2, e2);
    try {
      return this.emit(t2, t2, e2);
    } catch (e3) {
      if (this.logger.error("An internal error happened while handling event " + t2 + '. Error message: "' + e3.message + '". Here is a stacktrace:', e3), !this.triggeringException) {
        this.triggeringException = true;
        const s2 = t2 === h.ERROR;
        this.trigger(h.ERROR, { type: o.OTHER_ERROR, details: l.INTERNAL_EXCEPTION, fatal: s2, event: t2, error: e3 }), this.triggeringException = false;
      }
    }
    return false;
  }
  listenerCount(t2) {
    return this._emitter.listenerCount(t2);
  }
  destroy() {
    this.logger.log("destroy"), this.trigger(h.DESTROYING, void 0), this.detachMedia(), this.removeAllListeners(), this._autoLevelCapping = -1, this._url = null, this.networkControllers.forEach((t3) => t3.destroy()), this.networkControllers.length = 0, this.coreComponents.forEach((t3) => t3.destroy()), this.coreComponents.length = 0;
    const t2 = this.config;
    t2.xhrSetup = t2.fetchSetup = void 0, this.userConfig = null;
  }
  attachMedia(t2) {
    if (!t2 || "media" in t2 && !t2.media) {
      const e3 = new Error(`attachMedia failed: invalid argument (${t2})`);
      return void this.trigger(h.ERROR, { type: o.OTHER_ERROR, details: l.ATTACH_MEDIA_ERROR, fatal: true, error: e3 });
    }
    this.logger.log("attachMedia"), this._media && (this.logger.warn("media must be detached before attaching"), this.detachMedia());
    const e2 = "media" in t2, s2 = e2 ? t2.media : t2, i2 = e2 ? t2 : { media: s2 };
    this._media = s2, this.trigger(h.MEDIA_ATTACHING, i2);
  }
  detachMedia() {
    this.logger.log("detachMedia"), this.trigger(h.MEDIA_DETACHING, {}), this._media = null;
  }
  transferMedia() {
    this._media = null;
    const t2 = this.bufferController.transferMedia();
    return this.trigger(h.MEDIA_DETACHING, { transferMedia: t2 }), t2;
  }
  loadSource(t2) {
    this.stopLoad();
    const e2 = this.media, s2 = this._url, i2 = this._url = O.buildAbsoluteURL(self.location.href, t2, { alwaysNormalize: true });
    this._autoLevelCapping = -1, this._maxHdcpLevel = null, this.logger.log(`loadSource:${i2}`), e2 && s2 && (s2 !== i2 || this.bufferController.hasSourceTypes()) && (this.detachMedia(), this.attachMedia(e2)), this.trigger(h.MANIFEST_LOADING, { url: t2 });
  }
  get url() {
    return this._url;
  }
  get hasEnoughToStart() {
    return this.streamController.hasEnoughToStart;
  }
  get startPosition() {
    return this.streamController.startPositionValue;
  }
  startLoad(t2 = -1, e2) {
    this.logger.log(`startLoad(${t2 + (e2 ? ", <skip seek to start>" : "")})`), this.started = true, this.resumeBuffering();
    for (let s2 = 0; s2 < this.networkControllers.length && (this.networkControllers[s2].startLoad(t2, e2), this.started && this.networkControllers); s2++) ;
  }
  stopLoad() {
    this.logger.log("stopLoad"), this.started = false;
    for (let t2 = 0; t2 < this.networkControllers.length && (this.networkControllers[t2].stopLoad(), !this.started && this.networkControllers); t2++) ;
  }
  get loadingEnabled() {
    return this.started;
  }
  get bufferingEnabled() {
    return this.streamController.bufferingEnabled;
  }
  resumeBuffering() {
    this.bufferingEnabled || (this.logger.log("resume buffering"), this.networkControllers.forEach((t2) => {
      t2.resumeBuffering && t2.resumeBuffering();
    }));
  }
  pauseBuffering() {
    this.bufferingEnabled && (this.logger.log("pause buffering"), this.networkControllers.forEach((t2) => {
      t2.pauseBuffering && t2.pauseBuffering();
    }));
  }
  get inFlightFragments() {
    const t2 = { [g]: this.streamController.inFlightFrag };
    return this.audioStreamController && (t2[m] = this.audioStreamController.inFlightFrag), this.subtititleStreamController && (t2[p] = this.subtititleStreamController.inFlightFrag), t2;
  }
  swapAudioCodec() {
    this.logger.log("swapAudioCodec"), this.streamController.swapAudioCodec();
  }
  recoverMediaError() {
    this.logger.log("recoverMediaError");
    const t2 = this._media, e2 = null == t2 ? void 0 : t2.currentTime;
    this.detachMedia(), t2 && (this.attachMedia(t2), e2 && this.startLoad(e2));
  }
  removeLevel(t2) {
    this.levelController.removeLevel(t2);
  }
  get sessionId() {
    let t2 = this._sessionId;
    return t2 || (t2 = this._sessionId = function() {
      try {
        return crypto.randomUUID();
      } catch (t3) {
        try {
          const t4 = URL.createObjectURL(new Blob()), e2 = t4.toString();
          return URL.revokeObjectURL(t4), e2.slice(e2.lastIndexOf("/") + 1);
        } catch (t4) {
          let e2 = (/* @__PURE__ */ new Date()).getTime();
          return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (t5) => {
            const s2 = (e2 + 16 * Math.random()) % 16 | 0;
            return e2 = Math.floor(e2 / 16), ("x" == t5 ? s2 : 3 & s2 | 8).toString(16);
          });
        }
      }
    }()), t2;
  }
  get levels() {
    return this.levelController.levels || [];
  }
  get latestLevelDetails() {
    return this.streamController.getLevelDetails() || null;
  }
  get loadLevelObj() {
    return this.levelController.loadLevelObj;
  }
  get currentLevel() {
    return this.streamController.currentLevel;
  }
  set currentLevel(t2) {
    this.logger.log(`set currentLevel:${t2}`), this.levelController.manualLevel = t2, this.streamController.immediateLevelSwitch();
  }
  get nextLevel() {
    return this.streamController.nextLevel;
  }
  set nextLevel(t2) {
    this.logger.log(`set nextLevel:${t2}`), this.levelController.manualLevel = t2, this.streamController.nextLevelSwitch();
  }
  get loadLevel() {
    return this.levelController.level;
  }
  set loadLevel(t2) {
    this.logger.log(`set loadLevel:${t2}`), this.levelController.manualLevel = t2;
  }
  get nextLoadLevel() {
    return this.levelController.nextLoadLevel;
  }
  set nextLoadLevel(t2) {
    this.levelController.nextLoadLevel = t2;
  }
  get firstLevel() {
    return Math.max(this.levelController.firstLevel, this.minAutoLevel);
  }
  set firstLevel(t2) {
    this.logger.log(`set firstLevel:${t2}`), this.levelController.firstLevel = t2;
  }
  get startLevel() {
    const t2 = this.levelController.startLevel;
    return -1 === t2 && this.abrController.forcedAutoLevel > -1 ? this.abrController.forcedAutoLevel : t2;
  }
  set startLevel(t2) {
    this.logger.log(`set startLevel:${t2}`), -1 !== t2 && (t2 = Math.max(t2, this.minAutoLevel)), this.levelController.startLevel = t2;
  }
  get capLevelToPlayerSize() {
    return this.config.capLevelToPlayerSize;
  }
  set capLevelToPlayerSize(t2) {
    const e2 = !!t2;
    e2 !== this.config.capLevelToPlayerSize && (e2 ? this.capLevelController.startCapping() : (this.capLevelController.stopCapping(), this.autoLevelCapping = -1, this.streamController.nextLevelSwitch()), this.config.capLevelToPlayerSize = e2);
  }
  get autoLevelCapping() {
    return this._autoLevelCapping;
  }
  get bandwidthEstimate() {
    const { bwEstimator: t2 } = this.abrController;
    return t2 ? t2.getEstimate() : NaN;
  }
  set bandwidthEstimate(t2) {
    this.abrController.resetEstimator(t2);
  }
  get abrEwmaDefaultEstimate() {
    const { bwEstimator: t2 } = this.abrController;
    return t2 ? t2.defaultEstimate : NaN;
  }
  get ttfbEstimate() {
    const { bwEstimator: t2 } = this.abrController;
    return t2 ? t2.getEstimateTTFB() : NaN;
  }
  set autoLevelCapping(t2) {
    this._autoLevelCapping !== t2 && (this.logger.log(`set autoLevelCapping:${t2}`), this._autoLevelCapping = t2, this.levelController.checkMaxAutoUpdated());
  }
  get maxHdcpLevel() {
    return this._maxHdcpLevel;
  }
  set maxHdcpLevel(t2) {
    (function(t3) {
      return Ot.indexOf(t3) > -1;
    })(t2) && this._maxHdcpLevel !== t2 && (this._maxHdcpLevel = t2, this.levelController.checkMaxAutoUpdated());
  }
  get autoLevelEnabled() {
    return -1 === this.levelController.manualLevel;
  }
  get manualLevel() {
    return this.levelController.manualLevel;
  }
  get minAutoLevel() {
    const { levels: t2, config: { minAutoBitrate: e2 } } = this;
    if (!t2) return 0;
    const s2 = t2.length;
    for (let i2 = 0; i2 < s2; i2++) if (t2[i2].maxBitrate >= e2) return i2;
    return 0;
  }
  get maxAutoLevel() {
    const { levels: t2, autoLevelCapping: e2, maxHdcpLevel: s2 } = this;
    let i2;
    if (i2 = -1 === e2 && null != t2 && t2.length ? t2.length - 1 : e2, s2) for (let e3 = i2; e3--; ) {
      const i3 = t2[e3].attrs["HDCP-LEVEL"];
      if (i3 && i3 <= s2) return e3;
    }
    return i2;
  }
  get firstAutoLevel() {
    return this.abrController.firstAutoLevel;
  }
  get nextAutoLevel() {
    return this.abrController.nextAutoLevel;
  }
  set nextAutoLevel(t2) {
    this.abrController.nextAutoLevel = t2;
  }
  get playingDate() {
    return this.streamController.currentProgramDateTime;
  }
  get mainForwardBufferInfo() {
    return this.streamController.getMainFwdBufferInfo();
  }
  get maxBufferLength() {
    return this.streamController.maxBufferLength;
  }
  setAudioOption(t2) {
    var e2;
    return (null == (e2 = this.audioTrackController) ? void 0 : e2.setAudioOption(t2)) || null;
  }
  setSubtitleOption(t2) {
    var e2;
    return (null == (e2 = this.subtitleTrackController) ? void 0 : e2.setSubtitleOption(t2)) || null;
  }
  get allAudioTracks() {
    const t2 = this.audioTrackController;
    return t2 ? t2.allAudioTracks : [];
  }
  get audioTracks() {
    const t2 = this.audioTrackController;
    return t2 ? t2.audioTracks : [];
  }
  get audioTrack() {
    const t2 = this.audioTrackController;
    return t2 ? t2.audioTrack : -1;
  }
  set audioTrack(t2) {
    const e2 = this.audioTrackController;
    e2 && (e2.audioTrack = t2);
  }
  get allSubtitleTracks() {
    const t2 = this.subtitleTrackController;
    return t2 ? t2.allSubtitleTracks : [];
  }
  get subtitleTracks() {
    const t2 = this.subtitleTrackController;
    return t2 ? t2.subtitleTracks : [];
  }
  get subtitleTrack() {
    const t2 = this.subtitleTrackController;
    return t2 ? t2.subtitleTrack : -1;
  }
  get media() {
    return this._media;
  }
  set subtitleTrack(t2) {
    const e2 = this.subtitleTrackController;
    e2 && (e2.subtitleTrack = t2);
  }
  get subtitleDisplay() {
    const t2 = this.subtitleTrackController;
    return !!t2 && t2.subtitleDisplay;
  }
  set subtitleDisplay(t2) {
    const e2 = this.subtitleTrackController;
    e2 && (e2.subtitleDisplay = t2);
  }
  get lowLatencyMode() {
    return this.config.lowLatencyMode;
  }
  set lowLatencyMode(t2) {
    this.config.lowLatencyMode = t2;
  }
  get liveSyncPosition() {
    return this.latencyController.liveSyncPosition;
  }
  get latency() {
    return this.latencyController.latency;
  }
  get maxLatency() {
    return this.latencyController.maxLatency;
  }
  get targetLatency() {
    return this.latencyController.targetLatency;
  }
  set targetLatency(t2) {
    this.latencyController.targetLatency = t2;
  }
  get drift() {
    return this.latencyController.drift;
  }
  get forceStartLoad() {
    return this.streamController.forceStartLoad;
  }
  get pathways() {
    return this.levelController.pathways;
  }
  get pathwayPriority() {
    return this.levelController.pathwayPriority;
  }
  set pathwayPriority(t2) {
    this.levelController.pathwayPriority = t2;
  }
  get bufferedToEnd() {
    var t2;
    return !(null == (t2 = this.bufferController) || !t2.bufferedToEnd);
  }
  get interstitialsManager() {
    var t2;
    return (null == (t2 = this.interstitialsController) ? void 0 : t2.interstitialsManager) || null;
  }
  getMediaDecodingInfo(t2, e2 = this.allAudioTracks) {
    return wt(t2, Gt(e2), navigator.mediaCapabilities);
  }
}
Hls.defaultConfig = void 0;
const pa = "HLSPlayerWrapper";
class HLSPlayerWrapper extends t {
  config;
  hls = null;
  videoElement;
  canvasRenderer = null;
  state = "idle";
  trackManager;
  frameCallbackId = null;
  _framesRendered = 0;
  textContainer = null;
  pendingCues = [];
  lastActiveCueSignature = "";
  constructor(t2) {
    super(), this.config = t2, this.trackManager = new e(), this.videoElement = document.createElement("video"), this.videoElement.crossOrigin = "anonymous", this.videoElement.playsInline = true, this.videoElement.style.display = "none", this.videoElement.preservesPitch = true, this.videoElement.mozPreservesPitch = true, this.videoElement.webkitPreservesPitch = true, !t2.drm && "canvas" === t2.renderer && t2.canvas && (this.canvasRenderer = new s(t2.canvas), this.createTextContainer()), this.setupEventHandlers(), this.trackManager.on("videoTrackChange", (t3) => {
      if (this.hls) {
        const e2 = t3 ? t3.id : -1;
        if (-1 === e2) return void (this.hls.autoLevelEnabled || (this.hls.currentLevel = -1, i.info(pa, "Switched to Auto Quality (ABR)")));
        this.config.enablePreviews && i.info(pa, "HLS previews are disabled due to byte-range seeking limitations."), i.info(pa, `Requesting Quality Switch to ${e2}`), "playing" === this.state ? (this.hls.nextLevel = e2, i.info(pa, `Set nextLevel=${e2} (smooth switch)`)) : (this.hls.currentLevel = e2, i.info(pa, `Set currentLevel=${e2} (immediate switch)`));
      }
    }), this.trackManager.on("subtitleTrackChange", (t3) => {
      this.hls && (this.hls.subtitleTrack = t3 ? t3.id : -1, this.pendingCues = [], this.lastActiveCueSignature = "", this.textContainer && (this.textContainer.textContent = ""), i.info(pa, t3 ? `Selected subtitle track ${t3.id} (${t3.language || t3.label || ""})` : "Subtitles disabled"));
    }), this.trackManager.on("audioTrackChange", (t3) => {
      this.hls && t3 && this.hls.audioTrack !== t3.id && (this.hls.audioTrack = t3.id, i.info(pa, `Selected audio track ${t3.id} (${t3.language || t3.label || ""})`));
    });
  }
  createTextContainer() {
    if (this.textContainer || !this.config.canvas) return;
    const t2 = this.config.canvas.parentNode;
    if (!t2) return;
    const e2 = document.createElement("div");
    e2.className = "movi-hls-text-container", e2.style.position = "absolute", e2.style.inset = "0", e2.style.pointerEvents = "none", e2.style.zIndex = "2", e2.style.textAlign = "center", e2.style.color = "#fff", e2.style.textShadow = "0 1px 3px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.9)", e2.style.fontFamily = "sans-serif", e2.style.whiteSpace = "pre-line", e2.style.fontSize = "calc(clamp(20px, calc(var(--movi-player-width, 100vw) * 0.032), 40px) * var(--movi-sub-size-mult, 1))", t2.appendChild(e2), this.textContainer = e2, this.canvasRenderer?.setSubtitleOverlay(e2);
  }
  updateActiveCueDisplay() {
    if (!this.textContainer) return;
    const t2 = this.videoElement.currentTime, e2 = this.pendingCues.filter((e3) => e3.startTime <= t2 && t2 < e3.endTime);
    this.pendingCues.length > 200 && (this.pendingCues = this.pendingCues.filter((e3) => e3.endTime > t2 - 30));
    const s2 = e2.map((t3) => t3.text).join("\n");
    s2 !== this.lastActiveCueSignature && (this.lastActiveCueSignature = s2, this.textContainer.textContent = "", e2.forEach((t3, e3) => {
      e3 > 0 && this.textContainer.appendChild(document.createElement("br"));
      try {
        this.textContainer.appendChild(t3.getCueAsHTML());
      } catch {
        this.textContainer.appendChild(document.createTextNode(t3.text));
      }
    }));
  }
  setupEventHandlers() {
    this.videoElement.addEventListener("play", () => this.setState("playing")), this.videoElement.addEventListener("playing", () => this.setState("playing")), this.videoElement.addEventListener("pause", () => {
      "ended" !== this.state && this.setState("paused");
    }), this.videoElement.addEventListener("ended", () => this.setState("ended")), this.videoElement.addEventListener("seeking", () => this.setState("seeking")), this.videoElement.addEventListener("seeked", () => {
      this.videoElement.paused ? this.setState("paused") : this.setState("playing");
    }), this.videoElement.addEventListener("waiting", () => this.setState("buffering")), this.videoElement.addEventListener("timeupdate", () => {
      this.emit("timeUpdate", this.videoElement.currentTime), this.updateActiveCueDisplay();
    }), this.videoElement.addEventListener("durationchange", () => {
      this.emit("durationChange", this.videoElement.duration);
    }), this.videoElement.addEventListener("error", (t2) => {
      const e2 = this.videoElement.error;
      this.emit("error", new Error(e2?.message || "Video element error")), this.setState("error");
    });
  }
  setState(t2) {
    this.state !== t2 && (this.state = t2, this.emit("stateChange", t2), "playing" === t2 && this.canvasRenderer ? this.startFrameLoop() : "seeking" !== t2 && "buffering" !== t2 && ("paused" !== t2 && "ended" !== t2 && "error" !== t2 && "idle" !== t2 || this.stopFrameLoop()));
  }
  startFrameLoop() {
    null === this.frameCallbackId && (this.frameCallbackId = this.videoElement.requestVideoFrameCallback((t2, e2) => {
      this.renderFrame(), this.frameCallbackId = null, "playing" !== this.state && "seeking" !== this.state && "buffering" !== this.state || this.startFrameLoop();
    }));
  }
  stopFrameLoop() {
    null !== this.frameCallbackId && (this.videoElement.cancelVideoFrameCallback(this.frameCallbackId), this.frameCallbackId = null);
  }
  renderFrame() {
    if (this.canvasRenderer) try {
      const t2 = new VideoFrame(this.videoElement);
      this.canvasRenderer.render(t2), t2.close(), this._framesRendered++;
    } catch (t2) {
      i.warn(pa, "Failed to create VideoFrame", t2);
    }
  }
  async load() {
    if (this.setState("loading"), this.emit("loadStart", void 0), !Hls.isSupported()) {
      if (this.videoElement.canPlayType("application/vnd.apple.mpegurl")) return this.loadNative();
      {
        const t3 = new Error("HLS not supported in this browser");
        throw this.emit("error", t3), this.setState("error"), t3;
      }
    }
    const t2 = this.config.source, e2 = t2 && "url" === t2.type ? t2.url : null;
    if (!e2) throw new Error("HLS source must be a URL");
    this.config.drm && (i.info(pa, "DRM mode enabled — using native video element (no canvas)"), this.config.licenseUrl && this.setupEME(this.config.licenseUrl, this.config.licenseHeaders));
    const s2 = this.config.headers;
    return this.hls = new Hls({ enableWorker: true, lowLatencyMode: false, backBufferLength: 90, maxBufferLength: 30, maxMaxBufferLength: 600, renderTextTracksNatively: false, ...s2 && { xhrSetup: (t3) => {
      for (const [e3, i2] of Object.entries(s2)) t3.setRequestHeader(e3, i2);
    } } }), this.hls.attachMedia(this.videoElement), new Promise((t3, s3) => {
      let r2 = false;
      this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        i.info(pa, "HLS Media Attached"), this.hls.loadSource(e2);
      }), this.hls.on(Hls.Events.MANIFEST_PARSED, (e3, s4) => {
        i.info(pa, `HLS Manifest parsed. Found ${s4.levels.length} quality levels`), this.updateTracks(s4), this.setState("ready"), this.emit("loadEnd", void 0), r2 = true, t3();
      }), this.hls.on(Hls.Events.LEVEL_SWITCHED, (t4, e3) => {
        i.debug(pa, `LEVEL_SWITCHED → level ${e3.level}`), this.trackManager.emit("tracksChange", this.trackManager.getTracks());
      }), this.hls.on(Hls.Events.CUES_PARSED, (t4, e3) => {
        const s4 = Array.isArray(e3?.cues) ? e3.cues : [];
        this.pendingCues.push(...s4);
      });
      let n2 = 0, a2 = 0;
      this.hls.on(Hls.Events.ERROR, (t4, e3) => {
        if (e3.fatal) {
          i.error(pa, `HLS Fatal Error: ${e3.details} (response: ${e3.response?.code})`);
          const t5 = (t6) => {
            this.hls.destroy();
            const e4 = new Error(t6);
            r2 ? (this.emit("error", e4), this.setState("error")) : (r2 = true, s3(e4));
          };
          switch (e3.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              const s4 = e3.response?.code;
              404 === s4 || 403 === s4 ? t5(`Stream unavailable (HTTP ${s4})`) : n2 < 3 ? (n2++, i.info(pa, `Network retry ${n2}/3`), this.hls.startLoad()) : t5(`Network error: ${e3.details}`);
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              a2 < 2 ? (a2++, i.info(pa, `Media recovery ${a2}/2`), this.hls.recoverMediaError()) : t5(`Media error: ${e3.details}`);
              break;
            default:
              t5(`HLS Error: ${e3.details}`);
          }
        } else i.warn(pa, `HLS Non-fatal error: ${e3.details}`);
      });
    });
  }
  async loadNative() {
    const t2 = this.config.source && "url" === this.config.source.type ? this.config.source.url : "";
    if (!t2) throw new Error("Invalid URL");
    return new Promise((e2, s2) => {
      const i2 = () => {
        this.videoElement.removeEventListener("loadedmetadata", i2), this.videoElement.removeEventListener("error", r2), this.setState("ready"), this.emit("loadEnd", void 0), e2();
      }, r2 = (t3) => {
        this.videoElement.removeEventListener("loadedmetadata", i2), this.videoElement.removeEventListener("error", r2), s2(new Error("Native HLS load failed"));
      };
      this.videoElement.addEventListener("loadedmetadata", i2), this.videoElement.addEventListener("error", r2), this.videoElement.src = t2, this.videoElement.load();
    });
  }
  updateTracks(t2) {
    const e2 = [];
    e2.push({ id: -1, type: "video", codec: "auto", width: 0, height: 0, frameRate: 0, label: "Auto" });
    const s2 = /* @__PURE__ */ new Map();
    t2.levels.forEach((t3) => {
      s2.set(t3.height, (s2.get(t3.height) || 0) + 1);
    }), t2.levels.forEach((t3, i2) => {
      const r3 = (s2.get(t3.height) || 0) > 1 ? `${t3.height}p · ${(t3.bitrate / 1e3).toFixed(0)} kbps` : `${t3.height}p`, n2 = { id: i2, type: "video", codec: t3.videoCodec, bitRate: t3.bitrate, width: t3.width, height: t3.height, frameRate: t3.frameRate, label: r3 };
      e2.push(n2);
    }), (this.hls?.subtitleTracks ?? []).forEach((t3, s3) => {
      const i2 = t3.lang && "und" !== t3.lang ? t3.lang : "", r3 = t3.name || i2 || `Subtitle ${s3 + 1}`;
      e2.push({ id: s3, type: "subtitle", codec: "", language: i2, label: r3, subtitleType: "text" });
    });
    const r2 = this.hls?.audioTracks ?? [];
    if (r2.forEach((t3, s3) => {
      const i2 = t3.lang && "und" !== t3.lang ? t3.lang : "", r3 = t3.name || i2 || `Audio ${s3 + 1}`;
      e2.push({ id: s3, type: "audio", codec: "", language: i2, label: r3, channels: 0, sampleRate: 0 });
    }), this.trackManager.setTracks(e2), this.trackManager.selectVideoTrack(-1), r2.length > 1 && "number" == typeof this.hls?.audioTrack) {
      const t3 = this.hls.audioTrack;
      t3 >= 0 && t3 < r2.length && this.trackManager.selectAudioTrack(t3);
    }
    if (this.canvasRenderer && t2.levels.length > 0) {
      const e3 = t2.levels[0], s3 = (t3, e4) => {
        if (!this.canvasRenderer || t3 <= 0 || e4 <= 0) return;
        this.canvasRenderer.configure(t3, e4);
        const s4 = this.canvasRenderer.getCanvas(), i2 = s4 instanceof HTMLCanvasElement ? s4.parentElement : null, r3 = i2?.clientWidth || t3, n2 = i2?.clientHeight || e4;
        r3 > 0 && n2 > 0 && this.canvasRenderer.resize(r3, n2);
      };
      if (e3.width > 0 && e3.height > 0) s3(e3.width, e3.height);
      else {
        i.info(pa, "HLS manifest lacks RESOLUTION; deferring canvas configure to loadedmetadata");
        const t3 = () => {
          this.videoElement.removeEventListener("loadedmetadata", t3), s3(this.videoElement.videoWidth, this.videoElement.videoHeight);
        };
        this.videoElement.videoWidth > 0 && this.videoElement.videoHeight > 0 ? s3(this.videoElement.videoWidth, this.videoElement.videoHeight) : this.videoElement.addEventListener("loadedmetadata", t3);
      }
    }
  }
  async play() {
    await this.videoElement.play();
  }
  pause() {
    this.videoElement.pause();
  }
  async seek(t2) {
    this.videoElement.currentTime = t2;
  }
  getState() {
    return this.state;
  }
  getDuration() {
    return this.videoElement.duration;
  }
  getCurrentTime() {
    return this.videoElement.currentTime;
  }
  setVolume(t2) {
    this.videoElement.volume = Math.min(1, Math.max(0, t2));
  }
  setMuted(t2) {
    this.videoElement.muted = t2;
  }
  setPlaybackRate(t2) {
    this.videoElement.playbackRate = t2;
  }
  getVolume() {
    return this.videoElement.volume;
  }
  isMuted() {
    return this.videoElement.muted;
  }
  getPlaybackRate() {
    return this.videoElement.playbackRate;
  }
  setSubtitleOverlay(t2) {
  }
  setHDREnabled(t2) {
    this.canvasRenderer && this.canvasRenderer.setHDREnabled(t2);
  }
  setupEME(t2, e2) {
    const s2 = this.videoElement;
    s2.addEventListener("encrypted", async (r2) => {
      i.info(pa, `EME: encrypted event — initDataType=${r2.initDataType}`);
      try {
        const n2 = [{ initDataTypes: [r2.initDataType], videoCapabilities: [{ contentType: 'video/mp4; codecs="avc1.42E01E"' }], audioCapabilities: [{ contentType: 'audio/mp4; codecs="mp4a.40.2"' }] }], a2 = ["com.widevine.alpha", "com.microsoft.playready", "com.apple.fps.1_0"];
        let o2 = "", l2 = null;
        for (const t3 of a2) try {
          l2 = await navigator.requestMediaKeySystemAccess(t3, n2), o2 = t3;
          break;
        } catch {
        }
        if (!l2) throw new Error("No supported DRM key system (Widevine/PlayReady/FairPlay)");
        i.info(pa, `EME: Using ${o2}`);
        const h2 = await l2.createMediaKeys();
        await s2.setMediaKeys(h2);
        const d2 = h2.createSession();
        d2.addEventListener("message", async (s3) => {
          const r3 = await fetch(t2, { method: "POST", body: s3.message, headers: { "Content-Type": "application/octet-stream", ...e2 } });
          if (!r3.ok) return i.error(pa, `EME: License request failed (HTTP ${r3.status})`), void this.emit("error", new Error(`DRM license request failed (HTTP ${r3.status})`));
          const n3 = await r3.arrayBuffer();
          await d2.update(new Uint8Array(n3)), i.info(pa, "EME: License acquired, playback authorized");
        }), await d2.generateRequest(r2.initDataType, r2.initData);
      } catch (t3) {
        i.error(pa, "EME: DRM setup failed", t3), this.emit("error", new Error("DRM not supported or license server unreachable"));
      }
    });
  }
  getVideoElement() {
    return this.videoElement;
  }
  getBufferEndTime() {
    return this.videoElement.buffered.length ? this.videoElement.buffered.end(this.videoElement.buffered.length - 1) : 0;
  }
  resizeCanvas(t2, e2) {
    this.canvasRenderer && this.canvasRenderer.resize(t2, e2);
  }
  getVideoTracks() {
    return this.trackManager.getTracks().filter((t2) => "video" === t2.type);
  }
  selectVideoTrack(t2) {
    this.hls && this.trackManager.selectVideoTrack(t2);
  }
  getAudioTracks() {
    return this.trackManager.getTracks().filter((t2) => "audio" === t2.type);
  }
  selectAudioTrack(t2) {
    return this.trackManager.selectAudioTrack(t2);
  }
  getSubtitleTracks() {
    return this.trackManager.getTracks().filter((t2) => "subtitle" === t2.type);
  }
  async selectSubtitleTrack(t2) {
    return this.trackManager.selectSubtitleTrack(t2);
  }
  setVideoRotation(t2) {
    this.canvasRenderer?.setManualRotation(t2);
  }
  rotateVideo() {
    return this.canvasRenderer?.rotate90() ?? 0;
  }
  getVideoRotation() {
    return this.canvasRenderer?.getRotation() ?? 0;
  }
  setFitMode(t2) {
    this.canvasRenderer ? this.canvasRenderer.setFitMode(t2) : "contain" === t2 ? this.videoElement.style.objectFit = "contain" : "cover" === t2 ? this.videoElement.style.objectFit = "cover" : "fill" === t2 && (this.videoElement.style.objectFit = "fill");
  }
  getStats() {
    const t2 = {}, e2 = this.hls?.levels?.[this.hls.currentLevel], s2 = e2?.width || this.videoElement.videoWidth || 0, i2 = e2?.height || this.videoElement.videoHeight || 0;
    if (s2 && i2) {
      t2["Video Codec"] = e2?.videoCodec ?? "N/A", t2.Resolution = `${s2}x${i2}`;
      const r3 = Math.max(i2, Math.round(9 * s2 / 16));
      t2.Quality = r3 >= 8640 ? "16K" : r3 >= 4320 ? "8K" : r3 >= 2160 ? "4K" : r3 >= 1440 ? "2K" : r3 >= 1080 ? "1080p" : r3 >= 720 ? "720p" : r3 >= 480 ? "480p" : "SD", e2?.frameRate && (t2["Frame Rate"] = `${e2.frameRate} fps`), t2["Video Bitrate"] = e2?.bitrate ? `${(e2.bitrate / 1e3).toFixed(0)} kbps` : "N/A";
    }
    if (e2?.audioCodec && (t2["Audio Codec"] = e2.audioCodec), this.canvasRenderer) {
      const e3 = this.canvasRenderer.getStats();
      t2["Video Decoder"] = "Hardware (Native)", t2.Renderer = "Canvas", t2["Color Space"] = e3.colorSpace || "N/A";
    } else t2["Video Decoder"] = "Hardware (Native)", t2.Renderer = "HTML5 Video";
    t2["Playback State"] = this.state, t2["Playback Rate"] = `${this.videoElement.playbackRate}x`;
    const r2 = this.videoElement.getVideoPlaybackQuality?.();
    if (r2 && (t2["Frames Decoded"] = r2.totalVideoFrames, t2["Frames Dropped"] = r2.droppedVideoFrames), this.canvasRenderer && (t2["Frames Rendered"] = this._framesRendered), this.videoElement.buffered.length > 0) {
      const e3 = this.videoElement.buffered.end(this.videoElement.buffered.length - 1) - this.videoElement.currentTime;
      t2["Buffer Ahead"] = `${e3.toFixed(1)}s`;
    }
    if (this.hls) {
      const s3 = this.hls.levels;
      if (s3 && s3.length > 1) {
        const i4 = e2 ? `${e2.height}p` : "N/A";
        t2["HLS Level"] = this.hls.autoLevelEnabled ? `Auto (${i4})` : i4;
        const r4 = Math.min(...s3.map((t3) => t3.height)), n3 = Math.max(...s3.map((t3) => t3.height));
        t2["Available Levels"] = `${s3.length} (${r4}p–${n3}p)`;
      }
      this.hls.bandwidthEstimate && (t2["Bandwidth Estimate"] = `${(this.hls.bandwidthEstimate / 1e3).toFixed(0)} kbps`);
      const i3 = this.hls.latency;
      i3 > 0 && (t2["Live Latency"] = `${i3.toFixed(1)}s`);
      const r3 = s3?.[this.hls.currentLevel]?.details;
      r3 && (t2["Stream Type"] = r3.live ? "Live" : "VOD");
    }
    const n2 = performance.memory;
    return n2 && (t2["Memory Used"] = `${(n2.usedJSHeapSize / 1048576).toFixed(0)} MB`), t2;
  }
  getNetworkSpeed() {
    return this.hls?.bandwidthEstimate ? this.hls.bandwidthEstimate / 8 : 0;
  }
  isFileSource() {
    return false;
  }
  destroy() {
    this.stopFrameLoop(), this.hls && (this.hls.destroy(), this.hls = null), this.canvasRenderer?.setSubtitleOverlay(null), this.textContainer?.parentNode && this.textContainer.parentNode.removeChild(this.textContainer), this.textContainer = null, this.pendingCues = [], this.videoElement.removeAttribute("src"), this.videoElement.load(), this.videoElement.parentNode && this.videoElement.parentNode.removeChild(this.videoElement), this.eventHandlers.clear(), this.removeAllListeners();
  }
  eventHandlers = /* @__PURE__ */ new Map();
}
export {
  HLSPlayerWrapper
};
