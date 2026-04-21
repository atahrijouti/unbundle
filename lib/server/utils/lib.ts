import fs from "node:fs"
import path from "node:path"

export const SERVED_MIME_TYPES: Record<string, string> = {
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

export const getPages = () => {
  return fs
    .readdirSync("./src/app")
    .filter((name) => fs.statSync(path.join("./src/app", name)).isDirectory())
}
