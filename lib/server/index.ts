#!/usr/bin/env node

import { watch } from "node:fs"
import fs from "node:fs"
import path from "node:path"
import { createServer } from "node:http"
import { WebSocketServer, type WebSocket } from "ws"

import { assemblePage } from "./assemble-page"
import {
  copyKeepingStructure,
  copyNodeModulesDependencies,
  prepareDist,
  transpileTsFiles,
} from "./transpile"
import { debounce, getPages } from "./utils"

process.env.NODE_ENV = "development"

const SRC_FOLDER = "src"
const DIST_FOLDER = "dist"

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".webp": "image/webp",
}

const sockets = new Set<WebSocket>()

const remakeDist = async () => {
  await fs.promises.rm(DIST_FOLDER, { recursive: true, force: true })
  await fs.promises.mkdir(DIST_FOLDER, { recursive: true })
}

const reloadPageMessage = (ws: WebSocket) => {
  ws.send("reload")
}

const reloadDevEnvironment = debounce(() => {
  sockets.forEach((ws) => {
    reloadPageMessage(ws)
  })
}, 750)

await remakeDist()

try {
  await prepareDist()
} catch (err) {
  console.error("Error preparing dist:", err)
}

const watcher = watch("./src", { recursive: true, persistent: true })
watcher.on("change", async (_, filename) => {
  if (!filename || typeof filename !== "string") return
  const filePath = path.join(SRC_FOLDER, filename)

  if (filename === "import-map.json") {
    try {
      await copyNodeModulesDependencies()
    } catch (err) {
      console.error("Error while copying node_module dependencies:", err)
    }
  }
  try {
    if (path.extname(filePath) === ".ts") {
      await transpileTsFiles([filePath])
    } else {
      await copyKeepingStructure(filePath, SRC_FOLDER, DIST_FOLDER)
    }
  } catch (err) {
    console.error("Error during transpilation:", err)
  }
  reloadDevEnvironment()
})

const serveStaticFile = async (
  filePath: string,
): Promise<{ body: Buffer; contentType: string } | null> => {
  if (!fs.existsSync(filePath)) return null
  const ext = path.extname(filePath).toLowerCase()
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream"
  const body = await fs.promises.readFile(filePath)
  return { body, contentType }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:3000`)
  const pageName = url.pathname === "/" ? "home" : url.pathname.slice(1)

  const pages = new Set(getPages())

  if (pages.has(pageName)) {
    console.log(`Route :\t ${pageName} - ${Date.now()}`)
    const page = await assemblePage(pageName)
    res.writeHead(page.status, { "Content-Type": "text/html" })
    res.end(page.html)
    return
  }

  const distFile = await serveStaticFile(`./dist${url.pathname}`)
  if (distFile) {
    res.writeHead(200, { "Content-Type": distFile.contentType })
    res.end(distFile.body)
    return
  }

  const publicFile = await serveStaticFile(`./public${url.pathname}`)
  if (publicFile) {
    res.writeHead(200, { "Content-Type": publicFile.contentType })
    res.end(publicFile.body)
    return
  }

  res.writeHead(404, { "Content-Type": "text/html" })
  res.end("404 :-/")
})

const wss = new WebSocketServer({ server })
wss.on("connection", (ws) => {
  sockets.add(ws)
  ws.on("close", () => {
    sockets.delete(ws)
  })
})

server.listen(3000, () => {
  console.log(`Server running on http://localhost:3000`)
})
