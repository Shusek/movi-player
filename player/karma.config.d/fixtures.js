const path = require("path");

const kotlinAssets = path.resolve(config.basePath, "kotlin");
const configuredBrowsers = config.browsers || [];
const browserLaunchers = { ...(config.customLaunchers || {}) };
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
        browser === "ChromeHeadless" ? "KMediaWasmChromeHeadless" : browser
    ),
});
