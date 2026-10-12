# Dev server

`unbundle-serve` serves the site on port 3000 and reloads the browser on changes.

## Start

- **`dev-server/version`** — Prints `unbundle v<version>`, the version baked in when unbundle was built.
- **`dev-server/env`** — `NODE_ENV` defaults to `development` when unset. A value set by the shell is kept (see [config.md](config.md#node_env)).
- **`dev-server/dist`** — Deletes and recreates `<DIST_FOLDER>`, then prepares it (see [build.md](build.md)). Errors while preparing are logged and the server starts anyway. Errors while deleting or recreating, or a missing `<SRC_FOLDER>` when the watcher starts, stop the server.
- **`dev-server/port`** — Listens on port 3000, on all network interfaces. The port can't be changed.

## Requests

Any HTTP method is accepted. The query string is ignored. The path is used as received, without percent-decoding. Each request is matched in order:

- **`dev-server/page`** — `/` is the `home` page. Otherwise the path without its leading `/` is checked against the list of pages, read again on every request. A match is assembled on the spot and returned with the page's status, as `text/html`. So:
  - `/home` also serves the home page.
  - `/<page>.html` and `/<page>/` don't match a page.
  - Page names with spaces or non-ASCII characters can't be reached.
- **`dev-server/page-reimport`** — When `NODE_ENV` is `development`, each request re-imports the page module, the layout's `metadata.ts` and `src/metadata.ts` with a `?t=<timestamp>` query, so edits to those files show up. Modules they import are cached by Node until the server restarts. With any other `NODE_ENV`, nothing is re-imported. `layout.html`, `sync.ts` files and `src/import-map.json` are read again on every request either way.
- **`dev-server/dist-file`** — Otherwise, the file at `./dist/<path>` (always `./dist`, see [config.md](config.md)). A folder is served by its `index.html` if it has one.
- **`dev-server/public-file`** — Otherwise, the file at `./public/<path>`, same rules.
- **`dev-server/not-found`** — Otherwise, status 404 with the text `404 :-/`.
- **`dev-server/mime`** — Files get a content type from their lowercased extension, with no charset:

  | Extension | Content type |
  |---|---|
  | `.html` | `text/html` |
  | `.js` | `text/javascript` |
  | `.css` | `text/css` |
  | `.json` | `application/json` |
  | `.png` | `image/png` |
  | `.jpg`, `.jpeg` | `image/jpeg` |
  | `.gif` | `image/gif` |
  | `.svg` | `image/svg+xml` |
  | `.ico` | `image/x-icon` |
  | `.woff` | `font/woff` |
  | `.woff2` | `font/woff2` |
  | `.webp` | `image/webp` |

  Anything else, `.webmanifest` and `.map` included, is `application/octet-stream`.
- **`dev-server/base-url`** — Routing ignores `BASE_URL`. With a `BASE_URL` other than `/`, pages still link their scripts and stylesheets under it, so those requests return 404.
- **`dev-server/crash`** — The request handler doesn't catch errors. An uncaught error while assembling a page (see `pages/error-uncaught`), or a missing `app/` folder, rejects it, and Node's default handling of unhandled rejections stops the server. Open pages then reload every second (see `dev-server/reload-script`).

## Watching

- **`dev-server/watch`** — `<SRC_FOLDER>` is watched recursively. `public/` and `unbundle.config.js` are not watched.
- **`dev-server/watch-ignore`** — Files ending in `.bck` are ignored, since some editors (Helix) write them while saving. Events on folders are ignored.
- **`dev-server/watch-sync`** — Changed and new files are collected until no change has come in for 50 ms, then `.ts` files are transpiled and others copied into `dist/`. One syntax error fails the transpile of the whole batch (see `build/transpile-batch`). Sync errors are logged as `Error during transpilation:`.
- **`dev-server/watch-deletes`** — Deleted files are skipped: they stay in `dist/` until the server restarts.
- **`dev-server/watch-import-map`** — A change to `import-map.json` also copies its `node_modules` entries again.

## Live reload

- **`dev-server/reload-socket`** — A WebSocket server shares port 3000 and accepts connections on any path.
- **`dev-server/reload-script`** — Pages get a classic inline script (see `layouts/scripts`) that:
  - declares a global `let ws` and connects to `ws://localhost:3000`, whatever host served the page;
  - reloads on a `reload` message;
  - logs socket errors;
  - reloads one second after the connection closes. While the server is down, every reload fails to connect and reloads again, once a second, until it is back.
- **`dev-server/reload-trigger`** — After each batch is synced to `dist/`, every connected page gets `reload`, debounced to 750 ms. This happens even when the sync failed. Any watched file triggers it, `layout.html`, `metadata.ts` and `import-map.json` included.

## TODO

- **`dev-server/not-found`** — Render the `404` page with status 404 when one exists, instead of `404 :-/`. A request for `/404` should also return 404, matching GitHub Pages in production.
- **`dev-server/watch-deletes`** — Mirror deletions: remove the file from `dist/` when it is deleted from `src/`.
- **`dev-server/crash`** — Catch errors in the request handler and return a 500 page instead of stopping the server.
- **`dev-server/page-reimport`** — Pick up edits to modules that page modules and metadata import, not only the top-level files.
- **`dev-server/page`** — Percent-decode paths, and accept `/<page>/`.
- **`dev-server/base-url`** — Serve under `BASE_URL`, so pages work in dev with a `BASE_URL` other than `/`.
- **`dev-server/reload-script`** — Connect back to the host that served the page instead of `localhost`, so pages opened from another device on the network work. Avoid the global `ws`.
- **`dev-server/reload-trigger`** — Don't reload after a failed sync.
