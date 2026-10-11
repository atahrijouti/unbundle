#!/usr/bin/env node

// lib/server/index.ts
import fs6 from "node:fs";
import path6 from "node:path";
import { createServer } from "node:http";
import { WebSocketServer } from "ws";

// lib/server/assemble-page.ts
import path2 from "node:path";
import fs2 from "node:fs";
import { pathToFileURL } from "node:url";
import esbuild from "esbuild";
import prettier from "prettier";

// lib/client/tags.ts
var html = (strings, ...values) => String.raw({ raw: strings }, ...values);

// lib/server/config.ts
import path from "node:path";
import fs from "node:fs";
var SRC_FOLDER = "src";
var OUT_DIR = "out";
var DIST_FOLDER = "dist";
var PUBLIC_FOLDER = "public";
var NODE_MODULES_FOLDER = "node_modules";
var CONFIG = {
  BASE_URL: "/",
  SRC_FOLDER,
  OUT_DIR,
  DIST_FOLDER,
  PUBLIC_FOLDER,
  NODE_MODULES_FOLDER
};
var appConfig = {};
if (fs.existsSync("./unbundle.config.js")) {
  appConfig = (await import(path.resolve("./unbundle.config.js"))).default;
}
if (appConfig != null && typeof appConfig === "object") {
  CONFIG = { ...CONFIG, ...appConfig };
  if (!CONFIG.BASE_URL?.endsWith("/")) {
    CONFIG.BASE_URL += "/";
  }
}

// lib/server/assemble-page.ts
var HMR_STRING = `<script>
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
  </script>`;
