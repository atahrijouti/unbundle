import path from "path"

export let CONFIG = {
  BASE_URL: "/",
}

try {
  const appConfig = await import(path.resolve("./unbundle.config.js"))
  if (appConfig != null || typeof appConfig === "object") {
    CONFIG = { ...CONFIG, ...appConfig }
  }
} catch (e) {
  console.log("Skipping unbundle.config.js", e)
}
