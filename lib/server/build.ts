#!/usr/bin/env -S node --experimental-strip-types

import fs from "node:fs"
import path from "node:path"
import { assemblePage } from "./assemble-page"
import {
  copyKeepingStructure,
  copyNodeModulesDependencies,
  listAllFiles,
  transpileTsFiles,
} from "./transpile"
import { getPages } from "./utils"

const OUT_DIR = "out"
const SRC_FOLDER = "src"
const DIST_FOLDER = "dist"
const PUBLIC_FOLDER = "public"

const pages = getPages()

const build = async () => {
  console.log("Starting build process...")

  await fs.promises.rm(OUT_DIR, { recursive: true, force: true })
  await fs.promises.mkdir(OUT_DIR, { recursive: true })

  try {
    await copyNodeModulesDependencies()
  } catch (err) {
    console.error("Error while copying node_module depencies:", err)
    process.exit(1)
  }

  try {
    const allFiles = listAllFiles(SRC_FOLDER)
    const tsFiles = allFiles.filter((f) => path.extname(f) === ".ts")
    const otherFiles = allFiles.filter((f) => path.extname(f) !== ".ts")
    await Promise.all(otherFiles.map((f) => copyKeepingStructure(f, SRC_FOLDER, DIST_FOLDER)))
    await transpileTsFiles(tsFiles)
  } catch (err) {
    console.error("Error during transpilation:", err)
    process.exit(1)
  }

  await fs.promises.cp(PUBLIC_FOLDER, OUT_DIR, { recursive: true })
  await fs.promises.cp(DIST_FOLDER, OUT_DIR, { recursive: true })

  for (const page of pages) {
    const { html } = await assemblePage(page)
    const fileName = page === "home" ? "index" : page
    const outputFile = `${OUT_DIR}/${fileName}.html`
    await fs.promises.writeFile(outputFile, html, "utf-8")
    console.log(`Generated: ${outputFile}`)
  }

  console.log("Build completed successfully!")
}

build().catch(console.error)
