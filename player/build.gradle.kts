@file:OptIn(org.jetbrains.kotlin.gradle.ExperimentalWasmDsl::class)

plugins {
    alias(libs.plugins.multiplatform)
    alias(libs.plugins.vanniktech.maven.publish)
}

kotlin {
    explicitApi()

    wasmJs {
        outputModuleName.set("movi-player")
        browser {
            testTask {
                useKarma {
                    useChromeHeadless()
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

mavenPublishing {
    coordinates(
        groupId = "io.github.shusek",
        artifactId = "movi-player",
        version = project.version.toString(),
    )
    pom {
        name.set("Movi Player Kotlin/Wasm")
        description.set("Headless browser media engine for Kotlin/Wasm.")
        inceptionYear.set("2026")
        url.set("https://github.com/Shusek/movi-player")
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
            connection.set("scm:git:https://github.com/Shusek/movi-player.git")
            developerConnection.set("scm:git:ssh://git@github.com/Shusek/movi-player.git")
            url.set("https://github.com/Shusek/movi-player")
        }
    }
    publishToMavenCentral()
    if (providers.gradleProperty("releaseSigningEnabled").orNull?.toBoolean() == true) {
        signAllPublications()
    }
}
