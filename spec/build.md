# Build

`unbundle-build` writes a static site to `out/`.

## Steps

- **`build/env`** — `NODE_ENV` defaults to `production` when unset. A value set by the shell is kept and changes the output (see [config.md](config.md#node_env)).
- **`build/pages`** — The list of pages is read from `<SRC_FOLDER>/app/` once, when the command loads (see [pages.md](pages.md)). A missing `app/` folder throws there, and the command exits non-zero.
- **`build/out-reset`** — `out/` is deleted and recreated.
- **`build/dist`** — `dist/` is prepared (see below). If that fails, the build exits with code 1. `dist/` is not emptied first, so files from earlier runs, including dev runs, stay in it and end up in `out/`.
- **`build/copy`** — `public/` is copied into `out/`, then `dist/` on top of it. On a name clash, the file from `dist/` (from `src/`) wins.
- **`build/html`** — Pages are assembled one at a time, in directory listing order, and each is written to `out/<page>.html`, or `out/index.html` for `home`. A page file overwrites anything with the same name copied from `public/` or `dist/`. The page's status is ignored: an error page is written like any other. An uncaught error (see `pages/error-uncaught`) stops the loop, and the remaining pages are not written.
- **`build/exit`** — Errors thrown after the build starts (deleting `out/`, copying, assembling, writing) are logged and the build exits with code 0. Errors while loading the config or listing pages happen before that and exit non-zero.

## Preparing `dist/`

Shared by the build and the dev server.

- **`build/node-modules`** — `node_modules` entries of the import map are copied first (see [Import map](#import-map)).
- **`build/ships-all`** — Every file in `src/` ends up in `dist/`. That includes server-side files: `layout.html`, `metadata.js`, `sync.js`. Empty folders are not copied.
- **`build/copy-files`** — Files whose extension isn't exactly `.ts` are copied as is, keeping their path. `.tsx`, `.mts` and `.cts` files are copied, not transpiled. Copying happens before transpiling.
- **`build/transpile`** — `.ts` files are transpiled one to one with esbuild: ES modules, `esnext`, browser platform, no bundling, no minifying. esbuild reads the site's `tsconfig.json` as it normally does. A `.d.ts` file becomes an empty `.d.js`.
- **`build/transpile-batch`** — All `.ts` files go through one esbuild call. A syntax error in any of them fails the call, and none of the batch is written.
- **`build/ts-imports`** — In the transpiled output, the regex `/(from\s+["'][.][^"']*?)\.ts(["'])/g` rewrites `.ts` to `.js`. So:
  - A relative specifier in a `from "…"` clause is rewritten.
  - Side-effect imports (`import "./x.ts"`) and dynamic `import()` are not.
  - A specifier with a query (`./x.ts?v=1`) is not.
  - Matching text inside strings and comments is rewritten too.
- **`build/prettier`** — Transpiled `.js` files are formatted with Prettier (`babel` parser), using the config Prettier finds by searching upward from the output file in `dist/`. A `parser` set in that config wins. Copied files are not formatted.
- **`build/ready`** — Page modules get the `ready` listener appended (see [pages.md](pages.md)).

## Import map

- **`build/import-map-file`** — `src/import-map.json` is optional. It is a flat `{ "<specifier>": "<path>" }` object, not the standard `{ "imports": { … } }` shape. Invalid JSON throws: while preparing `dist/` that exits the build with code 1; while assembling a page it is an uncaught error (see `pages/error-uncaught`).
- **`build/import-map-output`** — When it exists, every page gets `<script type="importmap">{ "imports": <the object> }</script>` in `<!-- {{scripts}} -->` (see [layouts.md](layouts.md#scripts)). The tag always reads `src/import-map.json`; copying reads `<SRC_FOLDER>/import-map.json`.
- **`build/import-map-base-url`** — When `BASE_URL` isn't `/`, a leading `./` in each value is replaced with `BASE_URL`. Other values are used as is.
- **`build/import-map-node-modules`** — Every value starting with `./node_modules/` is copied to `<DIST_FOLDER>/node_modules/`, keeping its path. The source is the value itself, read relative to the site's root.
  - A file value copies only that file: anything it imports from elsewhere in its package is not copied.
  - A folder value is copied whole.
  - A value that doesn't exist is skipped silently, and the browser fails to load it later.
- **`build/import-map-other-values`** — Values that don't start with `./node_modules/` (other local paths, URLs) are not copied.
- **`build/import-map-ships`** — `import-map.json` itself is copied to `dist/` and `out/` like any other file in `src/`.
- **`build/import-map-watch`** — In the dev server, a change to `import-map.json` copies the `node_modules` entries again.

## TODO

- **`build/html`** — Don't write pages that don't return 200. Skip them, keep building the rest, then exit non-zero.
- **`build/exit`** — Exit non-zero on any error. Today `build().catch(console.error)` turns every error inside the build into exit code 0.
- **`build/copy`** — Don't fail when `public/` doesn't exist. Today `cp` throws, the build writes no pages, and (see `build/exit`) still exits 0.
- **`build/dist`** — Empty `dist/` before a build, so stale files from earlier runs don't ship.
- **`build/dist`** — Consider renaming `dist/` to a name that says unbundle generates it and authors don't edit it.
- **`build/ts-imports`** — Rewrite `.ts` in side-effect imports and dynamic `import()` too, and only in real import specifiers, not in strings or comments.
