# Errors

What happens when something fails, in the build and in the dev server.

## Page checks

- **`errors/page/checks`** — Producing a page runs these checks in order; the first that fails decides the status:
  1. The site metadata file is missing, fails to load, or doesn't export `metadata`: 500.
  2. The page's `index.ts` is missing or fails to load: 500.
  3. The module doesn't export `content`: 400.
  4. The layout has no layout file: 500.
  5. The layout's `metadata.ts` fails to load, or a `sync.ts` fails to compile: 500, with esbuild's message for a `sync.ts`.

  In the build, a `sync.ts` that doesn't compile never gets this far: it fails while filling the staging folder (see `errors/staging/build`).

- **`errors/page/error-page`** — A failed check gives `<title><page> - <status></title><p><message></p>` instead of the layout, unformatted, and logs the message. The message is raw HTML; for checks 1 to 4 it includes an absolute file path. The page includes live reload, in production too. The dev server sends it with the check's status; the build writes it as the page's HTML and carries on (see `build/html`).

## Unchecked page errors

- **`errors/page/unchecked`** — Other errors while producing a page aren't checked: `content` not being a function or throwing, a `description`, `theme-color` or `color-scheme` that isn't a string (see `metadata/tags/types`), Prettier failing on the HTML, and, in the dev server, an invalid import map. In the dev server, they stop it (see `errors/dev-server/crash`). In the build, the remaining pages aren't written, and the build exits 0 (see `errors/build/exit`).

## Staging folder

- **`errors/staging/transpile`** — All the `.ts` files of one fill or sync are transpiled together: a syntax error in one, a `sync.ts` included, stops all of them from being written. Other files are still copied.
- **`errors/staging/build`** — In the build, any error while filling the staging folder, such as a syntax error or an invalid import map, is logged as `Error preparing dist:` and exits with code 1, before any page is produced.
- **`errors/staging/dev-server`** — In the dev server, errors while filling the staging folder at start are logged as `Error preparing dist:`, and the dev server starts anyway.
- **`errors/staging/sync`** — When a sync fails, such as on a syntax error or an invalid import map, the error is logged as `Error during transpilation:`, and open pages reload anyway.

## Import map

- **`errors/import-map`** — An import map that isn't valid JSON fails the build while filling the staging folder, with exit code 1 (see `errors/staging/build`). In the dev server it's only logged, at start or when an edit to it is synced (see `errors/staging/dev-server`, `errors/staging/sync`). The next page request that passes the checks then stops the dev server, since each such page reads the import map again (see `errors/page/unchecked`).

## Static folder

- **`errors/static`** — Without a static folder, the build writes nothing to the output folder, neither the staging folder nor any page, and still exits 0.

## Config

- **`errors/config`** — A config that fails to load stops either command with a non-zero exit code.

## Build exit code

- **`errors/build/exit`** — A missing `app/` folder or a config that fails to load exits non-zero, and an error while filling the staging folder exits 1 (see `errors/staging/build`). Any other error, while emptying the output folder, copying into it, or producing or writing a page, is logged and the build exits 0. An error while producing a page also stops the remaining pages from being written.

## Dev server crash

- **`errors/dev-server/crash`** — An unchecked error while producing a page (see `errors/page/unchecked`), or a missing `app/` folder, stops the dev server. So does failing to empty the staging folder, or a missing source folder, at start. Open pages then reload once and show the browser's error page (see `dev-server/reload/reconnect`).