var assembleMetadata = (metadata) => {
  const metaTags = [];
  for (const [key, value] of Object.entries(metadata)) {
    if (!value) continue;
    switch (key) {
      case "theme-color":
      case "color-scheme":
      case "description":
        metaTags.push(html`<meta name="${key}" content="${value.replaceAll('"', "&quot;").replaceAll("'", "&#39;")}" />`);
        break;
      case "manifest":
        metaTags.push(html`<link rel="manifest" href="${value}" />`);
        break;
      case "icon":
        metaTags.push(html`<link rel="icon" href="${value}" type="image/png" />`);
        break;
    }
  }
  return metaTags.join("\n");
};
var errorPage = (status, pageName, message) => {
  console.error(message);
  return {
    status,
    html: `<title>${pageName} - ${status}</title><p>${message}</p>${HMR_STRING}`
  };
};
var importModule = async (filePath, cacheBuster) => {
  if (!fs2.existsSync(filePath)) return null;
  return import(pathToFileURL(filePath).href + cacheBuster);
};
var compileSyncScript = async (filePath) => {
  const result = await esbuild.build({
    entryPoints: [filePath],
    logLevel: "warning",
    format: "esm",
    target: "esnext",
    platform: "browser",
    write: false,
    bundle: false,
    minify: false
  });
  return `<script>(() => {
${result.outputFiles[0]?.text ?? ""}
})()</script>`;
};
var assemblePage = async (pageName) => {
  const cacheBuster = process.env.NODE_ENV === "development" ? `?t=${Date.now()}` : "";
  const pageDir = path2.resolve(`./src/app/${pageName}`);
  const modulePath = path2.join(pageDir, "index.ts");
  const siteMetadataPath = path2.resolve("./src/metadata.ts");
  let siteMetadata;
  try {
    siteMetadata = await importModule(siteMetadataPath, cacheBuster);
  } catch (err) {
    return errorPage(500, pageName, `Failed to load ${siteMetadataPath}: ${err}`);
  }
  if (siteMetadata?.metadata == null) {
    return errorPage(500, pageName, `Missing metadata export: ${siteMetadataPath}`);
  }
  let module;
  try {
    module = await importModule(modulePath, cacheBuster);
  } catch (err) {
    return errorPage(500, pageName, `Failed to load ${modulePath}: ${err}`);
  }
  if (module == null) {
    return errorPage(500, pageName, `Can't access module: ${modulePath}`);
  }
  if (module.content == null) {
    return errorPage(400, pageName, `Missing content export: ${modulePath}`);
  }
  const layoutName = module.config?.layout ?? "main";
  const layoutDir = path2.resolve(`./src/layouts/${layoutName}`);
  const layoutPath = path2.join(layoutDir, "layout.html");
  if (!fs2.existsSync(layoutPath)) {
    return errorPage(500, pageName, `Can't access layout: ${layoutPath}`);
  }
  let layoutMetadata;
  let syncScriptsHtml = "";
  try {
    layoutMetadata = await importModule(path2.join(layoutDir, "metadata.ts"), cacheBuster);
    for (const dir of [layoutDir, pageDir]) {
      const syncPath = path2.join(dir, "sync.ts");
      if (fs2.existsSync(syncPath)) {
        syncScriptsHtml += await compileSyncScript(syncPath);
      }
    }
  } catch (err) {
    return errorPage(500, pageName, `${err}`);
  }
  const metadata = {
    ...siteMetadata.metadata,
    ...layoutMetadata?.metadata,
    ...module.metadata
  };
  const layoutUrl = `${CONFIG.BASE_URL}layouts/${layoutName}`;
  const pageUrl = `${CONFIG.BASE_URL}app/${pageName}`;
  let stylesHtml = "";
  if (fs2.existsSync(path2.join(layoutDir, "styles.css"))) {
    stylesHtml += html`<link rel="stylesheet" href="${layoutUrl}/styles.css" />`;
  }
  if (fs2.existsSync(path2.join(pageDir, "styles.css"))) {
    stylesHtml += html`<link rel="stylesheet" href="${pageUrl}/styles.css" />`;
  }
  let scriptsHtml = "";
  const importMapPath = `./src/import-map.json`;
  if (fs2.existsSync(importMapPath)) {
    const importMap = JSON.parse(await fs2.promises.readFile(importMapPath, "utf-8"));
    const renderImportmap = CONFIG.BASE_URL === "/" ? JSON.stringify(importMap) : JSON.stringify(
      Object.fromEntries(
        Object.entries(importMap).map(([key, val]) => {
          let newVal = val;
          if (val.startsWith("./")) {
            newVal = val.replace(/^\.\//, CONFIG.BASE_URL);
          }
          return [key, newVal];
        })
      )
    );
    scriptsHtml += html`<script type="importmap">
      {
        "imports": ${renderImportmap}
      }
    </script>`;
  }
  if (fs2.existsSync(path2.join(layoutDir, "global.ts"))) {
    scriptsHtml += html`<script type="module" src="${layoutUrl}/global.js"></script>`;
  }
  scriptsHtml += html`<script type="module" src="${pageUrl}/index.js"></script>`;
  if (process.env.NODE_ENV === "development") {
    scriptsHtml += HMR_STRING;
  }
  let assembledHtml = await fs2.promises.readFile(layoutPath, "utf-8");
  assembledHtml = assembledHtml.replace("{{title}}", metadata.title);
  assembledHtml = assembledHtml.replace("<!-- {{sync-scripts}} -->", syncScriptsHtml);
  assembledHtml = assembledHtml.replace("<!-- {{styles}} -->", stylesHtml);
  assembledHtml = assembledHtml.replace("<!-- {{scripts}} -->", scriptsHtml);
  assembledHtml = assembledHtml.replace("<!-- {{metadata}} -->", assembleMetadata(metadata));
  assembledHtml = assembledHtml.replace("<!-- {{content}} -->", module.content());
  if (process.env.NODE_ENV !== "production") {
    assembledHtml = assembledHtml.replace(
      /<!-- {{production-only:start}} -->[\s\S]*?<!-- {{production-only:end}} -->/g,
      ""
    );
  }
  if (process.env.NODE_ENV !== "development") {
    const HTML_COMMENT_REGEX = /<!--\s*{{[^}]+}}\s*-->/g;
    assembledHtml = assembledHtml.replace(HTML_COMMENT_REGEX, "");
  }
  return {
    status: 200,
    html: await prettier.format(assembledHtml, { parser: "html" })
  };
};

// lib/server/transpile.ts
import esbuild2 from "esbuild";
import prettier2 from "prettier";
import fs4 from "node:fs";
import path4 from "node:path";

// lib/server/utils/fs.ts
import fsPromises from "node:fs/promises";
import fs3 from "node:fs";
import path3 from "node:path";

// lib/server/utils/functions.ts
var debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};
var logTag = (tag, msg) => {
  console.log(`${tag.padEnd(10)} ${msg}`);
};

