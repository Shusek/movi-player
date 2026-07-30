import org.gradle.api.initialization.resolve.RepositoriesMode

pluginManagement {
    repositories {
        gradlePluginPortal()
        mavenCentral()
        google()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        mavenCentral()
        exclusiveContent {
            forRepository {
                ivy {
                    name = "nodeJsDistributions"
                    url = uri("https://nodejs.org/dist")
                    patternLayout {
                        artifact("v[revision]/[artifact](-v[revision]-[classifier]).[ext]")
                    }
                    metadataSources {
                        artifact()
                    }
                }
            }
            filter {
                includeModule("org.nodejs", "node")
            }
        }
        exclusiveContent {
            forRepository {
                ivy {
                    name = "yarnDistributions"
                    url = uri("https://github.com/yarnpkg/yarn/releases/download")
                    patternLayout {
                        artifact("v[revision]/[artifact](-v[revision]).[ext]")
                    }
                    metadataSources {
                        artifact()
                    }
                }
            }
            filter {
                includeModule("com.yarnpkg", "yarn")
            }
        }
        exclusiveContent {
            forRepository {
                ivy {
                    name = "binaryenDistributions"
                    url = uri("https://github.com/WebAssembly/binaryen/releases/download")
                    patternLayout {
                        artifact("version_[revision]/[artifact]-version_[revision]-[classifier].[ext]")
                    }
                    metadataSources {
                        artifact()
                    }
                }
            }
            filter {
                includeModule("com.github.webassembly", "binaryen")
            }
        }
    }
}

rootProject.name = "movi-player"

include(":player")
include(":runtime-assets")
