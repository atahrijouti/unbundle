import path from "node:path"
import fs from "node:fs"
import { pathToFileURL } from "node:url"

const SRC_FOLDER = "src"
const OUT_DIR = "out"
const DIST_FOLDER = "dist"
const PUBLIC_FOLDER = "public"
const NODE_MODULES_FOLDER = "node_modules"

export let CONFIG = {
  BASE_URL: "/",
  SRC_FOLDER,
  OUT_DIR,
  DIST_FOLDER,
  PUBLIC_FOLDER,
  NODE_MODULES_FOLDER,
  PORT: 3000,
  HOST: undefined as string | undefined,
}

export type UNBUNDLE_CONFIG = typeof CONFIG

let appConfig = {}

if (fs.existsSync("./unbundle.config.js")) {
  appConfig = (await import(pathToFileURL(path.resolve("./unbundle.config.js")).href)).default
}

if (appConfig != null && typeof appConfig === "object") {
  CONFIG = { ...CONFIG, ...appConfig }
  if (!CONFIG.BASE_URL?.endsWith("/")) {
    CONFIG.BASE_URL += "/"
  }
}
