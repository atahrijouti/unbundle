import path from "node:path"
import fs from "node:fs"
import { pathToFileURL } from "node:url"
import esbuild from "esbuild"
import prettier from "prettier"
import type { Metadata, Module } from "../types"
import { html } from "../client/tags"
import { CONFIG } from "./config"

const HMR_STRING = `<script>
  let ws = new WebSocket("ws://localhost:3000");
  ws.onmessage = function (event) {
      if (event.data === "reload") {
          console.log("File change detected, reloading page...");
          window.location.reload();
      }
  };
  ws.onerror = function (error) {
      console.error("WebSocket error:", error);
  };
  ws.onclose = function () {
      console.log("WebSocket connection closed");
      setTimeout(()=>{ window.location.reload(); }, 1000)
  };
  </script>`

const assembleMetadata = (metadata: Metadata) => {
  const metaTags: string[] = []
  for (const [key, value] of Object.entries(metadata)) {
    if (!value) continue

    switch (key) {
      case "theme-color":
      case "color-scheme":
      case "description":
        // prettier-ignore
        metaTags.push(html`<meta name="${key}" content="${value.replaceAll('"', "&quot;").replaceAll("'", "&#39;")}" />`)
        break
      case "manifest":
        metaTags.push(html`<link rel="manifest" href="${value}" />`)
        break
      case "icon":
        metaTags.push(html`<link rel="icon" href="${value}" type="image/png" />`)
        break
    }
  }

  return metaTags.join("\n")
}

const errorPage = (status: number, pageName: string, message: string) => {
  console.error(message)
  return {
    status,
    html: `<title>${pageName} - ${status}</title><p>${message}</p>${HMR_STRING}`,
  }
}

const importModule = async <T>(filePath: string, cacheBuster: string): Promise<T | null> => {
  if (!fs.existsSync(filePath)) return null
  return import(pathToFileURL(filePath).href + cacheBuster)
}

const compileSyncScript = async (filePath: string) => {
  const result = await esbuild.build({
    entryPoints: [filePath],
    logLevel: "warning",
    format: "esm",
    target: "esnext",
    platform: "browser",
    write: false,
    bundle: false,
    minify: false,
  })

  return `<script>(() => {\n${result.outputFiles[0]?.text ?? ""}\n})()</script>`
}

export const assemblePage = async (pageName: string): Promise<{ status: number; html: string }> => {
  const cacheBuster = process.env.NODE_ENV === "development" ? `?t=${Date.now()}` : ""

  const pageDir = path.resolve(`./src/app/${pageName}`)
  const modulePath = path.join(pageDir, "index.ts")
  const siteMetadataPath = path.resolve("./src/metadata.ts")

  let siteMetadata: { metadata?: Metadata } | null
  try {
    siteMetadata = await importModule<{ metadata?: Metadata }>(siteMetadataPath, cacheBuster)
  } catch (err) {
    return errorPage(500, pageName, `Failed to load ${siteMetadataPath}: ${err}`)
  }
  if (siteMetadata?.metadata == null) {
    return errorPage(500, pageName, `Missing metadata export: ${siteMetadataPath}`)
  }

  let module: Module | null
  try {
    module = await importModule<Module>(modulePath, cacheBuster)
  } catch (err) {
    return errorPage(500, pageName, `Failed to load ${modulePath}: ${err}`)
  }
  if (module == null) {
    return errorPage(500, pageName, `Can't access module: ${modulePath}`)
  }
  if (module.content == null) {
    return errorPage(400, pageName, `Missing content export: ${modulePath}`)
  }

  const layoutName = module.config?.layout ?? "main"
  const layoutDir = path.resolve(`./src/layouts/${layoutName}`)
  const layoutPath = path.join(layoutDir, "layout.html")

  if (!fs.existsSync(layoutPath)) {
    return errorPage(500, pageName, `Can't access layout: ${layoutPath}`)
  }

  let layoutMetadata: { metadata?: Partial<Metadata> } | null
  let syncScriptsHtml = ""
  try {
    layoutMetadata = await importModule(path.join(layoutDir, "metadata.ts"), cacheBuster)

    for (const dir of [layoutDir, pageDir]) {
      const syncPath = path.join(dir, "sync.ts")
      if (fs.existsSync(syncPath)) {
        syncScriptsHtml += await compileSyncScript(syncPath)
      }
    }
  } catch (err) {
    return errorPage(500, pageName, `${err}`)
  }

  const metadata: Metadata = {
    ...siteMetadata.metadata,
    ...layoutMetadata?.metadata,
    ...module.metadata,
  }

  const layoutUrl = `${CONFIG.BASE_URL}layouts/${layoutName}`
  const pageUrl = `${CONFIG.BASE_URL}app/${pageName}`

  let stylesHtml = ""
  if (fs.existsSync(path.join(layoutDir, "styles.css"))) {
    stylesHtml += html`<link rel="stylesheet" href="${layoutUrl}/styles.css" />`
  }
  if (fs.existsSync(path.join(pageDir, "styles.css"))) {
    stylesHtml += html`<link rel="stylesheet" href="${pageUrl}/styles.css" />`
  }

  let scriptsHtml = ""

  const importMapPath = `./src/import-map.json`
  if (fs.existsSync(importMapPath)) {
    const importMap = JSON.parse(await fs.promises.readFile(importMapPath, "utf-8")) as Record<
      string,
      string
    >

    const renderImportmap =
      CONFIG.BASE_URL === "/"
        ? JSON.stringify(importMap)
        : JSON.stringify(
            Object.fromEntries(
              Object.entries(importMap).map(([key, val]) => {
                let newVal = val
                if (val.startsWith("./")) {
                  newVal = val.replace(/^\.\//, CONFIG.BASE_URL)
                }
                return [key, newVal]
              }),
            ),
          )

    scriptsHtml += html`<script type="importmap">
      {
        "imports": ${renderImportmap}
      }
    </script>`
  }

  if (fs.existsSync(path.join(layoutDir, "global.ts"))) {
    scriptsHtml += html`<script type="module" src="${layoutUrl}/global.js"></script>`
  }

  scriptsHtml += html`<script type="module" src="${pageUrl}/index.js"></script>`

  if (process.env.NODE_ENV === "development") {
    scriptsHtml += HMR_STRING
  }

  let assembledHtml = await fs.promises.readFile(layoutPath, "utf-8")

  assembledHtml = assembledHtml.replace("{{title}}", metadata.title)
  assembledHtml = assembledHtml.replace("<!-- {{sync-scripts}} -->", syncScriptsHtml)
  assembledHtml = assembledHtml.replace("<!-- {{styles}} -->", stylesHtml)
  assembledHtml = assembledHtml.replace("<!-- {{scripts}} -->", scriptsHtml)
  assembledHtml = assembledHtml.replace("<!-- {{metadata}} -->", assembleMetadata(metadata))
  assembledHtml = assembledHtml.replace("<!-- {{content}} -->", module.content())

  if (process.env.NODE_ENV !== "production") {
    assembledHtml = assembledHtml.replace(
      /<!-- {{production-only:start}} -->[\s\S]*?<!-- {{production-only:end}} -->/g,
      "",
    )
  }

  if (process.env.NODE_ENV !== "development") {
    const HTML_COMMENT_REGEX = /<!--\s*{{[^}]+}}\s*-->/g
    assembledHtml = assembledHtml.replace(HTML_COMMENT_REGEX, "")
  }

  return {
    status: 200,
    html: await prettier.format(assembledHtml, { parser: "html" }),
  }
}
