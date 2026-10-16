# Dev server

The dev server (`unbundle-serve`) serves the site on port 3000 while the author works, producing pages on each request and reloading the browser when the source changes.

## Behavior

### Starting

- **`dev-server/version`** — It prints `unbundle v<version>`.
- **`dev-server/development`** — It produces development, unless `NODE_ENV` is set to something else (see [config.md](config.md#development-and-production)).
- **`dev-server/staging`** — It empties the staging folder and fills it from the source folder (see [build.md](build.md#the-staging-folder)). Errors while filling it are logged, and the server starts anyway.
- **`dev-server/port`** — It listens on port 3000, on every network interface.

### Answering a request

- **`dev-server/page`** — `/` is the `home` page and `/<name>` is the page `<name>`. Pages are found again on each request, so new ones show up without a restart. `/home` also works. `/<name>.html`, `/<name>/` and names that need percent-encoding don't.
- **`dev-server/page-fresh`** — In development, each request reloads the page's module and the metadata files, so edits to them show up. Modules they import are not reloaded until the server restarts.
- **`dev-server/files`** — Otherwise, the file at that path in the staging folder, then in the static folder. A folder is served by its `index.html`.
- **`dev-server/not-found`** — Otherwise, 404 with the text `404 :-/`.
- **`dev-server/mime`** — Files are served with a content type for `.html`, `.js`, `.css`, `.json`, `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.ico`, `.woff`, `.woff2` and `.webp`. Everything else, `.webmanifest` included, is `application/octet-stream`.
- **`dev-server/base-url`** — The base URL is ignored. With a base URL other than `/`, pages ask for their scripts and styles under it, and get 404.

### Watching

- **`dev-server/watch`** — Changes in the source folder are synced to the staging folder: `.ts` files transpiled, others copied. Changes in the static folder and the config are not watched.
- **`dev-server/watch-ignore`** — Files ending in `.bck` are ignored, since some editors (Helix) write them while saving.
- **`dev-server/watch-deletes`** — Deleted files stay in the staging folder until the server restarts.
- **`dev-server/watch-import-map`** — A change to the import map also copies its `node_modules` paths again.

### Live reload

- **`dev-server/reload`** — After each sync, every open page reloads, even if the sync failed.
- **`dev-server/reload-reconnect`** — A page that loses its connection reloads a second later. While the server is down, that repeats every second until it's back.
- **`dev-server/reload-host`** — The page connects to `localhost:3000`, whichever host served it. The script declares a global `ws`.

## Errors

- **`dev-server/staging-errors`** — A syntax error in one `.ts` file stops the whole sync it's part of (see `build/transpile-batch`). The error is logged as `Error during transpilation:`.
- **`dev-server/crash`** — An error the page checks don't catch (see `pages/error-uncaught`), or a missing `app/` folder, stops the server. Open pages then reload every second until it's restarted.

## TODO

- **`dev-server/not-found`** — Serve the `404` page with status 404 when one exists, instead of `404 :-/`. `/404` should also return 404, like GitHub Pages.
- **`dev-server/watch-deletes`** — Remove a file from the staging folder when it's deleted from the source folder.
- **`dev-server/crash`** — Catch errors while answering a request and return a 500 page instead of stopping.
- **`dev-server/page-fresh`** — Also reload the modules that a page's module and the metadata files import.
- **`dev-server/page`** — Decode percent-encoded paths, and accept `/<name>/`.
- **`dev-server/base-url`** — Serve the site under its base URL.
- **`dev-server/reload-host`** — Connect to the host that served the page, so pages opened from another device on the network work. Don't declare a global.
- **`dev-server/reload`** — Don't reload after a failed sync.
