import { $ } from "bun"
import esbuild from "esbuild"
import prettier from "prettier"
import { mkdirSync, readdirSync, statSync } from "fs"
import path from "path"

const SRC_FOLDER = "./src"
const DIST_FOLDER = "./dist"
const NODE_MODULES_FOLDER = "./node_modules"

export const listAllFiles = (dir: string): string[] => {
  const files: string[] = []
  const entries = readdirSync(dir)

  for (const entry of entries) {
    const fullPath = path.join(dir, entry)
    if (statSync(fullPath).isDirectory()) {
      files.push(...listAllFiles(fullPath))
    } else {
      files.push(fullPath)
    }
  }

  return files
}

export const copyKeepingStructure = async (file: string, src: string, dest: string) => {
  const fileRelativePath = path.relative(src, file)
  const outputPath = path.join(dest, fileRelativePath)

  mkdirSync(path.dirname(outputPath), { recursive: true })

  await $`cp -R ${file} ${outputPath}`
}

export const copyNodeModulesDependencies = async () => {
  let nodeModulesPromises: Promise<void>[] = []

  if (await Bun.file(`${SRC_FOLDER}/import-map.json`).exists()) {
    const importMap = (await Bun.file(`${SRC_FOLDER}/import-map.json`).json()) as Record<
      string,
      string
    >
    // console.log(
    // `Delving into import-map.json ${JSON.stringify(importMap)}, and initiating node_modules copying`,
    // )

    nodeModulesPromises = Object.values(importMap)
      .filter((target) => target.startsWith("./node_modules/"))
      .map((target) => {
        const relativeToNodeModules = target.replace("./node_modules/", "")
        const src = path.join(NODE_MODULES_FOLDER, relativeToNodeModules)
        const dest = path.join(`${DIST_FOLDER}/node_modules`, relativeToNodeModules)
        return copyKeepingStructure(target, src, dest)
      })
  }

  await Promise.all(nodeModulesPromises)
}

export const transpileOrCopyFiles = async (files: string[]) => {
  const esbuildPromise = esbuild.build({
    logLevel: "debug",
    entryPoints: files,
    outdir: DIST_FOLDER,
    outbase: SRC_FOLDER,
    format: "esm",
    target: "esnext",
    platform: "browser",
    write: false,
    bundle: false,
    minify: false,
    loader: { ".html": "copy", ".json": "copy", ".css": "copy" },
    plugins: [
      {
        name: "append-ready",
        setup(build) {
          build.onLoad({ filter: /src[/\\]app[/\\][^/\\]+[/\\]index\.ts$/ }, async ({ path }) => {
            const source = await Bun.file(path).text()
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
              Bun.write(file.path, text)
            }
          })
        },
      },
    ],
  })

  await Promise.all([esbuildPromise])
}
