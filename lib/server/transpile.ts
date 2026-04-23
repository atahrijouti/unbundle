import esbuild from "esbuild"
import prettier from "prettier"
import fs from "node:fs"
import path from "node:path"
import { copyKeepingStructure, listAllFiles } from "./utils/fs"
import { CONFIG } from "./config"
import { logTag } from "./utils/functions"

export const copyNodeModulesDependencies = async () => {
  let nodeModulesPromises: Promise<void>[] = []

  const importMapPath = `${CONFIG.SRC_FOLDER}/import-map.json`
  if (fs.existsSync(importMapPath)) {
    const importMap = JSON.parse(await fs.promises.readFile(importMapPath, "utf-8")) as Record<
      string,
      string
    >

    nodeModulesPromises = Object.values(importMap)
      .filter((target) => target.startsWith("./node_modules/"))
      .map((target) => {
        return copyKeepingStructure(
          target,
          CONFIG.NODE_MODULES_FOLDER,
          `${CONFIG.DIST_FOLDER}/node_modules`,
        )
      })
  }

  await Promise.all(nodeModulesPromises)
}

export const prepareDist = async () => {
  await copyNodeModulesDependencies()

  const allFiles = listAllFiles(CONFIG.SRC_FOLDER)
  const tsFiles = allFiles.filter((f) => path.extname(f) === ".ts")
  const otherFiles = allFiles.filter((f) => path.extname(f) !== ".ts")

  await Promise.all(
    otherFiles.map((f) => copyKeepingStructure(f, CONFIG.SRC_FOLDER, CONFIG.DIST_FOLDER)),
  )
  await transpileTsFiles(tsFiles)
}

export const transpileTsFiles = async (files: string[]) => {
  const tsFiles = files.filter((f) => {
    if (path.extname(f) === ".ts") return true
    console.warn("transpileTsFiles: skipping non-.ts file:", f)
    return false
  })

  for (const f of tsFiles) {
    logTag("Transpile", path.relative(CONFIG.SRC_FOLDER, f))
  }

  const esbuildPromise = esbuild.build({
    logLevel: "warning",
    entryPoints: tsFiles,
    outdir: CONFIG.DIST_FOLDER,
    outbase: CONFIG.SRC_FOLDER,
    format: "esm",
    target: "esnext",
    platform: "browser",
    write: false,
    bundle: false,
    minify: false,
    plugins: [
      {
        name: "append-ready",
        setup(build) {
          build.onLoad({ filter: /src[/\\]app[/\\][^/\\]+[/\\]index\.ts$/ }, async ({ path }) => {
            const source = await fs.promises.readFile(path, "utf-8")
            if (source.includes("export const ready")) {
              const modifiedSource = `${source}

              document.addEventListener("DOMContentLoaded", ready);
            `

              return {
                contents: modifiedSource,
                loader: "ts",
              }
            }
            return null
          })
        },
      },
      {
        name: "rewrite-ts-imports",
        setup(build) {
          build.onEnd(async (result) => {
            if (!result.outputFiles) return
            for (const file of result.outputFiles) {
              if (file.path.endsWith(".js")) {
                file.contents = new TextEncoder().encode(
                  file.text.replace(/(from\s+["'][.][^"']*?)\.ts(["'])/g, "$1.js$2"),
                )
              }
            }
          })
        },
      },
      {
        name: "prettier-format",
        setup(build) {
          build.onEnd(async (result) => {
            if (!result.outputFiles) {
              return
            }

            for (const file of result.outputFiles) {
              let text = file.text
              if (file.path.endsWith(".js")) {
                const config = (await prettier.resolveConfig(file.path)) || {}
                text = await prettier.format(text, { parser: "babel", ...config })
              }
              await fs.promises.mkdir(path.dirname(file.path), { recursive: true })
              await fs.promises.writeFile(file.path, text, "utf-8")
            }
          })
        },
      },
    ],
  })

  await esbuildPromise
}
