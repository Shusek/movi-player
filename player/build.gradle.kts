@file:OptIn(org.jetbrains.kotlin.gradle.ExperimentalWasmDsl::class)

import org.gradle.api.tasks.Copy

plugins {
    alias(libs.plugins.multiplatform)
    alias(libs.plugins.vanniktech.maven.publish)
}

val wasmTestBrowser = providers.gradleProperty("kmediaWasm.testBrowser").orElse("chrome")

kotlin {
    explicitApi()

    wasmJs {
        outputModuleName.set("kmedia-wasm-engine")
        browser {
            testTask {
                val macOsFirefox = file("/Applications/Firefox.app/Contents/MacOS/firefox")
                if (wasmTestBrowser.get().equals("firefox", ignoreCase = true) && macOsFirefox.isFile) {
                    environment("FIREFOX_BIN", macOsFirefox.absolutePath)
                }
                useKarma {
                    when (wasmTestBrowser.get().lowercase()) {
                        "chrome", "chromium" -> useChromeHeadless()
                        "firefox" -> useFirefoxHeadless()
                        "safari", "webkit" -> useSafari()
                        else ->
                            throw GradleException(
                                "Unsupported kmediaWasm.testBrowser=${wasmTestBrowser.get()}; " +
                                    "expected chrome, firefox or safari.",
                            )
                    }
                }
            }
        }
    }

    sourceSets {
        wasmJsMain.dependencies {
            api(libs.kotlinx.coroutines.core)
            api(libs.kotlinx.browser)
            implementation(npm("hls.js", "1.6.16"))
            implementation(npm("dashjs", "5.2.0"))
            implementation(npm("shaka-player", "4.11.2"))
        }
        wasmJsTest.dependencies {
            implementation(kotlin("test"))
            implementation(libs.kotlinx.coroutines.test)
        }
    }
}

tasks.named<Copy>("wasmJsTestProcessResources") {
    from(rootProject.layout.projectDirectory.dir("test-fixtures"))
    from(rootProject.layout.projectDirectory.dir("cdn/chunks")) {
        include("kmedia-wasm.js", "kmedia-wasm.wasm", "kmedia-wasm-runtime.json")
        into("kmedia-wasm-runtime")
    }
}

mavenPublishing {
    coordinates(
        groupId = "io.github.shusek",
        artifactId = "kmedia-wasm-engine",
        version = project.version.toString(),
    )
    pom {
        name.set("KMedia Wasm Engine")
        description.set("Headless browser media engine for Kotlin/Wasm.")
        inceptionYear.set("2026")
        url.set("https://github.com/Shusek/kmedia-wasm-engine")
        licenses {
            license {
                name.set("Apache License 2.0")
                url.set("https://www.apache.org/licenses/LICENSE-2.0.txt")
                distribution.set("repo")
            }
        }
        developers {
            developer {
                id.set("Shusek")
                name.set("Shusek")
            }
        }
        scm {
            connection.set("scm:git:https://github.com/Shusek/kmedia-wasm-engine.git")
            developerConnection.set("scm:git:ssh://git@github.com/Shusek/kmedia-wasm-engine.git")
            url.set("https://github.com/Shusek/kmedia-wasm-engine")
        }
    }
    publishToMavenCentral()
    if (providers.gradleProperty("releaseSigningEnabled").orNull?.toBoolean() == true) {
        signAllPublications()
    }
}
