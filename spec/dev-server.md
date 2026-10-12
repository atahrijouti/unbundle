# Dev server

`unbundle-serve` serves the site on `http://localhost:3000` and reloads the browser on changes.

## Start

- **`dev/version`** — Prints `unbundle v<version>`.
- **`dev/env`** — `NODE_ENV` defaults to `development`.
- **`dev/dist`** — Deletes and recreates `dist/`, then prepares it (see [build.md](build.md)). Errors are logged and the server starts anyway.
- **`dev/port`** — Listens on port 3000. The port can't be changed.

## Requests

Each request is matched in order:

- **`dev/page`** — `/` is the `home` page. Otherwise the path without its leading `/` is checked against the list of pages, read again on every request. A match is assembled on the spot and returned with the page's status. `/home` also serves the home page. `/<page>.html` does not match.
- **`dev/page-reimport`** — Each request re-imports the page module, the layout's `metadata.ts` and `src/metadata.ts` with a `?t=<timestamp>` query, so edits to those files show up. Modules they import are cached by Node until the server restarts.
- **`dev/dist-file`** — Otherwise, the file at `dist/<path>`. A folder is served by its `index.html` if it has one.
- **`dev/public-file`** — Otherwise, the file at `public/<path>`, same rules.
- **`dev/not-found`** — Otherwise, status 404 with the text `404 :-/`.
- **`dev/mime`** — Files get a content type from their extension: `.html`, `.js`, `.css`, `.json`, `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.ico`, `.woff`, `.woff2`, `.webp`. Anything else is `application/octet-stream`.

## Watching

- **`dev/watch`** — `src/` is watched recursively. `public/` is not watched.
- **`dev/watch-ignore`** — Files ending in `.bck` are ignored, since some editors (Helix) write them while saving.
- **`dev/watch-sync`** — Changed and new files are batched for 50 ms, then `.ts` files are transpiled and others copied into `dist/`.
- **`dev/watch-deletes`** — Deleted files are skipped: they stay in `dist/` until the server restarts.
- **`dev/watch-import-map`** — A change to `import-map.json` also copies its `node_modules` entries again.

## Live reload

- **`dev/reload-socket`** — A WebSocket server shares port 3000.
- **`dev/reload-script`** — In development, every page gets a script that connects to `ws://localhost:3000`, reloads on a `reload` message, and reloads one second after the connection closes (for example when the server restarts).
- **`dev/reload-trigger`** — After a batch of changes is synced to `dist/`, every connected page gets `reload`, debounced to 750 ms.

## TODO

- **`dev/not-found`** — Render the `404` page with status 404 when one exists, instead of `404 :-/`. A request for `/404` should also return 404, matching GitHub Pages in production.
- **`dev/watch-deletes`** — Mirror deletions: remove the file from `dist/` when it is deleted from `src/`.
