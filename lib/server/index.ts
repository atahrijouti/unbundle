#!/usr/bin/env bun

import { watch } from "fs"

import { $, type ServerWebSocket } from "bun"
import { assemblePage } from "./assemble-page"
import { copyNodeModulesDependencies, listAllFiles, transpileOrCopyFiles } from "./transpile"
import { clearImportCache, debounce, getPages } from "@/server/utils"

process.env.NODE_ENV = "development"

const SRC_FOLDER = "src"
const DIST_FOLDER = "dist"

const sockets = new Set<ServerWebSocket<unknown>>()

const remakeDist = async () => {
  await $`rm -rf ${DIST_FOLDER}`
  await $`mkdir -p ${DIST_FOLDER}`
}

const reloadPageMessage = (ws: ServerWebSocket<unknown>) => {
  // console.log(`WebSocket :\tChange detected, reload the browser`)
  ws.send("reload")
}

const reloadDevEnvironment = debounce(() => {
  clearImportCache()
  sockets.forEach((ws) => {
    reloadPageMessage(ws)
  })
}, 750)

await remakeDist()

try {
  await copyNodeModulesDependencies()
} catch (err) {
  console.error("Error while copying node_module depencies:", err)
}

try {
  await transpileOrCopyFiles(listAllFiles(SRC_FOLDER))
} catch (err) {
  console.error("Error during transpilation:", err)
}

const watcher = watch("./src", { recursive: true, persistent: true })
watcher.on("change", async (_, filename) => {
  // console.log(`File Watcher :\tevent [${_}}], file[${SRC_FOLDER}/${filename}]`)
  if (filename == `${SRC_FOLDER}/import-map.json`) {
    try {
      await copyNodeModulesDependencies()
    } catch (err) {
      console.error("Error while copying node_module depencies:", err)
    }
  }
  try {
    await transpileOrCopyFiles([`${SRC_FOLDER}/${filename}`])
  } catch (err) {
    console.error("Error during transpilation:", err)
  }
  reloadDevEnvironment()
})

const server = Bun.serve({
  port: 3000,
  fetch: async (req, server) => {
    if (server.upgrade(req)) {
      return undefined
    }

    const url = new URL(req.url)
    const pageName = url.pathname === "/" ? "home" : url.pathname.slice(1)

    const pages = new Set(getPages())

    if (pages.has(pageName)) {
      console.log(`Route :\t ${pageName} - ${Date.now()}`)
      const page = await assemblePage(pageName)
      return new Response(page.html, {
        headers: { "Content-Type": "text/html" },
        status: page.status,
      })
    }

    if (await Bun.file(`./dist${url.pathname}`).exists()) {
      return new Response(Bun.file(`./dist${url.pathname}`))
    }

    if (await Bun.file(`./public${url.pathname}`).exists()) {
      return new Response(Bun.file(`./public${url.pathname}`))
    }

    return new Response("404 :-/", {
      headers: { "Content-Type": "text/html" },
      status: 404,
    })
  },
  websocket: {
    open(ws) {
      sockets.add(ws)
    },
    async message() {},
    close: (ws) => {
      sockets.delete(ws)
    },
  },
})

console.log(`Bun server running on http://localhost:${server.port}`)
