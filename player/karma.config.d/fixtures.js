const path = require("path");

const kotlinAssets = path.resolve(config.basePath, "kotlin");
const configuredBrowsers = config.browsers || [];
const browserLaunchers = { ...(config.customLaunchers || {}) };
let playwrightWebKitPlugin = null;
if (configuredBrowsers.includes("ChromeHeadless")) {
    browserLaunchers.KMediaWasmChromeHeadless = {
        base: "Chrome",
        flags: [
            "--headless=new",
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--enable-webgl",
            "--enable-unsafe-swiftshader",
            "--ignore-gpu-blocklist",
            "--use-gl=angle",
            "--use-angle=swiftshader",
        ],
    };
}
if (configuredBrowsers.includes("Safari")) {
    const PlaywrightWebKitBrowser = function(baseBrowserDecorator, logger) {
        baseBrowserDecorator(this);
        const log = logger.create("PlaywrightWebKitLauncher");
        let browser = null;

        this._start = function(url) {
            const launcher = this;
            const { webkit } = require("playwright");
            webkit.launch({ headless: true })
                .then(instance => {
                    browser = instance;
                    return instance.newPage();
                })
                .then(page => page.goto(url))
                .catch(error => {
                    log.error(`Cannot start Playwright WebKit: ${error && error.stack || error}`);
                    launcher._done("cannot start");
                });
        };

        this.on("kill", function(done) {
            const active = browser;
            browser = null;
            Promise.resolve(active && active.close())
                .catch(() => {})
                .then(() => done());
        });
    };
    PlaywrightWebKitBrowser.prototype = { name: "PlaywrightWebKit" };
    PlaywrightWebKitBrowser.$inject = ["baseBrowserDecorator", "logger"];
    playwrightWebKitPlugin = {
        "launcher:KMediaWasmWebKit": ["type", PlaywrightWebKitBrowser],
    };
}
if (playwrightWebKitPlugin) {
    config.plugins = config.plugins || [];
    config.plugins.push(playwrightWebKitPlugin);
}
config.set({
    files: (config.files || []).concat([
        {
            pattern: path.join(kotlinAssets, "media", "**", "*"),
            included: false,
            served: true,
            watched: false,
        },
        {
            pattern: path.join(kotlinAssets, "subtitles", "**", "*"),
            included: false,
            served: true,
            watched: false,
        },
        {
            pattern: path.join(kotlinAssets, "kmedia-wasm-runtime", "**", "*"),
            included: false,
            served: true,
            watched: false,
        },
    ]),
    browserNoActivityTimeout: 120000,
    browserDisconnectTimeout: 120000,
    captureTimeout: 120000,
    client: {
        ...(config.client || {}),
        mocha: {
            ...((config.client && config.client.mocha) || {}),
            timeout: 120000,
        },
    },
    customLaunchers: browserLaunchers,
    browsers: configuredBrowsers.map(browser =>
        browser === "ChromeHeadless"
            ? "KMediaWasmChromeHeadless"
            : browser === "Safari"
                ? "KMediaWasmWebKit"
                : browser
    ),
});
