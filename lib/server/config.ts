import path from "path"

export let CONFIG = {
  BASE_URL: "/",
}

try {
  const appConfig = (await import(path.resolve("./unbundle.config.js"))).default
  if (appConfig != null || typeof appConfig === "object") {
    CONFIG = { ...CONFIG, ...appConfig }
    if (!CONFIG.BASE_URL.endsWith("/")) {
      CONFIG.BASE_URL += "/"
    }
  }
} catch (e) {
  console.log("Skipping unbundle.config.js", e)
}
