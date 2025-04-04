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

  await $`cp ${file} ${outputPath}`
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

  let nodeModulesPromises: Promise<void>[] = []

  if (await Bun.file(`${SRC_FOLDER}/import-map.json`).exists()) {
    try {
      const importMap = (await Bun.file(`${SRC_FOLDER}/import-map.json`).json()) as Record<
        string,
        string
      >
      nodeModulesPromises = Object.values(importMap)
        .filter((target) => target.startsWith("./node_modules/"))
        .map((target) => {
          const relativeToNodeModules = target.replace("./node_modules/", "")
          const src = path.join(NODE_MODULES_FOLDER, relativeToNodeModules)
          const dest = path.join(`${DIST_FOLDER}/node_modules`, relativeToNodeModules)
          return copyKeepingStructure(target, src, dest)
        })
    } catch (e) {
      console.warn("Skipping import map, cound't process it", e)
    }
  }

  await Promise.all([esbuildPromise, ...nodeModulesPromises])
}
