#!/usr/bin/env node

import fs from "node:fs"
import { assemblePage } from "./assemble-page"
import { prepareDist } from "./transpile"
import { getPages } from "./utils"

const OUT_DIR = "out"
const DIST_FOLDER = "dist"
const PUBLIC_FOLDER = "public"

const pages = getPages()

const build = async () => {
  console.log("Starting build process...")

  await fs.promises.rm(OUT_DIR, { recursive: true, force: true })
  await fs.promises.mkdir(OUT_DIR, { recursive: true })

  try {
    await prepareDist()
  } catch (err) {
    console.error("Error preparing dist:", err)
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
