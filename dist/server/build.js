#!/usr/bin/env node

// lib/server/build.ts
import fs6 from "node:fs";

// lib/server/assemble-page.ts
import path2 from "node:path";
import fs2 from "node:fs";
import { pathToFileURL } from "node:url";
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
var assemblePage = async (pageName) => {
  let layout = "main.layout.html";
  const modulePath = path2.resolve(`./src/app/${pageName}/index.ts`);
  let content = () => "things arent working...";
  const cacheBuster = process.env.NODE_ENV === "development" ? `?t=${Date.now()}` : "";
  let defaultMetadata = null;
  const defaultMetadataPath = path2.resolve(`./src/main.metadata.ts`);
  if (fs2.existsSync(defaultMetadataPath)) {
    const metadataModule = await import(pathToFileURL(defaultMetadataPath).href + cacheBuster);
    defaultMetadata = metadataModule.defaultMetadata ?? null;
  }
  if (!fs2.existsSync(modulePath)) {
    console.error(`Can't access module: ${modulePath}`);
    return {
      status: 500,
      html: `<title>${pageName} - 500</title><p>Can't access module: ${modulePath}</p>${HMR_STRING}`
    };
  }
  let metadata = null;
  try {
    const module = await import(pathToFileURL(modulePath).href + cacheBuster);
    if (module.metadata == null || module.content == null) {
      throw new Error("metadata or content unavailable");
    }
    content = module.content;
    metadata = { ...defaultMetadata, ...module.metadata };
    if (module.config?.layout != null) {
      layout = module.config.layout;
    }
  } catch (err) {
    console.error(`Missing module essentials - ${modulePath}`, err);
    return {
      status: 400,
      html: `<title>${pageName} - 400</title><p>Missing module essentials - ${modulePath}</p><p>${err}</p>${HMR_STRING}`
    };
  }
  metadata = metadata;
  const layoutPath = `./src/${layout}`;
  if (!fs2.existsSync(path2.resolve(layoutPath))) {
    console.error(`Can't access layout: ${layoutPath}`);
    return {
      status: 500,
      html: `<title>${pageName} - 500</title><p>Can't access layout: ${layoutPath}</p>${HMR_STRING}`
    };
  }
  const responseHtml = await fs2.promises.readFile(layoutPath, "utf-8");
  let assembledHtml = responseHtml.replace("{{title}}", metadata.title);
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
  scriptsHtml += html`<script
    type="module"
    src="${CONFIG.BASE_URL}app/${pageName}/index.js"></script>`;
  if (process.env.NODE_ENV === "development") {
    scriptsHtml += HMR_STRING;
  }
  assembledHtml = assembledHtml.replace("<!-- {{scripts}} -->", scriptsHtml);
  if (fs2.existsSync(path2.resolve(`./src/app/${pageName}/styles.css`))) {
    assembledHtml = assembledHtml.replace(
      "<!-- {{styles}} -->",
      `<link rel="stylesheet" href="${CONFIG.BASE_URL}app/${pageName}/styles.css" />`
    );
  }
  assembledHtml = assembledHtml.replace("<!-- {{metadata}} -->", assembleMetadata(metadata));
  assembledHtml = assembledHtml.replace("<!-- {{content}} -->", content());
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
import esbuild from "esbuild";
import prettier2 from "prettier";
import fs4 from "node:fs";
import path4 from "node:path";

// lib/server/utils/fs.ts
import fs3 from "node:fs";
import path3 from "node:path";

// lib/server/utils/functions.ts
var logTag = (tag, msg) => {
  console.log(`${tag.padEnd(10)} ${msg}`);
};

// lib/server/utils/fs.ts
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
  const esbuildPromise = esbuild.build({
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
        setup(build2) {
          build2.onLoad({ filter: /src[/\\]app[/\\][^/\\]+[/\\]index\.ts$/ }, async ({ path: path6 }) => {
            const source = await fs4.promises.readFile(path6, "utf-8");
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
        setup(build2) {
          build2.onEnd(async (result) => {
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
        setup(build2) {
          build2.onEnd(async (result) => {
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
var getPages = () => {
  return fs5.readdirSync(path5.join(CONFIG.SRC_FOLDER, "app")).filter((name) => fs5.statSync(path5.join(CONFIG.SRC_FOLDER, "app", name)).isDirectory());
};

// lib/server/build.ts
process.env.NODE_ENV ??= "production";
var pages = getPages();
var build = async () => {
  console.log("Starting build process...");
  await fs6.promises.rm(CONFIG.OUT_DIR, { recursive: true, force: true });
  await fs6.promises.mkdir(CONFIG.OUT_DIR, { recursive: true });
  try {
    await prepareDist();
  } catch (err) {
    console.error("Error preparing dist:", err);
    process.exit(1);
  }
  await fs6.promises.cp(CONFIG.PUBLIC_FOLDER, CONFIG.OUT_DIR, { recursive: true });
  await fs6.promises.cp(CONFIG.DIST_FOLDER, CONFIG.OUT_DIR, { recursive: true });
  for (const page of pages) {
    const { html: html2 } = await assemblePage(page);
    const fileName = page === "home" ? "index" : page;
    const outputFile = `${CONFIG.OUT_DIR}/${fileName}.html`;
    await fs6.promises.writeFile(outputFile, html2, "utf-8");
    console.log(`Generated: ${outputFile}`);
  }
  console.log("Build completed successfully!");
};
build().catch(console.error);
