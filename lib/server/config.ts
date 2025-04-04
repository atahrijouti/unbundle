import path from "path"

export let CONFIG = {
  BASE_URL: "/",
}

let appConfig = {}

if (await Bun.file("./unbundle.config.js").exists()) {
  appConfig = (await import(path.resolve("./unbundle.config.js"))).default
}

if (appConfig != null || typeof appConfig === "object") {
  CONFIG = { ...CONFIG, ...appConfig }
  if (!CONFIG.BASE_URL?.endsWith("/")) {
    CONFIG.BASE_URL += "/"
  }
}
