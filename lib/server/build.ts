#!/usr/bin/env bun

import { $ } from "bun"
import { assemblePage } from "./assemble-page"
import { copyNodeModulesDependencies, listAllFiles, transpileOrCopyFiles } from "./transpile"
import { getPages } from "./utils"

const OUT_DIR = "out"
const SRC_FOLDER = "src"
const DIST_FOLDER = "dist"
const PUBLIC_FOLDER = "public"

const pages = getPages()

const build = async () => {
  console.log("Starting build process...")

  await $`rm -rf ${OUT_DIR}`
  await $`mkdir -p ${OUT_DIR}`

  try {
    await copyNodeModulesDependencies()
  } catch (err) {
    console.error("Error while copying node_module depencies:", err)
    process.exit(1)
  }

  try {
    await transpileOrCopyFiles(listAllFiles(SRC_FOLDER))
  } catch (err) {
    console.error("Error during transpilation:", err)
    process.exit(1)
  }

  await $`cp -R ${PUBLIC_FOLDER}/* ${OUT_DIR}/`
  await $`cp -R ${DIST_FOLDER}/* ${OUT_DIR}/`

  for (const page of pages) {
    const { html } = await assemblePage(page)
    const fileName = page === "home" ? "index" : page
    const outputFile = `${OUT_DIR}/${fileName}.html`
    await Bun.write(outputFile, html)
    console.log(`Generated: ${outputFile}`)
  }

  console.log("Build completed successfully!")
}

build().catch(console.error)