// lib/server/utils/fs.ts
var remakeDir = async (dir) => {
  await fsPromises.rm(dir, { recursive: true, force: true });
  await fsPromises.mkdir(dir, { recursive: true });
};
var copyKeepingStructure = async (node, srcRoot, destRoot) => {
  if (!fs3.existsSync(node)) return;
  const fileRelativePath = path3.relative(srcRoot, node);
  const outputPath = path3.join(destRoot, fileRelativePath);
  logTag("Copy", fileRelativePath);
  fs3.mkdirSync(path3.dirname(outputPath), { recursive: true });
  await fs3.promises.cp(node, outputPath, { recursive: true });
};
var listAllFiles = (dir) => {
  const files = [];
  const entries = fs3.readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path3.join(dir, entry);
    if (fs3.statSync(fullPath).isDirectory()) {
      files.push(...listAllFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
};

// lib/server/transpile.ts
var copyNodeModulesDependencies = async () => {
  let nodeModulesPromises = [];
  const importMapPath = `${CONFIG.SRC_FOLDER}/import-map.json`;
  if (fs4.existsSync(importMapPath)) {
    const importMap = JSON.parse(await fs4.promises.readFile(importMapPath, "utf-8"));
    nodeModulesPromises = Object.values(importMap).filter((target) => target.startsWith("./node_modules/")).map((target) => {
      return copyKeepingStructure(
        target,
        CONFIG.NODE_MODULES_FOLDER,
        `${CONFIG.DIST_FOLDER}/node_modules`
      );
    });
  }
  await Promise.all(nodeModulesPromises);
};
var prepareDist = async () => {
  await copyNodeModulesDependencies();
  const allFiles = listAllFiles(CONFIG.SRC_FOLDER);
  const tsFiles = allFiles.filter((f) => path4.extname(f) === ".ts");
  const otherFiles = allFiles.filter((f) => path4.extname(f) !== ".ts");
  await Promise.all(
    otherFiles.map((f) => copyKeepingStructure(f, CONFIG.SRC_FOLDER, CONFIG.DIST_FOLDER))
  );
  await transpileTsFiles(tsFiles);
};
var transpileTsFiles = async (files) => {
  const tsFiles = files.filter((f) => {
    if (path4.extname(f) === ".ts") return true;
    console.warn("transpileTsFiles: skipping non-.ts file:", f);
    return false;
  });
  for (const f of tsFiles) {
    logTag("Transpile", path4.relative(CONFIG.SRC_FOLDER, f));
  }
  const esbuildPromise = esbuild2.build({
    logLevel: "warning",
    entryPoints: tsFiles,
    outdir: CONFIG.DIST_FOLDER,
    outbase: CONFIG.SRC_FOLDER,
    format: "esm",
    target: "esnext",
    platform: "browser",
    write: false,
    bundle: false,
    minify: false,
    plugins: [
      {
        name: "append-ready",
        setup(build) {
          build.onLoad({ filter: /src[/\\]app[/\\][^/\\]+[/\\]index\.ts$/ }, async ({ path: path7 }) => {
            const source = await fs4.promises.readFile(path7, "utf-8");
            if (source.includes("export const ready")) {
              const modifiedSource = `${source}

              document.addEventListener("DOMContentLoaded", ready);
            `;
              return {
                contents: modifiedSource,
                loader: "ts"
              };
            }
            return null;
          });
        }
      },
      {
        name: "rewrite-ts-imports",
        setup(build) {
          build.onEnd(async (result) => {
            if (!result.outputFiles) return;
            for (const file of result.outputFiles) {
              if (file.path.endsWith(".js")) {
                file.contents = new TextEncoder().encode(
                  file.text.replace(/(from\s+["'][.][^"']*?)\.ts(["'])/g, "$1.js$2")
                );
              }
            }
          });
        }
      },
      {
        name: "prettier-format",
        setup(build) {
          build.onEnd(async (result) => {
            if (!result.outputFiles) {
              return;
            }
            for (const file of result.outputFiles) {
              let text = file.text;
              if (file.path.endsWith(".js")) {
                const config = await prettier2.resolveConfig(file.path) || {};
                text = await prettier2.format(text, { parser: "babel", ...config });
              }
              await fs4.promises.mkdir(path4.dirname(file.path), { recursive: true });
              await fs4.promises.writeFile(file.path, text, "utf-8");
            }
          });
        }
      }
    ]
  });
  await esbuildPromise;
};

// lib/server/utils/lib.ts
import fs5 from "node:fs";
import path5 from "node:path";
var SERVED_MIME_TYPES = {
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
  ".webp": "image/webp"
};
var getPages = () => {
  return fs5.readdirSync(path5.join(CONFIG.SRC_FOLDER, "app")).filter((name) => fs5.statSync(path5.join(CONFIG.SRC_FOLDER, "app", name)).isDirectory());
};

// package.json
var version = "0.2.0";

// lib/server/index.ts
console.log(`unbundle v${version}`);
process.env.NODE_ENV ??= "development";
var IGNORED_EXTENSIONS = /* @__PURE__ */ new Set([".bck"]);
var sockets = /* @__PURE__ */ new Set();
var reloadPageMessage = (ws) => {
  ws.send("reload");
};
var reloadDevEnvironment = debounce(() => {
  sockets.forEach((ws) => {
    reloadPageMessage(ws);
  });
}, 750);
await remakeDir(CONFIG.DIST_FOLDER);
try {
  await prepareDist();
} catch (err) {
  console.error("Error preparing dist:", err);
}
var pendingChanges = /* @__PURE__ */ new Set();
var pendingNodeModulesCopy = false;
var flushChanges = debounce(async () => {
  const files = [...pendingChanges];
  pendingChanges.clear();
  try {
    if (pendingNodeModulesCopy) {
      pendingNodeModulesCopy = false;
      await copyNodeModulesDependencies();
    }
    const tsFiles = files.filter((f) => path6.extname(f) === ".ts");
    const otherFiles = files.filter((f) => path6.extname(f) !== ".ts");
    await Promise.all([
      tsFiles.length > 0 ? transpileTsFiles(tsFiles) : Promise.resolve(),
      ...otherFiles.map((f) => copyKeepingStructure(f, CONFIG.SRC_FOLDER, CONFIG.DIST_FOLDER))
    ]);
  } catch (err) {
    console.error("Error during transpilation:", err);
  }
  reloadDevEnvironment();
}, 50);
var watcher = fs6.watch(CONFIG.SRC_FOLDER, { recursive: true, persistent: true });
watcher.on("change", (_, filename) => {
  if (!filename || typeof filename !== "string") return;
  if (IGNORED_EXTENSIONS.has(path6.extname(filename))) return;
  const fullPath = path6.join(CONFIG.SRC_FOLDER, filename);
  if (!fs6.existsSync(fullPath) || !fs6.statSync(fullPath).isFile()) return;
  if (filename === "import-map.json") {
    pendingNodeModulesCopy = true;
  }
  pendingChanges.add(fullPath);
  flushChanges();
});
var serveStaticFile = async (filePath) => {
  let resolvedPath = filePath;
  try {
    const stat = fs6.statSync(filePath);
    if (stat.isDirectory()) {
      const dirIndexStat = fs6.statSync(path6.join(filePath, "index.html"));
      if (!dirIndexStat.isFile()) {
        return null;
      }
      resolvedPath = path6.join(filePath, "index.html");
    }
  } catch {
    return null;
  }
  const ext = path6.extname(resolvedPath).toLowerCase();
  const contentType = SERVED_MIME_TYPES[ext] ?? "application/octet-stream";
  const body = await fs6.promises.readFile(resolvedPath);
  return { body, contentType };
};
var server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:3000`);
  const pageName = url.pathname === "/" ? "home" : url.pathname.slice(1);
  const pages = new Set(getPages());
  if (pages.has(pageName)) {
    console.log(`Route :	 ${pageName} - ${Date.now()}`);
    const page = await assemblePage(pageName);
    res.writeHead(page.status, { "Content-Type": "text/html" });
    res.end(page.html);
    return;
  }
  const distFile = await serveStaticFile(`./dist${url.pathname}`);
  if (distFile) {
    res.writeHead(200, { "Content-Type": distFile.contentType });
    res.end(distFile.body);
    return;
  }
  const publicFile = await serveStaticFile(`./public${url.pathname}`);
  if (publicFile) {
    res.writeHead(200, { "Content-Type": publicFile.contentType });
    res.end(publicFile.body);
    return;
  }
  res.writeHead(404, { "Content-Type": "text/html" });
  res.end("404 :-/");
});
var wss = new WebSocketServer({ server });
wss.on("connection", (ws) => {
  sockets.add(ws);
  ws.on("close", () => {
    sockets.delete(ws);
  });
});
server.listen(3e3, () => {
  console.log(`Server running on http://localhost:3000`);
});
