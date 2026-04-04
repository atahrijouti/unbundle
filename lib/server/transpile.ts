import esbuild from "esbuild"
import prettier from "prettier"
import fs from "node:fs"
import path from "node:path"

const SRC_FOLDER = "./src"
const DIST_FOLDER = "./dist"
const NODE_MODULES_FOLDER = "./node_modules"

export const listAllFiles = (dir: string): string[] => {
  const files: string[] = []
  const entries = fs.readdirSync(dir)

  for (const entry of entries) {
    const fullPath = path.join(dir, entry)
    if (fs.statSync(fullPath).isDirectory()) {
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

  fs.mkdirSync(path.dirname(outputPath), { recursive: true })

  await fs.promises.cp(file, outputPath, { recursive: true })
}

export const copyNodeModulesDependencies = async () => {
  let nodeModulesPromises: Promise<void>[] = []

  const importMapPath = `${SRC_FOLDER}/import-map.json`
  if (fs.existsSync(importMapPath)) {
    const importMap = JSON.parse(await fs.promises.readFile(importMapPath, "utf-8")) as Record<
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
  }

  await Promise.all(nodeModulesPromises)
}

export const prepareDist = async () => {
  await copyNodeModulesDependencies()

  const allFiles = listAllFiles(SRC_FOLDER)
  const tsFiles = allFiles.filter((f) => path.extname(f) === ".ts")
  const otherFiles = allFiles.filter((f) => path.extname(f) !== ".ts")

  await Promise.all(otherFiles.map((f) => copyKeepingStructure(f, SRC_FOLDER, DIST_FOLDER)))
  await transpileTsFiles(tsFiles)
}

export const transpileTsFiles = async (files: string[]) => {
  const tsFiles = files.filter((f) => {
    if (path.extname(f) === ".ts") return true
    console.warn("transpileTsFiles: skipping non-.ts file:", f)
    return false
  })

  const esbuildPromise = esbuild.build({
    logLevel: "debug",
    entryPoints: tsFiles,
    outdir: DIST_FOLDER,
    outbase: SRC_FOLDER,
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
