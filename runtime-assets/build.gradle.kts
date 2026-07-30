import org.gradle.api.tasks.bundling.Zip
import java.security.MessageDigest

plugins {
    base
    `maven-publish`
    id("com.vanniktech.maven.publish.base")
}

val runtimeArchive =
    tasks.register<Zip>("runtimeArchive") {
        archiveBaseName.set("movi-player-runtime-assets")
        archiveVersion.set(project.version.toString())
        destinationDirectory.set(layout.buildDirectory.dir("distributions"))
        from(rootProject.layout.projectDirectory.dir("cdn/chunks")) {
            include("movi.js", "movi.wasm")
            into("movi-runtime")
        }
        from(rootProject.layout.projectDirectory) {
            include("LICENSE", "NOTICE", "LGPL_RELINKING.md")
            into("META-INF")
        }
        from(rootProject.layout.projectDirectory.file("cdn/SHA256SUMS")) {
            into("META-INF")
        }
    }

val verifyRuntimeAssets =
    tasks.register("verifyRuntimeAssets") {
        group = "verification"
        description = "Verifies the pinned native runtime files against cdn/SHA256SUMS."
        val checksumFile = rootProject.layout.projectDirectory.file("cdn/SHA256SUMS")
        val runtimeDirectory = rootProject.layout.projectDirectory.dir("cdn")
        inputs.file(checksumFile)
        inputs.files(
            runtimeDirectory.file("chunks/movi.js"),
            runtimeDirectory.file("chunks/movi.wasm"),
        )
        doLast {
            val expected =
                checksumFile.asFile
                    .readLines()
                    .mapNotNull { line ->
                        val columns = line.trim().split(Regex("\\s+"), limit = 2)
                        if (columns.size == 2) columns[1] to columns[0].lowercase() else null
                    }.toMap()
            listOf("chunks/movi.js", "chunks/movi.wasm").forEach { relativePath ->
                val file = runtimeDirectory.file(relativePath).asFile
                val digest =
                    MessageDigest
                        .getInstance("SHA-256")
                        .digest(file.readBytes())
                        .joinToString("") { byte -> "%02x".format(byte) }
                check(digest == expected[relativePath]) {
                    "Checksum mismatch for $relativePath."
                }
            }
        }
    }

runtimeArchive.configure {
    dependsOn(verifyRuntimeAssets)
}

configurations.named("default") {
    outgoing.artifact(runtimeArchive)
}

publishing {
    publications {
        create<MavenPublication>("runtimeAssets") {
            artifactId = "movi-player-runtime-assets"
            artifact(runtimeArchive)
            pom {
                name.set("Movi Player runtime assets")
                description.set("Pinned Emscripten glue and native media WebAssembly runtime.")
                url.set("https://github.com/Shusek/movi-player")
                inceptionYear.set("2026")
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
        }
    }
}

mavenPublishing {
    publishToMavenCentral()
    if (providers.gradleProperty("releaseSigningEnabled").orNull?.toBoolean() == true) {
        signAllPublications()
    }
}
