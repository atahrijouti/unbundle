import fsPromises from "node:fs/promises"
import fs from "node:fs"
import path from "node:path"
import { logTag } from "./functions"

export const remakeDir = async (dir: string) => {
  await fsPromises.rm(dir, { recursive: true, force: true })
  await fsPromises.mkdir(dir, { recursive: true })
}

export const copyKeepingStructure = async (node: string, srcRoot: string, destRoot: string) => {
  if (!fs.existsSync(node)) return
  const fileRelativePath = path.relative(srcRoot, node)
  const outputPath = path.join(destRoot, fileRelativePath)

  logTag("Copy", fileRelativePath)
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })

  await fs.promises.cp(node, outputPath, { recursive: true })
}

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
