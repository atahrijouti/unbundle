#!/usr/bin/env node

import fs from "node:fs"
import path from "node:path"
import { createServer } from "node:http"
import { WebSocketServer, type WebSocket } from "ws"

import { assemblePage } from "./assemble-page"
import { copyNodeModulesDependencies, prepareDist, transpileTsFiles } from "./transpile"
import { getPages, SERVED_MIME_TYPES } from "./utils/lib"
import { debounce } from "./utils/functions"
import { copyKeepingStructure, remakeDir } from "./utils/fs"
import { CONFIG } from "./config"

process.env.NODE_ENV ??= "development"

const IGNORED_EXTENSIONS = new Set([".bck"])

const sockets = new Set<WebSocket>()

const reloadPageMessage = (ws: WebSocket) => {
  ws.send("reload")
}

const reloadDevEnvironment = debounce(() => {
  sockets.forEach((ws) => {
    reloadPageMessage(ws)
  })
}, 750)

await remakeDir(CONFIG.DIST_FOLDER)

try {
  await prepareDist()
} catch (err) {
  console.error("Error preparing dist:", err)
}

const pendingChanges = new Set<string>()
let pendingNodeModulesCopy = false

const flushChanges = debounce(async () => {
  const files = [...pendingChanges]
  pendingChanges.clear()

  try {
    if (pendingNodeModulesCopy) {
      pendingNodeModulesCopy = false
      await copyNodeModulesDependencies()
    }

    const tsFiles = files.filter((f) => path.extname(f) === ".ts")
    const otherFiles = files.filter((f) => path.extname(f) !== ".ts")

    await Promise.all([
      tsFiles.length > 0 ? transpileTsFiles(tsFiles) : Promise.resolve(),
      ...otherFiles.map((f) => copyKeepingStructure(f, CONFIG.SRC_FOLDER, CONFIG.DIST_FOLDER)),
    ])
  } catch (err) {
    console.error("Error during transpilation:", err)
  }

  reloadDevEnvironment()
}, 50)

const watcher = fs.watch(CONFIG.SRC_FOLDER, { recursive: true, persistent: true })
watcher.on("change", (_, filename) => {
  if (!filename || typeof filename !== "string") return
  if (IGNORED_EXTENSIONS.has(path.extname(filename))) return

  const fullPath = path.join(CONFIG.SRC_FOLDER, filename)
  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) return

  if (filename === "import-map.json") {
    pendingNodeModulesCopy = true
  }

  pendingChanges.add(fullPath)
  flushChanges()
})

const serveStaticFile = async (
  filePath: string,
): Promise<{ body: Buffer; contentType: string } | null> => {
  let resolvedPath = filePath
  try {
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      const dirIndexStat = fs.statSync(path.join(filePath, "index.html"))
      if (!dirIndexStat.isFile()) {
        return null
      }
      resolvedPath = path.join(filePath, "index.html")
    }
  } catch {
    return null
  }

  const ext = path.extname(resolvedPath).toLowerCase()
  const contentType = SERVED_MIME_TYPES[ext] ?? "application/octet-stream"
  const body = await fs.promises.readFile(resolvedPath)
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
