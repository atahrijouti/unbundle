import path from "node:path"
import fs from "node:fs"

export let CONFIG = {
  BASE_URL: "/",
}

let appConfig = {}

if (fs.existsSync("./unbundle.config.js")) {
  appConfig = (await import(path.resolve("./unbundle.config.js"))).default
}

if (appConfig != null && typeof appConfig === "object") {
  CONFIG = { ...CONFIG, ...appConfig }
  if (!CONFIG.BASE_URL?.endsWith("/")) {
    CONFIG.BASE_URL += "/"
  }
}
