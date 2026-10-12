# Build

`unbundle-build` writes a static site to `out/`.

## Steps

- **`build/env`** — `NODE_ENV` defaults to `production`.
- **`build/pages`** — The list of pages is read once, when the command starts (see [pages.md](pages.md)).
- **`build/out-reset`** — `out/` is deleted and recreated.
- **`build/dist`** — `dist/` is prepared (see below). If that fails, the build exits with code 1. `dist/` is not emptied first, so files from earlier runs stay in it.
- **`build/copy`** — `public/` is copied into `out/`, then `dist/` on top of it. On a name clash, the file from `dist/` (from `src/`) wins.
- **`build/html`** — Each page is assembled and written to `out/<page>.html`, or `out/index.html` for `home`. The page's status is ignored: an error page is written like any other.
- **`build/exit`** — Any other error is logged and the build exits with code 0.

## Preparing `dist/`

Shared by the build and the dev server.

- **`build/node-modules`** — `node_modules` entries of the import map are copied first (see [Import map](#import-map)).
- **`build/ships-all`** — Every file in `src/` ends up in `dist/`. That includes server-side files: `layout.html`, `metadata.js`, `sync.js`.
- **`build/copy-files`** — Files that aren't `.ts` are copied as is, keeping their path.
- **`build/transpile`** — `.ts` files are transpiled one to one with esbuild: ES modules, `esnext`, browser platform, no bundling, no minifying.
- **`build/ts-imports`** — In the output, a relative specifier ending in `.ts` inside a `from "…"` clause is rewritten to `.js`. Side-effect imports (`import "./x.ts"`) and dynamic `import()` are not rewritten.
- **`build/prettier`** — Transpiled `.js` files are formatted with Prettier, using the site's Prettier config.
- **`build/ready`** — Page modules get the `ready` listener appended (see [pages.md](pages.md)).

## Import map

- **`build/import-map-file`** — `src/import-map.json` is optional. It is a flat `{ "<specifier>": "<path>" }` object, not the standard `{ "imports": { … } }` shape.
- **`build/import-map-output`** — When it exists, every page gets `<script type="importmap">{ "imports": <the object> }</script>` in `<!-- {{scripts}} -->` (see [layouts.md](layouts.md#scripts)).
- **`build/import-map-base-url`** — When `BASE_URL` isn't `/`, a leading `./` in each value is replaced with `BASE_URL`. Other values are used as is.
- **`build/import-map-node-modules`** — Every value starting with `./node_modules/` is copied from `node_modules/` to `dist/node_modules/`, keeping its path. If the value is a file, only that file is copied: anything it imports from elsewhere in its package is not.
- **`build/import-map-other-values`** — Values that don't start with `./node_modules/` (other local paths, URLs) are not copied.
- **`build/import-map-ships`** — `import-map.json` itself is copied to `dist/` and `out/` like any other file in `src/`.
- **`build/import-map-watch`** — In the dev server, a change to `import-map.json` copies the `node_modules` entries again.

## TODO

- **`build/html`** — Don't write pages that don't return 200. Skip them, keep building the rest, then exit non-zero.
- **`build/exit`** — Exit non-zero on any error. Today `build().catch(console.error)` turns every error into exit code 0.
- **`build/copy`** — Don't fail when `public/` doesn't exist. Today `cp` throws, the build writes no pages, and (see `build/exit`) still exits 0.
